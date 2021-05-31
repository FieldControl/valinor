import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input, NgModule } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { MatCommonModule } from '@angular/material/core';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ɵngcc0 from '@angular/core';
class MatDivider {
    constructor() {
        this._vertical = false;
        this._inset = false;
    }
    /** Whether the divider is vertically aligned. */
    get vertical() { return this._vertical; }
    set vertical(value) { this._vertical = coerceBooleanProperty(value); }
    /** Whether the divider is an inset divider. */
    get inset() { return this._inset; }
    set inset(value) { this._inset = coerceBooleanProperty(value); }
}
MatDivider.ɵfac = function MatDivider_Factory(t) { return new (t || MatDivider)(); };
MatDivider.ɵcmp = /*@__PURE__*/ ɵngcc0.ɵɵdefineComponent({ type: MatDivider, selectors: [["mat-divider"]], hostAttrs: ["role", "separator", 1, "mat-divider"], hostVars: 7, hostBindings: function MatDivider_HostBindings(rf, ctx) { if (rf & 2) {
        ɵngcc0.ɵɵattribute("aria-orientation", ctx.vertical ? "vertical" : "horizontal");
        ɵngcc0.ɵɵclassProp("mat-divider-vertical", ctx.vertical)("mat-divider-horizontal", !ctx.vertical)("mat-divider-inset", ctx.inset);
    } }, inputs: { vertical: "vertical", inset: "inset" }, decls: 0, vars: 0, template: function MatDivider_Template(rf, ctx) { }, styles: [".mat-divider{display:block;margin:0;border-top-width:1px;border-top-style:solid}.mat-divider.mat-divider-vertical{border-top:0;border-right-width:1px;border-right-style:solid}.mat-divider.mat-divider-inset{margin-left:80px}[dir=rtl] .mat-divider.mat-divider-inset{margin-left:auto;margin-right:80px}\n"], encapsulation: 2, changeDetection: 0 });
MatDivider.propDecorators = {
    vertical: [{ type: Input }],
    inset: [{ type: Input }]
};
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatDivider, [{
        type: Component,
        args: [{
                selector: 'mat-divider',
                host: {
                    'role': 'separator',
                    '[attr.aria-orientation]': 'vertical ? "vertical" : "horizontal"',
                    '[class.mat-divider-vertical]': 'vertical',
                    '[class.mat-divider-horizontal]': '!vertical',
                    '[class.mat-divider-inset]': 'inset',
                    'class': 'mat-divider'
                },
                template: '',
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush,
                styles: [".mat-divider{display:block;margin:0;border-top-width:1px;border-top-style:solid}.mat-divider.mat-divider-vertical{border-top:0;border-right-width:1px;border-right-style:solid}.mat-divider.mat-divider-inset{margin-left:80px}[dir=rtl] .mat-divider.mat-divider-inset{margin-left:auto;margin-right:80px}\n"]
            }]
    }], function () { return []; }, { vertical: [{
            type: Input
        }], inset: [{
            type: Input
        }] }); })();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class MatDividerModule {
}
MatDividerModule.ɵfac = function MatDividerModule_Factory(t) { return new (t || MatDividerModule)(); };
MatDividerModule.ɵmod = /*@__PURE__*/ ɵngcc0.ɵɵdefineNgModule({ type: MatDividerModule });
MatDividerModule.ɵinj = /*@__PURE__*/ ɵngcc0.ɵɵdefineInjector({ imports: [[MatCommonModule], MatCommonModule] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && ɵngcc0.ɵsetClassMetadata(MatDividerModule, [{
        type: NgModule,
        args: [{
                imports: [MatCommonModule],
                exports: [MatDivider, MatCommonModule],
                declarations: [MatDivider]
            }]
    }], null, null); })();
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && ɵngcc0.ɵɵsetNgModuleScope(MatDividerModule, { declarations: function () { return [MatDivider]; }, imports: function () { return [MatCommonModule]; }, exports: function () { return [MatDivider, MatCommonModule]; } }); })();

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

export { MatDivider, MatDividerModule };

//# sourceMappingURL=divider.js.map