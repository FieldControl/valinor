/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate, ContentContainerComponentHarness, parallel, } from '@angular/cdk/testing';
const iconSelector = '.mat-list-icon';
const avatarSelector = '.mat-list-avatar';
/**
 * Gets a `HarnessPredicate` that applies the given `BaseListItemHarnessFilters` to the given
 * list item harness.
 * @template H The type of list item harness to create a predicate for.
 * @param harnessType A constructor for a list item harness.
 * @param options An instance of `BaseListItemHarnessFilters` to apply.
 * @return A `HarnessPredicate` for the given harness type with the given options applied.
 */
export function getListItemPredicate(harnessType, options) {
    return new HarnessPredicate(harnessType, options)
        .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
}
/** Harness for interacting with a list subheader. */
export class MatSubheaderHarness extends ComponentHarness {
    static with(options = {}) {
        return new HarnessPredicate(MatSubheaderHarness, options)
            .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
    }
    /** Gets the full text content of the list item (including text from any font icons). */
    getText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).text();
        });
    }
}
MatSubheaderHarness.hostSelector = '.mat-subheader';
/**
 * Shared behavior among the harnesses for the various `MatListItem` flavors.
 * @docs-private
 */
export class MatListItemHarnessBase extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._lines = this.locatorForAll('.mat-line');
        this._avatar = this.locatorForOptional(avatarSelector);
        this._icon = this.locatorForOptional(iconSelector);
    }
    /** Gets the full text content of the list item. */
    getText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).text({ exclude: `${iconSelector}, ${avatarSelector}` });
        });
    }
    /** Gets the lines of text (`mat-line` elements) in this nav list item. */
    getLinesText() {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = yield this._lines();
            return parallel(() => lines.map(l => l.text()));
        });
    }
    /** Whether this list item has an avatar. */
    hasAvatar() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!(yield this._avatar());
        });
    }
    /** Whether this list item has an icon. */
    hasIcon() {
        return __awaiter(this, void 0, void 0, function* () {
            return !!(yield this._icon());
        });
    }
    /**
     * Gets a `HarnessLoader` used to get harnesses within the list item's content.
     * @deprecated Use `getChildLoader(MatListItemSection.CONTENT)` or `getHarness` instead.
     * @breaking-change 12.0.0
     */
    getHarnessLoaderForContent() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getChildLoader(".mat-list-item-content" /* CONTENT */);
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1pdGVtLWhhcm5lc3MtYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9saXN0L3Rlc3RpbmcvbGlzdC1pdGVtLWhhcm5lc3MtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUNMLGdCQUFnQixFQUdoQixnQkFBZ0IsRUFDaEIsZ0NBQWdDLEVBQ2hDLFFBQVEsR0FDVCxNQUFNLHNCQUFzQixDQUFDO0FBRzlCLE1BQU0sWUFBWSxHQUFHLGdCQUFnQixDQUFDO0FBQ3RDLE1BQU0sY0FBYyxHQUFHLGtCQUFrQixDQUFDO0FBRTFDOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsb0JBQW9CLENBQ2hDLFdBQTJDLEVBQzNDLE9BQW1DO0lBQ3JDLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDO1NBQzVDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksRUFDM0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdEYsQ0FBQztBQUVELHFEQUFxRDtBQUNyRCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsZ0JBQWdCO0lBR3ZELE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBbUMsRUFBRTtRQUMvQyxPQUFPLElBQUksZ0JBQWdCLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDO2FBQ3BELFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksRUFDM0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUVELHdGQUF3RjtJQUNsRixPQUFPOztZQUNYLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3BDLENBQUM7S0FBQTs7QUFYTSxnQ0FBWSxHQUFHLGdCQUFnQixDQUFDO0FBb0J6Qzs7O0dBR0c7QUFDSCxNQUFNLE9BQWdCLHNCQUNsQixTQUFRLGdDQUFvRDtJQURoRTs7UUFHVSxXQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN6QyxZQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ2xELFVBQUssR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUM7SUErQnhELENBQUM7SUE3QkMsbURBQW1EO0lBQzdDLE9BQU87O1lBQ1gsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFFLEdBQUcsWUFBWSxLQUFLLGNBQWMsRUFBRSxFQUFDLENBQUMsQ0FBQztRQUNuRixDQUFDO0tBQUE7SUFFRCwwRUFBMEU7SUFDcEUsWUFBWTs7WUFDaEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEMsT0FBTyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQztLQUFBO0lBRUQsNENBQTRDO0lBQ3RDLFNBQVM7O1lBQ2IsT0FBTyxDQUFDLENBQUMsQ0FBQSxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQSxDQUFDO1FBQ2hDLENBQUM7S0FBQTtJQUVELDBDQUEwQztJQUNwQyxPQUFPOztZQUNYLE9BQU8sQ0FBQyxDQUFDLENBQUEsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUEsQ0FBQztRQUM5QixDQUFDO0tBQUE7SUFFRDs7OztPQUlHO0lBQ0csMEJBQTBCOztZQUM5QixPQUFPLElBQUksQ0FBQyxjQUFjLHdDQUE0QixDQUFDO1FBQ3pELENBQUM7S0FBQTtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIENvbXBvbmVudEhhcm5lc3MsXG4gIENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcixcbiAgSGFybmVzc0xvYWRlcixcbiAgSGFybmVzc1ByZWRpY2F0ZSxcbiAgQ29udGVudENvbnRhaW5lckNvbXBvbmVudEhhcm5lc3MsXG4gIHBhcmFsbGVsLFxufSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XG5pbXBvcnQge0Jhc2VMaXN0SXRlbUhhcm5lc3NGaWx0ZXJzLCBTdWJoZWFkZXJIYXJuZXNzRmlsdGVyc30gZnJvbSAnLi9saXN0LWhhcm5lc3MtZmlsdGVycyc7XG5cbmNvbnN0IGljb25TZWxlY3RvciA9ICcubWF0LWxpc3QtaWNvbic7XG5jb25zdCBhdmF0YXJTZWxlY3RvciA9ICcubWF0LWxpc3QtYXZhdGFyJztcblxuLyoqXG4gKiBHZXRzIGEgYEhhcm5lc3NQcmVkaWNhdGVgIHRoYXQgYXBwbGllcyB0aGUgZ2l2ZW4gYEJhc2VMaXN0SXRlbUhhcm5lc3NGaWx0ZXJzYCB0byB0aGUgZ2l2ZW5cbiAqIGxpc3QgaXRlbSBoYXJuZXNzLlxuICogQHRlbXBsYXRlIEggVGhlIHR5cGUgb2YgbGlzdCBpdGVtIGhhcm5lc3MgdG8gY3JlYXRlIGEgcHJlZGljYXRlIGZvci5cbiAqIEBwYXJhbSBoYXJuZXNzVHlwZSBBIGNvbnN0cnVjdG9yIGZvciBhIGxpc3QgaXRlbSBoYXJuZXNzLlxuICogQHBhcmFtIG9wdGlvbnMgQW4gaW5zdGFuY2Ugb2YgYEJhc2VMaXN0SXRlbUhhcm5lc3NGaWx0ZXJzYCB0byBhcHBseS5cbiAqIEByZXR1cm4gQSBgSGFybmVzc1ByZWRpY2F0ZWAgZm9yIHRoZSBnaXZlbiBoYXJuZXNzIHR5cGUgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucyBhcHBsaWVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGlzdEl0ZW1QcmVkaWNhdGU8SCBleHRlbmRzIE1hdExpc3RJdGVtSGFybmVzc0Jhc2U+KFxuICAgIGhhcm5lc3NUeXBlOiBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8SD4sXG4gICAgb3B0aW9uczogQmFzZUxpc3RJdGVtSGFybmVzc0ZpbHRlcnMpOiBIYXJuZXNzUHJlZGljYXRlPEg+IHtcbiAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKGhhcm5lc3NUeXBlLCBvcHRpb25zKVxuICAgICAgLmFkZE9wdGlvbigndGV4dCcsIG9wdGlvbnMudGV4dCxcbiAgICAgICAgICAoaGFybmVzcywgdGV4dCkgPT4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VGV4dCgpLCB0ZXh0KSk7XG59XG5cbi8qKiBIYXJuZXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgbGlzdCBzdWJoZWFkZXIuICovXG5leHBvcnQgY2xhc3MgTWF0U3ViaGVhZGVySGFybmVzcyBleHRlbmRzIENvbXBvbmVudEhhcm5lc3Mge1xuICBzdGF0aWMgaG9zdFNlbGVjdG9yID0gJy5tYXQtc3ViaGVhZGVyJztcblxuICBzdGF0aWMgd2l0aChvcHRpb25zOiBTdWJoZWFkZXJIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRTdWJoZWFkZXJIYXJuZXNzPiB7XG4gICAgcmV0dXJuIG5ldyBIYXJuZXNzUHJlZGljYXRlKE1hdFN1YmhlYWRlckhhcm5lc3MsIG9wdGlvbnMpXG4gICAgICAgIC5hZGRPcHRpb24oJ3RleHQnLCBvcHRpb25zLnRleHQsXG4gICAgICAgICAgICAoaGFybmVzcywgdGV4dCkgPT4gSGFybmVzc1ByZWRpY2F0ZS5zdHJpbmdNYXRjaGVzKGhhcm5lc3MuZ2V0VGV4dCgpLCB0ZXh0KSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZnVsbCB0ZXh0IGNvbnRlbnQgb2YgdGhlIGxpc3QgaXRlbSAoaW5jbHVkaW5nIHRleHQgZnJvbSBhbnkgZm9udCBpY29ucykuICovXG4gIGFzeW5jIGdldFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS50ZXh0KCk7XG4gIH1cbn1cblxuLyoqIFNlbGVjdG9ycyBmb3IgdGhlIHZhcmlvdXMgbGlzdCBpdGVtIHNlY3Rpb25zIHRoYXQgbWF5IGNvbnRhaW4gdXNlciBjb250ZW50LiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gTWF0TGlzdEl0ZW1TZWN0aW9uIHtcbiAgQ09OVEVOVCA9ICcubWF0LWxpc3QtaXRlbS1jb250ZW50J1xuICAvLyBUT0RPKG1tYWxlcmJhKTogY29uc2lkZXIgYWRkaW5nIHNlY3Rpb25zIGZvciBsZWFkaW5nL3RyYWlsaW5nIGljb25zLlxufVxuXG4vKipcbiAqIFNoYXJlZCBiZWhhdmlvciBhbW9uZyB0aGUgaGFybmVzc2VzIGZvciB0aGUgdmFyaW91cyBgTWF0TGlzdEl0ZW1gIGZsYXZvcnMuXG4gKiBAZG9jcy1wcml2YXRlXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNYXRMaXN0SXRlbUhhcm5lc3NCYXNlXG4gICAgZXh0ZW5kcyBDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzczxNYXRMaXN0SXRlbVNlY3Rpb24+IHtcblxuICBwcml2YXRlIF9saW5lcyA9IHRoaXMubG9jYXRvckZvckFsbCgnLm1hdC1saW5lJyk7XG4gIHByaXZhdGUgX2F2YXRhciA9IHRoaXMubG9jYXRvckZvck9wdGlvbmFsKGF2YXRhclNlbGVjdG9yKTtcbiAgcHJpdmF0ZSBfaWNvbiA9IHRoaXMubG9jYXRvckZvck9wdGlvbmFsKGljb25TZWxlY3Rvcik7XG5cbiAgLyoqIEdldHMgdGhlIGZ1bGwgdGV4dCBjb250ZW50IG9mIHRoZSBsaXN0IGl0ZW0uICovXG4gIGFzeW5jIGdldFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS50ZXh0KHtleGNsdWRlOiBgJHtpY29uU2VsZWN0b3J9LCAke2F2YXRhclNlbGVjdG9yfWB9KTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBsaW5lcyBvZiB0ZXh0IChgbWF0LWxpbmVgIGVsZW1lbnRzKSBpbiB0aGlzIG5hdiBsaXN0IGl0ZW0uICovXG4gIGFzeW5jIGdldExpbmVzVGV4dCgpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgbGluZXMgPSBhd2FpdCB0aGlzLl9saW5lcygpO1xuICAgIHJldHVybiBwYXJhbGxlbCgoKSA9PiBsaW5lcy5tYXAobCA9PiBsLnRleHQoKSkpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBsaXN0IGl0ZW0gaGFzIGFuIGF2YXRhci4gKi9cbiAgYXN5bmMgaGFzQXZhdGFyKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAhIWF3YWl0IHRoaXMuX2F2YXRhcigpO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBsaXN0IGl0ZW0gaGFzIGFuIGljb24uICovXG4gIGFzeW5jIGhhc0ljb24oKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuICEhYXdhaXQgdGhpcy5faWNvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc0xvYWRlcmAgdXNlZCB0byBnZXQgaGFybmVzc2VzIHdpdGhpbiB0aGUgbGlzdCBpdGVtJ3MgY29udGVudC5cbiAgICogQGRlcHJlY2F0ZWQgVXNlIGBnZXRDaGlsZExvYWRlcihNYXRMaXN0SXRlbVNlY3Rpb24uQ09OVEVOVClgIG9yIGBnZXRIYXJuZXNzYCBpbnN0ZWFkLlxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDEyLjAuMFxuICAgKi9cbiAgYXN5bmMgZ2V0SGFybmVzc0xvYWRlckZvckNvbnRlbnQoKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2hpbGRMb2FkZXIoTWF0TGlzdEl0ZW1TZWN0aW9uLkNPTlRFTlQpO1xuICB9XG59XG4iXX0=