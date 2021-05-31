/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ContentContainerComponentHarness, HarnessPredicate, parallel } from '@angular/cdk/testing';
/** Harness for interacting with a standard mat-toolbar in tests. */
export class MatToolbarHarness extends ContentContainerComponentHarness {
    constructor() {
        super(...arguments);
        this._getRows = this.locatorForAll(".mat-toolbar-row" /* ROW */);
    }
    /**
     * Gets a `HarnessPredicate` that can be used to search for a `MatToolbarHarness` that meets
     * certain criteria.
     * @param options Options for filtering which card instances are considered a match.
     * @return a `HarnessPredicate` configured with the given options.
     */
    static with(options = {}) {
        return new HarnessPredicate(MatToolbarHarness, options)
            .addOption('text', options.text, (harness, text) => HarnessPredicate.stringMatches(harness._getText(), text));
    }
    /** Whether the toolbar has multiple rows. */
    hasMultipleRows() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-toolbar-multiple-rows');
        });
    }
    /** Gets all of the toolbar's content as text. */
    _getText() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).text();
        });
    }
    /** Gets the text of each row in the toolbar. */
    getRowsAsText() {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this._getRows();
            return parallel(() => rows.length ? rows.map(r => r.text()) : [this._getText()]);
        });
    }
}
MatToolbarHarness.hostSelector = '.mat-toolbar';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbGJhci1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3Rvb2xiYXIvdGVzdGluZy90b29sYmFyLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUdILE9BQU8sRUFBQyxnQ0FBZ0MsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQVFsRyxvRUFBb0U7QUFDcEUsTUFBTSxPQUFPLGlCQUFrQixTQUFRLGdDQUFtRDtJQUExRjs7UUFHVSxhQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsOEJBQXVCLENBQUM7SUE2Qi9ELENBQUM7SUEzQkM7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQWlDLEVBQUU7UUFDN0MsT0FBTyxJQUFJLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQzthQUNwRCxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQzdCLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFRCw2Q0FBNkM7SUFDdkMsZUFBZTs7WUFDbkIsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDbkUsQ0FBQztLQUFBO0lBRUQsaURBQWlEO0lBQ25DLFFBQVE7O1lBQ3BCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3BDLENBQUM7S0FBQTtJQUVELGdEQUFnRDtJQUMxQyxhQUFhOztZQUNqQixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQyxPQUFPLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuRixDQUFDO0tBQUE7O0FBOUJNLDhCQUFZLEdBQUcsY0FBYyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuaW1wb3J0IHtDb250ZW50Q29udGFpbmVyQ29tcG9uZW50SGFybmVzcywgSGFybmVzc1ByZWRpY2F0ZSwgcGFyYWxsZWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7VG9vbGJhckhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL3Rvb2xiYXItaGFybmVzcy1maWx0ZXJzJztcblxuLyoqIFNlbGVjdG9ycyBmb3IgZGlmZmVyZW50IHNlY3Rpb25zIG9mIHRoZSBtYXQtdG9vbGJhciB0aGF0IGNvbnRhaW4gdXNlciBjb250ZW50LiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gTWF0VG9vbGJhclNlY3Rpb24ge1xuICBST1cgPSAnLm1hdC10b29sYmFyLXJvdydcbn1cblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBzdGFuZGFyZCBtYXQtdG9vbGJhciBpbiB0ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBNYXRUb29sYmFySGFybmVzcyBleHRlbmRzIENvbnRlbnRDb250YWluZXJDb21wb25lbnRIYXJuZXNzPE1hdFRvb2xiYXJTZWN0aW9uPiB7XG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC10b29sYmFyJztcblxuICBwcml2YXRlIF9nZXRSb3dzID0gdGhpcy5sb2NhdG9yRm9yQWxsKE1hdFRvb2xiYXJTZWN0aW9uLlJPVyk7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBgSGFybmVzc1ByZWRpY2F0ZWAgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWFyY2ggZm9yIGEgYE1hdFRvb2xiYXJIYXJuZXNzYCB0aGF0IG1lZXRzXG4gICAqIGNlcnRhaW4gY3JpdGVyaWEuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGZpbHRlcmluZyB3aGljaCBjYXJkIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBhIG1hdGNoLlxuICAgKiBAcmV0dXJuIGEgYEhhcm5lc3NQcmVkaWNhdGVgIGNvbmZpZ3VyZWQgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3aXRoKG9wdGlvbnM6IFRvb2xiYXJIYXJuZXNzRmlsdGVycyA9IHt9KTogSGFybmVzc1ByZWRpY2F0ZTxNYXRUb29sYmFySGFybmVzcz4ge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXRUb29sYmFySGFybmVzcywgb3B0aW9ucylcbiAgICAgIC5hZGRPcHRpb24oJ3RleHQnLCBvcHRpb25zLnRleHQsXG4gICAgICAgIChoYXJuZXNzLCB0ZXh0KSA9PiBIYXJuZXNzUHJlZGljYXRlLnN0cmluZ01hdGNoZXMoaGFybmVzcy5fZ2V0VGV4dCgpLCB0ZXh0KSk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgdG9vbGJhciBoYXMgbXVsdGlwbGUgcm93cy4gKi9cbiAgYXN5bmMgaGFzTXVsdGlwbGVSb3dzKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ob3N0KCkpLmhhc0NsYXNzKCdtYXQtdG9vbGJhci1tdWx0aXBsZS1yb3dzJyk7XG4gIH1cblxuICAvKiogR2V0cyBhbGwgb2YgdGhlIHRvb2xiYXIncyBjb250ZW50IGFzIHRleHQuICovXG4gIHByaXZhdGUgYXN5bmMgX2dldFRleHQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS50ZXh0KCk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgdGV4dCBvZiBlYWNoIHJvdyBpbiB0aGUgdG9vbGJhci4gKi9cbiAgYXN5bmMgZ2V0Um93c0FzVGV4dCgpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3Qgcm93cyA9IGF3YWl0IHRoaXMuX2dldFJvd3MoKTtcbiAgICByZXR1cm4gcGFyYWxsZWwoKCkgPT4gcm93cy5sZW5ndGggPyByb3dzLm1hcChyID0+IHIudGV4dCgpKSA6IFt0aGlzLl9nZXRUZXh0KCldKTtcbiAgfVxufVxuIl19