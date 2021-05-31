"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const glob = require("glob");
const webpack = require("webpack");
const webpackDevMiddleware = require('webpack-dev-middleware');
const stats_1 = require("../../utils/stats");
const node_1 = require("@angular-devkit/core/node");
const index_1 = require("../../../utils/index");
const KARMA_APPLICATION_PATH = '_karma_webpack_';
let blocked = [];
let isBlocked = false;
let webpackMiddleware;
let successCb;
let failureCb;
// Add files to the Karma files array.
function addKarmaFiles(files, newFiles, prepend = false) {
    const defaults = {
        included: true,
        served: true,
        watched: true,
    };
    const processedFiles = newFiles
        // Remove globs that do not match any files, otherwise Karma will show a warning for these.
        .filter((file) => glob.sync(file.pattern, { nodir: true }).length != 0)
        // Fill in pattern properties with defaults.
        .map((file) => ({ ...defaults, ...file }));
    // It's important to not replace the array, because
    // karma already has a reference to the existing array.
    if (prepend) {
        files.unshift(...processedFiles);
    }
    else {
        files.push(...processedFiles);
    }
}
const init = (config, emitter) => {
    if (!config.buildWebpack) {
        throw new Error(`The '@angular-devkit/build-angular/plugins/karma' karma plugin is meant to` +
            ` be used from within Angular CLI and will not work correctly outside of it.`);
    }
    const options = config.buildWebpack.options;
    const logger = config.buildWebpack.logger || node_1.createConsoleLogger();
    successCb = config.buildWebpack.successCb;
    failureCb = config.buildWebpack.failureCb;
    // Add a reporter that fixes sourcemap urls.
    if (index_1.normalizeSourceMaps(options.sourceMap).scripts) {
        config.reporters.unshift('@angular-devkit/build-angular--sourcemap-reporter');
        // Code taken from https://github.com/tschaub/karma-source-map-support.
        // We can't use it directly because we need to add it conditionally in this file, and karma
        // frameworks cannot be added dynamically.
        const smsPath = path.dirname(require.resolve('source-map-support'));
        const ksmsPath = path.dirname(require.resolve('karma-source-map-support'));
        addKarmaFiles(config.files, [
            { pattern: path.join(smsPath, 'browser-source-map-support.js'), watched: false },
            { pattern: path.join(ksmsPath, 'client.js'), watched: false },
        ], true);
    }
    config.reporters.unshift('@angular-devkit/build-angular--event-reporter');
    // When using code-coverage, auto-add karma-coverage.
    if (options.codeCoverage) {
        config.plugins = config.plugins || [];
        config.reporters = config.reporters || [];
        const { plugins, reporters } = config;
        const hasCoveragePlugin = plugins.some(isPlugin('karma-coverage', 'reporter:coverage'));
        const hasIstanbulPlugin = plugins.some(isPlugin('karma-coverage-istanbul-reporter', 'reporter:coverage-istanbul'));
        const hasCoverageReporter = reporters.includes('coverage');
        const hasIstanbulReporter = reporters.includes('coverage-istanbul');
        if (hasCoveragePlugin && !hasCoverageReporter) {
            reporters.push('coverage');
        }
        else if (hasIstanbulPlugin && !hasIstanbulReporter) {
            // coverage-istanbul is deprecated in favor of karma-coverage
            reporters.push('coverage-istanbul');
        }
        else if (!hasCoveragePlugin && !hasIstanbulPlugin) {
            throw new Error('karma-coverage must be installed in order to run code coverage.');
        }
        if (hasIstanbulPlugin) {
            logger.warn(`'karma-coverage-istanbul-reporter' usage has been deprecated since version 11.\n` +
                `Please install 'karma-coverage' and update 'karma.conf.js.' ` +
                'For more info, see https://github.com/karma-runner/karma-coverage/blob/master/README.md');
        }
    }
    // Add webpack config.
    const webpackConfig = config.buildWebpack.webpackConfig;
    const webpackMiddlewareConfig = {
        // Hide webpack output because its noisy.
        stats: false,
        publicPath: `/${KARMA_APPLICATION_PATH}/`,
    };
    // Use existing config if any.
    config.webpack = { ...webpackConfig, ...config.webpack };
    config.webpackMiddleware = { ...webpackMiddlewareConfig, ...config.webpackMiddleware };
    // Our custom context and debug files list the webpack bundles directly instead of using
    // the karma files array.
    config.customContextFile = `${__dirname}/karma-context.html`;
    config.customDebugFile = `${__dirname}/karma-debug.html`;
    // Add the request blocker and the webpack server fallback.
    config.beforeMiddleware = config.beforeMiddleware || [];
    config.beforeMiddleware.push('@angular-devkit/build-angular--blocker');
    config.middleware = config.middleware || [];
    config.middleware.push('@angular-devkit/build-angular--fallback');
    if (config.singleRun) {
        // There's no option to turn off file watching in webpack-dev-server, but
        // we can override the file watcher instead.
        webpackConfig.plugins.unshift({
            apply: (compiler) => {
                compiler.hooks.afterEnvironment.tap('karma', () => {
                    compiler.watchFileSystem = { watch: () => { } };
                });
            },
        });
    }
    // Files need to be served from a custom path for Karma.
    webpackConfig.output.path = `/${KARMA_APPLICATION_PATH}/`;
    webpackConfig.output.publicPath = `/${KARMA_APPLICATION_PATH}/`;
    const compiler = webpack(webpackConfig, (error, stats) => {
        var _a;
        if (error) {
            throw error;
        }
        if (stats === null || stats === void 0 ? void 0 : stats.hasErrors()) {
            // Only generate needed JSON stats and when needed.
            const statsJson = stats === null || stats === void 0 ? void 0 : stats.toJson({
                all: false,
                children: true,
                errors: true,
                warnings: true,
            });
            logger.error(stats_1.statsErrorsToString(statsJson, { colors: true }));
            // Notify potential listeners of the compile error.
            emitter.emit('compile_error', {
                errors: (_a = statsJson.errors) === null || _a === void 0 ? void 0 : _a.map((e) => e.message),
            });
            // Finish Karma run early in case of compilation error.
            emitter.emit('run_complete', [], { exitCode: 1 });
            // Emit a failure build event if there are compilation errors.
            failureCb();
        }
    });
    function handler(callback) {
        isBlocked = true;
        callback === null || callback === void 0 ? void 0 : callback();
    }
    compiler.hooks.invalid.tap('karma', () => handler());
    compiler.hooks.watchRun.tapAsync('karma', (_, callback) => handler(callback));
    compiler.hooks.run.tapAsync('karma', (_, callback) => handler(callback));
    function unblock() {
        isBlocked = false;
        blocked.forEach((cb) => cb());
        blocked = [];
    }
    let lastCompilationHash;
    compiler.hooks.done.tap('karma', (stats) => {
        if (stats.hasErrors()) {
            lastCompilationHash = undefined;
        }
        else if (stats.hash != lastCompilationHash) {
            // Refresh karma only when there are no webpack errors, and if the compilation changed.
            lastCompilationHash = stats.hash;
            emitter.refreshFiles();
        }
        unblock();
    });
    webpackMiddleware = webpackDevMiddleware(compiler, webpackMiddlewareConfig);
    emitter.on('exit', (done) => {
        webpackMiddleware.close();
        done();
    });
};
init.$inject = ['config', 'emitter'];
// Block requests until the Webpack compilation is done.
function requestBlocker() {
    return function (_request, _response, next) {
        if (isBlocked) {
            blocked.push(next);
        }
        else {
            next();
        }
    };
}
// Copied from "karma-jasmine-diff-reporter" source code:
// In case, when multiple reporters are used in conjunction
// with initSourcemapReporter, they both will show repetitive log
// messages when displaying everything that supposed to write to terminal.
// So just suppress any logs from initSourcemapReporter by doing nothing on
// browser log, because it is an utility reporter,
// unless it's alone in the "reporters" option and base reporter is used.
function muteDuplicateReporterLogging(context, config) {
    context.writeCommonMsg = () => { };
    const reporterName = '@angular/cli';
    const hasTrailingReporters = config.reporters.slice(-1).pop() !== reporterName;
    if (hasTrailingReporters) {
        context.writeCommonMsg = () => { };
    }
}
// Emits builder events.
const eventReporter = function (baseReporterDecorator, config) {
    baseReporterDecorator(this);
    muteDuplicateReporterLogging(this, config);
    this.onRunComplete = function (_browsers, results) {
        if (results.exitCode === 0) {
            successCb();
        }
        else {
            failureCb();
        }
    };
    // avoid duplicate failure message
    this.specFailure = () => { };
};
eventReporter.$inject = ['baseReporterDecorator', 'config'];
// Strip the server address and webpack scheme (webpack://) from error log.
const sourceMapReporter = function (baseReporterDecorator, config) {
    baseReporterDecorator(this);
    muteDuplicateReporterLogging(this, config);
    const urlRegexp = /http:\/\/localhost:\d+\/_karma_webpack_\/(webpack:\/)?/gi;
    this.onSpecComplete = function (_browser, result) {
        if (!result.success) {
            result.log = result.log.map((l) => l.replace(urlRegexp, ''));
        }
    };
    // avoid duplicate complete message
    this.onRunComplete = () => { };
    // avoid duplicate failure message
    this.specFailure = () => { };
};
sourceMapReporter.$inject = ['baseReporterDecorator', 'config'];
// When a request is not found in the karma server, try looking for it from the webpack server root.
function fallbackMiddleware() {
    return function (request, response, next) {
        if (webpackMiddleware) {
            if (request.url && !new RegExp(`\\/${KARMA_APPLICATION_PATH}\\/.*`).test(request.url)) {
                request.url = '/' + KARMA_APPLICATION_PATH + request.url;
            }
            webpackMiddleware(request, response, () => {
                const alwaysServe = [
                    `/${KARMA_APPLICATION_PATH}/runtime.js`,
                    `/${KARMA_APPLICATION_PATH}/polyfills.js`,
                    `/${KARMA_APPLICATION_PATH}/polyfills-es5.js`,
                    `/${KARMA_APPLICATION_PATH}/scripts.js`,
                    `/${KARMA_APPLICATION_PATH}/styles.js`,
                    `/${KARMA_APPLICATION_PATH}/vendor.js`,
                ];
                if (request.url && alwaysServe.includes(request.url)) {
                    response.statusCode = 200;
                    response.end();
                }
                else {
                    next();
                }
            });
        }
        else {
            next();
        }
    };
}
/**
 * Returns a function that returns true if the plugin identifier matches the
 * `moduleId` or `pluginName`. A plugin identifier can be either a string or
 * an object according to https://karma-runner.github.io/5.2/config/plugins.html
 * @param moduleId name of the node module (e.g. karma-coverage)
 * @param pluginName name of the karma plugin (e.g. reporter:coverage)
 */
function isPlugin(moduleId, pluginName) {
    return (plugin) => {
        if (typeof plugin === 'string') {
            if (!plugin.includes('*')) {
                return plugin === moduleId;
            }
            const regexp = new RegExp(`^${plugin.replace('*', '.*')}`);
            if (regexp.test(moduleId)) {
                try {
                    require.resolve(moduleId);
                    return true;
                }
                catch { }
            }
            return false;
        }
        return pluginName in plugin;
    };
}
module.exports = {
    'framework:@angular-devkit/build-angular': ['factory', init],
    'reporter:@angular-devkit/build-angular--sourcemap-reporter': ['type', sourceMapReporter],
    'reporter:@angular-devkit/build-angular--event-reporter': ['type', eventReporter],
    'middleware:@angular-devkit/build-angular--blocker': ['factory', requestBlocker],
    'middleware:@angular-devkit/build-angular--fallback': ['factory', fallbackMiddleware],
};
