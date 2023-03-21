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
exports.inlineLocales = void 0;
const remapping_1 = __importDefault(require("@ampproject/remapping"));
const core_1 = require("@babel/core");
const template_1 = __importDefault(require("@babel/template"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const worker_threads_1 = require("worker_threads");
const environment_options_1 = require("./environment-options");
const error_1 = require("./error");
const load_esm_1 = require("./load-esm");
// Lazy loaded webpack-sources object
// Webpack is only imported if needed during the processing
let webpackSources;
const { i18n } = (worker_threads_1.workerData || {});
/**
 * Internal flag to enable the direct usage of the `@angular/localize` translation plugins.
 * Their usage is currently several times slower than the string manipulation method.
 * Future work to optimize the plugins should enable plugin usage as the default.
 */
const USE_LOCALIZE_PLUGINS = false;
/**
 * Cached instance of the `@angular/localize/tools` module.
 * This is used to remove the need to repeatedly import the module per file translation.
 */
let localizeToolsModule;
/**
 * Attempts to load the `@angular/localize/tools` module containing the functionality to
 * perform the file translations.
 * This module must be dynamically loaded as it is an ESM module and this file is CommonJS.
 */
async function loadLocalizeTools() {
    if (localizeToolsModule !== undefined) {
        return localizeToolsModule;
    }
    // Load ESM `@angular/localize/tools` using the TypeScript dynamic import workaround.
    // Once TypeScript provides support for keeping the dynamic import this workaround can be
    // changed to a direct dynamic import.
    return (0, load_esm_1.loadEsmModule)('@angular/localize/tools');
}
async function createI18nPlugins(locale, translation, missingTranslation, shouldInline, localeDataContent) {
    const { Diagnostics, makeEs2015TranslatePlugin, makeLocalePlugin } = await loadLocalizeTools();
    const plugins = [];
    const diagnostics = new Diagnostics();
    if (shouldInline) {
        plugins.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        makeEs2015TranslatePlugin(diagnostics, (translation || {}), {
            missingTranslation: translation === undefined ? 'ignore' : missingTranslation,
        }));
    }
    plugins.push(makeLocalePlugin(locale));
    if (localeDataContent) {
        plugins.push({
            visitor: {
                Program(path) {
                    path.unshiftContainer('body', template_1.default.ast(localeDataContent));
                },
            },
        });
    }
    return { diagnostics, plugins };
}
const localizeName = '$localize';
async function inlineLocales(options) {
    var _a;
    if (!i18n || i18n.inlineLocales.size === 0) {
        return { file: options.filename, diagnostics: [], count: 0 };
    }
    if (i18n.flatOutput && i18n.inlineLocales.size > 1) {
        throw new Error('Flat output is only supported when inlining one locale.');
    }
    const hasLocalizeName = options.code.includes(localizeName);
    if (!hasLocalizeName && !options.setLocale) {
        return inlineCopyOnly(options);
    }
    await loadLocalizeTools();
    let ast;
    try {
        ast = (0, core_1.parseSync)(options.code, {
            babelrc: false,
            configFile: false,
            sourceType: 'unambiguous',
            filename: options.filename,
        });
    }
    catch (error) {
        (0, error_1.assertIsError)(error);
        // Make the error more readable.
        // Same errors will contain the full content of the file as the error message
        // Which makes it hard to find the actual error message.
        const index = error.message.indexOf(')\n');
        const msg = index !== -1 ? error.message.slice(0, index + 1) : error.message;
        throw new Error(`${msg}\nAn error occurred inlining file "${options.filename}"`);
    }
    if (!ast) {
        throw new Error(`Unknown error occurred inlining file "${options.filename}"`);
    }
    if (!USE_LOCALIZE_PLUGINS) {
        return inlineLocalesDirect(ast, options);
    }
    const diagnostics = [];
    for (const locale of i18n.inlineLocales) {
        const isSourceLocale = locale === i18n.sourceLocale;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const translations = isSourceLocale ? {} : i18n.locales[locale].translation || {};
        let localeDataContent;
        if (options.setLocale) {
            // If locale data is provided, load it and prepend to file
            const localeDataPath = (_a = i18n.locales[locale]) === null || _a === void 0 ? void 0 : _a.dataPath;
            if (localeDataPath) {
                localeDataContent = await loadLocaleData(localeDataPath, true);
            }
        }
        const { diagnostics: localeDiagnostics, plugins } = await createI18nPlugins(locale, translations, isSourceLocale ? 'ignore' : options.missingTranslation || 'warning', true, localeDataContent);
        const transformResult = await (0, core_1.transformFromAstSync)(ast, options.code, {
            filename: options.filename,
            // using false ensures that babel will NOT search and process sourcemap comments (large memory usage)
            // The types do not include the false option even though it is valid
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            inputSourceMap: false,
            babelrc: false,
            configFile: false,
            plugins,
            compact: !environment_options_1.shouldBeautify,
            sourceMaps: !!options.map,
        });
        diagnostics.push(...localeDiagnostics.messages);
        if (!transformResult || !transformResult.code) {
            throw new Error(`Unknown error occurred processing bundle for "${options.filename}".`);
        }
        const outputPath = path.join(options.outputPath, i18n.flatOutput ? '' : locale, options.filename);
        await fs.writeFile(outputPath, transformResult.code);
        if (options.map && transformResult.map) {
            const outputMap = (0, remapping_1.default)([transformResult.map, options.map], () => null);
            await fs.writeFile(outputPath + '.map', JSON.stringify(outputMap));
        }
    }
    return { file: options.filename, diagnostics };
}
exports.inlineLocales = inlineLocales;
async function inlineLocalesDirect(ast, options) {
    if (!i18n || i18n.inlineLocales.size === 0) {
        return { file: options.filename, diagnostics: [], count: 0 };
    }
    const { default: generate } = await Promise.resolve().then(() => __importStar(require('@babel/generator')));
    const localizeDiag = await loadLocalizeTools();
    const diagnostics = new localizeDiag.Diagnostics();
    const positions = findLocalizePositions(ast, options, localizeDiag);
    if (positions.length === 0 && !options.setLocale) {
        return inlineCopyOnly(options);
    }
    const inputMap = !!options.map && JSON.parse(options.map);
    // Cleanup source root otherwise it will be added to each source entry
    const mapSourceRoot = inputMap && inputMap.sourceRoot;
    if (inputMap) {
        delete inputMap.sourceRoot;
    }
    // Load Webpack only when needed
    if (webpackSources === undefined) {
        webpackSources = (await Promise.resolve().then(() => __importStar(require('webpack')))).sources;
    }
    const { ConcatSource, OriginalSource, ReplaceSource, SourceMapSource } = webpackSources;
    for (const locale of i18n.inlineLocales) {
        const content = new ReplaceSource(inputMap
            ? new SourceMapSource(options.code, options.filename, inputMap)
            : new OriginalSource(options.code, options.filename));
        const isSourceLocale = locale === i18n.sourceLocale;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const translations = isSourceLocale ? {} : i18n.locales[locale].translation || {};
        for (const position of positions) {
            const translated = localizeDiag.translate(diagnostics, translations, position.messageParts, position.expressions, isSourceLocale ? 'ignore' : options.missingTranslation || 'warning');
            const expression = localizeDiag.buildLocalizeReplacement(translated[0], translated[1]);
            const { code } = generate(expression);
            content.replace(position.start, position.end - 1, code);
        }
        let outputSource = content;
        if (options.setLocale) {
            const setLocaleText = `globalThis.$localize=Object.assign(globalThis.$localize || {},{locale:"${locale}"});\n`;
            // If locale data is provided, load it and prepend to file
            let localeDataSource;
            const localeDataPath = i18n.locales[locale] && i18n.locales[locale].dataPath;
            if (localeDataPath) {
                const localeDataContent = await loadLocaleData(localeDataPath, true);
                localeDataSource = new OriginalSource(localeDataContent, path.basename(localeDataPath));
            }
            outputSource = localeDataSource
                ? // The semicolon ensures that there is no syntax error between statements
                    new ConcatSource(setLocaleText, localeDataSource, ';\n', content)
                : new ConcatSource(setLocaleText, content);
        }
        const { source: outputCode, map: outputMap } = outputSource.sourceAndMap();
        const outputPath = path.join(options.outputPath, i18n.flatOutput ? '' : locale, options.filename);
        await fs.writeFile(outputPath, outputCode);
        if (inputMap && outputMap) {
            outputMap.file = options.filename;
            if (mapSourceRoot) {
                outputMap.sourceRoot = mapSourceRoot;
            }
            await fs.writeFile(outputPath + '.map', JSON.stringify(outputMap));
        }
    }
    return { file: options.filename, diagnostics: diagnostics.messages, count: positions.length };
}
async function inlineCopyOnly(options) {
    if (!i18n) {
        throw new Error('i18n options are missing');
    }
    for (const locale of i18n.inlineLocales) {
        const outputPath = path.join(options.outputPath, i18n.flatOutput ? '' : locale, options.filename);
        await fs.writeFile(outputPath, options.code);
        if (options.map) {
            await fs.writeFile(outputPath + '.map', options.map);
        }
    }
    return { file: options.filename, diagnostics: [], count: 0 };
}
function findLocalizePositions(ast, options, utils) {
    const positions = [];
    // Workaround to ensure a path hub is present for traversal
    const { File } = require('@babel/core');
    const file = new File({}, { code: options.code, ast });
    (0, core_1.traverse)(file.ast, {
        TaggedTemplateExpression(path) {
            if (core_1.types.isIdentifier(path.node.tag) && path.node.tag.name === localizeName) {
                const [messageParts, expressions] = unwrapTemplateLiteral(path, utils);
                positions.push({
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    start: path.node.start,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    end: path.node.end,
                    messageParts,
                    expressions,
                });
            }
        },
    });
    return positions;
}
function unwrapTemplateLiteral(path, utils) {
    const [messageParts] = utils.unwrapMessagePartsFromTemplateLiteral(path.get('quasi').get('quasis'));
    const [expressions] = utils.unwrapExpressionsFromTemplateLiteral(path.get('quasi'));
    return [messageParts, expressions];
}
function unwrapLocalizeCall(path, utils) {
    const [messageParts] = utils.unwrapMessagePartsFromLocalizeCall(path);
    const [expressions] = utils.unwrapSubstitutionsFromLocalizeCall(path);
    return [messageParts, expressions];
}
async function loadLocaleData(path, optimize) {
    // The path is validated during option processing before the build starts
    const content = await fs.readFile(path, 'utf8');
    // Downlevel and optimize the data
    const transformResult = await (0, core_1.transformAsync)(content, {
        filename: path,
        // The types do not include the false option even though it is valid
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inputSourceMap: false,
        babelrc: false,
        configFile: false,
        presets: [
            [
                require.resolve('@babel/preset-env'),
                {
                    bugfixes: true,
                    targets: { esmodules: true },
                },
            ],
        ],
        minified: environment_options_1.allowMinify && optimize,
        compact: !environment_options_1.shouldBeautify && optimize,
        comments: !optimize,
    });
    if (!transformResult || !transformResult.code) {
        throw new Error(`Unknown error occurred processing bundle for "${path}".`);
    }
    return transformResult.code;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzcy1idW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy91dGlscy9wcm9jZXNzLWJ1bmRsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILHNFQUE4QztBQUM5QyxzQ0FRcUI7QUFDckIsK0RBQThDO0FBQzlDLGdEQUFrQztBQUNsQywyQ0FBNkI7QUFDN0IsbURBQTRDO0FBRTVDLCtEQUFvRTtBQUNwRSxtQ0FBd0M7QUFFeEMseUNBQTJDO0FBSzNDLHFDQUFxQztBQUNyQywyREFBMkQ7QUFDM0QsSUFBSSxjQUE0RCxDQUFDO0FBRWpFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLDJCQUFVLElBQUksRUFBRSxDQUEyQixDQUFDO0FBRTlEOzs7O0dBSUc7QUFDSCxNQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQztBQUluQzs7O0dBR0c7QUFDSCxJQUFJLG1CQUFzRCxDQUFDO0FBRTNEOzs7O0dBSUc7QUFDSCxLQUFLLFVBQVUsaUJBQWlCO0lBQzlCLElBQUksbUJBQW1CLEtBQUssU0FBUyxFQUFFO1FBQ3JDLE9BQU8sbUJBQW1CLENBQUM7S0FDNUI7SUFFRCxxRkFBcUY7SUFDckYseUZBQXlGO0lBQ3pGLHNDQUFzQztJQUN0QyxPQUFPLElBQUEsd0JBQWEsRUFBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ2xELENBQUM7QUFFRCxLQUFLLFVBQVUsaUJBQWlCLENBQzlCLE1BQWMsRUFDZCxXQUFnQyxFQUNoQyxrQkFBa0QsRUFDbEQsWUFBcUIsRUFDckIsaUJBQTBCO0lBRTFCLE1BQU0sRUFBRSxXQUFXLEVBQUUseUJBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxNQUFNLGlCQUFpQixFQUFFLENBQUM7SUFFL0YsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLE1BQU0sV0FBVyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7SUFFdEMsSUFBSSxZQUFZLEVBQUU7UUFDaEIsT0FBTyxDQUFDLElBQUk7UUFDViw4REFBOEQ7UUFDOUQseUJBQXlCLENBQUMsV0FBVyxFQUFFLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBUSxFQUFFO1lBQ2pFLGtCQUFrQixFQUFFLFdBQVcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsa0JBQWtCO1NBQzlFLENBQUMsQ0FDSCxDQUFDO0tBQ0g7SUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFFdkMsSUFBSSxpQkFBaUIsRUFBRTtRQUNyQixPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ1gsT0FBTyxFQUFFO2dCQUNQLE9BQU8sQ0FBQyxJQUE2QjtvQkFDbkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxrQkFBZSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hFLENBQUM7YUFDRjtTQUNGLENBQUMsQ0FBQztLQUNKO0lBRUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUNsQyxDQUFDO0FBU0QsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDO0FBRTFCLEtBQUssVUFBVSxhQUFhLENBQUMsT0FBc0I7O0lBQ3hELElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1FBQzFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztLQUM5RDtJQUNELElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7UUFDbEQsTUFBTSxJQUFJLEtBQUssQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO0tBQzVFO0lBRUQsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUQsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7UUFDMUMsT0FBTyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDaEM7SUFFRCxNQUFNLGlCQUFpQixFQUFFLENBQUM7SUFFMUIsSUFBSSxHQUFtQyxDQUFDO0lBQ3hDLElBQUk7UUFDRixHQUFHLEdBQUcsSUFBQSxnQkFBUyxFQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDNUIsT0FBTyxFQUFFLEtBQUs7WUFDZCxVQUFVLEVBQUUsS0FBSztZQUNqQixVQUFVLEVBQUUsYUFBYTtZQUN6QixRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7U0FDM0IsQ0FBQyxDQUFDO0tBQ0o7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLElBQUEscUJBQWEsRUFBQyxLQUFLLENBQUMsQ0FBQztRQUVyQixnQ0FBZ0M7UUFDaEMsNkVBQTZFO1FBQzdFLHdEQUF3RDtRQUN4RCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxNQUFNLEdBQUcsR0FBRyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDN0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsc0NBQXNDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0tBQ2xGO0lBRUQsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0tBQy9FO0lBRUQsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1FBQ3pCLE9BQU8sbUJBQW1CLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzFDO0lBRUQsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLEtBQUssTUFBTSxNQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtRQUN2QyxNQUFNLGNBQWMsR0FBRyxNQUFNLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQztRQUNwRCw4REFBOEQ7UUFDOUQsTUFBTSxZQUFZLEdBQVEsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztRQUN2RixJQUFJLGlCQUFpQixDQUFDO1FBQ3RCLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUNyQiwwREFBMEQ7WUFDMUQsTUFBTSxjQUFjLEdBQUcsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQywwQ0FBRSxRQUFRLENBQUM7WUFDdEQsSUFBSSxjQUFjLEVBQUU7Z0JBQ2xCLGlCQUFpQixHQUFHLE1BQU0sY0FBYyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNoRTtTQUNGO1FBRUQsTUFBTSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsR0FBRyxNQUFNLGlCQUFpQixDQUN6RSxNQUFNLEVBQ04sWUFBWSxFQUNaLGNBQWMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLElBQUksU0FBUyxFQUNuRSxJQUFJLEVBQ0osaUJBQWlCLENBQ2xCLENBQUM7UUFDRixNQUFNLGVBQWUsR0FBRyxNQUFNLElBQUEsMkJBQW9CLEVBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDcEUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO1lBQzFCLHFHQUFxRztZQUNyRyxvRUFBb0U7WUFDcEUsOERBQThEO1lBQzlELGNBQWMsRUFBRSxLQUFZO1lBQzVCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsVUFBVSxFQUFFLEtBQUs7WUFDakIsT0FBTztZQUNQLE9BQU8sRUFBRSxDQUFDLG9DQUFjO1lBQ3hCLFVBQVUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUc7U0FDMUIsQ0FBQyxDQUFDO1FBRUgsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRWhELElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFO1lBQzdDLE1BQU0sSUFBSSxLQUFLLENBQUMsaURBQWlELE9BQU8sQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO1NBQ3hGO1FBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FDMUIsT0FBTyxDQUFDLFVBQVUsRUFDbEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQzdCLE9BQU8sQ0FBQyxRQUFRLENBQ2pCLENBQUM7UUFDRixNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVyRCxJQUFJLE9BQU8sQ0FBQyxHQUFHLElBQUksZUFBZSxDQUFDLEdBQUcsRUFBRTtZQUN0QyxNQUFNLFNBQVMsR0FBRyxJQUFBLG1CQUFTLEVBQUMsQ0FBQyxlQUFlLENBQUMsR0FBcUIsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFOUYsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQ3BFO0tBQ0Y7SUFFRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLENBQUM7QUFDakQsQ0FBQztBQWpHRCxzQ0FpR0M7QUFFRCxLQUFLLFVBQVUsbUJBQW1CLENBQUMsR0FBZ0IsRUFBRSxPQUFzQjtJQUN6RSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtRQUMxQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7S0FDOUQ7SUFFRCxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLHdEQUFhLGtCQUFrQixHQUFDLENBQUM7SUFDL0QsTUFBTSxZQUFZLEdBQUcsTUFBTSxpQkFBaUIsRUFBRSxDQUFDO0lBQy9DLE1BQU0sV0FBVyxHQUFHLElBQUksWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBRW5ELE1BQU0sU0FBUyxHQUFHLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDcEUsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7UUFDaEQsT0FBTyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDaEM7SUFFRCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQTZCLENBQUM7SUFDdkYsc0VBQXNFO0lBQ3RFLE1BQU0sYUFBYSxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDO0lBQ3RELElBQUksUUFBUSxFQUFFO1FBQ1osT0FBTyxRQUFRLENBQUMsVUFBVSxDQUFDO0tBQzVCO0lBRUQsZ0NBQWdDO0lBQ2hDLElBQUksY0FBYyxLQUFLLFNBQVMsRUFBRTtRQUNoQyxjQUFjLEdBQUcsQ0FBQyx3REFBYSxTQUFTLEdBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztLQUNwRDtJQUNELE1BQU0sRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsR0FBRyxjQUFjLENBQUM7SUFFeEYsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1FBQ3ZDLE1BQU0sT0FBTyxHQUFHLElBQUksYUFBYSxDQUMvQixRQUFRO1lBQ04sQ0FBQyxDQUFDLElBQUksZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUM7WUFDL0QsQ0FBQyxDQUFDLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUN2RCxDQUFDO1FBRUYsTUFBTSxjQUFjLEdBQUcsTUFBTSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDcEQsOERBQThEO1FBQzlELE1BQU0sWUFBWSxHQUFRLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUM7UUFDdkYsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7WUFDaEMsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FDdkMsV0FBVyxFQUNYLFlBQVksRUFDWixRQUFRLENBQUMsWUFBWSxFQUNyQixRQUFRLENBQUMsV0FBVyxFQUNwQixjQUFjLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixJQUFJLFNBQVMsQ0FDcEUsQ0FBQztZQUVGLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkYsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUV0QyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDekQ7UUFFRCxJQUFJLFlBQVksR0FBcUMsT0FBTyxDQUFDO1FBQzdELElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUNyQixNQUFNLGFBQWEsR0FBRywwRUFBMEUsTUFBTSxRQUFRLENBQUM7WUFFL0csMERBQTBEO1lBQzFELElBQUksZ0JBQWdCLENBQUM7WUFDckIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUM3RSxJQUFJLGNBQWMsRUFBRTtnQkFDbEIsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLGNBQWMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3JFLGdCQUFnQixHQUFHLElBQUksY0FBYyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQzthQUN6RjtZQUVELFlBQVksR0FBRyxnQkFBZ0I7Z0JBQzdCLENBQUMsQ0FBQyx5RUFBeUU7b0JBQ3pFLElBQUksWUFBWSxDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDO2dCQUNuRSxDQUFDLENBQUMsSUFBSSxZQUFZLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQzlDO1FBRUQsTUFBTSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxHQUFHLFlBQVksQ0FBQyxZQUFZLEVBR3ZFLENBQUM7UUFDRixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUMxQixPQUFPLENBQUMsVUFBVSxFQUNsQixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFDN0IsT0FBTyxDQUFDLFFBQVEsQ0FDakIsQ0FBQztRQUNGLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFM0MsSUFBSSxRQUFRLElBQUksU0FBUyxFQUFFO1lBQ3pCLFNBQVMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztZQUNsQyxJQUFJLGFBQWEsRUFBRTtnQkFDakIsU0FBUyxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQUM7YUFDdEM7WUFDRCxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7U0FDcEU7S0FDRjtJQUVELE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2hHLENBQUM7QUFFRCxLQUFLLFVBQVUsY0FBYyxDQUFDLE9BQXNCO0lBQ2xELElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDVCxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7S0FDN0M7SUFFRCxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7UUFDdkMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FDMUIsT0FBTyxDQUFDLFVBQVUsRUFDbEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQzdCLE9BQU8sQ0FBQyxRQUFRLENBQ2pCLENBQUM7UUFDRixNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUU7WUFDZixNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEQ7S0FDRjtJQUVELE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUMvRCxDQUFDO0FBRUQsU0FBUyxxQkFBcUIsQ0FDNUIsR0FBZ0IsRUFDaEIsT0FBc0IsRUFDdEIsS0FBNEI7SUFFNUIsTUFBTSxTQUFTLEdBQXVCLEVBQUUsQ0FBQztJQUV6QywyREFBMkQ7SUFDM0QsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN4QyxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBRXZELElBQUEsZUFBUSxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDakIsd0JBQXdCLENBQUMsSUFBSTtZQUMzQixJQUFJLFlBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFO2dCQUM1RSxNQUFNLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxHQUFHLHFCQUFxQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdkUsU0FBUyxDQUFDLElBQUksQ0FBQztvQkFDYixvRUFBb0U7b0JBQ3BFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQU07b0JBQ3ZCLG9FQUFvRTtvQkFDcEUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBSTtvQkFDbkIsWUFBWTtvQkFDWixXQUFXO2lCQUNaLENBQUMsQ0FBQzthQUNKO1FBQ0gsQ0FBQztLQUNGLENBQUMsQ0FBQztJQUVILE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUM1QixJQUE4QyxFQUM5QyxLQUE0QjtJQUU1QixNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDLHFDQUFxQyxDQUNoRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FDaEMsQ0FBQztJQUNGLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxLQUFLLENBQUMsb0NBQW9DLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBRXBGLE9BQU8sQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDckMsQ0FBQztBQUVELFNBQVMsa0JBQWtCLENBQ3pCLElBQW9DLEVBQ3BDLEtBQTRCO0lBRTVCLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxLQUFLLENBQUMsa0NBQWtDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV0RSxPQUFPLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFFRCxLQUFLLFVBQVUsY0FBYyxDQUFDLElBQVksRUFBRSxRQUFpQjtJQUMzRCx5RUFBeUU7SUFDekUsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUVoRCxrQ0FBa0M7SUFDbEMsTUFBTSxlQUFlLEdBQUcsTUFBTSxJQUFBLHFCQUFjLEVBQUMsT0FBTyxFQUFFO1FBQ3BELFFBQVEsRUFBRSxJQUFJO1FBQ2Qsb0VBQW9FO1FBQ3BFLDhEQUE4RDtRQUM5RCxjQUFjLEVBQUUsS0FBWTtRQUM1QixPQUFPLEVBQUUsS0FBSztRQUNkLFVBQVUsRUFBRSxLQUFLO1FBQ2pCLE9BQU8sRUFBRTtZQUNQO2dCQUNFLE9BQU8sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7Z0JBQ3BDO29CQUNFLFFBQVEsRUFBRSxJQUFJO29CQUNkLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUU7aUJBQzdCO2FBQ0Y7U0FDRjtRQUNELFFBQVEsRUFBRSxpQ0FBVyxJQUFJLFFBQVE7UUFDakMsT0FBTyxFQUFFLENBQUMsb0NBQWMsSUFBSSxRQUFRO1FBQ3BDLFFBQVEsRUFBRSxDQUFDLFFBQVE7S0FDcEIsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUU7UUFDN0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxpREFBaUQsSUFBSSxJQUFJLENBQUMsQ0FBQztLQUM1RTtJQUVELE9BQU8sZUFBZSxDQUFDLElBQUksQ0FBQztBQUM5QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCByZW1hcHBpbmcgZnJvbSAnQGFtcHByb2plY3QvcmVtYXBwaW5nJztcbmltcG9ydCB7XG4gIE5vZGVQYXRoLFxuICBQYXJzZVJlc3VsdCxcbiAgcGFyc2VTeW5jLFxuICB0cmFuc2Zvcm1Bc3luYyxcbiAgdHJhbnNmb3JtRnJvbUFzdFN5bmMsXG4gIHRyYXZlcnNlLFxuICB0eXBlcyxcbn0gZnJvbSAnQGJhYmVsL2NvcmUnO1xuaW1wb3J0IHRlbXBsYXRlQnVpbGRlciBmcm9tICdAYmFiZWwvdGVtcGxhdGUnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMvcHJvbWlzZXMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHdvcmtlckRhdGEgfSBmcm9tICd3b3JrZXJfdGhyZWFkcyc7XG5pbXBvcnQgeyBJbmxpbmVPcHRpb25zIH0gZnJvbSAnLi9idW5kbGUtaW5saW5lLW9wdGlvbnMnO1xuaW1wb3J0IHsgYWxsb3dNaW5pZnksIHNob3VsZEJlYXV0aWZ5IH0gZnJvbSAnLi9lbnZpcm9ubWVudC1vcHRpb25zJztcbmltcG9ydCB7IGFzc2VydElzRXJyb3IgfSBmcm9tICcuL2Vycm9yJztcbmltcG9ydCB7IEkxOG5PcHRpb25zIH0gZnJvbSAnLi9pMThuLW9wdGlvbnMnO1xuaW1wb3J0IHsgbG9hZEVzbU1vZHVsZSB9IGZyb20gJy4vbG9hZC1lc20nO1xuXG4vLyBFeHRyYWN0IFNvdXJjZW1hcCBpbnB1dCB0eXBlIGZyb20gdGhlIHJlbWFwcGluZyBmdW5jdGlvbiBzaW5jZSBpdCBpcyBub3QgY3VycmVudGx5IGV4cG9ydGVkXG50eXBlIFNvdXJjZU1hcElucHV0ID0gRXhjbHVkZTxQYXJhbWV0ZXJzPHR5cGVvZiByZW1hcHBpbmc+WzBdLCB1bmtub3duW10+O1xuXG4vLyBMYXp5IGxvYWRlZCB3ZWJwYWNrLXNvdXJjZXMgb2JqZWN0XG4vLyBXZWJwYWNrIGlzIG9ubHkgaW1wb3J0ZWQgaWYgbmVlZGVkIGR1cmluZyB0aGUgcHJvY2Vzc2luZ1xubGV0IHdlYnBhY2tTb3VyY2VzOiB0eXBlb2YgaW1wb3J0KCd3ZWJwYWNrJykuc291cmNlcyB8IHVuZGVmaW5lZDtcblxuY29uc3QgeyBpMThuIH0gPSAod29ya2VyRGF0YSB8fCB7fSkgYXMgeyBpMThuPzogSTE4bk9wdGlvbnMgfTtcblxuLyoqXG4gKiBJbnRlcm5hbCBmbGFnIHRvIGVuYWJsZSB0aGUgZGlyZWN0IHVzYWdlIG9mIHRoZSBgQGFuZ3VsYXIvbG9jYWxpemVgIHRyYW5zbGF0aW9uIHBsdWdpbnMuXG4gKiBUaGVpciB1c2FnZSBpcyBjdXJyZW50bHkgc2V2ZXJhbCB0aW1lcyBzbG93ZXIgdGhhbiB0aGUgc3RyaW5nIG1hbmlwdWxhdGlvbiBtZXRob2QuXG4gKiBGdXR1cmUgd29yayB0byBvcHRpbWl6ZSB0aGUgcGx1Z2lucyBzaG91bGQgZW5hYmxlIHBsdWdpbiB1c2FnZSBhcyB0aGUgZGVmYXVsdC5cbiAqL1xuY29uc3QgVVNFX0xPQ0FMSVpFX1BMVUdJTlMgPSBmYWxzZTtcblxudHlwZSBMb2NhbGl6ZVV0aWxpdHlNb2R1bGUgPSB0eXBlb2YgaW1wb3J0KCdAYW5ndWxhci9sb2NhbGl6ZS90b29scycpO1xuXG4vKipcbiAqIENhY2hlZCBpbnN0YW5jZSBvZiB0aGUgYEBhbmd1bGFyL2xvY2FsaXplL3Rvb2xzYCBtb2R1bGUuXG4gKiBUaGlzIGlzIHVzZWQgdG8gcmVtb3ZlIHRoZSBuZWVkIHRvIHJlcGVhdGVkbHkgaW1wb3J0IHRoZSBtb2R1bGUgcGVyIGZpbGUgdHJhbnNsYXRpb24uXG4gKi9cbmxldCBsb2NhbGl6ZVRvb2xzTW9kdWxlOiBMb2NhbGl6ZVV0aWxpdHlNb2R1bGUgfCB1bmRlZmluZWQ7XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gbG9hZCB0aGUgYEBhbmd1bGFyL2xvY2FsaXplL3Rvb2xzYCBtb2R1bGUgY29udGFpbmluZyB0aGUgZnVuY3Rpb25hbGl0eSB0b1xuICogcGVyZm9ybSB0aGUgZmlsZSB0cmFuc2xhdGlvbnMuXG4gKiBUaGlzIG1vZHVsZSBtdXN0IGJlIGR5bmFtaWNhbGx5IGxvYWRlZCBhcyBpdCBpcyBhbiBFU00gbW9kdWxlIGFuZCB0aGlzIGZpbGUgaXMgQ29tbW9uSlMuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRMb2NhbGl6ZVRvb2xzKCk6IFByb21pc2U8TG9jYWxpemVVdGlsaXR5TW9kdWxlPiB7XG4gIGlmIChsb2NhbGl6ZVRvb2xzTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbG9jYWxpemVUb29sc01vZHVsZTtcbiAgfVxuXG4gIC8vIExvYWQgRVNNIGBAYW5ndWxhci9sb2NhbGl6ZS90b29sc2AgdXNpbmcgdGhlIFR5cGVTY3JpcHQgZHluYW1pYyBpbXBvcnQgd29ya2Fyb3VuZC5cbiAgLy8gT25jZSBUeXBlU2NyaXB0IHByb3ZpZGVzIHN1cHBvcnQgZm9yIGtlZXBpbmcgdGhlIGR5bmFtaWMgaW1wb3J0IHRoaXMgd29ya2Fyb3VuZCBjYW4gYmVcbiAgLy8gY2hhbmdlZCB0byBhIGRpcmVjdCBkeW5hbWljIGltcG9ydC5cbiAgcmV0dXJuIGxvYWRFc21Nb2R1bGUoJ0Bhbmd1bGFyL2xvY2FsaXplL3Rvb2xzJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUkxOG5QbHVnaW5zKFxuICBsb2NhbGU6IHN0cmluZyxcbiAgdHJhbnNsYXRpb246IHVua25vd24gfCB1bmRlZmluZWQsXG4gIG1pc3NpbmdUcmFuc2xhdGlvbjogJ2Vycm9yJyB8ICd3YXJuaW5nJyB8ICdpZ25vcmUnLFxuICBzaG91bGRJbmxpbmU6IGJvb2xlYW4sXG4gIGxvY2FsZURhdGFDb250ZW50Pzogc3RyaW5nLFxuKSB7XG4gIGNvbnN0IHsgRGlhZ25vc3RpY3MsIG1ha2VFczIwMTVUcmFuc2xhdGVQbHVnaW4sIG1ha2VMb2NhbGVQbHVnaW4gfSA9IGF3YWl0IGxvYWRMb2NhbGl6ZVRvb2xzKCk7XG5cbiAgY29uc3QgcGx1Z2lucyA9IFtdO1xuICBjb25zdCBkaWFnbm9zdGljcyA9IG5ldyBEaWFnbm9zdGljcygpO1xuXG4gIGlmIChzaG91bGRJbmxpbmUpIHtcbiAgICBwbHVnaW5zLnB1c2goXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgbWFrZUVzMjAxNVRyYW5zbGF0ZVBsdWdpbihkaWFnbm9zdGljcywgKHRyYW5zbGF0aW9uIHx8IHt9KSBhcyBhbnksIHtcbiAgICAgICAgbWlzc2luZ1RyYW5zbGF0aW9uOiB0cmFuc2xhdGlvbiA9PT0gdW5kZWZpbmVkID8gJ2lnbm9yZScgOiBtaXNzaW5nVHJhbnNsYXRpb24sXG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgcGx1Z2lucy5wdXNoKG1ha2VMb2NhbGVQbHVnaW4obG9jYWxlKSk7XG5cbiAgaWYgKGxvY2FsZURhdGFDb250ZW50KSB7XG4gICAgcGx1Z2lucy5wdXNoKHtcbiAgICAgIHZpc2l0b3I6IHtcbiAgICAgICAgUHJvZ3JhbShwYXRoOiBOb2RlUGF0aDx0eXBlcy5Qcm9ncmFtPikge1xuICAgICAgICAgIHBhdGgudW5zaGlmdENvbnRhaW5lcignYm9keScsIHRlbXBsYXRlQnVpbGRlci5hc3QobG9jYWxlRGF0YUNvbnRlbnQpKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4geyBkaWFnbm9zdGljcywgcGx1Z2lucyB9O1xufVxuXG5pbnRlcmZhY2UgTG9jYWxpemVQb3NpdGlvbiB7XG4gIHN0YXJ0OiBudW1iZXI7XG4gIGVuZDogbnVtYmVyO1xuICBtZXNzYWdlUGFydHM6IFRlbXBsYXRlU3RyaW5nc0FycmF5O1xuICBleHByZXNzaW9uczogdHlwZXMuRXhwcmVzc2lvbltdO1xufVxuXG5jb25zdCBsb2NhbGl6ZU5hbWUgPSAnJGxvY2FsaXplJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlubGluZUxvY2FsZXMob3B0aW9uczogSW5saW5lT3B0aW9ucykge1xuICBpZiAoIWkxOG4gfHwgaTE4bi5pbmxpbmVMb2NhbGVzLnNpemUgPT09IDApIHtcbiAgICByZXR1cm4geyBmaWxlOiBvcHRpb25zLmZpbGVuYW1lLCBkaWFnbm9zdGljczogW10sIGNvdW50OiAwIH07XG4gIH1cbiAgaWYgKGkxOG4uZmxhdE91dHB1dCAmJiBpMThuLmlubGluZUxvY2FsZXMuc2l6ZSA+IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZsYXQgb3V0cHV0IGlzIG9ubHkgc3VwcG9ydGVkIHdoZW4gaW5saW5pbmcgb25lIGxvY2FsZS4nKTtcbiAgfVxuXG4gIGNvbnN0IGhhc0xvY2FsaXplTmFtZSA9IG9wdGlvbnMuY29kZS5pbmNsdWRlcyhsb2NhbGl6ZU5hbWUpO1xuICBpZiAoIWhhc0xvY2FsaXplTmFtZSAmJiAhb3B0aW9ucy5zZXRMb2NhbGUpIHtcbiAgICByZXR1cm4gaW5saW5lQ29weU9ubHkob3B0aW9ucyk7XG4gIH1cblxuICBhd2FpdCBsb2FkTG9jYWxpemVUb29scygpO1xuXG4gIGxldCBhc3Q6IFBhcnNlUmVzdWx0IHwgdW5kZWZpbmVkIHwgbnVsbDtcbiAgdHJ5IHtcbiAgICBhc3QgPSBwYXJzZVN5bmMob3B0aW9ucy5jb2RlLCB7XG4gICAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICAgIGNvbmZpZ0ZpbGU6IGZhbHNlLFxuICAgICAgc291cmNlVHlwZTogJ3VuYW1iaWd1b3VzJyxcbiAgICAgIGZpbGVuYW1lOiBvcHRpb25zLmZpbGVuYW1lLFxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGFzc2VydElzRXJyb3IoZXJyb3IpO1xuXG4gICAgLy8gTWFrZSB0aGUgZXJyb3IgbW9yZSByZWFkYWJsZS5cbiAgICAvLyBTYW1lIGVycm9ycyB3aWxsIGNvbnRhaW4gdGhlIGZ1bGwgY29udGVudCBvZiB0aGUgZmlsZSBhcyB0aGUgZXJyb3IgbWVzc2FnZVxuICAgIC8vIFdoaWNoIG1ha2VzIGl0IGhhcmQgdG8gZmluZCB0aGUgYWN0dWFsIGVycm9yIG1lc3NhZ2UuXG4gICAgY29uc3QgaW5kZXggPSBlcnJvci5tZXNzYWdlLmluZGV4T2YoJylcXG4nKTtcbiAgICBjb25zdCBtc2cgPSBpbmRleCAhPT0gLTEgPyBlcnJvci5tZXNzYWdlLnNsaWNlKDAsIGluZGV4ICsgMSkgOiBlcnJvci5tZXNzYWdlO1xuICAgIHRocm93IG5ldyBFcnJvcihgJHttc2d9XFxuQW4gZXJyb3Igb2NjdXJyZWQgaW5saW5pbmcgZmlsZSBcIiR7b3B0aW9ucy5maWxlbmFtZX1cImApO1xuICB9XG5cbiAgaWYgKCFhc3QpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gZXJyb3Igb2NjdXJyZWQgaW5saW5pbmcgZmlsZSBcIiR7b3B0aW9ucy5maWxlbmFtZX1cImApO1xuICB9XG5cbiAgaWYgKCFVU0VfTE9DQUxJWkVfUExVR0lOUykge1xuICAgIHJldHVybiBpbmxpbmVMb2NhbGVzRGlyZWN0KGFzdCwgb3B0aW9ucyk7XG4gIH1cblxuICBjb25zdCBkaWFnbm9zdGljcyA9IFtdO1xuICBmb3IgKGNvbnN0IGxvY2FsZSBvZiBpMThuLmlubGluZUxvY2FsZXMpIHtcbiAgICBjb25zdCBpc1NvdXJjZUxvY2FsZSA9IGxvY2FsZSA9PT0gaTE4bi5zb3VyY2VMb2NhbGU7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBjb25zdCB0cmFuc2xhdGlvbnM6IGFueSA9IGlzU291cmNlTG9jYWxlID8ge30gOiBpMThuLmxvY2FsZXNbbG9jYWxlXS50cmFuc2xhdGlvbiB8fCB7fTtcbiAgICBsZXQgbG9jYWxlRGF0YUNvbnRlbnQ7XG4gICAgaWYgKG9wdGlvbnMuc2V0TG9jYWxlKSB7XG4gICAgICAvLyBJZiBsb2NhbGUgZGF0YSBpcyBwcm92aWRlZCwgbG9hZCBpdCBhbmQgcHJlcGVuZCB0byBmaWxlXG4gICAgICBjb25zdCBsb2NhbGVEYXRhUGF0aCA9IGkxOG4ubG9jYWxlc1tsb2NhbGVdPy5kYXRhUGF0aDtcbiAgICAgIGlmIChsb2NhbGVEYXRhUGF0aCkge1xuICAgICAgICBsb2NhbGVEYXRhQ29udGVudCA9IGF3YWl0IGxvYWRMb2NhbGVEYXRhKGxvY2FsZURhdGFQYXRoLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB7IGRpYWdub3N0aWNzOiBsb2NhbGVEaWFnbm9zdGljcywgcGx1Z2lucyB9ID0gYXdhaXQgY3JlYXRlSTE4blBsdWdpbnMoXG4gICAgICBsb2NhbGUsXG4gICAgICB0cmFuc2xhdGlvbnMsXG4gICAgICBpc1NvdXJjZUxvY2FsZSA/ICdpZ25vcmUnIDogb3B0aW9ucy5taXNzaW5nVHJhbnNsYXRpb24gfHwgJ3dhcm5pbmcnLFxuICAgICAgdHJ1ZSxcbiAgICAgIGxvY2FsZURhdGFDb250ZW50LFxuICAgICk7XG4gICAgY29uc3QgdHJhbnNmb3JtUmVzdWx0ID0gYXdhaXQgdHJhbnNmb3JtRnJvbUFzdFN5bmMoYXN0LCBvcHRpb25zLmNvZGUsIHtcbiAgICAgIGZpbGVuYW1lOiBvcHRpb25zLmZpbGVuYW1lLFxuICAgICAgLy8gdXNpbmcgZmFsc2UgZW5zdXJlcyB0aGF0IGJhYmVsIHdpbGwgTk9UIHNlYXJjaCBhbmQgcHJvY2VzcyBzb3VyY2VtYXAgY29tbWVudHMgKGxhcmdlIG1lbW9yeSB1c2FnZSlcbiAgICAgIC8vIFRoZSB0eXBlcyBkbyBub3QgaW5jbHVkZSB0aGUgZmFsc2Ugb3B0aW9uIGV2ZW4gdGhvdWdoIGl0IGlzIHZhbGlkXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgaW5wdXRTb3VyY2VNYXA6IGZhbHNlIGFzIGFueSxcbiAgICAgIGJhYmVscmM6IGZhbHNlLFxuICAgICAgY29uZmlnRmlsZTogZmFsc2UsXG4gICAgICBwbHVnaW5zLFxuICAgICAgY29tcGFjdDogIXNob3VsZEJlYXV0aWZ5LFxuICAgICAgc291cmNlTWFwczogISFvcHRpb25zLm1hcCxcbiAgICB9KTtcblxuICAgIGRpYWdub3N0aWNzLnB1c2goLi4ubG9jYWxlRGlhZ25vc3RpY3MubWVzc2FnZXMpO1xuXG4gICAgaWYgKCF0cmFuc2Zvcm1SZXN1bHQgfHwgIXRyYW5zZm9ybVJlc3VsdC5jb2RlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gZXJyb3Igb2NjdXJyZWQgcHJvY2Vzc2luZyBidW5kbGUgZm9yIFwiJHtvcHRpb25zLmZpbGVuYW1lfVwiLmApO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dFBhdGggPSBwYXRoLmpvaW4oXG4gICAgICBvcHRpb25zLm91dHB1dFBhdGgsXG4gICAgICBpMThuLmZsYXRPdXRwdXQgPyAnJyA6IGxvY2FsZSxcbiAgICAgIG9wdGlvbnMuZmlsZW5hbWUsXG4gICAgKTtcbiAgICBhd2FpdCBmcy53cml0ZUZpbGUob3V0cHV0UGF0aCwgdHJhbnNmb3JtUmVzdWx0LmNvZGUpO1xuXG4gICAgaWYgKG9wdGlvbnMubWFwICYmIHRyYW5zZm9ybVJlc3VsdC5tYXApIHtcbiAgICAgIGNvbnN0IG91dHB1dE1hcCA9IHJlbWFwcGluZyhbdHJhbnNmb3JtUmVzdWx0Lm1hcCBhcyBTb3VyY2VNYXBJbnB1dCwgb3B0aW9ucy5tYXBdLCAoKSA9PiBudWxsKTtcblxuICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKG91dHB1dFBhdGggKyAnLm1hcCcsIEpTT04uc3RyaW5naWZ5KG91dHB1dE1hcCkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IGZpbGU6IG9wdGlvbnMuZmlsZW5hbWUsIGRpYWdub3N0aWNzIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGlubGluZUxvY2FsZXNEaXJlY3QoYXN0OiBQYXJzZVJlc3VsdCwgb3B0aW9uczogSW5saW5lT3B0aW9ucykge1xuICBpZiAoIWkxOG4gfHwgaTE4bi5pbmxpbmVMb2NhbGVzLnNpemUgPT09IDApIHtcbiAgICByZXR1cm4geyBmaWxlOiBvcHRpb25zLmZpbGVuYW1lLCBkaWFnbm9zdGljczogW10sIGNvdW50OiAwIH07XG4gIH1cblxuICBjb25zdCB7IGRlZmF1bHQ6IGdlbmVyYXRlIH0gPSBhd2FpdCBpbXBvcnQoJ0BiYWJlbC9nZW5lcmF0b3InKTtcbiAgY29uc3QgbG9jYWxpemVEaWFnID0gYXdhaXQgbG9hZExvY2FsaXplVG9vbHMoKTtcbiAgY29uc3QgZGlhZ25vc3RpY3MgPSBuZXcgbG9jYWxpemVEaWFnLkRpYWdub3N0aWNzKCk7XG5cbiAgY29uc3QgcG9zaXRpb25zID0gZmluZExvY2FsaXplUG9zaXRpb25zKGFzdCwgb3B0aW9ucywgbG9jYWxpemVEaWFnKTtcbiAgaWYgKHBvc2l0aW9ucy5sZW5ndGggPT09IDAgJiYgIW9wdGlvbnMuc2V0TG9jYWxlKSB7XG4gICAgcmV0dXJuIGlubGluZUNvcHlPbmx5KG9wdGlvbnMpO1xuICB9XG5cbiAgY29uc3QgaW5wdXRNYXAgPSAhIW9wdGlvbnMubWFwICYmIChKU09OLnBhcnNlKG9wdGlvbnMubWFwKSBhcyB7IHNvdXJjZVJvb3Q/OiBzdHJpbmcgfSk7XG4gIC8vIENsZWFudXAgc291cmNlIHJvb3Qgb3RoZXJ3aXNlIGl0IHdpbGwgYmUgYWRkZWQgdG8gZWFjaCBzb3VyY2UgZW50cnlcbiAgY29uc3QgbWFwU291cmNlUm9vdCA9IGlucHV0TWFwICYmIGlucHV0TWFwLnNvdXJjZVJvb3Q7XG4gIGlmIChpbnB1dE1hcCkge1xuICAgIGRlbGV0ZSBpbnB1dE1hcC5zb3VyY2VSb290O1xuICB9XG5cbiAgLy8gTG9hZCBXZWJwYWNrIG9ubHkgd2hlbiBuZWVkZWRcbiAgaWYgKHdlYnBhY2tTb3VyY2VzID09PSB1bmRlZmluZWQpIHtcbiAgICB3ZWJwYWNrU291cmNlcyA9IChhd2FpdCBpbXBvcnQoJ3dlYnBhY2snKSkuc291cmNlcztcbiAgfVxuICBjb25zdCB7IENvbmNhdFNvdXJjZSwgT3JpZ2luYWxTb3VyY2UsIFJlcGxhY2VTb3VyY2UsIFNvdXJjZU1hcFNvdXJjZSB9ID0gd2VicGFja1NvdXJjZXM7XG5cbiAgZm9yIChjb25zdCBsb2NhbGUgb2YgaTE4bi5pbmxpbmVMb2NhbGVzKSB7XG4gICAgY29uc3QgY29udGVudCA9IG5ldyBSZXBsYWNlU291cmNlKFxuICAgICAgaW5wdXRNYXBcbiAgICAgICAgPyBuZXcgU291cmNlTWFwU291cmNlKG9wdGlvbnMuY29kZSwgb3B0aW9ucy5maWxlbmFtZSwgaW5wdXRNYXApXG4gICAgICAgIDogbmV3IE9yaWdpbmFsU291cmNlKG9wdGlvbnMuY29kZSwgb3B0aW9ucy5maWxlbmFtZSksXG4gICAgKTtcblxuICAgIGNvbnN0IGlzU291cmNlTG9jYWxlID0gbG9jYWxlID09PSBpMThuLnNvdXJjZUxvY2FsZTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIGNvbnN0IHRyYW5zbGF0aW9uczogYW55ID0gaXNTb3VyY2VMb2NhbGUgPyB7fSA6IGkxOG4ubG9jYWxlc1tsb2NhbGVdLnRyYW5zbGF0aW9uIHx8IHt9O1xuICAgIGZvciAoY29uc3QgcG9zaXRpb24gb2YgcG9zaXRpb25zKSB7XG4gICAgICBjb25zdCB0cmFuc2xhdGVkID0gbG9jYWxpemVEaWFnLnRyYW5zbGF0ZShcbiAgICAgICAgZGlhZ25vc3RpY3MsXG4gICAgICAgIHRyYW5zbGF0aW9ucyxcbiAgICAgICAgcG9zaXRpb24ubWVzc2FnZVBhcnRzLFxuICAgICAgICBwb3NpdGlvbi5leHByZXNzaW9ucyxcbiAgICAgICAgaXNTb3VyY2VMb2NhbGUgPyAnaWdub3JlJyA6IG9wdGlvbnMubWlzc2luZ1RyYW5zbGF0aW9uIHx8ICd3YXJuaW5nJyxcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSBsb2NhbGl6ZURpYWcuYnVpbGRMb2NhbGl6ZVJlcGxhY2VtZW50KHRyYW5zbGF0ZWRbMF0sIHRyYW5zbGF0ZWRbMV0pO1xuICAgICAgY29uc3QgeyBjb2RlIH0gPSBnZW5lcmF0ZShleHByZXNzaW9uKTtcblxuICAgICAgY29udGVudC5yZXBsYWNlKHBvc2l0aW9uLnN0YXJ0LCBwb3NpdGlvbi5lbmQgLSAxLCBjb2RlKTtcbiAgICB9XG5cbiAgICBsZXQgb3V0cHV0U291cmNlOiBpbXBvcnQoJ3dlYnBhY2snKS5zb3VyY2VzLlNvdXJjZSA9IGNvbnRlbnQ7XG4gICAgaWYgKG9wdGlvbnMuc2V0TG9jYWxlKSB7XG4gICAgICBjb25zdCBzZXRMb2NhbGVUZXh0ID0gYGdsb2JhbFRoaXMuJGxvY2FsaXplPU9iamVjdC5hc3NpZ24oZ2xvYmFsVGhpcy4kbG9jYWxpemUgfHwge30se2xvY2FsZTpcIiR7bG9jYWxlfVwifSk7XFxuYDtcblxuICAgICAgLy8gSWYgbG9jYWxlIGRhdGEgaXMgcHJvdmlkZWQsIGxvYWQgaXQgYW5kIHByZXBlbmQgdG8gZmlsZVxuICAgICAgbGV0IGxvY2FsZURhdGFTb3VyY2U7XG4gICAgICBjb25zdCBsb2NhbGVEYXRhUGF0aCA9IGkxOG4ubG9jYWxlc1tsb2NhbGVdICYmIGkxOG4ubG9jYWxlc1tsb2NhbGVdLmRhdGFQYXRoO1xuICAgICAgaWYgKGxvY2FsZURhdGFQYXRoKSB7XG4gICAgICAgIGNvbnN0IGxvY2FsZURhdGFDb250ZW50ID0gYXdhaXQgbG9hZExvY2FsZURhdGEobG9jYWxlRGF0YVBhdGgsIHRydWUpO1xuICAgICAgICBsb2NhbGVEYXRhU291cmNlID0gbmV3IE9yaWdpbmFsU291cmNlKGxvY2FsZURhdGFDb250ZW50LCBwYXRoLmJhc2VuYW1lKGxvY2FsZURhdGFQYXRoKSk7XG4gICAgICB9XG5cbiAgICAgIG91dHB1dFNvdXJjZSA9IGxvY2FsZURhdGFTb3VyY2VcbiAgICAgICAgPyAvLyBUaGUgc2VtaWNvbG9uIGVuc3VyZXMgdGhhdCB0aGVyZSBpcyBubyBzeW50YXggZXJyb3IgYmV0d2VlbiBzdGF0ZW1lbnRzXG4gICAgICAgICAgbmV3IENvbmNhdFNvdXJjZShzZXRMb2NhbGVUZXh0LCBsb2NhbGVEYXRhU291cmNlLCAnO1xcbicsIGNvbnRlbnQpXG4gICAgICAgIDogbmV3IENvbmNhdFNvdXJjZShzZXRMb2NhbGVUZXh0LCBjb250ZW50KTtcbiAgICB9XG5cbiAgICBjb25zdCB7IHNvdXJjZTogb3V0cHV0Q29kZSwgbWFwOiBvdXRwdXRNYXAgfSA9IG91dHB1dFNvdXJjZS5zb3VyY2VBbmRNYXAoKSBhcyB7XG4gICAgICBzb3VyY2U6IHN0cmluZztcbiAgICAgIG1hcDogeyBmaWxlOiBzdHJpbmc7IHNvdXJjZVJvb3Q/OiBzdHJpbmcgfTtcbiAgICB9O1xuICAgIGNvbnN0IG91dHB1dFBhdGggPSBwYXRoLmpvaW4oXG4gICAgICBvcHRpb25zLm91dHB1dFBhdGgsXG4gICAgICBpMThuLmZsYXRPdXRwdXQgPyAnJyA6IGxvY2FsZSxcbiAgICAgIG9wdGlvbnMuZmlsZW5hbWUsXG4gICAgKTtcbiAgICBhd2FpdCBmcy53cml0ZUZpbGUob3V0cHV0UGF0aCwgb3V0cHV0Q29kZSk7XG5cbiAgICBpZiAoaW5wdXRNYXAgJiYgb3V0cHV0TWFwKSB7XG4gICAgICBvdXRwdXRNYXAuZmlsZSA9IG9wdGlvbnMuZmlsZW5hbWU7XG4gICAgICBpZiAobWFwU291cmNlUm9vdCkge1xuICAgICAgICBvdXRwdXRNYXAuc291cmNlUm9vdCA9IG1hcFNvdXJjZVJvb3Q7XG4gICAgICB9XG4gICAgICBhd2FpdCBmcy53cml0ZUZpbGUob3V0cHV0UGF0aCArICcubWFwJywgSlNPTi5zdHJpbmdpZnkob3V0cHV0TWFwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgZmlsZTogb3B0aW9ucy5maWxlbmFtZSwgZGlhZ25vc3RpY3M6IGRpYWdub3N0aWNzLm1lc3NhZ2VzLCBjb3VudDogcG9zaXRpb25zLmxlbmd0aCB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbmxpbmVDb3B5T25seShvcHRpb25zOiBJbmxpbmVPcHRpb25zKSB7XG4gIGlmICghaTE4bikge1xuICAgIHRocm93IG5ldyBFcnJvcignaTE4biBvcHRpb25zIGFyZSBtaXNzaW5nJyk7XG4gIH1cblxuICBmb3IgKGNvbnN0IGxvY2FsZSBvZiBpMThuLmlubGluZUxvY2FsZXMpIHtcbiAgICBjb25zdCBvdXRwdXRQYXRoID0gcGF0aC5qb2luKFxuICAgICAgb3B0aW9ucy5vdXRwdXRQYXRoLFxuICAgICAgaTE4bi5mbGF0T3V0cHV0ID8gJycgOiBsb2NhbGUsXG4gICAgICBvcHRpb25zLmZpbGVuYW1lLFxuICAgICk7XG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKG91dHB1dFBhdGgsIG9wdGlvbnMuY29kZSk7XG4gICAgaWYgKG9wdGlvbnMubWFwKSB7XG4gICAgICBhd2FpdCBmcy53cml0ZUZpbGUob3V0cHV0UGF0aCArICcubWFwJywgb3B0aW9ucy5tYXApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IGZpbGU6IG9wdGlvbnMuZmlsZW5hbWUsIGRpYWdub3N0aWNzOiBbXSwgY291bnQ6IDAgfTtcbn1cblxuZnVuY3Rpb24gZmluZExvY2FsaXplUG9zaXRpb25zKFxuICBhc3Q6IFBhcnNlUmVzdWx0LFxuICBvcHRpb25zOiBJbmxpbmVPcHRpb25zLFxuICB1dGlsczogTG9jYWxpemVVdGlsaXR5TW9kdWxlLFxuKTogTG9jYWxpemVQb3NpdGlvbltdIHtcbiAgY29uc3QgcG9zaXRpb25zOiBMb2NhbGl6ZVBvc2l0aW9uW10gPSBbXTtcblxuICAvLyBXb3JrYXJvdW5kIHRvIGVuc3VyZSBhIHBhdGggaHViIGlzIHByZXNlbnQgZm9yIHRyYXZlcnNhbFxuICBjb25zdCB7IEZpbGUgfSA9IHJlcXVpcmUoJ0BiYWJlbC9jb3JlJyk7XG4gIGNvbnN0IGZpbGUgPSBuZXcgRmlsZSh7fSwgeyBjb2RlOiBvcHRpb25zLmNvZGUsIGFzdCB9KTtcblxuICB0cmF2ZXJzZShmaWxlLmFzdCwge1xuICAgIFRhZ2dlZFRlbXBsYXRlRXhwcmVzc2lvbihwYXRoKSB7XG4gICAgICBpZiAodHlwZXMuaXNJZGVudGlmaWVyKHBhdGgubm9kZS50YWcpICYmIHBhdGgubm9kZS50YWcubmFtZSA9PT0gbG9jYWxpemVOYW1lKSB7XG4gICAgICAgIGNvbnN0IFttZXNzYWdlUGFydHMsIGV4cHJlc3Npb25zXSA9IHVud3JhcFRlbXBsYXRlTGl0ZXJhbChwYXRoLCB1dGlscyk7XG4gICAgICAgIHBvc2l0aW9ucy5wdXNoKHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgIHN0YXJ0OiBwYXRoLm5vZGUuc3RhcnQhLFxuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAgICAgZW5kOiBwYXRoLm5vZGUuZW5kISxcbiAgICAgICAgICBtZXNzYWdlUGFydHMsXG4gICAgICAgICAgZXhwcmVzc2lvbnMsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xuXG4gIHJldHVybiBwb3NpdGlvbnM7XG59XG5cbmZ1bmN0aW9uIHVud3JhcFRlbXBsYXRlTGl0ZXJhbChcbiAgcGF0aDogTm9kZVBhdGg8dHlwZXMuVGFnZ2VkVGVtcGxhdGVFeHByZXNzaW9uPixcbiAgdXRpbHM6IExvY2FsaXplVXRpbGl0eU1vZHVsZSxcbik6IFtUZW1wbGF0ZVN0cmluZ3NBcnJheSwgdHlwZXMuRXhwcmVzc2lvbltdXSB7XG4gIGNvbnN0IFttZXNzYWdlUGFydHNdID0gdXRpbHMudW53cmFwTWVzc2FnZVBhcnRzRnJvbVRlbXBsYXRlTGl0ZXJhbChcbiAgICBwYXRoLmdldCgncXVhc2knKS5nZXQoJ3F1YXNpcycpLFxuICApO1xuICBjb25zdCBbZXhwcmVzc2lvbnNdID0gdXRpbHMudW53cmFwRXhwcmVzc2lvbnNGcm9tVGVtcGxhdGVMaXRlcmFsKHBhdGguZ2V0KCdxdWFzaScpKTtcblxuICByZXR1cm4gW21lc3NhZ2VQYXJ0cywgZXhwcmVzc2lvbnNdO1xufVxuXG5mdW5jdGlvbiB1bndyYXBMb2NhbGl6ZUNhbGwoXG4gIHBhdGg6IE5vZGVQYXRoPHR5cGVzLkNhbGxFeHByZXNzaW9uPixcbiAgdXRpbHM6IExvY2FsaXplVXRpbGl0eU1vZHVsZSxcbik6IFtUZW1wbGF0ZVN0cmluZ3NBcnJheSwgdHlwZXMuRXhwcmVzc2lvbltdXSB7XG4gIGNvbnN0IFttZXNzYWdlUGFydHNdID0gdXRpbHMudW53cmFwTWVzc2FnZVBhcnRzRnJvbUxvY2FsaXplQ2FsbChwYXRoKTtcbiAgY29uc3QgW2V4cHJlc3Npb25zXSA9IHV0aWxzLnVud3JhcFN1YnN0aXR1dGlvbnNGcm9tTG9jYWxpemVDYWxsKHBhdGgpO1xuXG4gIHJldHVybiBbbWVzc2FnZVBhcnRzLCBleHByZXNzaW9uc107XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRMb2NhbGVEYXRhKHBhdGg6IHN0cmluZywgb3B0aW1pemU6IGJvb2xlYW4pOiBQcm9taXNlPHN0cmluZz4ge1xuICAvLyBUaGUgcGF0aCBpcyB2YWxpZGF0ZWQgZHVyaW5nIG9wdGlvbiBwcm9jZXNzaW5nIGJlZm9yZSB0aGUgYnVpbGQgc3RhcnRzXG4gIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmcy5yZWFkRmlsZShwYXRoLCAndXRmOCcpO1xuXG4gIC8vIERvd25sZXZlbCBhbmQgb3B0aW1pemUgdGhlIGRhdGFcbiAgY29uc3QgdHJhbnNmb3JtUmVzdWx0ID0gYXdhaXQgdHJhbnNmb3JtQXN5bmMoY29udGVudCwge1xuICAgIGZpbGVuYW1lOiBwYXRoLFxuICAgIC8vIFRoZSB0eXBlcyBkbyBub3QgaW5jbHVkZSB0aGUgZmFsc2Ugb3B0aW9uIGV2ZW4gdGhvdWdoIGl0IGlzIHZhbGlkXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBpbnB1dFNvdXJjZU1hcDogZmFsc2UgYXMgYW55LFxuICAgIGJhYmVscmM6IGZhbHNlLFxuICAgIGNvbmZpZ0ZpbGU6IGZhbHNlLFxuICAgIHByZXNldHM6IFtcbiAgICAgIFtcbiAgICAgICAgcmVxdWlyZS5yZXNvbHZlKCdAYmFiZWwvcHJlc2V0LWVudicpLFxuICAgICAgICB7XG4gICAgICAgICAgYnVnZml4ZXM6IHRydWUsXG4gICAgICAgICAgdGFyZ2V0czogeyBlc21vZHVsZXM6IHRydWUgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgXSxcbiAgICBtaW5pZmllZDogYWxsb3dNaW5pZnkgJiYgb3B0aW1pemUsXG4gICAgY29tcGFjdDogIXNob3VsZEJlYXV0aWZ5ICYmIG9wdGltaXplLFxuICAgIGNvbW1lbnRzOiAhb3B0aW1pemUsXG4gIH0pO1xuXG4gIGlmICghdHJhbnNmb3JtUmVzdWx0IHx8ICF0cmFuc2Zvcm1SZXN1bHQuY29kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBlcnJvciBvY2N1cnJlZCBwcm9jZXNzaW5nIGJ1bmRsZSBmb3IgXCIke3BhdGh9XCIuYCk7XG4gIH1cblxuICByZXR1cm4gdHJhbnNmb3JtUmVzdWx0LmNvZGU7XG59XG4iXX0=