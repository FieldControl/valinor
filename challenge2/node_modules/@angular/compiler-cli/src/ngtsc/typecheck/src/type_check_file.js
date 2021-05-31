(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_file", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/typecheck/src/environment", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_block"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.typeCheckFilePath = exports.TypeCheckFile = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var environment_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/environment");
    var type_check_block_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_block");
    /**
     * An `Environment` representing the single type-checking file into which most (if not all) Type
     * Check Blocks (TCBs) will be generated.
     *
     * The `TypeCheckFile` hosts multiple TCBs and allows the sharing of declarations (e.g. type
     * constructors) between them. Rather than return such declarations via `getPreludeStatements()`, it
     * hoists them to the top of the generated `ts.SourceFile`.
     */
    var TypeCheckFile = /** @class */ (function (_super) {
        tslib_1.__extends(TypeCheckFile, _super);
        function TypeCheckFile(fileName, config, refEmitter, reflector, compilerHost) {
            var _this = _super.call(this, config, new translator_1.ImportManager(new imports_1.NoopImportRewriter(), 'i'), refEmitter, reflector, ts.createSourceFile(compilerHost.getCanonicalFileName(fileName), '', ts.ScriptTarget.Latest, true)) || this;
            _this.fileName = fileName;
            _this.nextTcbId = 1;
            _this.tcbStatements = [];
            return _this;
        }
        TypeCheckFile.prototype.addTypeCheckBlock = function (ref, meta, domSchemaChecker, oobRecorder, genericContextBehavior) {
            var fnId = ts.createIdentifier("_tcb" + this.nextTcbId++);
            var fn = type_check_block_1.generateTypeCheckBlock(this, ref, fnId, meta, domSchemaChecker, oobRecorder, genericContextBehavior);
            this.tcbStatements.push(fn);
        };
        TypeCheckFile.prototype.render = function (removeComments) {
            var e_1, _a, e_2, _b, e_3, _c;
            var source = this.importManager.getAllImports(this.contextFile.fileName)
                .map(function (i) { return "import * as " + i.qualifier.text + " from '" + i.specifier + "';"; })
                .join('\n') +
                '\n\n';
            var printer = ts.createPrinter({ removeComments: removeComments });
            source += '\n';
            try {
                for (var _d = tslib_1.__values(this.pipeInstStatements), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var stmt = _e.value;
                    source += printer.printNode(ts.EmitHint.Unspecified, stmt, this.contextFile) + '\n';
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var _f = tslib_1.__values(this.typeCtorStatements), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var stmt = _g.value;
                    source += printer.printNode(ts.EmitHint.Unspecified, stmt, this.contextFile) + '\n';
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_2) throw e_2.error; }
            }
            source += '\n';
            try {
                for (var _h = tslib_1.__values(this.tcbStatements), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var stmt = _j.value;
                    source += printer.printNode(ts.EmitHint.Unspecified, stmt, this.contextFile) + '\n';
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                }
                finally { if (e_3) throw e_3.error; }
            }
            // Ensure the template type-checking file is an ES module. Otherwise, it's interpreted as some
            // kind of global namespace in TS, which forces a full re-typecheck of the user's program that
            // is somehow more expensive than the initial parse.
            source += '\nexport const IS_A_MODULE = true;\n';
            return source;
        };
        TypeCheckFile.prototype.getPreludeStatements = function () {
            return [];
        };
        return TypeCheckFile;
    }(environment_1.Environment));
    exports.TypeCheckFile = TypeCheckFile;
    function typeCheckFilePath(rootDirs) {
        var shortest = rootDirs.concat([]).sort(function (a, b) { return a.length - b.length; })[0];
        return file_system_1.join(shortest, '__ng_typecheck__.ts');
    }
    exports.typeCheckFilePath = typeCheckFilePath;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV9jaGVja19maWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy90eXBlY2hlY2svc3JjL3R5cGVfY2hlY2tfZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0JBQWlDO0lBRWpDLDJFQUF1RDtJQUN2RCxtRUFBOEU7SUFFOUUseUVBQStDO0lBSS9DLHlGQUEwQztJQUUxQyxtR0FBcUY7SUFJckY7Ozs7Ozs7T0FPRztJQUNIO1FBQW1DLHlDQUFXO1FBSTVDLHVCQUNhLFFBQXdCLEVBQUUsTUFBMEIsRUFBRSxVQUE0QixFQUMzRixTQUF5QixFQUFFLFlBQTJEO1lBRjFGLFlBR0Usa0JBQ0ksTUFBTSxFQUFFLElBQUksMEJBQWEsQ0FBQyxJQUFJLDRCQUFrQixFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFDL0UsRUFBRSxDQUFDLGdCQUFnQixDQUNmLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsU0FDeEY7WUFOWSxjQUFRLEdBQVIsUUFBUSxDQUFnQjtZQUo3QixlQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsbUJBQWEsR0FBbUIsRUFBRSxDQUFDOztRQVMzQyxDQUFDO1FBRUQseUNBQWlCLEdBQWpCLFVBQ0ksR0FBcUQsRUFBRSxJQUE0QixFQUNuRixnQkFBa0MsRUFBRSxXQUF3QyxFQUM1RSxzQkFBaUQ7WUFDbkQsSUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFNBQU8sSUFBSSxDQUFDLFNBQVMsRUFBSSxDQUFDLENBQUM7WUFDNUQsSUFBTSxFQUFFLEdBQUcseUNBQXNCLENBQzdCLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztZQUNsRixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQsOEJBQU0sR0FBTixVQUFPLGNBQXVCOztZQUM1QixJQUFJLE1BQU0sR0FBVyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztpQkFDdEQsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsaUJBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQVUsQ0FBQyxDQUFDLFNBQVMsT0FBSSxFQUF4RCxDQUF3RCxDQUFDO2lCQUNsRSxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNoQyxNQUFNLENBQUM7WUFDWCxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUMsY0FBYyxnQkFBQSxFQUFDLENBQUMsQ0FBQztZQUNuRCxNQUFNLElBQUksSUFBSSxDQUFDOztnQkFDZixLQUFtQixJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLGtCQUFrQixDQUFBLGdCQUFBLDRCQUFFO29CQUF2QyxJQUFNLElBQUksV0FBQTtvQkFDYixNQUFNLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQztpQkFDckY7Ozs7Ozs7Ozs7Z0JBQ0QsS0FBbUIsSUFBQSxLQUFBLGlCQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQSxnQkFBQSw0QkFBRTtvQkFBdkMsSUFBTSxJQUFJLFdBQUE7b0JBQ2IsTUFBTSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUM7aUJBQ3JGOzs7Ozs7Ozs7WUFDRCxNQUFNLElBQUksSUFBSSxDQUFDOztnQkFDZixLQUFtQixJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQSxnQkFBQSw0QkFBRTtvQkFBbEMsSUFBTSxJQUFJLFdBQUE7b0JBQ2IsTUFBTSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUM7aUJBQ3JGOzs7Ozs7Ozs7WUFFRCw4RkFBOEY7WUFDOUYsOEZBQThGO1lBQzlGLG9EQUFvRDtZQUNwRCxNQUFNLElBQUksc0NBQXNDLENBQUM7WUFFakQsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVELDRDQUFvQixHQUFwQjtZQUNFLE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUNILG9CQUFDO0lBQUQsQ0FBQyxBQXBERCxDQUFtQyx5QkFBVyxHQW9EN0M7SUFwRFksc0NBQWE7SUFzRDFCLFNBQWdCLGlCQUFpQixDQUFDLFFBQTBCO1FBQzFELElBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBbkIsQ0FBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLE9BQU8sa0JBQUksQ0FBQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBSEQsOENBR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBqb2lufSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge05vb3BJbXBvcnRSZXdyaXRlciwgUmVmZXJlbmNlLCBSZWZlcmVuY2VFbWl0dGVyfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtJbXBvcnRNYW5hZ2VyfSBmcm9tICcuLi8uLi90cmFuc2xhdG9yJztcbmltcG9ydCB7VHlwZUNoZWNrQmxvY2tNZXRhZGF0YSwgVHlwZUNoZWNraW5nQ29uZmlnfSBmcm9tICcuLi9hcGknO1xuXG5pbXBvcnQge0RvbVNjaGVtYUNoZWNrZXJ9IGZyb20gJy4vZG9tJztcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0IHtPdXRPZkJhbmREaWFnbm9zdGljUmVjb3JkZXJ9IGZyb20gJy4vb29iJztcbmltcG9ydCB7Z2VuZXJhdGVUeXBlQ2hlY2tCbG9jaywgVGNiR2VuZXJpY0NvbnRleHRCZWhhdmlvcn0gZnJvbSAnLi90eXBlX2NoZWNrX2Jsb2NrJztcblxuXG5cbi8qKlxuICogQW4gYEVudmlyb25tZW50YCByZXByZXNlbnRpbmcgdGhlIHNpbmdsZSB0eXBlLWNoZWNraW5nIGZpbGUgaW50byB3aGljaCBtb3N0IChpZiBub3QgYWxsKSBUeXBlXG4gKiBDaGVjayBCbG9ja3MgKFRDQnMpIHdpbGwgYmUgZ2VuZXJhdGVkLlxuICpcbiAqIFRoZSBgVHlwZUNoZWNrRmlsZWAgaG9zdHMgbXVsdGlwbGUgVENCcyBhbmQgYWxsb3dzIHRoZSBzaGFyaW5nIG9mIGRlY2xhcmF0aW9ucyAoZS5nLiB0eXBlXG4gKiBjb25zdHJ1Y3RvcnMpIGJldHdlZW4gdGhlbS4gUmF0aGVyIHRoYW4gcmV0dXJuIHN1Y2ggZGVjbGFyYXRpb25zIHZpYSBgZ2V0UHJlbHVkZVN0YXRlbWVudHMoKWAsIGl0XG4gKiBob2lzdHMgdGhlbSB0byB0aGUgdG9wIG9mIHRoZSBnZW5lcmF0ZWQgYHRzLlNvdXJjZUZpbGVgLlxuICovXG5leHBvcnQgY2xhc3MgVHlwZUNoZWNrRmlsZSBleHRlbmRzIEVudmlyb25tZW50IHtcbiAgcHJpdmF0ZSBuZXh0VGNiSWQgPSAxO1xuICBwcml2YXRlIHRjYlN0YXRlbWVudHM6IHRzLlN0YXRlbWVudFtdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSBmaWxlTmFtZTogQWJzb2x1dGVGc1BhdGgsIGNvbmZpZzogVHlwZUNoZWNraW5nQ29uZmlnLCByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyLFxuICAgICAgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgY29tcGlsZXJIb3N0OiBQaWNrPHRzLkNvbXBpbGVySG9zdCwgJ2dldENhbm9uaWNhbEZpbGVOYW1lJz4pIHtcbiAgICBzdXBlcihcbiAgICAgICAgY29uZmlnLCBuZXcgSW1wb3J0TWFuYWdlcihuZXcgTm9vcEltcG9ydFJld3JpdGVyKCksICdpJyksIHJlZkVtaXR0ZXIsIHJlZmxlY3RvcixcbiAgICAgICAgdHMuY3JlYXRlU291cmNlRmlsZShcbiAgICAgICAgICAgIGNvbXBpbGVySG9zdC5nZXRDYW5vbmljYWxGaWxlTmFtZShmaWxlTmFtZSksICcnLCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCB0cnVlKSk7XG4gIH1cblxuICBhZGRUeXBlQ2hlY2tCbG9jayhcbiAgICAgIHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+LCBtZXRhOiBUeXBlQ2hlY2tCbG9ja01ldGFkYXRhLFxuICAgICAgZG9tU2NoZW1hQ2hlY2tlcjogRG9tU2NoZW1hQ2hlY2tlciwgb29iUmVjb3JkZXI6IE91dE9mQmFuZERpYWdub3N0aWNSZWNvcmRlcixcbiAgICAgIGdlbmVyaWNDb250ZXh0QmVoYXZpb3I6IFRjYkdlbmVyaWNDb250ZXh0QmVoYXZpb3IpOiB2b2lkIHtcbiAgICBjb25zdCBmbklkID0gdHMuY3JlYXRlSWRlbnRpZmllcihgX3RjYiR7dGhpcy5uZXh0VGNiSWQrK31gKTtcbiAgICBjb25zdCBmbiA9IGdlbmVyYXRlVHlwZUNoZWNrQmxvY2soXG4gICAgICAgIHRoaXMsIHJlZiwgZm5JZCwgbWV0YSwgZG9tU2NoZW1hQ2hlY2tlciwgb29iUmVjb3JkZXIsIGdlbmVyaWNDb250ZXh0QmVoYXZpb3IpO1xuICAgIHRoaXMudGNiU3RhdGVtZW50cy5wdXNoKGZuKTtcbiAgfVxuXG4gIHJlbmRlcihyZW1vdmVDb21tZW50czogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgbGV0IHNvdXJjZTogc3RyaW5nID0gdGhpcy5pbXBvcnRNYW5hZ2VyLmdldEFsbEltcG9ydHModGhpcy5jb250ZXh0RmlsZS5maWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChpID0+IGBpbXBvcnQgKiBhcyAke2kucXVhbGlmaWVyLnRleHR9IGZyb20gJyR7aS5zcGVjaWZpZXJ9JztgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuam9pbignXFxuJykgK1xuICAgICAgICAnXFxuXFxuJztcbiAgICBjb25zdCBwcmludGVyID0gdHMuY3JlYXRlUHJpbnRlcih7cmVtb3ZlQ29tbWVudHN9KTtcbiAgICBzb3VyY2UgKz0gJ1xcbic7XG4gICAgZm9yIChjb25zdCBzdG10IG9mIHRoaXMucGlwZUluc3RTdGF0ZW1lbnRzKSB7XG4gICAgICBzb3VyY2UgKz0gcHJpbnRlci5wcmludE5vZGUodHMuRW1pdEhpbnQuVW5zcGVjaWZpZWQsIHN0bXQsIHRoaXMuY29udGV4dEZpbGUpICsgJ1xcbic7XG4gICAgfVxuICAgIGZvciAoY29uc3Qgc3RtdCBvZiB0aGlzLnR5cGVDdG9yU3RhdGVtZW50cykge1xuICAgICAgc291cmNlICs9IHByaW50ZXIucHJpbnROb2RlKHRzLkVtaXRIaW50LlVuc3BlY2lmaWVkLCBzdG10LCB0aGlzLmNvbnRleHRGaWxlKSArICdcXG4nO1xuICAgIH1cbiAgICBzb3VyY2UgKz0gJ1xcbic7XG4gICAgZm9yIChjb25zdCBzdG10IG9mIHRoaXMudGNiU3RhdGVtZW50cykge1xuICAgICAgc291cmNlICs9IHByaW50ZXIucHJpbnROb2RlKHRzLkVtaXRIaW50LlVuc3BlY2lmaWVkLCBzdG10LCB0aGlzLmNvbnRleHRGaWxlKSArICdcXG4nO1xuICAgIH1cblxuICAgIC8vIEVuc3VyZSB0aGUgdGVtcGxhdGUgdHlwZS1jaGVja2luZyBmaWxlIGlzIGFuIEVTIG1vZHVsZS4gT3RoZXJ3aXNlLCBpdCdzIGludGVycHJldGVkIGFzIHNvbWVcbiAgICAvLyBraW5kIG9mIGdsb2JhbCBuYW1lc3BhY2UgaW4gVFMsIHdoaWNoIGZvcmNlcyBhIGZ1bGwgcmUtdHlwZWNoZWNrIG9mIHRoZSB1c2VyJ3MgcHJvZ3JhbSB0aGF0XG4gICAgLy8gaXMgc29tZWhvdyBtb3JlIGV4cGVuc2l2ZSB0aGFuIHRoZSBpbml0aWFsIHBhcnNlLlxuICAgIHNvdXJjZSArPSAnXFxuZXhwb3J0IGNvbnN0IElTX0FfTU9EVUxFID0gdHJ1ZTtcXG4nO1xuXG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGdldFByZWx1ZGVTdGF0ZW1lbnRzKCk6IHRzLlN0YXRlbWVudFtdIHtcbiAgICByZXR1cm4gW107XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVDaGVja0ZpbGVQYXRoKHJvb3REaXJzOiBBYnNvbHV0ZUZzUGF0aFtdKTogQWJzb2x1dGVGc1BhdGgge1xuICBjb25zdCBzaG9ydGVzdCA9IHJvb3REaXJzLmNvbmNhdChbXSkuc29ydCgoYSwgYikgPT4gYS5sZW5ndGggLSBiLmxlbmd0aClbMF07XG4gIHJldHVybiBqb2luKHNob3J0ZXN0LCAnX19uZ190eXBlY2hlY2tfXy50cycpO1xufVxuIl19