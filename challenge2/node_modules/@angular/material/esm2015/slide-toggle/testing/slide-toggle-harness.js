/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
export class _MatSlideToggleHarnessBase extends ComponentHarness {
    constructor() {
        super(...arguments);
        this._label = this.locatorFor('label');
        this._input = this.locatorFor('input');
    }
    /** Whether the slide-toggle is checked. */
    isChecked() {
        return __awaiter(this, void 0, void 0, function* () {
            const checked = (yield this._input()).getProperty('checked');
            return coerceBooleanProperty(yield checked);
        });
    }
    /** Whether the slide-toggle is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            const disabled = (yield this._input()).getAttribute('disabled');
            return coerceBooleanProperty(yield disabled);
        });
    }
    /** Whether the slide-toggle is required. */
    isRequired() {
        return __awaiter(this, void 0, void 0, function* () {
            const required = (yield this._input()).getAttribute('required');
            return coerceBooleanProperty(yield required);
        });
    }
    /** Whether the slide-toggle is valid. */
    isValid() {
        return __awaiter(this, void 0, void 0, function* () {
            const invalid = (yield this.host()).hasClass('ng-invalid');
            return !(yield invalid);
        });
    }
    /** Gets the slide-toggle's name. */
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).getAttribute('name');
        });
    }
    /** Gets the slide-toggle's aria-label. */
    getAriaLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).getAttribute('aria-label');
        });
    }
    /** Gets the slide-toggle's aria-labelledby. */
    getAriaLabelledby() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).getAttribute('aria-labelledby');
        });
    }
    /** Gets the slide-toggle's label text. */
    getLabelText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._label()).text();
        });
    }
    /** Focuses the slide-toggle. */
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).focus();
        });
    }
    /** Blurs the slide-toggle. */
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).blur();
        });
    }
    /** Whether the slide-toggle is focused. */
    isFocused() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._input()).isFocused();
        });
    }
    /**
     * Puts the slide-toggle in a checked state by toggling it if it is currently unchecked, or doing
     * nothing if it is already checked.
     */
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isChecked())) {
                yield this.toggle();
            }
        });
    }
    /**
     * Puts the slide-toggle in an unchecked state by toggling it if it is currently checked, or doing
     * nothing if it is already unchecked.
     */
    uncheck() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isChecked()) {
                yield this.toggle();
            }
        });
    }
}
/** Harness for interacting with a standard mat-slide-toggle in tests. */
export class MatSlideToggleHarness extends _MatSlideToggleHarnessBase {
    constructor() {
        super(...arguments);
        this._inputContainer = this.locatorFor('.mat-slide-toggle-bar');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatSlideToggleHarness` that meets
     * certain criteria.
     * @param options Options for filtering which slide toggle instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatSlideToggleHarness, options)
            .addOption('label', options.label, (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label))
            // We want to provide a filter option for "name" because the name of the slide-toggle is
            // only set on the underlying input. This means that it's not possible for developers
            // to retrieve the harness of a specific checkbox with name through a CSS selector.
            .addOption('name', options.name, (harness, name) => __awaiter(this, void 0, void 0, function* () { return (yield harness.getName()) === name; }));
    }
    /** Toggle the checked state of the slide-toggle. */
    toggle() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._inputContainer()).click();
        });
    }
}
/** The selector for the host element of a `MatSlideToggle` instance. */
MatSlideToggleHarness.hostSelector = '.mat-slide-toggle';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpZGUtdG9nZ2xlLWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc2xpZGUtdG9nZ2xlL3Rlc3Rpbmcvc2xpZGUtdG9nZ2xlLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRzVELE1BQU0sT0FBZ0IsMEJBQTJCLFNBQVEsZ0JBQWdCO0lBQXpFOztRQUNVLFdBQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hDLFdBQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBbUY5QyxDQUFDO0lBOUVDLDJDQUEyQztJQUNyQyxTQUFTOztZQUNiLE1BQU0sT0FBTyxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDN0QsT0FBTyxxQkFBcUIsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLENBQUM7S0FBQTtJQUVELDRDQUE0QztJQUN0QyxVQUFVOztZQUNkLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEUsT0FBTyxxQkFBcUIsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLENBQUM7S0FBQTtJQUVELDRDQUE0QztJQUN0QyxVQUFVOztZQUNkLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7WUFD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LENBQUM7SUFDbEcsQ0FBQztJQUlELG9EQUFvRDtJQUM5QyxNQUFNOztZQUNWLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hELENBQUM7S0FBQTs7QUF4QkQsd0VBQXdFO0FBQ2pFLGtDQUFZLEdBQUcsbUJBQW1CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21wb25lbnRIYXJuZXNzLCBIYXJuZXNzUHJlZGljYXRlfSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge2NvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7U2xpZGVUb2dnbGVIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9zbGlkZS10b2dnbGUtaGFybmVzcy1maWx0ZXJzJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIF9NYXRTbGlkZVRvZ2dsZUhhcm5lc3NCYXNlIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIHByaXZhdGUgX2xhYmVsID0gdGhpcy5sb2NhdG9yRm9yKCdsYWJlbCcpO1xuICBwcm90ZWN0ZWQgX2lucHV0ID0gdGhpcy5sb2NhdG9yRm9yKCdpbnB1dCcpO1xuXG4gIC8qKiBUb2dnbGUgdGhlIGNoZWNrZWQgc3RhdGUgb2YgdGhlIHNsaWRlLXRvZ2dsZS4gKi9cbiAgYWJzdHJhY3QgdG9nZ2xlKCk6IFByb21pc2U8dm9pZD47XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHNsaWRlLXRvZ2dsZSBpcyBjaGVja2VkLiAqL1xuICBhc3luYyBpc0NoZWNrZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgY2hlY2tlZCA9IChhd2FpdCB0aGlzLl9pbnB1dCgpKS5nZXRQcm9wZXJ0eSgnY2hlY2tlZCcpO1xuICAgIHJldHVybiBjb2VyY2VCb29sZWFuUHJvcGVydHkoYXdhaXQgY2hlY2tlZCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgc2xpZGUtdG9nZ2xlIGlzIGRpc2FibGVkLiAqL1xuICBhc3luYyBpc0Rpc2FibGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGRpc2FibGVkID0gKGF3YWl0IHRoaXMuX2lucHV0KCkpLmdldEF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICByZXR1cm4gY29lcmNlQm9vbGVhblByb3BlcnR5KGF3YWl0IGRpc2FibGVkKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBzbGlkZS10b2dnbGUgaXMgcmVxdWlyZWQuICovXG4gIGFzeW5jIGlzUmVxdWlyZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVxdWlyZWQgPSAoYXdhaXQgdGhpcy5faW5wdXQoKSkuZ2V0QXR0cmlidXRlKCdyZXF1aXJlZCcpO1xuICAgIHJldHVybiBjb2VyY2VCb29sZWFuUHJvcGVydHkoYXdhaXQgcmVxdWlyZWQpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHNsaWRlLXRvZ2dsZSBpcyB2YWxpZC4gKi9cbiAgYXN5bmMgaXNWYWxpZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBpbnZhbGlkID0gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcygnbmctaW52YWxpZCcpO1xuICAgIHJldHVybiAhKGF3YWl0IGludmFsaWQpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHNsaWRlLXRvZ2dsZSdzIG5hbWUuICovXG4gIGFzeW5jIGdldE5hbWUoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9pbnB1dCgpKS5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzbGlkZS10b2dnbGUncyBhcmlhLWxhYmVsLiAqL1xuICBhc3luYyBnZXRBcmlhTGFiZWwoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9pbnB1dCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzbGlkZS10b2dnbGUncyBhcmlhLWxhYmVsbGVkYnkuICovXG4gIGFzeW5jIGdldEFyaWFMYWJlbGxlZGJ5KCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5faW5wdXQoKSkuZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsbGVkYnknKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBzbGlkZS10b2dnbGUncyBsYWJlbCB0ZXh0LiAqL1xuICBhc3luYyBnZXRMYWJlbFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2xhYmVsKCkpLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBzbGlkZS10b2dnbGUuICovXG4gIGFzeW5jIGZvY3VzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5faW5wdXQoKSkuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKiBCbHVycyB0aGUgc2xpZGUtdG9nZ2xlLiAqL1xuICBhc3luYyBibHVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5faW5wdXQoKSkuYmx1cigpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHNsaWRlLXRvZ2dsZSBpcyBmb2N1c2VkLiAqL1xuICBhc3luYyBpc0ZvY3VzZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9pbnB1dCgpKS5pc0ZvY3VzZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXRzIHRoZSBzbGlkZS10b2dnbGUgaW4gYSBjaGVja2VkIHN0YXRlIGJ5IHRvZ2dsaW5nIGl0IGlmIGl0IGlzIGN1cnJlbnRseSB1bmNoZWNrZWQsIG9yIGRvaW5nXG4gICAqIG5vdGhpbmcgaWYgaXQgaXMgYWxyZWFkeSBjaGVja2VkLlxuICAgKi9cbiAgYXN5bmMgY2hlY2soKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5pc0NoZWNrZWQoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMudG9nZ2xlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFB1dHMgdGhlIHNsaWRlLXRvZ2dsZSBpbiBhbiB1bmNoZWNrZWQgc3RhdGUgYnkgdG9nZ2xpbmcgaXQgaWYgaXQgaXMgY3VycmVudGx5IGNoZWNrZWQsIG9yIGRvaW5nXG4gICAqIG5vdGhpbmcgaWYgaXQgaXMgYWxyZWFkeSB1bmNoZWNrZWQuXG4gICAqL1xuICBhc3luYyB1bmNoZWNrKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChhd2FpdCB0aGlzLmlzQ2hlY2tlZCgpKSB7XG4gICAgICBhd2FpdCB0aGlzLnRvZ2dsZSgpO1xuICAgIH1cbiAgfVxufVxuXG5cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBtYXQtc2xpZGUtdG9nZ2xlIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdFNsaWRlVG9nZ2xlSGFybmVzcyBleHRlbmRzIF9NYXRTbGlkZVRvZ2dsZUhhcm5lc3NCYXNlIHtcbiAgLyoqIFRoZSBzZWxlY3RvciBmb3IgdGhlIGhvc3QgZWxlbWVudCBvZiBhIGBNYXRTbGlkZVRvZ2dsZWAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1zbGlkZS10b2dnbGUnO1xuXG4gIC8qKlxuICAgKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VhcmNoIGZvciBhIGBNYXRTbGlkZVRvZ2dsZUhhcm5lc3NgIHRoYXQgbWVldHNcbiAgICogY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIHNsaWRlIHRvZ2dsZSBpbnN0YW5jZXMgYXJlIGNvbnNpZGVyZWQgYSBtYXRjaC5cbiAgICogQHJldHVybiBhIGBIYXJuZXNzUHJlZGljYXRlYCBjb25maWd1cmVkIHdpdGggdGhlIGdpdmVuIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd2l0aChvcHRpb25zOiBTbGlkZVRvZ2dsZUhhcm5lc3NGaWx0ZXJzID0ge30pOiBIYXJuZXNzUHJlZGljYXRlPE1hdFNsaWRlVG9nZ2xlSGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRTbGlkZVRvZ2dsZUhhcm5lc3MsIG9wdGlvbnMpXG4gICAgICAgIC5hZGRPcHRpb24oJ2xhYmVsJywgb3B0aW9ucy5sYWJlbCxcbiAgICAgICAgICAgIChoYXJuZXNzLCBsYWJlbCkgPT4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0TGFiZWxUZXh0KCksIGxhYmVsKSlcbiAgICAgICAgLy8gV2Ugd2FudCB0byBwcm92aWRlIGEgZmlsdGVyIG9wdGlvbiBmb3IgXCJuYW1lXCIgYmVjYXVzZSB0aGUgbmFtZSBvZiB0aGUgc2xpZGUtdG9nZ2xlIGlzXG4gICAgICAgIC8vIG9ubHkgc2V0IG9uIHRoZSB1bmRlcmx5aW5nIGlucHV0LiBUaGlzIG1lYW5zIHRoYXQgaXQncyBub3QgcG9zc2libGUgZm9yIGRldmVsb3BlcnNcbiAgICAgICAgLy8gdG8gcmV0cmlldmUgdGhlIGhhcm5lc3Mgb2YgYSBzcGVjaWZpYyBjaGVja2JveCB3aXRoIG5hbWUgdGhyb3VnaCBhIENTUyBzZWxlY3Rvci5cbiAgICAgICAgLmFkZE9wdGlvbignbmFtZScsIG9wdGlvbnMubmFtZSwgYXN5bmMgKGhhcm5lc3MsIG5hbWUpID0+IGF3YWl0IGhhcm5lc3MuZ2V0TmFtZSgpID09PSBuYW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgX2lucHV0Q29udGFpbmVyID0gdGhpcy5sb2NhdG9yRm9yKCcubWF0LXNsaWRlLXRvZ2dsZS1iYXInKTtcblxuICAvKiogVG9nZ2xlIHRoZSBjaGVja2VkIHN0YXRlIG9mIHRoZSBzbGlkZS10b2dnbGUuICovXG4gIGFzeW5jIHRvZ2dsZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2lucHV0Q29udGFpbmVyKCkpLmNsaWNrKCk7XG4gIH1cbn1cbiJdfQ==