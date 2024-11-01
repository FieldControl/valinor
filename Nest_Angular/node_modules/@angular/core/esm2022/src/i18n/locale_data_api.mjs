/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { RuntimeError } from '../errors';
import { global } from '../util/global';
import localeEn from './locale_en';
/**
 * This const is used to store the locale data registered with `registerLocaleData`
 */
let LOCALE_DATA = {};
/**
 * Register locale data to be used internally by Angular. See the
 * ["I18n guide"](guide/i18n/format-data-locale) to know how to import additional locale
 * data.
 *
 * The signature `registerLocaleData(data: any, extraData?: any)` is deprecated since v5.1
 */
export function registerLocaleData(data, localeId, extraData) {
    if (typeof localeId !== 'string') {
        extraData = localeId;
        localeId = data[LocaleDataIndex.LocaleId];
    }
    localeId = localeId.toLowerCase().replace(/_/g, '-');
    LOCALE_DATA[localeId] = data;
    if (extraData) {
        LOCALE_DATA[localeId][LocaleDataIndex.ExtraData] = extraData;
    }
}
/**
 * Finds the locale data for a given locale.
 *
 * @param locale The locale code.
 * @returns The locale data.
 * @see [Internationalization (i18n) Guide](https://angular.io/guide/i18n)
 */
export function findLocaleData(locale) {
    const normalizedLocale = normalizeLocale(locale);
    let match = getLocaleData(normalizedLocale);
    if (match) {
        return match;
    }
    // let's try to find a parent locale
    const parentLocale = normalizedLocale.split('-')[0];
    match = getLocaleData(parentLocale);
    if (match) {
        return match;
    }
    if (parentLocale === 'en') {
        return localeEn;
    }
    throw new RuntimeError(701 /* RuntimeErrorCode.MISSING_LOCALE_DATA */, ngDevMode && `Missing locale data for the locale "${locale}".`);
}
/**
 * Retrieves the default currency code for the given locale.
 *
 * The default is defined as the first currency which is still in use.
 *
 * @param locale The code of the locale whose currency code we want.
 * @returns The code of the default currency for the given locale.
 *
 */
export function getLocaleCurrencyCode(locale) {
    const data = findLocaleData(locale);
    return data[LocaleDataIndex.CurrencyCode] || null;
}
/**
 * Retrieves the plural function used by ICU expressions to determine the plural case to use
 * for a given locale.
 * @param locale A locale code for the locale format rules to use.
 * @returns The plural function for the locale.
 * @see {@link NgPlural}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 */
export function getLocalePluralCase(locale) {
    const data = findLocaleData(locale);
    return data[LocaleDataIndex.PluralCase];
}
/**
 * Helper function to get the given `normalizedLocale` from `LOCALE_DATA`
 * or from the global `ng.common.locale`.
 */
export function getLocaleData(normalizedLocale) {
    if (!(normalizedLocale in LOCALE_DATA)) {
        LOCALE_DATA[normalizedLocale] =
            global.ng &&
                global.ng.common &&
                global.ng.common.locales &&
                global.ng.common.locales[normalizedLocale];
    }
    return LOCALE_DATA[normalizedLocale];
}
/**
 * Helper function to remove all the locale data from `LOCALE_DATA`.
 */
export function unregisterAllLocaleData() {
    LOCALE_DATA = {};
}
/**
 * Index of each type of locale data from the locale data array
 */
export var LocaleDataIndex;
(function (LocaleDataIndex) {
    LocaleDataIndex[LocaleDataIndex["LocaleId"] = 0] = "LocaleId";
    LocaleDataIndex[LocaleDataIndex["DayPeriodsFormat"] = 1] = "DayPeriodsFormat";
    LocaleDataIndex[LocaleDataIndex["DayPeriodsStandalone"] = 2] = "DayPeriodsStandalone";
    LocaleDataIndex[LocaleDataIndex["DaysFormat"] = 3] = "DaysFormat";
    LocaleDataIndex[LocaleDataIndex["DaysStandalone"] = 4] = "DaysStandalone";
    LocaleDataIndex[LocaleDataIndex["MonthsFormat"] = 5] = "MonthsFormat";
    LocaleDataIndex[LocaleDataIndex["MonthsStandalone"] = 6] = "MonthsStandalone";
    LocaleDataIndex[LocaleDataIndex["Eras"] = 7] = "Eras";
    LocaleDataIndex[LocaleDataIndex["FirstDayOfWeek"] = 8] = "FirstDayOfWeek";
    LocaleDataIndex[LocaleDataIndex["WeekendRange"] = 9] = "WeekendRange";
    LocaleDataIndex[LocaleDataIndex["DateFormat"] = 10] = "DateFormat";
    LocaleDataIndex[LocaleDataIndex["TimeFormat"] = 11] = "TimeFormat";
    LocaleDataIndex[LocaleDataIndex["DateTimeFormat"] = 12] = "DateTimeFormat";
    LocaleDataIndex[LocaleDataIndex["NumberSymbols"] = 13] = "NumberSymbols";
    LocaleDataIndex[LocaleDataIndex["NumberFormats"] = 14] = "NumberFormats";
    LocaleDataIndex[LocaleDataIndex["CurrencyCode"] = 15] = "CurrencyCode";
    LocaleDataIndex[LocaleDataIndex["CurrencySymbol"] = 16] = "CurrencySymbol";
    LocaleDataIndex[LocaleDataIndex["CurrencyName"] = 17] = "CurrencyName";
    LocaleDataIndex[LocaleDataIndex["Currencies"] = 18] = "Currencies";
    LocaleDataIndex[LocaleDataIndex["Directionality"] = 19] = "Directionality";
    LocaleDataIndex[LocaleDataIndex["PluralCase"] = 20] = "PluralCase";
    LocaleDataIndex[LocaleDataIndex["ExtraData"] = 21] = "ExtraData";
})(LocaleDataIndex || (LocaleDataIndex = {}));
/**
 * Returns the canonical form of a locale name - lowercase with `_` replaced with `-`.
 */
function normalizeLocale(locale) {
    return locale.toLowerCase().replace(/_/g, '-');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxlX2RhdGFfYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvaTE4bi9sb2NhbGVfZGF0YV9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLFlBQVksRUFBbUIsTUFBTSxXQUFXLENBQUM7QUFDekQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXRDLE9BQU8sUUFBUSxNQUFNLGFBQWEsQ0FBQztBQUVuQzs7R0FFRztBQUNILElBQUksV0FBVyxHQUE4QixFQUFFLENBQUM7QUFFaEQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBQVMsRUFBRSxRQUF1QixFQUFFLFNBQWU7SUFDcEYsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUNqQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQ3JCLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFckQsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUU3QixJQUFJLFNBQVMsRUFBRSxDQUFDO1FBQ2QsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDL0QsQ0FBQztBQUNILENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsY0FBYyxDQUFDLE1BQWM7SUFDM0MsTUFBTSxnQkFBZ0IsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFakQsSUFBSSxLQUFLLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDNUMsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUNWLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELG9DQUFvQztJQUNwQyxNQUFNLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsS0FBSyxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNwQyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ1YsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDMUIsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVELE1BQU0sSUFBSSxZQUFZLGlEQUVwQixTQUFTLElBQUksdUNBQXVDLE1BQU0sSUFBSSxDQUMvRCxDQUFDO0FBQ0osQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxVQUFVLHFCQUFxQixDQUFDLE1BQWM7SUFDbEQsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDcEQsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsbUJBQW1CLENBQUMsTUFBYztJQUNoRCxNQUFNLElBQUksR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsYUFBYSxDQUFDLGdCQUF3QjtJQUNwRCxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFDO1FBQ3ZDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQztZQUMzQixNQUFNLENBQUMsRUFBRTtnQkFDVCxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU07Z0JBQ2hCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU87Z0JBQ3hCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCxPQUFPLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSx1QkFBdUI7SUFDckMsV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLENBQU4sSUFBWSxlQXVCWDtBQXZCRCxXQUFZLGVBQWU7SUFDekIsNkRBQVksQ0FBQTtJQUNaLDZFQUFnQixDQUFBO0lBQ2hCLHFGQUFvQixDQUFBO0lBQ3BCLGlFQUFVLENBQUE7SUFDVix5RUFBYyxDQUFBO0lBQ2QscUVBQVksQ0FBQTtJQUNaLDZFQUFnQixDQUFBO0lBQ2hCLHFEQUFJLENBQUE7SUFDSix5RUFBYyxDQUFBO0lBQ2QscUVBQVksQ0FBQTtJQUNaLGtFQUFVLENBQUE7SUFDVixrRUFBVSxDQUFBO0lBQ1YsMEVBQWMsQ0FBQTtJQUNkLHdFQUFhLENBQUE7SUFDYix3RUFBYSxDQUFBO0lBQ2Isc0VBQVksQ0FBQTtJQUNaLDBFQUFjLENBQUE7SUFDZCxzRUFBWSxDQUFBO0lBQ1osa0VBQVUsQ0FBQTtJQUNWLDBFQUFjLENBQUE7SUFDZCxrRUFBVSxDQUFBO0lBQ1YsZ0VBQVMsQ0FBQTtBQUNYLENBQUMsRUF2QlcsZUFBZSxLQUFmLGVBQWUsUUF1QjFCO0FBb0JEOztHQUVHO0FBQ0gsU0FBUyxlQUFlLENBQUMsTUFBYztJQUNyQyxPQUFPLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5pbXBvcnQge1J1bnRpbWVFcnJvciwgUnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7Z2xvYmFsfSBmcm9tICcuLi91dGlsL2dsb2JhbCc7XG5cbmltcG9ydCBsb2NhbGVFbiBmcm9tICcuL2xvY2FsZV9lbic7XG5cbi8qKlxuICogVGhpcyBjb25zdCBpcyB1c2VkIHRvIHN0b3JlIHRoZSBsb2NhbGUgZGF0YSByZWdpc3RlcmVkIHdpdGggYHJlZ2lzdGVyTG9jYWxlRGF0YWBcbiAqL1xubGV0IExPQ0FMRV9EQVRBOiB7W2xvY2FsZUlkOiBzdHJpbmddOiBhbnl9ID0ge307XG5cbi8qKlxuICogUmVnaXN0ZXIgbG9jYWxlIGRhdGEgdG8gYmUgdXNlZCBpbnRlcm5hbGx5IGJ5IEFuZ3VsYXIuIFNlZSB0aGVcbiAqIFtcIkkxOG4gZ3VpZGVcIl0oZ3VpZGUvaTE4bi9mb3JtYXQtZGF0YS1sb2NhbGUpIHRvIGtub3cgaG93IHRvIGltcG9ydCBhZGRpdGlvbmFsIGxvY2FsZVxuICogZGF0YS5cbiAqXG4gKiBUaGUgc2lnbmF0dXJlIGByZWdpc3RlckxvY2FsZURhdGEoZGF0YTogYW55LCBleHRyYURhdGE/OiBhbnkpYCBpcyBkZXByZWNhdGVkIHNpbmNlIHY1LjFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyTG9jYWxlRGF0YShkYXRhOiBhbnksIGxvY2FsZUlkPzogc3RyaW5nIHwgYW55LCBleHRyYURhdGE/OiBhbnkpOiB2b2lkIHtcbiAgaWYgKHR5cGVvZiBsb2NhbGVJZCAhPT0gJ3N0cmluZycpIHtcbiAgICBleHRyYURhdGEgPSBsb2NhbGVJZDtcbiAgICBsb2NhbGVJZCA9IGRhdGFbTG9jYWxlRGF0YUluZGV4LkxvY2FsZUlkXTtcbiAgfVxuXG4gIGxvY2FsZUlkID0gbG9jYWxlSWQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9fL2csICctJyk7XG5cbiAgTE9DQUxFX0RBVEFbbG9jYWxlSWRdID0gZGF0YTtcblxuICBpZiAoZXh0cmFEYXRhKSB7XG4gICAgTE9DQUxFX0RBVEFbbG9jYWxlSWRdW0xvY2FsZURhdGFJbmRleC5FeHRyYURhdGFdID0gZXh0cmFEYXRhO1xuICB9XG59XG5cbi8qKlxuICogRmluZHMgdGhlIGxvY2FsZSBkYXRhIGZvciBhIGdpdmVuIGxvY2FsZS5cbiAqXG4gKiBAcGFyYW0gbG9jYWxlIFRoZSBsb2NhbGUgY29kZS5cbiAqIEByZXR1cm5zIFRoZSBsb2NhbGUgZGF0YS5cbiAqIEBzZWUgW0ludGVybmF0aW9uYWxpemF0aW9uIChpMThuKSBHdWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4pXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kTG9jYWxlRGF0YShsb2NhbGU6IHN0cmluZyk6IGFueSB7XG4gIGNvbnN0IG5vcm1hbGl6ZWRMb2NhbGUgPSBub3JtYWxpemVMb2NhbGUobG9jYWxlKTtcblxuICBsZXQgbWF0Y2ggPSBnZXRMb2NhbGVEYXRhKG5vcm1hbGl6ZWRMb2NhbGUpO1xuICBpZiAobWF0Y2gpIHtcbiAgICByZXR1cm4gbWF0Y2g7XG4gIH1cblxuICAvLyBsZXQncyB0cnkgdG8gZmluZCBhIHBhcmVudCBsb2NhbGVcbiAgY29uc3QgcGFyZW50TG9jYWxlID0gbm9ybWFsaXplZExvY2FsZS5zcGxpdCgnLScpWzBdO1xuICBtYXRjaCA9IGdldExvY2FsZURhdGEocGFyZW50TG9jYWxlKTtcbiAgaWYgKG1hdGNoKSB7XG4gICAgcmV0dXJuIG1hdGNoO1xuICB9XG5cbiAgaWYgKHBhcmVudExvY2FsZSA9PT0gJ2VuJykge1xuICAgIHJldHVybiBsb2NhbGVFbjtcbiAgfVxuXG4gIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgUnVudGltZUVycm9yQ29kZS5NSVNTSU5HX0xPQ0FMRV9EQVRBLFxuICAgIG5nRGV2TW9kZSAmJiBgTWlzc2luZyBsb2NhbGUgZGF0YSBmb3IgdGhlIGxvY2FsZSBcIiR7bG9jYWxlfVwiLmAsXG4gICk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBkZWZhdWx0IGN1cnJlbmN5IGNvZGUgZm9yIHRoZSBnaXZlbiBsb2NhbGUuXG4gKlxuICogVGhlIGRlZmF1bHQgaXMgZGVmaW5lZCBhcyB0aGUgZmlyc3QgY3VycmVuY3kgd2hpY2ggaXMgc3RpbGwgaW4gdXNlLlxuICpcbiAqIEBwYXJhbSBsb2NhbGUgVGhlIGNvZGUgb2YgdGhlIGxvY2FsZSB3aG9zZSBjdXJyZW5jeSBjb2RlIHdlIHdhbnQuXG4gKiBAcmV0dXJucyBUaGUgY29kZSBvZiB0aGUgZGVmYXVsdCBjdXJyZW5jeSBmb3IgdGhlIGdpdmVuIGxvY2FsZS5cbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVDdXJyZW5jeUNvZGUobG9jYWxlOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgY29uc3QgZGF0YSA9IGZpbmRMb2NhbGVEYXRhKGxvY2FsZSk7XG4gIHJldHVybiBkYXRhW0xvY2FsZURhdGFJbmRleC5DdXJyZW5jeUNvZGVdIHx8IG51bGw7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBwbHVyYWwgZnVuY3Rpb24gdXNlZCBieSBJQ1UgZXhwcmVzc2lvbnMgdG8gZGV0ZXJtaW5lIHRoZSBwbHVyYWwgY2FzZSB0byB1c2VcbiAqIGZvciBhIGdpdmVuIGxvY2FsZS5cbiAqIEBwYXJhbSBsb2NhbGUgQSBsb2NhbGUgY29kZSBmb3IgdGhlIGxvY2FsZSBmb3JtYXQgcnVsZXMgdG8gdXNlLlxuICogQHJldHVybnMgVGhlIHBsdXJhbCBmdW5jdGlvbiBmb3IgdGhlIGxvY2FsZS5cbiAqIEBzZWUge0BsaW5rIE5nUGx1cmFsfVxuICogQHNlZSBbSW50ZXJuYXRpb25hbGl6YXRpb24gKGkxOG4pIEd1aWRlXShndWlkZS9pMThuKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxlUGx1cmFsQ2FzZShsb2NhbGU6IHN0cmluZyk6ICh2YWx1ZTogbnVtYmVyKSA9PiBudW1iZXIge1xuICBjb25zdCBkYXRhID0gZmluZExvY2FsZURhdGEobG9jYWxlKTtcbiAgcmV0dXJuIGRhdGFbTG9jYWxlRGF0YUluZGV4LlBsdXJhbENhc2VdO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBnZXQgdGhlIGdpdmVuIGBub3JtYWxpemVkTG9jYWxlYCBmcm9tIGBMT0NBTEVfREFUQWBcbiAqIG9yIGZyb20gdGhlIGdsb2JhbCBgbmcuY29tbW9uLmxvY2FsZWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGVEYXRhKG5vcm1hbGl6ZWRMb2NhbGU6IHN0cmluZyk6IGFueSB7XG4gIGlmICghKG5vcm1hbGl6ZWRMb2NhbGUgaW4gTE9DQUxFX0RBVEEpKSB7XG4gICAgTE9DQUxFX0RBVEFbbm9ybWFsaXplZExvY2FsZV0gPVxuICAgICAgZ2xvYmFsLm5nICYmXG4gICAgICBnbG9iYWwubmcuY29tbW9uICYmXG4gICAgICBnbG9iYWwubmcuY29tbW9uLmxvY2FsZXMgJiZcbiAgICAgIGdsb2JhbC5uZy5jb21tb24ubG9jYWxlc1tub3JtYWxpemVkTG9jYWxlXTtcbiAgfVxuICByZXR1cm4gTE9DQUxFX0RBVEFbbm9ybWFsaXplZExvY2FsZV07XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHJlbW92ZSBhbGwgdGhlIGxvY2FsZSBkYXRhIGZyb20gYExPQ0FMRV9EQVRBYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVucmVnaXN0ZXJBbGxMb2NhbGVEYXRhKCkge1xuICBMT0NBTEVfREFUQSA9IHt9O1xufVxuXG4vKipcbiAqIEluZGV4IG9mIGVhY2ggdHlwZSBvZiBsb2NhbGUgZGF0YSBmcm9tIHRoZSBsb2NhbGUgZGF0YSBhcnJheVxuICovXG5leHBvcnQgZW51bSBMb2NhbGVEYXRhSW5kZXgge1xuICBMb2NhbGVJZCA9IDAsXG4gIERheVBlcmlvZHNGb3JtYXQsXG4gIERheVBlcmlvZHNTdGFuZGFsb25lLFxuICBEYXlzRm9ybWF0LFxuICBEYXlzU3RhbmRhbG9uZSxcbiAgTW9udGhzRm9ybWF0LFxuICBNb250aHNTdGFuZGFsb25lLFxuICBFcmFzLFxuICBGaXJzdERheU9mV2VlayxcbiAgV2Vla2VuZFJhbmdlLFxuICBEYXRlRm9ybWF0LFxuICBUaW1lRm9ybWF0LFxuICBEYXRlVGltZUZvcm1hdCxcbiAgTnVtYmVyU3ltYm9scyxcbiAgTnVtYmVyRm9ybWF0cyxcbiAgQ3VycmVuY3lDb2RlLFxuICBDdXJyZW5jeVN5bWJvbCxcbiAgQ3VycmVuY3lOYW1lLFxuICBDdXJyZW5jaWVzLFxuICBEaXJlY3Rpb25hbGl0eSxcbiAgUGx1cmFsQ2FzZSxcbiAgRXh0cmFEYXRhLFxufVxuXG4vKipcbiAqIEluZGV4IG9mIGVhY2ggdHlwZSBvZiBsb2NhbGUgZGF0YSBmcm9tIHRoZSBleHRyYSBsb2NhbGUgZGF0YSBhcnJheVxuICovXG5leHBvcnQgY29uc3QgZW51bSBFeHRyYUxvY2FsZURhdGFJbmRleCB7XG4gIEV4dHJhRGF5UGVyaW9kRm9ybWF0cyA9IDAsXG4gIEV4dHJhRGF5UGVyaW9kU3RhbmRhbG9uZSxcbiAgRXh0cmFEYXlQZXJpb2RzUnVsZXMsXG59XG5cbi8qKlxuICogSW5kZXggb2YgZWFjaCB2YWx1ZSBpbiBjdXJyZW5jeSBkYXRhICh1c2VkIHRvIGRlc2NyaWJlIENVUlJFTkNJRVNfRU4gaW4gY3VycmVuY2llcy50cylcbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gQ3VycmVuY3lJbmRleCB7XG4gIFN5bWJvbCA9IDAsXG4gIFN5bWJvbE5hcnJvdyxcbiAgTmJPZkRpZ2l0cyxcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjYW5vbmljYWwgZm9ybSBvZiBhIGxvY2FsZSBuYW1lIC0gbG93ZXJjYXNlIHdpdGggYF9gIHJlcGxhY2VkIHdpdGggYC1gLlxuICovXG5mdW5jdGlvbiBub3JtYWxpemVMb2NhbGUobG9jYWxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbG9jYWxlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXy9nLCAnLScpO1xufVxuIl19