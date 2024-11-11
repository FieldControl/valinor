/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
import { emptyPathMatch, match, matchWithChecks, noLeftoversInUrl, split, } from './utils/config_matching';
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
        return this.match(rootSegmentGroup).pipe(map(({ children, rootSnapshot }) => {
            const rootNode = new TreeNode(rootSnapshot, children);
            const routeState = new RouterStateSnapshot('', rootNode);
            const tree = createUrlTreeFromSnapshot(rootSnapshot, [], this.urlTree.queryParams, this.urlTree.fragment);
            // https://github.com/angular/angular/issues/47307
            // Creating the tree stringifies the query params
            // We don't want to do this here so reassign them to the original.
            tree.queryParams = this.urlTree.queryParams;
            routeState.url = this.urlSerializer.serialize(tree);
            return { state: routeState, tree };
        }));
    }
    match(rootSegmentGroup) {
        // Use Object.freeze to prevent readers of the Router state from modifying it outside
        // of a navigation, resulting in the router being out of sync with the browser.
        const rootSnapshot = new ActivatedRouteSnapshot([], Object.freeze({}), Object.freeze({ ...this.urlTree.queryParams }), this.urlTree.fragment, Object.freeze({}), PRIMARY_OUTLET, this.rootComponentType, null, {});
        return this.processSegmentGroup(this.injector, this.config, rootSegmentGroup, PRIMARY_OUTLET, rootSnapshot).pipe(map((children) => {
            return { children, rootSnapshot };
        }), catchError((e) => {
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
    processSegmentGroup(injector, config, segmentGroup, outlet, parentRoute) {
        if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
            return this.processChildren(injector, config, segmentGroup, parentRoute);
        }
        return this.processSegment(injector, config, segmentGroup, segmentGroup.segments, outlet, true, parentRoute).pipe(map((child) => (child instanceof TreeNode ? [child] : [])));
    }
    /**
     * Matches every child outlet in the `segmentGroup` to a `Route` in the config. Returns `null` if
     * we cannot find a match for _any_ of the children.
     *
     * @param config - The `Routes` to match against
     * @param segmentGroup - The `UrlSegmentGroup` whose children need to be matched against the
     *     config.
     */
    processChildren(injector, config, segmentGroup, parentRoute) {
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
            return this.processSegmentGroup(injector, sortedConfig, child, childOutlet, parentRoute);
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
    processSegment(injector, routes, segmentGroup, segments, outlet, allowRedirects, parentRoute) {
        return from(routes).pipe(concatMap((r) => {
            return this.processSegmentAgainstRoute(r._injector ?? injector, routes, r, segmentGroup, segments, outlet, allowRedirects, parentRoute).pipe(catchError((e) => {
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
    processSegmentAgainstRoute(injector, routes, route, rawSegment, segments, outlet, allowRedirects, parentRoute) {
        // We allow matches to empty paths when the outlets differ so we can match a url like `/(b:b)` to
        // a config like
        // * `{path: '', children: [{path: 'b', outlet: 'b'}]}`
        // or even
        // * `{path: '', outlet: 'a', children: [{path: 'b', outlet: 'b'}]`
        //
        // The exception here is when the segment outlet is for the primary outlet. This would
        // result in a match inside the named outlet because all children there are written as primary
        // outlets. So we need to prevent child named outlet matches in a url like `/b` in a config like
        // * `{path: '', outlet: 'x' children: [{path: 'b'}]}`
        // This should only match if the url is `/(x:b)`.
        if (getOutlet(route) !== outlet &&
            (outlet === PRIMARY_OUTLET || !emptyPathMatch(rawSegment, segments, route))) {
            return noMatch(rawSegment);
        }
        if (route.redirectTo === undefined) {
            return this.matchSegmentAgainstRoute(injector, rawSegment, route, segments, outlet, parentRoute);
        }
        if (this.allowRedirects && allowRedirects) {
            return this.expandSegmentAgainstRouteUsingRedirect(injector, rawSegment, routes, route, segments, outlet, parentRoute);
        }
        return noMatch(rawSegment);
    }
    expandSegmentAgainstRouteUsingRedirect(injector, segmentGroup, routes, route, segments, outlet, parentRoute) {
        const { matched, parameters, consumedSegments, positionalParamSegments, remainingSegments } = match(segmentGroup, route, segments);
        if (!matched)
            return noMatch(segmentGroup);
        // TODO(atscott): Move all of this under an if(ngDevMode) as a breaking change and allow stack
        // size exceeded in production
        if (typeof route.redirectTo === 'string' && route.redirectTo[0] === '/') {
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
        const currentSnapshot = new ActivatedRouteSnapshot(segments, parameters, Object.freeze({ ...this.urlTree.queryParams }), this.urlTree.fragment, getData(route), getOutlet(route), route.component ?? route._loadedComponent ?? null, route, getResolve(route));
        const inherited = getInherited(currentSnapshot, parentRoute, this.paramsInheritanceStrategy);
        currentSnapshot.params = Object.freeze(inherited.params);
        currentSnapshot.data = Object.freeze(inherited.data);
        const newTree = this.applyRedirects.applyRedirectCommands(consumedSegments, route.redirectTo, positionalParamSegments, currentSnapshot, injector);
        return this.applyRedirects.lineralizeSegments(route, newTree).pipe(mergeMap((newSegments) => {
            return this.processSegment(injector, routes, segmentGroup, newSegments.concat(remainingSegments), outlet, false, parentRoute);
        }));
    }
    matchSegmentAgainstRoute(injector, rawSegment, route, segments, outlet, parentRoute) {
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
                const { parameters, consumedSegments, remainingSegments } = result;
                const snapshot = new ActivatedRouteSnapshot(consumedSegments, parameters, Object.freeze({ ...this.urlTree.queryParams }), this.urlTree.fragment, getData(route), getOutlet(route), route.component ?? route._loadedComponent ?? null, route, getResolve(route));
                const inherited = getInherited(snapshot, parentRoute, this.paramsInheritanceStrategy);
                snapshot.params = Object.freeze(inherited.params);
                snapshot.data = Object.freeze(inherited.data);
                const { segmentGroup, slicedSegments } = split(rawSegment, consumedSegments, remainingSegments, childConfig);
                if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
                    return this.processChildren(childInjector, childConfig, segmentGroup, snapshot).pipe(map((children) => {
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
                return this.processSegment(childInjector, childConfig, segmentGroup, slicedSegments, matchedOnOutlet ? PRIMARY_OUTLET : outlet, true, snapshot).pipe(map((child) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb2duaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yZWNvZ25pemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUE0QixhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZGLE9BQU8sRUFBQyxJQUFJLEVBQWMsRUFBRSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzFDLE9BQU8sRUFDTCxVQUFVLEVBQ1YsU0FBUyxFQUNULGNBQWMsRUFDZCxLQUFLLEVBQ0wsSUFBSSxFQUNKLEdBQUcsRUFDSCxRQUFRLEVBQ1IsSUFBSSxFQUNKLFNBQVMsRUFDVCxHQUFHLEdBQ0osTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QixPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDbkcsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFHNUQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFFMUQsT0FBTyxFQUNMLHNCQUFzQixFQUN0QixZQUFZLEVBRVosbUJBQW1CLEdBQ3BCLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUV4QyxPQUFPLEVBQUMsU0FBUyxFQUFFLHFCQUFxQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDaEUsT0FBTyxFQUNMLGNBQWMsRUFDZCxLQUFLLEVBQ0wsZUFBZSxFQUNmLGdCQUFnQixFQUNoQixLQUFLLEdBQ04sTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztB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QUMsR0FBRyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekQsTUFBTSxJQUFJLFlBQVksNERBRXBCLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQztnQkFDN0MsbURBQW1ELENBQUMsVUFBVSxDQUFDLElBQUksQ0FDdEUsQ0FBQztRQUNKLENBQUM7UUFDRCxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2xDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLEtBQVk7SUFDM0IsT0FBTyxLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUMxQixDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsS0FBWTtJQUM5QixPQUFPLEtBQUssQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO0FBQzdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7RW52aXJvbm1lbnRJbmplY3RvciwgVHlwZSwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7ZnJvbSwgT2JzZXJ2YWJsZSwgb2Z9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgY2F0Y2hFcnJvcixcbiAgY29uY2F0TWFwLFxuICBkZWZhdWx0SWZFbXB0eSxcbiAgZmlyc3QsXG4gIGxhc3QsXG4gIG1hcCxcbiAgbWVyZ2VNYXAsXG4gIHNjYW4sXG4gIHN3aXRjaE1hcCxcbiAgdGFwLFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7QWJzb2x1dGVSZWRpcmVjdCwgQXBwbHlSZWRpcmVjdHMsIGNhbkxvYWRGYWlscywgbm9NYXRjaCwgTm9NYXRjaH0gZnJvbSAnLi9hcHBseV9yZWRpcmVjdHMnO1xuaW1wb3J0IHtjcmVhdGVVcmxUcmVlRnJvbVNuYXBzaG90fSBmcm9tICcuL2NyZWF0ZV91cmxfdHJlZSc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7RGF0YSwgTG9hZGVkUm91dGVyQ29uZmlnLCBSZXNvbHZlRGF0YSwgUm91dGUsIFJvdXRlc30gZnJvbSAnLi9tb2RlbHMnO1xuaW1wb3J0IHtydW5DYW5Mb2FkR3VhcmRzfSBmcm9tICcuL29wZXJhdG9ycy9jaGVja19ndWFyZHMnO1xuaW1wb3J0IHtSb3V0ZXJDb25maWdMb2FkZXJ9IGZyb20gJy4vcm91dGVyX2NvbmZpZ19sb2FkZXInO1xuaW1wb3J0IHtcbiAgQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgZ2V0SW5oZXJpdGVkLFxuICBQYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5LFxuICBSb3V0ZXJTdGF0ZVNuYXBzaG90LFxufSBmcm9tICcuL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge1BSSU1BUllfT1VUTEVUfSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQge1VybFNlZ21lbnQsIFVybFNlZ21lbnRHcm91cCwgVXJsU2VyaWFsaXplciwgVXJsVHJlZX0gZnJvbSAnLi91cmxfdHJlZSc7XG5pbXBvcnQge2dldE91dGxldCwgc29ydEJ5TWF0Y2hpbmdPdXRsZXRzfSBmcm9tICcuL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge1xuICBlbXB0eVBhdGhNYXRjaCxcbiAgbWF0Y2gsXG4gIG1hdGNoV2l0aENoZWNrcyxcbiAgbm9MZWZ0b3ZlcnNJblVybCxcbiAgc3BsaXQsXG59IGZyb20gJy4vdXRpbHMvY29uZmlnX21hdGNoaW5nJztcbmltcG9ydCB7VHJlZU5vZGV9IGZyb20gJy4vdXRpbHMvdHJlZSc7XG5pbXBvcnQge2lzRW1wdHlFcnJvcn0gZnJvbSAnLi91dGlscy90eXBlX2d1YXJkcyc7XG5cbi8qKlxuICogQ2xhc3MgdXNlZCB0byBpbmRpY2F0ZSB0aGVyZSB3ZXJlIG5vIGFkZGl0aW9uYWwgcm91dGUgY29uZmlnIG1hdGNoZXMgYnV0IHRoYXQgYWxsIHNlZ21lbnRzIG9mXG4gKiB0aGUgVVJMIHdlcmUgY29uc3VtZWQgZHVyaW5nIG1hdGNoaW5nIHNvIHRoZSByb3V0ZSB3YXMgVVJMIG1hdGNoZWQuIFdoZW4gdGhpcyBoYXBwZW5zLCB3ZSBzdGlsbFxuICogdHJ5IHRvIG1hdGNoIGNoaWxkIGNvbmZpZ3MgaW4gY2FzZSB0aGVyZSBhcmUgZW1wdHkgcGF0aCBjaGlsZHJlbi5cbiAqL1xuY2xhc3MgTm9MZWZ0b3ZlcnNJblVybCB7fVxuXG5leHBvcnQgZnVuY3Rpb24gcmVjb2duaXplKFxuICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3RvcixcbiAgY29uZmlnTG9hZGVyOiBSb3V0ZXJDb25maWdMb2FkZXIsXG4gIHJvb3RDb21wb25lbnRUeXBlOiBUeXBlPGFueT4gfCBudWxsLFxuICBjb25maWc6IFJvdXRlcyxcbiAgdXJsVHJlZTogVXJsVHJlZSxcbiAgdXJsU2VyaWFsaXplcjogVXJsU2VyaWFsaXplcixcbiAgcGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneTogUGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSA9ICdlbXB0eU9ubHknLFxuKTogT2JzZXJ2YWJsZTx7c3RhdGU6IFJvdXRlclN0YXRlU25hcHNob3Q7IHRyZWU6IFVybFRyZWV9PiB7XG4gIHJldHVybiBuZXcgUmVjb2duaXplcihcbiAgICBpbmplY3RvcixcbiAgICBjb25maWdMb2FkZXIsXG4gICAgcm9vdENvbXBvbmVudFR5cGUsXG4gICAgY29uZmlnLFxuICAgIHVybFRyZWUsXG4gICAgcGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSxcbiAgICB1cmxTZXJpYWxpemVyLFxuICApLnJlY29nbml6ZSgpO1xufVxuXG5jb25zdCBNQVhfQUxMT1dFRF9SRURJUkVDVFMgPSAzMTtcblxuZXhwb3J0IGNsYXNzIFJlY29nbml6ZXIge1xuICBwcml2YXRlIGFwcGx5UmVkaXJlY3RzID0gbmV3IEFwcGx5UmVkaXJlY3RzKHRoaXMudXJsU2VyaWFsaXplciwgdGhpcy51cmxUcmVlKTtcbiAgcHJpdmF0ZSBhYnNvbHV0ZVJlZGlyZWN0Q291bnQgPSAwO1xuICBhbGxvd1JlZGlyZWN0cyA9IHRydWU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3RvcixcbiAgICBwcml2YXRlIGNvbmZpZ0xvYWRlcjogUm91dGVyQ29uZmlnTG9hZGVyLFxuICAgIHByaXZhdGUgcm9vdENvbXBvbmVudFR5cGU6IFR5cGU8YW55PiB8IG51bGwsXG4gICAgcHJpdmF0ZSBjb25maWc6IFJvdXRlcyxcbiAgICBwcml2YXRlIHVybFRyZWU6IFVybFRyZWUsXG4gICAgcHJpdmF0ZSBwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5OiBQYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5LFxuICAgIHByaXZhdGUgcmVhZG9ubHkgdXJsU2VyaWFsaXplcjogVXJsU2VyaWFsaXplcixcbiAgKSB7fVxuXG4gIHByaXZhdGUgbm9NYXRjaEVycm9yKGU6IE5vTWF0Y2gpOiBSdW50aW1lRXJyb3I8UnVudGltZUVycm9yQ29kZS5OT19NQVRDSD4ge1xuICAgIHJldHVybiBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5OT19NQVRDSCxcbiAgICAgIHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZVxuICAgICAgICA/IGBDYW5ub3QgbWF0Y2ggYW55IHJvdXRlcy4gVVJMIFNlZ21lbnQ6ICcke2Uuc2VnbWVudEdyb3VwfSdgXG4gICAgICAgIDogYCcke2Uuc2VnbWVudEdyb3VwfSdgLFxuICAgICk7XG4gIH1cblxuICByZWNvZ25pemUoKTogT2JzZXJ2YWJsZTx7c3RhdGU6IFJvdXRlclN0YXRlU25hcHNob3Q7IHRyZWU6IFVybFRyZWV9PiB7XG4gICAgY29uc3Qgcm9vdFNlZ21lbnRHcm91cCA9IHNwbGl0KHRoaXMudXJsVHJlZS5yb290LCBbXSwgW10sIHRoaXMuY29uZmlnKS5zZWdtZW50R3JvdXA7XG5cbiAgICByZXR1cm4gdGhpcy5tYXRjaChyb290U2VnbWVudEdyb3VwKS5waXBlKFxuICAgICAgbWFwKCh7Y2hpbGRyZW4sIHJvb3RTbmFwc2hvdH0pID0+IHtcbiAgICAgICAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgVHJlZU5vZGUocm9vdFNuYXBzaG90LCBjaGlsZHJlbik7XG4gICAgICAgIGNvbnN0IHJvdXRlU3RhdGUgPSBuZXcgUm91dGVyU3RhdGVTbmFwc2hvdCgnJywgcm9vdE5vZGUpO1xuICAgICAgICBjb25zdCB0cmVlID0gY3JlYXRlVXJsVHJlZUZyb21TbmFwc2hvdChcbiAgICAgICAgICByb290U25hcHNob3QsXG4gICAgICAgICAgW10sXG4gICAgICAgICAgdGhpcy51cmxUcmVlLnF1ZXJ5UGFyYW1zLFxuICAgICAgICAgIHRoaXMudXJsVHJlZS5mcmFnbWVudCxcbiAgICAgICAgKTtcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvNDczMDdcbiAgICAgICAgLy8gQ3JlYXRpbmcgdGhlIHRyZWUgc3RyaW5naWZpZXMgdGhlIHF1ZXJ5IHBhcmFtc1xuICAgICAgICAvLyBXZSBkb24ndCB3YW50IHRvIGRvIHRoaXMgaGVyZSBzbyByZWFzc2lnbiB0aGVtIHRvIHRoZSBvcmlnaW5hbC5cbiAgICAgICAgdHJlZS5xdWVyeVBhcmFtcyA9IHRoaXMudXJsVHJlZS5xdWVyeVBhcmFtcztcbiAgICAgICAgcm91dGVTdGF0ZS51cmwgPSB0aGlzLnVybFNlcmlhbGl6ZXIuc2VyaWFsaXplKHRyZWUpO1xuICAgICAgICByZXR1cm4ge3N0YXRlOiByb3V0ZVN0YXRlLCB0cmVlfTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIG1hdGNoKHJvb3RTZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCk6IE9ic2VydmFibGU8e1xuICAgIGNoaWxkcmVuOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdO1xuICAgIHJvb3RTbmFwc2hvdDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdDtcbiAgfT4ge1xuICAgIC8vIFVzZSBPYmplY3QuZnJlZXplIHRvIHByZXZlbnQgcmVhZGVycyBvZiB0aGUgUm91dGVyIHN0YXRlIGZyb20gbW9kaWZ5aW5nIGl0IG91dHNpZGVcbiAgICAvLyBvZiBhIG5hdmlnYXRpb24sIHJlc3VsdGluZyBpbiB0aGUgcm91dGVyIGJlaW5nIG91dCBvZiBzeW5jIHdpdGggdGhlIGJyb3dzZXIuXG4gICAgY29uc3Qgcm9vdFNuYXBzaG90ID0gbmV3IEFjdGl2YXRlZFJvdXRlU25hcHNob3QoXG4gICAgICBbXSxcbiAgICAgIE9iamVjdC5mcmVlemUoe30pLFxuICAgICAgT2JqZWN0LmZyZWV6ZSh7Li4udGhpcy51cmxUcmVlLnF1ZXJ5UGFyYW1zfSksXG4gICAgICB0aGlzLnVybFRyZWUuZnJhZ21lbnQsXG4gICAgICBPYmplY3QuZnJlZXplKHt9KSxcbiAgICAgIFBSSU1BUllfT1VUTEVULFxuICAgICAgdGhpcy5yb290Q29tcG9uZW50VHlwZSxcbiAgICAgIG51bGwsXG4gICAgICB7fSxcbiAgICApO1xuICAgIHJldHVybiB0aGlzLnByb2Nlc3NTZWdtZW50R3JvdXAoXG4gICAgICB0aGlzLmluamVjdG9yLFxuICAgICAgdGhpcy5jb25maWcsXG4gICAgICByb290U2VnbWVudEdyb3VwLFxuICAgICAgUFJJTUFSWV9PVVRMRVQsXG4gICAgICByb290U25hcHNob3QsXG4gICAgKS5waXBlKFxuICAgICAgbWFwKChjaGlsZHJlbikgPT4ge1xuICAgICAgICByZXR1cm4ge2NoaWxkcmVuLCByb290U25hcHNob3R9O1xuICAgICAgfSksXG4gICAgICBjYXRjaEVycm9yKChlOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBBYnNvbHV0ZVJlZGlyZWN0KSB7XG4gICAgICAgICAgdGhpcy51cmxUcmVlID0gZS51cmxUcmVlO1xuICAgICAgICAgIHJldHVybiB0aGlzLm1hdGNoKGUudXJsVHJlZS5yb290KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIE5vTWF0Y2gpIHtcbiAgICAgICAgICB0aHJvdyB0aGlzLm5vTWF0Y2hFcnJvcihlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IGU7XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgcHJvY2Vzc1NlZ21lbnRHcm91cChcbiAgICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3RvcixcbiAgICBjb25maWc6IFJvdXRlW10sXG4gICAgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsXG4gICAgb3V0bGV0OiBzdHJpbmcsXG4gICAgcGFyZW50Um91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXG4gICk6IE9ic2VydmFibGU8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD5bXT4ge1xuICAgIGlmIChzZWdtZW50R3JvdXAuc2VnbWVudHMubGVuZ3RoID09PSAwICYmIHNlZ21lbnRHcm91cC5oYXNDaGlsZHJlbigpKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9jZXNzQ2hpbGRyZW4oaW5qZWN0b3IsIGNvbmZpZywgc2VnbWVudEdyb3VwLCBwYXJlbnRSb3V0ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucHJvY2Vzc1NlZ21lbnQoXG4gICAgICBpbmplY3RvcixcbiAgICAgIGNvbmZpZyxcbiAgICAgIHNlZ21lbnRHcm91cCxcbiAgICAgIHNlZ21lbnRHcm91cC5zZWdtZW50cyxcbiAgICAgIG91dGxldCxcbiAgICAgIHRydWUsXG4gICAgICBwYXJlbnRSb3V0ZSxcbiAgICApLnBpcGUobWFwKChjaGlsZCkgPT4gKGNoaWxkIGluc3RhbmNlb2YgVHJlZU5vZGUgPyBbY2hpbGRdIDogW10pKSk7XG4gIH1cblxuICAvKipcbiAgICogTWF0Y2hlcyBldmVyeSBjaGlsZCBvdXRsZXQgaW4gdGhlIGBzZWdtZW50R3JvdXBgIHRvIGEgYFJvdXRlYCBpbiB0aGUgY29uZmlnLiBSZXR1cm5zIGBudWxsYCBpZlxuICAgKiB3ZSBjYW5ub3QgZmluZCBhIG1hdGNoIGZvciBfYW55XyBvZiB0aGUgY2hpbGRyZW4uXG4gICAqXG4gICAqIEBwYXJhbSBjb25maWcgLSBUaGUgYFJvdXRlc2AgdG8gbWF0Y2ggYWdhaW5zdFxuICAgKiBAcGFyYW0gc2VnbWVudEdyb3VwIC0gVGhlIGBVcmxTZWdtZW50R3JvdXBgIHdob3NlIGNoaWxkcmVuIG5lZWQgdG8gYmUgbWF0Y2hlZCBhZ2FpbnN0IHRoZVxuICAgKiAgICAgY29uZmlnLlxuICAgKi9cbiAgcHJvY2Vzc0NoaWxkcmVuKFxuICAgIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yLFxuICAgIGNvbmZpZzogUm91dGVbXSxcbiAgICBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCxcbiAgICBwYXJlbnRSb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgKTogT2JzZXJ2YWJsZTxUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdPiB7XG4gICAgLy8gRXhwYW5kIG91dGxldHMgb25lIGF0IGEgdGltZSwgc3RhcnRpbmcgd2l0aCB0aGUgcHJpbWFyeSBvdXRsZXQuIFdlIG5lZWQgdG8gZG8gaXQgdGhpcyB3YXlcbiAgICAvLyBiZWNhdXNlIGFuIGFic29sdXRlIHJlZGlyZWN0IGZyb20gdGhlIHByaW1hcnkgb3V0bGV0IHRha2VzIHByZWNlZGVuY2UuXG4gICAgY29uc3QgY2hpbGRPdXRsZXRzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgT2JqZWN0LmtleXMoc2VnbWVudEdyb3VwLmNoaWxkcmVuKSkge1xuICAgICAgaWYgKGNoaWxkID09PSAncHJpbWFyeScpIHtcbiAgICAgICAgY2hpbGRPdXRsZXRzLnVuc2hpZnQoY2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hpbGRPdXRsZXRzLnB1c2goY2hpbGQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZnJvbShjaGlsZE91dGxldHMpLnBpcGUoXG4gICAgICBjb25jYXRNYXAoKGNoaWxkT3V0bGV0KSA9PiB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gc2VnbWVudEdyb3VwLmNoaWxkcmVuW2NoaWxkT3V0bGV0XTtcbiAgICAgICAgLy8gU29ydCB0aGUgY29uZmlnIHNvIHRoYXQgcm91dGVzIHdpdGggb3V0bGV0cyB0aGF0IG1hdGNoIHRoZSBvbmUgYmVpbmcgYWN0aXZhdGVkXG4gICAgICAgIC8vIGFwcGVhciBmaXJzdCwgZm9sbG93ZWQgYnkgcm91dGVzIGZvciBvdGhlciBvdXRsZXRzLCB3aGljaCBtaWdodCBtYXRjaCBpZiB0aGV5IGhhdmVcbiAgICAgICAgLy8gYW4gZW1wdHkgcGF0aC5cbiAgICAgICAgY29uc3Qgc29ydGVkQ29uZmlnID0gc29ydEJ5TWF0Y2hpbmdPdXRsZXRzKGNvbmZpZywgY2hpbGRPdXRsZXQpO1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzU2VnbWVudEdyb3VwKGluamVjdG9yLCBzb3J0ZWRDb25maWcsIGNoaWxkLCBjaGlsZE91dGxldCwgcGFyZW50Um91dGUpO1xuICAgICAgfSksXG4gICAgICBzY2FuKChjaGlsZHJlbiwgb3V0bGV0Q2hpbGRyZW4pID0+IHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaCguLi5vdXRsZXRDaGlsZHJlbik7XG4gICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICAgIH0pLFxuICAgICAgZGVmYXVsdElmRW1wdHkobnVsbCBhcyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdIHwgbnVsbCksXG4gICAgICBsYXN0KCksXG4gICAgICBtZXJnZU1hcCgoY2hpbGRyZW4pID0+IHtcbiAgICAgICAgaWYgKGNoaWxkcmVuID09PSBudWxsKSByZXR1cm4gbm9NYXRjaChzZWdtZW50R3JvdXApO1xuICAgICAgICAvLyBCZWNhdXNlIHdlIG1heSBoYXZlIG1hdGNoZWQgdHdvIG91dGxldHMgdG8gdGhlIHNhbWUgZW1wdHkgcGF0aCBzZWdtZW50LCB3ZSBjYW4gaGF2ZVxuICAgICAgICAvLyBtdWx0aXBsZSBhY3RpdmF0ZWQgcmVzdWx0cyBmb3IgdGhlIHNhbWUgb3V0bGV0LiBXZSBzaG91bGQgbWVyZ2UgdGhlIGNoaWxkcmVuIG9mXG4gICAgICAgIC8vIHRoZXNlIHJlc3VsdHMgc28gdGhlIGZpbmFsIHJldHVybiB2YWx1ZSBpcyBvbmx5IG9uZSBgVHJlZU5vZGVgIHBlciBvdXRsZXQuXG4gICAgICAgIGNvbnN0IG1lcmdlZENoaWxkcmVuID0gbWVyZ2VFbXB0eVBhdGhNYXRjaGVzKGNoaWxkcmVuKTtcbiAgICAgICAgaWYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkge1xuICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIHJlYWxseSBuZXZlciBoYXBwZW4gLSB3ZSBhcmUgb25seSB0YWtpbmcgdGhlIGZpcnN0IG1hdGNoIGZvciBlYWNoXG4gICAgICAgICAgLy8gb3V0bGV0IGFuZCBtZXJnZSB0aGUgZW1wdHkgcGF0aCBtYXRjaGVzLlxuICAgICAgICAgIGNoZWNrT3V0bGV0TmFtZVVuaXF1ZW5lc3MobWVyZ2VkQ2hpbGRyZW4pO1xuICAgICAgICB9XG4gICAgICAgIHNvcnRBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90cyhtZXJnZWRDaGlsZHJlbik7XG4gICAgICAgIHJldHVybiBvZihtZXJnZWRDaGlsZHJlbik7XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgcHJvY2Vzc1NlZ21lbnQoXG4gICAgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IsXG4gICAgcm91dGVzOiBSb3V0ZVtdLFxuICAgIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLFxuICAgIHNlZ21lbnRzOiBVcmxTZWdtZW50W10sXG4gICAgb3V0bGV0OiBzdHJpbmcsXG4gICAgYWxsb3dSZWRpcmVjdHM6IGJvb2xlYW4sXG4gICAgcGFyZW50Um91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXG4gICk6IE9ic2VydmFibGU8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4gfCBOb0xlZnRvdmVyc0luVXJsPiB7XG4gICAgcmV0dXJuIGZyb20ocm91dGVzKS5waXBlKFxuICAgICAgY29uY2F0TWFwKChyKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NTZWdtZW50QWdhaW5zdFJvdXRlKFxuICAgICAgICAgIHIuX2luamVjdG9yID8/IGluamVjdG9yLFxuICAgICAgICAgIHJvdXRlcyxcbiAgICAgICAgICByLFxuICAgICAgICAgIHNlZ21lbnRHcm91cCxcbiAgICAgICAgICBzZWdtZW50cyxcbiAgICAgICAgICBvdXRsZXQsXG4gICAgICAgICAgYWxsb3dSZWRpcmVjdHMsXG4gICAgICAgICAgcGFyZW50Um91dGUsXG4gICAgICAgICkucGlwZShcbiAgICAgICAgICBjYXRjaEVycm9yKChlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgTm9NYXRjaCkge1xuICAgICAgICAgICAgICByZXR1cm4gb2YobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgfSksXG4gICAgICBmaXJzdCgoeCk6IHggaXMgVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4gfCBOb0xlZnRvdmVyc0luVXJsID0+ICEheCksXG4gICAgICBjYXRjaEVycm9yKChlKSA9PiB7XG4gICAgICAgIGlmIChpc0VtcHR5RXJyb3IoZSkpIHtcbiAgICAgICAgICBpZiAobm9MZWZ0b3ZlcnNJblVybChzZWdtZW50R3JvdXAsIHNlZ21lbnRzLCBvdXRsZXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gb2YobmV3IE5vTGVmdG92ZXJzSW5VcmwoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBub01hdGNoKHNlZ21lbnRHcm91cCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBwcm9jZXNzU2VnbWVudEFnYWluc3RSb3V0ZShcbiAgICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3RvcixcbiAgICByb3V0ZXM6IFJvdXRlW10sXG4gICAgcm91dGU6IFJvdXRlLFxuICAgIHJhd1NlZ21lbnQ6IFVybFNlZ21lbnRHcm91cCxcbiAgICBzZWdtZW50czogVXJsU2VnbWVudFtdLFxuICAgIG91dGxldDogc3RyaW5nLFxuICAgIGFsbG93UmVkaXJlY3RzOiBib29sZWFuLFxuICAgIHBhcmVudFJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LFxuICApOiBPYnNlcnZhYmxlPFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+IHwgTm9MZWZ0b3ZlcnNJblVybD4ge1xuICAgIC8vIFdlIGFsbG93IG1hdGNoZXMgdG8gZW1wdHkgcGF0aHMgd2hlbiB0aGUgb3V0bGV0cyBkaWZmZXIgc28gd2UgY2FuIG1hdGNoIGEgdXJsIGxpa2UgYC8oYjpiKWAgdG9cbiAgICAvLyBhIGNvbmZpZyBsaWtlXG4gICAgLy8gKiBge3BhdGg6ICcnLCBjaGlsZHJlbjogW3twYXRoOiAnYicsIG91dGxldDogJ2InfV19YFxuICAgIC8vIG9yIGV2ZW5cbiAgICAvLyAqIGB7cGF0aDogJycsIG91dGxldDogJ2EnLCBjaGlsZHJlbjogW3twYXRoOiAnYicsIG91dGxldDogJ2InfV1gXG4gICAgLy9cbiAgICAvLyBUaGUgZXhjZXB0aW9uIGhlcmUgaXMgd2hlbiB0aGUgc2VnbWVudCBvdXRsZXQgaXMgZm9yIHRoZSBwcmltYXJ5IG91dGxldC4gVGhpcyB3b3VsZFxuICAgIC8vIHJlc3VsdCBpbiBhIG1hdGNoIGluc2lkZSB0aGUgbmFtZWQgb3V0bGV0IGJlY2F1c2UgYWxsIGNoaWxkcmVuIHRoZXJlIGFyZSB3cml0dGVuIGFzIHByaW1hcnlcbiAgICAvLyBvdXRsZXRzLiBTbyB3ZSBuZWVkIHRvIHByZXZlbnQgY2hpbGQgbmFtZWQgb3V0bGV0IG1hdGNoZXMgaW4gYSB1cmwgbGlrZSBgL2JgIGluIGEgY29uZmlnIGxpa2VcbiAgICAvLyAqIGB7cGF0aDogJycsIG91dGxldDogJ3gnIGNoaWxkcmVuOiBbe3BhdGg6ICdiJ31dfWBcbiAgICAvLyBUaGlzIHNob3VsZCBvbmx5IG1hdGNoIGlmIHRoZSB1cmwgaXMgYC8oeDpiKWAuXG4gICAgaWYgKFxuICAgICAgZ2V0T3V0bGV0KHJvdXRlKSAhPT0gb3V0bGV0ICYmXG4gICAgICAob3V0bGV0ID09PSBQUklNQVJZX09VVExFVCB8fCAhZW1wdHlQYXRoTWF0Y2gocmF3U2VnbWVudCwgc2VnbWVudHMsIHJvdXRlKSlcbiAgICApIHtcbiAgICAgIHJldHVybiBub01hdGNoKHJhd1NlZ21lbnQpO1xuICAgIH1cblxuICAgIGlmIChyb3V0ZS5yZWRpcmVjdFRvID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hdGNoU2VnbWVudEFnYWluc3RSb3V0ZShcbiAgICAgICAgaW5qZWN0b3IsXG4gICAgICAgIHJhd1NlZ21lbnQsXG4gICAgICAgIHJvdXRlLFxuICAgICAgICBzZWdtZW50cyxcbiAgICAgICAgb3V0bGV0LFxuICAgICAgICBwYXJlbnRSb3V0ZSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuYWxsb3dSZWRpcmVjdHMgJiYgYWxsb3dSZWRpcmVjdHMpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4cGFuZFNlZ21lbnRBZ2FpbnN0Um91dGVVc2luZ1JlZGlyZWN0KFxuICAgICAgICBpbmplY3RvcixcbiAgICAgICAgcmF3U2VnbWVudCxcbiAgICAgICAgcm91dGVzLFxuICAgICAgICByb3V0ZSxcbiAgICAgICAgc2VnbWVudHMsXG4gICAgICAgIG91dGxldCxcbiAgICAgICAgcGFyZW50Um91dGUsXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBub01hdGNoKHJhd1NlZ21lbnQpO1xuICB9XG5cbiAgcHJpdmF0ZSBleHBhbmRTZWdtZW50QWdhaW5zdFJvdXRlVXNpbmdSZWRpcmVjdChcbiAgICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3RvcixcbiAgICBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCxcbiAgICByb3V0ZXM6IFJvdXRlW10sXG4gICAgcm91dGU6IFJvdXRlLFxuICAgIHNlZ21lbnRzOiBVcmxTZWdtZW50W10sXG4gICAgb3V0bGV0OiBzdHJpbmcsXG4gICAgcGFyZW50Um91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXG4gICk6IE9ic2VydmFibGU8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4gfCBOb0xlZnRvdmVyc0luVXJsPiB7XG4gICAgY29uc3Qge21hdGNoZWQsIHBhcmFtZXRlcnMsIGNvbnN1bWVkU2VnbWVudHMsIHBvc2l0aW9uYWxQYXJhbVNlZ21lbnRzLCByZW1haW5pbmdTZWdtZW50c30gPVxuICAgICAgbWF0Y2goc2VnbWVudEdyb3VwLCByb3V0ZSwgc2VnbWVudHMpO1xuICAgIGlmICghbWF0Y2hlZCkgcmV0dXJuIG5vTWF0Y2goc2VnbWVudEdyb3VwKTtcblxuICAgIC8vIFRPRE8oYXRzY290dCk6IE1vdmUgYWxsIG9mIHRoaXMgdW5kZXIgYW4gaWYobmdEZXZNb2RlKSBhcyBhIGJyZWFraW5nIGNoYW5nZSBhbmQgYWxsb3cgc3RhY2tcbiAgICAvLyBzaXplIGV4Y2VlZGVkIGluIHByb2R1Y3Rpb25cbiAgICBpZiAodHlwZW9mIHJvdXRlLnJlZGlyZWN0VG8gPT09ICdzdHJpbmcnICYmIHJvdXRlLnJlZGlyZWN0VG9bMF0gPT09ICcvJykge1xuICAgICAgdGhpcy5hYnNvbHV0ZVJlZGlyZWN0Q291bnQrKztcbiAgICAgIGlmICh0aGlzLmFic29sdXRlUmVkaXJlY3RDb3VudCA+IE1BWF9BTExPV0VEX1JFRElSRUNUUykge1xuICAgICAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5GSU5JVEVfUkVESVJFQ1QsXG4gICAgICAgICAgICBgRGV0ZWN0ZWQgcG9zc2libGUgaW5maW5pdGUgcmVkaXJlY3Qgd2hlbiByZWRpcmVjdGluZyBmcm9tICcke3RoaXMudXJsVHJlZX0nIHRvICcke3JvdXRlLnJlZGlyZWN0VG99Jy5cXG5gICtcbiAgICAgICAgICAgICAgYFRoaXMgaXMgY3VycmVudGx5IGEgZGV2IG1vZGUgb25seSBlcnJvciBidXQgd2lsbCBiZWNvbWUgYWAgK1xuICAgICAgICAgICAgICBgIGNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZCBlcnJvciBpbiBwcm9kdWN0aW9uIGluIGEgZnV0dXJlIG1ham9yIHZlcnNpb24uYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWxsb3dSZWRpcmVjdHMgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgY3VycmVudFNuYXBzaG90ID0gbmV3IEFjdGl2YXRlZFJvdXRlU25hcHNob3QoXG4gICAgICBzZWdtZW50cyxcbiAgICAgIHBhcmFtZXRlcnMsXG4gICAgICBPYmplY3QuZnJlZXplKHsuLi50aGlzLnVybFRyZWUucXVlcnlQYXJhbXN9KSxcbiAgICAgIHRoaXMudXJsVHJlZS5mcmFnbWVudCxcbiAgICAgIGdldERhdGEocm91dGUpLFxuICAgICAgZ2V0T3V0bGV0KHJvdXRlKSxcbiAgICAgIHJvdXRlLmNvbXBvbmVudCA/PyByb3V0ZS5fbG9hZGVkQ29tcG9uZW50ID8/IG51bGwsXG4gICAgICByb3V0ZSxcbiAgICAgIGdldFJlc29sdmUocm91dGUpLFxuICAgICk7XG4gICAgY29uc3QgaW5oZXJpdGVkID0gZ2V0SW5oZXJpdGVkKGN1cnJlbnRTbmFwc2hvdCwgcGFyZW50Um91dGUsIHRoaXMucGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSk7XG4gICAgY3VycmVudFNuYXBzaG90LnBhcmFtcyA9IE9iamVjdC5mcmVlemUoaW5oZXJpdGVkLnBhcmFtcyk7XG4gICAgY3VycmVudFNuYXBzaG90LmRhdGEgPSBPYmplY3QuZnJlZXplKGluaGVyaXRlZC5kYXRhKTtcbiAgICBjb25zdCBuZXdUcmVlID0gdGhpcy5hcHBseVJlZGlyZWN0cy5hcHBseVJlZGlyZWN0Q29tbWFuZHMoXG4gICAgICBjb25zdW1lZFNlZ21lbnRzLFxuICAgICAgcm91dGUucmVkaXJlY3RUbyEsXG4gICAgICBwb3NpdGlvbmFsUGFyYW1TZWdtZW50cyxcbiAgICAgIGN1cnJlbnRTbmFwc2hvdCxcbiAgICAgIGluamVjdG9yLFxuICAgICk7XG5cbiAgICByZXR1cm4gdGhpcy5hcHBseVJlZGlyZWN0cy5saW5lcmFsaXplU2VnbWVudHMocm91dGUsIG5ld1RyZWUpLnBpcGUoXG4gICAgICBtZXJnZU1hcCgobmV3U2VnbWVudHM6IFVybFNlZ21lbnRbXSkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzU2VnbWVudChcbiAgICAgICAgICBpbmplY3RvcixcbiAgICAgICAgICByb3V0ZXMsXG4gICAgICAgICAgc2VnbWVudEdyb3VwLFxuICAgICAgICAgIG5ld1NlZ21lbnRzLmNvbmNhdChyZW1haW5pbmdTZWdtZW50cyksXG4gICAgICAgICAgb3V0bGV0LFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIHBhcmVudFJvdXRlLFxuICAgICAgICApO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIG1hdGNoU2VnbWVudEFnYWluc3RSb3V0ZShcbiAgICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3RvcixcbiAgICByYXdTZWdtZW50OiBVcmxTZWdtZW50R3JvdXAsXG4gICAgcm91dGU6IFJvdXRlLFxuICAgIHNlZ21lbnRzOiBVcmxTZWdtZW50W10sXG4gICAgb3V0bGV0OiBzdHJpbmcsXG4gICAgcGFyZW50Um91dGU6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXG4gICk6IE9ic2VydmFibGU8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4+IHtcbiAgICBjb25zdCBtYXRjaFJlc3VsdCA9IG1hdGNoV2l0aENoZWNrcyhyYXdTZWdtZW50LCByb3V0ZSwgc2VnbWVudHMsIGluamVjdG9yLCB0aGlzLnVybFNlcmlhbGl6ZXIpO1xuICAgIGlmIChyb3V0ZS5wYXRoID09PSAnKionKSB7XG4gICAgICAvLyBQcmlvciB2ZXJzaW9ucyBvZiB0aGUgcm91dGUgbWF0Y2hpbmcgYWxnb3JpdGhtIHdvdWxkIHN0b3AgbWF0Y2hpbmcgYXQgdGhlIHdpbGRjYXJkIHJvdXRlLlxuICAgICAgLy8gV2Ugc2hvdWxkIGludmVzdGlnYXRlIGEgYmV0dGVyIHN0cmF0ZWd5IGZvciBhbnkgZXhpc3RpbmcgY2hpbGRyZW4uIE90aGVyd2lzZSwgdGhlc2VcbiAgICAgIC8vIGNoaWxkIHNlZ21lbnRzIGFyZSBzaWxlbnRseSBkcm9wcGVkIGZyb20gdGhlIG5hdmlnYXRpb24uXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy80MDA4OVxuICAgICAgcmF3U2VnbWVudC5jaGlsZHJlbiA9IHt9O1xuICAgIH1cblxuICAgIHJldHVybiBtYXRjaFJlc3VsdC5waXBlKFxuICAgICAgc3dpdGNoTWFwKChyZXN1bHQpID0+IHtcbiAgICAgICAgaWYgKCFyZXN1bHQubWF0Y2hlZCkge1xuICAgICAgICAgIHJldHVybiBub01hdGNoKHJhd1NlZ21lbnQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHRoZSByb3V0ZSBoYXMgYW4gaW5qZWN0b3IgY3JlYXRlZCBmcm9tIHByb3ZpZGVycywgd2Ugc2hvdWxkIHN0YXJ0IHVzaW5nIHRoYXQuXG4gICAgICAgIGluamVjdG9yID0gcm91dGUuX2luamVjdG9yID8/IGluamVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDaGlsZENvbmZpZyhpbmplY3Rvciwgcm91dGUsIHNlZ21lbnRzKS5waXBlKFxuICAgICAgICAgIHN3aXRjaE1hcCgoe3JvdXRlczogY2hpbGRDb25maWd9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZEluamVjdG9yID0gcm91dGUuX2xvYWRlZEluamVjdG9yID8/IGluamVjdG9yO1xuXG4gICAgICAgICAgICBjb25zdCB7cGFyYW1ldGVycywgY29uc3VtZWRTZWdtZW50cywgcmVtYWluaW5nU2VnbWVudHN9ID0gcmVzdWx0O1xuICAgICAgICAgICAgY29uc3Qgc25hcHNob3QgPSBuZXcgQWN0aXZhdGVkUm91dGVTbmFwc2hvdChcbiAgICAgICAgICAgICAgY29uc3VtZWRTZWdtZW50cyxcbiAgICAgICAgICAgICAgcGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgT2JqZWN0LmZyZWV6ZSh7Li4udGhpcy51cmxUcmVlLnF1ZXJ5UGFyYW1zfSksXG4gICAgICAgICAgICAgIHRoaXMudXJsVHJlZS5mcmFnbWVudCxcbiAgICAgICAgICAgICAgZ2V0RGF0YShyb3V0ZSksXG4gICAgICAgICAgICAgIGdldE91dGxldChyb3V0ZSksXG4gICAgICAgICAgICAgIHJvdXRlLmNvbXBvbmVudCA/PyByb3V0ZS5fbG9hZGVkQ29tcG9uZW50ID8/IG51bGwsXG4gICAgICAgICAgICAgIHJvdXRlLFxuICAgICAgICAgICAgICBnZXRSZXNvbHZlKHJvdXRlKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBpbmhlcml0ZWQgPSBnZXRJbmhlcml0ZWQoc25hcHNob3QsIHBhcmVudFJvdXRlLCB0aGlzLnBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3kpO1xuICAgICAgICAgICAgc25hcHNob3QucGFyYW1zID0gT2JqZWN0LmZyZWV6ZShpbmhlcml0ZWQucGFyYW1zKTtcbiAgICAgICAgICAgIHNuYXBzaG90LmRhdGEgPSBPYmplY3QuZnJlZXplKGluaGVyaXRlZC5kYXRhKTtcblxuICAgICAgICAgICAgY29uc3Qge3NlZ21lbnRHcm91cCwgc2xpY2VkU2VnbWVudHN9ID0gc3BsaXQoXG4gICAgICAgICAgICAgIHJhd1NlZ21lbnQsXG4gICAgICAgICAgICAgIGNvbnN1bWVkU2VnbWVudHMsXG4gICAgICAgICAgICAgIHJlbWFpbmluZ1NlZ21lbnRzLFxuICAgICAgICAgICAgICBjaGlsZENvbmZpZyxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChzbGljZWRTZWdtZW50cy5sZW5ndGggPT09IDAgJiYgc2VnbWVudEdyb3VwLmhhc0NoaWxkcmVuKCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0NoaWxkcmVuKGNoaWxkSW5qZWN0b3IsIGNoaWxkQ29uZmlnLCBzZWdtZW50R3JvdXAsIHNuYXBzaG90KS5waXBlKFxuICAgICAgICAgICAgICAgIG1hcCgoY2hpbGRyZW4pID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVHJlZU5vZGUoc25hcHNob3QsIGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoaWxkQ29uZmlnLmxlbmd0aCA9PT0gMCAmJiBzbGljZWRTZWdtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG9mKG5ldyBUcmVlTm9kZShzbmFwc2hvdCwgW10pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbWF0Y2hlZE9uT3V0bGV0ID0gZ2V0T3V0bGV0KHJvdXRlKSA9PT0gb3V0bGV0O1xuICAgICAgICAgICAgLy8gSWYgd2UgbWF0Y2hlZCBhIGNvbmZpZyBkdWUgdG8gZW1wdHkgcGF0aCBtYXRjaCBvbiBhIGRpZmZlcmVudCBvdXRsZXQsIHdlIG5lZWQgdG9cbiAgICAgICAgICAgIC8vIGNvbnRpbnVlIHBhc3NpbmcgdGhlIGN1cnJlbnQgb3V0bGV0IGZvciB0aGUgc2VnbWVudCByYXRoZXIgdGhhbiBzd2l0Y2ggdG8gUFJJTUFSWS5cbiAgICAgICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBzd2l0Y2ggdG8gcHJpbWFyeSB3aGVuIHdlIGhhdmUgYSBtYXRjaCBiZWNhdXNlIG91dGxldCBjb25maWdzIGxvb2sgbGlrZVxuICAgICAgICAgICAgLy8gdGhpczoge3BhdGg6ICdhJywgb3V0bGV0OiAnYScsIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAvLyAge3BhdGg6ICdiJywgY29tcG9uZW50OiBCfSxcbiAgICAgICAgICAgIC8vICB7cGF0aDogJ2MnLCBjb21wb25lbnQ6IEN9LFxuICAgICAgICAgICAgLy8gXX1cbiAgICAgICAgICAgIC8vIE5vdGljZSB0aGF0IHRoZSBjaGlsZHJlbiBvZiB0aGUgbmFtZWQgb3V0bGV0IGFyZSBjb25maWd1cmVkIHdpdGggdGhlIHByaW1hcnkgb3V0bGV0XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzU2VnbWVudChcbiAgICAgICAgICAgICAgY2hpbGRJbmplY3RvcixcbiAgICAgICAgICAgICAgY2hpbGRDb25maWcsXG4gICAgICAgICAgICAgIHNlZ21lbnRHcm91cCxcbiAgICAgICAgICAgICAgc2xpY2VkU2VnbWVudHMsXG4gICAgICAgICAgICAgIG1hdGNoZWRPbk91dGxldCA/IFBSSU1BUllfT1VUTEVUIDogb3V0bGV0LFxuICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgICBzbmFwc2hvdCxcbiAgICAgICAgICAgICkucGlwZShcbiAgICAgICAgICAgICAgbWFwKChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVHJlZU5vZGUoc25hcHNob3QsIGNoaWxkIGluc3RhbmNlb2YgVHJlZU5vZGUgPyBbY2hpbGRdIDogW10pO1xuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSksXG4gICAgICAgICk7XG4gICAgICB9KSxcbiAgICApO1xuICB9XG4gIHByaXZhdGUgZ2V0Q2hpbGRDb25maWcoXG4gICAgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IsXG4gICAgcm91dGU6IFJvdXRlLFxuICAgIHNlZ21lbnRzOiBVcmxTZWdtZW50W10sXG4gICk6IE9ic2VydmFibGU8TG9hZGVkUm91dGVyQ29uZmlnPiB7XG4gICAgaWYgKHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgICAvLyBUaGUgY2hpbGRyZW4gYmVsb25nIHRvIHRoZSBzYW1lIG1vZHVsZVxuICAgICAgcmV0dXJuIG9mKHtyb3V0ZXM6IHJvdXRlLmNoaWxkcmVuLCBpbmplY3Rvcn0pO1xuICAgIH1cblxuICAgIGlmIChyb3V0ZS5sb2FkQ2hpbGRyZW4pIHtcbiAgICAgIC8vIGxhenkgY2hpbGRyZW4gYmVsb25nIHRvIHRoZSBsb2FkZWQgbW9kdWxlXG4gICAgICBpZiAocm91dGUuX2xvYWRlZFJvdXRlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBvZih7cm91dGVzOiByb3V0ZS5fbG9hZGVkUm91dGVzLCBpbmplY3Rvcjogcm91dGUuX2xvYWRlZEluamVjdG9yfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBydW5DYW5Mb2FkR3VhcmRzKGluamVjdG9yLCByb3V0ZSwgc2VnbWVudHMsIHRoaXMudXJsU2VyaWFsaXplcikucGlwZShcbiAgICAgICAgbWVyZ2VNYXAoKHNob3VsZExvYWRSZXN1bHQ6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgICBpZiAoc2hvdWxkTG9hZFJlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnTG9hZGVyLmxvYWRDaGlsZHJlbihpbmplY3Rvciwgcm91dGUpLnBpcGUoXG4gICAgICAgICAgICAgIHRhcCgoY2ZnOiBMb2FkZWRSb3V0ZXJDb25maWcpID0+IHtcbiAgICAgICAgICAgICAgICByb3V0ZS5fbG9hZGVkUm91dGVzID0gY2ZnLnJvdXRlcztcbiAgICAgICAgICAgICAgICByb3V0ZS5fbG9hZGVkSW5qZWN0b3IgPSBjZmcuaW5qZWN0b3I7XG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNhbkxvYWRGYWlscyhyb3V0ZSk7XG4gICAgICAgIH0pLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2Yoe3JvdXRlczogW10sIGluamVjdG9yfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc29ydEFjdGl2YXRlZFJvdXRlU25hcHNob3RzKG5vZGVzOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdKTogdm9pZCB7XG4gIG5vZGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICBpZiAoYS52YWx1ZS5vdXRsZXQgPT09IFBSSU1BUllfT1VUTEVUKSByZXR1cm4gLTE7XG4gICAgaWYgKGIudmFsdWUub3V0bGV0ID09PSBQUklNQVJZX09VVExFVCkgcmV0dXJuIDE7XG4gICAgcmV0dXJuIGEudmFsdWUub3V0bGV0LmxvY2FsZUNvbXBhcmUoYi52YWx1ZS5vdXRsZXQpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gaGFzRW1wdHlQYXRoQ29uZmlnKG5vZGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+KSB7XG4gIGNvbnN0IGNvbmZpZyA9IG5vZGUudmFsdWUucm91dGVDb25maWc7XG4gIHJldHVybiBjb25maWcgJiYgY29uZmlnLnBhdGggPT09ICcnO1xufVxuXG4vKipcbiAqIEZpbmRzIGBUcmVlTm9kZWBzIHdpdGggbWF0Y2hpbmcgZW1wdHkgcGF0aCByb3V0ZSBjb25maWdzIGFuZCBtZXJnZXMgdGhlbSBpbnRvIGBUcmVlTm9kZWAgd2l0aFxuICogdGhlIGNoaWxkcmVuIGZyb20gZWFjaCBkdXBsaWNhdGUuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgZGlmZmVyZW50IG91dGxldHMgY2FuIG1hdGNoIGFcbiAqIHNpbmdsZSBlbXB0eSBwYXRoIHJvdXRlIGNvbmZpZyBhbmQgdGhlIHJlc3VsdHMgbmVlZCB0byB0aGVuIGJlIG1lcmdlZC5cbiAqL1xuZnVuY3Rpb24gbWVyZ2VFbXB0eVBhdGhNYXRjaGVzKFxuICBub2RlczogQXJyYXk8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4+LFxuKTogQXJyYXk8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4+IHtcbiAgY29uc3QgcmVzdWx0OiBBcnJheTxUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90Pj4gPSBbXTtcbiAgLy8gVGhlIHNldCBvZiBub2RlcyB3aGljaCBjb250YWluIGNoaWxkcmVuIHRoYXQgd2VyZSBtZXJnZWQgZnJvbSB0d28gZHVwbGljYXRlIGVtcHR5IHBhdGggbm9kZXMuXG4gIGNvbnN0IG1lcmdlZE5vZGVzOiBTZXQ8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4+ID0gbmV3IFNldCgpO1xuXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmICghaGFzRW1wdHlQYXRoQ29uZmlnKG5vZGUpKSB7XG4gICAgICByZXN1bHQucHVzaChub2RlKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGR1cGxpY2F0ZUVtcHR5UGF0aE5vZGUgPSByZXN1bHQuZmluZChcbiAgICAgIChyZXN1bHROb2RlKSA9PiBub2RlLnZhbHVlLnJvdXRlQ29uZmlnID09PSByZXN1bHROb2RlLnZhbHVlLnJvdXRlQ29uZmlnLFxuICAgICk7XG4gICAgaWYgKGR1cGxpY2F0ZUVtcHR5UGF0aE5vZGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZHVwbGljYXRlRW1wdHlQYXRoTm9kZS5jaGlsZHJlbi5wdXNoKC4uLm5vZGUuY2hpbGRyZW4pO1xuICAgICAgbWVyZ2VkTm9kZXMuYWRkKGR1cGxpY2F0ZUVtcHR5UGF0aE5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucHVzaChub2RlKTtcbiAgICB9XG4gIH1cbiAgLy8gRm9yIGVhY2ggbm9kZSB3aGljaCBoYXMgY2hpbGRyZW4gZnJvbSBtdWx0aXBsZSBzb3VyY2VzLCB3ZSBuZWVkIHRvIHJlY29tcHV0ZSBhIG5ldyBgVHJlZU5vZGVgXG4gIC8vIGJ5IGFsc28gbWVyZ2luZyB0aG9zZSBjaGlsZHJlbi4gVGhpcyBpcyBuZWNlc3Nhcnkgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgZW1wdHkgcGF0aCBjb25maWdzXG4gIC8vIGluIGEgcm93LiBQdXQgYW5vdGhlciB3YXk6IHdoZW5ldmVyIHdlIGNvbWJpbmUgY2hpbGRyZW4gb2YgdHdvIG5vZGVzLCB3ZSBuZWVkIHRvIGFsc28gY2hlY2tcbiAgLy8gaWYgYW55IG9mIHRob3NlIGNoaWxkcmVuIGNhbiBiZSBjb21iaW5lZCBpbnRvIGEgc2luZ2xlIG5vZGUgYXMgd2VsbC5cbiAgZm9yIChjb25zdCBtZXJnZWROb2RlIG9mIG1lcmdlZE5vZGVzKSB7XG4gICAgY29uc3QgbWVyZ2VkQ2hpbGRyZW4gPSBtZXJnZUVtcHR5UGF0aE1hdGNoZXMobWVyZ2VkTm9kZS5jaGlsZHJlbik7XG4gICAgcmVzdWx0LnB1c2gobmV3IFRyZWVOb2RlKG1lcmdlZE5vZGUudmFsdWUsIG1lcmdlZENoaWxkcmVuKSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdC5maWx0ZXIoKG4pID0+ICFtZXJnZWROb2Rlcy5oYXMobikpO1xufVxuXG5mdW5jdGlvbiBjaGVja091dGxldE5hbWVVbmlxdWVuZXNzKG5vZGVzOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdKTogdm9pZCB7XG4gIGNvbnN0IG5hbWVzOiB7W2s6IHN0cmluZ106IEFjdGl2YXRlZFJvdXRlU25hcHNob3R9ID0ge307XG4gIG5vZGVzLmZvckVhY2goKG4pID0+IHtcbiAgICBjb25zdCByb3V0ZVdpdGhTYW1lT3V0bGV0TmFtZSA9IG5hbWVzW24udmFsdWUub3V0bGV0XTtcbiAgICBpZiAocm91dGVXaXRoU2FtZU91dGxldE5hbWUpIHtcbiAgICAgIGNvbnN0IHAgPSByb3V0ZVdpdGhTYW1lT3V0bGV0TmFtZS51cmwubWFwKChzKSA9PiBzLnRvU3RyaW5nKCkpLmpvaW4oJy8nKTtcbiAgICAgIGNvbnN0IGMgPSBuLnZhbHVlLnVybC5tYXAoKHMpID0+IHMudG9TdHJpbmcoKSkuam9pbignLycpO1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5UV09fU0VHTUVOVFNfV0lUSF9TQU1FX09VVExFVCxcbiAgICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiZcbiAgICAgICAgICBgVHdvIHNlZ21lbnRzIGNhbm5vdCBoYXZlIHRoZSBzYW1lIG91dGxldCBuYW1lOiAnJHtwfScgYW5kICcke2N9Jy5gLFxuICAgICAgKTtcbiAgICB9XG4gICAgbmFtZXNbbi52YWx1ZS5vdXRsZXRdID0gbi52YWx1ZTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldERhdGEocm91dGU6IFJvdXRlKTogRGF0YSB7XG4gIHJldHVybiByb3V0ZS5kYXRhIHx8IHt9O1xufVxuXG5mdW5jdGlvbiBnZXRSZXNvbHZlKHJvdXRlOiBSb3V0ZSk6IFJlc29sdmVEYXRhIHtcbiAgcmV0dXJuIHJvdXRlLnJlc29sdmUgfHwge307XG59XG4iXX0=