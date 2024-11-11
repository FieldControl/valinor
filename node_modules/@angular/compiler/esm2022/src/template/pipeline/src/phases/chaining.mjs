/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
    R3.declareLet,
]);
/**
 * Chaining results in repeated call expressions, causing a deep AST of receiver expressions. To prevent running out of
 * stack depth the maximum number of chained instructions is limited to this threshold, which has been selected
 * arbitrarily.
 */
const MAX_CHAIN_LENGTH = 256;
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
        if (chain !== null && chain.instruction === instruction && chain.length < MAX_CHAIN_LENGTH) {
            // This instruction can be added onto the previous chain.
            const expression = chain.expression.callFn(op.statement.expr.args, op.statement.expr.sourceSpan, op.statement.expr.pure);
            chain.expression = expression;
            chain.op.statement = expression.toStmt();
            chain.length++;
            ir.OpList.remove(op);
        }
        else {
            // Leave this instruction alone for now, but consider it the start of a new chain.
            chain = {
                op,
                instruction,
                expression: op.statement.expr,
                length: 1,
            };
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW5pbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9jaGFpbmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxXQUFXLElBQUksRUFBRSxFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFDckUsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUM7SUFDeEIsRUFBRSxDQUFDLFNBQVM7SUFDWixFQUFFLENBQUMsU0FBUztJQUNaLEVBQUUsQ0FBQyxPQUFPO0lBQ1YsRUFBRSxDQUFDLGdCQUFnQjtJQUNuQixFQUFFLENBQUMsbUJBQW1CO0lBQ3RCLEVBQUUsQ0FBQyxxQkFBcUI7SUFDeEIsRUFBRSxDQUFDLFVBQVU7SUFDYixFQUFFLENBQUMsWUFBWTtJQUNmLEVBQUUsQ0FBQyxZQUFZO0lBQ2YsRUFBRSxDQUFDLE9BQU87SUFDVixFQUFFLENBQUMsUUFBUTtJQUNYLEVBQUUsQ0FBQyxRQUFRO0lBQ1gsRUFBRSxDQUFDLFFBQVE7SUFDWCxFQUFFLENBQUMsU0FBUztJQUNaLEVBQUUsQ0FBQyxxQkFBcUI7SUFDeEIsRUFBRSxDQUFDLHFCQUFxQjtJQUN4QixFQUFFLENBQUMscUJBQXFCO0lBQ3hCLEVBQUUsQ0FBQyxxQkFBcUI7SUFDeEIsRUFBRSxDQUFDLHFCQUFxQjtJQUN4QixFQUFFLENBQUMscUJBQXFCO0lBQ3hCLEVBQUUsQ0FBQyxxQkFBcUI7SUFDeEIsRUFBRSxDQUFDLHFCQUFxQjtJQUN4QixFQUFFLENBQUMscUJBQXFCO0lBQ3hCLEVBQUUsQ0FBQyxxQkFBcUI7SUFDeEIsRUFBRSxDQUFDLHFCQUFxQjtJQUN4QixFQUFFLENBQUMsY0FBYztJQUNqQixFQUFFLENBQUMsY0FBYztJQUNqQixFQUFFLENBQUMsY0FBYztJQUNqQixFQUFFLENBQUMsVUFBVTtDQUNkLENBQUMsQ0FBQztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQztBQUU3Qjs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILE1BQU0sVUFBVSxLQUFLLENBQUMsR0FBbUI7SUFDdkMsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IscUJBQXFCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLHFCQUFxQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQyxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsTUFBNEM7SUFDekUsSUFBSSxLQUFLLEdBQWlCLElBQUksQ0FBQztJQUMvQixLQUFLLE1BQU0sRUFBRSxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ3hCLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsWUFBWSxDQUFDLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDO1lBQ3hGLDBDQUEwQztZQUMxQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2IsU0FBUztRQUNYLENBQUM7UUFDRCxJQUNFLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksWUFBWSxDQUFDLENBQUMsa0JBQWtCLENBQUM7WUFDcEQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUMsWUFBWSxDQUFDLEVBQ2pELENBQUM7WUFDRCwyRUFBMkU7WUFDM0UsS0FBSyxHQUFHLElBQUksQ0FBQztZQUNiLFNBQVM7UUFDWCxDQUFDO1FBRUQsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQztRQUMvQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQ2hDLG9DQUFvQztZQUNwQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2IsU0FBUztRQUNYLENBQUM7UUFFRCx1RkFBdUY7UUFDdkYscURBQXFEO1FBQ3JELElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLENBQUMsV0FBVyxLQUFLLFdBQVcsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLGdCQUFnQixFQUFFLENBQUM7WUFDM0YseURBQXlEO1lBQ3pELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUN4QyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQ3RCLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFDNUIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUN2QixDQUFDO1lBQ0YsS0FBSyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDOUIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3pDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNmLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQXNDLENBQUMsQ0FBQztRQUMzRCxDQUFDO2FBQU0sQ0FBQztZQUNOLGtGQUFrRjtZQUNsRixLQUFLLEdBQUc7Z0JBQ04sRUFBRTtnQkFDRixXQUFXO2dCQUNYLFVBQVUsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUk7Z0JBQzdCLE1BQU0sRUFBRSxDQUFDO2FBQ1YsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge0lkZW50aWZpZXJzIGFzIFIzfSBmcm9tICcuLi8uLi8uLi8uLi9yZW5kZXIzL3IzX2lkZW50aWZpZXJzJztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuY29uc3QgQ0hBSU5BQkxFID0gbmV3IFNldChbXG4gIFIzLmF0dHJpYnV0ZSxcbiAgUjMuY2xhc3NQcm9wLFxuICBSMy5lbGVtZW50LFxuICBSMy5lbGVtZW50Q29udGFpbmVyLFxuICBSMy5lbGVtZW50Q29udGFpbmVyRW5kLFxuICBSMy5lbGVtZW50Q29udGFpbmVyU3RhcnQsXG4gIFIzLmVsZW1lbnRFbmQsXG4gIFIzLmVsZW1lbnRTdGFydCxcbiAgUjMuaG9zdFByb3BlcnR5LFxuICBSMy5pMThuRXhwLFxuICBSMy5saXN0ZW5lcixcbiAgUjMubGlzdGVuZXIsXG4gIFIzLnByb3BlcnR5LFxuICBSMy5zdHlsZVByb3AsXG4gIFIzLnN0eWxlUHJvcEludGVycG9sYXRlMSxcbiAgUjMuc3R5bGVQcm9wSW50ZXJwb2xhdGUyLFxuICBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTMsXG4gIFIzLnN0eWxlUHJvcEludGVycG9sYXRlNCxcbiAgUjMuc3R5bGVQcm9wSW50ZXJwb2xhdGU1LFxuICBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZTYsXG4gIFIzLnN0eWxlUHJvcEludGVycG9sYXRlNyxcbiAgUjMuc3R5bGVQcm9wSW50ZXJwb2xhdGU4LFxuICBSMy5zdHlsZVByb3BJbnRlcnBvbGF0ZVYsXG4gIFIzLnN5bnRoZXRpY0hvc3RMaXN0ZW5lcixcbiAgUjMuc3ludGhldGljSG9zdFByb3BlcnR5LFxuICBSMy50ZW1wbGF0ZUNyZWF0ZSxcbiAgUjMudHdvV2F5UHJvcGVydHksXG4gIFIzLnR3b1dheUxpc3RlbmVyLFxuICBSMy5kZWNsYXJlTGV0LFxuXSk7XG5cbi8qKlxuICogQ2hhaW5pbmcgcmVzdWx0cyBpbiByZXBlYXRlZCBjYWxsIGV4cHJlc3Npb25zLCBjYXVzaW5nIGEgZGVlcCBBU1Qgb2YgcmVjZWl2ZXIgZXhwcmVzc2lvbnMuIFRvIHByZXZlbnQgcnVubmluZyBvdXQgb2ZcbiAqIHN0YWNrIGRlcHRoIHRoZSBtYXhpbXVtIG51bWJlciBvZiBjaGFpbmVkIGluc3RydWN0aW9ucyBpcyBsaW1pdGVkIHRvIHRoaXMgdGhyZXNob2xkLCB3aGljaCBoYXMgYmVlbiBzZWxlY3RlZFxuICogYXJiaXRyYXJpbHkuXG4gKi9cbmNvbnN0IE1BWF9DSEFJTl9MRU5HVEggPSAyNTY7XG5cbi8qKlxuICogUG9zdC1wcm9jZXNzIGEgcmVpZmllZCB2aWV3IGNvbXBpbGF0aW9uIGFuZCBjb252ZXJ0IHNlcXVlbnRpYWwgY2FsbHMgdG8gY2hhaW5hYmxlIGluc3RydWN0aW9uc1xuICogaW50byBjaGFpbiBjYWxscy5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgdHdvIGBlbGVtZW50U3RhcnRgIG9wZXJhdGlvbnMgaW4gc2VxdWVuY2U6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZWxlbWVudFN0YXJ0KDAsICdkaXYnKTtcbiAqIGVsZW1lbnRTdGFydCgxLCAnc3BhbicpO1xuICogYGBgXG4gKlxuICogQ2FuIGJlIGNhbGxlZCBhcyBhIGNoYWluIGluc3RlYWQ6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogZWxlbWVudFN0YXJ0KDAsICdkaXYnKSgxLCAnc3BhbicpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaGFpbihqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBjaGFpbk9wZXJhdGlvbnNJbkxpc3QodW5pdC5jcmVhdGUpO1xuICAgIGNoYWluT3BlcmF0aW9uc0luTGlzdCh1bml0LnVwZGF0ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY2hhaW5PcGVyYXRpb25zSW5MaXN0KG9wTGlzdDogaXIuT3BMaXN0PGlyLkNyZWF0ZU9wIHwgaXIuVXBkYXRlT3A+KTogdm9pZCB7XG4gIGxldCBjaGFpbjogQ2hhaW4gfCBudWxsID0gbnVsbDtcbiAgZm9yIChjb25zdCBvcCBvZiBvcExpc3QpIHtcbiAgICBpZiAob3Aua2luZCAhPT0gaXIuT3BLaW5kLlN0YXRlbWVudCB8fCAhKG9wLnN0YXRlbWVudCBpbnN0YW5jZW9mIG8uRXhwcmVzc2lvblN0YXRlbWVudCkpIHtcbiAgICAgIC8vIFRoaXMgdHlwZSBvZiBzdGF0ZW1lbnQgaXNuJ3QgY2hhaW5hYmxlLlxuICAgICAgY2hhaW4gPSBudWxsO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChcbiAgICAgICEob3Auc3RhdGVtZW50LmV4cHIgaW5zdGFuY2VvZiBvLkludm9rZUZ1bmN0aW9uRXhwcikgfHxcbiAgICAgICEob3Auc3RhdGVtZW50LmV4cHIuZm4gaW5zdGFuY2VvZiBvLkV4dGVybmFsRXhwcilcbiAgICApIHtcbiAgICAgIC8vIFRoaXMgaXMgYSBzdGF0ZW1lbnQsIGJ1dCBub3QgYW4gaW5zdHJ1Y3Rpb24tdHlwZSBjYWxsLCBzbyBub3QgY2hhaW5hYmxlLlxuICAgICAgY2hhaW4gPSBudWxsO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgaW5zdHJ1Y3Rpb24gPSBvcC5zdGF0ZW1lbnQuZXhwci5mbi52YWx1ZTtcbiAgICBpZiAoIUNIQUlOQUJMRS5oYXMoaW5zdHJ1Y3Rpb24pKSB7XG4gICAgICAvLyBUaGlzIGluc3RydWN0aW9uIGlzbid0IGNoYWluYWJsZS5cbiAgICAgIGNoYWluID0gbnVsbDtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIFRoaXMgaW5zdHJ1Y3Rpb24gY2FuIGJlIGNoYWluZWQuIEl0IGNhbiBlaXRoZXIgYmUgYWRkZWQgb24gdG8gdGhlIHByZXZpb3VzIGNoYWluIChpZlxuICAgIC8vIGNvbXBhdGlibGUpIG9yIGl0IGNhbiBiZSB0aGUgc3RhcnQgb2YgYSBuZXcgY2hhaW4uXG4gICAgaWYgKGNoYWluICE9PSBudWxsICYmIGNoYWluLmluc3RydWN0aW9uID09PSBpbnN0cnVjdGlvbiAmJiBjaGFpbi5sZW5ndGggPCBNQVhfQ0hBSU5fTEVOR1RIKSB7XG4gICAgICAvLyBUaGlzIGluc3RydWN0aW9uIGNhbiBiZSBhZGRlZCBvbnRvIHRoZSBwcmV2aW91cyBjaGFpbi5cbiAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSBjaGFpbi5leHByZXNzaW9uLmNhbGxGbihcbiAgICAgICAgb3Auc3RhdGVtZW50LmV4cHIuYXJncyxcbiAgICAgICAgb3Auc3RhdGVtZW50LmV4cHIuc291cmNlU3BhbixcbiAgICAgICAgb3Auc3RhdGVtZW50LmV4cHIucHVyZSxcbiAgICAgICk7XG4gICAgICBjaGFpbi5leHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbiAgICAgIGNoYWluLm9wLnN0YXRlbWVudCA9IGV4cHJlc3Npb24udG9TdG10KCk7XG4gICAgICBjaGFpbi5sZW5ndGgrKztcbiAgICAgIGlyLk9wTGlzdC5yZW1vdmUob3AgYXMgaXIuT3A8aXIuQ3JlYXRlT3AgfCBpci5VcGRhdGVPcD4pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMZWF2ZSB0aGlzIGluc3RydWN0aW9uIGFsb25lIGZvciBub3csIGJ1dCBjb25zaWRlciBpdCB0aGUgc3RhcnQgb2YgYSBuZXcgY2hhaW4uXG4gICAgICBjaGFpbiA9IHtcbiAgICAgICAgb3AsXG4gICAgICAgIGluc3RydWN0aW9uLFxuICAgICAgICBleHByZXNzaW9uOiBvcC5zdGF0ZW1lbnQuZXhwcixcbiAgICAgICAgbGVuZ3RoOiAxLFxuICAgICAgfTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBTdHJ1Y3R1cmUgcmVwcmVzZW50aW5nIGFuIGluLXByb2dyZXNzIGNoYWluLlxuICovXG5pbnRlcmZhY2UgQ2hhaW4ge1xuICAvKipcbiAgICogVGhlIHN0YXRlbWVudCB3aGljaCBob2xkcyB0aGUgZW50aXJlIGNoYWluLlxuICAgKi9cbiAgb3A6IGlyLlN0YXRlbWVudE9wPGlyLkNyZWF0ZU9wIHwgaXIuVXBkYXRlT3A+O1xuXG4gIC8qKlxuICAgKiBUaGUgZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgdGhlIHdob2xlIGN1cnJlbnQgY2hhaW5lZCBjYWxsLlxuICAgKlxuICAgKiBUaGlzIHNob3VsZCBiZSB0aGUgc2FtZSBhcyBgb3Auc3RhdGVtZW50LmV4cHJlc3Npb25gLCBidXQgaXMgZXh0cmFjdGVkIGhlcmUgZm9yIGNvbnZlbmllbmNlXG4gICAqIHNpbmNlIHRoZSBgb3BgIHR5cGUgZG9lc24ndCBjYXB0dXJlIHRoZSBmYWN0IHRoYXQgYG9wLnN0YXRlbWVudGAgaXMgYW4gYG8uRXhwcmVzc2lvblN0YXRlbWVudGAuXG4gICAqL1xuICBleHByZXNzaW9uOiBvLkV4cHJlc3Npb247XG5cbiAgLyoqXG4gICAqIFRoZSBpbnN0cnVjdGlvbiB0aGF0IGlzIGJlaW5nIGNoYWluZWQuXG4gICAqL1xuICBpbnN0cnVjdGlvbjogby5FeHRlcm5hbFJlZmVyZW5jZTtcblxuICAvKipcbiAgICogVGhlIG51bWJlciBvZiBpbnN0cnVjdGlvbnMgdGhhdCBoYXZlIGJlZW4gY29sbGVjdGVkIGludG8gdGhpcyBjaGFpbi5cbiAgICovXG4gIGxlbmd0aDogbnVtYmVyO1xufVxuIl19