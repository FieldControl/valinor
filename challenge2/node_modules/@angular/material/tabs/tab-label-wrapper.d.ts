/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { ElementRef } from '@angular/core';
import { CanDisable, CanDisableCtor } from '@angular/material/core';
/** @docs-private */
declare class MatTabLabelWrapperBase {
}
declare const _MatTabLabelWrapperMixinBase: CanDisableCtor & typeof MatTabLabelWrapperBase;
/**
 * Used in the `mat-tab-group` view to display tab labels.
 * @docs-private
 */
export declare class MatTabLabelWrapper extends _MatTabLabelWrapperMixinBase implements CanDisable {
    elementRef: ElementRef;
    constructor(elementRef: ElementRef);
    /** Sets focus on the wrapper element */
    focus(): void;
    getOffsetLeft(): number;
    getOffsetWidth(): number;
    static ngAcceptInputType_disabled: BooleanInput;
}
export {};
