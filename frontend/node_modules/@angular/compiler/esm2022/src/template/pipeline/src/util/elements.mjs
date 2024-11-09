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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3V0aWwvZWxlbWVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7O0dBRUc7QUFDSCxNQUFNLFVBQVUsZUFBZSxDQUFDLElBQXFCO0lBRW5ELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUFpRCxDQUFDO0lBQ3JFLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUNqQyxTQUFTO1FBQ1gsQ0FBQztRQUNELEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVyQixrRkFBa0Y7UUFDbEYsdUZBQXVGO1FBQ3ZGLDZFQUE2RTtRQUM3RSx1RUFBdUU7UUFDdkUsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxJQUFJLEVBQUUsQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDbEUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB0eXBlIHtDb21waWxhdGlvblVuaXR9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBHZXRzIGEgbWFwIG9mIGFsbCBlbGVtZW50cyBpbiB0aGUgZ2l2ZW4gdmlldyBieSB0aGVpciB4cmVmIGlkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlT3BYcmVmTWFwKHVuaXQ6IENvbXBpbGF0aW9uVW5pdCk6XG4gICAgTWFwPGlyLlhyZWZJZCwgaXIuQ29uc3VtZXNTbG90T3BUcmFpdCZpci5DcmVhdGVPcD4ge1xuICBjb25zdCBtYXAgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuQ29uc3VtZXNTbG90T3BUcmFpdCZpci5DcmVhdGVPcD4oKTtcbiAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgIGlmICghaXIuaGFzQ29uc3VtZXNTbG90VHJhaXQob3ApKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgbWFwLnNldChvcC54cmVmLCBvcCk7XG5cbiAgICAvLyBUT0RPKGR5bGh1bm4pOiBgQGZvcmAgbG9vcHMgd2l0aCBgQGVtcHR5YCBibG9ja3MgbmVlZCB0byBiZSBzcGVjaWFsLWNhc2VkIGhlcmUsXG4gICAgLy8gYmVjYXVzZSB0aGUgc2xvdCBjb25zdW1lciB0cmFpdCBjdXJyZW50bHkgb25seSBzdXBwb3J0cyBvbmUgc2xvdCBwZXIgY29uc3VtZXIgYW5kIHdlXG4gICAgLy8gbmVlZCB0d28uIFRoaXMgc2hvdWxkIGJlIHJldmlzaXRlZCB3aGVuIG1ha2luZyB0aGUgcmVmYWN0b3JzIG1lbnRpb25lZCBpbjpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL3B1bGwvNTM2MjAjZGlzY3Vzc2lvbl9yMTQzMDkxODgyMlxuICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuUmVwZWF0ZXJDcmVhdGUgJiYgb3AuZW1wdHlWaWV3ICE9PSBudWxsKSB7XG4gICAgICBtYXAuc2V0KG9wLmVtcHR5Vmlldywgb3ApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbWFwO1xufVxuIl19