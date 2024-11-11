/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Adds apply operations after i18n expressions.
 */
export function applyI18nExpressions(job) {
    const i18nContexts = new Map();
    for (const unit of job.units) {
        for (const op of unit.create) {
            if (op.kind === ir.OpKind.I18nContext) {
                i18nContexts.set(op.xref, op);
            }
        }
    }
    for (const unit of job.units) {
        for (const op of unit.update) {
            // Only add apply after expressions that are not followed by more expressions.
            if (op.kind === ir.OpKind.I18nExpression && needsApplication(i18nContexts, op)) {
                // TODO: what should be the source span for the apply op?
                ir.OpList.insertAfter(ir.createI18nApplyOp(op.i18nOwner, op.handle, null), op);
            }
        }
    }
}
/**
 * Checks whether the given expression op needs to be followed with an apply op.
 */
function needsApplication(i18nContexts, op) {
    // If the next op is not another expression, we need to apply.
    if (op.next?.kind !== ir.OpKind.I18nExpression) {
        return true;
    }
    const context = i18nContexts.get(op.context);
    const nextContext = i18nContexts.get(op.next.context);
    if (context === undefined) {
        throw new Error("AssertionError: expected an I18nContextOp to exist for the I18nExpressionOp's context");
    }
    if (nextContext === undefined) {
        throw new Error("AssertionError: expected an I18nContextOp to exist for the next I18nExpressionOp's context");
    }
    // If the next op is an expression targeting a different i18n block (or different element, in the
    // case of i18n attributes), we need to apply.
    // First, handle the case of i18n blocks.
    if (context.i18nBlock !== null) {
        // This is a block context. Compare the blocks.
        if (context.i18nBlock !== nextContext.i18nBlock) {
            return true;
        }
        return false;
    }
    // Second, handle the case of i18n attributes.
    if (op.i18nOwner !== op.next.i18nOwner) {
        return true;
    }
    return false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbHlfaTE4bl9leHByZXNzaW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL2FwcGx5X2kxOG5fZXhwcmVzc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7O0dBRUc7QUFDSCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsR0FBbUI7SUFDdEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQStCLENBQUM7SUFDNUQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3RDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNoQyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3Qiw4RUFBOEU7WUFDOUUsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxJQUFJLGdCQUFnQixDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUMvRSx5REFBeUQ7Z0JBQ3pELEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUNuQixFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUssQ0FBQyxFQUNwRCxFQUFFLENBQ0gsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsWUFBOEMsRUFBRSxFQUF1QjtJQUMvRiw4REFBOEQ7SUFDOUQsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQy9DLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUV0RCxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUMxQixNQUFNLElBQUksS0FBSyxDQUNiLHVGQUF1RixDQUN4RixDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzlCLE1BQU0sSUFBSSxLQUFLLENBQ2IsNEZBQTRGLENBQzdGLENBQUM7SUFDSixDQUFDO0lBRUQsaUdBQWlHO0lBQ2pHLDhDQUE4QztJQUU5Qyx5Q0FBeUM7SUFDekMsSUFBSSxPQUFPLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQy9CLCtDQUErQztRQUMvQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELDhDQUE4QztJQUM5QyxJQUFJLEVBQUUsQ0FBQyxTQUFTLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN2QyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGlyIGZyb20gJy4uLy4uL2lyJztcbmltcG9ydCB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuLyoqXG4gKiBBZGRzIGFwcGx5IG9wZXJhdGlvbnMgYWZ0ZXIgaTE4biBleHByZXNzaW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5STE4bkV4cHJlc3Npb25zKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgY29uc3QgaTE4bkNvbnRleHRzID0gbmV3IE1hcDxpci5YcmVmSWQsIGlyLkkxOG5Db250ZXh0T3A+KCk7XG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQuY3JlYXRlKSB7XG4gICAgICBpZiAob3Aua2luZCA9PT0gaXIuT3BLaW5kLkkxOG5Db250ZXh0KSB7XG4gICAgICAgIGkxOG5Db250ZXh0cy5zZXQob3AueHJlZiwgb3ApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgdW5pdCBvZiBqb2IudW5pdHMpIHtcbiAgICBmb3IgKGNvbnN0IG9wIG9mIHVuaXQudXBkYXRlKSB7XG4gICAgICAvLyBPbmx5IGFkZCBhcHBseSBhZnRlciBleHByZXNzaW9ucyB0aGF0IGFyZSBub3QgZm9sbG93ZWQgYnkgbW9yZSBleHByZXNzaW9ucy5cbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuSTE4bkV4cHJlc3Npb24gJiYgbmVlZHNBcHBsaWNhdGlvbihpMThuQ29udGV4dHMsIG9wKSkge1xuICAgICAgICAvLyBUT0RPOiB3aGF0IHNob3VsZCBiZSB0aGUgc291cmNlIHNwYW4gZm9yIHRoZSBhcHBseSBvcD9cbiAgICAgICAgaXIuT3BMaXN0Lmluc2VydEFmdGVyPGlyLlVwZGF0ZU9wPihcbiAgICAgICAgICBpci5jcmVhdGVJMThuQXBwbHlPcChvcC5pMThuT3duZXIsIG9wLmhhbmRsZSwgbnVsbCEpLFxuICAgICAgICAgIG9wLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBleHByZXNzaW9uIG9wIG5lZWRzIHRvIGJlIGZvbGxvd2VkIHdpdGggYW4gYXBwbHkgb3AuXG4gKi9cbmZ1bmN0aW9uIG5lZWRzQXBwbGljYXRpb24oaTE4bkNvbnRleHRzOiBNYXA8aXIuWHJlZklkLCBpci5JMThuQ29udGV4dE9wPiwgb3A6IGlyLkkxOG5FeHByZXNzaW9uT3ApIHtcbiAgLy8gSWYgdGhlIG5leHQgb3AgaXMgbm90IGFub3RoZXIgZXhwcmVzc2lvbiwgd2UgbmVlZCB0byBhcHBseS5cbiAgaWYgKG9wLm5leHQ/LmtpbmQgIT09IGlyLk9wS2luZC5JMThuRXhwcmVzc2lvbikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY29uc3QgY29udGV4dCA9IGkxOG5Db250ZXh0cy5nZXQob3AuY29udGV4dCk7XG4gIGNvbnN0IG5leHRDb250ZXh0ID0gaTE4bkNvbnRleHRzLmdldChvcC5uZXh0LmNvbnRleHQpO1xuXG4gIGlmIChjb250ZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkFzc2VydGlvbkVycm9yOiBleHBlY3RlZCBhbiBJMThuQ29udGV4dE9wIHRvIGV4aXN0IGZvciB0aGUgSTE4bkV4cHJlc3Npb25PcCdzIGNvbnRleHRcIixcbiAgICApO1xuICB9XG5cbiAgaWYgKG5leHRDb250ZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIkFzc2VydGlvbkVycm9yOiBleHBlY3RlZCBhbiBJMThuQ29udGV4dE9wIHRvIGV4aXN0IGZvciB0aGUgbmV4dCBJMThuRXhwcmVzc2lvbk9wJ3MgY29udGV4dFwiLFxuICAgICk7XG4gIH1cblxuICAvLyBJZiB0aGUgbmV4dCBvcCBpcyBhbiBleHByZXNzaW9uIHRhcmdldGluZyBhIGRpZmZlcmVudCBpMThuIGJsb2NrIChvciBkaWZmZXJlbnQgZWxlbWVudCwgaW4gdGhlXG4gIC8vIGNhc2Ugb2YgaTE4biBhdHRyaWJ1dGVzKSwgd2UgbmVlZCB0byBhcHBseS5cblxuICAvLyBGaXJzdCwgaGFuZGxlIHRoZSBjYXNlIG9mIGkxOG4gYmxvY2tzLlxuICBpZiAoY29udGV4dC5pMThuQmxvY2sgIT09IG51bGwpIHtcbiAgICAvLyBUaGlzIGlzIGEgYmxvY2sgY29udGV4dC4gQ29tcGFyZSB0aGUgYmxvY2tzLlxuICAgIGlmIChjb250ZXh0LmkxOG5CbG9jayAhPT0gbmV4dENvbnRleHQuaTE4bkJsb2NrKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gU2Vjb25kLCBoYW5kbGUgdGhlIGNhc2Ugb2YgaTE4biBhdHRyaWJ1dGVzLlxuICBpZiAob3AuaTE4bk93bmVyICE9PSBvcC5uZXh0LmkxOG5Pd25lcikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbiJdfQ==