"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypescriptWorkerPlugin = exports.getTypeScriptConfig = void 0;
const core_1 = require("@angular-devkit/core");
const webpack_1 = require("@ngtools/webpack");
function ensureIvy(wco) {
    if (wco.tsConfig.options.enableIvy !== false) {
        return;
    }
    wco.logger.warn('Project is attempting to disable the Ivy compiler. ' +
        'Angular versions 12 and higher do not support the deprecated View Engine compiler for applications. ' +
        'The Ivy compiler will be used to build this project. ' +
        '\nFor additional information or if the build fails, please see https://angular.io/guide/ivy');
    wco.tsConfig.options.enableIvy = true;
}
function createIvyPlugin(wco, aot, tsconfig) {
    const { buildOptions } = wco;
    const optimize = buildOptions.optimization.scripts;
    const compilerOptions = {
        sourceMap: buildOptions.sourceMap.scripts,
        declaration: false,
        declarationMap: false,
    };
    if (buildOptions.preserveSymlinks !== undefined) {
        compilerOptions.preserveSymlinks = buildOptions.preserveSymlinks;
    }
    const fileReplacements = {};
    if (buildOptions.fileReplacements) {
        for (const replacement of buildOptions.fileReplacements) {
            fileReplacements[core_1.getSystemPath(replacement.replace)] = core_1.getSystemPath(replacement.with);
        }
    }
    let inlineStyleMimeType;
    switch (buildOptions.inlineStyleLanguage) {
        case 'less':
            inlineStyleMimeType = 'text/x-less';
            break;
        case 'sass':
            inlineStyleMimeType = 'text/x-sass';
            break;
        case 'scss':
            inlineStyleMimeType = 'text/x-scss';
            break;
        case 'css':
        default:
            inlineStyleMimeType = 'text/css';
            break;
    }
    return new webpack_1.AngularWebpackPlugin({
        tsconfig,
        compilerOptions,
        fileReplacements,
        jitMode: !aot,
        emitNgModuleScope: !optimize,
        inlineStyleMimeType,
    });
}
function getTypeScriptConfig(wco) {
    const { buildOptions, tsConfigPath } = wco;
    const aot = !!buildOptions.aot;
    ensureIvy(wco);
    return {
        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    loader: webpack_1.AngularWebpackLoaderPath,
                },
            ],
        },
        plugins: [createIvyPlugin(wco, aot, tsConfigPath)],
    };
}
exports.getTypeScriptConfig = getTypeScriptConfig;
function getTypescriptWorkerPlugin(wco, workerTsConfigPath) {
    return createIvyPlugin(wco, false, workerTsConfigPath);
}
exports.getTypescriptWorkerPlugin = getTypescriptWorkerPlugin;
