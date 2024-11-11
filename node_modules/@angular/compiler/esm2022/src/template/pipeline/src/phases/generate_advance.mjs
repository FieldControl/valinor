/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Generate `ir.AdvanceOp`s in between `ir.UpdateOp`s that ensure the runtime's implicit slot
 * context will be advanced correctly.
 */
export function generateAdvance(job) {
    for (const unit of job.units) {
        // First build a map of all of the declarations in the view that have assigned slots.
        const slotMap = new Map();
        for (const op of unit.create) {
            if (!ir.hasConsumesSlotTrait(op)) {
                continue;
            }
            else if (op.handle.slot === null) {
                throw new Error(`AssertionError: expected slots to have been allocated before generating advance() calls`);
            }
            slotMap.set(op.xref, op.handle.slot);
        }
        // Next, step through the update operations and generate `ir.AdvanceOp`s as required to ensure
        // the runtime's implicit slot counter will be set to the correct slot before executing each
        // update operation which depends on it.
        //
        // To do that, we track what the runtime's slot counter will be through the update operations.
        let slotContext = 0;
        for (const op of unit.update) {
            let consumer = null;
            if (ir.hasDependsOnSlotContextTrait(op)) {
                consumer = op;
            }
            else {
                ir.visitExpressionsInOp(op, (expr) => {
                    if (consumer === null && ir.hasDependsOnSlotContextTrait(expr)) {
                        consumer = expr;
                    }
                });
            }
            if (consumer === null) {
                continue;
            }
            if (!slotMap.has(consumer.target)) {
                // We expect ops that _do_ depend on the slot counter to point at declarations that exist in
                // the `slotMap`.
                throw new Error(`AssertionError: reference to unknown slot for target ${consumer.target}`);
            }
            const slot = slotMap.get(consumer.target);
            // Does the slot counter need to be adjusted?
            if (slotContext !== slot) {
                // If so, generate an `ir.AdvanceOp` to advance the counter.
                const delta = slot - slotContext;
                if (delta < 0) {
                    throw new Error(`AssertionError: slot counter should never need to move backwards`);
                }
                ir.OpList.insertBefore(ir.createAdvanceOp(delta, consumer.sourceSpan), op);
                slotContext = slot;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVfYWR2YW5jZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL2dlbmVyYXRlX2FkdmFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxHQUFtQjtJQUNqRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixxRkFBcUY7UUFDckYsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7UUFDN0MsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNqQyxTQUFTO1lBQ1gsQ0FBQztpQkFBTSxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUNuQyxNQUFNLElBQUksS0FBSyxDQUNiLHlGQUF5RixDQUMxRixDQUFDO1lBQ0osQ0FBQztZQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCw4RkFBOEY7UUFDOUYsNEZBQTRGO1FBQzVGLHdDQUF3QztRQUN4QyxFQUFFO1FBQ0YsOEZBQThGO1FBQzlGLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNwQixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUFJLFFBQVEsR0FBMEMsSUFBSSxDQUFDO1lBRTNELElBQUksRUFBRSxDQUFDLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3hDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDaEIsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDbkMsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO3dCQUMvRCxRQUFRLEdBQUcsSUFBSSxDQUFDO29CQUNsQixDQUFDO2dCQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUVELElBQUksUUFBUSxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUN0QixTQUFTO1lBQ1gsQ0FBQztZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUNsQyw0RkFBNEY7Z0JBQzVGLGlCQUFpQjtnQkFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3REFBd0QsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDN0YsQ0FBQztZQUVELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBRSxDQUFDO1lBRTNDLDZDQUE2QztZQUM3QyxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDekIsNERBQTREO2dCQUM1RCxNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsV0FBVyxDQUFDO2dCQUNqQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDZCxNQUFNLElBQUksS0FBSyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7Z0JBQ3RGLENBQUM7Z0JBRUQsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQWMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RixXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB0eXBlIHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIEdlbmVyYXRlIGBpci5BZHZhbmNlT3BgcyBpbiBiZXR3ZWVuIGBpci5VcGRhdGVPcGBzIHRoYXQgZW5zdXJlIHRoZSBydW50aW1lJ3MgaW1wbGljaXQgc2xvdFxuICogY29udGV4dCB3aWxsIGJlIGFkdmFuY2VkIGNvcnJlY3RseS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQWR2YW5jZShqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICAvLyBGaXJzdCBidWlsZCBhIG1hcCBvZiBhbGwgb2YgdGhlIGRlY2xhcmF0aW9ucyBpbiB0aGUgdmlldyB0aGF0IGhhdmUgYXNzaWduZWQgc2xvdHMuXG4gICAgY29uc3Qgc2xvdE1hcCA9IG5ldyBNYXA8aXIuWHJlZklkLCBudW1iZXI+KCk7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgaWYgKCFpci5oYXNDb25zdW1lc1Nsb3RUcmFpdChvcCkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKG9wLmhhbmRsZS5zbG90ID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQXNzZXJ0aW9uRXJyb3I6IGV4cGVjdGVkIHNsb3RzIHRvIGhhdmUgYmVlbiBhbGxvY2F0ZWQgYmVmb3JlIGdlbmVyYXRpbmcgYWR2YW5jZSgpIGNhbGxzYCxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgc2xvdE1hcC5zZXQob3AueHJlZiwgb3AuaGFuZGxlLnNsb3QpO1xuICAgIH1cblxuICAgIC8vIE5leHQsIHN0ZXAgdGhyb3VnaCB0aGUgdXBkYXRlIG9wZXJhdGlvbnMgYW5kIGdlbmVyYXRlIGBpci5BZHZhbmNlT3BgcyBhcyByZXF1aXJlZCB0byBlbnN1cmVcbiAgICAvLyB0aGUgcnVudGltZSdzIGltcGxpY2l0IHNsb3QgY291bnRlciB3aWxsIGJlIHNldCB0byB0aGUgY29ycmVjdCBzbG90IGJlZm9yZSBleGVjdXRpbmcgZWFjaFxuICAgIC8vIHVwZGF0ZSBvcGVyYXRpb24gd2hpY2ggZGVwZW5kcyBvbiBpdC5cbiAgICAvL1xuICAgIC8vIFRvIGRvIHRoYXQsIHdlIHRyYWNrIHdoYXQgdGhlIHJ1bnRpbWUncyBzbG90IGNvdW50ZXIgd2lsbCBiZSB0aHJvdWdoIHRoZSB1cGRhdGUgb3BlcmF0aW9ucy5cbiAgICBsZXQgc2xvdENvbnRleHQgPSAwO1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC51cGRhdGUpIHtcbiAgICAgIGxldCBjb25zdW1lcjogaXIuRGVwZW5kc09uU2xvdENvbnRleHRPcFRyYWl0IHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIGlmIChpci5oYXNEZXBlbmRzT25TbG90Q29udGV4dFRyYWl0KG9wKSkge1xuICAgICAgICBjb25zdW1lciA9IG9wO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXIudmlzaXRFeHByZXNzaW9uc0luT3Aob3AsIChleHByKSA9PiB7XG4gICAgICAgICAgaWYgKGNvbnN1bWVyID09PSBudWxsICYmIGlyLmhhc0RlcGVuZHNPblNsb3RDb250ZXh0VHJhaXQoZXhwcikpIHtcbiAgICAgICAgICAgIGNvbnN1bWVyID0gZXhwcjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29uc3VtZXIgPT09IG51bGwpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICghc2xvdE1hcC5oYXMoY29uc3VtZXIudGFyZ2V0KSkge1xuICAgICAgICAvLyBXZSBleHBlY3Qgb3BzIHRoYXQgX2RvXyBkZXBlbmQgb24gdGhlIHNsb3QgY291bnRlciB0byBwb2ludCBhdCBkZWNsYXJhdGlvbnMgdGhhdCBleGlzdCBpblxuICAgICAgICAvLyB0aGUgYHNsb3RNYXBgLlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiByZWZlcmVuY2UgdG8gdW5rbm93biBzbG90IGZvciB0YXJnZXQgJHtjb25zdW1lci50YXJnZXR9YCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNsb3QgPSBzbG90TWFwLmdldChjb25zdW1lci50YXJnZXQpITtcblxuICAgICAgLy8gRG9lcyB0aGUgc2xvdCBjb3VudGVyIG5lZWQgdG8gYmUgYWRqdXN0ZWQ/XG4gICAgICBpZiAoc2xvdENvbnRleHQgIT09IHNsb3QpIHtcbiAgICAgICAgLy8gSWYgc28sIGdlbmVyYXRlIGFuIGBpci5BZHZhbmNlT3BgIHRvIGFkdmFuY2UgdGhlIGNvdW50ZXIuXG4gICAgICAgIGNvbnN0IGRlbHRhID0gc2xvdCAtIHNsb3RDb250ZXh0O1xuICAgICAgICBpZiAoZGVsdGEgPCAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb25FcnJvcjogc2xvdCBjb3VudGVyIHNob3VsZCBuZXZlciBuZWVkIHRvIG1vdmUgYmFja3dhcmRzYCk7XG4gICAgICAgIH1cblxuICAgICAgICBpci5PcExpc3QuaW5zZXJ0QmVmb3JlPGlyLlVwZGF0ZU9wPihpci5jcmVhdGVBZHZhbmNlT3AoZGVsdGEsIGNvbnN1bWVyLnNvdXJjZVNwYW4pLCBvcCk7XG4gICAgICAgIHNsb3RDb250ZXh0ID0gc2xvdDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==