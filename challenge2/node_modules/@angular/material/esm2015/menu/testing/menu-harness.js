/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ContentContainerComponentHarness, HarnessPredicate, TestKey, } from '@angular/cdk/testing';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
export class _MatMenuHarnessBase extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._documentRootLocator = this.documentRootLocatorFactory();
    }
    // TODO: potentially extend MatButtonHarness
    /** Whether the menu is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            const disabled = (yield this.host()).getAttribute('disabled');
            return coerceBooleanProperty(yield disabled);
        });
    }
    /** Whether the menu is open. */
    isOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!(yield this._getMenuPanel());
        });
    }
    /** Gets the text of the menu's trigger element. */
    getTriggerText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).text();
        });
    }
    /** Focuses the menu. */
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).focus();
        });
    }
    /** Blurs the menu. */
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).blur();
        });
    }
    /** Whether the menu is focused. */
    isFocused() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).isFocused();
        });
    }
    /** Opens the menu. */
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isOpen())) {
                return (yield this.host()).click();
            }
        });
    }
    /** Closes the menu. */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            const panel = yield this._getMenuPanel();
            if (panel) {
                return panel.sendKeys(TestKey.ESCAPE);
            }
        });
    }
    /**
     * Gets a list of `MatMenuItemHarness` representing the items in the menu.
     * @param filters Optionally filters which menu items are included.
     */
    getItems(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const panelId = yield this._getPanelId();
            if (panelId) {
                return this._documentRootLocator.locatorForAll(this._itemClass.with(Object.assign(Object.assign({}, (filters || {})), { ancestor: `#${panelId}` })))();
            }
            return [];
        });
    }
    /**
     * Clicks an item in the menu, and optionally continues clicking items in subsequent sub-menus.
     * @param itemFilter A filter used to represent which item in the menu should be clicked. The
     *     first matching menu item will be clicked.
     * @param subItemFilters A list of filters representing the items to click in any subsequent
     *     sub-menus. The first item in the sub-menu matching the corresponding filter in
     *     `subItemFilters` will be clicked.
     */
    clickItem(itemFilter, ...subItemFilters) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.open();
            const items = yield this.getItems(itemFilter);
            if (!items.length) {
                throw Error(`Could not find item matching ${JSON.stringify(itemFilter)}`);
            }
            if (!subItemFilters.length) {
                return yield items[0].click();
            }
            const menu = yield items[0].getSubmenu();
            if (!menu) {
                throw Error(`Item matching ${JSON.stringify(itemFilter)} does not have a submenu`);
            }
            return menu.clickItem(...subItemFilters);
        });
    }
    getRootHarnessLoader() {
        return __awaiter(this, void 0, void 0, function* () {
            const panelId = yield this._getPanelId();
            return this.documentRootLocatorFactory().harnessLoaderFor(`#${panelId}`);
        });
    }
    /** Gets the menu panel associated with this menu. */
    _getMenuPanel() {
        return __awaiter(this, void 0, void 0, function* () {
            const panelId = yield this._getPanelId();
            return panelId ? this._documentRootLocator.locatorForOptional(`#${panelId}`)() : null;
        });
    }
    /** Gets the id of the menu panel associated with this menu. */
    _getPanelId() {
        return __awaiter(this, void 0, void 0, function* () {
            const panelId = yield (yield this.host()).getAttribute('aria-controls');
            return panelId || null;
        });
    }
}
export class _MatMenuItemHarnessBase extends ContentContainerComponentHarness {
    /** Whether the menu is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            const disabled = (yield this.host()).getAttribute('disabled');
            return coerceBooleanProperty(yield disabled);
        });
    }
    /** Gets the text of the menu item. */
    getText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).text();
        });
    }
    /** Focuses the menu item. */
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).focus();
        });
    }
    /** Blurs the menu item. */
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).blur();
        });
    }
    /** Whether the menu item is focused. */
    isFocused() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).isFocused();
        });
    }
    /** Clicks the menu item. */
    click() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).click();
        });
    }
    /** Whether this item has a submenu. */
    hasSubmenu() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).matchesSelector(this._menuClass.hostSelector);
        });
    }
    /** Gets the submenu associated with this menu item, or null if none. */
    getSubmenu() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.hasSubmenu()) {
                return new this._menuClass(this.locatorFactory);
            }
            return null;
        });
    }
}
/** Harness for interacting with a standard mat-menu in tests. */
export class MatMenuHarness extends _MatMenuHarnessBase {
    constructor() {
        super(...arguments);
        this._itemClass = MatMenuItemHarness;
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatMenuHarness` that meets certain
     * criteria.
     * @param options Options for filtering which menu instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatMenuHarness, options)
            .addOption('triggerText', options.triggerText, (harness, text) => HarnessPredicate.stringMatches(harness.getTriggerText(), text));
    }
}
/** The selector for the host element of a `MatMenu` instance. */
MatMenuHarness.hostSelector = '.mat-menu-trigger';
/** Harness for interacting with a standard mat-menu-item in tests. */
export class MatMenuItemHarness extends _MatMenuItemHarnessBase {
    constructor() {
        super(...arguments);
        this._menuClass = MatMenuHarness;
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatMenuItemHarness` that meets
     * certain criteria.
     * @param options Options for filtering which menu item instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatMenuItemHarness, options)
            .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
            .addOption('hasSubmenu', options.hasSubmenu, (harness, hasSubmenu) => __awaiter(this, void 0, void 0, function* () { return (yield harness.hasSubmenu()) === hasSubmenu; }));
    }
}
/** The selector for the host element of a `MatMenuItem` instance. */
MatMenuItemHarness.hostSelector = '.mat-menu-item';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL21lbnUvdGVzdGluZy9tZW51LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFJTCxnQ0FBZ0MsRUFFaEMsZ0JBQWdCLEVBRWhCLE9BQU8sR0FDUixNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRzVELE1BQU0sT0FBZ0IsbUJBT3BCLFNBQVEsZ0NBQXdDO0lBUGxEOztRQVFVLHlCQUFvQixHQUFHLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBOEduRSxDQUFDO0lBM0dDLDRDQUE0QztJQUU1QyxvQ0FBb0M7SUFDOUIsVUFBVTs7WUFDZCxNQUFNLFFBQVEsR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlELE9BQU8scUJBQXFCLENBQUMsTUFBTSxRQUFRLENBQUMsQ0FBQztRQUMvQyxDQUFDO0tBQUE7SUFFRCxnQ0FBZ0M7SUFDMUIsTUFBTTs7WUFDVixPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFDeEMsQ0FBQztLQUFBO0lBRUQsbURBQW1EO0lBQzdDLGNBQWM7O1lBQ2xCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3BDLENBQUM7S0FBQTtJQUVELHdCQUF3QjtJQUNsQixLQUFLOztZQUNULE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JDLENBQUM7S0FBQTtJQUVELHNCQUFzQjtJQUNoQixJQUFJOztZ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TUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQzNCLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUM5RSxTQUFTLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQ3ZDLENBQU8sT0FBTyxFQUFFLFVBQVUsRUFBRSxFQUFFLGdEQUFDLE9BQUEsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLFVBQVUsQ0FBQSxHQUFBLENBQUMsQ0FBQztJQUN0RixDQUFDOztBQWhCRCxxRUFBcUU7QUFDOUQsK0JBQVksR0FBRyxnQkFBZ0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBCYXNlSGFybmVzc0ZpbHRlcnMsXG4gIENvbXBvbmVudEhhcm5lc3MsXG4gIENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcixcbiAgQ29udGVudENvbnRhaW5lckNvbXBvbmVudEhhcm5lc3MsXG4gIEhhcm5lc3NMb2FkZXIsXG4gIEhhcm5lc3NQcmVkaWNhdGUsXG4gIFRlc3RFbGVtZW50LFxuICBUZXN0S2V5LFxufSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge2NvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7TWVudUhhcm5lc3NGaWx0ZXJzLCBNZW51SXRlbUhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL21lbnUtaGFybmVzcy1maWx0ZXJzJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIF9NYXRNZW51SGFybmVzc0Jhc2U8XG4gIEl0ZW1UeXBlIGV4dGVuZHMgKENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxJdGVtPiAmIHtcbiAgICB3aXRoOiAob3B0aW9ucz86IEl0ZW1GaWx0ZXJzKSA9PiBIYXJuZXNzUHJlZGljYXRlPEl0ZW0+fSksXG4gIEl0ZW0gZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzICYge1xuICAgIGNsaWNrKCk6IFByb21pc2U8dm9pZD4sXG4gICAgZ2V0U3VibWVudSgpOiBQcm9taXNlPF9NYXRNZW51SGFybmVzc0Jhc2U8SXRlbVR5cGUsIEl0ZW0sIEl0ZW1GaWx0ZXJzPiB8IG51bGw+fSxcbiAgSXRlbUZpbHRlcnMgZXh0ZW5kcyBCYXNlSGFybmVzc0ZpbHRlcnNcbj4gZXh0ZW5kcyBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzczxzdHJpbmc+IHtcbiAgcHJpdmF0ZSBfZG9jdW1lbnRSb290TG9jYXRvciA9IHRoaXMuZG9jdW1lbnRSb290TG9jYXRvckZhY3RvcnkoKTtcbiAgcHJvdGVjdGVkIGFic3RyYWN0IF9pdGVtQ2xhc3M6IEl0ZW1UeXBlO1xuXG4gIC8vIFRPRE86IHBvdGVudGlhbGx5IGV4dGVuZCBNYXRCdXR0b25IYXJuZXNzXG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgZGlzYWJsZWQgPSAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGF3YWl0IGRpc2FibGVkKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBtZW51IGlzIG9wZW4uICovXG4gIGFzeW5jIGlzT3BlbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gISEoYXdhaXQgdGhpcy5fZ2V0TWVudVBhbmVsKCkpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHRleHQgb2YgdGhlIG1lbnUncyB0cmlnZ2VyIGVsZW1lbnQuICovXG4gIGFzeW5jIGdldFRyaWdnZXJUZXh0KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkudGV4dCgpO1xuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIG1lbnUuICovXG4gIGFzeW5jIGZvY3VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmZvY3VzKCk7XG4gIH1cblxuICAvKiogQmx1cnMgdGhlIG1lbnUuICovXG4gIGFzeW5jIGJsdXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuYmx1cigpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgaXMgZm9jdXNlZC4gKi9cbiAgYXN5bmMgaXNGb2N1c2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmlzRm9jdXNlZCgpO1xuICB9XG5cbiAgLyoqIE9wZW5zIHRoZSBtZW51LiAqL1xuICBhc3luYyBvcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghYXdhaXQgdGhpcy5pc09wZW4oKSkge1xuICAgICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuY2xpY2soKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2xvc2VzIHRoZSBtZW51LiAqL1xuICBhc3luYyBjbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYW5lbCA9IGF3YWl0IHRoaXMuX2dldE1lbnVQYW5lbCgpO1xuICAgIGlmIChwYW5lbCkge1xuICAgICAgcmV0dXJuIHBhbmVsLnNlbmRLZXlzKFRlc3RLZXkuRVNDQVBFKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIGxpc3Qgb2YgYE1hdE1lbnVJdGVtSGFybmVzc2AgcmVwcmVzZW50aW5nIHRoZSBpdGVtcyBpbiB0aGUgbWVudS5cbiAgICogQHBhcmFtIGZpbHRlcnMgT3B0aW9uYWxseSBmaWx0ZXJzIHdoaWNoIG1lbnUgaXRlbXMgYXJlIGluY2x1ZGVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0SXRlbXMoZmlsdGVycz86IE9taXQ8SXRlbUZpbHRlcnMsICdhbmNlc3Rvcic+KTogUHJvbWlzZTxJdGVtW10+IHtcbiAgICBjb25zdCBwYW5lbElkID0gYXdhaXQgdGhpcy5fZ2V0UGFuZWxJZCgpO1xuICAgIGlmIChwYW5lbElkKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZG9jdW1lbnRSb290TG9jYXRvci5sb2NhdG9yRm9yQWxsKHRoaXMuX2l0ZW1DbGFzcy53aXRoKHtcbiAgICAgICAgLi4uKGZpbHRlcnMgfHwge30pLFxuICAgICAgICBhbmNlc3RvcjogYCMke3BhbmVsSWR9YFxuICAgICAgfSBhcyBJdGVtRmlsdGVycykpKCk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGlja3MgYW4gaXRlbSBpbiB0aGUgbWVudSwgYW5kIG9wdGlvbmFsbHkgY29udGludWVzIGNsaWNraW5nIGl0ZW1zIGluIHN1YnNlcXVlbnQgc3ViLW1lbnVzLlxuICAgKiBAcGFyYW0gaXRlbUZpbHRlciBBIGZpbHRlciB1c2VkIHRvIHJlcHJlc2VudCB3aGljaCBpdGVtIGluIHRoZSBtZW51IHNob3VsZCBiZSBjbGlja2VkLiBUaGVcbiAgICogICAgIGZpcnN0IG1hdGNoaW5nIG1lbnUgaXRlbSB3aWxsIGJlIGNsaWNrZWQuXG4gICAqIEBwYXJhbSBzdWJJdGVtRmlsdGVycyBBIGxpc3Qgb2YgZmlsdGVycyByZXByZXNlbnRpbmcgdGhlIGl0ZW1zIHRvIGNsaWNrIGluIGFueSBzdWJzZXF1ZW50XG4gICAqICAgICBzdWItbWVudXMuIFRoZSBmaXJzdCBpdGVtIGluIHRoZSBzdWItbWVudSBtYXRjaGluZyB0aGUgY29ycmVzcG9uZGluZyBmaWx0ZXIgaW5cbiAgICogICAgIGBzdWJJdGVtRmlsdGVyc2Agd2lsbCBiZSBjbGlja2VkLlxuICAgKi9cbiAgYXN5bmMgY2xpY2tJdGVtKFxuICAgICAgaXRlbUZpbHRlcjogT21pdDxJdGVtRmlsdGVycywgJ2FuY2VzdG9yJz4sXG4gICAgICAuLi5zdWJJdGVtRmlsdGVyczogT21pdDxJdGVtRmlsdGVycywgJ2FuY2VzdG9yJz5bXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMub3BlbigpO1xuICAgIGNvbnN0IGl0ZW1zID0gYXdhaXQgdGhpcy5nZXRJdGVtcyhpdGVtRmlsdGVyKTtcbiAgICBpZiAoIWl0ZW1zLmxlbmd0aCkge1xuICAgICAgdGhyb3cgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGl0ZW0gbWF0Y2hpbmcgJHtKU09OLnN0cmluZ2lmeShpdGVtRmlsdGVyKX1gKTtcbiAgICB9XG5cbiAgICBpZiAoIXN1Ykl0ZW1GaWx0ZXJzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGF3YWl0IGl0ZW1zWzBdLmNsaWNrKCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWVudSA9IGF3YWl0IGl0ZW1zWzBdLmdldFN1Ym1lbnUoKTtcbiAgICBpZiAoIW1lbnUpIHtcbiAgICAgIHRocm93IEVycm9yKGBJdGVtIG1hdGNoaW5nICR7SlNPTi5zdHJpbmdpZnkoaXRlbUZpbHRlcil9IGRvZXMgbm90IGhhdmUgYSBzdWJtZW51YCk7XG4gICAgfVxuICAgIHJldHVybiBtZW51LmNsaWNrSXRlbSguLi5zdWJJdGVtRmlsdGVycyBhcyBbT21pdDxJdGVtRmlsdGVycywgJ2FuY2VzdG9yJz5dKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBnZXRSb290SGFybmVzc0xvYWRlcigpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXI+IHtcbiAgICBjb25zdCBwYW5lbElkID0gYXdhaXQgdGhpcy5fZ2V0UGFuZWxJZCgpO1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50Um9vdExvY2F0b3JGYWN0b3J5KCkuaGFybmVzc0xvYWRlckZvcihgIyR7cGFuZWxJZH1gKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBtZW51IHBhbmVsIGFzc29jaWF0ZWQgd2l0aCB0aGlzIG1lbnUuICovXG4gIHByaXZhdGUgYXN5bmMgX2dldE1lbnVQYW5lbCgpOiBQcm9taXNlPFRlc3RFbGVtZW50IHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhbmVsSWQgPSBhd2FpdCB0aGlzLl9nZXRQYW5lbElkKCk7XG4gICAgcmV0dXJuIHBhbmVsSWQgPyB0aGlzLl9kb2N1bWVudFJvb3RMb2NhdG9yLmxvY2F0b3JGb3JPcHRpb25hbChgIyR7cGFuZWxJZH1gKSgpIDogbnVsbDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBpZCBvZiB0aGUgbWVudSBwYW5lbCBhc3NvY2lhdGVkIHdpdGggdGhpcyBtZW51LiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRQYW5lbElkKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIGNvbnN0IHBhbmVsSWQgPSBhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1jb250cm9scycpO1xuICAgIHJldHVybiBwYW5lbElkIHx8IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIF9NYXRNZW51SXRlbUhhcm5lc3NCYXNlPFxuICBNZW51VHlwZSBleHRlbmRzIENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxNZW51PixcbiAgTWVudSBleHRlbmRzIENvbXBvbmVudEhhcm5lc3MsXG4+IGV4dGVuZHMgQ29udGVudENvbnRhaW5lckNvbXBvbmVudEhhcm5lc3M8c3RyaW5nPiB7XG4gIHByb3RlY3RlZCBhYnN0cmFjdCBfbWVudUNsYXNzOiBNZW51VHlwZTtcblxuICAvKiogV2hldGhlciB0aGUgbWVudSBpcyBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgaXNEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBkaXNhYmxlZCA9IChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0QXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICAgIHJldHVybiBjb2VyY2VCb29sZWFuUHJvcGVydHkoYXdhaXQgZGlzYWJsZWQpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHRleHQgb2YgdGhlIG1lbnUgaXRlbS4gKi9cbiAgYXN5bmMgZ2V0VGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBtZW51IGl0ZW0uICovXG4gIGFzeW5jIGZvY3VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmZvY3VzKCk7XG4gIH1cblxuICAvKiogQmx1cnMgdGhlIG1lbnUgaXRlbS4gKi9cbiAgYXN5bmMgYmx1cigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5ibHVyKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgbWVudSBpdGVtIGlzIGZvY3VzZWQuICovXG4gIGFzeW5jIGlzRm9jdXNlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5pc0ZvY3VzZWQoKTtcbiAgfVxuXG4gIC8qKiBDbGlja3MgdGhlIG1lbnUgaXRlbS4gKi9cbiAgYXN5bmMgY2xpY2soKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuY2xpY2soKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoaXMgaXRlbSBoYXMgYSBzdWJtZW51LiAqL1xuICBhc3luYyBoYXNTdWJtZW51KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLm1hdGNoZXNTZWxlY3Rvcih0aGlzLl9tZW51Q2xhc3MuaG9zdFNlbGVjdG9yKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzdWJtZW51IGFzc29jaWF0ZWQgd2l0aCB0aGlzIG1lbnUgaXRlbSwgb3IgbnVsbCBpZiBub25lLiAqL1xuICBhc3luYyBnZXRTdWJtZW51KCk6IFByb21pc2U8TWVudSB8IG51bGw+IHtcbiAgICBpZiAoYXdhaXQgdGhpcy5oYXNTdWJtZW51KCkpIHtcbiAgICAgIHJldHVybiBuZXcgdGhpcy5fbWVudUNsYXNzKHRoaXMubG9jYXRvckZhY3RvcnkpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgbWF0LW1lbnUgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0TWVudUhhcm5lc3MgZXh0ZW5kcyBfTWF0TWVudUhhcm5lc3NCYXNlPFxuICB0eXBlb2YgTWF0TWVudUl0ZW1IYXJuZXNzLCBNYXRNZW51SXRlbUhhcm5lc3MsIE1lbnVJdGVtSGFybmVzc0ZpbHRlcnM+IHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRNZW51YCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LW1lbnUtdHJpZ2dlcic7XG4gIHByb3RlY3RlZCBfaXRlbUNsYXNzID0gTWF0TWVudUl0ZW1IYXJuZXNzO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRNZW51SGFybmVzc2AgdGhhdCBtZWV0cyBjZXJ0YWluXG4gICAqIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggbWVudSBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBNZW51SGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0TWVudUhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0TWVudUhhcm5lc3MsIG9wdGlvbnMpXG4gICAgICAgIC5hZGRPcHRpb24oJ3RyaWdnZXJUZXh0Jywgb3B0aW9ucy50cmlnZ2VyVGV4dCxcbiAgICAgICAgICAgIChoYXJuZXNzLCB0ZXh0KSA9PiBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoaGFybmVzcy5nZXRUcmlnZ2VyVGV4dCgpLCB0ZXh0KSk7XG4gIH1cbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBtYXQtbWVudS1pdGVtIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdE1lbnVJdGVtSGFybmVzcyBleHRlbmRzXG4gIF9NYXRNZW51SXRlbUhhcm5lc3NCYXNlPHR5cGVvZiBNYXRNZW51SGFybmVzcywgTWF0TWVudUhhcm5lc3M+IHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRNZW51SXRlbWAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1tZW51LWl0ZW0nO1xuICBwcm90ZWN0ZWQgX21lbnVDbGFzcyA9IE1hdE1lbnVIYXJuZXNzO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRNZW51SXRlbUhhcm5lc3NgIHRoYXQgbWVldHNcbiAgICogY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIG1lbnUgaXRlbSBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBNZW51SXRlbUhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdE1lbnVJdGVtSGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRNZW51SXRlbUhhcm5lc3MsIG9wdGlvbnMpXG4gICAgICAgIC5hZGRPcHRpb24oJ3RleHQnLCBvcHRpb25zLnRleHQsXG4gICAgICAgICAgICAoaGFybmVzcywgdGV4dCkgPT4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VGV4dCgpLCB0ZXh0KSlcbiAgICAgICAgLmFkZE9wdGlvbignaGFzU3VibWVudScsIG9wdGlvbnMuaGFzU3VibWVudSxcbiAgICAgICAgICAgIGFzeW5jIChoYXJuZXNzLCBoYXNTdWJtZW51KSA9PiAoYXdhaXQgaGFybmVzcy5oYXNTdWJtZW51KCkpID09PSBoYXNTdWJtZW51KTtcbiAgfVxufVxuIl19