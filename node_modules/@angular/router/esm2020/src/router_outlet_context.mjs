/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Store contextual information about a `RouterOutlet`
 *
 * @publicApi
 */
export class OutletContext {
    constructor() {
        this.outlet = null;
        this.route = null;
        /**
         * @deprecated Passing a resolver to retrieve a component factory is not required and is
         *     deprecated since v14.
         */
        this.resolver = null;
        this.injector = null;
        this.children = new ChildrenOutletContexts();
        this.attachRef = null;
    }
}
/**
 * Store contextual information about the children (= nested) `RouterOutlet`
 *
 * @publicApi
 */
export class ChildrenOutletContexts {
    constructor() {
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
            context = new OutletContext();
            this.contexts.set(childName, context);
        }
        return context;
    }
    getContext(childName) {
        return this.contexts.get(childName) || null;
    }
}
ChildrenOutletContexts.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: ChildrenOutletContexts, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
ChildrenOutletContexts.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: ChildrenOutletContexts, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0", ngImport: i0, type: ChildrenOutletContexts, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldF9jb250ZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvcm91dGVyL3NyYy9yb3V0ZXJfb3V0bGV0X2NvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUE4RCxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBTXRHOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sYUFBYTtJQUExQjtRQUNFLFdBQU0sR0FBOEIsSUFBSSxDQUFDO1FBQ3pDLFVBQUssR0FBd0IsSUFBSSxDQUFDO1FBQ2xDOzs7V0FHRztRQUNILGFBQVEsR0FBa0MsSUFBSSxDQUFDO1FBQy9DLGFBQVEsR0FBNkIsSUFBSSxDQUFDO1FBQzFDLGFBQVEsR0FBRyxJQUFJLHNCQUFzQixFQUFFLENBQUM7UUFDeEMsY0FBUyxHQUEyQixJQUFJLENBQUM7SUFDM0MsQ0FBQztDQUFBO0FBRUQ7Ozs7R0FJRztBQUVILE1BQU0sT0FBTyxzQkFBc0I7SUFEbkM7UUFFRSx1Q0FBdUM7UUFDL0IsYUFBUSxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO0tBa0RyRDtJQWhEQyw2REFBNkQ7SUFDN0Qsb0JBQW9CLENBQUMsU0FBaUIsRUFBRSxNQUE0QjtRQUNsRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkQsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsc0JBQXNCLENBQUMsU0FBaUI7UUFDdEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQyxJQUFJLE9BQU8sRUFBRTtZQUNYLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1NBQzFCO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNILG1CQUFtQjtRQUNqQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUMxQixPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQsa0JBQWtCLENBQUMsUUFBb0M7UUFDckQsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDM0IsQ0FBQztJQUVELGtCQUFrQixDQUFDLFNBQWlCO1FBQ2xDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFekMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLE9BQU8sR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN2QztRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxVQUFVLENBQUMsU0FBaUI7UUFDMUIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUM7SUFDOUMsQ0FBQzs7OEhBbkRVLHNCQUFzQjtrSUFBdEIsc0JBQXNCLGNBRFYsTUFBTTtzR0FDbEIsc0JBQXNCO2tCQURsQyxVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgQ29tcG9uZW50UmVmLCBFbnZpcm9ubWVudEluamVjdG9yLCBJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtSb3V0ZXJPdXRsZXRDb250cmFjdH0gZnJvbSAnLi9kaXJlY3RpdmVzL3JvdXRlcl9vdXRsZXQnO1xuaW1wb3J0IHtBY3RpdmF0ZWRSb3V0ZX0gZnJvbSAnLi9yb3V0ZXJfc3RhdGUnO1xuXG5cbi8qKlxuICogU3RvcmUgY29udGV4dHVhbCBpbmZvcm1hdGlvbiBhYm91dCBhIGBSb3V0ZXJPdXRsZXRgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgT3V0bGV0Q29udGV4dCB7XG4gIG91dGxldDogUm91dGVyT3V0bGV0Q29udHJhY3R8bnVsbCA9IG51bGw7XG4gIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZXxudWxsID0gbnVsbDtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFBhc3NpbmcgYSByZXNvbHZlciB0byByZXRyaWV2ZSBhIGNvbXBvbmVudCBmYWN0b3J5IGlzIG5vdCByZXF1aXJlZCBhbmQgaXNcbiAgICogICAgIGRlcHJlY2F0ZWQgc2luY2UgdjE0LlxuICAgKi9cbiAgcmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcnxudWxsID0gbnVsbDtcbiAgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3J8bnVsbCA9IG51bGw7XG4gIGNoaWxkcmVuID0gbmV3IENoaWxkcmVuT3V0bGV0Q29udGV4dHMoKTtcbiAgYXR0YWNoUmVmOiBDb21wb25lbnRSZWY8YW55PnxudWxsID0gbnVsbDtcbn1cblxuLyoqXG4gKiBTdG9yZSBjb250ZXh0dWFsIGluZm9ybWF0aW9uIGFib3V0IHRoZSBjaGlsZHJlbiAoPSBuZXN0ZWQpIGBSb3V0ZXJPdXRsZXRgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBDaGlsZHJlbk91dGxldENvbnRleHRzIHtcbiAgLy8gY29udGV4dHMgZm9yIGNoaWxkIG91dGxldHMsIGJ5IG5hbWUuXG4gIHByaXZhdGUgY29udGV4dHMgPSBuZXcgTWFwPHN0cmluZywgT3V0bGV0Q29udGV4dD4oKTtcblxuICAvKiogQ2FsbGVkIHdoZW4gYSBgUm91dGVyT3V0bGV0YCBkaXJlY3RpdmUgaXMgaW5zdGFudGlhdGVkICovXG4gIG9uQ2hpbGRPdXRsZXRDcmVhdGVkKGNoaWxkTmFtZTogc3RyaW5nLCBvdXRsZXQ6IFJvdXRlck91dGxldENvbnRyYWN0KTogdm9pZCB7XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMuZ2V0T3JDcmVhdGVDb250ZXh0KGNoaWxkTmFtZSk7XG4gICAgY29udGV4dC5vdXRsZXQgPSBvdXRsZXQ7XG4gICAgdGhpcy5jb250ZXh0cy5zZXQoY2hpbGROYW1lLCBjb250ZXh0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGBSb3V0ZXJPdXRsZXRgIGRpcmVjdGl2ZSBpcyBkZXN0cm95ZWQuXG4gICAqIFdlIG5lZWQgdG8ga2VlcCB0aGUgY29udGV4dCBhcyB0aGUgb3V0bGV0IGNvdWxkIGJlIGRlc3Ryb3llZCBpbnNpZGUgYSBOZ0lmIGFuZCBtaWdodCBiZVxuICAgKiByZS1jcmVhdGVkIGxhdGVyLlxuICAgKi9cbiAgb25DaGlsZE91dGxldERlc3Ryb3llZChjaGlsZE5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRleHQgPSB0aGlzLmdldENvbnRleHQoY2hpbGROYW1lKTtcbiAgICBpZiAoY29udGV4dCkge1xuICAgICAgY29udGV4dC5vdXRsZXQgPSBudWxsO1xuICAgICAgY29udGV4dC5hdHRhY2hSZWYgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgY29ycmVzcG9uZGluZyByb3V0ZSBpcyBkZWFjdGl2YXRlZCBkdXJpbmcgbmF2aWdhdGlvbi5cbiAgICogQmVjYXVzZSB0aGUgY29tcG9uZW50IGdldCBkZXN0cm95ZWQsIGFsbCBjaGlsZHJlbiBvdXRsZXQgYXJlIGRlc3Ryb3llZC5cbiAgICovXG4gIG9uT3V0bGV0RGVhY3RpdmF0ZWQoKTogTWFwPHN0cmluZywgT3V0bGV0Q29udGV4dD4ge1xuICAgIGNvbnN0IGNvbnRleHRzID0gdGhpcy5jb250ZXh0cztcbiAgICB0aGlzLmNvbnRleHRzID0gbmV3IE1hcCgpO1xuICAgIHJldHVybiBjb250ZXh0cztcbiAgfVxuXG4gIG9uT3V0bGV0UmVBdHRhY2hlZChjb250ZXh0czogTWFwPHN0cmluZywgT3V0bGV0Q29udGV4dD4pIHtcbiAgICB0aGlzLmNvbnRleHRzID0gY29udGV4dHM7XG4gIH1cblxuICBnZXRPckNyZWF0ZUNvbnRleHQoY2hpbGROYW1lOiBzdHJpbmcpOiBPdXRsZXRDb250ZXh0IHtcbiAgICBsZXQgY29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dChjaGlsZE5hbWUpO1xuXG4gICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICBjb250ZXh0ID0gbmV3IE91dGxldENvbnRleHQoKTtcbiAgICAgIHRoaXMuY29udGV4dHMuc2V0KGNoaWxkTmFtZSwgY29udGV4dCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRleHQ7XG4gIH1cblxuICBnZXRDb250ZXh0KGNoaWxkTmFtZTogc3RyaW5nKTogT3V0bGV0Q29udGV4dHxudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jb250ZXh0cy5nZXQoY2hpbGROYW1lKSB8fCBudWxsO1xuICB9XG59XG4iXX0=