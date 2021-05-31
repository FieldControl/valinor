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
        define("@angular/compiler-cli/src/transformers/program", ["require", "exports", "tslib", "@angular/compiler", "fs", "path", "typescript", "@angular/compiler-cli/src/diagnostics/translate_diagnostics", "@angular/compiler-cli/src/metadata/index", "@angular/compiler-cli/src/ngtsc/core/src/compiler", "@angular/compiler-cli/src/ngtsc/program", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/typescript_support", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/transformers/compiler_host", "@angular/compiler-cli/src/transformers/downlevel_decorators_transform", "@angular/compiler-cli/src/transformers/inline_resources", "@angular/compiler-cli/src/transformers/lower_expressions", "@angular/compiler-cli/src/transformers/metadata_cache", "@angular/compiler-cli/src/transformers/node_emitter_transform", "@angular/compiler-cli/src/transformers/r3_metadata_transform", "@angular/compiler-cli/src/transformers/r3_transform", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.i18nGetExtension = exports.i18nSerialize = exports.i18nExtract = exports.createSrcToOutPathMapper = exports.createProgram = exports.resetTempProgramHandlerForTest = exports.setTempProgramHandlerForTest = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var fs = require("fs");
    var path = require("path");
    var ts = require("typescript");
    var translate_diagnostics_1 = require("@angular/compiler-cli/src/diagnostics/translate_diagnostics");
    var metadata_1 = require("@angular/compiler-cli/src/metadata/index");
    var compiler_2 = require("@angular/compiler-cli/src/ngtsc/core/src/compiler");
    var program_1 = require("@angular/compiler-cli/src/ngtsc/program");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var typescript_support_1 = require("@angular/compiler-cli/src/typescript_support");
    var api_1 = require("@angular/compiler-cli/src/transformers/api");
    var compiler_host_1 = require("@angular/compiler-cli/src/transformers/compiler_host");
    var downlevel_decorators_transform_1 = require("@angular/compiler-cli/src/transformers/downlevel_decorators_transform");
    var inline_resources_1 = require("@angular/compiler-cli/src/transformers/inline_resources");
    var lower_expressions_1 = require("@angular/compiler-cli/src/transformers/lower_expressions");
    var metadata_cache_1 = require("@angular/compiler-cli/src/transformers/metadata_cache");
    var node_emitter_transform_1 = require("@angular/compiler-cli/src/transformers/node_emitter_transform");
    var r3_metadata_transform_1 = require("@angular/compiler-cli/src/transformers/r3_metadata_transform");
    var r3_transform_1 = require("@angular/compiler-cli/src/transformers/r3_transform");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    /**
     * Maximum number of files that are emitable via calling ts.Program.emit
     * passing individual targetSourceFiles.
     */
    var MAX_FILE_COUNT_FOR_SINGLE_FILE_EMIT = 20;
    /**
     * Fields to lower within metadata in render2 mode.
     */
    var LOWER_FIELDS = ['useValue', 'useFactory', 'data', 'id', 'loadChildren'];
    /**
     * Fields to lower within metadata in render3 mode.
     */
    var R3_LOWER_FIELDS = tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(LOWER_FIELDS)), ['providers', 'imports', 'exports']);
    /**
     * Installs a handler for testing purposes to allow inspection of the temporary program.
     */
    var tempProgramHandlerForTest = null;
    function setTempProgramHandlerForTest(handler) {
        tempProgramHandlerForTest = handler;
    }
    exports.setTempProgramHandlerForTest = setTempProgramHandlerForTest;
    function resetTempProgramHandlerForTest() {
        tempProgramHandlerForTest = null;
    }
    exports.resetTempProgramHandlerForTest = resetTempProgramHandlerForTest;
    var emptyModules = {
        ngModules: [],
        ngModuleByPipeOrDirective: new Map(),
        files: []
    };
    var defaultEmitCallback = function (_a) {
        var program = _a.program, targetSourceFile = _a.targetSourceFile, writeFile = _a.writeFile, cancellationToken = _a.cancellationToken, emitOnlyDtsFiles = _a.emitOnlyDtsFiles, customTransformers = _a.customTransformers;
        return program.emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
    };
    var AngularCompilerProgram = /** @class */ (function () {
        function AngularCompilerProgram(rootNames, options, host, oldProgram) {
            var _a;
            var _this = this;
            this.options = options;
            this.host = host;
            this._optionsDiagnostics = [];
            this._transformTsDiagnostics = [];
            this._isCompilingAngularCore = null;
            this.rootNames = tslib_1.__spreadArray([], tslib_1.__read(rootNames));
            if (!options.disableTypeScriptVersionCheck) {
                typescript_support_1.verifySupportedTypeScriptVersion();
            }
            this.oldTsProgram = oldProgram ? oldProgram.getTsProgram() : undefined;
            if (oldProgram) {
                this.oldProgramLibrarySummaries = oldProgram.getLibrarySummaries();
                this.oldProgramEmittedGeneratedFiles = oldProgram.getEmittedGeneratedFiles();
                this.oldProgramEmittedSourceFiles = oldProgram.getEmittedSourceFiles();
            }
            if (options.flatModuleOutFile) {
                var _b = metadata_1.createBundleIndexHost(options, this.rootNames, host, function () { return _this.flatModuleMetadataCache; }), bundleHost = _b.host, indexName = _b.indexName, errors = _b.errors;
                if (errors) {
                    (_a = this._optionsDiagnostics).push.apply(_a, tslib_1.__spreadArray([], tslib_1.__read(errors.map(function (e) { return ({
                        category: e.category,
                        messageText: e.messageText,
                        source: api_1.SOURCE,
                        code: api_1.DEFAULT_ERROR_CODE
                    }); }))));
                }
                else {
                    this.rootNames.push(indexName);
                    this.host = bundleHost;
                }
            }
            this.loweringMetadataTransform =
                new lower_expressions_1.LowerMetadataTransform(options.enableIvy !== false ? R3_LOWER_FIELDS : LOWER_FIELDS);
            this.metadataCache = this.createMetadataCache([this.loweringMetadataTransform]);
        }
        AngularCompilerProgram.prototype.createMetadataCache = function (transformers) {
            return new metadata_cache_1.MetadataCache(new metadata_1.MetadataCollector({ quotedNames: true }), !!this.options.strictMetadataEmit, transformers);
        };
        AngularCompilerProgram.prototype.getLibrarySummaries = function () {
            var result = new Map();
            if (this.oldProgramLibrarySummaries) {
                this.oldProgramLibrarySummaries.forEach(function (summary, fileName) { return result.set(fileName, summary); });
            }
            if (this.emittedLibrarySummaries) {
                this.emittedLibrarySummaries.forEach(function (summary, fileName) { return result.set(summary.fileName, summary); });
            }
            return result;
        };
        AngularCompilerProgram.prototype.getEmittedGeneratedFiles = function () {
            var result = new Map();
            if (this.oldProgramEmittedGeneratedFiles) {
                this.oldProgramEmittedGeneratedFiles.forEach(function (genFile, fileName) { return result.set(fileName, genFile); });
            }
            if (this.emittedGeneratedFiles) {
                this.emittedGeneratedFiles.forEach(function (genFile) { return result.set(genFile.genFileUrl, genFile); });
            }
            return result;
        };
        AngularCompilerProgram.prototype.getEmittedSourceFiles = function () {
            var result = new Map();
            if (this.oldProgramEmittedSourceFiles) {
                this.oldProgramEmittedSourceFiles.forEach(function (sf, fileName) { return result.set(fileName, sf); });
            }
            if (this.emittedSourceFiles) {
                this.emittedSourceFiles.forEach(function (sf) { return result.set(sf.fileName, sf); });
            }
            return result;
        };
        AngularCompilerProgram.prototype.getTsProgram = function () {
            return this.tsProgram;
        };
        AngularCompilerProgram.prototype.getTsOptionDiagnostics = function (cancellationToken) {
            return this.tsProgram.getOptionsDiagnostics(cancellationToken);
        };
        AngularCompilerProgram.prototype.getNgOptionDiagnostics = function (cancellationToken) {
            return tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(this._optionsDiagnostics)), tslib_1.__read(getNgOptionDiagnostics(this.options)));
        };
        AngularCompilerProgram.prototype.getTsSyntacticDiagnostics = function (sourceFile, cancellationToken) {
            return this.tsProgram.getSyntacticDiagnostics(sourceFile, cancellationToken);
        };
        AngularCompilerProgram.prototype.getNgStructuralDiagnostics = function (cancellationToken) {
            return this.structuralDiagnostics;
        };
        AngularCompilerProgram.prototype.getTsSemanticDiagnostics = function (sourceFile, cancellationToken) {
            var _this = this;
            var sourceFiles = sourceFile ? [sourceFile] : this.tsProgram.getSourceFiles();
            var diags = [];
            sourceFiles.forEach(function (sf) {
                if (!util_1.GENERATED_FILES.test(sf.fileName)) {
                    diags.push.apply(diags, tslib_1.__spreadArray([], tslib_1.__read(_this.tsProgram.getSemanticDiagnostics(sf, cancellationToken))));
                }
            });
            return diags;
        };
        AngularCompilerProgram.prototype.getNgSemanticDiagnostics = function (fileName, cancellationToken) {
            var _this = this;
            var diags = [];
            this.tsProgram.getSourceFiles().forEach(function (sf) {
                if (util_1.GENERATED_FILES.test(sf.fileName) && !sf.isDeclarationFile) {
                    diags.push.apply(diags, tslib_1.__spreadArray([], tslib_1.__read(_this.tsProgram.getSemanticDiagnostics(sf, cancellationToken))));
                }
            });
            var ng = translate_diagnostics_1.translateDiagnostics(this.hostAdapter, diags).ng;
            return ng;
        };
        AngularCompilerProgram.prototype.loadNgStructureAsync = function () {
            var _this = this;
            if (this._analyzedModules) {
                throw new Error('Angular structure already loaded');
            }
            return Promise.resolve()
                .then(function () {
                var _a = _this._createProgramWithBasicStubs(), tmpProgram = _a.tmpProgram, sourceFiles = _a.sourceFiles, tsFiles = _a.tsFiles, rootNames = _a.rootNames;
                return _this.compiler.loadFilesAsync(sourceFiles, tsFiles)
                    .then(function (_a) {
                    var analyzedModules = _a.analyzedModules, analyzedInjectables = _a.analyzedInjectables;
                    if (_this._analyzedModules) {
                        throw new Error('Angular structure loaded both synchronously and asynchronously');
                    }
                    _this._updateProgramWithTypeCheckStubs(tmpProgram, analyzedModules, analyzedInjectables, rootNames);
                });
            })
                .catch(function (e) { return _this._createProgramOnError(e); });
        };
        AngularCompilerProgram.prototype.listLazyRoutes = function (route) {
            // Note: Don't analyzedModules if a route is given
            // to be fast enough.
            return this.compiler.listLazyRoutes(route, route ? undefined : this.analyzedModules);
        };
        AngularCompilerProgram.prototype.emit = function (parameters) {
            if (parameters === void 0) { parameters = {}; }
            if (this.options.enableIvy !== false) {
                throw new Error('Cannot run legacy compiler in ngtsc mode');
            }
            return this._emitRender2(parameters);
        };
        AngularCompilerProgram.prototype._emitRender2 = function (_a) {
            var e_1, _b, e_2, _c;
            var _this = this;
            var _d = _a === void 0 ? {} : _a, _e = _d.emitFlags, emitFlags = _e === void 0 ? api_1.EmitFlags.Default : _e, cancellationToken = _d.cancellationToken, customTransformers = _d.customTransformers, _f = _d.emitCallback, emitCallback = _f === void 0 ? defaultEmitCallback : _f, _g = _d.mergeEmitResultsCallback, mergeEmitResultsCallback = _g === void 0 ? mergeEmitResults : _g;
            var emitStart = Date.now();
            if (emitFlags & api_1.EmitFlags.I18nBundle) {
                var locale = this.options.i18nOutLocale || null;
                var file = this.options.i18nOutFile || null;
                var format = this.options.i18nOutFormat || null;
                var bundle = this.compiler.emitMessageBundle(this.analyzedModules, locale);
                i18nExtract(format, file, this.host, this.options, bundle);
            }
            if ((emitFlags & (api_1.EmitFlags.JS | api_1.EmitFlags.DTS | api_1.EmitFlags.Metadata | api_1.EmitFlags.Codegen)) ===
                0) {
                return { emitSkipped: true, diagnostics: [], emittedFiles: [] };
            }
            var _h = this.generateFilesForEmit(emitFlags), genFiles = _h.genFiles, genDiags = _h.genDiags;
            if (genDiags.length) {
                return {
                    diagnostics: genDiags,
                    emitSkipped: true,
                    emittedFiles: [],
                };
            }
            this.emittedGeneratedFiles = genFiles;
            var outSrcMapping = [];
            var genFileByFileName = new Map();
            genFiles.forEach(function (genFile) { return genFileByFileName.set(genFile.genFileUrl, genFile); });
            this.emittedLibrarySummaries = [];
            this._transformTsDiagnostics = [];
            var emittedSourceFiles = [];
            var writeTsFile = function (outFileName, outData, writeByteOrderMark, onError, sourceFiles) {
                var sourceFile = sourceFiles && sourceFiles.length == 1 ? sourceFiles[0] : null;
                var genFile;
                if (sourceFile) {
                    outSrcMapping.push({ outFileName: outFileName, sourceFile: sourceFile });
                    genFile = genFileByFileName.get(sourceFile.fileName);
                    if (!sourceFile.isDeclarationFile && !util_1.GENERATED_FILES.test(sourceFile.fileName)) {
                        // Note: sourceFile is the transformed sourcefile, not the original one!
                        var originalFile = _this.tsProgram.getSourceFile(sourceFile.fileName);
                        if (originalFile) {
                            emittedSourceFiles.push(originalFile);
                        }
                    }
                }
                _this.writeFile(outFileName, outData, writeByteOrderMark, onError, genFile, sourceFiles);
            };
            var modules = this._analyzedInjectables &&
                this.compiler.emitAllPartialModules2(this._analyzedInjectables);
            var tsCustomTransformers = this.calculateTransforms(genFileByFileName, modules, customTransformers);
            var emitOnlyDtsFiles = (emitFlags & (api_1.EmitFlags.DTS | api_1.EmitFlags.JS)) == api_1.EmitFlags.DTS;
            // Restore the original references before we emit so TypeScript doesn't emit
            // a reference to the .d.ts file.
            var augmentedReferences = new Map();
            try {
                for (var _j = tslib_1.__values(this.tsProgram.getSourceFiles()), _k = _j.next(); !_k.done; _k = _j.next()) {
                    var sourceFile = _k.value;
                    var originalReferences = compiler_host_1.getOriginalReferences(sourceFile);
                    if (originalReferences) {
                        augmentedReferences.set(sourceFile, sourceFile.referencedFiles);
                        sourceFile.referencedFiles = originalReferences;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_k && !_k.done && (_b = _j.return)) _b.call(_j);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var genTsFiles = [];
            var genJsonFiles = [];
            genFiles.forEach(function (gf) {
                if (gf.stmts) {
                    genTsFiles.push(gf);
                }
                if (gf.source) {
                    genJsonFiles.push(gf);
                }
            });
            var emitResult;
            var emittedUserTsCount;
            try {
                var sourceFilesToEmit = this.getSourceFilesForEmit();
                if (sourceFilesToEmit &&
                    (sourceFilesToEmit.length + genTsFiles.length) < MAX_FILE_COUNT_FOR_SINGLE_FILE_EMIT) {
                    var fileNamesToEmit = tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(sourceFilesToEmit.map(function (sf) { return sf.fileName; }))), tslib_1.__read(genTsFiles.map(function (gf) { return gf.genFileUrl; })));
                    emitResult = mergeEmitResultsCallback(fileNamesToEmit.map(function (fileName) { return emitResult = emitCallback({
                        program: _this.tsProgram,
                        host: _this.host,
                        options: _this.options,
                        writeFile: writeTsFile,
                        emitOnlyDtsFiles: emitOnlyDtsFiles,
                        customTransformers: tsCustomTransformers,
                        targetSourceFile: _this.tsProgram.getSourceFile(fileName),
                    }); }));
                    emittedUserTsCount = sourceFilesToEmit.length;
                }
                else {
                    emitResult = emitCallback({
                        program: this.tsProgram,
                        host: this.host,
                        options: this.options,
                        writeFile: writeTsFile,
                        emitOnlyDtsFiles: emitOnlyDtsFiles,
                        customTransformers: tsCustomTransformers
                    });
                    emittedUserTsCount = this.tsProgram.getSourceFiles().length - genTsFiles.length;
                }
            }
            finally {
                try {
                    // Restore the references back to the augmented value to ensure that the
                    // checks that TypeScript makes for project structure reuse will succeed.
                    for (var _l = tslib_1.__values(Array.from(augmentedReferences)), _m = _l.next(); !_m.done; _m = _l.next()) {
                        var _o = tslib_1.__read(_m.value, 2), sourceFile = _o[0], references = _o[1];
                        // TODO(chuckj): Remove any cast after updating build to 2.6
                        sourceFile.referencedFiles = references;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_m && !_m.done && (_c = _l.return)) _c.call(_l);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            this.emittedSourceFiles = emittedSourceFiles;
            // Match behavior of tsc: only produce emit diagnostics if it would block
            // emit. If noEmitOnError is false, the emit will happen in spite of any
            // errors, so we should not report them.
            if (emitResult && this.options.noEmitOnError === true) {
                // translate the diagnostics in the emitResult as well.
                var translatedEmitDiags = translate_diagnostics_1.translateDiagnostics(this.hostAdapter, emitResult.diagnostics);
                emitResult.diagnostics = translatedEmitDiags.ts.concat(this.structuralDiagnostics.concat(translatedEmitDiags.ng).map(util_1.ngToTsDiagnostic));
            }
            if (emitResult && !outSrcMapping.length) {
                // if no files were emitted by TypeScript, also don't emit .json files
                emitResult.diagnostics =
                    emitResult.diagnostics.concat([util_1.createMessageDiagnostic("Emitted no files.")]);
                return emitResult;
            }
            var sampleSrcFileName;
            var sampleOutFileName;
            if (outSrcMapping.length) {
                sampleSrcFileName = outSrcMapping[0].sourceFile.fileName;
                sampleOutFileName = outSrcMapping[0].outFileName;
            }
            var srcToOutPath = createSrcToOutPathMapper(this.options.outDir, sampleSrcFileName, sampleOutFileName);
            if (emitFlags & api_1.EmitFlags.Codegen) {
                genJsonFiles.forEach(function (gf) {
                    var outFileName = srcToOutPath(gf.genFileUrl);
                    _this.writeFile(outFileName, gf.source, false, undefined, gf);
                });
            }
            var metadataJsonCount = 0;
            if (emitFlags & api_1.EmitFlags.Metadata) {
                this.tsProgram.getSourceFiles().forEach(function (sf) {
                    if (!sf.isDeclarationFile && !util_1.GENERATED_FILES.test(sf.fileName)) {
                        metadataJsonCount++;
                        var metadata = _this.metadataCache.getMetadata(sf);
                        if (metadata) {
                            var metadataText = JSON.stringify([metadata]);
                            var outFileName = srcToOutPath(sf.fileName.replace(/\.tsx?$/, '.metadata.json'));
                            _this.writeFile(outFileName, metadataText, false, undefined, undefined, [sf]);
                        }
                    }
                });
            }
            var emitEnd = Date.now();
            if (emitResult && this.options.diagnostics) {
                emitResult.diagnostics = emitResult.diagnostics.concat([util_1.createMessageDiagnostic([
                        "Emitted in " + (emitEnd - emitStart) + "ms",
                        "- " + emittedUserTsCount + " user ts files",
                        "- " + genTsFiles.length + " generated ts files",
                        "- " + (genJsonFiles.length + metadataJsonCount) + " generated json files",
                    ].join('\n'))]);
            }
            return emitResult;
        };
        Object.defineProperty(AngularCompilerProgram.prototype, "compiler", {
            // Private members
            get: function () {
                if (!this._compiler) {
                    this._createCompiler();
                }
                return this._compiler;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AngularCompilerProgram.prototype, "hostAdapter", {
            get: function () {
                if (!this._hostAdapter) {
                    this._createCompiler();
                }
                return this._hostAdapter;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AngularCompilerProgram.prototype, "analyzedModules", {
            get: function () {
                if (!this._analyzedModules) {
                    this.initSync();
                }
                return this._analyzedModules;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AngularCompilerProgram.prototype, "structuralDiagnostics", {
            get: function () {
                var diagnostics = this._structuralDiagnostics;
                if (!diagnostics) {
                    this.initSync();
                    diagnostics = (this._structuralDiagnostics = this._structuralDiagnostics || []);
                }
                return diagnostics;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AngularCompilerProgram.prototype, "tsProgram", {
            get: function () {
                if (!this._tsProgram) {
                    this.initSync();
                }
                return this._tsProgram;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AngularCompilerProgram.prototype, "isCompilingAngularCore", {
            /** Whether the program is compiling the Angular core package. */
            get: function () {
                if (this._isCompilingAngularCore !== null) {
                    return this._isCompilingAngularCore;
                }
                return this._isCompilingAngularCore = compiler_2.isAngularCorePackage(this.tsProgram);
            },
            enumerable: false,
            configurable: true
        });
        AngularCompilerProgram.prototype.calculateTransforms = function (genFiles, partialModules, customTransformers) {
            var beforeTs = [];
            var metadataTransforms = [];
            var flatModuleMetadataTransforms = [];
            var annotateForClosureCompiler = this.options.annotateForClosureCompiler || false;
            if (this.options.enableResourceInlining) {
                beforeTs.push(inline_resources_1.getInlineResourcesTransformFactory(this.tsProgram, this.hostAdapter));
                var transformer = new inline_resources_1.InlineResourcesMetadataTransformer(this.hostAdapter);
                metadataTransforms.push(transformer);
                flatModuleMetadataTransforms.push(transformer);
            }
            if (!this.options.disableExpressionLowering) {
                beforeTs.push(lower_expressions_1.getExpressionLoweringTransformFactory(this.loweringMetadataTransform, this.tsProgram));
                metadataTransforms.push(this.loweringMetadataTransform);
            }
            if (genFiles) {
                beforeTs.push(node_emitter_transform_1.getAngularEmitterTransformFactory(genFiles, this.getTsProgram(), annotateForClosureCompiler));
            }
            if (partialModules) {
                beforeTs.push(r3_transform_1.getAngularClassTransformerFactory(partialModules, annotateForClosureCompiler));
                // If we have partial modules, the cached metadata might be incorrect as it doesn't reflect
                // the partial module transforms.
                var transformer = new r3_metadata_transform_1.PartialModuleMetadataTransformer(partialModules);
                metadataTransforms.push(transformer);
                flatModuleMetadataTransforms.push(transformer);
            }
            if (customTransformers && customTransformers.beforeTs) {
                beforeTs.push.apply(beforeTs, tslib_1.__spreadArray([], tslib_1.__read(customTransformers.beforeTs)));
            }
            // If decorators should be converted to static fields (enabled by default), we set up
            // the decorator downlevel transform. Note that we set it up as last transform as that
            // allows custom transformers to strip Angular decorators without having to deal with
            // identifying static properties. e.g. it's more difficult handling `<..>.decorators`
            // or `<..>.ctorParameters` compared to the `ts.Decorator` AST nodes.
            if (this.options.annotationsAs !== 'decorators') {
                var typeChecker = this.getTsProgram().getTypeChecker();
                var reflectionHost = new reflection_1.TypeScriptReflectionHost(typeChecker);
                // Similarly to how we handled tsickle decorator downleveling in the past, we just
                // ignore diagnostics that have been collected by the transformer. These are
                // non-significant failures that shouldn't prevent apps from compiling.
                beforeTs.push(downlevel_decorators_transform_1.getDownlevelDecoratorsTransform(typeChecker, reflectionHost, [], this.isCompilingAngularCore, annotateForClosureCompiler, 
                /* skipClassDecorators */ false));
            }
            if (metadataTransforms.length > 0) {
                this.metadataCache = this.createMetadataCache(metadataTransforms);
            }
            if (flatModuleMetadataTransforms.length > 0) {
                this.flatModuleMetadataCache = this.createMetadataCache(flatModuleMetadataTransforms);
            }
            var afterTs = customTransformers ? customTransformers.afterTs : undefined;
            return { before: beforeTs, after: afterTs };
        };
        AngularCompilerProgram.prototype.initSync = function () {
            if (this._analyzedModules) {
                return;
            }
            try {
                var _a = this._createProgramWithBasicStubs(), tmpProgram = _a.tmpProgram, sourceFiles = _a.sourceFiles, tsFiles = _a.tsFiles, rootNames = _a.rootNames;
                var _b = this.compiler.loadFilesSync(sourceFiles, tsFiles), analyzedModules = _b.analyzedModules, analyzedInjectables = _b.analyzedInjectables;
                this._updateProgramWithTypeCheckStubs(tmpProgram, analyzedModules, analyzedInjectables, rootNames);
            }
            catch (e) {
                this._createProgramOnError(e);
            }
        };
        AngularCompilerProgram.prototype._createCompiler = function () {
            var _this = this;
            var codegen = {
                generateFile: function (genFileName, baseFileName) {
                    return _this._compiler.emitBasicStub(genFileName, baseFileName);
                },
                findGeneratedFileNames: function (fileName) { return _this._compiler.findGeneratedFileNames(fileName); },
            };
            this._hostAdapter = new compiler_host_1.TsCompilerAotCompilerTypeCheckHostAdapter(this.rootNames, this.options, this.host, this.metadataCache, codegen, this.oldProgramLibrarySummaries);
            var aotOptions = getAotCompilerOptions(this.options);
            var errorCollector = (this.options.collectAllErrors || this.options.fullTemplateTypeCheck) ?
                function (err) { return _this._addStructuralDiagnostics(err); } :
                undefined;
            this._compiler = compiler_1.createAotCompiler(this._hostAdapter, aotOptions, errorCollector).compiler;
        };
        AngularCompilerProgram.prototype._createProgramWithBasicStubs = function () {
            var _this = this;
            if (this._analyzedModules) {
                throw new Error("Internal Error: already initialized!");
            }
            // Note: This is important to not produce a memory leak!
            var oldTsProgram = this.oldTsProgram;
            this.oldTsProgram = undefined;
            var codegen = {
                generateFile: function (genFileName, baseFileName) {
                    return _this.compiler.emitBasicStub(genFileName, baseFileName);
                },
                findGeneratedFileNames: function (fileName) { return _this.compiler.findGeneratedFileNames(fileName); },
            };
            var rootNames = tslib_1.__spreadArray([], tslib_1.__read(this.rootNames));
            if (this.options.generateCodeForLibraries !== false) {
                // if we should generateCodeForLibraries, never include
                // generated files in the program as otherwise we will
                // overwrite them and typescript will report the error
                // TS5055: Cannot write file ... because it would overwrite input file.
                rootNames = rootNames.filter(function (fn) { return !util_1.GENERATED_FILES.test(fn); });
            }
            if (this.options.noResolve) {
                this.rootNames.forEach(function (rootName) {
                    if (_this.hostAdapter.shouldGenerateFilesFor(rootName)) {
                        rootNames.push.apply(rootNames, tslib_1.__spreadArray([], tslib_1.__read(_this.compiler.findGeneratedFileNames(rootName))));
                    }
                });
            }
            var tmpProgram = ts.createProgram(rootNames, this.options, this.hostAdapter, oldTsProgram);
            if (tempProgramHandlerForTest !== null) {
                tempProgramHandlerForTest(tmpProgram);
            }
            var sourceFiles = [];
            var tsFiles = [];
            tmpProgram.getSourceFiles().forEach(function (sf) {
                if (_this.hostAdapter.isSourceFile(sf.fileName)) {
                    sourceFiles.push(sf.fileName);
                }
                if (util_1.TS.test(sf.fileName) && !util_1.DTS.test(sf.fileName)) {
                    tsFiles.push(sf.fileName);
                }
            });
            return { tmpProgram: tmpProgram, sourceFiles: sourceFiles, tsFiles: tsFiles, rootNames: rootNames };
        };
        AngularCompilerProgram.prototype._updateProgramWithTypeCheckStubs = function (tmpProgram, analyzedModules, analyzedInjectables, rootNames) {
            var _this = this;
            this._analyzedModules = analyzedModules;
            this._analyzedInjectables = analyzedInjectables;
            tmpProgram.getSourceFiles().forEach(function (sf) {
                if (sf.fileName.endsWith('.ngfactory.ts')) {
                    var _a = _this.hostAdapter.shouldGenerateFile(sf.fileName), generate = _a.generate, baseFileName = _a.baseFileName;
                    if (generate) {
                        // Note: ! is ok as hostAdapter.shouldGenerateFile will always return a baseFileName
                        // for .ngfactory.ts files.
                        var genFile = _this.compiler.emitTypeCheckStub(sf.fileName, baseFileName);
                        if (genFile) {
                            _this.hostAdapter.updateGeneratedFile(genFile);
                        }
                    }
                }
            });
            this._tsProgram = ts.createProgram(rootNames, this.options, this.hostAdapter, tmpProgram);
            // Note: the new ts program should be completely reusable by TypeScript as:
            // - we cache all the files in the hostAdapter
            // - new new stubs use the exactly same imports/exports as the old once (we assert that in
            // hostAdapter.updateGeneratedFile).
            if (util_1.tsStructureIsReused(this._tsProgram) !== 2 /* Completely */) {
                throw new Error("Internal Error: The structure of the program changed during codegen.");
            }
        };
        AngularCompilerProgram.prototype._createProgramOnError = function (e) {
            // Still fill the analyzedModules and the tsProgram
            // so that we don't cause other errors for users who e.g. want to emit the ngProgram.
            this._analyzedModules = emptyModules;
            this.oldTsProgram = undefined;
            this._hostAdapter.isSourceFile = function () { return false; };
            this._tsProgram = ts.createProgram(this.rootNames, this.options, this.hostAdapter);
            if (compiler_1.isSyntaxError(e)) {
                this._addStructuralDiagnostics(e);
                return;
            }
            throw e;
        };
        AngularCompilerProgram.prototype._addStructuralDiagnostics = function (error) {
            var diagnostics = this._structuralDiagnostics || (this._structuralDiagnostics = []);
            if (compiler_1.isSyntaxError(error)) {
                diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(syntaxErrorToDiagnostics(error, this.tsProgram))));
            }
            else {
                diagnostics.push({
                    messageText: error.toString(),
                    category: ts.DiagnosticCategory.Error,
                    source: api_1.SOURCE,
                    code: api_1.DEFAULT_ERROR_CODE
                });
            }
        };
        // Note: this returns a ts.Diagnostic so that we
        // can return errors in a ts.EmitResult
        AngularCompilerProgram.prototype.generateFilesForEmit = function (emitFlags) {
            var _this = this;
            try {
                if (!(emitFlags & api_1.EmitFlags.Codegen)) {
                    return { genFiles: [], genDiags: [] };
                }
                // TODO(tbosch): allow generating files that are not in the rootDir
                // See https://github.com/angular/angular/issues/19337
                var genFiles = this.compiler.emitAllImpls(this.analyzedModules)
                    .filter(function (genFile) { return util_1.isInRootDir(genFile.genFileUrl, _this.options); });
                if (this.oldProgramEmittedGeneratedFiles) {
                    var oldProgramEmittedGeneratedFiles_1 = this.oldProgramEmittedGeneratedFiles;
                    genFiles = genFiles.filter(function (genFile) {
                        var oldGenFile = oldProgramEmittedGeneratedFiles_1.get(genFile.genFileUrl);
                        return !oldGenFile || !genFile.isEquivalent(oldGenFile);
                    });
                }
                return { genFiles: genFiles, genDiags: [] };
            }
            catch (e) {
                // TODO(tbosch): check whether we can actually have syntax errors here,
                // as we already parsed the metadata and templates before to create the type check block.
                if (compiler_1.isSyntaxError(e)) {
                    var genDiags = [{
                            file: undefined,
                            start: undefined,
                            length: undefined,
                            messageText: e.message,
                            category: ts.DiagnosticCategory.Error,
                            source: api_1.SOURCE,
                            code: api_1.DEFAULT_ERROR_CODE
                        }];
                    return { genFiles: [], genDiags: genDiags };
                }
                throw e;
            }
        };
        /**
         * Returns undefined if all files should be emitted.
         */
        AngularCompilerProgram.prototype.getSourceFilesForEmit = function () {
            var _this = this;
            // TODO(tbosch): if one of the files contains a `const enum`
            // always emit all files -> return undefined!
            var sourceFilesToEmit = this.tsProgram.getSourceFiles().filter(function (sf) {
                return !sf.isDeclarationFile && !util_1.GENERATED_FILES.test(sf.fileName);
            });
            if (this.oldProgramEmittedSourceFiles) {
                sourceFilesToEmit = sourceFilesToEmit.filter(function (sf) {
                    var oldFile = _this.oldProgramEmittedSourceFiles.get(sf.fileName);
                    return sf !== oldFile;
                });
            }
            return sourceFilesToEmit;
        };
        AngularCompilerProgram.prototype.writeFile = function (outFileName, outData, writeByteOrderMark, onError, genFile, sourceFiles) {
            // collect emittedLibrarySummaries
            var baseFile;
            if (genFile) {
                baseFile = this.tsProgram.getSourceFile(genFile.srcFileUrl);
                if (baseFile) {
                    if (!this.emittedLibrarySummaries) {
                        this.emittedLibrarySummaries = [];
                    }
                    if (genFile.genFileUrl.endsWith('.ngsummary.json') && baseFile.fileName.endsWith('.d.ts')) {
                        this.emittedLibrarySummaries.push({
                            fileName: baseFile.fileName,
                            text: baseFile.text,
                            sourceFile: baseFile,
                        });
                        this.emittedLibrarySummaries.push({ fileName: genFile.genFileUrl, text: outData });
                        if (!this.options.declaration) {
                            // If we don't emit declarations, still record an empty .ngfactory.d.ts file,
                            // as we might need it later on for resolving module names from summaries.
                            var ngFactoryDts = genFile.genFileUrl.substring(0, genFile.genFileUrl.length - 15) + '.ngfactory.d.ts';
                            this.emittedLibrarySummaries.push({ fileName: ngFactoryDts, text: '' });
                        }
                    }
                    else if (outFileName.endsWith('.d.ts') && baseFile.fileName.endsWith('.d.ts')) {
                        var dtsSourceFilePath = genFile.genFileUrl.replace(/\.ts$/, '.d.ts');
                        // Note: Don't use sourceFiles here as the created .d.ts has a path in the outDir,
                        // but we need one that is next to the .ts file
                        this.emittedLibrarySummaries.push({ fileName: dtsSourceFilePath, text: outData });
                    }
                }
            }
            // Filter out generated files for which we didn't generate code.
            // This can happen as the stub calculation is not completely exact.
            // Note: sourceFile refers to the .ngfactory.ts / .ngsummary.ts file
            // node_emitter_transform already set the file contents to be empty,
            //  so this code only needs to skip the file if !allowEmptyCodegenFiles.
            var isGenerated = util_1.GENERATED_FILES.test(outFileName);
            if (isGenerated && !this.options.allowEmptyCodegenFiles &&
                (!genFile || !genFile.stmts || genFile.stmts.length === 0)) {
                return;
            }
            if (baseFile) {
                sourceFiles = sourceFiles ? tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(sourceFiles)), [baseFile]) : [baseFile];
            }
            // TODO: remove any when TS 2.4 support is removed.
            this.host.writeFile(outFileName, outData, writeByteOrderMark, onError, sourceFiles);
        };
        return AngularCompilerProgram;
    }());
    function createProgram(_a) {
        var rootNames = _a.rootNames, options = _a.options, host = _a.host, oldProgram = _a.oldProgram;
        if (options.enableIvy !== false) {
            return new program_1.NgtscProgram(rootNames, options, host, oldProgram);
        }
        else {
            return new AngularCompilerProgram(rootNames, options, host, oldProgram);
        }
    }
    exports.createProgram = createProgram;
    // Compute the AotCompiler options
    function getAotCompilerOptions(options) {
        var missingTranslation = compiler_1.core.MissingTranslationStrategy.Warning;
        switch (options.i18nInMissingTranslations) {
            case 'ignore':
                missingTranslation = compiler_1.core.MissingTranslationStrategy.Ignore;
                break;
            case 'error':
                missingTranslation = compiler_1.core.MissingTranslationStrategy.Error;
                break;
        }
        var translations = '';
        if (options.i18nInFile) {
            if (!options.i18nInLocale) {
                throw new Error("The translation file (" + options.i18nInFile + ") locale must be provided.");
            }
            translations = fs.readFileSync(options.i18nInFile, 'utf8');
        }
        else {
            // No translations are provided, ignore any errors
            // We still go through i18n to remove i18n attributes
            missingTranslation = compiler_1.core.MissingTranslationStrategy.Ignore;
        }
        return {
            locale: options.i18nInLocale,
            i18nFormat: options.i18nInFormat || options.i18nOutFormat,
            i18nUseExternalIds: options.i18nUseExternalIds,
            translations: translations,
            missingTranslation: missingTranslation,
            enableSummariesForJit: options.enableSummariesForJit,
            preserveWhitespaces: options.preserveWhitespaces,
            fullTemplateTypeCheck: options.fullTemplateTypeCheck,
            allowEmptyCodegenFiles: options.allowEmptyCodegenFiles,
            enableIvy: options.enableIvy,
            createExternalSymbolFactoryReexports: options.createExternalSymbolFactoryReexports,
        };
    }
    function getNgOptionDiagnostics(options) {
        if (options.annotationsAs) {
            switch (options.annotationsAs) {
                case 'decorators':
                case 'static fields':
                    break;
                default:
                    return [{
                            messageText: 'Angular compiler options "annotationsAs" only supports "static fields" and "decorators"',
                            category: ts.DiagnosticCategory.Error,
                            source: api_1.SOURCE,
                            code: api_1.DEFAULT_ERROR_CODE
                        }];
            }
        }
        return [];
    }
    function normalizeSeparators(path) {
        return path.replace(/\\/g, '/');
    }
    /**
     * Returns a function that can adjust a path from source path to out path,
     * based on an existing mapping from source to out path.
     *
     * TODO(tbosch): talk to the TypeScript team to expose their logic for calculating the `rootDir`
     * if none was specified.
     *
     * Note: This function works on normalized paths from typescript but should always return
     * POSIX normalized paths for output paths.
     */
    function createSrcToOutPathMapper(outDir, sampleSrcFileName, sampleOutFileName, host) {
        if (host === void 0) { host = path; }
        if (outDir) {
            var path_1 = {}; // Ensure we error if we use `path` instead of `host`.
            if (sampleSrcFileName == null || sampleOutFileName == null) {
                throw new Error("Can't calculate the rootDir without a sample srcFileName / outFileName. ");
            }
            var srcFileDir = normalizeSeparators(host.dirname(sampleSrcFileName));
            var outFileDir = normalizeSeparators(host.dirname(sampleOutFileName));
            if (srcFileDir === outFileDir) {
                return function (srcFileName) { return srcFileName; };
            }
            // calculate the common suffix, stopping
            // at `outDir`.
            var srcDirParts = srcFileDir.split('/');
            var outDirParts = normalizeSeparators(host.relative(outDir, outFileDir)).split('/');
            var i = 0;
            while (i < Math.min(srcDirParts.length, outDirParts.length) &&
                srcDirParts[srcDirParts.length - 1 - i] === outDirParts[outDirParts.length - 1 - i])
                i++;
            var rootDir_1 = srcDirParts.slice(0, srcDirParts.length - i).join('/');
            return function (srcFileName) {
                // Note: Before we return the mapped output path, we need to normalize the path delimiters
                // because the output path is usually passed to TypeScript which sometimes only expects
                // posix normalized paths (e.g. if a custom compiler host is used)
                return normalizeSeparators(host.resolve(outDir, host.relative(rootDir_1, srcFileName)));
            };
        }
        else {
            // Note: Before we return the output path, we need to normalize the path delimiters because
            // the output path is usually passed to TypeScript which only passes around posix
            // normalized paths (e.g. if a custom compiler host is used)
            return function (srcFileName) { return normalizeSeparators(srcFileName); };
        }
    }
    exports.createSrcToOutPathMapper = createSrcToOutPathMapper;
    function i18nExtract(formatName, outFile, host, options, bundle) {
        formatName = formatName || 'xlf';
        // Checks the format and returns the extension
        var ext = i18nGetExtension(formatName);
        var content = i18nSerialize(bundle, formatName, options);
        var dstFile = outFile || "messages." + ext;
        var dstPath = path.resolve(options.outDir || options.basePath, dstFile);
        host.writeFile(dstPath, content, false, undefined, []);
        return [dstPath];
    }
    exports.i18nExtract = i18nExtract;
    function i18nSerialize(bundle, formatName, options) {
        var format = formatName.toLowerCase();
        var serializer;
        switch (format) {
            case 'xmb':
                serializer = new compiler_1.Xmb();
                break;
            case 'xliff2':
            case 'xlf2':
                serializer = new compiler_1.Xliff2();
                break;
            case 'xlf':
            case 'xliff':
            default:
                serializer = new compiler_1.Xliff();
        }
        return bundle.write(serializer, getPathNormalizer(options.basePath));
    }
    exports.i18nSerialize = i18nSerialize;
    function getPathNormalizer(basePath) {
        // normalize source paths by removing the base path and always using "/" as a separator
        return function (sourcePath) {
            sourcePath = basePath ? path.relative(basePath, sourcePath) : sourcePath;
            return sourcePath.split(path.sep).join('/');
        };
    }
    function i18nGetExtension(formatName) {
        var format = formatName.toLowerCase();
        switch (format) {
            case 'xmb':
                return 'xmb';
            case 'xlf':
            case 'xlif':
            case 'xliff':
            case 'xlf2':
            case 'xliff2':
                return 'xlf';
        }
        throw new Error("Unsupported format \"" + formatName + "\"");
    }
    exports.i18nGetExtension = i18nGetExtension;
    function mergeEmitResults(emitResults) {
        var e_3, _a;
        var diagnostics = [];
        var emitSkipped = false;
        var emittedFiles = [];
        try {
            for (var emitResults_1 = tslib_1.__values(emitResults), emitResults_1_1 = emitResults_1.next(); !emitResults_1_1.done; emitResults_1_1 = emitResults_1.next()) {
                var er = emitResults_1_1.value;
                diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(er.diagnostics)));
                emitSkipped = emitSkipped || er.emitSkipped;
                emittedFiles.push.apply(emittedFiles, tslib_1.__spreadArray([], tslib_1.__read((er.emittedFiles || []))));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (emitResults_1_1 && !emitResults_1_1.done && (_a = emitResults_1.return)) _a.call(emitResults_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return { diagnostics: diagnostics, emitSkipped: emitSkipped, emittedFiles: emittedFiles };
    }
    function diagnosticSourceOfSpan(span) {
        // For diagnostics, TypeScript only uses the fileName and text properties.
        // The redundant '()' are here is to avoid having clang-format breaking the line incorrectly.
        return { fileName: span.start.file.url, text: span.start.file.content };
    }
    function diagnosticSourceOfFileName(fileName, program) {
        var sourceFile = program.getSourceFile(fileName);
        if (sourceFile)
            return sourceFile;
        // If we are reporting diagnostics for a source file that is not in the project then we need
        // to fake a source file so the diagnostic formatting routines can emit the file name.
        // The redundant '()' are here is to avoid having clang-format breaking the line incorrectly.
        return { fileName: fileName, text: '' };
    }
    function diagnosticChainFromFormattedDiagnosticChain(chain) {
        return {
            messageText: chain.message,
            next: chain.next && chain.next.map(diagnosticChainFromFormattedDiagnosticChain),
            position: chain.position
        };
    }
    function syntaxErrorToDiagnostics(error, program) {
        var parserErrors = compiler_1.getParseErrors(error);
        if (parserErrors && parserErrors.length) {
            return parserErrors.map(function (e) { return ({
                messageText: e.contextualMessage(),
                file: diagnosticSourceOfSpan(e.span),
                start: e.span.start.offset,
                length: e.span.end.offset - e.span.start.offset,
                category: ts.DiagnosticCategory.Error,
                source: api_1.SOURCE,
                code: api_1.DEFAULT_ERROR_CODE
            }); });
        }
        else if (compiler_1.isFormattedError(error)) {
            return [{
                    messageText: error.message,
                    chain: error.chain && diagnosticChainFromFormattedDiagnosticChain(error.chain),
                    category: ts.DiagnosticCategory.Error,
                    source: api_1.SOURCE,
                    code: api_1.DEFAULT_ERROR_CODE,
                    position: error.position
                }];
        }
        var ngModuleErrorData = compiler_1.getMissingNgModuleMetadataErrorData(error);
        if (ngModuleErrorData !== null) {
            // This error represents the import or export of an `NgModule` that didn't have valid metadata.
            // This _might_ happen because the NgModule in question is an Ivy-compiled library, and we want
            // to show a more useful error if that's the case.
            var ngModuleClass = getDtsClass(program, ngModuleErrorData.fileName, ngModuleErrorData.className);
            if (ngModuleClass !== null && isIvyNgModule(ngModuleClass)) {
                return [{
                        messageText: "The NgModule '" + ngModuleErrorData.className + "' in '" + ngModuleErrorData
                            .fileName + "' is imported by this compilation, but appears to be part of a library compiled for Angular Ivy. This may occur because:\n\n  1) the library was processed with 'ngcc'. Removing and reinstalling node_modules may fix this problem.\n\n  2) the library was published for Angular Ivy and v12+ applications only. Check its peer dependencies carefully and ensure that you're using a compatible version of Angular.\n\nSee https://angular.io/errors/NG6999 for more information.\n",
                        category: ts.DiagnosticCategory.Error,
                        code: api_1.DEFAULT_ERROR_CODE,
                        source: api_1.SOURCE,
                    }];
            }
        }
        // Produce a Diagnostic anyway since we know for sure `error` is a SyntaxError
        return [{
                messageText: error.message,
                category: ts.DiagnosticCategory.Error,
                code: api_1.DEFAULT_ERROR_CODE,
                source: api_1.SOURCE,
            }];
    }
    function getDtsClass(program, fileName, className) {
        var e_4, _a;
        var sf = program.getSourceFile(fileName);
        if (sf === undefined || !sf.isDeclarationFile) {
            return null;
        }
        try {
            for (var _b = tslib_1.__values(sf.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                var stmt = _c.value;
                if (!ts.isClassDeclaration(stmt)) {
                    continue;
                }
                if (stmt.name === undefined || stmt.name.text !== className) {
                    continue;
                }
                return stmt;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        // No classes found that matched the given name.
        return null;
    }
    function isIvyNgModule(clazz) {
        var e_5, _a;
        try {
            for (var _b = tslib_1.__values(clazz.members), _c = _b.next(); !_c.done; _c = _b.next()) {
                var member = _c.value;
                if (!ts.isPropertyDeclaration(member)) {
                    continue;
                }
                if (ts.isIdentifier(member.name) && member.name.text === 'ɵmod') {
                    return true;
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
        // No Ivy 'ɵmod' property found.
        return false;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvdHJhbnNmb3JtZXJzL3Byb2dyYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUF3VjtJQUN4Vix1QkFBeUI7SUFDekIsMkJBQTZCO0lBQzdCLCtCQUFpQztJQUVqQyxxR0FBMEU7SUFDMUUscUVBQXFFO0lBQ3JFLDhFQUFnRTtJQUNoRSxtRUFBOEM7SUFDOUMseUVBQTZEO0lBQzdELG1GQUF1RTtJQUV2RSxrRUFBbU87SUFDbk8sc0ZBQWdIO0lBQ2hILHdIQUFpRjtJQUNqRiw0RkFBMEc7SUFDMUcsOEZBQWtHO0lBQ2xHLHdGQUFvRTtJQUNwRSx3R0FBMkU7SUFDM0Usc0dBQXlFO0lBQ3pFLG9GQUFpRTtJQUNqRSxvRUFBZ0o7SUFHaEo7OztPQUdHO0lBQ0gsSUFBTSxtQ0FBbUMsR0FBRyxFQUFFLENBQUM7SUFHL0M7O09BRUc7SUFDSCxJQUFNLFlBQVksR0FBRyxDQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztJQUU5RTs7T0FFRztJQUNILElBQU0sZUFBZSxrRUFBTyxZQUFZLEtBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsQ0FBQztJQUU3RTs7T0FFRztJQUNILElBQUkseUJBQXlCLEdBQXlDLElBQUksQ0FBQztJQUMzRSxTQUFnQiw0QkFBNEIsQ0FBQyxPQUFzQztRQUNqRix5QkFBeUIsR0FBRyxPQUFPLENBQUM7SUFDdEMsQ0FBQztJQUZELG9FQUVDO0lBQ0QsU0FBZ0IsOEJBQThCO1FBQzVDLHlCQUF5QixHQUFHLElBQUksQ0FBQztJQUNuQyxDQUFDO0lBRkQsd0VBRUM7SUFFRCxJQUFNLFlBQVksR0FBc0I7UUFDdEMsU0FBUyxFQUFFLEVBQUU7UUFDYix5QkFBeUIsRUFBRSxJQUFJLEdBQUcsRUFBRTtRQUNwQyxLQUFLLEVBQUUsRUFBRTtLQUNWLENBQUM7SUFFRixJQUFNLG1CQUFtQixHQUFtQixVQUFDLEVBTzVDO1lBTkMsT0FBTyxhQUFBLEVBQ1AsZ0JBQWdCLHNCQUFBLEVBQ2hCLFNBQVMsZUFBQSxFQUNULGlCQUFpQix1QkFBQSxFQUNqQixnQkFBZ0Isc0JBQUEsRUFDaEIsa0JBQWtCLHdCQUFBO1FBRWhCLE9BQUEsT0FBTyxDQUFDLElBQUksQ0FDUixnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUM7SUFEekYsQ0FDeUYsQ0FBQztJQUU5RjtRQThCRSxnQ0FDSSxTQUFnQyxFQUFVLE9BQXdCLEVBQzFELElBQWtCLEVBQUUsVUFBb0I7O1lBRnBELGlCQW1DQztZQWxDNkMsWUFBTyxHQUFQLE9BQU8sQ0FBaUI7WUFDMUQsU0FBSSxHQUFKLElBQUksQ0FBYztZQUx0Qix3QkFBbUIsR0FBaUIsRUFBRSxDQUFDO1lBQ3ZDLDRCQUF1QixHQUFvQixFQUFFLENBQUM7WUFzWTlDLDRCQUF1QixHQUFpQixJQUFJLENBQUM7WUFqWW5ELElBQUksQ0FBQyxTQUFTLDRDQUFPLFNBQVMsRUFBQyxDQUFDO1lBRWhDLElBQUksQ0FBQyxPQUFPLENBQUMsNkJBQTZCLEVBQUU7Z0JBQzFDLHFEQUFnQyxFQUFFLENBQUM7YUFDcEM7WUFFRCxJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDdkUsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsSUFBSSxDQUFDLDBCQUEwQixHQUFHLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUNuRSxJQUFJLENBQUMsK0JBQStCLEdBQUcsVUFBVSxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBQzdFLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxVQUFVLENBQUMscUJBQXFCLEVBQUUsQ0FBQzthQUN4RTtZQUVELElBQUksT0FBTyxDQUFDLGlCQUFpQixFQUFFO2dCQUN2QixJQUFBLEtBQ0YsZ0NBQXFCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsdUJBQXVCLEVBQTVCLENBQTRCLENBQUMsRUFEL0UsVUFBVSxVQUFBLEVBQUUsU0FBUyxlQUFBLEVBQUUsTUFBTSxZQUNrRCxDQUFDO2dCQUM3RixJQUFJLE1BQU0sRUFBRTtvQkFDVixDQUFBLEtBQUEsSUFBSSxDQUFDLG1CQUFtQixDQUFBLENBQUMsSUFBSSxvREFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQzt3QkFDSixRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7d0JBQ3BCLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBcUI7d0JBQ3BDLE1BQU0sRUFBRSxZQUFNO3dCQUNkLElBQUksRUFBRSx3QkFBa0I7cUJBQ3pCLENBQUMsRUFMRyxDQUtILENBQUMsSUFBRTtpQkFDbEQ7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBVSxDQUFDLENBQUM7b0JBQ2hDLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO2lCQUN4QjthQUNGO1lBRUQsSUFBSSxDQUFDLHlCQUF5QjtnQkFDMUIsSUFBSSwwQ0FBc0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM3RixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUVPLG9EQUFtQixHQUEzQixVQUE0QixZQUFtQztZQUM3RCxPQUFPLElBQUksOEJBQWEsQ0FDcEIsSUFBSSw0QkFBaUIsQ0FBQyxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUM3RSxZQUFZLENBQUMsQ0FBQztRQUNwQixDQUFDO1FBRUQsb0RBQW1CLEdBQW5CO1lBQ0UsSUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7WUFDakQsSUFBSSxJQUFJLENBQUMsMEJBQTBCLEVBQUU7Z0JBQ25DLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsUUFBUSxJQUFLLE9BQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQTdCLENBQTZCLENBQUMsQ0FBQzthQUMvRjtZQUNELElBQUksSUFBSSxDQUFDLHVCQUF1QixFQUFFO2dCQUNoQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUNoQyxVQUFDLE9BQU8sRUFBRSxRQUFRLElBQUssT0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQXJDLENBQXFDLENBQUMsQ0FBQzthQUNuRTtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7UUFFRCx5REFBd0IsR0FBeEI7WUFDRSxJQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztZQUNoRCxJQUFJLElBQUksQ0FBQywrQkFBK0IsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLCtCQUErQixDQUFDLE9BQU8sQ0FDeEMsVUFBQyxPQUFPLEVBQUUsUUFBUSxJQUFLLE9BQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQTdCLENBQTZCLENBQUMsQ0FBQzthQUMzRDtZQUNELElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFO2dCQUM5QixJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLFVBQUMsT0FBTyxJQUFLLE9BQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxFQUF2QyxDQUF1QyxDQUFDLENBQUM7YUFDMUY7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQsc0RBQXFCLEdBQXJCO1lBQ0UsSUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQXlCLENBQUM7WUFDaEQsSUFBSSxJQUFJLENBQUMsNEJBQTRCLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUFFLEVBQUUsUUFBUSxJQUFLLE9BQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQXhCLENBQXdCLENBQUMsQ0FBQzthQUN2RjtZQUNELElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFO2dCQUMzQixJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBRSxJQUFLLE9BQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUEzQixDQUEyQixDQUFDLENBQUM7YUFDdEU7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQsNkNBQVksR0FBWjtZQUNFLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN4QixDQUFDO1FBRUQsdURBQXNCLEdBQXRCLFVBQXVCLGlCQUF3QztZQUM3RCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQsdURBQXNCLEdBQXRCLFVBQXVCLGlCQUF3QztZQUM3RCxzRUFBVyxJQUFJLENBQUMsbUJBQW1CLG1CQUFLLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRTtRQUNoRixDQUFDO1FBRUQsMERBQXlCLEdBQXpCLFVBQTBCLFVBQTBCLEVBQUUsaUJBQXdDO1lBRTVGLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBRUQsMkRBQTBCLEdBQTFCLFVBQTJCLGlCQUF3QztZQUNqRSxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztRQUNwQyxDQUFDO1FBRUQseURBQXdCLEdBQXhCLFVBQXlCLFVBQTBCLEVBQUUsaUJBQXdDO1lBQTdGLGlCQVVDO1lBUkMsSUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ2hGLElBQUksS0FBSyxHQUFvQixFQUFFLENBQUM7WUFDaEMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxzQkFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUU7b0JBQ3RDLEtBQUssQ0FBQyxJQUFJLE9BQVYsS0FBSywyQ0FBUyxLQUFJLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxJQUFFO2lCQUM3RTtZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBRUQseURBQXdCLEdBQXhCLFVBQXlCLFFBQWlCLEVBQUUsaUJBQXdDO1lBQXBGLGlCQVVDO1lBUkMsSUFBSSxLQUFLLEdBQW9CLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUU7Z0JBQ3hDLElBQUksc0JBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFO29CQUM5RCxLQUFLLENBQUMsSUFBSSxPQUFWLEtBQUssMkNBQVMsS0FBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsaUJBQWlCLENBQUMsSUFBRTtpQkFDN0U7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNJLElBQUEsRUFBRSxHQUFJLDRDQUFvQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLEdBQWpELENBQWtEO1lBQzNELE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUVELHFEQUFvQixHQUFwQjtZQUFBLGlCQWlCQztZQWhCQyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO2FBQ3JEO1lBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFO2lCQUNuQixJQUFJLENBQUM7Z0JBQ0UsSUFBQSxLQUFnRCxLQUFJLENBQUMsNEJBQTRCLEVBQUUsRUFBbEYsVUFBVSxnQkFBQSxFQUFFLFdBQVcsaUJBQUEsRUFBRSxPQUFPLGFBQUEsRUFBRSxTQUFTLGVBQXVDLENBQUM7Z0JBQzFGLE9BQU8sS0FBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQztxQkFDcEQsSUFBSSxDQUFDLFVBQUMsRUFBc0M7d0JBQXJDLGVBQWUscUJBQUEsRUFBRSxtQkFBbUIseUJBQUE7b0JBQzFDLElBQUksS0FBSSxDQUFDLGdCQUFnQixFQUFFO3dCQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLGdFQUFnRSxDQUFDLENBQUM7cUJBQ25GO29CQUNELEtBQUksQ0FBQyxnQ0FBZ0MsQ0FDakMsVUFBVSxFQUFFLGVBQWUsRUFBRSxtQkFBbUIsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDbkUsQ0FBQyxDQUFDLENBQUM7WUFDVCxDQUFDLENBQUM7aUJBQ0QsS0FBSyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxFQUE3QixDQUE2QixDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVELCtDQUFjLEdBQWQsVUFBZSxLQUFjO1lBQzNCLGtEQUFrRDtZQUNsRCxxQkFBcUI7WUFDckIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN2RixDQUFDO1FBRUQscUNBQUksR0FBSixVQUFLLFVBTUM7WUFORCwyQkFBQSxFQUFBLGVBTUM7WUFDSixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxLQUFLLEtBQUssRUFBRTtnQkFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO2FBQzdEO1lBQ0QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFTyw2Q0FBWSxHQUFwQixVQUFxQixFQVlmOztZQVpOLGlCQW9MQztnQkFwTG9CLHFCQVlqQixFQUFFLEtBQUEsRUFYSixpQkFBNkIsRUFBN0IsU0FBUyxtQkFBRyxlQUFTLENBQUMsT0FBTyxLQUFBLEVBQzdCLGlCQUFpQix1QkFBQSxFQUNqQixrQkFBa0Isd0JBQUEsRUFDbEIsb0JBQWtDLEVBQWxDLFlBQVksbUJBQUcsbUJBQW1CLEtBQUEsRUFDbEMsZ0NBQTJDLEVBQTNDLHdCQUF3QixtQkFBRyxnQkFBZ0IsS0FBQTtZQVEzQyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDN0IsSUFBSSxTQUFTLEdBQUcsZUFBUyxDQUFDLFVBQVUsRUFBRTtnQkFDcEMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDO2dCQUNsRCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUM7Z0JBQzlDLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQztnQkFDbEQsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUM3RSxXQUFXLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDNUQ7WUFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsZUFBUyxDQUFDLEVBQUUsR0FBRyxlQUFTLENBQUMsR0FBRyxHQUFHLGVBQVMsQ0FBQyxRQUFRLEdBQUcsZUFBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyRixDQUFDLEVBQUU7Z0JBQ0wsT0FBTyxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFDLENBQUM7YUFDL0Q7WUFDRyxJQUFBLEtBQXVCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsRUFBMUQsUUFBUSxjQUFBLEVBQUUsUUFBUSxjQUF3QyxDQUFDO1lBQ2hFLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRTtnQkFDbkIsT0FBTztvQkFDTCxXQUFXLEVBQUUsUUFBUTtvQkFDckIsV0FBVyxFQUFFLElBQUk7b0JBQ2pCLFlBQVksRUFBRSxFQUFFO2lCQUNqQixDQUFDO2FBQ0g7WUFDRCxJQUFJLENBQUMscUJBQXFCLEdBQUcsUUFBUSxDQUFDO1lBQ3RDLElBQU0sYUFBYSxHQUE0RCxFQUFFLENBQUM7WUFDbEYsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztZQUMzRCxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQWxELENBQWtELENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsdUJBQXVCLEdBQUcsRUFBRSxDQUFDO1lBQ2xDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxFQUFFLENBQUM7WUFDbEMsSUFBTSxrQkFBa0IsR0FBRyxFQUFxQixDQUFDO1lBQ2pELElBQU0sV0FBVyxHQUNiLFVBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxPQUFRLEVBQUUsV0FBWTtnQkFDL0QsSUFBTSxVQUFVLEdBQUcsV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDbEYsSUFBSSxPQUFnQyxDQUFDO2dCQUNyQyxJQUFJLFVBQVUsRUFBRTtvQkFDZCxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxVQUFVLFlBQUEsRUFBQyxDQUFDLENBQUM7b0JBQzNELE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNyRCxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixJQUFJLENBQUMsc0JBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO3dCQUMvRSx3RUFBd0U7d0JBQ3hFLElBQU0sWUFBWSxHQUFHLEtBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDdkUsSUFBSSxZQUFZLEVBQUU7NEJBQ2hCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzt5QkFDdkM7cUJBQ0Y7aUJBQ0Y7Z0JBQ0QsS0FBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDMUYsQ0FBQyxDQUFDO1lBRU4sSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLG9CQUFvQjtnQkFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUVwRSxJQUFNLG9CQUFvQixHQUN0QixJQUFJLENBQUMsbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDN0UsSUFBTSxnQkFBZ0IsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLGVBQVMsQ0FBQyxHQUFHLEdBQUcsZUFBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksZUFBUyxDQUFDLEdBQUcsQ0FBQztZQUN2Riw0RUFBNEU7WUFDNUUsaUNBQWlDO1lBQ2pDLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQWtELENBQUM7O2dCQUN0RixLQUF5QixJQUFBLEtBQUEsaUJBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQSxnQkFBQSw0QkFBRTtvQkFBckQsSUFBTSxVQUFVLFdBQUE7b0JBQ25CLElBQU0sa0JBQWtCLEdBQUcscUNBQXFCLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQzdELElBQUksa0JBQWtCLEVBQUU7d0JBQ3RCLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDO3dCQUNoRSxVQUFVLENBQUMsZUFBZSxHQUFHLGtCQUFrQixDQUFDO3FCQUNqRDtpQkFDRjs7Ozs7Ozs7O1lBQ0QsSUFBTSxVQUFVLEdBQW9CLEVBQUUsQ0FBQztZQUN2QyxJQUFNLFlBQVksR0FBb0IsRUFBRSxDQUFDO1lBQ3pDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxFQUFFO2dCQUNqQixJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUU7b0JBQ1osVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDckI7Z0JBQ0QsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFO29CQUNiLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3ZCO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLFVBQXlCLENBQUM7WUFDOUIsSUFBSSxrQkFBMEIsQ0FBQztZQUMvQixJQUFJO2dCQUNGLElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQ3ZELElBQUksaUJBQWlCO29CQUNqQixDQUFDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsbUNBQW1DLEVBQUU7b0JBQ3hGLElBQU0sZUFBZSxrRUFDYixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxFQUFFLENBQUMsUUFBUSxFQUFYLENBQVcsQ0FBQyxtQkFBSyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsRUFBRSxJQUFJLE9BQUEsRUFBRSxDQUFDLFVBQVUsRUFBYixDQUFhLENBQUMsRUFBQyxDQUFDO29CQUMxRixVQUFVLEdBQUcsd0JBQXdCLENBQ2pDLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBQyxRQUFRLElBQUssT0FBQSxVQUFVLEdBQUcsWUFBWSxDQUFDO3dCQUN0QyxPQUFPLEVBQUUsS0FBSSxDQUFDLFNBQVM7d0JBQ3ZCLElBQUksRUFBRSxLQUFJLENBQUMsSUFBSTt3QkFDZixPQUFPLEVBQUUsS0FBSSxDQUFDLE9BQU87d0JBQ3JCLFNBQVMsRUFBRSxXQUFXO3dCQUN0QixnQkFBZ0Isa0JBQUE7d0JBQ2hCLGtCQUFrQixFQUFFLG9CQUFvQjt3QkFDeEMsZ0JBQWdCLEVBQUUsS0FBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO3FCQUN6RCxDQUFDLEVBUlksQ0FRWixDQUFDLENBQUMsQ0FBQztvQkFDN0Isa0JBQWtCLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDO2lCQUMvQztxQkFBTTtvQkFDTCxVQUFVLEdBQUcsWUFBWSxDQUFDO3dCQUN4QixPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVM7d0JBQ3ZCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTt3QkFDZixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87d0JBQ3JCLFNBQVMsRUFBRSxXQUFXO3dCQUN0QixnQkFBZ0Isa0JBQUE7d0JBQ2hCLGtCQUFrQixFQUFFLG9CQUFvQjtxQkFDekMsQ0FBQyxDQUFDO29CQUNILGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7aUJBQ2pGO2FBQ0Y7b0JBQVM7O29CQUNSLHdFQUF3RTtvQkFDeEUseUVBQXlFO29CQUN6RSxLQUF1QyxJQUFBLEtBQUEsaUJBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBLGdCQUFBLDRCQUFFO3dCQUE3RCxJQUFBLEtBQUEsMkJBQXdCLEVBQXZCLFVBQVUsUUFBQSxFQUFFLFVBQVUsUUFBQTt3QkFDaEMsNERBQTREO3dCQUMzRCxVQUFrQixDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUM7cUJBQ2xEOzs7Ozs7Ozs7YUFDRjtZQUNELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQztZQUU3Qyx5RUFBeUU7WUFDekUsd0VBQXdFO1lBQ3hFLHdDQUF3QztZQUN4QyxJQUFJLFVBQVUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsS0FBSyxJQUFJLEVBQUU7Z0JBQ3JELHVEQUF1RDtnQkFDdkQsSUFBTSxtQkFBbUIsR0FBRyw0Q0FBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDM0YsVUFBVSxDQUFDLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUNsRCxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyx1QkFBZ0IsQ0FBQyxDQUFDLENBQUM7YUFDdEY7WUFFRCxJQUFJLFVBQVUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3ZDLHNFQUFzRTtnQkFDdEUsVUFBVSxDQUFDLFdBQVc7b0JBQ2xCLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsOEJBQXVCLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xGLE9BQU8sVUFBVSxDQUFDO2FBQ25CO1lBRUQsSUFBSSxpQkFBbUMsQ0FBQztZQUN4QyxJQUFJLGlCQUFtQyxDQUFDO1lBQ3hDLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRTtnQkFDeEIsaUJBQWlCLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7Z0JBQ3pELGlCQUFpQixHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7YUFDbEQ7WUFDRCxJQUFNLFlBQVksR0FDZCx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3hGLElBQUksU0FBUyxHQUFHLGVBQVMsQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pDLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBQSxFQUFFO29CQUNyQixJQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNoRCxLQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsTUFBTyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ2hFLENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFDRCxJQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQztZQUMxQixJQUFJLFNBQVMsR0FBRyxlQUFTLENBQUMsUUFBUSxFQUFFO2dCQUNsQyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUU7b0JBQ3hDLElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLElBQUksQ0FBQyxzQkFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUU7d0JBQy9ELGlCQUFpQixFQUFFLENBQUM7d0JBQ3BCLElBQU0sUUFBUSxHQUFHLEtBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUNwRCxJQUFJLFFBQVEsRUFBRTs0QkFDWixJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs0QkFDaEQsSUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7NEJBQ25GLEtBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7eUJBQzlFO3FCQUNGO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFDRCxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDM0IsSUFBSSxVQUFVLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7Z0JBQzFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyw4QkFBdUIsQ0FBQzt3QkFDOUUsaUJBQWMsT0FBTyxHQUFHLFNBQVMsUUFBSTt3QkFDckMsT0FBSyxrQkFBa0IsbUJBQWdCO3dCQUN2QyxPQUFLLFVBQVUsQ0FBQyxNQUFNLHdCQUFxQjt3QkFDM0MsUUFBSyxZQUFZLENBQUMsTUFBTSxHQUFHLGlCQUFpQiwyQkFBdUI7cUJBQ3BFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pCO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDcEIsQ0FBQztRQUdELHNCQUFZLDRDQUFRO1lBRHBCLGtCQUFrQjtpQkFDbEI7Z0JBQ0UsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7b0JBQ25CLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztpQkFDeEI7Z0JBQ0QsT0FBTyxJQUFJLENBQUMsU0FBVSxDQUFDO1lBQ3pCLENBQUM7OztXQUFBO1FBRUQsc0JBQVksK0NBQVc7aUJBQXZCO2dCQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO29CQUN0QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7aUJBQ3hCO2dCQUNELE9BQU8sSUFBSSxDQUFDLFlBQWEsQ0FBQztZQUM1QixDQUFDOzs7V0FBQTtRQUVELHNCQUFZLG1EQUFlO2lCQUEzQjtnQkFDRSxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO29CQUMxQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7aUJBQ2pCO2dCQUNELE9BQU8sSUFBSSxDQUFDLGdCQUFpQixDQUFDO1lBQ2hDLENBQUM7OztXQUFBO1FBRUQsc0JBQVkseURBQXFCO2lCQUFqQztnQkFDRSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2hCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDaEIsV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQyxzQkFBc0IsSUFBSSxFQUFFLENBQUMsQ0FBQztpQkFDakY7Z0JBQ0QsT0FBTyxXQUFXLENBQUM7WUFDckIsQ0FBQzs7O1dBQUE7UUFFRCxzQkFBWSw2Q0FBUztpQkFBckI7Z0JBQ0UsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7b0JBQ3BCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztpQkFDakI7Z0JBQ0QsT0FBTyxJQUFJLENBQUMsVUFBVyxDQUFDO1lBQzFCLENBQUM7OztXQUFBO1FBR0Qsc0JBQVksMERBQXNCO1lBRGxDLGlFQUFpRTtpQkFDakU7Z0JBQ0UsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEtBQUssSUFBSSxFQUFFO29CQUN6QyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztpQkFDckM7Z0JBQ0QsT0FBTyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsK0JBQW9CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzdFLENBQUM7OztXQUFBO1FBR08sb0RBQW1CLEdBQTNCLFVBQ0ksUUFBOEMsRUFBRSxjQUF5QyxFQUN6RixrQkFBdUM7WUFDekMsSUFBTSxRQUFRLEdBQWdELEVBQUUsQ0FBQztZQUNqRSxJQUFNLGtCQUFrQixHQUEwQixFQUFFLENBQUM7WUFDckQsSUFBTSw0QkFBNEIsR0FBMEIsRUFBRSxDQUFDO1lBQy9ELElBQU0sMEJBQTBCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsSUFBSSxLQUFLLENBQUM7WUFFcEYsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFO2dCQUN2QyxRQUFRLENBQUMsSUFBSSxDQUFDLHFEQUFrQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BGLElBQU0sV0FBVyxHQUFHLElBQUkscURBQWtDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUM3RSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3JDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUNoRDtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUFFO2dCQUMzQyxRQUFRLENBQUMsSUFBSSxDQUNULHlEQUFxQyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDM0Ysa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2FBQ3pEO1lBQ0QsSUFBSSxRQUFRLEVBQUU7Z0JBQ1osUUFBUSxDQUFDLElBQUksQ0FBQywwREFBaUMsQ0FDM0MsUUFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDLENBQUM7YUFDakU7WUFDRCxJQUFJLGNBQWMsRUFBRTtnQkFDbEIsUUFBUSxDQUFDLElBQUksQ0FBQyxnREFBaUMsQ0FBQyxjQUFjLEVBQUUsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO2dCQUU3RiwyRkFBMkY7Z0JBQzNGLGlDQUFpQztnQkFDakMsSUFBTSxXQUFXLEdBQUcsSUFBSSx3REFBZ0MsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDekUsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNyQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDaEQ7WUFFRCxJQUFJLGtCQUFrQixJQUFJLGtCQUFrQixDQUFDLFFBQVEsRUFBRTtnQkFDckQsUUFBUSxDQUFDLElBQUksT0FBYixRQUFRLDJDQUFTLGtCQUFrQixDQUFDLFFBQVEsSUFBRTthQUMvQztZQUVELHFGQUFxRjtZQUNyRixzRkFBc0Y7WUFDdEYscUZBQXFGO1lBQ3JGLHFGQUFxRjtZQUNyRixxRUFBcUU7WUFDckUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsS0FBSyxZQUFZLEVBQUU7Z0JBQy9DLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDekQsSUFBTSxjQUFjLEdBQUcsSUFBSSxxQ0FBd0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDakUsa0ZBQWtGO2dCQUNsRiw0RUFBNEU7Z0JBQzVFLHVFQUF1RTtnQkFDdkUsUUFBUSxDQUFDLElBQUksQ0FBQyxnRUFBK0IsQ0FDekMsV0FBVyxFQUFFLGNBQWMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixFQUFFLDBCQUEwQjtnQkFDeEYseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUN2QztZQUVELElBQUksa0JBQWtCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLENBQUMsQ0FBQzthQUNuRTtZQUNELElBQUksNEJBQTRCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDM0MsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2FBQ3ZGO1lBQ0QsSUFBTSxPQUFPLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQzVFLE9BQU8sRUFBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRU8seUNBQVEsR0FBaEI7WUFDRSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDekIsT0FBTzthQUNSO1lBQ0QsSUFBSTtnQkFDSSxJQUFBLEtBQWdELElBQUksQ0FBQyw0QkFBNEIsRUFBRSxFQUFsRixVQUFVLGdCQUFBLEVBQUUsV0FBVyxpQkFBQSxFQUFFLE9BQU8sYUFBQSxFQUFFLFNBQVMsZUFBdUMsQ0FBQztnQkFDcEYsSUFBQSxLQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsRUFEOUMsZUFBZSxxQkFBQSxFQUFFLG1CQUFtQix5QkFDVSxDQUFDO2dCQUN0RCxJQUFJLENBQUMsZ0NBQWdDLENBQ2pDLFVBQVUsRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDbEU7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDL0I7UUFDSCxDQUFDO1FBRU8sZ0RBQWUsR0FBdkI7WUFBQSxpQkFlQztZQWRDLElBQU0sT0FBTyxHQUFrQjtnQkFDN0IsWUFBWSxFQUFFLFVBQUMsV0FBVyxFQUFFLFlBQVk7b0JBQ3BDLE9BQUEsS0FBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQztnQkFBdkQsQ0FBdUQ7Z0JBQzNELHNCQUFzQixFQUFFLFVBQUMsUUFBUSxJQUFLLE9BQUEsS0FBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsRUFBL0MsQ0FBK0M7YUFDdEYsQ0FBQztZQUVGLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSx5REFBeUMsQ0FDN0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQ3BFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQ3JDLElBQU0sVUFBVSxHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RCxJQUFNLGNBQWMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7Z0JBQzFGLFVBQUMsR0FBUSxJQUFLLE9BQUEsS0FBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxFQUFuQyxDQUFtQyxDQUFDLENBQUM7Z0JBQ25ELFNBQVMsQ0FBQztZQUNkLElBQUksQ0FBQyxTQUFTLEdBQUcsNEJBQWlCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQzdGLENBQUM7UUFFTyw2REFBNEIsR0FBcEM7WUFBQSxpQkFtREM7WUE3Q0MsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQzthQUN6RDtZQUNELHdEQUF3RDtZQUN4RCxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO1lBRTlCLElBQU0sT0FBTyxHQUFrQjtnQkFDN0IsWUFBWSxFQUFFLFVBQUMsV0FBVyxFQUFFLFlBQVk7b0JBQ3BDLE9BQUEsS0FBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQztnQkFBdEQsQ0FBc0Q7Z0JBQzFELHNCQUFzQixFQUFFLFVBQUMsUUFBUSxJQUFLLE9BQUEsS0FBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsRUFBOUMsQ0FBOEM7YUFDckYsQ0FBQztZQUdGLElBQUksU0FBUyw0Q0FBTyxJQUFJLENBQUMsU0FBUyxFQUFDLENBQUM7WUFDcEMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLHdCQUF3QixLQUFLLEtBQUssRUFBRTtnQkFDbkQsdURBQXVEO2dCQUN2RCxzREFBc0Q7Z0JBQ3RELHNEQUFzRDtnQkFDdEQsdUVBQXVFO2dCQUN2RSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLENBQUMsc0JBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQXpCLENBQXlCLENBQUMsQ0FBQzthQUMvRDtZQUNELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUTtvQkFDN0IsSUFBSSxLQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxFQUFFO3dCQUNyRCxTQUFTLENBQUMsSUFBSSxPQUFkLFNBQVMsMkNBQVMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsSUFBRTtxQkFDbkU7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUVELElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUM3RixJQUFJLHlCQUF5QixLQUFLLElBQUksRUFBRTtnQkFDdEMseUJBQXlCLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDdkM7WUFDRCxJQUFNLFdBQVcsR0FBYSxFQUFFLENBQUM7WUFDakMsSUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1lBQzdCLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQSxFQUFFO2dCQUNwQyxJQUFJLEtBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDOUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQy9CO2dCQUNELElBQUksU0FBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDbEQsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzNCO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLEVBQUMsVUFBVSxZQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUUsU0FBUyxXQUFBLEVBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRU8saUVBQWdDLEdBQXhDLFVBQ0ksVUFBc0IsRUFBRSxlQUFrQyxFQUMxRCxtQkFBb0QsRUFBRSxTQUFtQjtZQUY3RSxpQkEwQkM7WUF2QkMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztZQUN4QyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsbUJBQW1CLENBQUM7WUFDaEQsVUFBVSxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUU7Z0JBQ3BDLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLEVBQUU7b0JBQ25DLElBQUEsS0FBMkIsS0FBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQTFFLFFBQVEsY0FBQSxFQUFFLFlBQVksa0JBQW9ELENBQUM7b0JBQ2xGLElBQUksUUFBUSxFQUFFO3dCQUNaLG9GQUFvRjt3QkFDcEYsMkJBQTJCO3dCQUMzQixJQUFNLE9BQU8sR0FBRyxLQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsWUFBYSxDQUFDLENBQUM7d0JBQzVFLElBQUksT0FBTyxFQUFFOzRCQUNYLEtBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7eUJBQy9DO3FCQUNGO2lCQUNGO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMxRiwyRUFBMkU7WUFDM0UsOENBQThDO1lBQzlDLDBGQUEwRjtZQUMxRixvQ0FBb0M7WUFDcEMsSUFBSSwwQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLHVCQUFpQyxFQUFFO2dCQUN6RSxNQUFNLElBQUksS0FBSyxDQUFDLHNFQUFzRSxDQUFDLENBQUM7YUFDekY7UUFDSCxDQUFDO1FBRU8sc0RBQXFCLEdBQTdCLFVBQThCLENBQU07WUFDbEMsbURBQW1EO1lBQ25ELHFGQUFxRjtZQUNyRixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO1lBQzlCLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxHQUFHLGNBQU0sT0FBQSxLQUFLLEVBQUwsQ0FBSyxDQUFDO1lBQzdDLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25GLElBQUksd0JBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxPQUFPO2FBQ1I7WUFDRCxNQUFNLENBQUMsQ0FBQztRQUNWLENBQUM7UUFFTywwREFBeUIsR0FBakMsVUFBa0MsS0FBWTtZQUM1QyxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsc0JBQXNCLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDdEYsSUFBSSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN4QixXQUFXLENBQUMsSUFBSSxPQUFoQixXQUFXLDJDQUFTLHdCQUF3QixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUU7YUFDdEU7aUJBQU07Z0JBQ0wsV0FBVyxDQUFDLElBQUksQ0FBQztvQkFDZixXQUFXLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRTtvQkFDN0IsUUFBUSxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLO29CQUNyQyxNQUFNLEVBQUUsWUFBTTtvQkFDZCxJQUFJLEVBQUUsd0JBQWtCO2lCQUN6QixDQUFDLENBQUM7YUFDSjtRQUNILENBQUM7UUFFRCxnREFBZ0Q7UUFDaEQsdUNBQXVDO1FBQy9CLHFEQUFvQixHQUE1QixVQUE2QixTQUFvQjtZQUFqRCxpQkFtQ0M7WUFqQ0MsSUFBSTtnQkFDRixJQUFJLENBQUMsQ0FBQyxTQUFTLEdBQUcsZUFBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNwQyxPQUFPLEVBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFDLENBQUM7aUJBQ3JDO2dCQUNELG1FQUFtRTtnQkFDbkUsc0RBQXNEO2dCQUN0RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO3FCQUMzQyxNQUFNLENBQUMsVUFBQSxPQUFPLElBQUksT0FBQSxrQkFBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsS0FBSSxDQUFDLE9BQU8sQ0FBQyxFQUE3QyxDQUE2QyxDQUFDLENBQUM7Z0JBQ3JGLElBQUksSUFBSSxDQUFDLCtCQUErQixFQUFFO29CQUN4QyxJQUFNLGlDQUErQixHQUFHLElBQUksQ0FBQywrQkFBK0IsQ0FBQztvQkFDN0UsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQSxPQUFPO3dCQUNoQyxJQUFNLFVBQVUsR0FBRyxpQ0FBK0IsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUMzRSxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDMUQsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7Z0JBQ0QsT0FBTyxFQUFDLFFBQVEsVUFBQSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUMsQ0FBQzthQUNqQztZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLHVFQUF1RTtnQkFDdkUseUZBQXlGO2dCQUN6RixJQUFJLHdCQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3BCLElBQU0sUUFBUSxHQUFvQixDQUFDOzRCQUNqQyxJQUFJLEVBQUUsU0FBUzs0QkFDZixLQUFLLEVBQUUsU0FBUzs0QkFDaEIsTUFBTSxFQUFFLFNBQVM7NEJBQ2pCLFdBQVcsRUFBRSxDQUFDLENBQUMsT0FBTzs0QkFDdEIsUUFBUSxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLOzRCQUNyQyxNQUFNLEVBQUUsWUFBTTs0QkFDZCxJQUFJLEVBQUUsd0JBQWtCO3lCQUN6QixDQUFDLENBQUM7b0JBQ0gsT0FBTyxFQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsUUFBUSxVQUFBLEVBQUMsQ0FBQztpQkFDakM7Z0JBQ0QsTUFBTSxDQUFDLENBQUM7YUFDVDtRQUNILENBQUM7UUFFRDs7V0FFRztRQUNLLHNEQUFxQixHQUE3QjtZQUFBLGlCQWFDO1lBWkMsNERBQTREO1lBQzVELDZDQUE2QztZQUM3QyxJQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQUEsRUFBRTtnQkFDL0QsT0FBTyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLHNCQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyRSxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksSUFBSSxDQUFDLDRCQUE0QixFQUFFO2dCQUNyQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsVUFBQSxFQUFFO29CQUM3QyxJQUFNLE9BQU8sR0FBRyxLQUFJLENBQUMsNEJBQTZCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDcEUsT0FBTyxFQUFFLEtBQUssT0FBTyxDQUFDO2dCQUN4QixDQUFDLENBQUMsQ0FBQzthQUNKO1lBQ0QsT0FBTyxpQkFBaUIsQ0FBQztRQUMzQixDQUFDO1FBRU8sMENBQVMsR0FBakIsVUFDSSxXQUFtQixFQUFFLE9BQWUsRUFBRSxrQkFBMkIsRUFDakUsT0FBbUMsRUFBRSxPQUF1QixFQUM1RCxXQUEwQztZQUM1QyxrQ0FBa0M7WUFDbEMsSUFBSSxRQUFpQyxDQUFDO1lBQ3RDLElBQUksT0FBTyxFQUFFO2dCQUNYLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzVELElBQUksUUFBUSxFQUFFO29CQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUU7d0JBQ2pDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxFQUFFLENBQUM7cUJBQ25DO29CQUNELElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDekYsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQzs0QkFDaEMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFROzRCQUMzQixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7NEJBQ25CLFVBQVUsRUFBRSxRQUFRO3lCQUNyQixDQUFDLENBQUM7d0JBQ0gsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO3dCQUNqRixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7NEJBQzdCLDZFQUE2RTs0QkFDN0UsMEVBQTBFOzRCQUMxRSxJQUFNLFlBQVksR0FDZCxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLEdBQUcsaUJBQWlCLENBQUM7NEJBQ3hGLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDO3lCQUN2RTtxQkFDRjt5QkFBTSxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQy9FLElBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO3dCQUN2RSxrRkFBa0Y7d0JBQ2xGLCtDQUErQzt3QkFDL0MsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztxQkFDakY7aUJBQ0Y7YUFDRjtZQUNELGdFQUFnRTtZQUNoRSxtRUFBbUU7WUFDbkUsb0VBQW9FO1lBQ3BFLG9FQUFvRTtZQUNwRSx3RUFBd0U7WUFDeEUsSUFBTSxXQUFXLEdBQUcsc0JBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdEQsSUFBSSxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQjtnQkFDbkQsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzlELE9BQU87YUFDUjtZQUNELElBQUksUUFBUSxFQUFFO2dCQUNaLFdBQVcsR0FBRyxXQUFXLENBQUMsQ0FBQyxnRUFBSyxXQUFXLEtBQUUsUUFBUSxHQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3JFO1lBQ0QsbURBQW1EO1lBQ25ELElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLFdBQWtCLENBQUMsQ0FBQztRQUM3RixDQUFDO1FBQ0gsNkJBQUM7SUFBRCxDQUFDLEFBNXRCRCxJQTR0QkM7SUFHRCxTQUFnQixhQUFhLENBQUMsRUFLN0I7WUFMOEIsU0FBUyxlQUFBLEVBQUUsT0FBTyxhQUFBLEVBQUUsSUFBSSxVQUFBLEVBQUUsVUFBVSxnQkFBQTtRQU1qRSxJQUFJLE9BQU8sQ0FBQyxTQUFTLEtBQUssS0FBSyxFQUFFO1lBQy9CLE9BQU8sSUFBSSxzQkFBWSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQXNDLENBQUMsQ0FBQztTQUMzRjthQUFNO1lBQ0wsT0FBTyxJQUFJLHNCQUFzQixDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQ3pFO0lBQ0gsQ0FBQztJQVhELHNDQVdDO0lBRUQsa0NBQWtDO0lBQ2xDLFNBQVMscUJBQXFCLENBQUMsT0FBd0I7UUFDckQsSUFBSSxrQkFBa0IsR0FBRyxlQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDO1FBRWpFLFFBQVEsT0FBTyxDQUFDLHlCQUF5QixFQUFFO1lBQ3pDLEtBQUssUUFBUTtnQkFDWCxrQkFBa0IsR0FBRyxlQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDO2dCQUM1RCxNQUFNO1lBQ1IsS0FBSyxPQUFPO2dCQUNWLGtCQUFrQixHQUFHLGVBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUM7Z0JBQzNELE1BQU07U0FDVDtRQUVELElBQUksWUFBWSxHQUFXLEVBQUUsQ0FBQztRQUU5QixJQUFJLE9BQU8sQ0FBQyxVQUFVLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUU7Z0JBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQXlCLE9BQU8sQ0FBQyxVQUFVLCtCQUE0QixDQUFDLENBQUM7YUFDMUY7WUFDRCxZQUFZLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzVEO2FBQU07WUFDTCxrREFBa0Q7WUFDbEQscURBQXFEO1lBQ3JELGtCQUFrQixHQUFHLGVBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUM7U0FDN0Q7UUFFRCxPQUFPO1lBQ0wsTUFBTSxFQUFFLE9BQU8sQ0FBQyxZQUFZO1lBQzVCLFVBQVUsRUFBRSxPQUFPLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxhQUFhO1lBQ3pELGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxrQkFBa0I7WUFDOUMsWUFBWSxjQUFBO1lBQ1osa0JBQWtCLG9CQUFBO1lBQ2xCLHFCQUFxQixFQUFFLE9BQU8sQ0FBQyxxQkFBcUI7WUFDcEQsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLG1CQUFtQjtZQUNoRCxxQkFBcUIsRUFBRSxPQUFPLENBQUMscUJBQXFCO1lBQ3BELHNCQUFzQixFQUFFLE9BQU8sQ0FBQyxzQkFBc0I7WUFDdEQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO1lBQzVCLG9DQUFvQyxFQUFFLE9BQU8sQ0FBQyxvQ0FBb0M7U0FDbkYsQ0FBQztJQUNKLENBQUM7SUFFRCxTQUFTLHNCQUFzQixDQUFDLE9BQXdCO1FBQ3RELElBQUksT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUN6QixRQUFRLE9BQU8sQ0FBQyxhQUFhLEVBQUU7Z0JBQzdCLEtBQUssWUFBWSxDQUFDO2dCQUNsQixLQUFLLGVBQWU7b0JBQ2xCLE1BQU07Z0JBQ1I7b0JBQ0UsT0FBTyxDQUFDOzRCQUNOLFdBQVcsRUFDUCx5RkFBeUY7NEJBQzdGLFFBQVEsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsS0FBSzs0QkFDckMsTUFBTSxFQUFFLFlBQU07NEJBQ2QsSUFBSSxFQUFFLHdCQUFrQjt5QkFDekIsQ0FBQyxDQUFDO2FBQ047U0FDRjtRQUNELE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVELFNBQVMsbUJBQW1CLENBQUMsSUFBWTtRQUN2QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSCxTQUFnQix3QkFBd0IsQ0FDcEMsTUFBd0IsRUFBRSxpQkFBbUMsRUFDN0QsaUJBQW1DLEVBQUUsSUFJN0I7UUFKNkIscUJBQUEsRUFBQSxXQUk3QjtRQUNWLElBQUksTUFBTSxFQUFFO1lBQ1YsSUFBSSxNQUFJLEdBQU8sRUFBRSxDQUFDLENBQUUsc0RBQXNEO1lBQzFFLElBQUksaUJBQWlCLElBQUksSUFBSSxJQUFJLGlCQUFpQixJQUFJLElBQUksRUFBRTtnQkFDMUQsTUFBTSxJQUFJLEtBQUssQ0FBQywwRUFBMEUsQ0FBQyxDQUFDO2FBQzdGO1lBQ0QsSUFBTSxVQUFVLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDeEUsSUFBTSxVQUFVLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDeEUsSUFBSSxVQUFVLEtBQUssVUFBVSxFQUFFO2dCQUM3QixPQUFPLFVBQUMsV0FBVyxJQUFLLE9BQUEsV0FBVyxFQUFYLENBQVcsQ0FBQzthQUNyQztZQUNELHdDQUF3QztZQUN4QyxlQUFlO1lBQ2YsSUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxJQUFNLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0RixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQztnQkFDcEQsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3hGLENBQUMsRUFBRSxDQUFDO1lBQ04sSUFBTSxTQUFPLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdkUsT0FBTyxVQUFDLFdBQVc7Z0JBQ2pCLDBGQUEwRjtnQkFDMUYsdUZBQXVGO2dCQUN2RixrRUFBa0U7Z0JBQ2xFLE9BQU8sbUJBQW1CLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFPLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQztTQUNIO2FBQU07WUFDTCwyRkFBMkY7WUFDM0YsaUZBQWlGO1lBQ2pGLDREQUE0RDtZQUM1RCxPQUFPLFVBQUMsV0FBVyxJQUFLLE9BQUEsbUJBQW1CLENBQUMsV0FBVyxDQUFDLEVBQWhDLENBQWdDLENBQUM7U0FDMUQ7SUFDSCxDQUFDO0lBdENELDREQXNDQztJQUVELFNBQWdCLFdBQVcsQ0FDdkIsVUFBdUIsRUFBRSxPQUFvQixFQUFFLElBQXFCLEVBQUUsT0FBd0IsRUFDOUYsTUFBcUI7UUFDdkIsVUFBVSxHQUFHLFVBQVUsSUFBSSxLQUFLLENBQUM7UUFDakMsOENBQThDO1FBQzlDLElBQU0sR0FBRyxHQUFHLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pDLElBQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNELElBQU0sT0FBTyxHQUFHLE9BQU8sSUFBSSxjQUFZLEdBQUssQ0FBQztRQUM3QyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLFFBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN2RCxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQVhELGtDQVdDO0lBRUQsU0FBZ0IsYUFBYSxDQUN6QixNQUFxQixFQUFFLFVBQWtCLEVBQUUsT0FBd0I7UUFDckUsSUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3hDLElBQUksVUFBc0IsQ0FBQztRQUUzQixRQUFRLE1BQU0sRUFBRTtZQUNkLEtBQUssS0FBSztnQkFDUixVQUFVLEdBQUcsSUFBSSxjQUFHLEVBQUUsQ0FBQztnQkFDdkIsTUFBTTtZQUNSLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxNQUFNO2dCQUNULFVBQVUsR0FBRyxJQUFJLGlCQUFNLEVBQUUsQ0FBQztnQkFDMUIsTUFBTTtZQUNSLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxPQUFPLENBQUM7WUFDYjtnQkFDRSxVQUFVLEdBQUcsSUFBSSxnQkFBSyxFQUFFLENBQUM7U0FDNUI7UUFFRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFwQkQsc0NBb0JDO0lBRUQsU0FBUyxpQkFBaUIsQ0FBQyxRQUFpQjtRQUMxQyx1RkFBdUY7UUFDdkYsT0FBTyxVQUFDLFVBQWtCO1lBQ3hCLFVBQVUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFDekUsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELFNBQWdCLGdCQUFnQixDQUFDLFVBQWtCO1FBQ2pELElBQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUV4QyxRQUFRLE1BQU0sRUFBRTtZQUNkLEtBQUssS0FBSztnQkFDUixPQUFPLEtBQUssQ0FBQztZQUNmLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxNQUFNLENBQUM7WUFDWixLQUFLLE9BQU8sQ0FBQztZQUNiLEtBQUssTUFBTSxDQUFDO1lBQ1osS0FBSyxRQUFRO2dCQUNYLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBdUIsVUFBVSxPQUFHLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBZkQsNENBZUM7SUFFRCxTQUFTLGdCQUFnQixDQUFDLFdBQTRCOztRQUNwRCxJQUFNLFdBQVcsR0FBb0IsRUFBRSxDQUFDO1FBQ3hDLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFNLFlBQVksR0FBYSxFQUFFLENBQUM7O1lBQ2xDLEtBQWlCLElBQUEsZ0JBQUEsaUJBQUEsV0FBVyxDQUFBLHdDQUFBLGlFQUFFO2dCQUF6QixJQUFNLEVBQUUsd0JBQUE7Z0JBQ1gsV0FBVyxDQUFDLElBQUksT0FBaEIsV0FBVywyQ0FBUyxFQUFFLENBQUMsV0FBVyxJQUFFO2dCQUNwQyxXQUFXLEdBQUcsV0FBVyxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUM7Z0JBQzVDLFlBQVksQ0FBQyxJQUFJLE9BQWpCLFlBQVksMkNBQVMsQ0FBQyxFQUFFLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxJQUFFO2FBQy9DOzs7Ozs7Ozs7UUFDRCxPQUFPLEVBQUMsV0FBVyxhQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUUsWUFBWSxjQUFBLEVBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsU0FBUyxzQkFBc0IsQ0FBQyxJQUFxQjtRQUNuRCwwRUFBMEU7UUFDMUUsNkZBQTZGO1FBQzdGLE9BQVEsRUFBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQVMsQ0FBQztJQUNqRixDQUFDO0lBRUQsU0FBUywwQkFBMEIsQ0FBQyxRQUFnQixFQUFFLE9BQW1CO1FBQ3ZFLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkQsSUFBSSxVQUFVO1lBQUUsT0FBTyxVQUFVLENBQUM7UUFFbEMsNEZBQTRGO1FBQzVGLHNGQUFzRjtRQUN0Riw2RkFBNkY7UUFDN0YsT0FBUSxFQUFDLFFBQVEsVUFBQSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQVMsQ0FBQztJQUN2QyxDQUFDO0lBR0QsU0FBUywyQ0FBMkMsQ0FBQyxLQUE0QjtRQUUvRSxPQUFPO1lBQ0wsV0FBVyxFQUFFLEtBQUssQ0FBQyxPQUFPO1lBQzFCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLDJDQUEyQyxDQUFDO1lBQy9FLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtTQUN6QixDQUFDO0lBQ0osQ0FBQztJQUVELFNBQVMsd0JBQXdCLENBQUMsS0FBWSxFQUFFLE9BQW1CO1FBQ2pFLElBQU0sWUFBWSxHQUFHLHlCQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0MsSUFBSSxZQUFZLElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRTtZQUN2QyxPQUFPLFlBQVksQ0FBQyxHQUFHLENBQWEsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDO2dCQUNKLFdBQVcsRUFBRSxDQUFDLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ2xDLElBQUksRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNwQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTtnQkFDMUIsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNO2dCQUMvQyxRQUFRLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEtBQUs7Z0JBQ3JDLE1BQU0sRUFBRSxZQUFNO2dCQUNkLElBQUksRUFBRSx3QkFBa0I7YUFDekIsQ0FBQyxFQVJHLENBUUgsQ0FBQyxDQUFDO1NBQ3pDO2FBQU0sSUFBSSwyQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNsQyxPQUFPLENBQUM7b0JBQ04sV0FBVyxFQUFFLEtBQUssQ0FBQyxPQUFPO29CQUMxQixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssSUFBSSwyQ0FBMkMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO29CQUM5RSxRQUFRLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEtBQUs7b0JBQ3JDLE1BQU0sRUFBRSxZQUFNO29CQUNkLElBQUksRUFBRSx3QkFBa0I7b0JBQ3hCLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUTtpQkFDekIsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxJQUFNLGlCQUFpQixHQUFHLDhDQUFtQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JFLElBQUksaUJBQWlCLEtBQUssSUFBSSxFQUFFO1lBQzlCLCtGQUErRjtZQUMvRiwrRkFBK0Y7WUFDL0Ysa0RBQWtEO1lBQ2xELElBQU0sYUFBYSxHQUNmLFdBQVcsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xGLElBQUksYUFBYSxLQUFLLElBQUksSUFBSSxhQUFhLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQzFELE9BQU8sQ0FBQzt3QkFDTixXQUFXLEVBQUUsbUJBQWlCLGlCQUFpQixDQUFDLFNBQVMsY0FDckQsaUJBQWlCOzZCQUNaLFFBQVEsMmRBT3hCO3dCQUNPLFFBQVEsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsS0FBSzt3QkFDckMsSUFBSSxFQUFFLHdCQUFrQjt3QkFDeEIsTUFBTSxFQUFFLFlBQU07cUJBQ2YsQ0FBQyxDQUFDO2FBQ0o7U0FDRjtRQUVELDhFQUE4RTtRQUM5RSxPQUFPLENBQUM7Z0JBQ04sV0FBVyxFQUFFLEtBQUssQ0FBQyxPQUFPO2dCQUMxQixRQUFRLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEtBQUs7Z0JBQ3JDLElBQUksRUFBRSx3QkFBa0I7Z0JBQ3hCLE1BQU0sRUFBRSxZQUFNO2FBQ2YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELFNBQVMsV0FBVyxDQUFDLE9BQW1CLEVBQUUsUUFBZ0IsRUFBRSxTQUFpQjs7UUFFM0UsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzQyxJQUFJLEVBQUUsS0FBSyxTQUFTLElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUU7WUFDN0MsT0FBTyxJQUFJLENBQUM7U0FDYjs7WUFDRCxLQUFtQixJQUFBLEtBQUEsaUJBQUEsRUFBRSxDQUFDLFVBQVUsQ0FBQSxnQkFBQSw0QkFBRTtnQkFBN0IsSUFBTSxJQUFJLFdBQUE7Z0JBQ2IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDaEMsU0FBUztpQkFDVjtnQkFDRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtvQkFDM0QsU0FBUztpQkFDVjtnQkFFRCxPQUFPLElBQUksQ0FBQzthQUNiOzs7Ozs7Ozs7UUFFRCxnREFBZ0Q7UUFDaEQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsU0FBUyxhQUFhLENBQUMsS0FBMEI7OztZQUMvQyxLQUFxQixJQUFBLEtBQUEsaUJBQUEsS0FBSyxDQUFDLE9BQU8sQ0FBQSxnQkFBQSw0QkFBRTtnQkFBL0IsSUFBTSxNQUFNLFdBQUE7Z0JBQ2YsSUFBSSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDckMsU0FBUztpQkFDVjtnQkFDRCxJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtvQkFDL0QsT0FBTyxJQUFJLENBQUM7aUJBQ2I7YUFDRjs7Ozs7Ozs7O1FBRUQsZ0NBQWdDO1FBQ2hDLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QW90Q29tcGlsZXIsIEFvdENvbXBpbGVyT3B0aW9ucywgY29yZSwgY3JlYXRlQW90Q29tcGlsZXIsIEZvcm1hdHRlZE1lc3NhZ2VDaGFpbiwgR2VuZXJhdGVkRmlsZSwgZ2V0TWlzc2luZ05nTW9kdWxlTWV0YWRhdGFFcnJvckRhdGEsIGdldFBhcnNlRXJyb3JzLCBpc0Zvcm1hdHRlZEVycm9yLCBpc1N5bnRheEVycm9yLCBNZXNzYWdlQnVuZGxlLCBOZ0FuYWx5emVkRmlsZVdpdGhJbmplY3RhYmxlcywgTmdBbmFseXplZE1vZHVsZXMsIFBhcnNlU291cmNlU3BhbiwgUGFydGlhbE1vZHVsZSwgU2VyaWFsaXplciwgWGxpZmYsIFhsaWZmMiwgWG1ifSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7dHJhbnNsYXRlRGlhZ25vc3RpY3N9IGZyb20gJy4uL2RpYWdub3N0aWNzL3RyYW5zbGF0ZV9kaWFnbm9zdGljcyc7XG5pbXBvcnQge2NyZWF0ZUJ1bmRsZUluZGV4SG9zdCwgTWV0YWRhdGFDb2xsZWN0b3J9IGZyb20gJy4uL21ldGFkYXRhJztcbmltcG9ydCB7aXNBbmd1bGFyQ29yZVBhY2thZ2V9IGZyb20gJy4uL25ndHNjL2NvcmUvc3JjL2NvbXBpbGVyJztcbmltcG9ydCB7Tmd0c2NQcm9ncmFtfSBmcm9tICcuLi9uZ3RzYy9wcm9ncmFtJztcbmltcG9ydCB7VHlwZVNjcmlwdFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi9uZ3RzYy9yZWZsZWN0aW9uJztcbmltcG9ydCB7dmVyaWZ5U3VwcG9ydGVkVHlwZVNjcmlwdFZlcnNpb259IGZyb20gJy4uL3R5cGVzY3JpcHRfc3VwcG9ydCc7XG5cbmltcG9ydCB7Q29tcGlsZXJIb3N0LCBDb21waWxlck9wdGlvbnMsIEN1c3RvbVRyYW5zZm9ybWVycywgREVGQVVMVF9FUlJPUl9DT0RFLCBEaWFnbm9zdGljLCBEaWFnbm9zdGljTWVzc2FnZUNoYWluLCBFbWl0RmxhZ3MsIExhenlSb3V0ZSwgTGlicmFyeVN1bW1hcnksIFByb2dyYW0sIFNPVVJDRSwgVHNFbWl0Q2FsbGJhY2ssIFRzTWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrfSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge0NvZGVHZW5lcmF0b3IsIGdldE9yaWdpbmFsUmVmZXJlbmNlcywgVHNDb21waWxlckFvdENvbXBpbGVyVHlwZUNoZWNrSG9zdEFkYXB0ZXJ9IGZyb20gJy4vY29tcGlsZXJfaG9zdCc7XG5pbXBvcnQge2dldERvd25sZXZlbERlY29yYXRvcnNUcmFuc2Zvcm19IGZyb20gJy4vZG93bmxldmVsX2RlY29yYXRvcnNfdHJhbnNmb3JtJztcbmltcG9ydCB7Z2V0SW5saW5lUmVzb3VyY2VzVHJhbnNmb3JtRmFjdG9yeSwgSW5saW5lUmVzb3VyY2VzTWV0YWRhdGFUcmFuc2Zvcm1lcn0gZnJvbSAnLi9pbmxpbmVfcmVzb3VyY2VzJztcbmltcG9ydCB7Z2V0RXhwcmVzc2lvbkxvd2VyaW5nVHJhbnNmb3JtRmFjdG9yeSwgTG93ZXJNZXRhZGF0YVRyYW5zZm9ybX0gZnJvbSAnLi9sb3dlcl9leHByZXNzaW9ucyc7XG5pbXBvcnQge01ldGFkYXRhQ2FjaGUsIE1ldGFkYXRhVHJhbnNmb3JtZXJ9IGZyb20gJy4vbWV0YWRhdGFfY2FjaGUnO1xuaW1wb3J0IHtnZXRBbmd1bGFyRW1pdHRlclRyYW5zZm9ybUZhY3Rvcnl9IGZyb20gJy4vbm9kZV9lbWl0dGVyX3RyYW5zZm9ybSc7XG5pbXBvcnQge1BhcnRpYWxNb2R1bGVNZXRhZGF0YVRyYW5zZm9ybWVyfSBmcm9tICcuL3IzX21ldGFkYXRhX3RyYW5zZm9ybSc7XG5pbXBvcnQge2dldEFuZ3VsYXJDbGFzc1RyYW5zZm9ybWVyRmFjdG9yeX0gZnJvbSAnLi9yM190cmFuc2Zvcm0nO1xuaW1wb3J0IHtjcmVhdGVNZXNzYWdlRGlhZ25vc3RpYywgRFRTLCBHRU5FUkFURURfRklMRVMsIGlzSW5Sb290RGlyLCBuZ1RvVHNEaWFnbm9zdGljLCBTdHJ1Y3R1cmVJc1JldXNlZCwgVFMsIHRzU3RydWN0dXJlSXNSZXVzZWR9IGZyb20gJy4vdXRpbCc7XG5cblxuLyoqXG4gKiBNYXhpbXVtIG51bWJlciBvZiBmaWxlcyB0aGF0IGFyZSBlbWl0YWJsZSB2aWEgY2FsbGluZyB0cy5Qcm9ncmFtLmVtaXRcbiAqIHBhc3NpbmcgaW5kaXZpZHVhbCB0YXJnZXRTb3VyY2VGaWxlcy5cbiAqL1xuY29uc3QgTUFYX0ZJTEVfQ09VTlRfRk9SX1NJTkdMRV9GSUxFX0VNSVQgPSAyMDtcblxuXG4vKipcbiAqIEZpZWxkcyB0byBsb3dlciB3aXRoaW4gbWV0YWRhdGEgaW4gcmVuZGVyMiBtb2RlLlxuICovXG5jb25zdCBMT1dFUl9GSUVMRFMgPSBbJ3VzZVZhbHVlJywgJ3VzZUZhY3RvcnknLCAnZGF0YScsICdpZCcsICdsb2FkQ2hpbGRyZW4nXTtcblxuLyoqXG4gKiBGaWVsZHMgdG8gbG93ZXIgd2l0aGluIG1ldGFkYXRhIGluIHJlbmRlcjMgbW9kZS5cbiAqL1xuY29uc3QgUjNfTE9XRVJfRklFTERTID0gWy4uLkxPV0VSX0ZJRUxEUywgJ3Byb3ZpZGVycycsICdpbXBvcnRzJywgJ2V4cG9ydHMnXTtcblxuLyoqXG4gKiBJbnN0YWxscyBhIGhhbmRsZXIgZm9yIHRlc3RpbmcgcHVycG9zZXMgdG8gYWxsb3cgaW5zcGVjdGlvbiBvZiB0aGUgdGVtcG9yYXJ5IHByb2dyYW0uXG4gKi9cbmxldCB0ZW1wUHJvZ3JhbUhhbmRsZXJGb3JUZXN0OiAoKHByb2dyYW06IHRzLlByb2dyYW0pID0+IHZvaWQpfG51bGwgPSBudWxsO1xuZXhwb3J0IGZ1bmN0aW9uIHNldFRlbXBQcm9ncmFtSGFuZGxlckZvclRlc3QoaGFuZGxlcjogKHByb2dyYW06IHRzLlByb2dyYW0pID0+IHZvaWQpOiB2b2lkIHtcbiAgdGVtcFByb2dyYW1IYW5kbGVyRm9yVGVzdCA9IGhhbmRsZXI7XG59XG5leHBvcnQgZnVuY3Rpb24gcmVzZXRUZW1wUHJvZ3JhbUhhbmRsZXJGb3JUZXN0KCk6IHZvaWQge1xuICB0ZW1wUHJvZ3JhbUhhbmRsZXJGb3JUZXN0ID0gbnVsbDtcbn1cblxuY29uc3QgZW1wdHlNb2R1bGVzOiBOZ0FuYWx5emVkTW9kdWxlcyA9IHtcbiAgbmdNb2R1bGVzOiBbXSxcbiAgbmdNb2R1bGVCeVBpcGVPckRpcmVjdGl2ZTogbmV3IE1hcCgpLFxuICBmaWxlczogW11cbn07XG5cbmNvbnN0IGRlZmF1bHRFbWl0Q2FsbGJhY2s6IFRzRW1pdENhbGxiYWNrID0gKHtcbiAgcHJvZ3JhbSxcbiAgdGFyZ2V0U291cmNlRmlsZSxcbiAgd3JpdGVGaWxlLFxuICBjYW5jZWxsYXRpb25Ub2tlbixcbiAgZW1pdE9ubHlEdHNGaWxlcyxcbiAgY3VzdG9tVHJhbnNmb3JtZXJzXG59KSA9PlxuICAgIHByb2dyYW0uZW1pdChcbiAgICAgICAgdGFyZ2V0U291cmNlRmlsZSwgd3JpdGVGaWxlLCBjYW5jZWxsYXRpb25Ub2tlbiwgZW1pdE9ubHlEdHNGaWxlcywgY3VzdG9tVHJhbnNmb3JtZXJzKTtcblxuY2xhc3MgQW5ndWxhckNvbXBpbGVyUHJvZ3JhbSBpbXBsZW1lbnRzIFByb2dyYW0ge1xuICBwcml2YXRlIHJvb3ROYW1lczogc3RyaW5nW107XG4gIHByaXZhdGUgbWV0YWRhdGFDYWNoZTogTWV0YWRhdGFDYWNoZTtcbiAgLy8gTWV0YWRhdGEgY2FjaGUgdXNlZCBleGNsdXNpdmVseSBmb3IgdGhlIGZsYXQgbW9kdWxlIGluZGV4XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGZsYXRNb2R1bGVNZXRhZGF0YUNhY2hlITogTWV0YWRhdGFDYWNoZTtcbiAgcHJpdmF0ZSBsb3dlcmluZ01ldGFkYXRhVHJhbnNmb3JtOiBMb3dlck1ldGFkYXRhVHJhbnNmb3JtO1xuICBwcml2YXRlIG9sZFByb2dyYW1MaWJyYXJ5U3VtbWFyaWVzOiBNYXA8c3RyaW5nLCBMaWJyYXJ5U3VtbWFyeT58dW5kZWZpbmVkO1xuICBwcml2YXRlIG9sZFByb2dyYW1FbWl0dGVkR2VuZXJhdGVkRmlsZXM6IE1hcDxzdHJpbmcsIEdlbmVyYXRlZEZpbGU+fHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBvbGRQcm9ncmFtRW1pdHRlZFNvdXJjZUZpbGVzOiBNYXA8c3RyaW5nLCB0cy5Tb3VyY2VGaWxlPnx1bmRlZmluZWQ7XG4gIC8vIE5vdGU6IFRoaXMgd2lsbCBiZSBjbGVhcmVkIG91dCBhcyBzb29uIGFzIHdlIGNyZWF0ZSB0aGUgX3RzUHJvZ3JhbVxuICBwcml2YXRlIG9sZFRzUHJvZ3JhbTogdHMuUHJvZ3JhbXx1bmRlZmluZWQ7XG4gIHByaXZhdGUgZW1pdHRlZExpYnJhcnlTdW1tYXJpZXM6IExpYnJhcnlTdW1tYXJ5W118dW5kZWZpbmVkO1xuICBwcml2YXRlIGVtaXR0ZWRHZW5lcmF0ZWRGaWxlczogR2VuZXJhdGVkRmlsZVtdfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBlbWl0dGVkU291cmNlRmlsZXM6IHRzLlNvdXJjZUZpbGVbXXx1bmRlZmluZWQ7XG5cbiAgLy8gTGF6aWx5IGluaXRpYWxpemVkIGZpZWxkc1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfY29tcGlsZXIhOiBBb3RDb21waWxlcjtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2hvc3RBZGFwdGVyITogVHNDb21waWxlckFvdENvbXBpbGVyVHlwZUNoZWNrSG9zdEFkYXB0ZXI7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF90c1Byb2dyYW0hOiB0cy5Qcm9ncmFtO1xuICBwcml2YXRlIF9hbmFseXplZE1vZHVsZXM6IE5nQW5hbHl6ZWRNb2R1bGVzfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBfYW5hbHl6ZWRJbmplY3RhYmxlczogTmdBbmFseXplZEZpbGVXaXRoSW5qZWN0YWJsZXNbXXx1bmRlZmluZWQ7XG4gIHByaXZhdGUgX3N0cnVjdHVyYWxEaWFnbm9zdGljczogRGlhZ25vc3RpY1tdfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBfcHJvZ3JhbVdpdGhTdHViczogdHMuUHJvZ3JhbXx1bmRlZmluZWQ7XG4gIHByaXZhdGUgX29wdGlvbnNEaWFnbm9zdGljczogRGlhZ25vc3RpY1tdID0gW107XG4gIHByaXZhdGUgX3RyYW5zZm9ybVRzRGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcm9vdE5hbWVzOiBSZWFkb25seUFycmF5PHN0cmluZz4sIHByaXZhdGUgb3B0aW9uczogQ29tcGlsZXJPcHRpb25zLFxuICAgICAgcHJpdmF0ZSBob3N0OiBDb21waWxlckhvc3QsIG9sZFByb2dyYW0/OiBQcm9ncmFtKSB7XG4gICAgdGhpcy5yb290TmFtZXMgPSBbLi4ucm9vdE5hbWVzXTtcblxuICAgIGlmICghb3B0aW9ucy5kaXNhYmxlVHlwZVNjcmlwdFZlcnNpb25DaGVjaykge1xuICAgICAgdmVyaWZ5U3VwcG9ydGVkVHlwZVNjcmlwdFZlcnNpb24oKTtcbiAgICB9XG5cbiAgICB0aGlzLm9sZFRzUHJvZ3JhbSA9IG9sZFByb2dyYW0gPyBvbGRQcm9ncmFtLmdldFRzUHJvZ3JhbSgpIDogdW5kZWZpbmVkO1xuICAgIGlmIChvbGRQcm9ncmFtKSB7XG4gICAgICB0aGlzLm9sZFByb2dyYW1MaWJyYXJ5U3VtbWFyaWVzID0gb2xkUHJvZ3JhbS5nZXRMaWJyYXJ5U3VtbWFyaWVzKCk7XG4gICAgICB0aGlzLm9sZFByb2dyYW1FbWl0dGVkR2VuZXJhdGVkRmlsZXMgPSBvbGRQcm9ncmFtLmdldEVtaXR0ZWRHZW5lcmF0ZWRGaWxlcygpO1xuICAgICAgdGhpcy5vbGRQcm9ncmFtRW1pdHRlZFNvdXJjZUZpbGVzID0gb2xkUHJvZ3JhbS5nZXRFbWl0dGVkU291cmNlRmlsZXMoKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5mbGF0TW9kdWxlT3V0RmlsZSkge1xuICAgICAgY29uc3Qge2hvc3Q6IGJ1bmRsZUhvc3QsIGluZGV4TmFtZSwgZXJyb3JzfSA9XG4gICAgICAgICAgY3JlYXRlQnVuZGxlSW5kZXhIb3N0KG9wdGlvbnMsIHRoaXMucm9vdE5hbWVzLCBob3N0LCAoKSA9PiB0aGlzLmZsYXRNb2R1bGVNZXRhZGF0YUNhY2hlKTtcbiAgICAgIGlmIChlcnJvcnMpIHtcbiAgICAgICAgdGhpcy5fb3B0aW9uc0RpYWdub3N0aWNzLnB1c2goLi4uZXJyb3JzLm1hcChlID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogZS5jYXRlZ29yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VUZXh0OiBlLm1lc3NhZ2VUZXh0IGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogU09VUkNFLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogREVGQVVMVF9FUlJPUl9DT0RFXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucm9vdE5hbWVzLnB1c2goaW5kZXhOYW1lISk7XG4gICAgICAgIHRoaXMuaG9zdCA9IGJ1bmRsZUhvc3Q7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5sb3dlcmluZ01ldGFkYXRhVHJhbnNmb3JtID1cbiAgICAgICAgbmV3IExvd2VyTWV0YWRhdGFUcmFuc2Zvcm0ob3B0aW9ucy5lbmFibGVJdnkgIT09IGZhbHNlID8gUjNfTE9XRVJfRklFTERTIDogTE9XRVJfRklFTERTKTtcbiAgICB0aGlzLm1ldGFkYXRhQ2FjaGUgPSB0aGlzLmNyZWF0ZU1ldGFkYXRhQ2FjaGUoW3RoaXMubG93ZXJpbmdNZXRhZGF0YVRyYW5zZm9ybV0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVNZXRhZGF0YUNhY2hlKHRyYW5zZm9ybWVyczogTWV0YWRhdGFUcmFuc2Zvcm1lcltdKSB7XG4gICAgcmV0dXJuIG5ldyBNZXRhZGF0YUNhY2hlKFxuICAgICAgICBuZXcgTWV0YWRhdGFDb2xsZWN0b3Ioe3F1b3RlZE5hbWVzOiB0cnVlfSksICEhdGhpcy5vcHRpb25zLnN0cmljdE1ldGFkYXRhRW1pdCxcbiAgICAgICAgdHJhbnNmb3JtZXJzKTtcbiAgfVxuXG4gIGdldExpYnJhcnlTdW1tYXJpZXMoKTogTWFwPHN0cmluZywgTGlicmFyeVN1bW1hcnk+IHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWFwPHN0cmluZywgTGlicmFyeVN1bW1hcnk+KCk7XG4gICAgaWYgKHRoaXMub2xkUHJvZ3JhbUxpYnJhcnlTdW1tYXJpZXMpIHtcbiAgICAgIHRoaXMub2xkUHJvZ3JhbUxpYnJhcnlTdW1tYXJpZXMuZm9yRWFjaCgoc3VtbWFyeSwgZmlsZU5hbWUpID0+IHJlc3VsdC5zZXQoZmlsZU5hbWUsIHN1bW1hcnkpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZW1pdHRlZExpYnJhcnlTdW1tYXJpZXMpIHtcbiAgICAgIHRoaXMuZW1pdHRlZExpYnJhcnlTdW1tYXJpZXMuZm9yRWFjaChcbiAgICAgICAgICAoc3VtbWFyeSwgZmlsZU5hbWUpID0+IHJlc3VsdC5zZXQoc3VtbWFyeS5maWxlTmFtZSwgc3VtbWFyeSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZ2V0RW1pdHRlZEdlbmVyYXRlZEZpbGVzKCk6IE1hcDxzdHJpbmcsIEdlbmVyYXRlZEZpbGU+IHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWFwPHN0cmluZywgR2VuZXJhdGVkRmlsZT4oKTtcbiAgICBpZiAodGhpcy5vbGRQcm9ncmFtRW1pdHRlZEdlbmVyYXRlZEZpbGVzKSB7XG4gICAgICB0aGlzLm9sZFByb2dyYW1FbWl0dGVkR2VuZXJhdGVkRmlsZXMuZm9yRWFjaChcbiAgICAgICAgICAoZ2VuRmlsZSwgZmlsZU5hbWUpID0+IHJlc3VsdC5zZXQoZmlsZU5hbWUsIGdlbkZpbGUpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZW1pdHRlZEdlbmVyYXRlZEZpbGVzKSB7XG4gICAgICB0aGlzLmVtaXR0ZWRHZW5lcmF0ZWRGaWxlcy5mb3JFYWNoKChnZW5GaWxlKSA9PiByZXN1bHQuc2V0KGdlbkZpbGUuZ2VuRmlsZVVybCwgZ2VuRmlsZSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZ2V0RW1pdHRlZFNvdXJjZUZpbGVzKCk6IE1hcDxzdHJpbmcsIHRzLlNvdXJjZUZpbGU+IHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgTWFwPHN0cmluZywgdHMuU291cmNlRmlsZT4oKTtcbiAgICBpZiAodGhpcy5vbGRQcm9ncmFtRW1pdHRlZFNvdXJjZUZpbGVzKSB7XG4gICAgICB0aGlzLm9sZFByb2dyYW1FbWl0dGVkU291cmNlRmlsZXMuZm9yRWFjaCgoc2YsIGZpbGVOYW1lKSA9PiByZXN1bHQuc2V0KGZpbGVOYW1lLCBzZikpO1xuICAgIH1cbiAgICBpZiAodGhpcy5lbWl0dGVkU291cmNlRmlsZXMpIHtcbiAgICAgIHRoaXMuZW1pdHRlZFNvdXJjZUZpbGVzLmZvckVhY2goKHNmKSA9PiByZXN1bHQuc2V0KHNmLmZpbGVOYW1lLCBzZikpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZ2V0VHNQcm9ncmFtKCk6IHRzLlByb2dyYW0ge1xuICAgIHJldHVybiB0aGlzLnRzUHJvZ3JhbTtcbiAgfVxuXG4gIGdldFRzT3B0aW9uRGlhZ25vc3RpY3MoY2FuY2VsbGF0aW9uVG9rZW4/OiB0cy5DYW5jZWxsYXRpb25Ub2tlbikge1xuICAgIHJldHVybiB0aGlzLnRzUHJvZ3JhbS5nZXRPcHRpb25zRGlhZ25vc3RpY3MoY2FuY2VsbGF0aW9uVG9rZW4pO1xuICB9XG5cbiAgZ2V0TmdPcHRpb25EaWFnbm9zdGljcyhjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VuKTogUmVhZG9ubHlBcnJheTxEaWFnbm9zdGljPiB7XG4gICAgcmV0dXJuIFsuLi50aGlzLl9vcHRpb25zRGlhZ25vc3RpY3MsIC4uLmdldE5nT3B0aW9uRGlhZ25vc3RpY3ModGhpcy5vcHRpb25zKV07XG4gIH1cblxuICBnZXRUc1N5bnRhY3RpY0RpYWdub3N0aWNzKHNvdXJjZUZpbGU/OiB0cy5Tb3VyY2VGaWxlLCBjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VuKTpcbiAgICAgIFJlYWRvbmx5QXJyYXk8dHMuRGlhZ25vc3RpYz4ge1xuICAgIHJldHVybiB0aGlzLnRzUHJvZ3JhbS5nZXRTeW50YWN0aWNEaWFnbm9zdGljcyhzb3VyY2VGaWxlLCBjYW5jZWxsYXRpb25Ub2tlbik7XG4gIH1cblxuICBnZXROZ1N0cnVjdHVyYWxEaWFnbm9zdGljcyhjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VuKTogUmVhZG9ubHlBcnJheTxEaWFnbm9zdGljPiB7XG4gICAgcmV0dXJuIHRoaXMuc3RydWN0dXJhbERpYWdub3N0aWNzO1xuICB9XG5cbiAgZ2V0VHNTZW1hbnRpY0RpYWdub3N0aWNzKHNvdXJjZUZpbGU/OiB0cy5Tb3VyY2VGaWxlLCBjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VuKTpcbiAgICAgIFJlYWRvbmx5QXJyYXk8dHMuRGlhZ25vc3RpYz4ge1xuICAgIGNvbnN0IHNvdXJjZUZpbGVzID0gc291cmNlRmlsZSA/IFtzb3VyY2VGaWxlXSA6IHRoaXMudHNQcm9ncmFtLmdldFNvdXJjZUZpbGVzKCk7XG4gICAgbGV0IGRpYWdzOiB0cy5EaWFnbm9zdGljW10gPSBbXTtcbiAgICBzb3VyY2VGaWxlcy5mb3JFYWNoKHNmID0+IHtcbiAgICAgIGlmICghR0VORVJBVEVEX0ZJTEVTLnRlc3Qoc2YuZmlsZU5hbWUpKSB7XG4gICAgICAgIGRpYWdzLnB1c2goLi4udGhpcy50c1Byb2dyYW0uZ2V0U2VtYW50aWNEaWFnbm9zdGljcyhzZiwgY2FuY2VsbGF0aW9uVG9rZW4pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGlhZ3M7XG4gIH1cblxuICBnZXROZ1NlbWFudGljRGlhZ25vc3RpY3MoZmlsZU5hbWU/OiBzdHJpbmcsIGNhbmNlbGxhdGlvblRva2VuPzogdHMuQ2FuY2VsbGF0aW9uVG9rZW4pOlxuICAgICAgUmVhZG9ubHlBcnJheTxEaWFnbm9zdGljPiB7XG4gICAgbGV0IGRpYWdzOiB0cy5EaWFnbm9zdGljW10gPSBbXTtcbiAgICB0aGlzLnRzUHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLmZvckVhY2goc2YgPT4ge1xuICAgICAgaWYgKEdFTkVSQVRFRF9GSUxFUy50ZXN0KHNmLmZpbGVOYW1lKSAmJiAhc2YuaXNEZWNsYXJhdGlvbkZpbGUpIHtcbiAgICAgICAgZGlhZ3MucHVzaCguLi50aGlzLnRzUHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKHNmLCBjYW5jZWxsYXRpb25Ub2tlbikpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IHtuZ30gPSB0cmFuc2xhdGVEaWFnbm9zdGljcyh0aGlzLmhvc3RBZGFwdGVyLCBkaWFncyk7XG4gICAgcmV0dXJuIG5nO1xuICB9XG5cbiAgbG9hZE5nU3RydWN0dXJlQXN5bmMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX2FuYWx5emVkTW9kdWxlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbmd1bGFyIHN0cnVjdHVyZSBhbHJlYWR5IGxvYWRlZCcpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHt0bXBQcm9ncmFtLCBzb3VyY2VGaWxlcywgdHNGaWxlcywgcm9vdE5hbWVzfSA9IHRoaXMuX2NyZWF0ZVByb2dyYW1XaXRoQmFzaWNTdHVicygpO1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBpbGVyLmxvYWRGaWxlc0FzeW5jKHNvdXJjZUZpbGVzLCB0c0ZpbGVzKVxuICAgICAgICAgICAgICAudGhlbigoe2FuYWx5emVkTW9kdWxlcywgYW5hbHl6ZWRJbmplY3RhYmxlc30pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fYW5hbHl6ZWRNb2R1bGVzKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FuZ3VsYXIgc3RydWN0dXJlIGxvYWRlZCBib3RoIHN5bmNocm9ub3VzbHkgYW5kIGFzeW5jaHJvbm91c2x5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVByb2dyYW1XaXRoVHlwZUNoZWNrU3R1YnMoXG4gICAgICAgICAgICAgICAgICAgIHRtcFByb2dyYW0sIGFuYWx5emVkTW9kdWxlcywgYW5hbHl6ZWRJbmplY3RhYmxlcywgcm9vdE5hbWVzKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChlID0+IHRoaXMuX2NyZWF0ZVByb2dyYW1PbkVycm9yKGUpKTtcbiAgfVxuXG4gIGxpc3RMYXp5Um91dGVzKHJvdXRlPzogc3RyaW5nKTogTGF6eVJvdXRlW10ge1xuICAgIC8vIE5vdGU6IERvbid0IGFuYWx5emVkTW9kdWxlcyBpZiBhIHJvdXRlIGlzIGdpdmVuXG4gICAgLy8gdG8gYmUgZmFzdCBlbm91Z2guXG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZXIubGlzdExhenlSb3V0ZXMocm91dGUsIHJvdXRlID8gdW5kZWZpbmVkIDogdGhpcy5hbmFseXplZE1vZHVsZXMpO1xuICB9XG5cbiAgZW1pdChwYXJhbWV0ZXJzOiB7XG4gICAgZW1pdEZsYWdzPzogRW1pdEZsYWdzLFxuICAgIGNhbmNlbGxhdGlvblRva2VuPzogdHMuQ2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgY3VzdG9tVHJhbnNmb3JtZXJzPzogQ3VzdG9tVHJhbnNmb3JtZXJzLFxuICAgIGVtaXRDYWxsYmFjaz86IFRzRW1pdENhbGxiYWNrLFxuICAgIG1lcmdlRW1pdFJlc3VsdHNDYWxsYmFjaz86IFRzTWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrLFxuICB9ID0ge30pOiB0cy5FbWl0UmVzdWx0IHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVuYWJsZUl2eSAhPT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHJ1biBsZWdhY3kgY29tcGlsZXIgaW4gbmd0c2MgbW9kZScpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZW1pdFJlbmRlcjIocGFyYW1ldGVycyk7XG4gIH1cblxuICBwcml2YXRlIF9lbWl0UmVuZGVyMih7XG4gICAgZW1pdEZsYWdzID0gRW1pdEZsYWdzLkRlZmF1bHQsXG4gICAgY2FuY2VsbGF0aW9uVG9rZW4sXG4gICAgY3VzdG9tVHJhbnNmb3JtZXJzLFxuICAgIGVtaXRDYWxsYmFjayA9IGRlZmF1bHRFbWl0Q2FsbGJhY2ssXG4gICAgbWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrID0gbWVyZ2VFbWl0UmVzdWx0cyxcbiAgfToge1xuICAgIGVtaXRGbGFncz86IEVtaXRGbGFncyxcbiAgICBjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VuLFxuICAgIGN1c3RvbVRyYW5zZm9ybWVycz86IEN1c3RvbVRyYW5zZm9ybWVycyxcbiAgICBlbWl0Q2FsbGJhY2s/OiBUc0VtaXRDYWxsYmFjayxcbiAgICBtZXJnZUVtaXRSZXN1bHRzQ2FsbGJhY2s/OiBUc01lcmdlRW1pdFJlc3VsdHNDYWxsYmFjayxcbiAgfSA9IHt9KTogdHMuRW1pdFJlc3VsdCB7XG4gICAgY29uc3QgZW1pdFN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICBpZiAoZW1pdEZsYWdzICYgRW1pdEZsYWdzLkkxOG5CdW5kbGUpIHtcbiAgICAgIGNvbnN0IGxvY2FsZSA9IHRoaXMub3B0aW9ucy5pMThuT3V0TG9jYWxlIHx8IG51bGw7XG4gICAgICBjb25zdCBmaWxlID0gdGhpcy5vcHRpb25zLmkxOG5PdXRGaWxlIHx8IG51bGw7XG4gICAgICBjb25zdCBmb3JtYXQgPSB0aGlzLm9wdGlvbnMuaTE4bk91dEZvcm1hdCB8fCBudWxsO1xuICAgICAgY29uc3QgYnVuZGxlID0gdGhpcy5jb21waWxlci5lbWl0TWVzc2FnZUJ1bmRsZSh0aGlzLmFuYWx5emVkTW9kdWxlcywgbG9jYWxlKTtcbiAgICAgIGkxOG5FeHRyYWN0KGZvcm1hdCwgZmlsZSwgdGhpcy5ob3N0LCB0aGlzLm9wdGlvbnMsIGJ1bmRsZSk7XG4gICAgfVxuICAgIGlmICgoZW1pdEZsYWdzICYgKEVtaXRGbGFncy5KUyB8IEVtaXRGbGFncy5EVFMgfCBFbWl0RmxhZ3MuTWV0YWRhdGEgfCBFbWl0RmxhZ3MuQ29kZWdlbikpID09PVxuICAgICAgICAwKSB7XG4gICAgICByZXR1cm4ge2VtaXRTa2lwcGVkOiB0cnVlLCBkaWFnbm9zdGljczogW10sIGVtaXR0ZWRGaWxlczogW119O1xuICAgIH1cbiAgICBsZXQge2dlbkZpbGVzLCBnZW5EaWFnc30gPSB0aGlzLmdlbmVyYXRlRmlsZXNGb3JFbWl0KGVtaXRGbGFncyk7XG4gICAgaWYgKGdlbkRpYWdzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlhZ25vc3RpY3M6IGdlbkRpYWdzLFxuICAgICAgICBlbWl0U2tpcHBlZDogdHJ1ZSxcbiAgICAgICAgZW1pdHRlZEZpbGVzOiBbXSxcbiAgICAgIH07XG4gICAgfVxuICAgIHRoaXMuZW1pdHRlZEdlbmVyYXRlZEZpbGVzID0gZ2VuRmlsZXM7XG4gICAgY29uc3Qgb3V0U3JjTWFwcGluZzogQXJyYXk8e3NvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIG91dEZpbGVOYW1lOiBzdHJpbmd9PiA9IFtdO1xuICAgIGNvbnN0IGdlbkZpbGVCeUZpbGVOYW1lID0gbmV3IE1hcDxzdHJpbmcsIEdlbmVyYXRlZEZpbGU+KCk7XG4gICAgZ2VuRmlsZXMuZm9yRWFjaChnZW5GaWxlID0+IGdlbkZpbGVCeUZpbGVOYW1lLnNldChnZW5GaWxlLmdlbkZpbGVVcmwsIGdlbkZpbGUpKTtcbiAgICB0aGlzLmVtaXR0ZWRMaWJyYXJ5U3VtbWFyaWVzID0gW107XG4gICAgdGhpcy5fdHJhbnNmb3JtVHNEaWFnbm9zdGljcyA9IFtdO1xuICAgIGNvbnN0IGVtaXR0ZWRTb3VyY2VGaWxlcyA9IFtdIGFzIHRzLlNvdXJjZUZpbGVbXTtcbiAgICBjb25zdCB3cml0ZVRzRmlsZTogdHMuV3JpdGVGaWxlQ2FsbGJhY2sgPVxuICAgICAgICAob3V0RmlsZU5hbWUsIG91dERhdGEsIHdyaXRlQnl0ZU9yZGVyTWFyaywgb25FcnJvcj8sIHNvdXJjZUZpbGVzPykgPT4ge1xuICAgICAgICAgIGNvbnN0IHNvdXJjZUZpbGUgPSBzb3VyY2VGaWxlcyAmJiBzb3VyY2VGaWxlcy5sZW5ndGggPT0gMSA/IHNvdXJjZUZpbGVzWzBdIDogbnVsbDtcbiAgICAgICAgICBsZXQgZ2VuRmlsZTogR2VuZXJhdGVkRmlsZXx1bmRlZmluZWQ7XG4gICAgICAgICAgaWYgKHNvdXJjZUZpbGUpIHtcbiAgICAgICAgICAgIG91dFNyY01hcHBpbmcucHVzaCh7b3V0RmlsZU5hbWU6IG91dEZpbGVOYW1lLCBzb3VyY2VGaWxlfSk7XG4gICAgICAgICAgICBnZW5GaWxlID0gZ2VuRmlsZUJ5RmlsZU5hbWUuZ2V0KHNvdXJjZUZpbGUuZmlsZU5hbWUpO1xuICAgICAgICAgICAgaWYgKCFzb3VyY2VGaWxlLmlzRGVjbGFyYXRpb25GaWxlICYmICFHRU5FUkFURURfRklMRVMudGVzdChzb3VyY2VGaWxlLmZpbGVOYW1lKSkge1xuICAgICAgICAgICAgICAvLyBOb3RlOiBzb3VyY2VGaWxlIGlzIHRoZSB0cmFuc2Zvcm1lZCBzb3VyY2VmaWxlLCBub3QgdGhlIG9yaWdpbmFsIG9uZSFcbiAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxGaWxlID0gdGhpcy50c1Byb2dyYW0uZ2V0U291cmNlRmlsZShzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsRmlsZSkge1xuICAgICAgICAgICAgICAgIGVtaXR0ZWRTb3VyY2VGaWxlcy5wdXNoKG9yaWdpbmFsRmlsZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy53cml0ZUZpbGUob3V0RmlsZU5hbWUsIG91dERhdGEsIHdyaXRlQnl0ZU9yZGVyTWFyaywgb25FcnJvciwgZ2VuRmlsZSwgc291cmNlRmlsZXMpO1xuICAgICAgICB9O1xuXG4gICAgY29uc3QgbW9kdWxlcyA9IHRoaXMuX2FuYWx5emVkSW5qZWN0YWJsZXMgJiZcbiAgICAgICAgdGhpcy5jb21waWxlci5lbWl0QWxsUGFydGlhbE1vZHVsZXMyKHRoaXMuX2FuYWx5emVkSW5qZWN0YWJsZXMpO1xuXG4gICAgY29uc3QgdHNDdXN0b21UcmFuc2Zvcm1lcnMgPVxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVRyYW5zZm9ybXMoZ2VuRmlsZUJ5RmlsZU5hbWUsIG1vZHVsZXMsIGN1c3RvbVRyYW5zZm9ybWVycyk7XG4gICAgY29uc3QgZW1pdE9ubHlEdHNGaWxlcyA9IChlbWl0RmxhZ3MgJiAoRW1pdEZsYWdzLkRUUyB8IEVtaXRGbGFncy5KUykpID09IEVtaXRGbGFncy5EVFM7XG4gICAgLy8gUmVzdG9yZSB0aGUgb3JpZ2luYWwgcmVmZXJlbmNlcyBiZWZvcmUgd2UgZW1pdCBzbyBUeXBlU2NyaXB0IGRvZXNuJ3QgZW1pdFxuICAgIC8vIGEgcmVmZXJlbmNlIHRvIHRoZSAuZC50cyBmaWxlLlxuICAgIGNvbnN0IGF1Z21lbnRlZFJlZmVyZW5jZXMgPSBuZXcgTWFwPHRzLlNvdXJjZUZpbGUsIFJlYWRvbmx5QXJyYXk8dHMuRmlsZVJlZmVyZW5jZT4+KCk7XG4gICAgZm9yIChjb25zdCBzb3VyY2VGaWxlIG9mIHRoaXMudHNQcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkpIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsUmVmZXJlbmNlcyA9IGdldE9yaWdpbmFsUmVmZXJlbmNlcyhzb3VyY2VGaWxlKTtcbiAgICAgIGlmIChvcmlnaW5hbFJlZmVyZW5jZXMpIHtcbiAgICAgICAgYXVnbWVudGVkUmVmZXJlbmNlcy5zZXQoc291cmNlRmlsZSwgc291cmNlRmlsZS5yZWZlcmVuY2VkRmlsZXMpO1xuICAgICAgICBzb3VyY2VGaWxlLnJlZmVyZW5jZWRGaWxlcyA9IG9yaWdpbmFsUmVmZXJlbmNlcztcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZ2VuVHNGaWxlczogR2VuZXJhdGVkRmlsZVtdID0gW107XG4gICAgY29uc3QgZ2VuSnNvbkZpbGVzOiBHZW5lcmF0ZWRGaWxlW10gPSBbXTtcbiAgICBnZW5GaWxlcy5mb3JFYWNoKGdmID0+IHtcbiAgICAgIGlmIChnZi5zdG10cykge1xuICAgICAgICBnZW5Uc0ZpbGVzLnB1c2goZ2YpO1xuICAgICAgfVxuICAgICAgaWYgKGdmLnNvdXJjZSkge1xuICAgICAgICBnZW5Kc29uRmlsZXMucHVzaChnZik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgbGV0IGVtaXRSZXN1bHQ6IHRzLkVtaXRSZXN1bHQ7XG4gICAgbGV0IGVtaXR0ZWRVc2VyVHNDb3VudDogbnVtYmVyO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzb3VyY2VGaWxlc1RvRW1pdCA9IHRoaXMuZ2V0U291cmNlRmlsZXNGb3JFbWl0KCk7XG4gICAgICBpZiAoc291cmNlRmlsZXNUb0VtaXQgJiZcbiAgICAgICAgICAoc291cmNlRmlsZXNUb0VtaXQubGVuZ3RoICsgZ2VuVHNGaWxlcy5sZW5ndGgpIDwgTUFYX0ZJTEVfQ09VTlRfRk9SX1NJTkdMRV9GSUxFX0VNSVQpIHtcbiAgICAgICAgY29uc3QgZmlsZU5hbWVzVG9FbWl0ID1cbiAgICAgICAgICAgIFsuLi5zb3VyY2VGaWxlc1RvRW1pdC5tYXAoc2YgPT4gc2YuZmlsZU5hbWUpLCAuLi5nZW5Uc0ZpbGVzLm1hcChnZiA9PiBnZi5nZW5GaWxlVXJsKV07XG4gICAgICAgIGVtaXRSZXN1bHQgPSBtZXJnZUVtaXRSZXN1bHRzQ2FsbGJhY2soXG4gICAgICAgICAgICBmaWxlTmFtZXNUb0VtaXQubWFwKChmaWxlTmFtZSkgPT4gZW1pdFJlc3VsdCA9IGVtaXRDYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3JhbTogdGhpcy50c1Byb2dyYW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdDogdGhpcy5ob3N0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3cml0ZUZpbGU6IHdyaXRlVHNGaWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXRPbmx5RHRzRmlsZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tVHJhbnNmb3JtZXJzOiB0c0N1c3RvbVRyYW5zZm9ybWVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRTb3VyY2VGaWxlOiB0aGlzLnRzUHJvZ3JhbS5nZXRTb3VyY2VGaWxlKGZpbGVOYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpKTtcbiAgICAgICAgZW1pdHRlZFVzZXJUc0NvdW50ID0gc291cmNlRmlsZXNUb0VtaXQubGVuZ3RoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW1pdFJlc3VsdCA9IGVtaXRDYWxsYmFjayh7XG4gICAgICAgICAgcHJvZ3JhbTogdGhpcy50c1Byb2dyYW0sXG4gICAgICAgICAgaG9zdDogdGhpcy5ob3N0LFxuICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcbiAgICAgICAgICB3cml0ZUZpbGU6IHdyaXRlVHNGaWxlLFxuICAgICAgICAgIGVtaXRPbmx5RHRzRmlsZXMsXG4gICAgICAgICAgY3VzdG9tVHJhbnNmb3JtZXJzOiB0c0N1c3RvbVRyYW5zZm9ybWVyc1xuICAgICAgICB9KTtcbiAgICAgICAgZW1pdHRlZFVzZXJUc0NvdW50ID0gdGhpcy50c1Byb2dyYW0uZ2V0U291cmNlRmlsZXMoKS5sZW5ndGggLSBnZW5Uc0ZpbGVzLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gUmVzdG9yZSB0aGUgcmVmZXJlbmNlcyBiYWNrIHRvIHRoZSBhdWdtZW50ZWQgdmFsdWUgdG8gZW5zdXJlIHRoYXQgdGhlXG4gICAgICAvLyBjaGVja3MgdGhhdCBUeXBlU2NyaXB0IG1ha2VzIGZvciBwcm9qZWN0IHN0cnVjdHVyZSByZXVzZSB3aWxsIHN1Y2NlZWQuXG4gICAgICBmb3IgKGNvbnN0IFtzb3VyY2VGaWxlLCByZWZlcmVuY2VzXSBvZiBBcnJheS5mcm9tKGF1Z21lbnRlZFJlZmVyZW5jZXMpKSB7XG4gICAgICAgIC8vIFRPRE8oY2h1Y2tqKTogUmVtb3ZlIGFueSBjYXN0IGFmdGVyIHVwZGF0aW5nIGJ1aWxkIHRvIDIuNlxuICAgICAgICAoc291cmNlRmlsZSBhcyBhbnkpLnJlZmVyZW5jZWRGaWxlcyA9IHJlZmVyZW5jZXM7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZW1pdHRlZFNvdXJjZUZpbGVzID0gZW1pdHRlZFNvdXJjZUZpbGVzO1xuXG4gICAgLy8gTWF0Y2ggYmVoYXZpb3Igb2YgdHNjOiBvbmx5IHByb2R1Y2UgZW1pdCBkaWFnbm9zdGljcyBpZiBpdCB3b3VsZCBibG9ja1xuICAgIC8vIGVtaXQuIElmIG5vRW1pdE9uRXJyb3IgaXMgZmFsc2UsIHRoZSBlbWl0IHdpbGwgaGFwcGVuIGluIHNwaXRlIG9mIGFueVxuICAgIC8vIGVycm9ycywgc28gd2Ugc2hvdWxkIG5vdCByZXBvcnQgdGhlbS5cbiAgICBpZiAoZW1pdFJlc3VsdCAmJiB0aGlzLm9wdGlvbnMubm9FbWl0T25FcnJvciA9PT0gdHJ1ZSkge1xuICAgICAgLy8gdHJhbnNsYXRlIHRoZSBkaWFnbm9zdGljcyBpbiB0aGUgZW1pdFJlc3VsdCBhcyB3ZWxsLlxuICAgICAgY29uc3QgdHJhbnNsYXRlZEVtaXREaWFncyA9IHRyYW5zbGF0ZURpYWdub3N0aWNzKHRoaXMuaG9zdEFkYXB0ZXIsIGVtaXRSZXN1bHQuZGlhZ25vc3RpY3MpO1xuICAgICAgZW1pdFJlc3VsdC5kaWFnbm9zdGljcyA9IHRyYW5zbGF0ZWRFbWl0RGlhZ3MudHMuY29uY2F0KFxuICAgICAgICAgIHRoaXMuc3RydWN0dXJhbERpYWdub3N0aWNzLmNvbmNhdCh0cmFuc2xhdGVkRW1pdERpYWdzLm5nKS5tYXAobmdUb1RzRGlhZ25vc3RpYykpO1xuICAgIH1cblxuICAgIGlmIChlbWl0UmVzdWx0ICYmICFvdXRTcmNNYXBwaW5nLmxlbmd0aCkge1xuICAgICAgLy8gaWYgbm8gZmlsZXMgd2VyZSBlbWl0dGVkIGJ5IFR5cGVTY3JpcHQsIGFsc28gZG9uJ3QgZW1pdCAuanNvbiBmaWxlc1xuICAgICAgZW1pdFJlc3VsdC5kaWFnbm9zdGljcyA9XG4gICAgICAgICAgZW1pdFJlc3VsdC5kaWFnbm9zdGljcy5jb25jYXQoW2NyZWF0ZU1lc3NhZ2VEaWFnbm9zdGljKGBFbWl0dGVkIG5vIGZpbGVzLmApXSk7XG4gICAgICByZXR1cm4gZW1pdFJlc3VsdDtcbiAgICB9XG5cbiAgICBsZXQgc2FtcGxlU3JjRmlsZU5hbWU6IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgbGV0IHNhbXBsZU91dEZpbGVOYW1lOiBzdHJpbmd8dW5kZWZpbmVkO1xuICAgIGlmIChvdXRTcmNNYXBwaW5nLmxlbmd0aCkge1xuICAgICAgc2FtcGxlU3JjRmlsZU5hbWUgPSBvdXRTcmNNYXBwaW5nWzBdLnNvdXJjZUZpbGUuZmlsZU5hbWU7XG4gICAgICBzYW1wbGVPdXRGaWxlTmFtZSA9IG91dFNyY01hcHBpbmdbMF0ub3V0RmlsZU5hbWU7XG4gICAgfVxuICAgIGNvbnN0IHNyY1RvT3V0UGF0aCA9XG4gICAgICAgIGNyZWF0ZVNyY1RvT3V0UGF0aE1hcHBlcih0aGlzLm9wdGlvbnMub3V0RGlyLCBzYW1wbGVTcmNGaWxlTmFtZSwgc2FtcGxlT3V0RmlsZU5hbWUpO1xuICAgIGlmIChlbWl0RmxhZ3MgJiBFbWl0RmxhZ3MuQ29kZWdlbikge1xuICAgICAgZ2VuSnNvbkZpbGVzLmZvckVhY2goZ2YgPT4ge1xuICAgICAgICBjb25zdCBvdXRGaWxlTmFtZSA9IHNyY1RvT3V0UGF0aChnZi5nZW5GaWxlVXJsKTtcbiAgICAgICAgdGhpcy53cml0ZUZpbGUob3V0RmlsZU5hbWUsIGdmLnNvdXJjZSEsIGZhbHNlLCB1bmRlZmluZWQsIGdmKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBsZXQgbWV0YWRhdGFKc29uQ291bnQgPSAwO1xuICAgIGlmIChlbWl0RmxhZ3MgJiBFbWl0RmxhZ3MuTWV0YWRhdGEpIHtcbiAgICAgIHRoaXMudHNQcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkuZm9yRWFjaChzZiA9PiB7XG4gICAgICAgIGlmICghc2YuaXNEZWNsYXJhdGlvbkZpbGUgJiYgIUdFTkVSQVRFRF9GSUxFUy50ZXN0KHNmLmZpbGVOYW1lKSkge1xuICAgICAgICAgIG1ldGFkYXRhSnNvbkNvdW50Kys7XG4gICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLm1ldGFkYXRhQ2FjaGUuZ2V0TWV0YWRhdGEoc2YpO1xuICAgICAgICAgIGlmIChtZXRhZGF0YSkge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGFUZXh0ID0gSlNPTi5zdHJpbmdpZnkoW21ldGFkYXRhXSk7XG4gICAgICAgICAgICBjb25zdCBvdXRGaWxlTmFtZSA9IHNyY1RvT3V0UGF0aChzZi5maWxlTmFtZS5yZXBsYWNlKC9cXC50c3g/JC8sICcubWV0YWRhdGEuanNvbicpKTtcbiAgICAgICAgICAgIHRoaXMud3JpdGVGaWxlKG91dEZpbGVOYW1lLCBtZXRhZGF0YVRleHQsIGZhbHNlLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgW3NmXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3QgZW1pdEVuZCA9IERhdGUubm93KCk7XG4gICAgaWYgKGVtaXRSZXN1bHQgJiYgdGhpcy5vcHRpb25zLmRpYWdub3N0aWNzKSB7XG4gICAgICBlbWl0UmVzdWx0LmRpYWdub3N0aWNzID0gZW1pdFJlc3VsdC5kaWFnbm9zdGljcy5jb25jYXQoW2NyZWF0ZU1lc3NhZ2VEaWFnbm9zdGljKFtcbiAgICAgICAgYEVtaXR0ZWQgaW4gJHtlbWl0RW5kIC0gZW1pdFN0YXJ0fW1zYCxcbiAgICAgICAgYC0gJHtlbWl0dGVkVXNlclRzQ291bnR9IHVzZXIgdHMgZmlsZXNgLFxuICAgICAgICBgLSAke2dlblRzRmlsZXMubGVuZ3RofSBnZW5lcmF0ZWQgdHMgZmlsZXNgLFxuICAgICAgICBgLSAke2dlbkpzb25GaWxlcy5sZW5ndGggKyBtZXRhZGF0YUpzb25Db3VudH0gZ2VuZXJhdGVkIGpzb24gZmlsZXNgLFxuICAgICAgXS5qb2luKCdcXG4nKSldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW1pdFJlc3VsdDtcbiAgfVxuXG4gIC8vIFByaXZhdGUgbWVtYmVyc1xuICBwcml2YXRlIGdldCBjb21waWxlcigpOiBBb3RDb21waWxlciB7XG4gICAgaWYgKCF0aGlzLl9jb21waWxlcikge1xuICAgICAgdGhpcy5fY3JlYXRlQ29tcGlsZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NvbXBpbGVyITtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGhvc3RBZGFwdGVyKCk6IFRzQ29tcGlsZXJBb3RDb21waWxlclR5cGVDaGVja0hvc3RBZGFwdGVyIHtcbiAgICBpZiAoIXRoaXMuX2hvc3RBZGFwdGVyKSB7XG4gICAgICB0aGlzLl9jcmVhdGVDb21waWxlcigpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5faG9zdEFkYXB0ZXIhO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgYW5hbHl6ZWRNb2R1bGVzKCk6IE5nQW5hbHl6ZWRNb2R1bGVzIHtcbiAgICBpZiAoIXRoaXMuX2FuYWx5emVkTW9kdWxlcykge1xuICAgICAgdGhpcy5pbml0U3luYygpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYW5hbHl6ZWRNb2R1bGVzITtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHN0cnVjdHVyYWxEaWFnbm9zdGljcygpOiBSZWFkb25seUFycmF5PERpYWdub3N0aWM+IHtcbiAgICBsZXQgZGlhZ25vc3RpY3MgPSB0aGlzLl9zdHJ1Y3R1cmFsRGlhZ25vc3RpY3M7XG4gICAgaWYgKCFkaWFnbm9zdGljcykge1xuICAgICAgdGhpcy5pbml0U3luYygpO1xuICAgICAgZGlhZ25vc3RpY3MgPSAodGhpcy5fc3RydWN0dXJhbERpYWdub3N0aWNzID0gdGhpcy5fc3RydWN0dXJhbERpYWdub3N0aWNzIHx8IFtdKTtcbiAgICB9XG4gICAgcmV0dXJuIGRpYWdub3N0aWNzO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgdHNQcm9ncmFtKCk6IHRzLlByb2dyYW0ge1xuICAgIGlmICghdGhpcy5fdHNQcm9ncmFtKSB7XG4gICAgICB0aGlzLmluaXRTeW5jKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl90c1Byb2dyYW0hO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHByb2dyYW0gaXMgY29tcGlsaW5nIHRoZSBBbmd1bGFyIGNvcmUgcGFja2FnZS4gKi9cbiAgcHJpdmF0ZSBnZXQgaXNDb21waWxpbmdBbmd1bGFyQ29yZSgpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5faXNDb21waWxpbmdBbmd1bGFyQ29yZSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2lzQ29tcGlsaW5nQW5ndWxhckNvcmU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9pc0NvbXBpbGluZ0FuZ3VsYXJDb3JlID0gaXNBbmd1bGFyQ29yZVBhY2thZ2UodGhpcy50c1Byb2dyYW0pO1xuICB9XG4gIHByaXZhdGUgX2lzQ29tcGlsaW5nQW5ndWxhckNvcmU6IGJvb2xlYW58bnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSBjYWxjdWxhdGVUcmFuc2Zvcm1zKFxuICAgICAgZ2VuRmlsZXM6IE1hcDxzdHJpbmcsIEdlbmVyYXRlZEZpbGU+fHVuZGVmaW5lZCwgcGFydGlhbE1vZHVsZXM6IFBhcnRpYWxNb2R1bGVbXXx1bmRlZmluZWQsXG4gICAgICBjdXN0b21UcmFuc2Zvcm1lcnM/OiBDdXN0b21UcmFuc2Zvcm1lcnMpOiB0cy5DdXN0b21UcmFuc2Zvcm1lcnMge1xuICAgIGNvbnN0IGJlZm9yZVRzOiBBcnJheTx0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4+ID0gW107XG4gICAgY29uc3QgbWV0YWRhdGFUcmFuc2Zvcm1zOiBNZXRhZGF0YVRyYW5zZm9ybWVyW10gPSBbXTtcbiAgICBjb25zdCBmbGF0TW9kdWxlTWV0YWRhdGFUcmFuc2Zvcm1zOiBNZXRhZGF0YVRyYW5zZm9ybWVyW10gPSBbXTtcbiAgICBjb25zdCBhbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlciA9IHRoaXMub3B0aW9ucy5hbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlciB8fCBmYWxzZTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZW5hYmxlUmVzb3VyY2VJbmxpbmluZykge1xuICAgICAgYmVmb3JlVHMucHVzaChnZXRJbmxpbmVSZXNvdXJjZXNUcmFuc2Zvcm1GYWN0b3J5KHRoaXMudHNQcm9ncmFtLCB0aGlzLmhvc3RBZGFwdGVyKSk7XG4gICAgICBjb25zdCB0cmFuc2Zvcm1lciA9IG5ldyBJbmxpbmVSZXNvdXJjZXNNZXRhZGF0YVRyYW5zZm9ybWVyKHRoaXMuaG9zdEFkYXB0ZXIpO1xuICAgICAgbWV0YWRhdGFUcmFuc2Zvcm1zLnB1c2godHJhbnNmb3JtZXIpO1xuICAgICAgZmxhdE1vZHVsZU1ldGFkYXRhVHJhbnNmb3Jtcy5wdXNoKHRyYW5zZm9ybWVyKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXNhYmxlRXhwcmVzc2lvbkxvd2VyaW5nKSB7XG4gICAgICBiZWZvcmVUcy5wdXNoKFxuICAgICAgICAgIGdldEV4cHJlc3Npb25Mb3dlcmluZ1RyYW5zZm9ybUZhY3RvcnkodGhpcy5sb3dlcmluZ01ldGFkYXRhVHJhbnNmb3JtLCB0aGlzLnRzUHJvZ3JhbSkpO1xuICAgICAgbWV0YWRhdGFUcmFuc2Zvcm1zLnB1c2godGhpcy5sb3dlcmluZ01ldGFkYXRhVHJhbnNmb3JtKTtcbiAgICB9XG4gICAgaWYgKGdlbkZpbGVzKSB7XG4gICAgICBiZWZvcmVUcy5wdXNoKGdldEFuZ3VsYXJFbWl0dGVyVHJhbnNmb3JtRmFjdG9yeShcbiAgICAgICAgICBnZW5GaWxlcywgdGhpcy5nZXRUc1Byb2dyYW0oKSwgYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXIpKTtcbiAgICB9XG4gICAgaWYgKHBhcnRpYWxNb2R1bGVzKSB7XG4gICAgICBiZWZvcmVUcy5wdXNoKGdldEFuZ3VsYXJDbGFzc1RyYW5zZm9ybWVyRmFjdG9yeShwYXJ0aWFsTW9kdWxlcywgYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXIpKTtcblxuICAgICAgLy8gSWYgd2UgaGF2ZSBwYXJ0aWFsIG1vZHVsZXMsIHRoZSBjYWNoZWQgbWV0YWRhdGEgbWlnaHQgYmUgaW5jb3JyZWN0IGFzIGl0IGRvZXNuJ3QgcmVmbGVjdFxuICAgICAgLy8gdGhlIHBhcnRpYWwgbW9kdWxlIHRyYW5zZm9ybXMuXG4gICAgICBjb25zdCB0cmFuc2Zvcm1lciA9IG5ldyBQYXJ0aWFsTW9kdWxlTWV0YWRhdGFUcmFuc2Zvcm1lcihwYXJ0aWFsTW9kdWxlcyk7XG4gICAgICBtZXRhZGF0YVRyYW5zZm9ybXMucHVzaCh0cmFuc2Zvcm1lcik7XG4gICAgICBmbGF0TW9kdWxlTWV0YWRhdGFUcmFuc2Zvcm1zLnB1c2godHJhbnNmb3JtZXIpO1xuICAgIH1cblxuICAgIGlmIChjdXN0b21UcmFuc2Zvcm1lcnMgJiYgY3VzdG9tVHJhbnNmb3JtZXJzLmJlZm9yZVRzKSB7XG4gICAgICBiZWZvcmVUcy5wdXNoKC4uLmN1c3RvbVRyYW5zZm9ybWVycy5iZWZvcmVUcyk7XG4gICAgfVxuXG4gICAgLy8gSWYgZGVjb3JhdG9ycyBzaG91bGQgYmUgY29udmVydGVkIHRvIHN0YXRpYyBmaWVsZHMgKGVuYWJsZWQgYnkgZGVmYXVsdCksIHdlIHNldCB1cFxuICAgIC8vIHRoZSBkZWNvcmF0b3IgZG93bmxldmVsIHRyYW5zZm9ybS4gTm90ZSB0aGF0IHdlIHNldCBpdCB1cCBhcyBsYXN0IHRyYW5zZm9ybSBhcyB0aGF0XG4gICAgLy8gYWxsb3dzIGN1c3RvbSB0cmFuc2Zvcm1lcnMgdG8gc3RyaXAgQW5ndWxhciBkZWNvcmF0b3JzIHdpdGhvdXQgaGF2aW5nIHRvIGRlYWwgd2l0aFxuICAgIC8vIGlkZW50aWZ5aW5nIHN0YXRpYyBwcm9wZXJ0aWVzLiBlLmcuIGl0J3MgbW9yZSBkaWZmaWN1bHQgaGFuZGxpbmcgYDwuLj4uZGVjb3JhdG9yc2BcbiAgICAvLyBvciBgPC4uPi5jdG9yUGFyYW1ldGVyc2AgY29tcGFyZWQgdG8gdGhlIGB0cy5EZWNvcmF0b3JgIEFTVCBub2Rlcy5cbiAgICBpZiAodGhpcy5vcHRpb25zLmFubm90YXRpb25zQXMgIT09ICdkZWNvcmF0b3JzJykge1xuICAgICAgY29uc3QgdHlwZUNoZWNrZXIgPSB0aGlzLmdldFRzUHJvZ3JhbSgpLmdldFR5cGVDaGVja2VyKCk7XG4gICAgICBjb25zdCByZWZsZWN0aW9uSG9zdCA9IG5ldyBUeXBlU2NyaXB0UmVmbGVjdGlvbkhvc3QodHlwZUNoZWNrZXIpO1xuICAgICAgLy8gU2ltaWxhcmx5IHRvIGhvdyB3ZSBoYW5kbGVkIHRzaWNrbGUgZGVjb3JhdG9yIGRvd25sZXZlbGluZyBpbiB0aGUgcGFzdCwgd2UganVzdFxuICAgICAgLy8gaWdub3JlIGRpYWdub3N0aWNzIHRoYXQgaGF2ZSBiZWVuIGNvbGxlY3RlZCBieSB0aGUgdHJhbnNmb3JtZXIuIFRoZXNlIGFyZVxuICAgICAgLy8gbm9uLXNpZ25pZmljYW50IGZhaWx1cmVzIHRoYXQgc2hvdWxkbid0IHByZXZlbnQgYXBwcyBmcm9tIGNvbXBpbGluZy5cbiAgICAgIGJlZm9yZVRzLnB1c2goZ2V0RG93bmxldmVsRGVjb3JhdG9yc1RyYW5zZm9ybShcbiAgICAgICAgICB0eXBlQ2hlY2tlciwgcmVmbGVjdGlvbkhvc3QsIFtdLCB0aGlzLmlzQ29tcGlsaW5nQW5ndWxhckNvcmUsIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyLFxuICAgICAgICAgIC8qIHNraXBDbGFzc0RlY29yYXRvcnMgKi8gZmFsc2UpKTtcbiAgICB9XG5cbiAgICBpZiAobWV0YWRhdGFUcmFuc2Zvcm1zLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMubWV0YWRhdGFDYWNoZSA9IHRoaXMuY3JlYXRlTWV0YWRhdGFDYWNoZShtZXRhZGF0YVRyYW5zZm9ybXMpO1xuICAgIH1cbiAgICBpZiAoZmxhdE1vZHVsZU1ldGFkYXRhVHJhbnNmb3Jtcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmZsYXRNb2R1bGVNZXRhZGF0YUNhY2hlID0gdGhpcy5jcmVhdGVNZXRhZGF0YUNhY2hlKGZsYXRNb2R1bGVNZXRhZGF0YVRyYW5zZm9ybXMpO1xuICAgIH1cbiAgICBjb25zdCBhZnRlclRzID0gY3VzdG9tVHJhbnNmb3JtZXJzID8gY3VzdG9tVHJhbnNmb3JtZXJzLmFmdGVyVHMgOiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHtiZWZvcmU6IGJlZm9yZVRzLCBhZnRlcjogYWZ0ZXJUc307XG4gIH1cblxuICBwcml2YXRlIGluaXRTeW5jKCkge1xuICAgIGlmICh0aGlzLl9hbmFseXplZE1vZHVsZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHt0bXBQcm9ncmFtLCBzb3VyY2VGaWxlcywgdHNGaWxlcywgcm9vdE5hbWVzfSA9IHRoaXMuX2NyZWF0ZVByb2dyYW1XaXRoQmFzaWNTdHVicygpO1xuICAgICAgY29uc3Qge2FuYWx5emVkTW9kdWxlcywgYW5hbHl6ZWRJbmplY3RhYmxlc30gPVxuICAgICAgICAgIHRoaXMuY29tcGlsZXIubG9hZEZpbGVzU3luYyhzb3VyY2VGaWxlcywgdHNGaWxlcyk7XG4gICAgICB0aGlzLl91cGRhdGVQcm9ncmFtV2l0aFR5cGVDaGVja1N0dWJzKFxuICAgICAgICAgIHRtcFByb2dyYW0sIGFuYWx5emVkTW9kdWxlcywgYW5hbHl6ZWRJbmplY3RhYmxlcywgcm9vdE5hbWVzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9jcmVhdGVQcm9ncmFtT25FcnJvcihlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVDb21waWxlcigpIHtcbiAgICBjb25zdCBjb2RlZ2VuOiBDb2RlR2VuZXJhdG9yID0ge1xuICAgICAgZ2VuZXJhdGVGaWxlOiAoZ2VuRmlsZU5hbWUsIGJhc2VGaWxlTmFtZSkgPT5cbiAgICAgICAgICB0aGlzLl9jb21waWxlci5lbWl0QmFzaWNTdHViKGdlbkZpbGVOYW1lLCBiYXNlRmlsZU5hbWUpLFxuICAgICAgZmluZEdlbmVyYXRlZEZpbGVOYW1lczogKGZpbGVOYW1lKSA9PiB0aGlzLl9jb21waWxlci5maW5kR2VuZXJhdGVkRmlsZU5hbWVzKGZpbGVOYW1lKSxcbiAgICB9O1xuXG4gICAgdGhpcy5faG9zdEFkYXB0ZXIgPSBuZXcgVHNDb21waWxlckFvdENvbXBpbGVyVHlwZUNoZWNrSG9zdEFkYXB0ZXIoXG4gICAgICAgIHRoaXMucm9vdE5hbWVzLCB0aGlzLm9wdGlvbnMsIHRoaXMuaG9zdCwgdGhpcy5tZXRhZGF0YUNhY2hlLCBjb2RlZ2VuLFxuICAgICAgICB0aGlzLm9sZFByb2dyYW1MaWJyYXJ5U3VtbWFyaWVzKTtcbiAgICBjb25zdCBhb3RPcHRpb25zID0gZ2V0QW90Q29tcGlsZXJPcHRpb25zKHRoaXMub3B0aW9ucyk7XG4gICAgY29uc3QgZXJyb3JDb2xsZWN0b3IgPSAodGhpcy5vcHRpb25zLmNvbGxlY3RBbGxFcnJvcnMgfHwgdGhpcy5vcHRpb25zLmZ1bGxUZW1wbGF0ZVR5cGVDaGVjaykgP1xuICAgICAgICAoZXJyOiBhbnkpID0+IHRoaXMuX2FkZFN0cnVjdHVyYWxEaWFnbm9zdGljcyhlcnIpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIHRoaXMuX2NvbXBpbGVyID0gY3JlYXRlQW90Q29tcGlsZXIodGhpcy5faG9zdEFkYXB0ZXIsIGFvdE9wdGlvbnMsIGVycm9yQ29sbGVjdG9yKS5jb21waWxlcjtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZVByb2dyYW1XaXRoQmFzaWNTdHVicygpOiB7XG4gICAgdG1wUHJvZ3JhbTogdHMuUHJvZ3JhbSxcbiAgICByb290TmFtZXM6IHN0cmluZ1tdLFxuICAgIHNvdXJjZUZpbGVzOiBzdHJpbmdbXSxcbiAgICB0c0ZpbGVzOiBzdHJpbmdbXSxcbiAgfSB7XG4gICAgaWYgKHRoaXMuX2FuYWx5emVkTW9kdWxlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnRlcm5hbCBFcnJvcjogYWxyZWFkeSBpbml0aWFsaXplZCFgKTtcbiAgICB9XG4gICAgLy8gTm90ZTogVGhpcyBpcyBpbXBvcnRhbnQgdG8gbm90IHByb2R1Y2UgYSBtZW1vcnkgbGVhayFcbiAgICBjb25zdCBvbGRUc1Byb2dyYW0gPSB0aGlzLm9sZFRzUHJvZ3JhbTtcbiAgICB0aGlzLm9sZFRzUHJvZ3JhbSA9IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0IGNvZGVnZW46IENvZGVHZW5lcmF0b3IgPSB7XG4gICAgICBnZW5lcmF0ZUZpbGU6IChnZW5GaWxlTmFtZSwgYmFzZUZpbGVOYW1lKSA9PlxuICAgICAgICAgIHRoaXMuY29tcGlsZXIuZW1pdEJhc2ljU3R1YihnZW5GaWxlTmFtZSwgYmFzZUZpbGVOYW1lKSxcbiAgICAgIGZpbmRHZW5lcmF0ZWRGaWxlTmFtZXM6IChmaWxlTmFtZSkgPT4gdGhpcy5jb21waWxlci5maW5kR2VuZXJhdGVkRmlsZU5hbWVzKGZpbGVOYW1lKSxcbiAgICB9O1xuXG5cbiAgICBsZXQgcm9vdE5hbWVzID0gWy4uLnRoaXMucm9vdE5hbWVzXTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmdlbmVyYXRlQ29kZUZvckxpYnJhcmllcyAhPT0gZmFsc2UpIHtcbiAgICAgIC8vIGlmIHdlIHNob3VsZCBnZW5lcmF0ZUNvZGVGb3JMaWJyYXJpZXMsIG5ldmVyIGluY2x1ZGVcbiAgICAgIC8vIGdlbmVyYXRlZCBmaWxlcyBpbiB0aGUgcHJvZ3JhbSBhcyBvdGhlcndpc2Ugd2Ugd2lsbFxuICAgICAgLy8gb3ZlcndyaXRlIHRoZW0gYW5kIHR5cGVzY3JpcHQgd2lsbCByZXBvcnQgdGhlIGVycm9yXG4gICAgICAvLyBUUzUwNTU6IENhbm5vdCB3cml0ZSBmaWxlIC4uLiBiZWNhdXNlIGl0IHdvdWxkIG92ZXJ3cml0ZSBpbnB1dCBmaWxlLlxuICAgICAgcm9vdE5hbWVzID0gcm9vdE5hbWVzLmZpbHRlcihmbiA9PiAhR0VORVJBVEVEX0ZJTEVTLnRlc3QoZm4pKTtcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5ub1Jlc29sdmUpIHtcbiAgICAgIHRoaXMucm9vdE5hbWVzLmZvckVhY2gocm9vdE5hbWUgPT4ge1xuICAgICAgICBpZiAodGhpcy5ob3N0QWRhcHRlci5zaG91bGRHZW5lcmF0ZUZpbGVzRm9yKHJvb3ROYW1lKSkge1xuICAgICAgICAgIHJvb3ROYW1lcy5wdXNoKC4uLnRoaXMuY29tcGlsZXIuZmluZEdlbmVyYXRlZEZpbGVOYW1lcyhyb290TmFtZSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCB0bXBQcm9ncmFtID0gdHMuY3JlYXRlUHJvZ3JhbShyb290TmFtZXMsIHRoaXMub3B0aW9ucywgdGhpcy5ob3N0QWRhcHRlciwgb2xkVHNQcm9ncmFtKTtcbiAgICBpZiAodGVtcFByb2dyYW1IYW5kbGVyRm9yVGVzdCAhPT0gbnVsbCkge1xuICAgICAgdGVtcFByb2dyYW1IYW5kbGVyRm9yVGVzdCh0bXBQcm9ncmFtKTtcbiAgICB9XG4gICAgY29uc3Qgc291cmNlRmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgdHNGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgICB0bXBQcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkuZm9yRWFjaChzZiA9PiB7XG4gICAgICBpZiAodGhpcy5ob3N0QWRhcHRlci5pc1NvdXJjZUZpbGUoc2YuZmlsZU5hbWUpKSB7XG4gICAgICAgIHNvdXJjZUZpbGVzLnB1c2goc2YuZmlsZU5hbWUpO1xuICAgICAgfVxuICAgICAgaWYgKFRTLnRlc3Qoc2YuZmlsZU5hbWUpICYmICFEVFMudGVzdChzZi5maWxlTmFtZSkpIHtcbiAgICAgICAgdHNGaWxlcy5wdXNoKHNmLmZpbGVOYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4ge3RtcFByb2dyYW0sIHNvdXJjZUZpbGVzLCB0c0ZpbGVzLCByb290TmFtZXN9O1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlUHJvZ3JhbVdpdGhUeXBlQ2hlY2tTdHVicyhcbiAgICAgIHRtcFByb2dyYW06IHRzLlByb2dyYW0sIGFuYWx5emVkTW9kdWxlczogTmdBbmFseXplZE1vZHVsZXMsXG4gICAgICBhbmFseXplZEluamVjdGFibGVzOiBOZ0FuYWx5emVkRmlsZVdpdGhJbmplY3RhYmxlc1tdLCByb290TmFtZXM6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5fYW5hbHl6ZWRNb2R1bGVzID0gYW5hbHl6ZWRNb2R1bGVzO1xuICAgIHRoaXMuX2FuYWx5emVkSW5qZWN0YWJsZXMgPSBhbmFseXplZEluamVjdGFibGVzO1xuICAgIHRtcFByb2dyYW0uZ2V0U291cmNlRmlsZXMoKS5mb3JFYWNoKHNmID0+IHtcbiAgICAgIGlmIChzZi5maWxlTmFtZS5lbmRzV2l0aCgnLm5nZmFjdG9yeS50cycpKSB7XG4gICAgICAgIGNvbnN0IHtnZW5lcmF0ZSwgYmFzZUZpbGVOYW1lfSA9IHRoaXMuaG9zdEFkYXB0ZXIuc2hvdWxkR2VuZXJhdGVGaWxlKHNmLmZpbGVOYW1lKTtcbiAgICAgICAgaWYgKGdlbmVyYXRlKSB7XG4gICAgICAgICAgLy8gTm90ZTogISBpcyBvayBhcyBob3N0QWRhcHRlci5zaG91bGRHZW5lcmF0ZUZpbGUgd2lsbCBhbHdheXMgcmV0dXJuIGEgYmFzZUZpbGVOYW1lXG4gICAgICAgICAgLy8gZm9yIC5uZ2ZhY3RvcnkudHMgZmlsZXMuXG4gICAgICAgICAgY29uc3QgZ2VuRmlsZSA9IHRoaXMuY29tcGlsZXIuZW1pdFR5cGVDaGVja1N0dWIoc2YuZmlsZU5hbWUsIGJhc2VGaWxlTmFtZSEpO1xuICAgICAgICAgIGlmIChnZW5GaWxlKSB7XG4gICAgICAgICAgICB0aGlzLmhvc3RBZGFwdGVyLnVwZGF0ZUdlbmVyYXRlZEZpbGUoZ2VuRmlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5fdHNQcm9ncmFtID0gdHMuY3JlYXRlUHJvZ3JhbShyb290TmFtZXMsIHRoaXMub3B0aW9ucywgdGhpcy5ob3N0QWRhcHRlciwgdG1wUHJvZ3JhbSk7XG4gICAgLy8gTm90ZTogdGhlIG5ldyB0cyBwcm9ncmFtIHNob3VsZCBiZSBjb21wbGV0ZWx5IHJldXNhYmxlIGJ5IFR5cGVTY3JpcHQgYXM6XG4gICAgLy8gLSB3ZSBjYWNoZSBhbGwgdGhlIGZpbGVzIGluIHRoZSBob3N0QWRhcHRlclxuICAgIC8vIC0gbmV3IG5ldyBzdHVicyB1c2UgdGhlIGV4YWN0bHkgc2FtZSBpbXBvcnRzL2V4cG9ydHMgYXMgdGhlIG9sZCBvbmNlICh3ZSBhc3NlcnQgdGhhdCBpblxuICAgIC8vIGhvc3RBZGFwdGVyLnVwZGF0ZUdlbmVyYXRlZEZpbGUpLlxuICAgIGlmICh0c1N0cnVjdHVyZUlzUmV1c2VkKHRoaXMuX3RzUHJvZ3JhbSkgIT09IFN0cnVjdHVyZUlzUmV1c2VkLkNvbXBsZXRlbHkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW50ZXJuYWwgRXJyb3I6IFRoZSBzdHJ1Y3R1cmUgb2YgdGhlIHByb2dyYW0gY2hhbmdlZCBkdXJpbmcgY29kZWdlbi5gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVQcm9ncmFtT25FcnJvcihlOiBhbnkpIHtcbiAgICAvLyBTdGlsbCBmaWxsIHRoZSBhbmFseXplZE1vZHVsZXMgYW5kIHRoZSB0c1Byb2dyYW1cbiAgICAvLyBzbyB0aGF0IHdlIGRvbid0IGNhdXNlIG90aGVyIGVycm9ycyBmb3IgdXNlcnMgd2hvIGUuZy4gd2FudCB0byBlbWl0IHRoZSBuZ1Byb2dyYW0uXG4gICAgdGhpcy5fYW5hbHl6ZWRNb2R1bGVzID0gZW1wdHlNb2R1bGVzO1xuICAgIHRoaXMub2xkVHNQcm9ncmFtID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2hvc3RBZGFwdGVyLmlzU291cmNlRmlsZSA9ICgpID0+IGZhbHNlO1xuICAgIHRoaXMuX3RzUHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0odGhpcy5yb290TmFtZXMsIHRoaXMub3B0aW9ucywgdGhpcy5ob3N0QWRhcHRlcik7XG4gICAgaWYgKGlzU3ludGF4RXJyb3IoZSkpIHtcbiAgICAgIHRoaXMuX2FkZFN0cnVjdHVyYWxEaWFnbm9zdGljcyhlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZFN0cnVjdHVyYWxEaWFnbm9zdGljcyhlcnJvcjogRXJyb3IpIHtcbiAgICBjb25zdCBkaWFnbm9zdGljcyA9IHRoaXMuX3N0cnVjdHVyYWxEaWFnbm9zdGljcyB8fCAodGhpcy5fc3RydWN0dXJhbERpYWdub3N0aWNzID0gW10pO1xuICAgIGlmIChpc1N5bnRheEVycm9yKGVycm9yKSkge1xuICAgICAgZGlhZ25vc3RpY3MucHVzaCguLi5zeW50YXhFcnJvclRvRGlhZ25vc3RpY3MoZXJyb3IsIHRoaXMudHNQcm9ncmFtKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpYWdub3N0aWNzLnB1c2goe1xuICAgICAgICBtZXNzYWdlVGV4dDogZXJyb3IudG9TdHJpbmcoKSxcbiAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgc291cmNlOiBTT1VSQ0UsXG4gICAgICAgIGNvZGU6IERFRkFVTFRfRVJST1JfQ09ERVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gTm90ZTogdGhpcyByZXR1cm5zIGEgdHMuRGlhZ25vc3RpYyBzbyB0aGF0IHdlXG4gIC8vIGNhbiByZXR1cm4gZXJyb3JzIGluIGEgdHMuRW1pdFJlc3VsdFxuICBwcml2YXRlIGdlbmVyYXRlRmlsZXNGb3JFbWl0KGVtaXRGbGFnczogRW1pdEZsYWdzKTpcbiAgICAgIHtnZW5GaWxlczogR2VuZXJhdGVkRmlsZVtdLCBnZW5EaWFnczogdHMuRGlhZ25vc3RpY1tdfSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghKGVtaXRGbGFncyAmIEVtaXRGbGFncy5Db2RlZ2VuKSkge1xuICAgICAgICByZXR1cm4ge2dlbkZpbGVzOiBbXSwgZ2VuRGlhZ3M6IFtdfTtcbiAgICAgIH1cbiAgICAgIC8vIFRPRE8odGJvc2NoKTogYWxsb3cgZ2VuZXJhdGluZyBmaWxlcyB0aGF0IGFyZSBub3QgaW4gdGhlIHJvb3REaXJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8xOTMzN1xuICAgICAgbGV0IGdlbkZpbGVzID0gdGhpcy5jb21waWxlci5lbWl0QWxsSW1wbHModGhpcy5hbmFseXplZE1vZHVsZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihnZW5GaWxlID0+IGlzSW5Sb290RGlyKGdlbkZpbGUuZ2VuRmlsZVVybCwgdGhpcy5vcHRpb25zKSk7XG4gICAgICBpZiAodGhpcy5vbGRQcm9ncmFtRW1pdHRlZEdlbmVyYXRlZEZpbGVzKSB7XG4gICAgICAgIGNvbnN0IG9sZFByb2dyYW1FbWl0dGVkR2VuZXJhdGVkRmlsZXMgPSB0aGlzLm9sZFByb2dyYW1FbWl0dGVkR2VuZXJhdGVkRmlsZXM7XG4gICAgICAgIGdlbkZpbGVzID0gZ2VuRmlsZXMuZmlsdGVyKGdlbkZpbGUgPT4ge1xuICAgICAgICAgIGNvbnN0IG9sZEdlbkZpbGUgPSBvbGRQcm9ncmFtRW1pdHRlZEdlbmVyYXRlZEZpbGVzLmdldChnZW5GaWxlLmdlbkZpbGVVcmwpO1xuICAgICAgICAgIHJldHVybiAhb2xkR2VuRmlsZSB8fCAhZ2VuRmlsZS5pc0VxdWl2YWxlbnQob2xkR2VuRmlsZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtnZW5GaWxlcywgZ2VuRGlhZ3M6IFtdfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBUT0RPKHRib3NjaCk6IGNoZWNrIHdoZXRoZXIgd2UgY2FuIGFjdHVhbGx5IGhhdmUgc3ludGF4IGVycm9ycyBoZXJlLFxuICAgICAgLy8gYXMgd2UgYWxyZWFkeSBwYXJzZWQgdGhlIG1ldGFkYXRhIGFuZCB0ZW1wbGF0ZXMgYmVmb3JlIHRvIGNyZWF0ZSB0aGUgdHlwZSBjaGVjayBibG9jay5cbiAgICAgIGlmIChpc1N5bnRheEVycm9yKGUpKSB7XG4gICAgICAgIGNvbnN0IGdlbkRpYWdzOiB0cy5EaWFnbm9zdGljW10gPSBbe1xuICAgICAgICAgIGZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgICBzdGFydDogdW5kZWZpbmVkLFxuICAgICAgICAgIGxlbmd0aDogdW5kZWZpbmVkLFxuICAgICAgICAgIG1lc3NhZ2VUZXh0OiBlLm1lc3NhZ2UsXG4gICAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgICBzb3VyY2U6IFNPVVJDRSxcbiAgICAgICAgICBjb2RlOiBERUZBVUxUX0VSUk9SX0NPREVcbiAgICAgICAgfV07XG4gICAgICAgIHJldHVybiB7Z2VuRmlsZXM6IFtdLCBnZW5EaWFnc307XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHVuZGVmaW5lZCBpZiBhbGwgZmlsZXMgc2hvdWxkIGJlIGVtaXR0ZWQuXG4gICAqL1xuICBwcml2YXRlIGdldFNvdXJjZUZpbGVzRm9yRW1pdCgpOiB0cy5Tb3VyY2VGaWxlW118dW5kZWZpbmVkIHtcbiAgICAvLyBUT0RPKHRib3NjaCk6IGlmIG9uZSBvZiB0aGUgZmlsZXMgY29udGFpbnMgYSBgY29uc3QgZW51bWBcbiAgICAvLyBhbHdheXMgZW1pdCBhbGwgZmlsZXMgLT4gcmV0dXJuIHVuZGVmaW5lZCFcbiAgICBsZXQgc291cmNlRmlsZXNUb0VtaXQgPSB0aGlzLnRzUHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLmZpbHRlcihzZiA9PiB7XG4gICAgICByZXR1cm4gIXNmLmlzRGVjbGFyYXRpb25GaWxlICYmICFHRU5FUkFURURfRklMRVMudGVzdChzZi5maWxlTmFtZSk7XG4gICAgfSk7XG4gICAgaWYgKHRoaXMub2xkUHJvZ3JhbUVtaXR0ZWRTb3VyY2VGaWxlcykge1xuICAgICAgc291cmNlRmlsZXNUb0VtaXQgPSBzb3VyY2VGaWxlc1RvRW1pdC5maWx0ZXIoc2YgPT4ge1xuICAgICAgICBjb25zdCBvbGRGaWxlID0gdGhpcy5vbGRQcm9ncmFtRW1pdHRlZFNvdXJjZUZpbGVzIS5nZXQoc2YuZmlsZU5hbWUpO1xuICAgICAgICByZXR1cm4gc2YgIT09IG9sZEZpbGU7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHNvdXJjZUZpbGVzVG9FbWl0O1xuICB9XG5cbiAgcHJpdmF0ZSB3cml0ZUZpbGUoXG4gICAgICBvdXRGaWxlTmFtZTogc3RyaW5nLCBvdXREYXRhOiBzdHJpbmcsIHdyaXRlQnl0ZU9yZGVyTWFyazogYm9vbGVhbixcbiAgICAgIG9uRXJyb3I/OiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkLCBnZW5GaWxlPzogR2VuZXJhdGVkRmlsZSxcbiAgICAgIHNvdXJjZUZpbGVzPzogUmVhZG9ubHlBcnJheTx0cy5Tb3VyY2VGaWxlPikge1xuICAgIC8vIGNvbGxlY3QgZW1pdHRlZExpYnJhcnlTdW1tYXJpZXNcbiAgICBsZXQgYmFzZUZpbGU6IHRzLlNvdXJjZUZpbGV8dW5kZWZpbmVkO1xuICAgIGlmIChnZW5GaWxlKSB7XG4gICAgICBiYXNlRmlsZSA9IHRoaXMudHNQcm9ncmFtLmdldFNvdXJjZUZpbGUoZ2VuRmlsZS5zcmNGaWxlVXJsKTtcbiAgICAgIGlmIChiYXNlRmlsZSkge1xuICAgICAgICBpZiAoIXRoaXMuZW1pdHRlZExpYnJhcnlTdW1tYXJpZXMpIHtcbiAgICAgICAgICB0aGlzLmVtaXR0ZWRMaWJyYXJ5U3VtbWFyaWVzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdlbkZpbGUuZ2VuRmlsZVVybC5lbmRzV2l0aCgnLm5nc3VtbWFyeS5qc29uJykgJiYgYmFzZUZpbGUuZmlsZU5hbWUuZW5kc1dpdGgoJy5kLnRzJykpIHtcbiAgICAgICAgICB0aGlzLmVtaXR0ZWRMaWJyYXJ5U3VtbWFyaWVzLnB1c2goe1xuICAgICAgICAgICAgZmlsZU5hbWU6IGJhc2VGaWxlLmZpbGVOYW1lLFxuICAgICAgICAgICAgdGV4dDogYmFzZUZpbGUudGV4dCxcbiAgICAgICAgICAgIHNvdXJjZUZpbGU6IGJhc2VGaWxlLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuZW1pdHRlZExpYnJhcnlTdW1tYXJpZXMucHVzaCh7ZmlsZU5hbWU6IGdlbkZpbGUuZ2VuRmlsZVVybCwgdGV4dDogb3V0RGF0YX0pO1xuICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLmRlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBlbWl0IGRlY2xhcmF0aW9ucywgc3RpbGwgcmVjb3JkIGFuIGVtcHR5IC5uZ2ZhY3RvcnkuZC50cyBmaWxlLFxuICAgICAgICAgICAgLy8gYXMgd2UgbWlnaHQgbmVlZCBpdCBsYXRlciBvbiBmb3IgcmVzb2x2aW5nIG1vZHVsZSBuYW1lcyBmcm9tIHN1bW1hcmllcy5cbiAgICAgICAgICAgIGNvbnN0IG5nRmFjdG9yeUR0cyA9XG4gICAgICAgICAgICAgICAgZ2VuRmlsZS5nZW5GaWxlVXJsLnN1YnN0cmluZygwLCBnZW5GaWxlLmdlbkZpbGVVcmwubGVuZ3RoIC0gMTUpICsgJy5uZ2ZhY3RvcnkuZC50cyc7XG4gICAgICAgICAgICB0aGlzLmVtaXR0ZWRMaWJyYXJ5U3VtbWFyaWVzLnB1c2goe2ZpbGVOYW1lOiBuZ0ZhY3RvcnlEdHMsIHRleHQ6ICcnfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG91dEZpbGVOYW1lLmVuZHNXaXRoKCcuZC50cycpICYmIGJhc2VGaWxlLmZpbGVOYW1lLmVuZHNXaXRoKCcuZC50cycpKSB7XG4gICAgICAgICAgY29uc3QgZHRzU291cmNlRmlsZVBhdGggPSBnZW5GaWxlLmdlbkZpbGVVcmwucmVwbGFjZSgvXFwudHMkLywgJy5kLnRzJyk7XG4gICAgICAgICAgLy8gTm90ZTogRG9uJ3QgdXNlIHNvdXJjZUZpbGVzIGhlcmUgYXMgdGhlIGNyZWF0ZWQgLmQudHMgaGFzIGEgcGF0aCBpbiB0aGUgb3V0RGlyLFxuICAgICAgICAgIC8vIGJ1dCB3ZSBuZWVkIG9uZSB0aGF0IGlzIG5leHQgdG8gdGhlIC50cyBmaWxlXG4gICAgICAgICAgdGhpcy5lbWl0dGVkTGlicmFyeVN1bW1hcmllcy5wdXNoKHtmaWxlTmFtZTogZHRzU291cmNlRmlsZVBhdGgsIHRleHQ6IG91dERhdGF9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBGaWx0ZXIgb3V0IGdlbmVyYXRlZCBmaWxlcyBmb3Igd2hpY2ggd2UgZGlkbid0IGdlbmVyYXRlIGNvZGUuXG4gICAgLy8gVGhpcyBjYW4gaGFwcGVuIGFzIHRoZSBzdHViIGNhbGN1bGF0aW9uIGlzIG5vdCBjb21wbGV0ZWx5IGV4YWN0LlxuICAgIC8vIE5vdGU6IHNvdXJjZUZpbGUgcmVmZXJzIHRvIHRoZSAubmdmYWN0b3J5LnRzIC8gLm5nc3VtbWFyeS50cyBmaWxlXG4gICAgLy8gbm9kZV9lbWl0dGVyX3RyYW5zZm9ybSBhbHJlYWR5IHNldCB0aGUgZmlsZSBjb250ZW50cyB0byBiZSBlbXB0eSxcbiAgICAvLyAgc28gdGhpcyBjb2RlIG9ubHkgbmVlZHMgdG8gc2tpcCB0aGUgZmlsZSBpZiAhYWxsb3dFbXB0eUNvZGVnZW5GaWxlcy5cbiAgICBjb25zdCBpc0dlbmVyYXRlZCA9IEdFTkVSQVRFRF9GSUxFUy50ZXN0KG91dEZpbGVOYW1lKTtcbiAgICBpZiAoaXNHZW5lcmF0ZWQgJiYgIXRoaXMub3B0aW9ucy5hbGxvd0VtcHR5Q29kZWdlbkZpbGVzICYmXG4gICAgICAgICghZ2VuRmlsZSB8fCAhZ2VuRmlsZS5zdG10cyB8fCBnZW5GaWxlLnN0bXRzLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGJhc2VGaWxlKSB7XG4gICAgICBzb3VyY2VGaWxlcyA9IHNvdXJjZUZpbGVzID8gWy4uLnNvdXJjZUZpbGVzLCBiYXNlRmlsZV0gOiBbYmFzZUZpbGVdO1xuICAgIH1cbiAgICAvLyBUT0RPOiByZW1vdmUgYW55IHdoZW4gVFMgMi40IHN1cHBvcnQgaXMgcmVtb3ZlZC5cbiAgICB0aGlzLmhvc3Qud3JpdGVGaWxlKG91dEZpbGVOYW1lLCBvdXREYXRhLCB3cml0ZUJ5dGVPcmRlck1hcmssIG9uRXJyb3IsIHNvdXJjZUZpbGVzIGFzIGFueSk7XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJvZ3JhbSh7cm9vdE5hbWVzLCBvcHRpb25zLCBob3N0LCBvbGRQcm9ncmFtfToge1xuICByb290TmFtZXM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPixcbiAgb3B0aW9uczogQ29tcGlsZXJPcHRpb25zLFxuICBob3N0OiBDb21waWxlckhvc3QsXG4gIG9sZFByb2dyYW0/OiBQcm9ncmFtXG59KTogUHJvZ3JhbSB7XG4gIGlmIChvcHRpb25zLmVuYWJsZUl2eSAhPT0gZmFsc2UpIHtcbiAgICByZXR1cm4gbmV3IE5ndHNjUHJvZ3JhbShyb290TmFtZXMsIG9wdGlvbnMsIGhvc3QsIG9sZFByb2dyYW0gYXMgTmd0c2NQcm9ncmFtIHwgdW5kZWZpbmVkKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IEFuZ3VsYXJDb21waWxlclByb2dyYW0ocm9vdE5hbWVzLCBvcHRpb25zLCBob3N0LCBvbGRQcm9ncmFtKTtcbiAgfVxufVxuXG4vLyBDb21wdXRlIHRoZSBBb3RDb21waWxlciBvcHRpb25zXG5mdW5jdGlvbiBnZXRBb3RDb21waWxlck9wdGlvbnMob3B0aW9uczogQ29tcGlsZXJPcHRpb25zKTogQW90Q29tcGlsZXJPcHRpb25zIHtcbiAgbGV0IG1pc3NpbmdUcmFuc2xhdGlvbiA9IGNvcmUuTWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3kuV2FybmluZztcblxuICBzd2l0Y2ggKG9wdGlvbnMuaTE4bkluTWlzc2luZ1RyYW5zbGF0aW9ucykge1xuICAgIGNhc2UgJ2lnbm9yZSc6XG4gICAgICBtaXNzaW5nVHJhbnNsYXRpb24gPSBjb3JlLk1pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5Lklnbm9yZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgIG1pc3NpbmdUcmFuc2xhdGlvbiA9IGNvcmUuTWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3kuRXJyb3I7XG4gICAgICBicmVhaztcbiAgfVxuXG4gIGxldCB0cmFuc2xhdGlvbnM6IHN0cmluZyA9ICcnO1xuXG4gIGlmIChvcHRpb25zLmkxOG5JbkZpbGUpIHtcbiAgICBpZiAoIW9wdGlvbnMuaTE4bkluTG9jYWxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSB0cmFuc2xhdGlvbiBmaWxlICgke29wdGlvbnMuaTE4bkluRmlsZX0pIGxvY2FsZSBtdXN0IGJlIHByb3ZpZGVkLmApO1xuICAgIH1cbiAgICB0cmFuc2xhdGlvbnMgPSBmcy5yZWFkRmlsZVN5bmMob3B0aW9ucy5pMThuSW5GaWxlLCAndXRmOCcpO1xuICB9IGVsc2Uge1xuICAgIC8vIE5vIHRyYW5zbGF0aW9ucyBhcmUgcHJvdmlkZWQsIGlnbm9yZSBhbnkgZXJyb3JzXG4gICAgLy8gV2Ugc3RpbGwgZ28gdGhyb3VnaCBpMThuIHRvIHJlbW92ZSBpMThuIGF0dHJpYnV0ZXNcbiAgICBtaXNzaW5nVHJhbnNsYXRpb24gPSBjb3JlLk1pc3NpbmdUcmFuc2xhdGlvblN0cmF0ZWd5Lklnbm9yZTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgbG9jYWxlOiBvcHRpb25zLmkxOG5JbkxvY2FsZSxcbiAgICBpMThuRm9ybWF0OiBvcHRpb25zLmkxOG5JbkZvcm1hdCB8fCBvcHRpb25zLmkxOG5PdXRGb3JtYXQsXG4gICAgaTE4blVzZUV4dGVybmFsSWRzOiBvcHRpb25zLmkxOG5Vc2VFeHRlcm5hbElkcyxcbiAgICB0cmFuc2xhdGlvbnMsXG4gICAgbWlzc2luZ1RyYW5zbGF0aW9uLFxuICAgIGVuYWJsZVN1bW1hcmllc0ZvckppdDogb3B0aW9ucy5lbmFibGVTdW1tYXJpZXNGb3JKaXQsXG4gICAgcHJlc2VydmVXaGl0ZXNwYWNlczogb3B0aW9ucy5wcmVzZXJ2ZVdoaXRlc3BhY2VzLFxuICAgIGZ1bGxUZW1wbGF0ZVR5cGVDaGVjazogb3B0aW9ucy5mdWxsVGVtcGxhdGVUeXBlQ2hlY2ssXG4gICAgYWxsb3dFbXB0eUNvZGVnZW5GaWxlczogb3B0aW9ucy5hbGxvd0VtcHR5Q29kZWdlbkZpbGVzLFxuICAgIGVuYWJsZUl2eTogb3B0aW9ucy5lbmFibGVJdnksXG4gICAgY3JlYXRlRXh0ZXJuYWxTeW1ib2xGYWN0b3J5UmVleHBvcnRzOiBvcHRpb25zLmNyZWF0ZUV4dGVybmFsU3ltYm9sRmFjdG9yeVJlZXhwb3J0cyxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TmdPcHRpb25EaWFnbm9zdGljcyhvcHRpb25zOiBDb21waWxlck9wdGlvbnMpOiBSZWFkb25seUFycmF5PERpYWdub3N0aWM+IHtcbiAgaWYgKG9wdGlvbnMuYW5ub3RhdGlvbnNBcykge1xuICAgIHN3aXRjaCAob3B0aW9ucy5hbm5vdGF0aW9uc0FzKSB7XG4gICAgICBjYXNlICdkZWNvcmF0b3JzJzpcbiAgICAgIGNhc2UgJ3N0YXRpYyBmaWVsZHMnOlxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBbe1xuICAgICAgICAgIG1lc3NhZ2VUZXh0OlxuICAgICAgICAgICAgICAnQW5ndWxhciBjb21waWxlciBvcHRpb25zIFwiYW5ub3RhdGlvbnNBc1wiIG9ubHkgc3VwcG9ydHMgXCJzdGF0aWMgZmllbGRzXCIgYW5kIFwiZGVjb3JhdG9yc1wiJyxcbiAgICAgICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgICAgIHNvdXJjZTogU09VUkNFLFxuICAgICAgICAgIGNvZGU6IERFRkFVTFRfRVJST1JfQ09ERVxuICAgICAgICB9XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFtdO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVTZXBhcmF0b3JzKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBjYW4gYWRqdXN0IGEgcGF0aCBmcm9tIHNvdXJjZSBwYXRoIHRvIG91dCBwYXRoLFxuICogYmFzZWQgb24gYW4gZXhpc3RpbmcgbWFwcGluZyBmcm9tIHNvdXJjZSB0byBvdXQgcGF0aC5cbiAqXG4gKiBUT0RPKHRib3NjaCk6IHRhbGsgdG8gdGhlIFR5cGVTY3JpcHQgdGVhbSB0byBleHBvc2UgdGhlaXIgbG9naWMgZm9yIGNhbGN1bGF0aW5nIHRoZSBgcm9vdERpcmBcbiAqIGlmIG5vbmUgd2FzIHNwZWNpZmllZC5cbiAqXG4gKiBOb3RlOiBUaGlzIGZ1bmN0aW9uIHdvcmtzIG9uIG5vcm1hbGl6ZWQgcGF0aHMgZnJvbSB0eXBlc2NyaXB0IGJ1dCBzaG91bGQgYWx3YXlzIHJldHVyblxuICogUE9TSVggbm9ybWFsaXplZCBwYXRocyBmb3Igb3V0cHV0IHBhdGhzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3JjVG9PdXRQYXRoTWFwcGVyKFxuICAgIG91dERpcjogc3RyaW5nfHVuZGVmaW5lZCwgc2FtcGxlU3JjRmlsZU5hbWU6IHN0cmluZ3x1bmRlZmluZWQsXG4gICAgc2FtcGxlT3V0RmlsZU5hbWU6IHN0cmluZ3x1bmRlZmluZWQsIGhvc3Q6IHtcbiAgICAgIGRpcm5hbWU6IHR5cGVvZiBwYXRoLmRpcm5hbWUsXG4gICAgICByZXNvbHZlOiB0eXBlb2YgcGF0aC5yZXNvbHZlLFxuICAgICAgcmVsYXRpdmU6IHR5cGVvZiBwYXRoLnJlbGF0aXZlXG4gICAgfSA9IHBhdGgpOiAoc3JjRmlsZU5hbWU6IHN0cmluZykgPT4gc3RyaW5nIHtcbiAgaWYgKG91dERpcikge1xuICAgIGxldCBwYXRoOiB7fSA9IHt9OyAgLy8gRW5zdXJlIHdlIGVycm9yIGlmIHdlIHVzZSBgcGF0aGAgaW5zdGVhZCBvZiBgaG9zdGAuXG4gICAgaWYgKHNhbXBsZVNyY0ZpbGVOYW1lID09IG51bGwgfHwgc2FtcGxlT3V0RmlsZU5hbWUgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCBjYWxjdWxhdGUgdGhlIHJvb3REaXIgd2l0aG91dCBhIHNhbXBsZSBzcmNGaWxlTmFtZSAvIG91dEZpbGVOYW1lLiBgKTtcbiAgICB9XG4gICAgY29uc3Qgc3JjRmlsZURpciA9IG5vcm1hbGl6ZVNlcGFyYXRvcnMoaG9zdC5kaXJuYW1lKHNhbXBsZVNyY0ZpbGVOYW1lKSk7XG4gICAgY29uc3Qgb3V0RmlsZURpciA9IG5vcm1hbGl6ZVNlcGFyYXRvcnMoaG9zdC5kaXJuYW1lKHNhbXBsZU91dEZpbGVOYW1lKSk7XG4gICAgaWYgKHNyY0ZpbGVEaXIgPT09IG91dEZpbGVEaXIpIHtcbiAgICAgIHJldHVybiAoc3JjRmlsZU5hbWUpID0+IHNyY0ZpbGVOYW1lO1xuICAgIH1cbiAgICAvLyBjYWxjdWxhdGUgdGhlIGNvbW1vbiBzdWZmaXgsIHN0b3BwaW5nXG4gICAgLy8gYXQgYG91dERpcmAuXG4gICAgY29uc3Qgc3JjRGlyUGFydHMgPSBzcmNGaWxlRGlyLnNwbGl0KCcvJyk7XG4gICAgY29uc3Qgb3V0RGlyUGFydHMgPSBub3JtYWxpemVTZXBhcmF0b3JzKGhvc3QucmVsYXRpdmUob3V0RGlyLCBvdXRGaWxlRGlyKSkuc3BsaXQoJy8nKTtcbiAgICBsZXQgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBNYXRoLm1pbihzcmNEaXJQYXJ0cy5sZW5ndGgsIG91dERpclBhcnRzLmxlbmd0aCkgJiZcbiAgICAgICAgICAgc3JjRGlyUGFydHNbc3JjRGlyUGFydHMubGVuZ3RoIC0gMSAtIGldID09PSBvdXREaXJQYXJ0c1tvdXREaXJQYXJ0cy5sZW5ndGggLSAxIC0gaV0pXG4gICAgICBpKys7XG4gICAgY29uc3Qgcm9vdERpciA9IHNyY0RpclBhcnRzLnNsaWNlKDAsIHNyY0RpclBhcnRzLmxlbmd0aCAtIGkpLmpvaW4oJy8nKTtcbiAgICByZXR1cm4gKHNyY0ZpbGVOYW1lKSA9PiB7XG4gICAgICAvLyBOb3RlOiBCZWZvcmUgd2UgcmV0dXJuIHRoZSBtYXBwZWQgb3V0cHV0IHBhdGgsIHdlIG5lZWQgdG8gbm9ybWFsaXplIHRoZSBwYXRoIGRlbGltaXRlcnNcbiAgICAgIC8vIGJlY2F1c2UgdGhlIG91dHB1dCBwYXRoIGlzIHVzdWFsbHkgcGFzc2VkIHRvIFR5cGVTY3JpcHQgd2hpY2ggc29tZXRpbWVzIG9ubHkgZXhwZWN0c1xuICAgICAgLy8gcG9zaXggbm9ybWFsaXplZCBwYXRocyAoZS5nLiBpZiBhIGN1c3RvbSBjb21waWxlciBob3N0IGlzIHVzZWQpXG4gICAgICByZXR1cm4gbm9ybWFsaXplU2VwYXJhdG9ycyhob3N0LnJlc29sdmUob3V0RGlyLCBob3N0LnJlbGF0aXZlKHJvb3REaXIsIHNyY0ZpbGVOYW1lKSkpO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgLy8gTm90ZTogQmVmb3JlIHdlIHJldHVybiB0aGUgb3V0cHV0IHBhdGgsIHdlIG5lZWQgdG8gbm9ybWFsaXplIHRoZSBwYXRoIGRlbGltaXRlcnMgYmVjYXVzZVxuICAgIC8vIHRoZSBvdXRwdXQgcGF0aCBpcyB1c3VhbGx5IHBhc3NlZCB0byBUeXBlU2NyaXB0IHdoaWNoIG9ubHkgcGFzc2VzIGFyb3VuZCBwb3NpeFxuICAgIC8vIG5vcm1hbGl6ZWQgcGF0aHMgKGUuZy4gaWYgYSBjdXN0b20gY29tcGlsZXIgaG9zdCBpcyB1c2VkKVxuICAgIHJldHVybiAoc3JjRmlsZU5hbWUpID0+IG5vcm1hbGl6ZVNlcGFyYXRvcnMoc3JjRmlsZU5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpMThuRXh0cmFjdChcbiAgICBmb3JtYXROYW1lOiBzdHJpbmd8bnVsbCwgb3V0RmlsZTogc3RyaW5nfG51bGwsIGhvc3Q6IHRzLkNvbXBpbGVySG9zdCwgb3B0aW9uczogQ29tcGlsZXJPcHRpb25zLFxuICAgIGJ1bmRsZTogTWVzc2FnZUJ1bmRsZSk6IHN0cmluZ1tdIHtcbiAgZm9ybWF0TmFtZSA9IGZvcm1hdE5hbWUgfHwgJ3hsZic7XG4gIC8vIENoZWNrcyB0aGUgZm9ybWF0IGFuZCByZXR1cm5zIHRoZSBleHRlbnNpb25cbiAgY29uc3QgZXh0ID0gaTE4bkdldEV4dGVuc2lvbihmb3JtYXROYW1lKTtcbiAgY29uc3QgY29udGVudCA9IGkxOG5TZXJpYWxpemUoYnVuZGxlLCBmb3JtYXROYW1lLCBvcHRpb25zKTtcbiAgY29uc3QgZHN0RmlsZSA9IG91dEZpbGUgfHwgYG1lc3NhZ2VzLiR7ZXh0fWA7XG4gIGNvbnN0IGRzdFBhdGggPSBwYXRoLnJlc29sdmUob3B0aW9ucy5vdXREaXIgfHwgb3B0aW9ucy5iYXNlUGF0aCEsIGRzdEZpbGUpO1xuICBob3N0LndyaXRlRmlsZShkc3RQYXRoLCBjb250ZW50LCBmYWxzZSwgdW5kZWZpbmVkLCBbXSk7XG4gIHJldHVybiBbZHN0UGF0aF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpMThuU2VyaWFsaXplKFxuICAgIGJ1bmRsZTogTWVzc2FnZUJ1bmRsZSwgZm9ybWF0TmFtZTogc3RyaW5nLCBvcHRpb25zOiBDb21waWxlck9wdGlvbnMpOiBzdHJpbmcge1xuICBjb25zdCBmb3JtYXQgPSBmb3JtYXROYW1lLnRvTG93ZXJDYXNlKCk7XG4gIGxldCBzZXJpYWxpemVyOiBTZXJpYWxpemVyO1xuXG4gIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgY2FzZSAneG1iJzpcbiAgICAgIHNlcmlhbGl6ZXIgPSBuZXcgWG1iKCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd4bGlmZjInOlxuICAgIGNhc2UgJ3hsZjInOlxuICAgICAgc2VyaWFsaXplciA9IG5ldyBYbGlmZjIoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3hsZic6XG4gICAgY2FzZSAneGxpZmYnOlxuICAgIGRlZmF1bHQ6XG4gICAgICBzZXJpYWxpemVyID0gbmV3IFhsaWZmKCk7XG4gIH1cblxuICByZXR1cm4gYnVuZGxlLndyaXRlKHNlcmlhbGl6ZXIsIGdldFBhdGhOb3JtYWxpemVyKG9wdGlvbnMuYmFzZVBhdGgpKTtcbn1cblxuZnVuY3Rpb24gZ2V0UGF0aE5vcm1hbGl6ZXIoYmFzZVBhdGg/OiBzdHJpbmcpIHtcbiAgLy8gbm9ybWFsaXplIHNvdXJjZSBwYXRocyBieSByZW1vdmluZyB0aGUgYmFzZSBwYXRoIGFuZCBhbHdheXMgdXNpbmcgXCIvXCIgYXMgYSBzZXBhcmF0b3JcbiAgcmV0dXJuIChzb3VyY2VQYXRoOiBzdHJpbmcpID0+IHtcbiAgICBzb3VyY2VQYXRoID0gYmFzZVBhdGggPyBwYXRoLnJlbGF0aXZlKGJhc2VQYXRoLCBzb3VyY2VQYXRoKSA6IHNvdXJjZVBhdGg7XG4gICAgcmV0dXJuIHNvdXJjZVBhdGguc3BsaXQocGF0aC5zZXApLmpvaW4oJy8nKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGkxOG5HZXRFeHRlbnNpb24oZm9ybWF0TmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgZm9ybWF0ID0gZm9ybWF0TmFtZS50b0xvd2VyQ2FzZSgpO1xuXG4gIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgY2FzZSAneG1iJzpcbiAgICAgIHJldHVybiAneG1iJztcbiAgICBjYXNlICd4bGYnOlxuICAgIGNhc2UgJ3hsaWYnOlxuICAgIGNhc2UgJ3hsaWZmJzpcbiAgICBjYXNlICd4bGYyJzpcbiAgICBjYXNlICd4bGlmZjInOlxuICAgICAgcmV0dXJuICd4bGYnO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBmb3JtYXQgXCIke2Zvcm1hdE5hbWV9XCJgKTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VFbWl0UmVzdWx0cyhlbWl0UmVzdWx0czogdHMuRW1pdFJlc3VsdFtdKTogdHMuRW1pdFJlc3VsdCB7XG4gIGNvbnN0IGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10gPSBbXTtcbiAgbGV0IGVtaXRTa2lwcGVkID0gZmFsc2U7XG4gIGNvbnN0IGVtaXR0ZWRGaWxlczogc3RyaW5nW10gPSBbXTtcbiAgZm9yIChjb25zdCBlciBvZiBlbWl0UmVzdWx0cykge1xuICAgIGRpYWdub3N0aWNzLnB1c2goLi4uZXIuZGlhZ25vc3RpY3MpO1xuICAgIGVtaXRTa2lwcGVkID0gZW1pdFNraXBwZWQgfHwgZXIuZW1pdFNraXBwZWQ7XG4gICAgZW1pdHRlZEZpbGVzLnB1c2goLi4uKGVyLmVtaXR0ZWRGaWxlcyB8fCBbXSkpO1xuICB9XG4gIHJldHVybiB7ZGlhZ25vc3RpY3MsIGVtaXRTa2lwcGVkLCBlbWl0dGVkRmlsZXN9O1xufVxuXG5mdW5jdGlvbiBkaWFnbm9zdGljU291cmNlT2ZTcGFuKHNwYW46IFBhcnNlU291cmNlU3Bhbik6IHRzLlNvdXJjZUZpbGUge1xuICAvLyBGb3IgZGlhZ25vc3RpY3MsIFR5cGVTY3JpcHQgb25seSB1c2VzIHRoZSBmaWxlTmFtZSBhbmQgdGV4dCBwcm9wZXJ0aWVzLlxuICAvLyBUaGUgcmVkdW5kYW50ICcoKScgYXJlIGhlcmUgaXMgdG8gYXZvaWQgaGF2aW5nIGNsYW5nLWZvcm1hdCBicmVha2luZyB0aGUgbGluZSBpbmNvcnJlY3RseS5cbiAgcmV0dXJuICh7ZmlsZU5hbWU6IHNwYW4uc3RhcnQuZmlsZS51cmwsIHRleHQ6IHNwYW4uc3RhcnQuZmlsZS5jb250ZW50fSBhcyBhbnkpO1xufVxuXG5mdW5jdGlvbiBkaWFnbm9zdGljU291cmNlT2ZGaWxlTmFtZShmaWxlTmFtZTogc3RyaW5nLCBwcm9ncmFtOiB0cy5Qcm9ncmFtKTogdHMuU291cmNlRmlsZSB7XG4gIGNvbnN0IHNvdXJjZUZpbGUgPSBwcm9ncmFtLmdldFNvdXJjZUZpbGUoZmlsZU5hbWUpO1xuICBpZiAoc291cmNlRmlsZSkgcmV0dXJuIHNvdXJjZUZpbGU7XG5cbiAgLy8gSWYgd2UgYXJlIHJlcG9ydGluZyBkaWFnbm9zdGljcyBmb3IgYSBzb3VyY2UgZmlsZSB0aGF0IGlzIG5vdCBpbiB0aGUgcHJvamVjdCB0aGVuIHdlIG5lZWRcbiAgLy8gdG8gZmFrZSBhIHNvdXJjZSBmaWxlIHNvIHRoZSBkaWFnbm9zdGljIGZvcm1hdHRpbmcgcm91dGluZXMgY2FuIGVtaXQgdGhlIGZpbGUgbmFtZS5cbiAgLy8gVGhlIHJlZHVuZGFudCAnKCknIGFyZSBoZXJlIGlzIHRvIGF2b2lkIGhhdmluZyBjbGFuZy1mb3JtYXQgYnJlYWtpbmcgdGhlIGxpbmUgaW5jb3JyZWN0bHkuXG4gIHJldHVybiAoe2ZpbGVOYW1lLCB0ZXh0OiAnJ30gYXMgYW55KTtcbn1cblxuXG5mdW5jdGlvbiBkaWFnbm9zdGljQ2hhaW5Gcm9tRm9ybWF0dGVkRGlhZ25vc3RpY0NoYWluKGNoYWluOiBGb3JtYXR0ZWRNZXNzYWdlQ2hhaW4pOlxuICAgIERpYWdub3N0aWNNZXNzYWdlQ2hhaW4ge1xuICByZXR1cm4ge1xuICAgIG1lc3NhZ2VUZXh0OiBjaGFpbi5tZXNzYWdlLFxuICAgIG5leHQ6IGNoYWluLm5leHQgJiYgY2hhaW4ubmV4dC5tYXAoZGlhZ25vc3RpY0NoYWluRnJvbUZvcm1hdHRlZERpYWdub3N0aWNDaGFpbiksXG4gICAgcG9zaXRpb246IGNoYWluLnBvc2l0aW9uXG4gIH07XG59XG5cbmZ1bmN0aW9uIHN5bnRheEVycm9yVG9EaWFnbm9zdGljcyhlcnJvcjogRXJyb3IsIHByb2dyYW06IHRzLlByb2dyYW0pOiBEaWFnbm9zdGljW10ge1xuICBjb25zdCBwYXJzZXJFcnJvcnMgPSBnZXRQYXJzZUVycm9ycyhlcnJvcik7XG4gIGlmIChwYXJzZXJFcnJvcnMgJiYgcGFyc2VyRXJyb3JzLmxlbmd0aCkge1xuICAgIHJldHVybiBwYXJzZXJFcnJvcnMubWFwPERpYWdub3N0aWM+KGUgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VUZXh0OiBlLmNvbnRleHR1YWxNZXNzYWdlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBkaWFnbm9zdGljU291cmNlT2ZTcGFuKGUuc3BhbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogZS5zcGFuLnN0YXJ0Lm9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aDogZS5zcGFuLmVuZC5vZmZzZXQgLSBlLnNwYW4uc3RhcnQub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZTogU09VUkNFLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogREVGQVVMVF9FUlJPUl9DT0RFXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICB9IGVsc2UgaWYgKGlzRm9ybWF0dGVkRXJyb3IoZXJyb3IpKSB7XG4gICAgcmV0dXJuIFt7XG4gICAgICBtZXNzYWdlVGV4dDogZXJyb3IubWVzc2FnZSxcbiAgICAgIGNoYWluOiBlcnJvci5jaGFpbiAmJiBkaWFnbm9zdGljQ2hhaW5Gcm9tRm9ybWF0dGVkRGlhZ25vc3RpY0NoYWluKGVycm9yLmNoYWluKSxcbiAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICBzb3VyY2U6IFNPVVJDRSxcbiAgICAgIGNvZGU6IERFRkFVTFRfRVJST1JfQ09ERSxcbiAgICAgIHBvc2l0aW9uOiBlcnJvci5wb3NpdGlvblxuICAgIH1dO1xuICB9XG5cbiAgY29uc3QgbmdNb2R1bGVFcnJvckRhdGEgPSBnZXRNaXNzaW5nTmdNb2R1bGVNZXRhZGF0YUVycm9yRGF0YShlcnJvcik7XG4gIGlmIChuZ01vZHVsZUVycm9yRGF0YSAhPT0gbnVsbCkge1xuICAgIC8vIFRoaXMgZXJyb3IgcmVwcmVzZW50cyB0aGUgaW1wb3J0IG9yIGV4cG9ydCBvZiBhbiBgTmdNb2R1bGVgIHRoYXQgZGlkbid0IGhhdmUgdmFsaWQgbWV0YWRhdGEuXG4gICAgLy8gVGhpcyBfbWlnaHRfIGhhcHBlbiBiZWNhdXNlIHRoZSBOZ01vZHVsZSBpbiBxdWVzdGlvbiBpcyBhbiBJdnktY29tcGlsZWQgbGlicmFyeSwgYW5kIHdlIHdhbnRcbiAgICAvLyB0byBzaG93IGEgbW9yZSB1c2VmdWwgZXJyb3IgaWYgdGhhdCdzIHRoZSBjYXNlLlxuICAgIGNvbnN0IG5nTW9kdWxlQ2xhc3MgPVxuICAgICAgICBnZXREdHNDbGFzcyhwcm9ncmFtLCBuZ01vZHVsZUVycm9yRGF0YS5maWxlTmFtZSwgbmdNb2R1bGVFcnJvckRhdGEuY2xhc3NOYW1lKTtcbiAgICBpZiAobmdNb2R1bGVDbGFzcyAhPT0gbnVsbCAmJiBpc0l2eU5nTW9kdWxlKG5nTW9kdWxlQ2xhc3MpKSB7XG4gICAgICByZXR1cm4gW3tcbiAgICAgICAgbWVzc2FnZVRleHQ6IGBUaGUgTmdNb2R1bGUgJyR7bmdNb2R1bGVFcnJvckRhdGEuY2xhc3NOYW1lfScgaW4gJyR7XG4gICAgICAgICAgICBuZ01vZHVsZUVycm9yRGF0YVxuICAgICAgICAgICAgICAgIC5maWxlTmFtZX0nIGlzIGltcG9ydGVkIGJ5IHRoaXMgY29tcGlsYXRpb24sIGJ1dCBhcHBlYXJzIHRvIGJlIHBhcnQgb2YgYSBsaWJyYXJ5IGNvbXBpbGVkIGZvciBBbmd1bGFyIEl2eS4gVGhpcyBtYXkgb2NjdXIgYmVjYXVzZTpcblxuICAxKSB0aGUgbGlicmFyeSB3YXMgcHJvY2Vzc2VkIHdpdGggJ25nY2MnLiBSZW1vdmluZyBhbmQgcmVpbnN0YWxsaW5nIG5vZGVfbW9kdWxlcyBtYXkgZml4IHRoaXMgcHJvYmxlbS5cblxuICAyKSB0aGUgbGlicmFyeSB3YXMgcHVibGlzaGVkIGZvciBBbmd1bGFyIEl2eSBhbmQgdjEyKyBhcHBsaWNhdGlvbnMgb25seS4gQ2hlY2sgaXRzIHBlZXIgZGVwZW5kZW5jaWVzIGNhcmVmdWxseSBhbmQgZW5zdXJlIHRoYXQgeW91J3JlIHVzaW5nIGEgY29tcGF0aWJsZSB2ZXJzaW9uIG9mIEFuZ3VsYXIuXG5cblNlZSBodHRwczovL2FuZ3VsYXIuaW8vZXJyb3JzL05HNjk5OSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbmAsXG4gICAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICAgIGNvZGU6IERFRkFVTFRfRVJST1JfQ09ERSxcbiAgICAgICAgc291cmNlOiBTT1VSQ0UsXG4gICAgICB9XTtcbiAgICB9XG4gIH1cblxuICAvLyBQcm9kdWNlIGEgRGlhZ25vc3RpYyBhbnl3YXkgc2luY2Ugd2Uga25vdyBmb3Igc3VyZSBgZXJyb3JgIGlzIGEgU3ludGF4RXJyb3JcbiAgcmV0dXJuIFt7XG4gICAgbWVzc2FnZVRleHQ6IGVycm9yLm1lc3NhZ2UsXG4gICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICBjb2RlOiBERUZBVUxUX0VSUk9SX0NPREUsXG4gICAgc291cmNlOiBTT1VSQ0UsXG4gIH1dO1xufVxuXG5mdW5jdGlvbiBnZXREdHNDbGFzcyhwcm9ncmFtOiB0cy5Qcm9ncmFtLCBmaWxlTmFtZTogc3RyaW5nLCBjbGFzc05hbWU6IHN0cmluZyk6IHRzLkNsYXNzRGVjbGFyYXRpb258XG4gICAgbnVsbCB7XG4gIGNvbnN0IHNmID0gcHJvZ3JhbS5nZXRTb3VyY2VGaWxlKGZpbGVOYW1lKTtcbiAgaWYgKHNmID09PSB1bmRlZmluZWQgfHwgIXNmLmlzRGVjbGFyYXRpb25GaWxlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgZm9yIChjb25zdCBzdG10IG9mIHNmLnN0YXRlbWVudHMpIHtcbiAgICBpZiAoIXRzLmlzQ2xhc3NEZWNsYXJhdGlvbihzdG10KSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChzdG10Lm5hbWUgPT09IHVuZGVmaW5lZCB8fCBzdG10Lm5hbWUudGV4dCAhPT0gY2xhc3NOYW1lKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RtdDtcbiAgfVxuXG4gIC8vIE5vIGNsYXNzZXMgZm91bmQgdGhhdCBtYXRjaGVkIHRoZSBnaXZlbiBuYW1lLlxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNJdnlOZ01vZHVsZShjbGF6ejogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IGJvb2xlYW4ge1xuICBmb3IgKGNvbnN0IG1lbWJlciBvZiBjbGF6ei5tZW1iZXJzKSB7XG4gICAgaWYgKCF0cy5pc1Byb3BlcnR5RGVjbGFyYXRpb24obWVtYmVyKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmICh0cy5pc0lkZW50aWZpZXIobWVtYmVyLm5hbWUpICYmIG1lbWJlci5uYW1lLnRleHQgPT09ICfJtW1vZCcpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIE5vIEl2eSAnybVtb2QnIHByb3BlcnR5IGZvdW5kLlxuICByZXR1cm4gZmFsc2U7XG59Il19