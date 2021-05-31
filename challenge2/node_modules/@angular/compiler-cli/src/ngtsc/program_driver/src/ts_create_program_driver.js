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
        define("@angular/compiler-cli/src/ngtsc/program_driver/src/ts_create_program_driver", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/shims", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/program_driver/src/api"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TsCreateProgramDriver = exports.DelegatingCompilerHost = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var shims_1 = require("@angular/compiler-cli/src/ngtsc/shims");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/program_driver/src/api");
    /**
     * Delegates all methods of `ts.CompilerHost` to a delegate, with the exception of
     * `getSourceFile`, `fileExists` and `writeFile` which are implemented in `TypeCheckProgramHost`.
     *
     * If a new method is added to `ts.CompilerHost` which is not delegated, a type error will be
     * generated for this class.
     */
    var DelegatingCompilerHost = /** @class */ (function () {
        function DelegatingCompilerHost(delegate) {
            this.delegate = delegate;
            // Excluded are 'getSourceFile', 'fileExists' and 'writeFile', which are actually implemented by
            // `TypeCheckProgramHost` below.
            this.createHash = this.delegateMethod('createHash');
            this.directoryExists = this.delegateMethod('directoryExists');
            this.getCancellationToken = this.delegateMethod('getCancellationToken');
            this.getCanonicalFileName = this.delegateMethod('getCanonicalFileName');
            this.getCurrentDirectory = this.delegateMethod('getCurrentDirectory');
            this.getDefaultLibFileName = this.delegateMethod('getDefaultLibFileName');
            this.getDefaultLibLocation = this.delegateMethod('getDefaultLibLocation');
            this.getDirectories = this.delegateMethod('getDirectories');
            this.getEnvironmentVariable = this.delegateMethod('getEnvironmentVariable');
            this.getNewLine = this.delegateMethod('getNewLine');
            this.getParsedCommandLine = this.delegateMethod('getParsedCommandLine');
            this.getSourceFileByPath = this.delegateMethod('getSourceFileByPath');
            this.readDirectory = this.delegateMethod('readDirectory');
            this.readFile = this.delegateMethod('readFile');
            this.realpath = this.delegateMethod('realpath');
            this.resolveModuleNames = this.delegateMethod('resolveModuleNames');
            this.resolveTypeReferenceDirectives = this.delegateMethod('resolveTypeReferenceDirectives');
            this.trace = this.delegateMethod('trace');
            this.useCaseSensitiveFileNames = this.delegateMethod('useCaseSensitiveFileNames');
        }
        DelegatingCompilerHost.prototype.delegateMethod = function (name) {
            return this.delegate[name] !== undefined ? this.delegate[name].bind(this.delegate) :
                undefined;
        };
        return DelegatingCompilerHost;
    }());
    exports.DelegatingCompilerHost = DelegatingCompilerHost;
    /**
     * A `ts.CompilerHost` which augments source files.
     */
    var UpdatedProgramHost = /** @class */ (function (_super) {
        tslib_1.__extends(UpdatedProgramHost, _super);
        function UpdatedProgramHost(sfMap, originalProgram, delegate, shimExtensionPrefixes) {
            var _this = _super.call(this, delegate) || this;
            _this.originalProgram = originalProgram;
            _this.shimExtensionPrefixes = shimExtensionPrefixes;
            /**
             * The `ShimReferenceTagger` responsible for tagging `ts.SourceFile`s loaded via this host.
             *
             * The `UpdatedProgramHost` is used in the creation of a new `ts.Program`. Even though this new
             * program is based on a prior one, TypeScript will still start from the root files and enumerate
             * all source files to include in the new program.  This means that just like during the original
             * program's creation, these source files must be tagged with references to per-file shims in
             * order for those shims to be loaded, and then cleaned up afterwards. Thus the
             * `UpdatedProgramHost` has its own `ShimReferenceTagger` to perform this function.
             */
            _this.shimTagger = new shims_1.ShimReferenceTagger(_this.shimExtensionPrefixes);
            _this.sfMap = sfMap;
            return _this;
        }
        UpdatedProgramHost.prototype.getSourceFile = function (fileName, languageVersion, onError, shouldCreateNewSourceFile) {
            // Try to use the same `ts.SourceFile` as the original program, if possible. This guarantees
            // that program reuse will be as efficient as possible.
            var delegateSf = this.originalProgram.getSourceFile(fileName);
            if (delegateSf === undefined) {
                // Something went wrong and a source file is being requested that's not in the original
                // program. Just in case, try to retrieve it from the delegate.
                delegateSf = this.delegate.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
            }
            if (delegateSf === undefined) {
                return undefined;
            }
            // Look for replacements.
            var sf;
            if (this.sfMap.has(fileName)) {
                sf = this.sfMap.get(fileName);
                shims_1.copyFileShimData(delegateSf, sf);
            }
            else {
                sf = delegateSf;
            }
            // TypeScript doesn't allow returning redirect source files. To avoid unforeseen errors we
            // return the original source file instead of the redirect target.
            sf = typescript_1.toUnredirectedSourceFile(sf);
            this.shimTagger.tag(sf);
            return sf;
        };
        UpdatedProgramHost.prototype.postProgramCreationCleanup = function () {
            this.shimTagger.finalize();
        };
        UpdatedProgramHost.prototype.writeFile = function () {
            throw new Error("TypeCheckProgramHost should never write files");
        };
        UpdatedProgramHost.prototype.fileExists = function (fileName) {
            return this.sfMap.has(fileName) || this.delegate.fileExists(fileName);
        };
        return UpdatedProgramHost;
    }(DelegatingCompilerHost));
    /**
     * Updates a `ts.Program` instance with a new one that incorporates specific changes, using the
     * TypeScript compiler APIs for incremental program creation.
     */
    var TsCreateProgramDriver = /** @class */ (function () {
        function TsCreateProgramDriver(originalProgram, originalHost, options, shimExtensionPrefixes) {
            this.originalProgram = originalProgram;
            this.originalHost = originalHost;
            this.options = options;
            this.shimExtensionPrefixes = shimExtensionPrefixes;
            /**
             * A map of source file paths to replacement `ts.SourceFile`s for those paths.
             *
             * Effectively, this tracks the delta between the user's program (represented by the
             * `originalHost`) and the template type-checking program being managed.
             */
            this.sfMap = new Map();
            this.program = this.originalProgram;
            this.supportsInlineOperations = true;
        }
        TsCreateProgramDriver.prototype.getProgram = function () {
            return this.program;
        };
        TsCreateProgramDriver.prototype.updateFiles = function (contents, updateMode) {
            var e_1, _a;
            if (contents.size === 0) {
                // No changes have been requested. Is it safe to skip updating entirely?
                // If UpdateMode is Incremental, then yes. If UpdateMode is Complete, then it's safe to skip
                // only if there are no active changes already (that would be cleared by the update).
                if (updateMode !== api_1.UpdateMode.Complete || this.sfMap.size === 0) {
                    // No changes would be made to the `ts.Program` anyway, so it's safe to do nothing here.
                    return;
                }
            }
            if (updateMode === api_1.UpdateMode.Complete) {
                this.sfMap.clear();
            }
            try {
                for (var _b = tslib_1.__values(contents.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 2), filePath = _d[0], text = _d[1];
                    this.sfMap.set(filePath, ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var host = new UpdatedProgramHost(this.sfMap, this.originalProgram, this.originalHost, this.shimExtensionPrefixes);
            var oldProgram = this.program;
            // Retag the old program's `ts.SourceFile`s with shim tags, to allow TypeScript to reuse the
            // most data.
            shims_1.retagAllTsFiles(oldProgram);
            this.program = ts.createProgram({
                host: host,
                rootNames: this.program.getRootFileNames(),
                options: this.options,
                oldProgram: oldProgram,
            });
            host.postProgramCreationCleanup();
            // And untag them afterwards. We explicitly untag both programs here, because the oldProgram
            // may still be used for emit and needs to not contain tags.
            shims_1.untagAllTsFiles(this.program);
            shims_1.untagAllTsFiles(oldProgram);
        };
        return TsCreateProgramDriver;
    }());
    exports.TsCreateProgramDriver = TsCreateProgramDriver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHNfY3JlYXRlX3Byb2dyYW1fZHJpdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9wcm9ncmFtX2RyaXZlci9zcmMvdHNfY3JlYXRlX3Byb2dyYW1fZHJpdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFHakMsK0RBQW9HO0lBQ3BHLGtGQUF3RjtJQUV4Riw4RUFBZ0Q7SUFFaEQ7Ozs7OztPQU1HO0lBQ0g7UUFFRSxnQ0FBc0IsUUFBeUI7WUFBekIsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7WUFPL0MsZ0dBQWdHO1lBQ2hHLGdDQUFnQztZQUNoQyxlQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMvQyxvQkFBZSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN6RCx5QkFBb0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDbkUseUJBQW9CLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ25FLHdCQUFtQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUNqRSwwQkFBcUIsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDckUsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ3JFLG1CQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3ZELDJCQUFzQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUN2RSxlQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMs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QU8sQ0FBQyxDQUFDO1lBQzlCLHVCQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUNILDRCQUFDO0lBQUQsQ0FBQyxBQTlERCxJQThEQztJQTlEWSxzREFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGh9IGZyb20gJy4uLy4uL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Y29weUZpbGVTaGltRGF0YSwgcmV0YWdBbGxUc0ZpbGVzLCBTaGltUmVmZXJlbmNlVGFnZ2VyLCB1bnRhZ0FsbFRzRmlsZXN9IGZyb20gJy4uLy4uL3NoaW1zJztcbmltcG9ydCB7UmVxdWlyZWREZWxlZ2F0aW9ucywgdG9VbnJlZGlyZWN0ZWRTb3VyY2VGaWxlfSBmcm9tICcuLi8uLi91dGlsL3NyYy90eXBlc2NyaXB0JztcblxuaW1wb3J0IHtQcm9ncmFtRHJpdmVyLCBVcGRhdGVNb2RlfSBmcm9tICcuL2FwaSc7XG5cbi8qKlxuICogRGVsZWdhdGVzIGFsbCBtZXRob2RzIG9mIGB0cy5Db21waWxlckhvc3RgIHRvIGEgZGVsZWdhdGUsIHdpdGggdGhlIGV4Y2VwdGlvbiBvZlxuICogYGdldFNvdXJjZUZpbGVgLCBgZmlsZUV4aXN0c2AgYW5kIGB3cml0ZUZpbGVgIHdoaWNoIGFyZSBpbXBsZW1lbnRlZCBpbiBgVHlwZUNoZWNrUHJvZ3JhbUhvc3RgLlxuICpcbiAqIElmIGEgbmV3IG1ldGhvZCBpcyBhZGRlZCB0byBgdHMuQ29tcGlsZXJIb3N0YCB3aGljaCBpcyBub3QgZGVsZWdhdGVkLCBhIHR5cGUgZXJyb3Igd2lsbCBiZVxuICogZ2VuZXJhdGVkIGZvciB0aGlzIGNsYXNzLlxuICovXG5leHBvcnQgY2xhc3MgRGVsZWdhdGluZ0NvbXBpbGVySG9zdCBpbXBsZW1lbnRzXG4gICAgT21pdDxSZXF1aXJlZERlbGVnYXRpb25zPHRzLkNvbXBpbGVySG9zdD4sICdnZXRTb3VyY2VGaWxlJ3wnZmlsZUV4aXN0cyd8J3dyaXRlRmlsZSc+IHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGRlbGVnYXRlOiB0cy5Db21waWxlckhvc3QpIHt9XG5cbiAgcHJpdmF0ZSBkZWxlZ2F0ZU1ldGhvZDxNIGV4dGVuZHMga2V5b2YgdHMuQ29tcGlsZXJIb3N0PihuYW1lOiBNKTogdHMuQ29tcGlsZXJIb3N0W01dIHtcbiAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZVtuYW1lXSAhPT0gdW5kZWZpbmVkID8gKHRoaXMuZGVsZWdhdGVbbmFtZV0gYXMgYW55KS5iaW5kKHRoaXMuZGVsZWdhdGUpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gRXhjbHVkZWQgYXJlICdnZXRTb3VyY2VGaWxlJywgJ2ZpbGVFeGlzdHMnIGFuZCAnd3JpdGVGaWxlJywgd2hpY2ggYXJlIGFjdHVhbGx5IGltcGxlbWVudGVkIGJ5XG4gIC8vIGBUeXBlQ2hlY2tQcm9ncmFtSG9zdGAgYmVsb3cuXG4gIGNyZWF0ZUhhc2ggPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdjcmVhdGVIYXNoJyk7XG4gIGRpcmVjdG9yeUV4aXN0cyA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2RpcmVjdG9yeUV4aXN0cycpO1xuICBnZXRDYW5jZWxsYXRpb25Ub2tlbiA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldENhbmNlbGxhdGlvblRva2VuJyk7XG4gIGdldENhbm9uaWNhbEZpbGVOYW1lID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0Q2Fub25pY2FsRmlsZU5hbWUnKTtcbiAgZ2V0Q3VycmVudERpcmVjdG9yeSA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldEN1cnJlbnREaXJlY3RvcnknKTtcbiAgZ2V0RGVmYXVsdExpYkZpbGVOYW1lID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0RGVmYXVsdExpYkZpbGVOYW1lJyk7XG4gIGdldERlZmF1bHRMaWJMb2NhdGlvbiA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldERlZmF1bHRMaWJMb2NhdGlvbicpO1xuICBnZXREaXJlY3RvcmllcyA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldERpcmVjdG9yaWVzJyk7XG4gIGdldEVudmlyb25tZW50VmFyaWFibGUgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdnZXRFbnZpcm9ubWVudFZhcmlhYmxlJyk7XG4gIGdldE5ld0xpbmUgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdnZXROZXdMaW5lJyk7XG4gIGdldFBhcnNlZENvbW1hbmRMaW5lID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0UGFyc2VkQ29tbWFuZExpbmUnKTtcbiAgZ2V0U291cmNlRmlsZUJ5UGF0aCA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldFNvdXJjZUZpbGVCeVBhdGgnKTtcbiAgcmVhZERpcmVjdG9yeSA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ3JlYWREaXJlY3RvcnknKTtcbiAgcmVhZEZpbGUgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdyZWFkRmlsZScpO1xuICByZWFscGF0aCA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ3JlYWxwYXRoJyk7XG4gIHJlc29sdmVNb2R1bGVOYW1lcyA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ3Jlc29sdmVNb2R1bGVOYW1lcycpO1xuICByZXNvbHZlVHlwZVJlZmVyZW5jZURpcmVjdGl2ZXMgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdyZXNvbHZlVHlwZVJlZmVyZW5jZURpcmVjdGl2ZXMnKTtcbiAgdHJhY2UgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCd0cmFjZScpO1xuICB1c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgndXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lcycpO1xufVxuXG4vKipcbiAqIEEgYHRzLkNvbXBpbGVySG9zdGAgd2hpY2ggYXVnbWVudHMgc291cmNlIGZpbGVzLlxuICovXG5jbGFzcyBVcGRhdGVkUHJvZ3JhbUhvc3QgZXh0ZW5kcyBEZWxlZ2F0aW5nQ29tcGlsZXJIb3N0IHtcbiAgLyoqXG4gICAqIE1hcCBvZiBzb3VyY2UgZmlsZSBuYW1lcyB0byBgdHMuU291cmNlRmlsZWAgaW5zdGFuY2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBzZk1hcDogTWFwPHN0cmluZywgdHMuU291cmNlRmlsZT47XG5cbiAgLyoqXG4gICAqIFRoZSBgU2hpbVJlZmVyZW5jZVRhZ2dlcmAgcmVzcG9uc2libGUgZm9yIHRhZ2dpbmcgYHRzLlNvdXJjZUZpbGVgcyBsb2FkZWQgdmlhIHRoaXMgaG9zdC5cbiAgICpcbiAgICogVGhlIGBVcGRhdGVkUHJvZ3JhbUhvc3RgIGlzIHVzZWQgaW4gdGhlIGNyZWF0aW9uIG9mIGEgbmV3IGB0cy5Qcm9ncmFtYC4gRXZlbiB0aG91Z2ggdGhpcyBuZXdcbiAgICogcHJvZ3JhbSBpcyBiYXNlZCBvbiBhIHByaW9yIG9uZSwgVHlwZVNjcmlwdCB3aWxsIHN0aWxsIHN0YXJ0IGZyb20gdGhlIHJvb3QgZmlsZXMgYW5kIGVudW1lcmF0ZVxuICAgKiBhbGwgc291cmNlIGZpbGVzIHRvIGluY2x1ZGUgaW4gdGhlIG5ldyBwcm9ncmFtLiAgVGhpcyBtZWFucyB0aGF0IGp1c3QgbGlrZSBkdXJpbmcgdGhlIG9yaWdpbmFsXG4gICAqIHByb2dyYW0ncyBjcmVhdGlvbiwgdGhlc2Ugc291cmNlIGZpbGVzIG11c3QgYmUgdGFnZ2VkIHdpdGggcmVmZXJlbmNlcyB0byBwZXItZmlsZSBzaGltcyBpblxuICAgKiBvcmRlciBmb3IgdGhvc2Ugc2hpbXMgdG8gYmUgbG9hZGVkLCBhbmQgdGhlbiBjbGVhbmVkIHVwIGFmdGVyd2FyZHMuIFRodXMgdGhlXG4gICAqIGBVcGRhdGVkUHJvZ3JhbUhvc3RgIGhhcyBpdHMgb3duIGBTaGltUmVmZXJlbmNlVGFnZ2VyYCB0byBwZXJmb3JtIHRoaXMgZnVuY3Rpb24uXG4gICAqL1xuICBwcml2YXRlIHNoaW1UYWdnZXIgPSBuZXcgU2hpbVJlZmVyZW5jZVRhZ2dlcih0aGlzLnNoaW1FeHRlbnNpb25QcmVmaXhlcyk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBzZk1hcDogTWFwPHN0cmluZywgdHMuU291cmNlRmlsZT4sIHByaXZhdGUgb3JpZ2luYWxQcm9ncmFtOiB0cy5Qcm9ncmFtLFxuICAgICAgZGVsZWdhdGU6IHRzLkNvbXBpbGVySG9zdCwgcHJpdmF0ZSBzaGltRXh0ZW5zaW9uUHJlZml4ZXM6IHN0cmluZ1tdKSB7XG4gICAgc3VwZXIoZGVsZWdhdGUpO1xuICAgIHRoaXMuc2ZNYXAgPSBzZk1hcDtcbiAgfVxuXG4gIGdldFNvdXJjZUZpbGUoXG4gICAgICBmaWxlTmFtZTogc3RyaW5nLCBsYW5ndWFnZVZlcnNpb246IHRzLlNjcmlwdFRhcmdldCxcbiAgICAgIG9uRXJyb3I/OiAoKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCl8dW5kZWZpbmVkLFxuICAgICAgc2hvdWxkQ3JlYXRlTmV3U291cmNlRmlsZT86IGJvb2xlYW58dW5kZWZpbmVkKTogdHMuU291cmNlRmlsZXx1bmRlZmluZWQge1xuICAgIC8vIFRyeSB0byB1c2UgdGhlIHNhbWUgYHRzLlNvdXJjZUZpbGVgIGFzIHRoZSBvcmlnaW5hbCBwcm9ncmFtLCBpZiBwb3NzaWJsZS4gVGhpcyBndWFyYW50ZWVzXG4gICAgLy8gdGhhdCBwcm9ncmFtIHJldXNlIHdpbGwgYmUgYXMgZWZmaWNpZW50IGFzIHBvc3NpYmxlLlxuICAgIGxldCBkZWxlZ2F0ZVNmOiB0cy5Tb3VyY2VGaWxlfHVuZGVmaW5lZCA9IHRoaXMub3JpZ2luYWxQcm9ncmFtLmdldFNvdXJjZUZpbGUoZmlsZU5hbWUpO1xuICAgIGlmIChkZWxlZ2F0ZVNmID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFNvbWV0aGluZyB3ZW50IHdyb25nIGFuZCBhIHNvdXJjZSBmaWxlIGlzIGJlaW5nIHJlcXVlc3RlZCB0aGF0J3Mgbm90IGluIHRoZSBvcmlnaW5hbFxuICAgICAgLy8gcHJvZ3JhbS4gSnVzdCBpbiBjYXNlLCB0cnkgdG8gcmV0cmlldmUgaXQgZnJvbSB0aGUgZGVsZWdhdGUuXG4gICAgICBkZWxlZ2F0ZVNmID0gdGhpcy5kZWxlZ2F0ZS5nZXRTb3VyY2VGaWxlKFxuICAgICAgICAgIGZpbGVOYW1lLCBsYW5ndWFnZVZlcnNpb24sIG9uRXJyb3IsIHNob3VsZENyZWF0ZU5ld1NvdXJjZUZpbGUpITtcbiAgICB9XG4gICAgaWYgKGRlbGVnYXRlU2YgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBMb29rIGZvciByZXBsYWNlbWVudHMuXG4gICAgbGV0IHNmOiB0cy5Tb3VyY2VGaWxlO1xuICAgIGlmICh0aGlzLnNmTWFwLmhhcyhmaWxlTmFtZSkpIHtcbiAgICAgIHNmID0gdGhpcy5zZk1hcC5nZXQoZmlsZU5hbWUpITtcbiAgICAgIGNvcHlGaWxlU2hpbURhdGEoZGVsZWdhdGVTZiwgc2YpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZiA9IGRlbGVnYXRlU2Y7XG4gICAgfVxuICAgIC8vIFR5cGVTY3JpcHQgZG9lc24ndCBhbGxvdyByZXR1cm5pbmcgcmVkaXJlY3Qgc291cmNlIGZpbGVzLiBUbyBhdm9pZCB1bmZvcmVzZWVuIGVycm9ycyB3ZVxuICAgIC8vIHJldHVybiB0aGUgb3JpZ2luYWwgc291cmNlIGZpbGUgaW5zdGVhZCBvZiB0aGUgcmVkaXJlY3QgdGFyZ2V0LlxuICAgIHNmID0gdG9VbnJlZGlyZWN0ZWRTb3VyY2VGaWxlKHNmKTtcblxuICAgIHRoaXMuc2hpbVRhZ2dlci50YWcoc2YpO1xuICAgIHJldHVybiBzZjtcbiAgfVxuXG4gIHBvc3RQcm9ncmFtQ3JlYXRpb25DbGVhbnVwKCk6IHZvaWQge1xuICAgIHRoaXMuc2hpbVRhZ2dlci5maW5hbGl6ZSgpO1xuICB9XG5cbiAgd3JpdGVGaWxlKCk6IG5ldmVyIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFR5cGVDaGVja1Byb2dyYW1Ib3N0IHNob3VsZCBuZXZlciB3cml0ZSBmaWxlc2ApO1xuICB9XG5cbiAgZmlsZUV4aXN0cyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc2ZNYXAuaGFzKGZpbGVOYW1lKSB8fCB0aGlzLmRlbGVnYXRlLmZpbGVFeGlzdHMoZmlsZU5hbWUpO1xuICB9XG59XG5cblxuLyoqXG4gKiBVcGRhdGVzIGEgYHRzLlByb2dyYW1gIGluc3RhbmNlIHdpdGggYSBuZXcgb25lIHRoYXQgaW5jb3Jwb3JhdGVzIHNwZWNpZmljIGNoYW5nZXMsIHVzaW5nIHRoZVxuICogVHlwZVNjcmlwdCBjb21waWxlciBBUElzIGZvciBpbmNyZW1lbnRhbCBwcm9ncmFtIGNyZWF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgVHNDcmVhdGVQcm9ncmFtRHJpdmVyIGltcGxlbWVudHMgUHJvZ3JhbURyaXZlciB7XG4gIC8qKlxuICAgKiBBIG1hcCBvZiBzb3VyY2UgZmlsZSBwYXRocyB0byByZXBsYWNlbWVudCBgdHMuU291cmNlRmlsZWBzIGZvciB0aG9zZSBwYXRocy5cbiAgICpcbiAgICogRWZmZWN0aXZlbHksIHRoaXMgdHJhY2tzIHRoZSBkZWx0YSBiZXR3ZWVuIHRoZSB1c2VyJ3MgcHJvZ3JhbSAocmVwcmVzZW50ZWQgYnkgdGhlXG4gICAqIGBvcmlnaW5hbEhvc3RgKSBhbmQgdGhlIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgcHJvZ3JhbSBiZWluZyBtYW5hZ2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBzZk1hcCA9IG5ldyBNYXA8c3RyaW5nLCB0cy5Tb3VyY2VGaWxlPigpO1xuXG4gIHByaXZhdGUgcHJvZ3JhbTogdHMuUHJvZ3JhbSA9IHRoaXMub3JpZ2luYWxQcm9ncmFtO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBvcmlnaW5hbFByb2dyYW06IHRzLlByb2dyYW0sIHByaXZhdGUgb3JpZ2luYWxIb3N0OiB0cy5Db21waWxlckhvc3QsXG4gICAgICBwcml2YXRlIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucywgcHJpdmF0ZSBzaGltRXh0ZW5zaW9uUHJlZml4ZXM6IHN0cmluZ1tdKSB7fVxuXG4gIHJlYWRvbmx5IHN1cHBvcnRzSW5saW5lT3BlcmF0aW9ucyA9IHRydWU7XG5cbiAgZ2V0UHJvZ3JhbSgpOiB0cy5Qcm9ncmFtIHtcbiAgICByZXR1cm4gdGhpcy5wcm9ncmFtO1xuICB9XG5cbiAgdXBkYXRlRmlsZXMoY29udGVudHM6IE1hcDxBYnNvbHV0ZUZzUGF0aCwgc3RyaW5nPiwgdXBkYXRlTW9kZTogVXBkYXRlTW9kZSk6IHZvaWQge1xuICAgIGlmIChjb250ZW50cy5zaXplID09PSAwKSB7XG4gICAgICAvLyBObyBjaGFuZ2VzIGhhdmUgYmVlbiByZXF1ZXN0ZWQuIElzIGl0IHNhZmUgdG8gc2tpcCB1cGRhdGluZyBlbnRpcmVseT9cbiAgICAgIC8vIElmIFVwZGF0ZU1vZGUgaXMgSW5jcmVtZW50YWwsIHRoZW4geWVzLiBJZiBVcGRhdGVNb2RlIGlzIENvbXBsZXRlLCB0aGVuIGl0J3Mgc2FmZSB0byBza2lwXG4gICAgICAvLyBvbmx5IGlmIHRoZXJlIGFyZSBubyBhY3RpdmUgY2hhbmdlcyBhbHJlYWR5ICh0aGF0IHdvdWxkIGJlIGNsZWFyZWQgYnkgdGhlIHVwZGF0ZSkuXG5cbiAgICAgIGlmICh1cGRhdGVNb2RlICE9PSBVcGRhdGVNb2RlLkNvbXBsZXRlIHx8IHRoaXMuc2ZNYXAuc2l6ZSA9PT0gMCkge1xuICAgICAgICAvLyBObyBjaGFuZ2VzIHdvdWxkIGJlIG1hZGUgdG8gdGhlIGB0cy5Qcm9ncmFtYCBhbnl3YXksIHNvIGl0J3Mgc2FmZSB0byBkbyBub3RoaW5nIGhlcmUuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodXBkYXRlTW9kZSA9PT0gVXBkYXRlTW9kZS5Db21wbGV0ZSkge1xuICAgICAgdGhpcy5zZk1hcC5jbGVhcigpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgW2ZpbGVQYXRoLCB0ZXh0XSBvZiBjb250ZW50cy5lbnRyaWVzKCkpIHtcbiAgICAgIHRoaXMuc2ZNYXAuc2V0KGZpbGVQYXRoLCB0cy5jcmVhdGVTb3VyY2VGaWxlKGZpbGVQYXRoLCB0ZXh0LCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCB0cnVlKSk7XG4gICAgfVxuXG4gICAgY29uc3QgaG9zdCA9IG5ldyBVcGRhdGVkUHJvZ3JhbUhvc3QoXG4gICAgICAgIHRoaXMuc2ZNYXAsIHRoaXMub3JpZ2luYWxQcm9ncmFtLCB0aGlzLm9yaWdpbmFsSG9zdCwgdGhpcy5zaGltRXh0ZW5zaW9uUHJlZml4ZXMpO1xuICAgIGNvbnN0IG9sZFByb2dyYW0gPSB0aGlzLnByb2dyYW07XG5cbiAgICAvLyBSZXRhZyB0aGUgb2xkIHByb2dyYW0ncyBgdHMuU291cmNlRmlsZWBzIHdpdGggc2hpbSB0YWdzLCB0byBhbGxvdyBUeXBlU2NyaXB0IHRvIHJldXNlIHRoZVxuICAgIC8vIG1vc3QgZGF0YS5cbiAgICByZXRhZ0FsbFRzRmlsZXMob2xkUHJvZ3JhbSk7XG5cbiAgICB0aGlzLnByb2dyYW0gPSB0cy5jcmVhdGVQcm9ncmFtKHtcbiAgICAgIGhvc3QsXG4gICAgICByb290TmFtZXM6IHRoaXMucHJvZ3JhbS5nZXRSb290RmlsZU5hbWVzKCksXG4gICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICBvbGRQcm9ncmFtLFxuICAgIH0pO1xuICAgIGhvc3QucG9zdFByb2dyYW1DcmVhdGlvbkNsZWFudXAoKTtcblxuICAgIC8vIEFuZCB1bnRhZyB0aGVtIGFmdGVyd2FyZHMuIFdlIGV4cGxpY2l0bHkgdW50YWcgYm90aCBwcm9ncmFtcyBoZXJlLCBiZWNhdXNlIHRoZSBvbGRQcm9ncmFtXG4gICAgLy8gbWF5IHN0aWxsIGJlIHVzZWQgZm9yIGVtaXQgYW5kIG5lZWRzIHRvIG5vdCBjb250YWluIHRhZ3MuXG4gICAgdW50YWdBbGxUc0ZpbGVzKHRoaXMucHJvZ3JhbSk7XG4gICAgdW50YWdBbGxUc0ZpbGVzKG9sZFByb2dyYW0pO1xuICB9XG59XG4iXX0=