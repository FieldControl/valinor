/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ContentContainerComponentHarness, HarnessPredicate, } from '@angular/cdk/testing';
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
/** Harness for interacting with a standard Angular Material tree node. */
export class MatTreeNodeHarness extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._toggle = this.locatorForOptional('[matTreeNodeToggle]');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a tree node with specific attributes.
     * @param options Options for narrowing the search
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return getNodePredicate(MatTreeNodeHarness, options);
    }
    /** Whether the tree node is expanded. */
    isExpanded() {
        return __awaiter(this, void 0, void 0, function* () {
            return coerceBooleanProperty(yield (yield this.host()).getAttribute('aria-expanded'));
        });
    }
    /** Whether the tree node is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return coerceBooleanProperty(yield (yield this.host()).getProperty('aria-disabled'));
        });
    }
    /** Gets the level of the tree node. Note that this gets the aria-level and is 1 indexed. */
    getLevel() {
        return __awaiter(this, void 0, void 0, function* () {
            return coerceNumberProperty(yield (yield this.host()).getAttribute('aria-level'));
        });
    }
    /** Gets the tree node's text. */
    getText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).text({ exclude: '.mat-tree-node, .mat-nested-tree-node, button' });
        });
    }
    /** Toggles node between expanded/collapsed. Only works when node is not disabled. */
    toggle() {
        return __awaiter(this, void 0, void 0, function* () {
            const toggle = yield this._toggle();
            if (toggle) {
                return toggle.click();
            }
        });
    }
    /** Expands the node if it is collapsed. Only works when node is not disabled. */
    expand() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isExpanded())) {
                yield this.toggle();
            }
        });
    }
    /** Collapses the node if it is expanded. Only works when node is not disabled. */
    collapse() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isExpanded()) {
                yield this.toggle();
            }
        });
    }
}
/** The selector of the host element of a `MatTreeNode` instance. */
MatTreeNodeHarness.hostSelector = '.mat-tree-node, .mat-nested-tree-node';
function getNodePredicate(type, options) {
    return new HarnessPredicate(type, options)
        .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
        .addOption('disabled', options.disabled, (harness, disabled) => __awaiter(this, void 0, void 0, function* () { return (yield harness.isDisabled()) === disabled; }))
        .addOption('expanded', options.expanded, (harness, expanded) => __awaiter(this, void 0, void 0, function* () { return (yield harness.isExpanded()) === expanded; }))
        .addOption('level', options.level, (harness, level) => __awaiter(this, void 0, void 0, function* () { return (yield harness.getLevel()) === level; }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3RyZWUvdGVzdGluZy9ub2RlLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFFTCxnQ0FBZ0MsRUFDaEMsZ0JBQWdCLEdBQ2pCLE1BQU0sc0JBQXNCLENBQUM7QUFFOUIsT0FBTyxFQUFDLHFCQUFxQixFQUFFLG9CQUFvQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFbEYsMEVBQTBFO0FBQzFFLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxnQ0FBd0M7SUFBaEY7O1FBSUUsWUFBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBb0QzRCxDQUFDO0lBbERDOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQWtDLEVBQUU7UUFDOUMsT0FBTyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQseUNBQXlDO0lBQ25DLFVBQVU7O1lBQ2QsT0FBTyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUN4RixDQUFDO0tBQUE7SUFFRCx5Q0FBeUM7SUFDbkMsVUFBVTs7WUFDZCxPQUFPLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7S0FBQTtJQUVELDRGQUE0RjtJQUN0RixRQUFROztZQUNaLE9BQU8sb0JBQW9CLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDcEYsQ0FBQztLQUFBO0lBRUQsaUNBQWlDO0lBQzNCLE9BQU87O1lBQ1gsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFFLCtDQUErQyxFQUFDLENBQUMsQ0FBQztRQUM5RixDQUFDO0tBQUE7SUFFRCxxRkFBcUY7SUFDL0UsTUFBTTs7WUFDVixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNwQyxJQUFJLE1BQU0sRUFBRTtnQkFDVixPQUFPLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUN2QjtRQUNILENBQUM7S0FBQTtJQUVELGlGQUFpRjtJQUMzRSxNQUFNOztZQUNWLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUU7Z0JBQzlCLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ3JCO1FBQ0gsQ0FBQztLQUFBO0lBRUQsa0ZBQWtGO0lBQzVFLFFBQVE7O1lBQ1osSUFBSSxNQUFNLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDM0IsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDckI7UUFDSCxDQUFDO0tBQUE7O0FBdERELG9FQUFvRTtBQUM3RCwrQkFBWSxHQUFHLHVDQUF1QyxDQUFDO0FBd0RoRSxTQUFTLGdCQUFnQixDQUN2QixJQUFvQyxFQUNwQyxPQUErQjtJQUMvQixPQUFPLElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztTQUN2QyxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQzdCLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM1RSxTQUFTLENBQ1IsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQzVCLENBQU8sT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLGdEQUFDLE9BQUEsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLFFBQVEsQ0FBQSxHQUFBLENBQUM7U0FDeEUsU0FBUyxDQUNSLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUM1QixDQUFPLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxnREFBQyxPQUFBLENBQUMsTUFBTSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxRQUFRLENBQUEsR0FBQSxDQUFDO1NBQ3hFLFNBQVMsQ0FDUixPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFDdEIsQ0FBTyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsZ0RBQUMsT0FBQSxDQUFDLE1BQU0sT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssS0FBSyxDQUFBLEdBQUEsQ0FBQyxDQUFDO0FBQ3RFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yLFxuICBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzcyxcbiAgSGFybmVzc1ByZWRpY2F0ZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xuaW1wb3J0IHtUcmVlTm9kZUhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL3RyZWUtaGFybmVzcy1maWx0ZXJzJztcbmltcG9ydCB7Y29lcmNlQm9vbGVhblByb3BlcnR5LCBjb2VyY2VOdW1iZXJQcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBBbmd1bGFyIE1hdGVyaWFsIHRyZWUgbm9kZS4gKi9cbmV4cG9ydCBjbGFzcyBNYXRUcmVlTm9kZUhhcm5lc3MgZXh0ZW5kcyBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzczxzdHJpbmc+IHtcbiAgLyoqIFRoZSBzZWxlY3RvciBvZiB0aGUgaG9zdCBlbGVtZW50IG9mIGEgYE1hdFRyZWVOb2RlYCBpbnN0YW5jZS4gKi9cbiAgc3RhdGljIGhvc3RTZWxlY3RvciA9ICcubWF0LXRyZWUtbm9kZSwgLm1hdC1uZXN0ZWQtdHJlZS1ub2RlJztcblxuICBfdG9nZ2xlID0gdGhpcy5sb2NhdG9yRm9yT3B0aW9uYWwoJ1ttYXRUcmVlTm9kZVRvZ2dsZV0nKTtcblxuICAvKipcbiAgICogR2V0cyBhIGBIYXJuZXNzUHJlZGljYXRlYCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNlYXJjaCBmb3IgYSB0cmVlIG5vZGUgd2l0aCBzcGVjaWZpYyBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBuYXJyb3dpbmcgdGhlIHNlYXJjaFxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IFRyZWVOb2RlSGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0VHJlZU5vZGVIYXJuZXNzPiB7XG4gICAgcmV0dXJuIGdldE5vZGVQcmVkaWNhdGUoTWF0VHJlZU5vZGVIYXJuZXNzLCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSB0cmVlIG5vZGUgaXMgZXhwYW5kZWQuICovXG4gIGFzeW5jIGlzRXhwYW5kZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1leHBhbmRlZCcpKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSB0cmVlIG5vZGUgaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIGlzRGlzYWJsZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShhd2FpdCAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldFByb3BlcnR5KCdhcmlhLWRpc2FibGVkJykpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGxldmVsIG9mIHRoZSB0cmVlIG5vZGUuIE5vdGUgdGhhdCB0aGlzIGdldHMgdGhlIGFyaWEtbGV2ZWwgYW5kIGlzIDEgaW5kZXhlZC4gKi9cbiAgYXN5bmMgZ2V0TGV2ZWwoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICByZXR1cm4gY29lcmNlTnVtYmVyUHJvcGVydHkoYXdhaXQgKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtbGV2ZWwnKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdHJlZSBub2RlJ3MgdGV4dC4gKi9cbiAgYXN5bmMgZ2V0VGV4dCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLnRleHQoe2V4Y2x1ZGU6ICcubWF0LXRyZWUtbm9kZSwgLm1hdC1uZXN0ZWQtdHJlZS1ub2RlLCBidXR0b24nfSk7XG4gIH1cblxuICAvKiogVG9nZ2xlcyBub2RlIGJldHdlZW4gZXhwYW5kZWQvY29sbGFwc2VkLiBPbmx5IHdvcmtzIHdoZW4gbm9kZSBpcyBub3QgZGlzYWJsZWQuICovXG4gIGFzeW5jIHRvZ2dsZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB0b2dnbGUgPSBhd2FpdCB0aGlzLl90b2dnbGUoKTtcbiAgICBpZiAodG9nZ2xlKSB7XG4gICAgICByZXR1cm4gdG9nZ2xlLmNsaWNrKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEV4cGFuZHMgdGhlIG5vZGUgaWYgaXQgaXMgY29sbGFwc2VkLiBPbmx5IHdvcmtzIHdoZW4gbm9kZSBpcyBub3QgZGlzYWJsZWQuICovXG4gIGFzeW5jIGV4cGFuZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLmlzRXhwYW5kZWQoKSkpIHtcbiAgICAgIGF3YWl0IHRoaXMudG9nZ2xlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENvbGxhcHNlcyB0aGUgbm9kZSBpZiBpdCBpcyBleHBhbmRlZC4gT25seSB3b3JrcyB3aGVuIG5vZGUgaXMgbm90IGRpc2FibGVkLiAqL1xuICBhc3luYyBjb2xsYXBzZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoYXdhaXQgdGhpcy5pc0V4cGFuZGVkKCkpIHtcbiAgICAgIGF3YWl0IHRoaXMudG9nZ2xlKCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldE5vZGVQcmVkaWNhdGU8VCBleHRlbmRzIE1hdFRyZWVOb2RlSGFybmVzcz4oXG4gIHR5cGU6IENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxUPixcbiAgb3B0aW9uczogVHJlZU5vZGVIYXJuZXNzRmlsdGVycyk6IEhhcm5lc3NQcmVkaWNhdGU8VD4ge1xuICByZXR1cm4gbmV3IEhhcm5lc3NQcmVkaWNhdGUodHlwZSwgb3B0aW9ucylcbiAgICAuYWRkT3B0aW9uKCd0ZXh0Jywgb3B0aW9ucy50ZXh0LFxuICAgICAgKGhhcm5lc3MsIHRleHQpID0+IEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldFRleHQoKSwgdGV4dCkpXG4gICAgLmFkZE9wdGlvbihcbiAgICAgICdkaXNhYmxlZCcsIG9wdGlvbnMuZGlzYWJsZWQsXG4gICAgICBhc3luYyAoaGFybmVzcywgZGlzYWJsZWQpID0+IChhd2FpdCBoYXJuZXNzLmlzRGlzYWJsZWQoKSkgPT09IGRpc2FibGVkKVxuICAgIC5hZGRPcHRpb24oXG4gICAgICAnZXhwYW5kZWQnLCBvcHRpb25zLmV4cGFuZGVkLFxuICAgICAgYXN5bmMgKGhhcm5lc3MsIGV4cGFuZGVkKSA9PiAoYXdhaXQgaGFybmVzcy5pc0V4cGFuZGVkKCkpID09PSBleHBhbmRlZClcbiAgICAuYWRkT3B0aW9uKFxuICAgICAgJ2xldmVsJywgb3B0aW9ucy5sZXZlbCxcbiAgICAgIGFzeW5jIChoYXJuZXNzLCBsZXZlbCkgPT4gKGF3YWl0IGhhcm5lc3MuZ2V0TGV2ZWwoKSkgPT09IGxldmVsKTtcbn1cbiJdfQ==