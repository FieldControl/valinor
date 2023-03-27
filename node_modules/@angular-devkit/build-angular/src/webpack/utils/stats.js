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
exports.webpackStatsLogger = exports.generateBuildEventStats = exports.createWebpackLoggingCallback = exports.statsHasWarnings = exports.statsHasErrors = exports.statsErrorsToString = exports.statsWarningsToString = exports.formatSize = void 0;
const core_1 = require("@angular-devkit/core");
const assert_1 = __importDefault(require("assert"));
const path = __importStar(require("path"));
const text_table_1 = __importDefault(require("text-table"));
const utils_1 = require("../../utils");
const color_1 = require("../../utils/color");
const async_chunks_1 = require("./async-chunks");
const helpers_1 = require("./helpers");
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
function getBuildDuration(webpackStats) {
    (0, assert_1.default)(webpackStats.builtAt, 'buildAt cannot be undefined');
    (0, assert_1.default)(webpackStats.time, 'time cannot be undefined');
    return Date.now() - webpackStats.builtAt + webpackStats.time;
}
function generateBundleStats(info) {
    var _a, _b, _c;
    const rawSize = typeof info.rawSize === 'number' ? info.rawSize : '-';
    const estimatedTransferSize = typeof info.estimatedTransferSize === 'number' ? info.estimatedTransferSize : '-';
    const files = (_b = (_a = info.files) === null || _a === void 0 ? void 0 : _a.filter((f) => !f.endsWith('.map')).map((f) => path.basename(f)).join(', ')) !== null && _b !== void 0 ? _b : '';
    const names = ((_c = info.names) === null || _c === void 0 ? void 0 : _c.length) ? info.names.join(', ') : '-';
    const initial = !!info.initial;
    return {
        initial,
        stats: [files, names, rawSize, estimatedTransferSize],
    };
}
function generateBuildStatsTable(data, colors, showTotalSize, showEstimatedTransferSize, budgetFailures) {
    const g = (x) => (colors ? color_1.colors.greenBright(x) : x);
    const c = (x) => (colors ? color_1.colors.cyanBright(x) : x);
    const r = (x) => (colors ? color_1.colors.redBright(x) : x);
    const y = (x) => (colors ? color_1.colors.yellowBright(x) : x);
    const bold = (x) => (colors ? color_1.colors.bold(x) : x);
    const dim = (x) => (colors ? color_1.colors.dim(x) : x);
    const getSizeColor = (name, file, defaultColor = c) => {
        const severity = budgets.get(name) || (file && budgets.get(file));
        switch (severity) {
            case 'warning':
                return y;
            case 'error':
                return r;
            default:
                return defaultColor;
        }
    };
    const changedEntryChunksStats = [];
    const changedLazyChunksStats = [];
    let initialTotalRawSize = 0;
    let initialTotalEstimatedTransferSize;
    const budgets = new Map();
    if (budgetFailures) {
        for (const { label, severity } of budgetFailures) {
            // In some cases a file can have multiple budget failures.
            // Favor error.
            if (label && (!budgets.has(label) || budgets.get(label) === 'warning')) {
                budgets.set(label, severity);
            }
        }
    }
    for (const { initial, stats } of data) {
        const [files, names, rawSize, estimatedTransferSize] = stats;
        const getRawSizeColor = getSizeColor(names, files);
        let data;
        if (showEstimatedTransferSize) {
            data = [
                g(files),
                names,
                getRawSizeColor(typeof rawSize === 'number' ? formatSize(rawSize) : rawSize),
                c(typeof estimatedTransferSize === 'number'
                    ? formatSize(estimatedTransferSize)
                    : estimatedTransferSize),
            ];
        }
        else {
            data = [
                g(files),
                names,
                getRawSizeColor(typeof rawSize === 'number' ? formatSize(rawSize) : rawSize),
                '',
            ];
        }
        if (initial) {
            changedEntryChunksStats.push(data);
            if (typeof rawSize === 'number') {
                initialTotalRawSize += rawSize;
            }
            if (showEstimatedTransferSize && typeof estimatedTransferSize === 'number') {
                if (initialTotalEstimatedTransferSize === undefined) {
                    initialTotalEstimatedTransferSize = 0;
                }
                initialTotalEstimatedTransferSize += estimatedTransferSize;
            }
        }
        else {
            changedLazyChunksStats.push(data);
        }
    }
    const bundleInfo = [];
    const baseTitles = ['Names', 'Raw Size'];
    const tableAlign = ['l', 'l', 'r'];
    if (showEstimatedTransferSize) {
        baseTitles.push('Estimated Transfer Size');
        tableAlign.push('r');
    }
    // Entry chunks
    if (changedEntryChunksStats.length) {
        bundleInfo.push(['Initial Chunk Files', ...baseTitles].map(bold), ...changedEntryChunksStats);
        if (showTotalSize) {
            bundleInfo.push([]);
            const initialSizeTotalColor = getSizeColor('bundle initial', undefined, (x) => x);
            const totalSizeElements = [
                ' ',
                'Initial Total',
                initialSizeTotalColor(formatSize(initialTotalRawSize)),
            ];
            if (showEstimatedTransferSize) {
                totalSizeElements.push(typeof initialTotalEstimatedTransferSize === 'number'
                    ? formatSize(initialTotalEstimatedTransferSize)
                    : '-');
            }
            bundleInfo.push(totalSizeElements.map(bold));
        }
    }
    // Seperator
    if (changedEntryChunksStats.length && changedLazyChunksStats.length) {
        bundleInfo.push([]);
    }
    // Lazy chunks
    if (changedLazyChunksStats.length) {
        bundleInfo.push(['Lazy Chunk Files', ...baseTitles].map(bold), ...changedLazyChunksStats);
    }
    return (0, text_table_1.default)(bundleInfo, {
        hsep: dim(' | '),
        stringLength: (s) => (0, color_1.removeColor)(s).length,
        align: tableAlign,
    });
}
function generateBuildStats(hash, time, colors) {
    const w = (x) => (colors ? color_1.colors.bold.white(x) : x);
    return `Build at: ${w(new Date().toISOString())} - Hash: ${w(hash)} - Time: ${w('' + time)}ms`;
}
// We use this cache because we can have multiple builders running in the same process,
// where each builder has different output path.
// Ideally, we should create the logging callback as a factory, but that would need a refactoring.
const runsCache = new Set();
function statsToString(json, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
statsConfig, budgetFailures) {
    var _a, _b;
    if (!((_a = json.chunks) === null || _a === void 0 ? void 0 : _a.length)) {
        return '';
    }
    const colors = statsConfig.colors;
    const rs = (x) => (colors ? color_1.colors.reset(x) : x);
    const changedChunksStats = [];
    let unchangedChunkNumber = 0;
    let hasEstimatedTransferSizes = false;
    const isFirstRun = !runsCache.has(json.outputPath || '');
    for (const chunk of json.chunks) {
        // During first build we want to display unchanged chunks
        // but unchanged cached chunks are always marked as not rendered.
        if (!isFirstRun && !chunk.rendered) {
            continue;
        }
        const assets = (_b = json.assets) === null || _b === void 0 ? void 0 : _b.filter((asset) => { var _a; return (_a = chunk.files) === null || _a === void 0 ? void 0 : _a.includes(asset.name); });
        let rawSize = 0;
        let estimatedTransferSize;
        if (assets) {
            for (const asset of assets) {
                if (asset.name.endsWith('.map')) {
                    continue;
                }
                rawSize += asset.size;
                if (typeof asset.info.estimatedTransferSize === 'number') {
                    if (estimatedTransferSize === undefined) {
                        estimatedTransferSize = 0;
                        hasEstimatedTransferSizes = true;
                    }
                    estimatedTransferSize += asset.info.estimatedTransferSize;
                }
            }
        }
        changedChunksStats.push(generateBundleStats({ ...chunk, rawSize, estimatedTransferSize }));
    }
    unchangedChunkNumber = json.chunks.length - changedChunksStats.length;
    runsCache.add(json.outputPath || '');
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
    const statsTable = generateBuildStatsTable(changedChunksStats, colors, unchangedChunkNumber === 0, hasEstimatedTransferSizes, budgetFailures);
    // In some cases we do things outside of webpack context
    // Such us index generation, service worker augmentation etc...
    // This will correct the time and include these.
    const time = getBuildDuration(json);
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
            let file = warning.file || warning.moduleName;
            // Clean up warning paths
            // Ex: ./src/app/styles.scss.webpack[javascript/auto]!=!./node_modules/css-loader/dist/cjs.js....
            // to ./src/app/styles.scss.webpack
            if (file && !statsConfig.errorDetails) {
                const webpackPathIndex = file.indexOf('.webpack[');
                if (webpackPathIndex !== -1) {
                    file = file.substring(0, webpackPathIndex);
                }
            }
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
function statsErrorsToString(json, statsConfig) {
    var _a, _b;
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
            let file = error.file || error.moduleName;
            // Clean up error paths
            // Ex: ./src/app/styles.scss.webpack[javascript/auto]!=!./node_modules/css-loader/dist/cjs.js....
            // to ./src/app/styles.scss.webpack
            if (file && !statsConfig.errorDetails) {
                const webpackPathIndex = file.indexOf('.webpack[');
                if (webpackPathIndex !== -1) {
                    file = file.substring(0, webpackPathIndex);
                }
            }
            if (file) {
                output += c(file);
                if (error.loc) {
                    output += ':' + yb(error.loc);
                }
                output += ' - ';
            }
            // In most cases webpack will add stack traces to error messages.
            // This below cleans up the error from stacks.
            // See: https://github.com/webpack/webpack/issues/15980
            const message = statsConfig.errorStack
                ? error.message
                : (_b = (_a = /[\s\S]+?(?=\n+\s+at\s)/.exec(error.message)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : error.message;
            if (!/^error/i.test(message)) {
                output += r('Error: ');
            }
            output += `${message}\n\n`;
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
function createWebpackLoggingCallback(options, logger) {
    const { verbose = false, scripts = [], styles = [] } = options;
    const extraEntryPoints = [
        ...(0, helpers_1.normalizeExtraEntryPoints)(styles, 'styles'),
        ...(0, helpers_1.normalizeExtraEntryPoints)(scripts, 'scripts'),
    ];
    return (stats, config) => {
        if (verbose) {
            logger.info(stats.toString(config.stats));
        }
        const rawStats = stats.toJson((0, helpers_1.getStatsOptions)(false));
        const webpackStats = {
            ...rawStats,
            chunks: (0, async_chunks_1.markAsyncChunksNonInitial)(rawStats, extraEntryPoints),
        };
        webpackStatsLogger(logger, webpackStats, config);
    };
}
exports.createWebpackLoggingCallback = createWebpackLoggingCallback;
function generateBuildEventStats(webpackStats, browserBuilderOptions) {
    var _a, _b;
    const { chunks = [], assets = [] } = webpackStats;
    let jsSizeInBytes = 0;
    let cssSizeInBytes = 0;
    let initialChunksCount = 0;
    let ngComponentCount = 0;
    let changedChunksCount = 0;
    const allChunksCount = chunks.length;
    const isFirstRun = !runsCache.has(webpackStats.outputPath || '');
    const chunkFiles = new Set();
    for (const chunk of chunks) {
        if (!isFirstRun && chunk.rendered) {
            changedChunksCount++;
        }
        if (chunk.initial) {
            initialChunksCount++;
        }
        for (const file of (_a = chunk.files) !== null && _a !== void 0 ? _a : []) {
            chunkFiles.add(file);
        }
    }
    for (const asset of assets) {
        if (asset.name.endsWith('.map') || !chunkFiles.has(asset.name)) {
            continue;
        }
        if (asset.name.endsWith('.js')) {
            jsSizeInBytes += asset.size;
            ngComponentCount += (_b = asset.info.ngComponentCount) !== null && _b !== void 0 ? _b : 0;
        }
        else if (asset.name.endsWith('.css')) {
            cssSizeInBytes += asset.size;
        }
    }
    return {
        optimization: !!(0, utils_1.normalizeOptimization)(browserBuilderOptions.optimization).scripts,
        aot: browserBuilderOptions.aot !== false,
        allChunksCount,
        lazyChunksCount: allChunksCount - initialChunksCount,
        initialChunksCount,
        changedChunksCount,
        durationInMs: getBuildDuration(webpackStats),
        cssSizeInBytes,
        jsSizeInBytes,
        ngComponentCount,
    };
}
exports.generateBuildEventStats = generateBuildEventStats;
function webpackStatsLogger(logger, json, config, budgetFailures) {
    logger.info(statsToString(json, config.stats, budgetFailures));
    if (typeof config.stats !== 'object') {
        throw new Error('Invalid Webpack stats configuration.');
    }
    if (statsHasWarnings(json)) {
        logger.warn(statsWarningsToString(json, config.stats));
    }
    if (statsHasErrors(json)) {
        logger.error(statsErrorsToString(json, config.stats));
    }
}
exports.webpackStatsLogger = webpackStatsLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy93ZWJwYWNrL3V0aWxzL3N0YXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0gsK0NBQXFEO0FBQ3JELG9EQUE0QjtBQUM1QiwyQ0FBNkI7QUFDN0IsNERBQW1DO0FBR25DLHVDQUFvRDtBQUVwRCw2Q0FBc0U7QUFDdEUsaURBQTJEO0FBQzNELHVDQUE0RjtBQUU1RixTQUFnQixVQUFVLENBQUMsSUFBWTtJQUNyQyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUU7UUFDYixPQUFPLFNBQVMsQ0FBQztLQUNsQjtJQUVELE1BQU0sYUFBYSxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMxRCxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDakQsOEJBQThCO0lBQzlCLE1BQU0sY0FBYyxHQUFHLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTNDLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQzFFLENBQUM7QUFaRCxnQ0FZQztBQWFELFNBQVMsZ0JBQWdCLENBQUMsWUFBOEI7SUFDdEQs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Q0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGNBQVUsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGNBQVUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV0RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDbkQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQSxDQUFDLGFBQUQsQ0FBQyx1QkFBRCxDQUFDLENBQUUsTUFBTSxLQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzlGO0lBRUQsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO1FBQzFCLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQzdCLE1BQU0sSUFBSSxDQUFDLENBQUMsVUFBVSxLQUFLLE1BQU0sQ0FBQyxDQUFDO1NBQ3BDO2FBQU07WUFDTCxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFDMUMsdUJBQXVCO1lBQ3ZCLGlHQUFpRztZQUNqRyxtQ0FBbUM7WUFDbkMs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QUUsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUUvRCxJQUFJLE9BQU8sTUFBTSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0tBQ3pEO0lBRUQsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztLQUN4RDtJQUVELElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3hCLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ3ZEO0FBQ0gsQ0FBQztBQW5CRCxnREFtQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgV2VicGFja0xvZ2dpbmdDYWxsYmFjayB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC13ZWJwYWNrJztcbmltcG9ydCB7IGxvZ2dpbmcsIHRhZ3MgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHRleHRUYWJsZSBmcm9tICd0ZXh0LXRhYmxlJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb24sIFN0YXRzQ29tcGlsYXRpb24gfSBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB7IFNjaGVtYSBhcyBCcm93c2VyQnVpbGRlck9wdGlvbnMgfSBmcm9tICcuLi8uLi9idWlsZGVycy9icm93c2VyL3NjaGVtYSc7XG5pbXBvcnQgeyBub3JtYWxpemVPcHRpbWl6YXRpb24gfSBmcm9tICcuLi8uLi91dGlscyc7XG5pbXBvcnQgeyBCdWRnZXRDYWxjdWxhdG9yUmVzdWx0IH0gZnJvbSAnLi4vLi4vdXRpbHMvYnVuZGxlLWNhbGN1bGF0b3InO1xuaW1wb3J0IHsgY29sb3JzIGFzIGFuc2lDb2xvcnMsIHJlbW92ZUNvbG9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvY29sb3InO1xuaW1wb3J0IHsgbWFya0FzeW5jQ2h1bmtzTm9uSW5pdGlhbCB9IGZyb20gJy4vYXN5bmMtY2h1bmtzJztcbmltcG9ydCB7IFdlYnBhY2tTdGF0c09wdGlvbnMsIGdldFN0YXRzT3B0aW9ucywgbm9ybWFsaXplRXh0cmFFbnRyeVBvaW50cyB9IGZyb20gJy4vaGVscGVycyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRTaXplKHNpemU6IG51bWJlcik6IHN0cmluZyB7XG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gJzAgYnl0ZXMnO1xuICB9XG5cbiAgY29uc3QgYWJicmV2aWF0aW9ucyA9IFsnYnl0ZXMnLCAna0InLCAnTUInLCAnR0InXTtcbiAgY29uc3QgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgubG9nKHNpemUpIC8gTWF0aC5sb2coMTAyNCkpO1xuICBjb25zdCByb3VuZGVkU2l6ZSA9IHNpemUgLyBNYXRoLnBvdygxMDI0LCBpbmRleCk7XG4gIC8vIGJ5dGVzIGRvbid0IGhhdmUgYSBmcmFjdGlvblxuICBjb25zdCBmcmFjdGlvbkRpZ2l0cyA9IGluZGV4ID09PSAwID8gMCA6IDI7XG5cbiAgcmV0dXJuIGAke3JvdW5kZWRTaXplLnRvRml4ZWQoZnJhY3Rpb25EaWdpdHMpfSAke2FiYnJldmlhdGlvbnNbaW5kZXhdfWA7XG59XG5cbmV4cG9ydCB0eXBlIEJ1bmRsZVN0YXRzRGF0YSA9IFtcbiAgZmlsZXM6IHN0cmluZyxcbiAgbmFtZXM6IHN0cmluZyxcbiAgcmF3U2l6ZTogbnVtYmVyIHwgc3RyaW5nLFxuICBlc3RpbWF0ZWRUcmFuc2ZlclNpemU6IG51bWJlciB8IHN0cmluZyxcbl07XG5leHBvcnQgaW50ZXJmYWNlIEJ1bmRsZVN0YXRzIHtcbiAgaW5pdGlhbDogYm9vbGVhbjtcbiAgc3RhdHM6IEJ1bmRsZVN0YXRzRGF0YTtcbn1cblxuZnVuY3Rpb24gZ2V0QnVpbGREdXJhdGlvbih3ZWJwYWNrU3RhdHM6IFN0YXRzQ29tcGlsYXRpb24pOiBudW1iZXIge1xuICBhc3NlcnQod2VicGFja1N0YXRzLmJ1aWx0QXQsICdidWlsZEF0IGNhbm5vdCBiZSB1bmRlZmluZWQnKTtcbiAgYXNzZXJ0KHdlYnBhY2tTdGF0cy50aW1lLCAndGltZSBjYW5ub3QgYmUgdW5kZWZpbmVkJyk7XG5cbiAgcmV0dXJuIERhdGUubm93KCkgLSB3ZWJwYWNrU3RhdHMuYnVpbHRBdCArIHdlYnBhY2tTdGF0cy50aW1lO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUJ1bmRsZVN0YXRzKGluZm86IHtcbiAgcmF3U2l6ZT86IG51bWJlcjtcbiAgZXN0aW1hdGVkVHJhbnNmZXJTaXplPzogbnVtYmVyO1xuICBmaWxlcz86IHN0cmluZ1tdO1xuICBuYW1lcz86IHN0cmluZ1tdO1xuICBpbml0aWFsPzogYm9vbGVhbjtcbiAgcmVuZGVyZWQ/OiBib29sZWFuO1xufSk6IEJ1bmRsZVN0YXRzIHtcbiAgY29uc3QgcmF3U2l6ZSA9IHR5cGVvZiBpbmZvLnJhd1NpemUgPT09ICdudW1iZXInID8gaW5mby5yYXdTaXplIDogJy0nO1xuICBjb25zdCBlc3RpbWF0ZWRUcmFuc2ZlclNpemUgPVxuICAgIHR5cGVvZiBpbmZvLmVzdGltYXRlZFRyYW5zZmVyU2l6ZSA9PT0gJ251bWJlcicgPyBpbmZvLmVzdGltYXRlZFRyYW5zZmVyU2l6ZSA6ICctJztcbiAgY29uc3QgZmlsZXMgPVxuICAgIGluZm8uZmlsZXNcbiAgICAgID8uZmlsdGVyKChmKSA9PiAhZi5lbmRzV2l0aCgnLm1hcCcpKVxuICAgICAgLm1hcCgoZikgPT4gcGF0aC5iYXNlbmFtZShmKSlcbiAgICAgIC5qb2luKCcsICcpID8/ICcnO1xuICBjb25zdCBuYW1lcyA9IGluZm8ubmFtZXM/Lmxlbmd0aCA/IGluZm8ubmFtZXMuam9pbignLCAnKSA6ICctJztcbiAgY29uc3QgaW5pdGlhbCA9ICEhaW5mby5pbml0aWFsO1xuXG4gIHJldHVybiB7XG4gICAgaW5pdGlhbCxcbiAgICBzdGF0czogW2ZpbGVzLCBuYW1lcywgcmF3U2l6ZSwgZXN0aW1hdGVkVHJhbnNmZXJTaXplXSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVCdWlsZFN0YXRzVGFibGUoXG4gIGRhdGE6IEJ1bmRsZVN0YXRzW10sXG4gIGNvbG9yczogYm9vbGVhbixcbiAgc2hvd1RvdGFsU2l6ZTogYm9vbGVhbixcbiAgc2hvd0VzdGltYXRlZFRyYW5zZmVyU2l6ZTogYm9vbGVhbixcbiAgYnVkZ2V0RmFpbHVyZXM/OiBCdWRnZXRDYWxjdWxhdG9yUmVzdWx0W10sXG4pOiBzdHJpbmcge1xuICBjb25zdCBnID0gKHg6IHN0cmluZykgPT4gKGNvbG9ycyA/IGFuc2lDb2xvcnMuZ3JlZW5CcmlnaHQoeCkgOiB4KTtcbiAgY29uc3QgYyA9ICh4OiBzdHJpbmcpID0+IChjb2xvcnMgPyBhbnNpQ29sb3JzLmN5YW5CcmlnaHQoeCkgOiB4KTtcbiAgY29uc3QgciA9ICh4OiBzdHJpbmcpID0+IChjb2xvcnMgPyBhbnNpQ29sb3JzLnJlZEJyaWdodCh4KSA6IHgpO1xuICBjb25zdCB5ID0gKHg6IHN0cmluZykgPT4gKGNvbG9ycyA/IGFuc2lDb2xvcnMueWVsbG93QnJpZ2h0KHgpIDogeCk7XG4gIGNvbnN0IGJvbGQgPSAoeDogc3RyaW5nKSA9PiAoY29sb3JzID8gYW5zaUNvbG9ycy5ib2xkKHgpIDogeCk7XG4gIGNvbnN0IGRpbSA9ICh4OiBzdHJpbmcpID0+IChjb2xvcnMgPyBhbnNpQ29sb3JzLmRpbSh4KSA6IHgpO1xuXG4gIGNvbnN0IGdldFNpemVDb2xvciA9IChuYW1lOiBzdHJpbmcsIGZpbGU/OiBzdHJpbmcsIGRlZmF1bHRDb2xvciA9IGMpID0+IHtcbiAgICBjb25zdCBzZXZlcml0eSA9IGJ1ZGdldHMuZ2V0KG5hbWUpIHx8IChmaWxlICYmIGJ1ZGdldHMuZ2V0KGZpbGUpKTtcbiAgICBzd2l0Y2ggKHNldmVyaXR5KSB7XG4gICAgICBjYXNlICd3YXJuaW5nJzpcbiAgICAgICAgcmV0dXJuIHk7XG4gICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgIHJldHVybiByO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRDb2xvcjtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgY2hhbmdlZEVudHJ5Q2h1bmtzU3RhdHM6IEJ1bmRsZVN0YXRzRGF0YVtdID0gW107XG4gIGNvbnN0IGNoYW5nZWRMYXp5Q2h1bmtzU3RhdHM6IEJ1bmRsZVN0YXRzRGF0YVtdID0gW107XG5cbiAgbGV0IGluaXRpYWxUb3RhbFJhd1NpemUgPSAwO1xuICBsZXQgaW5pdGlhbFRvdGFsRXN0aW1hdGVkVHJhbnNmZXJTaXplO1xuXG4gIGNvbnN0IGJ1ZGdldHMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuICBpZiAoYnVkZ2V0RmFpbHVyZXMpIHtcbiAgICBmb3IgKGNvbnN0IHsgbGFiZWwsIHNldmVyaXR5IH0gb2YgYnVkZ2V0RmFpbHVyZXMpIHtcbiAgICAgIC8vIEluIHNvbWUgY2FzZXMgYSBmaWxlIGNhbiBoYXZlIG11bHRpcGxlIGJ1ZGdldCBmYWlsdXJlcy5cbiAgICAgIC8vIEZhdm9yIGVycm9yLlxuICAgICAgaWYgKGxhYmVsICYmICghYnVkZ2V0cy5oYXMobGFiZWwpIHx8IGJ1ZGdldHMuZ2V0KGxhYmVsKSA9PT0gJ3dhcm5pbmcnKSkge1xuICAgICAgICBidWRnZXRzLnNldChsYWJlbCwgc2V2ZXJpdHkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgeyBpbml0aWFsLCBzdGF0cyB9IG9mIGRhdGEpIHtcbiAgICBjb25zdCBbZmlsZXMsIG5hbWVzLCByYXdTaXplLCBlc3RpbWF0ZWRUcmFuc2ZlclNpemVdID0gc3RhdHM7XG4gICAgY29uc3QgZ2V0UmF3U2l6ZUNvbG9yID0gZ2V0U2l6ZUNvbG9yKG5hbWVzLCBmaWxlcyk7XG4gICAgbGV0IGRhdGE6IEJ1bmRsZVN0YXRzRGF0YTtcblxuICAgIGlmIChzaG93RXN0aW1hdGVkVHJhbnNmZXJTaXplKSB7XG4gICAgICBkYXRhID0gW1xuICAgICAgICBnKGZpbGVzKSxcbiAgICAgICAgbmFtZXMsXG4gICAgICAgIGdldFJhd1NpemVDb2xvcih0eXBlb2YgcmF3U2l6ZSA9PT0gJ251bWJlcicgPyBmb3JtYXRTaXplKHJhd1NpemUpIDogcmF3U2l6ZSksXG4gICAgICAgIGMoXG4gICAgICAgICAgdHlwZW9mIGVzdGltYXRlZFRyYW5zZmVyU2l6ZSA9PT0gJ251bWJlcidcbiAgICAgICAgICAgID8gZm9ybWF0U2l6ZShlc3RpbWF0ZWRUcmFuc2ZlclNpemUpXG4gICAgICAgICAgICA6IGVzdGltYXRlZFRyYW5zZmVyU2l6ZSxcbiAgICAgICAgKSxcbiAgICAgIF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGEgPSBbXG4gICAgICAgIGcoZmlsZXMpLFxuICAgICAgICBuYW1lcyxcbiAgICAgICAgZ2V0UmF3U2l6ZUNvbG9yKHR5cGVvZiByYXdTaXplID09PSAnbnVtYmVyJyA/IGZvcm1hdFNpemUocmF3U2l6ZSkgOiByYXdTaXplKSxcbiAgICAgICAgJycsXG4gICAgICBdO1xuICAgIH1cblxuICAgIGlmIChpbml0aWFsKSB7XG4gICAgICBjaGFuZ2VkRW50cnlDaHVua3NTdGF0cy5wdXNoKGRhdGEpO1xuICAgICAgaWYgKHR5cGVvZiByYXdTaXplID09PSAnbnVtYmVyJykge1xuICAgICAgICBpbml0aWFsVG90YWxSYXdTaXplICs9IHJhd1NpemU7XG4gICAgICB9XG4gICAgICBpZiAoc2hvd0VzdGltYXRlZFRyYW5zZmVyU2l6ZSAmJiB0eXBlb2YgZXN0aW1hdGVkVHJhbnNmZXJTaXplID09PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoaW5pdGlhbFRvdGFsRXN0aW1hdGVkVHJhbnNmZXJTaXplID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpbml0aWFsVG90YWxFc3RpbWF0ZWRUcmFuc2ZlclNpemUgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGluaXRpYWxUb3RhbEVzdGltYXRlZFRyYW5zZmVyU2l6ZSArPSBlc3RpbWF0ZWRUcmFuc2ZlclNpemU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoYW5nZWRMYXp5Q2h1bmtzU3RhdHMucHVzaChkYXRhKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBidW5kbGVJbmZvOiAoc3RyaW5nIHwgbnVtYmVyKVtdW10gPSBbXTtcbiAgY29uc3QgYmFzZVRpdGxlcyA9IFsnTmFtZXMnLCAnUmF3IFNpemUnXTtcbiAgY29uc3QgdGFibGVBbGlnbjogKCdsJyB8ICdyJylbXSA9IFsnbCcsICdsJywgJ3InXTtcblxuICBpZiAoc2hvd0VzdGltYXRlZFRyYW5zZmVyU2l6ZSkge1xuICAgIGJhc2VUaXRsZXMucHVzaCgnRXN0aW1hdGVkIFRyYW5zZmVyIFNpemUnKTtcbiAgICB0YWJsZUFsaWduLnB1c2goJ3InKTtcbiAgfVxuXG4gIC8vIEVudHJ5IGNodW5rc1xuICBpZiAoY2hhbmdlZEVudHJ5Q2h1bmtzU3RhdHMubGVuZ3RoKSB7XG4gICAgYnVuZGxlSW5mby5wdXNoKFsnSW5pdGlhbCBDaHVuayBGaWxlcycsIC4uLmJhc2VUaXRsZXNdLm1hcChib2xkKSwgLi4uY2hhbmdlZEVudHJ5Q2h1bmtzU3RhdHMpO1xuXG4gICAgaWYgKHNob3dUb3RhbFNpemUpIHtcbiAgICAgIGJ1bmRsZUluZm8ucHVzaChbXSk7XG5cbiAgICAgIGNvbnN0IGluaXRpYWxTaXplVG90YWxDb2xvciA9IGdldFNpemVDb2xvcignYnVuZGxlIGluaXRpYWwnLCB1bmRlZmluZWQsICh4KSA9PiB4KTtcbiAgICAgIGNvbnN0IHRvdGFsU2l6ZUVsZW1lbnRzID0gW1xuICAgICAgICAnICcsXG4gICAgICAgICdJbml0aWFsIFRvdGFsJyxcbiAgICAgICAgaW5pdGlhbFNpemVUb3RhbENvbG9yKGZvcm1hdFNpemUoaW5pdGlhbFRvdGFsUmF3U2l6ZSkpLFxuICAgICAgXTtcbiAgICAgIGlmIChzaG93RXN0aW1hdGVkVHJhbnNmZXJTaXplKSB7XG4gICAgICAgIHRvdGFsU2l6ZUVsZW1lbnRzLnB1c2goXG4gICAgICAgICAgdHlwZW9mIGluaXRpYWxUb3RhbEVzdGltYXRlZFRyYW5zZmVyU2l6ZSA9PT0gJ251bWJlcidcbiAgICAgICAgICAgID8gZm9ybWF0U2l6ZShpbml0aWFsVG90YWxFc3RpbWF0ZWRUcmFuc2ZlclNpemUpXG4gICAgICAgICAgICA6ICctJyxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGJ1bmRsZUluZm8ucHVzaCh0b3RhbFNpemVFbGVtZW50cy5tYXAoYm9sZCkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNlcGVyYXRvclxuICBpZiAoY2hhbmdlZEVudHJ5Q2h1bmtzU3RhdHMubGVuZ3RoICYmIGNoYW5nZWRMYXp5Q2h1bmtzU3RhdHMubGVuZ3RoKSB7XG4gICAgYnVuZGxlSW5mby5wdXNoKFtdKTtcbiAgfVxuXG4gIC8vIExhenkgY2h1bmtzXG4gIGlmIChjaGFuZ2VkTGF6eUNodW5rc1N0YXRzLmxlbmd0aCkge1xuICAgIGJ1bmRsZUluZm8ucHVzaChbJ0xhenkgQ2h1bmsgRmlsZXMnLCAuLi5iYXNlVGl0bGVzXS5tYXAoYm9sZCksIC4uLmNoYW5nZWRMYXp5Q2h1bmtzU3RhdHMpO1xuICB9XG5cbiAgcmV0dXJuIHRleHRUYWJsZShidW5kbGVJbmZvLCB7XG4gICAgaHNlcDogZGltKCcgfCAnKSxcbiAgICBzdHJpbmdMZW5ndGg6IChzKSA9PiByZW1vdmVDb2xvcihzKS5sZW5ndGgsXG4gICAgYWxpZ246IHRhYmxlQWxpZ24sXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUJ1aWxkU3RhdHMoaGFzaDogc3RyaW5nLCB0aW1lOiBudW1iZXIsIGNvbG9yczogYm9vbGVhbik6IHN0cmluZyB7XG4gIGNvbnN0IHcgPSAoeDogc3RyaW5nKSA9PiAoY29sb3JzID8gYW5zaUNvbG9ycy5ib2xkLndoaXRlKHgpIDogeCk7XG5cbiAgcmV0dXJuIGBCdWlsZCBhdDogJHt3KG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSl9IC0gSGFzaDogJHt3KGhhc2gpfSAtIFRpbWU6ICR7dygnJyArIHRpbWUpfW1zYDtcbn1cblxuLy8gV2UgdXNlIHRoaXMgY2FjaGUgYmVjYXVzZSB3ZSBjYW4gaGF2ZSBtdWx0aXBsZSBidWlsZGVycyBydW5uaW5nIGluIHRoZSBzYW1lIHByb2Nlc3MsXG4vLyB3aGVyZSBlYWNoIGJ1aWxkZXIgaGFzIGRpZmZlcmVudCBvdXRwdXQgcGF0aC5cblxuLy8gSWRlYWxseSwgd2Ugc2hvdWxkIGNyZWF0ZSB0aGUgbG9nZ2luZyBjYWxsYmFjayBhcyBhIGZhY3RvcnksIGJ1dCB0aGF0IHdvdWxkIG5lZWQgYSByZWZhY3RvcmluZy5cbmNvbnN0IHJ1bnNDYWNoZSA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG5mdW5jdGlvbiBzdGF0c1RvU3RyaW5nKFxuICBqc29uOiBTdGF0c0NvbXBpbGF0aW9uLFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBzdGF0c0NvbmZpZzogYW55LFxuICBidWRnZXRGYWlsdXJlcz86IEJ1ZGdldENhbGN1bGF0b3JSZXN1bHRbXSxcbik6IHN0cmluZyB7XG4gIGlmICghanNvbi5jaHVua3M/Lmxlbmd0aCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGNvbnN0IGNvbG9ycyA9IHN0YXRzQ29uZmlnLmNvbG9ycztcbiAgY29uc3QgcnMgPSAoeDogc3RyaW5nKSA9PiAoY29sb3JzID8gYW5zaUNvbG9ycy5yZXNldCh4KSA6IHgpO1xuXG4gIGNvbnN0IGNoYW5nZWRDaHVua3NTdGF0czogQnVuZGxlU3RhdHNbXSA9IFtdO1xuICBsZXQgdW5jaGFuZ2VkQ2h1bmtOdW1iZXIgPSAwO1xuICBsZXQgaGFzRXN0aW1hdGVkVHJhbnNmZXJTaXplcyA9IGZhbHNlO1xuXG4gIGNvbnN0IGlzRmlyc3RSdW4gPSAhcnVuc0NhY2hlLmhhcyhqc29uLm91dHB1dFBhdGggfHwgJycpO1xuXG4gIGZvciAoY29uc3QgY2h1bmsgb2YganNvbi5jaHVua3MpIHtcbiAgICAvLyBEdXJpbmcgZmlyc3QgYnVpbGQgd2Ugd2FudCB0byBkaXNwbGF5IHVuY2hhbmdlZCBjaHVua3NcbiAgICAvLyBidXQgdW5jaGFuZ2VkIGNhY2hlZCBjaHVua3MgYXJlIGFsd2F5cyBtYXJrZWQgYXMgbm90IHJlbmRlcmVkLlxuICAgIGlmICghaXNGaXJzdFJ1biAmJiAhY2h1bmsucmVuZGVyZWQpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGFzc2V0cyA9IGpzb24uYXNzZXRzPy5maWx0ZXIoKGFzc2V0KSA9PiBjaHVuay5maWxlcz8uaW5jbHVkZXMoYXNzZXQubmFtZSkpO1xuICAgIGxldCByYXdTaXplID0gMDtcbiAgICBsZXQgZXN0aW1hdGVkVHJhbnNmZXJTaXplO1xuICAgIGlmIChhc3NldHMpIHtcbiAgICAgIGZvciAoY29uc3QgYXNzZXQgb2YgYXNzZXRzKSB7XG4gICAgICAgIGlmIChhc3NldC5uYW1lLmVuZHNXaXRoKCcubWFwJykpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJhd1NpemUgKz0gYXNzZXQuc2l6ZTtcblxuICAgICAgICBpZiAodHlwZW9mIGFzc2V0LmluZm8uZXN0aW1hdGVkVHJhbnNmZXJTaXplID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGlmIChlc3RpbWF0ZWRUcmFuc2ZlclNpemUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZXN0aW1hdGVkVHJhbnNmZXJTaXplID0gMDtcbiAgICAgICAgICAgIGhhc0VzdGltYXRlZFRyYW5zZmVyU2l6ZXMgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlc3RpbWF0ZWRUcmFuc2ZlclNpemUgKz0gYXNzZXQuaW5mby5lc3RpbWF0ZWRUcmFuc2ZlclNpemU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY2hhbmdlZENodW5rc1N0YXRzLnB1c2goZ2VuZXJhdGVCdW5kbGVTdGF0cyh7IC4uLmNodW5rLCByYXdTaXplLCBlc3RpbWF0ZWRUcmFuc2ZlclNpemUgfSkpO1xuICB9XG4gIHVuY2hhbmdlZENodW5rTnVtYmVyID0ganNvbi5jaHVua3MubGVuZ3RoIC0gY2hhbmdlZENodW5rc1N0YXRzLmxlbmd0aDtcblxuICBydW5zQ2FjaGUuYWRkKGpzb24ub3V0cHV0UGF0aCB8fCAnJyk7XG5cbiAgLy8gU29ydCBjaHVua3MgYnkgc2l6ZSBpbiBkZXNjZW5kaW5nIG9yZGVyXG4gIGNoYW5nZWRDaHVua3NTdGF0cy5zb3J0KChhLCBiKSA9PiB7XG4gICAgaWYgKGEuc3RhdHNbMl0gPiBiLnN0YXRzWzJdKSB7XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgaWYgKGEuc3RhdHNbMl0gPCBiLnN0YXRzWzJdKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfSk7XG5cbiAgY29uc3Qgc3RhdHNUYWJsZSA9IGdlbmVyYXRlQnVpbGRTdGF0c1RhYmxlKFxuICAgIGNoYW5nZWRDaHVua3NTdGF0cyxcbiAgICBjb2xvcnMsXG4gICAgdW5jaGFuZ2VkQ2h1bmtOdW1iZXIgPT09IDAsXG4gICAgaGFzRXN0aW1hdGVkVHJhbnNmZXJTaXplcyxcbiAgICBidWRnZXRGYWlsdXJlcyxcbiAgKTtcblxuICAvLyBJbiBzb21lIGNhc2VzIHdlIGRvIHRoaW5ncyBvdXRzaWRlIG9mIHdlYnBhY2sgY29udGV4dFxuICAvLyBTdWNoIHVzIGluZGV4IGdlbmVyYXRpb24sIHNlcnZpY2Ugd29ya2VyIGF1Z21lbnRhdGlvbiBldGMuLi5cbiAgLy8gVGhpcyB3aWxsIGNvcnJlY3QgdGhlIHRpbWUgYW5kIGluY2x1ZGUgdGhlc2UuXG5cbiAgY29uc3QgdGltZSA9IGdldEJ1aWxkRHVyYXRpb24oanNvbik7XG5cbiAgaWYgKHVuY2hhbmdlZENodW5rTnVtYmVyID4gMCkge1xuICAgIHJldHVybiAoXG4gICAgICAnXFxuJyArXG4gICAgICBycyh0YWdzLnN0cmlwSW5kZW50c2BcbiAgICAgICR7c3RhdHNUYWJsZX1cblxuICAgICAgJHt1bmNoYW5nZWRDaHVua051bWJlcn0gdW5jaGFuZ2VkIGNodW5rc1xuXG4gICAgICAke2dlbmVyYXRlQnVpbGRTdGF0cyhqc29uLmhhc2ggfHwgJycsIHRpbWUsIGNvbG9ycyl9XG4gICAgICBgKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChcbiAgICAgICdcXG4nICtcbiAgICAgIHJzKHRhZ3Muc3RyaXBJbmRlbnRzYFxuICAgICAgJHtzdGF0c1RhYmxlfVxuXG4gICAgICAke2dlbmVyYXRlQnVpbGRTdGF0cyhqc29uLmhhc2ggfHwgJycsIHRpbWUsIGNvbG9ycyl9XG4gICAgICBgKVxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXRzV2FybmluZ3NUb1N0cmluZyhcbiAganNvbjogU3RhdHNDb21waWxhdGlvbixcbiAgc3RhdHNDb25maWc6IFdlYnBhY2tTdGF0c09wdGlvbnMsXG4pOiBzdHJpbmcge1xuICBjb25zdCBjb2xvcnMgPSBzdGF0c0NvbmZpZy5jb2xvcnM7XG4gIGNvbnN0IGMgPSAoeDogc3RyaW5nKSA9PiAoY29sb3JzID8gYW5zaUNvbG9ycy5yZXNldC5jeWFuKHgpIDogeCk7XG4gIGNvbnN0IHkgPSAoeDogc3RyaW5nKSA9PiAoY29sb3JzID8gYW5zaUNvbG9ycy5yZXNldC55ZWxsb3coeCkgOiB4KTtcbiAgY29uc3QgeWIgPSAoeDogc3RyaW5nKSA9PiAoY29sb3JzID8gYW5zaUNvbG9ycy5yZXNldC55ZWxsb3dCcmlnaHQoeCkgOiB4KTtcblxuICBjb25zdCB3YXJuaW5ncyA9IGpzb24ud2FybmluZ3MgPyBbLi4uanNvbi53YXJuaW5nc10gOiBbXTtcbiAgaWYgKGpzb24uY2hpbGRyZW4pIHtcbiAgICB3YXJuaW5ncy5wdXNoKC4uLmpzb24uY2hpbGRyZW4ubWFwKChjKSA9PiBjLndhcm5pbmdzID8/IFtdKS5yZWR1Y2UoKGEsIGIpID0+IFsuLi5hLCAuLi5iXSwgW10pKTtcbiAgfVxuXG4gIGxldCBvdXRwdXQgPSAnJztcbiAgZm9yIChjb25zdCB3YXJuaW5nIG9mIHdhcm5pbmdzKSB7XG4gICAgaWYgKHR5cGVvZiB3YXJuaW5nID09PSAnc3RyaW5nJykge1xuICAgICAgb3V0cHV0ICs9IHliKGBXYXJuaW5nOiAke3dhcm5pbmd9XFxuXFxuYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBmaWxlID0gd2FybmluZy5maWxlIHx8IHdhcm5pbmcubW9kdWxlTmFtZTtcbiAgICAgIC8vIENsZWFuIHVwIHdhcm5pbmcgcGF0aHNcbiAgICAgIC8vIEV4OiAuL3NyYy9hcHAvc3R5bGVzLnNjc3Mud2VicGFja1tqYXZhc2NyaXB0L2F1dG9dIT0hLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcy4uLi5cbiAgICAgIC8vIHRvIC4vc3JjL2FwcC9zdHlsZXMuc2Nzcy53ZWJwYWNrXG4gICAgICBpZiAoZmlsZSAmJiAhc3RhdHNDb25maWcuZXJyb3JEZXRhaWxzKSB7XG4gICAgICAgIGNvbnN0IHdlYnBhY2tQYXRoSW5kZXggPSBmaWxlLmluZGV4T2YoJy53ZWJwYWNrWycpO1xuICAgICAgICBpZiAod2VicGFja1BhdGhJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICBmaWxlID0gZmlsZS5zdWJzdHJpbmcoMCwgd2VicGFja1BhdGhJbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgb3V0cHV0ICs9IGMoZmlsZSk7XG4gICAgICAgIGlmICh3YXJuaW5nLmxvYykge1xuICAgICAgICAgIG91dHB1dCArPSAnOicgKyB5Yih3YXJuaW5nLmxvYyk7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ICs9ICcgLSAnO1xuICAgICAgfVxuICAgICAgaWYgKCEvXndhcm5pbmcvaS50ZXN0KHdhcm5pbmcubWVzc2FnZSkpIHtcbiAgICAgICAgb3V0cHV0ICs9IHkoJ1dhcm5pbmc6ICcpO1xuICAgICAgfVxuICAgICAgb3V0cHV0ICs9IGAke3dhcm5pbmcubWVzc2FnZX1cXG5cXG5gO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXRwdXQgPyAnXFxuJyArIG91dHB1dCA6IG91dHB1dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXRzRXJyb3JzVG9TdHJpbmcoXG4gIGpzb246IFN0YXRzQ29tcGlsYXRpb24sXG4gIHN0YXRzQ29uZmlnOiBXZWJwYWNrU3RhdHNPcHRpb25zLFxuKTogc3RyaW5nIHtcbiAgY29uc3QgY29sb3JzID0gc3RhdHNDb25maWcuY29sb3JzO1xuICBjb25zdCBjID0gKHg6IHN0cmluZykgPT4gKGNvbG9ycyA/IGFuc2lDb2xvcnMucmVzZXQuY3lhbih4KSA6IHgpO1xuICBjb25zdCB5YiA9ICh4OiBzdHJpbmcpID0+IChjb2xvcnMgPyBhbnNpQ29sb3JzLnJlc2V0LnllbGxvd0JyaWdodCh4KSA6IHgpO1xuICBjb25zdCByID0gKHg6IHN0cmluZykgPT4gKGNvbG9ycyA/IGFuc2lDb2xvcnMucmVzZXQucmVkQnJpZ2h0KHgpIDogeCk7XG5cbiAgY29uc3QgZXJyb3JzID0ganNvbi5lcnJvcnMgPyBbLi4uanNvbi5lcnJvcnNdIDogW107XG4gIGlmIChqc29uLmNoaWxkcmVuKSB7XG4gICAgZXJyb3JzLnB1c2goLi4uanNvbi5jaGlsZHJlbi5tYXAoKGMpID0+IGM/LmVycm9ycyB8fCBbXSkucmVkdWNlKChhLCBiKSA9PiBbLi4uYSwgLi4uYl0sIFtdKSk7XG4gIH1cblxuICBsZXQgb3V0cHV0ID0gJyc7XG4gIGZvciAoY29uc3QgZXJyb3Igb2YgZXJyb3JzKSB7XG4gICAgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG91dHB1dCArPSByKGBFcnJvcjogJHtlcnJvcn1cXG5cXG5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGZpbGUgPSBlcnJvci5maWxlIHx8IGVycm9yLm1vZHVsZU5hbWU7XG4gICAgICAvLyBDbGVhbiB1cCBlcnJvciBwYXRoc1xuICAgICAgLy8gRXg6IC4vc3JjL2FwcC9zdHlsZXMuc2Nzcy53ZWJwYWNrW2phdmFzY3JpcHQvYXV0b10hPSEuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzLi4uLlxuICAgICAgLy8gdG8gLi9zcmMvYXBwL3N0eWxlcy5zY3NzLndlYnBhY2tcbiAgICAgIGlmIChmaWxlICYmICFzdGF0c0NvbmZpZy5lcnJvckRldGFpbHMpIHtcbiAgICAgICAgY29uc3Qgd2VicGFja1BhdGhJbmRleCA9IGZpbGUuaW5kZXhPZignLndlYnBhY2tbJyk7XG4gICAgICAgIGlmICh3ZWJwYWNrUGF0aEluZGV4ICE9PSAtMSkge1xuICAgICAgICAgIGZpbGUgPSBmaWxlLnN1YnN0cmluZygwLCB3ZWJwYWNrUGF0aEluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmlsZSkge1xuICAgICAgICBvdXRwdXQgKz0gYyhmaWxlKTtcbiAgICAgICAgaWYgKGVycm9yLmxvYykge1xuICAgICAgICAgIG91dHB1dCArPSAnOicgKyB5YihlcnJvci5sb2MpO1xuICAgICAgICB9XG4gICAgICAgIG91dHB1dCArPSAnIC0gJztcbiAgICAgIH1cblxuICAgICAgLy8gSW4gbW9zdCBjYXNlcyB3ZWJwYWNrIHdpbGwgYWRkIHN0YWNrIHRyYWNlcyB0byBlcnJvciBtZXNzYWdlcy5cbiAgICAgIC8vIFRoaXMgYmVsb3cgY2xlYW5zIHVwIHRoZSBlcnJvciBmcm9tIHN0YWNrcy5cbiAgICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2svd2VicGFjay9pc3N1ZXMvMTU5ODBcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBzdGF0c0NvbmZpZy5lcnJvclN0YWNrXG4gICAgICAgID8gZXJyb3IubWVzc2FnZVxuICAgICAgICA6IC9bXFxzXFxTXSs/KD89XFxuK1xccythdFxccykvLmV4ZWMoZXJyb3IubWVzc2FnZSk/LlswXSA/PyBlcnJvci5tZXNzYWdlO1xuXG4gICAgICBpZiAoIS9eZXJyb3IvaS50ZXN0KG1lc3NhZ2UpKSB7XG4gICAgICAgIG91dHB1dCArPSByKCdFcnJvcjogJyk7XG4gICAgICB9XG4gICAgICBvdXRwdXQgKz0gYCR7bWVzc2FnZX1cXG5cXG5gO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXRwdXQgPyAnXFxuJyArIG91dHB1dCA6IG91dHB1dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXRzSGFzRXJyb3JzKGpzb246IFN0YXRzQ29tcGlsYXRpb24pOiBib29sZWFuIHtcbiAgcmV0dXJuICEhKGpzb24uZXJyb3JzPy5sZW5ndGggfHwganNvbi5jaGlsZHJlbj8uc29tZSgoYykgPT4gYy5lcnJvcnM/Lmxlbmd0aCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhdHNIYXNXYXJuaW5ncyhqc29uOiBTdGF0c0NvbXBpbGF0aW9uKTogYm9vbGVhbiB7XG4gIHJldHVybiAhIShqc29uLndhcm5pbmdzPy5sZW5ndGggfHwganNvbi5jaGlsZHJlbj8uc29tZSgoYykgPT4gYy53YXJuaW5ncz8ubGVuZ3RoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXZWJwYWNrTG9nZ2luZ0NhbGxiYWNrKFxuICBvcHRpb25zOiBCcm93c2VyQnVpbGRlck9wdGlvbnMsXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4pOiBXZWJwYWNrTG9nZ2luZ0NhbGxiYWNrIHtcbiAgY29uc3QgeyB2ZXJib3NlID0gZmFsc2UsIHNjcmlwdHMgPSBbXSwgc3R5bGVzID0gW10gfSA9IG9wdGlvbnM7XG4gIGNvbnN0IGV4dHJhRW50cnlQb2ludHMgPSBbXG4gICAgLi4ubm9ybWFsaXplRXh0cmFFbnRyeVBvaW50cyhzdHlsZXMsICdzdHlsZXMnKSxcbiAgICAuLi5ub3JtYWxpemVFeHRyYUVudHJ5UG9pbnRzKHNjcmlwdHMsICdzY3JpcHRzJyksXG4gIF07XG5cbiAgcmV0dXJuIChzdGF0cywgY29uZmlnKSA9PiB7XG4gICAgaWYgKHZlcmJvc2UpIHtcbiAgICAgIGxvZ2dlci5pbmZvKHN0YXRzLnRvU3RyaW5nKGNvbmZpZy5zdGF0cykpO1xuICAgIH1cblxuICAgIGNvbnN0IHJhd1N0YXRzID0gc3RhdHMudG9Kc29uKGdldFN0YXRzT3B0aW9ucyhmYWxzZSkpO1xuICAgIGNvbnN0IHdlYnBhY2tTdGF0cyA9IHtcbiAgICAgIC4uLnJhd1N0YXRzLFxuICAgICAgY2h1bmtzOiBtYXJrQXN5bmNDaHVua3NOb25Jbml0aWFsKHJhd1N0YXRzLCBleHRyYUVudHJ5UG9pbnRzKSxcbiAgICB9O1xuXG4gICAgd2VicGFja1N0YXRzTG9nZ2VyKGxvZ2dlciwgd2VicGFja1N0YXRzLCBjb25maWcpO1xuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWxkRXZlbnRTdGF0cyB7XG4gIGFvdDogYm9vbGVhbjtcbiAgb3B0aW1pemF0aW9uOiBib29sZWFuO1xuICBhbGxDaHVua3NDb3VudDogbnVtYmVyO1xuICBsYXp5Q2h1bmtzQ291bnQ6IG51bWJlcjtcbiAgaW5pdGlhbENodW5rc0NvdW50OiBudW1iZXI7XG4gIGNoYW5nZWRDaHVua3NDb3VudD86IG51bWJlcjtcbiAgZHVyYXRpb25Jbk1zOiBudW1iZXI7XG4gIGNzc1NpemVJbkJ5dGVzOiBudW1iZXI7XG4gIGpzU2l6ZUluQnl0ZXM6IG51bWJlcjtcbiAgbmdDb21wb25lbnRDb3VudDogbnVtYmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVCdWlsZEV2ZW50U3RhdHMoXG4gIHdlYnBhY2tTdGF0czogU3RhdHNDb21waWxhdGlvbixcbiAgYnJvd3NlckJ1aWxkZXJPcHRpb25zOiBCcm93c2VyQnVpbGRlck9wdGlvbnMsXG4pOiBCdWlsZEV2ZW50U3RhdHMge1xuICBjb25zdCB7IGNodW5rcyA9IFtdLCBhc3NldHMgPSBbXSB9ID0gd2VicGFja1N0YXRzO1xuXG4gIGxldCBqc1NpemVJbkJ5dGVzID0gMDtcbiAgbGV0IGNzc1NpemVJbkJ5dGVzID0gMDtcbiAgbGV0IGluaXRpYWxDaHVua3NDb3VudCA9IDA7XG4gIGxldCBuZ0NvbXBvbmVudENvdW50ID0gMDtcbiAgbGV0IGNoYW5nZWRDaHVua3NDb3VudCA9IDA7XG5cbiAgY29uc3QgYWxsQ2h1bmtzQ291bnQgPSBjaHVua3MubGVuZ3RoO1xuICBjb25zdCBpc0ZpcnN0UnVuID0gIXJ1bnNDYWNoZS5oYXMod2VicGFja1N0YXRzLm91dHB1dFBhdGggfHwgJycpO1xuXG4gIGNvbnN0IGNodW5rRmlsZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgZm9yIChjb25zdCBjaHVuayBvZiBjaHVua3MpIHtcbiAgICBpZiAoIWlzRmlyc3RSdW4gJiYgY2h1bmsucmVuZGVyZWQpIHtcbiAgICAgIGNoYW5nZWRDaHVua3NDb3VudCsrO1xuICAgIH1cblxuICAgIGlmIChjaHVuay5pbml0aWFsKSB7XG4gICAgICBpbml0aWFsQ2h1bmtzQ291bnQrKztcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgY2h1bmsuZmlsZXMgPz8gW10pIHtcbiAgICAgIGNodW5rRmlsZXMuYWRkKGZpbGUpO1xuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgYXNzZXQgb2YgYXNzZXRzKSB7XG4gICAgaWYgKGFzc2V0Lm5hbWUuZW5kc1dpdGgoJy5tYXAnKSB8fCAhY2h1bmtGaWxlcy5oYXMoYXNzZXQubmFtZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGlmIChhc3NldC5uYW1lLmVuZHNXaXRoKCcuanMnKSkge1xuICAgICAganNTaXplSW5CeXRlcyArPSBhc3NldC5zaXplO1xuICAgICAgbmdDb21wb25lbnRDb3VudCArPSBhc3NldC5pbmZvLm5nQ29tcG9uZW50Q291bnQgPz8gMDtcbiAgICB9IGVsc2UgaWYgKGFzc2V0Lm5hbWUuZW5kc1dpdGgoJy5jc3MnKSkge1xuICAgICAgY3NzU2l6ZUluQnl0ZXMgKz0gYXNzZXQuc2l6ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG9wdGltaXphdGlvbjogISFub3JtYWxpemVPcHRpbWl6YXRpb24oYnJvd3NlckJ1aWxkZXJPcHRpb25zLm9wdGltaXphdGlvbikuc2NyaXB0cyxcbiAgICBhb3Q6IGJyb3dzZXJCdWlsZGVyT3B0aW9ucy5hb3QgIT09IGZhbHNlLFxuICAgIGFsbENodW5rc0NvdW50LFxuICAgIGxhenlDaHVua3NDb3VudDogYWxsQ2h1bmtzQ291bnQgLSBpbml0aWFsQ2h1bmtzQ291bnQsXG4gICAgaW5pdGlhbENodW5rc0NvdW50LFxuICAgIGNoYW5nZWRDaHVua3NDb3VudCxcbiAgICBkdXJhdGlvbkluTXM6IGdldEJ1aWxkRHVyYXRpb24od2VicGFja1N0YXRzKSxcbiAgICBjc3NTaXplSW5CeXRlcyxcbiAgICBqc1NpemVJbkJ5dGVzLFxuICAgIG5nQ29tcG9uZW50Q291bnQsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3ZWJwYWNrU3RhdHNMb2dnZXIoXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4gIGpzb246IFN0YXRzQ29tcGlsYXRpb24sXG4gIGNvbmZpZzogQ29uZmlndXJhdGlvbixcbiAgYnVkZ2V0RmFpbHVyZXM/OiBCdWRnZXRDYWxjdWxhdG9yUmVzdWx0W10sXG4pOiB2b2lkIHtcbiAgbG9nZ2VyLmluZm8oc3RhdHNUb1N0cmluZyhqc29uLCBjb25maWcuc3RhdHMsIGJ1ZGdldEZhaWx1cmVzKSk7XG5cbiAgaWYgKHR5cGVvZiBjb25maWcuc3RhdHMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIFdlYnBhY2sgc3RhdHMgY29uZmlndXJhdGlvbi4nKTtcbiAgfVxuXG4gIGlmIChzdGF0c0hhc1dhcm5pbmdzKGpzb24pKSB7XG4gICAgbG9nZ2VyLndhcm4oc3RhdHNXYXJuaW5nc1RvU3RyaW5nKGpzb24sIGNvbmZpZy5zdGF0cykpO1xuICB9XG5cbiAgaWYgKHN0YXRzSGFzRXJyb3JzKGpzb24pKSB7XG4gICAgbG9nZ2VyLmVycm9yKHN0YXRzRXJyb3JzVG9TdHJpbmcoanNvbiwgY29uZmlnLnN0YXRzKSk7XG4gIH1cbn1cbiJdfQ==