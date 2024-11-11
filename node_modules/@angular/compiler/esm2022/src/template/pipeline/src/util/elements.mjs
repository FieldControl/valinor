/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3V0aWwvZWxlbWVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7O0dBRUc7QUFDSCxNQUFNLFVBQVUsZUFBZSxDQUM3QixJQUFxQjtJQUVyQixNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBbUQsQ0FBQztJQUN2RSxLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDakMsU0FBUztRQUNYLENBQUM7UUFDRCxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFckIsa0ZBQWtGO1FBQ2xGLHVGQUF1RjtRQUN2Riw2RUFBNkU7UUFDN0UsdUVBQXVFO1FBQ3ZFLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ2xFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1QixDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uVW5pdH0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIEdldHMgYSBtYXAgb2YgYWxsIGVsZW1lbnRzIGluIHRoZSBnaXZlbiB2aWV3IGJ5IHRoZWlyIHhyZWYgaWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVPcFhyZWZNYXAoXG4gIHVuaXQ6IENvbXBpbGF0aW9uVW5pdCxcbik6IE1hcDxpci5YcmVmSWQsIGlyLkNvbnN1bWVzU2xvdE9wVHJhaXQgJiBpci5DcmVhdGVPcD4ge1xuICBjb25zdCBtYXAgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuQ29uc3VtZXNTbG90T3BUcmFpdCAmIGlyLkNyZWF0ZU9wPigpO1xuICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgaWYgKCFpci5oYXNDb25zdW1lc1Nsb3RUcmFpdChvcCkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBtYXAuc2V0KG9wLnhyZWYsIG9wKTtcblxuICAgIC8vIFRPRE8oZHlsaHVubik6IGBAZm9yYCBsb29wcyB3aXRoIGBAZW1wdHlgIGJsb2NrcyBuZWVkIHRvIGJlIHNwZWNpYWwtY2FzZWQgaGVyZSxcbiAgICAvLyBiZWNhdXNlIHRoZSBzbG90IGNvbnN1bWVyIHRyYWl0IGN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIG9uZSBzbG90IHBlciBjb25zdW1lciBhbmQgd2VcbiAgICAvLyBuZWVkIHR3by4gVGhpcyBzaG91bGQgYmUgcmV2aXNpdGVkIHdoZW4gbWFraW5nIHRoZSByZWZhY3RvcnMgbWVudGlvbmVkIGluOlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvcHVsbC81MzYyMCNkaXNjdXNzaW9uX3IxNDMwOTE4ODIyXG4gICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5SZXBlYXRlckNyZWF0ZSAmJiBvcC5lbXB0eVZpZXcgIT09IG51bGwpIHtcbiAgICAgIG1hcC5zZXQob3AuZW1wdHlWaWV3LCBvcCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBtYXA7XG59XG4iXX0=