/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
 * @see [Getting route information](guide/router#getting-route-information)
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
 * @see [Getting route information](guide/router#getting-route-information)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX3N0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yb3V0ZXJfc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0gsT0FBTyxFQUFDLGVBQWUsRUFBYyxFQUFFLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDckQsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR25DLE9BQU8sRUFBQyxpQkFBaUIsRUFBb0IsY0FBYyxFQUFFLGFBQWEsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUM1RixPQUFPLEVBQUMsYUFBYSxFQUFFLFVBQVUsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNyRCxPQUFPLEVBQUMsWUFBWSxFQUFFLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDcEUsT0FBTyxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFNUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThCRztBQUNILE1BQU0sT0FBTyxXQUFZLFNBQVEsSUFBb0I7SUFDbkQsZ0JBQWdCO0lBQ2hCLFlBQ0UsSUFBOEI7SUFDOUIsK0NBQStDO0lBQ3hDLFFBQTZCO1FBRXBDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUZMLGFBQVEsR0FBUixRQUFRLENBQXFCO1FBR3BDLGNBQWMsQ0FBYyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVRLFFBQVE7UUFDZixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbEMsQ0FBQztDQUNGO0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUFDLGFBQStCO0lBQzlELE1BQU0sUUFBUSxHQUFHLHdCQUF3QixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3pELE1BQU0sUUFBUSxHQUFHLElBQUksZUFBZSxDQUFDLENB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LFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzNELEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QyxDQUFDO0lBQ0gsQ0FBQztTQUFNLENBQUM7UUFDTixLQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUM7UUFFdkMsNEJBQTRCO1FBQzVCLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckQsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLFVBQVUseUJBQXlCLENBQ3ZDLENBQXlCLEVBQ3pCLENBQXlCO0lBRXpCLE1BQU0sY0FBYyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkYsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUVoRCxPQUFPLENBQ0wsY0FBYztRQUNkLENBQUMsZUFBZTtRQUNoQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFPLENBQUMsQ0FBQyxDQUM5RCxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sVUFBVSxjQUFjLENBQUMsTUFBYTtJQUMxQyxPQUFPLE9BQU8sTUFBTSxDQUFDLEtBQUssS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUM7QUFDbkUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1R5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUsIG9mfSBmcm9tICdyeGpzJztcbmltcG9ydCB7bWFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7RGF0YSwgUmVzb2x2ZURhdGEsIFJvdXRlfSBmcm9tICcuL21vZGVscyc7XG5pbXBvcnQge2NvbnZlcnRUb1BhcmFtTWFwLCBQYXJhbU1hcCwgUGFyYW1zLCBQUklNQVJZX09VVExFVCwgUm91dGVUaXRsZUtleX0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHtlcXVhbFNlZ21lbnRzLCBVcmxTZWdtZW50fSBmcm9tICcuL3VybF90cmVlJztcbmltcG9ydCB7c2hhbGxvd0VxdWFsLCBzaGFsbG93RXF1YWxBcnJheXN9IGZyb20gJy4vdXRpbHMvY29sbGVjdGlvbic7XG5pbXBvcnQge1RyZWUsIFRyZWVOb2RlfSBmcm9tICcuL3V0aWxzL3RyZWUnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIHN0YXRlIG9mIHRoZSByb3V0ZXIgYXMgYSB0cmVlIG9mIGFjdGl2YXRlZCByb3V0ZXMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBFdmVyeSBub2RlIGluIHRoZSByb3V0ZSB0cmVlIGlzIGFuIGBBY3RpdmF0ZWRSb3V0ZWAgaW5zdGFuY2VcbiAqIHRoYXQga25vd3MgYWJvdXQgdGhlIFwiY29uc3VtZWRcIiBVUkwgc2VnbWVudHMsIHRoZSBleHRyYWN0ZWQgcGFyYW1ldGVycyxcbiAqIGFuZCB0aGUgcmVzb2x2ZWQgZGF0YS5cbiAqIFVzZSB0aGUgYEFjdGl2YXRlZFJvdXRlYCBwcm9wZXJ0aWVzIHRvIHRyYXZlcnNlIHRoZSB0cmVlIGZyb20gYW55IG5vZGUuXG4gKlxuICogVGhlIGZvbGxvd2luZyBmcmFnbWVudCBzaG93cyBob3cgYSBjb21wb25lbnQgZ2V0cyB0aGUgcm9vdCBub2RlXG4gKiBvZiB0aGUgY3VycmVudCBzdGF0ZSB0byBlc3RhYmxpc2ggaXRzIG93biByb3V0ZSB0cmVlOlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7dGVtcGxhdGVVcmw6J3RlbXBsYXRlLmh0bWwnfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3Iocm91dGVyOiBSb3V0ZXIpIHtcbiAqICAgICBjb25zdCBzdGF0ZTogUm91dGVyU3RhdGUgPSByb3V0ZXIucm91dGVyU3RhdGU7XG4gKiAgICAgY29uc3Qgcm9vdDogQWN0aXZhdGVkUm91dGUgPSBzdGF0ZS5yb290O1xuICogICAgIGNvbnN0IGNoaWxkID0gcm9vdC5maXJzdENoaWxkO1xuICogICAgIGNvbnN0IGlkOiBPYnNlcnZhYmxlPHN0cmluZz4gPSBjaGlsZC5wYXJhbXMubWFwKHAgPT4gcC5pZCk7XG4gKiAgICAgLy8uLi5cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQHNlZSB7QGxpbmsgQWN0aXZhdGVkUm91dGV9XG4gKiBAc2VlIFtHZXR0aW5nIHJvdXRlIGluZm9ybWF0aW9uXShndWlkZS9yb3V0ZXIjZ2V0dGluZy1yb3V0ZS1pbmZvcm1hdGlvbilcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZXJTdGF0ZSBleHRlbmRzIFRyZWU8QWN0aXZhdGVkUm91dGU+IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICByb290OiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZT4sXG4gICAgLyoqIFRoZSBjdXJyZW50IHNuYXBzaG90IG9mIHRoZSByb3V0ZXIgc3RhdGUgKi9cbiAgICBwdWJsaWMgc25hcHNob3Q6IFJvdXRlclN0YXRlU25hcHNob3QsXG4gICkge1xuICAgIHN1cGVyKHJvb3QpO1xuICAgIHNldFJvdXRlclN0YXRlKDxSb3V0ZXJTdGF0ZT50aGlzLCByb290KTtcbiAgfVxuXG4gIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc25hcHNob3QudG9TdHJpbmcoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRW1wdHlTdGF0ZShyb290Q29tcG9uZW50OiBUeXBlPGFueT4gfCBudWxsKTogUm91dGVyU3RhdGUge1xuICBjb25zdCBzbmFwc2hvdCA9IGNyZWF0ZUVtcHR5U3RhdGVTbmFwc2hvdChyb290Q29tcG9uZW50KTtcbiAgY29uc3QgZW1wdHlVcmwgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KFtuZXcgVXJsU2VnbWVudCgnJywge30pXSk7XG4gIGNvbnN0IGVtcHR5UGFyYW1zID0gbmV3IEJlaGF2aW9yU3ViamVjdCh7fSk7XG4gIGNvbnN0IGVtcHR5RGF0YSA9IG5ldyBCZWhhdmlvclN1YmplY3Qoe30pO1xuICBjb25zdCBlbXB0eVF1ZXJ5UGFyYW1zID0gbmV3IEJlaGF2aW9yU3ViamVjdCh7fSk7XG4gIGNvbnN0IGZyYWdtZW50ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxzdHJpbmcgfCBudWxsPignJyk7XG4gIGNvbnN0IGFjdGl2YXRlZCA9IG5ldyBBY3RpdmF0ZWRSb3V0ZShcbiAgICBlbXB0eVVybCxcbiAgICBlbXB0eVBhcmFtcyxcbiAgICBlbXB0eVF1ZXJ5UGFyYW1zLFxuICAgIGZyYWdtZW50LFxuICAgIGVtcHR5RGF0YSxcbiAgICBQUklNQVJZX09VVExFVCxcbiAgICByb290Q29tcG9uZW50LFxuICAgIHNuYXBzaG90LnJvb3QsXG4gICk7XG4gIGFjdGl2YXRlZC5zbmFwc2hvdCA9IHNuYXBzaG90LnJvb3Q7XG4gIHJldHVybiBuZXcgUm91dGVyU3RhdGUobmV3IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlPihhY3RpdmF0ZWQsIFtdKSwgc25hcHNob3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRW1wdHlTdGF0ZVNuYXBzaG90KHJvb3RDb21wb25lbnQ6IFR5cGU8YW55PiB8IG51bGwpOiBSb3V0ZXJTdGF0ZVNuYXBzaG90IHtcbiAgY29uc3QgZW1wdHlQYXJhbXMgPSB7fTtcbiAgY29uc3QgZW1wdHlEYXRhID0ge307XG4gIGNvbnN0IGVtcHR5UXVlcnlQYXJhbXMgPSB7fTtcbiAgY29uc3QgZnJhZ21lbnQgPSAnJztcbiAgY29uc3QgYWN0aXZhdGVkID0gbmV3IEFjdGl2YXRlZFJvdXRlU25hcHNob3QoXG4gICAgW10sXG4gICAgZW1wdHlQYXJhbXMsXG4gICAgZW1wdHlRdWVyeVBhcmFtcyxcbiAgICBmcmFnbWVudCxcbiAgICBlbXB0eURhdGEsXG4gICAgUFJJTUFSWV9PVVRMRVQsXG4gICAgcm9vdENvbXBvbmVudCxcbiAgICBudWxsLFxuICAgIHt9LFxuICApO1xuICByZXR1cm4gbmV3IFJvdXRlclN0YXRlU25hcHNob3QoJycsIG5ldyBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90PihhY3RpdmF0ZWQsIFtdKSk7XG59XG5cbi8qKlxuICogUHJvdmlkZXMgYWNjZXNzIHRvIGluZm9ybWF0aW9uIGFib3V0IGEgcm91dGUgYXNzb2NpYXRlZCB3aXRoIGEgY29tcG9uZW50XG4gKiB0aGF0IGlzIGxvYWRlZCBpbiBhbiBvdXRsZXQuXG4gKiBVc2UgdG8gdHJhdmVyc2UgdGhlIGBSb3V0ZXJTdGF0ZWAgdHJlZSBhbmQgZXh0cmFjdCBpbmZvcm1hdGlvbiBmcm9tIG5vZGVzLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgdG8gY29uc3RydWN0IGEgY29tcG9uZW50IHVzaW5nIGluZm9ybWF0aW9uIGZyb20gYVxuICogY3VycmVudGx5IGFjdGl2YXRlZCByb3V0ZS5cbiAqXG4gKiBOb3RlOiB0aGUgb2JzZXJ2YWJsZXMgaW4gdGhpcyBjbGFzcyBvbmx5IGVtaXQgd2hlbiB0aGUgY3VycmVudCBhbmQgcHJldmlvdXMgdmFsdWVzIGRpZmZlciBiYXNlZFxuICogb24gc2hhbGxvdyBlcXVhbGl0eS4gRm9yIGV4YW1wbGUsIGNoYW5naW5nIGRlZXBseSBuZXN0ZWQgcHJvcGVydGllcyBpbiByZXNvbHZlZCBgZGF0YWAgd2lsbCBub3RcbiAqIGNhdXNlIHRoZSBgQWN0aXZhdGVkUm91dGUuZGF0YWAgYE9ic2VydmFibGVgIHRvIGVtaXQgYSBuZXcgdmFsdWUuXG4gKlxuICoge0BleGFtcGxlIHJvdXRlci9hY3RpdmF0ZWQtcm91dGUvbW9kdWxlLnRzIHJlZ2lvbj1cImFjdGl2YXRlZC1yb3V0ZVwiXG4gKiAgICAgaGVhZGVyPVwiYWN0aXZhdGVkLXJvdXRlLmNvbXBvbmVudC50c1wifVxuICpcbiAqIEBzZWUgW0dldHRpbmcgcm91dGUgaW5mb3JtYXRpb25dKGd1aWRlL3JvdXRlciNnZXR0aW5nLXJvdXRlLWluZm9ybWF0aW9uKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIEFjdGl2YXRlZFJvdXRlIHtcbiAgLyoqIFRoZSBjdXJyZW50IHNuYXBzaG90IG9mIHRoaXMgcm91dGUgKi9cbiAgc25hcHNob3QhOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90O1xuICAvKiogQGludGVybmFsICovXG4gIF9mdXR1cmVTbmFwc2hvdDogQWN0aXZhdGVkUm91dGVTbmFwc2hvdDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcm91dGVyU3RhdGUhOiBSb3V0ZXJTdGF0ZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyYW1NYXA/OiBPYnNlcnZhYmxlPFBhcmFtTWFwPjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcXVlcnlQYXJhbU1hcD86IE9ic2VydmFibGU8UGFyYW1NYXA+O1xuXG4gIC8qKiBBbiBPYnNlcnZhYmxlIG9mIHRoZSByZXNvbHZlZCByb3V0ZSB0aXRsZSAqL1xuICByZWFkb25seSB0aXRsZTogT2JzZXJ2YWJsZTxzdHJpbmcgfCB1bmRlZmluZWQ+O1xuXG4gIC8qKiBBbiBvYnNlcnZhYmxlIG9mIHRoZSBVUkwgc2VnbWVudHMgbWF0Y2hlZCBieSB0aGlzIHJvdXRlLiAqL1xuICBwdWJsaWMgdXJsOiBPYnNlcnZhYmxlPFVybFNlZ21lbnRbXT47XG4gIC8qKiBBbiBvYnNlcnZhYmxlIG9mIHRoZSBtYXRyaXggcGFyYW1ldGVycyBzY29wZWQgdG8gdGhpcyByb3V0ZS4gKi9cbiAgcHVibGljIHBhcmFtczogT2JzZXJ2YWJsZTxQYXJhbXM+O1xuICAvKiogQW4gb2JzZXJ2YWJsZSBvZiB0aGUgcXVlcnkgcGFyYW1ldGVycyBzaGFyZWQgYnkgYWxsIHRoZSByb3V0ZXMuICovXG4gIHB1YmxpYyBxdWVyeVBhcmFtczogT2JzZXJ2YWJsZTxQYXJhbXM+O1xuICAvKiogQW4gb2JzZXJ2YWJsZSBvZiB0aGUgVVJMIGZyYWdtZW50IHNoYXJlZCBieSBhbGwgdGhlIHJvdXRlcy4gKi9cbiAgcHVibGljIGZyYWdtZW50OiBPYnNlcnZhYmxlPHN0cmluZyB8IG51bGw+O1xuICAvKiogQW4gb2JzZXJ2YWJsZSBvZiB0aGUgc3RhdGljIGFuZCByZXNvbHZlZCBkYXRhIG9mIHRoaXMgcm91dGUuICovXG4gIHB1YmxpYyBkYXRhOiBPYnNlcnZhYmxlPERhdGE+O1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgIHB1YmxpYyB1cmxTdWJqZWN0OiBCZWhhdmlvclN1YmplY3Q8VXJsU2VnbWVudFtdPixcbiAgICAvKiogQGludGVybmFsICovXG4gICAgcHVibGljIHBhcmFtc1N1YmplY3Q6IEJlaGF2aW9yU3ViamVjdDxQYXJhbXM+LFxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwdWJsaWMgcXVlcnlQYXJhbXNTdWJqZWN0OiBCZWhhdmlvclN1YmplY3Q8UGFyYW1zPixcbiAgICAvKiogQGludGVybmFsICovXG4gICAgcHVibGljIGZyYWdtZW50U3ViamVjdDogQmVoYXZpb3JTdWJqZWN0PHN0cmluZyB8IG51bGw+LFxuICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICBwdWJsaWMgZGF0YVN1YmplY3Q6IEJlaGF2aW9yU3ViamVjdDxEYXRhPixcbiAgICAvKiogVGhlIG91dGxldCBuYW1lIG9mIHRoZSByb3V0ZSwgYSBjb25zdGFudC4gKi9cbiAgICBwdWJsaWMgb3V0bGV0OiBzdHJpbmcsXG4gICAgLyoqIFRoZSBjb21wb25lbnQgb2YgdGhlIHJvdXRlLCBhIGNvbnN0YW50LiAqL1xuICAgIHB1YmxpYyBjb21wb25lbnQ6IFR5cGU8YW55PiB8IG51bGwsXG4gICAgZnV0dXJlU25hcHNob3Q6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsXG4gICkge1xuICAgIHRoaXMuX2Z1dHVyZVNuYXBzaG90ID0gZnV0dXJlU25hcHNob3Q7XG4gICAgdGhpcy50aXRsZSA9IHRoaXMuZGF0YVN1YmplY3Q/LnBpcGUobWFwKChkOiBEYXRhKSA9PiBkW1JvdXRlVGl0bGVLZXldKSkgPz8gb2YodW5kZWZpbmVkKTtcbiAgICAvLyBUT0RPKGF0c2NvdHQpOiBWZXJpZnkgdGhhdCB0aGVzZSBjYW4gYmUgY2hhbmdlZCB0byBgLmFzT2JzZXJ2YWJsZSgpYCB3aXRoIFRHUC5cbiAgICB0aGlzLnVybCA9IHVybFN1YmplY3Q7XG4gICAgdGhpcy5wYXJhbXMgPSBwYXJhbXNTdWJqZWN0O1xuICAgIHRoaXMucXVlcnlQYXJhbXMgPSBxdWVyeVBhcmFtc1N1YmplY3Q7XG4gICAgdGhpcy5mcmFnbWVudCA9IGZyYWdtZW50U3ViamVjdDtcbiAgICB0aGlzLmRhdGEgPSBkYXRhU3ViamVjdDtcbiAgfVxuXG4gIC8qKiBUaGUgY29uZmlndXJhdGlvbiB1c2VkIHRvIG1hdGNoIHRoaXMgcm91dGUuICovXG4gIGdldCByb3V0ZUNvbmZpZygpOiBSb3V0ZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9mdXR1cmVTbmFwc2hvdC5yb3V0ZUNvbmZpZztcbiAgfVxuXG4gIC8qKiBUaGUgcm9vdCBvZiB0aGUgcm91dGVyIHN0YXRlLiAqL1xuICBnZXQgcm9vdCgpOiBBY3RpdmF0ZWRSb3V0ZSB7XG4gICAgcmV0dXJuIHRoaXMuX3JvdXRlclN0YXRlLnJvb3Q7XG4gIH1cblxuICAvKiogVGhlIHBhcmVudCBvZiB0aGlzIHJvdXRlIGluIHRoZSByb3V0ZXIgc3RhdGUgdHJlZS4gKi9cbiAgZ2V0IHBhcmVudCgpOiBBY3RpdmF0ZWRSb3V0ZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9yb3V0ZXJTdGF0ZS5wYXJlbnQodGhpcyk7XG4gIH1cblxuICAvKiogVGhlIGZpcnN0IGNoaWxkIG9mIHRoaXMgcm91dGUgaW4gdGhlIHJvdXRlciBzdGF0ZSB0cmVlLiAqL1xuICBnZXQgZmlyc3RDaGlsZCgpOiBBY3RpdmF0ZWRSb3V0ZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9yb3V0ZXJTdGF0ZS5maXJzdENoaWxkKHRoaXMpO1xuICB9XG5cbiAgLyoqIFRoZSBjaGlsZHJlbiBvZiB0aGlzIHJvdXRlIGluIHRoZSByb3V0ZXIgc3RhdGUgdHJlZS4gKi9cbiAgZ2V0IGNoaWxkcmVuKCk6IEFjdGl2YXRlZFJvdXRlW10ge1xuICAgIHJldHVybiB0aGlzLl9yb3V0ZXJTdGF0ZS5jaGlsZHJlbih0aGlzKTtcbiAgfVxuXG4gIC8qKiBUaGUgcGF0aCBmcm9tIHRoZSByb290IG9mIHRoZSByb3V0ZXIgc3RhdGUgdHJlZSB0byB0aGlzIHJvdXRlLiAqL1xuICBnZXQgcGF0aEZyb21Sb290KCk6IEFjdGl2YXRlZFJvdXRlW10ge1xuICAgIHJldHVybiB0aGlzLl9yb3V0ZXJTdGF0ZS5wYXRoRnJvbVJvb3QodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQW4gT2JzZXJ2YWJsZSB0aGF0IGNvbnRhaW5zIGEgbWFwIG9mIHRoZSByZXF1aXJlZCBhbmQgb3B0aW9uYWwgcGFyYW1ldGVyc1xuICAgKiBzcGVjaWZpYyB0byB0aGUgcm91dGUuXG4gICAqIFRoZSBtYXAgc3VwcG9ydHMgcmV0cmlldmluZyBzaW5nbGUgYW5kIG11bHRpcGxlIHZhbHVlcyBmcm9tIHRoZSBzYW1lIHBhcmFtZXRlci5cbiAgICovXG4gIGdldCBwYXJhbU1hcCgpOiBPYnNlcnZhYmxlPFBhcmFtTWFwPiB7XG4gICAgdGhpcy5fcGFyYW1NYXAgPz89IHRoaXMucGFyYW1zLnBpcGUobWFwKChwOiBQYXJhbXMpOiBQYXJhbU1hcCA9PiBjb252ZXJ0VG9QYXJhbU1hcChwKSkpO1xuICAgIHJldHVybiB0aGlzLl9wYXJhbU1hcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBPYnNlcnZhYmxlIHRoYXQgY29udGFpbnMgYSBtYXAgb2YgdGhlIHF1ZXJ5IHBhcmFtZXRlcnMgYXZhaWxhYmxlIHRvIGFsbCByb3V0ZXMuXG4gICAqIFRoZSBtYXAgc3VwcG9ydHMgcmV0cmlldmluZyBzaW5nbGUgYW5kIG11bHRpcGxlIHZhbHVlcyBmcm9tIHRoZSBxdWVyeSBwYXJhbWV0ZXIuXG4gICAqL1xuICBnZXQgcXVlcnlQYXJhbU1hcCgpOiBPYnNlcnZhYmxlPFBhcmFtTWFwPiB7XG4gICAgdGhpcy5fcXVlcnlQYXJhbU1hcCA/Pz0gdGhpcy5xdWVyeVBhcmFtcy5waXBlKFxuICAgICAgbWFwKChwOiBQYXJhbXMpOiBQYXJhbU1hcCA9PiBjb252ZXJ0VG9QYXJhbU1hcChwKSksXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy5fcXVlcnlQYXJhbU1hcDtcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc25hcHNob3QgPyB0aGlzLnNuYXBzaG90LnRvU3RyaW5nKCkgOiBgRnV0dXJlKCR7dGhpcy5fZnV0dXJlU25hcHNob3R9KWA7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgUGFyYW1zSW5oZXJpdGFuY2VTdHJhdGVneSA9ICdlbXB0eU9ubHknIHwgJ2Fsd2F5cyc7XG5cbi8qKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCB0eXBlIEluaGVyaXRlZCA9IHtcbiAgcGFyYW1zOiBQYXJhbXM7XG4gIGRhdGE6IERhdGE7XG4gIHJlc29sdmU6IERhdGE7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGluaGVyaXRlZCBwYXJhbXMsIGRhdGEsIGFuZCByZXNvbHZlIGZvciBhIGdpdmVuIHJvdXRlLlxuICpcbiAqIEJ5IGRlZmF1bHQsIHdlIGRvIG5vdCBpbmhlcml0IHBhcmVudCBkYXRhIHVubGVzcyB0aGUgY3VycmVudCByb3V0ZSBpcyBwYXRoLWxlc3Mgb3IgdGhlIHBhcmVudFxuICogcm91dGUgaXMgY29tcG9uZW50LWxlc3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbmhlcml0ZWQoXG4gIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LFxuICBwYXJlbnQ6IEFjdGl2YXRlZFJvdXRlU25hcHNob3QgfCBudWxsLFxuICBwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5OiBQYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5ID0gJ2VtcHR5T25seScsXG4pOiBJbmhlcml0ZWQge1xuICBsZXQgaW5oZXJpdGVkOiBJbmhlcml0ZWQ7XG4gIGNvbnN0IHtyb3V0ZUNvbmZpZ30gPSByb3V0ZTtcbiAgaWYgKFxuICAgIHBhcmVudCAhPT0gbnVsbCAmJlxuICAgIChwYXJhbXNJbmhlcml0YW5jZVN0cmF0ZWd5ID09PSAnYWx3YXlzJyB8fFxuICAgICAgLy8gaW5oZXJpdCBwYXJlbnQgZGF0YSBpZiByb3V0ZSBpcyBlbXB0eSBwYXRoXG4gICAgICByb3V0ZUNvbmZpZz8ucGF0aCA9PT0gJycgfHxcbiAgICAgIC8vIGluaGVyaXQgcGFyZW50IGRhdGEgaWYgcGFyZW50IHdhcyBjb21wb25lbnRsZXNzXG4gICAgICAoIXBhcmVudC5jb21wb25lbnQgJiYgIXBhcmVudC5yb3V0ZUNvbmZpZz8ubG9hZENvbXBvbmVudCkpXG4gICkge1xuICAgIGluaGVyaXRlZCA9IHtcbiAgICAgIHBhcmFtczogey4uLnBhcmVudC5wYXJhbXMsIC4uLnJvdXRlLnBhcmFtc30sXG4gICAgICBkYXRhOiB7Li4ucGFyZW50LmRhdGEsIC4uLnJvdXRlLmRhdGF9LFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICAvLyBTbmFwc2hvdHMgYXJlIGNyZWF0ZWQgd2l0aCBkYXRhIGluaGVyaXRlZCBmcm9tIHBhcmVudCBhbmQgZ3VhcmRzIChpLmUuIGNhbkFjdGl2YXRlKSBjYW5cbiAgICAgICAgLy8gY2hhbmdlIGRhdGEgYmVjYXVzZSBpdCdzIG5vdCBmcm96ZW4uLi5cbiAgICAgICAgLy8gVGhpcyBmaXJzdCBsaW5lIGNvdWxkIGJlIGRlbGV0ZWQgY2hvc2UgdG8gYnJlYWsvZGlzYWxsb3cgbXV0YXRpbmcgdGhlIGBkYXRhYCBvYmplY3QgaW5cbiAgICAgICAgLy8gZ3VhcmRzLlxuICAgICAgICAvLyBOb3RlIHRoYXQgZGF0YSBmcm9tIHBhcmVudHMgc3RpbGwgb3ZlcnJpZGUgdGhpcyBtdXRhdGVkIGRhdGEgc28gYW55b25lIHJlbHlpbmcgb24gdGhpc1xuICAgICAgICAvLyBtaWdodCBiZSBzdXJwcmlzZWQgdGhhdCBpdCBkb2Vzbid0IHdvcmsgaWYgcGFyZW50IGRhdGEgaXMgaW5oZXJpdGVkIGJ1dCBvdGhlcndpc2UgZG9lcy5cbiAgICAgICAgLi4ucm91dGUuZGF0YSxcbiAgICAgICAgLy8gRW5zdXJlIGluaGVyaXRlZCByZXNvbHZlZCBkYXRhIG92ZXJyaWRlcyBpbmhlcml0ZWQgc3RhdGljIGRhdGFcbiAgICAgICAgLi4ucGFyZW50LmRhdGEsXG4gICAgICAgIC8vIHN0YXRpYyBkYXRhIGZyb20gdGhlIGN1cnJlbnQgcm91dGUgb3ZlcnJpZGVzIGFueSBpbmhlcml0ZWQgZGF0YVxuICAgICAgICAuLi5yb3V0ZUNvbmZpZz8uZGF0YSxcbiAgICAgICAgLy8gcmVzb2x2ZWQgZGF0YSBmcm9tIGN1cnJlbnQgcm91dGUgb3ZlcnJpZGVzIGV2ZXJ5dGhpbmdcbiAgICAgICAgLi4ucm91dGUuX3Jlc29sdmVkRGF0YSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBpbmhlcml0ZWQgPSB7XG4gICAgICBwYXJhbXM6IHsuLi5yb3V0ZS5wYXJhbXN9LFxuICAgICAgZGF0YTogey4uLnJvdXRlLmRhdGF9LFxuICAgICAgcmVzb2x2ZTogey4uLnJvdXRlLmRhdGEsIC4uLihyb3V0ZS5fcmVzb2x2ZWREYXRhID8/IHt9KX0sXG4gICAgfTtcbiAgfVxuXG4gIGlmIChyb3V0ZUNvbmZpZyAmJiBoYXNTdGF0aWNUaXRsZShyb3V0ZUNvbmZpZykpIHtcbiAgICBpbmhlcml0ZWQucmVzb2x2ZVtSb3V0ZVRpdGxlS2V5XSA9IHJvdXRlQ29uZmlnLnRpdGxlO1xuICB9XG4gIHJldHVybiBpbmhlcml0ZWQ7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQ29udGFpbnMgdGhlIGluZm9ybWF0aW9uIGFib3V0IGEgcm91dGUgYXNzb2NpYXRlZCB3aXRoIGEgY29tcG9uZW50IGxvYWRlZCBpbiBhblxuICogb3V0bGV0IGF0IGEgcGFydGljdWxhciBtb21lbnQgaW4gdGltZS4gQWN0aXZhdGVkUm91dGVTbmFwc2hvdCBjYW4gYWxzbyBiZSB1c2VkIHRvXG4gKiB0cmF2ZXJzZSB0aGUgcm91dGVyIHN0YXRlIHRyZWUuXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGluaXRpYWxpemVzIGEgY29tcG9uZW50IHdpdGggcm91dGUgaW5mb3JtYXRpb24gZXh0cmFjdGVkXG4gKiBmcm9tIHRoZSBzbmFwc2hvdCBvZiB0aGUgcm9vdCBub2RlIGF0IHRoZSB0aW1lIG9mIGNyZWF0aW9uLlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7dGVtcGxhdGVVcmw6Jy4vbXktY29tcG9uZW50Lmh0bWwnfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3Iocm91dGU6IEFjdGl2YXRlZFJvdXRlKSB7XG4gKiAgICAgY29uc3QgaWQ6IHN0cmluZyA9IHJvdXRlLnNuYXBzaG90LnBhcmFtcy5pZDtcbiAqICAgICBjb25zdCB1cmw6IHN0cmluZyA9IHJvdXRlLnNuYXBzaG90LnVybC5qb2luKCcnKTtcbiAqICAgICBjb25zdCB1c2VyID0gcm91dGUuc25hcHNob3QuZGF0YS51c2VyO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90IHtcbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uIHVzZWQgdG8gbWF0Y2ggdGhpcyByb3V0ZSAqKi9cbiAgcHVibGljIHJlYWRvbmx5IHJvdXRlQ29uZmlnOiBSb3V0ZSB8IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Jlc29sdmU6IFJlc29sdmVEYXRhO1xuICAvKiogQGludGVybmFsICovXG4gIF9yZXNvbHZlZERhdGE/OiBEYXRhO1xuICAvKiogQGludGVybmFsICovXG4gIF9yb3V0ZXJTdGF0ZSE6IFJvdXRlclN0YXRlU25hcHNob3Q7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcmFtTWFwPzogUGFyYW1NYXA7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3F1ZXJ5UGFyYW1NYXA/OiBQYXJhbU1hcDtcblxuICAvKiogVGhlIHJlc29sdmVkIHJvdXRlIHRpdGxlICovXG4gIGdldCB0aXRsZSgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIC8vIE5vdGU6IFRoaXMgX211c3RfIGJlIGEgZ2V0dGVyIGJlY2F1c2UgdGhlIGRhdGEgaXMgbXV0YXRlZCBpbiB0aGUgcmVzb2x2ZXJzLiBUaXRsZSB3aWxsIG5vdCBiZVxuICAgIC8vIGF2YWlsYWJsZSBhdCB0aGUgdGltZSBvZiBjbGFzcyBpbnN0YW50aWF0aW9uLlxuICAgIHJldHVybiB0aGlzLmRhdGE/LltSb3V0ZVRpdGxlS2V5XTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIFRoZSBVUkwgc2VnbWVudHMgbWF0Y2hlZCBieSB0aGlzIHJvdXRlICovXG4gICAgcHVibGljIHVybDogVXJsU2VnbWVudFtdLFxuICAgIC8qKlxuICAgICAqICBUaGUgbWF0cml4IHBhcmFtZXRlcnMgc2NvcGVkIHRvIHRoaXMgcm91dGUuXG4gICAgICpcbiAgICAgKiAgWW91IGNhbiBjb21wdXRlIGFsbCBwYXJhbXMgKG9yIGRhdGEpIGluIHRoZSByb3V0ZXIgc3RhdGUgb3IgdG8gZ2V0IHBhcmFtcyBvdXRzaWRlXG4gICAgICogIG9mIGFuIGFjdGl2YXRlZCBjb21wb25lbnQgYnkgdHJhdmVyc2luZyB0aGUgYFJvdXRlclN0YXRlYCB0cmVlIGFzIGluIHRoZSBmb2xsb3dpbmdcbiAgICAgKiAgZXhhbXBsZTpcbiAgICAgKiAgYGBgXG4gICAgICogIGNvbGxlY3RSb3V0ZVBhcmFtcyhyb3V0ZXI6IFJvdXRlcikge1xuICAgICAqICAgIGxldCBwYXJhbXMgPSB7fTtcbiAgICAgKiAgICBsZXQgc3RhY2s6IEFjdGl2YXRlZFJvdXRlU25hcHNob3RbXSA9IFtyb3V0ZXIucm91dGVyU3RhdGUuc25hcHNob3Qucm9vdF07XG4gICAgICogICAgd2hpbGUgKHN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgKiAgICAgIGNvbnN0IHJvdXRlID0gc3RhY2sucG9wKCkhO1xuICAgICAqICAgICAgcGFyYW1zID0gey4uLnBhcmFtcywgLi4ucm91dGUucGFyYW1zfTtcbiAgICAgKiAgICAgIHN0YWNrLnB1c2goLi4ucm91dGUuY2hpbGRyZW4pO1xuICAgICAqICAgIH1cbiAgICAgKiAgICByZXR1cm4gcGFyYW1zO1xuICAgICAqICB9XG4gICAgICogIGBgYFxuICAgICAqL1xuICAgIHB1YmxpYyBwYXJhbXM6IFBhcmFtcyxcbiAgICAvKiogVGhlIHF1ZXJ5IHBhcmFtZXRlcnMgc2hhcmVkIGJ5IGFsbCB0aGUgcm91dGVzICovXG4gICAgcHVibGljIHF1ZXJ5UGFyYW1zOiBQYXJhbXMsXG4gICAgLyoqIFRoZSBVUkwgZnJhZ21lbnQgc2hhcmVkIGJ5IGFsbCB0aGUgcm91dGVzICovXG4gICAgcHVibGljIGZyYWdtZW50OiBzdHJpbmcgfCBudWxsLFxuICAgIC8qKiBUaGUgc3RhdGljIGFuZCByZXNvbHZlZCBkYXRhIG9mIHRoaXMgcm91dGUgKi9cbiAgICBwdWJsaWMgZGF0YTogRGF0YSxcbiAgICAvKiogVGhlIG91dGxldCBuYW1lIG9mIHRoZSByb3V0ZSAqL1xuICAgIHB1YmxpYyBvdXRsZXQ6IHN0cmluZyxcbiAgICAvKiogVGhlIGNvbXBvbmVudCBvZiB0aGUgcm91dGUgKi9cbiAgICBwdWJsaWMgY29tcG9uZW50OiBUeXBlPGFueT4gfCBudWxsLFxuICAgIHJvdXRlQ29uZmlnOiBSb3V0ZSB8IG51bGwsXG4gICAgcmVzb2x2ZTogUmVzb2x2ZURhdGEsXG4gICkge1xuICAgIHRoaXMucm91dGVDb25maWcgPSByb3V0ZUNvbmZpZztcbiAgICB0aGlzLl9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgfVxuXG4gIC8qKiBUaGUgcm9vdCBvZiB0aGUgcm91dGVyIHN0YXRlICovXG4gIGdldCByb290KCk6IEFjdGl2YXRlZFJvdXRlU25hcHNob3Qge1xuICAgIHJldHVybiB0aGlzLl9yb3V0ZXJTdGF0ZS5yb290O1xuICB9XG5cbiAgLyoqIFRoZSBwYXJlbnQgb2YgdGhpcyByb3V0ZSBpbiB0aGUgcm91dGVyIHN0YXRlIHRyZWUgKi9cbiAgZ2V0IHBhcmVudCgpOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX3JvdXRlclN0YXRlLnBhcmVudCh0aGlzKTtcbiAgfVxuXG4gIC8qKiBUaGUgZmlyc3QgY2hpbGQgb2YgdGhpcyByb3V0ZSBpbiB0aGUgcm91dGVyIHN0YXRlIHRyZWUgKi9cbiAgZ2V0IGZpcnN0Q2hpbGQoKTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9yb3V0ZXJTdGF0ZS5maXJzdENoaWxkKHRoaXMpO1xuICB9XG5cbiAgLyoqIFRoZSBjaGlsZHJlbiBvZiB0aGlzIHJvdXRlIGluIHRoZSByb3V0ZXIgc3RhdGUgdHJlZSAqL1xuICBnZXQgY2hpbGRyZW4oKTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdFtdIHtcbiAgICByZXR1cm4gdGhpcy5fcm91dGVyU3RhdGUuY2hpbGRyZW4odGhpcyk7XG4gIH1cblxuICAvKiogVGhlIHBhdGggZnJvbSB0aGUgcm9vdCBvZiB0aGUgcm91dGVyIHN0YXRlIHRyZWUgdG8gdGhpcyByb3V0ZSAqL1xuICBnZXQgcGF0aEZyb21Sb290KCk6IEFjdGl2YXRlZFJvdXRlU25hcHNob3RbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3JvdXRlclN0YXRlLnBhdGhGcm9tUm9vdCh0aGlzKTtcbiAgfVxuXG4gIGdldCBwYXJhbU1hcCgpOiBQYXJhbU1hcCB7XG4gICAgdGhpcy5fcGFyYW1NYXAgPz89IGNvbnZlcnRUb1BhcmFtTWFwKHRoaXMucGFyYW1zKTtcbiAgICByZXR1cm4gdGhpcy5fcGFyYW1NYXA7XG4gIH1cblxuICBnZXQgcXVlcnlQYXJhbU1hcCgpOiBQYXJhbU1hcCB7XG4gICAgdGhpcy5fcXVlcnlQYXJhbU1hcCA/Pz0gY29udmVydFRvUGFyYW1NYXAodGhpcy5xdWVyeVBhcmFtcyk7XG4gICAgcmV0dXJuIHRoaXMuX3F1ZXJ5UGFyYW1NYXA7XG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IHVybCA9IHRoaXMudXJsLm1hcCgoc2VnbWVudCkgPT4gc2VnbWVudC50b1N0cmluZygpKS5qb2luKCcvJyk7XG4gICAgY29uc3QgbWF0Y2hlZCA9IHRoaXMucm91dGVDb25maWcgPyB0aGlzLnJvdXRlQ29uZmlnLnBhdGggOiAnJztcbiAgICByZXR1cm4gYFJvdXRlKHVybDonJHt1cmx9JywgcGF0aDonJHttYXRjaGVkfScpYDtcbiAgfVxufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFJlcHJlc2VudHMgdGhlIHN0YXRlIG9mIHRoZSByb3V0ZXIgYXQgYSBtb21lbnQgaW4gdGltZS5cbiAqXG4gKiBUaGlzIGlzIGEgdHJlZSBvZiBhY3RpdmF0ZWQgcm91dGUgc25hcHNob3RzLiBFdmVyeSBub2RlIGluIHRoaXMgdHJlZSBrbm93cyBhYm91dFxuICogdGhlIFwiY29uc3VtZWRcIiBVUkwgc2VnbWVudHMsIHRoZSBleHRyYWN0ZWQgcGFyYW1ldGVycywgYW5kIHRoZSByZXNvbHZlZCBkYXRhLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBzaG93cyBob3cgYSBjb21wb25lbnQgaXMgaW5pdGlhbGl6ZWQgd2l0aCBpbmZvcm1hdGlvblxuICogZnJvbSB0aGUgc25hcHNob3Qgb2YgdGhlIHJvb3Qgbm9kZSdzIHN0YXRlIGF0IHRoZSB0aW1lIG9mIGNyZWF0aW9uLlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7dGVtcGxhdGVVcmw6J3RlbXBsYXRlLmh0bWwnfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3Iocm91dGVyOiBSb3V0ZXIpIHtcbiAqICAgICBjb25zdCBzdGF0ZTogUm91dGVyU3RhdGUgPSByb3V0ZXIucm91dGVyU3RhdGU7XG4gKiAgICAgY29uc3Qgc25hcHNob3Q6IFJvdXRlclN0YXRlU25hcHNob3QgPSBzdGF0ZS5zbmFwc2hvdDtcbiAqICAgICBjb25zdCByb290OiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90ID0gc25hcHNob3Qucm9vdDtcbiAqICAgICBjb25zdCBjaGlsZCA9IHJvb3QuZmlyc3RDaGlsZDtcbiAqICAgICBjb25zdCBpZDogT2JzZXJ2YWJsZTxzdHJpbmc+ID0gY2hpbGQucGFyYW1zLm1hcChwID0+IHAuaWQpO1xuICogICAgIC8vLi4uXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlclN0YXRlU25hcHNob3QgZXh0ZW5kcyBUcmVlPEFjdGl2YXRlZFJvdXRlU25hcHNob3Q+IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogVGhlIHVybCBmcm9tIHdoaWNoIHRoaXMgc25hcHNob3Qgd2FzIGNyZWF0ZWQgKi9cbiAgICBwdWJsaWMgdXJsOiBzdHJpbmcsXG4gICAgcm9vdDogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4sXG4gICkge1xuICAgIHN1cGVyKHJvb3QpO1xuICAgIHNldFJvdXRlclN0YXRlKDxSb3V0ZXJTdGF0ZVNuYXBzaG90PnRoaXMsIHJvb3QpO1xuICB9XG5cbiAgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gc2VyaWFsaXplTm9kZSh0aGlzLl9yb290KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRSb3V0ZXJTdGF0ZTxVLCBUIGV4dGVuZHMge19yb3V0ZXJTdGF0ZTogVX0+KHN0YXRlOiBVLCBub2RlOiBUcmVlTm9kZTxUPik6IHZvaWQge1xuICBub2RlLnZhbHVlLl9yb3V0ZXJTdGF0ZSA9IHN0YXRlO1xuICBub2RlLmNoaWxkcmVuLmZvckVhY2goKGMpID0+IHNldFJvdXRlclN0YXRlKHN0YXRlLCBjKSk7XG59XG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZU5vZGUobm9kZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGVTbmFwc2hvdD4pOiBzdHJpbmcge1xuICBjb25zdCBjID0gbm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwID8gYCB7ICR7bm9kZS5jaGlsZHJlbi5tYXAoc2VyaWFsaXplTm9kZSkuam9pbignLCAnKX0gfSBgIDogJyc7XG4gIHJldHVybiBgJHtub2RlLnZhbHVlfSR7Y31gO1xufVxuXG4vKipcbiAqIFRoZSBleHBlY3RhdGlvbiBpcyB0aGF0IHRoZSBhY3RpdmF0ZSByb3V0ZSBpcyBjcmVhdGVkIHdpdGggdGhlIHJpZ2h0IHNldCBvZiBwYXJhbWV0ZXJzLlxuICogU28gd2UgcHVzaCBuZXcgdmFsdWVzIGludG8gdGhlIG9ic2VydmFibGVzIG9ubHkgd2hlbiB0aGV5IGFyZSBub3QgdGhlIGluaXRpYWwgdmFsdWVzLlxuICogQW5kIHdlIGRldGVjdCB0aGF0IGJ5IGNoZWNraW5nIGlmIHRoZSBzbmFwc2hvdCBmaWVsZCBpcyBzZXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZHZhbmNlQWN0aXZhdGVkUm91dGUocm91dGU6IEFjdGl2YXRlZFJvdXRlKTogdm9pZCB7XG4gIGlmIChyb3V0ZS5zbmFwc2hvdCkge1xuICAgIGNvbnN0IGN1cnJlbnRTbmFwc2hvdCA9IHJvdXRlLnNuYXBzaG90O1xuICAgIGNvbnN0IG5leHRTbmFwc2hvdCA9IHJvdXRlLl9mdXR1cmVTbmFwc2hvdDtcbiAgICByb3V0ZS5zbmFwc2hvdCA9IG5leHRTbmFwc2hvdDtcbiAgICBpZiAoIXNoYWxsb3dFcXVhbChjdXJyZW50U25hcHNob3QucXVlcnlQYXJhbXMsIG5leHRTbmFwc2hvdC5xdWVyeVBhcmFtcykpIHtcbiAgICAgIHJvdXRlLnF1ZXJ5UGFyYW1zU3ViamVjdC5uZXh0KG5leHRTbmFwc2hvdC5xdWVyeVBhcmFtcyk7XG4gICAgfVxuICAgIGlmIChjdXJyZW50U25hcHNob3QuZnJhZ21lbnQgIT09IG5leHRTbmFwc2hvdC5mcmFnbWVudCkge1xuICAgICAgcm91dGUuZnJhZ21lbnRTdWJqZWN0Lm5leHQobmV4dFNuYXBzaG90LmZyYWdtZW50KTtcbiAgICB9XG4gICAgaWYgKCFzaGFsbG93RXF1YWwoY3VycmVudFNuYXBzaG90LnBhcmFtcywgbmV4dFNuYXBzaG90LnBhcmFtcykpIHtcbiAgICAgIHJvdXRlLnBhcmFtc1N1YmplY3QubmV4dChuZXh0U25hcHNob3QucGFyYW1zKTtcbiAgICB9XG4gICAgaWYgKCFzaGFsbG93RXF1YWxBcnJheXMoY3VycmVudFNuYXBzaG90LnVybCwgbmV4dFNuYXBzaG90LnVybCkpIHtcbiAgICAgIHJvdXRlLnVybFN1YmplY3QubmV4dChuZXh0U25hcHNob3QudXJsKTtcbiAgICB9XG4gICAgaWYgKCFzaGFsbG93RXF1YWwoY3VycmVudFNuYXBzaG90LmRhdGEsIG5leHRTbmFwc2hvdC5kYXRhKSkge1xuICAgICAgcm91dGUuZGF0YVN1YmplY3QubmV4dChuZXh0U25hcHNob3QuZGF0YSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJvdXRlLnNuYXBzaG90ID0gcm91dGUuX2Z1dHVyZVNuYXBzaG90O1xuXG4gICAgLy8gdGhpcyBpcyBmb3IgcmVzb2x2ZWQgZGF0YVxuICAgIHJvdXRlLmRhdGFTdWJqZWN0Lm5leHQocm91dGUuX2Z1dHVyZVNuYXBzaG90LmRhdGEpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbFBhcmFtc0FuZFVybFNlZ21lbnRzKFxuICBhOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LFxuICBiOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LFxuKTogYm9vbGVhbiB7XG4gIGNvbnN0IGVxdWFsVXJsUGFyYW1zID0gc2hhbGxvd0VxdWFsKGEucGFyYW1zLCBiLnBhcmFtcykgJiYgZXF1YWxTZWdtZW50cyhhLnVybCwgYi51cmwpO1xuICBjb25zdCBwYXJlbnRzTWlzbWF0Y2ggPSAhYS5wYXJlbnQgIT09ICFiLnBhcmVudDtcblxuICByZXR1cm4gKFxuICAgIGVxdWFsVXJsUGFyYW1zICYmXG4gICAgIXBhcmVudHNNaXNtYXRjaCAmJlxuICAgICghYS5wYXJlbnQgfHwgZXF1YWxQYXJhbXNBbmRVcmxTZWdtZW50cyhhLnBhcmVudCwgYi5wYXJlbnQhKSlcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc1N0YXRpY1RpdGxlKGNvbmZpZzogUm91dGUpIHtcbiAgcmV0dXJuIHR5cGVvZiBjb25maWcudGl0bGUgPT09ICdzdHJpbmcnIHx8IGNvbmZpZy50aXRsZSA9PT0gbnVsbDtcbn1cbiJdfQ==