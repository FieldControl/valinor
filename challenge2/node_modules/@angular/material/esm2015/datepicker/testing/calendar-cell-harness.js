/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { HarnessPredicate, ComponentHarness } from '@angular/cdk/testing';
/** Harness for interacting with a standard Material calendar cell in tests. */
export class MatCalendarCellHarness extends ComponentHarness {
    constructor() {
        super(...arguments);
        /** Reference to the inner content element inside the cell. */
        this._content = this.locatorFor('.mat-calendar-body-cell-content');
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatCalendarCellHarness`
     * that meets certain criteria.
     * @param options Options for filtering which cell instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatCalendarCellHarness, options)
            .addOption('text', options.text, (harness, text) => {
            return HarnessPredicate.stringMatches(harness.getText(), text);
        })
            .addOption('selected', options.selected, (harness, selected) => __awaiter(this, void 0, void 0, function* () {
            return (yield harness.isSelected()) === selected;
        }))
            .addOption('active', options.active, (harness, active) => __awaiter(this, void 0, void 0, function* () {
            return (yield harness.isActive()) === active;
        }))
            .addOption('disabled', options.disabled, (harness, disabled) => __awaiter(this, void 0, void 0, function* () {
            return (yield harness.isDisabled()) === disabled;
        }))
            .addOption('today', options.today, (harness, today) => __awaiter(this, void 0, void 0, function* () {
            return (yield harness.isToday()) === today;
        }))
            .addOption('inRange', options.inRange, (harness, inRange) => __awaiter(this, void 0, void 0, function* () {
            return (yield harness.isInRange()) === inRange;
        }))
            .addOption('inComparisonRange', options.inComparisonRange, (harness, inComparisonRange) => __awaiter(this, void 0, void 0, function* () {
            return (yield harness.isInComparisonRange()) === inComparisonRange;
        }))
            .addOption('inPreviewRange', options.inPreviewRange, (harness, inPreviewRange) => __awaiter(this, void 0, void 0, function* () {
            return (yield harness.isInPreviewRange()) === inPreviewRange;
        }));
    }
    /** Gets the text of the calendar cell. */
    getText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._content()).text();
        });
    }
    /** Gets the aria-label of the calendar cell. */
    getAriaLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            // We're guaranteed for the `aria-label` to be defined
            // since this is a private element that we control.
            return (yield this.host()).getAttribute('aria-label');
        });
    }
    /** Whether the cell is selected. */
    isSelected() {
        return __awaiter(this, void 0, void 0, function* () {
            const host = yield this.host();
            return (yield host.getAttribute('aria-selected')) === 'true';
        });
    }
    /** Whether the cell is disabled. */
    isDisabled() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._hasState('disabled');
        });
    }
    /** Whether the cell is currently activated using keyboard navigation. */
    isActive() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._hasState('active');
        });
    }
    /** Whether the cell represents today's date. */
    isToday() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._content()).hasClass('mat-calendar-body-today');
        });
    }
    /** Selects the calendar cell. Won't do anything if the cell is disabled. */
    select() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).click();
        });
    }
    /** Hovers over the calendar cell. */
    hover() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hover();
        });
    }
    /** Moves the mouse away from the calendar cell. */
    mouseAway() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).mouseAway();
        });
    }
    /** Focuses the calendar cell. */
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).focus();
        });
    }
    /** Removes focus from the calendar cell. */
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).blur();
        });
    }
    /** Whether the cell is the start of the main range. */
    isRangeStart() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._hasState('range-start');
        });
    }
    /** Whether the cell is the end of the main range. */
    isRangeEnd() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._hasState('range-end');
        });
    }
    /** Whether the cell is part of the main range. */
    isInRange() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._hasState('in-range');
        });
    }
    /** Whether the cell is the start of the comparison range. */
    isComparisonRangeStart() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._hasState('comparison-start');
        });
    }
    /** Whether the cell is the end of the comparison range. */
    isComparisonRangeEnd() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._hasState('comparison-end');
        });
    }
    /** Whether the cell is inside of the comparison range. */
    isInComparisonRange() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._hasState('in-comparison-range');
        });
    }
    /** Whether the cell is the start of the preview range. */
    isPreviewRangeStart() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._hasState('preview-start');
        });
    }
    /** Whether the cell is the end of the preview range. */
    isPreviewRangeEnd() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._hasState('preview-end');
        });
    }
    /** Whether the cell is inside of the preview range. */
    isInPreviewRange() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._hasState('in-preview');
        });
    }
    /** Returns whether the cell has a particular CSS class-based state. */
    _hasState(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass(`mat-calendar-body-${name}`);
        });
    }
}
MatCalendarCellHarness.hostSelector = '.mat-calendar-body-cell';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXItY2VsbC1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RhdGVwaWNrZXIvdGVzdGluZy9jYWxlbmRhci1jZWxsLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBR3hFLCtFQUErRTtBQUMvRSxNQUFNLE9BQU8sc0JBQXVCLFNBQVEsZ0JBQWdCO0lBQTVEOztRQUdFLDhEQUE4RDtRQUN0RCxhQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0lBZ0p4RSxDQUFDO0lBOUlDOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFzQyxFQUFFO1FBQ2xELE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLENBQUM7YUFDekQsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ2pELE9BQU8sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRSxDQUFDLENBQUM7YUFDRCxTQUFTLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBTyxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUU7WUFDbkUsT0FBTyxDQUFDLE1BQU0sT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssUUFBUSxDQUFDO1FBQ25ELENBQUMsQ0FBQSxDQUFDO2FBQ0QsU0FBUyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQU8sT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzdELE9BQU8sQ0FBQyxNQUFN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QyxDQUFDO0tBQUE7SUFFRCx3REFBd0Q7SUFDbEQsaUJBQWlCOztZQUNyQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkMsQ0FBQztLQUFBO0lBRUQsdURBQXVEO0lBQ2pELGdCQUFnQjs7WUFDcEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RDLENBQUM7S0FBQTtJQUVELHVFQUF1RTtJQUN6RCxTQUFTLENBQUMsSUFBWTs7WUFDbEMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLHFCQUFxQixJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ25FLENBQUM7S0FBQTs7QUFsSk0sbUNBQVksR0FBRyx5QkFBeUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0hhcm5lc3NQcmVkaWNhdGUsIENvbXBvbmVudEhhcm5lc3N9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7Q2FsZW5kYXJDZWxsSGFybmVzc0ZpbHRlcnN9IGZyb20gJy4vZGF0ZXBpY2tlci1oYXJuZXNzLWZpbHRlcnMnO1xuXG4vKiogSGFybmVzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIHN0YW5kYXJkIE1hdGVyaWFsIGNhbGVuZGFyIGNlbGwgaW4gdGVzdHMuICovXG5leHBvcnQgY2xhc3MgTWF0Q2FsZW5kYXJDZWxsSGFybmVzcyBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtY2FsZW5kYXItYm9keS1jZWxsJztcblxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSBpbm5lciBjb250ZW50IGVsZW1lbnQgaW5zaWRlIHRoZSBjZWxsLiAqL1xuICBwcml2YXRlIF9jb250ZW50ID0gdGhpcy5sb2NhdG9yRm9yKCcubWF0LWNhbGVuZGFyLWJvZHktY2VsbC1jb250ZW50Jyk7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYE1hdENhbGVuZGFyQ2VsbEhhcm5lc3NgXG4gICAqIHRoYXQgbWVldHMgY2VydGFpbiBjcml0ZXJpYS5cbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyBmb3IgZmlsdGVyaW5nIHdoaWNoIGNlbGwgaW5zdGFuY2VzIGFyZSBjb25zaWRlcmVkIGEgbWF0Y2guXG4gICAqIEByZXR1cm4gYSBgSGFybmVzc1ByZWRpY2F0ZWAgY29uZmlndXJlZCB3aXRoIHRoZSBnaXZlbiBvcHRpb25zLlxuICAgKi9cbiAgc3RhdGljIHdpdGgob3B0aW9uczogQ2FsZW5kYXJDZWxsSGFybmVzc0ZpbHRlcnMgPSB7fSk6IEhhcm5lc3NQcmVkaWNhdGU8TWF0Q2FsZW5kYXJDZWxsSGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRDYWxlbmRhckNlbGxIYXJuZXNzLCBvcHRpb25zKVxuICAgICAgLmFkZE9wdGlvbigndGV4dCcsIG9wdGlvbnMudGV4dCwgKGhhcm5lc3MsIHRleHQpID0+IHtcbiAgICAgICAgcmV0dXJuIEhhcm5lc3NQcmVkaWNhdGUuc3RyaW5nTWF0Y2hlcyhoYXJuZXNzLmdldFRleHQoKSwgdGV4dCk7XG4gICAgICB9KVxuICAgICAgLmFkZE9wdGlvbignc2VsZWN0ZWQnLCBvcHRpb25zLnNlbGVjdGVkLCBhc3luYyAoaGFybmVzcywgc2VsZWN0ZWQpID0+IHtcbiAgICAgICAgcmV0dXJuIChhd2FpdCBoYXJuZXNzLmlzU2VsZWN0ZWQoKSkgPT09IHNlbGVjdGVkO1xuICAgICAgfSlcbiAgICAgIC5hZGRPcHRpb24oJ2FjdGl2ZScsIG9wdGlvbnMuYWN0aXZlLCBhc3luYyAoaGFybmVzcywgYWN0aXZlKSA9PiB7XG4gICAgICAgIHJldHVybiAoYXdhaXQgaGFybmVzcy5pc0FjdGl2ZSgpKSA9PT0gYWN0aXZlO1xuICAgICAgfSlcbiAgICAgIC5hZGRPcHRpb24oJ2Rpc2FibGVkJywgb3B0aW9ucy5kaXNhYmxlZCwgYXN5bmMgKGhhcm5lc3MsIGRpc2FibGVkKSA9PiB7XG4gICAgICAgIHJldHVybiAoYXdhaXQgaGFybmVzcy5pc0Rpc2FibGVkKCkpID09PSBkaXNhYmxlZDtcbiAgICAgIH0pXG4gICAgICAuYWRkT3B0aW9uKCd0b2RheScsIG9wdGlvbnMudG9kYXksIGFzeW5jIChoYXJuZXNzLCB0b2RheSkgPT4ge1xuICAgICAgICByZXR1cm4gKGF3YWl0IGhhcm5lc3MuaXNUb2RheSgpKSA9PT0gdG9kYXk7XG4gICAgICB9KVxuICAgICAgLmFkZE9wdGlvbignaW5SYW5nZScsIG9wdGlvbnMuaW5SYW5nZSwgYXN5bmMgKGhhcm5lc3MsIGluUmFuZ2UpID0+IHtcbiAgICAgICAgcmV0dXJuIChhd2FpdCBoYXJuZXNzLmlzSW5SYW5nZSgpKSA9PT0gaW5SYW5nZTtcbiAgICAgIH0pXG4gICAgICAuYWRkT3B0aW9uKCdpbkNvbXBhcmlzb25SYW5nZScsIG9wdGlvbnMuaW5Db21wYXJpc29uUmFuZ2UsXG4gICAgICAgICAgYXN5bmMgKGhhcm5lc3MsIGluQ29tcGFyaXNvblJhbmdlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGhhcm5lc3MuaXNJbkNvbXBhcmlzb25SYW5nZSgpKSA9PT0gaW5Db21wYXJpc29uUmFuZ2U7XG4gICAgICAgICAgfSlcbiAgICAgIC5hZGRPcHRpb24oJ2luUHJldmlld1JhbmdlJywgb3B0aW9ucy5pblByZXZpZXdSYW5nZSwgYXN5bmMgKGhhcm5lc3MsIGluUHJldmlld1JhbmdlKSA9PiB7XG4gICAgICAgIHJldHVybiAoYXdhaXQgaGFybmVzcy5pc0luUHJldmlld1JhbmdlKCkpID09PSBpblByZXZpZXdSYW5nZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHRleHQgb2YgdGhlIGNhbGVuZGFyIGNlbGwuICovXG4gIGFzeW5jIGdldFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2NvbnRlbnQoKSkudGV4dCgpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGFyaWEtbGFiZWwgb2YgdGhlIGNhbGVuZGFyIGNlbGwuICovXG4gIGFzeW5jIGdldEFyaWFMYWJlbCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIC8vIFdlJ3JlIGd1YXJhbnRlZWQgZm9yIHRoZSBgYXJpYS1sYWJlbGAgdG8gYmUgZGVmaW5lZFxuICAgIC8vIHNpbmNlIHRoaXMgaXMgYSBwcml2YXRlIGVsZW1lbnQgdGhhdCB3ZSBjb250cm9sLlxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmdldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbCcpIGFzIFByb21pc2U8c3RyaW5nPjtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBjZWxsIGlzIHNlbGVjdGVkLiAqL1xuICBhc3luYyBpc1NlbGVjdGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGhvc3QgPSBhd2FpdCB0aGlzLmhvc3QoKTtcbiAgICByZXR1cm4gKGF3YWl0IGhvc3QuZ2V0QXR0cmlidXRlKCdhcmlhLXNlbGVjdGVkJykpID09PSAndHJ1ZSc7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2VsbCBpcyBkaXNhYmxlZC4gKi9cbiAgYXN5bmMgaXNEaXNhYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5faGFzU3RhdGUoJ2Rpc2FibGVkJyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2VsbCBpcyBjdXJyZW50bHkgYWN0aXZhdGVkIHVzaW5nIGtleWJvYXJkIG5hdmlnYXRpb24uICovXG4gIGFzeW5jIGlzQWN0aXZlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9oYXNTdGF0ZSgnYWN0aXZlJyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2VsbCByZXByZXNlbnRzIHRvZGF5J3MgZGF0ZS4gKi9cbiAgYXN5bmMgaXNUb2RheSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2NvbnRlbnQoKSkuaGFzQ2xhc3MoJ21hdC1jYWxlbmRhci1ib2R5LXRvZGF5Jyk7XG4gIH1cblxuICAvKiogU2VsZWN0cyB0aGUgY2FsZW5kYXIgY2VsbC4gV29uJ3QgZG8gYW55dGhpbmcgaWYgdGhlIGNlbGwgaXMgZGlzYWJsZWQuICovXG4gIGFzeW5jIHNlbGVjdCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5jbGljaygpO1xuICB9XG5cbiAgLyoqIEhvdmVycyBvdmVyIHRoZSBjYWxlbmRhciBjZWxsLiAqL1xuICBhc3luYyBob3ZlcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5ob3ZlcigpO1xuICB9XG5cbiAgLyoqIE1vdmVzIHRoZSBtb3VzZSBhd2F5IGZyb20gdGhlIGNhbGVuZGFyIGNlbGwuICovXG4gIGFzeW5jIG1vdXNlQXdheSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5tb3VzZUF3YXkoKTtcbiAgfVxuXG4gIC8qKiBGb2N1c2VzIHRoZSBjYWxlbmRhciBjZWxsLiAqL1xuICBhc3luYyBmb2N1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5mb2N1cygpO1xuICB9XG5cbiAgLyoqIFJlbW92ZXMgZm9jdXMgZnJvbSB0aGUgY2FsZW5kYXIgY2VsbC4gKi9cbiAgYXN5bmMgYmx1cigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5ibHVyKCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2VsbCBpcyB0aGUgc3RhcnQgb2YgdGhlIG1haW4gcmFuZ2UuICovXG4gIGFzeW5jIGlzUmFuZ2VTdGFydCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5faGFzU3RhdGUoJ3JhbmdlLXN0YXJ0Jyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2VsbCBpcyB0aGUgZW5kIG9mIHRoZSBtYWluIHJhbmdlLiAqL1xuICBhc3luYyBpc1JhbmdlRW5kKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9oYXNTdGF0ZSgncmFuZ2UtZW5kJyk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgY2VsbCBpcyBwYXJ0IG9mIHRoZSBtYWluIHJhbmdlLiAqL1xuICBhc3luYyBpc0luUmFuZ2UoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hhc1N0YXRlKCdpbi1yYW5nZScpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNlbGwgaXMgdGhlIHN0YXJ0IG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBhc3luYyBpc0NvbXBhcmlzb25SYW5nZVN0YXJ0KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9oYXNTdGF0ZSgnY29tcGFyaXNvbi1zdGFydCcpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNlbGwgaXMgdGhlIGVuZCBvZiB0aGUgY29tcGFyaXNvbiByYW5nZS4gKi9cbiAgYXN5bmMgaXNDb21wYXJpc29uUmFuZ2VFbmQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hhc1N0YXRlKCdjb21wYXJpc29uLWVuZCcpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNlbGwgaXMgaW5zaWRlIG9mIHRoZSBjb21wYXJpc29uIHJhbmdlLiAqL1xuICBhc3luYyBpc0luQ29tcGFyaXNvblJhbmdlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9oYXNTdGF0ZSgnaW4tY29tcGFyaXNvbi1yYW5nZScpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNlbGwgaXMgdGhlIHN0YXJ0IG9mIHRoZSBwcmV2aWV3IHJhbmdlLiAqL1xuICBhc3luYyBpc1ByZXZpZXdSYW5nZVN0YXJ0KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9oYXNTdGF0ZSgncHJldmlldy1zdGFydCcpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNlbGwgaXMgdGhlIGVuZCBvZiB0aGUgcHJldmlldyByYW5nZS4gKi9cbiAgYXN5bmMgaXNQcmV2aWV3UmFuZ2VFbmQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hhc1N0YXRlKCdwcmV2aWV3LWVuZCcpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGNlbGwgaXMgaW5zaWRlIG9mIHRoZSBwcmV2aWV3IHJhbmdlLiAqL1xuICBhc3luYyBpc0luUHJldmlld1JhbmdlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9oYXNTdGF0ZSgnaW4tcHJldmlldycpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgd2hldGhlciB0aGUgY2VsbCBoYXMgYSBwYXJ0aWN1bGFyIENTUyBjbGFzcy1iYXNlZCBzdGF0ZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfaGFzU3RhdGUobmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmhvc3QoKSkuaGFzQ2xhc3MoYG1hdC1jYWxlbmRhci1ib2R5LSR7bmFtZX1gKTtcbiAgfVxufVxuIl19