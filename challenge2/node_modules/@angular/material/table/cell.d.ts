/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { CdkCell, CdkCellDef, CdkColumnDef, CdkFooterCell, CdkFooterCellDef, CdkHeaderCell, CdkHeaderCellDef } from '@angular/cdk/table';
/**
 * Cell definition for the mat-table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
import * as ɵngcc0 from '@angular/core';
export declare class MatCellDef extends CdkCellDef {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCellDef, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatCellDef, "[matCellDef]", never, {}, {}, never>;
}
/**
 * Header cell definition for the mat-table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
export declare class MatHeaderCellDef extends CdkHeaderCellDef {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatHeaderCellDef, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatHeaderCellDef, "[matHeaderCellDef]", never, {}, {}, never>;
}
/**
 * Footer cell definition for the mat-table.
 * Captures the template of a column's footer cell and as well as cell-specific properties.
 */
export declare class MatFooterCellDef extends CdkFooterCellDef {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatFooterCellDef, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatFooterCellDef, "[matFooterCellDef]", never, {}, {}, never>;
}
/**
 * Column definition for the mat-table.
 * Defines a set of cells available for a table column.
 */
export declare class MatColumnDef extends CdkColumnDef {
    /** Unique name for this column. */
    get name(): string;
    set name(name: string);
    /**
     * Add "mat-column-" prefix in addition to "cdk-column-" prefix.
     * In the future, this will only add "mat-column-" and columnCssClassName
     * will change from type string[] to string.
     * @docs-private
     */
    protected _updateColumnCssClassName(): void;
    static ngAcceptInputType_sticky: BooleanInput;
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatColumnDef, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatColumnDef, "[matColumnDef]", never, { "sticky": "sticky"; "name": "matColumnDef"; }, {}, never>;
}
/** Header cell template container that adds the right classes and role. */
export declare class MatHeaderCell extends CdkHeaderCell {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatHeaderCell, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatHeaderCell, "mat-header-cell, th[mat-header-cell]", never, {}, {}, never>;
}
/** Footer cell template container that adds the right classes and role. */
export declare class MatFooterCell extends CdkFooterCell {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatFooterCell, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatFooterCell, "mat-footer-cell, td[mat-footer-cell]", never, {}, {}, never>;
}
/** Cell template container that adds the right classes and role. */
export declare class MatCell extends CdkCell {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatCell, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatCell, "mat-cell, td[mat-cell]", never, {}, {}, never>;
}

//# sourceMappingURL=cell.d.ts.map