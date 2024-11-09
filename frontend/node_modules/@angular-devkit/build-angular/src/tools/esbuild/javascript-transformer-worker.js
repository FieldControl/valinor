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
const core_1 = require("@babel/core");
const piscina_1 = __importDefault(require("piscina"));
const application_1 = __importStar(require("../../tools/babel/presets/application"));
const load_esm_1 = require("../../utils/load-esm");
const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();
async function transformJavaScript(request) {
    const { filename, data, ...options } = request;
    const textData = typeof data === 'string' ? data : textDecoder.decode(data);
    const transformedData = await transformWithBabel(filename, textData, options);
    // Transfer the data via `move` instead of cloning
    return piscina_1.default.move(textEncoder.encode(transformedData));
}
exports.default = transformJavaScript;
let linkerPluginCreator;
async function transformWithBabel(filename, data, options) {
    const shouldLink = !options.skipLinker && (await (0, application_1.requiresLinking)(filename, data));
    const useInputSourcemap = options.sourcemap &&
        (!!options.thirdPartySourcemaps || !/[\\/]node_modules[\\/]/.test(filename));
    // If no additional transformations are needed, return the data directly
    if (!options.advancedOptimizations && !shouldLink) {
        // Strip sourcemaps if they should not be used
        return useInputSourcemap ? data : data.replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, '');
    }
    const sideEffectFree = options.sideEffects === false;
    const safeAngularPackage = sideEffectFree && /[\\/]node_modules[\\/]@angular[\\/]/.test(filename);
    // Lazy load the linker plugin only when linking is required
    if (shouldLink) {
        linkerPluginCreator ??= (await (0, load_esm_1.loadEsmModule)('@angular/compiler-cli/linker/babel')).createEs2015LinkerPlugin;
    }
    const result = await (0, core_1.transformAsync)(data, {
        filename,
        inputSourceMap: (useInputSourcemap ? undefined : false),
        sourceMaps: useInputSourcemap ? 'inline' : false,
        compact: false,
        configFile: false,
        babelrc: false,
        browserslistConfigFile: false,
        plugins: [],
        presets: [
            [
                application_1.default,
                {
                    angularLinker: linkerPluginCreator && {
                        shouldLink,
                        jitMode: options.jit,
                        linkerPluginCreator,
                    },
                    optimize: options.advancedOptimizations && {
                        pureTopLevel: safeAngularPackage,
                        wrapDecorators: sideEffectFree,
                    },
                },
            ],
        ],
    });
    const outputCode = result?.code ?? data;
    // Strip sourcemaps if they should not be used.
    // Babel will keep the original comments even if sourcemaps are disabled.
    return useInputSourcemap
        ? outputCode
        : outputCode.replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, '');
}
