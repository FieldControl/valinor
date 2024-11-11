/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVyZV9mdW5jdGlvbl9leHRyYWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3RlbXBsYXRlL3BpcGVsaW5lL3NyYy9waGFzZXMvcHVyZV9mdW5jdGlvbl9leHRyYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQTJCLE1BQU0sMkJBQTJCLENBQUM7QUFDakYsT0FBTyxLQUFLLENBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRCxPQUFPLEtBQUssRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUkvQixNQUFNLFVBQVUsb0JBQW9CLENBQUMsR0FBbUI7SUFDdEQsS0FBSyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUM1QixFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxDQUFDLElBQUksWUFBWSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDO29CQUNqRSxPQUFPO2dCQUNULENBQUM7Z0JBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLG9CQUFxQixTQUFRLFlBQVk7SUFDN0MsWUFBb0IsT0FBZTtRQUNqQyxLQUFLLEVBQUUsQ0FBQztRQURVLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFFbkMsQ0FBQztJQUVRLEtBQUssQ0FBQyxJQUFrQjtRQUMvQixJQUFJLElBQUksWUFBWSxFQUFFLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNqRCxPQUFPLFNBQVMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDO1FBQ2hDLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLENBQUM7SUFDSCxDQUFDO0lBRUQsNkRBQTZEO0lBQzdELDJCQUEyQixDQUFDLFFBQWdCLEVBQUUsT0FBcUI7UUFDakUsTUFBTSxRQUFRLEdBQWdCLEVBQUUsQ0FBQztRQUNqQyxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQzVDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFRCw0RkFBNEY7UUFDNUYsZ0dBQWdHO1FBQ2hHLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FDcEQsT0FBTyxFQUNQLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDUCxJQUFJLENBQUMsQ0FBQyxJQUFJLFlBQVksRUFBRSxDQUFDLHlCQUF5QixDQUFDLEVBQUUsQ0FBQztnQkFDcEQsT0FBTyxJQUFJLENBQUM7WUFDZCxDQUFDO1lBRUQsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsQ0FBQyxFQUNELEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQzNCLENBQUM7UUFFRixPQUFPLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FDekIsUUFBUSxFQUNSLElBQUksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFDN0MsU0FBUyxFQUNULENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUNyQixDQUFDO0lBQ0osQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0dlbmVyaWNLZXlGbiwgU2hhcmVkQ29uc3RhbnREZWZpbml0aW9ufSBmcm9tICcuLi8uLi8uLi8uLi9jb25zdGFudF9wb29sJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vLi4vLi4vLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0ICogYXMgaXIgZnJvbSAnLi4vLi4vaXInO1xuXG5pbXBvcnQgdHlwZSB7Q29tcGlsYXRpb25Kb2J9IGZyb20gJy4uL2NvbXBpbGF0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RQdXJlRnVuY3Rpb25zKGpvYjogQ29tcGlsYXRpb25Kb2IpOiB2b2lkIHtcbiAgZm9yIChjb25zdCB2aWV3IG9mIGpvYi51bml0cykge1xuICAgIGZvciAoY29uc3Qgb3Agb2Ygdmlldy5vcHMoKSkge1xuICAgICAgaXIudmlzaXRFeHByZXNzaW9uc0luT3Aob3AsIChleHByKSA9PiB7XG4gICAgICAgIGlmICghKGV4cHIgaW5zdGFuY2VvZiBpci5QdXJlRnVuY3Rpb25FeHByKSB8fCBleHByLmJvZHkgPT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjb25zdGFudERlZiA9IG5ldyBQdXJlRnVuY3Rpb25Db25zdGFudChleHByLmFyZ3MubGVuZ3RoKTtcbiAgICAgICAgZXhwci5mbiA9IGpvYi5wb29sLmdldFNoYXJlZENvbnN0YW50KGNvbnN0YW50RGVmLCBleHByLmJvZHkpO1xuICAgICAgICBleHByLmJvZHkgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFB1cmVGdW5jdGlvbkNvbnN0YW50IGV4dGVuZHMgR2VuZXJpY0tleUZuIGltcGxlbWVudHMgU2hhcmVkQ29uc3RhbnREZWZpbml0aW9uIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBudW1BcmdzOiBudW1iZXIpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUga2V5T2YoZXhwcjogby5FeHByZXNzaW9uKTogc3RyaW5nIHtcbiAgICBpZiAoZXhwciBpbnN0YW5jZW9mIGlyLlB1cmVGdW5jdGlvblBhcmFtZXRlckV4cHIpIHtcbiAgICAgIHJldHVybiBgcGFyYW0oJHtleHByLmluZGV4fSlgO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3VwZXIua2V5T2YoZXhwcik7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETzogVXNlIHRoZSBuZXcgcG9vbCBtZXRob2QgYGdldFNoYXJlZEZ1bmN0aW9uUmVmZXJlbmNlYFxuICB0b1NoYXJlZENvbnN0YW50RGVjbGFyYXRpb24oZGVjbE5hbWU6IHN0cmluZywga2V5RXhwcjogby5FeHByZXNzaW9uKTogby5TdGF0ZW1lbnQge1xuICAgIGNvbnN0IGZuUGFyYW1zOiBvLkZuUGFyYW1bXSA9IFtdO1xuICAgIGZvciAobGV0IGlkeCA9IDA7IGlkeCA8IHRoaXMubnVtQXJnczsgaWR4KyspIHtcbiAgICAgIGZuUGFyYW1zLnB1c2gobmV3IG8uRm5QYXJhbSgnYScgKyBpZHgpKTtcbiAgICB9XG5cbiAgICAvLyBXZSB3aWxsIG5ldmVyIHZpc2l0IGBpci5QdXJlRnVuY3Rpb25QYXJhbWV0ZXJFeHByYHMgdGhhdCBkb24ndCBiZWxvbmcgdG8gdXMsIGJlY2F1c2UgdGhpc1xuICAgIC8vIHRyYW5zZm9ybSBydW5zIGluc2lkZSBhbm90aGVyIHZpc2l0b3Igd2hpY2ggd2lsbCB2aXNpdCBuZXN0ZWQgcHVyZSBmdW5jdGlvbnMgYmVmb3JlIHRoaXMgb25lLlxuICAgIGNvbnN0IHJldHVybkV4cHIgPSBpci50cmFuc2Zvcm1FeHByZXNzaW9uc0luRXhwcmVzc2lvbihcbiAgICAgIGtleUV4cHIsXG4gICAgICAoZXhwcikgPT4ge1xuICAgICAgICBpZiAoIShleHByIGluc3RhbmNlb2YgaXIuUHVyZUZ1bmN0aW9uUGFyYW1ldGVyRXhwcikpIHtcbiAgICAgICAgICByZXR1cm4gZXhwcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvLnZhcmlhYmxlKCdhJyArIGV4cHIuaW5kZXgpO1xuICAgICAgfSxcbiAgICAgIGlyLlZpc2l0b3JDb250ZXh0RmxhZy5Ob25lLFxuICAgICk7XG5cbiAgICByZXR1cm4gbmV3IG8uRGVjbGFyZVZhclN0bXQoXG4gICAgICBkZWNsTmFtZSxcbiAgICAgIG5ldyBvLkFycm93RnVuY3Rpb25FeHByKGZuUGFyYW1zLCByZXR1cm5FeHByKSxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIG8uU3RtdE1vZGlmaWVyLkZpbmFsLFxuICAgICk7XG4gIH1cbn1cbiJdfQ==