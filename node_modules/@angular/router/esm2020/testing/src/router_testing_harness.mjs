/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Component, Injectable, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, RouterOutlet, ɵafterNextNavigation as afterNextNavigation } from '@angular/router';
import * as i0 from "@angular/core";
export class RootFixtureService {
    createHarness() {
        if (this.harness) {
            throw new Error('Only one harness should be created per test.');
        }
        this.harness = new RouterTestingHarness(this.getRootFixture());
        return this.harness;
    }
    getRootFixture() {
        if (this.fixture !== undefined) {
            return this.fixture;
        }
        this.fixture = TestBed.createComponent(RootCmp);
        this.fixture.detectChanges();
        return this.fixture;
    }
}
RootFixtureService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: RootFixtureService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
RootFixtureService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: RootFixtureService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: RootFixtureService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
export class RootCmp {
}
RootCmp.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: RootCmp, deps: [], target: i0.ɵɵFactoryTarget.Component });
RootCmp.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.1", type: RootCmp, isStandalone: true, selector: "ng-component", viewQueries: [{ propertyName: "outlet", first: true, predicate: RouterOutlet, descendants: true }], ngImport: i0, template: '<router-outlet></router-outlet>', isInline: true, dependencies: [{ kind: "directive", type: RouterOutlet, selector: "router-outlet", inputs: ["name"], outputs: ["activate", "deactivate", "attach", "detach"], exportAs: ["outlet"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: RootCmp, decorators: [{
            type: Component,
            args: [{
                    standalone: true,
                    template: '<router-outlet></router-outlet>',
                    imports: [RouterOutlet],
                }]
        }], propDecorators: { outlet: [{
                type: ViewChild,
                args: [RouterOutlet]
            }] } });
/**
 * A testing harness for the `Router` to reduce the boilerplate needed to test routes and routed
 * components.
 *
 * @publicApi
 */
export class RouterTestingHarness {
    /**
     * Creates a `RouterTestingHarness` instance.
     *
     * The `RouterTestingHarness` also creates its own root component with a `RouterOutlet` for the
     * purposes of rendering route components.
     *
     * Throws an error if an instance has already been created.
     * Use of this harness also requires `destroyAfterEach: true` in the `ModuleTeardownOptions`
     *
     * @param initialUrl The target of navigation to trigger before returning the harness.
     */
    static async create(initialUrl) {
        const harness = TestBed.inject(RootFixtureService).createHarness();
        if (initialUrl !== undefined) {
            await harness.navigateByUrl(initialUrl);
        }
        return harness;
    }
    /** @internal */
    constructor(fixture) {
        this.fixture = fixture;
    }
    /** Instructs the root fixture to run change detection. */
    detectChanges() {
        this.fixture.detectChanges();
    }
    /** The `DebugElement` of the `RouterOutlet` component. `null` if the outlet is not activated. */
    get routeDebugElement() {
        const outlet = this.fixture.componentInstance.outlet;
        if (!outlet || !outlet.isActivated) {
            return null;
        }
        return this.fixture.debugElement.query(v => v.componentInstance === outlet.component);
    }
    /** The native element of the `RouterOutlet` component. `null` if the outlet is not activated. */
    get routeNativeElement() {
        return this.routeDebugElement?.nativeElement ?? null;
    }
    async navigateByUrl(url, requiredRoutedComponentType) {
        const router = TestBed.inject(Router);
        let resolveFn;
        const redirectTrackingPromise = new Promise(resolve => {
            resolveFn = resolve;
        });
        afterNextNavigation(TestBed.inject(Router), resolveFn);
        await router.navigateByUrl(url);
        await redirectTrackingPromise;
        this.fixture.detectChanges();
        const outlet = this.fixture.componentInstance.outlet;
        // The outlet might not be activated if the user is testing a navigation for a guard that
        // rejects
        if (outlet && outlet.isActivated && outlet.activatedRoute.component) {
            const activatedComponent = outlet.component;
            if (requiredRoutedComponentType !== undefined &&
                !(activatedComponent instanceof requiredRoutedComponentType)) {
                throw new Error(`Unexpected routed component type. Expected ${requiredRoutedComponentType.name} but got ${activatedComponent.constructor.name}`);
            }
            return activatedComponent;
        }
        else {
            return null;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX3Rlc3RpbmdfaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci90ZXN0aW5nL3NyYy9yb3V0ZXJfdGVzdGluZ19oYXJuZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQWdCLFVBQVUsRUFBUSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDbkYsT0FBTyxFQUFtQixPQUFPLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNoRSxPQUFPLEVBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxvQkFBb0IsSUFBSSxtQkFBbUIsRUFBQyxNQUFNLGlCQUFpQixDQUFDOztBQUdsRyxNQUFNLE9BQU8sa0JBQWtCO0lBSTdCLGFBQWE7UUFDWCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1NBQ2pFO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBRU8sY0FBYztRQUNwQixJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO1lBQzlCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztTQUNyQjtRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQzdCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDOzswSEFuQlUsa0JBQWtCOzhIQUFsQixrQkFBa0IsY0FETixNQUFNO3NHQUNsQixrQkFBa0I7a0JBRDlCLFVBQVU7bUJB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WUFBWSxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUN4RjtZQUNELE9BQU8sa0JBQXVCLENBQUM7U0FDaEM7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDO1NBQ2I7SUFDSCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21wb25lbnQsIERlYnVnRWxlbWVudCwgSW5qZWN0YWJsZSwgVHlwZSwgVmlld0NoaWxkfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q29tcG9uZW50Rml4dHVyZSwgVGVzdEJlZH0gZnJvbSAnQGFuZ3VsYXIvY29yZS90ZXN0aW5nJztcbmltcG9ydCB7Um91dGVyLCBSb3V0ZXJPdXRsZXQsIMm1YWZ0ZXJOZXh0TmF2aWdhdGlvbiBhcyBhZnRlck5leHROYXZpZ2F0aW9ufSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBSb290Rml4dHVyZVNlcnZpY2Uge1xuICBwcml2YXRlIGZpeHR1cmU/OiBDb21wb25lbnRGaXh0dXJlPFJvb3RDbXA+O1xuICBwcml2YXRlIGhhcm5lc3M/OiBSb3V0ZXJUZXN0aW5nSGFybmVzcztcblxuICBjcmVhdGVIYXJuZXNzKCk6IFJvdXRlclRlc3RpbmdIYXJuZXNzIHtcbiAgICBpZiAodGhpcy5oYXJuZXNzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ09ubHkgb25lIGhhcm5lc3Mgc2hvdWxkIGJlIGNyZWF0ZWQgcGVyIHRlc3QuJyk7XG4gICAgfVxuICAgIHRoaXMuaGFybmVzcyA9IG5ldyBSb3V0ZXJUZXN0aW5nSGFybmVzcyh0aGlzLmdldFJvb3RGaXh0dXJlKCkpO1xuICAgIHJldHVybiB0aGlzLmhhcm5lc3M7XG4gIH1cblxuICBwcml2YXRlIGdldFJvb3RGaXh0dXJlKCk6IENvbXBvbmVudEZpeHR1cmU8Um9vdENtcD4ge1xuICAgIGlmICh0aGlzLmZpeHR1cmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZml4dHVyZTtcbiAgICB9XG4gICAgdGhpcy5maXh0dXJlID0gVGVzdEJlZC5jcmVhdGVDb21wb25lbnQoUm9vdENtcCk7XG4gICAgdGhpcy5maXh0dXJlLmRldGVjdENoYW5nZXMoKTtcbiAgICByZXR1cm4gdGhpcy5maXh0dXJlO1xuICB9XG59XG5cbkBDb21wb25lbnQoe1xuICBzdGFuZGFsb25lOiB0cnVlLFxuICB0ZW1wbGF0ZTogJzxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD4nLFxuICBpbXBvcnRzOiBbUm91dGVyT3V0bGV0XSxcbn0pXG5leHBvcnQgY2xhc3MgUm9vdENtcCB7XG4gIEBWaWV3Q2hpbGQoUm91dGVyT3V0bGV0KSBvdXRsZXQ/OiBSb3V0ZXJPdXRsZXQ7XG59XG5cbi8qKlxuICogQSB0ZXN0aW5nIGhhcm5lc3MgZm9yIHRoZSBgUm91dGVyYCB0byByZWR1Y2UgdGhlIGJvaWxlcnBsYXRlIG5lZWRlZCB0byB0ZXN0IHJvdXRlcyBhbmQgcm91dGVkXG4gKiBjb21wb25lbnRzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlclRlc3RpbmdIYXJuZXNzIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBgUm91dGVyVGVzdGluZ0hhcm5lc3NgIGluc3RhbmNlLlxuICAgKlxuICAgKiBUaGUgYFJvdXRlclRlc3RpbmdIYXJuZXNzYCBhbHNvIGNyZWF0ZXMgaXRzIG93biByb290IGNvbXBvbmVudCB3aXRoIGEgYFJvdXRlck91dGxldGAgZm9yIHRoZVxuICAgKiBwdXJwb3NlcyBvZiByZW5kZXJpbmcgcm91dGUgY29tcG9uZW50cy5cbiAgICpcbiAgICogVGhyb3dzIGFuIGVycm9yIGlmIGFuIGluc3RhbmNlIGhhcyBhbHJlYWR5IGJlZW4gY3JlYXRlZC5cbiAgICogVXNlIG9mIHRoaXMgaGFybmVzcyBhbHNvIHJlcXVpcmVzIGBkZXN0cm95QWZ0ZXJFYWNoOiB0cnVlYCBpbiB0aGUgYE1vZHVsZVRlYXJkb3duT3B0aW9uc2BcbiAgICpcbiAgICogQHBhcmFtIGluaXRpYWxVcmwgVGhlIHRhcmdldCBvZiBuYXZpZ2F0aW9uIHRvIHRyaWdnZXIgYmVmb3JlIHJldHVybmluZyB0aGUgaGFybmVzcy5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBjcmVhdGUoaW5pdGlhbFVybD86IHN0cmluZyk6IFByb21pc2U8Um91dGVyVGVzdGluZ0hhcm5lc3M+IHtcbiAgICBjb25zdCBoYXJuZXNzID0gVGVzdEJlZC5pbmplY3QoUm9vdEZpeHR1cmVTZXJ2aWNlKS5jcmVhdGVIYXJuZXNzKCk7XG4gICAgaWYgKGluaXRpYWxVcmwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXdhaXQgaGFybmVzcy5uYXZpZ2F0ZUJ5VXJsKGluaXRpYWxVcmwpO1xuICAgIH1cbiAgICByZXR1cm4gaGFybmVzcztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBmaXh0dXJlOiBDb21wb25lbnRGaXh0dXJlPFJvb3RDbXA+KSB7fVxuXG4gIC8qKiBJbnN0cnVjdHMgdGhlIHJvb3QgZml4dHVyZSB0byBydW4gY2hhbmdlIGRldGVjdGlvbi4gKi9cbiAgZGV0ZWN0Q2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLmZpeHR1cmUuZGV0ZWN0Q2hhbmdlcygpO1xuICB9XG4gIC8qKiBUaGUgYERlYnVnRWxlbWVudGAgb2YgdGhlIGBSb3V0ZXJPdXRsZXRgIGNvbXBvbmVudC4gYG51bGxgIGlmIHRoZSBvdXRsZXQgaXMgbm90IGFjdGl2YXRlZC4gKi9cbiAgZ2V0IHJvdXRlRGVidWdFbGVtZW50KCk6IERlYnVnRWxlbWVudHxudWxsIHtcbiAgICBjb25zdCBvdXRsZXQgPSB0aGlzLmZpeHR1cmUuY29tcG9uZW50SW5zdGFuY2Uub3V0bGV0O1xuICAgIGlmICghb3V0bGV0IHx8ICFvdXRsZXQuaXNBY3RpdmF0ZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maXh0dXJlLmRlYnVnRWxlbWVudC5xdWVyeSh2ID0+IHYuY29tcG9uZW50SW5zdGFuY2UgPT09IG91dGxldC5jb21wb25lbnQpO1xuICB9XG4gIC8qKiBUaGUgbmF0aXZlIGVsZW1lbnQgb2YgdGhlIGBSb3V0ZXJPdXRsZXRgIGNvbXBvbmVudC4gYG51bGxgIGlmIHRoZSBvdXRsZXQgaXMgbm90IGFjdGl2YXRlZC4gKi9cbiAgZ2V0IHJvdXRlTmF0aXZlRWxlbWVudCgpOiBIVE1MRWxlbWVudHxudWxsIHtcbiAgICByZXR1cm4gdGhpcy5yb3V0ZURlYnVnRWxlbWVudD8ubmF0aXZlRWxlbWVudCA/PyBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGEgYFJvdXRlcmAgbmF2aWdhdGlvbiBhbmQgd2FpdHMgZm9yIGl0IHRvIGNvbXBsZXRlLlxuICAgKlxuICAgKiBUaGUgcm9vdCBjb21wb25lbnQgd2l0aCBhIGBSb3V0ZXJPdXRsZXRgIGNyZWF0ZWQgZm9yIHRoZSBoYXJuZXNzIGlzIHVzZWQgdG8gcmVuZGVyIGBSb3V0ZWBcbiAgICogY29tcG9uZW50cy4gVGhlIHJvb3QgY29tcG9uZW50IGlzIHJldXNlZCB3aXRoaW4gdGhlIHNhbWUgdGVzdCBpbiBzdWJzZXF1ZW50IGNhbGxzIHRvXG4gICAqIGBuYXZpZ2F0ZUZvclRlc3RgLlxuICAgKlxuICAgKiBXaGVuIHRlc3RpbmcgYFJvdXRlc2Agd2l0aCBhIGd1YXJkcyB0aGF0IHJlamVjdCB0aGUgbmF2aWdhdGlvbiwgdGhlIGBSb3V0ZXJPdXRsZXRgIG1pZ2h0IG5vdCBiZVxuICAgKiBhY3RpdmF0ZWQgYW5kIHRoZSBgYWN0aXZhdGVkQ29tcG9uZW50YCBtYXkgYmUgYG51bGxgLlxuICAgKlxuICAgKiB7QGV4YW1wbGUgcm91dGVyL3Rlc3RpbmcvdGVzdC9yb3V0ZXJfdGVzdGluZ19oYXJuZXNzX2V4YW1wbGVzLnNwZWMudHMgcmVnaW9uPSdHdWFyZCd9XG4gICAqXG4gICAqIEBwYXJhbSB1cmwgVGhlIHRhcmdldCBvZiB0aGUgbmF2aWdhdGlvbi4gUGFzc2VkIHRvIGBSb3V0ZXIubmF2aWdhdGVCeVVybGAuXG4gICAqIEByZXR1cm5zIFRoZSBhY3RpdmF0ZWQgY29tcG9uZW50IGluc3RhbmNlIG9mIHRoZSBgUm91dGVyT3V0bGV0YCBhZnRlciBuYXZpZ2F0aW9uIGNvbXBsZXRlc1xuICAgKiAgICAgKGBudWxsYCBpZiB0aGUgb3V0bGV0IGRvZXMgbm90IGdldCBhY3RpdmF0ZWQpLlxuICAgKi9cbiAgYXN5bmMgbmF2aWdhdGVCeVVybCh1cmw6IHN0cmluZyk6IFByb21pc2U8bnVsbHx7fT47XG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIHJvdXRlciBuYXZpZ2F0aW9uIGFuZCB3YWl0cyBmb3IgaXQgdG8gY29tcGxldGUuXG4gICAqXG4gICAqIFRoZSByb290IGNvbXBvbmVudCB3aXRoIGEgYFJvdXRlck91dGxldGAgY3JlYXRlZCBmb3IgdGhlIGhhcm5lc3MgaXMgdXNlZCB0byByZW5kZXIgYFJvdXRlYFxuICAgKiBjb21wb25lbnRzLlxuICAgKlxuICAgKiB7QGV4YW1wbGUgcm91dGVyL3Rlc3RpbmcvdGVzdC9yb3V0ZXJfdGVzdGluZ19oYXJuZXNzX2V4YW1wbGVzLnNwZWMudHMgcmVnaW9uPSdSb3V0ZWRDb21wb25lbnQnfVxuICAgKlxuICAgKiBUaGUgcm9vdCBjb21wb25lbnQgaXMgcmV1c2VkIHdpdGhpbiB0aGUgc2FtZSB0ZXN0IGluIHN1YnNlcXVlbnQgY2FsbHMgdG8gYG5hdmlnYXRlQnlVcmxgLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGFsc28gbWFrZXMgaXQgZWFzaWVyIHRvIHRlc3QgY29tcG9uZW50cyB0aGF0IGRlcGVuZCBvbiBgQWN0aXZhdGVkUm91dGVgIGRhdGEuXG4gICAqXG4gICAqIHtAZXhhbXBsZSByb3V0ZXIvdGVzdGluZy90ZXN0L3JvdXRlcl90ZXN0aW5nX2hhcm5lc3NfZXhhbXBsZXMuc3BlYy50cyByZWdpb249J0FjdGl2YXRlZFJvdXRlJ31cbiAgICpcbiAgICogQHBhcmFtIHVybCBUaGUgdGFyZ2V0IG9mIHRoZSBuYXZpZ2F0aW9uLiBQYXNzZWQgdG8gYFJvdXRlci5uYXZpZ2F0ZUJ5VXJsYC5cbiAgICogQHBhcmFtIHJlcXVpcmVkUm91dGVkQ29tcG9uZW50VHlwZSBBZnRlciBuYXZpZ2F0aW9uIGNvbXBsZXRlcywgdGhlIHJlcXVpcmVkIHR5cGUgZm9yIHRoZVxuICAgKiAgICAgYWN0aXZhdGVkIGNvbXBvbmVudCBvZiB0aGUgYFJvdXRlck91dGxldGAuIElmIHRoZSBvdXRsZXQgaXMgbm90IGFjdGl2YXRlZCBvciBhIGRpZmZlcmVudFxuICAgKiAgICAgY29tcG9uZW50IGlzIGFjdGl2YXRlZCwgdGhpcyBmdW5jdGlvbiB3aWxsIHRocm93IGFuIGVycm9yLlxuICAgKiBAcmV0dXJucyBUaGUgYWN0aXZhdGVkIGNvbXBvbmVudCBpbnN0YW5jZSBvZiB0aGUgYFJvdXRlck91dGxldGAgYWZ0ZXIgbmF2aWdhdGlvbiBjb21wbGV0ZXMuXG4gICAqL1xuICBhc3luYyBuYXZpZ2F0ZUJ5VXJsPFQ+KHVybDogc3RyaW5nLCByZXF1aXJlZFJvdXRlZENvbXBvbmVudFR5cGU6IFR5cGU8VD4pOiBQcm9taXNlPFQ+O1xuICBhc3luYyBuYXZpZ2F0ZUJ5VXJsPFQ+KHVybDogc3RyaW5nLCByZXF1aXJlZFJvdXRlZENvbXBvbmVudFR5cGU/OiBUeXBlPFQ+KTogUHJvbWlzZTxUfG51bGw+IHtcbiAgICBjb25zdCByb3V0ZXIgPSBUZXN0QmVkLmluamVjdChSb3V0ZXIpO1xuICAgIGxldCByZXNvbHZlRm4hOiAoKSA9PiB2b2lkO1xuICAgIGNvbnN0IHJlZGlyZWN0VHJhY2tpbmdQcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4ocmVzb2x2ZSA9PiB7XG4gICAgICByZXNvbHZlRm4gPSByZXNvbHZlO1xuICAgIH0pO1xuICAgIGFmdGVyTmV4dE5hdmlnYXRpb24oVGVzdEJlZC5pbmplY3QoUm91dGVyKSwgcmVzb2x2ZUZuKTtcbiAgICBhd2FpdCByb3V0ZXIubmF2aWdhdGVCeVVybCh1cmwpO1xuICAgIGF3YWl0IHJlZGlyZWN0VHJhY2tpbmdQcm9taXNlO1xuICAgIHRoaXMuZml4dHVyZS5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgY29uc3Qgb3V0bGV0ID0gdGhpcy5maXh0dXJlLmNvbXBvbmVudEluc3RhbmNlLm91dGxldDtcbiAgICAvLyBUaGUgb3V0bGV0IG1pZ2h0IG5vdCBiZSBhY3RpdmF0ZWQgaWYgdGhlIHVzZXIgaXMgdGVzdGluZyBhIG5hdmlnYXRpb24gZm9yIGEgZ3VhcmQgdGhhdFxuICAgIC8vIHJlamVjdHNcbiAgICBpZiAob3V0bGV0ICYmIG91dGxldC5pc0FjdGl2YXRlZCAmJiBvdXRsZXQuYWN0aXZhdGVkUm91dGUuY29tcG9uZW50KSB7XG4gICAgICBjb25zdCBhY3RpdmF0ZWRDb21wb25lbnQgPSBvdXRsZXQuY29tcG9uZW50O1xuICAgICAgaWYgKHJlcXVpcmVkUm91dGVkQ29tcG9uZW50VHlwZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgIShhY3RpdmF0ZWRDb21wb25lbnQgaW5zdGFuY2VvZiByZXF1aXJlZFJvdXRlZENvbXBvbmVudFR5cGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCByb3V0ZWQgY29tcG9uZW50IHR5cGUuIEV4cGVjdGVkICR7XG4gICAgICAgICAgICByZXF1aXJlZFJvdXRlZENvbXBvbmVudFR5cGUubmFtZX0gYnV0IGdvdCAke2FjdGl2YXRlZENvbXBvbmVudC5jb25zdHJ1Y3Rvci5uYW1lfWApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFjdGl2YXRlZENvbXBvbmVudCBhcyBUO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==