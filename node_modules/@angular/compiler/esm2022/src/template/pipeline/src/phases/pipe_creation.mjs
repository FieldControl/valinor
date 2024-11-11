/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * This phase generates pipe creation instructions. We do this based on the pipe bindings found in
 * the update block, in the order we see them.
 *
 * When not in compatibility mode, we can simply group all these creation instructions together, to
 * maximize chaining opportunities.
 */
export function createPipes(job) {
    for (const unit of job.units) {
        processPipeBindingsInView(unit);
    }
}
function processPipeBindingsInView(unit) {
    for (const updateOp of unit.update) {
        ir.visitExpressionsInOp(updateOp, (expr, flags) => {
            if (!ir.isIrExpression(expr)) {
                return;
            }
            if (expr.kind !== ir.ExpressionKind.PipeBinding) {
                return;
            }
            if (flags & ir.VisitorContextFlag.InChildOperation) {
                throw new Error(`AssertionError: pipe bindings should not appear in child expressions`);
            }
            if (unit.job.compatibility) {
                // TODO: We can delete this cast and check once compatibility mode is removed.
                const slotHandle = updateOp.target;
                if (slotHandle == undefined) {
                    throw new Error(`AssertionError: expected slot handle to be assigned for pipe creation`);
                }
                addPipeToCreationBlock(unit, updateOp.target, expr);
            }
            else {
                // When not in compatibility mode, we just add the pipe to the end of the create block. This
                // is not only simpler and faster, but allows more chaining opportunities for other
                // instructions.
                unit.create.push(ir.createPipeOp(expr.target, expr.targetSlot, expr.name));
            }
        });
    }
}
function addPipeToCreationBlock(unit, afterTargetXref, binding) {
    // Find the appropriate point to insert the Pipe creation operation.
    // We're looking for `afterTargetXref` (and also want to insert after any other pipe operations
    // which might be beyond it).
    for (let op = unit.create.head.next; op.kind !== ir.OpKind.ListEnd; op = op.next) {
        if (!ir.hasConsumesSlotTrait(op)) {
            continue;
        }
        if (op.xref !== afterTargetXref) {
            continue;
        }
        // We've found a tentative insertion point; however, we also want to skip past any _other_ pipe
        // operations present.
        while (op.next.kind === ir.OpKind.Pipe) {
            op = op.next;
        }
        const pipe = ir.createPipeOp(binding.target, binding.targetSlot, binding.name);
        ir.OpList.insertBefore(pipe, op.next);
        // This completes adding the pipe to the creation block.
        return;
    }
    // At this point, we've failed to add the pipe to the creation block.
    throw new Error(`AssertionError: unable to find insertion point for pipe ${binding.name}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV9jcmVhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3BpcGVfY3JlYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLFdBQVcsQ0FBQyxHQUFtQjtJQUM3QyxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3Qix5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMseUJBQXlCLENBQUMsSUFBcUI7SUFDdEQsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUNoRCxJQUFJLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUM3QixPQUFPO1lBQ1QsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNoRCxPQUFPO1lBQ1QsQ0FBQztZQUVELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNuRCxNQUFNLElBQUksS0FBSyxDQUFDLHNFQUFzRSxDQUFDLENBQUM7WUFDMUYsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDM0IsOEVBQThFO2dCQUM5RSxNQUFNLFVBQVUsR0FBSSxRQUFnQixDQUFDLE1BQU0sQ0FBQztnQkFDNUMsSUFBSSxVQUFVLElBQUksU0FBUyxFQUFFLENBQUM7b0JBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUVBQXVFLENBQUMsQ0FBQztnQkFDM0YsQ0FBQztnQkFDRCxzQkFBc0IsQ0FBQyxJQUFJLEVBQUcsUUFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0QsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLDRGQUE0RjtnQkFDNUYsbUZBQW1GO2dCQUNuRixnQkFBZ0I7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzdFLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxzQkFBc0IsQ0FDN0IsSUFBcUIsRUFDckIsZUFBMEIsRUFDMUIsT0FBMkI7SUFFM0Isb0VBQW9FO0lBQ3BFLCtGQUErRjtJQUMvRiw2QkFBNkI7SUFDN0IsS0FBSyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUssRUFBRSxDQUFDO1FBQ25GLElBQUksQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUM5QyxTQUFTO1FBQ1gsQ0FBQztRQUVELElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxlQUFlLEVBQUUsQ0FBQztZQUNoQyxTQUFTO1FBQ1gsQ0FBQztRQUVELCtGQUErRjtRQUMvRixzQkFBc0I7UUFDdEIsT0FBTyxFQUFFLENBQUMsSUFBSyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3hDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSyxDQUFDO1FBQ2hCLENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFnQixDQUFDO1FBQzlGLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSyxDQUFDLENBQUM7UUFFdkMsd0RBQXdEO1FBQ3hELE9BQU87SUFDVCxDQUFDO0lBRUQscUVBQXFFO0lBQ3JFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkRBQTJELE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzdGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB0eXBlIHtDb21waWxhdGlvbkpvYiwgQ29tcGlsYXRpb25Vbml0fSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogVGhpcyBwaGFzZSBnZW5lcmF0ZXMgcGlwZSBjcmVhdGlvbiBpbnN0cnVjdGlvbnMuIFdlIGRvIHRoaXMgYmFzZWQgb24gdGhlIHBpcGUgYmluZGluZ3MgZm91bmQgaW5cbiAqIHRoZSB1cGRhdGUgYmxvY2ssIGluIHRoZSBvcmRlciB3ZSBzZWUgdGhlbS5cbiAqXG4gKiBXaGVuIG5vdCBpbiBjb21wYXRpYmlsaXR5IG1vZGUsIHdlIGNhbiBzaW1wbHkgZ3JvdXAgYWxsIHRoZXNlIGNyZWF0aW9uIGluc3RydWN0aW9ucyB0b2dldGhlciwgdG9cbiAqIG1heGltaXplIGNoYWluaW5nIG9wcG9ydHVuaXRpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQaXBlcyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBwcm9jZXNzUGlwZUJpbmRpbmdzSW5WaWV3KHVuaXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NQaXBlQmluZGluZ3NJblZpZXcodW5pdDogQ29tcGlsYXRpb25Vbml0KTogdm9pZCB7XG4gIGZvciAoY29uc3QgdXBkYXRlT3Agb2YgdW5pdC51cGRhdGUpIHtcbiAgICBpci52aXNpdEV4cHJlc3Npb25zSW5PcCh1cGRhdGVPcCwgKGV4cHIsIGZsYWdzKSA9PiB7XG4gICAgICBpZiAoIWlyLmlzSXJFeHByZXNzaW9uKGV4cHIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4cHIua2luZCAhPT0gaXIuRXhwcmVzc2lvbktpbmQuUGlwZUJpbmRpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmxhZ3MgJiBpci5WaXNpdG9yQ29udGV4dEZsYWcuSW5DaGlsZE9wZXJhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBwaXBlIGJpbmRpbmdzIHNob3VsZCBub3QgYXBwZWFyIGluIGNoaWxkIGV4cHJlc3Npb25zYCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh1bml0LmpvYi5jb21wYXRpYmlsaXR5KSB7XG4gICAgICAgIC8vIFRPRE86IFdlIGNhbiBkZWxldGUgdGhpcyBjYXN0IGFuZCBjaGVjayBvbmNlIGNvbXBhdGliaWxpdHkgbW9kZSBpcyByZW1vdmVkLlxuICAgICAgICBjb25zdCBzbG90SGFuZGxlID0gKHVwZGF0ZU9wIGFzIGFueSkudGFyZ2V0O1xuICAgICAgICBpZiAoc2xvdEhhbmRsZSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBleHBlY3RlZCBzbG90IGhhbmRsZSB0byBiZSBhc3NpZ25lZCBmb3IgcGlwZSBjcmVhdGlvbmApO1xuICAgICAgICB9XG4gICAgICAgIGFkZFBpcGVUb0NyZWF0aW9uQmxvY2sodW5pdCwgKHVwZGF0ZU9wIGFzIGFueSkudGFyZ2V0LCBleHByKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFdoZW4gbm90IGluIGNvbXBhdGliaWxpdHkgbW9kZSwgd2UganVzdCBhZGQgdGhlIHBpcGUgdG8gdGhlIGVuZCBvZiB0aGUgY3JlYXRlIGJsb2NrLiBUaGlzXG4gICAgICAgIC8vIGlzIG5vdCBvbmx5IHNpbXBsZXIgYW5kIGZhc3RlciwgYnV0IGFsbG93cyBtb3JlIGNoYWluaW5nIG9wcG9ydHVuaXRpZXMgZm9yIG90aGVyXG4gICAgICAgIC8vIGluc3RydWN0aW9ucy5cbiAgICAgICAgdW5pdC5jcmVhdGUucHVzaChpci5jcmVhdGVQaXBlT3AoZXhwci50YXJnZXQsIGV4cHIudGFyZ2V0U2xvdCwgZXhwci5uYW1lKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkUGlwZVRvQ3JlYXRpb25CbG9jayhcbiAgdW5pdDogQ29tcGlsYXRpb25Vbml0LFxuICBhZnRlclRhcmdldFhyZWY6IGlyLlhyZWZJZCxcbiAgYmluZGluZzogaXIuUGlwZUJpbmRpbmdFeHByLFxuKTogdm9pZCB7XG4gIC8vIEZpbmQgdGhlIGFwcHJvcHJpYXRlIHBvaW50IHRvIGluc2VydCB0aGUgUGlwZSBjcmVhdGlvbiBvcGVyYXRpb24uXG4gIC8vIFdlJ3JlIGxvb2tpbmcgZm9yIGBhZnRlclRhcmdldFhyZWZgIChhbmQgYWxzbyB3YW50IHRvIGluc2VydCBhZnRlciBhbnkgb3RoZXIgcGlwZSBvcGVyYXRpb25zXG4gIC8vIHdoaWNoIG1pZ2h0IGJlIGJleW9uZCBpdCkuXG4gIGZvciAobGV0IG9wID0gdW5pdC5jcmVhdGUuaGVhZC5uZXh0ITsgb3Aua2luZCAhPT0gaXIuT3BLaW5kLkxpc3RFbmQ7IG9wID0gb3AubmV4dCEpIHtcbiAgICBpZiAoIWlyLmhhc0NvbnN1bWVzU2xvdFRyYWl0PGlyLkNyZWF0ZU9wPihvcCkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChvcC54cmVmICE9PSBhZnRlclRhcmdldFhyZWYpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vIFdlJ3ZlIGZvdW5kIGEgdGVudGF0aXZlIGluc2VydGlvbiBwb2ludDsgaG93ZXZlciwgd2UgYWxzbyB3YW50IHRvIHNraXAgcGFzdCBhbnkgX290aGVyXyBwaXBlXG4gICAgLy8gb3BlcmF0aW9ucyBwcmVzZW50LlxuICAgIHdoaWxlIChvcC5uZXh0IS5raW5kID09PSBpci5PcEtpbmQuUGlwZSkge1xuICAgICAgb3AgPSBvcC5uZXh0ITtcbiAgICB9XG5cbiAgICBjb25zdCBwaXBlID0gaXIuY3JlYXRlUGlwZU9wKGJpbmRpbmcudGFyZ2V0LCBiaW5kaW5nLnRhcmdldFNsb3QsIGJpbmRpbmcubmFtZSkgYXMgaXIuQ3JlYXRlT3A7XG4gICAgaXIuT3BMaXN0Lmluc2VydEJlZm9yZShwaXBlLCBvcC5uZXh0ISk7XG5cbiAgICAvLyBUaGlzIGNvbXBsZXRlcyBhZGRpbmcgdGhlIHBpcGUgdG8gdGhlIGNyZWF0aW9uIGJsb2NrLlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQsIHdlJ3ZlIGZhaWxlZCB0byBhZGQgdGhlIHBpcGUgdG8gdGhlIGNyZWF0aW9uIGJsb2NrLlxuICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiB1bmFibGUgdG8gZmluZCBpbnNlcnRpb24gcG9pbnQgZm9yIHBpcGUgJHtiaW5kaW5nLm5hbWV9YCk7XG59XG4iXX0=