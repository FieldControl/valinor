"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiresLinking = void 0;
const babel_loader_1 = require("babel-loader");
const load_esm_1 = require("../utils/load-esm");
const package_version_1 = require("../utils/package-version");
/**
 * Cached instance of the compiler-cli linker's needsLinking function.
 */
let needsLinking;
/**
 * Cached instance of the compiler-cli linker's Babel plugin factory function.
 */
let linkerPluginCreator;
/**
 * Cached instance of the localize Babel plugins factory functions.
 */
let i18nPluginCreators;
async function requiresLinking(path, source) {
    // @angular/core and @angular/compiler will cause false positives
    // Also, TypeScript files do not require linking
    if (/[\\/]@angular[\\/](?:compiler|core)|\.tsx?$/.test(path)) {
        return false;
    }
    if (!needsLinking) {
        // Load ESM `@angular/compiler-cli/linker` using the TypeScript dynamic import workaround.
        // Once TypeScript provides support for keeping the dynamic import this workaround can be
        // changed to a direct dynamic import.
        const linkerModule = await (0, load_esm_1.loadEsmModule)('@angular/compiler-cli/linker');
        needsLinking = linkerModule.needsLinking;
    }
    return needsLinking(path, source);
}
exports.requiresLinking = requiresLinking;
// eslint-disable-next-line max-lines-per-function
exports.default = (0, babel_loader_1.custom)(() => {
    const baseOptions = Object.freeze({
        babelrc: false,
        configFile: false,
        compact: false,
        cacheCompression: false,
        sourceType: 'unambiguous',
        inputSourceMap: false,
    });
    return {
        async customOptions(options, { source, map }) {
            var _a, _b;
            const { i18n, aot, optimize, instrumentCode, supportedBrowsers, ...rawOptions } = options;
            // Must process file if plugins are added
            let shouldProcess = Array.isArray(rawOptions.plugins) && rawOptions.plugins.length > 0;
            const customOptions = {
                forceAsyncTransformation: false,
                angularLinker: undefined,
                i18n: undefined,
                instrumentCode: undefined,
                supportedBrowsers,
            };
            // Analyze file for linking
            if (await requiresLinking(this.resourcePath, source)) {
                // Load ESM `@angular/compiler-cli/linker/babel` using the TypeScript dynamic import workaround.
                // Once TypeScript provides support for keeping the dynamic import this workaround can be
                // changed to a direct dynamic import.
                linkerPluginCreator !== null && linkerPluginCreator !== void 0 ? linkerPluginCreator : (linkerPluginCreator = (await (0, load_esm_1.loadEsmModule)('@angular/compiler-cli/linker/babel')).createEs2015LinkerPlugin);
                customOptions.angularLinker = {
                    shouldLink: true,
                    jitMode: aot !== true,
                    linkerPluginCreator,
                };
                shouldProcess = true;
            }
            // Application code (TS files) will only contain native async if target is ES2017+.
            // However, third-party libraries can regardless of the target option.
            // APF packages with code in [f]esm2015 directories is downlevelled to ES2015 and
            // will not have native async.
            customOptions.forceAsyncTransformation =
                !/[\\/][_f]?esm2015[\\/]/.test(this.resourcePath) && source.includes('async');
            shouldProcess || (shouldProcess = customOptions.forceAsyncTransformation ||
                customOptions.supportedBrowsers !== undefined ||
                false);
            // Analyze for i18n inlining
            if (i18n &&
                !/[\\/]@angular[\\/](?:compiler|localize)/.test(this.resourcePath) &&
                source.includes('$localize')) {
                // Load the i18n plugin creators from the new `@angular/localize/tools` entry point.
                // This may fail during the transition to ESM due to the entry point not yet existing.
                // During the transition, this will always attempt to load the entry point for each file.
                // This will only occur during prerelease and will be automatically corrected once the new
                // entry point exists.
                if (i18nPluginCreators === undefined) {
                    // Load ESM `@angular/localize/tools` using the TypeScript dynamic import workaround.
                    // Once TypeScript provides support for keeping the dynamic import this workaround can be
                    // changed to a direct dynamic import.
                    i18nPluginCreators = await (0, load_esm_1.loadEsmModule)('@angular/localize/tools');
                }
                customOptions.i18n = {
                    ...i18n,
                    pluginCreators: i18nPluginCreators,
                };
                // Add translation files as dependencies of the file to support rebuilds
                // Except for `@angular/core` which needs locale injection but has no translations
                if (customOptions.i18n.translationFiles &&
                    !/[\\/]@angular[\\/]core/.test(this.resourcePath)) {
                    for (const file of customOptions.i18n.translationFiles) {
                        this.addDependency(file);
                    }
                }
                shouldProcess = true;
            }
            if (optimize) {
                const angularPackage = /[\\/]node_modules[\\/]@angular[\\/]/.test(this.resourcePath);
                customOptions.optimize = {
                    // Angular packages provide additional tested side effects guarantees and can use
                    // otherwise unsafe optimizations.
                    looseEnums: angularPackage,
                    pureTopLevel: angularPackage,
                    // JavaScript modules that are marked as side effect free are considered to have
                    // no decorators that contain non-local effects.
                    wrapDecorators: !!((_b = (_a = this._module) === null || _a === void 0 ? void 0 : _a.factoryMeta) === null || _b === void 0 ? void 0 : _b.sideEffectFree),
                };
                shouldProcess = true;
            }
            if (instrumentCode &&
                !instrumentCode.excludedPaths.has(this.resourcePath) &&
                !/\.(e2e|spec)\.tsx?$|[\\/]node_modules[\\/]/.test(this.resourcePath) &&
                this.resourcePath.startsWith(instrumentCode.includedBasePath)) {
                // `babel-plugin-istanbul` has it's own includes but we do the below so that we avoid running the the loader.
                customOptions.instrumentCode = {
                    includedBasePath: instrumentCode.includedBasePath,
                    inputSourceMap: map,
                };
                shouldProcess = true;
            }
            // Add provided loader options to default base options
            const loaderOptions = {
                ...baseOptions,
                ...rawOptions,
                cacheIdentifier: JSON.stringify({
                    buildAngular: package_version_1.VERSION,
                    customOptions,
                    baseOptions,
                    rawOptions,
                }),
            };
            // Skip babel processing if no actions are needed
            if (!shouldProcess) {
                // Force the current file to be ignored
                loaderOptions.ignore = [() => true];
            }
            return { custom: customOptions, loader: loaderOptions };
        },
        config(configuration, { customOptions }) {
            var _a;
            return {
                ...configuration.options,
                // Using `false` disables babel from attempting to locate sourcemaps or process any inline maps.
                // The babel types do not include the false option even though it is valid
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                inputSourceMap: (_a = configuration.options.inputSourceMap) !== null && _a !== void 0 ? _a : false,
                presets: [
                    ...(configuration.options.presets || []),
                    [
                        require('./presets/application').default,
                        {
                            ...customOptions,
                            diagnosticReporter: (type, message) => {
                                switch (type) {
                                    case 'error':
                                        this.emitError(message);
                                        break;
                                    case 'info':
                                    // Webpack does not currently have an informational diagnostic
                                    case 'warning':
                                        this.emitWarning(message);
                                        break;
                                }
                            },
                        },
                    ],
                ],
            };
        },
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VicGFjay1sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9iYWJlbC93ZWJwYWNrLWxvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQ0FBc0M7QUFDdEMsZ0RBQWtEO0FBQ2xELDhEQUFtRDtBQWFuRDs7R0FFRztBQUNILElBQUksWUFBb0YsQ0FBQztBQUV6Rjs7R0FFRztBQUNILElBQUksbUJBRVMsQ0FBQztBQUVkOztHQUVHO0FBQ0gsSUFBSSxrQkFBa0QsQ0FBQztBQUVoRCxLQUFLLFVBQVUsZUFBZSxDQUFDLElBQVksRUFBRSxNQUFjO0lBQ2hFLGlFQUFpRTtJQUNqRSxnREFBZ0Q7SUFDaEQsSUFBSSw2Q0FBNkMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDNUQsT0FBTyxLQUFLLENBQUM7S0FDZDtJQUVELElBQUksQ0FBQyxZQUFZLEVBQUU7UUFDakIsMEZBQTBGO1FBQzFGLHlGQUF5RjtRQUN6RixzQ0FBc0M7UUFDdEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFBLHdCQUFhLEVBQ3RDLDhCQUE4QixDQUMvQixDQUFDO1FBQ0YsWUFBWSxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUM7S0FDMUM7SUFFRCxPQUFPLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDcEMsQ0FBQztBQWxCRCwwQ0FrQkM7QUFFRCxrREFBa0Q7QUFDbEQsa0JBQWUsSUFBQSxxQkFBTSxFQUEyQixHQUFHLEVBQUU7SUFDbkQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNoQyxPQUFPLEVBQUUsS0FBSztRQUNkLFVBQVUsRUFBRSxLQUFLO1FBQ2pCLE9BQU8sRUFBRSxLQUFLO1FBQ2QsZ0JBQWdCLEVBQUUsS0FBSztRQUN2QixVQUFV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Qix1Q0FBdUM7Z0JBQ3ZDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNyQztZQUVELE9BQU8sRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQztRQUMxRCxDQUFDO1FBQ0QsTUFBTSxDQUFDLGFBQWEsRUFBRSxFQUFFLGFBQWEsRUFBRTs7WUFDckMsT0FBTztnQkFDTCxHQUFHLGFBQWEsQ0FBQyxPQUFPO2dCQUN4QixnR0FBZ0c7Z0JBQ2hHLDBFQUEwRTtnQkFDMUUsOERBQThEO2dCQUM5RCxjQUFjLEVBQUUsTUFBQSxhQUFhLENBQUMsT0FBTyxDQUFDLGNBQWMsbUNBQUssS0FBYTtnQkFDdEUsT0FBTyxFQUFFO29CQUNQLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7b0JBQ3hDO3dCQUNFLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLE9BQU87d0JBQ3hDOzRCQUNFLEdBQUcsYUFBYTs0QkFDaEIsa0JBQWtCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7Z0NBQ3BDLFFBQVEsSUFBSSxFQUFFO29DQUNaLEtBQUssT0FBTzt3Q0FDVixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dDQUN4QixNQUFNO29DQUNSLEtBQUssTUFBTSxDQUFDO29DQUNaLDhEQUE4RDtvQ0FDOUQsS0FBSyxTQUFTO3dDQUNaLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7d0NBQzFCLE1BQU07aUNBQ1Q7NEJBQ0gsQ0FBQzt5QkFDMEI7cUJBQzlCO2lCQUNGO2FBQ0YsQ0FBQztRQUNKLENBQUM7S0FDRixDQUFDO0FBQ0osQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgY3VzdG9tIH0gZnJvbSAnYmFiZWwtbG9hZGVyJztcbmltcG9ydCB7IGxvYWRFc21Nb2R1bGUgfSBmcm9tICcuLi91dGlscy9sb2FkLWVzbSc7XG5pbXBvcnQgeyBWRVJTSU9OIH0gZnJvbSAnLi4vdXRpbHMvcGFja2FnZS12ZXJzaW9uJztcbmltcG9ydCB7IEFwcGxpY2F0aW9uUHJlc2V0T3B0aW9ucywgSTE4blBsdWdpbkNyZWF0b3JzIH0gZnJvbSAnLi9wcmVzZXRzL2FwcGxpY2F0aW9uJztcblxuaW50ZXJmYWNlIEFuZ3VsYXJDdXN0b21PcHRpb25zIGV4dGVuZHMgT21pdDxBcHBsaWNhdGlvblByZXNldE9wdGlvbnMsICdpbnN0cnVtZW50Q29kZSc+IHtcbiAgaW5zdHJ1bWVudENvZGU/OiB7XG4gICAgLyoqIG5vZGVfbW9kdWxlcyBhbmQgdGVzdCBmaWxlcyBhcmUgYWx3YXlzIGV4Y2x1ZGVkLiAqL1xuICAgIGV4Y2x1ZGVkUGF0aHM6IFNldDxTdHJpbmc+O1xuICAgIGluY2x1ZGVkQmFzZVBhdGg6IHN0cmluZztcbiAgfTtcbn1cblxuZXhwb3J0IHR5cGUgQW5ndWxhckJhYmVsTG9hZGVyT3B0aW9ucyA9IEFuZ3VsYXJDdXN0b21PcHRpb25zICYgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbi8qKlxuICogQ2FjaGVkIGluc3RhbmNlIG9mIHRoZSBjb21waWxlci1jbGkgbGlua2VyJ3MgbmVlZHNMaW5raW5nIGZ1bmN0aW9uLlxuICovXG5sZXQgbmVlZHNMaW5raW5nOiB0eXBlb2YgaW1wb3J0KCdAYW5ndWxhci9jb21waWxlci1jbGkvbGlua2VyJykubmVlZHNMaW5raW5nIHwgdW5kZWZpbmVkO1xuXG4vKipcbiAqIENhY2hlZCBpbnN0YW5jZSBvZiB0aGUgY29tcGlsZXItY2xpIGxpbmtlcidzIEJhYmVsIHBsdWdpbiBmYWN0b3J5IGZ1bmN0aW9uLlxuICovXG5sZXQgbGlua2VyUGx1Z2luQ3JlYXRvcjpcbiAgfCB0eXBlb2YgaW1wb3J0KCdAYW5ndWxhci9jb21waWxlci1jbGkvbGlua2VyL2JhYmVsJykuY3JlYXRlRXMyMDE1TGlua2VyUGx1Z2luXG4gIHwgdW5kZWZpbmVkO1xuXG4vKipcbiAqIENhY2hlZCBpbnN0YW5jZSBvZiB0aGUgbG9jYWxpemUgQmFiZWwgcGx1Z2lucyBmYWN0b3J5IGZ1bmN0aW9ucy5cbiAqL1xubGV0IGkxOG5QbHVnaW5DcmVhdG9yczogSTE4blBsdWdpbkNyZWF0b3JzIHwgdW5kZWZpbmVkO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVxdWlyZXNMaW5raW5nKHBhdGg6IHN0cmluZywgc291cmNlOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgLy8gQGFuZ3VsYXIvY29yZSBhbmQgQGFuZ3VsYXIvY29tcGlsZXIgd2lsbCBjYXVzZSBmYWxzZSBwb3NpdGl2ZXNcbiAgLy8gQWxzbywgVHlwZVNjcmlwdCBmaWxlcyBkbyBub3QgcmVxdWlyZSBsaW5raW5nXG4gIGlmICgvW1xcXFwvXUBhbmd1bGFyW1xcXFwvXSg/OmNvbXBpbGVyfGNvcmUpfFxcLnRzeD8kLy50ZXN0KHBhdGgpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFuZWVkc0xpbmtpbmcpIHtcbiAgICAvLyBMb2FkIEVTTSBgQGFuZ3VsYXIvY29tcGlsZXItY2xpL2xpbmtlcmAgdXNpbmcgdGhlIFR5cGVTY3JpcHQgZHluYW1pYyBpbXBvcnQgd29ya2Fyb3VuZC5cbiAgICAvLyBPbmNlIFR5cGVTY3JpcHQgcHJvdmlkZXMgc3VwcG9ydCBmb3Iga2VlcGluZyB0aGUgZHluYW1pYyBpbXBvcnQgdGhpcyB3b3JrYXJvdW5kIGNhbiBiZVxuICAgIC8vIGNoYW5nZWQgdG8gYSBkaXJlY3QgZHluYW1pYyBpbXBvcnQuXG4gICAgY29uc3QgbGlua2VyTW9kdWxlID0gYXdhaXQgbG9hZEVzbU1vZHVsZTx0eXBlb2YgaW1wb3J0KCdAYW5ndWxhci9jb21waWxlci1jbGkvbGlua2VyJyk+KFxuICAgICAgJ0Bhbmd1bGFyL2NvbXBpbGVyLWNsaS9saW5rZXInLFxuICAgICk7XG4gICAgbmVlZHNMaW5raW5nID0gbGlua2VyTW9kdWxlLm5lZWRzTGlua2luZztcbiAgfVxuXG4gIHJldHVybiBuZWVkc0xpbmtpbmcocGF0aCwgc291cmNlKTtcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG1heC1saW5lcy1wZXItZnVuY3Rpb25cbmV4cG9ydCBkZWZhdWx0IGN1c3RvbTxBcHBsaWNhdGlvblByZXNldE9wdGlvbnM+KCgpID0+IHtcbiAgY29uc3QgYmFzZU9wdGlvbnMgPSBPYmplY3QuZnJlZXplKHtcbiAgICBiYWJlbHJjOiBmYWxzZSxcbiAgICBjb25maWdGaWxlOiBmYWxzZSxcbiAgICBjb21wYWN0OiBmYWxzZSxcbiAgICBjYWNoZUNvbXByZXNzaW9uOiBmYWxzZSxcbiAgICBzb3VyY2VUeXBlOiAndW5hbWJpZ3VvdXMnLFxuICAgIGlucHV0U291cmNlTWFwOiBmYWxzZSxcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBhc3luYyBjdXN0b21PcHRpb25zKG9wdGlvbnMsIHsgc291cmNlLCBtYXAgfSkge1xuICAgICAgY29uc3QgeyBpMThuLCBhb3QsIG9wdGltaXplLCBpbnN0cnVtZW50Q29kZSwgc3VwcG9ydGVkQnJvd3NlcnMsIC4uLnJhd09wdGlvbnMgfSA9XG4gICAgICAgIG9wdGlvbnMgYXMgQW5ndWxhckJhYmVsTG9hZGVyT3B0aW9ucztcblxuICAgICAgLy8gTXVzdCBwcm9jZXNzIGZpbGUgaWYgcGx1Z2lucyBhcmUgYWRkZWRcbiAgICAgIGxldCBzaG91bGRQcm9jZXNzID0gQXJyYXkuaXNBcnJheShyYXdPcHRpb25zLnBsdWdpbnMpICYmIHJhd09wdGlvbnMucGx1Z2lucy5sZW5ndGggPiAwO1xuXG4gICAgICBjb25zdCBjdXN0b21PcHRpb25zOiBBcHBsaWNhdGlvblByZXNldE9wdGlvbnMgPSB7XG4gICAgICAgIGZvcmNlQXN5bmNUcmFuc2Zvcm1hdGlvbjogZmFsc2UsXG4gICAgICAgIGFuZ3VsYXJMaW5rZXI6IHVuZGVmaW5lZCxcbiAgICAgICAgaTE4bjogdW5kZWZpbmVkLFxuICAgICAgICBpbnN0cnVtZW50Q29kZTogdW5kZWZpbmVkLFxuICAgICAgICBzdXBwb3J0ZWRCcm93c2VycyxcbiAgICAgIH07XG5cbiAgICAgIC8vIEFuYWx5emUgZmlsZSBmb3IgbGlua2luZ1xuICAgICAgaWYgKGF3YWl0IHJlcXVpcmVzTGlua2luZyh0aGlzLnJlc291cmNlUGF0aCwgc291cmNlKSkge1xuICAgICAgICAvLyBMb2FkIEVTTSBgQGFuZ3VsYXIvY29tcGlsZXItY2xpL2xpbmtlci9iYWJlbGAgdXNpbmcgdGhlIFR5cGVTY3JpcHQgZHluYW1pYyBpbXBvcnQgd29ya2Fyb3VuZC5cbiAgICAgICAgLy8gT25jZSBUeXBlU2NyaXB0IHByb3ZpZGVzIHN1cHBvcnQgZm9yIGtlZXBpbmcgdGhlIGR5bmFtaWMgaW1wb3J0IHRoaXMgd29ya2Fyb3VuZCBjYW4gYmVcbiAgICAgICAgLy8gY2hhbmdlZCB0byBhIGRpcmVjdCBkeW5hbWljIGltcG9ydC5cbiAgICAgICAgbGlua2VyUGx1Z2luQ3JlYXRvciA/Pz0gKFxuICAgICAgICAgIGF3YWl0IGxvYWRFc21Nb2R1bGU8dHlwZW9mIGltcG9ydCgnQGFuZ3VsYXIvY29tcGlsZXItY2xpL2xpbmtlci9iYWJlbCcpPihcbiAgICAgICAgICAgICdAYW5ndWxhci9jb21waWxlci1jbGkvbGlua2VyL2JhYmVsJyxcbiAgICAgICAgICApXG4gICAgICAgICkuY3JlYXRlRXMyMDE1TGlua2VyUGx1Z2luO1xuXG4gICAgICAgIGN1c3RvbU9wdGlvbnMuYW5ndWxhckxpbmtlciA9IHtcbiAgICAgICAgICBzaG91bGRMaW5rOiB0cnVlLFxuICAgICAgICAgIGppdE1vZGU6IGFvdCAhPT0gdHJ1ZSxcbiAgICAgICAgICBsaW5rZXJQbHVnaW5DcmVhdG9yLFxuICAgICAgICB9O1xuICAgICAgICBzaG91bGRQcm9jZXNzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gQXBwbGljYXRpb24gY29kZSAoVFMgZmlsZXMpIHdpbGwgb25seSBjb250YWluIG5hdGl2ZSBhc3luYyBpZiB0YXJnZXQgaXMgRVMyMDE3Ky5cbiAgICAgIC8vIEhvd2V2ZXIsIHRoaXJkLXBhcnR5IGxpYnJhcmllcyBjYW4gcmVnYXJkbGVzcyBvZiB0aGUgdGFyZ2V0IG9wdGlvbi5cbiAgICAgIC8vIEFQRiBwYWNrYWdlcyB3aXRoIGNvZGUgaW4gW2ZdZXNtMjAxNSBkaXJlY3RvcmllcyBpcyBkb3dubGV2ZWxsZWQgdG8gRVMyMDE1IGFuZFxuICAgICAgLy8gd2lsbCBub3QgaGF2ZSBuYXRpdmUgYXN5bmMuXG4gICAgICBjdXN0b21PcHRpb25zLmZvcmNlQXN5bmNUcmFuc2Zvcm1hdGlvbiA9XG4gICAgICAgICEvW1xcXFwvXVtfZl0/ZXNtMjAxNVtcXFxcL10vLnRlc3QodGhpcy5yZXNvdXJjZVBhdGgpICYmIHNvdXJjZS5pbmNsdWRlcygnYXN5bmMnKTtcblxuICAgICAgc2hvdWxkUHJvY2VzcyB8fD1cbiAgICAgICAgY3VzdG9tT3B0aW9ucy5mb3JjZUFzeW5jVHJhbnNmb3JtYXRpb24gfHxcbiAgICAgICAgY3VzdG9tT3B0aW9ucy5zdXBwb3J0ZWRCcm93c2VycyAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgIGZhbHNlO1xuXG4gICAgICAvLyBBbmFseXplIGZvciBpMThuIGlubGluaW5nXG4gICAgICBpZiAoXG4gICAgICAgIGkxOG4gJiZcbiAgICAgICAgIS9bXFxcXC9dQGFuZ3VsYXJbXFxcXC9dKD86Y29tcGlsZXJ8bG9jYWxpemUpLy50ZXN0KHRoaXMucmVzb3VyY2VQYXRoKSAmJlxuICAgICAgICBzb3VyY2UuaW5jbHVkZXMoJyRsb2NhbGl6ZScpXG4gICAgICApIHtcbiAgICAgICAgLy8gTG9hZCB0aGUgaTE4biBwbHVnaW4gY3JlYXRvcnMgZnJvbSB0aGUgbmV3IGBAYW5ndWxhci9sb2NhbGl6ZS90b29sc2AgZW50cnkgcG9pbnQuXG4gICAgICAgIC8vIFRoaXMgbWF5IGZhaWwgZHVyaW5nIHRoZSB0cmFuc2l0aW9uIHRvIEVTTSBkdWUgdG8gdGhlIGVudHJ5IHBvaW50IG5vdCB5ZXQgZXhpc3RpbmcuXG4gICAgICAgIC8vIER1cmluZyB0aGUgdHJhbnNpdGlvbiwgdGhpcyB3aWxsIGFsd2F5cyBhdHRlbXB0IHRvIGxvYWQgdGhlIGVudHJ5IHBvaW50IGZvciBlYWNoIGZpbGUuXG4gICAgICAgIC8vIFRoaXMgd2lsbCBvbmx5IG9jY3VyIGR1cmluZyBwcmVyZWxlYXNlIGFuZCB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgY29ycmVjdGVkIG9uY2UgdGhlIG5ld1xuICAgICAgICAvLyBlbnRyeSBwb2ludCBleGlzdHMuXG4gICAgICAgIGlmIChpMThuUGx1Z2luQ3JlYXRvcnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIExvYWQgRVNNIGBAYW5ndWxhci9sb2NhbGl6ZS90b29sc2AgdXNpbmcgdGhlIFR5cGVTY3JpcHQgZHluYW1pYyBpbXBvcnQgd29ya2Fyb3VuZC5cbiAgICAgICAgICAvLyBPbmNlIFR5cGVTY3JpcHQgcHJvdmlkZXMgc3VwcG9ydCBmb3Iga2VlcGluZyB0aGUgZHluYW1pYyBpbXBvcnQgdGhpcyB3b3JrYXJvdW5kIGNhbiBiZVxuICAgICAgICAgIC8vIGNoYW5nZWQgdG8gYSBkaXJlY3QgZHluYW1pYyBpbXBvcnQuXG4gICAgICAgICAgaTE4blBsdWdpbkNyZWF0b3JzID0gYXdhaXQgbG9hZEVzbU1vZHVsZTxJMThuUGx1Z2luQ3JlYXRvcnM+KCdAYW5ndWxhci9sb2NhbGl6ZS90b29scycpO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VzdG9tT3B0aW9ucy5pMThuID0ge1xuICAgICAgICAgIC4uLihpMThuIGFzIE5vbk51bGxhYmxlPEFwcGxpY2F0aW9uUHJlc2V0T3B0aW9uc1snaTE4biddPiksXG4gICAgICAgICAgcGx1Z2luQ3JlYXRvcnM6IGkxOG5QbHVnaW5DcmVhdG9ycyxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBBZGQgdHJhbnNsYXRpb24gZmlsZXMgYXMgZGVwZW5kZW5jaWVzIG9mIHRoZSBmaWxlIHRvIHN1cHBvcnQgcmVidWlsZHNcbiAgICAgICAgLy8gRXhjZXB0IGZvciBgQGFuZ3VsYXIvY29yZWAgd2hpY2ggbmVlZHMgbG9jYWxlIGluamVjdGlvbiBidXQgaGFzIG5vIHRyYW5zbGF0aW9uc1xuICAgICAgICBpZiAoXG4gICAgICAgICAgY3VzdG9tT3B0aW9ucy5pMThuLnRyYW5zbGF0aW9uRmlsZXMgJiZcbiAgICAgICAgICAhL1tcXFxcL11AYW5ndWxhcltcXFxcL11jb3JlLy50ZXN0KHRoaXMucmVzb3VyY2VQYXRoKVxuICAgICAgICApIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGZpbGUgb2YgY3VzdG9tT3B0aW9ucy5pMThuLnRyYW5zbGF0aW9uRmlsZXMpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkRGVwZW5kZW5jeShmaWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzaG91bGRQcm9jZXNzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGltaXplKSB7XG4gICAgICAgIGNvbnN0IGFuZ3VsYXJQYWNrYWdlID0gL1tcXFxcL11ub2RlX21vZHVsZXNbXFxcXC9dQGFuZ3VsYXJbXFxcXC9dLy50ZXN0KHRoaXMucmVzb3VyY2VQYXRoKTtcbiAgICAgICAgY3VzdG9tT3B0aW9ucy5vcHRpbWl6ZSA9IHtcbiAgICAgICAgICAvLyBBbmd1bGFyIHBhY2thZ2VzIHByb3ZpZGUgYWRkaXRpb25hbCB0ZXN0ZWQgc2lkZSBlZmZlY3RzIGd1YXJhbnRlZXMgYW5kIGNhbiB1c2VcbiAgICAgICAgICAvLyBvdGhlcndpc2UgdW5zYWZlIG9wdGltaXphdGlvbnMuXG4gICAgICAgICAgbG9vc2VFbnVtczogYW5ndWxhclBhY2thZ2UsXG4gICAgICAgICAgcHVyZVRvcExldmVsOiBhbmd1bGFyUGFja2FnZSxcbiAgICAgICAgICAvLyBKYXZhU2NyaXB0IG1vZHVsZXMgdGhhdCBhcmUgbWFya2VkIGFzIHNpZGUgZWZmZWN0IGZyZWUgYXJlIGNvbnNpZGVyZWQgdG8gaGF2ZVxuICAgICAgICAgIC8vIG5vIGRlY29yYXRvcnMgdGhhdCBjb250YWluIG5vbi1sb2NhbCBlZmZlY3RzLlxuICAgICAgICAgIHdyYXBEZWNvcmF0b3JzOiAhIXRoaXMuX21vZHVsZT8uZmFjdG9yeU1ldGE/LnNpZGVFZmZlY3RGcmVlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHNob3VsZFByb2Nlc3MgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIGluc3RydW1lbnRDb2RlICYmXG4gICAgICAgICFpbnN0cnVtZW50Q29kZS5leGNsdWRlZFBhdGhzLmhhcyh0aGlzLnJlc291cmNlUGF0aCkgJiZcbiAgICAgICAgIS9cXC4oZTJlfHNwZWMpXFwudHN4PyR8W1xcXFwvXW5vZGVfbW9kdWxlc1tcXFxcL10vLnRlc3QodGhpcy5yZXNvdXJjZVBhdGgpICYmXG4gICAgICAgIHRoaXMucmVzb3VyY2VQYXRoLnN0YXJ0c1dpdGgoaW5zdHJ1bWVudENvZGUuaW5jbHVkZWRCYXNlUGF0aClcbiAgICAgICkge1xuICAgICAgICAvLyBgYmFiZWwtcGx1Z2luLWlzdGFuYnVsYCBoYXMgaXQncyBvd24gaW5jbHVkZXMgYnV0IHdlIGRvIHRoZSBiZWxvdyBzbyB0aGF0IHdlIGF2b2lkIHJ1bm5pbmcgdGhlIHRoZSBsb2FkZXIuXG4gICAgICAgIGN1c3RvbU9wdGlvbnMuaW5zdHJ1bWVudENvZGUgPSB7XG4gICAgICAgICAgaW5jbHVkZWRCYXNlUGF0aDogaW5zdHJ1bWVudENvZGUuaW5jbHVkZWRCYXNlUGF0aCxcbiAgICAgICAgICBpbnB1dFNvdXJjZU1hcDogbWFwLFxuICAgICAgICB9O1xuXG4gICAgICAgIHNob3VsZFByb2Nlc3MgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgcHJvdmlkZWQgbG9hZGVyIG9wdGlvbnMgdG8gZGVmYXVsdCBiYXNlIG9wdGlvbnNcbiAgICAgIGNvbnN0IGxvYWRlck9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge1xuICAgICAgICAuLi5iYXNlT3B0aW9ucyxcbiAgICAgICAgLi4ucmF3T3B0aW9ucyxcbiAgICAgICAgY2FjaGVJZGVudGlmaWVyOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgYnVpbGRBbmd1bGFyOiBWRVJTSU9OLFxuICAgICAgICAgIGN1c3RvbU9wdGlvbnMsXG4gICAgICAgICAgYmFzZU9wdGlvbnMsXG4gICAgICAgICAgcmF3T3B0aW9ucyxcbiAgICAgICAgfSksXG4gICAgICB9O1xuXG4gICAgICAvLyBTa2lwIGJhYmVsIHByb2Nlc3NpbmcgaWYgbm8gYWN0aW9ucyBhcmUgbmVlZGVkXG4gICAgICBpZiAoIXNob3VsZFByb2Nlc3MpIHtcbiAgICAgICAgLy8gRm9yY2UgdGhlIGN1cnJlbnQgZmlsZSB0byBiZSBpZ25vcmVkXG4gICAgICAgIGxvYWRlck9wdGlvbnMuaWdub3JlID0gWygpID0+IHRydWVdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4geyBjdXN0b206IGN1c3RvbU9wdGlvbnMsIGxvYWRlcjogbG9hZGVyT3B0aW9ucyB9O1xuICAgIH0sXG4gICAgY29uZmlnKGNvbmZpZ3VyYXRpb24sIHsgY3VzdG9tT3B0aW9ucyB9KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5jb25maWd1cmF0aW9uLm9wdGlvbnMsXG4gICAgICAgIC8vIFVzaW5nIGBmYWxzZWAgZGlzYWJsZXMgYmFiZWwgZnJvbSBhdHRlbXB0aW5nIHRvIGxvY2F0ZSBzb3VyY2VtYXBzIG9yIHByb2Nlc3MgYW55IGlubGluZSBtYXBzLlxuICAgICAgICAvLyBUaGUgYmFiZWwgdHlwZXMgZG8gbm90IGluY2x1ZGUgdGhlIGZhbHNlIG9wdGlvbiBldmVuIHRob3VnaCBpdCBpcyB2YWxpZFxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICBpbnB1dFNvdXJjZU1hcDogY29uZmlndXJhdGlvbi5vcHRpb25zLmlucHV0U291cmNlTWFwID8/IChmYWxzZSBhcyBhbnkpLFxuICAgICAgICBwcmVzZXRzOiBbXG4gICAgICAgICAgLi4uKGNvbmZpZ3VyYXRpb24ub3B0aW9ucy5wcmVzZXRzIHx8IFtdKSxcbiAgICAgICAgICBbXG4gICAgICAgICAgICByZXF1aXJlKCcuL3ByZXNldHMvYXBwbGljYXRpb24nKS5kZWZhdWx0LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAuLi5jdXN0b21PcHRpb25zLFxuICAgICAgICAgICAgICBkaWFnbm9zdGljUmVwb3J0ZXI6ICh0eXBlLCBtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdEVycm9yKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgICAgICAgLy8gV2VicGFjayBkb2VzIG5vdCBjdXJyZW50bHkgaGF2ZSBhbiBpbmZvcm1hdGlvbmFsIGRpYWdub3N0aWNcbiAgICAgICAgICAgICAgICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXRXYXJuaW5nKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9IGFzIEFwcGxpY2F0aW9uUHJlc2V0T3B0aW9ucyxcbiAgICAgICAgICBdLFxuICAgICAgICBdLFxuICAgICAgfTtcbiAgICB9LFxuICB9O1xufSk7XG4iXX0=