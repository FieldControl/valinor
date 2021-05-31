/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
/** Base class for stepper button harnesses. */
class StepperButtonHarness extends ComponentHarness {
    /** Gets the text of the button. */
    getText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).text();
        });
    }
    /** Clicks the button. */
    click() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).click();
        });
    }
}
/** Harness for interacting with a standard Angular Material stepper next button in tests. */
export class MatStepperNextHarness extends StepperButtonHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatStepperNextHarness` that meets
     * certain criteria.
     * @param options Options for filtering which steps are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatStepperNextHarness, options)
            .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
    }
}
/** The selector for the host element of a `MatStep` instance. */
MatStepperNextHarness.hostSelector = '.mat-stepper-next';
/** Harness for interacting with a standard Angular Material stepper previous button in tests. */
export class MatStepperPreviousHarness extends StepperButtonHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatStepperPreviousHarness`
     * that meets certain criteria.
     * @param options Options for filtering which steps are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatStepperPreviousHarness, options)
            .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
    }
}
/** The selector for the host element of a `MatStep` instance. */
MatStepperPreviousHarness.hostSelector = '.mat-stepper-previous';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci1idXR0b24taGFybmVzc2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3N0ZXBwZXIvdGVzdGluZy9zdGVwcGVyLWJ1dHRvbi1oYXJuZXNzZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBR3hFLCtDQUErQztBQUMvQyxNQUFlLG9CQUFxQixTQUFRLGdCQUFnQjtJQUMxRCxtQ0FBbUM7SUFDN0IsT0FBTzs7WUFDWCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNwQyxDQUFDO0tBQUE7SUFFRCx5QkFBeUI7SUFDbkIsS0FBSzs7WUFDVCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNyQyxDQUFDO0tBQUE7Q0FDRjtBQUVELDZGQUE2RjtBQUM3RixNQUFNLE9BQU8scUJBQXNCLFNBQVEsb0JBQW9CO0lBSTdEOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUF1QyxFQUFFO1FBQ25ELE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxxQkFBcUIsRUFBRSxPQUFPLENBQUM7YUFDdEQsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxFQUMzQixDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN0RixDQUFDOztBQWJELGlFQUFpRTtBQUMxRCxrQ0FBWSxHQUFHLG1CQUFtQixDQUFDO0FBZ0I1QyxpR0FBaUc7QUFDakcsTUFBTSxPQUFPLHlCQUEwQixTQUFRLG9CQUFvQjtJQUlqRTs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBdUMsRUFBRTtRQUVuRCxPQUFPLElBQUksZ0JBQWdCLENBQUMseUJBQXlCLEVBQUUsT0FBTyxDQUFDO2FBQzFELFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksRUFDM0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdEYsQ0FBQzs7QUFkRCxpRUFBaUU7QUFDMUQsc0NBQVksR0FBRyx1QkFBdUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEhhcm5lc3MsIEhhcm5lc3NQcmVkaWNhdGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7U3RlcHBlckJ1dHRvbkhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL3N0ZXAtaGFybmVzcy1maWx0ZXJzJztcblxuLyoqIEJhc2UgY2xhc3MgZm9yIHN0ZXBwZXIgYnV0dG9uIGhhcm5lc3Nlcy4gKi9cbmFic3RyYWN0IGNsYXNzIFN0ZXBwZXJCdXR0b25IYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIC8qKiBHZXRzIHRoZSB0ZXh0IG9mIHRoZSBidXR0b24uICovXG4gIGFzeW5jIGdldFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS50ZXh0KCk7XG4gIH1cblxuICAvKiogQ2xpY2tzIHRoZSBidXR0b24uICovXG4gIGFzeW5jIGNsaWNrKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmNsaWNrKCk7XG4gIH1cbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBBbmd1bGFyIE1hdGVyaWFsIHN0ZXBwZXIgbmV4dCBidXR0b24gaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0U3RlcHBlck5leHRIYXJuZXNzIGV4dGVuZHMgU3RlcHBlckJ1dHRvbkhhcm5lc3Mge1xuICAvKiogVGhlIHNlbGVjdG9yIGZvciB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdFN0ZXBgIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtc3RlcHBlci1uZXh0JztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0U3RlcHBlck5leHRIYXJuZXNzYCB0aGF0IG1lZXRzXG4gICAqIGNlcnRhaW4gY3JpdGVyaWEuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBzdGVwcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IFN0ZXBwZXJCdXR0b25IYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRTdGVwcGVyTmV4dEhhcm5lc3M+IHtcbiAgICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUoTWF0U3RlcHBlck5leHRIYXJuZXNzLCBvcHRpb25zKVxuICAgICAgICAuYWRkT3B0aW9uKCd0ZXh0Jywgb3B0aW9ucy50ZXh0LFxuICAgICAgICAgICAgKGhhcm5lc3MsIHRleHQpID0+IEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldFRleHQoKSwgdGV4dCkpO1xuICB9XG59XG5cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBBbmd1bGFyIE1hdGVyaWFsIHN0ZXBwZXIgcHJldmlvdXMgYnV0dG9uIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdFN0ZXBwZXJQcmV2aW91c0hhcm5lc3MgZXh0ZW5kcyBTdGVwcGVyQnV0dG9uSGFybmVzcyB7XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0U3RlcGAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1zdGVwcGVyLXByZXZpb3VzJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0U3RlcHBlclByZXZpb3VzSGFybmVzc2BcbiAgICogdGhhdCBtZWV0cyBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggc3RlcHMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBTdGVwcGVyQnV0dG9uSGFybmVzc0ZpbHRlcnMgPSB7fSk6XG4gICAgSGFybmVzc1ByZWRpY2F0ZTxNYXRTdGVwcGVyUHJldmlvdXNIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdFN0ZXBwZXJQcmV2aW91c0hhcm5lc3MsIG9wdGlvbnMpXG4gICAgICAgIC5hZGRPcHRpb24oJ3RleHQnLCBvcHRpb25zLnRleHQsXG4gICAgICAgICAgICAoaGFybmVzcywgdGV4dCkgPT4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VGV4dCgpLCB0ZXh0KSk7XG4gIH1cbn1cbiJdfQ==