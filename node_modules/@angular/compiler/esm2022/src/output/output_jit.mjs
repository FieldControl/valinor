/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { identifierName } from '../parse_util';
import { EmitterVisitorContext } from './abstract_emitter';
import { AbstractJsEmitterVisitor } from './abstract_js_emitter';
import * as o from './output_ast';
import { newTrustedFunctionForJIT } from './output_jit_trusted_types';
/**
 * A helper class to manage the evaluation of JIT generated code.
 */
export class JitEvaluator {
    /**
     *
     * @param sourceUrl The URL of the generated code.
     * @param statements An array of Angular statement AST nodes to be evaluated.
     * @param refResolver Resolves `o.ExternalReference`s into values.
     * @param createSourceMaps If true then create a source-map for the generated code and include it
     * inline as a source-map comment.
     * @returns A map of all the variables in the generated code.
     */
    evaluateStatements(sourceUrl, statements, refResolver, createSourceMaps) {
        const converter = new JitEmitterVisitor(refResolver);
        const ctx = EmitterVisitorContext.createRoot();
        // Ensure generated code is in strict mode
        if (statements.length > 0 && !isUseStrictStatement(statements[0])) {
            statements = [o.literal('use strict').toStmt(), ...statements];
        }
        converter.visitAllStatements(statements, ctx);
        converter.createReturnStmt(ctx);
        return this.evaluateCode(sourceUrl, ctx, converter.getArgs(), createSourceMaps);
    }
    /**
     * Evaluate a piece of JIT generated code.
     * @param sourceUrl The URL of this generated code.
     * @param ctx A context object that contains an AST of the code to be evaluated.
     * @param vars A map containing the names and values of variables that the evaluated code might
     * reference.
     * @param createSourceMap If true then create a source-map for the generated code and include it
     * inline as a source-map comment.
     * @returns The result of evaluating the code.
     */
    evaluateCode(sourceUrl, ctx, vars, createSourceMap) {
        let fnBody = `"use strict";${ctx.toSource()}\n//# sourceURL=${sourceUrl}`;
        const fnArgNames = [];
        const fnArgValues = [];
        for (const argName in vars) {
            fnArgValues.push(vars[argName]);
            fnArgNames.push(argName);
        }
        if (createSourceMap) {
            // using `new Function(...)` generates a header, 1 line of no arguments, 2 lines otherwise
            // E.g. ```
            // function anonymous(a,b,c
            // /**/) { ... }```
            // We don't want to hard code this fact, so we auto detect it via an empty function first.
            const emptyFn = newTrustedFunctionForJIT(...fnArgNames.concat('return null;')).toString();
            const headerLines = emptyFn.slice(0, emptyFn.indexOf('return null;')).split('\n').length - 1;
            fnBody += `\n${ctx.toSourceMapGenerator(sourceUrl, headerLines).toJsComment()}`;
        }
        const fn = newTrustedFunctionForJIT(...fnArgNames.concat(fnBody));
        return this.executeFunction(fn, fnArgValues);
    }
    /**
     * Execute a JIT generated function by calling it.
     *
     * This method can be overridden in tests to capture the functions that are generated
     * by this `JitEvaluator` class.
     *
     * @param fn A function to execute.
     * @param args The arguments to pass to the function being executed.
     * @returns The return value of the executed function.
     */
    executeFunction(fn, args) {
        return fn(...args);
    }
}
/**
 * An Angular AST visitor that converts AST nodes into executable JavaScript code.
 */
export class JitEmitterVisitor extends AbstractJsEmitterVisitor {
    constructor(refResolver) {
        super();
        this.refResolver = refResolver;
        this._evalArgNames = [];
        this._evalArgValues = [];
        this._evalExportedVars = [];
    }
    createReturnStmt(ctx) {
        const stmt = new o.ReturnStatement(new o.LiteralMapExpr(this._evalExportedVars.map((resultVar) => new o.LiteralMapEntry(resultVar, o.variable(resultVar), false))));
        stmt.visitStatement(this, ctx);
    }
    getArgs() {
        const result = {};
        for (let i = 0; i < this._evalArgNames.length; i++) {
            result[this._evalArgNames[i]] = this._evalArgValues[i];
        }
        return result;
    }
    visitExternalExpr(ast, ctx) {
        this._emitReferenceToExternal(ast, this.refResolver.resolveExternalReference(ast.value), ctx);
        return null;
    }
    visitWrappedNodeExpr(ast, ctx) {
        this._emitReferenceToExternal(ast, ast.node, ctx);
        return null;
    }
    visitDeclareVarStmt(stmt, ctx) {
        if (stmt.hasModifier(o.StmtModifier.Exported)) {
            this._evalExportedVars.push(stmt.name);
        }
        return super.visitDeclareVarStmt(stmt, ctx);
    }
    visitDeclareFunctionStmt(stmt, ctx) {
        if (stmt.hasModifier(o.StmtModifier.Exported)) {
            this._evalExportedVars.push(stmt.name);
        }
        return super.visitDeclareFunctionStmt(stmt, ctx);
    }
    _emitReferenceToExternal(ast, value, ctx) {
        let id = this._evalArgValues.indexOf(value);
        if (id === -1) {
            id = this._evalArgValues.length;
            this._evalArgValues.push(value);
            const name = identifierName({ reference: value }) || 'val';
            this._evalArgNames.push(`jit_${name}_${id}`);
        }
        ctx.print(ast, this._evalArgNames[id]);
    }
}
function isUseStrictStatement(statement) {
    return statement.isEquivalent(o.literal('use strict').toStmt());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0X2ppdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9vdXRwdXQvb3V0cHV0X2ppdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTdDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3pELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9ELE9BQU8sS0FBSyxDQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ2xDLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBTXBFOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFlBQVk7SUFDdkI7Ozs7Ozs7O09BUUc7SUFDSCxrQkFBa0IsQ0FDaEIsU0FBaUIsRUFDakIsVUFBeUIsRUFDekIsV0FBc0MsRUFDdEMsZ0JBQXlCO1FBRXpCLE1BQU0sU0FBUyxHQUFHLElBQUksaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckQsTUFBTSxHQUFHLEdBQUcscUJBQXFCLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDL0MsMENBQTBDO1FBQzFDLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2xFLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxVQUFVLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBQ0QsU0FBUyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM5QyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEMs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QUFDO0lBQ25ELENBQUM7SUFFTyx3QkFBd0IsQ0FDOUIsR0FBaUIsRUFDakIsS0FBVSxFQUNWLEdBQTBCO1FBRTFCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZCxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7WUFDaEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEMsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBQyxDQUFDLElBQUksS0FBSyxDQUFDO1lBQ3pELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUNELEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0NBQ0Y7QUFFRCxTQUFTLG9CQUFvQixDQUFDLFNBQXNCO0lBQ2xELE9BQU8sU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDbEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpZGVudGlmaWVyTmFtZX0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5cbmltcG9ydCB7RW1pdHRlclZpc2l0b3JDb250ZXh0fSBmcm9tICcuL2Fic3RyYWN0X2VtaXR0ZXInO1xuaW1wb3J0IHtBYnN0cmFjdEpzRW1pdHRlclZpc2l0b3J9IGZyb20gJy4vYWJzdHJhY3RfanNfZW1pdHRlcic7XG5pbXBvcnQgKiBhcyBvIGZyb20gJy4vb3V0cHV0X2FzdCc7XG5pbXBvcnQge25ld1RydXN0ZWRGdW5jdGlvbkZvckpJVH0gZnJvbSAnLi9vdXRwdXRfaml0X3RydXN0ZWRfdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVybmFsUmVmZXJlbmNlUmVzb2x2ZXIge1xuICByZXNvbHZlRXh0ZXJuYWxSZWZlcmVuY2UocmVmOiBvLkV4dGVybmFsUmVmZXJlbmNlKTogdW5rbm93bjtcbn1cblxuLyoqXG4gKiBBIGhlbHBlciBjbGFzcyB0byBtYW5hZ2UgdGhlIGV2YWx1YXRpb24gb2YgSklUIGdlbmVyYXRlZCBjb2RlLlxuICovXG5leHBvcnQgY2xhc3MgSml0RXZhbHVhdG9yIHtcbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBzb3VyY2VVcmwgVGhlIFVSTCBvZiB0aGUgZ2VuZXJhdGVkIGNvZGUuXG4gICAqIEBwYXJhbSBzdGF0ZW1lbnRzIEFuIGFycmF5IG9mIEFuZ3VsYXIgc3RhdGVtZW50IEFTVCBub2RlcyB0byBiZSBldmFsdWF0ZWQuXG4gICAqIEBwYXJhbSByZWZSZXNvbHZlciBSZXNvbHZlcyBgby5FeHRlcm5hbFJlZmVyZW5jZWBzIGludG8gdmFsdWVzLlxuICAgKiBAcGFyYW0gY3JlYXRlU291cmNlTWFwcyBJZiB0cnVlIHRoZW4gY3JlYXRlIGEgc291cmNlLW1hcCBmb3IgdGhlIGdlbmVyYXRlZCBjb2RlIGFuZCBpbmNsdWRlIGl0XG4gICAqIGlubGluZSBhcyBhIHNvdXJjZS1tYXAgY29tbWVudC5cbiAgICogQHJldHVybnMgQSBtYXAgb2YgYWxsIHRoZSB2YXJpYWJsZXMgaW4gdGhlIGdlbmVyYXRlZCBjb2RlLlxuICAgKi9cbiAgZXZhbHVhdGVTdGF0ZW1lbnRzKFxuICAgIHNvdXJjZVVybDogc3RyaW5nLFxuICAgIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sXG4gICAgcmVmUmVzb2x2ZXI6IEV4dGVybmFsUmVmZXJlbmNlUmVzb2x2ZXIsXG4gICAgY3JlYXRlU291cmNlTWFwczogYm9vbGVhbixcbiAgKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGNvbnN0IGNvbnZlcnRlciA9IG5ldyBKaXRFbWl0dGVyVmlzaXRvcihyZWZSZXNvbHZlcik7XG4gICAgY29uc3QgY3R4ID0gRW1pdHRlclZpc2l0b3JDb250ZXh0LmNyZWF0ZVJvb3QoKTtcbiAgICAvLyBFbnN1cmUgZ2VuZXJhdGVkIGNvZGUgaXMgaW4gc3RyaWN0IG1vZGVcbiAgICBpZiAoc3RhdGVtZW50cy5sZW5ndGggPiAwICYmICFpc1VzZVN0cmljdFN0YXRlbWVudChzdGF0ZW1lbnRzWzBdKSkge1xuICAgICAgc3RhdGVtZW50cyA9IFtvLmxpdGVyYWwoJ3VzZSBzdHJpY3QnKS50b1N0bXQoKSwgLi4uc3RhdGVtZW50c107XG4gICAgfVxuICAgIGNvbnZlcnRlci52aXNpdEFsbFN0YXRlbWVudHMoc3RhdGVtZW50cywgY3R4KTtcbiAgICBjb252ZXJ0ZXIuY3JlYXRlUmV0dXJuU3RtdChjdHgpO1xuICAgIHJldHVybiB0aGlzLmV2YWx1YXRlQ29kZShzb3VyY2VVcmwsIGN0eCwgY29udmVydGVyLmdldEFyZ3MoKSwgY3JlYXRlU291cmNlTWFwcyk7XG4gIH1cblxuICAvKipcbiAgICogRXZhbHVhdGUgYSBwaWVjZSBvZiBKSVQgZ2VuZXJhdGVkIGNvZGUuXG4gICAqIEBwYXJhbSBzb3VyY2VVcmwgVGhlIFVSTCBvZiB0aGlzIGdlbmVyYXRlZCBjb2RlLlxuICAgKiBAcGFyYW0gY3R4IEEgY29udGV4dCBvYmplY3QgdGhhdCBjb250YWlucyBhbiBBU1Qgb2YgdGhlIGNvZGUgdG8gYmUgZXZhbHVhdGVkLlxuICAgKiBAcGFyYW0gdmFycyBBIG1hcCBjb250YWluaW5nIHRoZSBuYW1lcyBhbmQgdmFsdWVzIG9mIHZhcmlhYmxlcyB0aGF0IHRoZSBldmFsdWF0ZWQgY29kZSBtaWdodFxuICAgKiByZWZlcmVuY2UuXG4gICAqIEBwYXJhbSBjcmVhdGVTb3VyY2VNYXAgSWYgdHJ1ZSB0aGVuIGNyZWF0ZSBhIHNvdXJjZS1tYXAgZm9yIHRoZSBnZW5lcmF0ZWQgY29kZSBhbmQgaW5jbHVkZSBpdFxuICAgKiBpbmxpbmUgYXMgYSBzb3VyY2UtbWFwIGNvbW1lbnQuXG4gICAqIEByZXR1cm5zIFRoZSByZXN1bHQgb2YgZXZhbHVhdGluZyB0aGUgY29kZS5cbiAgICovXG4gIGV2YWx1YXRlQ29kZShcbiAgICBzb3VyY2VVcmw6IHN0cmluZyxcbiAgICBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCxcbiAgICB2YXJzOiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICBjcmVhdGVTb3VyY2VNYXA6IGJvb2xlYW4sXG4gICk6IGFueSB7XG4gICAgbGV0IGZuQm9keSA9IGBcInVzZSBzdHJpY3RcIjske2N0eC50b1NvdXJjZSgpfVxcbi8vIyBzb3VyY2VVUkw9JHtzb3VyY2VVcmx9YDtcbiAgICBjb25zdCBmbkFyZ05hbWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IGZuQXJnVmFsdWVzOiBhbnlbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgYXJnTmFtZSBpbiB2YXJzKSB7XG4gICAgICBmbkFyZ1ZhbHVlcy5wdXNoKHZhcnNbYXJnTmFtZV0pO1xuICAgICAgZm5BcmdOYW1lcy5wdXNoKGFyZ05hbWUpO1xuICAgIH1cbiAgICBpZiAoY3JlYXRlU291cmNlTWFwKSB7XG4gICAgICAvLyB1c2luZyBgbmV3IEZ1bmN0aW9uKC4uLilgIGdlbmVyYXRlcyBhIGhlYWRlciwgMSBsaW5lIG9mIG5vIGFyZ3VtZW50cywgMiBsaW5lcyBvdGhlcndpc2VcbiAgICAgIC8vIEUuZy4gYGBgXG4gICAgICAvLyBmdW5jdGlvbiBhbm9ueW1vdXMoYSxiLGNcbiAgICAgIC8vIC8qKi8pIHsgLi4uIH1gYGBcbiAgICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gaGFyZCBjb2RlIHRoaXMgZmFjdCwgc28gd2UgYXV0byBkZXRlY3QgaXQgdmlhIGFuIGVtcHR5IGZ1bmN0aW9uIGZpcnN0LlxuICAgICAgY29uc3QgZW1wdHlGbiA9IG5ld1RydXN0ZWRGdW5jdGlvbkZvckpJVCguLi5mbkFyZ05hbWVzLmNvbmNhdCgncmV0dXJuIG51bGw7JykpLnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCBoZWFkZXJMaW5lcyA9IGVtcHR5Rm4uc2xpY2UoMCwgZW1wdHlGbi5pbmRleE9mKCdyZXR1cm4gbnVsbDsnKSkuc3BsaXQoJ1xcbicpLmxlbmd0aCAtIDE7XG4gICAgICBmbkJvZHkgKz0gYFxcbiR7Y3R4LnRvU291cmNlTWFwR2VuZXJhdG9yKHNvdXJjZVVybCwgaGVhZGVyTGluZXMpLnRvSnNDb21tZW50KCl9YDtcbiAgICB9XG4gICAgY29uc3QgZm4gPSBuZXdUcnVzdGVkRnVuY3Rpb25Gb3JKSVQoLi4uZm5BcmdOYW1lcy5jb25jYXQoZm5Cb2R5KSk7XG4gICAgcmV0dXJuIHRoaXMuZXhlY3V0ZUZ1bmN0aW9uKGZuLCBmbkFyZ1ZhbHVlcyk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZSBhIEpJVCBnZW5lcmF0ZWQgZnVuY3Rpb24gYnkgY2FsbGluZyBpdC5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4gaW4gdGVzdHMgdG8gY2FwdHVyZSB0aGUgZnVuY3Rpb25zIHRoYXQgYXJlIGdlbmVyYXRlZFxuICAgKiBieSB0aGlzIGBKaXRFdmFsdWF0b3JgIGNsYXNzLlxuICAgKlxuICAgKiBAcGFyYW0gZm4gQSBmdW5jdGlvbiB0byBleGVjdXRlLlxuICAgKiBAcGFyYW0gYXJncyBUaGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGZ1bmN0aW9uIGJlaW5nIGV4ZWN1dGVkLlxuICAgKiBAcmV0dXJucyBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBleGVjdXRlZCBmdW5jdGlvbi5cbiAgICovXG4gIGV4ZWN1dGVGdW5jdGlvbihmbjogRnVuY3Rpb24sIGFyZ3M6IGFueVtdKSB7XG4gICAgcmV0dXJuIGZuKC4uLmFyZ3MpO1xuICB9XG59XG5cbi8qKlxuICogQW4gQW5ndWxhciBBU1QgdmlzaXRvciB0aGF0IGNvbnZlcnRzIEFTVCBub2RlcyBpbnRvIGV4ZWN1dGFibGUgSmF2YVNjcmlwdCBjb2RlLlxuICovXG5leHBvcnQgY2xhc3MgSml0RW1pdHRlclZpc2l0b3IgZXh0ZW5kcyBBYnN0cmFjdEpzRW1pdHRlclZpc2l0b3Ige1xuICBwcml2YXRlIF9ldmFsQXJnTmFtZXM6IHN0cmluZ1tdID0gW107XG4gIHByaXZhdGUgX2V2YWxBcmdWYWx1ZXM6IGFueVtdID0gW107XG4gIHByaXZhdGUgX2V2YWxFeHBvcnRlZFZhcnM6IHN0cmluZ1tdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWZSZXNvbHZlcjogRXh0ZXJuYWxSZWZlcmVuY2VSZXNvbHZlcikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBjcmVhdGVSZXR1cm5TdG10KGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KSB7XG4gICAgY29uc3Qgc3RtdCA9IG5ldyBvLlJldHVyblN0YXRlbWVudChcbiAgICAgIG5ldyBvLkxpdGVyYWxNYXBFeHByKFxuICAgICAgICB0aGlzLl9ldmFsRXhwb3J0ZWRWYXJzLm1hcChcbiAgICAgICAgICAocmVzdWx0VmFyKSA9PiBuZXcgby5MaXRlcmFsTWFwRW50cnkocmVzdWx0VmFyLCBvLnZhcmlhYmxlKHJlc3VsdFZhciksIGZhbHNlKSxcbiAgICAgICAgKSxcbiAgICAgICksXG4gICAgKTtcbiAgICBzdG10LnZpc2l0U3RhdGVtZW50KHRoaXMsIGN0eCk7XG4gIH1cblxuICBnZXRBcmdzKCk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgICBjb25zdCByZXN1bHQ6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9ldmFsQXJnTmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFt0aGlzLl9ldmFsQXJnTmFtZXNbaV1dID0gdGhpcy5fZXZhbEFyZ1ZhbHVlc1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RXh0ZXJuYWxFeHByKGFzdDogby5FeHRlcm5hbEV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICB0aGlzLl9lbWl0UmVmZXJlbmNlVG9FeHRlcm5hbChhc3QsIHRoaXMucmVmUmVzb2x2ZXIucmVzb2x2ZUV4dGVybmFsUmVmZXJlbmNlKGFzdC52YWx1ZSksIGN0eCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdFdyYXBwZWROb2RlRXhwcihhc3Q6IG8uV3JhcHBlZE5vZGVFeHByPGFueT4sIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICB0aGlzLl9lbWl0UmVmZXJlbmNlVG9FeHRlcm5hbChhc3QsIGFzdC5ub2RlLCBjdHgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXREZWNsYXJlVmFyU3RtdChzdG10OiBvLkRlY2xhcmVWYXJTdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgaWYgKHN0bXQuaGFzTW9kaWZpZXIoby5TdG10TW9kaWZpZXIuRXhwb3J0ZWQpKSB7XG4gICAgICB0aGlzLl9ldmFsRXhwb3J0ZWRWYXJzLnB1c2goc3RtdC5uYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLnZpc2l0RGVjbGFyZVZhclN0bXQoc3RtdCwgY3R4KTtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RGVjbGFyZUZ1bmN0aW9uU3RtdChzdG10OiBvLkRlY2xhcmVGdW5jdGlvblN0bXQsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBpZiAoc3RtdC5oYXNNb2RpZmllcihvLlN0bXRNb2RpZmllci5FeHBvcnRlZCkpIHtcbiAgICAgIHRoaXMuX2V2YWxFeHBvcnRlZFZhcnMucHVzaChzdG10Lm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gc3VwZXIudmlzaXREZWNsYXJlRnVuY3Rpb25TdG10KHN0bXQsIGN0eCk7XG4gIH1cblxuICBwcml2YXRlIF9lbWl0UmVmZXJlbmNlVG9FeHRlcm5hbChcbiAgICBhc3Q6IG8uRXhwcmVzc2lvbixcbiAgICB2YWx1ZTogYW55LFxuICAgIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0LFxuICApOiB2b2lkIHtcbiAgICBsZXQgaWQgPSB0aGlzLl9ldmFsQXJnVmFsdWVzLmluZGV4T2YodmFsdWUpO1xuICAgIGlmIChpZCA9PT0gLTEpIHtcbiAgICAgIGlkID0gdGhpcy5fZXZhbEFyZ1ZhbHVlcy5sZW5ndGg7XG4gICAgICB0aGlzLl9ldmFsQXJnVmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgY29uc3QgbmFtZSA9IGlkZW50aWZpZXJOYW1lKHtyZWZlcmVuY2U6IHZhbHVlfSkgfHwgJ3ZhbCc7XG4gICAgICB0aGlzLl9ldmFsQXJnTmFtZXMucHVzaChgaml0XyR7bmFtZX1fJHtpZH1gKTtcbiAgICB9XG4gICAgY3R4LnByaW50KGFzdCwgdGhpcy5fZXZhbEFyZ05hbWVzW2lkXSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNVc2VTdHJpY3RTdGF0ZW1lbnQoc3RhdGVtZW50OiBvLlN0YXRlbWVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3RhdGVtZW50LmlzRXF1aXZhbGVudChvLmxpdGVyYWwoJ3VzZSBzdHJpY3QnKS50b1N0bXQoKSk7XG59XG4iXX0=