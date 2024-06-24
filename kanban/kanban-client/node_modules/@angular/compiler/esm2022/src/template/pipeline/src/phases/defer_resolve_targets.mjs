/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmZXJfcmVzb2x2ZV90YXJnZXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvZGVmZXJfcmVzb2x2ZV90YXJnZXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLHVCQUF1QixDQUFDLEdBQTRCO0lBQ2xFLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO0lBRTNDLFNBQVMsZUFBZSxDQUFDLElBQXlCO1FBQ2hELElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUMxQixPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBRSxDQUFDO1FBQ2hDLENBQUM7UUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQzFCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLHlDQUF5QztZQUN6QyxJQUFJLENBQUMsRUFBRSxDQUFDLHNCQUFzQixDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQzVELFNBQVM7WUFDWCxDQUFDO1lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQ2IsNkVBQTZFLENBQzlFLENBQUM7WUFDSixDQUFDO1lBRUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQy9CLElBQUksR0FB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RSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDeEIsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTztvQkFDcEIsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFFLENBQUM7b0JBQ3RDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDbEQsTUFBTTtZQUNWLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLEtBQUs7SUFBWDtRQUNFLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBa0QsQ0FBQztJQUN0RSxDQUFDO0NBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBvbmVudENvbXBpbGF0aW9uSm9iLCBWaWV3Q29tcGlsYXRpb25Vbml0fSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogU29tZSBgZGVmZXJgIGNvbmRpdGlvbnMgY2FuIHJlZmVyZW5jZSBvdGhlciBlbGVtZW50cyBpbiB0aGUgdGVtcGxhdGUsIHVzaW5nIHRoZWlyIGxvY2FsIHJlZmVyZW5jZVxuICogbmFtZXMuIEhvd2V2ZXIsIHRoZSBzZW1hbnRpY3MgYXJlIHF1aXRlIGRpZmZlcmVudCBmcm9tIHRoZSBub3JtYWwgbG9jYWwgcmVmZXJlbmNlIHN5c3RlbTogaW5cbiAqIHBhcnRpY3VsYXIsIHdlIG5lZWQgdG8gbG9vayBhdCBsb2NhbCByZWZlcmVuY2UgbmFtZXMgaW4gZW5jbG9zaW5nIHZpZXdzLiBUaGlzIHBoYXNlIHJlc29sdmVzXG4gKiBhbGwgc3VjaCByZWZlcmVuY2VzIHRvIGFjdHVhbCB4cmVmcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVEZWZlclRhcmdldE5hbWVzKGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgY29uc3Qgc2NvcGVzID0gbmV3IE1hcDxpci5YcmVmSWQsIFNjb3BlPigpO1xuXG4gIGZ1bmN0aW9uIGdldFNjb3BlRm9yVmlldyh2aWV3OiBWaWV3Q29tcGlsYXRpb25Vbml0KTogU2NvcGUge1xuICAgIGlmIChzY29wZXMuaGFzKHZpZXcueHJlZikpIHtcbiAgICAgIHJldHVybiBzY29wZXMuZ2V0KHZpZXcueHJlZikhO1xuICAgIH1cblxuICAgIGNvbnN0IHNjb3BlID0gbmV3IFNjb3BlKCk7XG4gICAgZm9yIChjb25zdCBvcCBvZiB2aWV3LmNyZWF0ZSkge1xuICAgICAgLy8gYWRkIGV2ZXJ5dGhpbmcgdGhhdCBjYW4gYmUgcmVmZXJlbmNlZC5cbiAgICAgIGlmICghaXIuaXNFbGVtZW50T3JDb250YWluZXJPcChvcCkgfHwgb3AubG9jYWxSZWZzID09PSBudWxsKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG9wLmxvY2FsUmVmcykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdMb2NhbFJlZnMgd2VyZSBhbHJlYWR5IHByb2Nlc3NlZCwgYnV0IHdlcmUgbmVlZGVkIHRvIHJlc29sdmUgZGVmZXIgdGFyZ2V0cy4nLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IHJlZiBvZiBvcC5sb2NhbFJlZnMpIHtcbiAgICAgICAgaWYgKHJlZi50YXJnZXQgIT09ICcnKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUudGFyZ2V0cy5zZXQocmVmLm5hbWUsIHt4cmVmOiBvcC54cmVmLCBzbG90OiBvcC5oYW5kbGV9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzY29wZXMuc2V0KHZpZXcueHJlZiwgc2NvcGUpO1xuICAgIHJldHVybiBzY29wZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmVUcmlnZ2VyKFxuICAgIGRlZmVyT3duZXJWaWV3OiBWaWV3Q29tcGlsYXRpb25Vbml0LFxuICAgIG9wOiBpci5EZWZlck9uT3AsXG4gICAgcGxhY2Vob2xkZXJWaWV3OiBpci5YcmVmSWQgfCBudWxsLFxuICApOiB2b2lkIHtcbiAgICBzd2l0Y2ggKG9wLnRyaWdnZXIua2luZCkge1xuICAgICAgY2FzZSBpci5EZWZlclRyaWdnZXJLaW5kLklkbGU6XG4gICAgICBjYXNlIGlyLkRlZmVyVHJpZ2dlcktpbmQuSW1tZWRpYXRlOlxuICAgICAgY2FzZSBpci5EZWZlclRyaWdnZXJLaW5kLlRpbWVyOlxuICAgICAgICByZXR1cm47XG4gICAgICBjYXNlIGlyLkRlZmVyVHJpZ2dlcktpbmQuSG92ZXI6XG4gICAgICBjYXNlIGlyLkRlZmVyVHJpZ2dlcktpbmQuSW50ZXJhY3Rpb246XG4gICAgICBjYXNlIGlyLkRlZmVyVHJpZ2dlcktpbmQuVmlld3BvcnQ6XG4gICAgICAgIGlmIChvcC50cmlnZ2VyLnRhcmdldE5hbWUgPT09IG51bGwpIHtcbiAgICAgICAgICAvLyBBIGBudWxsYCB0YXJnZXQgbmFtZSBpbmRpY2F0ZXMgd2Ugc2hvdWxkIGRlZmF1bHQgdG8gdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlXG4gICAgICAgICAgLy8gcGxhY2Vob2xkZXIgYmxvY2suXG4gICAgICAgICAgaWYgKHBsYWNlaG9sZGVyVmlldyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdkZWZlciBvbiB0cmlnZ2VyIHdpdGggbm8gdGFyZ2V0IG5hbWUgbXVzdCBoYXZlIGEgcGxhY2Vob2xkZXIgYmxvY2snKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgcGxhY2Vob2xkZXIgPSBqb2Iudmlld3MuZ2V0KHBsYWNlaG9sZGVyVmlldyk7XG4gICAgICAgICAgaWYgKHBsYWNlaG9sZGVyID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBc3NlcnRpb25FcnJvcjogY291bGQgbm90IGZpbmQgcGxhY2Vob2xkZXIgdmlldyBmb3IgZGVmZXIgb24gdHJpZ2dlcicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKGNvbnN0IHBsYWNlaG9sZGVyT3Agb2YgcGxhY2Vob2xkZXIuY3JlYXRlKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGlyLmhhc0NvbnN1bWVzU2xvdFRyYWl0KHBsYWNlaG9sZGVyT3ApICYmXG4gICAgICAgICAgICAgIChpci5pc0VsZW1lbnRPckNvbnRhaW5lck9wKHBsYWNlaG9sZGVyT3ApIHx8XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXJPcC5raW5kID09PSBpci5PcEtpbmQuUHJvamVjdGlvbilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBvcC50cmlnZ2VyLnRhcmdldFhyZWYgPSBwbGFjZWhvbGRlck9wLnhyZWY7XG4gICAgICAgICAgICAgIG9wLnRyaWdnZXIudGFyZ2V0VmlldyA9IHBsYWNlaG9sZGVyVmlldztcbiAgICAgICAgICAgICAgb3AudHJpZ2dlci50YXJnZXRTbG90Vmlld1N0ZXBzID0gLTE7XG4gICAgICAgICAgICAgIG9wLnRyaWdnZXIudGFyZ2V0U2xvdCA9IHBsYWNlaG9sZGVyT3AuaGFuZGxlO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdmlldzogVmlld0NvbXBpbGF0aW9uVW5pdCB8IG51bGwgPVxuICAgICAgICAgIHBsYWNlaG9sZGVyVmlldyAhPT0gbnVsbCA/IGpvYi52aWV3cy5nZXQocGxhY2Vob2xkZXJWaWV3KSEgOiBkZWZlck93bmVyVmlldztcbiAgICAgICAgbGV0IHN0ZXAgPSBwbGFjZWhvbGRlclZpZXcgIT09IG51bGwgPyAtMSA6IDA7XG5cbiAgICAgICAgd2hpbGUgKHZpZXcgIT09IG51bGwpIHtcbiAgICAgICAgICBjb25zdCBzY29wZSA9IGdldFNjb3BlRm9yVmlldyh2aWV3KTtcbiAgICAgICAgICBpZiAoc2NvcGUudGFyZ2V0cy5oYXMob3AudHJpZ2dlci50YXJnZXROYW1lKSkge1xuICAgICAgICAgICAgY29uc3Qge3hyZWYsIHNsb3R9ID0gc2NvcGUudGFyZ2V0cy5nZXQob3AudHJpZ2dlci50YXJnZXROYW1lKSE7XG5cbiAgICAgICAgICAgIG9wLnRyaWdnZXIudGFyZ2V0WHJlZiA9IHhyZWY7XG4gICAgICAgICAgICBvcC50cmlnZ2VyLnRhcmdldFZpZXcgPSB2aWV3LnhyZWY7XG4gICAgICAgICAgICBvcC50cmlnZ2VyLnRhcmdldFNsb3RWaWV3U3RlcHMgPSBzdGVwO1xuICAgICAgICAgICAgb3AudHJpZ2dlci50YXJnZXRTbG90ID0gc2xvdDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2aWV3ID0gdmlldy5wYXJlbnQgIT09IG51bGwgPyBqb2Iudmlld3MuZ2V0KHZpZXcucGFyZW50KSEgOiBudWxsO1xuICAgICAgICAgIHN0ZXArKztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVHJpZ2dlciBraW5kICR7KG9wLnRyaWdnZXIgYXMgYW55KS5raW5kfSBub3QgaGFuZGxlZGApO1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGRlZmVyIG9wcywgYW5kIGFzc2lnbiB0aGUgZGF0YSBhYm91dCB0aGVpciB0YXJnZXRzLlxuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgY29uc3QgZGVmZXJzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkRlZmVyT3A+KCk7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgc3dpdGNoIChvcC5raW5kKSB7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkRlZmVyOlxuICAgICAgICAgIGRlZmVycy5zZXQob3AueHJlZiwgb3ApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5EZWZlck9uOlxuICAgICAgICAgIGNvbnN0IGRlZmVyT3AgPSBkZWZlcnMuZ2V0KG9wLmRlZmVyKSE7XG4gICAgICAgICAgcmVzb2x2ZVRyaWdnZXIodW5pdCwgb3AsIGRlZmVyT3AucGxhY2Vob2xkZXJWaWV3KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgU2NvcGUge1xuICB0YXJnZXRzID0gbmV3IE1hcDxzdHJpbmcsIHt4cmVmOiBpci5YcmVmSWQ7IHNsb3Q6IGlyLlNsb3RIYW5kbGV9PigpO1xufVxuIl19