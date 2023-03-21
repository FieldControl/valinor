/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
export const DATE_PIPE_DEFAULT_TIMEZONE = new InjectionToken('DATE_PIPE_DEFAULT_TIMEZONE');
/**
 * DI token that allows to provide default configuration for the `DatePipe` instances in an
 * application. The value is an object which can include the following fields:
 * - `dateFormat`: configures the default date format. If not provided, the `DatePipe`
 * will use the 'mediumDate' as a value.
 * - `timezone`: configures the default timezone. If not provided, the `DatePipe` will
 * use the end-user's local system timezone.
 *
 * @see `DatePipeConfig`
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
export const DATE_PIPE_DEFAULT_OPTIONS = new InjectionToken('DATE_PIPE_DEFAULT_OPTIONS');
// clang-format off
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
 * See the [I18n guide](guide/i18n-common-format-data-locale) for more information.
 *
 * The time zone of the formatted value can be specified either by passing it in as the second
 * parameter of the pipe, or by setting the default through the `DATE_PIPE_DEFAULT_OPTIONS`
 * injection token. The value that is passed in as the second parameter takes precedence over
 * the one defined using the injection token.
 *
 * @see `formatDate()`
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
 *  | Field type          | Format      | Description                                                   | Example Value                                              |
 *  |-------------------- |-------------|---------------------------------------------------------------|------------------------------------------------------------|
 *  | Era                 | G, GG & GGG | Abbreviated                                                   | AD                                                         |
 *  |                     | GGGG        | Wide                                                          | Anno Domini                                                |
 *  |                     | GGGGG       | Narrow                                                        | A                                                          |
 *  | Year                | y           | Numeric: minimum digits                                       | 2, 20, 201, 2017, 20173                                    |
 *  |                     | yy          | Numeric: 2 digits + zero padded                               | 02, 20, 01, 17, 73                                         |
 *  |                     | yyy         | Numeric: 3 digits + zero padded                               | 002, 020, 201, 2017, 20173                                 |
 *  |                     | yyyy        | Numeric: 4 digits or more + zero padded                       | 0002, 0020, 0201, 2017, 20173                              |
 *  | Week-numbering year | Y           | Numeric: minimum digits                                       | 2, 20, 201, 2017, 20173                                    |
 *  |                     | YY          | Numeric: 2 digits + zero padded                               | 02, 20, 01, 17, 73                                         |
 *  |                     | YYY         | Numeric: 3 digits + zero padded                               | 002, 020, 201, 2017, 20173                                 |
 *  |                     | YYYY        | Numeric: 4 digits or more + zero padded                       | 0002, 0020, 0201, 2017, 20173                              |
 *  | Month               | M           | Numeric: 1 digit                                              | 9, 12                                                      |
 *  |                     | MM          | Numeric: 2 digits + zero padded                               | 09, 12                                                     |
 *  |                     | MMM         | Abbreviated                                                   | Sep                                                        |
 *  |                     | MMMM        | Wide                                                          | September                                                  |
 *  |                     | MMMMM       | Narrow                                                        | S                                                          |
 *  | Month standalone    | L           | Numeric: 1 digit                                              | 9, 12                                                      |
 *  |                     | LL          | Numeric: 2 digits + zero padded                               | 09, 12                                                     |
 *  |                     | LLL         | Abbreviated                                                   | Sep                                                        |
 *  |                     | LLLL        | Wide                                                          | September                                                  |
 *  |                     | LLLLL       | Narrow                                                        | S                                                          |
 *  | Week of year        | w           | Numeric: minimum digits                                       | 1... 53                                                    |
 *  |                     | ww          | Numeric: 2 digits + zero padded                               | 01... 53                                                   |
 *  | Week of month       | W           | Numeric: 1 digit                                              | 1... 5                                                     |
 *  | Day of month        | d           | Numeric: minimum digits                                       | 1                                                          |
 *  |                     | dd          | Numeric: 2 digits + zero padded                               | 01                                                         |
 *  | Week day            | E, EE & EEE | Abbreviated                                                   | Tue                                                        |
 *  |                     | EEEE        | Wide                                                          | Tuesday                                                    |
 *  |                     | EEEEE       | Narrow                                                        | T                                                          |
 *  |                     | EEEEEE      | Short                                                         | Tu                                                         |
 *  | Week day standalone | c, cc       | Numeric: 1 digit                                              | 2                                                          |
 *  |                     | ccc         | Abbreviated                                                   | Tue                                                        |
 *  |                     | cccc        | Wide                                                          | Tuesday                                                    |
 *  |                     | ccccc       | Narrow                                                        | T                                                          |
 *  |                     | cccccc      | Short                                                         | Tu                                                         |
 *  | Period              | a, aa & aaa | Abbreviated                                                   | am/pm or AM/PM                                             |
 *  |                     | aaaa        | Wide (fallback to `a` when missing)                           | ante meridiem/post meridiem                                |
 *  |                     | aaaaa       | Narrow                                                        | a/p                                                        |
 *  | Period*             | B, BB & BBB | Abbreviated                                                   | mid.                                                       |
 *  |                     | BBBB        | Wide                                                          | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  |                     | BBBBB       | Narrow                                                        | md                                                         |
 *  | Period standalone*  | b, bb & bbb | Abbreviated                                                   | mid.                                                       |
 *  |                     | bbbb        | Wide                                                          | am, pm, midnight, noon, morning, afternoon, evening, night |
 *  |                     | bbbbb       | Narrow                                                        | md                                                         |
 *  | Hour 1-12           | h           | Numeric: minimum digits                                       | 1, 12                                                      |
 *  |                     | hh          | Numeric: 2 digits + zero padded                               | 01, 12                                                     |
 *  | Hour 0-23           | H           | Numeric: minimum digits                                       | 0, 23                                                      |
 *  |                     | HH          | Numeric: 2 digits + zero padded                               | 00, 23                                                     |
 *  | Minute              | m           | Numeric: minimum digits                                       | 8, 59                                                      |
 *  |                     | mm          | Numeric: 2 digits + zero padded                               | 08, 59                                                     |
 *  | Second              | s           | Numeric: minimum digits                                       | 0... 59                                                    |
 *  |                     | ss          | Numeric: 2 digits + zero padded                               | 00... 59                                                   |
 *  | Fractional seconds  | S           | Numeric: 1 digit                                              | 0... 9                                                     |
 *  |                     | SS          | Numeric: 2 digits + zero padded                               | 00... 99                                                   |
 *  |                     | SSS         | Numeric: 3 digits + zero padded (= milliseconds)              | 000... 999                                                 |
 *  | Zone                | z, zz & zzz | Short specific non location format (fallback to O)            | GMT-8                                                      |
 *  |                     | zzzz        | Long specific non location format (fallback to OOOO)          | GMT-08:00                                                  |
 *  |                     | Z, ZZ & ZZZ | ISO8601 basic format                                          | -0800                                                      |
 *  |                     | ZZZZ        | Long localized GMT format                                     | GMT-8:00                                                   |
 *  |                     | ZZZZZ       | ISO8601 extended format + Z indicator for offset 0 (= XXXXX)  | -08:00                                                     |
 *  |                     | O, OO & OOO | Short localized GMT format                                    | GMT-8                                                      |
 *  |                     | OOOO        | Long localized GMT format                                     | GMT-08:00                                                  |
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
// clang-format on
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
}
DatePipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: DatePipe, deps: [{ token: LOCALE_ID }, { token: DATE_PIPE_DEFAULT_TIMEZONE, optional: true }, { token: DATE_PIPE_DEFAULT_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Pipe });
DatePipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "15.2.1", ngImport: i0, type: DatePipe, isStandalone: true, name: "date" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.1", ngImport: i0, type: DatePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'date',
                    pure: true,
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
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
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZV9waXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9waXBlcy9kYXRlX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBRS9GLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUUvQyxPQUFPLEVBQWlCLG1CQUFtQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDdkUsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sK0JBQStCLENBQUM7O0FBRXZFOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQUcsSUFBSSxjQUFjLENBQVMsNEJBQTRCLENBQUMsQ0FBQztBQUVuRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEJHO0FBQ0gsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQ2xDLElBQUksY0FBYyxDQUFpQiwyQkFBMkIsQ0FBQyxDQUFDO0FBRXBFLG1CQUFtQjtBQUNuQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEpHO0FBQ0gsa0JBQWtCO0FBTWxCLE1BQU0sT0FBTyxRQUFRO0lBQ25CLFlBQytCLE1BQWMsRUFDZSxlQUE2QixFQUM5QixjQUFvQztRQUZoRSxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2Usb0JBQWUsR0FBZixlQUFlLENBQWM7UUFDOUIsbUJBQWMsR0FBZCxjQUFjLENBQXNCO0lBQzVGLENBQUM7SUEyQkosU0FBUyxDQUNMLEtBQXdDLEVBQUUsTUFBZSxFQUFFLFFBQWlCLEVBQzVFLE1BQWU7UUFDakIsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFLElBQUksS0FBSyxLQUFLLEtBQUs7WUFBRSxPQUFPLElBQUksQ0FBQztRQUVsRSxJQUFJO1lBQ0YsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsVUFBVSxJQUFJLG1CQUFtQixDQUFDO1lBQ2pGLE1BQU0sU0FBUyxHQUNYLFFBQVEsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLFFBQVEsSUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLFNBQVMsQ0FBQztZQUNuRixPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3JFO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxNQUFNLHdCQUF3QixDQUFDLFFBQVEsRUFBRyxLQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDcEU7SUFDSCxDQUFDOztnSEE3Q1UsUUFBUSxrQkFFUCxTQUFTLGFBQ1QsMEJBQTBCLDZCQUMxQix5QkFBeUI7OEdBSjFCLFFBQVE7c0dBQVIsUUFBUTtrQkFMcEIsSUFBSTttQkFBQztvQkFDSixJQUFJLEVBQUUsTUFBTTtvQkFDWixJQUFJLEVBQUUsSUFBSTtvQkFDVixVQUFVLEVBQUUsSUFBSTtpQkFDakI7OzBCQUdNLE1BQU07MkJBQUMsU0FBUzs7MEJBQ2hCLE1BQU07MkJBQUMsMEJBQTBCOzswQkFBRyxRQUFROzswQkFDNUMsTUFBTTsyQkFBQyx5QkFBeUI7OzBCQUFHLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGlvblRva2VuLCBMT0NBTEVfSUQsIE9wdGlvbmFsLCBQaXBlLCBQaXBlVHJhbnNmb3JtfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtmb3JtYXREYXRlfSBmcm9tICcuLi9pMThuL2Zvcm1hdF9kYXRlJztcblxuaW1wb3J0IHtEYXRlUGlwZUNvbmZpZywgREVGQVVMVF9EQVRFX0ZPUk1BVH0gZnJvbSAnLi9kYXRlX3BpcGVfY29uZmlnJztcbmltcG9ydCB7aW52YWxpZFBpcGVBcmd1bWVudEVycm9yfSBmcm9tICcuL2ludmFsaWRfcGlwZV9hcmd1bWVudF9lcnJvcic7XG5cbi8qKlxuICogT3B0aW9uYWxseS1wcm92aWRlZCBkZWZhdWx0IHRpbWV6b25lIHRvIHVzZSBmb3IgYWxsIGluc3RhbmNlcyBvZiBgRGF0ZVBpcGVgIChzdWNoIGFzIGAnKzA0MzAnYCkuXG4gKiBJZiB0aGUgdmFsdWUgaXNuJ3QgcHJvdmlkZWQsIHRoZSBgRGF0ZVBpcGVgIHdpbGwgdXNlIHRoZSBlbmQtdXNlcidzIGxvY2FsIHN5c3RlbSB0aW1lem9uZS5cbiAqXG4gKiBAZGVwcmVjYXRlZCB1c2UgREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OUyB0b2tlbiB0byBjb25maWd1cmUgRGF0ZVBpcGVcbiAqL1xuZXhwb3J0IGNvbnN0IERBVEVfUElQRV9ERUZBVUxUX1RJTUVaT05FID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oJ0RBVEVfUElQRV9ERUZBVUxUX1RJTUVaT05FJyk7XG5cbi8qKlxuICogREkgdG9rZW4gdGhhdCBhbGxvd3MgdG8gcHJvdmlkZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBgRGF0ZVBpcGVgIGluc3RhbmNlcyBpbiBhblxuICogYXBwbGljYXRpb24uIFRoZSB2YWx1ZSBpcyBhbiBvYmplY3Qgd2hpY2ggY2FuIGluY2x1ZGUgdGhlIGZvbGxvd2luZyBmaWVsZHM6XG4gKiAtIGBkYXRlRm9ybWF0YDogY29uZmlndXJlcyB0aGUgZGVmYXVsdCBkYXRlIGZvcm1hdC4gSWYgbm90IHByb3ZpZGVkLCB0aGUgYERhdGVQaXBlYFxuICogd2lsbCB1c2UgdGhlICdtZWRpdW1EYXRlJyBhcyBhIHZhbHVlLlxuICogLSBgdGltZXpvbmVgOiBjb25maWd1cmVzIHRoZSBkZWZhdWx0IHRpbWV6b25lLiBJZiBub3QgcHJvdmlkZWQsIHRoZSBgRGF0ZVBpcGVgIHdpbGxcbiAqIHVzZSB0aGUgZW5kLXVzZXIncyBsb2NhbCBzeXN0ZW0gdGltZXpvbmUuXG4gKlxuICogQHNlZSBgRGF0ZVBpcGVDb25maWdgXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBWYXJpb3VzIGRhdGUgcGlwZSBkZWZhdWx0IHZhbHVlcyBjYW4gYmUgb3ZlcndyaXR0ZW4gYnkgcHJvdmlkaW5nIHRoaXMgdG9rZW4gd2l0aFxuICogdGhlIHZhbHVlIHRoYXQgaGFzIHRoaXMgaW50ZXJmYWNlLlxuICpcbiAqIEZvciBleGFtcGxlOlxuICpcbiAqIE92ZXJyaWRlIHRoZSBkZWZhdWx0IGRhdGUgZm9ybWF0IGJ5IHByb3ZpZGluZyBhIHZhbHVlIHVzaW5nIHRoZSB0b2tlbjpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHByb3ZpZGVyczogW1xuICogICB7cHJvdmlkZTogREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OUywgdXNlVmFsdWU6IHtkYXRlRm9ybWF0OiAnc2hvcnREYXRlJ319XG4gKiBdXG4gKiBgYGBcbiAqXG4gKiBPdmVycmlkZSB0aGUgZGVmYXVsdCB0aW1lem9uZSBieSBwcm92aWRpbmcgYSB2YWx1ZSB1c2luZyB0aGUgdG9rZW46XG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBwcm92aWRlcnM6IFtcbiAqICAge3Byb3ZpZGU6IERBVEVfUElQRV9ERUZBVUxUX09QVElPTlMsIHVzZVZhbHVlOiB7dGltZXpvbmU6ICctMTIwMCd9fVxuICogXVxuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBEQVRFX1BJUEVfREVGQVVMVF9PUFRJT05TID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48RGF0ZVBpcGVDb25maWc+KCdEQVRFX1BJUEVfREVGQVVMVF9PUFRJT05TJyk7XG5cbi8vIGNsYW5nLWZvcm1hdCBvZmZcbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogRm9ybWF0cyBhIGRhdGUgdmFsdWUgYWNjb3JkaW5nIHRvIGxvY2FsZSBydWxlcy5cbiAqXG4gKiBgRGF0ZVBpcGVgIGlzIGV4ZWN1dGVkIG9ubHkgd2hlbiBpdCBkZXRlY3RzIGEgcHVyZSBjaGFuZ2UgdG8gdGhlIGlucHV0IHZhbHVlLlxuICogQSBwdXJlIGNoYW5nZSBpcyBlaXRoZXIgYSBjaGFuZ2UgdG8gYSBwcmltaXRpdmUgaW5wdXQgdmFsdWVcbiAqIChzdWNoIGFzIGBTdHJpbmdgLCBgTnVtYmVyYCwgYEJvb2xlYW5gLCBvciBgU3ltYm9sYCksXG4gKiBvciBhIGNoYW5nZWQgb2JqZWN0IHJlZmVyZW5jZSAoc3VjaCBhcyBgRGF0ZWAsIGBBcnJheWAsIGBGdW5jdGlvbmAsIG9yIGBPYmplY3RgKS5cbiAqXG4gKiBOb3RlIHRoYXQgbXV0YXRpbmcgYSBgRGF0ZWAgb2JqZWN0IGRvZXMgbm90IGNhdXNlIHRoZSBwaXBlIHRvIGJlIHJlbmRlcmVkIGFnYWluLlxuICogVG8gZW5zdXJlIHRoYXQgdGhlIHBpcGUgaXMgZXhlY3V0ZWQsIHlvdSBtdXN0IGNyZWF0ZSBhIG5ldyBgRGF0ZWAgb2JqZWN0LlxuICpcbiAqIE9ubHkgdGhlIGBlbi1VU2AgbG9jYWxlIGRhdGEgY29tZXMgd2l0aCBBbmd1bGFyLiBUbyBsb2NhbGl6ZSBkYXRlc1xuICogaW4gYW5vdGhlciBsYW5ndWFnZSwgeW91IG11c3QgaW1wb3J0IHRoZSBjb3JyZXNwb25kaW5nIGxvY2FsZSBkYXRhLlxuICogU2VlIHRoZSBbSTE4biBndWlkZV0oZ3VpZGUvaTE4bi1jb21tb24tZm9ybWF0LWRhdGEtbG9jYWxlKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiBUaGUgdGltZSB6b25lIG9mIHRoZSBmb3JtYXR0ZWQgdmFsdWUgY2FuIGJlIHNwZWNpZmllZCBlaXRoZXIgYnkgcGFzc2luZyBpdCBpbiBhcyB0aGUgc2Vjb25kXG4gKiBwYXJhbWV0ZXIgb2YgdGhlIHBpcGUsIG9yIGJ5IHNldHRpbmcgdGhlIGRlZmF1bHQgdGhyb3VnaCB0aGUgYERBVEVfUElQRV9ERUZBVUxUX09QVElPTlNgXG4gKiBpbmplY3Rpb24gdG9rZW4uIFRoZSB2YWx1ZSB0aGF0IGlzIHBhc3NlZCBpbiBhcyB0aGUgc2Vjb25kIHBhcmFtZXRlciB0YWtlcyBwcmVjZWRlbmNlIG92ZXJcbiAqIHRoZSBvbmUgZGVmaW5lZCB1c2luZyB0aGUgaW5qZWN0aW9uIHRva2VuLlxuICpcbiAqIEBzZWUgYGZvcm1hdERhdGUoKWBcbiAqXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBUaGUgcmVzdWx0IG9mIHRoaXMgcGlwZSBpcyBub3QgcmVldmFsdWF0ZWQgd2hlbiB0aGUgaW5wdXQgaXMgbXV0YXRlZC4gVG8gYXZvaWQgdGhlIG5lZWQgdG9cbiAqIHJlZm9ybWF0IHRoZSBkYXRlIG9uIGV2ZXJ5IGNoYW5nZS1kZXRlY3Rpb24gY3ljbGUsIHRyZWF0IHRoZSBkYXRlIGFzIGFuIGltbXV0YWJsZSBvYmplY3RcbiAqIGFuZCBjaGFuZ2UgdGhlIHJlZmVyZW5jZSB3aGVuIHRoZSBwaXBlIG5lZWRzIHRvIHJ1biBhZ2Fpbi5cbiAqXG4gKiAjIyMgUHJlLWRlZmluZWQgZm9ybWF0IG9wdGlvbnNcbiAqXG4gKiB8IE9wdGlvbiAgICAgICAgfCBFcXVpdmFsZW50IHRvICAgICAgICAgICAgICAgICAgICAgICB8IEV4YW1wbGVzIChnaXZlbiBpbiBgZW4tVVNgIGxvY2FsZSkgICAgICAgICAgICAgIHxcbiAqIHwtLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxuICogfCBgJ3Nob3J0J2AgICAgIHwgYCdNL2QveXksIGg6bW0gYSdgICAgICAgICAgICAgICAgICAgfCBgNi8xNS8xNSwgOTowMyBBTWAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGAnbWVkaXVtJ2AgICAgfCBgJ01NTSBkLCB5LCBoOm1tOnNzIGEnYCAgICAgICAgICAgICB8IGBKdW4gMTUsIDIwMTUsIDk6MDM6MDEgQU1gICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdsb25nJ2AgICAgICB8IGAnTU1NTSBkLCB5LCBoOm1tOnNzIGEgeidgICAgICAgICAgIHwgYEp1bmUgMTUsIDIwMTUgYXQgOTowMzowMSBBTSBHTVQrMWAgICAgICAgICAgICAgfFxuICogfCBgJ2Z1bGwnYCAgICAgIHwgYCdFRUVFLCBNTU1NIGQsIHksIGg6bW06c3MgYSB6enp6J2AgfCBgTW9uZGF5LCBKdW5lIDE1LCAyMDE1IGF0IDk6MDM6MDEgQU0gR01UKzAxOjAwYCB8XG4gKiB8IGAnc2hvcnREYXRlJ2AgfCBgJ00vZC95eSdgICAgICAgICAgICAgICAgICAgICAgICAgICB8IGA2LzE1LzE1YCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdtZWRpdW1EYXRlJ2B8IGAnTU1NIGQsIHknYCAgICAgICAgICAgICAgICAgICAgICAgIHwgYEp1biAxNSwgMjAxNWAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgJ2xvbmdEYXRlJ2AgIHwgYCdNTU1NIGQsIHknYCAgICAgICAgICAgICAgICAgICAgICAgfCBgSnVuZSAxNSwgMjAxNWAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGAnZnVsbERhdGUnYCAgfCBgJ0VFRUUsIE1NTU0gZCwgeSdgICAgICAgICAgICAgICAgICB8IGBNb25kYXksIEp1bmUgMTUsIDIwMTVgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdzaG9ydFRpbWUnYCB8IGAnaDptbSBhJ2AgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYDk6MDMgQU1gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfCBgJ21lZGl1bVRpbWUnYHwgYCdoOm1tOnNzIGEnYCAgICAgICAgICAgICAgICAgICAgICAgfCBgOTowMzowMSBBTWAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiB8IGAnbG9uZ1RpbWUnYCAgfCBgJ2g6bW06c3MgYSB6J2AgICAgICAgICAgICAgICAgICAgICB8IGA5OjAzOjAxIEFNIEdNVCsxYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqIHwgYCdmdWxsVGltZSdgICB8IGAnaDptbTpzcyBhIHp6enonYCAgICAgICAgICAgICAgICAgIHwgYDk6MDM6MDEgQU0gR01UKzAxOjAwYCAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICpcbiAqICMjIyBDdXN0b20gZm9ybWF0IG9wdGlvbnNcbiAqXG4gKiBZb3UgY2FuIGNvbnN0cnVjdCBhIGZvcm1hdCBzdHJpbmcgdXNpbmcgc3ltYm9scyB0byBzcGVjaWZ5IHRoZSBjb21wb25lbnRzXG4gKiBvZiBhIGRhdGUtdGltZSB2YWx1ZSwgYXMgZGVzY3JpYmVkIGluIHRoZSBmb2xsb3dpbmcgdGFibGUuXG4gKiBGb3JtYXQgZGV0YWlscyBkZXBlbmQgb24gdGhlIGxvY2FsZS5cbiAqIEZpZWxkcyBtYXJrZWQgd2l0aCAoKikgYXJlIG9ubHkgYXZhaWxhYmxlIGluIHRoZSBleHRyYSBkYXRhIHNldCBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqXG4gKiAgfCBGaWVsZCB0eXBlICAgICAgICAgIHwgRm9ybWF0ICAgICAgfCBEZXNjcmlwdGlvbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgRXhhbXBsZSBWYWx1ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfC0tLS0tLS0tLS0tLS0tLS0tLS0tIHwtLS0tLS0tLS0tLS0tfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18XG4gKiAgfCBFcmEgICAgICAgICAgICAgICAgIHwgRywgR0cgJiBHR0cgfCBBYmJyZXZpYXRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgQUQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgR0dHRyAgICAgICAgfCBXaWRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgQW5ubyBEb21pbmkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgR0dHR0cgICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgQSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBZZWFyICAgICAgICAgICAgICAgIHwgeSAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMiwgMjAsIDIwMSwgMjAxNywgMjAxNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgeXkgICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDIsIDIwLCAwMSwgMTcsIDczICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgeXl5ICAgICAgICAgfCBOdW1lcmljOiAzIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDAyLCAwMjAsIDIwMSwgMjAxNywgMjAxNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgeXl5eSAgICAgICAgfCBOdW1lcmljOiA0IGRpZ2l0cyBvciBtb3JlICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgIHwgMDAwMiwgMDAyMCwgMDIwMSwgMjAxNywgMjAxNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBXZWVrLW51bWJlcmluZyB5ZWFyIHwgWSAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMiwgMjAsIDIwMSwgMjAxNywgMjAxNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgWVkgICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDIsIDIwLCAwMSwgMTcsIDczICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgWVlZICAgICAgICAgfCBOdW1lcmljOiAzIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDAyLCAwMjAsIDIwMSwgMjAxNywgMjAxNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgWVlZWSAgICAgICAgfCBOdW1lcmljOiA0IGRpZ2l0cyBvciBtb3JlICsgemVybyBwYWRkZWQgICAgICAgICAgICAgICAgICAgICAgIHwgMDAwMiwgMDAyMCwgMDIwMSwgMjAxNywgMjAxNzMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBNb250aCAgICAgICAgICAgICAgIHwgTSAgICAgICAgICAgfCBOdW1lcmljOiAxIGRpZ2l0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgOSwgMTIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgTU0gICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDksIDEyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgTU1NICAgICAgICAgfCBBYmJyZXZpYXRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgU2VwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgTU1NTSAgICAgICAgfCBXaWRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgU2VwdGVtYmVyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgTU1NTU0gICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBNb250aCBzdGFuZGFsb25lICAgIHwgTCAgICAgICAgICAgfCBOdW1lcmljOiAxIGRpZ2l0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgOSwgMTIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgTEwgICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDksIDEyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgTExMICAgICAgICAgfCBBYmJyZXZpYXRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgU2VwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgTExMTCAgICAgICAgfCBXaWRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgU2VwdGVtYmVyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgTExMTEwgICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgUyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBXZWVrIG9mIHllYXIgICAgICAgIHwgdyAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMS4uLiA1MyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgd3cgICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDEuLi4gNTMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBXZWVrIG9mIG1vbnRoICAgICAgIHwgVyAgICAgICAgICAgfCBOdW1lcmljOiAxIGRpZ2l0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMS4uLiA1ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBEYXkgb2YgbW9udGggICAgICAgIHwgZCAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgZGQgICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBXZWVrIGRheSAgICAgICAgICAgIHwgRSwgRUUgJiBFRUUgfCBBYmJyZXZpYXRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgVHVlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgRUVFRSAgICAgICAgfCBXaWRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgVHVlc2RheSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgRUVFRUUgICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgVCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgRUVFRUVFICAgICAgfCBTaG9ydCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgVHUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBXZWVrIGRheSBzdGFuZGFsb25lIHwgYywgY2MgICAgICAgfCBOdW1lcmljOiAxIGRpZ2l0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgY2NjICAgICAgICAgfCBBYmJyZXZpYXRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgVHVlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgY2NjYyAgICAgICAgfCBXaWRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgVHVlc2RheSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgY2NjY2MgICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgVCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgY2NjY2NjICAgICAgfCBTaG9ydCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgVHUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBQZXJpb2QgICAgICAgICAgICAgIHwgYSwgYWEgJiBhYWEgfCBBYmJyZXZpYXRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYW0vcG0gb3IgQU0vUE0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgYWFhYSAgICAgICAgfCBXaWRlIChmYWxsYmFjayB0byBgYWAgd2hlbiBtaXNzaW5nKSAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYW50ZSBtZXJpZGllbS9wb3N0IG1lcmlkaWVtICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgYWFhYWEgICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYS9wICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBQZXJpb2QqICAgICAgICAgICAgIHwgQiwgQkIgJiBCQkIgfCBBYmJyZXZpYXRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgbWlkLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgQkJCQiAgICAgICAgfCBXaWRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYW0sIHBtLCBtaWRuaWdodCwgbm9vbiwgbW9ybmluZywgYWZ0ZXJub29uLCBldmVuaW5nLCBuaWdodCB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgQkJCQkIgICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgbWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBQZXJpb2Qgc3RhbmRhbG9uZSogIHwgYiwgYmIgJiBiYmIgfCBBYmJyZXZpYXRlZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgbWlkLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgYmJiYiAgICAgICAgfCBXaWRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgYW0sIHBtLCBtaWRuaWdodCwgbm9vbiwgbW9ybmluZywgYWZ0ZXJub29uLCBldmVuaW5nLCBuaWdodCB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgYmJiYmIgICAgICAgfCBOYXJyb3cgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgbWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBIb3VyIDEtMTIgICAgICAgICAgIHwgaCAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMSwgMTIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgaGggICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDEsIDEyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBIb3VyIDAtMjMgICAgICAgICAgIHwgSCAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMCwgMjMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgSEggICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDAsIDIzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBNaW51dGUgICAgICAgICAgICAgIHwgbSAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgOCwgNTkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgbW0gICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDgsIDU5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBTZWNvbmQgICAgICAgICAgICAgIHwgcyAgICAgICAgICAgfCBOdW1lcmljOiBtaW5pbXVtIGRpZ2l0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMC4uLiA1OSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgc3MgICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDAuLi4gNTkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBGcmFjdGlvbmFsIHNlY29uZHMgIHwgUyAgICAgICAgICAgfCBOdW1lcmljOiAxIGRpZ2l0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMC4uLiA5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgU1MgICAgICAgICAgfCBOdW1lcmljOiAyIGRpZ2l0cyArIHplcm8gcGFkZGVkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgMDAuLi4gOTkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgU1NTICAgICAgICAgfCBOdW1lcmljOiAzIGRpZ2l0cyArIHplcm8gcGFkZGVkICg9IG1pbGxpc2Vjb25kcykgICAgICAgICAgICAgIHwgMDAwLi4uIDk5OSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCBab25lICAgICAgICAgICAgICAgIHwgeiwgenogJiB6enogfCBTaG9ydCBzcGVjaWZpYyBub24gbG9jYXRpb24gZm9ybWF0IChmYWxsYmFjayB0byBPKSAgICAgICAgICAgIHwgR01ULTggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgenp6eiAgICAgICAgfCBMb25nIHNwZWNpZmljIG5vbiBsb2NhdGlvbiBmb3JtYXQgKGZhbGxiYWNrIHRvIE9PT08pICAgICAgICAgIHwgR01ULTA4OjAwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgWiwgWlogJiBaWlogfCBJU084NjAxIGJhc2ljIGZvcm1hdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgLTA4MDAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgWlpaWiAgICAgICAgfCBMb25nIGxvY2FsaXplZCBHTVQgZm9ybWF0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgR01ULTg6MDAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgWlpaWlogICAgICAgfCBJU084NjAxIGV4dGVuZGVkIGZvcm1hdCArIFogaW5kaWNhdG9yIGZvciBvZmZzZXQgMCAoPSBYWFhYWCkgIHwgLTA4OjAwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgTywgT08gJiBPT08gfCBTaG9ydCBsb2NhbGl6ZWQgR01UIGZvcm1hdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgR01ULTggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgfCAgICAgICAgICAgICAgICAgICAgIHwgT09PTyAgICAgICAgfCBMb25nIGxvY2FsaXplZCBHTVQgZm9ybWF0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgR01ULTA4OjAwICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKlxuICpcbiAqICMjIyBGb3JtYXQgZXhhbXBsZXNcbiAqXG4gKiBUaGVzZSBleGFtcGxlcyB0cmFuc2Zvcm0gYSBkYXRlIGludG8gdmFyaW91cyBmb3JtYXRzLFxuICogYXNzdW1pbmcgdGhhdCBgZGF0ZU9iamAgaXMgYSBKYXZhU2NyaXB0IGBEYXRlYCBvYmplY3QgZm9yXG4gKiB5ZWFyOiAyMDE1LCBtb250aDogNiwgZGF5OiAxNSwgaG91cjogMjEsIG1pbnV0ZTogNDMsIHNlY29uZDogMTEsXG4gKiBnaXZlbiBpbiB0aGUgbG9jYWwgdGltZSBmb3IgdGhlIGBlbi1VU2AgbG9jYWxlLlxuICpcbiAqIGBgYFxuICoge3sgZGF0ZU9iaiB8IGRhdGUgfX0gICAgICAgICAgICAgICAvLyBvdXRwdXQgaXMgJ0p1biAxNSwgMjAxNSdcbiAqIHt7IGRhdGVPYmogfCBkYXRlOidtZWRpdW0nIH19ICAgICAgLy8gb3V0cHV0IGlzICdKdW4gMTUsIDIwMTUsIDk6NDM6MTEgUE0nXG4gKiB7eyBkYXRlT2JqIHwgZGF0ZTonc2hvcnRUaW1lJyB9fSAgIC8vIG91dHB1dCBpcyAnOTo0MyBQTSdcbiAqIHt7IGRhdGVPYmogfCBkYXRlOidtbTpzcycgfX0gICAgICAgLy8gb3V0cHV0IGlzICc0MzoxMSdcbiAqIGBgYFxuICpcbiAqICMjIyBVc2FnZSBleGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBjb21wb25lbnQgdXNlcyBhIGRhdGUgcGlwZSB0byBkaXNwbGF5IHRoZSBjdXJyZW50IGRhdGUgaW4gZGlmZmVyZW50IGZvcm1hdHMuXG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICBzZWxlY3RvcjogJ2RhdGUtcGlwZScsXG4gKiAgdGVtcGxhdGU6IGA8ZGl2PlxuICogICAgPHA+VG9kYXkgaXMge3t0b2RheSB8IGRhdGV9fTwvcD5cbiAqICAgIDxwPk9yIGlmIHlvdSBwcmVmZXIsIHt7dG9kYXkgfCBkYXRlOidmdWxsRGF0ZSd9fTwvcD5cbiAqICAgIDxwPlRoZSB0aW1lIGlzIHt7dG9kYXkgfCBkYXRlOidoOm1tIGEgeid9fTwvcD5cbiAqICA8L2Rpdj5gXG4gKiB9KVxuICogLy8gR2V0IHRoZSBjdXJyZW50IGRhdGUgYW5kIHRpbWUgYXMgYSBkYXRlLXRpbWUgdmFsdWUuXG4gKiBleHBvcnQgY2xhc3MgRGF0ZVBpcGVDb21wb25lbnQge1xuICogICB0b2RheTogbnVtYmVyID0gRGF0ZS5ub3coKTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuLy8gY2xhbmctZm9ybWF0IG9uXG5AUGlwZSh7XG4gIG5hbWU6ICdkYXRlJyxcbiAgcHVyZTogdHJ1ZSxcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbn0pXG5leHBvcnQgY2xhc3MgRGF0ZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBsb2NhbGU6IHN0cmluZyxcbiAgICAgIEBJbmplY3QoREFURV9QSVBFX0RFRkFVTFRfVElNRVpPTkUpIEBPcHRpb25hbCgpIHByaXZhdGUgZGVmYXVsdFRpbWV6b25lPzogc3RyaW5nfG51bGwsXG4gICAgICBASW5qZWN0KERBVEVfUElQRV9ERUZBVUxUX09QVElPTlMpIEBPcHRpb25hbCgpIHByaXZhdGUgZGVmYXVsdE9wdGlvbnM/OiBEYXRlUGlwZUNvbmZpZ3xudWxsLFxuICApIHt9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgZGF0ZSBleHByZXNzaW9uOiBhIGBEYXRlYCBvYmplY3QsICBhIG51bWJlclxuICAgKiAobWlsbGlzZWNvbmRzIHNpbmNlIFVUQyBlcG9jaCksIG9yIGFuIElTTyBzdHJpbmcgKGh0dHBzOi8vd3d3LnczLm9yZy9UUi9OT1RFLWRhdGV0aW1lKS5cbiAgICogQHBhcmFtIGZvcm1hdCBUaGUgZGF0ZS90aW1lIGNvbXBvbmVudHMgdG8gaW5jbHVkZSwgdXNpbmcgcHJlZGVmaW5lZCBvcHRpb25zIG9yIGFcbiAgICogY3VzdG9tIGZvcm1hdCBzdHJpbmcuICBXaGVuIG5vdCBwcm92aWRlZCwgdGhlIGBEYXRlUGlwZWAgbG9va3MgZm9yIHRoZSB2YWx1ZSB1c2luZyB0aGVcbiAgICogYERBVEVfUElQRV9ERUZBVUxUX09QVElPTlNgIGluamVjdGlvbiB0b2tlbiAoYW5kIHJlYWRzIHRoZSBgZGF0ZUZvcm1hdGAgcHJvcGVydHkpLlxuICAgKiBJZiB0aGUgdG9rZW4gaXMgbm90IGNvbmZpZ3VyZWQsIHRoZSBgbWVkaXVtRGF0ZWAgaXMgdXNlZCBhcyBhIHZhbHVlLlxuICAgKiBAcGFyYW0gdGltZXpvbmUgQSB0aW1lem9uZSBvZmZzZXQgKHN1Y2ggYXMgYCcrMDQzMCdgKSwgb3IgYSBzdGFuZGFyZCBVVEMvR01ULCBvciBjb250aW5lbnRhbCBVU1xuICAgKiB0aW1lem9uZSBhYmJyZXZpYXRpb24uIFdoZW4gbm90IHByb3ZpZGVkLCB0aGUgYERhdGVQaXBlYCBsb29rcyBmb3IgdGhlIHZhbHVlIHVzaW5nIHRoZVxuICAgKiBgREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OU2AgaW5qZWN0aW9uIHRva2VuIChhbmQgcmVhZHMgdGhlIGB0aW1lem9uZWAgcHJvcGVydHkpLiBJZiB0aGUgdG9rZW5cbiAgICogaXMgbm90IGNvbmZpZ3VyZWQsIHRoZSBlbmQtdXNlcidzIGxvY2FsIHN5c3RlbSB0aW1lem9uZSBpcyB1c2VkIGFzIGEgdmFsdWUuXG4gICAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICAgKiBXaGVuIG5vdCBzdXBwbGllZCwgdXNlcyB0aGUgdmFsdWUgb2YgYExPQ0FMRV9JRGAsIHdoaWNoIGlzIGBlbi1VU2AgYnkgZGVmYXVsdC5cbiAgICogU2VlIFtTZXR0aW5nIHlvdXIgYXBwIGxvY2FsZV0oZ3VpZGUvaTE4bi1jb21tb24tbG9jYWxlLWlkKS5cbiAgICpcbiAgICogQHNlZSBgREFURV9QSVBFX0RFRkFVTFRfT1BUSU9OU2BcbiAgICpcbiAgICogQHJldHVybnMgQSBkYXRlIHN0cmluZyBpbiB0aGUgZGVzaXJlZCBmb3JtYXQuXG4gICAqL1xuICB0cmFuc2Zvcm0odmFsdWU6IERhdGV8c3RyaW5nfG51bWJlciwgZm9ybWF0Pzogc3RyaW5nLCB0aW1lem9uZT86IHN0cmluZywgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nXG4gICAgICB8bnVsbDtcbiAgdHJhbnNmb3JtKHZhbHVlOiBudWxsfHVuZGVmaW5lZCwgZm9ybWF0Pzogc3RyaW5nLCB0aW1lem9uZT86IHN0cmluZywgbG9jYWxlPzogc3RyaW5nKTogbnVsbDtcbiAgdHJhbnNmb3JtKFxuICAgICAgdmFsdWU6IERhdGV8c3RyaW5nfG51bWJlcnxudWxsfHVuZGVmaW5lZCwgZm9ybWF0Pzogc3RyaW5nLCB0aW1lem9uZT86IHN0cmluZyxcbiAgICAgIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZ3xudWxsO1xuICB0cmFuc2Zvcm0oXG4gICAgICB2YWx1ZTogRGF0ZXxzdHJpbmd8bnVtYmVyfG51bGx8dW5kZWZpbmVkLCBmb3JtYXQ/OiBzdHJpbmcsIHRpbWV6b25lPzogc3RyaW5nLFxuICAgICAgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09PSAnJyB8fCB2YWx1ZSAhPT0gdmFsdWUpIHJldHVybiBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IF9mb3JtYXQgPSBmb3JtYXQgPz8gdGhpcy5kZWZhdWx0T3B0aW9ucz8uZGF0ZUZvcm1hdCA/PyBERUZBVUxUX0RBVEVfRk9STUFUO1xuICAgICAgY29uc3QgX3RpbWV6b25lID1cbiAgICAgICAgICB0aW1lem9uZSA/PyB0aGlzLmRlZmF1bHRPcHRpb25zPy50aW1lem9uZSA/PyB0aGlzLmRlZmF1bHRUaW1lem9uZSA/PyB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gZm9ybWF0RGF0ZSh2YWx1ZSwgX2Zvcm1hdCwgbG9jYWxlIHx8IHRoaXMubG9jYWxlLCBfdGltZXpvbmUpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBpbnZhbGlkUGlwZUFyZ3VtZW50RXJyb3IoRGF0ZVBpcGUsIChlcnJvciBhcyBFcnJvcikubWVzc2FnZSk7XG4gICAgfVxuICB9XG59XG4iXX0=