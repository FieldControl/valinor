/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/core/src/host", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/entry_point", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/shims", "@angular/compiler-cli/src/ngtsc/typecheck", "@angular/compiler-cli/src/ngtsc/util/src/path", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NgCompilerHost = exports.DelegatingCompilerHost = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var entry_point_1 = require("@angular/compiler-cli/src/ngtsc/entry_point");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var shims_1 = require("@angular/compiler-cli/src/ngtsc/shims");
    var typecheck_1 = require("@angular/compiler-cli/src/ngtsc/typecheck");
    var path_1 = require("@angular/compiler-cli/src/ngtsc/util/src/path");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    // A persistent source of bugs in CompilerHost delegation has been the addition by TS of new,
    // optional methods on ts.CompilerHost. Since these methods are optional, it's not a type error that
    // the delegating host doesn't implement or delegate them. This causes subtle runtime failures. No
    // more. This infrastructure ensures that failing to delegate a method is a compile-time error.
    /**
     * Delegates all methods of `ExtendedTsCompilerHost` to a delegate, with the exception of
     * `getSourceFile` and `fileExists` which are implemented in `NgCompilerHost`.
     *
     * If a new method is added to `ts.CompilerHost` which is not delegated, a type error will be
     * generated for this class.
     */
    var DelegatingCompilerHost = /** @class */ (function () {
        function DelegatingCompilerHost(delegate) {
            this.delegate = delegate;
            // Excluded are 'getSourceFile' and 'fileExists', which are actually implemented by NgCompilerHost
            // below.
            this.createHash = this.delegateMethod('createHash');
            this.directoryExists = this.delegateMethod('directoryExists');
            this.fileNameToModuleName = this.delegateMethod('fileNameToModuleName');
            this.getCancellationToken = this.delegateMethod('getCancellationToken');
            this.getCanonicalFileName = this.delegateMethod('getCanonicalFileName');
            this.getCurrentDirectory = this.delegateMethod('getCurrentDirectory');
            this.getDefaultLibFileName = this.delegateMethod('getDefaultLibFileName');
            this.getDefaultLibLocation = this.delegateMethod('getDefaultLibLocation');
            this.getDirectories = this.delegateMethod('getDirectories');
            this.getEnvironmentVariable = this.delegateMethod('getEnvironmentVariable');
            this.getModifiedResourceFiles = this.delegateMethod('getModifiedResourceFiles');
            this.getNewLine = this.delegateMethod('getNewLine');
            this.getParsedCommandLine = this.delegateMethod('getParsedCommandLine');
            this.getSourceFileByPath = this.delegateMethod('getSourceFileByPath');
            this.readDirectory = this.delegateMethod('readDirectory');
            this.readFile = this.delegateMethod('readFile');
            this.readResource = this.delegateMethod('readResource');
            this.transformResource = this.delegateMethod('transformResource');
            this.realpath = this.delegateMethod('realpath');
            this.resolveModuleNames = this.delegateMethod('resolveModuleNames');
            this.resolveTypeReferenceDirectives = this.delegateMethod('resolveTypeReferenceDirectives');
            this.resourceNameToFileName = this.delegateMethod('resourceNameToFileName');
            this.trace = this.delegateMethod('trace');
            this.useCaseSensitiveFileNames = this.delegateMethod('useCaseSensitiveFileNames');
            this.writeFile = this.delegateMethod('writeFile');
        }
        DelegatingCompilerHost.prototype.delegateMethod = function (name) {
            return this.delegate[name] !== undefined ? this.delegate[name].bind(this.delegate) :
                undefined;
        };
        return DelegatingCompilerHost;
    }());
    exports.DelegatingCompilerHost = DelegatingCompilerHost;
    /**
     * A wrapper around `ts.CompilerHost` (plus any extension methods from `ExtendedTsCompilerHost`).
     *
     * In order for a consumer to include Angular compilation in their TypeScript compiler, the
     * `ts.Program` must be created with a host that adds Angular-specific files (e.g. factories,
     * summaries, the template type-checking file, etc) to the compilation. `NgCompilerHost` is the
     * host implementation which supports this.
     *
     * The interface implementations here ensure that `NgCompilerHost` fully delegates to
     * `ExtendedTsCompilerHost` methods whenever present.
     */
    var NgCompilerHost = /** @class */ (function (_super) {
        tslib_1.__extends(NgCompilerHost, _super);
        function NgCompilerHost(delegate, inputFiles, rootDirs, shimAdapter, shimTagger, entryPoint, factoryTracker, diagnostics) {
            var _this = _super.call(this, delegate) || this;
            _this.shimAdapter = shimAdapter;
            _this.shimTagger = shimTagger;
            _this.factoryTracker = null;
            _this.entryPoint = null;
            _this.factoryTracker = factoryTracker;
            _this.entryPoint = entryPoint;
            _this.constructionDiagnostics = diagnostics;
            _this.inputFiles = tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(inputFiles)), tslib_1.__read(shimAdapter.extraInputFiles));
            _this.rootDirs = rootDirs;
            if (_this.resolveModuleNames === undefined) {
                // In order to reuse the module resolution cache during the creation of the type-check
                // program, we'll need to provide `resolveModuleNames` if the delegate did not provide one.
                _this.resolveModuleNames = _this.createCachedResolveModuleNamesFunction();
            }
            return _this;
        }
        Object.defineProperty(NgCompilerHost.prototype, "ignoreForEmit", {
            /**
             * Retrieves a set of `ts.SourceFile`s which should not be emitted as JS files.
             *
             * Available after this host is used to create a `ts.Program` (which causes all the files in the
             * program to be enumerated).
             */
            get: function () {
                return this.shimAdapter.ignoreForEmit;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NgCompilerHost.prototype, "shimExtensionPrefixes", {
            /**
             * Retrieve the array of shim extension prefixes for which shims were created for each original
             * file.
             */
            get: function () {
                return this.shimAdapter.extensionPrefixes;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Performs cleanup that needs to happen after a `ts.Program` has been created using this host.
         */
        NgCompilerHost.prototype.postProgramCreationCleanup = function () {
            this.shimTagger.finalize();
        };
        /**
         * Create an `NgCompilerHost` from a delegate host, an array of input filenames, and the full set
         * of TypeScript and Angular compiler options.
         */
        NgCompilerHost.wrap = function (delegate, inputFiles, options, oldProgram) {
            var e_1, _a;
            // TODO(alxhub): remove the fallback to allowEmptyCodegenFiles after verifying that the rest of
            // our build tooling is no longer relying on it.
            var allowEmptyCodegenFiles = options.allowEmptyCodegenFiles || false;
            var shouldGenerateFactoryShims = options.generateNgFactoryShims !== undefined ?
                options.generateNgFactoryShims :
                allowEmptyCodegenFiles;
            var shouldGenerateSummaryShims = options.generateNgSummaryShims !== undefined ?
                options.generateNgSummaryShims :
                allowEmptyCodegenFiles;
            var topLevelShimGenerators = [];
            var perFileShimGenerators = [];
            if (shouldGenerateSummaryShims) {
                // Summary generation.
                perFileShimGenerators.push(new shims_1.SummaryGenerator());
            }
            var factoryTracker = null;
            if (shouldGenerateFactoryShims) {
                var factoryGenerator = new shims_1.FactoryGenerator();
                perFileShimGenerators.push(factoryGenerator);
                factoryTracker = factoryGenerator;
            }
            var rootDirs = typescript_1.getRootDirs(delegate, options);
            perFileShimGenerators.push(new typecheck_1.TypeCheckShimGenerator());
            var diagnostics = [];
            var normalizedTsInputFiles = [];
            try {
                for (var inputFiles_1 = tslib_1.__values(inputFiles), inputFiles_1_1 = inputFiles_1.next(); !inputFiles_1_1.done; inputFiles_1_1 = inputFiles_1.next()) {
                    var inputFile = inputFiles_1_1.value;
                    if (!typescript_1.isNonDeclarationTsPath(inputFile)) {
                        continue;
                    }
                    normalizedTsInputFiles.push(file_system_1.resolve(inputFile));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (inputFiles_1_1 && !inputFiles_1_1.done && (_a = inputFiles_1.return)) _a.call(inputFiles_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var entryPoint = null;
            if (options.flatModuleOutFile != null && options.flatModuleOutFile !== '') {
                entryPoint = entry_point_1.findFlatIndexEntryPoint(normalizedTsInputFiles);
                if (entryPoint === null) {
                    // This error message talks specifically about having a single .ts file in "files". However
                    // the actual logic is a bit more permissive. If a single file exists, that will be taken,
                    // otherwise the highest level (shortest path) "index.ts" file will be used as the flat
                    // module entry point instead. If neither of these conditions apply, the error below is
                    // given.
                    //
                    // The user is not informed about the "index.ts" option as this behavior is deprecated -
                    // an explicit entrypoint should always be specified.
                    diagnostics.push({
                        category: ts.DiagnosticCategory.Error,
                        code: diagnostics_1.ngErrorCode(diagnostics_1.ErrorCode.CONFIG_FLAT_MODULE_NO_INDEX),
                        file: undefined,
                        start: undefined,
                        length: undefined,
                        messageText: 'Angular compiler option "flatModuleOutFile" requires one and only one .ts file in the "files" field.',
                    });
                }
                else {
                    var flatModuleId = options.flatModuleId || null;
                    var flatModuleOutFile = path_1.normalizeSeparators(options.flatModuleOutFile);
                    var flatIndexGenerator = new entry_point_1.FlatIndexGenerator(entryPoint, flatModuleOutFile, flatModuleId);
                    topLevelShimGenerators.push(flatIndexGenerator);
                }
            }
            var shimAdapter = new shims_1.ShimAdapter(delegate, normalizedTsInputFiles, topLevelShimGenerators, perFileShimGenerators, oldProgram);
            var shimTagger = new shims_1.ShimReferenceTagger(perFileShimGenerators.map(function (gen) { return gen.extensionPrefix; }));
            return new NgCompilerHost(delegate, inputFiles, rootDirs, shimAdapter, shimTagger, entryPoint, factoryTracker, diagnostics);
        };
        /**
         * Check whether the given `ts.SourceFile` is a shim file.
         *
         * If this returns false, the file is user-provided.
         */
        NgCompilerHost.prototype.isShim = function (sf) {
            return shims_1.isShim(sf);
        };
        NgCompilerHost.prototype.getSourceFile = function (fileName, languageVersion, onError, shouldCreateNewSourceFile) {
            // Is this a previously known shim?
            var shimSf = this.shimAdapter.maybeGenerate(file_system_1.resolve(fileName));
            if (shimSf !== null) {
                // Yes, so return it.
                return shimSf;
            }
            // No, so it's a file which might need shims (or a file which doesn't exist).
            var sf = this.delegate.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
            if (sf === undefined) {
                return undefined;
            }
            this.shimTagger.tag(sf);
            return sf;
        };
        NgCompilerHost.prototype.fileExists = function (fileName) {
            // Consider the file as existing whenever
            //  1) it really does exist in the delegate host, or
            //  2) at least one of the shim generators recognizes it
            // Note that we can pass the file name as branded absolute fs path because TypeScript
            // internally only passes POSIX-like paths.
            //
            // Also note that the `maybeGenerate` check below checks for both `null` and `undefined`.
            return this.delegate.fileExists(fileName) ||
                this.shimAdapter.maybeGenerate(file_system_1.resolve(fileName)) != null;
        };
        Object.defineProperty(NgCompilerHost.prototype, "unifiedModulesHost", {
            get: function () {
                return this.fileNameToModuleName !== undefined ? this : null;
            },
            enumerable: false,
            configurable: true
        });
        NgCompilerHost.prototype.createCachedResolveModuleNamesFunction = function () {
            var _this = this;
            var moduleResolutionCache = ts.createModuleResolutionCache(this.getCurrentDirectory(), this.getCanonicalFileName.bind(this));
            return function (moduleNames, containingFile, reusedNames, redirectedReference, options) {
                return moduleNames.map(function (moduleName) {
                    var module = ts.resolveModuleName(moduleName, containingFile, options, _this, moduleResolutionCache, redirectedReference);
                    return module.resolvedModule;
                });
            };
        };
        return NgCompilerHost;
    }(DelegatingCompilerHost));
    exports.NgCompilerHost = NgCompilerHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvY29yZS9zcmMvaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBRWpDLDJFQUF5RDtJQUN6RCwyRUFBOEU7SUFDOUUsMkVBQTBEO0lBQzFELCtEQUF5RztJQUV6Ryx1RUFBdUQ7SUFDdkQsc0VBQXdEO0lBQ3hELGtGQUFtRztJQUduRyw2RkFBNkY7SUFDN0Ysb0dBQW9HO0lBQ3BHLGtHQUFrRztJQUNsRywrRkFBK0Y7SUFFL0Y7Ozs7OztPQU1HO0lBQ0g7UUFFRSxnQ0FBc0IsUUFBZ0M7WUFBaEMsYUFBUSxHQUFSLFFBQVEsQ0FBd0I7WUFRdEQsa0dBQWtHO1lBQ2xHLFNBQVM7WUFDVCxlQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMvQyxvQkFBZSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN6RCx5QkFBb0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDbkUseUJBQW9CLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ25FLHlCQUFvQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNuRSx3QkFBbUIsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDakUsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ3JFLDBCQUFxQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNyRSxtQkFBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENB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LFdBQVcsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFFLE9BQU87Z0JBQzVFLE9BQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFVBQVU7b0JBQy9CLElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FDL0IsVUFBVSxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsS0FBSSxFQUFFLHFCQUFxQixFQUFFLG1CQUFtQixDQUFDLENBQUM7b0JBQzNGLE9BQU8sTUFBTSxDQUFDLGNBQWMsQ0FBQztnQkFDL0IsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0gscUJBQUM7SUFBRCxDQUFDLEFBM01ELENBQW9DLHNCQUFzQixHQTJNekQ7SUEzTVksd0NBQWMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7RXJyb3JDb2RlLCBuZ0Vycm9yQ29kZX0gZnJvbSAnLi4vLi4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtmaW5kRmxhdEluZGV4RW50cnlQb2ludCwgRmxhdEluZGV4R2VuZXJhdG9yfSBmcm9tICcuLi8uLi9lbnRyeV9wb2ludCc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCByZXNvbHZlfSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0ZhY3RvcnlHZW5lcmF0b3IsIGlzU2hpbSwgU2hpbUFkYXB0ZXIsIFNoaW1SZWZlcmVuY2VUYWdnZXIsIFN1bW1hcnlHZW5lcmF0b3J9IGZyb20gJy4uLy4uL3NoaW1zJztcbmltcG9ydCB7RmFjdG9yeVRyYWNrZXIsIFBlckZpbGVTaGltR2VuZXJhdG9yLCBUb3BMZXZlbFNoaW1HZW5lcmF0b3J9IGZyb20gJy4uLy4uL3NoaW1zL2FwaSc7XG5pbXBvcnQge1R5cGVDaGVja1NoaW1HZW5lcmF0b3J9IGZyb20gJy4uLy4uL3R5cGVjaGVjayc7XG5pbXBvcnQge25vcm1hbGl6ZVNlcGFyYXRvcnN9IGZyb20gJy4uLy4uL3V0aWwvc3JjL3BhdGgnO1xuaW1wb3J0IHtnZXRSb290RGlycywgaXNOb25EZWNsYXJhdGlvblRzUGF0aCwgUmVxdWlyZWREZWxlZ2F0aW9uc30gZnJvbSAnLi4vLi4vdXRpbC9zcmMvdHlwZXNjcmlwdCc7XG5pbXBvcnQge0V4dGVuZGVkVHNDb21waWxlckhvc3QsIE5nQ29tcGlsZXJBZGFwdGVyLCBOZ0NvbXBpbGVyT3B0aW9ucywgVW5pZmllZE1vZHVsZXNIb3N0fSBmcm9tICcuLi9hcGknO1xuXG4vLyBBIHBlcnNpc3RlbnQgc291cmNlIG9mIGJ1Z3MgaW4gQ29tcGlsZXJIb3N0IGRlbGVnYXRpb24gaGFzIGJlZW4gdGhlIGFkZGl0aW9uIGJ5IFRTIG9mIG5ldyxcbi8vIG9wdGlvbmFsIG1ldGhvZHMgb24gdHMuQ29tcGlsZXJIb3N0LiBTaW5jZSB0aGVzZSBtZXRob2RzIGFyZSBvcHRpb25hbCwgaXQncyBub3QgYSB0eXBlIGVycm9yIHRoYXRcbi8vIHRoZSBkZWxlZ2F0aW5nIGhvc3QgZG9lc24ndCBpbXBsZW1lbnQgb3IgZGVsZWdhdGUgdGhlbS4gVGhpcyBjYXVzZXMgc3VidGxlIHJ1bnRpbWUgZmFpbHVyZXMuIE5vXG4vLyBtb3JlLiBUaGlzIGluZnJhc3RydWN0dXJlIGVuc3VyZXMgdGhhdCBmYWlsaW5nIHRvIGRlbGVnYXRlIGEgbWV0aG9kIGlzIGEgY29tcGlsZS10aW1lIGVycm9yLlxuXG4vKipcbiAqIERlbGVnYXRlcyBhbGwgbWV0aG9kcyBvZiBgRXh0ZW5kZWRUc0NvbXBpbGVySG9zdGAgdG8gYSBkZWxlZ2F0ZSwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mXG4gKiBgZ2V0U291cmNlRmlsZWAgYW5kIGBmaWxlRXhpc3RzYCB3aGljaCBhcmUgaW1wbGVtZW50ZWQgaW4gYE5nQ29tcGlsZXJIb3N0YC5cbiAqXG4gKiBJZiBhIG5ldyBtZXRob2QgaXMgYWRkZWQgdG8gYHRzLkNvbXBpbGVySG9zdGAgd2hpY2ggaXMgbm90IGRlbGVnYXRlZCwgYSB0eXBlIGVycm9yIHdpbGwgYmVcbiAqIGdlbmVyYXRlZCBmb3IgdGhpcyBjbGFzcy5cbiAqL1xuZXhwb3J0IGNsYXNzIERlbGVnYXRpbmdDb21waWxlckhvc3QgaW1wbGVtZW50c1xuICAgIE9taXQ8UmVxdWlyZWREZWxlZ2F0aW9uczxFeHRlbmRlZFRzQ29tcGlsZXJIb3N0PiwgJ2dldFNvdXJjZUZpbGUnfCdmaWxlRXhpc3RzJz4ge1xuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgZGVsZWdhdGU6IEV4dGVuZGVkVHNDb21waWxlckhvc3QpIHt9XG5cbiAgcHJpdmF0ZSBkZWxlZ2F0ZU1ldGhvZDxNIGV4dGVuZHMga2V5b2YgRXh0ZW5kZWRUc0NvbXBpbGVySG9zdD4obmFtZTogTSk6XG4gICAgICBFeHRlbmRlZFRzQ29tcGlsZXJIb3N0W01dIHtcbiAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZVtuYW1lXSAhPT0gdW5kZWZpbmVkID8gKHRoaXMuZGVsZWdhdGVbbmFtZV0gYXMgYW55KS5iaW5kKHRoaXMuZGVsZWdhdGUpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gRXhjbHVkZWQgYXJlICdnZXRTb3VyY2VGaWxlJyBhbmQgJ2ZpbGVFeGlzdHMnLCB3aGljaCBhcmUgYWN0dWFsbHkgaW1wbGVtZW50ZWQgYnkgTmdDb21waWxlckhvc3RcbiAgLy8gYmVsb3cuXG4gIGNyZWF0ZUhhc2ggPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdjcmVhdGVIYXNoJyk7XG4gIGRpcmVjdG9yeUV4aXN0cyA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2RpcmVjdG9yeUV4aXN0cycpO1xuICBmaWxlTmFtZVRvTW9kdWxlTmFtZSA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2ZpbGVOYW1lVG9Nb2R1bGVOYW1lJyk7XG4gIGdldENhbmNlbGxhdGlvblRva2VuID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0Q2FuY2VsbGF0aW9uVG9rZW4nKTtcbiAgZ2V0Q2Fub25pY2FsRmlsZU5hbWUgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdnZXRDYW5vbmljYWxGaWxlTmFtZScpO1xuICBnZXRDdXJyZW50RGlyZWN0b3J5ID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0Q3VycmVudERpcmVjdG9yeScpO1xuICBnZXREZWZhdWx0TGliRmlsZU5hbWUgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdnZXREZWZhdWx0TGliRmlsZU5hbWUnKTtcbiAgZ2V0RGVmYXVsdExpYkxvY2F0aW9uID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0RGVmYXVsdExpYkxvY2F0aW9uJyk7XG4gIGdldERpcmVjdG9yaWVzID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0RGlyZWN0b3JpZXMnKTtcbiAgZ2V0RW52aXJvbm1lbnRWYXJpYWJsZSA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldEVudmlyb25tZW50VmFyaWFibGUnKTtcbiAgZ2V0TW9kaWZpZWRSZXNvdXJjZUZpbGVzID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0TW9kaWZpZWRSZXNvdXJjZUZpbGVzJyk7XG4gIGdldE5ld0xpbmUgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdnZXROZXdMaW5lJyk7XG4gIGdldFBhcnNlZENvbW1hbmRMaW5lID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0UGFyc2VkQ29tbWFuZExpbmUnKTtcbiAgZ2V0U291cmNlRmlsZUJ5UGF0aCA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldFNvdXJjZUZpbGVCeVBhdGgnKTtcbiAgcmVhZERpcmVjdG9yeSA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ3JlYWREaXJlY3RvcnknKTtcbiAgcmVhZEZpbGUgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdyZWFkRmlsZScpO1xuICByZWFkUmVzb3VyY2UgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdyZWFkUmVzb3VyY2UnKTtcbiAgdHJhbnNmb3JtUmVzb3VyY2UgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCd0cmFuc2Zvcm1SZXNvdXJjZScpO1xuICByZWFscGF0aCA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ3JlYWxwYXRoJyk7XG4gIHJlc29sdmVNb2R1bGVOYW1lcyA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ3Jlc29sdmVNb2R1bGVOYW1lcycpO1xuICByZXNvbHZlVHlwZVJlZmVyZW5jZURpcmVjdGl2ZXMgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdyZXNvbHZlVHlwZVJlZmVyZW5jZURpcmVjdGl2ZXMnKTtcbiAgcmVzb3VyY2VOYW1lVG9GaWxlTmFtZSA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ3Jlc291cmNlTmFtZVRvRmlsZU5hbWUnKTtcbiAgdHJhY2UgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCd0cmFjZScpO1xuICB1c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgndXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lcycpO1xuICB3cml0ZUZpbGUgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCd3cml0ZUZpbGUnKTtcbn1cblxuLyoqXG4gKiBBIHdyYXBwZXIgYXJvdW5kIGB0cy5Db21waWxlckhvc3RgIChwbHVzIGFueSBleHRlbnNpb24gbWV0aG9kcyBmcm9tIGBFeHRlbmRlZFRzQ29tcGlsZXJIb3N0YCkuXG4gKlxuICogSW4gb3JkZXIgZm9yIGEgY29uc3VtZXIgdG8gaW5jbHVkZSBBbmd1bGFyIGNvbXBpbGF0aW9uIGluIHRoZWlyIFR5cGVTY3JpcHQgY29tcGlsZXIsIHRoZVxuICogYHRzLlByb2dyYW1gIG11c3QgYmUgY3JlYXRlZCB3aXRoIGEgaG9zdCB0aGF0IGFkZHMgQW5ndWxhci1zcGVjaWZpYyBmaWxlcyAoZS5nLiBmYWN0b3JpZXMsXG4gKiBzdW1tYXJpZXMsIHRoZSB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nIGZpbGUsIGV0YykgdG8gdGhlIGNvbXBpbGF0aW9uLiBgTmdDb21waWxlckhvc3RgIGlzIHRoZVxuICogaG9zdCBpbXBsZW1lbnRhdGlvbiB3aGljaCBzdXBwb3J0cyB0aGlzLlxuICpcbiAqIFRoZSBpbnRlcmZhY2UgaW1wbGVtZW50YXRpb25zIGhlcmUgZW5zdXJlIHRoYXQgYE5nQ29tcGlsZXJIb3N0YCBmdWxseSBkZWxlZ2F0ZXMgdG9cbiAqIGBFeHRlbmRlZFRzQ29tcGlsZXJIb3N0YCBtZXRob2RzIHdoZW5ldmVyIHByZXNlbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ0NvbXBpbGVySG9zdCBleHRlbmRzIERlbGVnYXRpbmdDb21waWxlckhvc3QgaW1wbGVtZW50c1xuICAgIFJlcXVpcmVkRGVsZWdhdGlvbnM8RXh0ZW5kZWRUc0NvbXBpbGVySG9zdD4sIEV4dGVuZGVkVHNDb21waWxlckhvc3QsIE5nQ29tcGlsZXJBZGFwdGVyIHtcbiAgcmVhZG9ubHkgZmFjdG9yeVRyYWNrZXI6IEZhY3RvcnlUcmFja2VyfG51bGwgPSBudWxsO1xuICByZWFkb25seSBlbnRyeVBvaW50OiBBYnNvbHV0ZUZzUGF0aHxudWxsID0gbnVsbDtcbiAgcmVhZG9ubHkgY29uc3RydWN0aW9uRGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXTtcblxuICByZWFkb25seSBpbnB1dEZpbGVzOiBSZWFkb25seUFycmF5PHN0cmluZz47XG4gIHJlYWRvbmx5IHJvb3REaXJzOiBSZWFkb25seUFycmF5PEFic29sdXRlRnNQYXRoPjtcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZGVsZWdhdGU6IEV4dGVuZGVkVHNDb21waWxlckhvc3QsIGlucHV0RmlsZXM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPixcbiAgICAgIHJvb3REaXJzOiBSZWFkb25seUFycmF5PEFic29sdXRlRnNQYXRoPiwgcHJpdmF0ZSBzaGltQWRhcHRlcjogU2hpbUFkYXB0ZXIsXG4gICAgICBwcml2YXRlIHNoaW1UYWdnZXI6IFNoaW1SZWZlcmVuY2VUYWdnZXIsIGVudHJ5UG9pbnQ6IEFic29sdXRlRnNQYXRofG51bGwsXG4gICAgICBmYWN0b3J5VHJhY2tlcjogRmFjdG9yeVRyYWNrZXJ8bnVsbCwgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSkge1xuICAgIHN1cGVyKGRlbGVnYXRlKTtcblxuICAgIHRoaXMuZmFjdG9yeVRyYWNrZXIgPSBmYWN0b3J5VHJhY2tlcjtcbiAgICB0aGlzLmVudHJ5UG9pbnQgPSBlbnRyeVBvaW50O1xuICAgIHRoaXMuY29uc3RydWN0aW9uRGlhZ25vc3RpY3MgPSBkaWFnbm9zdGljcztcbiAgICB0aGlzLmlucHV0RmlsZXMgPSBbLi4uaW5wdXRGaWxlcywgLi4uc2hpbUFkYXB0ZXIuZXh0cmFJbnB1dEZpbGVzXTtcbiAgICB0aGlzLnJvb3REaXJzID0gcm9vdERpcnM7XG5cbiAgICBpZiAodGhpcy5yZXNvbHZlTW9kdWxlTmFtZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gSW4gb3JkZXIgdG8gcmV1c2UgdGhlIG1vZHVsZSByZXNvbHV0aW9uIGNhY2hlIGR1cmluZyB0aGUgY3JlYXRpb24gb2YgdGhlIHR5cGUtY2hlY2tcbiAgICAgIC8vIHByb2dyYW0sIHdlJ2xsIG5lZWQgdG8gcHJvdmlkZSBgcmVzb2x2ZU1vZHVsZU5hbWVzYCBpZiB0aGUgZGVsZWdhdGUgZGlkIG5vdCBwcm92aWRlIG9uZS5cbiAgICAgIHRoaXMucmVzb2x2ZU1vZHVsZU5hbWVzID0gdGhpcy5jcmVhdGVDYWNoZWRSZXNvbHZlTW9kdWxlTmFtZXNGdW5jdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgYSBzZXQgb2YgYHRzLlNvdXJjZUZpbGVgcyB3aGljaCBzaG91bGQgbm90IGJlIGVtaXR0ZWQgYXMgSlMgZmlsZXMuXG4gICAqXG4gICAqIEF2YWlsYWJsZSBhZnRlciB0aGlzIGhvc3QgaXMgdXNlZCB0byBjcmVhdGUgYSBgdHMuUHJvZ3JhbWAgKHdoaWNoIGNhdXNlcyBhbGwgdGhlIGZpbGVzIGluIHRoZVxuICAgKiBwcm9ncmFtIHRvIGJlIGVudW1lcmF0ZWQpLlxuICAgKi9cbiAgZ2V0IGlnbm9yZUZvckVtaXQoKTogU2V0PHRzLlNvdXJjZUZpbGU+IHtcbiAgICByZXR1cm4gdGhpcy5zaGltQWRhcHRlci5pZ25vcmVGb3JFbWl0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBhcnJheSBvZiBzaGltIGV4dGVuc2lvbiBwcmVmaXhlcyBmb3Igd2hpY2ggc2hpbXMgd2VyZSBjcmVhdGVkIGZvciBlYWNoIG9yaWdpbmFsXG4gICAqIGZpbGUuXG4gICAqL1xuICBnZXQgc2hpbUV4dGVuc2lvblByZWZpeGVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5zaGltQWRhcHRlci5leHRlbnNpb25QcmVmaXhlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBjbGVhbnVwIHRoYXQgbmVlZHMgdG8gaGFwcGVuIGFmdGVyIGEgYHRzLlByb2dyYW1gIGhhcyBiZWVuIGNyZWF0ZWQgdXNpbmcgdGhpcyBob3N0LlxuICAgKi9cbiAgcG9zdFByb2dyYW1DcmVhdGlvbkNsZWFudXAoKTogdm9pZCB7XG4gICAgdGhpcy5zaGltVGFnZ2VyLmZpbmFsaXplKCk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGFuIGBOZ0NvbXBpbGVySG9zdGAgZnJvbSBhIGRlbGVnYXRlIGhvc3QsIGFuIGFycmF5IG9mIGlucHV0IGZpbGVuYW1lcywgYW5kIHRoZSBmdWxsIHNldFxuICAgKiBvZiBUeXBlU2NyaXB0IGFuZCBBbmd1bGFyIGNvbXBpbGVyIG9wdGlvbnMuXG4gICAqL1xuICBzdGF0aWMgd3JhcChcbiAgICAgIGRlbGVnYXRlOiB0cy5Db21waWxlckhvc3QsIGlucHV0RmlsZXM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiwgb3B0aW9uczogTmdDb21waWxlck9wdGlvbnMsXG4gICAgICBvbGRQcm9ncmFtOiB0cy5Qcm9ncmFtfG51bGwpOiBOZ0NvbXBpbGVySG9zdCB7XG4gICAgLy8gVE9ETyhhbHhodWIpOiByZW1vdmUgdGhlIGZhbGxiYWNrIHRvIGFsbG93RW1wdHlDb2RlZ2VuRmlsZXMgYWZ0ZXIgdmVyaWZ5aW5nIHRoYXQgdGhlIHJlc3Qgb2ZcbiAgICAvLyBvdXIgYnVpbGQgdG9vbGluZyBpcyBubyBsb25nZXIgcmVseWluZyBvbiBpdC5cbiAgICBjb25zdCBhbGxvd0VtcHR5Q29kZWdlbkZpbGVzID0gb3B0aW9ucy5hbGxvd0VtcHR5Q29kZWdlbkZpbGVzIHx8IGZhbHNlO1xuICAgIGNvbnN0IHNob3VsZEdlbmVyYXRlRmFjdG9yeVNoaW1zID0gb3B0aW9ucy5nZW5lcmF0ZU5nRmFjdG9yeVNoaW1zICE9PSB1bmRlZmluZWQgP1xuICAgICAgICBvcHRpb25zLmdlbmVyYXRlTmdGYWN0b3J5U2hpbXMgOlxuICAgICAgICBhbGxvd0VtcHR5Q29kZWdlbkZpbGVzO1xuXG4gICAgY29uc3Qgc2hvdWxkR2VuZXJhdGVTdW1tYXJ5U2hpbXMgPSBvcHRpb25zLmdlbmVyYXRlTmdTdW1tYXJ5U2hpbXMgIT09IHVuZGVmaW5lZCA/XG4gICAgICAgIG9wdGlvbnMuZ2VuZXJhdGVOZ1N1bW1hcnlTaGltcyA6XG4gICAgICAgIGFsbG93RW1wdHlDb2RlZ2VuRmlsZXM7XG5cblxuICAgIGNvbnN0IHRvcExldmVsU2hpbUdlbmVyYXRvcnM6IFRvcExldmVsU2hpbUdlbmVyYXRvcltdID0gW107XG4gICAgY29uc3QgcGVyRmlsZVNoaW1HZW5lcmF0b3JzOiBQZXJGaWxlU2hpbUdlbmVyYXRvcltdID0gW107XG5cbiAgICBpZiAoc2hvdWxkR2VuZXJhdGVTdW1tYXJ5U2hpbXMpIHtcbiAgICAgIC8vIFN1bW1hcnkgZ2VuZXJhdGlvbi5cbiAgICAgIHBlckZpbGVTaGltR2VuZXJhdG9ycy5wdXNoKG5ldyBTdW1tYXJ5R2VuZXJhdG9yKCkpO1xuICAgIH1cblxuICAgIGxldCBmYWN0b3J5VHJhY2tlcjogRmFjdG9yeVRyYWNrZXJ8bnVsbCA9IG51bGw7XG4gICAgaWYgKHNob3VsZEdlbmVyYXRlRmFjdG9yeVNoaW1zKSB7XG4gICAgICBjb25zdCBmYWN0b3J5R2VuZXJhdG9yID0gbmV3IEZhY3RvcnlHZW5lcmF0b3IoKTtcbiAgICAgIHBlckZpbGVTaGltR2VuZXJhdG9ycy5wdXNoKGZhY3RvcnlHZW5lcmF0b3IpO1xuXG4gICAgICBmYWN0b3J5VHJhY2tlciA9IGZhY3RvcnlHZW5lcmF0b3I7XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vdERpcnMgPSBnZXRSb290RGlycyhkZWxlZ2F0ZSwgb3B0aW9ucyBhcyB0cy5Db21waWxlck9wdGlvbnMpO1xuXG4gICAgcGVyRmlsZVNoaW1HZW5lcmF0b3JzLnB1c2gobmV3IFR5cGVDaGVja1NoaW1HZW5lcmF0b3IoKSk7XG5cbiAgICBsZXQgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuXG4gICAgY29uc3Qgbm9ybWFsaXplZFRzSW5wdXRGaWxlczogQWJzb2x1dGVGc1BhdGhbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgaW5wdXRGaWxlIG9mIGlucHV0RmlsZXMpIHtcbiAgICAgIGlmICghaXNOb25EZWNsYXJhdGlvblRzUGF0aChpbnB1dEZpbGUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgbm9ybWFsaXplZFRzSW5wdXRGaWxlcy5wdXNoKHJlc29sdmUoaW5wdXRGaWxlKSk7XG4gICAgfVxuXG4gICAgbGV0IGVudHJ5UG9pbnQ6IEFic29sdXRlRnNQYXRofG51bGwgPSBudWxsO1xuICAgIGlmIChvcHRpb25zLmZsYXRNb2R1bGVPdXRGaWxlICE9IG51bGwgJiYgb3B0aW9ucy5mbGF0TW9kdWxlT3V0RmlsZSAhPT0gJycpIHtcbiAgICAgIGVudHJ5UG9pbnQgPSBmaW5kRmxhdEluZGV4RW50cnlQb2ludChub3JtYWxpemVkVHNJbnB1dEZpbGVzKTtcbiAgICAgIGlmIChlbnRyeVBvaW50ID09PSBudWxsKSB7XG4gICAgICAgIC8vIFRoaXMgZXJyb3IgbWVzc2FnZSB0YWxrcyBzcGVjaWZpY2FsbHkgYWJvdXQgaGF2aW5nIGEgc2luZ2xlIC50cyBmaWxlIGluIFwiZmlsZXNcIi4gSG93ZXZlclxuICAgICAgICAvLyB0aGUgYWN0dWFsIGxvZ2ljIGlzIGEgYml0IG1vcmUgcGVybWlzc2l2ZS4gSWYgYSBzaW5nbGUgZmlsZSBleGlzdHMsIHRoYXQgd2lsbCBiZSB0YWtlbixcbiAgICAgICAgLy8gb3RoZXJ3aXNlIHRoZSBoaWdoZXN0IGxldmVsIChzaG9ydGVzdCBwYXRoKSBcImluZGV4LnRzXCIgZmlsZSB3aWxsIGJlIHVzZWQgYXMgdGhlIGZsYXRcbiAgICAgICAgLy8gbW9kdWxlIGVudHJ5IHBvaW50IGluc3RlYWQuIElmIG5laXRoZXIgb2YgdGhlc2UgY29uZGl0aW9ucyBhcHBseSwgdGhlIGVycm9yIGJlbG93IGlzXG4gICAgICAgIC8vIGdpdmVuLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGUgdXNlciBpcyBub3QgaW5mb3JtZWQgYWJvdXQgdGhlIFwiaW5kZXgudHNcIiBvcHRpb24gYXMgdGhpcyBiZWhhdmlvciBpcyBkZXByZWNhdGVkIC1cbiAgICAgICAgLy8gYW4gZXhwbGljaXQgZW50cnlwb2ludCBzaG91bGQgYWx3YXlzIGJlIHNwZWNpZmllZC5cbiAgICAgICAgZGlhZ25vc3RpY3MucHVzaCh7XG4gICAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgICBjb2RlOiBuZ0Vycm9yQ29kZShFcnJvckNvZGUuQ09ORklHX0ZMQVRfTU9EVUxFX05PX0lOREVYKSxcbiAgICAgICAgICBmaWxlOiB1bmRlZmluZWQsXG4gICAgICAgICAgc3RhcnQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICBsZW5ndGg6IHVuZGVmaW5lZCxcbiAgICAgICAgICBtZXNzYWdlVGV4dDpcbiAgICAgICAgICAgICAgJ0FuZ3VsYXIgY29tcGlsZXIgb3B0aW9uIFwiZmxhdE1vZHVsZU91dEZpbGVcIiByZXF1aXJlcyBvbmUgYW5kIG9ubHkgb25lIC50cyBmaWxlIGluIHRoZSBcImZpbGVzXCIgZmllbGQuJyxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmbGF0TW9kdWxlSWQgPSBvcHRpb25zLmZsYXRNb2R1bGVJZCB8fCBudWxsO1xuICAgICAgICBjb25zdCBmbGF0TW9kdWxlT3V0RmlsZSA9IG5vcm1hbGl6ZVNlcGFyYXRvcnMob3B0aW9ucy5mbGF0TW9kdWxlT3V0RmlsZSk7XG4gICAgICAgIGNvbnN0IGZsYXRJbmRleEdlbmVyYXRvciA9XG4gICAgICAgICAgICBuZXcgRmxhdEluZGV4R2VuZXJhdG9yKGVudHJ5UG9pbnQsIGZsYXRNb2R1bGVPdXRGaWxlLCBmbGF0TW9kdWxlSWQpO1xuICAgICAgICB0b3BMZXZlbFNoaW1HZW5lcmF0b3JzLnB1c2goZmxhdEluZGV4R2VuZXJhdG9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzaGltQWRhcHRlciA9IG5ldyBTaGltQWRhcHRlcihcbiAgICAgICAgZGVsZWdhdGUsIG5vcm1hbGl6ZWRUc0lucHV0RmlsZXMsIHRvcExldmVsU2hpbUdlbmVyYXRvcnMsIHBlckZpbGVTaGltR2VuZXJhdG9ycyxcbiAgICAgICAgb2xkUHJvZ3JhbSk7XG4gICAgY29uc3Qgc2hpbVRhZ2dlciA9XG4gICAgICAgIG5ldyBTaGltUmVmZXJlbmNlVGFnZ2VyKHBlckZpbGVTaGltR2VuZXJhdG9ycy5tYXAoZ2VuID0+IGdlbi5leHRlbnNpb25QcmVmaXgpKTtcbiAgICByZXR1cm4gbmV3IE5nQ29tcGlsZXJIb3N0KFxuICAgICAgICBkZWxlZ2F0ZSwgaW5wdXRGaWxlcywgcm9vdERpcnMsIHNoaW1BZGFwdGVyLCBzaGltVGFnZ2VyLCBlbnRyeVBvaW50LCBmYWN0b3J5VHJhY2tlcixcbiAgICAgICAgZGlhZ25vc3RpY3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIGB0cy5Tb3VyY2VGaWxlYCBpcyBhIHNoaW0gZmlsZS5cbiAgICpcbiAgICogSWYgdGhpcyByZXR1cm5zIGZhbHNlLCB0aGUgZmlsZSBpcyB1c2VyLXByb3ZpZGVkLlxuICAgKi9cbiAgaXNTaGltKHNmOiB0cy5Tb3VyY2VGaWxlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzU2hpbShzZik7XG4gIH1cblxuICBnZXRTb3VyY2VGaWxlKFxuICAgICAgZmlsZU5hbWU6IHN0cmluZywgbGFuZ3VhZ2VWZXJzaW9uOiB0cy5TY3JpcHRUYXJnZXQsXG4gICAgICBvbkVycm9yPzogKChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQpfHVuZGVmaW5lZCxcbiAgICAgIHNob3VsZENyZWF0ZU5ld1NvdXJjZUZpbGU/OiBib29sZWFufHVuZGVmaW5lZCk6IHRzLlNvdXJjZUZpbGV8dW5kZWZpbmVkIHtcbiAgICAvLyBJcyB0aGlzIGEgcHJldmlvdXNseSBrbm93biBzaGltP1xuICAgIGNvbnN0IHNoaW1TZiA9IHRoaXMuc2hpbUFkYXB0ZXIubWF5YmVHZW5lcmF0ZShyZXNvbHZlKGZpbGVOYW1lKSk7XG4gICAgaWYgKHNoaW1TZiAhPT0gbnVsbCkge1xuICAgICAgLy8gWWVzLCBzbyByZXR1cm4gaXQuXG4gICAgICByZXR1cm4gc2hpbVNmO1xuICAgIH1cblxuICAgIC8vIE5vLCBzbyBpdCdzIGEgZmlsZSB3aGljaCBtaWdodCBuZWVkIHNoaW1zIChvciBhIGZpbGUgd2hpY2ggZG9lc24ndCBleGlzdCkuXG4gICAgY29uc3Qgc2YgPVxuICAgICAgICB0aGlzLmRlbGVnYXRlLmdldFNvdXJjZUZpbGUoZmlsZU5hbWUsIGxhbmd1YWdlVmVyc2lvbiwgb25FcnJvciwgc2hvdWxkQ3JlYXRlTmV3U291cmNlRmlsZSk7XG4gICAgaWYgKHNmID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdGhpcy5zaGltVGFnZ2VyLnRhZyhzZik7XG4gICAgcmV0dXJuIHNmO1xuICB9XG5cbiAgZmlsZUV4aXN0cyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8gQ29uc2lkZXIgdGhlIGZpbGUgYXMgZXhpc3Rpbmcgd2hlbmV2ZXJcbiAgICAvLyAgMSkgaXQgcmVhbGx5IGRvZXMgZXhpc3QgaW4gdGhlIGRlbGVnYXRlIGhvc3QsIG9yXG4gICAgLy8gIDIpIGF0IGxlYXN0IG9uZSBvZiB0aGUgc2hpbSBnZW5lcmF0b3JzIHJlY29nbml6ZXMgaXRcbiAgICAvLyBOb3RlIHRoYXQgd2UgY2FuIHBhc3MgdGhlIGZpbGUgbmFtZSBhcyBicmFuZGVkIGFic29sdXRlIGZzIHBhdGggYmVjYXVzZSBUeXBlU2NyaXB0XG4gICAgLy8gaW50ZXJuYWxseSBvbmx5IHBhc3NlcyBQT1NJWC1saWtlIHBhdGhzLlxuICAgIC8vXG4gICAgLy8gQWxzbyBub3RlIHRoYXQgdGhlIGBtYXliZUdlbmVyYXRlYCBjaGVjayBiZWxvdyBjaGVja3MgZm9yIGJvdGggYG51bGxgIGFuZCBgdW5kZWZpbmVkYC5cbiAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZS5maWxlRXhpc3RzKGZpbGVOYW1lKSB8fFxuICAgICAgICB0aGlzLnNoaW1BZGFwdGVyLm1heWJlR2VuZXJhdGUocmVzb2x2ZShmaWxlTmFtZSkpICE9IG51bGw7XG4gIH1cblxuICBnZXQgdW5pZmllZE1vZHVsZXNIb3N0KCk6IFVuaWZpZWRNb2R1bGVzSG9zdHxudWxsIHtcbiAgICByZXR1cm4gdGhpcy5maWxlTmFtZVRvTW9kdWxlTmFtZSAhPT0gdW5kZWZpbmVkID8gdGhpcyBhcyBVbmlmaWVkTW9kdWxlc0hvc3QgOiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVDYWNoZWRSZXNvbHZlTW9kdWxlTmFtZXNGdW5jdGlvbigpOiB0cy5Db21waWxlckhvc3RbJ3Jlc29sdmVNb2R1bGVOYW1lcyddIHtcbiAgICBjb25zdCBtb2R1bGVSZXNvbHV0aW9uQ2FjaGUgPSB0cy5jcmVhdGVNb2R1bGVSZXNvbHV0aW9uQ2FjaGUoXG4gICAgICAgIHRoaXMuZ2V0Q3VycmVudERpcmVjdG9yeSgpLCB0aGlzLmdldENhbm9uaWNhbEZpbGVOYW1lLmJpbmQodGhpcykpO1xuXG4gICAgcmV0dXJuIChtb2R1bGVOYW1lcywgY29udGFpbmluZ0ZpbGUsIHJldXNlZE5hbWVzLCByZWRpcmVjdGVkUmVmZXJlbmNlLCBvcHRpb25zKSA9PiB7XG4gICAgICByZXR1cm4gbW9kdWxlTmFtZXMubWFwKG1vZHVsZU5hbWUgPT4ge1xuICAgICAgICBjb25zdCBtb2R1bGUgPSB0cy5yZXNvbHZlTW9kdWxlTmFtZShcbiAgICAgICAgICAgIG1vZHVsZU5hbWUsIGNvbnRhaW5pbmdGaWxlLCBvcHRpb25zLCB0aGlzLCBtb2R1bGVSZXNvbHV0aW9uQ2FjaGUsIHJlZGlyZWN0ZWRSZWZlcmVuY2UpO1xuICAgICAgICByZXR1cm4gbW9kdWxlLnJlc29sdmVkTW9kdWxlO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxufVxuIl19