/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ContentChild, Directive, ElementRef, Inject, Input, Optional, TemplateRef, } from '@angular/core';
import { mixinHasStickyInput } from './can-stick';
import { CDK_TABLE } from './tokens';
import * as i0 from "@angular/core";
/**
 * Cell definition for a CDK table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
export class CdkCellDef {
    constructor(/** @docs-private */ template) {
        this.template = template;
    }
}
CdkCellDef.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkCellDef, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkCellDef.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkCellDef, selector: "[cdkCellDef]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkCellDef, decorators: [{
            type: Directive,
            args: [{ selector: '[cdkCellDef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }]; } });
/**
 * Header cell definition for a CDK table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
export class CdkHeaderCellDef {
    constructor(/** @docs-private */ template) {
        this.template = template;
    }
}
CdkHeaderCellDef.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkHeaderCellDef, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkHeaderCellDef.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkHeaderCellDef, selector: "[cdkHeaderCellDef]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkHeaderCellDef, decorators: [{
            type: Directive,
            args: [{ selector: '[cdkHeaderCellDef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }]; } });
/**
 * Footer cell definition for a CDK table.
 * Captures the template of a column's footer cell and as well as cell-specific properties.
 */
export class CdkFooterCellDef {
    constructor(/** @docs-private */ template) {
        this.template = template;
    }
}
CdkFooterCellDef.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkFooterCellDef, deps: [{ token: i0.TemplateRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkFooterCellDef.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkFooterCellDef, selector: "[cdkFooterCellDef]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkFooterCellDef, decorators: [{
            type: Directive,
            args: [{ selector: '[cdkFooterCellDef]' }]
        }], ctorParameters: function () { return [{ type: i0.TemplateRef }]; } });
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
    /** Unique name for this column. */
    get name() {
        return this._name;
    }
    set name(name) {
        this._setNameInput(name);
    }
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
    constructor(_table) {
        super();
        this._table = _table;
        this._stickyEnd = false;
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
            this.cssClassFriendlyName = value.replace(/[^a-z0-9_-]/gi, '-');
            this._updateColumnCssClassName();
        }
    }
}
CdkColumnDef.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkColumnDef, deps: [{ token: CDK_TABLE, optional: true }], target: i0.ɵɵFactoryTarget.Directive });
CdkColumnDef.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkColumnDef, selector: "[cdkColumnDef]", inputs: { sticky: "sticky", name: ["cdkColumnDef", "name"], stickyEnd: "stickyEnd" }, providers: [{ provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: CdkColumnDef }], queries: [{ propertyName: "cell", first: true, predicate: CdkCellDef, descendants: true }, { propertyName: "headerCell", first: true, predicate: CdkHeaderCellDef, descendants: true }, { propertyName: "footerCell", first: true, predicate: CdkFooterCellDef, descendants: true }], usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkColumnDef, decorators: [{
            type: Directive,
            args: [{
                    selector: '[cdkColumnDef]',
                    inputs: ['sticky'],
                    providers: [{ provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: CdkColumnDef }],
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [CDK_TABLE]
                }, {
                    type: Optional
                }] }]; }, propDecorators: { name: [{
                type: Input,
                args: ['cdkColumnDef']
            }], stickyEnd: [{
                type: Input,
                args: ['stickyEnd']
            }], cell: [{
                type: ContentChild,
                args: [CdkCellDef]
            }], headerCell: [{
                type: ContentChild,
                args: [CdkHeaderCellDef]
            }], footerCell: [{
                type: ContentChild,
                args: [CdkFooterCellDef]
            }] } });
/** Base class for the cells. Adds a CSS classname that identifies the column it renders in. */
export class BaseCdkCell {
    constructor(columnDef, elementRef) {
        elementRef.nativeElement.classList.add(...columnDef._columnCssClassName);
    }
}
/** Header cell template container that adds the right classes and role. */
export class CdkHeaderCell extends BaseCdkCell {
    constructor(columnDef, elementRef) {
        super(columnDef, elementRef);
    }
}
CdkHeaderCell.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkHeaderCell, deps: [{ token: CdkColumnDef }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkHeaderCell.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkHeaderCell, selector: "cdk-header-cell, th[cdk-header-cell]", host: { attributes: { "role": "columnheader" }, classAttribute: "cdk-header-cell" }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkHeaderCell, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-header-cell, th[cdk-header-cell]',
                    host: {
                        'class': 'cdk-header-cell',
                        'role': 'columnheader',
                    },
                }]
        }], ctorParameters: function () { return [{ type: CdkColumnDef }, { type: i0.ElementRef }]; } });
/** Footer cell template container that adds the right classes and role. */
export class CdkFooterCell extends BaseCdkCell {
    constructor(columnDef, elementRef) {
        super(columnDef, elementRef);
        if (columnDef._table?._elementRef.nativeElement.nodeType === 1) {
            const tableRole = columnDef._table._elementRef.nativeElement.getAttribute('role');
            const role = tableRole === 'grid' || tableRole === 'treegrid' ? 'gridcell' : 'cell';
            elementRef.nativeElement.setAttribute('role', role);
        }
    }
}
CdkFooterCell.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkFooterCell, deps: [{ token: CdkColumnDef }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkFooterCell.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkFooterCell, selector: "cdk-footer-cell, td[cdk-footer-cell]", host: { classAttribute: "cdk-footer-cell" }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkFooterCell, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-footer-cell, td[cdk-footer-cell]',
                    host: {
                        'class': 'cdk-footer-cell',
                    },
                }]
        }], ctorParameters: function () { return [{ type: CdkColumnDef }, { type: i0.ElementRef }]; } });
/** Cell template container that adds the right classes and role. */
export class CdkCell extends BaseCdkCell {
    constructor(columnDef, elementRef) {
        super(columnDef, elementRef);
        if (columnDef._table?._elementRef.nativeElement.nodeType === 1) {
            const tableRole = columnDef._table._elementRef.nativeElement.getAttribute('role');
            const role = tableRole === 'grid' || tableRole === 'treegrid' ? 'gridcell' : 'cell';
            elementRef.nativeElement.setAttribute('role', role);
        }
    }
}
CdkCell.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkCell, deps: [{ token: CdkColumnDef }, { token: i0.ElementRef }], target: i0.ɵɵFactoryTarget.Directive });
CdkCell.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkCell, selector: "cdk-cell, td[cdk-cell]", host: { classAttribute: "cdk-cell" }, usesInheritance: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkCell, decorators: [{
            type: Directive,
            args: [{
                    selector: 'cdk-cell, td[cdk-cell]',
                    host: {
                        'class': 'cdk-cell',
                    },
                }]
        }], ctorParameters: function () { return [{ type: CdkColumnDef }, { type: i0.ElementRef }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdGFibGUvY2VsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQWUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQ0wsWUFBWSxFQUNaLFNBQVMsRUFDVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFDTCxRQUFRLEVBQ1IsV0FBVyxHQUNaLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBeUIsbUJBQW1CLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEUsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFVBQVUsQ0FBQzs7QUFPbkM7OztHQUdHO0FBRUgsTUFBTSxPQUFPLFVBQVU7SUFDckIsWUFBWSxvQkFBb0IsQ0FBUSxRQUEwQjtRQUExQixhQUFRLEdBQVIsUUFBUSxDQUFrQjtJQUFHLENBQUM7OzRHQUQzRCxVQUFVO2dHQUFWLFVBQVU7Z0dBQVYsVUFBVTtrQkFEdEIsU0FBUzttQkFBQyxFQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUM7O0FBS3JDOzs7R0FHRztBQUVILE1BQU0sT0FBTyxnQkFBZ0I7SUFDM0IsWUFBWSxvQkFBb0IsQ0FBUSxRQUEwQjtRQUExQixhQUFRLEdBQVIsUUFBUSxDQUFrQjtJQUFHLENBQUM7O2tIQUQzRCxnQkFBZ0I7c0dBQWhCLGdCQUFnQjtnR0FBaEIsZ0JBQWdCO2tCQUQ1QixTQUFTO21CQUFDLEVBQUMsUUFBUSxFQUFFLG9CQUFvQixFQUFDOztBQUszQzs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQVksb0JBQW9CLENBQVEsUUFBMEI7UUFBMUIsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7SUFBRyxDQUFDOztrSEFEM0QsZ0JBQWdCO3NHQUFoQixnQkFBZ0I7Z0dBQWhCLGdCQUFnQjtrQkFENUIsU0FBUzttQkFBQyxF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QyxhQUFhLENBQUMsUUFBUSxLQUFLLENBQUMsRUFBRTtZQUM5RCxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sSUFBSSxHQUFHLFNBQVMsS0FBSyxNQUFNLElBQUksU0FBUyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDcEYsVUFBVSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3JEO0lBQ0gsQ0FBQzs7eUdBUlUsT0FBTzs2RkFBUCxPQUFPO2dHQUFQLE9BQU87a0JBTm5CLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLHdCQUF3QjtvQkFDbEMsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSxVQUFVO3FCQUNwQjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jvb2xlYW5JbnB1dCwgY29lcmNlQm9vbGVhblByb3BlcnR5fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtcbiAgQ29udGVudENoaWxkLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgSW5wdXQsXG4gIE9wdGlvbmFsLFxuICBUZW1wbGF0ZVJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0NhblN0aWNrLCBDYW5TdGlja0N0b3IsIG1peGluSGFzU3RpY2t5SW5wdXR9IGZyb20gJy4vY2FuLXN0aWNrJztcbmltcG9ydCB7Q0RLX1RBQkxFfSBmcm9tICcuL3Rva2Vucyc7XG5cbi8qKiBCYXNlIGludGVyZmFjZSBmb3IgYSBjZWxsIGRlZmluaXRpb24uIENhcHR1cmVzIGEgY29sdW1uJ3MgY2VsbCB0ZW1wbGF0ZSBkZWZpbml0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDZWxsRGVmIHtcbiAgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG59XG5cbi8qKlxuICogQ2VsbCBkZWZpbml0aW9uIGZvciBhIENESyB0YWJsZS5cbiAqIENhcHR1cmVzIHRoZSB0ZW1wbGF0ZSBvZiBhIGNvbHVtbidzIGRhdGEgcm93IGNlbGwgYXMgd2VsbCBhcyBjZWxsLXNwZWNpZmljIHByb3BlcnRpZXMuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW2Nka0NlbGxEZWZdJ30pXG5leHBvcnQgY2xhc3MgQ2RrQ2VsbERlZiBpbXBsZW1lbnRzIENlbGxEZWYge1xuICBjb25zdHJ1Y3RvcigvKiogQGRvY3MtcHJpdmF0ZSAqLyBwdWJsaWMgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT4pIHt9XG59XG5cbi8qKlxuICogSGVhZGVyIGNlbGwgZGVmaW5pdGlvbiBmb3IgYSBDREsgdGFibGUuXG4gKiBDYXB0dXJlcyB0aGUgdGVtcGxhdGUgb2YgYSBjb2x1bW4ncyBoZWFkZXIgY2VsbCBhbmQgYXMgd2VsbCBhcyBjZWxsLXNwZWNpZmljIHByb3BlcnRpZXMuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW2Nka0hlYWRlckNlbGxEZWZdJ30pXG5leHBvcnQgY2xhc3MgQ2RrSGVhZGVyQ2VsbERlZiBpbXBsZW1lbnRzIENlbGxEZWYge1xuICBjb25zdHJ1Y3RvcigvKiogQGRvY3MtcHJpdmF0ZSAqLyBwdWJsaWMgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT4pIHt9XG59XG5cbi8qKlxuICogRm9vdGVyIGNlbGwgZGVmaW5pdGlvbiBmb3IgYSBDREsgdGFibGUuXG4gKiBDYXB0dXJlcyB0aGUgdGVtcGxhdGUgb2YgYSBjb2x1bW4ncyBmb290ZXIgY2VsbCBhbmQgYXMgd2VsbCBhcyBjZWxsLXNwZWNpZmljIHByb3BlcnRpZXMuXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW2Nka0Zvb3RlckNlbGxEZWZdJ30pXG5leHBvcnQgY2xhc3MgQ2RrRm9vdGVyQ2VsbERlZiBpbXBsZW1lbnRzIENlbGxEZWYge1xuICBjb25zdHJ1Y3RvcigvKiogQGRvY3MtcHJpdmF0ZSAqLyBwdWJsaWMgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT4pIHt9XG59XG5cbi8vIEJvaWxlcnBsYXRlIGZvciBhcHBseWluZyBtaXhpbnMgdG8gQ2RrQ29sdW1uRGVmLlxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmNsYXNzIENka0NvbHVtbkRlZkJhc2Uge31cbmNvbnN0IF9DZGtDb2x1bW5EZWZCYXNlOiBDYW5TdGlja0N0b3IgJiB0eXBlb2YgQ2RrQ29sdW1uRGVmQmFzZSA9XG4gIG1peGluSGFzU3RpY2t5SW5wdXQoQ2RrQ29sdW1uRGVmQmFzZSk7XG5cbi8qKlxuICogQ29sdW1uIGRlZmluaXRpb24gZm9yIHRoZSBDREsgdGFibGUuXG4gKiBEZWZpbmVzIGEgc2V0IG9mIGNlbGxzIGF2YWlsYWJsZSBmb3IgYSB0YWJsZSBjb2x1bW4uXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tjZGtDb2x1bW5EZWZdJyxcbiAgaW5wdXRzOiBbJ3N0aWNreSddLFxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogJ01BVF9TT1JUX0hFQURFUl9DT0xVTU5fREVGJywgdXNlRXhpc3Rpbmc6IENka0NvbHVtbkRlZn1dLFxufSlcbmV4cG9ydCBjbGFzcyBDZGtDb2x1bW5EZWYgZXh0ZW5kcyBfQ2RrQ29sdW1uRGVmQmFzZSBpbXBsZW1lbnRzIENhblN0aWNrIHtcbiAgLyoqIFVuaXF1ZSBuYW1lIGZvciB0aGlzIGNvbHVtbi4gKi9cbiAgQElucHV0KCdjZGtDb2x1bW5EZWYnKVxuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICB9XG4gIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuX3NldE5hbWVJbnB1dChuYW1lKTtcbiAgfVxuICBwcm90ZWN0ZWQgX25hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIGNvbHVtbiBzaG91bGQgYmUgc3RpY2t5IHBvc2l0aW9uZWQgb24gdGhlIGVuZCBvZiB0aGUgcm93LiBTaG91bGQgbWFrZSBzdXJlXG4gICAqIHRoYXQgaXQgbWltaWNzIHRoZSBgQ2FuU3RpY2tgIG1peGluIHN1Y2ggdGhhdCBgX2hhc1N0aWNreUNoYW5nZWRgIGlzIHNldCB0byB0cnVlIGlmIHRoZSB2YWx1ZVxuICAgKiBoYXMgYmVlbiBjaGFuZ2VkLlxuICAgKi9cbiAgQElucHV0KCdzdGlja3lFbmQnKVxuICBnZXQgc3RpY2t5RW5kKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdGlja3lFbmQ7XG4gIH1cbiAgc2V0IHN0aWNreUVuZCh2OiBCb29sZWFuSW5wdXQpIHtcbiAgICBjb25zdCBwcmV2VmFsdWUgPSB0aGlzLl9zdGlja3lFbmQ7XG4gICAgdGhpcy5fc3RpY2t5RW5kID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHYpO1xuICAgIHRoaXMuX2hhc1N0aWNreUNoYW5nZWQgPSBwcmV2VmFsdWUgIT09IHRoaXMuX3N0aWNreUVuZDtcbiAgfVxuICBfc3RpY2t5RW5kOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cbiAgQENvbnRlbnRDaGlsZChDZGtDZWxsRGVmKSBjZWxsOiBDZGtDZWxsRGVmO1xuXG4gIC8qKiBAZG9jcy1wcml2YXRlICovXG4gIEBDb250ZW50Q2hpbGQoQ2RrSGVhZGVyQ2VsbERlZikgaGVhZGVyQ2VsbDogQ2RrSGVhZGVyQ2VsbERlZjtcblxuICAvKiogQGRvY3MtcHJpdmF0ZSAqL1xuICBAQ29udGVudENoaWxkKENka0Zvb3RlckNlbGxEZWYpIGZvb3RlckNlbGw6IENka0Zvb3RlckNlbGxEZWY7XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybWVkIHZlcnNpb24gb2YgdGhlIGNvbHVtbiBuYW1lIHRoYXQgY2FuIGJlIHVzZWQgYXMgcGFydCBvZiBhIENTUyBjbGFzc25hbWUuIEV4Y2x1ZGVzXG4gICAqIGFsbCBub24tYWxwaGFudW1lcmljIGNoYXJhY3RlcnMgYW5kIHRoZSBzcGVjaWFsIGNoYXJhY3RlcnMgJy0nIGFuZCAnXycuIEFueSBjaGFyYWN0ZXJzIHRoYXRcbiAgICogZG8gbm90IG1hdGNoIGFyZSByZXBsYWNlZCBieSB0aGUgJy0nIGNoYXJhY3Rlci5cbiAgICovXG4gIGNzc0NsYXNzRnJpZW5kbHlOYW1lOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIENsYXNzIG5hbWUgZm9yIGNlbGxzIGluIHRoaXMgY29sdW1uLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBfY29sdW1uQ3NzQ2xhc3NOYW1lOiBzdHJpbmdbXTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KENES19UQUJMRSkgQE9wdGlvbmFsKCkgcHVibGljIF90YWJsZT86IGFueSkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGFibGUgbWV0aG9kIHRoYXQgc2V0cyB0aGUgY3NzIGNsYXNzZXMgdGhhdCB3aWxsIGJlIGFkZGVkIHRvIGV2ZXJ5IGNlbGwgaW4gdGhpc1xuICAgKiBjb2x1bW4uXG4gICAqIEluIHRoZSBmdXR1cmUsIGNvbHVtbkNzc0NsYXNzTmFtZSB3aWxsIGNoYW5nZSBmcm9tIHR5cGUgc3RyaW5nW10gdG8gc3RyaW5nIGFuZCB0aGlzXG4gICAqIHdpbGwgc2V0IGEgc2luZ2xlIHN0cmluZyB2YWx1ZS5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcHJvdGVjdGVkIF91cGRhdGVDb2x1bW5Dc3NDbGFzc05hbWUoKSB7XG4gICAgdGhpcy5fY29sdW1uQ3NzQ2xhc3NOYW1lID0gW2BjZGstY29sdW1uLSR7dGhpcy5jc3NDbGFzc0ZyaWVuZGx5TmFtZX1gXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGhhcyBiZWVuIGV4dHJhY3RlZCB0byBhIHV0aWwgYmVjYXVzZSBvZiBUUyA0IGFuZCBWRS5cbiAgICogVmlldyBFbmdpbmUgZG9lc24ndCBzdXBwb3J0IHByb3BlcnR5IHJlbmFtZSBpbmhlcml0YW5jZS5cbiAgICogVFMgNC4wIGRvZXNuJ3QgYWxsb3cgcHJvcGVydGllcyB0byBvdmVycmlkZSBhY2Nlc3NvcnMgb3IgdmljZS12ZXJzYS5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcHJvdGVjdGVkIF9zZXROYW1lSW5wdXQodmFsdWU6IHN0cmluZykge1xuICAgIC8vIElmIHRoZSBkaXJlY3RpdmUgaXMgc2V0IHdpdGhvdXQgYSBuYW1lICh1cGRhdGVkIHByb2dyYW1tYXRpY2FsbHkpLCB0aGVuIHRoaXMgc2V0dGVyIHdpbGxcbiAgICAvLyB0cmlnZ2VyIHdpdGggYW4gZW1wdHkgc3RyaW5nIGFuZCBzaG91bGQgbm90IG92ZXJ3cml0ZSB0aGUgcHJvZ3JhbW1hdGljYWxseSBzZXQgdmFsdWUuXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLl9uYW1lID0gdmFsdWU7XG4gICAgICB0aGlzLmNzc0NsYXNzRnJpZW5kbHlOYW1lID0gdmFsdWUucmVwbGFjZSgvW15hLXowLTlfLV0vZ2ksICctJyk7XG4gICAgICB0aGlzLl91cGRhdGVDb2x1bW5Dc3NDbGFzc05hbWUoKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIEJhc2UgY2xhc3MgZm9yIHRoZSBjZWxscy4gQWRkcyBhIENTUyBjbGFzc25hbWUgdGhhdCBpZGVudGlmaWVzIHRoZSBjb2x1bW4gaXQgcmVuZGVycyBpbi4gKi9cbmV4cG9ydCBjbGFzcyBCYXNlQ2RrQ2VsbCB7XG4gIGNvbnN0cnVjdG9yKGNvbHVtbkRlZjogQ2RrQ29sdW1uRGVmLCBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTGlzdC5hZGQoLi4uY29sdW1uRGVmLl9jb2x1bW5Dc3NDbGFzc05hbWUpO1xuICB9XG59XG5cbi8qKiBIZWFkZXIgY2VsbCB0ZW1wbGF0ZSBjb250YWluZXIgdGhhdCBhZGRzIHRoZSByaWdodCBjbGFzc2VzIGFuZCByb2xlLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnY2RrLWhlYWRlci1jZWxsLCB0aFtjZGstaGVhZGVyLWNlbGxdJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdjZGstaGVhZGVyLWNlbGwnLFxuICAgICdyb2xlJzogJ2NvbHVtbmhlYWRlcicsXG4gIH0sXG59KVxuZXhwb3J0IGNsYXNzIENka0hlYWRlckNlbGwgZXh0ZW5kcyBCYXNlQ2RrQ2VsbCB7XG4gIGNvbnN0cnVjdG9yKGNvbHVtbkRlZjogQ2RrQ29sdW1uRGVmLCBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgc3VwZXIoY29sdW1uRGVmLCBlbGVtZW50UmVmKTtcbiAgfVxufVxuXG4vKiogRm9vdGVyIGNlbGwgdGVtcGxhdGUgY29udGFpbmVyIHRoYXQgYWRkcyB0aGUgcmlnaHQgY2xhc3NlcyBhbmQgcm9sZS4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2Nkay1mb290ZXItY2VsbCwgdGRbY2RrLWZvb3Rlci1jZWxsXScsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnY2RrLWZvb3Rlci1jZWxsJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrRm9vdGVyQ2VsbCBleHRlbmRzIEJhc2VDZGtDZWxsIHtcbiAgY29uc3RydWN0b3IoY29sdW1uRGVmOiBDZGtDb2x1bW5EZWYsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICBzdXBlcihjb2x1bW5EZWYsIGVsZW1lbnRSZWYpO1xuICAgIGlmIChjb2x1bW5EZWYuX3RhYmxlPy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50Lm5vZGVUeXBlID09PSAxKSB7XG4gICAgICBjb25zdCB0YWJsZVJvbGUgPSBjb2x1bW5EZWYuX3RhYmxlLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdyb2xlJyk7XG4gICAgICBjb25zdCByb2xlID0gdGFibGVSb2xlID09PSAnZ3JpZCcgfHwgdGFibGVSb2xlID09PSAndHJlZWdyaWQnID8gJ2dyaWRjZWxsJyA6ICdjZWxsJztcbiAgICAgIGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCByb2xlKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIENlbGwgdGVtcGxhdGUgY29udGFpbmVyIHRoYXQgYWRkcyB0aGUgcmlnaHQgY2xhc3NlcyBhbmQgcm9sZS4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2Nkay1jZWxsLCB0ZFtjZGstY2VsbF0nLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ2Nkay1jZWxsJyxcbiAgfSxcbn0pXG5leHBvcnQgY2xhc3MgQ2RrQ2VsbCBleHRlbmRzIEJhc2VDZGtDZWxsIHtcbiAgY29uc3RydWN0b3IoY29sdW1uRGVmOiBDZGtDb2x1bW5EZWYsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICBzdXBlcihjb2x1bW5EZWYsIGVsZW1lbnRSZWYpO1xuICAgIGlmIChjb2x1bW5EZWYuX3RhYmxlPy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50Lm5vZGVUeXBlID09PSAxKSB7XG4gICAgICBjb25zdCB0YWJsZVJvbGUgPSBjb2x1bW5EZWYuX3RhYmxlLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdyb2xlJyk7XG4gICAgICBjb25zdCByb2xlID0gdGFibGVSb2xlID09PSAnZ3JpZCcgfHwgdGFibGVSb2xlID09PSAndHJlZWdyaWQnID8gJ2dyaWRjZWxsJyA6ICdjZWxsJztcbiAgICAgIGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCByb2xlKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==