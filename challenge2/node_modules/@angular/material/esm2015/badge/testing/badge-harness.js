/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
/** Harness for interacting with a standard Material badge in tests. */
export class MatBadgeHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._badgeElement = this.locatorFor('.mat-badge-content');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a badge with specific attributes.
     * @param options Options for narrowing the search:
     *   - `text` finds a badge host with a particular text.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatBadgeHarness, options)
            .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
    }
    /** Gets a promise for the badge text. */
    getText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._badgeElement()).text();
        });
    }
    /** Gets whether the badge is overlapping the content. */
    isOverlapping() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-badge-overlap');
        });
    }
    /** Gets the position of the badge. */
    getPosition() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            let result = '';
            if (yield host.hasClass('mat-badge-above')) {
                result += 'above';
            }
            else if (yield host.hasClass('mat-badge-below')) {
                result += 'below';
            }
            if (yield host.hasClass('mat-badge-before')) {
                result += ' before';
            }
            else if (yield host.hasClass('mat-badge-after')) {
                result += ' after';
            }
            return result.trim();
        });
    }
    /** Gets the size of the badge. */
    getSize() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            if (yield host.hasClass('mat-badge-small')) {
                return 'small';
            }
            else if (yield host.hasClass('mat-badge-large')) {
                return 'large';
            }
            return 'medium';
        });
    }
    /** Gets whether the badge is hidden. */
    isHidden() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-badge-hidden');
        });
    }
    /** Gets whether the badge is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-badge-disabled');
        });
    }
}
MatBadgeHarness.hostSelector = '.mat-badge';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkZ2UtaGFybmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9iYWRnZS90ZXN0aW5nL2JhZGdlLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBS3hFLHVFQUF1RTtBQUN2RSxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxnQkFBZ0I7SUFBckQ7O1FBZVUsa0JBQWEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFzRGhFLENBQUM7SUFsRUM7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQStCLEVBQUU7UUFDM0MsT0FBTyxJQUFJLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUM7YUFDaEQsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxFQUMzQixDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBSUQseUNBQXlDO0lBQ25DLE9BQU87O1lBQ1gsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0MsQ0FBQztLQUFBO0lBRUQseURBQXlEO0lBQ25ELGFBQWE7O1lBQ2pCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzNELENBQUM7S0FBQTtJQUVELHNDQUFzQztJQUNoQyxXQUFXOztZQUNmLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQy9CLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUVoQixJQUFJLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO2dCQUMxQyxNQUFNLElBQUksT0FBTyxDQUFDO2FBQ25CO2lCQUFNLElBQUksTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7Z0JBQ2pELE1BQU0sSUFBSSxPQUFPLENBQUM7YUFDbkI7WUFFRCxJQUFJLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO2dCQUMzQyxNQUFNLElBQUksU0FBUyxDQUFDO2FBQ3JCO2lCQUFNLElBQUksTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7Z0JBQ2pELE1BQU0sSUFBSSxRQUFRLENBQUM7YUFDcEI7WUFFRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQXNCLENBQUM7UUFDM0MsQ0FBQztLQUFBO0lBRUQsa0NBQWtDO0lBQzVCLE9BQU87O1lBQ1gsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFL0IsSUFBSSxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDMUMsT0FBTyxPQUFPLENBQUM7YUFDaEI7aUJBQU0sSUFBSSxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDakQsT0FBTyxPQUFPLENBQUM7YUFDaEI7WUFFRCxPQUFPLFFBQVEsQ0FBQztRQUNsQixDQUFDO0tBQUE7SUFFRCx3Q0FBd0M7SUFDbEMsUUFBUTs7WUFDWixPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMxRCxDQUFDO0tBQUE7SUFFRCwwQ0FBMEM7SUFDcEMsVUFBVTs7WUFDZCxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUM1RCxDQUFDO0tBQUE7O0FBbkVNLDRCQUFZLEdBQUcsWUFBWSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50SGFybmVzcywgSGFybmVzc1ByZWRpY2F0ZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtNYXRCYWRnZVBvc2l0aW9uLCBNYXRCYWRnZVNpemV9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2JhZGdlJztcbmltcG9ydCB7QmFkZ2VIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9iYWRnZS1oYXJuZXNzLWZpbHRlcnMnO1xuXG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgTWF0ZXJpYWwgYmFkZ2UgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0QmFkZ2VIYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1iYWRnZSc7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYmFkZ2Ugd2l0aCBzcGVjaWZpYyBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBuYXJyb3dpbmcgdGhlIHNlYXJjaDpcbiAgICogICAtIGB0ZXh0YCBmaW5kcyBhIGJhZGdlIGhvc3Qgd2l0aCBhIHBhcnRpY3VsYXIgdGV4dC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBCYWRnZUhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdEJhZGdlSGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRCYWRnZUhhcm5lc3MsIG9wdGlvbnMpXG4gICAgICAgIC5hZGRPcHRpb24oJ3RleHQnLCBvcHRpb25zLnRleHQsXG4gICAgICAgICAgICAoaGFybmVzcywgdGV4dCkgPT4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VGV4dCgpLCB0ZXh0KSk7XG4gIH1cblxuICBwcml2YXRlIF9iYWRnZUVsZW1lbnQgPSB0aGlzLmxvY2F0b3JGb3IoJy5tYXQtYmFkZ2UtY29udGVudCcpO1xuXG4gIC8qKiBHZXRzIGEgcHJvbWlzZSBmb3IgdGhlIGJhZGdlIHRleHQuICovXG4gIGFzeW5jIGdldFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2JhZGdlRWxlbWVudCgpKS50ZXh0KCk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBiYWRnZSBpcyBvdmVybGFwcGluZyB0aGUgY29udGVudC4gKi9cbiAgYXN5bmMgaXNPdmVybGFwcGluZygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcygnbWF0LWJhZGdlLW92ZXJsYXAnKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgYmFkZ2UuICovXG4gIGFzeW5jIGdldFBvc2l0aW9uKCk6IFByb21pc2U8TWF0QmFkZ2VQb3NpdGlvbj4ge1xuICAgIGNvbnN0IGhvc3QgPSBhd2FpdCB0aGlzLmhvc3QoKTtcbiAgICBsZXQgcmVzdWx0ID0gJyc7XG5cbiAgICBpZiAoYXdhaXQgaG9zdC5oYXNDbGFzcygnbWF0LWJhZGdlLWFib3ZlJykpIHtcbiAgICAgIHJlc3VsdCArPSAnYWJvdmUnO1xuICAgIH0gZWxzZSBpZiAoYXdhaXQgaG9zdC5oYXNDbGFzcygnbWF0LWJhZGdlLWJlbG93JykpIHtcbiAgICAgIHJlc3VsdCArPSAnYmVsb3cnO1xuICAgIH1cblxuICAgIGlmIChhd2FpdCBob3N0Lmhhc0NsYXNzKCdtYXQtYmFkZ2UtYmVmb3JlJykpIHtcbiAgICAgIHJlc3VsdCArPSAnIGJlZm9yZSc7XG4gICAgfSBlbHNlIGlmIChhd2FpdCBob3N0Lmhhc0NsYXNzKCdtYXQtYmFkZ2UtYWZ0ZXInKSkge1xuICAgICAgcmVzdWx0ICs9ICcgYWZ0ZXInO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQudHJpbSgpIGFzIE1hdEJhZGdlUG9zaXRpb247XG4gIH1cblxuICAvKiogR2V0cyB0aGUgc2l6ZSBvZiB0aGUgYmFkZ2UuICovXG4gIGFzeW5jIGdldFNpemUoKTogUHJvbWlzZTxNYXRCYWRnZVNpemU+IHtcbiAgICBjb25zdCBob3N0ID0gYXdhaXQgdGhpcy5ob3N0KCk7XG5cbiAgICBpZiAoYXdhaXQgaG9zdC5oYXNDbGFzcygnbWF0LWJhZGdlLXNtYWxsJykpIHtcbiAgICAgIHJldHVybiAnc21hbGwnO1xuICAgIH0gZWxzZSBpZiAoYXdhaXQgaG9zdC5oYXNDbGFzcygnbWF0LWJhZGdlLWxhcmdlJykpIHtcbiAgICAgIHJldHVybiAnbGFyZ2UnO1xuICAgIH1cblxuICAgIHJldHVybiAnbWVkaXVtJztcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGJhZGdlIGlzIGhpZGRlbi4gKi9cbiAgYXN5bmMgaXNIaWRkZW4oKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoJ21hdC1iYWRnZS1oaWRkZW4nKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGJhZGdlIGlzIGRpc2FibGVkLiAqL1xuICBhc3luYyBpc0Rpc2FibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCdtYXQtYmFkZ2UtZGlzYWJsZWQnKTtcbiAgfVxufVxuIl19