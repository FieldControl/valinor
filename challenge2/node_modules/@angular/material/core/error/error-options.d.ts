/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FormGroupDirective, NgForm, FormControl } from '@angular/forms';
/** Error state matcher that matches when a control is invalid and dirty. */
import * as ɵngcc0 from '@angular/core';
export declare class ShowOnDirtyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean;
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<ShowOnDirtyErrorStateMatcher, never>;
    static ɵprov: ɵngcc0.ɵɵInjectableDeclaration<ShowOnDirtyErrorStateMatcher>;
}
/** Provider that defines how form controls behave with regards to displaying error messages. */
export declare class ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean;
    static ɵfac: ɵngcc0.ɵɵFactoryDeclaration<ErrorStateMatcher, never>;
}

//# sourceMappingURL=error-options.d.ts.map