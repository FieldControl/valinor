/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HighContrastModeDetector } from '@angular/cdk/a11y';
import { BidiModule } from '@angular/cdk/bidi';
import { inject, Inject, InjectionToken, NgModule, Optional } from '@angular/core';
import { VERSION as CDK_VERSION } from '@angular/cdk';
import { DOCUMENT } from '@angular/common';
import { Platform, _isTestEnvironment } from '@angular/cdk/platform';
import { VERSION } from '../version';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/a11y";
/** @docs-private */
export function MATERIAL_SANITY_CHECKS_FACTORY() {
    return true;
}
/** Injection token that configures whether the Material sanity checks are enabled. */
export const MATERIAL_SANITY_CHECKS = new InjectionToken('mat-sanity-checks', {
    providedIn: 'root',
    factory: MATERIAL_SANITY_CHECKS_FACTORY,
});
/**
 * Module that captures anything that should be loaded and/or run for *all* Angular Material
 * components. This includes Bidi, etc.
 *
 * This module should be imported to each top-level component module (e.g., MatTabsModule).
 */
export class MatCommonModule {
    constructor(highContrastModeDetector, _sanityChecks, _document) {
        this._sanityChecks = _sanityChecks;
        this._document = _document;
        /** Whether we've done the global sanity checks (e.g. a theme is loaded, there is a doctype). */
        this._hasDoneGlobalChecks = false;
        // While A11yModule also does this, we repeat it here to avoid importing A11yModule
        // in MatCommonModule.
        highContrastModeDetector._applyBodyHighContrastModeCssClasses();
        if (!this._hasDoneGlobalChecks) {
            this._hasDoneGlobalChecks = true;
            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                // Inject in here so the reference to `Platform` can be removed in production mode.
                const platform = inject(Platform, { optional: true });
                if (this._checkIsEnabled('doctype')) {
                    _checkDoctypeIsDefined(this._document);
                }
                if (this._checkIsEnabled('theme')) {
                    _checkThemeIsPresent(this._document, !!platform?.isBrowser);
                }
                if (this._checkIsEnabled('version')) {
                    _checkCdkVersionMatch();
                }
            }
        }
    }
    /** Gets whether a specific sanity check is enabled. */
    _checkIsEnabled(name) {
        if (_isTestEnvironment()) {
            return false;
        }
        if (typeof this._sanityChecks === 'boolean') {
            return this._sanityChecks;
        }
        return !!this._sanityChecks[name];
    }
}
MatCommonModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatCommonModule, deps: [{ token: i1.HighContrastModeDetector }, { token: MATERIAL_SANITY_CHECKS, optional: true }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.NgModule });
MatCommonModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatCommonModule, imports: [BidiModule], exports: [BidiModule] });
MatCommonModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatCommonModule, imports: [BidiModule, BidiModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: MatCommonModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [BidiModule],
                    exports: [BidiModule],
                }]
        }], ctorParameters: function () { return [{ type: i1.HighContrastModeDetector }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [MATERIAL_SANITY_CHECKS]
                }] }, { type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
/** Checks that the page has a doctype. */
function _checkDoctypeIsDefined(doc) {
    if (!doc.doctype) {
        console.warn('Current document does not have a doctype. This may cause ' +
            'some Angular Material components not to behave as expected.');
    }
}
/** Checks that a theme has been included. */
function _checkThemeIsPresent(doc, isBrowser) {
    // We need to assert that the `body` is defined, because these checks run very early
    // and the `body` won't be defined if the consumer put their scripts in the `head`.
    if (!doc.body || !isBrowser) {
        return;
    }
    const testElement = doc.createElement('div');
    testElement.classList.add('mat-theme-loaded-marker');
    doc.body.appendChild(testElement);
    const computedStyle = getComputedStyle(testElement);
    // In some situations the computed style of the test element can be null. For example in
    // Firefox, the computed style is null if an application is running inside of a hidden iframe.
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
    if (computedStyle && computedStyle.display !== 'none') {
        console.warn('Could not find Angular Material core theme. Most Material ' +
            'components may not work as expected. For more info refer ' +
            'to the theming guide: https://material.angular.io/guide/theming');
    }
    testElement.remove();
}
/** Checks whether the Material version matches the CDK version. */
function _checkCdkVersionMatch() {
    if (VERSION.full !== CDK_VERSION.full) {
        console.warn('The Angular Material version (' +
            VERSION.full +
            ') does not match ' +
            'the Angular CDK version (' +
            CDK_VERSION.full +
            ').\n' +
            'Please ensure the versions of these two packages exactly match.');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jb3JlL2NvbW1vbi1iZWhhdmlvcnMvY29tbW9uLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUMzRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDN0MsT0FBTyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDakYsT0FBTyxFQUFDLE9BQU8sSUFBSSxXQUFXLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDcEQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxRQUFRLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNuRSxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDOzs7QUFFbkMsb0JBQW9CO0FBQ3BCLE1BQU0sVUFBVSw4QkFBOEI7SUFDNUMsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsc0ZBQXNGO0FBQ3RGLE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHLElBQUksY0FBYyxDQUFlLG1CQUFtQixFQUFFO0lBQzFGLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSw4QkFBOEI7Q0FDeEMsQ0FBQyxDQUFDO0FBZUg7Ozs7O0dBS0c7QUFLSCxNQUFNLE9BQU8sZUFBZTtJQUkxQixZQUNFLHdCQUFrRCxFQUNFLGFBQTJCLEVBQ3JELFNBQW1CO1FBRE8sa0JBQWEsR0FBYixhQUFhLENBQWM7UUFDckQsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQU4vQyxnR0FBZ0c7UUFDeEYseUJBQW9CLEdBQUcsS0FB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Q3ZCLENBQUM7QUFFRCxtRUFBbUU7QUFDbkUsU0FBUyxxQkFBcUI7SUFDNUIsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxJQUFJLEVBQUU7UUFDckMsT0FBTyxDQUFDLElBQUksQ0FDVixnQ0FBZ0M7WUFDOUIsT0FBTyxDQUFDLElBQUk7WUFDWixtQkFBbUI7WUFDbkIsMkJBQTJCO1lBQzNCLFdBQVcsQ0FBQyxJQUFJO1lBQ2hCLE1BQU07WUFDTixpRUFBaUUsQ0FDcEUsQ0FBQztLQUNIO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0hpZ2hDb250cmFzdE1vZGVEZXRlY3Rvcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtCaWRpTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge2luamVjdCwgSW5qZWN0LCBJbmplY3Rpb25Ub2tlbiwgTmdNb2R1bGUsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7VkVSU0lPTiBhcyBDREtfVkVSU0lPTn0gZnJvbSAnQGFuZ3VsYXIvY2RrJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1BsYXRmb3JtLCBfaXNUZXN0RW52aXJvbm1lbnR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge1ZFUlNJT059IGZyb20gJy4uL3ZlcnNpb24nO1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1BVEVSSUFMX1NBTklUWV9DSEVDS1NfRkFDVE9SWSgpOiBTYW5pdHlDaGVja3Mge1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNvbmZpZ3VyZXMgd2hldGhlciB0aGUgTWF0ZXJpYWwgc2FuaXR5IGNoZWNrcyBhcmUgZW5hYmxlZC4gKi9cbmV4cG9ydCBjb25zdCBNQVRFUklBTF9TQU5JVFlfQ0hFQ0tTID0gbmV3IEluamVjdGlvblRva2VuPFNhbml0eUNoZWNrcz4oJ21hdC1zYW5pdHktY2hlY2tzJywge1xuICBwcm92aWRlZEluOiAncm9vdCcsXG4gIGZhY3Rvcnk6IE1BVEVSSUFMX1NBTklUWV9DSEVDS1NfRkFDVE9SWSxcbn0pO1xuXG4vKipcbiAqIFBvc3NpYmxlIHNhbml0eSBjaGVja3MgdGhhdCBjYW4gYmUgZW5hYmxlZC4gSWYgc2V0IHRvXG4gKiB0cnVlL2ZhbHNlLCBhbGwgY2hlY2tzIHdpbGwgYmUgZW5hYmxlZC9kaXNhYmxlZC5cbiAqL1xuZXhwb3J0IHR5cGUgU2FuaXR5Q2hlY2tzID0gYm9vbGVhbiB8IEdyYW51bGFyU2FuaXR5Q2hlY2tzO1xuXG4vKiogT2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gY29uZmlndXJlIHRoZSBzYW5pdHkgY2hlY2tzIGdyYW51bGFybHkuICovXG5leHBvcnQgaW50ZXJmYWNlIEdyYW51bGFyU2FuaXR5Q2hlY2tzIHtcbiAgZG9jdHlwZTogYm9vbGVhbjtcbiAgdGhlbWU6IGJvb2xlYW47XG4gIHZlcnNpb246IGJvb2xlYW47XG59XG5cbi8qKlxuICogTW9kdWxlIHRoYXQgY2FwdHVyZXMgYW55dGhpbmcgdGhhdCBzaG91bGQgYmUgbG9hZGVkIGFuZC9vciBydW4gZm9yICphbGwqIEFuZ3VsYXIgTWF0ZXJpYWxcbiAqIGNvbXBvbmVudHMuIFRoaXMgaW5jbHVkZXMgQmlkaSwgZXRjLlxuICpcbiAqIFRoaXMgbW9kdWxlIHNob3VsZCBiZSBpbXBvcnRlZCB0byBlYWNoIHRvcC1sZXZlbCBjb21wb25lbnQgbW9kdWxlIChlLmcuLCBNYXRUYWJzTW9kdWxlKS5cbiAqL1xuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW0JpZGlNb2R1bGVdLFxuICBleHBvcnRzOiBbQmlkaU1vZHVsZV0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdENvbW1vbk1vZHVsZSB7XG4gIC8qKiBXaGV0aGVyIHdlJ3ZlIGRvbmUgdGhlIGdsb2JhbCBzYW5pdHkgY2hlY2tzIChlLmcuIGEgdGhlbWUgaXMgbG9hZGVkLCB0aGVyZSBpcyBhIGRvY3R5cGUpLiAqL1xuICBwcml2YXRlIF9oYXNEb25lR2xvYmFsQ2hlY2tzID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgaGlnaENvbnRyYXN0TW9kZURldGVjdG9yOiBIaWdoQ29udHJhc3RNb2RlRGV0ZWN0b3IsXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChNQVRFUklBTF9TQU5JVFlfQ0hFQ0tTKSBwcml2YXRlIF9zYW5pdHlDaGVja3M6IFNhbml0eUNoZWNrcyxcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIF9kb2N1bWVudDogRG9jdW1lbnQsXG4gICkge1xuICAgIC8vIFdoaWxlIEExMXlNb2R1bGUgYWxzbyBkb2VzIHRoaXMsIHdlIHJlcGVhdCBpdCBoZXJlIHRvIGF2b2lkIGltcG9ydGluZyBBMTF5TW9kdWxlXG4gICAgLy8gaW4gTWF0Q29tbW9uTW9kdWxlLlxuICAgIGhpZ2hDb250cmFzdE1vZGVEZXRlY3Rvci5fYXBwbHlCb2R5SGlnaENvbnRyYXN0TW9kZUNzc0NsYXNzZXMoKTtcblxuICAgIGlmICghdGhpcy5faGFzRG9uZUdsb2JhbENoZWNrcykge1xuICAgICAgdGhpcy5faGFzRG9uZUdsb2JhbENoZWNrcyA9IHRydWU7XG5cbiAgICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgICAgLy8gSW5qZWN0IGluIGhlcmUgc28gdGhlIHJlZmVyZW5jZSB0byBgUGxhdGZvcm1gIGNhbiBiZSByZW1vdmVkIGluIHByb2R1Y3Rpb24gbW9kZS5cbiAgICAgICAgY29uc3QgcGxhdGZvcm0gPSBpbmplY3QoUGxhdGZvcm0sIHtvcHRpb25hbDogdHJ1ZX0pO1xuXG4gICAgICAgIGlmICh0aGlzLl9jaGVja0lzRW5hYmxlZCgnZG9jdHlwZScpKSB7XG4gICAgICAgICAgX2NoZWNrRG9jdHlwZUlzRGVmaW5lZCh0aGlzLl9kb2N1bWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fY2hlY2tJc0VuYWJsZWQoJ3RoZW1lJykpIHtcbiAgICAgICAgICBfY2hlY2tUaGVtZUlzUHJlc2VudCh0aGlzLl9kb2N1bWVudCwgISFwbGF0Zm9ybT8uaXNCcm93c2VyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9jaGVja0lzRW5hYmxlZCgndmVyc2lvbicpKSB7XG4gICAgICAgICAgX2NoZWNrQ2RrVmVyc2lvbk1hdGNoKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIGEgc3BlY2lmaWMgc2FuaXR5IGNoZWNrIGlzIGVuYWJsZWQuICovXG4gIHByaXZhdGUgX2NoZWNrSXNFbmFibGVkKG5hbWU6IGtleW9mIEdyYW51bGFyU2FuaXR5Q2hlY2tzKTogYm9vbGVhbiB7XG4gICAgaWYgKF9pc1Rlc3RFbnZpcm9ubWVudCgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLl9zYW5pdHlDaGVja3MgPT09ICdib29sZWFuJykge1xuICAgICAgcmV0dXJuIHRoaXMuX3Nhbml0eUNoZWNrcztcbiAgICB9XG5cbiAgICByZXR1cm4gISF0aGlzLl9zYW5pdHlDaGVja3NbbmFtZV07XG4gIH1cbn1cblxuLyoqIENoZWNrcyB0aGF0IHRoZSBwYWdlIGhhcyBhIGRvY3R5cGUuICovXG5mdW5jdGlvbiBfY2hlY2tEb2N0eXBlSXNEZWZpbmVkKGRvYzogRG9jdW1lbnQpOiB2b2lkIHtcbiAgaWYgKCFkb2MuZG9jdHlwZSkge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgICdDdXJyZW50IGRvY3VtZW50IGRvZXMgbm90IGhhdmUgYSBkb2N0eXBlLiBUaGlzIG1heSBjYXVzZSAnICtcbiAgICAgICAgJ3NvbWUgQW5ndWxhciBNYXRlcmlhbCBjb21wb25lbnRzIG5vdCB0byBiZWhhdmUgYXMgZXhwZWN0ZWQuJyxcbiAgICApO1xuICB9XG59XG5cbi8qKiBDaGVja3MgdGhhdCBhIHRoZW1lIGhhcyBiZWVuIGluY2x1ZGVkLiAqL1xuZnVuY3Rpb24gX2NoZWNrVGhlbWVJc1ByZXNlbnQoZG9jOiBEb2N1bWVudCwgaXNCcm93c2VyOiBib29sZWFuKTogdm9pZCB7XG4gIC8vIFdlIG5lZWQgdG8gYXNzZXJ0IHRoYXQgdGhlIGBib2R5YCBpcyBkZWZpbmVkLCBiZWNhdXNlIHRoZXNlIGNoZWNrcyBydW4gdmVyeSBlYXJseVxuICAvLyBhbmQgdGhlIGBib2R5YCB3b24ndCBiZSBkZWZpbmVkIGlmIHRoZSBjb25zdW1lciBwdXQgdGhlaXIgc2NyaXB0cyBpbiB0aGUgYGhlYWRgLlxuICBpZiAoIWRvYy5ib2R5IHx8ICFpc0Jyb3dzZXIpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB0ZXN0RWxlbWVudCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdGVzdEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbWF0LXRoZW1lLWxvYWRlZC1tYXJrZXInKTtcbiAgZG9jLmJvZHkuYXBwZW5kQ2hpbGQodGVzdEVsZW1lbnQpO1xuXG4gIGNvbnN0IGNvbXB1dGVkU3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKHRlc3RFbGVtZW50KTtcblxuICAvLyBJbiBzb21lIHNpdHVhdGlvbnMgdGhlIGNvbXB1dGVkIHN0eWxlIG9mIHRoZSB0ZXN0IGVsZW1lbnQgY2FuIGJlIG51bGwuIEZvciBleGFtcGxlIGluXG4gIC8vIEZpcmVmb3gsIHRoZSBjb21wdXRlZCBzdHlsZSBpcyBudWxsIGlmIGFuIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW5zaWRlIG9mIGEgaGlkZGVuIGlmcmFtZS5cbiAgLy8gU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD01NDgzOTdcbiAgaWYgKGNvbXB1dGVkU3R5bGUgJiYgY29tcHV0ZWRTdHlsZS5kaXNwbGF5ICE9PSAnbm9uZScpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnQ291bGQgbm90IGZpbmQgQW5ndWxhciBNYXRlcmlhbCBjb3JlIHRoZW1lLiBNb3N0IE1hdGVyaWFsICcgK1xuICAgICAgICAnY29tcG9uZW50cyBtYXkgbm90IHdvcmsgYXMgZXhwZWN0ZWQuIEZvciBtb3JlIGluZm8gcmVmZXIgJyArXG4gICAgICAgICd0byB0aGUgdGhlbWluZyBndWlkZTogaHR0cHM6Ly9tYXRlcmlhbC5hbmd1bGFyLmlvL2d1aWRlL3RoZW1pbmcnLFxuICAgICk7XG4gIH1cblxuICB0ZXN0RWxlbWVudC5yZW1vdmUoKTtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBNYXRlcmlhbCB2ZXJzaW9uIG1hdGNoZXMgdGhlIENESyB2ZXJzaW9uLiAqL1xuZnVuY3Rpb24gX2NoZWNrQ2RrVmVyc2lvbk1hdGNoKCk6IHZvaWQge1xuICBpZiAoVkVSU0lPTi5mdWxsICE9PSBDREtfVkVSU0lPTi5mdWxsKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgJ1RoZSBBbmd1bGFyIE1hdGVyaWFsIHZlcnNpb24gKCcgK1xuICAgICAgICBWRVJTSU9OLmZ1bGwgK1xuICAgICAgICAnKSBkb2VzIG5vdCBtYXRjaCAnICtcbiAgICAgICAgJ3RoZSBBbmd1bGFyIENESyB2ZXJzaW9uICgnICtcbiAgICAgICAgQ0RLX1ZFUlNJT04uZnVsbCArXG4gICAgICAgICcpLlxcbicgK1xuICAgICAgICAnUGxlYXNlIGVuc3VyZSB0aGUgdmVyc2lvbnMgb2YgdGhlc2UgdHdvIHBhY2thZ2VzIGV4YWN0bHkgbWF0Y2guJyxcbiAgICApO1xuICB9XG59XG4iXX0=