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
        define("@angular/compiler-cli/src/ngtsc/transform/src/compilation", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/transform/src/api", "@angular/compiler-cli/src/ngtsc/transform/src/trait"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TraitCompiler = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/api");
    var trait_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/trait");
    /**
     * The heart of Angular compilation.
     *
     * The `TraitCompiler` is responsible for processing all classes in the program. Any time a
     * `DecoratorHandler` matches a class, a "trait" is created to represent that Angular aspect of the
     * class (such as the class having a component definition).
     *
     * The `TraitCompiler` transitions each trait through the various phases of compilation, culminating
     * in the production of `CompileResult`s instructing the compiler to apply various mutations to the
     * class (like adding fields or type declarations).
     */
    var TraitCompiler = /** @class */ (function () {
        function TraitCompiler(handlers, reflector, perf, incrementalBuild, compileNonExportedClasses, compilationMode, dtsTransforms, semanticDepGraphUpdater) {
            var e_1, _a;
            this.handlers = handlers;
            this.reflector = reflector;
            this.perf = perf;
            this.incrementalBuild = incrementalBuild;
            this.compileNonExportedClasses = compileNonExportedClasses;
            this.compilationMode = compilationMode;
            this.dtsTransforms = dtsTransforms;
            this.semanticDepGraphUpdater = semanticDepGraphUpdater;
            /**
             * Maps class declarations to their `ClassRecord`, which tracks the Ivy traits being applied to
             * those classes.
             */
            this.classes = new Map();
            /**
             * Maps source files to any class declaration(s) within them which have been discovered to contain
             * Ivy traits.
             */
            this.fileToClasses = new Map();
            this.reexportMap = new Map();
            this.handlersByName = new Map();
            try {
                for (var handlers_1 = tslib_1.__values(handlers), handlers_1_1 = handlers_1.next(); !handlers_1_1.done; handlers_1_1 = handlers_1.next()) {
                    var handler = handlers_1_1.value;
                    this.handlersByName.set(handler.name, handler);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (handlers_1_1 && !handlers_1_1.done && (_a = handlers_1.return)) _a.call(handlers_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        TraitCompiler.prototype.analyzeSync = function (sf) {
            this.analyze(sf, false);
        };
        TraitCompiler.prototype.analyzeAsync = function (sf) {
            return this.analyze(sf, true);
        };
        TraitCompiler.prototype.analyze = function (sf, preanalyze) {
            var e_2, _a;
            var _this = this;
            // We shouldn't analyze declaration files.
            if (sf.isDeclarationFile) {
                return undefined;
            }
            // analyze() really wants to return `Promise<void>|void`, but TypeScript cannot narrow a return
            // type of 'void', so `undefined` is used instead.
            var promises = [];
            var priorWork = this.incrementalBuild.priorAnalysisFor(sf);
            if (priorWork !== null) {
                try {
                    for (var priorWork_1 = tslib_1.__values(priorWork), priorWork_1_1 = priorWork_1.next(); !priorWork_1_1.done; priorWork_1_1 = priorWork_1.next()) {
                        var priorRecord = priorWork_1_1.value;
                        this.adopt(priorRecord);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (priorWork_1_1 && !priorWork_1_1.done && (_a = priorWork_1.return)) _a.call(priorWork_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                this.perf.eventCount(perf_1.PerfEvent.SourceFileReuseAnalysis);
                this.perf.eventCount(perf_1.PerfEvent.TraitReuseAnalysis, priorWork.length);
                // Skip the rest of analysis, as this file's prior traits are being reused.
                return;
            }
            var visit = function (node) {
                if (_this.reflector.isClass(node)) {
                    _this.analyzeClass(node, preanalyze ? promises : null);
                }
                ts.forEachChild(node, visit);
            };
            visit(sf);
            if (preanalyze && promises.length > 0) {
                return Promise.all(promises).then(function () { return undefined; });
            }
            else {
                return undefined;
            }
        };
        TraitCompiler.prototype.recordFor = function (clazz) {
            if (this.classes.has(clazz)) {
                return this.classes.get(clazz);
            }
            else {
                return null;
            }
        };
        TraitCompiler.prototype.recordsFor = function (sf) {
            var e_3, _a;
            if (!this.fileToClasses.has(sf)) {
                return null;
            }
            var records = [];
            try {
                for (var _b = tslib_1.__values(this.fileToClasses.get(sf)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var clazz = _c.value;
                    records.push(this.classes.get(clazz));
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return records;
        };
        /**
         * Import a `ClassRecord` from a previous compilation.
         *
         * Traits from the `ClassRecord` have accurate metadata, but the `handler` is from the old program
         * and needs to be updated (matching is done by name). A new pending trait is created and then
         * transitioned to analyzed using the previous analysis. If the trait is in the errored state,
         * instead the errors are copied over.
         */
        TraitCompiler.prototype.adopt = function (priorRecord) {
            var e_4, _a;
            var record = {
                hasPrimaryHandler: priorRecord.hasPrimaryHandler,
                hasWeakHandlers: priorRecord.hasWeakHandlers,
                metaDiagnostics: priorRecord.metaDiagnostics,
                node: priorRecord.node,
                traits: [],
            };
            try {
                for (var _b = tslib_1.__values(priorRecord.traits), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var priorTrait = _c.value;
                    var handler = this.handlersByName.get(priorTrait.handler.name);
                    var trait = trait_1.Trait.pending(handler, priorTrait.detected);
                    if (priorTrait.state === trait_1.TraitState.Analyzed || priorTrait.state === trait_1.TraitState.Resolved) {
                        var symbol = this.makeSymbolForTrait(handler, record.node, priorTrait.analysis);
                        trait = trait.toAnalyzed(priorTrait.analysis, priorTrait.analysisDiagnostics, symbol);
                        if (trait.analysis !== null && trait.handler.register !== undefined) {
                            trait.handler.register(record.node, trait.analysis);
                        }
                    }
                    else if (priorTrait.state === trait_1.TraitState.Skipped) {
                        trait = trait.toSkipped();
                    }
                    record.traits.push(trait);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            this.classes.set(record.node, record);
            var sf = record.node.getSourceFile();
            if (!this.fileToClasses.has(sf)) {
                this.fileToClasses.set(sf, new Set());
            }
            this.fileToClasses.get(sf).add(record.node);
        };
        TraitCompiler.prototype.scanClassForTraits = function (clazz) {
            if (!this.compileNonExportedClasses && !typescript_1.isExported(clazz)) {
                return null;
            }
            var decorators = this.reflector.getDecoratorsOfDeclaration(clazz);
            return this.detectTraits(clazz, decorators);
        };
        TraitCompiler.prototype.detectTraits = function (clazz, decorators) {
            var e_5, _a;
            var record = this.recordFor(clazz);
            var foundTraits = [];
            try {
                for (var _b = tslib_1.__values(this.handlers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var handler = _c.value;
                    var result = handler.detect(clazz, decorators);
                    if (result === undefined) {
                        continue;
                    }
                    var isPrimaryHandler = handler.precedence === api_1.HandlerPrecedence.PRIMARY;
                    var isWeakHandler = handler.precedence === api_1.HandlerPrecedence.WEAK;
                    var trait = trait_1.Trait.pending(handler, result);
                    foundTraits.push(trait);
                    if (record === null) {
                        // This is the first handler to match this class. This path is a fast path through which
                        // most classes will flow.
                        record = {
                            node: clazz,
                            traits: [trait],
                            metaDiagnostics: null,
                            hasPrimaryHandler: isPrimaryHandler,
                            hasWeakHandlers: isWeakHandler,
                        };
                        this.classes.set(clazz, record);
                        var sf = clazz.getSourceFile();
                        if (!this.fileToClasses.has(sf)) {
                            this.fileToClasses.set(sf, new Set());
                        }
                        this.fileToClasses.get(sf).add(clazz);
                    }
                    else {
                        // This is at least the second handler to match this class. This is a slower path that some
                        // classes will go through, which validates that the set of decorators applied to the class
                        // is valid.
                        // Validate according to rules as follows:
                        //
                        // * WEAK handlers are removed if a non-WEAK handler matches.
                        // * Only one PRIMARY handler can match at a time. Any other PRIMARY handler matching a
                        //   class with an existing PRIMARY handler is an error.
                        if (!isWeakHandler && record.hasWeakHandlers) {
                            // The current handler is not a WEAK handler, but the class has other WEAK handlers.
                            // Remove them.
                            record.traits =
                                record.traits.filter(function (field) { return field.handler.precedence !== api_1.HandlerPrecedence.WEAK; });
                            record.hasWeakHandlers = false;
                        }
                        else if (isWeakHandler && !record.hasWeakHandlers) {
                            // The current handler is a WEAK handler, but the class has non-WEAK handlers already.
                            // Drop the current one.
                            continue;
                        }
                        if (isPrimaryHandler && record.hasPrimaryHandler) {
                            // The class already has a PRIMARY handler, and another one just matched.
                            record.metaDiagnostics = [{
                                    category: ts.DiagnosticCategory.Error,
                                    code: Number('-99' + diagnostics_1.ErrorCode.DECORATOR_COLLISION),
                                    file: typescript_1.getSourceFile(clazz),
                                    start: clazz.getStart(undefined, false),
                                    length: clazz.getWidth(),
                                    messageText: 'Two incompatible decorators on class',
                                }];
                            record.traits = foundTraits = [];
                            break;
                        }
                        // Otherwise, it's safe to accept the multiple decorators here. Update some of the metadata
                        // regarding this class.
                        record.traits.push(trait);
                        record.hasPrimaryHandler = record.hasPrimaryHandler || isPrimaryHandler;
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return foundTraits.length > 0 ? foundTraits : null;
        };
        TraitCompiler.prototype.makeSymbolForTrait = function (handler, decl, analysis) {
            if (analysis === null) {
                return null;
            }
            var symbol = handler.symbol(decl, analysis);
            if (symbol !== null && this.semanticDepGraphUpdater !== null) {
                var isPrimary = handler.precedence === api_1.HandlerPrecedence.PRIMARY;
                if (!isPrimary) {
                    throw new Error("AssertionError: " + handler.name + " returned a symbol but is not a primary handler.");
                }
                this.semanticDepGraphUpdater.registerSymbol(symbol);
            }
            return symbol;
        };
        TraitCompiler.prototype.analyzeClass = function (clazz, preanalyzeQueue) {
            var e_6, _a;
            var _this = this;
            var traits = this.scanClassForTraits(clazz);
            if (traits === null) {
                // There are no Ivy traits on the class, so it can safely be skipped.
                return;
            }
            var _loop_1 = function (trait) {
                var analyze = function () { return _this.analyzeTrait(clazz, trait); };
                var preanalysis = null;
                if (preanalyzeQueue !== null && trait.handler.preanalyze !== undefined) {
                    // Attempt to run preanalysis. This could fail with a `FatalDiagnosticError`; catch it if it
                    // does.
                    try {
                        preanalysis = trait.handler.preanalyze(clazz, trait.detected.metadata) || null;
                    }
                    catch (err) {
                        if (err instanceof diagnostics_1.FatalDiagnosticError) {
                            trait.toAnalyzed(null, [err.toDiagnostic()], null);
                            return { value: void 0 };
                        }
                        else {
                            throw err;
                        }
                    }
                }
                if (preanalysis !== null) {
                    preanalyzeQueue.push(preanalysis.then(analyze));
                }
                else {
                    analyze();
                }
            };
            try {
                for (var traits_1 = tslib_1.__values(traits), traits_1_1 = traits_1.next(); !traits_1_1.done; traits_1_1 = traits_1.next()) {
                    var trait = traits_1_1.value;
                    var state_1 = _loop_1(trait);
                    if (typeof state_1 === "object")
                        return state_1.value;
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (traits_1_1 && !traits_1_1.done && (_a = traits_1.return)) _a.call(traits_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
        };
        TraitCompiler.prototype.analyzeTrait = function (clazz, trait, flags) {
            var _a, _b, _c;
            if (trait.state !== trait_1.TraitState.Pending) {
                throw new Error("Attempt to analyze trait of " + clazz.name.text + " in state " + trait_1.TraitState[trait.state] + " (expected DETECTED)");
            }
            this.perf.eventCount(perf_1.PerfEvent.TraitAnalyze);
            // Attempt analysis. This could fail with a `FatalDiagnosticError`; catch it if it does.
            var result;
            try {
                result = trait.handler.analyze(clazz, trait.detected.metadata, flags);
            }
            catch (err) {
                if (err instanceof diagnostics_1.FatalDiagnosticError) {
                    trait.toAnalyzed(null, [err.toDiagnostic()], null);
                    return;
                }
                else {
                    throw err;
                }
            }
            var symbol = this.makeSymbolForTrait(trait.handler, clazz, (_a = result.analysis) !== null && _a !== void 0 ? _a : null);
            if (result.analysis !== undefined && trait.handler.register !== undefined) {
                trait.handler.register(clazz, result.analysis);
            }
            trait = trait.toAnalyzed((_b = result.analysis) !== null && _b !== void 0 ? _b : null, (_c = result.diagnostics) !== null && _c !== void 0 ? _c : null, symbol);
        };
        TraitCompiler.prototype.resolve = function () {
            var e_7, _a, e_8, _b, e_9, _c;
            var _d, _e;
            var classes = Array.from(this.classes.keys());
            try {
                for (var classes_1 = tslib_1.__values(classes), classes_1_1 = classes_1.next(); !classes_1_1.done; classes_1_1 = classes_1.next()) {
                    var clazz = classes_1_1.value;
                    var record = this.classes.get(clazz);
                    try {
                        for (var _f = (e_8 = void 0, tslib_1.__values(record.traits)), _g = _f.next(); !_g.done; _g = _f.next()) {
                            var trait = _g.value;
                            var handler = trait.handler;
                            switch (trait.state) {
                                case trait_1.TraitState.Skipped:
                                    continue;
                                case trait_1.TraitState.Pending:
                                    throw new Error("Resolving a trait that hasn't been analyzed: " + clazz.name.text + " / " + Object.getPrototypeOf(trait.handler).constructor.name);
                                case trait_1.TraitState.Resolved:
                                    throw new Error("Resolving an already resolved trait");
                            }
                            if (trait.analysis === null) {
                                // No analysis results, cannot further process this trait.
                                continue;
                            }
                            if (handler.resolve === undefined) {
                                // No resolution of this trait needed - it's considered successful by default.
                                trait = trait.toResolved(null, null);
                                continue;
                            }
                            var result = void 0;
                            try {
                                result = handler.resolve(clazz, trait.analysis, trait.symbol);
                            }
                            catch (err) {
                                if (err instanceof diagnostics_1.FatalDiagnosticError) {
                                    trait = trait.toResolved(null, [err.toDiagnostic()]);
                                    continue;
                                }
                                else {
                                    throw err;
                                }
                            }
                            trait = trait.toResolved((_d = result.data) !== null && _d !== void 0 ? _d : null, (_e = result.diagnostics) !== null && _e !== void 0 ? _e : null);
                            if (result.reexports !== undefined) {
                                var fileName = clazz.getSourceFile().fileName;
                                if (!this.reexportMap.has(fileName)) {
                                    this.reexportMap.set(fileName, new Map());
                                }
                                var fileReexports = this.reexportMap.get(fileName);
                                try {
                                    for (var _h = (e_9 = void 0, tslib_1.__values(result.reexports)), _j = _h.next(); !_j.done; _j = _h.next()) {
                                        var reexport = _j.value;
                                        fileReexports.set(reexport.asAlias, [reexport.fromModule, reexport.symbolName]);
                                    }
                                }
                                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                                finally {
                                    try {
                                        if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                                    }
                                    finally { if (e_9) throw e_9.error; }
                                }
                            }
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (classes_1_1 && !classes_1_1.done && (_a = classes_1.return)) _a.call(classes_1);
                }
                finally { if (e_7) throw e_7.error; }
            }
        };
        /**
         * Generate type-checking code into the `TypeCheckContext` for any components within the given
         * `ts.SourceFile`.
         */
        TraitCompiler.prototype.typeCheck = function (sf, ctx) {
            var e_10, _a, e_11, _b;
            if (!this.fileToClasses.has(sf)) {
                return;
            }
            try {
                for (var _c = tslib_1.__values(this.fileToClasses.get(sf)), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var clazz = _d.value;
                    var record = this.classes.get(clazz);
                    try {
                        for (var _e = (e_11 = void 0, tslib_1.__values(record.traits)), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var trait = _f.value;
                            if (trait.state !== trait_1.TraitState.Resolved) {
                                continue;
                            }
                            else if (trait.handler.typeCheck === undefined) {
                                continue;
                            }
                            if (trait.resolution !== null) {
                                trait.handler.typeCheck(ctx, clazz, trait.analysis, trait.resolution);
                            }
                        }
                    }
                    catch (e_11_1) { e_11 = { error: e_11_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_11) throw e_11.error; }
                    }
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_10) throw e_10.error; }
            }
        };
        TraitCompiler.prototype.index = function (ctx) {
            var e_12, _a, e_13, _b;
            try {
                for (var _c = tslib_1.__values(this.classes.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var clazz = _d.value;
                    var record = this.classes.get(clazz);
                    try {
                        for (var _e = (e_13 = void 0, tslib_1.__values(record.traits)), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var trait = _f.value;
                            if (trait.state !== trait_1.TraitState.Resolved) {
                                // Skip traits that haven't been resolved successfully.
                                continue;
                            }
                            else if (trait.handler.index === undefined) {
                                // Skip traits that don't affect indexing.
                                continue;
                            }
                            if (trait.resolution !== null) {
                                trait.handler.index(ctx, clazz, trait.analysis, trait.resolution);
                            }
                        }
                    }
                    catch (e_13_1) { e_13 = { error: e_13_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_13) throw e_13.error; }
                    }
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_12) throw e_12.error; }
            }
        };
        TraitCompiler.prototype.updateResources = function (clazz) {
            var e_14, _a;
            if (!this.reflector.isClass(clazz) || !this.classes.has(clazz)) {
                return;
            }
            var record = this.classes.get(clazz);
            try {
                for (var _b = tslib_1.__values(record.traits), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var trait = _c.value;
                    if (trait.state !== trait_1.TraitState.Resolved || trait.handler.updateResources === undefined) {
                        continue;
                    }
                    trait.handler.updateResources(clazz, trait.analysis, trait.resolution);
                }
            }
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_14) throw e_14.error; }
            }
        };
        TraitCompiler.prototype.compile = function (clazz, constantPool) {
            var e_15, _a;
            var original = ts.getOriginalNode(clazz);
            if (!this.reflector.isClass(clazz) || !this.reflector.isClass(original) ||
                !this.classes.has(original)) {
                return null;
            }
            var record = this.classes.get(original);
            var res = [];
            var _loop_2 = function (trait) {
                var e_16, _d;
                if (trait.state !== trait_1.TraitState.Resolved || trait.analysisDiagnostics !== null ||
                    trait.resolveDiagnostics !== null) {
                    return "continue";
                }
                // `trait.resolution` is non-null asserted here because TypeScript does not recognize that
                // `Readonly<unknown>` is nullable (as `unknown` itself is nullable) due to the way that
                // `Readonly` works.
                var compileRes = void 0;
                if (this_1.compilationMode === api_1.CompilationMode.PARTIAL &&
                    trait.handler.compilePartial !== undefined) {
                    compileRes = trait.handler.compilePartial(clazz, trait.analysis, trait.resolution);
                }
                else {
                    compileRes =
                        trait.handler.compileFull(clazz, trait.analysis, trait.resolution, constantPool);
                }
                var compileMatchRes = compileRes;
                if (Array.isArray(compileMatchRes)) {
                    var _loop_3 = function (result) {
                        if (!res.some(function (r) { return r.name === result.name; })) {
                            res.push(result);
                        }
                    };
                    try {
                        for (var compileMatchRes_1 = (e_16 = void 0, tslib_1.__values(compileMatchRes)), compileMatchRes_1_1 = compileMatchRes_1.next(); !compileMatchRes_1_1.done; compileMatchRes_1_1 = compileMatchRes_1.next()) {
                            var result = compileMatchRes_1_1.value;
                            _loop_3(result);
                        }
                    }
                    catch (e_16_1) { e_16 = { error: e_16_1 }; }
                    finally {
                        try {
                            if (compileMatchRes_1_1 && !compileMatchRes_1_1.done && (_d = compileMatchRes_1.return)) _d.call(compileMatchRes_1);
                        }
                        finally { if (e_16) throw e_16.error; }
                    }
                }
                else if (!res.some(function (result) { return result.name === compileMatchRes.name; })) {
                    res.push(compileMatchRes);
                }
            };
            var this_1 = this;
            try {
                for (var _b = tslib_1.__values(record.traits), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var trait = _c.value;
                    _loop_2(trait);
                }
            }
            catch (e_15_1) { e_15 = { error: e_15_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_15) throw e_15.error; }
            }
            // Look up the .d.ts transformer for the input file and record that at least one field was
            // generated, which will allow the .d.ts to be transformed later.
            this.dtsTransforms.getIvyDeclarationTransform(original.getSourceFile())
                .addFields(original, res);
            // Return the instruction to the transformer so the fields will be added.
            return res.length > 0 ? res : null;
        };
        TraitCompiler.prototype.decoratorsFor = function (node) {
            var e_17, _a;
            var original = ts.getOriginalNode(node);
            if (!this.reflector.isClass(original) || !this.classes.has(original)) {
                return [];
            }
            var record = this.classes.get(original);
            var decorators = [];
            try {
                for (var _b = tslib_1.__values(record.traits), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var trait = _c.value;
                    if (trait.state !== trait_1.TraitState.Resolved) {
                        continue;
                    }
                    if (trait.detected.trigger !== null && ts.isDecorator(trait.detected.trigger)) {
                        decorators.push(trait.detected.trigger);
                    }
                }
            }
            catch (e_17_1) { e_17 = { error: e_17_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_17) throw e_17.error; }
            }
            return decorators;
        };
        Object.defineProperty(TraitCompiler.prototype, "diagnostics", {
            get: function () {
                var e_18, _a, e_19, _b;
                var diagnostics = [];
                try {
                    for (var _c = tslib_1.__values(this.classes.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var clazz = _d.value;
                        var record = this.classes.get(clazz);
                        if (record.metaDiagnostics !== null) {
                            diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(record.metaDiagnostics)));
                        }
                        try {
                            for (var _e = (e_19 = void 0, tslib_1.__values(record.traits)), _f = _e.next(); !_f.done; _f = _e.next()) {
                                var trait = _f.value;
                                if ((trait.state === trait_1.TraitState.Analyzed || trait.state === trait_1.TraitState.Resolved) &&
                                    trait.analysisDiagnostics !== null) {
                                    diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(trait.analysisDiagnostics)));
                                }
                                if (trait.state === trait_1.TraitState.Resolved && trait.resolveDiagnostics !== null) {
                                    diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(trait.resolveDiagnostics)));
                                }
                            }
                        }
                        catch (e_19_1) { e_19 = { error: e_19_1 }; }
                        finally {
                            try {
                                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                            }
                            finally { if (e_19) throw e_19.error; }
                        }
                    }
                }
                catch (e_18_1) { e_18 = { error: e_18_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_18) throw e_18.error; }
                }
                return diagnostics;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TraitCompiler.prototype, "exportStatements", {
            get: function () {
                return this.reexportMap;
            },
            enumerable: false,
            configurable: true
        });
        return TraitCompiler;
    }());
    exports.TraitCompiler = TraitCompiler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3RyYW5zZm9ybS9zcmMvY29tcGlsYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUdILCtCQUFpQztJQUVqQywyRUFBa0U7SUFJbEUsNkRBQW1EO0lBR25ELGtGQUFvRTtJQUVwRSx5RUFBdUk7SUFFdkksNkVBQXdEO0lBcUN4RDs7Ozs7Ozs7OztPQVVHO0lBQ0g7UUFrQkUsdUJBQ1ksUUFBNEUsRUFDNUUsU0FBeUIsRUFBVSxJQUFrQixFQUNyRCxnQkFBd0QsRUFDeEQseUJBQWtDLEVBQVUsZUFBZ0MsRUFDNUUsYUFBbUMsRUFDbkMsdUJBQXFEOztZQUxyRCxhQUFRLEdBQVIsUUFBUSxDQUFvRTtZQUM1RSxjQUFTLEdBQVQsU0FBUyxDQUFnQjtZQUFVLFNBQUksR0FBSixJQUFJLENBQWM7WUFDckQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUF3QztZQUN4RCw4QkFBeUIsR0FBekIseUJBQXlCLENBQVM7WUFBVSxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFDNUUsa0JBQWEsR0FBYixhQUFhLENBQXNCO1lBQ25DLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBOEI7WUF2QmpFOzs7ZUFHRztZQUNLLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztZQUUzRDs7O2VBR0c7WUFDTyxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUF3QyxDQUFDO1lBRWxFLGdCQUFXLEdBQUcsSUFBSSxHQUFHLEVBQXlDLENBQUM7WUFFL0QsbUJBQWMsR0FDbEIsSUFBSSxHQUFHLEVBQTRFLENBQUM7O2dCQVN0RixLQUFzQixJQUFBLGFBQUEsaUJBQUEsUUFBUSxDQUFBLGtDQUFBLHdEQUFFO29CQUEzQixJQUFNLE9BQU8scUJBQUE7b0JBQ2hC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Q0FBQyxLQUFLLEtBQUssa0JBQVUsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLGtCQUFrQixLQUFLLElBQUksRUFBRTtvQ0FDNUUsV0FBVyxDQUFDLElBQUksT0FBaEIsV0FBVywyQ0FBUyxLQUFLLENBQUMsa0JBQWtCLElBQUU7aUNBQy9DOzZCQUNGOzs7Ozs7Ozs7cUJBQ0Y7Ozs7Ozs7OztnQkFDRCxPQUFPLFdBQVcsQ0FBQztZQUNyQixDQUFDOzs7V0FBQTtRQUVELHNCQUFJLDJDQUFnQjtpQkFBcEI7Z0JBQ0UsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQzFCLENBQUM7OztXQUFBO1FBQ0gsb0JBQUM7SUFBRCxDQUFDLEFBN2dCRCxJQTZnQkM7SUE3Z0JZLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29uc3RhbnRQb29sfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtFcnJvckNvZGUsIEZhdGFsRGlhZ25vc3RpY0Vycm9yfSBmcm9tICcuLi8uLi9kaWFnbm9zdGljcyc7XG5pbXBvcnQge0luY3JlbWVudGFsQnVpbGR9IGZyb20gJy4uLy4uL2luY3JlbWVudGFsL2FwaSc7XG5pbXBvcnQge1NlbWFudGljRGVwR3JhcGhVcGRhdGVyLCBTZW1hbnRpY1N5bWJvbH0gZnJvbSAnLi4vLi4vaW5jcmVtZW50YWwvc2VtYW50aWNfZ3JhcGgnO1xuaW1wb3J0IHtJbmRleGluZ0NvbnRleHR9IGZyb20gJy4uLy4uL2luZGV4ZXInO1xuaW1wb3J0IHtQZXJmRXZlbnQsIFBlcmZSZWNvcmRlcn0gZnJvbSAnLi4vLi4vcGVyZic7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb24sIERlY2xhcmF0aW9uTm9kZSwgRGVjb3JhdG9yLCBSZWZsZWN0aW9uSG9zdH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5pbXBvcnQge1Byb2dyYW1UeXBlQ2hlY2tBZGFwdGVyLCBUeXBlQ2hlY2tDb250ZXh0fSBmcm9tICcuLi8uLi90eXBlY2hlY2svYXBpJztcbmltcG9ydCB7Z2V0U291cmNlRmlsZSwgaXNFeHBvcnRlZH0gZnJvbSAnLi4vLi4vdXRpbC9zcmMvdHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7QW5hbHlzaXNPdXRwdXQsIENvbXBpbGF0aW9uTW9kZSwgQ29tcGlsZVJlc3VsdCwgRGVjb3JhdG9ySGFuZGxlciwgSGFuZGxlckZsYWdzLCBIYW5kbGVyUHJlY2VkZW5jZSwgUmVzb2x2ZVJlc3VsdH0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtEdHNUcmFuc2Zvcm1SZWdpc3RyeX0gZnJvbSAnLi9kZWNsYXJhdGlvbic7XG5pbXBvcnQge1BlbmRpbmdUcmFpdCwgVHJhaXQsIFRyYWl0U3RhdGV9IGZyb20gJy4vdHJhaXQnO1xuXG5cbi8qKlxuICogUmVjb3JkcyBpbmZvcm1hdGlvbiBhYm91dCBhIHNwZWNpZmljIGNsYXNzIHRoYXQgaGFzIG1hdGNoZWQgdHJhaXRzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENsYXNzUmVjb3JkIHtcbiAgLyoqXG4gICAqIFRoZSBgQ2xhc3NEZWNsYXJhdGlvbmAgb2YgdGhlIGNsYXNzIHdoaWNoIGhhcyBBbmd1bGFyIHRyYWl0cyBhcHBsaWVkLlxuICAgKi9cbiAgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbjtcblxuICAvKipcbiAgICogQWxsIHRyYWl0cyB3aGljaCBtYXRjaGVkIG9uIHRoZSBjbGFzcy5cbiAgICovXG4gIHRyYWl0czogVHJhaXQ8dW5rbm93biwgdW5rbm93biwgU2VtYW50aWNTeW1ib2x8bnVsbCwgdW5rbm93bj5bXTtcblxuICAvKipcbiAgICogTWV0YS1kaWFnbm9zdGljcyBhYm91dCB0aGUgY2xhc3MsIHdoaWNoIGFyZSB1c3VhbGx5IHJlbGF0ZWQgdG8gd2hldGhlciBjZXJ0YWluIGNvbWJpbmF0aW9ucyBvZlxuICAgKiBBbmd1bGFyIGRlY29yYXRvcnMgYXJlIG5vdCBwZXJtaXR0ZWQuXG4gICAqL1xuICBtZXRhRGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXXxudWxsO1xuXG4gIC8vIFN1YnNlcXVlbnQgZmllbGRzIGFyZSBcImludGVybmFsXCIgYW5kIHVzZWQgZHVyaW5nIHRoZSBtYXRjaGluZyBvZiBgRGVjb3JhdG9ySGFuZGxlcmBzLiBUaGlzIGlzXG4gIC8vIG11dGFibGUgc3RhdGUgZHVyaW5nIHRoZSBgZGV0ZWN0YC9gYW5hbHl6ZWAgcGhhc2VzIG9mIGNvbXBpbGF0aW9uLlxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIGB0cmFpdHNgIGNvbnRhaW5zIHRyYWl0cyBtYXRjaGVkIGZyb20gYERlY29yYXRvckhhbmRsZXJgcyBtYXJrZWQgYXMgYFdFQUtgLlxuICAgKi9cbiAgaGFzV2Vha0hhbmRsZXJzOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIGB0cmFpdHNgIGNvbnRhaW5zIGEgdHJhaXQgZnJvbSBhIGBEZWNvcmF0b3JIYW5kbGVyYCBtYXRjaGVkIGFzIGBQUklNQVJZYC5cbiAgICovXG4gIGhhc1ByaW1hcnlIYW5kbGVyOiBib29sZWFuO1xufVxuXG4vKipcbiAqIFRoZSBoZWFydCBvZiBBbmd1bGFyIGNvbXBpbGF0aW9uLlxuICpcbiAqIFRoZSBgVHJhaXRDb21waWxlcmAgaXMgcmVzcG9uc2libGUgZm9yIHByb2Nlc3NpbmcgYWxsIGNsYXNzZXMgaW4gdGhlIHByb2dyYW0uIEFueSB0aW1lIGFcbiAqIGBEZWNvcmF0b3JIYW5kbGVyYCBtYXRjaGVzIGEgY2xhc3MsIGEgXCJ0cmFpdFwiIGlzIGNyZWF0ZWQgdG8gcmVwcmVzZW50IHRoYXQgQW5ndWxhciBhc3BlY3Qgb2YgdGhlXG4gKiBjbGFzcyAoc3VjaCBhcyB0aGUgY2xhc3MgaGF2aW5nIGEgY29tcG9uZW50IGRlZmluaXRpb24pLlxuICpcbiAqIFRoZSBgVHJhaXRDb21waWxlcmAgdHJhbnNpdGlvbnMgZWFjaCB0cmFpdCB0aHJvdWdoIHRoZSB2YXJpb3VzIHBoYXNlcyBvZiBjb21waWxhdGlvbiwgY3VsbWluYXRpbmdcbiAqIGluIHRoZSBwcm9kdWN0aW9uIG9mIGBDb21waWxlUmVzdWx0YHMgaW5zdHJ1Y3RpbmcgdGhlIGNvbXBpbGVyIHRvIGFwcGx5IHZhcmlvdXMgbXV0YXRpb25zIHRvIHRoZVxuICogY2xhc3MgKGxpa2UgYWRkaW5nIGZpZWxkcyBvciB0eXBlIGRlY2xhcmF0aW9ucykuXG4gKi9cbmV4cG9ydCBjbGFzcyBUcmFpdENvbXBpbGVyIGltcGxlbWVudHMgUHJvZ3JhbVR5cGVDaGVja0FkYXB0ZXIge1xuICAvKipcbiAgICogTWFwcyBjbGFzcyBkZWNsYXJhdGlvbnMgdG8gdGhlaXIgYENsYXNzUmVjb3JkYCwgd2hpY2ggdHJhY2tzIHRoZSBJdnkgdHJhaXRzIGJlaW5nIGFwcGxpZWQgdG9cbiAgICogdGhvc2UgY2xhc3Nlcy5cbiAgICovXG4gIHByaXZhdGUgY2xhc3NlcyA9IG5ldyBNYXA8Q2xhc3NEZWNsYXJhdGlvbiwgQ2xhc3NSZWNvcmQ+KCk7XG5cbiAgLyoqXG4gICAqIE1hcHMgc291cmNlIGZpbGVzIHRvIGFueSBjbGFzcyBkZWNsYXJhdGlvbihzKSB3aXRoaW4gdGhlbSB3aGljaCBoYXZlIGJlZW4gZGlzY292ZXJlZCB0byBjb250YWluXG4gICAqIEl2eSB0cmFpdHMuXG4gICAqL1xuICBwcm90ZWN0ZWQgZmlsZVRvQ2xhc3NlcyA9IG5ldyBNYXA8dHMuU291cmNlRmlsZSwgU2V0PENsYXNzRGVjbGFyYXRpb24+PigpO1xuXG4gIHByaXZhdGUgcmVleHBvcnRNYXAgPSBuZXcgTWFwPHN0cmluZywgTWFwPHN0cmluZywgW3N0cmluZywgc3RyaW5nXT4+KCk7XG5cbiAgcHJpdmF0ZSBoYW5kbGVyc0J5TmFtZSA9XG4gICAgICBuZXcgTWFwPHN0cmluZywgRGVjb3JhdG9ySGFuZGxlcjx1bmtub3duLCB1bmtub3duLCBTZW1hbnRpY1N5bWJvbHxudWxsLCB1bmtub3duPj4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaGFuZGxlcnM6IERlY29yYXRvckhhbmRsZXI8dW5rbm93biwgdW5rbm93biwgU2VtYW50aWNTeW1ib2x8bnVsbCwgdW5rbm93bj5bXSxcbiAgICAgIHByaXZhdGUgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgcHJpdmF0ZSBwZXJmOiBQZXJmUmVjb3JkZXIsXG4gICAgICBwcml2YXRlIGluY3JlbWVudGFsQnVpbGQ6IEluY3JlbWVudGFsQnVpbGQ8Q2xhc3NSZWNvcmQsIHVua25vd24+LFxuICAgICAgcHJpdmF0ZSBjb21waWxlTm9uRXhwb3J0ZWRDbGFzc2VzOiBib29sZWFuLCBwcml2YXRlIGNvbXBpbGF0aW9uTW9kZTogQ29tcGlsYXRpb25Nb2RlLFxuICAgICAgcHJpdmF0ZSBkdHNUcmFuc2Zvcm1zOiBEdHNUcmFuc2Zvcm1SZWdpc3RyeSxcbiAgICAgIHByaXZhdGUgc2VtYW50aWNEZXBHcmFwaFVwZGF0ZXI6IFNlbWFudGljRGVwR3JhcGhVcGRhdGVyfG51bGwpIHtcbiAgICBmb3IgKGNvbnN0IGhhbmRsZXIgb2YgaGFuZGxlcnMpIHtcbiAgICAgIHRoaXMuaGFuZGxlcnNCeU5hbWUuc2V0KGhhbmRsZXIubmFtZSwgaGFuZGxlcik7XG4gICAgfVxuICB9XG5cbiAgYW5hbHl6ZVN5bmMoc2Y6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICB0aGlzLmFuYWx5emUoc2YsIGZhbHNlKTtcbiAgfVxuXG4gIGFuYWx5emVBc3luYyhzZjogdHMuU291cmNlRmlsZSk6IFByb21pc2U8dm9pZD58dW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5hbmFseXplKHNmLCB0cnVlKTtcbiAgfVxuXG4gIHByaXZhdGUgYW5hbHl6ZShzZjogdHMuU291cmNlRmlsZSwgcHJlYW5hbHl6ZTogZmFsc2UpOiB2b2lkO1xuICBwcml2YXRlIGFuYWx5emUoc2Y6IHRzLlNvdXJjZUZpbGUsIHByZWFuYWx5emU6IHRydWUpOiBQcm9taXNlPHZvaWQ+fHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBhbmFseXplKHNmOiB0cy5Tb3VyY2VGaWxlLCBwcmVhbmFseXplOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPnx1bmRlZmluZWQge1xuICAgIC8vIFdlIHNob3VsZG4ndCBhbmFseXplIGRlY2xhcmF0aW9uIGZpbGVzLlxuICAgIGlmIChzZi5pc0RlY2xhcmF0aW9uRmlsZSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBhbmFseXplKCkgcmVhbGx5IHdhbnRzIHRvIHJldHVybiBgUHJvbWlzZTx2b2lkPnx2b2lkYCwgYnV0IFR5cGVTY3JpcHQgY2Fubm90IG5hcnJvdyBhIHJldHVyblxuICAgIC8vIHR5cGUgb2YgJ3ZvaWQnLCBzbyBgdW5kZWZpbmVkYCBpcyB1c2VkIGluc3RlYWQuXG4gICAgY29uc3QgcHJvbWlzZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXG4gICAgY29uc3QgcHJpb3JXb3JrID0gdGhpcy5pbmNyZW1lbnRhbEJ1aWxkLnByaW9yQW5hbHlzaXNGb3Ioc2YpO1xuICAgIGlmIChwcmlvcldvcmsgIT09IG51bGwpIHtcbiAgICAgIGZvciAoY29uc3QgcHJpb3JSZWNvcmQgb2YgcHJpb3JXb3JrKSB7XG4gICAgICAgIHRoaXMuYWRvcHQocHJpb3JSZWNvcmQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnBlcmYuZXZlbnRDb3VudChQZXJmRXZlbnQuU291cmNlRmlsZVJldXNlQW5hbHlzaXMpO1xuICAgICAgdGhpcy5wZXJmLmV2ZW50Q291bnQoUGVyZkV2ZW50LlRyYWl0UmV1c2VBbmFseXNpcywgcHJpb3JXb3JrLmxlbmd0aCk7XG5cbiAgICAgIC8vIFNraXAgdGhlIHJlc3Qgb2YgYW5hbHlzaXMsIGFzIHRoaXMgZmlsZSdzIHByaW9yIHRyYWl0cyBhcmUgYmVpbmcgcmV1c2VkLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHZpc2l0ID0gKG5vZGU6IHRzLk5vZGUpOiB2b2lkID0+IHtcbiAgICAgIGlmICh0aGlzLnJlZmxlY3Rvci5pc0NsYXNzKG5vZGUpKSB7XG4gICAgICAgIHRoaXMuYW5hbHl6ZUNsYXNzKG5vZGUsIHByZWFuYWx5emUgPyBwcm9taXNlcyA6IG51bGwpO1xuICAgICAgfVxuICAgICAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIHZpc2l0KTtcbiAgICB9O1xuXG4gICAgdmlzaXQoc2YpO1xuXG4gICAgaWYgKHByZWFuYWx5emUgJiYgcHJvbWlzZXMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKCgpID0+IHVuZGVmaW5lZCBhcyB2b2lkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICByZWNvcmRGb3IoY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiBDbGFzc1JlY29yZHxudWxsIHtcbiAgICBpZiAodGhpcy5jbGFzc2VzLmhhcyhjbGF6eikpIHtcbiAgICAgIHJldHVybiB0aGlzLmNsYXNzZXMuZ2V0KGNsYXp6KSE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHJlY29yZHNGb3Ioc2Y6IHRzLlNvdXJjZUZpbGUpOiBDbGFzc1JlY29yZFtdfG51bGwge1xuICAgIGlmICghdGhpcy5maWxlVG9DbGFzc2VzLmhhcyhzZikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCByZWNvcmRzOiBDbGFzc1JlY29yZFtdID0gW107XG4gICAgZm9yIChjb25zdCBjbGF6eiBvZiB0aGlzLmZpbGVUb0NsYXNzZXMuZ2V0KHNmKSEpIHtcbiAgICAgIHJlY29yZHMucHVzaCh0aGlzLmNsYXNzZXMuZ2V0KGNsYXp6KSEpO1xuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkcztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBvcnQgYSBgQ2xhc3NSZWNvcmRgIGZyb20gYSBwcmV2aW91cyBjb21waWxhdGlvbi5cbiAgICpcbiAgICogVHJhaXRzIGZyb20gdGhlIGBDbGFzc1JlY29yZGAgaGF2ZSBhY2N1cmF0ZSBtZXRhZGF0YSwgYnV0IHRoZSBgaGFuZGxlcmAgaXMgZnJvbSB0aGUgb2xkIHByb2dyYW1cbiAgICogYW5kIG5lZWRzIHRvIGJlIHVwZGF0ZWQgKG1hdGNoaW5nIGlzIGRvbmUgYnkgbmFtZSkuIEEgbmV3IHBlbmRpbmcgdHJhaXQgaXMgY3JlYXRlZCBhbmQgdGhlblxuICAgKiB0cmFuc2l0aW9uZWQgdG8gYW5hbHl6ZWQgdXNpbmcgdGhlIHByZXZpb3VzIGFuYWx5c2lzLiBJZiB0aGUgdHJhaXQgaXMgaW4gdGhlIGVycm9yZWQgc3RhdGUsXG4gICAqIGluc3RlYWQgdGhlIGVycm9ycyBhcmUgY29waWVkIG92ZXIuXG4gICAqL1xuICBwcml2YXRlIGFkb3B0KHByaW9yUmVjb3JkOiBDbGFzc1JlY29yZCk6IHZvaWQge1xuICAgIGNvbnN0IHJlY29yZDogQ2xhc3NSZWNvcmQgPSB7XG4gICAgICBoYXNQcmltYXJ5SGFuZGxlcjogcHJpb3JSZWNvcmQuaGFzUHJpbWFyeUhhbmRsZXIsXG4gICAgICBoYXNXZWFrSGFuZGxlcnM6IHByaW9yUmVjb3JkLmhhc1dlYWtIYW5kbGVycyxcbiAgICAgIG1ldGFEaWFnbm9zdGljczogcHJpb3JSZWNvcmQubWV0YURpYWdub3N0aWNzLFxuICAgICAgbm9kZTogcHJpb3JSZWNvcmQubm9kZSxcbiAgICAgIHRyYWl0czogW10sXG4gICAgfTtcblxuICAgIGZvciAoY29uc3QgcHJpb3JUcmFpdCBvZiBwcmlvclJlY29yZC50cmFpdHMpIHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLmhhbmRsZXJzQnlOYW1lLmdldChwcmlvclRyYWl0LmhhbmRsZXIubmFtZSkhO1xuICAgICAgbGV0IHRyYWl0OiBUcmFpdDx1bmtub3duLCB1bmtub3duLCBTZW1hbnRpY1N5bWJvbHxudWxsLCB1bmtub3duPiA9XG4gICAgICAgICAgVHJhaXQucGVuZGluZyhoYW5kbGVyLCBwcmlvclRyYWl0LmRldGVjdGVkKTtcblxuICAgICAgaWYgKHByaW9yVHJhaXQuc3RhdGUgPT09IFRyYWl0U3RhdGUuQW5hbHl6ZWQgfHwgcHJpb3JUcmFpdC5zdGF0ZSA9PT0gVHJhaXRTdGF0ZS5SZXNvbHZlZCkge1xuICAgICAgICBjb25zdCBzeW1ib2wgPSB0aGlzLm1ha2VTeW1ib2xGb3JUcmFpdChoYW5kbGVyLCByZWNvcmQubm9kZSwgcHJpb3JUcmFpdC5hbmFseXNpcyk7XG4gICAgICAgIHRyYWl0ID0gdHJhaXQudG9BbmFseXplZChwcmlvclRyYWl0LmFuYWx5c2lzLCBwcmlvclRyYWl0LmFuYWx5c2lzRGlhZ25vc3RpY3MsIHN5bWJvbCk7XG4gICAgICAgIGlmICh0cmFpdC5hbmFseXNpcyAhPT0gbnVsbCAmJiB0cmFpdC5oYW5kbGVyLnJlZ2lzdGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0cmFpdC5oYW5kbGVyLnJlZ2lzdGVyKHJlY29yZC5ub2RlLCB0cmFpdC5hbmFseXNpcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocHJpb3JUcmFpdC5zdGF0ZSA9PT0gVHJhaXRTdGF0ZS5Ta2lwcGVkKSB7XG4gICAgICAgIHRyYWl0ID0gdHJhaXQudG9Ta2lwcGVkKCk7XG4gICAgICB9XG5cbiAgICAgIHJlY29yZC50cmFpdHMucHVzaCh0cmFpdCk7XG4gICAgfVxuXG4gICAgdGhpcy5jbGFzc2VzLnNldChyZWNvcmQubm9kZSwgcmVjb3JkKTtcbiAgICBjb25zdCBzZiA9IHJlY29yZC5ub2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgICBpZiAoIXRoaXMuZmlsZVRvQ2xhc3Nlcy5oYXMoc2YpKSB7XG4gICAgICB0aGlzLmZpbGVUb0NsYXNzZXMuc2V0KHNmLCBuZXcgU2V0PENsYXNzRGVjbGFyYXRpb24+KCkpO1xuICAgIH1cbiAgICB0aGlzLmZpbGVUb0NsYXNzZXMuZ2V0KHNmKSEuYWRkKHJlY29yZC5ub2RlKTtcbiAgfVxuXG4gIHByaXZhdGUgc2NhbkNsYXNzRm9yVHJhaXRzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTpcbiAgICAgIFBlbmRpbmdUcmFpdDx1bmtub3duLCB1bmtub3duLCBTZW1hbnRpY1N5bWJvbHxudWxsLCB1bmtub3duPltdfG51bGwge1xuICAgIGlmICghdGhpcy5jb21waWxlTm9uRXhwb3J0ZWRDbGFzc2VzICYmICFpc0V4cG9ydGVkKGNsYXp6KSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZGVjb3JhdG9ycyA9IHRoaXMucmVmbGVjdG9yLmdldERlY29yYXRvcnNPZkRlY2xhcmF0aW9uKGNsYXp6KTtcblxuICAgIHJldHVybiB0aGlzLmRldGVjdFRyYWl0cyhjbGF6eiwgZGVjb3JhdG9ycyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZGV0ZWN0VHJhaXRzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uLCBkZWNvcmF0b3JzOiBEZWNvcmF0b3JbXXxudWxsKTpcbiAgICAgIFBlbmRpbmdUcmFpdDx1bmtub3duLCB1bmtub3duLCBTZW1hbnRpY1N5bWJvbHxudWxsLCB1bmtub3duPltdfG51bGwge1xuICAgIGxldCByZWNvcmQ6IENsYXNzUmVjb3JkfG51bGwgPSB0aGlzLnJlY29yZEZvcihjbGF6eik7XG4gICAgbGV0IGZvdW5kVHJhaXRzOiBQZW5kaW5nVHJhaXQ8dW5rbm93biwgdW5rbm93biwgU2VtYW50aWNTeW1ib2x8bnVsbCwgdW5rbm93bj5bXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBoYW5kbGVyIG9mIHRoaXMuaGFuZGxlcnMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGhhbmRsZXIuZGV0ZWN0KGNsYXp6LCBkZWNvcmF0b3JzKTtcbiAgICAgIGlmIChyZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNQcmltYXJ5SGFuZGxlciA9IGhhbmRsZXIucHJlY2VkZW5jZSA9PT0gSGFuZGxlclByZWNlZGVuY2UuUFJJTUFSWTtcbiAgICAgIGNvbnN0IGlzV2Vha0hhbmRsZXIgPSBoYW5kbGVyLnByZWNlZGVuY2UgPT09IEhhbmRsZXJQcmVjZWRlbmNlLldFQUs7XG4gICAgICBjb25zdCB0cmFpdCA9IFRyYWl0LnBlbmRpbmcoaGFuZGxlciwgcmVzdWx0KTtcblxuICAgICAgZm91bmRUcmFpdHMucHVzaCh0cmFpdCk7XG5cbiAgICAgIGlmIChyZWNvcmQgPT09IG51bGwpIHtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZmlyc3QgaGFuZGxlciB0byBtYXRjaCB0aGlzIGNsYXNzLiBUaGlzIHBhdGggaXMgYSBmYXN0IHBhdGggdGhyb3VnaCB3aGljaFxuICAgICAgICAvLyBtb3N0IGNsYXNzZXMgd2lsbCBmbG93LlxuICAgICAgICByZWNvcmQgPSB7XG4gICAgICAgICAgbm9kZTogY2xhenosXG4gICAgICAgICAgdHJhaXRzOiBbdHJhaXRdLFxuICAgICAgICAgIG1ldGFEaWFnbm9zdGljczogbnVsbCxcbiAgICAgICAgICBoYXNQcmltYXJ5SGFuZGxlcjogaXNQcmltYXJ5SGFuZGxlcixcbiAgICAgICAgICBoYXNXZWFrSGFuZGxlcnM6IGlzV2Vha0hhbmRsZXIsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jbGFzc2VzLnNldChjbGF6eiwgcmVjb3JkKTtcbiAgICAgICAgY29uc3Qgc2YgPSBjbGF6ei5nZXRTb3VyY2VGaWxlKCk7XG4gICAgICAgIGlmICghdGhpcy5maWxlVG9DbGFzc2VzLmhhcyhzZikpIHtcbiAgICAgICAgICB0aGlzLmZpbGVUb0NsYXNzZXMuc2V0KHNmLCBuZXcgU2V0PENsYXNzRGVjbGFyYXRpb24+KCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmlsZVRvQ2xhc3Nlcy5nZXQoc2YpIS5hZGQoY2xhenopO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhpcyBpcyBhdCBsZWFzdCB0aGUgc2Vjb25kIGhhbmRsZXIgdG8gbWF0Y2ggdGhpcyBjbGFzcy4gVGhpcyBpcyBhIHNsb3dlciBwYXRoIHRoYXQgc29tZVxuICAgICAgICAvLyBjbGFzc2VzIHdpbGwgZ28gdGhyb3VnaCwgd2hpY2ggdmFsaWRhdGVzIHRoYXQgdGhlIHNldCBvZiBkZWNvcmF0b3JzIGFwcGxpZWQgdG8gdGhlIGNsYXNzXG4gICAgICAgIC8vIGlzIHZhbGlkLlxuXG4gICAgICAgIC8vIFZhbGlkYXRlIGFjY29yZGluZyB0byBydWxlcyBhcyBmb2xsb3dzOlxuICAgICAgICAvL1xuICAgICAgICAvLyAqIFdFQUsgaGFuZGxlcnMgYXJlIHJlbW92ZWQgaWYgYSBub24tV0VBSyBoYW5kbGVyIG1hdGNoZXMuXG4gICAgICAgIC8vICogT25seSBvbmUgUFJJTUFSWSBoYW5kbGVyIGNhbiBtYXRjaCBhdCBhIHRpbWUuIEFueSBvdGhlciBQUklNQVJZIGhhbmRsZXIgbWF0Y2hpbmcgYVxuICAgICAgICAvLyAgIGNsYXNzIHdpdGggYW4gZXhpc3RpbmcgUFJJTUFSWSBoYW5kbGVyIGlzIGFuIGVycm9yLlxuXG4gICAgICAgIGlmICghaXNXZWFrSGFuZGxlciAmJiByZWNvcmQuaGFzV2Vha0hhbmRsZXJzKSB7XG4gICAgICAgICAgLy8gVGhlIGN1cnJlbnQgaGFuZGxlciBpcyBub3QgYSBXRUFLIGhhbmRsZXIsIGJ1dCB0aGUgY2xhc3MgaGFzIG90aGVyIFdFQUsgaGFuZGxlcnMuXG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZW0uXG4gICAgICAgICAgcmVjb3JkLnRyYWl0cyA9XG4gICAgICAgICAgICAgIHJlY29yZC50cmFpdHMuZmlsdGVyKGZpZWxkID0+IGZpZWxkLmhhbmRsZXIucHJlY2VkZW5jZSAhPT0gSGFuZGxlclByZWNlZGVuY2UuV0VBSyk7XG4gICAgICAgICAgcmVjb3JkLmhhc1dlYWtIYW5kbGVycyA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGlzV2Vha0hhbmRsZXIgJiYgIXJlY29yZC5oYXNXZWFrSGFuZGxlcnMpIHtcbiAgICAgICAgICAvLyBUaGUgY3VycmVudCBoYW5kbGVyIGlzIGEgV0VBSyBoYW5kbGVyLCBidXQgdGhlIGNsYXNzIGhhcyBub24tV0VBSyBoYW5kbGVycyBhbHJlYWR5LlxuICAgICAgICAgIC8vIERyb3AgdGhlIGN1cnJlbnQgb25lLlxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzUHJpbWFyeUhhbmRsZXIgJiYgcmVjb3JkLmhhc1ByaW1hcnlIYW5kbGVyKSB7XG4gICAgICAgICAgLy8gVGhlIGNsYXNzIGFscmVhZHkgaGFzIGEgUFJJTUFSWSBoYW5kbGVyLCBhbmQgYW5vdGhlciBvbmUganVzdCBtYXRjaGVkLlxuICAgICAgICAgIHJlY29yZC5tZXRhRGlhZ25vc3RpY3MgPSBbe1xuICAgICAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgICAgIGNvZGU6IE51bWJlcignLTk5JyArIEVycm9yQ29kZS5ERUNPUkFUT1JfQ09MTElTSU9OKSxcbiAgICAgICAgICAgIGZpbGU6IGdldFNvdXJjZUZpbGUoY2xhenopLFxuICAgICAgICAgICAgc3RhcnQ6IGNsYXp6LmdldFN0YXJ0KHVuZGVmaW5lZCwgZmFsc2UpLFxuICAgICAgICAgICAgbGVuZ3RoOiBjbGF6ei5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgbWVzc2FnZVRleHQ6ICdUd28gaW5jb21wYXRpYmxlIGRlY29yYXRvcnMgb24gY2xhc3MnLFxuICAgICAgICAgIH1dO1xuICAgICAgICAgIHJlY29yZC50cmFpdHMgPSBmb3VuZFRyYWl0cyA9IFtdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBpdCdzIHNhZmUgdG8gYWNjZXB0IHRoZSBtdWx0aXBsZSBkZWNvcmF0b3JzIGhlcmUuIFVwZGF0ZSBzb21lIG9mIHRoZSBtZXRhZGF0YVxuICAgICAgICAvLyByZWdhcmRpbmcgdGhpcyBjbGFzcy5cbiAgICAgICAgcmVjb3JkLnRyYWl0cy5wdXNoKHRyYWl0KTtcbiAgICAgICAgcmVjb3JkLmhhc1ByaW1hcnlIYW5kbGVyID0gcmVjb3JkLmhhc1ByaW1hcnlIYW5kbGVyIHx8IGlzUHJpbWFyeUhhbmRsZXI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZvdW5kVHJhaXRzLmxlbmd0aCA+IDAgPyBmb3VuZFRyYWl0cyA6IG51bGw7XG4gIH1cblxuICBwcml2YXRlIG1ha2VTeW1ib2xGb3JUcmFpdChcbiAgICAgIGhhbmRsZXI6IERlY29yYXRvckhhbmRsZXI8dW5rbm93biwgdW5rbm93biwgU2VtYW50aWNTeW1ib2x8bnVsbCwgdW5rbm93bj4sXG4gICAgICBkZWNsOiBDbGFzc0RlY2xhcmF0aW9uLCBhbmFseXNpczogUmVhZG9ubHk8dW5rbm93bj58bnVsbCk6IFNlbWFudGljU3ltYm9sfG51bGwge1xuICAgIGlmIChhbmFseXNpcyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHN5bWJvbCA9IGhhbmRsZXIuc3ltYm9sKGRlY2wsIGFuYWx5c2lzKTtcbiAgICBpZiAoc3ltYm9sICE9PSBudWxsICYmIHRoaXMuc2VtYW50aWNEZXBHcmFwaFVwZGF0ZXIgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGlzUHJpbWFyeSA9IGhhbmRsZXIucHJlY2VkZW5jZSA9PT0gSGFuZGxlclByZWNlZGVuY2UuUFJJTUFSWTtcbiAgICAgIGlmICghaXNQcmltYXJ5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBBc3NlcnRpb25FcnJvcjogJHtoYW5kbGVyLm5hbWV9IHJldHVybmVkIGEgc3ltYm9sIGJ1dCBpcyBub3QgYSBwcmltYXJ5IGhhbmRsZXIuYCk7XG4gICAgICB9XG4gICAgICB0aGlzLnNlbWFudGljRGVwR3JhcGhVcGRhdGVyLnJlZ2lzdGVyU3ltYm9sKHN5bWJvbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN5bWJvbDtcbiAgfVxuXG4gIHByb3RlY3RlZCBhbmFseXplQ2xhc3MoY2xheno6IENsYXNzRGVjbGFyYXRpb24sIHByZWFuYWx5emVRdWV1ZTogUHJvbWlzZTx2b2lkPltdfG51bGwpOiB2b2lkIHtcbiAgICBjb25zdCB0cmFpdHMgPSB0aGlzLnNjYW5DbGFzc0ZvclRyYWl0cyhjbGF6eik7XG5cbiAgICBpZiAodHJhaXRzID09PSBudWxsKSB7XG4gICAgICAvLyBUaGVyZSBhcmUgbm8gSXZ5IHRyYWl0cyBvbiB0aGUgY2xhc3MsIHNvIGl0IGNhbiBzYWZlbHkgYmUgc2tpcHBlZC5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHRyYWl0IG9mIHRyYWl0cykge1xuICAgICAgY29uc3QgYW5hbHl6ZSA9ICgpID0+IHRoaXMuYW5hbHl6ZVRyYWl0KGNsYXp6LCB0cmFpdCk7XG5cbiAgICAgIGxldCBwcmVhbmFseXNpczogUHJvbWlzZTx2b2lkPnxudWxsID0gbnVsbDtcbiAgICAgIGlmIChwcmVhbmFseXplUXVldWUgIT09IG51bGwgJiYgdHJhaXQuaGFuZGxlci5wcmVhbmFseXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gQXR0ZW1wdCB0byBydW4gcHJlYW5hbHlzaXMuIFRoaXMgY291bGQgZmFpbCB3aXRoIGEgYEZhdGFsRGlhZ25vc3RpY0Vycm9yYDsgY2F0Y2ggaXQgaWYgaXRcbiAgICAgICAgLy8gZG9lcy5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwcmVhbmFseXNpcyA9IHRyYWl0LmhhbmRsZXIucHJlYW5hbHl6ZShjbGF6eiwgdHJhaXQuZGV0ZWN0ZWQubWV0YWRhdGEpIHx8IG51bGw7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBGYXRhbERpYWdub3N0aWNFcnJvcikge1xuICAgICAgICAgICAgdHJhaXQudG9BbmFseXplZChudWxsLCBbZXJyLnRvRGlhZ25vc3RpYygpXSwgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChwcmVhbmFseXNpcyAhPT0gbnVsbCkge1xuICAgICAgICBwcmVhbmFseXplUXVldWUhLnB1c2gocHJlYW5hbHlzaXMudGhlbihhbmFseXplKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhbmFseXplKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGFuYWx5emVUcmFpdChcbiAgICAgIGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uLCB0cmFpdDogVHJhaXQ8dW5rbm93biwgdW5rbm93biwgU2VtYW50aWNTeW1ib2x8bnVsbCwgdW5rbm93bj4sXG4gICAgICBmbGFncz86IEhhbmRsZXJGbGFncyk6IHZvaWQge1xuICAgIGlmICh0cmFpdC5zdGF0ZSAhPT0gVHJhaXRTdGF0ZS5QZW5kaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEF0dGVtcHQgdG8gYW5hbHl6ZSB0cmFpdCBvZiAke2NsYXp6Lm5hbWUudGV4dH0gaW4gc3RhdGUgJHtcbiAgICAgICAgICBUcmFpdFN0YXRlW3RyYWl0LnN0YXRlXX0gKGV4cGVjdGVkIERFVEVDVEVEKWApO1xuICAgIH1cblxuICAgIHRoaXMucGVyZi5ldmVudENvdW50KFBlcmZFdmVudC5UcmFpdEFuYWx5emUpO1xuXG4gICAgLy8gQXR0ZW1wdCBhbmFseXNpcy4gVGhpcyBjb3VsZCBmYWlsIHdpdGggYSBgRmF0YWxEaWFnbm9zdGljRXJyb3JgOyBjYXRjaCBpdCBpZiBpdCBkb2VzLlxuICAgIGxldCByZXN1bHQ6IEFuYWx5c2lzT3V0cHV0PHVua25vd24+O1xuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSB0cmFpdC5oYW5kbGVyLmFuYWx5emUoY2xhenosIHRyYWl0LmRldGVjdGVkLm1ldGFkYXRhLCBmbGFncyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRmF0YWxEaWFnbm9zdGljRXJyb3IpIHtcbiAgICAgICAgdHJhaXQudG9BbmFseXplZChudWxsLCBbZXJyLnRvRGlhZ25vc3RpYygpXSwgbnVsbCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzeW1ib2wgPSB0aGlzLm1ha2VTeW1ib2xGb3JUcmFpdCh0cmFpdC5oYW5kbGVyLCBjbGF6eiwgcmVzdWx0LmFuYWx5c2lzID8/IG51bGwpO1xuICAgIGlmIChyZXN1bHQuYW5hbHlzaXMgIT09IHVuZGVmaW5lZCAmJiB0cmFpdC5oYW5kbGVyLnJlZ2lzdGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRyYWl0LmhhbmRsZXIucmVnaXN0ZXIoY2xhenosIHJlc3VsdC5hbmFseXNpcyk7XG4gICAgfVxuICAgIHRyYWl0ID0gdHJhaXQudG9BbmFseXplZChyZXN1bHQuYW5hbHlzaXMgPz8gbnVsbCwgcmVzdWx0LmRpYWdub3N0aWNzID8/IG51bGwsIHN5bWJvbCk7XG4gIH1cblxuICByZXNvbHZlKCk6IHZvaWQge1xuICAgIGNvbnN0IGNsYXNzZXMgPSBBcnJheS5mcm9tKHRoaXMuY2xhc3Nlcy5rZXlzKCkpO1xuICAgIGZvciAoY29uc3QgY2xhenogb2YgY2xhc3Nlcykge1xuICAgICAgY29uc3QgcmVjb3JkID0gdGhpcy5jbGFzc2VzLmdldChjbGF6eikhO1xuICAgICAgZm9yIChsZXQgdHJhaXQgb2YgcmVjb3JkLnRyYWl0cykge1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gdHJhaXQuaGFuZGxlcjtcbiAgICAgICAgc3dpdGNoICh0cmFpdC5zdGF0ZSkge1xuICAgICAgICAgIGNhc2UgVHJhaXRTdGF0ZS5Ta2lwcGVkOlxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgY2FzZSBUcmFpdFN0YXRlLlBlbmRpbmc6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlc29sdmluZyBhIHRyYWl0IHRoYXQgaGFzbid0IGJlZW4gYW5hbHl6ZWQ6ICR7Y2xhenoubmFtZS50ZXh0fSAvICR7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmdldFByb3RvdHlwZU9mKHRyYWl0LmhhbmRsZXIpLmNvbnN0cnVjdG9yLm5hbWV9YCk7XG4gICAgICAgICAgY2FzZSBUcmFpdFN0YXRlLlJlc29sdmVkOlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXNvbHZpbmcgYW4gYWxyZWFkeSByZXNvbHZlZCB0cmFpdGApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRyYWl0LmFuYWx5c2lzID09PSBudWxsKSB7XG4gICAgICAgICAgLy8gTm8gYW5hbHlzaXMgcmVzdWx0cywgY2Fubm90IGZ1cnRoZXIgcHJvY2VzcyB0aGlzIHRyYWl0LlxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhbmRsZXIucmVzb2x2ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gTm8gcmVzb2x1dGlvbiBvZiB0aGlzIHRyYWl0IG5lZWRlZCAtIGl0J3MgY29uc2lkZXJlZCBzdWNjZXNzZnVsIGJ5IGRlZmF1bHQuXG4gICAgICAgICAgdHJhaXQgPSB0cmFpdC50b1Jlc29sdmVkKG51bGwsIG51bGwpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlc3VsdDogUmVzb2x2ZVJlc3VsdDx1bmtub3duPjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSBoYW5kbGVyLnJlc29sdmUoY2xhenosIHRyYWl0LmFuYWx5c2lzIGFzIFJlYWRvbmx5PHVua25vd24+LCB0cmFpdC5zeW1ib2wpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRmF0YWxEaWFnbm9zdGljRXJyb3IpIHtcbiAgICAgICAgICAgIHRyYWl0ID0gdHJhaXQudG9SZXNvbHZlZChudWxsLCBbZXJyLnRvRGlhZ25vc3RpYygpXSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRyYWl0ID0gdHJhaXQudG9SZXNvbHZlZChyZXN1bHQuZGF0YSA/PyBudWxsLCByZXN1bHQuZGlhZ25vc3RpY3MgPz8gbnVsbCk7XG5cbiAgICAgICAgaWYgKHJlc3VsdC5yZWV4cG9ydHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gY2xhenouZ2V0U291cmNlRmlsZSgpLmZpbGVOYW1lO1xuICAgICAgICAgIGlmICghdGhpcy5yZWV4cG9ydE1hcC5oYXMoZmlsZU5hbWUpKSB7XG4gICAgICAgICAgICB0aGlzLnJlZXhwb3J0TWFwLnNldChmaWxlTmFtZSwgbmV3IE1hcDxzdHJpbmcsIFtzdHJpbmcsIHN0cmluZ10+KCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBmaWxlUmVleHBvcnRzID0gdGhpcy5yZWV4cG9ydE1hcC5nZXQoZmlsZU5hbWUpITtcbiAgICAgICAgICBmb3IgKGNvbnN0IHJlZXhwb3J0IG9mIHJlc3VsdC5yZWV4cG9ydHMpIHtcbiAgICAgICAgICAgIGZpbGVSZWV4cG9ydHMuc2V0KHJlZXhwb3J0LmFzQWxpYXMsIFtyZWV4cG9ydC5mcm9tTW9kdWxlLCByZWV4cG9ydC5zeW1ib2xOYW1lXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIHR5cGUtY2hlY2tpbmcgY29kZSBpbnRvIHRoZSBgVHlwZUNoZWNrQ29udGV4dGAgZm9yIGFueSBjb21wb25lbnRzIHdpdGhpbiB0aGUgZ2l2ZW5cbiAgICogYHRzLlNvdXJjZUZpbGVgLlxuICAgKi9cbiAgdHlwZUNoZWNrKHNmOiB0cy5Tb3VyY2VGaWxlLCBjdHg6IFR5cGVDaGVja0NvbnRleHQpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZmlsZVRvQ2xhc3Nlcy5oYXMoc2YpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBjbGF6eiBvZiB0aGlzLmZpbGVUb0NsYXNzZXMuZ2V0KHNmKSEpIHtcbiAgICAgIGNvbnN0IHJlY29yZCA9IHRoaXMuY2xhc3Nlcy5nZXQoY2xhenopITtcbiAgICAgIGZvciAoY29uc3QgdHJhaXQgb2YgcmVjb3JkLnRyYWl0cykge1xuICAgICAgICBpZiAodHJhaXQuc3RhdGUgIT09IFRyYWl0U3RhdGUuUmVzb2x2ZWQpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0cmFpdC5oYW5kbGVyLnR5cGVDaGVjayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYWl0LnJlc29sdXRpb24gIT09IG51bGwpIHtcbiAgICAgICAgICB0cmFpdC5oYW5kbGVyLnR5cGVDaGVjayhjdHgsIGNsYXp6LCB0cmFpdC5hbmFseXNpcywgdHJhaXQucmVzb2x1dGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpbmRleChjdHg6IEluZGV4aW5nQ29udGV4dCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgY2xhenogb2YgdGhpcy5jbGFzc2VzLmtleXMoKSkge1xuICAgICAgY29uc3QgcmVjb3JkID0gdGhpcy5jbGFzc2VzLmdldChjbGF6eikhO1xuICAgICAgZm9yIChjb25zdCB0cmFpdCBvZiByZWNvcmQudHJhaXRzKSB7XG4gICAgICAgIGlmICh0cmFpdC5zdGF0ZSAhPT0gVHJhaXRTdGF0ZS5SZXNvbHZlZCkge1xuICAgICAgICAgIC8vIFNraXAgdHJhaXRzIHRoYXQgaGF2ZW4ndCBiZWVuIHJlc29sdmVkIHN1Y2Nlc3NmdWxseS5cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0cmFpdC5oYW5kbGVyLmluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBTa2lwIHRyYWl0cyB0aGF0IGRvbid0IGFmZmVjdCBpbmRleGluZy5cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0cmFpdC5yZXNvbHV0aW9uICE9PSBudWxsKSB7XG4gICAgICAgICAgdHJhaXQuaGFuZGxlci5pbmRleChjdHgsIGNsYXp6LCB0cmFpdC5hbmFseXNpcywgdHJhaXQucmVzb2x1dGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGVSZXNvdXJjZXMoY2xheno6IERlY2xhcmF0aW9uTm9kZSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5yZWZsZWN0b3IuaXNDbGFzcyhjbGF6eikgfHwgIXRoaXMuY2xhc3Nlcy5oYXMoY2xhenopKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJlY29yZCA9IHRoaXMuY2xhc3Nlcy5nZXQoY2xhenopITtcbiAgICBmb3IgKGNvbnN0IHRyYWl0IG9mIHJlY29yZC50cmFpdHMpIHtcbiAgICAgIGlmICh0cmFpdC5zdGF0ZSAhPT0gVHJhaXRTdGF0ZS5SZXNvbHZlZCB8fCB0cmFpdC5oYW5kbGVyLnVwZGF0ZVJlc291cmNlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB0cmFpdC5oYW5kbGVyLnVwZGF0ZVJlc291cmNlcyhjbGF6eiwgdHJhaXQuYW5hbHlzaXMsIHRyYWl0LnJlc29sdXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBpbGUoY2xheno6IERlY2xhcmF0aW9uTm9kZSwgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wpOiBDb21waWxlUmVzdWx0W118bnVsbCB7XG4gICAgY29uc3Qgb3JpZ2luYWwgPSB0cy5nZXRPcmlnaW5hbE5vZGUoY2xhenopIGFzIHR5cGVvZiBjbGF6ejtcbiAgICBpZiAoIXRoaXMucmVmbGVjdG9yLmlzQ2xhc3MoY2xhenopIHx8ICF0aGlzLnJlZmxlY3Rvci5pc0NsYXNzKG9yaWdpbmFsKSB8fFxuICAgICAgICAhdGhpcy5jbGFzc2VzLmhhcyhvcmlnaW5hbCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHJlY29yZCA9IHRoaXMuY2xhc3Nlcy5nZXQob3JpZ2luYWwpITtcblxuICAgIGxldCByZXM6IENvbXBpbGVSZXN1bHRbXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCB0cmFpdCBvZiByZWNvcmQudHJhaXRzKSB7XG4gICAgICBpZiAodHJhaXQuc3RhdGUgIT09IFRyYWl0U3RhdGUuUmVzb2x2ZWQgfHwgdHJhaXQuYW5hbHlzaXNEaWFnbm9zdGljcyAhPT0gbnVsbCB8fFxuICAgICAgICAgIHRyYWl0LnJlc29sdmVEaWFnbm9zdGljcyAhPT0gbnVsbCkge1xuICAgICAgICAvLyBDYW5ub3QgY29tcGlsZSBhIHRyYWl0IHRoYXQgaXMgbm90IHJlc29sdmVkLCBvciBoYWQgYW55IGVycm9ycyBpbiBpdHMgZGVjbGFyYXRpb24uXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBgdHJhaXQucmVzb2x1dGlvbmAgaXMgbm9uLW51bGwgYXNzZXJ0ZWQgaGVyZSBiZWNhdXNlIFR5cGVTY3JpcHQgZG9lcyBub3QgcmVjb2duaXplIHRoYXRcbiAgICAgIC8vIGBSZWFkb25seTx1bmtub3duPmAgaXMgbnVsbGFibGUgKGFzIGB1bmtub3duYCBpdHNlbGYgaXMgbnVsbGFibGUpIGR1ZSB0byB0aGUgd2F5IHRoYXRcbiAgICAgIC8vIGBSZWFkb25seWAgd29ya3MuXG5cbiAgICAgIGxldCBjb21waWxlUmVzOiBDb21waWxlUmVzdWx0fENvbXBpbGVSZXN1bHRbXTtcbiAgICAgIGlmICh0aGlzLmNvbXBpbGF0aW9uTW9kZSA9PT0gQ29tcGlsYXRpb25Nb2RlLlBBUlRJQUwgJiZcbiAgICAgICAgICB0cmFpdC5oYW5kbGVyLmNvbXBpbGVQYXJ0aWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29tcGlsZVJlcyA9IHRyYWl0LmhhbmRsZXIuY29tcGlsZVBhcnRpYWwoY2xhenosIHRyYWl0LmFuYWx5c2lzLCB0cmFpdC5yZXNvbHV0aW9uISk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21waWxlUmVzID1cbiAgICAgICAgICAgIHRyYWl0LmhhbmRsZXIuY29tcGlsZUZ1bGwoY2xhenosIHRyYWl0LmFuYWx5c2lzLCB0cmFpdC5yZXNvbHV0aW9uISwgY29uc3RhbnRQb29sKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29tcGlsZU1hdGNoUmVzID0gY29tcGlsZVJlcztcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbXBpbGVNYXRjaFJlcykpIHtcbiAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgY29tcGlsZU1hdGNoUmVzKSB7XG4gICAgICAgICAgaWYgKCFyZXMuc29tZShyID0+IHIubmFtZSA9PT0gcmVzdWx0Lm5hbWUpKSB7XG4gICAgICAgICAgICByZXMucHVzaChyZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghcmVzLnNvbWUocmVzdWx0ID0+IHJlc3VsdC5uYW1lID09PSBjb21waWxlTWF0Y2hSZXMubmFtZSkpIHtcbiAgICAgICAgcmVzLnB1c2goY29tcGlsZU1hdGNoUmVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMb29rIHVwIHRoZSAuZC50cyB0cmFuc2Zvcm1lciBmb3IgdGhlIGlucHV0IGZpbGUgYW5kIHJlY29yZCB0aGF0IGF0IGxlYXN0IG9uZSBmaWVsZCB3YXNcbiAgICAvLyBnZW5lcmF0ZWQsIHdoaWNoIHdpbGwgYWxsb3cgdGhlIC5kLnRzIHRvIGJlIHRyYW5zZm9ybWVkIGxhdGVyLlxuICAgIHRoaXMuZHRzVHJhbnNmb3Jtcy5nZXRJdnlEZWNsYXJhdGlvblRyYW5zZm9ybShvcmlnaW5hbC5nZXRTb3VyY2VGaWxlKCkpXG4gICAgICAgIC5hZGRGaWVsZHMob3JpZ2luYWwsIHJlcyk7XG5cbiAgICAvLyBSZXR1cm4gdGhlIGluc3RydWN0aW9uIHRvIHRoZSB0cmFuc2Zvcm1lciBzbyB0aGUgZmllbGRzIHdpbGwgYmUgYWRkZWQuXG4gICAgcmV0dXJuIHJlcy5sZW5ndGggPiAwID8gcmVzIDogbnVsbDtcbiAgfVxuXG4gIGRlY29yYXRvcnNGb3Iobm9kZTogdHMuRGVjbGFyYXRpb24pOiB0cy5EZWNvcmF0b3JbXSB7XG4gICAgY29uc3Qgb3JpZ2luYWwgPSB0cy5nZXRPcmlnaW5hbE5vZGUobm9kZSkgYXMgdHlwZW9mIG5vZGU7XG4gICAgaWYgKCF0aGlzLnJlZmxlY3Rvci5pc0NsYXNzKG9yaWdpbmFsKSB8fCAhdGhpcy5jbGFzc2VzLmhhcyhvcmlnaW5hbCkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvcmQgPSB0aGlzLmNsYXNzZXMuZ2V0KG9yaWdpbmFsKSE7XG4gICAgY29uc3QgZGVjb3JhdG9yczogdHMuRGVjb3JhdG9yW10gPSBbXTtcblxuICAgIGZvciAoY29uc3QgdHJhaXQgb2YgcmVjb3JkLnRyYWl0cykge1xuICAgICAgaWYgKHRyYWl0LnN0YXRlICE9PSBUcmFpdFN0YXRlLlJlc29sdmVkKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHJhaXQuZGV0ZWN0ZWQudHJpZ2dlciAhPT0gbnVsbCAmJiB0cy5pc0RlY29yYXRvcih0cmFpdC5kZXRlY3RlZC50cmlnZ2VyKSkge1xuICAgICAgICBkZWNvcmF0b3JzLnB1c2godHJhaXQuZGV0ZWN0ZWQudHJpZ2dlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlY29yYXRvcnM7XG4gIH1cblxuICBnZXQgZGlhZ25vc3RpY3MoKTogUmVhZG9ubHlBcnJheTx0cy5EaWFnbm9zdGljPiB7XG4gICAgY29uc3QgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgY2xhenogb2YgdGhpcy5jbGFzc2VzLmtleXMoKSkge1xuICAgICAgY29uc3QgcmVjb3JkID0gdGhpcy5jbGFzc2VzLmdldChjbGF6eikhO1xuICAgICAgaWYgKHJlY29yZC5tZXRhRGlhZ25vc3RpY3MgIT09IG51bGwpIHtcbiAgICAgICAgZGlhZ25vc3RpY3MucHVzaCguLi5yZWNvcmQubWV0YURpYWdub3N0aWNzKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgdHJhaXQgb2YgcmVjb3JkLnRyYWl0cykge1xuICAgICAgICBpZiAoKHRyYWl0LnN0YXRlID09PSBUcmFpdFN0YXRlLkFuYWx5emVkIHx8IHRyYWl0LnN0YXRlID09PSBUcmFpdFN0YXRlLlJlc29sdmVkKSAmJlxuICAgICAgICAgICAgdHJhaXQuYW5hbHlzaXNEaWFnbm9zdGljcyAhPT0gbnVsbCkge1xuICAgICAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4udHJhaXQuYW5hbHlzaXNEaWFnbm9zdGljcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYWl0LnN0YXRlID09PSBUcmFpdFN0YXRlLlJlc29sdmVkICYmIHRyYWl0LnJlc29sdmVEaWFnbm9zdGljcyAhPT0gbnVsbCkge1xuICAgICAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4udHJhaXQucmVzb2x2ZURpYWdub3N0aWNzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGlhZ25vc3RpY3M7XG4gIH1cblxuICBnZXQgZXhwb3J0U3RhdGVtZW50cygpOiBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBbc3RyaW5nLCBzdHJpbmddPj4ge1xuICAgIHJldHVybiB0aGlzLnJlZXhwb3J0TWFwO1xuICB9XG59XG4iXX0=