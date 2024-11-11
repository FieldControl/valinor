/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { FormatWidth, FormStyle, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleDayNames, getLocaleDayPeriods, getLocaleEraNames, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocaleId, getLocaleMonthNames, getLocaleNumberSymbol, getLocaleTimeFormat, NumberSymbol, TranslationWidth, } from './locale_data_api';
export const ISO8601_DATE_REGEX = /^(\d{4,})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
//    1        2       3         4          5          6          7          8  9     10      11
const NAMED_FORMATS = {};
const DATE_FORMATS_SPLIT = /((?:[^BEGHLMOSWYZabcdhmswyz']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|Y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|c{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
var ZoneWidth;
(function (ZoneWidth) {
    ZoneWidth[ZoneWidth["Short"] = 0] = "Short";
    ZoneWidth[ZoneWidth["ShortGMT"] = 1] = "ShortGMT";
    ZoneWidth[ZoneWidth["Long"] = 2] = "Long";
    ZoneWidth[ZoneWidth["Extended"] = 3] = "Extended";
})(ZoneWidth || (ZoneWidth = {}));
var DateType;
(function (DateType) {
    DateType[DateType["FullYear"] = 0] = "FullYear";
    DateType[DateType["Month"] = 1] = "Month";
    DateType[DateType["Date"] = 2] = "Date";
    DateType[DateType["Hours"] = 3] = "Hours";
    DateType[DateType["Minutes"] = 4] = "Minutes";
    DateType[DateType["Seconds"] = 5] = "Seconds";
    DateType[DateType["FractionalSeconds"] = 6] = "FractionalSeconds";
    DateType[DateType["Day"] = 7] = "Day";
})(DateType || (DateType = {}));
var TranslationType;
(function (TranslationType) {
    TranslationType[TranslationType["DayPeriods"] = 0] = "DayPeriods";
    TranslationType[TranslationType["Days"] = 1] = "Days";
    TranslationType[TranslationType["Months"] = 2] = "Months";
    TranslationType[TranslationType["Eras"] = 3] = "Eras";
})(TranslationType || (TranslationType = {}));
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a date according to locale rules.
 *
 * @param value The date to format, as a Date, or a number (milliseconds since UTC epoch)
 * or an [ISO date-time string](https://www.w3.org/TR/NOTE-datetime).
 * @param format The date-time components to include. See `DatePipe` for details.
 * @param locale A locale code for the locale format rules to use.
 * @param timezone The time zone. A time zone offset from GMT (such as `'+0430'`).
 * If not specified, uses host system settings.
 *
 * @returns The formatted date string.
 *
 * @see {@link DatePipe}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 */
export function formatDate(value, format, locale, timezone) {
    let date = toDate(value);
    const namedFormat = getNamedFormat(locale, format);
    format = namedFormat || format;
    let parts = [];
    let match;
    while (format) {
        match = DATE_FORMATS_SPLIT.exec(format);
        if (match) {
            parts = parts.concat(match.slice(1));
            const part = parts.pop();
            if (!part) {
                break;
            }
            format = part;
        }
        else {
            parts.push(format);
            break;
        }
    }
    let dateTimezoneOffset = date.getTimezoneOffset();
    if (timezone) {
        dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
        date = convertTimezoneToLocal(date, timezone, true);
    }
    let text = '';
    parts.forEach((value) => {
        const dateFormatter = getDateFormatter(value);
        text += dateFormatter
            ? dateFormatter(date, locale, dateTimezoneOffset)
            : value === "''"
                ? "'"
                : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
    });
    return text;
}
/**
 * Create a new Date object with the given date value, and the time set to midnight.
 *
 * We cannot use `new Date(year, month, date)` because it maps years between 0 and 99 to 1900-1999.
 * See: https://github.com/angular/angular/issues/40377
 *
 * Note that this function returns a Date object whose time is midnight in the current locale's
 * timezone. In the future we might want to change this to be midnight in UTC, but this would be a
 * considerable breaking change.
 */
function createDate(year, month, date) {
    // The `newDate` is set to midnight (UTC) on January 1st 1970.
    // - In PST this will be December 31st 1969 at 4pm.
    // - In GMT this will be January 1st 1970 at 1am.
    // Note that they even have different years, dates and months!
    const newDate = new Date(0);
    // `setFullYear()` allows years like 0001 to be set correctly. This function does not
    // change the internal time of the date.
    // Consider calling `setFullYear(2019, 8, 20)` (September 20, 2019).
    // - In PST this will now be September 20, 2019 at 4pm
    // - In GMT this will now be September 20, 2019 at 1am
    newDate.setFullYear(year, month, date);
    // We want the final date to be at local midnight, so we reset the time.
    // - In PST this will now be September 20, 2019 at 12am
    // - In GMT this will now be September 20, 2019 at 12am
    newDate.setHours(0, 0, 0);
    return newDate;
}
function getNamedFormat(locale, format) {
    const localeId = getLocaleId(locale);
    NAMED_FORMATS[localeId] ??= {};
    if (NAMED_FORMATS[localeId][format]) {
        return NAMED_FORMATS[localeId][format];
    }
    let formatValue = '';
    switch (format) {
        case 'shortDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Short);
            break;
        case 'mediumDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Medium);
            break;
        case 'longDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Long);
            break;
        case 'fullDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Full);
            break;
        case 'shortTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Short);
            break;
        case 'mediumTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Medium);
            break;
        case 'longTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Long);
            break;
        case 'fullTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Full);
            break;
        case 'short':
            const shortTime = getNamedFormat(locale, 'shortTime');
            const shortDate = getNamedFormat(locale, 'shortDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Short), [
                shortTime,
                shortDate,
            ]);
            break;
        case 'medium':
            const mediumTime = getNamedFormat(locale, 'mediumTime');
            const mediumDate = getNamedFormat(locale, 'mediumDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Medium), [
                mediumTime,
                mediumDate,
            ]);
            break;
        case 'long':
            const longTime = getNamedFormat(locale, 'longTime');
            const longDate = getNamedFormat(locale, 'longDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Long), [
                longTime,
                longDate,
            ]);
            break;
        case 'full':
            const fullTime = getNamedFormat(locale, 'fullTime');
            const fullDate = getNamedFormat(locale, 'fullDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Full), [
                fullTime,
                fullDate,
            ]);
            break;
    }
    if (formatValue) {
        NAMED_FORMATS[localeId][format] = formatValue;
    }
    return formatValue;
}
function formatDateTime(str, opt_values) {
    if (opt_values) {
        str = str.replace(/\{([^}]+)}/g, function (match, key) {
            return opt_values != null && key in opt_values ? opt_values[key] : match;
        });
    }
    return str;
}
function padNumber(num, digits, minusSign = '-', trim, negWrap) {
    let neg = '';
    if (num < 0 || (negWrap && num <= 0)) {
        if (negWrap) {
            num = -num + 1;
        }
        else {
            num = -num;
            neg = minusSign;
        }
    }
    let strNum = String(num);
    while (strNum.length < digits) {
        strNum = '0' + strNum;
    }
    if (trim) {
        strNum = strNum.slice(strNum.length - digits);
    }
    return neg + strNum;
}
function formatFractionalSeconds(milliseconds, digits) {
    const strMs = padNumber(milliseconds, 3);
    return strMs.substring(0, digits);
}
/**
 * Returns a date formatter that transforms a date into its locale digit representation
 */
function dateGetter(name, size, offset = 0, trim = false, negWrap = false) {
    return function (date, locale) {
        let part = getDatePart(name, date);
        if (offset > 0 || part > -offset) {
            part += offset;
        }
        if (name === DateType.Hours) {
            if (part === 0 && offset === -12) {
                part = 12;
            }
        }
        else if (name === DateType.FractionalSeconds) {
            return formatFractionalSeconds(part, size);
        }
        const localeMinus = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
        return padNumber(part, size, localeMinus, trim, negWrap);
    };
}
function getDatePart(part, date) {
    switch (part) {
        case DateType.FullYear:
            return date.getFullYear();
        case DateType.Month:
            return date.getMonth();
        case DateType.Date:
            return date.getDate();
        case DateType.Hours:
            return date.getHours();
        case DateType.Minutes:
            return date.getMinutes();
        case DateType.Seconds:
            return date.getSeconds();
        case DateType.FractionalSeconds:
            return date.getMilliseconds();
        case DateType.Day:
            return date.getDay();
        default:
            throw new Error(`Unknown DateType value "${part}".`);
    }
}
/**
 * Returns a date formatter that transforms a date into its locale string representation
 */
function dateStrGetter(name, width, form = FormStyle.Format, extended = false) {
    return function (date, locale) {
        return getDateTranslation(date, locale, name, width, form, extended);
    };
}
/**
 * Returns the locale translation of a date for a given form, type and width
 */
function getDateTranslation(date, locale, name, width, form, extended) {
    switch (name) {
        case TranslationType.Months:
            return getLocaleMonthNames(locale, form, width)[date.getMonth()];
        case TranslationType.Days:
            return getLocaleDayNames(locale, form, width)[date.getDay()];
        case TranslationType.DayPeriods:
            const currentHours = date.getHours();
            const currentMinutes = date.getMinutes();
            if (extended) {
                const rules = getLocaleExtraDayPeriodRules(locale);
                const dayPeriods = getLocaleExtraDayPeriods(locale, form, width);
                const index = rules.findIndex((rule) => {
                    if (Array.isArray(rule)) {
                        // morning, afternoon, evening, night
                        const [from, to] = rule;
                        const afterFrom = currentHours >= from.hours && currentMinutes >= from.minutes;
                        const beforeTo = currentHours < to.hours || (currentHours === to.hours && currentMinutes < to.minutes);
                        // We must account for normal rules that span a period during the day (e.g. 6am-9am)
                        // where `from` is less (earlier) than `to`. But also rules that span midnight (e.g.
                        // 10pm - 5am) where `from` is greater (later!) than `to`.
                        //
                        // In the first case the current time must be BOTH after `from` AND before `to`
                        // (e.g. 8am is after 6am AND before 10am).
                        //
                        // In the second case the current time must be EITHER after `from` OR before `to`
                        // (e.g. 4am is before 5am but not after 10pm; and 11pm is not before 5am but it is
                        // after 10pm).
                        if (from.hours < to.hours) {
                            if (afterFrom && beforeTo) {
                                return true;
                            }
                        }
                        else if (afterFrom || beforeTo) {
                            return true;
                        }
                    }
                    else {
                        // noon or midnight
                        if (rule.hours === currentHours && rule.minutes === currentMinutes) {
                            return true;
                        }
                    }
                    return false;
                });
                if (index !== -1) {
                    return dayPeriods[index];
                }
            }
            // if no rules for the day periods, we use am/pm by default
            return getLocaleDayPeriods(locale, form, width)[currentHours < 12 ? 0 : 1];
        case TranslationType.Eras:
            return getLocaleEraNames(locale, width)[date.getFullYear() <= 0 ? 0 : 1];
        default:
            // This default case is not needed by TypeScript compiler, as the switch is exhaustive.
            // However Closure Compiler does not understand that and reports an error in typed mode.
            // The `throw new Error` below works around the problem, and the unexpected: never variable
            // makes sure tsc still checks this code is unreachable.
            const unexpected = name;
            throw new Error(`unexpected translation type ${unexpected}`);
    }
}
/**
 * Returns a date formatter that transforms a date and an offset into a timezone with ISO8601 or
 * GMT format depending on the width (eg: short = +0430, short:GMT = GMT+4, long = GMT+04:30,
 * extended = +04:30)
 */
function timeZoneGetter(width) {
    return function (date, locale, offset) {
        const zone = -1 * offset;
        const minusSign = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
        const hours = zone > 0 ? Math.floor(zone / 60) : Math.ceil(zone / 60);
        switch (width) {
            case ZoneWidth.Short:
                return ((zone >= 0 ? '+' : '') +
                    padNumber(hours, 2, minusSign) +
                    padNumber(Math.abs(zone % 60), 2, minusSign));
            case ZoneWidth.ShortGMT:
                return 'GMT' + (zone >= 0 ? '+' : '') + padNumber(hours, 1, minusSign);
            case ZoneWidth.Long:
                return ('GMT' +
                    (zone >= 0 ? '+' : '') +
                    padNumber(hours, 2, minusSign) +
                    ':' +
                    padNumber(Math.abs(zone % 60), 2, minusSign));
            case ZoneWidth.Extended:
                if (offset === 0) {
                    return 'Z';
                }
                else {
                    return ((zone >= 0 ? '+' : '') +
                        padNumber(hours, 2, minusSign) +
                        ':' +
                        padNumber(Math.abs(zone % 60), 2, minusSign));
                }
            default:
                throw new Error(`Unknown zone width "${width}"`);
        }
    };
}
const JANUARY = 0;
const THURSDAY = 4;
function getFirstThursdayOfYear(year) {
    const firstDayOfYear = createDate(year, JANUARY, 1).getDay();
    return createDate(year, 0, 1 + (firstDayOfYear <= THURSDAY ? THURSDAY : THURSDAY + 7) - firstDayOfYear);
}
/**
 *  ISO Week starts on day 1 (Monday) and ends with day 0 (Sunday)
 */
export function getThursdayThisIsoWeek(datetime) {
    // getDay returns 0-6 range with sunday as 0.
    const currentDay = datetime.getDay();
    // On a Sunday, read the previous Thursday since ISO weeks start on Monday.
    const deltaToThursday = currentDay === 0 ? -3 : THURSDAY - currentDay;
    return createDate(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + deltaToThursday);
}
function weekGetter(size, monthBased = false) {
    return function (date, locale) {
        let result;
        if (monthBased) {
            const nbDaysBefore1stDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
            const today = date.getDate();
            result = 1 + Math.floor((today + nbDaysBefore1stDayOfMonth) / 7);
        }
        else {
            const thisThurs = getThursdayThisIsoWeek(date);
            // Some days of a year are part of next year according to ISO 8601.
            // Compute the firstThurs from the year of this week's Thursday
            const firstThurs = getFirstThursdayOfYear(thisThurs.getFullYear());
            const diff = thisThurs.getTime() - firstThurs.getTime();
            result = 1 + Math.round(diff / 6.048e8); // 6.048e8 ms per week
        }
        return padNumber(result, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    };
}
/**
 * Returns a date formatter that provides the week-numbering year for the input date.
 */
function weekNumberingYearGetter(size, trim = false) {
    return function (date, locale) {
        const thisThurs = getThursdayThisIsoWeek(date);
        const weekNumberingYear = thisThurs.getFullYear();
        return padNumber(weekNumberingYear, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign), trim);
    };
}
const DATE_FORMATS = {};
// Based on CLDR formats:
// See complete list: http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
// See also explanations: http://cldr.unicode.org/translation/date-time
// TODO(ocombe): support all missing cldr formats: U, Q, D, F, e, j, J, C, A, v, V, X, x
function getDateFormatter(format) {
    if (DATE_FORMATS[format]) {
        return DATE_FORMATS[format];
    }
    let formatter;
    switch (format) {
        // Era name (AD/BC)
        case 'G':
        case 'GG':
        case 'GGG':
            formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Abbreviated);
            break;
        case 'GGGG':
            formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Wide);
            break;
        case 'GGGGG':
            formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Narrow);
            break;
        // 1 digit representation of the year, e.g. (AD 1 => 1, AD 199 => 199)
        case 'y':
            formatter = dateGetter(DateType.FullYear, 1, 0, false, true);
            break;
        // 2 digit representation of the year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
        case 'yy':
            formatter = dateGetter(DateType.FullYear, 2, 0, true, true);
            break;
        // 3 digit representation of the year, padded (000-999). (e.g. AD 2001 => 01, AD 2010 => 10)
        case 'yyy':
            formatter = dateGetter(DateType.FullYear, 3, 0, false, true);
            break;
        // 4 digit representation of the year (e.g. AD 1 => 0001, AD 2010 => 2010)
        case 'yyyy':
            formatter = dateGetter(DateType.FullYear, 4, 0, false, true);
            break;
        // 1 digit representation of the week-numbering year, e.g. (AD 1 => 1, AD 199 => 199)
        case 'Y':
            formatter = weekNumberingYearGetter(1);
            break;
        // 2 digit representation of the week-numbering year, padded (00-99). (e.g. AD 2001 => 01, AD
        // 2010 => 10)
        case 'YY':
            formatter = weekNumberingYearGetter(2, true);
            break;
        // 3 digit representation of the week-numbering year, padded (000-999). (e.g. AD 1 => 001, AD
        // 2010 => 2010)
        case 'YYY':
            formatter = weekNumberingYearGetter(3);
            break;
        // 4 digit representation of the week-numbering year (e.g. AD 1 => 0001, AD 2010 => 2010)
        case 'YYYY':
            formatter = weekNumberingYearGetter(4);
            break;
        // Month of the year (1-12), numeric
        case 'M':
        case 'L':
            formatter = dateGetter(DateType.Month, 1, 1);
            break;
        case 'MM':
        case 'LL':
            formatter = dateGetter(DateType.Month, 2, 1);
            break;
        // Month of the year (January, ...), string, format
        case 'MMM':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Abbreviated);
            break;
        case 'MMMM':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Wide);
            break;
        case 'MMMMM':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Narrow);
            break;
        // Month of the year (January, ...), string, standalone
        case 'LLL':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Abbreviated, FormStyle.Standalone);
            break;
        case 'LLLL':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Wide, FormStyle.Standalone);
            break;
        case 'LLLLL':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Narrow, FormStyle.Standalone);
            break;
        // Week of the year (1, ... 52)
        case 'w':
            formatter = weekGetter(1);
            break;
        case 'ww':
            formatter = weekGetter(2);
            break;
        // Week of the month (1, ...)
        case 'W':
            formatter = weekGetter(1, true);
            break;
        // Day of the month (1-31)
        case 'd':
            formatter = dateGetter(DateType.Date, 1);
            break;
        case 'dd':
            formatter = dateGetter(DateType.Date, 2);
            break;
        // Day of the Week StandAlone (1, 1, Mon, Monday, M, Mo)
        case 'c':
        case 'cc':
            formatter = dateGetter(DateType.Day, 1);
            break;
        case 'ccc':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Abbreviated, FormStyle.Standalone);
            break;
        case 'cccc':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Wide, FormStyle.Standalone);
            break;
        case 'ccccc':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Narrow, FormStyle.Standalone);
            break;
        case 'cccccc':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Short, FormStyle.Standalone);
            break;
        // Day of the Week
        case 'E':
        case 'EE':
        case 'EEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Abbreviated);
            break;
        case 'EEEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Wide);
            break;
        case 'EEEEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Narrow);
            break;
        case 'EEEEEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Short);
            break;
        // Generic period of the day (am-pm)
        case 'a':
        case 'aa':
        case 'aaa':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated);
            break;
        case 'aaaa':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide);
            break;
        case 'aaaaa':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow);
            break;
        // Extended period of the day (midnight, at night, ...), standalone
        case 'b':
        case 'bb':
        case 'bbb':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Standalone, true);
            break;
        case 'bbbb':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide, FormStyle.Standalone, true);
            break;
        case 'bbbbb':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow, FormStyle.Standalone, true);
            break;
        // Extended period of the day (midnight, night, ...), standalone
        case 'B':
        case 'BB':
        case 'BBB':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Format, true);
            break;
        case 'BBBB':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide, FormStyle.Format, true);
            break;
        case 'BBBBB':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow, FormStyle.Format, true);
            break;
        // Hour in AM/PM, (1-12)
        case 'h':
            formatter = dateGetter(DateType.Hours, 1, -12);
            break;
        case 'hh':
            formatter = dateGetter(DateType.Hours, 2, -12);
            break;
        // Hour of the day (0-23)
        case 'H':
            formatter = dateGetter(DateType.Hours, 1);
            break;
        // Hour in day, padded (00-23)
        case 'HH':
            formatter = dateGetter(DateType.Hours, 2);
            break;
        // Minute of the hour (0-59)
        case 'm':
            formatter = dateGetter(DateType.Minutes, 1);
            break;
        case 'mm':
            formatter = dateGetter(DateType.Minutes, 2);
            break;
        // Second of the minute (0-59)
        case 's':
            formatter = dateGetter(DateType.Seconds, 1);
            break;
        case 'ss':
            formatter = dateGetter(DateType.Seconds, 2);
            break;
        // Fractional second
        case 'S':
            formatter = dateGetter(DateType.FractionalSeconds, 1);
            break;
        case 'SS':
            formatter = dateGetter(DateType.FractionalSeconds, 2);
            break;
        case 'SSS':
            formatter = dateGetter(DateType.FractionalSeconds, 3);
            break;
        // Timezone ISO8601 short format (-0430)
        case 'Z':
        case 'ZZ':
        case 'ZZZ':
            formatter = timeZoneGetter(ZoneWidth.Short);
            break;
        // Timezone ISO8601 extended format (-04:30)
        case 'ZZZZZ':
            formatter = timeZoneGetter(ZoneWidth.Extended);
            break;
        // Timezone GMT short format (GMT+4)
        case 'O':
        case 'OO':
        case 'OOO':
        // Should be location, but fallback to format O instead because we don't have the data yet
        case 'z':
        case 'zz':
        case 'zzz':
            formatter = timeZoneGetter(ZoneWidth.ShortGMT);
            break;
        // Timezone GMT long format (GMT+0430)
        case 'OOOO':
        case 'ZZZZ':
        // Should be location, but fallback to format O instead because we don't have the data yet
        case 'zzzz':
            formatter = timeZoneGetter(ZoneWidth.Long);
            break;
        default:
            return null;
    }
    DATE_FORMATS[format] = formatter;
    return formatter;
}
function timezoneToOffset(timezone, fallback) {
    // Support: IE 11 only, Edge 13-15+
    // IE/Edge do not "understand" colon (`:`) in timezone
    timezone = timezone.replace(/:/g, '');
    const requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
    return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
}
function addDateMinutes(date, minutes) {
    date = new Date(date.getTime());
    date.setMinutes(date.getMinutes() + minutes);
    return date;
}
function convertTimezoneToLocal(date, timezone, reverse) {
    const reverseValue = reverse ? -1 : 1;
    const dateTimezoneOffset = date.getTimezoneOffset();
    const timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
    return addDateMinutes(date, reverseValue * (timezoneOffset - dateTimezoneOffset));
}
/**
 * Converts a value to date.
 *
 * Supported input formats:
 * - `Date`
 * - number: timestamp
 * - string: numeric (e.g. "1234"), ISO and date strings in a format supported by
 *   [Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).
 *   Note: ISO strings without time return a date without timeoffset.
 *
 * Throws if unable to convert to a date.
 */
export function toDate(value) {
    if (isDate(value)) {
        return value;
    }
    if (typeof value === 'number' && !isNaN(value)) {
        return new Date(value);
    }
    if (typeof value === 'string') {
        value = value.trim();
        if (/^(\d{4}(-\d{1,2}(-\d{1,2})?)?)$/.test(value)) {
            /* For ISO Strings without time the day, month and year must be extracted from the ISO String
            before Date creation to avoid time offset and errors in the new Date.
            If we only replace '-' with ',' in the ISO String ("2015,01,01"), and try to create a new
            date, some browsers (e.g. IE 9) will throw an invalid Date error.
            If we leave the '-' ("2015-01-01") and try to create a new Date("2015-01-01") the timeoffset
            is applied.
            Note: ISO months are 0 for January, 1 for February, ... */
            const [y, m = 1, d = 1] = value.split('-').map((val) => +val);
            return createDate(y, m - 1, d);
        }
        const parsedNb = parseFloat(value);
        // any string that only contains numbers, like "1234" but not like "1234hello"
        if (!isNaN(value - parsedNb)) {
            return new Date(parsedNb);
        }
        let match;
        if ((match = value.match(ISO8601_DATE_REGEX))) {
            return isoStringToDate(match);
        }
    }
    const date = new Date(value);
    if (!isDate(date)) {
        throw new Error(`Unable to convert "${value}" into a date`);
    }
    return date;
}
/**
 * Converts a date in ISO8601 to a Date.
 * Used instead of `Date.parse` because of browser discrepancies.
 */
export function isoStringToDate(match) {
    const date = new Date(0);
    let tzHour = 0;
    let tzMin = 0;
    // match[8] means that the string contains "Z" (UTC) or a timezone like "+01:00" or "+0100"
    const dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
    const timeSetter = match[8] ? date.setUTCHours : date.setHours;
    // if there is a timezone defined like "+01:00" or "+0100"
    if (match[9]) {
        tzHour = Number(match[9] + match[10]);
        tzMin = Number(match[9] + match[11]);
    }
    dateSetter.call(date, Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const h = Number(match[4] || 0) - tzHour;
    const m = Number(match[5] || 0) - tzMin;
    const s = Number(match[6] || 0);
    // The ECMAScript specification (https://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.11)
    // defines that `DateTime` milliseconds should always be rounded down, so that `999.9ms`
    // becomes `999ms`.
    const ms = Math.floor(parseFloat('0.' + (match[7] || 0)) * 1000);
    timeSetter.call(date, h, m, s, ms);
    return date;
}
export function isDate(value) {
    return value instanceof Date && !isNaN(value.valueOf());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0X2RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2kxOG4vZm9ybWF0X2RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFdBQVcsRUFDWCxTQUFTLEVBQ1QsbUJBQW1CLEVBQ25CLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsbUJBQW1CLEVBQ25CLGlCQUFpQixFQUNqQiw0QkFBNEIsRUFDNUIsd0JBQXdCLEVBQ3hCLFdBQVcsRUFDWCxtQkFBbUIsRUFDbkIscUJBQXFCLEVBQ3JCLG1CQUFtQixFQUNuQixZQUFZLEVBRVosZ0JBQWdCLEdBQ2pCLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQzdCLHVHQUF1RyxDQUFDO0FBQzFHLGdHQUFnRztBQUNoRyxNQUFNLGFBQWEsR0FBcUQsRUFBRSxDQUFDO0FBQzNFLE1BQU0sa0JBQWtCLEdBQ3RCLG1OQUFtTixDQUFDO0FBRXROLElBQUssU0FLSjtBQUxELFdBQUssU0FBUztJQUNaLDJDQUFLLENBQUE7SUFDTCxpREFBUSxDQUFBO0lBQ1IseUNBQUksQ0FBQTtJQUNKLGlEQUFRLENBQUE7QUFDVixDQUFDLEVBTEksU0FBUyxLQUFULFNBQVMsUUFLYjtBQUVELElBQUssUUFTSjtBQVRELFdBQUssUUFBUTtJQUNYLCtDQUFRLENBQUE7SUFDUix5Q0FBSyxDQUFBO0lBQ0wsdUNBQUksQ0FBQTtJQUNKLHlDQUFLLENBQUE7SUFDTCw2Q0FBTyxDQUFBO0lBQ1AsNkNBQU8sQ0FBQTtJQUNQLGlFQUFpQixDQUFBO0lBQ2pCLHFDQUFHLENBQUE7QUFDTCxDQUFDLEVBVEksUUFBUSxLQUFSLFFBQVEsUUFTWjtBQUVELElBQUssZUFLSjtBQUxELFdBQUssZUFBZTtJQUNsQixpRUFBVSxDQUFBO0lBQ1YscURBQUksQ0FBQTtJQUNK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QUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDeEMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoQyxnR0FBZ0c7SUFDaEcsd0ZBQXdGO0lBQ3hGLG1CQUFtQjtJQUNuQixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNqRSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNuQyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxNQUFNLFVBQVUsTUFBTSxDQUFDLEtBQVU7SUFDL0IsT0FBTyxLQUFLLFlBQVksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQzFELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEZvcm1hdFdpZHRoLFxuICBGb3JtU3R5bGUsXG4gIGdldExvY2FsZURhdGVGb3JtYXQsXG4gIGdldExvY2FsZURhdGVUaW1lRm9ybWF0LFxuICBnZXRMb2NhbGVEYXlOYW1lcyxcbiAgZ2V0TG9jYWxlRGF5UGVyaW9kcyxcbiAgZ2V0TG9jYWxlRXJhTmFtZXMsXG4gIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kUnVsZXMsXG4gIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kcyxcbiAgZ2V0TG9jYWxlSWQsXG4gIGdldExvY2FsZU1vbnRoTmFtZXMsXG4gIGdldExvY2FsZU51bWJlclN5bWJvbCxcbiAgZ2V0TG9jYWxlVGltZUZvcm1hdCxcbiAgTnVtYmVyU3ltYm9sLFxuICBUaW1lLFxuICBUcmFuc2xhdGlvbldpZHRoLFxufSBmcm9tICcuL2xvY2FsZV9kYXRhX2FwaSc7XG5cbmV4cG9ydCBjb25zdCBJU084NjAxX0RBVEVfUkVHRVggPVxuICAvXihcXGR7NCx9KS0/KFxcZFxcZCktPyhcXGRcXGQpKD86VChcXGRcXGQpKD86Oj8oXFxkXFxkKSg/Ojo/KFxcZFxcZCkoPzpcXC4oXFxkKykpPyk/KT8oWnwoWystXSkoXFxkXFxkKTo/KFxcZFxcZCkpPyk/JC87XG4vLyAgICAxICAgICAgICAyICAgICAgIDMgICAgICAgICA0ICAgICAgICAgIDUgICAgICAgICAgNiAgICAgICAgICA3ICAgICAgICAgIDggIDkgICAgIDEwICAgICAgMTFcbmNvbnN0IE5BTUVEX0ZPUk1BVFM6IHtbbG9jYWxlSWQ6IHN0cmluZ106IHtbZm9ybWF0OiBzdHJpbmddOiBzdHJpbmd9fSA9IHt9O1xuY29uc3QgREFURV9GT1JNQVRTX1NQTElUID1cbiAgLygoPzpbXkJFR0hMTU9TV1laYWJjZGhtc3d5eiddKyl8KD86Jyg/OlteJ118JycpKicpfCg/Okd7MSw1fXx5ezEsNH18WXsxLDR9fE17MSw1fXxMezEsNX18d3sxLDJ9fFd7MX18ZHsxLDJ9fEV7MSw2fXxjezEsNn18YXsxLDV9fGJ7MSw1fXxCezEsNX18aHsxLDJ9fEh7MSwyfXxtezEsMn18c3sxLDJ9fFN7MSwzfXx6ezEsNH18WnsxLDV9fE97MSw0fSkpKFtcXHNcXFNdKikvO1xuXG5lbnVtIFpvbmVXaWR0aCB7XG4gIFNob3J0LFxuICBTaG9ydEdNVCxcbiAgTG9uZyxcbiAgRXh0ZW5kZWQsXG59XG5cbmVudW0gRGF0ZVR5cGUge1xuICBGdWxsWWVhcixcbiAgTW9udGgsXG4gIERhdGUsXG4gIEhvdXJzLFxuICBNaW51dGVzLFxuICBTZWNvbmRzLFxuICBGcmFjdGlvbmFsU2Vjb25kcyxcbiAgRGF5LFxufVxuXG5lbnVtIFRyYW5zbGF0aW9uVHlwZSB7XG4gIERheVBlcmlvZHMsXG4gIERheXMsXG4gIE1vbnRocyxcbiAgRXJhcyxcbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBGb3JtYXRzIGEgZGF0ZSBhY2NvcmRpbmcgdG8gbG9jYWxlIHJ1bGVzLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgZGF0ZSB0byBmb3JtYXQsIGFzIGEgRGF0ZSwgb3IgYSBudW1iZXIgKG1pbGxpc2Vjb25kcyBzaW5jZSBVVEMgZXBvY2gpXG4gKiBvciBhbiBbSVNPIGRhdGUtdGltZSBzdHJpbmddKGh0dHBzOi8vd3d3LnczLm9yZy9UUi9OT1RFLWRhdGV0aW1lKS5cbiAqIEBwYXJhbSBmb3JtYXQgVGhlIGRhdGUtdGltZSBjb21wb25lbnRzIHRvIGluY2x1ZGUuIFNlZSBgRGF0ZVBpcGVgIGZvciBkZXRhaWxzLlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gdGltZXpvbmUgVGhlIHRpbWUgem9uZS4gQSB0aW1lIHpvbmUgb2Zmc2V0IGZyb20gR01UIChzdWNoIGFzIGAnKzA0MzAnYCkuXG4gKiBJZiBub3Qgc3BlY2lmaWVkLCB1c2VzIGhvc3Qgc3lzdGVtIHNldHRpbmdzLlxuICpcbiAqIEByZXR1cm5zIFRoZSBmb3JtYXR0ZWQgZGF0ZSBzdHJpbmcuXG4gKlxuICogQHNlZSB7QGxpbmsgRGF0ZVBpcGV9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGF0ZShcbiAgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IERhdGUsXG4gIGZvcm1hdDogc3RyaW5nLFxuICBsb2NhbGU6IHN0cmluZyxcbiAgdGltZXpvbmU/OiBzdHJpbmcsXG4pOiBzdHJpbmcge1xuICBsZXQgZGF0ZSA9IHRvRGF0ZSh2YWx1ZSk7XG4gIGNvbnN0IG5hbWVkRm9ybWF0ID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCBmb3JtYXQpO1xuICBmb3JtYXQgPSBuYW1lZEZvcm1hdCB8fCBmb3JtYXQ7XG5cbiAgbGV0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgbWF0Y2g7XG4gIHdoaWxlIChmb3JtYXQpIHtcbiAgICBtYXRjaCA9IERBVEVfRk9STUFUU19TUExJVC5leGVjKGZvcm1hdCk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICBwYXJ0cyA9IHBhcnRzLmNvbmNhdChtYXRjaC5zbGljZSgxKSk7XG4gICAgICBjb25zdCBwYXJ0ID0gcGFydHMucG9wKCk7XG4gICAgICBpZiAoIXBhcnQpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBmb3JtYXQgPSBwYXJ0O1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0cy5wdXNoKGZvcm1hdCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBsZXQgZGF0ZVRpbWV6b25lT2Zmc2V0ID0gZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICBpZiAodGltZXpvbmUpIHtcbiAgICBkYXRlVGltZXpvbmVPZmZzZXQgPSB0aW1lem9uZVRvT2Zmc2V0KHRpbWV6b25lLCBkYXRlVGltZXpvbmVPZmZzZXQpO1xuICAgIGRhdGUgPSBjb252ZXJ0VGltZXpvbmVUb0xvY2FsKGRhdGUsIHRpbWV6b25lLCB0cnVlKTtcbiAgfVxuXG4gIGxldCB0ZXh0ID0gJyc7XG4gIHBhcnRzLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgY29uc3QgZGF0ZUZvcm1hdHRlciA9IGdldERhdGVGb3JtYXR0ZXIodmFsdWUpO1xuICAgIHRleHQgKz0gZGF0ZUZvcm1hdHRlclxuICAgICAgPyBkYXRlRm9ybWF0dGVyKGRhdGUsIGxvY2FsZSwgZGF0ZVRpbWV6b25lT2Zmc2V0KVxuICAgICAgOiB2YWx1ZSA9PT0gXCInJ1wiXG4gICAgICAgID8gXCInXCJcbiAgICAgICAgOiB2YWx1ZS5yZXBsYWNlKC8oXid8JyQpL2csICcnKS5yZXBsYWNlKC8nJy9nLCBcIidcIik7XG4gIH0pO1xuXG4gIHJldHVybiB0ZXh0O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBEYXRlIG9iamVjdCB3aXRoIHRoZSBnaXZlbiBkYXRlIHZhbHVlLCBhbmQgdGhlIHRpbWUgc2V0IHRvIG1pZG5pZ2h0LlxuICpcbiAqIFdlIGNhbm5vdCB1c2UgYG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXRlKWAgYmVjYXVzZSBpdCBtYXBzIHllYXJzIGJldHdlZW4gMCBhbmQgOTkgdG8gMTkwMC0xOTk5LlxuICogU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy80MDM3N1xuICpcbiAqIE5vdGUgdGhhdCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgYSBEYXRlIG9iamVjdCB3aG9zZSB0aW1lIGlzIG1pZG5pZ2h0IGluIHRoZSBjdXJyZW50IGxvY2FsZSdzXG4gKiB0aW1lem9uZS4gSW4gdGhlIGZ1dHVyZSB3ZSBtaWdodCB3YW50IHRvIGNoYW5nZSB0aGlzIHRvIGJlIG1pZG5pZ2h0IGluIFVUQywgYnV0IHRoaXMgd291bGQgYmUgYVxuICogY29uc2lkZXJhYmxlIGJyZWFraW5nIGNoYW5nZS5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRGF0ZSh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcik6IERhdGUge1xuICAvLyBUaGUgYG5ld0RhdGVgIGlzIHNldCB0byBtaWRuaWdodCAoVVRDKSBvbiBKYW51YXJ5IDFzdCAxOTcwLlxuICAvLyAtIEluIFBTVCB0aGlzIHdpbGwgYmUgRGVjZW1iZXIgMzFzdCAxOTY5IGF0IDRwbS5cbiAgLy8gLSBJbiBHTVQgdGhpcyB3aWxsIGJlIEphbnVhcnkgMXN0IDE5NzAgYXQgMWFtLlxuICAvLyBOb3RlIHRoYXQgdGhleSBldmVuIGhhdmUgZGlmZmVyZW50IHllYXJzLCBkYXRlcyBhbmQgbW9udGhzIVxuICBjb25zdCBuZXdEYXRlID0gbmV3IERhdGUoMCk7XG5cbiAgLy8gYHNldEZ1bGxZZWFyKClgIGFsbG93cyB5ZWFycyBsaWtlIDAwMDEgdG8gYmUgc2V0IGNvcnJlY3RseS4gVGhpcyBmdW5jdGlvbiBkb2VzIG5vdFxuICAvLyBjaGFuZ2UgdGhlIGludGVybmFsIHRpbWUgb2YgdGhlIGRhdGUuXG4gIC8vIENvbnNpZGVyIGNhbGxpbmcgYHNldEZ1bGxZZWFyKDIwMTksIDgsIDIwKWAgKFNlcHRlbWJlciAyMCwgMjAxOSkuXG4gIC8vIC0gSW4gUFNUIHRoaXMgd2lsbCBub3cgYmUgU2VwdGVtYmVyIDIwLCAyMDE5IGF0IDRwbVxuICAvLyAtIEluIEdNVCB0aGlzIHdpbGwgbm93IGJlIFNlcHRlbWJlciAyMCwgMjAxOSBhdCAxYW1cblxuICBuZXdEYXRlLnNldEZ1bGxZZWFyKHllYXIsIG1vbnRoLCBkYXRlKTtcbiAgLy8gV2Ugd2FudCB0aGUgZmluYWwgZGF0ZSB0byBiZSBhdCBsb2NhbCBtaWRuaWdodCwgc28gd2UgcmVzZXQgdGhlIHRpbWUuXG4gIC8vIC0gSW4gUFNUIHRoaXMgd2lsbCBub3cgYmUgU2VwdGVtYmVyIDIwLCAyMDE5IGF0IDEyYW1cbiAgLy8gLSBJbiBHTVQgdGhpcyB3aWxsIG5vdyBiZSBTZXB0ZW1iZXIgMjAsIDIwMTkgYXQgMTJhbVxuICBuZXdEYXRlLnNldEhvdXJzKDAsIDAsIDApO1xuXG4gIHJldHVybiBuZXdEYXRlO1xufVxuXG5mdW5jdGlvbiBnZXROYW1lZEZvcm1hdChsb2NhbGU6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBsb2NhbGVJZCA9IGdldExvY2FsZUlkKGxvY2FsZSk7XG4gIE5BTUVEX0ZPUk1BVFNbbG9jYWxlSWRdID8/PSB7fTtcblxuICBpZiAoTkFNRURfRk9STUFUU1tsb2NhbGVJZF1bZm9ybWF0XSkge1xuICAgIHJldHVybiBOQU1FRF9GT1JNQVRTW2xvY2FsZUlkXVtmb3JtYXRdO1xuICB9XG5cbiAgbGV0IGZvcm1hdFZhbHVlID0gJyc7XG4gIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgY2FzZSAnc2hvcnREYXRlJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlRGF0ZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLlNob3J0KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21lZGl1bURhdGUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVEYXRlRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTWVkaXVtKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvbmdEYXRlJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlRGF0ZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLkxvbmcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZnVsbERhdGUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVEYXRlRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguRnVsbCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzaG9ydFRpbWUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguU2hvcnQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbWVkaXVtVGltZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5NZWRpdW0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbG9uZ1RpbWUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTG9uZyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmdWxsVGltZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5GdWxsKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Nob3J0JzpcbiAgICAgIGNvbnN0IHNob3J0VGltZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ3Nob3J0VGltZScpO1xuICAgICAgY29uc3Qgc2hvcnREYXRlID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnc2hvcnREYXRlJyk7XG4gICAgICBmb3JtYXRWYWx1ZSA9IGZvcm1hdERhdGVUaW1lKGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguU2hvcnQpLCBbXG4gICAgICAgIHNob3J0VGltZSxcbiAgICAgICAgc2hvcnREYXRlLFxuICAgICAgXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtZWRpdW0nOlxuICAgICAgY29uc3QgbWVkaXVtVGltZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ21lZGl1bVRpbWUnKTtcbiAgICAgIGNvbnN0IG1lZGl1bURhdGUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdtZWRpdW1EYXRlJyk7XG4gICAgICBmb3JtYXRWYWx1ZSA9IGZvcm1hdERhdGVUaW1lKGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTWVkaXVtKSwgW1xuICAgICAgICBtZWRpdW1UaW1lLFxuICAgICAgICBtZWRpdW1EYXRlLFxuICAgICAgXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsb25nJzpcbiAgICAgIGNvbnN0IGxvbmdUaW1lID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnbG9uZ1RpbWUnKTtcbiAgICAgIGNvbnN0IGxvbmdEYXRlID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnbG9uZ0RhdGUnKTtcbiAgICAgIGZvcm1hdFZhbHVlID0gZm9ybWF0RGF0ZVRpbWUoZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5Mb25nKSwgW1xuICAgICAgICBsb25nVGltZSxcbiAgICAgICAgbG9uZ0RhdGUsXG4gICAgICBdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Z1bGwnOlxuICAgICAgY29uc3QgZnVsbFRpbWUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdmdWxsVGltZScpO1xuICAgICAgY29uc3QgZnVsbERhdGUgPSBnZXROYW1lZEZvcm1hdChsb2NhbGUsICdmdWxsRGF0ZScpO1xuICAgICAgZm9ybWF0VmFsdWUgPSBmb3JtYXREYXRlVGltZShnZXRMb2NhbGVEYXRlVGltZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLkZ1bGwpLCBbXG4gICAgICAgIGZ1bGxUaW1lLFxuICAgICAgICBmdWxsRGF0ZSxcbiAgICAgIF0pO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgaWYgKGZvcm1hdFZhbHVlKSB7XG4gICAgTkFNRURfRk9STUFUU1tsb2NhbGVJZF1bZm9ybWF0XSA9IGZvcm1hdFZhbHVlO1xuICB9XG4gIHJldHVybiBmb3JtYXRWYWx1ZTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZVRpbWUoc3RyOiBzdHJpbmcsIG9wdF92YWx1ZXM6IHN0cmluZ1tdKSB7XG4gIGlmIChvcHRfdmFsdWVzKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xceyhbXn1dKyl9L2csIGZ1bmN0aW9uIChtYXRjaCwga2V5KSB7XG4gICAgICByZXR1cm4gb3B0X3ZhbHVlcyAhPSBudWxsICYmIGtleSBpbiBvcHRfdmFsdWVzID8gb3B0X3ZhbHVlc1trZXldIDogbWF0Y2g7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn1cblxuZnVuY3Rpb24gcGFkTnVtYmVyKFxuICBudW06IG51bWJlcixcbiAgZGlnaXRzOiBudW1iZXIsXG4gIG1pbnVzU2lnbiA9ICctJyxcbiAgdHJpbT86IGJvb2xlYW4sXG4gIG5lZ1dyYXA/OiBib29sZWFuLFxuKTogc3RyaW5nIHtcbiAgbGV0IG5lZyA9ICcnO1xuICBpZiAobnVtIDwgMCB8fCAobmVnV3JhcCAmJiBudW0gPD0gMCkpIHtcbiAgICBpZiAobmVnV3JhcCkge1xuICAgICAgbnVtID0gLW51bSArIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIG51bSA9IC1udW07XG4gICAgICBuZWcgPSBtaW51c1NpZ247XG4gICAgfVxuICB9XG4gIGxldCBzdHJOdW0gPSBTdHJpbmcobnVtKTtcbiAgd2hpbGUgKHN0ck51bS5sZW5ndGggPCBkaWdpdHMpIHtcbiAgICBzdHJOdW0gPSAnMCcgKyBzdHJOdW07XG4gIH1cbiAgaWYgKHRyaW0pIHtcbiAgICBzdHJOdW0gPSBzdHJOdW0uc2xpY2Uoc3RyTnVtLmxlbmd0aCAtIGRpZ2l0cyk7XG4gIH1cbiAgcmV0dXJuIG5lZyArIHN0ck51bTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RnJhY3Rpb25hbFNlY29uZHMobWlsbGlzZWNvbmRzOiBudW1iZXIsIGRpZ2l0czogbnVtYmVyKTogc3RyaW5nIHtcbiAgY29uc3Qgc3RyTXMgPSBwYWROdW1iZXIobWlsbGlzZWNvbmRzLCAzKTtcbiAgcmV0dXJuIHN0ck1zLnN1YnN0cmluZygwLCBkaWdpdHMpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBkYXRlIGZvcm1hdHRlciB0aGF0IHRyYW5zZm9ybXMgYSBkYXRlIGludG8gaXRzIGxvY2FsZSBkaWdpdCByZXByZXNlbnRhdGlvblxuICovXG5mdW5jdGlvbiBkYXRlR2V0dGVyKFxuICBuYW1lOiBEYXRlVHlwZSxcbiAgc2l6ZTogbnVtYmVyLFxuICBvZmZzZXQ6IG51bWJlciA9IDAsXG4gIHRyaW0gPSBmYWxzZSxcbiAgbmVnV3JhcCA9IGZhbHNlLFxuKTogRGF0ZUZvcm1hdHRlciB7XG4gIHJldHVybiBmdW5jdGlvbiAoZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCBwYXJ0ID0gZ2V0RGF0ZVBhcnQobmFtZSwgZGF0ZSk7XG4gICAgaWYgKG9mZnNldCA+IDAgfHwgcGFydCA+IC1vZmZzZXQpIHtcbiAgICAgIHBhcnQgKz0gb2Zmc2V0O1xuICAgIH1cblxuICAgIGlmIChuYW1lID09PSBEYXRlVHlwZS5Ib3Vycykge1xuICAgICAgaWYgKHBhcnQgPT09IDAgJiYgb2Zmc2V0ID09PSAtMTIpIHtcbiAgICAgICAgcGFydCA9IDEyO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gRGF0ZVR5cGUuRnJhY3Rpb25hbFNlY29uZHMpIHtcbiAgICAgIHJldHVybiBmb3JtYXRGcmFjdGlvbmFsU2Vjb25kcyhwYXJ0LCBzaXplKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2NhbGVNaW51cyA9IGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5NaW51c1NpZ24pO1xuICAgIHJldHVybiBwYWROdW1iZXIocGFydCwgc2l6ZSwgbG9jYWxlTWludXMsIHRyaW0sIG5lZ1dyYXApO1xuICB9O1xufVxuXG5mdW5jdGlvbiBnZXREYXRlUGFydChwYXJ0OiBEYXRlVHlwZSwgZGF0ZTogRGF0ZSk6IG51bWJlciB7XG4gIHN3aXRjaCAocGFydCkge1xuICAgIGNhc2UgRGF0ZVR5cGUuRnVsbFllYXI6XG4gICAgICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgIGNhc2UgRGF0ZVR5cGUuTW9udGg6XG4gICAgICByZXR1cm4gZGF0ZS5nZXRNb250aCgpO1xuICAgIGNhc2UgRGF0ZVR5cGUuRGF0ZTpcbiAgICAgIHJldHVybiBkYXRlLmdldERhdGUoKTtcbiAgICBjYXNlIERhdGVUeXBlLkhvdXJzOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0SG91cnMoKTtcbiAgICBjYXNlIERhdGVUeXBlLk1pbnV0ZXM6XG4gICAgICByZXR1cm4gZGF0ZS5nZXRNaW51dGVzKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5TZWNvbmRzOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0U2Vjb25kcygpO1xuICAgIGNhc2UgRGF0ZVR5cGUuRnJhY3Rpb25hbFNlY29uZHM6XG4gICAgICByZXR1cm4gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKTtcbiAgICBjYXNlIERhdGVUeXBlLkRheTpcbiAgICAgIHJldHVybiBkYXRlLmdldERheSgpO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gRGF0ZVR5cGUgdmFsdWUgXCIke3BhcnR9XCIuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZGF0ZSBmb3JtYXR0ZXIgdGhhdCB0cmFuc2Zvcm1zIGEgZGF0ZSBpbnRvIGl0cyBsb2NhbGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gKi9cbmZ1bmN0aW9uIGRhdGVTdHJHZXR0ZXIoXG4gIG5hbWU6IFRyYW5zbGF0aW9uVHlwZSxcbiAgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgsXG4gIGZvcm06IEZvcm1TdHlsZSA9IEZvcm1TdHlsZS5Gb3JtYXQsXG4gIGV4dGVuZGVkID0gZmFsc2UsXG4pOiBEYXRlRm9ybWF0dGVyIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGdldERhdGVUcmFuc2xhdGlvbihkYXRlLCBsb2NhbGUsIG5hbWUsIHdpZHRoLCBmb3JtLCBleHRlbmRlZCk7XG4gIH07XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbG9jYWxlIHRyYW5zbGF0aW9uIG9mIGEgZGF0ZSBmb3IgYSBnaXZlbiBmb3JtLCB0eXBlIGFuZCB3aWR0aFxuICovXG5mdW5jdGlvbiBnZXREYXRlVHJhbnNsYXRpb24oXG4gIGRhdGU6IERhdGUsXG4gIGxvY2FsZTogc3RyaW5nLFxuICBuYW1lOiBUcmFuc2xhdGlvblR5cGUsXG4gIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoLFxuICBmb3JtOiBGb3JtU3R5bGUsXG4gIGV4dGVuZGVkOiBib29sZWFuLFxuKSB7XG4gIHN3aXRjaCAobmFtZSkge1xuICAgIGNhc2UgVHJhbnNsYXRpb25UeXBlLk1vbnRoczpcbiAgICAgIHJldHVybiBnZXRMb2NhbGVNb250aE5hbWVzKGxvY2FsZSwgZm9ybSwgd2lkdGgpW2RhdGUuZ2V0TW9udGgoKV07XG4gICAgY2FzZSBUcmFuc2xhdGlvblR5cGUuRGF5czpcbiAgICAgIHJldHVybiBnZXRMb2NhbGVEYXlOYW1lcyhsb2NhbGUsIGZvcm0sIHdpZHRoKVtkYXRlLmdldERheSgpXTtcbiAgICBjYXNlIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzOlxuICAgICAgY29uc3QgY3VycmVudEhvdXJzID0gZGF0ZS5nZXRIb3VycygpO1xuICAgICAgY29uc3QgY3VycmVudE1pbnV0ZXMgPSBkYXRlLmdldE1pbnV0ZXMoKTtcbiAgICAgIGlmIChleHRlbmRlZCkge1xuICAgICAgICBjb25zdCBydWxlcyA9IGdldExvY2FsZUV4dHJhRGF5UGVyaW9kUnVsZXMobG9jYWxlKTtcbiAgICAgICAgY29uc3QgZGF5UGVyaW9kcyA9IGdldExvY2FsZUV4dHJhRGF5UGVyaW9kcyhsb2NhbGUsIGZvcm0sIHdpZHRoKTtcbiAgICAgICAgY29uc3QgaW5kZXggPSBydWxlcy5maW5kSW5kZXgoKHJ1bGUpID0+IHtcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShydWxlKSkge1xuICAgICAgICAgICAgLy8gbW9ybmluZywgYWZ0ZXJub29uLCBldmVuaW5nLCBuaWdodFxuICAgICAgICAgICAgY29uc3QgW2Zyb20sIHRvXSA9IHJ1bGU7XG4gICAgICAgICAgICBjb25zdCBhZnRlckZyb20gPSBjdXJyZW50SG91cnMgPj0gZnJvbS5ob3VycyAmJiBjdXJyZW50TWludXRlcyA+PSBmcm9tLm1pbnV0ZXM7XG4gICAgICAgICAgICBjb25zdCBiZWZvcmVUbyA9XG4gICAgICAgICAgICAgIGN1cnJlbnRIb3VycyA8IHRvLmhvdXJzIHx8IChjdXJyZW50SG91cnMgPT09IHRvLmhvdXJzICYmIGN1cnJlbnRNaW51dGVzIDwgdG8ubWludXRlcyk7XG4gICAgICAgICAgICAvLyBXZSBtdXN0IGFjY291bnQgZm9yIG5vcm1hbCBydWxlcyB0aGF0IHNwYW4gYSBwZXJpb2QgZHVyaW5nIHRoZSBkYXkgKGUuZy4gNmFtLTlhbSlcbiAgICAgICAgICAgIC8vIHdoZXJlIGBmcm9tYCBpcyBsZXNzIChlYXJsaWVyKSB0aGFuIGB0b2AuIEJ1dCBhbHNvIHJ1bGVzIHRoYXQgc3BhbiBtaWRuaWdodCAoZS5nLlxuICAgICAgICAgICAgLy8gMTBwbSAtIDVhbSkgd2hlcmUgYGZyb21gIGlzIGdyZWF0ZXIgKGxhdGVyISkgdGhhbiBgdG9gLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIEluIHRoZSBmaXJzdCBjYXNlIHRoZSBjdXJyZW50IHRpbWUgbXVzdCBiZSBCT1RIIGFmdGVyIGBmcm9tYCBBTkQgYmVmb3JlIGB0b2BcbiAgICAgICAgICAgIC8vIChlLmcuIDhhbSBpcyBhZnRlciA2YW0gQU5EIGJlZm9yZSAxMGFtKS5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBJbiB0aGUgc2Vjb25kIGNhc2UgdGhlIGN1cnJlbnQgdGltZSBtdXN0IGJlIEVJVEhFUiBhZnRlciBgZnJvbWAgT1IgYmVmb3JlIGB0b2BcbiAgICAgICAgICAgIC8vIChlLmcuIDRhbSBpcyBiZWZvcmUgNWFtIGJ1dCBub3QgYWZ0ZXIgMTBwbTsgYW5kIDExcG0gaXMgbm90IGJlZm9yZSA1YW0gYnV0IGl0IGlzXG4gICAgICAgICAgICAvLyBhZnRlciAxMHBtKS5cbiAgICAgICAgICAgIGlmIChmcm9tLmhvdXJzIDwgdG8uaG91cnMpIHtcbiAgICAgICAgICAgICAgaWYgKGFmdGVyRnJvbSAmJiBiZWZvcmVUbykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFmdGVyRnJvbSB8fCBiZWZvcmVUbykge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbm9vbiBvciBtaWRuaWdodFxuICAgICAgICAgICAgaWYgKHJ1bGUuaG91cnMgPT09IGN1cnJlbnRIb3VycyAmJiBydWxlLm1pbnV0ZXMgPT09IGN1cnJlbnRNaW51dGVzKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIGRheVBlcmlvZHNbaW5kZXhdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBpZiBubyBydWxlcyBmb3IgdGhlIGRheSBwZXJpb2RzLCB3ZSB1c2UgYW0vcG0gYnkgZGVmYXVsdFxuICAgICAgcmV0dXJuIGdldExvY2FsZURheVBlcmlvZHMobG9jYWxlLCBmb3JtLCA8VHJhbnNsYXRpb25XaWR0aD53aWR0aClbY3VycmVudEhvdXJzIDwgMTIgPyAwIDogMV07XG4gICAgY2FzZSBUcmFuc2xhdGlvblR5cGUuRXJhczpcbiAgICAgIHJldHVybiBnZXRMb2NhbGVFcmFOYW1lcyhsb2NhbGUsIDxUcmFuc2xhdGlvbldpZHRoPndpZHRoKVtkYXRlLmdldEZ1bGxZZWFyKCkgPD0gMCA/IDAgOiAxXTtcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gVGhpcyBkZWZhdWx0IGNhc2UgaXMgbm90IG5lZWRlZCBieSBUeXBlU2NyaXB0IGNvbXBpbGVyLCBhcyB0aGUgc3dpdGNoIGlzIGV4aGF1c3RpdmUuXG4gICAgICAvLyBIb3dldmVyIENsb3N1cmUgQ29tcGlsZXIgZG9lcyBub3QgdW5kZXJzdGFuZCB0aGF0IGFuZCByZXBvcnRzIGFuIGVycm9yIGluIHR5cGVkIG1vZGUuXG4gICAgICAvLyBUaGUgYHRocm93IG5ldyBFcnJvcmAgYmVsb3cgd29ya3MgYXJvdW5kIHRoZSBwcm9ibGVtLCBhbmQgdGhlIHVuZXhwZWN0ZWQ6IG5ldmVyIHZhcmlhYmxlXG4gICAgICAvLyBtYWtlcyBzdXJlIHRzYyBzdGlsbCBjaGVja3MgdGhpcyBjb2RlIGlzIHVucmVhY2hhYmxlLlxuICAgICAgY29uc3QgdW5leHBlY3RlZDogbmV2ZXIgPSBuYW1lO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bmV4cGVjdGVkIHRyYW5zbGF0aW9uIHR5cGUgJHt1bmV4cGVjdGVkfWApO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGRhdGUgZm9ybWF0dGVyIHRoYXQgdHJhbnNmb3JtcyBhIGRhdGUgYW5kIGFuIG9mZnNldCBpbnRvIGEgdGltZXpvbmUgd2l0aCBJU084NjAxIG9yXG4gKiBHTVQgZm9ybWF0IGRlcGVuZGluZyBvbiB0aGUgd2lkdGggKGVnOiBzaG9ydCA9ICswNDMwLCBzaG9ydDpHTVQgPSBHTVQrNCwgbG9uZyA9IEdNVCswNDozMCxcbiAqIGV4dGVuZGVkID0gKzA0OjMwKVxuICovXG5mdW5jdGlvbiB0aW1lWm9uZUdldHRlcih3aWR0aDogWm9uZVdpZHRoKTogRGF0ZUZvcm1hdHRlciB7XG4gIHJldHVybiBmdW5jdGlvbiAoZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcsIG9mZnNldDogbnVtYmVyKSB7XG4gICAgY29uc3Qgem9uZSA9IC0xICogb2Zmc2V0O1xuICAgIGNvbnN0IG1pbnVzU2lnbiA9IGdldExvY2FsZU51bWJlclN5bWJvbChsb2NhbGUsIE51bWJlclN5bWJvbC5NaW51c1NpZ24pO1xuICAgIGNvbnN0IGhvdXJzID0gem9uZSA+IDAgPyBNYXRoLmZsb29yKHpvbmUgLyA2MCkgOiBNYXRoLmNlaWwoem9uZSAvIDYwKTtcbiAgICBzd2l0Y2ggKHdpZHRoKSB7XG4gICAgICBjYXNlIFpvbmVXaWR0aC5TaG9ydDpcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAoem9uZSA+PSAwID8gJysnIDogJycpICtcbiAgICAgICAgICBwYWROdW1iZXIoaG91cnMsIDIsIG1pbnVzU2lnbikgK1xuICAgICAgICAgIHBhZE51bWJlcihNYXRoLmFicyh6b25lICUgNjApLCAyLCBtaW51c1NpZ24pXG4gICAgICAgICk7XG4gICAgICBjYXNlIFpvbmVXaWR0aC5TaG9ydEdNVDpcbiAgICAgICAgcmV0dXJuICdHTVQnICsgKHpvbmUgPj0gMCA/ICcrJyA6ICcnKSArIHBhZE51bWJlcihob3VycywgMSwgbWludXNTaWduKTtcbiAgICAgIGNhc2UgWm9uZVdpZHRoLkxvbmc6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgJ0dNVCcgK1xuICAgICAgICAgICh6b25lID49IDAgPyAnKycgOiAnJykgK1xuICAgICAgICAgIHBhZE51bWJlcihob3VycywgMiwgbWludXNTaWduKSArXG4gICAgICAgICAgJzonICtcbiAgICAgICAgICBwYWROdW1iZXIoTWF0aC5hYnMoem9uZSAlIDYwKSwgMiwgbWludXNTaWduKVxuICAgICAgICApO1xuICAgICAgY2FzZSBab25lV2lkdGguRXh0ZW5kZWQ6XG4gICAgICAgIGlmIChvZmZzZXQgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gJ1onO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAoem9uZSA+PSAwID8gJysnIDogJycpICtcbiAgICAgICAgICAgIHBhZE51bWJlcihob3VycywgMiwgbWludXNTaWduKSArXG4gICAgICAgICAgICAnOicgK1xuICAgICAgICAgICAgcGFkTnVtYmVyKE1hdGguYWJzKHpvbmUgJSA2MCksIDIsIG1pbnVzU2lnbilcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gem9uZSB3aWR0aCBcIiR7d2lkdGh9XCJgKTtcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IEpBTlVBUlkgPSAwO1xuY29uc3QgVEhVUlNEQVkgPSA0O1xuZnVuY3Rpb24gZ2V0Rmlyc3RUaHVyc2RheU9mWWVhcih5ZWFyOiBudW1iZXIpIHtcbiAgY29uc3QgZmlyc3REYXlPZlllYXIgPSBjcmVhdGVEYXRlKHllYXIsIEpBTlVBUlksIDEpLmdldERheSgpO1xuICByZXR1cm4gY3JlYXRlRGF0ZShcbiAgICB5ZWFyLFxuICAgIDAsXG4gICAgMSArIChmaXJzdERheU9mWWVhciA8PSBUSFVSU0RBWSA/IFRIVVJTREFZIDogVEhVUlNEQVkgKyA3KSAtIGZpcnN0RGF5T2ZZZWFyLFxuICApO1xufVxuXG4vKipcbiAqICBJU08gV2VlayBzdGFydHMgb24gZGF5IDEgKE1vbmRheSkgYW5kIGVuZHMgd2l0aCBkYXkgMCAoU3VuZGF5KVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGh1cnNkYXlUaGlzSXNvV2VlayhkYXRldGltZTogRGF0ZSkge1xuICAvLyBnZXREYXkgcmV0dXJucyAwLTYgcmFuZ2Ugd2l0aCBzdW5kYXkgYXMgMC5cbiAgY29uc3QgY3VycmVudERheSA9IGRhdGV0aW1lLmdldERheSgpO1xuXG4gIC8vIE9uIGEgU3VuZGF5LCByZWFkIHRoZSBwcmV2aW91cyBUaHVyc2RheSBzaW5jZSBJU08gd2Vla3Mgc3RhcnQgb24gTW9uZGF5LlxuICBjb25zdCBkZWx0YVRvVGh1cnNkYXkgPSBjdXJyZW50RGF5ID09PSAwID8gLTMgOiBUSFVSU0RBWSAtIGN1cnJlbnREYXk7XG5cbiAgcmV0dXJuIGNyZWF0ZURhdGUoXG4gICAgZGF0ZXRpbWUuZ2V0RnVsbFllYXIoKSxcbiAgICBkYXRldGltZS5nZXRNb250aCgpLFxuICAgIGRhdGV0aW1lLmdldERhdGUoKSArIGRlbHRhVG9UaHVyc2RheSxcbiAgKTtcbn1cblxuZnVuY3Rpb24gd2Vla0dldHRlcihzaXplOiBudW1iZXIsIG1vbnRoQmFzZWQgPSBmYWxzZSk6IERhdGVGb3JtYXR0ZXIge1xuICByZXR1cm4gZnVuY3Rpb24gKGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nKSB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBpZiAobW9udGhCYXNlZCkge1xuICAgICAgY29uc3QgbmJEYXlzQmVmb3JlMXN0RGF5T2ZNb250aCA9XG4gICAgICAgIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCAxKS5nZXREYXkoKSAtIDE7XG4gICAgICBjb25zdCB0b2RheSA9IGRhdGUuZ2V0RGF0ZSgpO1xuICAgICAgcmVzdWx0ID0gMSArIE1hdGguZmxvb3IoKHRvZGF5ICsgbmJEYXlzQmVmb3JlMXN0RGF5T2ZNb250aCkgLyA3KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdGhpc1RodXJzID0gZ2V0VGh1cnNkYXlUaGlzSXNvV2VlayhkYXRlKTtcbiAgICAgIC8vIFNvbWUgZGF5cyBvZiBhIHllYXIgYXJlIHBhcnQgb2YgbmV4dCB5ZWFyIGFjY29yZGluZyB0byBJU08gODYwMS5cbiAgICAgIC8vIENvbXB1dGUgdGhlIGZpcnN0VGh1cnMgZnJvbSB0aGUgeWVhciBvZiB0aGlzIHdlZWsncyBUaHVyc2RheVxuICAgICAgY29uc3QgZmlyc3RUaHVycyA9IGdldEZpcnN0VGh1cnNkYXlPZlllYXIodGhpc1RodXJzLmdldEZ1bGxZZWFyKCkpO1xuICAgICAgY29uc3QgZGlmZiA9IHRoaXNUaHVycy5nZXRUaW1lKCkgLSBmaXJzdFRodXJzLmdldFRpbWUoKTtcbiAgICAgIHJlc3VsdCA9IDEgKyBNYXRoLnJvdW5kKGRpZmYgLyA2LjA0OGU4KTsgLy8gNi4wNDhlOCBtcyBwZXIgd2Vla1xuICAgIH1cblxuICAgIHJldHVybiBwYWROdW1iZXIocmVzdWx0LCBzaXplLCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuTWludXNTaWduKSk7XG4gIH07XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGRhdGUgZm9ybWF0dGVyIHRoYXQgcHJvdmlkZXMgdGhlIHdlZWstbnVtYmVyaW5nIHllYXIgZm9yIHRoZSBpbnB1dCBkYXRlLlxuICovXG5mdW5jdGlvbiB3ZWVrTnVtYmVyaW5nWWVhckdldHRlcihzaXplOiBudW1iZXIsIHRyaW0gPSBmYWxzZSk6IERhdGVGb3JtYXR0ZXIge1xuICByZXR1cm4gZnVuY3Rpb24gKGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nKSB7XG4gICAgY29uc3QgdGhpc1RodXJzID0gZ2V0VGh1cnNkYXlUaGlzSXNvV2VlayhkYXRlKTtcbiAgICBjb25zdCB3ZWVrTnVtYmVyaW5nWWVhciA9IHRoaXNUaHVycy5nZXRGdWxsWWVhcigpO1xuICAgIHJldHVybiBwYWROdW1iZXIoXG4gICAgICB3ZWVrTnVtYmVyaW5nWWVhcixcbiAgICAgIHNpemUsXG4gICAgICBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuTWludXNTaWduKSxcbiAgICAgIHRyaW0sXG4gICAgKTtcbiAgfTtcbn1cblxudHlwZSBEYXRlRm9ybWF0dGVyID0gKGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nLCBvZmZzZXQ6IG51bWJlcikgPT4gc3RyaW5nO1xuXG5jb25zdCBEQVRFX0ZPUk1BVFM6IHtbZm9ybWF0OiBzdHJpbmddOiBEYXRlRm9ybWF0dGVyfSA9IHt9O1xuXG4vLyBCYXNlZCBvbiBDTERSIGZvcm1hdHM6XG4vLyBTZWUgY29tcGxldGUgbGlzdDogaHR0cDovL3d3dy51bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI0RhdGVfRmllbGRfU3ltYm9sX1RhYmxlXG4vLyBTZWUgYWxzbyBleHBsYW5hdGlvbnM6IGh0dHA6Ly9jbGRyLnVuaWNvZGUub3JnL3RyYW5zbGF0aW9uL2RhdGUtdGltZVxuLy8gVE9ETyhvY29tYmUpOiBzdXBwb3J0IGFsbCBtaXNzaW5nIGNsZHIgZm9ybWF0czogVSwgUSwgRCwgRiwgZSwgaiwgSiwgQywgQSwgdiwgViwgWCwgeFxuZnVuY3Rpb24gZ2V0RGF0ZUZvcm1hdHRlcihmb3JtYXQ6IHN0cmluZyk6IERhdGVGb3JtYXR0ZXIgfCBudWxsIHtcbiAgaWYgKERBVEVfRk9STUFUU1tmb3JtYXRdKSB7XG4gICAgcmV0dXJuIERBVEVfRk9STUFUU1tmb3JtYXRdO1xuICB9XG4gIGxldCBmb3JtYXR0ZXI7XG4gIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgLy8gRXJhIG5hbWUgKEFEL0JDKVxuICAgIGNhc2UgJ0cnOlxuICAgIGNhc2UgJ0dHJzpcbiAgICBjYXNlICdHR0cnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRXJhcywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdHR0dHJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkVyYXMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdHR0dHRyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5FcmFzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdyk7XG4gICAgICBicmVhaztcblxuICAgIC8vIDEgZGlnaXQgcmVwcmVzZW50YXRpb24gb2YgdGhlIHllYXIsIGUuZy4gKEFEIDEgPT4gMSwgQUQgMTk5ID0+IDE5OSlcbiAgICBjYXNlICd5JzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnVsbFllYXIsIDEsIDAsIGZhbHNlLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIDIgZGlnaXQgcmVwcmVzZW50YXRpb24gb2YgdGhlIHllYXIsIHBhZGRlZCAoMDAtOTkpLiAoZS5nLiBBRCAyMDAxID0+IDAxLCBBRCAyMDEwID0+IDEwKVxuICAgIGNhc2UgJ3l5JzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnVsbFllYXIsIDIsIDAsIHRydWUsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gMyBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgeWVhciwgcGFkZGVkICgwMDAtOTk5KS4gKGUuZy4gQUQgMjAwMSA9PiAwMSwgQUQgMjAxMCA9PiAxMClcbiAgICBjYXNlICd5eXknOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GdWxsWWVhciwgMywgMCwgZmFsc2UsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gNCBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgeWVhciAoZS5nLiBBRCAxID0+IDAwMDEsIEFEIDIwMTAgPT4gMjAxMClcbiAgICBjYXNlICd5eXl5JzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnVsbFllYXIsIDQsIDAsIGZhbHNlLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gMSBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgd2Vlay1udW1iZXJpbmcgeWVhciwgZS5nLiAoQUQgMSA9PiAxLCBBRCAxOTkgPT4gMTk5KVxuICAgIGNhc2UgJ1knOlxuICAgICAgZm9ybWF0dGVyID0gd2Vla051bWJlcmluZ1llYXJHZXR0ZXIoMSk7XG4gICAgICBicmVhaztcbiAgICAvLyAyIGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB3ZWVrLW51bWJlcmluZyB5ZWFyLCBwYWRkZWQgKDAwLTk5KS4gKGUuZy4gQUQgMjAwMSA9PiAwMSwgQURcbiAgICAvLyAyMDEwID0+IDEwKVxuICAgIGNhc2UgJ1lZJzpcbiAgICAgIGZvcm1hdHRlciA9IHdlZWtOdW1iZXJpbmdZZWFyR2V0dGVyKDIsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gMyBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB0aGUgd2Vlay1udW1iZXJpbmcgeWVhciwgcGFkZGVkICgwMDAtOTk5KS4gKGUuZy4gQUQgMSA9PiAwMDEsIEFEXG4gICAgLy8gMjAxMCA9PiAyMDEwKVxuICAgIGNhc2UgJ1lZWSc6XG4gICAgICBmb3JtYXR0ZXIgPSB3ZWVrTnVtYmVyaW5nWWVhckdldHRlcigzKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIDQgZGlnaXQgcmVwcmVzZW50YXRpb24gb2YgdGhlIHdlZWstbnVtYmVyaW5nIHllYXIgKGUuZy4gQUQgMSA9PiAwMDAxLCBBRCAyMDEwID0+IDIwMTApXG4gICAgY2FzZSAnWVlZWSc6XG4gICAgICBmb3JtYXR0ZXIgPSB3ZWVrTnVtYmVyaW5nWWVhckdldHRlcig0KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gTW9udGggb2YgdGhlIHllYXIgKDEtMTIpLCBudW1lcmljXG4gICAgY2FzZSAnTSc6XG4gICAgY2FzZSAnTCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLk1vbnRoLCAxLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ01NJzpcbiAgICBjYXNlICdMTCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLk1vbnRoLCAyLCAxKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gTW9udGggb2YgdGhlIHllYXIgKEphbnVhcnksIC4uLiksIHN0cmluZywgZm9ybWF0XG4gICAgY2FzZSAnTU1NJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLk1vbnRocywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNTU1NJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLk1vbnRocywgVHJhbnNsYXRpb25XaWR0aC5XaWRlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ01NTU1NJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLk1vbnRocywgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3cpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBNb250aCBvZiB0aGUgeWVhciAoSmFudWFyeSwgLi4uKSwgc3RyaW5nLCBzdGFuZGFsb25lXG4gICAgY2FzZSAnTExMJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgIFRyYW5zbGF0aW9uVHlwZS5Nb250aHMsXG4gICAgICAgIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQsXG4gICAgICAgIEZvcm1TdHlsZS5TdGFuZGFsb25lLFxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0xMTEwnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgVHJhbnNsYXRpb25UeXBlLk1vbnRocyxcbiAgICAgICAgVHJhbnNsYXRpb25XaWR0aC5XaWRlLFxuICAgICAgICBGb3JtU3R5bGUuU3RhbmRhbG9uZSxcbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdMTExMTCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICBUcmFuc2xhdGlvblR5cGUuTW9udGhzLFxuICAgICAgICBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdyxcbiAgICAgICAgRm9ybVN0eWxlLlN0YW5kYWxvbmUsXG4gICAgICApO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBXZWVrIG9mIHRoZSB5ZWFyICgxLCAuLi4gNTIpXG4gICAgY2FzZSAndyc6XG4gICAgICBmb3JtYXR0ZXIgPSB3ZWVrR2V0dGVyKDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnd3cnOlxuICAgICAgZm9ybWF0dGVyID0gd2Vla0dldHRlcigyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gV2VlayBvZiB0aGUgbW9udGggKDEsIC4uLilcbiAgICBjYXNlICdXJzpcbiAgICAgIGZvcm1hdHRlciA9IHdlZWtHZXR0ZXIoMSwgdHJ1ZSk7XG4gICAgICBicmVhaztcblxuICAgIC8vIERheSBvZiB0aGUgbW9udGggKDEtMzEpXG4gICAgY2FzZSAnZCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkRhdGUsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGQnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5EYXRlLCAyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRGF5IG9mIHRoZSBXZWVrIFN0YW5kQWxvbmUgKDEsIDEsIE1vbiwgTW9uZGF5LCBNLCBNbylcbiAgICBjYXNlICdjJzpcbiAgICBjYXNlICdjYyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkRheSwgMSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjY2MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheXMsXG4gICAgICAgIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQsXG4gICAgICAgIEZvcm1TdHlsZS5TdGFuZGFsb25lLFxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NjY2MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5cywgVHJhbnNsYXRpb25XaWR0aC5XaWRlLCBGb3JtU3R5bGUuU3RhbmRhbG9uZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjY2NjYyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICBUcmFuc2xhdGlvblR5cGUuRGF5cyxcbiAgICAgICAgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3csXG4gICAgICAgIEZvcm1TdHlsZS5TdGFuZGFsb25lLFxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NjY2NjYyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlzLCBUcmFuc2xhdGlvbldpZHRoLlNob3J0LCBGb3JtU3R5bGUuU3RhbmRhbG9uZSk7XG4gICAgICBicmVhaztcblxuICAgIC8vIERheSBvZiB0aGUgV2Vla1xuICAgIGNhc2UgJ0UnOlxuICAgIGNhc2UgJ0VFJzpcbiAgICBjYXNlICdFRUUnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5cywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdFRUVFJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheXMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdFRUVFRSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdFRUVFRUUnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5cywgVHJhbnNsYXRpb25XaWR0aC5TaG9ydCk7XG4gICAgICBicmVhaztcblxuICAgIC8vIEdlbmVyaWMgcGVyaW9kIG9mIHRoZSBkYXkgKGFtLXBtKVxuICAgIGNhc2UgJ2EnOlxuICAgIGNhc2UgJ2FhJzpcbiAgICBjYXNlICdhYWEnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdhYWFhJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdhYWFhYSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdyk7XG4gICAgICBicmVhaztcblxuICAgIC8vIEV4dGVuZGVkIHBlcmlvZCBvZiB0aGUgZGF5IChtaWRuaWdodCwgYXQgbmlnaHQsIC4uLiksIHN0YW5kYWxvbmVcbiAgICBjYXNlICdiJzpcbiAgICBjYXNlICdiYic6XG4gICAgY2FzZSAnYmJiJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLFxuICAgICAgICBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkLFxuICAgICAgICBGb3JtU3R5bGUuU3RhbmRhbG9uZSxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiYmJiJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLFxuICAgICAgICBUcmFuc2xhdGlvbldpZHRoLldpZGUsXG4gICAgICAgIEZvcm1TdHlsZS5TdGFuZGFsb25lLFxuICAgICAgICB0cnVlLFxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JiYmJiJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLFxuICAgICAgICBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdyxcbiAgICAgICAgRm9ybVN0eWxlLlN0YW5kYWxvbmUsXG4gICAgICAgIHRydWUsXG4gICAgICApO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBFeHRlbmRlZCBwZXJpb2Qgb2YgdGhlIGRheSAobWlkbmlnaHQsIG5pZ2h0LCAuLi4pLCBzdGFuZGFsb25lXG4gICAgY2FzZSAnQic6XG4gICAgY2FzZSAnQkInOlxuICAgIGNhc2UgJ0JCQic6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICBUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcyxcbiAgICAgICAgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCxcbiAgICAgICAgRm9ybVN0eWxlLkZvcm1hdCxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdCQkJCJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLFxuICAgICAgICBUcmFuc2xhdGlvbldpZHRoLldpZGUsXG4gICAgICAgIEZvcm1TdHlsZS5Gb3JtYXQsXG4gICAgICAgIHRydWUsXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnQkJCQkInOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsXG4gICAgICAgIFRyYW5zbGF0aW9uV2lkdGguTmFycm93LFxuICAgICAgICBGb3JtU3R5bGUuRm9ybWF0LFxuICAgICAgICB0cnVlLFxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gSG91ciBpbiBBTS9QTSwgKDEtMTIpXG4gICAgY2FzZSAnaCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkhvdXJzLCAxLCAtMTIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaGgnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5Ib3VycywgMiwgLTEyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gSG91ciBvZiB0aGUgZGF5ICgwLTIzKVxuICAgIGNhc2UgJ0gnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5Ib3VycywgMSk7XG4gICAgICBicmVhaztcbiAgICAvLyBIb3VyIGluIGRheSwgcGFkZGVkICgwMC0yMylcbiAgICBjYXNlICdISCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkhvdXJzLCAyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gTWludXRlIG9mIHRoZSBob3VyICgwLTU5KVxuICAgIGNhc2UgJ20nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5NaW51dGVzLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21tJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuTWludXRlcywgMik7XG4gICAgICBicmVhaztcblxuICAgIC8vIFNlY29uZCBvZiB0aGUgbWludXRlICgwLTU5KVxuICAgIGNhc2UgJ3MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5TZWNvbmRzLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NzJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuU2Vjb25kcywgMik7XG4gICAgICBicmVhaztcblxuICAgIC8vIEZyYWN0aW9uYWwgc2Vjb25kXG4gICAgY2FzZSAnUyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkZyYWN0aW9uYWxTZWNvbmRzLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1NTJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnJhY3Rpb25hbFNlY29uZHMsIDIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnU1NTJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnJhY3Rpb25hbFNlY29uZHMsIDMpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBUaW1lem9uZSBJU084NjAxIHNob3J0IGZvcm1hdCAoLTA0MzApXG4gICAgY2FzZSAnWic6XG4gICAgY2FzZSAnWlonOlxuICAgIGNhc2UgJ1paWic6XG4gICAgICBmb3JtYXR0ZXIgPSB0aW1lWm9uZUdldHRlcihab25lV2lkdGguU2hvcnQpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gVGltZXpvbmUgSVNPODYwMSBleHRlbmRlZCBmb3JtYXQgKC0wNDozMClcbiAgICBjYXNlICdaWlpaWic6XG4gICAgICBmb3JtYXR0ZXIgPSB0aW1lWm9uZUdldHRlcihab25lV2lkdGguRXh0ZW5kZWQpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBUaW1lem9uZSBHTVQgc2hvcnQgZm9ybWF0IChHTVQrNClcbiAgICBjYXNlICdPJzpcbiAgICBjYXNlICdPTyc6XG4gICAgY2FzZSAnT09PJzpcbiAgICAvLyBTaG91bGQgYmUgbG9jYXRpb24sIGJ1dCBmYWxsYmFjayB0byBmb3JtYXQgTyBpbnN0ZWFkIGJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSB0aGUgZGF0YSB5ZXRcbiAgICBjYXNlICd6JzpcbiAgICBjYXNlICd6eic6XG4gICAgY2FzZSAnenp6JzpcbiAgICAgIGZvcm1hdHRlciA9IHRpbWVab25lR2V0dGVyKFpvbmVXaWR0aC5TaG9ydEdNVCk7XG4gICAgICBicmVhaztcbiAgICAvLyBUaW1lem9uZSBHTVQgbG9uZyBmb3JtYXQgKEdNVCswNDMwKVxuICAgIGNhc2UgJ09PT08nOlxuICAgIGNhc2UgJ1paWlonOlxuICAgIC8vIFNob3VsZCBiZSBsb2NhdGlvbiwgYnV0IGZhbGxiYWNrIHRvIGZvcm1hdCBPIGluc3RlYWQgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIHRoZSBkYXRhIHlldFxuICAgIGNhc2UgJ3p6enonOlxuICAgICAgZm9ybWF0dGVyID0gdGltZVpvbmVHZXR0ZXIoWm9uZVdpZHRoLkxvbmcpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG4gIERBVEVfRk9STUFUU1tmb3JtYXRdID0gZm9ybWF0dGVyO1xuICByZXR1cm4gZm9ybWF0dGVyO1xufVxuXG5mdW5jdGlvbiB0aW1lem9uZVRvT2Zmc2V0KHRpbWV6b25lOiBzdHJpbmcsIGZhbGxiYWNrOiBudW1iZXIpOiBudW1iZXIge1xuICAvLyBTdXBwb3J0OiBJRSAxMSBvbmx5LCBFZGdlIDEzLTE1K1xuICAvLyBJRS9FZGdlIGRvIG5vdCBcInVuZGVyc3RhbmRcIiBjb2xvbiAoYDpgKSBpbiB0aW1lem9uZVxuICB0aW1lem9uZSA9IHRpbWV6b25lLnJlcGxhY2UoLzovZywgJycpO1xuICBjb25zdCByZXF1ZXN0ZWRUaW1lem9uZU9mZnNldCA9IERhdGUucGFyc2UoJ0phbiAwMSwgMTk3MCAwMDowMDowMCAnICsgdGltZXpvbmUpIC8gNjAwMDA7XG4gIHJldHVybiBpc05hTihyZXF1ZXN0ZWRUaW1lem9uZU9mZnNldCkgPyBmYWxsYmFjayA6IHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0O1xufVxuXG5mdW5jdGlvbiBhZGREYXRlTWludXRlcyhkYXRlOiBEYXRlLCBtaW51dGVzOiBudW1iZXIpIHtcbiAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpKTtcbiAgZGF0ZS5zZXRNaW51dGVzKGRhdGUuZ2V0TWludXRlcygpICsgbWludXRlcyk7XG4gIHJldHVybiBkYXRlO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0VGltZXpvbmVUb0xvY2FsKGRhdGU6IERhdGUsIHRpbWV6b25lOiBzdHJpbmcsIHJldmVyc2U6IGJvb2xlYW4pOiBEYXRlIHtcbiAgY29uc3QgcmV2ZXJzZVZhbHVlID0gcmV2ZXJzZSA/IC0xIDogMTtcbiAgY29uc3QgZGF0ZVRpbWV6b25lT2Zmc2V0ID0gZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICBjb25zdCB0aW1lem9uZU9mZnNldCA9IHRpbWV6b25lVG9PZmZzZXQodGltZXpvbmUsIGRhdGVUaW1lem9uZU9mZnNldCk7XG4gIHJldHVybiBhZGREYXRlTWludXRlcyhkYXRlLCByZXZlcnNlVmFsdWUgKiAodGltZXpvbmVPZmZzZXQgLSBkYXRlVGltZXpvbmVPZmZzZXQpKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIHZhbHVlIHRvIGRhdGUuXG4gKlxuICogU3VwcG9ydGVkIGlucHV0IGZvcm1hdHM6XG4gKiAtIGBEYXRlYFxuICogLSBudW1iZXI6IHRpbWVzdGFtcFxuICogLSBzdHJpbmc6IG51bWVyaWMgKGUuZy4gXCIxMjM0XCIpLCBJU08gYW5kIGRhdGUgc3RyaW5ncyBpbiBhIGZvcm1hdCBzdXBwb3J0ZWQgYnlcbiAqICAgW0RhdGUucGFyc2UoKV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRGF0ZS9wYXJzZSkuXG4gKiAgIE5vdGU6IElTTyBzdHJpbmdzIHdpdGhvdXQgdGltZSByZXR1cm4gYSBkYXRlIHdpdGhvdXQgdGltZW9mZnNldC5cbiAqXG4gKiBUaHJvd3MgaWYgdW5hYmxlIHRvIGNvbnZlcnQgdG8gYSBkYXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9EYXRlKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBEYXRlKTogRGF0ZSB7XG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSkge1xuICAgIHJldHVybiBuZXcgRGF0ZSh2YWx1ZSk7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUudHJpbSgpO1xuXG4gICAgaWYgKC9eKFxcZHs0fSgtXFxkezEsMn0oLVxcZHsxLDJ9KT8pPykkLy50ZXN0KHZhbHVlKSkge1xuICAgICAgLyogRm9yIElTTyBTdHJpbmdzIHdpdGhvdXQgdGltZSB0aGUgZGF5LCBtb250aCBhbmQgeWVhciBtdXN0IGJlIGV4dHJhY3RlZCBmcm9tIHRoZSBJU08gU3RyaW5nXG4gICAgICBiZWZvcmUgRGF0ZSBjcmVhdGlvbiB0byBhdm9pZCB0aW1lIG9mZnNldCBhbmQgZXJyb3JzIGluIHRoZSBuZXcgRGF0ZS5cbiAgICAgIElmIHdlIG9ubHkgcmVwbGFjZSAnLScgd2l0aCAnLCcgaW4gdGhlIElTTyBTdHJpbmcgKFwiMjAxNSwwMSwwMVwiKSwgYW5kIHRyeSB0byBjcmVhdGUgYSBuZXdcbiAgICAgIGRhdGUsIHNvbWUgYnJvd3NlcnMgKGUuZy4gSUUgOSkgd2lsbCB0aHJvdyBhbiBpbnZhbGlkIERhdGUgZXJyb3IuXG4gICAgICBJZiB3ZSBsZWF2ZSB0aGUgJy0nIChcIjIwMTUtMDEtMDFcIikgYW5kIHRyeSB0byBjcmVhdGUgYSBuZXcgRGF0ZShcIjIwMTUtMDEtMDFcIikgdGhlIHRpbWVvZmZzZXRcbiAgICAgIGlzIGFwcGxpZWQuXG4gICAgICBOb3RlOiBJU08gbW9udGhzIGFyZSAwIGZvciBKYW51YXJ5LCAxIGZvciBGZWJydWFyeSwgLi4uICovXG4gICAgICBjb25zdCBbeSwgbSA9IDEsIGQgPSAxXSA9IHZhbHVlLnNwbGl0KCctJykubWFwKCh2YWw6IHN0cmluZykgPT4gK3ZhbCk7XG4gICAgICByZXR1cm4gY3JlYXRlRGF0ZSh5LCBtIC0gMSwgZCk7XG4gICAgfVxuXG4gICAgY29uc3QgcGFyc2VkTmIgPSBwYXJzZUZsb2F0KHZhbHVlKTtcblxuICAgIC8vIGFueSBzdHJpbmcgdGhhdCBvbmx5IGNvbnRhaW5zIG51bWJlcnMsIGxpa2UgXCIxMjM0XCIgYnV0IG5vdCBsaWtlIFwiMTIzNGhlbGxvXCJcbiAgICBpZiAoIWlzTmFOKCh2YWx1ZSBhcyBhbnkpIC0gcGFyc2VkTmIpKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUocGFyc2VkTmIpO1xuICAgIH1cblxuICAgIGxldCBtYXRjaDogUmVnRXhwTWF0Y2hBcnJheSB8IG51bGw7XG4gICAgaWYgKChtYXRjaCA9IHZhbHVlLm1hdGNoKElTTzg2MDFfREFURV9SRUdFWCkpKSB7XG4gICAgICByZXR1cm4gaXNvU3RyaW5nVG9EYXRlKG1hdGNoKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUgYXMgYW55KTtcbiAgaWYgKCFpc0RhdGUoZGF0ZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBjb252ZXJ0IFwiJHt2YWx1ZX1cIiBpbnRvIGEgZGF0ZWApO1xuICB9XG4gIHJldHVybiBkYXRlO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgZGF0ZSBpbiBJU084NjAxIHRvIGEgRGF0ZS5cbiAqIFVzZWQgaW5zdGVhZCBvZiBgRGF0ZS5wYXJzZWAgYmVjYXVzZSBvZiBicm93c2VyIGRpc2NyZXBhbmNpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc29TdHJpbmdUb0RhdGUobWF0Y2g6IFJlZ0V4cE1hdGNoQXJyYXkpOiBEYXRlIHtcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKDApO1xuICBsZXQgdHpIb3VyID0gMDtcbiAgbGV0IHR6TWluID0gMDtcblxuICAvLyBtYXRjaFs4XSBtZWFucyB0aGF0IHRoZSBzdHJpbmcgY29udGFpbnMgXCJaXCIgKFVUQykgb3IgYSB0aW1lem9uZSBsaWtlIFwiKzAxOjAwXCIgb3IgXCIrMDEwMFwiXG4gIGNvbnN0IGRhdGVTZXR0ZXIgPSBtYXRjaFs4XSA/IGRhdGUuc2V0VVRDRnVsbFllYXIgOiBkYXRlLnNldEZ1bGxZZWFyO1xuICBjb25zdCB0aW1lU2V0dGVyID0gbWF0Y2hbOF0gPyBkYXRlLnNldFVUQ0hvdXJzIDogZGF0ZS5zZXRIb3VycztcblxuICAvLyBpZiB0aGVyZSBpcyBhIHRpbWV6b25lIGRlZmluZWQgbGlrZSBcIiswMTowMFwiIG9yIFwiKzAxMDBcIlxuICBpZiAobWF0Y2hbOV0pIHtcbiAgICB0ekhvdXIgPSBOdW1iZXIobWF0Y2hbOV0gKyBtYXRjaFsxMF0pO1xuICAgIHR6TWluID0gTnVtYmVyKG1hdGNoWzldICsgbWF0Y2hbMTFdKTtcbiAgfVxuICBkYXRlU2V0dGVyLmNhbGwoZGF0ZSwgTnVtYmVyKG1hdGNoWzFdKSwgTnVtYmVyKG1hdGNoWzJdKSAtIDEsIE51bWJlcihtYXRjaFszXSkpO1xuICBjb25zdCBoID0gTnVtYmVyKG1hdGNoWzRdIHx8IDApIC0gdHpIb3VyO1xuICBjb25zdCBtID0gTnVtYmVyKG1hdGNoWzVdIHx8IDApIC0gdHpNaW47XG4gIGNvbnN0IHMgPSBOdW1iZXIobWF0Y2hbNl0gfHwgMCk7XG4gIC8vIFRoZSBFQ01BU2NyaXB0IHNwZWNpZmljYXRpb24gKGh0dHBzOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNS4xLyNzZWMtMTUuOS4xLjExKVxuICAvLyBkZWZpbmVzIHRoYXQgYERhdGVUaW1lYCBtaWxsaXNlY29uZHMgc2hvdWxkIGFsd2F5cyBiZSByb3VuZGVkIGRvd24sIHNvIHRoYXQgYDk5OS45bXNgXG4gIC8vIGJlY29tZXMgYDk5OW1zYC5cbiAgY29uc3QgbXMgPSBNYXRoLmZsb29yKHBhcnNlRmxvYXQoJzAuJyArIChtYXRjaFs3XSB8fCAwKSkgKiAxMDAwKTtcbiAgdGltZVNldHRlci5jYWxsKGRhdGUsIGgsIG0sIHMsIG1zKTtcbiAgcmV0dXJuIGRhdGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RhdGUodmFsdWU6IGFueSk6IHZhbHVlIGlzIERhdGUge1xuICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBEYXRlICYmICFpc05hTih2YWx1ZS52YWx1ZU9mKCkpO1xufVxuIl19