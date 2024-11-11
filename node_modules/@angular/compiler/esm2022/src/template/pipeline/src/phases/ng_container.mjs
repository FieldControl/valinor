/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvbmdfY29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9CLE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQztBQUVyQzs7R0FFRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxHQUFtQjtJQUN4RCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixNQUFNLG1CQUFtQixHQUFHLElBQUksR0FBRyxFQUFhLENBQUM7UUFDakQsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEtBQUssYUFBYSxFQUFFLENBQUM7Z0JBQ25FLGdFQUFnRTtnQkFDL0QsRUFBeUIsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7Z0JBQzNELG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkMsQ0FBQztZQUVELElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3pFLGdGQUFnRjtnQkFDL0UsRUFBeUIsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7WUFDM0QsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbmNvbnN0IENPTlRBSU5FUl9UQUcgPSAnbmctY29udGFpbmVyJztcblxuLyoqXG4gKiBSZXBsYWNlIGFuIGBFbGVtZW50YCBvciBgRWxlbWVudFN0YXJ0YCB3aG9zZSB0YWcgaXMgYG5nLWNvbnRhaW5lcmAgd2l0aCBhIHNwZWNpZmljIG9wLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVOZ0NvbnRhaW5lck9wcyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBjb25zdCB1cGRhdGVkRWxlbWVudFhyZWZzID0gbmV3IFNldDxpci5YcmVmSWQ+KCk7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5FbGVtZW50U3RhcnQgJiYgb3AudGFnID09PSBDT05UQUlORVJfVEFHKSB7XG4gICAgICAgIC8vIFRyYW5zbXV0ZSB0aGUgYEVsZW1lbnRTdGFydGAgaW5zdHJ1Y3Rpb24gdG8gYENvbnRhaW5lclN0YXJ0YC5cbiAgICAgICAgKG9wIGFzIGlyLk9wPGlyLkNyZWF0ZU9wPikua2luZCA9IGlyLk9wS2luZC5Db250YWluZXJTdGFydDtcbiAgICAgICAgdXBkYXRlZEVsZW1lbnRYcmVmcy5hZGQob3AueHJlZik7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuRWxlbWVudEVuZCAmJiB1cGRhdGVkRWxlbWVudFhyZWZzLmhhcyhvcC54cmVmKSkge1xuICAgICAgICAvLyBUaGlzIGBFbGVtZW50RW5kYCBpcyBhc3NvY2lhdGVkIHdpdGggYW4gYEVsZW1lbnRTdGFydGAgd2UgYWxyZWFkeSB0cmFuc211dGVkLlxuICAgICAgICAob3AgYXMgaXIuT3A8aXIuQ3JlYXRlT3A+KS5raW5kID0gaXIuT3BLaW5kLkNvbnRhaW5lckVuZDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==