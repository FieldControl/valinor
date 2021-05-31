/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
/** Harness for interacting with a standard mat-progress-bar in tests. */
export class MatProgressBarHarness extends ComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatProgressBarHarness` that meets
     * certain criteria.
     * @param options Options for filtering which progress bar instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatProgressBarHarness, options);
    }
    /** Gets the progress bar's value. */
    getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            const ariaValue = yield host.getAttribute('aria-valuenow');
            return ariaValue ? coerceNumberProperty(ariaValue) : null;
        });
    }
    /** Gets the progress bar's mode. */
    getMode() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getAttribute('mode');
        });
    }
}
/** The selector for the host element of a `MatProgressBar` instance. */
MatProgressBarHarness.hostSelector = '.mat-progress-bar';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MtYmFyLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvcHJvZ3Jlc3MtYmFyL3Rlc3RpbmcvcHJvZ3Jlc3MtYmFyLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzNELE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBR3hFLHlFQUF5RTtBQUN6RSxNQUFNLE9BQU8scUJBQXNCLFNBQVEsZ0JBQWdCO0lBSXpEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFxQyxFQUFFO1FBQ2pELE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxxQkFBcUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQscUNBQXFDO0lBQy9CLFFBQVE7O1lBQ1osTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDL0IsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzNELE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzVELENBQUM7S0FBQTtJQUVELG9DQUFvQztJQUM5QixPQUFPOztZQUNYLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRCxDQUFDO0tBQUE7O0FBdkJELHdFQUF3RTtBQUNqRSxrQ0FBWSxHQUFHLG1CQUFtQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Y29lcmNlTnVtYmVyUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0NvbXBvbmVudEhhcm5lc3MsIEhhcm5lc3NQcmVkaWNhdGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7UHJvZ3Jlc3NCYXJIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9wcm9ncmVzcy1iYXItaGFybmVzcy1maWx0ZXJzJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBtYXQtcHJvZ3Jlc3MtYmFyIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdFByb2dyZXNzQmFySGFybmVzcyBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdFByb2dyZXNzQmFyYCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LXByb2dyZXNzLWJhcic7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYE1hdFByb2dyZXNzQmFySGFybmVzc2AgdGhhdCBtZWV0c1xuICAgKiBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggcHJvZ3Jlc3MgYmFyIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IFByb2dyZXNzQmFySGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0UHJvZ3Jlc3NCYXJIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdFByb2dyZXNzQmFySGFybmVzcywgb3B0aW9ucyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgcHJvZ3Jlc3MgYmFyJ3MgdmFsdWUuICovXG4gIGFzeW5jIGdldFZhbHVlKCk6IFByb21pc2U8bnVtYmVyfG51bGw+IHtcbiAgICBjb25zdCBob3N0ID0gYXdhaXQgdGhpcy5ob3N0KCk7XG4gICAgY29uc3QgYXJpYVZhbHVlID0gYXdhaXQgaG9zdC5nZXRBdHRyaWJ1dGUoJ2FyaWEtdmFsdWVub3cnKTtcbiAgICByZXR1cm4gYXJpYVZhbHVlID8gY29lcmNlTnVtYmVyUHJvcGVydHkoYXJpYVZhbHVlKSA6IG51bGw7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgcHJvZ3Jlc3MgYmFyJ3MgbW9kZS4gKi9cbiAgYXN5bmMgZ2V0TW9kZSgpOiBQcm9taXNlPHN0cmluZ3xudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0QXR0cmlidXRlKCdtb2RlJyk7XG4gIH1cbn1cbiJdfQ==