/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
            statements = [
                o.literal('use strict').toStmt(),
                ...statements,
            ];
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
        const stmt = new o.ReturnStatement(new o.LiteralMapExpr(this._evalExportedVars.map(resultVar => new o.LiteralMapEntry(resultVar, o.variable(resultVar), false))));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0X2ppdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9vdXRwdXQvb3V0cHV0X2ppdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTdDLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3pELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9ELE9BQU8sS0FBSyxDQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ2xDLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBTXBFOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFlBQVk7SUFDdkI7Ozs7Ozs7O09BUUc7SUFDSCxrQkFBa0IsQ0FDZCxTQUFpQixFQUFFLFVBQXlCLEVBQUUsV0FBc0MsRUFDcEYsZ0JBQXlCO1FBQzNCLE1BQU0sU0FBUyxHQUFHLElBQUksaUJBQWlCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckQsTUFBTSxHQUFHLEdBQUcscUJBQXFCLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDL0MsMENBQTBDO1FBQzFDLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2xFLFVBQVUsR0FBRztnQkFDWCxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRTtnQkFDaEMsR0FBRyxVQUFVO2FBQ2QsQ0FBQztRQUNKLENBQUM7UUFDRCxTQUFTLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzlDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoQyxP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Q0FBQztJQUVPLHdCQUF3QixDQUFDLEdBQWlCLEVBQUUsS0FBVSxFQUFFLEdBQTBCO1FBRXhGLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZCxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7WUFDaEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEMsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBQyxDQUFDLElBQUksS0FBSyxDQUFDO1lBQ3pELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUNELEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0NBQ0Y7QUFHRCxTQUFTLG9CQUFvQixDQUFDLFNBQXNCO0lBQ2xELE9BQU8sU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDbEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2lkZW50aWZpZXJOYW1lfSBmcm9tICcuLi9wYXJzZV91dGlsJztcblxuaW1wb3J0IHtFbWl0dGVyVmlzaXRvckNvbnRleHR9IGZyb20gJy4vYWJzdHJhY3RfZW1pdHRlcic7XG5pbXBvcnQge0Fic3RyYWN0SnNFbWl0dGVyVmlzaXRvcn0gZnJvbSAnLi9hYnN0cmFjdF9qc19lbWl0dGVyJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXRfYXN0JztcbmltcG9ydCB7bmV3VHJ1c3RlZEZ1bmN0aW9uRm9ySklUfSBmcm9tICcuL291dHB1dF9qaXRfdHJ1c3RlZF90eXBlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRXh0ZXJuYWxSZWZlcmVuY2VSZXNvbHZlciB7XG4gIHJlc29sdmVFeHRlcm5hbFJlZmVyZW5jZShyZWY6IG8uRXh0ZXJuYWxSZWZlcmVuY2UpOiB1bmtub3duO1xufVxuXG4vKipcbiAqIEEgaGVscGVyIGNsYXNzIHRvIG1hbmFnZSB0aGUgZXZhbHVhdGlvbiBvZiBKSVQgZ2VuZXJhdGVkIGNvZGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBKaXRFdmFsdWF0b3Ige1xuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHNvdXJjZVVybCBUaGUgVVJMIG9mIHRoZSBnZW5lcmF0ZWQgY29kZS5cbiAgICogQHBhcmFtIHN0YXRlbWVudHMgQW4gYXJyYXkgb2YgQW5ndWxhciBzdGF0ZW1lbnQgQVNUIG5vZGVzIHRvIGJlIGV2YWx1YXRlZC5cbiAgICogQHBhcmFtIHJlZlJlc29sdmVyIFJlc29sdmVzIGBvLkV4dGVybmFsUmVmZXJlbmNlYHMgaW50byB2YWx1ZXMuXG4gICAqIEBwYXJhbSBjcmVhdGVTb3VyY2VNYXBzIElmIHRydWUgdGhlbiBjcmVhdGUgYSBzb3VyY2UtbWFwIGZvciB0aGUgZ2VuZXJhdGVkIGNvZGUgYW5kIGluY2x1ZGUgaXRcbiAgICogaW5saW5lIGFzIGEgc291cmNlLW1hcCBjb21tZW50LlxuICAgKiBAcmV0dXJucyBBIG1hcCBvZiBhbGwgdGhlIHZhcmlhYmxlcyBpbiB0aGUgZ2VuZXJhdGVkIGNvZGUuXG4gICAqL1xuICBldmFsdWF0ZVN0YXRlbWVudHMoXG4gICAgICBzb3VyY2VVcmw6IHN0cmluZywgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSwgcmVmUmVzb2x2ZXI6IEV4dGVybmFsUmVmZXJlbmNlUmVzb2x2ZXIsXG4gICAgICBjcmVhdGVTb3VyY2VNYXBzOiBib29sZWFuKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIGNvbnN0IGNvbnZlcnRlciA9IG5ldyBKaXRFbWl0dGVyVmlzaXRvcihyZWZSZXNvbHZlcik7XG4gICAgY29uc3QgY3R4ID0gRW1pdHRlclZpc2l0b3JDb250ZXh0LmNyZWF0ZVJvb3QoKTtcbiAgICAvLyBFbnN1cmUgZ2VuZXJhdGVkIGNvZGUgaXMgaW4gc3RyaWN0IG1vZGVcbiAgICBpZiAoc3RhdGVtZW50cy5sZW5ndGggPiAwICYmICFpc1VzZVN0cmljdFN0YXRlbWVudChzdGF0ZW1lbnRzWzBdKSkge1xuICAgICAgc3RhdGVtZW50cyA9IFtcbiAgICAgICAgby5saXRlcmFsKCd1c2Ugc3RyaWN0JykudG9TdG10KCksXG4gICAgICAgIC4uLnN0YXRlbWVudHMsXG4gICAgICBdO1xuICAgIH1cbiAgICBjb252ZXJ0ZXIudmlzaXRBbGxTdGF0ZW1lbnRzKHN0YXRlbWVudHMsIGN0eCk7XG4gICAgY29udmVydGVyLmNyZWF0ZVJldHVyblN0bXQoY3R4KTtcbiAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZUNvZGUoc291cmNlVXJsLCBjdHgsIGNvbnZlcnRlci5nZXRBcmdzKCksIGNyZWF0ZVNvdXJjZU1hcHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2YWx1YXRlIGEgcGllY2Ugb2YgSklUIGdlbmVyYXRlZCBjb2RlLlxuICAgKiBAcGFyYW0gc291cmNlVXJsIFRoZSBVUkwgb2YgdGhpcyBnZW5lcmF0ZWQgY29kZS5cbiAgICogQHBhcmFtIGN0eCBBIGNvbnRleHQgb2JqZWN0IHRoYXQgY29udGFpbnMgYW4gQVNUIG9mIHRoZSBjb2RlIHRvIGJlIGV2YWx1YXRlZC5cbiAgICogQHBhcmFtIHZhcnMgQSBtYXAgY29udGFpbmluZyB0aGUgbmFtZXMgYW5kIHZhbHVlcyBvZiB2YXJpYWJsZXMgdGhhdCB0aGUgZXZhbHVhdGVkIGNvZGUgbWlnaHRcbiAgICogcmVmZXJlbmNlLlxuICAgKiBAcGFyYW0gY3JlYXRlU291cmNlTWFwIElmIHRydWUgdGhlbiBjcmVhdGUgYSBzb3VyY2UtbWFwIGZvciB0aGUgZ2VuZXJhdGVkIGNvZGUgYW5kIGluY2x1ZGUgaXRcbiAgICogaW5saW5lIGFzIGEgc291cmNlLW1hcCBjb21tZW50LlxuICAgKiBAcmV0dXJucyBUaGUgcmVzdWx0IG9mIGV2YWx1YXRpbmcgdGhlIGNvZGUuXG4gICAqL1xuICBldmFsdWF0ZUNvZGUoXG4gICAgICBzb3VyY2VVcmw6IHN0cmluZywgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQsIHZhcnM6IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgICAgY3JlYXRlU291cmNlTWFwOiBib29sZWFuKTogYW55IHtcbiAgICBsZXQgZm5Cb2R5ID0gYFwidXNlIHN0cmljdFwiOyR7Y3R4LnRvU291cmNlKCl9XFxuLy8jIHNvdXJjZVVSTD0ke3NvdXJjZVVybH1gO1xuICAgIGNvbnN0IGZuQXJnTmFtZXM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgZm5BcmdWYWx1ZXM6IGFueVtdID0gW107XG4gICAgZm9yIChjb25zdCBhcmdOYW1lIGluIHZhcnMpIHtcbiAgICAgIGZuQXJnVmFsdWVzLnB1c2godmFyc1thcmdOYW1lXSk7XG4gICAgICBmbkFyZ05hbWVzLnB1c2goYXJnTmFtZSk7XG4gICAgfVxuICAgIGlmIChjcmVhdGVTb3VyY2VNYXApIHtcbiAgICAgIC8vIHVzaW5nIGBuZXcgRnVuY3Rpb24oLi4uKWAgZ2VuZXJhdGVzIGEgaGVhZGVyLCAxIGxpbmUgb2Ygbm8gYXJndW1lbnRzLCAyIGxpbmVzIG90aGVyd2lzZVxuICAgICAgLy8gRS5nLiBgYGBcbiAgICAgIC8vIGZ1bmN0aW9uIGFub255bW91cyhhLGIsY1xuICAgICAgLy8gLyoqLykgeyAuLi4gfWBgYFxuICAgICAgLy8gV2UgZG9uJ3Qgd2FudCB0byBoYXJkIGNvZGUgdGhpcyBmYWN0LCBzbyB3ZSBhdXRvIGRldGVjdCBpdCB2aWEgYW4gZW1wdHkgZnVuY3Rpb24gZmlyc3QuXG4gICAgICBjb25zdCBlbXB0eUZuID0gbmV3VHJ1c3RlZEZ1bmN0aW9uRm9ySklUKC4uLmZuQXJnTmFtZXMuY29uY2F0KCdyZXR1cm4gbnVsbDsnKSkudG9TdHJpbmcoKTtcbiAgICAgIGNvbnN0IGhlYWRlckxpbmVzID0gZW1wdHlGbi5zbGljZSgwLCBlbXB0eUZuLmluZGV4T2YoJ3JldHVybiBudWxsOycpKS5zcGxpdCgnXFxuJykubGVuZ3RoIC0gMTtcbiAgICAgIGZuQm9keSArPSBgXFxuJHtjdHgudG9Tb3VyY2VNYXBHZW5lcmF0b3Ioc291cmNlVXJsLCBoZWFkZXJMaW5lcykudG9Kc0NvbW1lbnQoKX1gO1xuICAgIH1cbiAgICBjb25zdCBmbiA9IG5ld1RydXN0ZWRGdW5jdGlvbkZvckpJVCguLi5mbkFyZ05hbWVzLmNvbmNhdChmbkJvZHkpKTtcbiAgICByZXR1cm4gdGhpcy5leGVjdXRlRnVuY3Rpb24oZm4sIGZuQXJnVmFsdWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGEgSklUIGdlbmVyYXRlZCBmdW5jdGlvbiBieSBjYWxsaW5nIGl0LlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbiBpbiB0ZXN0cyB0byBjYXB0dXJlIHRoZSBmdW5jdGlvbnMgdGhhdCBhcmUgZ2VuZXJhdGVkXG4gICAqIGJ5IHRoaXMgYEppdEV2YWx1YXRvcmAgY2xhc3MuXG4gICAqXG4gICAqIEBwYXJhbSBmbiBBIGZ1bmN0aW9uIHRvIGV4ZWN1dGUuXG4gICAqIEBwYXJhbSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgZnVuY3Rpb24gYmVpbmcgZXhlY3V0ZWQuXG4gICAqIEByZXR1cm5zIFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGV4ZWN1dGVkIGZ1bmN0aW9uLlxuICAgKi9cbiAgZXhlY3V0ZUZ1bmN0aW9uKGZuOiBGdW5jdGlvbiwgYXJnczogYW55W10pIHtcbiAgICByZXR1cm4gZm4oLi4uYXJncyk7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBBbmd1bGFyIEFTVCB2aXNpdG9yIHRoYXQgY29udmVydHMgQVNUIG5vZGVzIGludG8gZXhlY3V0YWJsZSBKYXZhU2NyaXB0IGNvZGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBKaXRFbWl0dGVyVmlzaXRvciBleHRlbmRzIEFic3RyYWN0SnNFbWl0dGVyVmlzaXRvciB7XG4gIHByaXZhdGUgX2V2YWxBcmdOYW1lczogc3RyaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSBfZXZhbEFyZ1ZhbHVlczogYW55W10gPSBbXTtcbiAgcHJpdmF0ZSBfZXZhbEV4cG9ydGVkVmFyczogc3RyaW5nW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlZlJlc29sdmVyOiBFeHRlcm5hbFJlZmVyZW5jZVJlc29sdmVyKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGNyZWF0ZVJldHVyblN0bXQoY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpIHtcbiAgICBjb25zdCBzdG10ID0gbmV3IG8uUmV0dXJuU3RhdGVtZW50KG5ldyBvLkxpdGVyYWxNYXBFeHByKHRoaXMuX2V2YWxFeHBvcnRlZFZhcnMubWFwKFxuICAgICAgICByZXN1bHRWYXIgPT4gbmV3IG8uTGl0ZXJhbE1hcEVudHJ5KHJlc3VsdFZhciwgby52YXJpYWJsZShyZXN1bHRWYXIpLCBmYWxzZSkpKSk7XG4gICAgc3RtdC52aXNpdFN0YXRlbWVudCh0aGlzLCBjdHgpO1xuICB9XG5cbiAgZ2V0QXJncygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgY29uc3QgcmVzdWx0OiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fZXZhbEFyZ05hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRbdGhpcy5fZXZhbEFyZ05hbWVzW2ldXSA9IHRoaXMuX2V2YWxBcmdWYWx1ZXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdEV4dGVybmFsRXhwcihhc3Q6IG8uRXh0ZXJuYWxFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgdGhpcy5fZW1pdFJlZmVyZW5jZVRvRXh0ZXJuYWwoYXN0LCB0aGlzLnJlZlJlc29sdmVyLnJlc29sdmVFeHRlcm5hbFJlZmVyZW5jZShhc3QudmFsdWUpLCBjdHgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgb3ZlcnJpZGUgdmlzaXRXcmFwcGVkTm9kZUV4cHIoYXN0OiBvLldyYXBwZWROb2RlRXhwcjxhbnk+LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgdGhpcy5fZW1pdFJlZmVyZW5jZVRvRXh0ZXJuYWwoYXN0LCBhc3Qubm9kZSwgY3R4KTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIG92ZXJyaWRlIHZpc2l0RGVjbGFyZVZhclN0bXQoc3RtdDogby5EZWNsYXJlVmFyU3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGlmIChzdG10Lmhhc01vZGlmaWVyKG8uU3RtdE1vZGlmaWVyLkV4cG9ydGVkKSkge1xuICAgICAgdGhpcy5fZXZhbEV4cG9ydGVkVmFycy5wdXNoKHN0bXQubmFtZSk7XG4gICAgfVxuICAgIHJldHVybiBzdXBlci52aXNpdERlY2xhcmVWYXJTdG10KHN0bXQsIGN0eCk7XG4gIH1cblxuICBvdmVycmlkZSB2aXNpdERlY2xhcmVGdW5jdGlvblN0bXQoc3RtdDogby5EZWNsYXJlRnVuY3Rpb25TdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgaWYgKHN0bXQuaGFzTW9kaWZpZXIoby5TdG10TW9kaWZpZXIuRXhwb3J0ZWQpKSB7XG4gICAgICB0aGlzLl9ldmFsRXhwb3J0ZWRWYXJzLnB1c2goc3RtdC5uYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLnZpc2l0RGVjbGFyZUZ1bmN0aW9uU3RtdChzdG10LCBjdHgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW1pdFJlZmVyZW5jZVRvRXh0ZXJuYWwoYXN0OiBvLkV4cHJlc3Npb24sIHZhbHVlOiBhbnksIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTpcbiAgICAgIHZvaWQge1xuICAgIGxldCBpZCA9IHRoaXMuX2V2YWxBcmdWYWx1ZXMuaW5kZXhPZih2YWx1ZSk7XG4gICAgaWYgKGlkID09PSAtMSkge1xuICAgICAgaWQgPSB0aGlzLl9ldmFsQXJnVmFsdWVzLmxlbmd0aDtcbiAgICAgIHRoaXMuX2V2YWxBcmdWYWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICBjb25zdCBuYW1lID0gaWRlbnRpZmllck5hbWUoe3JlZmVyZW5jZTogdmFsdWV9KSB8fCAndmFsJztcbiAgICAgIHRoaXMuX2V2YWxBcmdOYW1lcy5wdXNoKGBqaXRfJHtuYW1lfV8ke2lkfWApO1xuICAgIH1cbiAgICBjdHgucHJpbnQoYXN0LCB0aGlzLl9ldmFsQXJnTmFtZXNbaWRdKTtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGlzVXNlU3RyaWN0U3RhdGVtZW50KHN0YXRlbWVudDogby5TdGF0ZW1lbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIHN0YXRlbWVudC5pc0VxdWl2YWxlbnQoby5saXRlcmFsKCd1c2Ugc3RyaWN0JykudG9TdG10KCkpO1xufVxuIl19