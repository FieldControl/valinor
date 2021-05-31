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
        define("@angular/compiler-cli/src/perform_compile", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/transformers/entry_points", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultGatherDiagnostics = exports.performCompilation = exports.exitCodeFromResult = exports.readConfiguration = exports.calcProjectFileAndBasePath = exports.formatDiagnostics = exports.formatDiagnostic = exports.flattenDiagnosticMessageChain = exports.formatDiagnosticPosition = exports.filterErrorsAndWarnings = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var api = require("@angular/compiler-cli/src/transformers/api");
    var ng = require("@angular/compiler-cli/src/transformers/entry_points");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    function filterErrorsAndWarnings(diagnostics) {
        return diagnostics.filter(function (d) { return d.category !== ts.DiagnosticCategory.Message; });
    }
    exports.filterErrorsAndWarnings = filterErrorsAndWarnings;
    var defaultFormatHost = {
        getCurrentDirectory: function () { return ts.sys.getCurrentDirectory(); },
        getCanonicalFileName: function (fileName) { return fileName; },
        getNewLine: function () { return ts.sys.newLine; }
    };
    function displayFileName(fileName, host) {
        return file_system_1.relative(file_system_1.resolve(host.getCurrentDirectory()), file_system_1.resolve(host.getCanonicalFileName(fileName)));
    }
    function formatDiagnosticPosition(position, host) {
        if (host === void 0) { host = defaultFormatHost; }
        return displayFileName(position.fileName, host) + "(" + (position.line + 1) + "," + (position.column + 1) + ")";
    }
    exports.formatDiagnosticPosition = formatDiagnosticPosition;
    function flattenDiagnosticMessageChain(chain, host, indent) {
        var e_1, _a;
        if (host === void 0) { host = defaultFormatHost; }
        if (indent === void 0) { indent = 0; }
        var newLine = host.getNewLine();
        var result = '';
        if (indent) {
            result += newLine;
            for (var i = 0; i < indent; i++) {
                result += '  ';
            }
        }
        result += chain.messageText;
        var position = chain.position;
        // add position if available, and we are not at the depest frame
        if (position && indent !== 0) {
            result += " at " + formatDiagnosticPosition(position, host);
        }
        indent++;
        if (chain.next) {
            try {
                for (var _b = tslib_1.__values(chain.next), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var kid = _c.value;
                    result += flattenDiagnosticMessageChain(kid, host, indent);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return result;
    }
    exports.flattenDiagnosticMessageChain = flattenDiagnosticMessageChain;
    function formatDiagnostic(diagnostic, host) {
        if (host === void 0) { host = defaultFormatHost; }
        var result = '';
        var newLine = host.getNewLine();
        var span = diagnostic.span;
        if (span) {
            result += formatDiagnosticPosition({ fileName: span.start.file.url, line: span.start.line, column: span.start.col }, host) + ": ";
        }
        else if (diagnostic.position) {
            result += formatDiagnosticPosition(diagnostic.position, host) + ": ";
        }
        if (diagnostic.span && diagnostic.span.details) {
            result += diagnostic.span.details + ", " + diagnostic.messageText + newLine;
        }
        else if (diagnostic.chain) {
            result += flattenDiagnosticMessageChain(diagnostic.chain, host) + "." + newLine;
        }
        else {
            result += "" + diagnostic.messageText + newLine;
        }
        return result;
    }
    exports.formatDiagnostic = formatDiagnostic;
    function formatDiagnostics(diags, host) {
        if (host === void 0) { host = defaultFormatHost; }
        if (diags && diags.length) {
            return diags
                .map(function (diagnostic) {
                if (api.isTsDiagnostic(diagnostic)) {
                    return diagnostics_1.replaceTsWithNgInErrors(ts.formatDiagnosticsWithColorAndContext([diagnostic], host));
                }
                else {
                    return formatDiagnostic(diagnostic, host);
                }
            })
                .join('');
        }
        else {
            return '';
        }
    }
    exports.formatDiagnostics = formatDiagnostics;
    function calcProjectFileAndBasePath(project, host) {
        if (host === void 0) { host = file_system_1.getFileSystem(); }
        var absProject = host.resolve(project);
        var projectIsDir = host.lstat(absProject).isDirectory();
        var projectFile = projectIsDir ? host.join(absProject, 'tsconfig.json') : absProject;
        var projectDir = projectIsDir ? absProject : host.dirname(absProject);
        var basePath = host.resolve(projectDir);
        return { projectFile: projectFile, basePath: basePath };
    }
    exports.calcProjectFileAndBasePath = calcProjectFileAndBasePath;
    function readConfiguration(project, existingOptions, host) {
        var _a;
        if (host === void 0) { host = file_system_1.getFileSystem(); }
        try {
            var fs_1 = file_system_1.getFileSystem();
            var readConfigFile_1 = function (configFile) {
                return ts.readConfigFile(configFile, function (file) { return host.readFile(host.resolve(file)); });
            };
            var readAngularCompilerOptions_1 = function (configFile, parentOptions) {
                if (parentOptions === void 0) { parentOptions = {}; }
                var _a = readConfigFile_1(configFile), config = _a.config, error = _a.error;
                if (error) {
                    // Errors are handled later on by 'parseJsonConfigFileContent'
                    return parentOptions;
                }
                // we are only interested into merging 'angularCompilerOptions' as
                // other options like 'compilerOptions' are merged by TS
                var existingNgCompilerOptions = tslib_1.__assign(tslib_1.__assign({}, config.angularCompilerOptions), parentOptions);
                if (config.extends && typeof config.extends === 'string') {
                    var extendedConfigPath = getExtendedConfigPath(configFile, config.extends, host, fs_1);
                    if (extendedConfigPath !== null) {
                        // Call readAngularCompilerOptions recursively to merge NG Compiler options
                        return readAngularCompilerOptions_1(extendedConfigPath, existingNgCompilerOptions);
                    }
                }
                return existingNgCompilerOptions;
            };
            var _b = calcProjectFileAndBasePath(project, host), projectFile = _b.projectFile, basePath = _b.basePath;
            var configFileName = host.resolve(host.pwd(), projectFile);
            var _c = readConfigFile_1(projectFile), config = _c.config, error = _c.error;
            if (error) {
                return {
                    project: project,
                    errors: [error],
                    rootNames: [],
                    options: {},
                    emitFlags: api.EmitFlags.Default
                };
            }
            var existingCompilerOptions = tslib_1.__assign(tslib_1.__assign({ genDir: basePath, basePath: basePath }, readAngularCompilerOptions_1(configFileName)), existingOptions);
            var parseConfigHost = createParseConfigHost(host, fs_1);
            var _d = ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, existingCompilerOptions, configFileName), options = _d.options, errors = _d.errors, rootNames = _d.fileNames, projectReferences = _d.projectReferences;
            // Coerce to boolean as `enableIvy` can be `ngtsc|true|false|undefined` here.
            options.enableIvy = !!((_a = options.enableIvy) !== null && _a !== void 0 ? _a : true);
            var emitFlags = api.EmitFlags.Default;
            if (!(options.skipMetadataEmit || options.flatModuleOutFile)) {
                emitFlags |= api.EmitFlags.Metadata;
            }
            if (options.skipTemplateCodegen) {
                emitFlags = emitFlags & ~api.EmitFlags.Codegen;
            }
            return { project: projectFile, rootNames: rootNames, projectReferences: projectReferences, options: options, errors: errors, emitFlags: emitFlags };
        }
        catch (e) {
            var errors = [{
                    category: ts.DiagnosticCategory.Error,
                    messageText: e.stack,
                    file: undefined,
                    start: undefined,
                    length: undefined,
                    source: 'angular',
                    code: api.UNKNOWN_ERROR_CODE,
                }];
            return { project: '', errors: errors, rootNames: [], options: {}, emitFlags: api.EmitFlags.Default };
        }
    }
    exports.readConfiguration = readConfiguration;
    function createParseConfigHost(host, fs) {
        if (fs === void 0) { fs = file_system_1.getFileSystem(); }
        return {
            fileExists: host.exists.bind(host),
            readDirectory: ts.sys.readDirectory,
            readFile: host.readFile.bind(host),
            useCaseSensitiveFileNames: fs.isCaseSensitive(),
        };
    }
    function getExtendedConfigPath(configFile, extendsValue, host, fs) {
        var result = getExtendedConfigPathWorker(configFile, extendsValue, host, fs);
        if (result !== null) {
            return result;
        }
        // Try to resolve the paths with a json extension append a json extension to the file in case if
        // it is missing and the resolution failed. This is to replicate TypeScript behaviour, see:
        // https://github.com/microsoft/TypeScript/blob/294a5a7d784a5a95a8048ee990400979a6bc3a1c/src/compiler/commandLineParser.ts#L2806
        return getExtendedConfigPathWorker(configFile, extendsValue + ".json", host, fs);
    }
    function getExtendedConfigPathWorker(configFile, extendsValue, host, fs) {
        if (extendsValue.startsWith('.') || fs.isRooted(extendsValue)) {
            var extendedConfigPath = host.resolve(host.dirname(configFile), extendsValue);
            if (host.exists(extendedConfigPath)) {
                return extendedConfigPath;
            }
        }
        else {
            var parseConfigHost = createParseConfigHost(host, fs);
            // Path isn't a rooted or relative path, resolve like a module.
            var resolvedModule = ts.nodeModuleNameResolver(extendsValue, configFile, { moduleResolution: ts.ModuleResolutionKind.NodeJs, resolveJsonModule: true }, parseConfigHost).resolvedModule;
            if (resolvedModule) {
                return file_system_1.absoluteFrom(resolvedModule.resolvedFileName);
            }
        }
        return null;
    }
    function exitCodeFromResult(diags) {
        if (!diags || filterErrorsAndWarnings(diags).length === 0) {
            // If we have a result and didn't get any errors, we succeeded.
            return 0;
        }
        // Return 2 if any of the errors were unknown.
        return diags.some(function (d) { return d.source === 'angular' && d.code === api.UNKNOWN_ERROR_CODE; }) ? 2 : 1;
    }
    exports.exitCodeFromResult = exitCodeFromResult;
    function performCompilation(_a) {
        var rootNames = _a.rootNames, options = _a.options, host = _a.host, oldProgram = _a.oldProgram, emitCallback = _a.emitCallback, mergeEmitResultsCallback = _a.mergeEmitResultsCallback, _b = _a.gatherDiagnostics, gatherDiagnostics = _b === void 0 ? defaultGatherDiagnostics : _b, customTransformers = _a.customTransformers, _c = _a.emitFlags, emitFlags = _c === void 0 ? api.EmitFlags.Default : _c, _d = _a.modifiedResourceFiles, modifiedResourceFiles = _d === void 0 ? null : _d;
        var program;
        var emitResult;
        var allDiagnostics = [];
        try {
            if (!host) {
                host = ng.createCompilerHost({ options: options });
            }
            if (modifiedResourceFiles) {
                host.getModifiedResourceFiles = function () { return modifiedResourceFiles; };
            }
            program = ng.createProgram({ rootNames: rootNames, host: host, options: options, oldProgram: oldProgram });
            var beforeDiags = Date.now();
            allDiagnostics.push.apply(allDiagnostics, tslib_1.__spreadArray([], tslib_1.__read(gatherDiagnostics(program))));
            if (options.diagnostics) {
                var afterDiags = Date.now();
                allDiagnostics.push(util_1.createMessageDiagnostic("Time for diagnostics: " + (afterDiags - beforeDiags) + "ms."));
            }
            if (!hasErrors(allDiagnostics)) {
                emitResult =
                    program.emit({ emitCallback: emitCallback, mergeEmitResultsCallback: mergeEmitResultsCallback, customTransformers: customTransformers, emitFlags: emitFlags });
                allDiagnostics.push.apply(allDiagnostics, tslib_1.__spreadArray([], tslib_1.__read(emitResult.diagnostics)));
                return { diagnostics: allDiagnostics, program: program, emitResult: emitResult };
            }
            return { diagnostics: allDiagnostics, program: program };
        }
        catch (e) {
            var errMsg = void 0;
            var code = void 0;
            if (compiler_1.isSyntaxError(e)) {
                // don't report the stack for syntax errors as they are well known errors.
                errMsg = e.message;
                code = api.DEFAULT_ERROR_CODE;
            }
            else {
                errMsg = e.stack;
                // It is not a syntax error we might have a program with unknown state, discard it.
                program = undefined;
                code = api.UNKNOWN_ERROR_CODE;
            }
            allDiagnostics.push({ category: ts.DiagnosticCategory.Error, messageText: errMsg, code: code, source: api.SOURCE });
            return { diagnostics: allDiagnostics, program: program };
        }
    }
    exports.performCompilation = performCompilation;
    function defaultGatherDiagnostics(program) {
        var allDiagnostics = [];
        function checkDiagnostics(diags) {
            if (diags) {
                allDiagnostics.push.apply(allDiagnostics, tslib_1.__spreadArray([], tslib_1.__read(diags)));
                return !hasErrors(diags);
            }
            return true;
        }
        var checkOtherDiagnostics = true;
        // Check parameter diagnostics
        checkOtherDiagnostics = checkOtherDiagnostics &&
            checkDiagnostics(tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(program.getTsOptionDiagnostics())), tslib_1.__read(program.getNgOptionDiagnostics())));
        // Check syntactic diagnostics
        checkOtherDiagnostics =
            checkOtherDiagnostics && checkDiagnostics(program.getTsSyntacticDiagnostics());
        // Check TypeScript semantic and Angular structure diagnostics
        checkOtherDiagnostics =
            checkOtherDiagnostics &&
                checkDiagnostics(tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(program.getTsSemanticDiagnostics())), tslib_1.__read(program.getNgStructuralDiagnostics())));
        // Check Angular semantic diagnostics
        checkOtherDiagnostics =
            checkOtherDiagnostics && checkDiagnostics(program.getNgSemanticDiagnostics());
        return allDiagnostics;
    }
    exports.defaultGatherDiagnostics = defaultGatherDiagnostics;
    function hasErrors(diags) {
        return diags.some(function (d) { return d.category === ts.DiagnosticCategory.Error; });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZm9ybV9jb21waWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9wZXJmb3JtX2NvbXBpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUEwRDtJQUMxRCwrQkFBaUM7SUFFakMsMkVBQXdJO0lBR3hJLDJFQUE0RDtJQUM1RCxnRUFBMEM7SUFDMUMsd0VBQWtEO0lBQ2xELG9FQUE0RDtJQUk1RCxTQUFnQix1QkFBdUIsQ0FBQyxXQUF3QjtRQUM5RCxPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsUUFBUSxLQUFLLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQTVDLENBQTRDLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRkQsMERBRUM7SUFFRCxJQUFNLGlCQUFpQixHQUE2QjtRQUNsRCxtQkFBbUIsRUFBRSxjQUFNLE9BQUEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxFQUE1QixDQUE0QjtRQUN2RCxvQkFBb0IsRUFBRSxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsRUFBUixDQUFRO1FBQzFDLFVBQVUsRUFBRSxjQUFNLE9BQUEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQWQsQ0FBYztLQUNqQyxDQUFDO0lBRUYsU0FBUyxlQUFlLENBQUMsUUFBZ0IsRUFBRSxJQUE4QjtRQUN2RSxPQUFPLHNCQUFRLENBQ1gscUJBQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxFQUFFLHFCQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRUQsU0FBZ0Isd0JBQXdCLENBQ3BDLFFBQWtCLEVBQUUsSUFBa0Q7UUFBbEQscUJBQUEsRUFBQSx3QkFB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QyxJQUFJLE9BQW5CLGNBQWMsMkNBQVMsS0FBSyxJQUFFO2dCQUM5QixPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzFCO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsSUFBSSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7UUFDakMsOEJBQThCO1FBQzlCLHFCQUFxQixHQUFHLHFCQUFxQjtZQUN6QyxnQkFBZ0IsZ0VBQUssT0FBTyxDQUFDLHNCQUFzQixFQUFFLG1CQUFLLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxHQUFFLENBQUM7UUFFakcsOEJBQThCO1FBQzlCLHFCQUFxQjtZQUNqQixxQkFBcUIsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMseUJBQXlCLEVBQWlCLENBQUMsQ0FBQztRQUVsRyw4REFBOEQ7UUFDOUQscUJBQXFCO1lBQ2pCLHFCQUFxQjtnQkFDckIsZ0JBQWdCLGdFQUNSLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxtQkFBSyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsR0FBRSxDQUFDO1FBRTFGLHFDQUFxQztRQUNyQyxxQkFBcUI7WUFDakIscUJBQXFCLElBQUksZ0JBQWdCLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFpQixDQUFDLENBQUM7UUFFakcsT0FBTyxjQUFjLENBQUM7SUFDeEIsQ0FBQztJQS9CRCw0REErQkM7SUFFRCxTQUFTLFNBQVMsQ0FBQyxLQUFrQjtRQUNuQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsUUFBUSxLQUFLLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQTFDLENBQTBDLENBQUMsQ0FBQztJQUNyRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aXNTeW50YXhFcnJvciwgUG9zaXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge2Fic29sdXRlRnJvbSwgQWJzb2x1dGVGc1BhdGgsIEZpbGVTeXN0ZW0sIGdldEZpbGVTeXN0ZW0sIFJlYWRvbmx5RmlsZVN5c3RlbSwgcmVsYXRpdmUsIHJlc29sdmV9IGZyb20gJy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge05nQ29tcGlsZXJPcHRpb25zfSBmcm9tICcuL25ndHNjL2NvcmUvYXBpJztcblxuaW1wb3J0IHtyZXBsYWNlVHNXaXRoTmdJbkVycm9yc30gZnJvbSAnLi9uZ3RzYy9kaWFnbm9zdGljcyc7XG5pbXBvcnQgKiBhcyBhcGkgZnJvbSAnLi90cmFuc2Zvcm1lcnMvYXBpJztcbmltcG9ydCAqIGFzIG5nIGZyb20gJy4vdHJhbnNmb3JtZXJzL2VudHJ5X3BvaW50cyc7XG5pbXBvcnQge2NyZWF0ZU1lc3NhZ2VEaWFnbm9zdGljfSBmcm9tICcuL3RyYW5zZm9ybWVycy91dGlsJztcblxuZXhwb3J0IHR5cGUgRGlhZ25vc3RpY3MgPSBSZWFkb25seUFycmF5PHRzLkRpYWdub3N0aWN8YXBpLkRpYWdub3N0aWM+O1xuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyRXJyb3JzQW5kV2FybmluZ3MoZGlhZ25vc3RpY3M6IERpYWdub3N0aWNzKTogRGlhZ25vc3RpY3Mge1xuICByZXR1cm4gZGlhZ25vc3RpY3MuZmlsdGVyKGQgPT4gZC5jYXRlZ29yeSAhPT0gdHMuRGlhZ25vc3RpY0NhdGVnb3J5Lk1lc3NhZ2UpO1xufVxuXG5jb25zdCBkZWZhdWx0Rm9ybWF0SG9zdDogdHMuRm9ybWF0RGlhZ25vc3RpY3NIb3N0ID0ge1xuICBnZXRDdXJyZW50RGlyZWN0b3J5OiAoKSA9PiB0cy5zeXMuZ2V0Q3VycmVudERpcmVjdG9yeSgpLFxuICBnZXRDYW5vbmljYWxGaWxlTmFtZTogZmlsZU5hbWUgPT4gZmlsZU5hbWUsXG4gIGdldE5ld0xpbmU6ICgpID0+IHRzLnN5cy5uZXdMaW5lXG59O1xuXG5mdW5jdGlvbiBkaXNwbGF5RmlsZU5hbWUoZmlsZU5hbWU6IHN0cmluZywgaG9zdDogdHMuRm9ybWF0RGlhZ25vc3RpY3NIb3N0KTogc3RyaW5nIHtcbiAgcmV0dXJuIHJlbGF0aXZlKFxuICAgICAgcmVzb2x2ZShob3N0LmdldEN1cnJlbnREaXJlY3RvcnkoKSksIHJlc29sdmUoaG9zdC5nZXRDYW5vbmljYWxGaWxlTmFtZShmaWxlTmFtZSkpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdERpYWdub3N0aWNQb3NpdGlvbihcbiAgICBwb3NpdGlvbjogUG9zaXRpb24sIGhvc3Q6IHRzLkZvcm1hdERpYWdub3N0aWNzSG9zdCA9IGRlZmF1bHRGb3JtYXRIb3N0KTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke2Rpc3BsYXlGaWxlTmFtZShwb3NpdGlvbi5maWxlTmFtZSwgaG9zdCl9KCR7cG9zaXRpb24ubGluZSArIDF9LCR7cG9zaXRpb24uY29sdW1uICsgMX0pYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW5EaWFnbm9zdGljTWVzc2FnZUNoYWluKFxuICAgIGNoYWluOiBhcGkuRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiwgaG9zdDogdHMuRm9ybWF0RGlhZ25vc3RpY3NIb3N0ID0gZGVmYXVsdEZvcm1hdEhvc3QsXG4gICAgaW5kZW50ID0gMCk6IHN0cmluZyB7XG4gIGNvbnN0IG5ld0xpbmUgPSBob3N0LmdldE5ld0xpbmUoKTtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuICBpZiAoaW5kZW50KSB7XG4gICAgcmVzdWx0ICs9IG5ld0xpbmU7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZGVudDsgaSsrKSB7XG4gICAgICByZXN1bHQgKz0gJyAgJztcbiAgICB9XG4gIH1cbiAgcmVzdWx0ICs9IGNoYWluLm1lc3NhZ2VUZXh0O1xuXG4gIGNvbnN0IHBvc2l0aW9uID0gY2hhaW4ucG9zaXRpb247XG4gIC8vIGFkZCBwb3NpdGlvbiBpZiBhdmFpbGFibGUsIGFuZCB3ZSBhcmUgbm90IGF0IHRoZSBkZXBlc3QgZnJhbWVcbiAgaWYgKHBvc2l0aW9uICYmIGluZGVudCAhPT0gMCkge1xuICAgIHJlc3VsdCArPSBgIGF0ICR7Zm9ybWF0RGlhZ25vc3RpY1Bvc2l0aW9uKHBvc2l0aW9uLCBob3N0KX1gO1xuICB9XG5cbiAgaW5kZW50Kys7XG4gIGlmIChjaGFpbi5uZXh0KSB7XG4gICAgZm9yIChjb25zdCBraWQgb2YgY2hhaW4ubmV4dCkge1xuICAgICAgcmVzdWx0ICs9IGZsYXR0ZW5EaWFnbm9zdGljTWVzc2FnZUNoYWluKGtpZCwgaG9zdCwgaW5kZW50KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdERpYWdub3N0aWMoXG4gICAgZGlhZ25vc3RpYzogYXBpLkRpYWdub3N0aWMsIGhvc3Q6IHRzLkZvcm1hdERpYWdub3N0aWNzSG9zdCA9IGRlZmF1bHRGb3JtYXRIb3N0KSB7XG4gIGxldCByZXN1bHQgPSAnJztcbiAgY29uc3QgbmV3TGluZSA9IGhvc3QuZ2V0TmV3TGluZSgpO1xuICBjb25zdCBzcGFuID0gZGlhZ25vc3RpYy5zcGFuO1xuICBpZiAoc3Bhbikge1xuICAgIHJlc3VsdCArPSBgJHtcbiAgICAgICAgZm9ybWF0RGlhZ25vc3RpY1Bvc2l0aW9uKFxuICAgICAgICAgICAge2ZpbGVOYW1lOiBzcGFuLnN0YXJ0LmZpbGUudXJsLCBsaW5lOiBzcGFuLnN0YXJ0LmxpbmUsIGNvbHVtbjogc3Bhbi5zdGFydC5jb2x9LFxuICAgICAgICAgICAgaG9zdCl9OiBgO1xuICB9IGVsc2UgaWYgKGRpYWdub3N0aWMucG9zaXRpb24pIHtcbiAgICByZXN1bHQgKz0gYCR7Zm9ybWF0RGlhZ25vc3RpY1Bvc2l0aW9uKGRpYWdub3N0aWMucG9zaXRpb24sIGhvc3QpfTogYDtcbiAgfVxuICBpZiAoZGlhZ25vc3RpYy5zcGFuICYmIGRpYWdub3N0aWMuc3Bhbi5kZXRhaWxzKSB7XG4gICAgcmVzdWx0ICs9IGAke2RpYWdub3N0aWMuc3Bhbi5kZXRhaWxzfSwgJHtkaWFnbm9zdGljLm1lc3NhZ2VUZXh0fSR7bmV3TGluZX1gO1xuICB9IGVsc2UgaWYgKGRpYWdub3N0aWMuY2hhaW4pIHtcbiAgICByZXN1bHQgKz0gYCR7ZmxhdHRlbkRpYWdub3N0aWNNZXNzYWdlQ2hhaW4oZGlhZ25vc3RpYy5jaGFpbiwgaG9zdCl9LiR7bmV3TGluZX1gO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCArPSBgJHtkaWFnbm9zdGljLm1lc3NhZ2VUZXh0fSR7bmV3TGluZX1gO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREaWFnbm9zdGljcyhcbiAgICBkaWFnczogRGlhZ25vc3RpY3MsIGhvc3Q6IHRzLkZvcm1hdERpYWdub3N0aWNzSG9zdCA9IGRlZmF1bHRGb3JtYXRIb3N0KTogc3RyaW5nIHtcbiAgaWYgKGRpYWdzICYmIGRpYWdzLmxlbmd0aCkge1xuICAgIHJldHVybiBkaWFnc1xuICAgICAgICAubWFwKGRpYWdub3N0aWMgPT4ge1xuICAgICAgICAgIGlmIChhcGkuaXNUc0RpYWdub3N0aWMoZGlhZ25vc3RpYykpIHtcbiAgICAgICAgICAgIHJldHVybiByZXBsYWNlVHNXaXRoTmdJbkVycm9ycyhcbiAgICAgICAgICAgICAgICB0cy5mb3JtYXREaWFnbm9zdGljc1dpdGhDb2xvckFuZENvbnRleHQoW2RpYWdub3N0aWNdLCBob3N0KSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXREaWFnbm9zdGljKGRpYWdub3N0aWMsIGhvc3QpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLmpvaW4oJycpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG4vKiogVXNlZCB0byByZWFkIGNvbmZpZ3VyYXRpb24gZmlsZXMuICovXG5leHBvcnQgdHlwZSBDb25maWd1cmF0aW9uSG9zdCA9IFBpY2s8XG4gICAgUmVhZG9ubHlGaWxlU3lzdGVtLCAncmVhZEZpbGUnfCdleGlzdHMnfCdsc3RhdCd8J3Jlc29sdmUnfCdqb2luJ3wnZGlybmFtZSd8J2V4dG5hbWUnfCdwd2QnPjtcblxuZXhwb3J0IGludGVyZmFjZSBQYXJzZWRDb25maWd1cmF0aW9uIHtcbiAgcHJvamVjdDogc3RyaW5nO1xuICBvcHRpb25zOiBhcGkuQ29tcGlsZXJPcHRpb25zO1xuICByb290TmFtZXM6IHN0cmluZ1tdO1xuICBwcm9qZWN0UmVmZXJlbmNlcz86IHJlYWRvbmx5IHRzLlByb2plY3RSZWZlcmVuY2VbXXx1bmRlZmluZWQ7XG4gIGVtaXRGbGFnczogYXBpLkVtaXRGbGFncztcbiAgZXJyb3JzOiB0cy5EaWFnbm9zdGljW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxjUHJvamVjdEZpbGVBbmRCYXNlUGF0aChcbiAgICBwcm9qZWN0OiBzdHJpbmcsIGhvc3Q6IENvbmZpZ3VyYXRpb25Ib3N0ID0gZ2V0RmlsZVN5c3RlbSgpKTpcbiAgICB7cHJvamVjdEZpbGU6IEFic29sdXRlRnNQYXRoLCBiYXNlUGF0aDogQWJzb2x1dGVGc1BhdGh9IHtcbiAgY29uc3QgYWJzUHJvamVjdCA9IGhvc3QucmVzb2x2ZShwcm9qZWN0KTtcbiAgY29uc3QgcHJvamVjdElzRGlyID0gaG9zdC5sc3RhdChhYnNQcm9qZWN0KS5pc0RpcmVjdG9yeSgpO1xuICBjb25zdCBwcm9qZWN0RmlsZSA9IHByb2plY3RJc0RpciA/IGhvc3Quam9pbihhYnNQcm9qZWN0LCAndHNjb25maWcuanNvbicpIDogYWJzUHJvamVjdDtcbiAgY29uc3QgcHJvamVjdERpciA9IHByb2plY3RJc0RpciA/IGFic1Byb2plY3QgOiBob3N0LmRpcm5hbWUoYWJzUHJvamVjdCk7XG4gIGNvbnN0IGJhc2VQYXRoID0gaG9zdC5yZXNvbHZlKHByb2plY3REaXIpO1xuICByZXR1cm4ge3Byb2plY3RGaWxlLCBiYXNlUGF0aH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQ29uZmlndXJhdGlvbihcbiAgICBwcm9qZWN0OiBzdHJpbmcsIGV4aXN0aW5nT3B0aW9ucz86IGFwaS5Db21waWxlck9wdGlvbnMsXG4gICAgaG9zdDogQ29uZmlndXJhdGlvbkhvc3QgPSBnZXRGaWxlU3lzdGVtKCkpOiBQYXJzZWRDb25maWd1cmF0aW9uIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBmcyA9IGdldEZpbGVTeXN0ZW0oKTtcblxuICAgIGNvbnN0IHJlYWRDb25maWdGaWxlID0gKGNvbmZpZ0ZpbGU6IHN0cmluZykgPT5cbiAgICAgICAgdHMucmVhZENvbmZpZ0ZpbGUoY29uZmlnRmlsZSwgZmlsZSA9PiBob3N0LnJlYWRGaWxlKGhvc3QucmVzb2x2ZShmaWxlKSkpO1xuICAgIGNvbnN0IHJlYWRBbmd1bGFyQ29tcGlsZXJPcHRpb25zID1cbiAgICAgICAgKGNvbmZpZ0ZpbGU6IHN0cmluZywgcGFyZW50T3B0aW9uczogTmdDb21waWxlck9wdGlvbnMgPSB7fSk6IE5nQ29tcGlsZXJPcHRpb25zID0+IHtcbiAgICAgICAgICBjb25zdCB7Y29uZmlnLCBlcnJvcn0gPSByZWFkQ29uZmlnRmlsZShjb25maWdGaWxlKTtcblxuICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgLy8gRXJyb3JzIGFyZSBoYW5kbGVkIGxhdGVyIG9uIGJ5ICdwYXJzZUpzb25Db25maWdGaWxlQ29udGVudCdcbiAgICAgICAgICAgIHJldHVybiBwYXJlbnRPcHRpb25zO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHdlIGFyZSBvbmx5IGludGVyZXN0ZWQgaW50byBtZXJnaW5nICdhbmd1bGFyQ29tcGlsZXJPcHRpb25zJyBhc1xuICAgICAgICAgIC8vIG90aGVyIG9wdGlvbnMgbGlrZSAnY29tcGlsZXJPcHRpb25zJyBhcmUgbWVyZ2VkIGJ5IFRTXG4gICAgICAgICAgY29uc3QgZXhpc3RpbmdOZ0NvbXBpbGVyT3B0aW9ucyA9IHsuLi5jb25maWcuYW5ndWxhckNvbXBpbGVyT3B0aW9ucywgLi4ucGFyZW50T3B0aW9uc307XG5cbiAgICAgICAgICBpZiAoY29uZmlnLmV4dGVuZHMgJiYgdHlwZW9mIGNvbmZpZy5leHRlbmRzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29uc3QgZXh0ZW5kZWRDb25maWdQYXRoID0gZ2V0RXh0ZW5kZWRDb25maWdQYXRoKFxuICAgICAgICAgICAgICAgIGNvbmZpZ0ZpbGUsIGNvbmZpZy5leHRlbmRzLCBob3N0LCBmcyxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChleHRlbmRlZENvbmZpZ1BhdGggIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgLy8gQ2FsbCByZWFkQW5ndWxhckNvbXBpbGVyT3B0aW9ucyByZWN1cnNpdmVseSB0byBtZXJnZSBORyBDb21waWxlciBvcHRpb25zXG4gICAgICAgICAgICAgIHJldHVybiByZWFkQW5ndWxhckNvbXBpbGVyT3B0aW9ucyhleHRlbmRlZENvbmZpZ1BhdGgsIGV4aXN0aW5nTmdDb21waWxlck9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBleGlzdGluZ05nQ29tcGlsZXJPcHRpb25zO1xuICAgICAgICB9O1xuXG4gICAgY29uc3Qge3Byb2plY3RGaWxlLCBiYXNlUGF0aH0gPSBjYWxjUHJvamVjdEZpbGVBbmRCYXNlUGF0aChwcm9qZWN0LCBob3N0KTtcbiAgICBjb25zdCBjb25maWdGaWxlTmFtZSA9IGhvc3QucmVzb2x2ZShob3N0LnB3ZCgpLCBwcm9qZWN0RmlsZSk7XG4gICAgY29uc3Qge2NvbmZpZywgZXJyb3J9ID0gcmVhZENvbmZpZ0ZpbGUocHJvamVjdEZpbGUpO1xuICAgIGlmIChlcnJvcikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvamVjdCxcbiAgICAgICAgZXJyb3JzOiBbZXJyb3JdLFxuICAgICAgICByb290TmFtZXM6IFtdLFxuICAgICAgICBvcHRpb25zOiB7fSxcbiAgICAgICAgZW1pdEZsYWdzOiBhcGkuRW1pdEZsYWdzLkRlZmF1bHRcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGV4aXN0aW5nQ29tcGlsZXJPcHRpb25zOiBhcGkuQ29tcGlsZXJPcHRpb25zID0ge1xuICAgICAgZ2VuRGlyOiBiYXNlUGF0aCxcbiAgICAgIGJhc2VQYXRoLFxuICAgICAgLi4ucmVhZEFuZ3VsYXJDb21waWxlck9wdGlvbnMoY29uZmlnRmlsZU5hbWUpLFxuICAgICAgLi4uZXhpc3RpbmdPcHRpb25zLFxuICAgIH07XG5cbiAgICBjb25zdCBwYXJzZUNvbmZpZ0hvc3QgPSBjcmVhdGVQYXJzZUNvbmZpZ0hvc3QoaG9zdCwgZnMpO1xuICAgIGNvbnN0IHtvcHRpb25zLCBlcnJvcnMsIGZpbGVOYW1lczogcm9vdE5hbWVzLCBwcm9qZWN0UmVmZXJlbmNlc30gPVxuICAgICAgICB0cy5wYXJzZUpzb25Db25maWdGaWxlQ29udGVudChcbiAgICAgICAgICAgIGNvbmZpZywgcGFyc2VDb25maWdIb3N0LCBiYXNlUGF0aCwgZXhpc3RpbmdDb21waWxlck9wdGlvbnMsIGNvbmZpZ0ZpbGVOYW1lKTtcblxuICAgIC8vIENvZXJjZSB0byBib29sZWFuIGFzIGBlbmFibGVJdnlgIGNhbiBiZSBgbmd0c2N8dHJ1ZXxmYWxzZXx1bmRlZmluZWRgIGhlcmUuXG4gICAgb3B0aW9ucy5lbmFibGVJdnkgPSAhIShvcHRpb25zLmVuYWJsZUl2eSA/PyB0cnVlKTtcblxuICAgIGxldCBlbWl0RmxhZ3MgPSBhcGkuRW1pdEZsYWdzLkRlZmF1bHQ7XG4gICAgaWYgKCEob3B0aW9ucy5za2lwTWV0YWRhdGFFbWl0IHx8IG9wdGlvbnMuZmxhdE1vZHVsZU91dEZpbGUpKSB7XG4gICAgICBlbWl0RmxhZ3MgfD0gYXBpLkVtaXRGbGFncy5NZXRhZGF0YTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuc2tpcFRlbXBsYXRlQ29kZWdlbikge1xuICAgICAgZW1pdEZsYWdzID0gZW1pdEZsYWdzICYgfmFwaS5FbWl0RmxhZ3MuQ29kZWdlbjtcbiAgICB9XG4gICAgcmV0dXJuIHtwcm9qZWN0OiBwcm9qZWN0RmlsZSwgcm9vdE5hbWVzLCBwcm9qZWN0UmVmZXJlbmNlcywgb3B0aW9ucywgZXJyb3JzLCBlbWl0RmxhZ3N9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc3QgZXJyb3JzOiB0cy5EaWFnbm9zdGljW10gPSBbe1xuICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgIG1lc3NhZ2VUZXh0OiBlLnN0YWNrLFxuICAgICAgZmlsZTogdW5kZWZpbmVkLFxuICAgICAgc3RhcnQ6IHVuZGVmaW5lZCxcbiAgICAgIGxlbmd0aDogdW5kZWZpbmVkLFxuICAgICAgc291cmNlOiAnYW5ndWxhcicsXG4gICAgICBjb2RlOiBhcGkuVU5LTk9XTl9FUlJPUl9DT0RFLFxuICAgIH1dO1xuICAgIHJldHVybiB7cHJvamVjdDogJycsIGVycm9ycywgcm9vdE5hbWVzOiBbXSwgb3B0aW9uczoge30sIGVtaXRGbGFnczogYXBpLkVtaXRGbGFncy5EZWZhdWx0fTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVQYXJzZUNvbmZpZ0hvc3QoaG9zdDogQ29uZmlndXJhdGlvbkhvc3QsIGZzID0gZ2V0RmlsZVN5c3RlbSgpKTogdHMuUGFyc2VDb25maWdIb3N0IHtcbiAgcmV0dXJuIHtcbiAgICBmaWxlRXhpc3RzOiBob3N0LmV4aXN0cy5iaW5kKGhvc3QpLFxuICAgIHJlYWREaXJlY3Rvcnk6IHRzLnN5cy5yZWFkRGlyZWN0b3J5LFxuICAgIHJlYWRGaWxlOiBob3N0LnJlYWRGaWxlLmJpbmQoaG9zdCksXG4gICAgdXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lczogZnMuaXNDYXNlU2Vuc2l0aXZlKCksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldEV4dGVuZGVkQ29uZmlnUGF0aChcbiAgICBjb25maWdGaWxlOiBzdHJpbmcsIGV4dGVuZHNWYWx1ZTogc3RyaW5nLCBob3N0OiBDb25maWd1cmF0aW9uSG9zdCxcbiAgICBmczogRmlsZVN5c3RlbSk6IEFic29sdXRlRnNQYXRofG51bGwge1xuICBjb25zdCByZXN1bHQgPSBnZXRFeHRlbmRlZENvbmZpZ1BhdGhXb3JrZXIoY29uZmlnRmlsZSwgZXh0ZW5kc1ZhbHVlLCBob3N0LCBmcyk7XG4gIGlmIChyZXN1bHQgIT09IG51bGwpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gVHJ5IHRvIHJlc29sdmUgdGhlIHBhdGhzIHdpdGggYSBqc29uIGV4dGVuc2lvbiBhcHBlbmQgYSBqc29uIGV4dGVuc2lvbiB0byB0aGUgZmlsZSBpbiBjYXNlIGlmXG4gIC8vIGl0IGlzIG1pc3NpbmcgYW5kIHRoZSByZXNvbHV0aW9uIGZhaWxlZC4gVGhpcyBpcyB0byByZXBsaWNhdGUgVHlwZVNjcmlwdCBiZWhhdmlvdXIsIHNlZTpcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2Jsb2IvMjk0YTVhN2Q3ODRhNWE5NWE4MDQ4ZWU5OTA0MDA5NzlhNmJjM2ExYy9zcmMvY29tcGlsZXIvY29tbWFuZExpbmVQYXJzZXIudHMjTDI4MDZcbiAgcmV0dXJuIGdldEV4dGVuZGVkQ29uZmlnUGF0aFdvcmtlcihjb25maWdGaWxlLCBgJHtleHRlbmRzVmFsdWV9Lmpzb25gLCBob3N0LCBmcyk7XG59XG5cbmZ1bmN0aW9uIGdldEV4dGVuZGVkQ29uZmlnUGF0aFdvcmtlcihcbiAgICBjb25maWdGaWxlOiBzdHJpbmcsIGV4dGVuZHNWYWx1ZTogc3RyaW5nLCBob3N0OiBDb25maWd1cmF0aW9uSG9zdCxcbiAgICBmczogRmlsZVN5c3RlbSk6IEFic29sdXRlRnNQYXRofG51bGwge1xuICBpZiAoZXh0ZW5kc1ZhbHVlLnN0YXJ0c1dpdGgoJy4nKSB8fCBmcy5pc1Jvb3RlZChleHRlbmRzVmFsdWUpKSB7XG4gICAgY29uc3QgZXh0ZW5kZWRDb25maWdQYXRoID0gaG9zdC5yZXNvbHZlKGhvc3QuZGlybmFtZShjb25maWdGaWxlKSwgZXh0ZW5kc1ZhbHVlKTtcbiAgICBpZiAoaG9zdC5leGlzdHMoZXh0ZW5kZWRDb25maWdQYXRoKSkge1xuICAgICAgcmV0dXJuIGV4dGVuZGVkQ29uZmlnUGF0aDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgcGFyc2VDb25maWdIb3N0ID0gY3JlYXRlUGFyc2VDb25maWdIb3N0KGhvc3QsIGZzKTtcblxuICAgIC8vIFBhdGggaXNuJ3QgYSByb290ZWQgb3IgcmVsYXRpdmUgcGF0aCwgcmVzb2x2ZSBsaWtlIGEgbW9kdWxlLlxuICAgIGNvbnN0IHtcbiAgICAgIHJlc29sdmVkTW9kdWxlLFxuICAgIH0gPVxuICAgICAgICB0cy5ub2RlTW9kdWxlTmFtZVJlc29sdmVyKFxuICAgICAgICAgICAgZXh0ZW5kc1ZhbHVlLCBjb25maWdGaWxlLFxuICAgICAgICAgICAge21vZHVsZVJlc29sdXRpb246IHRzLk1vZHVsZVJlc29sdXRpb25LaW5kLk5vZGVKcywgcmVzb2x2ZUpzb25Nb2R1bGU6IHRydWV9LFxuICAgICAgICAgICAgcGFyc2VDb25maWdIb3N0KTtcbiAgICBpZiAocmVzb2x2ZWRNb2R1bGUpIHtcbiAgICAgIHJldHVybiBhYnNvbHV0ZUZyb20ocmVzb2x2ZWRNb2R1bGUucmVzb2x2ZWRGaWxlTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyZm9ybUNvbXBpbGF0aW9uUmVzdWx0IHtcbiAgZGlhZ25vc3RpY3M6IERpYWdub3N0aWNzO1xuICBwcm9ncmFtPzogYXBpLlByb2dyYW07XG4gIGVtaXRSZXN1bHQ/OiB0cy5FbWl0UmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhpdENvZGVGcm9tUmVzdWx0KGRpYWdzOiBEaWFnbm9zdGljc3x1bmRlZmluZWQpOiBudW1iZXIge1xuICBpZiAoIWRpYWdzIHx8IGZpbHRlckVycm9yc0FuZFdhcm5pbmdzKGRpYWdzKS5sZW5ndGggPT09IDApIHtcbiAgICAvLyBJZiB3ZSBoYXZlIGEgcmVzdWx0IGFuZCBkaWRuJ3QgZ2V0IGFueSBlcnJvcnMsIHdlIHN1Y2NlZWRlZC5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8vIFJldHVybiAyIGlmIGFueSBvZiB0aGUgZXJyb3JzIHdlcmUgdW5rbm93bi5cbiAgcmV0dXJuIGRpYWdzLnNvbWUoZCA9PiBkLnNvdXJjZSA9PT0gJ2FuZ3VsYXInICYmIGQuY29kZSA9PT0gYXBpLlVOS05PV05fRVJST1JfQ09ERSkgPyAyIDogMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBlcmZvcm1Db21waWxhdGlvbih7XG4gIHJvb3ROYW1lcyxcbiAgb3B0aW9ucyxcbiAgaG9zdCxcbiAgb2xkUHJvZ3JhbSxcbiAgZW1pdENhbGxiYWNrLFxuICBtZXJnZUVtaXRSZXN1bHRzQ2FsbGJhY2ssXG4gIGdhdGhlckRpYWdub3N0aWNzID0gZGVmYXVsdEdhdGhlckRpYWdub3N0aWNzLFxuICBjdXN0b21UcmFuc2Zvcm1lcnMsXG4gIGVtaXRGbGFncyA9IGFwaS5FbWl0RmxhZ3MuRGVmYXVsdCxcbiAgbW9kaWZpZWRSZXNvdXJjZUZpbGVzID0gbnVsbFxufToge1xuICByb290TmFtZXM6IHN0cmluZ1tdLFxuICBvcHRpb25zOiBhcGkuQ29tcGlsZXJPcHRpb25zLFxuICBob3N0PzogYXBpLkNvbXBpbGVySG9zdCxcbiAgb2xkUHJvZ3JhbT86IGFwaS5Qcm9ncmFtLFxuICBlbWl0Q2FsbGJhY2s/OiBhcGkuVHNFbWl0Q2FsbGJhY2ssXG4gIG1lcmdlRW1pdFJlc3VsdHNDYWxsYmFjaz86IGFwaS5Uc01lcmdlRW1pdFJlc3VsdHNDYWxsYmFjayxcbiAgZ2F0aGVyRGlhZ25vc3RpY3M/OiAocHJvZ3JhbTogYXBpLlByb2dyYW0pID0+IERpYWdub3N0aWNzLFxuICBjdXN0b21UcmFuc2Zvcm1lcnM/OiBhcGkuQ3VzdG9tVHJhbnNmb3JtZXJzLFxuICBlbWl0RmxhZ3M/OiBhcGkuRW1pdEZsYWdzLFxuICBtb2RpZmllZFJlc291cmNlRmlsZXM/OiBTZXQ8c3RyaW5nPnwgbnVsbCxcbn0pOiBQZXJmb3JtQ29tcGlsYXRpb25SZXN1bHQge1xuICBsZXQgcHJvZ3JhbTogYXBpLlByb2dyYW18dW5kZWZpbmVkO1xuICBsZXQgZW1pdFJlc3VsdDogdHMuRW1pdFJlc3VsdHx1bmRlZmluZWQ7XG4gIGxldCBhbGxEaWFnbm9zdGljczogQXJyYXk8dHMuRGlhZ25vc3RpY3xhcGkuRGlhZ25vc3RpYz4gPSBbXTtcbiAgdHJ5IHtcbiAgICBpZiAoIWhvc3QpIHtcbiAgICAgIGhvc3QgPSBuZy5jcmVhdGVDb21waWxlckhvc3Qoe29wdGlvbnN9KTtcbiAgICB9XG4gICAgaWYgKG1vZGlmaWVkUmVzb3VyY2VGaWxlcykge1xuICAgICAgaG9zdC5nZXRNb2RpZmllZFJlc291cmNlRmlsZXMgPSAoKSA9PiBtb2RpZmllZFJlc291cmNlRmlsZXM7XG4gICAgfVxuXG4gICAgcHJvZ3JhbSA9IG5nLmNyZWF0ZVByb2dyYW0oe3Jvb3ROYW1lcywgaG9zdCwgb3B0aW9ucywgb2xkUHJvZ3JhbX0pO1xuXG4gICAgY29uc3QgYmVmb3JlRGlhZ3MgPSBEYXRlLm5vdygpO1xuICAgIGFsbERpYWdub3N0aWNzLnB1c2goLi4uZ2F0aGVyRGlhZ25vc3RpY3MocHJvZ3JhbSEpKTtcbiAgICBpZiAob3B0aW9ucy5kaWFnbm9zdGljcykge1xuICAgICAgY29uc3QgYWZ0ZXJEaWFncyA9IERhdGUubm93KCk7XG4gICAgICBhbGxEaWFnbm9zdGljcy5wdXNoKFxuICAgICAgICAgIGNyZWF0ZU1lc3NhZ2VEaWFnbm9zdGljKGBUaW1lIGZvciBkaWFnbm9zdGljczogJHthZnRlckRpYWdzIC0gYmVmb3JlRGlhZ3N9bXMuYCkpO1xuICAgIH1cblxuICAgIGlmICghaGFzRXJyb3JzKGFsbERpYWdub3N0aWNzKSkge1xuICAgICAgZW1pdFJlc3VsdCA9XG4gICAgICAgICAgcHJvZ3JhbSEuZW1pdCh7ZW1pdENhbGxiYWNrLCBtZXJnZUVtaXRSZXN1bHRzQ2FsbGJhY2ssIGN1c3RvbVRyYW5zZm9ybWVycywgZW1pdEZsYWdzfSk7XG4gICAgICBhbGxEaWFnbm9zdGljcy5wdXNoKC4uLmVtaXRSZXN1bHQuZGlhZ25vc3RpY3MpO1xuICAgICAgcmV0dXJuIHtkaWFnbm9zdGljczogYWxsRGlhZ25vc3RpY3MsIHByb2dyYW0sIGVtaXRSZXN1bHR9O1xuICAgIH1cbiAgICByZXR1cm4ge2RpYWdub3N0aWNzOiBhbGxEaWFnbm9zdGljcywgcHJvZ3JhbX07XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsZXQgZXJyTXNnOiBzdHJpbmc7XG4gICAgbGV0IGNvZGU6IG51bWJlcjtcbiAgICBpZiAoaXNTeW50YXhFcnJvcihlKSkge1xuICAgICAgLy8gZG9uJ3QgcmVwb3J0IHRoZSBzdGFjayBmb3Igc3ludGF4IGVycm9ycyBhcyB0aGV5IGFyZSB3ZWxsIGtub3duIGVycm9ycy5cbiAgICAgIGVyck1zZyA9IGUubWVzc2FnZTtcbiAgICAgIGNvZGUgPSBhcGkuREVGQVVMVF9FUlJPUl9DT0RFO1xuICAgIH0gZWxzZSB7XG4gICAgICBlcnJNc2cgPSBlLnN0YWNrO1xuICAgICAgLy8gSXQgaXMgbm90IGEgc3ludGF4IGVycm9yIHdlIG1pZ2h0IGhhdmUgYSBwcm9ncmFtIHdpdGggdW5rbm93biBzdGF0ZSwgZGlzY2FyZCBpdC5cbiAgICAgIHByb2dyYW0gPSB1bmRlZmluZWQ7XG4gICAgICBjb2RlID0gYXBpLlVOS05PV05fRVJST1JfQ09ERTtcbiAgICB9XG4gICAgYWxsRGlhZ25vc3RpY3MucHVzaChcbiAgICAgICAge2NhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsIG1lc3NhZ2VUZXh0OiBlcnJNc2csIGNvZGUsIHNvdXJjZTogYXBpLlNPVVJDRX0pO1xuICAgIHJldHVybiB7ZGlhZ25vc3RpY3M6IGFsbERpYWdub3N0aWNzLCBwcm9ncmFtfTtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRHYXRoZXJEaWFnbm9zdGljcyhwcm9ncmFtOiBhcGkuUHJvZ3JhbSk6IERpYWdub3N0aWNzIHtcbiAgY29uc3QgYWxsRGlhZ25vc3RpY3M6IEFycmF5PHRzLkRpYWdub3N0aWN8YXBpLkRpYWdub3N0aWM+ID0gW107XG5cbiAgZnVuY3Rpb24gY2hlY2tEaWFnbm9zdGljcyhkaWFnczogRGlhZ25vc3RpY3N8dW5kZWZpbmVkKSB7XG4gICAgaWYgKGRpYWdzKSB7XG4gICAgICBhbGxEaWFnbm9zdGljcy5wdXNoKC4uLmRpYWdzKTtcbiAgICAgIHJldHVybiAhaGFzRXJyb3JzKGRpYWdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBsZXQgY2hlY2tPdGhlckRpYWdub3N0aWNzID0gdHJ1ZTtcbiAgLy8gQ2hlY2sgcGFyYW1ldGVyIGRpYWdub3N0aWNzXG4gIGNoZWNrT3RoZXJEaWFnbm9zdGljcyA9IGNoZWNrT3RoZXJEaWFnbm9zdGljcyAmJlxuICAgICAgY2hlY2tEaWFnbm9zdGljcyhbLi4ucHJvZ3JhbS5nZXRUc09wdGlvbkRpYWdub3N0aWNzKCksIC4uLnByb2dyYW0uZ2V0TmdPcHRpb25EaWFnbm9zdGljcygpXSk7XG5cbiAgLy8gQ2hlY2sgc3ludGFjdGljIGRpYWdub3N0aWNzXG4gIGNoZWNrT3RoZXJEaWFnbm9zdGljcyA9XG4gICAgICBjaGVja090aGVyRGlhZ25vc3RpY3MgJiYgY2hlY2tEaWFnbm9zdGljcyhwcm9ncmFtLmdldFRzU3ludGFjdGljRGlhZ25vc3RpY3MoKSBhcyBEaWFnbm9zdGljcyk7XG5cbiAgLy8gQ2hlY2sgVHlwZVNjcmlwdCBzZW1hbnRpYyBhbmQgQW5ndWxhciBzdHJ1Y3R1cmUgZGlhZ25vc3RpY3NcbiAgY2hlY2tPdGhlckRpYWdub3N0aWNzID1cbiAgICAgIGNoZWNrT3RoZXJEaWFnbm9zdGljcyAmJlxuICAgICAgY2hlY2tEaWFnbm9zdGljcyhcbiAgICAgICAgICBbLi4ucHJvZ3JhbS5nZXRUc1NlbWFudGljRGlhZ25vc3RpY3MoKSwgLi4ucHJvZ3JhbS5nZXROZ1N0cnVjdHVyYWxEaWFnbm9zdGljcygpXSk7XG5cbiAgLy8gQ2hlY2sgQW5ndWxhciBzZW1hbnRpYyBkaWFnbm9zdGljc1xuICBjaGVja090aGVyRGlhZ25vc3RpY3MgPVxuICAgICAgY2hlY2tPdGhlckRpYWdub3N0aWNzICYmIGNoZWNrRGlhZ25vc3RpY3MocHJvZ3JhbS5nZXROZ1NlbWFudGljRGlhZ25vc3RpY3MoKSBhcyBEaWFnbm9zdGljcyk7XG5cbiAgcmV0dXJuIGFsbERpYWdub3N0aWNzO1xufVxuXG5mdW5jdGlvbiBoYXNFcnJvcnMoZGlhZ3M6IERpYWdub3N0aWNzKSB7XG4gIHJldHVybiBkaWFncy5zb21lKGQgPT4gZC5jYXRlZ29yeSA9PT0gdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yKTtcbn1cbiJdfQ==