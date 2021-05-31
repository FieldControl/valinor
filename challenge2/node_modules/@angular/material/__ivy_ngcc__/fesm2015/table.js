import { Directive, Component, ViewEncapsulation, ChangeDetectionStrategy, Input, NgModule } from '@angular/core';
import { CdkTable, CDK_TABLE_TEMPLATE, CDK_TABLE, _COALESCED_STYLE_SCHEDULER, _CoalescedStyleScheduler, STICKY_POSITIONING_LISTENER, CdkCellDef, CdkHeaderCellDef, CdkFooterCellDef, CdkColumnDef, CdkHeaderCell, CdkFooterCell, CdkCell, CdkHeaderRowDef, CdkFooterRowDef, CdkRowDef, CdkHeaderRow, CDK_ROW_TEMPLATE, CdkFooterRow, CdkRow, CdkNoDataRow, CdkTextColumn, CdkTableModule, DataSource } from '@angular/cdk/table';
import { _VIEW_REPEATER_STRATEGY, _RecycleViewRepeaterStrategy, _DisposeViewRepeaterStrategy } from '@angular/cdk/collections';
import { MatCommonModule } from '@angular/material/core';
import { _isNumberValue } from '@angular/cdk/coercion';
import { BehaviorSubject, Subject, merge, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Enables the recycle view repeater strategy, which reduces rendering latency. Not compatible with
 * tables that animate rows.
 */
import * as ɵngcc0 from '@angular/core';
import * as ɵngcc1 from '@angular/cdk/table';

const _c0 = [[["caption"]], [["colgroup"], ["col"]]];
const _c1 = ["caption", "colgroup, col"];
function MatTextColumn_th_1_Template(rf, ctx) { if (rf & 1) {
    ɵngcc0.ɵɵelementStart(0, "th", 3);
    ɵngcc0.ɵɵtext(1);
    ɵngcc0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = ɵngcc0.ɵɵnextContext();
    ɵngcc0.ɵɵstyleProp("text-align", ctx_r0.justify);
    ɵngcc0.ɵɵadvance(1);
    ɵngcc0.ɵɵtextInterpolate1(" ", ctx_r0.headerText, " ");
} }
function MatTextColumn_td_2_Template(rf, ctx) { if (rf & 1) {
    ɵngcc0.ɵɵelementStart(0, "td", 4);
    ɵngcc0.ɵɵtext(1);
    ɵngcc0.ɵɵelementEnd();
} if (rf & 2) {
    const data_r2 = ctx.$implicit;
    const ctx_r1 = ɵngcc0.ɵɵnextContext();
    ɵngcc0.ɵɵstyleProp("text-align", ctx_r1.justify);
    ɵngcc0.ɵɵadvance(1);
    ɵngcc0.ɵɵtextInterpolate1(" ", ctx_r1.dataAccessor(data_r2, ctx_r1.name), " ");
} }
class MatRecycleRows {
}
MatRecycleRows.ɵfac = function MatRecycleRows_Factory(t) { return new (t || MatRecycleRows)(); };
MatRecycleRows.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: MatRecycleRows, selectors: [["mat-table", "recycleRows", ""], ["table", "mat-table", "", "recycleRows", ""]], features: [ɵngcc0.ɵɵProvidersFeature([
            { provide: _VIEW_REPEATER_STRATEGY, useClass: _RecycleViewRepeaterStrategy },
        ])] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatRecycleRows, [{
        type: Directive,
        args: [{
                selector: 'mat-table[recycleRows], table[mat-table][recycleRows]',
                providers: [
                    { provide: _VIEW_REPEATER_STRATEGY, useClass: _RecycleViewRepeaterStrategy },
                ]
            }]
    }], null, null); })();
/**
 * Wrapper for the CdkTable with Material design styles.
 */
class MatTable extends CdkTable {
    constructor() {
        super(...arguments);
        /** Overrides the sticky CSS class set by the `CdkTable`. */
        this.stickyCssClass = 'mat-table-sticky';
        /** Overrides the need to add position: sticky on every sticky cell element in `CdkTable`. */
        this.needsPositionStickyOnElement = false;
    }
}
MatTable.ɵfac = /*@__PURE__*/ function () { let ɵMatTable_BaseFactory; return function MatTable_Factory(t) { return (ɵMatTable_BaseFactory || (ɵMatTable_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatTable)))(t || MatTable); }; }();
MatTable.ɵcmp = /*@__PURE__*/ ɵngcc0.ɵɵdefineComponent({ type: MatTable, selectors: [["mat-table"], ["table", "mat-table", ""]], hostAttrs: [1, "mat-table"], hostVars: 2, hostBindings: function MatTable_HostBindings(rf, ctx) { if (rf & 2) {
        ɵngcc0.ɵɵclassProp("mat-table-fixed-layout", ctx.fixedLayout);
    } }, exportAs: ["matTable"], features: [ɵngcc0.ɵɵProvidersFeature([
            // TODO(michaeljamesparsons) Abstract the view repeater strategy to a directive API so this code
            //  is only included in the build if used.
            { provide: _VIEW_REPEATER_STRATEGY, useClass: _DisposeViewRepeaterStrategy },
            { provide: CdkTable, useExisting: MatTable },
            { provide: CDK_TABLE, useExisting: MatTable },
            { provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler },
            // Prevent nested tables from seeing this table's StickyPositioningListener.
            { provide: STICKY_POSITIONING_LISTENER, useValue: null },
        ]), ɵngcc0.ɵɵInheritDefinitionFeature], ngContentSelectors: _c1, decls: 6, vars: 0, consts: [["headerRowOutlet", ""], ["rowOutlet", ""], ["noDataRowOutlet", ""], ["footerRowOutlet", ""]], template: function MatTable_Template(rf, ctx) { if (rf & 1) {
        ɵngcc0.ɵɵprojectionDef(_c0);
        ɵngcc0.ɵɵprojection(0);
        ɵngcc0.ɵɵprojection(1, 1);
        ɵngcc0.ɵɵelementContainer(2, 0);
        ɵngcc0.ɵɵelementContainer(3, 1);
        ɵngcc0.ɵɵelementContainer(4, 2);
        ɵngcc0.ɵɵelementContainer(5, 3);
    } }, directives: [ɵngcc1.HeaderRowOutlet, ɵngcc1.DataRowOutlet, ɵngcc1.NoDataRowOutlet, ɵngcc1.FooterRowOutlet], styles: ["mat-table{display:block}mat-header-row{min-height:56px}mat-row,mat-footer-row{min-height:48px}mat-row,mat-header-row,mat-footer-row{display:flex;border-width:0;border-bottom-width:1px;border-style:solid;align-items:center;box-sizing:border-box}mat-row::after,mat-header-row::after,mat-footer-row::after{display:inline-block;min-height:inherit;content:\"\"}mat-cell:first-of-type,mat-header-cell:first-of-type,mat-footer-cell:first-of-type{padding-left:24px}[dir=rtl] mat-cell:first-of-type:not(:only-of-type),[dir=rtl] mat-header-cell:first-of-type:not(:only-of-type),[dir=rtl] mat-footer-cell:first-of-type:not(:only-of-type){padding-left:0;padding-right:24px}mat-cell:last-of-type,mat-header-cell:last-of-type,mat-footer-cell:last-of-type{padding-right:24px}[dir=rtl] mat-cell:last-of-type:not(:only-of-type),[dir=rtl] mat-header-cell:last-of-type:not(:only-of-type),[dir=rtl] mat-footer-cell:last-of-type:not(:only-of-type){padding-right:0;padding-left:24px}mat-cell,mat-header-cell,mat-footer-cell{flex:1;display:flex;align-items:center;overflow:hidden;word-wrap:break-word;min-height:inherit}table.mat-table{border-spacing:0}tr.mat-header-row{height:56px}tr.mat-row,tr.mat-footer-row{height:48px}th.mat-header-cell{text-align:left}[dir=rtl] th.mat-header-cell{text-align:right}th.mat-header-cell,td.mat-cell,td.mat-footer-cell{padding:0;border-bottom-width:1px;border-bottom-style:solid}th.mat-header-cell:first-of-type,td.mat-cell:first-of-type,td.mat-footer-cell:first-of-type{padding-left:24px}[dir=rtl] th.mat-header-cell:first-of-type:not(:only-of-type),[dir=rtl] td.mat-cell:first-of-type:not(:only-of-type),[dir=rtl] td.mat-footer-cell:first-of-type:not(:only-of-type){padding-left:0;padding-right:24px}th.mat-header-cell:last-of-type,td.mat-cell:last-of-type,td.mat-footer-cell:last-of-type{padding-right:24px}[dir=rtl] th.mat-header-cell:last-of-type:not(:only-of-type),[dir=rtl] td.mat-cell:last-of-type:not(:only-of-type),[dir=rtl] td.mat-footer-cell:last-of-type:not(:only-of-type){padding-right:0;padding-left:24px}.mat-table-sticky{position:-webkit-sticky !important;position:sticky !important}.mat-table-fixed-layout{table-layout:fixed}\n"], encapsulation: 2 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatTable, [{
        type: Component,
        args: [{
                selector: 'mat-table, table[mat-table]',
                exportAs: 'matTable',
                template: CDK_TABLE_TEMPLATE,
                host: {
                    'class': 'mat-table',
                    '[class.mat-table-fixed-layout]': 'fixedLayout'
                },
                providers: [
                    // TODO(michaeljamesparsons) Abstract the view repeater strategy to a directive API so this code
                    //  is only included in the build if used.
                    { provide: _VIEW_REPEATER_STRATEGY, useClass: _DisposeViewRepeaterStrategy },
                    { provide: CdkTable, useExisting: MatTable },
                    { provide: CDK_TABLE, useExisting: MatTable },
                    { provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler },
                    // Prevent nested tables from seeing this table's StickyPositioningListener.
                    { provide: STICKY_POSITIONING_LISTENER, useValue: null },
                ],
                encapsulation: ViewEncapsulation.None,
                // See note on CdkTable for explanation on why this uses the default change detection strategy.
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default,
                styles: ["mat-table{display:block}mat-header-row{min-height:56px}mat-row,mat-footer-row{min-height:48px}mat-row,mat-header-row,mat-footer-row{display:flex;border-width:0;border-bottom-width:1px;border-style:solid;align-items:center;box-sizing:border-box}mat-row::after,mat-header-row::after,mat-footer-row::after{display:inline-block;min-height:inherit;content:\"\"}mat-cell:first-of-type,mat-header-cell:first-of-type,mat-footer-cell:first-of-type{padding-left:24px}[dir=rtl] mat-cell:first-of-type:not(:only-of-type),[dir=rtl] mat-header-cell:first-of-type:not(:only-of-type),[dir=rtl] mat-footer-cell:first-of-type:not(:only-of-type){padding-left:0;padding-right:24px}mat-cell:last-of-type,mat-header-cell:last-of-type,mat-footer-cell:last-of-type{padding-right:24px}[dir=rtl] mat-cell:last-of-type:not(:only-of-type),[dir=rtl] mat-header-cell:last-of-type:not(:only-of-type),[dir=rtl] mat-footer-cell:last-of-type:not(:only-of-type){padding-right:0;padding-left:24px}mat-cell,mat-header-cell,mat-footer-cell{flex:1;display:flex;align-items:center;overflow:hidden;word-wrap:break-word;min-height:inherit}table.mat-table{border-spacing:0}tr.mat-header-row{height:56px}tr.mat-row,tr.mat-footer-row{height:48px}th.mat-header-cell{text-align:left}[dir=rtl] th.mat-header-cell{text-align:right}th.mat-header-cell,td.mat-cell,td.mat-footer-cell{padding:0;border-bottom-width:1px;border-bottom-style:solid}th.mat-header-cell:first-of-type,td.mat-cell:first-of-type,td.mat-footer-cell:first-of-type{padding-left:24px}[dir=rtl] th.mat-header-cell:first-of-type:not(:only-of-type),[dir=rtl] td.mat-cell:first-of-type:not(:only-of-type),[dir=rtl] td.mat-footer-cell:first-of-type:not(:only-of-type){padding-left:0;padding-right:24px}th.mat-header-cell:last-of-type,td.mat-cell:last-of-type,td.mat-footer-cell:last-of-type{padding-right:24px}[dir=rtl] th.mat-header-cell:last-of-type:not(:only-of-type),[dir=rtl] td.mat-cell:last-of-type:not(:only-of-type),[dir=rtl] td.mat-footer-cell:last-of-type:not(:only-of-type){padding-right:0;padding-left:24px}.mat-table-sticky{position:-webkit-sticky !important;position:sticky !important}.mat-table-fixed-layout{table-layout:fixed}\n"]
            }]
    }], null, null); })();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Cell definition for the mat-table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
class MatCellDef extends CdkCellDef {
}
MatCellDef.ɵfac = /*@__PURE__*/ function () { let ɵMatCellDef_BaseFactory; return function MatCellDef_Factory(t) { return (ɵMatCellDef_BaseFactory || (ɵMatCellDef_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatCellDef)))(t || MatCellDef); }; }();
MatCellDef.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: MatCellDef, selectors: [["", "matCellDef", ""]], features: [ɵngcc0.ɵɵProvidersFeature([{ provide: CdkCellDef, useExisting: MatCellDef }]), ɵngcc0.ɵɵInheritDefinitionFeature] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatCellDef, [{
        type: Directive,
        args: [{
                selector: '[matCellDef]',
                providers: [{ provide: CdkCellDef, useExisting: MatCellDef }]
            }]
    }], null, null); })();
/**
 * Header cell definition for the mat-table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
class MatHeaderCellDef extends CdkHeaderCellDef {
}
MatHeaderCellDef.ɵfac = /*@__PURE__*/ function () { let ɵMatHeaderCellDef_BaseFactory; return function MatHeaderCellDef_Factory(t) { return (ɵMatHeaderCellDef_BaseFactory || (ɵMatHeaderCellDef_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatHeaderCellDef)))(t || MatHeaderCellDef); }; }();
MatHeaderCellDef.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: MatHeaderCellDef, selectors: [["", "matHeaderCellDef", ""]], features: [ɵngcc0.ɵɵProvidersFeature([{ provide: CdkHeaderCellDef, useExisting: MatHeaderCellDef }]), ɵngcc0.ɵɵInheritDefinitionFeature] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatHeaderCellDef, [{
        type: Directive,
        args: [{
                selector: '[matHeaderCellDef]',
                providers: [{ provide: CdkHeaderCellDef, useExisting: MatHeaderCellDef }]
            }]
    }], null, null); })();
/**
 * Footer cell definition for the mat-table.
 * Captures the template of a column's footer cell and as well as cell-specific properties.
 */
class MatFooterCellDef extends CdkFooterCellDef {
}
MatFooterCellDef.ɵfac = /*@__PURE__*/ function () { let ɵMatFooterCellDef_BaseFactory; return function MatFooterCellDef_Factory(t) { return (ɵMatFooterCellDef_BaseFactory || (ɵMatFooterCellDef_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatFooterCellDef)))(t || MatFooterCellDef); }; }();
MatFooterCellDef.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: MatFooterCellDef, selectors: [["", "matFooterCellDef", ""]], features: [ɵngcc0.ɵɵProvidersFeature([{ provide: CdkFooterCellDef, useExisting: MatFooterCellDef }]), ɵngcc0.ɵɵInheritDefinitionFeature] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatFooterCellDef, [{
        type: Directive,
        args: [{
                selector: '[matFooterCellDef]',
                providers: [{ provide: CdkFooterCellDef, useExisting: MatFooterCellDef }]
            }]
    }], null, null); })();
/**
 * Column definition for the mat-table.
 * Defines a set of cells available for a table column.
 */
class MatColumnDef extends CdkColumnDef {
    /** Unique name for this column. */
    get name() { return this._name; }
    set name(name) { this._setNameInput(name); }
    /**
     * Add "mat-column-" prefix in addition to "cdk-column-" prefix.
     * In the future, this will only add "mat-column-" and columnCssClassName
     * will change from type string[] to string.
     * @docs-private
     */
    _updateColumnCssClassName() {
        super._updateColumnCssClassName();
        this._columnCssClassName.push(`mat-column-${this.cssClassFriendlyName}`);
    }
}
MatColumnDef.ɵfac = /*@__PURE__*/ function () { let ɵMatColumnDef_BaseFactory; return function MatColumnDef_Factory(t) { return (ɵMatColumnDef_BaseFactory || (ɵMatColumnDef_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatColumnDef)))(t || MatColumnDef); }; }();
MatColumnDef.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: MatColumnDef, selectors: [["", "matColumnDef", ""]], inputs: { sticky: "sticky", name: ["matColumnDef", "name"] }, features: [ɵngcc0.ɵɵProvidersFeature([
            { provide: CdkColumnDef, useExisting: MatColumnDef },
            { provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: MatColumnDef }
        ]), ɵngcc0.ɵɵInheritDefinitionFeature] });
MatColumnDef.propDecorators = {
    name: [{ type: Input, args: ['matColumnDef',] }]
};
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatColumnDef, [{
        type: Directive,
        args: [{
                selector: '[matColumnDef]',
                inputs: ['sticky'],
                providers: [
                    { provide: CdkColumnDef, useExisting: MatColumnDef },
                    { provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: MatColumnDef }
                ]
            }]
    }], null, { name: [{
            type: Input,
            args: ['matColumnDef']
        }] }); })();
/** Header cell template container that adds the right classes and role. */
class MatHeaderCell extends CdkHeaderCell {
}
MatHeaderCell.ɵfac = /*@__PURE__*/ function () { let ɵMatHeaderCell_BaseFactory; return function MatHeaderCell_Factory(t) { return (ɵMatHeaderCell_BaseFactory || (ɵMatHeaderCell_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatHeaderCell)))(t || MatHeaderCell); }; }();
MatHeaderCell.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: MatHeaderCell, selectors: [["mat-header-cell"], ["th", "mat-header-cell", ""]], hostAttrs: ["role", "columnheader", 1, "mat-header-cell"], features: [ɵngcc0.ɵɵInheritDefinitionFeature] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatHeaderCell, [{
        type: Directive,
        args: [{
                selector: 'mat-header-cell, th[mat-header-cell]',
                host: {
                    'class': 'mat-header-cell',
                    'role': 'columnheader'
                }
            }]
    }], null, null); })();
/** Footer cell template container that adds the right classes and role. */
class MatFooterCell extends CdkFooterCell {
}
MatFooterCell.ɵfac = /*@__PURE__*/ function () { let ɵMatFooterCell_BaseFactory; return function MatFooterCell_Factory(t) { return (ɵMatFooterCell_BaseFactory || (ɵMatFooterCell_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatFooterCell)))(t || MatFooterCell); }; }();
MatFooterCell.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: MatFooterCell, selectors: [["mat-footer-cell"], ["td", "mat-footer-cell", ""]], hostAttrs: ["role", "gridcell", 1, "mat-footer-cell"], features: [ɵngcc0.ɵɵInheritDefinitionFeature] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatFooterCell, [{
        type: Directive,
        args: [{
                selector: 'mat-footer-cell, td[mat-footer-cell]',
                host: {
                    'class': 'mat-footer-cell',
                    'role': 'gridcell'
                }
            }]
    }], null, null); })();
/** Cell template container that adds the right classes and role. */
class MatCell extends CdkCell {
}
MatCell.ɵfac = /*@__PURE__*/ function () { let ɵMatCell_BaseFactory; return function MatCell_Factory(t) { return (ɵMatCell_BaseFactory || (ɵMatCell_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatCell)))(t || MatCell); }; }();
MatCell.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: MatCell, selectors: [["mat-cell"], ["td", "mat-cell", ""]], hostAttrs: ["role", "gridcell", 1, "mat-cell"], features: [ɵngcc0.ɵɵInheritDefinitionFeature] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatCell, [{
        type: Directive,
        args: [{
                selector: 'mat-cell, td[mat-cell]',
                host: {
                    'class': 'mat-cell',
                    'role': 'gridcell'
                }
            }]
    }], null, null); })();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Header row definition for the mat-table.
 * Captures the header row's template and other header properties such as the columns to display.
 */
class MatHeaderRowDef extends CdkHeaderRowDef {
}
MatHeaderRowDef.ɵfac = /*@__PURE__*/ function () { let ɵMatHeaderRowDef_BaseFactory; return function MatHeaderRowDef_Factory(t) { return (ɵMatHeaderRowDef_BaseFactory || (ɵMatHeaderRowDef_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatHeaderRowDef)))(t || MatHeaderRowDef); }; }();
MatHeaderRowDef.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: MatHeaderRowDef, selectors: [["", "matHeaderRowDef", ""]], inputs: { columns: ["matHeaderRowDef", "columns"], sticky: ["matHeaderRowDefSticky", "sticky"] }, features: [ɵngcc0.ɵɵProvidersFeature([{ provide: CdkHeaderRowDef, useExisting: MatHeaderRowDef }]), ɵngcc0.ɵɵInheritDefinitionFeature] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatHeaderRowDef, [{
        type: Directive,
        args: [{
                selector: '[matHeaderRowDef]',
                providers: [{ provide: CdkHeaderRowDef, useExisting: MatHeaderRowDef }],
                inputs: ['columns: matHeaderRowDef', 'sticky: matHeaderRowDefSticky']
            }]
    }], null, null); })();
/**
 * Footer row definition for the mat-table.
 * Captures the footer row's template and other footer properties such as the columns to display.
 */
class MatFooterRowDef extends CdkFooterRowDef {
}
MatFooterRowDef.ɵfac = /*@__PURE__*/ function () { let ɵMatFooterRowDef_BaseFactory; return function MatFooterRowDef_Factory(t) { return (ɵMatFooterRowDef_BaseFactory || (ɵMatFooterRowDef_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatFooterRowDef)))(t || MatFooterRowDef); }; }();
MatFooterRowDef.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: MatFooterRowDef, selectors: [["", "matFooterRowDef", ""]], inputs: { columns: ["matFooterRowDef", "columns"], sticky: ["matFooterRowDefSticky", "sticky"] }, features: [ɵngcc0.ɵɵProvidersFeature([{ provide: CdkFooterRowDef, useExisting: MatFooterRowDef }]), ɵngcc0.ɵɵInheritDefinitionFeature] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatFooterRowDef, [{
        type: Directive,
        args: [{
                selector: '[matFooterRowDef]',
                providers: [{ provide: CdkFooterRowDef, useExisting: MatFooterRowDef }],
                inputs: ['columns: matFooterRowDef', 'sticky: matFooterRowDefSticky']
            }]
    }], null, null); })();
/**
 * Data row definition for the mat-table.
 * Captures the data row's template and other properties such as the columns to display and
 * a when predicate that describes when this row should be used.
 */
class MatRowDef extends CdkRowDef {
}
MatRowDef.ɵfac = /*@__PURE__*/ function () { let ɵMatRowDef_BaseFactory; return function MatRowDef_Factory(t) { return (ɵMatRowDef_BaseFactory || (ɵMatRowDef_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatRowDef)))(t || MatRowDef); }; }();
MatRowDef.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: MatRowDef, selectors: [["", "matRowDef", ""]], inputs: { columns: ["matRowDefColumns", "columns"], when: ["matRowDefWhen", "when"] }, features: [ɵngcc0.ɵɵProvidersFeature([{ provide: CdkRowDef, useExisting: MatRowDef }]), ɵngcc0.ɵɵInheritDefinitionFeature] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatRowDef, [{
        type: Directive,
        args: [{
                selector: '[matRowDef]',
                providers: [{ provide: CdkRowDef, useExisting: MatRowDef }],
                inputs: ['columns: matRowDefColumns', 'when: matRowDefWhen']
            }]
    }], null, null); })();
/** Header template container that contains the cell outlet. Adds the right class and role. */
class MatHeaderRow extends CdkHeaderRow {
}
MatHeaderRow.ɵfac = /*@__PURE__*/ function () { let ɵMatHeaderRow_BaseFactory; return function MatHeaderRow_Factory(t) { return (ɵMatHeaderRow_BaseFactory || (ɵMatHeaderRow_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatHeaderRow)))(t || MatHeaderRow); }; }();
MatHeaderRow.ɵcmp = /*@__PURE__*/ ɵngcc0.ɵɵdefineComponent({ type: MatHeaderRow, selectors: [["mat-header-row"], ["tr", "mat-header-row", ""]], hostAttrs: ["role", "row", 1, "mat-header-row"], exportAs: ["matHeaderRow"], features: [ɵngcc0.ɵɵProvidersFeature([{ provide: CdkHeaderRow, useExisting: MatHeaderRow }]), ɵngcc0.ɵɵInheritDefinitionFeature], decls: 1, vars: 0, consts: [["cdkCellOutlet", ""]], template: function MatHeaderRow_Template(rf, ctx) { if (rf & 1) {
        ɵngcc0.ɵɵelementContainer(0, 0);
    } }, directives: [ɵngcc1.CdkCellOutlet], encapsulation: 2 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatHeaderRow, [{
        type: Component,
        args: [{
                selector: 'mat-header-row, tr[mat-header-row]',
                template: CDK_ROW_TEMPLATE,
                host: {
                    'class': 'mat-header-row',
                    'role': 'row'
                },
                // See note on CdkTable for explanation on why this uses the default change detection strategy.
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default,
                encapsulation: ViewEncapsulation.None,
                exportAs: 'matHeaderRow',
                providers: [{ provide: CdkHeaderRow, useExisting: MatHeaderRow }]
            }]
    }], null, null); })();
/** Footer template container that contains the cell outlet. Adds the right class and role. */
class MatFooterRow extends CdkFooterRow {
}
MatFooterRow.ɵfac = /*@__PURE__*/ function () { let ɵMatFooterRow_BaseFactory; return function MatFooterRow_Factory(t) { return (ɵMatFooterRow_BaseFactory || (ɵMatFooterRow_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatFooterRow)))(t || MatFooterRow); }; }();
MatFooterRow.ɵcmp = /*@__PURE__*/ ɵngcc0.ɵɵdefineComponent({ type: MatFooterRow, selectors: [["mat-footer-row"], ["tr", "mat-footer-row", ""]], hostAttrs: ["role", "row", 1, "mat-footer-row"], exportAs: ["matFooterRow"], features: [ɵngcc0.ɵɵProvidersFeature([{ provide: CdkFooterRow, useExisting: MatFooterRow }]), ɵngcc0.ɵɵInheritDefinitionFeature], decls: 1, vars: 0, consts: [["cdkCellOutlet", ""]], template: function MatFooterRow_Template(rf, ctx) { if (rf & 1) {
        ɵngcc0.ɵɵelementContainer(0, 0);
    } }, directives: [ɵngcc1.CdkCellOutlet], encapsulation: 2 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatFooterRow, [{
        type: Component,
        args: [{
                selector: 'mat-footer-row, tr[mat-footer-row]',
                template: CDK_ROW_TEMPLATE,
                host: {
                    'class': 'mat-footer-row',
                    'role': 'row'
                },
                // See note on CdkTable for explanation on why this uses the default change detection strategy.
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default,
                encapsulation: ViewEncapsulation.None,
                exportAs: 'matFooterRow',
                providers: [{ provide: CdkFooterRow, useExisting: MatFooterRow }]
            }]
    }], null, null); })();
/** Data row template container that contains the cell outlet. Adds the right class and role. */
class MatRow extends CdkRow {
}
MatRow.ɵfac = /*@__PURE__*/ function () { let ɵMatRow_BaseFactory; return function MatRow_Factory(t) { return (ɵMatRow_BaseFactory || (ɵMatRow_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatRow)))(t || MatRow); }; }();
MatRow.ɵcmp = /*@__PURE__*/ ɵngcc0.ɵɵdefineComponent({ type: MatRow, selectors: [["mat-row"], ["tr", "mat-row", ""]], hostAttrs: ["role", "row", 1, "mat-row"], exportAs: ["matRow"], features: [ɵngcc0.ɵɵProvidersFeature([{ provide: CdkRow, useExisting: MatRow }]), ɵngcc0.ɵɵInheritDefinitionFeature], decls: 1, vars: 0, consts: [["cdkCellOutlet", ""]], template: function MatRow_Template(rf, ctx) { if (rf & 1) {
        ɵngcc0.ɵɵelementContainer(0, 0);
    } }, directives: [ɵngcc1.CdkCellOutlet], encapsulation: 2 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatRow, [{
        type: Component,
        args: [{
                selector: 'mat-row, tr[mat-row]',
                template: CDK_ROW_TEMPLATE,
                host: {
                    'class': 'mat-row',
                    'role': 'row'
                },
                // See note on CdkTable for explanation on why this uses the default change detection strategy.
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default,
                encapsulation: ViewEncapsulation.None,
                exportAs: 'matRow',
                providers: [{ provide: CdkRow, useExisting: MatRow }]
            }]
    }], null, null); })();
/** Row that can be used to display a message when no data is shown in the table. */
class MatNoDataRow extends CdkNoDataRow {
}
MatNoDataRow.ɵfac = /*@__PURE__*/ function () { let ɵMatNoDataRow_BaseFactory; return function MatNoDataRow_Factory(t) { return (ɵMatNoDataRow_BaseFactory || (ɵMatNoDataRow_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatNoDataRow)))(t || MatNoDataRow); }; }();
MatNoDataRow.ɵdir = /*@__PURE__*/ ɵngcc0.ɵɵdefineDirective({ type: MatNoDataRow, selectors: [["ng-template", "matNoDataRow", ""]], features: [ɵngcc0.ɵɵProvidersFeature([{ provide: CdkNoDataRow, useExisting: MatNoDataRow }]), ɵngcc0.ɵɵInheritDefinitionFeature] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatNoDataRow, [{
        type: Directive,
        args: [{
                selector: 'ng-template[matNoDataRow]',
                providers: [{ provide: CdkNoDataRow, useExisting: MatNoDataRow }]
            }]
    }], null, null); })();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Column that simply shows text content for the header and row cells. Assumes that the table
 * is using the native table implementation (`<table>`).
 *
 * By default, the name of this column will be the header text and data property accessor.
 * The header text can be overridden with the `headerText` input. Cell values can be overridden with
 * the `dataAccessor` input. Change the text justification to the start or end using the `justify`
 * input.
 */
class MatTextColumn extends CdkTextColumn {
}
MatTextColumn.ɵfac = /*@__PURE__*/ function () { let ɵMatTextColumn_BaseFactory; return function MatTextColumn_Factory(t) { return (ɵMatTextColumn_BaseFactory || (ɵMatTextColumn_BaseFactory = ɵngcc0.ɵɵgetInheritedFactory(MatTextColumn)))(t || MatTextColumn); }; }();
MatTextColumn.ɵcmp = /*@__PURE__*/ ɵngcc0.ɵɵdefineComponent({ type: MatTextColumn, selectors: [["mat-text-column"]], features: [ɵngcc0.ɵɵInheritDefinitionFeature], decls: 3, vars: 0, consts: [["matColumnDef", ""], ["mat-header-cell", "", 3, "text-align", 4, "matHeaderCellDef"], ["mat-cell", "", 3, "text-align", 4, "matCellDef"], ["mat-header-cell", ""], ["mat-cell", ""]], template: function MatTextColumn_Template(rf, ctx) { if (rf & 1) {
        ɵngcc0.ɵɵelementContainerStart(0, 0);
        ɵngcc0.ɵɵtemplate(1, MatTextColumn_th_1_Template, 2, 3, "th", 1);
        ɵngcc0.ɵɵtemplate(2, MatTextColumn_td_2_Template, 2, 3, "td", 2);
        ɵngcc0.ɵɵelementContainerEnd();
    } }, directives: [MatColumnDef, MatHeaderCellDef, MatCellDef, MatHeaderCell, MatCell], encapsulation: 2 });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatTextColumn, [{
        type: Component,
        args: [{
                selector: 'mat-text-column',
                template: `
    <ng-container matColumnDef>
      <th mat-header-cell *matHeaderCellDef [style.text-align]="justify">
        {{headerText}}
      </th>
      <td mat-cell *matCellDef="let data" [style.text-align]="justify">
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
                changeDetection: ChangeDetectionStrategy.Default
            }]
    }], null, null); })();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const EXPORTED_DECLARATIONS = [
    // Table
    MatTable,
    MatRecycleRows,
    // Template defs
    MatHeaderCellDef,
    MatHeaderRowDef,
    MatColumnDef,
    MatCellDef,
    MatRowDef,
    MatFooterCellDef,
    MatFooterRowDef,
    // Cell directives
    MatHeaderCell,
    MatCell,
    MatFooterCell,
    // Row directives
    MatHeaderRow,
    MatRow,
    MatFooterRow,
    MatNoDataRow,
    MatTextColumn,
];
class MatTableModule {
}
MatTableModule.ɵfac = function MatTableModule_Factory(t) { return new (t || MatTableModule)(); };
MatTableModule.ɵmod = /*@__PURE__*/ ɵngcc0.ɵɵdefineNgModule({ type: MatTableModule });
MatTableModule.ɵinj = /*@__PURE__*/ ɵngcc0.ɵɵdefineInjector({ imports: [[
            CdkTableModule,
            MatCommonModule,
        ], MatCommonModule] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatTableModule, [{
        type: NgModule,
        args: [{
                imports: [
                    CdkTableModule,
                    MatCommonModule,
                ],
                exports: [MatCommonModule, EXPORTED_DECLARATIONS],
                declarations: EXPORTED_DECLARATIONS
            }]
    }], null, null); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && ɵngcc0.ɵɵsetNgModuleScope(MatTableModule, { declarations: function () { return [MatTable, MatRecycleRows, MatHeaderCellDef, MatHeaderRowDef, MatColumnDef, MatCellDef, MatRowDef, MatFooterCellDef, MatFooterRowDef, MatHeaderCell, MatCell, MatFooterCell, MatHeaderRow, MatRow, MatFooterRow, MatNoDataRow, MatTextColumn]; }, imports: function () { return [CdkTableModule,
        MatCommonModule]; }, exports: function () { return [MatCommonModule, MatTable, MatRecycleRows, MatHeaderCellDef, MatHeaderRowDef, MatColumnDef, MatCellDef, MatRowDef, MatFooterCellDef, MatFooterRowDef, MatHeaderCell, MatCell, MatFooterCell, MatHeaderRow, MatRow, MatFooterRow, MatNoDataRow, MatTextColumn]; } }); })();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Corresponds to `Number.MAX_SAFE_INTEGER`. Moved out into a variable here due to
 * flaky browser support and the value not being defined in Closure's typings.
 */
const MAX_SAFE_INTEGER = 9007199254740991;
/** Shared base class with MDC-based implementation. */
class _MatTableDataSource extends DataSource {
    constructor(initialData = []) {
        super();
        /** Stream emitting render data to the table (depends on ordered data changes). */
        this._renderData = new BehaviorSubject([]);
        /** Stream that emits when a new filter string is set on the data source. */
        this._filter = new BehaviorSubject('');
        /** Used to react to internal changes of the paginator that are made by the data source itself. */
        this._internalPageChanges = new Subject();
        /**
         * Subscription to the changes that should trigger an update to the table's rendered rows, such
         * as filtering, sorting, pagination, or base data changes.
         */
        this._renderChangesSubscription = null;
        /**
         * Data accessor function that is used for accessing data properties for sorting through
         * the default sortData function.
         * This default function assumes that the sort header IDs (which defaults to the column name)
         * matches the data's properties (e.g. column Xyz represents data['Xyz']).
         * May be set to a custom function for different behavior.
         * @param data Data object that is being accessed.
         * @param sortHeaderId The name of the column that represents the data.
         */
        this.sortingDataAccessor = (data, sortHeaderId) => {
            const value = data[sortHeaderId];
            if (_isNumberValue(value)) {
                const numberValue = Number(value);
                // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
                // leave them as strings. For more info: https://goo.gl/y5vbSg
                return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
            }
            return value;
        };
        /**
         * Gets a sorted copy of the data array based on the state of the MatSort. Called
         * after changes are made to the filtered data or when sort changes are emitted from MatSort.
         * By default, the function retrieves the active sort and its direction and compares data
         * by retrieving data using the sortingDataAccessor. May be overridden for a custom implementation
         * of data ordering.
         * @param data The array of data that should be sorted.
         * @param sort The connected MatSort that holds the current sort state.
         */
        this.sortData = (data, sort) => {
            const active = sort.active;
            const direction = sort.direction;
            if (!active || direction == '') {
                return data;
            }
            return data.sort((a, b) => {
                let valueA = this.sortingDataAccessor(a, active);
                let valueB = this.sortingDataAccessor(b, active);
                // If there are data in the column that can be converted to a number,
                // it must be ensured that the rest of the data
                // is of the same type so as not to order incorrectly.
                const valueAType = typeof valueA;
                const valueBType = typeof valueB;
                if (valueAType !== valueBType) {
                    if (valueAType === 'number') {
                        valueA += '';
                    }
                    if (valueBType === 'number') {
                        valueB += '';
                    }
                }
                // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
                // one value exists while the other doesn't. In this case, existing value should come last.
                // This avoids inconsistent results when comparing values to undefined/null.
                // If neither value exists, return 0 (equal).
                let comparatorResult = 0;
                if (valueA != null && valueB != null) {
                    // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
                    if (valueA > valueB) {
                        comparatorResult = 1;
                    }
                    else if (valueA < valueB) {
                        comparatorResult = -1;
                    }
                }
                else if (valueA != null) {
                    comparatorResult = 1;
                }
                else if (valueB != null) {
                    comparatorResult = -1;
                }
                return comparatorResult * (direction == 'asc' ? 1 : -1);
            });
        };
        /**
         * Checks if a data object matches the data source's filter string. By default, each data object
         * is converted to a string of its properties and returns true if the filter has
         * at least one occurrence in that string. By default, the filter string has its whitespace
         * trimmed and the match is case-insensitive. May be overridden for a custom implementation of
         * filter matching.
         * @param data Data object used to check against the filter.
         * @param filter Filter string that has been set on the data source.
         * @returns Whether the filter matches against the data
         */
        this.filterPredicate = (data, filter) => {
            // Transform the data into a lowercase string of all property values.
            const dataStr = Object.keys(data).reduce((currentTerm, key) => {
                // Use an obscure Unicode character to delimit the words in the concatenated string.
                // This avoids matches where the values of two columns combined will match the user's query
                // (e.g. `Flute` and `Stop` will match `Test`). The character is intended to be something
                // that has a very low chance of being typed in by somebody in a text field. This one in
                // particular is "White up-pointing triangle with dot" from
                // https://en.wikipedia.org/wiki/List_of_Unicode_characters
                return currentTerm + data[key] + '◬';
            }, '').toLowerCase();
            // Transform the filter by converting it to lowercase and removing whitespace.
            const transformedFilter = filter.trim().toLowerCase();
            return dataStr.indexOf(transformedFilter) != -1;
        };
        this._data = new BehaviorSubject(initialData);
        this._updateChangeSubscription();
    }
    /** Array of data that should be rendered by the table, where each object represents one row. */
    get data() { return this._data.value; }
    set data(data) {
        this._data.next(data);
        // Normally the `filteredData` is updated by the re-render
        // subscription, but that won't happen if it's inactive.
        if (!this._renderChangesSubscription) {
            this._filterData(data);
        }
    }
    /**
     * Filter term that should be used to filter out objects from the data array. To override how
     * data objects match to this filter string, provide a custom function for filterPredicate.
     */
    get filter() { return this._filter.value; }
    set filter(filter) {
        this._filter.next(filter);
        // Normally the `filteredData` is updated by the re-render
        // subscription, but that won't happen if it's inactive.
        if (!this._renderChangesSubscription) {
            this._filterData(this.data);
        }
    }
    /**
     * Instance of the MatSort directive used by the table to control its sorting. Sort changes
     * emitted by the MatSort will trigger an update to the table's rendered data.
     */
    get sort() { return this._sort; }
    set sort(sort) {
        this._sort = sort;
        this._updateChangeSubscription();
    }
    /**
     * Instance of the MatPaginator component used by the table to control what page of the data is
     * displayed. Page changes emitted by the MatPaginator will trigger an update to the
     * table's rendered data.
     *
     * Note that the data source uses the paginator's properties to calculate which page of data
     * should be displayed. If the paginator receives its properties as template inputs,
     * e.g. `[pageLength]=100` or `[pageIndex]=1`, then be sure that the paginator's view has been
     * initialized before assigning it to this data source.
     */
    get paginator() { return this._paginator; }
    set paginator(paginator) {
        this._paginator = paginator;
        this._updateChangeSubscription();
    }
    /**
     * Subscribe to changes that should trigger an update to the table's rendered rows. When the
     * changes occur, process the current state of the filter, sort, and pagination along with
     * the provided base data and send it to the table for rendering.
     */
    _updateChangeSubscription() {
        var _a;
        // Sorting and/or pagination should be watched if MatSort and/or MatPaginator are provided.
        // The events should emit whenever the component emits a change or initializes, or if no
        // component is provided, a stream with just a null event should be provided.
        // The `sortChange` and `pageChange` acts as a signal to the combineLatests below so that the
        // pipeline can progress to the next step. Note that the value from these streams are not used,
        // they purely act as a signal to progress in the pipeline.
        const sortChange = this._sort ?
            merge(this._sort.sortChange, this._sort.initialized) :
            of(null);
        const pageChange = this._paginator ?
            merge(this._paginator.page, this._internalPageChanges, this._paginator.initialized) :
            of(null);
        const dataStream = this._data;
        // Watch for base data or filter changes to provide a filtered set of data.
        const filteredData = combineLatest([dataStream, this._filter])
            .pipe(map(([data]) => this._filterData(data)));
        // Watch for filtered data or sort changes to provide an ordered set of data.
        const orderedData = combineLatest([filteredData, sortChange])
            .pipe(map(([data]) => this._orderData(data)));
        // Watch for ordered data or page changes to provide a paged set of data.
        const paginatedData = combineLatest([orderedData, pageChange])
            .pipe(map(([data]) => this._pageData(data)));
        // Watched for paged data changes and send the result to the table to render.
        (_a = this._renderChangesSubscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
        this._renderChangesSubscription = paginatedData.subscribe(data => this._renderData.next(data));
    }
    /**
     * Returns a filtered data array where each filter object contains the filter string within
     * the result of the filterTermAccessor function. If no filter is set, returns the data array
     * as provided.
     */
    _filterData(data) {
        // If there is a filter string, filter out data that does not contain it.
        // Each data object is converted to a string using the function defined by filterTermAccessor.
        // May be overridden for customization.
        this.filteredData = (this.filter == null || this.filter === '') ? data :
            data.filter(obj => this.filterPredicate(obj, this.filter));
        if (this.paginator) {
            this._updatePaginator(this.filteredData.length);
        }
        return this.filteredData;
    }
    /**
     * Returns a sorted copy of the data if MatSort has a sort applied, otherwise just returns the
     * data array as provided. Uses the default data accessor for data lookup, unless a
     * sortDataAccessor function is defined.
     */
    _orderData(data) {
        // If there is no active sort or direction, return the data without trying to sort.
        if (!this.sort) {
            return data;
        }
        return this.sortData(data.slice(), this.sort);
    }
    /**
     * Returns a paged slice of the provided data array according to the provided MatPaginator's page
     * index and length. If there is no paginator provided, returns the data array as provided.
     */
    _pageData(data) {
        if (!this.paginator) {
            return data;
        }
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        return data.slice(startIndex, startIndex + this.paginator.pageSize);
    }
    /**
     * Updates the paginator to reflect the length of the filtered data, and makes sure that the page
     * index does not exceed the paginator's last page. Values are changed in a resolved promise to
     * guard against making property changes within a round of change detection.
     */
    _updatePaginator(filteredDataLength) {
        Promise.resolve().then(() => {
            const paginator = this.paginator;
            if (!paginator) {
                return;
            }
            paginator.length = filteredDataLength;
            // If the page index is set beyond the page, reduce it to the last page.
            if (paginator.pageIndex > 0) {
                const lastPageIndex = Math.ceil(paginator.length / paginator.pageSize) - 1 || 0;
                const newPageIndex = Math.min(paginator.pageIndex, lastPageIndex);
                if (newPageIndex !== paginator.pageIndex) {
                    paginator.pageIndex = newPageIndex;
                    // Since the paginator only emits after user-generated changes,
                    // we need our own stream so we know to should re-render the data.
                    this._internalPageChanges.next();
                }
            }
        });
    }
    /**
     * Used by the MatTable. Called when it connects to the data source.
     * @docs-private
     */
    connect() {
        if (!this._renderChangesSubscription) {
            this._updateChangeSubscription();
        }
        return this._renderData;
    }
    /**
     * Used by the MatTable. Called when it disconnects from the data source.
     * @docs-private
     */
    disconnect() {
        var _a;
        (_a = this._renderChangesSubscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
        this._renderChangesSubscription = null;
    }
}
/**
 * Data source that accepts a client-side data array and includes native support of filtering,
 * sorting (using MatSort), and pagination (using MatPaginator).
 *
 * Allows for sort customization by overriding sortingDataAccessor, which defines how data
 * properties are accessed. Also allows for filter customization by overriding filterTermAccessor,
 * which defines how row data is converted to a string for filter matching.
 *
 * **Note:** This class is meant to be a simple data source to help you get started. As such
 * it isn't equipped to handle some more advanced cases like robust i18n support or server-side
 * interactions. If your app needs to support more advanced use cases, consider implementing your
 * own `DataSource`.
 */
class MatTableDataSource extends _MatTableDataSource {
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Generated bundle index. Do not edit.
 */

export { MatCell, MatCellDef, MatColumnDef, MatFooterCell, MatFooterCellDef, MatFooterRow, MatFooterRowDef, MatHeaderCell, MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatNoDataRow, MatRecycleRows, MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule, MatTextColumn, _MatTableDataSource };

//# sourceMappingURL=table.js.map