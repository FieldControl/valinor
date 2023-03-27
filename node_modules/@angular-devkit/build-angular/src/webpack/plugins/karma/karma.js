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
const path = __importStar(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const webpack_dev_middleware_1 = __importDefault(require("webpack-dev-middleware"));
const stats_1 = require("../../utils/stats");
const node_1 = require("@angular-devkit/core/node");
const index_1 = require("../../../utils/index");
const KARMA_APPLICATION_PATH = '_karma_webpack_';
let blocked = [];
let isBlocked = false;
let webpackMiddleware;
let successCb;
let failureCb;
const init = (config, emitter) => {
    if (!config.buildWebpack) {
        throw new Error(`The '@angular-devkit/build-angular/plugins/karma' karma plugin is meant to` +
            ` be used from within Angular CLI and will not work correctly outside of it.`);
    }
    const options = config.buildWebpack.options;
    const logger = config.buildWebpack.logger || (0, node_1.createConsoleLogger)();
    successCb = config.buildWebpack.successCb;
    failureCb = config.buildWebpack.failureCb;
    // Add a reporter that fixes sourcemap urls.
    if ((0, index_1.normalizeSourceMaps)(options.sourceMap).scripts) {
        config.reporters.unshift('@angular-devkit/build-angular--sourcemap-reporter');
        // Code taken from https://github.com/tschaub/karma-source-map-support.
        // We can't use it directly because we need to add it conditionally in this file, and karma
        // frameworks cannot be added dynamically.
        const smsPath = path.dirname(require.resolve('source-map-support'));
        const ksmsPath = path.dirname(require.resolve('karma-source-map-support'));
        config.files.unshift({
            pattern: path.join(smsPath, 'browser-source-map-support.js'),
            included: true,
            served: true,
            watched: false,
        }, { pattern: path.join(ksmsPath, 'client.js'), included: true, served: true, watched: false });
    }
    config.reporters.unshift('@angular-devkit/build-angular--event-reporter');
    // When using code-coverage, auto-add karma-coverage.
    if (options.codeCoverage &&
        !config.reporters.some((r) => r === 'coverage' || r === 'coverage-istanbul')) {
        config.reporters.push('coverage');
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
    const compiler = (0, webpack_1.default)(webpackConfig, (error, stats) => {
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
            logger.error((0, stats_1.statsErrorsToString)(statsJson, { colors: true }));
            if (config.singleRun) {
                // Notify potential listeners of the compile error.
                emitter.emit('load_error');
            }
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
    webpackMiddleware = (0, webpack_dev_middleware_1.default)(compiler, webpackMiddlewareConfig);
    emitter.on('exit', (done) => {
        webpackMiddleware.close();
        compiler.close(() => done());
    });
    function unblock() {
        isBlocked = false;
        blocked.forEach((cb) => cb());
        blocked = [];
    }
    let lastCompilationHash;
    let isFirstRun = true;
    return new Promise((resolve) => {
        compiler.hooks.done.tap('karma', (stats) => {
            if (isFirstRun) {
                // This is needed to block Karma from launching browsers before Webpack writes the assets in memory.
                // See the below:
                // https://github.com/karma-runner/karma-chrome-launcher/issues/154#issuecomment-986661937
                // https://github.com/angular/angular-cli/issues/22495
                isFirstRun = false;
                resolve();
            }
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
                    `/${KARMA_APPLICATION_PATH}/scripts.js`,
                    `/${KARMA_APPLICATION_PATH}/styles.css`,
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
module.exports = {
    'framework:@angular-devkit/build-angular': ['factory', init],
    'reporter:@angular-devkit/build-angular--sourcemap-reporter': ['type', sourceMapReporter],
    'reporter:@angular-devkit/build-angular--event-reporter': ['type', eventReporter],
    'middleware:@angular-devkit/build-angular--blocker': ['factory', requestBlocker],
    'middleware:@angular-devkit/build-angular--fallback': ['factory', fallbackMiddleware],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FybWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy93ZWJwYWNrL3BsdWdpbnMva2FybWEva2FybWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUtILDJDQUE2QjtBQUM3QixzREFBOEI7QUFDOUIsb0ZBQTBEO0FBRTFELDZDQUF3RDtBQUN4RCxvREFBZ0U7QUFHaEUsZ0RBQTJEO0FBRTNELE1BQU0sc0JBQXNCLEdBQUcsaUJBQWlCLENBQUM7QUFFakQsSUFBSSxPQUFPLEdBQVUsRUFBRSxDQUFDO0FBQ3hCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztBQUN0QixJQUFJLGlCQUFzQixDQUFDO0FBQzNCLElBQUksU0FBcUIsQ0FBQztBQUMxQixJQUFJLFNBQXFCLENBQUM7QUFFMUIsTUFBTSxJQUFJLEdBQVEsQ0FBQyxNQUFXLEVBQUUsT0FBWSxFQUFFLEVBQUU7SUFDOUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUU7UUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FDYiw0RUFBNEU7WUFDMUUsNkVBQTZFLENBQ2hGLENBQUM7S0FDSDtJQUNELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBdUIsQ0FBQztJQUM1RCxNQUFNLE1BQU0sR0FBbUIsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLElBQUksSUFBQSwwQkFBbUIsR0FBRSxDQUFDO0lBQ25GLFNBQVMsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQztJQUMxQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7SUFFMUMsNENBQTRDO0lBQzVDLElBQUksSUFBQSwyQkFBbUIsRUFBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENB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QUFDLEVBQUU7b0JBQ3BELFFBQVEsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO29CQUMxQixRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7aUJBQ2hCO3FCQUFNO29CQUNMLElBQUksRUFBRSxDQUFDO2lCQUNSO1lBQ0gsQ0FBQyxDQUFDLENBQUM7U0FDSjthQUFNO1lBQ0wsSUFBSSxFQUFFLENBQUM7U0FDUjtJQUNILENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2YseUNBQXlDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDO0lBQzVELDREQUE0RCxFQUFFLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDO0lBQ3pGLHdEQUF3RCxFQUFFLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQztJQUNqRixtREFBbUQsRUFBRSxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUM7SUFDaEYsb0RBQW9ELEVBQUUsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLENBQUM7Q0FDdEYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuLy8gVE9ETzogY2xlYW51cCB0aGlzIGZpbGUsIGl0J3MgY29waWVkIGFzIGlzIGZyb20gQW5ndWxhciBDTEkuXG5pbXBvcnQgKiBhcyBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB3ZWJwYWNrIGZyb20gJ3dlYnBhY2snO1xuaW1wb3J0IHdlYnBhY2tEZXZNaWRkbGV3YXJlIGZyb20gJ3dlYnBhY2stZGV2LW1pZGRsZXdhcmUnO1xuXG5pbXBvcnQgeyBzdGF0c0Vycm9yc1RvU3RyaW5nIH0gZnJvbSAnLi4vLi4vdXRpbHMvc3RhdHMnO1xuaW1wb3J0IHsgY3JlYXRlQ29uc29sZUxvZ2dlciB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlL25vZGUnO1xuaW1wb3J0IHsgbG9nZ2luZyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IEJ1aWxkT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2J1aWxkLW9wdGlvbnMnO1xuaW1wb3J0IHsgbm9ybWFsaXplU291cmNlTWFwcyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2luZGV4JztcblxuY29uc3QgS0FSTUFfQVBQTElDQVRJT05fUEFUSCA9ICdfa2FybWFfd2VicGFja18nO1xuXG5sZXQgYmxvY2tlZDogYW55W10gPSBbXTtcbmxldCBpc0Jsb2NrZWQgPSBmYWxzZTtcbmxldCB3ZWJwYWNrTWlkZGxld2FyZTogYW55O1xubGV0IHN1Y2Nlc3NDYjogKCkgPT4gdm9pZDtcbmxldCBmYWlsdXJlQ2I6ICgpID0+IHZvaWQ7XG5cbmNvbnN0IGluaXQ6IGFueSA9IChjb25maWc6IGFueSwgZW1pdHRlcjogYW55KSA9PiB7XG4gIGlmICghY29uZmlnLmJ1aWxkV2VicGFjaykge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBUaGUgJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyL3BsdWdpbnMva2FybWEnIGthcm1hIHBsdWdpbiBpcyBtZWFudCB0b2AgK1xuICAgICAgICBgIGJlIHVzZWQgZnJvbSB3aXRoaW4gQW5ndWxhciBDTEkgYW5kIHdpbGwgbm90IHdvcmsgY29ycmVjdGx5IG91dHNpZGUgb2YgaXQuYCxcbiAgICApO1xuICB9XG4gIGNvbnN0IG9wdGlvbnMgPSBjb25maWcuYnVpbGRXZWJwYWNrLm9wdGlvbnMgYXMgQnVpbGRPcHRpb25zO1xuICBjb25zdCBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyID0gY29uZmlnLmJ1aWxkV2VicGFjay5sb2dnZXIgfHwgY3JlYXRlQ29uc29sZUxvZ2dlcigpO1xuICBzdWNjZXNzQ2IgPSBjb25maWcuYnVpbGRXZWJwYWNrLnN1Y2Nlc3NDYjtcbiAgZmFpbHVyZUNiID0gY29uZmlnLmJ1aWxkV2VicGFjay5mYWlsdXJlQ2I7XG5cbiAgLy8gQWRkIGEgcmVwb3J0ZXIgdGhhdCBmaXhlcyBzb3VyY2VtYXAgdXJscy5cbiAgaWYgKG5vcm1hbGl6ZVNvdXJjZU1hcHMob3B0aW9ucy5zb3VyY2VNYXApLnNjcmlwdHMpIHtcbiAgICBjb25maWcucmVwb3J0ZXJzLnVuc2hpZnQoJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyLS1zb3VyY2VtYXAtcmVwb3J0ZXInKTtcblxuICAgIC8vIENvZGUgdGFrZW4gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vdHNjaGF1Yi9rYXJtYS1zb3VyY2UtbWFwLXN1cHBvcnQuXG4gICAgLy8gV2UgY2FuJ3QgdXNlIGl0IGRpcmVjdGx5IGJlY2F1c2Ugd2UgbmVlZCB0byBhZGQgaXQgY29uZGl0aW9uYWxseSBpbiB0aGlzIGZpbGUsIGFuZCBrYXJtYVxuICAgIC8vIGZyYW1ld29ya3MgY2Fubm90IGJlIGFkZGVkIGR5bmFtaWNhbGx5LlxuICAgIGNvbnN0IHNtc1BhdGggPSBwYXRoLmRpcm5hbWUocmVxdWlyZS5yZXNvbHZlKCdzb3VyY2UtbWFwLXN1cHBvcnQnKSk7XG4gICAgY29uc3Qga3Ntc1BhdGggPSBwYXRoLmRpcm5hbWUocmVxdWlyZS5yZXNvbHZlKCdrYXJtYS1zb3VyY2UtbWFwLXN1cHBvcnQnKSk7XG5cbiAgICBjb25maWcuZmlsZXMudW5zaGlmdChcbiAgICAgIHtcbiAgICAgICAgcGF0dGVybjogcGF0aC5qb2luKHNtc1BhdGgsICdicm93c2VyLXNvdXJjZS1tYXAtc3VwcG9ydC5qcycpLFxuICAgICAgICBpbmNsdWRlZDogdHJ1ZSxcbiAgICAgICAgc2VydmVkOiB0cnVlLFxuICAgICAgICB3YXRjaGVkOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICB7IHBhdHRlcm46IHBhdGguam9pbihrc21zUGF0aCwgJ2NsaWVudC5qcycpLCBpbmNsdWRlZDogdHJ1ZSwgc2VydmVkOiB0cnVlLCB3YXRjaGVkOiBmYWxzZSB9LFxuICAgICk7XG4gIH1cblxuICBjb25maWcucmVwb3J0ZXJzLnVuc2hpZnQoJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyLS1ldmVudC1yZXBvcnRlcicpO1xuXG4gIC8vIFdoZW4gdXNpbmcgY29kZS1jb3ZlcmFnZSwgYXV0by1hZGQga2FybWEtY292ZXJhZ2UuXG4gIGlmIChcbiAgICBvcHRpb25zLmNvZGVDb3ZlcmFnZSAmJlxuICAgICFjb25maWcucmVwb3J0ZXJzLnNvbWUoKHI6IHN0cmluZykgPT4gciA9PT0gJ2NvdmVyYWdlJyB8fCByID09PSAnY292ZXJhZ2UtaXN0YW5idWwnKVxuICApIHtcbiAgICBjb25maWcucmVwb3J0ZXJzLnB1c2goJ2NvdmVyYWdlJyk7XG4gIH1cblxuICAvLyBBZGQgd2VicGFjayBjb25maWcuXG4gIGNvbnN0IHdlYnBhY2tDb25maWcgPSBjb25maWcuYnVpbGRXZWJwYWNrLndlYnBhY2tDb25maWc7XG4gIGNvbnN0IHdlYnBhY2tNaWRkbGV3YXJlQ29uZmlnID0ge1xuICAgIC8vIEhpZGUgd2VicGFjayBvdXRwdXQgYmVjYXVzZSBpdHMgbm9pc3kuXG4gICAgc3RhdHM6IGZhbHNlLFxuICAgIHB1YmxpY1BhdGg6IGAvJHtLQVJNQV9BUFBMSUNBVElPTl9QQVRIfS9gLFxuICB9O1xuXG4gIC8vIFVzZSBleGlzdGluZyBjb25maWcgaWYgYW55LlxuICBjb25maWcud2VicGFjayA9IHsgLi4ud2VicGFja0NvbmZpZywgLi4uY29uZmlnLndlYnBhY2sgfTtcbiAgY29uZmlnLndlYnBhY2tNaWRkbGV3YXJlID0geyAuLi53ZWJwYWNrTWlkZGxld2FyZUNvbmZpZywgLi4uY29uZmlnLndlYnBhY2tNaWRkbGV3YXJlIH07XG5cbiAgLy8gT3VyIGN1c3RvbSBjb250ZXh0IGFuZCBkZWJ1ZyBmaWxlcyBsaXN0IHRoZSB3ZWJwYWNrIGJ1bmRsZXMgZGlyZWN0bHkgaW5zdGVhZCBvZiB1c2luZ1xuICAvLyB0aGUga2FybWEgZmlsZXMgYXJyYXkuXG4gIGNvbmZpZy5jdXN0b21Db250ZXh0RmlsZSA9IGAke19fZGlybmFtZX0va2FybWEtY29udGV4dC5odG1sYDtcbiAgY29uZmlnLmN1c3RvbURlYnVnRmlsZSA9IGAke19fZGlybmFtZX0va2FybWEtZGVidWcuaHRtbGA7XG5cbiAgLy8gQWRkIHRoZSByZXF1ZXN0IGJsb2NrZXIgYW5kIHRoZSB3ZWJwYWNrIHNlcnZlciBmYWxsYmFjay5cbiAgY29uZmlnLmJlZm9yZU1pZGRsZXdhcmUgPSBjb25maWcuYmVmb3JlTWlkZGxld2FyZSB8fCBbXTtcbiAgY29uZmlnLmJlZm9yZU1pZGRsZXdhcmUucHVzaCgnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXItLWJsb2NrZXInKTtcbiAgY29uZmlnLm1pZGRsZXdhcmUgPSBjb25maWcubWlkZGxld2FyZSB8fCBbXTtcbiAgY29uZmlnLm1pZGRsZXdhcmUucHVzaCgnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXItLWZhbGxiYWNrJyk7XG5cbiAgaWYgKGNvbmZpZy5zaW5nbGVSdW4pIHtcbiAgICAvLyBUaGVyZSdzIG5vIG9wdGlvbiB0byB0dXJuIG9mZiBmaWxlIHdhdGNoaW5nIGluIHdlYnBhY2stZGV2LXNlcnZlciwgYnV0XG4gICAgLy8gd2UgY2FuIG92ZXJyaWRlIHRoZSBmaWxlIHdhdGNoZXIgaW5zdGVhZC5cbiAgICB3ZWJwYWNrQ29uZmlnLnBsdWdpbnMudW5zaGlmdCh7XG4gICAgICBhcHBseTogKGNvbXBpbGVyOiBhbnkpID0+IHtcbiAgICAgICAgY29tcGlsZXIuaG9va3MuYWZ0ZXJFbnZpcm9ubWVudC50YXAoJ2thcm1hJywgKCkgPT4ge1xuICAgICAgICAgIGNvbXBpbGVyLndhdGNoRmlsZVN5c3RlbSA9IHsgd2F0Y2g6ICgpID0+IHt9IH07XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuICAvLyBGaWxlcyBuZWVkIHRvIGJlIHNlcnZlZCBmcm9tIGEgY3VzdG9tIHBhdGggZm9yIEthcm1hLlxuICB3ZWJwYWNrQ29uZmlnLm91dHB1dC5wYXRoID0gYC8ke0tBUk1BX0FQUExJQ0FUSU9OX1BBVEh9L2A7XG4gIHdlYnBhY2tDb25maWcub3V0cHV0LnB1YmxpY1BhdGggPSBgLyR7S0FSTUFfQVBQTElDQVRJT05fUEFUSH0vYDtcblxuICBjb25zdCBjb21waWxlciA9IHdlYnBhY2sod2VicGFja0NvbmZpZywgKGVycm9yLCBzdGF0cykgPT4ge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuXG4gICAgaWYgKHN0YXRzPy5oYXNFcnJvcnMoKSkge1xuICAgICAgLy8gT25seSBnZW5lcmF0ZSBuZWVkZWQgSlNPTiBzdGF0cyBhbmQgd2hlbiBuZWVkZWQuXG4gICAgICBjb25zdCBzdGF0c0pzb24gPSBzdGF0cz8udG9Kc29uKHtcbiAgICAgICAgYWxsOiBmYWxzZSxcbiAgICAgICAgY2hpbGRyZW46IHRydWUsXG4gICAgICAgIGVycm9yczogdHJ1ZSxcbiAgICAgICAgd2FybmluZ3M6IHRydWUsXG4gICAgICB9KTtcblxuICAgICAgbG9nZ2VyLmVycm9yKHN0YXRzRXJyb3JzVG9TdHJpbmcoc3RhdHNKc29uLCB7IGNvbG9yczogdHJ1ZSB9KSk7XG5cbiAgICAgIGlmIChjb25maWcuc2luZ2xlUnVuKSB7XG4gICAgICAgIC8vIE5vdGlmeSBwb3RlbnRpYWwgbGlzdGVuZXJzIG9mIHRoZSBjb21waWxlIGVycm9yLlxuICAgICAgICBlbWl0dGVyLmVtaXQoJ2xvYWRfZXJyb3InKTtcbiAgICAgIH1cblxuICAgICAgLy8gRmluaXNoIEthcm1hIHJ1biBlYXJseSBpbiBjYXNlIG9mIGNvbXBpbGF0aW9uIGVycm9yLlxuICAgICAgZW1pdHRlci5lbWl0KCdydW5fY29tcGxldGUnLCBbXSwgeyBleGl0Q29kZTogMSB9KTtcblxuICAgICAgLy8gRW1pdCBhIGZhaWx1cmUgYnVpbGQgZXZlbnQgaWYgdGhlcmUgYXJlIGNvbXBpbGF0aW9uIGVycm9ycy5cbiAgICAgIGZhaWx1cmVDYigpO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gaGFuZGxlcihjYWxsYmFjaz86ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBpc0Jsb2NrZWQgPSB0cnVlO1xuICAgIGNhbGxiYWNrPy4oKTtcbiAgfVxuXG4gIGNvbXBpbGVyLmhvb2tzLmludmFsaWQudGFwKCdrYXJtYScsICgpID0+IGhhbmRsZXIoKSk7XG4gIGNvbXBpbGVyLmhvb2tzLndhdGNoUnVuLnRhcEFzeW5jKCdrYXJtYScsIChfOiBhbnksIGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiBoYW5kbGVyKGNhbGxiYWNrKSk7XG4gIGNvbXBpbGVyLmhvb2tzLnJ1bi50YXBBc3luYygna2FybWEnLCAoXzogYW55LCBjYWxsYmFjazogKCkgPT4gdm9pZCkgPT4gaGFuZGxlcihjYWxsYmFjaykpO1xuXG4gIHdlYnBhY2tNaWRkbGV3YXJlID0gd2VicGFja0Rldk1pZGRsZXdhcmUoY29tcGlsZXIsIHdlYnBhY2tNaWRkbGV3YXJlQ29uZmlnKTtcbiAgZW1pdHRlci5vbignZXhpdCcsIChkb25lOiBhbnkpID0+IHtcbiAgICB3ZWJwYWNrTWlkZGxld2FyZS5jbG9zZSgpO1xuICAgIGNvbXBpbGVyLmNsb3NlKCgpID0+IGRvbmUoKSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHVuYmxvY2soKSB7XG4gICAgaXNCbG9ja2VkID0gZmFsc2U7XG4gICAgYmxvY2tlZC5mb3JFYWNoKChjYikgPT4gY2IoKSk7XG4gICAgYmxvY2tlZCA9IFtdO1xuICB9XG5cbiAgbGV0IGxhc3RDb21waWxhdGlvbkhhc2g6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgbGV0IGlzRmlyc3RSdW4gPSB0cnVlO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgIGNvbXBpbGVyLmhvb2tzLmRvbmUudGFwKCdrYXJtYScsIChzdGF0cykgPT4ge1xuICAgICAgaWYgKGlzRmlyc3RSdW4pIHtcbiAgICAgICAgLy8gVGhpcyBpcyBuZWVkZWQgdG8gYmxvY2sgS2FybWEgZnJvbSBsYXVuY2hpbmcgYnJvd3NlcnMgYmVmb3JlIFdlYnBhY2sgd3JpdGVzIHRoZSBhc3NldHMgaW4gbWVtb3J5LlxuICAgICAgICAvLyBTZWUgdGhlIGJlbG93OlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20va2FybWEtcnVubmVyL2thcm1hLWNocm9tZS1sYXVuY2hlci9pc3N1ZXMvMTU0I2lzc3VlY29tbWVudC05ODY2NjE5MzdcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci1jbGkvaXNzdWVzLzIyNDk1XG4gICAgICAgIGlzRmlyc3RSdW4gPSBmYWxzZTtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdHMuaGFzRXJyb3JzKCkpIHtcbiAgICAgICAgbGFzdENvbXBpbGF0aW9uSGFzaCA9IHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdHMuaGFzaCAhPSBsYXN0Q29tcGlsYXRpb25IYXNoKSB7XG4gICAgICAgIC8vIFJlZnJlc2gga2FybWEgb25seSB3aGVuIHRoZXJlIGFyZSBubyB3ZWJwYWNrIGVycm9ycywgYW5kIGlmIHRoZSBjb21waWxhdGlvbiBjaGFuZ2VkLlxuICAgICAgICBsYXN0Q29tcGlsYXRpb25IYXNoID0gc3RhdHMuaGFzaDtcbiAgICAgICAgZW1pdHRlci5yZWZyZXNoRmlsZXMoKTtcbiAgICAgIH1cblxuICAgICAgdW5ibG9jaygpO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbmluaXQuJGluamVjdCA9IFsnY29uZmlnJywgJ2VtaXR0ZXInXTtcblxuLy8gQmxvY2sgcmVxdWVzdHMgdW50aWwgdGhlIFdlYnBhY2sgY29tcGlsYXRpb24gaXMgZG9uZS5cbmZ1bmN0aW9uIHJlcXVlc3RCbG9ja2VyKCkge1xuICByZXR1cm4gZnVuY3Rpb24gKF9yZXF1ZXN0OiBhbnksIF9yZXNwb25zZTogYW55LCBuZXh0OiAoKSA9PiB2b2lkKSB7XG4gICAgaWYgKGlzQmxvY2tlZCkge1xuICAgICAgYmxvY2tlZC5wdXNoKG5leHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0KCk7XG4gICAgfVxuICB9O1xufVxuXG4vLyBDb3BpZWQgZnJvbSBcImthcm1hLWphc21pbmUtZGlmZi1yZXBvcnRlclwiIHNvdXJjZSBjb2RlOlxuLy8gSW4gY2FzZSwgd2hlbiBtdWx0aXBsZSByZXBvcnRlcnMgYXJlIHVzZWQgaW4gY29uanVuY3Rpb25cbi8vIHdpdGggaW5pdFNvdXJjZW1hcFJlcG9ydGVyLCB0aGV5IGJvdGggd2lsbCBzaG93IHJlcGV0aXRpdmUgbG9nXG4vLyBtZXNzYWdlcyB3aGVuIGRpc3BsYXlpbmcgZXZlcnl0aGluZyB0aGF0IHN1cHBvc2VkIHRvIHdyaXRlIHRvIHRlcm1pbmFsLlxuLy8gU28ganVzdCBzdXBwcmVzcyBhbnkgbG9ncyBmcm9tIGluaXRTb3VyY2VtYXBSZXBvcnRlciBieSBkb2luZyBub3RoaW5nIG9uXG4vLyBicm93c2VyIGxvZywgYmVjYXVzZSBpdCBpcyBhbiB1dGlsaXR5IHJlcG9ydGVyLFxuLy8gdW5sZXNzIGl0J3MgYWxvbmUgaW4gdGhlIFwicmVwb3J0ZXJzXCIgb3B0aW9uIGFuZCBiYXNlIHJlcG9ydGVyIGlzIHVzZWQuXG5mdW5jdGlvbiBtdXRlRHVwbGljYXRlUmVwb3J0ZXJMb2dnaW5nKGNvbnRleHQ6IGFueSwgY29uZmlnOiBhbnkpIHtcbiAgY29udGV4dC53cml0ZUNvbW1vbk1zZyA9ICgpID0+IHt9O1xuICBjb25zdCByZXBvcnRlck5hbWUgPSAnQGFuZ3VsYXIvY2xpJztcbiAgY29uc3QgaGFzVHJhaWxpbmdSZXBvcnRlcnMgPSBjb25maWcucmVwb3J0ZXJzLnNsaWNlKC0xKS5wb3AoKSAhPT0gcmVwb3J0ZXJOYW1lO1xuXG4gIGlmIChoYXNUcmFpbGluZ1JlcG9ydGVycykge1xuICAgIGNvbnRleHQud3JpdGVDb21tb25Nc2cgPSAoKSA9PiB7fTtcbiAgfVxufVxuXG4vLyBFbWl0cyBidWlsZGVyIGV2ZW50cy5cbmNvbnN0IGV2ZW50UmVwb3J0ZXI6IGFueSA9IGZ1bmN0aW9uICh0aGlzOiBhbnksIGJhc2VSZXBvcnRlckRlY29yYXRvcjogYW55LCBjb25maWc6IGFueSkge1xuICBiYXNlUmVwb3J0ZXJEZWNvcmF0b3IodGhpcyk7XG5cbiAgbXV0ZUR1cGxpY2F0ZVJlcG9ydGVyTG9nZ2luZyh0aGlzLCBjb25maWcpO1xuXG4gIHRoaXMub25SdW5Db21wbGV0ZSA9IGZ1bmN0aW9uIChfYnJvd3NlcnM6IGFueSwgcmVzdWx0czogYW55KSB7XG4gICAgaWYgKHJlc3VsdHMuZXhpdENvZGUgPT09IDApIHtcbiAgICAgIHN1Y2Nlc3NDYigpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmYWlsdXJlQ2IoKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gYXZvaWQgZHVwbGljYXRlIGZhaWx1cmUgbWVzc2FnZVxuICB0aGlzLnNwZWNGYWlsdXJlID0gKCkgPT4ge307XG59O1xuXG5ldmVudFJlcG9ydGVyLiRpbmplY3QgPSBbJ2Jhc2VSZXBvcnRlckRlY29yYXRvcicsICdjb25maWcnXTtcblxuLy8gU3RyaXAgdGhlIHNlcnZlciBhZGRyZXNzIGFuZCB3ZWJwYWNrIHNjaGVtZSAod2VicGFjazovLykgZnJvbSBlcnJvciBsb2cuXG5jb25zdCBzb3VyY2VNYXBSZXBvcnRlcjogYW55ID0gZnVuY3Rpb24gKHRoaXM6IGFueSwgYmFzZVJlcG9ydGVyRGVjb3JhdG9yOiBhbnksIGNvbmZpZzogYW55KSB7XG4gIGJhc2VSZXBvcnRlckRlY29yYXRvcih0aGlzKTtcbiAgbXV0ZUR1cGxpY2F0ZVJlcG9ydGVyTG9nZ2luZyh0aGlzLCBjb25maWcpO1xuXG4gIGNvbnN0IHVybFJlZ2V4cCA9IC9odHRwOlxcL1xcL2xvY2FsaG9zdDpcXGQrXFwvX2thcm1hX3dlYnBhY2tfXFwvKHdlYnBhY2s6XFwvKT8vZ2k7XG5cbiAgdGhpcy5vblNwZWNDb21wbGV0ZSA9IGZ1bmN0aW9uIChfYnJvd3NlcjogYW55LCByZXN1bHQ6IGFueSkge1xuICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgIHJlc3VsdC5sb2cgPSByZXN1bHQubG9nLm1hcCgobDogc3RyaW5nKSA9PiBsLnJlcGxhY2UodXJsUmVnZXhwLCAnJykpO1xuICAgIH1cbiAgfTtcblxuICAvLyBhdm9pZCBkdXBsaWNhdGUgY29tcGxldGUgbWVzc2FnZVxuICB0aGlzLm9uUnVuQ29tcGxldGUgPSAoKSA9PiB7fTtcblxuICAvLyBhdm9pZCBkdXBsaWNhdGUgZmFpbHVyZSBtZXNzYWdlXG4gIHRoaXMuc3BlY0ZhaWx1cmUgPSAoKSA9PiB7fTtcbn07XG5cbnNvdXJjZU1hcFJlcG9ydGVyLiRpbmplY3QgPSBbJ2Jhc2VSZXBvcnRlckRlY29yYXRvcicsICdjb25maWcnXTtcblxuLy8gV2hlbiBhIHJlcXVlc3QgaXMgbm90IGZvdW5kIGluIHRoZSBrYXJtYSBzZXJ2ZXIsIHRyeSBsb29raW5nIGZvciBpdCBmcm9tIHRoZSB3ZWJwYWNrIHNlcnZlciByb290LlxuZnVuY3Rpb24gZmFsbGJhY2tNaWRkbGV3YXJlKCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHJlcXVlc3Q6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXNwb25zZTogaHR0cC5TZXJ2ZXJSZXNwb25zZSwgbmV4dDogKCkgPT4gdm9pZCkge1xuICAgIGlmICh3ZWJwYWNrTWlkZGxld2FyZSkge1xuICAgICAgaWYgKHJlcXVlc3QudXJsICYmICFuZXcgUmVnRXhwKGBcXFxcLyR7S0FSTUFfQVBQTElDQVRJT05fUEFUSH1cXFxcLy4qYCkudGVzdChyZXF1ZXN0LnVybCkpIHtcbiAgICAgICAgcmVxdWVzdC51cmwgPSAnLycgKyBLQVJNQV9BUFBMSUNBVElPTl9QQVRIICsgcmVxdWVzdC51cmw7XG4gICAgICB9XG4gICAgICB3ZWJwYWNrTWlkZGxld2FyZShyZXF1ZXN0LCByZXNwb25zZSwgKCkgPT4ge1xuICAgICAgICBjb25zdCBhbHdheXNTZXJ2ZSA9IFtcbiAgICAgICAgICBgLyR7S0FSTUFfQVBQTElDQVRJT05fUEFUSH0vcnVudGltZS5qc2AsXG4gICAgICAgICAgYC8ke0tBUk1BX0FQUExJQ0FUSU9OX1BBVEh9L3BvbHlmaWxscy5qc2AsXG4gICAgICAgICAgYC8ke0tBUk1BX0FQUExJQ0FUSU9OX1BBVEh9L3NjcmlwdHMuanNgLFxuICAgICAgICAgIGAvJHtLQVJNQV9BUFBMSUNBVElPTl9QQVRIfS9zdHlsZXMuY3NzYCxcbiAgICAgICAgICBgLyR7S0FSTUFfQVBQTElDQVRJT05fUEFUSH0vdmVuZG9yLmpzYCxcbiAgICAgICAgXTtcbiAgICAgICAgaWYgKHJlcXVlc3QudXJsICYmIGFsd2F5c1NlcnZlLmluY2x1ZGVzKHJlcXVlc3QudXJsKSkge1xuICAgICAgICAgIHJlc3BvbnNlLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICAgICAgcmVzcG9uc2UuZW5kKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dCgpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICdmcmFtZXdvcms6QGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXInOiBbJ2ZhY3RvcnknLCBpbml0XSxcbiAgJ3JlcG9ydGVyOkBhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyLS1zb3VyY2VtYXAtcmVwb3J0ZXInOiBbJ3R5cGUnLCBzb3VyY2VNYXBSZXBvcnRlcl0sXG4gICdyZXBvcnRlcjpAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhci0tZXZlbnQtcmVwb3J0ZXInOiBbJ3R5cGUnLCBldmVudFJlcG9ydGVyXSxcbiAgJ21pZGRsZXdhcmU6QGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXItLWJsb2NrZXInOiBbJ2ZhY3RvcnknLCByZXF1ZXN0QmxvY2tlcl0sXG4gICdtaWRkbGV3YXJlOkBhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyLS1mYWxsYmFjayc6IFsnZmFjdG9yeScsIGZhbGxiYWNrTWlkZGxld2FyZV0sXG59O1xuIl19