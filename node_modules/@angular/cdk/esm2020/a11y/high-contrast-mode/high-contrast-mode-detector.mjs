/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Inject, Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/** CSS class applied to the document body when in black-on-white high-contrast mode. */
export const BLACK_ON_WHITE_CSS_CLASS = 'cdk-high-contrast-black-on-white';
/** CSS class applied to the document body when in white-on-black high-contrast mode. */
export const WHITE_ON_BLACK_CSS_CLASS = 'cdk-high-contrast-white-on-black';
/** CSS class applied to the document body when in high-contrast mode. */
export const HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS = 'cdk-high-contrast-active';
/**
 * Service to determine whether the browser is currently in a high-contrast-mode environment.
 *
 * Microsoft Windows supports an accessibility feature called "High Contrast Mode". This mode
 * changes the appearance of all applications, including web applications, to dramatically increase
 * contrast.
 *
 * IE, Edge, and Firefox currently support this mode. Chrome does not support Windows High Contrast
 * Mode. This service does not detect high-contrast mode as added by the Chrome "High Contrast"
 * browser extension.
 */
export class HighContrastModeDetector {
    constructor(_platform, document) {
        this._platform = _platform;
        this._document = document;
        this._breakpointSubscription = inject(BreakpointObserver)
            .observe('(forced-colors: active)')
            .subscribe(() => {
            if (this._hasCheckedHighContrastMode) {
                this._hasCheckedHighContrastMode = false;
                this._applyBodyHighContrastModeCssClasses();
            }
        });
    }
    /** Gets the current high-contrast-mode for the page. */
    getHighContrastMode() {
        if (!this._platform.isBrowser) {
            return 0 /* HighContrastMode.NONE */;
        }
        // Create a test element with an arbitrary background-color that is neither black nor
        // white; high-contrast mode will coerce the color to either black or white. Also ensure that
        // appending the test element to the DOM does not affect layout by absolutely positioning it
        const testElement = this._document.createElement('div');
        testElement.style.backgroundColor = 'rgb(1,2,3)';
        testElement.style.position = 'absolute';
        this._document.body.appendChild(testElement);
        // Get the computed style for the background color, collapsing spaces to normalize between
        // browsers. Once we get this color, we no longer need the test element. Access the `window`
        // via the document so we can fake it in tests. Note that we have extra null checks, because
        // this logic will likely run during app bootstrap and throwing can break the entire app.
        const documentWindow = this._document.defaultView || window;
        const computedStyle = documentWindow && documentWindow.getComputedStyle
            ? documentWindow.getComputedStyle(testElement)
            : null;
        const computedColor = ((computedStyle && computedStyle.backgroundColor) || '').replace(/ /g, '');
        testElement.remove();
        switch (computedColor) {
            // Pre Windows 11 dark theme.
            case 'rgb(0,0,0)':
            // Windows 11 dark themes.
            case 'rgb(45,50,54)':
            case 'rgb(32,32,32)':
                return 2 /* HighContrastMode.WHITE_ON_BLACK */;
            // Pre Windows 11 light theme.
            case 'rgb(255,255,255)':
            // Windows 11 light theme.
            case 'rgb(255,250,239)':
                return 1 /* HighContrastMode.BLACK_ON_WHITE */;
        }
        return 0 /* HighContrastMode.NONE */;
    }
    ngOnDestroy() {
        this._breakpointSubscription.unsubscribe();
    }
    /** Applies CSS classes indicating high-contrast mode to document body (browser-only). */
    _applyBodyHighContrastModeCssClasses() {
        if (!this._hasCheckedHighContrastMode && this._platform.isBrowser && this._document.body) {
            const bodyClasses = this._document.body.classList;
            bodyClasses.remove(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS, BLACK_ON_WHITE_CSS_CLASS, WHITE_ON_BLACK_CSS_CLASS);
            this._hasCheckedHighContrastMode = true;
            const mode = this.getHighContrastMode();
            if (mode === 1 /* HighContrastMode.BLACK_ON_WHITE */) {
                bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS, BLACK_ON_WHITE_CSS_CLASS);
            }
            else if (mode === 2 /* HighContrastMode.WHITE_ON_BLACK */) {
                bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS, WHITE_ON_BLACK_CSS_CLASS);
            }
        }
    }
}
HighContrastModeDetector.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: HighContrastModeDetector, deps: [{ token: i1.Platform }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable });
HighContrastModeDetector.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: HighContrastModeDetector, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: HighContrastModeDetector, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: function () { return [{ type: i1.Platform }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlnaC1jb250cmFzdC1tb2RlLWRldGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9hMTF5L2hpZ2gtY29udHJhc3QtbW9kZS9oaWdoLWNvbnRyYXN0LW1vZGUtZGV0ZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3BFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7OztBQVV6Qyx3RkFBd0Y7QUFDeEYsTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQUcsa0NBQWtDLENBQUM7QUFFM0Usd0ZBQXdGO0FBQ3hGLE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLGtDQUFrQyxDQUFDO0FBRTNFLHlFQUF5RTtBQUN6RSxNQUFNLENBQUMsTUFBTSxtQ0FBbUMsR0FBRywwQkFBMEIsQ0FBQztBQUU5RTs7Ozs7Ozs7OztHQVVHO0FBRUgsTUFBTSxPQUFPLHdCQUF3QjtJQVNuQyxZQUFvQixTQUFtQixFQUFvQixRQUFhO1FBQXBELGNBQVMsR0FBVCxTQUFTLENBQVU7UUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFFMUIsSUFBSSxDQUFDLHVCQUF1QixHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQzthQUN0RCxPQUFPLENBQUMseUJBQXlCLENBQUM7YUFDbEMsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNkLElBQUksSUFBSSxDQUFDLDJCQUEyQixFQUFFO2dCQUNwQyxJQUFJLENBQUMsMkJBQTJCLEdBQUcsS0FBSyxDQUFDO2dCQUN6QyxJQUFJLENBQUMsb0NB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bCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2luamVjdCwgSW5qZWN0LCBJbmplY3RhYmxlLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtCcmVha3BvaW50T2JzZXJ2ZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9sYXlvdXQnO1xuaW1wb3J0IHtQbGF0Zm9ybX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5cbi8qKiBTZXQgb2YgcG9zc2libGUgaGlnaC1jb250cmFzdCBtb2RlIGJhY2tncm91bmRzLiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gSGlnaENvbnRyYXN0TW9kZSB7XG4gIE5PTkUsXG4gIEJMQUNLX09OX1dISVRFLFxuICBXSElURV9PTl9CTEFDSyxcbn1cblxuLyoqIENTUyBjbGFzcyBhcHBsaWVkIHRvIHRoZSBkb2N1bWVudCBib2R5IHdoZW4gaW4gYmxhY2stb24td2hpdGUgaGlnaC1jb250cmFzdCBtb2RlLiAqL1xuZXhwb3J0IGNvbnN0IEJMQUNLX09OX1dISVRFX0NTU19DTEFTUyA9ICdjZGstaGlnaC1jb250cmFzdC1ibGFjay1vbi13aGl0ZSc7XG5cbi8qKiBDU1MgY2xhc3MgYXBwbGllZCB0byB0aGUgZG9jdW1lbnQgYm9keSB3aGVuIGluIHdoaXRlLW9uLWJsYWNrIGhpZ2gtY29udHJhc3QgbW9kZS4gKi9cbmV4cG9ydCBjb25zdCBXSElURV9PTl9CTEFDS19DU1NfQ0xBU1MgPSAnY2RrLWhpZ2gtY29udHJhc3Qtd2hpdGUtb24tYmxhY2snO1xuXG4vKiogQ1NTIGNsYXNzIGFwcGxpZWQgdG8gdGhlIGRvY3VtZW50IGJvZHkgd2hlbiBpbiBoaWdoLWNvbnRyYXN0IG1vZGUuICovXG5leHBvcnQgY29uc3QgSElHSF9DT05UUkFTVF9NT0RFX0FDVElWRV9DU1NfQ0xBU1MgPSAnY2RrLWhpZ2gtY29udHJhc3QtYWN0aXZlJztcblxuLyoqXG4gKiBTZXJ2aWNlIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBicm93c2VyIGlzIGN1cnJlbnRseSBpbiBhIGhpZ2gtY29udHJhc3QtbW9kZSBlbnZpcm9ubWVudC5cbiAqXG4gKiBNaWNyb3NvZnQgV2luZG93cyBzdXBwb3J0cyBhbiBhY2Nlc3NpYmlsaXR5IGZlYXR1cmUgY2FsbGVkIFwiSGlnaCBDb250cmFzdCBNb2RlXCIuIFRoaXMgbW9kZVxuICogY2hhbmdlcyB0aGUgYXBwZWFyYW5jZSBvZiBhbGwgYXBwbGljYXRpb25zLCBpbmNsdWRpbmcgd2ViIGFwcGxpY2F0aW9ucywgdG8gZHJhbWF0aWNhbGx5IGluY3JlYXNlXG4gKiBjb250cmFzdC5cbiAqXG4gKiBJRSwgRWRnZSwgYW5kIEZpcmVmb3ggY3VycmVudGx5IHN1cHBvcnQgdGhpcyBtb2RlLiBDaHJvbWUgZG9lcyBub3Qgc3VwcG9ydCBXaW5kb3dzIEhpZ2ggQ29udHJhc3RcbiAqIE1vZGUuIFRoaXMgc2VydmljZSBkb2VzIG5vdCBkZXRlY3QgaGlnaC1jb250cmFzdCBtb2RlIGFzIGFkZGVkIGJ5IHRoZSBDaHJvbWUgXCJIaWdoIENvbnRyYXN0XCJcbiAqIGJyb3dzZXIgZXh0ZW5zaW9uLlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBIaWdoQ29udHJhc3RNb2RlRGV0ZWN0b3IgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICAvKipcbiAgICogRmlndXJpbmcgb3V0IHRoZSBoaWdoIGNvbnRyYXN0IG1vZGUgYW5kIGFkZGluZyB0aGUgYm9keSBjbGFzc2VzIGNhbiBjYXVzZVxuICAgKiBzb21lIGV4cGVuc2l2ZSBsYXlvdXRzLiBUaGlzIGZsYWcgaXMgdXNlZCB0byBlbnN1cmUgdGhhdCB3ZSBvbmx5IGRvIGl0IG9uY2UuXG4gICAqL1xuICBwcml2YXRlIF9oYXNDaGVja2VkSGlnaENvbnRyYXN0TW9kZTogYm9vbGVhbjtcbiAgcHJpdmF0ZSBfZG9jdW1lbnQ6IERvY3VtZW50O1xuICBwcml2YXRlIF9icmVha3BvaW50U3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtLCBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55KSB7XG4gICAgdGhpcy5fZG9jdW1lbnQgPSBkb2N1bWVudDtcblxuICAgIHRoaXMuX2JyZWFrcG9pbnRTdWJzY3JpcHRpb24gPSBpbmplY3QoQnJlYWtwb2ludE9ic2VydmVyKVxuICAgICAgLm9ic2VydmUoJyhmb3JjZWQtY29sb3JzOiBhY3RpdmUpJylcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5faGFzQ2hlY2tlZEhpZ2hDb250cmFzdE1vZGUpIHtcbiAgICAgICAgICB0aGlzLl9oYXNDaGVja2VkSGlnaENvbnRyYXN0TW9kZSA9IGZhbHNlO1xuICAgICAgICAgIHRoaXMuX2FwcGx5Qm9keUhpZ2hDb250cmFzdE1vZGVDc3NDbGFzc2VzKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGN1cnJlbnQgaGlnaC1jb250cmFzdC1tb2RlIGZvciB0aGUgcGFnZS4gKi9cbiAgZ2V0SGlnaENvbnRyYXN0TW9kZSgpOiBIaWdoQ29udHJhc3RNb2RlIHtcbiAgICBpZiAoIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xuICAgICAgcmV0dXJuIEhpZ2hDb250cmFzdE1vZGUuTk9ORTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSB0ZXN0IGVsZW1lbnQgd2l0aCBhbiBhcmJpdHJhcnkgYmFja2dyb3VuZC1jb2xvciB0aGF0IGlzIG5laXRoZXIgYmxhY2sgbm9yXG4gICAgLy8gd2hpdGU7IGhpZ2gtY29udHJhc3QgbW9kZSB3aWxsIGNvZXJjZSB0aGUgY29sb3IgdG8gZWl0aGVyIGJsYWNrIG9yIHdoaXRlLiBBbHNvIGVuc3VyZSB0aGF0XG4gICAgLy8gYXBwZW5kaW5nIHRoZSB0ZXN0IGVsZW1lbnQgdG8gdGhlIERPTSBkb2VzIG5vdCBhZmZlY3QgbGF5b3V0IGJ5IGFic29sdXRlbHkgcG9zaXRpb25pbmcgaXRcbiAgICBjb25zdCB0ZXN0RWxlbWVudCA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRlc3RFbGVtZW50LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2IoMSwyLDMpJztcbiAgICB0ZXN0RWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgdGhpcy5fZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZXN0RWxlbWVudCk7XG5cbiAgICAvLyBHZXQgdGhlIGNvbXB1dGVkIHN0eWxlIGZvciB0aGUgYmFja2dyb3VuZCBjb2xvciwgY29sbGFwc2luZyBzcGFjZXMgdG8gbm9ybWFsaXplIGJldHdlZW5cbiAgICAvLyBicm93c2Vycy4gT25jZSB3ZSBnZXQgdGhpcyBjb2xvciwgd2Ugbm8gbG9uZ2VyIG5lZWQgdGhlIHRlc3QgZWxlbWVudC4gQWNjZXNzIHRoZSBgd2luZG93YFxuICAgIC8vIHZpYSB0aGUgZG9jdW1lbnQgc28gd2UgY2FuIGZha2UgaXQgaW4gdGVzdHMuIE5vdGUgdGhhdCB3ZSBoYXZlIGV4dHJhIG51bGwgY2hlY2tzLCBiZWNhdXNlXG4gICAgLy8gdGhpcyBsb2dpYyB3aWxsIGxpa2VseSBydW4gZHVyaW5nIGFwcCBib290c3RyYXAgYW5kIHRocm93aW5nIGNhbiBicmVhayB0aGUgZW50aXJlIGFwcC5cbiAgICBjb25zdCBkb2N1bWVudFdpbmRvdyA9IHRoaXMuX2RvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHdpbmRvdztcbiAgICBjb25zdCBjb21wdXRlZFN0eWxlID1cbiAgICAgIGRvY3VtZW50V2luZG93ICYmIGRvY3VtZW50V2luZG93LmdldENvbXB1dGVkU3R5bGVcbiAgICAgICAgPyBkb2N1bWVudFdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRlc3RFbGVtZW50KVxuICAgICAgICA6IG51bGw7XG4gICAgY29uc3QgY29tcHV0ZWRDb2xvciA9ICgoY29tcHV0ZWRTdHlsZSAmJiBjb21wdXRlZFN0eWxlLmJhY2tncm91bmRDb2xvcikgfHwgJycpLnJlcGxhY2UoXG4gICAgICAvIC9nLFxuICAgICAgJycsXG4gICAgKTtcbiAgICB0ZXN0RWxlbWVudC5yZW1vdmUoKTtcblxuICAgIHN3aXRjaCAoY29tcHV0ZWRDb2xvcikge1xuICAgICAgLy8gUHJlIFdpbmRvd3MgMTEgZGFyayB0aGVtZS5cbiAgICAgIGNhc2UgJ3JnYigwLDAsMCknOlxuICAgICAgLy8gV2luZG93cyAxMSBkYXJrIHRoZW1lcy5cbiAgICAgIGNhc2UgJ3JnYig0NSw1MCw1NCknOlxuICAgICAgY2FzZSAncmdiKDMyLDMyLDMyKSc6XG4gICAgICAgIHJldHVybiBIaWdoQ29udHJhc3RNb2RlLldISVRFX09OX0JMQUNLO1xuICAgICAgLy8gUHJlIFdpbmRvd3MgMTEgbGlnaHQgdGhlbWUuXG4gICAgICBjYXNlICdyZ2IoMjU1LDI1NSwyNTUpJzpcbiAgICAgIC8vIFdpbmRvd3MgMTEgbGlnaHQgdGhlbWUuXG4gICAgICBjYXNlICdyZ2IoMjU1LDI1MCwyMzkpJzpcbiAgICAgICAgcmV0dXJuIEhpZ2hDb250cmFzdE1vZGUuQkxBQ0tfT05fV0hJVEU7XG4gICAgfVxuICAgIHJldHVybiBIaWdoQ29udHJhc3RNb2RlLk5PTkU7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9icmVha3BvaW50U3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICAvKiogQXBwbGllcyBDU1MgY2xhc3NlcyBpbmRpY2F0aW5nIGhpZ2gtY29udHJhc3QgbW9kZSB0byBkb2N1bWVudCBib2R5IChicm93c2VyLW9ubHkpLiAqL1xuICBfYXBwbHlCb2R5SGlnaENvbnRyYXN0TW9kZUNzc0NsYXNzZXMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9oYXNDaGVja2VkSGlnaENvbnRyYXN0TW9kZSAmJiB0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIgJiYgdGhpcy5fZG9jdW1lbnQuYm9keSkge1xuICAgICAgY29uc3QgYm9keUNsYXNzZXMgPSB0aGlzLl9kb2N1bWVudC5ib2R5LmNsYXNzTGlzdDtcbiAgICAgIGJvZHlDbGFzc2VzLnJlbW92ZShcbiAgICAgICAgSElHSF9DT05UUkFTVF9NT0RFX0FDVElWRV9DU1NfQ0xBU1MsXG4gICAgICAgIEJMQUNLX09OX1dISVRFX0NTU19DTEFTUyxcbiAgICAgICAgV0hJVEVfT05fQkxBQ0tfQ1NTX0NMQVNTLFxuICAgICAgKTtcbiAgICAgIHRoaXMuX2hhc0NoZWNrZWRIaWdoQ29udHJhc3RNb2RlID0gdHJ1ZTtcblxuICAgICAgY29uc3QgbW9kZSA9IHRoaXMuZ2V0SGlnaENvbnRyYXN0TW9kZSgpO1xuICAgICAgaWYgKG1vZGUgPT09IEhpZ2hDb250cmFzdE1vZGUuQkxBQ0tfT05fV0hJVEUpIHtcbiAgICAgICAgYm9keUNsYXNzZXMuYWRkKEhJR0hfQ09OVFJBU1RfTU9ERV9BQ1RJVkVfQ1NTX0NMQVNTLCBCTEFDS19PTl9XSElURV9DU1NfQ0xBU1MpO1xuICAgICAgfSBlbHNlIGlmIChtb2RlID09PSBIaWdoQ29udHJhc3RNb2RlLldISVRFX09OX0JMQUNLKSB7XG4gICAgICAgIGJvZHlDbGFzc2VzLmFkZChISUdIX0NPTlRSQVNUX01PREVfQUNUSVZFX0NTU19DTEFTUywgV0hJVEVfT05fQkxBQ0tfQ1NTX0NMQVNTKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==