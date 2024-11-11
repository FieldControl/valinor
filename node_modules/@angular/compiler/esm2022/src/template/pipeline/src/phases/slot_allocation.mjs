/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xvdF9hbGxvY2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvc2xvdF9hbGxvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRy9COzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsYUFBYSxDQUFDLEdBQTRCO0lBQ3hELGtHQUFrRztJQUNsRyw2RkFBNkY7SUFDN0YsK0ZBQStGO0lBQy9GLGFBQWE7SUFDYixNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBcUIsQ0FBQztJQUU3Qyw4REFBOEQ7SUFDOUQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsNEVBQTRFO1FBQzVFLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztRQUVsQixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3Qix1REFBdUQ7WUFDdkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNqQyxTQUFTO1lBQ1gsQ0FBQztZQUVELHdFQUF3RTtZQUN4RSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7WUFFM0IsZ0RBQWdEO1lBQ2hELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXJDLDRGQUE0RjtZQUM1RixxQkFBcUI7WUFDckIsU0FBUyxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDL0IsQ0FBQztRQUVELCtGQUErRjtRQUMvRix5RUFBeUU7UUFDekUsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7SUFDekIsQ0FBQztJQUVELDhGQUE4RjtJQUM5RiwrRUFBK0U7SUFDL0UsOEVBQThFO0lBQzlFLDRGQUE0RjtJQUM1Rix5RkFBeUY7SUFDekYsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUM1QixJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUMzRSxtRkFBbUY7Z0JBQ25GLGdEQUFnRDtnQkFDaEQsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBRSxDQUFDO2dCQUMxQyxFQUFFLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7Z0JBRTNCLHlGQUF5RjtnQkFDekYsNkNBQTZDO1lBQy9DLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB0eXBlIHtDb21wb25lbnRDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIEFzc2lnbiBkYXRhIHNsb3RzIGZvciBhbGwgb3BlcmF0aW9ucyB3aGljaCBpbXBsZW1lbnQgYENvbnN1bWVzU2xvdE9wVHJhaXRgLCBhbmQgcHJvcGFnYXRlIHRoZVxuICogYXNzaWduZWQgZGF0YSBzbG90cyBvZiB0aG9zZSBvcGVyYXRpb25zIHRvIGFueSBleHByZXNzaW9ucyB3aGljaCByZWZlcmVuY2UgdGhlbSB2aWFcbiAqIGBVc2VzU2xvdEluZGV4VHJhaXRgLlxuICpcbiAqIFRoaXMgcGhhc2UgaXMgYWxzbyByZXNwb25zaWJsZSBmb3IgY291bnRpbmcgdGhlIG51bWJlciBvZiBzbG90cyB1c2VkIGZvciBlYWNoIHZpZXcgKGl0cyBgZGVjbHNgKVxuICogYW5kIHByb3BhZ2F0aW5nIHRoYXQgbnVtYmVyIGludG8gdGhlIGBUZW1wbGF0ZWAgb3BlcmF0aW9ucyB3aGljaCBkZWNsYXJlIGVtYmVkZGVkIHZpZXdzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWxsb2NhdGVTbG90cyhqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIC8vIE1hcCBvZiBhbGwgZGVjbGFyYXRpb25zIGluIGFsbCB2aWV3cyB3aXRoaW4gdGhlIGNvbXBvbmVudCB3aGljaCByZXF1aXJlIGFuIGFzc2lnbmVkIHNsb3QgaW5kZXguXG4gIC8vIFRoaXMgbWFwIG5lZWRzIHRvIGJlIGdsb2JhbCAoYWNyb3NzIGFsbCB2aWV3cyB3aXRoaW4gdGhlIGNvbXBvbmVudCkgc2luY2UgaXQncyBwb3NzaWJsZSB0b1xuICAvLyByZWZlcmVuY2UgYSBzbG90IGZyb20gb25lIHZpZXcgZnJvbSBhbiBleHByZXNzaW9uIHdpdGhpbiBhbm90aGVyIChlLmcuIGxvY2FsIHJlZmVyZW5jZXMgd29ya1xuICAvLyB0aGlzIHdheSkuXG4gIGNvbnN0IHNsb3RNYXAgPSBuZXcgTWFwPGlyLlhyZWZJZCwgbnVtYmVyPigpO1xuXG4gIC8vIFByb2Nlc3MgYWxsIHZpZXdzIGluIHRoZSBjb21wb25lbnQgYW5kIGFzc2lnbiBzbG90IGluZGV4ZXMuXG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICAvLyBTbG90IGluZGljZXMgc3RhcnQgYXQgMCBmb3IgZWFjaCB2aWV3IChhbmQgYXJlIG5vdCB1bmlxdWUgYmV0d2VlbiB2aWV3cykuXG4gICAgbGV0IHNsb3RDb3VudCA9IDA7XG5cbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICAvLyBPbmx5IGNvbnNpZGVyIGRlY2xhcmF0aW9ucyB3aGljaCBjb25zdW1lIGRhdGEgc2xvdHMuXG4gICAgICBpZiAoIWlyLmhhc0NvbnN1bWVzU2xvdFRyYWl0KG9wKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gQXNzaWduIHNsb3RzIHRvIHRoaXMgZGVjbGFyYXRpb24gc3RhcnRpbmcgYXQgdGhlIGN1cnJlbnQgYHNsb3RDb3VudGAuXG4gICAgICBvcC5oYW5kbGUuc2xvdCA9IHNsb3RDb3VudDtcblxuICAgICAgLy8gQW5kIHRyYWNrIGl0cyBhc3NpZ25lZCBzbG90IGluIHRoZSBgc2xvdE1hcGAuXG4gICAgICBzbG90TWFwLnNldChvcC54cmVmLCBvcC5oYW5kbGUuc2xvdCk7XG5cbiAgICAgIC8vIEVhY2ggZGVjbGFyYXRpb24gbWF5IHVzZSBtb3JlIHRoYW4gMSBzbG90LCBzbyBpbmNyZW1lbnQgYHNsb3RDb3VudGAgdG8gcmVzZXJ2ZSB0aGUgbnVtYmVyXG4gICAgICAvLyBvZiBzbG90cyByZXF1aXJlZC5cbiAgICAgIHNsb3RDb3VudCArPSBvcC5udW1TbG90c1VzZWQ7XG4gICAgfVxuXG4gICAgLy8gUmVjb3JkIHRoZSB0b3RhbCBudW1iZXIgb2Ygc2xvdHMgdXNlZCBvbiB0aGUgdmlldyBpdHNlbGYuIFRoaXMgd2lsbCBsYXRlciBiZSBwcm9wYWdhdGVkIGludG9cbiAgICAvLyBgaXIuVGVtcGxhdGVPcGBzIHdoaWNoIGRlY2xhcmUgdGhvc2Ugdmlld3MgKGV4Y2VwdCBmb3IgdGhlIHJvb3QgdmlldykuXG4gICAgdW5pdC5kZWNscyA9IHNsb3RDb3VudDtcbiAgfVxuXG4gIC8vIEFmdGVyIHNsb3QgYXNzaWdubWVudCwgYHNsb3RNYXBgIG5vdyBjb250YWlucyBzbG90IGFzc2lnbm1lbnRzIGZvciBldmVyeSBkZWNsYXJhdGlvbiBpbiB0aGVcbiAgLy8gd2hvbGUgdGVtcGxhdGUsIGFjcm9zcyBhbGwgdmlld3MuIE5leHQsIGxvb2sgZm9yIGV4cHJlc3Npb25zIHdoaWNoIGltcGxlbWVudFxuICAvLyBgVXNlc1Nsb3RJbmRleEV4cHJUcmFpdGAgYW5kIHByb3BhZ2F0ZSB0aGUgYXNzaWduZWQgc2xvdCBpbmRleGVzIGludG8gdGhlbS5cbiAgLy8gQWRkaXRpb25hbGx5LCB0aGlzIHNlY29uZCBzY2FuIGFsbG93cyB1cyB0byBmaW5kIGBpci5UZW1wbGF0ZU9wYHMgd2hpY2ggZGVjbGFyZSB2aWV3cyBhbmRcbiAgLy8gcHJvcGFnYXRlIHRoZSBudW1iZXIgb2Ygc2xvdHMgdXNlZCBmb3IgZWFjaCB2aWV3IGludG8gdGhlIG9wZXJhdGlvbiB3aGljaCBkZWNsYXJlcyBpdC5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5vcHMoKSkge1xuICAgICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5UZW1wbGF0ZSB8fCBvcC5raW5kID09PSBpci5PcEtpbmQuUmVwZWF0ZXJDcmVhdGUpIHtcbiAgICAgICAgLy8gUmVjb3JkIHRoZSBudW1iZXIgb2Ygc2xvdHMgdXNlZCBieSB0aGUgdmlldyB0aGlzIGBpci5UZW1wbGF0ZU9wYCBkZWNsYXJlcyBpbiB0aGVcbiAgICAgICAgLy8gb3BlcmF0aW9uIGl0c2VsZiwgc28gaXQgY2FuIGJlIGVtaXR0ZWQgbGF0ZXIuXG4gICAgICAgIGNvbnN0IGNoaWxkVmlldyA9IGpvYi52aWV3cy5nZXQob3AueHJlZikhO1xuICAgICAgICBvcC5kZWNscyA9IGNoaWxkVmlldy5kZWNscztcblxuICAgICAgICAvLyBUT0RPOiBjdXJyZW50bHkgd2UgaGFuZGxlIHRoZSBkZWNscyBmb3IgdGhlIFJlcGVhdGVyQ3JlYXRlIGVtcHR5IHRlbXBsYXRlIGluIHRoZSByZWlmeVxuICAgICAgICAvLyBwaGFzZS4gV2Ugc2hvdWxkIGhhbmRsZSB0aGF0IGhlcmUgaW5zdGVhZC5cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==