"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWebpack = void 0;
const architect_1 = require("@angular-devkit/architect");
const path_1 = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const webpack = require("webpack");
const utils_1 = require("../utils");
function runWebpack(config, context, options = {}) {
    const { logging: log = (stats, config) => context.logger.info(stats.toString(config.stats)), shouldProvideStats = true, } = options;
    const createWebpack = (c) => {
        if (options.webpackFactory) {
            const result = options.webpackFactory(c);
            if (rxjs_1.isObservable(result)) {
                return result;
            }
            else {
                return rxjs_1.of(result);
            }
        }
        else {
            return rxjs_1.of(webpack(c));
        }
    };
    return createWebpack({ ...config, watch: false }).pipe(operators_1.switchMap((webpackCompiler) => new rxjs_1.Observable((obs) => {
        var _a;
        // Webpack 5 has a compiler level close function
        const compilerClose = (_a = webpackCompiler.close) === null || _a === void 0 ? void 0 : _a.bind(webpackCompiler);
        const callback = (err, stats) => {
            if (err) {
                return obs.error(err);
            }
            if (!stats) {
                return;
            }
            // Log stats.
            log(stats, config);
            obs.next({
                success: !stats.hasErrors(),
                webpackStats: shouldProvideStats ? stats.toJson() : undefined,
                emittedFiles: utils_1.getEmittedFiles(stats.compilation),
                outputPath: stats.compilation.outputOptions.path,
            });
            if (!config.watch) {
                if (compilerClose) {
                    compilerClose(() => obs.complete());
                }
                else {
                    obs.complete();
                }
            }
        };
        try {
            if (config.watch) {
                const watchOptions = config.watchOptions || {};
                const watching = webpackCompiler.watch(watchOptions, callback);
                // Teardown logic. Close the watcher when unsubscribed from.
                return () => {
                    watching.close(() => { });
                    compilerClose === null || compilerClose === void 0 ? void 0 : compilerClose(() => { });
                };
            }
            else {
                webpackCompiler.run(callback);
            }
        }
        catch (err) {
            if (err) {
                context.logger.error(`\nAn error occurred during the build:\n${(err && err.stack) || err}`);
            }
            throw err;
        }
    })));
}
exports.runWebpack = runWebpack;
exports.default = architect_1.createBuilder((options, context) => {
    const configPath = path_1.resolve(context.workspaceRoot, options.webpackConfig);
    return rxjs_1.from(Promise.resolve().then(() => require(configPath))).pipe(operators_1.switchMap((config) => runWebpack(config, context)));
});
