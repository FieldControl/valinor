/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbHlfaTE4bl9leHByZXNzaW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy90ZW1wbGF0ZS9waXBlbGluZS9zcmMvcGhhc2VzL2FwcGx5X2kxOG5fZXhwcmVzc2lvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxLQUFLLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHL0I7O0dBRUc7QUFDSCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsR0FBbUI7SUFDdEQsTUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQStCLENBQUM7SUFDNUQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDN0IsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3RDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNoQyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM3Qiw4RUFBOEU7WUFDOUUsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxJQUFJLGdCQUFnQixDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUMvRSx5REFBeUQ7Z0JBQ3pELEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUNuQixFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUssQ0FBQyxFQUNwRCxFQUFFLENBQ0gsQ0FBQztZQUNKLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsWUFBOEMsRUFBRSxFQUF1QjtJQUMvRiw4REFBOEQ7SUFDOUQsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQy9DLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUV0RCxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUMxQixNQUFNLElBQUksS0FBSyxDQUNiLHVGQUF1RixDQUN4RixDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzlCLE1BQU0sSUFBSSxLQUFLLENBQ2IsNEZBQTRGLENBQzdGLENBQUM7SUFDSixDQUFDO0lBRUQsaUdBQWlHO0lBQ2pHLDhDQUE4QztJQUU5Qyx5Q0FBeUM7SUFDekMsSUFBSSxPQUFPLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQy9CLCtDQUErQztRQUMvQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELDhDQUE4QztJQUM5QyxJQUFJLEVBQUUsQ0FBQyxTQUFTLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN2QyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuaW1wb3J0IHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG4vKipcbiAqIEFkZHMgYXBwbHkgb3BlcmF0aW9ucyBhZnRlciBpMThuIGV4cHJlc3Npb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlJMThuRXhwcmVzc2lvbnMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBjb25zdCBpMThuQ29udGV4dHMgPSBuZXcgTWFwPGlyLlhyZWZJZCwgaXIuSTE4bkNvbnRleHRPcD4oKTtcbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC5jcmVhdGUpIHtcbiAgICAgIGlmIChvcC5raW5kID09PSBpci5PcEtpbmQuSTE4bkNvbnRleHQpIHtcbiAgICAgICAgaTE4bkNvbnRleHRzLnNldChvcC54cmVmLCBvcCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCB1bml0IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2YgdW5pdC51cGRhdGUpIHtcbiAgICAgIC8vIE9ubHkgYWRkIGFwcGx5IGFmdGVyIGV4cHJlc3Npb25zIHRoYXQgYXJlIG5vdCBmb2xsb3dlZCBieSBtb3JlIGV4cHJlc3Npb25zLlxuICAgICAgaWYgKG9wLmtpbmQgPT09IGlyLk9wS2luZC5JMThuRXhwcmVzc2lvbiAmJiBuZWVkc0FwcGxpY2F0aW9uKGkxOG5Db250ZXh0cywgb3ApKSB7XG4gICAgICAgIC8vIFRPRE86IHdoYXQgc2hvdWxkIGJlIHRoZSBzb3VyY2Ugc3BhbiBmb3IgdGhlIGFwcGx5IG9wP1xuICAgICAgICBpci5PcExpc3QuaW5zZXJ0QWZ0ZXI8aXIuVXBkYXRlT3A+KFxuICAgICAgICAgIGlyLmNyZWF0ZUkxOG5BcHBseU9wKG9wLmkxOG5Pd25lciwgb3AuaGFuZGxlLCBudWxsISksXG4gICAgICAgICAgb3AsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGV4cHJlc3Npb24gb3AgbmVlZHMgdG8gYmUgZm9sbG93ZWQgd2l0aCBhbiBhcHBseSBvcC5cbiAqL1xuZnVuY3Rpb24gbmVlZHNBcHBsaWNhdGlvbihpMThuQ29udGV4dHM6IE1hcDxpci5YcmVmSWQsIGlyLkkxOG5Db250ZXh0T3A+LCBvcDogaXIuSTE4bkV4cHJlc3Npb25PcCkge1xuICAvLyBJZiB0aGUgbmV4dCBvcCBpcyBub3QgYW5vdGhlciBleHByZXNzaW9uLCB3ZSBuZWVkIHRvIGFwcGx5LlxuICBpZiAob3AubmV4dD8ua2luZCAhPT0gaXIuT3BLaW5kLkkxOG5FeHByZXNzaW9uKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdCBjb250ZXh0ID0gaTE4bkNvbnRleHRzLmdldChvcC5jb250ZXh0KTtcbiAgY29uc3QgbmV4dENvbnRleHQgPSBpMThuQ29udGV4dHMuZ2V0KG9wLm5leHQuY29udGV4dCk7XG5cbiAgaWYgKGNvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiQXNzZXJ0aW9uRXJyb3I6IGV4cGVjdGVkIGFuIEkxOG5Db250ZXh0T3AgdG8gZXhpc3QgZm9yIHRoZSBJMThuRXhwcmVzc2lvbk9wJ3MgY29udGV4dFwiLFxuICAgICk7XG4gIH1cblxuICBpZiAobmV4dENvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiQXNzZXJ0aW9uRXJyb3I6IGV4cGVjdGVkIGFuIEkxOG5Db250ZXh0T3AgdG8gZXhpc3QgZm9yIHRoZSBuZXh0IEkxOG5FeHByZXNzaW9uT3AncyBjb250ZXh0XCIsXG4gICAgKTtcbiAgfVxuXG4gIC8vIElmIHRoZSBuZXh0IG9wIGlzIGFuIGV4cHJlc3Npb24gdGFyZ2V0aW5nIGEgZGlmZmVyZW50IGkxOG4gYmxvY2sgKG9yIGRpZmZlcmVudCBlbGVtZW50LCBpbiB0aGVcbiAgLy8gY2FzZSBvZiBpMThuIGF0dHJpYnV0ZXMpLCB3ZSBuZWVkIHRvIGFwcGx5LlxuXG4gIC8vIEZpcnN0LCBoYW5kbGUgdGhlIGNhc2Ugb2YgaTE4biBibG9ja3MuXG4gIGlmIChjb250ZXh0LmkxOG5CbG9jayAhPT0gbnVsbCkge1xuICAgIC8vIFRoaXMgaXMgYSBibG9jayBjb250ZXh0LiBDb21wYXJlIHRoZSBibG9ja3MuXG4gICAgaWYgKGNvbnRleHQuaTE4bkJsb2NrICE9PSBuZXh0Q29udGV4dC5pMThuQmxvY2spIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBTZWNvbmQsIGhhbmRsZSB0aGUgY2FzZSBvZiBpMThuIGF0dHJpYnV0ZXMuXG4gIGlmIChvcC5pMThuT3duZXIgIT09IG9wLm5leHQuaTE4bk93bmVyKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuIl19