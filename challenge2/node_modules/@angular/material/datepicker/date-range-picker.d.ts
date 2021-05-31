/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { MatDatepickerBase, MatDatepickerContent, MatDatepickerControl } from './datepicker-base';
import { DateRange } from './date-selection-model';
/**
 * Input that can be associated with a date range picker.
 * @docs-private
 */
export interface MatDateRangePickerInput<D> extends MatDatepickerControl<D> {
    comparisonStart: D | null;
    comparisonEnd: D | null;
}
/** Component responsible for managing the date range picker popup/dialog. */
export declare class MatDateRangePicker<D> extends MatDatepickerBase<MatDateRangePickerInput<D>, DateRange<D>, D> {
    protected _forwardContentValues(instance: MatDatepickerContent<DateRange<D>, D>): void;
}
