/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0cmlidXRlX2V4dHJhY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvdGVtcGxhdGUvcGlwZWxpbmUvc3JjL3BoYXNlcy9hdHRyaWJ1dGVfZXh0cmFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDL0IsT0FBTyxFQUFDLGtCQUFrQixFQUE0QyxNQUFNLGdCQUFnQixDQUFDO0FBQzdGLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUVqRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsR0FBbUI7SUFDbkQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsTUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7WUFDNUIsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTO29CQUN0QixrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUN2QyxNQUFNO2dCQUNSLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRO29CQUNyQixJQUFJLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUM7d0JBQzNCLElBQUksV0FBMkIsQ0FBQzt3QkFDaEMsSUFBSSxFQUFFLENBQUMsV0FBVyxLQUFLLElBQUksSUFBSSxFQUFFLENBQUMsWUFBWSxLQUFLLElBQUksRUFBRSxD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QUFJLEtBQUssa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDOUMsNkZBQTZGO1lBQzdGLFVBQVU7WUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7YUFBTSxDQUFDO1lBQ04sTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkQsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQWMsb0JBQW9CLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUNELEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1NlY3VyaXR5Q29udGV4dH0gZnJvbSAnLi4vLi4vLi4vLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5pbXBvcnQge0NvbXBpbGF0aW9uSm9iS2luZCwgdHlwZSBDb21waWxhdGlvbkpvYiwgdHlwZSBDb21waWxhdGlvblVuaXR9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcbmltcG9ydCB7Y3JlYXRlT3BYcmVmTWFwfSBmcm9tICcuLi91dGlsL2VsZW1lbnRzJztcblxuLyoqXG4gKiBGaW5kIGFsbCBleHRyYWN0YWJsZSBhdHRyaWJ1dGUgYW5kIGJpbmRpbmcgb3BzLCBhbmQgY3JlYXRlIEV4dHJhY3RlZEF0dHJpYnV0ZU9wcyBmb3IgdGhlbS5cbiAqIEluIGNhc2VzIHdoZXJlIG5vIGluc3RydWN0aW9uIG5lZWRzIHRvIGJlIGdlbmVyYXRlZCBmb3IgdGhlIGF0dHJpYnV0ZSBvciBiaW5kaW5nLCBpdCBpcyByZW1vdmVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEF0dHJpYnV0ZXMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgY29uc3QgZWxlbWVudHMgPSBjcmVhdGVPcFhyZWZNYXAodW5pdCk7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0Lm9wcygpKSB7XG4gICAgICBzd2l0Y2ggKG9wLmtpbmQpIHtcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuQXR0cmlidXRlOlxuICAgICAgICAgIGV4dHJhY3RBdHRyaWJ1dGVPcCh1bml0LCBvcCwgZWxlbWVudHMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5Qcm9wZXJ0eTpcbiAgICAgICAgICBpZiAoIW9wLmlzQW5pbWF0aW9uVHJpZ2dlcikge1xuICAgICAgICAgICAgbGV0IGJpbmRpbmdLaW5kOiBpci5CaW5kaW5nS2luZDtcbiAgICAgICAgICAgIGlmIChvcC5pMThuTWVzc2FnZSAhPT0gbnVsbCAmJiBvcC50ZW1wbGF0ZUtpbmQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgLy8gSWYgdGhlIGJpbmRpbmcgaGFzIGFuIGkxOG4gY29udGV4dCwgaXQgaXMgYW4gaTE4biBhdHRyaWJ1dGUsIGFuZCBzaG91bGQgaGF2ZSB0aGF0XG4gICAgICAgICAgICAgIC8vIGtpbmQgaW4gdGhlIGNvbnN0cyBhcnJheS5cbiAgICAgICAgICAgICAgYmluZGluZ0tpbmQgPSBpci5CaW5kaW5nS2luZC5JMThuO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcC5pc1N0cnVjdHVyYWxUZW1wbGF0ZUF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgICBiaW5kaW5nS2luZCA9IGlyLkJpbmRpbmdLaW5kLlRlbXBsYXRlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYmluZGluZ0tpbmQgPSBpci5CaW5kaW5nS2luZC5Qcm9wZXJ0eTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaXIuT3BMaXN0Lmluc2VydEJlZm9yZTxpci5DcmVhdGVPcD4oXG4gICAgICAgICAgICAgIC8vIERlbGliZXJhdGVseSBudWxsIGkxOG5NZXNzYWdlIHZhbHVlXG4gICAgICAgICAgICAgIGlyLmNyZWF0ZUV4dHJhY3RlZEF0dHJpYnV0ZU9wKFxuICAgICAgICAgICAgICAgIG9wLnRhcmdldCxcbiAgICAgICAgICAgICAgICBiaW5kaW5nS2luZCxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG9wLm5hbWUsXG4gICAgICAgICAgICAgICAgLyogZXhwcmVzc2lvbiAqLyBudWxsLFxuICAgICAgICAgICAgICAgIC8qIGkxOG5Db250ZXh0ICovIG51bGwsXG4gICAgICAgICAgICAgICAgLyogaTE4bk1lc3NhZ2UgKi8gbnVsbCxcbiAgICAgICAgICAgICAgICBvcC5zZWN1cml0eUNvbnRleHQsXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIGxvb2t1cEVsZW1lbnQoZWxlbWVudHMsIG9wLnRhcmdldCksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuVHdvV2F5UHJvcGVydHk6XG4gICAgICAgICAgaXIuT3BMaXN0Lmluc2VydEJlZm9yZTxpci5DcmVhdGVPcD4oXG4gICAgICAgICAgICBpci5jcmVhdGVFeHRyYWN0ZWRBdHRyaWJ1dGVPcChcbiAgICAgICAgICAgICAgb3AudGFyZ2V0LFxuICAgICAgICAgICAgICBpci5CaW5kaW5nS2luZC5Ud29XYXlQcm9wZXJ0eSxcbiAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgb3AubmFtZSxcbiAgICAgICAgICAgICAgLyogZXhwcmVzc2lvbiAqLyBudWxsLFxuICAgICAgICAgICAgICAvKiBpMThuQ29udGV4dCAqLyBudWxsLFxuICAgICAgICAgICAgICAvKiBpMThuTWVzc2FnZSAqLyBudWxsLFxuICAgICAgICAgICAgICBvcC5zZWN1cml0eUNvbnRleHQsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgbG9va3VwRWxlbWVudChlbGVtZW50cywgb3AudGFyZ2V0KSxcbiAgICAgICAgICApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5TdHlsZVByb3A6XG4gICAgICAgIGNhc2UgaXIuT3BLaW5kLkNsYXNzUHJvcDpcbiAgICAgICAgICAvLyBUT0RPOiBDYW4gc3R5bGUgb3IgY2xhc3MgYmluZGluZ3MgYmUgaTE4biBhdHRyaWJ1dGVzP1xuXG4gICAgICAgICAgLy8gVGhlIG9sZCBjb21waWxlciB0cmVhdGVkIGVtcHR5IHN0eWxlIGJpbmRpbmdzIGFzIHJlZ3VsYXIgYmluZGluZ3MgZm9yIHRoZSBwdXJwb3NlIG9mXG4gICAgICAgICAgLy8gZGlyZWN0aXZlIG1hdGNoaW5nLiBUaGF0IGJlaGF2aW9yIGlzIGluY29ycmVjdCwgYnV0IHdlIGVtdWxhdGUgaXQgaW4gY29tcGF0aWJpbGl0eVxuICAgICAgICAgIC8vIG1vZGUuXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgdW5pdC5qb2IuY29tcGF0aWJpbGl0eSA9PT0gaXIuQ29tcGF0aWJpbGl0eU1vZGUuVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlciAmJlxuICAgICAgICAgICAgb3AuZXhwcmVzc2lvbiBpbnN0YW5jZW9mIGlyLkVtcHR5RXhwclxuICAgICAgICAgICkge1xuICAgICAgICAgICAgaXIuT3BMaXN0Lmluc2VydEJlZm9yZTxpci5DcmVhdGVPcD4oXG4gICAgICAgICAgICAgIGlyLmNyZWF0ZUV4dHJhY3RlZEF0dHJpYnV0ZU9wKFxuICAgICAgICAgICAgICAgIG9wLnRhcmdldCxcbiAgICAgICAgICAgICAgICBpci5CaW5kaW5nS2luZC5Qcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG9wLm5hbWUsXG4gICAgICAgICAgICAgICAgLyogZXhwcmVzc2lvbiAqLyBudWxsLFxuICAgICAgICAgICAgICAgIC8qIGkxOG5Db250ZXh0ICovIG51bGwsXG4gICAgICAgICAgICAgICAgLyogaTE4bk1lc3NhZ2UgKi8gbnVsbCxcbiAgICAgICAgICAgICAgICBTZWN1cml0eUNvbnRleHQuU1RZTEUsXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIGxvb2t1cEVsZW1lbnQoZWxlbWVudHMsIG9wLnRhcmdldCksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBpci5PcEtpbmQuTGlzdGVuZXI6XG4gICAgICAgICAgaWYgKCFvcC5pc0FuaW1hdGlvbkxpc3RlbmVyKSB7XG4gICAgICAgICAgICBjb25zdCBleHRyYWN0ZWRBdHRyaWJ1dGVPcCA9IGlyLmNyZWF0ZUV4dHJhY3RlZEF0dHJpYnV0ZU9wKFxuICAgICAgICAgICAgICBvcC50YXJnZXQsXG4gICAgICAgICAgICAgIGlyLkJpbmRpbmdLaW5kLlByb3BlcnR5LFxuICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICBvcC5uYW1lLFxuICAgICAgICAgICAgICAvKiBleHByZXNzaW9uICovIG51bGwsXG4gICAgICAgICAgICAgIC8qIGkxOG5Db250ZXh0ICovIG51bGwsXG4gICAgICAgICAgICAgIC8qIGkxOG5NZXNzYWdlICovIG51bGwsXG4gICAgICAgICAgICAgIFNlY3VyaXR5Q29udGV4dC5OT05FLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChqb2Iua2luZCA9PT0gQ29tcGlsYXRpb25Kb2JLaW5kLkhvc3QpIHtcbiAgICAgICAgICAgICAgaWYgKGpvYi5jb21wYXRpYmlsaXR5KSB7XG4gICAgICAgICAgICAgICAgLy8gVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlciBkb2VzIG5vdCBleHRyYWN0IGxpc3RlbmVyIGJpbmRpbmdzIHRvIHRoZSBjb25zdCBhcnJheVxuICAgICAgICAgICAgICAgIC8vICh3aGljaCBpcyBob25lc3RseSBwcmV0dHkgaW5jb25zaXN0ZW50KS5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBUaGlzIGF0dHJpYnV0ZSB3aWxsIGFwcGx5IHRvIHRoZSBlbmNsb3NpbmcgaG9zdCBiaW5kaW5nIGNvbXBpbGF0aW9uIHVuaXQsIHNvIG9yZGVyXG4gICAgICAgICAgICAgIC8vIGRvZXNuJ3QgbWF0dGVyLlxuICAgICAgICAgICAgICB1bml0LmNyZWF0ZS5wdXNoKGV4dHJhY3RlZEF0dHJpYnV0ZU9wKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlyLk9wTGlzdC5pbnNlcnRCZWZvcmU8aXIuQ3JlYXRlT3A+KFxuICAgICAgICAgICAgICAgIGV4dHJhY3RlZEF0dHJpYnV0ZU9wLFxuICAgICAgICAgICAgICAgIGxvb2t1cEVsZW1lbnQoZWxlbWVudHMsIG9wLnRhcmdldCksXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGlyLk9wS2luZC5Ud29XYXlMaXN0ZW5lcjpcbiAgICAgICAgICAvLyBUd28td2F5IGxpc3RlbmVycyBhcmVuJ3Qgc3VwcG9ydGVkIGluIGhvc3QgYmluZGluZ3MuXG4gICAgICAgICAgaWYgKGpvYi5raW5kICE9PSBDb21waWxhdGlvbkpvYktpbmQuSG9zdCkge1xuICAgICAgICAgICAgY29uc3QgZXh0cmFjdGVkQXR0cmlidXRlT3AgPSBpci5jcmVhdGVFeHRyYWN0ZWRBdHRyaWJ1dGVPcChcbiAgICAgICAgICAgICAgb3AudGFyZ2V0LFxuICAgICAgICAgICAgICBpci5CaW5kaW5nS2luZC5Qcm9wZXJ0eSxcbiAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgb3AubmFtZSxcbiAgICAgICAgICAgICAgLyogZXhwcmVzc2lvbiAqLyBudWxsLFxuICAgICAgICAgICAgICAvKiBpMThuQ29udGV4dCAqLyBudWxsLFxuICAgICAgICAgICAgICAvKiBpMThuTWVzc2FnZSAqLyBudWxsLFxuICAgICAgICAgICAgICBTZWN1cml0eUNvbnRleHQuTk9ORSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpci5PcExpc3QuaW5zZXJ0QmVmb3JlPGlyLkNyZWF0ZU9wPihcbiAgICAgICAgICAgICAgZXh0cmFjdGVkQXR0cmlidXRlT3AsXG4gICAgICAgICAgICAgIGxvb2t1cEVsZW1lbnQoZWxlbWVudHMsIG9wLnRhcmdldCksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBMb29rcyB1cCBhbiBlbGVtZW50IGluIHRoZSBnaXZlbiBtYXAgYnkgeHJlZiBJRC5cbiAqL1xuZnVuY3Rpb24gbG9va3VwRWxlbWVudChcbiAgZWxlbWVudHM6IE1hcDxpci5YcmVmSWQsIGlyLkNvbnN1bWVzU2xvdE9wVHJhaXQgJiBpci5DcmVhdGVPcD4sXG4gIHhyZWY6IGlyLlhyZWZJZCxcbik6IGlyLkNvbnN1bWVzU2xvdE9wVHJhaXQgJiBpci5DcmVhdGVPcCB7XG4gIGNvbnN0IGVsID0gZWxlbWVudHMuZ2V0KHhyZWYpO1xuICBpZiAoZWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcignQWxsIGF0dHJpYnV0ZXMgc2hvdWxkIGhhdmUgYW4gZWxlbWVudC1saWtlIHRhcmdldC4nKTtcbiAgfVxuICByZXR1cm4gZWw7XG59XG5cbi8qKlxuICogRXh0cmFjdHMgYW4gYXR0cmlidXRlIGJpbmRpbmcuXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RBdHRyaWJ1dGVPcChcbiAgdW5pdDogQ29tcGlsYXRpb25Vbml0LFxuICBvcDogaXIuQXR0cmlidXRlT3AsXG4gIGVsZW1lbnRzOiBNYXA8aXIuWHJlZklkLCBpci5Db25zdW1lc1Nsb3RPcFRyYWl0ICYgaXIuQ3JlYXRlT3A+LFxuKSB7XG4gIGlmIChvcC5leHByZXNzaW9uIGluc3RhbmNlb2YgaXIuSW50ZXJwb2xhdGlvbikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBleHRyYWN0YWJsZSA9IG9wLmlzVGV4dEF0dHJpYnV0ZSB8fCBvcC5leHByZXNzaW9uLmlzQ29uc3RhbnQoKTtcbiAgaWYgKHVuaXQuam9iLmNvbXBhdGliaWxpdHkgPT09IGlyLkNvbXBhdGliaWxpdHlNb2RlLlRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIpIHtcbiAgICAvLyBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyIG9ubHkgZXh0cmFjdHMgdGV4dCBhdHRyaWJ1dGVzLiBJdCBkb2VzIG5vdCBleHRyYWN0IGF0dHJpaWJ1dGVcbiAgICAvLyBiaW5kaW5ncywgZXZlbiBpZiB0aGV5IGFyZSBjb25zdGFudHMuXG4gICAgZXh0cmFjdGFibGUgJiY9IG9wLmlzVGV4dEF0dHJpYnV0ZTtcbiAgfVxuXG4gIGlmIChleHRyYWN0YWJsZSkge1xuICAgIGNvbnN0IGV4dHJhY3RlZEF0dHJpYnV0ZU9wID0gaXIuY3JlYXRlRXh0cmFjdGVkQXR0cmlidXRlT3AoXG4gICAgICBvcC50YXJnZXQsXG4gICAgICBvcC5pc1N0cnVjdHVyYWxUZW1wbGF0ZUF0dHJpYnV0ZSA/IGlyLkJpbmRpbmdLaW5kLlRlbXBsYXRlIDogaXIuQmluZGluZ0tpbmQuQXR0cmlidXRlLFxuICAgICAgb3AubmFtZXNwYWNlLFxuICAgICAgb3AubmFtZSxcbiAgICAgIG9wLmV4cHJlc3Npb24sXG4gICAgICBvcC5pMThuQ29udGV4dCxcbiAgICAgIG9wLmkxOG5NZXNzYWdlLFxuICAgICAgb3Auc2VjdXJpdHlDb250ZXh0LFxuICAgICk7XG4gICAgaWYgKHVuaXQuam9iLmtpbmQgPT09IENvbXBpbGF0aW9uSm9iS2luZC5Ib3N0KSB7XG4gICAgICAvLyBUaGlzIGF0dHJpYnV0ZSB3aWxsIGFwcGx5IHRvIHRoZSBlbmNsb3NpbmcgaG9zdCBiaW5kaW5nIGNvbXBpbGF0aW9uIHVuaXQsIHNvIG9yZGVyIGRvZXNuJ3RcbiAgICAgIC8vIG1hdHRlci5cbiAgICAgIHVuaXQuY3JlYXRlLnB1c2goZXh0cmFjdGVkQXR0cmlidXRlT3ApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBvd25lck9wID0gbG9va3VwRWxlbWVudChlbGVtZW50cywgb3AudGFyZ2V0KTtcbiAgICAgIGlyLk9wTGlzdC5pbnNlcnRCZWZvcmU8aXIuQ3JlYXRlT3A+KGV4dHJhY3RlZEF0dHJpYnV0ZU9wLCBvd25lck9wKTtcbiAgICB9XG4gICAgaXIuT3BMaXN0LnJlbW92ZTxpci5VcGRhdGVPcD4ob3ApO1xuICB9XG59XG4iXX0=