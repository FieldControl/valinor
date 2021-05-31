/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { MatOptionHarness } from './option-harness';
/** Harness for interacting with a `mat-optgroup` in tests. */
export class MatOptgroupHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._label = this.locatorFor('.mat-optgroup-label');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatOptgroupHarness` that meets
     * certain criteria.
     * @param options Options for filtering which option instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatOptgroupHarness, options)
            .addOption('labelText', options.labelText, (harness, title) => __awaiter(this, void 0, void 0, function* () { return HarnessPredicate.stringMatches(yield harness.getLabelText(), title); }));
    }
    /** Gets the option group's label text. */
    getLabelText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._label()).text();
        });
    }
    /** Gets whether the option group is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-optgroup-disabled');
        });
    }
    /**
     * Gets the options that are inside the group.
     * @param filter Optionally filters which options are included.
     */
    getOptions(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(MatOptionHarness.with(filter))();
        });
    }
}
/** Selector used to locate option group instances. */
MatOptgroupHarness.hostSelector = '.mat-optgroup';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0Z3JvdXAtaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jb3JlL3Rlc3Rpbmcvb3B0Z3JvdXAtaGFybmVzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFeEUsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFHbEQsOERBQThEO0FBQzlELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxnQkFBZ0I7SUFBeEQ7O1FBR1UsV0FBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQWdDMUQsQ0FBQztJQTlCQzs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBa0MsRUFBRTtRQUM5QyxPQUFPLElBQUksZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDO2FBQ25ELFNBQVMsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFDckMsQ0FBTyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsZ0RBQ3JCLE9BQUEsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE1BQU0sT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFBLEdBQUEsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFRCwwQ0FBMEM7SUFDcEMsWUFBWTs7WUFDaEIsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEMsQ0FBQztLQUFBO0lBRUQsaURBQWlEO0lBQzNDLFVBQVU7O1lBQ2QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDL0QsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ0csVUFBVSxDQUFDLFNBQStCLEVBQUU7O1lBQ2hELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzdELENBQUM7S0FBQTs7QUFqQ0Qsc0RBQXNEO0FBQy9DLCtCQUFZLEdBQUcsZUFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50SGFybmVzcywgSGFybmVzc1ByZWRpY2F0ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtPcHRncm91cEhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL29wdGdyb3VwLWhhcm5lc3MtZmlsdGVycyc7XG5pbXBvcnQge01hdE9wdGlvbkhhcm5lc3N9IGZyb20gJy4vb3B0aW9uLWhhcm5lc3MnO1xuaW1wb3J0IHtPcHRpb25IYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9vcHRpb24taGFybmVzcy1maWx0ZXJzJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBgbWF0LW9wdGdyb3VwYCBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRPcHRncm91cEhhcm5lc3MgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzIHtcbiAgLyoqIFNlbGVjdG9yIHVzZWQgdG8gbG9jYXRlIG9wdGlvbiBncm91cCBpbnN0YW5jZXMuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1vcHRncm91cCc7XG4gIHByaXZhdGUgX2xhYmVsID0gdGhpcy5sb2NhdG9yRm9yKCcubWF0LW9wdGdyb3VwLWxhYmVsJyk7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYE1hdE9wdGdyb3VwSGFybmVzc2AgdGhhdCBtZWV0c1xuICAgKiBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggb3B0aW9uIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IE9wdGdyb3VwSGFybmVzc0ZpbHRlcnMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRPcHRncm91cEhhcm5lc3MsIG9wdGlvbnMpXG4gICAgICAgIC5hZGRPcHRpb24oJ2xhYmVsVGV4dCcsIG9wdGlvbnMubGFiZWxUZXh0LFxuICAgICAgICAgICAgYXN5bmMgKGhhcm5lc3MsIHRpdGxlKSA9PlxuICAgICAgICAgICAgICAgIEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhhd2FpdCBoYXJuZXNzLmdldExhYmVsVGV4dCgpLCB0aXRsZSkpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG9wdGlvbiBncm91cCdzIGxhYmVsIHRleHQuICovXG4gIGFzeW5jIGdldExhYmVsVGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fbGFiZWwoKSkudGV4dCgpO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciB0aGUgb3B0aW9uIGdyb3VwIGlzIGRpc2FibGVkLiAqL1xuICBhc3luYyBpc0Rpc2FibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCdtYXQtb3B0Z3JvdXAtZGlzYWJsZWQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBvcHRpb25zIHRoYXQgYXJlIGluc2lkZSB0aGUgZ3JvdXAuXG4gICAqIEBwYXJhbSBmaWx0ZXIgT3B0aW9uYWxseSBmaWx0ZXJzIHdoaWNoIG9wdGlvbnMgYXJlIGluY2x1ZGVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0T3B0aW9ucyhmaWx0ZXI6IE9wdGlvbkhhcm5lc3NGaWx0ZXJzID0ge30pOiBQcm9taXNlPE1hdE9wdGlvbkhhcm5lc3NbXT4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGb3JBbGwoTWF0T3B0aW9uSGFybmVzcy53aXRoKGZpbHRlcikpKCk7XG4gIH1cbn1cblxuIl19