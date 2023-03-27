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
exports.loadTranslations = exports.configureI18nBuild = exports.createI18nOptions = void 0;
const core_1 = require("@angular-devkit/core");
const fs_1 = __importDefault(require("fs"));
const module_1 = __importDefault(require("module"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const schema_1 = require("../builders/browser/schema");
const read_tsconfig_1 = require("../utils/read-tsconfig");
const load_translations_1 = require("./load-translations");
/**
 * The base module location used to search for locale specific data.
 */
const LOCALE_DATA_BASE_MODULE = '@angular/common/locales/global';
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
function createI18nOptions(metadata, inline) {
    if (metadata.i18n !== undefined && !core_1.json.isJsonObject(metadata.i18n)) {
        throw new Error('Project i18n field is malformed. Expected an object.');
    }
    metadata = metadata.i18n || {};
    const i18n = {
        inlineLocales: new Set(),
        // en-US is the default locale added to Angular applications (https://angular.io/guide/i18n#i18n-pipes)
        sourceLocale: 'en-US',
        locales: {},
        get shouldInline() {
            return this.inlineLocales.size > 0;
        },
    };
    let rawSourceLocale;
    let rawSourceLocaleBaseHref;
    if (core_1.json.isJsonObject(metadata.sourceLocale)) {
        rawSourceLocale = metadata.sourceLocale.code;
        if (metadata.sourceLocale.baseHref !== undefined &&
            typeof metadata.sourceLocale.baseHref !== 'string') {
            throw new Error('Project i18n sourceLocale baseHref field is malformed. Expected a string.');
        }
        rawSourceLocaleBaseHref = metadata.sourceLocale.baseHref;
    }
    else {
        rawSourceLocale = metadata.sourceLocale;
    }
    if (rawSourceLocale !== undefined) {
        if (typeof rawSourceLocale !== 'string') {
            throw new Error('Project i18n sourceLocale field is malformed. Expected a string.');
        }
        i18n.sourceLocale = rawSourceLocale;
        i18n.hasDefinedSourceLocale = true;
    }
    i18n.locales[i18n.sourceLocale] = {
        files: [],
        baseHref: rawSourceLocaleBaseHref,
    };
    if (metadata.locales !== undefined && !core_1.json.isJsonObject(metadata.locales)) {
        throw new Error('Project i18n locales field is malformed. Expected an object.');
    }
    else if (metadata.locales) {
        for (const [locale, options] of Object.entries(metadata.locales)) {
            let translationFiles;
            let baseHref;
            if (core_1.json.isJsonObject(options)) {
                translationFiles = normalizeTranslationFileOption(options.translation, locale, false);
                if (typeof options.baseHref === 'string') {
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
exports.createI18nOptions = createI18nOptions;
async function configureI18nBuild(context, options) {
    if (!context.target) {
        throw new Error('The builder requires a target.');
    }
    const buildOptions = { ...options };
    const tsConfig = await (0, read_tsconfig_1.readTsconfig)(buildOptions.tsConfig, context.workspaceRoot);
    const metadata = await context.getProjectMetadata(context.target);
    const i18n = createI18nOptions(metadata, buildOptions.localize);
    // No additional processing needed if no inlining requested and no source locale defined.
    if (!i18n.shouldInline && !i18n.hasDefinedSourceLocale) {
        return { buildOptions, i18n };
    }
    const projectRoot = path_1.default.join(context.workspaceRoot, metadata.root || '');
    // The trailing slash is required to signal that the path is a directory and not a file.
    const projectRequire = module_1.default.createRequire(projectRoot + '/');
    const localeResolver = (locale) => projectRequire.resolve(path_1.default.join(LOCALE_DATA_BASE_MODULE, locale));
    // Load locale data and translations (if present)
    let loader;
    const usedFormats = new Set();
    for (const [locale, desc] of Object.entries(i18n.locales)) {
        if (!i18n.inlineLocales.has(locale) && locale !== i18n.sourceLocale) {
            continue;
        }
        let localeDataPath = findLocaleDataPath(locale, localeResolver);
        if (!localeDataPath) {
            const [first] = locale.split('-');
            if (first) {
                localeDataPath = findLocaleDataPath(first.toLowerCase(), localeResolver);
                if (localeDataPath) {
                    context.logger.warn(`Locale data for '${locale}' cannot be found. Using locale data for '${first}'.`);
                }
            }
        }
        if (!localeDataPath) {
            context.logger.warn(`Locale data for '${locale}' cannot be found. No locale data will be included for this locale.`);
        }
        else {
            desc.dataPath = localeDataPath;
        }
        if (!desc.files.length) {
            continue;
        }
        loader !== null && loader !== void 0 ? loader : (loader = await (0, load_translations_1.createTranslationLoader)());
        loadTranslations(locale, desc, context.workspaceRoot, loader, {
            warn(message) {
                context.logger.warn(message);
            },
            error(message) {
                throw new Error(message);
            },
        }, usedFormats, buildOptions.i18nDuplicateTranslation);
        if (usedFormats.size > 1 && tsConfig.options.enableI18nLegacyMessageIdFormat !== false) {
            // This limitation is only for legacy message id support (defaults to true as of 9.0)
            throw new Error('Localization currently only supports using one type of translation file format for the entire application.');
        }
    }
    // If inlining store the output in a temporary location to facilitate post-processing
    if (i18n.shouldInline) {
        // TODO: we should likely save these in the .angular directory in the next major version.
        // We'd need to do a migration to add the temp directory to gitignore.
        const tempPath = fs_1.default.mkdtempSync(path_1.default.join(fs_1.default.realpathSync(os_1.default.tmpdir()), 'angular-cli-i18n-'));
        buildOptions.outputPath = tempPath;
        process.on('exit', () => {
            try {
                fs_1.default.rmSync(tempPath, { force: true, recursive: true, maxRetries: 3 });
            }
            catch (_a) { }
        });
    }
    return { buildOptions, i18n };
}
exports.configureI18nBuild = configureI18nBuild;
function findLocaleDataPath(locale, resolver) {
    // Remove private use subtags
    const scrubbedLocale = locale.replace(/-x(-[a-zA-Z0-9]{1,8})+$/, '');
    try {
        return resolver(scrubbedLocale);
    }
    catch (_a) {
        // fallback to known existing en-US locale data as of 14.0
        return scrubbedLocale === 'en-US' ? findLocaleDataPath('en', resolver) : null;
    }
}
function loadTranslations(locale, desc, workspaceRoot, loader, logger, usedFormats, duplicateTranslation) {
    let translations = undefined;
    for (const file of desc.files) {
        const loadResult = loader(path_1.default.join(workspaceRoot, file.path));
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
        usedFormats === null || usedFormats === void 0 ? void 0 : usedFormats.add(loadResult.format);
        file.format = loadResult.format;
        file.integrity = loadResult.integrity;
        if (translations) {
            // Merge translations
            for (const [id, message] of Object.entries(loadResult.translations)) {
                if (translations[id] !== undefined) {
                    const duplicateTranslationMessage = `[${file.path}]: Duplicate translations for message '${id}' when merging.`;
                    switch (duplicateTranslation) {
                        case schema_1.I18NTranslation.Ignore:
                            break;
                        case schema_1.I18NTranslation.Error:
                            logger.error(`ERROR ${duplicateTranslationMessage}`);
                            break;
                        case schema_1.I18NTranslation.Warning:
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
exports.loadTranslations = loadTranslations;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi1vcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvdXRpbHMvaTE4bi1vcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7OztBQUdILCtDQUE0QztBQUM1Qyw0Q0FBb0I7QUFDcEIsb0RBQTRCO0FBQzVCLDRDQUFvQjtBQUNwQixnREFBd0I7QUFDeEIsdURBQTZGO0FBRTdGLDBEQUFzRDtBQUN0RCwyREFBaUY7QUFFakY7O0dBRUc7QUFDSCxNQUFNLHVCQUF1QixHQUFHLGdDQUFnQyxDQUFDO0FBc0JqRSxTQUFTLDhCQUE4QixDQUNyQyxNQUFzQixFQUN0QixNQUFjLEVBQ2QsbUJBQTRCO0lBRTVCLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1FBQzlCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNqQjtJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPLE9BQU8sS0FBSyxRQUFRLENBQUMsRUFBRTtRQUNuRixPQUFPLE1BQWtCLENBQUM7S0FDM0I7SUFFRCxJQUFJLFlBQVksR0FBRyxxREFBcUQsTUFBTSxrQkFBa0IsQ0FBQztJQUNqRyxJQUFJLG1CQUFtQixFQUFFO1FBQ3ZCLFlBQVksSUFBSSxpREFBaUQsQ0FBQztLQUNuRTtTQUFNO1FBQ0wsWUFBWSxJQUFJLHdDQUF3QyxDQUFDO0tBQzFEO0lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRUQsU0FBZ0IsaUJBQWlCLENBQy9CLFFBQXlCLEVBQ3pCLE1BQTJCO0lBRTNCLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksQ0FB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QUFZLEVBQUU7WUFDaEIscUJBQXFCO1lBQ3JCLEtBQUssTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDbkUsSUFBSSxZQUFZLENBQUMsRUFBRSxDQUFDLEtBQUssU0FBUyxFQUFFO29CQUNsQyxNQUFNLDJCQUEyQixHQUFHLElBQUksSUFBSSxDQUFDLElBQUksMENBQTBDLEVBQUUsaUJBQWlCLENBQUM7b0JBQy9HLFFBQVEsb0JBQW9CLEVBQUU7d0JBQzVCLEtBQUssd0JBQWUsQ0FBQyxNQUFNOzRCQUN6QixNQUFNO3dCQUNSLEtBQUssd0JBQWUsQ0FBQyxLQUFLOzRCQUN4QixNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDOzRCQUNyRCxNQUFNO3dCQUNSLEtBQUssd0JBQWUsQ0FBQyxPQUFPLENBQUM7d0JBQzdCOzRCQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVywyQkFBMkIsRUFBRSxDQUFDLENBQUM7NEJBQ3RELE1BQU07cUJBQ1Q7aUJBQ0Y7Z0JBQ0QsWUFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQzthQUM1QjtTQUNGO2FBQU07WUFDTCxpQ0FBaUM7WUFDakMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7U0FDeEM7S0FDRjtJQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDO0FBQ2xDLENBQUM7QUF4REQsNENBd0RDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IEJ1aWxkZXJDb250ZXh0IH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2FyY2hpdGVjdCc7XG5pbXBvcnQgeyBqc29uIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBtb2R1bGUgZnJvbSAnbW9kdWxlJztcbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFNjaGVtYSBhcyBCcm93c2VyQnVpbGRlclNjaGVtYSwgSTE4TlRyYW5zbGF0aW9uIH0gZnJvbSAnLi4vYnVpbGRlcnMvYnJvd3Nlci9zY2hlbWEnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFNlcnZlckJ1aWxkZXJTY2hlbWEgfSBmcm9tICcuLi9idWlsZGVycy9zZXJ2ZXIvc2NoZW1hJztcbmltcG9ydCB7IHJlYWRUc2NvbmZpZyB9IGZyb20gJy4uL3V0aWxzL3JlYWQtdHNjb25maWcnO1xuaW1wb3J0IHsgVHJhbnNsYXRpb25Mb2FkZXIsIGNyZWF0ZVRyYW5zbGF0aW9uTG9hZGVyIH0gZnJvbSAnLi9sb2FkLXRyYW5zbGF0aW9ucyc7XG5cbi8qKlxuICogVGhlIGJhc2UgbW9kdWxlIGxvY2F0aW9uIHVzZWQgdG8gc2VhcmNoIGZvciBsb2NhbGUgc3BlY2lmaWMgZGF0YS5cbiAqL1xuY29uc3QgTE9DQUxFX0RBVEFfQkFTRV9NT0RVTEUgPSAnQGFuZ3VsYXIvY29tbW9uL2xvY2FsZXMvZ2xvYmFsJztcblxuZXhwb3J0IGludGVyZmFjZSBMb2NhbGVEZXNjcmlwdGlvbiB7XG4gIGZpbGVzOiB7XG4gICAgcGF0aDogc3RyaW5nO1xuICAgIGludGVncml0eT86IHN0cmluZztcbiAgICBmb3JtYXQ/OiBzdHJpbmc7XG4gIH1bXTtcbiAgdHJhbnNsYXRpb24/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgZGF0YVBhdGg/OiBzdHJpbmc7XG4gIGJhc2VIcmVmPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEkxOG5PcHRpb25zIHtcbiAgaW5saW5lTG9jYWxlczogU2V0PHN0cmluZz47XG4gIHNvdXJjZUxvY2FsZTogc3RyaW5nO1xuICBsb2NhbGVzOiBSZWNvcmQ8c3RyaW5nLCBMb2NhbGVEZXNjcmlwdGlvbj47XG4gIGZsYXRPdXRwdXQ/OiBib29sZWFuO1xuICByZWFkb25seSBzaG91bGRJbmxpbmU6IGJvb2xlYW47XG4gIGhhc0RlZmluZWRTb3VyY2VMb2NhbGU/OiBib29sZWFuO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVUcmFuc2xhdGlvbkZpbGVPcHRpb24oXG4gIG9wdGlvbjoganNvbi5Kc29uVmFsdWUsXG4gIGxvY2FsZTogc3RyaW5nLFxuICBleHBlY3RPYmplY3RJbkVycm9yOiBib29sZWFuLFxuKTogc3RyaW5nW10ge1xuICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gW29wdGlvbl07XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheShvcHRpb24pICYmIG9wdGlvbi5ldmVyeSgoZWxlbWVudCkgPT4gdHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSkge1xuICAgIHJldHVybiBvcHRpb24gYXMgc3RyaW5nW107XG4gIH1cblxuICBsZXQgZXJyb3JNZXNzYWdlID0gYFByb2plY3QgaTE4biBsb2NhbGVzIHRyYW5zbGF0aW9uIGZpZWxkIHZhbHVlIGZvciAnJHtsb2NhbGV9JyBpcyBtYWxmb3JtZWQuIGA7XG4gIGlmIChleHBlY3RPYmplY3RJbkVycm9yKSB7XG4gICAgZXJyb3JNZXNzYWdlICs9ICdFeHBlY3RlZCBhIHN0cmluZywgYXJyYXkgb2Ygc3RyaW5ncywgb3Igb2JqZWN0Lic7XG4gIH0gZWxzZSB7XG4gICAgZXJyb3JNZXNzYWdlICs9ICdFeHBlY3RlZCBhIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzLic7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUkxOG5PcHRpb25zKFxuICBtZXRhZGF0YToganNvbi5Kc29uT2JqZWN0LFxuICBpbmxpbmU/OiBib29sZWFuIHwgc3RyaW5nW10sXG4pOiBJMThuT3B0aW9ucyB7XG4gIGlmIChtZXRhZGF0YS5pMThuICE9PSB1bmRlZmluZWQgJiYgIWpzb24uaXNKc29uT2JqZWN0KG1ldGFkYXRhLmkxOG4pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQcm9qZWN0IGkxOG4gZmllbGQgaXMgbWFsZm9ybWVkLiBFeHBlY3RlZCBhbiBvYmplY3QuJyk7XG4gIH1cbiAgbWV0YWRhdGEgPSBtZXRhZGF0YS5pMThuIHx8IHt9O1xuXG4gIGNvbnN0IGkxOG46IEkxOG5PcHRpb25zID0ge1xuICAgIGlubGluZUxvY2FsZXM6IG5ldyBTZXQ8c3RyaW5nPigpLFxuICAgIC8vIGVuLVVTIGlzIHRoZSBkZWZhdWx0IGxvY2FsZSBhZGRlZCB0byBBbmd1bGFyIGFwcGxpY2F0aW9ucyAoaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL2kxOG4jaTE4bi1waXBlcylcbiAgICBzb3VyY2VMb2NhbGU6ICdlbi1VUycsXG4gICAgbG9jYWxlczoge30sXG4gICAgZ2V0IHNob3VsZElubGluZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmlubGluZUxvY2FsZXMuc2l6ZSA+IDA7XG4gICAgfSxcbiAgfTtcblxuICBsZXQgcmF3U291cmNlTG9jYWxlO1xuICBsZXQgcmF3U291cmNlTG9jYWxlQmFzZUhyZWY7XG4gIGlmIChqc29uLmlzSnNvbk9iamVjdChtZXRhZGF0YS5zb3VyY2VMb2NhbGUpKSB7XG4gICAgcmF3U291cmNlTG9jYWxlID0gbWV0YWRhdGEuc291cmNlTG9jYWxlLmNvZGU7XG4gICAgaWYgKFxuICAgICAgbWV0YWRhdGEuc291cmNlTG9jYWxlLmJhc2VIcmVmICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHR5cGVvZiBtZXRhZGF0YS5zb3VyY2VMb2NhbGUuYmFzZUhyZWYgIT09ICdzdHJpbmcnXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb2plY3QgaTE4biBzb3VyY2VMb2NhbGUgYmFzZUhyZWYgZmllbGQgaXMgbWFsZm9ybWVkLiBFeHBlY3RlZCBhIHN0cmluZy4nKTtcbiAgICB9XG4gICAgcmF3U291cmNlTG9jYWxlQmFzZUhyZWYgPSBtZXRhZGF0YS5zb3VyY2VMb2NhbGUuYmFzZUhyZWY7XG4gIH0gZWxzZSB7XG4gICAgcmF3U291cmNlTG9jYWxlID0gbWV0YWRhdGEuc291cmNlTG9jYWxlO1xuICB9XG5cbiAgaWYgKHJhd1NvdXJjZUxvY2FsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHR5cGVvZiByYXdTb3VyY2VMb2NhbGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb2plY3QgaTE4biBzb3VyY2VMb2NhbGUgZmllbGQgaXMgbWFsZm9ybWVkLiBFeHBlY3RlZCBhIHN0cmluZy4nKTtcbiAgICB9XG5cbiAgICBpMThuLnNvdXJjZUxvY2FsZSA9IHJhd1NvdXJjZUxvY2FsZTtcbiAgICBpMThuLmhhc0RlZmluZWRTb3VyY2VMb2NhbGUgPSB0cnVlO1xuICB9XG5cbiAgaTE4bi5sb2NhbGVzW2kxOG4uc291cmNlTG9jYWxlXSA9IHtcbiAgICBmaWxlczogW10sXG4gICAgYmFzZUhyZWY6IHJhd1NvdXJjZUxvY2FsZUJhc2VIcmVmLFxuICB9O1xuXG4gIGlmIChtZXRhZGF0YS5sb2NhbGVzICE9PSB1bmRlZmluZWQgJiYgIWpzb24uaXNKc29uT2JqZWN0KG1ldGFkYXRhLmxvY2FsZXMpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQcm9qZWN0IGkxOG4gbG9jYWxlcyBmaWVsZCBpcyBtYWxmb3JtZWQuIEV4cGVjdGVkIGFuIG9iamVjdC4nKTtcbiAgfSBlbHNlIGlmIChtZXRhZGF0YS5sb2NhbGVzKSB7XG4gICAgZm9yIChjb25zdCBbbG9jYWxlLCBvcHRpb25zXSBvZiBPYmplY3QuZW50cmllcyhtZXRhZGF0YS5sb2NhbGVzKSkge1xuICAgICAgbGV0IHRyYW5zbGF0aW9uRmlsZXM7XG4gICAgICBsZXQgYmFzZUhyZWY7XG4gICAgICBpZiAoanNvbi5pc0pzb25PYmplY3Qob3B0aW9ucykpIHtcbiAgICAgICAgdHJhbnNsYXRpb25GaWxlcyA9IG5vcm1hbGl6ZVRyYW5zbGF0aW9uRmlsZU9wdGlvbihvcHRpb25zLnRyYW5zbGF0aW9uLCBsb2NhbGUsIGZhbHNlKTtcblxuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuYmFzZUhyZWYgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgYmFzZUhyZWYgPSBvcHRpb25zLmJhc2VIcmVmO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0cmFuc2xhdGlvbkZpbGVzID0gbm9ybWFsaXplVHJhbnNsYXRpb25GaWxlT3B0aW9uKG9wdGlvbnMsIGxvY2FsZSwgdHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChsb2NhbGUgPT09IGkxOG4uc291cmNlTG9jYWxlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQW4gaTE4biBsb2NhbGUgKCcke2xvY2FsZX0nKSBjYW5ub3QgYm90aCBiZSBhIHNvdXJjZSBsb2NhbGUgYW5kIHByb3ZpZGUgYSB0cmFuc2xhdGlvbi5gLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpMThuLmxvY2FsZXNbbG9jYWxlXSA9IHtcbiAgICAgICAgZmlsZXM6IHRyYW5zbGF0aW9uRmlsZXMubWFwKChmaWxlKSA9PiAoeyBwYXRoOiBmaWxlIH0pKSxcbiAgICAgICAgYmFzZUhyZWYsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGlmIChpbmxpbmUgPT09IHRydWUpIHtcbiAgICBpMThuLmlubGluZUxvY2FsZXMuYWRkKGkxOG4uc291cmNlTG9jYWxlKTtcbiAgICBPYmplY3Qua2V5cyhpMThuLmxvY2FsZXMpLmZvckVhY2goKGxvY2FsZSkgPT4gaTE4bi5pbmxpbmVMb2NhbGVzLmFkZChsb2NhbGUpKTtcbiAgfSBlbHNlIGlmIChpbmxpbmUpIHtcbiAgICBmb3IgKGNvbnN0IGxvY2FsZSBvZiBpbmxpbmUpIHtcbiAgICAgIGlmICghaTE4bi5sb2NhbGVzW2xvY2FsZV0gJiYgaTE4bi5zb3VyY2VMb2NhbGUgIT09IGxvY2FsZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlcXVlc3RlZCBsb2NhbGUgJyR7bG9jYWxlfScgaXMgbm90IGRlZmluZWQgZm9yIHRoZSBwcm9qZWN0LmApO1xuICAgICAgfVxuXG4gICAgICBpMThuLmlubGluZUxvY2FsZXMuYWRkKGxvY2FsZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGkxOG47XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb25maWd1cmVJMThuQnVpbGQ8VCBleHRlbmRzIEJyb3dzZXJCdWlsZGVyU2NoZW1hIHwgU2VydmVyQnVpbGRlclNjaGVtYT4oXG4gIGNvbnRleHQ6IEJ1aWxkZXJDb250ZXh0LFxuICBvcHRpb25zOiBULFxuKTogUHJvbWlzZTx7XG4gIGJ1aWxkT3B0aW9uczogVDtcbiAgaTE4bjogSTE4bk9wdGlvbnM7XG59PiB7XG4gIGlmICghY29udGV4dC50YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBidWlsZGVyIHJlcXVpcmVzIGEgdGFyZ2V0LicpO1xuICB9XG5cbiAgY29uc3QgYnVpbGRPcHRpb25zID0geyAuLi5vcHRpb25zIH07XG4gIGNvbnN0IHRzQ29uZmlnID0gYXdhaXQgcmVhZFRzY29uZmlnKGJ1aWxkT3B0aW9ucy50c0NvbmZpZywgY29udGV4dC53b3Jrc3BhY2VSb290KTtcbiAgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCBjb250ZXh0LmdldFByb2plY3RNZXRhZGF0YShjb250ZXh0LnRhcmdldCk7XG4gIGNvbnN0IGkxOG4gPSBjcmVhdGVJMThuT3B0aW9ucyhtZXRhZGF0YSwgYnVpbGRPcHRpb25zLmxvY2FsaXplKTtcblxuICAvLyBObyBhZGRpdGlvbmFsIHByb2Nlc3NpbmcgbmVlZGVkIGlmIG5vIGlubGluaW5nIHJlcXVlc3RlZCBhbmQgbm8gc291cmNlIGxvY2FsZSBkZWZpbmVkLlxuICBpZiAoIWkxOG4uc2hvdWxkSW5saW5lICYmICFpMThuLmhhc0RlZmluZWRTb3VyY2VMb2NhbGUpIHtcbiAgICByZXR1cm4geyBidWlsZE9wdGlvbnMsIGkxOG4gfTtcbiAgfVxuXG4gIGNvbnN0IHByb2plY3RSb290ID0gcGF0aC5qb2luKGNvbnRleHQud29ya3NwYWNlUm9vdCwgKG1ldGFkYXRhLnJvb3QgYXMgc3RyaW5nKSB8fCAnJyk7XG4gIC8vIFRoZSB0cmFpbGluZyBzbGFzaCBpcyByZXF1aXJlZCB0byBzaWduYWwgdGhhdCB0aGUgcGF0aCBpcyBhIGRpcmVjdG9yeSBhbmQgbm90IGEgZmlsZS5cbiAgY29uc3QgcHJvamVjdFJlcXVpcmUgPSBtb2R1bGUuY3JlYXRlUmVxdWlyZShwcm9qZWN0Um9vdCArICcvJyk7XG4gIGNvbnN0IGxvY2FsZVJlc29sdmVyID0gKGxvY2FsZTogc3RyaW5nKSA9PlxuICAgIHByb2plY3RSZXF1aXJlLnJlc29sdmUocGF0aC5qb2luKExPQ0FMRV9EQVRBX0JBU0VfTU9EVUxFLCBsb2NhbGUpKTtcblxuICAvLyBMb2FkIGxvY2FsZSBkYXRhIGFuZCB0cmFuc2xhdGlvbnMgKGlmIHByZXNlbnQpXG4gIGxldCBsb2FkZXI7XG4gIGNvbnN0IHVzZWRGb3JtYXRzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGZvciAoY29uc3QgW2xvY2FsZSwgZGVzY10gb2YgT2JqZWN0LmVudHJpZXMoaTE4bi5sb2NhbGVzKSkge1xuICAgIGlmICghaTE4bi5pbmxpbmVMb2NhbGVzLmhhcyhsb2NhbGUpICYmIGxvY2FsZSAhPT0gaTE4bi5zb3VyY2VMb2NhbGUpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGxldCBsb2NhbGVEYXRhUGF0aCA9IGZpbmRMb2NhbGVEYXRhUGF0aChsb2NhbGUsIGxvY2FsZVJlc29sdmVyKTtcbiAgICBpZiAoIWxvY2FsZURhdGFQYXRoKSB7XG4gICAgICBjb25zdCBbZmlyc3RdID0gbG9jYWxlLnNwbGl0KCctJyk7XG4gICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgbG9jYWxlRGF0YVBhdGggPSBmaW5kTG9jYWxlRGF0YVBhdGgoZmlyc3QudG9Mb3dlckNhc2UoKSwgbG9jYWxlUmVzb2x2ZXIpO1xuICAgICAgICBpZiAobG9jYWxlRGF0YVBhdGgpIHtcbiAgICAgICAgICBjb250ZXh0LmxvZ2dlci53YXJuKFxuICAgICAgICAgICAgYExvY2FsZSBkYXRhIGZvciAnJHtsb2NhbGV9JyBjYW5ub3QgYmUgZm91bmQuIFVzaW5nIGxvY2FsZSBkYXRhIGZvciAnJHtmaXJzdH0nLmAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWxvY2FsZURhdGFQYXRoKSB7XG4gICAgICBjb250ZXh0LmxvZ2dlci53YXJuKFxuICAgICAgICBgTG9jYWxlIGRhdGEgZm9yICcke2xvY2FsZX0nIGNhbm5vdCBiZSBmb3VuZC4gTm8gbG9jYWxlIGRhdGEgd2lsbCBiZSBpbmNsdWRlZCBmb3IgdGhpcyBsb2NhbGUuYCxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlc2MuZGF0YVBhdGggPSBsb2NhbGVEYXRhUGF0aDtcbiAgICB9XG5cbiAgICBpZiAoIWRlc2MuZmlsZXMubGVuZ3RoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBsb2FkZXIgPz89IGF3YWl0IGNyZWF0ZVRyYW5zbGF0aW9uTG9hZGVyKCk7XG5cbiAgICBsb2FkVHJhbnNsYXRpb25zKFxuICAgICAgbG9jYWxlLFxuICAgICAgZGVzYyxcbiAgICAgIGNvbnRleHQud29ya3NwYWNlUm9vdCxcbiAgICAgIGxvYWRlcixcbiAgICAgIHtcbiAgICAgICAgd2FybihtZXNzYWdlKSB7XG4gICAgICAgICAgY29udGV4dC5sb2dnZXIud2FybihtZXNzYWdlKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3IobWVzc2FnZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB1c2VkRm9ybWF0cyxcbiAgICAgIGJ1aWxkT3B0aW9ucy5pMThuRHVwbGljYXRlVHJhbnNsYXRpb24sXG4gICAgKTtcblxuICAgIGlmICh1c2VkRm9ybWF0cy5zaXplID4gMSAmJiB0c0NvbmZpZy5vcHRpb25zLmVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQgIT09IGZhbHNlKSB7XG4gICAgICAvLyBUaGlzIGxpbWl0YXRpb24gaXMgb25seSBmb3IgbGVnYWN5IG1lc3NhZ2UgaWQgc3VwcG9ydCAoZGVmYXVsdHMgdG8gdHJ1ZSBhcyBvZiA5LjApXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdMb2NhbGl6YXRpb24gY3VycmVudGx5IG9ubHkgc3VwcG9ydHMgdXNpbmcgb25lIHR5cGUgb2YgdHJhbnNsYXRpb24gZmlsZSBmb3JtYXQgZm9yIHRoZSBlbnRpcmUgYXBwbGljYXRpb24uJyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgaW5saW5pbmcgc3RvcmUgdGhlIG91dHB1dCBpbiBhIHRlbXBvcmFyeSBsb2NhdGlvbiB0byBmYWNpbGl0YXRlIHBvc3QtcHJvY2Vzc2luZ1xuICBpZiAoaTE4bi5zaG91bGRJbmxpbmUpIHtcbiAgICAvLyBUT0RPOiB3ZSBzaG91bGQgbGlrZWx5IHNhdmUgdGhlc2UgaW4gdGhlIC5hbmd1bGFyIGRpcmVjdG9yeSBpbiB0aGUgbmV4dCBtYWpvciB2ZXJzaW9uLlxuICAgIC8vIFdlJ2QgbmVlZCB0byBkbyBhIG1pZ3JhdGlvbiB0byBhZGQgdGhlIHRlbXAgZGlyZWN0b3J5IHRvIGdpdGlnbm9yZS5cbiAgICBjb25zdCB0ZW1wUGF0aCA9IGZzLm1rZHRlbXBTeW5jKHBhdGguam9pbihmcy5yZWFscGF0aFN5bmMob3MudG1wZGlyKCkpLCAnYW5ndWxhci1jbGktaTE4bi0nKSk7XG4gICAgYnVpbGRPcHRpb25zLm91dHB1dFBhdGggPSB0ZW1wUGF0aDtcblxuICAgIHByb2Nlc3Mub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBmcy5ybVN5bmModGVtcFBhdGgsIHsgZm9yY2U6IHRydWUsIHJlY3Vyc2l2ZTogdHJ1ZSwgbWF4UmV0cmllczogMyB9KTtcbiAgICAgIH0gY2F0Y2gge31cbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7IGJ1aWxkT3B0aW9ucywgaTE4biB9O1xufVxuXG5mdW5jdGlvbiBmaW5kTG9jYWxlRGF0YVBhdGgobG9jYWxlOiBzdHJpbmcsIHJlc29sdmVyOiAobG9jYWxlOiBzdHJpbmcpID0+IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAvLyBSZW1vdmUgcHJpdmF0ZSB1c2Ugc3VidGFnc1xuICBjb25zdCBzY3J1YmJlZExvY2FsZSA9IGxvY2FsZS5yZXBsYWNlKC8teCgtW2EtekEtWjAtOV17MSw4fSkrJC8sICcnKTtcblxuICB0cnkge1xuICAgIHJldHVybiByZXNvbHZlcihzY3J1YmJlZExvY2FsZSk7XG4gIH0gY2F0Y2gge1xuICAgIC8vIGZhbGxiYWNrIHRvIGtub3duIGV4aXN0aW5nIGVuLVVTIGxvY2FsZSBkYXRhIGFzIG9mIDE0LjBcbiAgICByZXR1cm4gc2NydWJiZWRMb2NhbGUgPT09ICdlbi1VUycgPyBmaW5kTG9jYWxlRGF0YVBhdGgoJ2VuJywgcmVzb2x2ZXIpIDogbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFRyYW5zbGF0aW9ucyhcbiAgbG9jYWxlOiBzdHJpbmcsXG4gIGRlc2M6IExvY2FsZURlc2NyaXB0aW9uLFxuICB3b3Jrc3BhY2VSb290OiBzdHJpbmcsXG4gIGxvYWRlcjogVHJhbnNsYXRpb25Mb2FkZXIsXG4gIGxvZ2dlcjogeyB3YXJuOiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkOyBlcnJvcjogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCB9LFxuICB1c2VkRm9ybWF0cz86IFNldDxzdHJpbmc+LFxuICBkdXBsaWNhdGVUcmFuc2xhdGlvbj86IEkxOE5UcmFuc2xhdGlvbixcbikge1xuICBsZXQgdHJhbnNsYXRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgZm9yIChjb25zdCBmaWxlIG9mIGRlc2MuZmlsZXMpIHtcbiAgICBjb25zdCBsb2FkUmVzdWx0ID0gbG9hZGVyKHBhdGguam9pbih3b3Jrc3BhY2VSb290LCBmaWxlLnBhdGgpKTtcblxuICAgIGZvciAoY29uc3QgZGlhZ25vc3RpY3Mgb2YgbG9hZFJlc3VsdC5kaWFnbm9zdGljcy5tZXNzYWdlcykge1xuICAgICAgaWYgKGRpYWdub3N0aWNzLnR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKGBFcnJvciBwYXJzaW5nIHRyYW5zbGF0aW9uIGZpbGUgJyR7ZmlsZS5wYXRofSc6ICR7ZGlhZ25vc3RpY3MubWVzc2FnZX1gKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci53YXJuKGBXQVJOSU5HIFske2ZpbGUucGF0aH1dOiAke2RpYWdub3N0aWNzLm1lc3NhZ2V9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGxvYWRSZXN1bHQubG9jYWxlICE9PSB1bmRlZmluZWQgJiYgbG9hZFJlc3VsdC5sb2NhbGUgIT09IGxvY2FsZSkge1xuICAgICAgbG9nZ2VyLndhcm4oXG4gICAgICAgIGBXQVJOSU5HIFske2ZpbGUucGF0aH1dOiBGaWxlIHRhcmdldCBsb2NhbGUgKCcke2xvYWRSZXN1bHQubG9jYWxlfScpIGRvZXMgbm90IG1hdGNoIGNvbmZpZ3VyZWQgbG9jYWxlICgnJHtsb2NhbGV9JylgLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICB1c2VkRm9ybWF0cz8uYWRkKGxvYWRSZXN1bHQuZm9ybWF0KTtcbiAgICBmaWxlLmZvcm1hdCA9IGxvYWRSZXN1bHQuZm9ybWF0O1xuICAgIGZpbGUuaW50ZWdyaXR5ID0gbG9hZFJlc3VsdC5pbnRlZ3JpdHk7XG5cbiAgICBpZiAodHJhbnNsYXRpb25zKSB7XG4gICAgICAvLyBNZXJnZSB0cmFuc2xhdGlvbnNcbiAgICAgIGZvciAoY29uc3QgW2lkLCBtZXNzYWdlXSBvZiBPYmplY3QuZW50cmllcyhsb2FkUmVzdWx0LnRyYW5zbGF0aW9ucykpIHtcbiAgICAgICAgaWYgKHRyYW5zbGF0aW9uc1tpZF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvbnN0IGR1cGxpY2F0ZVRyYW5zbGF0aW9uTWVzc2FnZSA9IGBbJHtmaWxlLnBhdGh9XTogRHVwbGljYXRlIHRyYW5zbGF0aW9ucyBmb3IgbWVzc2FnZSAnJHtpZH0nIHdoZW4gbWVyZ2luZy5gO1xuICAgICAgICAgIHN3aXRjaCAoZHVwbGljYXRlVHJhbnNsYXRpb24pIHtcbiAgICAgICAgICAgIGNhc2UgSTE4TlRyYW5zbGF0aW9uLklnbm9yZTpcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEkxOE5UcmFuc2xhdGlvbi5FcnJvcjpcbiAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBFUlJPUiAke2R1cGxpY2F0ZVRyYW5zbGF0aW9uTWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEkxOE5UcmFuc2xhdGlvbi5XYXJuaW5nOlxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFdBUk5JTkcgJHtkdXBsaWNhdGVUcmFuc2xhdGlvbk1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGlvbnNbaWRdID0gbWVzc2FnZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRmlyc3Qgb3Igb25seSB0cmFuc2xhdGlvbiBmaWxlXG4gICAgICB0cmFuc2xhdGlvbnMgPSBsb2FkUmVzdWx0LnRyYW5zbGF0aW9ucztcbiAgICB9XG4gIH1cbiAgZGVzYy50cmFuc2xhdGlvbiA9IHRyYW5zbGF0aW9ucztcbn1cbiJdfQ==