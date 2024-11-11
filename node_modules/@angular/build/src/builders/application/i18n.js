"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.inlineI18n = inlineI18n;
exports.loadActiveTranslations = loadActiveTranslations;
const node_path_1 = require("node:path");
const bundler_context_1 = require("../../tools/esbuild/bundler-context");
const i18n_inliner_1 = require("../../tools/esbuild/i18n-inliner");
const environment_options_1 = require("../../utils/environment-options");
const i18n_options_1 = require("../../utils/i18n-options");
const load_translations_1 = require("../../utils/load-translations");
const url_1 = require("../../utils/url");
const execute_post_bundle_1 = require("./execute-post-bundle");
/**
 * Inlines all active locales as specified by the application build options into all
 * application JavaScript files created during the build.
 * @param options The normalized application builder options used to create the build.
 * @param executionResult The result of an executed build.
 * @param initialFiles A map containing initial file information for the executed build.
 */
async function inlineI18n(options, executionResult, initialFiles) {
    // Create the multi-threaded inliner with common options and the files generated from the build.
    const inliner = new i18n_inliner_1.I18nInliner({
        missingTranslation: options.i18nOptions.missingTranslationBehavior ?? 'warning',
        outputFiles: executionResult.outputFiles,
        shouldOptimize: options.optimizationOptions.scripts,
    }, environment_options_1.maxWorkers);
    const inlineResult = {
        errors: [],
        warnings: [],
        prerenderedRoutes: [],
    };
    // For each active locale, use the inliner to process the output files of the build.
    const updatedOutputFiles = [];
    const updatedAssetFiles = [];
    try {
        for (const locale of options.i18nOptions.inlineLocales) {
            // A locale specific set of files is returned from the inliner.
            const localeInlineResult = await inliner.inlineForLocale(locale, options.i18nOptions.locales[locale].translation);
            const localeOutputFiles = localeInlineResult.outputFiles;
            inlineResult.errors.push(...localeInlineResult.errors);
            inlineResult.warnings.push(...localeInlineResult.warnings);
            const baseHref = getLocaleBaseHref(options.baseHref, options.i18nOptions, locale) ?? options.baseHref;
            const { errors, warnings, additionalAssets, additionalOutputFiles, prerenderedRoutes: generatedRoutes, } = await (0, execute_post_bundle_1.executePostBundleSteps)({
                ...options,
                baseHref,
            }, localeOutputFiles, executionResult.assetFiles, initialFiles, locale);
            localeOutputFiles.push(...additionalOutputFiles);
            inlineResult.errors.push(...errors);
            inlineResult.warnings.push(...warnings);
            // Update directory with locale base
            if (options.i18nOptions.flatOutput !== true) {
                localeOutputFiles.forEach((file) => {
                    file.path = (0, node_path_1.join)(locale, file.path);
                });
                for (const assetFile of [...executionResult.assetFiles, ...additionalAssets]) {
                    updatedAssetFiles.push({
                        source: assetFile.source,
                        destination: (0, node_path_1.join)(locale, assetFile.destination),
                    });
                }
                inlineResult.prerenderedRoutes.push(...generatedRoutes.map((route) => node_path_1.posix.join('/', locale, route)));
            }
            else {
                inlineResult.prerenderedRoutes.push(...generatedRoutes);
                executionResult.assetFiles.push(...additionalAssets);
            }
            updatedOutputFiles.push(...localeOutputFiles);
        }
    }
    finally {
        await inliner.close();
    }
    // Update the result with all localized files.
    executionResult.outputFiles = [
        // Root files are not modified.
        ...executionResult.outputFiles.filter(({ type }) => type === bundler_context_1.BuildOutputFileType.Root),
        // Updated files for each locale.
        ...updatedOutputFiles,
    ];
    // Assets are only changed if not using the flat output option
    if (options.i18nOptions.flatOutput !== true) {
        executionResult.assetFiles = updatedAssetFiles;
    }
    return inlineResult;
}
function getLocaleBaseHref(baseHref, i18n, locale) {
    if (i18n.flatOutput) {
        return undefined;
    }
    if (i18n.locales[locale] && i18n.locales[locale].baseHref !== '') {
        return (0, url_1.urlJoin)(baseHref || '', i18n.locales[locale].baseHref ?? `/${locale}/`);
    }
    return undefined;
}
/**
 * Loads all active translations using the translation loaders from the `@angular/localize` package.
 * @param context The architect builder context for the current build.
 * @param i18n The normalized i18n options to use.
 */
async function loadActiveTranslations(context, i18n) {
    // Load locale data and translations (if present)
    let loader;
    for (const [locale, desc] of Object.entries(i18n.locales)) {
        if (!i18n.inlineLocales.has(locale) && locale !== i18n.sourceLocale) {
            continue;
        }
        if (!desc.files.length) {
            continue;
        }
        loader ??= await (0, load_translations_1.createTranslationLoader)();
        (0, i18n_options_1.loadTranslations)(locale, desc, context.workspaceRoot, loader, {
            warn(message) {
                context.logger.warn(message);
            },
            error(message) {
                throw new Error(message);
            },
        }, undefined, i18n.duplicateTranslationBehavior);
    }
}
