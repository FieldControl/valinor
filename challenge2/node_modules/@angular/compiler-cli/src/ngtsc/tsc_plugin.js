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
        define("@angular/compiler-cli/src/ngtsc/tsc_plugin", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/core", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/incremental", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/program_driver", "@angular/compiler-cli/src/ngtsc/shims", "@angular/compiler-cli/src/ngtsc/typecheck/api"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NgTscPlugin = void 0;
    var tslib_1 = require("tslib");
    var core_1 = require("@angular/compiler-cli/src/ngtsc/core");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var incremental_1 = require("@angular/compiler-cli/src/ngtsc/incremental");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var program_driver_1 = require("@angular/compiler-cli/src/ngtsc/program_driver");
    var shims_1 = require("@angular/compiler-cli/src/ngtsc/shims");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/api");
    /**
     * A plugin for `tsc_wrapped` which allows Angular compilation from a plain `ts_library`.
     */
    var NgTscPlugin = /** @class */ (function () {
        function NgTscPlugin(ngOptions) {
            this.ngOptions = ngOptions;
            this.name = 'ngtsc';
            this.options = null;
            this.host = null;
            this._compiler = null;
            file_system_1.setFileSystem(new file_system_1.NodeJSFileSystem());
        }
        Object.defineProperty(NgTscPlugin.prototype, "compiler", {
            get: function () {
                if (this._compiler === null) {
                    throw new Error('Lifecycle error: setupCompilation() must be called first.');
                }
                return this._compiler;
            },
            enumerable: false,
            configurable: true
        });
        NgTscPlugin.prototype.wrapHost = function (host, inputFiles, options) {
            // TODO(alxhub): Eventually the `wrapHost()` API will accept the old `ts.Program` (if one is
            // available). When it does, its `ts.SourceFile`s need to be re-tagged to enable proper
            // incremental compilation.
            this.options = tslib_1.__assign(tslib_1.__assign({}, this.ngOptions), options);
            this.host = core_1.NgCompilerHost.wrap(host, inputFiles, this.options, /* oldProgram */ null);
            return this.host;
        };
        NgTscPlugin.prototype.setupCompilation = function (program, oldProgram) {
            var e_1, _a;
            var _b;
            // TODO(alxhub): we provide a `PerfRecorder` to the compiler, but because we're not driving the
            // compilation, the information captured within it is incomplete, and may not include timings
            // for phases such as emit.
            //
            // Additionally, nothing actually captures the perf results here, so recording stats at all is
            // somewhat moot for now :)
            var perfRecorder = perf_1.ActivePerfRecorder.zeroedToNow();
            if (this.host === null || this.options === null) {
                throw new Error('Lifecycle error: setupCompilation() before wrapHost().');
            }
            this.host.postProgramCreationCleanup();
            shims_1.untagAllTsFiles(program);
            var programDriver = new program_driver_1.TsCreateProgramDriver(program, this.host, this.options, this.host.shimExtensionPrefixes);
            var strategy = new incremental_1.PatchedProgramIncrementalBuildStrategy();
            var oldState = oldProgram !== undefined ? strategy.getIncrementalState(oldProgram) : null;
            var ticket;
            var modifiedResourceFiles = new Set();
            if (this.host.getModifiedResourceFiles !== undefined) {
                try {
                    for (var _c = tslib_1.__values((_b = this.host.getModifiedResourceFiles()) !== null && _b !== void 0 ? _b : []), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var resourceFile = _d.value;
                        modifiedResourceFiles.add(file_system_1.resolve(resourceFile));
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            if (oldProgram === undefined || oldState === null) {
                ticket = core_1.freshCompilationTicket(program, this.options, strategy, programDriver, perfRecorder, 
                /* enableTemplateTypeChecker */ false, /* usePoisonedData */ false);
            }
            else {
                strategy.toNextBuildStrategy().getIncrementalState(oldProgram);
                ticket = core_1.incrementalFromStateTicket(oldProgram, oldState, program, this.options, strategy, programDriver, modifiedResourceFiles, perfRecorder, false, false);
            }
            this._compiler = core_1.NgCompiler.fromTicket(ticket, this.host);
            return {
                ignoreForDiagnostics: this._compiler.ignoreForDiagnostics,
                ignoreForEmit: this._compiler.ignoreForEmit,
            };
        };
        NgTscPlugin.prototype.getDiagnostics = function (file) {
            if (file === undefined) {
                return this.compiler.getDiagnostics();
            }
            return this.compiler.getDiagnosticsForFile(file, api_1.OptimizeFor.WholeProgram);
        };
        NgTscPlugin.prototype.getOptionDiagnostics = function () {
            return this.compiler.getOptionDiagnostics();
        };
        NgTscPlugin.prototype.getNextProgram = function () {
            return this.compiler.getCurrentProgram();
        };
        NgTscPlugin.prototype.createTransformers = function () {
            // The plugin consumer doesn't know about our perf tracing system, so we consider the emit phase
            // as beginning now.
            this.compiler.perfRecorder.phase(perf_1.PerfPhase.TypeScriptEmit);
            return this.compiler.prepareEmit().transformers;
        };
        return NgTscPlugin;
    }());
    exports.NgTscPlugin = NgTscPlugin;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHNjX3BsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHNjX3BsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsNkRBQXlIO0lBRXpILDJFQUF1RjtJQUN2RiwyRUFBcUU7SUFDckUsNkRBQXFEO0lBQ3JELGlGQUF1RDtJQUN2RCwrREFBd0M7SUFDeEMscUVBQTRDO0lBMkM1Qzs7T0FFRztJQUNIO1FBY0UscUJBQW9CLFNBQWE7WUFBYixjQUFTLEdBQVQsU0FBUyxDQUFJO1lBYmpDLFNBQUksR0FBRyxPQUFPLENBQUM7WUFFUCxZQUFPLEdBQTJCLElBQUksQ0FBQztZQUN2QyxTQUFJLEdBQXdCLElBQUksQ0FBQztZQUNqQyxjQUFTLEdBQW9CLElBQUksQ0FBQztZQVV4QywyQkFBYSxDQUFDLElBQUksOEJBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFURCxzQkFBSSxpQ0FBUTtpQkFBWjtnQkFDRSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO29CQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7aUJBQzlFO2dCQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUN4QixDQUFDOzs7V0FBQTtRQU1ELDhCQUFRLEdBQVIsVUFDSSxJQUFpRCxFQUFFLFVBQTZCLEVBQ2hGLE9BQTJCO1lBQzdCLDRGQUE0RjtZQUM1Rix1RkFBdUY7WUFDdkYsMkJBQTJCO1lBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsc0NBQUksSUFBSSxDQUFDLFNBQVMsR0FBSyxPQUFPLENBQXNCLENBQUM7WUFDcEUsSUFBSSxDQUFDLElBQUksR0FBRyxxQkFBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLEVB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LEVBQUUsaUJBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM3RSxDQUFDO1FBRUQsMENBQW9CLEdBQXBCO1lBQ0UsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVELG9DQUFjLEdBQWQ7WUFDRSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRUQsd0NBQWtCLEdBQWxCO1lBQ0UsZ0dBQWdHO1lBQ2hHLG9CQUFvQjtZQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsZ0JBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMzRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ2xELENBQUM7UUFDSCxrQkFBQztJQUFELENBQUMsQUFoR0QsSUFnR0M7SUFoR1ksa0NBQVciLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Q29tcGlsYXRpb25UaWNrZXQsIGZyZXNoQ29tcGlsYXRpb25UaWNrZXQsIGluY3JlbWVudGFsRnJvbVN0YXRlVGlja2V0LCBOZ0NvbXBpbGVyLCBOZ0NvbXBpbGVySG9zdH0gZnJvbSAnLi9jb3JlJztcbmltcG9ydCB7TmdDb21waWxlck9wdGlvbnMsIFVuaWZpZWRNb2R1bGVzSG9zdH0gZnJvbSAnLi9jb3JlL2FwaSc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBOb2RlSlNGaWxlU3lzdGVtLCByZXNvbHZlLCBzZXRGaWxlU3lzdGVtfSBmcm9tICcuL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7UGF0Y2hlZFByb2dyYW1JbmNyZW1lbnRhbEJ1aWxkU3RyYXRlZ3l9IGZyb20gJy4vaW5jcmVtZW50YWwnO1xuaW1wb3J0IHtBY3RpdmVQZXJmUmVjb3JkZXIsIFBlcmZQaGFzZX0gZnJvbSAnLi9wZXJmJztcbmltcG9ydCB7VHNDcmVhdGVQcm9ncmFtRHJpdmVyfSBmcm9tICcuL3Byb2dyYW1fZHJpdmVyJztcbmltcG9ydCB7dW50YWdBbGxUc0ZpbGVzfSBmcm9tICcuL3NoaW1zJztcbmltcG9ydCB7T3B0aW1pemVGb3J9IGZyb20gJy4vdHlwZWNoZWNrL2FwaSc7XG5cbi8vIFRoZSBmb2xsb3dpbmcgaXMgbmVlZGVkIHRvIGZpeCBhIHRoZSBjaGlja2VuLWFuZC1lZ2cgaXNzdWUgd2hlcmUgdGhlIHN5bmMgKGludG8gZzMpIHNjcmlwdCB3aWxsXG4vLyByZWZ1c2UgdG8gYWNjZXB0IHRoaXMgZmlsZSB1bmxlc3MgdGhlIGZvbGxvd2luZyBzdHJpbmcgYXBwZWFyczpcbi8vIGltcG9ydCAqIGFzIHBsdWdpbiBmcm9tICdAYmF6ZWwvdHlwZXNjcmlwdC9pbnRlcm5hbC90c2Nfd3JhcHBlZC9wbHVnaW5fYXBpJztcblxuLyoqXG4gKiBBIGB0cy5Db21waWxlckhvc3RgIHdoaWNoIGFsc28gcmV0dXJucyBhIGxpc3Qgb2YgaW5wdXQgZmlsZXMsIG91dCBvZiB3aGljaCB0aGUgYHRzLlByb2dyYW1gXG4gKiBzaG91bGQgYmUgY3JlYXRlZC5cbiAqXG4gKiBDdXJyZW50bHkgbWlycm9yZWQgZnJvbSBAYmF6ZWwvdHlwZXNjcmlwdC9pbnRlcm5hbC90c2Nfd3JhcHBlZC9wbHVnaW5fYXBpICh3aXRoIHRoZSBuYW1pbmcgb2ZcbiAqIGBmaWxlTmFtZVRvTW9kdWxlTmFtZWAgY29ycmVjdGVkKS5cbiAqL1xuaW50ZXJmYWNlIFBsdWdpbkNvbXBpbGVySG9zdCBleHRlbmRzIHRzLkNvbXBpbGVySG9zdCwgUGFydGlhbDxVbmlmaWVkTW9kdWxlc0hvc3Q+IHtcbiAgcmVhZG9ubHkgaW5wdXRGaWxlczogUmVhZG9ubHlBcnJheTxzdHJpbmc+O1xufVxuXG4vKipcbiAqIE1pcnJvcnMgdGhlIHBsdWdpbiBpbnRlcmZhY2UgZnJvbSB0c2Nfd3JhcHBlZCB3aGljaCBpcyBjdXJyZW50bHkgdW5kZXIgYWN0aXZlIGRldmVsb3BtZW50LiBUb1xuICogZW5hYmxlIHByb2dyZXNzIHRvIGJlIG1hZGUgaW4gcGFyYWxsZWwsIHRoZSB1cHN0cmVhbSBpbnRlcmZhY2UgaXNuJ3QgaW1wbGVtZW50ZWQgZGlyZWN0bHkuXG4gKiBJbnN0ZWFkLCBgVHNjUGx1Z2luYCBoZXJlIGlzIHN0cnVjdHVyYWxseSBhc3NpZ25hYmxlIHRvIHdoYXQgdHNjX3dyYXBwZWQgZXhwZWN0cy5cbiAqL1xuaW50ZXJmYWNlIFRzY1BsdWdpbiB7XG4gIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcblxuICB3cmFwSG9zdChcbiAgICAgIGhvc3Q6IHRzLkNvbXBpbGVySG9zdCZQYXJ0aWFsPFVuaWZpZWRNb2R1bGVzSG9zdD4sIGlucHV0RmlsZXM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPixcbiAgICAgIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucyk6IFBsdWdpbkNvbXBpbGVySG9zdDtcblxuICBzZXR1cENvbXBpbGF0aW9uKHByb2dyYW06IHRzLlByb2dyYW0sIG9sZFByb2dyYW0/OiB0cy5Qcm9ncmFtKToge1xuICAgIGlnbm9yZUZvckRpYWdub3N0aWNzOiBTZXQ8dHMuU291cmNlRmlsZT4sXG4gICAgaWdub3JlRm9yRW1pdDogU2V0PHRzLlNvdXJjZUZpbGU+LFxuICB9O1xuXG4gIGdldERpYWdub3N0aWNzKGZpbGU/OiB0cy5Tb3VyY2VGaWxlKTogdHMuRGlhZ25vc3RpY1tdO1xuXG4gIGdldE9wdGlvbkRpYWdub3N0aWNzKCk6IHRzLkRpYWdub3N0aWNbXTtcblxuICBnZXROZXh0UHJvZ3JhbSgpOiB0cy5Qcm9ncmFtO1xuXG4gIGNyZWF0ZVRyYW5zZm9ybWVycygpOiB0cy5DdXN0b21UcmFuc2Zvcm1lcnM7XG59XG5cbi8qKlxuICogQSBwbHVnaW4gZm9yIGB0c2Nfd3JhcHBlZGAgd2hpY2ggYWxsb3dzIEFuZ3VsYXIgY29tcGlsYXRpb24gZnJvbSBhIHBsYWluIGB0c19saWJyYXJ5YC5cbiAqL1xuZXhwb3J0IGNsYXNzIE5nVHNjUGx1Z2luIGltcGxlbWVudHMgVHNjUGx1Z2luIHtcbiAgbmFtZSA9ICduZ3RzYyc7XG5cbiAgcHJpdmF0ZSBvcHRpb25zOiBOZ0NvbXBpbGVyT3B0aW9uc3xudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBob3N0OiBOZ0NvbXBpbGVySG9zdHxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfY29tcGlsZXI6IE5nQ29tcGlsZXJ8bnVsbCA9IG51bGw7XG5cbiAgZ2V0IGNvbXBpbGVyKCk6IE5nQ29tcGlsZXIge1xuICAgIGlmICh0aGlzLl9jb21waWxlciA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdMaWZlY3ljbGUgZXJyb3I6IHNldHVwQ29tcGlsYXRpb24oKSBtdXN0IGJlIGNhbGxlZCBmaXJzdC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NvbXBpbGVyO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBuZ09wdGlvbnM6IHt9KSB7XG4gICAgc2V0RmlsZVN5c3RlbShuZXcgTm9kZUpTRmlsZVN5c3RlbSgpKTtcbiAgfVxuXG4gIHdyYXBIb3N0KFxuICAgICAgaG9zdDogdHMuQ29tcGlsZXJIb3N0JlBhcnRpYWw8VW5pZmllZE1vZHVsZXNIb3N0PiwgaW5wdXRGaWxlczogcmVhZG9ubHkgc3RyaW5nW10sXG4gICAgICBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMpOiBQbHVnaW5Db21waWxlckhvc3Qge1xuICAgIC8vIFRPRE8oYWx4aHViKTogRXZlbnR1YWxseSB0aGUgYHdyYXBIb3N0KClgIEFQSSB3aWxsIGFjY2VwdCB0aGUgb2xkIGB0cy5Qcm9ncmFtYCAoaWYgb25lIGlzXG4gICAgLy8gYXZhaWxhYmxlKS4gV2hlbiBpdCBkb2VzLCBpdHMgYHRzLlNvdXJjZUZpbGVgcyBuZWVkIHRvIGJlIHJlLXRhZ2dlZCB0byBlbmFibGUgcHJvcGVyXG4gICAgLy8gaW5jcmVtZW50YWwgY29tcGlsYXRpb24uXG4gICAgdGhpcy5vcHRpb25zID0gey4uLnRoaXMubmdPcHRpb25zLCAuLi5vcHRpb25zfSBhcyBOZ0NvbXBpbGVyT3B0aW9ucztcbiAgICB0aGlzLmhvc3QgPSBOZ0NvbXBpbGVySG9zdC53cmFwKGhvc3QsIGlucHV0RmlsZXMsIHRoaXMub3B0aW9ucywgLyogb2xkUHJvZ3JhbSAqLyBudWxsKTtcbiAgICByZXR1cm4gdGhpcy5ob3N0O1xuICB9XG5cbiAgc2V0dXBDb21waWxhdGlvbihwcm9ncmFtOiB0cy5Qcm9ncmFtLCBvbGRQcm9ncmFtPzogdHMuUHJvZ3JhbSk6IHtcbiAgICBpZ25vcmVGb3JEaWFnbm9zdGljczogU2V0PHRzLlNvdXJjZUZpbGU+LFxuICAgIGlnbm9yZUZvckVtaXQ6IFNldDx0cy5Tb3VyY2VGaWxlPixcbiAgfSB7XG4gICAgLy8gVE9ETyhhbHhodWIpOiB3ZSBwcm92aWRlIGEgYFBlcmZSZWNvcmRlcmAgdG8gdGhlIGNvbXBpbGVyLCBidXQgYmVjYXVzZSB3ZSdyZSBub3QgZHJpdmluZyB0aGVcbiAgICAvLyBjb21waWxhdGlvbiwgdGhlIGluZm9ybWF0aW9uIGNhcHR1cmVkIHdpdGhpbiBpdCBpcyBpbmNvbXBsZXRlLCBhbmQgbWF5IG5vdCBpbmNsdWRlIHRpbWluZ3NcbiAgICAvLyBmb3IgcGhhc2VzIHN1Y2ggYXMgZW1pdC5cbiAgICAvL1xuICAgIC8vIEFkZGl0aW9uYWxseSwgbm90aGluZyBhY3R1YWxseSBjYXB0dXJlcyB0aGUgcGVyZiByZXN1bHRzIGhlcmUsIHNvIHJlY29yZGluZyBzdGF0cyBhdCBhbGwgaXNcbiAgICAvLyBzb21ld2hhdCBtb290IGZvciBub3cgOilcbiAgICBjb25zdCBwZXJmUmVjb3JkZXIgPSBBY3RpdmVQZXJmUmVjb3JkZXIuemVyb2VkVG9Ob3coKTtcbiAgICBpZiAodGhpcy5ob3N0ID09PSBudWxsIHx8IHRoaXMub3B0aW9ucyA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdMaWZlY3ljbGUgZXJyb3I6IHNldHVwQ29tcGlsYXRpb24oKSBiZWZvcmUgd3JhcEhvc3QoKS4nKTtcbiAgICB9XG4gICAgdGhpcy5ob3N0LnBvc3RQcm9ncmFtQ3JlYXRpb25DbGVhbnVwKCk7XG4gICAgdW50YWdBbGxUc0ZpbGVzKHByb2dyYW0pO1xuICAgIGNvbnN0IHByb2dyYW1Ecml2ZXIgPSBuZXcgVHNDcmVhdGVQcm9ncmFtRHJpdmVyKFxuICAgICAgICBwcm9ncmFtLCB0aGlzLmhvc3QsIHRoaXMub3B0aW9ucywgdGhpcy5ob3N0LnNoaW1FeHRlbnNpb25QcmVmaXhlcyk7XG4gICAgY29uc3Qgc3RyYXRlZ3kgPSBuZXcgUGF0Y2hlZFByb2dyYW1JbmNyZW1lbnRhbEJ1aWxkU3RyYXRlZ3koKTtcbiAgICBjb25zdCBvbGRTdGF0ZSA9IG9sZFByb2dyYW0gIT09IHVuZGVmaW5lZCA/IHN0cmF0ZWd5LmdldEluY3JlbWVudGFsU3RhdGUob2xkUHJvZ3JhbSkgOiBudWxsO1xuICAgIGxldCB0aWNrZXQ6IENvbXBpbGF0aW9uVGlja2V0O1xuXG4gICAgY29uc3QgbW9kaWZpZWRSZXNvdXJjZUZpbGVzID0gbmV3IFNldDxBYnNvbHV0ZUZzUGF0aD4oKTtcbiAgICBpZiAodGhpcy5ob3N0LmdldE1vZGlmaWVkUmVzb3VyY2VGaWxlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBmb3IgKGNvbnN0IHJlc291cmNlRmlsZSBvZiB0aGlzLmhvc3QuZ2V0TW9kaWZpZWRSZXNvdXJjZUZpbGVzKCkgPz8gW10pIHtcbiAgICAgICAgbW9kaWZpZWRSZXNvdXJjZUZpbGVzLmFkZChyZXNvbHZlKHJlc291cmNlRmlsZSkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvbGRQcm9ncmFtID09PSB1bmRlZmluZWQgfHwgb2xkU3RhdGUgPT09IG51bGwpIHtcbiAgICAgIHRpY2tldCA9IGZyZXNoQ29tcGlsYXRpb25UaWNrZXQoXG4gICAgICAgICAgcHJvZ3JhbSwgdGhpcy5vcHRpb25zLCBzdHJhdGVneSwgcHJvZ3JhbURyaXZlciwgcGVyZlJlY29yZGVyLFxuICAgICAgICAgIC8qIGVuYWJsZVRlbXBsYXRlVHlwZUNoZWNrZXIgKi8gZmFsc2UsIC8qIHVzZVBvaXNvbmVkRGF0YSAqLyBmYWxzZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0cmF0ZWd5LnRvTmV4dEJ1aWxkU3RyYXRlZ3koKS5nZXRJbmNyZW1lbnRhbFN0YXRlKG9sZFByb2dyYW0pO1xuICAgICAgdGlja2V0ID0gaW5jcmVtZW50YWxGcm9tU3RhdGVUaWNrZXQoXG4gICAgICAgICAgb2xkUHJvZ3JhbSwgb2xkU3RhdGUsIHByb2dyYW0sIHRoaXMub3B0aW9ucywgc3RyYXRlZ3ksIHByb2dyYW1Ecml2ZXIsXG4gICAgICAgICAgbW9kaWZpZWRSZXNvdXJjZUZpbGVzLCBwZXJmUmVjb3JkZXIsIGZhbHNlLCBmYWxzZSk7XG4gICAgfVxuICAgIHRoaXMuX2NvbXBpbGVyID0gTmdDb21waWxlci5mcm9tVGlja2V0KHRpY2tldCwgdGhpcy5ob3N0KTtcbiAgICByZXR1cm4ge1xuICAgICAgaWdub3JlRm9yRGlhZ25vc3RpY3M6IHRoaXMuX2NvbXBpbGVyLmlnbm9yZUZvckRpYWdub3N0aWNzLFxuICAgICAgaWdub3JlRm9yRW1pdDogdGhpcy5fY29tcGlsZXIuaWdub3JlRm9yRW1pdCxcbiAgICB9O1xuICB9XG5cbiAgZ2V0RGlhZ25vc3RpY3MoZmlsZT86IHRzLlNvdXJjZUZpbGUpOiB0cy5EaWFnbm9zdGljW10ge1xuICAgIGlmIChmaWxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBpbGVyLmdldERpYWdub3N0aWNzKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvbXBpbGVyLmdldERpYWdub3N0aWNzRm9yRmlsZShmaWxlLCBPcHRpbWl6ZUZvci5XaG9sZVByb2dyYW0pO1xuICB9XG5cbiAgZ2V0T3B0aW9uRGlhZ25vc3RpY3MoKTogdHMuRGlhZ25vc3RpY1tdIHtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlci5nZXRPcHRpb25EaWFnbm9zdGljcygpO1xuICB9XG5cbiAgZ2V0TmV4dFByb2dyYW0oKTogdHMuUHJvZ3JhbSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZXIuZ2V0Q3VycmVudFByb2dyYW0oKTtcbiAgfVxuXG4gIGNyZWF0ZVRyYW5zZm9ybWVycygpOiB0cy5DdXN0b21UcmFuc2Zvcm1lcnMge1xuICAgIC8vIFRoZSBwbHVnaW4gY29uc3VtZXIgZG9lc24ndCBrbm93IGFib3V0IG91ciBwZXJmIHRyYWNpbmcgc3lzdGVtLCBzbyB3ZSBjb25zaWRlciB0aGUgZW1pdCBwaGFzZVxuICAgIC8vIGFzIGJlZ2lubmluZyBub3cuXG4gICAgdGhpcy5jb21waWxlci5wZXJmUmVjb3JkZXIucGhhc2UoUGVyZlBoYXNlLlR5cGVTY3JpcHRFbWl0KTtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlci5wcmVwYXJlRW1pdCgpLnRyYW5zZm9ybWVycztcbiAgfVxufVxuIl19