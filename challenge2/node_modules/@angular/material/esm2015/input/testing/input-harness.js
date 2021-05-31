/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { HarnessPredicate, parallel } from '@angular/cdk/testing';
import { MatFormFieldControlHarness } from '@angular/material/form-field/testing/control';
/** Harness for interacting with a standard Material inputs in tests. */
export class MatInputHarness extends MatFormFieldControlHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatInputHarness` that meets
     * certain criteria.
     * @param options Options for filtering which input instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatInputHarness, options)
            .addOption('value', options.value, (harness, value) => {
            return HarnessPredicate.stringMatches(harness.getValue(), value);
        })
            .addOption('placeholder', options.placeholder, (harness, placeholder) => {
            return HarnessPredicate.stringMatches(harness.getPlaceholder(), placeholder);
        });
    }
    /** Whether the input is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getProperty('disabled');
        });
    }
    /** Whether the input is required. */
    isRequired() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getProperty('required');
        });
    }
    /** Whether the input is readonly. */
    isReadonly() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getProperty('readOnly');
        });
    }
    /** Gets the value of the input. */
    getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            // The "value" property of the native input is never undefined.
            return (yield (yield this.host()).getProperty('value'));
        });
    }
    /** Gets the name of the input. */
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            // The "name" property of the native input is never undefined.
            return (yield (yield this.host()).getProperty('name'));
        });
    }
    /**
     * Gets the type of the input. Returns "textarea" if the input is
     * a textarea.
     */
    getType() {
        return __awaiter(this, void 0, void 0, function* () {
            // The "type" property of the native input is never undefined.
            return (yield (yield this.host()).getProperty('type'));
        });
    }
    /** Gets the placeholder of the input. */
    getPlaceholder() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            const [nativePlaceholder, fallback] = yield parallel(() => [
                host.getProperty('placeholder'),
                host.getAttribute('data-placeholder')
            ]);
            return nativePlaceholder || fallback || '';
        });
    }
    /** Gets the id of the input. */
    getId() {
        return __awaiter(this, void 0, void 0, function* () {
            // The input directive always assigns a unique id to the input in
            // case no id has been explicitly specified.
            return (yield (yield this.host()).getProperty('id'));
        });
    }
    /**
     * Focuses the input and returns a promise that indicates when the
     * action is complete.
     */
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).focus();
        });
    }
    /**
     * Blurs the input and returns a promise that indicates when the
     * action is complete.
     */
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).blur();
        });
    }
    /** Whether the input is focused. */
    isFocused() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).isFocused();
        });
    }
    /**
     * Sets the value of the input. The value will be set by simulating
     * keypresses that correspond to the given value.
     */
    setValue(newValue) {
        return __awaiter(this, void 0, void 0, function* () {
            const inputEl = yield this.host();
            yield inputEl.clear();
            // We don't want to send keys for the value if the value is an empty
            // string in order to clear the value. Sending keys with an empty string
            // still results in unnecessary focus events.
            if (newValue) {
                yield inputEl.sendKeys(newValue);
            }
            // Some input types won't respond to key presses (e.g. `color`) so to be sure that the
            // value is set, we also set the property after the keyboard sequence. Note that we don't
            // want to do it before, because it can cause the value to be entered twice.
            yield inputEl.setInputValue(newValue);
        });
    }
}
// TODO: We do not want to handle `select` elements with `matNativeControl` because
// not all methods of this harness work reasonably for native select elements.
// For more details. See: https://github.com/angular/components/pull/18221.
MatInputHarness.hostSelector = '[matInput], input[matNativeControl], textarea[matNativeControl]';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9pbnB1dC90ZXN0aW5nL2lucHV0LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxRQUFRLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNoRSxPQUFPLEVBQUMsMEJBQTBCLEVBQUMsTUFBTSw4Q0FBOEMsQ0FBQztBQUd4Rix3RUFBd0U7QUFDeEUsTUFBTSxPQUFPLGVBQWdCLFNBQVEsMEJBQTBCO0lBTTdEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUErQixFQUFFO1FBQzNDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDO2FBQ2hELFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUNwRCxPQUFPLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkUsQ0FBQyxDQUFDO2FBQ0QsU0FBUyxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxFQUFFO1lBQ3RFLE9BQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMvRSxDQUFDLENBQUMsQ0FBQztJQUNULENBQUM7SUFFRCxxQ0FBcUM7SUFDL0IsVUFBVTs7WUFDZCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFFLENBQUM7UUFDdEQsQ0FBQztLQUFBO0lBRUQscUNBQXFDO0lBQy9CLFVBQVU7O1lBQ2QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBRSxDQUFDO1FBQ3RELENBQUM7S0FBQTtJQUVELHFDQUFxQztJQUMvQixVQUFVOztZQUNkLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUUsQ0FBQztRQUN0RCxDQUFDO0tBQUE7SUFFRCxtQ0FBbUM7SUFDN0IsUUFBUTs7WUFDWiwrREFBK0Q7WUFDL0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBRSxDQUFDO1FBQzNELENBQUM7S0FBQTtJQUVELGtDQUFrQztJQUM1QixPQUFPOztZQUNYLDhEQUE4RDtZQUM5RCxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFFLENBQUM7UUFDMUQsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ0csT0FBTzs7WUFDWCw4REFBOEQ7WUFDOUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBRSxDQUFDO1FBQzFELENBQUM7S0FBQTtJQUVELHlDQUF5QztJQUNuQyxjQUFjOztZQUNsQixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMvQixNQUFNLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLEdBQUcsTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDO2dCQUMvQixJQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDO2FBQ3RDLENBQUMsQ0FBQztZQUNILE9BQU8saUJBQWlCLElBQUksUUFBUSxJQUFJLEVBQUUsQ0FBQztRQUM3QyxDQUFDO0tBQUE7SUFFRCxnQ0FBZ0M7SUFDMUIsS0FBSzs7WUFDVCxpRUFBaUU7WUFDakUsNENBQTRDO1lBQzVDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUUsQ0FBQztRQUN4RCxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDRyxLQUFLOztZQUNULE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JDLENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNHLElBQUk7O1lBQ1IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEMsQ0FBQztLQUFBO0lBRUQsb0NBQW9DO0lBQzlCLFNBQVM7O1lBQ2IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDekMsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ0csUUFBUSxDQUFDLFFBQWdCOztZQUM3QixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNsQyxNQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN0QixvRUFBb0U7WUFDcEUsd0VBQXdFO1lBQ3hFLDZDQUE2QztZQUM3QyxJQUFJLFFBQVEsRUFBRTtnQkFDWixNQUFNLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbEM7WUFFRCxzRkFBc0Y7WUFDdEYseUZBQXlGO1lBQ3pGLDRFQUE0RTtZQUM1RSxNQUFNLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEMsQ0FBQztLQUFBOztBQWpIRCxtRkFBbUY7QUFDbkYsOEVBQThFO0FBQzlFLDJFQUEyRTtBQUNwRSw0QkFBWSxHQUFHLGlFQUFpRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SGFybmVzc1ByZWRpY2F0ZSwgcGFyYWxsZWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7TWF0Rm9ybUZpZWxkQ29udHJvbEhhcm5lc3N9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2Zvcm0tZmllbGQvdGVzdGluZy9jb250cm9sJztcbmltcG9ydCB7SW5wdXRIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9pbnB1dC1oYXJuZXNzLWZpbHRlcnMnO1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIE1hdGVyaWFsIGlucHV0cyBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRJbnB1dEhhcm5lc3MgZXh0ZW5kcyBNYXRGb3JtRmllbGRDb250cm9sSGFybmVzcyB7XG4gIC8vIFRPRE86IFdlIGRvIG5vdCB3YW50IHRvIGhhbmRsZSBgc2VsZWN0YCBlbGVtZW50cyB3aXRoIGBtYXROYXRpdmVDb250cm9sYCBiZWNhdXNlXG4gIC8vIG5vdCBhbGwgbWV0aG9kcyBvZiB0aGlzIGhhcm5lc3Mgd29yayByZWFzb25hYmx5IGZvciBuYXRpdmUgc2VsZWN0IGVsZW1lbnRzLlxuICAvLyBGb3IgbW9yZSBkZXRhaWxzLiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xODIyMS5cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICdbbWF0SW5wdXRdLCBpbnB1dFttYXROYXRpdmVDb250cm9sXSwgdGV4dGFyZWFbbWF0TmF0aXZlQ29udHJvbF0nO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRJbnB1dEhhcm5lc3NgIHRoYXQgbWVldHNcbiAgICogY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGlucHV0IGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IElucHV0SGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0SW5wdXRIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdElucHV0SGFybmVzcywgb3B0aW9ucylcbiAgICAgICAgLmFkZE9wdGlvbigndmFsdWUnLCBvcHRpb25zLnZhbHVlLCAoaGFybmVzcywgdmFsdWUpID0+IHtcbiAgICAgICAgICByZXR1cm4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VmFsdWUoKSwgdmFsdWUpO1xuICAgICAgICB9KVxuICAgICAgICAuYWRkT3B0aW9uKCdwbGFjZWhvbGRlcicsIG9wdGlvbnMucGxhY2Vob2xkZXIsIChoYXJuZXNzLCBwbGFjZWhvbGRlcikgPT4ge1xuICAgICAgICAgIHJldHVybiBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoaGFybmVzcy5nZXRQbGFjZWhvbGRlcigpLCBwbGFjZWhvbGRlcik7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGlucHV0IGlzIGRpc2FibGVkLiAqL1xuICBhc3luYyBpc0Rpc2FibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldFByb3BlcnR5KCdkaXNhYmxlZCcpITtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBpbnB1dCBpcyByZXF1aXJlZC4gKi9cbiAgYXN5bmMgaXNSZXF1aXJlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRQcm9wZXJ0eSgncmVxdWlyZWQnKSE7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgaW5wdXQgaXMgcmVhZG9ubHkuICovXG4gIGFzeW5jIGlzUmVhZG9ubHkoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHkoJ3JlYWRPbmx5JykhO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHZhbHVlIG9mIHRoZSBpbnB1dC4gKi9cbiAgYXN5bmMgZ2V0VmFsdWUoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAvLyBUaGUgXCJ2YWx1ZVwiIHByb3BlcnR5IG9mIHRoZSBuYXRpdmUgaW5wdXQgaXMgbmV2ZXIgdW5kZWZpbmVkLlxuICAgIHJldHVybiAoYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRQcm9wZXJ0eSgndmFsdWUnKSkhO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG5hbWUgb2YgdGhlIGlucHV0LiAqL1xuICBhc3luYyBnZXROYW1lKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgLy8gVGhlIFwibmFtZVwiIHByb3BlcnR5IG9mIHRoZSBuYXRpdmUgaW5wdXQgaXMgbmV2ZXIgdW5kZWZpbmVkLlxuICAgIHJldHVybiAoYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRQcm9wZXJ0eSgnbmFtZScpKSE7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdHlwZSBvZiB0aGUgaW5wdXQuIFJldHVybnMgXCJ0ZXh0YXJlYVwiIGlmIHRoZSBpbnB1dCBpc1xuICAgKiBhIHRleHRhcmVhLlxuICAgKi9cbiAgYXN5bmMgZ2V0VHlwZSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIC8vIFRoZSBcInR5cGVcIiBwcm9wZXJ0eSBvZiB0aGUgbmF0aXZlIGlucHV0IGlzIG5ldmVyIHVuZGVmaW5lZC5cbiAgICByZXR1cm4gKGF3YWl0IChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHkoJ3R5cGUnKSkhO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHBsYWNlaG9sZGVyIG9mIHRoZSBpbnB1dC4gKi9cbiAgYXN5bmMgZ2V0UGxhY2Vob2xkZXIoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBob3N0ID0gYXdhaXQgdGhpcy5ob3N0KCk7XG4gICAgY29uc3QgW25hdGl2ZVBsYWNlaG9sZGVyLCBmYWxsYmFja10gPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiBbXG4gICAgICBob3N0LmdldFByb3BlcnR5KCdwbGFjZWhvbGRlcicpLFxuICAgICAgaG9zdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGxhY2Vob2xkZXInKVxuICAgIF0pO1xuICAgIHJldHVybiBuYXRpdmVQbGFjZWhvbGRlciB8fCBmYWxsYmFjayB8fCAnJztcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBpZCBvZiB0aGUgaW5wdXQuICovXG4gIGFzeW5jIGdldElkKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgLy8gVGhlIGlucHV0IGRpcmVjdGl2ZSBhbHdheXMgYXNzaWducyBhIHVuaXF1ZSBpZCB0byB0aGUgaW5wdXQgaW5cbiAgICAvLyBjYXNlIG5vIGlkIGhhcyBiZWVuIGV4cGxpY2l0bHkgc3BlY2lmaWVkLlxuICAgIHJldHVybiAoYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRQcm9wZXJ0eSgnaWQnKSkhO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvY3VzZXMgdGhlIGlucHV0IGFuZCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGluZGljYXRlcyB3aGVuIHRoZVxuICAgKiBhY3Rpb24gaXMgY29tcGxldGUuXG4gICAqL1xuICBhc3luYyBmb2N1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5mb2N1cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJsdXJzIHRoZSBpbnB1dCBhbmQgcmV0dXJucyBhIHByb21pc2UgdGhhdCBpbmRpY2F0ZXMgd2hlbiB0aGVcbiAgICogYWN0aW9uIGlzIGNvbXBsZXRlLlxuICAgKi9cbiAgYXN5bmMgYmx1cigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5ibHVyKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgaW5wdXQgaXMgZm9jdXNlZC4gKi9cbiAgYXN5bmMgaXNGb2N1c2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmlzRm9jdXNlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHZhbHVlIG9mIHRoZSBpbnB1dC4gVGhlIHZhbHVlIHdpbGwgYmUgc2V0IGJ5IHNpbXVsYXRpbmdcbiAgICoga2V5cHJlc3NlcyB0aGF0IGNvcnJlc3BvbmQgdG8gdGhlIGdpdmVuIHZhbHVlLlxuICAgKi9cbiAgYXN5bmMgc2V0VmFsdWUobmV3VmFsdWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGlucHV0RWwgPSBhd2FpdCB0aGlzLmhvc3QoKTtcbiAgICBhd2FpdCBpbnB1dEVsLmNsZWFyKCk7XG4gICAgLy8gV2UgZG9uJ3Qgd2FudCB0byBzZW5kIGtleXMgZm9yIHRoZSB2YWx1ZSBpZiB0aGUgdmFsdWUgaXMgYW4gZW1wdHlcbiAgICAvLyBzdHJpbmcgaW4gb3JkZXIgdG8gY2xlYXIgdGhlIHZhbHVlLiBTZW5kaW5nIGtleXMgd2l0aCBhbiBlbXB0eSBzdHJpbmdcbiAgICAvLyBzdGlsbCByZXN1bHRzIGluIHVubmVjZXNzYXJ5IGZvY3VzIGV2ZW50cy5cbiAgICBpZiAobmV3VmFsdWUpIHtcbiAgICAgIGF3YWl0IGlucHV0RWwuc2VuZEtleXMobmV3VmFsdWUpO1xuICAgIH1cblxuICAgIC8vIFNvbWUgaW5wdXQgdHlwZXMgd29uJ3QgcmVzcG9uZCB0byBrZXkgcHJlc3NlcyAoZS5nLiBgY29sb3JgKSBzbyB0byBiZSBzdXJlIHRoYXQgdGhlXG4gICAgLy8gdmFsdWUgaXMgc2V0LCB3ZSBhbHNvIHNldCB0aGUgcHJvcGVydHkgYWZ0ZXIgdGhlIGtleWJvYXJkIHNlcXVlbmNlLiBOb3RlIHRoYXQgd2UgZG9uJ3RcbiAgICAvLyB3YW50IHRvIGRvIGl0IGJlZm9yZSwgYmVjYXVzZSBpdCBjYW4gY2F1c2UgdGhlIHZhbHVlIHRvIGJlIGVudGVyZWQgdHdpY2UuXG4gICAgYXdhaXQgaW5wdXRFbC5zZXRJbnB1dFZhbHVlKG5ld1ZhbHVlKTtcbiAgfVxufVxuIl19