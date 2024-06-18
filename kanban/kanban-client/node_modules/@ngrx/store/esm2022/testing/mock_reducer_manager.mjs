import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as i0 from "@angular/core";
export class MockReducerManager extends BehaviorSubject {
    constructor() {
        super(() => undefined);
    }
    addFeature(feature) {
        /* noop */
    }
    addFeatures(feature) {
        /* noop */
    }
    removeFeature(feature) {
        /* noop */
    }
    removeFeatures(features) {
        /* noop */
    }
    addReducer(key, reducer) {
        /* noop */
    }
    addReducers(reducers) {
        /* noop */
    }
    removeReducer(featureKey) {
        /* noop */
    }
    removeReducers(featureKeys) {
        /* noop */
    }
    /** @nocollapse */ static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: MockReducerManager, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    /** @nocollapse */ static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: MockReducerManager }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0", ngImport: i0, type: MockReducerManager, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19yZWR1Y2VyX21hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9tb2R1bGVzL3N0b3JlL3Rlc3Rpbmcvc3JjL21vY2tfcmVkdWNlcl9tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLE1BQU0sQ0FBQzs7QUFJdkMsTUFBTSxPQUFPLGtCQUFtQixTQUFRLGVBRXZDO0lBQ0M7UUFDRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVELFVBQVUsQ0FBQyxPQUFZO1FBQ3JCLFVBQVU7SUFDWixDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQVk7UUFDdEIsVUFBVTtJQUNaLENBQUM7SUFFRCxhQUFhLENBQUMsT0FBWTtRQUN4QixVQUFVO0lBQ1osQ0FBQztJQUVELGNBQWMsQ0FBQyxRQUFhO1FBQzFCLFVBQVU7SUFDWixDQUFDO0lBRUQsVUFBVSxDQUFDLEdBQVEsRUFBRSxPQUFZO1FBQy9CLFVBQVU7SUFDWixDQUFDO0lBRUQsV0FBVyxDQUFDLFFBQWE7UUFDdkIsVUFBVTtJQUNaLENBQUM7SUFFRCxhQUFhLENBQUMsVUFBZTtRQUMzQixVQUFVO0lBQ1osQ0FBQztJQUVELGNBQWMsQ0FBQyxXQUFnQjtRQUM3QixVQUFVO0lBQ1osQ0FBQztpSUFyQ1Usa0JBQWtCO3FJQUFsQixrQkFBa0I7OzJGQUFsQixrQkFBa0I7a0JBRDlCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IEFjdGlvblJlZHVjZXIgfSBmcm9tICdAbmdyeC9zdG9yZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrUmVkdWNlck1hbmFnZXIgZXh0ZW5kcyBCZWhhdmlvclN1YmplY3Q8XG4gIEFjdGlvblJlZHVjZXI8YW55LCBhbnk+XG4+IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKCkgPT4gdW5kZWZpbmVkKTtcbiAgfVxuXG4gIGFkZEZlYXR1cmUoZmVhdHVyZTogYW55KSB7XG4gICAgLyogbm9vcCAqL1xuICB9XG5cbiAgYWRkRmVhdHVyZXMoZmVhdHVyZTogYW55KSB7XG4gICAgLyogbm9vcCAqL1xuICB9XG5cbiAgcmVtb3ZlRmVhdHVyZShmZWF0dXJlOiBhbnkpIHtcbiAgICAvKiBub29wICovXG4gIH1cblxuICByZW1vdmVGZWF0dXJlcyhmZWF0dXJlczogYW55KSB7XG4gICAgLyogbm9vcCAqL1xuICB9XG5cbiAgYWRkUmVkdWNlcihrZXk6IGFueSwgcmVkdWNlcjogYW55KSB7XG4gICAgLyogbm9vcCAqL1xuICB9XG5cbiAgYWRkUmVkdWNlcnMocmVkdWNlcnM6IGFueSkge1xuICAgIC8qIG5vb3AgKi9cbiAgfVxuXG4gIHJlbW92ZVJlZHVjZXIoZmVhdHVyZUtleTogYW55KSB7XG4gICAgLyogbm9vcCAqL1xuICB9XG5cbiAgcmVtb3ZlUmVkdWNlcnMoZmVhdHVyZUtleXM6IGFueSkge1xuICAgIC8qIG5vb3AgKi9cbiAgfVxufVxuIl19