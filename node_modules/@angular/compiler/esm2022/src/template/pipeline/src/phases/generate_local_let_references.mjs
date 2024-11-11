/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Replaces the `storeLet` ops with variables that can be
 * used to reference the value within the same view.
 */
export function generateLocalLetReferences(job) {
    for (const unit of job.units) {
        for (const op of unit.update) {
            if (op.kind !== ir.OpKind.StoreLet) {
                continue;
            }
            const variable = {
                kind: ir.SemanticVariableKind.Identifier,
                name: null,
                identifier: op.declaredName,
                local: true,
            };
            ir.OpList.replace(op, ir.createVariableOp(job.allocateXrefId(), variable, new ir.StoreLetExpr(op.target, op.value, op.sourceSpan), ir.VariableFlags.None));
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVfbG9jYWxfbGV0X3JlZmVyZW5jZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9nZW5lcmF0ZV9sb2NhbF9sZXRfcmVmZXJlbmNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUkvQjs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsMEJBQTBCLENBQUMsR0FBNEI7SUFDckUsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ25DLFNBQVM7WUFDWCxDQUFDO1lBRUQsTUFBTSxRQUFRLEdBQTBCO2dCQUN0QyxJQUFJLEVBQUUsRUFBRSxDQUFDLG9CQUFvQixDQUFDLFVBQVU7Z0JBQ3hDLElBQUksRUFBRSxJQUFJO2dCQUNWLFVBQVUsRUFBRSxFQUFFLENBQUMsWUFBWTtnQkFDM0IsS0FBSyxFQUFFLElBQUk7YUFDWixDQUFDO1lBRUYsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQ2YsRUFBRSxFQUNGLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDakIsR0FBRyxDQUFDLGNBQWMsRUFBRSxFQUNwQixRQUFRLEVBQ1IsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQ3ZELEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUN0QixDQUNGLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcblxuaW1wb3J0IHR5cGUge0NvbXBvbmVudENvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8qKlxuICogUmVwbGFjZXMgdGhlIGBzdG9yZUxldGAgb3BzIHdpdGggdmFyaWFibGVzIHRoYXQgY2FuIGJlXG4gKiB1c2VkIHRvIHJlZmVyZW5jZSB0aGUgdmFsdWUgd2l0aGluIHRoZSBzYW1lIHZpZXcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUxvY2FsTGV0UmVmZXJlbmNlcyhqb2I6IENvbXBvbmVudENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQudXBkYXRlKSB7XG4gICAgICBpZiAob3Aua2luZCAhPT0gaXIuT3BLaW5kLlN0b3JlTGV0KSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB2YXJpYWJsZTogaXIuSWRlbnRpZmllclZhcmlhYmxlID0ge1xuICAgICAgICBraW5kOiBpci5TZW1hbnRpY1ZhcmlhYmxlS2luZC5JZGVudGlmaWVyLFxuICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICBpZGVudGlmaWVyOiBvcC5kZWNsYXJlZE5hbWUsXG4gICAgICAgIGxvY2FsOiB0cnVlLFxuICAgICAgfTtcblxuICAgICAgaXIuT3BMaXN0LnJlcGxhY2U8aXIuVXBkYXRlT3A+KFxuICAgICAgICBvcCxcbiAgICAgICAgaXIuY3JlYXRlVmFyaWFibGVPcDxpci5VcGRhdGVPcD4oXG4gICAgICAgICAgam9iLmFsbG9jYXRlWHJlZklkKCksXG4gICAgICAgICAgdmFyaWFibGUsXG4gICAgICAgICAgbmV3IGlyLlN0b3JlTGV0RXhwcihvcC50YXJnZXQsIG9wLnZhbHVlLCBvcC5zb3VyY2VTcGFuKSxcbiAgICAgICAgICBpci5WYXJpYWJsZUZsYWdzLk5vbmUsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIl19