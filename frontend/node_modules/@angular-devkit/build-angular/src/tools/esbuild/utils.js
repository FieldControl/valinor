"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMessages = exports.createJsonBuildManifest = exports.getSupportedNodeTargets = exports.transformSupportedBrowsersToTargets = exports.convertOutputFile = exports.createOutputFileFromData = exports.createOutputFileFromText = exports.emitFilesToDisk = exports.writeResultFiles = exports.getFeatureSupport = exports.withNoProgress = exports.withSpinner = exports.calculateEstimatedTransferSizes = exports.logBuildStats = void 0;
const esbuild_1 = require("esbuild");
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = require("node:path");
const node_url_1 = require("node:url");
const node_zlib_1 = require("node:zlib");
const semver_1 = require("semver");
const spinner_1 = require("../../utils/spinner");
const stats_1 = require("../webpack/utils/stats");
const bundler_context_1 = require("./bundler-context");
function logBuildStats(metafile, initial, budgetFailures, colors, changedFiles, estimatedTransferSizes, ssrOutputEnabled, verbose) {
    const browserStats = [];
    const serverStats = [];
    let unchangedCount = 0;
    for (const [file, output] of Object.entries(metafile.outputs)) {
        // Only display JavaScript and CSS files
        if (!/\.(?:css|m?js)$/.test(file)) {
            continue;
        }
        // Skip internal component resources
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (output['ng-component']) {
            continue;
        }
        // Show only changed files if a changed list is provided
        if (changedFiles && !changedFiles.has(file)) {
            ++unchangedCount;
            continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isPlatformServer = output['ng-platform-server'];
        if (isPlatformServer && !ssrOutputEnabled) {
            // Only log server build stats when SSR is enabled.
            continue;
        }
        let name = initial.get(file)?.name;
        if (name === undefined && output.entryPoint) {
            name = (0, node_path_1.basename)(output.entryPoint)
                .replace(/\.[cm]?[jt]s$/, '')
                .replace(/[\\/.]/g, '-');
        }
        const stat = {
            initial: initial.has(file),
            stats: [file, name ?? '-', output.bytes, estimatedTransferSizes?.get(file) ?? '-'],
        };
        if (isPlatformServer) {
            serverStats.push(stat);
        }
        else {
            browserStats.push(stat);
        }
    }
    if (browserStats.length > 0 || serverStats.length > 0) {
        const tableText = (0, stats_1.generateEsbuildBuildStatsTable)([browserStats, serverStats], colors, unchangedCount === 0, !!estimatedTransferSizes, budgetFailures, verbose);
        return tableText + '\n';
    }
    else if (changedFiles !== undefined) {
        return '\nNo output file changes.\n';
    }
    if (unchangedCount > 0) {
        return `Unchanged output files: ${unchangedCount}`;
    }
    return '';
}
exports.logBuildStats = logBuildStats;
async function calculateEstimatedTransferSizes(outputFiles) {
    const sizes = new Map();
    if (outputFiles.length <= 0) {
        return sizes;
    }
    return new Promise((resolve, reject) => {
        let completeCount = 0;
        for (const outputFile of outputFiles) {
            // Only calculate JavaScript and CSS files
            if (!outputFile.path.endsWith('.js') && !outputFile.path.endsWith('.css')) {
                ++completeCount;
                continue;
            }
            // Skip compressing small files which may end being larger once compressed and will most likely not be
            // compressed in actual transit.
            if (outputFile.contents.byteLength < 1024) {
                sizes.set(outputFile.path, outputFile.contents.byteLength);
                ++completeCount;
                continue;
            }
            // Directly use the async callback function to minimize the number of Promises that need to be created.
            (0, node_zlib_1.brotliCompress)(outputFile.contents, (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                sizes.set(outputFile.path, result.byteLength);
                if (++completeCount >= outputFiles.length) {
                    resolve(sizes);
                }
            });
        }
        // Covers the case where no files need to be compressed
        if (completeCount >= outputFiles.length) {
            resolve(sizes);
        }
    });
}
exports.calculateEstimatedTransferSizes = calculateEstimatedTransferSizes;
async function withSpinner(text, action) {
    const spinner = new spinner_1.Spinner(text);
    spinner.start();
    try {
        return await action();
    }
    finally {
        spinner.stop();
    }
}
exports.withSpinner = withSpinner;
async function withNoProgress(text, action) {
    return action();
}
exports.withNoProgress = withNoProgress;
/**
 * Generates a syntax feature object map for Angular applications based on a list of targets.
 * A full set of feature names can be found here: https://esbuild.github.io/api/#supported
 * @param target An array of browser/engine targets in the format accepted by the esbuild `target` option.
 * @returns An object that can be used with the esbuild build `supported` option.
 */
function getFeatureSupport(target) {
    const supported = {
        // Native async/await is not supported with Zone.js. Disabling support here will cause
        // esbuild to downlevel async/await, async generators, and for await...of to a Zone.js supported form.
        'async-await': false,
        // V8 currently has a performance defect involving object spread operations that can cause signficant
        // degradation in runtime performance. By not supporting the language feature here, a downlevel form
        // will be used instead which provides a workaround for the performance issue.
        // For more details: https://bugs.chromium.org/p/v8/issues/detail?id=11536
        'object-rest-spread': false,
    };
    // Detect Safari browser versions that have a class field behavior bug
    // See: https://github.com/angular/angular-cli/issues/24355#issuecomment-1333477033
    // See: https://github.com/WebKit/WebKit/commit/e8788a34b3d5f5b4edd7ff6450b80936bff396f2
    let safariClassFieldScopeBug = false;
    for (const browser of target) {
        let majorVersion;
        if (browser.startsWith('ios')) {
            majorVersion = Number(browser.slice(3, 5));
        }
        else if (browser.startsWith('safari')) {
            majorVersion = Number(browser.slice(6, 8));
        }
        else {
            continue;
        }
        // Technically, 14.0 is not broken but rather does not have support. However, the behavior
        // is identical since it would be set to false by esbuild if present as a target.
        if (majorVersion === 14 || majorVersion === 15) {
            safariClassFieldScopeBug = true;
            break;
        }
    }
    // If class field support cannot be used set to false; otherwise leave undefined to allow
    // esbuild to use `target` to determine support.
    if (safariClassFieldScopeBug) {
        supported['class-field'] = false;
        supported['class-static-field'] = false;
    }
    return supported;
}
exports.getFeatureSupport = getFeatureSupport;
async function writeResultFiles(outputFiles, assetFiles, { base, browser, server }) {
    const directoryExists = new Set();
    const ensureDirectoryExists = async (destPath) => {
        const basePath = (0, node_path_1.dirname)(destPath);
        if (!directoryExists.has(basePath)) {
            await promises_1.default.mkdir((0, node_path_1.join)(base, basePath), { recursive: true });
            directoryExists.add(basePath);
        }
    };
    // Writes the output file to disk and ensures the containing directories are present
    await emitFilesToDisk(outputFiles, async (file) => {
        let outputDir;
        switch (file.type) {
            case bundler_context_1.BuildOutputFileType.Browser:
            case bundler_context_1.BuildOutputFileType.Media:
                outputDir = browser;
                break;
            case bundler_context_1.BuildOutputFileType.Server:
                outputDir = server;
                break;
            case bundler_context_1.BuildOutputFileType.Root:
                outputDir = '';
                break;
            default:
                throw new Error(`Unhandled write for file "${file.path}" with type "${bundler_context_1.BuildOutputFileType[file.type]}".`);
        }
        const destPath = (0, node_path_1.join)(outputDir, file.path);
        // Ensure output subdirectories exist
        await ensureDirectoryExists(destPath);
        // Write file contents
        await promises_1.default.writeFile((0, node_path_1.join)(base, destPath), file.contents);
    });
    if (assetFiles?.length) {
        await emitFilesToDisk(assetFiles, async ({ source, destination }) => {
            const destPath = (0, node_path_1.join)(browser, destination);
            // Ensure output subdirectories exist
            await ensureDirectoryExists(destPath);
            // Copy file contents
            await promises_1.default.copyFile(source, (0, node_path_1.join)(base, destPath), node_fs_1.constants.COPYFILE_FICLONE);
        });
    }
}
exports.writeResultFiles = writeResultFiles;
const MAX_CONCURRENT_WRITES = 64;
async function emitFilesToDisk(files, writeFileCallback) {
    // Write files in groups of MAX_CONCURRENT_WRITES to avoid too many open files
    for (let fileIndex = 0; fileIndex < files.length;) {
        const groupMax = Math.min(fileIndex + MAX_CONCURRENT_WRITES, files.length);
        const actions = [];
        while (fileIndex < groupMax) {
            actions.push(writeFileCallback(files[fileIndex++]));
        }
        await Promise.all(actions);
    }
}
exports.emitFilesToDisk = emitFilesToDisk;
function createOutputFileFromText(path, text, type) {
    return {
        path,
        text,
        type,
        get hash() {
            return (0, node_crypto_1.createHash)('sha256').update(this.text).digest('hex');
        },
        get contents() {
            return Buffer.from(this.text, 'utf-8');
        },
        clone() {
            return createOutputFileFromText(this.path, this.text, this.type);
        },
    };
}
exports.createOutputFileFromText = createOutputFileFromText;
function createOutputFileFromData(path, data, type) {
    return {
        path,
        type,
        get text() {
            return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString('utf-8');
        },
        get hash() {
            return (0, node_crypto_1.createHash)('sha256').update(this.text).digest('hex');
        },
        get contents() {
            return data;
        },
        clone() {
            return createOutputFileFromData(this.path, this.contents, this.type);
        },
    };
}
exports.createOutputFileFromData = createOutputFileFromData;
function convertOutputFile(file, type) {
    const { path, contents, hash } = file;
    return {
        contents,
        hash,
        path,
        type,
        get text() {
            return Buffer.from(this.contents.buffer, this.contents.byteOffset, this.contents.byteLength).toString('utf-8');
        },
        clone() {
            return convertOutputFile(this, this.type);
        },
    };
}
exports.convertOutputFile = convertOutputFile;
/**
 * Transform browserlists result to esbuild target.
 * @see https://esbuild.github.io/api/#target
 */
function transformSupportedBrowsersToTargets(supportedBrowsers) {
    const transformed = [];
    // https://esbuild.github.io/api/#target
    const esBuildSupportedBrowsers = new Set([
        'chrome',
        'edge',
        'firefox',
        'ie',
        'ios',
        'node',
        'opera',
        'safari',
    ]);
    for (const browser of supportedBrowsers) {
        let [browserName, version] = browser.toLowerCase().split(' ');
        // browserslist uses the name `ios_saf` for iOS Safari whereas esbuild uses `ios`
        if (browserName === 'ios_saf') {
            browserName = 'ios';
        }
        // browserslist uses ranges `15.2-15.3` versions but only the lowest is required
        // to perform minimum supported feature checks. esbuild also expects a single version.
        [version] = version.split('-');
        if (esBuildSupportedBrowsers.has(browserName)) {
            if (browserName === 'safari' && version === 'tp') {
                // esbuild only supports numeric versions so `TP` is converted to a high number (999) since
                // a Technology Preview (TP) of Safari is assumed to support all currently known features.
                version = '999';
            }
            else if (!version.includes('.')) {
                // A lone major version is considered by esbuild to include all minor versions. However,
                // browserslist does not and is also inconsistent in its `.0` version naming. For example,
                // Safari 15.0 is named `safari 15` but Safari 16.0 is named `safari 16.0`.
                version += '.0';
            }
            transformed.push(browserName + version);
        }
    }
    return transformed;
}
exports.transformSupportedBrowsersToTargets = transformSupportedBrowsersToTargets;
const SUPPORTED_NODE_VERSIONS = '^18.13.0 || >=20.9.0';
/**
 * Transform supported Node.js versions to esbuild target.
 * @see https://esbuild.github.io/api/#target
 */
function getSupportedNodeTargets() {
    if (SUPPORTED_NODE_VERSIONS.charAt(0) === '0') {
        // Unlike `pkg_npm`, `ts_library` which is used to run unit tests does not support substitutions.
        return [];
    }
    return SUPPORTED_NODE_VERSIONS.split('||').map((v) => 'node' + (0, semver_1.coerce)(v)?.version);
}
exports.getSupportedNodeTargets = getSupportedNodeTargets;
async function createJsonBuildManifest(result, normalizedOptions) {
    const { colors: color, outputOptions: { base, server, browser }, ssrOptions, } = normalizedOptions;
    const { warnings, errors, prerenderedRoutes } = result;
    const manifest = {
        errors: errors.length ? await (0, esbuild_1.formatMessages)(errors, { kind: 'error', color }) : [],
        warnings: warnings.length ? await (0, esbuild_1.formatMessages)(warnings, { kind: 'warning', color }) : [],
        outputPaths: {
            root: (0, node_url_1.pathToFileURL)(base),
            browser: (0, node_url_1.pathToFileURL)((0, node_path_1.join)(base, browser)),
            server: ssrOptions ? (0, node_url_1.pathToFileURL)((0, node_path_1.join)(base, server)) : undefined,
        },
        prerenderedRoutes,
    };
    return JSON.stringify(manifest, undefined, 2);
}
exports.createJsonBuildManifest = createJsonBuildManifest;
async function logMessages(logger, executionResult, color, jsonLogs) {
    const { warnings, errors, logs } = executionResult;
    if (logs.length) {
        logger.info(logs.join('\n'));
    }
    if (jsonLogs) {
        return;
    }
    if (warnings.length) {
        logger.warn((await (0, esbuild_1.formatMessages)(warnings, { kind: 'warning', color })).join('\n'));
    }
    if (errors.length) {
        logger.error((await (0, esbuild_1.formatMessages)(errors, { kind: 'error', color })).join('\n'));
    }
}
exports.logMessages = logMessages;
