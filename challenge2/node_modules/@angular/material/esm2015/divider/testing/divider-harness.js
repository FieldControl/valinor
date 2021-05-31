/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { ComponentHarness, HarnessPredicate } from '@angular/cdk/testing';
/** Harness for interacting with a `mat-divider`. */
export class MatDividerHarness extends ComponentHarness {
    static with(options = {}) {
        return new HarnessPredicate(MatDividerHarness, options);
    }
    getOrientation() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).getAttribute('aria-orientation');
        });
    }
    isInset() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.host()).hasClass('mat-divider-inset');
        });
    }
}
MatDividerHarness.hostSelector = '.mat-divider';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGl2aWRlci1oYXJuZXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2RpdmlkZXIvdGVzdGluZy9kaXZpZGVyLWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBR3hFLG9EQUFvRDtBQUNwRCxNQUFNLE9BQU8saUJBQWtCLFNBQVEsZ0JBQWdCO0lBR3JELE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBaUMsRUFBRTtRQUM3QyxPQUFPLElBQUksZ0JBQWdCLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVLLGNBQWM7O1lBQ2xCLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FDcEIsQ0FBQztRQUN6QyxDQUFDO0tBQUE7SUFFSyxPQUFPOztZQUNYLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzNELENBQUM7S0FBQTs7QUFiTSw4QkFBWSxHQUFHLGNBQWMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEhhcm5lc3MsIEhhcm5lc3NQcmVkaWNhdGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcbmltcG9ydCB7RGl2aWRlckhhcm5lc3NGaWx0ZXJzfSBmcm9tICcuL2RpdmlkZXItaGFybmVzcy1maWx0ZXJzJztcblxuLyoqIEhhcm5lc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBgbWF0LWRpdmlkZXJgLiAqL1xuZXhwb3J0IGNsYXNzIE1hdERpdmlkZXJIYXJuZXNzIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcyB7XG4gIHN0YXRpYyBob3N0U2VsZWN0b3IgPSAnLm1hdC1kaXZpZGVyJztcblxuICBzdGF0aWMgd2l0aChvcHRpb25zOiBEaXZpZGVySGFybmVzc0ZpbHRlcnMgPSB7fSkge1xuICAgIHJldHVybiBuZXcgSGFybmVzc1ByZWRpY2F0ZShNYXREaXZpZGVySGFybmVzcywgb3B0aW9ucyk7XG4gIH1cblxuICBhc3luYyBnZXRPcmllbnRhdGlvbigpOiBQcm9taXNlPCdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCc+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5nZXRBdHRyaWJ1dGUoJ2FyaWEtb3JpZW50YXRpb24nKSBhc1xuICAgICAgICBQcm9taXNlPCdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCc+O1xuICB9XG5cbiAgYXN5bmMgaXNJbnNldCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuaG9zdCgpKS5oYXNDbGFzcygnbWF0LWRpdmlkZXItaW5zZXQnKTtcbiAgfVxufVxuIl19