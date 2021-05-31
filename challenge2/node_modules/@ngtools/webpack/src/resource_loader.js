"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackResourceLoader = void 0;
const crypto_1 = require("crypto");
const path = require("path");
const vm = require("vm");
const webpack_1 = require("webpack");
const paths_1 = require("./ivy/paths");
class WebpackResourceLoader {
    constructor(shouldCache) {
        this._fileDependencies = new Map();
        this._reverseDependencies = new Map();
        this.modifiedResources = new Set();
        this.outputPathCounter = 1;
        if (shouldCache) {
            this.fileCache = new Map();
            this.inlineCache = new Map();
            this.assetCache = new Map();
        }
    }
    update(parentCompilation, changedFiles) {
        var _a, _b, _c, _d, _e;
        this._parentCompilation = parentCompilation;
        // Update resource cache and modified resources
        this.modifiedResources.clear();
        if (changedFiles) {
            for (const changedFile of changedFiles) {
                const changedFileNormalized = paths_1.normalizePath(changedFile);
                (_a = this.assetCache) === null || _a === void 0 ? void 0 : _a.delete(changedFileNormalized);
                for (const affectedResource of this.getAffectedResources(changedFile)) {
                    const affectedResourceNormalized = paths_1.normalizePath(affectedResource);
                    (_b = this.fileCache) === null || _b === void 0 ? void 0 : _b.delete(affectedResourceNormalized);
                    this.modifiedResources.add(affectedResource);
                    for (const effectedDependencies of this.getResourceDependencies(affectedResourceNormalized)) {
                        (_c = this.assetCache) === null || _c === void 0 ? void 0 : _c.delete(paths_1.normalizePath(effectedDependencies));
                    }
                }
            }
        }
        else {
            (_d = this.fileCache) === null || _d === void 0 ? void 0 : _d.clear();
            (_e = this.assetCache) === null || _e === void 0 ? void 0 : _e.clear();
        }
        // Re-emit all assets for un-effected files
        if (this.assetCache) {
            for (const [, { name, source, info }] of this.assetCache) {
                this._parentCompilation.emitAsset(name, source, info);
            }
        }
    }
    clearParentCompilation() {
        this._parentCompilation = undefined;
    }
    getModifiedResourceFiles() {
        return this.modifiedResources;
    }
    getResourceDependencies(filePath) {
        return this._fileDependencies.get(filePath) || [];
    }
    getAffectedResources(file) {
        return this._reverseDependencies.get(file) || [];
    }
    setAffectedResources(file, resources) {
        this._reverseDependencies.set(file, new Set(resources));
    }
    async _compile(filePath, data, mimeType, resourceType, hash, containingFile) {
        if (!this._parentCompilation) {
            throw new Error('WebpackResourceLoader cannot be used without parentCompilation');
        }
        // Create a special URL for reading the resource from memory
        const entry = data ? `angular-resource:${resourceType},${hash}` : filePath;
        if (!entry) {
            throw new Error(`"filePath" or "data" must be specified.`);
        }
        // Simple sanity check.
        if (filePath === null || filePath === void 0 ? void 0 : filePath.match(/\.[jt]s$/)) {
            throw new Error(`Cannot use a JavaScript or TypeScript file (${filePath}) in a component's styleUrls or templateUrl.`);
        }
        const outputFilePath = filePath ||
            `${containingFile}-angular-inline--${this.outputPathCounter++}.${resourceType === 'template' ? 'html' : 'css'}`;
        const outputOptions = {
            filename: outputFilePath,
            library: {
                type: 'var',
                name: 'resource',
            },
        };
        const context = this._parentCompilation.compiler.context;
        const childCompiler = this._parentCompilation.createChildCompiler('angular-compiler:resource', outputOptions, [
            new webpack_1.node.NodeTemplatePlugin(outputOptions),
            new webpack_1.node.NodeTargetPlugin(),
            new webpack_1.EntryPlugin(context, entry, { name: 'resource' }),
            new webpack_1.library.EnableLibraryPlugin('var'),
        ]);
        childCompiler.hooks.thisCompilation.tap('angular-compiler', (compilation, { normalModuleFactory }) => {
            // If no data is provided, the resource will be read from the filesystem
            if (data !== undefined) {
                normalModuleFactory.hooks.resolveForScheme
                    .for('angular-resource')
                    .tap('angular-compiler', (resourceData) => {
                    if (filePath) {
                        resourceData.path = filePath;
                        resourceData.resource = filePath;
                    }
                    if (mimeType) {
                        resourceData.data.mimetype = mimeType;
                    }
                    return true;
                });
                webpack_1.NormalModule.getCompilationHooks(compilation)
                    .readResourceForScheme.for('angular-resource')
                    .tap('angular-compiler', () => data);
            }
            compilation.hooks.additionalAssets.tap('angular-compiler', () => {
                const asset = compilation.assets[outputFilePath];
                if (!asset) {
                    return;
                }
                try {
                    const output = this._evaluate(outputFilePath, asset.source().toString());
                    if (typeof output === 'string') {
                        compilation.assets[outputFilePath] = new webpack_1.sources.RawSource(output);
                    }
                }
                catch (error) {
                    // Use compilation errors, as otherwise webpack will choke
                    compilation.errors.push(error);
                }
            });
        });
        let finalContent;
        let finalMap;
        childCompiler.hooks.compilation.tap('angular-compiler', (childCompilation) => {
            childCompilation.hooks.processAssets.tap({ name: 'angular-compiler', stage: webpack_1.Compilation.PROCESS_ASSETS_STAGE_REPORT }, () => {
                var _a, _b;
                finalContent = (_a = childCompilation.assets[outputFilePath]) === null || _a === void 0 ? void 0 : _a.source().toString();
                finalMap = (_b = childCompilation.assets[outputFilePath + '.map']) === null || _b === void 0 ? void 0 : _b.source().toString();
                delete childCompilation.assets[outputFilePath];
                delete childCompilation.assets[outputFilePath + '.map'];
            });
        });
        return new Promise((resolve, reject) => {
            childCompiler.runAsChild((error, _, childCompilation) => {
                var _a, _b;
                if (error) {
                    reject(error);
                    return;
                }
                else if (!childCompilation) {
                    reject(new Error('Unknown child compilation error'));
                    return;
                }
                // Workaround to attempt to reduce memory usage of child compilations.
                // This removes the child compilation from the main compilation and manually propagates
                // all dependencies, warnings, and errors.
                const parent = childCompiler.parentCompilation;
                if (parent) {
                    parent.children = parent.children.filter((child) => child !== childCompilation);
                    for (const fileDependency of childCompilation.fileDependencies) {
                        if (data && containingFile && fileDependency.endsWith(entry)) {
                            // use containing file if the resource was inline
                            parent.fileDependencies.add(containingFile);
                        }
                        else {
                            parent.fileDependencies.add(fileDependency);
                        }
                    }
                    parent.contextDependencies.addAll(childCompilation.contextDependencies);
                    parent.missingDependencies.addAll(childCompilation.missingDependencies);
                    parent.buildDependencies.addAll(childCompilation.buildDependencies);
                    parent.warnings.push(...childCompilation.warnings);
                    parent.errors.push(...childCompilation.errors);
                    for (const { info, name, source } of childCompilation.getAssets()) {
                        if (info.sourceFilename === undefined) {
                            throw new Error(`'${name}' asset info 'sourceFilename' is 'undefined'.`);
                        }
                        (_a = this.assetCache) === null || _a === void 0 ? void 0 : _a.set(info.sourceFilename, { info, name, source });
                    }
                }
                // Save the dependencies for this resource.
                if (filePath) {
                    this._fileDependencies.set(filePath, new Set(childCompilation.fileDependencies));
                    for (const file of childCompilation.fileDependencies) {
                        const resolvedFile = paths_1.normalizePath(file);
                        // Skip paths that do not appear to be files (have no extension).
                        // `fileDependencies` can contain directories and not just files which can
                        // cause incorrect cache invalidation on rebuilds.
                        if (!path.extname(resolvedFile)) {
                            continue;
                        }
                        const entry = this._reverseDependencies.get(resolvedFile);
                        if (entry) {
                            entry.add(filePath);
                        }
                        else {
                            this._reverseDependencies.set(resolvedFile, new Set([filePath]));
                        }
                    }
                }
                resolve({
                    content: finalContent !== null && finalContent !== void 0 ? finalContent : '',
                    success: ((_b = childCompilation.errors) === null || _b === void 0 ? void 0 : _b.length) === 0,
                });
            });
        });
    }
    _evaluate(filename, source) {
        var _a;
        // Evaluate code
        const context = {};
        try {
            vm.runInNewContext(source, context, { filename });
        }
        catch {
            // Error are propagated through the child compilation.
            return null;
        }
        if (typeof context.resource === 'string') {
            return context.resource;
        }
        else if (typeof ((_a = context.resource) === null || _a === void 0 ? void 0 : _a.default) === 'string') {
            return context.resource.default;
        }
        throw new Error(`The loader "${filename}" didn't return a string.`);
    }
    async get(filePath) {
        var _a;
        const normalizedFile = paths_1.normalizePath(filePath);
        let compilationResult = (_a = this.fileCache) === null || _a === void 0 ? void 0 : _a.get(normalizedFile);
        if (compilationResult === undefined) {
            // cache miss so compile resource
            compilationResult = await this._compile(filePath);
            // Only cache if compilation was successful
            if (this.fileCache && compilationResult.success) {
                this.fileCache.set(normalizedFile, compilationResult);
            }
        }
        return compilationResult.content;
    }
    async process(data, mimeType, resourceType, containingFile) {
        var _a;
        if (data.trim().length === 0) {
            return '';
        }
        const cacheKey = crypto_1.createHash('md5').update(data).digest('hex');
        let compilationResult = (_a = this.inlineCache) === null || _a === void 0 ? void 0 : _a.get(cacheKey);
        if (compilationResult === undefined) {
            compilationResult = await this._compile(undefined, data, mimeType, resourceType, cacheKey, containingFile);
            if (this.inlineCache && compilationResult.success) {
                this.inlineCache.set(cacheKey, compilationResult);
            }
        }
        return compilationResult.content;
    }
}
exports.WebpackResourceLoader = WebpackResourceLoader;
