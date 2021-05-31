/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Optional, SkipSelf } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { Subject } from 'rxjs';
/** A class representing a range of dates. */
export class DateRange {
    constructor(
    /** The start date of the range. */
    start, 
    /** The end date of the range. */
    end) {
        this.start = start;
        this.end = end;
    }
}
/**
 * A selection model containing a date selection.
 * @docs-private
 */
export class MatDateSelectionModel {
    constructor(
    /** The current selection. */
    selection, _adapter) {
        this.selection = selection;
        this._adapter = _adapter;
        this._selectionChanged = new Subject();
        /** Emits when the selection has changed. */
        this.selectionChanged = this._selectionChanged;
        this.selection = selection;
    }
    /**
     * Updates the current selection in the model.
     * @param value New selection that should be assigned.
     * @param source Object that triggered the selection change.
     */
    updateSelection(value, source) {
        const oldValue = this.selection;
        this.selection = value;
        this._selectionChanged.next({ selection: value, source, oldValue });
    }
    ngOnDestroy() {
        this._selectionChanged.complete();
    }
    _isValidDateInstance(date) {
        return this._adapter.isDateInstance(date) && this._adapter.isValid(date);
    }
}
MatDateSelectionModel.decorators = [
    { type: Injectable }
];
MatDateSelectionModel.ctorParameters = () => [
    { type: undefined },
    { type: DateAdapter }
];
/**
 * A selection model that contains a single date.
 * @docs-private
 */
export class MatSingleDateSelectionModel extends MatDateSelectionModel {
    constructor(adapter) {
        super(null, adapter);
    }
    /**
     * Adds a date to the current selection. In the case of a single date selection, the added date
     * simply overwrites the previous selection
     */
    add(date) {
        super.updateSelection(date, this);
    }
    /** Checks whether the current selection is valid. */
    isValid() {
        return this.selection != null && this._isValidDateInstance(this.selection);
    }
    /**
     * Checks whether the current selection is complete. In the case of a single date selection, this
     * is true if the current selection is not null.
     */
    isComplete() {
        return this.selection != null;
    }
    /** Clones the selection model. */
    clone() {
        const clone = new MatSingleDateSelectionModel(this._adapter);
        clone.updateSelection(this.selection, this);
        return clone;
    }
}
MatSingleDateSelectionModel.decorators = [
    { type: Injectable }
];
MatSingleDateSelectionModel.ctorParameters = () => [
    { type: DateAdapter }
];
/**
 * A selection model that contains a date range.
 * @docs-private
 */
export class MatRangeDateSelectionModel extends MatDateSelectionModel {
    constructor(adapter) {
        super(new DateRange(null, null), adapter);
    }
    /**
     * Adds a date to the current selection. In the case of a date range selection, the added date
     * fills in the next `null` value in the range. If both the start and the end already have a date,
     * the selection is reset so that the given date is the new `start` and the `end` is null.
     */
    add(date) {
        let { start, end } = this.selection;
        if (start == null) {
            start = date;
        }
        else if (end == null) {
            end = date;
        }
        else {
            start = date;
            end = null;
        }
        super.updateSelection(new DateRange(start, end), this);
    }
    /** Checks whether the current selection is valid. */
    isValid() {
        const { start, end } = this.selection;
        // Empty ranges are valid.
        if (start == null && end == null) {
            return true;
        }
        // Complete ranges are only valid if both dates are valid and the start is before the end.
        if (start != null && end != null) {
            return this._isValidDateInstance(start) && this._isValidDateInstance(end) &&
                this._adapter.compareDate(start, end) <= 0;
        }
        // Partial ranges are valid if the start/end is valid.
        return (start == null || this._isValidDateInstance(start)) &&
            (end == null || this._isValidDateInstance(end));
    }
    /**
     * Checks whether the current selection is complete. In the case of a date range selection, this
     * is true if the current selection has a non-null `start` and `end`.
     */
    isComplete() {
        return this.selection.start != null && this.selection.end != null;
    }
    /** Clones the selection model. */
    clone() {
        const clone = new MatRangeDateSelectionModel(this._adapter);
        clone.updateSelection(this.selection, this);
        return clone;
    }
}
MatRangeDateSelectionModel.decorators = [
    { type: Injectable }
];
MatRangeDateSelectionModel.ctorParameters = () => [
    { type: DateAdapter }
];
/** @docs-private */
export function MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY(parent, adapter) {
    return parent || new MatSingleDateSelectionModel(adapter);
}
/**
 * Used to provide a single selection model to a component.
 * @docs-private
 */
export const MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER = {
    provide: MatDateSelectionModel,
    deps: [[new Optional(), new SkipSelf(), MatDateSelectionModel], DateAdapter],
    useFactory: MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY,
};
/** @docs-private */
export function MAT_RANGE_DATE_SELECTION_MODEL_FACTORY(parent, adapter) {
    return parent || new MatRangeDateSelectionModel(adapter);
}
/**
 * Used to provide a range selection model to a component.
 * @docs-private
 */
export const MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER = {
    provide: MatDateSelectionModel,
    deps: [[new Optional(), new SkipSelf(), MatDateSelectionModel], DateAdapter],
    useFactory: MAT_RANGE_DATE_SELECTION_MODEL_FACTORY,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1zZWxlY3Rpb24tbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZGF0ZXBpY2tlci9kYXRlLXNlbGVjdGlvbi1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQWtCLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3pGLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRCxPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBRXpDLDZDQUE2QztBQUM3QyxNQUFNLE9BQU8sU0FBUztJQVFwQjtJQUNFLG1DQUFtQztJQUMxQixLQUFlO0lBQ3hCLGlDQUFpQztJQUN4QixHQUFhO1FBRmIsVUFBSyxHQUFMLEtBQUssQ0FBVTtRQUVmLFFBQUcsR0FBSCxHQUFHLENBQVU7SUFBRyxDQUFDO0NBQzdCO0FBdUJEOzs7R0FHRztBQUVILE1BQU0sT0FBZ0IscUJBQXFCO0lBT3pDO0lBQ0UsNkJBQTZCO0lBQ3BCLFNBQVksRUFDWCxRQUF3QjtRQUR6QixjQUFTLEdBQVQsU0FBUyxDQUFHO1FBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBZ0I7UUFSbkIsc0JBQWlCLEdBQUcsSUFBSSxPQUFPLEVBQStCLENBQUM7UUFFaEYsNENBQTRDO1FBQzVDLHFCQUFnQixHQUE0QyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFNakYsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxlQUFlLENBQUMsS0FBUSxFQUFFLE1BQWU7UUFDdkMsTUFBTSxRQUFRLEdBQUksSUFBdUIsQ0FBQyxTQUFTLENBQUM7UUFDbkQsSUFBdUIsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQzNDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJ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QUFNLElBQUksSUFBSSwwQkFBMEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzRCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sdUNBQXVDLEdBQW9CO0lBQ3RFLE9BQU8sRUFBRSxxQkFBcUI7SUFDOUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLFFBQVEsRUFBRSxFQUFFLElBQUksUUFBUSxFQUFFLEVBQUUscUJBQXFCLENBQUMsRUFBRSxXQUFXLENBQUM7SUFDNUUsVUFBVSxFQUFFLHNDQUFzQztDQUNuRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RmFjdG9yeVByb3ZpZGVyLCBJbmplY3RhYmxlLCBPcHRpb25hbCwgU2tpcFNlbGYsIE9uRGVzdHJveX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RhdGVBZGFwdGVyfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncnhqcyc7XG5cbi8qKiBBIGNsYXNzIHJlcHJlc2VudGluZyBhIHJhbmdlIG9mIGRhdGVzLiAqL1xuZXhwb3J0IGNsYXNzIERhdGVSYW5nZTxEPiB7XG4gIC8qKlxuICAgKiBFbnN1cmVzIHRoYXQgb2JqZWN0cyB3aXRoIGEgYHN0YXJ0YCBhbmQgYGVuZGAgcHJvcGVydHkgY2FuJ3QgYmUgYXNzaWduZWQgdG8gYSB2YXJpYWJsZSB0aGF0XG4gICAqIGV4cGVjdHMgYSBgRGF0ZVJhbmdlYFxuICAgKi9cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXVudXNlZC12YXJpYWJsZVxuICBwcml2YXRlIF9kaXNhYmxlU3RydWN0dXJhbEVxdWl2YWxlbmN5OiBuZXZlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAvKiogVGhlIHN0YXJ0IGRhdGUgb2YgdGhlIHJhbmdlLiAqL1xuICAgIHJlYWRvbmx5IHN0YXJ0OiBEIHwgbnVsbCxcbiAgICAvKiogVGhlIGVuZCBkYXRlIG9mIHRoZSByYW5nZS4gKi9cbiAgICByZWFkb25seSBlbmQ6IEQgfCBudWxsKSB7fVxufVxuXG4vKipcbiAqIENvbmRpdGlvbmFsbHkgcGlja3MgdGhlIGRhdGUgdHlwZSwgaWYgYSBEYXRlUmFuZ2UgaXMgcGFzc2VkIGluLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5leHBvcnQgdHlwZSBFeHRyYWN0RGF0ZVR5cGVGcm9tU2VsZWN0aW9uPFQ+ID0gVCBleHRlbmRzIERhdGVSYW5nZTxpbmZlciBEPiA/IEQgOiBOb25OdWxsYWJsZTxUPjtcblxuLyoqXG4gKiBFdmVudCBlbWl0dGVkIGJ5IHRoZSBkYXRlIHNlbGVjdGlvbiBtb2RlbCB3aGVuIGl0cyBzZWxlY3Rpb24gY2hhbmdlcy5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEYXRlU2VsZWN0aW9uTW9kZWxDaGFuZ2U8Uz4ge1xuICAvKiogTmV3IHZhbHVlIGZvciB0aGUgc2VsZWN0aW9uLiAqL1xuICBzZWxlY3Rpb246IFM7XG5cbiAgLyoqIE9iamVjdCB0aGF0IHRyaWdnZXJlZCB0aGUgY2hhbmdlLiAqL1xuICBzb3VyY2U6IHVua25vd247XG5cbiAgLyoqIFByZXZpb3VzIHZhbHVlICovXG4gIG9sZFZhbHVlPzogUztcbn1cblxuLyoqXG4gKiBBIHNlbGVjdGlvbiBtb2RlbCBjb250YWluaW5nIGEgZGF0ZSBzZWxlY3Rpb24uXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNYXREYXRlU2VsZWN0aW9uTW9kZWw8UywgRCA9IEV4dHJhY3REYXRlVHlwZUZyb21TZWxlY3Rpb248Uz4+XG4gICAgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBwcml2YXRlIHJlYWRvbmx5IF9zZWxlY3Rpb25DaGFuZ2VkID0gbmV3IFN1YmplY3Q8RGF0ZVNlbGVjdGlvbk1vZGVsQ2hhbmdlPFM+PigpO1xuXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBzZWxlY3Rpb24gaGFzIGNoYW5nZWQuICovXG4gIHNlbGVjdGlvbkNoYW5nZWQ6IE9ic2VydmFibGU8RGF0ZVNlbGVjdGlvbk1vZGVsQ2hhbmdlPFM+PiA9IHRoaXMuX3NlbGVjdGlvbkNoYW5nZWQ7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgIC8qKiBUaGUgY3VycmVudCBzZWxlY3Rpb24uICovXG4gICAgcmVhZG9ubHkgc2VsZWN0aW9uOiBTLFxuICAgIHByb3RlY3RlZCBfYWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4pIHtcbiAgICB0aGlzLnNlbGVjdGlvbiA9IHNlbGVjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBpbiB0aGUgbW9kZWwuXG4gICAqIEBwYXJhbSB2YWx1ZSBOZXcgc2VsZWN0aW9uIHRoYXQgc2hvdWxkIGJlIGFzc2lnbmVkLlxuICAgKiBAcGFyYW0gc291cmNlIE9iamVjdCB0aGF0IHRyaWdnZXJlZCB0aGUgc2VsZWN0aW9uIGNoYW5nZS5cbiAgICovXG4gIHVwZGF0ZVNlbGVjdGlvbih2YWx1ZTogUywgc291cmNlOiB1bmtub3duKSB7XG4gICAgY29uc3Qgb2xkVmFsdWUgPSAodGhpcyBhcyB7c2VsZWN0aW9uOiBTfSkuc2VsZWN0aW9uO1xuICAgICh0aGlzIGFzIHtzZWxlY3Rpb246IFN9KS5zZWxlY3Rpb24gPSB2YWx1ZTtcbiAgICB0aGlzLl9zZWxlY3Rpb25DaGFuZ2VkLm5leHQoe3NlbGVjdGlvbjogdmFsdWUsIHNvdXJjZSwgb2xkVmFsdWV9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX3NlbGVjdGlvbkNoYW5nZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfaXNWYWxpZERhdGVJbnN0YW5jZShkYXRlOiBEKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2FkYXB0ZXIuaXNEYXRlSW5zdGFuY2UoZGF0ZSkgJiYgdGhpcy5fYWRhcHRlci5pc1ZhbGlkKGRhdGUpO1xuICB9XG5cbiAgLyoqIEFkZHMgYSBkYXRlIHRvIHRoZSBjdXJyZW50IHNlbGVjdGlvbi4gKi9cbiAgYWJzdHJhY3QgYWRkKGRhdGU6IEQgfCBudWxsKTogdm9pZDtcblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGlzIHZhbGlkLiAqL1xuICBhYnN0cmFjdCBpc1ZhbGlkKCk6IGJvb2xlYW47XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBpcyBjb21wbGV0ZS4gKi9cbiAgYWJzdHJhY3QgaXNDb21wbGV0ZSgpOiBib29sZWFuO1xuXG4gIC8qKiBDbG9uZXMgdGhlIHNlbGVjdGlvbiBtb2RlbC4gKi9cbiAgYWJzdHJhY3QgY2xvbmUoKTogTWF0RGF0ZVNlbGVjdGlvbk1vZGVsPFMsIEQ+O1xufVxuXG4vKipcbiAqIEEgc2VsZWN0aW9uIG1vZGVsIHRoYXQgY29udGFpbnMgYSBzaW5nbGUgZGF0ZS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1hdFNpbmdsZURhdGVTZWxlY3Rpb25Nb2RlbDxEPiBleHRlbmRzIE1hdERhdGVTZWxlY3Rpb25Nb2RlbDxEIHwgbnVsbCwgRD4ge1xuICBjb25zdHJ1Y3RvcihhZGFwdGVyOiBEYXRlQWRhcHRlcjxEPikge1xuICAgIHN1cGVyKG51bGwsIGFkYXB0ZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBkYXRlIHRvIHRoZSBjdXJyZW50IHNlbGVjdGlvbi4gSW4gdGhlIGNhc2Ugb2YgYSBzaW5nbGUgZGF0ZSBzZWxlY3Rpb24sIHRoZSBhZGRlZCBkYXRlXG4gICAqIHNpbXBseSBvdmVyd3JpdGVzIHRoZSBwcmV2aW91cyBzZWxlY3Rpb25cbiAgICovXG4gIGFkZChkYXRlOiBEIHwgbnVsbCkge1xuICAgIHN1cGVyLnVwZGF0ZVNlbGVjdGlvbihkYXRlLCB0aGlzKTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgdmFsaWQuICovXG4gIGlzVmFsaWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uICE9IG51bGwgJiYgdGhpcy5faXNWYWxpZERhdGVJbnN0YW5jZSh0aGlzLnNlbGVjdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGlzIGNvbXBsZXRlLiBJbiB0aGUgY2FzZSBvZiBhIHNpbmdsZSBkYXRlIHNlbGVjdGlvbiwgdGhpc1xuICAgKiBpcyB0cnVlIGlmIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBpcyBub3QgbnVsbC5cbiAgICovXG4gIGlzQ29tcGxldGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uICE9IG51bGw7XG4gIH1cblxuICAvKiogQ2xvbmVzIHRoZSBzZWxlY3Rpb24gbW9kZWwuICovXG4gIGNsb25lKCkge1xuICAgIGNvbnN0IGNsb25lID0gbmV3IE1hdFNpbmdsZURhdGVTZWxlY3Rpb25Nb2RlbDxEPih0aGlzLl9hZGFwdGVyKTtcbiAgICBjbG9uZS51cGRhdGVTZWxlY3Rpb24odGhpcy5zZWxlY3Rpb24sIHRoaXMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxufVxuXG4vKipcbiAqIEEgc2VsZWN0aW9uIG1vZGVsIHRoYXQgY29udGFpbnMgYSBkYXRlIHJhbmdlLlxuICogQGRvY3MtcHJpdmF0ZVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWF0UmFuZ2VEYXRlU2VsZWN0aW9uTW9kZWw8RD4gZXh0ZW5kcyBNYXREYXRlU2VsZWN0aW9uTW9kZWw8RGF0ZVJhbmdlPEQ+LCBEPiB7XG4gIGNvbnN0cnVjdG9yKGFkYXB0ZXI6IERhdGVBZGFwdGVyPEQ+KSB7XG4gICAgc3VwZXIobmV3IERhdGVSYW5nZTxEPihudWxsLCBudWxsKSwgYWRhcHRlcik7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGRhdGUgdG8gdGhlIGN1cnJlbnQgc2VsZWN0aW9uLiBJbiB0aGUgY2FzZSBvZiBhIGRhdGUgcmFuZ2Ugc2VsZWN0aW9uLCB0aGUgYWRkZWQgZGF0ZVxuICAgKiBmaWxscyBpbiB0aGUgbmV4dCBgbnVsbGAgdmFsdWUgaW4gdGhlIHJhbmdlLiBJZiBib3RoIHRoZSBzdGFydCBhbmQgdGhlIGVuZCBhbHJlYWR5IGhhdmUgYSBkYXRlLFxuICAgKiB0aGUgc2VsZWN0aW9uIGlzIHJlc2V0IHNvIHRoYXQgdGhlIGdpdmVuIGRhdGUgaXMgdGhlIG5ldyBgc3RhcnRgIGFuZCB0aGUgYGVuZGAgaXMgbnVsbC5cbiAgICovXG4gIGFkZChkYXRlOiBEIHwgbnVsbCk6IHZvaWQge1xuICAgIGxldCB7c3RhcnQsIGVuZH0gPSB0aGlzLnNlbGVjdGlvbjtcblxuICAgIGlmIChzdGFydCA9PSBudWxsKSB7XG4gICAgICBzdGFydCA9IGRhdGU7XG4gICAgfSBlbHNlIGlmIChlbmQgPT0gbnVsbCkge1xuICAgICAgZW5kID0gZGF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhcnQgPSBkYXRlO1xuICAgICAgZW5kID0gbnVsbDtcbiAgICB9XG5cbiAgICBzdXBlci51cGRhdGVTZWxlY3Rpb24obmV3IERhdGVSYW5nZTxEPihzdGFydCwgZW5kKSwgdGhpcyk7XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGlzIHZhbGlkLiAqL1xuICBpc1ZhbGlkKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHtzdGFydCwgZW5kfSA9IHRoaXMuc2VsZWN0aW9uO1xuXG4gICAgLy8gRW1wdHkgcmFuZ2VzIGFyZSB2YWxpZC5cbiAgICBpZiAoc3RhcnQgPT0gbnVsbCAmJiBlbmQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gQ29tcGxldGUgcmFuZ2VzIGFyZSBvbmx5IHZhbGlkIGlmIGJvdGggZGF0ZXMgYXJlIHZhbGlkIGFuZCB0aGUgc3RhcnQgaXMgYmVmb3JlIHRoZSBlbmQuXG4gICAgaWYgKHN0YXJ0ICE9IG51bGwgJiYgZW5kICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pc1ZhbGlkRGF0ZUluc3RhbmNlKHN0YXJ0KSAmJiB0aGlzLl9pc1ZhbGlkRGF0ZUluc3RhbmNlKGVuZCkgJiZcbiAgICAgICAgICAgICB0aGlzLl9hZGFwdGVyLmNvbXBhcmVEYXRlKHN0YXJ0LCBlbmQpIDw9IDA7XG4gICAgfVxuXG4gICAgLy8gUGFydGlhbCByYW5nZXMgYXJlIHZhbGlkIGlmIHRoZSBzdGFydC9lbmQgaXMgdmFsaWQuXG4gICAgcmV0dXJuIChzdGFydCA9PSBudWxsIHx8IHRoaXMuX2lzVmFsaWREYXRlSW5zdGFuY2Uoc3RhcnQpKSAmJlxuICAgICAgICAgICAoZW5kID09IG51bGwgfHwgdGhpcy5faXNWYWxpZERhdGVJbnN0YW5jZShlbmQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgY3VycmVudCBzZWxlY3Rpb24gaXMgY29tcGxldGUuIEluIHRoZSBjYXNlIG9mIGEgZGF0ZSByYW5nZSBzZWxlY3Rpb24sIHRoaXNcbiAgICogaXMgdHJ1ZSBpZiB0aGUgY3VycmVudCBzZWxlY3Rpb24gaGFzIGEgbm9uLW51bGwgYHN0YXJ0YCBhbmQgYGVuZGAuXG4gICAqL1xuICBpc0NvbXBsZXRlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5zdGFydCAhPSBudWxsICYmIHRoaXMuc2VsZWN0aW9uLmVuZCAhPSBudWxsO1xuICB9XG5cbiAgLyoqIENsb25lcyB0aGUgc2VsZWN0aW9uIG1vZGVsLiAqL1xuICBjbG9uZSgpIHtcbiAgICBjb25zdCBjbG9uZSA9IG5ldyBNYXRSYW5nZURhdGVTZWxlY3Rpb25Nb2RlbDxEPih0aGlzLl9hZGFwdGVyKTtcbiAgICBjbG9uZS51cGRhdGVTZWxlY3Rpb24odGhpcy5zZWxlY3Rpb24sIHRoaXMpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxufVxuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1BVF9TSU5HTEVfREFURV9TRUxFQ1RJT05fTU9ERUxfRkFDVE9SWShcbiAgICBwYXJlbnQ6IE1hdFNpbmdsZURhdGVTZWxlY3Rpb25Nb2RlbDx1bmtub3duPiwgYWRhcHRlcjogRGF0ZUFkYXB0ZXI8dW5rbm93bj4pIHtcbiAgcmV0dXJuIHBhcmVudCB8fCBuZXcgTWF0U2luZ2xlRGF0ZVNlbGVjdGlvbk1vZGVsKGFkYXB0ZXIpO1xufVxuXG4vKipcbiAqIFVzZWQgdG8gcHJvdmlkZSBhIHNpbmdsZSBzZWxlY3Rpb24gbW9kZWwgdG8gYSBjb21wb25lbnQuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBNQVRfU0lOR0xFX0RBVEVfU0VMRUNUSU9OX01PREVMX1BST1ZJREVSOiBGYWN0b3J5UHJvdmlkZXIgPSB7XG4gIHByb3ZpZGU6IE1hdERhdGVTZWxlY3Rpb25Nb2RlbCxcbiAgZGVwczogW1tuZXcgT3B0aW9uYWwoKSwgbmV3IFNraXBTZWxmKCksIE1hdERhdGVTZWxlY3Rpb25Nb2RlbF0sIERhdGVBZGFwdGVyXSxcbiAgdXNlRmFjdG9yeTogTUFUX1NJTkdMRV9EQVRFX1NFTEVDVElPTl9NT0RFTF9GQUNUT1JZLFxufTtcblxuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1BVF9SQU5HRV9EQVRFX1NFTEVDVElPTl9NT0RFTF9GQUNUT1JZKFxuICAgIHBhcmVudDogTWF0U2luZ2xlRGF0ZVNlbGVjdGlvbk1vZGVsPHVua25vd24+LCBhZGFwdGVyOiBEYXRlQWRhcHRlcjx1bmtub3duPikge1xuICByZXR1cm4gcGFyZW50IHx8IG5ldyBNYXRSYW5nZURhdGVTZWxlY3Rpb25Nb2RlbChhZGFwdGVyKTtcbn1cblxuLyoqXG4gKiBVc2VkIHRvIHByb3ZpZGUgYSByYW5nZSBzZWxlY3Rpb24gbW9kZWwgdG8gYSBjb21wb25lbnQuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBNQVRfUkFOR0VfREFURV9TRUxFQ1RJT05fTU9ERUxfUFJPVklERVI6IEZhY3RvcnlQcm92aWRlciA9IHtcbiAgcHJvdmlkZTogTWF0RGF0ZVNlbGVjdGlvbk1vZGVsLFxuICBkZXBzOiBbW25ldyBPcHRpb25hbCgpLCBuZXcgU2tpcFNlbGYoKSwgTWF0RGF0ZVNlbGVjdGlvbk1vZGVsXSwgRGF0ZUFkYXB0ZXJdLFxuICB1c2VGYWN0b3J5OiBNQVRfUkFOR0VfREFURV9TRUxFQ1RJT05fTU9ERUxfRkFDVE9SWSxcbn07XG4iXX0=