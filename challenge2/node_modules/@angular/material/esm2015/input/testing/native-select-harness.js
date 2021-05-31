/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { HarnessPredicate, parallel } from '@angular/cdk/testing';
import { MatFormFieldControlHarness } from '@angular/material/form-field/testing/control';
import { MatNativeOptionHarness } from './native-option-harness';
/** Harness for interacting with a native `select` in tests. */
export class MatNativeSelectHarness extends MatFormFieldControlHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatNativeSelectHarness` that meets
     * certain criteria.
     * @param options Options for filtering which select instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatNativeSelectHarness, options);
    }
    /** Gets a boolean promise indicating if the select is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getProperty('disabled');
        });
    }
    /** Gets a boolean promise indicating if the select is required. */
    isRequired() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getProperty('required');
        });
    }
    /** Gets a boolean promise indicating if the select is in multi-selection mode. */
    isMultiple() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getProperty('multiple');
        });
    }
    /** Gets the name of the select. */
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            // The "name" property of the native select is never undefined.
            return (yield (yield this.host()).getProperty('name'));
        });
    }
    /** Gets the id of the select. */
    getId() {
        return __awaiter(this, void 0, void 0, function* () {
            // We're guaranteed to have an id, because the `matNativeControl` always assigns one.
            return (yield (yield this.host()).getProperty('id'));
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
    getOptions(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForAll(MatNativeOptionHarness.with(filter))();
        });
    }
    /**
     * Selects the options that match the passed-in filter. If the select is in multi-selection
     * mode all options will be clicked, otherwise the harness will pick the first matching option.
     */
    selectOptions(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const [isMultiple, options] = yield parallel(() => {
                return [this.isMultiple(), this.getOptions(filter)];
            });
            if (options.length === 0) {
                throw Error('Select does not have options matching the specified filter');
            }
            const [host, optionIndexes] = yield parallel(() => [
                this.host(),
                parallel(() => options.slice(0, isMultiple ? undefined : 1).map(option => option.getIndex()))
            ]);
            yield host.selectOptions(...optionIndexes);
        });
    }
}
MatNativeSelectHarness.hostSelector = 'select[matNativeControl]';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlLXNlbGVjdC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2lucHV0L3Rlc3RpbmcvbmF0aXZlLXNlbGVjdC1oYXJuZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsUUFBUSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDaEUsT0FBTyxFQUFDLDBCQUEwQixFQUFDLE1BQU0sOENBQThDLENBQUM7QUFDeEYsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFPL0QsK0RBQStEO0FBQy9ELE1BQU0sT0FBTyxzQkFBdUIsU0FBUSwwQkFBMEI7SUFHcEU7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQXNDLEVBQUU7UUFDbEQsT0FBTyxJQUFJLGdCQUFnQixDQUFDLHNCQUFzQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxtRUFBbUU7SUFDN0QsVUFBVTs7WUFDZCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckQsQ0FBQztLQUFBO0lBRUQsbUVBQW1FO0lBQzdELFVBQVU7O1lBQ2QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELENBQUM7S0FBQTtJQUVELGtGQUFrRjtJQUM1RSxVQUFVOztZQUNkLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRCxDQUFDO0tBQUE7SUFFRCxtQ0FBbUM7SUFDN0IsT0FBTzs7WUFDWCwrREFBK0Q7WUFDL0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBRSxDQUFDO1FBQzFELENBQUM7S0FBQTtJQUVELGlDQUFpQztJQUMzQixLQUFLOztZQUNULHFGQUFxRjtZQUNyRixPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFFLENBQUM7UUFDeEQsQ0FBQztLQUFBO0lBRUQsZ0dBQWdHO0lBQzFGLEtBQUs7O1lBQ1QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckMsQ0FBQztLQUFBO0lBRUQsOEZBQThGO0lBQ3hGLElBQUk7O1lBQ1IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEMsQ0FBQztLQUFBO0lBRUQscUNBQXFDO0lBQy9CLFNBQVM7O1lBQ2IsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDekMsQ0FBQztLQUFBO0lBRUQsZ0RBQWdEO0lBQzFDLFVBQVUsQ0FBQyxTQUFxQyxFQUFFOztZQUV0RCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNuRSxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDRyxhQUFhLENBQUMsU0FBcUMsRUFBRTs7WUFDekQsTUFBTSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3RELENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDeEIsTUFBTSxLQUFLLENBQUMsNERBQTRELENBQUMsQ0FBQzthQUMzRTtZQUVELE1BQU0sQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLEdBQUcsTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1gsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzthQUM5RixDQUFDLENBQUM7WUFFSCxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxhQUFhLENBQUMsQ0FBQztRQUM3QyxDQUFDO0tBQUE7O0FBL0VNLG1DQUFZLEdBQUcsMEJBQTBCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIYXJuZXNzUHJlZGljYXRlLCBwYXJhbGxlbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtNYXRGb3JtRmllbGRDb250cm9sSGFybmVzc30gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZm9ybS1maWVsZC90ZXN0aW5nL2NvbnRyb2wnO1xuaW1wb3J0IHtNYXROYXRpdmVPcHRpb25IYXJuZXNzfSBmcm9tICcuL25hdGl2ZS1vcHRpb24taGFybmVzcyc7XG5pbXBvcnQge1xuICBOYXRpdmVPcHRpb25IYXJuZXNzRmlsdGVycyxcbiAgTmF0aXZlU2VsZWN0SGFybmVzc0ZpbHRlcnMsXG59IGZyb20gJy4vbmF0aXZlLXNlbGVjdC1oYXJuZXNzLWZpbHRlcnMnO1xuXG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgbmF0aXZlIGBzZWxlY3RgIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdE5hdGl2ZVNlbGVjdEhhcm5lc3MgZXh0ZW5kcyBNYXRGb3JtRmllbGRDb250cm9sSGFybmVzcyB7XG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnc2VsZWN0W21hdE5hdGl2ZUNvbnRyb2xdJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0TmF0aXZlU2VsZWN0SGFybmVzc2AgdGhhdCBtZWV0c1xuICAgKiBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggc2VsZWN0IGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IE5hdGl2ZVNlbGVjdEhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdE5hdGl2ZVNlbGVjdEhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0TmF0aXZlU2VsZWN0SGFybmVzcywgb3B0aW9ucyk7XG4gIH1cblxuICAvKiogR2V0cyBhIGJvb2xlYW4gcHJvbWlzZSBpbmRpY2F0aW5nIGlmIHRoZSBzZWxlY3QgaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHkoJ2Rpc2FibGVkJyk7XG4gIH1cblxuICAvKiogR2V0cyBhIGJvb2xlYW4gcHJvbWlzZSBpbmRpY2F0aW5nIGlmIHRoZSBzZWxlY3QgaXMgcmVxdWlyZWQuICovXG4gIGFzeW5jIGlzUmVxdWlyZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHkoJ3JlcXVpcmVkJyk7XG4gIH1cblxuICAvKiogR2V0cyBhIGJvb2xlYW4gcHJvbWlzZSBpbmRpY2F0aW5nIGlmIHRoZSBzZWxlY3QgaXMgaW4gbXVsdGktc2VsZWN0aW9uIG1vZGUuICovXG4gIGFzeW5jIGlzTXVsdGlwbGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHkoJ211bHRpcGxlJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbmFtZSBvZiB0aGUgc2VsZWN0LiAqL1xuICBhc3luYyBnZXROYW1lKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgLy8gVGhlIFwibmFtZVwiIHByb3BlcnR5IG9mIHRoZSBuYXRpdmUgc2VsZWN0IGlzIG5ldmVyIHVuZGVmaW5lZC5cbiAgICByZXR1cm4gKGF3YWl0IChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHkoJ25hbWUnKSkhO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGlkIG9mIHRoZSBzZWxlY3QuICovXG4gIGFzeW5jIGdldElkKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgLy8gV2UncmUgZ3VhcmFudGVlZCB0byBoYXZlIGFuIGlkLCBiZWNhdXNlIHRoZSBgbWF0TmF0aXZlQ29udHJvbGAgYWx3YXlzIGFzc2lnbnMgb25lLlxuICAgIHJldHVybiAoYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRQcm9wZXJ0eSgnaWQnKSkhO1xuICB9XG5cbiAgLyoqIEZvY3VzZXMgdGhlIHNlbGVjdCBhbmQgcmV0dXJucyBhIHZvaWQgcHJvbWlzZSB0aGF0IGluZGljYXRlcyB3aGVuIHRoZSBhY3Rpb24gaXMgY29tcGxldGUuICovXG4gIGFzeW5jIGZvY3VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmZvY3VzKCk7XG4gIH1cblxuICAvKiogQmx1cnMgdGhlIHNlbGVjdCBhbmQgcmV0dXJucyBhIHZvaWQgcHJvbWlzZSB0aGF0IGluZGljYXRlcyB3aGVuIHRoZSBhY3Rpb24gaXMgY29tcGxldGUuICovXG4gIGFzeW5jIGJsdXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuYmx1cigpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHNlbGVjdCBpcyBmb2N1c2VkLiAqL1xuICBhc3luYyBpc0ZvY3VzZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaXNGb2N1c2VkKCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgb3B0aW9ucyBpbnNpZGUgdGhlIHNlbGVjdCBwYW5lbC4gKi9cbiAgYXN5bmMgZ2V0T3B0aW9ucyhmaWx0ZXI6IE5hdGl2ZU9wdGlvbkhhcm5lc3NGaWx0ZXJzID0ge30pOlxuICAgIFByb21pc2U8TWF0TmF0aXZlT3B0aW9uSGFybmVzc1tdPiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZvckFsbChNYXROYXRpdmVPcHRpb25IYXJuZXNzLndpdGgoZmlsdGVyKSkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3RzIHRoZSBvcHRpb25zIHRoYXQgbWF0Y2ggdGhlIHBhc3NlZC1pbiBmaWx0ZXIuIElmIHRoZSBzZWxlY3QgaXMgaW4gbXVsdGktc2VsZWN0aW9uXG4gICAqIG1vZGUgYWxsIG9wdGlvbnMgd2lsbCBiZSBjbGlja2VkLCBvdGhlcndpc2UgdGhlIGhhcm5lc3Mgd2lsbCBwaWNrIHRoZSBmaXJzdCBtYXRjaGluZyBvcHRpb24uXG4gICAqL1xuICBhc3luYyBzZWxlY3RPcHRpb25zKGZpbHRlcjogTmF0aXZlT3B0aW9uSGFybmVzc0ZpbHRlcnMgPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IFtpc011bHRpcGxlLCBvcHRpb25zXSA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IHtcbiAgICAgIHJldHVybiBbdGhpcy5pc011bHRpcGxlKCksIHRoaXMuZ2V0T3B0aW9ucyhmaWx0ZXIpXTtcbiAgICB9KTtcblxuICAgIGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1NlbGVjdCBkb2VzIG5vdCBoYXZlIG9wdGlvbnMgbWF0Y2hpbmcgdGhlIHNwZWNpZmllZCBmaWx0ZXInKTtcbiAgICB9XG5cbiAgICBjb25zdCBbaG9zdCwgb3B0aW9uSW5kZXhlc10gPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiBbXG4gICAgICB0aGlzLmhvc3QoKSxcbiAgICAgIHBhcmFsbGVsKCgpID0+IG9wdGlvbnMuc2xpY2UoMCwgaXNNdWx0aXBsZSA/IHVuZGVmaW5lZCA6IDEpLm1hcChvcHRpb24gPT4gb3B0aW9uLmdldEluZGV4KCkpKVxuICAgIF0pO1xuXG4gICAgYXdhaXQgaG9zdC5zZWxlY3RPcHRpb25zKC4uLm9wdGlvbkluZGV4ZXMpO1xuICB9XG59XG4iXX0=