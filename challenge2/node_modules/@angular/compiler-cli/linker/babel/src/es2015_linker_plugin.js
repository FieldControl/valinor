(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/babel/src/es2015_linker_plugin", ["require", "exports", "tslib", "@babel/types", "@angular/compiler-cli/linker", "@angular/compiler-cli/linker/babel/src/ast/babel_ast_factory", "@angular/compiler-cli/linker/babel/src/ast/babel_ast_host", "@angular/compiler-cli/linker/babel/src/babel_declaration_scope"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createEs2015LinkerPlugin = void 0;
    var tslib_1 = require("tslib");
    var t = require("@babel/types");
    var linker_1 = require("@angular/compiler-cli/linker");
    var babel_ast_factory_1 = require("@angular/compiler-cli/linker/babel/src/ast/babel_ast_factory");
    var babel_ast_host_1 = require("@angular/compiler-cli/linker/babel/src/ast/babel_ast_host");
    var babel_declaration_scope_1 = require("@angular/compiler-cli/linker/babel/src/babel_declaration_scope");
    /**
     * Create a Babel plugin that visits the program, identifying and linking partial declarations.
     *
     * The plugin delegates most of its work to a generic `FileLinker` for each file (`t.Program` in
     * Babel) that is visited.
     */
    function createEs2015LinkerPlugin(_a) {
        var fileSystem = _a.fileSystem, logger = _a.logger, options = tslib_1.__rest(_a, ["fileSystem", "logger"]);
        var fileLinker = null;
        return {
            visitor: {
                Program: {
                    /**
                     * Create a new `FileLinker` as we enter each file (`t.Program` in Babel).
                     */
                    enter: function (path) {
                        var _a, _b;
                        assertNull(fileLinker);
                        // Babel can be configured with a `filename` or `relativeFilename` (or both, or neither) -
                        // possibly relative to the optional `cwd` path.
                        var file = path.hub.file;
                        var filename = (_a = file.opts.filename) !== null && _a !== void 0 ? _a : file.opts.filenameRelative;
                        if (!filename) {
                            throw new Error('No filename (nor filenameRelative) provided by Babel. This is required for the linking of partially compiled directives and components.');
                        }
                        var sourceUrl = fileSystem.resolve((_b = file.opts.cwd) !== null && _b !== void 0 ? _b : '.', filename);
                        var linkerEnvironment = linker_1.LinkerEnvironment.create(fileSystem, logger, new babel_ast_host_1.BabelAstHost(), new babel_ast_factory_1.BabelAstFactory(sourceUrl), options);
                        fileLinker = new linker_1.FileLinker(linkerEnvironment, sourceUrl, file.code);
                    },
                    /**
                     * On exiting the file, insert any shared constant statements that were generated during
                     * linking of the partial declarations.
                     */
                    exit: function () {
                        var e_1, _a;
                        assertNotNull(fileLinker);
                        try {
                            for (var _b = tslib_1.__values(fileLinker.getConstantStatements()), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var _d = _c.value, constantScope = _d.constantScope, statements = _d.statements;
                                insertStatements(constantScope, statements);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        fileLinker = null;
                    }
                },
                /**
                 * Test each call expression to see if it is a partial declaration; it if is then replace it
                 * with the results of linking the declaration.
                 */
                CallExpression: function (call) {
                    if (fileLinker === null) {
                        // Any statements that are inserted upon program exit will be visited outside of an active
                        // linker context. These call expressions are known not to contain partial declarations,
                        // so it's safe to skip visiting those call expressions.
                        return;
                    }
                    try {
                        var calleeName = getCalleeName(call);
                        if (calleeName === null) {
                            return;
                        }
                        var args = call.node.arguments;
                        if (!fileLinker.isPartialDeclaration(calleeName) || !isExpressionArray(args)) {
                            return;
                        }
                        var declarationScope = new babel_declaration_scope_1.BabelDeclarationScope(call.scope);
                        var replacement = fileLinker.linkPartialDeclaration(calleeName, args, declarationScope);
                        call.replaceWith(replacement);
                    }
                    catch (e) {
                        var node = linker_1.isFatalLinkerError(e) ? e.node : call.node;
                        throw buildCodeFrameError(call.hub.file, e.message, node);
                    }
                }
            }
        };
    }
    exports.createEs2015LinkerPlugin = createEs2015LinkerPlugin;
    /**
     * Insert the `statements` at the location defined by `path`.
     *
     * The actual insertion strategy depends upon the type of the `path`.
     */
    function insertStatements(path, statements) {
        if (path.isFunction()) {
            insertIntoFunction(path, statements);
        }
        else if (path.isProgram()) {
            insertIntoProgram(path, statements);
        }
    }
    /**
     * Insert the `statements` at the top of the body of the `fn` function.
     */
    function insertIntoFunction(fn, statements) {
        var body = fn.get('body');
        body.unshiftContainer('body', statements);
    }
    /**
     * Insert the `statements` at the top of the `program`, below any import statements.
     */
    function insertIntoProgram(program, statements) {
        var body = program.get('body');
        var importStatements = body.filter(function (statement) { return statement.isImportDeclaration(); });
        if (importStatements.length === 0) {
            program.unshiftContainer('body', statements);
        }
        else {
            importStatements[importStatements.length - 1].insertAfter(statements);
        }
    }
    function getCalleeName(call) {
        var callee = call.node.callee;
        if (t.isIdentifier(callee)) {
            return callee.name;
        }
        else if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
            return callee.property.name;
        }
        else if (t.isMemberExpression(callee) && t.isStringLiteral(callee.property)) {
            return callee.property.value;
        }
        else {
            return null;
        }
    }
    /**
     * Return true if all the `nodes` are Babel expressions.
     */
    function isExpressionArray(nodes) {
        return nodes.every(function (node) { return t.isExpression(node); });
    }
    /**
     * Assert that the given `obj` is `null`.
     */
    function assertNull(obj) {
        if (obj !== null) {
            throw new Error('BUG - expected `obj` to be null');
        }
    }
    /**
     * Assert that the given `obj` is not `null`.
     */
    function assertNotNull(obj) {
        if (obj === null) {
            throw new Error('BUG - expected `obj` not to be null');
        }
    }
    /**
     * Create a string representation of an error that includes the code frame of the `node`.
     */
    function buildCodeFrameError(file, message, node) {
        var filename = file.opts.filename || '(unknown file)';
        var error = file.buildCodeFrameError(node, message);
        return filename + ": " + error.message;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXMyMDE1X2xpbmtlcl9wbHVnaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbGlua2VyL2JhYmVsL3NyYy9lczIwMTVfbGlua2VyX3BsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBU0EsZ0NBQWtDO0lBRWxDLHVEQUFrRjtJQUVsRixrR0FBd0Q7SUFDeEQsNEZBQWtEO0lBQ2xELDBHQUFtRjtJQUluRjs7Ozs7T0FLRztJQUNILFNBQWdCLHdCQUF3QixDQUFDLEVBQXFEO1FBQXBELElBQUEsVUFBVSxnQkFBQSxFQUFFLE1BQU0sWUFBQSxFQUFLLE9BQU8sc0JBQS9CLHdCQUFnQyxDQUFEO1FBRXRFLElBQUksVUFBVSxHQUFrRSxJQUFJLENBQUM7UUFFckYsT0FBTztZQUNMLE9BQU8sRUFBRTtnQkFDUCxPQUFPLEVBQUU7b0JBRVA7O3VCQUVHO29CQUNILEtBQUssRUFBTCxVQUFNLElBQXlCOzt3QkFDN0IsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUN2QiwwRkFBMEY7d0JBQzFGLGdEQUFnRDt3QkFDaEQsSUFBTSxJQUFJLEdBQWMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7d0JBQ3RDLElBQU0sUUFBUSxHQUFHLE1BQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLG1DQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7d0JBQ2xFLElBQUksQ0FBQyxRQUFRLEVBQUU7NEJBQ2IsTUFBTSxJQUFJLEtBQUssQ0FDWCx5SUFBeUksQ0FBQyxDQUFDO3lCQUNoSjt3QkFDRCxJQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLG1DQUFJLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzt3QkFFckUsSUFBTSxpQkFBaUIsR0FBRywwQkFBaUIs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SyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsVUFBVSxDQUFJLEdBQVc7UUFDaEMsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQztTQUNwRDtJQUNILENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsYUFBYSxDQUFJLEdBQVc7UUFDbkMsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztTQUN4RDtJQUNILENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsbUJBQW1CLENBQUMsSUFBZSxFQUFFLE9BQWUsRUFBRSxJQUFZO1FBQ3pFLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLGdCQUFnQixDQUFDO1FBQ3hELElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEQsT0FBVSxRQUFRLFVBQUssS0FBSyxDQUFDLE9BQVMsQ0FBQztJQUN6QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1BsdWdpbk9ian0gZnJvbSAnQGJhYmVsL2NvcmUnO1xuaW1wb3J0IHtOb2RlUGF0aH0gZnJvbSAnQGJhYmVsL3RyYXZlcnNlJztcbmltcG9ydCAqIGFzIHQgZnJvbSAnQGJhYmVsL3R5cGVzJztcblxuaW1wb3J0IHtGaWxlTGlua2VyLCBpc0ZhdGFsTGlua2VyRXJyb3IsIExpbmtlckVudmlyb25tZW50fSBmcm9tICcuLi8uLi8uLi9saW5rZXInO1xuXG5pbXBvcnQge0JhYmVsQXN0RmFjdG9yeX0gZnJvbSAnLi9hc3QvYmFiZWxfYXN0X2ZhY3RvcnknO1xuaW1wb3J0IHtCYWJlbEFzdEhvc3R9IGZyb20gJy4vYXN0L2JhYmVsX2FzdF9ob3N0JztcbmltcG9ydCB7QmFiZWxEZWNsYXJhdGlvblNjb3BlLCBDb25zdGFudFNjb3BlUGF0aH0gZnJvbSAnLi9iYWJlbF9kZWNsYXJhdGlvbl9zY29wZSc7XG5pbXBvcnQge0xpbmtlclBsdWdpbk9wdGlvbnN9IGZyb20gJy4vbGlua2VyX3BsdWdpbl9vcHRpb25zJztcblxuXG4vKipcbiAqIENyZWF0ZSBhIEJhYmVsIHBsdWdpbiB0aGF0IHZpc2l0cyB0aGUgcHJvZ3JhbSwgaWRlbnRpZnlpbmcgYW5kIGxpbmtpbmcgcGFydGlhbCBkZWNsYXJhdGlvbnMuXG4gKlxuICogVGhlIHBsdWdpbiBkZWxlZ2F0ZXMgbW9zdCBvZiBpdHMgd29yayB0byBhIGdlbmVyaWMgYEZpbGVMaW5rZXJgIGZvciBlYWNoIGZpbGUgKGB0LlByb2dyYW1gIGluXG4gKiBCYWJlbCkgdGhhdCBpcyB2aXNpdGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXMyMDE1TGlua2VyUGx1Z2luKHtmaWxlU3lzdGVtLCBsb2dnZXIsIC4uLm9wdGlvbnN9OiBMaW5rZXJQbHVnaW5PcHRpb25zKTpcbiAgICBQbHVnaW5PYmoge1xuICBsZXQgZmlsZUxpbmtlcjogRmlsZUxpbmtlcjxDb25zdGFudFNjb3BlUGF0aCwgdC5TdGF0ZW1lbnQsIHQuRXhwcmVzc2lvbj58bnVsbCA9IG51bGw7XG5cbiAgcmV0dXJuIHtcbiAgICB2aXNpdG9yOiB7XG4gICAgICBQcm9ncmFtOiB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBhIG5ldyBgRmlsZUxpbmtlcmAgYXMgd2UgZW50ZXIgZWFjaCBmaWxlIChgdC5Qcm9ncmFtYCBpbiBCYWJlbCkuXG4gICAgICAgICAqL1xuICAgICAgICBlbnRlcihwYXRoOiBOb2RlUGF0aDx0LlByb2dyYW0+KTogdm9pZCB7XG4gICAgICAgICAgYXNzZXJ0TnVsbChmaWxlTGlua2VyKTtcbiAgICAgICAgICAvLyBCYWJlbCBjYW4gYmUgY29uZmlndXJlZCB3aXRoIGEgYGZpbGVuYW1lYCBvciBgcmVsYXRpdmVGaWxlbmFtZWAgKG9yIGJvdGgsIG9yIG5laXRoZXIpIC1cbiAgICAgICAgICAvLyBwb3NzaWJseSByZWxhdGl2ZSB0byB0aGUgb3B0aW9uYWwgYGN3ZGAgcGF0aC5cbiAgICAgICAgICBjb25zdCBmaWxlOiBCYWJlbEZpbGUgPSBwYXRoLmh1Yi5maWxlO1xuICAgICAgICAgIGNvbnN0IGZpbGVuYW1lID0gZmlsZS5vcHRzLmZpbGVuYW1lID8/IGZpbGUub3B0cy5maWxlbmFtZVJlbGF0aXZlO1xuICAgICAgICAgIGlmICghZmlsZW5hbWUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAnTm8gZmlsZW5hbWUgKG5vciBmaWxlbmFtZVJlbGF0aXZlKSBwcm92aWRlZCBieSBCYWJlbC4gVGhpcyBpcyByZXF1aXJlZCBmb3IgdGhlIGxpbmtpbmcgb2YgcGFydGlhbGx5IGNvbXBpbGVkIGRpcmVjdGl2ZXMgYW5kIGNvbXBvbmVudHMuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHNvdXJjZVVybCA9IGZpbGVTeXN0ZW0ucmVzb2x2ZShmaWxlLm9wdHMuY3dkID8/ICcuJywgZmlsZW5hbWUpO1xuXG4gICAgICAgICAgY29uc3QgbGlua2VyRW52aXJvbm1lbnQgPSBMaW5rZXJFbnZpcm9ubWVudC5jcmVhdGU8dC5TdGF0ZW1lbnQsIHQuRXhwcmVzc2lvbj4oXG4gICAgICAgICAgICAgIGZpbGVTeXN0ZW0sIGxvZ2dlciwgbmV3IEJhYmVsQXN0SG9zdCgpLCBuZXcgQmFiZWxBc3RGYWN0b3J5KHNvdXJjZVVybCksIG9wdGlvbnMpO1xuICAgICAgICAgIGZpbGVMaW5rZXIgPSBuZXcgRmlsZUxpbmtlcihsaW5rZXJFbnZpcm9ubWVudCwgc291cmNlVXJsLCBmaWxlLmNvZGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPbiBleGl0aW5nIHRoZSBmaWxlLCBpbnNlcnQgYW55IHNoYXJlZCBjb25zdGFudCBzdGF0ZW1lbnRzIHRoYXQgd2VyZSBnZW5lcmF0ZWQgZHVyaW5nXG4gICAgICAgICAqIGxpbmtpbmcgb2YgdGhlIHBhcnRpYWwgZGVjbGFyYXRpb25zLlxuICAgICAgICAgKi9cbiAgICAgICAgZXhpdCgpOiB2b2lkIHtcbiAgICAgICAgICBhc3NlcnROb3ROdWxsKGZpbGVMaW5rZXIpO1xuICAgICAgICAgIGZvciAoY29uc3Qge2NvbnN0YW50U2NvcGUsIHN0YXRlbWVudHN9IG9mIGZpbGVMaW5rZXIuZ2V0Q29uc3RhbnRTdGF0ZW1lbnRzKCkpIHtcbiAgICAgICAgICAgIGluc2VydFN0YXRlbWVudHMoY29uc3RhbnRTY29wZSwgc3RhdGVtZW50cyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpbGVMaW5rZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIFRlc3QgZWFjaCBjYWxsIGV4cHJlc3Npb24gdG8gc2VlIGlmIGl0IGlzIGEgcGFydGlhbCBkZWNsYXJhdGlvbjsgaXQgaWYgaXMgdGhlbiByZXBsYWNlIGl0XG4gICAgICAgKiB3aXRoIHRoZSByZXN1bHRzIG9mIGxpbmtpbmcgdGhlIGRlY2xhcmF0aW9uLlxuICAgICAgICovXG4gICAgICBDYWxsRXhwcmVzc2lvbihjYWxsOiBOb2RlUGF0aDx0LkNhbGxFeHByZXNzaW9uPik6IHZvaWQge1xuICAgICAgICBpZiAoZmlsZUxpbmtlciA9PT0gbnVsbCkge1xuICAgICAgICAgIC8vIEFueSBzdGF0ZW1lbnRzIHRoYXQgYXJlIGluc2VydGVkIHVwb24gcHJvZ3JhbSBleGl0IHdpbGwgYmUgdmlzaXRlZCBvdXRzaWRlIG9mIGFuIGFjdGl2ZVxuICAgICAgICAgIC8vIGxpbmtlciBjb250ZXh0LiBUaGVzZSBjYWxsIGV4cHJlc3Npb25zIGFyZSBrbm93biBub3QgdG8gY29udGFpbiBwYXJ0aWFsIGRlY2xhcmF0aW9ucyxcbiAgICAgICAgICAvLyBzbyBpdCdzIHNhZmUgdG8gc2tpcCB2aXNpdGluZyB0aG9zZSBjYWxsIGV4cHJlc3Npb25zLlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgY2FsbGVlTmFtZSA9IGdldENhbGxlZU5hbWUoY2FsbCk7XG4gICAgICAgICAgaWYgKGNhbGxlZU5hbWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgYXJncyA9IGNhbGwubm9kZS5hcmd1bWVudHM7XG4gICAgICAgICAgaWYgKCFmaWxlTGlua2VyLmlzUGFydGlhbERlY2xhcmF0aW9uKGNhbGxlZU5hbWUpIHx8ICFpc0V4cHJlc3Npb25BcnJheShhcmdzKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGRlY2xhcmF0aW9uU2NvcGUgPSBuZXcgQmFiZWxEZWNsYXJhdGlvblNjb3BlKGNhbGwuc2NvcGUpO1xuICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50ID0gZmlsZUxpbmtlci5saW5rUGFydGlhbERlY2xhcmF0aW9uKGNhbGxlZU5hbWUsIGFyZ3MsIGRlY2xhcmF0aW9uU2NvcGUpO1xuXG4gICAgICAgICAgY2FsbC5yZXBsYWNlV2l0aChyZXBsYWNlbWVudCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zdCBub2RlID0gaXNGYXRhbExpbmtlckVycm9yKGUpID8gZS5ub2RlIGFzIHQuTm9kZSA6IGNhbGwubm9kZTtcbiAgICAgICAgICB0aHJvdyBidWlsZENvZGVGcmFtZUVycm9yKGNhbGwuaHViLmZpbGUsIGUubWVzc2FnZSwgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogSW5zZXJ0IHRoZSBgc3RhdGVtZW50c2AgYXQgdGhlIGxvY2F0aW9uIGRlZmluZWQgYnkgYHBhdGhgLlxuICpcbiAqIFRoZSBhY3R1YWwgaW5zZXJ0aW9uIHN0cmF0ZWd5IGRlcGVuZHMgdXBvbiB0aGUgdHlwZSBvZiB0aGUgYHBhdGhgLlxuICovXG5mdW5jdGlvbiBpbnNlcnRTdGF0ZW1lbnRzKHBhdGg6IENvbnN0YW50U2NvcGVQYXRoLCBzdGF0ZW1lbnRzOiB0LlN0YXRlbWVudFtdKTogdm9pZCB7XG4gIGlmIChwYXRoLmlzRnVuY3Rpb24oKSkge1xuICAgIGluc2VydEludG9GdW5jdGlvbihwYXRoLCBzdGF0ZW1lbnRzKTtcbiAgfSBlbHNlIGlmIChwYXRoLmlzUHJvZ3JhbSgpKSB7XG4gICAgaW5zZXJ0SW50b1Byb2dyYW0ocGF0aCwgc3RhdGVtZW50cyk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbnNlcnQgdGhlIGBzdGF0ZW1lbnRzYCBhdCB0aGUgdG9wIG9mIHRoZSBib2R5IG9mIHRoZSBgZm5gIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBpbnNlcnRJbnRvRnVuY3Rpb24oZm46IE5vZGVQYXRoPHQuRnVuY3Rpb24+LCBzdGF0ZW1lbnRzOiB0LlN0YXRlbWVudFtdKTogdm9pZCB7XG4gIGNvbnN0IGJvZHkgPSBmbi5nZXQoJ2JvZHknKTtcbiAgYm9keS51bnNoaWZ0Q29udGFpbmVyKCdib2R5Jywgc3RhdGVtZW50cyk7XG59XG5cbi8qKlxuICogSW5zZXJ0IHRoZSBgc3RhdGVtZW50c2AgYXQgdGhlIHRvcCBvZiB0aGUgYHByb2dyYW1gLCBiZWxvdyBhbnkgaW1wb3J0IHN0YXRlbWVudHMuXG4gKi9cbmZ1bmN0aW9uIGluc2VydEludG9Qcm9ncmFtKHByb2dyYW06IE5vZGVQYXRoPHQuUHJvZ3JhbT4sIHN0YXRlbWVudHM6IHQuU3RhdGVtZW50W10pOiB2b2lkIHtcbiAgY29uc3QgYm9keSA9IHByb2dyYW0uZ2V0KCdib2R5Jyk7XG4gIGNvbnN0IGltcG9ydFN0YXRlbWVudHMgPSBib2R5LmZpbHRlcihzdGF0ZW1lbnQgPT4gc3RhdGVtZW50LmlzSW1wb3J0RGVjbGFyYXRpb24oKSk7XG4gIGlmIChpbXBvcnRTdGF0ZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHByb2dyYW0udW5zaGlmdENvbnRhaW5lcignYm9keScsIHN0YXRlbWVudHMpO1xuICB9IGVsc2Uge1xuICAgIGltcG9ydFN0YXRlbWVudHNbaW1wb3J0U3RhdGVtZW50cy5sZW5ndGggLSAxXS5pbnNlcnRBZnRlcihzdGF0ZW1lbnRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRDYWxsZWVOYW1lKGNhbGw6IE5vZGVQYXRoPHQuQ2FsbEV4cHJlc3Npb24+KTogc3RyaW5nfG51bGwge1xuICBjb25zdCBjYWxsZWUgPSBjYWxsLm5vZGUuY2FsbGVlO1xuICBpZiAodC5pc0lkZW50aWZpZXIoY2FsbGVlKSkge1xuICAgIHJldHVybiBjYWxsZWUubmFtZTtcbiAgfSBlbHNlIGlmICh0LmlzTWVtYmVyRXhwcmVzc2lvbihjYWxsZWUpICYmIHQuaXNJZGVudGlmaWVyKGNhbGxlZS5wcm9wZXJ0eSkpIHtcbiAgICByZXR1cm4gY2FsbGVlLnByb3BlcnR5Lm5hbWU7XG4gIH0gZWxzZSBpZiAodC5pc01lbWJlckV4cHJlc3Npb24oY2FsbGVlKSAmJiB0LmlzU3RyaW5nTGl0ZXJhbChjYWxsZWUucHJvcGVydHkpKSB7XG4gICAgcmV0dXJuIGNhbGxlZS5wcm9wZXJ0eS52YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybiB0cnVlIGlmIGFsbCB0aGUgYG5vZGVzYCBhcmUgQmFiZWwgZXhwcmVzc2lvbnMuXG4gKi9cbmZ1bmN0aW9uIGlzRXhwcmVzc2lvbkFycmF5KG5vZGVzOiB0Lk5vZGVbXSk6IG5vZGVzIGlzIHQuRXhwcmVzc2lvbltdIHtcbiAgcmV0dXJuIG5vZGVzLmV2ZXJ5KG5vZGUgPT4gdC5pc0V4cHJlc3Npb24obm9kZSkpO1xufVxuXG4vKipcbiAqIEFzc2VydCB0aGF0IHRoZSBnaXZlbiBgb2JqYCBpcyBgbnVsbGAuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE51bGw8VD4ob2JqOiBUfG51bGwpOiBhc3NlcnRzIG9iaiBpcyBudWxsIHtcbiAgaWYgKG9iaiAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignQlVHIC0gZXhwZWN0ZWQgYG9iamAgdG8gYmUgbnVsbCcpO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoYXQgdGhlIGdpdmVuIGBvYmpgIGlzIG5vdCBgbnVsbGAuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vdE51bGw8VD4ob2JqOiBUfG51bGwpOiBhc3NlcnRzIG9iaiBpcyBUIHtcbiAgaWYgKG9iaiA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignQlVHIC0gZXhwZWN0ZWQgYG9iamAgbm90IHRvIGJlIG51bGwnKTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhbiBlcnJvciB0aGF0IGluY2x1ZGVzIHRoZSBjb2RlIGZyYW1lIG9mIHRoZSBgbm9kZWAuXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkQ29kZUZyYW1lRXJyb3IoZmlsZTogQmFiZWxGaWxlLCBtZXNzYWdlOiBzdHJpbmcsIG5vZGU6IHQuTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IGZpbGVuYW1lID0gZmlsZS5vcHRzLmZpbGVuYW1lIHx8ICcodW5rbm93biBmaWxlKSc7XG4gIGNvbnN0IGVycm9yID0gZmlsZS5idWlsZENvZGVGcmFtZUVycm9yKG5vZGUsIG1lc3NhZ2UpO1xuICByZXR1cm4gYCR7ZmlsZW5hbWV9OiAke2Vycm9yLm1lc3NhZ2V9YDtcbn1cblxuLyoqXG4gKiBUaGlzIGludGVyZmFjZSBpcyBtYWtpbmcgdXAgZm9yIHRoZSBmYWN0IHRoYXQgdGhlIEJhYmVsIHR5cGluZ3MgZm9yIGBOb2RlUGF0aC5odWIuZmlsZWAgYXJlXG4gKiBsYWNraW5nLlxuICovXG5pbnRlcmZhY2UgQmFiZWxGaWxlIHtcbiAgY29kZTogc3RyaW5nO1xuICBvcHRzOiB7XG4gICAgZmlsZW5hbWU/OiBzdHJpbmcsXG4gICAgZmlsZW5hbWVSZWxhdGl2ZT86IHN0cmluZyxcbiAgICBjd2Q/OiBzdHJpbmcsXG4gIH07XG5cbiAgYnVpbGRDb2RlRnJhbWVFcnJvcihub2RlOiB0Lk5vZGUsIG1lc3NhZ2U6IHN0cmluZyk6IEVycm9yO1xufVxuIl19