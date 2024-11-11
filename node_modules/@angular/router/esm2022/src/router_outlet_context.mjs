/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentInjector, Injectable } from '@angular/core';
import { getClosestRouteInjector } from './utils/config';
import * as i0 from "@angular/core";
/**
 * Store contextual information about a `RouterOutlet`
 *
 * @publicApi
 */
export class OutletContext {
    get injector() {
        return getClosestRouteInjector(this.route?.snapshot) ?? this.rootInjector;
    }
    // TODO(atscott): Only here to avoid a "breaking" change in a patch/minor. Remove in v19.
    set injector(_) { }
    constructor(rootInjector) {
        this.rootInjector = rootInjector;
        this.outlet = null;
        this.route = null;
        this.children = new ChildrenOutletContexts(this.rootInjector);
        this.attachRef = null;
    }
}
/**
 * Store contextual information about the children (= nested) `RouterOutlet`
 *
 * @publicApi
 */
export class ChildrenOutletContexts {
    /** @nodoc */
    constructor(rootInjector) {
        this.rootInjector = rootInjector;
        // contexts for child outlets, by name.
        this.contexts = new Map();
    }
    /** Called when a `RouterOutlet` directive is instantiated */
    onChildOutletCreated(childName, outlet) {
        const context = this.getOrCreateContext(childName);
        context.outlet = outlet;
        this.contexts.set(childName, context);
    }
    /**
     * Called when a `RouterOutlet` directive is destroyed.
     * We need to keep the context as the outlet could be destroyed inside a NgIf and might be
     * re-created later.
     */
    onChildOutletDestroyed(childName) {
        const context = this.getContext(childName);
        if (context) {
            context.outlet = null;
            context.attachRef = null;
        }
    }
    /**
     * Called when the corresponding route is deactivated during navigation.
     * Because the component get destroyed, all children outlet are destroyed.
     */
    onOutletDeactivated() {
        const contexts = this.contexts;
        this.contexts = new Map();
        return contexts;
    }
    onOutletReAttached(contexts) {
        this.contexts = contexts;
    }
    getOrCreateContext(childName) {
        let context = this.getContext(childName);
        if (!context) {
            context = new OutletContext(this.rootInjector);
            this.contexts.set(childName, context);
        }
        return context;
    }
    getContext(childName) {
        return this.contexts.get(childName) || null;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: ChildrenOutletContexts, deps: [{ token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: ChildrenOutletContexts, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: ChildrenOutletContexts, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldF9jb250ZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yb3V0ZXJfb3V0bGV0X2NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFlLG1CQUFtQixFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUk1RSxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQzs7QUFFdkQ7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxhQUFhO0lBS3hCLElBQUksUUFBUTtRQUNWLE9BQU8sdUJBQXVCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzVFLENBQUM7SUFDRCx5RkFBeUY7SUFDekYsSUFBSSxRQUFRLENBQUMsQ0FBc0IsSUFBRyxDQUFDO0lBRXZDLFlBQTZCLFlBQWlDO1FBQWpDLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtRQVY5RCxXQUFNLEdBQWdDLElBQUksQ0FBQztRQUMzQyxVQUFLLEdBQTBCLElBQUksQ0FBQztRQUNwQyxhQUFRLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDekQsY0FBUyxHQUE2QixJQUFJLENBQUM7SUFPc0IsQ0FBQztDQUNuRTtBQUVEOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sc0JBQXNCO0lBSWpDLGFBQWE7SUFDYixZQUFvQixZQUFpQztRQUFqQyxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFKckQsdUNBQXVDO1FBQy9CLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztJQUdJLENBQUM7SUFFekQsNkRBQTZEO0lBQzdELG9CQUFvQixDQUFDLFNBQWlCLEVBQUUsTUFBNEI7UUFDbEUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25ELE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILHNCQUFzQixDQUFDLFNBQWlCO1FBQ3RDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0MsSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNaLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQzNCLENBQUM7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsbUJBQW1CO1FBQ2pCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDL0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzFCLE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxRQUFvQztRQUNyRCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMzQixDQUFDO0lBRUQsa0JBQWtCLENBQUMsU0FBaUI7UUFDbEMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV6QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDYixPQUFPLEdBQUcsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVELFVBQVUsQ0FBQyxTQUFpQjtRQUMxQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQztJQUM5QyxDQUFDO3lIQXREVSxzQkFBc0I7NkhBQXRCLHNCQUFzQixjQURWLE1BQU07O3NHQUNsQixzQkFBc0I7a0JBRGxDLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudFJlZiwgRW52aXJvbm1lbnRJbmplY3RvciwgSW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Um91dGVyT3V0bGV0Q29udHJhY3R9IGZyb20gJy4vZGlyZWN0aXZlcy9yb3V0ZXJfb3V0bGV0JztcbmltcG9ydCB7QWN0aXZhdGVkUm91dGV9IGZyb20gJy4vcm91dGVyX3N0YXRlJztcbmltcG9ydCB7Z2V0Q2xvc2VzdFJvdXRlSW5qZWN0b3J9IGZyb20gJy4vdXRpbHMvY29uZmlnJztcblxuLyoqXG4gKiBTdG9yZSBjb250ZXh0dWFsIGluZm9ybWF0aW9uIGFib3V0IGEgYFJvdXRlck91dGxldGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBPdXRsZXRDb250ZXh0IHtcbiAgb3V0bGV0OiBSb3V0ZXJPdXRsZXRDb250cmFjdCB8IG51bGwgPSBudWxsO1xuICByb3V0ZTogQWN0aXZhdGVkUm91dGUgfCBudWxsID0gbnVsbDtcbiAgY2hpbGRyZW4gPSBuZXcgQ2hpbGRyZW5PdXRsZXRDb250ZXh0cyh0aGlzLnJvb3RJbmplY3Rvcik7XG4gIGF0dGFjaFJlZjogQ29tcG9uZW50UmVmPGFueT4gfCBudWxsID0gbnVsbDtcbiAgZ2V0IGluamVjdG9yKCk6IEVudmlyb25tZW50SW5qZWN0b3Ige1xuICAgIHJldHVybiBnZXRDbG9zZXN0Um91dGVJbmplY3Rvcih0aGlzLnJvdXRlPy5zbmFwc2hvdCkgPz8gdGhpcy5yb290SW5qZWN0b3I7XG4gIH1cbiAgLy8gVE9ETyhhdHNjb3R0KTogT25seSBoZXJlIHRvIGF2b2lkIGEgXCJicmVha2luZ1wiIGNoYW5nZSBpbiBhIHBhdGNoL21pbm9yLiBSZW1vdmUgaW4gdjE5LlxuICBzZXQgaW5qZWN0b3IoXzogRW52aXJvbm1lbnRJbmplY3Rvcikge31cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHJvb3RJbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvcikge31cbn1cblxuLyoqXG4gKiBTdG9yZSBjb250ZXh0dWFsIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjaGlsZHJlbiAoPSBuZXN0ZWQpIGBSb3V0ZXJPdXRsZXRgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBDaGlsZHJlbk91dGxldENvbnRleHRzIHtcbiAgLy8gY29udGV4dHMgZm9yIGNoaWxkIG91dGxldHMsIGJ5IG5hbWUuXG4gIHByaXZhdGUgY29udGV4dHMgPSBuZXcgTWFwPHN0cmluZywgT3V0bGV0Q29udGV4dD4oKTtcblxuICAvKiogQG5vZG9jICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcm9vdEluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yKSB7fVxuXG4gIC8qKiBDYWxsZWQgd2hlbiBhIGBSb3V0ZXJPdXRsZXRgIGRpcmVjdGl2ZSBpcyBpbnN0YW50aWF0ZWQgKi9cbiAgb25DaGlsZE91dGxldENyZWF0ZWQoY2hpbGROYW1lOiBzdHJpbmcsIG91dGxldDogUm91dGVyT3V0bGV0Q29udHJhY3QpOiB2b2lkIHtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5nZXRPckNyZWF0ZUNvbnRleHQoY2hpbGROYW1lKTtcbiAgICBjb250ZXh0Lm91dGxldCA9IG91dGxldDtcbiAgICB0aGlzLmNvbnRleHRzLnNldChjaGlsZE5hbWUsIGNvbnRleHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgYFJvdXRlck91dGxldGAgZGlyZWN0aXZlIGlzIGRlc3Ryb3llZC5cbiAgICogV2UgbmVlZCB0byBrZWVwIHRoZSBjb250ZXh0IGFzIHRoZSBvdXRsZXQgY291bGQgYmUgZGVzdHJveWVkIGluc2lkZSBhIE5nSWYgYW5kIG1pZ2h0IGJlXG4gICAqIHJlLWNyZWF0ZWQgbGF0ZXIuXG4gICAqL1xuICBvbkNoaWxkT3V0bGV0RGVzdHJveWVkKGNoaWxkTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dChjaGlsZE5hbWUpO1xuICAgIGlmIChjb250ZXh0KSB7XG4gICAgICBjb250ZXh0Lm91dGxldCA9IG51bGw7XG4gICAgICBjb250ZXh0LmF0dGFjaFJlZiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBjb3JyZXNwb25kaW5nIHJvdXRlIGlzIGRlYWN0aXZhdGVkIGR1cmluZyBuYXZpZ2F0aW9uLlxuICAgKiBCZWNhdXNlIHRoZSBjb21wb25lbnQgZ2V0IGRlc3Ryb3llZCwgYWxsIGNoaWxkcmVuIG91dGxldCBhcmUgZGVzdHJveWVkLlxuICAgKi9cbiAgb25PdXRsZXREZWFjdGl2YXRlZCgpOiBNYXA8c3RyaW5nLCBPdXRsZXRDb250ZXh0PiB7XG4gICAgY29uc3QgY29udGV4dHMgPSB0aGlzLmNvbnRleHRzO1xuICAgIHRoaXMuY29udGV4dHMgPSBuZXcgTWFwKCk7XG4gICAgcmV0dXJuIGNvbnRleHRzO1xuICB9XG5cbiAgb25PdXRsZXRSZUF0dGFjaGVkKGNvbnRleHRzOiBNYXA8c3RyaW5nLCBPdXRsZXRDb250ZXh0Pikge1xuICAgIHRoaXMuY29udGV4dHMgPSBjb250ZXh0cztcbiAgfVxuXG4gIGdldE9yQ3JlYXRlQ29udGV4dChjaGlsZE5hbWU6IHN0cmluZyk6IE91dGxldENvbnRleHQge1xuICAgIGxldCBjb250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KGNoaWxkTmFtZSk7XG5cbiAgICBpZiAoIWNvbnRleHQpIHtcbiAgICAgIGNvbnRleHQgPSBuZXcgT3V0bGV0Q29udGV4dCh0aGlzLnJvb3RJbmplY3Rvcik7XG4gICAgICB0aGlzLmNvbnRleHRzLnNldChjaGlsZE5hbWUsIGNvbnRleHQpO1xuICAgIH1cblxuICAgIHJldHVybiBjb250ZXh0O1xuICB9XG5cbiAgZ2V0Q29udGV4dChjaGlsZE5hbWU6IHN0cmluZyk6IE91dGxldENvbnRleHQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jb250ZXh0cy5nZXQoY2hpbGROYW1lKSB8fCBudWxsO1xuICB9XG59XG4iXX0=