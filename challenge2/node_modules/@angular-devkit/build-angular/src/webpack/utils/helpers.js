"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetNameTemplateFactory = exports.getWatchOptions = exports.isPolyfillsEntry = exports.getEsVersionForFileName = exports.getSourceMapDevTool = exports.normalizeExtraEntryPoints = exports.getOutputHashFormat = void 0;
const core_1 = require("@angular-devkit/core");
const path = require("path");
const typescript_1 = require("typescript");
const webpack_1 = require("webpack");
function getOutputHashFormat(option, length = 20) {
    const hashFormats = {
        none: { chunk: '', extract: '', file: '', script: '' },
        media: { chunk: '', extract: '', file: `.[hash:${length}]`, script: '' },
        bundles: {
            chunk: `.[chunkhash:${length}]`,
            extract: `.[contenthash:${length}]`,
            file: '',
            script: `.[hash:${length}]`,
        },
        all: {
            chunk: `.[chunkhash:${length}]`,
            extract: `.[contenthash:${length}]`,
            file: `.[hash:${length}]`,
            script: `.[hash:${length}]`,
        },
    };
    return hashFormats[option] || hashFormats['none'];
}
exports.getOutputHashFormat = getOutputHashFormat;
function normalizeExtraEntryPoints(extraEntryPoints, defaultBundleName) {
    return extraEntryPoints.map((entry) => {
        if (typeof entry === 'string') {
            return { input: entry, inject: true, bundleName: defaultBundleName };
        }
        const { inject = true, ...newEntry } = entry;
        let bundleName;
        if (entry.bundleName) {
            bundleName = entry.bundleName;
        }
        else if (!inject) {
            // Lazy entry points use the file name as bundle name.
            bundleName = core_1.basename(core_1.normalize(entry.input.replace(/\.(js|css|scss|sass|less|styl)$/i, '')));
        }
        else {
            bundleName = defaultBundleName;
        }
        return { ...newEntry, inject, bundleName };
    });
}
exports.normalizeExtraEntryPoints = normalizeExtraEntryPoints;
function getSourceMapDevTool(scriptsSourceMap, stylesSourceMap, hiddenSourceMap = false, inlineSourceMap = false) {
    const include = [];
    if (scriptsSourceMap) {
        include.push(/js$/);
    }
    if (stylesSourceMap) {
        include.push(/css$/);
    }
    return new webpack_1.SourceMapDevToolPlugin({
        filename: inlineSourceMap ? undefined : '[file].map',
        include,
        // We want to set sourceRoot to  `webpack:///` for non
        // inline sourcemaps as otherwise paths to sourcemaps will be broken in browser
        // `webpack:///` is needed for Visual Studio breakpoints to work properly as currently
        // there is no way to set the 'webRoot'
        sourceRoot: 'webpack:///',
        moduleFilenameTemplate: '[resource-path]',
        append: hiddenSourceMap ? false : undefined,
    });
}
exports.getSourceMapDevTool = getSourceMapDevTool;
/**
 * Returns an ES version file suffix to differentiate between various builds.
 */
function getEsVersionForFileName(scriptTarget, esVersionInFileName = false) {
    if (!esVersionInFileName || scriptTarget === undefined) {
        return '';
    }
    if (scriptTarget === typescript_1.ScriptTarget.ESNext) {
        return '-esnext';
    }
    return '-' + typescript_1.ScriptTarget[scriptTarget].toLowerCase();
}
exports.getEsVersionForFileName = getEsVersionForFileName;
function isPolyfillsEntry(name) {
    return name === 'polyfills' || name === 'polyfills-es5';
}
exports.isPolyfillsEntry = isPolyfillsEntry;
function getWatchOptions(poll) {
    return {
        poll,
        ignored: poll === undefined ? '**/$_lazy_route_resources' : 'node_modules/**',
    };
}
exports.getWatchOptions = getWatchOptions;
function assetNameTemplateFactory(hashFormat) {
    const visitedFiles = new Map();
    return (resourcePath) => {
        if (hashFormat.file) {
            // File names are hashed therefore we don't need to handle files with the same file name.
            return `[name]${hashFormat.file}.[ext]`;
        }
        const filename = path.basename(resourcePath);
        // Check if the file with the same name has already been processed.
        const visited = visitedFiles.get(filename);
        if (!visited) {
            // Not visited.
            visitedFiles.set(filename, resourcePath);
            return filename;
        }
        else if (visited === resourcePath) {
            // Same file.
            return filename;
        }
        // File has the same name but it's in a different location.
        return '[path][name].[ext]';
    };
}
exports.assetNameTemplateFactory = assetNameTemplateFactory;
