/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ContentContainerComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
/** Harness for interacting with a standard Angular Material step in tests. */
export class MatStepHarness extends ContentContainerComponentHarness {
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatStepHarness` that meets
     * certain criteria.
     * @param options Options for filtering which steps are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatStepHarness, options)
            .addOption('label', options.label, (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label))
            .addOption('selected', options.selected, (harness, selected) => __awaiter(this, void 0, void 0, function* () { return (yield harness.isSelected()) === selected; }))
            .addOption('completed', options.completed, (harness, completed) => __awaiter(this, void 0, void 0, function* () { return (yield harness.isCompleted()) === completed; }))
            .addOption('invalid', options.invalid, (harness, invalid) => __awaiter(this, void 0, void 0, function* () { return (yield harness.hasErrors()) === invalid; }));
    }
    /** Gets the label of the step. */
    getLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.locatorFor('.mat-step-text-label')()).text();
        });
    }
    /** Gets the `aria-label` of the step. */
    getAriaLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getAttribute('aria-label');
        });
    }
    /** Gets the value of the `aria-labelledby` attribute. */
    getAriaLabelledby() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getAttribute('aria-labelledby');
        });
    }
    /** Whether the step is selected. */
    isSelected() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            return (yield host.getAttribute('aria-selected')) === 'true';
        });
    }
    /** Whether the step has been filled out. */
    isCompleted() {
        return __awaiter(this, void 0, void 0, function* () {
            const state = yield this._getIconState();
            return state === 'done' || (state === 'edit' && !(yield this.isSelected()));
        });
    }
    /**
     * Whether the step is currently showing its error state. Note that this doesn't mean that there
     * are or aren't any invalid form controls inside the step, but that the step is showing its
     * error-specific styling which depends on there being invalid controls, as well as the
     * `ErrorStateMatcher` determining that an error should be shown and that the `showErrors`
     * option was enabled through the `STEPPER_GLOBAL_OPTIONS` injection token.
     */
    hasErrors() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._getIconState()) === 'error';
        });
    }
    /** Whether the step is optional. */
    isOptional() {
        return __awaiter(this, void 0, void 0, function* () {
            // If the node with the optional text is present, it means that the step is optional.
            const optionalNode = yield this.locatorForOptional('.mat-step-optional')();
            return !!optionalNode;
        });
    }
    /**
     * Selects the given step by clicking on the label. The step may not be selected
     * if the stepper doesn't allow it (e.g. if there are validation errors).
     */
    select() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.host()).click();
        });
    }
    getRootHarnessLoader() {
        return __awaiter(this, void 0, void 0, function* () {
            const contentId = yield (yield this.host()).getAttribute('aria-controls');
            return this.documentRootLocatorFactory().harnessLoaderFor(`#${contentId}`);
        });
    }
    /**
     * Gets the state of the step. Note that we have a `StepState` which we could use to type the
     * return value, but it's basically the same as `string`, because the type has `| string`.
     */
    _getIconState() {
        return __awaiter(this, void 0, void 0, function* () {
            // The state is exposed on the icon with a class that looks like `mat-step-icon-state-{{state}}`
            const icon = yield this.locatorFor('.mat-step-icon')();
            const classes = (yield icon.getAttribute('class'));
            const match = classes.match(/mat-step-icon-state-([a-z]+)/);
            if (!match) {
                throw Error(`Could not determine step state from "${classes}".`);
            }
            return match[1];
        });
    }
}
/** The selector for the host element of a `MatStep` instance. */
MatStepHarness.hostSelector = '.mat-step-header';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3N0ZXBwZXIvdGVzdGluZy9zdGVwLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFDTCxnQ0FBZ0MsRUFDaEMsZ0JBQWdCLEdBRWpCLE1BQU0sc0JBQXNCLENBQUM7QUFHOUIsOEVBQThFO0FBQzlFLE1BQU0sT0FBTyxjQUFlLFNBQVEsZ0NBQXdDO0lBSTFFOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUE4QixFQUFFO1FBQzFDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO2FBQy9DLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFDN0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2pGLFNBQVMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFDbkMsQ0FBTyxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsZ0RBQUMsT0FBQSxDQUFDLE1BQU0sT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssUUFBUSxDQUFBLEdBQUEsQ0FBQzthQUMxRSxTQUFTLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxTQUFTLEVBQ3JDLENBQU8sT0FBTyxFQUFFLFNBQVMsRUFBRSxFQUFFLGdEQUFDLE9BQUEsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLFNBQVMsQ0FBQSxHQUFBLENBQUM7YUFDN0UsU0FBUyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUNqQyxDQUFPLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxnREFBQyxP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eXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzLFxuICBIYXJuZXNzUHJlZGljYXRlLFxuICBIYXJuZXNzTG9hZGVyLFxufSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge1N0ZXBIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9zdGVwLWhhcm5lc3MtZmlsdGVycyc7XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgc3RhbmRhcmQgQW5ndWxhciBNYXRlcmlhbCBzdGVwIGluIHRlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIE1hdFN0ZXBIYXJuZXNzIGV4dGVuZHMgQ29udGVudENvbnRhaW5lckNvbXBvbmVudEhhcm5lc3M8c3RyaW5nPiB7XG4gIC8qKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBob3N0IGVsZW1lbnQgb2YgYSBgTWF0U3RlcGAgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1zdGVwLWhlYWRlcic7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYE1hdFN0ZXBIYXJuZXNzYCB0aGF0IG1lZXRzXG4gICAqIGNlcnRhaW4gY3JpdGVyaWEuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBzdGVwcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IFN0ZXBIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRTdGVwSGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRTdGVwSGFybmVzcywgb3B0aW9ucylcbiAgICAgICAgLmFkZE9wdGlvbignbGFiZWwnLCBvcHRpb25zLmxhYmVsLFxuICAgICAgICAgICAgKGhhcm5lc3MsIGxhYmVsKSA9PiBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoaGFybmVzcy5nZXRMYWJlbCgpLCBsYWJlbCkpXG4gICAgICAgIC5hZGRPcHRpb24oJ3NlbGVjdGVkJywgb3B0aW9ucy5zZWxlY3RlZCxcbiAgICAgICAgICAgIGFzeW5jIChoYXJuZXNzLCBzZWxlY3RlZCkgPT4gKGF3YWl0IGhhcm5lc3MuaXNTZWxlY3RlZCgpKSA9PT0gc2VsZWN0ZWQpXG4gICAgICAgIC5hZGRPcHRpb24oJ2NvbXBsZXRlZCcsIG9wdGlvbnMuY29tcGxldGVkLFxuICAgICAgICAgICAgYXN5bmMgKGhhcm5lc3MsIGNvbXBsZXRlZCkgPT4gKGF3YWl0IGhhcm5lc3MuaXNDb21wbGV0ZWQoKSkgPT09IGNvbXBsZXRlZClcbiAgICAgICAgLmFkZE9wdGlvbignaW52YWxpZCcsIG9wdGlvbnMuaW52YWxpZCxcbiAgICAgICAgICAgIGFzeW5jIChoYXJuZXNzLCBpbnZhbGlkKSA9PiAoYXdhaXQgaGFybmVzcy5oYXNFcnJvcnMoKSkgPT09IGludmFsaWQpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGxhYmVsIG9mIHRoZSBzdGVwLiAqL1xuICBhc3luYyBnZXRMYWJlbCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5sb2NhdG9yRm9yKCcubWF0LXN0ZXAtdGV4dC1sYWJlbCcpKCkpLnRleHQoKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBgYXJpYS1sYWJlbGAgb2YgdGhlIHN0ZXAuICovXG4gIGFzeW5jIGdldEFyaWFMYWJlbCgpOiBQcm9taXNlPHN0cmluZ3xudWxsPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuZ2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdmFsdWUgb2YgdGhlIGBhcmlhLWxhYmVsbGVkYnlgIGF0dHJpYnV0ZS4gKi9cbiAgYXN5bmMgZ2V0QXJpYUxhYmVsbGVkYnkoKTogUHJvbWlzZTxzdHJpbmd8bnVsbD4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5Jyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgc3RlcCBpcyBzZWxlY3RlZC4gKi9cbiAgYXN5bmMgaXNTZWxlY3RlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBob3N0ID0gYXdhaXQgdGhpcy5ob3N0KCk7XG4gICAgcmV0dXJuIChhd2FpdCBob3N0LmdldEF0dHJpYnV0ZSgnYXJpYS1zZWxlY3RlZCcpKSA9PT0gJ3RydWUnO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHN0ZXAgaGFzIGJlZW4gZmlsbGVkIG91dC4gKi9cbiAgYXN5bmMgaXNDb21wbGV0ZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgc3RhdGUgPSBhd2FpdCB0aGlzLl9nZXRJY29uU3RhdGUoKTtcbiAgICByZXR1cm4gc3RhdGUgPT09ICdkb25lJyB8fCAoc3RhdGUgPT09ICdlZGl0JyAmJiAhKGF3YWl0IHRoaXMuaXNTZWxlY3RlZCgpKSk7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGUgc3RlcCBpcyBjdXJyZW50bHkgc2hvd2luZyBpdHMgZXJyb3Igc3RhdGUuIE5vdGUgdGhhdCB0aGlzIGRvZXNuJ3QgbWVhbiB0aGF0IHRoZXJlXG4gICAqIGFyZSBvciBhcmVuJ3QgYW55IGludmFsaWQgZm9ybSBjb250cm9scyBpbnNpZGUgdGhlIHN0ZXAsIGJ1dCB0aGF0IHRoZSBzdGVwIGlzIHNob3dpbmcgaXRzXG4gICAqIGVycm9yLXNwZWNpZmljIHN0eWxpbmcgd2hpY2ggZGVwZW5kcyBvbiB0aGVyZSBiZWluZyBpbnZhbGlkIGNvbnRyb2xzLCBhcyB3ZWxsIGFzIHRoZVxuICAgKiBgRXJyb3JTdGF0ZU1hdGNoZXJgIGRldGVybWluaW5nIHRoYXQgYW4gZXJyb3Igc2hvdWxkIGJlIHNob3duIGFuZCB0aGF0IHRoZSBgc2hvd0Vycm9yc2BcbiAgICogb3B0aW9uIHdhcyBlbmFibGVkIHRocm91Z2ggdGhlIGBTVEVQUEVSX0dMT0JBTF9PUFRJT05TYCBpbmplY3Rpb24gdG9rZW4uXG4gICAqL1xuICBhc3luYyBoYXNFcnJvcnMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9nZXRJY29uU3RhdGUoKSkgPT09ICdlcnJvcic7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgc3RlcCBpcyBvcHRpb25hbC4gKi9cbiAgYXN5bmMgaXNPcHRpb25hbCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAvLyBJZiB0aGUgbm9kZSB3aXRoIHRoZSBvcHRpb25hbCB0ZXh0IGlzIHByZXNlbnQsIGl0IG1lYW5zIHRoYXQgdGhlIHN0ZXAgaXMgb3B0aW9uYWwuXG4gICAgY29uc3Qgb3B0aW9uYWxOb2RlID0gYXdhaXQgdGhpcy5sb2NhdG9yRm9yT3B0aW9uYWwoJy5tYXQtc3RlcC1vcHRpb25hbCcpKCk7XG4gICAgcmV0dXJuICEhb3B0aW9uYWxOb2RlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdHMgdGhlIGdpdmVuIHN0ZXAgYnkgY2xpY2tpbmcgb24gdGhlIGxhYmVsLiBUaGUgc3RlcCBtYXkgbm90IGJlIHNlbGVjdGVkXG4gICAqIGlmIHRoZSBzdGVwcGVyIGRvZXNuJ3QgYWxsb3cgaXQgKGUuZy4gaWYgdGhlcmUgYXJlIHZhbGlkYXRpb24gZXJyb3JzKS5cbiAgICovXG4gIGFzeW5jIHNlbGVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmNsaWNrKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0Um9vdEhhcm5lc3NMb2FkZXIoKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyPiB7XG4gICAgY29uc3QgY29udGVudElkID0gYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKTtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudFJvb3RMb2NhdG9yRmFjdG9yeSgpLmhhcm5lc3NMb2FkZXJGb3IoYCMke2NvbnRlbnRJZH1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBzdGF0ZSBvZiB0aGUgc3RlcC4gTm90ZSB0aGF0IHdlIGhhdmUgYSBgU3RlcFN0YXRlYCB3aGljaCB3ZSBjb3VsZCB1c2UgdG8gdHlwZSB0aGVcbiAgICogcmV0dXJuIHZhbHVlLCBidXQgaXQncyBiYXNpY2FsbHkgdGhlIHNhbWUgYXMgYHN0cmluZ2AsIGJlY2F1c2UgdGhlIHR5cGUgaGFzIGB8IHN0cmluZ2AuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRJY29uU3RhdGUoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAvLyBUaGUgc3RhdGUgaXMgZXhwb3NlZCBvbiB0aGUgaWNvbiB3aXRoIGEgY2xhc3MgdGhhdCBsb29rcyBsaWtlIGBtYXQtc3RlcC1pY29uLXN0YXRlLXt7c3RhdGV9fWBcbiAgICBjb25zdCBpY29uID0gYXdhaXQgdGhpcy5sb2NhdG9yRm9yKCcubWF0LXN0ZXAtaWNvbicpKCk7XG4gICAgY29uc3QgY2xhc3NlcyA9IChhd2FpdCBpY29uLmdldEF0dHJpYnV0ZSgnY2xhc3MnKSkhO1xuICAgIGNvbnN0IG1hdGNoID0gY2xhc3Nlcy5tYXRjaCgvbWF0LXN0ZXAtaWNvbi1zdGF0ZS0oW2Etel0rKS8pO1xuXG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgdGhyb3cgRXJyb3IoYENvdWxkIG5vdCBkZXRlcm1pbmUgc3RlcCBzdGF0ZSBmcm9tIFwiJHtjbGFzc2VzfVwiLmApO1xuICAgIH1cblxuICAgIHJldHVybiBtYXRjaFsxXTtcbiAgfVxufVxuIl19