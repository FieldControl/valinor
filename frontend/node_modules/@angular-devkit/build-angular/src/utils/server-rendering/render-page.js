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
exports.renderPage = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const node_path_1 = require("node:path");
const load_esm_from_memory_1 = require("./load-esm-from-memory");
/**
 * Renders each route in routes and writes them to <outputPath>/<route>/index.html.
 */
async function renderPage({ route, serverContext, document, inlineCriticalCss, outputFiles, loadBundle = load_esm_from_memory_1.loadEsmModuleFromMemory, }) {
    const { default: bootstrapAppFnOrModule } = await loadBundle('./main.server.mjs');
    const { ɵSERVER_CONTEXT, renderModule, renderApplication, ɵresetCompiledComponents, ɵConsole } = await loadBundle('./render-utils.server.mjs');
    // Need to clean up GENERATED_COMP_IDS map in `@angular/core`.
    // Otherwise an incorrect component ID generation collision detected warning will be displayed in development.
    // See: https://github.com/angular/angular-cli/issues/25924
    ɵresetCompiledComponents?.();
    const platformProviders = [
        {
            provide: ɵSERVER_CONTEXT,
            useValue: serverContext,
        },
        {
            provide: ɵConsole,
            /** An Angular Console Provider that does not print a set of predefined logs. */
            useFactory: () => {
                class Console extends ɵConsole {
                    ignoredLogs = new Set(['Angular is running in development mode.']);
                    log(message) {
                        if (!this.ignoredLogs.has(message)) {
                            super.log(message);
                        }
                    }
                }
                return new Console();
            },
        },
    ];
    let html;
    (0, node_assert_1.default)(bootstrapAppFnOrModule, 'The file "./main.server.mjs" does not have a default export for an AppServerModule or a bootstrapping function.');
    if (isBootstrapFn(bootstrapAppFnOrModule)) {
        html = await renderApplication(bootstrapAppFnOrModule, {
            document,
            url: route,
            platformProviders,
        });
    }
    else {
        html = await renderModule(bootstrapAppFnOrModule, {
            document,
            url: route,
            extraProviders: platformProviders,
        });
    }
    if (inlineCriticalCss) {
        const { InlineCriticalCssProcessor } = await Promise.resolve().then(() => __importStar(require('../../utils/index-file/inline-critical-css')));
        const inlineCriticalCssProcessor = new InlineCriticalCssProcessor({
            minify: false, // CSS has already been minified during the build.
            readAsset: async (filePath) => {
                filePath = (0, node_path_1.basename)(filePath);
                const content = outputFiles[filePath];
                if (content === undefined) {
                    throw new Error(`Output file does not exist: ${filePath}`);
                }
                return content;
            },
        });
        return inlineCriticalCssProcessor.process(html, { outputPath: '' });
    }
    return {
        content: html,
    };
}
exports.renderPage = renderPage;
function isBootstrapFn(value) {
    // We can differentiate between a module and a bootstrap function by reading compiler-generated `ɵmod` static property:
    return typeof value === 'function' && !('ɵmod' in value);
}
