"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.webpackStatsLogger = exports.createWebpackLoggingCallback = exports.statsHasWarnings = exports.statsHasErrors = exports.statsErrorsToString = exports.statsWarningsToString = exports.IGNORE_WARNINGS = exports.generateBundleStats = exports.formatSize = void 0;
const core_1 = require("@angular-devkit/core");
const path = require("path");
const textTable = require("text-table");
const color_1 = require("../../utils/color");
const stats_1 = require("../configs/stats");
function formatSize(size) {
    if (size <= 0) {
        return '0 bytes';
    }
    const abbreviations = ['bytes', 'kB', 'MB', 'GB'];
    const index = Math.floor(Math.log(size) / Math.log(1024));
    const roundedSize = size / Math.pow(1024, index);
    // bytes don't have a fraction
    const fractionDigits = index === 0 ? 0 : 2;
    return `${roundedSize.toFixed(fractionDigits)} ${abbreviations[index]}`;
}
exports.formatSize = formatSize;
function generateBundleStats(info) {
    var _a, _b, _c;
    const size = typeof info.size === 'number' ? info.size : '-';
    const files = (_b = (_a = info.files) === null || _a === void 0 ? void 0 : _a.filter((f) => !f.endsWith('.map')).map((f) => path.basename(f)).join(', ')) !== null && _b !== void 0 ? _b : '';
    const names = ((_c = info.names) === null || _c === void 0 ? void 0 : _c.length) ? info.names.join(', ') : '-';
    const initial = !!(info.entry || info.initial);
    const chunkType = info.chunkType || 'unknown';
    return {
        chunkType,
        initial,
        stats: [files, names, size],
    };
}
exports.generateBundleStats = generateBundleStats;
function generateBuildStatsTable(data, colors, showTotalSize) {
    const g = (x) => (colors ? color_1.colors.greenBright(x) : x);
    const c = (x) => (colors ? color_1.colors.cyanBright(x) : x);
    const bold = (x) => (colors ? color_1.colors.bold(x) : x);
    const dim = (x) => (colors ? color_1.colors.dim(x) : x);
    const changedEntryChunksStats = [];
    const changedLazyChunksStats = [];
    let initialModernTotalSize = 0;
    let initialLegacyTotalSize = 0;
    let modernFileSuffix;
    for (const { initial, stats, chunkType } of data) {
        const [files, names, size] = stats;
        const data = [
            g(files),
            names,
            c(typeof size === 'number' ? formatSize(size) : size),
        ];
        if (initial) {
            changedEntryChunksStats.push(data);
            if (typeof size === 'number') {
                switch (chunkType) {
                    case 'modern':
                        initialModernTotalSize += size;
                        if (!modernFileSuffix) {
                            const match = files.match(/-(es20\d{2}|esnext)/);
                            modernFileSuffix = match === null || match === void 0 ? void 0 : match[1].toString().toUpperCase();
                        }
                        break;
                    case 'legacy':
                        initialLegacyTotalSize += size;
                        break;
                    default:
                        initialModernTotalSize += size;
                        initialLegacyTotalSize += size;
                        break;
                }
            }
        }
        else {
            changedLazyChunksStats.push(data);
        }
    }
    const bundleInfo = [];
    // Entry chunks
    if (changedEntryChunksStats.length) {
        bundleInfo.push(['Initial Chunk Files', 'Names', 'Size'].map(bold), ...changedEntryChunksStats);
        if (showTotalSize) {
            bundleInfo.push([]);
            if (initialModernTotalSize === initialLegacyTotalSize) {
                bundleInfo.push([' ', 'Initial Total', formatSize(initialModernTotalSize)].map(bold));
            }
            else {
                bundleInfo.push([' ', 'Initial ES5 Total', formatSize(initialLegacyTotalSize)].map(bold), [' ', `Initial ${modernFileSuffix} Total`, formatSize(initialModernTotalSize)].map(bold));
            }
        }
    }
    // Seperator
    if (changedEntryChunksStats.length && changedLazyChunksStats.length) {
        bundleInfo.push([]);
    }
    // Lazy chunks
    if (changedLazyChunksStats.length) {
        bundleInfo.push(['Lazy Chunk Files', 'Names', 'Size'].map(bold), ...changedLazyChunksStats);
    }
    return textTable(bundleInfo, {
        hsep: dim(' | '),
        stringLength: (s) => color_1.removeColor(s).length,
        align: ['l', 'l', 'r'],
    });
}
function generateBuildStats(hash, time, colors) {
    const w = (x) => (colors ? color_1.colors.bold.white(x) : x);
    return `Build at: ${w(new Date().toISOString())} - Hash: ${w(hash)} - Time: ${w('' + time)}ms`;
}
function statsToString(json, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
statsConfig, bundleState) {
    var _a, _b;
    if (!((_a = json.chunks) === null || _a === void 0 ? void 0 : _a.length)) {
        return '';
    }
    const colors = statsConfig.colors;
    const rs = (x) => (colors ? color_1.colors.reset(x) : x);
    const changedChunksStats = bundleState !== null && bundleState !== void 0 ? bundleState : [];
    let unchangedChunkNumber = 0;
    if (!(bundleState === null || bundleState === void 0 ? void 0 : bundleState.length)) {
        for (const chunk of json.chunks) {
            if (!chunk.rendered) {
                continue;
            }
            const assets = (_b = json.assets) === null || _b === void 0 ? void 0 : _b.filter((asset) => { var _a; return (_a = chunk.files) === null || _a === void 0 ? void 0 : _a.includes(asset.name); });
            const summedSize = assets === null || assets === void 0 ? void 0 : assets.filter((asset) => !asset.name.endsWith('.map')).reduce((total, asset) => total + asset.size, 0);
            changedChunksStats.push(generateBundleStats({ ...chunk, size: summedSize }));
        }
        unchangedChunkNumber = json.chunks.length - changedChunksStats.length;
    }
    // Sort chunks by size in descending order
    changedChunksStats.sort((a, b) => {
        if (a.stats[2] > b.stats[2]) {
            return -1;
        }
        if (a.stats[2] < b.stats[2]) {
            return 1;
        }
        return 0;
    });
    const statsTable = generateBuildStatsTable(changedChunksStats, colors, unchangedChunkNumber === 0);
    // In some cases we do things outside of webpack context
    // Such us index generation, service worker augmentation etc...
    // This will correct the time and include these.
    let time = 0;
    if (json.builtAt !== undefined && json.time !== undefined) {
        time = Date.now() - json.builtAt + json.time;
    }
    if (unchangedChunkNumber > 0) {
        return ('\n' +
            rs(core_1.tags.stripIndents `
      ${statsTable}

      ${unchangedChunkNumber} unchanged chunks

      ${generateBuildStats(json.hash || '', time, colors)}
      `));
    }
    else {
        return ('\n' +
            rs(core_1.tags.stripIndents `
      ${statsTable}

      ${generateBuildStats(json.hash || '', time, colors)}
      `));
    }
}
exports.IGNORE_WARNINGS = [
    // Webpack 5+ has no facility to disable this warning.
    // System.import is used in @angular/core for deprecated string-form lazy routes
    /System.import\(\) is deprecated and will be removed soon/i,
    // https://github.com/webpack-contrib/source-map-loader/blob/b2de4249c7431dd8432da607e08f0f65e9d64219/src/index.js#L83
    /Failed to parse source map from/,
];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function statsWarningsToString(json, statsConfig) {
    const colors = statsConfig.colors;
    const c = (x) => (colors ? color_1.colors.reset.cyan(x) : x);
    const y = (x) => (colors ? color_1.colors.reset.yellow(x) : x);
    const yb = (x) => (colors ? color_1.colors.reset.yellowBright(x) : x);
    const warnings = json.warnings ? [...json.warnings] : [];
    if (json.children) {
        warnings.push(...json.children.map((c) => { var _a; return (_a = c.warnings) !== null && _a !== void 0 ? _a : []; }).reduce((a, b) => [...a, ...b], []));
    }
    let output = '';
    for (const warning of warnings) {
        if (typeof warning === 'string') {
            output += yb(`Warning: ${warning}\n\n`);
        }
        else {
            const file = warning.file || warning.moduleName;
            if (file) {
                output += c(file);
                if (warning.loc) {
                    output += ':' + yb(warning.loc);
                }
                output += ' - ';
            }
            if (!/^warning/i.test(warning.message)) {
                output += y('Warning: ');
            }
            output += `${warning.message}\n\n`;
        }
    }
    return output ? '\n' + output : output;
}
exports.statsWarningsToString = statsWarningsToString;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function statsErrorsToString(json, statsConfig) {
    const colors = statsConfig.colors;
    const c = (x) => (colors ? color_1.colors.reset.cyan(x) : x);
    const yb = (x) => (colors ? color_1.colors.reset.yellowBright(x) : x);
    const r = (x) => (colors ? color_1.colors.reset.redBright(x) : x);
    const errors = json.errors ? [...json.errors] : [];
    if (json.children) {
        errors.push(...json.children.map((c) => (c === null || c === void 0 ? void 0 : c.errors) || []).reduce((a, b) => [...a, ...b], []));
    }
    let output = '';
    for (const error of errors) {
        if (typeof error === 'string') {
            output += r(`Error: ${error}\n\n`);
        }
        else {
            const file = error.file || error.moduleName;
            if (file) {
                output += c(file);
                if (error.loc) {
                    output += ':' + yb(error.loc);
                }
                output += ' - ';
            }
            if (!/^error/i.test(error.message)) {
                output += r('Error: ');
            }
            output += `${error.message}\n\n`;
        }
    }
    return output ? '\n' + output : output;
}
exports.statsErrorsToString = statsErrorsToString;
function statsHasErrors(json) {
    var _a, _b;
    return !!(((_a = json.errors) === null || _a === void 0 ? void 0 : _a.length) || ((_b = json.children) === null || _b === void 0 ? void 0 : _b.some((c) => { var _a; return (_a = c.errors) === null || _a === void 0 ? void 0 : _a.length; })));
}
exports.statsHasErrors = statsHasErrors;
function statsHasWarnings(json) {
    var _a, _b;
    return !!(((_a = json.warnings) === null || _a === void 0 ? void 0 : _a.length) || ((_b = json.children) === null || _b === void 0 ? void 0 : _b.some((c) => { var _a; return (_a = c.warnings) === null || _a === void 0 ? void 0 : _a.length; })));
}
exports.statsHasWarnings = statsHasWarnings;
function createWebpackLoggingCallback(verbose, logger) {
    return (stats, config) => {
        if (verbose) {
            logger.info(stats.toString(config.stats));
        }
        webpackStatsLogger(logger, stats.toJson(stats_1.getWebpackStatsConfig(false)), config);
    };
}
exports.createWebpackLoggingCallback = createWebpackLoggingCallback;
function webpackStatsLogger(logger, json, config, bundleStats) {
    logger.info(statsToString(json, config.stats, bundleStats));
    if (statsHasWarnings(json)) {
        logger.warn(statsWarningsToString(json, config.stats));
    }
    if (statsHasErrors(json)) {
        logger.error(statsErrorsToString(json, config.stats));
    }
}
exports.webpackStatsLogger = webpackStatsLogger;
