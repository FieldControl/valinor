/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ContentChild, Directive, ElementRef, Input, TemplateRef, Inject, Optional, } from '@angular/core';
import { mixinHasStickyInput } from './can-stick';
import { CDK_TABLE } from './tokens';
/**
 * Cell definition for a CDK table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
export class CdkCellDef {
    constructor(/** @docs-private */ template) {
        this.template = template;
    }
}
CdkCellDef.decorators = [
    { type: Directive, args: [{ selector: '[cdkCellDef]' },] }
];
CdkCellDef.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * Header cell definition for a CDK table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
export class CdkHeaderCellDef {
    constructor(/** @docs-private */ template) {
        this.template = template;
    }
}
CdkHeaderCellDef.decorators = [
    { type: Directive, args: [{ selector: '[cdkHeaderCellDef]' },] }
];
CdkHeaderCellDef.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * Footer cell definition for a CDK table.
 * Captures the template of a column's footer cell and as well as cell-specific properties.
 */
export class CdkFooterCellDef {
    constructor(/** @docs-private */ template) {
        this.template = template;
    }
}
CdkFooterCellDef.decorators = [
    { type: Directive, args: [{ selector: '[cdkFooterCellDef]' },] }
];
CdkFooterCellDef.ctorParameters = () => [
    { type: TemplateRef }
];
// Boilerplate for applying mixins to CdkColumnDef.
/** @docs-private */
class CdkColumnDefBase {
}
const _CdkColumnDefBase = mixinHasStickyInput(CdkColumnDefBase);
/**
 * Column definition for the CDK table.
 * Defines a set of cells available for a table column.
 */
export class CdkColumnDef extends _CdkColumnDefBase {
    constructor(_table) {
        super();
        this._table = _table;
        this._stickyEnd = false;
    }
    /** Unique name for this column. */
    get name() { return this._name; }
    set name(name) { this._setNameInput(name); }
    /**
     * Whether this column should be sticky positioned on the end of the row. Should make sure
     * that it mimics the `CanStick` mixin such that `_hasStickyChanged` is set to true if the value
     * has been changed.
     */
    get stickyEnd() {
        return this._stickyEnd;
    }
    set stickyEnd(v) {
        const prevValue = this._stickyEnd;
        this._stickyEnd = coerceBooleanProperty(v);
        this._hasStickyChanged = prevValue !== this._stickyEnd;
    }
    /**
     * Overridable method that sets the css classes that will be added to every cell in this
     * column.
     * In the future, columnCssClassName will change from type string[] to string and this
     * will set a single string value.
     * @docs-private
     */
    _updateColumnCssClassName() {
        this._columnCssClassName = [`cdk-column-${this.cssClassFriendlyName}`];
    }
    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    _setNameInput(value) {
        // If the directive is set without a name (updated programmatically), then this setter will
        // trigger with an empty string and should not overwrite the programmatically set value.
        if (value) {
            this._name = value;
            this.cssClassFriendlyName = value.replace(/[^a-z0-9_-]/ig, '-');
            this._updateColumnCssClassName();
        }
    }
}
CdkColumnDef.decorators = [
    { type: Directive, args: [{
                selector: '[cdkColumnDef]',
                inputs: ['sticky'],
                providers: [{ provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: CdkColumnDef }],
            },] }
];
CdkColumnDef.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [CDK_TABLE,] }, { type: Optional }] }
];
CdkColumnDef.propDecorators = {
    name: [{ type: Input, args: ['cdkColumnDef',] }],
    stickyEnd: [{ type: Input, args: ['stickyEnd',] }],
    cell: [{ type: ContentChild, args: [CdkCellDef,] }],
    headerCell: [{ type: ContentChild, args: [CdkHeaderCellDef,] }],
    footerCell: [{ type: ContentChild, args: [CdkFooterCellDef,] }]
};
/** Base class for the cells. Adds a CSS classname that identifies the column it renders in. */
export class BaseCdkCell {
    constructor(columnDef, elementRef) {
        // If IE 11 is dropped before we switch to setting a single class name, change to multi param
        // with destructuring.
        const classList = elementRef.nativeElement.classList;
        for (const className of columnDef._columnCssClassName) {
            classList.add(className);
        }
    }
}
/** Header cell template container that adds the right classes and role. */
export class CdkHeaderCell extends BaseCdkCell {
    constructor(columnDef, elementRef) {
        super(columnDef, elementRef);
    }
}
CdkHeaderCell.decorators = [
    { type: Directive, args: [{
                selector: 'cdk-header-cell, th[cdk-header-cell]',
                host: {
                    'class': 'cdk-header-cell',
                    'role': 'columnheader',
                },
            },] }
];
CdkHeaderCell.ctorParameters = () => [
    { type: CdkColumnDef },
    { type: ElementRef }
];
/** Footer cell template container that adds the right classes and role. */
export class CdkFooterCell extends BaseCdkCell {
    constructor(columnDef, elementRef) {
        super(columnDef, elementRef);
    }
}
CdkFooterCell.decorators = [
    { type: Directive, args: [{
                selector: 'cdk-footer-cell, td[cdk-footer-cell]',
                host: {
                    'class': 'cdk-footer-cell',
                    'role': 'gridcell',
                },
            },] }
];
CdkFooterCell.ctorParameters = () => [
    { type: CdkColumnDef },
    { type: ElementRef }
];
/** Cell template container that adds the right classes and role. */
export class CdkCell extends BaseCdkCell {
    constructor(columnDef, elementRef) {
        super(columnDef, elementRef);
    }
}
CdkCell.decorators = [
    { type: Directive, args: [{
                selector: 'cdk-cell, td[cdk-cell]',
                host: {
                    'class': 'cdk-cell',
                    'role': 'gridcell',
                },
            },] }
];
CdkCell.ctorParameters = () => [
    { type: CdkColumnDef },
    { type: ElementRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdGFibGUvY2VsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQWUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQ0wsWUFBWSxFQUNaLFNBQVMsRUFDVCxVQUFVLEVBQ1YsS0FBSyxFQUNMLFdBQVcsRUFDWCxNQUFNLEVBQ04sUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBeUIsbUJBQW1CLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEUsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQVFuQzs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sVUFBVTtJQUNyQixZQUFZLG9CQUFvQixDQUFRLFFBQTBCO1FBQTFCLGFBQVEsR0FBUixRQUFRLENBQWtCO0lBQUcsQ0FBQzs7O1lBRnZFLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUM7OztZQWpCbkMsV0FBVzs7QUFzQmI7OztHQUdHO0FBRUgsTUFBTSxPQUFPLGdCQUFnQjtJQUMzQixZQUFZLG9CQUFvQixDQUFRLFFBQTBCO1FBQTFCLGFBQVEsR0FBUixRQUFRLENBQWtCO0lBQUcsQ0FBQzs7O1lBRnZFLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxvQkFBb0IsRUFBQzs7O1lBMUJ6QyxXQUFXOztBQStCYjs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQVksb0JBQW9CLENBQVEsUUFBMEI7UUFBMUIsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7SUFBRyxDQUFDOzs7WUFGdkUsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLG9CQUFvQixFQUFDOzs7WUFuQ3pDLFdBQVc7O0FBd0NiLG1EQUFtRDtBQUNuRCxvQkFBb0I7QUFDcEIsTUFBTSxnQkFBZ0I7Q0FBRztBQUN6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U0FBUSxXQUFXO0lBQzVDLFlBQVksU0FBdUIsRUFBRSxVQUFzQjtRQUN6RCxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQy9CLENBQUM7OztZQVZGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsc0NBQXNDO2dCQUNoRCxJQUFJLEVBQUU7b0JBQ0osT0FBTyxFQUFFLGlCQUFpQjtvQkFDMUIsTUFBTSxFQUFFLFVBQVU7aUJBQ25CO2FBQ0Y7OztZQUV3QixZQUFZO1lBNUtuQyxVQUFVOztBQWlMWixvRUFBb0U7QUFRcEUsTUFBTSxPQUFPLE9BQVEsU0FBUSxXQUFXO0lBQ3RDLFlBQVksU0FBdUIsRUFBRSxVQUFzQjtRQUN6RCxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQy9CLENBQUM7OztZQVZGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsd0JBQXdCO2dCQUNsQyxJQUFJLEVBQUU7b0JBQ0osT0FBTyxFQUFFLFVBQVU7b0JBQ25CLE1BQU0sRUFBRSxVQUFVO2lCQUNuQjthQUNGOzs7WUFFd0IsWUFBWTtZQTFMbkMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtcbiAgQ29udGVudENoaWxkLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIElucHV0LFxuICBUZW1wbGF0ZVJlZixcbiAgSW5qZWN0LFxuICBPcHRpb25hbCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NhblN0aWNrLCBDYW5TdGlja0N0b3IsIG1peGluSGFzU3RpY2t5SW5wdXR9IGZyb20gJy4vY2FuLXN0aWNrJztcbmltcG9ydCB7Q0RLX1RBQkxFfSBmcm9tICcuL3Rva2Vucyc7XG5cblxuLyoqIEJhc2UgaW50ZXJmYWNlIGZvciBhIGNlbGwgZGVmaW5pdGlvbi4gQ2FwdHVyZXMgYSBjb2x1bW4ncyBjZWxsIHRlbXBsYXRlIGRlZmluaXRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIENlbGxEZWYge1xuICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55Pjtcbn1cblxuLyoqXG4gKiBDZWxsIGRlZmluaXRpb24gZm9yIGEgQ0RLIHRhYmxlLlxuICogQ2FwdHVyZXMgdGhlIHRlbXBsYXRlIG9mIGEgY29sdW1uJ3MgZGF0YSByb3cgY2VsbCBhcyB3ZWxsIGFzIGNlbGwtc3BlY2lmaWMgcHJvcGVydGllcy5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbY2RrQ2VsbERlZl0nfSlcbmV4cG9ydCBjbGFzcyBDZGtDZWxsRGVmIGltcGxlbWVudHMgQ2VsbERlZiB7XG4gIGNvbnN0cnVjdG9yKC8qKiBAZG9jcy1wcml2YXRlICovIHB1YmxpYyB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55Pikge31cbn1cblxuLyoqXG4gKiBIZWFkZXIgY2VsbCBkZWZpbml0aW9uIGZvciBhIENESyB0YWJsZS5cbiAqIENhcHR1cmVzIHRoZSB0ZW1wbGF0ZSBvZiBhIGNvbHVtbidzIGhlYWRlciBjZWxsIGFuZCBhcyB3ZWxsIGFzIGNlbGwtc3BlY2lmaWMgcHJvcGVydGllcy5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbY2RrSGVhZGVyQ2VsbERlZl0nfSlcbmV4cG9ydCBjbGFzcyBDZGtIZWFkZXJDZWxsRGVmIGltcGxlbWVudHMgQ2VsbERlZiB7XG4gIGNvbnN0cnVjdG9yKC8qKiBAZG9jcy1wcml2YXRlICovIHB1YmxpYyB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55Pikge31cbn1cblxuLyoqXG4gKiBGb290ZXIgY2VsbCBkZWZpbml0aW9uIGZvciBhIENESyB0YWJsZS5cbiAqIENhcHR1cmVzIHRoZSB0ZW1wbGF0ZSBvZiBhIGNvbHVtbidzIGZvb3RlciBjZWxsIGFuZCBhcyB3ZWxsIGFzIGNlbGwtc3BlY2lmaWMgcHJvcGVydGllcy5cbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbY2RrRm9vdGVyQ2VsbERlZl0nfSlcbmV4cG9ydCBjbGFzcyBDZGtGb290ZXJDZWxsRGVmIGltcGxlbWVudHMgQ2VsbERlZiB7XG4gIGNvbnN0cnVjdG9yKC8qKiBAZG9jcy1wcml2YXRlICovIHB1YmxpYyB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55Pikge31cbn1cblxuLy8gQm9pbGVycGxhdGUgZm9yIGFwcGx5aW5nIG1peGlucyB0byBDZGtDb2x1bW5EZWYuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuY2xhc3MgQ2RrQ29sdW1uRGVmQmFzZSB7fVxuY29uc3QgX0Nka0NvbHVtbkRlZkJhc2U6IENhblN0aWNrQ3RvciZ0eXBlb2YgQ2RrQ29sdW1uRGVmQmFzZSA9XG4gICAgbWl4aW5IYXNTdGlja3lJbnB1dChDZGtDb2x1bW5EZWZCYXNlKTtcblxuLyoqXG4gKiBDb2x1bW4gZGVmaW5pdGlvbiBmb3IgdGhlIENESyB0YWJsZS5cbiAqIERlZmluZXMgYSBzZXQgb2YgY2VsbHMgYXZhaWxhYmxlIGZvciBhIHRhYmxlIGNvbHVtbi5cbiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnW2Nka0NvbHVtbkRlZl0nLFxuICBpbnB1dHM6IFsnc3RpY2t5J10sXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiAnTUFUX1NPUlRfSEVBREVSX0NPTFVNTl9ERUYnLCB1c2VFeGlzdGluZzogQ2RrQ29sdW1uRGVmfV0sXG59KVxuZXhwb3J0IGNsYXNzIENka0NvbHVtbkRlZiBleHRlbmRzIF9DZGtDb2x1bW5EZWZCYXNlIGltcGxlbWVudHMgQ2FuU3RpY2sge1xuICAvKiogVW5pcXVlIG5hbWUgZm9yIHRoaXMgY29sdW1uLiAqL1xuICBASW5wdXQoJ2Nka0NvbHVtbkRlZicpXG4gIGdldCBuYW1lKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9uYW1lOyB9XG4gIHNldCBuYW1lKG5hbWU6IHN0cmluZykgeyB0aGlzLl9zZXROYW1lSW5wdXQobmFtZSk7IH1cbiAgcHJvdGVjdGVkIF9uYW1lOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBjb2x1bW4gc2hvdWxkIGJlIHN0aWNreSBwb3NpdGlvbmVkIG9uIHRoZSBlbmQgb2YgdGhlIHJvdy4gU2hvdWxkIG1ha2Ugc3VyZVxuICAgKiB0aGF0IGl0IG1pbWljcyB0aGUgYENhblN0aWNrYCBtaXhpbiBzdWNoIHRoYXQgYF9oYXNTdGlja3lDaGFuZ2VkYCBpcyBzZXQgdG8gdHJ1ZSBpZiB0aGUgdmFsdWVcbiAgICogaGFzIGJlZW4gY2hhbmdlZC5cbiAgICovXG4gIEBJbnB1dCgnc3RpY2t5RW5kJylcbiAgZ2V0IHN0aWNreUVuZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fc3RpY2t5RW5kO1xuICB9XG4gIHNldCBzdGlja3lFbmQodjogYm9vbGVhbikge1xuICAgIGNvbnN0IHByZXZWYWx1ZSA9IHRoaXMuX3N0aWNreUVuZDtcbiAgICB0aGlzLl9zdGlja3lFbmQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodik7XG4gICAgdGhpcy5faGFzU3RpY2t5Q2hhbmdlZCA9IHByZXZWYWx1ZSAhPT0gdGhpcy5fc3RpY2t5RW5kO1xuICB9XG4gIF9zdGlja3lFbmQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAvKiogQGRvY3MtcHJpdmF0ZSAqL1xuICBAQ29udGVudENoaWxkKENka0NlbGxEZWYpIGNlbGw6IENka0NlbGxEZWY7XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cbiAgQENvbnRlbnRDaGlsZChDZGtIZWFkZXJDZWxsRGVmKSBoZWFkZXJDZWxsOiBDZGtIZWFkZXJDZWxsRGVmO1xuXG4gIC8qKiBAZG9jcy1wcml2YXRlICovXG4gIEBDb250ZW50Q2hpbGQoQ2RrRm9vdGVyQ2VsbERlZikgZm9vdGVyQ2VsbDogQ2RrRm9vdGVyQ2VsbERlZjtcblxuICAvKipcbiAgICogVHJhbnNmb3JtZWQgdmVyc2lvbiBvZiB0aGUgY29sdW1uIG5hbWUgdGhhdCBjYW4gYmUgdXNlZCBhcyBwYXJ0IG9mIGEgQ1NTIGNsYXNzbmFtZS4gRXhjbHVkZXNcbiAgICogYWxsIG5vbi1hbHBoYW51bWVyaWMgY2hhcmFjdGVycyBhbmQgdGhlIHNwZWNpYWwgY2hhcmFjdGVycyAnLScgYW5kICdfJy4gQW55IGNoYXJhY3RlcnMgdGhhdFxuICAgKiBkbyBub3QgbWF0Y2ggYXJlIHJlcGxhY2VkIGJ5IHRoZSAnLScgY2hhcmFjdGVyLlxuICAgKi9cbiAgY3NzQ2xhc3NGcmllbmRseU5hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogQ2xhc3MgbmFtZSBmb3IgY2VsbHMgaW4gdGhpcyBjb2x1bW4uXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIF9jb2x1bW5Dc3NDbGFzc05hbWU6IHN0cmluZ1tdO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoQ0RLX1RBQkxFKSBAT3B0aW9uYWwoKSBwdWJsaWMgX3RhYmxlPzogYW55KSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkYWJsZSBtZXRob2QgdGhhdCBzZXRzIHRoZSBjc3MgY2xhc3NlcyB0aGF0IHdpbGwgYmUgYWRkZWQgdG8gZXZlcnkgY2VsbCBpbiB0aGlzXG4gICAqIGNvbHVtbi5cbiAgICogSW4gdGhlIGZ1dHVyZSwgY29sdW1uQ3NzQ2xhc3NOYW1lIHdpbGwgY2hhbmdlIGZyb20gdHlwZSBzdHJpbmdbXSB0byBzdHJpbmcgYW5kIHRoaXNcbiAgICogd2lsbCBzZXQgYSBzaW5nbGUgc3RyaW5nIHZhbHVlLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3VwZGF0ZUNvbHVtbkNzc0NsYXNzTmFtZSgpIHtcbiAgICB0aGlzLl9jb2x1bW5Dc3NDbGFzc05hbWUgPSBbYGNkay1jb2x1bW4tJHt0aGlzLmNzc0NsYXNzRnJpZW5kbHlOYW1lfWBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaGFzIGJlZW4gZXh0cmFjdGVkIHRvIGEgdXRpbCBiZWNhdXNlIG9mIFRTIDQgYW5kIFZFLlxuICAgKiBWaWV3IEVuZ2luZSBkb2Vzbid0IHN1cHBvcnQgcHJvcGVydHkgcmVuYW1lIGluaGVyaXRhbmNlLlxuICAgKiBUUyA0LjAgZG9lc24ndCBhbGxvdyBwcm9wZXJ0aWVzIHRvIG92ZXJyaWRlIGFjY2Vzc29ycyBvciB2aWNlLXZlcnNhLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldE5hbWVJbnB1dCh2YWx1ZTogc3RyaW5nKSB7XG4gICAgLy8gSWYgdGhlIGRpcmVjdGl2ZSBpcyBzZXQgd2l0aG91dCBhIG5hbWUgKHVwZGF0ZWQgcHJvZ3JhbW1hdGljYWxseSksIHRoZW4gdGhpcyBzZXR0ZXIgd2lsbFxuICAgIC8vIHRyaWdnZXIgd2l0aCBhbiBlbXB0eSBzdHJpbmcgYW5kIHNob3VsZCBub3Qgb3ZlcndyaXRlIHRoZSBwcm9ncmFtbWF0aWNhbGx5IHNldCB2YWx1ZS5cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIHRoaXMuX25hbWUgPSB2YWx1ZTtcbiAgICAgIHRoaXMuY3NzQ2xhc3NGcmllbmRseU5hbWUgPSB2YWx1ZS5yZXBsYWNlKC9bXmEtejAtOV8tXS9pZywgJy0nKTtcbiAgICAgIHRoaXMuX3VwZGF0ZUNvbHVtbkNzc0NsYXNzTmFtZSgpO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdGlja3k6IEJvb2xlYW5JbnB1dDtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N0aWNreUVuZDogQm9vbGVhbklucHV0O1xufVxuXG4vKiogQmFzZSBjbGFzcyBmb3IgdGhlIGNlbGxzLiBBZGRzIGEgQ1NTIGNsYXNzbmFtZSB0aGF0IGlkZW50aWZpZXMgdGhlIGNvbHVtbiBpdCByZW5kZXJzIGluLiAqL1xuZXhwb3J0IGNsYXNzIEJhc2VDZGtDZWxsIHtcbiAgY29uc3RydWN0b3IoY29sdW1uRGVmOiBDZGtDb2x1bW5EZWYsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAvLyBJZiBJRSAxMSBpcyBkcm9wcGVkIGJlZm9yZSB3ZSBzd2l0Y2ggdG8gc2V0dGluZyBhIHNpbmdsZSBjbGFzcyBuYW1lLCBjaGFuZ2UgdG8gbXVsdGkgcGFyYW1cbiAgICAvLyB3aXRoIGRlc3RydWN0dXJpbmcuXG4gICAgY29uc3QgY2xhc3NMaXN0ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdDtcbiAgICBmb3IgKGNvbnN0IGNsYXNzTmFtZSBvZiBjb2x1bW5EZWYuX2NvbHVtbkNzc0NsYXNzTmFtZSkge1xuICAgICAgY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgIH1cbiAgfVxufVxuXG4vKiogSGVhZGVyIGNlbGwgdGVtcGxhdGUgY29udGFpbmVyIHRoYXQgYWRkcyB0aGUgcmlnaHQgY2xhc3NlcyBhbmQgcm9sZS4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2Nkay1oZWFkZXItY2VsbCwgdGhbY2RrLWhlYWRlci1jZWxsXScsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnY2RrLWhlYWRlci1jZWxsJyxcbiAgICAncm9sZSc6ICdjb2x1bW5oZWFkZXInLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtIZWFkZXJDZWxsIGV4dGVuZHMgQmFzZUNka0NlbGwge1xuICBjb25zdHJ1Y3Rvcihjb2x1bW5EZWY6IENka0NvbHVtbkRlZiwgZWxlbWVudFJlZjogRWxlbWVudFJlZikge1xuICAgIHN1cGVyKGNvbHVtbkRlZiwgZWxlbWVudFJlZik7XG4gIH1cbn1cblxuLyoqIEZvb3RlciBjZWxsIHRlbXBsYXRlIGNvbnRhaW5lciB0aGF0IGFkZHMgdGhlIHJpZ2h0IGNsYXNzZXMgYW5kIHJvbGUuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdjZGstZm9vdGVyLWNlbGwsIHRkW2Nkay1mb290ZXItY2VsbF0nLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay1mb290ZXItY2VsbCcsXG4gICAgJ3JvbGUnOiAnZ3JpZGNlbGwnLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtGb290ZXJDZWxsIGV4dGVuZHMgQmFzZUNka0NlbGwge1xuICBjb25zdHJ1Y3Rvcihjb2x1bW5EZWY6IENka0NvbHVtbkRlZiwgZWxlbWVudFJlZjogRWxlbWVudFJlZikge1xuICAgIHN1cGVyKGNvbHVtbkRlZiwgZWxlbWVudFJlZik7XG4gIH1cbn1cblxuLyoqIENlbGwgdGVtcGxhdGUgY29udGFpbmVyIHRoYXQgYWRkcyB0aGUgcmlnaHQgY2xhc3NlcyBhbmQgcm9sZS4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2Nkay1jZWxsLCB0ZFtjZGstY2VsbF0nLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay1jZWxsJyxcbiAgICAncm9sZSc6ICdncmlkY2VsbCcsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka0NlbGwgZXh0ZW5kcyBCYXNlQ2RrQ2VsbCB7XG4gIGNvbnN0cnVjdG9yKGNvbHVtbkRlZjogQ2RrQ29sdW1uRGVmLCBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgc3VwZXIoY29sdW1uRGVmLCBlbGVtZW50UmVmKTtcbiAgfVxufVxuIl19