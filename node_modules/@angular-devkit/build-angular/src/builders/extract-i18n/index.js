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
exports.execute = void 0;
const architect_1 = require("@angular-devkit/architect");
const build_webpack_1 = require("@angular-devkit/build-webpack");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const i18n_options_1 = require("../../utils/i18n-options");
const load_esm_1 = require("../../utils/load-esm");
const purge_cache_1 = require("../../utils/purge-cache");
const version_1 = require("../../utils/version");
const webpack_browser_config_1 = require("../../utils/webpack-browser-config");
const configs_1 = require("../../webpack/configs");
const stats_1 = require("../../webpack/utils/stats");
const schema_1 = require("../browser/schema");
const schema_2 = require("./schema");
function getI18nOutfile(format) {
    switch (format) {
        case 'xmb':
            return 'messages.xmb';
        case 'xlf':
        case 'xlif':
        case 'xliff':
        case 'xlf2':
        case 'xliff2':
            return 'messages.xlf';
        case 'json':
        case 'legacy-migrate':
            return 'messages.json';
        case 'arb':
            return 'messages.arb';
        default:
            throw new Error(`Unsupported format "${format}"`);
    }
}
async function getSerializer(localizeToolsModule, format, sourceLocale, basePath, useLegacyIds, diagnostics) {
    const { XmbTranslationSerializer, LegacyMessageIdMigrationSerializer, ArbTranslationSerializer, Xliff1TranslationSerializer, Xliff2TranslationSerializer, SimpleJsonTranslationSerializer, } = localizeToolsModule;
    switch (format) {
        case schema_2.Format.Xmb:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new XmbTranslationSerializer(basePath, useLegacyIds);
        case schema_2.Format.Xlf:
        case schema_2.Format.Xlif:
        case schema_2.Format.Xliff:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new Xliff1TranslationSerializer(sourceLocale, basePath, useLegacyIds, {});
        case schema_2.Format.Xlf2:
        case schema_2.Format.Xliff2:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new Xliff2TranslationSerializer(sourceLocale, basePath, useLegacyIds, {});
        case schema_2.Format.Json:
            return new SimpleJsonTranslationSerializer(sourceLocale);
        case schema_2.Format.LegacyMigrate:
            return new LegacyMessageIdMigrationSerializer(diagnostics);
        case schema_2.Format.Arb:
            const fileSystem = {
                relative(from, to) {
                    return path.relative(from, to);
                },
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new ArbTranslationSerializer(sourceLocale, basePath, fileSystem);
    }
}
function normalizeFormatOption(options) {
    let format = options.format;
    switch (format) {
        case schema_2.Format.Xlf:
        case schema_2.Format.Xlif:
        case schema_2.Format.Xliff:
            format = schema_2.Format.Xlf;
            break;
        case schema_2.Format.Xlf2:
        case schema_2.Format.Xliff2:
            format = schema_2.Format.Xlf2;
            break;
    }
    // Default format is xliff1
    return format !== null && format !== void 0 ? format : schema_2.Format.Xlf;
}
class NoEmitPlugin {
    apply(compiler) {
        compiler.hooks.shouldEmit.tap('angular-no-emit', () => false);
    }
}
/**
 * @experimental Direct usage of this function is considered experimental.
 */
async function execute(options, context, transforms) {
    var _a;
    // Check Angular version.
    (0, version_1.assertCompatibleAngularVersion)(context.workspaceRoot);
    // Purge old build disk cache.
    await (0, purge_cache_1.purgeStaleBuildCache)(context);
    const browserTarget = (0, architect_1.targetFromTargetString)(options.browserTarget);
    const browserOptions = await context.validateOptions(await context.getTargetOptions(browserTarget), await context.getBuilderNameForTarget(browserTarget));
    const format = normalizeFormatOption(options);
    // We need to determine the outFile name so that AngularCompiler can retrieve it.
    let outFile = options.outFile || getI18nOutfile(format);
    if (options.outputPath) {
        // AngularCompilerPlugin doesn't support genDir so we have to adjust outFile instead.
        outFile = path.join(options.outputPath, outFile);
    }
    outFile = path.resolve(context.workspaceRoot, outFile);
    if (!context.target || !context.target.project) {
        throw new Error('The builder requires a target.');
    }
    try {
        require.resolve('@angular/localize');
    }
    catch (_b) {
        return {
            success: false,
            error: `i18n extraction requires the '@angular/localize' package.`,
            outputPath: outFile,
        };
    }
    const metadata = await context.getProjectMetadata(context.target);
    const i18n = (0, i18n_options_1.createI18nOptions)(metadata);
    let useLegacyIds = true;
    const ivyMessages = [];
    const builderOptions = {
        ...browserOptions,
        optimization: false,
        sourceMap: {
            scripts: true,
            styles: false,
            vendor: true,
        },
        buildOptimizer: false,
        aot: true,
        progress: options.progress,
        budgets: [],
        assets: [],
        scripts: [],
        styles: [],
        deleteOutputPath: false,
        extractLicenses: false,
        subresourceIntegrity: false,
        outputHashing: schema_1.OutputHashing.None,
        namedChunks: true,
        allowedCommonJsDependencies: undefined,
    };
    const { config, projectRoot } = await (0, webpack_browser_config_1.generateBrowserWebpackConfigFromContext)(builderOptions, context, (wco) => {
        var _a;
        // Default value for legacy message ids is currently true
        useLegacyIds = (_a = wco.tsConfig.options.enableI18nLegacyMessageIdFormat) !== null && _a !== void 0 ? _a : true;
        const partials = [
            { plugins: [new NoEmitPlugin()] },
            (0, configs_1.getCommonConfig)(wco),
        ];
        // Add Ivy application file extractor support
        partials.unshift({
            module: {
                rules: [
                    {
                        test: /\.[cm]?[tj]sx?$/,
                        loader: require.resolve('./ivy-extract-loader'),
                        options: {
                            messageHandler: (messages) => ivyMessages.push(...messages),
                        },
                    },
                ],
            },
        });
        // Replace all stylesheets with empty content
        partials.push({
            module: {
                rules: [
                    {
                        test: /\.(css|scss|sass|less)$/,
                        loader: require.resolve('./empty-loader'),
                    },
                ],
            },
        });
        return partials;
    }, 
    // During extraction we don't need specific browser support.
    { supportedBrowsers: undefined });
    // All the localize usages are setup to first try the ESM entry point then fallback to the deep imports.
    // This provides interim compatibility while the framework is transitioned to bundled ESM packages.
    const localizeToolsModule = await (0, load_esm_1.loadEsmModule)('@angular/localize/tools');
    const webpackResult = await (0, build_webpack_1.runWebpack)((await ((_a = transforms === null || transforms === void 0 ? void 0 : transforms.webpackConfiguration) === null || _a === void 0 ? void 0 : _a.call(transforms, config))) || config, context, {
        logging: (0, stats_1.createWebpackLoggingCallback)(builderOptions, context.logger),
        webpackFactory: webpack_1.default,
    }).toPromise();
    // Set the outputPath to the extraction output location for downstream consumers
    webpackResult.outputPath = outFile;
    // Complete if Webpack build failed
    if (!webpackResult.success) {
        return webpackResult;
    }
    const basePath = config.context || projectRoot;
    const { checkDuplicateMessages } = localizeToolsModule;
    // The filesystem is used to create a relative path for each file
    // from the basePath.  This relative path is then used in the error message.
    const checkFileSystem = {
        relative(from, to) {
            return path.relative(from, to);
        },
    };
    const diagnostics = checkDuplicateMessages(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkFileSystem, ivyMessages, 'warning', 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    basePath);
    if (diagnostics.messages.length > 0) {
        context.logger.warn(diagnostics.formatDiagnostics(''));
    }
    // Serialize all extracted messages
    const serializer = await getSerializer(localizeToolsModule, format, i18n.sourceLocale, basePath, useLegacyIds, diagnostics);
    const content = serializer.serialize(ivyMessages);
    // Ensure directory exists
    const outputPath = path.dirname(outFile);
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }
    // Write translation file
    fs.writeFileSync(outFile, content);
    return webpackResult;
}
exports.execute = execute;
exports.default = (0, architect_1.createBuilder)(execute);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9idWlsZGVycy9leHRyYWN0LWkxOG4vaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJSCx5REFBa0c7QUFDbEcsaUVBQXdFO0FBRXhFLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0Isc0RBQWlEO0FBRWpELDJEQUE2RDtBQUM3RCxtREFBcUQ7QUFDckQseURBQStEO0FBQy9ELGlEQUFxRTtBQUNyRSwrRUFBNkY7QUFDN0YsbURBQXdEO0FBQ3hELHFEQUF5RTtBQUN6RSw4Q0FBbUY7QUFDbkYscUNBQTBDO0FBSTFDLFNBQVMsY0FBYyxDQUFDLE1BQTBCO0lBQ2hELFFBQVEsTUFBTSxFQUFFO1FBQ2QsS0FBSyxLQUFLO1lBQ1IsT0FBTyxjQUFjLENBQUM7UUFDeEIsS0FBSyxLQUFLLENBQUM7UUFDWCxLQUFLLE1BQU0sQ0FBQztRQUNaLEtBQUssT0FBTyxDQUFDO1FBQ2IsS0FBSyxNQUFNLENBQUM7UUFDWixLQUFLLFFBQVE7WUFDWCxPQUFPLGNBQWMsQ0FBQztRQUN4QixLQUFLLE1BQU0sQ0FBQztRQUNaLEtBQUssZ0JBQWdCO1lBQ25CLE9BQU8sZUFBZSxDQUFDO1FBQ3pCLEtBQUssS0FBSztZQUNSLE9BQU8sY0FBYyxDQUFDO1FBQ3hCO1lBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsTUFBTSxHQUFHLENBQUMsQ0FBQztLQUNyRDtBQUNILENBQUM7QUFFRCxLQUFLLFVBQVUsYUFBYSxDQUMxQixtQkFBNkQsRUFDN0QsTUFBYyxFQUNkLFlBQW9CLEVBQ3BCLFFBQWdCLEVBQ2hCLFlBQXFCLEVBQ3JCLFdBQXdCO0lBRXhCLE1BQU0sRUFDSix3QkFBd0IsRUFDeEIsa0NBQWtDLEVBQ2xDLHdCQUF3QixFQUN4QiwyQkFBMkIsRUFDM0IsMkJBQTJCLEVBQzNCLCtCQUErQixHQUNoQyxHQUFHLG1CQUFtQixDQUFDO0lBRXhCLFFBQVEsTUFBTSxFQUFFO1FBQ2QsS0FBSyxlQUFNLENBQUMsR0FBRztZQUNiLDhEQUE4RDtZQUM5RCxPQUFPLElBQUksd0JBQXdCLENBQUMsUUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3JFLEtBQUssZUFBTSxDQUFDLEdBQUcsQ0FBQztRQUNoQixLQUFLLGVBQU0sQ0FBQyxJQUFJLENBQUM7UUFDakIsS0FBSyxlQUFNLENBQUMsS0FBSztZQUNmLDhEQUE4RDtZQUM5RCxPQUFPLElBQUksMkJBQTJCLENBQUMsWUFBWSxFQUFFLFFBQWUsRUFBRSxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUYsS0FBSyxlQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2pCLEtBQUssZUFBTSxDQUFDLE1BQU07WUFDaEIsOERBQThEO1lBQzlELE9BQU8sSUFBSSwyQkFBMkIsQ0FBQyxZQUFZLEVBQUUsUUFBZSxFQUFFLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRixLQUFLLGVBQU0sQ0FBQyxJQUFJO1lBQ2QsT0FBTyxJQUFJLCtCQUErQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzNELEtBQUssZUFBTSxDQUFDLGFBQWE7WUFDdkIsT0FBTyxJQUFJLGtDQUFrQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdELEtBQUssZUFBTSxDQUFDLEdBQUc7WUFDYixNQUFNLFVBQVUsR0FBRztnQkFDakIsUUFBUSxDQUFDLElBQVksRUFBRSxFQUFVO29CQUMvQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDO2FBQ0YsQ0FBQztZQUVGLDhEQUE4RDtZQUM5RCxPQUFPLElBQUksd0JBQXdCLENBQUMsWUFBWSxFQUFFLFFBQWUsRUFBRSxVQUFpQixDQUFDLENBQUM7S0FDekY7QUFDSCxDQUFDO0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxPQUFrQztJQUMvRCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBRTVCLFFBQVEsTUFBTSxFQUFFO1FBQ2QsS0FBSyxlQUFNLENBQUMsR0FBRyxDQUFDO1FBQ2hCLEtBQUssZUFBTSxDQUFDLElBQUksQ0FBQztRQUNqQixLQUFLLGVBQU0sQ0FBQyxLQUFLO1lBQ2YsTUFBTSxHQUFHLGVBQU0sQ0FBQyxHQUFHLENBQUM7WUFDcEIsTUFBTTtRQUNSLEtBQUssZUFBTSxDQUFDLElBQUksQ0FBQztRQUNqQixLQUFLLGVBQU0sQ0FBQyxNQUFNO1lBQ2hCLE1BQU0sR0FBRyxlQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3JCLE1BQU07S0FDVDtJQUVELDJCQUEyQjtJQUMzQixPQUFPLE1BQU0sYUFBTixNQUFNLGNBQU4sTUFBTSxHQUFJLGVBQU0sQ0FBQyxHQUFHLENBQUM7QUFDOUIsQ0FBQztBQUVELE1BQU0sWUFBWTtJQUNoQixLQUFLLENBQUMsUUFBMEI7UUFDOUIsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hFLENBQUM7Q0FDRjtBQUVEOztHQUVHO0FBQ0ksS0FBSyxVQUFVLE9BQU8sQ0FDM0IsT0FBa0MsRUFDbEMsT0FBdUIsRUFDdkIsVUFFQzs7SUFFRCx5QkFBeUI7SUFDekIsSUFBQSx3Q0FBOEIsRUFBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFdEQsOEJBQThCO0lBQzlCLE1BQU0sSUFBQSxrQ0FBb0IsRUFBQyxPQUFPLENBQUMsQ0FBQztJQUVwQyxNQUFNLGFBQWEsR0FBRyxJQUFBLGtDQUFzQixFQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNwRSxNQUFNLGNBQWMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxlQUFlLENBQ2xELE1BQU0sT0FBTyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxFQUM3QyxNQUFNLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLENBQUMsQ0FDckQsQ0FBQztJQUVGLE1BQU0sTUFBTSxHQUFHLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRTlDLGlGQUFpRjtJQUNqRixJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4RCxJQUFJLE9BQU8sQ0FBQyxVQUFVLEVBQUU7UUFDdEIscUZBQXFGO1FBQ3JGLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDbEQ7SUFDRCxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXZELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7UUFDOUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0tBQ25EO0lBRUQsSUFBSTtRQUNGLE9BQU8sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUN0QztJQUFDLFdBQU07UUFDTixPQUFPO1lBQ0wsT0FBTyxFQUFFLEtBQUs7WUFDZCxLQUFLLEVBQUUsMkRBQTJEO1lBQ2xFLFVBQVUsRUFBRSxPQUFPO1NBQ3BCLENBQUM7S0FDSDtJQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsRSxNQUFNLElBQUksR0FBRyxJQUFBLGdDQUFpQixFQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXpDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQztJQUV4QixNQUFNLFdBQVcsR0FBc0IsRUFBRSxDQUFDO0lBQzFDLE1BQU0sY0FBYyxHQUFHO1FBQ3JCLEdBQUcsY0FBYztRQUNqQixZQUFZLEVBQUUsS0FBSztRQUNuQixTQUFTLEVBQUU7WUFDVCxPQUFPLEVBQUUsSUFBSTtZQUNiLE1BQU0sRUFBRSxLQUFLO1lBQ2IsTUFBTSxFQUFFLElBQUk7U0FDYjtRQUNELGNBQWMsRUFBRSxLQUFLO1FBQ3JCLEdBQUcsRUFBRSxJQUFJO1FBQ1QsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1FBQzFCLE9BQU8sRUFBRSxFQUFFO1FBQ1gsTUFBTSxFQUFFLEVBQUU7UUFDVixPQUFPLEVBQUUsRUFBRTtRQUNYLE1BQU0sRUFBRSxFQUFFO1FBQ1YsZ0JBQWdCLEVBQUUsS0FBSztRQUN2QixlQUFlLEVBQUUsS0FBSztRQUN0QixvQkFBb0IsRUFBRSxLQUFLO1FBQzNCLGFBQWEsRUFBRSxzQkFBYSxDQUFDLElBQUk7UUFDakMsV0FBVyxFQUFFLElBQUk7UUFDakIsMkJBQTJCLEVBQUUsU0FBUztLQUN2QyxDQUFDO0lBQ0YsTUFBTSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxNQUFNLElBQUEsZ0VBQXVDLEVBQzNFLGNBQWMsRUFDZCxPQUFPLEVBQ1AsQ0FBQyxHQUFHLEVBQUUsRUFBRTs7UUFDTix5REFBeUQ7UUFDekQsWUFBWSxHQUFHLE1BQUEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsK0JBQStCLG1DQUFJLElBQUksQ0FBQztRQUU1RSxNQUFNLFFBQVEsR0FBK0M7WUFDM0QsRUFBRSxPQUFPLEVBQUUsQ0FBQyxJQUFJLFlBQVksRUFBRSxDQUFDLEVBQUU7WUFDakMsSUFBQSx5QkFBZSxFQUFDLEdBQUcsQ0FBQztTQUNyQixDQUFDO1FBRUYsNkNBQTZDO1FBQzdDLFFBQVEsQ0FBQyxPQUFPLENBQUM7WUFDZixNQUFNLEVBQUU7Z0JBQ04sS0FBSyxFQUFFO29CQUNMO3dCQUNFLElBQUksRUFBRSxpQkFBaUI7d0JBQ3ZCLE1BQU0sRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDO3dCQUMvQyxPQUFPLEVBQUU7NEJBQ1AsY0FBYyxFQUFFLENBQUMsUUFBMkIsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQzt5QkFDL0U7cUJBQ0Y7aUJBQ0Y7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILDZDQUE2QztRQUM3QyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ1osTUFBTSxFQUFFO2dCQUNOLEtBQUssRUFBRTtvQkFDTDt3QkFDRSxJQUFJLEVBQUUseUJBQXlCO3dCQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztxQkFDMUM7aUJBQ0Y7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFDRCw0REFBNEQ7SUFDNUQsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsQ0FDakMsQ0FBQztJQUVGLHdHQUF3RztJQUN4RyxtR0FBbUc7SUFDbkcsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLElBQUEsd0JBQWEsRUFDN0MseUJBQXlCLENBQzFCLENBQUM7SUFDRixNQUFNLGFBQWEsR0FBRyxNQUFNLElBQUEsMEJBQVUsRUFDcEMsQ0FBQyxNQUFNLENBQUEsTUFBQSxVQUFVLGFBQVYsVUFBVSx1QkFBVixVQUFVLENBQUUsb0JBQW9CLDJEQUFHLE1BQU0sQ0FBQyxDQUFBLENBQUMsSUFBSSxNQUFNLEVBQzVELE9BQU8sRUFDUDtRQUNFLE9BQU8sRUFBRSxJQUFBLG9DQUE0QixFQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ3JFLGNBQWMsRUFBRSxpQkFBTztLQUN4QixDQUNGLENBQUMsU0FBUyxFQUFFLENBQUM7SUFFZCxnRkFBZ0Y7SUFDaEYsYUFBYSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUM7SUFFbkMsbUNBQW1DO0lBQ25DLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFO1FBQzFCLE9BQU8sYUFBYSxDQUFDO0tBQ3RCO0lBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sSUFBSSxXQUFXLENBQUM7SUFFL0MsTUFBTSxFQUFFLHNCQUFzQixFQUFFLEdBQUcsbUJBQW1CLENBQUM7SUFFdkQsaUVBQWlFO0lBQ2pFLDRFQUE0RTtJQUM1RSxNQUFNLGVBQWUsR0FBRztRQUN0QixRQUFRLENBQUMsSUFBWSxFQUFFLEVBQVU7WUFDL0IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqQyxDQUFDO0tBQ0YsQ0FBQztJQUNGLE1BQU0sV0FBVyxHQUFHLHNCQUFzQjtJQUN4Qyw4REFBOEQ7SUFDOUQsZUFBc0IsRUFDdEIsV0FBVyxFQUNYLFNBQVM7SUFDVCw4REFBOEQ7SUFDOUQsUUFBZSxDQUNoQixDQUFDO0lBQ0YsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDbkMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDeEQ7SUFFRCxtQ0FBbUM7SUFDbkMsTUFBTSxVQUFVLEdBQUcsTUFBTSxhQUFhLENBQ3BDLG1CQUFtQixFQUNuQixNQUFNLEVBQ04sSUFBSSxDQUFDLFlBQVksRUFDakIsUUFBUSxFQUNSLFlBQVksRUFDWixXQUFXLENBQ1osQ0FBQztJQUNGLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFbEQsMEJBQTBCO0lBQzFCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUU7UUFDOUIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUMvQztJQUVELHlCQUF5QjtJQUN6QixFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVuQyxPQUFPLGFBQWEsQ0FBQztBQUN2QixDQUFDO0FBdExELDBCQXNMQztBQUVELGtCQUFlLElBQUEseUJBQWEsRUFBNEIsT0FBTyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHR5cGUgeyDJtVBhcnNlZE1lc3NhZ2UgYXMgTG9jYWxpemVNZXNzYWdlIH0gZnJvbSAnQGFuZ3VsYXIvbG9jYWxpemUnO1xuaW1wb3J0IHR5cGUgeyBEaWFnbm9zdGljcyB9IGZyb20gJ0Bhbmd1bGFyL2xvY2FsaXplL3Rvb2xzJztcbmltcG9ydCB7IEJ1aWxkZXJDb250ZXh0LCBjcmVhdGVCdWlsZGVyLCB0YXJnZXRGcm9tVGFyZ2V0U3RyaW5nIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2FyY2hpdGVjdCc7XG5pbXBvcnQgeyBCdWlsZFJlc3VsdCwgcnVuV2VicGFjayB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9idWlsZC13ZWJwYWNrJztcbmltcG9ydCB7IEpzb25PYmplY3QgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHdlYnBhY2ssIHsgQ29uZmlndXJhdGlvbiB9IGZyb20gJ3dlYnBhY2snO1xuaW1wb3J0IHsgRXhlY3V0aW9uVHJhbnNmb3JtZXIgfSBmcm9tICcuLi8uLi90cmFuc2Zvcm1zJztcbmltcG9ydCB7IGNyZWF0ZUkxOG5PcHRpb25zIH0gZnJvbSAnLi4vLi4vdXRpbHMvaTE4bi1vcHRpb25zJztcbmltcG9ydCB7IGxvYWRFc21Nb2R1bGUgfSBmcm9tICcuLi8uLi91dGlscy9sb2FkLWVzbSc7XG5pbXBvcnQgeyBwdXJnZVN0YWxlQnVpbGRDYWNoZSB9IGZyb20gJy4uLy4uL3V0aWxzL3B1cmdlLWNhY2hlJztcbmltcG9ydCB7IGFzc2VydENvbXBhdGlibGVBbmd1bGFyVmVyc2lvbiB9IGZyb20gJy4uLy4uL3V0aWxzL3ZlcnNpb24nO1xuaW1wb3J0IHsgZ2VuZXJhdGVCcm93c2VyV2VicGFja0NvbmZpZ0Zyb21Db250ZXh0IH0gZnJvbSAnLi4vLi4vdXRpbHMvd2VicGFjay1icm93c2VyLWNvbmZpZyc7XG5pbXBvcnQgeyBnZXRDb21tb25Db25maWcgfSBmcm9tICcuLi8uLi93ZWJwYWNrL2NvbmZpZ3MnO1xuaW1wb3J0IHsgY3JlYXRlV2VicGFja0xvZ2dpbmdDYWxsYmFjayB9IGZyb20gJy4uLy4uL3dlYnBhY2svdXRpbHMvc3RhdHMnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIEJyb3dzZXJCdWlsZGVyT3B0aW9ucywgT3V0cHV0SGFzaGluZyB9IGZyb20gJy4uL2Jyb3dzZXIvc2NoZW1hJztcbmltcG9ydCB7IEZvcm1hdCwgU2NoZW1hIH0gZnJvbSAnLi9zY2hlbWEnO1xuXG5leHBvcnQgdHlwZSBFeHRyYWN0STE4bkJ1aWxkZXJPcHRpb25zID0gU2NoZW1hO1xuXG5mdW5jdGlvbiBnZXRJMThuT3V0ZmlsZShmb3JtYXQ6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgIGNhc2UgJ3htYic6XG4gICAgICByZXR1cm4gJ21lc3NhZ2VzLnhtYic7XG4gICAgY2FzZSAneGxmJzpcbiAgICBjYXNlICd4bGlmJzpcbiAgICBjYXNlICd4bGlmZic6XG4gICAgY2FzZSAneGxmMic6XG4gICAgY2FzZSAneGxpZmYyJzpcbiAgICAgIHJldHVybiAnbWVzc2FnZXMueGxmJztcbiAgICBjYXNlICdqc29uJzpcbiAgICBjYXNlICdsZWdhY3ktbWlncmF0ZSc6XG4gICAgICByZXR1cm4gJ21lc3NhZ2VzLmpzb24nO1xuICAgIGNhc2UgJ2FyYic6XG4gICAgICByZXR1cm4gJ21lc3NhZ2VzLmFyYic7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZm9ybWF0IFwiJHtmb3JtYXR9XCJgKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRTZXJpYWxpemVyKFxuICBsb2NhbGl6ZVRvb2xzTW9kdWxlOiB0eXBlb2YgaW1wb3J0KCdAYW5ndWxhci9sb2NhbGl6ZS90b29scycpLFxuICBmb3JtYXQ6IEZvcm1hdCxcbiAgc291cmNlTG9jYWxlOiBzdHJpbmcsXG4gIGJhc2VQYXRoOiBzdHJpbmcsXG4gIHVzZUxlZ2FjeUlkczogYm9vbGVhbixcbiAgZGlhZ25vc3RpY3M6IERpYWdub3N0aWNzLFxuKSB7XG4gIGNvbnN0IHtcbiAgICBYbWJUcmFuc2xhdGlvblNlcmlhbGl6ZXIsXG4gICAgTGVnYWN5TWVzc2FnZUlkTWlncmF0aW9uU2VyaWFsaXplcixcbiAgICBBcmJUcmFuc2xhdGlvblNlcmlhbGl6ZXIsXG4gICAgWGxpZmYxVHJhbnNsYXRpb25TZXJpYWxpemVyLFxuICAgIFhsaWZmMlRyYW5zbGF0aW9uU2VyaWFsaXplcixcbiAgICBTaW1wbGVKc29uVHJhbnNsYXRpb25TZXJpYWxpemVyLFxuICB9ID0gbG9jYWxpemVUb29sc01vZHVsZTtcblxuICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgIGNhc2UgRm9ybWF0LlhtYjpcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICByZXR1cm4gbmV3IFhtYlRyYW5zbGF0aW9uU2VyaWFsaXplcihiYXNlUGF0aCBhcyBhbnksIHVzZUxlZ2FjeUlkcyk7XG4gICAgY2FzZSBGb3JtYXQuWGxmOlxuICAgIGNhc2UgRm9ybWF0LlhsaWY6XG4gICAgY2FzZSBGb3JtYXQuWGxpZmY6XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgcmV0dXJuIG5ldyBYbGlmZjFUcmFuc2xhdGlvblNlcmlhbGl6ZXIoc291cmNlTG9jYWxlLCBiYXNlUGF0aCBhcyBhbnksIHVzZUxlZ2FjeUlkcywge30pO1xuICAgIGNhc2UgRm9ybWF0LlhsZjI6XG4gICAgY2FzZSBGb3JtYXQuWGxpZmYyOlxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgIHJldHVybiBuZXcgWGxpZmYyVHJhbnNsYXRpb25TZXJpYWxpemVyKHNvdXJjZUxvY2FsZSwgYmFzZVBhdGggYXMgYW55LCB1c2VMZWdhY3lJZHMsIHt9KTtcbiAgICBjYXNlIEZvcm1hdC5Kc29uOlxuICAgICAgcmV0dXJuIG5ldyBTaW1wbGVKc29uVHJhbnNsYXRpb25TZXJpYWxpemVyKHNvdXJjZUxvY2FsZSk7XG4gICAgY2FzZSBGb3JtYXQuTGVnYWN5TWlncmF0ZTpcbiAgICAgIHJldHVybiBuZXcgTGVnYWN5TWVzc2FnZUlkTWlncmF0aW9uU2VyaWFsaXplcihkaWFnbm9zdGljcyk7XG4gICAgY2FzZSBGb3JtYXQuQXJiOlxuICAgICAgY29uc3QgZmlsZVN5c3RlbSA9IHtcbiAgICAgICAgcmVsYXRpdmUoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgICByZXR1cm4gcGF0aC5yZWxhdGl2ZShmcm9tLCB0byk7XG4gICAgICAgIH0sXG4gICAgICB9O1xuXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgcmV0dXJuIG5ldyBBcmJUcmFuc2xhdGlvblNlcmlhbGl6ZXIoc291cmNlTG9jYWxlLCBiYXNlUGF0aCBhcyBhbnksIGZpbGVTeXN0ZW0gYXMgYW55KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVGb3JtYXRPcHRpb24ob3B0aW9uczogRXh0cmFjdEkxOG5CdWlsZGVyT3B0aW9ucyk6IEZvcm1hdCB7XG4gIGxldCBmb3JtYXQgPSBvcHRpb25zLmZvcm1hdDtcblxuICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgIGNhc2UgRm9ybWF0LlhsZjpcbiAgICBjYXNlIEZvcm1hdC5YbGlmOlxuICAgIGNhc2UgRm9ybWF0LlhsaWZmOlxuICAgICAgZm9ybWF0ID0gRm9ybWF0LlhsZjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgRm9ybWF0LlhsZjI6XG4gICAgY2FzZSBGb3JtYXQuWGxpZmYyOlxuICAgICAgZm9ybWF0ID0gRm9ybWF0LlhsZjI7XG4gICAgICBicmVhaztcbiAgfVxuXG4gIC8vIERlZmF1bHQgZm9ybWF0IGlzIHhsaWZmMVxuICByZXR1cm4gZm9ybWF0ID8/IEZvcm1hdC5YbGY7XG59XG5cbmNsYXNzIE5vRW1pdFBsdWdpbiB7XG4gIGFwcGx5KGNvbXBpbGVyOiB3ZWJwYWNrLkNvbXBpbGVyKTogdm9pZCB7XG4gICAgY29tcGlsZXIuaG9va3Muc2hvdWxkRW1pdC50YXAoJ2FuZ3VsYXItbm8tZW1pdCcsICgpID0+IGZhbHNlKTtcbiAgfVxufVxuXG4vKipcbiAqIEBleHBlcmltZW50YWwgRGlyZWN0IHVzYWdlIG9mIHRoaXMgZnVuY3Rpb24gaXMgY29uc2lkZXJlZCBleHBlcmltZW50YWwuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlKFxuICBvcHRpb25zOiBFeHRyYWN0STE4bkJ1aWxkZXJPcHRpb25zLFxuICBjb250ZXh0OiBCdWlsZGVyQ29udGV4dCxcbiAgdHJhbnNmb3Jtcz86IHtcbiAgICB3ZWJwYWNrQ29uZmlndXJhdGlvbj86IEV4ZWN1dGlvblRyYW5zZm9ybWVyPHdlYnBhY2suQ29uZmlndXJhdGlvbj47XG4gIH0sXG4pOiBQcm9taXNlPEJ1aWxkUmVzdWx0PiB7XG4gIC8vIENoZWNrIEFuZ3VsYXIgdmVyc2lvbi5cbiAgYXNzZXJ0Q29tcGF0aWJsZUFuZ3VsYXJWZXJzaW9uKGNvbnRleHQud29ya3NwYWNlUm9vdCk7XG5cbiAgLy8gUHVyZ2Ugb2xkIGJ1aWxkIGRpc2sgY2FjaGUuXG4gIGF3YWl0IHB1cmdlU3RhbGVCdWlsZENhY2hlKGNvbnRleHQpO1xuXG4gIGNvbnN0IGJyb3dzZXJUYXJnZXQgPSB0YXJnZXRGcm9tVGFyZ2V0U3RyaW5nKG9wdGlvbnMuYnJvd3NlclRhcmdldCk7XG4gIGNvbnN0IGJyb3dzZXJPcHRpb25zID0gYXdhaXQgY29udGV4dC52YWxpZGF0ZU9wdGlvbnM8SnNvbk9iamVjdCAmIEJyb3dzZXJCdWlsZGVyT3B0aW9ucz4oXG4gICAgYXdhaXQgY29udGV4dC5nZXRUYXJnZXRPcHRpb25zKGJyb3dzZXJUYXJnZXQpLFxuICAgIGF3YWl0IGNvbnRleHQuZ2V0QnVpbGRlck5hbWVGb3JUYXJnZXQoYnJvd3NlclRhcmdldCksXG4gICk7XG5cbiAgY29uc3QgZm9ybWF0ID0gbm9ybWFsaXplRm9ybWF0T3B0aW9uKG9wdGlvbnMpO1xuXG4gIC8vIFdlIG5lZWQgdG8gZGV0ZXJtaW5lIHRoZSBvdXRGaWxlIG5hbWUgc28gdGhhdCBBbmd1bGFyQ29tcGlsZXIgY2FuIHJldHJpZXZlIGl0LlxuICBsZXQgb3V0RmlsZSA9IG9wdGlvbnMub3V0RmlsZSB8fCBnZXRJMThuT3V0ZmlsZShmb3JtYXQpO1xuICBpZiAob3B0aW9ucy5vdXRwdXRQYXRoKSB7XG4gICAgLy8gQW5ndWxhckNvbXBpbGVyUGx1Z2luIGRvZXNuJ3Qgc3VwcG9ydCBnZW5EaXIgc28gd2UgaGF2ZSB0byBhZGp1c3Qgb3V0RmlsZSBpbnN0ZWFkLlxuICAgIG91dEZpbGUgPSBwYXRoLmpvaW4ob3B0aW9ucy5vdXRwdXRQYXRoLCBvdXRGaWxlKTtcbiAgfVxuICBvdXRGaWxlID0gcGF0aC5yZXNvbHZlKGNvbnRleHQud29ya3NwYWNlUm9vdCwgb3V0RmlsZSk7XG5cbiAgaWYgKCFjb250ZXh0LnRhcmdldCB8fCAhY29udGV4dC50YXJnZXQucHJvamVjdCkge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIGJ1aWxkZXIgcmVxdWlyZXMgYSB0YXJnZXQuJyk7XG4gIH1cblxuICB0cnkge1xuICAgIHJlcXVpcmUucmVzb2x2ZSgnQGFuZ3VsYXIvbG9jYWxpemUnKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgZXJyb3I6IGBpMThuIGV4dHJhY3Rpb24gcmVxdWlyZXMgdGhlICdAYW5ndWxhci9sb2NhbGl6ZScgcGFja2FnZS5gLFxuICAgICAgb3V0cHV0UGF0aDogb3V0RmlsZSxcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCBjb250ZXh0LmdldFByb2plY3RNZXRhZGF0YShjb250ZXh0LnRhcmdldCk7XG4gIGNvbnN0IGkxOG4gPSBjcmVhdGVJMThuT3B0aW9ucyhtZXRhZGF0YSk7XG5cbiAgbGV0IHVzZUxlZ2FjeUlkcyA9IHRydWU7XG5cbiAgY29uc3QgaXZ5TWVzc2FnZXM6IExvY2FsaXplTWVzc2FnZVtdID0gW107XG4gIGNvbnN0IGJ1aWxkZXJPcHRpb25zID0ge1xuICAgIC4uLmJyb3dzZXJPcHRpb25zLFxuICAgIG9wdGltaXphdGlvbjogZmFsc2UsXG4gICAgc291cmNlTWFwOiB7XG4gICAgICBzY3JpcHRzOiB0cnVlLFxuICAgICAgc3R5bGVzOiBmYWxzZSxcbiAgICAgIHZlbmRvcjogdHJ1ZSxcbiAgICB9LFxuICAgIGJ1aWxkT3B0aW1pemVyOiBmYWxzZSxcbiAgICBhb3Q6IHRydWUsXG4gICAgcHJvZ3Jlc3M6IG9wdGlvbnMucHJvZ3Jlc3MsXG4gICAgYnVkZ2V0czogW10sXG4gICAgYXNzZXRzOiBbXSxcbiAgICBzY3JpcHRzOiBbXSxcbiAgICBzdHlsZXM6IFtdLFxuICAgIGRlbGV0ZU91dHB1dFBhdGg6IGZhbHNlLFxuICAgIGV4dHJhY3RMaWNlbnNlczogZmFsc2UsXG4gICAgc3VicmVzb3VyY2VJbnRlZ3JpdHk6IGZhbHNlLFxuICAgIG91dHB1dEhhc2hpbmc6IE91dHB1dEhhc2hpbmcuTm9uZSxcbiAgICBuYW1lZENodW5rczogdHJ1ZSxcbiAgICBhbGxvd2VkQ29tbW9uSnNEZXBlbmRlbmNpZXM6IHVuZGVmaW5lZCxcbiAgfTtcbiAgY29uc3QgeyBjb25maWcsIHByb2plY3RSb290IH0gPSBhd2FpdCBnZW5lcmF0ZUJyb3dzZXJXZWJwYWNrQ29uZmlnRnJvbUNvbnRleHQoXG4gICAgYnVpbGRlck9wdGlvbnMsXG4gICAgY29udGV4dCxcbiAgICAod2NvKSA9PiB7XG4gICAgICAvLyBEZWZhdWx0IHZhbHVlIGZvciBsZWdhY3kgbWVzc2FnZSBpZHMgaXMgY3VycmVudGx5IHRydWVcbiAgICAgIHVzZUxlZ2FjeUlkcyA9IHdjby50c0NvbmZpZy5vcHRpb25zLmVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQgPz8gdHJ1ZTtcblxuICAgICAgY29uc3QgcGFydGlhbHM6IChQcm9taXNlPENvbmZpZ3VyYXRpb24+IHwgQ29uZmlndXJhdGlvbilbXSA9IFtcbiAgICAgICAgeyBwbHVnaW5zOiBbbmV3IE5vRW1pdFBsdWdpbigpXSB9LFxuICAgICAgICBnZXRDb21tb25Db25maWcod2NvKSxcbiAgICAgIF07XG5cbiAgICAgIC8vIEFkZCBJdnkgYXBwbGljYXRpb24gZmlsZSBleHRyYWN0b3Igc3VwcG9ydFxuICAgICAgcGFydGlhbHMudW5zaGlmdCh7XG4gICAgICAgIG1vZHVsZToge1xuICAgICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRlc3Q6IC9cXC5bY21dP1t0al1zeD8kLyxcbiAgICAgICAgICAgICAgbG9hZGVyOiByZXF1aXJlLnJlc29sdmUoJy4vaXZ5LWV4dHJhY3QtbG9hZGVyJyksXG4gICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlSGFuZGxlcjogKG1lc3NhZ2VzOiBMb2NhbGl6ZU1lc3NhZ2VbXSkgPT4gaXZ5TWVzc2FnZXMucHVzaCguLi5tZXNzYWdlcyksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgLy8gUmVwbGFjZSBhbGwgc3R5bGVzaGVldHMgd2l0aCBlbXB0eSBjb250ZW50XG4gICAgICBwYXJ0aWFscy5wdXNoKHtcbiAgICAgICAgbW9kdWxlOiB7XG4gICAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGVzdDogL1xcLihjc3N8c2Nzc3xzYXNzfGxlc3MpJC8sXG4gICAgICAgICAgICAgIGxvYWRlcjogcmVxdWlyZS5yZXNvbHZlKCcuL2VtcHR5LWxvYWRlcicpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBwYXJ0aWFscztcbiAgICB9LFxuICAgIC8vIER1cmluZyBleHRyYWN0aW9uIHdlIGRvbid0IG5lZWQgc3BlY2lmaWMgYnJvd3NlciBzdXBwb3J0LlxuICAgIHsgc3VwcG9ydGVkQnJvd3NlcnM6IHVuZGVmaW5lZCB9LFxuICApO1xuXG4gIC8vIEFsbCB0aGUgbG9jYWxpemUgdXNhZ2VzIGFyZSBzZXR1cCB0byBmaXJzdCB0cnkgdGhlIEVTTSBlbnRyeSBwb2ludCB0aGVuIGZhbGxiYWNrIHRvIHRoZSBkZWVwIGltcG9ydHMuXG4gIC8vIFRoaXMgcHJvdmlkZXMgaW50ZXJpbSBjb21wYXRpYmlsaXR5IHdoaWxlIHRoZSBmcmFtZXdvcmsgaXMgdHJhbnNpdGlvbmVkIHRvIGJ1bmRsZWQgRVNNIHBhY2thZ2VzLlxuICBjb25zdCBsb2NhbGl6ZVRvb2xzTW9kdWxlID0gYXdhaXQgbG9hZEVzbU1vZHVsZTx0eXBlb2YgaW1wb3J0KCdAYW5ndWxhci9sb2NhbGl6ZS90b29scycpPihcbiAgICAnQGFuZ3VsYXIvbG9jYWxpemUvdG9vbHMnLFxuICApO1xuICBjb25zdCB3ZWJwYWNrUmVzdWx0ID0gYXdhaXQgcnVuV2VicGFjayhcbiAgICAoYXdhaXQgdHJhbnNmb3Jtcz8ud2VicGFja0NvbmZpZ3VyYXRpb24/Lihjb25maWcpKSB8fCBjb25maWcsXG4gICAgY29udGV4dCxcbiAgICB7XG4gICAgICBsb2dnaW5nOiBjcmVhdGVXZWJwYWNrTG9nZ2luZ0NhbGxiYWNrKGJ1aWxkZXJPcHRpb25zLCBjb250ZXh0LmxvZ2dlciksXG4gICAgICB3ZWJwYWNrRmFjdG9yeTogd2VicGFjayxcbiAgICB9LFxuICApLnRvUHJvbWlzZSgpO1xuXG4gIC8vIFNldCB0aGUgb3V0cHV0UGF0aCB0byB0aGUgZXh0cmFjdGlvbiBvdXRwdXQgbG9jYXRpb24gZm9yIGRvd25zdHJlYW0gY29uc3VtZXJzXG4gIHdlYnBhY2tSZXN1bHQub3V0cHV0UGF0aCA9IG91dEZpbGU7XG5cbiAgLy8gQ29tcGxldGUgaWYgV2VicGFjayBidWlsZCBmYWlsZWRcbiAgaWYgKCF3ZWJwYWNrUmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICByZXR1cm4gd2VicGFja1Jlc3VsdDtcbiAgfVxuXG4gIGNvbnN0IGJhc2VQYXRoID0gY29uZmlnLmNvbnRleHQgfHwgcHJvamVjdFJvb3Q7XG5cbiAgY29uc3QgeyBjaGVja0R1cGxpY2F0ZU1lc3NhZ2VzIH0gPSBsb2NhbGl6ZVRvb2xzTW9kdWxlO1xuXG4gIC8vIFRoZSBmaWxlc3lzdGVtIGlzIHVzZWQgdG8gY3JlYXRlIGEgcmVsYXRpdmUgcGF0aCBmb3IgZWFjaCBmaWxlXG4gIC8vIGZyb20gdGhlIGJhc2VQYXRoLiAgVGhpcyByZWxhdGl2ZSBwYXRoIGlzIHRoZW4gdXNlZCBpbiB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgY29uc3QgY2hlY2tGaWxlU3lzdGVtID0ge1xuICAgIHJlbGF0aXZlKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gcGF0aC5yZWxhdGl2ZShmcm9tLCB0byk7XG4gICAgfSxcbiAgfTtcbiAgY29uc3QgZGlhZ25vc3RpY3MgPSBjaGVja0R1cGxpY2F0ZU1lc3NhZ2VzKFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgY2hlY2tGaWxlU3lzdGVtIGFzIGFueSxcbiAgICBpdnlNZXNzYWdlcyxcbiAgICAnd2FybmluZycsXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBiYXNlUGF0aCBhcyBhbnksXG4gICk7XG4gIGlmIChkaWFnbm9zdGljcy5tZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgY29udGV4dC5sb2dnZXIud2FybihkaWFnbm9zdGljcy5mb3JtYXREaWFnbm9zdGljcygnJykpO1xuICB9XG5cbiAgLy8gU2VyaWFsaXplIGFsbCBleHRyYWN0ZWQgbWVzc2FnZXNcbiAgY29uc3Qgc2VyaWFsaXplciA9IGF3YWl0IGdldFNlcmlhbGl6ZXIoXG4gICAgbG9jYWxpemVUb29sc01vZHVsZSxcbiAgICBmb3JtYXQsXG4gICAgaTE4bi5zb3VyY2VMb2NhbGUsXG4gICAgYmFzZVBhdGgsXG4gICAgdXNlTGVnYWN5SWRzLFxuICAgIGRpYWdub3N0aWNzLFxuICApO1xuICBjb25zdCBjb250ZW50ID0gc2VyaWFsaXplci5zZXJpYWxpemUoaXZ5TWVzc2FnZXMpO1xuXG4gIC8vIEVuc3VyZSBkaXJlY3RvcnkgZXhpc3RzXG4gIGNvbnN0IG91dHB1dFBhdGggPSBwYXRoLmRpcm5hbWUob3V0RmlsZSk7XG4gIGlmICghZnMuZXhpc3RzU3luYyhvdXRwdXRQYXRoKSkge1xuICAgIGZzLm1rZGlyU3luYyhvdXRwdXRQYXRoLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgfVxuXG4gIC8vIFdyaXRlIHRyYW5zbGF0aW9uIGZpbGVcbiAgZnMud3JpdGVGaWxlU3luYyhvdXRGaWxlLCBjb250ZW50KTtcblxuICByZXR1cm4gd2VicGFja1Jlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlQnVpbGRlcjxFeHRyYWN0STE4bkJ1aWxkZXJPcHRpb25zPihleGVjdXRlKTtcbiJdfQ==