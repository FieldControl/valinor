/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { HarnessPredicate } from '@angular/cdk/testing';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DatepickerTriggerHarnessBase } from './datepicker-trigger-harness-base';
/** Harness for interacting with a standard Material datepicker toggle in tests. */
export class MatDatepickerToggleHarness extends DatepickerTriggerHarnessBase {
    constructor() {
        super(...arguments);
        /** The clickable button inside the toggle. */
        this._button = this.locatorFor('button');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatDatepickerToggleHarness` that
     * meets certain criteria.
     * @param options Options for filtering which datepicker toggle instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatDatepickerToggleHarness, options);
    }
    /** Gets whether the calendar associated with the toggle is open. */
    isCalendarOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-datepicker-toggle-active');
        });
    }
    /** Whether the toggle is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            const button = yield this._button();
            return coerceBooleanProperty(yield button.getAttribute('disabled'));
        });
    }
    _openCalendar() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._button()).click();
        });
    }
}
MatDatepickerToggleHarness.hostSelector = '.mat-datepicker-toggle';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci10b2dnbGUtaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kYXRlcGlja2VyL3Rlc3RpbmcvZGF0ZXBpY2tlci10b2dnbGUtaGFybmVzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdEQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFNUQsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFHL0UsbUZBQW1GO0FBQ25GLE1BQU0sT0FBTywwQkFBMkIsU0FBUSw0QkFBNEI7SUFBNUU7O1FBR0UsOENBQThDO1FBQ3RDLFlBQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBMkI5QyxDQUFDO0lBekJDOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUEwQyxFQUFFO1FBRXRELE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQywwQkFBMEIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQsb0VBQW9FO0lBQzlELGNBQWM7O1lBQ2xCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7S0FBQTtJQUVELHNDQUFzQztJQUNoQyxVQUFVOztZQUNkLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3BDLE9BQU8scUJBQXFCLENBQUMsTUFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDdEUsQ0FBQztLQUFBO0lBRWUsYUFBYTs7WUFDM0IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDeEMsQ0FBQztLQUFBOztBQTdCTSx1Q0FBWSxHQUFHLHdCQUF3QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SGFybmVzc1ByZWRpY2F0ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge0RhdGVwaWNrZXJUb2dnbGVIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9kYXRlcGlja2VyLWhhcm5lc3MtZmlsdGVycyc7XG5pbXBvcnQge0RhdGVwaWNrZXJUcmlnZ2VySGFybmVzc0Jhc2V9IGZyb20gJy4vZGF0ZXBpY2tlci10cmlnZ2VyLWhhcm5lc3MtYmFzZSc7XG5cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBNYXRlcmlhbCBkYXRlcGlja2VyIHRvZ2dsZSBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXREYXRlcGlja2VyVG9nZ2xlSGFybmVzcyBleHRlbmRzIERhdGVwaWNrZXJUcmlnZ2VySGFybmVzc0Jhc2Uge1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtZGF0ZXBpY2tlci10b2dnbGUnO1xuXG4gIC8qKiBUaGUgY2xpY2thYmxlIGJ1dHRvbiBpbnNpZGUgdGhlIHRvZ2dsZS4gKi9cbiAgcHJpdmF0ZSBfYnV0dG9uID0gdGhpcy5sb2NhdG9yRm9yKCdidXR0b24nKTtcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0RGF0ZXBpY2tlclRvZ2dsZUhhcm5lc3NgIHRoYXRcbiAgICogbWVldHMgY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGRhdGVwaWNrZXIgdG9nZ2xlIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IERhdGVwaWNrZXJUb2dnbGVIYXJuZXNzRmlsdGVycyA9IHt9KTpcbiAgICBIYXJuZXNzUHJlZGljYXRlPE1hdERhdGVwaWNrZXJUb2dnbGVIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdERhdGVwaWNrZXJUb2dnbGVIYXJuZXNzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGNhbGVuZGFyIGFzc29jaWF0ZWQgd2l0aCB0aGUgdG9nZ2xlIGlzIG9wZW4uICovXG4gIGFzeW5jIGlzQ2FsZW5kYXJPcGVuKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCdtYXQtZGF0ZXBpY2tlci10b2dnbGUtYWN0aXZlJyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgdG9nZ2xlIGlzIGRpc2FibGVkLiAqL1xuICBhc3luYyBpc0Rpc2FibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGJ1dHRvbiA9IGF3YWl0IHRoaXMuX2J1dHRvbigpO1xuICAgIHJldHVybiBjb2VyY2VCb29sZWFuUHJvcGVydHkoYXdhaXQgYnV0dG9uLmdldEF0dHJpYnV0ZSgnZGlzYWJsZWQnKSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgX29wZW5DYWxlbmRhcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2J1dHRvbigpKS5jbGljaygpO1xuICB9XG59XG4iXX0=