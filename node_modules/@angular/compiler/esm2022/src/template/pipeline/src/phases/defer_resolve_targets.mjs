/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Some `defer` conditions can reference other elements in the template, using their local reference
 * names. However, the semantics are quite different from the normal local reference system: in
 * particular, we need to look at local reference names in enclosing views. This phase resolves
 * all such references to actual xrefs.
 */
export function resolveDeferTargetNames(job) {
    const scopes = new Map();
    function getScopeForView(view) {
        if (scopes.has(view.xref)) {
            return scopes.get(view.xref);
        }
        const scope = new Scope();
        for (const op of view.create) {
            // add everything that can be referenced.
            if (!ir.isElementOrContainerOp(op) || op.localRefs === null) {
                continue;
            }
            if (!Array.isArray(op.localRefs)) {
                throw new Error('LocalRefs were already processed, but were needed to resolve defer targets.');
            }
            for (const ref of op.localRefs) {
                if (ref.target !== '') {
                    continue;
                }
                scope.targets.set(ref.name, { xref: op.xref, slot: op.handle });
            }
        }
        scopes.set(view.xref, scope);
        return scope;
    }
    function resolveTrigger(deferOwnerView, op, placeholderView) {
        switch (op.trigger.kind) {
            case ir.DeferTriggerKind.Idle:
            case ir.DeferTriggerKind.Immediate:
            case ir.DeferTriggerKind.Timer:
                return;
            case ir.DeferTriggerKind.Hover:
            case ir.DeferTriggerKind.Interaction:
            case ir.DeferTriggerKind.Viewport:
                if (op.trigger.targetName === null) {
                    // A `null` target name indicates we should default to the first element in the
                    // placeholder block.
                    if (placeholderView === null) {
                        throw new Error('defer on trigger with no target name must have a placeholder block');
                    }
                    const placeholder = job.views.get(placeholderView);
                    if (placeholder == undefined) {
                        throw new Error('AssertionError: could not find placeholder view for defer on trigger');
                    }
                    for (const placeholderOp of placeholder.create) {
                        if (ir.hasConsumesSlotTrait(placeholderOp) &&
                            (ir.isElementOrContainerOp(placeholderOp) ||
                                placeholderOp.kind === ir.OpKind.Projection)) {
                            op.trigger.targetXref = placeholderOp.xref;
                            op.trigger.targetView = placeholderView;
                            op.trigger.targetSlotViewSteps = -1;
                            op.trigger.targetSlot = placeholderOp.handle;
                            return;
                        }
                    }
                    return;
                }
                let view = placeholderView !== null ? job.views.get(placeholderView) : deferOwnerView;
                let step = placeholderView !== null ? -1 : 0;
                while (view !== null) {
                    const scope = getScopeForView(view);
                    if (scope.targets.has(op.trigger.targetName)) {
                        const { xref, slot } = scope.targets.get(op.trigger.targetName);
                        op.trigger.targetXref = xref;
                        op.trigger.targetView = view.xref;
                        op.trigger.targetSlotViewSteps = step;
                        op.trigger.targetSlot = slot;
                        return;
                    }
                    view = view.parent !== null ? job.views.get(view.parent) : null;
                    step++;
                }
                break;
            default:
                throw new Error(`Trigger kind ${op.trigger.kind} not handled`);
        }
    }
    // Find the defer ops, and assign the data about their targets.
    for (const unit of job.units) {
        const defers = new Map();
        for (const op of unit.create) {
            switch (op.kind) {
                case ir.OpKind.Defer:
                    defers.set(op.xref, op);
                    break;
                case ir.OpKind.DeferOn:
                    const deferOp = defers.get(op.defer);
                    resolveTrigger(unit, op, deferOp.placeholderView);
                    break;
            }
        }
    }
}
class Scope {
    constructor() {
        this.targets = new Map();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmZXJfcmVzb2x2ZV90YXJnZXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvZGVmZXJfcmVzb2x2ZV90YXJnZXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLHVCQUF1QixDQUFDLEdBQTRCO0lBQ2xFLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO0lBRTNDLFNBQVMsZUFBZSxDQUFDLElBQXlCO1FBQ2hELElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMxQixPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRSxDQUFDO1FBQ2hDLENBQUM7UUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQzFCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLHlDQUF5QztZQUN6QyxJQUFJLENBQUMsRUFBRSxDQUFDLHNCQUFzQixDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQzVELFNBQVM7WUFDWCxDQUFDO1lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQ2IsNkVBQTZFLENBQzlFLENBQUM7WUFDSixDQUFDO1lBRUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQy9CLElBQUksR0FB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RSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDeEIsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTztvQkFDcEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFFLENBQUM7b0JBQ3RDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDbEQsTUFBTTtZQUNWLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLEtBQUs7SUFBWDtRQUNFLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBa0QsQ0FBQztJQUN0RSxDQUFDO0NBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB0eXBlIHtDb21wb25lbnRDb21waWxhdGlvbkpvYiwgVmlld0NvbXBpbGF0aW9uVW5pdH0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIFNvbWUgYGRlZmVyYCBjb25kaXRpb25zIGNhbiByZWZlcmVuY2Ugb3RoZXIgZWxlbWVudHMgaW4gdGhlIHRlbXBsYXRlLCB1c2luZyB0aGVpciBsb2NhbCByZWZlcmVuY2VcbiAqIG5hbWVzLiBIb3dldmVyLCB0aGUgc2VtYW50aWNzIGFyZSBxdWl0ZSBkaWZmZXJlbnQgZnJvbSB0aGUgbm9ybWFsIGxvY2FsIHJlZmVyZW5jZSBzeXN0ZW06IGluXG4gKiBwYXJ0aWN1bGFyLCB3ZSBuZWVkIHRvIGxvb2sgYXQgbG9jYWwgcmVmZXJlbmNlIG5hbWVzIGluIGVuY2xvc2luZyB2aWV3cy4gVGhpcyBwaGFzZSByZXNvbHZlc1xuICogYWxsIHN1Y2ggcmVmZXJlbmNlcyB0byBhY3R1YWwgeHJlZnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRGVmZXJUYXJnZXROYW1lcyhqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGNvbnN0IHNjb3BlcyA9IG5ldyBNYXA8aXIuWHJlZklkLCBTY29wZT4oKTtcblxuICBmdW5jdGlvbiBnZXRTY29wZUZvclZpZXcodmlldzogVmlld0NvbXBpbGF0aW9uVW5pdCk6IFNjb3BlIHtcbiAgICBpZiAoc2NvcGVzLmhhcyh2aWV3LnhyZWYpKSB7XG4gICAgICByZXR1cm4gc2NvcGVzLmdldCh2aWV3LnhyZWYpITtcbiAgICB9XG5cbiAgICBjb25zdCBzY29wZSA9IG5ldyBTY29wZSgpO1xuICAgIGZvciAoY29uc3Qgb3Agb2Ygdmlldy5jcmVhdGUpIHtcbiAgICAgIC8vIGFkZCBldmVyeXRoaW5nIHRoYXQgY2FuIGJlIHJlZmVyZW5jZWQuXG4gICAgICBpZiAoIWlyLmlzRWxlbWVudE9yQ29udGFpbmVyT3Aob3ApIHx8IG9wLmxvY2FsUmVmcyA9PT0gbnVsbCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShvcC5sb2NhbFJlZnMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnTG9jYWxSZWZzIHdlcmUgYWxyZWFkeSBwcm9jZXNzZWQsIGJ1dCB3ZXJlIG5lZWRlZCB0byByZXNvbHZlIGRlZmVyIHRhcmdldHMuJyxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCByZWYgb2Ygb3AubG9jYWxSZWZzKSB7XG4gICAgICAgIGlmIChyZWYudGFyZ2V0ICE9PSAnJykge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHNjb3BlLnRhcmdldHMuc2V0KHJlZi5uYW1lLCB7eHJlZjogb3AueHJlZiwgc2xvdDogb3AuaGFuZGxlfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NvcGVzLnNldCh2aWV3LnhyZWYsIHNjb3BlKTtcbiAgICByZXR1cm4gc2NvcGU7XG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlVHJpZ2dlcihcbiAgICBkZWZlck93bmVyVmlldzogVmlld0NvbXBpbGF0aW9uVW5pdCxcbiAgICBvcDogaXIuRGVmZXJPbk9wLFxuICAgIHBsYWNlaG9sZGVyVmlldzogaXIuWHJlZklkIHwgbnVsbCxcbiAgKTogdm9pZCB7XG4gICAgc3dpdGNoIChvcC50cmlnZ2VyLmtpbmQpIHtcbiAgICAgIGNhc2UgaXIuRGVmZXJUcmlnZ2VyS2luZC5JZGxlOlxuICAgICAgY2FzZSBpci5EZWZlclRyaWdnZXJLaW5kLkltbWVkaWF0ZTpcbiAgICAgIGNhc2UgaXIuRGVmZXJUcmlnZ2VyS2luZC5UaW1lcjpcbiAgICAgICAgcmV0dXJuO1xuICAgICAgY2FzZSBpci5EZWZlclRyaWdnZXJLaW5kLkhvdmVyOlxuICAgICAgY2FzZSBpci5EZWZlclRyaWdnZXJLaW5kLkludGVyYWN0aW9uOlxuICAgICAgY2FzZSBpci5EZWZlclRyaWdnZXJLaW5kLlZpZXdwb3J0OlxuICAgICAgICBpZiAob3AudHJpZ2dlci50YXJnZXROYW1lID09PSBudWxsKSB7XG4gICAgICAgICAgLy8gQSBgbnVsbGAgdGFyZ2V0IG5hbWUgaW5kaWNhdGVzIHdlIHNob3VsZCBkZWZhdWx0IHRvIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZVxuICAgICAgICAgIC8vIHBsYWNlaG9sZGVyIGJsb2NrLlxuICAgICAgICAgIGlmIChwbGFjZWhvbGRlclZpZXcgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZGVmZXIgb24gdHJpZ2dlciB3aXRoIG5vIHRhcmdldCBuYW1lIG11c3QgaGF2ZSBhIHBsYWNlaG9sZGVyIGJsb2NrJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gam9iLnZpZXdzLmdldChwbGFjZWhvbGRlclZpZXcpO1xuICAgICAgICAgIGlmIChwbGFjZWhvbGRlciA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXNzZXJ0aW9uRXJyb3I6IGNvdWxkIG5vdCBmaW5kIHBsYWNlaG9sZGVyIHZpZXcgZm9yIGRlZmVyIG9uIHRyaWdnZXInKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yIChjb25zdCBwbGFjZWhvbGRlck9wIG9mIHBsYWNlaG9sZGVyLmNyZWF0ZSkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBpci5oYXNDb25zdW1lc1Nsb3RUcmFpdChwbGFjZWhvbGRlck9wKSAmJlxuICAgICAgICAgICAgICAoaXIuaXNFbGVtZW50T3JDb250YWluZXJPcChwbGFjZWhvbGRlck9wKSB8fFxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyT3Aua2luZCA9PT0gaXIuT3BLaW5kLlByb2plY3Rpb24pXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgb3AudHJpZ2dlci50YXJnZXRYcmVmID0gcGxhY2Vob2xkZXJPcC54cmVmO1xuICAgICAgICAgICAgICBvcC50cmlnZ2VyLnRhcmdldFZpZXcgPSBwbGFjZWhvbGRlclZpZXc7XG4gICAgICAgICAgICAgIG9wLnRyaWdnZXIudGFyZ2V0U2xvdFZpZXdTdGVwcyA9IC0xO1xuICAgICAgICAgICAgICBvcC50cmlnZ2VyLnRhcmdldFNsb3QgPSBwbGFjZWhvbGRlck9wLmhhbmRsZTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHZpZXc6IFZpZXdDb21waWxhdGlvblVuaXQgfCBudWxsID1cbiAgICAgICAgICBwbGFjZWhvbGRlclZpZXcgIT09IG51bGwgPyBqb2Iudmlld3MuZ2V0KHBsYWNlaG9sZGVyVmlldykhIDogZGVmZXJPd25lclZpZXc7XG4gICAgICAgIGxldCBzdGVwID0gcGxhY2Vob2xkZXJWaWV3ICE9PSBudWxsID8gLTEgOiAwO1xuXG4gICAgICAgIHdoaWxlICh2aWV3ICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3Qgc2NvcGUgPSBnZXRTY29wZUZvclZpZXcodmlldyk7XG4gICAgICAgICAgaWYgKHNjb3BlLnRhcmdldHMuaGFzKG9wLnRyaWdnZXIudGFyZ2V0TmFtZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHt4cmVmLCBzbG90fSA9IHNjb3BlLnRhcmdldHMuZ2V0KG9wLnRyaWdnZXIudGFyZ2V0TmFtZSkhO1xuXG4gICAgICAgICAgICBvcC50cmlnZ2VyLnRhcmdldFhyZWYgPSB4cmVmO1xuICAgICAgICAgICAgb3AudHJpZ2dlci50YXJnZXRWaWV3ID0gdmlldy54cmVmO1xuICAgICAgICAgICAgb3AudHJpZ2dlci50YXJnZXRTbG90Vmlld1N0ZXBzID0gc3RlcDtcbiAgICAgICAgICAgIG9wLnRyaWdnZXIudGFyZ2V0U2xvdCA9IHNsb3Q7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmlldyA9IHZpZXcucGFyZW50ICE9PSBudWxsID8gam9iLnZpZXdzLmdldCh2aWV3LnBhcmVudCkhIDogbnVsbDtcbiAgICAgICAgICBzdGVwKys7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRyaWdnZXIga2luZCAkeyhvcC50cmlnZ2VyIGFzIGFueSkua2luZH0gbm90IGhhbmRsZWRgKTtcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBkZWZlciBvcHMsIGFuZCBhc3NpZ24gdGhlIGRhdGEgYWJvdXQgdGhlaXIgdGFyZ2V0cy5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGNvbnN0IGRlZmVycyA9IG5ldyBNYXA8aXIuWHJlZklkLCBpci5EZWZlck9wPigpO1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5EZWZlcjpcbiAgICAgICAgICBkZWZlcnMuc2V0KG9wLnhyZWYsIG9wKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuRGVmZXJPbjpcbiAgICAgICAgICBjb25zdCBkZWZlck9wID0gZGVmZXJzLmdldChvcC5kZWZlcikhO1xuICAgICAgICAgIHJlc29sdmVUcmlnZ2VyKHVuaXQsIG9wLCBkZWZlck9wLnBsYWNlaG9sZGVyVmlldyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFNjb3BlIHtcbiAgdGFyZ2V0cyA9IG5ldyBNYXA8c3RyaW5nLCB7eHJlZjogaXIuWHJlZklkOyBzbG90OiBpci5TbG90SGFuZGxlfT4oKTtcbn1cbiJdfQ==