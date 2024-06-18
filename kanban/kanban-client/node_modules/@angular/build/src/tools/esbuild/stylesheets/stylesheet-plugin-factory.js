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
exports.StylesheetPluginFactory = void 0;
const fast_glob_1 = __importDefault(require("fast-glob"));
const node_assert_1 = __importDefault(require("node:assert"));
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const load_result_cache_1 = require("../load-result-cache");
/**
 * The lazy-loaded instance of the postcss stylesheet postprocessor.
 * It is only imported and initialized if postcss is needed.
 */
let postcss;
/**
 * An array of keywords that indicate Tailwind CSS processing is required for a stylesheet.
 *
 * Based on https://tailwindcss.com/docs/functions-and-directives
 */
const TAILWIND_KEYWORDS = [
    '@tailwind',
    '@layer',
    '@apply',
    '@config',
    'theme(',
    'screen(',
    '@screen', // Undocumented in version 3, see: https://github.com/tailwindlabs/tailwindcss/discussions/7516.
];
/**
 * Cached postcss instances that can be re-used between various StylesheetPluginFactory instances.
 */
const postcssProcessors = new Map();
class StylesheetPluginFactory {
    options;
    cache;
    postcssProcessor;
    constructor(options, cache) {
        this.options = options;
        this.cache = cache;
    }
    create(language) {
        // Return a noop plugin if no load actions are required
        if (!language.process &&
            !this.options.postcssConfiguration &&
            !this.options.tailwindConfiguration) {
            return {
                name: 'angular-' + language.name,
                setup() { },
            };
        }
        const { cache, options } = this;
        const setupPostcss = async () => {
            // Return already created processor if present
            if (this.postcssProcessor) {
                return this.postcssProcessor;
            }
            if (options.postcssConfiguration) {
                const postCssInstanceKey = JSON.stringify(options.postcssConfiguration);
                this.postcssProcessor = postcssProcessors.get(postCssInstanceKey)?.deref();
                if (!this.postcssProcessor) {
                    postcss ??= (await Promise.resolve().then(() => __importStar(require('postcss')))).default;
                    this.postcssProcessor = postcss();
                    for (const [pluginName, pluginOptions] of options.postcssConfiguration.plugins) {
                        const { default: plugin } = await Promise.resolve(`${pluginName}`).then(s => __importStar(require(s)));
                        if (typeof plugin !== 'function' || plugin.postcss !== true) {
                            throw new Error(`Attempted to load invalid Postcss plugin: "${pluginName}"`);
                        }
                        this.postcssProcessor.use(plugin(pluginOptions));
                    }
                    postcssProcessors.set(postCssInstanceKey, new WeakRef(this.postcssProcessor));
                }
            }
            else if (options.tailwindConfiguration) {
                const { package: tailwindPackage, file: config } = options.tailwindConfiguration;
                const postCssInstanceKey = tailwindPackage + ':' + config;
                this.postcssProcessor = postcssProcessors.get(postCssInstanceKey)?.deref();
                if (!this.postcssProcessor) {
                    postcss ??= (await Promise.resolve().then(() => __importStar(require('postcss')))).default;
                    const tailwind = await Promise.resolve(`${tailwindPackage}`).then(s => __importStar(require(s)));
                    this.postcssProcessor = postcss().use(tailwind.default({ config }));
                    postcssProcessors.set(postCssInstanceKey, new WeakRef(this.postcssProcessor));
                }
            }
            return this.postcssProcessor;
        };
        return {
            name: 'angular-' + language.name,
            async setup(build) {
                // Setup postcss if needed
                let postcssProcessor;
                build.onStart(async () => {
                    try {
                        postcssProcessor = await setupPostcss();
                    }
                    catch {
                        return {
                            errors: [
                                {
                                    text: 'Unable to load the "postcss" stylesheet processor.',
                                    location: null,
                                    notes: [
                                        {
                                            text: 'Ensure that the "postcss" Node.js package is installed within the project. ' +
                                                "If not present, installation via the project's package manager should resolve the error.",
                                        },
                                    ],
                                },
                            ],
                        };
                    }
                });
                // Add a load callback to support inline Component styles
                build.onLoad({ filter: language.componentFilter, namespace: 'angular:styles/component' }, (0, load_result_cache_1.createCachedLoad)(cache, (args) => {
                    const data = options.inlineComponentData?.[args.path];
                    (0, node_assert_1.default)(typeof data === 'string', `component style name should always be found [${args.path}]`);
                    const [format, , filename] = args.path.split(';', 3);
                    return processStylesheet(language, data, filename, format, options, build, postcssProcessor);
                }));
                // Add a load callback to support files from disk
                build.onLoad({ filter: language.fileFilter }, (0, load_result_cache_1.createCachedLoad)(cache, async (args) => {
                    const data = await (0, promises_1.readFile)(args.path, 'utf-8');
                    return processStylesheet(language, data, args.path, (0, node_path_1.extname)(args.path).toLowerCase().slice(1), options, build, postcssProcessor);
                }));
            },
        };
    }
}
exports.StylesheetPluginFactory = StylesheetPluginFactory;
async function processStylesheet(language, data, filename, format, options, build, postcssProcessor) {
    let result;
    // Process the input data if the language requires preprocessing
    if (language.process) {
        result = await language.process(data, filename, format, options, build);
    }
    else {
        result = {
            contents: data,
            loader: 'css',
            watchFiles: [filename],
        };
    }
    // Return early if there are no contents to further process or there are errors
    if (!result.contents || result.errors?.length) {
        return result;
    }
    // Only use postcss if Tailwind processing is required or custom postcss is present.
    if (postcssProcessor && (options.postcssConfiguration || hasTailwindKeywords(result.contents))) {
        const postcssResult = await compileString(typeof result.contents === 'string'
            ? result.contents
            : Buffer.from(result.contents).toString('utf-8'), filename, postcssProcessor, options);
        // Merge results
        if (postcssResult.errors?.length) {
            delete result.contents;
        }
        if (result.warnings && postcssResult.warnings) {
            postcssResult.warnings.unshift(...result.warnings);
        }
        if (result.watchFiles && postcssResult.watchFiles) {
            postcssResult.watchFiles.unshift(...result.watchFiles);
        }
        if (result.watchDirs && postcssResult.watchDirs) {
            postcssResult.watchDirs.unshift(...result.watchDirs);
        }
        result = {
            ...result,
            ...postcssResult,
        };
    }
    return result;
}
/**
 * Searches the provided contents for keywords that indicate Tailwind is used
 * within a stylesheet.
 * @param contents A string or Uint8Array containing UTF-8 text.
 * @returns True, if the contents contains tailwind keywords; False, otherwise.
 */
function hasTailwindKeywords(contents) {
    // TODO: use better search algorithm for keywords
    if (typeof contents === 'string') {
        return TAILWIND_KEYWORDS.some((keyword) => contents.includes(keyword));
    }
    // Contents is a Uint8Array
    const data = contents instanceof Buffer ? contents : Buffer.from(contents);
    return TAILWIND_KEYWORDS.some((keyword) => data.includes(keyword));
}
/**
 * Compiles the provided CSS stylesheet data using a provided postcss processor and provides an
 * esbuild load result that can be used directly by an esbuild Plugin.
 * @param data The stylesheet content to process.
 * @param filename The name of the file that contains the data.
 * @param postcssProcessor A postcss processor instance to use.
 * @param options The plugin options to control the processing.
 * @returns An esbuild OnLoaderResult object with the processed content, warnings, and/or errors.
 */
async function compileString(data, filename, postcssProcessor, options) {
    try {
        const postcssResult = await postcssProcessor.process(data, {
            from: filename,
            to: filename,
            map: options.sourcemap && {
                inline: true,
                sourcesContent: true,
            },
        });
        const loadResult = {
            contents: postcssResult.css,
            loader: 'css',
        };
        const rawWarnings = postcssResult.warnings();
        if (rawWarnings.length > 0) {
            const lineMappings = new Map();
            loadResult.warnings = rawWarnings.map((warning) => {
                const file = warning.node.source?.input.file;
                if (file === undefined) {
                    return { text: warning.text };
                }
                let lines = lineMappings.get(file);
                if (lines === undefined) {
                    lines = warning.node.source?.input.css.split(/\r?\n/);
                    lineMappings.set(file, lines ?? null);
                }
                return {
                    text: warning.text,
                    location: {
                        file,
                        line: warning.line,
                        column: warning.column - 1,
                        lineText: lines?.[warning.line - 1],
                    },
                };
            });
        }
        for (const resultMessage of postcssResult.messages) {
            if (resultMessage.type === 'dependency' && typeof resultMessage['file'] === 'string') {
                loadResult.watchFiles ??= [];
                loadResult.watchFiles.push(resultMessage['file']);
            }
            else if (resultMessage.type === 'dir-dependency' &&
                typeof resultMessage['dir'] === 'string' &&
                typeof resultMessage['glob'] === 'string') {
                loadResult.watchFiles ??= [];
                const dependencies = await (0, fast_glob_1.default)(resultMessage['glob'], {
                    absolute: true,
                    cwd: resultMessage['dir'],
                });
                loadResult.watchFiles.push(...dependencies);
            }
        }
        return loadResult;
    }
    catch (error) {
        postcss ??= (await Promise.resolve().then(() => __importStar(require('postcss')))).default;
        if (error instanceof postcss.CssSyntaxError) {
            const lines = error.source?.split(/\r?\n/);
            return {
                errors: [
                    {
                        text: error.reason,
                        location: {
                            file: error.file,
                            line: error.line,
                            column: error.column && error.column - 1,
                            lineText: error.line === undefined ? undefined : lines?.[error.line - 1],
                        },
                    },
                ],
            };
        }
        throw error;
    }
}
