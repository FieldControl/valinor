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
exports.createCompilerPlugin = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const path = __importStar(require("node:path"));
const environment_options_1 = require("../../../utils/environment-options");
const javascript_transformer_1 = require("../javascript-transformer");
const load_result_cache_1 = require("../load-result-cache");
const profiling_1 = require("../profiling");
const compilation_1 = require("./compilation");
const compilation_state_1 = require("./compilation-state");
const component_stylesheets_1 = require("./component-stylesheets");
const file_reference_tracker_1 = require("./file-reference-tracker");
const jit_plugin_callbacks_1 = require("./jit-plugin-callbacks");
// eslint-disable-next-line max-lines-per-function
function createCompilerPlugin(pluginOptions, styleOptions) {
    return {
        name: 'angular-compiler',
        // eslint-disable-next-line max-lines-per-function
        async setup(build) {
            let setupWarnings = [];
            const preserveSymlinks = build.initialOptions.preserveSymlinks;
            // Initialize a worker pool for JavaScript transformations
            const javascriptTransformer = new javascript_transformer_1.JavaScriptTransformer(pluginOptions, environment_options_1.maxWorkers);
            // Setup defines based on the values used by the Angular compiler-cli
            build.initialOptions.define ??= {};
            build.initialOptions.define['ngI18nClosureMode'] ??= 'false';
            // The in-memory cache of TypeScript file outputs will be used during the build in `onLoad` callbacks for TS files.
            // A string value indicates direct TS/NG output and a Uint8Array indicates fully transformed code.
            const typeScriptFileCache = pluginOptions.sourceFileCache?.typeScriptFileCache ??
                new Map();
            // The resources from component stylesheets and web workers that will be added to the build results output files
            const additionalResults = new Map();
            // Create new reusable compilation for the appropriate mode based on the `jit` plugin option
            const compilation = pluginOptions.noopTypeScriptCompilation
                ? new compilation_1.NoopCompilation()
                : await (0, compilation_1.createAngularCompilation)(!!pluginOptions.jit);
            // Compilation is initially assumed to have errors until emitted
            let hasCompilationErrors = true;
            // Determines if TypeScript should process JavaScript files based on tsconfig `allowJs` option
            let shouldTsIgnoreJs = true;
            // Track incremental component stylesheet builds
            const stylesheetBundler = new component_stylesheets_1.ComponentStylesheetBundler(styleOptions, pluginOptions.incremental);
            let sharedTSCompilationState;
            // To fully invalidate files, track resource referenced files and their referencing source
            const referencedFileTracker = new file_reference_tracker_1.FileReferenceTracker();
            // eslint-disable-next-line max-lines-per-function
            build.onStart(async () => {
                sharedTSCompilationState = (0, compilation_state_1.getSharedCompilationState)();
                if (!(compilation instanceof compilation_1.NoopCompilation)) {
                    sharedTSCompilationState.markAsInProgress();
                }
                const result = {
                    warnings: setupWarnings,
                };
                // Reset debug performance tracking
                (0, profiling_1.resetCumulativeDurations)();
                // Update the reference tracker and generate a full set of modified files for the
                // Angular compiler which does not have direct knowledge of transitive resource
                // dependencies or web worker processing.
                let modifiedFiles;
                if (pluginOptions.sourceFileCache?.modifiedFiles.size &&
                    referencedFileTracker &&
                    !pluginOptions.noopTypeScriptCompilation) {
                    // TODO: Differentiate between changed input files and stale output files
                    modifiedFiles = referencedFileTracker.update(pluginOptions.sourceFileCache.modifiedFiles);
                    pluginOptions.sourceFileCache.invalidate(modifiedFiles);
                    stylesheetBundler.invalidate(modifiedFiles);
                }
                if (!pluginOptions.noopTypeScriptCompilation &&
                    compilation.update &&
                    pluginOptions.sourceFileCache?.modifiedFiles.size) {
                    await compilation.update(modifiedFiles ?? pluginOptions.sourceFileCache.modifiedFiles);
                }
                // Create Angular compiler host options
                const hostOptions = {
                    fileReplacements: pluginOptions.fileReplacements,
                    modifiedFiles,
                    sourceFileCache: pluginOptions.sourceFileCache,
                    async transformStylesheet(data, containingFile, stylesheetFile) {
                        let stylesheetResult;
                        // Stylesheet file only exists for external stylesheets
                        if (stylesheetFile) {
                            stylesheetResult = await stylesheetBundler.bundleFile(stylesheetFile);
                        }
                        else {
                            stylesheetResult = await stylesheetBundler.bundleInline(data, containingFile, styleOptions.inlineStyleLanguage);
                        }
                        const { contents, outputFiles, metafile, referencedFiles, errors, warnings } = stylesheetResult;
                        if (errors) {
                            (result.errors ??= []).push(...errors);
                        }
                        (result.warnings ??= []).push(...warnings);
                        additionalResults.set(stylesheetFile ?? containingFile, {
                            outputFiles,
                            metafile,
                        });
                        if (referencedFiles) {
                            referencedFileTracker.add(containingFile, referencedFiles);
                            if (stylesheetFile) {
                                // Angular AOT compiler needs modified direct resource files to correctly invalidate its analysis
                                referencedFileTracker.add(stylesheetFile, referencedFiles);
                            }
                        }
                        return contents;
                    },
                    processWebWorker(workerFile, containingFile) {
                        const fullWorkerPath = path.join(path.dirname(containingFile), workerFile);
                        // The synchronous API must be used due to the TypeScript compilation currently being
                        // fully synchronous and this process callback being called from within a TypeScript
                        // transformer.
                        const workerResult = bundleWebWorker(build, pluginOptions, fullWorkerPath);
                        (result.warnings ??= []).push(...workerResult.warnings);
                        if (workerResult.errors.length > 0) {
                            (result.errors ??= []).push(...workerResult.errors);
                            // Track worker file errors to allow rebuilds on changes
                            referencedFileTracker.add(containingFile, workerResult.errors
                                .map((error) => error.location?.file)
                                .filter((file) => !!file)
                                .map((file) => path.join(build.initialOptions.absWorkingDir ?? '', file)));
                            additionalResults.set(fullWorkerPath, { errors: result.errors });
                            // Return the original path if the build failed
                            return workerFile;
                        }
                        (0, node_assert_1.default)('outputFiles' in workerResult, 'Invalid web worker bundle result.');
                        additionalResults.set(fullWorkerPath, {
                            outputFiles: workerResult.outputFiles,
                            metafile: workerResult.metafile,
                        });
                        referencedFileTracker.add(containingFile, Object.keys(workerResult.metafile.inputs).map((input) => path.join(build.initialOptions.absWorkingDir ?? '', input)));
                        // Return bundled worker file entry name to be used in the built output
                        const workerCodeFile = workerResult.outputFiles.find((file) => /^worker-[A-Z0-9]{8}.[cm]?js$/.test(path.basename(file.path)));
                        (0, node_assert_1.default)(workerCodeFile, 'Web Worker bundled code file should always be present.');
                        const workerCodePath = path.relative(build.initialOptions.outdir ?? '', workerCodeFile.path);
                        return workerCodePath.replaceAll('\\', '/');
                    },
                };
                // Initialize the Angular compilation for the current build.
                // In watch mode, previous build state will be reused.
                let referencedFiles;
                try {
                    const initializationResult = await compilation.initialize(pluginOptions.tsconfig, hostOptions, createCompilerOptionsTransformer(setupWarnings, pluginOptions, preserveSymlinks));
                    shouldTsIgnoreJs = !initializationResult.compilerOptions.allowJs;
                    referencedFiles = initializationResult.referencedFiles;
                }
                catch (error) {
                    (result.errors ??= []).push({
                        text: 'Angular compilation initialization failed.',
                        location: null,
                        notes: [
                            {
                                text: error instanceof Error ? error.stack ?? error.message : `${error}`,
                                location: null,
                            },
                        ],
                    });
                    // Initialization failure prevents further compilation steps
                    hasCompilationErrors = true;
                    return result;
                }
                if (compilation instanceof compilation_1.NoopCompilation) {
                    hasCompilationErrors = await sharedTSCompilationState.waitUntilReady;
                    return result;
                }
                // Update TypeScript file output cache for all affected files
                try {
                    await (0, profiling_1.profileAsync)('NG_EMIT_TS', async () => {
                        for (const { filename, contents } of await compilation.emitAffectedFiles()) {
                            typeScriptFileCache.set(path.normalize(filename), contents);
                        }
                    });
                }
                catch (error) {
                    (result.errors ??= []).push({
                        text: 'Angular compilation emit failed.',
                        location: null,
                        notes: [
                            {
                                text: error instanceof Error ? error.stack ?? error.message : `${error}`,
                                location: null,
                            },
                        ],
                    });
                }
                const diagnostics = await compilation.diagnoseFiles(environment_options_1.useTypeChecking ? compilation_1.DiagnosticModes.All : compilation_1.DiagnosticModes.All & ~compilation_1.DiagnosticModes.Semantic);
                if (diagnostics.errors?.length) {
                    (result.errors ??= []).push(...diagnostics.errors);
                }
                if (diagnostics.warnings?.length) {
                    (result.warnings ??= []).push(...diagnostics.warnings);
                }
                // Add errors from failed additional results.
                // This must be done after emit to capture latest web worker results.
                for (const { errors } of additionalResults.values()) {
                    if (errors) {
                        (result.errors ??= []).push(...errors);
                    }
                }
                // Store referenced files for updated file watching if enabled
                if (pluginOptions.sourceFileCache) {
                    pluginOptions.sourceFileCache.referencedFiles = [
                        ...referencedFiles,
                        ...referencedFileTracker.referencedFiles,
                    ];
                }
                hasCompilationErrors = !!result.errors?.length;
                // Reset the setup warnings so that they are only shown during the first build.
                setupWarnings = undefined;
                sharedTSCompilationState.markAsReady(hasCompilationErrors);
                return result;
            });
            build.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, async (args) => {
                const request = path.normalize(pluginOptions.fileReplacements?.[path.normalize(args.path)] ?? args.path);
                // Skip TS load attempt if JS TypeScript compilation not enabled and file is JS
                if (shouldTsIgnoreJs && /\.[cm]?js$/.test(request)) {
                    return undefined;
                }
                // The filename is currently used as a cache key. Since the cache is memory only,
                // the options cannot change and do not need to be represented in the key. If the
                // cache is later stored to disk, then the options that affect transform output
                // would need to be added to the key as well as a check for any change of content.
                let contents = typeScriptFileCache.get(request);
                if (contents === undefined) {
                    // If the Angular compilation had errors the file may not have been emitted.
                    // To avoid additional errors about missing files, return empty contents.
                    if (hasCompilationErrors) {
                        return { contents: '', loader: 'js' };
                    }
                    // No TS result indicates the file is not part of the TypeScript program.
                    // If allowJs is enabled and the file is JS then defer to the next load hook.
                    if (!shouldTsIgnoreJs && /\.[cm]?js$/.test(request)) {
                        return undefined;
                    }
                    // Otherwise return an error
                    return {
                        errors: [
                            createMissingFileError(request, args.path, build.initialOptions.absWorkingDir ?? ''),
                        ],
                    };
                }
                else if (typeof contents === 'string') {
                    // A string indicates untransformed output from the TS/NG compiler
                    const sideEffects = await hasSideEffects(request);
                    contents = await javascriptTransformer.transformData(request, contents, true /* skipLinker */, sideEffects);
                    // Store as the returned Uint8Array to allow caching the fully transformed code
                    typeScriptFileCache.set(request, contents);
                }
                return {
                    contents,
                    loader: 'js',
                };
            });
            build.onLoad({ filter: /\.[cm]?js$/ }, (0, load_result_cache_1.createCachedLoad)(pluginOptions.loadResultCache, async (args) => {
                return (0, profiling_1.profileAsync)('NG_EMIT_JS*', async () => {
                    const sideEffects = await hasSideEffects(args.path);
                    const contents = await javascriptTransformer.transformFile(args.path, pluginOptions.jit, sideEffects);
                    return {
                        contents,
                        loader: 'js',
                    };
                }, true);
            }));
            // Setup bundling of component templates and stylesheets when in JIT mode
            if (pluginOptions.jit) {
                (0, jit_plugin_callbacks_1.setupJitPluginCallbacks)(build, stylesheetBundler, additionalResults, styleOptions.inlineStyleLanguage, pluginOptions.loadResultCache);
            }
            build.onEnd((result) => {
                // Ensure other compilations are unblocked if the main compilation throws during start
                sharedTSCompilationState?.markAsReady(hasCompilationErrors);
                for (const { outputFiles, metafile } of additionalResults.values()) {
                    // Add any additional output files to the main output files
                    if (outputFiles?.length) {
                        result.outputFiles?.push(...outputFiles);
                    }
                    // Combine additional metafiles with main metafile
                    if (result.metafile && metafile) {
                        // Append the existing object, by appending to it we prevent unnecessary new objections creations with spread
                        // mitigating significant performance overhead for large apps.
                        // See: https://bugs.chromium.org/p/v8/issues/detail?id=11536
                        Object.assign(result.metafile.inputs, metafile.inputs);
                        Object.assign(result.metafile.outputs, metafile.outputs);
                    }
                }
                (0, profiling_1.logCumulativeDurations)();
            });
            build.onDispose(() => {
                sharedTSCompilationState?.dispose();
                void stylesheetBundler.dispose();
                void compilation.close?.();
            });
            /**
             * Checks if the file has side-effects when `advancedOptimizations` is enabled.
             */
            async function hasSideEffects(path) {
                if (!pluginOptions.advancedOptimizations) {
                    return undefined;
                }
                const { sideEffects } = await build.resolve(path, {
                    kind: 'import-statement',
                    resolveDir: build.initialOptions.absWorkingDir ?? '',
                });
                return sideEffects;
            }
        },
    };
}
exports.createCompilerPlugin = createCompilerPlugin;
function createCompilerOptionsTransformer(setupWarnings, pluginOptions, preserveSymlinks) {
    return (compilerOptions) => {
        // target of 9 is ES2022 (using the number avoids an expensive import of typescript just for an enum)
        if (compilerOptions.target === undefined || compilerOptions.target < 9) {
            // If 'useDefineForClassFields' is already defined in the users project leave the value as is.
            // Otherwise fallback to false due to https://github.com/microsoft/TypeScript/issues/45995
            // which breaks the deprecated `@Effects` NGRX decorator and potentially other existing code as well.
            compilerOptions.target = 9;
            compilerOptions.useDefineForClassFields ??= false;
            // Only add the warning on the initial build
            setupWarnings?.push({
                text: 'TypeScript compiler options "target" and "useDefineForClassFields" are set to "ES2022" and ' +
                    '"false" respectively by the Angular CLI.',
                location: { file: pluginOptions.tsconfig },
                notes: [
                    {
                        text: 'To control ECMA version and features use the Browserslist configuration. ' +
                            'For more information, see https://angular.io/guide/build#configuring-browser-compatibility',
                    },
                ],
            });
        }
        if (compilerOptions.compilationMode === 'partial') {
            setupWarnings?.push({
                text: 'Angular partial compilation mode is not supported when building applications.',
                location: null,
                notes: [{ text: 'Full compilation mode will be used instead.' }],
            });
            compilerOptions.compilationMode = 'full';
        }
        // Enable incremental compilation by default if caching is enabled
        if (pluginOptions.sourceFileCache?.persistentCachePath) {
            compilerOptions.incremental ??= true;
            // Set the build info file location to the configured cache directory
            compilerOptions.tsBuildInfoFile = path.join(pluginOptions.sourceFileCache?.persistentCachePath, '.tsbuildinfo');
        }
        else {
            compilerOptions.incremental = false;
        }
        return {
            ...compilerOptions,
            noEmitOnError: false,
            inlineSources: pluginOptions.sourcemap,
            inlineSourceMap: pluginOptions.sourcemap,
            mapRoot: undefined,
            sourceRoot: undefined,
            preserveSymlinks,
        };
    };
}
function bundleWebWorker(build, pluginOptions, workerFile) {
    try {
        return build.esbuild.buildSync({
            ...build.initialOptions,
            platform: 'browser',
            write: false,
            bundle: true,
            metafile: true,
            format: 'esm',
            entryNames: 'worker-[hash]',
            entryPoints: [workerFile],
            sourcemap: pluginOptions.sourcemap,
            // Zone.js is not used in Web workers so no need to disable
            supported: undefined,
            // Plugins are not supported in sync esbuild calls
            plugins: undefined,
        });
    }
    catch (error) {
        if (error && typeof error === 'object' && 'errors' in error && 'warnings' in error) {
            return error;
        }
        throw error;
    }
}
function createMissingFileError(request, original, root) {
    const relativeRequest = path.relative(root, request);
    const error = {
        text: `File '${relativeRequest}' is missing from the TypeScript compilation.`,
        notes: [
            {
                text: `Ensure the file is part of the TypeScript program via the 'files' or 'include' property.`,
            },
        ],
    };
    const relativeOriginal = path.relative(root, original);
    if (relativeRequest !== relativeOriginal) {
        error.notes.push({
            text: `File is requested from a file replacement of '${relativeOriginal}'.`,
        });
    }
    return error;
}
