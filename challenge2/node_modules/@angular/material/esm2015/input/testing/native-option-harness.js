/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
/** Harness for interacting with a native `option` in tests. */
export class MatNativeOptionHarness extends ComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatNativeOptionHarness` that meets
     * certain criteria.
     * @param options Options for filtering which option instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatNativeOptionHarness, options)
            .addOption('text', options.text, (harness, title) => __awaiter(this, void 0, void 0, function* () { return HarnessPredicate.stringMatches(yield harness.getText(), title); }))
            .addOption('index', options.index, (harness, index) => __awaiter(this, void 0, void 0, function* () { return (yield harness.getIndex()) === index; }))
            .addOption('isSelected', options.isSelected, (harness, isSelected) => __awaiter(this, void 0, void 0, function* () { return (yield harness.isSelected()) === isSelected; }));
    }
    /** Gets the option's label text. */
    getText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getProperty('label');
        });
    }
    /** Index of the option within the native `select` element. */
    getIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getProperty('index');
        });
    }
    /** Gets whether the option is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getProperty('disabled');
        });
    }
    /** Gets whether the option is selected. */
    isSelected() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getProperty('selected');
        });
    }
}
/** Selector used to locate option instances. */
MatNativeOptionHarness.hostSelector = 'select[matNativeControl] option';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlLW9wdGlvbi1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2lucHV0L3Rlc3RpbmcvbmF0aXZlLW9wdGlvbi1oYXJuZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUd4RSwrREFBK0Q7QUFDL0QsTUFBTSxPQUFPLHNCQUF1QixTQUFRLGdCQUFnQjtJQUkxRDs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBc0MsRUFBRTtRQUNsRCxPQUFPLElBQUksZ0JBQWdCLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxDQUFDO2FBQ3ZELFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksRUFDM0IsQ0FBTyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsZ0RBQ3JCLE9BQUEsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE1BQU0sT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFBLEdBQUEsQ0FBQzthQUN0RSxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQzdCLENBQU8sT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLGdEQUFDLE9BQUEsQ0FBQSxNQUFNLE9BQU8sQ0FBQyxRQUFRLEVBQUUsTUFBSyxLQUFLLENBQUEsR0FBQSxDQUFDO2FBQ2hFLFNBQVMsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFDdkMsQ0FBTyxPQUFPLEVBQUUsVUFBVSxFQUFFLEVBQUUsZ0RBQUMsT0FBQSxDQUFBLE1BQU0sT0FBTyxDQUFDLFVBQVUsRUFBRSxNQUFLLFVBQVUsQ0FBQSxHQUFBLENBQUMsQ0FBQztJQUVwRixDQUFDO0lBRUQsb0NBQW9DO0lBQzlCLE9BQU87O1lBQ1gsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELENBQUM7S0FBQTtJQUVELDhEQUE4RDtJQUN4RCxRQUFROztZQUNaLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxDQUFDO0tBQUE7SUFFRCwyQ0FBMkM7SUFDckMsVUFBVTs7WUFDZCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckQsQ0FBQztLQUFBO0lBRUQsMkNBQTJDO0lBQ3JDLFVBQVU7O1lBQ2QsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELENBQUM7S0FBQTs7QUF2Q0QsZ0RBQWdEO0FBQ3pDLG1DQUFZLEdBQUcsaUNBQWlDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21wb25lbnRIYXJuZXNzLCBIYXJuZXNzUHJlZGljYXRlfSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge05hdGl2ZU9wdGlvbkhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL25hdGl2ZS1zZWxlY3QtaGFybmVzcy1maWx0ZXJzJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBuYXRpdmUgYG9wdGlvbmAgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0TmF0aXZlT3B0aW9uSGFybmVzcyBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICAvKiogU2VsZWN0b3IgdXNlZCB0byBsb2NhdGUgb3B0aW9uIGluc3RhbmNlcy4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICdzZWxlY3RbbWF0TmF0aXZlQ29udHJvbF0gb3B0aW9uJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0TmF0aXZlT3B0aW9uSGFybmVzc2AgdGhhdCBtZWV0c1xuICAgKiBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggb3B0aW9uIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IE5hdGl2ZU9wdGlvbkhhcm5lc3NGaWx0ZXJzID0ge30pIHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0TmF0aXZlT3B0aW9uSGFybmVzcywgb3B0aW9ucylcbiAgICAgICAgLmFkZE9wdGlvbigndGV4dCcsIG9wdGlvbnMudGV4dCxcbiAgICAgICAgICAgIGFzeW5jIChoYXJuZXNzLCB0aXRsZSkgPT5cbiAgICAgICAgICAgICAgICBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoYXdhaXQgaGFybmVzcy5nZXRUZXh0KCksIHRpdGxlKSlcbiAgICAgICAgLmFkZE9wdGlvbignaW5kZXgnLCBvcHRpb25zLmluZGV4LFxuICAgICAgICAgICAgYXN5bmMgKGhhcm5lc3MsIGluZGV4KSA9PiBhd2FpdCBoYXJuZXNzLmdldEluZGV4KCkgPT09IGluZGV4KVxuICAgICAgICAuYWRkT3B0aW9uKCdpc1NlbGVjdGVkJywgb3B0aW9ucy5pc1NlbGVjdGVkLFxuICAgICAgICAgICAgYXN5bmMgKGhhcm5lc3MsIGlzU2VsZWN0ZWQpID0+IGF3YWl0IGhhcm5lc3MuaXNTZWxlY3RlZCgpID09PSBpc1NlbGVjdGVkKTtcblxuICB9XG5cbiAgLyoqIEdldHMgdGhlIG9wdGlvbidzIGxhYmVsIHRleHQuICovXG4gIGFzeW5jIGdldFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRQcm9wZXJ0eSgnbGFiZWwnKTtcbiAgfVxuXG4gIC8qKiBJbmRleCBvZiB0aGUgb3B0aW9uIHdpdGhpbiB0aGUgbmF0aXZlIGBzZWxlY3RgIGVsZW1lbnQuICovXG4gIGFzeW5jIGdldEluZGV4KCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHkoJ2luZGV4Jyk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBvcHRpb24gaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHkoJ2Rpc2FibGVkJyk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBvcHRpb24gaXMgc2VsZWN0ZWQuICovXG4gIGFzeW5jIGlzU2VsZWN0ZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0UHJvcGVydHkoJ3NlbGVjdGVkJyk7XG4gIH1cbn1cbiJdfQ==