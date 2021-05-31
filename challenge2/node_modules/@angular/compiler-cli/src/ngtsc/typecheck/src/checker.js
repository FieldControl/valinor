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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/checker", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/program_driver", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/shims", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/typecheck/api", "@angular/compiler-cli/src/ngtsc/typecheck/src/completion", "@angular/compiler-cli/src/ngtsc/typecheck/src/context", "@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics", "@angular/compiler-cli/src/ngtsc/typecheck/src/shim", "@angular/compiler-cli/src/ngtsc/typecheck/src/source", "@angular/compiler-cli/src/ngtsc/typecheck/src/tcb_util", "@angular/compiler-cli/src/ngtsc/typecheck/src/template_symbol_builder"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TemplateTypeCheckerImpl = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var program_driver_1 = require("@angular/compiler-cli/src/ngtsc/program_driver");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var shims_1 = require("@angular/compiler-cli/src/ngtsc/shims");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/api");
    var completion_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/completion");
    var context_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/context");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics");
    var shim_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/shim");
    var source_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/source");
    var tcb_util_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/tcb_util");
    var template_symbol_builder_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/template_symbol_builder");
    var REGISTRY = new compiler_1.DomElementSchemaRegistry();
    /**
     * Primary template type-checking engine, which performs type-checking using a
     * `TypeCheckingProgramStrategy` for type-checking program maintenance, and the
     * `ProgramTypeCheckAdapter` for generation of template type-checking code.
     */
    var TemplateTypeCheckerImpl = /** @class */ (function () {
        function TemplateTypeCheckerImpl(originalProgram, programDriver, typeCheckAdapter, config, refEmitter, reflector, compilerHost, priorBuild, componentScopeReader, typeCheckScopeRegistry, perf) {
            this.originalProgram = originalProgram;
            this.programDriver = programDriver;
            this.typeCheckAdapter = typeCheckAdapter;
            this.config = config;
            this.refEmitter = refEmitter;
            this.reflector = reflector;
            this.compilerHost = compilerHost;
            this.priorBuild = priorBuild;
            this.componentScopeReader = componentScopeReader;
            this.typeCheckScopeRegistry = typeCheckScopeRegistry;
            this.perf = perf;
            this.state = new Map();
            /**
             * Stores the `CompletionEngine` which powers autocompletion for each component class.
             *
             * Must be invalidated whenever the component's template or the `ts.Program` changes. Invalidation
             * on template changes is performed within this `TemplateTypeCheckerImpl` instance. When the
             * `ts.Program` changes, the `TemplateTypeCheckerImpl` as a whole is destroyed and replaced.
             */
            this.completionCache = new Map();
            /**
             * Stores the `SymbolBuilder` which creates symbols for each component class.
             *
             * Must be invalidated whenever the component's template or the `ts.Program` changes. Invalidation
             * on template changes is performed within this `TemplateTypeCheckerImpl` instance. When the
             * `ts.Program` changes, the `TemplateTypeCheckerImpl` as a whole is destroyed and replaced.
             */
            this.symbolBuilderCache = new Map();
            /**
             * Stores directives and pipes that are in scope for each component.
             *
             * Unlike other caches, the scope of a component is not affected by its template. It will be
             * destroyed when the `ts.Program` changes and the `TemplateTypeCheckerImpl` as a whole is
             * destroyed and replaced.
             */
            this.scopeCache = new Map();
            /**
             * Stores potential element tags for each component (a union of DOM tags as well as directive
             * tags).
             *
             * Unlike other caches, the scope of a component is not affected by its template. It will be
             * destroyed when the `ts.Program` changes and the `TemplateTypeCheckerImpl` as a whole is
             * destroyed and replaced.
             */
            this.elementTagCache = new Map();
            this.isComplete = false;
        }
        TemplateTypeCheckerImpl.prototype.getTemplate = function (component) {
            var data = this.getLatestComponentState(component).data;
            if (data === null) {
                return null;
            }
            return data.template;
        };
        TemplateTypeCheckerImpl.prototype.getLatestComponentState = function (component) {
            this.ensureShimForComponent(component);
            var sf = component.getSourceFile();
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            var shimPath = shim_1.TypeCheckShimGenerator.shimFor(sfPath);
            var fileRecord = this.getFileData(sfPath);
            if (!fileRecord.shimData.has(shimPath)) {
                return { data: null, tcb: null, shimPath: shimPath };
            }
            var templateId = fileRecord.sourceManager.getTemplateId(component);
            var shimRecord = fileRecord.shimData.get(shimPath);
            var id = fileRecord.sourceManager.getTemplateId(component);
            var program = this.programDriver.getProgram();
            var shimSf = typescript_1.getSourceFileOrNull(program, shimPath);
            if (shimSf === null || !fileRecord.shimData.has(shimPath)) {
                throw new Error("Error: no shim file in program: " + shimPath);
            }
            var tcb = tcb_util_1.findTypeCheckBlock(shimSf, id, /*isDiagnosticsRequest*/ false);
            if (tcb === null) {
                // Try for an inline block.
                var inlineSf = file_system_1.getSourceFileOrError(program, sfPath);
                tcb = tcb_util_1.findTypeCheckBlock(inlineSf, id, /*isDiagnosticsRequest*/ false);
            }
            var data = null;
            if (shimRecord.templates.has(templateId)) {
                data = shimRecord.templates.get(templateId);
            }
            return { data: data, tcb: tcb, shimPath: shimPath };
        };
        TemplateTypeCheckerImpl.prototype.isTrackedTypeCheckFile = function (filePath) {
            return this.getFileAndShimRecordsForPath(filePath) !== null;
        };
        TemplateTypeCheckerImpl.prototype.getFileAndShimRecordsForPath = function (shimPath) {
            var e_1, _a;
            try {
                for (var _b = tslib_1.__values(this.state.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var fileRecord = _c.value;
                    if (fileRecord.shimData.has(shimPath)) {
                        return { fileRecord: fileRecord, shimRecord: fileRecord.shimData.get(shimPath) };
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return null;
        };
        TemplateTypeCheckerImpl.prototype.getTemplateMappingAtShimLocation = function (_a) {
            var shimPath = _a.shimPath, positionInShimFile = _a.positionInShimFile;
            var records = this.getFileAndShimRecordsForPath(file_system_1.absoluteFrom(shimPath));
            if (records === null) {
                return null;
            }
            var fileRecord = records.fileRecord;
            var shimSf = this.programDriver.getProgram().getSourceFile(file_system_1.absoluteFrom(shimPath));
            if (shimSf === undefined) {
                return null;
            }
            return tcb_util_1.getTemplateMapping(shimSf, positionInShimFile, fileRecord.sourceManager, /*isDiagnosticsRequest*/ false);
        };
        TemplateTypeCheckerImpl.prototype.generateAllTypeCheckBlocks = function () {
            this.ensureAllShimsForAllFiles();
        };
        /**
         * Retrieve type-checking and template parse diagnostics from the given `ts.SourceFile` using the
         * most recent type-checking program.
         */
        TemplateTypeCheckerImpl.prototype.getDiagnosticsForFile = function (sf, optimizeFor) {
            var _this = this;
            switch (optimizeFor) {
                case api_1.OptimizeFor.WholeProgram:
                    this.ensureAllShimsForAllFiles();
                    break;
                case api_1.OptimizeFor.SingleFile:
                    this.ensureAllShimsForOneFile(sf);
                    break;
            }
            return this.perf.inPhase(perf_1.PerfPhase.TtcDiagnostics, function () {
                var e_2, _a, e_3, _b;
                var sfPath = file_system_1.absoluteFromSourceFile(sf);
                var fileRecord = _this.state.get(sfPath);
                var typeCheckProgram = _this.programDriver.getProgram();
                var diagnostics = [];
                if (fileRecord.hasInlines) {
                    var inlineSf = file_system_1.getSourceFileOrError(typeCheckProgram, sfPath);
                    diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(typeCheckProgram.getSemanticDiagnostics(inlineSf).map(function (diag) { return convertDiagnostic(diag, fileRecord.sourceManager); }))));
                }
                try {
                    for (var _c = tslib_1.__values(fileRecord.shimData), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var _e = tslib_1.__read(_d.value, 2), shimPath = _e[0], shimRecord = _e[1];
                        var shimSf = file_system_1.getSourceFileOrError(typeCheckProgram, shimPath);
                        diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(typeCheckProgram.getSemanticDiagnostics(shimSf).map(function (diag) { return convertDiagnostic(diag, fileRecord.sourceManager); }))));
                        diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(shimRecord.genesisDiagnostics)));
                        try {
                            for (var _f = (e_3 = void 0, tslib_1.__values(shimRecord.templates.values())), _g = _f.next(); !_g.done; _g = _f.next()) {
                                var templateData = _g.value;
                                diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(templateData.templateDiagnostics)));
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return diagnostics.filter(function (diag) { return diag !== null; });
            });
        };
        TemplateTypeCheckerImpl.prototype.getDiagnosticsForComponent = function (component) {
            var _this = this;
            this.ensureShimForComponent(component);
            return this.perf.inPhase(perf_1.PerfPhase.TtcDiagnostics, function () {
                var e_4, _a;
                var sf = component.getSourceFile();
                var sfPath = file_system_1.absoluteFromSourceFile(sf);
                var shimPath = shim_1.TypeCheckShimGenerator.shimFor(sfPath);
                var fileRecord = _this.getFileData(sfPath);
                if (!fileRecord.shimData.has(shimPath)) {
                    return [];
                }
                var templateId = fileRecord.sourceManager.getTemplateId(component);
                var shimRecord = fileRecord.shimData.get(shimPath);
                var typeCheckProgram = _this.programDriver.getProgram();
                var diagnostics = [];
                if (shimRecord.hasInlines) {
                    var inlineSf = file_system_1.getSourceFileOrError(typeCheckProgram, sfPath);
                    diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(typeCheckProgram.getSemanticDiagnostics(inlineSf).map(function (diag) { return convertDiagnostic(diag, fileRecord.sourceManager); }))));
                }
                var shimSf = file_system_1.getSourceFileOrError(typeCheckProgram, shimPath);
                diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(typeCheckProgram.getSemanticDiagnostics(shimSf).map(function (diag) { return convertDiagnostic(diag, fileRecord.sourceManager); }))));
                diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(shimRecord.genesisDiagnostics)));
                try {
                    for (var _b = tslib_1.__values(shimRecord.templates.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var templateData = _c.value;
                        diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(templateData.templateDiagnostics)));
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                return diagnostics.filter(function (diag) {
                    return diag !== null && diag.templateId === templateId;
                });
            });
        };
        TemplateTypeCheckerImpl.prototype.getTypeCheckBlock = function (component) {
            return this.getLatestComponentState(component).tcb;
        };
        TemplateTypeCheckerImpl.prototype.getGlobalCompletions = function (context, component, node) {
            var engine = this.getOrCreateCompletionEngine(component);
            if (engine === null) {
                return null;
            }
            return this.perf.inPhase(perf_1.PerfPhase.TtcAutocompletion, function () { return engine.getGlobalCompletions(context, node); });
        };
        TemplateTypeCheckerImpl.prototype.getExpressionCompletionLocation = function (ast, component) {
            var engine = this.getOrCreateCompletionEngine(component);
            if (engine === null) {
                return null;
            }
            return this.perf.inPhase(perf_1.PerfPhase.TtcAutocompletion, function () { return engine.getExpressionCompletionLocation(ast); });
        };
        TemplateTypeCheckerImpl.prototype.invalidateClass = function (clazz) {
            this.completionCache.delete(clazz);
            this.symbolBuilderCache.delete(clazz);
            this.scopeCache.delete(clazz);
            this.elementTagCache.delete(clazz);
            var sf = clazz.getSourceFile();
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            var shimPath = shim_1.TypeCheckShimGenerator.shimFor(sfPath);
            var fileData = this.getFileData(sfPath);
            var templateId = fileData.sourceManager.getTemplateId(clazz);
            fileData.shimData.delete(shimPath);
            fileData.isComplete = false;
            this.isComplete = false;
        };
        TemplateTypeCheckerImpl.prototype.getOrCreateCompletionEngine = function (component) {
            if (this.completionCache.has(component)) {
                return this.completionCache.get(component);
            }
            var _a = this.getLatestComponentState(component), tcb = _a.tcb, data = _a.data, shimPath = _a.shimPath;
            if (tcb === null || data === null) {
                return null;
            }
            var engine = new completion_1.CompletionEngine(tcb, data, shimPath);
            this.completionCache.set(component, engine);
            return engine;
        };
        TemplateTypeCheckerImpl.prototype.maybeAdoptPriorResultsForFile = function (sf) {
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            if (this.state.has(sfPath)) {
                var existingResults = this.state.get(sfPath);
                if (existingResults.isComplete) {
                    // All data for this file has already been generated, so no need to adopt anything.
                    return;
                }
            }
            var previousResults = this.priorBuild.priorTypeCheckingResultsFor(sf);
            if (previousResults === null || !previousResults.isComplete) {
                return;
            }
            this.perf.eventCount(perf_1.PerfEvent.ReuseTypeCheckFile);
            this.state.set(sfPath, previousResults);
        };
        TemplateTypeCheckerImpl.prototype.ensureAllShimsForAllFiles = function () {
            var _this = this;
            if (this.isComplete) {
                return;
            }
            this.perf.inPhase(perf_1.PerfPhase.TcbGeneration, function () {
                var e_5, _a;
                var host = new WholeProgramTypeCheckingHost(_this);
                var ctx = _this.newContext(host);
                try {
                    for (var _b = tslib_1.__values(_this.originalProgram.getSourceFiles()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var sf = _c.value;
                        if (sf.isDeclarationFile || shims_1.isShim(sf)) {
                            continue;
                        }
                        _this.maybeAdoptPriorResultsForFile(sf);
                        var sfPath = file_system_1.absoluteFromSourceFile(sf);
                        var fileData = _this.getFileData(sfPath);
                        if (fileData.isComplete) {
                            continue;
                        }
                        _this.typeCheckAdapter.typeCheck(sf, ctx);
                        fileData.isComplete = true;
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                _this.updateFromContext(ctx);
                _this.isComplete = true;
            });
        };
        TemplateTypeCheckerImpl.prototype.ensureAllShimsForOneFile = function (sf) {
            var _this = this;
            this.perf.inPhase(perf_1.PerfPhase.TcbGeneration, function () {
                _this.maybeAdoptPriorResultsForFile(sf);
                var sfPath = file_system_1.absoluteFromSourceFile(sf);
                var fileData = _this.getFileData(sfPath);
                if (fileData.isComplete) {
                    // All data for this file is present and accounted for already.
                    return;
                }
                var host = new SingleFileTypeCheckingHost(sfPath, fileData, _this);
                var ctx = _this.newContext(host);
                _this.typeCheckAdapter.typeCheck(sf, ctx);
                fileData.isComplete = true;
                _this.updateFromContext(ctx);
            });
        };
        TemplateTypeCheckerImpl.prototype.ensureShimForComponent = function (component) {
            var sf = component.getSourceFile();
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            var shimPath = shim_1.TypeCheckShimGenerator.shimFor(sfPath);
            this.maybeAdoptPriorResultsForFile(sf);
            var fileData = this.getFileData(sfPath);
            if (fileData.shimData.has(shimPath)) {
                // All data for this component is available.
                return;
            }
            var host = new SingleShimTypeCheckingHost(sfPath, fileData, this, shimPath);
            var ctx = this.newContext(host);
            this.typeCheckAdapter.typeCheck(sf, ctx);
            this.updateFromContext(ctx);
        };
        TemplateTypeCheckerImpl.prototype.newContext = function (host) {
            var inlining = this.programDriver.supportsInlineOperations ? context_1.InliningMode.InlineOps : context_1.InliningMode.Error;
            return new context_1.TypeCheckContextImpl(this.config, this.compilerHost, this.refEmitter, this.reflector, host, inlining, this.perf);
        };
        /**
         * Remove any shim data that depends on inline operations applied to the type-checking program.
         *
         * This can be useful if new inlines need to be applied, and it's not possible to guarantee that
         * they won't overwrite or corrupt existing inlines that are used by such shims.
         */
        TemplateTypeCheckerImpl.prototype.clearAllShimDataUsingInlines = function () {
            var e_6, _a, e_7, _b;
            try {
                for (var _c = tslib_1.__values(this.state.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var fileData = _d.value;
                    if (!fileData.hasInlines) {
                        continue;
                    }
                    try {
                        for (var _e = (e_7 = void 0, tslib_1.__values(fileData.shimData.entries())), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var _g = tslib_1.__read(_f.value, 2), shimFile = _g[0], shimData = _g[1];
                            if (shimData.hasInlines) {
                                fileData.shimData.delete(shimFile);
                            }
                        }
                    }
                    catch (e_7_1) { e_7 = { error: e_7_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_7) throw e_7.error; }
                    }
                    fileData.hasInlines = false;
                    fileData.isComplete = false;
                    this.isComplete = false;
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_6) throw e_6.error; }
            }
        };
        TemplateTypeCheckerImpl.prototype.updateFromContext = function (ctx) {
            var _this = this;
            var updates = ctx.finalize();
            return this.perf.inPhase(perf_1.PerfPhase.TcbUpdateProgram, function () {
                if (updates.size > 0) {
                    _this.perf.eventCount(perf_1.PerfEvent.UpdateTypeCheckProgram);
                }
                _this.programDriver.updateFiles(updates, program_driver_1.UpdateMode.Incremental);
                _this.priorBuild.recordSuccessfulTypeCheck(_this.state);
                _this.perf.memory(perf_1.PerfCheckpoint.TtcUpdateProgram);
            });
        };
        TemplateTypeCheckerImpl.prototype.getFileData = function (path) {
            if (!this.state.has(path)) {
                this.state.set(path, {
                    hasInlines: false,
                    sourceManager: new source_1.TemplateSourceManager(),
                    isComplete: false,
                    shimData: new Map(),
                });
            }
            return this.state.get(path);
        };
        TemplateTypeCheckerImpl.prototype.getSymbolOfNode = function (node, component) {
            var builder = this.getOrCreateSymbolBuilder(component);
            if (builder === null) {
                return null;
            }
            return this.perf.inPhase(perf_1.PerfPhase.TtcSymbol, function () { return builder.getSymbol(node); });
        };
        TemplateTypeCheckerImpl.prototype.getOrCreateSymbolBuilder = function (component) {
            var _this = this;
            if (this.symbolBuilderCache.has(component)) {
                return this.symbolBuilderCache.get(component);
            }
            var _a = this.getLatestComponentState(component), tcb = _a.tcb, data = _a.data, shimPath = _a.shimPath;
            if (tcb === null || data === null) {
                return null;
            }
            var builder = new template_symbol_builder_1.SymbolBuilder(shimPath, tcb, data, this.componentScopeReader, function () { return _this.programDriver.getProgram().getTypeChecker(); });
            this.symbolBuilderCache.set(component, builder);
            return builder;
        };
        TemplateTypeCheckerImpl.prototype.getDirectivesInScope = function (component) {
            var data = this.getScopeData(component);
            if (data === null) {
                return null;
            }
            return data.directives;
        };
        TemplateTypeCheckerImpl.prototype.getPipesInScope = function (component) {
            var data = this.getScopeData(component);
            if (data === null) {
                return null;
            }
            return data.pipes;
        };
        TemplateTypeCheckerImpl.prototype.getDirectiveMetadata = function (dir) {
            if (!reflection_1.isNamedClassDeclaration(dir)) {
                return null;
            }
            return this.typeCheckScopeRegistry.getTypeCheckDirectiveMetadata(new imports_1.Reference(dir));
        };
        TemplateTypeCheckerImpl.prototype.getPotentialElementTags = function (component) {
            var e_8, _a, e_9, _b, e_10, _c;
            if (this.elementTagCache.has(component)) {
                return this.elementTagCache.get(component);
            }
            var tagMap = new Map();
            try {
                for (var _d = tslib_1.__values(REGISTRY.allKnownElementNames()), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var tag = _e.value;
                    tagMap.set(tag, null);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_8) throw e_8.error; }
            }
            var scope = this.getScopeData(component);
            if (scope !== null) {
                try {
                    for (var _f = tslib_1.__values(scope.directives), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var directive = _g.value;
                        try {
                            for (var _h = (e_10 = void 0, tslib_1.__values(compiler_1.CssSelector.parse(directive.selector))), _j = _h.next(); !_j.done; _j = _h.next()) {
                                var selector = _j.value;
                                if (selector.element === null || tagMap.has(selector.element)) {
                                    // Skip this directive if it doesn't match an element tag, or if another directive has
                                    // already been included with the same element name.
                                    continue;
                                }
                                tagMap.set(selector.element, directive);
                            }
                        }
                        catch (e_10_1) { e_10 = { error: e_10_1 }; }
                        finally {
                            try {
                                if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                            }
                            finally { if (e_10) throw e_10.error; }
                        }
                    }
                }
                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_9) throw e_9.error; }
                }
            }
            this.elementTagCache.set(component, tagMap);
            return tagMap;
        };
        TemplateTypeCheckerImpl.prototype.getPotentialDomBindings = function (tagName) {
            var attributes = REGISTRY.allKnownAttributesOfElement(tagName);
            return attributes.map(function (attribute) { return ({
                attribute: attribute,
                property: REGISTRY.getMappedPropName(attribute),
            }); });
        };
        TemplateTypeCheckerImpl.prototype.getScopeData = function (component) {
            var e_11, _a, e_12, _b;
            if (this.scopeCache.has(component)) {
                return this.scopeCache.get(component);
            }
            if (!reflection_1.isNamedClassDeclaration(component)) {
                throw new Error("AssertionError: components must have names");
            }
            var scope = this.componentScopeReader.getScopeForComponent(component);
            if (scope === null) {
                return null;
            }
            var data = {
                directives: [],
                pipes: [],
                isPoisoned: scope.compilation.isPoisoned,
            };
            var typeChecker = this.programDriver.getProgram().getTypeChecker();
            try {
                for (var _c = tslib_1.__values(scope.compilation.directives), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var dir = _d.value;
                    if (dir.selector === null) {
                        // Skip this directive, it can't be added to a template anyway.
                        continue;
                    }
                    var tsSymbol = typeChecker.getSymbolAtLocation(dir.ref.node.name);
                    if (tsSymbol === undefined) {
                        continue;
                    }
                    var ngModule = null;
                    var moduleScopeOfDir = this.componentScopeReader.getScopeForComponent(dir.ref.node);
                    if (moduleScopeOfDir !== null) {
                        ngModule = moduleScopeOfDir.ngModule;
                    }
                    data.directives.push({
                        isComponent: dir.isComponent,
                        isStructural: dir.isStructural,
                        selector: dir.selector,
                        tsSymbol: tsSymbol,
                        ngModule: ngModule,
                    });
                }
            }
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_11) throw e_11.error; }
            }
            try {
                for (var _e = tslib_1.__values(scope.compilation.pipes), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var pipe = _f.value;
                    var tsSymbol = typeChecker.getSymbolAtLocation(pipe.ref.node.name);
                    if (tsSymbol === undefined) {
                        continue;
                    }
                    data.pipes.push({
                        name: pipe.name,
                        tsSymbol: tsSymbol,
                    });
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_12) throw e_12.error; }
            }
            this.scopeCache.set(component, data);
            return data;
        };
        return TemplateTypeCheckerImpl;
    }());
    exports.TemplateTypeCheckerImpl = TemplateTypeCheckerImpl;
    function convertDiagnostic(diag, sourceResolver) {
        if (!diagnostics_1.shouldReportDiagnostic(diag)) {
            return null;
        }
        return diagnostics_1.translateDiagnostic(diag, sourceResolver);
    }
    /**
     * Drives a `TypeCheckContext` to generate type-checking code for every component in the program.
     */
    var WholeProgramTypeCheckingHost = /** @class */ (function () {
        function WholeProgramTypeCheckingHost(impl) {
            this.impl = impl;
        }
        WholeProgramTypeCheckingHost.prototype.getSourceManager = function (sfPath) {
            return this.impl.getFileData(sfPath).sourceManager;
        };
        WholeProgramTypeCheckingHost.prototype.shouldCheckComponent = function (node) {
            var sfPath = file_system_1.absoluteFromSourceFile(node.getSourceFile());
            var shimPath = shim_1.TypeCheckShimGenerator.shimFor(sfPath);
            var fileData = this.impl.getFileData(sfPath);
            // The component needs to be checked unless the shim which would contain it already exists.
            return !fileData.shimData.has(shimPath);
        };
        WholeProgramTypeCheckingHost.prototype.recordShimData = function (sfPath, data) {
            var fileData = this.impl.getFileData(sfPath);
            fileData.shimData.set(data.path, data);
            if (data.hasInlines) {
                fileData.hasInlines = true;
            }
        };
        WholeProgramTypeCheckingHost.prototype.recordComplete = function (sfPath) {
            this.impl.getFileData(sfPath).isComplete = true;
        };
        return WholeProgramTypeCheckingHost;
    }());
    /**
     * Drives a `TypeCheckContext` to generate type-checking code efficiently for a single input file.
     */
    var SingleFileTypeCheckingHost = /** @class */ (function () {
        function SingleFileTypeCheckingHost(sfPath, fileData, impl) {
            this.sfPath = sfPath;
            this.fileData = fileData;
            this.impl = impl;
            this.seenInlines = false;
        }
        SingleFileTypeCheckingHost.prototype.assertPath = function (sfPath) {
            if (this.sfPath !== sfPath) {
                throw new Error("AssertionError: querying TypeCheckingHost outside of assigned file");
            }
        };
        SingleFileTypeCheckingHost.prototype.getSourceManager = function (sfPath) {
            this.assertPath(sfPath);
            return this.fileData.sourceManager;
        };
        SingleFileTypeCheckingHost.prototype.shouldCheckComponent = function (node) {
            if (this.sfPath !== file_system_1.absoluteFromSourceFile(node.getSourceFile())) {
                return false;
            }
            var shimPath = shim_1.TypeCheckShimGenerator.shimFor(this.sfPath);
            // Only need to generate a TCB for the class if no shim exists for it currently.
            return !this.fileData.shimData.has(shimPath);
        };
        SingleFileTypeCheckingHost.prototype.recordShimData = function (sfPath, data) {
            this.assertPath(sfPath);
            // Previous type-checking state may have required the use of inlines (assuming they were
            // supported). If the current operation also requires inlines, this presents a problem:
            // generating new inlines may invalidate any old inlines that old state depends on.
            //
            // Rather than resolve this issue by tracking specific dependencies on inlines, if the new state
            // relies on inlines, any old state that relied on them is simply cleared. This happens when the
            // first new state that uses inlines is encountered.
            if (data.hasInlines && !this.seenInlines) {
                this.impl.clearAllShimDataUsingInlines();
                this.seenInlines = true;
            }
            this.fileData.shimData.set(data.path, data);
            if (data.hasInlines) {
                this.fileData.hasInlines = true;
            }
        };
        SingleFileTypeCheckingHost.prototype.recordComplete = function (sfPath) {
            this.assertPath(sfPath);
            this.fileData.isComplete = true;
        };
        return SingleFileTypeCheckingHost;
    }());
    /**
     * Drives a `TypeCheckContext` to generate type-checking code efficiently for only those components
     * which map to a single shim of a single input file.
     */
    var SingleShimTypeCheckingHost = /** @class */ (function (_super) {
        tslib_1.__extends(SingleShimTypeCheckingHost, _super);
        function SingleShimTypeCheckingHost(sfPath, fileData, impl, shimPath) {
            var _this = _super.call(this, sfPath, fileData, impl) || this;
            _this.shimPath = shimPath;
            return _this;
        }
        SingleShimTypeCheckingHost.prototype.shouldCheckNode = function (node) {
            if (this.sfPath !== file_system_1.absoluteFromSourceFile(node.getSourceFile())) {
                return false;
            }
            // Only generate a TCB for the component if it maps to the requested shim file.
            var shimPath = shim_1.TypeCheckShimGenerator.shimFor(this.sfPath);
            if (shimPath !== this.shimPath) {
                return false;
            }
            // Only need to generate a TCB for the class if no shim exists for it currently.
            return !this.fileData.shimData.has(shimPath);
        };
        return SingleShimTypeCheckingHost;
    }(SingleFileTypeCheckingHost));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy9jaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBcVA7SUFHclAsMkVBQTZHO0lBQzdHLG1FQUEwRDtJQUUxRCw2REFBOEU7SUFDOUUsaUZBQStEO0lBQy9ELHlFQUEyRjtJQUUzRiwrREFBbUM7SUFDbkMsa0ZBQThEO0lBQzlELHFFQUF3UTtJQUd4USx1RkFBOEM7SUFDOUMsaUZBQW1IO0lBQ25ILHlGQUEwRTtJQUMxRSwyRUFBOEM7SUFDOUMsK0VBQStDO0lBQy9DLG1GQUEwRjtJQUMxRixpSEFBd0Q7SUFHeEQsSUFBTSxRQUFRLEdBQUcsSUFBSSxtQ0FBd0IsRUFBRSxDQUFDO0lBQ2hEOzs7O09BSUc7SUFDSDtRQXlDRSxpQ0FDWSxlQUEyQixFQUFXLGFBQTRCLEVBQ2xFLGdCQUF5QyxFQUFVLE1BQTBCLEVBQzdFLFVBQTRCLEVBQVUsU0FBeUIsRUFDL0QsWUFBMkQsRUFDM0QsVUFBMkQsRUFDbEQsb0JBQTBDLEVBQzFDLHNCQUE4QyxFQUM5QyxJQUFrQjtZQVAzQixvQkFBZSxHQUFmLGVBQWUsQ0FBWTtZQUFXLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQ2xFLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBeUI7WUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFvQjtZQUM3RSxlQUFVLEdBQVYsVUFBVSxDQUFrQjtZQUFVLGNBQVMsR0FBVCxTQUFTLENBQWdCO1lBQy9ELGlCQUFZLEdBQVosWUFBWSxDQUErQztZQUMzRCxlQUFVLEdBQVYsVUFBVSxDQUFpRDtZQUNsRCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1lBQzFDLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7WUFDOUMsU0FBSSxH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QUM7SUFBRCxDQUFDLEFBckRELElBcURDO0lBRUQ7OztPQUdHO0lBQ0g7UUFBeUMsc0RBQTBCO1FBQ2pFLG9DQUNJLE1BQXNCLEVBQUUsUUFBOEIsRUFBRSxJQUE2QixFQUM3RSxRQUF3QjtZQUZwQyxZQUdFLGtCQUFNLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQzlCO1lBRlcsY0FBUSxHQUFSLFFBQVEsQ0FBZ0I7O1FBRXBDLENBQUM7UUFFRCxvREFBZSxHQUFmLFVBQWdCLElBQXlCO1lBQ3ZDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxvQ0FBc0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRTtnQkFDaEUsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUVELCtFQUErRTtZQUMvRSxJQUFNLFFBQVEsR0FBRyw2QkFBc0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzdELElBQUksUUFBUSxLQUFLLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQzlCLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFFRCxnRkFBZ0Y7WUFDaEYsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBQ0gsaUNBQUM7SUFBRCxDQUFDLEFBckJELENBQXlDLDBCQUEwQixHQXFCbEUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBU1QsIENzc1NlbGVjdG9yLCBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnksIE1ldGhvZENhbGwsIFBhcnNlRXJyb3IsIHBhcnNlVGVtcGxhdGUsIFByb3BlcnR5UmVhZCwgU2FmZU1ldGhvZENhbGwsIFNhZmVQcm9wZXJ0eVJlYWQsIFRtcGxBc3RFbGVtZW50LCBUbXBsQXN0Tm9kZSwgVG1wbEFzdFJlZmVyZW5jZSwgVG1wbEFzdFRlbXBsYXRlLCBUbXBsQXN0VmFyaWFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge2Fic29sdXRlRnJvbSwgYWJzb2x1dGVGcm9tU291cmNlRmlsZSwgQWJzb2x1dGVGc1BhdGgsIGdldFNvdXJjZUZpbGVPckVycm9yfSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge1JlZmVyZW5jZSwgUmVmZXJlbmNlRW1pdHRlcn0gZnJvbSAnLi4vLi4vaW1wb3J0cyc7XG5pbXBvcnQge0luY3JlbWVudGFsQnVpbGR9IGZyb20gJy4uLy4uL2luY3JlbWVudGFsL2FwaSc7XG5pbXBvcnQge1BlcmZDaGVja3BvaW50LCBQZXJmRXZlbnQsIFBlcmZQaGFzZSwgUGVyZlJlY29yZGVyfSBmcm9tICcuLi8uLi9wZXJmJztcbmltcG9ydCB7UHJvZ3JhbURyaXZlciwgVXBkYXRlTW9kZX0gZnJvbSAnLi4vLi4vcHJvZ3JhbV9kcml2ZXInO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBpc05hbWVkQ2xhc3NEZWNsYXJhdGlvbiwgUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtDb21wb25lbnRTY29wZVJlYWRlciwgVHlwZUNoZWNrU2NvcGVSZWdpc3RyeX0gZnJvbSAnLi4vLi4vc2NvcGUnO1xuaW1wb3J0IHtpc1NoaW19IGZyb20gJy4uLy4uL3NoaW1zJztcbmltcG9ydCB7Z2V0U291cmNlRmlsZU9yTnVsbH0gZnJvbSAnLi4vLi4vdXRpbC9zcmMvdHlwZXNjcmlwdCc7XG5pbXBvcnQge0RpcmVjdGl2ZUluU2NvcGUsIEVsZW1lbnRTeW1ib2wsIEZ1bGxUZW1wbGF0ZU1hcHBpbmcsIEdsb2JhbENvbXBsZXRpb24sIE9wdGltaXplRm9yLCBQaXBlSW5TY29wZSwgUHJvZ3JhbVR5cGVDaGVja0FkYXB0ZXIsIFNoaW1Mb2NhdGlvbiwgU3ltYm9sLCBUZW1wbGF0ZUlkLCBUZW1wbGF0ZVN5bWJvbCwgVGVtcGxhdGVUeXBlQ2hlY2tlciwgVHlwZUNoZWNrYWJsZURpcmVjdGl2ZU1ldGEsIFR5cGVDaGVja2luZ0NvbmZpZ30gZnJvbSAnLi4vYXBpJztcbmltcG9ydCB7VGVtcGxhdGVEaWFnbm9zdGljfSBmcm9tICcuLi9kaWFnbm9zdGljcyc7XG5cbmltcG9ydCB7Q29tcGxldGlvbkVuZ2luZX0gZnJvbSAnLi9jb21wbGV0aW9uJztcbmltcG9ydCB7SW5saW5pbmdNb2RlLCBTaGltVHlwZUNoZWNraW5nRGF0YSwgVGVtcGxhdGVEYXRhLCBUeXBlQ2hlY2tDb250ZXh0SW1wbCwgVHlwZUNoZWNraW5nSG9zdH0gZnJvbSAnLi9jb250ZXh0JztcbmltcG9ydCB7c2hvdWxkUmVwb3J0RGlhZ25vc3RpYywgdHJhbnNsYXRlRGlhZ25vc3RpY30gZnJvbSAnLi9kaWFnbm9zdGljcyc7XG5pbXBvcnQge1R5cGVDaGVja1NoaW1HZW5lcmF0b3J9IGZyb20gJy4vc2hpbSc7XG5pbXBvcnQge1RlbXBsYXRlU291cmNlTWFuYWdlcn0gZnJvbSAnLi9zb3VyY2UnO1xuaW1wb3J0IHtmaW5kVHlwZUNoZWNrQmxvY2ssIGdldFRlbXBsYXRlTWFwcGluZywgVGVtcGxhdGVTb3VyY2VSZXNvbHZlcn0gZnJvbSAnLi90Y2JfdXRpbCc7XG5pbXBvcnQge1N5bWJvbEJ1aWxkZXJ9IGZyb20gJy4vdGVtcGxhdGVfc3ltYm9sX2J1aWxkZXInO1xuXG5cbmNvbnN0IFJFR0lTVFJZID0gbmV3IERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSgpO1xuLyoqXG4gKiBQcmltYXJ5IHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgZW5naW5lLCB3aGljaCBwZXJmb3JtcyB0eXBlLWNoZWNraW5nIHVzaW5nIGFcbiAqIGBUeXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3lgIGZvciB0eXBlLWNoZWNraW5nIHByb2dyYW0gbWFpbnRlbmFuY2UsIGFuZCB0aGVcbiAqIGBQcm9ncmFtVHlwZUNoZWNrQWRhcHRlcmAgZm9yIGdlbmVyYXRpb24gb2YgdGVtcGxhdGUgdHlwZS1jaGVja2luZyBjb2RlLlxuICovXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVUeXBlQ2hlY2tlckltcGwgaW1wbGVtZW50cyBUZW1wbGF0ZVR5cGVDaGVja2VyIHtcbiAgcHJpdmF0ZSBzdGF0ZSA9IG5ldyBNYXA8QWJzb2x1dGVGc1BhdGgsIEZpbGVUeXBlQ2hlY2tpbmdEYXRhPigpO1xuXG4gIC8qKlxuICAgKiBTdG9yZXMgdGhlIGBDb21wbGV0aW9uRW5naW5lYCB3aGljaCBwb3dlcnMgYXV0b2NvbXBsZXRpb24gZm9yIGVhY2ggY29tcG9uZW50IGNsYXNzLlxuICAgKlxuICAgKiBNdXN0IGJlIGludmFsaWRhdGVkIHdoZW5ldmVyIHRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZSBvciB0aGUgYHRzLlByb2dyYW1gIGNoYW5nZXMuIEludmFsaWRhdGlvblxuICAgKiBvbiB0ZW1wbGF0ZSBjaGFuZ2VzIGlzIHBlcmZvcm1lZCB3aXRoaW4gdGhpcyBgVGVtcGxhdGVUeXBlQ2hlY2tlckltcGxgIGluc3RhbmNlLiBXaGVuIHRoZVxuICAgKiBgdHMuUHJvZ3JhbWAgY2hhbmdlcywgdGhlIGBUZW1wbGF0ZVR5cGVDaGVja2VySW1wbGAgYXMgYSB3aG9sZSBpcyBkZXN0cm95ZWQgYW5kIHJlcGxhY2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBjb21wbGV0aW9uQ2FjaGUgPSBuZXcgTWFwPHRzLkNsYXNzRGVjbGFyYXRpb24sIENvbXBsZXRpb25FbmdpbmU+KCk7XG4gIC8qKlxuICAgKiBTdG9yZXMgdGhlIGBTeW1ib2xCdWlsZGVyYCB3aGljaCBjcmVhdGVzIHN5bWJvbHMgZm9yIGVhY2ggY29tcG9uZW50IGNsYXNzLlxuICAgKlxuICAgKiBNdXN0IGJlIGludmFsaWRhdGVkIHdoZW5ldmVyIHRoZSBjb21wb25lbnQncyB0ZW1wbGF0ZSBvciB0aGUgYHRzLlByb2dyYW1gIGNoYW5nZXMuIEludmFsaWRhdGlvblxuICAgKiBvbiB0ZW1wbGF0ZSBjaGFuZ2VzIGlzIHBlcmZvcm1lZCB3aXRoaW4gdGhpcyBgVGVtcGxhdGVUeXBlQ2hlY2tlckltcGxgIGluc3RhbmNlLiBXaGVuIHRoZVxuICAgKiBgdHMuUHJvZ3JhbWAgY2hhbmdlcywgdGhlIGBUZW1wbGF0ZVR5cGVDaGVja2VySW1wbGAgYXMgYSB3aG9sZSBpcyBkZXN0cm95ZWQgYW5kIHJlcGxhY2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBzeW1ib2xCdWlsZGVyQ2FjaGUgPSBuZXcgTWFwPHRzLkNsYXNzRGVjbGFyYXRpb24sIFN5bWJvbEJ1aWxkZXI+KCk7XG5cbiAgLyoqXG4gICAqIFN0b3JlcyBkaXJlY3RpdmVzIGFuZCBwaXBlcyB0aGF0IGFyZSBpbiBzY29wZSBmb3IgZWFjaCBjb21wb25lbnQuXG4gICAqXG4gICAqIFVubGlrZSBvdGhlciBjYWNoZXMsIHRoZSBzY29wZSBvZiBhIGNvbXBvbmVudCBpcyBub3QgYWZmZWN0ZWQgYnkgaXRzIHRlbXBsYXRlLiBJdCB3aWxsIGJlXG4gICAqIGRlc3Ryb3llZCB3aGVuIHRoZSBgdHMuUHJvZ3JhbWAgY2hhbmdlcyBhbmQgdGhlIGBUZW1wbGF0ZVR5cGVDaGVja2VySW1wbGAgYXMgYSB3aG9sZSBpc1xuICAgKiBkZXN0cm95ZWQgYW5kIHJlcGxhY2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBzY29wZUNhY2hlID0gbmV3IE1hcDx0cy5DbGFzc0RlY2xhcmF0aW9uLCBTY29wZURhdGE+KCk7XG5cbiAgLyoqXG4gICAqIFN0b3JlcyBwb3RlbnRpYWwgZWxlbWVudCB0YWdzIGZvciBlYWNoIGNvbXBvbmVudCAoYSB1bmlvbiBvZiBET00gdGFncyBhcyB3ZWxsIGFzIGRpcmVjdGl2ZVxuICAgKiB0YWdzKS5cbiAgICpcbiAgICogVW5saWtlIG90aGVyIGNhY2hlcywgdGhlIHNjb3BlIG9mIGEgY29tcG9uZW50IGlzIG5vdCBhZmZlY3RlZCBieSBpdHMgdGVtcGxhdGUuIEl0IHdpbGwgYmVcbiAgICogZGVzdHJveWVkIHdoZW4gdGhlIGB0cy5Qcm9ncmFtYCBjaGFuZ2VzIGFuZCB0aGUgYFRlbXBsYXRlVHlwZUNoZWNrZXJJbXBsYCBhcyBhIHdob2xlIGlzXG4gICAqIGRlc3Ryb3llZCBhbmQgcmVwbGFjZWQuXG4gICAqL1xuICBwcml2YXRlIGVsZW1lbnRUYWdDYWNoZSA9IG5ldyBNYXA8dHMuQ2xhc3NEZWNsYXJhdGlvbiwgTWFwPHN0cmluZywgRGlyZWN0aXZlSW5TY29wZXxudWxsPj4oKTtcblxuICBwcml2YXRlIGlzQ29tcGxldGUgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgb3JpZ2luYWxQcm9ncmFtOiB0cy5Qcm9ncmFtLCByZWFkb25seSBwcm9ncmFtRHJpdmVyOiBQcm9ncmFtRHJpdmVyLFxuICAgICAgcHJpdmF0ZSB0eXBlQ2hlY2tBZGFwdGVyOiBQcm9ncmFtVHlwZUNoZWNrQWRhcHRlciwgcHJpdmF0ZSBjb25maWc6IFR5cGVDaGVja2luZ0NvbmZpZyxcbiAgICAgIHByaXZhdGUgcmVmRW1pdHRlcjogUmVmZXJlbmNlRW1pdHRlciwgcHJpdmF0ZSByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LFxuICAgICAgcHJpdmF0ZSBjb21waWxlckhvc3Q6IFBpY2s8dHMuQ29tcGlsZXJIb3N0LCAnZ2V0Q2Fub25pY2FsRmlsZU5hbWUnPixcbiAgICAgIHByaXZhdGUgcHJpb3JCdWlsZDogSW5jcmVtZW50YWxCdWlsZDx1bmtub3duLCBGaWxlVHlwZUNoZWNraW5nRGF0YT4sXG4gICAgICBwcml2YXRlIHJlYWRvbmx5IGNvbXBvbmVudFNjb3BlUmVhZGVyOiBDb21wb25lbnRTY29wZVJlYWRlcixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgdHlwZUNoZWNrU2NvcGVSZWdpc3RyeTogVHlwZUNoZWNrU2NvcGVSZWdpc3RyeSxcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgcGVyZjogUGVyZlJlY29yZGVyKSB7fVxuXG4gIGdldFRlbXBsYXRlKGNvbXBvbmVudDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IFRtcGxBc3ROb2RlW118bnVsbCB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5nZXRMYXRlc3RDb21wb25lbnRTdGF0ZShjb21wb25lbnQpO1xuICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGEudGVtcGxhdGU7XG4gIH1cblxuICBwcml2YXRlIGdldExhdGVzdENvbXBvbmVudFN0YXRlKGNvbXBvbmVudDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6XG4gICAgICB7ZGF0YTogVGVtcGxhdGVEYXRhfG51bGwsIHRjYjogdHMuTm9kZXxudWxsLCBzaGltUGF0aDogQWJzb2x1dGVGc1BhdGh9IHtcbiAgICB0aGlzLmVuc3VyZVNoaW1Gb3JDb21wb25lbnQoY29tcG9uZW50KTtcblxuICAgIGNvbnN0IHNmID0gY29tcG9uZW50LmdldFNvdXJjZUZpbGUoKTtcbiAgICBjb25zdCBzZlBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNmKTtcbiAgICBjb25zdCBzaGltUGF0aCA9IFR5cGVDaGVja1NoaW1HZW5lcmF0b3Iuc2hpbUZvcihzZlBhdGgpO1xuXG4gICAgY29uc3QgZmlsZVJlY29yZCA9IHRoaXMuZ2V0RmlsZURhdGEoc2ZQYXRoKTtcblxuICAgIGlmICghZmlsZVJlY29yZC5zaGltRGF0YS5oYXMoc2hpbVBhdGgpKSB7XG4gICAgICByZXR1cm4ge2RhdGE6IG51bGwsIHRjYjogbnVsbCwgc2hpbVBhdGh9O1xuICAgIH1cblxuICAgIGNvbnN0IHRlbXBsYXRlSWQgPSBmaWxlUmVjb3JkLnNvdXJjZU1hbmFnZXIuZ2V0VGVtcGxhdGVJZChjb21wb25lbnQpO1xuICAgIGNvbnN0IHNoaW1SZWNvcmQgPSBmaWxlUmVjb3JkLnNoaW1EYXRhLmdldChzaGltUGF0aCkhO1xuICAgIGNvbnN0IGlkID0gZmlsZVJlY29yZC5zb3VyY2VNYW5hZ2VyLmdldFRlbXBsYXRlSWQoY29tcG9uZW50KTtcblxuICAgIGNvbnN0IHByb2dyYW0gPSB0aGlzLnByb2dyYW1Ecml2ZXIuZ2V0UHJvZ3JhbSgpO1xuICAgIGNvbnN0IHNoaW1TZiA9IGdldFNvdXJjZUZpbGVPck51bGwocHJvZ3JhbSwgc2hpbVBhdGgpO1xuXG4gICAgaWYgKHNoaW1TZiA9PT0gbnVsbCB8fCAhZmlsZVJlY29yZC5zaGltRGF0YS5oYXMoc2hpbVBhdGgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yOiBubyBzaGltIGZpbGUgaW4gcHJvZ3JhbTogJHtzaGltUGF0aH1gKTtcbiAgICB9XG5cbiAgICBsZXQgdGNiOiB0cy5Ob2RlfG51bGwgPSBmaW5kVHlwZUNoZWNrQmxvY2soc2hpbVNmLCBpZCwgLyppc0RpYWdub3N0aWNzUmVxdWVzdCovIGZhbHNlKTtcblxuICAgIGlmICh0Y2IgPT09IG51bGwpIHtcbiAgICAgIC8vIFRyeSBmb3IgYW4gaW5saW5lIGJsb2NrLlxuICAgICAgY29uc3QgaW5saW5lU2YgPSBnZXRTb3VyY2VGaWxlT3JFcnJvcihwcm9ncmFtLCBzZlBhdGgpO1xuICAgICAgdGNiID0gZmluZFR5cGVDaGVja0Jsb2NrKGlubGluZVNmLCBpZCwgLyppc0RpYWdub3N0aWNzUmVxdWVzdCovIGZhbHNlKTtcbiAgICB9XG5cbiAgICBsZXQgZGF0YTogVGVtcGxhdGVEYXRhfG51bGwgPSBudWxsO1xuICAgIGlmIChzaGltUmVjb3JkLnRlbXBsYXRlcy5oYXModGVtcGxhdGVJZCkpIHtcbiAgICAgIGRhdGEgPSBzaGltUmVjb3JkLnRlbXBsYXRlcy5nZXQodGVtcGxhdGVJZCkhO1xuICAgIH1cblxuICAgIHJldHVybiB7ZGF0YSwgdGNiLCBzaGltUGF0aH07XG4gIH1cblxuICBpc1RyYWNrZWRUeXBlQ2hlY2tGaWxlKGZpbGVQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldEZpbGVBbmRTaGltUmVjb3Jkc0ZvclBhdGgoZmlsZVBhdGgpICE9PSBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGaWxlQW5kU2hpbVJlY29yZHNGb3JQYXRoKHNoaW1QYXRoOiBBYnNvbHV0ZUZzUGF0aCk6XG4gICAgICB7ZmlsZVJlY29yZDogRmlsZVR5cGVDaGVja2luZ0RhdGEsIHNoaW1SZWNvcmQ6IFNoaW1UeXBlQ2hlY2tpbmdEYXRhfXxudWxsIHtcbiAgICBmb3IgKGNvbnN0IGZpbGVSZWNvcmQgb2YgdGhpcy5zdGF0ZS52YWx1ZXMoKSkge1xuICAgICAgaWYgKGZpbGVSZWNvcmQuc2hpbURhdGEuaGFzKHNoaW1QYXRoKSkge1xuICAgICAgICByZXR1cm4ge2ZpbGVSZWNvcmQsIHNoaW1SZWNvcmQ6IGZpbGVSZWNvcmQuc2hpbURhdGEuZ2V0KHNoaW1QYXRoKSF9O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldFRlbXBsYXRlTWFwcGluZ0F0U2hpbUxvY2F0aW9uKHtzaGltUGF0aCwgcG9zaXRpb25JblNoaW1GaWxlfTogU2hpbUxvY2F0aW9uKTpcbiAgICAgIEZ1bGxUZW1wbGF0ZU1hcHBpbmd8bnVsbCB7XG4gICAgY29uc3QgcmVjb3JkcyA9IHRoaXMuZ2V0RmlsZUFuZFNoaW1SZWNvcmRzRm9yUGF0aChhYnNvbHV0ZUZyb20oc2hpbVBhdGgpKTtcbiAgICBpZiAocmVjb3JkcyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHtmaWxlUmVjb3JkfSA9IHJlY29yZHM7XG5cbiAgICBjb25zdCBzaGltU2YgPSB0aGlzLnByb2dyYW1Ecml2ZXIuZ2V0UHJvZ3JhbSgpLmdldFNvdXJjZUZpbGUoYWJzb2x1dGVGcm9tKHNoaW1QYXRoKSk7XG4gICAgaWYgKHNoaW1TZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGdldFRlbXBsYXRlTWFwcGluZyhcbiAgICAgICAgc2hpbVNmLCBwb3NpdGlvbkluU2hpbUZpbGUsIGZpbGVSZWNvcmQuc291cmNlTWFuYWdlciwgLyppc0RpYWdub3N0aWNzUmVxdWVzdCovIGZhbHNlKTtcbiAgfVxuXG4gIGdlbmVyYXRlQWxsVHlwZUNoZWNrQmxvY2tzKCkge1xuICAgIHRoaXMuZW5zdXJlQWxsU2hpbXNGb3JBbGxGaWxlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHR5cGUtY2hlY2tpbmcgYW5kIHRlbXBsYXRlIHBhcnNlIGRpYWdub3N0aWNzIGZyb20gdGhlIGdpdmVuIGB0cy5Tb3VyY2VGaWxlYCB1c2luZyB0aGVcbiAgICogbW9zdCByZWNlbnQgdHlwZS1jaGVja2luZyBwcm9ncmFtLlxuICAgKi9cbiAgZ2V0RGlhZ25vc3RpY3NGb3JGaWxlKHNmOiB0cy5Tb3VyY2VGaWxlLCBvcHRpbWl6ZUZvcjogT3B0aW1pemVGb3IpOiB0cy5EaWFnbm9zdGljW10ge1xuICAgIHN3aXRjaCAob3B0aW1pemVGb3IpIHtcbiAgICAgIGNhc2UgT3B0aW1pemVGb3IuV2hvbGVQcm9ncmFtOlxuICAgICAgICB0aGlzLmVuc3VyZUFsbFNoaW1zRm9yQWxsRmlsZXMoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIE9wdGltaXplRm9yLlNpbmdsZUZpbGU6XG4gICAgICAgIHRoaXMuZW5zdXJlQWxsU2hpbXNGb3JPbmVGaWxlKHNmKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucGVyZi5pblBoYXNlKFBlcmZQaGFzZS5UdGNEaWFnbm9zdGljcywgKCkgPT4ge1xuICAgICAgY29uc3Qgc2ZQYXRoID0gYWJzb2x1dGVGcm9tU291cmNlRmlsZShzZik7XG4gICAgICBjb25zdCBmaWxlUmVjb3JkID0gdGhpcy5zdGF0ZS5nZXQoc2ZQYXRoKSE7XG5cbiAgICAgIGNvbnN0IHR5cGVDaGVja1Byb2dyYW0gPSB0aGlzLnByb2dyYW1Ecml2ZXIuZ2V0UHJvZ3JhbSgpO1xuXG4gICAgICBjb25zdCBkaWFnbm9zdGljczogKHRzLkRpYWdub3N0aWN8bnVsbClbXSA9IFtdO1xuICAgICAgaWYgKGZpbGVSZWNvcmQuaGFzSW5saW5lcykge1xuICAgICAgICBjb25zdCBpbmxpbmVTZiA9IGdldFNvdXJjZUZpbGVPckVycm9yKHR5cGVDaGVja1Byb2dyYW0sIHNmUGF0aCk7XG4gICAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4udHlwZUNoZWNrUHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKGlubGluZVNmKS5tYXAoXG4gICAgICAgICAgICBkaWFnID0+IGNvbnZlcnREaWFnbm9zdGljKGRpYWcsIGZpbGVSZWNvcmQuc291cmNlTWFuYWdlcikpKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBbc2hpbVBhdGgsIHNoaW1SZWNvcmRdIG9mIGZpbGVSZWNvcmQuc2hpbURhdGEpIHtcbiAgICAgICAgY29uc3Qgc2hpbVNmID0gZ2V0U291cmNlRmlsZU9yRXJyb3IodHlwZUNoZWNrUHJvZ3JhbSwgc2hpbVBhdGgpO1xuICAgICAgICBkaWFnbm9zdGljcy5wdXNoKC4uLnR5cGVDaGVja1Byb2dyYW0uZ2V0U2VtYW50aWNEaWFnbm9zdGljcyhzaGltU2YpLm1hcChcbiAgICAgICAgICAgIGRpYWcgPT4gY29udmVydERpYWdub3N0aWMoZGlhZywgZmlsZVJlY29yZC5zb3VyY2VNYW5hZ2VyKSkpO1xuICAgICAgICBkaWFnbm9zdGljcy5wdXNoKC4uLnNoaW1SZWNvcmQuZ2VuZXNpc0RpYWdub3N0aWNzKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHRlbXBsYXRlRGF0YSBvZiBzaGltUmVjb3JkLnRlbXBsYXRlcy52YWx1ZXMoKSkge1xuICAgICAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4udGVtcGxhdGVEYXRhLnRlbXBsYXRlRGlhZ25vc3RpY3MpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkaWFnbm9zdGljcy5maWx0ZXIoKGRpYWc6IHRzLkRpYWdub3N0aWN8bnVsbCk6IGRpYWcgaXMgdHMuRGlhZ25vc3RpYyA9PiBkaWFnICE9PSBudWxsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldERpYWdub3N0aWNzRm9yQ29tcG9uZW50KGNvbXBvbmVudDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IHRzLkRpYWdub3N0aWNbXSB7XG4gICAgdGhpcy5lbnN1cmVTaGltRm9yQ29tcG9uZW50KGNvbXBvbmVudCk7XG5cbiAgICByZXR1cm4gdGhpcy5wZXJmLmluUGhhc2UoUGVyZlBoYXNlLlR0Y0RpYWdub3N0aWNzLCAoKSA9PiB7XG4gICAgICBjb25zdCBzZiA9IGNvbXBvbmVudC5nZXRTb3VyY2VGaWxlKCk7XG4gICAgICBjb25zdCBzZlBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNmKTtcbiAgICAgIGNvbnN0IHNoaW1QYXRoID0gVHlwZUNoZWNrU2hpbUdlbmVyYXRvci5zaGltRm9yKHNmUGF0aCk7XG5cbiAgICAgIGNvbnN0IGZpbGVSZWNvcmQgPSB0aGlzLmdldEZpbGVEYXRhKHNmUGF0aCk7XG5cbiAgICAgIGlmICghZmlsZVJlY29yZC5zaGltRGF0YS5oYXMoc2hpbVBhdGgpKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGVtcGxhdGVJZCA9IGZpbGVSZWNvcmQuc291cmNlTWFuYWdlci5nZXRUZW1wbGF0ZUlkKGNvbXBvbmVudCk7XG4gICAgICBjb25zdCBzaGltUmVjb3JkID0gZmlsZVJlY29yZC5zaGltRGF0YS5nZXQoc2hpbVBhdGgpITtcblxuICAgICAgY29uc3QgdHlwZUNoZWNrUHJvZ3JhbSA9IHRoaXMucHJvZ3JhbURyaXZlci5nZXRQcm9ncmFtKCk7XG5cbiAgICAgIGNvbnN0IGRpYWdub3N0aWNzOiAoVGVtcGxhdGVEaWFnbm9zdGljfG51bGwpW10gPSBbXTtcbiAgICAgIGlmIChzaGltUmVjb3JkLmhhc0lubGluZXMpIHtcbiAgICAgICAgY29uc3QgaW5saW5lU2YgPSBnZXRTb3VyY2VGaWxlT3JFcnJvcih0eXBlQ2hlY2tQcm9ncmFtLCBzZlBhdGgpO1xuICAgICAgICBkaWFnbm9zdGljcy5wdXNoKC4uLnR5cGVDaGVja1Byb2dyYW0uZ2V0U2VtYW50aWNEaWFnbm9zdGljcyhpbmxpbmVTZikubWFwKFxuICAgICAgICAgICAgZGlhZyA9PiBjb252ZXJ0RGlhZ25vc3RpYyhkaWFnLCBmaWxlUmVjb3JkLnNvdXJjZU1hbmFnZXIpKSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNoaW1TZiA9IGdldFNvdXJjZUZpbGVPckVycm9yKHR5cGVDaGVja1Byb2dyYW0sIHNoaW1QYXRoKTtcbiAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4udHlwZUNoZWNrUHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKHNoaW1TZikubWFwKFxuICAgICAgICAgIGRpYWcgPT4gY29udmVydERpYWdub3N0aWMoZGlhZywgZmlsZVJlY29yZC5zb3VyY2VNYW5hZ2VyKSkpO1xuICAgICAgZGlhZ25vc3RpY3MucHVzaCguLi5zaGltUmVjb3JkLmdlbmVzaXNEaWFnbm9zdGljcyk7XG5cbiAgICAgIGZvciAoY29uc3QgdGVtcGxhdGVEYXRhIG9mIHNoaW1SZWNvcmQudGVtcGxhdGVzLnZhbHVlcygpKSB7XG4gICAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4udGVtcGxhdGVEYXRhLnRlbXBsYXRlRGlhZ25vc3RpY3MpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGlhZ25vc3RpY3MuZmlsdGVyKFxuICAgICAgICAgIChkaWFnOiBUZW1wbGF0ZURpYWdub3N0aWN8bnVsbCk6IGRpYWcgaXMgVGVtcGxhdGVEaWFnbm9zdGljID0+XG4gICAgICAgICAgICAgIGRpYWcgIT09IG51bGwgJiYgZGlhZy50ZW1wbGF0ZUlkID09PSB0ZW1wbGF0ZUlkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldFR5cGVDaGVja0Jsb2NrKGNvbXBvbmVudDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IHRzLk5vZGV8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGF0ZXN0Q29tcG9uZW50U3RhdGUoY29tcG9uZW50KS50Y2I7XG4gIH1cblxuICBnZXRHbG9iYWxDb21wbGV0aW9ucyhcbiAgICAgIGNvbnRleHQ6IFRtcGxBc3RUZW1wbGF0ZXxudWxsLCBjb21wb25lbnQ6IHRzLkNsYXNzRGVjbGFyYXRpb24sXG4gICAgICBub2RlOiBBU1R8VG1wbEFzdE5vZGUpOiBHbG9iYWxDb21wbGV0aW9ufG51bGwge1xuICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuZ2V0T3JDcmVhdGVDb21wbGV0aW9uRW5naW5lKGNvbXBvbmVudCk7XG4gICAgaWYgKGVuZ2luZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBlcmYuaW5QaGFzZShcbiAgICAgICAgUGVyZlBoYXNlLlR0Y0F1dG9jb21wbGV0aW9uLCAoKSA9PiBlbmdpbmUuZ2V0R2xvYmFsQ29tcGxldGlvbnMoY29udGV4dCwgbm9kZSkpO1xuICB9XG5cbiAgZ2V0RXhwcmVzc2lvbkNvbXBsZXRpb25Mb2NhdGlvbihcbiAgICAgIGFzdDogUHJvcGVydHlSZWFkfFNhZmVQcm9wZXJ0eVJlYWR8TWV0aG9kQ2FsbHxTYWZlTWV0aG9kQ2FsbCxcbiAgICAgIGNvbXBvbmVudDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IFNoaW1Mb2NhdGlvbnxudWxsIHtcbiAgICBjb25zdCBlbmdpbmUgPSB0aGlzLmdldE9yQ3JlYXRlQ29tcGxldGlvbkVuZ2luZShjb21wb25lbnQpO1xuICAgIGlmIChlbmdpbmUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wZXJmLmluUGhhc2UoXG4gICAgICAgIFBlcmZQaGFzZS5UdGNBdXRvY29tcGxldGlvbiwgKCkgPT4gZW5naW5lLmdldEV4cHJlc3Npb25Db21wbGV0aW9uTG9jYXRpb24oYXN0KSk7XG4gIH1cblxuICBpbnZhbGlkYXRlQ2xhc3MoY2xheno6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiB2b2lkIHtcbiAgICB0aGlzLmNvbXBsZXRpb25DYWNoZS5kZWxldGUoY2xhenopO1xuICAgIHRoaXMuc3ltYm9sQnVpbGRlckNhY2hlLmRlbGV0ZShjbGF6eik7XG4gICAgdGhpcy5zY29wZUNhY2hlLmRlbGV0ZShjbGF6eik7XG4gICAgdGhpcy5lbGVtZW50VGFnQ2FjaGUuZGVsZXRlKGNsYXp6KTtcblxuICAgIGNvbnN0IHNmID0gY2xhenouZ2V0U291cmNlRmlsZSgpO1xuICAgIGNvbnN0IHNmUGF0aCA9IGFic29sdXRlRnJvbVNvdXJjZUZpbGUoc2YpO1xuICAgIGNvbnN0IHNoaW1QYXRoID0gVHlwZUNoZWNrU2hpbUdlbmVyYXRvci5zaGltRm9yKHNmUGF0aCk7XG4gICAgY29uc3QgZmlsZURhdGEgPSB0aGlzLmdldEZpbGVEYXRhKHNmUGF0aCk7XG4gICAgY29uc3QgdGVtcGxhdGVJZCA9IGZpbGVEYXRhLnNvdXJjZU1hbmFnZXIuZ2V0VGVtcGxhdGVJZChjbGF6eik7XG5cbiAgICBmaWxlRGF0YS5zaGltRGF0YS5kZWxldGUoc2hpbVBhdGgpO1xuICAgIGZpbGVEYXRhLmlzQ29tcGxldGUgPSBmYWxzZTtcblxuICAgIHRoaXMuaXNDb21wbGV0ZSA9IGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRPckNyZWF0ZUNvbXBsZXRpb25FbmdpbmUoY29tcG9uZW50OiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogQ29tcGxldGlvbkVuZ2luZXxudWxsIHtcbiAgICBpZiAodGhpcy5jb21wbGV0aW9uQ2FjaGUuaGFzKGNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBsZXRpb25DYWNoZS5nZXQoY29tcG9uZW50KSE7XG4gICAgfVxuXG4gICAgY29uc3Qge3RjYiwgZGF0YSwgc2hpbVBhdGh9ID0gdGhpcy5nZXRMYXRlc3RDb21wb25lbnRTdGF0ZShjb21wb25lbnQpO1xuICAgIGlmICh0Y2IgPT09IG51bGwgfHwgZGF0YSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZW5naW5lID0gbmV3IENvbXBsZXRpb25FbmdpbmUodGNiLCBkYXRhLCBzaGltUGF0aCk7XG4gICAgdGhpcy5jb21wbGV0aW9uQ2FjaGUuc2V0KGNvbXBvbmVudCwgZW5naW5lKTtcbiAgICByZXR1cm4gZW5naW5lO1xuICB9XG5cbiAgcHJpdmF0ZSBtYXliZUFkb3B0UHJpb3JSZXN1bHRzRm9yRmlsZShzZjogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIGNvbnN0IHNmUGF0aCA9IGFic29sdXRlRnJvbVNvdXJjZUZpbGUoc2YpO1xuICAgIGlmICh0aGlzLnN0YXRlLmhhcyhzZlBhdGgpKSB7XG4gICAgICBjb25zdCBleGlzdGluZ1Jlc3VsdHMgPSB0aGlzLnN0YXRlLmdldChzZlBhdGgpITtcblxuICAgICAgaWYgKGV4aXN0aW5nUmVzdWx0cy5pc0NvbXBsZXRlKSB7XG4gICAgICAgIC8vIEFsbCBkYXRhIGZvciB0aGlzIGZpbGUgaGFzIGFscmVhZHkgYmVlbiBnZW5lcmF0ZWQsIHNvIG5vIG5lZWQgdG8gYWRvcHQgYW55dGhpbmcuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwcmV2aW91c1Jlc3VsdHMgPSB0aGlzLnByaW9yQnVpbGQucHJpb3JUeXBlQ2hlY2tpbmdSZXN1bHRzRm9yKHNmKTtcbiAgICBpZiAocHJldmlvdXNSZXN1bHRzID09PSBudWxsIHx8ICFwcmV2aW91c1Jlc3VsdHMuaXNDb21wbGV0ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucGVyZi5ldmVudENvdW50KFBlcmZFdmVudC5SZXVzZVR5cGVDaGVja0ZpbGUpO1xuICAgIHRoaXMuc3RhdGUuc2V0KHNmUGF0aCwgcHJldmlvdXNSZXN1bHRzKTtcbiAgfVxuXG4gIHByaXZhdGUgZW5zdXJlQWxsU2hpbXNGb3JBbGxGaWxlcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc0NvbXBsZXRlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5wZXJmLmluUGhhc2UoUGVyZlBoYXNlLlRjYkdlbmVyYXRpb24sICgpID0+IHtcbiAgICAgIGNvbnN0IGhvc3QgPSBuZXcgV2hvbGVQcm9ncmFtVHlwZUNoZWNraW5nSG9zdCh0aGlzKTtcbiAgICAgIGNvbnN0IGN0eCA9IHRoaXMubmV3Q29udGV4dChob3N0KTtcblxuICAgICAgZm9yIChjb25zdCBzZiBvZiB0aGlzLm9yaWdpbmFsUHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpKSB7XG4gICAgICAgIGlmIChzZi5pc0RlY2xhcmF0aW9uRmlsZSB8fCBpc1NoaW0oc2YpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1heWJlQWRvcHRQcmlvclJlc3VsdHNGb3JGaWxlKHNmKTtcblxuICAgICAgICBjb25zdCBzZlBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNmKTtcbiAgICAgICAgY29uc3QgZmlsZURhdGEgPSB0aGlzLmdldEZpbGVEYXRhKHNmUGF0aCk7XG4gICAgICAgIGlmIChmaWxlRGF0YS5pc0NvbXBsZXRlKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnR5cGVDaGVja0FkYXB0ZXIudHlwZUNoZWNrKHNmLCBjdHgpO1xuXG4gICAgICAgIGZpbGVEYXRhLmlzQ29tcGxldGUgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnVwZGF0ZUZyb21Db250ZXh0KGN0eCk7XG4gICAgICB0aGlzLmlzQ29tcGxldGUgPSB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBlbnN1cmVBbGxTaGltc0Zvck9uZUZpbGUoc2Y6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICB0aGlzLnBlcmYuaW5QaGFzZShQZXJmUGhhc2UuVGNiR2VuZXJhdGlvbiwgKCkgPT4ge1xuICAgICAgdGhpcy5tYXliZUFkb3B0UHJpb3JSZXN1bHRzRm9yRmlsZShzZik7XG5cbiAgICAgIGNvbnN0IHNmUGF0aCA9IGFic29sdXRlRnJvbVNvdXJjZUZpbGUoc2YpO1xuXG4gICAgICBjb25zdCBmaWxlRGF0YSA9IHRoaXMuZ2V0RmlsZURhdGEoc2ZQYXRoKTtcbiAgICAgIGlmIChmaWxlRGF0YS5pc0NvbXBsZXRlKSB7XG4gICAgICAgIC8vIEFsbCBkYXRhIGZvciB0aGlzIGZpbGUgaXMgcHJlc2VudCBhbmQgYWNjb3VudGVkIGZvciBhbHJlYWR5LlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGhvc3QgPSBuZXcgU2luZ2xlRmlsZVR5cGVDaGVja2luZ0hvc3Qoc2ZQYXRoLCBmaWxlRGF0YSwgdGhpcyk7XG4gICAgICBjb25zdCBjdHggPSB0aGlzLm5ld0NvbnRleHQoaG9zdCk7XG5cbiAgICAgIHRoaXMudHlwZUNoZWNrQWRhcHRlci50eXBlQ2hlY2soc2YsIGN0eCk7XG5cbiAgICAgIGZpbGVEYXRhLmlzQ29tcGxldGUgPSB0cnVlO1xuXG4gICAgICB0aGlzLnVwZGF0ZUZyb21Db250ZXh0KGN0eCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGVuc3VyZVNoaW1Gb3JDb21wb25lbnQoY29tcG9uZW50OiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogdm9pZCB7XG4gICAgY29uc3Qgc2YgPSBjb21wb25lbnQuZ2V0U291cmNlRmlsZSgpO1xuICAgIGNvbnN0IHNmUGF0aCA9IGFic29sdXRlRnJvbVNvdXJjZUZpbGUoc2YpO1xuICAgIGNvbnN0IHNoaW1QYXRoID0gVHlwZUNoZWNrU2hpbUdlbmVyYXRvci5zaGltRm9yKHNmUGF0aCk7XG5cbiAgICB0aGlzLm1heWJlQWRvcHRQcmlvclJlc3VsdHNGb3JGaWxlKHNmKTtcblxuICAgIGNvbnN0IGZpbGVEYXRhID0gdGhpcy5nZXRGaWxlRGF0YShzZlBhdGgpO1xuXG4gICAgaWYgKGZpbGVEYXRhLnNoaW1EYXRhLmhhcyhzaGltUGF0aCkpIHtcbiAgICAgIC8vIEFsbCBkYXRhIGZvciB0aGlzIGNvbXBvbmVudCBpcyBhdmFpbGFibGUuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaG9zdCA9IG5ldyBTaW5nbGVTaGltVHlwZUNoZWNraW5nSG9zdChzZlBhdGgsIGZpbGVEYXRhLCB0aGlzLCBzaGltUGF0aCk7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5uZXdDb250ZXh0KGhvc3QpO1xuXG4gICAgdGhpcy50eXBlQ2hlY2tBZGFwdGVyLnR5cGVDaGVjayhzZiwgY3R4KTtcbiAgICB0aGlzLnVwZGF0ZUZyb21Db250ZXh0KGN0eCk7XG4gIH1cblxuICBwcml2YXRlIG5ld0NvbnRleHQoaG9zdDogVHlwZUNoZWNraW5nSG9zdCk6IFR5cGVDaGVja0NvbnRleHRJbXBsIHtcbiAgICBjb25zdCBpbmxpbmluZyA9XG4gICAgICAgIHRoaXMucHJvZ3JhbURyaXZlci5zdXBwb3J0c0lubGluZU9wZXJhdGlvbnMgPyBJbmxpbmluZ01vZGUuSW5saW5lT3BzIDogSW5saW5pbmdNb2RlLkVycm9yO1xuICAgIHJldHVybiBuZXcgVHlwZUNoZWNrQ29udGV4dEltcGwoXG4gICAgICAgIHRoaXMuY29uZmlnLCB0aGlzLmNvbXBpbGVySG9zdCwgdGhpcy5yZWZFbWl0dGVyLCB0aGlzLnJlZmxlY3RvciwgaG9zdCwgaW5saW5pbmcsIHRoaXMucGVyZik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFueSBzaGltIGRhdGEgdGhhdCBkZXBlbmRzIG9uIGlubGluZSBvcGVyYXRpb25zIGFwcGxpZWQgdG8gdGhlIHR5cGUtY2hlY2tpbmcgcHJvZ3JhbS5cbiAgICpcbiAgICogVGhpcyBjYW4gYmUgdXNlZnVsIGlmIG5ldyBpbmxpbmVzIG5lZWQgdG8gYmUgYXBwbGllZCwgYW5kIGl0J3Mgbm90IHBvc3NpYmxlIHRvIGd1YXJhbnRlZSB0aGF0XG4gICAqIHRoZXkgd29uJ3Qgb3ZlcndyaXRlIG9yIGNvcnJ1cHQgZXhpc3RpbmcgaW5saW5lcyB0aGF0IGFyZSB1c2VkIGJ5IHN1Y2ggc2hpbXMuXG4gICAqL1xuICBjbGVhckFsbFNoaW1EYXRhVXNpbmdJbmxpbmVzKCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZmlsZURhdGEgb2YgdGhpcy5zdGF0ZS52YWx1ZXMoKSkge1xuICAgICAgaWYgKCFmaWxlRGF0YS5oYXNJbmxpbmVzKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IFtzaGltRmlsZSwgc2hpbURhdGFdIG9mIGZpbGVEYXRhLnNoaW1EYXRhLmVudHJpZXMoKSkge1xuICAgICAgICBpZiAoc2hpbURhdGEuaGFzSW5saW5lcykge1xuICAgICAgICAgIGZpbGVEYXRhLnNoaW1EYXRhLmRlbGV0ZShzaGltRmlsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZmlsZURhdGEuaGFzSW5saW5lcyA9IGZhbHNlO1xuICAgICAgZmlsZURhdGEuaXNDb21wbGV0ZSA9IGZhbHNlO1xuICAgICAgdGhpcy5pc0NvbXBsZXRlID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVGcm9tQ29udGV4dChjdHg6IFR5cGVDaGVja0NvbnRleHRJbXBsKTogdm9pZCB7XG4gICAgY29uc3QgdXBkYXRlcyA9IGN0eC5maW5hbGl6ZSgpO1xuICAgIHJldHVybiB0aGlzLnBlcmYuaW5QaGFzZShQZXJmUGhhc2UuVGNiVXBkYXRlUHJvZ3JhbSwgKCkgPT4ge1xuICAgICAgaWYgKHVwZGF0ZXMuc2l6ZSA+IDApIHtcbiAgICAgICAgdGhpcy5wZXJmLmV2ZW50Q291bnQoUGVyZkV2ZW50LlVwZGF0ZVR5cGVDaGVja1Byb2dyYW0pO1xuICAgICAgfVxuICAgICAgdGhpcy5wcm9ncmFtRHJpdmVyLnVwZGF0ZUZpbGVzKHVwZGF0ZXMsIFVwZGF0ZU1vZGUuSW5jcmVtZW50YWwpO1xuICAgICAgdGhpcy5wcmlvckJ1aWxkLnJlY29yZFN1Y2Nlc3NmdWxUeXBlQ2hlY2sodGhpcy5zdGF0ZSk7XG4gICAgICB0aGlzLnBlcmYubWVtb3J5KFBlcmZDaGVja3BvaW50LlR0Y1VwZGF0ZVByb2dyYW0pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0RmlsZURhdGEocGF0aDogQWJzb2x1dGVGc1BhdGgpOiBGaWxlVHlwZUNoZWNraW5nRGF0YSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmhhcyhwYXRoKSkge1xuICAgICAgdGhpcy5zdGF0ZS5zZXQocGF0aCwge1xuICAgICAgICBoYXNJbmxpbmVzOiBmYWxzZSxcbiAgICAgICAgc291cmNlTWFuYWdlcjogbmV3IFRlbXBsYXRlU291cmNlTWFuYWdlcigpLFxuICAgICAgICBpc0NvbXBsZXRlOiBmYWxzZSxcbiAgICAgICAgc2hpbURhdGE6IG5ldyBNYXAoKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5nZXQocGF0aCkhO1xuICB9XG4gIGdldFN5bWJvbE9mTm9kZShub2RlOiBUbXBsQXN0VGVtcGxhdGUsIGNvbXBvbmVudDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IFRlbXBsYXRlU3ltYm9sfG51bGw7XG4gIGdldFN5bWJvbE9mTm9kZShub2RlOiBUbXBsQXN0RWxlbWVudCwgY29tcG9uZW50OiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogRWxlbWVudFN5bWJvbHxudWxsO1xuICBnZXRTeW1ib2xPZk5vZGUobm9kZTogQVNUfFRtcGxBc3ROb2RlLCBjb21wb25lbnQ6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiBTeW1ib2x8bnVsbCB7XG4gICAgY29uc3QgYnVpbGRlciA9IHRoaXMuZ2V0T3JDcmVhdGVTeW1ib2xCdWlsZGVyKGNvbXBvbmVudCk7XG4gICAgaWYgKGJ1aWxkZXIgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wZXJmLmluUGhhc2UoUGVyZlBoYXNlLlR0Y1N5bWJvbCwgKCkgPT4gYnVpbGRlci5nZXRTeW1ib2wobm9kZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRPckNyZWF0ZVN5bWJvbEJ1aWxkZXIoY29tcG9uZW50OiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogU3ltYm9sQnVpbGRlcnxudWxsIHtcbiAgICBpZiAodGhpcy5zeW1ib2xCdWlsZGVyQ2FjaGUuaGFzKGNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnN5bWJvbEJ1aWxkZXJDYWNoZS5nZXQoY29tcG9uZW50KSE7XG4gICAgfVxuXG4gICAgY29uc3Qge3RjYiwgZGF0YSwgc2hpbVBhdGh9ID0gdGhpcy5nZXRMYXRlc3RDb21wb25lbnRTdGF0ZShjb21wb25lbnQpO1xuICAgIGlmICh0Y2IgPT09IG51bGwgfHwgZGF0YSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgYnVpbGRlciA9IG5ldyBTeW1ib2xCdWlsZGVyKFxuICAgICAgICBzaGltUGF0aCwgdGNiLCBkYXRhLCB0aGlzLmNvbXBvbmVudFNjb3BlUmVhZGVyLFxuICAgICAgICAoKSA9PiB0aGlzLnByb2dyYW1Ecml2ZXIuZ2V0UHJvZ3JhbSgpLmdldFR5cGVDaGVja2VyKCkpO1xuICAgIHRoaXMuc3ltYm9sQnVpbGRlckNhY2hlLnNldChjb21wb25lbnQsIGJ1aWxkZXIpO1xuICAgIHJldHVybiBidWlsZGVyO1xuICB9XG5cbiAgZ2V0RGlyZWN0aXZlc0luU2NvcGUoY29tcG9uZW50OiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogRGlyZWN0aXZlSW5TY29wZVtdfG51bGwge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLmdldFNjb3BlRGF0YShjb21wb25lbnQpO1xuICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGEuZGlyZWN0aXZlcztcbiAgfVxuXG4gIGdldFBpcGVzSW5TY29wZShjb21wb25lbnQ6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiBQaXBlSW5TY29wZVtdfG51bGwge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLmdldFNjb3BlRGF0YShjb21wb25lbnQpO1xuICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGEucGlwZXM7XG4gIH1cblxuICBnZXREaXJlY3RpdmVNZXRhZGF0YShkaXI6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiBUeXBlQ2hlY2thYmxlRGlyZWN0aXZlTWV0YXxudWxsIHtcbiAgICBpZiAoIWlzTmFtZWRDbGFzc0RlY2xhcmF0aW9uKGRpcikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy50eXBlQ2hlY2tTY29wZVJlZ2lzdHJ5LmdldFR5cGVDaGVja0RpcmVjdGl2ZU1ldGFkYXRhKG5ldyBSZWZlcmVuY2UoZGlyKSk7XG4gIH1cblxuICBnZXRQb3RlbnRpYWxFbGVtZW50VGFncyhjb21wb25lbnQ6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiBNYXA8c3RyaW5nLCBEaXJlY3RpdmVJblNjb3BlfG51bGw+IHtcbiAgICBpZiAodGhpcy5lbGVtZW50VGFnQ2FjaGUuaGFzKGNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRUYWdDYWNoZS5nZXQoY29tcG9uZW50KSE7XG4gICAgfVxuXG4gICAgY29uc3QgdGFnTWFwID0gbmV3IE1hcDxzdHJpbmcsIERpcmVjdGl2ZUluU2NvcGV8bnVsbD4oKTtcblxuICAgIGZvciAoY29uc3QgdGFnIG9mIFJFR0lTVFJZLmFsbEtub3duRWxlbWVudE5hbWVzKCkpIHtcbiAgICAgIHRhZ01hcC5zZXQodGFnLCBudWxsKTtcbiAgICB9XG5cbiAgICBjb25zdCBzY29wZSA9IHRoaXMuZ2V0U2NvcGVEYXRhKGNvbXBvbmVudCk7XG4gICAgaWYgKHNjb3BlICE9PSBudWxsKSB7XG4gICAgICBmb3IgKGNvbnN0IGRpcmVjdGl2ZSBvZiBzY29wZS5kaXJlY3RpdmVzKSB7XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0b3Igb2YgQ3NzU2VsZWN0b3IucGFyc2UoZGlyZWN0aXZlLnNlbGVjdG9yKSkge1xuICAgICAgICAgIGlmIChzZWxlY3Rvci5lbGVtZW50ID09PSBudWxsIHx8IHRhZ01hcC5oYXMoc2VsZWN0b3IuZWxlbWVudCkpIHtcbiAgICAgICAgICAgIC8vIFNraXAgdGhpcyBkaXJlY3RpdmUgaWYgaXQgZG9lc24ndCBtYXRjaCBhbiBlbGVtZW50IHRhZywgb3IgaWYgYW5vdGhlciBkaXJlY3RpdmUgaGFzXG4gICAgICAgICAgICAvLyBhbHJlYWR5IGJlZW4gaW5jbHVkZWQgd2l0aCB0aGUgc2FtZSBlbGVtZW50IG5hbWUuXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0YWdNYXAuc2V0KHNlbGVjdG9yLmVsZW1lbnQsIGRpcmVjdGl2ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnRUYWdDYWNoZS5zZXQoY29tcG9uZW50LCB0YWdNYXApO1xuICAgIHJldHVybiB0YWdNYXA7XG4gIH1cblxuICBnZXRQb3RlbnRpYWxEb21CaW5kaW5ncyh0YWdOYW1lOiBzdHJpbmcpOiB7YXR0cmlidXRlOiBzdHJpbmcsIHByb3BlcnR5OiBzdHJpbmd9W10ge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBSRUdJU1RSWS5hbGxLbm93bkF0dHJpYnV0ZXNPZkVsZW1lbnQodGFnTmFtZSk7XG4gICAgcmV0dXJuIGF0dHJpYnV0ZXMubWFwKGF0dHJpYnV0ZSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogUkVHSVNUUlkuZ2V0TWFwcGVkUHJvcE5hbWUoYXR0cmlidXRlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRTY29wZURhdGEoY29tcG9uZW50OiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogU2NvcGVEYXRhfG51bGwge1xuICAgIGlmICh0aGlzLnNjb3BlQ2FjaGUuaGFzKGNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNjb3BlQ2FjaGUuZ2V0KGNvbXBvbmVudCkhO1xuICAgIH1cblxuICAgIGlmICghaXNOYW1lZENsYXNzRGVjbGFyYXRpb24oY29tcG9uZW50KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBc3NlcnRpb25FcnJvcjogY29tcG9uZW50cyBtdXN0IGhhdmUgbmFtZXNgKTtcbiAgICB9XG5cbiAgICBjb25zdCBzY29wZSA9IHRoaXMuY29tcG9uZW50U2NvcGVSZWFkZXIuZ2V0U2NvcGVGb3JDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICBpZiAoc2NvcGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGRhdGE6IFNjb3BlRGF0YSA9IHtcbiAgICAgIGRpcmVjdGl2ZXM6IFtdLFxuICAgICAgcGlwZXM6IFtdLFxuICAgICAgaXNQb2lzb25lZDogc2NvcGUuY29tcGlsYXRpb24uaXNQb2lzb25lZCxcbiAgICB9O1xuXG4gICAgY29uc3QgdHlwZUNoZWNrZXIgPSB0aGlzLnByb2dyYW1Ecml2ZXIuZ2V0UHJvZ3JhbSgpLmdldFR5cGVDaGVja2VyKCk7XG4gICAgZm9yIChjb25zdCBkaXIgb2Ygc2NvcGUuY29tcGlsYXRpb24uZGlyZWN0aXZlcykge1xuICAgICAgaWYgKGRpci5zZWxlY3RvciA9PT0gbnVsbCkge1xuICAgICAgICAvLyBTa2lwIHRoaXMgZGlyZWN0aXZlLCBpdCBjYW4ndCBiZSBhZGRlZCB0byBhIHRlbXBsYXRlIGFueXdheS5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCB0c1N5bWJvbCA9IHR5cGVDaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oZGlyLnJlZi5ub2RlLm5hbWUpO1xuICAgICAgaWYgKHRzU3ltYm9sID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGxldCBuZ01vZHVsZTogQ2xhc3NEZWNsYXJhdGlvbnxudWxsID0gbnVsbDtcbiAgICAgIGNvbnN0IG1vZHVsZVNjb3BlT2ZEaXIgPSB0aGlzLmNvbXBvbmVudFNjb3BlUmVhZGVyLmdldFNjb3BlRm9yQ29tcG9uZW50KGRpci5yZWYubm9kZSk7XG4gICAgICBpZiAobW9kdWxlU2NvcGVPZkRpciAhPT0gbnVsbCkge1xuICAgICAgICBuZ01vZHVsZSA9IG1vZHVsZVNjb3BlT2ZEaXIubmdNb2R1bGU7XG4gICAgICB9XG5cbiAgICAgIGRhdGEuZGlyZWN0aXZlcy5wdXNoKHtcbiAgICAgICAgaXNDb21wb25lbnQ6IGRpci5pc0NvbXBvbmVudCxcbiAgICAgICAgaXNTdHJ1Y3R1cmFsOiBkaXIuaXNTdHJ1Y3R1cmFsLFxuICAgICAgICBzZWxlY3RvcjogZGlyLnNlbGVjdG9yLFxuICAgICAgICB0c1N5bWJvbCxcbiAgICAgICAgbmdNb2R1bGUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHBpcGUgb2Ygc2NvcGUuY29tcGlsYXRpb24ucGlwZXMpIHtcbiAgICAgIGNvbnN0IHRzU3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihwaXBlLnJlZi5ub2RlLm5hbWUpO1xuICAgICAgaWYgKHRzU3ltYm9sID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBkYXRhLnBpcGVzLnB1c2goe1xuICAgICAgICBuYW1lOiBwaXBlLm5hbWUsXG4gICAgICAgIHRzU3ltYm9sLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5zY29wZUNhY2hlLnNldChjb21wb25lbnQsIGRhdGEpO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnREaWFnbm9zdGljKFxuICAgIGRpYWc6IHRzLkRpYWdub3N0aWMsIHNvdXJjZVJlc29sdmVyOiBUZW1wbGF0ZVNvdXJjZVJlc29sdmVyKTogVGVtcGxhdGVEaWFnbm9zdGljfG51bGwge1xuICBpZiAoIXNob3VsZFJlcG9ydERpYWdub3N0aWMoZGlhZykpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gdHJhbnNsYXRlRGlhZ25vc3RpYyhkaWFnLCBzb3VyY2VSZXNvbHZlcik7XG59XG5cbi8qKlxuICogRGF0YSBmb3IgdGVtcGxhdGUgdHlwZS1jaGVja2luZyByZWxhdGVkIHRvIGEgc3BlY2lmaWMgaW5wdXQgZmlsZSBpbiB0aGUgdXNlcidzIHByb2dyYW0gKHdoaWNoXG4gKiBjb250YWlucyBjb21wb25lbnRzIHRvIGJlIGNoZWNrZWQpLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVUeXBlQ2hlY2tpbmdEYXRhIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHR5cGUtY2hlY2tpbmcgc2hpbSByZXF1aXJlZCBhbnkgaW5saW5lIGNoYW5nZXMgdG8gdGhlIG9yaWdpbmFsIGZpbGUsIHdoaWNoIGFmZmVjdHNcbiAgICogd2hldGhlciB0aGUgc2hpbSBjYW4gYmUgcmV1c2VkLlxuICAgKi9cbiAgaGFzSW5saW5lczogYm9vbGVhbjtcblxuICAvKipcbiAgICogU291cmNlIG1hcHBpbmcgaW5mb3JtYXRpb24gZm9yIG1hcHBpbmcgZGlhZ25vc3RpY3MgZnJvbSBpbmxpbmVkIHR5cGUgY2hlY2sgYmxvY2tzIGJhY2sgdG8gdGhlXG4gICAqIG9yaWdpbmFsIHRlbXBsYXRlLlxuICAgKi9cbiAgc291cmNlTWFuYWdlcjogVGVtcGxhdGVTb3VyY2VNYW5hZ2VyO1xuXG4gIC8qKlxuICAgKiBEYXRhIGZvciBlYWNoIHNoaW0gZ2VuZXJhdGVkIGZyb20gdGhpcyBpbnB1dCBmaWxlLlxuICAgKlxuICAgKiBBIHNpbmdsZSBpbnB1dCBmaWxlIHdpbGwgZ2VuZXJhdGUgb25lIG9yIG1vcmUgc2hpbSBmaWxlcyB0aGF0IGFjdHVhbGx5IGNvbnRhaW4gdGVtcGxhdGVcbiAgICogdHlwZS1jaGVja2luZyBjb2RlLlxuICAgKi9cbiAgc2hpbURhdGE6IE1hcDxBYnNvbHV0ZUZzUGF0aCwgU2hpbVR5cGVDaGVja2luZ0RhdGE+O1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSB0ZW1wbGF0ZSB0eXBlLWNoZWNrZXIgaXMgY2VydGFpbiB0aGF0IGFsbCBjb21wb25lbnRzIGZyb20gdGhpcyBpbnB1dCBmaWxlIGhhdmUgaGFkXG4gICAqIHR5cGUtY2hlY2tpbmcgY29kZSBnZW5lcmF0ZWQgaW50byBzaGltcy5cbiAgICovXG4gIGlzQ29tcGxldGU6IGJvb2xlYW47XG59XG5cbi8qKlxuICogRHJpdmVzIGEgYFR5cGVDaGVja0NvbnRleHRgIHRvIGdlbmVyYXRlIHR5cGUtY2hlY2tpbmcgY29kZSBmb3IgZXZlcnkgY29tcG9uZW50IGluIHRoZSBwcm9ncmFtLlxuICovXG5jbGFzcyBXaG9sZVByb2dyYW1UeXBlQ2hlY2tpbmdIb3N0IGltcGxlbWVudHMgVHlwZUNoZWNraW5nSG9zdCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW1wbDogVGVtcGxhdGVUeXBlQ2hlY2tlckltcGwpIHt9XG5cbiAgZ2V0U291cmNlTWFuYWdlcihzZlBhdGg6IEFic29sdXRlRnNQYXRoKTogVGVtcGxhdGVTb3VyY2VNYW5hZ2VyIHtcbiAgICByZXR1cm4gdGhpcy5pbXBsLmdldEZpbGVEYXRhKHNmUGF0aCkuc291cmNlTWFuYWdlcjtcbiAgfVxuXG4gIHNob3VsZENoZWNrQ29tcG9uZW50KG5vZGU6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiBib29sZWFuIHtcbiAgICBjb25zdCBzZlBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKG5vZGUuZ2V0U291cmNlRmlsZSgpKTtcbiAgICBjb25zdCBzaGltUGF0aCA9IFR5cGVDaGVja1NoaW1HZW5lcmF0b3Iuc2hpbUZvcihzZlBhdGgpO1xuICAgIGNvbnN0IGZpbGVEYXRhID0gdGhpcy5pbXBsLmdldEZpbGVEYXRhKHNmUGF0aCk7XG4gICAgLy8gVGhlIGNvbXBvbmVudCBuZWVkcyB0byBiZSBjaGVja2VkIHVubGVzcyB0aGUgc2hpbSB3aGljaCB3b3VsZCBjb250YWluIGl0IGFscmVhZHkgZXhpc3RzLlxuICAgIHJldHVybiAhZmlsZURhdGEuc2hpbURhdGEuaGFzKHNoaW1QYXRoKTtcbiAgfVxuXG4gIHJlY29yZFNoaW1EYXRhKHNmUGF0aDogQWJzb2x1dGVGc1BhdGgsIGRhdGE6IFNoaW1UeXBlQ2hlY2tpbmdEYXRhKTogdm9pZCB7XG4gICAgY29uc3QgZmlsZURhdGEgPSB0aGlzLmltcGwuZ2V0RmlsZURhdGEoc2ZQYXRoKTtcbiAgICBmaWxlRGF0YS5zaGltRGF0YS5zZXQoZGF0YS5wYXRoLCBkYXRhKTtcbiAgICBpZiAoZGF0YS5oYXNJbmxpbmVzKSB7XG4gICAgICBmaWxlRGF0YS5oYXNJbmxpbmVzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZWNvcmRDb21wbGV0ZShzZlBhdGg6IEFic29sdXRlRnNQYXRoKTogdm9pZCB7XG4gICAgdGhpcy5pbXBsLmdldEZpbGVEYXRhKHNmUGF0aCkuaXNDb21wbGV0ZSA9IHRydWU7XG4gIH1cbn1cblxuLyoqXG4gKiBEcml2ZXMgYSBgVHlwZUNoZWNrQ29udGV4dGAgdG8gZ2VuZXJhdGUgdHlwZS1jaGVja2luZyBjb2RlIGVmZmljaWVudGx5IGZvciBhIHNpbmdsZSBpbnB1dCBmaWxlLlxuICovXG5jbGFzcyBTaW5nbGVGaWxlVHlwZUNoZWNraW5nSG9zdCBpbXBsZW1lbnRzIFR5cGVDaGVja2luZ0hvc3Qge1xuICBwcml2YXRlIHNlZW5JbmxpbmVzID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgc2ZQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgcHJvdGVjdGVkIGZpbGVEYXRhOiBGaWxlVHlwZUNoZWNraW5nRGF0YSxcbiAgICAgIHByb3RlY3RlZCBpbXBsOiBUZW1wbGF0ZVR5cGVDaGVja2VySW1wbCkge31cblxuICBwcml2YXRlIGFzc2VydFBhdGgoc2ZQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnNmUGF0aCAhPT0gc2ZQYXRoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbkVycm9yOiBxdWVyeWluZyBUeXBlQ2hlY2tpbmdIb3N0IG91dHNpZGUgb2YgYXNzaWduZWQgZmlsZWApO1xuICAgIH1cbiAgfVxuXG4gIGdldFNvdXJjZU1hbmFnZXIoc2ZQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IFRlbXBsYXRlU291cmNlTWFuYWdlciB7XG4gICAgdGhpcy5hc3NlcnRQYXRoKHNmUGF0aCk7XG4gICAgcmV0dXJuIHRoaXMuZmlsZURhdGEuc291cmNlTWFuYWdlcjtcbiAgfVxuXG4gIHNob3VsZENoZWNrQ29tcG9uZW50KG5vZGU6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5zZlBhdGggIT09IGFic29sdXRlRnJvbVNvdXJjZUZpbGUobm9kZS5nZXRTb3VyY2VGaWxlKCkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHNoaW1QYXRoID0gVHlwZUNoZWNrU2hpbUdlbmVyYXRvci5zaGltRm9yKHRoaXMuc2ZQYXRoKTtcblxuICAgIC8vIE9ubHkgbmVlZCB0byBnZW5lcmF0ZSBhIFRDQiBmb3IgdGhlIGNsYXNzIGlmIG5vIHNoaW0gZXhpc3RzIGZvciBpdCBjdXJyZW50bHkuXG4gICAgcmV0dXJuICF0aGlzLmZpbGVEYXRhLnNoaW1EYXRhLmhhcyhzaGltUGF0aCk7XG4gIH1cblxuICByZWNvcmRTaGltRGF0YShzZlBhdGg6IEFic29sdXRlRnNQYXRoLCBkYXRhOiBTaGltVHlwZUNoZWNraW5nRGF0YSk6IHZvaWQge1xuICAgIHRoaXMuYXNzZXJ0UGF0aChzZlBhdGgpO1xuXG4gICAgLy8gUHJldmlvdXMgdHlwZS1jaGVja2luZyBzdGF0ZSBtYXkgaGF2ZSByZXF1aXJlZCB0aGUgdXNlIG9mIGlubGluZXMgKGFzc3VtaW5nIHRoZXkgd2VyZVxuICAgIC8vIHN1cHBvcnRlZCkuIElmIHRoZSBjdXJyZW50IG9wZXJhdGlvbiBhbHNvIHJlcXVpcmVzIGlubGluZXMsIHRoaXMgcHJlc2VudHMgYSBwcm9ibGVtOlxuICAgIC8vIGdlbmVyYXRpbmcgbmV3IGlubGluZXMgbWF5IGludmFsaWRhdGUgYW55IG9sZCBpbmxpbmVzIHRoYXQgb2xkIHN0YXRlIGRlcGVuZHMgb24uXG4gICAgLy9cbiAgICAvLyBSYXRoZXIgdGhhbiByZXNvbHZlIHRoaXMgaXNzdWUgYnkgdHJhY2tpbmcgc3BlY2lmaWMgZGVwZW5kZW5jaWVzIG9uIGlubGluZXMsIGlmIHRoZSBuZXcgc3RhdGVcbiAgICAvLyByZWxpZXMgb24gaW5saW5lcywgYW55IG9sZCBzdGF0ZSB0aGF0IHJlbGllZCBvbiB0aGVtIGlzIHNpbXBseSBjbGVhcmVkLiBUaGlzIGhhcHBlbnMgd2hlbiB0aGVcbiAgICAvLyBmaXJzdCBuZXcgc3RhdGUgdGhhdCB1c2VzIGlubGluZXMgaXMgZW5jb3VudGVyZWQuXG4gICAgaWYgKGRhdGEuaGFzSW5saW5lcyAmJiAhdGhpcy5zZWVuSW5saW5lcykge1xuICAgICAgdGhpcy5pbXBsLmNsZWFyQWxsU2hpbURhdGFVc2luZ0lubGluZXMoKTtcbiAgICAgIHRoaXMuc2VlbklubGluZXMgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuZmlsZURhdGEuc2hpbURhdGEuc2V0KGRhdGEucGF0aCwgZGF0YSk7XG4gICAgaWYgKGRhdGEuaGFzSW5saW5lcykge1xuICAgICAgdGhpcy5maWxlRGF0YS5oYXNJbmxpbmVzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZWNvcmRDb21wbGV0ZShzZlBhdGg6IEFic29sdXRlRnNQYXRoKTogdm9pZCB7XG4gICAgdGhpcy5hc3NlcnRQYXRoKHNmUGF0aCk7XG4gICAgdGhpcy5maWxlRGF0YS5pc0NvbXBsZXRlID0gdHJ1ZTtcbiAgfVxufVxuXG4vKipcbiAqIERyaXZlcyBhIGBUeXBlQ2hlY2tDb250ZXh0YCB0byBnZW5lcmF0ZSB0eXBlLWNoZWNraW5nIGNvZGUgZWZmaWNpZW50bHkgZm9yIG9ubHkgdGhvc2UgY29tcG9uZW50c1xuICogd2hpY2ggbWFwIHRvIGEgc2luZ2xlIHNoaW0gb2YgYSBzaW5nbGUgaW5wdXQgZmlsZS5cbiAqL1xuY2xhc3MgU2luZ2xlU2hpbVR5cGVDaGVja2luZ0hvc3QgZXh0ZW5kcyBTaW5nbGVGaWxlVHlwZUNoZWNraW5nSG9zdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc2ZQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgZmlsZURhdGE6IEZpbGVUeXBlQ2hlY2tpbmdEYXRhLCBpbXBsOiBUZW1wbGF0ZVR5cGVDaGVja2VySW1wbCxcbiAgICAgIHByaXZhdGUgc2hpbVBhdGg6IEFic29sdXRlRnNQYXRoKSB7XG4gICAgc3VwZXIoc2ZQYXRoLCBmaWxlRGF0YSwgaW1wbCk7XG4gIH1cblxuICBzaG91bGRDaGVja05vZGUobm9kZTogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLnNmUGF0aCAhPT0gYWJzb2x1dGVGcm9tU291cmNlRmlsZShub2RlLmdldFNvdXJjZUZpbGUoKSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBPbmx5IGdlbmVyYXRlIGEgVENCIGZvciB0aGUgY29tcG9uZW50IGlmIGl0IG1hcHMgdG8gdGhlIHJlcXVlc3RlZCBzaGltIGZpbGUuXG4gICAgY29uc3Qgc2hpbVBhdGggPSBUeXBlQ2hlY2tTaGltR2VuZXJhdG9yLnNoaW1Gb3IodGhpcy5zZlBhdGgpO1xuICAgIGlmIChzaGltUGF0aCAhPT0gdGhpcy5zaGltUGF0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIE9ubHkgbmVlZCB0byBnZW5lcmF0ZSBhIFRDQiBmb3IgdGhlIGNsYXNzIGlmIG5vIHNoaW0gZXhpc3RzIGZvciBpdCBjdXJyZW50bHkuXG4gICAgcmV0dXJuICF0aGlzLmZpbGVEYXRhLnNoaW1EYXRhLmhhcyhzaGltUGF0aCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDYWNoZWQgc2NvcGUgaW5mb3JtYXRpb24gZm9yIGEgY29tcG9uZW50LlxuICovXG5pbnRlcmZhY2UgU2NvcGVEYXRhIHtcbiAgZGlyZWN0aXZlczogRGlyZWN0aXZlSW5TY29wZVtdO1xuICBwaXBlczogUGlwZUluU2NvcGVbXTtcbiAgaXNQb2lzb25lZDogYm9vbGVhbjtcbn1cbiJdfQ==