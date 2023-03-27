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
exports.execute = void 0;
const architect_1 = require("@angular-devkit/architect");
const core_1 = require("@angular-devkit/core");
const module_1 = require("module");
const path = __importStar(require("path"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const purge_cache_1 = require("../../utils/purge-cache");
const version_1 = require("../../utils/version");
const webpack_browser_config_1 = require("../../utils/webpack-browser-config");
const configs_1 = require("../../webpack/configs");
const schema_1 = require("../browser/schema");
const find_tests_plugin_1 = require("./find-tests-plugin");
async function initialize(options, context, webpackConfigurationTransformer) {
    var _a;
    // Purge old build disk cache.
    await (0, purge_cache_1.purgeStaleBuildCache)(context);
    const { config } = await (0, webpack_browser_config_1.generateBrowserWebpackConfigFromContext)(
    // only two properties are missing:
    // * `outputPath` which is fixed for tests
    // * `budgets` which might be incorrect due to extra dev libs
    {
        ...options,
        outputPath: '',
        budgets: undefined,
        optimization: false,
        buildOptimizer: false,
        aot: false,
        vendorChunk: true,
        namedChunks: true,
        extractLicenses: false,
        outputHashing: schema_1.OutputHashing.None,
        // The webpack tier owns the watch behavior so we want to force it in the config.
        // When not in watch mode, webpack-dev-middleware will call `compiler.watch` anyway.
        // https://github.com/webpack/webpack-dev-middleware/blob/698c9ae5e9bb9a013985add6189ff21c1a1ec185/src/index.js#L65
        // https://github.com/webpack/webpack/blob/cde1b73e12eb8a77eb9ba42e7920c9ec5d29c2c9/lib/Compiler.js#L379-L388
        watch: true,
    }, context, (wco) => [(0, configs_1.getCommonConfig)(wco), (0, configs_1.getStylesConfig)(wco)]);
    const karma = await Promise.resolve().then(() => __importStar(require('karma')));
    return [karma, (_a = (await (webpackConfigurationTransformer === null || webpackConfigurationTransformer === void 0 ? void 0 : webpackConfigurationTransformer(config)))) !== null && _a !== void 0 ? _a : config];
}
/**
 * @experimental Direct usage of this function is considered experimental.
 */
function execute(options, context, transforms = {}) {
    // Check Angular version.
    (0, version_1.assertCompatibleAngularVersion)(context.workspaceRoot);
    let singleRun;
    if (options.watch !== undefined) {
        singleRun = !options.watch;
    }
    return (0, rxjs_1.from)(initialize(options, context, transforms.webpackConfiguration)).pipe((0, operators_1.switchMap)(async ([karma, webpackConfig]) => {
        var _a, _b, _c, _d, _e;
        // Determine project name from builder context target
        const projectName = (_a = context.target) === null || _a === void 0 ? void 0 : _a.project;
        if (!projectName) {
            throw new Error(`The 'karma' builder requires a target to be specified.`);
        }
        const karmaOptions = options.karmaConfig
            ? {}
            : getBuiltInKarmaConfig(context.workspaceRoot, projectName);
        karmaOptions.singleRun = singleRun;
        // Convert browsers from a string to an array
        if (options.browsers) {
            karmaOptions.browsers = options.browsers.split(',');
        }
        if (options.reporters) {
            // Split along commas to make it more natural, and remove empty strings.
            const reporters = options.reporters
                .reduce((acc, curr) => acc.concat(curr.split(',')), [])
                .filter((x) => !!x);
            if (reporters.length > 0) {
                karmaOptions.reporters = reporters;
            }
        }
        if (!options.main) {
            (_b = webpackConfig.entry) !== null && _b !== void 0 ? _b : (webpackConfig.entry = {});
            if (typeof webpackConfig.entry === 'object' && !Array.isArray(webpackConfig.entry)) {
                if (Array.isArray(webpackConfig.entry['main'])) {
                    webpackConfig.entry['main'].push(getBuiltInMainFile());
                }
                else {
                    webpackConfig.entry['main'] = [getBuiltInMainFile()];
                }
            }
        }
        const projectMetadata = await context.getProjectMetadata(projectName);
        const sourceRoot = ((_d = (_c = projectMetadata.sourceRoot) !== null && _c !== void 0 ? _c : projectMetadata.root) !== null && _d !== void 0 ? _d : '');
        (_e = webpackConfig.plugins) !== null && _e !== void 0 ? _e : (webpackConfig.plugins = []);
        webpackConfig.plugins.push(new find_tests_plugin_1.FindTestsPlugin({
            include: options.include,
            exclude: options.exclude,
            workspaceRoot: context.workspaceRoot,
            projectSourceRoot: path.join(context.workspaceRoot, sourceRoot),
        }));
        karmaOptions.buildWebpack = {
            options,
            webpackConfig,
            logger: context.logger,
        };
        const parsedKarmaConfig = await karma.config.parseConfig(options.karmaConfig && path.resolve(context.workspaceRoot, options.karmaConfig), transforms.karmaOptions ? transforms.karmaOptions(karmaOptions) : karmaOptions, { promiseConfig: true, throwErrors: true });
        return [karma, parsedKarmaConfig];
    }), (0, operators_1.switchMap)(([karma, karmaConfig]) => new rxjs_1.Observable((subscriber) => {
        var _a, _b, _c;
        var _d, _e;
        // Pass onto Karma to emit BuildEvents.
        (_a = karmaConfig.buildWebpack) !== null && _a !== void 0 ? _a : (karmaConfig.buildWebpack = {});
        if (typeof karmaConfig.buildWebpack === 'object') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (_b = (_d = karmaConfig.buildWebpack).failureCb) !== null && _b !== void 0 ? _b : (_d.failureCb = () => subscriber.next({ success: false }));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (_c = (_e = karmaConfig.buildWebpack).successCb) !== null && _c !== void 0 ? _c : (_e.successCb = () => subscriber.next({ success: true }));
        }
        // Complete the observable once the Karma server returns.
        const karmaServer = new karma.Server(karmaConfig, (exitCode) => {
            subscriber.next({ success: exitCode === 0 });
            subscriber.complete();
        });
        const karmaStart = karmaServer.start();
        // Cleanup, signal Karma to exit.
        return () => {
            void karmaStart.then(() => karmaServer.stop());
        };
    })), (0, operators_1.defaultIfEmpty)({ success: false }));
}
exports.execute = execute;
function getBuiltInKarmaConfig(workspaceRoot, projectName) {
    let coverageFolderName = projectName.charAt(0) === '@' ? projectName.slice(1) : projectName;
    if (/[A-Z]/.test(coverageFolderName)) {
        coverageFolderName = core_1.strings.dasherize(coverageFolderName);
    }
    const workspaceRootRequire = (0, module_1.createRequire)(workspaceRoot + '/');
    // Any changes to the config here need to be synced to: packages/schematics/angular/config/files/karma.conf.js.template
    return {
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-jasmine-html-reporter',
            'karma-coverage',
            '@angular-devkit/build-angular/plugins/karma',
        ].map((p) => workspaceRootRequire(p)),
        client: {
            clearContext: false, // leave Jasmine Spec Runner output visible in browser
        },
        jasmineHtmlReporter: {
            suppressAll: true, // removes the duplicated traces
        },
        coverageReporter: {
            dir: path.join(workspaceRoot, 'coverage', coverageFolderName),
            subdir: '.',
            reporters: [{ type: 'html' }, { type: 'text-summary' }],
        },
        reporters: ['progress', 'kjhtml'],
        browsers: ['Chrome'],
        customLaunchers: {
            // Chrome configured to run in a bazel sandbox.
            // Disable the use of the gpu and `/dev/shm` because it causes Chrome to
            // crash on some environments.
            // See:
            //   https://github.com/puppeteer/puppeteer/blob/v1.0.0/docs/troubleshooting.md#tips
            //   https://stackoverflow.com/questions/50642308/webdriverexception-unknown-error-devtoolsactiveport-file-doesnt-exist-while-t
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'],
            },
        },
        restartOnFileChange: true,
    };
}
exports.default = (0, architect_1.createBuilder)(execute);
function getBuiltInMainFile() {
    const content = Buffer.from(`
  import { getTestBed } from '@angular/core/testing';
  import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting,
   } from '@angular/platform-browser-dynamic/testing';

  // Initialize the Angular testing environment.
  getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true
  });
`).toString('base64');
    return `ng-virtual-main.js!=!data:text/javascript;base64,${content}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9idWlsZGVycy9rYXJtYS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILHlEQUF5RjtBQUN6RiwrQ0FBK0M7QUFFL0MsbUNBQXVDO0FBQ3ZDLDJDQUE2QjtBQUM3QiwrQkFBd0M7QUFDeEMsOENBQTJEO0FBRzNELHlEQUErRDtBQUMvRCxpREFBcUU7QUFDckUsK0VBQTZGO0FBQzdGLG1EQUF5RTtBQUN6RSw4Q0FBbUY7QUFDbkYsMkRBQXNEO0FBUXRELEtBQUssVUFBVSxVQUFVLENBQ3ZCLE9BQTRCLEVBQzVCLE9BQXVCLEVBQ3ZCLCtCQUFxRTs7SUFFckUsOEJBQThCO0lBQzlCLE1BQU0sSUFBQSxrQ0FBb0IsRUFBQyxPQUFPLENBQUMsQ0FBQztJQUVwQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFBLGdFQUF1QztJQUM5RCxtQ0FBbUM7SUFDbkMsMENBQTBDO0lBQzFDLDZEQUE2RDtJQUM3RDtRQUNFLEdBQUksT0FBNEM7UUFDaEQsVUFBVSxFQUFFLEVBQUU7UUFDZCxPQUFPLEVBQUUsU0FBUztRQUNsQixZQUFZLEVBQUUsS0FBSztRQUNuQixjQUFjLEVBQUUsS0FBSztRQUNyQixHQUFHLEVBQUUsS0FBSztRQUNWLFdBQVcsRUFBRSxJQUFJO1FBQ2pCLFdBQVcsRUFBRSxJQUFJO1FBQ2pCLGVBQWUsRUFBRSxLQUFLO1FBQ3RCLGFBQWEsRUFBRSxzQkFBYSxDQUFDLElBQUk7UUFDakMsaUZBQWlGO1FBQ2pGLG9GQUFvRjtRQUNwRixtSEFBbUg7UUFDbkgsNkdBQTZHO1FBQzdHLEtBQUssRUFBRSxJQUFJO0tBQ1osRUFDRCxPQUFPLEVBQ1AsQ0FBQyxHQUFHLEVB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SSxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsa0JBQWtCLENBQUM7WUFDN0QsTUFBTSxFQUFFLEdBQUc7WUFDWCxTQUFTLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsQ0FBQztTQUN4RDtRQUNELFNBQVMsRUFBRSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7UUFDakMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDO1FBQ3BCLGVBQWUsRUFBRTtZQUNmLCtDQUErQztZQUMvQyx3RUFBd0U7WUFDeEUsOEJBQThCO1lBQzlCLE9BQU87WUFDUCxvRkFBb0Y7WUFDcEYsK0hBQStIO1lBQy9ILHVCQUF1QixFQUFFO2dCQUN2QixJQUFJLEVBQUUsZ0JBQWdCO2dCQUN0QixLQUFLLEVBQUUsQ0FBQyxjQUFjLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSx5QkFBeUIsQ0FBQzthQUNsRjtTQUNGO1FBQ0QsbUJBQW1CLEVBQUUsSUFBSTtLQUMxQixDQUFDO0FBQ0osQ0FBQztBQUdELGtCQUFlLElBQUEseUJBQWEsRUFBK0MsT0FBTyxDQUFDLENBQUM7QUFFcEYsU0FBUyxrQkFBa0I7SUFDekIsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FDekI7Ozs7Ozs7Ozs7OztDQVlILENBQ0UsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFckIsT0FBTyxvREFBb0QsT0FBTyxFQUFFLENBQUM7QUFDdkUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBCdWlsZGVyQ29udGV4dCwgQnVpbGRlck91dHB1dCwgY3JlYXRlQnVpbGRlciB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9hcmNoaXRlY3QnO1xuaW1wb3J0IHsgc3RyaW5ncyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB0eXBlIHsgQ29uZmlnLCBDb25maWdPcHRpb25zIH0gZnJvbSAna2FybWEnO1xuaW1wb3J0IHsgY3JlYXRlUmVxdWlyZSB9IGZyb20gJ21vZHVsZSc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZGVmYXVsdElmRW1wdHksIHN3aXRjaE1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb24gfSBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB7IEV4ZWN1dGlvblRyYW5zZm9ybWVyIH0gZnJvbSAnLi4vLi4vdHJhbnNmb3Jtcyc7XG5pbXBvcnQgeyBwdXJnZVN0YWxlQnVpbGRDYWNoZSB9IGZyb20gJy4uLy4uL3V0aWxzL3B1cmdlLWNhY2hlJztcbmltcG9ydCB7IGFzc2VydENvbXBhdGlibGVBbmd1bGFyVmVyc2lvbiB9IGZyb20gJy4uLy4uL3V0aWxzL3ZlcnNpb24nO1xuaW1wb3J0IHsgZ2VuZXJhdGVCcm93c2VyV2VicGFja0NvbmZpZ0Zyb21Db250ZXh0IH0gZnJvbSAnLi4vLi4vdXRpbHMvd2VicGFjay1icm93c2VyLWNvbmZpZyc7XG5pbXBvcnQgeyBnZXRDb21tb25Db25maWcsIGdldFN0eWxlc0NvbmZpZyB9IGZyb20gJy4uLy4uL3dlYnBhY2svY29uZmlncyc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgQnJvd3NlckJ1aWxkZXJPcHRpb25zLCBPdXRwdXRIYXNoaW5nIH0gZnJvbSAnLi4vYnJvd3Nlci9zY2hlbWEnO1xuaW1wb3J0IHsgRmluZFRlc3RzUGx1Z2luIH0gZnJvbSAnLi9maW5kLXRlc3RzLXBsdWdpbic7XG5pbXBvcnQgeyBTY2hlbWEgYXMgS2FybWFCdWlsZGVyT3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuZXhwb3J0IHR5cGUgS2FybWFDb25maWdPcHRpb25zID0gQ29uZmlnT3B0aW9ucyAmIHtcbiAgYnVpbGRXZWJwYWNrPzogdW5rbm93bjtcbiAgY29uZmlnRmlsZT86IHN0cmluZztcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemUoXG4gIG9wdGlvbnM6IEthcm1hQnVpbGRlck9wdGlvbnMsXG4gIGNvbnRleHQ6IEJ1aWxkZXJDb250ZXh0LFxuICB3ZWJwYWNrQ29uZmlndXJhdGlvblRyYW5zZm9ybWVyPzogRXhlY3V0aW9uVHJhbnNmb3JtZXI8Q29uZmlndXJhdGlvbj4sXG4pOiBQcm9taXNlPFt0eXBlb2YgaW1wb3J0KCdrYXJtYScpLCBDb25maWd1cmF0aW9uXT4ge1xuICAvLyBQdXJnZSBvbGQgYnVpbGQgZGlzayBjYWNoZS5cbiAgYXdhaXQgcHVyZ2VTdGFsZUJ1aWxkQ2FjaGUoY29udGV4dCk7XG5cbiAgY29uc3QgeyBjb25maWcgfSA9IGF3YWl0IGdlbmVyYXRlQnJvd3NlcldlYnBhY2tDb25maWdGcm9tQ29udGV4dChcbiAgICAvLyBvbmx5IHR3byBwcm9wZXJ0aWVzIGFyZSBtaXNzaW5nOlxuICAgIC8vICogYG91dHB1dFBhdGhgIHdoaWNoIGlzIGZpeGVkIGZvciB0ZXN0c1xuICAgIC8vICogYGJ1ZGdldHNgIHdoaWNoIG1pZ2h0IGJlIGluY29ycmVjdCBkdWUgdG8gZXh0cmEgZGV2IGxpYnNcbiAgICB7XG4gICAgICAuLi4ob3B0aW9ucyBhcyB1bmtub3duIGFzIEJyb3dzZXJCdWlsZGVyT3B0aW9ucyksXG4gICAgICBvdXRwdXRQYXRoOiAnJyxcbiAgICAgIGJ1ZGdldHM6IHVuZGVmaW5lZCxcbiAgICAgIG9wdGltaXphdGlvbjogZmFsc2UsXG4gICAgICBidWlsZE9wdGltaXplcjogZmFsc2UsXG4gICAgICBhb3Q6IGZhbHNlLFxuICAgICAgdmVuZG9yQ2h1bms6IHRydWUsXG4gICAgICBuYW1lZENodW5rczogdHJ1ZSxcbiAgICAgIGV4dHJhY3RMaWNlbnNlczogZmFsc2UsXG4gICAgICBvdXRwdXRIYXNoaW5nOiBPdXRwdXRIYXNoaW5nLk5vbmUsXG4gICAgICAvLyBUaGUgd2VicGFjayB0aWVyIG93bnMgdGhlIHdhdGNoIGJlaGF2aW9yIHNvIHdlIHdhbnQgdG8gZm9yY2UgaXQgaW4gdGhlIGNvbmZpZy5cbiAgICAgIC8vIFdoZW4gbm90IGluIHdhdGNoIG1vZGUsIHdlYnBhY2stZGV2LW1pZGRsZXdhcmUgd2lsbCBjYWxsIGBjb21waWxlci53YXRjaGAgYW55d2F5LlxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2svd2VicGFjay1kZXYtbWlkZGxld2FyZS9ibG9iLzY5OGM5YWU1ZTliYjlhMDEzOTg1YWRkNjE4OWZmMjFjMWExZWMxODUvc3JjL2luZGV4LmpzI0w2NVxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2svd2VicGFjay9ibG9iL2NkZTFiNzNlMTJlYjhhNzdlYjliYTQyZTc5MjBjOWVjNWQyOWMyYzkvbGliL0NvbXBpbGVyLmpzI0wzNzktTDM4OFxuICAgICAgd2F0Y2g6IHRydWUsXG4gICAgfSxcbiAgICBjb250ZXh0LFxuICAgICh3Y28pID0+IFtnZXRDb21tb25Db25maWcod2NvKSwgZ2V0U3R5bGVzQ29uZmlnKHdjbyldLFxuICApO1xuXG4gIGNvbnN0IGthcm1hID0gYXdhaXQgaW1wb3J0KCdrYXJtYScpO1xuXG4gIHJldHVybiBba2FybWEsIChhd2FpdCB3ZWJwYWNrQ29uZmlndXJhdGlvblRyYW5zZm9ybWVyPy4oY29uZmlnKSkgPz8gY29uZmlnXTtcbn1cblxuLyoqXG4gKiBAZXhwZXJpbWVudGFsIERpcmVjdCB1c2FnZSBvZiB0aGlzIGZ1bmN0aW9uIGlzIGNvbnNpZGVyZWQgZXhwZXJpbWVudGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZShcbiAgb3B0aW9uczogS2FybWFCdWlsZGVyT3B0aW9ucyxcbiAgY29udGV4dDogQnVpbGRlckNvbnRleHQsXG4gIHRyYW5zZm9ybXM6IHtcbiAgICB3ZWJwYWNrQ29uZmlndXJhdGlvbj86IEV4ZWN1dGlvblRyYW5zZm9ybWVyPENvbmZpZ3VyYXRpb24+O1xuICAgIC8vIFRoZSBrYXJtYSBvcHRpb25zIHRyYW5zZm9ybSBjYW5ub3QgYmUgYXN5bmMgd2l0aG91dCBhIHJlZmFjdG9yIG9mIHRoZSBidWlsZGVyIGltcGxlbWVudGF0aW9uXG4gICAga2FybWFPcHRpb25zPzogKG9wdGlvbnM6IEthcm1hQ29uZmlnT3B0aW9ucykgPT4gS2FybWFDb25maWdPcHRpb25zO1xuICB9ID0ge30sXG4pOiBPYnNlcnZhYmxlPEJ1aWxkZXJPdXRwdXQ+IHtcbiAgLy8gQ2hlY2sgQW5ndWxhciB2ZXJzaW9uLlxuICBhc3NlcnRDb21wYXRpYmxlQW5ndWxhclZlcnNpb24oY29udGV4dC53b3Jrc3BhY2VSb290KTtcblxuICBsZXQgc2luZ2xlUnVuOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuICBpZiAob3B0aW9ucy53YXRjaCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgc2luZ2xlUnVuID0gIW9wdGlvbnMud2F0Y2g7XG4gIH1cblxuICByZXR1cm4gZnJvbShpbml0aWFsaXplKG9wdGlvbnMsIGNvbnRleHQsIHRyYW5zZm9ybXMud2VicGFja0NvbmZpZ3VyYXRpb24pKS5waXBlKFxuICAgIHN3aXRjaE1hcChhc3luYyAoW2thcm1hLCB3ZWJwYWNrQ29uZmlnXSkgPT4ge1xuICAgICAgLy8gRGV0ZXJtaW5lIHByb2plY3QgbmFtZSBmcm9tIGJ1aWxkZXIgY29udGV4dCB0YXJnZXRcbiAgICAgIGNvbnN0IHByb2plY3ROYW1lID0gY29udGV4dC50YXJnZXQ/LnByb2plY3Q7XG4gICAgICBpZiAoIXByb2plY3ROYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlICdrYXJtYScgYnVpbGRlciByZXF1aXJlcyBhIHRhcmdldCB0byBiZSBzcGVjaWZpZWQuYCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGthcm1hT3B0aW9uczogS2FybWFDb25maWdPcHRpb25zID0gb3B0aW9ucy5rYXJtYUNvbmZpZ1xuICAgICAgICA/IHt9XG4gICAgICAgIDogZ2V0QnVpbHRJbkthcm1hQ29uZmlnKGNvbnRleHQud29ya3NwYWNlUm9vdCwgcHJvamVjdE5hbWUpO1xuXG4gICAgICBrYXJtYU9wdGlvbnMuc2luZ2xlUnVuID0gc2luZ2xlUnVuO1xuXG4gICAgICAvLyBDb252ZXJ0IGJyb3dzZXJzIGZyb20gYSBzdHJpbmcgdG8gYW4gYXJyYXlcbiAgICAgIGlmIChvcHRpb25zLmJyb3dzZXJzKSB7XG4gICAgICAgIGthcm1hT3B0aW9ucy5icm93c2VycyA9IG9wdGlvbnMuYnJvd3NlcnMuc3BsaXQoJywnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMucmVwb3J0ZXJzKSB7XG4gICAgICAgIC8vIFNwbGl0IGFsb25nIGNvbW1hcyB0byBtYWtlIGl0IG1vcmUgbmF0dXJhbCwgYW5kIHJlbW92ZSBlbXB0eSBzdHJpbmdzLlxuICAgICAgICBjb25zdCByZXBvcnRlcnMgPSBvcHRpb25zLnJlcG9ydGVyc1xuICAgICAgICAgIC5yZWR1Y2U8c3RyaW5nW10+KChhY2MsIGN1cnIpID0+IGFjYy5jb25jYXQoY3Vyci5zcGxpdCgnLCcpKSwgW10pXG4gICAgICAgICAgLmZpbHRlcigoeCkgPT4gISF4KTtcblxuICAgICAgICBpZiAocmVwb3J0ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBrYXJtYU9wdGlvbnMucmVwb3J0ZXJzID0gcmVwb3J0ZXJzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghb3B0aW9ucy5tYWluKSB7XG4gICAgICAgIHdlYnBhY2tDb25maWcuZW50cnkgPz89IHt9O1xuICAgICAgICBpZiAodHlwZW9mIHdlYnBhY2tDb25maWcuZW50cnkgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHdlYnBhY2tDb25maWcuZW50cnkpKSB7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkod2VicGFja0NvbmZpZy5lbnRyeVsnbWFpbiddKSkge1xuICAgICAgICAgICAgd2VicGFja0NvbmZpZy5lbnRyeVsnbWFpbiddLnB1c2goZ2V0QnVpbHRJbk1haW5GaWxlKCkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3ZWJwYWNrQ29uZmlnLmVudHJ5WydtYWluJ10gPSBbZ2V0QnVpbHRJbk1haW5GaWxlKCldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBwcm9qZWN0TWV0YWRhdGEgPSBhd2FpdCBjb250ZXh0LmdldFByb2plY3RNZXRhZGF0YShwcm9qZWN0TmFtZSk7XG4gICAgICBjb25zdCBzb3VyY2VSb290ID0gKHByb2plY3RNZXRhZGF0YS5zb3VyY2VSb290ID8/IHByb2plY3RNZXRhZGF0YS5yb290ID8/ICcnKSBhcyBzdHJpbmc7XG5cbiAgICAgIHdlYnBhY2tDb25maWcucGx1Z2lucyA/Pz0gW107XG4gICAgICB3ZWJwYWNrQ29uZmlnLnBsdWdpbnMucHVzaChcbiAgICAgICAgbmV3IEZpbmRUZXN0c1BsdWdpbih7XG4gICAgICAgICAgaW5jbHVkZTogb3B0aW9ucy5pbmNsdWRlLFxuICAgICAgICAgIGV4Y2x1ZGU6IG9wdGlvbnMuZXhjbHVkZSxcbiAgICAgICAgICB3b3Jrc3BhY2VSb290OiBjb250ZXh0LndvcmtzcGFjZVJvb3QsXG4gICAgICAgICAgcHJvamVjdFNvdXJjZVJvb3Q6IHBhdGguam9pbihjb250ZXh0LndvcmtzcGFjZVJvb3QsIHNvdXJjZVJvb3QpLFxuICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICAgIGthcm1hT3B0aW9ucy5idWlsZFdlYnBhY2sgPSB7XG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIHdlYnBhY2tDb25maWcsXG4gICAgICAgIGxvZ2dlcjogY29udGV4dC5sb2dnZXIsXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBwYXJzZWRLYXJtYUNvbmZpZyA9IGF3YWl0IGthcm1hLmNvbmZpZy5wYXJzZUNvbmZpZyhcbiAgICAgICAgb3B0aW9ucy5rYXJtYUNvbmZpZyAmJiBwYXRoLnJlc29sdmUoY29udGV4dC53b3Jrc3BhY2VSb290LCBvcHRpb25zLmthcm1hQ29uZmlnKSxcbiAgICAgICAgdHJhbnNmb3Jtcy5rYXJtYU9wdGlvbnMgPyB0cmFuc2Zvcm1zLmthcm1hT3B0aW9ucyhrYXJtYU9wdGlvbnMpIDoga2FybWFPcHRpb25zLFxuICAgICAgICB7IHByb21pc2VDb25maWc6IHRydWUsIHRocm93RXJyb3JzOiB0cnVlIH0sXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gW2thcm1hLCBwYXJzZWRLYXJtYUNvbmZpZ10gYXMgW3R5cGVvZiBrYXJtYSwgS2FybWFDb25maWdPcHRpb25zXTtcbiAgICB9KSxcbiAgICBzd2l0Y2hNYXAoXG4gICAgICAoW2thcm1hLCBrYXJtYUNvbmZpZ10pID0+XG4gICAgICAgIG5ldyBPYnNlcnZhYmxlPEJ1aWxkZXJPdXRwdXQ+KChzdWJzY3JpYmVyKSA9PiB7XG4gICAgICAgICAgLy8gUGFzcyBvbnRvIEthcm1hIHRvIGVtaXQgQnVpbGRFdmVudHMuXG4gICAgICAgICAga2FybWFDb25maWcuYnVpbGRXZWJwYWNrID8/PSB7fTtcbiAgICAgICAgICBpZiAodHlwZW9mIGthcm1hQ29uZmlnLmJ1aWxkV2VicGFjayA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICAoa2FybWFDb25maWcuYnVpbGRXZWJwYWNrIGFzIGFueSkuZmFpbHVyZUNiID8/PSAoKSA9PlxuICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoeyBzdWNjZXNzOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICAoa2FybWFDb25maWcuYnVpbGRXZWJwYWNrIGFzIGFueSkuc3VjY2Vzc0NiID8/PSAoKSA9PlxuICAgICAgICAgICAgICBzdWJzY3JpYmVyLm5leHQoeyBzdWNjZXNzOiB0cnVlIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENvbXBsZXRlIHRoZSBvYnNlcnZhYmxlIG9uY2UgdGhlIEthcm1hIHNlcnZlciByZXR1cm5zLlxuICAgICAgICAgIGNvbnN0IGthcm1hU2VydmVyID0gbmV3IGthcm1hLlNlcnZlcihrYXJtYUNvbmZpZyBhcyBDb25maWcsIChleGl0Q29kZSkgPT4ge1xuICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KHsgc3VjY2VzczogZXhpdENvZGUgPT09IDAgfSk7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBjb25zdCBrYXJtYVN0YXJ0ID0ga2FybWFTZXJ2ZXIuc3RhcnQoKTtcblxuICAgICAgICAgIC8vIENsZWFudXAsIHNpZ25hbCBLYXJtYSB0byBleGl0LlxuICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB2b2lkIGthcm1hU3RhcnQudGhlbigoKSA9PiBrYXJtYVNlcnZlci5zdG9wKCkpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICksXG4gICAgZGVmYXVsdElmRW1wdHkoeyBzdWNjZXNzOiBmYWxzZSB9KSxcbiAgKTtcbn1cblxuZnVuY3Rpb24gZ2V0QnVpbHRJbkthcm1hQ29uZmlnKFxuICB3b3Jrc3BhY2VSb290OiBzdHJpbmcsXG4gIHByb2plY3ROYW1lOiBzdHJpbmcsXG4pOiBDb25maWdPcHRpb25zICYgUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICBsZXQgY292ZXJhZ2VGb2xkZXJOYW1lID0gcHJvamVjdE5hbWUuY2hhckF0KDApID09PSAnQCcgPyBwcm9qZWN0TmFtZS5zbGljZSgxKSA6IHByb2plY3ROYW1lO1xuICBpZiAoL1tBLVpdLy50ZXN0KGNvdmVyYWdlRm9sZGVyTmFtZSkpIHtcbiAgICBjb3ZlcmFnZUZvbGRlck5hbWUgPSBzdHJpbmdzLmRhc2hlcml6ZShjb3ZlcmFnZUZvbGRlck5hbWUpO1xuICB9XG5cbiAgY29uc3Qgd29ya3NwYWNlUm9vdFJlcXVpcmUgPSBjcmVhdGVSZXF1aXJlKHdvcmtzcGFjZVJvb3QgKyAnLycpO1xuXG4gIC8vIEFueSBjaGFuZ2VzIHRvIHRoZSBjb25maWcgaGVyZSBuZWVkIHRvIGJlIHN5bmNlZCB0bzogcGFja2FnZXMvc2NoZW1hdGljcy9hbmd1bGFyL2NvbmZpZy9maWxlcy9rYXJtYS5jb25mLmpzLnRlbXBsYXRlXG4gIHJldHVybiB7XG4gICAgYmFzZVBhdGg6ICcnLFxuICAgIGZyYW1ld29ya3M6IFsnamFzbWluZScsICdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhciddLFxuICAgIHBsdWdpbnM6IFtcbiAgICAgICdrYXJtYS1qYXNtaW5lJyxcbiAgICAgICdrYXJtYS1jaHJvbWUtbGF1bmNoZXInLFxuICAgICAgJ2thcm1hLWphc21pbmUtaHRtbC1yZXBvcnRlcicsXG4gICAgICAna2FybWEtY292ZXJhZ2UnLFxuICAgICAgJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC1hbmd1bGFyL3BsdWdpbnMva2FybWEnLFxuICAgIF0ubWFwKChwKSA9PiB3b3Jrc3BhY2VSb290UmVxdWlyZShwKSksXG4gICAgY2xpZW50OiB7XG4gICAgICBjbGVhckNvbnRleHQ6IGZhbHNlLCAvLyBsZWF2ZSBKYXNtaW5lIFNwZWMgUnVubmVyIG91dHB1dCB2aXNpYmxlIGluIGJyb3dzZXJcbiAgICB9LFxuICAgIGphc21pbmVIdG1sUmVwb3J0ZXI6IHtcbiAgICAgIHN1cHByZXNzQWxsOiB0cnVlLCAvLyByZW1vdmVzIHRoZSBkdXBsaWNhdGVkIHRyYWNlc1xuICAgIH0sXG4gICAgY292ZXJhZ2VSZXBvcnRlcjoge1xuICAgICAgZGlyOiBwYXRoLmpvaW4od29ya3NwYWNlUm9vdCwgJ2NvdmVyYWdlJywgY292ZXJhZ2VGb2xkZXJOYW1lKSxcbiAgICAgIHN1YmRpcjogJy4nLFxuICAgICAgcmVwb3J0ZXJzOiBbeyB0eXBlOiAnaHRtbCcgfSwgeyB0eXBlOiAndGV4dC1zdW1tYXJ5JyB9XSxcbiAgICB9LFxuICAgIHJlcG9ydGVyczogWydwcm9ncmVzcycsICdramh0bWwnXSxcbiAgICBicm93c2VyczogWydDaHJvbWUnXSxcbiAgICBjdXN0b21MYXVuY2hlcnM6IHtcbiAgICAgIC8vIENocm9tZSBjb25maWd1cmVkIHRvIHJ1biBpbiBhIGJhemVsIHNhbmRib3guXG4gICAgICAvLyBEaXNhYmxlIHRoZSB1c2Ugb2YgdGhlIGdwdSBhbmQgYC9kZXYvc2htYCBiZWNhdXNlIGl0IGNhdXNlcyBDaHJvbWUgdG9cbiAgICAgIC8vIGNyYXNoIG9uIHNvbWUgZW52aXJvbm1lbnRzLlxuICAgICAgLy8gU2VlOlxuICAgICAgLy8gICBodHRwczovL2dpdGh1Yi5jb20vcHVwcGV0ZWVyL3B1cHBldGVlci9ibG9iL3YxLjAuMC9kb2NzL3Ryb3VibGVzaG9vdGluZy5tZCN0aXBzXG4gICAgICAvLyAgIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzUwNjQyMzA4L3dlYmRyaXZlcmV4Y2VwdGlvbi11bmtub3duLWVycm9yLWRldnRvb2xzYWN0aXZlcG9ydC1maWxlLWRvZXNudC1leGlzdC13aGlsZS10XG4gICAgICBDaHJvbWVIZWFkbGVzc05vU2FuZGJveDoge1xuICAgICAgICBiYXNlOiAnQ2hyb21lSGVhZGxlc3MnLFxuICAgICAgICBmbGFnczogWyctLW5vLXNhbmRib3gnLCAnLS1oZWFkbGVzcycsICctLWRpc2FibGUtZ3B1JywgJy0tZGlzYWJsZS1kZXYtc2htLXVzYWdlJ10sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVzdGFydE9uRmlsZUNoYW5nZTogdHJ1ZSxcbiAgfTtcbn1cblxuZXhwb3J0IHsgS2FybWFCdWlsZGVyT3B0aW9ucyB9O1xuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQnVpbGRlcjxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ICYgS2FybWFCdWlsZGVyT3B0aW9ucz4oZXhlY3V0ZSk7XG5cbmZ1bmN0aW9uIGdldEJ1aWx0SW5NYWluRmlsZSgpOiBzdHJpbmcge1xuICBjb25zdCBjb250ZW50ID0gQnVmZmVyLmZyb20oXG4gICAgYFxuICBpbXBvcnQgeyBnZXRUZXN0QmVkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZS90ZXN0aW5nJztcbiAgaW1wb3J0IHtcbiAgICBCcm93c2VyRHluYW1pY1Rlc3RpbmdNb2R1bGUsXG4gICAgcGxhdGZvcm1Ccm93c2VyRHluYW1pY1Rlc3RpbmcsXG4gICB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXItZHluYW1pYy90ZXN0aW5nJztcblxuICAvLyBJbml0aWFsaXplIHRoZSBBbmd1bGFyIHRlc3RpbmcgZW52aXJvbm1lbnQuXG4gIGdldFRlc3RCZWQoKS5pbml0VGVzdEVudmlyb25tZW50KEJyb3dzZXJEeW5hbWljVGVzdGluZ01vZHVsZSwgcGxhdGZvcm1Ccm93c2VyRHluYW1pY1Rlc3RpbmcoKSwge1xuICAgIGVycm9yT25Vbmtub3duRWxlbWVudHM6IHRydWUsXG4gICAgZXJyb3JPblVua25vd25Qcm9wZXJ0aWVzOiB0cnVlXG4gIH0pO1xuYCxcbiAgKS50b1N0cmluZygnYmFzZTY0Jyk7XG5cbiAgcmV0dXJuIGBuZy12aXJ0dWFsLW1haW4uanMhPSFkYXRhOnRleHQvamF2YXNjcmlwdDtiYXNlNjQsJHtjb250ZW50fWA7XG59XG4iXX0=