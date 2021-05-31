(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/packages/ngcc_compiler_host", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/analysis/util", "@angular/compiler-cli/ngcc/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NgccDtsCompilerHost = exports.NgccSourcesCompilerHost = void 0;
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
    var util_1 = require("@angular/compiler-cli/ngcc/src/analysis/util");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    /**
     * Represents a compiler host that resolves a module import as a JavaScript source file if
     * available, instead of the .d.ts typings file that would have been resolved by TypeScript. This
     * is necessary for packages that have their typings in the same directory as the sources, which
     * would otherwise let TypeScript prefer the .d.ts file instead of the JavaScript source file.
     */
    var NgccSourcesCompilerHost = /** @class */ (function (_super) {
        tslib_1.__extends(NgccSourcesCompilerHost, _super);
        function NgccSourcesCompilerHost(fs, options, cache, moduleResolutionCache, packagePath) {
            var _this = _super.call(this, fs, options) || this;
            _this.cache = cache;
            _this.moduleResolutionCache = moduleResolutionCache;
            _this.packagePath = packagePath;
            return _this;
        }
        NgccSourcesCompilerHost.prototype.getSourceFile = function (fileName, languageVersion) {
            return this.cache.getCachedSourceFile(fileName, languageVersion);
        };
        NgccSourcesCompilerHost.prototype.resolveModuleNames = function (moduleNames, containingFile, reusedNames, redirectedReference) {
            var _this = this;
            return moduleNames.map(function (moduleName) {
                var resolvedModule = ts.resolveModuleName(moduleName, containingFile, _this.options, _this, _this.moduleResolutionCache, redirectedReference).resolvedModule;
                // If the module request originated from a relative import in a JavaScript source file,
                // TypeScript may have resolved the module to its .d.ts declaration file if the .js source
                // file was in the same directory. This is undesirable, as we need to have the actual
                // JavaScript being present in the program. This logic recognizes this scenario and rewrites
                // the resolved .d.ts declaration file to its .js counterpart, if it exists.
                if ((resolvedModule === null || resolvedModule === void 0 ? void 0 : resolvedModule.extension) === ts.Extension.Dts && containingFile.endsWith('.js') &&
                    utils_1.isRelativePath(moduleName)) {
                    var jsFile = resolvedModule.resolvedFileName.replace(/\.d\.ts$/, '.js');
                    if (_this.fileExists(jsFile)) {
                        return tslib_1.__assign(tslib_1.__assign({}, resolvedModule), { resolvedFileName: jsFile, extension: ts.Extension.Js });
                    }
                }
                // Prevent loading JavaScript source files outside of the package root, which would happen for
                // packages that don't have .d.ts files. As ngcc should only operate on the .js files
                // contained within the package, any files outside the package are simply discarded. This does
                // result in a partial program with error diagnostics, however ngcc won't gather diagnostics
                // for the program it creates so these diagnostics won't be reported.
                if ((resolvedModule === null || resolvedModule === void 0 ? void 0 : resolvedModule.extension) === ts.Extension.Js &&
                    !util_1.isWithinPackage(_this.packagePath, _this.fs.resolve(resolvedModule.resolvedFileName))) {
                    return undefined;
                }
                return resolvedModule;
            });
        };
        return NgccSourcesCompilerHost;
    }(file_system_1.NgtscCompilerHost));
    exports.NgccSourcesCompilerHost = NgccSourcesCompilerHost;
    /**
     * A compiler host implementation that is used for the typings program. It leverages the entry-point
     * cache for source files and module resolution, as these results can be reused across the sources
     * program.
     */
    var NgccDtsCompilerHost = /** @class */ (function (_super) {
        tslib_1.__extends(NgccDtsCompilerHost, _super);
        function NgccDtsCompilerHost(fs, options, cache, moduleResolutionCache) {
            var _this = _super.call(this, fs, options) || this;
            _this.cache = cache;
            _this.moduleResolutionCache = moduleResolutionCache;
            return _this;
        }
        NgccDtsCompilerHost.prototype.getSourceFile = function (fileName, languageVersion) {
            return this.cache.getCachedSourceFile(fileName, languageVersion);
        };
        NgccDtsCompilerHost.prototype.resolveModuleNames = function (moduleNames, containingFile, reusedNames, redirectedReference) {
            var _this = this;
            return moduleNames.map(function (moduleName) {
                var resolvedModule = ts.resolveModuleName(moduleName, containingFile, _this.options, _this, _this.moduleResolutionCache, redirectedReference).resolvedModule;
                return resolvedModule;
            });
        };
        return NgccDtsCompilerHost;
    }(file_system_1.NgtscCompilerHost));
    exports.NgccDtsCompilerHost = NgccDtsCompilerHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdjY19jb21waWxlcl9ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL3BhY2thZ2VzL25nY2NfY29tcGlsZXJfaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0JBQWlDO0lBRWpDLDJFQUE2RjtJQUM3RixxRUFBaUQ7SUFDakQsOERBQXdDO0lBR3hDOzs7OztPQUtHO0lBQ0g7UUFBNkMsbURBQWlCO1FBQzVELGlDQUNJLEVBQWMsRUFBRSxPQUEyQixFQUFVLEtBQTBCLEVBQ3ZFLHFCQUErQyxFQUM3QyxXQUEyQjtZQUh6QyxZQUlFLGtCQUFNLEVBQUUsRUFBRSxPQUFPLENBQUMsU0FDbkI7WUFKd0QsV0FBSyxHQUFMLEtBQUssQ0FBcUI7WUFDdkUsMkJBQXFCLEdBQXJCLHFCQUFxQixDQUEwQjtZQUM3QyxpQkFBVyxHQUFYLFdBQVcsQ0FBZ0I7O1FBRXpDLENBQUM7UUFFRCwrQ0FBYSxHQUFiLFVBQWMsUUFBZ0IsRUFBRSxlQUFnQztZQUM5RCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFRCxvREFBa0IsR0FBbEIsVUFDSSxXQUFxQixFQUFFLGNBQXNCLEVBQUUsV0FBc0IsRUFDckUsbUJBQWlEO1lBRnJELGlCQWlDQztZQTlCQyxPQUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQSxVQUFVO2dCQUN4QixJQUFBLGNBQWMsR0FBSSxFQUFFLENBQUMsaUJBQWlCLENBQ3pDLFVBQVUsRUFBRSxjQUFjLEVBQUUsS0FBSSxDQUFDLE9BQU8sRUFBRSxLQUFJLEVBQUUsS0FBSSxDQUFDLHFCQUFxQixFQUMxRSxtQkFBbUIsQ0FBQyxlQUZILENBRUk7Z0JBRXpCLHVGQUF1RjtnQkFDdkYsMEZBQTBGO2dCQUMxRixxRkFBcUY7Z0JBQ3JGLDRGQUE0RjtnQkFDNUYsNEVBQTRFO2dCQUM1RSxJQUFJLENBQUEsY0FBYyxhQUFkLGNBQWMsdUJBQWQsY0FBYyxDQUFFLFNBQVMsTUFBSyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztvQkFDaEYsc0JBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDOUIsSUFBTSxNQUFNLEdBQUcsY0FBYyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzFFLElBQUksS0FBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTt3QkFDM0IsNkNBQVcsY0FBYyxLQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUU7cUJBQ2xGO2lCQUNGO2dCQUVELDhGQUE4RjtnQkFDOUYscUZBQXFGO2dCQUNyRiw4RkFBOEY7Z0JBQzlGLDRGQUE0RjtnQkFDNUYscUVBQXFFO2dCQUNyRSxJQUFJLENBQUEsY0FBYyxhQUFkLGNBQWMsdUJBQWQsY0FBYyxDQUFFLFNBQVMsTUFBSyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUU7b0JBQzdDLENBQUMsc0JBQWUsQ0FBQyxLQUFJLENBQUMsV0FBVyxFQUFFLEtBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUU7b0JBQ3hGLE9BQU8sU0FBUyxDQUFDO2lCQUNsQjtnQkFFRCxPQUFPLGNBQWMsQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDSCw4QkFBQztJQUFELENBQUMsQUE5Q0QsQ0FBNkMsK0JBQWlCLEdBOEM3RDtJQTlDWSwwREFBdUI7SUFnRHBDOzs7O09BSUc7SUFDSDtRQUF5QywrQ0FBaUI7UUFDeEQsNkJBQ0ksRUFBYyxFQUFFLE9BQTJCLEVBQVUsS0FBMEIsRUFDdkUscUJBQStDO1lBRjNELFlBR0Usa0JBQU0sRUFBRSxFQUFFLE9BQU8sQ0FBQyxTQUNuQjtZQUh3RCxXQUFLLEdBQUwsS0FBSyxDQUFxQjtZQUN2RSwyQkFBcUIsR0FBckIscUJBQXFCLENBQTBCOztRQUUzRCxDQUFDO1FBRUQsMkNBQWEsR0FBYixVQUFjLFFBQWdCLEVBQUUsZUFBZ0M7WUFDOUQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRUQsZ0RBQWtCLEdBQWxCLFVBQ0ksV0FBcUIsRUFBRSxjQUFzQixFQUFFLFdBQXNCLEVBQ3JFLG1CQUFpRDtZQUZyRCxpQkFTQztZQU5DLE9BQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFVBQVU7Z0JBQ3hCLElBQUEsY0FBYyxHQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FDekMsVUFBVSxFQUFFLGNBQWMsRUFBRSxLQUFJLENBQUMsT0FBTyxFQUFFLEtBQUksRUFBRSxLQUFJLENBQUMscUJBQXFCLEVBQzFFLG1CQUFtQixDQUFDLGVBRkgsQ0FFSTtnQkFDekIsT0FBTyxjQUFjLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0gsMEJBQUM7SUFBRCxDQUFDLEFBckJELENBQXlDLCtCQUFpQixHQXFCekQ7SUFyQlksa0RBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgRmlsZVN5c3RlbSwgTmd0c2NDb21waWxlckhvc3R9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge2lzV2l0aGluUGFja2FnZX0gZnJvbSAnLi4vYW5hbHlzaXMvdXRpbCc7XG5pbXBvcnQge2lzUmVsYXRpdmVQYXRofSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQge0VudHJ5UG9pbnRGaWxlQ2FjaGV9IGZyb20gJy4vc291cmNlX2ZpbGVfY2FjaGUnO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBjb21waWxlciBob3N0IHRoYXQgcmVzb2x2ZXMgYSBtb2R1bGUgaW1wb3J0IGFzIGEgSmF2YVNjcmlwdCBzb3VyY2UgZmlsZSBpZlxuICogYXZhaWxhYmxlLCBpbnN0ZWFkIG9mIHRoZSAuZC50cyB0eXBpbmdzIGZpbGUgdGhhdCB3b3VsZCBoYXZlIGJlZW4gcmVzb2x2ZWQgYnkgVHlwZVNjcmlwdC4gVGhpc1xuICogaXMgbmVjZXNzYXJ5IGZvciBwYWNrYWdlcyB0aGF0IGhhdmUgdGhlaXIgdHlwaW5ncyBpbiB0aGUgc2FtZSBkaXJlY3RvcnkgYXMgdGhlIHNvdXJjZXMsIHdoaWNoXG4gKiB3b3VsZCBvdGhlcndpc2UgbGV0IFR5cGVTY3JpcHQgcHJlZmVyIHRoZSAuZC50cyBmaWxlIGluc3RlYWQgb2YgdGhlIEphdmFTY3JpcHQgc291cmNlIGZpbGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ2NjU291cmNlc0NvbXBpbGVySG9zdCBleHRlbmRzIE5ndHNjQ29tcGlsZXJIb3N0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBmczogRmlsZVN5c3RlbSwgb3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zLCBwcml2YXRlIGNhY2hlOiBFbnRyeVBvaW50RmlsZUNhY2hlLFxuICAgICAgcHJpdmF0ZSBtb2R1bGVSZXNvbHV0aW9uQ2FjaGU6IHRzLk1vZHVsZVJlc29sdXRpb25DYWNoZSxcbiAgICAgIHByb3RlY3RlZCBwYWNrYWdlUGF0aDogQWJzb2x1dGVGc1BhdGgpIHtcbiAgICBzdXBlcihmcywgb3B0aW9ucyk7XG4gIH1cblxuICBnZXRTb3VyY2VGaWxlKGZpbGVOYW1lOiBzdHJpbmcsIGxhbmd1YWdlVmVyc2lvbjogdHMuU2NyaXB0VGFyZ2V0KTogdHMuU291cmNlRmlsZXx1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmNhY2hlLmdldENhY2hlZFNvdXJjZUZpbGUoZmlsZU5hbWUsIGxhbmd1YWdlVmVyc2lvbik7XG4gIH1cblxuICByZXNvbHZlTW9kdWxlTmFtZXMoXG4gICAgICBtb2R1bGVOYW1lczogc3RyaW5nW10sIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcsIHJldXNlZE5hbWVzPzogc3RyaW5nW10sXG4gICAgICByZWRpcmVjdGVkUmVmZXJlbmNlPzogdHMuUmVzb2x2ZWRQcm9qZWN0UmVmZXJlbmNlKTogQXJyYXk8dHMuUmVzb2x2ZWRNb2R1bGV8dW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIG1vZHVsZU5hbWVzLm1hcChtb2R1bGVOYW1lID0+IHtcbiAgICAgIGNvbnN0IHtyZXNvbHZlZE1vZHVsZX0gPSB0cy5yZXNvbHZlTW9kdWxlTmFtZShcbiAgICAgICAgICBtb2R1bGVOYW1lLCBjb250YWluaW5nRmlsZSwgdGhpcy5vcHRpb25zLCB0aGlzLCB0aGlzLm1vZHVsZVJlc29sdXRpb25DYWNoZSxcbiAgICAgICAgICByZWRpcmVjdGVkUmVmZXJlbmNlKTtcblxuICAgICAgLy8gSWYgdGhlIG1vZHVsZSByZXF1ZXN0IG9yaWdpbmF0ZWQgZnJvbSBhIHJlbGF0aXZlIGltcG9ydCBpbiBhIEphdmFTY3JpcHQgc291cmNlIGZpbGUsXG4gICAgICAvLyBUeXBlU2NyaXB0IG1heSBoYXZlIHJlc29sdmVkIHRoZSBtb2R1bGUgdG8gaXRzIC5kLnRzIGRlY2xhcmF0aW9uIGZpbGUgaWYgdGhlIC5qcyBzb3VyY2VcbiAgICAgIC8vIGZpbGUgd2FzIGluIHRoZSBzYW1lIGRpcmVjdG9yeS4gVGhpcyBpcyB1bmRlc2lyYWJsZSwgYXMgd2UgbmVlZCB0byBoYXZlIHRoZSBhY3R1YWxcbiAgICAgIC8vIEphdmFTY3JpcHQgYmVpbmcgcHJlc2VudCBpbiB0aGUgcHJvZ3JhbS4gVGhpcyBsb2dpYyByZWNvZ25pemVzIHRoaXMgc2NlbmFyaW8gYW5kIHJld3JpdGVzXG4gICAgICAvLyB0aGUgcmVzb2x2ZWQgLmQudHMgZGVjbGFyYXRpb24gZmlsZSB0byBpdHMgLmpzIGNvdW50ZXJwYXJ0LCBpZiBpdCBleGlzdHMuXG4gICAgICBpZiAocmVzb2x2ZWRNb2R1bGU/LmV4dGVuc2lvbiA9PT0gdHMuRXh0ZW5zaW9uLkR0cyAmJiBjb250YWluaW5nRmlsZS5lbmRzV2l0aCgnLmpzJykgJiZcbiAgICAgICAgICBpc1JlbGF0aXZlUGF0aChtb2R1bGVOYW1lKSkge1xuICAgICAgICBjb25zdCBqc0ZpbGUgPSByZXNvbHZlZE1vZHVsZS5yZXNvbHZlZEZpbGVOYW1lLnJlcGxhY2UoL1xcLmRcXC50cyQvLCAnLmpzJyk7XG4gICAgICAgIGlmICh0aGlzLmZpbGVFeGlzdHMoanNGaWxlKSkge1xuICAgICAgICAgIHJldHVybiB7Li4ucmVzb2x2ZWRNb2R1bGUsIHJlc29sdmVkRmlsZU5hbWU6IGpzRmlsZSwgZXh0ZW5zaW9uOiB0cy5FeHRlbnNpb24uSnN9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFByZXZlbnQgbG9hZGluZyBKYXZhU2NyaXB0IHNvdXJjZSBmaWxlcyBvdXRzaWRlIG9mIHRoZSBwYWNrYWdlIHJvb3QsIHdoaWNoIHdvdWxkIGhhcHBlbiBmb3JcbiAgICAgIC8vIHBhY2thZ2VzIHRoYXQgZG9uJ3QgaGF2ZSAuZC50cyBmaWxlcy4gQXMgbmdjYyBzaG91bGQgb25seSBvcGVyYXRlIG9uIHRoZSAuanMgZmlsZXNcbiAgICAgIC8vIGNvbnRhaW5lZCB3aXRoaW4gdGhlIHBhY2thZ2UsIGFueSBmaWxlcyBvdXRzaWRlIHRoZSBwYWNrYWdlIGFyZSBzaW1wbHkgZGlzY2FyZGVkLiBUaGlzIGRvZXNcbiAgICAgIC8vIHJlc3VsdCBpbiBhIHBhcnRpYWwgcHJvZ3JhbSB3aXRoIGVycm9yIGRpYWdub3N0aWNzLCBob3dldmVyIG5nY2Mgd29uJ3QgZ2F0aGVyIGRpYWdub3N0aWNzXG4gICAgICAvLyBmb3IgdGhlIHByb2dyYW0gaXQgY3JlYXRlcyBzbyB0aGVzZSBkaWFnbm9zdGljcyB3b24ndCBiZSByZXBvcnRlZC5cbiAgICAgIGlmIChyZXNvbHZlZE1vZHVsZT8uZXh0ZW5zaW9uID09PSB0cy5FeHRlbnNpb24uSnMgJiZcbiAgICAgICAgICAhaXNXaXRoaW5QYWNrYWdlKHRoaXMucGFja2FnZVBhdGgsIHRoaXMuZnMucmVzb2x2ZShyZXNvbHZlZE1vZHVsZS5yZXNvbHZlZEZpbGVOYW1lKSkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc29sdmVkTW9kdWxlO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogQSBjb21waWxlciBob3N0IGltcGxlbWVudGF0aW9uIHRoYXQgaXMgdXNlZCBmb3IgdGhlIHR5cGluZ3MgcHJvZ3JhbS4gSXQgbGV2ZXJhZ2VzIHRoZSBlbnRyeS1wb2ludFxuICogY2FjaGUgZm9yIHNvdXJjZSBmaWxlcyBhbmQgbW9kdWxlIHJlc29sdXRpb24sIGFzIHRoZXNlIHJlc3VsdHMgY2FuIGJlIHJldXNlZCBhY3Jvc3MgdGhlIHNvdXJjZXNcbiAqIHByb2dyYW0uXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ2NjRHRzQ29tcGlsZXJIb3N0IGV4dGVuZHMgTmd0c2NDb21waWxlckhvc3Qge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIGZzOiBGaWxlU3lzdGVtLCBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMsIHByaXZhdGUgY2FjaGU6IEVudHJ5UG9pbnRGaWxlQ2FjaGUsXG4gICAgICBwcml2YXRlIG1vZHVsZVJlc29sdXRpb25DYWNoZTogdHMuTW9kdWxlUmVzb2x1dGlvbkNhY2hlKSB7XG4gICAgc3VwZXIoZnMsIG9wdGlvbnMpO1xuICB9XG5cbiAgZ2V0U291cmNlRmlsZShmaWxlTmFtZTogc3RyaW5nLCBsYW5ndWFnZVZlcnNpb246IHRzLlNjcmlwdFRhcmdldCk6IHRzLlNvdXJjZUZpbGV8dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXRDYWNoZWRTb3VyY2VGaWxlKGZpbGVOYW1lLCBsYW5ndWFnZVZlcnNpb24pO1xuICB9XG5cbiAgcmVzb2x2ZU1vZHVsZU5hbWVzKFxuICAgICAgbW9kdWxlTmFtZXM6IHN0cmluZ1tdLCBjb250YWluaW5nRmlsZTogc3RyaW5nLCByZXVzZWROYW1lcz86IHN0cmluZ1tdLFxuICAgICAgcmVkaXJlY3RlZFJlZmVyZW5jZT86IHRzLlJlc29sdmVkUHJvamVjdFJlZmVyZW5jZSk6IEFycmF5PHRzLlJlc29sdmVkTW9kdWxlfHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiBtb2R1bGVOYW1lcy5tYXAobW9kdWxlTmFtZSA9PiB7XG4gICAgICBjb25zdCB7cmVzb2x2ZWRNb2R1bGV9ID0gdHMucmVzb2x2ZU1vZHVsZU5hbWUoXG4gICAgICAgICAgbW9kdWxlTmFtZSwgY29udGFpbmluZ0ZpbGUsIHRoaXMub3B0aW9ucywgdGhpcywgdGhpcy5tb2R1bGVSZXNvbHV0aW9uQ2FjaGUsXG4gICAgICAgICAgcmVkaXJlY3RlZFJlZmVyZW5jZSk7XG4gICAgICByZXR1cm4gcmVzb2x2ZWRNb2R1bGU7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==