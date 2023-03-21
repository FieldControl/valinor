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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndexInputFile = exports.getIndexOutputFile = exports.generateBrowserWebpackConfigFromContext = exports.generateI18nBrowserWebpackConfigFromContext = exports.generateWebpackConfig = void 0;
const path = __importStar(require("path"));
const webpack_1 = require("webpack");
const webpack_merge_1 = require("webpack-merge");
const utils_1 = require("../utils");
const read_tsconfig_1 = require("../utils/read-tsconfig");
const builder_watch_plugin_1 = require("../webpack/plugins/builder-watch-plugin");
const i18n_options_1 = require("./i18n-options");
async function generateWebpackConfig(workspaceRoot, projectRoot, sourceRoot, projectName, options, webpackPartialGenerator, logger, extraBuildOptions) {
    // Ensure Build Optimizer is only used with AOT.
    if (options.buildOptimizer && !options.aot) {
        throw new Error(`The 'buildOptimizer' option cannot be used without 'aot'.`);
    }
    const tsConfigPath = path.resolve(workspaceRoot, options.tsConfig);
    const tsConfig = await (0, read_tsconfig_1.readTsconfig)(tsConfigPath);
    const buildOptions = { ...options, ...extraBuildOptions };
    const wco = {
        root: workspaceRoot,
        logger: logger.createChild('webpackConfigOptions'),
        projectRoot,
        sourceRoot,
        buildOptions,
        tsConfig,
        tsConfigPath,
        projectName,
    };
    wco.buildOptions.progress = (0, utils_1.defaultProgress)(wco.buildOptions.progress);
    const partials = await Promise.all(webpackPartialGenerator(wco));
    const webpackConfig = (0, webpack_merge_1.merge)(partials);
    return webpackConfig;
}
exports.generateWebpackConfig = generateWebpackConfig;
async function generateI18nBrowserWebpackConfigFromContext(options, context, webpackPartialGenerator, extraBuildOptions = {}) {
    var _a;
    const { buildOptions, i18n } = await (0, i18n_options_1.configureI18nBuild)(context, options);
    const result = await generateBrowserWebpackConfigFromContext(buildOptions, context, (wco) => {
        return webpackPartialGenerator(wco);
    }, extraBuildOptions);
    const config = result.config;
    if (i18n.shouldInline) {
        // Remove localize "polyfill" if in AOT mode
        if (buildOptions.aot) {
            if (!config.resolve) {
                config.resolve = {};
            }
            if (Array.isArray(config.resolve.alias)) {
                config.resolve.alias.push({
                    name: '@angular/localize/init',
                    alias: false,
                });
            }
            else {
                if (!config.resolve.alias) {
                    config.resolve.alias = {};
                }
                config.resolve.alias['@angular/localize/init'] = false;
            }
        }
        // Update file hashes to include translation file content
        const i18nHash = Object.values(i18n.locales).reduce((data, locale) => data + locale.files.map((file) => file.integrity || '').join('|'), '');
        (_a = config.plugins) !== null && _a !== void 0 ? _a : (config.plugins = []);
        config.plugins.push({
            apply(compiler) {
                compiler.hooks.compilation.tap('build-angular', (compilation) => {
                    webpack_1.javascript.JavascriptModulesPlugin.getCompilationHooks(compilation).chunkHash.tap('build-angular', (_, hash) => {
                        hash.update('$localize' + i18nHash);
                    });
                });
            },
        });
    }
    return { ...result, i18n };
}
exports.generateI18nBrowserWebpackConfigFromContext = generateI18nBrowserWebpackConfigFromContext;
async function generateBrowserWebpackConfigFromContext(options, context, webpackPartialGenerator, extraBuildOptions = {}) {
    var _a;
    const projectName = context.target && context.target.project;
    if (!projectName) {
        throw new Error('The builder requires a target.');
    }
    const workspaceRoot = context.workspaceRoot;
    const projectMetadata = await context.getProjectMetadata(projectName);
    const projectRoot = path.join(workspaceRoot, (_a = projectMetadata.root) !== null && _a !== void 0 ? _a : '');
    const sourceRoot = projectMetadata.sourceRoot;
    const projectSourceRoot = sourceRoot ? path.join(workspaceRoot, sourceRoot) : undefined;
    const normalizedOptions = (0, utils_1.normalizeBrowserSchema)(workspaceRoot, projectRoot, projectSourceRoot, options, projectMetadata, context.logger);
    const config = await generateWebpackConfig(workspaceRoot, projectRoot, projectSourceRoot, projectName, normalizedOptions, webpackPartialGenerator, context.logger, extraBuildOptions);
    // If builder watch support is present in the context, add watch plugin
    // This is internal only and currently only used for testing
    const watcherFactory = context.watcherFactory;
    if (watcherFactory) {
        if (!config.plugins) {
            config.plugins = [];
        }
        config.plugins.push(new builder_watch_plugin_1.BuilderWatchPlugin(watcherFactory));
    }
    return {
        config,
        projectRoot,
        projectSourceRoot,
    };
}
exports.generateBrowserWebpackConfigFromContext = generateBrowserWebpackConfigFromContext;
function getIndexOutputFile(index) {
    if (typeof index === 'string') {
        return path.basename(index);
    }
    else {
        return index.output || 'index.html';
    }
}
exports.getIndexOutputFile = getIndexOutputFile;
function getIndexInputFile(index) {
    if (typeof index === 'string') {
        return index;
    }
    else {
        return index.input;
    }
}
exports.getIndexInputFile = getIndexInputFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VicGFjay1icm93c2VyLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL3V0aWxzL3dlYnBhY2stYnJvd3Nlci1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJSCwyQ0FBNkI7QUFDN0IscUNBQW9EO0FBQ3BELGlEQUFzRDtBQUV0RCxvQ0FBbUc7QUFFbkcsMERBQXNEO0FBQ3RELGtGQUFvRztBQUNwRyxpREFBaUU7QUFRMUQsS0FBSyxVQUFVLHFCQUFxQixDQUN6QyxhQUFxQixFQUNyQixXQUFtQixFQUNuQixVQUE4QixFQUM5QixXQUFtQixFQUNuQixPQUF1QyxFQUN2Qyx1QkFBZ0QsRUFDaEQsTUFBeUIsRUFDekIsaUJBQTBEO0lBRTFELGdEQUFnRDtJQUNoRCxJQUFJLE9BQU8sQ0FBQyxjQUFjLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO1FBQzFDLE1BQU0sSUFBSSxLQUFLLENBQUMsMkRBQTJELENBQUMsQ0FBQztLQUM5RTtJQUVELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuRSxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsNEJBQVksRUFBQyxZQUFZLENBQUMsQ0FBQztJQUVsRCxNQUFNLFlBQVksR0FBbUMsRUFBRSxHQUFHLE9BQU8sRUFBRSxHQUFHLGlCQUFpQixFQUFFLENBQUM7SUFDMUYsTUFBTSxHQUFHLEdBQWdDO1FBQ3ZDLElBQUksRUFBRSxhQUFhO1FBQ25CLE1BQU0sRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDO1FBQ2xELFdBQVc7UUFDWCxVQUFVO1FBQ1YsWUFBWTtRQUNaLFFBQVE7UUFDUixZQUFZO1FBQ1osV0FBVztLQUNaLENBQUM7SUFFRixHQUFHLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRyxJQUFBLHVCQUFlLEVBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUV2RSxNQUFNLFFBQVEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNqRSxNQUFNLGFBQWEsR0FBRyxJQUFBLHFCQUFZLEVBQUMsUUFBUSxDQUFDLENBQUM7SUFFN0MsT0FBTyxhQUFhLENBQUM7QUFDdkIsQ0FBQztBQXBDRCxzREFvQ0M7QUFFTSxLQUFLLFVBQVUsMkNBQTJDLENBQy9ELE9BQTZCLEVBQzdCLE9BQXVCLEVBQ3ZCLHVCQUFnRCxFQUNoRCxvQkFBNkQsRUFBRTs7SUFPL0QsTUFBTSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLElBQUEsaUNBQWtCLEVBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzFFLE1BQU0sTUFBTSxHQUFHLE1BQU0sdUNBQXVDLENBQzFELFlBQVksRUFDWixPQUFPLEVBQ1AsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNOLE9BQU8sdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEMsQ0FBQyxFQUNELGlCQUFpQixDQUNsQixDQUFDO0lBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUU3QixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDckIsNENBQTRDO1FBQzVDLElBQUksWUFBWSxDQUFDLEdBQUcsRUFBRTtZQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7YUFDckI7WUFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDdkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUN4QixJQUFJLEVBQUUsd0JBQXdCO29CQUM5QixLQUFLLEVBQUUsS0FBSztpQkFDYixDQUFDLENBQUM7YUFDSjtpQkFBTTtnQkFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7b0JBQ3pCLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztpQkFDM0I7Z0JBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsR0FBRyxLQUFLLENBQUM7YUFDeEQ7U0FDRjtRQUVELHlEQUF5RDtRQUN6RCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQ2pELENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDbkYsRUFBRSxDQUNILENBQUM7UUFFRixNQUFBLE1BQU0sQ0FBQyxPQUFPLG9DQUFkLE1BQU0sQ0FBQyxPQUFPLEdBQUssRUFBRSxFQUFDO1FBQ3RCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ2xCLEtBQUssQ0FBQyxRQUFRO2dCQUNaLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRTtvQkFDOUQsb0JBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUMvRSxlQUFlLEVBQ2YsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7d0JBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLENBQUM7b0JBQ3RDLENBQUMsQ0FDRixDQUFDO2dCQUNKLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztTQUNGLENBQUMsQ0FBQztLQUNKO0lBRUQsT0FBTyxFQUFFLEdBQUcsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQzdCLENBQUM7QUEvREQsa0dBK0RDO0FBQ00sS0FBSyxVQUFVLHVDQUF1QyxDQUMzRCxPQUE2QixFQUM3QixPQUF1QixFQUN2Qix1QkFBZ0QsRUFDaEQsb0JBQTZELEVBQUU7O0lBRS9ELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDN0QsSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7S0FDbkQ7SUFFRCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO0lBQzVDLE1BQU0sZUFBZSxHQUFHLE1BQU0sT0FBTyxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3RFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQUMsZUFBZSxDQUFDLElBQTJCLG1DQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2pHLE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxVQUFnQyxDQUFDO0lBQ3BFLE1BQU0saUJBQWlCLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBRXhGLE1BQU0saUJBQWlCLEdBQUcsSUFBQSw4QkFBc0IsRUFDOUMsYUFBYSxFQUNiLFdBQVcsRUFDWCxpQkFBaUIsRUFDakIsT0FBTyxFQUNQLGVBQWUsRUFDZixPQUFPLENBQUMsTUFBTSxDQUNmLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRyxNQUFNLHFCQUFxQixDQUN4QyxhQUFhLEVBQ2IsV0FBVyxFQUNYLGlCQUFpQixFQUNqQixXQUFXLEVBQ1gsaUJBQWlCLEVBQ2pCLHVCQUF1QixFQUN2QixPQUFPLENBQUMsTUFBTSxFQUNkLGlCQUFpQixDQUNsQixDQUFDO0lBRUYsdUVBQXVFO0lBQ3ZFLDREQUE0RDtJQUM1RCxNQUFNLGNBQWMsR0FDbEIsT0FHRCxDQUFDLGNBQWMsQ0FBQztJQUNqQixJQUFJLGNBQWMsRUFBRTtRQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNuQixNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztTQUNyQjtRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUkseUNBQWtCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztLQUM3RDtJQUVELE9BQU87UUFDTCxNQUFNO1FBQ04sV0FBVztRQUNYLGlCQUFpQjtLQUNsQixDQUFDO0FBQ0osQ0FBQztBQXhERCwwRkF3REM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxLQUFvQztJQUNyRSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM3QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDN0I7U0FBTTtRQUNMLE9BQU8sS0FBSyxDQUFDLE1BQU0sSUFBSSxZQUFZLENBQUM7S0FDckM7QUFDSCxDQUFDO0FBTkQsZ0RBTUM7QUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxLQUFvQztJQUNwRSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtRQUM3QixPQUFPLEtBQUssQ0FBQztLQUNkO1NBQU07UUFDTCxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUM7S0FDcEI7QUFDSCxDQUFDO0FBTkQsOENBTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgQnVpbGRlckNvbnRleHQgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvYXJjaGl0ZWN0JztcbmltcG9ydCB7IGxvZ2dpbmcgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvbiwgamF2YXNjcmlwdCB9IGZyb20gJ3dlYnBhY2snO1xuaW1wb3J0IHsgbWVyZ2UgYXMgd2VicGFja01lcmdlIH0gZnJvbSAnd2VicGFjay1tZXJnZSc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgQnJvd3NlckJ1aWxkZXJTY2hlbWEgfSBmcm9tICcuLi9idWlsZGVycy9icm93c2VyL3NjaGVtYSc7XG5pbXBvcnQgeyBOb3JtYWxpemVkQnJvd3NlckJ1aWxkZXJTY2hlbWEsIGRlZmF1bHRQcm9ncmVzcywgbm9ybWFsaXplQnJvd3NlclNjaGVtYSB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IFdlYnBhY2tDb25maWdPcHRpb25zIH0gZnJvbSAnLi4vdXRpbHMvYnVpbGQtb3B0aW9ucyc7XG5pbXBvcnQgeyByZWFkVHNjb25maWcgfSBmcm9tICcuLi91dGlscy9yZWFkLXRzY29uZmlnJztcbmltcG9ydCB7IEJ1aWxkZXJXYXRjaFBsdWdpbiwgQnVpbGRlcldhdGNoZXJGYWN0b3J5IH0gZnJvbSAnLi4vd2VicGFjay9wbHVnaW5zL2J1aWxkZXItd2F0Y2gtcGx1Z2luJztcbmltcG9ydCB7IEkxOG5PcHRpb25zLCBjb25maWd1cmVJMThuQnVpbGQgfSBmcm9tICcuL2kxOG4tb3B0aW9ucyc7XG5cbmV4cG9ydCB0eXBlIEJyb3dzZXJXZWJwYWNrQ29uZmlnT3B0aW9ucyA9IFdlYnBhY2tDb25maWdPcHRpb25zPE5vcm1hbGl6ZWRCcm93c2VyQnVpbGRlclNjaGVtYT47XG5cbmV4cG9ydCB0eXBlIFdlYnBhY2tQYXJ0aWFsR2VuZXJhdG9yID0gKFxuICBjb25maWd1cmF0aW9uT3B0aW9uczogQnJvd3NlcldlYnBhY2tDb25maWdPcHRpb25zLFxuKSA9PiAoUHJvbWlzZTxDb25maWd1cmF0aW9uPiB8IENvbmZpZ3VyYXRpb24pW107XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVdlYnBhY2tDb25maWcoXG4gIHdvcmtzcGFjZVJvb3Q6IHN0cmluZyxcbiAgcHJvamVjdFJvb3Q6IHN0cmluZyxcbiAgc291cmNlUm9vdDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICBwcm9qZWN0TmFtZTogc3RyaW5nLFxuICBvcHRpb25zOiBOb3JtYWxpemVkQnJvd3NlckJ1aWxkZXJTY2hlbWEsXG4gIHdlYnBhY2tQYXJ0aWFsR2VuZXJhdG9yOiBXZWJwYWNrUGFydGlhbEdlbmVyYXRvcixcbiAgbG9nZ2VyOiBsb2dnaW5nLkxvZ2dlckFwaSxcbiAgZXh0cmFCdWlsZE9wdGlvbnM6IFBhcnRpYWw8Tm9ybWFsaXplZEJyb3dzZXJCdWlsZGVyU2NoZW1hPixcbik6IFByb21pc2U8Q29uZmlndXJhdGlvbj4ge1xuICAvLyBFbnN1cmUgQnVpbGQgT3B0aW1pemVyIGlzIG9ubHkgdXNlZCB3aXRoIEFPVC5cbiAgaWYgKG9wdGlvbnMuYnVpbGRPcHRpbWl6ZXIgJiYgIW9wdGlvbnMuYW90KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgJ2J1aWxkT3B0aW1pemVyJyBvcHRpb24gY2Fubm90IGJlIHVzZWQgd2l0aG91dCAnYW90Jy5gKTtcbiAgfVxuXG4gIGNvbnN0IHRzQ29uZmlnUGF0aCA9IHBhdGgucmVzb2x2ZSh3b3Jrc3BhY2VSb290LCBvcHRpb25zLnRzQ29uZmlnKTtcbiAgY29uc3QgdHNDb25maWcgPSBhd2FpdCByZWFkVHNjb25maWcodHNDb25maWdQYXRoKTtcblxuICBjb25zdCBidWlsZE9wdGlvbnM6IE5vcm1hbGl6ZWRCcm93c2VyQnVpbGRlclNjaGVtYSA9IHsgLi4ub3B0aW9ucywgLi4uZXh0cmFCdWlsZE9wdGlvbnMgfTtcbiAgY29uc3Qgd2NvOiBCcm93c2VyV2VicGFja0NvbmZpZ09wdGlvbnMgPSB7XG4gICAgcm9vdDogd29ya3NwYWNlUm9vdCxcbiAgICBsb2dnZXI6IGxvZ2dlci5jcmVhdGVDaGlsZCgnd2VicGFja0NvbmZpZ09wdGlvbnMnKSxcbiAgICBwcm9qZWN0Um9vdCxcbiAgICBzb3VyY2VSb290LFxuICAgIGJ1aWxkT3B0aW9ucyxcbiAgICB0c0NvbmZpZyxcbiAgICB0c0NvbmZpZ1BhdGgsXG4gICAgcHJvamVjdE5hbWUsXG4gIH07XG5cbiAgd2NvLmJ1aWxkT3B0aW9ucy5wcm9ncmVzcyA9IGRlZmF1bHRQcm9ncmVzcyh3Y28uYnVpbGRPcHRpb25zLnByb2dyZXNzKTtcblxuICBjb25zdCBwYXJ0aWFscyA9IGF3YWl0IFByb21pc2UuYWxsKHdlYnBhY2tQYXJ0aWFsR2VuZXJhdG9yKHdjbykpO1xuICBjb25zdCB3ZWJwYWNrQ29uZmlnID0gd2VicGFja01lcmdlKHBhcnRpYWxzKTtcblxuICByZXR1cm4gd2VicGFja0NvbmZpZztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdlbmVyYXRlSTE4bkJyb3dzZXJXZWJwYWNrQ29uZmlnRnJvbUNvbnRleHQoXG4gIG9wdGlvbnM6IEJyb3dzZXJCdWlsZGVyU2NoZW1hLFxuICBjb250ZXh0OiBCdWlsZGVyQ29udGV4dCxcbiAgd2VicGFja1BhcnRpYWxHZW5lcmF0b3I6IFdlYnBhY2tQYXJ0aWFsR2VuZXJhdG9yLFxuICBleHRyYUJ1aWxkT3B0aW9uczogUGFydGlhbDxOb3JtYWxpemVkQnJvd3NlckJ1aWxkZXJTY2hlbWE+ID0ge30sXG4pOiBQcm9taXNlPHtcbiAgY29uZmlnOiBDb25maWd1cmF0aW9uO1xuICBwcm9qZWN0Um9vdDogc3RyaW5nO1xuICBwcm9qZWN0U291cmNlUm9vdD86IHN0cmluZztcbiAgaTE4bjogSTE4bk9wdGlvbnM7XG59PiB7XG4gIGNvbnN0IHsgYnVpbGRPcHRpb25zLCBpMThuIH0gPSBhd2FpdCBjb25maWd1cmVJMThuQnVpbGQoY29udGV4dCwgb3B0aW9ucyk7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdlbmVyYXRlQnJvd3NlcldlYnBhY2tDb25maWdGcm9tQ29udGV4dChcbiAgICBidWlsZE9wdGlvbnMsXG4gICAgY29udGV4dCxcbiAgICAod2NvKSA9PiB7XG4gICAgICByZXR1cm4gd2VicGFja1BhcnRpYWxHZW5lcmF0b3Iod2NvKTtcbiAgICB9LFxuICAgIGV4dHJhQnVpbGRPcHRpb25zLFxuICApO1xuICBjb25zdCBjb25maWcgPSByZXN1bHQuY29uZmlnO1xuXG4gIGlmIChpMThuLnNob3VsZElubGluZSkge1xuICAgIC8vIFJlbW92ZSBsb2NhbGl6ZSBcInBvbHlmaWxsXCIgaWYgaW4gQU9UIG1vZGVcbiAgICBpZiAoYnVpbGRPcHRpb25zLmFvdCkge1xuICAgICAgaWYgKCFjb25maWcucmVzb2x2ZSkge1xuICAgICAgICBjb25maWcucmVzb2x2ZSA9IHt9O1xuICAgICAgfVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29uZmlnLnJlc29sdmUuYWxpYXMpKSB7XG4gICAgICAgIGNvbmZpZy5yZXNvbHZlLmFsaWFzLnB1c2goe1xuICAgICAgICAgIG5hbWU6ICdAYW5ndWxhci9sb2NhbGl6ZS9pbml0JyxcbiAgICAgICAgICBhbGlhczogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFjb25maWcucmVzb2x2ZS5hbGlhcykge1xuICAgICAgICAgIGNvbmZpZy5yZXNvbHZlLmFsaWFzID0ge307XG4gICAgICAgIH1cbiAgICAgICAgY29uZmlnLnJlc29sdmUuYWxpYXNbJ0Bhbmd1bGFyL2xvY2FsaXplL2luaXQnXSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBmaWxlIGhhc2hlcyB0byBpbmNsdWRlIHRyYW5zbGF0aW9uIGZpbGUgY29udGVudFxuICAgIGNvbnN0IGkxOG5IYXNoID0gT2JqZWN0LnZhbHVlcyhpMThuLmxvY2FsZXMpLnJlZHVjZShcbiAgICAgIChkYXRhLCBsb2NhbGUpID0+IGRhdGEgKyBsb2NhbGUuZmlsZXMubWFwKChmaWxlKSA9PiBmaWxlLmludGVncml0eSB8fCAnJykuam9pbignfCcpLFxuICAgICAgJycsXG4gICAgKTtcblxuICAgIGNvbmZpZy5wbHVnaW5zID8/PSBbXTtcbiAgICBjb25maWcucGx1Z2lucy5wdXNoKHtcbiAgICAgIGFwcGx5KGNvbXBpbGVyKSB7XG4gICAgICAgIGNvbXBpbGVyLmhvb2tzLmNvbXBpbGF0aW9uLnRhcCgnYnVpbGQtYW5ndWxhcicsIChjb21waWxhdGlvbikgPT4ge1xuICAgICAgICAgIGphdmFzY3JpcHQuSmF2YXNjcmlwdE1vZHVsZXNQbHVnaW4uZ2V0Q29tcGlsYXRpb25Ib29rcyhjb21waWxhdGlvbikuY2h1bmtIYXNoLnRhcChcbiAgICAgICAgICAgICdidWlsZC1hbmd1bGFyJyxcbiAgICAgICAgICAgIChfLCBoYXNoKSA9PiB7XG4gICAgICAgICAgICAgIGhhc2gudXBkYXRlKCckbG9jYWxpemUnICsgaTE4bkhhc2gpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4geyAuLi5yZXN1bHQsIGkxOG4gfTtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUJyb3dzZXJXZWJwYWNrQ29uZmlnRnJvbUNvbnRleHQoXG4gIG9wdGlvbnM6IEJyb3dzZXJCdWlsZGVyU2NoZW1hLFxuICBjb250ZXh0OiBCdWlsZGVyQ29udGV4dCxcbiAgd2VicGFja1BhcnRpYWxHZW5lcmF0b3I6IFdlYnBhY2tQYXJ0aWFsR2VuZXJhdG9yLFxuICBleHRyYUJ1aWxkT3B0aW9uczogUGFydGlhbDxOb3JtYWxpemVkQnJvd3NlckJ1aWxkZXJTY2hlbWE+ID0ge30sXG4pOiBQcm9taXNlPHsgY29uZmlnOiBDb25maWd1cmF0aW9uOyBwcm9qZWN0Um9vdDogc3RyaW5nOyBwcm9qZWN0U291cmNlUm9vdD86IHN0cmluZyB9PiB7XG4gIGNvbnN0IHByb2plY3ROYW1lID0gY29udGV4dC50YXJnZXQgJiYgY29udGV4dC50YXJnZXQucHJvamVjdDtcbiAgaWYgKCFwcm9qZWN0TmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIGJ1aWxkZXIgcmVxdWlyZXMgYSB0YXJnZXQuJyk7XG4gIH1cblxuICBjb25zdCB3b3Jrc3BhY2VSb290ID0gY29udGV4dC53b3Jrc3BhY2VSb290O1xuICBjb25zdCBwcm9qZWN0TWV0YWRhdGEgPSBhd2FpdCBjb250ZXh0LmdldFByb2plY3RNZXRhZGF0YShwcm9qZWN0TmFtZSk7XG4gIGNvbnN0IHByb2plY3RSb290ID0gcGF0aC5qb2luKHdvcmtzcGFjZVJvb3QsIChwcm9qZWN0TWV0YWRhdGEucm9vdCBhcyBzdHJpbmcgfCB1bmRlZmluZWQpID8/ICcnKTtcbiAgY29uc3Qgc291cmNlUm9vdCA9IHByb2plY3RNZXRhZGF0YS5zb3VyY2VSb290IGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgY29uc3QgcHJvamVjdFNvdXJjZVJvb3QgPSBzb3VyY2VSb290ID8gcGF0aC5qb2luKHdvcmtzcGFjZVJvb3QsIHNvdXJjZVJvb3QpIDogdW5kZWZpbmVkO1xuXG4gIGNvbnN0IG5vcm1hbGl6ZWRPcHRpb25zID0gbm9ybWFsaXplQnJvd3NlclNjaGVtYShcbiAgICB3b3Jrc3BhY2VSb290LFxuICAgIHByb2plY3RSb290LFxuICAgIHByb2plY3RTb3VyY2VSb290LFxuICAgIG9wdGlvbnMsXG4gICAgcHJvamVjdE1ldGFkYXRhLFxuICAgIGNvbnRleHQubG9nZ2VyLFxuICApO1xuXG4gIGNvbnN0IGNvbmZpZyA9IGF3YWl0IGdlbmVyYXRlV2VicGFja0NvbmZpZyhcbiAgICB3b3Jrc3BhY2VSb290LFxuICAgIHByb2plY3RSb290LFxuICAgIHByb2plY3RTb3VyY2VSb290LFxuICAgIHByb2plY3ROYW1lLFxuICAgIG5vcm1hbGl6ZWRPcHRpb25zLFxuICAgIHdlYnBhY2tQYXJ0aWFsR2VuZXJhdG9yLFxuICAgIGNvbnRleHQubG9nZ2VyLFxuICAgIGV4dHJhQnVpbGRPcHRpb25zLFxuICApO1xuXG4gIC8vIElmIGJ1aWxkZXIgd2F0Y2ggc3VwcG9ydCBpcyBwcmVzZW50IGluIHRoZSBjb250ZXh0LCBhZGQgd2F0Y2ggcGx1Z2luXG4gIC8vIFRoaXMgaXMgaW50ZXJuYWwgb25seSBhbmQgY3VycmVudGx5IG9ubHkgdXNlZCBmb3IgdGVzdGluZ1xuICBjb25zdCB3YXRjaGVyRmFjdG9yeSA9IChcbiAgICBjb250ZXh0IGFzIHtcbiAgICAgIHdhdGNoZXJGYWN0b3J5PzogQnVpbGRlcldhdGNoZXJGYWN0b3J5O1xuICAgIH1cbiAgKS53YXRjaGVyRmFjdG9yeTtcbiAgaWYgKHdhdGNoZXJGYWN0b3J5KSB7XG4gICAgaWYgKCFjb25maWcucGx1Z2lucykge1xuICAgICAgY29uZmlnLnBsdWdpbnMgPSBbXTtcbiAgICB9XG4gICAgY29uZmlnLnBsdWdpbnMucHVzaChuZXcgQnVpbGRlcldhdGNoUGx1Z2luKHdhdGNoZXJGYWN0b3J5KSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGNvbmZpZyxcbiAgICBwcm9qZWN0Um9vdCxcbiAgICBwcm9qZWN0U291cmNlUm9vdCxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEluZGV4T3V0cHV0RmlsZShpbmRleDogQnJvd3NlckJ1aWxkZXJTY2hlbWFbJ2luZGV4J10pOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIGluZGV4ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBwYXRoLmJhc2VuYW1lKGluZGV4KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gaW5kZXgub3V0cHV0IHx8ICdpbmRleC5odG1sJztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW5kZXhJbnB1dEZpbGUoaW5kZXg6IEJyb3dzZXJCdWlsZGVyU2NoZW1hWydpbmRleCddKTogc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gaW5kZXg7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGluZGV4LmlucHV0O1xuICB9XG59XG4iXX0=