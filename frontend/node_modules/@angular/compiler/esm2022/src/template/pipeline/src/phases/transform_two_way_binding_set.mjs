/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import * as ng from '../instruction';
/**
 * Transforms a `TwoWayBindingSet` expression into an expression that either
 * sets a value through the `twoWayBindingSet` instruction or falls back to setting
 * the value directly. E.g. the expression `TwoWayBindingSet(target, value)` becomes:
 * `ng.twoWayBindingSet(target, value) || (target = value)`.
 */
export function transformTwoWayBindingSet(job) {
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind === ir.OpKind.TwoWayListener) {
                ir.transformExpressionsInOp(op, (expr) => {
                    if (expr instanceof ir.TwoWayBindingSetExpr) {
                        return wrapAction(expr.target, expr.value);
                    }
                    return expr;
                }, ir.VisitorContextFlag.InChildOperation);
            }
        }
    }
}
function wrapSetOperation(target, value) {
    // ASSUMPTION: here we're assuming that `ReadVariableExpr` will be a reference
    // to a local template variable. This appears to be the case at the time of writing.
    // If the expression is targeting a variable read, we only emit the `twoWayBindingSet` since
    // the fallback would be attempting to write into a constant. Invalid usages will be flagged
    // during template type checking.
    if (target instanceof ir.ReadVariableExpr) {
        return ng.twoWayBindingSet(target, value);
    }
    return ng.twoWayBindingSet(target, value).or(target.set(value));
}
function isReadExpression(value) {
    return value instanceof o.ReadPropExpr || value instanceof o.ReadKeyExpr ||
        value instanceof ir.ReadVariableExpr;
}
function wrapAction(target, value) {
    // The only officially supported expressions inside of a two-way binding are read expressions.
    if (isReadExpression(target)) {
        return wrapSetOperation(target, value);
    }
    // However, historically the expression parser was handling two-way events by appending `=$event`
    // to the raw string before attempting to parse it. This has led to bugs over the years (see
    // #37809) and to unintentionally supporting unassignable events in the two-way binding. The
    // logic below aims to emulate the old behavior while still supporting the new output format
    // which uses `twoWayBindingSet`. Note that the generated code doesn't necessarily make sense
    // based on what the user wrote, for example the event binding for `[(value)]="a ? b : c"`
    // would produce `ctx.a ? ctx.b : ctx.c = $event`. We aim to reproduce what the parser used
    // to generate before #54154.
    if (target instanceof o.BinaryOperatorExpr && isReadExpression(target.rhs)) {
        // `a && b` -> `ctx.a && twoWayBindingSet(ctx.b, $event) || (ctx.b = $event)`
        return new o.BinaryOperatorExpr(target.operator, target.lhs, wrapSetOperation(target.rhs, value));
    }
    // Note: this also supports nullish coalescing expressions which
    // would've been downleveled to ternary expressions by this point.
    if (target instanceof o.ConditionalExpr && isReadExpression(target.falseCase)) {
        // `a ? b : c` -> `ctx.a ? ctx.b : twoWayBindingSet(ctx.c, $event) || (ctx.c = $event)`
        return new o.ConditionalExpr(target.condition, target.trueCase, wrapSetOperation(target.falseCase, value));
    }
    // `!!a` -> `twoWayBindingSet(ctx.a, $event) || (ctx.a = $event)`
    // Note: previously we'd actually produce `!!(ctx.a = $event)`, but the wrapping
    // node doesn't affect the result so we don't need to carry it over.
    if (target instanceof o.NotExpr) {
        let expr = target.condition;
        while (true) {
            if (expr instanceof o.NotExpr) {
                expr = expr.condition;
            }
            else {
                if (isReadExpression(expr)) {
                    return wrapSetOperation(expr, value);
                }
                break;
            }
        }
    }
    throw new Error(`Unsupported expression in two-way action binding.`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtX3R3b193YXlfYmluZGluZ19zZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy90cmFuc2Zvcm1fdHdvX3dheV9iaW5kaW5nX3NldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssQ0FBQyxNQUFNLCtCQUErQixDQUFDO0FBQ25ELE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQy9CLE9BQU8sS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHckM7Ozs7O0dBS0c7QUFDSCxNQUFNLFVBQVUseUJBQXlCLENBQUMsR0FBbUI7SUFDM0QsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3pDLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDdkMsSUFBSSxJQUFJLFlBQVksRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUM7d0JBQzVDLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM3QyxDQUFDO29CQUNELE9BQU8sSUFBSSxDQUFDO2dCQUNkLENBQUMsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM3QyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FDckIsTUFBd0QsRUFBRSxLQUFtQjtJQUMvRSw4RUFBOEU7SUFDOUUsb0ZBQW9GO0lBQ3BGLDRGQUE0RjtJQUM1Riw0RkFBNEY7SUFDNUYsaUNBQWlDO0lBQ2pDLElBQUksTUFBTSxZQUFZLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzFDLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbEUsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsS0FBYztJQUV0QyxPQUFPLEtBQUssWUFBWSxDQUFDLENBQUMsWUFBWSxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsV0FBVztRQUNwRSxLQUFLLFlBQVksRUFBRSxDQUFDLGdCQUFnQixDQUFDO0FBQzNDLENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxNQUFvQixFQUFFLEtBQW1CO0lBQzNELDhGQUE4RjtJQUM5RixJQUFJLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDN0IsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELGlHQUFpRztJQUNqRyw0RkFBNEY7SUFDNUYsNEZBQTRGO0lBQzVGLDRGQUE0RjtJQUM1Riw2RkFBNkY7SUFDN0YsMEZBQTBGO0lBQzFGLDJGQUEyRjtJQUMzRiw2QkFBNkI7SUFDN0IsSUFBSSxNQUFNLFlBQVksQ0FBQyxDQUFDLGtCQUFrQixJQUFJLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzNFLDZFQUE2RTtRQUM3RSxPQUFPLElBQUksQ0FBQyxDQUFDLGtCQUFrQixDQUMzQixNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRCxnRUFBZ0U7SUFDaEUsa0VBQWtFO0lBQ2xFLElBQUksTUFBTSxZQUFZLENBQUMsQ0FBQyxlQUFlLElBQUksZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDOUUsdUZBQXVGO1FBQ3ZGLE9BQU8sSUFBSSxDQUFDLENBQUMsZUFBZSxDQUN4QixNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFRCxpRUFBaUU7SUFDakUsZ0ZBQWdGO0lBQ2hGLG9FQUFvRTtJQUNwRSxJQUFJLE1BQU0sWUFBWSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDaEMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUU1QixPQUFPLElBQUksRUFBRSxDQUFDO1lBQ1osSUFBSSxJQUFJLFlBQVksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUM5QixJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUN4QixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUMzQixPQUFPLGdCQUFnQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdkMsQ0FBQztnQkFDRCxNQUFNO1lBQ1IsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO0FBQ3ZFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQgKiBhcyBuZyBmcm9tICcuLi9pbnN0cnVjdGlvbic7XG5pbXBvcnQgdHlwZSB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGEgYFR3b1dheUJpbmRpbmdTZXRgIGV4cHJlc3Npb24gaW50byBhbiBleHByZXNzaW9uIHRoYXQgZWl0aGVyXG4gKiBzZXRzIGEgdmFsdWUgdGhyb3VnaCB0aGUgYHR3b1dheUJpbmRpbmdTZXRgIGluc3RydWN0aW9uIG9yIGZhbGxzIGJhY2sgdG8gc2V0dGluZ1xuICogdGhlIHZhbHVlIGRpcmVjdGx5LiBFLmcuIHRoZSBleHByZXNzaW9uIGBUd29XYXlCaW5kaW5nU2V0KHRhcmdldCwgdmFsdWUpYCBiZWNvbWVzOlxuICogYG5nLnR3b1dheUJpbmRpbmdTZXQodGFyZ2V0LCB2YWx1ZSkgfHwgKHRhcmdldCA9IHZhbHVlKWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1Ud29XYXlCaW5kaW5nU2V0KGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuVHdvV2F5TGlzdGVuZXIpIHtcbiAgICAgICAgaXIudHJhbnNmb3JtRXhwcmVzc2lvbnNJbk9wKG9wLCAoZXhwcikgPT4ge1xuICAgICAgICAgIGlmIChleHByIGluc3RhbmNlb2YgaXIuVHdvV2F5QmluZGluZ1NldEV4cHIpIHtcbiAgICAgICAgICAgIHJldHVybiB3cmFwQWN0aW9uKGV4cHIudGFyZ2V0LCBleHByLnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGV4cHI7XG4gICAgICAgIH0sIGlyLlZpc2l0b3JDb250ZXh0RmxhZy5JbkNoaWxkT3BlcmF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gd3JhcFNldE9wZXJhdGlvbihcbiAgICB0YXJnZXQ6IG8uUmVhZFByb3BFeHByfG8uUmVhZEtleUV4cHJ8aXIuUmVhZFZhcmlhYmxlRXhwciwgdmFsdWU6IG8uRXhwcmVzc2lvbik6IG8uRXhwcmVzc2lvbiB7XG4gIC8vIEFTU1VNUFRJT046IGhlcmUgd2UncmUgYXNzdW1pbmcgdGhhdCBgUmVhZFZhcmlhYmxlRXhwcmAgd2lsbCBiZSBhIHJlZmVyZW5jZVxuICAvLyB0byBhIGxvY2FsIHRlbXBsYXRlIHZhcmlhYmxlLiBUaGlzIGFwcGVhcnMgdG8gYmUgdGhlIGNhc2UgYXQgdGhlIHRpbWUgb2Ygd3JpdGluZy5cbiAgLy8gSWYgdGhlIGV4cHJlc3Npb24gaXMgdGFyZ2V0aW5nIGEgdmFyaWFibGUgcmVhZCwgd2Ugb25seSBlbWl0IHRoZSBgdHdvV2F5QmluZGluZ1NldGAgc2luY2VcbiAgLy8gdGhlIGZhbGxiYWNrIHdvdWxkIGJlIGF0dGVtcHRpbmcgdG8gd3JpdGUgaW50byBhIGNvbnN0YW50LiBJbnZhbGlkIHVzYWdlcyB3aWxsIGJlIGZsYWdnZWRcbiAgLy8gZHVyaW5nIHRlbXBsYXRlIHR5cGUgY2hlY2tpbmcuXG4gIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBpci5SZWFkVmFyaWFibGVFeHByKSB7XG4gICAgcmV0dXJuIG5nLnR3b1dheUJpbmRpbmdTZXQodGFyZ2V0LCB2YWx1ZSk7XG4gIH1cblxuICByZXR1cm4gbmcudHdvV2F5QmluZGluZ1NldCh0YXJnZXQsIHZhbHVlKS5vcih0YXJnZXQuc2V0KHZhbHVlKSk7XG59XG5cbmZ1bmN0aW9uIGlzUmVhZEV4cHJlc3Npb24odmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBvLlJlYWRQcm9wRXhwcnxvLlJlYWRLZXlFeHByfFxuICAgIGlyLlJlYWRWYXJpYWJsZUV4cHIge1xuICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBvLlJlYWRQcm9wRXhwciB8fCB2YWx1ZSBpbnN0YW5jZW9mIG8uUmVhZEtleUV4cHIgfHxcbiAgICAgIHZhbHVlIGluc3RhbmNlb2YgaXIuUmVhZFZhcmlhYmxlRXhwcjtcbn1cblxuZnVuY3Rpb24gd3JhcEFjdGlvbih0YXJnZXQ6IG8uRXhwcmVzc2lvbiwgdmFsdWU6IG8uRXhwcmVzc2lvbik6IG8uRXhwcmVzc2lvbiB7XG4gIC8vIFRoZSBvbmx5IG9mZmljaWFsbHkgc3VwcG9ydGVkIGV4cHJlc3Npb25zIGluc2lkZSBvZiBhIHR3by13YXkgYmluZGluZyBhcmUgcmVhZCBleHByZXNzaW9ucy5cbiAgaWYgKGlzUmVhZEV4cHJlc3Npb24odGFyZ2V0KSkge1xuICAgIHJldHVybiB3cmFwU2V0T3BlcmF0aW9uKHRhcmdldCwgdmFsdWUpO1xuICB9XG5cbiAgLy8gSG93ZXZlciwgaGlzdG9yaWNhbGx5IHRoZSBleHByZXNzaW9uIHBhcnNlciB3YXMgaGFuZGxpbmcgdHdvLXdheSBldmVudHMgYnkgYXBwZW5kaW5nIGA9JGV2ZW50YFxuICAvLyB0byB0aGUgcmF3IHN0cmluZyBiZWZvcmUgYXR0ZW1wdGluZyB0byBwYXJzZSBpdC4gVGhpcyBoYXMgbGVkIHRvIGJ1Z3Mgb3ZlciB0aGUgeWVhcnMgKHNlZVxuICAvLyAjMzc4MDkpIGFuZCB0byB1bmludGVudGlvbmFsbHkgc3VwcG9ydGluZyB1bmFzc2lnbmFibGUgZXZlbnRzIGluIHRoZSB0d28td2F5IGJpbmRpbmcuIFRoZVxuICAvLyBsb2dpYyBiZWxvdyBhaW1zIHRvIGVtdWxhdGUgdGhlIG9sZCBiZWhhdmlvciB3aGlsZSBzdGlsbCBzdXBwb3J0aW5nIHRoZSBuZXcgb3V0cHV0IGZvcm1hdFxuICAvLyB3aGljaCB1c2VzIGB0d29XYXlCaW5kaW5nU2V0YC4gTm90ZSB0aGF0IHRoZSBnZW5lcmF0ZWQgY29kZSBkb2Vzbid0IG5lY2Vzc2FyaWx5IG1ha2Ugc2Vuc2VcbiAgLy8gYmFzZWQgb24gd2hhdCB0aGUgdXNlciB3cm90ZSwgZm9yIGV4YW1wbGUgdGhlIGV2ZW50IGJpbmRpbmcgZm9yIGBbKHZhbHVlKV09XCJhID8gYiA6IGNcImBcbiAgLy8gd291bGQgcHJvZHVjZSBgY3R4LmEgPyBjdHguYiA6IGN0eC5jID0gJGV2ZW50YC4gV2UgYWltIHRvIHJlcHJvZHVjZSB3aGF0IHRoZSBwYXJzZXIgdXNlZFxuICAvLyB0byBnZW5lcmF0ZSBiZWZvcmUgIzU0MTU0LlxuICBpZiAodGFyZ2V0IGluc3RhbmNlb2Ygby5CaW5hcnlPcGVyYXRvckV4cHIgJiYgaXNSZWFkRXhwcmVzc2lvbih0YXJnZXQucmhzKSkge1xuICAgIC8vIGBhICYmIGJgIC0+IGBjdHguYSAmJiB0d29XYXlCaW5kaW5nU2V0KGN0eC5iLCAkZXZlbnQpIHx8IChjdHguYiA9ICRldmVudClgXG4gICAgcmV0dXJuIG5ldyBvLkJpbmFyeU9wZXJhdG9yRXhwcihcbiAgICAgICAgdGFyZ2V0Lm9wZXJhdG9yLCB0YXJnZXQubGhzLCB3cmFwU2V0T3BlcmF0aW9uKHRhcmdldC5yaHMsIHZhbHVlKSk7XG4gIH1cblxuICAvLyBOb3RlOiB0aGlzIGFsc28gc3VwcG9ydHMgbnVsbGlzaCBjb2FsZXNjaW5nIGV4cHJlc3Npb25zIHdoaWNoXG4gIC8vIHdvdWxkJ3ZlIGJlZW4gZG93bmxldmVsZWQgdG8gdGVybmFyeSBleHByZXNzaW9ucyBieSB0aGlzIHBvaW50LlxuICBpZiAodGFyZ2V0IGluc3RhbmNlb2Ygby5Db25kaXRpb25hbEV4cHIgJiYgaXNSZWFkRXhwcmVzc2lvbih0YXJnZXQuZmFsc2VDYXNlKSkge1xuICAgIC8vIGBhID8gYiA6IGNgIC0+IGBjdHguYSA/IGN0eC5iIDogdHdvV2F5QmluZGluZ1NldChjdHguYywgJGV2ZW50KSB8fCAoY3R4LmMgPSAkZXZlbnQpYFxuICAgIHJldHVybiBuZXcgby5Db25kaXRpb25hbEV4cHIoXG4gICAgICAgIHRhcmdldC5jb25kaXRpb24sIHRhcmdldC50cnVlQ2FzZSwgd3JhcFNldE9wZXJhdGlvbih0YXJnZXQuZmFsc2VDYXNlLCB2YWx1ZSkpO1xuICB9XG5cbiAgLy8gYCEhYWAgLT4gYHR3b1dheUJpbmRpbmdTZXQoY3R4LmEsICRldmVudCkgfHwgKGN0eC5hID0gJGV2ZW50KWBcbiAgLy8gTm90ZTogcHJldmlvdXNseSB3ZSdkIGFjdHVhbGx5IHByb2R1Y2UgYCEhKGN0eC5hID0gJGV2ZW50KWAsIGJ1dCB0aGUgd3JhcHBpbmdcbiAgLy8gbm9kZSBkb2Vzbid0IGFmZmVjdCB0aGUgcmVzdWx0IHNvIHdlIGRvbid0IG5lZWQgdG8gY2FycnkgaXQgb3Zlci5cbiAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIG8uTm90RXhwcikge1xuICAgIGxldCBleHByID0gdGFyZ2V0LmNvbmRpdGlvbjtcblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoZXhwciBpbnN0YW5jZW9mIG8uTm90RXhwcikge1xuICAgICAgICBleHByID0gZXhwci5jb25kaXRpb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNSZWFkRXhwcmVzc2lvbihleHByKSkge1xuICAgICAgICAgIHJldHVybiB3cmFwU2V0T3BlcmF0aW9uKGV4cHIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGV4cHJlc3Npb24gaW4gdHdvLXdheSBhY3Rpb24gYmluZGluZy5gKTtcbn1cbiJdfQ==