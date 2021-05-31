"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformTypescript = exports.createTypescriptContext = void 0;
const path_1 = require("path");
const ts = require("typescript");
// Test transform helpers.
const basefileName = 'test-file.ts';
function createTypescriptContext(content, additionalFiles, useLibs = false, extraCompilerOptions = {}, jsxFile = false) {
    const fileName = basefileName + (jsxFile ? 'x' : '');
    // Set compiler options.
    const compilerOptions = {
        noEmitOnError: useLibs,
        allowJs: true,
        newLine: ts.NewLineKind.LineFeed,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ESNext,
        skipLibCheck: true,
        sourceMap: false,
        importHelpers: true,
        experimentalDecorators: true,
        types: [],
        ...extraCompilerOptions,
    };
    // Create compiler host.
    const compilerHost = ts.createCompilerHost(compilerOptions, true);
    const baseFileExists = compilerHost.fileExists;
    compilerHost.fileExists = function (compilerFileName) {
        return (compilerFileName === fileName ||
            !!(additionalFiles === null || additionalFiles === void 0 ? void 0 : additionalFiles[path_1.basename(compilerFileName)]) ||
            baseFileExists(compilerFileName));
    };
    const baseReadFile = compilerHost.readFile;
    compilerHost.readFile = function (compilerFileName) {
        if (compilerFileName === fileName) {
            return content;
        }
        else if (additionalFiles === null || additionalFiles === void 0 ? void 0 : additionalFiles[path_1.basename(compilerFileName)]) {
            return additionalFiles[path_1.basename(compilerFileName)];
        }
        else {
            return baseReadFile(compilerFileName);
        }
    };
    // Create the TypeScript program.
    const program = ts.createProgram([fileName], compilerOptions, compilerHost);
    return { compilerHost, program };
}
exports.createTypescriptContext = createTypescriptContext;
function transformTypescript(content, transformers, program, compilerHost) {
    // Use given context or create a new one.
    if (content !== undefined) {
        const typescriptContext = createTypescriptContext(content);
        if (!program) {
            program = typescriptContext.program;
        }
        if (!compilerHost) {
            compilerHost = typescriptContext.compilerHost;
        }
    }
    else if (!program || !compilerHost) {
        throw new Error('transformTypescript needs either `content` or a `program` and `compilerHost');
    }
    const outputFileName = basefileName.replace(/\.tsx?$/, '.js');
    let outputContent;
    // Emit.
    const { emitSkipped, diagnostics } = program.emit(undefined, (filename, data) => {
        if (filename === outputFileName) {
            outputContent = data;
        }
    }, undefined, undefined, { before: transformers });
    // Throw error with diagnostics if emit wasn't successfull.
    if (emitSkipped) {
        throw new Error(ts.formatDiagnostics(diagnostics, compilerHost));
    }
    // Return the transpiled js.
    return outputContent;
}
exports.transformTypescript = transformTypescript;
