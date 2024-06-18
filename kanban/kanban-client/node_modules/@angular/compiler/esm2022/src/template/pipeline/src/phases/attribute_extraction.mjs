/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { SecurityContext } from '../../../../core';
import * as ir from '../../ir';
import { CompilationJobKind } from '../compilation';
import { createOpXrefMap } from '../util/elements';
/**
 * Find all extractable attribute and binding ops, and create ExtractedAttributeOps for them.
 * In cases where no instruction needs to be generated for the attribute or binding, it is removed.
 */
export function extractAttributes(job) {
    for (const unit of job.units) {
        const elements = createOpXrefMap(unit);
        for (const op of unit.ops()) {
            switch (op.kind) {
                case ir.OpKind.Attribute:
                    extractAttributeOp(unit, op, elements);
                    break;
                case ir.OpKind.Property:
                    if (!op.isAnimationTrigger) {
                        let bindingKind;
                        if (op.i18nMessage !== null && op.templateKind === null) {
                            // If the binding has an i18n context, it is an i18n attribute, and should have that
                            // kind in the consts array.
                            bindingKind = ir.BindingKind.I18n;
                        }
                        else if (op.isStructuralTemplateAttribute) {
                            bindingKind = ir.BindingKind.Template;
                        }
                        else {
                            bindingKind = ir.BindingKind.Property;
                        }
                        ir.OpList.insertBefore(
                        // Deliberately null i18nMessage value
                        ir.createExtractedAttributeOp(op.target, bindingKind, null, op.name, 
                        /* expression */ null, 
                        /* i18nContext */ null, 
                        /* i18nMessage */ null, op.securityContext), lookupElement(elements, op.target));
                    }
                    break;
                case ir.OpKind.TwoWayProperty:
                    ir.OpList.insertBefore(ir.createExtractedAttributeOp(op.target, ir.BindingKind.TwoWayProperty, null, op.name, 
                    /* expression */ null, 
                    /* i18nContext */ null, 
                    /* i18nMessage */ null, op.securityContext), lookupElement(elements, op.target));
                    break;
                case ir.OpKind.StyleProp:
                case ir.OpKind.ClassProp:
                    // TODO: Can style or class bindings be i18n attributes?
                    // The old compiler treated empty style bindings as regular bindings for the purpose of
                    // directive matching. That behavior is incorrect, but we emulate it in compatibility
                    // mode.
                    if (unit.job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder &&
                        op.expression instanceof ir.EmptyExpr) {
                        ir.OpList.insertBefore(ir.createExtractedAttributeOp(op.target, ir.BindingKind.Property, null, op.name, 
                        /* expression */ null, 
                        /* i18nContext */ null, 
                        /* i18nMessage */ null, SecurityContext.STYLE), lookupElement(elements, op.target));
                    }
                    break;
                case ir.OpKind.Listener:
                    if (!op.isAnimationListener) {
                        const extractedAttributeOp = ir.createExtractedAttributeOp(op.target, ir.BindingKind.Property, null, op.name, 
                        /* expression */ null, 
                        /* i18nContext */ null, 
                        /* i18nMessage */ null, SecurityContext.NONE);
                        if (job.kind === CompilationJobKind.Host) {
                            if (job.compatibility) {
                                // TemplateDefinitionBuilder does not extract listener bindings to the const array
                                // (which is honestly pretty inconsistent).
                                break;
                            }
                            // This attribute will apply to the enclosing host binding compilation unit, so order
                            // doesn't matter.
                            unit.create.push(extractedAttributeOp);
                        }
                        else {
                            ir.OpList.insertBefore(extractedAttributeOp, lookupElement(elements, op.target));
                        }
                    }
                    break;
                case ir.OpKind.TwoWayListener:
                    // Two-way listeners aren't supported in host bindings.
                    if (job.kind !== CompilationJobKind.Host) {
                        const extractedAttributeOp = ir.createExtractedAttributeOp(op.target, ir.BindingKind.Property, null, op.name, 
                        /* expression */ null, 
                        /* i18nContext */ null, 
                        /* i18nMessage */ null, SecurityContext.NONE);
                        ir.OpList.insertBefore(extractedAttributeOp, lookupElement(elements, op.target));
                    }
                    break;
            }
        }
    }
}
/**
 * Looks up an element in the given map by xref ID.
 */
function lookupElement(elements, xref) {
    const el = elements.get(xref);
    if (el === undefined) {
        throw new Error('All attributes should have an element-like target.');
    }
    return el;
}
/**
 * Extracts an attribute binding.
 */
function extractAttributeOp(unit, op, elements) {
    if (op.expression instanceof ir.Interpolation) {
        return;
    }
    let extractable = op.isTextAttribute || op.expression.isConstant();
    if (unit.job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder) {
        // TemplateDefinitionBuilder only extracts text attributes. It does not extract attriibute
        // bindings, even if they are constants.
        extractable &&= op.isTextAttribute;
    }
    if (extractable) {
        const extractedAttributeOp = ir.createExtractedAttributeOp(op.target, op.isStructuralTemplateAttribute ? ir.BindingKind.Template : ir.BindingKind.Attribute, op.namespace, op.name, op.expression, op.i18nContext, op.i18nMessage, op.securityContext);
        if (unit.job.kind === CompilationJobKind.Host) {
            // This attribute will apply to the enclosing host binding compilation unit, so order doesn't
            // matter.
            unit.create.push(extractedAttributeOp);
        }
        else {
            const ownerOp = lookupElement(elements, op.target);
            ir.OpList.insertBefore(extractedAttributeOp, ownerOp);
        }
        ir.OpList.remove(op);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0cmlidXRlX2V4dHJhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9hdHRyaWJ1dGVfZXh0cmFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDL0IsT0FBTyxFQUFDLGtCQUFrQixFQUE0QyxNQUFNLGdCQUFnQixDQUFDO0FBQzdGLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUVqRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsR0FBbUI7SUFDbkQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsTUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDNUIsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTO29CQUN0QixrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUN2QyxNQUFNO2dCQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRO29CQUNyQixJQUFJLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUM7d0JBQzNCLElBQUksV0FBMkIsQ0FBQzt3QkFDaEMsSUFBSSxFQUFFLENBQUMsV0FBVyxLQUFLLElBQUksSUFBSSxFQUFFLENBQUMsWUFBWSxLQUFLLElBQUksRUFBRSxDQUFDOzRCQUN4RCxvRkFBb0Y7NEJBQ3BGLDRCQUE0Qjs0QkFDNUIsV0FBVyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO3dCQUNwQyxDQUFDOzZCQUFNLElBQUksRUFBRSxDQUFDLDZCQUE2QixFQUFFLENBQUM7NEJBQzVDLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQzt3QkFDeEMsQ0FBQzs2QkFBTSxDQUFDOzRCQUNOLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQzt3QkFDeEMsQ0FBQzt3QkFFRCxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVk7d0JBQ3BCLHNDQUFzQzt3QkFDdEMsRUFBRSxDQUFDLDBCQUEwQixDQUMzQixFQUFFLENBQUMsTUFBTSxFQUNULFdBQVcsRUFDWCxJQUFJLEVBQ0osRUFBRSxDQUFDLElBQUk7d0JBQ1AsZ0JBQWdCLENBQUMsSUFBSTt3QkFDckIsaUJBQWlCLENBQUMsSUFBSTt3QkFDdEIsaUJBQWlCLENBQUMsSUFBSSxFQUN0QixFQUFFLENBQUMsZUFBZSxDQUNuQixFQUNELGFBQWEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUNuQyxDQUFDO29CQUNKLENBQUM7b0JBQ0QsTUFBTTtnQkFDUixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYztvQkFDM0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQ3BCLEVBQUUsQ0FBQywwQkFBMEIsQ0FDM0IsRUFBRSxDQUFDLE1BQU0sRUFDVCxFQUFFLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFDN0IsSUFBSSxFQUNKLEVBQUUsQ0FBQyxJQUFJO29CQUNQLGdCQUFnQixDQUFDLElBQUk7b0JBQ3JCLGlCQUFpQixDQUFDLElBQUk7b0JBQ3RCLGlCQUFpQixDQUFDLElBQUksRUFDdEIsRUFBRSxDQUFDLGVBQWUsQ0FDbkIsRUFDRCxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FDbkMsQ0FBQztvQkFDRixNQUFNO2dCQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7Z0JBQ3pCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTO29CQUN0Qix3REFBd0Q7b0JBRXhELHVGQUF1RjtvQkFDdkYscUZBQXFGO29CQUNyRixRQUFRO29CQUNSLElBQ0UsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEtBQUssRUFBRSxDQUFDLGlCQUFpQixDQUFDLHlCQUF5Qjt3QkFDekUsRUFBRSxDQUFDLFVBQVUsWUFBWSxFQUFFLENBQUMsU0FBUyxFQUNyQyxDQUFDO3dCQUNELEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUNwQixFQUFFLENBQUMsMEJBQTBCLENBQzNCLEVBQUUsQ0FBQyxNQUFNLEVBQ1QsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQ3ZCLElBQUksRUFDSixFQUFFLENBQUMsSUFBSTt3QkFDUCxnQkFBZ0IsQ0FBQyxJQUFJO3dCQUNyQixpQkFBaUIsQ0FBQyxJQUFJO3dCQUN0QixpQkFBaUIsQ0FBQyxJQUFJLEVBQ3RCLGVBQWUsQ0FBQyxLQUFLLENBQ3RCLEVBQ0QsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQ25DLENBQUM7b0JBQ0osQ0FBQztvQkFDRCxNQUFNO2dCQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRO29CQUNyQixJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQUM7d0JBQzVCLE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDLDBCQUEwQixDQUN4RCxFQUFFLENBQUMsTUFBTSxFQUNULEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUN2QixJQUFJLEVBQ0osRUFBRSxDQUFDLElBQUk7d0JBQ1AsZ0JBQWdCLENBQUMsSUFBSTt3QkFDckIsaUJBQWlCLENBQUMsSUFBSTt3QkFDdEIsaUJBQWlCLENBQUMsSUFBSSxFQUN0QixlQUFlLENBQUMsSUFBSSxDQUNyQixDQUFDO3dCQUNGLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs0QkFDekMsSUFBSSxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7Z0NBQ3RCLGtGQUFrRjtnQ0FDbEYsMkNBQTJDO2dDQUMzQyxNQUFNOzRCQUNSLENBQUM7NEJBQ0QscUZBQXFGOzRCQUNyRixrQkFBa0I7NEJBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7d0JBQ3pDLENBQUM7NkJBQU0sQ0FBQzs0QkFDTixFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FDcEIsb0JBQW9CLEVBQ3BCLGFBQWEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUNuQyxDQUFDO3dCQUNKLENBQUM7b0JBQ0gsQ0FBQztvQkFDRCxNQUFNO2dCQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxjQUFjO29CQUMzQix1REFBdUQ7b0JBQ3ZELElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDekMsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUMsMEJBQTBCLENBQ3hELEVBQUUsQ0FBQyxNQUFNLEVBQ1QsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQ3ZCLElBQUksRUFDSixFQUFFLENBQUMsSUFBSTt3QkFDUCxnQkFBZ0IsQ0FBQyxJQUFJO3dCQUNyQixpQkFBaUIsQ0FBQyxJQUFJO3dCQUN0QixpQkFBaUIsQ0FBQyxJQUFJLEVBQ3RCLGVBQWUsQ0FBQyxJQUFJLENBQ3JCLENBQUM7d0JBQ0YsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQ3BCLG9CQUFvQixFQUNwQixhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FDbkMsQ0FBQztvQkFDSixDQUFDO29CQUNELE1BQU07WUFDVixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLGFBQWEsQ0FDcEIsUUFBOEQsRUFDOUQsSUFBZTtJQUVmLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsSUFBSSxFQUFFLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFDRCxPQUFPLEVBQUUsQ0FBQztBQUNaLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsa0JBQWtCLENBQ3pCLElBQXFCLEVBQ3JCLEVBQWtCLEVBQ2xCLFFBQThEO0lBRTlELElBQUksRUFBRSxDQUFDLFVBQVUsWUFBWSxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDOUMsT0FBTztJQUNULENBQUM7SUFFRCxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDbkUsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsS0FBSyxFQUFFLENBQUMsaUJBQWlCLENBQUMseUJBQXlCLEVBQUUsQ0FBQztRQUM5RSwwRkFBMEY7UUFDMUYsd0NBQXdDO1FBQ3hDLFdBQVcsS0FBSyxFQUFFLENBQUMsZUFBZSxDQUFDO0lBQ3JDLENBQUM7SUFFRCxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ2hCLE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDLDBCQUEwQixDQUN4RCxFQUFFLENBQUMsTUFBTSxFQUNULEVBQUUsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUNyRixFQUFFLENBQUMsU0FBUyxFQUNaLEVBQUUsQ0FBQyxJQUFJLEVBQ1AsRUFBRSxDQUFDLFVBQVUsRUFDYixFQUFFLENBQUMsV0FBVyxFQUNkLEVBQUUsQ0FBQyxXQUFXLEVBQ2QsRUFBRSxDQUFDLGVBQWUsQ0FDbkIsQ0FBQztRQUNGLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDOUMsNkZBQTZGO1lBQzdGLFVBQVU7WUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkQsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQWMsb0JBQW9CLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUNELEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2VjdXJpdHlDb250ZXh0fSBmcm9tICcuLi8uLi8uLi8uLi9jb3JlJztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2JLaW5kLCB0eXBlIENvbXBpbGF0aW9uSm9iLCB0eXBlIENvbXBpbGF0aW9uVW5pdH0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuaW1wb3J0IHtjcmVhdGVPcFhyZWZNYXB9IGZyb20gJy4uL3V0aWwvZWxlbWVudHMnO1xuXG4vKipcbiAqIEZpbmQgYWxsIGV4dHJhY3RhYmxlIGF0dHJpYnV0ZSBhbmQgYmluZGluZyBvcHMsIGFuZCBjcmVhdGUgRXh0cmFjdGVkQXR0cmlidXRlT3BzIGZvciB0aGVtLlxuICogSW4gY2FzZXMgd2hlcmUgbm8gaW5zdHJ1Y3Rpb24gbmVlZHMgdG8gYmUgZ2VuZXJhdGVkIGZvciB0aGUgYXR0cmlidXRlIG9yIGJpbmRpbmcsIGl0IGlzIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0QXR0cmlidXRlcyhqb2I6IENvbXBpbGF0aW9uSm9iKTogdm9pZCB7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBjb25zdCBlbGVtZW50cyA9IGNyZWF0ZU9wWHJlZk1hcCh1bml0KTtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQub3BzKCkpIHtcbiAgICAgIHN3aXRjaCAob3Aua2luZCkge1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5BdHRyaWJ1dGU6XG4gICAgICAgICAgZXh0cmFjdEF0dHJpYnV0ZU9wKHVuaXQsIG9wLCBlbGVtZW50cyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLlByb3BlcnR5OlxuICAgICAgICAgIGlmICghb3AuaXNBbmltYXRpb25UcmlnZ2VyKSB7XG4gICAgICAgICAgICBsZXQgYmluZGluZ0tpbmQ6IGlyLkJpbmRpbmdLaW5kO1xuICAgICAgICAgICAgaWYgKG9wLmkxOG5NZXNzYWdlICE9PSBudWxsICYmIG9wLnRlbXBsYXRlS2luZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAvLyBJZiB0aGUgYmluZGluZyBoYXMgYW4gaTE4biBjb250ZXh0LCBpdCBpcyBhbiBpMThuIGF0dHJpYnV0ZSwgYW5kIHNob3VsZCBoYXZlIHRoYXRcbiAgICAgICAgICAgICAgLy8ga2luZCBpbiB0aGUgY29uc3RzIGFycmF5LlxuICAgICAgICAgICAgICBiaW5kaW5nS2luZCA9IGlyLkJpbmRpbmdLaW5kLkkxOG47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wLmlzU3RydWN0dXJhbFRlbXBsYXRlQXR0cmlidXRlKSB7XG4gICAgICAgICAgICAgIGJpbmRpbmdLaW5kID0gaXIuQmluZGluZ0tpbmQuVGVtcGxhdGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBiaW5kaW5nS2luZCA9IGlyLkJpbmRpbmdLaW5kLlByb3BlcnR5O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpci5PcExpc3QuaW5zZXJ0QmVmb3JlPGlyLkNyZWF0ZU9wPihcbiAgICAgICAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IG51bGwgaTE4bk1lc3NhZ2UgdmFsdWVcbiAgICAgICAgICAgICAgaXIuY3JlYXRlRXh0cmFjdGVkQXR0cmlidXRlT3AoXG4gICAgICAgICAgICAgICAgb3AudGFyZ2V0LFxuICAgICAgICAgICAgICAgIGJpbmRpbmdLaW5kLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgb3AubmFtZSxcbiAgICAgICAgICAgICAgICAvKiBleHByZXNzaW9uICovIG51bGwsXG4gICAgICAgICAgICAgICAgLyogaTE4bkNvbnRleHQgKi8gbnVsbCxcbiAgICAgICAgICAgICAgICAvKiBpMThuTWVzc2FnZSAqLyBudWxsLFxuICAgICAgICAgICAgICAgIG9wLnNlY3VyaXR5Q29udGV4dCxcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgbG9va3VwRWxlbWVudChlbGVtZW50cywgb3AudGFyZ2V0KSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5Ud29XYXlQcm9wZXJ0eTpcbiAgICAgICAgICBpci5PcExpc3QuaW5zZXJ0QmVmb3JlPGlyLkNyZWF0ZU9wPihcbiAgICAgICAgICAgIGlyLmNyZWF0ZUV4dHJhY3RlZEF0dHJpYnV0ZU9wKFxuICAgICAgICAgICAgICBvcC50YXJnZXQsXG4gICAgICAgICAgICAgIGlyLkJpbmRpbmdLaW5kLlR3b1dheVByb3BlcnR5LFxuICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICBvcC5uYW1lLFxuICAgICAgICAgICAgICAvKiBleHByZXNzaW9uICovIG51bGwsXG4gICAgICAgICAgICAgIC8qIGkxOG5Db250ZXh0ICovIG51bGwsXG4gICAgICAgICAgICAgIC8qIGkxOG5NZXNzYWdlICovIG51bGwsXG4gICAgICAgICAgICAgIG9wLnNlY3VyaXR5Q29udGV4dCxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBsb29rdXBFbGVtZW50KGVsZW1lbnRzLCBvcC50YXJnZXQpLFxuICAgICAgICAgICk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLlN0eWxlUHJvcDpcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuQ2xhc3NQcm9wOlxuICAgICAgICAgIC8vIFRPRE86IENhbiBzdHlsZSBvciBjbGFzcyBiaW5kaW5ncyBiZSBpMThuIGF0dHJpYnV0ZXM/XG5cbiAgICAgICAgICAvLyBUaGUgb2xkIGNvbXBpbGVyIHRyZWF0ZWQgZW1wdHkgc3R5bGUgYmluZGluZ3MgYXMgcmVndWxhciBiaW5kaW5ncyBmb3IgdGhlIHB1cnBvc2Ugb2ZcbiAgICAgICAgICAvLyBkaXJlY3RpdmUgbWF0Y2hpbmcuIFRoYXQgYmVoYXZpb3IgaXMgaW5jb3JyZWN0LCBidXQgd2UgZW11bGF0ZSBpdCBpbiBjb21wYXRpYmlsaXR5XG4gICAgICAgICAgLy8gbW9kZS5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICB1bml0LmpvYi5jb21wYXRpYmlsaXR5ID09PSBpci5Db21wYXRpYmlsaXR5TW9kZS5UZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyICYmXG4gICAgICAgICAgICBvcC5leHByZXNzaW9uIGluc3RhbmNlb2YgaXIuRW1wdHlFeHByXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBpci5PcExpc3QuaW5zZXJ0QmVmb3JlPGlyLkNyZWF0ZU9wPihcbiAgICAgICAgICAgICAgaXIuY3JlYXRlRXh0cmFjdGVkQXR0cmlidXRlT3AoXG4gICAgICAgICAgICAgICAgb3AudGFyZ2V0LFxuICAgICAgICAgICAgICAgIGlyLkJpbmRpbmdLaW5kLlByb3BlcnR5LFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgb3AubmFtZSxcbiAgICAgICAgICAgICAgICAvKiBleHByZXNzaW9uICovIG51bGwsXG4gICAgICAgICAgICAgICAgLyogaTE4bkNvbnRleHQgKi8gbnVsbCxcbiAgICAgICAgICAgICAgICAvKiBpMThuTWVzc2FnZSAqLyBudWxsLFxuICAgICAgICAgICAgICAgIFNlY3VyaXR5Q29udGV4dC5TVFlMRSxcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgbG9va3VwRWxlbWVudChlbGVtZW50cywgb3AudGFyZ2V0KSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5MaXN0ZW5lcjpcbiAgICAgICAgICBpZiAoIW9wLmlzQW5pbWF0aW9uTGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4dHJhY3RlZEF0dHJpYnV0ZU9wID0gaXIuY3JlYXRlRXh0cmFjdGVkQXR0cmlidXRlT3AoXG4gICAgICAgICAgICAgIG9wLnRhcmdldCxcbiAgICAgICAgICAgICAgaXIuQmluZGluZ0tpbmQuUHJvcGVydHksXG4gICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgIG9wLm5hbWUsXG4gICAgICAgICAgICAgIC8qIGV4cHJlc3Npb24gKi8gbnVsbCxcbiAgICAgICAgICAgICAgLyogaTE4bkNvbnRleHQgKi8gbnVsbCxcbiAgICAgICAgICAgICAgLyogaTE4bk1lc3NhZ2UgKi8gbnVsbCxcbiAgICAgICAgICAgICAgU2VjdXJpdHlDb250ZXh0Lk5PTkUsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKGpvYi5raW5kID09PSBDb21waWxhdGlvbkpvYktpbmQuSG9zdCkge1xuICAgICAgICAgICAgICBpZiAoam9iLmNvbXBhdGliaWxpdHkpIHtcbiAgICAgICAgICAgICAgICAvLyBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyIGRvZXMgbm90IGV4dHJhY3QgbGlzdGVuZXIgYmluZGluZ3MgdG8gdGhlIGNvbnN0IGFycmF5XG4gICAgICAgICAgICAgICAgLy8gKHdoaWNoIGlzIGhvbmVzdGx5IHByZXR0eSBpbmNvbnNpc3RlbnQpLlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFRoaXMgYXR0cmlidXRlIHdpbGwgYXBwbHkgdG8gdGhlIGVuY2xvc2luZyBob3N0IGJpbmRpbmcgY29tcGlsYXRpb24gdW5pdCwgc28gb3JkZXJcbiAgICAgICAgICAgICAgLy8gZG9lc24ndCBtYXR0ZXIuXG4gICAgICAgICAgICAgIHVuaXQuY3JlYXRlLnB1c2goZXh0cmFjdGVkQXR0cmlidXRlT3ApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaXIuT3BMaXN0Lmluc2VydEJlZm9yZTxpci5DcmVhdGVPcD4oXG4gICAgICAgICAgICAgICAgZXh0cmFjdGVkQXR0cmlidXRlT3AsXG4gICAgICAgICAgICAgICAgbG9va3VwRWxlbWVudChlbGVtZW50cywgb3AudGFyZ2V0KSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLlR3b1dheUxpc3RlbmVyOlxuICAgICAgICAgIC8vIFR3by13YXkgbGlzdGVuZXJzIGFyZW4ndCBzdXBwb3J0ZWQgaW4gaG9zdCBiaW5kaW5ncy5cbiAgICAgICAgICBpZiAoam9iLmtpbmQgIT09IENvbXBpbGF0aW9uSm9iS2luZC5Ib3N0KSB7XG4gICAgICAgICAgICBjb25zdCBleHRyYWN0ZWRBdHRyaWJ1dGVPcCA9IGlyLmNyZWF0ZUV4dHJhY3RlZEF0dHJpYnV0ZU9wKFxuICAgICAgICAgICAgICBvcC50YXJnZXQsXG4gICAgICAgICAgICAgIGlyLkJpbmRpbmdLaW5kLlByb3BlcnR5LFxuICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICBvcC5uYW1lLFxuICAgICAgICAgICAgICAvKiBleHByZXNzaW9uICovIG51bGwsXG4gICAgICAgICAgICAgIC8qIGkxOG5Db250ZXh0ICovIG51bGwsXG4gICAgICAgICAgICAgIC8qIGkxOG5NZXNzYWdlICovIG51bGwsXG4gICAgICAgICAgICAgIFNlY3VyaXR5Q29udGV4dC5OT05FLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlyLk9wTGlzdC5pbnNlcnRCZWZvcmU8aXIuQ3JlYXRlT3A+KFxuICAgICAgICAgICAgICBleHRyYWN0ZWRBdHRyaWJ1dGVPcCxcbiAgICAgICAgICAgICAgbG9va3VwRWxlbWVudChlbGVtZW50cywgb3AudGFyZ2V0KSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIExvb2tzIHVwIGFuIGVsZW1lbnQgaW4gdGhlIGdpdmVuIG1hcCBieSB4cmVmIElELlxuICovXG5mdW5jdGlvbiBsb29rdXBFbGVtZW50KFxuICBlbGVtZW50czogTWFwPGlyLlhyZWZJZCwgaXIuQ29uc3VtZXNTbG90T3BUcmFpdCAmIGlyLkNyZWF0ZU9wPixcbiAgeHJlZjogaXIuWHJlZklkLFxuKTogaXIuQ29uc3VtZXNTbG90T3BUcmFpdCAmIGlyLkNyZWF0ZU9wIHtcbiAgY29uc3QgZWwgPSBlbGVtZW50cy5nZXQoeHJlZik7XG4gIGlmIChlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBbGwgYXR0cmlidXRlcyBzaG91bGQgaGF2ZSBhbiBlbGVtZW50LWxpa2UgdGFyZ2V0LicpO1xuICB9XG4gIHJldHVybiBlbDtcbn1cblxuLyoqXG4gKiBFeHRyYWN0cyBhbiBhdHRyaWJ1dGUgYmluZGluZy5cbiAqL1xuZnVuY3Rpb24gZXh0cmFjdEF0dHJpYnV0ZU9wKFxuICB1bml0OiBDb21waWxhdGlvblVuaXQsXG4gIG9wOiBpci5BdHRyaWJ1dGVPcCxcbiAgZWxlbWVudHM6IE1hcDxpci5YcmVmSWQsIGlyLkNvbnN1bWVzU2xvdE9wVHJhaXQgJiBpci5DcmVhdGVPcD4sXG4pIHtcbiAgaWYgKG9wLmV4cHJlc3Npb24gaW5zdGFuY2VvZiBpci5JbnRlcnBvbGF0aW9uKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IGV4dHJhY3RhYmxlID0gb3AuaXNUZXh0QXR0cmlidXRlIHx8IG9wLmV4cHJlc3Npb24uaXNDb25zdGFudCgpO1xuICBpZiAodW5pdC5qb2IuY29tcGF0aWJpbGl0eSA9PT0gaXIuQ29tcGF0aWJpbGl0eU1vZGUuVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlcikge1xuICAgIC8vIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIgb25seSBleHRyYWN0cyB0ZXh0IGF0dHJpYnV0ZXMuIEl0IGRvZXMgbm90IGV4dHJhY3QgYXR0cmlpYnV0ZVxuICAgIC8vIGJpbmRpbmdzLCBldmVuIGlmIHRoZXkgYXJlIGNvbnN0YW50cy5cbiAgICBleHRyYWN0YWJsZSAmJj0gb3AuaXNUZXh0QXR0cmlidXRlO1xuICB9XG5cbiAgaWYgKGV4dHJhY3RhYmxlKSB7XG4gICAgY29uc3QgZXh0cmFjdGVkQXR0cmlidXRlT3AgPSBpci5jcmVhdGVFeHRyYWN0ZWRBdHRyaWJ1dGVPcChcbiAgICAgIG9wLnRhcmdldCxcbiAgICAgIG9wLmlzU3RydWN0dXJhbFRlbXBsYXRlQXR0cmlidXRlID8gaXIuQmluZGluZ0tpbmQuVGVtcGxhdGUgOiBpci5CaW5kaW5nS2luZC5BdHRyaWJ1dGUsXG4gICAgICBvcC5uYW1lc3BhY2UsXG4gICAgICBvcC5uYW1lLFxuICAgICAgb3AuZXhwcmVzc2lvbixcbiAgICAgIG9wLmkxOG5Db250ZXh0LFxuICAgICAgb3AuaTE4bk1lc3NhZ2UsXG4gICAgICBvcC5zZWN1cml0eUNvbnRleHQsXG4gICAgKTtcbiAgICBpZiAodW5pdC5qb2Iua2luZCA9PT0gQ29tcGlsYXRpb25Kb2JLaW5kLkhvc3QpIHtcbiAgICAgIC8vIFRoaXMgYXR0cmlidXRlIHdpbGwgYXBwbHkgdG8gdGhlIGVuY2xvc2luZyBob3N0IGJpbmRpbmcgY29tcGlsYXRpb24gdW5pdCwgc28gb3JkZXIgZG9lc24ndFxuICAgICAgLy8gbWF0dGVyLlxuICAgICAgdW5pdC5jcmVhdGUucHVzaChleHRyYWN0ZWRBdHRyaWJ1dGVPcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG93bmVyT3AgPSBsb29rdXBFbGVtZW50KGVsZW1lbnRzLCBvcC50YXJnZXQpO1xuICAgICAgaXIuT3BMaXN0Lmluc2VydEJlZm9yZTxpci5DcmVhdGVPcD4oZXh0cmFjdGVkQXR0cmlidXRlT3AsIG93bmVyT3ApO1xuICAgIH1cbiAgICBpci5PcExpc3QucmVtb3ZlPGlyLlVwZGF0ZU9wPihvcCk7XG4gIH1cbn1cbiJdfQ==