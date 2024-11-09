"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionResult = void 0;
const node_path_1 = require("node:path");
const utils_1 = require("./utils");
/**
 * Represents the result of a single builder execute call.
 */
class ExecutionResult {
    rebuildContexts;
    codeBundleCache;
    outputFiles = [];
    assetFiles = [];
    errors = [];
    prerenderedRoutes = [];
    warnings = [];
    logs = [];
    externalMetadata;
    constructor(rebuildContexts, codeBundleCache) {
        this.rebuildContexts = rebuildContexts;
        this.codeBundleCache = codeBundleCache;
    }
    addOutputFile(path, content, type) {
        this.outputFiles.push((0, utils_1.createOutputFileFromText)(path, content, type));
    }
    addAssets(assets) {
        this.assetFiles.push(...assets);
    }
    addLog(value) {
        this.logs.push(value);
    }
    addError(error) {
        if (typeof error === 'string') {
            this.errors.push({ text: error, location: null });
        }
        else {
            this.errors.push(error);
        }
    }
    addErrors(errors) {
        for (const error of errors) {
            this.addError(error);
        }
    }
    addPrerenderedRoutes(routes) {
        this.prerenderedRoutes.push(...routes);
        // Sort the prerendered routes.
        this.prerenderedRoutes.sort((a, b) => a.localeCompare(b));
    }
    addWarning(error) {
        if (typeof error === 'string') {
            this.warnings.push({ text: error, location: null });
        }
        else {
            this.warnings.push(error);
        }
    }
    addWarnings(errors) {
        for (const error of errors) {
            this.addWarning(error);
        }
    }
    /**
     * Add external JavaScript import metadata to the result. This is currently used
     * by the development server to optimize the prebundling process.
     * @param implicitBrowser External dependencies for the browser bundles due to the external packages option.
     * @param implicitServer External dependencies for the server bundles due to the external packages option.
     * @param explicit External dependencies due to explicit project configuration.
     */
    setExternalMetadata(implicitBrowser, implicitServer, explicit) {
        this.externalMetadata = { implicitBrowser, implicitServer, explicit: explicit ?? [] };
    }
    get output() {
        return {
            success: this.errors.length === 0,
        };
    }
    get outputWithFiles() {
        return {
            success: this.errors.length === 0,
            outputFiles: this.outputFiles,
            assetFiles: this.assetFiles,
            errors: this.errors,
            externalMetadata: this.externalMetadata,
        };
    }
    get watchFiles() {
        // Bundler contexts internally normalize file dependencies
        const files = this.rebuildContexts.flatMap((context) => [...context.watchFiles]);
        if (this.codeBundleCache?.referencedFiles) {
            // These files originate from TS/NG and can have POSIX path separators even on Windows.
            // To ensure path comparisons are valid, all these paths must be normalized.
            files.push(...this.codeBundleCache.referencedFiles.map(node_path_1.normalize));
        }
        if (this.codeBundleCache?.loadResultCache) {
            // Load result caches internally normalize file dependencies
            files.push(...this.codeBundleCache.loadResultCache.watchFiles);
        }
        return files;
    }
    createRebuildState(fileChanges) {
        this.codeBundleCache?.invalidate([...fileChanges.modified, ...fileChanges.removed]);
        return {
            rebuildContexts: this.rebuildContexts,
            codeBundleCache: this.codeBundleCache,
            fileChanges,
            previousOutputHashes: new Map(this.outputFiles.map((file) => [file.path, file.hash])),
        };
    }
    findChangedFiles(previousOutputHashes) {
        const changed = new Set();
        for (const file of this.outputFiles) {
            const previousHash = previousOutputHashes.get(file.path);
            if (previousHash === undefined || previousHash !== file.hash) {
                changed.add(file.path);
            }
        }
        return changed;
    }
    async dispose() {
        await Promise.allSettled(this.rebuildContexts.map((context) => context.dispose()));
    }
}
exports.ExecutionResult = ExecutionResult;
