/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RootFixtureService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RootFixtureService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RootFixtureService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
export class RootCmp {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RootCmp, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.2.7", type: RootCmp, isStandalone: true, selector: "ng-component", viewQueries: [{ propertyName: "outlet", first: true, predicate: RouterOutlet, descendants: true }], ngImport: i0, template: '<router-outlet></router-outlet>', isInline: true, dependencies: [{ kind: "directive", type: RouterOutlet, selector: "router-outlet", inputs: ["name"], outputs: ["activate", "deactivate", "attach", "detach"], exportAs: ["outlet"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: RootCmp, decorators: [{
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
        return this.fixture.debugElement.query((v) => v.componentInstance === outlet.component);
    }
    /** The native element of the `RouterOutlet` component. `null` if the outlet is not activated. */
    get routeNativeElement() {
        return this.routeDebugElement?.nativeElement ?? null;
    }
    async navigateByUrl(url, requiredRoutedComponentType) {
        const router = TestBed.inject(Router);
        let resolveFn;
        const redirectTrackingPromise = new Promise((resolve) => {
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
            if (requiredRoutedComponentType !== undefined) {
                throw new Error(`Unexpected routed component type. Expected ${requiredRoutedComponentType.name} but the navigation did not activate any component.`);
            }
            return null;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX3Rlc3RpbmdfaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3JvdXRlci90ZXN0aW5nL3NyYy9yb3V0ZXJfdGVzdGluZ19oYXJuZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQWdCLFVBQVUsRUFBUSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDbkYsT0FBTyxFQUFtQixPQUFPLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNoRSxPQUFPLEVBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxvQkFBb0IsSUFBSSxtQkFBbUIsRUFBQyxNQUFNLGlCQUFpQixDQUFDOztBQUdsRyxNQUFNLE9BQU8sa0JBQWtCO0lBSTdCLGFBQWE7UUFDWCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLDhDQUE4QyxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUMvRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUVPLGNBQWM7UUFDcEIsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQy9CLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN0QixDQUFDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDN0IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RCLENBQUM7eUhBbkJVLGtCQUFrQjs2SEFBbEIsa0JBQWtCLGNBRE4sTUFBTTs7c0dBQ2xCLGtC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MkIsQ0FBQyxFQUM1RCxDQUFDO2dCQUNELE1BQU0sSUFBSSxLQUFLLENBQ2IsOENBQThDLDJCQUEyQixDQUFDLElBQUksWUFBWSxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQ2hJLENBQUM7WUFDSixDQUFDO1lBQ0QsT0FBTyxrQkFBdUIsQ0FBQztRQUNqQyxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksMkJBQTJCLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQzlDLE1BQU0sSUFBSSxLQUFLLENBQ2IsOENBQThDLDJCQUEyQixDQUFDLElBQUkscURBQXFELENBQ3BJLENBQUM7WUFDSixDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudCwgRGVidWdFbGVtZW50LCBJbmplY3RhYmxlLCBUeXBlLCBWaWV3Q2hpbGR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb21wb25lbnRGaXh0dXJlLCBUZXN0QmVkfSBmcm9tICdAYW5ndWxhci9jb3JlL3Rlc3RpbmcnO1xuaW1wb3J0IHtSb3V0ZXIsIFJvdXRlck91dGxldCwgybVhZnRlck5leHROYXZpZ2F0aW9uIGFzIGFmdGVyTmV4dE5hdmlnYXRpb259IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIFJvb3RGaXh0dXJlU2VydmljZSB7XG4gIHByaXZhdGUgZml4dHVyZT86IENvbXBvbmVudEZpeHR1cmU8Um9vdENtcD47XG4gIHByaXZhdGUgaGFybmVzcz86IFJvdXRlclRlc3RpbmdIYXJuZXNzO1xuXG4gIGNyZWF0ZUhhcm5lc3MoKTogUm91dGVyVGVzdGluZ0hhcm5lc3Mge1xuICAgIGlmICh0aGlzLmhhcm5lc3MpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignT25seSBvbmUgaGFybmVzcyBzaG91bGQgYmUgY3JlYXRlZCBwZXIgdGVzdC4nKTtcbiAgICB9XG4gICAgdGhpcy5oYXJuZXNzID0gbmV3IFJvdXRlclRlc3RpbmdIYXJuZXNzKHRoaXMuZ2V0Um9vdEZpeHR1cmUoKSk7XG4gICAgcmV0dXJuIHRoaXMuaGFybmVzcztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Um9vdEZpeHR1cmUoKTogQ29tcG9uZW50Rml4dHVyZTxSb290Q21wPiB7XG4gICAgaWYgKHRoaXMuZml4dHVyZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5maXh0dXJlO1xuICAgIH1cbiAgICB0aGlzLmZpeHR1cmUgPSBUZXN0QmVkLmNyZWF0ZUNvbXBvbmVudChSb290Q21wKTtcbiAgICB0aGlzLmZpeHR1cmUuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIHJldHVybiB0aGlzLmZpeHR1cmU7XG4gIH1cbn1cblxuQENvbXBvbmVudCh7XG4gIHN0YW5kYWxvbmU6IHRydWUsXG4gIHRlbXBsYXRlOiAnPHJvdXRlci1vdXRsZXQ+PC9yb3V0ZXItb3V0bGV0PicsXG4gIGltcG9ydHM6IFtSb3V0ZXJPdXRsZXRdLFxufSlcbmV4cG9ydCBjbGFzcyBSb290Q21wIHtcbiAgQFZpZXdDaGlsZChSb3V0ZXJPdXRsZXQpIG91dGxldD86IFJvdXRlck91dGxldDtcbn1cblxuLyoqXG4gKiBBIHRlc3RpbmcgaGFybmVzcyBmb3IgdGhlIGBSb3V0ZXJgIHRvIHJlZHVjZSB0aGUgYm9pbGVycGxhdGUgbmVlZGVkIHRvIHRlc3Qgcm91dGVzIGFuZCByb3V0ZWRcbiAqIGNvbXBvbmVudHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgUm91dGVyVGVzdGluZ0hhcm5lc3Mge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIGBSb3V0ZXJUZXN0aW5nSGFybmVzc2AgaW5zdGFuY2UuXG4gICAqXG4gICAqIFRoZSBgUm91dGVyVGVzdGluZ0hhcm5lc3NgIGFsc28gY3JlYXRlcyBpdHMgb3duIHJvb3QgY29tcG9uZW50IHdpdGggYSBgUm91dGVyT3V0bGV0YCBmb3IgdGhlXG4gICAqIHB1cnBvc2VzIG9mIHJlbmRlcmluZyByb3V0ZSBjb21wb25lbnRzLlxuICAgKlxuICAgKiBUaHJvd3MgYW4gZXJyb3IgaWYgYW4gaW5zdGFuY2UgaGFzIGFscmVhZHkgYmVlbiBjcmVhdGVkLlxuICAgKiBVc2Ugb2YgdGhpcyBoYXJuZXNzIGFsc28gcmVxdWlyZXMgYGRlc3Ryb3lBZnRlckVhY2g6IHRydWVgIGluIHRoZSBgTW9kdWxlVGVhcmRvd25PcHRpb25zYFxuICAgKlxuICAgKiBAcGFyYW0gaW5pdGlhbFVybCBUaGUgdGFyZ2V0IG9mIG5hdmlnYXRpb24gdG8gdHJpZ2dlciBiZWZvcmUgcmV0dXJuaW5nIHRoZSBoYXJuZXNzLlxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGNyZWF0ZShpbml0aWFsVXJsPzogc3RyaW5nKTogUHJvbWlzZTxSb3V0ZXJUZXN0aW5nSGFybmVzcz4ge1xuICAgIGNvbnN0IGhhcm5lc3MgPSBUZXN0QmVkLmluamVjdChSb290Rml4dHVyZVNlcnZpY2UpLmNyZWF0ZUhhcm5lc3MoKTtcbiAgICBpZiAoaW5pdGlhbFVybCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCBoYXJuZXNzLm5hdmlnYXRlQnlVcmwoaW5pdGlhbFVybCk7XG4gICAgfVxuICAgIHJldHVybiBoYXJuZXNzO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpeHR1cmUgb2YgdGhlIHJvb3QgY29tcG9uZW50IG9mIHRoZSBSb3V0ZXJUZXN0aW5nSGFybmVzc1xuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGZpeHR1cmU6IENvbXBvbmVudEZpeHR1cmU8dW5rbm93bj47XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBjb25zdHJ1Y3RvcihmaXh0dXJlOiBDb21wb25lbnRGaXh0dXJlPHVua25vd24+KSB7XG4gICAgdGhpcy5maXh0dXJlID0gZml4dHVyZTtcbiAgfVxuXG4gIC8qKiBJbnN0cnVjdHMgdGhlIHJvb3QgZml4dHVyZSB0byBydW4gY2hhbmdlIGRldGVjdGlvbi4gKi9cbiAgZGV0ZWN0Q2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLmZpeHR1cmUuZGV0ZWN0Q2hhbmdlcygpO1xuICB9XG4gIC8qKiBUaGUgYERlYnVnRWxlbWVudGAgb2YgdGhlIGBSb3V0ZXJPdXRsZXRgIGNvbXBvbmVudC4gYG51bGxgIGlmIHRoZSBvdXRsZXQgaXMgbm90IGFjdGl2YXRlZC4gKi9cbiAgZ2V0IHJvdXRlRGVidWdFbGVtZW50KCk6IERlYnVnRWxlbWVudCB8IG51bGwge1xuICAgIGNvbnN0IG91dGxldCA9ICh0aGlzLmZpeHR1cmUuY29tcG9uZW50SW5zdGFuY2UgYXMgUm9vdENtcCkub3V0bGV0O1xuICAgIGlmICghb3V0bGV0IHx8ICFvdXRsZXQuaXNBY3RpdmF0ZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maXh0dXJlLmRlYnVnRWxlbWVudC5xdWVyeSgodikgPT4gdi5jb21wb25lbnRJbnN0YW5jZSA9PT0gb3V0bGV0LmNvbXBvbmVudCk7XG4gIH1cbiAgLyoqIFRoZSBuYXRpdmUgZWxlbWVudCBvZiB0aGUgYFJvdXRlck91dGxldGAgY29tcG9uZW50LiBgbnVsbGAgaWYgdGhlIG91dGxldCBpcyBub3QgYWN0aXZhdGVkLiAqL1xuICBnZXQgcm91dGVOYXRpdmVFbGVtZW50KCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucm91dGVEZWJ1Z0VsZW1lbnQ/Lm5hdGl2ZUVsZW1lbnQgPz8gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIGBSb3V0ZXJgIG5hdmlnYXRpb24gYW5kIHdhaXRzIGZvciBpdCB0byBjb21wbGV0ZS5cbiAgICpcbiAgICogVGhlIHJvb3QgY29tcG9uZW50IHdpdGggYSBgUm91dGVyT3V0bGV0YCBjcmVhdGVkIGZvciB0aGUgaGFybmVzcyBpcyB1c2VkIHRvIHJlbmRlciBgUm91dGVgXG4gICAqIGNvbXBvbmVudHMuIFRoZSByb290IGNvbXBvbmVudCBpcyByZXVzZWQgd2l0aGluIHRoZSBzYW1lIHRlc3QgaW4gc3Vic2VxdWVudCBjYWxscyB0b1xuICAgKiBgbmF2aWdhdGVGb3JUZXN0YC5cbiAgICpcbiAgICogV2hlbiB0ZXN0aW5nIGBSb3V0ZXNgIHdpdGggYSBndWFyZHMgdGhhdCByZWplY3QgdGhlIG5hdmlnYXRpb24sIHRoZSBgUm91dGVyT3V0bGV0YCBtaWdodCBub3QgYmVcbiAgICogYWN0aXZhdGVkIGFuZCB0aGUgYGFjdGl2YXRlZENvbXBvbmVudGAgbWF5IGJlIGBudWxsYC5cbiAgICpcbiAgICoge0BleGFtcGxlIHJvdXRlci90ZXN0aW5nL3Rlc3Qvcm91dGVyX3Rlc3RpbmdfaGFybmVzc19leGFtcGxlcy5zcGVjLnRzIHJlZ2lvbj0nR3VhcmQnfVxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFRoZSB0YXJnZXQgb2YgdGhlIG5hdmlnYXRpb24uIFBhc3NlZCB0byBgUm91dGVyLm5hdmlnYXRlQnlVcmxgLlxuICAgKiBAcmV0dXJucyBUaGUgYWN0aXZhdGVkIGNvbXBvbmVudCBpbnN0YW5jZSBvZiB0aGUgYFJvdXRlck91dGxldGAgYWZ0ZXIgbmF2aWdhdGlvbiBjb21wbGV0ZXNcbiAgICogICAgIChgbnVsbGAgaWYgdGhlIG91dGxldCBkb2VzIG5vdCBnZXQgYWN0aXZhdGVkKS5cbiAgICovXG4gIGFzeW5jIG5hdmlnYXRlQnlVcmwodXJsOiBzdHJpbmcpOiBQcm9taXNlPG51bGwgfCB7fT47XG4gIC8qKlxuICAgKiBUcmlnZ2VycyBhIHJvdXRlciBuYXZpZ2F0aW9uIGFuZCB3YWl0cyBmb3IgaXQgdG8gY29tcGxldGUuXG4gICAqXG4gICAqIFRoZSByb290IGNvbXBvbmVudCB3aXRoIGEgYFJvdXRlck91dGxldGAgY3JlYXRlZCBmb3IgdGhlIGhhcm5lc3MgaXMgdXNlZCB0byByZW5kZXIgYFJvdXRlYFxuICAgKiBjb21wb25lbnRzLlxuICAgKlxuICAgKiB7QGV4YW1wbGUgcm91dGVyL3Rlc3RpbmcvdGVzdC9yb3V0ZXJfdGVzdGluZ19oYXJuZXNzX2V4YW1wbGVzLnNwZWMudHMgcmVnaW9uPSdSb3V0ZWRDb21wb25lbnQnfVxuICAgKlxuICAgKiBUaGUgcm9vdCBjb21wb25lbnQgaXMgcmV1c2VkIHdpdGhpbiB0aGUgc2FtZSB0ZXN0IGluIHN1YnNlcXVlbnQgY2FsbHMgdG8gYG5hdmlnYXRlQnlVcmxgLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGFsc28gbWFrZXMgaXQgZWFzaWVyIHRvIHRlc3QgY29tcG9uZW50cyB0aGF0IGRlcGVuZCBvbiBgQWN0aXZhdGVkUm91dGVgIGRhdGEuXG4gICAqXG4gICAqIHtAZXhhbXBsZSByb3V0ZXIvdGVzdGluZy90ZXN0L3JvdXRlcl90ZXN0aW5nX2hhcm5lc3NfZXhhbXBsZXMuc3BlYy50cyByZWdpb249J0FjdGl2YXRlZFJvdXRlJ31cbiAgICpcbiAgICogQHBhcmFtIHVybCBUaGUgdGFyZ2V0IG9mIHRoZSBuYXZpZ2F0aW9uLiBQYXNzZWQgdG8gYFJvdXRlci5uYXZpZ2F0ZUJ5VXJsYC5cbiAgICogQHBhcmFtIHJlcXVpcmVkUm91dGVkQ29tcG9uZW50VHlwZSBBZnRlciBuYXZpZ2F0aW9uIGNvbXBsZXRlcywgdGhlIHJlcXVpcmVkIHR5cGUgZm9yIHRoZVxuICAgKiAgICAgYWN0aXZhdGVkIGNvbXBvbmVudCBvZiB0aGUgYFJvdXRlck91dGxldGAuIElmIHRoZSBvdXRsZXQgaXMgbm90IGFjdGl2YXRlZCBvciBhIGRpZmZlcmVudFxuICAgKiAgICAgY29tcG9uZW50IGlzIGFjdGl2YXRlZCwgdGhpcyBmdW5jdGlvbiB3aWxsIHRocm93IGFuIGVycm9yLlxuICAgKiBAcmV0dXJucyBUaGUgYWN0aXZhdGVkIGNvbXBvbmVudCBpbnN0YW5jZSBvZiB0aGUgYFJvdXRlck91dGxldGAgYWZ0ZXIgbmF2aWdhdGlvbiBjb21wbGV0ZXMuXG4gICAqL1xuICBhc3luYyBuYXZpZ2F0ZUJ5VXJsPFQ+KHVybDogc3RyaW5nLCByZXF1aXJlZFJvdXRlZENvbXBvbmVudFR5cGU6IFR5cGU8VD4pOiBQcm9taXNlPFQ+O1xuICBhc3luYyBuYXZpZ2F0ZUJ5VXJsPFQ+KHVybDogc3RyaW5nLCByZXF1aXJlZFJvdXRlZENvbXBvbmVudFR5cGU/OiBUeXBlPFQ+KTogUHJvbWlzZTxUIHwgbnVsbD4ge1xuICAgIGNvbnN0IHJvdXRlciA9IFRlc3RCZWQuaW5qZWN0KFJvdXRlcik7XG4gICAgbGV0IHJlc29sdmVGbiE6ICgpID0+IHZvaWQ7XG4gICAgY29uc3QgcmVkaXJlY3RUcmFja2luZ1Byb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgcmVzb2x2ZUZuID0gcmVzb2x2ZTtcbiAgICB9KTtcbiAgICBhZnRlck5leHROYXZpZ2F0aW9uKFRlc3RCZWQuaW5qZWN0KFJvdXRlciksIHJlc29sdmVGbik7XG4gICAgYXdhaXQgcm91dGVyLm5hdmlnYXRlQnlVcmwodXJsKTtcbiAgICBhd2FpdCByZWRpcmVjdFRyYWNraW5nUHJvbWlzZTtcbiAgICB0aGlzLmZpeHR1cmUuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIGNvbnN0IG91dGxldCA9ICh0aGlzLmZpeHR1cmUuY29tcG9uZW50SW5zdGFuY2UgYXMgUm9vdENtcCkub3V0bGV0O1xuICAgIC8vIFRoZSBvdXRsZXQgbWlnaHQgbm90IGJlIGFjdGl2YXRlZCBpZiB0aGUgdXNlciBpcyB0ZXN0aW5nIGEgbmF2aWdhdGlvbiBmb3IgYSBndWFyZCB0aGF0XG4gICAgLy8gcmVqZWN0c1xuICAgIGlmIChvdXRsZXQgJiYgb3V0bGV0LmlzQWN0aXZhdGVkICYmIG91dGxldC5hY3RpdmF0ZWRSb3V0ZS5jb21wb25lbnQpIHtcbiAgICAgIGNvbnN0IGFjdGl2YXRlZENvbXBvbmVudCA9IG91dGxldC5jb21wb25lbnQ7XG4gICAgICBpZiAoXG4gICAgICAgIHJlcXVpcmVkUm91dGVkQ29tcG9uZW50VHlwZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICEoYWN0aXZhdGVkQ29tcG9uZW50IGluc3RhbmNlb2YgcmVxdWlyZWRSb3V0ZWRDb21wb25lbnRUeXBlKVxuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5leHBlY3RlZCByb3V0ZWQgY29tcG9uZW50IHR5cGUuIEV4cGVjdGVkICR7cmVxdWlyZWRSb3V0ZWRDb21wb25lbnRUeXBlLm5hbWV9IGJ1dCBnb3QgJHthY3RpdmF0ZWRDb21wb25lbnQuY29uc3RydWN0b3IubmFtZX1gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFjdGl2YXRlZENvbXBvbmVudCBhcyBUO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocmVxdWlyZWRSb3V0ZWRDb21wb25lbnRUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmV4cGVjdGVkIHJvdXRlZCBjb21wb25lbnQgdHlwZS4gRXhwZWN0ZWQgJHtyZXF1aXJlZFJvdXRlZENvbXBvbmVudFR5cGUubmFtZX0gYnV0IHRoZSBuYXZpZ2F0aW9uIGRpZCBub3QgYWN0aXZhdGUgYW55IGNvbXBvbmVudC5gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=