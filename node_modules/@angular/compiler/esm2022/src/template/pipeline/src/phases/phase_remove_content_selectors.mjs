/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
import { createOpXrefMap } from '../util/elements';
/**
 * Attributes of `ng-content` named 'select' are specifically removed, because they control which
 * content matches as a property of the `projection`, and are not a plain attribute.
 */
export function removeContentSelectors(job) {
    for (const unit of job.units) {
        const elements = createOpXrefMap(unit);
        for (const op of unit.ops()) {
            switch (op.kind) {
                case ir.OpKind.Binding:
                    const target = lookupInXrefMap(elements, op.target);
                    if (isSelectAttribute(op.name) && target.kind === ir.OpKind.Projection) {
                        ir.OpList.remove(op);
                    }
                    break;
            }
        }
    }
}
function isSelectAttribute(name) {
    return name.toLowerCase() === 'select';
}
/**
 * Looks up an element in the given map by xref ID.
 */
function lookupInXrefMap(map, xref) {
    const el = map.get(xref);
    if (el === undefined) {
        throw new Error('All attributes should have an slottable target.');
    }
    return el;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGhhc2VfcmVtb3ZlX2NvbnRlbnRfc2VsZWN0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcGhhc2VfcmVtb3ZlX2NvbnRlbnRfc2VsZWN0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRS9CLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUVqRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsc0JBQXNCLENBQUMsR0FBbUI7SUFDeEQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsTUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDNUIsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPO29CQUNwQixNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDcEQsSUFBSSxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO3dCQUN2RSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBYyxFQUFFLENBQUMsQ0FBQztvQkFDcEMsQ0FBQztvQkFDRCxNQUFNO1lBQ1YsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQUMsSUFBWTtJQUNyQyxPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLENBQUM7QUFDekMsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxlQUFlLENBQ3RCLEdBQXlELEVBQ3pELElBQWU7SUFFZixNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pCLElBQUksRUFBRSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsaURBQWlELENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBQ0QsT0FBTyxFQUFFLENBQUM7QUFDWixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQgdHlwZSB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcbmltcG9ydCB7Y3JlYXRlT3BYcmVmTWFwfSBmcm9tICcuLi91dGlsL2VsZW1lbnRzJztcblxuLyoqXG4gKiBBdHRyaWJ1dGVzIG9mIGBuZy1jb250ZW50YCBuYW1lZCAnc2VsZWN0JyBhcmUgc3BlY2lmaWNhbGx5IHJlbW92ZWQsIGJlY2F1c2UgdGhleSBjb250cm9sIHdoaWNoXG4gKiBjb250ZW50IG1hdGNoZXMgYXMgYSBwcm9wZXJ0eSBvZiB0aGUgYHByb2plY3Rpb25gLCBhbmQgYXJlIG5vdCBhIHBsYWluIGF0dHJpYnV0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUNvbnRlbnRTZWxlY3RvcnMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgY29uc3QgZWxlbWVudHMgPSBjcmVhdGVPcFhyZWZNYXAodW5pdCk7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0Lm9wcygpKSB7XG4gICAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuQmluZGluZzpcbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSBsb29rdXBJblhyZWZNYXAoZWxlbWVudHMsIG9wLnRhcmdldCk7XG4gICAgICAgICAgaWYgKGlzU2VsZWN0QXR0cmlidXRlKG9wLm5hbWUpICYmIHRhcmdldC5raW5kID09PSBpci5PcEtpbmQuUHJvamVjdGlvbikge1xuICAgICAgICAgICAgaXIuT3BMaXN0LnJlbW92ZTxpci5VcGRhdGVPcD4ob3ApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNTZWxlY3RBdHRyaWJ1dGUobmFtZTogc3RyaW5nKSB7XG4gIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWxlY3QnO1xufVxuXG4vKipcbiAqIExvb2tzIHVwIGFuIGVsZW1lbnQgaW4gdGhlIGdpdmVuIG1hcCBieSB4cmVmIElELlxuICovXG5mdW5jdGlvbiBsb29rdXBJblhyZWZNYXAoXG4gIG1hcDogTWFwPGlyLlhyZWZJZCwgaXIuQ29uc3VtZXNTbG90T3BUcmFpdCAmIGlyLkNyZWF0ZU9wPixcbiAgeHJlZjogaXIuWHJlZklkLFxuKTogaXIuQ29uc3VtZXNTbG90T3BUcmFpdCAmIGlyLkNyZWF0ZU9wIHtcbiAgY29uc3QgZWwgPSBtYXAuZ2V0KHhyZWYpO1xuICBpZiAoZWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignQWxsIGF0dHJpYnV0ZXMgc2hvdWxkIGhhdmUgYW4gc2xvdHRhYmxlIHRhcmdldC4nKTtcbiAgfVxuICByZXR1cm4gZWw7XG59XG4iXX0=