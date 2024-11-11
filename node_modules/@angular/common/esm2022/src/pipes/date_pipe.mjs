/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Inject, InjectionToken, LOCALE_ID, Optional, Pipe } from '@angular/core';
import { formatDate } from '../i18n/format_date';
import { DEFAULT_DATE_FORMAT } from './date_pipe_config';
import { invalidPipeArgumentError } from './invalid_pipe_argument_error';
import * as i0 from "@angular/core";
/**
 * Optionally-provided default timezone to use for all instances of `DatePipe` (such as `'+0430'`).
 * If the value isn't provided, the `DatePipe` will use the end-user's local system timezone.
 *
 * @deprecated use DATE_PIPE_DEFAULT_OPTIONS token to configure DatePipe
 */
export const DATE_PIPE_DEFAULT_TIMEZONE = new InjectionToken(ngDevMode ? 'DATE_PIPE_DEFAULT_TIMEZONE' : '');
/**
 * DI token that allows to provide default configuration for the `DatePipe` instances in an
 * application. The value is an object which can include the following fields:
 * - `dateFormat`: configures the default date format. If not provided, the `DatePipe`
 * will use the 'mediumDate' as a value.
 * - `timezone`: configures the default timezone. If not provided, the `DatePipe` will
 * use the end-user's local system timezone.
 *
 * @see {@link DatePipeConfig}
 *
 * @usageNotes
 *
 * Various date pipe default values can be overwritten by providing this token with
 * the value that has this interface.
 *
 * For example:
 *
 * Override the default date format by providing a value using the token:
 * ```typescript
 * providers: [
 *   {provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: {dateFormat: 'shortDate'}}
 * ]
 * ```
 *
 * Override the default timezone by providing a value using the token:
 * ```typescript
 * providers: [
 *   {provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: {timezone: '-1200'}}
 * ]
 * ```
 */
export const DATE_PIPE_DEFAULT_OPTIONS = new InjectionToken(ngDevMode ? 'DATE_PIPE_DEFAULT_OPTIONS' : '');
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a date value according to locale rules.
 *
 * `DatePipe` is executed only when it detects a pure change to the input value.
 * A pure change is either a change to a primitive input value
 * (such as `String`, `Number`, `Boolean`, or `Symbol`),
 * or a changed object reference (such as `Date`, `Array`, `Function`, or `Object`).
 *
 * Note that mutating a `Date` object does not cause the pipe to be rendered again.
 * To ensure that the pipe is executed, you must create a new `Date` object.
 *
 * Only the `en-US` locale data comes with Angular. To localize dates
 * in another language, you must import the corresponding locale data.
 * See the [I18n guide](guide/i18n/format-data-locale) for more information.
 *
 * The time zone of the formatted value can be specified either by passing it in as the second
 * parameter of the pipe, or by setting the default through the `DATE_PIPE_DEFAULT_OPTIONS`
 * injection token. The value that is passed in as the second parameter takes precedence over
 * the one defined using the injection token.
 *
 * @see {@link formatDate}
 *
 *
 * @usageNotes
 *
 * The result of this pipe is not reevaluated when the input is mutated. To avoid the need to
 * reformat the date on every change-detection cycle, treat the date as an immutable object
 * and change the reference when the pipe needs to run again.
 *
 * ### Pre-defined format options
 *
 * | Option        | Equivalent to                       | Examples (given in `en-US` locale)              |
 * |---------------|-------------------------------------|-------------------------------------------------|
 * | `'short'`     | `'M/d/yy, h:mm a'`                  | `6/15/15, 9:03 AM`                              |
 * | `'medium'`    | `'MMM d, y, h:mm:ss a'`             | `Jun 15, 2015, 9:03:01 AM`                      |
 * | `'long'`      | `'MMMM d, y, h:mm:ss a z'`          | `June 15, 2015 at 9:03:01 AM GMT+1`             |
 * | `'full'`      | `'EEEE, MMMM d, y, h:mm:ss a zzzz'` | `Monday, June 15, 2015 at 9:03:01 AM GMT+01:00` |
 * | `'shortDate'` | `'M/d/yy'`                          | `6/15/15`                                       |
 * | `'mediumDate'`| `'MMM d, y'`                        | `Jun 15, 2015`                                  |
 * | `'longDate'`  | `'MMMM d, y'`                       | `June 15, 2015`                                 |
 * | `'fullDate'`  | `'EEEE, MMMM d, y'`                 | `Monday, June 15, 2015`                         |
 * | `'shortTime'` | `'h:mm a'`                          | `9:03 AM`                                       |
 * | `'mediumTime'`| `'h:mm:ss a'`                       | `9:03:01 AM`                                    |
 * | `'longTime'`  | `'h:mm:ss a z'`                     | `9:03:01 AM GMT+1`                              |
 * | `'fullTime'`  | `'h:mm:ss a zzzz'`                  | `9:03:01 AM GMT+01:00`                          |
 *
 * ### Custom format options
 *
 * You can construct a format string using symbols to specify the components
 * of a date-time value, as described in the following table.
 * Format details depend on the locale.
 * Fields marked with (*) are only available in the extra data set for the given locale.
 *
 *  | Field type              | Format      | Description                                                   | Example Value                                              |
 *  |-------------------------|-------------|---------------------------------------------------------------|------------------------------------------------------------|
 *  | Era                     | G, GG & GGG | Abbreviated                                                   | AD                                                         |
 *  |                         | GGGG        | Wide                                                          | Anno Domini                                                |
 *  |                         | GGGGG       | Narrow                                                        | A                                                          |
 *  | Year                    | y           | Numeric: minimum digits                                       | 2, 20, 201, 2017, 20173                                    |
 *  |                         | yy          | Numeric: 2 digits + zero padded                               | 02, 20, 01, 17, 73                                         |
 *  |                         | yyy         | Numeric: 3 digits + zero padded                               | 002, 020, 201, 2017, 20173                                 |
 *  |                         | yyyy        | Numeric: 4 digits or more + zero padded                       | 0002, 0020, 0201, 2017, 20173                              |
 *  | ISO Week-numbering year | Y           | Numeric: minimum digits                                       | 2, 20, 201, 2017, 20173                                    |
 *  |                         | YY          | Numeric: 2 digits + zero padded                               | 02, 20, 01, 17, 73                                         |
 *  |                         | YYY         | Numeric: 3 digits + zero padded                               | 002, 020, 201, 2017, 20173                                 |
 *  |                         | YYYY        | Numeric: 4 digits or more + zero padded                       | 0002, 0020, 0201, 2017, 20173                              |
 *  | Month                   | M           | Numeric: 1 digit                                              | 9, 12                                                      |
 *  |                         | MM          | Numeric: 2 digits + zero padded                               | 09, 12                                                     |
 *  |                         | MMM         | Abbreviated                                                   | Sep                                                        |
 *  |                         | MMMM        | Wide                                                          | September                                                  |
 *  |                         | MMMMM       | Narrow                                                        | S                                                          |
 *  | Month standalone        | L           | Numeric: 1 digit                                              | 9, 12                                                      |
 *  |                         | LL          | Numeric: 2 digits + zero padded                               | 09, 12                                                     |
 *  |                         | LLL         | Abbreviated                                                   | Sep                                                        |
 *  |                         | LLLL        | Wide                                                          | September                                                  |
 *  |                         | LLLLL       | Narrow                                                        | S                                                          |
 *  | ISO Week of year        | w           | Numeric: minimum digits                                       | 1... 53                                                    |
 *  |                         | ww          | Numeric: 2 digits + zero padded                               | 01... 53                                                   |
 *  | Week of month           | W           | Numeric: 1 digit                                              | 1... 5                                                     |
 *  | Day of month            | d           | Numeric: minimum digits                                       | 1                                                          |
 *  |                         | dd          | Numeric: 2 digits + zero padded                               | 01                                                         |
 *  | Week day                | E, EE & EEE | Abbreviated                                                   | Tue                                                        |
 *  |                         | EEEE        | Wide                                                          | Tuesday                                                    |
 *  |                         | EEEEE       | Narrow                                                        | T                                                          |
 *  |                         | EEEEEE      | Short                                                         | Tu                                                         |
 *  | Week day standalone     | c, cc       | Numeric: 1 digit                                              | 2                                                          |
 *  |                         | ccc         | Abbreviated                                                   | Tue                                                        |
 *  |                         | cccc        | Wide                                                          | Tuesday                                                    |
 *  |                         | ccccc       | Narrow                                                        | T                                                          |
 *  |                         | cccccc      | Short                                                         | Tu                                                         |
 *  | Period                  | a, aa & aaa | Abbreviated                                                   | am/pm or AM/PM                                             |
 *  |                         | aaaa        | Wide (fallback to `a` when missing)                           | ante meridiem/post meridiem                                |
 *  |                         | aaaaa       | Narrow                                                        | a/p                                                        |
 *  | Period*                 | B, BB & BBB | Abbreviated                                                   | mid.                                                       |
 *  |                         | BBBB        | Wide                                                          | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  |                         | BBBBB       | Narrow                                                        | md                                                         |
 *  | Period standalone*      | b, bb & bbb | Abbreviated                                                   | mid.                                                       |
 *  |                         | bbbb        | Wide                                                          | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  |                         | bbbbb       | Narrow                                                        | md                                                         |
 *  | Hour 1-12               | h           | Numeric: minimum digits                                       | 1, 12                                                      |
 *  |                         | hh          | Numeric: 2 digits + zero padded                               | 01, 12                                                     |
 *  | Hour 0-23               | H           | Numeric: minimum digits                                       | 0, 23                                                      |
 *  |                         | HH          | Numeric: 2 digits + zero padded                               | 00, 23                                                     |
 *  | Minute                  | m           | Numeric: minimum digits                                       | 8, 59                                                      |
 *  |                         | mm          | Numeric: 2 digits + zero padded                               | 08, 59                                                     |
 *  | Second                  | s           | Numeric: minimum digits                                       | 0... 59                                                    |
 *  |                         | ss          | Numeric: 2 digits + zero padded                               | 00... 59                                                   |
 *  | Fractional seconds      | S           | Numeric: 1 digit                                              | 0... 9                                                     |
 *  |                         | SS          | Numeric: 2 digits + zero padded                               | 00... 99                                                   |
 *  |                         | SSS         | Numeric: 3 digits + zero padded (= milliseconds)              | 000... 999                                                 |
 *  | Zone                    | z, zz & zzz | Short specific non location format (fallback to O)            | GMT-8                                                      |
 *  |                         | zzzz        | Long specific non location format (fallback to OOOO)          | GMT-08:00                                                  |
 *  |                         | Z, ZZ & ZZZ | ISO8601 basic format                                          | -0800                                                      |
 *  |                         | ZZZZ        | Long localized GMT format                                     | GMT-8:00                                                   |
 *  |                         | ZZZZZ       | ISO8601 extended format + Z indicator for offset 0 (= XXXXX)  | -08:00                                                     |
 *  |                         | O, OO & OOO | Short localized GMT format                                    | GMT-8                                                      |
 *  |                         | OOOO        | Long localized GMT format                                     | GMT-08:00                                                  |
 *
 *
 * ### Format examples
 *
 * These examples transform a date into various formats,
 * assuming that `dateObj` is a JavaScript `Date` object for
 * year: 2015, month: 6, day: 15, hour: 21, minute: 43, second: 11,
 * given in the local time for the `en-US` locale.
 *
 * ```
 * {{ dateObj | date }}               // output is 'Jun 15, 2015'
 * {{ dateObj | date:'medium' }}      // output is 'Jun 15, 2015, 9:43:11 PM'
 * {{ dateObj | date:'shortTime' }}   // output is '9:43 PM'
 * {{ dateObj | date:'mm:ss' }}       // output is '43:11'
 * {{ dateObj | date:"MMM dd, yyyy 'at' hh:mm a" }}  // output is 'Jun 15, 2015 at 09:43 PM'
 * ```
 *
 * ### Usage example
 *
 * The following component uses a date pipe to display the current date in different formats.
 *
 * ```
 * @Component({
 *  selector: 'date-pipe',
 *  template: `<div>
 *    <p>Today is {{today | date}}</p>
 *    <p>Or if you prefer, {{today | date:'fullDate'}}</p>
 *    <p>The time is {{today | date:'h:mm a z'}}</p>
 *  </div>`
 * })
 * // Get the current date and time as a date-time value.
 * export class DatePipeComponent {
 *   today: number = Date.now();
 * }
 * ```
 *
 * @publicApi
 */
export class DatePipe {
    constructor(locale, defaultTimezone, defaultOptions) {
        this.locale = locale;
        this.defaultTimezone = defaultTimezone;
        this.defaultOptions = defaultOptions;
    }
    transform(value, format, timezone, locale) {
        if (value == null || value === '' || value !== value)
            return null;
        try {
            const _format = format ?? this.defaultOptions?.dateFormat ?? DEFAULT_DATE_FORMAT;
            const _timezone = timezone ?? this.defaultOptions?.timezone ?? this.defaultTimezone ?? undefined;
            return formatDate(value, _format, locale || this.locale, _timezone);
        }
        catch (error) {
            throw invalidPipeArgumentError(DatePipe, error.message);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: DatePipe, deps: [{ token: LOCALE_ID }, { token: DATE_PIPE_DEFAULT_TIMEZONE, optional: true }, { token: DATE_PIPE_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.2.7", ngImport: i0, type: DatePipe, isStandalone: true, name: "date" }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: DatePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'date',
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [LOCALE_ID]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DATE_PIPE_DEFAULT_TIMEZONE]
                }, {
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DATE_PIPE_DEFAULT_OPTIONS]
                }, {
                    type: Optional
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZV9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9waXBlcy9kYXRlX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBRS9GLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUUvQyxPQUFPLEVBQWlCLG1CQUFtQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDdkUsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7O0FBRXZFOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxjQUFjLENBQzFELFNBQVMsQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDOUMsQ0FBQztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFDSCxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLGNBQWMsQ0FDekQsU0FBUyxDQUFDLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUM3QyxDQUFDO0FBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E2Skc7QUFLSCxNQUFNLE9BQU8sUUFBUTtJQUNuQixZQUM2QixNQUFjLEVBQ2UsZUFBK0IsRUFDaEMsY0FBc0M7UUFGbEUsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNlLG9CQUFlLEdBQWYsZUFBZSxDQUFnQjtRQUNoQyxtQkFBYyxHQUFkLGNBQWMsQ0FBd0I7SUFDNUYsQ0FBQztJQWtDSixTQUFTLENBQ1AsS0FBZ0QsRUFDaEQsTUFBZSxFQUNmLFFBQWlCLEVBQ2pCLE1BQWU7UUFFZixJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUUsSUFBSSxLQUFLLEtBQUssS0FBSztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRWxFLElBQUksQ0FBQztZQUNILE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLFVBQVUsSUFBSSxtQkFBbUIsQ0FBQztZQUNqRixNQUFNLFNBQVMsR0FDYixRQUFRLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxRQUFRLElBQUksSUFBSSxDQUFDLGVBQWUsSUFBSSxTQUFTLENBQUM7WUFDakYsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE1BQU0sd0JBQXdCLENBQUMsUUFBUSxFQUFHLEtBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyRSxDQUFDO0lBQ0gsQ0FBQzt5SEF2RFUsUUFBUSxrQkFFVCxTQUFTLGFBQ1QsMEJBQTBCLDZCQUMxQix5QkFBeUI7dUhBSnhCLFFBQVE7O3NHQUFSLFFBQVE7a0JBSnBCLElBQUk7bUJBQUM7b0JBQ0osSUFBSSxFQUFFLE1BQU07b0JBQ1osVUFBVSxFQUFFLElBQUk7aUJBQ2pCOzswQkFHSSxNQUFNOzJCQUFDLFNBQVM7OzBCQUNoQixNQUFNOzJCQUFDLDBCQUEwQjs7MEJBQUcsUUFBUTs7MEJBQzVDLE1BQU07MkJBQUMseUJBQXlCOzswQkFBRyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0aW9uVG9rZW4sIExPQ0FMRV9JRCwgT3B0aW9uYWwsIFBpcGUsIFBpcGVUcmFuc2Zvcm19IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2Zvcm1hdERhdGV9IGZyb20gJy4uL2kxOG4vZm9ybWF0X2RhdGUnO1xuXG5pbXBvcnQge0RhdGVQaXBlQ29uZmlnLCBERUZBVUxUX0RBVEVfRk9STUFUfSBmcm9tICcuL2RhdGVfcGlwZV9jb25maWcnO1xuaW1wb3J0IHtpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3J9IGZyb20gJy4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcblxuLyoqXG4gKiBPcHRpb25hbGx5LXByb3ZpZGVkIGRlZmF1bHQgdGltZXpvbmUgdG8gdXNlIGZvciBhbGwgaW5zdGFuY2VzIG9mIGBEYXRlUGlwZWAgKHN1Y2ggYXMgYCcrMDQzMCdgKS5cbiAqIElmIHRoZSB2YWx1ZSBpc24ndCBwcm92aWRlZCwgdGhlIGBEYXRlUGlwZWAgd2lsbCB1c2UgdGhlIGVuZC11c2VyJ3MgbG9jYWwgc3lzdGVtIHRpbWV6b25lLlxuICpcbiAqIEBkZXByZWNhdGVkIHVzZSBEQVRFX1BJUEVfREVGQVVMVF9PUFRJT05TIHRva2VuIHRvIGNvbmZpZ3VyZSBEYXRlUGlwZVxuICovXG5leHBvcnQgY29uc3QgREFURV9QSVBFX0RFRkFVTFRfVElNRVpPTkUgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPihcbiAgbmdEZXZNb2RlID8gJ0RBVEVfUElQRV9ERUZBVUxUX1RJTUVaT05FJyA6ICcnLFxuKTtcblxuLyoqXG4gKiBESSB0b2tlbiB0aGF0IGFsbG93cyB0byBwcm92aWRlIGRlZmF1bHQgY29uZmlndXJhdGlvbiBmb3IgdGhlIGBEYXRlUGlwZWAgaW5zdGFuY2VzIGluIGFuXG4gKiBhcHBsaWNhdGlvbi4gVGhlIHZhbHVlIGlzIGFuIG9iamVjdCB3aGljaCBjYW4gaW5jbHVkZSB0aGUgZm9sbG93aW5nIGZpZWxkczpcbiAqIC0gYGRhdGVGb3JtYXRgOiBjb25maWd1cmVzIHRoZSBkZWZhdWx0IGRhdGUgZm9ybWF0LiBJZiBub3QgcHJvdmlkZWQsIHRoZSBgRGF0ZVBpcGVgXG4gKiB3aWxsIHVzZSB0aGUgJ21lZGl1bURhdGUnIGFzIGEgdmFsdWUuXG4gKiAtIGB0aW1lem9uZWA6IGNvbmZpZ3VyZXMgdGhlIGRlZmF1bHQgdGltZXpvbmUuIElmIG5vdCBwcm92aWRlZCwgdGhlIGBEYXRlUGlwZWAgd2lsbFxuICogdXNlIHRoZSBlbmQtdXNlcidzIGxvY2FsIHN5c3RlbSB0aW1lem9uZS5cbiAqXG4gKiBAc2VlIHtAbGluayBEYXRlUGlwZUNvbmZpZ31cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFZhcmlvdXMgZGF0ZSBwaXBlIGRlZmF1bHQgdmFsdWVzIGNhbiBiZSBvdmVyd3JpdHRlbiBieSBwcm92aWRpbmcgdGhpcyB0b2tlbiB3aXRoXG4gKiB0aGUgdmFsdWUgdGhhdCBoYXMgdGhpcyBpbnRlcmZhY2UuXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogT3ZlcnJpZGUgdGhlIGRlZmF1bHQgZGF0ZSBmb3JtYXQgYnkgcHJvdmlkaW5nIGEgdmFsdWUgdXNpbmcgdGhlIHRva2VuOlxuICogYGBgdHlwZXNjcmlwdFxuICogcHJvdmlkZXJzOiBbXG4gKiAgIHtwcm92aWRlOiBEQVRFX1BJUEVfREVGQVVMVF9PUFRJT05TLCB1c2VWYWx1ZToge2RhdGVGb3JtYXQ6ICdzaG9ydERhdGUnfX1cbiAqIF1cbiAqIGBgYFxuICpcbiAqIE92ZXJyaWRlIHRoZSBkZWZhdWx0IHRpbWV6b25lIGJ5IHByb3ZpZGluZyBhIHZhbHVlIHVzaW5nIHRoZSB0b2tlbjpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHByb3ZpZGVyczogW1xuICogICB7cHJvdmlkZTogREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OUywgdXNlVmFsdWU6IHt0aW1lem9uZTogJy0xMjAwJ319XG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IERBVEVfUElQRV9ERUZBVUxUX09QVElPTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48RGF0ZVBpcGVDb25maWc+KFxuICBuZ0Rldk1vZGUgPyAnREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OUycgOiAnJyxcbik7XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogRm9ybWF0cyBhIGRhdGUgdmFsdWUgYWNjb3JkaW5nIHRvIGxvY2FsZSBydWxlcy5cbiAqXG4gKiBgRGF0ZVBpcGVgIGlzIGV4ZWN1dGVkIG9ubHkgd2hlbiBpdCBkZXRlY3RzIGEgcHVyZSBjaGFuZ2UgdG8gdGhlIGlucHV0IHZhbHVlLlxuICogQSBwdXJlIGNoYW5nZSBpcyBlaXRoZXIgYSBjaGFuZ2UgdG8gYSBwcmltaXRpdmUgaW5wdXQgdmFsdWVcbiAqIChzdWNoIGFzIGBTdHJpbmdgLCBgTnVtYmVyYCwgYEJvb2xlYW5gLCBvciBgU3ltYm9sYCksXG4gKiBvciBhIGNoYW5nZWQgb2JqZWN0IHJlZmVyZW5jZSAoc3VjaCBhcyBgRGF0ZWAsIGBBcnJheWAsIGBGdW5jdGlvbmAsIG9yIGBPYmplY3RgKS5cbiAqXG4gKiBOb3RlIHRoYXQgbXV0YXRpbmcgYSBgRGF0ZWAgb2JqZWN0IGRvZXMgbm90IGNhdXNlIHRoZSBwaXBlIHRvIGJlIHJlbmRlcmVkIGFnYWluLlxuICogVG8gZW5zdXJlIHRoYXQgdGhlIHBpcGUgaXMgZXhlY3V0ZWQsIHlvdSBtdXN0IGNyZWF0ZSBhIG5ldyBgRGF0ZWAgb2JqZWN0LlxuICpcbiAqIE9ubHkgdGhlIGBlbi1VU2AgbG9jYWxlIGRhdGEgY29tZXMgd2l0aCBBbmd1bGFyLiBUbyBsb2NhbGl6ZSBkYXRlc1xuICogaW4gYW5vdGhlciBsYW5ndWFnZSwgeW91IG11c3QgaW1wb3J0IHRoZSBjb3JyZXNwb25kaW5nIGxvY2FsZSBkYXRhLlxuICogU2VlIHRoZSBbSTE4biBndWlkZV0oZ3VpZGUvaTE4bi9mb3JtYXQtZGF0YS1sb2NhbGUpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIFRoZSB0aW1lIHpvbmUgb2YgdGhlIGZvcm1hdHRlZCB2YWx1ZSBjYW4gYmUgc3BlY2lmaWVkIGVpdGhlciBieSBwYXNzaW5nIGl0IGluIGFzIHRoZSBzZWNvbmRcbiAqIHBhcmFtZXRlciBvZiB0aGUgcGlwZSwgb3IgYnkgc2V0dGluZyB0aGUgZGVmYXVsdCB0aHJvdWdoIHRoZSBgREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OU2BcbiAqIGluamVjdGlvbiB0b2tlbi4gVGhlIHZhbHVlIHRoYXQgaXMgcGFzc2VkIGluIGFzIHRoZSBzZWNvbmQgcGFyYW1ldGVyIHRha2VzIHByZWNlZGVuY2Ugb3ZlclxuICogdGhlIG9uZSBkZWZpbmVkIHVzaW5nIHRoZSBpbmplY3Rpb24gdG9rZW4uXG4gKlxuICogQHNlZSB7QGxpbmsgZm9ybWF0RGF0ZX1cbiAqXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBUaGUgcmVzdWx0IG9mIHRoaXMgcGlwZSBpcyBub3QgcmVldmFsdWF0ZWQgd2hlbiB0aGUgaW5wdXQgaXMgbXV0YXRlZC4gVG8gYXZvaWQgdGhlIG5lZWQgdG9cbiAqIHJlZm9ybWF0IHRoZSBkYXRlIG9uIGV2ZXJ5IGNoYW5nZS1kZXRlY3Rpb24gY3ljbGUsIHRyZWF0IHRoZSBkYXRlIGFzIGFuIGltbXV0YWJsZSBvYmplY3RcbiAqIGFuZCBjaGFuZ2UgdGhlIHJlZmVyZW5jZSB3aGVuIHRoZSBwaXBlIG5lZWRzIHRvIHJ1biBhZ2Fpbi5cbiAqXG4gKiAjIyMgUHJlLWRlZmluZWQgZm9ybWF0IG9wdGlvbnNcbiAqXG4gKiB8IE9wdGlvbiAgICAgICAgfCBFcXVpdmFsZW50IHRvICAgICAgICAgICAgICAgICAgICAgICB8IEV4YW1wbGVzIChnaXZlbiBpbiBgZW4tVVNgIGxvY2FsZSkgICAgICAgICAgICAgIHxcbiAqIHwtLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxuICogfCBgJ3Nob3J0J2AgICAgIHwgYCdNL2QveXksIGg6bW0gYSdgICAgICAgICAgICAgICAgICAgfCBgNi8xNS8xNSwgOTowMyBBTWAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGAnbWVkaXVtJ2AgICAgfCBgJ01NTSBkLCB5LCBoOm1tOnNzIGEnYCAgICAgICAgICAgICB8IGBKdW4gMTUsIDIwMTUsIDk6MDM6MDEgQU1gICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdsb25nJ2AgICAgICB8IGAnTU1NTSBkLCB5LCBoOm1tOnNzIGEgeidgICAgICAgICAgIHwgYEp1bmUgMTUsIDIwMTUgYXQgOTowMzowMSBBTSBHTVQrMWAgICAgICAgICAgICAgfFxuICogfCBgJ2Z1bGwnYCAgICAgIHwgYCdFRUVFLCBNTU1NIGQsIHksIGg6bW06c3MgYSB6enp6J2AgfCBgTW9uZGF5LCBKdW5lIDE1LCAyMDE1IGF0IDk6MDM6MDEgQU0gR01UKzAxOjAwYCB8XG4gKiB8IGAnc2hvcnREYXRlJ2AgfCBgJ00vZC95eSdgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGA2LzE1LzE1YCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdtZWRpdW1EYXRlJ2B8IGAnTU1NIGQsIHknYCAgICAgICAgICAgICAgICAgICAgICAgIHwgYEp1biAxNSwgMjAxNWAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgJ2xvbmdEYXRlJ2AgIHwgYCdNTU1NIGQsIHknYCAgICAgICAgICAgICAgICAgICAgICAgfCBgSnVuZSAxNSwgMjAxNWAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGAnZnVsbERhdGUnYCAgfCBgJ0VFRUUsIE1NTU0gZCwgeSdgICAgICAgICAgICAgICAgICB8IGBNb25kYXksIEp1bmUgMTUsIDIwMTVgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdzaG9ydFRpbWUnYCB8IGAnaDptbSBhJ2AgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYDk6MDMgQU1gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgJ21lZGl1bVRpbWUnYHwgYCdoOm1tOnNzIGEnYCAgICAgICAgICAgICAgICAgICAgICAgfCBgOTowMzowMSBBTWAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGAnbG9uZ1RpbWUnYCAgfCBgJ2g6bW06c3MgYSB6J2AgICAgICAgICAgICAgICAgICAgICB8IGA5OjAzOjAxIEFNIEdNVCsxYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdmdWxsVGltZSdgICB8IGAnaDptbTpzcyBhIHp6enonYCAgICAgICAgICAgICAgICAgIHwgYDk6MDM6MDEgQU0gR01UKzAxOjAwYCAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICpcbiAqICMjIyBDdXN0b20gZm9ybWF0IG9wdGlvbnNcbiAqXG4gKiBZb3UgY2FuIGNvbnN0cnVjdCBhIGZvcm1hdCBzdHJpbmcgdXNpbmcgc3ltYm9scyB0byBzcGVjaWZ5IHRoZSBjb21wb25lbnRzXG4gKiBvZiBhIGRhdGUtdGltZSB2YWx1ZSwgYXMgZGVzY3JpYmVkIGluIHRoZSBmb2xsb3dpbmcgdGFibGUuXG4gKiBGb3JtYXQgZGV0YWlscyBkZXBlbmQgb24gdGhlIGxvY2FsZS5cbiAqIEZpZWxkcyBtYXJrZWQgd2l0aCAoKikgYXJlIG9ubHkgYXZhaWxhYmxlIGluIHRoZSBleHRyYSBkYXRhIHNldCBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqXG4gKiAgfCBGaWVsZCB0eXBlICAgICAgICAgICAgICB8IEZvcm1hdCAgICAgIHwgRGVzY3JpcHRpb24gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEV4YW1wbGUgVmFsdWUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXxcbiAqICB8IEVyYSAgICAgICAgICAgICAgICAgICAgIHwgRywgR0cgJiBHR0cgfCBBYmJyZXZpYXRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgQUQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IEdHR0cgICAgICAgIHwgV2lkZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEFubm8gRG9taW5pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBHR0dHRyAgICAgICB8IE5hcnJvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBBICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFllYXIgICAgICAgICAgICAgICAgICAgIHwgeSAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMiwgMjAsIDIwMSwgMjAxNywgMjAxNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IHl5ICAgICAgICAgIHwgTnVtZXJpYzogMiBkaWdpdHMgKyB6ZXJvIHBhZGRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDAyLCAyMCwgMDEsIDE3LCA3MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCB5eXkgICAgICAgICB8IE51bWVyaWM6IDMgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMDIsIDAyMCwgMjAxLCAyMDE3LCAyMDE3MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgeXl5eSAgICAgICAgfCBOdW1lcmljOiA0IGRpZ2l0cyBvciBtb3JlICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgIHwgMDAwMiwgMDAyMCwgMDIwMSwgMjAxNywgMjAxNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBJU08gV2Vlay1udW1iZXJpbmcgeWVhciB8IFkgICAgICAgICAgIHwgTnVtZXJpYzogbWluaW11bSBkaWdpdHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDIsIDIwLCAyMDEsIDIwMTcsIDIwMTczICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBZWSAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMiwgMjAsIDAxLCAxNywgNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgWVlZICAgICAgICAgfCBOdW1lcmljOiAzIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDAyLCAwMjAsIDIwMSwgMjAxNywgMjAxNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IFlZWVkgICAgICAgIHwgTnVtZXJpYzogNCBkaWdpdHMgb3IgbW9yZSArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICB8IDAwMDIsIDAwMjAsIDAyMDEsIDIwMTcsIDIwMTczICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgTW9udGggICAgICAgICAgICAgICAgICAgfCBNICAgICAgICAgICB8IE51bWVyaWM6IDEgZGlnaXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCA5LCAxMiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgTU0gICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDksIDEyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IE1NTSAgICAgICAgIHwgQWJicmV2aWF0ZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFNlcCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBNTU1NICAgICAgICB8IFdpZGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBTZXB0ZW1iZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgTU1NTU0gICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBNb250aCBzdGFuZGFsb25lICAgICAgICB8IEwgICAgICAgICAgIHwgTnVtZXJpYzogMSBkaWdpdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDksIDEyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBMTCAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwOSwgMTIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgTExMICAgICAgICAgfCBBYmJyZXZpYXRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgU2VwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IExMTEwgICAgICAgIHwgV2lkZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFNlcHRlbWJlciAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBMTExMTCAgICAgICB8IE5hcnJvdyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBTICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IElTTyBXZWVrIG9mIHllYXIgICAgICAgIHwgdyAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMS4uLiA1MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IHd3ICAgICAgICAgIHwgTnVtZXJpYzogMiBkaWdpdHMgKyB6ZXJvIHBhZGRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDAxLi4uIDUzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgV2VlayBvZiBtb250aCAgICAgICAgICAgfCBXICAgICAgICAgICB8IE51bWVyaWM6IDEgZGlnaXQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAxLi4uIDUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IERheSBvZiBtb250aCAgICAgICAgICAgIHwgZCAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IGRkICAgICAgICAgIHwgTnVtZXJpYzogMiBkaWdpdHMgKyB6ZXJvIHBhZGRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDAxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgV2VlayBkYXkgICAgICAgICAgICAgICAgfCBFLCBFRSAmIEVFRSB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUdWUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgRUVFRSAgICAgICAgfCBXaWRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgVHVlc2RheSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IEVFRUVFICAgICAgIHwgTmFycm93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBFRUVFRUUgICAgICB8IFNob3J0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUdSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IFdlZWsgZGF5IHN0YW5kYWxvbmUgICAgIHwgYywgY2MgICAgICAgfCBOdW1lcmljOiAxIGRpZ2l0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IGNjYyAgICAgICAgIHwgQWJicmV2aWF0ZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFR1ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBjY2NjICAgICAgICB8IFdpZGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBUdWVzZGF5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgY2NjY2MgICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgVCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IGNjY2NjYyAgICAgIHwgU2hvcnQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IFR1ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgUGVyaW9kICAgICAgICAgICAgICAgICAgfCBhLCBhYSAmIGFhYSB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBhbS9wbSBvciBBTS9QTSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgYWFhYSAgICAgICAgfCBXaWRlIChmYWxsYmFjayB0byBgYWAgd2hlbiBtaXNzaW5nKSAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYW50ZSBtZXJpZGllbS9wb3N0IG1lcmlkaWVtICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IGFhYWFhICAgICAgIHwgTmFycm93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGEvcCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgUGVyaW9kKiAgICAgICAgICAgICAgICAgfCBCLCBCQiAmIEJCQiB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBtaWQuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgQkJCQiAgICAgICAgfCBXaWRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYW0sIHBtLCBtaWRuaWdodCwgbm9vbiwgbW9ybmluZywgYWZ0ZXJub29uLCBldmVuaW5nLCBuaWdodCB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IEJCQkJCICAgICAgIHwgTmFycm93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IG1kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgUGVyaW9kIHN0YW5kYWxvbmUqICAgICAgfCBiLCBiYiAmIGJiYiB8IEFiYnJldmlhdGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCBtaWQuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgYmJiYiAgICAgICAgfCBXaWRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYW0sIHBtLCBtaWRuaWdodCwgbm9vbiwgbW9ybmluZywgYWZ0ZXJub29uLCBldmVuaW5nLCBuaWdodCB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IGJiYmJiICAgICAgIHwgTmFycm93ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IG1kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgSG91ciAxLTEyICAgICAgICAgICAgICAgfCBoICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAxLCAxMiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgaGggICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDEsIDEyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBIb3VyIDAtMjMgICAgICAgICAgICAgICB8IEggICAgICAgICAgIHwgTnVtZXJpYzogbWluaW11bSBkaWdpdHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDAsIDIzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBISCAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMCwgMjMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8IE1pbnV0ZSAgICAgICAgICAgICAgICAgIHwgbSAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgOCwgNTkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IG1tICAgICAgICAgIHwgTnVtZXJpYzogMiBkaWdpdHMgKyB6ZXJvIHBhZGRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDA4LCA1OSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgU2Vjb25kICAgICAgICAgICAgICAgICAgfCBzICAgICAgICAgICB8IE51bWVyaWM6IG1pbmltdW0gZGlnaXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwLi4uIDU5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgc3MgICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDAuLi4gNTkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBGcmFjdGlvbmFsIHNlY29uZHMgICAgICB8IFMgICAgICAgICAgIHwgTnVtZXJpYzogMSBkaWdpdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IDAuLi4gOSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBTUyAgICAgICAgICB8IE51bWVyaWM6IDIgZGlnaXRzICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAwMC4uLiA5OSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgU1NTICAgICAgICAgfCBOdW1lcmljOiAzIGRpZ2l0cyArIHplcm8gcGFkZGVkICg9IG1pbGxpc2Vjb25kcykgICAgICAgICAgICAgIHwgMDAwLi4uIDk5OSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBab25lICAgICAgICAgICAgICAgICAgICB8IHosIHp6ICYgenp6IHwgU2hvcnQgc3BlY2lmaWMgbm9uIGxvY2F0aW9uIGZvcm1hdCAoZmFsbGJhY2sgdG8gTykgICAgICAgICAgICB8IEdNVC04ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCB6enp6ICAgICAgICB8IExvbmcgc3BlY2lmaWMgbm9uIGxvY2F0aW9uIGZvcm1hdCAoZmFsbGJhY2sgdG8gT09PTykgICAgICAgICAgfCBHTVQtMDg6MDAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgWiwgWlogJiBaWlogfCBJU084NjAxIGJhc2ljIGZvcm1hdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgLTA4MDAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IFpaWlogICAgICAgIHwgTG9uZyBsb2NhbGl6ZWQgR01UIGZvcm1hdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEdNVC04OjAwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICAgfCBaWlpaWiAgICAgICB8IElTTzg2MDEgZXh0ZW5kZWQgZm9ybWF0ICsgWiBpbmRpY2F0b3IgZm9yIG9mZnNldCAwICg9IFhYWFhYKSAgfCAtMDg6MDAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgIHwgTywgT08gJiBPT08gfCBTaG9ydCBsb2NhbGl6ZWQgR01UIGZvcm1hdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgR01ULTggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgICB8IE9PT08gICAgICAgIHwgTG9uZyBsb2NhbGl6ZWQgR01UIGZvcm1hdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8IEdNVC0wODowMCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICpcbiAqXG4gKiAjIyMgRm9ybWF0IGV4YW1wbGVzXG4gKlxuICogVGhlc2UgZXhhbXBsZXMgdHJhbnNmb3JtIGEgZGF0ZSBpbnRvIHZhcmlvdXMgZm9ybWF0cyxcbiAqIGFzc3VtaW5nIHRoYXQgYGRhdGVPYmpgIGlzIGEgSmF2YVNjcmlwdCBgRGF0ZWAgb2JqZWN0IGZvclxuICogeWVhcjogMjAxNSwgbW9udGg6IDYsIGRheTogMTUsIGhvdXI6IDIxLCBtaW51dGU6IDQzLCBzZWNvbmQ6IDExLFxuICogZ2l2ZW4gaW4gdGhlIGxvY2FsIHRpbWUgZm9yIHRoZSBgZW4tVVNgIGxvY2FsZS5cbiAqXG4gKiBgYGBcbiAqIHt7IGRhdGVPYmogfCBkYXRlIH19ICAgICAgICAgICAgICAgLy8gb3V0cHV0IGlzICdKdW4gMTUsIDIwMTUnXG4gKiB7eyBkYXRlT2JqIHwgZGF0ZTonbWVkaXVtJyB9fSAgICAgIC8vIG91dHB1dCBpcyAnSnVuIDE1LCAyMDE1LCA5OjQzOjExIFBNJ1xuICoge3sgZGF0ZU9iaiB8IGRhdGU6J3Nob3J0VGltZScgfX0gICAvLyBvdXRwdXQgaXMgJzk6NDMgUE0nXG4gKiB7eyBkYXRlT2JqIHwgZGF0ZTonbW06c3MnIH19ICAgICAgIC8vIG91dHB1dCBpcyAnNDM6MTEnXG4gKiB7eyBkYXRlT2JqIHwgZGF0ZTpcIk1NTSBkZCwgeXl5eSAnYXQnIGhoOm1tIGFcIiB9fSAgLy8gb3V0cHV0IGlzICdKdW4gMTUsIDIwMTUgYXQgMDk6NDMgUE0nXG4gKiBgYGBcbiAqXG4gKiAjIyMgVXNhZ2UgZXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgY29tcG9uZW50IHVzZXMgYSBkYXRlIHBpcGUgdG8gZGlzcGxheSB0aGUgY3VycmVudCBkYXRlIGluIGRpZmZlcmVudCBmb3JtYXRzLlxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgc2VsZWN0b3I6ICdkYXRlLXBpcGUnLFxuICogIHRlbXBsYXRlOiBgPGRpdj5cbiAqICAgIDxwPlRvZGF5IGlzIHt7dG9kYXkgfCBkYXRlfX08L3A+XG4gKiAgICA8cD5PciBpZiB5b3UgcHJlZmVyLCB7e3RvZGF5IHwgZGF0ZTonZnVsbERhdGUnfX08L3A+XG4gKiAgICA8cD5UaGUgdGltZSBpcyB7e3RvZGF5IHwgZGF0ZTonaDptbSBhIHonfX08L3A+XG4gKiAgPC9kaXY+YFxuICogfSlcbiAqIC8vIEdldCB0aGUgY3VycmVudCBkYXRlIGFuZCB0aW1lIGFzIGEgZGF0ZS10aW1lIHZhbHVlLlxuICogZXhwb3J0IGNsYXNzIERhdGVQaXBlQ29tcG9uZW50IHtcbiAqICAgdG9kYXk6IG51bWJlciA9IERhdGUubm93KCk7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtcbiAgbmFtZTogJ2RhdGUnLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBEYXRlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBsb2NhbGU6IHN0cmluZyxcbiAgICBASW5qZWN0KERBVEVfUElQRV9ERUZBVUxUX1RJTUVaT05FKSBAT3B0aW9uYWwoKSBwcml2YXRlIGRlZmF1bHRUaW1lem9uZT86IHN0cmluZyB8IG51bGwsXG4gICAgQEluamVjdChEQVRFX1BJUEVfREVGQVVMVF9PUFRJT05TKSBAT3B0aW9uYWwoKSBwcml2YXRlIGRlZmF1bHRPcHRpb25zPzogRGF0ZVBpcGVDb25maWcgfCBudWxsLFxuICApIHt9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgZGF0ZSBleHByZXNzaW9uOiBhIGBEYXRlYCBvYmplY3QsICBhIG51bWJlclxuICAgKiAobWlsbGlzZWNvbmRzIHNpbmNlIFVUQyBlcG9jaCksIG9yIGFuIElTTyBzdHJpbmcgKGh0dHBzOi8vd3d3LnczLm9yZy9UUi9OT1RFLWRhdGV0aW1lKS5cbiAgICogQHBhcmFtIGZvcm1hdCBUaGUgZGF0ZS90aW1lIGNvbXBvbmVudHMgdG8gaW5jbHVkZSwgdXNpbmcgcHJlZGVmaW5lZCBvcHRpb25zIG9yIGFcbiAgICogY3VzdG9tIGZvcm1hdCBzdHJpbmcuICBXaGVuIG5vdCBwcm92aWRlZCwgdGhlIGBEYXRlUGlwZWAgbG9va3MgZm9yIHRoZSB2YWx1ZSB1c2luZyB0aGVcbiAgICogYERBVEVfUElQRV9ERUZBVUxUX09QVElPTlNgIGluamVjdGlvbiB0b2tlbiAoYW5kIHJlYWRzIHRoZSBgZGF0ZUZvcm1hdGAgcHJvcGVydHkpLlxuICAgKiBJZiB0aGUgdG9rZW4gaXMgbm90IGNvbmZpZ3VyZWQsIHRoZSBgbWVkaXVtRGF0ZWAgaXMgdXNlZCBhcyBhIHZhbHVlLlxuICAgKiBAcGFyYW0gdGltZXpvbmUgQSB0aW1lem9uZSBvZmZzZXQgKHN1Y2ggYXMgYCcrMDQzMCdgKS4gV2hlbiBub3QgcHJvdmlkZWQsIHRoZSBgRGF0ZVBpcGVgXG4gICAqIGxvb2tzIGZvciB0aGUgdmFsdWUgdXNpbmcgdGhlIGBEQVRFX1BJUEVfREVGQVVMVF9PUFRJT05TYCBpbmplY3Rpb24gdG9rZW4gKGFuZCByZWFkc1xuICAgKiB0aGUgYHRpbWV6b25lYCBwcm9wZXJ0eSkuIElmIHRoZSB0b2tlbiBpcyBub3QgY29uZmlndXJlZCwgdGhlIGVuZC11c2VyJ3MgbG9jYWwgc3lzdGVtXG4gICAqIHRpbWV6b25lIGlzIHVzZWQgYXMgYSB2YWx1ZS5cbiAgICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gICAqIFdoZW4gbm90IHN1cHBsaWVkLCB1c2VzIHRoZSB2YWx1ZSBvZiBgTE9DQUxFX0lEYCwgd2hpY2ggaXMgYGVuLVVTYCBieSBkZWZhdWx0LlxuICAgKiBTZWUgW1NldHRpbmcgeW91ciBhcHAgbG9jYWxlXShndWlkZS9pMThuL2xvY2FsZS1pZCkuXG4gICAqXG4gICAqIEBzZWUge0BsaW5rIERBVEVfUElQRV9ERUZBVUxUX09QVElPTlN9XG4gICAqXG4gICAqIEByZXR1cm5zIEEgZGF0ZSBzdHJpbmcgaW4gdGhlIGRlc2lyZWQgZm9ybWF0LlxuICAgKi9cbiAgdHJhbnNmb3JtKFxuICAgIHZhbHVlOiBEYXRlIHwgc3RyaW5nIHwgbnVtYmVyLFxuICAgIGZvcm1hdD86IHN0cmluZyxcbiAgICB0aW1lem9uZT86IHN0cmluZyxcbiAgICBsb2NhbGU/OiBzdHJpbmcsXG4gICk6IHN0cmluZyB8IG51bGw7XG4gIHRyYW5zZm9ybSh2YWx1ZTogbnVsbCB8IHVuZGVmaW5lZCwgZm9ybWF0Pzogc3RyaW5nLCB0aW1lem9uZT86IHN0cmluZywgbG9jYWxlPzogc3RyaW5nKTogbnVsbDtcbiAgdHJhbnNmb3JtKFxuICAgIHZhbHVlOiBEYXRlIHwgc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBmb3JtYXQ/OiBzdHJpbmcsXG4gICAgdGltZXpvbmU/OiBzdHJpbmcsXG4gICAgbG9jYWxlPzogc3RyaW5nLFxuICApOiBzdHJpbmcgfCBudWxsO1xuICB0cmFuc2Zvcm0oXG4gICAgdmFsdWU6IERhdGUgfCBzdHJpbmcgfCBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkLFxuICAgIGZvcm1hdD86IHN0cmluZyxcbiAgICB0aW1lem9uZT86IHN0cmluZyxcbiAgICBsb2NhbGU/OiBzdHJpbmcsXG4gICk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09PSAnJyB8fCB2YWx1ZSAhPT0gdmFsdWUpIHJldHVybiBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IF9mb3JtYXQgPSBmb3JtYXQgPz8gdGhpcy5kZWZhdWx0T3B0aW9ucz8uZGF0ZUZvcm1hdCA/PyBERUZBVUxUX0RBVEVfRk9STUFUO1xuICAgICAgY29uc3QgX3RpbWV6b25lID1cbiAgICAgICAgdGltZXpvbmUgPz8gdGhpcy5kZWZhdWx0T3B0aW9ucz8udGltZXpvbmUgPz8gdGhpcy5kZWZhdWx0VGltZXpvbmUgPz8gdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIGZvcm1hdERhdGUodmFsdWUsIF9mb3JtYXQsIGxvY2FsZSB8fCB0aGlzLmxvY2FsZSwgX3RpbWV6b25lKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgaW52YWxpZFBpcGVBcmd1bWVudEVycm9yKERhdGVQaXBlLCAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxufVxuIl19