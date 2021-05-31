/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation, InjectionToken, Inject, Optional, } from '@angular/core';
import { mixinDisabled } from '@angular/material/core';
import { Subject } from 'rxjs';
import { MAT_TAB_CONTENT } from './tab-content';
import { MAT_TAB_LABEL, MatTabLabel } from './tab-label';
// Boilerplate for applying mixins to MatTab.
/** @docs-private */
class MatTabBase {
}
const _MatTabMixinBase = mixinDisabled(MatTabBase);
/**
 * Used to provide a tab group to a tab without causing a circular dependency.
 * @docs-private
 */
export const MAT_TAB_GROUP = new InjectionToken('MAT_TAB_GROUP');
export class MatTab extends _MatTabMixinBase {
    constructor(_viewContainerRef, _closestTabGroup) {
        super();
        this._viewContainerRef = _viewContainerRef;
        this._closestTabGroup = _closestTabGroup;
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
    /** Content for the tab label given by `<ng-template mat-tab-label>`. */
    get templateLabel() { return this._templateLabel; }
    set templateLabel(value) { this._setTemplateLabelInput(value); }
    /** @docs-private */
    get content() {
        return this._contentPortal;
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
        // Only update the templateLabel via query if there is actually
        // a MatTabLabel found. This works around an issue where a user may have
        // manually set `templateLabel` during creation mode, which would then get clobbered
        // by `undefined` when this query resolves.
        if (value) {
            this._templateLabel = value;
        }
    }
}
MatTab.decorators = [
    { type: Component, args: [{
                selector: 'mat-tab',
                template: "<!-- Create a template for the content of the <mat-tab> so that we can grab a reference to this\n    TemplateRef and use it in a Portal to render the tab content in the appropriate place in the\n    tab-group. -->\n<ng-template><ng-content></ng-content></ng-template>\n",
                inputs: ['disabled'],
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default,
                encapsulation: ViewEncapsulation.None,
                exportAs: 'matTab'
            },] }
];
MatTab.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_TAB_GROUP,] }, { type: Optional }] }
];
MatTab.propDecorators = {
    templateLabel: [{ type: ContentChild, args: [MAT_TAB_LABEL,] }],
    _explicitContent: [{ type: ContentChild, args: [MAT_TAB_CONTENT, { read: TemplateRef, static: true },] }],
    _implicitContent: [{ type: ViewChild, args: [TemplateRef, { static: true },] }],
    textLabel: [{ type: Input, args: ['label',] }],
    ariaLabel: [{ type: Input, args: ['aria-label',] }],
    ariaLabelledby: [{ type: Input, args: ['aria-labelledby',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RhYnMvdGFiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRCxPQUFPLEVBQ0wsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxZQUFZLEVBQ1osS0FBSyxFQUtMLFdBQVcsRUFDWCxTQUFTLEVBQ1QsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNqQixjQUFjLEVBQ2QsTUFBTSxFQUNOLFFBQVEsR0FDVCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQTZCLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ2pGLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDN0IsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUMsYUFBYSxFQUFFLFdBQVcsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUd2RCw2Q0FBNkM7QUFDN0Msb0JBQW9CO0FBQ3BCLE1BQU0sVUFBVTtDQUFHO0FBQ25CLE1BQU0sZ0JBQWdCLEdBQ2xCLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUU5Qjs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxjQUFjLENBQU0sZUFBZSxDQUFDLENBQUM7QUFXdEUsTUFBTSxPQUFPLE1BQU8sU0FBUSxnQkFBZ0I7SUF3RDFDLFlBQ1UsaUJBQW1DLEVBQ0QsZ0JBQXFCO1FBQy9ELEtBQUssRUFBRSxDQUFDO1FBRkEsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUNELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBSztRQTFDakUsMEVBQTBFO1FBQzFELGNBQVMsR0FBVyxFQUFFLENBQUM7UUFXdkMsd0RBQXdEO1FBQ2hELG1CQUFjLEdBQTBCLElBQUksQ0FBQztRQU9yRCw0REFBNEQ7UUFDbkQsa0JBQWEsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRTdDOzs7V0FHRztRQUNILGFBQVEsR0FBa0IsSUFBSSxDQUFDO1FBRS9COzs7V0FHRztRQUNILFdBQU0sR0FBa0IsSUFBSSxDQUFDO1FBRTdCOztXQUVHO1FBQ0gsYUFBUSxHQUFHLEtBQUssQ0FBQztJQU1qQixDQUFDO0lBM0RELHdFQUF3RTtJQUN4RSxJQUNJLGFBQWEsS0FBa0IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUNoRSxJQUFJLGFBQWEsQ0FBQyxLQUFrQixJQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUEyQjdFLG9CQUFvQjtJQUNwQixJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDN0IsQ0FBQztJQTRCRCxXQUFXLENBQUMsT0FBc0I7UUFDaEMsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUMzQjtJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsUUFBUTtRQUNOLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxjQUFjLENBQ3BDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ08sc0JBQXNCLENBQUMsS0FBa0I7UUFDakQsK0RBQStEO1FBQy9ELHdFQUF3RTtRQUN4RSxvRkFBb0Y7UUFDcEYsMkNBQTJDO1FBQzNDLElBQUksS0FBSyxFQUFFO1lBQ1QsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7U0FDN0I7SUFDSCxDQUFDOzs7WUFwR0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxTQUFTO2dCQUNuQix5UkFBdUI7Z0JBQ3ZCLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQztnQkFDcEIsK0NBQStDO2dCQUMvQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsT0FBTztnQkFDaEQsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7Z0JBQ3JDLFFBQVEsRUFBRSxRQUFRO2FBQ25COzs7WUFoQ0MsZ0JBQWdCOzRDQTJGYixNQUFNLFNBQUMsYUFBYSxjQUFHLFFBQVE7Ozs0QkF4RGpDLFlBQVksU0FBQyxhQUFhOytCQVExQixZQUFZLFNBQUMsZUFBZSxFQUFFLEVBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDOytCQUkvRCxTQUFTLFNBQUMsV0FBVyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQzt3QkFHckMsS0FBSyxTQUFDLE9BQU87d0JBR2IsS0FBSyxTQUFDLFlBQVk7NkJBTWxCLEtBQUssU0FBQyxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCb29sZWFuSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1RlbXBsYXRlUG9ydGFsfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZCxcbiAgSW5wdXQsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFRlbXBsYXRlUmVmLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdDb250YWluZXJSZWYsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5qZWN0LFxuICBPcHRpb25hbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NhbkRpc2FibGUsIENhbkRpc2FibGVDdG9yLCBtaXhpbkRpc2FibGVkfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcyc7XG5pbXBvcnQge01BVF9UQUJfQ09OVEVOVH0gZnJvbSAnLi90YWItY29udGVudCc7XG5pbXBvcnQge01BVF9UQUJfTEFCRUwsIE1hdFRhYkxhYmVsfSBmcm9tICcuL3RhYi1sYWJlbCc7XG5cblxuLy8gQm9pbGVycGxhdGUgZm9yIGFwcGx5aW5nIG1peGlucyB0byBNYXRUYWIuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuY2xhc3MgTWF0VGFiQmFzZSB7fVxuY29uc3QgX01hdFRhYk1peGluQmFzZTogQ2FuRGlzYWJsZUN0b3IgJiB0eXBlb2YgTWF0VGFiQmFzZSA9XG4gICAgbWl4aW5EaXNhYmxlZChNYXRUYWJCYXNlKTtcblxuLyoqXG4gKiBVc2VkIHRvIHByb3ZpZGUgYSB0YWIgZ3JvdXAgdG8gYSB0YWIgd2l0aG91dCBjYXVzaW5nIGEgY2lyY3VsYXIgZGVwZW5kZW5jeS5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IE1BVF9UQUJfR1JPVVAgPSBuZXcgSW5qZWN0aW9uVG9rZW48YW55PignTUFUX1RBQl9HUk9VUCcpO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtdGFiJyxcbiAgdGVtcGxhdGVVcmw6ICd0YWIuaHRtbCcsXG4gIGlucHV0czogWydkaXNhYmxlZCddLFxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFsaWRhdGUtZGVjb3JhdG9yc1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gIGV4cG9ydEFzOiAnbWF0VGFiJyxcbn0pXG5leHBvcnQgY2xhc3MgTWF0VGFiIGV4dGVuZHMgX01hdFRhYk1peGluQmFzZSBpbXBsZW1lbnRzIE9uSW5pdCwgQ2FuRGlzYWJsZSwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuICAvKiogQ29udGVudCBmb3IgdGhlIHRhYiBsYWJlbCBnaXZlbiBieSBgPG5nLXRlbXBsYXRlIG1hdC10YWItbGFiZWw+YC4gKi9cbiAgQENvbnRlbnRDaGlsZChNQVRfVEFCX0xBQkVMKVxuICBnZXQgdGVtcGxhdGVMYWJlbCgpOiBNYXRUYWJMYWJlbCB7IHJldHVybiB0aGlzLl90ZW1wbGF0ZUxhYmVsOyB9XG4gIHNldCB0ZW1wbGF0ZUxhYmVsKHZhbHVlOiBNYXRUYWJMYWJlbCkgeyB0aGlzLl9zZXRUZW1wbGF0ZUxhYmVsSW5wdXQodmFsdWUpOyB9XG4gIHByb3RlY3RlZCBfdGVtcGxhdGVMYWJlbDogTWF0VGFiTGFiZWw7XG5cbiAgLyoqXG4gICAqIFRlbXBsYXRlIHByb3ZpZGVkIGluIHRoZSB0YWIgY29udGVudCB0aGF0IHdpbGwgYmUgdXNlZCBpZiBwcmVzZW50LCB1c2VkIHRvIGVuYWJsZSBsYXp5LWxvYWRpbmdcbiAgICovXG4gIEBDb250ZW50Q2hpbGQoTUFUX1RBQl9DT05URU5ULCB7cmVhZDogVGVtcGxhdGVSZWYsIHN0YXRpYzogdHJ1ZX0pXG4gIF9leHBsaWNpdENvbnRlbnQ6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgLyoqIFRlbXBsYXRlIGluc2lkZSB0aGUgTWF0VGFiIHZpZXcgdGhhdCBjb250YWlucyBhbiBgPG5nLWNvbnRlbnQ+YC4gKi9cbiAgQFZpZXdDaGlsZChUZW1wbGF0ZVJlZiwge3N0YXRpYzogdHJ1ZX0pIF9pbXBsaWNpdENvbnRlbnQ6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgLyoqIFBsYWluIHRleHQgbGFiZWwgZm9yIHRoZSB0YWIsIHVzZWQgd2hlbiB0aGVyZSBpcyBubyB0ZW1wbGF0ZSBsYWJlbC4gKi9cbiAgQElucHV0KCdsYWJlbCcpIHRleHRMYWJlbDogc3RyaW5nID0gJyc7XG5cbiAgLyoqIEFyaWEgbGFiZWwgZm9yIHRoZSB0YWIuICovXG4gIEBJbnB1dCgnYXJpYS1sYWJlbCcpIGFyaWFMYWJlbDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBSZWZlcmVuY2UgdG8gdGhlIGVsZW1lbnQgdGhhdCB0aGUgdGFiIGlzIGxhYmVsbGVkIGJ5LlxuICAgKiBXaWxsIGJlIGNsZWFyZWQgaWYgYGFyaWEtbGFiZWxgIGlzIHNldCBhdCB0aGUgc2FtZSB0aW1lLlxuICAgKi9cbiAgQElucHV0KCdhcmlhLWxhYmVsbGVkYnknKSBhcmlhTGFiZWxsZWRieTogc3RyaW5nO1xuXG4gIC8qKiBQb3J0YWwgdGhhdCB3aWxsIGJlIHRoZSBob3N0ZWQgY29udGVudCBvZiB0aGUgdGFiICovXG4gIHByaXZhdGUgX2NvbnRlbnRQb3J0YWw6IFRlbXBsYXRlUG9ydGFsIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cbiAgZ2V0IGNvbnRlbnQoKTogVGVtcGxhdGVQb3J0YWwgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fY29udGVudFBvcnRhbDtcbiAgfVxuXG4gIC8qKiBFbWl0cyB3aGVuZXZlciB0aGUgaW50ZXJuYWwgc3RhdGUgb2YgdGhlIHRhYiBjaGFuZ2VzLiAqL1xuICByZWFkb25seSBfc3RhdGVDaGFuZ2VzID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKipcbiAgICogVGhlIHJlbGF0aXZlbHkgaW5kZXhlZCBwb3NpdGlvbiB3aGVyZSAwIHJlcHJlc2VudHMgdGhlIGNlbnRlciwgbmVnYXRpdmUgaXMgbGVmdCwgYW5kIHBvc2l0aXZlXG4gICAqIHJlcHJlc2VudHMgdGhlIHJpZ2h0LlxuICAgKi9cbiAgcG9zaXRpb246IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgaW5pdGlhbCByZWxhdGl2ZWx5IGluZGV4IG9yaWdpbiBvZiB0aGUgdGFiIGlmIGl0IHdhcyBjcmVhdGVkIGFuZCBzZWxlY3RlZCBhZnRlciB0aGVyZVxuICAgKiB3YXMgYWxyZWFkeSBhIHNlbGVjdGVkIHRhYi4gUHJvdmlkZXMgY29udGV4dCBvZiB3aGF0IHBvc2l0aW9uIHRoZSB0YWIgc2hvdWxkIG9yaWdpbmF0ZSBmcm9tLlxuICAgKi9cbiAgb3JpZ2luOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgdGFiIGlzIGN1cnJlbnRseSBhY3RpdmUuXG4gICAqL1xuICBpc0FjdGl2ZSA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgQEluamVjdChNQVRfVEFCX0dST1VQKSBAT3B0aW9uYWwoKSBwdWJsaWMgX2Nsb3Nlc3RUYWJHcm91cDogYW55KSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBpZiAoY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eSgndGV4dExhYmVsJykgfHwgY2hhbmdlcy5oYXNPd25Qcm9wZXJ0eSgnZGlzYWJsZWQnKSkge1xuICAgICAgdGhpcy5fc3RhdGVDaGFuZ2VzLm5leHQoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGF0ZUNoYW5nZXMuY29tcGxldGUoKTtcbiAgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbnRlbnRQb3J0YWwgPSBuZXcgVGVtcGxhdGVQb3J0YWwoXG4gICAgICAgIHRoaXMuX2V4cGxpY2l0Q29udGVudCB8fCB0aGlzLl9pbXBsaWNpdENvbnRlbnQsIHRoaXMuX3ZpZXdDb250YWluZXJSZWYpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaGFzIGJlZW4gZXh0cmFjdGVkIHRvIGEgdXRpbCBiZWNhdXNlIG9mIFRTIDQgYW5kIFZFLlxuICAgKiBWaWV3IEVuZ2luZSBkb2Vzbid0IHN1cHBvcnQgcHJvcGVydHkgcmVuYW1lIGluaGVyaXRhbmNlLlxuICAgKiBUUyA0LjAgZG9lc24ndCBhbGxvdyBwcm9wZXJ0aWVzIHRvIG92ZXJyaWRlIGFjY2Vzc29ycyBvciB2aWNlLXZlcnNhLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldFRlbXBsYXRlTGFiZWxJbnB1dCh2YWx1ZTogTWF0VGFiTGFiZWwpIHtcbiAgICAvLyBPbmx5IHVwZGF0ZSB0aGUgdGVtcGxhdGVMYWJlbCB2aWEgcXVlcnkgaWYgdGhlcmUgaXMgYWN0dWFsbHlcbiAgICAvLyBhIE1hdFRhYkxhYmVsIGZvdW5kLiBUaGlzIHdvcmtzIGFyb3VuZCBhbiBpc3N1ZSB3aGVyZSBhIHVzZXIgbWF5IGhhdmVcbiAgICAvLyBtYW51YWxseSBzZXQgYHRlbXBsYXRlTGFiZWxgIGR1cmluZyBjcmVhdGlvbiBtb2RlLCB3aGljaCB3b3VsZCB0aGVuIGdldCBjbG9iYmVyZWRcbiAgICAvLyBieSBgdW5kZWZpbmVkYCB3aGVuIHRoaXMgcXVlcnkgcmVzb2x2ZXMuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLl90ZW1wbGF0ZUxhYmVsID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2Rpc2FibGVkOiBCb29sZWFuSW5wdXQ7XG59XG4iXX0=