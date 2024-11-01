/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { convertToParamMap, PRIMARY_OUTLET, RouteTitleKey } from './shared';
import { equalSegments, UrlSegment } from './url_tree';
import { shallowEqual, shallowEqualArrays } from './utils/collection';
import { Tree, TreeNode } from './utils/tree';
/**
 * Represents the state of the router as a tree of activated routes.
 *
 * @usageNotes
 *
 * Every node in the route tree is an `ActivatedRoute` instance
 * that knows about the "consumed" URL segments, the extracted parameters,
 * and the resolved data.
 * Use the `ActivatedRoute` properties to traverse the tree from any node.
 *
 * The following fragment shows how a component gets the root node
 * of the current state to establish its own route tree:
 *
 * ```
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const state: RouterState = router.routerState;
 *     const root: ActivatedRoute = state.root;
 *     const child = root.firstChild;
 *     const id: Observable<string> = child.params.map(p => p.id);
 *     //...
 *   }
 * }
 * ```
 *
 * @see {@link ActivatedRoute}
 * @see [Getting route information](guide/routing/common-router-tasks#getting-route-information)
 *
 * @publicApi
 */
export class RouterState extends Tree {
    /** @internal */
    constructor(root, 
    /** The current snapshot of the router state */
    snapshot) {
        super(root);
        this.snapshot = snapshot;
        setRouterState(this, root);
    }
    toString() {
        return this.snapshot.toString();
    }
}
export function createEmptyState(rootComponent) {
    const snapshot = createEmptyStateSnapshot(rootComponent);
    const emptyUrl = new BehaviorSubject([new UrlSegment('', {})]);
    const emptyParams = new BehaviorSubject({});
    const emptyData = new BehaviorSubject({});
    const emptyQueryParams = new BehaviorSubject({});
    const fragment = new BehaviorSubject('');
    const activated = new ActivatedRoute(emptyUrl, emptyParams, emptyQueryParams, fragment, emptyData, PRIMARY_OUTLET, rootComponent, snapshot.root);
    activated.snapshot = snapshot.root;
    return new RouterState(new TreeNode(activated, []), snapshot);
}
export function createEmptyStateSnapshot(rootComponent) {
    const emptyParams = {};
    const emptyData = {};
    const emptyQueryParams = {};
    const fragment = '';
    const activated = new ActivatedRouteSnapshot([], emptyParams, emptyQueryParams, fragment, emptyData, PRIMARY_OUTLET, rootComponent, null, {});
    return new RouterStateSnapshot('', new TreeNode(activated, []));
}
/**
 * Provides access to information about a route associated with a component
 * that is loaded in an outlet.
 * Use to traverse the `RouterState` tree and extract information from nodes.
 *
 * The following example shows how to construct a component using information from a
 * currently activated route.
 *
 * Note: the observables in this class only emit when the current and previous values differ based
 * on shallow equality. For example, changing deeply nested properties in resolved `data` will not
 * cause the `ActivatedRoute.data` `Observable` to emit a new value.
 *
 * {@example router/activated-route/module.ts region="activated-route"
 *     header="activated-route.component.ts"}
 *
 * @see [Getting route information](guide/routing/common-router-tasks#getting-route-information)
 *
 * @publicApi
 */
export class ActivatedRoute {
    /** @internal */
    constructor(
    /** @internal */
    urlSubject, 
    /** @internal */
    paramsSubject, 
    /** @internal */
    queryParamsSubject, 
    /** @internal */
    fragmentSubject, 
    /** @internal */
    dataSubject, 
    /** The outlet name of the route, a constant. */
    outlet, 
    /** The component of the route, a constant. */
    component, futureSnapshot) {
        this.urlSubject = urlSubject;
        this.paramsSubject = paramsSubject;
        this.queryParamsSubject = queryParamsSubject;
        this.fragmentSubject = fragmentSubject;
        this.dataSubject = dataSubject;
        this.outlet = outlet;
        this.component = component;
        this._futureSnapshot = futureSnapshot;
        this.title = this.dataSubject?.pipe(map((d) => d[RouteTitleKey])) ?? of(undefined);
        // TODO(atscott): Verify that these can be changed to `.asObservable()` with TGP.
        this.url = urlSubject;
        this.params = paramsSubject;
        this.queryParams = queryParamsSubject;
        this.fragment = fragmentSubject;
        this.data = dataSubject;
    }
    /** The configuration used to match this route. */
    get routeConfig() {
        return this._futureSnapshot.routeConfig;
    }
    /** The root of the router state. */
    get root() {
        return this._routerState.root;
    }
    /** The parent of this route in the router state tree. */
    get parent() {
        return this._routerState.parent(this);
    }
    /** The first child of this route in the router state tree. */
    get firstChild() {
        return this._routerState.firstChild(this);
    }
    /** The children of this route in the router state tree. */
    get children() {
        return this._routerState.children(this);
    }
    /** The path from the root of the router state tree to this route. */
    get pathFromRoot() {
        return this._routerState.pathFromRoot(this);
    }
    /**
     * An Observable that contains a map of the required and optional parameters
     * specific to the route.
     * The map supports retrieving single and multiple values from the same parameter.
     */
    get paramMap() {
        this._paramMap ??= this.params.pipe(map((p) => convertToParamMap(p)));
        return this._paramMap;
    }
    /**
     * An Observable that contains a map of the query parameters available to all routes.
     * The map supports retrieving single and multiple values from the query parameter.
     */
    get queryParamMap() {
        this._queryParamMap ??= this.queryParams.pipe(map((p) => convertToParamMap(p)));
        return this._queryParamMap;
    }
    toString() {
        return this.snapshot ? this.snapshot.toString() : `Future(${this._futureSnapshot})`;
    }
}
/**
 * Returns the inherited params, data, and resolve for a given route.
 *
 * By default, we do not inherit parent data unless the current route is path-less or the parent
 * route is component-less.
 */
export function getInherited(route, parent, paramsInheritanceStrategy = 'emptyOnly') {
    let inherited;
    const { routeConfig } = route;
    if (parent !== null &&
        (paramsInheritanceStrategy === 'always' ||
            // inherit parent data if route is empty path
            routeConfig?.path === '' ||
            // inherit parent data if parent was componentless
            (!parent.component && !parent.routeConfig?.loadComponent))) {
        inherited = {
            params: { ...parent.params, ...route.params },
            data: { ...parent.data, ...route.data },
            resolve: {
                // Snapshots are created with data inherited from parent and guards (i.e. canActivate) can
                // change data because it's not frozen...
                // This first line could be deleted chose to break/disallow mutating the `data` object in
                // guards.
                // Note that data from parents still override this mutated data so anyone relying on this
                // might be surprised that it doesn't work if parent data is inherited but otherwise does.
                ...route.data,
                // Ensure inherited resolved data overrides inherited static data
                ...parent.data,
                // static data from the current route overrides any inherited data
                ...routeConfig?.data,
                // resolved data from current route overrides everything
                ...route._resolvedData,
            },
        };
    }
    else {
        inherited = {
            params: { ...route.params },
            data: { ...route.data },
            resolve: { ...route.data, ...(route._resolvedData ?? {}) },
        };
    }
    if (routeConfig && hasStaticTitle(routeConfig)) {
        inherited.resolve[RouteTitleKey] = routeConfig.title;
    }
    return inherited;
}
/**
 * @description
 *
 * Contains the information about a route associated with a component loaded in an
 * outlet at a particular moment in time. ActivatedRouteSnapshot can also be used to
 * traverse the router state tree.
 *
 * The following example initializes a component with route information extracted
 * from the snapshot of the root node at the time of creation.
 *
 * ```
 * @Component({templateUrl:'./my-component.html'})
 * class MyComponent {
 *   constructor(route: ActivatedRoute) {
 *     const id: string = route.snapshot.params.id;
 *     const url: string = route.snapshot.url.join('');
 *     const user = route.snapshot.data.user;
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export class ActivatedRouteSnapshot {
    /** The resolved route title */
    get title() {
        // Note: This _must_ be a getter because the data is mutated in the resolvers. Title will not be
        // available at the time of class instantiation.
        return this.data?.[RouteTitleKey];
    }
    /** @internal */
    constructor(
    /** The URL segments matched by this route */
    url, 
    /**
     *  The matrix parameters scoped to this route.
     *
     *  You can compute all params (or data) in the router state or to get params outside
     *  of an activated component by traversing the `RouterState` tree as in the following
     *  example:
     *  ```
     *  collectRouteParams(router: Router) {
     *    let params = {};
     *    let stack: ActivatedRouteSnapshot[] = [router.routerState.snapshot.root];
     *    while (stack.length > 0) {
     *      const route = stack.pop()!;
     *      params = {...params, ...route.params};
     *      stack.push(...route.children);
     *    }
     *    return params;
     *  }
     *  ```
     */
    params, 
    /** The query parameters shared by all the routes */
    queryParams, 
    /** The URL fragment shared by all the routes */
    fragment, 
    /** The static and resolved data of this route */
    data, 
    /** The outlet name of the route */
    outlet, 
    /** The component of the route */
    component, routeConfig, resolve) {
        this.url = url;
        this.params = params;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.data = data;
        this.outlet = outlet;
        this.component = component;
        this.routeConfig = routeConfig;
        this._resolve = resolve;
    }
    /** The root of the router state */
    get root() {
        return this._routerState.root;
    }
    /** The parent of this route in the router state tree */
    get parent() {
        return this._routerState.parent(this);
    }
    /** The first child of this route in the router state tree */
    get firstChild() {
        return this._routerState.firstChild(this);
    }
    /** The children of this route in the router state tree */
    get children() {
        return this._routerState.children(this);
    }
    /** The path from the root of the router state tree to this route */
    get pathFromRoot() {
        return this._routerState.pathFromRoot(this);
    }
    get paramMap() {
        this._paramMap ??= convertToParamMap(this.params);
        return this._paramMap;
    }
    get queryParamMap() {
        this._queryParamMap ??= convertToParamMap(this.queryParams);
        return this._queryParamMap;
    }
    toString() {
        const url = this.url.map((segment) => segment.toString()).join('/');
        const matched = this.routeConfig ? this.routeConfig.path : '';
        return `Route(url:'${url}', path:'${matched}')`;
    }
}
/**
 * @description
 *
 * Represents the state of the router at a moment in time.
 *
 * This is a tree of activated route snapshots. Every node in this tree knows about
 * the "consumed" URL segments, the extracted parameters, and the resolved data.
 *
 * The following example shows how a component is initialized with information
 * from the snapshot of the root node's state at the time of creation.
 *
 * ```
 * @Component({templateUrl:'template.html'})
 * class MyComponent {
 *   constructor(router: Router) {
 *     const state: RouterState = router.routerState;
 *     const snapshot: RouterStateSnapshot = state.snapshot;
 *     const root: ActivatedRouteSnapshot = snapshot.root;
 *     const child = root.firstChild;
 *     const id: Observable<string> = child.params.map(p => p.id);
 *     //...
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export class RouterStateSnapshot extends Tree {
    /** @internal */
    constructor(
    /** The url from which this snapshot was created */
    url, root) {
        super(root);
        this.url = url;
        setRouterState(this, root);
    }
    toString() {
        return serializeNode(this._root);
    }
}
function setRouterState(state, node) {
    node.value._routerState = state;
    node.children.forEach((c) => setRouterState(state, c));
}
function serializeNode(node) {
    const c = node.children.length > 0 ? ` { ${node.children.map(serializeNode).join(', ')} } ` : '';
    return `${node.value}${c}`;
}
/**
 * The expectation is that the activate route is created with the right set of parameters.
 * So we push new values into the observables only when they are not the initial values.
 * And we detect that by checking if the snapshot field is set.
 */
export function advanceActivatedRoute(route) {
    if (route.snapshot) {
        const currentSnapshot = route.snapshot;
        const nextSnapshot = route._futureSnapshot;
        route.snapshot = nextSnapshot;
        if (!shallowEqual(currentSnapshot.queryParams, nextSnapshot.queryParams)) {
            route.queryParamsSubject.next(nextSnapshot.queryParams);
        }
        if (currentSnapshot.fragment !== nextSnapshot.fragment) {
            route.fragmentSubject.next(nextSnapshot.fragment);
        }
        if (!shallowEqual(currentSnapshot.params, nextSnapshot.params)) {
            route.paramsSubject.next(nextSnapshot.params);
        }
        if (!shallowEqualArrays(currentSnapshot.url, nextSnapshot.url)) {
            route.urlSubject.next(nextSnapshot.url);
        }
        if (!shallowEqual(currentSnapshot.data, nextSnapshot.data)) {
            route.dataSubject.next(nextSnapshot.data);
        }
    }
    else {
        route.snapshot = route._futureSnapshot;
        // this is for resolved data
        route.dataSubject.next(route._futureSnapshot.data);
    }
}
export function equalParamsAndUrlSegments(a, b) {
    const equalUrlParams = shallowEqual(a.params, b.params) && equalSegments(a.url, b.url);
    const parentsMismatch = !a.parent !== !b.parent;
    return (equalUrlParams &&
        !parentsMismatch &&
        (!a.parent || equalParamsAndUrlSegments(a.parent, b.parent)));
}
export function hasStaticTitle(config) {
    return typeof config.title === 'string' || config.title === null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX3N0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yb3V0ZXJfc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0gsT0FBTyxFQUFDLGVBQWUsRUFBYyxFQUFFLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDckQsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR25DLE9BQU8sRUFBQyxpQkFBaUIsRUFBb0IsY0FBYyxFQUFFLGFBQWEsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUM1RixPQUFPLEVBQUMsYUFBYSxFQUFFLFVBQVUsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNyRCxPQUFPLEVBQUMsWUFBWSxFQUFFLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDcEUsT0FBTyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFNUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThCRztBQUNILE1BQU0sT0FBTyxXQUFZLFNBQVEsSUFBb0I7SUFDbkQsZ0JBQWdCO0lBQ2hCLFlBQ0UsSUFBOEI7SUFDOUIsK0NBQStDO0lBQ3hDLFFBQTZCO1FBRXBDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUZMLGFBQVEsR0FBUixRQUFRLENBQXFCO1FBR3BDLGNBQWMsQ0FBYyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVRLFFBQVE7UUFDZixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEMsQ0FBQztDQUNGO0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUFDLGFBQStCO0lBQzlELE1BQU0sUUFBUSxHQUFHLHdCQUF3QixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3pELE1BQU0sUUFBUSxHQUFHLElBQUksZUFBZSxDQUFDLENB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LFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzNELEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QyxDQUFDO0lBQ0gsQ0FBQztTQUFNLENBQUM7UUFDTixLQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUM7UUFFdkMsNEJBQTRCO1FBQzVCLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckQsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLFVBQVUseUJBQXlCLENBQ3ZDLENBQXlCLEVBQ3pCLENBQXlCO0lBRXpCLE1BQU0sY0FBYyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkYsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUVoRCxPQUFPLENBQ0wsY0FBYztRQUNkLENBQUMsZUFBZTtRQUNoQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFPLENBQUMsQ0FBQyxDQUM5RCxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sVUFBVSxjQUFjLENBQUMsTUFBYTtJQUMxQyxPQUFPLE9BQU8sTUFBTSxDQUFDLEtBQUssS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUM7QUFDbkUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlLCBvZn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge21hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0RhdGEsIFJlc29sdmVEYXRhLCBSb3V0ZX0gZnJvbSAnLi9tb2RlbHMnO1xuaW1wb3J0IHtjb252ZXJ0VG9QYXJhbU1hcCwgUGFyYW1NYXAsIFBhcmFtcywgUFJJTUFSWV9PVVRMRVQsIFJvdXRlVGl0bGVLZXl9IGZyb20gJy4vc2hhcmVkJztcbmltcG9ydCB7ZXF1YWxTZWdtZW50cywgVXJsU2VnbWVudH0gZnJvbSAnLi91cmxfdHJlZSc7XG5pbXBvcnQge3NoYWxsb3dFcXVhbCwgc2hhbGxvd0VxdWFsQXJyYXlzfSBmcm9tICcuL3V0aWxzL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtUcmVlLCBUcmVlTm9kZX0gZnJvbSAnLi91dGlscy90cmVlJztcblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSBzdGF0ZSBvZiB0aGUgcm91dGVyIGFzIGEgdHJlZSBvZiBhY3RpdmF0ZWQgcm91dGVzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogRXZlcnkgbm9kZSBpbiB0aGUgcm91dGUgdHJlZSBpcyBhbiBgQWN0aXZhdGVkUm91dGVgIGluc3RhbmNlXG4gKiB0aGF0IGtub3dzIGFib3V0IHRoZSBcImNvbnN1bWVkXCIgVVJMIHNlZ21lbnRzLCB0aGUgZXh0cmFjdGVkIHBhcmFtZXRlcnMsXG4gKiBhbmQgdGhlIHJlc29sdmVkIGRhdGEuXG4gKiBVc2UgdGhlIGBBY3RpdmF0ZWRSb3V0ZWAgcHJvcGVydGllcyB0byB0cmF2ZXJzZSB0aGUgdHJlZSBmcm9tIGFueSBub2RlLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZnJhZ21lbnQgc2hvd3MgaG93IGEgY29tcG9uZW50IGdldHMgdGhlIHJvb3Qgbm9kZVxuICogb2YgdGhlIGN1cnJlbnQgc3RhdGUgdG8gZXN0YWJsaXNoIGl0cyBvd24gcm91dGUgdHJlZTpcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe3RlbXBsYXRlVXJsOid0ZW1wbGF0ZS5odG1sJ30pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKHJvdXRlcjogUm91dGVyKSB7XG4gKiAgICAgY29uc3Qgc3RhdGU6IFJvdXRlclN0YXRlID0gcm91dGVyLnJvdXRlclN0YXRlO1xuICogICAgIGNvbnN0IHJvb3Q6IEFjdGl2YXRlZFJvdXRlID0gc3RhdGUucm9vdDtcbiAqICAgICBjb25zdCBjaGlsZCA9IHJvb3QuZmlyc3RDaGlsZDtcbiAqICAgICBjb25zdCBpZDogT2JzZXJ2YWJsZTxzdHJpbmc+ID0gY2hpbGQucGFyYW1zLm1hcChwID0+IHAuaWQpO1xuICogICAgIC8vLi4uXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBzZWUge0BsaW5rIEFjdGl2YXRlZFJvdXRlfVxuICogQHNlZSBbR2V0dGluZyByb3V0ZSBpbmZvcm1hdGlvbl0oZ3VpZGUvcm91dGluZy9jb21tb24tcm91dGVyLXRhc2tzI2dldHRpbmctcm91dGUtaW5mb3JtYXRpb24pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgUm91dGVyU3RhdGUgZXh0ZW5kcyBUcmVlPEFjdGl2YXRlZFJvdXRlPiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgcm9vdDogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+LFxuICAgIC8qKiBUaGUgY3VycmVudCBzbmFwc2hvdCBvZiB0aGUgcm91dGVyIHN0YXRlICovXG4gICAgcHVibGljIHNuYXBzaG90OiBSb3V0ZXJTdGF0ZVNuYXBzaG90LFxuICApIHtcbiAgICBzdXBlcihyb290KTtcbiAgICBzZXRSb3V0ZXJTdGF0ZSg8Um91dGVyU3RhdGU+dGhpcywgcm9vdCk7XG4gIH1cblxuICBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnNuYXBzaG90LnRvU3RyaW5nKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVtcHR5U3RhdGUocm9vdENvbXBvbmVudDogVHlwZTxhbnk+IHwgbnVsbCk6IFJvdXRlclN0YXRlIHtcbiAgY29uc3Qgc25hcHNob3QgPSBjcmVhdGVFbXB0eVN0YXRlU25hcHNob3Qocm9vdENvbXBvbmVudCk7XG4gIGNvbnN0IGVtcHR5VXJsID0gbmV3IEJlaGF2aW9yU3ViamVjdChbbmV3IFVybFNlZ21lbnQoJycsIHt9KV0pO1xuICBjb25zdCBlbXB0eVBhcmFtcyA9IG5ldyBCZWhhdmlvclN1YmplY3Qoe30pO1xuICBjb25zdCBlbXB0eURhdGEgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KHt9KTtcbiAgY29uc3QgZW1wdHlRdWVyeVBhcmFtcyA9IG5ldyBCZWhhdmlvclN1YmplY3Qoe30pO1xuICBjb25zdCBmcmFnbWVudCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8c3RyaW5nIHwgbnVsbD4oJycpO1xuICBjb25zdCBhY3RpdmF0ZWQgPSBuZXcgQWN0aXZhdGVkUm91dGUoXG4gICAgZW1wdHlVcmwsXG4gICAgZW1wdHlQYXJhbXMsXG4gICAgZW1wdHlRdWVyeVBhcmFtcyxcbiAgICBmcmFnbWVudCxcbiAgICBlbXB0eURhdGEsXG4gICAgUFJJTUFSWV9PVVRMRVQsXG4gICAgcm9vdENvbXBvbmVudCxcbiAgICBzbmFwc2hvdC5yb290LFxuICApO1xuICBhY3RpdmF0ZWQuc25hcHNob3QgPSBzbmFwc2hvdC5yb290O1xuICByZXR1cm4gbmV3IFJvdXRlclN0YXRlKG5ldyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZT4oYWN0aXZhdGVkLCBbXSksIHNuYXBzaG90KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVtcHR5U3RhdGVTbmFwc2hvdChyb290Q29tcG9uZW50OiBUeXBlPGFueT4gfCBudWxsKTogUm91dGVyU3RhdGVTbmFwc2hvdCB7XG4gIGNvbnN0IGVtcHR5UGFyYW1zID0ge307XG4gIGNvbnN0IGVtcHR5RGF0YSA9IHt9O1xuICBjb25zdCBlbXB0eVF1ZXJ5UGFyYW1zID0ge307XG4gIGNvbnN0IGZyYWdtZW50ID0gJyc7XG4gIGNvbnN0IGFjdGl2YXRlZCA9IG5ldyBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KFxuICAgIFtdLFxuICAgIGVtcHR5UGFyYW1zLFxuICAgIGVtcHR5UXVlcnlQYXJhbXMsXG4gICAgZnJhZ21lbnQsXG4gICAgZW1wdHlEYXRhLFxuICAgIFBSSU1BUllfT1VUTEVULFxuICAgIHJvb3RDb21wb25lbnQsXG4gICAgbnVsbCxcbiAgICB7fSxcbiAgKTtcbiAgcmV0dXJuIG5ldyBSb3V0ZXJTdGF0ZVNuYXBzaG90KCcnLCBuZXcgVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4oYWN0aXZhdGVkLCBbXSkpO1xufVxuXG4vKipcbiAqIFByb3ZpZGVzIGFjY2VzcyB0byBpbmZvcm1hdGlvbiBhYm91dCBhIHJvdXRlIGFzc29jaWF0ZWQgd2l0aCBhIGNvbXBvbmVudFxuICogdGhhdCBpcyBsb2FkZWQgaW4gYW4gb3V0bGV0LlxuICogVXNlIHRvIHRyYXZlcnNlIHRoZSBgUm91dGVyU3RhdGVgIHRyZWUgYW5kIGV4dHJhY3QgaW5mb3JtYXRpb24gZnJvbSBub2Rlcy5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IHRvIGNvbnN0cnVjdCBhIGNvbXBvbmVudCB1c2luZyBpbmZvcm1hdGlvbiBmcm9tIGFcbiAqIGN1cnJlbnRseSBhY3RpdmF0ZWQgcm91dGUuXG4gKlxuICogTm90ZTogdGhlIG9ic2VydmFibGVzIGluIHRoaXMgY2xhc3Mgb25seSBlbWl0IHdoZW4gdGhlIGN1cnJlbnQgYW5kIHByZXZpb3VzIHZhbHVlcyBkaWZmZXIgYmFzZWRcbiAqIG9uIHNoYWxsb3cgZXF1YWxpdHkuIEZvciBleGFtcGxlLCBjaGFuZ2luZyBkZWVwbHkgbmVzdGVkIHByb3BlcnRpZXMgaW4gcmVzb2x2ZWQgYGRhdGFgIHdpbGwgbm90XG4gKiBjYXVzZSB0aGUgYEFjdGl2YXRlZFJvdXRlLmRhdGFgIGBPYnNlcnZhYmxlYCB0byBlbWl0IGEgbmV3IHZhbHVlLlxuICpcbiAqIHtAZXhhbXBsZSByb3V0ZXIvYWN0aXZhdGVkLXJvdXRlL21vZHVsZS50cyByZWdpb249XCJhY3RpdmF0ZWQtcm91dGVcIlxuICogICAgIGhlYWRlcj1cImFjdGl2YXRlZC1yb3V0ZS5jb21wb25lbnQudHNcIn1cbiAqXG4gKiBAc2VlIFtHZXR0aW5nIHJvdXRlIGluZm9ybWF0aW9uXShndWlkZS9yb3V0aW5nL2NvbW1vbi1yb3V0ZXItdGFza3MjZ2V0dGluZy1yb3V0ZS1pbmZvcm1hdGlvbilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBBY3RpdmF0ZWRSb3V0ZSB7XG4gIC8qKiBUaGUgY3VycmVudCBzbmFwc2hvdCBvZiB0aGlzIHJvdXRlICovXG4gIHNuYXBzaG90ITogQWN0aXZhdGVkUm91dGVTbmFwc2hvdDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfZnV0dXJlU25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3Q7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JvdXRlclN0YXRlITogUm91dGVyU3RhdGU7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcmFtTWFwPzogT2JzZXJ2YWJsZTxQYXJhbU1hcD47XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3F1ZXJ5UGFyYW1NYXA/OiBPYnNlcnZhYmxlPFBhcmFtTWFwPjtcblxuICAvKiogQW4gT2JzZXJ2YWJsZSBvZiB0aGUgcmVzb2x2ZWQgcm91dGUgdGl0bGUgKi9cbiAgcmVhZG9ubHkgdGl0bGU6IE9ic2VydmFibGU8c3RyaW5nIHwgdW5kZWZpbmVkPjtcblxuICAvKiogQW4gb2JzZXJ2YWJsZSBvZiB0aGUgVVJMIHNlZ21lbnRzIG1hdGNoZWQgYnkgdGhpcyByb3V0ZS4gKi9cbiAgcHVibGljIHVybDogT2JzZXJ2YWJsZTxVcmxTZWdtZW50W10+O1xuICAvKiogQW4gb2JzZXJ2YWJsZSBvZiB0aGUgbWF0cml4IHBhcmFtZXRlcnMgc2NvcGVkIHRvIHRoaXMgcm91dGUuICovXG4gIHB1YmxpYyBwYXJhbXM6IE9ic2VydmFibGU8UGFyYW1zPjtcbiAgLyoqIEFuIG9ic2VydmFibGUgb2YgdGhlIHF1ZXJ5IHBhcmFtZXRlcnMgc2hhcmVkIGJ5IGFsbCB0aGUgcm91dGVzLiAqL1xuICBwdWJsaWMgcXVlcnlQYXJhbXM6IE9ic2VydmFibGU8UGFyYW1zPjtcbiAgLyoqIEFuIG9ic2VydmFibGUgb2YgdGhlIFVSTCBmcmFnbWVudCBzaGFyZWQgYnkgYWxsIHRoZSByb3V0ZXMuICovXG4gIHB1YmxpYyBmcmFnbWVudDogT2JzZXJ2YWJsZTxzdHJpbmcgfCBudWxsPjtcbiAgLyoqIEFuIG9ic2VydmFibGUgb2YgdGhlIHN0YXRpYyBhbmQgcmVzb2x2ZWQgZGF0YSBvZiB0aGlzIHJvdXRlLiAqL1xuICBwdWJsaWMgZGF0YTogT2JzZXJ2YWJsZTxEYXRhPjtcblxuICAvKiogQGludGVybmFsICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwdWJsaWMgdXJsU3ViamVjdDogQmVoYXZpb3JTdWJqZWN0PFVybFNlZ21lbnRbXT4sXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHB1YmxpYyBwYXJhbXNTdWJqZWN0OiBCZWhhdmlvclN1YmplY3Q8UGFyYW1zPixcbiAgICAvKiogQGludGVybmFsICovXG4gICAgcHVibGljIHF1ZXJ5UGFyYW1zU3ViamVjdDogQmVoYXZpb3JTdWJqZWN0PFBhcmFtcz4sXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHB1YmxpYyBmcmFnbWVudFN1YmplY3Q6IEJlaGF2aW9yU3ViamVjdDxzdHJpbmcgfCBudWxsPixcbiAgICAvKiogQGludGVybmFsICovXG4gICAgcHVibGljIGRhdGFTdWJqZWN0OiBCZWhhdmlvclN1YmplY3Q8RGF0YT4sXG4gICAgLyoqIFRoZSBvdXRsZXQgbmFtZSBvZiB0aGUgcm91dGUsIGEgY29uc3RhbnQuICovXG4gICAgcHVibGljIG91dGxldDogc3RyaW5nLFxuICAgIC8qKiBUaGUgY29tcG9uZW50IG9mIHRoZSByb3V0ZSwgYSBjb25zdGFudC4gKi9cbiAgICBwdWJsaWMgY29tcG9uZW50OiBUeXBlPGFueT4gfCBudWxsLFxuICAgIGZ1dHVyZVNuYXBzaG90OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LFxuICApIHtcbiAgICB0aGlzLl9mdXR1cmVTbmFwc2hvdCA9IGZ1dHVyZVNuYXBzaG90O1xuICAgIHRoaXMudGl0bGUgPSB0aGlzLmRhdGFTdWJqZWN0Py5waXBlKG1hcCgoZDogRGF0YSkgPT4gZFtSb3V0ZVRpdGxlS2V5XSkpID8/IG9mKHVuZGVmaW5lZCk7XG4gICAgLy8gVE9ETyhhdHNjb3R0KTogVmVyaWZ5IHRoYXQgdGhlc2UgY2FuIGJlIGNoYW5nZWQgdG8gYC5hc09ic2VydmFibGUoKWAgd2l0aCBUR1AuXG4gICAgdGhpcy51cmwgPSB1cmxTdWJqZWN0O1xuICAgIHRoaXMucGFyYW1zID0gcGFyYW1zU3ViamVjdDtcbiAgICB0aGlzLnF1ZXJ5UGFyYW1zID0gcXVlcnlQYXJhbXNTdWJqZWN0O1xuICAgIHRoaXMuZnJhZ21lbnQgPSBmcmFnbWVudFN1YmplY3Q7XG4gICAgdGhpcy5kYXRhID0gZGF0YVN1YmplY3Q7XG4gIH1cblxuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gdXNlZCB0byBtYXRjaCB0aGlzIHJvdXRlLiAqL1xuICBnZXQgcm91dGVDb25maWcoKTogUm91dGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fZnV0dXJlU25hcHNob3Qucm91dGVDb25maWc7XG4gIH1cblxuICAvKiogVGhlIHJvb3Qgb2YgdGhlIHJvdXRlciBzdGF0ZS4gKi9cbiAgZ2V0IHJvb3QoKTogQWN0aXZhdGVkUm91dGUge1xuICAgIHJldHVybiB0aGlzLl9yb3V0ZXJTdGF0ZS5yb290O1xuICB9XG5cbiAgLyoqIFRoZSBwYXJlbnQgb2YgdGhpcyByb3V0ZSBpbiB0aGUgcm91dGVyIHN0YXRlIHRyZWUuICovXG4gIGdldCBwYXJlbnQoKTogQWN0aXZhdGVkUm91dGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fcm91dGVyU3RhdGUucGFyZW50KHRoaXMpO1xuICB9XG5cbiAgLyoqIFRoZSBmaXJzdCBjaGlsZCBvZiB0aGlzIHJvdXRlIGluIHRoZSByb3V0ZXIgc3RhdGUgdHJlZS4gKi9cbiAgZ2V0IGZpcnN0Q2hpbGQoKTogQWN0aXZhdGVkUm91dGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fcm91dGVyU3RhdGUuZmlyc3RDaGlsZCh0aGlzKTtcbiAgfVxuXG4gIC8qKiBUaGUgY2hpbGRyZW4gb2YgdGhpcyByb3V0ZSBpbiB0aGUgcm91dGVyIHN0YXRlIHRyZWUuICovXG4gIGdldCBjaGlsZHJlbigpOiBBY3RpdmF0ZWRSb3V0ZVtdIHtcbiAgICByZXR1cm4gdGhpcy5fcm91dGVyU3RhdGUuY2hpbGRyZW4odGhpcyk7XG4gIH1cblxuICAvKiogVGhlIHBhdGggZnJvbSB0aGUgcm9vdCBvZiB0aGUgcm91dGVyIHN0YXRlIHRyZWUgdG8gdGhpcyByb3V0ZS4gKi9cbiAgZ2V0IHBhdGhGcm9tUm9vdCgpOiBBY3RpdmF0ZWRSb3V0ZVtdIHtcbiAgICByZXR1cm4gdGhpcy5fcm91dGVyU3RhdGUucGF0aEZyb21Sb290KHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIE9ic2VydmFibGUgdGhhdCBjb250YWlucyBhIG1hcCBvZiB0aGUgcmVxdWlyZWQgYW5kIG9wdGlvbmFsIHBhcmFtZXRlcnNcbiAgICogc3BlY2lmaWMgdG8gdGhlIHJvdXRlLlxuICAgKiBUaGUgbWFwIHN1cHBvcnRzIHJldHJpZXZpbmcgc2luZ2xlIGFuZCBtdWx0aXBsZSB2YWx1ZXMgZnJvbSB0aGUgc2FtZSBwYXJhbWV0ZXIuXG4gICAqL1xuICBnZXQgcGFyYW1NYXAoKTogT2JzZXJ2YWJsZTxQYXJhbU1hcD4ge1xuICAgIHRoaXMuX3BhcmFtTWFwID8/PSB0aGlzLnBhcmFtcy5waXBlKG1hcCgocDogUGFyYW1zKTogUGFyYW1NYXAgPT4gY29udmVydFRvUGFyYW1NYXAocCkpKTtcbiAgICByZXR1cm4gdGhpcy5fcGFyYW1NYXA7XG4gIH1cblxuICAvKipcbiAgICogQW4gT2JzZXJ2YWJsZSB0aGF0IGNvbnRhaW5zIGEgbWFwIG9mIHRoZSBxdWVyeSBwYXJhbWV0ZXJzIGF2YWlsYWJsZSB0byBhbGwgcm91dGVzLlxuICAgKiBUaGUgbWFwIHN1cHBvcnRzIHJldHJpZXZpbmcgc2luZ2xlIGFuZCBtdWx0aXBsZSB2YWx1ZXMgZnJvbSB0aGUgcXVlcnkgcGFyYW1ldGVyLlxuICAgKi9cbiAgZ2V0IHF1ZXJ5UGFyYW1NYXAoKTogT2JzZXJ2YWJsZTxQYXJhbU1hcD4ge1xuICAgIHRoaXMuX3F1ZXJ5UGFyYW1NYXAgPz89IHRoaXMucXVlcnlQYXJhbXMucGlwZShcbiAgICAgIG1hcCgocDogUGFyYW1zKTogUGFyYW1NYXAgPT4gY29udmVydFRvUGFyYW1NYXAocCkpLFxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMuX3F1ZXJ5UGFyYW1NYXA7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnNuYXBzaG90ID8gdGhpcy5zbmFwc2hvdC50b1N0cmluZygpIDogYEZ1dHVyZSgke3RoaXMuX2Z1dHVyZVNuYXBzaG90fSlgO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFBhcmFtc0luaGVyaXRhbmNlU3RyYXRlZ3kgPSAnZW1wdHlPbmx5JyB8ICdhbHdheXMnO1xuXG4vKiogQGludGVybmFsICovXG5leHBvcnQgdHlwZSBJbmhlcml0ZWQgPSB7XG4gIHBhcmFtczogUGFyYW1zO1xuICBkYXRhOiBEYXRhO1xuICByZXNvbHZlOiBEYXRhO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbmhlcml0ZWQgcGFyYW1zLCBkYXRhLCBhbmQgcmVzb2x2ZSBmb3IgYSBnaXZlbiByb3V0ZS5cbiAqXG4gKiBCeSBkZWZhdWx0LCB3ZSBkbyBub3QgaW5oZXJpdCBwYXJlbnQgZGF0YSB1bmxlc3MgdGhlIGN1cnJlbnQgcm91dGUgaXMgcGF0aC1sZXNzIG9yIHRoZSBwYXJlbnRcbiAqIHJvdXRlIGlzIGNvbXBvbmVudC1sZXNzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5oZXJpdGVkKFxuICByb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgcGFyZW50OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90IHwgbnVsbCxcbiAgcGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneTogUGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSA9ICdlbXB0eU9ubHknLFxuKTogSW5oZXJpdGVkIHtcbiAgbGV0IGluaGVyaXRlZDogSW5oZXJpdGVkO1xuICBjb25zdCB7cm91dGVDb25maWd9ID0gcm91dGU7XG4gIGlmIChcbiAgICBwYXJlbnQgIT09IG51bGwgJiZcbiAgICAocGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSA9PT0gJ2Fsd2F5cycgfHxcbiAgICAgIC8vIGluaGVyaXQgcGFyZW50IGRhdGEgaWYgcm91dGUgaXMgZW1wdHkgcGF0aFxuICAgICAgcm91dGVDb25maWc/LnBhdGggPT09ICcnIHx8XG4gICAgICAvLyBpbmhlcml0IHBhcmVudCBkYXRhIGlmIHBhcmVudCB3YXMgY29tcG9uZW50bGVzc1xuICAgICAgKCFwYXJlbnQuY29tcG9uZW50ICYmICFwYXJlbnQucm91dGVDb25maWc/LmxvYWRDb21wb25lbnQpKVxuICApIHtcbiAgICBpbmhlcml0ZWQgPSB7XG4gICAgICBwYXJhbXM6IHsuLi5wYXJlbnQucGFyYW1zLCAuLi5yb3V0ZS5wYXJhbXN9LFxuICAgICAgZGF0YTogey4uLnBhcmVudC5kYXRhLCAuLi5yb3V0ZS5kYXRhfSxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgLy8gU25hcHNob3RzIGFyZSBjcmVhdGVkIHdpdGggZGF0YSBpbmhlcml0ZWQgZnJvbSBwYXJlbnQgYW5kIGd1YXJkcyAoaS5lLiBjYW5BY3RpdmF0ZSkgY2FuXG4gICAgICAgIC8vIGNoYW5nZSBkYXRhIGJlY2F1c2UgaXQncyBub3QgZnJvemVuLi4uXG4gICAgICAgIC8vIFRoaXMgZmlyc3QgbGluZSBjb3VsZCBiZSBkZWxldGVkIGNob3NlIHRvIGJyZWFrL2Rpc2FsbG93IG11dGF0aW5nIHRoZSBgZGF0YWAgb2JqZWN0IGluXG4gICAgICAgIC8vIGd1YXJkcy5cbiAgICAgICAgLy8gTm90ZSB0aGF0IGRhdGEgZnJvbSBwYXJlbnRzIHN0aWxsIG92ZXJyaWRlIHRoaXMgbXV0YXRlZCBkYXRhIHNvIGFueW9uZSByZWx5aW5nIG9uIHRoaXNcbiAgICAgICAgLy8gbWlnaHQgYmUgc3VycHJpc2VkIHRoYXQgaXQgZG9lc24ndCB3b3JrIGlmIHBhcmVudCBkYXRhIGlzIGluaGVyaXRlZCBidXQgb3RoZXJ3aXNlIGRvZXMuXG4gICAgICAgIC4uLnJvdXRlLmRhdGEsXG4gICAgICAgIC8vIEVuc3VyZSBpbmhlcml0ZWQgcmVzb2x2ZWQgZGF0YSBvdmVycmlkZXMgaW5oZXJpdGVkIHN0YXRpYyBkYXRhXG4gICAgICAgIC4uLnBhcmVudC5kYXRhLFxuICAgICAgICAvLyBzdGF0aWMgZGF0YSBmcm9tIHRoZSBjdXJyZW50IHJvdXRlIG92ZXJyaWRlcyBhbnkgaW5oZXJpdGVkIGRhdGFcbiAgICAgICAgLi4ucm91dGVDb25maWc/LmRhdGEsXG4gICAgICAgIC8vIHJlc29sdmVkIGRhdGEgZnJvbSBjdXJyZW50IHJvdXRlIG92ZXJyaWRlcyBldmVyeXRoaW5nXG4gICAgICAgIC4uLnJvdXRlLl9yZXNvbHZlZERhdGEsXG4gICAgICB9LFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgaW5oZXJpdGVkID0ge1xuICAgICAgcGFyYW1zOiB7Li4ucm91dGUucGFyYW1zfSxcbiAgICAgIGRhdGE6IHsuLi5yb3V0ZS5kYXRhfSxcbiAgICAgIHJlc29sdmU6IHsuLi5yb3V0ZS5kYXRhLCAuLi4ocm91dGUuX3Jlc29sdmVkRGF0YSA/PyB7fSl9LFxuICAgIH07XG4gIH1cblxuICBpZiAocm91dGVDb25maWcgJiYgaGFzU3RhdGljVGl0bGUocm91dGVDb25maWcpKSB7XG4gICAgaW5oZXJpdGVkLnJlc29sdmVbUm91dGVUaXRsZUtleV0gPSByb3V0ZUNvbmZpZy50aXRsZTtcbiAgfVxuICByZXR1cm4gaW5oZXJpdGVkO1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENvbnRhaW5zIHRoZSBpbmZvcm1hdGlvbiBhYm91dCBhIHJvdXRlIGFzc29jaWF0ZWQgd2l0aCBhIGNvbXBvbmVudCBsb2FkZWQgaW4gYW5cbiAqIG91dGxldCBhdCBhIHBhcnRpY3VsYXIgbW9tZW50IGluIHRpbWUuIEFjdGl2YXRlZFJvdXRlU25hcHNob3QgY2FuIGFsc28gYmUgdXNlZCB0b1xuICogdHJhdmVyc2UgdGhlIHJvdXRlciBzdGF0ZSB0cmVlLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBpbml0aWFsaXplcyBhIGNvbXBvbmVudCB3aXRoIHJvdXRlIGluZm9ybWF0aW9uIGV4dHJhY3RlZFxuICogZnJvbSB0aGUgc25hcHNob3Qgb2YgdGhlIHJvb3Qgbm9kZSBhdCB0aGUgdGltZSBvZiBjcmVhdGlvbi5cbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe3RlbXBsYXRlVXJsOicuL215LWNvbXBvbmVudC5odG1sJ30pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSkge1xuICogICAgIGNvbnN0IGlkOiBzdHJpbmcgPSByb3V0ZS5zbmFwc2hvdC5wYXJhbXMuaWQ7XG4gKiAgICAgY29uc3QgdXJsOiBzdHJpbmcgPSByb3V0ZS5zbmFwc2hvdC51cmwuam9pbignJyk7XG4gKiAgICAgY29uc3QgdXNlciA9IHJvdXRlLnNuYXBzaG90LmRhdGEudXNlcjtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgQWN0aXZhdGVkUm91dGVTbmFwc2hvdCB7XG4gIC8qKiBUaGUgY29uZmlndXJhdGlvbiB1c2VkIHRvIG1hdGNoIHRoaXMgcm91dGUgKiovXG4gIHB1YmxpYyByZWFkb25seSByb3V0ZUNvbmZpZzogUm91dGUgfCBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9yZXNvbHZlOiBSZXNvbHZlRGF0YTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcmVzb2x2ZWREYXRhPzogRGF0YTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcm91dGVyU3RhdGUhOiBSb3V0ZXJTdGF0ZVNuYXBzaG90O1xuICAvKiogQGludGVybmFsICovXG4gIF9wYXJhbU1hcD86IFBhcmFtTWFwO1xuICAvKiogQGludGVybmFsICovXG4gIF9xdWVyeVBhcmFtTWFwPzogUGFyYW1NYXA7XG5cbiAgLyoqIFRoZSByZXNvbHZlZCByb3V0ZSB0aXRsZSAqL1xuICBnZXQgdGl0bGUoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAvLyBOb3RlOiBUaGlzIF9tdXN0XyBiZSBhIGdldHRlciBiZWNhdXNlIHRoZSBkYXRhIGlzIG11dGF0ZWQgaW4gdGhlIHJlc29sdmVycy4gVGl0bGUgd2lsbCBub3QgYmVcbiAgICAvLyBhdmFpbGFibGUgYXQgdGhlIHRpbWUgb2YgY2xhc3MgaW5zdGFudGlhdGlvbi5cbiAgICByZXR1cm4gdGhpcy5kYXRhPy5bUm91dGVUaXRsZUtleV07XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBUaGUgVVJMIHNlZ21lbnRzIG1hdGNoZWQgYnkgdGhpcyByb3V0ZSAqL1xuICAgIHB1YmxpYyB1cmw6IFVybFNlZ21lbnRbXSxcbiAgICAvKipcbiAgICAgKiAgVGhlIG1hdHJpeCBwYXJhbWV0ZXJzIHNjb3BlZCB0byB0aGlzIHJvdXRlLlxuICAgICAqXG4gICAgICogIFlvdSBjYW4gY29tcHV0ZSBhbGwgcGFyYW1zIChvciBkYXRhKSBpbiB0aGUgcm91dGVyIHN0YXRlIG9yIHRvIGdldCBwYXJhbXMgb3V0c2lkZVxuICAgICAqICBvZiBhbiBhY3RpdmF0ZWQgY29tcG9uZW50IGJ5IHRyYXZlcnNpbmcgdGhlIGBSb3V0ZXJTdGF0ZWAgdHJlZSBhcyBpbiB0aGUgZm9sbG93aW5nXG4gICAgICogIGV4YW1wbGU6XG4gICAgICogIGBgYFxuICAgICAqICBjb2xsZWN0Um91dGVQYXJhbXMocm91dGVyOiBSb3V0ZXIpIHtcbiAgICAgKiAgICBsZXQgcGFyYW1zID0ge307XG4gICAgICogICAgbGV0IHN0YWNrOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90W10gPSBbcm91dGVyLnJvdXRlclN0YXRlLnNuYXBzaG90LnJvb3RdO1xuICAgICAqICAgIHdoaWxlIChzdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICogICAgICBjb25zdCByb3V0ZSA9IHN0YWNrLnBvcCgpITtcbiAgICAgKiAgICAgIHBhcmFtcyA9IHsuLi5wYXJhbXMsIC4uLnJvdXRlLnBhcmFtc307XG4gICAgICogICAgICBzdGFjay5wdXNoKC4uLnJvdXRlLmNoaWxkcmVuKTtcbiAgICAgKiAgICB9XG4gICAgICogICAgcmV0dXJuIHBhcmFtcztcbiAgICAgKiAgfVxuICAgICAqICBgYGBcbiAgICAgKi9cbiAgICBwdWJsaWMgcGFyYW1zOiBQYXJhbXMsXG4gICAgLyoqIFRoZSBxdWVyeSBwYXJhbWV0ZXJzIHNoYXJlZCBieSBhbGwgdGhlIHJvdXRlcyAqL1xuICAgIHB1YmxpYyBxdWVyeVBhcmFtczogUGFyYW1zLFxuICAgIC8qKiBUaGUgVVJMIGZyYWdtZW50IHNoYXJlZCBieSBhbGwgdGhlIHJvdXRlcyAqL1xuICAgIHB1YmxpYyBmcmFnbWVudDogc3RyaW5nIHwgbnVsbCxcbiAgICAvKiogVGhlIHN0YXRpYyBhbmQgcmVzb2x2ZWQgZGF0YSBvZiB0aGlzIHJvdXRlICovXG4gICAgcHVibGljIGRhdGE6IERhdGEsXG4gICAgLyoqIFRoZSBvdXRsZXQgbmFtZSBvZiB0aGUgcm91dGUgKi9cbiAgICBwdWJsaWMgb3V0bGV0OiBzdHJpbmcsXG4gICAgLyoqIFRoZSBjb21wb25lbnQgb2YgdGhlIHJvdXRlICovXG4gICAgcHVibGljIGNvbXBvbmVudDogVHlwZTxhbnk+IHwgbnVsbCxcbiAgICByb3V0ZUNvbmZpZzogUm91dGUgfCBudWxsLFxuICAgIHJlc29sdmU6IFJlc29sdmVEYXRhLFxuICApIHtcbiAgICB0aGlzLnJvdXRlQ29uZmlnID0gcm91dGVDb25maWc7XG4gICAgdGhpcy5fcmVzb2x2ZSA9IHJlc29sdmU7XG4gIH1cblxuICAvKiogVGhlIHJvb3Qgb2YgdGhlIHJvdXRlciBzdGF0ZSAqL1xuICBnZXQgcm9vdCgpOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90IHtcbiAgICByZXR1cm4gdGhpcy5fcm91dGVyU3RhdGUucm9vdDtcbiAgfVxuXG4gIC8qKiBUaGUgcGFyZW50IG9mIHRoaXMgcm91dGUgaW4gdGhlIHJvdXRlciBzdGF0ZSB0cmVlICovXG4gIGdldCBwYXJlbnQoKTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9yb3V0ZXJTdGF0ZS5wYXJlbnQodGhpcyk7XG4gIH1cblxuICAvKiogVGhlIGZpcnN0IGNoaWxkIG9mIHRoaXMgcm91dGUgaW4gdGhlIHJvdXRlciBzdGF0ZSB0cmVlICovXG4gIGdldCBmaXJzdENoaWxkKCk6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fcm91dGVyU3RhdGUuZmlyc3RDaGlsZCh0aGlzKTtcbiAgfVxuXG4gIC8qKiBUaGUgY2hpbGRyZW4gb2YgdGhpcyByb3V0ZSBpbiB0aGUgcm91dGVyIHN0YXRlIHRyZWUgKi9cbiAgZ2V0IGNoaWxkcmVuKCk6IEFjdGl2YXRlZFJvdXRlU25hcHNob3RbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3JvdXRlclN0YXRlLmNoaWxkcmVuKHRoaXMpO1xuICB9XG5cbiAgLyoqIFRoZSBwYXRoIGZyb20gdGhlIHJvb3Qgb2YgdGhlIHJvdXRlciBzdGF0ZSB0cmVlIHRvIHRoaXMgcm91dGUgKi9cbiAgZ2V0IHBhdGhGcm9tUm9vdCgpOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90W10ge1xuICAgIHJldHVybiB0aGlzLl9yb3V0ZXJTdGF0ZS5wYXRoRnJvbVJvb3QodGhpcyk7XG4gIH1cblxuICBnZXQgcGFyYW1NYXAoKTogUGFyYW1NYXAge1xuICAgIHRoaXMuX3BhcmFtTWFwID8/PSBjb252ZXJ0VG9QYXJhbU1hcCh0aGlzLnBhcmFtcyk7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmFtTWFwO1xuICB9XG5cbiAgZ2V0IHF1ZXJ5UGFyYW1NYXAoKTogUGFyYW1NYXAge1xuICAgIHRoaXMuX3F1ZXJ5UGFyYW1NYXAgPz89IGNvbnZlcnRUb1BhcmFtTWFwKHRoaXMucXVlcnlQYXJhbXMpO1xuICAgIHJldHVybiB0aGlzLl9xdWVyeVBhcmFtTWFwO1xuICB9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICBjb25zdCB1cmwgPSB0aGlzLnVybC5tYXAoKHNlZ21lbnQpID0+IHNlZ21lbnQudG9TdHJpbmcoKSkuam9pbignLycpO1xuICAgIGNvbnN0IG1hdGNoZWQgPSB0aGlzLnJvdXRlQ29uZmlnID8gdGhpcy5yb3V0ZUNvbmZpZy5wYXRoIDogJyc7XG4gICAgcmV0dXJuIGBSb3V0ZSh1cmw6JyR7dXJsfScsIHBhdGg6JyR7bWF0Y2hlZH0nKWA7XG4gIH1cbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBSZXByZXNlbnRzIHRoZSBzdGF0ZSBvZiB0aGUgcm91dGVyIGF0IGEgbW9tZW50IGluIHRpbWUuXG4gKlxuICogVGhpcyBpcyBhIHRyZWUgb2YgYWN0aXZhdGVkIHJvdXRlIHNuYXBzaG90cy4gRXZlcnkgbm9kZSBpbiB0aGlzIHRyZWUga25vd3MgYWJvdXRcbiAqIHRoZSBcImNvbnN1bWVkXCIgVVJMIHNlZ21lbnRzLCB0aGUgZXh0cmFjdGVkIHBhcmFtZXRlcnMsIGFuZCB0aGUgcmVzb2x2ZWQgZGF0YS5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgc2hvd3MgaG93IGEgY29tcG9uZW50IGlzIGluaXRpYWxpemVkIHdpdGggaW5mb3JtYXRpb25cbiAqIGZyb20gdGhlIHNuYXBzaG90IG9mIHRoZSByb290IG5vZGUncyBzdGF0ZSBhdCB0aGUgdGltZSBvZiBjcmVhdGlvbi5cbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe3RlbXBsYXRlVXJsOid0ZW1wbGF0ZS5odG1sJ30pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKHJvdXRlcjogUm91dGVyKSB7XG4gKiAgICAgY29uc3Qgc3RhdGU6IFJvdXRlclN0YXRlID0gcm91dGVyLnJvdXRlclN0YXRlO1xuICogICAgIGNvbnN0IHNuYXBzaG90OiBSb3V0ZXJTdGF0ZVNuYXBzaG90ID0gc3RhdGUuc25hcHNob3Q7XG4gKiAgICAgY29uc3Qgcm9vdDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCA9IHNuYXBzaG90LnJvb3Q7XG4gKiAgICAgY29uc3QgY2hpbGQgPSByb290LmZpcnN0Q2hpbGQ7XG4gKiAgICAgY29uc3QgaWQ6IE9ic2VydmFibGU8c3RyaW5nPiA9IGNoaWxkLnBhcmFtcy5tYXAocCA9PiBwLmlkKTtcbiAqICAgICAvLy4uLlxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZXJTdGF0ZVNuYXBzaG90IGV4dGVuZHMgVHJlZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIFRoZSB1cmwgZnJvbSB3aGljaCB0aGlzIHNuYXBzaG90IHdhcyBjcmVhdGVkICovXG4gICAgcHVibGljIHVybDogc3RyaW5nLFxuICAgIHJvb3Q6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+LFxuICApIHtcbiAgICBzdXBlcihyb290KTtcbiAgICBzZXRSb3V0ZXJTdGF0ZSg8Um91dGVyU3RhdGVTbmFwc2hvdD50aGlzLCByb290KTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZU5vZGUodGhpcy5fcm9vdCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0Um91dGVyU3RhdGU8VSwgVCBleHRlbmRzIHtfcm91dGVyU3RhdGU6IFV9PihzdGF0ZTogVSwgbm9kZTogVHJlZU5vZGU8VD4pOiB2b2lkIHtcbiAgbm9kZS52YWx1ZS5fcm91dGVyU3RhdGUgPSBzdGF0ZTtcbiAgbm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjKSA9PiBzZXRSb3V0ZXJTdGF0ZShzdGF0ZSwgYykpO1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemVOb2RlKG5vZGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+KTogc3RyaW5nIHtcbiAgY29uc3QgYyA9IG5vZGUuY2hpbGRyZW4ubGVuZ3RoID4gMCA/IGAgeyAke25vZGUuY2hpbGRyZW4ubWFwKHNlcmlhbGl6ZU5vZGUpLmpvaW4oJywgJyl9IH0gYCA6ICcnO1xuICByZXR1cm4gYCR7bm9kZS52YWx1ZX0ke2N9YDtcbn1cblxuLyoqXG4gKiBUaGUgZXhwZWN0YXRpb24gaXMgdGhhdCB0aGUgYWN0aXZhdGUgcm91dGUgaXMgY3JlYXRlZCB3aXRoIHRoZSByaWdodCBzZXQgb2YgcGFyYW1ldGVycy5cbiAqIFNvIHdlIHB1c2ggbmV3IHZhbHVlcyBpbnRvIHRoZSBvYnNlcnZhYmxlcyBvbmx5IHdoZW4gdGhleSBhcmUgbm90IHRoZSBpbml0aWFsIHZhbHVlcy5cbiAqIEFuZCB3ZSBkZXRlY3QgdGhhdCBieSBjaGVja2luZyBpZiB0aGUgc25hcHNob3QgZmllbGQgaXMgc2V0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWR2YW5jZUFjdGl2YXRlZFJvdXRlKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSk6IHZvaWQge1xuICBpZiAocm91dGUuc25hcHNob3QpIHtcbiAgICBjb25zdCBjdXJyZW50U25hcHNob3QgPSByb3V0ZS5zbmFwc2hvdDtcbiAgICBjb25zdCBuZXh0U25hcHNob3QgPSByb3V0ZS5fZnV0dXJlU25hcHNob3Q7XG4gICAgcm91dGUuc25hcHNob3QgPSBuZXh0U25hcHNob3Q7XG4gICAgaWYgKCFzaGFsbG93RXF1YWwoY3VycmVudFNuYXBzaG90LnF1ZXJ5UGFyYW1zLCBuZXh0U25hcHNob3QucXVlcnlQYXJhbXMpKSB7XG4gICAgICByb3V0ZS5xdWVyeVBhcmFtc1N1YmplY3QubmV4dChuZXh0U25hcHNob3QucXVlcnlQYXJhbXMpO1xuICAgIH1cbiAgICBpZiAoY3VycmVudFNuYXBzaG90LmZyYWdtZW50ICE9PSBuZXh0U25hcHNob3QuZnJhZ21lbnQpIHtcbiAgICAgIHJvdXRlLmZyYWdtZW50U3ViamVjdC5uZXh0KG5leHRTbmFwc2hvdC5mcmFnbWVudCk7XG4gICAgfVxuICAgIGlmICghc2hhbGxvd0VxdWFsKGN1cnJlbnRTbmFwc2hvdC5wYXJhbXMsIG5leHRTbmFwc2hvdC5wYXJhbXMpKSB7XG4gICAgICByb3V0ZS5wYXJhbXNTdWJqZWN0Lm5leHQobmV4dFNuYXBzaG90LnBhcmFtcyk7XG4gICAgfVxuICAgIGlmICghc2hhbGxvd0VxdWFsQXJyYXlzKGN1cnJlbnRTbmFwc2hvdC51cmwsIG5leHRTbmFwc2hvdC51cmwpKSB7XG4gICAgICByb3V0ZS51cmxTdWJqZWN0Lm5leHQobmV4dFNuYXBzaG90LnVybCk7XG4gICAgfVxuICAgIGlmICghc2hhbGxvd0VxdWFsKGN1cnJlbnRTbmFwc2hvdC5kYXRhLCBuZXh0U25hcHNob3QuZGF0YSkpIHtcbiAgICAgIHJvdXRlLmRhdGFTdWJqZWN0Lm5leHQobmV4dFNuYXBzaG90LmRhdGEpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByb3V0ZS5zbmFwc2hvdCA9IHJvdXRlLl9mdXR1cmVTbmFwc2hvdDtcblxuICAgIC8vIHRoaXMgaXMgZm9yIHJlc29sdmVkIGRhdGFcbiAgICByb3V0ZS5kYXRhU3ViamVjdC5uZXh0KHJvdXRlLl9mdXR1cmVTbmFwc2hvdC5kYXRhKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxQYXJhbXNBbmRVcmxTZWdtZW50cyhcbiAgYTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbiAgYjogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCxcbik6IGJvb2xlYW4ge1xuICBjb25zdCBlcXVhbFVybFBhcmFtcyA9IHNoYWxsb3dFcXVhbChhLnBhcmFtcywgYi5wYXJhbXMpICYmIGVxdWFsU2VnbWVudHMoYS51cmwsIGIudXJsKTtcbiAgY29uc3QgcGFyZW50c01pc21hdGNoID0gIWEucGFyZW50ICE9PSAhYi5wYXJlbnQ7XG5cbiAgcmV0dXJuIChcbiAgICBlcXVhbFVybFBhcmFtcyAmJlxuICAgICFwYXJlbnRzTWlzbWF0Y2ggJiZcbiAgICAoIWEucGFyZW50IHx8IGVxdWFsUGFyYW1zQW5kVXJsU2VnbWVudHMoYS5wYXJlbnQsIGIucGFyZW50ISkpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNTdGF0aWNUaXRsZShjb25maWc6IFJvdXRlKSB7XG4gIHJldHVybiB0eXBlb2YgY29uZmlnLnRpdGxlID09PSAnc3RyaW5nJyB8fCBjb25maWcudGl0bGUgPT09IG51bGw7XG59XG4iXX0=