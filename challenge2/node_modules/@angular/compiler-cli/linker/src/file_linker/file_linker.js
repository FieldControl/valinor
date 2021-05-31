(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/file_linker/file_linker", ["require", "exports", "tslib", "@angular/compiler-cli/linker/src/ast/ast_value", "@angular/compiler-cli/linker/src/file_linker/emit_scopes/emit_scope", "@angular/compiler-cli/linker/src/file_linker/emit_scopes/iife_emit_scope", "@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_linker_selector"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileLinker = exports.NO_STATEMENTS = void 0;
    var tslib_1 = require("tslib");
    var ast_value_1 = require("@angular/compiler-cli/linker/src/ast/ast_value");
    var emit_scope_1 = require("@angular/compiler-cli/linker/src/file_linker/emit_scopes/emit_scope");
    var iife_emit_scope_1 = require("@angular/compiler-cli/linker/src/file_linker/emit_scopes/iife_emit_scope");
    var partial_linker_selector_1 = require("@angular/compiler-cli/linker/src/file_linker/partial_linkers/partial_linker_selector");
    exports.NO_STATEMENTS = [];
    /**
     * This class is responsible for linking all the partial declarations found in a single file.
     */
    var FileLinker = /** @class */ (function () {
        function FileLinker(linkerEnvironment, sourceUrl, code) {
            this.linkerEnvironment = linkerEnvironment;
            this.emitScopes = new Map();
            this.linkerSelector = new partial_linker_selector_1.PartialLinkerSelector(partial_linker_selector_1.createLinkerMap(this.linkerEnvironment, sourceUrl, code), this.linkerEnvironment.logger, this.linkerEnvironment.options.unknownDeclarationVersionHandling);
        }
        /**
         * Return true if the given callee name matches a partial declaration that can be linked.
         */
        FileLinker.prototype.isPartialDeclaration = function (calleeName) {
            return this.linkerSelector.supportsDeclaration(calleeName);
        };
        /**
         * Link the metadata extracted from the args of a call to a partial declaration function.
         *
         * The `declarationScope` is used to determine the scope and strategy of emission of the linked
         * definition and any shared constant statements.
         *
         * @param declarationFn the name of the function used to declare the partial declaration - e.g.
         *     `ɵɵngDeclareDirective`.
         * @param args the arguments passed to the declaration function, should be a single object that
         *     corresponds to the `R3DeclareDirectiveMetadata` or `R3DeclareComponentMetadata` interfaces.
         * @param declarationScope the scope that contains this call to the declaration function.
         */
        FileLinker.prototype.linkPartialDeclaration = function (declarationFn, args, declarationScope) {
            if (args.length !== 1) {
                throw new Error("Invalid function call: It should have only a single object literal argument, but contained " + args.length + ".");
            }
            var metaObj = ast_value_1.AstObject.parse(args[0], this.linkerEnvironment.host);
            var ngImport = metaObj.getNode('ngImport');
            var emitScope = this.getEmitScope(ngImport, declarationScope);
            var minVersion = metaObj.getString('minVersion');
            var version = metaObj.getString('version');
            var linker = this.linkerSelector.getLinker(declarationFn, minVersion, version);
            var definition = linker.linkPartialDeclaration(emitScope.constantPool, metaObj);
            return emitScope.translateDefinition(definition);
        };
        /**
         * Return all the shared constant statements and their associated constant scope references, so
         * that they can be inserted into the source code.
         */
        FileLinker.prototype.getConstantStatements = function () {
            var e_1, _a;
            var results = [];
            try {
                for (var _b = tslib_1.__values(this.emitScopes.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 2), constantScope = _d[0], emitScope = _d[1];
                    var statements = emitScope.getConstantStatements();
                    results.push({ constantScope: constantScope, statements: statements });
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return results;
        };
        FileLinker.prototype.getEmitScope = function (ngImport, declarationScope) {
            var constantScope = declarationScope.getConstantScopeRef(ngImport);
            if (constantScope === null) {
                // There is no constant scope so we will emit extra statements into the definition IIFE.
                return new iife_emit_scope_1.IifeEmitScope(ngImport, this.linkerEnvironment.translator, this.linkerEnvironment.factory);
            }
            if (!this.emitScopes.has(constantScope)) {
                this.emitScopes.set(constantScope, new emit_scope_1.EmitScope(ngImport, this.linkerEnvironment.translator));
            }
            return this.emitScopes.get(constantScope);
        };
        return FileLinker;
    }());
    exports.FileLinker = FileLinker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9saW5rZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbGlua2VyL3NyYy9maWxlX2xpbmtlci9maWxlX2xpbmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBU0EsNEVBQTJDO0lBRTNDLGtHQUFtRDtJQUNuRCw0R0FBNEQ7SUFFNUQsZ0lBQWlHO0lBRXBGLFFBQUEsYUFBYSxHQUFvQixFQUFXLENBQUM7SUFFMUQ7O09BRUc7SUFDSDtRQUlFLG9CQUNZLGlCQUE2RCxFQUNyRSxTQUF5QixFQUFFLElBQVk7WUFEL0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUE0QztZQUhqRSxlQUFVLEdBQUcsSUFBSSxHQUFHLEVBQXNELENBQUM7WUFLakYsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLCtDQUFxQixDQUMzQyx5Q0FBZSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFDdkYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFFRDs7V0FFRztRQUNILHlDQUFvQixHQUFwQixVQUFxQixVQUFrQjtZQUNyQyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVEOzs7Ozs7Ozs7OztXQVdHO1FBQ0gsMkNBQXNCLEdBQXRCLFVBQ0ksYUFBcUIsRUFBRSxJQUFtQixFQUMxQyxnQkFBK0Q7WUFDakUsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDckIsTUFBTSxJQUFJLEtBQUssQ0FDWCxnR0FDSSxJQUFJLENBQUMsTUFBTSxNQUFHLENBQUMsQ0FBQzthQUN6QjtZQUVELElBQU0sT0FBTyxHQUNULHFCQUFTLENBQUMsS0FBSyxDQUFvQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdGLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0MsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUVoRSxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ25ELElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDN0MsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNqRixJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUVsRixPQUFPLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsMENBQXFCLEdBQXJCOztZQUNFLElBQU0sT0FBTyxHQUFnRSxFQUFFLENBQUM7O2dCQUNoRixLQUF5QyxJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQSxnQkFBQSw0QkFBRTtvQkFBekQsSUFBQSxLQUFBLDJCQUEwQixFQUF6QixhQUFhLFFBQUEsRUFBRSxTQUFTLFFBQUE7b0JBQ2xDLElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO29CQUNyRCxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUMsYUFBYSxlQUFBLEVBQUUsVUFBVSxZQUFBLEVBQUMsQ0FBQyxDQUFDO2lCQUMzQzs7Ozs7Ozs7O1lBQ0QsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUVPLGlDQUFZLEdBQXBCLFVBQ0ksUUFBcUIsRUFBRSxnQkFBK0Q7WUFFeEYsSUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckUsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFO2dCQUMxQix3RkFBd0Y7Z0JBQ3hGLE9BQU8sSUFBSSwrQkFBYSxDQUNwQixRQUFRLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDbEY7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUNmLGFBQWEsRUFBRSxJQUFJLHNCQUFTLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2FBQ2hGO1lBQ0QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUUsQ0FBQztRQUM3QyxDQUFDO1FBQ0gsaUJBQUM7SUFBRCxDQUFDLEFBbEZELElBa0ZDO0lBbEZZLGdDQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1IzUGFydGlhbERlY2xhcmF0aW9ufSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRofSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtBc3RPYmplY3R9IGZyb20gJy4uL2FzdC9hc3RfdmFsdWUnO1xuaW1wb3J0IHtEZWNsYXJhdGlvblNjb3BlfSBmcm9tICcuL2RlY2xhcmF0aW9uX3Njb3BlJztcbmltcG9ydCB7RW1pdFNjb3BlfSBmcm9tICcuL2VtaXRfc2NvcGVzL2VtaXRfc2NvcGUnO1xuaW1wb3J0IHtJaWZlRW1pdFNjb3BlfSBmcm9tICcuL2VtaXRfc2NvcGVzL2lpZmVfZW1pdF9zY29wZSc7XG5pbXBvcnQge0xpbmtlckVudmlyb25tZW50fSBmcm9tICcuL2xpbmtlcl9lbnZpcm9ubWVudCc7XG5pbXBvcnQge2NyZWF0ZUxpbmtlck1hcCwgUGFydGlhbExpbmtlclNlbGVjdG9yfSBmcm9tICcuL3BhcnRpYWxfbGlua2Vycy9wYXJ0aWFsX2xpbmtlcl9zZWxlY3Rvcic7XG5cbmV4cG9ydCBjb25zdCBOT19TVEFURU1FTlRTOiBSZWFkb25seTxhbnlbXT4gPSBbXSBhcyBjb25zdDtcblxuLyoqXG4gKiBUaGlzIGNsYXNzIGlzIHJlc3BvbnNpYmxlIGZvciBsaW5raW5nIGFsbCB0aGUgcGFydGlhbCBkZWNsYXJhdGlvbnMgZm91bmQgaW4gYSBzaW5nbGUgZmlsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEZpbGVMaW5rZXI8VENvbnN0YW50U2NvcGUsIFRTdGF0ZW1lbnQsIFRFeHByZXNzaW9uPiB7XG4gIHByaXZhdGUgbGlua2VyU2VsZWN0b3I6IFBhcnRpYWxMaW5rZXJTZWxlY3RvcjxURXhwcmVzc2lvbj47XG4gIHByaXZhdGUgZW1pdFNjb3BlcyA9IG5ldyBNYXA8VENvbnN0YW50U2NvcGUsIEVtaXRTY29wZTxUU3RhdGVtZW50LCBURXhwcmVzc2lvbj4+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGxpbmtlckVudmlyb25tZW50OiBMaW5rZXJFbnZpcm9ubWVudDxUU3RhdGVtZW50LCBURXhwcmVzc2lvbj4sXG4gICAgICBzb3VyY2VVcmw6IEFic29sdXRlRnNQYXRoLCBjb2RlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmxpbmtlclNlbGVjdG9yID0gbmV3IFBhcnRpYWxMaW5rZXJTZWxlY3RvcjxURXhwcmVzc2lvbj4oXG4gICAgICAgIGNyZWF0ZUxpbmtlck1hcCh0aGlzLmxpbmtlckVudmlyb25tZW50LCBzb3VyY2VVcmwsIGNvZGUpLCB0aGlzLmxpbmtlckVudmlyb25tZW50LmxvZ2dlcixcbiAgICAgICAgdGhpcy5saW5rZXJFbnZpcm9ubWVudC5vcHRpb25zLnVua25vd25EZWNsYXJhdGlvblZlcnNpb25IYW5kbGluZyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIGdpdmVuIGNhbGxlZSBuYW1lIG1hdGNoZXMgYSBwYXJ0aWFsIGRlY2xhcmF0aW9uIHRoYXQgY2FuIGJlIGxpbmtlZC5cbiAgICovXG4gIGlzUGFydGlhbERlY2xhcmF0aW9uKGNhbGxlZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxpbmtlclNlbGVjdG9yLnN1cHBvcnRzRGVjbGFyYXRpb24oY2FsbGVlTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogTGluayB0aGUgbWV0YWRhdGEgZXh0cmFjdGVkIGZyb20gdGhlIGFyZ3Mgb2YgYSBjYWxsIHRvIGEgcGFydGlhbCBkZWNsYXJhdGlvbiBmdW5jdGlvbi5cbiAgICpcbiAgICogVGhlIGBkZWNsYXJhdGlvblNjb3BlYCBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgc2NvcGUgYW5kIHN0cmF0ZWd5IG9mIGVtaXNzaW9uIG9mIHRoZSBsaW5rZWRcbiAgICogZGVmaW5pdGlvbiBhbmQgYW55IHNoYXJlZCBjb25zdGFudCBzdGF0ZW1lbnRzLlxuICAgKlxuICAgKiBAcGFyYW0gZGVjbGFyYXRpb25GbiB0aGUgbmFtZSBvZiB0aGUgZnVuY3Rpb24gdXNlZCB0byBkZWNsYXJlIHRoZSBwYXJ0aWFsIGRlY2xhcmF0aW9uIC0gZS5nLlxuICAgKiAgICAgYMm1ybVuZ0RlY2xhcmVEaXJlY3RpdmVgLlxuICAgKiBAcGFyYW0gYXJncyB0aGUgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgZGVjbGFyYXRpb24gZnVuY3Rpb24sIHNob3VsZCBiZSBhIHNpbmdsZSBvYmplY3QgdGhhdFxuICAgKiAgICAgY29ycmVzcG9uZHMgdG8gdGhlIGBSM0RlY2xhcmVEaXJlY3RpdmVNZXRhZGF0YWAgb3IgYFIzRGVjbGFyZUNvbXBvbmVudE1ldGFkYXRhYCBpbnRlcmZhY2VzLlxuICAgKiBAcGFyYW0gZGVjbGFyYXRpb25TY29wZSB0aGUgc2NvcGUgdGhhdCBjb250YWlucyB0aGlzIGNhbGwgdG8gdGhlIGRlY2xhcmF0aW9uIGZ1bmN0aW9uLlxuICAgKi9cbiAgbGlua1BhcnRpYWxEZWNsYXJhdGlvbihcbiAgICAgIGRlY2xhcmF0aW9uRm46IHN0cmluZywgYXJnczogVEV4cHJlc3Npb25bXSxcbiAgICAgIGRlY2xhcmF0aW9uU2NvcGU6IERlY2xhcmF0aW9uU2NvcGU8VENvbnN0YW50U2NvcGUsIFRFeHByZXNzaW9uPik6IFRFeHByZXNzaW9uIHtcbiAgICBpZiAoYXJncy5sZW5ndGggIT09IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgSW52YWxpZCBmdW5jdGlvbiBjYWxsOiBJdCBzaG91bGQgaGF2ZSBvbmx5IGEgc2luZ2xlIG9iamVjdCBsaXRlcmFsIGFyZ3VtZW50LCBidXQgY29udGFpbmVkICR7XG4gICAgICAgICAgICAgIGFyZ3MubGVuZ3RofS5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXRhT2JqID1cbiAgICAgICAgQXN0T2JqZWN0LnBhcnNlPFIzUGFydGlhbERlY2xhcmF0aW9uLCBURXhwcmVzc2lvbj4oYXJnc1swXSwgdGhpcy5saW5rZXJFbnZpcm9ubWVudC5ob3N0KTtcbiAgICBjb25zdCBuZ0ltcG9ydCA9IG1ldGFPYmouZ2V0Tm9kZSgnbmdJbXBvcnQnKTtcbiAgICBjb25zdCBlbWl0U2NvcGUgPSB0aGlzLmdldEVtaXRTY29wZShuZ0ltcG9ydCwgZGVjbGFyYXRpb25TY29wZSk7XG5cbiAgICBjb25zdCBtaW5WZXJzaW9uID0gbWV0YU9iai5nZXRTdHJpbmcoJ21pblZlcnNpb24nKTtcbiAgICBjb25zdCB2ZXJzaW9uID0gbWV0YU9iai5nZXRTdHJpbmcoJ3ZlcnNpb24nKTtcbiAgICBjb25zdCBsaW5rZXIgPSB0aGlzLmxpbmtlclNlbGVjdG9yLmdldExpbmtlcihkZWNsYXJhdGlvbkZuLCBtaW5WZXJzaW9uLCB2ZXJzaW9uKTtcbiAgICBjb25zdCBkZWZpbml0aW9uID0gbGlua2VyLmxpbmtQYXJ0aWFsRGVjbGFyYXRpb24oZW1pdFNjb3BlLmNvbnN0YW50UG9vbCwgbWV0YU9iaik7XG5cbiAgICByZXR1cm4gZW1pdFNjb3BlLnRyYW5zbGF0ZURlZmluaXRpb24oZGVmaW5pdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFsbCB0aGUgc2hhcmVkIGNvbnN0YW50IHN0YXRlbWVudHMgYW5kIHRoZWlyIGFzc29jaWF0ZWQgY29uc3RhbnQgc2NvcGUgcmVmZXJlbmNlcywgc29cbiAgICogdGhhdCB0aGV5IGNhbiBiZSBpbnNlcnRlZCBpbnRvIHRoZSBzb3VyY2UgY29kZS5cbiAgICovXG4gIGdldENvbnN0YW50U3RhdGVtZW50cygpOiB7Y29uc3RhbnRTY29wZTogVENvbnN0YW50U2NvcGUsIHN0YXRlbWVudHM6IFRTdGF0ZW1lbnRbXX1bXSB7XG4gICAgY29uc3QgcmVzdWx0czoge2NvbnN0YW50U2NvcGU6IFRDb25zdGFudFNjb3BlLCBzdGF0ZW1lbnRzOiBUU3RhdGVtZW50W119W10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IFtjb25zdGFudFNjb3BlLCBlbWl0U2NvcGVdIG9mIHRoaXMuZW1pdFNjb3Blcy5lbnRyaWVzKCkpIHtcbiAgICAgIGNvbnN0IHN0YXRlbWVudHMgPSBlbWl0U2NvcGUuZ2V0Q29uc3RhbnRTdGF0ZW1lbnRzKCk7XG4gICAgICByZXN1bHRzLnB1c2goe2NvbnN0YW50U2NvcGUsIHN0YXRlbWVudHN9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICBwcml2YXRlIGdldEVtaXRTY29wZShcbiAgICAgIG5nSW1wb3J0OiBURXhwcmVzc2lvbiwgZGVjbGFyYXRpb25TY29wZTogRGVjbGFyYXRpb25TY29wZTxUQ29uc3RhbnRTY29wZSwgVEV4cHJlc3Npb24+KTpcbiAgICAgIEVtaXRTY29wZTxUU3RhdGVtZW50LCBURXhwcmVzc2lvbj4ge1xuICAgIGNvbnN0IGNvbnN0YW50U2NvcGUgPSBkZWNsYXJhdGlvblNjb3BlLmdldENvbnN0YW50U2NvcGVSZWYobmdJbXBvcnQpO1xuICAgIGlmIChjb25zdGFudFNjb3BlID09PSBudWxsKSB7XG4gICAgICAvLyBUaGVyZSBpcyBubyBjb25zdGFudCBzY29wZSBzbyB3ZSB3aWxsIGVtaXQgZXh0cmEgc3RhdGVtZW50cyBpbnRvIHRoZSBkZWZpbml0aW9uIElJRkUuXG4gICAgICByZXR1cm4gbmV3IElpZmVFbWl0U2NvcGUoXG4gICAgICAgICAgbmdJbXBvcnQsIHRoaXMubGlua2VyRW52aXJvbm1lbnQudHJhbnNsYXRvciwgdGhpcy5saW5rZXJFbnZpcm9ubWVudC5mYWN0b3J5KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuZW1pdFNjb3Blcy5oYXMoY29uc3RhbnRTY29wZSkpIHtcbiAgICAgIHRoaXMuZW1pdFNjb3Blcy5zZXQoXG4gICAgICAgICAgY29uc3RhbnRTY29wZSwgbmV3IEVtaXRTY29wZShuZ0ltcG9ydCwgdGhpcy5saW5rZXJFbnZpcm9ubWVudC50cmFuc2xhdG9yKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVtaXRTY29wZXMuZ2V0KGNvbnN0YW50U2NvcGUpITtcbiAgfVxufVxuIl19