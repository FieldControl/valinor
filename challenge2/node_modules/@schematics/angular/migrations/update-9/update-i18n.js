"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateI18nConfig = void 0;
const path_1 = require("path");
const dependencies_1 = require("../../utility/dependencies");
const latest_versions_1 = require("../../utility/latest-versions");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
function updateI18nConfig() {
    return (tree, { logger }) => workspace_1.updateWorkspace((workspace) => {
        // Process extraction targets first since they use browser option values
        for (const [, target, , project] of workspace_1.allWorkspaceTargets(workspace)) {
            switch (target.builder) {
                case workspace_models_1.Builders.ExtractI18n:
                    addProjectI18NOptions(tree, target, project);
                    removeExtracti18nDeprecatedOptions(target);
                    break;
            }
        }
        for (const [, target] of workspace_1.allWorkspaceTargets(workspace)) {
            switch (target.builder) {
                case workspace_models_1.Builders.Browser:
                case workspace_models_1.Builders.Server:
                    updateBaseHrefs(target);
                    removeFormatOption(target);
                    addBuilderI18NOptions(target, logger);
                    break;
            }
        }
    });
}
exports.updateI18nConfig = updateI18nConfig;
function addProjectI18NOptions(tree, builderConfig, projectConfig) {
    const browserConfig = projectConfig.targets.get('build');
    if (!browserConfig || browserConfig.builder !== workspace_models_1.Builders.Browser) {
        return;
    }
    // browser builder options
    let locales;
    for (const [, options] of workspace_1.allTargetOptions(browserConfig)) {
        const localeId = options.i18nLocale;
        if (typeof localeId !== 'string') {
            continue;
        }
        const localeFile = options.i18nFile;
        if (typeof localeFile !== 'string') {
            continue;
        }
        let baseHref = options.baseHref;
        if (typeof baseHref === 'string') {
            // If the configuration baseHref is already the default locale value, do not include it
            if (baseHref === `/${localeId}/`) {
                baseHref = undefined;
            }
        }
        else {
            // If the configuration does not contain a baseHref, ensure the main option value is used.
            baseHref = '';
        }
        if (!locales) {
            locales = {
                [localeId]: baseHref === undefined
                    ? localeFile
                    : {
                        translation: localeFile,
                        baseHref,
                    },
            };
        }
        else {
            locales[localeId] =
                baseHref === undefined
                    ? localeFile
                    : {
                        translation: localeFile,
                        baseHref,
                    };
        }
    }
    if (locales) {
        // Get sourceLocale from extract-i18n builder
        const i18nOptions = [...workspace_1.allTargetOptions(builderConfig)];
        const sourceLocale = i18nOptions
            .map(([, o]) => o.i18nLocale)
            .find((x) => !!x && typeof x === 'string');
        projectConfig.extensions['i18n'] = {
            locales,
            ...(sourceLocale ? { sourceLocale } : {}),
        };
        // Add @angular/localize if not already a dependency
        if (!dependencies_1.getPackageJsonDependency(tree, '@angular/localize')) {
            dependencies_1.addPackageJsonDependency(tree, {
                name: '@angular/localize',
                version: latest_versions_1.latestVersions.Angular,
                type: dependencies_1.NodeDependencyType.Default,
            });
        }
    }
}
function addBuilderI18NOptions(builderConfig, logger) {
    for (const [, options] of workspace_1.allTargetOptions(builderConfig)) {
        const localeId = options.i18nLocale;
        const i18nFile = options.i18nFile;
        const outputPath = options.outputPath;
        if (typeof localeId === 'string' && i18nFile && typeof outputPath === 'string') {
            if (outputPath.match(new RegExp(`[/\\\\]${localeId}[/\\\\]?$`))) {
                const newOutputPath = outputPath.replace(new RegExp(`[/\\\\]${localeId}[/\\\\]?$`), '');
                options.outputPath = newOutputPath;
            }
            else {
                logger.warn(`Output path value "${outputPath}" for locale "${localeId}" is not supported with the new localization system. ` +
                    `With the current value, the localized output would be written to "${path_1.posix.join(outputPath, localeId)}". ` +
                    `Keeping existing options for the target configuration of locale "${localeId}".`);
                continue;
            }
        }
        if (typeof localeId === 'string') {
            // add new localize option
            options.localize = [localeId];
            delete options.i18nLocale;
        }
        if (i18nFile !== undefined) {
            delete options.i18nFile;
        }
    }
}
function removeFormatOption(builderConfig) {
    for (const [, options] of workspace_1.allTargetOptions(builderConfig)) {
        // The format is always auto-detected now
        delete options.i18nFormat;
    }
}
function updateBaseHrefs(builderConfig) {
    var _a;
    const mainBaseHref = (_a = builderConfig.options) === null || _a === void 0 ? void 0 : _a.baseHref;
    const hasMainBaseHref = !!mainBaseHref && typeof mainBaseHref === 'string' && mainBaseHref !== '/';
    for (const [, options] of workspace_1.allTargetOptions(builderConfig)) {
        const localeId = options.i18nLocale;
        const i18nFile = options.i18nFile;
        // localize base HREF values are controlled by the i18n configuration
        const baseHref = options.baseHref;
        if (localeId !== undefined && i18nFile !== undefined && baseHref !== undefined) {
            // if the main option set has a non-default base href,
            // ensure that the augmented base href has the correct base value
            if (hasMainBaseHref) {
                options.baseHref = '/';
            }
            else {
                delete options.baseHref;
            }
        }
    }
}
function removeExtracti18nDeprecatedOptions(builderConfig) {
    for (const [, options] of workspace_1.allTargetOptions(builderConfig)) {
        // deprecated options
        delete options.i18nLocale;
        if (options.i18nFormat !== undefined) {
            // i18nFormat has been changed to format
            options.format = options.i18nFormat;
            delete options.i18nFormat;
        }
    }
}
