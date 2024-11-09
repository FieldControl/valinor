/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGhhc2VfcmVtb3ZlX2NvbnRlbnRfc2VsZWN0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcGhhc2VfcmVtb3ZlX2NvbnRlbnRfc2VsZWN0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRS9CLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUVqRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsc0JBQXNCLENBQUMsR0FBbUI7SUFDeEQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsTUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDNUIsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPO29CQUNwQixNQUFNLE1BQU0sR0FBRyxlQUFlLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDcEQsSUFBSSxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO3dCQUN2RSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBYyxFQUFFLENBQUMsQ0FBQztvQkFDcEMsQ0FBQztvQkFDRCxNQUFNO1lBQ1YsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQUMsSUFBWTtJQUNyQyxPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLENBQUM7QUFDekMsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxlQUFlLENBQUMsR0FBdUQsRUFBRSxJQUFlO0lBRS9GLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekIsSUFBSSxFQUFFLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFDRCxPQUFPLEVBQUUsQ0FBQztBQUNaLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5pbXBvcnQge2NyZWF0ZU9wWHJlZk1hcH0gZnJvbSAnLi4vdXRpbC9lbGVtZW50cyc7XG5cbi8qKlxuICogQXR0cmlidXRlcyBvZiBgbmctY29udGVudGAgbmFtZWQgJ3NlbGVjdCcgYXJlIHNwZWNpZmljYWxseSByZW1vdmVkLCBiZWNhdXNlIHRoZXkgY29udHJvbCB3aGljaFxuICogY29udGVudCBtYXRjaGVzIGFzIGEgcHJvcGVydHkgb2YgdGhlIGBwcm9qZWN0aW9uYCwgYW5kIGFyZSBub3QgYSBwbGFpbiBhdHRyaWJ1dGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVDb250ZW50U2VsZWN0b3JzKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gY3JlYXRlT3BYcmVmTWFwKHVuaXQpO1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5vcHMoKSkge1xuICAgICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkJpbmRpbmc6XG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID0gbG9va3VwSW5YcmVmTWFwKGVsZW1lbnRzLCBvcC50YXJnZXQpO1xuICAgICAgICAgIGlmIChpc1NlbGVjdEF0dHJpYnV0ZShvcC5uYW1lKSAmJiB0YXJnZXQua2luZCA9PT0gaXIuT3BLaW5kLlByb2plY3Rpb24pIHtcbiAgICAgICAgICAgIGlyLk9wTGlzdC5yZW1vdmU8aXIuVXBkYXRlT3A+KG9wKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzU2VsZWN0QXR0cmlidXRlKG5hbWU6IHN0cmluZykge1xuICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2VsZWN0Jztcbn1cblxuLyoqXG4gKiBMb29rcyB1cCBhbiBlbGVtZW50IGluIHRoZSBnaXZlbiBtYXAgYnkgeHJlZiBJRC5cbiAqL1xuZnVuY3Rpb24gbG9va3VwSW5YcmVmTWFwKG1hcDogTWFwPGlyLlhyZWZJZCwgaXIuQ29uc3VtZXNTbG90T3BUcmFpdCZpci5DcmVhdGVPcD4sIHhyZWY6IGlyLlhyZWZJZCk6XG4gICAgaXIuQ29uc3VtZXNTbG90T3BUcmFpdCZpci5DcmVhdGVPcCB7XG4gIGNvbnN0IGVsID0gbWFwLmdldCh4cmVmKTtcbiAgaWYgKGVsID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0FsbCBhdHRyaWJ1dGVzIHNob3VsZCBoYXZlIGFuIHNsb3R0YWJsZSB0YXJnZXQuJyk7XG4gIH1cbiAgcmV0dXJuIGVsO1xufVxuIl19