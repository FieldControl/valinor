"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const architect_1 = require("@angular-devkit/architect");
const build_webpack_1 = require("@angular-devkit/build-webpack");
const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const schema_1 = require("../browser/schema");
const i18n_options_1 = require("../utils/i18n-options");
const version_1 = require("../utils/version");
const webpack_browser_config_1 = require("../utils/webpack-browser-config");
const configs_1 = require("../webpack/configs");
const stats_1 = require("../webpack/utils/stats");
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
async function getSerializer(format, sourceLocale, basePath, useLegacyIds, diagnostics) {
    switch (format) {
        case schema_2.Format.Xmb:
            const { XmbTranslationSerializer } = await Promise.resolve().then(() => require('@angular/localize/src/tools/src/extract/translation_files/xmb_translation_serializer'));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new XmbTranslationSerializer(basePath, useLegacyIds);
        case schema_2.Format.Xlf:
        case schema_2.Format.Xlif:
        case schema_2.Format.Xliff:
            const { Xliff1TranslationSerializer } = await Promise.resolve().then(() => require('@angular/localize/src/tools/src/extract/translation_files/xliff1_translation_serializer'));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new Xliff1TranslationSerializer(sourceLocale, basePath, useLegacyIds, {});
        case schema_2.Format.Xlf2:
        case schema_2.Format.Xliff2:
            const { Xliff2TranslationSerializer } = await Promise.resolve().then(() => require('@angular/localize/src/tools/src/extract/translation_files/xliff2_translation_serializer'));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new Xliff2TranslationSerializer(sourceLocale, basePath, useLegacyIds, {});
        case schema_2.Format.Json:
            const { SimpleJsonTranslationSerializer } = await Promise.resolve().then(() => require('@angular/localize/src/tools/src/extract/translation_files/json_translation_serializer'));
            return new SimpleJsonTranslationSerializer(sourceLocale);
        case schema_2.Format.LegacyMigrate:
            const { LegacyMessageIdMigrationSerializer } = await Promise.resolve().then(() => require('@angular/localize/src/tools/src/extract/translation_files/legacy_message_id_migration_serializer'));
            return new LegacyMessageIdMigrationSerializer(diagnostics);
        case schema_2.Format.Arb:
            const { ArbTranslationSerializer } = await Promise.resolve().then(() => require('@angular/localize/src/tools/src/extract/translation_files/arb_translation_serializer'));
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
    version_1.assertCompatibleAngularVersion(context.workspaceRoot, context.logger);
    const browserTarget = architect_1.targetFromTargetString(options.browserTarget);
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
    const metadata = await context.getProjectMetadata(context.target);
    const i18n = i18n_options_1.createI18nOptions(metadata);
    let useLegacyIds = true;
    const ivyMessages = [];
    const { config, projectRoot } = await webpack_browser_config_1.generateBrowserWebpackConfigFromContext({
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
    }, context, (wco) => {
        var _a;
        if (wco.tsConfig.options.enableIvy === false) {
            context.logger.warn('Ivy extraction enabled but application is not Ivy enabled. Extraction may fail.');
        }
        // Default value for legacy message ids is currently true
        useLegacyIds = (_a = wco.tsConfig.options.enableI18nLegacyMessageIdFormat) !== null && _a !== void 0 ? _a : true;
        const partials = [
            { plugins: [new NoEmitPlugin()] },
            configs_1.getCommonConfig(wco),
            configs_1.getBrowserConfig(wco),
            configs_1.getTypeScriptConfig(wco),
            configs_1.getWorkerConfig(wco),
            configs_1.getStatsConfig(wco),
        ];
        // Add Ivy application file extractor support
        partials.unshift({
            module: {
                rules: [
                    {
                        test: /\.[t|j]s$/,
                        loader: require.resolve('./ivy-extract-loader'),
                        options: {
                            messageHandler: (messages) => ivyMessages.push(...messages),
                        },
                    },
                ],
            },
        });
        // Replace all stylesheets with an empty default export
        partials.push({
            plugins: [
                new webpack.NormalModuleReplacementPlugin(/\.(css|scss|sass|styl|less)$/, path.join(__dirname, 'empty-export-default.js')),
                new webpack.NormalModuleReplacementPlugin(/^angular-resource:\/\//, path.join(__dirname, 'empty-export-default.js')),
            ],
        });
        return partials;
    });
    try {
        require.resolve('@angular/localize');
    }
    catch {
        return {
            success: false,
            error: `Ivy extraction requires the '@angular/localize' package.`,
            outputPath: outFile,
        };
    }
    const webpackResult = await build_webpack_1.runWebpack((await ((_a = transforms === null || transforms === void 0 ? void 0 : transforms.webpackConfiguration) === null || _a === void 0 ? void 0 : _a.call(transforms, config))) || config, context, {
        logging: stats_1.createWebpackLoggingCallback(false, context.logger),
        webpackFactory: webpack,
    }).toPromise();
    // Set the outputPath to the extraction output location for downstream consumers
    webpackResult.outputPath = outFile;
    // Complete if Webpack build failed
    if (!webpackResult.success) {
        return webpackResult;
    }
    const basePath = config.context || projectRoot;
    const { checkDuplicateMessages } = await Promise.resolve().then(() => require('@angular/localize/src/tools/src/extract/duplicates'));
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
    const serializer = await getSerializer(format, i18n.sourceLocale, basePath, useLegacyIds, diagnostics);
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
exports.default = architect_1.createBuilder(execute);
