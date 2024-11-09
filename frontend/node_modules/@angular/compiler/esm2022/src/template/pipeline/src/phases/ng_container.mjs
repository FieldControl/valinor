/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';
const CONTAINER_TAG = 'ng-container';
/**
 * Replace an `Element` or `ElementStart` whose tag is `ng-container` with a specific op.
 */
export function generateNgContainerOps(job) {
    for (const unit of job.units) {
        const updatedElementXrefs = new Set();
        for (const op of unit.create) {
            if (op.kind === ir.OpKind.ElementStart && op.tag === CONTAINER_TAG) {
                // Transmute the `ElementStart` instruction to `ContainerStart`.
                op.kind = ir.OpKind.ContainerStart;
                updatedElementXrefs.add(op.xref);
            }
            if (op.kind === ir.OpKind.ElementEnd && updatedElementXrefs.has(op.xref)) {
                // This `ElementEnd` is associated with an `ElementStart` we already transmuted.
                op.kind = ir.OpKind.ContainerEnd;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvbmdfY29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9CLE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQztBQUVyQzs7R0FFRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxHQUFtQjtJQUN4RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixNQUFNLG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUFhLENBQUM7UUFDakQsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEtBQUssYUFBYSxFQUFFLENBQUM7Z0JBQ25FLGdFQUFnRTtnQkFDL0QsRUFBeUIsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7Z0JBQzNELG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkMsQ0FBQztZQUVELElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3pFLGdGQUFnRjtnQkFDL0UsRUFBeUIsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7WUFDM0QsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQgdHlwZSB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuY29uc3QgQ09OVEFJTkVSX1RBRyA9ICduZy1jb250YWluZXInO1xuXG4vKipcbiAqIFJlcGxhY2UgYW4gYEVsZW1lbnRgIG9yIGBFbGVtZW50U3RhcnRgIHdob3NlIHRhZyBpcyBgbmctY29udGFpbmVyYCB3aXRoIGEgc3BlY2lmaWMgb3AuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZU5nQ29udGFpbmVyT3BzKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGNvbnN0IHVwZGF0ZWRFbGVtZW50WHJlZnMgPSBuZXcgU2V0PGlyLlhyZWZJZD4oKTtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkVsZW1lbnRTdGFydCAmJiBvcC50YWcgPT09IENPTlRBSU5FUl9UQUcpIHtcbiAgICAgICAgLy8gVHJhbnNtdXRlIHRoZSBgRWxlbWVudFN0YXJ0YCBpbnN0cnVjdGlvbiB0byBgQ29udGFpbmVyU3RhcnRgLlxuICAgICAgICAob3AgYXMgaXIuT3A8aXIuQ3JlYXRlT3A+KS5raW5kID0gaXIuT3BLaW5kLkNvbnRhaW5lclN0YXJ0O1xuICAgICAgICB1cGRhdGVkRWxlbWVudFhyZWZzLmFkZChvcC54cmVmKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5FbGVtZW50RW5kICYmIHVwZGF0ZWRFbGVtZW50WHJlZnMuaGFzKG9wLnhyZWYpKSB7XG4gICAgICAgIC8vIFRoaXMgYEVsZW1lbnRFbmRgIGlzIGFzc29jaWF0ZWQgd2l0aCBhbiBgRWxlbWVudFN0YXJ0YCB3ZSBhbHJlYWR5IHRyYW5zbXV0ZWQuXG4gICAgICAgIChvcCBhcyBpci5PcDxpci5DcmVhdGVPcD4pLmtpbmQgPSBpci5PcEtpbmQuQ29udGFpbmVyRW5kO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19