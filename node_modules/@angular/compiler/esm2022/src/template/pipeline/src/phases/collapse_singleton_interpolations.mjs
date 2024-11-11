/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Attribute interpolations of the form `[attr.foo]="{{foo}}""` should be "collapsed" into a plain
 * attribute instruction, instead of an `attributeInterpolate` instruction.
 *
 * (We cannot do this for singleton property interpolations, because `propertyInterpolate`
 * stringifies its expression.)
 *
 * The reification step is also capable of performing this transformation, but doing it early in the
 * pipeline allows other phases to accurately know what instruction will be emitted.
 */
export function collapseSingletonInterpolations(job) {
    for (const unit of job.units) {
        for (const op of unit.update) {
            const eligibleOpKind = op.kind === ir.OpKind.Attribute;
            if (eligibleOpKind &&
                op.expression instanceof ir.Interpolation &&
                op.expression.strings.length === 2 &&
                op.expression.strings.every((s) => s === '')) {
                op.expression = op.expression.expressions[0];
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGFwc2Vfc2luZ2xldG9uX2ludGVycG9sYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvY29sbGFwc2Vfc2luZ2xldG9uX2ludGVycG9sYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSwrQkFBK0IsQ0FBQyxHQUFtQjtJQUNqRSxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ3ZELElBQ0UsY0FBYztnQkFDZCxFQUFFLENBQUMsVUFBVSxZQUFZLEVBQUUsQ0FBQyxhQUFhO2dCQUN6QyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDbEMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQ3BELENBQUM7Z0JBQ0QsRUFBRSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogQXR0cmlidXRlIGludGVycG9sYXRpb25zIG9mIHRoZSBmb3JtIGBbYXR0ci5mb29dPVwie3tmb299fVwiXCJgIHNob3VsZCBiZSBcImNvbGxhcHNlZFwiIGludG8gYSBwbGFpblxuICogYXR0cmlidXRlIGluc3RydWN0aW9uLCBpbnN0ZWFkIG9mIGFuIGBhdHRyaWJ1dGVJbnRlcnBvbGF0ZWAgaW5zdHJ1Y3Rpb24uXG4gKlxuICogKFdlIGNhbm5vdCBkbyB0aGlzIGZvciBzaW5nbGV0b24gcHJvcGVydHkgaW50ZXJwb2xhdGlvbnMsIGJlY2F1c2UgYHByb3BlcnR5SW50ZXJwb2xhdGVgXG4gKiBzdHJpbmdpZmllcyBpdHMgZXhwcmVzc2lvbi4pXG4gKlxuICogVGhlIHJlaWZpY2F0aW9uIHN0ZXAgaXMgYWxzbyBjYXBhYmxlIG9mIHBlcmZvcm1pbmcgdGhpcyB0cmFuc2Zvcm1hdGlvbiwgYnV0IGRvaW5nIGl0IGVhcmx5IGluIHRoZVxuICogcGlwZWxpbmUgYWxsb3dzIG90aGVyIHBoYXNlcyB0byBhY2N1cmF0ZWx5IGtub3cgd2hhdCBpbnN0cnVjdGlvbiB3aWxsIGJlIGVtaXR0ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsYXBzZVNpbmdsZXRvbkludGVycG9sYXRpb25zKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC51cGRhdGUpIHtcbiAgICAgIGNvbnN0IGVsaWdpYmxlT3BLaW5kID0gb3Aua2luZCA9PT0gaXIuT3BLaW5kLkF0dHJpYnV0ZTtcbiAgICAgIGlmIChcbiAgICAgICAgZWxpZ2libGVPcEtpbmQgJiZcbiAgICAgICAgb3AuZXhwcmVzc2lvbiBpbnN0YW5jZW9mIGlyLkludGVycG9sYXRpb24gJiZcbiAgICAgICAgb3AuZXhwcmVzc2lvbi5zdHJpbmdzLmxlbmd0aCA9PT0gMiAmJlxuICAgICAgICBvcC5leHByZXNzaW9uLnN0cmluZ3MuZXZlcnkoKHM6IHN0cmluZykgPT4gcyA9PT0gJycpXG4gICAgICApIHtcbiAgICAgICAgb3AuZXhwcmVzc2lvbiA9IG9wLmV4cHJlc3Npb24uZXhwcmVzc2lvbnNbMF07XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=