/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HighContrastModeDetector } from '@angular/cdk/a11y';
import { BidiModule } from '@angular/cdk/bidi';
import { Inject, InjectionToken, isDevMode, NgModule, Optional, Version } from '@angular/core';
import { VERSION as CDK_VERSION } from '@angular/cdk';
import { DOCUMENT } from '@angular/common';
// Private version constant to circumvent test/build issues,
// i.e. avoid core to depend on the @angular/material primary entry-point
// Can be removed once the Material primary entry-point no longer
// re-exports all secondary entry-points
const VERSION = new Version('12.0.2');
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
    constructor(highContrastModeDetector, sanityChecks, document) {
        /** Whether we've done the global sanity checks (e.g. a theme is loaded, there is a doctype). */
        this._hasDoneGlobalChecks = false;
        this._document = document;
        // While A11yModule also does this, we repeat it here to avoid importing A11yModule
        // in MatCommonModule.
        highContrastModeDetector._applyBodyHighContrastModeCssClasses();
        // Note that `_sanityChecks` is typed to `any`, because AoT
        // throws an error if we use the `SanityChecks` type directly.
        this._sanityChecks = sanityChecks;
        if (!this._hasDoneGlobalChecks) {
            this._checkDoctypeIsDefined();
            this._checkThemeIsPresent();
            this._checkCdkVersionMatch();
            this._hasDoneGlobalChecks = true;
        }
    }
    /** Use defaultView of injected document if available or fallback to global window reference */
    _getWindow() {
        const win = this._document.defaultView || window;
        return typeof win === 'object' && win ? win : null;
    }
    /** Whether any sanity checks are enabled. */
    _checksAreEnabled() {
        // TODO(crisbeto): we can't use `ngDevMode` here yet, because ViewEngine apps might not support
        // it. Since these checks can have performance implications and they aren't tree shakeable
        // in their current form, we can leave the `isDevMode` check in for now.
        // tslint:disable-next-line:ban
        return isDevMode() && !this._isTestEnv();
    }
    /** Whether the code is running in tests. */
    _isTestEnv() {
        const window = this._getWindow();
        return window && (window.__karma__ || window.jasmine);
    }
    _checkDoctypeIsDefined() {
        const isEnabled = this._checksAreEnabled() &&
            (this._sanityChecks === true || this._sanityChecks.doctype);
        if (isEnabled && !this._document.doctype) {
            console.warn('Current document does not have a doctype. This may cause ' +
                'some Angular Material components not to behave as expected.');
        }
    }
    _checkThemeIsPresent() {
        // We need to assert that the `body` is defined, because these checks run very early
        // and the `body` won't be defined if the consumer put their scripts in the `head`.
        const isDisabled = !this._checksAreEnabled() ||
            (this._sanityChecks === false || !this._sanityChecks.theme);
        if (isDisabled || !this._document.body || typeof getComputedStyle !== 'function') {
            return;
        }
        const testElement = this._document.createElement('div');
        testElement.classList.add('mat-theme-loaded-marker');
        this._document.body.appendChild(testElement);
        const computedStyle = getComputedStyle(testElement);
        // In some situations the computed style of the test element can be null. For example in
        // Firefox, the computed style is null if an application is running inside of a hidden iframe.
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        if (computedStyle && computedStyle.display !== 'none') {
            console.warn('Could not find Angular Material core theme. Most Material ' +
                'components may not work as expected. For more info refer ' +
                'to the theming guide: https://material.angular.io/guide/theming');
        }
        this._document.body.removeChild(testElement);
    }
    /** Checks whether the material version matches the cdk version */
    _checkCdkVersionMatch() {
        const isEnabled = this._checksAreEnabled() &&
            (this._sanityChecks === true || this._sanityChecks.version);
        if (isEnabled && VERSION.full !== CDK_VERSION.full) {
            console.warn('The Angular Material version (' + VERSION.full + ') does not match ' +
                'the Angular CDK version (' + CDK_VERSION.full + ').\n' +
                'Please ensure the versions of these two packages exactly match.');
        }
    }
}
MatCommonModule.decorators = [
    { type: NgModule, args: [{
                imports: [BidiModule],
                exports: [BidiModule],
            },] }
];
MatCommonModule.ctorParameters = () => [
    { type: HighContrastModeDetector },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [MATERIAL_SANITY_CHECKS,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jb3JlL2NvbW1vbi1iZWhhdmlvcnMvY29tbW9uLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUMzRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDN0MsT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzdGLE9BQU8sRUFBQyxPQUFPLElBQUksV0FBVyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3BELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUV6Qyw0REFBNEQ7QUFDNUQseUVBQXlFO0FBQ3pFLGlFQUFpRTtBQUNqRSx3Q0FBd0M7QUFDeEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUVqRCxvQkFBb0I7QUFDcEIsTUFBTSxVQUFVLDhCQUE4QjtJQUM1QyxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFFRCxzRkFBc0Y7QUFDdEYsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxjQUFjLENBQWUsbUJBQW1CLEVBQUU7SUFDMUYsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLDhCQUE4QjtDQUN4QyxDQUFDLENBQUM7QUFlSDs7Ozs7R0FLRztBQUtILE1BQU0sT0FBTyxlQUFlO0lBVTFCLFlBQ0ksd0JBQWtELEVBQ04sWUFBaUIsRUFDM0MsUUFBYTtRQVpuQyxnR0FBZ0c7UUFDeEYseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1FBWW5DLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFB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RTtJQUMxRCxxQkFBcUI7UUFDM0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ3hDLENBQUMsSUFBSSxDQUFDLGFBQWEsS0FBSyxJQUFJLElBQUssSUFBSSxDQUFDLGFBQXNDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFeEYsSUFBSSxTQUFTLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsSUFBSSxFQUFFO1lBQ2xELE9BQU8sQ0FBQyxJQUFJLENBQ1IsZ0NBQWdDLEdBQUcsT0FBTyxDQUFDLElBQUksR0FBRyxtQkFBbUI7Z0JBQ3JFLDJCQUEyQixHQUFHLFdBQVcsQ0FBQyxJQUFJLEdBQUcsTUFBTTtnQkFDdkQsaUVBQWlFLENBQ3BFLENBQUM7U0FDSDtJQUNILENBQUM7OztZQWhIRixRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDO2dCQUNyQixPQUFPLEVBQUUsQ0FBQyxVQUFVLENBQUM7YUFDdEI7OztZQTdDTyx3QkFBd0I7NENBMER6QixRQUFRLFlBQUksTUFBTSxTQUFDLHNCQUFzQjs0Q0FDekMsTUFBTSxTQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIaWdoQ29udHJhc3RNb2RlRGV0ZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcbmltcG9ydCB7QmlkaU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGlvblRva2VuLCBpc0Rldk1vZGUsIE5nTW9kdWxlLCBPcHRpb25hbCwgVmVyc2lvbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1ZFUlNJT04gYXMgQ0RLX1ZFUlNJT059IGZyb20gJ0Bhbmd1bGFyL2Nkayc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG4vLyBQcml2YXRlIHZlcnNpb24gY29uc3RhbnQgdG8gY2lyY3VtdmVudCB0ZXN0L2J1aWxkIGlzc3Vlcyxcbi8vIGkuZS4gYXZvaWQgY29yZSB0byBkZXBlbmQgb24gdGhlIEBhbmd1bGFyL21hdGVyaWFsIHByaW1hcnkgZW50cnktcG9pbnRcbi8vIENhbiBiZSByZW1vdmVkIG9uY2UgdGhlIE1hdGVyaWFsIHByaW1hcnkgZW50cnktcG9pbnQgbm8gbG9uZ2VyXG4vLyByZS1leHBvcnRzIGFsbCBzZWNvbmRhcnkgZW50cnktcG9pbnRzXG5jb25zdCBWRVJTSU9OID0gbmV3IFZlcnNpb24oJzAuMC4wLVBMQUNFSE9MREVSJyk7XG5cbi8qKiBAZG9jcy1wcml2YXRlICovXG5leHBvcnQgZnVuY3Rpb24gTUFURVJJQUxfU0FOSVRZX0NIRUNLU19GQUNUT1JZKCk6IFNhbml0eUNoZWNrcyB7XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRoYXQgY29uZmlndXJlcyB3aGV0aGVyIHRoZSBNYXRlcmlhbCBzYW5pdHkgY2hlY2tzIGFyZSBlbmFibGVkLiAqL1xuZXhwb3J0IGNvbnN0IE1BVEVSSUFMX1NBTklUWV9DSEVDS1MgPSBuZXcgSW5qZWN0aW9uVG9rZW48U2FuaXR5Q2hlY2tzPignbWF0LXNhbml0eS1jaGVja3MnLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogTUFURVJJQUxfU0FOSVRZX0NIRUNLU19GQUNUT1JZLFxufSk7XG5cbi8qKlxuICogUG9zc2libGUgc2FuaXR5IGNoZWNrcyB0aGF0IGNhbiBiZSBlbmFibGVkLiBJZiBzZXQgdG9cbiAqIHRydWUvZmFsc2UsIGFsbCBjaGVja3Mgd2lsbCBiZSBlbmFibGVkL2Rpc2FibGVkLlxuICovXG5leHBvcnQgdHlwZSBTYW5pdHlDaGVja3MgPSBib29sZWFuIHwgR3JhbnVsYXJTYW5pdHlDaGVja3M7XG5cbi8qKiBPYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byBjb25maWd1cmUgdGhlIHNhbml0eSBjaGVja3MgZ3JhbnVsYXJseS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR3JhbnVsYXJTYW5pdHlDaGVja3Mge1xuICBkb2N0eXBlOiBib29sZWFuO1xuICB0aGVtZTogYm9vbGVhbjtcbiAgdmVyc2lvbjogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBNb2R1bGUgdGhhdCBjYXB0dXJlcyBhbnl0aGluZyB0aGF0IHNob3VsZCBiZSBsb2FkZWQgYW5kL29yIHJ1biBmb3IgKmFsbCogQW5ndWxhciBNYXRlcmlhbFxuICogY29tcG9uZW50cy4gVGhpcyBpbmNsdWRlcyBCaWRpLCBldGMuXG4gKlxuICogVGhpcyBtb2R1bGUgc2hvdWxkIGJlIGltcG9ydGVkIHRvIGVhY2ggdG9wLWxldmVsIGNvbXBvbmVudCBtb2R1bGUgKGUuZy4sIE1hdFRhYnNNb2R1bGUpLlxuICovXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQmlkaU1vZHVsZV0sXG4gIGV4cG9ydHM6IFtCaWRpTW9kdWxlXSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0Q29tbW9uTW9kdWxlIHtcbiAgLyoqIFdoZXRoZXIgd2UndmUgZG9uZSB0aGUgZ2xvYmFsIHNhbml0eSBjaGVja3MgKGUuZy4gYSB0aGVtZSBpcyBsb2FkZWQsIHRoZXJlIGlzIGEgZG9jdHlwZSkuICovXG4gIHByaXZhdGUgX2hhc0RvbmVHbG9iYWxDaGVja3MgPSBmYWxzZTtcblxuICAvKiogQ29uZmlndXJlZCBzYW5pdHkgY2hlY2tzLiAqL1xuICBwcml2YXRlIF9zYW5pdHlDaGVja3M6IFNhbml0eUNoZWNrcztcblxuICAvKiogVXNlZCB0byByZWZlcmVuY2UgY29ycmVjdCBkb2N1bWVudC93aW5kb3cgKi9cbiAgcHJvdGVjdGVkIF9kb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBoaWdoQ29udHJhc3RNb2RlRGV0ZWN0b3I6IEhpZ2hDb250cmFzdE1vZGVEZXRlY3RvcixcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUFURVJJQUxfU0FOSVRZX0NIRUNLUykgc2FuaXR5Q2hlY2tzOiBhbnksXG4gICAgICBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55KSB7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBkb2N1bWVudDtcblxuICAgIC8vIFdoaWxlIEExMXlNb2R1bGUgYWxzbyBkb2VzIHRoaXMsIHdlIHJlcGVhdCBpdCBoZXJlIHRvIGF2b2lkIGltcG9ydGluZyBBMTF5TW9kdWxlXG4gICAgLy8gaW4gTWF0Q29tbW9uTW9kdWxlLlxuICAgIGhpZ2hDb250cmFzdE1vZGVEZXRlY3Rvci5fYXBwbHlCb2R5SGlnaENvbnRyYXN0TW9kZUNzc0NsYXNzZXMoKTtcblxuICAgIC8vIE5vdGUgdGhhdCBgX3Nhbml0eUNoZWNrc2AgaXMgdHlwZWQgdG8gYGFueWAsIGJlY2F1c2UgQW9UXG4gICAgLy8gdGhyb3dzIGFuIGVycm9yIGlmIHdlIHVzZSB0aGUgYFNhbml0eUNoZWNrc2AgdHlwZSBkaXJlY3RseS5cbiAgICB0aGlzLl9zYW5pdHlDaGVja3MgPSBzYW5pdHlDaGVja3M7XG5cbiAgICBpZiAoIXRoaXMuX2hhc0RvbmVHbG9iYWxDaGVja3MpIHtcbiAgICAgIHRoaXMuX2NoZWNrRG9jdHlwZUlzRGVmaW5lZCgpO1xuICAgICAgdGhpcy5fY2hlY2tUaGVtZUlzUHJlc2VudCgpO1xuICAgICAgdGhpcy5fY2hlY2tDZGtWZXJzaW9uTWF0Y2goKTtcbiAgICAgIHRoaXMuX2hhc0RvbmVHbG9iYWxDaGVja3MgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBVc2UgZGVmYXVsdFZpZXcgb2YgaW5qZWN0ZWQgZG9jdW1lbnQgaWYgYXZhaWxhYmxlIG9yIGZhbGxiYWNrIHRvIGdsb2JhbCB3aW5kb3cgcmVmZXJlbmNlICovXG4gIHByaXZhdGUgX2dldFdpbmRvdygpOiBXaW5kb3cgfCBudWxsIHtcbiAgICBjb25zdCB3aW4gPSB0aGlzLl9kb2N1bWVudC5kZWZhdWx0VmlldyB8fCB3aW5kb3c7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW4gPT09ICdvYmplY3QnICYmIHdpbiA/IHdpbiA6IG51bGw7XG4gIH1cblxuICAvKiogV2hldGhlciBhbnkgc2FuaXR5IGNoZWNrcyBhcmUgZW5hYmxlZC4gKi9cbiAgcHJpdmF0ZSBfY2hlY2tzQXJlRW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICAvLyBUT0RPKGNyaXNiZXRvKTogd2UgY2FuJ3QgdXNlIGBuZ0Rldk1vZGVgIGhlcmUgeWV0LCBiZWNhdXNlIFZpZXdFbmdpbmUgYXBwcyBtaWdodCBub3Qgc3VwcG9ydFxuICAgIC8vIGl0LiBTaW5jZSB0aGVzZSBjaGVja3MgY2FuIGhhdmUgcGVyZm9ybWFuY2UgaW1wbGljYXRpb25zIGFuZCB0aGV5IGFyZW4ndCB0cmVlIHNoYWtlYWJsZVxuICAgIC8vIGluIHRoZWlyIGN1cnJlbnQgZm9ybSwgd2UgY2FuIGxlYXZlIHRoZSBgaXNEZXZNb2RlYCBjaGVjayBpbiBmb3Igbm93LlxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpiYW5cbiAgICByZXR1cm4gaXNEZXZNb2RlKCkgJiYgIXRoaXMuX2lzVGVzdEVudigpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNvZGUgaXMgcnVubmluZyBpbiB0ZXN0cy4gKi9cbiAgcHJpdmF0ZSBfaXNUZXN0RW52KCkge1xuICAgIGNvbnN0IHdpbmRvdyA9IHRoaXMuX2dldFdpbmRvdygpIGFzIGFueTtcbiAgICByZXR1cm4gd2luZG93ICYmICh3aW5kb3cuX19rYXJtYV9fIHx8IHdpbmRvdy5qYXNtaW5lKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NoZWNrRG9jdHlwZUlzRGVmaW5lZCgpOiB2b2lkIHtcbiAgICBjb25zdCBpc0VuYWJsZWQgPSB0aGlzLl9jaGVja3NBcmVFbmFibGVkKCkgJiZcbiAgICAgICh0aGlzLl9zYW5pdHlDaGVja3MgPT09IHRydWUgfHwgKHRoaXMuX3Nhbml0eUNoZWNrcyBhcyBHcmFudWxhclNhbml0eUNoZWNrcykuZG9jdHlwZSk7XG5cbiAgICBpZiAoaXNFbmFibGVkICYmICF0aGlzLl9kb2N1bWVudC5kb2N0eXBlKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdDdXJyZW50IGRvY3VtZW50IGRvZXMgbm90IGhhdmUgYSBkb2N0eXBlLiBUaGlzIG1heSBjYXVzZSAnICtcbiAgICAgICAgJ3NvbWUgQW5ndWxhciBNYXRlcmlhbCBjb21wb25lbnRzIG5vdCB0byBiZWhhdmUgYXMgZXhwZWN0ZWQuJ1xuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jaGVja1RoZW1lSXNQcmVzZW50KCk6IHZvaWQge1xuICAgIC8vIFdlIG5lZWQgdG8gYXNzZXJ0IHRoYXQgdGhlIGBib2R5YCBpcyBkZWZpbmVkLCBiZWNhdXNlIHRoZXNlIGNoZWNrcyBydW4gdmVyeSBlYXJseVxuICAgIC8vIGFuZCB0aGUgYGJvZHlgIHdvbid0IGJlIGRlZmluZWQgaWYgdGhlIGNvbnN1bWVyIHB1dCB0aGVpciBzY3JpcHRzIGluIHRoZSBgaGVhZGAuXG4gICAgY29uc3QgaXNEaXNhYmxlZCA9ICF0aGlzLl9jaGVja3NBcmVFbmFibGVkKCkgfHxcbiAgICAgICh0aGlzLl9zYW5pdHlDaGVja3MgPT09IGZhbHNlIHx8ICEodGhpcy5fc2FuaXR5Q2hlY2tzIGFzIEdyYW51bGFyU2FuaXR5Q2hlY2tzKS50aGVtZSk7XG5cbiAgICBpZiAoaXNEaXNhYmxlZCB8fCAhdGhpcy5fZG9jdW1lbnQuYm9keSB8fCB0eXBlb2YgZ2V0Q29tcHV0ZWRTdHlsZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRlc3RFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICB0ZXN0RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdtYXQtdGhlbWUtbG9hZGVkLW1hcmtlcicpO1xuICAgIHRoaXMuX2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGVzdEVsZW1lbnQpO1xuXG4gICAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUodGVzdEVsZW1lbnQpO1xuXG4gICAgLy8gSW4gc29tZSBzaXR1YXRpb25zIHRoZSBjb21wdXRlZCBzdHlsZSBvZiB0aGUgdGVzdCBlbGVtZW50IGNhbiBiZSBudWxsLiBGb3IgZXhhbXBsZSBpblxuICAgIC8vIEZpcmVmb3gsIHRoZSBjb21wdXRlZCBzdHlsZSBpcyBudWxsIGlmIGFuIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW5zaWRlIG9mIGEgaGlkZGVuIGlmcmFtZS5cbiAgICAvLyBTZWU6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTU0ODM5N1xuICAgIGlmIChjb21wdXRlZFN0eWxlICYmIGNvbXB1dGVkU3R5bGUuZGlzcGxheSAhPT0gJ25vbmUnKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdDb3VsZCBub3QgZmluZCBBbmd1bGFyIE1hdGVyaWFsIGNvcmUgdGhlbWUuIE1vc3QgTWF0ZXJpYWwgJyArXG4gICAgICAgICdjb21wb25lbnRzIG1heSBub3Qgd29yayBhcyBleHBlY3RlZC4gRm9yIG1vcmUgaW5mbyByZWZlciAnICtcbiAgICAgICAgJ3RvIHRoZSB0aGVtaW5nIGd1aWRlOiBodHRwczovL21hdGVyaWFsLmFuZ3VsYXIuaW8vZ3VpZGUvdGhlbWluZydcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5fZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0ZXN0RWxlbWVudCk7XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIG1hdGVyaWFsIHZlcnNpb24gbWF0Y2hlcyB0aGUgY2RrIHZlcnNpb24gKi9cbiAgcHJpdmF0ZSBfY2hlY2tDZGtWZXJzaW9uTWF0Y2goKTogdm9pZCB7XG4gICAgY29uc3QgaXNFbmFibGVkID0gdGhpcy5fY2hlY2tzQXJlRW5hYmxlZCgpICYmXG4gICAgICAodGhpcy5fc2FuaXR5Q2hlY2tzID09PSB0cnVlIHx8ICh0aGlzLl9zYW5pdHlDaGVja3MgYXMgR3JhbnVsYXJTYW5pdHlDaGVja3MpLnZlcnNpb24pO1xuXG4gICAgaWYgKGlzRW5hYmxlZCAmJiBWRVJTSU9OLmZ1bGwgIT09IENES19WRVJTSU9OLmZ1bGwpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAnVGhlIEFuZ3VsYXIgTWF0ZXJpYWwgdmVyc2lvbiAoJyArIFZFUlNJT04uZnVsbCArICcpIGRvZXMgbm90IG1hdGNoICcgK1xuICAgICAgICAgICd0aGUgQW5ndWxhciBDREsgdmVyc2lvbiAoJyArIENES19WRVJTSU9OLmZ1bGwgKyAnKS5cXG4nICtcbiAgICAgICAgICAnUGxlYXNlIGVuc3VyZSB0aGUgdmVyc2lvbnMgb2YgdGhlc2UgdHdvIHBhY2thZ2VzIGV4YWN0bHkgbWF0Y2guJ1xuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==