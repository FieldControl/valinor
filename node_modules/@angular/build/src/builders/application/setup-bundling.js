"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBundlerContexts = setupBundlerContexts;
const application_code_bundle_1 = require("../../tools/esbuild/application-code-bundle");
const bundler_context_1 = require("../../tools/esbuild/bundler-context");
const global_scripts_1 = require("../../tools/esbuild/global-scripts");
const global_styles_1 = require("../../tools/esbuild/global-styles");
const utils_1 = require("../../tools/esbuild/utils");
/**
 * Generates one or more BundlerContext instances based on the builder provided
 * configuration.
 * @param options The normalized application builder options to use.
 * @param browsers An string array of browserslist browsers to support.
 * @param codeBundleCache An instance of the TypeScript source file cache.
 * @returns An array of BundlerContext objects.
 */
function setupBundlerContexts(options, browsers, codeBundleCache) {
    const { appShellOptions, prerenderOptions, serverEntryPoint, ssrOptions, workspaceRoot } = options;
    const target = (0, utils_1.transformSupportedBrowsersToTargets)(browsers);
    const bundlerContexts = [];
    // Browser application code
    bundlerContexts.push(new bundler_context_1.BundlerContext(workspaceRoot, !!options.watch, (0, application_code_bundle_1.createBrowserCodeBundleOptions)(options, target, codeBundleCache)));
    // Browser polyfills code
    const browserPolyfillBundleOptions = (0, application_code_bundle_1.createBrowserPolyfillBundleOptions)(options, target, codeBundleCache);
    if (browserPolyfillBundleOptions) {
        bundlerContexts.push(new bundler_context_1.BundlerContext(workspaceRoot, !!options.watch, browserPolyfillBundleOptions));
    }
    // Global Stylesheets
    if (options.globalStyles.length > 0) {
        for (const initial of [true, false]) {
            const bundleOptions = (0, global_styles_1.createGlobalStylesBundleOptions)(options, target, initial);
            if (bundleOptions) {
                bundlerContexts.push(new bundler_context_1.BundlerContext(workspaceRoot, !!options.watch, bundleOptions, () => initial));
            }
        }
    }
    // Global Scripts
    if (options.globalScripts.length > 0) {
        for (const initial of [true, false]) {
            const bundleOptions = (0, global_scripts_1.createGlobalScriptsBundleOptions)(options, target, initial);
            if (bundleOptions) {
                bundlerContexts.push(new bundler_context_1.BundlerContext(workspaceRoot, !!options.watch, bundleOptions, () => initial));
            }
        }
    }
    // Skip server build when none of the features are enabled.
    if (serverEntryPoint && (prerenderOptions || appShellOptions || ssrOptions)) {
        const nodeTargets = [...target, ...(0, utils_1.getSupportedNodeTargets)()];
        // Server application code
        bundlerContexts.push(new bundler_context_1.BundlerContext(workspaceRoot, !!options.watch, (0, application_code_bundle_1.createServerCodeBundleOptions)(options, nodeTargets, codeBundleCache)));
        // Server polyfills code
        const serverPolyfillBundleOptions = (0, application_code_bundle_1.createServerPolyfillBundleOptions)(options, nodeTargets, codeBundleCache);
        if (serverPolyfillBundleOptions) {
            bundlerContexts.push(new bundler_context_1.BundlerContext(workspaceRoot, !!options.watch, serverPolyfillBundleOptions));
        }
    }
    return bundlerContexts;
}
