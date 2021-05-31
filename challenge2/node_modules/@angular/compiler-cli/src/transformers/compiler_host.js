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
        define("@angular/compiler-cli/src/transformers/compiler_host", ["require", "exports", "tslib", "@angular/compiler", "path", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/transformers/metadata_reader", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOriginalReferences = exports.TsCompilerAotCompilerTypeCheckHostAdapter = exports.createCompilerHost = exports.setWrapHostForTest = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var path = require("path");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var metadata_reader_1 = require("@angular/compiler-cli/src/transformers/metadata_reader");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    var NODE_MODULES_PACKAGE_NAME = /node_modules\/((\w|-|\.)+|(@(\w|-|\.)+\/(\w|-|\.)+))/;
    var EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
    var CSS_PREPROCESSOR_EXT = /(\.scss|\.sass|\.less|\.styl)$/;
    var wrapHostForTest = null;
    function setWrapHostForTest(wrapFn) {
        wrapHostForTest = wrapFn;
    }
    exports.setWrapHostForTest = setWrapHostForTest;
    function createCompilerHost(_a) {
        var options = _a.options, _b = _a.tsHost, tsHost = _b === void 0 ? ts.createCompilerHost(options, true) : _b;
        if (wrapHostForTest !== null) {
            tsHost = wrapHostForTest(tsHost);
        }
        return tsHost;
    }
    exports.createCompilerHost = createCompilerHost;
    function assert(condition) {
        if (!condition) {
            // TODO(chuckjaz): do the right thing
        }
        return condition;
    }
    /**
     * Implements the following hosts based on an api.CompilerHost:
     * - ts.CompilerHost to be consumed by a ts.Program
     * - AotCompilerHost for @angular/compiler
     * - TypeCheckHost for mapping ts errors to ng errors (via translateDiagnostics)
     */
    var TsCompilerAotCompilerTypeCheckHostAdapter = /** @class */ (function () {
        function TsCompilerAotCompilerTypeCheckHostAdapter(rootFiles, options, context, metadataProvider, codeGenerator, librarySummaries) {
            var _this = this;
            if (librarySummaries === void 0) { librarySummaries = new Map(); }
            this.rootFiles = rootFiles;
            this.options = options;
            this.context = context;
            this.metadataProvider = metadataProvider;
            this.codeGenerator = codeGenerator;
            this.librarySummaries = librarySummaries;
            this.metadataReaderCache = metadata_reader_1.createMetadataReaderCache();
            this.fileNameToModuleNameCache = new Map();
            this.flatModuleIndexCache = new Map();
            this.flatModuleIndexNames = new Set();
            this.flatModuleIndexRedirectNames = new Set();
            this.originalSourceFiles = new Map();
            this.originalFileExistsCache = new Map();
            this.generatedSourceFiles = new Map();
            this.generatedCodeFor = new Map();
            this.emitter = new compiler_1.TypeScriptEmitter();
            this.getDefaultLibFileName = function (options) {
                return _this.context.getDefaultLibFileName(options);
            };
            this.getCurrentDirectory = function () { return _this.context.getCurrentDirectory(); };
            this.getCanonicalFileName = function (fileName) { return _this.context.getCanonicalFileName(fileName); };
            this.useCaseSensitiveFileNames = function () { return _this.context.useCaseSensitiveFileNames(); };
            this.getNewLine = function () { return _this.context.getNewLine(); };
            // Make sure we do not `host.realpath()` from TS as we do not want to resolve symlinks.
            // https://github.com/Microsoft/TypeScript/issues/9552
            this.realpath = function (p) { return p; };
            this.writeFile = this.context.writeFile.bind(this.context);
            this.moduleResolutionCache = ts.createModuleResolutionCache(this.context.getCurrentDirectory(), this.context.getCanonicalFileName.bind(this.context));
            var basePath = this.options.basePath;
            this.rootDirs =
                (this.options.rootDirs || [this.options.basePath]).map(function (p) { return path.resolve(basePath, p); });
            if (context.getDirectories) {
                this.getDirectories = function (path) { return context.getDirectories(path); };
            }
            if (context.directoryExists) {
                this.directoryExists = function (directoryName) { return context.directoryExists(directoryName); };
            }
            if (context.getCancellationToken) {
                this.getCancellationToken = function () { return context.getCancellationToken(); };
            }
            if (context.getDefaultLibLocation) {
                this.getDefaultLibLocation = function () { return context.getDefaultLibLocation(); };
            }
            if (context.resolveTypeReferenceDirectives) {
                this.resolveTypeReferenceDirectives = function (names, containingFile) {
                    return context.resolveTypeReferenceDirectives(names, containingFile);
                };
            }
            if (context.trace) {
                this.trace = function (s) { return context.trace(s); };
            }
            if (context.fileNameToModuleName) {
                this.fileNameToModuleName = context.fileNameToModuleName.bind(context);
            }
            // Note: don't copy over context.moduleNameToFileName as we first
            // normalize undefined containingFile to a filled containingFile.
            if (context.resourceNameToFileName) {
                this.resourceNameToFileName = context.resourceNameToFileName.bind(context);
            }
            if (context.toSummaryFileName) {
                this.toSummaryFileName = context.toSummaryFileName.bind(context);
            }
            if (context.fromSummaryFileName) {
                this.fromSummaryFileName = context.fromSummaryFileName.bind(context);
            }
            this.metadataReaderHost = {
                cacheMetadata: function () { return true; },
                getSourceFileMetadata: function (filePath) {
                    var sf = _this.getOriginalSourceFile(filePath);
                    return sf ? _this.metadataProvider.getMetadata(sf) : undefined;
                },
                fileExists: function (filePath) { return _this.originalFileExists(filePath); },
                readFile: function (filePath) { return assert(_this.context.readFile(filePath)); },
            };
        }
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.resolveModuleName = function (moduleName, containingFile) {
            var rm = ts.resolveModuleName(moduleName, containingFile.replace(/\\/g, '/'), this.options, this, this.moduleResolutionCache)
                .resolvedModule;
            if (rm && this.isSourceFile(rm.resolvedFileName) && util_1.DTS.test(rm.resolvedFileName)) {
                // Case: generateCodeForLibraries = true and moduleName is
                // a .d.ts file in a node_modules folder.
                // Need to set isExternalLibraryImport to false so that generated files for that file
                // are emitted.
                rm.isExternalLibraryImport = false;
            }
            return rm;
        };
        // Note: We implement this method so that TypeScript and Angular share the same
        // ts.ModuleResolutionCache
        // and that we can tell ts.Program about our different opinion about
        // ResolvedModule.isExternalLibraryImport
        // (see our isSourceFile method).
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.resolveModuleNames = function (moduleNames, containingFile) {
            var _this = this;
            // TODO(tbosch): this seems to be a typing error in TypeScript,
            // as it contains assertions that the result contains the same number of entries
            // as the given module names.
            return moduleNames.map(function (moduleName) { return _this.resolveModuleName(moduleName, containingFile); });
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.moduleNameToFileName = function (m, containingFile) {
            if (!containingFile) {
                if (m.indexOf('.') === 0) {
                    throw new Error('Resolution of relative paths requires a containing file.');
                }
                // Any containing file gives the same result for absolute imports
                containingFile = this.rootFiles[0];
            }
            if (this.context.moduleNameToFileName) {
                return this.context.moduleNameToFileName(m, containingFile);
            }
            var resolved = this.resolveModuleName(m, containingFile);
            return resolved ? resolved.resolvedFileName : null;
        };
        /**
         * We want a moduleId that will appear in import statements in the generated code
         * which will be written to `containingFile`.
         *
         * Note that we also generate files for files in node_modules, as libraries
         * only ship .metadata.json files but not the generated code.
         *
         * Logic:
         * 1. if the importedFile and the containingFile are from the project sources
         *    or from the same node_modules package, use a relative path
         * 2. if the importedFile is in a node_modules package,
         *    use a path that starts with the package name.
         * 3. Error if the containingFile is in the node_modules package
         *    and the importedFile is in the project soures,
         *    as that is a violation of the principle that node_modules packages cannot
         *    import project sources.
         */
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.fileNameToModuleName = function (importedFile, containingFile) {
            var cacheKey = importedFile + ":" + containingFile;
            var moduleName = this.fileNameToModuleNameCache.get(cacheKey);
            if (moduleName != null) {
                return moduleName;
            }
            var originalImportedFile = importedFile;
            if (this.options.traceResolution) {
                console.error('fileNameToModuleName from containingFile', containingFile, 'to importedFile', importedFile);
            }
            // drop extension
            importedFile = importedFile.replace(EXT, '');
            var importedFilePackageName = getPackageName(importedFile);
            var containingFilePackageName = getPackageName(containingFile);
            if (importedFilePackageName === containingFilePackageName ||
                util_1.GENERATED_FILES.test(originalImportedFile)) {
                var rootedContainingFile = util_1.relativeToRootDirs(containingFile, this.rootDirs);
                var rootedImportedFile = util_1.relativeToRootDirs(importedFile, this.rootDirs);
                if (rootedContainingFile !== containingFile && rootedImportedFile !== importedFile) {
                    // if both files are contained in the `rootDirs`, then strip the rootDirs
                    containingFile = rootedContainingFile;
                    importedFile = rootedImportedFile;
                }
                moduleName = dotRelative(path.dirname(containingFile), importedFile);
            }
            else if (importedFilePackageName) {
                moduleName = stripNodeModulesPrefix(importedFile);
                if (originalImportedFile.endsWith('.d.ts')) {
                    // the moduleName for these typings could be shortented to the npm package name
                    // if the npm package typings matches the importedFile
                    try {
                        var modulePath = importedFile.substring(0, importedFile.length - moduleName.length) +
                            importedFilePackageName;
                        var packageJson = require(modulePath + '/package.json');
                        var packageTypings = file_system_1.join(modulePath, packageJson.typings);
                        if (packageTypings === originalImportedFile) {
                            moduleName = importedFilePackageName;
                        }
                    }
                    catch (_a) {
                        // the above require() will throw if there is no package.json file
                        // and this is safe to ignore and correct to keep the longer
                        // moduleName in this case
                    }
                }
            }
            else {
                throw new Error("Trying to import a source file from a node_modules package: import " + originalImportedFile + " from " + containingFile);
            }
            this.fileNameToModuleNameCache.set(cacheKey, moduleName);
            return moduleName;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.resourceNameToFileName = function (resourceName, containingFile) {
            // Note: we convert package paths into relative paths to be compatible with the the
            // previous implementation of UrlResolver.
            var firstChar = resourceName[0];
            if (firstChar === '/') {
                resourceName = resourceName.slice(1);
            }
            else if (firstChar !== '.') {
                resourceName = "./" + resourceName;
            }
            var filePathWithNgResource = this.moduleNameToFileName(addNgResourceSuffix(resourceName), containingFile);
            // If the user specified styleUrl pointing to *.scss, but the Sass compiler was run before
            // Angular, then the resource may have been generated as *.css. Simply try the resolution again.
            if (!filePathWithNgResource && CSS_PREPROCESSOR_EXT.test(resourceName)) {
                var fallbackResourceName = resourceName.replace(CSS_PREPROCESSOR_EXT, '.css');
                filePathWithNgResource =
                    this.moduleNameToFileName(addNgResourceSuffix(fallbackResourceName), containingFile);
            }
            var result = filePathWithNgResource ? stripNgResourceSuffix(filePathWithNgResource) : null;
            // Used under Bazel to report more specific error with remediation advice
            if (!result && this.context.reportMissingResource) {
                this.context.reportMissingResource(resourceName);
            }
            return result;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.toSummaryFileName = function (fileName, referringSrcFileName) {
            return this.fileNameToModuleName(fileName, referringSrcFileName);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.fromSummaryFileName = function (fileName, referringLibFileName) {
            var resolved = this.moduleNameToFileName(fileName, referringLibFileName);
            if (!resolved) {
                throw new Error("Could not resolve " + fileName + " from " + referringLibFileName);
            }
            return resolved;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.parseSourceSpanOf = function (fileName, line, character) {
            var data = this.generatedSourceFiles.get(fileName);
            if (data && data.emitCtx) {
                return data.emitCtx.spanOf(line, character);
            }
            return null;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.getOriginalSourceFile = function (filePath, languageVersion, onError) {
            // Note: we need the explicit check via `has` as we also cache results
            // that were null / undefined.
            if (this.originalSourceFiles.has(filePath)) {
                return this.originalSourceFiles.get(filePath);
            }
            if (!languageVersion) {
                languageVersion = this.options.target || ts.ScriptTarget.Latest;
            }
            // Note: This can also return undefined,
            // as the TS typings are not correct!
            var sf = this.context.getSourceFile(filePath, languageVersion, onError) || null;
            this.originalSourceFiles.set(filePath, sf);
            return sf;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.updateGeneratedFile = function (genFile) {
            if (!genFile.stmts) {
                throw new Error("Invalid Argument: Expected a GenerateFile with statements. " + genFile.genFileUrl);
            }
            var oldGenFile = this.generatedSourceFiles.get(genFile.genFileUrl);
            if (!oldGenFile) {
                throw new Error("Illegal State: previous GeneratedFile not found for " + genFile.genFileUrl + ".");
            }
            var newRefs = genFileExternalReferences(genFile);
            var oldRefs = oldGenFile.externalReferences;
            var refsAreEqual = oldRefs.size === newRefs.size;
            if (refsAreEqual) {
                newRefs.forEach(function (r) { return refsAreEqual = refsAreEqual && oldRefs.has(r); });
            }
            if (!refsAreEqual) {
                throw new Error("Illegal State: external references changed in " + genFile.genFileUrl + ".\nOld: " + Array.from(oldRefs) + ".\nNew: " + Array.from(newRefs));
            }
            return this.addGeneratedFile(genFile, newRefs);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.addGeneratedFile = function (genFile, externalReferences) {
            if (!genFile.stmts) {
                throw new Error("Invalid Argument: Expected a GenerateFile with statements. " + genFile.genFileUrl);
            }
            var _a = this.emitter.emitStatementsAndContext(genFile.genFileUrl, genFile.stmts, /* preamble */ '', 
            /* emitSourceMaps */ false), sourceText = _a.sourceText, context = _a.context;
            var sf = ts.createSourceFile(genFile.genFileUrl, sourceText, this.options.target || ts.ScriptTarget.Latest);
            if (this.options.module === ts.ModuleKind.AMD || this.options.module === ts.ModuleKind.UMD) {
                if (this.context.amdModuleName) {
                    var moduleName = this.context.amdModuleName(sf);
                    if (moduleName)
                        sf.moduleName = moduleName;
                }
                else if (/node_modules/.test(genFile.genFileUrl)) {
                    // If we are generating an ngModule file under node_modules, we know the right module name
                    // We don't need the host to supply a function in this case.
                    sf.moduleName = stripNodeModulesPrefix(genFile.genFileUrl.replace(EXT, ''));
                }
            }
            this.generatedSourceFiles.set(genFile.genFileUrl, {
                sourceFile: sf,
                emitCtx: context,
                externalReferences: externalReferences,
            });
            return sf;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.shouldGenerateFile = function (fileName) {
            var _this = this;
            // TODO(tbosch): allow generating files that are not in the rootDir
            // See https://github.com/angular/angular/issues/19337
            if (!util_1.isInRootDir(fileName, this.options)) {
                return { generate: false };
            }
            var genMatch = util_1.GENERATED_FILES.exec(fileName);
            if (!genMatch) {
                return { generate: false };
            }
            var _a = tslib_1.__read(genMatch, 4), base = _a[1], genSuffix = _a[2], suffix = _a[3];
            if (suffix !== 'ts' && suffix !== 'tsx') {
                return { generate: false };
            }
            var baseFileName;
            if (genSuffix.indexOf('ngstyle') >= 0) {
                // Note: ngstyle files have names like `afile.css.ngstyle.ts`
                if (!this.originalFileExists(base)) {
                    return { generate: false };
                }
            }
            else {
                // Note: on-the-fly generated files always have a `.ts` suffix,
                // but the file from which we generated it can be a `.ts`/ `.tsx`/ `.d.ts`
                // (see options.generateCodeForLibraries).
                baseFileName = [base + ".ts", base + ".tsx", base + ".d.ts"].find(function (baseFileName) { return _this.isSourceFile(baseFileName) && _this.originalFileExists(baseFileName); });
                if (!baseFileName) {
                    return { generate: false };
                }
            }
            return { generate: true, baseFileName: baseFileName };
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.shouldGenerateFilesFor = function (fileName) {
            // TODO(tbosch): allow generating files that are not in the rootDir
            // See https://github.com/angular/angular/issues/19337
            return !util_1.GENERATED_FILES.test(fileName) && this.isSourceFile(fileName) &&
                util_1.isInRootDir(fileName, this.options);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.getSourceFile = function (fileName, languageVersion, onError) {
            var _this = this;
            // Note: Don't exit early in this method to make sure
            // we always have up to date references on the file!
            var genFileNames = [];
            var sf = this.getGeneratedFile(fileName);
            if (!sf) {
                var summary = this.librarySummaries.get(fileName);
                if (summary) {
                    if (!summary.sourceFile) {
                        summary.sourceFile = ts.createSourceFile(fileName, summary.text, this.options.target || ts.ScriptTarget.Latest);
                    }
                    sf = summary.sourceFile;
                    // TypeScript doesn't allow returning redirect source files. To avoid unforseen errors we
                    // return the original source file instead of the redirect target.
                    var redirectInfo = sf.redirectInfo;
                    if (redirectInfo !== undefined) {
                        sf = redirectInfo.unredirected;
                    }
                    genFileNames = [];
                }
            }
            if (!sf) {
                sf = this.getOriginalSourceFile(fileName);
                var cachedGenFiles = this.generatedCodeFor.get(fileName);
                if (cachedGenFiles) {
                    genFileNames = cachedGenFiles;
                }
                else {
                    if (!this.options.noResolve && this.shouldGenerateFilesFor(fileName)) {
                        genFileNames = this.codeGenerator.findGeneratedFileNames(fileName).filter(function (fileName) { return _this.shouldGenerateFile(fileName).generate; });
                    }
                    this.generatedCodeFor.set(fileName, genFileNames);
                }
            }
            if (sf) {
                addReferencesToSourceFile(sf, genFileNames);
            }
            // TODO(tbosch): TypeScript's typings for getSourceFile are incorrect,
            // as it can very well return undefined.
            return sf;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.getGeneratedFile = function (fileName) {
            var genSrcFile = this.generatedSourceFiles.get(fileName);
            if (genSrcFile) {
                return genSrcFile.sourceFile;
            }
            var _a = this.shouldGenerateFile(fileName), generate = _a.generate, baseFileName = _a.baseFileName;
            if (generate) {
                var genFile = this.codeGenerator.generateFile(fileName, baseFileName);
                return this.addGeneratedFile(genFile, genFileExternalReferences(genFile));
            }
            return null;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.originalFileExists = function (fileName) {
            var fileExists = this.originalFileExistsCache.get(fileName);
            if (fileExists == null) {
                fileExists = this.context.fileExists(fileName);
                this.originalFileExistsCache.set(fileName, fileExists);
            }
            return fileExists;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.fileExists = function (fileName) {
            fileName = stripNgResourceSuffix(fileName);
            if (this.librarySummaries.has(fileName) || this.generatedSourceFiles.has(fileName)) {
                return true;
            }
            if (this.shouldGenerateFile(fileName).generate) {
                return true;
            }
            return this.originalFileExists(fileName);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.loadSummary = function (filePath) {
            var summary = this.librarySummaries.get(filePath);
            if (summary) {
                return summary.text;
            }
            if (this.originalFileExists(filePath)) {
                return assert(this.context.readFile(filePath));
            }
            return null;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.isSourceFile = function (filePath) {
            // Don't generate any files nor typecheck them
            // if skipTemplateCodegen is set and fullTemplateTypeCheck is not yet set,
            // for backwards compatibility.
            if (this.options.skipTemplateCodegen && !this.options.fullTemplateTypeCheck) {
                return false;
            }
            // If we have a summary from a previous compilation,
            // treat the file never as a source file.
            if (this.librarySummaries.has(filePath)) {
                return false;
            }
            if (util_1.GENERATED_FILES.test(filePath)) {
                return false;
            }
            if (this.options.generateCodeForLibraries === false && util_1.DTS.test(filePath)) {
                return false;
            }
            if (util_1.DTS.test(filePath)) {
                // Check for a bundle index.
                if (this.hasBundleIndex(filePath)) {
                    var normalFilePath = path.normalize(filePath);
                    return this.flatModuleIndexNames.has(normalFilePath) ||
                        this.flatModuleIndexRedirectNames.has(normalFilePath);
                }
            }
            return true;
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.readFile = function (fileName) {
            var summary = this.librarySummaries.get(fileName);
            if (summary) {
                return summary.text;
            }
            return this.context.readFile(fileName);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.getMetadataFor = function (filePath) {
            return metadata_reader_1.readMetadata(filePath, this.metadataReaderHost, this.metadataReaderCache);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.loadResource = function (filePath) {
            if (this.context.readResource)
                return this.context.readResource(filePath);
            if (!this.originalFileExists(filePath)) {
                throw compiler_1.syntaxError("Error: Resource file not found: " + filePath);
            }
            return assert(this.context.readFile(filePath));
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.getOutputName = function (filePath) {
            return path.relative(this.getCurrentDirectory(), filePath);
        };
        TsCompilerAotCompilerTypeCheckHostAdapter.prototype.hasBundleIndex = function (filePath) {
            var _this = this;
            var checkBundleIndex = function (directory) {
                var result = _this.flatModuleIndexCache.get(directory);
                if (result == null) {
                    if (path.basename(directory) == 'node_module') {
                        // Don't look outside the node_modules this package is installed in.
                        result = false;
                    }
                    else {
                        // A bundle index exists if the typings .d.ts file has a metadata.json that has an
                        // importAs.
                        try {
                            var packageFile = path.join(directory, 'package.json');
                            if (_this.originalFileExists(packageFile)) {
                                // Once we see a package.json file, assume false until it we find the bundle index.
                                result = false;
                                var packageContent = JSON.parse(assert(_this.context.readFile(packageFile)));
                                if (packageContent.typings) {
                                    var typings = path.normalize(path.join(directory, packageContent.typings));
                                    if (util_1.DTS.test(typings)) {
                                        var metadataFile = typings.replace(util_1.DTS, '.metadata.json');
                                        if (_this.originalFileExists(metadataFile)) {
                                            var metadata = JSON.parse(assert(_this.context.readFile(metadataFile)));
                                            if (metadata.flatModuleIndexRedirect) {
                                                _this.flatModuleIndexRedirectNames.add(typings);
                                                // Note: don't set result = true,
                                                // as this would mark this folder
                                                // as having a bundleIndex too early without
                                                // filling the bundleIndexNames.
                                            }
                                            else if (metadata.importAs) {
                                                _this.flatModuleIndexNames.add(typings);
                                                result = true;
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                var parent = path.dirname(directory);
                                if (parent != directory) {
                                    // Try the parent directory.
                                    result = checkBundleIndex(parent);
                                }
                                else {
                                    result = false;
                                }
                            }
                        }
                        catch (_a) {
                            // If we encounter any errors assume we this isn't a bundle index.
                            result = false;
                        }
                    }
                    _this.flatModuleIndexCache.set(directory, result);
                }
                return result;
            };
            return checkBundleIndex(path.dirname(filePath));
        };
        return TsCompilerAotCompilerTypeCheckHostAdapter;
    }());
    exports.TsCompilerAotCompilerTypeCheckHostAdapter = TsCompilerAotCompilerTypeCheckHostAdapter;
    function genFileExternalReferences(genFile) {
        return new Set(compiler_1.collectExternalReferences(genFile.stmts).map(function (er) { return er.moduleName; }));
    }
    function addReferencesToSourceFile(sf, genFileNames) {
        // Note: as we modify ts.SourceFiles we need to keep the original
        // value for `referencedFiles` around in cache the original host is caching ts.SourceFiles.
        // Note: cloning the ts.SourceFile is expensive as the nodes in have parent pointers,
        // i.e. we would also need to clone and adjust all nodes.
        var originalReferencedFiles = sf.originalReferencedFiles;
        if (!originalReferencedFiles) {
            originalReferencedFiles = sf.referencedFiles;
            sf.originalReferencedFiles = originalReferencedFiles;
        }
        var newReferencedFiles = tslib_1.__spreadArray([], tslib_1.__read(originalReferencedFiles));
        genFileNames.forEach(function (gf) { return newReferencedFiles.push({ fileName: gf, pos: 0, end: 0 }); });
        sf.referencedFiles = newReferencedFiles;
    }
    function getOriginalReferences(sourceFile) {
        return sourceFile && sourceFile.originalReferencedFiles;
    }
    exports.getOriginalReferences = getOriginalReferences;
    function dotRelative(from, to) {
        var rPath = path.relative(from, to).replace(/\\/g, '/');
        return rPath.startsWith('.') ? rPath : './' + rPath;
    }
    /**
     * Moves the path into `genDir` folder while preserving the `node_modules` directory.
     */
    function getPackageName(filePath) {
        var match = NODE_MODULES_PACKAGE_NAME.exec(filePath);
        return match ? match[1] : null;
    }
    function stripNodeModulesPrefix(filePath) {
        return filePath.replace(/.*node_modules\//, '');
    }
    function getNodeModulesPrefix(filePath) {
        var match = /.*node_modules\//.exec(filePath);
        return match ? match[1] : null;
    }
    function stripNgResourceSuffix(fileName) {
        return fileName.replace(/\.\$ngresource\$.*/, '');
    }
    function addNgResourceSuffix(fileName) {
        return fileName + ".$ngresource$";
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXJfaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvdHJhbnNmb3JtZXJzL2NvbXBpbGVyX2hvc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUFvSztJQUNwSywyQkFBNkI7SUFDN0IsK0JBQWlDO0lBSWpDLDJFQUEwQztJQUcxQywwRkFBOEY7SUFDOUYsb0VBQTZFO0lBRTdFLElBQU0seUJBQXlCLEdBQUcsc0RBQXNELENBQUM7SUFDekYsSUFBTSxHQUFHLEdBQUcsa0NBQWtDLENBQUM7SUFDL0MsSUFBTSxvQkFBb0IsR0FBRyxnQ0FBZ0MsQ0FBQztJQUU5RCxJQUFJLGVBQWUsR0FBc0QsSUFBSSxDQUFDO0lBRTlFLFNBQWdCLGtCQUFrQixDQUFDLE1BQ0k7UUFDckMsZUFBZSxHQUFHLE1BQU0sQ0FBQztJQUMzQixDQUFDO0lBSEQsZ0RBR0M7SUFFRCxTQUFnQixrQkFBa0IsQ0FDOUIsRUFDd0Q7WUFEdkQsT0FBTyxhQUFBLEVBQUUsY0FBNkMsRUFBN0MsTUFBTSxtQkFBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFBO1FBRXpELElBQUksZUFBZSxLQUFLLElBQUksRUFBRTtZQUM1QixNQUFNLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2xDO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQVBELGdEQU9DO0lBaUJELFNBQVMsTUFBTSxDQUFJLFNBQTJCO1FBQzVDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDZCxxQ0FBcUM7U0FDdEM7UUFDRCxPQUFPLFNBQVUsQ0FBQztJQUNwQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSDtRQTRCRSxtREFDWSxTQUFnQyxFQUFVLE9BQXdCLEVBQ2xFLE9BQXFCLEVBQVUsZ0JBQWtD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bEQsQ0FBQztJQUVELFNBQVMsb0JBQW9CLENBQUMsUUFBZ0I7UUFDNUMsSUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNqQyxDQUFDO0lBRUQsU0FBUyxxQkFBcUIsQ0FBQyxRQUFnQjtRQUM3QyxPQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELFNBQVMsbUJBQW1CLENBQUMsUUFBZ0I7UUFDM0MsT0FBVSxRQUFRLGtCQUFlLENBQUM7SUFDcEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FvdENvbXBpbGVySG9zdCwgY29sbGVjdEV4dGVybmFsUmVmZXJlbmNlcywgRW1pdHRlclZpc2l0b3JDb250ZXh0LCBHZW5lcmF0ZWRGaWxlLCBQYXJzZVNvdXJjZVNwYW4sIHN5bnRheEVycm9yLCBUeXBlU2NyaXB0RW1pdHRlcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge1R5cGVDaGVja0hvc3R9IGZyb20gJy4uL2RpYWdub3N0aWNzL3RyYW5zbGF0ZV9kaWFnbm9zdGljcyc7XG5pbXBvcnQge01vZHVsZU1ldGFkYXRhfSBmcm9tICcuLi9tZXRhZGF0YS9pbmRleCc7XG5pbXBvcnQge2pvaW59IGZyb20gJy4uL25ndHNjL2ZpbGVfc3lzdGVtJztcblxuaW1wb3J0IHtDb21waWxlckhvc3QsIENvbXBpbGVyT3B0aW9ucywgTGlicmFyeVN1bW1hcnl9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7Y3JlYXRlTWV0YWRhdGFSZWFkZXJDYWNoZSwgTWV0YWRhdGFSZWFkZXJIb3N0LCByZWFkTWV0YWRhdGF9IGZyb20gJy4vbWV0YWRhdGFfcmVhZGVyJztcbmltcG9ydCB7RFRTLCBHRU5FUkFURURfRklMRVMsIGlzSW5Sb290RGlyLCByZWxhdGl2ZVRvUm9vdERpcnN9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IE5PREVfTU9EVUxFU19QQUNLQUdFX05BTUUgPSAvbm9kZV9tb2R1bGVzXFwvKChcXHd8LXxcXC4pK3woQChcXHd8LXxcXC4pK1xcLyhcXHd8LXxcXC4pKykpLztcbmNvbnN0IEVYVCA9IC8oXFwudHN8XFwuZFxcLnRzfFxcLmpzfFxcLmpzeHxcXC50c3gpJC87XG5jb25zdCBDU1NfUFJFUFJPQ0VTU09SX0VYVCA9IC8oXFwuc2Nzc3xcXC5zYXNzfFxcLmxlc3N8XFwuc3R5bCkkLztcblxubGV0IHdyYXBIb3N0Rm9yVGVzdDogKChob3N0OiB0cy5Db21waWxlckhvc3QpID0+IHRzLkNvbXBpbGVySG9zdCl8bnVsbCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRXcmFwSG9zdEZvclRlc3Qod3JhcEZuOiAoKGhvc3Q6IHRzLkNvbXBpbGVySG9zdCkgPT4gdHMuQ29tcGlsZXJIb3N0KXxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCk6IHZvaWQge1xuICB3cmFwSG9zdEZvclRlc3QgPSB3cmFwRm47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21waWxlckhvc3QoXG4gICAge29wdGlvbnMsIHRzSG9zdCA9IHRzLmNyZWF0ZUNvbXBpbGVySG9zdChvcHRpb25zLCB0cnVlKX06XG4gICAgICAgIHtvcHRpb25zOiBDb21waWxlck9wdGlvbnMsIHRzSG9zdD86IHRzLkNvbXBpbGVySG9zdH0pOiBDb21waWxlckhvc3Qge1xuICBpZiAod3JhcEhvc3RGb3JUZXN0ICE9PSBudWxsKSB7XG4gICAgdHNIb3N0ID0gd3JhcEhvc3RGb3JUZXN0KHRzSG9zdCk7XG4gIH1cbiAgcmV0dXJuIHRzSG9zdDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXRhZGF0YVByb3ZpZGVyIHtcbiAgZ2V0TWV0YWRhdGEoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IE1vZHVsZU1ldGFkYXRhfHVuZGVmaW5lZDtcbn1cblxuaW50ZXJmYWNlIEdlblNvdXJjZUZpbGUge1xuICBleHRlcm5hbFJlZmVyZW5jZXM6IFNldDxzdHJpbmc+O1xuICBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlO1xuICBlbWl0Q3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29kZUdlbmVyYXRvciB7XG4gIGdlbmVyYXRlRmlsZShnZW5GaWxlTmFtZTogc3RyaW5nLCBiYXNlRmlsZU5hbWU/OiBzdHJpbmcpOiBHZW5lcmF0ZWRGaWxlO1xuICBmaW5kR2VuZXJhdGVkRmlsZU5hbWVzKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmdbXTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0PFQ+KGNvbmRpdGlvbjogVHxudWxsfHVuZGVmaW5lZCkge1xuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIC8vIFRPRE8oY2h1Y2tqYXopOiBkbyB0aGUgcmlnaHQgdGhpbmdcbiAgfVxuICByZXR1cm4gY29uZGl0aW9uITtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRzIHRoZSBmb2xsb3dpbmcgaG9zdHMgYmFzZWQgb24gYW4gYXBpLkNvbXBpbGVySG9zdDpcbiAqIC0gdHMuQ29tcGlsZXJIb3N0IHRvIGJlIGNvbnN1bWVkIGJ5IGEgdHMuUHJvZ3JhbVxuICogLSBBb3RDb21waWxlckhvc3QgZm9yIEBhbmd1bGFyL2NvbXBpbGVyXG4gKiAtIFR5cGVDaGVja0hvc3QgZm9yIG1hcHBpbmcgdHMgZXJyb3JzIHRvIG5nIGVycm9ycyAodmlhIHRyYW5zbGF0ZURpYWdub3N0aWNzKVxuICovXG5leHBvcnQgY2xhc3MgVHNDb21waWxlckFvdENvbXBpbGVyVHlwZUNoZWNrSG9zdEFkYXB0ZXIgaW1wbGVtZW50cyB0cy5Db21waWxlckhvc3QsIEFvdENvbXBpbGVySG9zdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFR5cGVDaGVja0hvc3Qge1xuICBwcml2YXRlIG1ldGFkYXRhUmVhZGVyQ2FjaGUgPSBjcmVhdGVNZXRhZGF0YVJlYWRlckNhY2hlKCk7XG4gIHByaXZhdGUgZmlsZU5hbWVUb01vZHVsZU5hbWVDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIHByaXZhdGUgZmxhdE1vZHVsZUluZGV4Q2FjaGUgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKTtcbiAgcHJpdmF0ZSBmbGF0TW9kdWxlSW5kZXhOYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBwcml2YXRlIGZsYXRNb2R1bGVJbmRleFJlZGlyZWN0TmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgcHJpdmF0ZSByb290RGlyczogc3RyaW5nW107XG4gIHByaXZhdGUgbW9kdWxlUmVzb2x1dGlvbkNhY2hlOiB0cy5Nb2R1bGVSZXNvbHV0aW9uQ2FjaGU7XG4gIHByaXZhdGUgb3JpZ2luYWxTb3VyY2VGaWxlcyA9IG5ldyBNYXA8c3RyaW5nLCB0cy5Tb3VyY2VGaWxlfG51bGw+KCk7XG4gIHByaXZhdGUgb3JpZ2luYWxGaWxlRXhpc3RzQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKTtcbiAgcHJpdmF0ZSBnZW5lcmF0ZWRTb3VyY2VGaWxlcyA9IG5ldyBNYXA8c3RyaW5nLCBHZW5Tb3VyY2VGaWxlPigpO1xuICBwcml2YXRlIGdlbmVyYXRlZENvZGVGb3IgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gIHByaXZhdGUgZW1pdHRlciA9IG5ldyBUeXBlU2NyaXB0RW1pdHRlcigpO1xuICBwcml2YXRlIG1ldGFkYXRhUmVhZGVySG9zdDogTWV0YWRhdGFSZWFkZXJIb3N0O1xuXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBnZXRDYW5jZWxsYXRpb25Ub2tlbiE6ICgpID0+IHRzLkNhbmNlbGxhdGlvblRva2VuO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgZ2V0RGVmYXVsdExpYkxvY2F0aW9uITogKCkgPT4gc3RyaW5nO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgdHJhY2UhOiAoczogc3RyaW5nKSA9PiB2b2lkO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgZ2V0RGlyZWN0b3JpZXMhOiAocGF0aDogc3RyaW5nKSA9PiBzdHJpbmdbXTtcbiAgcmVzb2x2ZVR5cGVSZWZlcmVuY2VEaXJlY3RpdmVzPzpcbiAgICAgIChuYW1lczogc3RyaW5nW10sIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpID0+IHRzLlJlc29sdmVkVHlwZVJlZmVyZW5jZURpcmVjdGl2ZVtdO1xuICBkaXJlY3RvcnlFeGlzdHM/OiAoZGlyZWN0b3J5TmFtZTogc3RyaW5nKSA9PiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSByb290RmlsZXM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiwgcHJpdmF0ZSBvcHRpb25zOiBDb21waWxlck9wdGlvbnMsXG4gICAgICBwcml2YXRlIGNvbnRleHQ6IENvbXBpbGVySG9zdCwgcHJpdmF0ZSBtZXRhZGF0YVByb3ZpZGVyOiBNZXRhZGF0YVByb3ZpZGVyLFxuICAgICAgcHJpdmF0ZSBjb2RlR2VuZXJhdG9yOiBDb2RlR2VuZXJhdG9yLFxuICAgICAgcHJpdmF0ZSBsaWJyYXJ5U3VtbWFyaWVzID0gbmV3IE1hcDxzdHJpbmcsIExpYnJhcnlTdW1tYXJ5PigpKSB7XG4gICAgdGhpcy5tb2R1bGVSZXNvbHV0aW9uQ2FjaGUgPSB0cy5jcmVhdGVNb2R1bGVSZXNvbHV0aW9uQ2FjaGUoXG4gICAgICAgIHRoaXMuY29udGV4dC5nZXRDdXJyZW50RGlyZWN0b3J5ISgpLCB0aGlzLmNvbnRleHQuZ2V0Q2Fub25pY2FsRmlsZU5hbWUuYmluZCh0aGlzLmNvbnRleHQpKTtcbiAgICBjb25zdCBiYXNlUGF0aCA9IHRoaXMub3B0aW9ucy5iYXNlUGF0aCE7XG4gICAgdGhpcy5yb290RGlycyA9XG4gICAgICAgICh0aGlzLm9wdGlvbnMucm9vdERpcnMgfHwgW3RoaXMub3B0aW9ucy5iYXNlUGF0aCFdKS5tYXAocCA9PiBwYXRoLnJlc29sdmUoYmFzZVBhdGgsIHApKTtcbiAgICBpZiAoY29udGV4dC5nZXREaXJlY3Rvcmllcykge1xuICAgICAgdGhpcy5nZXREaXJlY3RvcmllcyA9IHBhdGggPT4gY29udGV4dC5nZXREaXJlY3RvcmllcyEocGF0aCk7XG4gICAgfVxuICAgIGlmIChjb250ZXh0LmRpcmVjdG9yeUV4aXN0cykge1xuICAgICAgdGhpcy5kaXJlY3RvcnlFeGlzdHMgPSBkaXJlY3RvcnlOYW1lID0+IGNvbnRleHQuZGlyZWN0b3J5RXhpc3RzIShkaXJlY3RvcnlOYW1lKTtcbiAgICB9XG4gICAgaWYgKGNvbnRleHQuZ2V0Q2FuY2VsbGF0aW9uVG9rZW4pIHtcbiAgICAgIHRoaXMuZ2V0Q2FuY2VsbGF0aW9uVG9rZW4gPSAoKSA9PiBjb250ZXh0LmdldENhbmNlbGxhdGlvblRva2VuISgpO1xuICAgIH1cbiAgICBpZiAoY29udGV4dC5nZXREZWZhdWx0TGliTG9jYXRpb24pIHtcbiAgICAgIHRoaXMuZ2V0RGVmYXVsdExpYkxvY2F0aW9uID0gKCkgPT4gY29udGV4dC5nZXREZWZhdWx0TGliTG9jYXRpb24hKCk7XG4gICAgfVxuICAgIGlmIChjb250ZXh0LnJlc29sdmVUeXBlUmVmZXJlbmNlRGlyZWN0aXZlcykge1xuICAgICAgLy8gQmFja3dhcmQgY29tcGF0aWJpbGl0eSB3aXRoIFR5cGVTY3JpcHQgMi45IGFuZCBvbGRlciBzaW5jZSByZXR1cm5cbiAgICAgIC8vIHR5cGUgaGFzIGNoYW5nZWQgZnJvbSAodHMuUmVzb2x2ZWRUeXBlUmVmZXJlbmNlRGlyZWN0aXZlIHwgdW5kZWZpbmVkKVtdXG4gICAgICAvLyB0byB0cy5SZXNvbHZlZFR5cGVSZWZlcmVuY2VEaXJlY3RpdmVbXSBpbiBUeXBlc2NyaXB0IDMuMFxuICAgICAgdHlwZSB0czNSZXNvbHZlVHlwZVJlZmVyZW5jZURpcmVjdGl2ZXMgPSAobmFtZXM6IHN0cmluZ1tdLCBjb250YWluaW5nRmlsZTogc3RyaW5nKSA9PlxuICAgICAgICAgIHRzLlJlc29sdmVkVHlwZVJlZmVyZW5jZURpcmVjdGl2ZVtdO1xuICAgICAgdGhpcy5yZXNvbHZlVHlwZVJlZmVyZW5jZURpcmVjdGl2ZXMgPSAobmFtZXM6IHN0cmluZ1tdLCBjb250YWluaW5nRmlsZTogc3RyaW5nKSA9PlxuICAgICAgICAgIChjb250ZXh0LnJlc29sdmVUeXBlUmVmZXJlbmNlRGlyZWN0aXZlcyBhcyB0czNSZXNvbHZlVHlwZVJlZmVyZW5jZURpcmVjdGl2ZXMpIVxuICAgICAgICAgIChuYW1lcywgY29udGFpbmluZ0ZpbGUpO1xuICAgIH1cbiAgICBpZiAoY29udGV4dC50cmFjZSkge1xuICAgICAgdGhpcy50cmFjZSA9IHMgPT4gY29udGV4dC50cmFjZSEocyk7XG4gICAgfVxuICAgIGlmIChjb250ZXh0LmZpbGVOYW1lVG9Nb2R1bGVOYW1lKSB7XG4gICAgICB0aGlzLmZpbGVOYW1lVG9Nb2R1bGVOYW1lID0gY29udGV4dC5maWxlTmFtZVRvTW9kdWxlTmFtZS5iaW5kKGNvbnRleHQpO1xuICAgIH1cbiAgICAvLyBOb3RlOiBkb24ndCBjb3B5IG92ZXIgY29udGV4dC5tb2R1bGVOYW1lVG9GaWxlTmFtZSBhcyB3ZSBmaXJzdFxuICAgIC8vIG5vcm1hbGl6ZSB1bmRlZmluZWQgY29udGFpbmluZ0ZpbGUgdG8gYSBmaWxsZWQgY29udGFpbmluZ0ZpbGUuXG4gICAgaWYgKGNvbnRleHQucmVzb3VyY2VOYW1lVG9GaWxlTmFtZSkge1xuICAgICAgdGhpcy5yZXNvdXJjZU5hbWVUb0ZpbGVOYW1lID0gY29udGV4dC5yZXNvdXJjZU5hbWVUb0ZpbGVOYW1lLmJpbmQoY29udGV4dCk7XG4gICAgfVxuICAgIGlmIChjb250ZXh0LnRvU3VtbWFyeUZpbGVOYW1lKSB7XG4gICAgICB0aGlzLnRvU3VtbWFyeUZpbGVOYW1lID0gY29udGV4dC50b1N1bW1hcnlGaWxlTmFtZS5iaW5kKGNvbnRleHQpO1xuICAgIH1cbiAgICBpZiAoY29udGV4dC5mcm9tU3VtbWFyeUZpbGVOYW1lKSB7XG4gICAgICB0aGlzLmZyb21TdW1tYXJ5RmlsZU5hbWUgPSBjb250ZXh0LmZyb21TdW1tYXJ5RmlsZU5hbWUuYmluZChjb250ZXh0KTtcbiAgICB9XG4gICAgdGhpcy5tZXRhZGF0YVJlYWRlckhvc3QgPSB7XG4gICAgICBjYWNoZU1ldGFkYXRhOiAoKSA9PiB0cnVlLFxuICAgICAgZ2V0U291cmNlRmlsZU1ldGFkYXRhOiAoZmlsZVBhdGgpID0+IHtcbiAgICAgICAgY29uc3Qgc2YgPSB0aGlzLmdldE9yaWdpbmFsU291cmNlRmlsZShmaWxlUGF0aCk7XG4gICAgICAgIHJldHVybiBzZiA/IHRoaXMubWV0YWRhdGFQcm92aWRlci5nZXRNZXRhZGF0YShzZikgOiB1bmRlZmluZWQ7XG4gICAgICB9LFxuICAgICAgZmlsZUV4aXN0czogKGZpbGVQYXRoKSA9PiB0aGlzLm9yaWdpbmFsRmlsZUV4aXN0cyhmaWxlUGF0aCksXG4gICAgICByZWFkRmlsZTogKGZpbGVQYXRoKSA9PiBhc3NlcnQodGhpcy5jb250ZXh0LnJlYWRGaWxlKGZpbGVQYXRoKSksXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZU1vZHVsZU5hbWUobW9kdWxlTmFtZTogc3RyaW5nLCBjb250YWluaW5nRmlsZTogc3RyaW5nKTogdHMuUmVzb2x2ZWRNb2R1bGVcbiAgICAgIHx1bmRlZmluZWQge1xuICAgIGNvbnN0IHJtID0gdHMucmVzb2x2ZU1vZHVsZU5hbWUoXG4gICAgICAgICAgICAgICAgICAgICBtb2R1bGVOYW1lLCBjb250YWluaW5nRmlsZS5yZXBsYWNlKC9cXFxcL2csICcvJyksIHRoaXMub3B0aW9ucywgdGhpcyxcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlUmVzb2x1dGlvbkNhY2hlKVxuICAgICAgICAgICAgICAgICAgIC5yZXNvbHZlZE1vZHVsZTtcbiAgICBpZiAocm0gJiYgdGhpcy5pc1NvdXJjZUZpbGUocm0ucmVzb2x2ZWRGaWxlTmFtZSkgJiYgRFRTLnRlc3Qocm0ucmVzb2x2ZWRGaWxlTmFtZSkpIHtcbiAgICAgIC8vIENhc2U6IGdlbmVyYXRlQ29kZUZvckxpYnJhcmllcyA9IHRydWUgYW5kIG1vZHVsZU5hbWUgaXNcbiAgICAgIC8vIGEgLmQudHMgZmlsZSBpbiBhIG5vZGVfbW9kdWxlcyBmb2xkZXIuXG4gICAgICAvLyBOZWVkIHRvIHNldCBpc0V4dGVybmFsTGlicmFyeUltcG9ydCB0byBmYWxzZSBzbyB0aGF0IGdlbmVyYXRlZCBmaWxlcyBmb3IgdGhhdCBmaWxlXG4gICAgICAvLyBhcmUgZW1pdHRlZC5cbiAgICAgIHJtLmlzRXh0ZXJuYWxMaWJyYXJ5SW1wb3J0ID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBybTtcbiAgfVxuXG4gIC8vIE5vdGU6IFdlIGltcGxlbWVudCB0aGlzIG1ldGhvZCBzbyB0aGF0IFR5cGVTY3JpcHQgYW5kIEFuZ3VsYXIgc2hhcmUgdGhlIHNhbWVcbiAgLy8gdHMuTW9kdWxlUmVzb2x1dGlvbkNhY2hlXG4gIC8vIGFuZCB0aGF0IHdlIGNhbiB0ZWxsIHRzLlByb2dyYW0gYWJvdXQgb3VyIGRpZmZlcmVudCBvcGluaW9uIGFib3V0XG4gIC8vIFJlc29sdmVkTW9kdWxlLmlzRXh0ZXJuYWxMaWJyYXJ5SW1wb3J0XG4gIC8vIChzZWUgb3VyIGlzU291cmNlRmlsZSBtZXRob2QpLlxuICByZXNvbHZlTW9kdWxlTmFtZXMobW9kdWxlTmFtZXM6IHN0cmluZ1tdLCBjb250YWluaW5nRmlsZTogc3RyaW5nKTogdHMuUmVzb2x2ZWRNb2R1bGVbXSB7XG4gICAgLy8gVE9ETyh0Ym9zY2gpOiB0aGlzIHNlZW1zIHRvIGJlIGEgdHlwaW5nIGVycm9yIGluIFR5cGVTY3JpcHQsXG4gICAgLy8gYXMgaXQgY29udGFpbnMgYXNzZXJ0aW9ucyB0aGF0IHRoZSByZXN1bHQgY29udGFpbnMgdGhlIHNhbWUgbnVtYmVyIG9mIGVudHJpZXNcbiAgICAvLyBhcyB0aGUgZ2l2ZW4gbW9kdWxlIG5hbWVzLlxuICAgIHJldHVybiA8dHMuUmVzb2x2ZWRNb2R1bGVbXT5tb2R1bGVOYW1lcy5tYXAoXG4gICAgICAgIG1vZHVsZU5hbWUgPT4gdGhpcy5yZXNvbHZlTW9kdWxlTmFtZShtb2R1bGVOYW1lLCBjb250YWluaW5nRmlsZSkpO1xuICB9XG5cbiAgbW9kdWxlTmFtZVRvRmlsZU5hbWUobTogc3RyaW5nLCBjb250YWluaW5nRmlsZT86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAoIWNvbnRhaW5pbmdGaWxlKSB7XG4gICAgICBpZiAobS5pbmRleE9mKCcuJykgPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXNvbHV0aW9uIG9mIHJlbGF0aXZlIHBhdGhzIHJlcXVpcmVzIGEgY29udGFpbmluZyBmaWxlLicpO1xuICAgICAgfVxuICAgICAgLy8gQW55IGNvbnRhaW5pbmcgZmlsZSBnaXZlcyB0aGUgc2FtZSByZXN1bHQgZm9yIGFic29sdXRlIGltcG9ydHNcbiAgICAgIGNvbnRhaW5pbmdGaWxlID0gdGhpcy5yb290RmlsZXNbMF07XG4gICAgfVxuICAgIGlmICh0aGlzLmNvbnRleHQubW9kdWxlTmFtZVRvRmlsZU5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQubW9kdWxlTmFtZVRvRmlsZU5hbWUobSwgY29udGFpbmluZ0ZpbGUpO1xuICAgIH1cbiAgICBjb25zdCByZXNvbHZlZCA9IHRoaXMucmVzb2x2ZU1vZHVsZU5hbWUobSwgY29udGFpbmluZ0ZpbGUpO1xuICAgIHJldHVybiByZXNvbHZlZCA/IHJlc29sdmVkLnJlc29sdmVkRmlsZU5hbWUgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFdlIHdhbnQgYSBtb2R1bGVJZCB0aGF0IHdpbGwgYXBwZWFyIGluIGltcG9ydCBzdGF0ZW1lbnRzIGluIHRoZSBnZW5lcmF0ZWQgY29kZVxuICAgKiB3aGljaCB3aWxsIGJlIHdyaXR0ZW4gdG8gYGNvbnRhaW5pbmdGaWxlYC5cbiAgICpcbiAgICogTm90ZSB0aGF0IHdlIGFsc28gZ2VuZXJhdGUgZmlsZXMgZm9yIGZpbGVzIGluIG5vZGVfbW9kdWxlcywgYXMgbGlicmFyaWVzXG4gICAqIG9ubHkgc2hpcCAubWV0YWRhdGEuanNvbiBmaWxlcyBidXQgbm90IHRoZSBnZW5lcmF0ZWQgY29kZS5cbiAgICpcbiAgICogTG9naWM6XG4gICAqIDEuIGlmIHRoZSBpbXBvcnRlZEZpbGUgYW5kIHRoZSBjb250YWluaW5nRmlsZSBhcmUgZnJvbSB0aGUgcHJvamVjdCBzb3VyY2VzXG4gICAqICAgIG9yIGZyb20gdGhlIHNhbWUgbm9kZV9tb2R1bGVzIHBhY2thZ2UsIHVzZSBhIHJlbGF0aXZlIHBhdGhcbiAgICogMi4gaWYgdGhlIGltcG9ydGVkRmlsZSBpcyBpbiBhIG5vZGVfbW9kdWxlcyBwYWNrYWdlLFxuICAgKiAgICB1c2UgYSBwYXRoIHRoYXQgc3RhcnRzIHdpdGggdGhlIHBhY2thZ2UgbmFtZS5cbiAgICogMy4gRXJyb3IgaWYgdGhlIGNvbnRhaW5pbmdGaWxlIGlzIGluIHRoZSBub2RlX21vZHVsZXMgcGFja2FnZVxuICAgKiAgICBhbmQgdGhlIGltcG9ydGVkRmlsZSBpcyBpbiB0aGUgcHJvamVjdCBzb3VyZXMsXG4gICAqICAgIGFzIHRoYXQgaXMgYSB2aW9sYXRpb24gb2YgdGhlIHByaW5jaXBsZSB0aGF0IG5vZGVfbW9kdWxlcyBwYWNrYWdlcyBjYW5ub3RcbiAgICogICAgaW1wb3J0IHByb2plY3Qgc291cmNlcy5cbiAgICovXG4gIGZpbGVOYW1lVG9Nb2R1bGVOYW1lKGltcG9ydGVkRmlsZTogc3RyaW5nLCBjb250YWluaW5nRmlsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBjYWNoZUtleSA9IGAke2ltcG9ydGVkRmlsZX06JHtjb250YWluaW5nRmlsZX1gO1xuICAgIGxldCBtb2R1bGVOYW1lID0gdGhpcy5maWxlTmFtZVRvTW9kdWxlTmFtZUNhY2hlLmdldChjYWNoZUtleSk7XG4gICAgaWYgKG1vZHVsZU5hbWUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG1vZHVsZU5hbWU7XG4gICAgfVxuXG4gICAgY29uc3Qgb3JpZ2luYWxJbXBvcnRlZEZpbGUgPSBpbXBvcnRlZEZpbGU7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50cmFjZVJlc29sdXRpb24pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgJ2ZpbGVOYW1lVG9Nb2R1bGVOYW1lIGZyb20gY29udGFpbmluZ0ZpbGUnLCBjb250YWluaW5nRmlsZSwgJ3RvIGltcG9ydGVkRmlsZScsXG4gICAgICAgICAgaW1wb3J0ZWRGaWxlKTtcbiAgICB9XG5cbiAgICAvLyBkcm9wIGV4dGVuc2lvblxuICAgIGltcG9ydGVkRmlsZSA9IGltcG9ydGVkRmlsZS5yZXBsYWNlKEVYVCwgJycpO1xuICAgIGNvbnN0IGltcG9ydGVkRmlsZVBhY2thZ2VOYW1lID0gZ2V0UGFja2FnZU5hbWUoaW1wb3J0ZWRGaWxlKTtcbiAgICBjb25zdCBjb250YWluaW5nRmlsZVBhY2thZ2VOYW1lID0gZ2V0UGFja2FnZU5hbWUoY29udGFpbmluZ0ZpbGUpO1xuXG4gICAgaWYgKGltcG9ydGVkRmlsZVBhY2thZ2VOYW1lID09PSBjb250YWluaW5nRmlsZVBhY2thZ2VOYW1lIHx8XG4gICAgICAgIEdFTkVSQVRFRF9GSUxFUy50ZXN0KG9yaWdpbmFsSW1wb3J0ZWRGaWxlKSkge1xuICAgICAgY29uc3Qgcm9vdGVkQ29udGFpbmluZ0ZpbGUgPSByZWxhdGl2ZVRvUm9vdERpcnMoY29udGFpbmluZ0ZpbGUsIHRoaXMucm9vdERpcnMpO1xuICAgICAgY29uc3Qgcm9vdGVkSW1wb3J0ZWRGaWxlID0gcmVsYXRpdmVUb1Jvb3REaXJzKGltcG9ydGVkRmlsZSwgdGhpcy5yb290RGlycyk7XG5cbiAgICAgIGlmIChyb290ZWRDb250YWluaW5nRmlsZSAhPT0gY29udGFpbmluZ0ZpbGUgJiYgcm9vdGVkSW1wb3J0ZWRGaWxlICE9PSBpbXBvcnRlZEZpbGUpIHtcbiAgICAgICAgLy8gaWYgYm90aCBmaWxlcyBhcmUgY29udGFpbmVkIGluIHRoZSBgcm9vdERpcnNgLCB0aGVuIHN0cmlwIHRoZSByb290RGlyc1xuICAgICAgICBjb250YWluaW5nRmlsZSA9IHJvb3RlZENvbnRhaW5pbmdGaWxlO1xuICAgICAgICBpbXBvcnRlZEZpbGUgPSByb290ZWRJbXBvcnRlZEZpbGU7XG4gICAgICB9XG4gICAgICBtb2R1bGVOYW1lID0gZG90UmVsYXRpdmUocGF0aC5kaXJuYW1lKGNvbnRhaW5pbmdGaWxlKSwgaW1wb3J0ZWRGaWxlKTtcbiAgICB9IGVsc2UgaWYgKGltcG9ydGVkRmlsZVBhY2thZ2VOYW1lKSB7XG4gICAgICBtb2R1bGVOYW1lID0gc3RyaXBOb2RlTW9kdWxlc1ByZWZpeChpbXBvcnRlZEZpbGUpO1xuICAgICAgaWYgKG9yaWdpbmFsSW1wb3J0ZWRGaWxlLmVuZHNXaXRoKCcuZC50cycpKSB7XG4gICAgICAgIC8vIHRoZSBtb2R1bGVOYW1lIGZvciB0aGVzZSB0eXBpbmdzIGNvdWxkIGJlIHNob3J0ZW50ZWQgdG8gdGhlIG5wbSBwYWNrYWdlIG5hbWVcbiAgICAgICAgLy8gaWYgdGhlIG5wbSBwYWNrYWdlIHR5cGluZ3MgbWF0Y2hlcyB0aGUgaW1wb3J0ZWRGaWxlXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgbW9kdWxlUGF0aCA9IGltcG9ydGVkRmlsZS5zdWJzdHJpbmcoMCwgaW1wb3J0ZWRGaWxlLmxlbmd0aCAtIG1vZHVsZU5hbWUubGVuZ3RoKSArXG4gICAgICAgICAgICAgIGltcG9ydGVkRmlsZVBhY2thZ2VOYW1lO1xuICAgICAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gcmVxdWlyZShtb2R1bGVQYXRoICsgJy9wYWNrYWdlLmpzb24nKTtcbiAgICAgICAgICBjb25zdCBwYWNrYWdlVHlwaW5ncyA9IGpvaW4obW9kdWxlUGF0aCwgcGFja2FnZUpzb24udHlwaW5ncyk7XG4gICAgICAgICAgaWYgKHBhY2thZ2VUeXBpbmdzID09PSBvcmlnaW5hbEltcG9ydGVkRmlsZSkge1xuICAgICAgICAgICAgbW9kdWxlTmFtZSA9IGltcG9ydGVkRmlsZVBhY2thZ2VOYW1lO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLy8gdGhlIGFib3ZlIHJlcXVpcmUoKSB3aWxsIHRocm93IGlmIHRoZXJlIGlzIG5vIHBhY2thZ2UuanNvbiBmaWxlXG4gICAgICAgICAgLy8gYW5kIHRoaXMgaXMgc2FmZSB0byBpZ25vcmUgYW5kIGNvcnJlY3QgdG8ga2VlcCB0aGUgbG9uZ2VyXG4gICAgICAgICAgLy8gbW9kdWxlTmFtZSBpbiB0aGlzIGNhc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRyeWluZyB0byBpbXBvcnQgYSBzb3VyY2UgZmlsZSBmcm9tIGEgbm9kZV9tb2R1bGVzIHBhY2thZ2U6IGltcG9ydCAke1xuICAgICAgICAgIG9yaWdpbmFsSW1wb3J0ZWRGaWxlfSBmcm9tICR7Y29udGFpbmluZ0ZpbGV9YCk7XG4gICAgfVxuXG4gICAgdGhpcy5maWxlTmFtZVRvTW9kdWxlTmFtZUNhY2hlLnNldChjYWNoZUtleSwgbW9kdWxlTmFtZSk7XG4gICAgcmV0dXJuIG1vZHVsZU5hbWU7XG4gIH1cblxuICByZXNvdXJjZU5hbWVUb0ZpbGVOYW1lKHJlc291cmNlTmFtZTogc3RyaW5nLCBjb250YWluaW5nRmlsZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIC8vIE5vdGU6IHdlIGNvbnZlcnQgcGFja2FnZSBwYXRocyBpbnRvIHJlbGF0aXZlIHBhdGhzIHRvIGJlIGNvbXBhdGlibGUgd2l0aCB0aGUgdGhlXG4gICAgLy8gcHJldmlvdXMgaW1wbGVtZW50YXRpb24gb2YgVXJsUmVzb2x2ZXIuXG4gICAgY29uc3QgZmlyc3RDaGFyID0gcmVzb3VyY2VOYW1lWzBdO1xuICAgIGlmIChmaXJzdENoYXIgPT09ICcvJykge1xuICAgICAgcmVzb3VyY2VOYW1lID0gcmVzb3VyY2VOYW1lLnNsaWNlKDEpO1xuICAgIH0gZWxzZSBpZiAoZmlyc3RDaGFyICE9PSAnLicpIHtcbiAgICAgIHJlc291cmNlTmFtZSA9IGAuLyR7cmVzb3VyY2VOYW1lfWA7XG4gICAgfVxuICAgIGxldCBmaWxlUGF0aFdpdGhOZ1Jlc291cmNlID1cbiAgICAgICAgdGhpcy5tb2R1bGVOYW1lVG9GaWxlTmFtZShhZGROZ1Jlc291cmNlU3VmZml4KHJlc291cmNlTmFtZSksIGNvbnRhaW5pbmdGaWxlKTtcbiAgICAvLyBJZiB0aGUgdXNlciBzcGVjaWZpZWQgc3R5bGVVcmwgcG9pbnRpbmcgdG8gKi5zY3NzLCBidXQgdGhlIFNhc3MgY29tcGlsZXIgd2FzIHJ1biBiZWZvcmVcbiAgICAvLyBBbmd1bGFyLCB0aGVuIHRoZSByZXNvdXJjZSBtYXkgaGF2ZSBiZWVuIGdlbmVyYXRlZCBhcyAqLmNzcy4gU2ltcGx5IHRyeSB0aGUgcmVzb2x1dGlvbiBhZ2Fpbi5cbiAgICBpZiAoIWZpbGVQYXRoV2l0aE5nUmVzb3VyY2UgJiYgQ1NTX1BSRVBST0NFU1NPUl9FWFQudGVzdChyZXNvdXJjZU5hbWUpKSB7XG4gICAgICBjb25zdCBmYWxsYmFja1Jlc291cmNlTmFtZSA9IHJlc291cmNlTmFtZS5yZXBsYWNlKENTU19QUkVQUk9DRVNTT1JfRVhULCAnLmNzcycpO1xuICAgICAgZmlsZVBhdGhXaXRoTmdSZXNvdXJjZSA9XG4gICAgICAgICAgdGhpcy5tb2R1bGVOYW1lVG9GaWxlTmFtZShhZGROZ1Jlc291cmNlU3VmZml4KGZhbGxiYWNrUmVzb3VyY2VOYW1lKSwgY29udGFpbmluZ0ZpbGUpO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSBmaWxlUGF0aFdpdGhOZ1Jlc291cmNlID8gc3RyaXBOZ1Jlc291cmNlU3VmZml4KGZpbGVQYXRoV2l0aE5nUmVzb3VyY2UpIDogbnVsbDtcbiAgICAvLyBVc2VkIHVuZGVyIEJhemVsIHRvIHJlcG9ydCBtb3JlIHNwZWNpZmljIGVycm9yIHdpdGggcmVtZWRpYXRpb24gYWR2aWNlXG4gICAgaWYgKCFyZXN1bHQgJiYgKHRoaXMuY29udGV4dCBhcyBhbnkpLnJlcG9ydE1pc3NpbmdSZXNvdXJjZSkge1xuICAgICAgKHRoaXMuY29udGV4dCBhcyBhbnkpLnJlcG9ydE1pc3NpbmdSZXNvdXJjZShyZXNvdXJjZU5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdG9TdW1tYXJ5RmlsZU5hbWUoZmlsZU5hbWU6IHN0cmluZywgcmVmZXJyaW5nU3JjRmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZU5hbWVUb01vZHVsZU5hbWUoZmlsZU5hbWUsIHJlZmVycmluZ1NyY0ZpbGVOYW1lKTtcbiAgfVxuXG4gIGZyb21TdW1tYXJ5RmlsZU5hbWUoZmlsZU5hbWU6IHN0cmluZywgcmVmZXJyaW5nTGliRmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSB0aGlzLm1vZHVsZU5hbWVUb0ZpbGVOYW1lKGZpbGVOYW1lLCByZWZlcnJpbmdMaWJGaWxlTmFtZSk7XG4gICAgaWYgKCFyZXNvbHZlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgcmVzb2x2ZSAke2ZpbGVOYW1lfSBmcm9tICR7cmVmZXJyaW5nTGliRmlsZU5hbWV9YCk7XG4gICAgfVxuICAgIHJldHVybiByZXNvbHZlZDtcbiAgfVxuXG4gIHBhcnNlU291cmNlU3Bhbk9mKGZpbGVOYW1lOiBzdHJpbmcsIGxpbmU6IG51bWJlciwgY2hhcmFjdGVyOiBudW1iZXIpOiBQYXJzZVNvdXJjZVNwYW58bnVsbCB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZ2VuZXJhdGVkU291cmNlRmlsZXMuZ2V0KGZpbGVOYW1lKTtcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmVtaXRDdHgpIHtcbiAgICAgIHJldHVybiBkYXRhLmVtaXRDdHguc3Bhbk9mKGxpbmUsIGNoYXJhY3Rlcik7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRPcmlnaW5hbFNvdXJjZUZpbGUoXG4gICAgICBmaWxlUGF0aDogc3RyaW5nLCBsYW5ndWFnZVZlcnNpb24/OiB0cy5TY3JpcHRUYXJnZXQsXG4gICAgICBvbkVycm9yPzogKChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQpfHVuZGVmaW5lZCk6IHRzLlNvdXJjZUZpbGV8bnVsbCB7XG4gICAgLy8gTm90ZTogd2UgbmVlZCB0aGUgZXhwbGljaXQgY2hlY2sgdmlhIGBoYXNgIGFzIHdlIGFsc28gY2FjaGUgcmVzdWx0c1xuICAgIC8vIHRoYXQgd2VyZSBudWxsIC8gdW5kZWZpbmVkLlxuICAgIGlmICh0aGlzLm9yaWdpbmFsU291cmNlRmlsZXMuaGFzKGZpbGVQYXRoKSkge1xuICAgICAgcmV0dXJuIHRoaXMub3JpZ2luYWxTb3VyY2VGaWxlcy5nZXQoZmlsZVBhdGgpITtcbiAgICB9XG4gICAgaWYgKCFsYW5ndWFnZVZlcnNpb24pIHtcbiAgICAgIGxhbmd1YWdlVmVyc2lvbiA9IHRoaXMub3B0aW9ucy50YXJnZXQgfHwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdDtcbiAgICB9XG4gICAgLy8gTm90ZTogVGhpcyBjYW4gYWxzbyByZXR1cm4gdW5kZWZpbmVkLFxuICAgIC8vIGFzIHRoZSBUUyB0eXBpbmdzIGFyZSBub3QgY29ycmVjdCFcbiAgICBjb25zdCBzZiA9IHRoaXMuY29udGV4dC5nZXRTb3VyY2VGaWxlKGZpbGVQYXRoLCBsYW5ndWFnZVZlcnNpb24sIG9uRXJyb3IpIHx8IG51bGw7XG4gICAgdGhpcy5vcmlnaW5hbFNvdXJjZUZpbGVzLnNldChmaWxlUGF0aCwgc2YpO1xuICAgIHJldHVybiBzZjtcbiAgfVxuXG4gIHVwZGF0ZUdlbmVyYXRlZEZpbGUoZ2VuRmlsZTogR2VuZXJhdGVkRmlsZSk6IHRzLlNvdXJjZUZpbGUge1xuICAgIGlmICghZ2VuRmlsZS5zdG10cykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBJbnZhbGlkIEFyZ3VtZW50OiBFeHBlY3RlZCBhIEdlbmVyYXRlRmlsZSB3aXRoIHN0YXRlbWVudHMuICR7Z2VuRmlsZS5nZW5GaWxlVXJsfWApO1xuICAgIH1cbiAgICBjb25zdCBvbGRHZW5GaWxlID0gdGhpcy5nZW5lcmF0ZWRTb3VyY2VGaWxlcy5nZXQoZ2VuRmlsZS5nZW5GaWxlVXJsKTtcbiAgICBpZiAoIW9sZEdlbkZpbGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSWxsZWdhbCBTdGF0ZTogcHJldmlvdXMgR2VuZXJhdGVkRmlsZSBub3QgZm91bmQgZm9yICR7Z2VuRmlsZS5nZW5GaWxlVXJsfS5gKTtcbiAgICB9XG4gICAgY29uc3QgbmV3UmVmcyA9IGdlbkZpbGVFeHRlcm5hbFJlZmVyZW5jZXMoZ2VuRmlsZSk7XG4gICAgY29uc3Qgb2xkUmVmcyA9IG9sZEdlbkZpbGUuZXh0ZXJuYWxSZWZlcmVuY2VzO1xuICAgIGxldCByZWZzQXJlRXF1YWwgPSBvbGRSZWZzLnNpemUgPT09IG5ld1JlZnMuc2l6ZTtcbiAgICBpZiAocmVmc0FyZUVxdWFsKSB7XG4gICAgICBuZXdSZWZzLmZvckVhY2gociA9PiByZWZzQXJlRXF1YWwgPSByZWZzQXJlRXF1YWwgJiYgb2xkUmVmcy5oYXMocikpO1xuICAgIH1cbiAgICBpZiAoIXJlZnNBcmVFcXVhbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbGxlZ2FsIFN0YXRlOiBleHRlcm5hbCByZWZlcmVuY2VzIGNoYW5nZWQgaW4gJHtnZW5GaWxlLmdlbkZpbGVVcmx9Llxcbk9sZDogJHtcbiAgICAgICAgICBBcnJheS5mcm9tKG9sZFJlZnMpfS5cXG5OZXc6ICR7QXJyYXkuZnJvbShuZXdSZWZzKX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYWRkR2VuZXJhdGVkRmlsZShnZW5GaWxlLCBuZXdSZWZzKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkR2VuZXJhdGVkRmlsZShnZW5GaWxlOiBHZW5lcmF0ZWRGaWxlLCBleHRlcm5hbFJlZmVyZW5jZXM6IFNldDxzdHJpbmc+KTogdHMuU291cmNlRmlsZSB7XG4gICAgaWYgKCFnZW5GaWxlLnN0bXRzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEludmFsaWQgQXJndW1lbnQ6IEV4cGVjdGVkIGEgR2VuZXJhdGVGaWxlIHdpdGggc3RhdGVtZW50cy4gJHtnZW5GaWxlLmdlbkZpbGVVcmx9YCk7XG4gICAgfVxuICAgIGNvbnN0IHtzb3VyY2VUZXh0LCBjb250ZXh0fSA9IHRoaXMuZW1pdHRlci5lbWl0U3RhdGVtZW50c0FuZENvbnRleHQoXG4gICAgICAgIGdlbkZpbGUuZ2VuRmlsZVVybCwgZ2VuRmlsZS5zdG10cywgLyogcHJlYW1ibGUgKi8gJycsXG4gICAgICAgIC8qIGVtaXRTb3VyY2VNYXBzICovIGZhbHNlKTtcbiAgICBjb25zdCBzZiA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoXG4gICAgICAgIGdlbkZpbGUuZ2VuRmlsZVVybCwgc291cmNlVGV4dCwgdGhpcy5vcHRpb25zLnRhcmdldCB8fCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0KTtcbiAgICBpZiAodGhpcy5vcHRpb25zLm1vZHVsZSA9PT0gdHMuTW9kdWxlS2luZC5BTUQgfHwgdGhpcy5vcHRpb25zLm1vZHVsZSA9PT0gdHMuTW9kdWxlS2luZC5VTUQpIHtcbiAgICAgIGlmICh0aGlzLmNvbnRleHQuYW1kTW9kdWxlTmFtZSkge1xuICAgICAgICBjb25zdCBtb2R1bGVOYW1lID0gdGhpcy5jb250ZXh0LmFtZE1vZHVsZU5hbWUoc2YpO1xuICAgICAgICBpZiAobW9kdWxlTmFtZSkgc2YubW9kdWxlTmFtZSA9IG1vZHVsZU5hbWU7XG4gICAgICB9IGVsc2UgaWYgKC9ub2RlX21vZHVsZXMvLnRlc3QoZ2VuRmlsZS5nZW5GaWxlVXJsKSkge1xuICAgICAgICAvLyBJZiB3ZSBhcmUgZ2VuZXJhdGluZyBhbiBuZ01vZHVsZSBmaWxlIHVuZGVyIG5vZGVfbW9kdWxlcywgd2Uga25vdyB0aGUgcmlnaHQgbW9kdWxlIG5hbWVcbiAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0aGUgaG9zdCB0byBzdXBwbHkgYSBmdW5jdGlvbiBpbiB0aGlzIGNhc2UuXG4gICAgICAgIHNmLm1vZHVsZU5hbWUgPSBzdHJpcE5vZGVNb2R1bGVzUHJlZml4KGdlbkZpbGUuZ2VuRmlsZVVybC5yZXBsYWNlKEVYVCwgJycpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5nZW5lcmF0ZWRTb3VyY2VGaWxlcy5zZXQoZ2VuRmlsZS5nZW5GaWxlVXJsLCB7XG4gICAgICBzb3VyY2VGaWxlOiBzZixcbiAgICAgIGVtaXRDdHg6IGNvbnRleHQsXG4gICAgICBleHRlcm5hbFJlZmVyZW5jZXMsXG4gICAgfSk7XG4gICAgcmV0dXJuIHNmO1xuICB9XG5cbiAgc2hvdWxkR2VuZXJhdGVGaWxlKGZpbGVOYW1lOiBzdHJpbmcpOiB7Z2VuZXJhdGU6IGJvb2xlYW4sIGJhc2VGaWxlTmFtZT86IHN0cmluZ30ge1xuICAgIC8vIFRPRE8odGJvc2NoKTogYWxsb3cgZ2VuZXJhdGluZyBmaWxlcyB0aGF0IGFyZSBub3QgaW4gdGhlIHJvb3REaXJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMTkzMzdcbiAgICBpZiAoIWlzSW5Sb290RGlyKGZpbGVOYW1lLCB0aGlzLm9wdGlvbnMpKSB7XG4gICAgICByZXR1cm4ge2dlbmVyYXRlOiBmYWxzZX07XG4gICAgfVxuICAgIGNvbnN0IGdlbk1hdGNoID0gR0VORVJBVEVEX0ZJTEVTLmV4ZWMoZmlsZU5hbWUpO1xuICAgIGlmICghZ2VuTWF0Y2gpIHtcbiAgICAgIHJldHVybiB7Z2VuZXJhdGU6IGZhbHNlfTtcbiAgICB9XG4gICAgY29uc3QgWywgYmFzZSwgZ2VuU3VmZml4LCBzdWZmaXhdID0gZ2VuTWF0Y2g7XG4gICAgaWYgKHN1ZmZpeCAhPT0gJ3RzJyAmJiBzdWZmaXggIT09ICd0c3gnKSB7XG4gICAgICByZXR1cm4ge2dlbmVyYXRlOiBmYWxzZX07XG4gICAgfVxuICAgIGxldCBiYXNlRmlsZU5hbWU6IHN0cmluZ3x1bmRlZmluZWQ7XG4gICAgaWYgKGdlblN1ZmZpeC5pbmRleE9mKCduZ3N0eWxlJykgPj0gMCkge1xuICAgICAgLy8gTm90ZTogbmdzdHlsZSBmaWxlcyBoYXZlIG5hbWVzIGxpa2UgYGFmaWxlLmNzcy5uZ3N0eWxlLnRzYFxuICAgICAgaWYgKCF0aGlzLm9yaWdpbmFsRmlsZUV4aXN0cyhiYXNlKSkge1xuICAgICAgICByZXR1cm4ge2dlbmVyYXRlOiBmYWxzZX07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE5vdGU6IG9uLXRoZS1mbHkgZ2VuZXJhdGVkIGZpbGVzIGFsd2F5cyBoYXZlIGEgYC50c2Agc3VmZml4LFxuICAgICAgLy8gYnV0IHRoZSBmaWxlIGZyb20gd2hpY2ggd2UgZ2VuZXJhdGVkIGl0IGNhbiBiZSBhIGAudHNgLyBgLnRzeGAvIGAuZC50c2BcbiAgICAgIC8vIChzZWUgb3B0aW9ucy5nZW5lcmF0ZUNvZGVGb3JMaWJyYXJpZXMpLlxuICAgICAgYmFzZUZpbGVOYW1lID0gW2Ake2Jhc2V9LnRzYCwgYCR7YmFzZX0udHN4YCwgYCR7YmFzZX0uZC50c2BdLmZpbmQoXG4gICAgICAgICAgYmFzZUZpbGVOYW1lID0+IHRoaXMuaXNTb3VyY2VGaWxlKGJhc2VGaWxlTmFtZSkgJiYgdGhpcy5vcmlnaW5hbEZpbGVFeGlzdHMoYmFzZUZpbGVOYW1lKSk7XG4gICAgICBpZiAoIWJhc2VGaWxlTmFtZSkge1xuICAgICAgICByZXR1cm4ge2dlbmVyYXRlOiBmYWxzZX07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7Z2VuZXJhdGU6IHRydWUsIGJhc2VGaWxlTmFtZX07XG4gIH1cblxuICBzaG91bGRHZW5lcmF0ZUZpbGVzRm9yKGZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgICAvLyBUT0RPKHRib3NjaCk6IGFsbG93IGdlbmVyYXRpbmcgZmlsZXMgdGhhdCBhcmUgbm90IGluIHRoZSByb290RGlyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzE5MzM3XG4gICAgcmV0dXJuICFHRU5FUkFURURfRklMRVMudGVzdChmaWxlTmFtZSkgJiYgdGhpcy5pc1NvdXJjZUZpbGUoZmlsZU5hbWUpICYmXG4gICAgICAgIGlzSW5Sb290RGlyKGZpbGVOYW1lLCB0aGlzLm9wdGlvbnMpO1xuICB9XG5cbiAgZ2V0U291cmNlRmlsZShcbiAgICAgIGZpbGVOYW1lOiBzdHJpbmcsIGxhbmd1YWdlVmVyc2lvbjogdHMuU2NyaXB0VGFyZ2V0LFxuICAgICAgb25FcnJvcj86ICgobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkKXx1bmRlZmluZWQpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgICAvLyBOb3RlOiBEb24ndCBleGl0IGVhcmx5IGluIHRoaXMgbWV0aG9kIHRvIG1ha2Ugc3VyZVxuICAgIC8vIHdlIGFsd2F5cyBoYXZlIHVwIHRvIGRhdGUgcmVmZXJlbmNlcyBvbiB0aGUgZmlsZSFcbiAgICBsZXQgZ2VuRmlsZU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGxldCBzZiA9IHRoaXMuZ2V0R2VuZXJhdGVkRmlsZShmaWxlTmFtZSk7XG4gICAgaWYgKCFzZikge1xuICAgICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMubGlicmFyeVN1bW1hcmllcy5nZXQoZmlsZU5hbWUpO1xuICAgICAgaWYgKHN1bW1hcnkpIHtcbiAgICAgICAgaWYgKCFzdW1tYXJ5LnNvdXJjZUZpbGUpIHtcbiAgICAgICAgICBzdW1tYXJ5LnNvdXJjZUZpbGUgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKFxuICAgICAgICAgICAgICBmaWxlTmFtZSwgc3VtbWFyeS50ZXh0LCB0aGlzLm9wdGlvbnMudGFyZ2V0IHx8IHRzLlNjcmlwdFRhcmdldC5MYXRlc3QpO1xuICAgICAgICB9XG4gICAgICAgIHNmID0gc3VtbWFyeS5zb3VyY2VGaWxlO1xuICAgICAgICAvLyBUeXBlU2NyaXB0IGRvZXNuJ3QgYWxsb3cgcmV0dXJuaW5nIHJlZGlyZWN0IHNvdXJjZSBmaWxlcy4gVG8gYXZvaWQgdW5mb3JzZWVuIGVycm9ycyB3ZVxuICAgICAgICAvLyByZXR1cm4gdGhlIG9yaWdpbmFsIHNvdXJjZSBmaWxlIGluc3RlYWQgb2YgdGhlIHJlZGlyZWN0IHRhcmdldC5cbiAgICAgICAgY29uc3QgcmVkaXJlY3RJbmZvID0gKHNmIGFzIGFueSkucmVkaXJlY3RJbmZvO1xuICAgICAgICBpZiAocmVkaXJlY3RJbmZvICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBzZiA9IHJlZGlyZWN0SW5mby51bnJlZGlyZWN0ZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZ2VuRmlsZU5hbWVzID0gW107XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghc2YpIHtcbiAgICAgIHNmID0gdGhpcy5nZXRPcmlnaW5hbFNvdXJjZUZpbGUoZmlsZU5hbWUpO1xuICAgICAgY29uc3QgY2FjaGVkR2VuRmlsZXMgPSB0aGlzLmdlbmVyYXRlZENvZGVGb3IuZ2V0KGZpbGVOYW1lKTtcbiAgICAgIGlmIChjYWNoZWRHZW5GaWxlcykge1xuICAgICAgICBnZW5GaWxlTmFtZXMgPSBjYWNoZWRHZW5GaWxlcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLm5vUmVzb2x2ZSAmJiB0aGlzLnNob3VsZEdlbmVyYXRlRmlsZXNGb3IoZmlsZU5hbWUpKSB7XG4gICAgICAgICAgZ2VuRmlsZU5hbWVzID0gdGhpcy5jb2RlR2VuZXJhdG9yLmZpbmRHZW5lcmF0ZWRGaWxlTmFtZXMoZmlsZU5hbWUpLmZpbHRlcihcbiAgICAgICAgICAgICAgZmlsZU5hbWUgPT4gdGhpcy5zaG91bGRHZW5lcmF0ZUZpbGUoZmlsZU5hbWUpLmdlbmVyYXRlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdlbmVyYXRlZENvZGVGb3Iuc2V0KGZpbGVOYW1lLCBnZW5GaWxlTmFtZXMpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc2YpIHtcbiAgICAgIGFkZFJlZmVyZW5jZXNUb1NvdXJjZUZpbGUoc2YsIGdlbkZpbGVOYW1lcyk7XG4gICAgfVxuICAgIC8vIFRPRE8odGJvc2NoKTogVHlwZVNjcmlwdCdzIHR5cGluZ3MgZm9yIGdldFNvdXJjZUZpbGUgYXJlIGluY29ycmVjdCxcbiAgICAvLyBhcyBpdCBjYW4gdmVyeSB3ZWxsIHJldHVybiB1bmRlZmluZWQuXG4gICAgcmV0dXJuIHNmITtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0R2VuZXJhdGVkRmlsZShmaWxlTmFtZTogc3RyaW5nKTogdHMuU291cmNlRmlsZXxudWxsIHtcbiAgICBjb25zdCBnZW5TcmNGaWxlID0gdGhpcy5nZW5lcmF0ZWRTb3VyY2VGaWxlcy5nZXQoZmlsZU5hbWUpO1xuICAgIGlmIChnZW5TcmNGaWxlKSB7XG4gICAgICByZXR1cm4gZ2VuU3JjRmlsZS5zb3VyY2VGaWxlO1xuICAgIH1cbiAgICBjb25zdCB7Z2VuZXJhdGUsIGJhc2VGaWxlTmFtZX0gPSB0aGlzLnNob3VsZEdlbmVyYXRlRmlsZShmaWxlTmFtZSk7XG4gICAgaWYgKGdlbmVyYXRlKSB7XG4gICAgICBjb25zdCBnZW5GaWxlID0gdGhpcy5jb2RlR2VuZXJhdG9yLmdlbmVyYXRlRmlsZShmaWxlTmFtZSwgYmFzZUZpbGVOYW1lKTtcbiAgICAgIHJldHVybiB0aGlzLmFkZEdlbmVyYXRlZEZpbGUoZ2VuRmlsZSwgZ2VuRmlsZUV4dGVybmFsUmVmZXJlbmNlcyhnZW5GaWxlKSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBvcmlnaW5hbEZpbGVFeGlzdHMoZmlsZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGxldCBmaWxlRXhpc3RzID0gdGhpcy5vcmlnaW5hbEZpbGVFeGlzdHNDYWNoZS5nZXQoZmlsZU5hbWUpO1xuICAgIGlmIChmaWxlRXhpc3RzID09IG51bGwpIHtcbiAgICAgIGZpbGVFeGlzdHMgPSB0aGlzLmNvbnRleHQuZmlsZUV4aXN0cyhmaWxlTmFtZSk7XG4gICAgICB0aGlzLm9yaWdpbmFsRmlsZUV4aXN0c0NhY2hlLnNldChmaWxlTmFtZSwgZmlsZUV4aXN0cyk7XG4gICAgfVxuICAgIHJldHVybiBmaWxlRXhpc3RzO1xuICB9XG5cbiAgZmlsZUV4aXN0cyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgZmlsZU5hbWUgPSBzdHJpcE5nUmVzb3VyY2VTdWZmaXgoZmlsZU5hbWUpO1xuICAgIGlmICh0aGlzLmxpYnJhcnlTdW1tYXJpZXMuaGFzKGZpbGVOYW1lKSB8fCB0aGlzLmdlbmVyYXRlZFNvdXJjZUZpbGVzLmhhcyhmaWxlTmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAodGhpcy5zaG91bGRHZW5lcmF0ZUZpbGUoZmlsZU5hbWUpLmdlbmVyYXRlKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMub3JpZ2luYWxGaWxlRXhpc3RzKGZpbGVOYW1lKTtcbiAgfVxuXG4gIGxvYWRTdW1tYXJ5KGZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgY29uc3Qgc3VtbWFyeSA9IHRoaXMubGlicmFyeVN1bW1hcmllcy5nZXQoZmlsZVBhdGgpO1xuICAgIGlmIChzdW1tYXJ5KSB7XG4gICAgICByZXR1cm4gc3VtbWFyeS50ZXh0O1xuICAgIH1cbiAgICBpZiAodGhpcy5vcmlnaW5hbEZpbGVFeGlzdHMoZmlsZVBhdGgpKSB7XG4gICAgICByZXR1cm4gYXNzZXJ0KHRoaXMuY29udGV4dC5yZWFkRmlsZShmaWxlUGF0aCkpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlzU291cmNlRmlsZShmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8gRG9uJ3QgZ2VuZXJhdGUgYW55IGZpbGVzIG5vciB0eXBlY2hlY2sgdGhlbVxuICAgIC8vIGlmIHNraXBUZW1wbGF0ZUNvZGVnZW4gaXMgc2V0IGFuZCBmdWxsVGVtcGxhdGVUeXBlQ2hlY2sgaXMgbm90IHlldCBzZXQsXG4gICAgLy8gZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2tpcFRlbXBsYXRlQ29kZWdlbiAmJiAhdGhpcy5vcHRpb25zLmZ1bGxUZW1wbGF0ZVR5cGVDaGVjaykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBJZiB3ZSBoYXZlIGEgc3VtbWFyeSBmcm9tIGEgcHJldmlvdXMgY29tcGlsYXRpb24sXG4gICAgLy8gdHJlYXQgdGhlIGZpbGUgbmV2ZXIgYXMgYSBzb3VyY2UgZmlsZS5cbiAgICBpZiAodGhpcy5saWJyYXJ5U3VtbWFyaWVzLmhhcyhmaWxlUGF0aCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKEdFTkVSQVRFRF9GSUxFUy50ZXN0KGZpbGVQYXRoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmdlbmVyYXRlQ29kZUZvckxpYnJhcmllcyA9PT0gZmFsc2UgJiYgRFRTLnRlc3QoZmlsZVBhdGgpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChEVFMudGVzdChmaWxlUGF0aCkpIHtcbiAgICAgIC8vIENoZWNrIGZvciBhIGJ1bmRsZSBpbmRleC5cbiAgICAgIGlmICh0aGlzLmhhc0J1bmRsZUluZGV4KGZpbGVQYXRoKSkge1xuICAgICAgICBjb25zdCBub3JtYWxGaWxlUGF0aCA9IHBhdGgubm9ybWFsaXplKGZpbGVQYXRoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxhdE1vZHVsZUluZGV4TmFtZXMuaGFzKG5vcm1hbEZpbGVQYXRoKSB8fFxuICAgICAgICAgICAgdGhpcy5mbGF0TW9kdWxlSW5kZXhSZWRpcmVjdE5hbWVzLmhhcyhub3JtYWxGaWxlUGF0aCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmVhZEZpbGUoZmlsZU5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHN1bW1hcnkgPSB0aGlzLmxpYnJhcnlTdW1tYXJpZXMuZ2V0KGZpbGVOYW1lKTtcbiAgICBpZiAoc3VtbWFyeSkge1xuICAgICAgcmV0dXJuIHN1bW1hcnkudGV4dDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29udGV4dC5yZWFkRmlsZShmaWxlTmFtZSk7XG4gIH1cblxuICBnZXRNZXRhZGF0YUZvcihmaWxlUGF0aDogc3RyaW5nKTogTW9kdWxlTWV0YWRhdGFbXXx1bmRlZmluZWQge1xuICAgIHJldHVybiByZWFkTWV0YWRhdGEoZmlsZVBhdGgsIHRoaXMubWV0YWRhdGFSZWFkZXJIb3N0LCB0aGlzLm1ldGFkYXRhUmVhZGVyQ2FjaGUpO1xuICB9XG5cbiAgbG9hZFJlc291cmNlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz58c3RyaW5nIHtcbiAgICBpZiAodGhpcy5jb250ZXh0LnJlYWRSZXNvdXJjZSkgcmV0dXJuIHRoaXMuY29udGV4dC5yZWFkUmVzb3VyY2UoZmlsZVBhdGgpO1xuICAgIGlmICghdGhpcy5vcmlnaW5hbEZpbGVFeGlzdHMoZmlsZVBhdGgpKSB7XG4gICAgICB0aHJvdyBzeW50YXhFcnJvcihgRXJyb3I6IFJlc291cmNlIGZpbGUgbm90IGZvdW5kOiAke2ZpbGVQYXRofWApO1xuICAgIH1cbiAgICByZXR1cm4gYXNzZXJ0KHRoaXMuY29udGV4dC5yZWFkRmlsZShmaWxlUGF0aCkpO1xuICB9XG5cbiAgZ2V0T3V0cHV0TmFtZShmaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGF0aC5yZWxhdGl2ZSh0aGlzLmdldEN1cnJlbnREaXJlY3RvcnkoKSwgZmlsZVBhdGgpO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNCdW5kbGVJbmRleChmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgY2hlY2tCdW5kbGVJbmRleCA9IChkaXJlY3Rvcnk6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgICAgbGV0IHJlc3VsdCA9IHRoaXMuZmxhdE1vZHVsZUluZGV4Q2FjaGUuZ2V0KGRpcmVjdG9yeSk7XG4gICAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgICAgaWYgKHBhdGguYmFzZW5hbWUoZGlyZWN0b3J5KSA9PSAnbm9kZV9tb2R1bGUnKSB7XG4gICAgICAgICAgLy8gRG9uJ3QgbG9vayBvdXRzaWRlIHRoZSBub2RlX21vZHVsZXMgdGhpcyBwYWNrYWdlIGlzIGluc3RhbGxlZCBpbi5cbiAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBBIGJ1bmRsZSBpbmRleCBleGlzdHMgaWYgdGhlIHR5cGluZ3MgLmQudHMgZmlsZSBoYXMgYSBtZXRhZGF0YS5qc29uIHRoYXQgaGFzIGFuXG4gICAgICAgICAgLy8gaW1wb3J0QXMuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VGaWxlID0gcGF0aC5qb2luKGRpcmVjdG9yeSwgJ3BhY2thZ2UuanNvbicpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3JpZ2luYWxGaWxlRXhpc3RzKHBhY2thZ2VGaWxlKSkge1xuICAgICAgICAgICAgICAvLyBPbmNlIHdlIHNlZSBhIHBhY2thZ2UuanNvbiBmaWxlLCBhc3N1bWUgZmFsc2UgdW50aWwgaXQgd2UgZmluZCB0aGUgYnVuZGxlIGluZGV4LlxuICAgICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgY29uc3QgcGFja2FnZUNvbnRlbnQgPVxuICAgICAgICAgICAgICAgICAgSlNPTi5wYXJzZShhc3NlcnQodGhpcy5jb250ZXh0LnJlYWRGaWxlKHBhY2thZ2VGaWxlKSkpIGFzIHt0eXBpbmdzOiBzdHJpbmd9O1xuICAgICAgICAgICAgICBpZiAocGFja2FnZUNvbnRlbnQudHlwaW5ncykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGluZ3MgPSBwYXRoLm5vcm1hbGl6ZShwYXRoLmpvaW4oZGlyZWN0b3J5LCBwYWNrYWdlQ29udGVudC50eXBpbmdzKSk7XG4gICAgICAgICAgICAgICAgaWYgKERUUy50ZXN0KHR5cGluZ3MpKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBtZXRhZGF0YUZpbGUgPSB0eXBpbmdzLnJlcGxhY2UoRFRTLCAnLm1ldGFkYXRhLmpzb24nKTtcbiAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9yaWdpbmFsRmlsZUV4aXN0cyhtZXRhZGF0YUZpbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gSlNPTi5wYXJzZShhc3NlcnQodGhpcy5jb250ZXh0LnJlYWRGaWxlKG1ldGFkYXRhRmlsZSkpKSBhc1xuICAgICAgICAgICAgICAgICAgICAgICAge2ZsYXRNb2R1bGVJbmRleFJlZGlyZWN0OiBzdHJpbmcsIGltcG9ydEFzOiBzdHJpbmd9O1xuICAgICAgICAgICAgICAgICAgICBpZiAobWV0YWRhdGEuZmxhdE1vZHVsZUluZGV4UmVkaXJlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsYXRNb2R1bGVJbmRleFJlZGlyZWN0TmFtZXMuYWRkKHR5cGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IGRvbid0IHNldCByZXN1bHQgPSB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIGFzIHRoaXMgd291bGQgbWFyayB0aGlzIGZvbGRlclxuICAgICAgICAgICAgICAgICAgICAgIC8vIGFzIGhhdmluZyBhIGJ1bmRsZUluZGV4IHRvbyBlYXJseSB3aXRob3V0XG4gICAgICAgICAgICAgICAgICAgICAgLy8gZmlsbGluZyB0aGUgYnVuZGxlSW5kZXhOYW1lcy5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YS5pbXBvcnRBcykge1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmxhdE1vZHVsZUluZGV4TmFtZXMuYWRkKHR5cGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHBhdGguZGlybmFtZShkaXJlY3RvcnkpO1xuICAgICAgICAgICAgICBpZiAocGFyZW50ICE9IGRpcmVjdG9yeSkge1xuICAgICAgICAgICAgICAgIC8vIFRyeSB0aGUgcGFyZW50IGRpcmVjdG9yeS5cbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjaGVja0J1bmRsZUluZGV4KHBhcmVudCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGVuY291bnRlciBhbnkgZXJyb3JzIGFzc3VtZSB3ZSB0aGlzIGlzbid0IGEgYnVuZGxlIGluZGV4LlxuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmxhdE1vZHVsZUluZGV4Q2FjaGUuc2V0KGRpcmVjdG9yeSwgcmVzdWx0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHJldHVybiBjaGVja0J1bmRsZUluZGV4KHBhdGguZGlybmFtZShmaWxlUGF0aCkpO1xuICB9XG5cbiAgZ2V0RGVmYXVsdExpYkZpbGVOYW1lID0gKG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucykgPT5cbiAgICAgIHRoaXMuY29udGV4dC5nZXREZWZhdWx0TGliRmlsZU5hbWUob3B0aW9ucylcbiAgZ2V0Q3VycmVudERpcmVjdG9yeSA9ICgpID0+IHRoaXMuY29udGV4dC5nZXRDdXJyZW50RGlyZWN0b3J5KCk7XG4gIGdldENhbm9uaWNhbEZpbGVOYW1lID0gKGZpbGVOYW1lOiBzdHJpbmcpID0+IHRoaXMuY29udGV4dC5nZXRDYW5vbmljYWxGaWxlTmFtZShmaWxlTmFtZSk7XG4gIHVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXMgPSAoKSA9PiB0aGlzLmNvbnRleHQudXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lcygpO1xuICBnZXROZXdMaW5lID0gKCkgPT4gdGhpcy5jb250ZXh0LmdldE5ld0xpbmUoKTtcbiAgLy8gTWFrZSBzdXJlIHdlIGRvIG5vdCBgaG9zdC5yZWFscGF0aCgpYCBmcm9tIFRTIGFzIHdlIGRvIG5vdCB3YW50IHRvIHJlc29sdmUgc3ltbGlua3MuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvOTU1MlxuICByZWFscGF0aCA9IChwOiBzdHJpbmcpID0+IHA7XG4gIHdyaXRlRmlsZSA9IHRoaXMuY29udGV4dC53cml0ZUZpbGUuYmluZCh0aGlzLmNvbnRleHQpO1xufVxuXG5mdW5jdGlvbiBnZW5GaWxlRXh0ZXJuYWxSZWZlcmVuY2VzKGdlbkZpbGU6IEdlbmVyYXRlZEZpbGUpOiBTZXQ8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgU2V0KGNvbGxlY3RFeHRlcm5hbFJlZmVyZW5jZXMoZ2VuRmlsZS5zdG10cyEpLm1hcChlciA9PiBlci5tb2R1bGVOYW1lISkpO1xufVxuXG5mdW5jdGlvbiBhZGRSZWZlcmVuY2VzVG9Tb3VyY2VGaWxlKHNmOiB0cy5Tb3VyY2VGaWxlLCBnZW5GaWxlTmFtZXM6IHN0cmluZ1tdKSB7XG4gIC8vIE5vdGU6IGFzIHdlIG1vZGlmeSB0cy5Tb3VyY2VGaWxlcyB3ZSBuZWVkIHRvIGtlZXAgdGhlIG9yaWdpbmFsXG4gIC8vIHZhbHVlIGZvciBgcmVmZXJlbmNlZEZpbGVzYCBhcm91bmQgaW4gY2FjaGUgdGhlIG9yaWdpbmFsIGhvc3QgaXMgY2FjaGluZyB0cy5Tb3VyY2VGaWxlcy5cbiAgLy8gTm90ZTogY2xvbmluZyB0aGUgdHMuU291cmNlRmlsZSBpcyBleHBlbnNpdmUgYXMgdGhlIG5vZGVzIGluIGhhdmUgcGFyZW50IHBvaW50ZXJzLFxuICAvLyBpLmUuIHdlIHdvdWxkIGFsc28gbmVlZCB0byBjbG9uZSBhbmQgYWRqdXN0IGFsbCBub2Rlcy5cbiAgbGV0IG9yaWdpbmFsUmVmZXJlbmNlZEZpbGVzOiBSZWFkb25seUFycmF5PHRzLkZpbGVSZWZlcmVuY2U+ID1cbiAgICAgIChzZiBhcyBhbnkpLm9yaWdpbmFsUmVmZXJlbmNlZEZpbGVzO1xuICBpZiAoIW9yaWdpbmFsUmVmZXJlbmNlZEZpbGVzKSB7XG4gICAgb3JpZ2luYWxSZWZlcmVuY2VkRmlsZXMgPSBzZi5yZWZlcmVuY2VkRmlsZXM7XG4gICAgKHNmIGFzIGFueSkub3JpZ2luYWxSZWZlcmVuY2VkRmlsZXMgPSBvcmlnaW5hbFJlZmVyZW5jZWRGaWxlcztcbiAgfVxuICBjb25zdCBuZXdSZWZlcmVuY2VkRmlsZXMgPSBbLi4ub3JpZ2luYWxSZWZlcmVuY2VkRmlsZXNdO1xuICBnZW5GaWxlTmFtZXMuZm9yRWFjaChnZiA9PiBuZXdSZWZlcmVuY2VkRmlsZXMucHVzaCh7ZmlsZU5hbWU6IGdmLCBwb3M6IDAsIGVuZDogMH0pKTtcbiAgc2YucmVmZXJlbmNlZEZpbGVzID0gbmV3UmVmZXJlbmNlZEZpbGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JpZ2luYWxSZWZlcmVuY2VzKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiB0cy5GaWxlUmVmZXJlbmNlW118dW5kZWZpbmVkIHtcbiAgcmV0dXJuIHNvdXJjZUZpbGUgJiYgKHNvdXJjZUZpbGUgYXMgYW55KS5vcmlnaW5hbFJlZmVyZW5jZWRGaWxlcztcbn1cblxuZnVuY3Rpb24gZG90UmVsYXRpdmUoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgclBhdGg6IHN0cmluZyA9IHBhdGgucmVsYXRpdmUoZnJvbSwgdG8pLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgcmV0dXJuIHJQYXRoLnN0YXJ0c1dpdGgoJy4nKSA/IHJQYXRoIDogJy4vJyArIHJQYXRoO1xufVxuXG4vKipcbiAqIE1vdmVzIHRoZSBwYXRoIGludG8gYGdlbkRpcmAgZm9sZGVyIHdoaWxlIHByZXNlcnZpbmcgdGhlIGBub2RlX21vZHVsZXNgIGRpcmVjdG9yeS5cbiAqL1xuZnVuY3Rpb24gZ2V0UGFja2FnZU5hbWUoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgY29uc3QgbWF0Y2ggPSBOT0RFX01PRFVMRVNfUEFDS0FHRV9OQU1FLmV4ZWMoZmlsZVBhdGgpO1xuICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIHN0cmlwTm9kZU1vZHVsZXNQcmVmaXgoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBmaWxlUGF0aC5yZXBsYWNlKC8uKm5vZGVfbW9kdWxlc1xcLy8sICcnKTtcbn1cblxuZnVuY3Rpb24gZ2V0Tm9kZU1vZHVsZXNQcmVmaXgoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgY29uc3QgbWF0Y2ggPSAvLipub2RlX21vZHVsZXNcXC8vLmV4ZWMoZmlsZVBhdGgpO1xuICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIHN0cmlwTmdSZXNvdXJjZVN1ZmZpeChmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGZpbGVOYW1lLnJlcGxhY2UoL1xcLlxcJG5ncmVzb3VyY2VcXCQuKi8sICcnKTtcbn1cblxuZnVuY3Rpb24gYWRkTmdSZXNvdXJjZVN1ZmZpeChmaWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke2ZpbGVOYW1lfS4kbmdyZXNvdXJjZSRgO1xufVxuIl19