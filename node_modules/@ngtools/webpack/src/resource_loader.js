"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackResourceLoader = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const node_buffer_1 = require("node:buffer");
const path = __importStar(require("node:path"));
const vm = __importStar(require("node:vm"));
const diagnostics_1 = require("./ivy/diagnostics");
const paths_1 = require("./ivy/paths");
const inline_resource_1 = require("./loaders/inline-resource");
const replace_resources_1 = require("./transformers/replace_resources");
class WebpackResourceLoader {
    constructor(shouldCache) {
        this._fileDependencies = new Map();
        this._reverseDependencies = new Map();
        this.modifiedResources = new Set();
        this.outputPathCounter = 1;
        this.inlineDataLoaderPath = inline_resource_1.InlineAngularResourceLoaderPath;
        if (shouldCache) {
            this.fileCache = new Map();
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
                const changedFileNormalized = (0, paths_1.normalizePath)(changedFile);
                (_a = this.assetCache) === null || _a === void 0 ? void 0 : _a.delete(changedFileNormalized);
                for (const affectedResource of this.getAffectedResources(changedFile)) {
                    const affectedResourceNormalized = (0, paths_1.normalizePath)(affectedResource);
                    (_b = this.fileCache) === null || _b === void 0 ? void 0 : _b.delete(affectedResourceNormalized);
                    this.modifiedResources.add(affectedResource);
                    for (const effectedDependencies of this.getResourceDependencies(affectedResourceNormalized)) {
                        (_c = this.assetCache) === null || _c === void 0 ? void 0 : _c.delete((0, paths_1.normalizePath)(effectedDependencies));
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
    // eslint-disable-next-line max-lines-per-function
    async _compile(filePath, data, fileExtension, resourceType, containingFile) {
        if (!this._parentCompilation) {
            throw new Error('WebpackResourceLoader cannot be used without parentCompilation');
        }
        const { context, webpack } = this._parentCompilation.compiler;
        const { EntryPlugin, NormalModule, WebpackError, library, node, sources, util: { createHash }, } = webpack;
        const getEntry = () => {
            if (filePath) {
                return `${filePath}?${replace_resources_1.NG_COMPONENT_RESOURCE_QUERY}`;
            }
            else if (resourceType) {
                return (
                // app.component.ts-2.css?ngResource!=!@ngtools/webpack/src/loaders/inline-resource.js!app.component.ts
                `${containingFile}-${this.outputPathCounter}.${fileExtension}` +
                    `?${replace_resources_1.NG_COMPONENT_RESOURCE_QUERY}!=!${this.inlineDataLoaderPath}!${containingFile}`);
            }
            else if (data) {
                // Create a special URL for reading the resource from memory
                return `angular-resource:${resourceType},${createHash('xxhash64')
                    .update(data)
                    .digest('hex')}`;
            }
            throw new Error(`"filePath", "resourceType" or "data" must be specified.`);
        };
        const entry = getEntry();
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
        const childCompiler = this._parentCompilation.createChildCompiler('angular-compiler:resource', outputOptions, [
            new node.NodeTemplatePlugin(outputOptions),
            new node.NodeTargetPlugin(),
            new EntryPlugin(context, entry, { name: 'resource' }),
            new library.EnableLibraryPlugin('var'),
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
                    return true;
                });
                NormalModule.getCompilationHooks(compilation)
                    .readResourceForScheme.for('angular-resource')
                    .tap('angular-compiler', () => data);
                compilation[inline_resource_1.InlineAngularResourceSymbol] = data;
            }
            compilation.hooks.additionalAssets.tap('angular-compiler', () => {
                const asset = compilation.assets[outputFilePath];
                if (!asset) {
                    return;
                }
                try {
                    const output = this._evaluate(outputFilePath, asset.source().toString());
                    if (typeof output === 'string') {
                        compilation.assets[outputFilePath] = new sources.RawSource(output);
                    }
                }
                catch (error) {
                    (0, node_assert_1.default)(error instanceof Error, 'catch clause variable is not an Error instance');
                    // Use compilation errors, as otherwise webpack will choke
                    (0, diagnostics_1.addError)(compilation, error.message);
                }
            });
        });
        let finalContent;
        childCompiler.hooks.compilation.tap('angular-compiler', (childCompilation) => {
            childCompilation.hooks.processAssets.tap({ name: 'angular-compiler', stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT }, () => {
                var _a;
                finalContent = (_a = childCompilation.assets[outputFilePath]) === null || _a === void 0 ? void 0 : _a.source().toString();
                for (const { files } of childCompilation.chunks) {
                    for (const file of files) {
                        childCompilation.deleteAsset(file);
                    }
                }
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
                    let fileDependencies;
                    for (const dependency of childCompilation.fileDependencies) {
                        // Skip paths that do not appear to be files (have no extension).
                        // `fileDependencies` can contain directories and not just files which can
                        // cause incorrect cache invalidation on rebuilds.
                        if (!path.extname(dependency)) {
                            continue;
                        }
                        if (data && containingFile && dependency.endsWith(entry)) {
                            // use containing file if the resource was inline
                            parent.fileDependencies.add(containingFile);
                        }
                        else {
                            parent.fileDependencies.add(dependency);
                        }
                        // Save the dependencies for this resource.
                        if (filePath) {
                            const resolvedFile = (0, paths_1.normalizePath)(dependency);
                            const entry = this._reverseDependencies.get(resolvedFile);
                            if (entry) {
                                entry.add(filePath);
                            }
                            else {
                                this._reverseDependencies.set(resolvedFile, new Set([filePath]));
                            }
                            if (fileDependencies) {
                                fileDependencies.add(dependency);
                            }
                            else {
                                fileDependencies = new Set([dependency]);
                                this._fileDependencies.set(filePath, fileDependencies);
                            }
                        }
                    }
                    parent.contextDependencies.addAll(childCompilation.contextDependencies);
                    parent.missingDependencies.addAll(childCompilation.missingDependencies);
                    parent.buildDependencies.addAll(childCompilation.buildDependencies);
                    parent.warnings.push(...childCompilation.warnings);
                    parent.errors.push(...childCompilation.errors);
                    if (this.assetCache) {
                        for (const { info, name, source } of childCompilation.getAssets()) {
                            // Use the originating file as the cache key if present
                            // Otherwise, generate a cache key based on the generated name
                            const cacheKey = (_a = info.sourceFilename) !== null && _a !== void 0 ? _a : `!![GENERATED]:${name}`;
                            this.assetCache.set(cacheKey, { info, name, source });
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
        // Evaluate code
        var _a;
        // css-loader requires the btoa function to exist to correctly generate inline sourcemaps
        const context = {
            btoa(input) {
                return node_buffer_1.Buffer.from(input).toString('base64');
            },
        };
        try {
            vm.runInNewContext(source, context, { filename });
        }
        catch (_b) {
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
        const normalizedFile = (0, paths_1.normalizePath)(filePath);
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
    async process(data, fileExtension, resourceType, containingFile) {
        if (data.trim().length === 0) {
            return '';
        }
        const compilationResult = await this._compile(undefined, data, fileExtension, resourceType, containingFile);
        return compilationResult.content;
    }
}
exports.WebpackResourceLoader = WebpackResourceLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvbmd0b29scy93ZWJwYWNrL3NyYy9yZXNvdXJjZV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCw4REFBaUM7QUFDakMsNkNBQXFDO0FBQ3JDLGdEQUFrQztBQUNsQyw0Q0FBOEI7QUFFOUIsbURBQTZDO0FBQzdDLHVDQUE0QztBQUM1QywrREFJbUM7QUFDbkMsd0VBQStFO0FBUS9FLE1BQWEscUJBQXFCO0lBYWhDLFlBQVksV0FBb0I7UUFYeEIsc0JBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQXVCLENBQUM7UUFDbkQseUJBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQXVCLENBQUM7UUFLdEQsc0JBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUN0QyxzQkFBaUIsR0FBRyxDQUFDLENBQUM7UUFFYix5QkFBb0IsR0FBRyxpREFBK0IsQ0FBQztRQUd0RSxJQUFJLFdBQVcsRUFBRTtZQUNmLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7U0FDN0I7SUFDSCxDQUFDO0lBRUQsTUFBTSxDQUFDLGlCQUE4QixFQUFFLFlBQStCOztRQUNwRSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsaUJBQWlCLENBQUM7UUFFNUMsK0NBQStDO1FBQy9DLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUUvQixJQUFJLFlBQVksRUFBRTtZQUNoQixLQUFLLE1BQU0sV0FBVyxJQUFJLFlBQVksRUFBRTtnQkFDdEMsTUFBTSxxQkFBcUIsR0FBRyxJQUFBLHFCQUFhLEVBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3pELE1BQUEs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QUFhLEVBQ2IsWUFBWSxFQUNaLGNBQWMsQ0FDZixDQUFDO1FBRUYsT0FBTyxpQkFBaUIsQ0FBQyxPQUFPLENBQUM7SUFDbkMsQ0FBQztDQUNGO0FBaldELHNEQWlXQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgYXNzZXJ0IGZyb20gJ25vZGU6YXNzZXJ0JztcbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ25vZGU6YnVmZmVyJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCAqIGFzIHZtIGZyb20gJ25vZGU6dm0nO1xuaW1wb3J0IHR5cGUgeyBBc3NldCwgQ29tcGlsYXRpb24gfSBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB7IGFkZEVycm9yIH0gZnJvbSAnLi9pdnkvZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHsgbm9ybWFsaXplUGF0aCB9IGZyb20gJy4vaXZ5L3BhdGhzJztcbmltcG9ydCB7XG4gIENvbXBpbGF0aW9uV2l0aElubGluZUFuZ3VsYXJSZXNvdXJjZSxcbiAgSW5saW5lQW5ndWxhclJlc291cmNlTG9hZGVyUGF0aCxcbiAgSW5saW5lQW5ndWxhclJlc291cmNlU3ltYm9sLFxufSBmcm9tICcuL2xvYWRlcnMvaW5saW5lLXJlc291cmNlJztcbmltcG9ydCB7IE5HX0NPTVBPTkVOVF9SRVNPVVJDRV9RVUVSWSB9IGZyb20gJy4vdHJhbnNmb3JtZXJzL3JlcGxhY2VfcmVzb3VyY2VzJztcblxuaW50ZXJmYWNlIENvbXBpbGF0aW9uT3V0cHV0IHtcbiAgY29udGVudDogc3RyaW5nO1xuICBtYXA/OiBzdHJpbmc7XG4gIHN1Y2Nlc3M6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBXZWJwYWNrUmVzb3VyY2VMb2FkZXIge1xuICBwcml2YXRlIF9wYXJlbnRDb21waWxhdGlvbj86IENvbXBpbGF0aW9uO1xuICBwcml2YXRlIF9maWxlRGVwZW5kZW5jaWVzID0gbmV3IE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+PigpO1xuICBwcml2YXRlIF9yZXZlcnNlRGVwZW5kZW5jaWVzID0gbmV3IE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+PigpO1xuXG4gIHByaXZhdGUgZmlsZUNhY2hlPzogTWFwPHN0cmluZywgQ29tcGlsYXRpb25PdXRwdXQ+O1xuICBwcml2YXRlIGFzc2V0Q2FjaGU/OiBNYXA8c3RyaW5nLCBBc3NldD47XG5cbiAgcHJpdmF0ZSBtb2RpZmllZFJlc291cmNlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBwcml2YXRlIG91dHB1dFBhdGhDb3VudGVyID0gMTtcblxuICBwcml2YXRlIHJlYWRvbmx5IGlubGluZURhdGFMb2FkZXJQYXRoID0gSW5saW5lQW5ndWxhclJlc291cmNlTG9hZGVyUGF0aDtcblxuICBjb25zdHJ1Y3RvcihzaG91bGRDYWNoZTogYm9vbGVhbikge1xuICAgIGlmIChzaG91bGRDYWNoZSkge1xuICAgICAgdGhpcy5maWxlQ2FjaGUgPSBuZXcgTWFwKCk7XG4gICAgICB0aGlzLmFzc2V0Q2FjaGUgPSBuZXcgTWFwKCk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlKHBhcmVudENvbXBpbGF0aW9uOiBDb21waWxhdGlvbiwgY2hhbmdlZEZpbGVzPzogSXRlcmFibGU8c3RyaW5nPikge1xuICAgIHRoaXMuX3BhcmVudENvbXBpbGF0aW9uID0gcGFyZW50Q29tcGlsYXRpb247XG5cbiAgICAvLyBVcGRhdGUgcmVzb3VyY2UgY2FjaGUgYW5kIG1vZGlmaWVkIHJlc291cmNlc1xuICAgIHRoaXMubW9kaWZpZWRSZXNvdXJjZXMuY2xlYXIoKTtcblxuICAgIGlmIChjaGFuZ2VkRmlsZXMpIHtcbiAgICAgIGZvciAoY29uc3QgY2hhbmdlZEZpbGUgb2YgY2hhbmdlZEZpbGVzKSB7XG4gICAgICAgIGNvbnN0IGNoYW5nZWRGaWxlTm9ybWFsaXplZCA9IG5vcm1hbGl6ZVBhdGgoY2hhbmdlZEZpbGUpO1xuICAgICAgICB0aGlzLmFzc2V0Q2FjaGU/LmRlbGV0ZShjaGFuZ2VkRmlsZU5vcm1hbGl6ZWQpO1xuXG4gICAgICAgIGZvciAoY29uc3QgYWZmZWN0ZWRSZXNvdXJjZSBvZiB0aGlzLmdldEFmZmVjdGVkUmVzb3VyY2VzKGNoYW5nZWRGaWxlKSkge1xuICAgICAgICAgIGNvbnN0IGFmZmVjdGVkUmVzb3VyY2VOb3JtYWxpemVkID0gbm9ybWFsaXplUGF0aChhZmZlY3RlZFJlc291cmNlKTtcbiAgICAgICAgICB0aGlzLmZpbGVDYWNoZT8uZGVsZXRlKGFmZmVjdGVkUmVzb3VyY2VOb3JtYWxpemVkKTtcbiAgICAgICAgICB0aGlzLm1vZGlmaWVkUmVzb3VyY2VzLmFkZChhZmZlY3RlZFJlc291cmNlKTtcblxuICAgICAgICAgIGZvciAoY29uc3QgZWZmZWN0ZWREZXBlbmRlbmNpZXMgb2YgdGhpcy5nZXRSZXNvdXJjZURlcGVuZGVuY2llcyhcbiAgICAgICAgICAgIGFmZmVjdGVkUmVzb3VyY2VOb3JtYWxpemVkLFxuICAgICAgICAgICkpIHtcbiAgICAgICAgICAgIHRoaXMuYXNzZXRDYWNoZT8uZGVsZXRlKG5vcm1hbGl6ZVBhdGgoZWZmZWN0ZWREZXBlbmRlbmNpZXMpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5maWxlQ2FjaGU/LmNsZWFyKCk7XG4gICAgICB0aGlzLmFzc2V0Q2FjaGU/LmNsZWFyKCk7XG4gICAgfVxuXG4gICAgLy8gUmUtZW1pdCBhbGwgYXNzZXRzIGZvciB1bi1lZmZlY3RlZCBmaWxlc1xuICAgIGlmICh0aGlzLmFzc2V0Q2FjaGUpIHtcbiAgICAgIGZvciAoY29uc3QgWywgeyBuYW1lLCBzb3VyY2UsIGluZm8gfV0gb2YgdGhpcy5hc3NldENhY2hlKSB7XG4gICAgICAgIHRoaXMuX3BhcmVudENvbXBpbGF0aW9uLmVtaXRBc3NldChuYW1lLCBzb3VyY2UsIGluZm8pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNsZWFyUGFyZW50Q29tcGlsYXRpb24oKSB7XG4gICAgdGhpcy5fcGFyZW50Q29tcGlsYXRpb24gPSB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXRNb2RpZmllZFJlc291cmNlRmlsZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kaWZpZWRSZXNvdXJjZXM7XG4gIH1cblxuICBnZXRSZXNvdXJjZURlcGVuZGVuY2llcyhmaWxlUGF0aDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbGVEZXBlbmRlbmNpZXMuZ2V0KGZpbGVQYXRoKSB8fCBbXTtcbiAgfVxuXG4gIGdldEFmZmVjdGVkUmVzb3VyY2VzKGZpbGU6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLl9yZXZlcnNlRGVwZW5kZW5jaWVzLmdldChmaWxlKSB8fCBbXTtcbiAgfVxuXG4gIHNldEFmZmVjdGVkUmVzb3VyY2VzKGZpbGU6IHN0cmluZywgcmVzb3VyY2VzOiBJdGVyYWJsZTxzdHJpbmc+KSB7XG4gICAgdGhpcy5fcmV2ZXJzZURlcGVuZGVuY2llcy5zZXQoZmlsZSwgbmV3IFNldChyZXNvdXJjZXMpKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBtYXgtbGluZXMtcGVyLWZ1bmN0aW9uXG4gIHByaXZhdGUgYXN5bmMgX2NvbXBpbGUoXG4gICAgZmlsZVBhdGg/OiBzdHJpbmcsXG4gICAgZGF0YT86IHN0cmluZyxcbiAgICBmaWxlRXh0ZW5zaW9uPzogc3RyaW5nLFxuICAgIHJlc291cmNlVHlwZT86ICdzdHlsZScgfCAndGVtcGxhdGUnLFxuICAgIGNvbnRhaW5pbmdGaWxlPzogc3RyaW5nLFxuICApOiBQcm9taXNlPENvbXBpbGF0aW9uT3V0cHV0PiB7XG4gICAgaWYgKCF0aGlzLl9wYXJlbnRDb21waWxhdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdXZWJwYWNrUmVzb3VyY2VMb2FkZXIgY2Fubm90IGJlIHVzZWQgd2l0aG91dCBwYXJlbnRDb21waWxhdGlvbicpO1xuICAgIH1cblxuICAgIGNvbnN0IHsgY29udGV4dCwgd2VicGFjayB9ID0gdGhpcy5fcGFyZW50Q29tcGlsYXRpb24uY29tcGlsZXI7XG4gICAgY29uc3Qge1xuICAgICAgRW50cnlQbHVnaW4sXG4gICAgICBOb3JtYWxNb2R1bGUsXG4gICAgICBXZWJwYWNrRXJyb3IsXG4gICAgICBsaWJyYXJ5LFxuICAgICAgbm9kZSxcbiAgICAgIHNvdXJjZXMsXG4gICAgICB1dGlsOiB7IGNyZWF0ZUhhc2ggfSxcbiAgICB9ID0gd2VicGFjaztcblxuICAgIGNvbnN0IGdldEVudHJ5ID0gKCk6IHN0cmluZyA9PiB7XG4gICAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgICAgcmV0dXJuIGAke2ZpbGVQYXRofT8ke05HX0NPTVBPTkVOVF9SRVNPVVJDRV9RVUVSWX1gO1xuICAgICAgfSBlbHNlIGlmIChyZXNvdXJjZVR5cGUpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAvLyBhcHAuY29tcG9uZW50LnRzLTIuY3NzP25nUmVzb3VyY2UhPSFAbmd0b29scy93ZWJwYWNrL3NyYy9sb2FkZXJzL2lubGluZS1yZXNvdXJjZS5qcyFhcHAuY29tcG9uZW50LnRzXG4gICAgICAgICAgYCR7Y29udGFpbmluZ0ZpbGV9LSR7dGhpcy5vdXRwdXRQYXRoQ291bnRlcn0uJHtmaWxlRXh0ZW5zaW9ufWAgK1xuICAgICAgICAgIGA/JHtOR19DT01QT05FTlRfUkVTT1VSQ0VfUVVFUll9IT0hJHt0aGlzLmlubGluZURhdGFMb2FkZXJQYXRofSEke2NvbnRhaW5pbmdGaWxlfWBcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YSkge1xuICAgICAgICAvLyBDcmVhdGUgYSBzcGVjaWFsIFVSTCBmb3IgcmVhZGluZyB0aGUgcmVzb3VyY2UgZnJvbSBtZW1vcnlcbiAgICAgICAgcmV0dXJuIGBhbmd1bGFyLXJlc291cmNlOiR7cmVzb3VyY2VUeXBlfSwke2NyZWF0ZUhhc2goJ3h4aGFzaDY0JylcbiAgICAgICAgICAudXBkYXRlKGRhdGEpXG4gICAgICAgICAgLmRpZ2VzdCgnaGV4Jyl9YDtcbiAgICAgIH1cblxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBcImZpbGVQYXRoXCIsIFwicmVzb3VyY2VUeXBlXCIgb3IgXCJkYXRhXCIgbXVzdCBiZSBzcGVjaWZpZWQuYCk7XG4gICAgfTtcblxuICAgIGNvbnN0IGVudHJ5ID0gZ2V0RW50cnkoKTtcblxuICAgIC8vIFNpbXBsZSBzYW5pdHkgY2hlY2suXG4gICAgaWYgKGZpbGVQYXRoPy5tYXRjaCgvXFwuW2p0XXMkLykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYENhbm5vdCB1c2UgYSBKYXZhU2NyaXB0IG9yIFR5cGVTY3JpcHQgZmlsZSAoJHtmaWxlUGF0aH0pIGluIGEgY29tcG9uZW50J3Mgc3R5bGVVcmxzIG9yIHRlbXBsYXRlVXJsLmAsXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dEZpbGVQYXRoID1cbiAgICAgIGZpbGVQYXRoIHx8XG4gICAgICBgJHtjb250YWluaW5nRmlsZX0tYW5ndWxhci1pbmxpbmUtLSR7dGhpcy5vdXRwdXRQYXRoQ291bnRlcisrfS4ke1xuICAgICAgICByZXNvdXJjZVR5cGUgPT09ICd0ZW1wbGF0ZScgPyAnaHRtbCcgOiAnY3NzJ1xuICAgICAgfWA7XG4gICAgY29uc3Qgb3V0cHV0T3B0aW9ucyA9IHtcbiAgICAgIGZpbGVuYW1lOiBvdXRwdXRGaWxlUGF0aCxcbiAgICAgIGxpYnJhcnk6IHtcbiAgICAgICAgdHlwZTogJ3ZhcicsXG4gICAgICAgIG5hbWU6ICdyZXNvdXJjZScsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBjb25zdCBjaGlsZENvbXBpbGVyID0gdGhpcy5fcGFyZW50Q29tcGlsYXRpb24uY3JlYXRlQ2hpbGRDb21waWxlcihcbiAgICAgICdhbmd1bGFyLWNvbXBpbGVyOnJlc291cmNlJyxcbiAgICAgIG91dHB1dE9wdGlvbnMsXG4gICAgICBbXG4gICAgICAgIG5ldyBub2RlLk5vZGVUZW1wbGF0ZVBsdWdpbihvdXRwdXRPcHRpb25zKSxcbiAgICAgICAgbmV3IG5vZGUuTm9kZVRhcmdldFBsdWdpbigpLFxuICAgICAgICBuZXcgRW50cnlQbHVnaW4oY29udGV4dCwgZW50cnksIHsgbmFtZTogJ3Jlc291cmNlJyB9KSxcbiAgICAgICAgbmV3IGxpYnJhcnkuRW5hYmxlTGlicmFyeVBsdWdpbigndmFyJyksXG4gICAgICBdLFxuICAgICk7XG5cbiAgICBjaGlsZENvbXBpbGVyLmhvb2tzLnRoaXNDb21waWxhdGlvbi50YXAoXG4gICAgICAnYW5ndWxhci1jb21waWxlcicsXG4gICAgICAoY29tcGlsYXRpb24sIHsgbm9ybWFsTW9kdWxlRmFjdG9yeSB9KSA9PiB7XG4gICAgICAgIC8vIElmIG5vIGRhdGEgaXMgcHJvdmlkZWQsIHRoZSByZXNvdXJjZSB3aWxsIGJlIHJlYWQgZnJvbSB0aGUgZmlsZXN5c3RlbVxuICAgICAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbm9ybWFsTW9kdWxlRmFjdG9yeS5ob29rcy5yZXNvbHZlRm9yU2NoZW1lXG4gICAgICAgICAgICAuZm9yKCdhbmd1bGFyLXJlc291cmNlJylcbiAgICAgICAgICAgIC50YXAoJ2FuZ3VsYXItY29tcGlsZXInLCAocmVzb3VyY2VEYXRhKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICAgICAgICAgIHJlc291cmNlRGF0YS5wYXRoID0gZmlsZVBhdGg7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2VEYXRhLnJlc291cmNlID0gZmlsZVBhdGg7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIE5vcm1hbE1vZHVsZS5nZXRDb21waWxhdGlvbkhvb2tzKGNvbXBpbGF0aW9uKVxuICAgICAgICAgICAgLnJlYWRSZXNvdXJjZUZvclNjaGVtZS5mb3IoJ2FuZ3VsYXItcmVzb3VyY2UnKVxuICAgICAgICAgICAgLnRhcCgnYW5ndWxhci1jb21waWxlcicsICgpID0+IGRhdGEpO1xuXG4gICAgICAgICAgKGNvbXBpbGF0aW9uIGFzIENvbXBpbGF0aW9uV2l0aElubGluZUFuZ3VsYXJSZXNvdXJjZSlbSW5saW5lQW5ndWxhclJlc291cmNlU3ltYm9sXSA9IGRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICBjb21waWxhdGlvbi5ob29rcy5hZGRpdGlvbmFsQXNzZXRzLnRhcCgnYW5ndWxhci1jb21waWxlcicsICgpID0+IHtcbiAgICAgICAgICBjb25zdCBhc3NldCA9IGNvbXBpbGF0aW9uLmFzc2V0c1tvdXRwdXRGaWxlUGF0aF07XG4gICAgICAgICAgaWYgKCFhc3NldCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBvdXRwdXQgPSB0aGlzLl9ldmFsdWF0ZShvdXRwdXRGaWxlUGF0aCwgYXNzZXQuc291cmNlKCkudG9TdHJpbmcoKSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3V0cHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICBjb21waWxhdGlvbi5hc3NldHNbb3V0cHV0RmlsZVBhdGhdID0gbmV3IHNvdXJjZXMuUmF3U291cmNlKG91dHB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGFzc2VydChlcnJvciBpbnN0YW5jZW9mIEVycm9yLCAnY2F0Y2ggY2xhdXNlIHZhcmlhYmxlIGlzIG5vdCBhbiBFcnJvciBpbnN0YW5jZScpO1xuICAgICAgICAgICAgLy8gVXNlIGNvbXBpbGF0aW9uIGVycm9ycywgYXMgb3RoZXJ3aXNlIHdlYnBhY2sgd2lsbCBjaG9rZVxuICAgICAgICAgICAgYWRkRXJyb3IoY29tcGlsYXRpb24sIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICk7XG5cbiAgICBsZXQgZmluYWxDb250ZW50OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgY2hpbGRDb21waWxlci5ob29rcy5jb21waWxhdGlvbi50YXAoJ2FuZ3VsYXItY29tcGlsZXInLCAoY2hpbGRDb21waWxhdGlvbikgPT4ge1xuICAgICAgY2hpbGRDb21waWxhdGlvbi5ob29rcy5wcm9jZXNzQXNzZXRzLnRhcChcbiAgICAgICAgeyBuYW1lOiAnYW5ndWxhci1jb21waWxlcicsIHN0YWdlOiB3ZWJwYWNrLkNvbXBpbGF0aW9uLlBST0NFU1NfQVNTRVRTX1NUQUdFX1JFUE9SVCB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgZmluYWxDb250ZW50ID0gY2hpbGRDb21waWxhdGlvbi5hc3NldHNbb3V0cHV0RmlsZVBhdGhdPy5zb3VyY2UoKS50b1N0cmluZygpO1xuXG4gICAgICAgICAgZm9yIChjb25zdCB7IGZpbGVzIH0gb2YgY2hpbGRDb21waWxhdGlvbi5jaHVua3MpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgICAgICAgICBjaGlsZENvbXBpbGF0aW9uLmRlbGV0ZUFzc2V0KGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2U8Q29tcGlsYXRpb25PdXRwdXQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNoaWxkQ29tcGlsZXIucnVuQXNDaGlsZCgoZXJyb3IsIF8sIGNoaWxkQ29tcGlsYXRpb24pID0+IHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmICghY2hpbGRDb21waWxhdGlvbikge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1Vua25vd24gY2hpbGQgY29tcGlsYXRpb24gZXJyb3InKSk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXb3JrYXJvdW5kIHRvIGF0dGVtcHQgdG8gcmVkdWNlIG1lbW9yeSB1c2FnZSBvZiBjaGlsZCBjb21waWxhdGlvbnMuXG4gICAgICAgIC8vIFRoaXMgcmVtb3ZlcyB0aGUgY2hpbGQgY29tcGlsYXRpb24gZnJvbSB0aGUgbWFpbiBjb21waWxhdGlvbiBhbmQgbWFudWFsbHkgcHJvcGFnYXRlc1xuICAgICAgICAvLyBhbGwgZGVwZW5kZW5jaWVzLCB3YXJuaW5ncywgYW5kIGVycm9ycy5cbiAgICAgICAgY29uc3QgcGFyZW50ID0gY2hpbGRDb21waWxlci5wYXJlbnRDb21waWxhdGlvbjtcbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgIHBhcmVudC5jaGlsZHJlbiA9IHBhcmVudC5jaGlsZHJlbi5maWx0ZXIoKGNoaWxkKSA9PiBjaGlsZCAhPT0gY2hpbGRDb21waWxhdGlvbik7XG4gICAgICAgICAgbGV0IGZpbGVEZXBlbmRlbmNpZXM6IFNldDxzdHJpbmc+IHwgdW5kZWZpbmVkO1xuXG4gICAgICAgICAgZm9yIChjb25zdCBkZXBlbmRlbmN5IG9mIGNoaWxkQ29tcGlsYXRpb24uZmlsZURlcGVuZGVuY2llcykge1xuICAgICAgICAgICAgLy8gU2tpcCBwYXRocyB0aGF0IGRvIG5vdCBhcHBlYXIgdG8gYmUgZmlsZXMgKGhhdmUgbm8gZXh0ZW5zaW9uKS5cbiAgICAgICAgICAgIC8vIGBmaWxlRGVwZW5kZW5jaWVzYCBjYW4gY29udGFpbiBkaXJlY3RvcmllcyBhbmQgbm90IGp1c3QgZmlsZXMgd2hpY2ggY2FuXG4gICAgICAgICAgICAvLyBjYXVzZSBpbmNvcnJlY3QgY2FjaGUgaW52YWxpZGF0aW9uIG9uIHJlYnVpbGRzLlxuICAgICAgICAgICAgaWYgKCFwYXRoLmV4dG5hbWUoZGVwZW5kZW5jeSkpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkYXRhICYmIGNvbnRhaW5pbmdGaWxlICYmIGRlcGVuZGVuY3kuZW5kc1dpdGgoZW50cnkpKSB7XG4gICAgICAgICAgICAgIC8vIHVzZSBjb250YWluaW5nIGZpbGUgaWYgdGhlIHJlc291cmNlIHdhcyBpbmxpbmVcbiAgICAgICAgICAgICAgcGFyZW50LmZpbGVEZXBlbmRlbmNpZXMuYWRkKGNvbnRhaW5pbmdGaWxlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBhcmVudC5maWxlRGVwZW5kZW5jaWVzLmFkZChkZXBlbmRlbmN5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU2F2ZSB0aGUgZGVwZW5kZW5jaWVzIGZvciB0aGlzIHJlc291cmNlLlxuICAgICAgICAgICAgaWYgKGZpbGVQYXRoKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHJlc29sdmVkRmlsZSA9IG5vcm1hbGl6ZVBhdGgoZGVwZW5kZW5jeSk7XG4gICAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5fcmV2ZXJzZURlcGVuZGVuY2llcy5nZXQocmVzb2x2ZWRGaWxlKTtcbiAgICAgICAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgZW50cnkuYWRkKGZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXZlcnNlRGVwZW5kZW5jaWVzLnNldChyZXNvbHZlZEZpbGUsIG5ldyBTZXQoW2ZpbGVQYXRoXSkpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKGZpbGVEZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgICAgICAgICBmaWxlRGVwZW5kZW5jaWVzLmFkZChkZXBlbmRlbmN5KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaWxlRGVwZW5kZW5jaWVzID0gbmV3IFNldChbZGVwZW5kZW5jeV0pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZpbGVEZXBlbmRlbmNpZXMuc2V0KGZpbGVQYXRoLCBmaWxlRGVwZW5kZW5jaWVzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHBhcmVudC5jb250ZXh0RGVwZW5kZW5jaWVzLmFkZEFsbChjaGlsZENvbXBpbGF0aW9uLmNvbnRleHREZXBlbmRlbmNpZXMpO1xuICAgICAgICAgIHBhcmVudC5taXNzaW5nRGVwZW5kZW5jaWVzLmFkZEFsbChjaGlsZENvbXBpbGF0aW9uLm1pc3NpbmdEZXBlbmRlbmNpZXMpO1xuICAgICAgICAgIHBhcmVudC5idWlsZERlcGVuZGVuY2llcy5hZGRBbGwoY2hpbGRDb21waWxhdGlvbi5idWlsZERlcGVuZGVuY2llcyk7XG5cbiAgICAgICAgICBwYXJlbnQud2FybmluZ3MucHVzaCguLi5jaGlsZENvbXBpbGF0aW9uLndhcm5pbmdzKTtcbiAgICAgICAgICBwYXJlbnQuZXJyb3JzLnB1c2goLi4uY2hpbGRDb21waWxhdGlvbi5lcnJvcnMpO1xuXG4gICAgICAgICAgaWYgKHRoaXMuYXNzZXRDYWNoZSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IGluZm8sIG5hbWUsIHNvdXJjZSB9IG9mIGNoaWxkQ29tcGlsYXRpb24uZ2V0QXNzZXRzKCkpIHtcbiAgICAgICAgICAgICAgLy8gVXNlIHRoZSBvcmlnaW5hdGluZyBmaWxlIGFzIHRoZSBjYWNoZSBrZXkgaWYgcHJlc2VudFxuICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIGdlbmVyYXRlIGEgY2FjaGUga2V5IGJhc2VkIG9uIHRoZSBnZW5lcmF0ZWQgbmFtZVxuICAgICAgICAgICAgICBjb25zdCBjYWNoZUtleSA9IGluZm8uc291cmNlRmlsZW5hbWUgPz8gYCEhW0dFTkVSQVRFRF06JHtuYW1lfWA7XG5cbiAgICAgICAgICAgICAgdGhpcy5hc3NldENhY2hlLnNldChjYWNoZUtleSwgeyBpbmZvLCBuYW1lLCBzb3VyY2UgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgY29udGVudDogZmluYWxDb250ZW50ID8/ICcnLFxuICAgICAgICAgIHN1Y2Nlc3M6IGNoaWxkQ29tcGlsYXRpb24uZXJyb3JzPy5sZW5ndGggPT09IDAsXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9ldmFsdWF0ZShmaWxlbmFtZTogc3RyaW5nLCBzb3VyY2U6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAgIC8vIEV2YWx1YXRlIGNvZGVcblxuICAgIC8vIGNzcy1sb2FkZXIgcmVxdWlyZXMgdGhlIGJ0b2EgZnVuY3Rpb24gdG8gZXhpc3QgdG8gY29ycmVjdGx5IGdlbmVyYXRlIGlubGluZSBzb3VyY2VtYXBzXG4gICAgY29uc3QgY29udGV4dDogeyBidG9hOiAoaW5wdXQ6IHN0cmluZykgPT4gc3RyaW5nOyByZXNvdXJjZT86IHN0cmluZyB8IHsgZGVmYXVsdD86IHN0cmluZyB9IH0gPSB7XG4gICAgICBidG9hKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBCdWZmZXIuZnJvbShpbnB1dCkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICAgICAgfSxcbiAgICB9O1xuXG4gICAgdHJ5IHtcbiAgICAgIHZtLnJ1bkluTmV3Q29udGV4dChzb3VyY2UsIGNvbnRleHQsIHsgZmlsZW5hbWUgfSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBFcnJvciBhcmUgcHJvcGFnYXRlZCB0aHJvdWdoIHRoZSBjaGlsZCBjb21waWxhdGlvbi5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY29udGV4dC5yZXNvdXJjZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBjb250ZXh0LnJlc291cmNlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbnRleHQucmVzb3VyY2U/LmRlZmF1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gY29udGV4dC5yZXNvdXJjZS5kZWZhdWx0O1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGxvYWRlciBcIiR7ZmlsZW5hbWV9XCIgZGlkbid0IHJldHVybiBhIHN0cmluZy5gKTtcbiAgfVxuXG4gIGFzeW5jIGdldChmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBub3JtYWxpemVkRmlsZSA9IG5vcm1hbGl6ZVBhdGgoZmlsZVBhdGgpO1xuICAgIGxldCBjb21waWxhdGlvblJlc3VsdCA9IHRoaXMuZmlsZUNhY2hlPy5nZXQobm9ybWFsaXplZEZpbGUpO1xuXG4gICAgaWYgKGNvbXBpbGF0aW9uUmVzdWx0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIGNhY2hlIG1pc3Mgc28gY29tcGlsZSByZXNvdXJjZVxuICAgICAgY29tcGlsYXRpb25SZXN1bHQgPSBhd2FpdCB0aGlzLl9jb21waWxlKGZpbGVQYXRoKTtcblxuICAgICAgLy8gT25seSBjYWNoZSBpZiBjb21waWxhdGlvbiB3YXMgc3VjY2Vzc2Z1bFxuICAgICAgaWYgKHRoaXMuZmlsZUNhY2hlICYmIGNvbXBpbGF0aW9uUmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgdGhpcy5maWxlQ2FjaGUuc2V0KG5vcm1hbGl6ZWRGaWxlLCBjb21waWxhdGlvblJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbXBpbGF0aW9uUmVzdWx0LmNvbnRlbnQ7XG4gIH1cblxuICBhc3luYyBwcm9jZXNzKFxuICAgIGRhdGE6IHN0cmluZyxcbiAgICBmaWxlRXh0ZW5zaW9uOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcmVzb3VyY2VUeXBlOiAndGVtcGxhdGUnIHwgJ3N0eWxlJyxcbiAgICBjb250YWluaW5nRmlsZT86IHN0cmluZyxcbiAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBpZiAoZGF0YS50cmltKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgY29uc3QgY29tcGlsYXRpb25SZXN1bHQgPSBhd2FpdCB0aGlzLl9jb21waWxlKFxuICAgICAgdW5kZWZpbmVkLFxuICAgICAgZGF0YSxcbiAgICAgIGZpbGVFeHRlbnNpb24sXG4gICAgICByZXNvdXJjZVR5cGUsXG4gICAgICBjb250YWluaW5nRmlsZSxcbiAgICApO1xuXG4gICAgcmV0dXJuIGNvbXBpbGF0aW9uUmVzdWx0LmNvbnRlbnQ7XG4gIH1cbn1cbiJdfQ==