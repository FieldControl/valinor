import { __awaiter } from 'tslib';
import { ContentContainerComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Harness for interacting with a standard `MatDialog` in tests. */
class MatDialogHarness extends ContentContainerComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatDialogHarness` that meets
     * certain criteria.
     * @param options Options for filtering which dialog instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatDialogHarness, options);
    }
    /** Gets the id of the dialog. */
    getId() {
        return __awaiter(this, void 0, void 0, function* () {
            const id = yield (yield this.host()).getAttribute('id');
            // In case no id has been specified, the "id" property always returns
            // an empty string. To make this method more explicit, we return null.
            return id !== '' ? id : null;
        });
    }
    /** Gets the role of the dialog. */
    getRole() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getAttribute('role');
        });
    }
    /** Gets the value of the dialog's "aria-label" attribute. */
    getAriaLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getAttribute('aria-label');
        });
    }
    /** Gets the value of the dialog's "aria-labelledby" attribute. */
    getAriaLabelledby() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getAttribute('aria-labelledby');
        });
    }
    /** Gets the value of the dialog's "aria-describedby" attribute. */
    getAriaDescribedby() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getAttribute('aria-describedby');
        });
    }
    /**
     * Closes the dialog by pressing escape.
     *
     * Note: this method does nothing if `disableClose` has been set to `true` for the dialog.
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.host()).sendKeys(TestKey.ESCAPE);
        });
    }
}
// Developers can provide a custom component or template for the
// dialog. The canonical dialog parent is the "MatDialogContainer".
/** The selector for the host element of a `MatDialog` instance. */
MatDialogHarness.hostSelector = '.mat-dialog-container';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export { MatDialogHarness };
//# sourceMappingURL=testing.js.map
