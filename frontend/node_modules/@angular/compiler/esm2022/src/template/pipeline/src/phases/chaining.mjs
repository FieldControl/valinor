/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../output/output_ast';
import { Identifiers as R3 } from '../../../../render3/r3_identifiers';
import * as ir from '../../ir';
const CHAINABLE = new Set([
    R3.attribute,
    R3.classProp,
    R3.element,
    R3.elementContainer,
    R3.elementContainerEnd,
    R3.elementContainerStart,
    R3.elementEnd,
    R3.elementStart,
    R3.hostProperty,
    R3.i18nExp,
    R3.listener,
    R3.listener,
    R3.property,
    R3.styleProp,
    R3.stylePropInterpolate1,
    R3.stylePropInterpolate2,
    R3.stylePropInterpolate3,
    R3.stylePropInterpolate4,
    R3.stylePropInterpolate5,
    R3.stylePropInterpolate6,
    R3.stylePropInterpolate7,
    R3.stylePropInterpolate8,
    R3.stylePropInterpolateV,
    R3.syntheticHostListener,
    R3.syntheticHostProperty,
    R3.templateCreate,
    R3.twoWayProperty,
    R3.twoWayListener,
]);
/**
 * Post-process a reified view compilation and convert sequential calls to chainable instructions
 * into chain calls.
 *
 * For example, two `elementStart` operations in sequence:
 *
 * ```typescript
 * elementStart(0, 'div');
 * elementStart(1, 'span');
 * ```
 *
 * Can be called as a chain instead:
 *
 * ```typescript
 * elementStart(0, 'div')(1, 'span');
 * ```
 */
export function chain(job) {
    for (const unit of job.units) {
        chainOperationsInList(unit.create);
        chainOperationsInList(unit.update);
    }
}
function chainOperationsInList(opList) {
    let chain = null;
    for (const op of opList) {
        if (op.kind !== ir.OpKind.Statement || !(op.statement instanceof o.ExpressionStatement)) {
            // This type of statement isn't chainable.
            chain = null;
            continue;
        }
        if (!(op.statement.expr instanceof o.InvokeFunctionExpr) ||
            !(op.statement.expr.fn instanceof o.ExternalExpr)) {
            // This is a statement, but not an instruction-type call, so not chainable.
            chain = null;
            continue;
        }
        const instruction = op.statement.expr.fn.value;
        if (!CHAINABLE.has(instruction)) {
            // This instruction isn't chainable.
            chain = null;
            continue;
        }
        // This instruction can be chained. It can either be added on to the previous chain (if
        // compatible) or it can be the start of a new chain.
        if (chain !== null && chain.instruction === instruction) {
            // This instruction can be added onto the previous chain.
            const expression = chain.expression.callFn(op.statement.expr.args, op.statement.expr.sourceSpan, op.statement.expr.pure);
            chain.expression = expression;
            chain.op.statement = expression.toStmt();
            ir.OpList.remove(op);
        }
        else {
            // Leave this instruction alone for now, but consider it the start of a new chain.
            chain = {
                op,
                instruction,
                expression: op.statement.expr,
            };
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW5pbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9jaGFpbmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxXQUFXLElBQUksRUFBRSxFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDckUsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDeEIsRUFBRSxDQUFDLFNBQVM7SUFDWixFQUFFLENBQUMsU0FBUztJQUNaLEVBQUUsQ0FBQyxPQUFPO0lBQ1YsRUFBRSxDQUFDLGdCQUFnQjtJQUNuQixFQUFFLENBQUMsbUJBQW1CO0lBQ3RCLEVBQUUsQ0FBQyxxQkFBcUI7SUFDeEIsRUFBRSxDQUFDLFVBQVU7SUFDYixFQUFFLENBQUMsWUFBWTtJQUNmLEVBQUUsQ0FBQyxZQUFZO0lBQ2YsRUFBRSxDQUFDLE9BQU87SUFDVixFQUFFLENBQUMsUUFBUTtJQUNYLEVBQUUsQ0FBQyxRQUFRO0lBQ1gsRUFBRSxDQUFDLFFBQVE7SUFDWCxFQUFFLENBQUMsU0FBUztJQUNaLEVBQUUsQ0FBQyxxQkFBcUI7SUFDeEIsRUFBRSxDQUFDLHFCQUFxQjtJQUN4QixFQUFFLENBQUMscUJBQXFCO0lBQ3hCLEVBQUUsQ0FBQyxxQkFBcUI7SUFDeEIsRUFBRSxDQUFDLHFCQUFxQjtJQUN4QixFQUFFLENBQUMscUJBQXFCO0lBQ3hCLEVBQUUsQ0FBQyxxQkFBcUI7SUFDeEIsRUFBRSxDQUFDLHFCQUFxQjtJQUN4QixFQUFFLENBQUMscUJBQXFCO0lBQ3hCLEVBQUUsQ0FBQyxxQkFBcUI7SUFDeEIsRUFBRSxDQUFDLHFCQUFxQjtJQUN4QixFQUFFLENBQUMsY0FBYztJQUNqQixFQUFFLENBQUMsY0FBYztJQUNqQixFQUFFLENBQUMsY0FBYztDQUNsQixDQUFDLENBQUM7QUFFSDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILE1BQU0sVUFBVSxLQUFLLENBQUMsR0FBbUI7SUFDdkMsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IscUJBQXFCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLHFCQUFxQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQyxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsTUFBMEM7SUFDdkUsSUFBSSxLQUFLLEdBQWUsSUFBSSxDQUFDO0lBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksTUFBTSxFQUFFLENBQUM7UUFDeEIsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxZQUFZLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7WUFDeEYsMENBQTBDO1lBQzFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDYixTQUFTO1FBQ1gsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQztZQUNwRCxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1lBQ3RELDJFQUEyRTtZQUMzRSxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2IsU0FBUztRQUNYLENBQUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQy9DLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7WUFDaEMsb0NBQW9DO1lBQ3BDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDYixTQUFTO1FBQ1gsQ0FBQztRQUVELHVGQUF1RjtRQUN2RixxREFBcUQ7UUFDckQsSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLEtBQUssQ0FBQyxXQUFXLEtBQUssV0FBVyxFQUFFLENBQUM7WUFDeEQseURBQXlEO1lBQ3pELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUN0QyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xGLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQzlCLEtBQUssQ0FBQyxFQUFFLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN6QyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFvQyxDQUFDLENBQUM7UUFDekQsQ0FBQzthQUFNLENBQUM7WUFDTixrRkFBa0Y7WUFDbEYsS0FBSyxHQUFHO2dCQUNOLEVBQUU7Z0JBQ0YsV0FBVztnQkFDWCxVQUFVLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJO2FBQzlCLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge0lkZW50aWZpZXJzIGFzIFIzfSBmcm9tICcuLi8uLi8uLi8uLi9yZW5kZXIzL3IzX2lkZW50aWZpZXJzJztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuY29uc3QgQ0hBSU5BQkxFID0gbmV3IFNldChbXG4gIFIzLmF0dHJpYnV0ZSxcbiAgUjMuY2xhc3NQcm9wLFxuICBSMy5lbGVtZW50LFxuICBSMy5lbGVtZW50Q29udGFpbmVyLFxuICBSMy5lbGVtZW50Q29udGFpbmVyRW5kLFxuICBSMy5lbGVtZW50Q29udGFpbmVyU3RhcnQsXG4gIFIzLmVsZW1lbnRFbmQsXG4gIFIzLmVsZW1lbnRTdGFydCxcbiAgUjMuaG9zdFByb3BlcnR5LFxuICBSMy5pMThuRXhwLFxuICBSMy5saXN0ZW5lcixcbiAgUjMubGlzdGVuZXIsXG4gIFIzLnByb3BlcnR5LFxuICBSMy5zdHlsZVByb3AsXG4gIFIzLnN0eWxlUHJvcEludGVycG9sYXRlMSxcbiAgUjMuc3R5bGVQcm9wSW50ZXJwb2xhdGUyLFxuICBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTMsXG4gIFIzLnN0eWxlUHJvcEludGVycG9sYXRlNCxcbiAgUjMuc3R5bGVQcm9wSW50ZXJwb2xhdGU1LFxuICBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTYsXG4gIFIzLnN0eWxlUHJvcEludGVycG9sYXRlNyxcbiAgUjMuc3R5bGVQcm9wSW50ZXJwb2xhdGU4LFxuICBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZVYsXG4gIFIzLnN5bnRoZXRpY0hvc3RMaXN0ZW5lcixcbiAgUjMuc3ludGhldGljSG9zdFByb3BlcnR5LFxuICBSMy50ZW1wbGF0ZUNyZWF0ZSxcbiAgUjMudHdvV2F5UHJvcGVydHksXG4gIFIzLnR3b1dheUxpc3RlbmVyLFxuXSk7XG5cbi8qKlxuICogUG9zdC1wcm9jZXNzIGEgcmVpZmllZCB2aWV3IGNvbXBpbGF0aW9uIGFuZCBjb252ZXJ0IHNlcXVlbnRpYWwgY2FsbHMgdG8gY2hhaW5hYmxlIGluc3RydWN0aW9uc1xuICogaW50byBjaGFpbiBjYWxscy5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgdHdvIGBlbGVtZW50U3RhcnRgIG9wZXJhdGlvbnMgaW4gc2VxdWVuY2U6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZWxlbWVudFN0YXJ0KDAsICdkaXYnKTtcbiAqIGVsZW1lbnRTdGFydCgxLCAnc3BhbicpO1xuICogYGBgXG4gKlxuICogQ2FuIGJlIGNhbGxlZCBhcyBhIGNoYWluIGluc3RlYWQ6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZWxlbWVudFN0YXJ0KDAsICdkaXYnKSgxLCAnc3BhbicpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGFpbihqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBjaGFpbk9wZXJhdGlvbnNJbkxpc3QodW5pdC5jcmVhdGUpO1xuICAgIGNoYWluT3BlcmF0aW9uc0luTGlzdCh1bml0LnVwZGF0ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hhaW5PcGVyYXRpb25zSW5MaXN0KG9wTGlzdDogaXIuT3BMaXN0PGlyLkNyZWF0ZU9wfGlyLlVwZGF0ZU9wPik6IHZvaWQge1xuICBsZXQgY2hhaW46IENoYWlufG51bGwgPSBudWxsO1xuICBmb3IgKGNvbnN0IG9wIG9mIG9wTGlzdCkge1xuICAgIGlmIChvcC5raW5kICE9PSBpci5PcEtpbmQuU3RhdGVtZW50IHx8ICEob3Auc3RhdGVtZW50IGluc3RhbmNlb2Ygby5FeHByZXNzaW9uU3RhdGVtZW50KSkge1xuICAgICAgLy8gVGhpcyB0eXBlIG9mIHN0YXRlbWVudCBpc24ndCBjaGFpbmFibGUuXG4gICAgICBjaGFpbiA9IG51bGw7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKCEob3Auc3RhdGVtZW50LmV4cHIgaW5zdGFuY2VvZiBvLkludm9rZUZ1bmN0aW9uRXhwcikgfHxcbiAgICAgICAgIShvcC5zdGF0ZW1lbnQuZXhwci5mbiBpbnN0YW5jZW9mIG8uRXh0ZXJuYWxFeHByKSkge1xuICAgICAgLy8gVGhpcyBpcyBhIHN0YXRlbWVudCwgYnV0IG5vdCBhbiBpbnN0cnVjdGlvbi10eXBlIGNhbGwsIHNvIG5vdCBjaGFpbmFibGUuXG4gICAgICBjaGFpbiA9IG51bGw7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBpbnN0cnVjdGlvbiA9IG9wLnN0YXRlbWVudC5leHByLmZuLnZhbHVlO1xuICAgIGlmICghQ0hBSU5BQkxFLmhhcyhpbnN0cnVjdGlvbikpIHtcbiAgICAgIC8vIFRoaXMgaW5zdHJ1Y3Rpb24gaXNuJ3QgY2hhaW5hYmxlLlxuICAgICAgY2hhaW4gPSBudWxsO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBpbnN0cnVjdGlvbiBjYW4gYmUgY2hhaW5lZC4gSXQgY2FuIGVpdGhlciBiZSBhZGRlZCBvbiB0byB0aGUgcHJldmlvdXMgY2hhaW4gKGlmXG4gICAgLy8gY29tcGF0aWJsZSkgb3IgaXQgY2FuIGJlIHRoZSBzdGFydCBvZiBhIG5ldyBjaGFpbi5cbiAgICBpZiAoY2hhaW4gIT09IG51bGwgJiYgY2hhaW4uaW5zdHJ1Y3Rpb24gPT09IGluc3RydWN0aW9uKSB7XG4gICAgICAvLyBUaGlzIGluc3RydWN0aW9uIGNhbiBiZSBhZGRlZCBvbnRvIHRoZSBwcmV2aW91cyBjaGFpbi5cbiAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSBjaGFpbi5leHByZXNzaW9uLmNhbGxGbihcbiAgICAgICAgICBvcC5zdGF0ZW1lbnQuZXhwci5hcmdzLCBvcC5zdGF0ZW1lbnQuZXhwci5zb3VyY2VTcGFuLCBvcC5zdGF0ZW1lbnQuZXhwci5wdXJlKTtcbiAgICAgIGNoYWluLmV4cHJlc3Npb24gPSBleHByZXNzaW9uO1xuICAgICAgY2hhaW4ub3Auc3RhdGVtZW50ID0gZXhwcmVzc2lvbi50b1N0bXQoKTtcbiAgICAgIGlyLk9wTGlzdC5yZW1vdmUob3AgYXMgaXIuT3A8aXIuQ3JlYXRlT3B8aXIuVXBkYXRlT3A+KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTGVhdmUgdGhpcyBpbnN0cnVjdGlvbiBhbG9uZSBmb3Igbm93LCBidXQgY29uc2lkZXIgaXQgdGhlIHN0YXJ0IG9mIGEgbmV3IGNoYWluLlxuICAgICAgY2hhaW4gPSB7XG4gICAgICAgIG9wLFxuICAgICAgICBpbnN0cnVjdGlvbixcbiAgICAgICAgZXhwcmVzc2lvbjogb3Auc3RhdGVtZW50LmV4cHIsXG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFN0cnVjdHVyZSByZXByZXNlbnRpbmcgYW4gaW4tcHJvZ3Jlc3MgY2hhaW4uXG4gKi9cbmludGVyZmFjZSBDaGFpbiB7XG4gIC8qKlxuICAgKiBUaGUgc3RhdGVtZW50IHdoaWNoIGhvbGRzIHRoZSBlbnRpcmUgY2hhaW4uXG4gICAqL1xuICBvcDogaXIuU3RhdGVtZW50T3A8aXIuQ3JlYXRlT3B8aXIuVXBkYXRlT3A+O1xuXG4gIC8qKlxuICAgKiBUaGUgZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgdGhlIHdob2xlIGN1cnJlbnQgY2hhaW5lZCBjYWxsLlxuICAgKlxuICAgKiBUaGlzIHNob3VsZCBiZSB0aGUgc2FtZSBhcyBgb3Auc3RhdGVtZW50LmV4cHJlc3Npb25gLCBidXQgaXMgZXh0cmFjdGVkIGhlcmUgZm9yIGNvbnZlbmllbmNlXG4gICAqIHNpbmNlIHRoZSBgb3BgIHR5cGUgZG9lc24ndCBjYXB0dXJlIHRoZSBmYWN0IHRoYXQgYG9wLnN0YXRlbWVudGAgaXMgYW4gYG8uRXhwcmVzc2lvblN0YXRlbWVudGAuXG4gICAqL1xuICBleHByZXNzaW9uOiBvLkV4cHJlc3Npb247XG5cbiAgLyoqXG4gICAqIFRoZSBpbnN0cnVjdGlvbiB0aGF0IGlzIGJlaW5nIGNoYWluZWQuXG4gICAqL1xuICBpbnN0cnVjdGlvbjogby5FeHRlcm5hbFJlZmVyZW5jZTtcbn1cbiJdfQ==