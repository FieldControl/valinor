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
            if (eligibleOpKind && op.expression instanceof ir.Interpolation &&
                op.expression.strings.length === 2 &&
                op.expression.strings.every((s) => s === '')) {
                op.expression = op.expression.expressions[0];
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGFwc2Vfc2luZ2xldG9uX2ludGVycG9sYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvY29sbGFwc2Vfc2luZ2xldG9uX2ludGVycG9sYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7Ozs7Ozs7R0FTRztBQUNILE1BQU0sVUFBVSwrQkFBK0IsQ0FBQyxHQUFtQjtJQUNqRSxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ3ZELElBQUksY0FBYyxJQUFJLEVBQUUsQ0FBQyxVQUFVLFlBQVksRUFBRSxDQUFDLGFBQWE7Z0JBQzNELEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUNsQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUN6RCxFQUFFLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIEF0dHJpYnV0ZSBpbnRlcnBvbGF0aW9ucyBvZiB0aGUgZm9ybSBgW2F0dHIuZm9vXT1cInt7Zm9vfX1cIlwiYCBzaG91bGQgYmUgXCJjb2xsYXBzZWRcIiBpbnRvIGEgcGxhaW5cbiAqIGF0dHJpYnV0ZSBpbnN0cnVjdGlvbiwgaW5zdGVhZCBvZiBhbiBgYXR0cmlidXRlSW50ZXJwb2xhdGVgIGluc3RydWN0aW9uLlxuICpcbiAqIChXZSBjYW5ub3QgZG8gdGhpcyBmb3Igc2luZ2xldG9uIHByb3BlcnR5IGludGVycG9sYXRpb25zLCBiZWNhdXNlIGBwcm9wZXJ0eUludGVycG9sYXRlYFxuICogc3RyaW5naWZpZXMgaXRzIGV4cHJlc3Npb24uKVxuICpcbiAqIFRoZSByZWlmaWNhdGlvbiBzdGVwIGlzIGFsc28gY2FwYWJsZSBvZiBwZXJmb3JtaW5nIHRoaXMgdHJhbnNmb3JtYXRpb24sIGJ1dCBkb2luZyBpdCBlYXJseSBpbiB0aGVcbiAqIHBpcGVsaW5lIGFsbG93cyBvdGhlciBwaGFzZXMgdG8gYWNjdXJhdGVseSBrbm93IHdoYXQgaW5zdHJ1Y3Rpb24gd2lsbCBiZSBlbWl0dGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29sbGFwc2VTaW5nbGV0b25JbnRlcnBvbGF0aW9ucyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQudXBkYXRlKSB7XG4gICAgICBjb25zdCBlbGlnaWJsZU9wS2luZCA9IG9wLmtpbmQgPT09IGlyLk9wS2luZC5BdHRyaWJ1dGU7XG4gICAgICBpZiAoZWxpZ2libGVPcEtpbmQgJiYgb3AuZXhwcmVzc2lvbiBpbnN0YW5jZW9mIGlyLkludGVycG9sYXRpb24gJiZcbiAgICAgICAgICBvcC5leHByZXNzaW9uLnN0cmluZ3MubGVuZ3RoID09PSAyICYmXG4gICAgICAgICAgb3AuZXhwcmVzc2lvbi5zdHJpbmdzLmV2ZXJ5KChzOiBzdHJpbmcpID0+IHMgPT09ICcnKSkge1xuICAgICAgICBvcC5leHByZXNzaW9uID0gb3AuZXhwcmVzc2lvbi5leHByZXNzaW9uc1swXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==