/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, Inject, Input, Optional, ViewChild, ViewEncapsulation, } from '@angular/core';
import { CdkCellDef, CdkColumnDef, CdkHeaderCellDef } from './cell';
import { CdkTable } from './table';
import { getTableTextColumnMissingParentTableError, getTableTextColumnMissingNameError, } from './table-errors';
import { TEXT_COLUMN_OPTIONS } from './tokens';
import * as i0 from "@angular/core";
import * as i1 from "./table";
import * as i2 from "./cell";
/**
 * Column that simply shows text content for the header and row cells. Assumes that the table
 * is using the native table implementation (`<table>`).
 *
 * By default, the name of this column will be the header text and data property accessor.
 * The header text can be overridden with the `headerText` input. Cell values can be overridden with
 * the `dataAccessor` input. Change the text justification to the start or end using the `justify`
 * input.
 */
export class CdkTextColumn {
    /** Column name that should be used to reference this column. */
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
        // With Ivy, inputs can be initialized before static query results are
        // available. In that case, we defer the synchronization until "ngOnInit" fires.
        this._syncColumnDefName();
    }
    constructor(
    // `CdkTextColumn` is always requiring a table, but we just assert it manually
    // for better error reporting.
    // tslint:disable-next-line: lightweight-tokens
    _table, _options) {
        this._table = _table;
        this._options = _options;
        /** Alignment of the cell values. */
        this.justify = 'start';
        this._options = _options || {};
    }
    ngOnInit() {
        this._syncColumnDefName();
        if (this.headerText === undefined) {
            this.headerText = this._createDefaultHeaderText();
        }
        if (!this.dataAccessor) {
            this.dataAccessor =
                this._options.defaultDataAccessor || ((data, name) => data[name]);
        }
        if (this._table) {
            // Provide the cell and headerCell directly to the table with the static `ViewChild` query,
            // since the columnDef will not pick up its content by the time the table finishes checking
            // its content and initializing the rows.
            this.columnDef.cell = this.cell;
            this.columnDef.headerCell = this.headerCell;
            this._table.addColumnDef(this.columnDef);
        }
        else if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw getTableTextColumnMissingParentTableError();
        }
    }
    ngOnDestroy() {
        if (this._table) {
            this._table.removeColumnDef(this.columnDef);
        }
    }
    /**
     * Creates a default header text. Use the options' header text transformation function if one
     * has been provided. Otherwise simply capitalize the column name.
     */
    _createDefaultHeaderText() {
        const name = this.name;
        if (!name && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTableTextColumnMissingNameError();
        }
        if (this._options && this._options.defaultHeaderTextTransform) {
            return this._options.defaultHeaderTextTransform(name);
        }
        return name[0].toUpperCase() + name.slice(1);
    }
    /** Synchronizes the column definition name with the text column name. */
    _syncColumnDefName() {
        if (this.columnDef) {
            this.columnDef.name = this.name;
        }
    }
}
CdkTextColumn.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkTextColumn, deps: [{ token: i1.CdkTable, optional: true }, { token: TEXT_COLUMN_OPTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component });
CdkTextColumn.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.2.0-rc.0", type: CdkTextColumn, selector: "cdk-text-column", inputs: { name: "name", headerText: "headerText", dataAccessor: "dataAccessor", justify: "justify" }, viewQueries: [{ propertyName: "columnDef", first: true, predicate: CdkColumnDef, descendants: true, static: true }, { propertyName: "cell", first: true, predicate: CdkCellDef, descendants: true, static: true }, { propertyName: "headerCell", first: true, predicate: CdkHeaderCellDef, descendants: true, static: true }], ngImport: i0, template: `
    <ng-container cdkColumnDef>
      <th cdk-header-cell *cdkHeaderCellDef [style.text-align]="justify">
        {{headerText}}
      </th>
      <td cdk-cell *cdkCellDef="let data" [style.text-align]="justify">
        {{dataAccessor(data, name)}}
      </td>
    </ng-container>
  `, isInline: true, dependencies: [{ kind: "directive", type: i2.CdkCellDef, selector: "[cdkCellDef]" }, { kind: "directive", type: i2.CdkHeaderCellDef, selector: "[cdkHeaderCellDef]" }, { kind: "directive", type: i2.CdkColumnDef, selector: "[cdkColumnDef]", inputs: ["sticky", "cdkColumnDef", "stickyEnd"] }, { kind: "directive", type: i2.CdkCell, selector: "cdk-cell, td[cdk-cell]" }, { kind: "directive", type: i2.CdkHeaderCell, selector: "cdk-header-cell, th[cdk-header-cell]" }], changeDetection: i0.ChangeDetectionStrategy.Default, encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.0-rc.0", ngImport: i0, type: CdkTextColumn, decorators: [{
            type: Component,
            args: [{
                    selector: 'cdk-text-column',
                    template: `
    <ng-container cdkColumnDef>
      <th cdk-header-cell *cdkHeaderCellDef [style.text-align]="justify">
        {{headerText}}
      </th>
      <td cdk-cell *cdkCellDef="let data" [style.text-align]="justify">
        {{dataAccessor(data, name)}}
      </td>
    </ng-container>
  `,
                    encapsulation: ViewEncapsulation.None,
                    // Change detection is intentionally not set to OnPush. This component's template will be provided
                    // to the table to be inserted into its view. This is problematic when change detection runs since
                    // the bindings in this template will be evaluated _after_ the table's view is evaluated, which
                    // mean's the template in the table's view will not have the updated value (and in fact will cause
                    // an ExpressionChangedAfterItHasBeenCheckedError).
                    // tslint:disable-next-line:validate-decorators
                    changeDetection: ChangeDetectionStrategy.Default,
                }]
        }], ctorParameters: function () { return [{ type: i1.CdkTable, decorators: [{
                    type: Optional
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [TEXT_COLUMN_OPTIONS]
                }] }]; }, propDecorators: { name: [{
                type: Input
            }], headerText: [{
                type: Input
            }], dataAccessor: [{
                type: Input
            }], justify: [{
                type: Input
            }], columnDef: [{
                type: ViewChild,
                args: [CdkColumnDef, { static: true }]
            }], cell: [{
                type: ViewChild,
                args: [CdkCellDef, { static: true }]
            }], headerCell: [{
                type: ViewChild,
                args: [CdkHeaderCellDef, { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1jb2x1bW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RhYmxlL3RleHQtY29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULE1BQU0sRUFDTixLQUFLLEVBR0wsUUFBUSxFQUNSLFNBQVMsRUFDVCxpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDbEUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUNqQyxPQUFPLEVBQ0wseUNBQXlDLEVBQ3pDLGtDQUFrQyxHQUNuQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8sRUFBQyxtQkFBbUIsRUFBb0IsTUFBTSxVQUFVLENBQUM7Ozs7QUFFaEU7Ozs7Ozs7O0dBUUc7QUFzQkgsTUFBTSxPQUFPLGFBQWE7SUFDeEIsZ0VBQWdFO0lBQ2hFLElBQ0ksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBQ0QsSUFBSSxJQUFJLENBQUMsSUFBWTtRQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUVsQixzRUFBc0U7UUFDdEUsZ0ZBQWdGO1FBQ2hGLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUF5Q0Q7SUFDRSw4RUFBOEU7SUFDOUUsOEJBQThCO0lBQzlCLCtDQUErQztJQUMzQixNQUFtQixFQUNVLFFBQThCO1FBRDNELFdBQU0sR0FBTixNQUFNLENBQWE7UUFDVSxhQUFRLEdBQVIsUUFBUSxDQUFzQjtRQTdCakYsb0NBQW9DO1FBQzNCLFlBQU8sR0FBK0IsT0FBTyxDQUFDO1FBOEJyRCxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEs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QVM7c0JBQWpELFNBQVM7dUJBQUMsWUFBWSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQztnQkFTQSxJQUFJO3NCQUExQyxTQUFTO3VCQUFDLFVBQVUsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUM7Z0JBU1EsVUFBVTtzQkFBdEQsU0FBUzt1QkFBQyxnQkFBZ0IsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENvbXBvbmVudCxcbiAgSW5qZWN0LFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE9wdGlvbmFsLFxuICBWaWV3Q2hpbGQsXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q2RrQ2VsbERlZiwgQ2RrQ29sdW1uRGVmLCBDZGtIZWFkZXJDZWxsRGVmfSBmcm9tICcuL2NlbGwnO1xuaW1wb3J0IHtDZGtUYWJsZX0gZnJvbSAnLi90YWJsZSc7XG5pbXBvcnQge1xuICBnZXRUYWJsZVRleHRDb2x1bW5NaXNzaW5nUGFyZW50VGFibGVFcnJvcixcbiAgZ2V0VGFibGVUZXh0Q29sdW1uTWlzc2luZ05hbWVFcnJvcixcbn0gZnJvbSAnLi90YWJsZS1lcnJvcnMnO1xuaW1wb3J0IHtURVhUX0NPTFVNTl9PUFRJT05TLCBUZXh0Q29sdW1uT3B0aW9uc30gZnJvbSAnLi90b2tlbnMnO1xuXG4vKipcbiAqIENvbHVtbiB0aGF0IHNpbXBseSBzaG93cyB0ZXh0IGNvbnRlbnQgZm9yIHRoZSBoZWFkZXIgYW5kIHJvdyBjZWxscy4gQXNzdW1lcyB0aGF0IHRoZSB0YWJsZVxuICogaXMgdXNpbmcgdGhlIG5hdGl2ZSB0YWJsZSBpbXBsZW1lbnRhdGlvbiAoYDx0YWJsZT5gKS5cbiAqXG4gKiBCeSBkZWZhdWx0LCB0aGUgbmFtZSBvZiB0aGlzIGNvbHVtbiB3aWxsIGJlIHRoZSBoZWFkZXIgdGV4dCBhbmQgZGF0YSBwcm9wZXJ0eSBhY2Nlc3Nvci5cbiAqIFRoZSBoZWFkZXIgdGV4dCBjYW4gYmUgb3ZlcnJpZGRlbiB3aXRoIHRoZSBgaGVhZGVyVGV4dGAgaW5wdXQuIENlbGwgdmFsdWVzIGNhbiBiZSBvdmVycmlkZGVuIHdpdGhcbiAqIHRoZSBgZGF0YUFjY2Vzc29yYCBpbnB1dC4gQ2hhbmdlIHRoZSB0ZXh0IGp1c3RpZmljYXRpb24gdG8gdGhlIHN0YXJ0IG9yIGVuZCB1c2luZyB0aGUgYGp1c3RpZnlgXG4gKiBpbnB1dC5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnY2RrLXRleHQtY29sdW1uJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bmctY29udGFpbmVyIGNka0NvbHVtbkRlZj5cbiAgICAgIDx0aCBjZGstaGVhZGVyLWNlbGwgKmNka0hlYWRlckNlbGxEZWYgW3N0eWxlLnRleHQtYWxpZ25dPVwianVzdGlmeVwiPlxuICAgICAgICB7e2hlYWRlclRleHR9fVxuICAgICAgPC90aD5cbiAgICAgIDx0ZCBjZGstY2VsbCAqY2RrQ2VsbERlZj1cImxldCBkYXRhXCIgW3N0eWxlLnRleHQtYWxpZ25dPVwianVzdGlmeVwiPlxuICAgICAgICB7e2RhdGFBY2Nlc3NvcihkYXRhLCBuYW1lKX19XG4gICAgICA8L3RkPlxuICAgIDwvbmctY29udGFpbmVyPlxuICBgLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICAvLyBDaGFuZ2UgZGV0ZWN0aW9uIGlzIGludGVudGlvbmFsbHkgbm90IHNldCB0byBPblB1c2guIFRoaXMgY29tcG9uZW50J3MgdGVtcGxhdGUgd2lsbCBiZSBwcm92aWRlZFxuICAvLyB0byB0aGUgdGFibGUgdG8gYmUgaW5zZXJ0ZWQgaW50byBpdHMgdmlldy4gVGhpcyBpcyBwcm9ibGVtYXRpYyB3aGVuIGNoYW5nZSBkZXRlY3Rpb24gcnVucyBzaW5jZVxuICAvLyB0aGUgYmluZGluZ3MgaW4gdGhpcyB0ZW1wbGF0ZSB3aWxsIGJlIGV2YWx1YXRlZCBfYWZ0ZXJfIHRoZSB0YWJsZSdzIHZpZXcgaXMgZXZhbHVhdGVkLCB3aGljaFxuICAvLyBtZWFuJ3MgdGhlIHRlbXBsYXRlIGluIHRoZSB0YWJsZSdzIHZpZXcgd2lsbCBub3QgaGF2ZSB0aGUgdXBkYXRlZCB2YWx1ZSAoYW5kIGluIGZhY3Qgd2lsbCBjYXVzZVxuICAvLyBhbiBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEVycm9yKS5cbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhbGlkYXRlLWRlY29yYXRvcnNcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxufSlcbmV4cG9ydCBjbGFzcyBDZGtUZXh0Q29sdW1uPFQ+IGltcGxlbWVudHMgT25EZXN0cm95LCBPbkluaXQge1xuICAvKiogQ29sdW1uIG5hbWUgdGhhdCBzaG91bGQgYmUgdXNlZCB0byByZWZlcmVuY2UgdGhpcyBjb2x1bW4uICovXG4gIEBJbnB1dCgpXG4gIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gIH1cbiAgc2V0IG5hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fbmFtZSA9IG5hbWU7XG5cbiAgICAvLyBXaXRoIEl2eSwgaW5wdXRzIGNhbiBiZSBpbml0aWFsaXplZCBiZWZvcmUgc3RhdGljIHF1ZXJ5IHJlc3VsdHMgYXJlXG4gICAgLy8gYXZhaWxhYmxlLiBJbiB0aGF0IGNhc2UsIHdlIGRlZmVyIHRoZSBzeW5jaHJvbml6YXRpb24gdW50aWwgXCJuZ09uSW5pdFwiIGZpcmVzLlxuICAgIHRoaXMuX3N5bmNDb2x1bW5EZWZOYW1lKCk7XG4gIH1cbiAgX25hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogVGV4dCBsYWJlbCB0aGF0IHNob3VsZCBiZSB1c2VkIGZvciB0aGUgY29sdW1uIGhlYWRlci4gSWYgdGhpcyBwcm9wZXJ0eSBpcyBub3RcbiAgICogc2V0LCB0aGUgaGVhZGVyIHRleHQgd2lsbCBkZWZhdWx0IHRvIHRoZSBjb2x1bW4gbmFtZSB3aXRoIGl0cyBmaXJzdCBsZXR0ZXIgY2FwaXRhbGl6ZWQuXG4gICAqL1xuICBASW5wdXQoKSBoZWFkZXJUZXh0OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEFjY2Vzc29yIGZ1bmN0aW9uIHRvIHJldHJpZXZlIHRoZSBkYXRhIHJlbmRlcmVkIGZvciBlYWNoIGNlbGwuIElmIHRoaXNcbiAgICogcHJvcGVydHkgaXMgbm90IHNldCwgdGhlIGRhdGEgY2VsbHMgd2lsbCByZW5kZXIgdGhlIHZhbHVlIGZvdW5kIGluIHRoZSBkYXRhJ3MgcHJvcGVydHkgbWF0Y2hpbmdcbiAgICogdGhlIGNvbHVtbidzIG5hbWUuIEZvciBleGFtcGxlLCBpZiB0aGUgY29sdW1uIGlzIG5hbWVkIGBpZGAsIHRoZW4gdGhlIHJlbmRlcmVkIHZhbHVlIHdpbGwgYmVcbiAgICogdmFsdWUgZGVmaW5lZCBieSB0aGUgZGF0YSdzIGBpZGAgcHJvcGVydHkuXG4gICAqL1xuICBASW5wdXQoKSBkYXRhQWNjZXNzb3I6IChkYXRhOiBULCBuYW1lOiBzdHJpbmcpID0+IHN0cmluZztcblxuICAvKiogQWxpZ25tZW50IG9mIHRoZSBjZWxsIHZhbHVlcy4gKi9cbiAgQElucHV0KCkganVzdGlmeTogJ3N0YXJ0JyB8ICdlbmQnIHwgJ2NlbnRlcicgPSAnc3RhcnQnO1xuXG4gIC8qKiBAZG9jcy1wcml2YXRlICovXG4gIEBWaWV3Q2hpbGQoQ2RrQ29sdW1uRGVmLCB7c3RhdGljOiB0cnVlfSkgY29sdW1uRGVmOiBDZGtDb2x1bW5EZWY7XG5cbiAgLyoqXG4gICAqIFRoZSBjb2x1bW4gY2VsbCBpcyBwcm92aWRlZCB0byB0aGUgY29sdW1uIGR1cmluZyBgbmdPbkluaXRgIHdpdGggYSBzdGF0aWMgcXVlcnkuXG4gICAqIE5vcm1hbGx5LCB0aGlzIHdpbGwgYmUgcmV0cmlldmVkIGJ5IHRoZSBjb2x1bW4gdXNpbmcgYENvbnRlbnRDaGlsZGAsIGJ1dCB0aGF0IGFzc3VtZXMgdGhlXG4gICAqIGNvbHVtbiBkZWZpbml0aW9uIHdhcyBwcm92aWRlZCBpbiB0aGUgc2FtZSB2aWV3IGFzIHRoZSB0YWJsZSwgd2hpY2ggaXMgbm90IHRoZSBjYXNlIHdpdGggdGhpc1xuICAgKiBjb21wb25lbnQuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIEBWaWV3Q2hpbGQoQ2RrQ2VsbERlZiwge3N0YXRpYzogdHJ1ZX0pIGNlbGw6IENka0NlbGxEZWY7XG5cbiAgLyoqXG4gICAqIFRoZSBjb2x1bW4gaGVhZGVyQ2VsbCBpcyBwcm92aWRlZCB0byB0aGUgY29sdW1uIGR1cmluZyBgbmdPbkluaXRgIHdpdGggYSBzdGF0aWMgcXVlcnkuXG4gICAqIE5vcm1hbGx5LCB0aGlzIHdpbGwgYmUgcmV0cmlldmVkIGJ5IHRoZSBjb2x1bW4gdXNpbmcgYENvbnRlbnRDaGlsZGAsIGJ1dCB0aGF0IGFzc3VtZXMgdGhlXG4gICAqIGNvbHVtbiBkZWZpbml0aW9uIHdhcyBwcm92aWRlZCBpbiB0aGUgc2FtZSB2aWV3IGFzIHRoZSB0YWJsZSwgd2hpY2ggaXMgbm90IHRoZSBjYXNlIHdpdGggdGhpc1xuICAgKiBjb21wb25lbnQuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIEBWaWV3Q2hpbGQoQ2RrSGVhZGVyQ2VsbERlZiwge3N0YXRpYzogdHJ1ZX0pIGhlYWRlckNlbGw6IENka0hlYWRlckNlbGxEZWY7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLy8gYENka1RleHRDb2x1bW5gIGlzIGFsd2F5cyByZXF1aXJpbmcgYSB0YWJsZSwgYnV0IHdlIGp1c3QgYXNzZXJ0IGl0IG1hbnVhbGx5XG4gICAgLy8gZm9yIGJldHRlciBlcnJvciByZXBvcnRpbmcuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBsaWdodHdlaWdodC10b2tlbnNcbiAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF90YWJsZTogQ2RrVGFibGU8VD4sXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChURVhUX0NPTFVNTl9PUFRJT05TKSBwcml2YXRlIF9vcHRpb25zOiBUZXh0Q29sdW1uT3B0aW9uczxUPixcbiAgKSB7XG4gICAgdGhpcy5fb3B0aW9ucyA9IF9vcHRpb25zIHx8IHt9O1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5fc3luY0NvbHVtbkRlZk5hbWUoKTtcblxuICAgIGlmICh0aGlzLmhlYWRlclRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5oZWFkZXJUZXh0ID0gdGhpcy5fY3JlYXRlRGVmYXVsdEhlYWRlclRleHQoKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuZGF0YUFjY2Vzc29yKSB7XG4gICAgICB0aGlzLmRhdGFBY2Nlc3NvciA9XG4gICAgICAgIHRoaXMuX29wdGlvbnMuZGVmYXVsdERhdGFBY2Nlc3NvciB8fCAoKGRhdGE6IFQsIG5hbWU6IHN0cmluZykgPT4gKGRhdGEgYXMgYW55KVtuYW1lXSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3RhYmxlKSB7XG4gICAgICAvLyBQcm92aWRlIHRoZSBjZWxsIGFuZCBoZWFkZXJDZWxsIGRpcmVjdGx5IHRvIHRoZSB0YWJsZSB3aXRoIHRoZSBzdGF0aWMgYFZpZXdDaGlsZGAgcXVlcnksXG4gICAgICAvLyBzaW5jZSB0aGUgY29sdW1uRGVmIHdpbGwgbm90IHBpY2sgdXAgaXRzIGNvbnRlbnQgYnkgdGhlIHRpbWUgdGhlIHRhYmxlIGZpbmlzaGVzIGNoZWNraW5nXG4gICAgICAvLyBpdHMgY29udGVudCBhbmQgaW5pdGlhbGl6aW5nIHRoZSByb3dzLlxuICAgICAgdGhpcy5jb2x1bW5EZWYuY2VsbCA9IHRoaXMuY2VsbDtcbiAgICAgIHRoaXMuY29sdW1uRGVmLmhlYWRlckNlbGwgPSB0aGlzLmhlYWRlckNlbGw7XG4gICAgICB0aGlzLl90YWJsZS5hZGRDb2x1bW5EZWYodGhpcy5jb2x1bW5EZWYpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICB0aHJvdyBnZXRUYWJsZVRleHRDb2x1bW5NaXNzaW5nUGFyZW50VGFibGVFcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl90YWJsZSkge1xuICAgICAgdGhpcy5fdGFibGUucmVtb3ZlQ29sdW1uRGVmKHRoaXMuY29sdW1uRGVmKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGRlZmF1bHQgaGVhZGVyIHRleHQuIFVzZSB0aGUgb3B0aW9ucycgaGVhZGVyIHRleHQgdHJhbnNmb3JtYXRpb24gZnVuY3Rpb24gaWYgb25lXG4gICAqIGhhcyBiZWVuIHByb3ZpZGVkLiBPdGhlcndpc2Ugc2ltcGx5IGNhcGl0YWxpemUgdGhlIGNvbHVtbiBuYW1lLlxuICAgKi9cbiAgX2NyZWF0ZURlZmF1bHRIZWFkZXJUZXh0KCkge1xuICAgIGNvbnN0IG5hbWUgPSB0aGlzLm5hbWU7XG5cbiAgICBpZiAoIW5hbWUgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcbiAgICAgIHRocm93IGdldFRhYmxlVGV4dENvbHVtbk1pc3NpbmdOYW1lRXJyb3IoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucyAmJiB0aGlzLl9vcHRpb25zLmRlZmF1bHRIZWFkZXJUZXh0VHJhbnNmb3JtKSB7XG4gICAgICByZXR1cm4gdGhpcy5fb3B0aW9ucy5kZWZhdWx0SGVhZGVyVGV4dFRyYW5zZm9ybShuYW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmFtZVswXS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKTtcbiAgfVxuXG4gIC8qKiBTeW5jaHJvbml6ZXMgdGhlIGNvbHVtbiBkZWZpbml0aW9uIG5hbWUgd2l0aCB0aGUgdGV4dCBjb2x1bW4gbmFtZS4gKi9cbiAgcHJpdmF0ZSBfc3luY0NvbHVtbkRlZk5hbWUoKSB7XG4gICAgaWYgKHRoaXMuY29sdW1uRGVmKSB7XG4gICAgICB0aGlzLmNvbHVtbkRlZi5uYW1lID0gdGhpcy5uYW1lO1xuICAgIH1cbiAgfVxufVxuIl19