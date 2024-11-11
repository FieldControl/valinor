"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createI18nOptions = createI18nOptions;
exports.loadTranslations = loadTranslations;
const node_path_1 = __importDefault(require("node:path"));
function normalizeTranslationFileOption(option, locale, expectObjectInError) {
    if (typeof option === 'string') {
        return [option];
    }
    if (Array.isArray(option) && option.every((element) => typeof element === 'string')) {
        return option;
    }
    let errorMessage = `Project i18n locales translation field value for '${locale}' is malformed. `;
    if (expectObjectInError) {
        errorMessage += 'Expected a string, array of strings, or object.';
    }
    else {
        errorMessage += 'Expected a string or array of strings.';
    }
    throw new Error(errorMessage);
}
function ensureObject(value, name) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`Project ${name} field is malformed. Expected an object.`);
    }
}
function ensureString(value, name) {
    if (typeof value !== 'string') {
        throw new Error(`Project ${name} field is malformed. Expected a string.`);
    }
}
function createI18nOptions(projectMetadata, inline) {
    const { i18n: metadata = {} } = projectMetadata;
    ensureObject(metadata, 'i18n');
    const i18n = {
        inlineLocales: new Set(),
        // en-US is the default locale added to Angular applications (https://angular.dev/guide/i18n/format-data-locale)
        sourceLocale: 'en-US',
        locales: {},
        get shouldInline() {
            return this.inlineLocales.size > 0;
        },
    };
    let rawSourceLocale;
    let rawSourceLocaleBaseHref;
    if (typeof metadata.sourceLocale === 'string') {
        rawSourceLocale = metadata.sourceLocale;
    }
    else if (metadata.sourceLocale !== undefined) {
        ensureObject(metadata.sourceLocale, 'i18n sourceLocale');
        if (metadata.sourceLocale.code !== undefined) {
            ensureString(metadata.sourceLocale.code, 'i18n sourceLocale code');
            rawSourceLocale = metadata.sourceLocale.code;
        }
        if (metadata.sourceLocale.baseHref !== undefined) {
            ensureString(metadata.sourceLocale.baseHref, 'i18n sourceLocale baseHref');
            rawSourceLocaleBaseHref = metadata.sourceLocale.baseHref;
        }
    }
    if (rawSourceLocale !== undefined) {
        i18n.sourceLocale = rawSourceLocale;
        i18n.hasDefinedSourceLocale = true;
    }
    i18n.locales[i18n.sourceLocale] = {
        files: [],
        baseHref: rawSourceLocaleBaseHref,
    };
    if (metadata.locales !== undefined) {
        ensureObject(metadata.locales, 'i18n locales');
        for (const [locale, options] of Object.entries(metadata.locales)) {
            let translationFiles;
            let baseHref;
            if (options && typeof options === 'object' && 'translation' in options) {
                translationFiles = normalizeTranslationFileOption(options.translation, locale, false);
                if ('baseHref' in options) {
                    ensureString(options.baseHref, `i18n locales ${locale} baseHref`);
                    baseHref = options.baseHref;
                }
            }
            else {
                translationFiles = normalizeTranslationFileOption(options, locale, true);
            }
            if (locale === i18n.sourceLocale) {
                throw new Error(`An i18n locale ('${locale}') cannot both be a source locale and provide a translation.`);
            }
            i18n.locales[locale] = {
                files: translationFiles.map((file) => ({ path: file })),
                baseHref,
            };
        }
    }
    if (inline === true) {
        i18n.inlineLocales.add(i18n.sourceLocale);
        Object.keys(i18n.locales).forEach((locale) => i18n.inlineLocales.add(locale));
    }
    else if (inline) {
        for (const locale of inline) {
            if (!i18n.locales[locale] && i18n.sourceLocale !== locale) {
                throw new Error(`Requested locale '${locale}' is not defined for the project.`);
            }
            i18n.inlineLocales.add(locale);
        }
    }
    return i18n;
}
function loadTranslations(locale, desc, workspaceRoot, loader, logger, usedFormats, duplicateTranslation) {
    let translations = undefined;
    for (const file of desc.files) {
        const loadResult = loader(node_path_1.default.join(workspaceRoot, file.path));
        for (const diagnostics of loadResult.diagnostics.messages) {
            if (diagnostics.type === 'error') {
                logger.error(`Error parsing translation file '${file.path}': ${diagnostics.message}`);
            }
            else {
                logger.warn(`WARNING [${file.path}]: ${diagnostics.message}`);
            }
        }
        if (loadResult.locale !== undefined && loadResult.locale !== locale) {
            logger.warn(`WARNING [${file.path}]: File target locale ('${loadResult.locale}') does not match configured locale ('${locale}')`);
        }
        usedFormats?.add(loadResult.format);
        file.format = loadResult.format;
        file.integrity = loadResult.integrity;
        if (translations) {
            // Merge translations
            for (const [id, message] of Object.entries(loadResult.translations)) {
                if (translations[id] !== undefined) {
                    const duplicateTranslationMessage = `[${file.path}]: Duplicate translations for message '${id}' when merging.`;
                    switch (duplicateTranslation) {
                        case 'ignore':
                            break;
                        case 'error':
                            logger.error(`ERROR ${duplicateTranslationMessage}`);
                            break;
                        case 'warning':
                        default:
                            logger.warn(`WARNING ${duplicateTranslationMessage}`);
                            break;
                    }
                }
                translations[id] = message;
            }
        }
        else {
            // First or only translation file
            translations = loadResult.translations;
        }
    }
    desc.translation = translations;
}
