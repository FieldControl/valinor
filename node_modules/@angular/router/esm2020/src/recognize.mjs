/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵRuntimeError as RuntimeError } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, concatMap, defaultIfEmpty, first, last as rxjsLast, map, scan, switchMap, takeWhile } from 'rxjs/operators';
import { ActivatedRouteSnapshot, inheritedParamsDataResolve, RouterStateSnapshot } from './router_state';
import { PRIMARY_OUTLET } from './shared';
import { last } from './utils/collection';
import { getOutlet, sortByMatchingOutlets } from './utils/config';
import { isImmediateMatch, matchWithChecks, noLeftoversInUrl, split } from './utils/config_matching';
import { TreeNode } from './utils/tree';
import { isEmptyError } from './utils/type_guards';
const NG_DEV_MODE = typeof ngDevMode === 'undefined' || !!ngDevMode;
class NoMatch {
}
function newObservableError(e) {
    // TODO(atscott): This pattern is used throughout the router code and can be `throwError` instead.
    return new Observable((obs) => obs.error(e));
}
export function recognize(injector, rootComponentType, config, urlTree, url, urlSerializer, paramsInheritanceStrategy = 'emptyOnly') {
    return new Recognizer(injector, rootComponentType, config, urlTree, url, paramsInheritanceStrategy, urlSerializer)
        .recognize()
        .pipe(switchMap(result => {
        if (result === null) {
            return newObservableError(new NoMatch());
        }
        else {
            return of(result);
        }
    }));
}
export class Recognizer {
    constructor(injector, rootComponentType, config, urlTree, url, paramsInheritanceStrategy, urlSerializer) {
        this.injector = injector;
        this.rootComponentType = rootComponentType;
        this.config = config;
        this.urlTree = urlTree;
        this.url = url;
        this.paramsInheritanceStrategy = paramsInheritanceStrategy;
        this.urlSerializer = urlSerializer;
    }
    recognize() {
        const rootSegmentGroup = split(this.urlTree.root, [], [], this.config.filter(c => c.redirectTo === undefined))
            .segmentGroup;
        return this.processSegmentGroup(this.injector, this.config, rootSegmentGroup, PRIMARY_OUTLET)
            .pipe(map(children => {
            if (children === null) {
                return null;
            }
            // Use Object.freeze to prevent readers of the Router state from modifying it outside of a
            // navigation, resulting in the router being out of sync with the browser.
            const root = new ActivatedRouteSnapshot([], Object.freeze({}), Object.freeze({ ...this.urlTree.queryParams }), this.urlTree.fragment, {}, PRIMARY_OUTLET, this.rootComponentType, null, this.urlTree.root, -1, {});
            const rootNode = new TreeNode(root, children);
            const routeState = new RouterStateSnapshot(this.url, rootNode);
            this.inheritParamsAndData(routeState._root);
            return routeState;
        }));
    }
    inheritParamsAndData(routeNode) {
        const route = routeNode.value;
        const i = inheritedParamsDataResolve(route, this.paramsInheritanceStrategy);
        route.params = Object.freeze(i.params);
        route.data = Object.freeze(i.data);
        routeNode.children.forEach(n => this.inheritParamsAndData(n));
    }
    processSegmentGroup(injector, config, segmentGroup, outlet) {
        if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
            return this.processChildren(injector, config, segmentGroup);
        }
        return this.processSegment(injector, config, segmentGroup, segmentGroup.segments, outlet);
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
        return from(Object.keys(segmentGroup.children))
            .pipe(concatMap(childOutlet => {
            const child = segmentGroup.children[childOutlet];
            // Sort the config so that routes with outlets that match the one being activated
            // appear first, followed by routes for other outlets, which might match if they have
            // an empty path.
            const sortedConfig = sortByMatchingOutlets(config, childOutlet);
            return this.processSegmentGroup(injector, sortedConfig, child, childOutlet);
        }), scan((children, outletChildren) => {
            if (!children || !outletChildren)
                return null;
            children.push(...outletChildren);
            return children;
        }), takeWhile(children => children !== null), defaultIfEmpty(null), rxjsLast(), map(children => {
            if (children === null)
                return null;
            // Because we may have matched two outlets to the same empty path segment, we can have
            // multiple activated results for the same outlet. We should merge the children of
            // these results so the final return value is only one `TreeNode` per outlet.
            const mergedChildren = mergeEmptyPathMatches(children);
            if (NG_DEV_MODE) {
                // This should really never happen - we are only taking the first match for each
                // outlet and merge the empty path matches.
                checkOutletNameUniqueness(mergedChildren);
            }
            sortActivatedRouteSnapshots(mergedChildren);
            return mergedChildren;
        }));
    }
    processSegment(injector, routes, segmentGroup, segments, outlet) {
        return from(routes).pipe(concatMap(r => {
            return this.processSegmentAgainstRoute(r._injector ?? injector, r, segmentGroup, segments, outlet);
        }), first((x) => !!x), catchError(e => {
            if (isEmptyError(e)) {
                if (noLeftoversInUrl(segmentGroup, segments, outlet)) {
                    return of([]);
                }
                return of(null);
            }
            throw e;
        }));
    }
    processSegmentAgainstRoute(injector, route, rawSegment, segments, outlet) {
        if (route.redirectTo || !isImmediateMatch(route, rawSegment, segments, outlet))
            return of(null);
        let matchResult;
        if (route.path === '**') {
            const params = segments.length > 0 ? last(segments).parameters : {};
            const pathIndexShift = getPathIndexShift(rawSegment) + segments.length;
            const snapshot = new ActivatedRouteSnapshot(segments, params, Object.freeze({ ...this.urlTree.queryParams }), this.urlTree.fragment, getData(route), getOutlet(route), route.component ?? route._loadedComponent ?? null, route, getSourceSegmentGroup(rawSegment), pathIndexShift, getResolve(route));
            matchResult = of({
                snapshot,
                consumedSegments: [],
                remainingSegments: [],
            });
        }
        else {
            matchResult =
                matchWithChecks(rawSegment, route, segments, injector, this.urlSerializer)
                    .pipe(map(({ matched, consumedSegments, remainingSegments, parameters }) => {
                    if (!matched) {
                        return null;
                    }
                    const pathIndexShift = getPathIndexShift(rawSegment) + consumedSegments.length;
                    const snapshot = new ActivatedRouteSnapshot(consumedSegments, parameters, Object.freeze({ ...this.urlTree.queryParams }), this.urlTree.fragment, getData(route), getOutlet(route), route.component ?? route._loadedComponent ?? null, route, getSourceSegmentGroup(rawSegment), pathIndexShift, getResolve(route));
                    return { snapshot, consumedSegments, remainingSegments };
                }));
        }
        return matchResult.pipe(switchMap((result) => {
            if (result === null) {
                return of(null);
            }
            const { snapshot, consumedSegments, remainingSegments } = result;
            // If the route has an injector created from providers, we should start using that.
            injector = route._injector ?? injector;
            const childInjector = route._loadedInjector ?? injector;
            const childConfig = getChildConfig(route);
            const { segmentGroup, slicedSegments } = split(rawSegment, consumedSegments, remainingSegments, 
            // Filter out routes with redirectTo because we are trying to create activated route
            // snapshots and don't handle redirects here. That should have been done in
            // `applyRedirects`.
            childConfig.filter(c => c.redirectTo === undefined));
            if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
                return this.processChildren(childInjector, childConfig, segmentGroup).pipe(map(children => {
                    if (children === null) {
                        return null;
                    }
                    return [new TreeNode(snapshot, children)];
                }));
            }
            if (childConfig.length === 0 && slicedSegments.length === 0) {
                return of([new TreeNode(snapshot, [])]);
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
            return this
                .processSegment(childInjector, childConfig, segmentGroup, slicedSegments, matchedOnOutlet ? PRIMARY_OUTLET : outlet)
                .pipe(map(children => {
                if (children === null) {
                    return null;
                }
                return [new TreeNode(snapshot, children)];
            }));
        }));
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
function getChildConfig(route) {
    if (route.children) {
        return route.children;
    }
    if (route.loadChildren) {
        return route._loadedRoutes;
    }
    return [];
}
function hasEmptyPathConfig(node) {
    const config = node.value.routeConfig;
    return config && config.path === '' && config.redirectTo === undefined;
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
        const duplicateEmptyPathNode = result.find(resultNode => node.value.routeConfig === resultNode.value.routeConfig);
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
    return result.filter(n => !mergedNodes.has(n));
}
function checkOutletNameUniqueness(nodes) {
    const names = {};
    nodes.forEach(n => {
        const routeWithSameOutletName = names[n.value.outlet];
        if (routeWithSameOutletName) {
            const p = routeWithSameOutletName.url.map(s => s.toString()).join('/');
            const c = n.value.url.map(s => s.toString()).join('/');
            throw new RuntimeError(4006 /* RuntimeErrorCode.TWO_SEGMENTS_WITH_SAME_OUTLET */, NG_DEV_MODE && `Two segments cannot have the same outlet name: '${p}' and '${c}'.`);
        }
        names[n.value.outlet] = n.value;
    });
}
function getSourceSegmentGroup(segmentGroup) {
    let s = segmentGroup;
    while (s._sourceSegment) {
        s = s._sourceSegment;
    }
    return s;
}
function getPathIndexShift(segmentGroup) {
    let s = segmentGroup;
    let res = s._segmentIndexShift ?? 0;
    while (s._sourceSegment) {
        s = s._sourceSegment;
        res += s._segmentIndexShift ?? 0;
    }
    return res - 1;
}
function getCorrectedPathIndexShift(segmentGroup) {
    let s = segmentGroup;
    let res = s._segmentIndexShiftCorrected ?? s._segmentIndexShift ?? 0;
    while (s._sourceSegment) {
        s = s._sourceSegment;
        res += s._segmentIndexShiftCorrected ?? s._segmentIndexShift ?? 0;
    }
    return res - 1;
}
function getData(route) {
    return route.data || {};
}
function getResolve(route) {
    return route.resolve || {};
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb2duaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yZWNvZ25pemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUE0QixhQUFhLElBQUksWUFBWSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZGLE9BQU8sRUFBYSxJQUFJLEVBQUUsVUFBVSxFQUFZLEVBQUUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNoRSxPQUFPLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLElBQUksSUFBSSxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFJL0gsT0FBTyxFQUFDLHNCQUFzQixFQUFFLDBCQUEwQixFQUE2QixtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2xJLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFeEMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3hDLE9BQU8sRUFBQyxTQUFTLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNoRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQ25HLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRWpELE1BQU0sV0FBVyxHQUFHLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDO0FBRXBFLE1BQU0sT0FBTztDQUFHO0FBRWhCLFNBQVMsa0JBQWtCLENBQUMsQ0FBVTtJQUNwQyxrR0FBa0c7SUFD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SSxDQUFDLENBQUMsa0JBQWtCLElBQUksQ0FBQyxDQUFDO0tBQ2xDO0lBQ0QsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxTQUFTLDBCQUEwQixDQUFDLFlBQTZCO0lBQy9ELElBQUksQ0FBQyxHQUFHLFlBQVksQ0FBQztJQUNyQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsMkJBQTJCLElBQUksQ0FBQyxDQUFDLGtCQUFrQixJQUFJLENBQUMsQ0FBQztJQUNyRSxPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUU7UUFDdkIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUM7UUFDckIsR0FBRyxJQUFJLENBQUMsQ0FBQywyQkFBMkIsSUFBSSxDQUFDLENBQUMsa0JBQWtCLElBQUksQ0FBQyxDQUFDO0tBQ25FO0lBQ0QsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FBQyxLQUFZO0lBQzNCLE9BQU8sS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7QUFDMUIsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLEtBQVk7SUFDOUIsT0FBTyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztBQUM3QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RW52aXJvbm1lbnRJbmplY3RvciwgVHlwZSwgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RW1wdHlFcnJvciwgZnJvbSwgT2JzZXJ2YWJsZSwgT2JzZXJ2ZXIsIG9mfSBmcm9tICdyeGpzJztcbmltcG9ydCB7Y2F0Y2hFcnJvciwgY29uY2F0TWFwLCBkZWZhdWx0SWZFbXB0eSwgZmlyc3QsIGxhc3QgYXMgcnhqc0xhc3QsIG1hcCwgc2Nhbiwgc3dpdGNoTWFwLCB0YWtlV2hpbGV9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQge0RhdGEsIFJlc29sdmVEYXRhLCBSb3V0ZSwgUm91dGVzfSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQge0FjdGl2YXRlZFJvdXRlU25hcHNob3QsIGluaGVyaXRlZFBhcmFtc0RhdGFSZXNvbHZlLCBQYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5LCBSb3V0ZXJTdGF0ZVNuYXBzaG90fSBmcm9tICcuL3JvdXRlcl9zdGF0ZSc7XG5pbXBvcnQge1BSSU1BUllfT1VUTEVUfSBmcm9tICcuL3NoYXJlZCc7XG5pbXBvcnQge1VybFNlZ21lbnQsIFVybFNlZ21lbnRHcm91cCwgVXJsU2VyaWFsaXplciwgVXJsVHJlZX0gZnJvbSAnLi91cmxfdHJlZSc7XG5pbXBvcnQge2xhc3R9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbic7XG5pbXBvcnQge2dldE91dGxldCwgc29ydEJ5TWF0Y2hpbmdPdXRsZXRzfSBmcm9tICcuL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2lzSW1tZWRpYXRlTWF0Y2gsIG1hdGNoV2l0aENoZWNrcywgbm9MZWZ0b3ZlcnNJblVybCwgc3BsaXR9IGZyb20gJy4vdXRpbHMvY29uZmlnX21hdGNoaW5nJztcbmltcG9ydCB7VHJlZU5vZGV9IGZyb20gJy4vdXRpbHMvdHJlZSc7XG5pbXBvcnQge2lzRW1wdHlFcnJvcn0gZnJvbSAnLi91dGlscy90eXBlX2d1YXJkcyc7XG5cbmNvbnN0IE5HX0RFVl9NT0RFID0gdHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgISFuZ0Rldk1vZGU7XG5cbmNsYXNzIE5vTWF0Y2gge31cblxuZnVuY3Rpb24gbmV3T2JzZXJ2YWJsZUVycm9yKGU6IHVua25vd24pOiBPYnNlcnZhYmxlPFJvdXRlclN0YXRlU25hcHNob3Q+IHtcbiAgLy8gVE9ETyhhdHNjb3R0KTogVGhpcyBwYXR0ZXJuIGlzIHVzZWQgdGhyb3VnaG91dCB0aGUgcm91dGVyIGNvZGUgYW5kIGNhbiBiZSBgdGhyb3dFcnJvcmAgaW5zdGVhZC5cbiAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlPFJvdXRlclN0YXRlU25hcHNob3Q+KChvYnM6IE9ic2VydmVyPFJvdXRlclN0YXRlU25hcHNob3Q+KSA9PiBvYnMuZXJyb3IoZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVjb2duaXplKFxuICAgIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yLCByb290Q29tcG9uZW50VHlwZTogVHlwZTxhbnk+fG51bGwsIGNvbmZpZzogUm91dGVzLFxuICAgIHVybFRyZWU6IFVybFRyZWUsIHVybDogc3RyaW5nLCB1cmxTZXJpYWxpemVyOiBVcmxTZXJpYWxpemVyLFxuICAgIHBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3k6IFBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3kgPVxuICAgICAgICAnZW1wdHlPbmx5Jyk6IE9ic2VydmFibGU8Um91dGVyU3RhdGVTbmFwc2hvdD4ge1xuICByZXR1cm4gbmV3IFJlY29nbml6ZXIoXG4gICAgICAgICAgICAgaW5qZWN0b3IsIHJvb3RDb21wb25lbnRUeXBlLCBjb25maWcsIHVybFRyZWUsIHVybCwgcGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSxcbiAgICAgICAgICAgICB1cmxTZXJpYWxpemVyKVxuICAgICAgLnJlY29nbml6ZSgpXG4gICAgICAucGlwZShzd2l0Y2hNYXAocmVzdWx0ID0+IHtcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBuZXdPYnNlcnZhYmxlRXJyb3IobmV3IE5vTWF0Y2goKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG9mKHJlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbn1cblxuZXhwb3J0IGNsYXNzIFJlY29nbml6ZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IsIHByaXZhdGUgcm9vdENvbXBvbmVudFR5cGU6IFR5cGU8YW55PnxudWxsLFxuICAgICAgcHJpdmF0ZSBjb25maWc6IFJvdXRlcywgcHJpdmF0ZSB1cmxUcmVlOiBVcmxUcmVlLCBwcml2YXRlIHVybDogc3RyaW5nLFxuICAgICAgcHJpdmF0ZSBwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5OiBQYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5LFxuICAgICAgcHJpdmF0ZSByZWFkb25seSB1cmxTZXJpYWxpemVyOiBVcmxTZXJpYWxpemVyKSB7fVxuXG4gIHJlY29nbml6ZSgpOiBPYnNlcnZhYmxlPFJvdXRlclN0YXRlU25hcHNob3R8bnVsbD4ge1xuICAgIGNvbnN0IHJvb3RTZWdtZW50R3JvdXAgPVxuICAgICAgICBzcGxpdCh0aGlzLnVybFRyZWUucm9vdCwgW10sIFtdLCB0aGlzLmNvbmZpZy5maWx0ZXIoYyA9PiBjLnJlZGlyZWN0VG8gPT09IHVuZGVmaW5lZCkpXG4gICAgICAgICAgICAuc2VnbWVudEdyb3VwO1xuXG4gICAgcmV0dXJuIHRoaXMucHJvY2Vzc1NlZ21lbnRHcm91cCh0aGlzLmluamVjdG9yLCB0aGlzLmNvbmZpZywgcm9vdFNlZ21lbnRHcm91cCwgUFJJTUFSWV9PVVRMRVQpXG4gICAgICAgIC5waXBlKG1hcChjaGlsZHJlbiA9PiB7XG4gICAgICAgICAgaWYgKGNoaWxkcmVuID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBVc2UgT2JqZWN0LmZyZWV6ZSB0byBwcmV2ZW50IHJlYWRlcnMgb2YgdGhlIFJvdXRlciBzdGF0ZSBmcm9tIG1vZGlmeWluZyBpdCBvdXRzaWRlIG9mIGFcbiAgICAgICAgICAvLyBuYXZpZ2F0aW9uLCByZXN1bHRpbmcgaW4gdGhlIHJvdXRlciBiZWluZyBvdXQgb2Ygc3luYyB3aXRoIHRoZSBicm93c2VyLlxuICAgICAgICAgIGNvbnN0IHJvb3QgPSBuZXcgQWN0aXZhdGVkUm91dGVTbmFwc2hvdChcbiAgICAgICAgICAgICAgW10sIE9iamVjdC5mcmVlemUoe30pLCBPYmplY3QuZnJlZXplKHsuLi50aGlzLnVybFRyZWUucXVlcnlQYXJhbXN9KSxcbiAgICAgICAgICAgICAgdGhpcy51cmxUcmVlLmZyYWdtZW50LCB7fSwgUFJJTUFSWV9PVVRMRVQsIHRoaXMucm9vdENvbXBvbmVudFR5cGUsIG51bGwsXG4gICAgICAgICAgICAgIHRoaXMudXJsVHJlZS5yb290LCAtMSwge30pO1xuXG4gICAgICAgICAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4ocm9vdCwgY2hpbGRyZW4pO1xuICAgICAgICAgIGNvbnN0IHJvdXRlU3RhdGUgPSBuZXcgUm91dGVyU3RhdGVTbmFwc2hvdCh0aGlzLnVybCwgcm9vdE5vZGUpO1xuICAgICAgICAgIHRoaXMuaW5oZXJpdFBhcmFtc0FuZERhdGEocm91dGVTdGF0ZS5fcm9vdCk7XG4gICAgICAgICAgcmV0dXJuIHJvdXRlU3RhdGU7XG4gICAgICAgIH0pKTtcbiAgfVxuXG4gIGluaGVyaXRQYXJhbXNBbmREYXRhKHJvdXRlTm9kZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4pOiB2b2lkIHtcbiAgICBjb25zdCByb3V0ZSA9IHJvdXRlTm9kZS52YWx1ZTtcblxuICAgIGNvbnN0IGkgPSBpbmhlcml0ZWRQYXJhbXNEYXRhUmVzb2x2ZShyb3V0ZSwgdGhpcy5wYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5KTtcbiAgICByb3V0ZS5wYXJhbXMgPSBPYmplY3QuZnJlZXplKGkucGFyYW1zKTtcbiAgICByb3V0ZS5kYXRhID0gT2JqZWN0LmZyZWV6ZShpLmRhdGEpO1xuXG4gICAgcm91dGVOb2RlLmNoaWxkcmVuLmZvckVhY2gobiA9PiB0aGlzLmluaGVyaXRQYXJhbXNBbmREYXRhKG4pKTtcbiAgfVxuXG4gIHByb2Nlc3NTZWdtZW50R3JvdXAoXG4gICAgICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3RvciwgY29uZmlnOiBSb3V0ZVtdLCBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCxcbiAgICAgIG91dGxldDogc3RyaW5nKTogT2JzZXJ2YWJsZTxUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdfG51bGw+IHtcbiAgICBpZiAoc2VnbWVudEdyb3VwLnNlZ21lbnRzLmxlbmd0aCA9PT0gMCAmJiBzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0NoaWxkcmVuKGluamVjdG9yLCBjb25maWcsIHNlZ21lbnRHcm91cCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucHJvY2Vzc1NlZ21lbnQoaW5qZWN0b3IsIGNvbmZpZywgc2VnbWVudEdyb3VwLCBzZWdtZW50R3JvdXAuc2VnbWVudHMsIG91dGxldCk7XG4gIH1cblxuICAvKipcbiAgICogTWF0Y2hlcyBldmVyeSBjaGlsZCBvdXRsZXQgaW4gdGhlIGBzZWdtZW50R3JvdXBgIHRvIGEgYFJvdXRlYCBpbiB0aGUgY29uZmlnLiBSZXR1cm5zIGBudWxsYCBpZlxuICAgKiB3ZSBjYW5ub3QgZmluZCBhIG1hdGNoIGZvciBfYW55XyBvZiB0aGUgY2hpbGRyZW4uXG4gICAqXG4gICAqIEBwYXJhbSBjb25maWcgLSBUaGUgYFJvdXRlc2AgdG8gbWF0Y2ggYWdhaW5zdFxuICAgKiBAcGFyYW0gc2VnbWVudEdyb3VwIC0gVGhlIGBVcmxTZWdtZW50R3JvdXBgIHdob3NlIGNoaWxkcmVuIG5lZWQgdG8gYmUgbWF0Y2hlZCBhZ2FpbnN0IHRoZVxuICAgKiAgICAgY29uZmlnLlxuICAgKi9cbiAgcHJvY2Vzc0NoaWxkcmVuKGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yLCBjb25maWc6IFJvdXRlW10sIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwKTpcbiAgICAgIE9ic2VydmFibGU8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD5bXXxudWxsPiB7XG4gICAgcmV0dXJuIGZyb20oT2JqZWN0LmtleXMoc2VnbWVudEdyb3VwLmNoaWxkcmVuKSlcbiAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICBjb25jYXRNYXAoY2hpbGRPdXRsZXQgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBjaGlsZCA9IHNlZ21lbnRHcm91cC5jaGlsZHJlbltjaGlsZE91dGxldF07XG4gICAgICAgICAgICAgIC8vIFNvcnQgdGhlIGNvbmZpZyBzbyB0aGF0IHJvdXRlcyB3aXRoIG91dGxldHMgdGhhdCBtYXRjaCB0aGUgb25lIGJlaW5nIGFjdGl2YXRlZFxuICAgICAgICAgICAgICAvLyBhcHBlYXIgZmlyc3QsIGZvbGxvd2VkIGJ5IHJvdXRlcyBmb3Igb3RoZXIgb3V0bGV0cywgd2hpY2ggbWlnaHQgbWF0Y2ggaWYgdGhleSBoYXZlXG4gICAgICAgICAgICAgIC8vIGFuIGVtcHR5IHBhdGguXG4gICAgICAgICAgICAgIGNvbnN0IHNvcnRlZENvbmZpZyA9IHNvcnRCeU1hdGNoaW5nT3V0bGV0cyhjb25maWcsIGNoaWxkT3V0bGV0KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc1NlZ21lbnRHcm91cChpbmplY3Rvciwgc29ydGVkQ29uZmlnLCBjaGlsZCwgY2hpbGRPdXRsZXQpO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBzY2FuKChjaGlsZHJlbiwgb3V0bGV0Q2hpbGRyZW4pID0+IHtcbiAgICAgICAgICAgICAgaWYgKCFjaGlsZHJlbiB8fCAhb3V0bGV0Q2hpbGRyZW4pIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKC4uLm91dGxldENoaWxkcmVuKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcmVuO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB0YWtlV2hpbGUoY2hpbGRyZW4gPT4gY2hpbGRyZW4gIT09IG51bGwpLFxuICAgICAgICAgICAgZGVmYXVsdElmRW1wdHkobnVsbCBhcyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdIHwgbnVsbCksXG4gICAgICAgICAgICByeGpzTGFzdCgpLFxuICAgICAgICAgICAgbWFwKGNoaWxkcmVuID0+IHtcbiAgICAgICAgICAgICAgaWYgKGNoaWxkcmVuID09PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgLy8gQmVjYXVzZSB3ZSBtYXkgaGF2ZSBtYXRjaGVkIHR3byBvdXRsZXRzIHRvIHRoZSBzYW1lIGVtcHR5IHBhdGggc2VnbWVudCwgd2UgY2FuIGhhdmVcbiAgICAgICAgICAgICAgLy8gbXVsdGlwbGUgYWN0aXZhdGVkIHJlc3VsdHMgZm9yIHRoZSBzYW1lIG91dGxldC4gV2Ugc2hvdWxkIG1lcmdlIHRoZSBjaGlsZHJlbiBvZlxuICAgICAgICAgICAgICAvLyB0aGVzZSByZXN1bHRzIHNvIHRoZSBmaW5hbCByZXR1cm4gdmFsdWUgaXMgb25seSBvbmUgYFRyZWVOb2RlYCBwZXIgb3V0bGV0LlxuICAgICAgICAgICAgICBjb25zdCBtZXJnZWRDaGlsZHJlbiA9IG1lcmdlRW1wdHlQYXRoTWF0Y2hlcyhjaGlsZHJlbik7XG4gICAgICAgICAgICAgIGlmIChOR19ERVZfTU9ERSkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIHJlYWxseSBuZXZlciBoYXBwZW4gLSB3ZSBhcmUgb25seSB0YWtpbmcgdGhlIGZpcnN0IG1hdGNoIGZvciBlYWNoXG4gICAgICAgICAgICAgICAgLy8gb3V0bGV0IGFuZCBtZXJnZSB0aGUgZW1wdHkgcGF0aCBtYXRjaGVzLlxuICAgICAgICAgICAgICAgIGNoZWNrT3V0bGV0TmFtZVVuaXF1ZW5lc3MobWVyZ2VkQ2hpbGRyZW4pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNvcnRBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90cyhtZXJnZWRDaGlsZHJlbik7XG4gICAgICAgICAgICAgIHJldHVybiBtZXJnZWRDaGlsZHJlbjtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICB9XG5cbiAgcHJvY2Vzc1NlZ21lbnQoXG4gICAgICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvciwgcm91dGVzOiBSb3V0ZVtdLCBzZWdtZW50R3JvdXA6IFVybFNlZ21lbnRHcm91cCxcbiAgICAgIHNlZ21lbnRzOiBVcmxTZWdtZW50W10sIG91dGxldDogc3RyaW5nKTogT2JzZXJ2YWJsZTxUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdfG51bGw+IHtcbiAgICByZXR1cm4gZnJvbShyb3V0ZXMpLnBpcGUoXG4gICAgICAgIGNvbmNhdE1hcChyID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzU2VnbWVudEFnYWluc3RSb3V0ZShcbiAgICAgICAgICAgICAgci5faW5qZWN0b3IgPz8gaW5qZWN0b3IsIHIsIHNlZ21lbnRHcm91cCwgc2VnbWVudHMsIG91dGxldCk7XG4gICAgICAgIH0pLFxuICAgICAgICBmaXJzdCgoeCk6IHggaXMgVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD5bXSA9PiAhIXgpLCBjYXRjaEVycm9yKGUgPT4ge1xuICAgICAgICAgIGlmIChpc0VtcHR5RXJyb3IoZSkpIHtcbiAgICAgICAgICAgIGlmIChub0xlZnRvdmVyc0luVXJsKHNlZ21lbnRHcm91cCwgc2VnbWVudHMsIG91dGxldCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG9mKFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvZihudWxsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfSkpO1xuICB9XG5cbiAgcHJvY2Vzc1NlZ21lbnRBZ2FpbnN0Um91dGUoXG4gICAgICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvciwgcm91dGU6IFJvdXRlLCByYXdTZWdtZW50OiBVcmxTZWdtZW50R3JvdXAsXG4gICAgICBzZWdtZW50czogVXJsU2VnbWVudFtdLCBvdXRsZXQ6IHN0cmluZyk6IE9ic2VydmFibGU8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD5bXXxudWxsPiB7XG4gICAgaWYgKHJvdXRlLnJlZGlyZWN0VG8gfHwgIWlzSW1tZWRpYXRlTWF0Y2gocm91dGUsIHJhd1NlZ21lbnQsIHNlZ21lbnRzLCBvdXRsZXQpKSByZXR1cm4gb2YobnVsbCk7XG5cbiAgICBsZXQgbWF0Y2hSZXN1bHQ6IE9ic2VydmFibGU8e1xuICAgICAgc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXG4gICAgICBjb25zdW1lZFNlZ21lbnRzOiBVcmxTZWdtZW50W10sXG4gICAgICByZW1haW5pbmdTZWdtZW50czogVXJsU2VnbWVudFtdLFxuICAgIH18bnVsbD47XG5cbiAgICBpZiAocm91dGUucGF0aCA9PT0gJyoqJykge1xuICAgICAgY29uc3QgcGFyYW1zID0gc2VnbWVudHMubGVuZ3RoID4gMCA/IGxhc3Qoc2VnbWVudHMpIS5wYXJhbWV0ZXJzIDoge307XG4gICAgICBjb25zdCBwYXRoSW5kZXhTaGlmdCA9IGdldFBhdGhJbmRleFNoaWZ0KHJhd1NlZ21lbnQpICsgc2VnbWVudHMubGVuZ3RoO1xuICAgICAgY29uc3Qgc25hcHNob3QgPSBuZXcgQWN0aXZhdGVkUm91dGVTbmFwc2hvdChcbiAgICAgICAgICBzZWdtZW50cywgcGFyYW1zLCBPYmplY3QuZnJlZXplKHsuLi50aGlzLnVybFRyZWUucXVlcnlQYXJhbXN9KSwgdGhpcy51cmxUcmVlLmZyYWdtZW50LFxuICAgICAgICAgIGdldERhdGEocm91dGUpLCBnZXRPdXRsZXQocm91dGUpLCByb3V0ZS5jb21wb25lbnQgPz8gcm91dGUuX2xvYWRlZENvbXBvbmVudCA/PyBudWxsLFxuICAgICAgICAgIHJvdXRlLCBnZXRTb3VyY2VTZWdtZW50R3JvdXAocmF3U2VnbWVudCksIHBhdGhJbmRleFNoaWZ0LCBnZXRSZXNvbHZlKHJvdXRlKSk7XG4gICAgICBtYXRjaFJlc3VsdCA9IG9mKHtcbiAgICAgICAgc25hcHNob3QsXG4gICAgICAgIGNvbnN1bWVkU2VnbWVudHM6IFtdLFxuICAgICAgICByZW1haW5pbmdTZWdtZW50czogW10sXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWF0Y2hSZXN1bHQgPVxuICAgICAgICAgIG1hdGNoV2l0aENoZWNrcyhyYXdTZWdtZW50LCByb3V0ZSwgc2VnbWVudHMsIGluamVjdG9yLCB0aGlzLnVybFNlcmlhbGl6ZXIpXG4gICAgICAgICAgICAgIC5waXBlKG1hcCgoe21hdGNoZWQsIGNvbnN1bWVkU2VnbWVudHMsIHJlbWFpbmluZ1NlZ21lbnRzLCBwYXJhbWV0ZXJzfSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlZCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhJbmRleFNoaWZ0ID0gZ2V0UGF0aEluZGV4U2hpZnQocmF3U2VnbWVudCkgKyBjb25zdW1lZFNlZ21lbnRzLmxlbmd0aDtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHNuYXBzaG90ID0gbmV3IEFjdGl2YXRlZFJvdXRlU25hcHNob3QoXG4gICAgICAgICAgICAgICAgICAgIGNvbnN1bWVkU2VnbWVudHMsIHBhcmFtZXRlcnMsIE9iamVjdC5mcmVlemUoey4uLnRoaXMudXJsVHJlZS5xdWVyeVBhcmFtc30pLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVybFRyZWUuZnJhZ21lbnQsIGdldERhdGEocm91dGUpLCBnZXRPdXRsZXQocm91dGUpLFxuICAgICAgICAgICAgICAgICAgICByb3V0ZS5jb21wb25lbnQgPz8gcm91dGUuX2xvYWRlZENvbXBvbmVudCA/PyBudWxsLCByb3V0ZSxcbiAgICAgICAgICAgICAgICAgICAgZ2V0U291cmNlU2VnbWVudEdyb3VwKHJhd1NlZ21lbnQpLCBwYXRoSW5kZXhTaGlmdCwgZ2V0UmVzb2x2ZShyb3V0ZSkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7c25hcHNob3QsIGNvbnN1bWVkU2VnbWVudHMsIHJlbWFpbmluZ1NlZ21lbnRzfTtcbiAgICAgICAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXRjaFJlc3VsdC5waXBlKHN3aXRjaE1hcCgocmVzdWx0KSA9PiB7XG4gICAgICBpZiAocmVzdWx0ID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBvZihudWxsKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHtzbmFwc2hvdCwgY29uc3VtZWRTZWdtZW50cywgcmVtYWluaW5nU2VnbWVudHN9ID0gcmVzdWx0O1xuICAgICAgLy8gSWYgdGhlIHJvdXRlIGhhcyBhbiBpbmplY3RvciBjcmVhdGVkIGZyb20gcHJvdmlkZXJzLCB3ZSBzaG91bGQgc3RhcnQgdXNpbmcgdGhhdC5cbiAgICAgIGluamVjdG9yID0gcm91dGUuX2luamVjdG9yID8/IGluamVjdG9yO1xuICAgICAgY29uc3QgY2hpbGRJbmplY3RvciA9IHJvdXRlLl9sb2FkZWRJbmplY3RvciA/PyBpbmplY3RvcjtcbiAgICAgIGNvbnN0IGNoaWxkQ29uZmlnOiBSb3V0ZVtdID0gZ2V0Q2hpbGRDb25maWcocm91dGUpO1xuXG4gICAgICBjb25zdCB7c2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50c30gPSBzcGxpdChcbiAgICAgICAgICByYXdTZWdtZW50LCBjb25zdW1lZFNlZ21lbnRzLCByZW1haW5pbmdTZWdtZW50cyxcbiAgICAgICAgICAvLyBGaWx0ZXIgb3V0IHJvdXRlcyB3aXRoIHJlZGlyZWN0VG8gYmVjYXVzZSB3ZSBhcmUgdHJ5aW5nIHRvIGNyZWF0ZSBhY3RpdmF0ZWQgcm91dGVcbiAgICAgICAgICAvLyBzbmFwc2hvdHMgYW5kIGRvbid0IGhhbmRsZSByZWRpcmVjdHMgaGVyZS4gVGhhdCBzaG91bGQgaGF2ZSBiZWVuIGRvbmUgaW5cbiAgICAgICAgICAvLyBgYXBwbHlSZWRpcmVjdHNgLlxuICAgICAgICAgIGNoaWxkQ29uZmlnLmZpbHRlcihjID0+IGMucmVkaXJlY3RUbyA9PT0gdW5kZWZpbmVkKSk7XG5cbiAgICAgIGlmIChzbGljZWRTZWdtZW50cy5sZW5ndGggPT09IDAgJiYgc2VnbWVudEdyb3VwLmhhc0NoaWxkcmVuKCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0NoaWxkcmVuKGNoaWxkSW5qZWN0b3IsIGNoaWxkQ29uZmlnLCBzZWdtZW50R3JvdXApLnBpcGUobWFwKGNoaWxkcmVuID0+IHtcbiAgICAgICAgICBpZiAoY2hpbGRyZW4gPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gW25ldyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PihzbmFwc2hvdCwgY2hpbGRyZW4pXTtcbiAgICAgICAgfSkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY2hpbGRDb25maWcubGVuZ3RoID09PSAwICYmIHNsaWNlZFNlZ21lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gb2YoW25ldyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PihzbmFwc2hvdCwgW10pXSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1hdGNoZWRPbk91dGxldCA9IGdldE91dGxldChyb3V0ZSkgPT09IG91dGxldDtcbiAgICAgIC8vIElmIHdlIG1hdGNoZWQgYSBjb25maWcgZHVlIHRvIGVtcHR5IHBhdGggbWF0Y2ggb24gYSBkaWZmZXJlbnQgb3V0bGV0LCB3ZSBuZWVkIHRvXG4gICAgICAvLyBjb250aW51ZSBwYXNzaW5nIHRoZSBjdXJyZW50IG91dGxldCBmb3IgdGhlIHNlZ21lbnQgcmF0aGVyIHRoYW4gc3dpdGNoIHRvIFBSSU1BUlkuXG4gICAgICAvLyBOb3RlIHRoYXQgd2Ugc3dpdGNoIHRvIHByaW1hcnkgd2hlbiB3ZSBoYXZlIGEgbWF0Y2ggYmVjYXVzZSBvdXRsZXQgY29uZmlncyBsb29rIGxpa2VcbiAgICAgIC8vIHRoaXM6IHtwYXRoOiAnYScsIG91dGxldDogJ2EnLCBjaGlsZHJlbjogW1xuICAgICAgLy8gIHtwYXRoOiAnYicsIGNvbXBvbmVudDogQn0sXG4gICAgICAvLyAge3BhdGg6ICdjJywgY29tcG9uZW50OiBDfSxcbiAgICAgIC8vIF19XG4gICAgICAvLyBOb3RpY2UgdGhhdCB0aGUgY2hpbGRyZW4gb2YgdGhlIG5hbWVkIG91dGxldCBhcmUgY29uZmlndXJlZCB3aXRoIHRoZSBwcmltYXJ5IG91dGxldFxuICAgICAgcmV0dXJuIHRoaXNcbiAgICAgICAgICAucHJvY2Vzc1NlZ21lbnQoXG4gICAgICAgICAgICAgIGNoaWxkSW5qZWN0b3IsIGNoaWxkQ29uZmlnLCBzZWdtZW50R3JvdXAsIHNsaWNlZFNlZ21lbnRzLFxuICAgICAgICAgICAgICBtYXRjaGVkT25PdXRsZXQgPyBQUklNQVJZX09VVExFVCA6IG91dGxldClcbiAgICAgICAgICAucGlwZShtYXAoY2hpbGRyZW4gPT4ge1xuICAgICAgICAgICAgaWYgKGNoaWxkcmVuID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtuZXcgVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4oc25hcHNob3QsIGNoaWxkcmVuKV07XG4gICAgICAgICAgfSkpO1xuICAgIH0pKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzb3J0QWN0aXZhdGVkUm91dGVTbmFwc2hvdHMobm9kZXM6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+W10pOiB2b2lkIHtcbiAgbm9kZXMuc29ydCgoYSwgYikgPT4ge1xuICAgIGlmIChhLnZhbHVlLm91dGxldCA9PT0gUFJJTUFSWV9PVVRMRVQpIHJldHVybiAtMTtcbiAgICBpZiAoYi52YWx1ZS5vdXRsZXQgPT09IFBSSU1BUllfT1VUTEVUKSByZXR1cm4gMTtcbiAgICByZXR1cm4gYS52YWx1ZS5vdXRsZXQubG9jYWxlQ29tcGFyZShiLnZhbHVlLm91dGxldCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRDaGlsZENvbmZpZyhyb3V0ZTogUm91dGUpOiBSb3V0ZVtdIHtcbiAgaWYgKHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgcmV0dXJuIHJvdXRlLmNoaWxkcmVuO1xuICB9XG5cbiAgaWYgKHJvdXRlLmxvYWRDaGlsZHJlbikge1xuICAgIHJldHVybiByb3V0ZS5fbG9hZGVkUm91dGVzITtcbiAgfVxuXG4gIHJldHVybiBbXTtcbn1cblxuZnVuY3Rpb24gaGFzRW1wdHlQYXRoQ29uZmlnKG5vZGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+KSB7XG4gIGNvbnN0IGNvbmZpZyA9IG5vZGUudmFsdWUucm91dGVDb25maWc7XG4gIHJldHVybiBjb25maWcgJiYgY29uZmlnLnBhdGggPT09ICcnICYmIGNvbmZpZy5yZWRpcmVjdFRvID09PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogRmluZHMgYFRyZWVOb2RlYHMgd2l0aCBtYXRjaGluZyBlbXB0eSBwYXRoIHJvdXRlIGNvbmZpZ3MgYW5kIG1lcmdlcyB0aGVtIGludG8gYFRyZWVOb2RlYCB3aXRoXG4gKiB0aGUgY2hpbGRyZW4gZnJvbSBlYWNoIGR1cGxpY2F0ZS4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBkaWZmZXJlbnQgb3V0bGV0cyBjYW4gbWF0Y2ggYVxuICogc2luZ2xlIGVtcHR5IHBhdGggcm91dGUgY29uZmlnIGFuZCB0aGUgcmVzdWx0cyBuZWVkIHRvIHRoZW4gYmUgbWVyZ2VkLlxuICovXG5mdW5jdGlvbiBtZXJnZUVtcHR5UGF0aE1hdGNoZXMobm9kZXM6IEFycmF5PFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+Pik6XG4gICAgQXJyYXk8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4+IHtcbiAgY29uc3QgcmVzdWx0OiBBcnJheTxUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90Pj4gPSBbXTtcbiAgLy8gVGhlIHNldCBvZiBub2RlcyB3aGljaCBjb250YWluIGNoaWxkcmVuIHRoYXQgd2VyZSBtZXJnZWQgZnJvbSB0d28gZHVwbGljYXRlIGVtcHR5IHBhdGggbm9kZXMuXG4gIGNvbnN0IG1lcmdlZE5vZGVzOiBTZXQ8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4+ID0gbmV3IFNldCgpO1xuXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmICghaGFzRW1wdHlQYXRoQ29uZmlnKG5vZGUpKSB7XG4gICAgICByZXN1bHQucHVzaChub2RlKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGR1cGxpY2F0ZUVtcHR5UGF0aE5vZGUgPVxuICAgICAgICByZXN1bHQuZmluZChyZXN1bHROb2RlID0+IG5vZGUudmFsdWUucm91dGVDb25maWcgPT09IHJlc3VsdE5vZGUudmFsdWUucm91dGVDb25maWcpO1xuICAgIGlmIChkdXBsaWNhdGVFbXB0eVBhdGhOb2RlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGR1cGxpY2F0ZUVtcHR5UGF0aE5vZGUuY2hpbGRyZW4ucHVzaCguLi5ub2RlLmNoaWxkcmVuKTtcbiAgICAgIG1lcmdlZE5vZGVzLmFkZChkdXBsaWNhdGVFbXB0eVBhdGhOb2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0LnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG4gIC8vIEZvciBlYWNoIG5vZGUgd2hpY2ggaGFzIGNoaWxkcmVuIGZyb20gbXVsdGlwbGUgc291cmNlcywgd2UgbmVlZCB0byByZWNvbXB1dGUgYSBuZXcgYFRyZWVOb2RlYFxuICAvLyBieSBhbHNvIG1lcmdpbmcgdGhvc2UgY2hpbGRyZW4uIFRoaXMgaXMgbmVjZXNzYXJ5IHdoZW4gdGhlcmUgYXJlIG11bHRpcGxlIGVtcHR5IHBhdGggY29uZmlnc1xuICAvLyBpbiBhIHJvdy4gUHV0IGFub3RoZXIgd2F5OiB3aGVuZXZlciB3ZSBjb21iaW5lIGNoaWxkcmVuIG9mIHR3byBub2Rlcywgd2UgbmVlZCB0byBhbHNvIGNoZWNrXG4gIC8vIGlmIGFueSBvZiB0aG9zZSBjaGlsZHJlbiBjYW4gYmUgY29tYmluZWQgaW50byBhIHNpbmdsZSBub2RlIGFzIHdlbGwuXG4gIGZvciAoY29uc3QgbWVyZ2VkTm9kZSBvZiBtZXJnZWROb2Rlcykge1xuICAgIGNvbnN0IG1lcmdlZENoaWxkcmVuID0gbWVyZ2VFbXB0eVBhdGhNYXRjaGVzKG1lcmdlZE5vZGUuY2hpbGRyZW4pO1xuICAgIHJlc3VsdC5wdXNoKG5ldyBUcmVlTm9kZShtZXJnZWROb2RlLnZhbHVlLCBtZXJnZWRDaGlsZHJlbikpO1xuICB9XG4gIHJldHVybiByZXN1bHQuZmlsdGVyKG4gPT4gIW1lcmdlZE5vZGVzLmhhcyhuKSk7XG59XG5cbmZ1bmN0aW9uIGNoZWNrT3V0bGV0TmFtZVVuaXF1ZW5lc3Mobm9kZXM6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+W10pOiB2b2lkIHtcbiAgY29uc3QgbmFtZXM6IHtbazogc3RyaW5nXTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdH0gPSB7fTtcbiAgbm9kZXMuZm9yRWFjaChuID0+IHtcbiAgICBjb25zdCByb3V0ZVdpdGhTYW1lT3V0bGV0TmFtZSA9IG5hbWVzW24udmFsdWUub3V0bGV0XTtcbiAgICBpZiAocm91dGVXaXRoU2FtZU91dGxldE5hbWUpIHtcbiAgICAgIGNvbnN0IHAgPSByb3V0ZVdpdGhTYW1lT3V0bGV0TmFtZS51cmwubWFwKHMgPT4gcy50b1N0cmluZygpKS5qb2luKCcvJyk7XG4gICAgICBjb25zdCBjID0gbi52YWx1ZS51cmwubWFwKHMgPT4gcy50b1N0cmluZygpKS5qb2luKCcvJyk7XG4gICAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVFdPX1NFR01FTlRTX1dJVEhfU0FNRV9PVVRMRVQsXG4gICAgICAgICAgTkdfREVWX01PREUgJiYgYFR3byBzZWdtZW50cyBjYW5ub3QgaGF2ZSB0aGUgc2FtZSBvdXRsZXQgbmFtZTogJyR7cH0nIGFuZCAnJHtjfScuYCk7XG4gICAgfVxuICAgIG5hbWVzW24udmFsdWUub3V0bGV0XSA9IG4udmFsdWU7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRTb3VyY2VTZWdtZW50R3JvdXAoc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXApOiBVcmxTZWdtZW50R3JvdXAge1xuICBsZXQgcyA9IHNlZ21lbnRHcm91cDtcbiAgd2hpbGUgKHMuX3NvdXJjZVNlZ21lbnQpIHtcbiAgICBzID0gcy5fc291cmNlU2VnbWVudDtcbiAgfVxuICByZXR1cm4gcztcbn1cblxuZnVuY3Rpb24gZ2V0UGF0aEluZGV4U2hpZnQoc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXApOiBudW1iZXIge1xuICBsZXQgcyA9IHNlZ21lbnRHcm91cDtcbiAgbGV0IHJlcyA9IHMuX3NlZ21lbnRJbmRleFNoaWZ0ID8/IDA7XG4gIHdoaWxlIChzLl9zb3VyY2VTZWdtZW50KSB7XG4gICAgcyA9IHMuX3NvdXJjZVNlZ21lbnQ7XG4gICAgcmVzICs9IHMuX3NlZ21lbnRJbmRleFNoaWZ0ID8/IDA7XG4gIH1cbiAgcmV0dXJuIHJlcyAtIDE7XG59XG5cbmZ1bmN0aW9uIGdldENvcnJlY3RlZFBhdGhJbmRleFNoaWZ0KHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwKTogbnVtYmVyIHtcbiAgbGV0IHMgPSBzZWdtZW50R3JvdXA7XG4gIGxldCByZXMgPSBzLl9zZWdtZW50SW5kZXhTaGlmdENvcnJlY3RlZCA/PyBzLl9zZWdtZW50SW5kZXhTaGlmdCA/PyAwO1xuICB3aGlsZSAocy5fc291cmNlU2VnbWVudCkge1xuICAgIHMgPSBzLl9zb3VyY2VTZWdtZW50O1xuICAgIHJlcyArPSBzLl9zZWdtZW50SW5kZXhTaGlmdENvcnJlY3RlZCA/PyBzLl9zZWdtZW50SW5kZXhTaGlmdCA/PyAwO1xuICB9XG4gIHJldHVybiByZXMgLSAxO1xufVxuXG5mdW5jdGlvbiBnZXREYXRhKHJvdXRlOiBSb3V0ZSk6IERhdGEge1xuICByZXR1cm4gcm91dGUuZGF0YSB8fCB7fTtcbn1cblxuZnVuY3Rpb24gZ2V0UmVzb2x2ZShyb3V0ZTogUm91dGUpOiBSZXNvbHZlRGF0YSB7XG4gIHJldHVybiByb3V0ZS5yZXNvbHZlIHx8IHt9O1xufVxuIl19