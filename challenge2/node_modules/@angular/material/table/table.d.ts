/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkTable } from '@angular/cdk/table';
/**
 * Enables the recycle view repeater strategy, which reduces rendering latency. Not compatible with
 * tables that animate rows.
 */
import * as ɵngcc0 from '@angular/core';
export declare class MatRecycleRows {
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatRecycleRows, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatRecycleRows, "mat-table[recycleRows], table[mat-table][recycleRows]", never, {}, {}, never>;
}
/**
 * Wrapper for the CdkTable with Material design styles.
 */
export declare class MatTable<T> extends CdkTable<T> {
    /** Overrides the sticky CSS class set by the `CdkTable`. */
    protected stickyCssClass: string;
    /** Overrides the need to add position: sticky on every sticky cell element in `CdkTable`. */
    protected needsPositionStickyOnElement: boolean;
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatTable<any>, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDeclaration<MatTable<any>, "mat-table, table[mat-table]", ["matTable"], {}, {}, never, ["caption", "colgroup, col"]>;
}

//# sourceMappingURL=table.d.ts.map