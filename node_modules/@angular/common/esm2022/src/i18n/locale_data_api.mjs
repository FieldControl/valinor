/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ɵfindLocaleData, ɵgetLocaleCurrencyCode, ɵgetLocalePluralCase, ɵLocaleDataIndex, } from '@angular/core';
import { CURRENCIES_EN } from './currencies';
/**
 * Format styles that can be used to represent numbers.
 * @see {@link getLocaleNumberFormat}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated `getLocaleNumberFormat` is deprecated
 */
export var NumberFormatStyle;
(function (NumberFormatStyle) {
    NumberFormatStyle[NumberFormatStyle["Decimal"] = 0] = "Decimal";
    NumberFormatStyle[NumberFormatStyle["Percent"] = 1] = "Percent";
    NumberFormatStyle[NumberFormatStyle["Currency"] = 2] = "Currency";
    NumberFormatStyle[NumberFormatStyle["Scientific"] = 3] = "Scientific";
})(NumberFormatStyle || (NumberFormatStyle = {}));
/**
 * Plurality cases used for translating plurals to different languages.
 *
 * @see {@link NgPlural}
 * @see {@link NgPluralCase}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated `getLocalePluralCase` is deprecated
 */
export var Plural;
(function (Plural) {
    Plural[Plural["Zero"] = 0] = "Zero";
    Plural[Plural["One"] = 1] = "One";
    Plural[Plural["Two"] = 2] = "Two";
    Plural[Plural["Few"] = 3] = "Few";
    Plural[Plural["Many"] = 4] = "Many";
    Plural[Plural["Other"] = 5] = "Other";
})(Plural || (Plural = {}));
/**
 * Context-dependant translation forms for strings.
 * Typically the standalone version is for the nominative form of the word,
 * and the format version is used for the genitive case.
 * @see [CLDR website](http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Standalone-vs.-Format-Styles)
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated locale data getters are deprecated
 */
export var FormStyle;
(function (FormStyle) {
    FormStyle[FormStyle["Format"] = 0] = "Format";
    FormStyle[FormStyle["Standalone"] = 1] = "Standalone";
})(FormStyle || (FormStyle = {}));
/**
 * String widths available for translations.
 * The specific character widths are locale-specific.
 * Examples are given for the word "Sunday" in English.
 *
 * @publicApi
 *
 * @deprecated locale data getters are deprecated
 */
export var TranslationWidth;
(function (TranslationWidth) {
    /** 1 character for `en-US`. For example: 'S' */
    TranslationWidth[TranslationWidth["Narrow"] = 0] = "Narrow";
    /** 3 characters for `en-US`. For example: 'Sun' */
    TranslationWidth[TranslationWidth["Abbreviated"] = 1] = "Abbreviated";
    /** Full length for `en-US`. For example: "Sunday" */
    TranslationWidth[TranslationWidth["Wide"] = 2] = "Wide";
    /** 2 characters for `en-US`, For example: "Su" */
    TranslationWidth[TranslationWidth["Short"] = 3] = "Short";
})(TranslationWidth || (TranslationWidth = {}));
/**
 * String widths available for date-time formats.
 * The specific character widths are locale-specific.
 * Examples are given for `en-US`.
 *
 * @see {@link getLocaleDateFormat}
 * @see {@link getLocaleTimeFormat}
 * @see {@link getLocaleDateTimeFormat}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 * @publicApi
 *
 * @deprecated Date locale data getters are deprecated
 */
export var FormatWidth;
(function (FormatWidth) {
    /**
     * For `en-US`, `'M/d/yy, h:mm a'`
     * (Example: `6/15/15, 9:03 AM`)
     */
    FormatWidth[FormatWidth["Short"] = 0] = "Short";
    /**
     * For `en-US`, `'MMM d, y, h:mm:ss a'`
     * (Example: `Jun 15, 2015, 9:03:01 AM`)
     */
    FormatWidth[FormatWidth["Medium"] = 1] = "Medium";
    /**
     * For `en-US`, `'MMMM d, y, h:mm:ss a z'`
     * (Example: `June 15, 2015 at 9:03:01 AM GMT+1`)
     */
    FormatWidth[FormatWidth["Long"] = 2] = "Long";
    /**
     * For `en-US`, `'EEEE, MMMM d, y, h:mm:ss a zzzz'`
     * (Example: `Monday, June 15, 2015 at 9:03:01 AM GMT+01:00`)
     */
    FormatWidth[FormatWidth["Full"] = 3] = "Full";
})(FormatWidth || (FormatWidth = {}));
// This needs to be an object literal, rather than an enum, because TypeScript 5.4+
// doesn't allow numeric keys and we have `Infinity` and `NaN`.
/**
 * Symbols that can be used to replace placeholders in number patterns.
 * Examples are based on `en-US` values.
 *
 * @see {@link getLocaleNumberSymbol}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated `getLocaleNumberSymbol` is deprecated
 *
 * @object-literal-as-enum
 */
export const NumberSymbol = {
    /**
     * Decimal separator.
     * For `en-US`, the dot character.
     * Example: 2,345`.`67
     */
    Decimal: 0,
    /**
     * Grouping separator, typically for thousands.
     * For `en-US`, the comma character.
     * Example: 2`,`345.67
     */
    Group: 1,
    /**
     * List-item separator.
     * Example: "one, two, and three"
     */
    List: 2,
    /**
     * Sign for percentage (out of 100).
     * Example: 23.4%
     */
    PercentSign: 3,
    /**
     * Sign for positive numbers.
     * Example: +23
     */
    PlusSign: 4,
    /**
     * Sign for negative numbers.
     * Example: -23
     */
    MinusSign: 5,
    /**
     * Computer notation for exponential value (n times a power of 10).
     * Example: 1.2E3
     */
    Exponential: 6,
    /**
     * Human-readable format of exponential.
     * Example: 1.2x103
     */
    SuperscriptingExponent: 7,
    /**
     * Sign for permille (out of 1000).
     * Example: 23.4‰
     */
    PerMille: 8,
    /**
     * Infinity, can be used with plus and minus.
     * Example: ∞, +∞, -∞
     */
    Infinity: 9,
    /**
     * Not a number.
     * Example: NaN
     */
    NaN: 10,
    /**
     * Symbol used between time units.
     * Example: 10:52
     */
    TimeSeparator: 11,
    /**
     * Decimal separator for currency values (fallback to `Decimal`).
     * Example: $2,345.67
     */
    CurrencyDecimal: 12,
    /**
     * Group separator for currency values (fallback to `Group`).
     * Example: $2,345.67
     */
    CurrencyGroup: 13,
};
/**
 * The value for each day of the week, based on the `en-US` locale
 *
 * @publicApi
 *
 * @deprecated Week locale getters are deprecated
 */
export var WeekDay;
(function (WeekDay) {
    WeekDay[WeekDay["Sunday"] = 0] = "Sunday";
    WeekDay[WeekDay["Monday"] = 1] = "Monday";
    WeekDay[WeekDay["Tuesday"] = 2] = "Tuesday";
    WeekDay[WeekDay["Wednesday"] = 3] = "Wednesday";
    WeekDay[WeekDay["Thursday"] = 4] = "Thursday";
    WeekDay[WeekDay["Friday"] = 5] = "Friday";
    WeekDay[WeekDay["Saturday"] = 6] = "Saturday";
})(WeekDay || (WeekDay = {}));
/**
 * Retrieves the locale ID from the currently loaded locale.
 * The loaded locale could be, for example, a global one rather than a regional one.
 * @param locale A locale code, such as `fr-FR`.
 * @returns The locale code. For example, `fr`.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * This function serves no purpose when relying on the `Intl` API.
 */
export function getLocaleId(locale) {
    return ɵfindLocaleData(locale)[ɵLocaleDataIndex.LocaleId];
}
/**
 * Retrieves day period strings for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns An array of localized period strings. For example, `[AM, PM]` for `en-US`.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
export function getLocaleDayPeriods(locale, formStyle, width) {
    const data = ɵfindLocaleData(locale);
    const amPmData = [
        data[ɵLocaleDataIndex.DayPeriodsFormat],
        data[ɵLocaleDataIndex.DayPeriodsStandalone],
    ];
    const amPm = getLastDefinedValue(amPmData, formStyle);
    return getLastDefinedValue(amPm, width);
}
/**
 * Retrieves days of the week for the given locale, using the Gregorian calendar.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns An array of localized name strings.
 * For example,`[Sunday, Monday, ... Saturday]` for `en-US`.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
export function getLocaleDayNames(locale, formStyle, width) {
    const data = ɵfindLocaleData(locale);
    const daysData = [
        data[ɵLocaleDataIndex.DaysFormat],
        data[ɵLocaleDataIndex.DaysStandalone],
    ];
    const days = getLastDefinedValue(daysData, formStyle);
    return getLastDefinedValue(days, width);
}
/**
 * Retrieves months of the year for the given locale, using the Gregorian calendar.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns An array of localized name strings.
 * For example,  `[January, February, ...]` for `en-US`.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
export function getLocaleMonthNames(locale, formStyle, width) {
    const data = ɵfindLocaleData(locale);
    const monthsData = [
        data[ɵLocaleDataIndex.MonthsFormat],
        data[ɵLocaleDataIndex.MonthsStandalone],
    ];
    const months = getLastDefinedValue(monthsData, formStyle);
    return getLastDefinedValue(months, width);
}
/**
 * Retrieves Gregorian-calendar eras for the given locale.
 * @param locale A locale code for the locale format rules to use.
 * @param width The required character width.

 * @returns An array of localized era strings.
 * For example, `[AD, BC]` for `en-US`.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
export function getLocaleEraNames(locale, width) {
    const data = ɵfindLocaleData(locale);
    const erasData = data[ɵLocaleDataIndex.Eras];
    return getLastDefinedValue(erasData, width);
}
/**
 * Retrieves the first day of the week for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns A day index number, using the 0-based week-day index for `en-US`
 * (Sunday = 0, Monday = 1, ...).
 * For example, for `fr-FR`, returns 1 to indicate that the first day is Monday.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * Intl's [`getWeekInfo`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo) has partial support (Chromium M99 & Safari 17).
 * You may want to rely on the following alternatives:
 * - Libraries like [`Luxon`](https://moment.github.io/luxon/#/) rely on `Intl` but fallback on the ISO 8601 definition (monday) if `getWeekInfo` is not supported.
 * - Other librairies like [`date-fns`](https://date-fns.org/), [`day.js`](https://day.js.org/en/) or [`weekstart`](https://www.npmjs.com/package/weekstart) library provide their own locale based data for the first day of the week.
 */
export function getLocaleFirstDayOfWeek(locale) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.FirstDayOfWeek];
}
/**
 * Range of week days that are considered the week-end for the given locale.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The range of day values, `[startDay, endDay]`.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * Intl's [`getWeekInfo`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo) has partial support (Chromium M99 & Safari 17).
 * Libraries like [`Luxon`](https://moment.github.io/luxon/#/) rely on `Intl` but fallback on the ISO 8601 definition (Saturday+Sunday) if `getWeekInfo` is not supported .
 */
export function getLocaleWeekEndRange(locale) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.WeekendRange];
}
/**
 * Retrieves a localized date-value formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see {@link FormatWidth}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
export function getLocaleDateFormat(locale, width) {
    const data = ɵfindLocaleData(locale);
    return getLastDefinedValue(data[ɵLocaleDataIndex.DateFormat], width);
}
/**
 * Retrieves a localized time-value formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see {@link FormatWidth}
 * @see [Internationalization (i18n) Guide](guide/i18n)

 * @publicApi
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
export function getLocaleTimeFormat(locale, width) {
    const data = ɵfindLocaleData(locale);
    return getLastDefinedValue(data[ɵLocaleDataIndex.TimeFormat], width);
}
/**
 * Retrieves a localized date-time formatting string.
 *
 * @param locale A locale code for the locale format rules to use.
 * @param width The format type.
 * @returns The localized formatting string.
 * @see {@link FormatWidth}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.DateTimeFormat` for date formating instead.
 */
export function getLocaleDateTimeFormat(locale, width) {
    const data = ɵfindLocaleData(locale);
    const dateTimeFormatData = data[ɵLocaleDataIndex.DateTimeFormat];
    return getLastDefinedValue(dateTimeFormatData, width);
}
/**
 * Retrieves a localized number symbol that can be used to replace placeholders in number formats.
 * @param locale The locale code.
 * @param symbol The symbol to localize. Must be one of `NumberSymbol`.
 * @returns The character for the localized symbol.
 * @see {@link NumberSymbol}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.NumberFormat` to format numbers instead.
 */
export function getLocaleNumberSymbol(locale, symbol) {
    const data = ɵfindLocaleData(locale);
    const res = data[ɵLocaleDataIndex.NumberSymbols][symbol];
    if (typeof res === 'undefined') {
        if (symbol === NumberSymbol.CurrencyDecimal) {
            return data[ɵLocaleDataIndex.NumberSymbols][NumberSymbol.Decimal];
        }
        else if (symbol === NumberSymbol.CurrencyGroup) {
            return data[ɵLocaleDataIndex.NumberSymbols][NumberSymbol.Group];
        }
    }
    return res;
}
/**
 * Retrieves a number format for a given locale.
 *
 * Numbers are formatted using patterns, like `#,###.00`. For example, the pattern `#,###.00`
 * when used to format the number 12345.678 could result in "12'345,678". That would happen if the
 * grouping separator for your language is an apostrophe, and the decimal separator is a comma.
 *
 * <b>Important:</b> The characters `.` `,` `0` `#` (and others below) are special placeholders
 * that stand for the decimal separator, and so on, and are NOT real characters.
 * You must NOT "translate" the placeholders. For example, don't change `.` to `,` even though in
 * your language the decimal point is written with a comma. The symbols should be replaced by the
 * local equivalents, using the appropriate `NumberSymbol` for your language.
 *
 * Here are the special characters used in number patterns:
 *
 * | Symbol | Meaning |
 * |--------|---------|
 * | . | Replaced automatically by the character used for the decimal point. |
 * | , | Replaced by the "grouping" (thousands) separator. |
 * | 0 | Replaced by a digit (or zero if there aren't enough digits). |
 * | # | Replaced by a digit (or nothing if there aren't enough). |
 * | ¤ | Replaced by a currency symbol, such as $ or USD. |
 * | % | Marks a percent format. The % symbol may change position, but must be retained. |
 * | E | Marks a scientific format. The E symbol may change position, but must be retained. |
 * | ' | Special characters used as literal characters are quoted with ASCII single quotes. |
 *
 * @param locale A locale code for the locale format rules to use.
 * @param type The type of numeric value to be formatted (such as `Decimal` or `Currency`.)
 * @returns The localized format string.
 * @see {@link NumberFormatStyle}
 * @see [CLDR website](http://cldr.unicode.org/translation/number-patterns)
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * Let `Intl.NumberFormat` determine the number format instead
 */
export function getLocaleNumberFormat(locale, type) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.NumberFormats][type];
}
/**
 * Retrieves the symbol used to represent the currency for the main country
 * corresponding to a given locale. For example, '$' for `en-US`.
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The localized symbol character,
 * or `null` if the main country cannot be determined.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Use the `Intl` API to format a currency with from currency code
 */
export function getLocaleCurrencySymbol(locale) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.CurrencySymbol] || null;
}
/**
 * Retrieves the name of the currency for the main country corresponding
 * to a given locale. For example, 'US Dollar' for `en-US`.
 * @param locale A locale code for the locale format rules to use.
 * @returns The currency name,
 * or `null` if the main country cannot be determined.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Use the `Intl` API to format a currency with from currency code
 */
export function getLocaleCurrencyName(locale) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.CurrencyName] || null;
}
/**
 * Retrieves the default currency code for the given locale.
 *
 * The default is defined as the first currency which is still in use.
 *
 * @param locale The code of the locale whose currency code we want.
 * @returns The code of the default currency for the given locale.
 *
 * @publicApi
 *
 * @deprecated We recommend you create a map of locale to ISO 4217 currency codes.
 * Time relative currency data is provided by the CLDR project. See https://www.unicode.org/cldr/charts/44/supplemental/detailed_territory_currency_information.html
 */
export function getLocaleCurrencyCode(locale) {
    return ɵgetLocaleCurrencyCode(locale);
}
/**
 * Retrieves the currency values for a given locale.
 * @param locale A locale code for the locale format rules to use.
 * @returns The currency values.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 */
function getLocaleCurrencies(locale) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.Currencies];
}
/**
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * Use `Intl.PluralRules` instead
 */
export const getLocalePluralCase = ɵgetLocalePluralCase;
function checkFullData(data) {
    if (!data[ɵLocaleDataIndex.ExtraData]) {
        throw new Error(`Missing extra locale data for the locale "${data[ɵLocaleDataIndex.LocaleId]}". Use "registerLocaleData" to load new data. See the "I18n guide" on angular.io to know more.`);
    }
}
/**
 * Retrieves locale-specific rules used to determine which day period to use
 * when more than one period is defined for a locale.
 *
 * There is a rule for each defined day period. The
 * first rule is applied to the first day period and so on.
 * Fall back to AM/PM when no rules are available.
 *
 * A rule can specify a period as time range, or as a single time value.
 *
 * This functionality is only available when you have loaded the full locale data.
 * See the ["I18n guide"](guide/i18n/format-data-locale).
 *
 * @param locale A locale code for the locale format rules to use.
 * @returns The rules for the locale, a single time value or array of *from-time, to-time*,
 * or null if no periods are available.
 *
 * @see {@link getLocaleExtraDayPeriods}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * Let `Intl.DateTimeFormat` determine the day period instead.
 */
export function getLocaleExtraDayPeriodRules(locale) {
    const data = ɵfindLocaleData(locale);
    checkFullData(data);
    const rules = data[ɵLocaleDataIndex.ExtraData][2 /* ɵExtraLocaleDataIndex.ExtraDayPeriodsRules */] || [];
    return rules.map((rule) => {
        if (typeof rule === 'string') {
            return extractTime(rule);
        }
        return [extractTime(rule[0]), extractTime(rule[1])];
    });
}
/**
 * Retrieves locale-specific day periods, which indicate roughly how a day is broken up
 * in different languages.
 * For example, for `en-US`, periods are morning, noon, afternoon, evening, and midnight.
 *
 * This functionality is only available when you have loaded the full locale data.
 * See the ["I18n guide"](guide/i18n/format-data-locale).
 *
 * @param locale A locale code for the locale format rules to use.
 * @param formStyle The required grammatical form.
 * @param width The required character width.
 * @returns The translated day-period strings.
 * @see {@link getLocaleExtraDayPeriodRules}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * To extract a day period use `Intl.DateTimeFormat` with the `dayPeriod` option instead.
 */
export function getLocaleExtraDayPeriods(locale, formStyle, width) {
    const data = ɵfindLocaleData(locale);
    checkFullData(data);
    const dayPeriodsData = [
        data[ɵLocaleDataIndex.ExtraData][0 /* ɵExtraLocaleDataIndex.ExtraDayPeriodFormats */],
        data[ɵLocaleDataIndex.ExtraData][1 /* ɵExtraLocaleDataIndex.ExtraDayPeriodStandalone */],
    ];
    const dayPeriods = getLastDefinedValue(dayPeriodsData, formStyle) || [];
    return getLastDefinedValue(dayPeriods, width) || [];
}
/**
 * Retrieves the writing direction of a specified locale
 * @param locale A locale code for the locale format rules to use.
 * @publicApi
 * @returns 'rtl' or 'ltr'
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * For dates and numbers, let `Intl.DateTimeFormat()` and `Intl.NumberFormat()` determine the writing direction.
 * The `Intl` alternative [`getTextInfo`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getTextInfo).
 * has only partial support (Chromium M99 & Safari 17).
 * 3rd party alternatives like [`rtl-detect`](https://www.npmjs.com/package/rtl-detect) can work around this issue.
 */
export function getLocaleDirection(locale) {
    const data = ɵfindLocaleData(locale);
    return data[ɵLocaleDataIndex.Directionality];
}
/**
 * Retrieves the first value that is defined in an array, going backwards from an index position.
 *
 * To avoid repeating the same data (as when the "format" and "standalone" forms are the same)
 * add the first value to the locale data arrays, and add other values only if they are different.
 *
 * @param data The data array to retrieve from.
 * @param index A 0-based index into the array to start from.
 * @returns The value immediately before the given index position.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 */
function getLastDefinedValue(data, index) {
    for (let i = index; i > -1; i--) {
        if (typeof data[i] !== 'undefined') {
            return data[i];
        }
    }
    throw new Error('Locale data API: locale data undefined');
}
/**
 * Extracts the hours and minutes from a string like "15:45"
 */
function extractTime(time) {
    const [h, m] = time.split(':');
    return { hours: +h, minutes: +m };
}
/**
 * Retrieves the currency symbol for a given currency code.
 *
 * For example, for the default `en-US` locale, the code `USD` can
 * be represented by the narrow symbol `$` or the wide symbol `US$`.
 *
 * @param code The currency code.
 * @param format The format, `wide` or `narrow`.
 * @param locale A locale code for the locale format rules to use.
 *
 * @returns The symbol, or the currency code if no symbol is available.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * You can use `Intl.NumberFormat().formatToParts()` to extract the currency symbol.
 * For example: `Intl.NumberFormat('en', {style:'currency', currency: 'USD'}).formatToParts().find(part => part.type === 'currency').value`
 * returns `$` for USD currency code in the `en` locale.
 * Note: `US$` is a currency symbol for the `en-ca` locale but not the `en-us` locale.
 */
export function getCurrencySymbol(code, format, locale = 'en') {
    const currency = getLocaleCurrencies(locale)[code] || CURRENCIES_EN[code] || [];
    const symbolNarrow = currency[1 /* ɵCurrencyIndex.SymbolNarrow */];
    if (format === 'narrow' && typeof symbolNarrow === 'string') {
        return symbolNarrow;
    }
    return currency[0 /* ɵCurrencyIndex.Symbol */] || code;
}
// Most currencies have cents, that's why the default is 2
const DEFAULT_NB_OF_CURRENCY_DIGITS = 2;
/**
 * Reports the number of decimal digits for a given currency.
 * The value depends upon the presence of cents in that particular currency.
 *
 * @param code The currency code.
 * @returns The number of decimal digits, typically 0 or 2.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 *
 * @publicApi
 *
 * @deprecated Angular recommends relying on the `Intl` API for i18n.
 * This function should not be used anymore. Let `Intl.NumberFormat` determine the number of digits to display for the currency
 */
export function getNumberOfCurrencyDigits(code) {
    let digits;
    const currency = CURRENCIES_EN[code];
    if (currency) {
        digits = currency[2 /* ɵCurrencyIndex.NbOfDigits */];
    }
    return typeof digits === 'number' ? digits : DEFAULT_NB_OF_CURRENCY_DIGITS;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxlX2RhdGFfYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsZV9kYXRhX2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBR0wsZUFBZSxFQUNmLHNCQUFzQixFQUN0QixvQkFBb0IsRUFDcEIsZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBQyxhQUFhLEVBQW9CLE1BQU0sY0FBYyxDQUFDO0FBRTlEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxDQUFOLElBQVksaUJBS1g7QUFMRCxXQUFZLGlCQUFpQjtJQUMzQiwrREFBTyxDQUFBO0lBQ1AsK0RBQU8sQ0FBQTtJQUNQLGlFQUFRLENBQUE7SUFDUixxRUFBVSxDQUFBO0FBQ1osQ0FBQyxFQUxXLGlCQUFpQixLQUFqQixpQkFBaUIsUUFLNUI7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxDQUFOLElBQVksTUFPWDtBQVBELFdBQVksTUFBTTtJQUNoQixtQ0FBUSxDQUFBO0lBQ1IsaUNBQU8sQ0FBQTtJQUNQLGlDQUFPLENBQUE7SUFDUCxpQ0FBTyxDQUFBO0lBQ1AsbUNBQVEsQ0FBQTtJQUNSLHFDQUFTLENBQUE7QUFDWCxDQUFDLEVBUFcsTUFBTSxLQUFOLE1BQU0sUUFPakI7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxDQUFOLElBQVksU0FHWDtBQUhELFdBQVksU0FBUztJQUNuQiw2Q0FBTSxDQUFBO0lBQ04scURBQVUsQ0FBQTtBQUNaLENBQUMsRUFIVyxTQUFTLEtBQVQsU0FBUyxRQUdwQjtBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxDQUFOLElBQVksZ0JBU1g7QUFURCxXQUFZLGdCQUFnQjtJQUMxQixnREFBZ0Q7SUFDaEQsMkRBQU0sQ0FBQTtJQUNOLG1EQUFtRDtJQUNuRCxxRUFBVyxDQUFB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QUMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDO0FBQzdFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIMm1Q3VycmVuY3lJbmRleCxcbiAgybVFeHRyYUxvY2FsZURhdGFJbmRleCxcbiAgybVmaW5kTG9jYWxlRGF0YSxcbiAgybVnZXRMb2NhbGVDdXJyZW5jeUNvZGUsXG4gIMm1Z2V0TG9jYWxlUGx1cmFsQ2FzZSxcbiAgybVMb2NhbGVEYXRhSW5kZXgsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0NVUlJFTkNJRVNfRU4sIEN1cnJlbmNpZXNTeW1ib2xzfSBmcm9tICcuL2N1cnJlbmNpZXMnO1xuXG4vKipcbiAqIEZvcm1hdCBzdHlsZXMgdGhhdCBjYW4gYmUgdXNlZCB0byByZXByZXNlbnQgbnVtYmVycy5cbiAqIEBzZWUge0BsaW5rIGdldExvY2FsZU51bWJlckZvcm1hdH1cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQGRlcHJlY2F0ZWQgYGdldExvY2FsZU51bWJlckZvcm1hdGAgaXMgZGVwcmVjYXRlZFxuICovXG5leHBvcnQgZW51bSBOdW1iZXJGb3JtYXRTdHlsZSB7XG4gIERlY2ltYWwsXG4gIFBlcmNlbnQsXG4gIEN1cnJlbmN5LFxuICBTY2llbnRpZmljLFxufVxuXG4vKipcbiAqIFBsdXJhbGl0eSBjYXNlcyB1c2VkIGZvciB0cmFuc2xhdGluZyBwbHVyYWxzIHRvIGRpZmZlcmVudCBsYW5ndWFnZXMuXG4gKlxuICogQHNlZSB7QGxpbmsgTmdQbHVyYWx9XG4gKiBAc2VlIHtAbGluayBOZ1BsdXJhbENhc2V9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkIGBnZXRMb2NhbGVQbHVyYWxDYXNlYCBpcyBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBlbnVtIFBsdXJhbCB7XG4gIFplcm8gPSAwLFxuICBPbmUgPSAxLFxuICBUd28gPSAyLFxuICBGZXcgPSAzLFxuICBNYW55ID0gNCxcbiAgT3RoZXIgPSA1LFxufVxuXG4vKipcbiAqIENvbnRleHQtZGVwZW5kYW50IHRyYW5zbGF0aW9uIGZvcm1zIGZvciBzdHJpbmdzLlxuICogVHlwaWNhbGx5IHRoZSBzdGFuZGFsb25lIHZlcnNpb24gaXMgZm9yIHRoZSBub21pbmF0aXZlIGZvcm0gb2YgdGhlIHdvcmQsXG4gKiBhbmQgdGhlIGZvcm1hdCB2ZXJzaW9uIGlzIHVzZWQgZm9yIHRoZSBnZW5pdGl2ZSBjYXNlLlxuICogQHNlZSBbQ0xEUiB3ZWJzaXRlXShodHRwOi8vY2xkci51bmljb2RlLm9yZy90cmFuc2xhdGlvbi9kYXRlLXRpbWUtMS9kYXRlLXRpbWUjVE9DLVN0YW5kYWxvbmUtdnMuLUZvcm1hdC1TdHlsZXMpXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkIGxvY2FsZSBkYXRhIGdldHRlcnMgYXJlIGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGVudW0gRm9ybVN0eWxlIHtcbiAgRm9ybWF0LFxuICBTdGFuZGFsb25lLFxufVxuXG4vKipcbiAqIFN0cmluZyB3aWR0aHMgYXZhaWxhYmxlIGZvciB0cmFuc2xhdGlvbnMuXG4gKiBUaGUgc3BlY2lmaWMgY2hhcmFjdGVyIHdpZHRocyBhcmUgbG9jYWxlLXNwZWNpZmljLlxuICogRXhhbXBsZXMgYXJlIGdpdmVuIGZvciB0aGUgd29yZCBcIlN1bmRheVwiIGluIEVuZ2xpc2guXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkIGxvY2FsZSBkYXRhIGdldHRlcnMgYXJlIGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGVudW0gVHJhbnNsYXRpb25XaWR0aCB7XG4gIC8qKiAxIGNoYXJhY3RlciBmb3IgYGVuLVVTYC4gRm9yIGV4YW1wbGU6ICdTJyAqL1xuICBOYXJyb3csXG4gIC8qKiAzIGNoYXJhY3RlcnMgZm9yIGBlbi1VU2AuIEZvciBleGFtcGxlOiAnU3VuJyAqL1xuICBBYmJyZXZpYXRlZCxcbiAgLyoqIEZ1bGwgbGVuZ3RoIGZvciBgZW4tVVNgLiBGb3IgZXhhbXBsZTogXCJTdW5kYXlcIiAqL1xuICBXaWRlLFxuICAvKiogMiBjaGFyYWN0ZXJzIGZvciBgZW4tVVNgLCBGb3IgZXhhbXBsZTogXCJTdVwiICovXG4gIFNob3J0LFxufVxuXG4vKipcbiAqIFN0cmluZyB3aWR0aHMgYXZhaWxhYmxlIGZvciBkYXRlLXRpbWUgZm9ybWF0cy5cbiAqIFRoZSBzcGVjaWZpYyBjaGFyYWN0ZXIgd2lkdGhzIGFyZSBsb2NhbGUtc3BlY2lmaWMuXG4gKiBFeGFtcGxlcyBhcmUgZ2l2ZW4gZm9yIGBlbi1VU2AuXG4gKlxuICogQHNlZSB7QGxpbmsgZ2V0TG9jYWxlRGF0ZUZvcm1hdH1cbiAqIEBzZWUge0BsaW5rIGdldExvY2FsZVRpbWVGb3JtYXR9XG4gKiBAc2VlIHtAbGluayBnZXRMb2NhbGVEYXRlVGltZUZvcm1hdH1cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAZGVwcmVjYXRlZCBEYXRlIGxvY2FsZSBkYXRhIGdldHRlcnMgYXJlIGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGVudW0gRm9ybWF0V2lkdGgge1xuICAvKipcbiAgICogRm9yIGBlbi1VU2AsIGAnTS9kL3l5LCBoOm1tIGEnYFxuICAgKiAoRXhhbXBsZTogYDYvMTUvMTUsIDk6MDMgQU1gKVxuICAgKi9cbiAgU2hvcnQsXG4gIC8qKlxuICAgKiBGb3IgYGVuLVVTYCwgYCdNTU0gZCwgeSwgaDptbTpzcyBhJ2BcbiAgICogKEV4YW1wbGU6IGBKdW4gMTUsIDIwMTUsIDk6MDM6MDEgQU1gKVxuICAgKi9cbiAgTWVkaXVtLFxuICAvKipcbiAgICogRm9yIGBlbi1VU2AsIGAnTU1NTSBkLCB5LCBoOm1tOnNzIGEgeidgXG4gICAqIChFeGFtcGxlOiBgSnVuZSAxNSwgMjAxNSBhdCA5OjAzOjAxIEFNIEdNVCsxYClcbiAgICovXG4gIExvbmcsXG4gIC8qKlxuICAgKiBGb3IgYGVuLVVTYCwgYCdFRUVFLCBNTU1NIGQsIHksIGg6bW06c3MgYSB6enp6J2BcbiAgICogKEV4YW1wbGU6IGBNb25kYXksIEp1bmUgMTUsIDIwMTUgYXQgOTowMzowMSBBTSBHTVQrMDE6MDBgKVxuICAgKi9cbiAgRnVsbCxcbn1cblxuLy8gVGhpcyBuZWVkcyB0byBiZSBhbiBvYmplY3QgbGl0ZXJhbCwgcmF0aGVyIHRoYW4gYW4gZW51bSwgYmVjYXVzZSBUeXBlU2NyaXB0IDUuNCtcbi8vIGRvZXNuJ3QgYWxsb3cgbnVtZXJpYyBrZXlzIGFuZCB3ZSBoYXZlIGBJbmZpbml0eWAgYW5kIGBOYU5gLlxuLyoqXG4gKiBTeW1ib2xzIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVwbGFjZSBwbGFjZWhvbGRlcnMgaW4gbnVtYmVyIHBhdHRlcm5zLlxuICogRXhhbXBsZXMgYXJlIGJhc2VkIG9uIGBlbi1VU2AgdmFsdWVzLlxuICpcbiAqIEBzZWUge0BsaW5rIGdldExvY2FsZU51bWJlclN5bWJvbH1cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQGRlcHJlY2F0ZWQgYGdldExvY2FsZU51bWJlclN5bWJvbGAgaXMgZGVwcmVjYXRlZFxuICpcbiAqIEBvYmplY3QtbGl0ZXJhbC1hcy1lbnVtXG4gKi9cbmV4cG9ydCBjb25zdCBOdW1iZXJTeW1ib2wgPSB7XG4gIC8qKlxuICAgKiBEZWNpbWFsIHNlcGFyYXRvci5cbiAgICogRm9yIGBlbi1VU2AsIHRoZSBkb3QgY2hhcmFjdGVyLlxuICAgKiBFeGFtcGxlOiAyLDM0NWAuYDY3XG4gICAqL1xuICBEZWNpbWFsOiAwLFxuICAvKipcbiAgICogR3JvdXBpbmcgc2VwYXJhdG9yLCB0eXBpY2FsbHkgZm9yIHRob3VzYW5kcy5cbiAgICogRm9yIGBlbi1VU2AsIHRoZSBjb21tYSBjaGFyYWN0ZXIuXG4gICAqIEV4YW1wbGU6IDJgLGAzNDUuNjdcbiAgICovXG4gIEdyb3VwOiAxLFxuICAvKipcbiAgICogTGlzdC1pdGVtIHNlcGFyYXRvci5cbiAgICogRXhhbXBsZTogXCJvbmUsIHR3bywgYW5kIHRocmVlXCJcbiAgICovXG4gIExpc3Q6IDIsXG4gIC8qKlxuICAgKiBTaWduIGZvciBwZXJjZW50YWdlIChvdXQgb2YgMTAwKS5cbiAgICogRXhhbXBsZTogMjMuNCVcbiAgICovXG4gIFBlcmNlbnRTaWduOiAzLFxuICAvKipcbiAgICogU2lnbiBmb3IgcG9zaXRpdmUgbnVtYmVycy5cbiAgICogRXhhbXBsZTogKzIzXG4gICAqL1xuICBQbHVzU2lnbjogNCxcbiAgLyoqXG4gICAqIFNpZ24gZm9yIG5lZ2F0aXZlIG51bWJlcnMuXG4gICAqIEV4YW1wbGU6IC0yM1xuICAgKi9cbiAgTWludXNTaWduOiA1LFxuICAvKipcbiAgICogQ29tcHV0ZXIgbm90YXRpb24gZm9yIGV4cG9uZW50aWFsIHZhbHVlIChuIHRpbWVzIGEgcG93ZXIgb2YgMTApLlxuICAgKiBFeGFtcGxlOiAxLjJFM1xuICAgKi9cbiAgRXhwb25lbnRpYWw6IDYsXG4gIC8qKlxuICAgKiBIdW1hbi1yZWFkYWJsZSBmb3JtYXQgb2YgZXhwb25lbnRpYWwuXG4gICAqIEV4YW1wbGU6IDEuMngxMDNcbiAgICovXG4gIFN1cGVyc2NyaXB0aW5nRXhwb25lbnQ6IDcsXG4gIC8qKlxuICAgKiBTaWduIGZvciBwZXJtaWxsZSAob3V0IG9mIDEwMDApLlxuICAgKiBFeGFtcGxlOiAyMy404oCwXG4gICAqL1xuICBQZXJNaWxsZTogOCxcbiAgLyoqXG4gICAqIEluZmluaXR5LCBjYW4gYmUgdXNlZCB3aXRoIHBsdXMgYW5kIG1pbnVzLlxuICAgKiBFeGFtcGxlOiDiiJ4sICviiJ4sIC3iiJ5cbiAgICovXG4gIEluZmluaXR5OiA5LFxuICAvKipcbiAgICogTm90IGEgbnVtYmVyLlxuICAgKiBFeGFtcGxlOiBOYU5cbiAgICovXG4gIE5hTjogMTAsXG4gIC8qKlxuICAgKiBTeW1ib2wgdXNlZCBiZXR3ZWVuIHRpbWUgdW5pdHMuXG4gICAqIEV4YW1wbGU6IDEwOjUyXG4gICAqL1xuICBUaW1lU2VwYXJhdG9yOiAxMSxcbiAgLyoqXG4gICAqIERlY2ltYWwgc2VwYXJhdG9yIGZvciBjdXJyZW5jeSB2YWx1ZXMgKGZhbGxiYWNrIHRvIGBEZWNpbWFsYCkuXG4gICAqIEV4YW1wbGU6ICQyLDM0NS42N1xuICAgKi9cbiAgQ3VycmVuY3lEZWNpbWFsOiAxMixcbiAgLyoqXG4gICAqIEdyb3VwIHNlcGFyYXRvciBmb3IgY3VycmVuY3kgdmFsdWVzIChmYWxsYmFjayB0byBgR3JvdXBgKS5cbiAgICogRXhhbXBsZTogJDIsMzQ1LjY3XG4gICAqL1xuICBDdXJyZW5jeUdyb3VwOiAxMyxcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIE51bWJlclN5bWJvbCA9ICh0eXBlb2YgTnVtYmVyU3ltYm9sKVtrZXlvZiB0eXBlb2YgTnVtYmVyU3ltYm9sXTtcblxuLyoqXG4gKiBUaGUgdmFsdWUgZm9yIGVhY2ggZGF5IG9mIHRoZSB3ZWVrLCBiYXNlZCBvbiB0aGUgYGVuLVVTYCBsb2NhbGVcbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQGRlcHJlY2F0ZWQgV2VlayBsb2NhbGUgZ2V0dGVycyBhcmUgZGVwcmVjYXRlZFxuICovXG5leHBvcnQgZW51bSBXZWVrRGF5IHtcbiAgU3VuZGF5ID0gMCxcbiAgTW9uZGF5LFxuICBUdWVzZGF5LFxuICBXZWRuZXNkYXksXG4gIFRodXJzZGF5LFxuICBGcmlkYXksXG4gIFNhdHVyZGF5LFxufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgbG9jYWxlIElEIGZyb20gdGhlIGN1cnJlbnRseSBsb2FkZWQgbG9jYWxlLlxuICogVGhlIGxvYWRlZCBsb2NhbGUgY291bGQgYmUsIGZvciBleGFtcGxlLCBhIGdsb2JhbCBvbmUgcmF0aGVyIHRoYW4gYSByZWdpb25hbCBvbmUuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUsIHN1Y2ggYXMgYGZyLUZSYC5cbiAqIEByZXR1cm5zIFRoZSBsb2NhbGUgY29kZS4gRm9yIGV4YW1wbGUsIGBmcmAuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkIEFuZ3VsYXIgcmVjb21tZW5kcyByZWx5aW5nIG9uIHRoZSBgSW50bGAgQVBJIGZvciBpMThuLlxuICogVGhpcyBmdW5jdGlvbiBzZXJ2ZXMgbm8gcHVycG9zZSB3aGVuIHJlbHlpbmcgb24gdGhlIGBJbnRsYCBBUEkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVJZChsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSlbybVMb2NhbGVEYXRhSW5kZXguTG9jYWxlSWRdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBkYXkgcGVyaW9kIHN0cmluZ3MgZm9yIHRoZSBnaXZlbiBsb2NhbGUuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcGFyYW0gZm9ybVN0eWxlIFRoZSByZXF1aXJlZCBncmFtbWF0aWNhbCBmb3JtLlxuICogQHBhcmFtIHdpZHRoIFRoZSByZXF1aXJlZCBjaGFyYWN0ZXIgd2lkdGguXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBsb2NhbGl6ZWQgcGVyaW9kIHN0cmluZ3MuIEZvciBleGFtcGxlLCBgW0FNLCBQTV1gIGZvciBgZW4tVVNgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAZGVwcmVjYXRlZCBBbmd1bGFyIHJlY29tbWVuZHMgcmVseWluZyBvbiB0aGUgYEludGxgIEFQSSBmb3IgaTE4bi5cbiAqIFVzZSBgSW50bC5EYXRlVGltZUZvcm1hdGAgZm9yIGRhdGUgZm9ybWF0aW5nIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVEYXlQZXJpb2RzKFxuICBsb2NhbGU6IHN0cmluZyxcbiAgZm9ybVN0eWxlOiBGb3JtU3R5bGUsXG4gIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoLFxuKTogUmVhZG9ubHk8W3N0cmluZywgc3RyaW5nXT4ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBhbVBtRGF0YSA9IDxbc3RyaW5nLCBzdHJpbmddW11bXT5bXG4gICAgZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EYXlQZXJpb2RzRm9ybWF0XSxcbiAgICBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkRheVBlcmlvZHNTdGFuZGFsb25lXSxcbiAgXTtcbiAgY29uc3QgYW1QbSA9IGdldExhc3REZWZpbmVkVmFsdWUoYW1QbURhdGEsIGZvcm1TdHlsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGFtUG0sIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgZGF5cyBvZiB0aGUgd2VlayBmb3IgdGhlIGdpdmVuIGxvY2FsZSwgdXNpbmcgdGhlIEdyZWdvcmlhbiBjYWxlbmRhci5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSBmb3JtU3R5bGUgVGhlIHJlcXVpcmVkIGdyYW1tYXRpY2FsIGZvcm0uXG4gKiBAcGFyYW0gd2lkdGggVGhlIHJlcXVpcmVkIGNoYXJhY3RlciB3aWR0aC5cbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGxvY2FsaXplZCBuYW1lIHN0cmluZ3MuXG4gKiBGb3IgZXhhbXBsZSxgW1N1bmRheSwgTW9uZGF5LCAuLi4gU2F0dXJkYXldYCBmb3IgYGVuLVVTYC5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQGRlcHJlY2F0ZWQgQW5ndWxhciByZWNvbW1lbmRzIHJlbHlpbmcgb24gdGhlIGBJbnRsYCBBUEkgZm9yIGkxOG4uXG4gKiBVc2UgYEludGwuRGF0ZVRpbWVGb3JtYXRgIGZvciBkYXRlIGZvcm1hdGluZyBpbnN0ZWFkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRGF5TmFtZXMoXG4gIGxvY2FsZTogc3RyaW5nLFxuICBmb3JtU3R5bGU6IEZvcm1TdHlsZSxcbiAgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgsXG4pOiBSZWFkb25seUFycmF5PHN0cmluZz4ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBkYXlzRGF0YSA9IDxzdHJpbmdbXVtdW10+W1xuICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF5c0Zvcm1hdF0sXG4gICAgZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EYXlzU3RhbmRhbG9uZV0sXG4gIF07XG4gIGNvbnN0IGRheXMgPSBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheXNEYXRhLCBmb3JtU3R5bGUpO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXlzLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIG1vbnRocyBvZiB0aGUgeWVhciBmb3IgdGhlIGdpdmVuIGxvY2FsZSwgdXNpbmcgdGhlIEdyZWdvcmlhbiBjYWxlbmRhci5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSBmb3JtU3R5bGUgVGhlIHJlcXVpcmVkIGdyYW1tYXRpY2FsIGZvcm0uXG4gKiBAcGFyYW0gd2lkdGggVGhlIHJlcXVpcmVkIGNoYXJhY3RlciB3aWR0aC5cbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGxvY2FsaXplZCBuYW1lIHN0cmluZ3MuXG4gKiBGb3IgZXhhbXBsZSwgIGBbSmFudWFyeSwgRmVicnVhcnksIC4uLl1gIGZvciBgZW4tVVNgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAZGVwcmVjYXRlZCBBbmd1bGFyIHJlY29tbWVuZHMgcmVseWluZyBvbiB0aGUgYEludGxgIEFQSSBmb3IgaTE4bi5cbiAqIFVzZSBgSW50bC5EYXRlVGltZUZvcm1hdGAgZm9yIGRhdGUgZm9ybWF0aW5nIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVNb250aE5hbWVzKFxuICBsb2NhbGU6IHN0cmluZyxcbiAgZm9ybVN0eWxlOiBGb3JtU3R5bGUsXG4gIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoLFxuKTogUmVhZG9ubHlBcnJheTxzdHJpbmc+IHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgbW9udGhzRGF0YSA9IDxzdHJpbmdbXVtdW10+W1xuICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguTW9udGhzRm9ybWF0XSxcbiAgICBkYXRhW8m1TG9jYWxlRGF0YUluZGV4Lk1vbnRoc1N0YW5kYWxvbmVdLFxuICBdO1xuICBjb25zdCBtb250aHMgPSBnZXRMYXN0RGVmaW5lZFZhbHVlKG1vbnRoc0RhdGEsIGZvcm1TdHlsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKG1vbnRocywgd2lkdGgpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBHcmVnb3JpYW4tY2FsZW5kYXIgZXJhcyBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIHdpZHRoIFRoZSByZXF1aXJlZCBjaGFyYWN0ZXIgd2lkdGguXG5cbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGxvY2FsaXplZCBlcmEgc3RyaW5ncy5cbiAqIEZvciBleGFtcGxlLCBgW0FELCBCQ11gIGZvciBgZW4tVVNgLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAZGVwcmVjYXRlZCBBbmd1bGFyIHJlY29tbWVuZHMgcmVseWluZyBvbiB0aGUgYEludGxgIEFQSSBmb3IgaTE4bi5cbiAqIFVzZSBgSW50bC5EYXRlVGltZUZvcm1hdGAgZm9yIGRhdGUgZm9ybWF0aW5nIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVFcmFOYW1lcyhcbiAgbG9jYWxlOiBzdHJpbmcsXG4gIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoLFxuKTogUmVhZG9ubHk8W3N0cmluZywgc3RyaW5nXT4ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICBjb25zdCBlcmFzRGF0YSA9IDxbc3RyaW5nLCBzdHJpbmddW10+ZGF0YVvJtUxvY2FsZURhdGFJbmRleC5FcmFzXTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZXJhc0RhdGEsIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGZpcnN0IGRheSBvZiB0aGUgd2VlayBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEByZXR1cm5zIEEgZGF5IGluZGV4IG51bWJlciwgdXNpbmcgdGhlIDAtYmFzZWQgd2Vlay1kYXkgaW5kZXggZm9yIGBlbi1VU2BcbiAqIChTdW5kYXkgPSAwLCBNb25kYXkgPSAxLCAuLi4pLlxuICogRm9yIGV4YW1wbGUsIGZvciBgZnItRlJgLCByZXR1cm5zIDEgdG8gaW5kaWNhdGUgdGhhdCB0aGUgZmlyc3QgZGF5IGlzIE1vbmRheS5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQGRlcHJlY2F0ZWQgQW5ndWxhciByZWNvbW1lbmRzIHJlbHlpbmcgb24gdGhlIGBJbnRsYCBBUEkgZm9yIGkxOG4uXG4gKiBJbnRsJ3MgW2BnZXRXZWVrSW5mb2BdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0ludGwvTG9jYWxlL2dldFdlZWtJbmZvKSBoYXMgcGFydGlhbCBzdXBwb3J0IChDaHJvbWl1bSBNOTkgJiBTYWZhcmkgMTcpLlxuICogWW91IG1heSB3YW50IHRvIHJlbHkgb24gdGhlIGZvbGxvd2luZyBhbHRlcm5hdGl2ZXM6XG4gKiAtIExpYnJhcmllcyBsaWtlIFtgTHV4b25gXShodHRwczovL21vbWVudC5naXRodWIuaW8vbHV4b24vIy8pIHJlbHkgb24gYEludGxgIGJ1dCBmYWxsYmFjayBvbiB0aGUgSVNPIDg2MDEgZGVmaW5pdGlvbiAobW9uZGF5KSBpZiBgZ2V0V2Vla0luZm9gIGlzIG5vdCBzdXBwb3J0ZWQuXG4gKiAtIE90aGVyIGxpYnJhaXJpZXMgbGlrZSBbYGRhdGUtZm5zYF0oaHR0cHM6Ly9kYXRlLWZucy5vcmcvKSwgW2BkYXkuanNgXShodHRwczovL2RheS5qcy5vcmcvZW4vKSBvciBbYHdlZWtzdGFydGBdKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL3dlZWtzdGFydCkgbGlicmFyeSBwcm92aWRlIHRoZWlyIG93biBsb2NhbGUgYmFzZWQgZGF0YSBmb3IgdGhlIGZpcnN0IGRheSBvZiB0aGUgd2Vlay5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUZpcnN0RGF5T2ZXZWVrKGxvY2FsZTogc3RyaW5nKTogV2Vla0RheSB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkZpcnN0RGF5T2ZXZWVrXTtcbn1cblxuLyoqXG4gKiBSYW5nZSBvZiB3ZWVrIGRheXMgdGhhdCBhcmUgY29uc2lkZXJlZCB0aGUgd2Vlay1lbmQgZm9yIHRoZSBnaXZlbiBsb2NhbGUuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcmV0dXJucyBUaGUgcmFuZ2Ugb2YgZGF5IHZhbHVlcywgYFtzdGFydERheSwgZW5kRGF5XWAuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkIEFuZ3VsYXIgcmVjb21tZW5kcyByZWx5aW5nIG9uIHRoZSBgSW50bGAgQVBJIGZvciBpMThuLlxuICogSW50bCdzIFtgZ2V0V2Vla0luZm9gXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9JbnRsL0xvY2FsZS9nZXRXZWVrSW5mbykgaGFzIHBhcnRpYWwgc3VwcG9ydCAoQ2hyb21pdW0gTTk5ICYgU2FmYXJpIDE3KS5cbiAqIExpYnJhcmllcyBsaWtlIFtgTHV4b25gXShodHRwczovL21vbWVudC5naXRodWIuaW8vbHV4b24vIy8pIHJlbHkgb24gYEludGxgIGJ1dCBmYWxsYmFjayBvbiB0aGUgSVNPIDg2MDEgZGVmaW5pdGlvbiAoU2F0dXJkYXkrU3VuZGF5KSBpZiBgZ2V0V2Vla0luZm9gIGlzIG5vdCBzdXBwb3J0ZWQgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlV2Vla0VuZFJhbmdlKGxvY2FsZTogc3RyaW5nKTogW1dlZWtEYXksIFdlZWtEYXldIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguV2Vla2VuZFJhbmdlXTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBsb2NhbGl6ZWQgZGF0ZS12YWx1ZSBmb3JtYXR0aW5nIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgZm9ybWF0IHR5cGUuXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxpemVkIGZvcm1hdHRpbmcgc3RyaW5nLlxuICogQHNlZSB7QGxpbmsgRm9ybWF0V2lkdGh9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkIEFuZ3VsYXIgcmVjb21tZW5kcyByZWx5aW5nIG9uIHRoZSBgSW50bGAgQVBJIGZvciBpMThuLlxuICogVXNlIGBJbnRsLkRhdGVUaW1lRm9ybWF0YCBmb3IgZGF0ZSBmb3JtYXRpbmcgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURhdGVGb3JtYXQobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBGb3JtYXRXaWR0aCk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRGF0ZUZvcm1hdF0sIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBsb2NhbGl6ZWQgdGltZS12YWx1ZSBmb3JtYXR0aW5nIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSB3aWR0aCBUaGUgZm9ybWF0IHR5cGUuXG4gKiBAcmV0dXJucyBUaGUgbG9jYWxpemVkIGZvcm1hdHRpbmcgc3RyaW5nLlxuICogQHNlZSB7QGxpbmsgRm9ybWF0V2lkdGh9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG5cbiAqIEBwdWJsaWNBcGlcbiAqIEBkZXByZWNhdGVkIEFuZ3VsYXIgcmVjb21tZW5kcyByZWx5aW5nIG9uIHRoZSBgSW50bGAgQVBJIGZvciBpMThuLlxuICogVXNlIGBJbnRsLkRhdGVUaW1lRm9ybWF0YCBmb3IgZGF0ZSBmb3JtYXRpbmcgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZVRpbWVGb3JtYXQobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBGb3JtYXRXaWR0aCk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBnZXRMYXN0RGVmaW5lZFZhbHVlKGRhdGFbybVMb2NhbGVEYXRhSW5kZXguVGltZUZvcm1hdF0sIHdpZHRoKTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYSBsb2NhbGl6ZWQgZGF0ZS10aW1lIGZvcm1hdHRpbmcgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIHdpZHRoIFRoZSBmb3JtYXQgdHlwZS5cbiAqIEByZXR1cm5zIFRoZSBsb2NhbGl6ZWQgZm9ybWF0dGluZyBzdHJpbmcuXG4gKiBAc2VlIHtAbGluayBGb3JtYXRXaWR0aH1cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQGRlcHJlY2F0ZWQgQW5ndWxhciByZWNvbW1lbmRzIHJlbHlpbmcgb24gdGhlIGBJbnRsYCBBUEkgZm9yIGkxOG4uXG4gKiBVc2UgYEludGwuRGF0ZVRpbWVGb3JtYXRgIGZvciBkYXRlIGZvcm1hdGluZyBpbnN0ZWFkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlOiBzdHJpbmcsIHdpZHRoOiBGb3JtYXRXaWR0aCk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNvbnN0IGRhdGVUaW1lRm9ybWF0RGF0YSA9IDxzdHJpbmdbXT5kYXRhW8m1TG9jYWxlRGF0YUluZGV4LkRhdGVUaW1lRm9ybWF0XTtcbiAgcmV0dXJuIGdldExhc3REZWZpbmVkVmFsdWUoZGF0ZVRpbWVGb3JtYXREYXRhLCB3aWR0aCk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGEgbG9jYWxpemVkIG51bWJlciBzeW1ib2wgdGhhdCBjYW4gYmUgdXNlZCB0byByZXBsYWNlIHBsYWNlaG9sZGVycyBpbiBudW1iZXIgZm9ybWF0cy5cbiAqIEBwYXJhbSBsb2NhbGUgVGhlIGxvY2FsZSBjb2RlLlxuICogQHBhcmFtIHN5bWJvbCBUaGUgc3ltYm9sIHRvIGxvY2FsaXplLiBNdXN0IGJlIG9uZSBvZiBgTnVtYmVyU3ltYm9sYC5cbiAqIEByZXR1cm5zIFRoZSBjaGFyYWN0ZXIgZm9yIHRoZSBsb2NhbGl6ZWQgc3ltYm9sLlxuICogQHNlZSB7QGxpbmsgTnVtYmVyU3ltYm9sfVxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAZGVwcmVjYXRlZCBBbmd1bGFyIHJlY29tbWVuZHMgcmVseWluZyBvbiB0aGUgYEludGxgIEFQSSBmb3IgaTE4bi5cbiAqIFVzZSBgSW50bC5OdW1iZXJGb3JtYXRgIHRvIGZvcm1hdCBudW1iZXJzIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlOiBzdHJpbmcsIHN5bWJvbDogTnVtYmVyU3ltYm9sKTogc3RyaW5nIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY29uc3QgcmVzID0gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5OdW1iZXJTeW1ib2xzXVtzeW1ib2xdO1xuICBpZiAodHlwZW9mIHJlcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoc3ltYm9sID09PSBOdW1iZXJTeW1ib2wuQ3VycmVuY3lEZWNpbWFsKSB7XG4gICAgICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5OdW1iZXJTeW1ib2xzXVtOdW1iZXJTeW1ib2wuRGVjaW1hbF07XG4gICAgfSBlbHNlIGlmIChzeW1ib2wgPT09IE51bWJlclN5bWJvbC5DdXJyZW5jeUdyb3VwKSB7XG4gICAgICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5OdW1iZXJTeW1ib2xzXVtOdW1iZXJTeW1ib2wuR3JvdXBdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhIG51bWJlciBmb3JtYXQgZm9yIGEgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIE51bWJlcnMgYXJlIGZvcm1hdHRlZCB1c2luZyBwYXR0ZXJucywgbGlrZSBgIywjIyMuMDBgLiBGb3IgZXhhbXBsZSwgdGhlIHBhdHRlcm4gYCMsIyMjLjAwYFxuICogd2hlbiB1c2VkIHRvIGZvcm1hdCB0aGUgbnVtYmVyIDEyMzQ1LjY3OCBjb3VsZCByZXN1bHQgaW4gXCIxMiczNDUsNjc4XCIuIFRoYXQgd291bGQgaGFwcGVuIGlmIHRoZVxuICogZ3JvdXBpbmcgc2VwYXJhdG9yIGZvciB5b3VyIGxhbmd1YWdlIGlzIGFuIGFwb3N0cm9waGUsIGFuZCB0aGUgZGVjaW1hbCBzZXBhcmF0b3IgaXMgYSBjb21tYS5cbiAqXG4gKiA8Yj5JbXBvcnRhbnQ6PC9iPiBUaGUgY2hhcmFjdGVycyBgLmAgYCxgIGAwYCBgI2AgKGFuZCBvdGhlcnMgYmVsb3cpIGFyZSBzcGVjaWFsIHBsYWNlaG9sZGVyc1xuICogdGhhdCBzdGFuZCBmb3IgdGhlIGRlY2ltYWwgc2VwYXJhdG9yLCBhbmQgc28gb24sIGFuZCBhcmUgTk9UIHJlYWwgY2hhcmFjdGVycy5cbiAqIFlvdSBtdXN0IE5PVCBcInRyYW5zbGF0ZVwiIHRoZSBwbGFjZWhvbGRlcnMuIEZvciBleGFtcGxlLCBkb24ndCBjaGFuZ2UgYC5gIHRvIGAsYCBldmVuIHRob3VnaCBpblxuICogeW91ciBsYW5ndWFnZSB0aGUgZGVjaW1hbCBwb2ludCBpcyB3cml0dGVuIHdpdGggYSBjb21tYS4gVGhlIHN5bWJvbHMgc2hvdWxkIGJlIHJlcGxhY2VkIGJ5IHRoZVxuICogbG9jYWwgZXF1aXZhbGVudHMsIHVzaW5nIHRoZSBhcHByb3ByaWF0ZSBgTnVtYmVyU3ltYm9sYCBmb3IgeW91ciBsYW5ndWFnZS5cbiAqXG4gKiBIZXJlIGFyZSB0aGUgc3BlY2lhbCBjaGFyYWN0ZXJzIHVzZWQgaW4gbnVtYmVyIHBhdHRlcm5zOlxuICpcbiAqIHwgU3ltYm9sIHwgTWVhbmluZyB8XG4gKiB8LS0tLS0tLS18LS0tLS0tLS0tfFxuICogfCAuIHwgUmVwbGFjZWQgYXV0b21hdGljYWxseSBieSB0aGUgY2hhcmFjdGVyIHVzZWQgZm9yIHRoZSBkZWNpbWFsIHBvaW50LiB8XG4gKiB8ICwgfCBSZXBsYWNlZCBieSB0aGUgXCJncm91cGluZ1wiICh0aG91c2FuZHMpIHNlcGFyYXRvci4gfFxuICogfCAwIHwgUmVwbGFjZWQgYnkgYSBkaWdpdCAob3IgemVybyBpZiB0aGVyZSBhcmVuJ3QgZW5vdWdoIGRpZ2l0cykuIHxcbiAqIHwgIyB8IFJlcGxhY2VkIGJ5IGEgZGlnaXQgKG9yIG5vdGhpbmcgaWYgdGhlcmUgYXJlbid0IGVub3VnaCkuIHxcbiAqIHwgwqQgfCBSZXBsYWNlZCBieSBhIGN1cnJlbmN5IHN5bWJvbCwgc3VjaCBhcyAkIG9yIFVTRC4gfFxuICogfCAlIHwgTWFya3MgYSBwZXJjZW50IGZvcm1hdC4gVGhlICUgc3ltYm9sIG1heSBjaGFuZ2UgcG9zaXRpb24sIGJ1dCBtdXN0IGJlIHJldGFpbmVkLiB8XG4gKiB8IEUgfCBNYXJrcyBhIHNjaWVudGlmaWMgZm9ybWF0LiBUaGUgRSBzeW1ib2wgbWF5IGNoYW5nZSBwb3NpdGlvbiwgYnV0IG11c3QgYmUgcmV0YWluZWQuIHxcbiAqIHwgJyB8IFNwZWNpYWwgY2hhcmFjdGVycyB1c2VkIGFzIGxpdGVyYWwgY2hhcmFjdGVycyBhcmUgcXVvdGVkIHdpdGggQVNDSUkgc2luZ2xlIHF1b3Rlcy4gfFxuICpcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHBhcmFtIHR5cGUgVGhlIHR5cGUgb2YgbnVtZXJpYyB2YWx1ZSB0byBiZSBmb3JtYXR0ZWQgKHN1Y2ggYXMgYERlY2ltYWxgIG9yIGBDdXJyZW5jeWAuKVxuICogQHJldHVybnMgVGhlIGxvY2FsaXplZCBmb3JtYXQgc3RyaW5nLlxuICogQHNlZSB7QGxpbmsgTnVtYmVyRm9ybWF0U3R5bGV9XG4gKiBAc2VlIFtDTERSIHdlYnNpdGVdKGh0dHA6Ly9jbGRyLnVuaWNvZGUub3JnL3RyYW5zbGF0aW9uL251bWJlci1wYXR0ZXJucylcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQGRlcHJlY2F0ZWQgQW5ndWxhciByZWNvbW1lbmRzIHJlbHlpbmcgb24gdGhlIGBJbnRsYCBBUEkgZm9yIGkxOG4uXG4gKiBMZXQgYEludGwuTnVtYmVyRm9ybWF0YCBkZXRlcm1pbmUgdGhlIG51bWJlciBmb3JtYXQgaW5zdGVhZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlTnVtYmVyRm9ybWF0KGxvY2FsZTogc3RyaW5nLCB0eXBlOiBOdW1iZXJGb3JtYXRTdHlsZSk6IHN0cmluZyB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4Lk51bWJlckZvcm1hdHNdW3R5cGVdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgc3ltYm9sIHVzZWQgdG8gcmVwcmVzZW50IHRoZSBjdXJyZW5jeSBmb3IgdGhlIG1haW4gY291bnRyeVxuICogY29ycmVzcG9uZGluZyB0byBhIGdpdmVuIGxvY2FsZS4gRm9yIGV4YW1wbGUsICckJyBmb3IgYGVuLVVTYC5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEByZXR1cm5zIFRoZSBsb2NhbGl6ZWQgc3ltYm9sIGNoYXJhY3RlcixcbiAqIG9yIGBudWxsYCBpZiB0aGUgbWFpbiBjb3VudHJ5IGNhbm5vdCBiZSBkZXRlcm1pbmVkLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAZGVwcmVjYXRlZCBVc2UgdGhlIGBJbnRsYCBBUEkgdG8gZm9ybWF0IGEgY3VycmVuY3kgd2l0aCBmcm9tIGN1cnJlbmN5IGNvZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUN1cnJlbmN5U3ltYm9sKGxvY2FsZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkN1cnJlbmN5U3ltYm9sXSB8fCBudWxsO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgbmFtZSBvZiB0aGUgY3VycmVuY3kgZm9yIHRoZSBtYWluIGNvdW50cnkgY29ycmVzcG9uZGluZ1xuICogdG8gYSBnaXZlbiBsb2NhbGUuIEZvciBleGFtcGxlLCAnVVMgRG9sbGFyJyBmb3IgYGVuLVVTYC5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHJldHVybnMgVGhlIGN1cnJlbmN5IG5hbWUsXG4gKiBvciBgbnVsbGAgaWYgdGhlIG1haW4gY291bnRyeSBjYW5ub3QgYmUgZGV0ZXJtaW5lZC5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQGRlcHJlY2F0ZWQgVXNlIHRoZSBgSW50bGAgQVBJIHRvIGZvcm1hdCBhIGN1cnJlbmN5IHdpdGggZnJvbSBjdXJyZW5jeSBjb2RlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jeU5hbWUobG9jYWxlOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguQ3VycmVuY3lOYW1lXSB8fCBudWxsO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgZGVmYXVsdCBjdXJyZW5jeSBjb2RlIGZvciB0aGUgZ2l2ZW4gbG9jYWxlLlxuICpcbiAqIFRoZSBkZWZhdWx0IGlzIGRlZmluZWQgYXMgdGhlIGZpcnN0IGN1cnJlbmN5IHdoaWNoIGlzIHN0aWxsIGluIHVzZS5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIFRoZSBjb2RlIG9mIHRoZSBsb2NhbGUgd2hvc2UgY3VycmVuY3kgY29kZSB3ZSB3YW50LlxuICogQHJldHVybnMgVGhlIGNvZGUgb2YgdGhlIGRlZmF1bHQgY3VycmVuY3kgZm9yIHRoZSBnaXZlbiBsb2NhbGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkIFdlIHJlY29tbWVuZCB5b3UgY3JlYXRlIGEgbWFwIG9mIGxvY2FsZSB0byBJU08gNDIxNyBjdXJyZW5jeSBjb2Rlcy5cbiAqIFRpbWUgcmVsYXRpdmUgY3VycmVuY3kgZGF0YSBpcyBwcm92aWRlZCBieSB0aGUgQ0xEUiBwcm9qZWN0LiBTZWUgaHR0cHM6Ly93d3cudW5pY29kZS5vcmcvY2xkci9jaGFydHMvNDQvc3VwcGxlbWVudGFsL2RldGFpbGVkX3RlcnJpdG9yeV9jdXJyZW5jeV9pbmZvcm1hdGlvbi5odG1sXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jeUNvZGUobG9jYWxlOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgcmV0dXJuIMm1Z2V0TG9jYWxlQ3VycmVuY3lDb2RlKGxvY2FsZSk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBjdXJyZW5jeSB2YWx1ZXMgZm9yIGEgZ2l2ZW4gbG9jYWxlLlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcmV0dXJucyBUaGUgY3VycmVuY3kgdmFsdWVzLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICovXG5mdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jaWVzKGxvY2FsZTogc3RyaW5nKToge1tjb2RlOiBzdHJpbmddOiBDdXJyZW5jaWVzU3ltYm9sc30ge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5DdXJyZW5jaWVzXTtcbn1cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQGRlcHJlY2F0ZWQgQW5ndWxhciByZWNvbW1lbmRzIHJlbHlpbmcgb24gdGhlIGBJbnRsYCBBUEkgZm9yIGkxOG4uXG4gKiBVc2UgYEludGwuUGx1cmFsUnVsZXNgIGluc3RlYWRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldExvY2FsZVBsdXJhbENhc2U6IChsb2NhbGU6IHN0cmluZykgPT4gKHZhbHVlOiBudW1iZXIpID0+IFBsdXJhbCA9XG4gIMm1Z2V0TG9jYWxlUGx1cmFsQ2FzZTtcblxuZnVuY3Rpb24gY2hlY2tGdWxsRGF0YShkYXRhOiBhbnkpIHtcbiAgaWYgKCFkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkV4dHJhRGF0YV0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgTWlzc2luZyBleHRyYSBsb2NhbGUgZGF0YSBmb3IgdGhlIGxvY2FsZSBcIiR7XG4gICAgICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguTG9jYWxlSWRdXG4gICAgICB9XCIuIFVzZSBcInJlZ2lzdGVyTG9jYWxlRGF0YVwiIHRvIGxvYWQgbmV3IGRhdGEuIFNlZSB0aGUgXCJJMThuIGd1aWRlXCIgb24gYW5ndWxhci5pbyB0byBrbm93IG1vcmUuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGxvY2FsZS1zcGVjaWZpYyBydWxlcyB1c2VkIHRvIGRldGVybWluZSB3aGljaCBkYXkgcGVyaW9kIHRvIHVzZVxuICogd2hlbiBtb3JlIHRoYW4gb25lIHBlcmlvZCBpcyBkZWZpbmVkIGZvciBhIGxvY2FsZS5cbiAqXG4gKiBUaGVyZSBpcyBhIHJ1bGUgZm9yIGVhY2ggZGVmaW5lZCBkYXkgcGVyaW9kLiBUaGVcbiAqIGZpcnN0IHJ1bGUgaXMgYXBwbGllZCB0byB0aGUgZmlyc3QgZGF5IHBlcmlvZCBhbmQgc28gb24uXG4gKiBGYWxsIGJhY2sgdG8gQU0vUE0gd2hlbiBubyBydWxlcyBhcmUgYXZhaWxhYmxlLlxuICpcbiAqIEEgcnVsZSBjYW4gc3BlY2lmeSBhIHBlcmlvZCBhcyB0aW1lIHJhbmdlLCBvciBhcyBhIHNpbmdsZSB0aW1lIHZhbHVlLlxuICpcbiAqIFRoaXMgZnVuY3Rpb25hbGl0eSBpcyBvbmx5IGF2YWlsYWJsZSB3aGVuIHlvdSBoYXZlIGxvYWRlZCB0aGUgZnVsbCBsb2NhbGUgZGF0YS5cbiAqIFNlZSB0aGUgW1wiSTE4biBndWlkZVwiXShndWlkZS9pMThuL2Zvcm1hdC1kYXRhLWxvY2FsZSkuXG4gKlxuICogQHBhcmFtIGxvY2FsZSBBIGxvY2FsZSBjb2RlIGZvciB0aGUgbG9jYWxlIGZvcm1hdCBydWxlcyB0byB1c2UuXG4gKiBAcmV0dXJucyBUaGUgcnVsZXMgZm9yIHRoZSBsb2NhbGUsIGEgc2luZ2xlIHRpbWUgdmFsdWUgb3IgYXJyYXkgb2YgKmZyb20tdGltZSwgdG8tdGltZSosXG4gKiBvciBudWxsIGlmIG5vIHBlcmlvZHMgYXJlIGF2YWlsYWJsZS5cbiAqXG4gKiBAc2VlIHtAbGluayBnZXRMb2NhbGVFeHRyYURheVBlcmlvZHN9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkIEFuZ3VsYXIgcmVjb21tZW5kcyByZWx5aW5nIG9uIHRoZSBgSW50bGAgQVBJIGZvciBpMThuLlxuICogTGV0IGBJbnRsLkRhdGVUaW1lRm9ybWF0YCBkZXRlcm1pbmUgdGhlIGRheSBwZXJpb2QgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kUnVsZXMobG9jYWxlOiBzdHJpbmcpOiAoVGltZSB8IFtUaW1lLCBUaW1lXSlbXSB7XG4gIGNvbnN0IGRhdGEgPSDJtWZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIGNoZWNrRnVsbERhdGEoZGF0YSk7XG4gIGNvbnN0IHJ1bGVzID0gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdW8m1RXh0cmFMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXlQZXJpb2RzUnVsZXNdIHx8IFtdO1xuICByZXR1cm4gcnVsZXMubWFwKChydWxlOiBzdHJpbmcgfCBbc3RyaW5nLCBzdHJpbmddKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBydWxlID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGV4dHJhY3RUaW1lKHJ1bGUpO1xuICAgIH1cbiAgICByZXR1cm4gW2V4dHJhY3RUaW1lKHJ1bGVbMF0pLCBleHRyYWN0VGltZShydWxlWzFdKV07XG4gIH0pO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBsb2NhbGUtc3BlY2lmaWMgZGF5IHBlcmlvZHMsIHdoaWNoIGluZGljYXRlIHJvdWdobHkgaG93IGEgZGF5IGlzIGJyb2tlbiB1cFxuICogaW4gZGlmZmVyZW50IGxhbmd1YWdlcy5cbiAqIEZvciBleGFtcGxlLCBmb3IgYGVuLVVTYCwgcGVyaW9kcyBhcmUgbW9ybmluZywgbm9vbiwgYWZ0ZXJub29uLCBldmVuaW5nLCBhbmQgbWlkbmlnaHQuXG4gKlxuICogVGhpcyBmdW5jdGlvbmFsaXR5IGlzIG9ubHkgYXZhaWxhYmxlIHdoZW4geW91IGhhdmUgbG9hZGVkIHRoZSBmdWxsIGxvY2FsZSBkYXRhLlxuICogU2VlIHRoZSBbXCJJMThuIGd1aWRlXCJdKGd1aWRlL2kxOG4vZm9ybWF0LWRhdGEtbG9jYWxlKS5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqIEBwYXJhbSBmb3JtU3R5bGUgVGhlIHJlcXVpcmVkIGdyYW1tYXRpY2FsIGZvcm0uXG4gKiBAcGFyYW0gd2lkdGggVGhlIHJlcXVpcmVkIGNoYXJhY3RlciB3aWR0aC5cbiAqIEByZXR1cm5zIFRoZSB0cmFuc2xhdGVkIGRheS1wZXJpb2Qgc3RyaW5ncy5cbiAqIEBzZWUge0BsaW5rIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kUnVsZXN9XG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkIEFuZ3VsYXIgcmVjb21tZW5kcyByZWx5aW5nIG9uIHRoZSBgSW50bGAgQVBJIGZvciBpMThuLlxuICogVG8gZXh0cmFjdCBhIGRheSBwZXJpb2QgdXNlIGBJbnRsLkRhdGVUaW1lRm9ybWF0YCB3aXRoIHRoZSBgZGF5UGVyaW9kYCBvcHRpb24gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kcyhcbiAgbG9jYWxlOiBzdHJpbmcsXG4gIGZvcm1TdHlsZTogRm9ybVN0eWxlLFxuICB3aWR0aDogVHJhbnNsYXRpb25XaWR0aCxcbik6IHN0cmluZ1tdIHtcbiAgY29uc3QgZGF0YSA9IMm1ZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgY2hlY2tGdWxsRGF0YShkYXRhKTtcbiAgY29uc3QgZGF5UGVyaW9kc0RhdGEgPSA8c3RyaW5nW11bXVtdPltcbiAgICBkYXRhW8m1TG9jYWxlRGF0YUluZGV4LkV4dHJhRGF0YV1bybVFeHRyYUxvY2FsZURhdGFJbmRleC5FeHRyYURheVBlcmlvZEZvcm1hdHNdLFxuICAgIGRhdGFbybVMb2NhbGVEYXRhSW5kZXguRXh0cmFEYXRhXVvJtUV4dHJhTG9jYWxlRGF0YUluZGV4LkV4dHJhRGF5UGVyaW9kU3RhbmRhbG9uZV0sXG4gIF07XG4gIGNvbnN0IGRheVBlcmlvZHMgPSBnZXRMYXN0RGVmaW5lZFZhbHVlKGRheVBlcmlvZHNEYXRhLCBmb3JtU3R5bGUpIHx8IFtdO1xuICByZXR1cm4gZ2V0TGFzdERlZmluZWRWYWx1ZShkYXlQZXJpb2RzLCB3aWR0aCkgfHwgW107XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSB3cml0aW5nIGRpcmVjdGlvbiBvZiBhIHNwZWNpZmllZCBsb2NhbGVcbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHB1YmxpY0FwaVxuICogQHJldHVybnMgJ3J0bCcgb3IgJ2x0cidcbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKiBAZGVwcmVjYXRlZCBBbmd1bGFyIHJlY29tbWVuZHMgcmVseWluZyBvbiB0aGUgYEludGxgIEFQSSBmb3IgaTE4bi5cbiAqIEZvciBkYXRlcyBhbmQgbnVtYmVycywgbGV0IGBJbnRsLkRhdGVUaW1lRm9ybWF0KClgIGFuZCBgSW50bC5OdW1iZXJGb3JtYXQoKWAgZGV0ZXJtaW5lIHRoZSB3cml0aW5nIGRpcmVjdGlvbi5cbiAqIFRoZSBgSW50bGAgYWx0ZXJuYXRpdmUgW2BnZXRUZXh0SW5mb2BdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0ludGwvTG9jYWxlL2dldFRleHRJbmZvKS5cbiAqIGhhcyBvbmx5IHBhcnRpYWwgc3VwcG9ydCAoQ2hyb21pdW0gTTk5ICYgU2FmYXJpIDE3KS5cbiAqIDNyZCBwYXJ0eSBhbHRlcm5hdGl2ZXMgbGlrZSBbYHJ0bC1kZXRlY3RgXShodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9ydGwtZGV0ZWN0KSBjYW4gd29yayBhcm91bmQgdGhpcyBpc3N1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsZURpcmVjdGlvbihsb2NhbGU6IHN0cmluZyk6ICdsdHInIHwgJ3J0bCcge1xuICBjb25zdCBkYXRhID0gybVmaW5kTG9jYWxlRGF0YShsb2NhbGUpO1xuICByZXR1cm4gZGF0YVvJtUxvY2FsZURhdGFJbmRleC5EaXJlY3Rpb25hbGl0eV07XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBmaXJzdCB2YWx1ZSB0aGF0IGlzIGRlZmluZWQgaW4gYW4gYXJyYXksIGdvaW5nIGJhY2t3YXJkcyBmcm9tIGFuIGluZGV4IHBvc2l0aW9uLlxuICpcbiAqIFRvIGF2b2lkIHJlcGVhdGluZyB0aGUgc2FtZSBkYXRhIChhcyB3aGVuIHRoZSBcImZvcm1hdFwiIGFuZCBcInN0YW5kYWxvbmVcIiBmb3JtcyBhcmUgdGhlIHNhbWUpXG4gKiBhZGQgdGhlIGZpcnN0IHZhbHVlIHRvIHRoZSBsb2NhbGUgZGF0YSBhcnJheXMsIGFuZCBhZGQgb3RoZXIgdmFsdWVzIG9ubHkgaWYgdGhleSBhcmUgZGlmZmVyZW50LlxuICpcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIGFycmF5IHRvIHJldHJpZXZlIGZyb20uXG4gKiBAcGFyYW0gaW5kZXggQSAwLWJhc2VkIGluZGV4IGludG8gdGhlIGFycmF5IHRvIHN0YXJ0IGZyb20uXG4gKiBAcmV0dXJucyBUaGUgdmFsdWUgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBnaXZlbiBpbmRleCBwb3NpdGlvbi5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oZ3VpZGUvaTE4bilcbiAqXG4gKi9cbmZ1bmN0aW9uIGdldExhc3REZWZpbmVkVmFsdWU8VD4oZGF0YTogVFtdLCBpbmRleDogbnVtYmVyKTogVCB7XG4gIGZvciAobGV0IGkgPSBpbmRleDsgaSA+IC0xOyBpLS0pIHtcbiAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZGF0YVtpXTtcbiAgICB9XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCdMb2NhbGUgZGF0YSBBUEk6IGxvY2FsZSBkYXRhIHVuZGVmaW5lZCcpO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSB0aW1lIHZhbHVlIHdpdGggaG91cnMgYW5kIG1pbnV0ZXMuXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkIExvY2FsZSBkYXRlIGdldHRlcnMgYXJlIGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IHR5cGUgVGltZSA9IHtcbiAgaG91cnM6IG51bWJlcjtcbiAgbWludXRlczogbnVtYmVyO1xufTtcblxuLyoqXG4gKiBFeHRyYWN0cyB0aGUgaG91cnMgYW5kIG1pbnV0ZXMgZnJvbSBhIHN0cmluZyBsaWtlIFwiMTU6NDVcIlxuICovXG5mdW5jdGlvbiBleHRyYWN0VGltZSh0aW1lOiBzdHJpbmcpOiBUaW1lIHtcbiAgY29uc3QgW2gsIG1dID0gdGltZS5zcGxpdCgnOicpO1xuICByZXR1cm4ge2hvdXJzOiAraCwgbWludXRlczogK219O1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgY3VycmVuY3kgc3ltYm9sIGZvciBhIGdpdmVuIGN1cnJlbmN5IGNvZGUuXG4gKlxuICogRm9yIGV4YW1wbGUsIGZvciB0aGUgZGVmYXVsdCBgZW4tVVNgIGxvY2FsZSwgdGhlIGNvZGUgYFVTRGAgY2FuXG4gKiBiZSByZXByZXNlbnRlZCBieSB0aGUgbmFycm93IHN5bWJvbCBgJGAgb3IgdGhlIHdpZGUgc3ltYm9sIGBVUyRgLlxuICpcbiAqIEBwYXJhbSBjb2RlIFRoZSBjdXJyZW5jeSBjb2RlLlxuICogQHBhcmFtIGZvcm1hdCBUaGUgZm9ybWF0LCBgd2lkZWAgb3IgYG5hcnJvd2AuXG4gKiBAcGFyYW0gbG9jYWxlIEEgbG9jYWxlIGNvZGUgZm9yIHRoZSBsb2NhbGUgZm9ybWF0IHJ1bGVzIHRvIHVzZS5cbiAqXG4gKiBAcmV0dXJucyBUaGUgc3ltYm9sLCBvciB0aGUgY3VycmVuY3kgY29kZSBpZiBubyBzeW1ib2wgaXMgYXZhaWxhYmxlLlxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAZGVwcmVjYXRlZCBBbmd1bGFyIHJlY29tbWVuZHMgcmVseWluZyBvbiB0aGUgYEludGxgIEFQSSBmb3IgaTE4bi5cbiAqIFlvdSBjYW4gdXNlIGBJbnRsLk51bWJlckZvcm1hdCgpLmZvcm1hdFRvUGFydHMoKWAgdG8gZXh0cmFjdCB0aGUgY3VycmVuY3kgc3ltYm9sLlxuICogRm9yIGV4YW1wbGU6IGBJbnRsLk51bWJlckZvcm1hdCgnZW4nLCB7c3R5bGU6J2N1cnJlbmN5JywgY3VycmVuY3k6ICdVU0QnfSkuZm9ybWF0VG9QYXJ0cygpLmZpbmQocGFydCA9PiBwYXJ0LnR5cGUgPT09ICdjdXJyZW5jeScpLnZhbHVlYFxuICogcmV0dXJucyBgJGAgZm9yIFVTRCBjdXJyZW5jeSBjb2RlIGluIHRoZSBgZW5gIGxvY2FsZS5cbiAqIE5vdGU6IGBVUyRgIGlzIGEgY3VycmVuY3kgc3ltYm9sIGZvciB0aGUgYGVuLWNhYCBsb2NhbGUgYnV0IG5vdCB0aGUgYGVuLXVzYCBsb2NhbGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW5jeVN5bWJvbChjb2RlOiBzdHJpbmcsIGZvcm1hdDogJ3dpZGUnIHwgJ25hcnJvdycsIGxvY2FsZSA9ICdlbicpOiBzdHJpbmcge1xuICBjb25zdCBjdXJyZW5jeSA9IGdldExvY2FsZUN1cnJlbmNpZXMobG9jYWxlKVtjb2RlXSB8fCBDVVJSRU5DSUVTX0VOW2NvZGVdIHx8IFtdO1xuICBjb25zdCBzeW1ib2xOYXJyb3cgPSBjdXJyZW5jeVvJtUN1cnJlbmN5SW5kZXguU3ltYm9sTmFycm93XTtcblxuICBpZiAoZm9ybWF0ID09PSAnbmFycm93JyAmJiB0eXBlb2Ygc3ltYm9sTmFycm93ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBzeW1ib2xOYXJyb3c7XG4gIH1cblxuICByZXR1cm4gY3VycmVuY3lbybVDdXJyZW5jeUluZGV4LlN5bWJvbF0gfHwgY29kZTtcbn1cblxuLy8gTW9zdCBjdXJyZW5jaWVzIGhhdmUgY2VudHMsIHRoYXQncyB3aHkgdGhlIGRlZmF1bHQgaXMgMlxuY29uc3QgREVGQVVMVF9OQl9PRl9DVVJSRU5DWV9ESUdJVFMgPSAyO1xuXG4vKipcbiAqIFJlcG9ydHMgdGhlIG51bWJlciBvZiBkZWNpbWFsIGRpZ2l0cyBmb3IgYSBnaXZlbiBjdXJyZW5jeS5cbiAqIFRoZSB2YWx1ZSBkZXBlbmRzIHVwb24gdGhlIHByZXNlbmNlIG9mIGNlbnRzIGluIHRoYXQgcGFydGljdWxhciBjdXJyZW5jeS5cbiAqXG4gKiBAcGFyYW0gY29kZSBUaGUgY3VycmVuY3kgY29kZS5cbiAqIEByZXR1cm5zIFRoZSBudW1iZXIgb2YgZGVjaW1hbCBkaWdpdHMsIHR5cGljYWxseSAwIG9yIDIuXG4gKiBAc2VlIFtJbnRlcm5hdGlvbmFsaXphdGlvbiAoaTE4bikgR3VpZGVdKGd1aWRlL2kxOG4pXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBkZXByZWNhdGVkIEFuZ3VsYXIgcmVjb21tZW5kcyByZWx5aW5nIG9uIHRoZSBgSW50bGAgQVBJIGZvciBpMThuLlxuICogVGhpcyBmdW5jdGlvbiBzaG91bGQgbm90IGJlIHVzZWQgYW55bW9yZS4gTGV0IGBJbnRsLk51bWJlckZvcm1hdGAgZGV0ZXJtaW5lIHRoZSBudW1iZXIgb2YgZGlnaXRzIHRvIGRpc3BsYXkgZm9yIHRoZSBjdXJyZW5jeVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TnVtYmVyT2ZDdXJyZW5jeURpZ2l0cyhjb2RlOiBzdHJpbmcpOiBudW1iZXIge1xuICBsZXQgZGlnaXRzO1xuICBjb25zdCBjdXJyZW5jeSA9IENVUlJFTkNJRVNfRU5bY29kZV07XG4gIGlmIChjdXJyZW5jeSkge1xuICAgIGRpZ2l0cyA9IGN1cnJlbmN5W8m1Q3VycmVuY3lJbmRleC5OYk9mRGlnaXRzXTtcbiAgfVxuICByZXR1cm4gdHlwZW9mIGRpZ2l0cyA9PT0gJ251bWJlcicgPyBkaWdpdHMgOiBERUZBVUxUX05CX09GX0NVUlJFTkNZX0RJR0lUUztcbn1cbiJdfQ==