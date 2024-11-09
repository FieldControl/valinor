/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, ContentChild, Inject, InjectionToken, Input, Optional, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation, booleanAttribute, } from '@angular/core';
import { MatTabContent } from './tab-content';
import { MAT_TAB, MatTabLabel } from './tab-label';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
/**
 * Used to provide a tab group to a tab without causing a circular dependency.
 * @docs-private
 */
export const MAT_TAB_GROUP = new InjectionToken('MAT_TAB_GROUP');
export class MatTab {
    /** Content for the tab label given by `<ng-template mat-tab-label>`. */
    get templateLabel() {
        return this._templateLabel;
    }
    set templateLabel(value) {
        this._setTemplateLabelInput(value);
    }
    /** @docs-private */
    get content() {
        return this._contentPortal;
    }
    constructor(_viewContainerRef, _closestTabGroup) {
        this._viewContainerRef = _viewContainerRef;
        this._closestTabGroup = _closestTabGroup;
        /** whether the tab is disabled. */
        this.disabled = false;
        /**
         * Template provided in the tab content that will be used if present, used to enable lazy-loading
         */
        this._explicitContent = undefined;
        /** Plain text label for the tab, used when there is no template label. */
        this.textLabel = '';
        /** Portal that will be the hosted content of the tab */
        this._contentPortal = null;
        /** Emits whenever the internal state of the tab changes. */
        this._stateChanges = new Subject();
        /**
         * The relatively indexed position where 0 represents the center, negative is left, and positive
         * represents the right.
         */
        this.position = null;
        /**
         * The initial relatively index origin of the tab if it was created and selected after there
         * was already a selected tab. Provides context of what position the tab should originate from.
         */
        this.origin = null;
        /**
         * Whether the tab is currently active.
         */
        this.isActive = false;
    }
    ngOnChanges(changes) {
        if (changes.hasOwnProperty('textLabel') || changes.hasOwnProperty('disabled')) {
            this._stateChanges.next();
        }
    }
    ngOnDestroy() {
        this._stateChanges.complete();
    }
    ngOnInit() {
        this._contentPortal = new TemplatePortal(this._explicitContent || this._implicitContent, this._viewContainerRef);
    }
    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    _setTemplateLabelInput(value) {
        // Only update the label if the query managed to find one. This works around an issue where a
        // user may have manually set `templateLabel` during creation mode, which would then get
        // clobbered by `undefined` when the query resolves. Also note that we check that the closest
        // tab matches the current one so that we don't pick up labels from nested tabs.
        if (value && value._closestTab === this) {
            this._templateLabel = value;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatTab, deps: [{ token: i0.ViewContainerRef }, { token: MAT_TAB_GROUP, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "16.1.0", version: "17.2.0", type: MatTab, isStandalone: true, selector: "mat-tab", inputs: { disabled: ["disabled", "disabled", booleanAttribute], textLabel: ["label", "textLabel"], ariaLabel: ["aria-label", "ariaLabel"], ariaLabelledby: ["aria-labelledby", "ariaLabelledby"], labelClass: "labelClass", bodyClass: "bodyClass" }, host: { attributes: { "hidden": "" } }, providers: [{ provide: MAT_TAB, useExisting: MatTab }], queries: [{ propertyName: "templateLabel", first: true, predicate: MatTabLabel, descendants: true }, { propertyName: "_explicitContent", first: true, predicate: MatTabContent, descendants: true, read: TemplateRef, static: true }], viewQueries: [{ propertyName: "_implicitContent", first: true, predicate: TemplateRef, descendants: true, static: true }], exportAs: ["matTab"], usesOnChanges: true, ngImport: i0, template: "<!-- Create a template for the content of the <mat-tab> so that we can grab a reference to this\n    TemplateRef and use it in a Portal to render the tab content in the appropriate place in the\n    tab-group. -->\n<ng-template><ng-content></ng-content></ng-template>\n", changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0", ngImport: i0, type: MatTab, decorators: [{
            type: Component,
            args: [{ selector: 'mat-tab', changeDetection: ChangeDetectionStrategy.Default, encapsulation: ViewEncapsulation.None, exportAs: 'matTab', providers: [{ provide: MAT_TAB, useExisting: MatTab }], standalone: true, host: {
                        // This element will be rendered on the server in order to support hydration.
                        // Hide it so it doesn't cause a layout shift when it's removed on the client.
                        'hidden': '',
                    }, template: "<!-- Create a template for the content of the <mat-tab> so that we can grab a reference to this\n    TemplateRef and use it in a Portal to render the tab content in the appropriate place in the\n    tab-group. -->\n<ng-template><ng-content></ng-content></ng-template>\n" }]
        }], ctorParameters: () => [{ type: i0.ViewContainerRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_TAB_GROUP]
                }, {
                    type: Optional
                }] }], propDecorators: { disabled: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], templateLabel: [{
                type: ContentChild,
                args: [MatTabLabel]
            }], _explicitContent: [{
                type: ContentChild,
                args: [MatTabContent, { read: TemplateRef, static: true }]
            }], _implicitContent: [{
                type: ViewChild,
                args: [TemplateRef, { static: true }]
            }], textLabel: [{
                type: Input,
                args: ['label']
            }], ariaLabel: [{
                type: Input,
                args: ['aria-label']
            }], ariaLabelledby: [{
                type: Input,
                args: ['aria-labelledby']
            }], labelClass: [{
                type: Input
            }], bodyClass: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RhYnMvdGFiLnRzIiwiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RhYnMvdGFiLmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsWUFBWSxFQUNaLE1BQU0sRUFDTixjQUFjLEVBQ2QsS0FBSyxFQUlMLFFBQVEsRUFFUixXQUFXLEVBQ1gsU0FBUyxFQUNULGdCQUFnQixFQUNoQixpQkFBaUIsRUFDakIsZ0JBQWdCLEdBQ2pCLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDakQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7O0FBRTdCOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxJQUFJLGNBQWMsQ0FBTSxlQUFlLENBQUMsQ0FBQztBQW9CdEUsTUFBTSxPQUFPLE1BQU07SUFLakIsd0VBQXdFO0lBQ3hFLElBQ0ksYUFBYTtRQUNmLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM3QixDQUFDO0lBQ0QsSUFBSSxhQUFhLENBQUMsS0FBa0I7UUFDbEMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUF3Q0Qsb0JBQW9CO0lBQ3BCLElBQUksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM3QixDQUFDO0lBc0JELFlBQ1UsaUJBQW1DLEVBQ0QsZ0JBQXFCO1FBRHZELHNCQUFpQixHQUFqQixpQkFBaUIsQ0FB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IENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBDb250ZW50Q2hpbGQsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIElucHV0LFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBPcHRpb25hbCxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgVGVtcGxhdGVSZWYsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0NvbnRhaW5lclJlZixcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIGJvb2xlYW5BdHRyaWJ1dGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRUYWJDb250ZW50fSBmcm9tICcuL3RhYi1jb250ZW50JztcbmltcG9ydCB7TUFUX1RBQiwgTWF0VGFiTGFiZWx9IGZyb20gJy4vdGFiLWxhYmVsJztcbmltcG9ydCB7VGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuLyoqXG4gKiBVc2VkIHRvIHByb3ZpZGUgYSB0YWIgZ3JvdXAgdG8gYSB0YWIgd2l0aG91dCBjYXVzaW5nIGEgY2lyY3VsYXIgZGVwZW5kZW5jeS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9UQUJfR1JPVVAgPSBuZXcgSW5qZWN0aW9uVG9rZW48YW55PignTUFUX1RBQl9HUk9VUCcpO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtdGFiJyxcbiAgLy8gTm90ZSB0aGF0IHVzdWFsbHkgd2UnZCBnbyB0aHJvdWdoIGEgYml0IG1vcmUgdHJvdWJsZSBhbmQgc2V0IHVwIGFub3RoZXIgY2xhc3Mgc28gdGhhdFxuICAvLyB0aGUgaW5saW5lZCB0ZW1wbGF0ZSBvZiBgTWF0VGFiYCBpc24ndCBkdXBsaWNhdGVkLCBob3dldmVyIHRoZSB0ZW1wbGF0ZSBpcyBzbWFsbCBlbm91Z2hcbiAgLy8gdGhhdCBjcmVhdGluZyB0aGUgZXh0cmEgY2xhc3Mgd2lsbCBnZW5lcmF0ZSBtb3JlIGNvZGUgdGhhbiBqdXN0IGR1cGxpY2F0aW5nIHRoZSB0ZW1wbGF0ZS5cbiAgdGVtcGxhdGVVcmw6ICd0YWIuaHRtbCcsXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YWxpZGF0ZS1kZWNvcmF0b3JzXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgZXhwb3J0QXM6ICdtYXRUYWInLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogTUFUX1RBQiwgdXNlRXhpc3Rpbmc6IE1hdFRhYn1dLFxuICBzdGFuZGFsb25lOiB0cnVlLFxuICBob3N0OiB7XG4gICAgLy8gVGhpcyBlbGVtZW50IHdpbGwgYmUgcmVuZGVyZWQgb24gdGhlIHNlcnZlciBpbiBvcmRlciB0byBzdXBwb3J0IGh5ZHJhdGlvbi5cbiAgICAvLyBIaWRlIGl0IHNvIGl0IGRvZXNuJ3QgY2F1c2UgYSBsYXlvdXQgc2hpZnQgd2hlbiBpdCdzIHJlbW92ZWQgb24gdGhlIGNsaWVudC5cbiAgICAnaGlkZGVuJzogJycsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdFRhYiBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICAvKiogd2hldGhlciB0aGUgdGFiIGlzIGRpc2FibGVkLiAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pXG4gIGRpc2FibGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIENvbnRlbnQgZm9yIHRoZSB0YWIgbGFiZWwgZ2l2ZW4gYnkgYDxuZy10ZW1wbGF0ZSBtYXQtdGFiLWxhYmVsPmAuICovXG4gIEBDb250ZW50Q2hpbGQoTWF0VGFiTGFiZWwpXG4gIGdldCB0ZW1wbGF0ZUxhYmVsKCk6IE1hdFRhYkxhYmVsIHtcbiAgICByZXR1cm4gdGhpcy5fdGVtcGxhdGVMYWJlbDtcbiAgfVxuICBzZXQgdGVtcGxhdGVMYWJlbCh2YWx1ZTogTWF0VGFiTGFiZWwpIHtcbiAgICB0aGlzLl9zZXRUZW1wbGF0ZUxhYmVsSW5wdXQodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX3RlbXBsYXRlTGFiZWw6IE1hdFRhYkxhYmVsO1xuXG4gIC8qKlxuICAgKiBUZW1wbGF0ZSBwcm92aWRlZCBpbiB0aGUgdGFiIGNvbnRlbnQgdGhhdCB3aWxsIGJlIHVzZWQgaWYgcHJlc2VudCwgdXNlZCB0byBlbmFibGUgbGF6eS1sb2FkaW5nXG4gICAqL1xuICBAQ29udGVudENoaWxkKE1hdFRhYkNvbnRlbnQsIHtyZWFkOiBUZW1wbGF0ZVJlZiwgc3RhdGljOiB0cnVlfSlcbiAgLy8gV2UgbmVlZCBhbiBpbml0aWFsaXplciBoZXJlIHRvIGF2b2lkIGEgVFMgZXJyb3IuIFRoZSB2YWx1ZSB3aWxsIGJlIHNldCBpbiBgbmdBZnRlclZpZXdJbml0YC5cbiAgcHJpdmF0ZSBfZXhwbGljaXRDb250ZW50OiBUZW1wbGF0ZVJlZjxhbnk+ID0gdW5kZWZpbmVkITtcblxuICAvKiogVGVtcGxhdGUgaW5zaWRlIHRoZSBNYXRUYWIgdmlldyB0aGF0IGNvbnRhaW5zIGFuIGA8bmctY29udGVudD5gLiAqL1xuICBAVmlld0NoaWxkKFRlbXBsYXRlUmVmLCB7c3RhdGljOiB0cnVlfSkgX2ltcGxpY2l0Q29udGVudDogVGVtcGxhdGVSZWY8YW55PjtcblxuICAvKiogUGxhaW4gdGV4dCBsYWJlbCBmb3IgdGhlIHRhYiwgdXNlZCB3aGVuIHRoZXJlIGlzIG5vIHRlbXBsYXRlIGxhYmVsLiAqL1xuICBASW5wdXQoJ2xhYmVsJykgdGV4dExhYmVsOiBzdHJpbmcgPSAnJztcblxuICAvKiogQXJpYSBsYWJlbCBmb3IgdGhlIHRhYi4gKi9cbiAgQElucHV0KCdhcmlhLWxhYmVsJykgYXJpYUxhYmVsOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgZWxlbWVudCB0aGF0IHRoZSB0YWIgaXMgbGFiZWxsZWQgYnkuXG4gICAqIFdpbGwgYmUgY2xlYXJlZCBpZiBgYXJpYS1sYWJlbGAgaXMgc2V0IGF0IHRoZSBzYW1lIHRpbWUuXG4gICAqL1xuICBASW5wdXQoJ2FyaWEtbGFiZWxsZWRieScpIGFyaWFMYWJlbGxlZGJ5OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIENsYXNzZXMgdG8gYmUgcGFzc2VkIHRvIHRoZSB0YWIgbGFiZWwgaW5zaWRlIHRoZSBtYXQtdGFiLWhlYWRlciBjb250YWluZXIuXG4gICAqIFN1cHBvcnRzIHN0cmluZyBhbmQgc3RyaW5nIGFycmF5IHZhbHVlcywgc2FtZSBhcyBgbmdDbGFzc2AuXG4gICAqL1xuICBASW5wdXQoKSBsYWJlbENsYXNzOiBzdHJpbmcgfCBzdHJpbmdbXTtcblxuICAvKipcbiAgICogQ2xhc3NlcyB0byBiZSBwYXNzZWQgdG8gdGhlIHRhYiBtYXQtdGFiLWJvZHkgY29udGFpbmVyLlxuICAgKiBTdXBwb3J0cyBzdHJpbmcgYW5kIHN0cmluZyBhcnJheSB2YWx1ZXMsIHNhbWUgYXMgYG5nQ2xhc3NgLlxuICAgKi9cbiAgQElucHV0KCkgYm9keUNsYXNzOiBzdHJpbmcgfCBzdHJpbmdbXTtcblxuICAvKiogUG9ydGFsIHRoYXQgd2lsbCBiZSB0aGUgaG9zdGVkIGNvbnRlbnQgb2YgdGhlIHRhYiAqL1xuICBwcml2YXRlIF9jb250ZW50UG9ydGFsOiBUZW1wbGF0ZVBvcnRhbCB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBAZG9jcy1wcml2YXRlICovXG4gIGdldCBjb250ZW50KCk6IFRlbXBsYXRlUG9ydGFsIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRlbnRQb3J0YWw7XG4gIH1cblxuICAvKiogRW1pdHMgd2hlbmV2ZXIgdGhlIGludGVybmFsIHN0YXRlIG9mIHRoZSB0YWIgY2hhbmdlcy4gKi9cbiAgcmVhZG9ubHkgX3N0YXRlQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG5cbiAgLyoqXG4gICAqIFRoZSByZWxhdGl2ZWx5IGluZGV4ZWQgcG9zaXRpb24gd2hlcmUgMCByZXByZXNlbnRzIHRoZSBjZW50ZXIsIG5lZ2F0aXZlIGlzIGxlZnQsIGFuZCBwb3NpdGl2ZVxuICAgKiByZXByZXNlbnRzIHRoZSByaWdodC5cbiAgICovXG4gIHBvc2l0aW9uOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogVGhlIGluaXRpYWwgcmVsYXRpdmVseSBpbmRleCBvcmlnaW4gb2YgdGhlIHRhYiBpZiBpdCB3YXMgY3JlYXRlZCBhbmQgc2VsZWN0ZWQgYWZ0ZXIgdGhlcmVcbiAgICogd2FzIGFscmVhZHkgYSBzZWxlY3RlZCB0YWIuIFByb3ZpZGVzIGNvbnRleHQgb2Ygd2hhdCBwb3NpdGlvbiB0aGUgdGFiIHNob3VsZCBvcmlnaW5hdGUgZnJvbS5cbiAgICovXG4gIG9yaWdpbjogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHRhYiBpcyBjdXJyZW50bHkgYWN0aXZlLlxuICAgKi9cbiAgaXNBY3RpdmUgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgIEBJbmplY3QoTUFUX1RBQl9HUk9VUCkgQE9wdGlvbmFsKCkgcHVibGljIF9jbG9zZXN0VGFiR3JvdXA6IGFueSxcbiAgKSB7fVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBpZiAoY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eSgndGV4dExhYmVsJykgfHwgY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eSgnZGlzYWJsZWQnKSkge1xuICAgICAgdGhpcy5fc3RhdGVDaGFuZ2VzLm5leHQoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGF0ZUNoYW5nZXMuY29tcGxldGUoKTtcbiAgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbnRlbnRQb3J0YWwgPSBuZXcgVGVtcGxhdGVQb3J0YWwoXG4gICAgICB0aGlzLl9leHBsaWNpdENvbnRlbnQgfHwgdGhpcy5faW1wbGljaXRDb250ZW50LFxuICAgICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZixcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaGFzIGJlZW4gZXh0cmFjdGVkIHRvIGEgdXRpbCBiZWNhdXNlIG9mIFRTIDQgYW5kIFZFLlxuICAgKiBWaWV3IEVuZ2luZSBkb2Vzbid0IHN1cHBvcnQgcHJvcGVydHkgcmVuYW1lIGluaGVyaXRhbmNlLlxuICAgKiBUUyA0LjAgZG9lc24ndCBhbGxvdyBwcm9wZXJ0aWVzIHRvIG92ZXJyaWRlIGFjY2Vzc29ycyBvciB2aWNlLXZlcnNhLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9zZXRUZW1wbGF0ZUxhYmVsSW5wdXQodmFsdWU6IE1hdFRhYkxhYmVsIHwgdW5kZWZpbmVkKSB7XG4gICAgLy8gT25seSB1cGRhdGUgdGhlIGxhYmVsIGlmIHRoZSBxdWVyeSBtYW5hZ2VkIHRvIGZpbmQgb25lLiBUaGlzIHdvcmtzIGFyb3VuZCBhbiBpc3N1ZSB3aGVyZSBhXG4gICAgLy8gdXNlciBtYXkgaGF2ZSBtYW51YWxseSBzZXQgYHRlbXBsYXRlTGFiZWxgIGR1cmluZyBjcmVhdGlvbiBtb2RlLCB3aGljaCB3b3VsZCB0aGVuIGdldFxuICAgIC8vIGNsb2JiZXJlZCBieSBgdW5kZWZpbmVkYCB3aGVuIHRoZSBxdWVyeSByZXNvbHZlcy4gQWxzbyBub3RlIHRoYXQgd2UgY2hlY2sgdGhhdCB0aGUgY2xvc2VzdFxuICAgIC8vIHRhYiBtYXRjaGVzIHRoZSBjdXJyZW50IG9uZSBzbyB0aGF0IHdlIGRvbid0IHBpY2sgdXAgbGFiZWxzIGZyb20gbmVzdGVkIHRhYnMuXG4gICAgaWYgKHZhbHVlICYmIHZhbHVlLl9jbG9zZXN0VGFiID09PSB0aGlzKSB7XG4gICAgICB0aGlzLl90ZW1wbGF0ZUxhYmVsID0gdmFsdWU7XG4gICAgfVxuICB9XG59XG4iLCI8IS0tIENyZWF0ZSBhIHRlbXBsYXRlIGZvciB0aGUgY29udGVudCBvZiB0aGUgPG1hdC10YWI+IHNvIHRoYXQgd2UgY2FuIGdyYWIgYSByZWZlcmVuY2UgdG8gdGhpc1xuICAgIFRlbXBsYXRlUmVmIGFuZCB1c2UgaXQgaW4gYSBQb3J0YWwgdG8gcmVuZGVyIHRoZSB0YWIgY29udGVudCBpbiB0aGUgYXBwcm9wcmlhdGUgcGxhY2UgaW4gdGhlXG4gICAgdGFiLWdyb3VwLiAtLT5cbjxuZy10ZW1wbGF0ZT48bmctY29udGVudD48L25nLWNvbnRlbnQ+PC9uZy10ZW1wbGF0ZT5cbiJdfQ==