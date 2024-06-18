/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { GenericKeyFn } from '../../../../constant_pool';
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
export function extractPureFunctions(job) {
    for (const view of job.units) {
        for (const op of view.ops()) {
            ir.visitExpressionsInOp(op, (expr) => {
                if (!(expr instanceof ir.PureFunctionExpr) || expr.body === null) {
                    return;
                }
                const constantDef = new PureFunctionConstant(expr.args.length);
                expr.fn = job.pool.getSharedConstant(constantDef, expr.body);
                expr.body = null;
            });
        }
    }
}
class PureFunctionConstant extends GenericKeyFn {
    constructor(numArgs) {
        super();
        this.numArgs = numArgs;
    }
    keyOf(expr) {
        if (expr instanceof ir.PureFunctionParameterExpr) {
            return `param(${expr.index})`;
        }
        else {
            return super.keyOf(expr);
        }
    }
    // TODO: Use the new pool method `getSharedFunctionReference`
    toSharedConstantDeclaration(declName, keyExpr) {
        const fnParams = [];
        for (let idx = 0; idx < this.numArgs; idx++) {
            fnParams.push(new o.FnParam('a' + idx));
        }
        // We will never visit `ir.PureFunctionParameterExpr`s that don't belong to us, because this
        // transform runs inside another visitor which will visit nested pure functions before this one.
        const returnExpr = ir.transformExpressionsInExpression(keyExpr, (expr) => {
            if (!(expr instanceof ir.PureFunctionParameterExpr)) {
                return expr;
            }
            return o.variable('a' + expr.index);
        }, ir.VisitorContextFlag.None);
        return new o.DeclareVarStmt(declName, new o.ArrowFunctionExpr(fnParams, returnExpr), undefined, o.StmtModifier.Final);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVyZV9mdW5jdGlvbl9leHRyYWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcHVyZV9mdW5jdGlvbl9leHRyYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQTJCLE1BQU0sMkJBQTJCLENBQUM7QUFDakYsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUkvQixNQUFNLFVBQVUsb0JBQW9CLENBQUMsR0FBbUI7SUFDdEQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUM1QixFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxDQUFDLElBQUksWUFBWSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDO29CQUNqRSxPQUFPO2dCQUNULENBQUM7Z0JBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLG9CQUFxQixTQUFRLFlBQVk7SUFDN0MsWUFBb0IsT0FBZTtRQUNqQyxLQUFLLEVBQUUsQ0FBQztRQURVLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFFbkMsQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFrQjtRQUMvQixJQUFJLElBQUksWUFBWSxFQUFFLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNqRCxPQUFPLFNBQVMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDO1FBQ2hDLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLENBQUM7SUFDSCxDQUFDO0lBRUQsNkRBQTZEO0lBQzdELDJCQUEyQixDQUFDLFFBQWdCLEVBQUUsT0FBcUI7UUFDakUsTUFBTSxRQUFRLEdBQWdCLEVBQUUsQ0FBQztRQUNqQyxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQzVDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFRCw0RkFBNEY7UUFDNUYsZ0dBQWdHO1FBQ2hHLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FDcEQsT0FBTyxFQUNQLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDUCxJQUFJLENBQUMsQ0FBQyxJQUFJLFlBQVksRUFBRSxDQUFDLHlCQUF5QixDQUFDLEVBQUUsQ0FBQztnQkFDcEQsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBRUQsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsQ0FBQyxFQUNELEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQzNCLENBQUM7UUFFRixPQUFPLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FDekIsUUFBUSxFQUNSLElBQUksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFDN0MsU0FBUyxFQUNULENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUNyQixDQUFDO0lBQ0osQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7R2VuZXJpY0tleUZuLCBTaGFyZWRDb25zdGFudERlZmluaXRpb259IGZyb20gJy4uLy4uLy4uLy4uL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi8uLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQgKiBhcyBpciBmcm9tICcuLi8uLi9pcic7XG5cbmltcG9ydCB0eXBlIHtDb21waWxhdGlvbkpvYn0gZnJvbSAnLi4vY29tcGlsYXRpb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFB1cmVGdW5jdGlvbnMoam9iOiBDb21waWxhdGlvbkpvYik6IHZvaWQge1xuICBmb3IgKGNvbnN0IHZpZXcgb2Ygam9iLnVuaXRzKSB7XG4gICAgZm9yIChjb25zdCBvcCBvZiB2aWV3Lm9wcygpKSB7XG4gICAgICBpci52aXNpdEV4cHJlc3Npb25zSW5PcChvcCwgKGV4cHIpID0+IHtcbiAgICAgICAgaWYgKCEoZXhwciBpbnN0YW5jZW9mIGlyLlB1cmVGdW5jdGlvbkV4cHIpIHx8IGV4cHIuYm9keSA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnN0YW50RGVmID0gbmV3IFB1cmVGdW5jdGlvbkNvbnN0YW50KGV4cHIuYXJncy5sZW5ndGgpO1xuICAgICAgICBleHByLmZuID0gam9iLnBvb2wuZ2V0U2hhcmVkQ29uc3RhbnQoY29uc3RhbnREZWYsIGV4cHIuYm9keSk7XG4gICAgICAgIGV4cHIuYm9keSA9IG51bGw7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUHVyZUZ1bmN0aW9uQ29uc3RhbnQgZXh0ZW5kcyBHZW5lcmljS2V5Rm4gaW1wbGVtZW50cyBTaGFyZWRDb25zdGFudERlZmluaXRpb24ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG51bUFyZ3M6IG51bWJlcikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSBrZXlPZihleHByOiBvLkV4cHJlc3Npb24pOiBzdHJpbmcge1xuICAgIGlmIChleHByIGluc3RhbmNlb2YgaXIuUHVyZUZ1bmN0aW9uUGFyYW1ldGVyRXhwcikge1xuICAgICAgcmV0dXJuIGBwYXJhbSgke2V4cHIuaW5kZXh9KWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzdXBlci5rZXlPZihleHByKTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPOiBVc2UgdGhlIG5ldyBwb29sIG1ldGhvZCBgZ2V0U2hhcmVkRnVuY3Rpb25SZWZlcmVuY2VgXG4gIHRvU2hhcmVkQ29uc3RhbnREZWNsYXJhdGlvbihkZWNsTmFtZTogc3RyaW5nLCBrZXlFeHByOiBvLkV4cHJlc3Npb24pOiBvLlN0YXRlbWVudCB7XG4gICAgY29uc3QgZm5QYXJhbXM6IG8uRm5QYXJhbVtdID0gW107XG4gICAgZm9yIChsZXQgaWR4ID0gMDsgaWR4IDwgdGhpcy5udW1BcmdzOyBpZHgrKykge1xuICAgICAgZm5QYXJhbXMucHVzaChuZXcgby5GblBhcmFtKCdhJyArIGlkeCkpO1xuICAgIH1cblxuICAgIC8vIFdlIHdpbGwgbmV2ZXIgdmlzaXQgYGlyLlB1cmVGdW5jdGlvblBhcmFtZXRlckV4cHJgcyB0aGF0IGRvbid0IGJlbG9uZyB0byB1cywgYmVjYXVzZSB0aGlzXG4gICAgLy8gdHJhbnNmb3JtIHJ1bnMgaW5zaWRlIGFub3RoZXIgdmlzaXRvciB3aGljaCB3aWxsIHZpc2l0IG5lc3RlZCBwdXJlIGZ1bmN0aW9ucyBiZWZvcmUgdGhpcyBvbmUuXG4gICAgY29uc3QgcmV0dXJuRXhwciA9IGlyLnRyYW5zZm9ybUV4cHJlc3Npb25zSW5FeHByZXNzaW9uKFxuICAgICAga2V5RXhwcixcbiAgICAgIChleHByKSA9PiB7XG4gICAgICAgIGlmICghKGV4cHIgaW5zdGFuY2VvZiBpci5QdXJlRnVuY3Rpb25QYXJhbWV0ZXJFeHByKSkge1xuICAgICAgICAgIHJldHVybiBleHByO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG8udmFyaWFibGUoJ2EnICsgZXhwci5pbmRleCk7XG4gICAgICB9LFxuICAgICAgaXIuVmlzaXRvckNvbnRleHRGbGFnLk5vbmUsXG4gICAgKTtcblxuICAgIHJldHVybiBuZXcgby5EZWNsYXJlVmFyU3RtdChcbiAgICAgIGRlY2xOYW1lLFxuICAgICAgbmV3IG8uQXJyb3dGdW5jdGlvbkV4cHIoZm5QYXJhbXMsIHJldHVybkV4cHIpLFxuICAgICAgdW5kZWZpbmVkLFxuICAgICAgby5TdG10TW9kaWZpZXIuRmluYWwsXG4gICAgKTtcbiAgfVxufVxuIl19