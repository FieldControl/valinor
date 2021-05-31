/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
/**
 * Directive to automatically resize a textarea to fit its content.
 * @deprecated Use `cdkTextareaAutosize` from `@angular/cdk/text-field` instead.
 * @breaking-change 8.0.0
 */
import * as ɵngcc0 from '@angular/core';
export declare class MatTextareaAutosize extends CdkTextareaAutosize {
    get matAutosizeMinRows(): number;
    set matAutosizeMinRows(value: number);
    get matAutosizeMaxRows(): number;
    set matAutosizeMaxRows(value: number);
    get matAutosize(): boolean;
    set matAutosize(value: boolean);
    get matTextareaAutosize(): boolean;
    set matTextareaAutosize(value: boolean);
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<MatTextareaAutosize, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDeclaration<MatTextareaAutosize, "textarea[mat-autosize], textarea[matTextareaAutosize]", ["matTextareaAutosize"], { "cdkAutosizeMinRows": "cdkAutosizeMinRows"; "cdkAutosizeMaxRows": "cdkAutosizeMaxRows"; "matAutosizeMinRows": "matAutosizeMinRows"; "matAutosizeMaxRows": "matAutosizeMaxRows"; "matAutosize": "mat-autosize"; "matTextareaAutosize": "matTextareaAutosize"; }, {}, never>;
}

//# sourceMappingURL=autosize.d.ts.map