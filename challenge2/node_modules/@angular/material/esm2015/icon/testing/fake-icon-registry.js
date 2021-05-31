/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, NgModule } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { of as observableOf } from 'rxjs';
/**
 * A null icon registry that must be imported to allow disabling of custom
 * icons.
 */
export class FakeMatIconRegistry {
    addSvgIcon() {
        return this;
    }
    addSvgIconLiteral() {
        return this;
    }
    addSvgIconInNamespace() {
        return this;
    }
    addSvgIconLiteralInNamespace() {
        return this;
    }
    addSvgIconSet() {
        return this;
    }
    addSvgIconSetLiteral() {
        return this;
    }
    addSvgIconSetInNamespace() {
        return this;
    }
    addSvgIconSetLiteralInNamespace() {
        return this;
    }
    registerFontClassAlias() {
        return this;
    }
    classNameForFontAlias(alias) {
        return alias;
    }
    getDefaultFontSetClass() {
        return 'material-icons';
    }
    getSvgIconFromUrl() {
        return observableOf(this._generateEmptySvg());
    }
    getNamedSvgIcon() {
        return observableOf(this._generateEmptySvg());
    }
    setDefaultFontSetClass() {
        return this;
    }
    addSvgIconResolver() {
        return this;
    }
    ngOnDestroy() { }
    _generateEmptySvg() {
        const emptySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        emptySvg.classList.add('fake-testing-svg');
        // Emulate real icon characteristics from `MatIconRegistry` so size remains consistent in tests.
        emptySvg.setAttribute('fit', '');
        emptySvg.setAttribute('height', '100%');
        emptySvg.setAttribute('width', '100%');
        emptySvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        emptySvg.setAttribute('focusable', 'false');
        return emptySvg;
    }
}
FakeMatIconRegistry.decorators = [
    { type: Injectable }
];
/** Import this module in tests to install the null icon registry. */
export class MatIconTestingModule {
}
MatIconTestingModule.decorators = [
    { type: NgModule, args: [{
                providers: [{ provide: MatIconRegistry, useClass: FakeMatIconRegistry }]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFrZS1pY29uLXJlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2ljb24vdGVzdGluZy9mYWtlLWljb24tcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQVksTUFBTSxlQUFlLENBQUM7QUFDOUQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBYSxFQUFFLElBQUksWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBTXBEOzs7R0FHRztBQUVILE1BQU0sT0FBTyxtQkFBbUI7SUFDOUIsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELGlCQUFpQjtRQUNmLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELHFCQUFxQjtRQUNuQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCw0QkFBNEI7UUFDMUIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsYUFBYTtRQUNYLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELG9CQUFvQjtRQUNsQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCx3QkFBd0I7UUFDdEIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsK0JBQStCO1FBQzdCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELHNCQUFzQjtRQUNwQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxLQUFhO1FBQ2pDLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELHNCQUFzQjtRQUNwQixPQUFPLGdCQUFnQixDQUFDO0lBQzFCLENBQUM7SUFFRCxpQkFBaUI7UUFDZixPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxlQUFlO1FBQ2IsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsc0JBQXNCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxXQUFXLEtBQUssQ0FBQztJQUVULGlCQUFpQjtRQUN2QixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLDRCQUE0QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9FLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDM0MsZ0dBQWdHO1FBQ2hHLFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLFFBQVEsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxZQUFZLENBQUMscUJBQXFCLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDOUQsUUFBUSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUMsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQzs7O1lBMUVGLFVBQVU7O0FBNkVYLHFFQUFxRTtBQUlyRSxNQUFNLE9BQU8sb0JBQW9COzs7WUFIaEMsUUFBUSxTQUFDO2dCQUNSLFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLEVBQUMsQ0FBQzthQUN2RSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIE5nTW9kdWxlLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXRJY29uUmVnaXN0cnl9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2ljb24nO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2Z9IGZyb20gJ3J4anMnO1xuXG50eXBlIFB1YmxpY0FwaTxUPiA9IHtcbiAgW0sgaW4ga2V5b2YgVF06IFRbS10gZXh0ZW5kcyAoLi4ueDogYW55W10pID0+IFQgPyAoLi4ueDogYW55W10pID0+IFB1YmxpY0FwaTxUPiA6IFRbS11cbn07XG5cbi8qKlxuICogQSBudWxsIGljb24gcmVnaXN0cnkgdGhhdCBtdXN0IGJlIGltcG9ydGVkIHRvIGFsbG93IGRpc2FibGluZyBvZiBjdXN0b21cbiAqIGljb25zLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRmFrZU1hdEljb25SZWdpc3RyeSBpbXBsZW1lbnRzIFB1YmxpY0FwaTxNYXRJY29uUmVnaXN0cnk+LCBPbkRlc3Ryb3kge1xuICBhZGRTdmdJY29uKCk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkU3ZnSWNvbkxpdGVyYWwoKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRTdmdJY29uSW5OYW1lc3BhY2UoKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBhZGRTdmdJY29uTGl0ZXJhbEluTmFtZXNwYWNlKCk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkU3ZnSWNvblNldCgpOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGFkZFN2Z0ljb25TZXRMaXRlcmFsKCk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkU3ZnSWNvblNldEluTmFtZXNwYWNlKCk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkU3ZnSWNvblNldExpdGVyYWxJbk5hbWVzcGFjZSgpOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlZ2lzdGVyRm9udENsYXNzQWxpYXMoKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjbGFzc05hbWVGb3JGb250QWxpYXMoYWxpYXM6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGFsaWFzO1xuICB9XG5cbiAgZ2V0RGVmYXVsdEZvbnRTZXRDbGFzcygpIHtcbiAgICByZXR1cm4gJ21hdGVyaWFsLWljb25zJztcbiAgfVxuXG4gIGdldFN2Z0ljb25Gcm9tVXJsKCk6IE9ic2VydmFibGU8U1ZHRWxlbWVudD4ge1xuICAgIHJldHVybiBvYnNlcnZhYmxlT2YodGhpcy5fZ2VuZXJhdGVFbXB0eVN2ZygpKTtcbiAgfVxuXG4gIGdldE5hbWVkU3ZnSWNvbigpOiBPYnNlcnZhYmxlPFNWR0VsZW1lbnQ+IHtcbiAgICByZXR1cm4gb2JzZXJ2YWJsZU9mKHRoaXMuX2dlbmVyYXRlRW1wdHlTdmcoKSk7XG4gIH1cblxuICBzZXREZWZhdWx0Rm9udFNldENsYXNzKCk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYWRkU3ZnSWNvblJlc29sdmVyKCk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7IH1cblxuICBwcml2YXRlIF9nZW5lcmF0ZUVtcHR5U3ZnKCk6IFNWR0VsZW1lbnQge1xuICAgIGNvbnN0IGVtcHR5U3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdzdmcnKTtcbiAgICBlbXB0eVN2Zy5jbGFzc0xpc3QuYWRkKCdmYWtlLXRlc3Rpbmctc3ZnJyk7XG4gICAgLy8gRW11bGF0ZSByZWFsIGljb24gY2hhcmFjdGVyaXN0aWNzIGZyb20gYE1hdEljb25SZWdpc3RyeWAgc28gc2l6ZSByZW1haW5zIGNvbnNpc3RlbnQgaW4gdGVzdHMuXG4gICAgZW1wdHlTdmcuc2V0QXR0cmlidXRlKCdmaXQnLCAnJyk7XG4gICAgZW1wdHlTdmcuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCAnMTAwJScpO1xuICAgIGVtcHR5U3ZnLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAnMTAwJScpO1xuICAgIGVtcHR5U3ZnLnNldEF0dHJpYnV0ZSgncHJlc2VydmVBc3BlY3RSYXRpbycsICd4TWlkWU1pZCBtZWV0Jyk7XG4gICAgZW1wdHlTdmcuc2V0QXR0cmlidXRlKCdmb2N1c2FibGUnLCAnZmFsc2UnKTtcbiAgICByZXR1cm4gZW1wdHlTdmc7XG4gIH1cbn1cblxuLyoqIEltcG9ydCB0aGlzIG1vZHVsZSBpbiB0ZXN0cyB0byBpbnN0YWxsIHRoZSBudWxsIGljb24gcmVnaXN0cnkuICovXG5ATmdNb2R1bGUoe1xuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogTWF0SWNvblJlZ2lzdHJ5LCB1c2VDbGFzczogRmFrZU1hdEljb25SZWdpc3RyeX1dXG59KVxuZXhwb3J0IGNsYXNzIE1hdEljb25UZXN0aW5nTW9kdWxlIHtcbn1cbiJdfQ==