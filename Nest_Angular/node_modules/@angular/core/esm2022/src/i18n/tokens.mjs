/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken } from '../di/injection_token';
import { inject } from '../di/injector_compatibility';
import { InjectFlags } from '../di/interface/injector';
import { DEFAULT_LOCALE_ID, USD_CURRENCY_CODE } from './localization';
/**
 * Work out the locale from the potential global properties.
 *
 * * Closure Compiler: use `goog.LOCALE`.
 * * Ivy enabled: use `$localize.locale`
 */
export function getGlobalLocale() {
    if (typeof ngI18nClosureMode !== 'undefined' &&
        ngI18nClosureMode &&
        typeof goog !== 'undefined' &&
        goog.LOCALE !== 'en') {
        // * The default `goog.LOCALE` value is `en`, while Angular used `en-US`.
        // * In order to preserve backwards compatibility, we use Angular default value over
        //   Closure Compiler's one.
        return goog.LOCALE;
    }
    else {
        // KEEP `typeof $localize !== 'undefined' && $localize.locale` IN SYNC WITH THE LOCALIZE
        // COMPILE-TIME INLINER.
        //
        // * During compile time inlining of translations the expression will be replaced
        //   with a string literal that is the current locale. Other forms of this expression are not
        //   guaranteed to be replaced.
        //
        // * During runtime translation evaluation, the developer is required to set `$localize.locale`
        //   if required, or just to provide their own `LOCALE_ID` provider.
        return (typeof $localize !== 'undefined' && $localize.locale) || DEFAULT_LOCALE_ID;
    }
}
/**
 * Provide this token to set the locale of your application.
 * It is used for i18n extraction, by i18n pipes (DatePipe, I18nPluralPipe, CurrencyPipe,
 * DecimalPipe and PercentPipe) and by ICU expressions.
 *
 * See the [i18n guide](guide/i18n/locale-id) for more information.
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * import { LOCALE_ID } from '@angular/core';
 * import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   providers: [{provide: LOCALE_ID, useValue: 'en-US' }]
 * });
 * ```
 *
 * @publicApi
 */
export const LOCALE_ID = new InjectionToken(ngDevMode ? 'LocaleId' : '', {
    providedIn: 'root',
    factory: () => inject(LOCALE_ID, InjectFlags.Optional | InjectFlags.SkipSelf) || getGlobalLocale(),
});
/**
 * Provide this token to set the default currency code your application uses for
 * CurrencyPipe when there is no currency code passed into it. This is only used by
 * CurrencyPipe and has no relation to locale currency. Defaults to USD if not configured.
 *
 * See the [i18n guide](guide/i18n/locale-id) for more information.
 *
 * <div class="alert is-helpful">
 *
 * **Deprecation notice:**
 *
 * The default currency code is currently always `USD` but this is deprecated from v9.
 *
 * **In v10 the default currency code will be taken from the current locale.**
 *
 * If you need the previous behavior then set it by creating a `DEFAULT_CURRENCY_CODE` provider in
 * your application `NgModule`:
 *
 * ```ts
 * {provide: DEFAULT_CURRENCY_CODE, useValue: 'USD'}
 * ```
 *
 * </div>
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   providers: [{provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }]
 * });
 * ```
 *
 * @publicApi
 */
export const DEFAULT_CURRENCY_CODE = new InjectionToken(ngDevMode ? 'DefaultCurrencyCode' : '', {
    providedIn: 'root',
    factory: () => USD_CURRENCY_CODE,
});
/**
 * Use this token at bootstrap to provide the content of your translation file (`xtb`,
 * `xlf` or `xlf2`) when you want to translate your application in another language.
 *
 * See the [i18n guide](guide/i18n/merge) for more information.
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * import { TRANSLATIONS } from '@angular/core';
 * import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 *
 * // content of your translation file
 * const translations = '....';
 *
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   providers: [{provide: TRANSLATIONS, useValue: translations }]
 * });
 * ```
 *
 * @publicApi
 */
export const TRANSLATIONS = new InjectionToken(ngDevMode ? 'Translations' : '');
/**
 * Provide this token at bootstrap to set the format of your {@link TRANSLATIONS}: `xtb`,
 * `xlf` or `xlf2`.
 *
 * See the [i18n guide](guide/i18n/merge) for more information.
 *
 * @usageNotes
 * ### Example
 *
 * ```typescript
 * import { TRANSLATIONS_FORMAT } from '@angular/core';
 * import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   providers: [{provide: TRANSLATIONS_FORMAT, useValue: 'xlf' }]
 * });
 * ```
 *
 * @publicApi
 */
export const TRANSLATIONS_FORMAT = new InjectionToken(ngDevMode ? 'TranslationsFormat' : '');
/**
 * Use this enum at bootstrap as an option of `bootstrapModule` to define the strategy
 * that the compiler should use in case of missing translations:
 * - Error: throw if you have missing translations.
 * - Warning (default): show a warning in the console and/or shell.
 * - Ignore: do nothing.
 *
 * See the [i18n guide](guide/i18n/merge#report-missing-translations) for more information.
 *
 * @usageNotes
 * ### Example
 * ```typescript
 * import { MissingTranslationStrategy } from '@angular/core';
 * import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowserDynamic().bootstrapModule(AppModule, {
 *   missingTranslation: MissingTranslationStrategy.Error
 * });
 * ```
 *
 * @publicApi
 */
export var MissingTranslationStrategy;
(function (MissingTranslationStrategy) {
    MissingTranslationStrategy[MissingTranslationStrategy["Error"] = 0] = "Error";
    MissingTranslationStrategy[MissingTranslationStrategy["Warning"] = 1] = "Warning";
    MissingTranslationStrategy[MissingTranslationStrategy["Ignore"] = 2] = "Ignore";
})(MissingTranslationStrategy || (MissingTranslationStrategy = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvaTE4bi90b2tlbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFFckQsT0FBTyxFQUFDLGlCQUFpQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFJcEU7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUsZUFBZTtJQUM3QixJQUNFLE9BQU8saUJBQWlCLEtBQUssV0FBVztRQUN4QyxpQkFBaUI7UUFDakIsT0FBTyxJQUFJLEtBQUssV0FBVztRQUMzQixJQUFJLENBQUMsTUFBTSxLQUFLLElBQUksRUFDcEIsQ0FBQztRQUNELHlFQUF5RTtRQUN6RSxvRkFBb0Y7UUFDcEYsNEJBQTRCO1FBQzVCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNyQixDQUFDO1NBQU0sQ0FBQztRQUNOLHdGQUF3RjtRQUN4Rix3QkFBd0I7UUFDeEIsRUFBRTtRQUNGLGlGQUFpRjtRQUNqRiw2RkFBNkY7UUFDN0YsK0JBQStCO1FBQy9CLEVBQUU7UUFDRiwrRkFBK0Y7UUFDL0Ysb0VBQW9FO1FBQ3BFLE9BQU8sQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLGlCQUFpQixDQUFDO0lBQ3JGLENBQUM7QUFDSCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCRztBQUNILE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBMkIsSUFBSSxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtJQUMvRixVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQ1osTUFBTSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxlQUFlLEVBQUU7Q0FDdEYsQ0FBQyxDQUFDO0FBRUg7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQ0c7QUFDSCxNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLGNBQWMsQ0FDckQsU0FBUyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUN0QztJQUNFLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUI7Q0FDakMsQ0FDRixDQUFDO0FBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksY0FBYyxDQUFTLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUV4Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkc7QUFDSCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLGNBQWMsQ0FDbkQsU0FBUyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUN0QyxDQUFDO0FBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7QUFDSCxNQUFNLENBQU4sSUFBWSwwQkFJWDtBQUpELFdBQVksMEJBQTBCO0lBQ3BDLDZFQUFTLENBQUE7SUFDVCxpRkFBVyxDQUFBO0lBQ1gsK0VBQVUsQ0FBQTtBQUNaLENBQUMsRUFKVywwQkFBMEIsS0FBMUIsMEJBQTBCLFFBSXJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGlvblRva2VufSBmcm9tICcuLi9kaS9pbmplY3Rpb25fdG9rZW4nO1xuaW1wb3J0IHtpbmplY3R9IGZyb20gJy4uL2RpL2luamVjdG9yX2NvbXBhdGliaWxpdHknO1xuaW1wb3J0IHtJbmplY3RGbGFnc30gZnJvbSAnLi4vZGkvaW50ZXJmYWNlL2luamVjdG9yJztcblxuaW1wb3J0IHtERUZBVUxUX0xPQ0FMRV9JRCwgVVNEX0NVUlJFTkNZX0NPREV9IGZyb20gJy4vbG9jYWxpemF0aW9uJztcblxuZGVjbGFyZSBjb25zdCAkbG9jYWxpemU6IHtsb2NhbGU/OiBzdHJpbmd9O1xuXG4vKipcbiAqIFdvcmsgb3V0IHRoZSBsb2NhbGUgZnJvbSB0aGUgcG90ZW50aWFsIGdsb2JhbCBwcm9wZXJ0aWVzLlxuICpcbiAqICogQ2xvc3VyZSBDb21waWxlcjogdXNlIGBnb29nLkxPQ0FMRWAuXG4gKiAqIEl2eSBlbmFibGVkOiB1c2UgYCRsb2NhbGl6ZS5sb2NhbGVgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRHbG9iYWxMb2NhbGUoKTogc3RyaW5nIHtcbiAgaWYgKFxuICAgIHR5cGVvZiBuZ0kxOG5DbG9zdXJlTW9kZSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICBuZ0kxOG5DbG9zdXJlTW9kZSAmJlxuICAgIHR5cGVvZiBnb29nICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIGdvb2cuTE9DQUxFICE9PSAnZW4nXG4gICkge1xuICAgIC8vICogVGhlIGRlZmF1bHQgYGdvb2cuTE9DQUxFYCB2YWx1ZSBpcyBgZW5gLCB3aGlsZSBBbmd1bGFyIHVzZWQgYGVuLVVTYC5cbiAgICAvLyAqIEluIG9yZGVyIHRvIHByZXNlcnZlIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LCB3ZSB1c2UgQW5ndWxhciBkZWZhdWx0IHZhbHVlIG92ZXJcbiAgICAvLyAgIENsb3N1cmUgQ29tcGlsZXIncyBvbmUuXG4gICAgcmV0dXJuIGdvb2cuTE9DQUxFO1xuICB9IGVsc2Uge1xuICAgIC8vIEtFRVAgYHR5cGVvZiAkbG9jYWxpemUgIT09ICd1bmRlZmluZWQnICYmICRsb2NhbGl6ZS5sb2NhbGVgIElOIFNZTkMgV0lUSCBUSEUgTE9DQUxJWkVcbiAgICAvLyBDT01QSUxFLVRJTUUgSU5MSU5FUi5cbiAgICAvL1xuICAgIC8vICogRHVyaW5nIGNvbXBpbGUgdGltZSBpbmxpbmluZyBvZiB0cmFuc2xhdGlvbnMgdGhlIGV4cHJlc3Npb24gd2lsbCBiZSByZXBsYWNlZFxuICAgIC8vICAgd2l0aCBhIHN0cmluZyBsaXRlcmFsIHRoYXQgaXMgdGhlIGN1cnJlbnQgbG9jYWxlLiBPdGhlciBmb3JtcyBvZiB0aGlzIGV4cHJlc3Npb24gYXJlIG5vdFxuICAgIC8vICAgZ3VhcmFudGVlZCB0byBiZSByZXBsYWNlZC5cbiAgICAvL1xuICAgIC8vICogRHVyaW5nIHJ1bnRpbWUgdHJhbnNsYXRpb24gZXZhbHVhdGlvbiwgdGhlIGRldmVsb3BlciBpcyByZXF1aXJlZCB0byBzZXQgYCRsb2NhbGl6ZS5sb2NhbGVgXG4gICAgLy8gICBpZiByZXF1aXJlZCwgb3IganVzdCB0byBwcm92aWRlIHRoZWlyIG93biBgTE9DQUxFX0lEYCBwcm92aWRlci5cbiAgICByZXR1cm4gKHR5cGVvZiAkbG9jYWxpemUgIT09ICd1bmRlZmluZWQnICYmICRsb2NhbGl6ZS5sb2NhbGUpIHx8IERFRkFVTFRfTE9DQUxFX0lEO1xuICB9XG59XG5cbi8qKlxuICogUHJvdmlkZSB0aGlzIHRva2VuIHRvIHNldCB0aGUgbG9jYWxlIG9mIHlvdXIgYXBwbGljYXRpb24uXG4gKiBJdCBpcyB1c2VkIGZvciBpMThuIGV4dHJhY3Rpb24sIGJ5IGkxOG4gcGlwZXMgKERhdGVQaXBlLCBJMThuUGx1cmFsUGlwZSwgQ3VycmVuY3lQaXBlLFxuICogRGVjaW1hbFBpcGUgYW5kIFBlcmNlbnRQaXBlKSBhbmQgYnkgSUNVIGV4cHJlc3Npb25zLlxuICpcbiAqIFNlZSB0aGUgW2kxOG4gZ3VpZGVdKGd1aWRlL2kxOG4vbG9jYWxlLWlkKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBMT0NBTEVfSUQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqIGltcG9ydCB7IHBsYXRmb3JtQnJvd3NlckR5bmFtaWMgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyLWR5bmFtaWMnO1xuICogaW1wb3J0IHsgQXBwTW9kdWxlIH0gZnJvbSAnLi9hcHAvYXBwLm1vZHVsZSc7XG4gKlxuICogcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpLmJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUsIHtcbiAqICAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IExPQ0FMRV9JRCwgdXNlVmFsdWU6ICdlbi1VUycgfV1cbiAqIH0pO1xuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgTE9DQUxFX0lEOiBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+ID0gbmV3IEluamVjdGlvblRva2VuKG5nRGV2TW9kZSA/ICdMb2NhbGVJZCcgOiAnJywge1xuICBwcm92aWRlZEluOiAncm9vdCcsXG4gIGZhY3Rvcnk6ICgpID0+XG4gICAgaW5qZWN0KExPQ0FMRV9JRCwgSW5qZWN0RmxhZ3MuT3B0aW9uYWwgfCBJbmplY3RGbGFncy5Ta2lwU2VsZikgfHwgZ2V0R2xvYmFsTG9jYWxlKCksXG59KTtcblxuLyoqXG4gKiBQcm92aWRlIHRoaXMgdG9rZW4gdG8gc2V0IHRoZSBkZWZhdWx0IGN1cnJlbmN5IGNvZGUgeW91ciBhcHBsaWNhdGlvbiB1c2VzIGZvclxuICogQ3VycmVuY3lQaXBlIHdoZW4gdGhlcmUgaXMgbm8gY3VycmVuY3kgY29kZSBwYXNzZWQgaW50byBpdC4gVGhpcyBpcyBvbmx5IHVzZWQgYnlcbiAqIEN1cnJlbmN5UGlwZSBhbmQgaGFzIG5vIHJlbGF0aW9uIHRvIGxvY2FsZSBjdXJyZW5jeS4gRGVmYXVsdHMgdG8gVVNEIGlmIG5vdCBjb25maWd1cmVkLlxuICpcbiAqIFNlZSB0aGUgW2kxOG4gZ3VpZGVdKGd1aWRlL2kxOG4vbG9jYWxlLWlkKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiA8ZGl2IGNsYXNzPVwiYWxlcnQgaXMtaGVscGZ1bFwiPlxuICpcbiAqICoqRGVwcmVjYXRpb24gbm90aWNlOioqXG4gKlxuICogVGhlIGRlZmF1bHQgY3VycmVuY3kgY29kZSBpcyBjdXJyZW50bHkgYWx3YXlzIGBVU0RgIGJ1dCB0aGlzIGlzIGRlcHJlY2F0ZWQgZnJvbSB2OS5cbiAqXG4gKiAqKkluIHYxMCB0aGUgZGVmYXVsdCBjdXJyZW5jeSBjb2RlIHdpbGwgYmUgdGFrZW4gZnJvbSB0aGUgY3VycmVudCBsb2NhbGUuKipcbiAqXG4gKiBJZiB5b3UgbmVlZCB0aGUgcHJldmlvdXMgYmVoYXZpb3IgdGhlbiBzZXQgaXQgYnkgY3JlYXRpbmcgYSBgREVGQVVMVF9DVVJSRU5DWV9DT0RFYCBwcm92aWRlciBpblxuICogeW91ciBhcHBsaWNhdGlvbiBgTmdNb2R1bGVgOlxuICpcbiAqIGBgYHRzXG4gKiB7cHJvdmlkZTogREVGQVVMVF9DVVJSRU5DWV9DT0RFLCB1c2VWYWx1ZTogJ1VTRCd9XG4gKiBgYGBcbiAqXG4gKiA8L2Rpdj5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBwbGF0Zm9ybUJyb3dzZXJEeW5hbWljIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci1keW5hbWljJztcbiAqIGltcG9ydCB7IEFwcE1vZHVsZSB9IGZyb20gJy4vYXBwL2FwcC5tb2R1bGUnO1xuICpcbiAqIHBsYXRmb3JtQnJvd3NlckR5bmFtaWMoKS5ib290c3RyYXBNb2R1bGUoQXBwTW9kdWxlLCB7XG4gKiAgIHByb3ZpZGVyczogW3twcm92aWRlOiBERUZBVUxUX0NVUlJFTkNZX0NPREUsIHVzZVZhbHVlOiAnRVVSJyB9XVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX0NVUlJFTkNZX0NPREUgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPihcbiAgbmdEZXZNb2RlID8gJ0RlZmF1bHRDdXJyZW5jeUNvZGUnIDogJycsXG4gIHtcbiAgICBwcm92aWRlZEluOiAncm9vdCcsXG4gICAgZmFjdG9yeTogKCkgPT4gVVNEX0NVUlJFTkNZX0NPREUsXG4gIH0sXG4pO1xuXG4vKipcbiAqIFVzZSB0aGlzIHRva2VuIGF0IGJvb3RzdHJhcCB0byBwcm92aWRlIHRoZSBjb250ZW50IG9mIHlvdXIgdHJhbnNsYXRpb24gZmlsZSAoYHh0YmAsXG4gKiBgeGxmYCBvciBgeGxmMmApIHdoZW4geW91IHdhbnQgdG8gdHJhbnNsYXRlIHlvdXIgYXBwbGljYXRpb24gaW4gYW5vdGhlciBsYW5ndWFnZS5cbiAqXG4gKiBTZWUgdGhlIFtpMThuIGd1aWRlXShndWlkZS9pMThuL21lcmdlKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyBUUkFOU0xBVElPTlMgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqIGltcG9ydCB7IHBsYXRmb3JtQnJvd3NlckR5bmFtaWMgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyLWR5bmFtaWMnO1xuICogaW1wb3J0IHsgQXBwTW9kdWxlIH0gZnJvbSAnLi9hcHAvYXBwLm1vZHVsZSc7XG4gKlxuICogLy8gY29udGVudCBvZiB5b3VyIHRyYW5zbGF0aW9uIGZpbGVcbiAqIGNvbnN0IHRyYW5zbGF0aW9ucyA9ICcuLi4uJztcbiAqXG4gKiBwbGF0Zm9ybUJyb3dzZXJEeW5hbWljKCkuYm9vdHN0cmFwTW9kdWxlKEFwcE1vZHVsZSwge1xuICogICBwcm92aWRlcnM6IFt7cHJvdmlkZTogVFJBTlNMQVRJT05TLCB1c2VWYWx1ZTogdHJhbnNsYXRpb25zIH1dXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IFRSQU5TTEFUSU9OUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KG5nRGV2TW9kZSA/ICdUcmFuc2xhdGlvbnMnIDogJycpO1xuXG4vKipcbiAqIFByb3ZpZGUgdGhpcyB0b2tlbiBhdCBib290c3RyYXAgdG8gc2V0IHRoZSBmb3JtYXQgb2YgeW91ciB7QGxpbmsgVFJBTlNMQVRJT05TfTogYHh0YmAsXG4gKiBgeGxmYCBvciBgeGxmMmAuXG4gKlxuICogU2VlIHRoZSBbaTE4biBndWlkZV0oZ3VpZGUvaTE4bi9tZXJnZSkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgVFJBTlNMQVRJT05TX0ZPUk1BVCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuICogaW1wb3J0IHsgcGxhdGZvcm1Ccm93c2VyRHluYW1pYyB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXItZHluYW1pYyc7XG4gKiBpbXBvcnQgeyBBcHBNb2R1bGUgfSBmcm9tICcuL2FwcC9hcHAubW9kdWxlJztcbiAqXG4gKiBwbGF0Zm9ybUJyb3dzZXJEeW5hbWljKCkuYm9vdHN0cmFwTW9kdWxlKEFwcE1vZHVsZSwge1xuICogICBwcm92aWRlcnM6IFt7cHJvdmlkZTogVFJBTlNMQVRJT05TX0ZPUk1BVCwgdXNlVmFsdWU6ICd4bGYnIH1dXG4gKiB9KTtcbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IFRSQU5TTEFUSU9OU19GT1JNQVQgPSBuZXcgSW5qZWN0aW9uVG9rZW48c3RyaW5nPihcbiAgbmdEZXZNb2RlID8gJ1RyYW5zbGF0aW9uc0Zvcm1hdCcgOiAnJyxcbik7XG5cbi8qKlxuICogVXNlIHRoaXMgZW51bSBhdCBib290c3RyYXAgYXMgYW4gb3B0aW9uIG9mIGBib290c3RyYXBNb2R1bGVgIHRvIGRlZmluZSB0aGUgc3RyYXRlZ3lcbiAqIHRoYXQgdGhlIGNvbXBpbGVyIHNob3VsZCB1c2UgaW4gY2FzZSBvZiBtaXNzaW5nIHRyYW5zbGF0aW9uczpcbiAqIC0gRXJyb3I6IHRocm93IGlmIHlvdSBoYXZlIG1pc3NpbmcgdHJhbnNsYXRpb25zLlxuICogLSBXYXJuaW5nIChkZWZhdWx0KTogc2hvdyBhIHdhcm5pbmcgaW4gdGhlIGNvbnNvbGUgYW5kL29yIHNoZWxsLlxuICogLSBJZ25vcmU6IGRvIG5vdGhpbmcuXG4gKlxuICogU2VlIHRoZSBbaTE4biBndWlkZV0oZ3VpZGUvaTE4bi9tZXJnZSNyZXBvcnQtbWlzc2luZy10cmFuc2xhdGlvbnMpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZVxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHsgTWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbiAqIGltcG9ydCB7IHBsYXRmb3JtQnJvd3NlckR5bmFtaWMgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyLWR5bmFtaWMnO1xuICogaW1wb3J0IHsgQXBwTW9kdWxlIH0gZnJvbSAnLi9hcHAvYXBwLm1vZHVsZSc7XG4gKlxuICogcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpLmJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUsIHtcbiAqICAgbWlzc2luZ1RyYW5zbGF0aW9uOiBNaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneS5FcnJvclxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBlbnVtIE1pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5IHtcbiAgRXJyb3IgPSAwLFxuICBXYXJuaW5nID0gMSxcbiAgSWdub3JlID0gMixcbn1cbiJdfQ==