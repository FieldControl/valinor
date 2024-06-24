/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ir from '../../ir';
/**
 * Assign data slots for all operations which implement `ConsumesSlotOpTrait`, and propagate the
 * assigned data slots of those operations to any expressions which reference them via
 * `UsesSlotIndexTrait`.
 *
 * This phase is also responsible for counting the number of slots used for each view (its `decls`)
 * and propagating that number into the `Template` operations which declare embedded views.
 */
export function allocateSlots(job) {
    // Map of all declarations in all views within the component which require an assigned slot index.
    // This map needs to be global (across all views within the component) since it's possible to
    // reference a slot from one view from an expression within another (e.g. local references work
    // this way).
    const slotMap = new Map();
    // Process all views in the component and assign slot indexes.
    for (const unit of job.units) {
        // Slot indices start at 0 for each view (and are not unique between views).
        let slotCount = 0;
        for (const op of unit.create) {
            // Only consider declarations which consume data slots.
            if (!ir.hasConsumesSlotTrait(op)) {
                continue;
            }
            // Assign slots to this declaration starting at the current `slotCount`.
            op.handle.slot = slotCount;
            // And track its assigned slot in the `slotMap`.
            slotMap.set(op.xref, op.handle.slot);
            // Each declaration may use more than 1 slot, so increment `slotCount` to reserve the number
            // of slots required.
            slotCount += op.numSlotsUsed;
        }
        // Record the total number of slots used on the view itself. This will later be propagated into
        // `ir.TemplateOp`s which declare those views (except for the root view).
        unit.decls = slotCount;
    }
    // After slot assignment, `slotMap` now contains slot assignments for every declaration in the
    // whole template, across all views. Next, look for expressions which implement
    // `UsesSlotIndexExprTrait` and propagate the assigned slot indexes into them.
    // Additionally, this second scan allows us to find `ir.TemplateOp`s which declare views and
    // propagate the number of slots used for each view into the operation which declares it.
    for (const unit of job.units) {
        for (const op of unit.ops()) {
            if (op.kind === ir.OpKind.Template || op.kind === ir.OpKind.RepeaterCreate) {
                // Record the number of slots used by the view this `ir.TemplateOp` declares in the
                // operation itself, so it can be emitted later.
                const childView = job.views.get(op.xref);
                op.decls = childView.decls;
                // TODO: currently we handle the decls for the RepeaterCreate empty template in the reify
                // phase. We should handle that here instead.
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xvdF9hbGxvY2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvc2xvdF9hbGxvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsYUFBYSxDQUFDLEdBQTRCO0lBQ3hELGtHQUFrRztJQUNsRyw2RkFBNkY7SUFDN0YsK0ZBQStGO0lBQy9GLGFBQWE7SUFDYixNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztJQUU3Qyw4REFBOEQ7SUFDOUQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsNEVBQTRFO1FBQzVFLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztRQUVsQixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3Qix1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNqQyxTQUFTO1lBQ1gsQ0FBQztZQUVELHdFQUF3RTtZQUN4RSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7WUFFM0IsZ0RBQWdEO1lBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXJDLDRGQUE0RjtZQUM1RixxQkFBcUI7WUFDckIsU0FBUyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDL0IsQ0FBQztRQUVELCtGQUErRjtRQUMvRix5RUFBeUU7UUFDekUsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7SUFDekIsQ0FBQztJQUVELDhGQUE4RjtJQUM5RiwrRUFBK0U7SUFDL0UsOEVBQThFO0lBQzlFLDRGQUE0RjtJQUM1Rix5RkFBeUY7SUFDekYsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUM1QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUMzRSxtRkFBbUY7Z0JBQ25GLGdEQUFnRDtnQkFDaEQsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBRSxDQUFDO2dCQUMxQyxFQUFFLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7Z0JBRTNCLHlGQUF5RjtnQkFDekYsNkNBQTZDO1lBQy9DLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHR5cGUge0NvbXBvbmVudENvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogQXNzaWduIGRhdGEgc2xvdHMgZm9yIGFsbCBvcGVyYXRpb25zIHdoaWNoIGltcGxlbWVudCBgQ29uc3VtZXNTbG90T3BUcmFpdGAsIGFuZCBwcm9wYWdhdGUgdGhlXG4gKiBhc3NpZ25lZCBkYXRhIHNsb3RzIG9mIHRob3NlIG9wZXJhdGlvbnMgdG8gYW55IGV4cHJlc3Npb25zIHdoaWNoIHJlZmVyZW5jZSB0aGVtIHZpYVxuICogYFVzZXNTbG90SW5kZXhUcmFpdGAuXG4gKlxuICogVGhpcyBwaGFzZSBpcyBhbHNvIHJlc3BvbnNpYmxlIGZvciBjb3VudGluZyB0aGUgbnVtYmVyIG9mIHNsb3RzIHVzZWQgZm9yIGVhY2ggdmlldyAoaXRzIGBkZWNsc2ApXG4gKiBhbmQgcHJvcGFnYXRpbmcgdGhhdCBudW1iZXIgaW50byB0aGUgYFRlbXBsYXRlYCBvcGVyYXRpb25zIHdoaWNoIGRlY2xhcmUgZW1iZWRkZWQgdmlld3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbGxvY2F0ZVNsb3RzKGpvYjogQ29tcG9uZW50Q29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgLy8gTWFwIG9mIGFsbCBkZWNsYXJhdGlvbnMgaW4gYWxsIHZpZXdzIHdpdGhpbiB0aGUgY29tcG9uZW50IHdoaWNoIHJlcXVpcmUgYW4gYXNzaWduZWQgc2xvdCBpbmRleC5cbiAgLy8gVGhpcyBtYXAgbmVlZHMgdG8gYmUgZ2xvYmFsIChhY3Jvc3MgYWxsIHZpZXdzIHdpdGhpbiB0aGUgY29tcG9uZW50KSBzaW5jZSBpdCdzIHBvc3NpYmxlIHRvXG4gIC8vIHJlZmVyZW5jZSBhIHNsb3QgZnJvbSBvbmUgdmlldyBmcm9tIGFuIGV4cHJlc3Npb24gd2l0aGluIGFub3RoZXIgKGUuZy4gbG9jYWwgcmVmZXJlbmNlcyB3b3JrXG4gIC8vIHRoaXMgd2F5KS5cbiAgY29uc3Qgc2xvdE1hcCA9IG5ldyBNYXA8aXIuWHJlZklkLCBudW1iZXI+KCk7XG5cbiAgLy8gUHJvY2VzcyBhbGwgdmlld3MgaW4gdGhlIGNvbXBvbmVudCBhbmQgYXNzaWduIHNsb3QgaW5kZXhlcy5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIC8vIFNsb3QgaW5kaWNlcyBzdGFydCBhdCAwIGZvciBlYWNoIHZpZXcgKGFuZCBhcmUgbm90IHVuaXF1ZSBiZXR3ZWVuIHZpZXdzKS5cbiAgICBsZXQgc2xvdENvdW50ID0gMDtcblxuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIC8vIE9ubHkgY29uc2lkZXIgZGVjbGFyYXRpb25zIHdoaWNoIGNvbnN1bWUgZGF0YSBzbG90cy5cbiAgICAgIGlmICghaXIuaGFzQ29uc3VtZXNTbG90VHJhaXQob3ApKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBBc3NpZ24gc2xvdHMgdG8gdGhpcyBkZWNsYXJhdGlvbiBzdGFydGluZyBhdCB0aGUgY3VycmVudCBgc2xvdENvdW50YC5cbiAgICAgIG9wLmhhbmRsZS5zbG90ID0gc2xvdENvdW50O1xuXG4gICAgICAvLyBBbmQgdHJhY2sgaXRzIGFzc2lnbmVkIHNsb3QgaW4gdGhlIGBzbG90TWFwYC5cbiAgICAgIHNsb3RNYXAuc2V0KG9wLnhyZWYsIG9wLmhhbmRsZS5zbG90KTtcblxuICAgICAgLy8gRWFjaCBkZWNsYXJhdGlvbiBtYXkgdXNlIG1vcmUgdGhhbiAxIHNsb3QsIHNvIGluY3JlbWVudCBgc2xvdENvdW50YCB0byByZXNlcnZlIHRoZSBudW1iZXJcbiAgICAgIC8vIG9mIHNsb3RzIHJlcXVpcmVkLlxuICAgICAgc2xvdENvdW50ICs9IG9wLm51bVNsb3RzVXNlZDtcbiAgICB9XG5cbiAgICAvLyBSZWNvcmQgdGhlIHRvdGFsIG51bWJlciBvZiBzbG90cyB1c2VkIG9uIHRoZSB2aWV3IGl0c2VsZi4gVGhpcyB3aWxsIGxhdGVyIGJlIHByb3BhZ2F0ZWQgaW50b1xuICAgIC8vIGBpci5UZW1wbGF0ZU9wYHMgd2hpY2ggZGVjbGFyZSB0aG9zZSB2aWV3cyAoZXhjZXB0IGZvciB0aGUgcm9vdCB2aWV3KS5cbiAgICB1bml0LmRlY2xzID0gc2xvdENvdW50O1xuICB9XG5cbiAgLy8gQWZ0ZXIgc2xvdCBhc3NpZ25tZW50LCBgc2xvdE1hcGAgbm93IGNvbnRhaW5zIHNsb3QgYXNzaWdubWVudHMgZm9yIGV2ZXJ5IGRlY2xhcmF0aW9uIGluIHRoZVxuICAvLyB3aG9sZSB0ZW1wbGF0ZSwgYWNyb3NzIGFsbCB2aWV3cy4gTmV4dCwgbG9vayBmb3IgZXhwcmVzc2lvbnMgd2hpY2ggaW1wbGVtZW50XG4gIC8vIGBVc2VzU2xvdEluZGV4RXhwclRyYWl0YCBhbmQgcHJvcGFnYXRlIHRoZSBhc3NpZ25lZCBzbG90IGluZGV4ZXMgaW50byB0aGVtLlxuICAvLyBBZGRpdGlvbmFsbHksIHRoaXMgc2Vjb25kIHNjYW4gYWxsb3dzIHVzIHRvIGZpbmQgYGlyLlRlbXBsYXRlT3BgcyB3aGljaCBkZWNsYXJlIHZpZXdzIGFuZFxuICAvLyBwcm9wYWdhdGUgdGhlIG51bWJlciBvZiBzbG90cyB1c2VkIGZvciBlYWNoIHZpZXcgaW50byB0aGUgb3BlcmF0aW9uIHdoaWNoIGRlY2xhcmVzIGl0LlxuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0Lm9wcygpKSB7XG4gICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLlRlbXBsYXRlIHx8IG9wLmtpbmQgPT09IGlyLk9wS2luZC5SZXBlYXRlckNyZWF0ZSkge1xuICAgICAgICAvLyBSZWNvcmQgdGhlIG51bWJlciBvZiBzbG90cyB1c2VkIGJ5IHRoZSB2aWV3IHRoaXMgYGlyLlRlbXBsYXRlT3BgIGRlY2xhcmVzIGluIHRoZVxuICAgICAgICAvLyBvcGVyYXRpb24gaXRzZWxmLCBzbyBpdCBjYW4gYmUgZW1pdHRlZCBsYXRlci5cbiAgICAgICAgY29uc3QgY2hpbGRWaWV3ID0gam9iLnZpZXdzLmdldChvcC54cmVmKSE7XG4gICAgICAgIG9wLmRlY2xzID0gY2hpbGRWaWV3LmRlY2xzO1xuXG4gICAgICAgIC8vIFRPRE86IGN1cnJlbnRseSB3ZSBoYW5kbGUgdGhlIGRlY2xzIGZvciB0aGUgUmVwZWF0ZXJDcmVhdGUgZW1wdHkgdGVtcGxhdGUgaW4gdGhlIHJlaWZ5XG4gICAgICAgIC8vIHBoYXNlLiBXZSBzaG91bGQgaGFuZGxlIHRoYXQgaGVyZSBpbnN0ZWFkLlxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19