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
exports.runWebpack = void 0;
const architect_1 = require("@angular-devkit/architect");
const path_1 = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const webpack_1 = __importDefault(require("webpack"));
const utils_1 = require("../utils");
function runWebpack(config, context, options = {}) {
    const { logging: log = (stats, config) => context.logger.info(stats.toString(config.stats)), shouldProvideStats = true, } = options;
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
    return createWebpack({ ...config, watch: false }).pipe((0, operators_1.switchMap)((webpackCompiler) => new rxjs_1.Observable((obs) => {
        const callback = (err, stats) => {
            if (err) {
                return obs.error(err);
            }
            if (!stats) {
                return;
            }
            // Log stats.
            log(stats, config);
            const statsOptions = typeof config.stats === 'boolean' ? undefined : config.stats;
            const result = {
                success: !stats.hasErrors(),
                webpackStats: shouldProvideStats ? stats.toJson(statsOptions) : undefined,
                emittedFiles: (0, utils_1.getEmittedFiles)(stats.compilation),
                outputPath: stats.compilation.outputOptions.path,
            };
            if (config.watch) {
                obs.next(result);
            }
            else {
                webpackCompiler.close(() => {
                    obs.next(result);
                    obs.complete();
                });
            }
        };
        try {
            if (config.watch) {
                const watchOptions = config.watchOptions || {};
                const watching = webpackCompiler.watch(watchOptions, callback);
                // Teardown logic. Close the watcher when unsubscribed from.
                return () => {
                    watching.close(() => { });
                    webpackCompiler.close(() => { });
                };
            }
            else {
                webpackCompiler.run(callback);
            }
        }
        catch (err) {
            if (err) {
                context.logger.error(`\nAn error occurred during the build:\n${err instanceof Error ? err.stack : err}`);
            }
            throw err;
        }
    })));
}
exports.runWebpack = runWebpack;
exports.default = (0, architect_1.createBuilder)((options, context) => {
    const configPath = (0, path_1.resolve)(context.workspaceRoot, options.webpackConfig);
    return (0, rxjs_1.from)((0, utils_1.getWebpackConfig)(configPath)).pipe((0, operators_1.switchMap)((config) => runWebpack(config, context)));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF93ZWJwYWNrL3NyYy93ZWJwYWNrL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7OztBQUVILHlEQUF5RjtBQUN6RiwrQkFBOEM7QUFDOUMsK0JBQTBEO0FBQzFELDhDQUEyQztBQUMzQyxzREFBOEI7QUFDOUIsb0NBQTJFO0FBa0IzRSxTQUFnQixVQUFVLENBQ3hCLE1BQTZCLEVBQzdCLE9BQXVCLEVBQ3ZCLFVBSUksRUFBRTtJQUVOLE1BQU0sRUFDSixPQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDbkYsa0JBQWtCLEdBQUcsSUFBSSxHQUMxQixHQUFHLE9BQU8sQ0FBQztJQUNaLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBd0IsRUFBRSxFQUFFO1FBQ2pELElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRTtZQUMxQixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksSUFBQSxtQkFBWSxFQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN4QixPQUFPLE1BQU0sQ0FBQzthQUNmO2lCQUFNO2dCQUNMLE9BQU8sSUFBQSxTQUFFLEVBQUMsTUFBTSxDQUFDLENBQUM7YUFDbkI7U0FDRjthQUFNO1lBQ0wsT0FBTyxJQUFBLFNBQUUsRUFBQyxJQUFBLGlCQUFPLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN2QjtJQUNILENBQUMsQ0FBQztJQUVGLE9BQU8sYUFBYSxDQUFDLEVBQUUsR0FBRyxNQUFNLEVBQUUsS0FBSyxF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RUFBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUNuRCxDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgQnVpbGRlckNvbnRleHQsIEJ1aWxkZXJPdXRwdXQsIGNyZWF0ZUJ1aWxkZXIgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvYXJjaGl0ZWN0JztcbmltcG9ydCB7IHJlc29sdmUgYXMgcGF0aFJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IE9ic2VydmFibGUsIGZyb20sIGlzT2JzZXJ2YWJsZSwgb2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IHN3aXRjaE1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB3ZWJwYWNrIGZyb20gJ3dlYnBhY2snO1xuaW1wb3J0IHsgRW1pdHRlZEZpbGVzLCBnZXRFbWl0dGVkRmlsZXMsIGdldFdlYnBhY2tDb25maWcgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgUmVhbFdlYnBhY2tCdWlsZGVyU2NoZW1hIH0gZnJvbSAnLi9zY2hlbWEnO1xuXG5leHBvcnQgdHlwZSBXZWJwYWNrQnVpbGRlclNjaGVtYSA9IFJlYWxXZWJwYWNrQnVpbGRlclNjaGVtYTtcblxuZXhwb3J0IGludGVyZmFjZSBXZWJwYWNrTG9nZ2luZ0NhbGxiYWNrIHtcbiAgKHN0YXRzOiB3ZWJwYWNrLlN0YXRzLCBjb25maWc6IHdlYnBhY2suQ29uZmlndXJhdGlvbik6IHZvaWQ7XG59XG5leHBvcnQgaW50ZXJmYWNlIFdlYnBhY2tGYWN0b3J5IHtcbiAgKGNvbmZpZzogd2VicGFjay5Db25maWd1cmF0aW9uKTogT2JzZXJ2YWJsZTx3ZWJwYWNrLkNvbXBpbGVyPiB8IHdlYnBhY2suQ29tcGlsZXI7XG59XG5cbmV4cG9ydCB0eXBlIEJ1aWxkUmVzdWx0ID0gQnVpbGRlck91dHB1dCAmIHtcbiAgZW1pdHRlZEZpbGVzPzogRW1pdHRlZEZpbGVzW107XG4gIHdlYnBhY2tTdGF0cz86IHdlYnBhY2suU3RhdHNDb21waWxhdGlvbjtcbiAgb3V0cHV0UGF0aDogc3RyaW5nO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJ1bldlYnBhY2soXG4gIGNvbmZpZzogd2VicGFjay5Db25maWd1cmF0aW9uLFxuICBjb250ZXh0OiBCdWlsZGVyQ29udGV4dCxcbiAgb3B0aW9uczoge1xuICAgIGxvZ2dpbmc/OiBXZWJwYWNrTG9nZ2luZ0NhbGxiYWNrO1xuICAgIHdlYnBhY2tGYWN0b3J5PzogV2VicGFja0ZhY3Rvcnk7XG4gICAgc2hvdWxkUHJvdmlkZVN0YXRzPzogYm9vbGVhbjtcbiAgfSA9IHt9LFxuKTogT2JzZXJ2YWJsZTxCdWlsZFJlc3VsdD4ge1xuICBjb25zdCB7XG4gICAgbG9nZ2luZzogbG9nID0gKHN0YXRzLCBjb25maWcpID0+IGNvbnRleHQubG9nZ2VyLmluZm8oc3RhdHMudG9TdHJpbmcoY29uZmlnLnN0YXRzKSksXG4gICAgc2hvdWxkUHJvdmlkZVN0YXRzID0gdHJ1ZSxcbiAgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IGNyZWF0ZVdlYnBhY2sgPSAoYzogd2VicGFjay5Db25maWd1cmF0aW9uKSA9PiB7XG4gICAgaWYgKG9wdGlvbnMud2VicGFja0ZhY3RvcnkpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IG9wdGlvbnMud2VicGFja0ZhY3RvcnkoYyk7XG4gICAgICBpZiAoaXNPYnNlcnZhYmxlKHJlc3VsdCkpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBvZihyZXN1bHQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb2Yod2VicGFjayhjKSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBjcmVhdGVXZWJwYWNrKHsgLi4uY29uZmlnLCB3YXRjaDogZmFsc2UgfSkucGlwZShcbiAgICBzd2l0Y2hNYXAoXG4gICAgICAod2VicGFja0NvbXBpbGVyKSA9PlxuICAgICAgICBuZXcgT2JzZXJ2YWJsZTxCdWlsZFJlc3VsdD4oKG9icykgPT4ge1xuICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gKGVycj86IEVycm9yIHwgbnVsbCwgc3RhdHM/OiB3ZWJwYWNrLlN0YXRzKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBvYnMuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFzdGF0cykge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExvZyBzdGF0cy5cbiAgICAgICAgICAgIGxvZyhzdGF0cywgY29uZmlnKTtcblxuICAgICAgICAgICAgY29uc3Qgc3RhdHNPcHRpb25zID0gdHlwZW9mIGNvbmZpZy5zdGF0cyA9PT0gJ2Jvb2xlYW4nID8gdW5kZWZpbmVkIDogY29uZmlnLnN0YXRzO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICBzdWNjZXNzOiAhc3RhdHMuaGFzRXJyb3JzKCksXG4gICAgICAgICAgICAgIHdlYnBhY2tTdGF0czogc2hvdWxkUHJvdmlkZVN0YXRzID8gc3RhdHMudG9Kc29uKHN0YXRzT3B0aW9ucykgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgIGVtaXR0ZWRGaWxlczogZ2V0RW1pdHRlZEZpbGVzKHN0YXRzLmNvbXBpbGF0aW9uKSxcbiAgICAgICAgICAgICAgb3V0cHV0UGF0aDogc3RhdHMuY29tcGlsYXRpb24ub3V0cHV0T3B0aW9ucy5wYXRoLFxuICAgICAgICAgICAgfSBhcyB1bmtub3duIGFzIEJ1aWxkUmVzdWx0O1xuXG4gICAgICAgICAgICBpZiAoY29uZmlnLndhdGNoKSB7XG4gICAgICAgICAgICAgIG9icy5uZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB3ZWJwYWNrQ29tcGlsZXIuY2xvc2UoKCkgPT4ge1xuICAgICAgICAgICAgICAgIG9icy5uZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgb2JzLmNvbXBsZXRlKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGNvbmZpZy53YXRjaCkge1xuICAgICAgICAgICAgICBjb25zdCB3YXRjaE9wdGlvbnMgPSBjb25maWcud2F0Y2hPcHRpb25zIHx8IHt9O1xuICAgICAgICAgICAgICBjb25zdCB3YXRjaGluZyA9IHdlYnBhY2tDb21waWxlci53YXRjaCh3YXRjaE9wdGlvbnMsIGNhbGxiYWNrKTtcblxuICAgICAgICAgICAgICAvLyBUZWFyZG93biBsb2dpYy4gQ2xvc2UgdGhlIHdhdGNoZXIgd2hlbiB1bnN1YnNjcmliZWQgZnJvbS5cbiAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICB3YXRjaGluZy5jbG9zZSgoKSA9PiB7fSk7XG4gICAgICAgICAgICAgICAgd2VicGFja0NvbXBpbGVyLmNsb3NlKCgpID0+IHt9KTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHdlYnBhY2tDb21waWxlci5ydW4oY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICBjb250ZXh0LmxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICBgXFxuQW4gZXJyb3Igb2NjdXJyZWQgZHVyaW5nIHRoZSBidWlsZDpcXG4ke2VyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLnN0YWNrIDogZXJyfWAsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICApLFxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVCdWlsZGVyPFdlYnBhY2tCdWlsZGVyU2NoZW1hPigob3B0aW9ucywgY29udGV4dCkgPT4ge1xuICBjb25zdCBjb25maWdQYXRoID0gcGF0aFJlc29sdmUoY29udGV4dC53b3Jrc3BhY2VSb290LCBvcHRpb25zLndlYnBhY2tDb25maWcpO1xuXG4gIHJldHVybiBmcm9tKGdldFdlYnBhY2tDb25maWcoY29uZmlnUGF0aCkpLnBpcGUoXG4gICAgc3dpdGNoTWFwKChjb25maWcpID0+IHJ1bldlYnBhY2soY29uZmlnLCBjb250ZXh0KSksXG4gICk7XG59KTtcbiJdfQ==