/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
export class _MatRadioGroupHarnessBase extends ComponentHarness {
    /** Gets the name of the radio-group. */
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            const hostName = yield this._getGroupNameFromHost();
            // It's not possible to always determine the "name" of a radio-group by reading
            // the attribute. This is because the radio-group does not set the "name" as an
            // element attribute if the "name" value is set through a binding.
            if (hostName !== null) {
                return hostName;
            }
            // In case we couldn't determine the "name" of a radio-group by reading the
            // "name" attribute, we try to determine the "name" of the group by going
            // through all radio buttons.
            const radioNames = yield this._getNamesFromRadioButtons();
            if (!radioNames.length) {
                return null;
            }
            if (!this._checkRadioNamesInGroupEqual(radioNames)) {
                throw Error('Radio buttons in radio-group have mismatching names.');
            }
            return radioNames[0];
        });
    }
    /** Gets the id of the radio-group. */
    getId() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getProperty('id');
        });
    }
    /** Gets the checked radio-button in a radio-group. */
    getCheckedRadioButton() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let radioButton of yield this.getRadioButtons()) {
                if (yield radioButton.isChecked()) {
                    return radioButton;
                }
            }
            return null;
        });
    }
    /** Gets the checked value of the radio-group. */
    getCheckedValue() {
        return __awaiter(this, void 0, void 0, function* () {
            const checkedRadio = yield this.getCheckedRadioButton();
            if (!checkedRadio) {
                return null;
            }
            return checkedRadio.getValue();
        });
    }
    /**
     * Gets a list of radio buttons which are part of the radio-group.
     * @param filter Optionally filters which radio buttons are included.
     */
    getRadioButtons(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(this._buttonClass.with(filter))();
        });
    }
    /**
     * Checks a radio button in this group.
     * @param filter An optional filter to apply to the child radio buttons. The first tab matching
     *     the filter will be selected.
     */
    checkRadioButton(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const radioButtons = yield this.getRadioButtons(filter);
            if (!radioButtons.length) {
                throw Error(`Could not find radio button matching ${JSON.stringify(filter)}`);
            }
            return radioButtons[0].check();
        });
    }
    /** Gets the name attribute of the host element. */
    _getGroupNameFromHost() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getAttribute('name');
        });
    }
    /** Gets a list of the name attributes of all child radio buttons. */
    _getNamesFromRadioButtons() {
        return __awaiter(this, void 0, void 0, function* () {
            const groupNames = [];
            for (let radio of yield this.getRadioButtons()) {
                const radioName = yield radio.getName();
                if (radioName !== null) {
                    groupNames.push(radioName);
                }
            }
            return groupNames;
        });
    }
    /** Checks if the specified radio names are all equal. */
    _checkRadioNamesInGroupEqual(radioNames) {
        let groupName = null;
        for (let radioName of radioNames) {
            if (groupName === null) {
                groupName = radioName;
            }
            else if (groupName !== radioName) {
                return false;
            }
        }
        return true;
    }
    /**
     * Checks if a radio-group harness has the given name. Throws if a radio-group with
     * matching name could be found but has mismatching radio-button names.
     */
    static _checkRadioGroupName(harness, name) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if there is a radio-group which has the "name" attribute set
            // to the expected group name. It's not possible to always determine
            // the "name" of a radio-group by reading the attribute. This is because
            // the radio-group does not set the "name" as an element attribute if the
            // "name" value is set through a binding.
            if ((yield harness._getGroupNameFromHost()) === name) {
                return true;
            }
            // Check if there is a group with radio-buttons that all have the same
            // expected name. This implies that the group has the given name. It's
            // not possible to always determine the name of a radio-group through
            // the attribute because there is
            const radioNames = yield harness._getNamesFromRadioButtons();
            if (radioNames.indexOf(name) === -1) {
                return false;
            }
            if (!harness._checkRadioNamesInGroupEqual(radioNames)) {
                throw Error(`The locator found a radio-group with name "${name}", but some ` +
                    `radio-button's within the group have mismatching names, which is invalid.`);
            }
            return true;
        });
    }
}
/** Harness for interacting with a standard mat-radio-group in tests. */
export class MatRadioGroupHarness extends _MatRadioGroupHarnessBase {
    constructor() {
        super(...arguments);
        this._buttonClass = MatRadioButtonHarness;
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatRadioGroupHarness` that meets
     * certain criteria.
     * @param options Options for filtering which radio group instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatRadioGroupHarness, options)
            .addOption('name', options.name, this._checkRadioGroupName);
    }
}
/** The selector for the host element of a `MatRadioGroup` instance. */
MatRadioGroupHarness.hostSelector = '.mat-radio-group';
export class _MatRadioButtonHarnessBase extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._input = this.locatorFor('input');
    }
    /** Whether the radio-button is checked. */
    isChecked() {
        return __awaiter(this, void 0, void 0, function* () {
            const checked = (yield this._input()).getProperty('checked');
            return coerceBooleanProperty(yield checked);
        });
    }
    /** Whether the radio-button is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            const disabled = (yield this._input()).getAttribute('disabled');
            return coerceBooleanProperty(yield disabled);
        });
    }
    /** Whether the radio-button is required. */
    isRequired() {
        return __awaiter(this, void 0, void 0, function* () {
            const required = (yield this._input()).getAttribute('required');
            return coerceBooleanProperty(yield required);
        });
    }
    /** Gets the radio-button's name. */
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).getAttribute('name');
        });
    }
    /** Gets the radio-button's id. */
    getId() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getProperty('id');
        });
    }
    /**
     * Gets the value of the radio-button. The radio-button value will be converted to a string.
     *
     * Note: This means that for radio-button's with an object as a value `[object Object]` is
     * intentionally returned.
     */
    getValue() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).getProperty('value');
        });
    }
    /** Gets the radio-button's label text. */
    getLabelText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._textLabel()).text();
        });
    }
    /** Focuses the radio-button. */
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).focus();
        });
    }
    /** Blurs the radio-button. */
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).blur();
        });
    }
    /** Whether the radio-button is focused. */
    isFocused() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).isFocused();
        });
    }
    /**
     * Puts the radio-button in a checked state by clicking it if it is currently unchecked,
     * or doing nothing if it is already checked.
     */
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isChecked())) {
                return (yield this._clickLabel()).click();
            }
        });
    }
}
/** Harness for interacting with a standard mat-radio-button in tests. */
export class MatRadioButtonHarness extends _MatRadioButtonHarnessBase {
    constructor() {
        super(...arguments);
        this._textLabel = this.locatorFor('.mat-radio-label-content');
        this._clickLabel = this.locatorFor('.mat-radio-label');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatRadioButtonHarness` that meets
     * certain criteria.
     * @param options Options for filtering which radio button instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatRadioButtonHarness, options)
            .addOption('label', options.label, (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label))
            .addOption('name', options.name, (harness, name) => __awaiter(this, void 0, void 0, function* () { return (yield harness.getName()) === name; }));
    }
}
/** The selector for the host element of a `MatRadioButton` instance. */
MatRadioButtonHarness.hostSelector = '.mat-radio-button';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFkaW8taGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9yYWRpby90ZXN0aW5nL3JhZGlvLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzVELE9BQU8sRUFHTCxnQkFBZ0IsRUFFaEIsZ0JBQWdCLEdBRWpCLE1BQU0sc0JBQXNCLENBQUM7QUFHOUIsTUFBTSxPQUFnQix5QkFRcEIsU0FBUSxnQkFBZ0I7SUFHeEIsd0NBQXdDO0lBQ2xDLE9BQU87O1lBQ1gsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUNwRCwrRUFBK0U7WUFDL0UsK0VBQStFO1lBQy9FLGtFQUFrRTtZQUNsRSxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7Z0JBQ3JCLE9BQU8sUUFBUSxDQUFDO2FBQ2pCO1lBQ0QsMkVBQTJFO1lBQzNFLHlFQUF5RTtZQUN6RSw2QkFBNkI7WUFDN0IsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUMxRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtnQkFDdEIsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ2xELE1BQU0sS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7YUFDckU7WUFDRCxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUUsQ0FBQztRQUN4QixDQUFDO0tBQUE7SUFFRCxzQ0FBc0M7SUFDaEMsS0FBSzs7WUFDVCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0MsQ0FBQztL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QW1CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1xuICBBc3luY0ZhY3RvcnlGbixcbiAgQmFzZUhhcm5lc3NGaWx0ZXJzLFxuICBDb21wb25lbnRIYXJuZXNzLFxuICBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3IsXG4gIEhhcm5lc3NQcmVkaWNhdGUsXG4gIFRlc3RFbGVtZW50LFxufSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge1JhZGlvQnV0dG9uSGFybmVzc0ZpbHRlcnMsIFJhZGlvR3JvdXBIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9yYWRpby1oYXJuZXNzLWZpbHRlcnMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgX01hdFJhZGlvR3JvdXBIYXJuZXNzQmFzZTxcbiAgQnV0dG9uVHlwZSBleHRlbmRzIChDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8QnV0dG9uPiAmIHtcbiAgICB3aXRoOiAob3B0aW9ucz86IEJ1dHRvbkZpbHRlcnMpID0+IEhhcm5lc3NQcmVkaWNhdGU8QnV0dG9uPn0pLFxuICBCdXR0b24gZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzICYge1xuICAgIGlzQ2hlY2tlZCgpOiBQcm9taXNlPGJvb2xlYW4+LCBnZXRWYWx1ZSgpOiBQcm9taXNlPHN0cmluZ3xudWxsPixcbiAgICBnZXROYW1lKCk6IFByb21pc2U8c3RyaW5nfG51bGw+LCBjaGVjaygpOiBQcm9taXNlPHZvaWQ+XG4gIH0sXG4gIEJ1dHRvbkZpbHRlcnMgZXh0ZW5kcyBCYXNlSGFybmVzc0ZpbHRlcnNcbj4gZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzIHtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9idXR0b25DbGFzczogQnV0dG9uVHlwZTtcblxuICAvKiogR2V0cyB0aGUgbmFtZSBvZiB0aGUgcmFkaW8tZ3JvdXAuICovXG4gIGFzeW5jIGdldE5hbWUoKTogUHJvbWlzZTxzdHJpbmd8bnVsbD4ge1xuICAgIGNvbnN0IGhvc3ROYW1lID0gYXdhaXQgdGhpcy5fZ2V0R3JvdXBOYW1lRnJvbUhvc3QoKTtcbiAgICAvLyBJdCdzIG5vdCBwb3NzaWJsZSB0byBhbHdheXMgZGV0ZXJtaW5lIHRoZSBcIm5hbWVcIiBvZiBhIHJhZGlvLWdyb3VwIGJ5IHJlYWRpbmdcbiAgICAvLyB0aGUgYXR0cmlidXRlLiBUaGlzIGlzIGJlY2F1c2UgdGhlIHJhZGlvLWdyb3VwIGRvZXMgbm90IHNldCB0aGUgXCJuYW1lXCIgYXMgYW5cbiAgICAvLyBlbGVtZW50IGF0dHJpYnV0ZSBpZiB0aGUgXCJuYW1lXCIgdmFsdWUgaXMgc2V0IHRocm91Z2ggYSBiaW5kaW5nLlxuICAgIGlmIChob3N0TmFtZSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGhvc3ROYW1lO1xuICAgIH1cbiAgICAvLyBJbiBjYXNlIHdlIGNvdWxkbid0IGRldGVybWluZSB0aGUgXCJuYW1lXCIgb2YgYSByYWRpby1ncm91cCBieSByZWFkaW5nIHRoZVxuICAgIC8vIFwibmFtZVwiIGF0dHJpYnV0ZSwgd2UgdHJ5IHRvIGRldGVybWluZSB0aGUgXCJuYW1lXCIgb2YgdGhlIGdyb3VwIGJ5IGdvaW5nXG4gICAgLy8gdGhyb3VnaCBhbGwgcmFkaW8gYnV0dG9ucy5cbiAgICBjb25zdCByYWRpb05hbWVzID0gYXdhaXQgdGhpcy5fZ2V0TmFtZXNGcm9tUmFkaW9CdXR0b25zKCk7XG4gICAgaWYgKCFyYWRpb05hbWVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmICghdGhpcy5fY2hlY2tSYWRpb05hbWVzSW5Hcm91cEVxdWFsKHJhZGlvTmFtZXMpKSB7XG4gICAgICB0aHJvdyBFcnJvcignUmFkaW8gYnV0dG9ucyBpbiByYWRpby1ncm91cCBoYXZlIG1pc21hdGNoaW5nIG5hbWVzLicpO1xuICAgIH1cbiAgICByZXR1cm4gcmFkaW9OYW1lc1swXSE7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgaWQgb2YgdGhlIHJhZGlvLWdyb3VwLiAqL1xuICBhc3luYyBnZXRJZCgpOiBQcm9taXNlPHN0cmluZ3xudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHkoJ2lkJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY2hlY2tlZCByYWRpby1idXR0b24gaW4gYSByYWRpby1ncm91cC4gKi9cbiAgYXN5bmMgZ2V0Q2hlY2tlZFJhZGlvQnV0dG9uKCk6IFByb21pc2U8QnV0dG9ufG51bGw+IHtcbiAgICBmb3IgKGxldCByYWRpb0J1dHRvbiBvZiBhd2FpdCB0aGlzLmdldFJhZGlvQnV0dG9ucygpKSB7XG4gICAgICBpZiAoYXdhaXQgcmFkaW9CdXR0b24uaXNDaGVja2VkKCkpIHtcbiAgICAgICAgcmV0dXJuIHJhZGlvQnV0dG9uO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBjaGVja2VkIHZhbHVlIG9mIHRoZSByYWRpby1ncm91cC4gKi9cbiAgYXN5bmMgZ2V0Q2hlY2tlZFZhbHVlKCk6IFByb21pc2U8c3RyaW5nfG51bGw+IHtcbiAgICBjb25zdCBjaGVja2VkUmFkaW8gPSBhd2FpdCB0aGlzLmdldENoZWNrZWRSYWRpb0J1dHRvbigpO1xuICAgIGlmICghY2hlY2tlZFJhZGlvKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGNoZWNrZWRSYWRpby5nZXRWYWx1ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBsaXN0IG9mIHJhZGlvIGJ1dHRvbnMgd2hpY2ggYXJlIHBhcnQgb2YgdGhlIHJhZGlvLWdyb3VwLlxuICAgKiBAcGFyYW0gZmlsdGVyIE9wdGlvbmFsbHkgZmlsdGVycyB3aGljaCByYWRpbyBidXR0b25zIGFyZSBpbmNsdWRlZC5cbiAgICovXG4gIGFzeW5jIGdldFJhZGlvQnV0dG9ucyhmaWx0ZXI/OiBCdXR0b25GaWx0ZXJzKTogUHJvbWlzZTxCdXR0b25bXT4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGb3JBbGwodGhpcy5fYnV0dG9uQ2xhc3Mud2l0aChmaWx0ZXIpKSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBhIHJhZGlvIGJ1dHRvbiBpbiB0aGlzIGdyb3VwLlxuICAgKiBAcGFyYW0gZmlsdGVyIEFuIG9wdGlvbmFsIGZpbHRlciB0byBhcHBseSB0byB0aGUgY2hpbGQgcmFkaW8gYnV0dG9ucy4gVGhlIGZpcnN0IHRhYiBtYXRjaGluZ1xuICAgKiAgICAgdGhlIGZpbHRlciB3aWxsIGJlIHNlbGVjdGVkLlxuICAgKi9cbiAgYXN5bmMgY2hlY2tSYWRpb0J1dHRvbihmaWx0ZXI/OiBCdXR0b25GaWx0ZXJzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmFkaW9CdXR0b25zID0gYXdhaXQgdGhpcy5nZXRSYWRpb0J1dHRvbnMoZmlsdGVyKTtcbiAgICBpZiAoIXJhZGlvQnV0dG9ucy5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKGBDb3VsZCBub3QgZmluZCByYWRpbyBidXR0b24gbWF0Y2hpbmcgJHtKU09OLnN0cmluZ2lmeShmaWx0ZXIpfWApO1xuICAgIH1cbiAgICByZXR1cm4gcmFkaW9CdXR0b25zWzBdLmNoZWNrKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbmFtZSBhdHRyaWJ1dGUgb2YgdGhlIGhvc3QgZWxlbWVudC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0R3JvdXBOYW1lRnJvbUhvc3QoKSB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0QXR0cmlidXRlKCduYW1lJyk7XG4gIH1cblxuICAvKiogR2V0cyBhIGxpc3Qgb2YgdGhlIG5hbWUgYXR0cmlidXRlcyBvZiBhbGwgY2hpbGQgcmFkaW8gYnV0dG9ucy4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0TmFtZXNGcm9tUmFkaW9CdXR0b25zKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCBncm91cE5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGZvciAobGV0IHJhZGlvIG9mIGF3YWl0IHRoaXMuZ2V0UmFkaW9CdXR0b25zKCkpIHtcbiAgICAgIGNvbnN0IHJhZGlvTmFtZSA9IGF3YWl0IHJhZGlvLmdldE5hbWUoKTtcbiAgICAgIGlmIChyYWRpb05hbWUgIT09IG51bGwpIHtcbiAgICAgICAgZ3JvdXBOYW1lcy5wdXNoKHJhZGlvTmFtZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBncm91cE5hbWVzO1xuICB9XG5cbiAgLyoqIENoZWNrcyBpZiB0aGUgc3BlY2lmaWVkIHJhZGlvIG5hbWVzIGFyZSBhbGwgZXF1YWwuICovXG4gIHByaXZhdGUgX2NoZWNrUmFkaW9OYW1lc0luR3JvdXBFcXVhbChyYWRpb05hbWVzOiBzdHJpbmdbXSk6IGJvb2xlYW4ge1xuICAgIGxldCBncm91cE5hbWU6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgICBmb3IgKGxldCByYWRpb05hbWUgb2YgcmFkaW9OYW1lcykge1xuICAgICAgaWYgKGdyb3VwTmFtZSA9PT0gbnVsbCkge1xuICAgICAgICBncm91cE5hbWUgPSByYWRpb05hbWU7XG4gICAgICB9IGVsc2UgaWYgKGdyb3VwTmFtZSAhPT0gcmFkaW9OYW1lKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGEgcmFkaW8tZ3JvdXAgaGFybmVzcyBoYXMgdGhlIGdpdmVuIG5hbWUuIFRocm93cyBpZiBhIHJhZGlvLWdyb3VwIHdpdGhcbiAgICogbWF0Y2hpbmcgbmFtZSBjb3VsZCBiZSBmb3VuZCBidXQgaGFzIG1pc21hdGNoaW5nIHJhZGlvLWJ1dHRvbiBuYW1lcy5cbiAgICovXG4gIHByb3RlY3RlZCBzdGF0aWMgYXN5bmMgX2NoZWNrUmFkaW9Hcm91cE5hbWUoXG4gICAgaGFybmVzczogX01hdFJhZGlvR3JvdXBIYXJuZXNzQmFzZTxhbnksIGFueSwgYW55PiwgbmFtZTogc3RyaW5nKSB7XG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSByYWRpby1ncm91cCB3aGljaCBoYXMgdGhlIFwibmFtZVwiIGF0dHJpYnV0ZSBzZXRcbiAgICAvLyB0byB0aGUgZXhwZWN0ZWQgZ3JvdXAgbmFtZS4gSXQncyBub3QgcG9zc2libGUgdG8gYWx3YXlzIGRldGVybWluZVxuICAgIC8vIHRoZSBcIm5hbWVcIiBvZiBhIHJhZGlvLWdyb3VwIGJ5IHJlYWRpbmcgdGhlIGF0dHJpYnV0ZS4gVGhpcyBpcyBiZWNhdXNlXG4gICAgLy8gdGhlIHJhZGlvLWdyb3VwIGRvZXMgbm90IHNldCB0aGUgXCJuYW1lXCIgYXMgYW4gZWxlbWVudCBhdHRyaWJ1dGUgaWYgdGhlXG4gICAgLy8gXCJuYW1lXCIgdmFsdWUgaXMgc2V0IHRocm91Z2ggYSBiaW5kaW5nLlxuICAgIGlmIChhd2FpdCBoYXJuZXNzLl9nZXRHcm91cE5hbWVGcm9tSG9zdCgpID09PSBuYW1lKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBncm91cCB3aXRoIHJhZGlvLWJ1dHRvbnMgdGhhdCBhbGwgaGF2ZSB0aGUgc2FtZVxuICAgIC8vIGV4cGVjdGVkIG5hbWUuIFRoaXMgaW1wbGllcyB0aGF0IHRoZSBncm91cCBoYXMgdGhlIGdpdmVuIG5hbWUuIEl0J3NcbiAgICAvLyBub3QgcG9zc2libGUgdG8gYWx3YXlzIGRldGVybWluZSB0aGUgbmFtZSBvZiBhIHJhZGlvLWdyb3VwIHRocm91Z2hcbiAgICAvLyB0aGUgYXR0cmlidXRlIGJlY2F1c2UgdGhlcmUgaXNcbiAgICBjb25zdCByYWRpb05hbWVzID0gYXdhaXQgaGFybmVzcy5fZ2V0TmFtZXNGcm9tUmFkaW9CdXR0b25zKCk7XG4gICAgaWYgKHJhZGlvTmFtZXMuaW5kZXhPZihuYW1lKSA9PT0gLTEpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKCFoYXJuZXNzLl9jaGVja1JhZGlvTmFtZXNJbkdyb3VwRXF1YWwocmFkaW9OYW1lcykpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgIGBUaGUgbG9jYXRvciBmb3VuZCBhIHJhZGlvLWdyb3VwIHdpdGggbmFtZSBcIiR7bmFtZX1cIiwgYnV0IHNvbWUgYCArXG4gICAgICAgICAgYHJhZGlvLWJ1dHRvbidzIHdpdGhpbiB0aGUgZ3JvdXAgaGF2ZSBtaXNtYXRjaGluZyBuYW1lcywgd2hpY2ggaXMgaW52YWxpZC5gKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBtYXQtcmFkaW8tZ3JvdXAgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0UmFkaW9Hcm91cEhhcm5lc3MgZXh0ZW5kcyBfTWF0UmFkaW9Hcm91cEhhcm5lc3NCYXNlPFxuICB0eXBlb2YgTWF0UmFkaW9CdXR0b25IYXJuZXNzLFxuICBNYXRSYWRpb0J1dHRvbkhhcm5lc3MsXG4gIFJhZGlvQnV0dG9uSGFybmVzc0ZpbHRlcnNcbj4ge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdFJhZGlvR3JvdXBgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtcmFkaW8tZ3JvdXAnO1xuICBwcm90ZWN0ZWQgX2J1dHRvbkNsYXNzID0gTWF0UmFkaW9CdXR0b25IYXJuZXNzO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRSYWRpb0dyb3VwSGFybmVzc2AgdGhhdCBtZWV0c1xuICAgKiBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggcmFkaW8gZ3JvdXAgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogUmFkaW9Hcm91cEhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdFJhZGlvR3JvdXBIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdFJhZGlvR3JvdXBIYXJuZXNzLCBvcHRpb25zKVxuICAgICAgICAuYWRkT3B0aW9uKCduYW1lJywgb3B0aW9ucy5uYW1lLCB0aGlzLl9jaGVja1JhZGlvR3JvdXBOYW1lKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgX01hdFJhZGlvQnV0dG9uSGFybmVzc0Jhc2UgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzIHtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF90ZXh0TGFiZWw6IEFzeW5jRmFjdG9yeUZuPFRlc3RFbGVtZW50PjtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9jbGlja0xhYmVsOiBBc3luY0ZhY3RvcnlGbjxUZXN0RWxlbWVudD47XG4gIHByaXZhdGUgX2lucHV0ID0gdGhpcy5sb2NhdG9yRm9yKCdpbnB1dCcpO1xuXG4gIC8qKiBXaGV0aGVyIHRoZSByYWRpby1idXR0b24gaXMgY2hlY2tlZC4gKi9cbiAgYXN5bmMgaXNDaGVja2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGNoZWNrZWQgPSAoYXdhaXQgdGhpcy5faW5wdXQoKSkuZ2V0UHJvcGVydHkoJ2NoZWNrZWQnKTtcbiAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGF3YWl0IGNoZWNrZWQpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHJhZGlvLWJ1dHRvbiBpcyBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgaXNEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkaXNhYmxlZCA9IChhd2FpdCB0aGlzLl9pbnB1dCgpKS5nZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgcmV0dXJuIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShhd2FpdCBkaXNhYmxlZCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgcmFkaW8tYnV0dG9uIGlzIHJlcXVpcmVkLiAqL1xuICBhc3luYyBpc1JlcXVpcmVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlcXVpcmVkID0gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmdldEF0dHJpYnV0ZSgncmVxdWlyZWQnKTtcbiAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGF3YWl0IHJlcXVpcmVkKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSByYWRpby1idXR0b24ncyBuYW1lLiAqL1xuICBhc3luYyBnZXROYW1lKCk6IFByb21pc2U8c3RyaW5nfG51bGw+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmdldEF0dHJpYnV0ZSgnbmFtZScpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHJhZGlvLWJ1dHRvbidzIGlkLiAqL1xuICBhc3luYyBnZXRJZCgpOiBQcm9taXNlPHN0cmluZ3xudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHkoJ2lkJyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdmFsdWUgb2YgdGhlIHJhZGlvLWJ1dHRvbi4gVGhlIHJhZGlvLWJ1dHRvbiB2YWx1ZSB3aWxsIGJlIGNvbnZlcnRlZCB0byBhIHN0cmluZy5cbiAgICpcbiAgICogTm90ZTogVGhpcyBtZWFucyB0aGF0IGZvciByYWRpby1idXR0b24ncyB3aXRoIGFuIG9iamVjdCBhcyBhIHZhbHVlIGBbb2JqZWN0IE9iamVjdF1gIGlzXG4gICAqIGludGVudGlvbmFsbHkgcmV0dXJuZWQuXG4gICAqL1xuICBhc3luYyBnZXRWYWx1ZSgpOiBQcm9taXNlPHN0cmluZ3xudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9pbnB1dCgpKS5nZXRQcm9wZXJ0eSgndmFsdWUnKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSByYWRpby1idXR0b24ncyBsYWJlbCB0ZXh0LiAqL1xuICBhc3luYyBnZXRMYWJlbFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX3RleHRMYWJlbCgpKS50ZXh0KCk7XG4gIH1cblxuICAvKiogRm9jdXNlcyB0aGUgcmFkaW8tYnV0dG9uLiAqL1xuICBhc3luYyBmb2N1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmZvY3VzKCk7XG4gIH1cblxuICAvKiogQmx1cnMgdGhlIHJhZGlvLWJ1dHRvbi4gKi9cbiAgYXN5bmMgYmx1cigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmJsdXIoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSByYWRpby1idXR0b24gaXMgZm9jdXNlZC4gKi9cbiAgYXN5bmMgaXNGb2N1c2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5faW5wdXQoKSkuaXNGb2N1c2VkKCk7XG4gIH1cblxuICAvKipcbiAgICogUHV0cyB0aGUgcmFkaW8tYnV0dG9uIGluIGEgY2hlY2tlZCBzdGF0ZSBieSBjbGlja2luZyBpdCBpZiBpdCBpcyBjdXJyZW50bHkgdW5jaGVja2VkLFxuICAgKiBvciBkb2luZyBub3RoaW5nIGlmIGl0IGlzIGFscmVhZHkgY2hlY2tlZC5cbiAgICovXG4gIGFzeW5jIGNoZWNrKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghKGF3YWl0IHRoaXMuaXNDaGVja2VkKCkpKSB7XG4gICAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2NsaWNrTGFiZWwoKSkuY2xpY2soKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBtYXQtcmFkaW8tYnV0dG9uIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdFJhZGlvQnV0dG9uSGFybmVzcyBleHRlbmRzIF9NYXRSYWRpb0J1dHRvbkhhcm5lc3NCYXNlIHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRSYWRpb0J1dHRvbmAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1yYWRpby1idXR0b24nO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRSYWRpb0J1dHRvbkhhcm5lc3NgIHRoYXQgbWVldHNcbiAgICogY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIHJhZGlvIGJ1dHRvbiBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBSYWRpb0J1dHRvbkhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdFJhZGlvQnV0dG9uSGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRSYWRpb0J1dHRvbkhhcm5lc3MsIG9wdGlvbnMpXG4gICAgICAgIC5hZGRPcHRpb24oJ2xhYmVsJywgb3B0aW9ucy5sYWJlbCxcbiAgICAgICAgICAoaGFybmVzcywgbGFiZWwpID0+IEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldExhYmVsVGV4dCgpLCBsYWJlbCkpXG4gICAgICAgIC5hZGRPcHRpb24oJ25hbWUnLCBvcHRpb25zLm5hbWUsXG4gICAgICAgICAgYXN5bmMgKGhhcm5lc3MsIG5hbWUpID0+IChhd2FpdCBoYXJuZXNzLmdldE5hbWUoKSkgPT09IG5hbWUpO1xuICB9XG5cbiAgcHJvdGVjdGVkIF90ZXh0TGFiZWwgPSB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtcmFkaW8tbGFiZWwtY29udGVudCcpO1xuICBwcm90ZWN0ZWQgX2NsaWNrTGFiZWwgPSB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtcmFkaW8tbGFiZWwnKTtcbn1cbiJdfQ==