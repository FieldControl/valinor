"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWebpackDevServer = void 0;
const architect_1 = require("@angular-devkit/architect");
const path_1 = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const utils_1 = require("../utils");
function runWebpackDevServer(config, context, options = {}) {
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
    const createWebpackDevServer = (webpack, config) => {
        if (options.webpackDevServerFactory) {
            // webpack-dev-server types currently do not support Webpack 5
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new options.webpackDevServerFactory(webpack, config);
        }
        // webpack-dev-server types currently do not support Webpack 5
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new WebpackDevServer(webpack, config);
    };
    const log = options.logging || ((stats, config) => context.logger.info(stats.toString(config.stats)));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const devServerConfig = options.devServerConfig || config.devServer || {};
    if (devServerConfig.stats) {
        config.stats = devServerConfig.stats;
    }
    // Disable stats reporting by the devserver, we have our own logger.
    devServerConfig.stats = false;
    return createWebpack({ ...config, watch: false }).pipe(operators_1.switchMap((webpackCompiler) => new rxjs_1.Observable((obs) => {
        const server = createWebpackDevServer(webpackCompiler, devServerConfig);
        let result;
        webpackCompiler.hooks.done.tap('build-webpack', (stats) => {
            // Log stats.
            log(stats, config);
            obs.next({
                ...result,
                emittedFiles: utils_1.getEmittedFiles(stats.compilation),
                success: !stats.hasErrors(),
                outputPath: stats.compilation.outputOptions.path,
            });
        });
        server.listen(devServerConfig.port === undefined ? 8080 : devServerConfig.port, devServerConfig.host === undefined ? 'localhost' : devServerConfig.host, function (err) {
            if (err) {
                obs.error(err);
            }
            else {
                const address = this.address();
                if (!address) {
                    obs.error(new Error(`Dev-server address info is not defined.`));
                    return;
                }
                result = {
                    success: true,
                    port: typeof address === 'string' ? 0 : address.port,
                    family: typeof address === 'string' ? '' : address.family,
                    address: typeof address === 'string' ? address : address.address,
                };
            }
        });
        // Teardown logic. Close the server when unsubscribed from.
        return () => {
            var _a;
            server.close();
            (_a = webpackCompiler.close) === null || _a === void 0 ? void 0 : _a.call(webpackCompiler, () => { });
        };
    })));
}
exports.runWebpackDevServer = runWebpackDevServer;
exports.default = architect_1.createBuilder((options, context) => {
    const configPath = path_1.resolve(context.workspaceRoot, options.webpackConfig);
    return rxjs_1.from(Promise.resolve().then(() => require(configPath))).pipe(operators_1.switchMap((config) => runWebpackDevServer(config, context)));
});
