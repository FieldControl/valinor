/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV9jcmVhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3BpcGVfY3JlYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLFdBQVcsQ0FBQyxHQUFtQjtJQUM3QyxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3Qix5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMseUJBQXlCLENBQUMsSUFBcUI7SUFDdEQsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUNoRCxJQUFJLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUM3QixPQUFPO1lBQ1QsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNoRCxPQUFPO1lBQ1QsQ0FBQztZQUVELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNuRCxNQUFNLElBQUksS0FBSyxDQUFDLHNFQUFzRSxDQUFDLENBQUM7WUFDMUYsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDM0IsOEVBQThFO2dCQUM5RSxNQUFNLFVBQVUsR0FBSSxRQUFnQixDQUFDLE1BQU0sQ0FBQztnQkFDNUMsSUFBSSxVQUFVLElBQUksU0FBUyxFQUFFLENBQUM7b0JBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUVBQXVFLENBQUMsQ0FBQztnQkFDM0YsQ0FBQztnQkFDRCxzQkFBc0IsQ0FBQyxJQUFJLEVBQUcsUUFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0QsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLDRGQUE0RjtnQkFDNUYsbUZBQW1GO2dCQUNuRixnQkFBZ0I7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzdFLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxzQkFBc0IsQ0FDM0IsSUFBcUIsRUFBRSxlQUEwQixFQUFFLE9BQTJCO0lBQ2hGLG9FQUFvRTtJQUNwRSwrRkFBK0Y7SUFDL0YsNkJBQTZCO0lBQzdCLEtBQUssSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFLLEVBQUUsQ0FBQztRQUNuRixJQUFJLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFjLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDOUMsU0FBUztRQUNYLENBQUM7UUFFRCxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssZUFBZSxFQUFFLENBQUM7WUFDaEMsU0FBUztRQUNYLENBQUM7UUFFRCwrRkFBK0Y7UUFDL0Ysc0JBQXNCO1FBQ3RCLE9BQU8sRUFBRSxDQUFDLElBQUssQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN4QyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUssQ0FBQztRQUNoQixDQUFDO1FBRUQsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBZ0IsQ0FBQztRQUM5RixFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUssQ0FBQyxDQUFDO1FBRXZDLHdEQUF3RDtRQUN4RCxPQUFPO0lBQ1QsQ0FBQztJQUVELHFFQUFxRTtJQUNyRSxNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM3RixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB0eXBlIHtDb21waWxhdGlvbkpvYiwgQ29tcGlsYXRpb25Vbml0fSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogVGhpcyBwaGFzZSBnZW5lcmF0ZXMgcGlwZSBjcmVhdGlvbiBpbnN0cnVjdGlvbnMuIFdlIGRvIHRoaXMgYmFzZWQgb24gdGhlIHBpcGUgYmluZGluZ3MgZm91bmQgaW5cbiAqIHRoZSB1cGRhdGUgYmxvY2ssIGluIHRoZSBvcmRlciB3ZSBzZWUgdGhlbS5cbiAqXG4gKiBXaGVuIG5vdCBpbiBjb21wYXRpYmlsaXR5IG1vZGUsIHdlIGNhbiBzaW1wbHkgZ3JvdXAgYWxsIHRoZXNlIGNyZWF0aW9uIGluc3RydWN0aW9ucyB0b2dldGhlciwgdG9cbiAqIG1heGltaXplIGNoYWluaW5nIG9wcG9ydHVuaXRpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQaXBlcyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBwcm9jZXNzUGlwZUJpbmRpbmdzSW5WaWV3KHVuaXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NQaXBlQmluZGluZ3NJblZpZXcodW5pdDogQ29tcGlsYXRpb25Vbml0KTogdm9pZCB7XG4gIGZvciAoY29uc3QgdXBkYXRlT3Agb2YgdW5pdC51cGRhdGUpIHtcbiAgICBpci52aXNpdEV4cHJlc3Npb25zSW5PcCh1cGRhdGVPcCwgKGV4cHIsIGZsYWdzKSA9PiB7XG4gICAgICBpZiAoIWlyLmlzSXJFeHByZXNzaW9uKGV4cHIpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4cHIua2luZCAhPT0gaXIuRXhwcmVzc2lvbktpbmQuUGlwZUJpbmRpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmxhZ3MgJiBpci5WaXNpdG9yQ29udGV4dEZsYWcuSW5DaGlsZE9wZXJhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBwaXBlIGJpbmRpbmdzIHNob3VsZCBub3QgYXBwZWFyIGluIGNoaWxkIGV4cHJlc3Npb25zYCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh1bml0LmpvYi5jb21wYXRpYmlsaXR5KSB7XG4gICAgICAgIC8vIFRPRE86IFdlIGNhbiBkZWxldGUgdGhpcyBjYXN0IGFuZCBjaGVjayBvbmNlIGNvbXBhdGliaWxpdHkgbW9kZSBpcyByZW1vdmVkLlxuICAgICAgICBjb25zdCBzbG90SGFuZGxlID0gKHVwZGF0ZU9wIGFzIGFueSkudGFyZ2V0O1xuICAgICAgICBpZiAoc2xvdEhhbmRsZSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBleHBlY3RlZCBzbG90IGhhbmRsZSB0byBiZSBhc3NpZ25lZCBmb3IgcGlwZSBjcmVhdGlvbmApO1xuICAgICAgICB9XG4gICAgICAgIGFkZFBpcGVUb0NyZWF0aW9uQmxvY2sodW5pdCwgKHVwZGF0ZU9wIGFzIGFueSkudGFyZ2V0LCBleHByKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFdoZW4gbm90IGluIGNvbXBhdGliaWxpdHkgbW9kZSwgd2UganVzdCBhZGQgdGhlIHBpcGUgdG8gdGhlIGVuZCBvZiB0aGUgY3JlYXRlIGJsb2NrLiBUaGlzXG4gICAgICAgIC8vIGlzIG5vdCBvbmx5IHNpbXBsZXIgYW5kIGZhc3RlciwgYnV0IGFsbG93cyBtb3JlIGNoYWluaW5nIG9wcG9ydHVuaXRpZXMgZm9yIG90aGVyXG4gICAgICAgIC8vIGluc3RydWN0aW9ucy5cbiAgICAgICAgdW5pdC5jcmVhdGUucHVzaChpci5jcmVhdGVQaXBlT3AoZXhwci50YXJnZXQsIGV4cHIudGFyZ2V0U2xvdCwgZXhwci5uYW1lKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkUGlwZVRvQ3JlYXRpb25CbG9jayhcbiAgICB1bml0OiBDb21waWxhdGlvblVuaXQsIGFmdGVyVGFyZ2V0WHJlZjogaXIuWHJlZklkLCBiaW5kaW5nOiBpci5QaXBlQmluZGluZ0V4cHIpOiB2b2lkIHtcbiAgLy8gRmluZCB0aGUgYXBwcm9wcmlhdGUgcG9pbnQgdG8gaW5zZXJ0IHRoZSBQaXBlIGNyZWF0aW9uIG9wZXJhdGlvbi5cbiAgLy8gV2UncmUgbG9va2luZyBmb3IgYGFmdGVyVGFyZ2V0WHJlZmAgKGFuZCBhbHNvIHdhbnQgdG8gaW5zZXJ0IGFmdGVyIGFueSBvdGhlciBwaXBlIG9wZXJhdGlvbnNcbiAgLy8gd2hpY2ggbWlnaHQgYmUgYmV5b25kIGl0KS5cbiAgZm9yIChsZXQgb3AgPSB1bml0LmNyZWF0ZS5oZWFkLm5leHQhOyBvcC5raW5kICE9PSBpci5PcEtpbmQuTGlzdEVuZDsgb3AgPSBvcC5uZXh0ISkge1xuICAgIGlmICghaXIuaGFzQ29uc3VtZXNTbG90VHJhaXQ8aXIuQ3JlYXRlT3A+KG9wKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKG9wLnhyZWYgIT09IGFmdGVyVGFyZ2V0WHJlZikge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gV2UndmUgZm91bmQgYSB0ZW50YXRpdmUgaW5zZXJ0aW9uIHBvaW50OyBob3dldmVyLCB3ZSBhbHNvIHdhbnQgdG8gc2tpcCBwYXN0IGFueSBfb3RoZXJfIHBpcGVcbiAgICAvLyBvcGVyYXRpb25zIHByZXNlbnQuXG4gICAgd2hpbGUgKG9wLm5leHQhLmtpbmQgPT09IGlyLk9wS2luZC5QaXBlKSB7XG4gICAgICBvcCA9IG9wLm5leHQhO1xuICAgIH1cblxuICAgIGNvbnN0IHBpcGUgPSBpci5jcmVhdGVQaXBlT3AoYmluZGluZy50YXJnZXQsIGJpbmRpbmcudGFyZ2V0U2xvdCwgYmluZGluZy5uYW1lKSBhcyBpci5DcmVhdGVPcDtcbiAgICBpci5PcExpc3QuaW5zZXJ0QmVmb3JlKHBpcGUsIG9wLm5leHQhKTtcblxuICAgIC8vIFRoaXMgY29tcGxldGVzIGFkZGluZyB0aGUgcGlwZSB0byB0aGUgY3JlYXRpb24gYmxvY2suXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCwgd2UndmUgZmFpbGVkIHRvIGFkZCB0aGUgcGlwZSB0byB0aGUgY3JlYXRpb24gYmxvY2suXG4gIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IHVuYWJsZSB0byBmaW5kIGluc2VydGlvbiBwb2ludCBmb3IgcGlwZSAke2JpbmRpbmcubmFtZX1gKTtcbn1cbiJdfQ==