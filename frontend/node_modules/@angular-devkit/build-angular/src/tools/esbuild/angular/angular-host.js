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
exports.createAngularCompilerHost = exports.ensureSourceFileVersions = void 0;
const typescript_1 = __importDefault(require("typescript"));
// Temporary deep import for host augmentation support.
// TODO: Move these to a private exports location or move the implementation into this package.
const { augmentHostWithCaching, augmentHostWithReplacements, augmentProgramWithVersioning, } = require('@ngtools/webpack/src/ivy/host');
/**
 * Patches in-place the `getSourceFiles` function on an instance of a TypeScript
 * `Program` to ensure that all returned SourceFile instances have a `version`
 * field. The `version` field is required when used with a TypeScript BuilderProgram.
 * @param program The TypeScript Program instance to patch.
 */
function ensureSourceFileVersions(program) {
    augmentProgramWithVersioning(program);
}
exports.ensureSourceFileVersions = ensureSourceFileVersions;
function createAngularCompilerHost(compilerOptions, hostOptions) {
    // Create TypeScript compiler host
    const host = typescript_1.default.createIncrementalCompilerHost(compilerOptions);
    // Set the parsing mode to the same as TS 5.3 default for tsc. This provides a parse
    // performance improvement by skipping non-type related JSDoc parsing.
    // NOTE: The check for this enum can be removed when TS 5.3 support is the minimum.
    if (typescript_1.default.JSDocParsingMode) {
        host.jsDocParsingMode = typescript_1.default.JSDocParsingMode.ParseForTypeErrors;
    }
    // The AOT compiler currently requires this hook to allow for a transformResource hook.
    // Once the AOT compiler allows only a transformResource hook, this can be reevaluated.
    host.readResource = async function (filename) {
        return this.readFile(filename) ?? '';
    };
    // Add an AOT compiler resource transform hook
    host.transformResource = async function (data, context) {
        // Only style resources are transformed currently
        if (context.type !== 'style') {
            return null;
        }
        // No transformation required if the resource is empty
        if (data.trim().length === 0) {
            return { content: '' };
        }
        const result = await hostOptions.transformStylesheet(data, context.containingFile, context.resourceFile ?? undefined);
        return typeof result === 'string' ? { content: result } : null;
    };
    // Allow the AOT compiler to request the set of changed templates and styles
    host.getModifiedResourceFiles = function () {
        return hostOptions.modifiedFiles;
    };
    // Augment TypeScript Host for file replacements option
    if (hostOptions.fileReplacements) {
        // Provide a resolution cache since overriding resolution prevents automatic creation
        const resolutionCache = typescript_1.default.createModuleResolutionCache(host.getCurrentDirectory(), host.getCanonicalFileName.bind(host), compilerOptions);
        host.getModuleResolutionCache = () => resolutionCache;
        augmentHostWithReplacements(host, hostOptions.fileReplacements, resolutionCache);
    }
    // Augment TypeScript Host with source file caching if provided
    if (hostOptions.sourceFileCache) {
        augmentHostWithCaching(host, hostOptions.sourceFileCache);
    }
    return host;
}
exports.createAngularCompilerHost = createAngularCompilerHost;
