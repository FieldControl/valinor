(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/cdk/coercion'), require('@angular/material/core')) :
    typeof define === 'function' && define.amd ? define('@angular/material/divider', ['exports', '@angular/core', '@angular/cdk/coercion', '@angular/material/core'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ng = global.ng || {}, global.ng.material = global.ng.material || {}, global.ng.material.divider = {}), global.ng.core, global.ng.cdk.coercion, global.ng.material.core));
}(this, (function (exports, core, coercion, core$1) { 'use strict';

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatDivider = /** @class */ (function () {
        function MatDivider() {
            this._vertical = false;
            this._inset = false;
        }
        Object.defineProperty(MatDivider.prototype, "vertical", {
            /** Whether the divider is vertically aligned. */
            get: function () { return this._vertical; },
            set: function (value) { this._vertical = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MatDivider.prototype, "inset", {
            /** Whether the divider is an inset divider. */
            get: function () { return this._inset; },
            set: function (value) { this._inset = coercion.coerceBooleanProperty(value); },
            enumerable: false,
            configurable: true
        });
        return MatDivider;
    }());
    MatDivider.decorators = [
        { type: core.Component, args: [{
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
                    encapsulation: core.ViewEncapsulation.None,
                    changeDetection: core.ChangeDetectionStrategy.OnPush,
                    styles: [".mat-divider{display:block;margin:0;border-top-width:1px;border-top-style:solid}.mat-divider.mat-divider-vertical{border-top:0;border-right-width:1px;border-right-style:solid}.mat-divider.mat-divider-inset{margin-left:80px}[dir=rtl] .mat-divider.mat-divider-inset{margin-left:auto;margin-right:80px}\n"]
                },] }
    ];
    MatDivider.propDecorators = {
        vertical: [{ type: core.Input }],
        inset: [{ type: core.Input }]
    };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var MatDividerModule = /** @class */ (function () {
        function MatDividerModule() {
        }
        return MatDividerModule;
    }());
    MatDividerModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [core$1.MatCommonModule],
                    exports: [MatDivider, core$1.MatCommonModule],
                    declarations: [MatDivider],
                },] }
    ];

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

    exports.MatDivider = MatDivider;
    exports.MatDividerModule = MatDividerModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=material-divider.umd.js.map
