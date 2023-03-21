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
exports.runWebpackDevServer = void 0;
const architect_1 = require("@angular-devkit/architect");
const path_1 = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const webpack_1 = __importDefault(require("webpack"));
const webpack_dev_server_1 = __importDefault(require("webpack-dev-server"));
const utils_1 = require("../utils");
function runWebpackDevServer(config, context, options = {}) {
    var _a;
    const createWebpack = (c) => {
        if (options.webpackFactory) {
            const result = options.webpackFactory(c);
            if ((0, rxjs_1.isObservable)(result)) {
                return result;
            }
            else {
                return (0, rxjs_1.of)(result);
            }
        }
        else {
            return (0, rxjs_1.of)((0, webpack_1.default)(c));
        }
    };
    const createWebpackDevServer = (webpack, config) => {
        if (options.webpackDevServerFactory) {
            return new options.webpackDevServerFactory(config, webpack);
        }
        return new webpack_dev_server_1.default(config, webpack);
    };
    const log = options.logging || ((stats, config) => context.logger.info(stats.toString(config.stats)));
    const shouldProvideStats = (_a = options.shouldProvideStats) !== null && _a !== void 0 ? _a : true;
    return createWebpack({ ...config, watch: false }).pipe((0, operators_1.switchMap)((webpackCompiler) => new rxjs_1.Observable((obs) => {
        var _a;
        const devServerConfig = options.devServerConfig || config.devServer || {};
        (_a = devServerConfig.host) !== null && _a !== void 0 ? _a : (devServerConfig.host = 'localhost');
        let result;
        const statsOptions = typeof config.stats === 'boolean' ? undefined : config.stats;
        webpackCompiler.hooks.done.tap('build-webpack', (stats) => {
            // Log stats.
            log(stats, config);
            obs.next({
                ...result,
                webpackStats: shouldProvideStats ? stats.toJson(statsOptions) : undefined,
                emittedFiles: (0, utils_1.getEmittedFiles)(stats.compilation),
                success: !stats.hasErrors(),
                outputPath: stats.compilation.outputOptions.path,
            });
        });
        const devServer = createWebpackDevServer(webpackCompiler, devServerConfig);
        devServer.startCallback((err) => {
            var _a;
            if (err) {
                obs.error(err);
                return;
            }
            const address = (_a = devServer.server) === null || _a === void 0 ? void 0 : _a.address();
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
        });
        // Teardown logic. Close the server when unsubscribed from.
        return () => {
            devServer.stopCallback(() => { });
            webpackCompiler.close(() => { });
        };
    })));
}
exports.runWebpackDevServer = runWebpackDevServer;
exports.default = (0, architect_1.createBuilder)((options, context) => {
    const configPath = (0, path_1.resolve)(context.workspaceRoot, options.webpackConfig);
    return (0, rxjs_1.from)((0, utils_1.getWebpackConfig)(configPath)).pipe((0, operators_1.switchMap)((config) => runWebpackDevServer(config, context)));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF93ZWJwYWNrL3NyYy93ZWJwYWNrLWRldi1zZXJ2ZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7O0FBRUgseURBQTBFO0FBQzFFLCtCQUE4QztBQUM5QywrQkFBMEQ7QUFDMUQsOENBQTJDO0FBQzNDLHNEQUE4QjtBQUM5Qiw0RUFBa0Q7QUFDbEQsb0NBQTZEO0FBWTdELFNBQWdCLG1CQUFtQixDQUNqQyxNQUE2QixFQUM3QixPQUF1QixFQUN2QixVQU1JLEVBQUU7O0lBRU4sTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUF3QixFQUFFLEVBQUU7UUFDakQsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFO1lBQzFCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekMsSUFBSSxJQUFBLG1CQUFZLEVBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU8sTUFBTSxDQUFDO2FBQ2Y7aUJBQU07Z0JBQ0wsT0FBTyxJQUFBLFNBQUUsRUFBQyxNQUFNLENBQUMsQ0FBQzthQUNuQjtTQUNGO2FBQU07WUFDTCxPQUFPLElBQUEsU0FBRSxFQUFDLElBQUEsaUJBQU8sRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3ZCO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsTUFBTSxzQkFBc0IsR0FBRyxDQUM3QixPQUFpRCxFQUNqRCxNQUFzQyxFQUN0QyxFQUFFO1FBQ0YsSUFBSSxPQUFPLENBQUMsdUJBQXVCLEVBQUU7WUFDbkMsT0FBTyxJQUFJLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDN0Q7UUFFRCxPQUFPLElBQUksNEJBQWdCLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFD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LE9BQU8sR0FBRyxFQUFFO1lBQ1YsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUMsQ0FBQztZQUNqQyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUNMLENBQ0YsQ0FBQztBQUNKLENBQUM7QUE5RkQsa0RBOEZDO0FBRUQsa0JBQWUsSUFBQSx5QkFBYSxFQUMxQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRTtJQUNuQixNQUFNLFVBQVUsR0FBRyxJQUFBLGNBQVcsRUFBQyxPQUFPLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUU3RSxPQUFPLElBQUEsV0FBSSxFQUFDLElBQUEsd0JBQWdCLEVBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQzVDLElBQUEscUJBQVMsRUFBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQzVELENBQUM7QUFDSixDQUFDLENBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBCdWlsZGVyQ29udGV4dCwgY3JlYXRlQnVpbGRlciB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9hcmNoaXRlY3QnO1xuaW1wb3J0IHsgcmVzb2x2ZSBhcyBwYXRoUmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbSwgaXNPYnNlcnZhYmxlLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgc3dpdGNoTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHdlYnBhY2sgZnJvbSAnd2VicGFjayc7XG5pbXBvcnQgV2VicGFja0RldlNlcnZlciBmcm9tICd3ZWJwYWNrLWRldi1zZXJ2ZXInO1xuaW1wb3J0IHsgZ2V0RW1pdHRlZEZpbGVzLCBnZXRXZWJwYWNrQ29uZmlnIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgQnVpbGRSZXN1bHQsIFdlYnBhY2tGYWN0b3J5LCBXZWJwYWNrTG9nZ2luZ0NhbGxiYWNrIH0gZnJvbSAnLi4vd2VicGFjayc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgV2VicGFja0RldlNlcnZlckJ1aWxkZXJTY2hlbWEgfSBmcm9tICcuL3NjaGVtYSc7XG5cbmV4cG9ydCB0eXBlIFdlYnBhY2tEZXZTZXJ2ZXJGYWN0b3J5ID0gdHlwZW9mIFdlYnBhY2tEZXZTZXJ2ZXI7XG5cbmV4cG9ydCB0eXBlIERldlNlcnZlckJ1aWxkT3V0cHV0ID0gQnVpbGRSZXN1bHQgJiB7XG4gIHBvcnQ6IG51bWJlcjtcbiAgZmFtaWx5OiBzdHJpbmc7XG4gIGFkZHJlc3M6IHN0cmluZztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBydW5XZWJwYWNrRGV2U2VydmVyKFxuICBjb25maWc6IHdlYnBhY2suQ29uZmlndXJhdGlvbixcbiAgY29udGV4dDogQnVpbGRlckNvbnRleHQsXG4gIG9wdGlvbnM6IHtcbiAgICBzaG91bGRQcm92aWRlU3RhdHM/OiBib29sZWFuO1xuICAgIGRldlNlcnZlckNvbmZpZz86IFdlYnBhY2tEZXZTZXJ2ZXIuQ29uZmlndXJhdGlvbjtcbiAgICBsb2dnaW5nPzogV2VicGFja0xvZ2dpbmdDYWxsYmFjaztcbiAgICB3ZWJwYWNrRmFjdG9yeT86IFdlYnBhY2tGYWN0b3J5O1xuICAgIHdlYnBhY2tEZXZTZXJ2ZXJGYWN0b3J5PzogV2VicGFja0RldlNlcnZlckZhY3Rvcnk7XG4gIH0gPSB7fSxcbik6IE9ic2VydmFibGU8RGV2U2VydmVyQnVpbGRPdXRwdXQ+IHtcbiAgY29uc3QgY3JlYXRlV2VicGFjayA9IChjOiB3ZWJwYWNrLkNvbmZpZ3VyYXRpb24pID0+IHtcbiAgICBpZiAob3B0aW9ucy53ZWJwYWNrRmFjdG9yeSkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gb3B0aW9ucy53ZWJwYWNrRmFjdG9yeShjKTtcbiAgICAgIGlmIChpc09ic2VydmFibGUocmVzdWx0KSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG9mKHJlc3VsdCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvZih3ZWJwYWNrKGMpKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgY3JlYXRlV2VicGFja0RldlNlcnZlciA9IChcbiAgICB3ZWJwYWNrOiB3ZWJwYWNrLkNvbXBpbGVyIHwgd2VicGFjay5NdWx0aUNvbXBpbGVyLFxuICAgIGNvbmZpZzogV2VicGFja0RldlNlcnZlci5Db25maWd1cmF0aW9uLFxuICApID0+IHtcbiAgICBpZiAob3B0aW9ucy53ZWJwYWNrRGV2U2VydmVyRmFjdG9yeSkge1xuICAgICAgcmV0dXJuIG5ldyBvcHRpb25zLndlYnBhY2tEZXZTZXJ2ZXJGYWN0b3J5KGNvbmZpZywgd2VicGFjayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBXZWJwYWNrRGV2U2VydmVyKGNvbmZpZywgd2VicGFjayk7XG4gIH07XG5cbiAgY29uc3QgbG9nOiBXZWJwYWNrTG9nZ2luZ0NhbGxiYWNrID1cbiAgICBvcHRpb25zLmxvZ2dpbmcgfHwgKChzdGF0cywgY29uZmlnKSA9PiBjb250ZXh0LmxvZ2dlci5pbmZvKHN0YXRzLnRvU3RyaW5nKGNvbmZpZy5zdGF0cykpKTtcblxuICBjb25zdCBzaG91bGRQcm92aWRlU3RhdHMgPSBvcHRpb25zLnNob3VsZFByb3ZpZGVTdGF0cyA/PyB0cnVlO1xuXG4gIHJldHVybiBjcmVhdGVXZWJwYWNrKHsgLi4uY29uZmlnLCB3YXRjaDogZmFsc2UgfSkucGlwZShcbiAgICBzd2l0Y2hNYXAoXG4gICAgICAod2VicGFja0NvbXBpbGVyKSA9PlxuICAgICAgICBuZXcgT2JzZXJ2YWJsZTxEZXZTZXJ2ZXJCdWlsZE91dHB1dD4oKG9icykgPT4ge1xuICAgICAgICAgIGNvbnN0IGRldlNlcnZlckNvbmZpZyA9IG9wdGlvbnMuZGV2U2VydmVyQ29uZmlnIHx8IGNvbmZpZy5kZXZTZXJ2ZXIgfHwge307XG4gICAgICAgICAgZGV2U2VydmVyQ29uZmlnLmhvc3QgPz89ICdsb2NhbGhvc3QnO1xuXG4gICAgICAgICAgbGV0IHJlc3VsdDogUGFydGlhbDxEZXZTZXJ2ZXJCdWlsZE91dHB1dD47XG5cbiAgICAgICAgICBjb25zdCBzdGF0c09wdGlvbnMgPSB0eXBlb2YgY29uZmlnLnN0YXRzID09PSAnYm9vbGVhbicgPyB1bmRlZmluZWQgOiBjb25maWcuc3RhdHM7XG5cbiAgICAgICAgICB3ZWJwYWNrQ29tcGlsZXIuaG9va3MuZG9uZS50YXAoJ2J1aWxkLXdlYnBhY2snLCAoc3RhdHMpID0+IHtcbiAgICAgICAgICAgIC8vIExvZyBzdGF0cy5cbiAgICAgICAgICAgIGxvZyhzdGF0cywgY29uZmlnKTtcbiAgICAgICAgICAgIG9icy5uZXh0KHtcbiAgICAgICAgICAgICAgLi4ucmVzdWx0LFxuICAgICAgICAgICAgICB3ZWJwYWNrU3RhdHM6IHNob3VsZFByb3ZpZGVTdGF0cyA/IHN0YXRzLnRvSnNvbihzdGF0c09wdGlvbnMpIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICBlbWl0dGVkRmlsZXM6IGdldEVtaXR0ZWRGaWxlcyhzdGF0cy5jb21waWxhdGlvbiksXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6ICFzdGF0cy5oYXNFcnJvcnMoKSxcbiAgICAgICAgICAgICAgb3V0cHV0UGF0aDogc3RhdHMuY29tcGlsYXRpb24ub3V0cHV0T3B0aW9ucy5wYXRoLFxuICAgICAgICAgICAgfSBhcyB1bmtub3duIGFzIERldlNlcnZlckJ1aWxkT3V0cHV0KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGNvbnN0IGRldlNlcnZlciA9IGNyZWF0ZVdlYnBhY2tEZXZTZXJ2ZXIod2VicGFja0NvbXBpbGVyLCBkZXZTZXJ2ZXJDb25maWcpO1xuICAgICAgICAgIGRldlNlcnZlci5zdGFydENhbGxiYWNrKChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgb2JzLmVycm9yKGVycik7XG5cbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBhZGRyZXNzID0gZGV2U2VydmVyLnNlcnZlcj8uYWRkcmVzcygpO1xuICAgICAgICAgICAgaWYgKCFhZGRyZXNzKSB7XG4gICAgICAgICAgICAgIG9icy5lcnJvcihuZXcgRXJyb3IoYERldi1zZXJ2ZXIgYWRkcmVzcyBpbmZvIGlzIG5vdCBkZWZpbmVkLmApKTtcblxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgcG9ydDogdHlwZW9mIGFkZHJlc3MgPT09ICdzdHJpbmcnID8gMCA6IGFkZHJlc3MucG9ydCxcbiAgICAgICAgICAgICAgZmFtaWx5OiB0eXBlb2YgYWRkcmVzcyA9PT0gJ3N0cmluZycgPyAnJyA6IGFkZHJlc3MuZmFtaWx5LFxuICAgICAgICAgICAgICBhZGRyZXNzOiB0eXBlb2YgYWRkcmVzcyA9PT0gJ3N0cmluZycgPyBhZGRyZXNzIDogYWRkcmVzcy5hZGRyZXNzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIFRlYXJkb3duIGxvZ2ljLiBDbG9zZSB0aGUgc2VydmVyIHdoZW4gdW5zdWJzY3JpYmVkIGZyb20uXG4gICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGRldlNlcnZlci5zdG9wQ2FsbGJhY2soKCkgPT4ge30pO1xuICAgICAgICAgICAgd2VicGFja0NvbXBpbGVyLmNsb3NlKCgpID0+IHt9KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICApLFxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVCdWlsZGVyPFdlYnBhY2tEZXZTZXJ2ZXJCdWlsZGVyU2NoZW1hLCBEZXZTZXJ2ZXJCdWlsZE91dHB1dD4oXG4gIChvcHRpb25zLCBjb250ZXh0KSA9PiB7XG4gICAgY29uc3QgY29uZmlnUGF0aCA9IHBhdGhSZXNvbHZlKGNvbnRleHQud29ya3NwYWNlUm9vdCwgb3B0aW9ucy53ZWJwYWNrQ29uZmlnKTtcblxuICAgIHJldHVybiBmcm9tKGdldFdlYnBhY2tDb25maWcoY29uZmlnUGF0aCkpLnBpcGUoXG4gICAgICBzd2l0Y2hNYXAoKGNvbmZpZykgPT4gcnVuV2VicGFja0RldlNlcnZlcihjb25maWcsIGNvbnRleHQpKSxcbiAgICApO1xuICB9LFxuKTtcbiJdfQ==