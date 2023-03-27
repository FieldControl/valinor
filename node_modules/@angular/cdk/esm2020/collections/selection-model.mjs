/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Subject } from 'rxjs';
/**
 * Class to be used to power selecting one or more options from a list.
 */
export class SelectionModel {
    /** Selected values. */
    get selected() {
        if (!this._selected) {
            this._selected = Array.from(this._selection.values());
        }
        return this._selected;
    }
    constructor(_multiple = false, initiallySelectedValues, _emitChanges = true, compareWith) {
        this._multiple = _multiple;
        this._emitChanges = _emitChanges;
        this.compareWith = compareWith;
        /** Currently-selected values. */
        this._selection = new Set();
        /** Keeps track of the deselected options that haven't been emitted by the change event. */
        this._deselectedToEmit = [];
        /** Keeps track of the selected options that haven't been emitted by the change event. */
        this._selectedToEmit = [];
        /** Event emitted when the value has changed. */
        this.changed = new Subject();
        if (initiallySelectedValues && initiallySelectedValues.length) {
            if (_multiple) {
                initiallySelectedValues.forEach(value => this._markSelected(value));
            }
            else {
                this._markSelected(initiallySelectedValues[0]);
            }
            // Clear the array in order to avoid firing the change event for preselected values.
            this._selectedToEmit.length = 0;
        }
    }
    /**
     * Selects a value or an array of values.
     * @param values The values to select
     * @return Whether the selection changed as a result of this call
     * @breaking-change 16.0.0 make return type boolean
     */
    select(...values) {
        this._verifyValueAssignment(values);
        values.forEach(value => this._markSelected(value));
        const changed = this._hasQueuedChanges();
        this._emitChangeEvent();
        return changed;
    }
    /**
     * Deselects a value or an array of values.
     * @param values The values to deselect
     * @return Whether the selection changed as a result of this call
     * @breaking-change 16.0.0 make return type boolean
     */
    deselect(...values) {
        this._verifyValueAssignment(values);
        values.forEach(value => this._unmarkSelected(value));
        const changed = this._hasQueuedChanges();
        this._emitChangeEvent();
        return changed;
    }
    /**
     * Sets the selected values
     * @param values The new selected values
     * @return Whether the selection changed as a result of this call
     * @breaking-change 16.0.0 make return type boolean
     */
    setSelection(...values) {
        this._verifyValueAssignment(values);
        const oldValues = this.selected;
        const newSelectedSet = new Set(values);
        values.forEach(value => this._markSelected(value));
        oldValues
            .filter(value => !newSelectedSet.has(value))
            .forEach(value => this._unmarkSelected(value));
        const changed = this._hasQueuedChanges();
        this._emitChangeEvent();
        return changed;
    }
    /**
     * Toggles a value between selected and deselected.
     * @param value The value to toggle
     * @return Whether the selection changed as a result of this call
     * @breaking-change 16.0.0 make return type boolean
     */
    toggle(value) {
        return this.isSelected(value) ? this.deselect(value) : this.select(value);
    }
    /**
     * Clears all of the selected values.
     * @param flushEvent Whether to flush the changes in an event.
     *   If false, the changes to the selection will be flushed along with the next event.
     * @return Whether the selection changed as a result of this call
     * @breaking-change 16.0.0 make return type boolean
     */
    clear(flushEvent = true) {
        this._unmarkAll();
        const changed = this._hasQueuedChanges();
        if (flushEvent) {
            this._emitChangeEvent();
        }
        return changed;
    }
    /**
     * Determines whether a value is selected.
     */
    isSelected(value) {
        return this._selection.has(this._getConcreteValue(value));
    }
    /**
     * Determines whether the model does not have a value.
     */
    isEmpty() {
        return this._selection.size === 0;
    }
    /**
     * Determines whether the model has a value.
     */
    hasValue() {
        return !this.isEmpty();
    }
    /**
     * Sorts the selected values based on a predicate function.
     */
    sort(predicate) {
        if (this._multiple && this.selected) {
            this._selected.sort(predicate);
        }
    }
    /**
     * Gets whether multiple values can be selected.
     */
    isMultipleSelection() {
        return this._multiple;
    }
    /** Emits a change event and clears the records of selected and deselected values. */
    _emitChangeEvent() {
        // Clear the selected values so they can be re-cached.
        this._selected = null;
        if (this._selectedToEmit.length || this._deselectedToEmit.length) {
            this.changed.next({
                source: this,
                added: this._selectedToEmit,
                removed: this._deselectedToEmit,
            });
            this._deselectedToEmit = [];
            this._selectedToEmit = [];
        }
    }
    /** Selects a value. */
    _markSelected(value) {
        value = this._getConcreteValue(value);
        if (!this.isSelected(value)) {
            if (!this._multiple) {
                this._unmarkAll();
            }
            if (!this.isSelected(value)) {
                this._selection.add(value);
            }
            if (this._emitChanges) {
                this._selectedToEmit.push(value);
            }
        }
    }
    /** Deselects a value. */
    _unmarkSelected(value) {
        value = this._getConcreteValue(value);
        if (this.isSelected(value)) {
            this._selection.delete(value);
            if (this._emitChanges) {
                this._deselectedToEmit.push(value);
            }
        }
    }
    /** Clears out the selected values. */
    _unmarkAll() {
        if (!this.isEmpty()) {
            this._selection.forEach(value => this._unmarkSelected(value));
        }
    }
    /**
     * Verifies the value assignment and throws an error if the specified value array is
     * including multiple values while the selection model is not supporting multiple values.
     */
    _verifyValueAssignment(values) {
        if (values.length > 1 && !this._multiple && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getMultipleValuesInSingleSelectionError();
        }
    }
    /** Whether there are queued up change to be emitted. */
    _hasQueuedChanges() {
        return !!(this._deselectedToEmit.length || this._selectedToEmit.length);
    }
    /** Returns a value that is comparable to inputValue by applying compareWith function, returns the same inputValue otherwise. */
    _getConcreteValue(inputValue) {
        if (!this.compareWith) {
            return inputValue;
        }
        else {
            for (let selectedValue of this._selection) {
                if (this.compareWith(inputValue, selectedValue)) {
                    return selectedValue;
                }
            }
            return inputValue;
        }
    }
}
/**
 * Returns an error that reports that multiple values are passed into a selection model
 * with a single value.
 * @docs-private
 */
export function getMultipleValuesInSingleSelectionError() {
    return Error('Cannot pass multiple values into SelectionModel with single-value mode.');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLW1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jb2xsZWN0aW9ucy9zZWxlY3Rpb24tbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUU3Qjs7R0FFRztBQUNILE1BQU0sT0FBTyxjQUFjO0lBYXpCLHVCQUF1QjtJQUN2QixJQUFJLFFBQVE7UUFDVixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZEO1FBRUQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUFLRCxZQUNVLFlBQVksS0FBSyxFQUN6Qix1QkFBNkIsRUFDckIsZUFBZSxJQUFJLEVBQ3BCLFdBQXVDO1FBSHRDLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFFakIsaUJBQVksR0FBWixZQUFZLENBQU87UUFDcEIsZ0JBQVcsR0FBWCxXQUFXLENBQTRCO1FBNUJoRCxpQ0FBaUM7UUFDekIsZUFBVSxHQUFHLElBQUksR0FBRyxFQUFLLENBQUM7UUFFbEMsMkZBQTJGO1FBQ25GLHNCQUFpQixHQUFRLEVBQUUsQ0FBQztRQUVwQyx5RkFBeUY7UUFDakYsb0JBQWUsR0FBUSxFQUFFLENBQUM7UUFjbEMsZ0RBQWdEO1FBQ3ZDLFlBQU8sR0FBRyxJQUFJLE9BQU8sRUFBc0IsQ0FBQztRQVFuRCxJQUFJLHVCQUF1QixJQUFJLHVCQUF1QixDQUFDLE1BQU0sRUFBRTtZQUM3RCxJQUFJLFNBQVMsRUFBRTtnQkFDYix1QkFBdUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FB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RCx3REFBd0Q7SUFDaEQsaUJBQWlCO1FBQ3ZCLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRCxnSUFBZ0k7SUFDeEgsaUJBQWlCLENBQUMsVUFBYTtRQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNyQixPQUFPLFVBQVUsQ0FBQztTQUNuQjthQUFNO1lBQ0wsS0FBSyxJQUFJLGFBQWEsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUN6QyxJQUFJLElBQUksQ0FBQyxXQUFZLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxFQUFFO29CQUNoRCxPQUFPLGFBQWEsQ0FBQztpQkFDdEI7YUFDRjtZQUNELE9BQU8sVUFBVSxDQUFDO1NBQ25CO0lBQ0gsQ0FBQztDQUNGO0FBZUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSx1Q0FBdUM7SUFDckQsT0FBTyxLQUFLLENBQUMseUVBQXlFLENBQUMsQ0FBQztBQUMxRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbi8qKlxuICogQ2xhc3MgdG8gYmUgdXNlZCB0byBwb3dlciBzZWxlY3Rpbmcgb25lIG9yIG1vcmUgb3B0aW9ucyBmcm9tIGEgbGlzdC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNlbGVjdGlvbk1vZGVsPFQ+IHtcbiAgLyoqIEN1cnJlbnRseS1zZWxlY3RlZCB2YWx1ZXMuICovXG4gIHByaXZhdGUgX3NlbGVjdGlvbiA9IG5ldyBTZXQ8VD4oKTtcblxuICAvKiogS2VlcHMgdHJhY2sgb2YgdGhlIGRlc2VsZWN0ZWQgb3B0aW9ucyB0aGF0IGhhdmVuJ3QgYmVlbiBlbWl0dGVkIGJ5IHRoZSBjaGFuZ2UgZXZlbnQuICovXG4gIHByaXZhdGUgX2Rlc2VsZWN0ZWRUb0VtaXQ6IFRbXSA9IFtdO1xuXG4gIC8qKiBLZWVwcyB0cmFjayBvZiB0aGUgc2VsZWN0ZWQgb3B0aW9ucyB0aGF0IGhhdmVuJ3QgYmVlbiBlbWl0dGVkIGJ5IHRoZSBjaGFuZ2UgZXZlbnQuICovXG4gIHByaXZhdGUgX3NlbGVjdGVkVG9FbWl0OiBUW10gPSBbXTtcblxuICAvKiogQ2FjaGUgZm9yIHRoZSBhcnJheSB2YWx1ZSBvZiB0aGUgc2VsZWN0ZWQgaXRlbXMuICovXG4gIHByaXZhdGUgX3NlbGVjdGVkOiBUW10gfCBudWxsO1xuXG4gIC8qKiBTZWxlY3RlZCB2YWx1ZXMuICovXG4gIGdldCBzZWxlY3RlZCgpOiBUW10ge1xuICAgIGlmICghdGhpcy5fc2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkID0gQXJyYXkuZnJvbSh0aGlzLl9zZWxlY3Rpb24udmFsdWVzKCkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZDtcbiAgfVxuXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIHZhbHVlIGhhcyBjaGFuZ2VkLiAqL1xuICByZWFkb25seSBjaGFuZ2VkID0gbmV3IFN1YmplY3Q8U2VsZWN0aW9uQ2hhbmdlPFQ+PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX211bHRpcGxlID0gZmFsc2UsXG4gICAgaW5pdGlhbGx5U2VsZWN0ZWRWYWx1ZXM/OiBUW10sXG4gICAgcHJpdmF0ZSBfZW1pdENoYW5nZXMgPSB0cnVlLFxuICAgIHB1YmxpYyBjb21wYXJlV2l0aD86IChvMTogVCwgbzI6IFQpID0+IGJvb2xlYW4sXG4gICkge1xuICAgIGlmIChpbml0aWFsbHlTZWxlY3RlZFZhbHVlcyAmJiBpbml0aWFsbHlTZWxlY3RlZFZhbHVlcy5sZW5ndGgpIHtcbiAgICAgIGlmIChfbXVsdGlwbGUpIHtcbiAgICAgICAgaW5pdGlhbGx5U2VsZWN0ZWRWYWx1ZXMuZm9yRWFjaCh2YWx1ZSA9PiB0aGlzLl9tYXJrU2VsZWN0ZWQodmFsdWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX21hcmtTZWxlY3RlZChpbml0aWFsbHlTZWxlY3RlZFZhbHVlc1swXSk7XG4gICAgICB9XG5cbiAgICAgIC8vIENsZWFyIHRoZSBhcnJheSBpbiBvcmRlciB0byBhdm9pZCBmaXJpbmcgdGhlIGNoYW5nZSBldmVudCBmb3IgcHJlc2VsZWN0ZWQgdmFsdWVzLlxuICAgICAgdGhpcy5fc2VsZWN0ZWRUb0VtaXQubGVuZ3RoID0gMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VsZWN0cyBhIHZhbHVlIG9yIGFuIGFycmF5IG9mIHZhbHVlcy5cbiAgICogQHBhcmFtIHZhbHVlcyBUaGUgdmFsdWVzIHRvIHNlbGVjdFxuICAgKiBAcmV0dXJuIFdoZXRoZXIgdGhlIHNlbGVjdGlvbiBjaGFuZ2VkIGFzIGEgcmVzdWx0IG9mIHRoaXMgY2FsbFxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDE2LjAuMCBtYWtlIHJldHVybiB0eXBlIGJvb2xlYW5cbiAgICovXG4gIHNlbGVjdCguLi52YWx1ZXM6IFRbXSk6IGJvb2xlYW4gfCB2b2lkIHtcbiAgICB0aGlzLl92ZXJpZnlWYWx1ZUFzc2lnbm1lbnQodmFsdWVzKTtcbiAgICB2YWx1ZXMuZm9yRWFjaCh2YWx1ZSA9PiB0aGlzLl9tYXJrU2VsZWN0ZWQodmFsdWUpKTtcbiAgICBjb25zdCBjaGFuZ2VkID0gdGhpcy5faGFzUXVldWVkQ2hhbmdlcygpO1xuICAgIHRoaXMuX2VtaXRDaGFuZ2VFdmVudCgpO1xuICAgIHJldHVybiBjaGFuZ2VkO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc2VsZWN0cyBhIHZhbHVlIG9yIGFuIGFycmF5IG9mIHZhbHVlcy5cbiAgICogQHBhcmFtIHZhbHVlcyBUaGUgdmFsdWVzIHRvIGRlc2VsZWN0XG4gICAqIEByZXR1cm4gV2hldGhlciB0aGUgc2VsZWN0aW9uIGNoYW5nZWQgYXMgYSByZXN1bHQgb2YgdGhpcyBjYWxsXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTYuMC4wIG1ha2UgcmV0dXJuIHR5cGUgYm9vbGVhblxuICAgKi9cbiAgZGVzZWxlY3QoLi4udmFsdWVzOiBUW10pOiBib29sZWFuIHwgdm9pZCB7XG4gICAgdGhpcy5fdmVyaWZ5VmFsdWVBc3NpZ25tZW50KHZhbHVlcyk7XG4gICAgdmFsdWVzLmZvckVhY2godmFsdWUgPT4gdGhpcy5fdW5tYXJrU2VsZWN0ZWQodmFsdWUpKTtcbiAgICBjb25zdCBjaGFuZ2VkID0gdGhpcy5faGFzUXVldWVkQ2hhbmdlcygpO1xuICAgIHRoaXMuX2VtaXRDaGFuZ2VFdmVudCgpO1xuICAgIHJldHVybiBjaGFuZ2VkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNlbGVjdGVkIHZhbHVlc1xuICAgKiBAcGFyYW0gdmFsdWVzIFRoZSBuZXcgc2VsZWN0ZWQgdmFsdWVzXG4gICAqIEByZXR1cm4gV2hldGhlciB0aGUgc2VsZWN0aW9uIGNoYW5nZWQgYXMgYSByZXN1bHQgb2YgdGhpcyBjYWxsXG4gICAqIEBicmVha2luZy1jaGFuZ2UgMTYuMC4wIG1ha2UgcmV0dXJuIHR5cGUgYm9vbGVhblxuICAgKi9cbiAgc2V0U2VsZWN0aW9uKC4uLnZhbHVlczogVFtdKTogYm9vbGVhbiB8IHZvaWQge1xuICAgIHRoaXMuX3ZlcmlmeVZhbHVlQXNzaWdubWVudCh2YWx1ZXMpO1xuICAgIGNvbnN0IG9sZFZhbHVlcyA9IHRoaXMuc2VsZWN0ZWQ7XG4gICAgY29uc3QgbmV3U2VsZWN0ZWRTZXQgPSBuZXcgU2V0KHZhbHVlcyk7XG4gICAgdmFsdWVzLmZvckVhY2godmFsdWUgPT4gdGhpcy5fbWFya1NlbGVjdGVkKHZhbHVlKSk7XG4gICAgb2xkVmFsdWVzXG4gICAgICAuZmlsdGVyKHZhbHVlID0+ICFuZXdTZWxlY3RlZFNldC5oYXModmFsdWUpKVxuICAgICAgLmZvckVhY2godmFsdWUgPT4gdGhpcy5fdW5tYXJrU2VsZWN0ZWQodmFsdWUpKTtcbiAgICBjb25zdCBjaGFuZ2VkID0gdGhpcy5faGFzUXVldWVkQ2hhbmdlcygpO1xuICAgIHRoaXMuX2VtaXRDaGFuZ2VFdmVudCgpO1xuICAgIHJldHVybiBjaGFuZ2VkO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgYSB2YWx1ZSBiZXR3ZWVuIHNlbGVjdGVkIGFuZCBkZXNlbGVjdGVkLlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHRvZ2dsZVxuICAgKiBAcmV0dXJuIFdoZXRoZXIgdGhlIHNlbGVjdGlvbiBjaGFuZ2VkIGFzIGEgcmVzdWx0IG9mIHRoaXMgY2FsbFxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDE2LjAuMCBtYWtlIHJldHVybiB0eXBlIGJvb2xlYW5cbiAgICovXG4gIHRvZ2dsZSh2YWx1ZTogVCk6IGJvb2xlYW4gfCB2b2lkIHtcbiAgICByZXR1cm4gdGhpcy5pc1NlbGVjdGVkKHZhbHVlKSA/IHRoaXMuZGVzZWxlY3QodmFsdWUpIDogdGhpcy5zZWxlY3QodmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyBhbGwgb2YgdGhlIHNlbGVjdGVkIHZhbHVlcy5cbiAgICogQHBhcmFtIGZsdXNoRXZlbnQgV2hldGhlciB0byBmbHVzaCB0aGUgY2hhbmdlcyBpbiBhbiBldmVudC5cbiAgICogICBJZiBmYWxzZSwgdGhlIGNoYW5nZXMgdG8gdGhlIHNlbGVjdGlvbiB3aWxsIGJlIGZsdXNoZWQgYWxvbmcgd2l0aCB0aGUgbmV4dCBldmVudC5cbiAgICogQHJldHVybiBXaGV0aGVyIHRoZSBzZWxlY3Rpb24gY2hhbmdlZCBhcyBhIHJlc3VsdCBvZiB0aGlzIGNhbGxcbiAgICogQGJyZWFraW5nLWNoYW5nZSAxNi4wLjAgbWFrZSByZXR1cm4gdHlwZSBib29sZWFuXG4gICAqL1xuICBjbGVhcihmbHVzaEV2ZW50ID0gdHJ1ZSk6IGJvb2xlYW4gfCB2b2lkIHtcbiAgICB0aGlzLl91bm1hcmtBbGwoKTtcbiAgICBjb25zdCBjaGFuZ2VkID0gdGhpcy5faGFzUXVldWVkQ2hhbmdlcygpO1xuICAgIGlmIChmbHVzaEV2ZW50KSB7XG4gICAgICB0aGlzLl9lbWl0Q2hhbmdlRXZlbnQoKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoYW5nZWQ7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgdmFsdWUgaXMgc2VsZWN0ZWQuXG4gICAqL1xuICBpc1NlbGVjdGVkKHZhbHVlOiBUKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGlvbi5oYXModGhpcy5fZ2V0Q29uY3JldGVWYWx1ZSh2YWx1ZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGUgbW9kZWwgZG9lcyBub3QgaGF2ZSBhIHZhbHVlLlxuICAgKi9cbiAgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0aW9uLnNpemUgPT09IDA7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBtb2RlbCBoYXMgYSB2YWx1ZS5cbiAgICovXG4gIGhhc1ZhbHVlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5pc0VtcHR5KCk7XG4gIH1cblxuICAvKipcbiAgICogU29ydHMgdGhlIHNlbGVjdGVkIHZhbHVlcyBiYXNlZCBvbiBhIHByZWRpY2F0ZSBmdW5jdGlvbi5cbiAgICovXG4gIHNvcnQocHJlZGljYXRlPzogKGE6IFQsIGI6IFQpID0+IG51bWJlcik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9tdWx0aXBsZSAmJiB0aGlzLnNlbGVjdGVkKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZCEuc29ydChwcmVkaWNhdGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHdoZXRoZXIgbXVsdGlwbGUgdmFsdWVzIGNhbiBiZSBzZWxlY3RlZC5cbiAgICovXG4gIGlzTXVsdGlwbGVTZWxlY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX211bHRpcGxlO1xuICB9XG5cbiAgLyoqIEVtaXRzIGEgY2hhbmdlIGV2ZW50IGFuZCBjbGVhcnMgdGhlIHJlY29yZHMgb2Ygc2VsZWN0ZWQgYW5kIGRlc2VsZWN0ZWQgdmFsdWVzLiAqL1xuICBwcml2YXRlIF9lbWl0Q2hhbmdlRXZlbnQoKSB7XG4gICAgLy8gQ2xlYXIgdGhlIHNlbGVjdGVkIHZhbHVlcyBzbyB0aGV5IGNhbiBiZSByZS1jYWNoZWQuXG4gICAgdGhpcy5fc2VsZWN0ZWQgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuX3NlbGVjdGVkVG9FbWl0Lmxlbmd0aCB8fCB0aGlzLl9kZXNlbGVjdGVkVG9FbWl0Lmxlbmd0aCkge1xuICAgICAgdGhpcy5jaGFuZ2VkLm5leHQoe1xuICAgICAgICBzb3VyY2U6IHRoaXMsXG4gICAgICAgIGFkZGVkOiB0aGlzLl9zZWxlY3RlZFRvRW1pdCxcbiAgICAgICAgcmVtb3ZlZDogdGhpcy5fZGVzZWxlY3RlZFRvRW1pdCxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9kZXNlbGVjdGVkVG9FbWl0ID0gW107XG4gICAgICB0aGlzLl9zZWxlY3RlZFRvRW1pdCA9IFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBTZWxlY3RzIGEgdmFsdWUuICovXG4gIHByaXZhdGUgX21hcmtTZWxlY3RlZCh2YWx1ZTogVCkge1xuICAgIHZhbHVlID0gdGhpcy5fZ2V0Q29uY3JldGVWYWx1ZSh2YWx1ZSk7XG4gICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWQodmFsdWUpKSB7XG4gICAgICBpZiAoIXRoaXMuX211bHRpcGxlKSB7XG4gICAgICAgIHRoaXMuX3VubWFya0FsbCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaXNTZWxlY3RlZCh2YWx1ZSkpIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0aW9uLmFkZCh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9lbWl0Q2hhbmdlcykge1xuICAgICAgICB0aGlzLl9zZWxlY3RlZFRvRW1pdC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogRGVzZWxlY3RzIGEgdmFsdWUuICovXG4gIHByaXZhdGUgX3VubWFya1NlbGVjdGVkKHZhbHVlOiBUKSB7XG4gICAgdmFsdWUgPSB0aGlzLl9nZXRDb25jcmV0ZVZhbHVlKHZhbHVlKTtcbiAgICBpZiAodGhpcy5pc1NlbGVjdGVkKHZhbHVlKSkge1xuICAgICAgdGhpcy5fc2VsZWN0aW9uLmRlbGV0ZSh2YWx1ZSk7XG5cbiAgICAgIGlmICh0aGlzLl9lbWl0Q2hhbmdlcykge1xuICAgICAgICB0aGlzLl9kZXNlbGVjdGVkVG9FbWl0LnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBDbGVhcnMgb3V0IHRoZSBzZWxlY3RlZCB2YWx1ZXMuICovXG4gIHByaXZhdGUgX3VubWFya0FsbCgpIHtcbiAgICBpZiAoIXRoaXMuaXNFbXB0eSgpKSB7XG4gICAgICB0aGlzLl9zZWxlY3Rpb24uZm9yRWFjaCh2YWx1ZSA9PiB0aGlzLl91bm1hcmtTZWxlY3RlZCh2YWx1ZSkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGUgdmFsdWUgYXNzaWdubWVudCBhbmQgdGhyb3dzIGFuIGVycm9yIGlmIHRoZSBzcGVjaWZpZWQgdmFsdWUgYXJyYXkgaXNcbiAgICogaW5jbHVkaW5nIG11bHRpcGxlIHZhbHVlcyB3aGlsZSB0aGUgc2VsZWN0aW9uIG1vZGVsIGlzIG5vdCBzdXBwb3J0aW5nIG11bHRpcGxlIHZhbHVlcy5cbiAgICovXG4gIHByaXZhdGUgX3ZlcmlmeVZhbHVlQXNzaWdubWVudCh2YWx1ZXM6IFRbXSkge1xuICAgIGlmICh2YWx1ZXMubGVuZ3RoID4gMSAmJiAhdGhpcy5fbXVsdGlwbGUgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IGdldE11bHRpcGxlVmFsdWVzSW5TaW5nbGVTZWxlY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZXJlIGFyZSBxdWV1ZWQgdXAgY2hhbmdlIHRvIGJlIGVtaXR0ZWQuICovXG4gIHByaXZhdGUgX2hhc1F1ZXVlZENoYW5nZXMoKSB7XG4gICAgcmV0dXJuICEhKHRoaXMuX2Rlc2VsZWN0ZWRUb0VtaXQubGVuZ3RoIHx8IHRoaXMuX3NlbGVjdGVkVG9FbWl0Lmxlbmd0aCk7XG4gIH1cblxuICAvKiogUmV0dXJucyBhIHZhbHVlIHRoYXQgaXMgY29tcGFyYWJsZSB0byBpbnB1dFZhbHVlIGJ5IGFwcGx5aW5nIGNvbXBhcmVXaXRoIGZ1bmN0aW9uLCByZXR1cm5zIHRoZSBzYW1lIGlucHV0VmFsdWUgb3RoZXJ3aXNlLiAqL1xuICBwcml2YXRlIF9nZXRDb25jcmV0ZVZhbHVlKGlucHV0VmFsdWU6IFQpOiBUIHtcbiAgICBpZiAoIXRoaXMuY29tcGFyZVdpdGgpIHtcbiAgICAgIHJldHVybiBpbnB1dFZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBzZWxlY3RlZFZhbHVlIG9mIHRoaXMuX3NlbGVjdGlvbikge1xuICAgICAgICBpZiAodGhpcy5jb21wYXJlV2l0aCEoaW5wdXRWYWx1ZSwgc2VsZWN0ZWRWYWx1ZSkpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZWN0ZWRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGlucHV0VmFsdWU7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSB2YWx1ZSBvZiBhIE1hdFNlbGVjdGlvbk1vZGVsIGhhcyBjaGFuZ2VkLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFNlbGVjdGlvbkNoYW5nZTxUPiB7XG4gIC8qKiBNb2RlbCB0aGF0IGRpc3BhdGNoZWQgdGhlIGV2ZW50LiAqL1xuICBzb3VyY2U6IFNlbGVjdGlvbk1vZGVsPFQ+O1xuICAvKiogT3B0aW9ucyB0aGF0IHdlcmUgYWRkZWQgdG8gdGhlIG1vZGVsLiAqL1xuICBhZGRlZDogVFtdO1xuICAvKiogT3B0aW9ucyB0aGF0IHdlcmUgcmVtb3ZlZCBmcm9tIHRoZSBtb2RlbC4gKi9cbiAgcmVtb3ZlZDogVFtdO1xufVxuXG4vKipcbiAqIFJldHVybnMgYW4gZXJyb3IgdGhhdCByZXBvcnRzIHRoYXQgbXVsdGlwbGUgdmFsdWVzIGFyZSBwYXNzZWQgaW50byBhIHNlbGVjdGlvbiBtb2RlbFxuICogd2l0aCBhIHNpbmdsZSB2YWx1ZS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE11bHRpcGxlVmFsdWVzSW5TaW5nbGVTZWxlY3Rpb25FcnJvcigpIHtcbiAgcmV0dXJuIEVycm9yKCdDYW5ub3QgcGFzcyBtdWx0aXBsZSB2YWx1ZXMgaW50byBTZWxlY3Rpb25Nb2RlbCB3aXRoIHNpbmdsZS12YWx1ZSBtb2RlLicpO1xufVxuIl19