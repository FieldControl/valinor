/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵRuntimeError as RuntimeError } from '@angular/core';
import { from, of } from 'rxjs';
import { catchError, concatMap, defaultIfEmpty, first, last, map, mergeMap, scan, switchMap, tap, } from 'rxjs/operators';
import { AbsoluteRedirect, ApplyRedirects, canLoadFails, noMatch, NoMatch } from './apply_redirects';
import { createUrlTreeFromSnapshot } from './create_url_tree';
import { runCanLoadGuards } from './operators/check_guards';
import { ActivatedRouteSnapshot, getInherited, RouterStateSnapshot, } from './router_state';
import { PRIMARY_OUTLET } from './shared';
import { getOutlet, sortByMatchingOutlets } from './utils/config';
import { isImmediateMatch, match, matchWithChecks, noLeftoversInUrl, split, } from './utils/config_matching';
import { TreeNode } from './utils/tree';
import { isEmptyError } from './utils/type_guards';
/**
 * Class used to indicate there were no additional route config matches but that all segments of
 * the URL were consumed during matching so the route was URL matched. When this happens, we still
 * try to match child configs in case there are empty path children.
 */
class NoLeftoversInUrl {
}
export function recognize(injector, configLoader, rootComponentType, config, urlTree, urlSerializer, paramsInheritanceStrategy = 'emptyOnly') {
    return new Recognizer(injector, configLoader, rootComponentType, config, urlTree, paramsInheritanceStrategy, urlSerializer).recognize();
}
const MAX_ALLOWED_REDIRECTS = 31;
export class Recognizer {
    constructor(injector, configLoader, rootComponentType, config, urlTree, paramsInheritanceStrategy, urlSerializer) {
        this.injector = injector;
        this.configLoader = configLoader;
        this.rootComponentType = rootComponentType;
        this.config = config;
        this.urlTree = urlTree;
        this.paramsInheritanceStrategy = paramsInheritanceStrategy;
        this.urlSerializer = urlSerializer;
        this.applyRedirects = new ApplyRedirects(this.urlSerializer, this.urlTree);
        this.absoluteRedirectCount = 0;
        this.allowRedirects = true;
    }
    noMatchError(e) {
        return new RuntimeError(4002 /* RuntimeErrorCode.NO_MATCH */, typeof ngDevMode === 'undefined' || ngDevMode
            ? `Cannot match any routes. URL Segment: '${e.segmentGroup}'`
            : `'${e.segmentGroup}'`);
    }
    recognize() {
        const rootSegmentGroup = split(this.urlTree.root, [], [], this.config).segmentGroup;
        return this.match(rootSegmentGroup).pipe(map((children) => {
            // Use Object.freeze to prevent readers of the Router state from modifying it outside
            // of a navigation, resulting in the router being out of sync with the browser.
            const root = new ActivatedRouteSnapshot([], Object.freeze({}), Object.freeze({ ...this.urlTree.queryParams }), this.urlTree.fragment, {}, PRIMARY_OUTLET, this.rootComponentType, null, {});
            const rootNode = new TreeNode(root, children);
            const routeState = new RouterStateSnapshot('', rootNode);
            const tree = createUrlTreeFromSnapshot(root, [], this.urlTree.queryParams, this.urlTree.fragment);
            // https://github.com/angular/angular/issues/47307
            // Creating the tree stringifies the query params
            // We don't want to do this here so reassign them to the original.
            tree.queryParams = this.urlTree.queryParams;
            routeState.url = this.urlSerializer.serialize(tree);
            this.inheritParamsAndData(routeState._root, null);
            return { state: routeState, tree };
        }));
    }
    match(rootSegmentGroup) {
        const expanded$ = this.processSegmentGroup(this.injector, this.config, rootSegmentGroup, PRIMARY_OUTLET);
        return expanded$.pipe(catchError((e) => {
            if (e instanceof AbsoluteRedirect) {
                this.urlTree = e.urlTree;
                return this.match(e.urlTree.root);
            }
            if (e instanceof NoMatch) {
                throw this.noMatchError(e);
            }
            throw e;
        }));
    }
    inheritParamsAndData(routeNode, parent) {
        const route = routeNode.value;
        const i = getInherited(route, parent, this.paramsInheritanceStrategy);
        route.params = Object.freeze(i.params);
        route.data = Object.freeze(i.data);
        routeNode.children.forEach((n) => this.inheritParamsAndData(n, route));
    }
    processSegmentGroup(injector, config, segmentGroup, outlet) {
        if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
            return this.processChildren(injector, config, segmentGroup);
        }
        return this.processSegment(injector, config, segmentGroup, segmentGroup.segments, outlet, true).pipe(map((child) => (child instanceof TreeNode ? [child] : [])));
    }
    /**
     * Matches every child outlet in the `segmentGroup` to a `Route` in the config. Returns `null` if
     * we cannot find a match for _any_ of the children.
     *
     * @param config - The `Routes` to match against
     * @param segmentGroup - The `UrlSegmentGroup` whose children need to be matched against the
     *     config.
     */
    processChildren(injector, config, segmentGroup) {
        // Expand outlets one at a time, starting with the primary outlet. We need to do it this way
        // because an absolute redirect from the primary outlet takes precedence.
        const childOutlets = [];
        for (const child of Object.keys(segmentGroup.children)) {
            if (child === 'primary') {
                childOutlets.unshift(child);
            }
            else {
                childOutlets.push(child);
            }
        }
        return from(childOutlets).pipe(concatMap((childOutlet) => {
            const child = segmentGroup.children[childOutlet];
            // Sort the config so that routes with outlets that match the one being activated
            // appear first, followed by routes for other outlets, which might match if they have
            // an empty path.
            const sortedConfig = sortByMatchingOutlets(config, childOutlet);
            return this.processSegmentGroup(injector, sortedConfig, child, childOutlet);
        }), scan((children, outletChildren) => {
            children.push(...outletChildren);
            return children;
        }), defaultIfEmpty(null), last(), mergeMap((children) => {
            if (children === null)
                return noMatch(segmentGroup);
            // Because we may have matched two outlets to the same empty path segment, we can have
            // multiple activated results for the same outlet. We should merge the children of
            // these results so the final return value is only one `TreeNode` per outlet.
            const mergedChildren = mergeEmptyPathMatches(children);
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                // This should really never happen - we are only taking the first match for each
                // outlet and merge the empty path matches.
                checkOutletNameUniqueness(mergedChildren);
            }
            sortActivatedRouteSnapshots(mergedChildren);
            return of(mergedChildren);
        }));
    }
    processSegment(injector, routes, segmentGroup, segments, outlet, allowRedirects) {
        return from(routes).pipe(concatMap((r) => {
            return this.processSegmentAgainstRoute(r._injector ?? injector, routes, r, segmentGroup, segments, outlet, allowRedirects).pipe(catchError((e) => {
                if (e instanceof NoMatch) {
                    return of(null);
                }
                throw e;
            }));
        }), first((x) => !!x), catchError((e) => {
            if (isEmptyError(e)) {
                if (noLeftoversInUrl(segmentGroup, segments, outlet)) {
                    return of(new NoLeftoversInUrl());
                }
                return noMatch(segmentGroup);
            }
            throw e;
        }));
    }
    processSegmentAgainstRoute(injector, routes, route, rawSegment, segments, outlet, allowRedirects) {
        if (!isImmediateMatch(route, rawSegment, segments, outlet))
            return noMatch(rawSegment);
        if (route.redirectTo === undefined) {
            return this.matchSegmentAgainstRoute(injector, rawSegment, route, segments, outlet);
        }
        if (this.allowRedirects && allowRedirects) {
            return this.expandSegmentAgainstRouteUsingRedirect(injector, rawSegment, routes, route, segments, outlet);
        }
        return noMatch(rawSegment);
    }
    expandSegmentAgainstRouteUsingRedirect(injector, segmentGroup, routes, route, segments, outlet) {
        const { matched, consumedSegments, positionalParamSegments, remainingSegments } = match(segmentGroup, route, segments);
        if (!matched)
            return noMatch(segmentGroup);
        // TODO(atscott): Move all of this under an if(ngDevMode) as a breaking change and allow stack
        // size exceeded in production
        if (route.redirectTo.startsWith('/')) {
            this.absoluteRedirectCount++;
            if (this.absoluteRedirectCount > MAX_ALLOWED_REDIRECTS) {
                if (ngDevMode) {
                    throw new RuntimeError(4016 /* RuntimeErrorCode.INFINITE_REDIRECT */, `Detected possible infinite redirect when redirecting from '${this.urlTree}' to '${route.redirectTo}'.\n` +
                        `This is currently a dev mode only error but will become a` +
                        ` call stack size exceeded error in production in a future major version.`);
                }
                this.allowRedirects = false;
            }
        }
        const newTree = this.applyRedirects.applyRedirectCommands(consumedSegments, route.redirectTo, positionalParamSegments);
        return this.applyRedirects.lineralizeSegments(route, newTree).pipe(mergeMap((newSegments) => {
            return this.processSegment(injector, routes, segmentGroup, newSegments.concat(remainingSegments), outlet, false);
        }));
    }
    matchSegmentAgainstRoute(injector, rawSegment, route, segments, outlet) {
        const matchResult = matchWithChecks(rawSegment, route, segments, injector, this.urlSerializer);
        if (route.path === '**') {
            // Prior versions of the route matching algorithm would stop matching at the wildcard route.
            // We should investigate a better strategy for any existing children. Otherwise, these
            // child segments are silently dropped from the navigation.
            // https://github.com/angular/angular/issues/40089
            rawSegment.children = {};
        }
        return matchResult.pipe(switchMap((result) => {
            if (!result.matched) {
                return noMatch(rawSegment);
            }
            // If the route has an injector created from providers, we should start using that.
            injector = route._injector ?? injector;
            return this.getChildConfig(injector, route, segments).pipe(switchMap(({ routes: childConfig }) => {
                const childInjector = route._loadedInjector ?? injector;
                const { consumedSegments, remainingSegments, parameters } = result;
                const snapshot = new ActivatedRouteSnapshot(consumedSegments, parameters, Object.freeze({ ...this.urlTree.queryParams }), this.urlTree.fragment, getData(route), getOutlet(route), route.component ?? route._loadedComponent ?? null, route, getResolve(route));
                const { segmentGroup, slicedSegments } = split(rawSegment, consumedSegments, remainingSegments, childConfig);
                if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
                    return this.processChildren(childInjector, childConfig, segmentGroup).pipe(map((children) => {
                        if (children === null) {
                            return null;
                        }
                        return new TreeNode(snapshot, children);
                    }));
                }
                if (childConfig.length === 0 && slicedSegments.length === 0) {
                    return of(new TreeNode(snapshot, []));
                }
                const matchedOnOutlet = getOutlet(route) === outlet;
                // If we matched a config due to empty path match on a different outlet, we need to
                // continue passing the current outlet for the segment rather than switch to PRIMARY.
                // Note that we switch to primary when we have a match because outlet configs look like
                // this: {path: 'a', outlet: 'a', children: [
                //  {path: 'b', component: B},
                //  {path: 'c', component: C},
                // ]}
                // Notice that the children of the named outlet are configured with the primary outlet
                return this.processSegment(childInjector, childConfig, segmentGroup, slicedSegments, matchedOnOutlet ? PRIMARY_OUTLET : outlet, true).pipe(map((child) => {
                    return new TreeNode(snapshot, child instanceof TreeNode ? [child] : []);
                }));
            }));
        }));
    }
    getChildConfig(injector, route, segments) {
        if (route.children) {
            // The children belong to the same module
            return of({ routes: route.children, injector });
        }
        if (route.loadChildren) {
            // lazy children belong to the loaded module
            if (route._loadedRoutes !== undefined) {
                return of({ routes: route._loadedRoutes, injector: route._loadedInjector });
            }
            return runCanLoadGuards(injector, route, segments, this.urlSerializer).pipe(mergeMap((shouldLoadResult) => {
                if (shouldLoadResult) {
                    return this.configLoader.loadChildren(injector, route).pipe(tap((cfg) => {
                        route._loadedRoutes = cfg.routes;
                        route._loadedInjector = cfg.injector;
                    }));
                }
                return canLoadFails(route);
            }));
        }
        return of({ routes: [], injector });
    }
}
function sortActivatedRouteSnapshots(nodes) {
    nodes.sort((a, b) => {
        if (a.value.outlet === PRIMARY_OUTLET)
            return -1;
        if (b.value.outlet === PRIMARY_OUTLET)
            return 1;
        return a.value.outlet.localeCompare(b.value.outlet);
    });
}
function hasEmptyPathConfig(node) {
    const config = node.value.routeConfig;
    return config && config.path === '';
}
/**
 * Finds `TreeNode`s with matching empty path route configs and merges them into `TreeNode` with
 * the children from each duplicate. This is necessary because different outlets can match a
 * single empty path route config and the results need to then be merged.
 */
function mergeEmptyPathMatches(nodes) {
    const result = [];
    // The set of nodes which contain children that were merged from two duplicate empty path nodes.
    const mergedNodes = new Set();
    for (const node of nodes) {
        if (!hasEmptyPathConfig(node)) {
            result.push(node);
            continue;
        }
        const duplicateEmptyPathNode = result.find((resultNode) => node.value.routeConfig === resultNode.value.routeConfig);
        if (duplicateEmptyPathNode !== undefined) {
            duplicateEmptyPathNode.children.push(...node.children);
            mergedNodes.add(duplicateEmptyPathNode);
        }
        else {
            result.push(node);
        }
    }
    // For each node which has children from multiple sources, we need to recompute a new `TreeNode`
    // by also merging those children. This is necessary when there are multiple empty path configs
    // in a row. Put another way: whenever we combine children of two nodes, we need to also check
    // if any of those children can be combined into a single node as well.
    for (const mergedNode of mergedNodes) {
        const mergedChildren = mergeEmptyPathMatches(mergedNode.children);
        result.push(new TreeNode(mergedNode.value, mergedChildren));
    }
    return result.filter((n) => !mergedNodes.has(n));
}
function checkOutletNameUniqueness(nodes) {
    const names = {};
    nodes.forEach((n) => {
        const routeWithSameOutletName = names[n.value.outlet];
        if (routeWithSameOutletName) {
            const p = routeWithSameOutletName.url.map((s) => s.toString()).join('/');
            const c = n.value.url.map((s) => s.toString()).join('/');
            throw new RuntimeError(4006 /* RuntimeErrorCode.TWO_SEGMENTS_WITH_SAME_OUTLET */, (typeof ngDevMode === 'undefined' || ngDevMode) &&
                `Two segments cannot have the same outlet name: '${p}' and '${c}'.`);
        }
        names[n.value.outlet] = n.value;
    });
}
function getData(route) {
    return route.data || {};
}
function getResolve(route) {
    return route.resolve || {};
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb2duaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yZWNvZ25pemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUE0QixhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZGLE9BQU8sRUFBQyxJQUFJLEVBQWMsRUFBRSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzFDLE9BQU8sRUFDTCxVQUFVLEVBQ1YsU0FBUyxFQUNULGNBQWMsRUFDZCxLQUFLLEVBQ0wsSUFBSSxFQUNKLEdBQUcsRUFDSCxRQUFRLEVBQ1IsSUFBSSxFQUNKLFNBQVMsRUFDVCxHQUFHLEdBQ0osTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDbkcsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFHNUQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFFMUQsT0FBTyxFQUNMLHNCQUFzQixFQUN0QixZQUFZLEVBRVosbUJBQW1CLEdBQ3BCLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUV4QyxPQUFPLEVBQUMsU0FBUyxFQUFFLHFCQUFxQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEUsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixLQUFLLEVBQ0wsZUFBZSxFQUNmLGdCQUFnQixFQUNoQixLQUFLLEdBQ04sTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FB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RCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDbEIsTUFBTSx1QkFBdUIsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RCxJQUFJLHVCQUF1QixFQUFFLENBQUM7WUFDNUIsTUFBTSxDQUFDLEdBQUcsdUJBQXVCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sSUFBSSxZQUFZLDREQUVwQixDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUM7Z0JBQzdDLG1EQUFtRCxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQ3RFLENBQUM7UUFDSixDQUFDO1FBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNsQyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FBQyxLQUFZO0lBQzNCLE9BQU8sS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7QUFDMUIsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLEtBQVk7SUFDOUIsT0FBTyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztBQUM3QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RW52aXJvbm1lbnRJbmplY3RvciwgVHlwZSwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZnJvbSwgT2JzZXJ2YWJsZSwgb2Z9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgY2F0Y2hFcnJvcixcbiAgY29uY2F0TWFwLFxuICBkZWZhdWx0SWZFbXB0eSxcbiAgZmlyc3QsXG4gIGxhc3QsXG4gIG1hcCxcbiAgbWVyZ2VNYXAsXG4gIHNjYW4sXG4gIHN3aXRjaE1hcCxcbiAgdGFwLFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7QWJzb2x1dGVSZWRpcmVjdCwgQXBwbHlSZWRpcmVjdHMsIGNhbkxvYWRGYWlscywgbm9NYXRjaCwgTm9NYXRjaH0gZnJvbSAnLi9hcHBseV9yZWRpcmVjdHMnO1xuaW1wb3J0IHtjcmVhdGVVcmxUcmVlRnJvbVNuYXBzaG90fSBmcm9tICcuL2NyZWF0ZV91cmxfdHJlZSc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7RGF0YSwgTG9hZGVkUm91dGVyQ29uZmlnLCBSZXNvbHZlRGF0YSwgUm91dGUsIFJvdXRlc30gZnJvbSAnLi9tb2RlbHMnO1xuaW1wb3J0IHtydW5DYW5Mb2FkR3VhcmRzfSBmcm9tICcuL29wZXJhdG9ycy9jaGVja19ndWFyZHMnO1xuaW1wb3J0IHtSb3V0ZXJDb25maWdMb2FkZXJ9IGZyb20gJy4vcm91dGVyX2NvbmZpZ19sb2FkZXInO1xuaW1wb3J0IHtcbiAgQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgZ2V0SW5oZXJpdGVkLFxuICBQYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5LFxuICBSb3V0ZXJTdGF0ZVNuYXBzaG90LFxufSBmcm9tICcuL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge1BSSU1BUllfT1VUTEVUfSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQge1VybFNlZ21lbnQsIFVybFNlZ21lbnRHcm91cCwgVXJsU2VyaWFsaXplciwgVXJsVHJlZX0gZnJvbSAnLi91cmxfdHJlZSc7XG5pbXBvcnQge2dldE91dGxldCwgc29ydEJ5TWF0Y2hpbmdPdXRsZXRzfSBmcm9tICcuL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge1xuICBpc0ltbWVkaWF0ZU1hdGNoLFxuICBtYXRjaCxcbiAgbWF0Y2hXaXRoQ2hlY2tzLFxuICBub0xlZnRvdmVyc0luVXJsLFxuICBzcGxpdCxcbn0gZnJvbSAnLi91dGlscy9jb25maWdfbWF0Y2hpbmcnO1xuaW1wb3J0IHtUcmVlTm9kZX0gZnJvbSAnLi91dGlscy90cmVlJztcbmltcG9ydCB7aXNFbXB0eUVycm9yfSBmcm9tICcuL3V0aWxzL3R5cGVfZ3VhcmRzJztcblxuLyoqXG4gKiBDbGFzcyB1c2VkIHRvIGluZGljYXRlIHRoZXJlIHdlcmUgbm8gYWRkaXRpb25hbCByb3V0ZSBjb25maWcgbWF0Y2hlcyBidXQgdGhhdCBhbGwgc2VnbWVudHMgb2ZcbiAqIHRoZSBVUkwgd2VyZSBjb25zdW1lZCBkdXJpbmcgbWF0Y2hpbmcgc28gdGhlIHJvdXRlIHdhcyBVUkwgbWF0Y2hlZC4gV2hlbiB0aGlzIGhhcHBlbnMsIHdlIHN0aWxsXG4gKiB0cnkgdG8gbWF0Y2ggY2hpbGQgY29uZmlncyBpbiBjYXNlIHRoZXJlIGFyZSBlbXB0eSBwYXRoIGNoaWxkcmVuLlxuICovXG5jbGFzcyBOb0xlZnRvdmVyc0luVXJsIHt9XG5cbmV4cG9ydCBmdW5jdGlvbiByZWNvZ25pemUoXG4gIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yLFxuICBjb25maWdMb2FkZXI6IFJvdXRlckNvbmZpZ0xvYWRlcixcbiAgcm9vdENvbXBvbmVudFR5cGU6IFR5cGU8YW55PiB8IG51bGwsXG4gIGNvbmZpZzogUm91dGVzLFxuICB1cmxUcmVlOiBVcmxUcmVlLFxuICB1cmxTZXJpYWxpemVyOiBVcmxTZXJpYWxpemVyLFxuICBwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5OiBQYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5ID0gJ2VtcHR5T25seScsXG4pOiBPYnNlcnZhYmxlPHtzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdDsgdHJlZTogVXJsVHJlZX0+IHtcbiAgcmV0dXJuIG5ldyBSZWNvZ25pemVyKFxuICAgIGluamVjdG9yLFxuICAgIGNvbmZpZ0xvYWRlcixcbiAgICByb290Q29tcG9uZW50VHlwZSxcbiAgICBjb25maWcsXG4gICAgdXJsVHJlZSxcbiAgICBwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5LFxuICAgIHVybFNlcmlhbGl6ZXIsXG4gICkucmVjb2duaXplKCk7XG59XG5cbmNvbnN0IE1BWF9BTExPV0VEX1JFRElSRUNUUyA9IDMxO1xuXG5leHBvcnQgY2xhc3MgUmVjb2duaXplciB7XG4gIHByaXZhdGUgYXBwbHlSZWRpcmVjdHMgPSBuZXcgQXBwbHlSZWRpcmVjdHModGhpcy51cmxTZXJpYWxpemVyLCB0aGlzLnVybFRyZWUpO1xuICBwcml2YXRlIGFic29sdXRlUmVkaXJlY3RDb3VudCA9IDA7XG4gIGFsbG93UmVkaXJlY3RzID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yLFxuICAgIHByaXZhdGUgY29uZmlnTG9hZGVyOiBSb3V0ZXJDb25maWdMb2FkZXIsXG4gICAgcHJpdmF0ZSByb290Q29tcG9uZW50VHlwZTogVHlwZTxhbnk+IHwgbnVsbCxcbiAgICBwcml2YXRlIGNvbmZpZzogUm91dGVzLFxuICAgIHByaXZhdGUgdXJsVHJlZTogVXJsVHJlZSxcbiAgICBwcml2YXRlIHBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3k6IFBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3ksXG4gICAgcHJpdmF0ZSByZWFkb25seSB1cmxTZXJpYWxpemVyOiBVcmxTZXJpYWxpemVyLFxuICApIHt9XG5cbiAgcHJpdmF0ZSBub01hdGNoRXJyb3IoZTogTm9NYXRjaCk6IFJ1bnRpbWVFcnJvcjxSdW50aW1lRXJyb3JDb2RlLk5PX01BVENIPiB7XG4gICAgcmV0dXJuIG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLk5PX01BVENILFxuICAgICAgdHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlXG4gICAgICAgID8gYENhbm5vdCBtYXRjaCBhbnkgcm91dGVzLiBVUkwgU2VnbWVudDogJyR7ZS5zZWdtZW50R3JvdXB9J2BcbiAgICAgICAgOiBgJyR7ZS5zZWdtZW50R3JvdXB9J2AsXG4gICAgKTtcbiAgfVxuXG4gIHJlY29nbml6ZSgpOiBPYnNlcnZhYmxlPHtzdGF0ZTogUm91dGVyU3RhdGVTbmFwc2hvdDsgdHJlZTogVXJsVHJlZX0+IHtcbiAgICBjb25zdCByb290U2VnbWVudEdyb3VwID0gc3BsaXQodGhpcy51cmxUcmVlLnJvb3QsIFtdLCBbXSwgdGhpcy5jb25maWcpLnNlZ21lbnRHcm91cDtcblxuICAgIHJldHVybiB0aGlzLm1hdGNoKHJvb3RTZWdtZW50R3JvdXApLnBpcGUoXG4gICAgICBtYXAoKGNoaWxkcmVuKSA9PiB7XG4gICAgICAgIC8vIFVzZSBPYmplY3QuZnJlZXplIHRvIHByZXZlbnQgcmVhZGVycyBvZiB0aGUgUm91dGVyIHN0YXRlIGZyb20gbW9kaWZ5aW5nIGl0IG91dHNpZGVcbiAgICAgICAgLy8gb2YgYSBuYXZpZ2F0aW9uLCByZXN1bHRpbmcgaW4gdGhlIHJvdXRlciBiZWluZyBvdXQgb2Ygc3luYyB3aXRoIHRoZSBicm93c2VyLlxuICAgICAgICBjb25zdCByb290ID0gbmV3IEFjdGl2YXRlZFJvdXRlU25hcHNob3QoXG4gICAgICAgICAgW10sXG4gICAgICAgICAgT2JqZWN0LmZyZWV6ZSh7fSksXG4gICAgICAgICAgT2JqZWN0LmZyZWV6ZSh7Li4udGhpcy51cmxUcmVlLnF1ZXJ5UGFyYW1zfSksXG4gICAgICAgICAgdGhpcy51cmxUcmVlLmZyYWdtZW50LFxuICAgICAgICAgIHt9LFxuICAgICAgICAgIFBSSU1BUllfT1VUTEVULFxuICAgICAgICAgIHRoaXMucm9vdENvbXBvbmVudFR5cGUsXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICB7fSxcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCByb290Tm9kZSA9IG5ldyBUcmVlTm9kZShyb290LCBjaGlsZHJlbik7XG4gICAgICAgIGNvbnN0IHJvdXRlU3RhdGUgPSBuZXcgUm91dGVyU3RhdGVTbmFwc2hvdCgnJywgcm9vdE5vZGUpO1xuICAgICAgICBjb25zdCB0cmVlID0gY3JlYXRlVXJsVHJlZUZyb21TbmFwc2hvdChcbiAgICAgICAgICByb290LFxuICAgICAgICAgIFtdLFxuICAgICAgICAgIHRoaXMudXJsVHJlZS5xdWVyeVBhcmFtcyxcbiAgICAgICAgICB0aGlzLnVybFRyZWUuZnJhZ21lbnQsXG4gICAgICAgICk7XG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzQ3MzA3XG4gICAgICAgIC8vIENyZWF0aW5nIHRoZSB0cmVlIHN0cmluZ2lmaWVzIHRoZSBxdWVyeSBwYXJhbXNcbiAgICAgICAgLy8gV2UgZG9uJ3Qgd2FudCB0byBkbyB0aGlzIGhlcmUgc28gcmVhc3NpZ24gdGhlbSB0byB0aGUgb3JpZ2luYWwuXG4gICAgICAgIHRyZWUucXVlcnlQYXJhbXMgPSB0aGlzLnVybFRyZWUucXVlcnlQYXJhbXM7XG4gICAgICAgIHJvdXRlU3RhdGUudXJsID0gdGhpcy51cmxTZXJpYWxpemVyLnNlcmlhbGl6ZSh0cmVlKTtcbiAgICAgICAgdGhpcy5pbmhlcml0UGFyYW1zQW5kRGF0YShyb3V0ZVN0YXRlLl9yb290LCBudWxsKTtcbiAgICAgICAgcmV0dXJuIHtzdGF0ZTogcm91dGVTdGF0ZSwgdHJlZX07XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBtYXRjaChyb290U2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXApOiBPYnNlcnZhYmxlPFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+W10+IHtcbiAgICBjb25zdCBleHBhbmRlZCQgPSB0aGlzLnByb2Nlc3NTZWdtZW50R3JvdXAoXG4gICAgICB0aGlzLmluamVjdG9yLFxuICAgICAgdGhpcy5jb25maWcsXG4gICAgICByb290U2VnbWVudEdyb3VwLFxuICAgICAgUFJJTUFSWV9PVVRMRVQsXG4gICAgKTtcbiAgICByZXR1cm4gZXhwYW5kZWQkLnBpcGUoXG4gICAgICBjYXRjaEVycm9yKChlOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBBYnNvbHV0ZVJlZGlyZWN0KSB7XG4gICAgICAgICAgdGhpcy51cmxUcmVlID0gZS51cmxUcmVlO1xuICAgICAgICAgIHJldHVybiB0aGlzLm1hdGNoKGUudXJsVHJlZS5yb290KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIE5vTWF0Y2gpIHtcbiAgICAgICAgICB0aHJvdyB0aGlzLm5vTWF0Y2hFcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IGU7XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgaW5oZXJpdFBhcmFtc0FuZERhdGEoXG4gICAgcm91dGVOb2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PixcbiAgICBwYXJlbnQ6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QgfCBudWxsLFxuICApOiB2b2lkIHtcbiAgICBjb25zdCByb3V0ZSA9IHJvdXRlTm9kZS52YWx1ZTtcbiAgICBjb25zdCBpID0gZ2V0SW5oZXJpdGVkKHJvdXRlLCBwYXJlbnQsIHRoaXMucGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSk7XG5cbiAgICByb3V0ZS5wYXJhbXMgPSBPYmplY3QuZnJlZXplKGkucGFyYW1zKTtcbiAgICByb3V0ZS5kYXRhID0gT2JqZWN0LmZyZWV6ZShpLmRhdGEpO1xuXG4gICAgcm91dGVOb2RlLmNoaWxkcmVuLmZvckVhY2goKG4pID0+IHRoaXMuaW5oZXJpdFBhcmFtc0FuZERhdGEobiwgcm91dGUpKTtcbiAgfVxuXG4gIHByb2Nlc3NTZWdtZW50R3JvdXAoXG4gICAgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IsXG4gICAgY29uZmlnOiBSb3V0ZVtdLFxuICAgIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLFxuICAgIG91dGxldDogc3RyaW5nLFxuICApOiBPYnNlcnZhYmxlPFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+W10+IHtcbiAgICBpZiAoc2VnbWVudEdyb3VwLnNlZ21lbnRzLmxlbmd0aCA9PT0gMCAmJiBzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0NoaWxkcmVuKGluamVjdG9yLCBjb25maWcsIHNlZ21lbnRHcm91cCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucHJvY2Vzc1NlZ21lbnQoXG4gICAgICBpbmplY3RvcixcbiAgICAgIGNvbmZpZyxcbiAgICAgIHNlZ21lbnRHcm91cCxcbiAgICAgIHNlZ21lbnRHcm91cC5zZWdtZW50cyxcbiAgICAgIG91dGxldCxcbiAgICAgIHRydWUsXG4gICAgKS5waXBlKG1hcCgoY2hpbGQpID0+IChjaGlsZCBpbnN0YW5jZW9mIFRyZWVOb2RlID8gW2NoaWxkXSA6IFtdKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hdGNoZXMgZXZlcnkgY2hpbGQgb3V0bGV0IGluIHRoZSBgc2VnbWVudEdyb3VwYCB0byBhIGBSb3V0ZWAgaW4gdGhlIGNvbmZpZy4gUmV0dXJucyBgbnVsbGAgaWZcbiAgICogd2UgY2Fubm90IGZpbmQgYSBtYXRjaCBmb3IgX2FueV8gb2YgdGhlIGNoaWxkcmVuLlxuICAgKlxuICAgKiBAcGFyYW0gY29uZmlnIC0gVGhlIGBSb3V0ZXNgIHRvIG1hdGNoIGFnYWluc3RcbiAgICogQHBhcmFtIHNlZ21lbnRHcm91cCAtIFRoZSBgVXJsU2VnbWVudEdyb3VwYCB3aG9zZSBjaGlsZHJlbiBuZWVkIHRvIGJlIG1hdGNoZWQgYWdhaW5zdCB0aGVcbiAgICogICAgIGNvbmZpZy5cbiAgICovXG4gIHByb2Nlc3NDaGlsZHJlbihcbiAgICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3RvcixcbiAgICBjb25maWc6IFJvdXRlW10sXG4gICAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsXG4gICk6IE9ic2VydmFibGU8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD5bXT4ge1xuICAgIC8vIEV4cGFuZCBvdXRsZXRzIG9uZSBhdCBhIHRpbWUsIHN0YXJ0aW5nIHdpdGggdGhlIHByaW1hcnkgb3V0bGV0LiBXZSBuZWVkIHRvIGRvIGl0IHRoaXMgd2F5XG4gICAgLy8gYmVjYXVzZSBhbiBhYnNvbHV0ZSByZWRpcmVjdCBmcm9tIHRoZSBwcmltYXJ5IG91dGxldCB0YWtlcyBwcmVjZWRlbmNlLlxuICAgIGNvbnN0IGNoaWxkT3V0bGV0czogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIE9iamVjdC5rZXlzKHNlZ21lbnRHcm91cC5jaGlsZHJlbikpIHtcbiAgICAgIGlmIChjaGlsZCA9PT0gJ3ByaW1hcnknKSB7XG4gICAgICAgIGNoaWxkT3V0bGV0cy51bnNoaWZ0KGNoaWxkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoaWxkT3V0bGV0cy5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZyb20oY2hpbGRPdXRsZXRzKS5waXBlKFxuICAgICAgY29uY2F0TWFwKChjaGlsZE91dGxldCkgPT4ge1xuICAgICAgICBjb25zdCBjaGlsZCA9IHNlZ21lbnRHcm91cC5jaGlsZHJlbltjaGlsZE91dGxldF07XG4gICAgICAgIC8vIFNvcnQgdGhlIGNvbmZpZyBzbyB0aGF0IHJvdXRlcyB3aXRoIG91dGxldHMgdGhhdCBtYXRjaCB0aGUgb25lIGJlaW5nIGFjdGl2YXRlZFxuICAgICAgICAvLyBhcHBlYXIgZmlyc3QsIGZvbGxvd2VkIGJ5IHJvdXRlcyBmb3Igb3RoZXIgb3V0bGV0cywgd2hpY2ggbWlnaHQgbWF0Y2ggaWYgdGhleSBoYXZlXG4gICAgICAgIC8vIGFuIGVtcHR5IHBhdGguXG4gICAgICAgIGNvbnN0IHNvcnRlZENvbmZpZyA9IHNvcnRCeU1hdGNoaW5nT3V0bGV0cyhjb25maWcsIGNoaWxkT3V0bGV0KTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc1NlZ21lbnRHcm91cChpbmplY3Rvciwgc29ydGVkQ29uZmlnLCBjaGlsZCwgY2hpbGRPdXRsZXQpO1xuICAgICAgfSksXG4gICAgICBzY2FuKChjaGlsZHJlbiwgb3V0bGV0Q2hpbGRyZW4pID0+IHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaCguLi5vdXRsZXRDaGlsZHJlbik7XG4gICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICAgIH0pLFxuICAgICAgZGVmYXVsdElmRW1wdHkobnVsbCBhcyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdIHwgbnVsbCksXG4gICAgICBsYXN0KCksXG4gICAgICBtZXJnZU1hcCgoY2hpbGRyZW4pID0+IHtcbiAgICAgICAgaWYgKGNoaWxkcmVuID09PSBudWxsKSByZXR1cm4gbm9NYXRjaChzZWdtZW50R3JvdXApO1xuICAgICAgICAvLyBCZWNhdXNlIHdlIG1heSBoYXZlIG1hdGNoZWQgdHdvIG91dGxldHMgdG8gdGhlIHNhbWUgZW1wdHkgcGF0aCBzZWdtZW50LCB3ZSBjYW4gaGF2ZVxuICAgICAgICAvLyBtdWx0aXBsZSBhY3RpdmF0ZWQgcmVzdWx0cyBmb3IgdGhlIHNhbWUgb3V0bGV0LiBXZSBzaG91bGQgbWVyZ2UgdGhlIGNoaWxkcmVuIG9mXG4gICAgICAgIC8vIHRoZXNlIHJlc3VsdHMgc28gdGhlIGZpbmFsIHJldHVybiB2YWx1ZSBpcyBvbmx5IG9uZSBgVHJlZU5vZGVgIHBlciBvdXRsZXQuXG4gICAgICAgIGNvbnN0IG1lcmdlZENoaWxkcmVuID0gbWVyZ2VFbXB0eVBhdGhNYXRjaGVzKGNoaWxkcmVuKTtcbiAgICAgICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIHJlYWxseSBuZXZlciBoYXBwZW4gLSB3ZSBhcmUgb25seSB0YWtpbmcgdGhlIGZpcnN0IG1hdGNoIGZvciBlYWNoXG4gICAgICAgICAgLy8gb3V0bGV0IGFuZCBtZXJnZSB0aGUgZW1wdHkgcGF0aCBtYXRjaGVzLlxuICAgICAgICAgIGNoZWNrT3V0bGV0TmFtZVVuaXF1ZW5lc3MobWVyZ2VkQ2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICAgIHNvcnRBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90cyhtZXJnZWRDaGlsZHJlbik7XG4gICAgICAgIHJldHVybiBvZihtZXJnZWRDaGlsZHJlbik7XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgcHJvY2Vzc1NlZ21lbnQoXG4gICAgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IsXG4gICAgcm91dGVzOiBSb3V0ZVtdLFxuICAgIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLFxuICAgIHNlZ21lbnRzOiBVcmxTZWdtZW50W10sXG4gICAgb3V0bGV0OiBzdHJpbmcsXG4gICAgYWxsb3dSZWRpcmVjdHM6IGJvb2xlYW4sXG4gICk6IE9ic2VydmFibGU8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4gfCBOb0xlZnRvdmVyc0luVXJsPiB7XG4gICAgcmV0dXJuIGZyb20ocm91dGVzKS5waXBlKFxuICAgICAgY29uY2F0TWFwKChyKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NTZWdtZW50QWdhaW5zdFJvdXRlKFxuICAgICAgICAgIHIuX2luamVjdG9yID8/IGluamVjdG9yLFxuICAgICAgICAgIHJvdXRlcyxcbiAgICAgICAgICByLFxuICAgICAgICAgIHNlZ21lbnRHcm91cCxcbiAgICAgICAgICBzZWdtZW50cyxcbiAgICAgICAgICBvdXRsZXQsXG4gICAgICAgICAgYWxsb3dSZWRpcmVjdHMsXG4gICAgICAgICkucGlwZShcbiAgICAgICAgICBjYXRjaEVycm9yKChlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgTm9NYXRjaCkge1xuICAgICAgICAgICAgICByZXR1cm4gb2YobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgfSksXG4gICAgICBmaXJzdCgoeCk6IHggaXMgVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4gfCBOb0xlZnRvdmVyc0luVXJsID0+ICEheCksXG4gICAgICBjYXRjaEVycm9yKChlKSA9PiB7XG4gICAgICAgIGlmIChpc0VtcHR5RXJyb3IoZSkpIHtcbiAgICAgICAgICBpZiAobm9MZWZ0b3ZlcnNJblVybChzZWdtZW50R3JvdXAsIHNlZ21lbnRzLCBvdXRsZXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gb2YobmV3IE5vTGVmdG92ZXJzSW5VcmwoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBub01hdGNoKHNlZ21lbnRHcm91cCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBwcm9jZXNzU2VnbWVudEFnYWluc3RSb3V0ZShcbiAgICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3RvcixcbiAgICByb3V0ZXM6IFJvdXRlW10sXG4gICAgcm91dGU6IFJvdXRlLFxuICAgIHJhd1NlZ21lbnQ6IFVybFNlZ21lbnRHcm91cCxcbiAgICBzZWdtZW50czogVXJsU2VnbWVudFtdLFxuICAgIG91dGxldDogc3RyaW5nLFxuICAgIGFsbG93UmVkaXJlY3RzOiBib29sZWFuLFxuICApOiBPYnNlcnZhYmxlPFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+IHwgTm9MZWZ0b3ZlcnNJblVybD4ge1xuICAgIGlmICghaXNJbW1lZGlhdGVNYXRjaChyb3V0ZSwgcmF3U2VnbWVudCwgc2VnbWVudHMsIG91dGxldCkpIHJldHVybiBub01hdGNoKHJhd1NlZ21lbnQpO1xuXG4gICAgaWYgKHJvdXRlLnJlZGlyZWN0VG8gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMubWF0Y2hTZWdtZW50QWdhaW5zdFJvdXRlKGluamVjdG9yLCByYXdTZWdtZW50LCByb3V0ZSwgc2VnbWVudHMsIG91dGxldCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYWxsb3dSZWRpcmVjdHMgJiYgYWxsb3dSZWRpcmVjdHMpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4cGFuZFNlZ21lbnRBZ2FpbnN0Um91dGVVc2luZ1JlZGlyZWN0KFxuICAgICAgICBpbmplY3RvcixcbiAgICAgICAgcmF3U2VnbWVudCxcbiAgICAgICAgcm91dGVzLFxuICAgICAgICByb3V0ZSxcbiAgICAgICAgc2VnbWVudHMsXG4gICAgICAgIG91dGxldCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vTWF0Y2gocmF3U2VnbWVudCk7XG4gIH1cblxuICBwcml2YXRlIGV4cGFuZFNlZ21lbnRBZ2FpbnN0Um91dGVVc2luZ1JlZGlyZWN0KFxuICAgIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yLFxuICAgIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLFxuICAgIHJvdXRlczogUm91dGVbXSxcbiAgICByb3V0ZTogUm91dGUsXG4gICAgc2VnbWVudHM6IFVybFNlZ21lbnRbXSxcbiAgICBvdXRsZXQ6IHN0cmluZyxcbiAgKTogT2JzZXJ2YWJsZTxUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PiB8IE5vTGVmdG92ZXJzSW5Vcmw+IHtcbiAgICBjb25zdCB7bWF0Y2hlZCwgY29uc3VtZWRTZWdtZW50cywgcG9zaXRpb25hbFBhcmFtU2VnbWVudHMsIHJlbWFpbmluZ1NlZ21lbnRzfSA9IG1hdGNoKFxuICAgICAgc2VnbWVudEdyb3VwLFxuICAgICAgcm91dGUsXG4gICAgICBzZWdtZW50cyxcbiAgICApO1xuICAgIGlmICghbWF0Y2hlZCkgcmV0dXJuIG5vTWF0Y2goc2VnbWVudEdyb3VwKTtcblxuICAgIC8vIFRPRE8oYXRzY290dCk6IE1vdmUgYWxsIG9mIHRoaXMgdW5kZXIgYW4gaWYobmdEZXZNb2RlKSBhcyBhIGJyZWFraW5nIGNoYW5nZSBhbmQgYWxsb3cgc3RhY2tcbiAgICAvLyBzaXplIGV4Y2VlZGVkIGluIHByb2R1Y3Rpb25cbiAgICBpZiAocm91dGUucmVkaXJlY3RUbyEuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICB0aGlzLmFic29sdXRlUmVkaXJlY3RDb3VudCsrO1xuICAgICAgaWYgKHRoaXMuYWJzb2x1dGVSZWRpcmVjdENvdW50ID4gTUFYX0FMTE9XRURfUkVESVJFQ1RTKSB7XG4gICAgICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTkZJTklURV9SRURJUkVDVCxcbiAgICAgICAgICAgIGBEZXRlY3RlZCBwb3NzaWJsZSBpbmZpbml0ZSByZWRpcmVjdCB3aGVuIHJlZGlyZWN0aW5nIGZyb20gJyR7dGhpcy51cmxUcmVlfScgdG8gJyR7cm91dGUucmVkaXJlY3RUb30nLlxcbmAgK1xuICAgICAgICAgICAgICBgVGhpcyBpcyBjdXJyZW50bHkgYSBkZXYgbW9kZSBvbmx5IGVycm9yIGJ1dCB3aWxsIGJlY29tZSBhYCArXG4gICAgICAgICAgICAgIGAgY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkIGVycm9yIGluIHByb2R1Y3Rpb24gaW4gYSBmdXR1cmUgbWFqb3IgdmVyc2lvbi5gLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hbGxvd1JlZGlyZWN0cyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBuZXdUcmVlID0gdGhpcy5hcHBseVJlZGlyZWN0cy5hcHBseVJlZGlyZWN0Q29tbWFuZHMoXG4gICAgICBjb25zdW1lZFNlZ21lbnRzLFxuICAgICAgcm91dGUucmVkaXJlY3RUbyEsXG4gICAgICBwb3NpdGlvbmFsUGFyYW1TZWdtZW50cyxcbiAgICApO1xuXG4gICAgcmV0dXJuIHRoaXMuYXBwbHlSZWRpcmVjdHMubGluZXJhbGl6ZVNlZ21lbnRzKHJvdXRlLCBuZXdUcmVlKS5waXBlKFxuICAgICAgbWVyZ2VNYXAoKG5ld1NlZ21lbnRzOiBVcmxTZWdtZW50W10pID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc1NlZ21lbnQoXG4gICAgICAgICAgaW5qZWN0b3IsXG4gICAgICAgICAgcm91dGVzLFxuICAgICAgICAgIHNlZ21lbnRHcm91cCxcbiAgICAgICAgICBuZXdTZWdtZW50cy5jb25jYXQocmVtYWluaW5nU2VnbWVudHMpLFxuICAgICAgICAgIG91dGxldCxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBtYXRjaFNlZ21lbnRBZ2FpbnN0Um91dGUoXG4gICAgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IsXG4gICAgcmF3U2VnbWVudDogVXJsU2VnbWVudEdyb3VwLFxuICAgIHJvdXRlOiBSb3V0ZSxcbiAgICBzZWdtZW50czogVXJsU2VnbWVudFtdLFxuICAgIG91dGxldDogc3RyaW5nLFxuICApOiBPYnNlcnZhYmxlPFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+PiB7XG4gICAgY29uc3QgbWF0Y2hSZXN1bHQgPSBtYXRjaFdpdGhDaGVja3MocmF3U2VnbWVudCwgcm91dGUsIHNlZ21lbnRzLCBpbmplY3RvciwgdGhpcy51cmxTZXJpYWxpemVyKTtcbiAgICBpZiAocm91dGUucGF0aCA9PT0gJyoqJykge1xuICAgICAgLy8gUHJpb3IgdmVyc2lvbnMgb2YgdGhlIHJvdXRlIG1hdGNoaW5nIGFsZ29yaXRobSB3b3VsZCBzdG9wIG1hdGNoaW5nIGF0IHRoZSB3aWxkY2FyZCByb3V0ZS5cbiAgICAgIC8vIFdlIHNob3VsZCBpbnZlc3RpZ2F0ZSBhIGJldHRlciBzdHJhdGVneSBmb3IgYW55IGV4aXN0aW5nIGNoaWxkcmVuLiBPdGhlcndpc2UsIHRoZXNlXG4gICAgICAvLyBjaGlsZCBzZWdtZW50cyBhcmUgc2lsZW50bHkgZHJvcHBlZCBmcm9tIHRoZSBuYXZpZ2F0aW9uLlxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvNDAwODlcbiAgICAgIHJhd1NlZ21lbnQuY2hpbGRyZW4gPSB7fTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWF0Y2hSZXN1bHQucGlwZShcbiAgICAgIHN3aXRjaE1hcCgocmVzdWx0KSA9PiB7XG4gICAgICAgIGlmICghcmVzdWx0Lm1hdGNoZWQpIHtcbiAgICAgICAgICByZXR1cm4gbm9NYXRjaChyYXdTZWdtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoZSByb3V0ZSBoYXMgYW4gaW5qZWN0b3IgY3JlYXRlZCBmcm9tIHByb3ZpZGVycywgd2Ugc2hvdWxkIHN0YXJ0IHVzaW5nIHRoYXQuXG4gICAgICAgIGluamVjdG9yID0gcm91dGUuX2luamVjdG9yID8/IGluamVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDaGlsZENvbmZpZyhpbmplY3Rvciwgcm91dGUsIHNlZ21lbnRzKS5waXBlKFxuICAgICAgICAgIHN3aXRjaE1hcCgoe3JvdXRlczogY2hpbGRDb25maWd9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZEluamVjdG9yID0gcm91dGUuX2xvYWRlZEluamVjdG9yID8/IGluamVjdG9yO1xuXG4gICAgICAgICAgICBjb25zdCB7Y29uc3VtZWRTZWdtZW50cywgcmVtYWluaW5nU2VnbWVudHMsIHBhcmFtZXRlcnN9ID0gcmVzdWx0O1xuICAgICAgICAgICAgY29uc3Qgc25hcHNob3QgPSBuZXcgQWN0aXZhdGVkUm91dGVTbmFwc2hvdChcbiAgICAgICAgICAgICAgY29uc3VtZWRTZWdtZW50cyxcbiAgICAgICAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgT2JqZWN0LmZyZWV6ZSh7Li4udGhpcy51cmxUcmVlLnF1ZXJ5UGFyYW1zfSksXG4gICAgICAgICAgICAgIHRoaXMudXJsVHJlZS5mcmFnbWVudCxcbiAgICAgICAgICAgICAgZ2V0RGF0YShyb3V0ZSksXG4gICAgICAgICAgICAgIGdldE91dGxldChyb3V0ZSksXG4gICAgICAgICAgICAgIHJvdXRlLmNvbXBvbmVudCA/PyByb3V0ZS5fbG9hZGVkQ29tcG9uZW50ID8/IG51bGwsXG4gICAgICAgICAgICAgIHJvdXRlLFxuICAgICAgICAgICAgICBnZXRSZXNvbHZlKHJvdXRlKSxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IHtzZWdtZW50R3JvdXAsIHNsaWNlZFNlZ21lbnRzfSA9IHNwbGl0KFxuICAgICAgICAgICAgICByYXdTZWdtZW50LFxuICAgICAgICAgICAgICBjb25zdW1lZFNlZ21lbnRzLFxuICAgICAgICAgICAgICByZW1haW5pbmdTZWdtZW50cyxcbiAgICAgICAgICAgICAgY2hpbGRDb25maWcsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoc2xpY2VkU2VnbWVudHMubGVuZ3RoID09PSAwICYmIHNlZ21lbnRHcm91cC5oYXNDaGlsZHJlbigpKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NDaGlsZHJlbihjaGlsZEluamVjdG9yLCBjaGlsZENvbmZpZywgc2VnbWVudEdyb3VwKS5waXBlKFxuICAgICAgICAgICAgICAgIG1hcCgoY2hpbGRyZW4pID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChjaGlsZHJlbiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVHJlZU5vZGUoc25hcHNob3QsIGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoaWxkQ29uZmlnLmxlbmd0aCA9PT0gMCAmJiBzbGljZWRTZWdtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG9mKG5ldyBUcmVlTm9kZShzbmFwc2hvdCwgW10pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbWF0Y2hlZE9uT3V0bGV0ID0gZ2V0T3V0bGV0KHJvdXRlKSA9PT0gb3V0bGV0O1xuICAgICAgICAgICAgLy8gSWYgd2UgbWF0Y2hlZCBhIGNvbmZpZyBkdWUgdG8gZW1wdHkgcGF0aCBtYXRjaCBvbiBhIGRpZmZlcmVudCBvdXRsZXQsIHdlIG5lZWQgdG9cbiAgICAgICAgICAgIC8vIGNvbnRpbnVlIHBhc3NpbmcgdGhlIGN1cnJlbnQgb3V0bGV0IGZvciB0aGUgc2VnbWVudCByYXRoZXIgdGhhbiBzd2l0Y2ggdG8gUFJJTUFSWS5cbiAgICAgICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBzd2l0Y2ggdG8gcHJpbWFyeSB3aGVuIHdlIGhhdmUgYSBtYXRjaCBiZWNhdXNlIG91dGxldCBjb25maWdzIGxvb2sgbGlrZVxuICAgICAgICAgICAgLy8gdGhpczoge3BhdGg6ICdhJywgb3V0bGV0OiAnYScsIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAvLyAge3BhdGg6ICdiJywgY29tcG9uZW50OiBCfSxcbiAgICAgICAgICAgIC8vICB7cGF0aDogJ2MnLCBjb21wb25lbnQ6IEN9LFxuICAgICAgICAgICAgLy8gXX1cbiAgICAgICAgICAgIC8vIE5vdGljZSB0aGF0IHRoZSBjaGlsZHJlbiBvZiB0aGUgbmFtZWQgb3V0bGV0IGFyZSBjb25maWd1cmVkIHdpdGggdGhlIHByaW1hcnkgb3V0bGV0XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzU2VnbWVudChcbiAgICAgICAgICAgICAgY2hpbGRJbmplY3RvcixcbiAgICAgICAgICAgICAgY2hpbGRDb25maWcsXG4gICAgICAgICAgICAgIHNlZ21lbnRHcm91cCxcbiAgICAgICAgICAgICAgc2xpY2VkU2VnbWVudHMsXG4gICAgICAgICAgICAgIG1hdGNoZWRPbk91dGxldCA/IFBSSU1BUllfT1VUTEVUIDogb3V0bGV0LFxuICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgKS5waXBlKFxuICAgICAgICAgICAgICBtYXAoKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUcmVlTm9kZShzbmFwc2hvdCwgY2hpbGQgaW5zdGFuY2VvZiBUcmVlTm9kZSA/IFtjaGlsZF0gOiBbXSk7XG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cbiAgcHJpdmF0ZSBnZXRDaGlsZENvbmZpZyhcbiAgICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3RvcixcbiAgICByb3V0ZTogUm91dGUsXG4gICAgc2VnbWVudHM6IFVybFNlZ21lbnRbXSxcbiAgKTogT2JzZXJ2YWJsZTxMb2FkZWRSb3V0ZXJDb25maWc+IHtcbiAgICBpZiAocm91dGUuY2hpbGRyZW4pIHtcbiAgICAgIC8vIFRoZSBjaGlsZHJlbiBiZWxvbmcgdG8gdGhlIHNhbWUgbW9kdWxlXG4gICAgICByZXR1cm4gb2Yoe3JvdXRlczogcm91dGUuY2hpbGRyZW4sIGluamVjdG9yfSk7XG4gICAgfVxuXG4gICAgaWYgKHJvdXRlLmxvYWRDaGlsZHJlbikge1xuICAgICAgLy8gbGF6eSBjaGlsZHJlbiBiZWxvbmcgdG8gdGhlIGxvYWRlZCBtb2R1bGVcbiAgICAgIGlmIChyb3V0ZS5fbG9hZGVkUm91dGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIG9mKHtyb3V0ZXM6IHJvdXRlLl9sb2FkZWRSb3V0ZXMsIGluamVjdG9yOiByb3V0ZS5fbG9hZGVkSW5qZWN0b3J9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJ1bkNhbkxvYWRHdWFyZHMoaW5qZWN0b3IsIHJvdXRlLCBzZWdtZW50cywgdGhpcy51cmxTZXJpYWxpemVyKS5waXBlKFxuICAgICAgICBtZXJnZU1hcCgoc2hvdWxkTG9hZFJlc3VsdDogYm9vbGVhbikgPT4ge1xuICAgICAgICAgIGlmIChzaG91bGRMb2FkUmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25maWdMb2FkZXIubG9hZENoaWxkcmVuKGluamVjdG9yLCByb3V0ZSkucGlwZShcbiAgICAgICAgICAgICAgdGFwKChjZmc6IExvYWRlZFJvdXRlckNvbmZpZykgPT4ge1xuICAgICAgICAgICAgICAgIHJvdXRlLl9sb2FkZWRSb3V0ZXMgPSBjZmcucm91dGVzO1xuICAgICAgICAgICAgICAgIHJvdXRlLl9sb2FkZWRJbmplY3RvciA9IGNmZy5pbmplY3RvcjtcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gY2FuTG9hZEZhaWxzKHJvdXRlKTtcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBvZih7cm91dGVzOiBbXSwgaW5qZWN0b3J9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzb3J0QWN0aXZhdGVkUm91dGVTbmFwc2hvdHMobm9kZXM6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+W10pOiB2b2lkIHtcbiAgbm9kZXMuc29ydCgoYSwgYikgPT4ge1xuICAgIGlmIChhLnZhbHVlLm91dGxldCA9PT0gUFJJTUFSWV9PVVRMRVQpIHJldHVybiAtMTtcbiAgICBpZiAoYi52YWx1ZS5vdXRsZXQgPT09IFBSSU1BUllfT1VUTEVUKSByZXR1cm4gMTtcbiAgICByZXR1cm4gYS52YWx1ZS5vdXRsZXQubG9jYWxlQ29tcGFyZShiLnZhbHVlLm91dGxldCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBoYXNFbXB0eVBhdGhDb25maWcobm9kZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4pIHtcbiAgY29uc3QgY29uZmlnID0gbm9kZS52YWx1ZS5yb3V0ZUNvbmZpZztcbiAgcmV0dXJuIGNvbmZpZyAmJiBjb25maWcucGF0aCA9PT0gJyc7XG59XG5cbi8qKlxuICogRmluZHMgYFRyZWVOb2RlYHMgd2l0aCBtYXRjaGluZyBlbXB0eSBwYXRoIHJvdXRlIGNvbmZpZ3MgYW5kIG1lcmdlcyB0aGVtIGludG8gYFRyZWVOb2RlYCB3aXRoXG4gKiB0aGUgY2hpbGRyZW4gZnJvbSBlYWNoIGR1cGxpY2F0ZS4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBkaWZmZXJlbnQgb3V0bGV0cyBjYW4gbWF0Y2ggYVxuICogc2luZ2xlIGVtcHR5IHBhdGggcm91dGUgY29uZmlnIGFuZCB0aGUgcmVzdWx0cyBuZWVkIHRvIHRoZW4gYmUgbWVyZ2VkLlxuICovXG5mdW5jdGlvbiBtZXJnZUVtcHR5UGF0aE1hdGNoZXMoXG4gIG5vZGVzOiBBcnJheTxUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90Pj4sXG4pOiBBcnJheTxUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90Pj4ge1xuICBjb25zdCByZXN1bHQ6IEFycmF5PFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+PiA9IFtdO1xuICAvLyBUaGUgc2V0IG9mIG5vZGVzIHdoaWNoIGNvbnRhaW4gY2hpbGRyZW4gdGhhdCB3ZXJlIG1lcmdlZCBmcm9tIHR3byBkdXBsaWNhdGUgZW1wdHkgcGF0aCBub2Rlcy5cbiAgY29uc3QgbWVyZ2VkTm9kZXM6IFNldDxUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90Pj4gPSBuZXcgU2V0KCk7XG5cbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgaWYgKCFoYXNFbXB0eVBhdGhDb25maWcobm9kZSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgZHVwbGljYXRlRW1wdHlQYXRoTm9kZSA9IHJlc3VsdC5maW5kKFxuICAgICAgKHJlc3VsdE5vZGUpID0+IG5vZGUudmFsdWUucm91dGVDb25maWcgPT09IHJlc3VsdE5vZGUudmFsdWUucm91dGVDb25maWcsXG4gICAgKTtcbiAgICBpZiAoZHVwbGljYXRlRW1wdHlQYXRoTm9kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkdXBsaWNhdGVFbXB0eVBhdGhOb2RlLmNoaWxkcmVuLnB1c2goLi4ubm9kZS5jaGlsZHJlbik7XG4gICAgICBtZXJnZWROb2Rlcy5hZGQoZHVwbGljYXRlRW1wdHlQYXRoTm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfVxuICAvLyBGb3IgZWFjaCBub2RlIHdoaWNoIGhhcyBjaGlsZHJlbiBmcm9tIG11bHRpcGxlIHNvdXJjZXMsIHdlIG5lZWQgdG8gcmVjb21wdXRlIGEgbmV3IGBUcmVlTm9kZWBcbiAgLy8gYnkgYWxzbyBtZXJnaW5nIHRob3NlIGNoaWxkcmVuLiBUaGlzIGlzIG5lY2Vzc2FyeSB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBlbXB0eSBwYXRoIGNvbmZpZ3NcbiAgLy8gaW4gYSByb3cuIFB1dCBhbm90aGVyIHdheTogd2hlbmV2ZXIgd2UgY29tYmluZSBjaGlsZHJlbiBvZiB0d28gbm9kZXMsIHdlIG5lZWQgdG8gYWxzbyBjaGVja1xuICAvLyBpZiBhbnkgb2YgdGhvc2UgY2hpbGRyZW4gY2FuIGJlIGNvbWJpbmVkIGludG8gYSBzaW5nbGUgbm9kZSBhcyB3ZWxsLlxuICBmb3IgKGNvbnN0IG1lcmdlZE5vZGUgb2YgbWVyZ2VkTm9kZXMpIHtcbiAgICBjb25zdCBtZXJnZWRDaGlsZHJlbiA9IG1lcmdlRW1wdHlQYXRoTWF0Y2hlcyhtZXJnZWROb2RlLmNoaWxkcmVuKTtcbiAgICByZXN1bHQucHVzaChuZXcgVHJlZU5vZGUobWVyZ2VkTm9kZS52YWx1ZSwgbWVyZ2VkQ2hpbGRyZW4pKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0LmZpbHRlcigobikgPT4gIW1lcmdlZE5vZGVzLmhhcyhuKSk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrT3V0bGV0TmFtZVVuaXF1ZW5lc3Mobm9kZXM6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+W10pOiB2b2lkIHtcbiAgY29uc3QgbmFtZXM6IHtbazogc3RyaW5nXTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdH0gPSB7fTtcbiAgbm9kZXMuZm9yRWFjaCgobikgPT4ge1xuICAgIGNvbnN0IHJvdXRlV2l0aFNhbWVPdXRsZXROYW1lID0gbmFtZXNbbi52YWx1ZS5vdXRsZXRdO1xuICAgIGlmIChyb3V0ZVdpdGhTYW1lT3V0bGV0TmFtZSkge1xuICAgICAgY29uc3QgcCA9IHJvdXRlV2l0aFNhbWVPdXRsZXROYW1lLnVybC5tYXAoKHMpID0+IHMudG9TdHJpbmcoKSkuam9pbignLycpO1xuICAgICAgY29uc3QgYyA9IG4udmFsdWUudXJsLm1hcCgocykgPT4gcy50b1N0cmluZygpKS5qb2luKCcvJyk7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlRXT19TRUdNRU5UU19XSVRIX1NBTUVfT1VUTEVULFxuICAgICAgICAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJlxuICAgICAgICAgIGBUd28gc2VnbWVudHMgY2Fubm90IGhhdmUgdGhlIHNhbWUgb3V0bGV0IG5hbWU6ICcke3B9JyBhbmQgJyR7Y30nLmAsXG4gICAgICApO1xuICAgIH1cbiAgICBuYW1lc1tuLnZhbHVlLm91dGxldF0gPSBuLnZhbHVlO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0RGF0YShyb3V0ZTogUm91dGUpOiBEYXRhIHtcbiAgcmV0dXJuIHJvdXRlLmRhdGEgfHwge307XG59XG5cbmZ1bmN0aW9uIGdldFJlc29sdmUocm91dGU6IFJvdXRlKTogUmVzb2x2ZURhdGEge1xuICByZXR1cm4gcm91dGUucmVzb2x2ZSB8fCB7fTtcbn1cbiJdfQ==