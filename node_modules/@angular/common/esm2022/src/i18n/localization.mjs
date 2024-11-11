/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { getLocalePluralCase, Plural } from './locale_data_api';
import * as i0 from "@angular/core";
/**
 * @publicApi
 */
export class NgLocalization {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgLocalization, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgLocalization, providedIn: 'root', useFactory: (locale) => new NgLocaleLocalization(locale), deps: [{ token: LOCALE_ID }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgLocalization, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                    useFactory: (locale) => new NgLocaleLocalization(locale),
                    deps: [LOCALE_ID],
                }]
        }] });
/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 */
export function getPluralCategory(value, cases, ngLocalization, locale) {
    let key = `=${value}`;
    if (cases.indexOf(key) > -1) {
        return key;
    }
    key = ngLocalization.getPluralCategory(value, locale);
    if (cases.indexOf(key) > -1) {
        return key;
    }
    if (cases.indexOf('other') > -1) {
        return 'other';
    }
    throw new Error(`No plural message found for value "${value}"`);
}
/**
 * Returns the plural case based on the locale
 *
 * @publicApi
 */
export class NgLocaleLocalization extends NgLocalization {
    constructor(locale) {
        super();
        this.locale = locale;
    }
    getPluralCategory(value, locale) {
        const plural = getLocalePluralCase(locale || this.locale)(value);
        switch (plural) {
            case Plural.Zero:
                return 'zero';
            case Plural.One:
                return 'one';
            case Plural.Two:
                return 'two';
            case Plural.Few:
                return 'few';
            case Plural.Many:
                return 'many';
            default:
                return 'other';
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgLocaleLocalization, deps: [{ token: LOCALE_ID }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgLocaleLocalization }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: NgLocaleLocalization, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [LOCALE_ID]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFNUQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBQyxNQUFNLG1CQUFtQixDQUFDOztBQUU5RDs7R0FFRztBQU1ILE1BQU0sT0FBZ0IsY0FBYzt5SEFBZCxjQUFjOzZIQUFkLGNBQWMsY0FKdEIsTUFBTSxjQUNOLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxrQkFDekQsU0FBUzs7c0dBRUksY0FBYztrQkFMbkMsVUFBVTttQkFBQztvQkFDVixVQUFVLEVBQUUsTUFBTTtvQkFDbEIsVUFBVSxFQUFFLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxJQUFJLG9CQUFvQixDQUFDLE1BQU0sQ0FBQztvQkFDaEUsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDO2lCQUNsQjs7QUFLRDs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQixDQUMvQixLQUFhLEVBQ2IsS0FBZSxFQUNmLGNBQThCLEVBQzlCLE1BQWU7SUFFZixJQUFJLEdBQUcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0lBRXRCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVCLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUVELEdBQUcsR0FBRyxjQUFjLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRXRELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVCLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2hDLE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2xFLENBQUM7QUFFRDs7OztHQUlHO0FBRUgsTUFBTSxPQUFPLG9CQUFxQixTQUFRLGNBQWM7SUFDdEQsWUFBeUMsTUFBYztRQUNyRCxLQUFLLEVBQUUsQ0FBQztRQUQrQixXQUFNLEdBQU4sTUFBTSxDQUFRO0lBRXZELENBQUM7SUFFUSxpQkFBaUIsQ0FBQyxLQUFVLEVBQUUsTUFBZTtRQUNwRCxNQUFNLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWpFLFFBQVEsTUFBTSxFQUFFLENBQUM7WUFDZixLQUFLLE1BQU0sQ0FBQyxJQUFJO2dCQUNkLE9BQU8sTUFBTSxDQUFDO1lBQ2hCLEtBQUssTUFBTSxDQUFDLEdBQUc7Z0JBQ2IsT0FBTyxLQUFLLENBQUM7WUFDZixLQUFLLE1BQU0sQ0FBQyxHQUFHO2dCQUNiLE9BQU8sS0FBSyxDQUFDO1lBQ2YsS0FBSyxNQUFNLENBQUMsR0FBRztnQkFDYixPQUFPLEtBQUssQ0FBQztZQUNmLEtBQUssTUFBTSxDQUFDLElBQUk7Z0JBQ2QsT0FBTyxNQUFNLENBQUM7WUFDaEI7Z0JBQ0UsT0FBTyxPQUFPLENBQUM7UUFDbkIsQ0FBQztJQUNILENBQUM7eUhBdEJVLG9CQUFvQixrQkFDWCxTQUFTOzZIQURsQixvQkFBb0I7O3NHQUFwQixvQkFBb0I7a0JBRGhDLFVBQVU7OzBCQUVJLE1BQU07MkJBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIExPQ0FMRV9JRH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Z2V0TG9jYWxlUGx1cmFsQ2FzZSwgUGx1cmFsfSBmcm9tICcuL2xvY2FsZV9kYXRhX2FwaSc7XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgdXNlRmFjdG9yeTogKGxvY2FsZTogc3RyaW5nKSA9PiBuZXcgTmdMb2NhbGVMb2NhbGl6YXRpb24obG9jYWxlKSxcbiAgZGVwczogW0xPQ0FMRV9JRF0sXG59KVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5nTG9jYWxpemF0aW9uIHtcbiAgYWJzdHJhY3QgZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWU6IGFueSwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHBsdXJhbCBjYXRlZ29yeSBmb3IgYSBnaXZlbiB2YWx1ZS5cbiAqIC0gXCI9dmFsdWVcIiB3aGVuIHRoZSBjYXNlIGV4aXN0cyxcbiAqIC0gdGhlIHBsdXJhbCBjYXRlZ29yeSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBsdXJhbENhdGVnb3J5KFxuICB2YWx1ZTogbnVtYmVyLFxuICBjYXNlczogc3RyaW5nW10sXG4gIG5nTG9jYWxpemF0aW9uOiBOZ0xvY2FsaXphdGlvbixcbiAgbG9jYWxlPzogc3RyaW5nLFxuKTogc3RyaW5nIHtcbiAgbGV0IGtleSA9IGA9JHt2YWx1ZX1gO1xuXG4gIGlmIChjYXNlcy5pbmRleE9mKGtleSkgPiAtMSkge1xuICAgIHJldHVybiBrZXk7XG4gIH1cblxuICBrZXkgPSBuZ0xvY2FsaXphdGlvbi5nZXRQbHVyYWxDYXRlZ29yeSh2YWx1ZSwgbG9jYWxlKTtcblxuICBpZiAoY2FzZXMuaW5kZXhPZihrZXkpID4gLTEpIHtcbiAgICByZXR1cm4ga2V5O1xuICB9XG5cbiAgaWYgKGNhc2VzLmluZGV4T2YoJ290aGVyJykgPiAtMSkge1xuICAgIHJldHVybiAnb3RoZXInO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKGBObyBwbHVyYWwgbWVzc2FnZSBmb3VuZCBmb3IgdmFsdWUgXCIke3ZhbHVlfVwiYCk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcGx1cmFsIGNhc2UgYmFzZWQgb24gdGhlIGxvY2FsZVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5nTG9jYWxlTG9jYWxpemF0aW9uIGV4dGVuZHMgTmdMb2NhbGl6YXRpb24ge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJvdGVjdGVkIGxvY2FsZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG92ZXJyaWRlIGdldFBsdXJhbENhdGVnb3J5KHZhbHVlOiBhbnksIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgcGx1cmFsID0gZ2V0TG9jYWxlUGx1cmFsQ2FzZShsb2NhbGUgfHwgdGhpcy5sb2NhbGUpKHZhbHVlKTtcblxuICAgIHN3aXRjaCAocGx1cmFsKSB7XG4gICAgICBjYXNlIFBsdXJhbC5aZXJvOlxuICAgICAgICByZXR1cm4gJ3plcm8nO1xuICAgICAgY2FzZSBQbHVyYWwuT25lOlxuICAgICAgICByZXR1cm4gJ29uZSc7XG4gICAgICBjYXNlIFBsdXJhbC5Ud286XG4gICAgICAgIHJldHVybiAndHdvJztcbiAgICAgIGNhc2UgUGx1cmFsLkZldzpcbiAgICAgICAgcmV0dXJuICdmZXcnO1xuICAgICAgY2FzZSBQbHVyYWwuTWFueTpcbiAgICAgICAgcmV0dXJuICdtYW55JztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnb3RoZXInO1xuICAgIH1cbiAgfVxufVxuIl19