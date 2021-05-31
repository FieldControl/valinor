/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
/** Harness for interacting with a standard mat-slider in tests. */
export class MatSliderHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._textLabel = this.locatorFor('.mat-slider-thumb-label-text');
        this._wrapper = this.locatorFor('.mat-slider-wrapper');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatSliderHarness` that meets
     * certain criteria.
     * @param options Options for filtering which slider instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatSliderHarness, options);
    }
    /** Gets the slider's id. */
    getId() {
        return __awaiter(this, void 0, void 0, function* () {
            const id = yield (yield this.host()).getAttribute('id');
            // In case no id has been specified, the "id" property always returns
            // an empty string. To make this method more explicit, we return null.
            return id !== '' ? id : null;
        });
    }
    /**
     * Gets the current display value of the slider. Returns a null promise if the thumb label is
     * disabled.
     */
    getDisplayValue() {
        return __awaiter(this, void 0, void 0, function* () {
            const [host, textLabel] = yield parallel(() => [this.host(), this._textLabel()]);
            if (yield host.hasClass('mat-slider-thumb-label-showing')) {
                return textLabel.text();
            }
            return null;
        });
    }
    /** Gets the current percentage value of the slider. */
    getPercentage() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._calculatePercentage(yield this.getValue());
        });
    }
    /** Gets the current value of the slider. */
    getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            return coerceNumberProperty(yield (yield this.host()).getAttribute('aria-valuenow'));
        });
    }
    /** Gets the maximum value of the slider. */
    getMaxValue() {
        return __awaiter(this, void 0, void 0, function* () {
            return coerceNumberProperty(yield (yield this.host()).getAttribute('aria-valuemax'));
        });
    }
    /** Gets the minimum value of the slider. */
    getMinValue() {
        return __awaiter(this, void 0, void 0, function* () {
            return coerceNumberProperty(yield (yield this.host()).getAttribute('aria-valuemin'));
        });
    }
    /** Whether the slider is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            const disabled = (yield this.host()).getAttribute('aria-disabled');
            return coerceBooleanProperty(yield disabled);
        });
    }
    /** Gets the orientation of the slider. */
    getOrientation() {
        return __awaiter(this, void 0, void 0, function* () {
            // "aria-orientation" will always be set to either "horizontal" or "vertical".
            return (yield this.host()).getAttribute('aria-orientation');
        });
    }
    /**
     * Sets the value of the slider by clicking on the slider track.
     *
     * Note that in rare cases the value cannot be set to the exact specified value. This
     * can happen if not every value of the slider maps to a single pixel that could be
     * clicked using mouse interaction. In such cases consider using the keyboard to
     * select the given value or expand the slider's size for a better user experience.
     */
    setValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const [sliderEl, wrapperEl, orientation] = yield parallel(() => [this.host(), this._wrapper(), this.getOrientation()]);
            let percentage = yield this._calculatePercentage(value);
            const { height, width } = yield wrapperEl.getDimensions();
            const isVertical = orientation === 'vertical';
            // In case the slider is inverted in LTR mode or not inverted in RTL mode,
            // we need to invert the percentage so that the proper value is set.
            if (yield sliderEl.hasClass('mat-slider-invert-mouse-coords')) {
                percentage = 1 - percentage;
            }
            // We need to round the new coordinates because creating fake DOM
            // events will cause the coordinates to be rounded down.
            const relativeX = isVertical ? 0 : Math.round(width * percentage);
            const relativeY = isVertical ? Math.round(height * percentage) : 0;
            yield wrapperEl.click(relativeX, relativeY);
        });
    }
    /** Focuses the slider. */
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).focus();
        });
    }
    /** Blurs the slider. */
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).blur();
        });
    }
    /** Whether the slider is focused. */
    isFocused() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).isFocused();
        });
    }
    /** Calculates the percentage of the given value. */
    _calculatePercentage(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const [min, max] = yield parallel(() => [this.getMinValue(), this.getMaxValue()]);
            return (value - min) / (max - min);
        });
    }
}
/** The selector for the host element of a `MatSlider` instance. */
MatSliderHarness.hostSelector = '.mat-slider';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpZGVyLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2xpZGVyL3Rlc3Rpbmcvc2xpZGVyLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNsRixPQUFPLEVBQUMscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUdsRixtRUFBbUU7QUFDbkUsTUFBTSxPQUFPLGdCQUFpQixTQUFRLGdCQUFnQjtJQUF0RDs7UUFjVSxlQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQzdELGFBQVEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUF1RzVELENBQUM7SUFsSEM7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQWdDLEVBQUU7UUFDNUMsT0FBTyxJQUFJLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFLRCw0QkFBNEI7SUFDdEIsS0FBSzs7WUFDVCxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDeEQscUVBQXFFO1lBQ3JFLHNFQUFzRTtZQUN0RSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQy9CLENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNHLGVBQWU7O1lBQ25CLE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEdBQUcsTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqRixJQUFJLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFFO2dCQUN6RCxPQUFPLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUN6QjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztLQUFBO0lBRUQsdURBQXVEO0lBQ2pELGFBQWE7O1lBQ2pCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDMUQsQ0FBQztLQUFBO0lBRUQsNENBQTRDO0lBQ3RDLFFBQVE7O1lBQ1osT0FBTyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUN2RixDQUFDO0tBQUE7SUFFRCw0Q0FBNEM7SUFDdEMsV0FBVzs7WUFDZixPQUFPLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7S0FBQTtJQUVELDRDQUE0QztJQUN0QyxXQUFXOztZQUNmLE9BQU8sb0JBQW9CLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDdkYsQ0FBQztLQUFBO0lBRUQsc0NBQXNDO0lBQ2hDLFVBQVU7O1lBQ2QsTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNuRSxPQUFPLHFCQUFxQixDQUFDLE1BQU0sUUFBUSxDQUFDLENBQUM7UUFDL0MsQ0FBQztLQUFBO0lBRUQsMENBQTBDO0lBQ3BDLGNBQWM7O1lBQ2xCLDhFQUE4RTtZQUM5RSxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQVEsQ0FBQztRQUNyRSxDQUFDO0tBQUE7SUFFRDs7Ozs7OztPQU9HO0lBQ0csUUFBUSxDQUFDLEtBQWE7O1lBQzFCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxHQUNwQyxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4RCxNQUFNLEVBQUMsTUFBTSxFQUFFLEtBQUssRUFBQyxHQUFHLE1BQU0sU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3hELE1BQU0sVUFBVSxHQUFHLFdBQVcsS0FBSyxVQUFVLENBQUM7WUFFOUMsMEVBQTBFO1lBQzFFLG9FQUFvRTtZQUNwRSxJQUFJLE1BQU0sUUFBUSxDQUFDLFFBQVEsQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFFO2dCQUM3RCxVQUFVLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQzthQUM3QjtZQUVELGlFQUFpRTtZQUNqRSx3REFBd0Q7WUFDeEQsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVuRSxNQUFNLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzlDLENBQUM7S0FBQTtJQUVELDBCQUEwQjtJQUNwQixLQUFLOztZQUNULE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JDLENBQUM7S0FBQTtJQUVELHdCQUF3QjtJQUNsQixJQUFJOztZQUNSLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3BDLENBQUM7S0FBQTtJQUVELHFDQUFxQztJQUMvQixTQUFTOztZQUNiLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3pDLENBQUM7S0FBQTtJQUVELG9EQUFvRDtJQUN0QyxvQkFBb0IsQ0FBQyxLQUFhOztZQUM5QyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEYsT0FBTyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNyQyxDQUFDO0tBQUE7O0FBcEhELG1FQUFtRTtBQUM1RCw2QkFBWSxHQUFHLGFBQWEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEhhcm5lc3MsIEhhcm5lc3NQcmVkaWNhdGUsIHBhcmFsbGVsfSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge2NvZXJjZUJvb2xlYW5Qcm9wZXJ0eSwgY29lcmNlTnVtYmVyUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1NsaWRlckhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL3NsaWRlci1oYXJuZXNzLWZpbHRlcnMnO1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIG1hdC1zbGlkZXIgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0U2xpZGVySGFybmVzcyBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdFNsaWRlcmAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1zbGlkZXInO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRTbGlkZXJIYXJuZXNzYCB0aGF0IG1lZXRzXG4gICAqIGNlcnRhaW4gY3JpdGVyaWEuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBzbGlkZXIgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogU2xpZGVySGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0U2xpZGVySGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRTbGlkZXJIYXJuZXNzLCBvcHRpb25zKTtcbiAgfVxuXG4gIHByaXZhdGUgX3RleHRMYWJlbCA9IHRoaXMubG9jYXRvckZvcignLm1hdC1zbGlkZXItdGh1bWItbGFiZWwtdGV4dCcpO1xuICBwcml2YXRlIF93cmFwcGVyID0gdGhpcy5sb2NhdG9yRm9yKCcubWF0LXNsaWRlci13cmFwcGVyJyk7XG5cbiAgLyoqIEdldHMgdGhlIHNsaWRlcidzIGlkLiAqL1xuICBhc3luYyBnZXRJZCgpOiBQcm9taXNlPHN0cmluZ3xudWxsPiB7XG4gICAgY29uc3QgaWQgPSBhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnaWQnKTtcbiAgICAvLyBJbiBjYXNlIG5vIGlkIGhhcyBiZWVuIHNwZWNpZmllZCwgdGhlIFwiaWRcIiBwcm9wZXJ0eSBhbHdheXMgcmV0dXJuc1xuICAgIC8vIGFuIGVtcHR5IHN0cmluZy4gVG8gbWFrZSB0aGlzIG1ldGhvZCBtb3JlIGV4cGxpY2l0LCB3ZSByZXR1cm4gbnVsbC5cbiAgICByZXR1cm4gaWQgIT09ICcnID8gaWQgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGN1cnJlbnQgZGlzcGxheSB2YWx1ZSBvZiB0aGUgc2xpZGVyLiBSZXR1cm5zIGEgbnVsbCBwcm9taXNlIGlmIHRoZSB0aHVtYiBsYWJlbCBpc1xuICAgKiBkaXNhYmxlZC5cbiAgICovXG4gIGFzeW5jIGdldERpc3BsYXlWYWx1ZSgpOiBQcm9taXNlPHN0cmluZ3xudWxsPiB7XG4gICAgY29uc3QgW2hvc3QsIHRleHRMYWJlbF0gPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiBbdGhpcy5ob3N0KCksIHRoaXMuX3RleHRMYWJlbCgpXSk7XG4gICAgaWYgKGF3YWl0IGhvc3QuaGFzQ2xhc3MoJ21hdC1zbGlkZXItdGh1bWItbGFiZWwtc2hvd2luZycpKSB7XG4gICAgICByZXR1cm4gdGV4dExhYmVsLnRleHQoKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY3VycmVudCBwZXJjZW50YWdlIHZhbHVlIG9mIHRoZSBzbGlkZXIuICovXG4gIGFzeW5jIGdldFBlcmNlbnRhZ2UoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5fY2FsY3VsYXRlUGVyY2VudGFnZShhd2FpdCB0aGlzLmdldFZhbHVlKCkpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIHNsaWRlci4gKi9cbiAgYXN5bmMgZ2V0VmFsdWUoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICByZXR1cm4gY29lcmNlTnVtYmVyUHJvcGVydHkoYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtdmFsdWVub3cnKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbWF4aW11bSB2YWx1ZSBvZiB0aGUgc2xpZGVyLiAqL1xuICBhc3luYyBnZXRNYXhWYWx1ZSgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiBjb2VyY2VOdW1iZXJQcm9wZXJ0eShhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS12YWx1ZW1heCcpKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBtaW5pbXVtIHZhbHVlIG9mIHRoZSBzbGlkZXIuICovXG4gIGFzeW5jIGdldE1pblZhbHVlKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIGNvZXJjZU51bWJlclByb3BlcnR5KGF3YWl0IChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0QXR0cmlidXRlKCdhcmlhLXZhbHVlbWluJykpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHNsaWRlciBpcyBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgaXNEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkaXNhYmxlZCA9IChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0QXR0cmlidXRlKCdhcmlhLWRpc2FibGVkJyk7XG4gICAgcmV0dXJuIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShhd2FpdCBkaXNhYmxlZCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgb3JpZW50YXRpb24gb2YgdGhlIHNsaWRlci4gKi9cbiAgYXN5bmMgZ2V0T3JpZW50YXRpb24oKTogUHJvbWlzZTwnaG9yaXpvbnRhbCd8J3ZlcnRpY2FsJz4ge1xuICAgIC8vIFwiYXJpYS1vcmllbnRhdGlvblwiIHdpbGwgYWx3YXlzIGJlIHNldCB0byBlaXRoZXIgXCJob3Jpem9udGFsXCIgb3IgXCJ2ZXJ0aWNhbFwiLlxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1vcmllbnRhdGlvbicpIGFzIGFueTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiB0aGUgc2xpZGVyIGJ5IGNsaWNraW5nIG9uIHRoZSBzbGlkZXIgdHJhY2suXG4gICAqXG4gICAqIE5vdGUgdGhhdCBpbiByYXJlIGNhc2VzIHRoZSB2YWx1ZSBjYW5ub3QgYmUgc2V0IHRvIHRoZSBleGFjdCBzcGVjaWZpZWQgdmFsdWUuIFRoaXNcbiAgICogY2FuIGhhcHBlbiBpZiBub3QgZXZlcnkgdmFsdWUgb2YgdGhlIHNsaWRlciBtYXBzIHRvIGEgc2luZ2xlIHBpeGVsIHRoYXQgY291bGQgYmVcbiAgICogY2xpY2tlZCB1c2luZyBtb3VzZSBpbnRlcmFjdGlvbi4gSW4gc3VjaCBjYXNlcyBjb25zaWRlciB1c2luZyB0aGUga2V5Ym9hcmQgdG9cbiAgICogc2VsZWN0IHRoZSBnaXZlbiB2YWx1ZSBvciBleHBhbmQgdGhlIHNsaWRlcidzIHNpemUgZm9yIGEgYmV0dGVyIHVzZXIgZXhwZXJpZW5jZS5cbiAgICovXG4gIGFzeW5jIHNldFZhbHVlKHZhbHVlOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBbc2xpZGVyRWwsIHdyYXBwZXJFbCwgb3JpZW50YXRpb25dID1cbiAgICAgICAgYXdhaXQgcGFyYWxsZWwoKCkgPT4gW3RoaXMuaG9zdCgpLCB0aGlzLl93cmFwcGVyKCksIHRoaXMuZ2V0T3JpZW50YXRpb24oKV0pO1xuICAgIGxldCBwZXJjZW50YWdlID0gYXdhaXQgdGhpcy5fY2FsY3VsYXRlUGVyY2VudGFnZSh2YWx1ZSk7XG4gICAgY29uc3Qge2hlaWdodCwgd2lkdGh9ID0gYXdhaXQgd3JhcHBlckVsLmdldERpbWVuc2lvbnMoKTtcbiAgICBjb25zdCBpc1ZlcnRpY2FsID0gb3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCc7XG5cbiAgICAvLyBJbiBjYXNlIHRoZSBzbGlkZXIgaXMgaW52ZXJ0ZWQgaW4gTFRSIG1vZGUgb3Igbm90IGludmVydGVkIGluIFJUTCBtb2RlLFxuICAgIC8vIHdlIG5lZWQgdG8gaW52ZXJ0IHRoZSBwZXJjZW50YWdlIHNvIHRoYXQgdGhlIHByb3BlciB2YWx1ZSBpcyBzZXQuXG4gICAgaWYgKGF3YWl0IHNsaWRlckVsLmhhc0NsYXNzKCdtYXQtc2xpZGVyLWludmVydC1tb3VzZS1jb29yZHMnKSkge1xuICAgICAgcGVyY2VudGFnZSA9IDEgLSBwZXJjZW50YWdlO1xuICAgIH1cblxuICAgIC8vIFdlIG5lZWQgdG8gcm91bmQgdGhlIG5ldyBjb29yZGluYXRlcyBiZWNhdXNlIGNyZWF0aW5nIGZha2UgRE9NXG4gICAgLy8gZXZlbnRzIHdpbGwgY2F1c2UgdGhlIGNvb3JkaW5hdGVzIHRvIGJlIHJvdW5kZWQgZG93bi5cbiAgICBjb25zdCByZWxhdGl2ZVggPSBpc1ZlcnRpY2FsID8gMCA6IE1hdGgucm91bmQod2lkdGggKiBwZXJjZW50YWdlKTtcbiAgICBjb25zdCByZWxhdGl2ZVkgPSBpc1ZlcnRpY2FsID8gTWF0aC5yb3VuZChoZWlnaHQgKiBwZXJjZW50YWdlKSA6IDA7XG5cbiAgICBhd2FpdCB3cmFwcGVyRWwuY2xpY2socmVsYXRpdmVYLCByZWxhdGl2ZVkpO1xuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIHNsaWRlci4gKi9cbiAgYXN5bmMgZm9jdXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKiBCbHVycyB0aGUgc2xpZGVyLiAqL1xuICBhc3luYyBibHVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmJsdXIoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBzbGlkZXIgaXMgZm9jdXNlZC4gKi9cbiAgYXN5bmMgaXNGb2N1c2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmlzRm9jdXNlZCgpO1xuICB9XG5cbiAgLyoqIENhbGN1bGF0ZXMgdGhlIHBlcmNlbnRhZ2Ugb2YgdGhlIGdpdmVuIHZhbHVlLiAqL1xuICBwcml2YXRlIGFzeW5jIF9jYWxjdWxhdGVQZXJjZW50YWdlKHZhbHVlOiBudW1iZXIpIHtcbiAgICBjb25zdCBbbWluLCBtYXhdID0gYXdhaXQgcGFyYWxsZWwoKCkgPT4gW3RoaXMuZ2V0TWluVmFsdWUoKSwgdGhpcy5nZXRNYXhWYWx1ZSgpXSk7XG4gICAgcmV0dXJuICh2YWx1ZSAtIG1pbikgLyAobWF4IC0gbWluKTtcbiAgfVxufVxuIl19