import { __awaiter } from 'tslib';
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
class _MatTooltipHarnessBase extends ComponentHarness {
    /** Shows the tooltip. */
    show() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            // We need to dispatch both `touchstart` and a hover event, because the tooltip binds
            // different events depending on the device. The `changedTouches` is there in case the
            // element has ripples.
            // @breaking-change 12.0.0 Remove null assertion from `dispatchEvent`.
            yield ((_a = host.dispatchEvent) === null || _a === void 0 ? void 0 : _a.call(host, 'touchstart', { changedTouches: [] }));
            yield host.hover();
        });
    }
    /** Hides the tooltip. */
    hide() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            // We need to dispatch both `touchstart` and a hover event, because
            // the tooltip binds different events depending on the device.
            // @breaking-change 12.0.0 Remove null assertion from `dispatchEvent`.
            yield ((_a = host.dispatchEvent) === null || _a === void 0 ? void 0 : _a.call(host, 'touchend'));
            yield host.mouseAway();
            yield this.forceStabilize(); // Needed in order to flush the `hide` animation.
        });
    }
    /** Gets whether the tooltip is open. */
    isOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!(yield this._optionalPanel());
        });
    }
    /** Gets a promise for the tooltip panel's text. */
    getTooltipText() {
        return __awaiter(this, void 0, void 0, function* () {
            const panel = yield this._optionalPanel();
            return panel ? panel.text() : '';
        });
    }
}
/** Harness for interacting with a standard mat-tooltip in tests. */
class MatTooltipHarness extends _MatTooltipHarnessBase {
    constructor() {
        super(...arguments);
        this._optionalPanel = this.documentRootLocatorFactory().locatorForOptional('.mat-tooltip');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search
     * for a tooltip trigger with specific attributes.
     * @param options Options for narrowing the search.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatTooltipHarness, options);
    }
}
MatTooltipHarness.hostSelector = '.mat-tooltip-trigger';

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

export { MatTooltipHarness, _MatTooltipHarnessBase };
//# sourceMappingURL=testing.js.map
