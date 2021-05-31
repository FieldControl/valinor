/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ContentContainerComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
/** Harness for interacting with a standard mat-snack-bar in tests. */
export class MatSnackBarHarness extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._messageSelector = '.mat-simple-snackbar > span';
        this._simpleSnackBarSelector = '.mat-simple-snackbar';
        this._actionButtonSelector = '.mat-simple-snackbar-action > button';
        this._simpleSnackBarLiveRegion = this.locatorFor('[aria-live]');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatSnackBarHarness` that meets
     * certain criteria.
     * @param options Options for filtering which snack bar instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatSnackBarHarness, options);
    }
    /**
     * Gets the role of the snack-bar. The role of a snack-bar is determined based
     * on the ARIA politeness specified in the snack-bar config.
     * @deprecated Use `getAriaLive` instead.
     * @breaking-change 13.0.0
     */
    getRole() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getAttribute('role');
        });
    }
    /**
     * Gets the aria-live of the snack-bar's live region. The aria-live of a snack-bar is
     * determined based on the ARIA politeness specified in the snack-bar config.
     */
    getAriaLive() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._simpleSnackBarLiveRegion())
                .getAttribute('aria-live');
        });
    }
    /**
     * Whether the snack-bar has an action. Method cannot be used for snack-bar's with custom content.
     */
    hasAction() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._assertSimpleSnackBar();
            return (yield this._getSimpleSnackBarActionButton()) !== null;
        });
    }
    /**
     * Gets the description of the snack-bar. Method cannot be used for snack-bar's without action or
     * with custom content.
     */
    getActionDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._assertSimpleSnackBarWithAction();
            return (yield this._getSimpleSnackBarActionButton()).text();
        });
    }
    /**
     * Dismisses the snack-bar by clicking the action button. Method cannot be used for snack-bar's
     * without action or with custom content.
     */
    dismissWithAction() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._assertSimpleSnackBarWithAction();
            yield (yield this._getSimpleSnackBarActionButton()).click();
        });
    }
    /**
     * Gets the message of the snack-bar. Method cannot be used for snack-bar's with custom content.
     */
    getMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._assertSimpleSnackBar();
            return (yield this.locatorFor(this._messageSelector)()).text();
        });
    }
    /** Gets whether the snack-bar has been dismissed. */
    isDismissed() {
        return __awaiter(this, void 0, void 0, function* () {
            // We consider the snackbar dismissed if it's not in the DOM. We can assert that the
            // element isn't in the DOM by seeing that its width and height are zero.
            const host = yield this.host();
            const [exit, dimensions] = yield parallel(() => [
                // The snackbar container is marked with the "exit" attribute after it has been dismissed
                // but before the animation has finished (after which it's removed from the DOM).
                host.getAttribute('mat-exit'),
                host.getDimensions(),
            ]);
            return exit != null || (!!dimensions && dimensions.height === 0 && dimensions.width === 0);
        });
    }
    /**
     * Asserts that the current snack-bar does not use custom content. Promise rejects if
     * custom content is used.
     */
    _assertSimpleSnackBar() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this._isSimpleSnackBar())) {
                throw Error('Method cannot be used for snack-bar with custom content.');
            }
        });
    }
    /**
     * Asserts that the current snack-bar does not use custom content and has
     * an action defined. Otherwise the promise will reject.
     */
    _assertSimpleSnackBarWithAction() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._assertSimpleSnackBar();
            if (!(yield this.hasAction())) {
                throw Error('Method cannot be used for standard snack-bar without action.');
            }
        });
    }
    /** Whether the snack-bar is using the default content template. */
    _isSimpleSnackBar() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.locatorForOptional(this._simpleSnackBarSelector)()) !== null;
        });
    }
    /** Gets the simple snack bar action button. */
    _getSimpleSnackBarActionButton() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorForOptional(this._actionButtonSelector)();
        });
    }
}
// Developers can provide a custom component or template for the
// snackbar. The canonical snack-bar parent is the "MatSnackBarContainer".
/** The selector for the host element of a `MatSnackBar` instance. */
MatSnackBarHarness.hostSelector = '.mat-snack-bar-container';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25hY2stYmFyLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc25hY2stYmFyL3Rlc3Rpbmcvc25hY2stYmFyLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUdILE9BQU8sRUFBQyxnQ0FBZ0MsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUdsRyxzRUFBc0U7QUFDdEUsTUFBTSxPQUFPLGtCQUFtQixTQUFRLGdDQUF3QztJQUFoRjs7UUFLWSxxQkFBZ0IsR0FBRyw2QkFBNkIsQ0FBQztRQUNqRCw0QkFBdUIsR0FBRyxzQkFBc0IsQ0FBQztRQUNqRCwwQkFBcUIsR0FBRyxzQ0FBc0MsQ0FBQztRQUNqRSw4QkFBeUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBZ0hyRSxDQUFDO0lBOUdDOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFrQyxFQUFFO1FBQzlDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDRyxPQUFPOztZQUNYLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQW1DLENBQUM7UUFDcEYsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ0csV0FBVzs7WUFDZixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztpQkFDMUMsWUFBWSxDQUFDLFdBQVcsQ0FBZ0MsQ0FBQztRQUNoRSxDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNHLFNBQVM7O1lBQ2IsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUNuQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQztRQUNoRSxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDRyxvQkFBb0I7O1lBQ3hCLE1BQU0sSUFBSSxDQUFDLCtCQUErQixFQUFFLENBQUM7WUFDN0MsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvRCxDQUFDO0tBQUE7SUFHRDs7O09BR0c7SUFDRyxpQkFBaUI7O1lBQ3JCLE1BQU0sSUFBSSxDQUFDLCtCQUErQixFQUFFLENBQUM7WUFDN0MsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMvRCxDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNHLFVBQVU7O1lBQ2QsTUFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUNuQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqRSxDQUFDO0tBQUE7SUFFRCxxREFBcUQ7SUFDL0MsV0FBVzs7WUFDZixvRkFBb0Y7WUFDcEYseUVBQXlFO1lBRXpFLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEdBQUcsTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQzlDLHlGQUF5RjtnQkFDekYsaUZBQWlGO2dCQUNqRixJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLGFBQWEsRUFBRTthQUNyQixDQUFDLENBQUM7WUFFSCxPQUFPLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDN0YsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ1cscUJBQXFCOztZQUNqQyxJQUFJLENBQUMsQ0FBQSxNQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBLEVBQUU7Z0JBQ25DLE1BQU0sS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7YUFDekU7UUFDSCxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDVywrQkFBK0I7O1lBQzNDLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLENBQUEsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUEsRUFBRTtnQkFDM0IsTUFBTSxLQUFLLENBQUMsOERBQThELENBQUMsQ0FBQzthQUM3RTtRQUNILENBQUM7S0FBQTtJQUVELG1FQUFtRTtJQUNyRCxpQkFBaUI7O1lBQzdCLE9BQU8sQ0FBQSxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsRUFBRSxNQUFLLElBQUksQ0FBQztRQUNoRixDQUFDO0tBQUE7SUFFRCwrQ0FBK0M7SUFDakMsOEJBQThCOztZQUMxQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDO1FBQy9ELENBQUM7S0FBQTs7QUF0SEQsZ0VBQWdFO0FBQ2hFLDBFQUEwRTtBQUMxRSxxRUFBcUU7QUFDOUQsK0JBQVksR0FBRywwQkFBMEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyaWFMaXZlUG9saXRlbmVzc30gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzcywgSGFybmVzc1ByZWRpY2F0ZSwgcGFyYWxsZWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7U25hY2tCYXJIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9zbmFjay1iYXItaGFybmVzcy1maWx0ZXJzJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBtYXQtc25hY2stYmFyIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdFNuYWNrQmFySGFybmVzcyBleHRlbmRzIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzPHN0cmluZz4ge1xuICAvLyBEZXZlbG9wZXJzIGNhbiBwcm92aWRlIGEgY3VzdG9tIGNvbXBvbmVudCBvciB0ZW1wbGF0ZSBmb3IgdGhlXG4gIC8vIHNuYWNrYmFyLiBUaGUgY2Fub25pY2FsIHNuYWNrLWJhciBwYXJlbnQgaXMgdGhlIFwiTWF0U25hY2tCYXJDb250YWluZXJcIi5cbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRTbmFja0JhcmAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1zbmFjay1iYXItY29udGFpbmVyJztcbiAgcHJvdGVjdGVkIF9tZXNzYWdlU2VsZWN0b3IgPSAnLm1hdC1zaW1wbGUtc25hY2tiYXIgPiBzcGFuJztcbiAgcHJvdGVjdGVkIF9zaW1wbGVTbmFja0JhclNlbGVjdG9yID0gJy5tYXQtc2ltcGxlLXNuYWNrYmFyJztcbiAgcHJvdGVjdGVkIF9hY3Rpb25CdXR0b25TZWxlY3RvciA9ICcubWF0LXNpbXBsZS1zbmFja2Jhci1hY3Rpb24gPiBidXR0b24nO1xuICBwcml2YXRlIF9zaW1wbGVTbmFja0JhckxpdmVSZWdpb24gPSB0aGlzLmxvY2F0b3JGb3IoJ1thcmlhLWxpdmVdJyk7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYE1hdFNuYWNrQmFySGFybmVzc2AgdGhhdCBtZWV0c1xuICAgKiBjZXJ0YWluIGNyaXRlcmlhLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBmaWx0ZXJpbmcgd2hpY2ggc25hY2sgYmFyIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IFNuYWNrQmFySGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0U25hY2tCYXJIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdFNuYWNrQmFySGFybmVzcywgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgcm9sZSBvZiB0aGUgc25hY2stYmFyLiBUaGUgcm9sZSBvZiBhIHNuYWNrLWJhciBpcyBkZXRlcm1pbmVkIGJhc2VkXG4gICAqIG9uIHRoZSBBUklBIHBvbGl0ZW5lc3Mgc3BlY2lmaWVkIGluIHRoZSBzbmFjay1iYXIgY29uZmlnLlxuICAgKiBAZGVwcmVjYXRlZCBVc2UgYGdldEFyaWFMaXZlYCBpbnN0ZWFkLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDEzLjAuMFxuICAgKi9cbiAgYXN5bmMgZ2V0Um9sZSgpOiBQcm9taXNlPCdhbGVydCd8J3N0YXR1cyd8bnVsbD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgncm9sZScpIGFzIFByb21pc2U8J2FsZXJ0J3wnc3RhdHVzJ3xudWxsPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBhcmlhLWxpdmUgb2YgdGhlIHNuYWNrLWJhcidzIGxpdmUgcmVnaW9uLiBUaGUgYXJpYS1saXZlIG9mIGEgc25hY2stYmFyIGlzXG4gICAqIGRldGVybWluZWQgYmFzZWQgb24gdGhlIEFSSUEgcG9saXRlbmVzcyBzcGVjaWZpZWQgaW4gdGhlIHNuYWNrLWJhciBjb25maWcuXG4gICAqL1xuICBhc3luYyBnZXRBcmlhTGl2ZSgpOiBQcm9taXNlPEFyaWFMaXZlUG9saXRlbmVzcz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fc2ltcGxlU25hY2tCYXJMaXZlUmVnaW9uKCkpXG4gICAgICAgIC5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScpIGFzIFByb21pc2U8QXJpYUxpdmVQb2xpdGVuZXNzPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBzbmFjay1iYXIgaGFzIGFuIGFjdGlvbi4gTWV0aG9kIGNhbm5vdCBiZSB1c2VkIGZvciBzbmFjay1iYXIncyB3aXRoIGN1c3RvbSBjb250ZW50LlxuICAgKi9cbiAgYXN5bmMgaGFzQWN0aW9uKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGF3YWl0IHRoaXMuX2Fzc2VydFNpbXBsZVNuYWNrQmFyKCk7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9nZXRTaW1wbGVTbmFja0JhckFjdGlvbkJ1dHRvbigpKSAhPT0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBkZXNjcmlwdGlvbiBvZiB0aGUgc25hY2stYmFyLiBNZXRob2QgY2Fubm90IGJlIHVzZWQgZm9yIHNuYWNrLWJhcidzIHdpdGhvdXQgYWN0aW9uIG9yXG4gICAqIHdpdGggY3VzdG9tIGNvbnRlbnQuXG4gICAqL1xuICBhc3luYyBnZXRBY3Rpb25EZXNjcmlwdGlvbigpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGF3YWl0IHRoaXMuX2Fzc2VydFNpbXBsZVNuYWNrQmFyV2l0aEFjdGlvbigpO1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fZ2V0U2ltcGxlU25hY2tCYXJBY3Rpb25CdXR0b24oKSkhLnRleHQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIERpc21pc3NlcyB0aGUgc25hY2stYmFyIGJ5IGNsaWNraW5nIHRoZSBhY3Rpb24gYnV0dG9uLiBNZXRob2QgY2Fubm90IGJlIHVzZWQgZm9yIHNuYWNrLWJhcidzXG4gICAqIHdpdGhvdXQgYWN0aW9uIG9yIHdpdGggY3VzdG9tIGNvbnRlbnQuXG4gICAqL1xuICBhc3luYyBkaXNtaXNzV2l0aEFjdGlvbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLl9hc3NlcnRTaW1wbGVTbmFja0JhcldpdGhBY3Rpb24oKTtcbiAgICBhd2FpdCAoYXdhaXQgdGhpcy5fZ2V0U2ltcGxlU25hY2tCYXJBY3Rpb25CdXR0b24oKSkhLmNsaWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbWVzc2FnZSBvZiB0aGUgc25hY2stYmFyLiBNZXRob2QgY2Fubm90IGJlIHVzZWQgZm9yIHNuYWNrLWJhcidzIHdpdGggY3VzdG9tIGNvbnRlbnQuXG4gICAqL1xuICBhc3luYyBnZXRNZXNzYWdlKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgYXdhaXQgdGhpcy5fYXNzZXJ0U2ltcGxlU25hY2tCYXIoKTtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMubG9jYXRvckZvcih0aGlzLl9tZXNzYWdlU2VsZWN0b3IpKCkpLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIHNuYWNrLWJhciBoYXMgYmVlbiBkaXNtaXNzZWQuICovXG4gIGFzeW5jIGlzRGlzbWlzc2VkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIC8vIFdlIGNvbnNpZGVyIHRoZSBzbmFja2JhciBkaXNtaXNzZWQgaWYgaXQncyBub3QgaW4gdGhlIERPTS4gV2UgY2FuIGFzc2VydCB0aGF0IHRoZVxuICAgIC8vIGVsZW1lbnQgaXNuJ3QgaW4gdGhlIERPTSBieSBzZWVpbmcgdGhhdCBpdHMgd2lkdGggYW5kIGhlaWdodCBhcmUgemVyby5cblxuICAgIGNvbnN0IGhvc3QgPSBhd2FpdCB0aGlzLmhvc3QoKTtcbiAgICBjb25zdCBbZXhpdCwgZGltZW5zaW9uc10gPSBhd2FpdCBwYXJhbGxlbCgoKSA9PiBbXG4gICAgICAvLyBUaGUgc25hY2tiYXIgY29udGFpbmVyIGlzIG1hcmtlZCB3aXRoIHRoZSBcImV4aXRcIiBhdHRyaWJ1dGUgYWZ0ZXIgaXQgaGFzIGJlZW4gZGlzbWlzc2VkXG4gICAgICAvLyBidXQgYmVmb3JlIHRoZSBhbmltYXRpb24gaGFzIGZpbmlzaGVkIChhZnRlciB3aGljaCBpdCdzIHJlbW92ZWQgZnJvbSB0aGUgRE9NKS5cbiAgICAgIGhvc3QuZ2V0QXR0cmlidXRlKCdtYXQtZXhpdCcpLFxuICAgICAgaG9zdC5nZXREaW1lbnNpb25zKCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4gZXhpdCAhPSBudWxsIHx8ICghIWRpbWVuc2lvbnMgJiYgZGltZW5zaW9ucy5oZWlnaHQgPT09IDAgJiYgZGltZW5zaW9ucy53aWR0aCA9PT0gMCk7XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0cyB0aGF0IHRoZSBjdXJyZW50IHNuYWNrLWJhciBkb2VzIG5vdCB1c2UgY3VzdG9tIGNvbnRlbnQuIFByb21pc2UgcmVqZWN0cyBpZlxuICAgKiBjdXN0b20gY29udGVudCBpcyB1c2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfYXNzZXJ0U2ltcGxlU25hY2tCYXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFhd2FpdCB0aGlzLl9pc1NpbXBsZVNuYWNrQmFyKCkpIHtcbiAgICAgIHRocm93IEVycm9yKCdNZXRob2QgY2Fubm90IGJlIHVzZWQgZm9yIHNuYWNrLWJhciB3aXRoIGN1c3RvbSBjb250ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHRoYXQgdGhlIGN1cnJlbnQgc25hY2stYmFyIGRvZXMgbm90IHVzZSBjdXN0b20gY29udGVudCBhbmQgaGFzXG4gICAqIGFuIGFjdGlvbiBkZWZpbmVkLiBPdGhlcndpc2UgdGhlIHByb21pc2Ugd2lsbCByZWplY3QuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9hc3NlcnRTaW1wbGVTbmFja0JhcldpdGhBY3Rpb24oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5fYXNzZXJ0U2ltcGxlU25hY2tCYXIoKTtcbiAgICBpZiAoIWF3YWl0IHRoaXMuaGFzQWN0aW9uKCkpIHtcbiAgICAgIHRocm93IEVycm9yKCdNZXRob2QgY2Fubm90IGJlIHVzZWQgZm9yIHN0YW5kYXJkIHNuYWNrLWJhciB3aXRob3V0IGFjdGlvbi4nKTtcbiAgICB9XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgc25hY2stYmFyIGlzIHVzaW5nIHRoZSBkZWZhdWx0IGNvbnRlbnQgdGVtcGxhdGUuICovXG4gIHByaXZhdGUgYXN5bmMgX2lzU2ltcGxlU25hY2tCYXIoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMubG9jYXRvckZvck9wdGlvbmFsKHRoaXMuX3NpbXBsZVNuYWNrQmFyU2VsZWN0b3IpKCkgIT09IG51bGw7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgc2ltcGxlIHNuYWNrIGJhciBhY3Rpb24gYnV0dG9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRTaW1wbGVTbmFja0JhckFjdGlvbkJ1dHRvbigpIHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRm9yT3B0aW9uYWwodGhpcy5fYWN0aW9uQnV0dG9uU2VsZWN0b3IpKCk7XG4gIH1cbn1cbiJdfQ==