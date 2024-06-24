/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';
/**
 * Gets a map of all elements in the given view by their xref id.
 */
export function createOpXrefMap(unit) {
    const map = new Map();
    for (const op of unit.create) {
        if (!ir.hasConsumesSlotTrait(op)) {
            continue;
        }
        map.set(op.xref, op);
        // TODO(dylhunn): `@for` loops with `@empty` blocks need to be special-cased here,
        // because the slot consumer trait currently only supports one slot per consumer and we
        // need two. This should be revisited when making the refactors mentioned in:
        // https://github.com/angular/angular/pull/53620#discussion_r1430918822
        if (op.kind === ir.OpKind.RepeaterCreate && op.emptyView !== null) {
            map.set(op.emptyView, op);
        }
    }
    return map;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3V0aWwvZWxlbWVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7O0dBRUc7QUFDSCxNQUFNLFVBQVUsZUFBZSxDQUM3QixJQUFxQjtJQUVyQixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBbUQsQ0FBQztJQUN2RSxLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDakMsU0FBUztRQUNYLENBQUM7UUFDRCxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFckIsa0ZBQWtGO1FBQ2xGLHVGQUF1RjtRQUN2Riw2RUFBNkU7UUFDN0UsdUVBQXVFO1FBQ3ZFLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ2xFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1QixDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQgdHlwZSB7Q29tcGlsYXRpb25Vbml0fSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogR2V0cyBhIG1hcCBvZiBhbGwgZWxlbWVudHMgaW4gdGhlIGdpdmVuIHZpZXcgYnkgdGhlaXIgeHJlZiBpZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU9wWHJlZk1hcChcbiAgdW5pdDogQ29tcGlsYXRpb25Vbml0LFxuKTogTWFwPGlyLlhyZWZJZCwgaXIuQ29uc3VtZXNTbG90T3BUcmFpdCAmIGlyLkNyZWF0ZU9wPiB7XG4gIGNvbnN0IG1hcCA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5Db25zdW1lc1Nsb3RPcFRyYWl0ICYgaXIuQ3JlYXRlT3A+KCk7XG4gIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICBpZiAoIWlyLmhhc0NvbnN1bWVzU2xvdFRyYWl0KG9wKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIG1hcC5zZXQob3AueHJlZiwgb3ApO1xuXG4gICAgLy8gVE9ETyhkeWxodW5uKTogYEBmb3JgIGxvb3BzIHdpdGggYEBlbXB0eWAgYmxvY2tzIG5lZWQgdG8gYmUgc3BlY2lhbC1jYXNlZCBoZXJlLFxuICAgIC8vIGJlY2F1c2UgdGhlIHNsb3QgY29uc3VtZXIgdHJhaXQgY3VycmVudGx5IG9ubHkgc3VwcG9ydHMgb25lIHNsb3QgcGVyIGNvbnN1bWVyIGFuZCB3ZVxuICAgIC8vIG5lZWQgdHdvLiBUaGlzIHNob3VsZCBiZSByZXZpc2l0ZWQgd2hlbiBtYWtpbmcgdGhlIHJlZmFjdG9ycyBtZW50aW9uZWQgaW46XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9wdWxsLzUzNjIwI2Rpc2N1c3Npb25fcjE0MzA5MTg4MjJcbiAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLlJlcGVhdGVyQ3JlYXRlICYmIG9wLmVtcHR5VmlldyAhPT0gbnVsbCkge1xuICAgICAgbWFwLnNldChvcC5lbXB0eVZpZXcsIG9wKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1hcDtcbn1cbiJdfQ==