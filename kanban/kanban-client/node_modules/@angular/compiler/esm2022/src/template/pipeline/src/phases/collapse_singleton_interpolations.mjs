/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGFwc2Vfc2luZ2xldG9uX2ludGVycG9sYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvY29sbGFwc2Vfc2luZ2xldG9uX2ludGVycG9sYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSwrQkFBK0IsQ0FBQyxHQUFtQjtJQUNqRSxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ3ZELElBQ0UsY0FBYztnQkFDZCxFQUFFLENBQUMsVUFBVSxZQUFZLEVBQUUsQ0FBQyxhQUFhO2dCQUN6QyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDbEMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQ3BELENBQUM7Z0JBQ0QsRUFBRSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBBdHRyaWJ1dGUgaW50ZXJwb2xhdGlvbnMgb2YgdGhlIGZvcm0gYFthdHRyLmZvb109XCJ7e2Zvb319XCJcImAgc2hvdWxkIGJlIFwiY29sbGFwc2VkXCIgaW50byBhIHBsYWluXG4gKiBhdHRyaWJ1dGUgaW5zdHJ1Y3Rpb24sIGluc3RlYWQgb2YgYW4gYGF0dHJpYnV0ZUludGVycG9sYXRlYCBpbnN0cnVjdGlvbi5cbiAqXG4gKiAoV2UgY2Fubm90IGRvIHRoaXMgZm9yIHNpbmdsZXRvbiBwcm9wZXJ0eSBpbnRlcnBvbGF0aW9ucywgYmVjYXVzZSBgcHJvcGVydHlJbnRlcnBvbGF0ZWBcbiAqIHN0cmluZ2lmaWVzIGl0cyBleHByZXNzaW9uLilcbiAqXG4gKiBUaGUgcmVpZmljYXRpb24gc3RlcCBpcyBhbHNvIGNhcGFibGUgb2YgcGVyZm9ybWluZyB0aGlzIHRyYW5zZm9ybWF0aW9uLCBidXQgZG9pbmcgaXQgZWFybHkgaW4gdGhlXG4gKiBwaXBlbGluZSBhbGxvd3Mgb3RoZXIgcGhhc2VzIHRvIGFjY3VyYXRlbHkga25vdyB3aGF0IGluc3RydWN0aW9uIHdpbGwgYmUgZW1pdHRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxhcHNlU2luZ2xldG9uSW50ZXJwb2xhdGlvbnMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LnVwZGF0ZSkge1xuICAgICAgY29uc3QgZWxpZ2libGVPcEtpbmQgPSBvcC5raW5kID09PSBpci5PcEtpbmQuQXR0cmlidXRlO1xuICAgICAgaWYgKFxuICAgICAgICBlbGlnaWJsZU9wS2luZCAmJlxuICAgICAgICBvcC5leHByZXNzaW9uIGluc3RhbmNlb2YgaXIuSW50ZXJwb2xhdGlvbiAmJlxuICAgICAgICBvcC5leHByZXNzaW9uLnN0cmluZ3MubGVuZ3RoID09PSAyICYmXG4gICAgICAgIG9wLmV4cHJlc3Npb24uc3RyaW5ncy5ldmVyeSgoczogc3RyaW5nKSA9PiBzID09PSAnJylcbiAgICAgICkge1xuICAgICAgICBvcC5leHByZXNzaW9uID0gb3AuZXhwcmVzc2lvbi5leHByZXNzaW9uc1swXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==