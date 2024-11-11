/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { KeyValueDiffers, Pipe, } from '@angular/core';
import * as i0 from "@angular/core";
function makeKeyValuePair(key, value) {
    return { key: key, value: value };
}
/**
 * @ngModule CommonModule
 * @description
 *
 * Transforms Object or Map into an array of key value pairs.
 *
 * The output array will be ordered by keys.
 * By default the comparator will be by Unicode point value.
 * You can optionally pass a compareFn if your keys are complex types.
 *
 * @usageNotes
 * ### Examples
 *
 * This examples show how an Object or a Map can be iterated by ngFor with the use of this
 * keyvalue pipe.
 *
 * {@example common/pipes/ts/keyvalue_pipe.ts region='KeyValuePipe'}
 *
 * @publicApi
 */
export class KeyValuePipe {
    constructor(differs) {
        this.differs = differs;
        this.keyValues = [];
        this.compareFn = defaultComparator;
    }
    transform(input, compareFn = defaultComparator) {
        if (!input || (!(input instanceof Map) && typeof input !== 'object')) {
            return null;
        }
        // make a differ for whatever type we've been passed in
        this.differ ??= this.differs.find(input).create();
        const differChanges = this.differ.diff(input);
        const compareFnChanged = compareFn !== this.compareFn;
        if (differChanges) {
            this.keyValues = [];
            differChanges.forEachItem((r) => {
                this.keyValues.push(makeKeyValuePair(r.key, r.currentValue));
            });
        }
        if (differChanges || compareFnChanged) {
            this.keyValues.sort(compareFn);
            this.compareFn = compareFn;
        }
        return this.keyValues;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: KeyValuePipe, deps: [{ token: i0.KeyValueDiffers }], target: i0.ɵɵFactoryTarget.Pipe }); }
    static { this.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "18.2.7", ngImport: i0, type: KeyValuePipe, isStandalone: true, name: "keyvalue", pure: false }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.7", ngImport: i0, type: KeyValuePipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'keyvalue',
                    pure: false,
                    standalone: true,
                }]
        }], ctorParameters: () => [{ type: i0.KeyValueDiffers }] });
export function defaultComparator(keyValueA, keyValueB) {
    const a = keyValueA.key;
    const b = keyValueB.key;
    // if same exit with 0;
    if (a === b)
        return 0;
    // make sure that undefined are at the end of the sort.
    if (a === undefined)
        return 1;
    if (b === undefined)
        return -1;
    // make sure that nulls are at the end of the sort.
    if (a === null)
        return 1;
    if (b === null)
        return -1;
    if (typeof a == 'string' && typeof b == 'string') {
        return a < b ? -1 : 1;
    }
    if (typeof a == 'number' && typeof b == 'number') {
        return a - b;
    }
    if (typeof a == 'boolean' && typeof b == 'boolean') {
        return a < b ? -1 : 1;
    }
    // `a` and `b` are of different types. Compare their string values.
    const aString = String(a);
    const bString = String(b);
    return aString == bString ? 0 : aString < bString ? -1 : 1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5dmFsdWVfcGlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMva2V5dmFsdWVfcGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBSUwsZUFBZSxFQUNmLElBQUksR0FFTCxNQUFNLGVBQWUsQ0FBQzs7QUFFdkIsU0FBUyxnQkFBZ0IsQ0FBTyxHQUFNLEVBQUUsS0FBUTtJQUM5QyxPQUFPLEVBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFDLENBQUM7QUFDbEMsQ0FBQztBQWFEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBTUgsTUFBTSxPQUFPLFlBQVk7SUFDdkIsWUFBNkIsT0FBd0I7UUFBeEIsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7UUFHN0MsY0FBUyxHQUE4QixFQUFFLENBQUM7UUFDMUMsY0FBUyxHQUE2RCxpQkFBaUIsQ0FBQztJQUp4QyxDQUFDO0lBdUN6RCxTQUFTLENBQ1AsS0FBa0YsRUFDbEYsWUFBOEQsaUJBQWlCO1FBRS9FLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxZQUFZLEdBQUcsQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDckUsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsdURBQXVEO1FBQ3ZELElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFbEQsTUFBTSxhQUFhLEdBQWlDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQVksQ0FBQyxDQUFDO1FBQ25GLE1BQU0sZ0JBQWdCLEdBQUcsU0FBUyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFdEQsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNwQixhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBNkIsRUFBRSxFQUFFO2dCQUMxRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxZQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNELElBQUksYUFBYSxJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDL0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDN0IsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO3lIQWpFVSxZQUFZO3VIQUFaLFlBQVk7O3NHQUFaLFlBQVk7a0JBTHhCLElBQUk7bUJBQUM7b0JBQ0osSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLElBQUksRUFBRSxLQUFLO29CQUNYLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjs7QUFxRUQsTUFBTSxVQUFVLGlCQUFpQixDQUMvQixTQUF5QixFQUN6QixTQUF5QjtJQUV6QixNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO0lBQ3hCLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUM7SUFDeEIsdUJBQXVCO0lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0Qix1REFBdUQ7SUFDdkQsSUFBSSxDQUFDLEtBQUssU0FBUztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLElBQUksQ0FBQyxLQUFLLFNBQVM7UUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQy9CLG1EQUFtRDtJQUNuRCxJQUFJLENBQUMsS0FBSyxJQUFJO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDLEtBQUssSUFBSTtRQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDMUIsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFLENBQUM7UUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFDRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZixDQUFDO0lBQ0QsSUFBSSxPQUFPLENBQUMsSUFBSSxTQUFTLElBQUksT0FBTyxDQUFDLElBQUksU0FBUyxFQUFFLENBQUM7UUFDbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFDRCxtRUFBbUU7SUFDbkUsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixPQUFPLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBLZXlWYWx1ZUNoYW5nZVJlY29yZCxcbiAgS2V5VmFsdWVDaGFuZ2VzLFxuICBLZXlWYWx1ZURpZmZlcixcbiAgS2V5VmFsdWVEaWZmZXJzLFxuICBQaXBlLFxuICBQaXBlVHJhbnNmb3JtLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuZnVuY3Rpb24gbWFrZUtleVZhbHVlUGFpcjxLLCBWPihrZXk6IEssIHZhbHVlOiBWKTogS2V5VmFsdWU8SywgVj4ge1xuICByZXR1cm4ge2tleToga2V5LCB2YWx1ZTogdmFsdWV9O1xufVxuXG4vKipcbiAqIEEga2V5IHZhbHVlIHBhaXIuXG4gKiBVc3VhbGx5IHVzZWQgdG8gcmVwcmVzZW50IHRoZSBrZXkgdmFsdWUgcGFpcnMgZnJvbSBhIE1hcCBvciBPYmplY3QuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEtleVZhbHVlPEssIFY+IHtcbiAga2V5OiBLO1xuICB2YWx1ZTogVjtcbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBUcmFuc2Zvcm1zIE9iamVjdCBvciBNYXAgaW50byBhbiBhcnJheSBvZiBrZXkgdmFsdWUgcGFpcnMuXG4gKlxuICogVGhlIG91dHB1dCBhcnJheSB3aWxsIGJlIG9yZGVyZWQgYnkga2V5cy5cbiAqIEJ5IGRlZmF1bHQgdGhlIGNvbXBhcmF0b3Igd2lsbCBiZSBieSBVbmljb2RlIHBvaW50IHZhbHVlLlxuICogWW91IGNhbiBvcHRpb25hbGx5IHBhc3MgYSBjb21wYXJlRm4gaWYgeW91ciBrZXlzIGFyZSBjb21wbGV4IHR5cGVzLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBUaGlzIGV4YW1wbGVzIHNob3cgaG93IGFuIE9iamVjdCBvciBhIE1hcCBjYW4gYmUgaXRlcmF0ZWQgYnkgbmdGb3Igd2l0aCB0aGUgdXNlIG9mIHRoaXNcbiAqIGtleXZhbHVlIHBpcGUuXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9rZXl2YWx1ZV9waXBlLnRzIHJlZ2lvbj0nS2V5VmFsdWVQaXBlJ31cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBQaXBlKHtcbiAgbmFtZTogJ2tleXZhbHVlJyxcbiAgcHVyZTogZmFsc2UsXG4gIHN0YW5kYWxvbmU6IHRydWUsXG59KVxuZXhwb3J0IGNsYXNzIEtleVZhbHVlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGRpZmZlcnM6IEtleVZhbHVlRGlmZmVycykge31cblxuICBwcml2YXRlIGRpZmZlciE6IEtleVZhbHVlRGlmZmVyPGFueSwgYW55PjtcbiAgcHJpdmF0ZSBrZXlWYWx1ZXM6IEFycmF5PEtleVZhbHVlPGFueSwgYW55Pj4gPSBbXTtcbiAgcHJpdmF0ZSBjb21wYXJlRm46IChhOiBLZXlWYWx1ZTxhbnksIGFueT4sIGI6IEtleVZhbHVlPGFueSwgYW55PikgPT4gbnVtYmVyID0gZGVmYXVsdENvbXBhcmF0b3I7XG5cbiAgLypcbiAgICogTk9URTogd2hlbiB0aGUgYGlucHV0YCB2YWx1ZSBpcyBhIHNpbXBsZSBSZWNvcmQ8SywgVj4gb2JqZWN0LCB0aGUga2V5cyBhcmUgZXh0cmFjdGVkIHdpdGhcbiAgICogT2JqZWN0LmtleXMoKS4gVGhpcyBtZWFucyB0aGF0IGV2ZW4gaWYgdGhlIGBpbnB1dGAgdHlwZSBpcyBSZWNvcmQ8bnVtYmVyLCBWPiB0aGUga2V5cyBhcmVcbiAgICogY29tcGFyZWQvcmV0dXJuZWQgYXMgYHN0cmluZ2BzLlxuICAgKi9cbiAgdHJhbnNmb3JtPEssIFY+KFxuICAgIGlucHV0OiBSZWFkb25seU1hcDxLLCBWPixcbiAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8SywgVj4sIGI6IEtleVZhbHVlPEssIFY+KSA9PiBudW1iZXIsXG4gICk6IEFycmF5PEtleVZhbHVlPEssIFY+PjtcbiAgdHJhbnNmb3JtPEsgZXh0ZW5kcyBudW1iZXIsIFY+KFxuICAgIGlucHV0OiBSZWNvcmQ8SywgVj4sXG4gICAgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPHN0cmluZywgVj4sIGI6IEtleVZhbHVlPHN0cmluZywgVj4pID0+IG51bWJlcixcbiAgKTogQXJyYXk8S2V5VmFsdWU8c3RyaW5nLCBWPj47XG4gIHRyYW5zZm9ybTxLIGV4dGVuZHMgc3RyaW5nLCBWPihcbiAgICBpbnB1dDogUmVjb3JkPEssIFY+IHwgUmVhZG9ubHlNYXA8SywgVj4sXG4gICAgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPEssIFY+LCBiOiBLZXlWYWx1ZTxLLCBWPikgPT4gbnVtYmVyLFxuICApOiBBcnJheTxLZXlWYWx1ZTxLLCBWPj47XG4gIHRyYW5zZm9ybShcbiAgICBpbnB1dDogbnVsbCB8IHVuZGVmaW5lZCxcbiAgICBjb21wYXJlRm4/OiAoYTogS2V5VmFsdWU8dW5rbm93biwgdW5rbm93bj4sIGI6IEtleVZhbHVlPHVua25vd24sIHVua25vd24+KSA9PiBudW1iZXIsXG4gICk6IG51bGw7XG4gIHRyYW5zZm9ybTxLLCBWPihcbiAgICBpbnB1dDogUmVhZG9ubHlNYXA8SywgVj4gfCBudWxsIHwgdW5kZWZpbmVkLFxuICAgIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxLLCBWPiwgYjogS2V5VmFsdWU8SywgVj4pID0+IG51bWJlcixcbiAgKTogQXJyYXk8S2V5VmFsdWU8SywgVj4+IHwgbnVsbDtcbiAgdHJhbnNmb3JtPEsgZXh0ZW5kcyBudW1iZXIsIFY+KFxuICAgIGlucHV0OiBSZWNvcmQ8SywgVj4gfCBudWxsIHwgdW5kZWZpbmVkLFxuICAgIGNvbXBhcmVGbj86IChhOiBLZXlWYWx1ZTxzdHJpbmcsIFY+LCBiOiBLZXlWYWx1ZTxzdHJpbmcsIFY+KSA9PiBudW1iZXIsXG4gICk6IEFycmF5PEtleVZhbHVlPHN0cmluZywgVj4+IHwgbnVsbDtcbiAgdHJhbnNmb3JtPEsgZXh0ZW5kcyBzdHJpbmcsIFY+KFxuICAgIGlucHV0OiBSZWNvcmQ8SywgVj4gfCBSZWFkb25seU1hcDxLLCBWPiB8IG51bGwgfCB1bmRlZmluZWQsXG4gICAgY29tcGFyZUZuPzogKGE6IEtleVZhbHVlPEssIFY+LCBiOiBLZXlWYWx1ZTxLLCBWPikgPT4gbnVtYmVyLFxuICApOiBBcnJheTxLZXlWYWx1ZTxLLCBWPj4gfCBudWxsO1xuICB0cmFuc2Zvcm08SywgVj4oXG4gICAgaW5wdXQ6IHVuZGVmaW5lZCB8IG51bGwgfCB7W2tleTogc3RyaW5nXTogVjsgW2tleTogbnVtYmVyXTogVn0gfCBSZWFkb25seU1hcDxLLCBWPixcbiAgICBjb21wYXJlRm46IChhOiBLZXlWYWx1ZTxLLCBWPiwgYjogS2V5VmFsdWU8SywgVj4pID0+IG51bWJlciA9IGRlZmF1bHRDb21wYXJhdG9yLFxuICApOiBBcnJheTxLZXlWYWx1ZTxLLCBWPj4gfCBudWxsIHtcbiAgICBpZiAoIWlucHV0IHx8ICghKGlucHV0IGluc3RhbmNlb2YgTWFwKSAmJiB0eXBlb2YgaW5wdXQgIT09ICdvYmplY3QnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gbWFrZSBhIGRpZmZlciBmb3Igd2hhdGV2ZXIgdHlwZSB3ZSd2ZSBiZWVuIHBhc3NlZCBpblxuICAgIHRoaXMuZGlmZmVyID8/PSB0aGlzLmRpZmZlcnMuZmluZChpbnB1dCkuY3JlYXRlKCk7XG5cbiAgICBjb25zdCBkaWZmZXJDaGFuZ2VzOiBLZXlWYWx1ZUNoYW5nZXM8SywgVj4gfCBudWxsID0gdGhpcy5kaWZmZXIuZGlmZihpbnB1dCBhcyBhbnkpO1xuICAgIGNvbnN0IGNvbXBhcmVGbkNoYW5nZWQgPSBjb21wYXJlRm4gIT09IHRoaXMuY29tcGFyZUZuO1xuXG4gICAgaWYgKGRpZmZlckNoYW5nZXMpIHtcbiAgICAgIHRoaXMua2V5VmFsdWVzID0gW107XG4gICAgICBkaWZmZXJDaGFuZ2VzLmZvckVhY2hJdGVtKChyOiBLZXlWYWx1ZUNoYW5nZVJlY29yZDxLLCBWPikgPT4ge1xuICAgICAgICB0aGlzLmtleVZhbHVlcy5wdXNoKG1ha2VLZXlWYWx1ZVBhaXIoci5rZXksIHIuY3VycmVudFZhbHVlISkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChkaWZmZXJDaGFuZ2VzIHx8IGNvbXBhcmVGbkNoYW5nZWQpIHtcbiAgICAgIHRoaXMua2V5VmFsdWVzLnNvcnQoY29tcGFyZUZuKTtcbiAgICAgIHRoaXMuY29tcGFyZUZuID0gY29tcGFyZUZuO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5rZXlWYWx1ZXM7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRDb21wYXJhdG9yPEssIFY+KFxuICBrZXlWYWx1ZUE6IEtleVZhbHVlPEssIFY+LFxuICBrZXlWYWx1ZUI6IEtleVZhbHVlPEssIFY+LFxuKTogbnVtYmVyIHtcbiAgY29uc3QgYSA9IGtleVZhbHVlQS5rZXk7XG4gIGNvbnN0IGIgPSBrZXlWYWx1ZUIua2V5O1xuICAvLyBpZiBzYW1lIGV4aXQgd2l0aCAwO1xuICBpZiAoYSA9PT0gYikgcmV0dXJuIDA7XG4gIC8vIG1ha2Ugc3VyZSB0aGF0IHVuZGVmaW5lZCBhcmUgYXQgdGhlIGVuZCBvZiB0aGUgc29ydC5cbiAgaWYgKGEgPT09IHVuZGVmaW5lZCkgcmV0dXJuIDE7XG4gIGlmIChiID09PSB1bmRlZmluZWQpIHJldHVybiAtMTtcbiAgLy8gbWFrZSBzdXJlIHRoYXQgbnVsbHMgYXJlIGF0IHRoZSBlbmQgb2YgdGhlIHNvcnQuXG4gIGlmIChhID09PSBudWxsKSByZXR1cm4gMTtcbiAgaWYgKGIgPT09IG51bGwpIHJldHVybiAtMTtcbiAgaWYgKHR5cGVvZiBhID09ICdzdHJpbmcnICYmIHR5cGVvZiBiID09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGEgPCBiID8gLTEgOiAxO1xuICB9XG4gIGlmICh0eXBlb2YgYSA9PSAnbnVtYmVyJyAmJiB0eXBlb2YgYiA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBhIC0gYjtcbiAgfVxuICBpZiAodHlwZW9mIGEgPT0gJ2Jvb2xlYW4nICYmIHR5cGVvZiBiID09ICdib29sZWFuJykge1xuICAgIHJldHVybiBhIDwgYiA/IC0xIDogMTtcbiAgfVxuICAvLyBgYWAgYW5kIGBiYCBhcmUgb2YgZGlmZmVyZW50IHR5cGVzLiBDb21wYXJlIHRoZWlyIHN0cmluZyB2YWx1ZXMuXG4gIGNvbnN0IGFTdHJpbmcgPSBTdHJpbmcoYSk7XG4gIGNvbnN0IGJTdHJpbmcgPSBTdHJpbmcoYik7XG4gIHJldHVybiBhU3RyaW5nID09IGJTdHJpbmcgPyAwIDogYVN0cmluZyA8IGJTdHJpbmcgPyAtMSA6IDE7XG59XG4iXX0=