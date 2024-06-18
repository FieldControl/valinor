/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VfZXh0cmFjdGVkX3N0eWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL3BhcnNlX2V4dHJhY3RlZF9zdHlsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sS0FBSyxDQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDbkQsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFrQi9COzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsS0FBSyxDQUFDLEtBQWE7SUFDakMscURBQXFEO0lBQ3JELHVEQUF1RDtJQUN2RCxxREFBcUQ7SUFDckQsb0RBQW9EO0lBQ3BELE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUU1QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDbkIsSUFBSSxLQUFLLHlCQUF1QixDQUFDO0lBQ2pDLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztJQUNuQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7SUFDbEIsSUFBSSxXQUFXLEdBQWtCLElBQUksQ0FBQztJQUN0QyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDeEIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBUyxDQUFDO1FBQzVDLFFBQVEsS0FBSyxFQUFFLENBQUM7WUFDZDtnQkFDRSxVQUFVLEVBQUUsQ0FBQztnQkFDYixNQUFNO1lBQ1I7Z0JBQ0UsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsTUFBTTtZQUNSO2dCQUNFLHVEQUF1RDtnQkFDdkQscUJBQXFCO2dCQUNyQixJ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LENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUM5QixJQUFJLEVBQ0osSUFBSSxFQUNKLGVBQWUsQ0FBQyxLQUFLLENBQ3RCLEVBQ0QsRUFBRSxDQUNILENBQUM7b0JBQ0osQ0FBQztvQkFDRCxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBYyxFQUFFLENBQUMsQ0FBQztnQkFDcEMsQ0FBQztxQkFBTSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUM7b0JBQy9CLE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDL0QsS0FBSyxNQUFNLFdBQVcsSUFBSSxhQUFhLEVBQUUsQ0FBQzt3QkFDeEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQ3BCLEVBQUUsQ0FBQywwQkFBMEIsQ0FDM0IsRUFBRSxDQUFDLE1BQU0sRUFDVCxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFDeEIsSUFBSSxFQUNKLFdBQVcsRUFDWCxJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUksRUFDSixlQUFlLENBQUMsSUFBSSxDQUNyQixFQUNELEVBQUUsQ0FDSCxDQUFDO29CQUNKLENBQUM7b0JBQ0QsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQWMsRUFBRSxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U2VjdXJpdHlDb250ZXh0fSBmcm9tICcuLi8uLi8uLi8uLi9jb3JlJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuXG5pbXBvcnQgdHlwZSB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLy8gQW55IGNoYW5nZXMgaGVyZSBzaG91bGQgYmUgcG9ydGVkIHRvIHRoZSBBbmd1bGFyIERvbWlubyBmb3JrLlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvZG9taW5vL2Jsb2IvbWFpbi9saWIvc3R5bGVfcGFyc2VyLmpzXG5cbmNvbnN0IGVudW0gQ2hhciB7XG4gIE9wZW5QYXJlbiA9IDQwLFxuICBDbG9zZVBhcmVuID0gNDEsXG4gIENvbG9uID0gNTgsXG4gIFNlbWljb2xvbiA9IDU5LFxuICBCYWNrU2xhc2ggPSA5MixcbiAgUXVvdGVOb25lID0gMCwgLy8gaW5kaWNhdGluZyB3ZSBhcmUgbm90IGluc2lkZSBhIHF1b3RlXG4gIFF1b3RlRG91YmxlID0gMzQsXG4gIFF1b3RlU2luZ2xlID0gMzksXG59XG5cbi8qKlxuICogUGFyc2VzIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHN0eWxlIGFuZCBjb252ZXJ0cyBpdCBpbnRvIG9iamVjdCBsaXRlcmFsLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2Ygc3R5bGUgYXMgdXNlZCBpbiB0aGUgYHN0eWxlYCBhdHRyaWJ1dGUgaW4gSFRNTC5cbiAqICAgRXhhbXBsZTogYGNvbG9yOiByZWQ7IGhlaWdodDogYXV0b2AuXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBzdHlsZSBwcm9wZXJ0eSBuYW1lIGFuZCB2YWx1ZSBwYWlycywgZS5nLiBgWydjb2xvcicsICdyZWQnLCAnaGVpZ2h0JyxcbiAqICdhdXRvJ11gXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICAvLyB3ZSB1c2UgYSBzdHJpbmcgYXJyYXkgaGVyZSBpbnN0ZWFkIG9mIGEgc3RyaW5nIG1hcFxuICAvLyBiZWNhdXNlIGEgc3RyaW5nLW1hcCBpcyBub3QgZ3VhcmFudGVlZCB0byByZXRhaW4gdGhlXG4gIC8vIG9yZGVyIG9mIHRoZSBlbnRyaWVzIHdoZXJlYXMgYSBzdHJpbmcgYXJyYXkgY2FuIGJlXG4gIC8vIGNvbnN0cnVjdGVkIGluIGEgW2tleSwgdmFsdWUsIGtleSwgdmFsdWVdIGZvcm1hdC5cbiAgY29uc3Qgc3R5bGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIGxldCBpID0gMDtcbiAgbGV0IHBhcmVuRGVwdGggPSAwO1xuICBsZXQgcXVvdGU6IENoYXIgPSBDaGFyLlF1b3RlTm9uZTtcbiAgbGV0IHZhbHVlU3RhcnQgPSAwO1xuICBsZXQgcHJvcFN0YXJ0ID0gMDtcbiAgbGV0IGN1cnJlbnRQcm9wOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcbiAgd2hpbGUgKGkgPCB2YWx1ZS5sZW5ndGgpIHtcbiAgICBjb25zdCB0b2tlbiA9IHZhbHVlLmNoYXJDb2RlQXQoaSsrKSBhcyBDaGFyO1xuICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgIGNhc2UgQ2hhci5PcGVuUGFyZW46XG4gICAgICAgIHBhcmVuRGVwdGgrKztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENoYXIuQ2xvc2VQYXJlbjpcbiAgICAgICAgcGFyZW5EZXB0aC0tO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ2hhci5RdW90ZVNpbmdsZTpcbiAgICAgICAgLy8gdmFsdWVTdGFydCBuZWVkcyB0byBiZSB0aGVyZSBzaW5jZSBwcm9wIHZhbHVlcyBkb24ndFxuICAgICAgICAvLyBoYXZlIHF1b3RlcyBpbiBDU1NcbiAgICAgICAgaWYgKHF1b3RlID09PSBDaGFyLlF1b3RlTm9uZSkge1xuICAgICAgICAgIHF1b3RlID0gQ2hhci5RdW90ZVNpbmdsZTtcbiAgICAgICAgfSBlbHNlIGlmIChxdW90ZSA9PT0gQ2hhci5RdW90ZVNpbmdsZSAmJiB2YWx1ZS5jaGFyQ29kZUF0KGkgLSAxKSAhPT0gQ2hhci5CYWNrU2xhc2gpIHtcbiAgICAgICAgICBxdW90ZSA9IENoYXIuUXVvdGVOb25lO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDaGFyLlF1b3RlRG91YmxlOlxuICAgICAgICAvLyBzYW1lIGxvZ2ljIGFzIGFib3ZlXG4gICAgICAgIGlmIChxdW90ZSA9PT0gQ2hhci5RdW90ZU5vbmUpIHtcbiAgICAgICAgICBxdW90ZSA9IENoYXIuUXVvdGVEb3VibGU7XG4gICAgICAgIH0gZWxzZSBpZiAocXVvdGUgPT09IENoYXIuUXVvdGVEb3VibGUgJiYgdmFsdWUuY2hhckNvZGVBdChpIC0gMSkgIT09IENoYXIuQmFja1NsYXNoKSB7XG4gICAgICAgICAgcXVvdGUgPSBDaGFyLlF1b3RlTm9uZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ2hhci5Db2xvbjpcbiAgICAgICAgaWYgKCFjdXJyZW50UHJvcCAmJiBwYXJlbkRlcHRoID09PSAwICYmIHF1b3RlID09PSBDaGFyLlF1b3RlTm9uZSkge1xuICAgICAgICAgIC8vIFRPRE86IERvIG5vdCBoeXBoZW5hdGUgQ1NTIGN1c3RvbSBwcm9wZXJ0eSBuYW1lcyBsaWtlOiBgLS1pbnRlbnRpb25hbGx5Q2FtZWxDYXNlYFxuICAgICAgICAgIGN1cnJlbnRQcm9wID0gaHlwaGVuYXRlKHZhbHVlLnN1YnN0cmluZyhwcm9wU3RhcnQsIGkgLSAxKS50cmltKCkpO1xuICAgICAgICAgIHZhbHVlU3RhcnQgPSBpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBDaGFyLlNlbWljb2xvbjpcbiAgICAgICAgaWYgKGN1cnJlbnRQcm9wICYmIHZhbHVlU3RhcnQgPiAwICYmIHBhcmVuRGVwdGggPT09IDAgJiYgcXVvdGUgPT09IENoYXIuUXVvdGVOb25lKSB7XG4gICAgICAgICAgY29uc3Qgc3R5bGVWYWwgPSB2YWx1ZS5zdWJzdHJpbmcodmFsdWVTdGFydCwgaSAtIDEpLnRyaW0oKTtcbiAgICAgICAgICBzdHlsZXMucHVzaChjdXJyZW50UHJvcCwgc3R5bGVWYWwpO1xuICAgICAgICAgIHByb3BTdGFydCA9IGk7XG4gICAgICAgICAgdmFsdWVTdGFydCA9IDA7XG4gICAgICAgICAgY3VycmVudFByb3AgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjdXJyZW50UHJvcCAmJiB2YWx1ZVN0YXJ0KSB7XG4gICAgY29uc3Qgc3R5bGVWYWwgPSB2YWx1ZS5zbGljZSh2YWx1ZVN0YXJ0KS50cmltKCk7XG4gICAgc3R5bGVzLnB1c2goY3VycmVudFByb3AsIHN0eWxlVmFsKTtcbiAgfVxuXG4gIHJldHVybiBzdHlsZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoeXBoZW5hdGUodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB2YWx1ZVxuICAgIC5yZXBsYWNlKC9bYS16XVtBLVpdL2csICh2KSA9PiB7XG4gICAgICByZXR1cm4gdi5jaGFyQXQoMCkgKyAnLScgKyB2LmNoYXJBdCgxKTtcbiAgICB9KVxuICAgIC50b0xvd2VyQ2FzZSgpO1xufVxuXG4vKipcbiAqIFBhcnNlcyBleHRyYWN0ZWQgc3R5bGUgYW5kIGNsYXNzIGF0dHJpYnV0ZXMgaW50byBzZXBhcmF0ZSBFeHRyYWN0ZWRBdHRyaWJ1dGVPcHMgcGVyIHN0eWxlIG9yXG4gKiBjbGFzcyBwcm9wZXJ0eS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXh0cmFjdGVkU3R5bGVzKGpvYjogQ29tcGlsYXRpb25Kb2IpIHtcbiAgY29uc3QgZWxlbWVudHMgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuQ3JlYXRlT3A+KCk7XG5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChpci5pc0VsZW1lbnRPckNvbnRhaW5lck9wKG9wKSkge1xuICAgICAgICBlbGVtZW50cy5zZXQob3AueHJlZiwgb3ApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAoXG4gICAgICAgIG9wLmtpbmQgPT09IGlyLk9wS2luZC5FeHRyYWN0ZWRBdHRyaWJ1dGUgJiZcbiAgICAgICAgb3AuYmluZGluZ0tpbmQgPT09IGlyLkJpbmRpbmdLaW5kLkF0dHJpYnV0ZSAmJlxuICAgICAgICBpci5pc1N0cmluZ0xpdGVyYWwob3AuZXhwcmVzc2lvbiEpXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZWxlbWVudHMuZ2V0KG9wLnRhcmdldCkhO1xuXG4gICAgICAgIGlmIChcbiAgICAgICAgICB0YXJnZXQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgIHRhcmdldC5raW5kID09PSBpci5PcEtpbmQuVGVtcGxhdGUgJiZcbiAgICAgICAgICB0YXJnZXQudGVtcGxhdGVLaW5kID09PSBpci5UZW1wbGF0ZUtpbmQuU3RydWN0dXJhbFxuICAgICAgICApIHtcbiAgICAgICAgICAvLyBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyIHdpbGwgbm90IGFwcGx5IGNsYXNzIGFuZCBzdHlsZSBiaW5kaW5ncyB0byBzdHJ1Y3R1cmFsXG4gICAgICAgICAgLy8gZGlyZWN0aXZlczsgaW5zdGVhZCwgaXQgd2lsbCBsZWF2ZSB0aGVtIGFzIGF0dHJpYnV0ZXMuXG4gICAgICAgICAgLy8gKEl0J3Mgbm90IGNsZWFyIHdoYXQgdGhhdCB3b3VsZCBtZWFuLCBhbnl3YXkgLS0gY2xhc3NlcyBhbmQgc3R5bGVzIG9uIGEgc3RydWN0dXJhbFxuICAgICAgICAgIC8vIGVsZW1lbnQgc2hvdWxkIHByb2JhYmx5IGJlIGEgcGFyc2UgZXJyb3IuKVxuICAgICAgICAgIC8vIFRPRE86IFdlIG1heSBiZSBhYmxlIHRvIHJlbW92ZSB0aGlzIG9uY2UgVGVtcGxhdGUgUGlwZWxpbmUgaXMgdGhlIGRlZmF1bHQuXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3AubmFtZSA9PT0gJ3N0eWxlJykge1xuICAgICAgICAgIGNvbnN0IHBhcnNlZFN0eWxlcyA9IHBhcnNlKG9wLmV4cHJlc3Npb24udmFsdWUpO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFyc2VkU3R5bGVzLmxlbmd0aCAtIDE7IGkgKz0gMikge1xuICAgICAgICAgICAgaXIuT3BMaXN0Lmluc2VydEJlZm9yZTxpci5DcmVhdGVPcD4oXG4gICAgICAgICAgICAgIGlyLmNyZWF0ZUV4dHJhY3RlZEF0dHJpYnV0ZU9wKFxuICAgICAgICAgICAgICAgIG9wLnRhcmdldCxcbiAgICAgICAgICAgICAgICBpci5CaW5kaW5nS2luZC5TdHlsZVByb3BlcnR5LFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgcGFyc2VkU3R5bGVzW2ldLFxuICAgICAgICAgICAgICAgIG8ubGl0ZXJhbChwYXJzZWRTdHlsZXNbaSArIDFdKSxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgU2VjdXJpdHlDb250ZXh0LlNUWUxFLFxuICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICBvcCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlyLk9wTGlzdC5yZW1vdmU8aXIuQ3JlYXRlT3A+KG9wKTtcbiAgICAgICAgfSBlbHNlIGlmIChvcC5uYW1lID09PSAnY2xhc3MnKSB7XG4gICAgICAgICAgY29uc3QgcGFyc2VkQ2xhc3NlcyA9IG9wLmV4cHJlc3Npb24udmFsdWUudHJpbSgpLnNwbGl0KC9cXHMrL2cpO1xuICAgICAgICAgIGZvciAoY29uc3QgcGFyc2VkQ2xhc3Mgb2YgcGFyc2VkQ2xhc3Nlcykge1xuICAgICAgICAgICAgaXIuT3BMaXN0Lmluc2VydEJlZm9yZTxpci5DcmVhdGVPcD4oXG4gICAgICAgICAgICAgIGlyLmNyZWF0ZUV4dHJhY3RlZEF0dHJpYnV0ZU9wKFxuICAgICAgICAgICAgICAgIG9wLnRhcmdldCxcbiAgICAgICAgICAgICAgICBpci5CaW5kaW5nS2luZC5DbGFzc05hbWUsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBwYXJzZWRDbGFzcyxcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBTZWN1cml0eUNvbnRleHQuTk9ORSxcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgb3AsXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpci5PcExpc3QucmVtb3ZlPGlyLkNyZWF0ZU9wPihvcCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==