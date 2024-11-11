/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SecurityContext } from '../../../../core';
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
/**
 * Parses string representation of a style and converts it into object literal.
 *
 * @param value string representation of style as used in the `style` attribute in HTML.
 *   Example: `color: red; height: auto`.
 * @returns An array of style property name and value pairs, e.g. `['color', 'red', 'height',
 * 'auto']`
 */
export function parse(value) {
    // we use a string array here instead of a string map
    // because a string-map is not guaranteed to retain the
    // order of the entries whereas a string array can be
    // constructed in a [key, value, key, value] format.
    const styles = [];
    let i = 0;
    let parenDepth = 0;
    let quote = 0 /* Char.QuoteNone */;
    let valueStart = 0;
    let propStart = 0;
    let currentProp = null;
    while (i < value.length) {
        const token = value.charCodeAt(i++);
        switch (token) {
            case 40 /* Char.OpenParen */:
                parenDepth++;
                break;
            case 41 /* Char.CloseParen */:
                parenDepth--;
                break;
            case 39 /* Char.QuoteSingle */:
                // valueStart needs to be there since prop values don't
                // have quotes in CSS
                if (quote === 0 /* Char.QuoteNone */) {
                    quote = 39 /* Char.QuoteSingle */;
                }
                else if (quote === 39 /* Char.QuoteSingle */ && value.charCodeAt(i - 1) !== 92 /* Char.BackSlash */) {
                    quote = 0 /* Char.QuoteNone */;
                }
                break;
            case 34 /* Char.QuoteDouble */:
                // same logic as above
                if (quote === 0 /* Char.QuoteNone */) {
                    quote = 34 /* Char.QuoteDouble */;
                }
                else if (quote === 34 /* Char.QuoteDouble */ && value.charCodeAt(i - 1) !== 92 /* Char.BackSlash */) {
                    quote = 0 /* Char.QuoteNone */;
                }
                break;
            case 58 /* Char.Colon */:
                if (!currentProp && parenDepth === 0 && quote === 0 /* Char.QuoteNone */) {
                    // TODO: Do not hyphenate CSS custom property names like: `--intentionallyCamelCase`
                    currentProp = hyphenate(value.substring(propStart, i - 1).trim());
                    valueStart = i;
                }
                break;
            case 59 /* Char.Semicolon */:
                if (currentProp && valueStart > 0 && parenDepth === 0 && quote === 0 /* Char.QuoteNone */) {
                    const styleVal = value.substring(valueStart, i - 1).trim();
                    styles.push(currentProp, styleVal);
                    propStart = i;
                    valueStart = 0;
                    currentProp = null;
                }
                break;
        }
    }
    if (currentProp && valueStart) {
        const styleVal = value.slice(valueStart).trim();
        styles.push(currentProp, styleVal);
    }
    return styles;
}
export function hyphenate(value) {
    return value
        .replace(/[a-z][A-Z]/g, (v) => {
        return v.charAt(0) + '-' + v.charAt(1);
    })
        .toLowerCase();
}
/**
 * Parses extracted style and class attributes into separate ExtractedAttributeOps per style or
 * class property.
 */
export function parseExtractedStyles(job) {
    const elements = new Map();
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (ir.isElementOrContainerOp(op)) {
                elements.set(op.xref, op);
            }
        }
    }
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind === ir.OpKind.ExtractedAttribute &&
                op.bindingKind === ir.BindingKind.Attribute &&
                ir.isStringLiteral(op.expression)) {
                const target = elements.get(op.target);
                if (target !== undefined &&
                    target.kind === ir.OpKind.Template &&
                    target.templateKind === ir.TemplateKind.Structural) {
                    // TemplateDefinitionBuilder will not apply class and style bindings to structural
                    // directives; instead, it will leave them as attributes.
                    // (It's not clear what that would mean, anyway -- classes and styles on a structural
                    // element should probably be a parse error.)
                    // TODO: We may be able to remove this once Template Pipeline is the default.
                    continue;
                }
                if (op.name === 'style') {
                    const parsedStyles = parse(op.expression.value);
                    for (let i = 0; i < parsedStyles.length - 1; i += 2) {
                        ir.OpList.insertBefore(ir.createExtractedAttributeOp(op.target, ir.BindingKind.StyleProperty, null, parsedStyles[i], o.literal(parsedStyles[i + 1]), null, null, SecurityContext.STYLE), op);
                    }
                    ir.OpList.remove(op);
                }
                else if (op.name === 'class') {
                    const parsedClasses = op.expression.value.trim().split(/\s+/g);
                    for (const parsedClass of parsedClasses) {
                        ir.OpList.insertBefore(ir.createExtractedAttributeOp(op.target, ir.BindingKind.ClassName, null, parsedClass, null, null, null, SecurityContext.NONE), op);
                    }
                    ir.OpList.remove(op);
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VfZXh0cmFjdGVkX3N0eWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3BhcnNlX2V4dHJhY3RlZF9zdHlsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sS0FBSyxDQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDbkQsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFrQi9COzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsS0FBSyxDQUFDLEtBQWE7SUFDakMscURBQXFEO0lBQ3JELHVEQUF1RDtJQUN2RCxxREFBcUQ7SUFDckQsb0RBQW9EO0lBQ3BELE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUU1QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDbkIsSUFBSSxLQUFLLHlCQUF1QixDQUFDO0lBQ2pDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztJQUNuQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDbEIsSUFBSSxXQUFXLEdBQWtCLElBQUksQ0FBQztJQUN0QyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDeEIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBUyxDQUFDO1FBQzVDLFFBQVEsS0FBSyxFQUFFLENBQUM7WUFDZDtnQkFDRSxVQUFVLEVBQUUsQ0FBQztnQkFDYixNQUFNO1lBQ1I7Z0JBQ0UsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsTUFBTTtZQUNSO2dCQUNFLHVEQUF1RDtnQkFDdkQscUJBQXFCO2dCQUNyQixJQUFJLEtBQUssMkJBQW1CLEVBQUUsQ0FBQztvQkFDN0IsS0FBSyw0QkFBbUIsQ0FBQztnQkFDM0IsQ0FBQztxQkFBTSxJQUFJLEtBQUssOEJBQXFCLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLDRCQUFtQixFQUFFLENBQUM7b0JBQ3BGLEtBQUsseUJBQWlCLENBQUM7Z0JBQ3pCLENBQUM7Z0JBQ0QsTUFBTTtZQUNSO2dCQUNFLHNCQUFzQjtnQkFDdEIsSUFBSSxLQUFLLDJCQUFtQixFQUFFLENBQUM7b0JBQzdCLEtBQUssNEJBQW1CLENBQUM7Z0JBQzNCLENBQUM7cUJBQU0sSUFBSSxLQUFLLDhCQUFxQixJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyw0QkFBbUIsRUFBRSxDQUFDO29CQUNwRixLQUFLLHlCQUFpQixDQUFDO2dCQUN6QixDQUFDO2dCQUNELE1BQU07WUFDUjtnQkFDRSxJQUFJLENBQUMsV0FBVyxJQUFJLFVBQVUsS0FBSyxDQUFDLElBQUksS0FBSywyQkFBbUIsRUFBRSxDQUFDO29CQUNqRSxvRkFBb0Y7b0JBQ3BGLFdBQVcsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7b0JBQ2xFLFVBQVUsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCLENBQUM7Z0JBQ0QsTUFBTTtZQUNSO2dCQUNFLElBQUksV0FBVyxJQUFJLFVBQVUsR0FBRyxDQUFDLElBQUksVUFBVSxLQUFLLENBQUMsSUFBSSxLQUFLLDJCQUFtQixFQUFFLENBQUM7b0JBQ2xGLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDM0QsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ25DLFNBQVMsR0FBRyxDQUFDLENBQUM7b0JBQ2QsVUFBVSxHQUFHLENBQUMsQ0FBQztvQkFDZixXQUFXLEdBQUcsSUFBSSxDQUFDO2dCQUNyQixDQUFDO2dCQUNELE1BQU07UUFDVixDQUFDO0lBQ0gsQ0FBQztJQUVELElBQUksV0FBVyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQzlCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxNQUFNLFVBQVUsU0FBUyxDQUFDLEtBQWE7SUFDckMsT0FBTyxLQUFLO1NBQ1QsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQzVCLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDLENBQUM7U0FDRCxXQUFXLEVBQUUsQ0FBQztBQUNuQixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLG9CQUFvQixDQUFDLEdBQW1CO0lBQ3RELE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO0lBRW5ELEtBQUssTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzdCLElBQUksRUFBRSxDQUFDLHNCQUFzQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM1QixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3QixJQUNFLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0I7Z0JBQ3hDLEVBQUUsQ0FBQyxXQUFXLEtBQUssRUFBRSxDQUFDLFdBQVcsQ0FBQyxTQUFTO2dCQUMzQyxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxVQUFXLENBQUMsRUFDbEMsQ0FBQztnQkFDRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUUsQ0FBQztnQkFFeEMsSUFDRSxNQUFNLEtBQUssU0FBUztvQkFDcEIsTUFBTSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVE7b0JBQ2xDLE1BQU0sQ0FBQyxZQUFZLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQ2xELENBQUM7b0JBQ0Qsa0ZBQWtGO29CQUNsRix5REFBeUQ7b0JBQ3pELHFGQUFxRjtvQkFDckYsNkNBQTZDO29CQUM3Qyw2RUFBNkU7b0JBQzdFLFNBQVM7Z0JBQ1gsQ0FBQztnQkFFRCxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUM7b0JBQ3hCLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNoRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO3dCQUNwRCxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FDcEIsRUFBRSxDQUFDLDBCQUEwQixDQUMzQixFQUFFLENBQUMsTUFBTSxFQUNULEVBQUUsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUM1QixJQUFJLEVBQ0osWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUNmLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUM5QixJQUFJLEVBQ0osSUFBSSxFQUNKLGVBQWUsQ0FBQyxLQUFLLENBQ3RCLEVBQ0QsRUFBRSxDQUNILENBQUM7b0JBQ0osQ0FBQztvQkFDRCxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBYyxFQUFFLENBQUMsQ0FBQztnQkFDcEMsQ0FBQztxQkFBTSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUM7b0JBQy9CLE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDL0QsS0FBSyxNQUFNLFdBQVcsSUFBSSxhQUFhLEVBQUUsQ0FBQzt3QkFDeEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQ3BCLEVBQUUsQ0FBQywwQkFBMEIsQ0FDM0IsRUFBRSxDQUFDLE1BQU0sRUFDVCxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFDeEIsSUFBSSxFQUNKLFdBQVcsRUFDWCxJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUksRUFDSixlQUFlLENBQUMsSUFBSSxDQUNyQixFQUNELEVBQUUsQ0FDSCxDQUFDO29CQUNKLENBQUM7b0JBQ0QsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQWMsRUFBRSxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1NlY3VyaXR5Q29udGV4dH0gZnJvbSAnLi4vLi4vLi4vLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uLy4uLy4uLy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcblxuaW1wb3J0IHR5cGUge0NvbXBpbGF0aW9uSm9ifSBmcm9tICcuLi9jb21waWxhdGlvbic7XG5cbi8vIEFueSBjaGFuZ2VzIGhlcmUgc2hvdWxkIGJlIHBvcnRlZCB0byB0aGUgQW5ndWxhciBEb21pbm8gZm9yay5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2RvbWluby9ibG9iL21haW4vbGliL3N0eWxlX3BhcnNlci5qc1xuXG5jb25zdCBlbnVtIENoYXIge1xuICBPcGVuUGFyZW4gPSA0MCxcbiAgQ2xvc2VQYXJlbiA9IDQxLFxuICBDb2xvbiA9IDU4LFxuICBTZW1pY29sb24gPSA1OSxcbiAgQmFja1NsYXNoID0gOTIsXG4gIFF1b3RlTm9uZSA9IDAsIC8vIGluZGljYXRpbmcgd2UgYXJlIG5vdCBpbnNpZGUgYSBxdW90ZVxuICBRdW90ZURvdWJsZSA9IDM0LFxuICBRdW90ZVNpbmdsZSA9IDM5LFxufVxuXG4vKipcbiAqIFBhcnNlcyBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBzdHlsZSBhbmQgY29udmVydHMgaXQgaW50byBvYmplY3QgbGl0ZXJhbC5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHN0eWxlIGFzIHVzZWQgaW4gdGhlIGBzdHlsZWAgYXR0cmlidXRlIGluIEhUTUwuXG4gKiAgIEV4YW1wbGU6IGBjb2xvcjogcmVkOyBoZWlnaHQ6IGF1dG9gLlxuICogQHJldHVybnMgQW4gYXJyYXkgb2Ygc3R5bGUgcHJvcGVydHkgbmFtZSBhbmQgdmFsdWUgcGFpcnMsIGUuZy4gYFsnY29sb3InLCAncmVkJywgJ2hlaWdodCcsXG4gKiAnYXV0byddYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UodmFsdWU6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgLy8gd2UgdXNlIGEgc3RyaW5nIGFycmF5IGhlcmUgaW5zdGVhZCBvZiBhIHN0cmluZyBtYXBcbiAgLy8gYmVjYXVzZSBhIHN0cmluZy1tYXAgaXMgbm90IGd1YXJhbnRlZWQgdG8gcmV0YWluIHRoZVxuICAvLyBvcmRlciBvZiB0aGUgZW50cmllcyB3aGVyZWFzIGEgc3RyaW5nIGFycmF5IGNhbiBiZVxuICAvLyBjb25zdHJ1Y3RlZCBpbiBhIFtrZXksIHZhbHVlLCBrZXksIHZhbHVlXSBmb3JtYXQuXG4gIGNvbnN0IHN0eWxlczogc3RyaW5nW10gPSBbXTtcblxuICBsZXQgaSA9IDA7XG4gIGxldCBwYXJlbkRlcHRoID0gMDtcbiAgbGV0IHF1b3RlOiBDaGFyID0gQ2hhci5RdW90ZU5vbmU7XG4gIGxldCB2YWx1ZVN0YXJ0ID0gMDtcbiAgbGV0IHByb3BTdGFydCA9IDA7XG4gIGxldCBjdXJyZW50UHJvcDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIHdoaWxlIChpIDwgdmFsdWUubGVuZ3RoKSB7XG4gICAgY29uc3QgdG9rZW4gPSB2YWx1ZS5jaGFyQ29kZUF0KGkrKykgYXMgQ2hhcjtcbiAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICBjYXNlIENoYXIuT3BlblBhcmVuOlxuICAgICAgICBwYXJlbkRlcHRoKys7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDaGFyLkNsb3NlUGFyZW46XG4gICAgICAgIHBhcmVuRGVwdGgtLTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENoYXIuUXVvdGVTaW5nbGU6XG4gICAgICAgIC8vIHZhbHVlU3RhcnQgbmVlZHMgdG8gYmUgdGhlcmUgc2luY2UgcHJvcCB2YWx1ZXMgZG9uJ3RcbiAgICAgICAgLy8gaGF2ZSBxdW90ZXMgaW4gQ1NTXG4gICAgICAgIGlmIChxdW90ZSA9PT0gQ2hhci5RdW90ZU5vbmUpIHtcbiAgICAgICAgICBxdW90ZSA9IENoYXIuUXVvdGVTaW5nbGU7XG4gICAgICAgIH0gZWxzZSBpZiAocXVvdGUgPT09IENoYXIuUXVvdGVTaW5nbGUgJiYgdmFsdWUuY2hhckNvZGVBdChpIC0gMSkgIT09IENoYXIuQmFja1NsYXNoKSB7XG4gICAgICAgICAgcXVvdGUgPSBDaGFyLlF1b3RlTm9uZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ2hhci5RdW90ZURvdWJsZTpcbiAgICAgICAgLy8gc2FtZSBsb2dpYyBhcyBhYm92ZVxuICAgICAgICBpZiAocXVvdGUgPT09IENoYXIuUXVvdGVOb25lKSB7XG4gICAgICAgICAgcXVvdGUgPSBDaGFyLlF1b3RlRG91YmxlO1xuICAgICAgICB9IGVsc2UgaWYgKHF1b3RlID09PSBDaGFyLlF1b3RlRG91YmxlICYmIHZhbHVlLmNoYXJDb2RlQXQoaSAtIDEpICE9PSBDaGFyLkJhY2tTbGFzaCkge1xuICAgICAgICAgIHF1b3RlID0gQ2hhci5RdW90ZU5vbmU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENoYXIuQ29sb246XG4gICAgICAgIGlmICghY3VycmVudFByb3AgJiYgcGFyZW5EZXB0aCA9PT0gMCAmJiBxdW90ZSA9PT0gQ2hhci5RdW90ZU5vbmUpIHtcbiAgICAgICAgICAvLyBUT0RPOiBEbyBub3QgaHlwaGVuYXRlIENTUyBjdXN0b20gcHJvcGVydHkgbmFtZXMgbGlrZTogYC0taW50ZW50aW9uYWxseUNhbWVsQ2FzZWBcbiAgICAgICAgICBjdXJyZW50UHJvcCA9IGh5cGhlbmF0ZSh2YWx1ZS5zdWJzdHJpbmcocHJvcFN0YXJ0LCBpIC0gMSkudHJpbSgpKTtcbiAgICAgICAgICB2YWx1ZVN0YXJ0ID0gaTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ2hhci5TZW1pY29sb246XG4gICAgICAgIGlmIChjdXJyZW50UHJvcCAmJiB2YWx1ZVN0YXJ0ID4gMCAmJiBwYXJlbkRlcHRoID09PSAwICYmIHF1b3RlID09PSBDaGFyLlF1b3RlTm9uZSkge1xuICAgICAgICAgIGNvbnN0IHN0eWxlVmFsID0gdmFsdWUuc3Vic3RyaW5nKHZhbHVlU3RhcnQsIGkgLSAxKS50cmltKCk7XG4gICAgICAgICAgc3R5bGVzLnB1c2goY3VycmVudFByb3AsIHN0eWxlVmFsKTtcbiAgICAgICAgICBwcm9wU3RhcnQgPSBpO1xuICAgICAgICAgIHZhbHVlU3RhcnQgPSAwO1xuICAgICAgICAgIGN1cnJlbnRQcm9wID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAoY3VycmVudFByb3AgJiYgdmFsdWVTdGFydCkge1xuICAgIGNvbnN0IHN0eWxlVmFsID0gdmFsdWUuc2xpY2UodmFsdWVTdGFydCkudHJpbSgpO1xuICAgIHN0eWxlcy5wdXNoKGN1cnJlbnRQcm9wLCBzdHlsZVZhbCk7XG4gIH1cblxuICByZXR1cm4gc3R5bGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHlwaGVuYXRlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gdmFsdWVcbiAgICAucmVwbGFjZSgvW2Etel1bQS1aXS9nLCAodikgPT4ge1xuICAgICAgcmV0dXJuIHYuY2hhckF0KDApICsgJy0nICsgdi5jaGFyQXQoMSk7XG4gICAgfSlcbiAgICAudG9Mb3dlckNhc2UoKTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgZXh0cmFjdGVkIHN0eWxlIGFuZCBjbGFzcyBhdHRyaWJ1dGVzIGludG8gc2VwYXJhdGUgRXh0cmFjdGVkQXR0cmlidXRlT3BzIHBlciBzdHlsZSBvclxuICogY2xhc3MgcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV4dHJhY3RlZFN0eWxlcyhqb2I6IENvbXBpbGF0aW9uSm9iKSB7XG4gIGNvbnN0IGVsZW1lbnRzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkNyZWF0ZU9wPigpO1xuXG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAoaXIuaXNFbGVtZW50T3JDb250YWluZXJPcChvcCkpIHtcbiAgICAgICAgZWxlbWVudHMuc2V0KG9wLnhyZWYsIG9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKGNvbnN0IHVuaXQgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB1bml0LmNyZWF0ZSkge1xuICAgICAgaWYgKFxuICAgICAgICBvcC5raW5kID09PSBpci5PcEtpbmQuRXh0cmFjdGVkQXR0cmlidXRlICYmXG4gICAgICAgIG9wLmJpbmRpbmdLaW5kID09PSBpci5CaW5kaW5nS2luZC5BdHRyaWJ1dGUgJiZcbiAgICAgICAgaXIuaXNTdHJpbmdMaXRlcmFsKG9wLmV4cHJlc3Npb24hKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGVsZW1lbnRzLmdldChvcC50YXJnZXQpITtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgdGFyZ2V0ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICB0YXJnZXQua2luZCA9PT0gaXIuT3BLaW5kLlRlbXBsYXRlICYmXG4gICAgICAgICAgdGFyZ2V0LnRlbXBsYXRlS2luZCA9PT0gaXIuVGVtcGxhdGVLaW5kLlN0cnVjdHVyYWxcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gVGVtcGxhdGVEZWZpbml0aW9uQnVpbGRlciB3aWxsIG5vdCBhcHBseSBjbGFzcyBhbmQgc3R5bGUgYmluZGluZ3MgdG8gc3RydWN0dXJhbFxuICAgICAgICAgIC8vIGRpcmVjdGl2ZXM7IGluc3RlYWQsIGl0IHdpbGwgbGVhdmUgdGhlbSBhcyBhdHRyaWJ1dGVzLlxuICAgICAgICAgIC8vIChJdCdzIG5vdCBjbGVhciB3aGF0IHRoYXQgd291bGQgbWVhbiwgYW55d2F5IC0tIGNsYXNzZXMgYW5kIHN0eWxlcyBvbiBhIHN0cnVjdHVyYWxcbiAgICAgICAgICAvLyBlbGVtZW50IHNob3VsZCBwcm9iYWJseSBiZSBhIHBhcnNlIGVycm9yLilcbiAgICAgICAgICAvLyBUT0RPOiBXZSBtYXkgYmUgYWJsZSB0byByZW1vdmUgdGhpcyBvbmNlIFRlbXBsYXRlIFBpcGVsaW5lIGlzIHRoZSBkZWZhdWx0LlxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wLm5hbWUgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICBjb25zdCBwYXJzZWRTdHlsZXMgPSBwYXJzZShvcC5leHByZXNzaW9uLnZhbHVlKTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnNlZFN0eWxlcy5sZW5ndGggLSAxOyBpICs9IDIpIHtcbiAgICAgICAgICAgIGlyLk9wTGlzdC5pbnNlcnRCZWZvcmU8aXIuQ3JlYXRlT3A+KFxuICAgICAgICAgICAgICBpci5jcmVhdGVFeHRyYWN0ZWRBdHRyaWJ1dGVPcChcbiAgICAgICAgICAgICAgICBvcC50YXJnZXQsXG4gICAgICAgICAgICAgICAgaXIuQmluZGluZ0tpbmQuU3R5bGVQcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIHBhcnNlZFN0eWxlc1tpXSxcbiAgICAgICAgICAgICAgICBvLmxpdGVyYWwocGFyc2VkU3R5bGVzW2kgKyAxXSksXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIFNlY3VyaXR5Q29udGV4dC5TVFlMRSxcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgb3AsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpci5PcExpc3QucmVtb3ZlPGlyLkNyZWF0ZU9wPihvcCk7XG4gICAgICAgIH0gZWxzZSBpZiAob3AubmFtZSA9PT0gJ2NsYXNzJykge1xuICAgICAgICAgIGNvbnN0IHBhcnNlZENsYXNzZXMgPSBvcC5leHByZXNzaW9uLnZhbHVlLnRyaW0oKS5zcGxpdCgvXFxzKy9nKTtcbiAgICAgICAgICBmb3IgKGNvbnN0IHBhcnNlZENsYXNzIG9mIHBhcnNlZENsYXNzZXMpIHtcbiAgICAgICAgICAgIGlyLk9wTGlzdC5pbnNlcnRCZWZvcmU8aXIuQ3JlYXRlT3A+KFxuICAgICAgICAgICAgICBpci5jcmVhdGVFeHRyYWN0ZWRBdHRyaWJ1dGVPcChcbiAgICAgICAgICAgICAgICBvcC50YXJnZXQsXG4gICAgICAgICAgICAgICAgaXIuQmluZGluZ0tpbmQuQ2xhc3NOYW1lLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgcGFyc2VkQ2xhc3MsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgU2VjdXJpdHlDb250ZXh0Lk5PTkUsXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgIG9wLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaXIuT3BMaXN0LnJlbW92ZTxpci5DcmVhdGVPcD4ob3ApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=