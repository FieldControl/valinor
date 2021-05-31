/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { HarnessPredicate, ContentContainerComponentHarness } from '@angular/cdk/testing';
/** Harness for interacting with a standard mat-card in tests. */
export class MatCardHarness extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._title = this.locatorForOptional('.mat-card-title');
        this._subtitle = this.locatorForOptional('.mat-card-subtitle');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatCardHarness` that meets
     * certain criteria.
     * @param options Options for filtering which card instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatCardHarness, options)
            .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
            .addOption('title', options.title, (harness, title) => HarnessPredicate.stringMatches(harness.getTitleText(), title))
            .addOption('subtitle', options.subtitle, (harness, subtitle) => HarnessPredicate.stringMatches(harness.getSubtitleText(), subtitle));
    }
    /** Gets all of the card's content as text. */
    getText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).text();
        });
    }
    /** Gets the cards's title text. */
    getTitleText() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            return (_b = (_a = (yield this._title())) === null || _a === void 0 ? void 0 : _a.text()) !== null && _b !== void 0 ? _b : '';
        });
    }
    /** Gets the cards's subtitle text. */
    getSubtitleText() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            return (_b = (_a = (yield this._subtitle())) === null || _a === void 0 ? void 0 : _a.text()) !== null && _b !== void 0 ? _b : '';
        });
    }
}
/** The selector for the host element of a `MatCard` instance. */
MatCardHarness.hostSelector = '.mat-card';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2NhcmQvdGVzdGluZy9jYXJkLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxnQ0FBZ0MsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBV3hGLGlFQUFpRTtBQUNqRSxNQUFNLE9BQU8sY0FBZSxTQUFRLGdDQUFnRDtJQUFwRjs7UUFxQlUsV0FBTSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3BELGNBQVMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQWdCcEUsQ0FBQztJQWxDQzs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBOEIsRUFBRTtRQUMxQyxPQUFPLElBQUksZ0JBQWdCLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQzthQUMvQyxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQzNCLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUM5RSxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQzdCLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNyRixTQUFTLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQ25DLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQ2xCLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBS0QsOENBQThDO0lBQ3hDLE9BQU87O1lBQ1gsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEMsQ0FBQztLQUFBO0lBRUQsbUNBQW1DO0lBQzdCLFlBQVk7OztZQUNoQixPQUFPLE1BQUEsTUFBQSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLDBDQUFFLElBQUksRUFBRSxtQ0FBSSxFQUFFLENBQUM7O0tBQzVDO0lBRUQsc0NBQXNDO0lBQ2hDLGVBQWU7OztZQUNuQixPQUFPLE1BQUEsTUFBQSxDQUFDLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLDBDQUFFLElBQUksRUFBRSxtQ0FBSSxFQUFFLENBQUM7O0tBQy9DOztBQXBDRCxpRUFBaUU7QUFDMUQsMkJBQVksR0FBRyxXQUFXLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIYXJuZXNzUHJlZGljYXRlLCBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzc30gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtDYXJkSGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vY2FyZC1oYXJuZXNzLWZpbHRlcnMnO1xuXG4vKiogU2VsZWN0b3JzIGZvciBkaWZmZXJlbnQgc2VjdGlvbnMgb2YgdGhlIG1hdC1jYXJkIHRoYXQgY2FuIGNvbnRhaW5lciB1c2VyIGNvbnRlbnQuICovXG5leHBvcnQgY29uc3QgZW51bSBNYXRDYXJkU2VjdGlvbiB7XG4gIEhFQURFUiA9ICcubWF0LWNhcmQtaGVhZGVyJyxcbiAgQ09OVEVOVCA9ICcubWF0LWNhcmQtY29udGVudCcsXG4gIEFDVElPTlMgPSAnLm1hdC1jYXJkLWFjdGlvbnMnLFxuICBGT09URVIgPSAnLm1hdC1jYXJkLWZvb3Rlcidcbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBtYXQtY2FyZCBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRDYXJkSGFybmVzcyBleHRlbmRzIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzPE1hdENhcmRTZWN0aW9uPiB7XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0Q2FyZGAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1jYXJkJztcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSBgTWF0Q2FyZEhhcm5lc3NgIHRoYXQgbWVldHNcbiAgICogY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGNhcmQgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogQ2FyZEhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdENhcmRIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdENhcmRIYXJuZXNzLCBvcHRpb25zKVxuICAgICAgICAuYWRkT3B0aW9uKCd0ZXh0Jywgb3B0aW9ucy50ZXh0LFxuICAgICAgICAgICAgKGhhcm5lc3MsIHRleHQpID0+IEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldFRleHQoKSwgdGV4dCkpXG4gICAgICAgIC5hZGRPcHRpb24oJ3RpdGxlJywgb3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgIChoYXJuZXNzLCB0aXRsZSkgPT4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VGl0bGVUZXh0KCksIHRpdGxlKSlcbiAgICAgICAgLmFkZE9wdGlvbignc3VidGl0bGUnLCBvcHRpb25zLnN1YnRpdGxlLFxuICAgICAgICAgICAgKGhhcm5lc3MsIHN1YnRpdGxlKSA9PlxuICAgICAgICAgICAgICAgIEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldFN1YnRpdGxlVGV4dCgpLCBzdWJ0aXRsZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdGl0bGUgPSB0aGlzLmxvY2F0b3JGb3JPcHRpb25hbCgnLm1hdC1jYXJkLXRpdGxlJyk7XG4gIHByaXZhdGUgX3N1YnRpdGxlID0gdGhpcy5sb2NhdG9yRm9yT3B0aW9uYWwoJy5tYXQtY2FyZC1zdWJ0aXRsZScpO1xuXG4gIC8qKiBHZXRzIGFsbCBvZiB0aGUgY2FyZCdzIGNvbnRlbnQgYXMgdGV4dC4gKi9cbiAgYXN5bmMgZ2V0VGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBjYXJkcydzIHRpdGxlIHRleHQuICovXG4gIGFzeW5jIGdldFRpdGxlVGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fdGl0bGUoKSk/LnRleHQoKSA/PyAnJztcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBjYXJkcydzIHN1YnRpdGxlIHRleHQuICovXG4gIGFzeW5jIGdldFN1YnRpdGxlVGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fc3VidGl0bGUoKSk/LnRleHQoKSA/PyAnJztcbiAgfVxufVxuIl19