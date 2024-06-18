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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZV9jcmVhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3BpcGVfY3JlYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7Ozs7OztHQU1HO0FBQ0gsTUFBTSxVQUFVLFdBQVcsQ0FBQyxHQUFtQjtJQUM3QyxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3Qix5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMseUJBQXlCLENBQUMsSUFBcUI7SUFDdEQsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUNoRCxJQUFJLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUM3QixPQUFPO1lBQ1QsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNoRCxPQUFPO1lBQ1QsQ0FBQztZQUVELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUNuRCxNQUFNLElBQUksS0FBSyxDQUFDLHNFQUFzRSxDQUFDLENBQUM7WUFDMUYsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDM0IsOEVBQThFO2dCQUM5RSxNQUFNLFVBQVUsR0FBSSxRQUFnQixDQUFDLE1BQU0sQ0FBQztnQkFDNUMsSUFBSSxVQUFVLElBQUksU0FBUyxFQUFFLENBQUM7b0JBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUVBQXVFLENBQUMsQ0FBQztnQkFDM0YsQ0FBQztnQkFDRCxzQkFBc0IsQ0FBQyxJQUFJLEVBQUcsUUFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0QsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLDRGQUE0RjtnQkFDNUYsbUZBQW1GO2dCQUNuRixnQkFBZ0I7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzdFLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxzQkFBc0IsQ0FDN0IsSUFBcUIsRUFDckIsZUFBMEIsRUFDMUIsT0FBMkI7SUFFM0Isb0VBQW9FO0lBQ3BFLCtGQUErRjtJQUMvRiw2QkFBNkI7SUFDN0IsS0FBSyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUssRUFBRSxDQUFDO1FBQ25GLElBQUksQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUM5QyxTQUFTO1FBQ1gsQ0FBQztRQUVELElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxlQUFlLEVBQUUsQ0FBQztZQUNoQyxTQUFTO1FBQ1gsQ0FBQztRQUVELCtGQUErRjtRQUMvRixzQkFBc0I7UUFDdEIsT0FBTyxFQUFFLENBQUMsSUFBSyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3hDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSyxDQUFDO1FBQ2hCLENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFnQixDQUFDO1FBQzlGLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSyxDQUFDLENBQUM7UUFFdkMsd0RBQXdEO1FBQ3hELE9BQU87SUFDVCxDQUFDO0lBRUQscUVBQXFFO0lBQ3JFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkRBQTJELE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzdGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uSm9iLCBDb21waWxhdGlvblVuaXR9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBUaGlzIHBoYXNlIGdlbmVyYXRlcyBwaXBlIGNyZWF0aW9uIGluc3RydWN0aW9ucy4gV2UgZG8gdGhpcyBiYXNlZCBvbiB0aGUgcGlwZSBiaW5kaW5ncyBmb3VuZCBpblxuICogdGhlIHVwZGF0ZSBibG9jaywgaW4gdGhlIG9yZGVyIHdlIHNlZSB0aGVtLlxuICpcbiAqIFdoZW4gbm90IGluIGNvbXBhdGliaWxpdHkgbW9kZSwgd2UgY2FuIHNpbXBseSBncm91cCBhbGwgdGhlc2UgY3JlYXRpb24gaW5zdHJ1Y3Rpb25zIHRvZ2V0aGVyLCB0b1xuICogbWF4aW1pemUgY2hhaW5pbmcgb3Bwb3J0dW5pdGllcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBpcGVzKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIHByb2Nlc3NQaXBlQmluZGluZ3NJblZpZXcodW5pdCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1BpcGVCaW5kaW5nc0luVmlldyh1bml0OiBDb21waWxhdGlvblVuaXQpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB1cGRhdGVPcCBvZiB1bml0LnVwZGF0ZSkge1xuICAgIGlyLnZpc2l0RXhwcmVzc2lvbnNJbk9wKHVwZGF0ZU9wLCAoZXhwciwgZmxhZ3MpID0+IHtcbiAgICAgIGlmICghaXIuaXNJckV4cHJlc3Npb24oZXhwcikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXhwci5raW5kICE9PSBpci5FeHByZXNzaW9uS2luZC5QaXBlQmluZGluZykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChmbGFncyAmIGlyLlZpc2l0b3JDb250ZXh0RmxhZy5JbkNoaWxkT3BlcmF0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IHBpcGUgYmluZGluZ3Mgc2hvdWxkIG5vdCBhcHBlYXIgaW4gY2hpbGQgZXhwcmVzc2lvbnNgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHVuaXQuam9iLmNvbXBhdGliaWxpdHkpIHtcbiAgICAgICAgLy8gVE9ETzogV2UgY2FuIGRlbGV0ZSB0aGlzIGNhc3QgYW5kIGNoZWNrIG9uY2UgY29tcGF0aWJpbGl0eSBtb2RlIGlzIHJlbW92ZWQuXG4gICAgICAgIGNvbnN0IHNsb3RIYW5kbGUgPSAodXBkYXRlT3AgYXMgYW55KS50YXJnZXQ7XG4gICAgICAgIGlmIChzbG90SGFuZGxlID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IGV4cGVjdGVkIHNsb3QgaGFuZGxlIHRvIGJlIGFzc2lnbmVkIGZvciBwaXBlIGNyZWF0aW9uYCk7XG4gICAgICAgIH1cbiAgICAgICAgYWRkUGlwZVRvQ3JlYXRpb25CbG9jayh1bml0LCAodXBkYXRlT3AgYXMgYW55KS50YXJnZXQsIGV4cHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV2hlbiBub3QgaW4gY29tcGF0aWJpbGl0eSBtb2RlLCB3ZSBqdXN0IGFkZCB0aGUgcGlwZSB0byB0aGUgZW5kIG9mIHRoZSBjcmVhdGUgYmxvY2suIFRoaXNcbiAgICAgICAgLy8gaXMgbm90IG9ubHkgc2ltcGxlciBhbmQgZmFzdGVyLCBidXQgYWxsb3dzIG1vcmUgY2hhaW5pbmcgb3Bwb3J0dW5pdGllcyBmb3Igb3RoZXJcbiAgICAgICAgLy8gaW5zdHJ1Y3Rpb25zLlxuICAgICAgICB1bml0LmNyZWF0ZS5wdXNoKGlyLmNyZWF0ZVBpcGVPcChleHByLnRhcmdldCwgZXhwci50YXJnZXRTbG90LCBleHByLm5hbWUpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRQaXBlVG9DcmVhdGlvbkJsb2NrKFxuICB1bml0OiBDb21waWxhdGlvblVuaXQsXG4gIGFmdGVyVGFyZ2V0WHJlZjogaXIuWHJlZklkLFxuICBiaW5kaW5nOiBpci5QaXBlQmluZGluZ0V4cHIsXG4pOiB2b2lkIHtcbiAgLy8gRmluZCB0aGUgYXBwcm9wcmlhdGUgcG9pbnQgdG8gaW5zZXJ0IHRoZSBQaXBlIGNyZWF0aW9uIG9wZXJhdGlvbi5cbiAgLy8gV2UncmUgbG9va2luZyBmb3IgYGFmdGVyVGFyZ2V0WHJlZmAgKGFuZCBhbHNvIHdhbnQgdG8gaW5zZXJ0IGFmdGVyIGFueSBvdGhlciBwaXBlIG9wZXJhdGlvbnNcbiAgLy8gd2hpY2ggbWlnaHQgYmUgYmV5b25kIGl0KS5cbiAgZm9yIChsZXQgb3AgPSB1bml0LmNyZWF0ZS5oZWFkLm5leHQhOyBvcC5raW5kICE9PSBpci5PcEtpbmQuTGlzdEVuZDsgb3AgPSBvcC5uZXh0ISkge1xuICAgIGlmICghaXIuaGFzQ29uc3VtZXNTbG90VHJhaXQ8aXIuQ3JlYXRlT3A+KG9wKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgaWYgKG9wLnhyZWYgIT09IGFmdGVyVGFyZ2V0WHJlZikge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gV2UndmUgZm91bmQgYSB0ZW50YXRpdmUgaW5zZXJ0aW9uIHBvaW50OyBob3dldmVyLCB3ZSBhbHNvIHdhbnQgdG8gc2tpcCBwYXN0IGFueSBfb3RoZXJfIHBpcGVcbiAgICAvLyBvcGVyYXRpb25zIHByZXNlbnQuXG4gICAgd2hpbGUgKG9wLm5leHQhLmtpbmQgPT09IGlyLk9wS2luZC5QaXBlKSB7XG4gICAgICBvcCA9IG9wLm5leHQhO1xuICAgIH1cblxuICAgIGNvbnN0IHBpcGUgPSBpci5jcmVhdGVQaXBlT3AoYmluZGluZy50YXJnZXQsIGJpbmRpbmcudGFyZ2V0U2xvdCwgYmluZGluZy5uYW1lKSBhcyBpci5DcmVhdGVPcDtcbiAgICBpci5PcExpc3QuaW5zZXJ0QmVmb3JlKHBpcGUsIG9wLm5leHQhKTtcblxuICAgIC8vIFRoaXMgY29tcGxldGVzIGFkZGluZyB0aGUgcGlwZSB0byB0aGUgY3JlYXRpb24gYmxvY2suXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCwgd2UndmUgZmFpbGVkIHRvIGFkZCB0aGUgcGlwZSB0byB0aGUgY3JlYXRpb24gYmxvY2suXG4gIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IHVuYWJsZSB0byBmaW5kIGluc2VydGlvbiBwb2ludCBmb3IgcGlwZSAke2JpbmRpbmcubmFtZX1gKTtcbn1cbiJdfQ==