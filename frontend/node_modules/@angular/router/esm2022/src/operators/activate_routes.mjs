/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { map } from 'rxjs/operators';
import { ActivationEnd, ChildActivationEnd } from '../events';
import { advanceActivatedRoute } from '../router_state';
import { getClosestRouteInjector } from '../utils/config';
import { nodeChildrenAsMap } from '../utils/tree';
let warnedAboutUnsupportedInputBinding = false;
export const activateRoutes = (rootContexts, routeReuseStrategy, forwardEvent, inputBindingEnabled) => map((t) => {
    new ActivateRoutes(routeReuseStrategy, t.targetRouterState, t.currentRouterState, forwardEvent, inputBindingEnabled).activate(rootContexts);
    return t;
});
export class ActivateRoutes {
    constructor(routeReuseStrategy, futureState, currState, forwardEvent, inputBindingEnabled) {
        this.routeReuseStrategy = routeReuseStrategy;
        this.futureState = futureState;
        this.currState = currState;
        this.forwardEvent = forwardEvent;
        this.inputBindingEnabled = inputBindingEnabled;
    }
    activate(parentContexts) {
        const futureRoot = this.futureState._root;
        const currRoot = this.currState ? this.currState._root : null;
        this.deactivateChildRoutes(futureRoot, currRoot, parentContexts);
        advanceActivatedRoute(this.futureState.root);
        this.activateChildRoutes(futureRoot, currRoot, parentContexts);
    }
    // De-activate the child route that are not re-used for the future state
    deactivateChildRoutes(futureNode, currNode, contexts) {
        const children = nodeChildrenAsMap(currNode);
        // Recurse on the routes active in the future state to de-activate deeper children
        futureNode.children.forEach((futureChild) => {
            const childOutletName = futureChild.value.outlet;
            this.deactivateRoutes(futureChild, children[childOutletName], contexts);
            delete children[childOutletName];
        });
        // De-activate the routes that will not be re-used
        Object.values(children).forEach((v) => {
            this.deactivateRouteAndItsChildren(v, contexts);
        });
    }
    deactivateRoutes(futureNode, currNode, parentContext) {
        const future = futureNode.value;
        const curr = currNode ? currNode.value : null;
        if (future === curr) {
            // Reusing the node, check to see if the children need to be de-activated
            if (future.component) {
                // If we have a normal route, we need to go through an outlet.
                const context = parentContext.getContext(future.outlet);
                if (context) {
                    this.deactivateChildRoutes(futureNode, currNode, context.children);
                }
            }
            else {
                // if we have a componentless route, we recurse but keep the same outlet map.
                this.deactivateChildRoutes(futureNode, currNode, parentContext);
            }
        }
        else {
            if (curr) {
                // Deactivate the current route which will not be re-used
                this.deactivateRouteAndItsChildren(currNode, parentContext);
            }
        }
    }
    deactivateRouteAndItsChildren(route, parentContexts) {
        // If there is no component, the Route is never attached to an outlet (because there is no
        // component to attach).
        if (route.value.component && this.routeReuseStrategy.shouldDetach(route.value.snapshot)) {
            this.detachAndStoreRouteSubtree(route, parentContexts);
        }
        else {
            this.deactivateRouteAndOutlet(route, parentContexts);
        }
    }
    detachAndStoreRouteSubtree(route, parentContexts) {
        const context = parentContexts.getContext(route.value.outlet);
        const contexts = context && route.value.component ? context.children : parentContexts;
        const children = nodeChildrenAsMap(route);
        for (const treeNode of Object.values(children)) {
            this.deactivateRouteAndItsChildren(treeNode, contexts);
        }
        if (context && context.outlet) {
            const componentRef = context.outlet.detach();
            const contexts = context.children.onOutletDeactivated();
            this.routeReuseStrategy.store(route.value.snapshot, { componentRef, route, contexts });
        }
    }
    deactivateRouteAndOutlet(route, parentContexts) {
        const context = parentContexts.getContext(route.value.outlet);
        // The context could be `null` if we are on a componentless route but there may still be
        // children that need deactivating.
        const contexts = context && route.value.component ? context.children : parentContexts;
        const children = nodeChildrenAsMap(route);
        for (const treeNode of Object.values(children)) {
            this.deactivateRouteAndItsChildren(treeNode, contexts);
        }
        if (context) {
            if (context.outlet) {
                // Destroy the component
                context.outlet.deactivate();
                // Destroy the contexts for all the outlets that were in the component
                context.children.onOutletDeactivated();
            }
            // Clear the information about the attached component on the context but keep the reference to
            // the outlet. Clear even if outlet was not yet activated to avoid activating later with old
            // info
            context.attachRef = null;
            context.route = null;
        }
    }
    activateChildRoutes(futureNode, currNode, contexts) {
        const children = nodeChildrenAsMap(currNode);
        futureNode.children.forEach((c) => {
            this.activateRoutes(c, children[c.value.outlet], contexts);
            this.forwardEvent(new ActivationEnd(c.value.snapshot));
        });
        if (futureNode.children.length) {
            this.forwardEvent(new ChildActivationEnd(futureNode.value.snapshot));
        }
    }
    activateRoutes(futureNode, currNode, parentContexts) {
        const future = futureNode.value;
        const curr = currNode ? currNode.value : null;
        advanceActivatedRoute(future);
        // reusing the node
        if (future === curr) {
            if (future.component) {
                // If we have a normal route, we need to go through an outlet.
                const context = parentContexts.getOrCreateContext(future.outlet);
                this.activateChildRoutes(futureNode, currNode, context.children);
            }
            else {
                // if we have a componentless route, we recurse but keep the same outlet map.
                this.activateChildRoutes(futureNode, currNode, parentContexts);
            }
        }
        else {
            if (future.component) {
                // if we have a normal route, we need to place the component into the outlet and recurse.
                const context = parentContexts.getOrCreateContext(future.outlet);
                if (this.routeReuseStrategy.shouldAttach(future.snapshot)) {
                    const stored = (this.routeReuseStrategy.retrieve(future.snapshot));
                    this.routeReuseStrategy.store(future.snapshot, null);
                    context.children.onOutletReAttached(stored.contexts);
                    context.attachRef = stored.componentRef;
                    context.route = stored.route.value;
                    if (context.outlet) {
                        // Attach right away when the outlet has already been instantiated
                        // Otherwise attach from `RouterOutlet.ngOnInit` when it is instantiated
                        context.outlet.attach(stored.componentRef, stored.route.value);
                    }
                    advanceActivatedRoute(stored.route.value);
                    this.activateChildRoutes(futureNode, null, context.children);
                }
                else {
                    const injector = getClosestRouteInjector(future.snapshot);
                    context.attachRef = null;
                    context.route = future;
                    context.injector = injector;
                    if (context.outlet) {
                        // Activate the outlet when it has already been instantiated
                        // Otherwise it will get activated from its `ngOnInit` when instantiated
                        context.outlet.activateWith(future, context.injector);
                    }
                    this.activateChildRoutes(futureNode, null, context.children);
                }
            }
            else {
                // if we have a componentless route, we recurse but keep the same outlet map.
                this.activateChildRoutes(futureNode, null, parentContexts);
            }
        }
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            const context = parentContexts.getOrCreateContext(future.outlet);
            const outlet = context.outlet;
            if (outlet &&
                this.inputBindingEnabled &&
                !outlet.supportsBindingToComponentInputs &&
                !warnedAboutUnsupportedInputBinding) {
                console.warn(`'withComponentInputBinding' feature is enabled but ` +
                    `this application is using an outlet that may not support binding to component inputs.`);
                warnedAboutUnsupportedInputBinding = true;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZhdGVfcm91dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9vcGVyYXRvcnMvYWN0aXZhdGVfcm91dGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVuQyxPQUFPLEVBQUMsYUFBYSxFQUFFLGtCQUFrQixFQUFRLE1BQU0sV0FBVyxDQUFDO0FBSW5FLE9BQU8sRUFBaUIscUJBQXFCLEVBQWMsTUFBTSxpQkFBaUIsQ0FBQztBQUNuRixPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN4RCxPQUFPLEVBQUMsaUJBQWlCLEVBQVcsTUFBTSxlQUFlLENBQUM7QUFFMUQsSUFBSSxrQ0FBa0MsR0FBRyxLQUFLLENBQUM7QUFFL0MsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLENBQzVCLFlBQW9DLEVBQ3BDLGtCQUFzQyxFQUN0QyxZQUFrQyxFQUNsQyxtQkFBNEIsRUFDb0IsRUFBRSxDQUNsRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtJQUNSLElBQUksY0FBYyxDQUNoQixrQkFBa0IsRUFDbEIsQ0FBQyxDQUFDLGlCQUFrQixFQUNwQixDQUFDLENBQUMsa0JBQWtCLEVBQ3BCLFlBQVksRUFDWixtQkFBbUIsQ0FDcEIsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDekIsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDLENBQUMsQ0FBQztBQUVMLE1BQU0sT0FBTyxjQUFjO0lBQ3pCLFlBQ1Usa0JBQXNDLEVBQ3RDLFdBQXdCLEVBQ3hCLFNBQXNCLEVBQ3RCLFlBQWtDLEVBQ2xDLG1CQUE0QjtRQUo1Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQ3RDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3hCLGNBQVMs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cHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge01vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge21hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0FjdGl2YXRpb25FbmQsIENoaWxkQWN0aXZhdGlvbkVuZCwgRXZlbnR9IGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQge05hdmlnYXRpb25UcmFuc2l0aW9ufSBmcm9tICcuLi9uYXZpZ2F0aW9uX3RyYW5zaXRpb24nO1xuaW1wb3J0IHtEZXRhY2hlZFJvdXRlSGFuZGxlSW50ZXJuYWwsIFJvdXRlUmV1c2VTdHJhdGVneX0gZnJvbSAnLi4vcm91dGVfcmV1c2Vfc3RyYXRlZ3knO1xuaW1wb3J0IHtDaGlsZHJlbk91dGxldENvbnRleHRzfSBmcm9tICcuLi9yb3V0ZXJfb3V0bGV0X2NvbnRleHQnO1xuaW1wb3J0IHtBY3RpdmF0ZWRSb3V0ZSwgYWR2YW5jZUFjdGl2YXRlZFJvdXRlLCBSb3V0ZXJTdGF0ZX0gZnJvbSAnLi4vcm91dGVyX3N0YXRlJztcbmltcG9ydCB7Z2V0Q2xvc2VzdFJvdXRlSW5qZWN0b3J9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge25vZGVDaGlsZHJlbkFzTWFwLCBUcmVlTm9kZX0gZnJvbSAnLi4vdXRpbHMvdHJlZSc7XG5cbmxldCB3YXJuZWRBYm91dFVuc3VwcG9ydGVkSW5wdXRCaW5kaW5nID0gZmFsc2U7XG5cbmV4cG9ydCBjb25zdCBhY3RpdmF0ZVJvdXRlcyA9IChcbiAgcm9vdENvbnRleHRzOiBDaGlsZHJlbk91dGxldENvbnRleHRzLFxuICByb3V0ZVJldXNlU3RyYXRlZ3k6IFJvdXRlUmV1c2VTdHJhdGVneSxcbiAgZm9yd2FyZEV2ZW50OiAoZXZ0OiBFdmVudCkgPT4gdm9pZCxcbiAgaW5wdXRCaW5kaW5nRW5hYmxlZDogYm9vbGVhbixcbik6IE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxOYXZpZ2F0aW9uVHJhbnNpdGlvbj4gPT5cbiAgbWFwKCh0KSA9PiB7XG4gICAgbmV3IEFjdGl2YXRlUm91dGVzKFxuICAgICAgcm91dGVSZXVzZVN0cmF0ZWd5LFxuICAgICAgdC50YXJnZXRSb3V0ZXJTdGF0ZSEsXG4gICAgICB0LmN1cnJlbnRSb3V0ZXJTdGF0ZSxcbiAgICAgIGZvcndhcmRFdmVudCxcbiAgICAgIGlucHV0QmluZGluZ0VuYWJsZWQsXG4gICAgKS5hY3RpdmF0ZShyb290Q29udGV4dHMpO1xuICAgIHJldHVybiB0O1xuICB9KTtcblxuZXhwb3J0IGNsYXNzIEFjdGl2YXRlUm91dGVzIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByb3V0ZVJldXNlU3RyYXRlZ3k6IFJvdXRlUmV1c2VTdHJhdGVneSxcbiAgICBwcml2YXRlIGZ1dHVyZVN0YXRlOiBSb3V0ZXJTdGF0ZSxcbiAgICBwcml2YXRlIGN1cnJTdGF0ZTogUm91dGVyU3RhdGUsXG4gICAgcHJpdmF0ZSBmb3J3YXJkRXZlbnQ6IChldnQ6IEV2ZW50KSA9PiB2b2lkLFxuICAgIHByaXZhdGUgaW5wdXRCaW5kaW5nRW5hYmxlZDogYm9vbGVhbixcbiAgKSB7fVxuXG4gIGFjdGl2YXRlKHBhcmVudENvbnRleHRzOiBDaGlsZHJlbk91dGxldENvbnRleHRzKTogdm9pZCB7XG4gICAgY29uc3QgZnV0dXJlUm9vdCA9IHRoaXMuZnV0dXJlU3RhdGUuX3Jvb3Q7XG4gICAgY29uc3QgY3VyclJvb3QgPSB0aGlzLmN1cnJTdGF0ZSA/IHRoaXMuY3VyclN0YXRlLl9yb290IDogbnVsbDtcblxuICAgIHRoaXMuZGVhY3RpdmF0ZUNoaWxkUm91dGVzKGZ1dHVyZVJvb3QsIGN1cnJSb290LCBwYXJlbnRDb250ZXh0cyk7XG4gICAgYWR2YW5jZUFjdGl2YXRlZFJvdXRlKHRoaXMuZnV0dXJlU3RhdGUucm9vdCk7XG4gICAgdGhpcy5hY3RpdmF0ZUNoaWxkUm91dGVzKGZ1dHVyZVJvb3QsIGN1cnJSb290LCBwYXJlbnRDb250ZXh0cyk7XG4gIH1cblxuICAvLyBEZS1hY3RpdmF0ZSB0aGUgY2hpbGQgcm91dGUgdGhhdCBhcmUgbm90IHJlLXVzZWQgZm9yIHRoZSBmdXR1cmUgc3RhdGVcbiAgcHJpdmF0ZSBkZWFjdGl2YXRlQ2hpbGRSb3V0ZXMoXG4gICAgZnV0dXJlTm9kZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+LFxuICAgIGN1cnJOb2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZT4gfCBudWxsLFxuICAgIGNvbnRleHRzOiBDaGlsZHJlbk91dGxldENvbnRleHRzLFxuICApOiB2b2lkIHtcbiAgICBjb25zdCBjaGlsZHJlbjoge1tvdXRsZXROYW1lOiBzdHJpbmddOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZT59ID0gbm9kZUNoaWxkcmVuQXNNYXAoY3Vyck5vZGUpO1xuXG4gICAgLy8gUmVjdXJzZSBvbiB0aGUgcm91dGVzIGFjdGl2ZSBpbiB0aGUgZnV0dXJlIHN0YXRlIHRvIGRlLWFjdGl2YXRlIGRlZXBlciBjaGlsZHJlblxuICAgIGZ1dHVyZU5vZGUuY2hpbGRyZW4uZm9yRWFjaCgoZnV0dXJlQ2hpbGQpID0+IHtcbiAgICAgIGNvbnN0IGNoaWxkT3V0bGV0TmFtZSA9IGZ1dHVyZUNoaWxkLnZhbHVlLm91dGxldDtcbiAgICAgIHRoaXMuZGVhY3RpdmF0ZVJvdXRlcyhmdXR1cmVDaGlsZCwgY2hpbGRyZW5bY2hpbGRPdXRsZXROYW1lXSwgY29udGV4dHMpO1xuICAgICAgZGVsZXRlIGNoaWxkcmVuW2NoaWxkT3V0bGV0TmFtZV07XG4gICAgfSk7XG5cbiAgICAvLyBEZS1hY3RpdmF0ZSB0aGUgcm91dGVzIHRoYXQgd2lsbCBub3QgYmUgcmUtdXNlZFxuICAgIE9iamVjdC52YWx1ZXMoY2hpbGRyZW4pLmZvckVhY2goKHY6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlPikgPT4ge1xuICAgICAgdGhpcy5kZWFjdGl2YXRlUm91dGVBbmRJdHNDaGlsZHJlbih2LCBjb250ZXh0cyk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGRlYWN0aXZhdGVSb3V0ZXMoXG4gICAgZnV0dXJlTm9kZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+LFxuICAgIGN1cnJOb2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZT4sXG4gICAgcGFyZW50Q29udGV4dDogQ2hpbGRyZW5PdXRsZXRDb250ZXh0cyxcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgZnV0dXJlID0gZnV0dXJlTm9kZS52YWx1ZTtcbiAgICBjb25zdCBjdXJyID0gY3Vyck5vZGUgPyBjdXJyTm9kZS52YWx1ZSA6IG51bGw7XG5cbiAgICBpZiAoZnV0dXJlID09PSBjdXJyKSB7XG4gICAgICAvLyBSZXVzaW5nIHRoZSBub2RlLCBjaGVjayB0byBzZWUgaWYgdGhlIGNoaWxkcmVuIG5lZWQgdG8gYmUgZGUtYWN0aXZhdGVkXG4gICAgICBpZiAoZnV0dXJlLmNvbXBvbmVudCkge1xuICAgICAgICAvLyBJZiB3ZSBoYXZlIGEgbm9ybWFsIHJvdXRlLCB3ZSBuZWVkIHRvIGdvIHRocm91Z2ggYW4gb3V0bGV0LlxuICAgICAgICBjb25zdCBjb250ZXh0ID0gcGFyZW50Q29udGV4dC5nZXRDb250ZXh0KGZ1dHVyZS5vdXRsZXQpO1xuICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgIHRoaXMuZGVhY3RpdmF0ZUNoaWxkUm91dGVzKGZ1dHVyZU5vZGUsIGN1cnJOb2RlLCBjb250ZXh0LmNoaWxkcmVuKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIGNvbXBvbmVudGxlc3Mgcm91dGUsIHdlIHJlY3Vyc2UgYnV0IGtlZXAgdGhlIHNhbWUgb3V0bGV0IG1hcC5cbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlQ2hpbGRSb3V0ZXMoZnV0dXJlTm9kZSwgY3Vyck5vZGUsIHBhcmVudENvbnRleHQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY3Vycikge1xuICAgICAgICAvLyBEZWFjdGl2YXRlIHRoZSBjdXJyZW50IHJvdXRlIHdoaWNoIHdpbGwgbm90IGJlIHJlLXVzZWRcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlUm91dGVBbmRJdHNDaGlsZHJlbihjdXJyTm9kZSwgcGFyZW50Q29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkZWFjdGl2YXRlUm91dGVBbmRJdHNDaGlsZHJlbihcbiAgICByb3V0ZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+LFxuICAgIHBhcmVudENvbnRleHRzOiBDaGlsZHJlbk91dGxldENvbnRleHRzLFxuICApOiB2b2lkIHtcbiAgICAvLyBJZiB0aGVyZSBpcyBubyBjb21wb25lbnQsIHRoZSBSb3V0ZSBpcyBuZXZlciBhdHRhY2hlZCB0byBhbiBvdXRsZXQgKGJlY2F1c2UgdGhlcmUgaXMgbm9cbiAgICAvLyBjb21wb25lbnQgdG8gYXR0YWNoKS5cbiAgICBpZiAocm91dGUudmFsdWUuY29tcG9uZW50ICYmIHRoaXMucm91dGVSZXVzZVN0cmF0ZWd5LnNob3VsZERldGFjaChyb3V0ZS52YWx1ZS5zbmFwc2hvdCkpIHtcbiAgICAgIHRoaXMuZGV0YWNoQW5kU3RvcmVSb3V0ZVN1YnRyZWUocm91dGUsIHBhcmVudENvbnRleHRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZWFjdGl2YXRlUm91dGVBbmRPdXRsZXQocm91dGUsIHBhcmVudENvbnRleHRzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGRldGFjaEFuZFN0b3JlUm91dGVTdWJ0cmVlKFxuICAgIHJvdXRlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZT4sXG4gICAgcGFyZW50Q29udGV4dHM6IENoaWxkcmVuT3V0bGV0Q29udGV4dHMsXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRleHQgPSBwYXJlbnRDb250ZXh0cy5nZXRDb250ZXh0KHJvdXRlLnZhbHVlLm91dGxldCk7XG4gICAgY29uc3QgY29udGV4dHMgPSBjb250ZXh0ICYmIHJvdXRlLnZhbHVlLmNvbXBvbmVudCA/IGNvbnRleHQuY2hpbGRyZW4gOiBwYXJlbnRDb250ZXh0cztcbiAgICBjb25zdCBjaGlsZHJlbjoge1tvdXRsZXROYW1lOiBzdHJpbmddOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZT59ID0gbm9kZUNoaWxkcmVuQXNNYXAocm91dGUpO1xuXG4gICAgZm9yIChjb25zdCB0cmVlTm9kZSBvZiBPYmplY3QudmFsdWVzKGNoaWxkcmVuKSkge1xuICAgICAgdGhpcy5kZWFjdGl2YXRlUm91dGVBbmRJdHNDaGlsZHJlbih0cmVlTm9kZSwgY29udGV4dHMpO1xuICAgIH1cblxuICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQub3V0bGV0KSB7XG4gICAgICBjb25zdCBjb21wb25lbnRSZWYgPSBjb250ZXh0Lm91dGxldC5kZXRhY2goKTtcbiAgICAgIGNvbnN0IGNvbnRleHRzID0gY29udGV4dC5jaGlsZHJlbi5vbk91dGxldERlYWN0aXZhdGVkKCk7XG4gICAgICB0aGlzLnJvdXRlUmV1c2VTdHJhdGVneS5zdG9yZShyb3V0ZS52YWx1ZS5zbmFwc2hvdCwge2NvbXBvbmVudFJlZiwgcm91dGUsIGNvbnRleHRzfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkZWFjdGl2YXRlUm91dGVBbmRPdXRsZXQoXG4gICAgcm91dGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlPixcbiAgICBwYXJlbnRDb250ZXh0czogQ2hpbGRyZW5PdXRsZXRDb250ZXh0cyxcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgY29udGV4dCA9IHBhcmVudENvbnRleHRzLmdldENvbnRleHQocm91dGUudmFsdWUub3V0bGV0KTtcbiAgICAvLyBUaGUgY29udGV4dCBjb3VsZCBiZSBgbnVsbGAgaWYgd2UgYXJlIG9uIGEgY29tcG9uZW50bGVzcyByb3V0ZSBidXQgdGhlcmUgbWF5IHN0aWxsIGJlXG4gICAgLy8gY2hpbGRyZW4gdGhhdCBuZWVkIGRlYWN0aXZhdGluZy5cbiAgICBjb25zdCBjb250ZXh0cyA9IGNvbnRleHQgJiYgcm91dGUudmFsdWUuY29tcG9uZW50ID8gY29udGV4dC5jaGlsZHJlbiA6IHBhcmVudENvbnRleHRzO1xuICAgIGNvbnN0IGNoaWxkcmVuOiB7W291dGxldE5hbWU6IHN0cmluZ106IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlPn0gPSBub2RlQ2hpbGRyZW5Bc01hcChyb3V0ZSk7XG5cbiAgICBmb3IgKGNvbnN0IHRyZWVOb2RlIG9mIE9iamVjdC52YWx1ZXMoY2hpbGRyZW4pKSB7XG4gICAgICB0aGlzLmRlYWN0aXZhdGVSb3V0ZUFuZEl0c0NoaWxkcmVuKHRyZWVOb2RlLCBjb250ZXh0cyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgIGlmIChjb250ZXh0Lm91dGxldCkge1xuICAgICAgICAvLyBEZXN0cm95IHRoZSBjb21wb25lbnRcbiAgICAgICAgY29udGV4dC5vdXRsZXQuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAvLyBEZXN0cm95IHRoZSBjb250ZXh0cyBmb3IgYWxsIHRoZSBvdXRsZXRzIHRoYXQgd2VyZSBpbiB0aGUgY29tcG9uZW50XG4gICAgICAgIGNvbnRleHQuY2hpbGRyZW4ub25PdXRsZXREZWFjdGl2YXRlZCgpO1xuICAgICAgfVxuICAgICAgLy8gQ2xlYXIgdGhlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBhdHRhY2hlZCBjb21wb25lbnQgb24gdGhlIGNvbnRleHQgYnV0IGtlZXAgdGhlIHJlZmVyZW5jZSB0b1xuICAgICAgLy8gdGhlIG91dGxldC4gQ2xlYXIgZXZlbiBpZiBvdXRsZXQgd2FzIG5vdCB5ZXQgYWN0aXZhdGVkIHRvIGF2b2lkIGFjdGl2YXRpbmcgbGF0ZXIgd2l0aCBvbGRcbiAgICAgIC8vIGluZm9cbiAgICAgIGNvbnRleHQuYXR0YWNoUmVmID0gbnVsbDtcbiAgICAgIGNvbnRleHQucm91dGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWN0aXZhdGVDaGlsZFJvdXRlcyhcbiAgICBmdXR1cmVOb2RlOiBUcmVlTm9kZTxBY3RpdmF0ZWRSb3V0ZT4sXG4gICAgY3Vyck5vZGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlPiB8IG51bGwsXG4gICAgY29udGV4dHM6IENoaWxkcmVuT3V0bGV0Q29udGV4dHMsXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGNoaWxkcmVuOiB7W291dGxldDogc3RyaW5nXTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+fSA9IG5vZGVDaGlsZHJlbkFzTWFwKGN1cnJOb2RlKTtcbiAgICBmdXR1cmVOb2RlLmNoaWxkcmVuLmZvckVhY2goKGMpID0+IHtcbiAgICAgIHRoaXMuYWN0aXZhdGVSb3V0ZXMoYywgY2hpbGRyZW5bYy52YWx1ZS5vdXRsZXRdLCBjb250ZXh0cyk7XG4gICAgICB0aGlzLmZvcndhcmRFdmVudChuZXcgQWN0aXZhdGlvbkVuZChjLnZhbHVlLnNuYXBzaG90KSk7XG4gICAgfSk7XG4gICAgaWYgKGZ1dHVyZU5vZGUuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICB0aGlzLmZvcndhcmRFdmVudChuZXcgQ2hpbGRBY3RpdmF0aW9uRW5kKGZ1dHVyZU5vZGUudmFsdWUuc25hcHNob3QpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFjdGl2YXRlUm91dGVzKFxuICAgIGZ1dHVyZU5vZGU6IFRyZWVOb2RlPEFjdGl2YXRlZFJvdXRlPixcbiAgICBjdXJyTm9kZTogVHJlZU5vZGU8QWN0aXZhdGVkUm91dGU+LFxuICAgIHBhcmVudENvbnRleHRzOiBDaGlsZHJlbk91dGxldENvbnRleHRzLFxuICApOiB2b2lkIHtcbiAgICBjb25zdCBmdXR1cmUgPSBmdXR1cmVOb2RlLnZhbHVlO1xuICAgIGNvbnN0IGN1cnIgPSBjdXJyTm9kZSA/IGN1cnJOb2RlLnZhbHVlIDogbnVsbDtcblxuICAgIGFkdmFuY2VBY3RpdmF0ZWRSb3V0ZShmdXR1cmUpO1xuXG4gICAgLy8gcmV1c2luZyB0aGUgbm9kZVxuICAgIGlmIChmdXR1cmUgPT09IGN1cnIpIHtcbiAgICAgIGlmIChmdXR1cmUuY29tcG9uZW50KSB7XG4gICAgICAgIC8vIElmIHdlIGhhdmUgYSBub3JtYWwgcm91dGUsIHdlIG5lZWQgdG8gZ28gdGhyb3VnaCBhbiBvdXRsZXQuXG4gICAgICAgIGNvbnN0IGNvbnRleHQgPSBwYXJlbnRDb250ZXh0cy5nZXRPckNyZWF0ZUNvbnRleHQoZnV0dXJlLm91dGxldCk7XG4gICAgICAgIHRoaXMuYWN0aXZhdGVDaGlsZFJvdXRlcyhmdXR1cmVOb2RlLCBjdXJyTm9kZSwgY29udGV4dC5jaGlsZHJlbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBpZiB3ZSBoYXZlIGEgY29tcG9uZW50bGVzcyByb3V0ZSwgd2UgcmVjdXJzZSBidXQga2VlcCB0aGUgc2FtZSBvdXRsZXQgbWFwLlxuICAgICAgICB0aGlzLmFjdGl2YXRlQ2hpbGRSb3V0ZXMoZnV0dXJlTm9kZSwgY3Vyck5vZGUsIHBhcmVudENvbnRleHRzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGZ1dHVyZS5jb21wb25lbnQpIHtcbiAgICAgICAgLy8gaWYgd2UgaGF2ZSBhIG5vcm1hbCByb3V0ZSwgd2UgbmVlZCB0byBwbGFjZSB0aGUgY29tcG9uZW50IGludG8gdGhlIG91dGxldCBhbmQgcmVjdXJzZS5cbiAgICAgICAgY29uc3QgY29udGV4dCA9IHBhcmVudENvbnRleHRzLmdldE9yQ3JlYXRlQ29udGV4dChmdXR1cmUub3V0bGV0KTtcblxuICAgICAgICBpZiAodGhpcy5yb3V0ZVJldXNlU3RyYXRlZ3kuc2hvdWxkQXR0YWNoKGZ1dHVyZS5zbmFwc2hvdCkpIHtcbiAgICAgICAgICBjb25zdCBzdG9yZWQgPSA8RGV0YWNoZWRSb3V0ZUhhbmRsZUludGVybmFsPihcbiAgICAgICAgICAgIHRoaXMucm91dGVSZXVzZVN0cmF0ZWd5LnJldHJpZXZlKGZ1dHVyZS5zbmFwc2hvdClcbiAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMucm91dGVSZXVzZVN0cmF0ZWd5LnN0b3JlKGZ1dHVyZS5zbmFwc2hvdCwgbnVsbCk7XG4gICAgICAgICAgY29udGV4dC5jaGlsZHJlbi5vbk91dGxldFJlQXR0YWNoZWQoc3RvcmVkLmNvbnRleHRzKTtcbiAgICAgICAgICBjb250ZXh0LmF0dGFjaFJlZiA9IHN0b3JlZC5jb21wb25lbnRSZWY7XG4gICAgICAgICAgY29udGV4dC5yb3V0ZSA9IHN0b3JlZC5yb3V0ZS52YWx1ZTtcbiAgICAgICAgICBpZiAoY29udGV4dC5vdXRsZXQpIHtcbiAgICAgICAgICAgIC8vIEF0dGFjaCByaWdodCBhd2F5IHdoZW4gdGhlIG91dGxldCBoYXMgYWxyZWFkeSBiZWVuIGluc3RhbnRpYXRlZFxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGF0dGFjaCBmcm9tIGBSb3V0ZXJPdXRsZXQubmdPbkluaXRgIHdoZW4gaXQgaXMgaW5zdGFudGlhdGVkXG4gICAgICAgICAgICBjb250ZXh0Lm91dGxldC5hdHRhY2goc3RvcmVkLmNvbXBvbmVudFJlZiwgc3RvcmVkLnJvdXRlLnZhbHVlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhZHZhbmNlQWN0aXZhdGVkUm91dGUoc3RvcmVkLnJvdXRlLnZhbHVlKTtcbiAgICAgICAgICB0aGlzLmFjdGl2YXRlQ2hpbGRSb3V0ZXMoZnV0dXJlTm9kZSwgbnVsbCwgY29udGV4dC5jaGlsZHJlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgaW5qZWN0b3IgPSBnZXRDbG9zZXN0Um91dGVJbmplY3RvcihmdXR1cmUuc25hcHNob3QpO1xuICAgICAgICAgIGNvbnRleHQuYXR0YWNoUmVmID0gbnVsbDtcbiAgICAgICAgICBjb250ZXh0LnJvdXRlID0gZnV0dXJlO1xuICAgICAgICAgIGNvbnRleHQuaW5qZWN0b3IgPSBpbmplY3RvcjtcbiAgICAgICAgICBpZiAoY29udGV4dC5vdXRsZXQpIHtcbiAgICAgICAgICAgIC8vIEFjdGl2YXRlIHRoZSBvdXRsZXQgd2hlbiBpdCBoYXMgYWxyZWFkeSBiZWVuIGluc3RhbnRpYXRlZFxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGl0IHdpbGwgZ2V0IGFjdGl2YXRlZCBmcm9tIGl0cyBgbmdPbkluaXRgIHdoZW4gaW5zdGFudGlhdGVkXG4gICAgICAgICAgICBjb250ZXh0Lm91dGxldC5hY3RpdmF0ZVdpdGgoZnV0dXJlLCBjb250ZXh0LmluamVjdG9yKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLmFjdGl2YXRlQ2hpbGRSb3V0ZXMoZnV0dXJlTm9kZSwgbnVsbCwgY29udGV4dC5jaGlsZHJlbik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIHdlIGhhdmUgYSBjb21wb25lbnRsZXNzIHJvdXRlLCB3ZSByZWN1cnNlIGJ1dCBrZWVwIHRoZSBzYW1lIG91dGxldCBtYXAuXG4gICAgICAgIHRoaXMuYWN0aXZhdGVDaGlsZFJvdXRlcyhmdXR1cmVOb2RlLCBudWxsLCBwYXJlbnRDb250ZXh0cyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBwYXJlbnRDb250ZXh0cy5nZXRPckNyZWF0ZUNvbnRleHQoZnV0dXJlLm91dGxldCk7XG4gICAgICBjb25zdCBvdXRsZXQgPSBjb250ZXh0Lm91dGxldDtcbiAgICAgIGlmIChcbiAgICAgICAgb3V0bGV0ICYmXG4gICAgICAgIHRoaXMuaW5wdXRCaW5kaW5nRW5hYmxlZCAmJlxuICAgICAgICAhb3V0bGV0LnN1cHBvcnRzQmluZGluZ1RvQ29tcG9uZW50SW5wdXRzICYmXG4gICAgICAgICF3YXJuZWRBYm91dFVuc3VwcG9ydGVkSW5wdXRCaW5kaW5nXG4gICAgICApIHtcbiAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgIGAnd2l0aENvbXBvbmVudElucHV0QmluZGluZycgZmVhdHVyZSBpcyBlbmFibGVkIGJ1dCBgICtcbiAgICAgICAgICAgIGB0aGlzIGFwcGxpY2F0aW9uIGlzIHVzaW5nIGFuIG91dGxldCB0aGF0IG1heSBub3Qgc3VwcG9ydCBiaW5kaW5nIHRvIGNvbXBvbmVudCBpbnB1dHMuYCxcbiAgICAgICAgKTtcbiAgICAgICAgd2FybmVkQWJvdXRVbnN1cHBvcnRlZElucHV0QmluZGluZyA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=