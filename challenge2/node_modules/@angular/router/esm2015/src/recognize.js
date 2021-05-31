/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Observable, of } from 'rxjs';
import { ActivatedRouteSnapshot, inheritedParamsDataResolve, RouterStateSnapshot } from './router_state';
import { PRIMARY_OUTLET } from './shared';
import { last } from './utils/collection';
import { getOutlet, sortByMatchingOutlets } from './utils/config';
import { isImmediateMatch, match, noLeftoversInUrl, split } from './utils/config_matching';
import { TreeNode } from './utils/tree';
class NoMatch {
}
function newObservableError(e) {
    // TODO(atscott): This pattern is used throughout the router code and can be `throwError` instead.
    return new Observable((obs) => obs.error(e));
}
export function recognize(rootComponentType, config, urlTree, url, paramsInheritanceStrategy = 'emptyOnly', relativeLinkResolution = 'legacy') {
    try {
        const result = new Recognizer(rootComponentType, config, urlTree, url, paramsInheritanceStrategy, relativeLinkResolution)
            .recognize();
        if (result === null) {
            return newObservableError(new NoMatch());
        }
        else {
            return of(result);
        }
    }
    catch (e) {
        // Catch the potential error from recognize due to duplicate outlet matches and return as an
        // `Observable` error instead.
        return newObservableError(e);
    }
}
export class Recognizer {
    constructor(rootComponentType, config, urlTree, url, paramsInheritanceStrategy, relativeLinkResolution) {
        this.rootComponentType = rootComponentType;
        this.config = config;
        this.urlTree = urlTree;
        this.url = url;
        this.paramsInheritanceStrategy = paramsInheritanceStrategy;
        this.relativeLinkResolution = relativeLinkResolution;
    }
    recognize() {
        const rootSegmentGroup = split(this.urlTree.root, [], [], this.config.filter(c => c.redirectTo === undefined), this.relativeLinkResolution)
            .segmentGroup;
        const children = this.processSegmentGroup(this.config, rootSegmentGroup, PRIMARY_OUTLET);
        if (children === null) {
            return null;
        }
        // Use Object.freeze to prevent readers of the Router state from modifying it outside of a
        // navigation, resulting in the router being out of sync with the browser.
        const root = new ActivatedRouteSnapshot([], Object.freeze({}), Object.freeze(Object.assign({}, this.urlTree.queryParams)), this.urlTree.fragment, {}, PRIMARY_OUTLET, this.rootComponentType, null, this.urlTree.root, -1, {});
        const rootNode = new TreeNode(root, children);
        const routeState = new RouterStateSnapshot(this.url, rootNode);
        this.inheritParamsAndData(routeState._root);
        return routeState;
    }
    inheritParamsAndData(routeNode) {
        const route = routeNode.value;
        const i = inheritedParamsDataResolve(route, this.paramsInheritanceStrategy);
        route.params = Object.freeze(i.params);
        route.data = Object.freeze(i.data);
        routeNode.children.forEach(n => this.inheritParamsAndData(n));
    }
    processSegmentGroup(config, segmentGroup, outlet) {
        if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
            return this.processChildren(config, segmentGroup);
        }
        return this.processSegment(config, segmentGroup, segmentGroup.segments, outlet);
    }
    /**
     * Matches every child outlet in the `segmentGroup` to a `Route` in the config. Returns `null` if
     * we cannot find a match for _any_ of the children.
     *
     * @param config - The `Routes` to match against
     * @param segmentGroup - The `UrlSegmentGroup` whose children need to be matched against the
     *     config.
     */
    processChildren(config, segmentGroup) {
        const children = [];
        for (const childOutlet of Object.keys(segmentGroup.children)) {
            const child = segmentGroup.children[childOutlet];
            // Sort the config so that routes with outlets that match the one being activated appear
            // first, followed by routes for other outlets, which might match if they have an empty path.
            const sortedConfig = sortByMatchingOutlets(config, childOutlet);
            const outletChildren = this.processSegmentGroup(sortedConfig, child, childOutlet);
            if (outletChildren === null) {
                // Configs must match all segment children so because we did not find a match for this
                // outlet, return `null`.
                return null;
            }
            children.push(...outletChildren);
        }
        // Because we may have matched two outlets to the same empty path segment, we can have multiple
        // activated results for the same outlet. We should merge the children of these results so the
        // final return value is only one `TreeNode` per outlet.
        const mergedChildren = mergeEmptyPathMatches(children);
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            // This should really never happen - we are only taking the first match for each outlet and
            // merge the empty path matches.
            checkOutletNameUniqueness(mergedChildren);
        }
        sortActivatedRouteSnapshots(mergedChildren);
        return mergedChildren;
    }
    processSegment(config, segmentGroup, segments, outlet) {
        for (const r of config) {
            const children = this.processSegmentAgainstRoute(r, segmentGroup, segments, outlet);
            if (children !== null) {
                return children;
            }
        }
        if (noLeftoversInUrl(segmentGroup, segments, outlet)) {
            return [];
        }
        return null;
    }
    processSegmentAgainstRoute(route, rawSegment, segments, outlet) {
        if (route.redirectTo || !isImmediateMatch(route, rawSegment, segments, outlet))
            return null;
        let snapshot;
        let consumedSegments = [];
        let rawSlicedSegments = [];
        if (route.path === '**') {
            const params = segments.length > 0 ? last(segments).parameters : {};
            snapshot = new ActivatedRouteSnapshot(segments, params, Object.freeze(Object.assign({}, this.urlTree.queryParams)), this.urlTree.fragment, getData(route), getOutlet(route), route.component, route, getSourceSegmentGroup(rawSegment), getPathIndexShift(rawSegment) + segments.length, getResolve(route));
        }
        else {
            const result = match(rawSegment, route, segments);
            if (!result.matched) {
                return null;
            }
            consumedSegments = result.consumedSegments;
            rawSlicedSegments = segments.slice(result.lastChild);
            snapshot = new ActivatedRouteSnapshot(consumedSegments, result.parameters, Object.freeze(Object.assign({}, this.urlTree.queryParams)), this.urlTree.fragment, getData(route), getOutlet(route), route.component, route, getSourceSegmentGroup(rawSegment), getPathIndexShift(rawSegment) + consumedSegments.length, getResolve(route));
        }
        const childConfig = getChildConfig(route);
        const { segmentGroup, slicedSegments } = split(rawSegment, consumedSegments, rawSlicedSegments, 
        // Filter out routes with redirectTo because we are trying to create activated route
        // snapshots and don't handle redirects here. That should have been done in
        // `applyRedirects`.
        childConfig.filter(c => c.redirectTo === undefined), this.relativeLinkResolution);
        if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
            const children = this.processChildren(childConfig, segmentGroup);
            if (children === null) {
                return null;
            }
            return [new TreeNode(snapshot, children)];
        }
        if (childConfig.length === 0 && slicedSegments.length === 0) {
            return [new TreeNode(snapshot, [])];
        }
        const matchedOnOutlet = getOutlet(route) === outlet;
        // If we matched a config due to empty path match on a different outlet, we need to continue
        // passing the current outlet for the segment rather than switch to PRIMARY.
        // Note that we switch to primary when we have a match because outlet configs look like this:
        // {path: 'a', outlet: 'a', children: [
        //  {path: 'b', component: B},
        //  {path: 'c', component: C},
        // ]}
        // Notice that the children of the named outlet are configured with the primary outlet
        const children = this.processSegment(childConfig, segmentGroup, slicedSegments, matchedOnOutlet ? PRIMARY_OUTLET : outlet);
        if (children === null) {
            return null;
        }
        return [new TreeNode(snapshot, children)];
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
        return route._loadedConfig.routes;
    }
    return [];
}
function hasEmptyPathConfig(node) {
    const config = node.value.routeConfig;
    return config && config.path === '' && config.redirectTo === undefined;
}
/**
 * Finds `TreeNode`s with matching empty path route configs and merges them into `TreeNode` with the
 * children from each duplicate. This is necessary because different outlets can match a single
 * empty path route config and the results need to then be merged.
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
    // by also merging those children. This is necessary when there are multiple empty path configs in
    // a row. Put another way: whenever we combine children of two nodes, we need to also check if any
    // of those children can be combined into a single node as well.
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
            throw new Error(`Two segments cannot have the same outlet name: '${p}' and '${c}'.`);
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
    let res = (s._segmentIndexShift ? s._segmentIndexShift : 0);
    while (s._sourceSegment) {
        s = s._sourceSegment;
        res += (s._segmentIndexShift ? s._segmentIndexShift : 0);
    }
    return res - 1;
}
function getData(route) {
    return route.data || {};
}
function getResolve(route) {
    return route.resolve || {};
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb2duaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yZWNvZ25pemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0gsT0FBTyxFQUFDLFVBQVUsRUFBWSxFQUFFLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFHOUMsT0FBTyxFQUFDLHNCQUFzQixFQUFFLDBCQUEwQixFQUE2QixtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2xJLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFFeEMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3hDLE9BQU8sRUFBQyxTQUFTLEVBQUUscUJBQXFCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNoRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQ3pGLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFdEMsTUFBTSxPQUFPO0NBQUc7QUFFaEIsU0FBUyxrQkFBa0IsQ0FBQyxDQUFVO0lBQ3BDLGtHQUFrRztJQUNsRyxPQUFPLElBQUksVUFBVSxDQUFzQixDQUFDLEdBQWtDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRyxDQUFDO0FBRUQsTUFBTSxVQUFVLFNBQVMsQ0FDckIsaUJBQWlDLEVBQUUsTUFBYyxFQUFFLE9BQWdCLEVBQUUsR0FBVyxFQUNoRiw0QkFBdUQsV0FBVyxFQUNsRSx5QkFBK0MsUUFBUTtJQUN6RCxJQUFJO1FBQ0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQ1YsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUseUJBQXlCLEVBQ2xFLHNCQUFzQixDQUFDO2FBQ3RCLFNBQVMsRUFBRSxDQUFDO1FBQ2hDLElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtZQUNuQixPQUFPLGtCQUFrQixDQUFDLElBQUksT0FBTyxFQUFFLENBQUMsQ0FBQztTQUMxQzthQUFNO1lBQ0wsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDbkI7S0FDRjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsNEZBQTRGO1FBQzVGLDhCQUE4QjtRQUM5QixPQUFPLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzlCO0FBQ0gsQ0FBQztBQUVELE1BQU0sT0FBTyxVQUFVO0lBQ3JCLFlBQ1ksaUJBQWlDLEVBQVUsTUFBYyxFQUFVLE9BQWdCLEVBQ25GLEdBQVcsRUFBVSx5QkFBb0QsRUFDekUsc0JBQTRDO1FBRjVDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBZ0I7UUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUNuRixRQUFHLEdBQUgsR0FBRyxDQUFRO1FBQVUsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUN6RSwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXNCO0lBQUcsQ0FBQztJQUU1RCxTQUFTO1FBQ1AsTUFBTSxnQkFBZ0IsR0FDbEIsS0FBSyxDQUNELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxFQUM5RSxJQUFJLENBQUMsc0JBQXNCLENBQUM7YUFDM0IsWUFBWSxDQUFDO1FBRXRCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3pGLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtZQUNyQixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsMEZBQTBGO1FBQzFGLDBFQUEwRTtRQUMxRSxNQUFNLElBQUksR0FBRyxJQUFJLHNCQUFzQixDQUNuQyxFQUFFLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxtQkFBSyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUMxRixFQUFFLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakYsTUFBTSxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQXlCLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0RSxNQUFNLFVBQVUsR0FBRyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QyxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0lBRUQsb0JBQW9CLENBQUMsU0FBMkM7UUFDOUQsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztRQUU5QixNQUFNLENBQUMsR0FBRywwQkFBMEIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDNUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxLQUFLLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRW5DLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVELG1CQUFtQixDQUFDLE1BQWUsRUFBRSxZQUE2QixFQUFFLE1BQWM7UUFFaEYsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksWUFBWSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ3BFLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDbkQ7UUFFRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsZUFBZSxDQUFDLE1BQWUsRUFBRSxZQUE2QjtRQUU1RCxNQUFNLFFBQVEsR0FBNEMsRUFBRSxDQUFDO1FBQzdELEtBQUssTUFBTSxXQUFXLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDNUQsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNqRCx3RkFBd0Y7WUFDeEYsNkZBQTZGO1lBQzdGLE1BQU0sWUFBWSxHQUFHLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNoRSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNsRixJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUU7Z0JBQzNCLHNGQUFzRjtnQkFDdEYseUJBQXlCO2dCQUN6QixPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDO1NBQ2xDO1FBQ0QsK0ZBQStGO1FBQy9GLDhGQUE4RjtRQUM5Rix3REFBd0Q7UUFDeEQsTUFBTSxjQUFjLEdBQUcscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkQsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxFQUFFO1lBQ2pELDJGQUEyRjtZQUMzRixnQ0FBZ0M7WUFDaEMseUJBQXlCLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDM0M7UUFDRCwyQkFBMkIsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM1QyxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBRUQsY0FBYyxDQUNWLE1BQWUsRUFBRSxZQUE2QixFQUFFLFFBQXNCLEVBQ3RFLE1BQWM7UUFDaEIsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNLEVBQUU7WUFDdEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3BGLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtnQkFDckIsT0FBTyxRQUFRLENBQUM7YUFDakI7U0FDRjtRQUNELElBQUksZ0JBQWdCLENBQUMsWUFBWSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtZQUNwRCxPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsMEJBQTBCLENBQ3RCLEtBQVksRUFBRSxVQUEyQixFQUFFLFFBQXNCLEVBQ2pFLE1BQWM7UUFDaEIsSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFNUYsSUFBSSxRQUFnQyxDQUFDO1FBQ3JDLElBQUksZ0JBQWdCLEdBQWlCLEVBQUUsQ0FBQztRQUN4QyxJQUFJLGlCQUFpQixHQUFpQixFQUFFLENBQUM7UUFFekMsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtZQUN2QixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3JFLFFBQVEsR0FBRyxJQUFJLHNCQUFzQixDQUNqQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLG1CQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQ3JGLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLFNBQVUsRUFBRSxLQUFLLEVBQ3pELHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQ2xGLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ3hCO2FBQU07WUFDTCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDbkIsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUMzQyxpQkFBaUIsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVyRCxRQUFRLEdBQUcsSUFBSSxzQkFBc0IsQ0FDakMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsTUFBTSxtQkFBSyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUNqRixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxTQUFVLEVBQUUsS0FBSyxFQUNoRixxQkFBcUIsQ0FBQyxVQUFVLENBQUMsRUFDakMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsTUFBTSxXQUFXLEdBQVksY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRW5ELE1BQU0sRUFBQyxZQUFZLEVBQUUsY0FBYyxFQUFDLEdBQUcsS0FBSyxDQUN4QyxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCO1FBQy9DLG9GQUFvRjtRQUNwRiwyRUFBMkU7UUFDM0Usb0JBQW9CO1FBQ3BCLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBRXRGLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksWUFBWSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQzdELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ2pFLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtnQkFDckIsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELE9BQU8sQ0FBQyxJQUFJLFFBQVEsQ0FBeUIsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7U0FDbkU7UUFFRCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzNELE9BQU8sQ0FBQyxJQUFJLFFBQVEsQ0FBeUIsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDN0Q7UUFFRCxNQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssTUFBTSxDQUFDO1FBQ3BELDRGQUE0RjtRQUM1Riw0RUFBNEU7UUFDNUUsNkZBQTZGO1FBQzdGLHVDQUF1QztRQUN2Qyw4QkFBOEI7UUFDOUIsOEJBQThCO1FBQzlCLEtBQUs7UUFDTCxzRkFBc0Y7UUFDdEYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FDaEMsV0FBVyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFGLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtZQUNyQixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxDQUFDLElBQUksUUFBUSxDQUF5QixRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNwRSxDQUFDO0NBQ0Y7QUFFRCxTQUFTLDJCQUEyQixDQUFDLEtBQXlDO0lBQzVFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEIsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxjQUFjO1lBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLGNBQWM7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRCxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3RELENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLEtBQVk7SUFDbEMsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO1FBQ2xCLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQztLQUN2QjtJQUVELElBQUksS0FBSyxDQUFDLFlBQVksRUFBRTtRQUN0QixPQUFPLEtBQUssQ0FBQyxhQUFjLENBQUMsTUFBTSxDQUFDO0tBQ3BDO0lBRUQsT0FBTyxFQUFFLENBQUM7QUFDWixDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxJQUFzQztJQUNoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztJQUN0QyxPQUFPLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUUsSUFBSSxNQUFNLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQztBQUN6RSxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMscUJBQXFCLENBQUMsS0FBOEM7SUFFM0UsTUFBTSxNQUFNLEdBQTRDLEVBQUUsQ0FBQztJQUMzRCxnR0FBZ0c7SUFDaEcsTUFBTSxXQUFXLEdBQTBDLElBQUksR0FBRyxFQUFFLENBQUM7SUFFckUsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7UUFDeEIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEIsU0FBUztTQUNWO1FBRUQsTUFBTSxzQkFBc0IsR0FDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxLQUFLLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkYsSUFBSSxzQkFBc0IsS0FBSyxTQUFTLEVBQUU7WUFDeEMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RCxXQUFXLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7U0FDekM7YUFBTTtZQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbkI7S0FDRjtJQUNELGdHQUFnRztJQUNoRyxrR0FBa0c7SUFDbEcsa0dBQWtHO0lBQ2xHLGdFQUFnRTtJQUNoRSxLQUFLLE1BQU0sVUFBVSxJQUFJLFdBQVcsRUFBRTtRQUNwQyxNQUFNLGNBQWMsR0FBRyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7S0FDN0Q7SUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRCxDQUFDO0FBRUQsU0FBUyx5QkFBeUIsQ0FBQyxLQUF5QztJQUMxRSxNQUFNLEtBQUssR0FBMEMsRUFBRSxDQUFDO0lBQ3hELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDaEIsTUFBTSx1QkFBdUIsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RCxJQUFJLHVCQUF1QixFQUFFO1lBQzNCLE1BQU0sQ0FBQyxHQUFHLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdkUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sSUFBSSxLQUFLLENBQUMsbURBQW1ELENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3RGO1FBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNsQyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUFDLFlBQTZCO0lBQzFELElBQUksQ0FBQyxHQUFHLFlBQVksQ0FBQztJQUNyQixPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUU7UUFDdkIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUM7S0FDdEI7SUFDRCxPQUFPLENBQUMsQ0FBQztBQUNYLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLFlBQTZCO0lBQ3RELElBQUksQ0FBQyxHQUFHLFlBQVksQ0FBQztJQUNyQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RCxPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUU7UUFDdkIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUM7UUFDckIsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFEO0lBQ0QsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FBQyxLQUFZO0lBQzNCLE9BQU8sS0FBSyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7QUFDMUIsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLEtBQVk7SUFDOUIsT0FBTyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztBQUM3QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7VHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIE9ic2VydmVyLCBvZn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7RGF0YSwgUmVzb2x2ZURhdGEsIFJvdXRlLCBSb3V0ZXN9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgaW5oZXJpdGVkUGFyYW1zRGF0YVJlc29sdmUsIFBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3ksIFJvdXRlclN0YXRlU25hcHNob3R9IGZyb20gJy4vcm91dGVyX3N0YXRlJztcbmltcG9ydCB7UFJJTUFSWV9PVVRMRVR9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7VXJsU2VnbWVudCwgVXJsU2VnbWVudEdyb3VwLCBVcmxUcmVlfSBmcm9tICcuL3VybF90cmVlJztcbmltcG9ydCB7bGFzdH0gZnJvbSAnLi91dGlscy9jb2xsZWN0aW9uJztcbmltcG9ydCB7Z2V0T3V0bGV0LCBzb3J0QnlNYXRjaGluZ091dGxldHN9IGZyb20gJy4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7aXNJbW1lZGlhdGVNYXRjaCwgbWF0Y2gsIG5vTGVmdG92ZXJzSW5VcmwsIHNwbGl0fSBmcm9tICcuL3V0aWxzL2NvbmZpZ19tYXRjaGluZyc7XG5pbXBvcnQge1RyZWVOb2RlfSBmcm9tICcuL3V0aWxzL3RyZWUnO1xuXG5jbGFzcyBOb01hdGNoIHt9XG5cbmZ1bmN0aW9uIG5ld09ic2VydmFibGVFcnJvcihlOiB1bmtub3duKTogT2JzZXJ2YWJsZTxSb3V0ZXJTdGF0ZVNuYXBzaG90PiB7XG4gIC8vIFRPRE8oYXRzY290dCk6IFRoaXMgcGF0dGVybiBpcyB1c2VkIHRocm91Z2hvdXQgdGhlIHJvdXRlciBjb2RlIGFuZCBjYW4gYmUgYHRocm93RXJyb3JgIGluc3RlYWQuXG4gIHJldHVybiBuZXcgT2JzZXJ2YWJsZTxSb3V0ZXJTdGF0ZVNuYXBzaG90Pigob2JzOiBPYnNlcnZlcjxSb3V0ZXJTdGF0ZVNuYXBzaG90PikgPT4gb2JzLmVycm9yKGUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlY29nbml6ZShcbiAgICByb290Q29tcG9uZW50VHlwZTogVHlwZTxhbnk+fG51bGwsIGNvbmZpZzogUm91dGVzLCB1cmxUcmVlOiBVcmxUcmVlLCB1cmw6IHN0cmluZyxcbiAgICBwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5OiBQYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5ID0gJ2VtcHR5T25seScsXG4gICAgcmVsYXRpdmVMaW5rUmVzb2x1dGlvbjogJ2xlZ2FjeSd8J2NvcnJlY3RlZCcgPSAnbGVnYWN5Jyk6IE9ic2VydmFibGU8Um91dGVyU3RhdGVTbmFwc2hvdD4ge1xuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBSZWNvZ25pemVyKFxuICAgICAgICAgICAgICAgICAgICAgICByb290Q29tcG9uZW50VHlwZSwgY29uZmlnLCB1cmxUcmVlLCB1cmwsIHBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3ksXG4gICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlTGlua1Jlc29sdXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgIC5yZWNvZ25pemUoKTtcbiAgICBpZiAocmVzdWx0ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbmV3T2JzZXJ2YWJsZUVycm9yKG5ldyBOb01hdGNoKCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2YocmVzdWx0KTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBDYXRjaCB0aGUgcG90ZW50aWFsIGVycm9yIGZyb20gcmVjb2duaXplIGR1ZSB0byBkdXBsaWNhdGUgb3V0bGV0IG1hdGNoZXMgYW5kIHJldHVybiBhcyBhblxuICAgIC8vIGBPYnNlcnZhYmxlYCBlcnJvciBpbnN0ZWFkLlxuICAgIHJldHVybiBuZXdPYnNlcnZhYmxlRXJyb3IoZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlY29nbml6ZXIge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcm9vdENvbXBvbmVudFR5cGU6IFR5cGU8YW55PnxudWxsLCBwcml2YXRlIGNvbmZpZzogUm91dGVzLCBwcml2YXRlIHVybFRyZWU6IFVybFRyZWUsXG4gICAgICBwcml2YXRlIHVybDogc3RyaW5nLCBwcml2YXRlIHBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3k6IFBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3ksXG4gICAgICBwcml2YXRlIHJlbGF0aXZlTGlua1Jlc29sdXRpb246ICdsZWdhY3knfCdjb3JyZWN0ZWQnKSB7fVxuXG4gIHJlY29nbml6ZSgpOiBSb3V0ZXJTdGF0ZVNuYXBzaG90fG51bGwge1xuICAgIGNvbnN0IHJvb3RTZWdtZW50R3JvdXAgPVxuICAgICAgICBzcGxpdChcbiAgICAgICAgICAgIHRoaXMudXJsVHJlZS5yb290LCBbXSwgW10sIHRoaXMuY29uZmlnLmZpbHRlcihjID0+IGMucmVkaXJlY3RUbyA9PT0gdW5kZWZpbmVkKSxcbiAgICAgICAgICAgIHRoaXMucmVsYXRpdmVMaW5rUmVzb2x1dGlvbilcbiAgICAgICAgICAgIC5zZWdtZW50R3JvdXA7XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMucHJvY2Vzc1NlZ21lbnRHcm91cCh0aGlzLmNvbmZpZywgcm9vdFNlZ21lbnRHcm91cCwgUFJJTUFSWV9PVVRMRVQpO1xuICAgIGlmIChjaGlsZHJlbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gVXNlIE9iamVjdC5mcmVlemUgdG8gcHJldmVudCByZWFkZXJzIG9mIHRoZSBSb3V0ZXIgc3RhdGUgZnJvbSBtb2RpZnlpbmcgaXQgb3V0c2lkZSBvZiBhXG4gICAgLy8gbmF2aWdhdGlvbiwgcmVzdWx0aW5nIGluIHRoZSByb3V0ZXIgYmVpbmcgb3V0IG9mIHN5bmMgd2l0aCB0aGUgYnJvd3Nlci5cbiAgICBjb25zdCByb290ID0gbmV3IEFjdGl2YXRlZFJvdXRlU25hcHNob3QoXG4gICAgICAgIFtdLCBPYmplY3QuZnJlZXplKHt9KSwgT2JqZWN0LmZyZWV6ZSh7Li4udGhpcy51cmxUcmVlLnF1ZXJ5UGFyYW1zfSksIHRoaXMudXJsVHJlZS5mcmFnbWVudCxcbiAgICAgICAge30sIFBSSU1BUllfT1VUTEVULCB0aGlzLnJvb3RDb21wb25lbnRUeXBlLCBudWxsLCB0aGlzLnVybFRyZWUucm9vdCwgLTEsIHt9KTtcblxuICAgIGNvbnN0IHJvb3ROb2RlID0gbmV3IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+KHJvb3QsIGNoaWxkcmVuKTtcbiAgICBjb25zdCByb3V0ZVN0YXRlID0gbmV3IFJvdXRlclN0YXRlU25hcHNob3QodGhpcy51cmwsIHJvb3ROb2RlKTtcbiAgICB0aGlzLmluaGVyaXRQYXJhbXNBbmREYXRhKHJvdXRlU3RhdGUuX3Jvb3QpO1xuICAgIHJldHVybiByb3V0ZVN0YXRlO1xuICB9XG5cbiAgaW5oZXJpdFBhcmFtc0FuZERhdGEocm91dGVOb2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90Pik6IHZvaWQge1xuICAgIGNvbnN0IHJvdXRlID0gcm91dGVOb2RlLnZhbHVlO1xuXG4gICAgY29uc3QgaSA9IGluaGVyaXRlZFBhcmFtc0RhdGFSZXNvbHZlKHJvdXRlLCB0aGlzLnBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3kpO1xuICAgIHJvdXRlLnBhcmFtcyA9IE9iamVjdC5mcmVlemUoaS5wYXJhbXMpO1xuICAgIHJvdXRlLmRhdGEgPSBPYmplY3QuZnJlZXplKGkuZGF0YSk7XG5cbiAgICByb3V0ZU5vZGUuY2hpbGRyZW4uZm9yRWFjaChuID0+IHRoaXMuaW5oZXJpdFBhcmFtc0FuZERhdGEobikpO1xuICB9XG5cbiAgcHJvY2Vzc1NlZ21lbnRHcm91cChjb25maWc6IFJvdXRlW10sIHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwLCBvdXRsZXQ6IHN0cmluZyk6XG4gICAgICBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdfG51bGwge1xuICAgIGlmIChzZWdtZW50R3JvdXAuc2VnbWVudHMubGVuZ3RoID09PSAwICYmIHNlZ21lbnRHcm91cC5oYXNDaGlsZHJlbigpKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9jZXNzQ2hpbGRyZW4oY29uZmlnLCBzZWdtZW50R3JvdXApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnByb2Nlc3NTZWdtZW50KGNvbmZpZywgc2VnbWVudEdyb3VwLCBzZWdtZW50R3JvdXAuc2VnbWVudHMsIG91dGxldCk7XG4gIH1cblxuICAvKipcbiAgICogTWF0Y2hlcyBldmVyeSBjaGlsZCBvdXRsZXQgaW4gdGhlIGBzZWdtZW50R3JvdXBgIHRvIGEgYFJvdXRlYCBpbiB0aGUgY29uZmlnLiBSZXR1cm5zIGBudWxsYCBpZlxuICAgKiB3ZSBjYW5ub3QgZmluZCBhIG1hdGNoIGZvciBfYW55XyBvZiB0aGUgY2hpbGRyZW4uXG4gICAqXG4gICAqIEBwYXJhbSBjb25maWcgLSBUaGUgYFJvdXRlc2AgdG8gbWF0Y2ggYWdhaW5zdFxuICAgKiBAcGFyYW0gc2VnbWVudEdyb3VwIC0gVGhlIGBVcmxTZWdtZW50R3JvdXBgIHdob3NlIGNoaWxkcmVuIG5lZWQgdG8gYmUgbWF0Y2hlZCBhZ2FpbnN0IHRoZVxuICAgKiAgICAgY29uZmlnLlxuICAgKi9cbiAgcHJvY2Vzc0NoaWxkcmVuKGNvbmZpZzogUm91dGVbXSwgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXApOlxuICAgICAgVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD5bXXxudWxsIHtcbiAgICBjb25zdCBjaGlsZHJlbjogQXJyYXk8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4+ID0gW107XG4gICAgZm9yIChjb25zdCBjaGlsZE91dGxldCBvZiBPYmplY3Qua2V5cyhzZWdtZW50R3JvdXAuY2hpbGRyZW4pKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IHNlZ21lbnRHcm91cC5jaGlsZHJlbltjaGlsZE91dGxldF07XG4gICAgICAvLyBTb3J0IHRoZSBjb25maWcgc28gdGhhdCByb3V0ZXMgd2l0aCBvdXRsZXRzIHRoYXQgbWF0Y2ggdGhlIG9uZSBiZWluZyBhY3RpdmF0ZWQgYXBwZWFyXG4gICAgICAvLyBmaXJzdCwgZm9sbG93ZWQgYnkgcm91dGVzIGZvciBvdGhlciBvdXRsZXRzLCB3aGljaCBtaWdodCBtYXRjaCBpZiB0aGV5IGhhdmUgYW4gZW1wdHkgcGF0aC5cbiAgICAgIGNvbnN0IHNvcnRlZENvbmZpZyA9IHNvcnRCeU1hdGNoaW5nT3V0bGV0cyhjb25maWcsIGNoaWxkT3V0bGV0KTtcbiAgICAgIGNvbnN0IG91dGxldENoaWxkcmVuID0gdGhpcy5wcm9jZXNzU2VnbWVudEdyb3VwKHNvcnRlZENvbmZpZywgY2hpbGQsIGNoaWxkT3V0bGV0KTtcbiAgICAgIGlmIChvdXRsZXRDaGlsZHJlbiA9PT0gbnVsbCkge1xuICAgICAgICAvLyBDb25maWdzIG11c3QgbWF0Y2ggYWxsIHNlZ21lbnQgY2hpbGRyZW4gc28gYmVjYXVzZSB3ZSBkaWQgbm90IGZpbmQgYSBtYXRjaCBmb3IgdGhpc1xuICAgICAgICAvLyBvdXRsZXQsIHJldHVybiBgbnVsbGAuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgY2hpbGRyZW4ucHVzaCguLi5vdXRsZXRDaGlsZHJlbik7XG4gICAgfVxuICAgIC8vIEJlY2F1c2Ugd2UgbWF5IGhhdmUgbWF0Y2hlZCB0d28gb3V0bGV0cyB0byB0aGUgc2FtZSBlbXB0eSBwYXRoIHNlZ21lbnQsIHdlIGNhbiBoYXZlIG11bHRpcGxlXG4gICAgLy8gYWN0aXZhdGVkIHJlc3VsdHMgZm9yIHRoZSBzYW1lIG91dGxldC4gV2Ugc2hvdWxkIG1lcmdlIHRoZSBjaGlsZHJlbiBvZiB0aGVzZSByZXN1bHRzIHNvIHRoZVxuICAgIC8vIGZpbmFsIHJldHVybiB2YWx1ZSBpcyBvbmx5IG9uZSBgVHJlZU5vZGVgIHBlciBvdXRsZXQuXG4gICAgY29uc3QgbWVyZ2VkQ2hpbGRyZW4gPSBtZXJnZUVtcHR5UGF0aE1hdGNoZXMoY2hpbGRyZW4pO1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIC8vIFRoaXMgc2hvdWxkIHJlYWxseSBuZXZlciBoYXBwZW4gLSB3ZSBhcmUgb25seSB0YWtpbmcgdGhlIGZpcnN0IG1hdGNoIGZvciBlYWNoIG91dGxldCBhbmRcbiAgICAgIC8vIG1lcmdlIHRoZSBlbXB0eSBwYXRoIG1hdGNoZXMuXG4gICAgICBjaGVja091dGxldE5hbWVVbmlxdWVuZXNzKG1lcmdlZENoaWxkcmVuKTtcbiAgICB9XG4gICAgc29ydEFjdGl2YXRlZFJvdXRlU25hcHNob3RzKG1lcmdlZENoaWxkcmVuKTtcbiAgICByZXR1cm4gbWVyZ2VkQ2hpbGRyZW47XG4gIH1cblxuICBwcm9jZXNzU2VnbWVudChcbiAgICAgIGNvbmZpZzogUm91dGVbXSwgc2VnbWVudEdyb3VwOiBVcmxTZWdtZW50R3JvdXAsIHNlZ21lbnRzOiBVcmxTZWdtZW50W10sXG4gICAgICBvdXRsZXQ6IHN0cmluZyk6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+W118bnVsbCB7XG4gICAgZm9yIChjb25zdCByIG9mIGNvbmZpZykge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnByb2Nlc3NTZWdtZW50QWdhaW5zdFJvdXRlKHIsIHNlZ21lbnRHcm91cCwgc2VnbWVudHMsIG91dGxldCk7XG4gICAgICBpZiAoY2hpbGRyZW4gIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkcmVuO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobm9MZWZ0b3ZlcnNJblVybChzZWdtZW50R3JvdXAsIHNlZ21lbnRzLCBvdXRsZXQpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcm9jZXNzU2VnbWVudEFnYWluc3RSb3V0ZShcbiAgICAgIHJvdXRlOiBSb3V0ZSwgcmF3U2VnbWVudDogVXJsU2VnbWVudEdyb3VwLCBzZWdtZW50czogVXJsU2VnbWVudFtdLFxuICAgICAgb3V0bGV0OiBzdHJpbmcpOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdfG51bGwge1xuICAgIGlmIChyb3V0ZS5yZWRpcmVjdFRvIHx8ICFpc0ltbWVkaWF0ZU1hdGNoKHJvdXRlLCByYXdTZWdtZW50LCBzZWdtZW50cywgb3V0bGV0KSkgcmV0dXJuIG51bGw7XG5cbiAgICBsZXQgc25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3Q7XG4gICAgbGV0IGNvbnN1bWVkU2VnbWVudHM6IFVybFNlZ21lbnRbXSA9IFtdO1xuICAgIGxldCByYXdTbGljZWRTZWdtZW50czogVXJsU2VnbWVudFtdID0gW107XG5cbiAgICBpZiAocm91dGUucGF0aCA9PT0gJyoqJykge1xuICAgICAgY29uc3QgcGFyYW1zID0gc2VnbWVudHMubGVuZ3RoID4gMCA/IGxhc3Qoc2VnbWVudHMpIS5wYXJhbWV0ZXJzIDoge307XG4gICAgICBzbmFwc2hvdCA9IG5ldyBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KFxuICAgICAgICAgIHNlZ21lbnRzLCBwYXJhbXMsIE9iamVjdC5mcmVlemUoey4uLnRoaXMudXJsVHJlZS5xdWVyeVBhcmFtc30pLCB0aGlzLnVybFRyZWUuZnJhZ21lbnQsXG4gICAgICAgICAgZ2V0RGF0YShyb3V0ZSksIGdldE91dGxldChyb3V0ZSksIHJvdXRlLmNvbXBvbmVudCEsIHJvdXRlLFxuICAgICAgICAgIGdldFNvdXJjZVNlZ21lbnRHcm91cChyYXdTZWdtZW50KSwgZ2V0UGF0aEluZGV4U2hpZnQocmF3U2VnbWVudCkgKyBzZWdtZW50cy5sZW5ndGgsXG4gICAgICAgICAgZ2V0UmVzb2x2ZShyb3V0ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBtYXRjaChyYXdTZWdtZW50LCByb3V0ZSwgc2VnbWVudHMpO1xuICAgICAgaWYgKCFyZXN1bHQubWF0Y2hlZCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGNvbnN1bWVkU2VnbWVudHMgPSByZXN1bHQuY29uc3VtZWRTZWdtZW50cztcbiAgICAgIHJhd1NsaWNlZFNlZ21lbnRzID0gc2VnbWVudHMuc2xpY2UocmVzdWx0Lmxhc3RDaGlsZCk7XG5cbiAgICAgIHNuYXBzaG90ID0gbmV3IEFjdGl2YXRlZFJvdXRlU25hcHNob3QoXG4gICAgICAgICAgY29uc3VtZWRTZWdtZW50cywgcmVzdWx0LnBhcmFtZXRlcnMsIE9iamVjdC5mcmVlemUoey4uLnRoaXMudXJsVHJlZS5xdWVyeVBhcmFtc30pLFxuICAgICAgICAgIHRoaXMudXJsVHJlZS5mcmFnbWVudCwgZ2V0RGF0YShyb3V0ZSksIGdldE91dGxldChyb3V0ZSksIHJvdXRlLmNvbXBvbmVudCEsIHJvdXRlLFxuICAgICAgICAgIGdldFNvdXJjZVNlZ21lbnRHcm91cChyYXdTZWdtZW50KSxcbiAgICAgICAgICBnZXRQYXRoSW5kZXhTaGlmdChyYXdTZWdtZW50KSArIGNvbnN1bWVkU2VnbWVudHMubGVuZ3RoLCBnZXRSZXNvbHZlKHJvdXRlKSk7XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRDb25maWc6IFJvdXRlW10gPSBnZXRDaGlsZENvbmZpZyhyb3V0ZSk7XG5cbiAgICBjb25zdCB7c2VnbWVudEdyb3VwLCBzbGljZWRTZWdtZW50c30gPSBzcGxpdChcbiAgICAgICAgcmF3U2VnbWVudCwgY29uc3VtZWRTZWdtZW50cywgcmF3U2xpY2VkU2VnbWVudHMsXG4gICAgICAgIC8vIEZpbHRlciBvdXQgcm91dGVzIHdpdGggcmVkaXJlY3RUbyBiZWNhdXNlIHdlIGFyZSB0cnlpbmcgdG8gY3JlYXRlIGFjdGl2YXRlZCByb3V0ZVxuICAgICAgICAvLyBzbmFwc2hvdHMgYW5kIGRvbid0IGhhbmRsZSByZWRpcmVjdHMgaGVyZS4gVGhhdCBzaG91bGQgaGF2ZSBiZWVuIGRvbmUgaW5cbiAgICAgICAgLy8gYGFwcGx5UmVkaXJlY3RzYC5cbiAgICAgICAgY2hpbGRDb25maWcuZmlsdGVyKGMgPT4gYy5yZWRpcmVjdFRvID09PSB1bmRlZmluZWQpLCB0aGlzLnJlbGF0aXZlTGlua1Jlc29sdXRpb24pO1xuXG4gICAgaWYgKHNsaWNlZFNlZ21lbnRzLmxlbmd0aCA9PT0gMCAmJiBzZWdtZW50R3JvdXAuaGFzQ2hpbGRyZW4oKSkge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLnByb2Nlc3NDaGlsZHJlbihjaGlsZENvbmZpZywgc2VnbWVudEdyb3VwKTtcbiAgICAgIGlmIChjaGlsZHJlbiA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbbmV3IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+KHNuYXBzaG90LCBjaGlsZHJlbildO1xuICAgIH1cblxuICAgIGlmIChjaGlsZENvbmZpZy5sZW5ndGggPT09IDAgJiYgc2xpY2VkU2VnbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gW25ldyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PihzbmFwc2hvdCwgW10pXTtcbiAgICB9XG5cbiAgICBjb25zdCBtYXRjaGVkT25PdXRsZXQgPSBnZXRPdXRsZXQocm91dGUpID09PSBvdXRsZXQ7XG4gICAgLy8gSWYgd2UgbWF0Y2hlZCBhIGNvbmZpZyBkdWUgdG8gZW1wdHkgcGF0aCBtYXRjaCBvbiBhIGRpZmZlcmVudCBvdXRsZXQsIHdlIG5lZWQgdG8gY29udGludWVcbiAgICAvLyBwYXNzaW5nIHRoZSBjdXJyZW50IG91dGxldCBmb3IgdGhlIHNlZ21lbnQgcmF0aGVyIHRoYW4gc3dpdGNoIHRvIFBSSU1BUlkuXG4gICAgLy8gTm90ZSB0aGF0IHdlIHN3aXRjaCB0byBwcmltYXJ5IHdoZW4gd2UgaGF2ZSBhIG1hdGNoIGJlY2F1c2Ugb3V0bGV0IGNvbmZpZ3MgbG9vayBsaWtlIHRoaXM6XG4gICAgLy8ge3BhdGg6ICdhJywgb3V0bGV0OiAnYScsIGNoaWxkcmVuOiBbXG4gICAgLy8gIHtwYXRoOiAnYicsIGNvbXBvbmVudDogQn0sXG4gICAgLy8gIHtwYXRoOiAnYycsIGNvbXBvbmVudDogQ30sXG4gICAgLy8gXX1cbiAgICAvLyBOb3RpY2UgdGhhdCB0aGUgY2hpbGRyZW4gb2YgdGhlIG5hbWVkIG91dGxldCBhcmUgY29uZmlndXJlZCB3aXRoIHRoZSBwcmltYXJ5IG91dGxldFxuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5wcm9jZXNzU2VnbWVudChcbiAgICAgICAgY2hpbGRDb25maWcsIHNlZ21lbnRHcm91cCwgc2xpY2VkU2VnbWVudHMsIG1hdGNoZWRPbk91dGxldCA/IFBSSU1BUllfT1VUTEVUIDogb3V0bGV0KTtcbiAgICBpZiAoY2hpbGRyZW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gW25ldyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PihzbmFwc2hvdCwgY2hpbGRyZW4pXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzb3J0QWN0aXZhdGVkUm91dGVTbmFwc2hvdHMobm9kZXM6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+W10pOiB2b2lkIHtcbiAgbm9kZXMuc29ydCgoYSwgYikgPT4ge1xuICAgIGlmIChhLnZhbHVlLm91dGxldCA9PT0gUFJJTUFSWV9PVVRMRVQpIHJldHVybiAtMTtcbiAgICBpZiAoYi52YWx1ZS5vdXRsZXQgPT09IFBSSU1BUllfT1VUTEVUKSByZXR1cm4gMTtcbiAgICByZXR1cm4gYS52YWx1ZS5vdXRsZXQubG9jYWxlQ29tcGFyZShiLnZhbHVlLm91dGxldCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRDaGlsZENvbmZpZyhyb3V0ZTogUm91dGUpOiBSb3V0ZVtdIHtcbiAgaWYgKHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgcmV0dXJuIHJvdXRlLmNoaWxkcmVuO1xuICB9XG5cbiAgaWYgKHJvdXRlLmxvYWRDaGlsZHJlbikge1xuICAgIHJldHVybiByb3V0ZS5fbG9hZGVkQ29uZmlnIS5yb3V0ZXM7XG4gIH1cblxuICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIGhhc0VtcHR5UGF0aENvbmZpZyhub2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90Pikge1xuICBjb25zdCBjb25maWcgPSBub2RlLnZhbHVlLnJvdXRlQ29uZmlnO1xuICByZXR1cm4gY29uZmlnICYmIGNvbmZpZy5wYXRoID09PSAnJyAmJiBjb25maWcucmVkaXJlY3RUbyA9PT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEZpbmRzIGBUcmVlTm9kZWBzIHdpdGggbWF0Y2hpbmcgZW1wdHkgcGF0aCByb3V0ZSBjb25maWdzIGFuZCBtZXJnZXMgdGhlbSBpbnRvIGBUcmVlTm9kZWAgd2l0aCB0aGVcbiAqIGNoaWxkcmVuIGZyb20gZWFjaCBkdXBsaWNhdGUuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgZGlmZmVyZW50IG91dGxldHMgY2FuIG1hdGNoIGEgc2luZ2xlXG4gKiBlbXB0eSBwYXRoIHJvdXRlIGNvbmZpZyBhbmQgdGhlIHJlc3VsdHMgbmVlZCB0byB0aGVuIGJlIG1lcmdlZC5cbiAqL1xuZnVuY3Rpb24gbWVyZ2VFbXB0eVBhdGhNYXRjaGVzKG5vZGVzOiBBcnJheTxUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90Pj4pOlxuICAgIEFycmF5PFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+PiB7XG4gIGNvbnN0IHJlc3VsdDogQXJyYXk8VHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4+ID0gW107XG4gIC8vIFRoZSBzZXQgb2Ygbm9kZXMgd2hpY2ggY29udGFpbiBjaGlsZHJlbiB0aGF0IHdlcmUgbWVyZ2VkIGZyb20gdHdvIGR1cGxpY2F0ZSBlbXB0eSBwYXRoIG5vZGVzLlxuICBjb25zdCBtZXJnZWROb2RlczogU2V0PFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+PiA9IG5ldyBTZXQoKTtcblxuICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICBpZiAoIWhhc0VtcHR5UGF0aENvbmZpZyhub2RlKSkge1xuICAgICAgcmVzdWx0LnB1c2gobm9kZSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBkdXBsaWNhdGVFbXB0eVBhdGhOb2RlID1cbiAgICAgICAgcmVzdWx0LmZpbmQocmVzdWx0Tm9kZSA9PiBub2RlLnZhbHVlLnJvdXRlQ29uZmlnID09PSByZXN1bHROb2RlLnZhbHVlLnJvdXRlQ29uZmlnKTtcbiAgICBpZiAoZHVwbGljYXRlRW1wdHlQYXRoTm9kZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkdXBsaWNhdGVFbXB0eVBhdGhOb2RlLmNoaWxkcmVuLnB1c2goLi4ubm9kZS5jaGlsZHJlbik7XG4gICAgICBtZXJnZWROb2Rlcy5hZGQoZHVwbGljYXRlRW1wdHlQYXRoTm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfVxuICAvLyBGb3IgZWFjaCBub2RlIHdoaWNoIGhhcyBjaGlsZHJlbiBmcm9tIG11bHRpcGxlIHNvdXJjZXMsIHdlIG5lZWQgdG8gcmVjb21wdXRlIGEgbmV3IGBUcmVlTm9kZWBcbiAgLy8gYnkgYWxzbyBtZXJnaW5nIHRob3NlIGNoaWxkcmVuLiBUaGlzIGlzIG5lY2Vzc2FyeSB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBlbXB0eSBwYXRoIGNvbmZpZ3MgaW5cbiAgLy8gYSByb3cuIFB1dCBhbm90aGVyIHdheTogd2hlbmV2ZXIgd2UgY29tYmluZSBjaGlsZHJlbiBvZiB0d28gbm9kZXMsIHdlIG5lZWQgdG8gYWxzbyBjaGVjayBpZiBhbnlcbiAgLy8gb2YgdGhvc2UgY2hpbGRyZW4gY2FuIGJlIGNvbWJpbmVkIGludG8gYSBzaW5nbGUgbm9kZSBhcyB3ZWxsLlxuICBmb3IgKGNvbnN0IG1lcmdlZE5vZGUgb2YgbWVyZ2VkTm9kZXMpIHtcbiAgICBjb25zdCBtZXJnZWRDaGlsZHJlbiA9IG1lcmdlRW1wdHlQYXRoTWF0Y2hlcyhtZXJnZWROb2RlLmNoaWxkcmVuKTtcbiAgICByZXN1bHQucHVzaChuZXcgVHJlZU5vZGUobWVyZ2VkTm9kZS52YWx1ZSwgbWVyZ2VkQ2hpbGRyZW4pKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0LmZpbHRlcihuID0+ICFtZXJnZWROb2Rlcy5oYXMobikpO1xufVxuXG5mdW5jdGlvbiBjaGVja091dGxldE5hbWVVbmlxdWVuZXNzKG5vZGVzOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PltdKTogdm9pZCB7XG4gIGNvbnN0IG5hbWVzOiB7W2s6IHN0cmluZ106IEFjdGl2YXRlZFJvdXRlU25hcHNob3R9ID0ge307XG4gIG5vZGVzLmZvckVhY2gobiA9PiB7XG4gICAgY29uc3Qgcm91dGVXaXRoU2FtZU91dGxldE5hbWUgPSBuYW1lc1tuLnZhbHVlLm91dGxldF07XG4gICAgaWYgKHJvdXRlV2l0aFNhbWVPdXRsZXROYW1lKSB7XG4gICAgICBjb25zdCBwID0gcm91dGVXaXRoU2FtZU91dGxldE5hbWUudXJsLm1hcChzID0+IHMudG9TdHJpbmcoKSkuam9pbignLycpO1xuICAgICAgY29uc3QgYyA9IG4udmFsdWUudXJsLm1hcChzID0+IHMudG9TdHJpbmcoKSkuam9pbignLycpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUd28gc2VnbWVudHMgY2Fubm90IGhhdmUgdGhlIHNhbWUgb3V0bGV0IG5hbWU6ICcke3B9JyBhbmQgJyR7Y30nLmApO1xuICAgIH1cbiAgICBuYW1lc1tuLnZhbHVlLm91dGxldF0gPSBuLnZhbHVlO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0U291cmNlU2VnbWVudEdyb3VwKHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwKTogVXJsU2VnbWVudEdyb3VwIHtcbiAgbGV0IHMgPSBzZWdtZW50R3JvdXA7XG4gIHdoaWxlIChzLl9zb3VyY2VTZWdtZW50KSB7XG4gICAgcyA9IHMuX3NvdXJjZVNlZ21lbnQ7XG4gIH1cbiAgcmV0dXJuIHM7XG59XG5cbmZ1bmN0aW9uIGdldFBhdGhJbmRleFNoaWZ0KHNlZ21lbnRHcm91cDogVXJsU2VnbWVudEdyb3VwKTogbnVtYmVyIHtcbiAgbGV0IHMgPSBzZWdtZW50R3JvdXA7XG4gIGxldCByZXMgPSAocy5fc2VnbWVudEluZGV4U2hpZnQgPyBzLl9zZWdtZW50SW5kZXhTaGlmdCA6IDApO1xuICB3aGlsZSAocy5fc291cmNlU2VnbWVudCkge1xuICAgIHMgPSBzLl9zb3VyY2VTZWdtZW50O1xuICAgIHJlcyArPSAocy5fc2VnbWVudEluZGV4U2hpZnQgPyBzLl9zZWdtZW50SW5kZXhTaGlmdCA6IDApO1xuICB9XG4gIHJldHVybiByZXMgLSAxO1xufVxuXG5mdW5jdGlvbiBnZXREYXRhKHJvdXRlOiBSb3V0ZSk6IERhdGEge1xuICByZXR1cm4gcm91dGUuZGF0YSB8fCB7fTtcbn1cblxuZnVuY3Rpb24gZ2V0UmVzb2x2ZShyb3V0ZTogUm91dGUpOiBSZXNvbHZlRGF0YSB7XG4gIHJldHVybiByb3V0ZS5yZXNvbHZlIHx8IHt9O1xufVxuIl19