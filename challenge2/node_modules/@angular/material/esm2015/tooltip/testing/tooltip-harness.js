/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
export class _MatTooltipHarnessBase extends ComponentHarness {
    /** Shows the tooltip. */
    show() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            // We need to dispatch both `touchstart` and a hover event, because the tooltip binds
            // different events depending on the device. The `changedTouches` is there in case the
            // element has ripples.
            // @breaking-change 12.0.0 Remove null assertion from `dispatchEvent`.
            yield ((_a = host.dispatchEvent) === null || _a === void 0 ? void 0 : _a.call(host, 'touchstart', { changedTouches: [] }));
            yield host.hover();
        });
    }
    /** Hides the tooltip. */
    hide() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            // We need to dispatch both `touchstart` and a hover event, because
            // the tooltip binds different events depending on the device.
            // @breaking-change 12.0.0 Remove null assertion from `dispatchEvent`.
            yield ((_a = host.dispatchEvent) === null || _a === void 0 ? void 0 : _a.call(host, 'touchend'));
            yield host.mouseAway();
            yield this.forceStabilize(); // Needed in order to flush the `hide` animation.
        });
    }
    /** Gets whether the tooltip is open. */
    isOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!(yield this._optionalPanel());
        });
    }
    /** Gets a promise for the tooltip panel's text. */
    getTooltipText() {
        return __awaiter(this, void 0, void 0, function* () {
            const panel = yield this._optionalPanel();
            return panel ? panel.text() : '';
        });
    }
}
/** Harness for interacting with a standard mat-tooltip in tests. */
export class MatTooltipHarness extends _MatTooltipHarnessBase {
    constructor() {
        super(...arguments);
        this._optionalPanel = this.documentRootLocatorFactory().locatorForOptional('.mat-tooltip');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search
     * for a tooltip trigger with specific attributes.
     * @param options Options for narrowing the search.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatTooltipHarness, options);
    }
}
MatTooltipHarness.hostSelector = '.mat-tooltip-trigger';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3Rvb2x0aXAvdGVzdGluZy90b29sdGlwLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFFTCxnQkFBZ0IsRUFDaEIsZ0JBQWdCLEdBRWpCLE1BQU0sc0JBQXNCLENBQUM7QUFHOUIsTUFBTSxPQUFnQixzQkFBdUIsU0FBUSxnQkFBZ0I7SUFHbkUseUJBQXlCO0lBQ25CLElBQUk7OztZQUNSLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRS9CLHFGQUFxRjtZQUNyRixzRkFBc0Y7WUFDdEYsdUJBQXVCO1lBQ3ZCLHNFQUFzRTtZQUN0RSxNQUFNLENBQUEsTUFBQSxJQUFJLENBQUMsYUFBYSwrQ0FBbEIsSUFBSSxFQUFpQixZQUFZLEVBQUUsRUFBQyxjQUFjLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQSxDQUFDO1lBQy9ELE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztLQUNwQjtJQUVELHlCQUF5QjtJQUNuQixJQUFJOzs7WUFDUixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUUvQixtRUFBbUU7WUFDbkUsOERBQThEO1lBQzlELHNFQUFzRTtZQUN0RSxNQUFNLENBQUEsTUFBQSxJQUFJLENBQUMsYUFBYSwrQ0FBbEIsSUFBSSxFQUFpQixVQUFVLENBQUMsQ0FBQSxDQUFDO1lBQ3ZDLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsaURBQWlEOztLQUMvRTtJQUVELHdDQUF3QztJQUNsQyxNQUFNOztZQUNWLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQUE7SUFFRCxtREFBbUQ7SUFDN0MsY0FBYzs7WUFDbEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDMUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ25DLENBQUM7S0FBQTtDQUNGO0FBRUQsb0VBQW9FO0FBQ3BFLE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxzQkFBc0I7SUFBN0Q7O1FBQ1ksbUJBQWMsR0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQVlsRyxDQUFDO0lBVEM7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQWlDLEVBQUU7UUFDN0MsT0FBTyxJQUFJLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzFELENBQUM7O0FBVk0sOEJBQVksR0FBRyxzQkFBc0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBBc3luY0ZhY3RvcnlGbixcbiAgQ29tcG9uZW50SGFybmVzcyxcbiAgSGFybmVzc1ByZWRpY2F0ZSxcbiAgVGVzdEVsZW1lbnQsXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7VG9vbHRpcEhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL3Rvb2x0aXAtaGFybmVzcy1maWx0ZXJzJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIF9NYXRUb29sdGlwSGFybmVzc0Jhc2UgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzIHtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9vcHRpb25hbFBhbmVsOiBBc3luY0ZhY3RvcnlGbjxUZXN0RWxlbWVudCB8IG51bGw+O1xuXG4gIC8qKiBTaG93cyB0aGUgdG9vbHRpcC4gKi9cbiAgYXN5bmMgc2hvdygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBob3N0ID0gYXdhaXQgdGhpcy5ob3N0KCk7XG5cbiAgICAvLyBXZSBuZWVkIHRvIGRpc3BhdGNoIGJvdGggYHRvdWNoc3RhcnRgIGFuZCBhIGhvdmVyIGV2ZW50LCBiZWNhdXNlIHRoZSB0b29sdGlwIGJpbmRzXG4gICAgLy8gZGlmZmVyZW50IGV2ZW50cyBkZXBlbmRpbmcgb24gdGhlIGRldmljZS4gVGhlIGBjaGFuZ2VkVG91Y2hlc2AgaXMgdGhlcmUgaW4gY2FzZSB0aGVcbiAgICAvLyBlbGVtZW50IGhhcyByaXBwbGVzLlxuICAgIC8vIEBicmVha2luZy1jaGFuZ2UgMTIuMC4wIFJlbW92ZSBudWxsIGFzc2VydGlvbiBmcm9tIGBkaXNwYXRjaEV2ZW50YC5cbiAgICBhd2FpdCBob3N0LmRpc3BhdGNoRXZlbnQ/LigndG91Y2hzdGFydCcsIHtjaGFuZ2VkVG91Y2hlczogW119KTtcbiAgICBhd2FpdCBob3N0LmhvdmVyKCk7XG4gIH1cblxuICAvKiogSGlkZXMgdGhlIHRvb2x0aXAuICovXG4gIGFzeW5jIGhpZGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgaG9zdCA9IGF3YWl0IHRoaXMuaG9zdCgpO1xuXG4gICAgLy8gV2UgbmVlZCB0byBkaXNwYXRjaCBib3RoIGB0b3VjaHN0YXJ0YCBhbmQgYSBob3ZlciBldmVudCwgYmVjYXVzZVxuICAgIC8vIHRoZSB0b29sdGlwIGJpbmRzIGRpZmZlcmVudCBldmVudHMgZGVwZW5kaW5nIG9uIHRoZSBkZXZpY2UuXG4gICAgLy8gQGJyZWFraW5nLWNoYW5nZSAxMi4wLjAgUmVtb3ZlIG51bGwgYXNzZXJ0aW9uIGZyb20gYGRpc3BhdGNoRXZlbnRgLlxuICAgIGF3YWl0IGhvc3QuZGlzcGF0Y2hFdmVudD8uKCd0b3VjaGVuZCcpO1xuICAgIGF3YWl0IGhvc3QubW91c2VBd2F5KCk7XG4gICAgYXdhaXQgdGhpcy5mb3JjZVN0YWJpbGl6ZSgpOyAvLyBOZWVkZWQgaW4gb3JkZXIgdG8gZmx1c2ggdGhlIGBoaWRlYCBhbmltYXRpb24uXG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSB0b29sdGlwIGlzIG9wZW4uICovXG4gIGFzeW5jIGlzT3BlbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gISEoYXdhaXQgdGhpcy5fb3B0aW9uYWxQYW5lbCgpKTtcbiAgfVxuXG4gIC8qKiBHZXRzIGEgcHJvbWlzZSBmb3IgdGhlIHRvb2x0aXAgcGFuZWwncyB0ZXh0LiAqL1xuICBhc3luYyBnZXRUb29sdGlwVGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHBhbmVsID0gYXdhaXQgdGhpcy5fb3B0aW9uYWxQYW5lbCgpO1xuICAgIHJldHVybiBwYW5lbCA/IHBhbmVsLnRleHQoKSA6ICcnO1xuICB9XG59XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgbWF0LXRvb2x0aXAgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0VG9vbHRpcEhhcm5lc3MgZXh0ZW5kcyBfTWF0VG9vbHRpcEhhcm5lc3NCYXNlIHtcbiAgcHJvdGVjdGVkIF9vcHRpb25hbFBhbmVsID0gdGhpcy5kb2N1bWVudFJvb3RMb2NhdG9yRmFjdG9yeSgpLmxvY2F0b3JGb3JPcHRpb25hbCgnLm1hdC10b29sdGlwJyk7XG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC10b29sdGlwLXRyaWdnZXInO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoXG4gICAqIGZvciBhIHRvb2x0aXAgdHJpZ2dlciB3aXRoIHNwZWNpZmljIGF0dHJpYnV0ZXMuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIG5hcnJvd2luZyB0aGUgc2VhcmNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IFRvb2x0aXBIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRUb29sdGlwSGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRUb29sdGlwSGFybmVzcywgb3B0aW9ucyk7XG4gIH1cbn1cbiJdfQ==