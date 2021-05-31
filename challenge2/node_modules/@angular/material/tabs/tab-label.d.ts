/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '@angular/core';
import { CdkPortal } from '@angular/cdk/portal';
/**
 * Injection token that can be used to reference instances of `MatTabLabel`. It serves as
 * alternative token to the actual `MatTabLabel` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export declare const MAT_TAB_LABEL: InjectionToken<MatTabLabel>;
/** Used to flag tab labels for use with the portal directive */
export declare class MatTabLabel extends CdkPortal {
}
