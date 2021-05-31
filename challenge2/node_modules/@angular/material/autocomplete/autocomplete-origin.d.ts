/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
/** Base class containing all of the functionality for `MatAutocompleteOrigin`. */
export declare abstract class _MatAutocompleteOriginBase {
    /** Reference to the element on which the directive is applied. */
    elementRef: ElementRef<HTMLElement>;
    constructor(
    /** Reference to the element on which the directive is applied. */
    elementRef: ElementRef<HTMLElement>);
}
/**
 * Directive applied to an element to make it usable
 * as a connection point for an autocomplete panel.
 */
export declare class MatAutocompleteOrigin extends _MatAutocompleteOriginBase {
}
