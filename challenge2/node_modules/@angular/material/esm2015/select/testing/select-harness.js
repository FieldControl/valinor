/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { HarnessPredicate, parallel, } from '@angular/cdk/testing';
import { MatFormFieldControlHarness } from '@angular/material/form-field/testing/control';
import { MatOptionHarness, MatOptgroupHarness, } from '@angular/material/core/testing';
export class _MatSelectHarnessBase extends MatFormFieldControlHarness {
    constructor() {
        super(...arguments);
        this._documentRootLocator = this.documentRootLocatorFactory();
        this._backdrop = this._documentRootLocator.locatorFor('.cdk-overlay-backdrop');
    }
    /** Gets a boolean promise indicating if the select is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass(`${this._prefix}-select-disabled`);
        });
    }
    /** Gets a boolean promise indicating if the select is valid. */
    isValid() {
        return __awaiter(this, void 0, void 0, function* () {
            return !(yield (yield this.host()).hasClass('ng-invalid'));
        });
    }
    /** Gets a boolean promise indicating if the select is required. */
    isRequired() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass(`${this._prefix}-select-required`);
        });
    }
    /** Gets a boolean promise indicating if the select is empty (no value is selected). */
    isEmpty() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass(`${this._prefix}-select-empty`);
        });
    }
    /** Gets a boolean promise indicating if the select is in multi-selection mode. */
    isMultiple() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass(`${this._prefix}-select-multiple`);
        });
    }
    /** Gets a promise for the select's value text. */
    getValueText() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.locatorFor(`.${this._prefix}-select-value`)();
            return value.text();
        });
    }
    /** Focuses the select and returns a void promise that indicates when the action is complete. */
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).focus();
        });
    }
    /** Blurs the select and returns a void promise that indicates when the action is complete. */
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).blur();
        });
    }
    /** Whether the select is focused. */
    isFocused() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).isFocused();
        });
    }
    /** Gets the options inside the select panel. */
    getOptions(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._documentRootLocator.locatorForAll(this._optionClass.with(Object.assign(Object.assign({}, (filter || {})), { ancestor: yield this._getPanelSelector() })))();
        });
    }
    /** Gets the groups of options inside the panel. */
    getOptionGroups(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._documentRootLocator.locatorForAll(this._optionGroupClass.with(Object.assign(Object.assign({}, (filter || {})), { ancestor: yield this._getPanelSelector() })))();
        });
    }
    /** Gets whether the select is open. */
    isOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!(yield this._documentRootLocator.locatorForOptional(yield this._getPanelSelector())());
        });
    }
    /** Opens the select's panel. */
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isOpen())) {
                const trigger = yield this.locatorFor(`.${this._prefix}-select-trigger`)();
                return trigger.click();
            }
        });
    }
    /**
     * Clicks the options that match the passed-in filter. If the select is in multi-selection
     * mode all options will be clicked, otherwise the harness will pick the first matching option.
     */
    clickOptions(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.open();
            const [isMultiple, options] = yield parallel(() => [this.isMultiple(), this.getOptions(filter)]);
            if (options.length === 0) {
                throw Error('Select does not have options matching the specified filter');
            }
            if (isMultiple) {
                yield parallel(() => options.map(option => option.click()));
            }
            else {
                yield options[0].click();
            }
        });
    }
    /** Closes the select's panel. */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isOpen()) {
                // This is the most consistent way that works both in both single and multi-select modes,
                // but it assumes that only one overlay is open at a time. We should be able to make it
                // a bit more precise after #16645 where we can dispatch an ESCAPE press to the host instead.
                return (yield this._backdrop()).click();
            }
        });
    }
    /** Gets the selector that should be used to find this select's panel. */
    _getPanelSelector() {
        return __awaiter(this, void 0, void 0, function* () {
            const id = yield (yield this.host()).getAttribute('id');
            return `#${id}-panel`;
        });
    }
}
/** Harness for interacting with a standard mat-select in tests. */
export class MatSelectHarness extends _MatSelectHarnessBase {
    constructor() {
        super(...arguments);
        this._prefix = 'mat';
        this._optionClass = MatOptionHarness;
        this._optionGroupClass = MatOptgroupHarness;
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatSelectHarness` that meets
     * certain criteria.
     * @param options Options for filtering which select instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatSelectHarness, options);
    }
}
MatSelectHarness.hostSelector = '.mat-select';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2VsZWN0L3Rlc3Rpbmcvc2VsZWN0LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFDTCxnQkFBZ0IsRUFDaEIsUUFBUSxHQUlULE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sOENBQThDLENBQUM7QUFDeEYsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixrQkFBa0IsR0FHbkIsTUFBTSxnQ0FBZ0MsQ0FBQztBQUd4QyxNQUFNLE9BQWdCLHFCQVNwQixTQUFRLDBCQUEwQjtJQVRwQzs7UUFhVSx5QkFBb0IsR0FBRyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUN6RCxjQUFTLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBaUhwRixDQUFDO0lBL0dDLG1FQUFtRTtJQUM3RCxVQUFVOztZQUNkLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLGtCQUFrQixDQUFDLENBQUM7UUFDekUsQ0FBQztLQUFBO0lBRUQsZ0VBQWdFO0lBQzFELE9BQU87O1lBQ1gsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDN0QsQ0FBQztLQUFBO0lBRUQsbUVBQW1FO0lBQzdELFVBQVU7O1lBQ2QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sa0JBQWtCLENBQUMsQ0FBQztRQUN6RSxD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QixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pELENBQUM7O0FBYk0sNkJBQVksR0FBRyxhQUFhLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgSGFybmVzc1ByZWRpY2F0ZSxcbiAgcGFyYWxsZWwsXG4gIENvbXBvbmVudEhhcm5lc3MsXG4gIEJhc2VIYXJuZXNzRmlsdGVycyxcbiAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yLFxufSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge01hdEZvcm1GaWVsZENvbnRyb2xIYXJuZXNzfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9mb3JtLWZpZWxkL3Rlc3RpbmcvY29udHJvbCc7XG5pbXBvcnQge1xuICBNYXRPcHRpb25IYXJuZXNzLFxuICBNYXRPcHRncm91cEhhcm5lc3MsXG4gIE9wdGlvbkhhcm5lc3NGaWx0ZXJzLFxuICBPcHRncm91cEhhcm5lc3NGaWx0ZXJzLFxufSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlL3Rlc3RpbmcnO1xuaW1wb3J0IHtTZWxlY3RIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9zZWxlY3QtaGFybmVzcy1maWx0ZXJzJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIF9NYXRTZWxlY3RIYXJuZXNzQmFzZTxcbiAgICBPcHRpb25UeXBlIGV4dGVuZHMgKENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxPcHRpb24+ICYge1xuICAgICAgd2l0aDogKG9wdGlvbnM/OiBPcHRpb25GaWx0ZXJzKSA9PiBIYXJuZXNzUHJlZGljYXRlPE9wdGlvbj59KSxcbiAgICBPcHRpb24gZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzICYge2NsaWNrKCk6IFByb21pc2U8dm9pZD59LFxuICAgIE9wdGlvbkZpbHRlcnMgZXh0ZW5kcyBCYXNlSGFybmVzc0ZpbHRlcnMsXG4gICAgT3B0aW9uR3JvdXBUeXBlIGV4dGVuZHMgKENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxPcHRpb25Hcm91cD4gJiB7XG4gICAgICB3aXRoOiAob3B0aW9ucz86IE9wdGlvbkdyb3VwRmlsdGVycykgPT4gSGFybmVzc1ByZWRpY2F0ZTxPcHRpb25Hcm91cD59KSxcbiAgICBPcHRpb25Hcm91cCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3MsXG4gICAgT3B0aW9uR3JvdXBGaWx0ZXJzIGV4dGVuZHMgQmFzZUhhcm5lc3NGaWx0ZXJzXG4+IGV4dGVuZHMgTWF0Rm9ybUZpZWxkQ29udHJvbEhhcm5lc3Mge1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX3ByZWZpeDogc3RyaW5nO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX29wdGlvbkNsYXNzOiBPcHRpb25UeXBlO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgX29wdGlvbkdyb3VwQ2xhc3M6IE9wdGlvbkdyb3VwVHlwZTtcbiAgcHJpdmF0ZSBfZG9jdW1lbnRSb290TG9jYXRvciA9IHRoaXMuZG9jdW1lbnRSb290TG9jYXRvckZhY3RvcnkoKTtcbiAgcHJpdmF0ZSBfYmFja2Ryb3AgPSB0aGlzLl9kb2N1bWVudFJvb3RMb2NhdG9yLmxvY2F0b3JGb3IoJy5jZGstb3ZlcmxheS1iYWNrZHJvcCcpO1xuXG4gIC8qKiBHZXRzIGEgYm9vbGVhbiBwcm9taXNlIGluZGljYXRpbmcgaWYgdGhlIHNlbGVjdCBpcyBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgaXNEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcyhgJHt0aGlzLl9wcmVmaXh9LXNlbGVjdC1kaXNhYmxlZGApO1xuICB9XG5cbiAgLyoqIEdldHMgYSBib29sZWFuIHByb21pc2UgaW5kaWNhdGluZyBpZiB0aGUgc2VsZWN0IGlzIHZhbGlkLiAqL1xuICBhc3luYyBpc1ZhbGlkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAhKGF3YWl0IChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ25nLWludmFsaWQnKSk7XG4gIH1cblxuICAvKiogR2V0cyBhIGJvb2xlYW4gcHJvbWlzZSBpbmRpY2F0aW5nIGlmIHRoZSBzZWxlY3QgaXMgcmVxdWlyZWQuICovXG4gIGFzeW5jIGlzUmVxdWlyZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoYCR7dGhpcy5fcHJlZml4fS1zZWxlY3QtcmVxdWlyZWRgKTtcbiAgfVxuXG4gIC8qKiBHZXRzIGEgYm9vbGVhbiBwcm9taXNlIGluZGljYXRpbmcgaWYgdGhlIHNlbGVjdCBpcyBlbXB0eSAobm8gdmFsdWUgaXMgc2VsZWN0ZWQpLiAqL1xuICBhc3luYyBpc0VtcHR5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKGAke3RoaXMuX3ByZWZpeH0tc2VsZWN0LWVtcHR5YCk7XG4gIH1cblxuICAvKiogR2V0cyBhIGJvb2xlYW4gcHJvbWlzZSBpbmRpY2F0aW5nIGlmIHRoZSBzZWxlY3QgaXMgaW4gbXVsdGktc2VsZWN0aW9uIG1vZGUuICovXG4gIGFzeW5jIGlzTXVsdGlwbGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoYCR7dGhpcy5fcHJlZml4fS1zZWxlY3QtbXVsdGlwbGVgKTtcbiAgfVxuXG4gIC8qKiBHZXRzIGEgcHJvbWlzZSBmb3IgdGhlIHNlbGVjdCdzIHZhbHVlIHRleHQuICovXG4gIGFzeW5jIGdldFZhbHVlVGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgdGhpcy5sb2NhdG9yRm9yKGAuJHt0aGlzLl9wcmVmaXh9LXNlbGVjdC12YWx1ZWApKCk7XG4gICAgcmV0dXJuIHZhbHVlLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBzZWxlY3QgYW5kIHJldHVybnMgYSB2b2lkIHByb21pc2UgdGhhdCBpbmRpY2F0ZXMgd2hlbiB0aGUgYWN0aW9uIGlzIGNvbXBsZXRlLiAqL1xuICBhc3luYyBmb2N1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5mb2N1cygpO1xuICB9XG5cbiAgLyoqIEJsdXJzIHRoZSBzZWxlY3QgYW5kIHJldHVybnMgYSB2b2lkIHByb21pc2UgdGhhdCBpbmRpY2F0ZXMgd2hlbiB0aGUgYWN0aW9uIGlzIGNvbXBsZXRlLiAqL1xuICBhc3luYyBibHVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmJsdXIoKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBzZWxlY3QgaXMgZm9jdXNlZC4gKi9cbiAgYXN5bmMgaXNGb2N1c2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmlzRm9jdXNlZCgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG9wdGlvbnMgaW5zaWRlIHRoZSBzZWxlY3QgcGFuZWwuICovXG4gIGFzeW5jIGdldE9wdGlvbnMoZmlsdGVyPzogT21pdDxPcHRpb25GaWx0ZXJzLCAnYW5jZXN0b3InPik6IFByb21pc2U8T3B0aW9uW10+IHtcbiAgICByZXR1cm4gdGhpcy5fZG9jdW1lbnRSb290TG9jYXRvci5sb2NhdG9yRm9yQWxsKHRoaXMuX29wdGlvbkNsYXNzLndpdGgoe1xuICAgICAgLi4uKGZpbHRlciB8fCB7fSksXG4gICAgICBhbmNlc3RvcjogYXdhaXQgdGhpcy5fZ2V0UGFuZWxTZWxlY3RvcigpXG4gICAgfSBhcyBPcHRpb25GaWx0ZXJzKSkoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBncm91cHMgb2Ygb3B0aW9ucyBpbnNpZGUgdGhlIHBhbmVsLiAqL1xuICBhc3luYyBnZXRPcHRpb25Hcm91cHMoZmlsdGVyPzogT21pdDxPcHRpb25Hcm91cEZpbHRlcnMsICdhbmNlc3Rvcic+KTogUHJvbWlzZTxPcHRpb25Hcm91cFtdPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RvY3VtZW50Um9vdExvY2F0b3IubG9jYXRvckZvckFsbCh0aGlzLl9vcHRpb25Hcm91cENsYXNzLndpdGgoe1xuICAgICAgLi4uKGZpbHRlciB8fCB7fSksXG4gICAgICBhbmNlc3RvcjogYXdhaXQgdGhpcy5fZ2V0UGFuZWxTZWxlY3RvcigpXG4gICAgfSBhcyBPcHRpb25Hcm91cEZpbHRlcnMpKSgpIGFzIFByb21pc2U8T3B0aW9uR3JvdXBbXT47XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBzZWxlY3QgaXMgb3Blbi4gKi9cbiAgYXN5bmMgaXNPcGVuKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAhIWF3YWl0IHRoaXMuX2RvY3VtZW50Um9vdExvY2F0b3IubG9jYXRvckZvck9wdGlvbmFsKGF3YWl0IHRoaXMuX2dldFBhbmVsU2VsZWN0b3IoKSkoKTtcbiAgfVxuXG4gIC8qKiBPcGVucyB0aGUgc2VsZWN0J3MgcGFuZWwuICovXG4gIGFzeW5jIG9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFhd2FpdCB0aGlzLmlzT3BlbigpKSB7XG4gICAgICBjb25zdCB0cmlnZ2VyID0gYXdhaXQgdGhpcy5sb2NhdG9yRm9yKGAuJHt0aGlzLl9wcmVmaXh9LXNlbGVjdC10cmlnZ2VyYCkoKTtcbiAgICAgIHJldHVybiB0cmlnZ2VyLmNsaWNrKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsaWNrcyB0aGUgb3B0aW9ucyB0aGF0IG1hdGNoIHRoZSBwYXNzZWQtaW4gZmlsdGVyLiBJZiB0aGUgc2VsZWN0IGlzIGluIG11bHRpLXNlbGVjdGlvblxuICAgKiBtb2RlIGFsbCBvcHRpb25zIHdpbGwgYmUgY2xpY2tlZCwgb3RoZXJ3aXNlIHRoZSBoYXJuZXNzIHdpbGwgcGljayB0aGUgZmlyc3QgbWF0Y2hpbmcgb3B0aW9uLlxuICAgKi9cbiAgYXN5bmMgY2xpY2tPcHRpb25zKGZpbHRlcj86IE9wdGlvbkZpbHRlcnMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLm9wZW4oKTtcblxuICAgIGNvbnN0IFtpc011bHRpcGxlLCBvcHRpb25zXSA9XG4gICAgICBhd2FpdCBwYXJhbGxlbCgoKSA9PiBbdGhpcy5pc011bHRpcGxlKCksIHRoaXMuZ2V0T3B0aW9ucyhmaWx0ZXIpXSk7XG5cbiAgICBpZiAob3B0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IEVycm9yKCdTZWxlY3QgZG9lcyBub3QgaGF2ZSBvcHRpb25zIG1hdGNoaW5nIHRoZSBzcGVjaWZpZWQgZmlsdGVyJyk7XG4gICAgfVxuXG4gICAgaWYgKGlzTXVsdGlwbGUpIHtcbiAgICAgIGF3YWl0IHBhcmFsbGVsKCgpID0+IG9wdGlvbnMubWFwKG9wdGlvbiA9PiBvcHRpb24uY2xpY2soKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCBvcHRpb25zWzBdLmNsaWNrKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENsb3NlcyB0aGUgc2VsZWN0J3MgcGFuZWwuICovXG4gIGFzeW5jIGNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChhd2FpdCB0aGlzLmlzT3BlbigpKSB7XG4gICAgICAvLyBUaGlzIGlzIHRoZSBtb3N0IGNvbnNpc3RlbnQgd2F5IHRoYXQgd29ya3MgYm90aCBpbiBib3RoIHNpbmdsZSBhbmQgbXVsdGktc2VsZWN0IG1vZGVzLFxuICAgICAgLy8gYnV0IGl0IGFzc3VtZXMgdGhhdCBvbmx5IG9uZSBvdmVybGF5IGlzIG9wZW4gYXQgYSB0aW1lLiBXZSBzaG91bGQgYmUgYWJsZSB0byBtYWtlIGl0XG4gICAgICAvLyBhIGJpdCBtb3JlIHByZWNpc2UgYWZ0ZXIgIzE2NjQ1IHdoZXJlIHdlIGNhbiBkaXNwYXRjaCBhbiBFU0NBUEUgcHJlc3MgdG8gdGhlIGhvc3QgaW5zdGVhZC5cbiAgICAgIHJldHVybiAoYXdhaXQgdGhpcy5fYmFja2Ryb3AoKSkuY2xpY2soKTtcbiAgICB9XG4gIH1cblxuICAvKiogR2V0cyB0aGUgc2VsZWN0b3IgdGhhdCBzaG91bGQgYmUgdXNlZCB0byBmaW5kIHRoaXMgc2VsZWN0J3MgcGFuZWwuICovXG4gIHByaXZhdGUgYXN5bmMgX2dldFBhbmVsU2VsZWN0b3IoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBpZCA9IGF3YWl0IChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0QXR0cmlidXRlKCdpZCcpO1xuICAgIHJldHVybiBgIyR7aWR9LXBhbmVsYDtcbiAgfVxufVxuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIG1hdC1zZWxlY3QgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0U2VsZWN0SGFybmVzcyBleHRlbmRzICBfTWF0U2VsZWN0SGFybmVzc0Jhc2U8XG4gIHR5cGVvZiBNYXRPcHRpb25IYXJuZXNzLCBNYXRPcHRpb25IYXJuZXNzLCBPcHRpb25IYXJuZXNzRmlsdGVycyxcbiAgdHlwZW9mIE1hdE9wdGdyb3VwSGFybmVzcywgTWF0T3B0Z3JvdXBIYXJuZXNzLCBPcHRncm91cEhhcm5lc3NGaWx0ZXJzXG4+IHtcbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LXNlbGVjdCc7XG4gIHByb3RlY3RlZCBfcHJlZml4ID0gJ21hdCc7XG4gIHByb3RlY3RlZCBfb3B0aW9uQ2xhc3MgPSBNYXRPcHRpb25IYXJuZXNzO1xuICBwcm90ZWN0ZWQgX29wdGlvbkdyb3VwQ2xhc3MgPSBNYXRPcHRncm91cEhhcm5lc3M7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYE1hdFNlbGVjdEhhcm5lc3NgIHRoYXQgbWVldHNcbiAgICogY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIHNlbGVjdCBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBTZWxlY3RIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRTZWxlY3RIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdFNlbGVjdEhhcm5lc3MsIG9wdGlvbnMpO1xuICB9XG59XG4iXX0=