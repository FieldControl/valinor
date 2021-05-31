/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
import * as i2 from "@angular/common";
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
    }
    /** Gets the current high-contrast-mode for the page. */
    getHighContrastMode() {
        if (!this._platform.isBrowser) {
            return 0 /* NONE */;
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
        const computedStyle = (documentWindow && documentWindow.getComputedStyle) ?
            documentWindow.getComputedStyle(testElement) : null;
        const computedColor = (computedStyle && computedStyle.backgroundColor || '').replace(/ /g, '');
        this._document.body.removeChild(testElement);
        switch (computedColor) {
            case 'rgb(0,0,0)': return 2 /* WHITE_ON_BLACK */;
            case 'rgb(255,255,255)': return 1 /* BLACK_ON_WHITE */;
        }
        return 0 /* NONE */;
    }
    /** Applies CSS classes indicating high-contrast mode to document body (browser-only). */
    _applyBodyHighContrastModeCssClasses() {
        if (!this._hasCheckedHighContrastMode && this._platform.isBrowser && this._document.body) {
            const bodyClasses = this._document.body.classList;
            // IE11 doesn't support `classList` operations with multiple arguments
            bodyClasses.remove(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
            bodyClasses.remove(BLACK_ON_WHITE_CSS_CLASS);
            bodyClasses.remove(WHITE_ON_BLACK_CSS_CLASS);
            this._hasCheckedHighContrastMode = true;
            const mode = this.getHighContrastMode();
            if (mode === 1 /* BLACK_ON_WHITE */) {
                bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
                bodyClasses.add(BLACK_ON_WHITE_CSS_CLASS);
            }
            else if (mode === 2 /* WHITE_ON_BLACK */) {
                bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
                bodyClasses.add(WHITE_ON_BLACK_CSS_CLASS);
            }
        }
    }
}
HighContrastModeDetector.ɵprov = i0.ɵɵdefineInjectable({ factory: function HighContrastModeDetector_Factory() { return new HighContrastModeDetector(i0.ɵɵinject(i1.Platform), i0.ɵɵinject(i2.DOCUMENT)); }, token: HighContrastModeDetector, providedIn: "root" });
HighContrastModeDetector.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
HighContrastModeDetector.ctorParameters = () => [
    { type: Platform },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlnaC1jb250cmFzdC1tb2RlLWRldGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9hMTF5L2hpZ2gtY29udHJhc3QtbW9kZS9oaWdoLWNvbnRyYXN0LW1vZGUtZGV0ZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7OztBQVVqRCx3RkFBd0Y7QUFDeEYsTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQUcsa0NBQWtDLENBQUM7QUFFM0Usd0ZBQXdGO0FBQ3hGLE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLGtDQUFrQyxDQUFDO0FBRTNFLHlFQUF5RTtBQUN6RSxNQUFNLENBQUMsTUFBTSxtQ0FBbUMsR0FBRywwQkFBMEIsQ0FBQztBQUU5RTs7Ozs7Ozs7OztHQVVHO0FBRUgsTUFBTSxPQUFPLHdCQUF3QjtJQVFuQyxZQUFvQixTQUFtQixFQUFvQixRQUFhO1FBQXBELGNBQVMsR0FBVCxTQUFTLENBQVU7UUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDNUIsQ0FBQztJQUVELHdEQUF3RDtJQUN4RCxtQkFBbUI7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFO1lBQzdCLG9CQUE2QjtTQUM5QjtRQUVELHFGQUFxRjtRQUNyRiw2RkFBNkY7UUFDN0YsNEZBQTRGO1FBQzVGLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hELFdBQVcsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLFlBQVksQ0FBQztRQUNqRCxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTdDLDBGQUEwRjtRQUMxRiw0RkFBNEY7UUFDNUYsNEZBQTRGO1FBQzVGLHlGQUF5RjtRQUN6RixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUM7UUFDNUQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxjQUFjLElBQUksY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUN2RSxjQUFjLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN4RCxNQUFNLGFBQWEsR0FDZixDQUFDLGFBQWEsSUFBSSxhQUFhLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTdDLFFBQVEsYUFBYSxFQUFFO1lBQ3JCLEtBQUssWUFBWSxDQUFDLENBQUMsOEJBQXVDO1lBQzFELEtBQUssa0JBQWtCLENBQUMsQ0FBQyw4QkFBdUM7U0FDakU7UUFDRCxvQkFBNkI7SUFDL0IsQ0FBQztJQUVELHlGQUF5RjtJQUN6RixvQ0FBb0M7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQywyQkFBMkIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRTtZQUN4RixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDbEQsc0VBQXNFO1lBQ3RFLFdBQVcsQ0FBQyxNQUFNLENBQUMsbUNBQW1DLENBQUMsQ0FBQztZQUN4RCxXQUFXLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDN0MsV0FBVyxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUM7WUFFeEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDeEMsSUFBSSxJQUFJLDJCQUFvQyxFQUFFO2dCQUM1QyxXQUFXLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7Z0JBQ3JELFdBQVcsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQzthQUMzQztpQkFBTSxJQUFJLElBQUksMkJBQW9DLEVBQUU7Z0JBQ25ELFdBQVcsQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsQ0FBQztnQkFDckQsV0FBVyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2FBQzNDO1NBQ0Y7SUFDSCxDQUFDOzs7O1lBaEVGLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OztZQWhDeEIsUUFBUTs0Q0F5QzRCLE1BQU0sU0FBQyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UGxhdGZvcm19IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5cbi8qKiBTZXQgb2YgcG9zc2libGUgaGlnaC1jb250cmFzdCBtb2RlIGJhY2tncm91bmRzLiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gSGlnaENvbnRyYXN0TW9kZSB7XG4gIE5PTkUsXG4gIEJMQUNLX09OX1dISVRFLFxuICBXSElURV9PTl9CTEFDSyxcbn1cblxuLyoqIENTUyBjbGFzcyBhcHBsaWVkIHRvIHRoZSBkb2N1bWVudCBib2R5IHdoZW4gaW4gYmxhY2stb24td2hpdGUgaGlnaC1jb250cmFzdCBtb2RlLiAqL1xuZXhwb3J0IGNvbnN0IEJMQUNLX09OX1dISVRFX0NTU19DTEFTUyA9ICdjZGstaGlnaC1jb250cmFzdC1ibGFjay1vbi13aGl0ZSc7XG5cbi8qKiBDU1MgY2xhc3MgYXBwbGllZCB0byB0aGUgZG9jdW1lbnQgYm9keSB3aGVuIGluIHdoaXRlLW9uLWJsYWNrIGhpZ2gtY29udHJhc3QgbW9kZS4gKi9cbmV4cG9ydCBjb25zdCBXSElURV9PTl9CTEFDS19DU1NfQ0xBU1MgPSAnY2RrLWhpZ2gtY29udHJhc3Qtd2hpdGUtb24tYmxhY2snO1xuXG4vKiogQ1NTIGNsYXNzIGFwcGxpZWQgdG8gdGhlIGRvY3VtZW50IGJvZHkgd2hlbiBpbiBoaWdoLWNvbnRyYXN0IG1vZGUuICovXG5leHBvcnQgY29uc3QgSElHSF9DT05UUkFTVF9NT0RFX0FDVElWRV9DU1NfQ0xBU1MgPSAnY2RrLWhpZ2gtY29udHJhc3QtYWN0aXZlJztcblxuLyoqXG4gKiBTZXJ2aWNlIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBicm93c2VyIGlzIGN1cnJlbnRseSBpbiBhIGhpZ2gtY29udHJhc3QtbW9kZSBlbnZpcm9ubWVudC5cbiAqXG4gKiBNaWNyb3NvZnQgV2luZG93cyBzdXBwb3J0cyBhbiBhY2Nlc3NpYmlsaXR5IGZlYXR1cmUgY2FsbGVkIFwiSGlnaCBDb250cmFzdCBNb2RlXCIuIFRoaXMgbW9kZVxuICogY2hhbmdlcyB0aGUgYXBwZWFyYW5jZSBvZiBhbGwgYXBwbGljYXRpb25zLCBpbmNsdWRpbmcgd2ViIGFwcGxpY2F0aW9ucywgdG8gZHJhbWF0aWNhbGx5IGluY3JlYXNlXG4gKiBjb250cmFzdC5cbiAqXG4gKiBJRSwgRWRnZSwgYW5kIEZpcmVmb3ggY3VycmVudGx5IHN1cHBvcnQgdGhpcyBtb2RlLiBDaHJvbWUgZG9lcyBub3Qgc3VwcG9ydCBXaW5kb3dzIEhpZ2ggQ29udHJhc3RcbiAqIE1vZGUuIFRoaXMgc2VydmljZSBkb2VzIG5vdCBkZXRlY3QgaGlnaC1jb250cmFzdCBtb2RlIGFzIGFkZGVkIGJ5IHRoZSBDaHJvbWUgXCJIaWdoIENvbnRyYXN0XCJcbiAqIGJyb3dzZXIgZXh0ZW5zaW9uLlxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBIaWdoQ29udHJhc3RNb2RlRGV0ZWN0b3Ige1xuICAvKipcbiAgICogRmlndXJpbmcgb3V0IHRoZSBoaWdoIGNvbnRyYXN0IG1vZGUgYW5kIGFkZGluZyB0aGUgYm9keSBjbGFzc2VzIGNhbiBjYXVzZVxuICAgKiBzb21lIGV4cGVuc2l2ZSBsYXlvdXRzLiBUaGlzIGZsYWcgaXMgdXNlZCB0byBlbnN1cmUgdGhhdCB3ZSBvbmx5IGRvIGl0IG9uY2UuXG4gICAqL1xuICBwcml2YXRlIF9oYXNDaGVja2VkSGlnaENvbnRyYXN0TW9kZTogYm9vbGVhbjtcbiAgcHJpdmF0ZSBfZG9jdW1lbnQ6IERvY3VtZW50O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybSwgQEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ6IGFueSkge1xuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY3VycmVudCBoaWdoLWNvbnRyYXN0LW1vZGUgZm9yIHRoZSBwYWdlLiAqL1xuICBnZXRIaWdoQ29udHJhc3RNb2RlKCk6IEhpZ2hDb250cmFzdE1vZGUge1xuICAgIGlmICghdGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XG4gICAgICByZXR1cm4gSGlnaENvbnRyYXN0TW9kZS5OT05FO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIHRlc3QgZWxlbWVudCB3aXRoIGFuIGFyYml0cmFyeSBiYWNrZ3JvdW5kLWNvbG9yIHRoYXQgaXMgbmVpdGhlciBibGFjayBub3JcbiAgICAvLyB3aGl0ZTsgaGlnaC1jb250cmFzdCBtb2RlIHdpbGwgY29lcmNlIHRoZSBjb2xvciB0byBlaXRoZXIgYmxhY2sgb3Igd2hpdGUuIEFsc28gZW5zdXJlIHRoYXRcbiAgICAvLyBhcHBlbmRpbmcgdGhlIHRlc3QgZWxlbWVudCB0byB0aGUgRE9NIGRvZXMgbm90IGFmZmVjdCBsYXlvdXQgYnkgYWJzb2x1dGVseSBwb3NpdGlvbmluZyBpdFxuICAgIGNvbnN0IHRlc3RFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGVzdEVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYigxLDIsMyknO1xuICAgIHRlc3RFbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICB0aGlzLl9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRlc3RFbGVtZW50KTtcblxuICAgIC8vIEdldCB0aGUgY29tcHV0ZWQgc3R5bGUgZm9yIHRoZSBiYWNrZ3JvdW5kIGNvbG9yLCBjb2xsYXBzaW5nIHNwYWNlcyB0byBub3JtYWxpemUgYmV0d2VlblxuICAgIC8vIGJyb3dzZXJzLiBPbmNlIHdlIGdldCB0aGlzIGNvbG9yLCB3ZSBubyBsb25nZXIgbmVlZCB0aGUgdGVzdCBlbGVtZW50LiBBY2Nlc3MgdGhlIGB3aW5kb3dgXG4gICAgLy8gdmlhIHRoZSBkb2N1bWVudCBzbyB3ZSBjYW4gZmFrZSBpdCBpbiB0ZXN0cy4gTm90ZSB0aGF0IHdlIGhhdmUgZXh0cmEgbnVsbCBjaGVja3MsIGJlY2F1c2VcbiAgICAvLyB0aGlzIGxvZ2ljIHdpbGwgbGlrZWx5IHJ1biBkdXJpbmcgYXBwIGJvb3RzdHJhcCBhbmQgdGhyb3dpbmcgY2FuIGJyZWFrIHRoZSBlbnRpcmUgYXBwLlxuICAgIGNvbnN0IGRvY3VtZW50V2luZG93ID0gdGhpcy5fZG9jdW1lbnQuZGVmYXVsdFZpZXcgfHwgd2luZG93O1xuICAgIGNvbnN0IGNvbXB1dGVkU3R5bGUgPSAoZG9jdW1lbnRXaW5kb3cgJiYgZG9jdW1lbnRXaW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSkgP1xuICAgICAgICBkb2N1bWVudFdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRlc3RFbGVtZW50KSA6IG51bGw7XG4gICAgY29uc3QgY29tcHV0ZWRDb2xvciA9XG4gICAgICAgIChjb21wdXRlZFN0eWxlICYmIGNvbXB1dGVkU3R5bGUuYmFja2dyb3VuZENvbG9yIHx8ICcnKS5yZXBsYWNlKC8gL2csICcnKTtcbiAgICB0aGlzLl9kb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRlc3RFbGVtZW50KTtcblxuICAgIHN3aXRjaCAoY29tcHV0ZWRDb2xvcikge1xuICAgICAgY2FzZSAncmdiKDAsMCwwKSc6IHJldHVybiBIaWdoQ29udHJhc3RNb2RlLldISVRFX09OX0JMQUNLO1xuICAgICAgY2FzZSAncmdiKDI1NSwyNTUsMjU1KSc6IHJldHVybiBIaWdoQ29udHJhc3RNb2RlLkJMQUNLX09OX1dISVRFO1xuICAgIH1cbiAgICByZXR1cm4gSGlnaENvbnRyYXN0TW9kZS5OT05FO1xuICB9XG5cbiAgLyoqIEFwcGxpZXMgQ1NTIGNsYXNzZXMgaW5kaWNhdGluZyBoaWdoLWNvbnRyYXN0IG1vZGUgdG8gZG9jdW1lbnQgYm9keSAoYnJvd3Nlci1vbmx5KS4gKi9cbiAgX2FwcGx5Qm9keUhpZ2hDb250cmFzdE1vZGVDc3NDbGFzc2VzKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faGFzQ2hlY2tlZEhpZ2hDb250cmFzdE1vZGUgJiYgdGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyICYmIHRoaXMuX2RvY3VtZW50LmJvZHkpIHtcbiAgICAgIGNvbnN0IGJvZHlDbGFzc2VzID0gdGhpcy5fZG9jdW1lbnQuYm9keS5jbGFzc0xpc3Q7XG4gICAgICAvLyBJRTExIGRvZXNuJ3Qgc3VwcG9ydCBgY2xhc3NMaXN0YCBvcGVyYXRpb25zIHdpdGggbXVsdGlwbGUgYXJndW1lbnRzXG4gICAgICBib2R5Q2xhc3Nlcy5yZW1vdmUoSElHSF9DT05UUkFTVF9NT0RFX0FDVElWRV9DU1NfQ0xBU1MpO1xuICAgICAgYm9keUNsYXNzZXMucmVtb3ZlKEJMQUNLX09OX1dISVRFX0NTU19DTEFTUyk7XG4gICAgICBib2R5Q2xhc3Nlcy5yZW1vdmUoV0hJVEVfT05fQkxBQ0tfQ1NTX0NMQVNTKTtcbiAgICAgIHRoaXMuX2hhc0NoZWNrZWRIaWdoQ29udHJhc3RNb2RlID0gdHJ1ZTtcblxuICAgICAgY29uc3QgbW9kZSA9IHRoaXMuZ2V0SGlnaENvbnRyYXN0TW9kZSgpO1xuICAgICAgaWYgKG1vZGUgPT09IEhpZ2hDb250cmFzdE1vZGUuQkxBQ0tfT05fV0hJVEUpIHtcbiAgICAgICAgYm9keUNsYXNzZXMuYWRkKEhJR0hfQ09OVFJBU1RfTU9ERV9BQ1RJVkVfQ1NTX0NMQVNTKTtcbiAgICAgICAgYm9keUNsYXNzZXMuYWRkKEJMQUNLX09OX1dISVRFX0NTU19DTEFTUyk7XG4gICAgICB9IGVsc2UgaWYgKG1vZGUgPT09IEhpZ2hDb250cmFzdE1vZGUuV0hJVEVfT05fQkxBQ0spIHtcbiAgICAgICAgYm9keUNsYXNzZXMuYWRkKEhJR0hfQ09OVFJBU1RfTU9ERV9BQ1RJVkVfQ1NTX0NMQVNTKTtcbiAgICAgICAgYm9keUNsYXNzZXMuYWRkKFdISVRFX09OX0JMQUNLX0NTU19DTEFTUyk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=