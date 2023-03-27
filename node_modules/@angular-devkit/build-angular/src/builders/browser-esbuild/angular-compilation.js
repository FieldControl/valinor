"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _AngularCompilation_angularCompilerCliModule, _AngularCompilation_state;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngularCompilation = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const typescript_1 = __importDefault(require("typescript"));
const load_esm_1 = require("../../utils/load-esm");
const angular_host_1 = require("./angular-host");
const profiling_1 = require("./profiling");
// Temporary deep import for transformer support
// TODO: Move these to a private exports location or move the implementation into this package.
const { mergeTransformers, replaceBootstrap } = require('@ngtools/webpack/src/ivy/transformation');
class AngularCompilationState {
    constructor(angularProgram, typeScriptProgram, affectedFiles, templateDiagnosticsOptimization, diagnosticCache = new WeakMap()) {
        this.angularProgram = angularProgram;
        this.typeScriptProgram = typeScriptProgram;
        this.affectedFiles = affectedFiles;
        this.templateDiagnosticsOptimization = templateDiagnosticsOptimization;
        this.diagnosticCache = diagnosticCache;
    }
    get angularCompiler() {
        return this.angularProgram.compiler;
    }
}
class AngularCompilation {
    static async loadCompilerCli() {
        var _b;
        // This uses a wrapped dynamic import to load `@angular/compiler-cli` which is ESM.
        // Once TypeScript provides support for retaining dynamic imports this workaround can be dropped.
        __classPrivateFieldSet(this, _a, (_b = __classPrivateFieldGet(this, _a, "f", _AngularCompilation_angularCompilerCliModule)) !== null && _b !== void 0 ? _b : await (0, load_esm_1.loadEsmModule)('@angular/compiler-cli'), "f", _AngularCompilation_angularCompilerCliModule);
        return __classPrivateFieldGet(this, _a, "f", _AngularCompilation_angularCompilerCliModule);
    }
    constructor() {
        _AngularCompilation_state.set(this, void 0);
    }
    async initialize(rootNames, compilerOptions, hostOptions, configurationDiagnostics) {
        var _b, _c;
        // Dynamically load the Angular compiler CLI package
        const { NgtscProgram, OptimizeFor } = await AngularCompilation.loadCompilerCli();
        // Create Angular compiler host
        const host = (0, angular_host_1.createAngularCompilerHost)(compilerOptions, hostOptions);
        // Create the Angular specific program that contains the Angular compiler
        const angularProgram = (0, profiling_1.profileSync)('NG_CREATE_PROGRAM', () => { var _b; return new NgtscProgram(rootNames, compilerOptions, host, (_b = __classPrivateFieldGet(this, _AngularCompilation_state, "f")) === null || _b === void 0 ? void 0 : _b.angularProgram); });
        const angularCompiler = angularProgram.compiler;
        const angularTypeScriptProgram = angularProgram.getTsProgram();
        (0, angular_host_1.ensureSourceFileVersions)(angularTypeScriptProgram);
        const typeScriptProgram = typescript_1.default.createEmitAndSemanticDiagnosticsBuilderProgram(angularTypeScriptProgram, host, (_b = __classPrivateFieldGet(this, _AngularCompilation_state, "f")) === null || _b === void 0 ? void 0 : _b.typeScriptProgram, configurationDiagnostics);
        await (0, profiling_1.profileAsync)('NG_ANALYZE_PROGRAM', () => angularCompiler.analyzeAsync());
        const affectedFiles = (0, profiling_1.profileSync)('NG_FIND_AFFECTED', () => findAffectedFiles(typeScriptProgram, angularCompiler));
        __classPrivateFieldSet(this, _AngularCompilation_state, new AngularCompilationState(angularProgram, typeScriptProgram, affectedFiles, affectedFiles.size === 1 ? OptimizeFor.SingleFile : OptimizeFor.WholeProgram, (_c = __classPrivateFieldGet(this, _AngularCompilation_state, "f")) === null || _c === void 0 ? void 0 : _c.diagnosticCache), "f");
        return { affectedFiles };
    }
    *collectDiagnostics() {
        (0, node_assert_1.default)(__classPrivateFieldGet(this, _AngularCompilation_state, "f"), 'Angular compilation must be initialized prior to collecting diagnostics.');
        const { affectedFiles, angularCompiler, diagnosticCache, templateDiagnosticsOptimization, typeScriptProgram, } = __classPrivateFieldGet(this, _AngularCompilation_state, "f");
        // Collect program level diagnostics
        yield* typeScriptProgram.getConfigFileParsingDiagnostics();
        yield* angularCompiler.getOptionDiagnostics();
        yield* typeScriptProgram.getOptionsDiagnostics();
        yield* typeScriptProgram.getGlobalDiagnostics();
        // Collect source file specific diagnostics
        for (const sourceFile of typeScriptProgram.getSourceFiles()) {
            if (angularCompiler.ignoreForDiagnostics.has(sourceFile)) {
                continue;
            }
            // TypeScript will use cached diagnostics for files that have not been
            // changed or affected for this build when using incremental building.
            yield* (0, profiling_1.profileSync)('NG_DIAGNOSTICS_SYNTACTIC', () => typeScriptProgram.getSyntacticDiagnostics(sourceFile), true);
            yield* (0, profiling_1.profileSync)('NG_DIAGNOSTICS_SEMANTIC', () => typeScriptProgram.getSemanticDiagnostics(sourceFile), true);
            // Declaration files cannot have template diagnostics
            if (sourceFile.isDeclarationFile) {
                continue;
            }
            // Only request Angular template diagnostics for affected files to avoid
            // overhead of template diagnostics for unchanged files.
            if (affectedFiles.has(sourceFile)) {
                const angularDiagnostics = (0, profiling_1.profileSync)('NG_DIAGNOSTICS_TEMPLATE', () => angularCompiler.getDiagnosticsForFile(sourceFile, templateDiagnosticsOptimization), true);
                diagnosticCache.set(sourceFile, angularDiagnostics);
                yield* angularDiagnostics;
            }
            else {
                const angularDiagnostics = diagnosticCache.get(sourceFile);
                if (angularDiagnostics) {
                    yield* angularDiagnostics;
                }
            }
        }
    }
    createFileEmitter(onAfterEmit) {
        (0, node_assert_1.default)(__classPrivateFieldGet(this, _AngularCompilation_state, "f"), 'Angular compilation must be initialized prior to emitting files.');
        const { angularCompiler, typeScriptProgram } = __classPrivateFieldGet(this, _AngularCompilation_state, "f");
        const transformers = mergeTransformers(angularCompiler.prepareEmit().transformers, {
            before: [replaceBootstrap(() => typeScriptProgram.getProgram().getTypeChecker())],
        });
        return async (file) => {
            const sourceFile = typeScriptProgram.getSourceFile(file);
            if (!sourceFile) {
                return undefined;
            }
            let content;
            typeScriptProgram.emit(sourceFile, (filename, data) => {
                if (/\.[cm]?js$/.test(filename)) {
                    content = data;
                }
            }, undefined /* cancellationToken */, undefined /* emitOnlyDtsFiles */, transformers);
            angularCompiler.incrementalCompilation.recordSuccessfulEmit(sourceFile);
            onAfterEmit === null || onAfterEmit === void 0 ? void 0 : onAfterEmit(sourceFile);
            return { content, dependencies: [] };
        };
    }
}
exports.AngularCompilation = AngularCompilation;
_a = AngularCompilation, _AngularCompilation_state = new WeakMap();
_AngularCompilation_angularCompilerCliModule = { value: void 0 };
function findAffectedFiles(builder, { ignoreForDiagnostics, ignoreForEmit, incrementalCompilation }) {
    const affectedFiles = new Set();
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const result = builder.getSemanticDiagnosticsOfNextAffectedFile(undefined, (sourceFile) => {
            // If the affected file is a TTC shim, add the shim's original source file.
            // This ensures that changes that affect TTC are typechecked even when the changes
            // are otherwise unrelated from a TS perspective and do not result in Ivy codegen changes.
            // For example, changing @Input property types of a directive used in another component's
            // template.
            // A TTC shim is a file that has been ignored for diagnostics and has a filename ending in `.ngtypecheck.ts`.
            if (ignoreForDiagnostics.has(sourceFile) && sourceFile.fileName.endsWith('.ngtypecheck.ts')) {
                // This file name conversion relies on internal compiler logic and should be converted
                // to an official method when available. 15 is length of `.ngtypecheck.ts`
                const originalFilename = sourceFile.fileName.slice(0, -15) + '.ts';
                const originalSourceFile = builder.getSourceFile(originalFilename);
                if (originalSourceFile) {
                    affectedFiles.add(originalSourceFile);
                }
                return true;
            }
            return false;
        });
        if (!result) {
            break;
        }
        affectedFiles.add(result.affected);
    }
    // A file is also affected if the Angular compiler requires it to be emitted
    for (const sourceFile of builder.getSourceFiles()) {
        if (ignoreForEmit.has(sourceFile) || incrementalCompilation.safeToSkipEmit(sourceFile)) {
            continue;
        }
        affectedFiles.add(sourceFile);
    }
    return affectedFiles;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1jb21waWxhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL2J1aWxkZXJzL2Jyb3dzZXItZXNidWlsZC9hbmd1bGFyLWNvbXBpbGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdILDhEQUFpQztBQUNqQyw0REFBNEI7QUFDNUIsbURBQXFEO0FBQ3JELGlEQUl3QjtBQUN4QiwyQ0FBd0Q7QUFFeEQsZ0RBQWdEO0FBQ2hELCtGQUErRjtBQUMvRixNQUFNLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxPQUFPLENBQUMseUNBQXlDLENBQUMsQ0FBQztBQUVuRyxNQUFNLHVCQUF1QjtJQUMzQixZQUNrQixjQUErQixFQUMvQixpQkFBOEQsRUFDOUQsYUFBeUMsRUFDekMsK0JBQStDLEVBQy9DLGtCQUFrQixJQUFJLE9BQU8sRUFBa0M7UUFKL0QsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1FBQy9CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBNkM7UUFDOUQsa0JBQWEsR0FBYixhQUFhLENBQTRCO1FBQ3pDLG9DQUErQixHQUEvQiwrQkFBK0IsQ0FBZ0I7UUFDL0Msb0JBQWUsR0FBZixlQUFlLENBQWdEO0lBQzlFLENBQUM7SUFFSixJQUFJLGVBQWU7UUFDakIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQztJQUN0QyxDQUFDO0NBQ0Y7QUFTRCxNQUFhLGtCQUFrQjtJQUs3QixNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWU7O1FBQzFCLG1GQUFtRjtRQUNuRixpR0FBaUc7UUFDakcsNkpBQW1DLE1BQU0sSUFBQSx3QkFBYSxFQUFZLHVCQUF1QixDQUFDLG9EQUFBLENBQUM7UUFFM0YsT0FBTyx1QkFBQSxJQUFJLHdE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ZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB0eXBlIG5nIGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyLWNsaSc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ25vZGU6YXNzZXJ0JztcbmltcG9ydCB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7IGxvYWRFc21Nb2R1bGUgfSBmcm9tICcuLi8uLi91dGlscy9sb2FkLWVzbSc7XG5pbXBvcnQge1xuICBBbmd1bGFySG9zdE9wdGlvbnMsXG4gIGNyZWF0ZUFuZ3VsYXJDb21waWxlckhvc3QsXG4gIGVuc3VyZVNvdXJjZUZpbGVWZXJzaW9ucyxcbn0gZnJvbSAnLi9hbmd1bGFyLWhvc3QnO1xuaW1wb3J0IHsgcHJvZmlsZUFzeW5jLCBwcm9maWxlU3luYyB9IGZyb20gJy4vcHJvZmlsaW5nJztcblxuLy8gVGVtcG9yYXJ5IGRlZXAgaW1wb3J0IGZvciB0cmFuc2Zvcm1lciBzdXBwb3J0XG4vLyBUT0RPOiBNb3ZlIHRoZXNlIHRvIGEgcHJpdmF0ZSBleHBvcnRzIGxvY2F0aW9uIG9yIG1vdmUgdGhlIGltcGxlbWVudGF0aW9uIGludG8gdGhpcyBwYWNrYWdlLlxuY29uc3QgeyBtZXJnZVRyYW5zZm9ybWVycywgcmVwbGFjZUJvb3RzdHJhcCB9ID0gcmVxdWlyZSgnQG5ndG9vbHMvd2VicGFjay9zcmMvaXZ5L3RyYW5zZm9ybWF0aW9uJyk7XG5cbmNsYXNzIEFuZ3VsYXJDb21waWxhdGlvblN0YXRlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlYWRvbmx5IGFuZ3VsYXJQcm9ncmFtOiBuZy5OZ3RzY1Byb2dyYW0sXG4gICAgcHVibGljIHJlYWRvbmx5IHR5cGVTY3JpcHRQcm9ncmFtOiB0cy5FbWl0QW5kU2VtYW50aWNEaWFnbm9zdGljc0J1aWxkZXJQcm9ncmFtLFxuICAgIHB1YmxpYyByZWFkb25seSBhZmZlY3RlZEZpbGVzOiBSZWFkb25seVNldDx0cy5Tb3VyY2VGaWxlPixcbiAgICBwdWJsaWMgcmVhZG9ubHkgdGVtcGxhdGVEaWFnbm9zdGljc09wdGltaXphdGlvbjogbmcuT3B0aW1pemVGb3IsXG4gICAgcHVibGljIHJlYWRvbmx5IGRpYWdub3N0aWNDYWNoZSA9IG5ldyBXZWFrTWFwPHRzLlNvdXJjZUZpbGUsIHRzLkRpYWdub3N0aWNbXT4oKSxcbiAgKSB7fVxuXG4gIGdldCBhbmd1bGFyQ29tcGlsZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuYW5ndWxhclByb2dyYW0uY29tcGlsZXI7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbWl0RmlsZVJlc3VsdCB7XG4gIGNvbnRlbnQ/OiBzdHJpbmc7XG4gIG1hcD86IHN0cmluZztcbiAgZGVwZW5kZW5jaWVzOiByZWFkb25seSBzdHJpbmdbXTtcbn1cbmV4cG9ydCB0eXBlIEZpbGVFbWl0dGVyID0gKGZpbGU6IHN0cmluZykgPT4gUHJvbWlzZTxFbWl0RmlsZVJlc3VsdCB8IHVuZGVmaW5lZD47XG5cbmV4cG9ydCBjbGFzcyBBbmd1bGFyQ29tcGlsYXRpb24ge1xuICBzdGF0aWMgI2FuZ3VsYXJDb21waWxlckNsaU1vZHVsZT86IHR5cGVvZiBuZztcblxuICAjc3RhdGU/OiBBbmd1bGFyQ29tcGlsYXRpb25TdGF0ZTtcblxuICBzdGF0aWMgYXN5bmMgbG9hZENvbXBpbGVyQ2xpKCk6IFByb21pc2U8dHlwZW9mIG5nPiB7XG4gICAgLy8gVGhpcyB1c2VzIGEgd3JhcHBlZCBkeW5hbWljIGltcG9ydCB0byBsb2FkIGBAYW5ndWxhci9jb21waWxlci1jbGlgIHdoaWNoIGlzIEVTTS5cbiAgICAvLyBPbmNlIFR5cGVTY3JpcHQgcHJvdmlkZXMgc3VwcG9ydCBmb3IgcmV0YWluaW5nIGR5bmFtaWMgaW1wb3J0cyB0aGlzIHdvcmthcm91bmQgY2FuIGJlIGRyb3BwZWQuXG4gICAgdGhpcy4jYW5ndWxhckNvbXBpbGVyQ2xpTW9kdWxlID8/PSBhd2FpdCBsb2FkRXNtTW9kdWxlPHR5cGVvZiBuZz4oJ0Bhbmd1bGFyL2NvbXBpbGVyLWNsaScpO1xuXG4gICAgcmV0dXJuIHRoaXMuI2FuZ3VsYXJDb21waWxlckNsaU1vZHVsZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBhc3luYyBpbml0aWFsaXplKFxuICAgIHJvb3ROYW1lczogc3RyaW5nW10sXG4gICAgY29tcGlsZXJPcHRpb25zOiBuZy5Db21waWxlck9wdGlvbnMsXG4gICAgaG9zdE9wdGlvbnM6IEFuZ3VsYXJIb3N0T3B0aW9ucyxcbiAgICBjb25maWd1cmF0aW9uRGlhZ25vc3RpY3M/OiB0cy5EaWFnbm9zdGljW10sXG4gICk6IFByb21pc2U8eyBhZmZlY3RlZEZpbGVzOiBSZWFkb25seVNldDx0cy5Tb3VyY2VGaWxlPiB9PiB7XG4gICAgLy8gRHluYW1pY2FsbHkgbG9hZCB0aGUgQW5ndWxhciBjb21waWxlciBDTEkgcGFja2FnZVxuICAgIGNvbnN0IHsgTmd0c2NQcm9ncmFtLCBPcHRpbWl6ZUZvciB9ID0gYXdhaXQgQW5ndWxhckNvbXBpbGF0aW9uLmxvYWRDb21waWxlckNsaSgpO1xuXG4gICAgLy8gQ3JlYXRlIEFuZ3VsYXIgY29tcGlsZXIgaG9zdFxuICAgIGNvbnN0IGhvc3QgPSBjcmVhdGVBbmd1bGFyQ29tcGlsZXJIb3N0KGNvbXBpbGVyT3B0aW9ucywgaG9zdE9wdGlvbnMpO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBBbmd1bGFyIHNwZWNpZmljIHByb2dyYW0gdGhhdCBjb250YWlucyB0aGUgQW5ndWxhciBjb21waWxlclxuICAgIGNvbnN0IGFuZ3VsYXJQcm9ncmFtID0gcHJvZmlsZVN5bmMoXG4gICAgICAnTkdfQ1JFQVRFX1BST0dSQU0nLFxuICAgICAgKCkgPT4gbmV3IE5ndHNjUHJvZ3JhbShyb290TmFtZXMsIGNvbXBpbGVyT3B0aW9ucywgaG9zdCwgdGhpcy4jc3RhdGU/LmFuZ3VsYXJQcm9ncmFtKSxcbiAgICApO1xuICAgIGNvbnN0IGFuZ3VsYXJDb21waWxlciA9IGFuZ3VsYXJQcm9ncmFtLmNvbXBpbGVyO1xuICAgIGNvbnN0IGFuZ3VsYXJUeXBlU2NyaXB0UHJvZ3JhbSA9IGFuZ3VsYXJQcm9ncmFtLmdldFRzUHJvZ3JhbSgpO1xuICAgIGVuc3VyZVNvdXJjZUZpbGVWZXJzaW9ucyhhbmd1bGFyVHlwZVNjcmlwdFByb2dyYW0pO1xuXG4gICAgY29uc3QgdHlwZVNjcmlwdFByb2dyYW0gPSB0cy5jcmVhdGVFbWl0QW5kU2VtYW50aWNEaWFnbm9zdGljc0J1aWxkZXJQcm9ncmFtKFxuICAgICAgYW5ndWxhclR5cGVTY3JpcHRQcm9ncmFtLFxuICAgICAgaG9zdCxcbiAgICAgIHRoaXMuI3N0YXRlPy50eXBlU2NyaXB0UHJvZ3JhbSxcbiAgICAgIGNvbmZpZ3VyYXRpb25EaWFnbm9zdGljcyxcbiAgICApO1xuXG4gICAgYXdhaXQgcHJvZmlsZUFzeW5jKCdOR19BTkFMWVpFX1BST0dSQU0nLCAoKSA9PiBhbmd1bGFyQ29tcGlsZXIuYW5hbHl6ZUFzeW5jKCkpO1xuICAgIGNvbnN0IGFmZmVjdGVkRmlsZXMgPSBwcm9maWxlU3luYygnTkdfRklORF9BRkZFQ1RFRCcsICgpID0+XG4gICAgICBmaW5kQWZmZWN0ZWRGaWxlcyh0eXBlU2NyaXB0UHJvZ3JhbSwgYW5ndWxhckNvbXBpbGVyKSxcbiAgICApO1xuXG4gICAgdGhpcy4jc3RhdGUgPSBuZXcgQW5ndWxhckNvbXBpbGF0aW9uU3RhdGUoXG4gICAgICBhbmd1bGFyUHJvZ3JhbSxcbiAgICAgIHR5cGVTY3JpcHRQcm9ncmFtLFxuICAgICAgYWZmZWN0ZWRGaWxlcyxcbiAgICAgIGFmZmVjdGVkRmlsZXMuc2l6ZSA9PT0gMSA/IE9wdGltaXplRm9yLlNpbmdsZUZpbGUgOiBPcHRpbWl6ZUZvci5XaG9sZVByb2dyYW0sXG4gICAgICB0aGlzLiNzdGF0ZT8uZGlhZ25vc3RpY0NhY2hlLFxuICAgICk7XG5cbiAgICByZXR1cm4geyBhZmZlY3RlZEZpbGVzIH07XG4gIH1cblxuICAqY29sbGVjdERpYWdub3N0aWNzKCk6IEl0ZXJhYmxlPHRzLkRpYWdub3N0aWM+IHtcbiAgICBhc3NlcnQodGhpcy4jc3RhdGUsICdBbmd1bGFyIGNvbXBpbGF0aW9uIG11c3QgYmUgaW5pdGlhbGl6ZWQgcHJpb3IgdG8gY29sbGVjdGluZyBkaWFnbm9zdGljcy4nKTtcbiAgICBjb25zdCB7XG4gICAgICBhZmZlY3RlZEZpbGVzLFxuICAgICAgYW5ndWxhckNvbXBpbGVyLFxuICAgICAgZGlhZ25vc3RpY0NhY2hlLFxuICAgICAgdGVtcGxhdGVEaWFnbm9zdGljc09wdGltaXphdGlvbixcbiAgICAgIHR5cGVTY3JpcHRQcm9ncmFtLFxuICAgIH0gPSB0aGlzLiNzdGF0ZTtcblxuICAgIC8vIENvbGxlY3QgcHJvZ3JhbSBsZXZlbCBkaWFnbm9zdGljc1xuICAgIHlpZWxkKiB0eXBlU2NyaXB0UHJvZ3JhbS5nZXRDb25maWdGaWxlUGFyc2luZ0RpYWdub3N0aWNzKCk7XG4gICAgeWllbGQqIGFuZ3VsYXJDb21waWxlci5nZXRPcHRpb25EaWFnbm9zdGljcygpO1xuICAgIHlpZWxkKiB0eXBlU2NyaXB0UHJvZ3JhbS5nZXRPcHRpb25zRGlhZ25vc3RpY3MoKTtcbiAgICB5aWVsZCogdHlwZVNjcmlwdFByb2dyYW0uZ2V0R2xvYmFsRGlhZ25vc3RpY3MoKTtcblxuICAgIC8vIENvbGxlY3Qgc291cmNlIGZpbGUgc3BlY2lmaWMgZGlhZ25vc3RpY3NcbiAgICBmb3IgKGNvbnN0IHNvdXJjZUZpbGUgb2YgdHlwZVNjcmlwdFByb2dyYW0uZ2V0U291cmNlRmlsZXMoKSkge1xuICAgICAgaWYgKGFuZ3VsYXJDb21waWxlci5pZ25vcmVGb3JEaWFnbm9zdGljcy5oYXMoc291cmNlRmlsZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFR5cGVTY3JpcHQgd2lsbCB1c2UgY2FjaGVkIGRpYWdub3N0aWNzIGZvciBmaWxlcyB0aGF0IGhhdmUgbm90IGJlZW5cbiAgICAgIC8vIGNoYW5nZWQgb3IgYWZmZWN0ZWQgZm9yIHRoaXMgYnVpbGQgd2hlbiB1c2luZyBpbmNyZW1lbnRhbCBidWlsZGluZy5cbiAgICAgIHlpZWxkKiBwcm9maWxlU3luYyhcbiAgICAgICAgJ05HX0RJQUdOT1NUSUNTX1NZTlRBQ1RJQycsXG4gICAgICAgICgpID0+IHR5cGVTY3JpcHRQcm9ncmFtLmdldFN5bnRhY3RpY0RpYWdub3N0aWNzKHNvdXJjZUZpbGUpLFxuICAgICAgICB0cnVlLFxuICAgICAgKTtcbiAgICAgIHlpZWxkKiBwcm9maWxlU3luYyhcbiAgICAgICAgJ05HX0RJQUdOT1NUSUNTX1NFTUFOVElDJyxcbiAgICAgICAgKCkgPT4gdHlwZVNjcmlwdFByb2dyYW0uZ2V0U2VtYW50aWNEaWFnbm9zdGljcyhzb3VyY2VGaWxlKSxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICk7XG5cbiAgICAgIC8vIERlY2xhcmF0aW9uIGZpbGVzIGNhbm5vdCBoYXZlIHRlbXBsYXRlIGRpYWdub3N0aWNzXG4gICAgICBpZiAoc291cmNlRmlsZS5pc0RlY2xhcmF0aW9uRmlsZSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gT25seSByZXF1ZXN0IEFuZ3VsYXIgdGVtcGxhdGUgZGlhZ25vc3RpY3MgZm9yIGFmZmVjdGVkIGZpbGVzIHRvIGF2b2lkXG4gICAgICAvLyBvdmVyaGVhZCBvZiB0ZW1wbGF0ZSBkaWFnbm9zdGljcyBmb3IgdW5jaGFuZ2VkIGZpbGVzLlxuICAgICAgaWYgKGFmZmVjdGVkRmlsZXMuaGFzKHNvdXJjZUZpbGUpKSB7XG4gICAgICAgIGNvbnN0IGFuZ3VsYXJEaWFnbm9zdGljcyA9IHByb2ZpbGVTeW5jKFxuICAgICAgICAgICdOR19ESUFHTk9TVElDU19URU1QTEFURScsXG4gICAgICAgICAgKCkgPT4gYW5ndWxhckNvbXBpbGVyLmdldERpYWdub3N0aWNzRm9yRmlsZShzb3VyY2VGaWxlLCB0ZW1wbGF0ZURpYWdub3N0aWNzT3B0aW1pemF0aW9uKSxcbiAgICAgICAgICB0cnVlLFxuICAgICAgICApO1xuICAgICAgICBkaWFnbm9zdGljQ2FjaGUuc2V0KHNvdXJjZUZpbGUsIGFuZ3VsYXJEaWFnbm9zdGljcyk7XG4gICAgICAgIHlpZWxkKiBhbmd1bGFyRGlhZ25vc3RpY3M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBhbmd1bGFyRGlhZ25vc3RpY3MgPSBkaWFnbm9zdGljQ2FjaGUuZ2V0KHNvdXJjZUZpbGUpO1xuICAgICAgICBpZiAoYW5ndWxhckRpYWdub3N0aWNzKSB7XG4gICAgICAgICAgeWllbGQqIGFuZ3VsYXJEaWFnbm9zdGljcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZUZpbGVFbWl0dGVyKG9uQWZ0ZXJFbWl0PzogKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpID0+IHZvaWQpOiBGaWxlRW1pdHRlciB7XG4gICAgYXNzZXJ0KHRoaXMuI3N0YXRlLCAnQW5ndWxhciBjb21waWxhdGlvbiBtdXN0IGJlIGluaXRpYWxpemVkIHByaW9yIHRvIGVtaXR0aW5nIGZpbGVzLicpO1xuICAgIGNvbnN0IHsgYW5ndWxhckNvbXBpbGVyLCB0eXBlU2NyaXB0UHJvZ3JhbSB9ID0gdGhpcy4jc3RhdGU7XG5cbiAgICBjb25zdCB0cmFuc2Zvcm1lcnMgPSBtZXJnZVRyYW5zZm9ybWVycyhhbmd1bGFyQ29tcGlsZXIucHJlcGFyZUVtaXQoKS50cmFuc2Zvcm1lcnMsIHtcbiAgICAgIGJlZm9yZTogW3JlcGxhY2VCb290c3RyYXAoKCkgPT4gdHlwZVNjcmlwdFByb2dyYW0uZ2V0UHJvZ3JhbSgpLmdldFR5cGVDaGVja2VyKCkpXSxcbiAgICB9KTtcblxuICAgIHJldHVybiBhc3luYyAoZmlsZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBzb3VyY2VGaWxlID0gdHlwZVNjcmlwdFByb2dyYW0uZ2V0U291cmNlRmlsZShmaWxlKTtcbiAgICAgIGlmICghc291cmNlRmlsZSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICBsZXQgY29udGVudDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgdHlwZVNjcmlwdFByb2dyYW0uZW1pdChcbiAgICAgICAgc291cmNlRmlsZSxcbiAgICAgICAgKGZpbGVuYW1lLCBkYXRhKSA9PiB7XG4gICAgICAgICAgaWYgKC9cXC5bY21dP2pzJC8udGVzdChmaWxlbmFtZSkpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBkYXRhO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdW5kZWZpbmVkIC8qIGNhbmNlbGxhdGlvblRva2VuICovLFxuICAgICAgICB1bmRlZmluZWQgLyogZW1pdE9ubHlEdHNGaWxlcyAqLyxcbiAgICAgICAgdHJhbnNmb3JtZXJzLFxuICAgICAgKTtcblxuICAgICAgYW5ndWxhckNvbXBpbGVyLmluY3JlbWVudGFsQ29tcGlsYXRpb24ucmVjb3JkU3VjY2Vzc2Z1bEVtaXQoc291cmNlRmlsZSk7XG4gICAgICBvbkFmdGVyRW1pdD8uKHNvdXJjZUZpbGUpO1xuXG4gICAgICByZXR1cm4geyBjb250ZW50LCBkZXBlbmRlbmNpZXM6IFtdIH07XG4gICAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmaW5kQWZmZWN0ZWRGaWxlcyhcbiAgYnVpbGRlcjogdHMuRW1pdEFuZFNlbWFudGljRGlhZ25vc3RpY3NCdWlsZGVyUHJvZ3JhbSxcbiAgeyBpZ25vcmVGb3JEaWFnbm9zdGljcywgaWdub3JlRm9yRW1pdCwgaW5jcmVtZW50YWxDb21waWxhdGlvbiB9OiBuZy5OZ3RzY1Byb2dyYW1bJ2NvbXBpbGVyJ10sXG4pOiBTZXQ8dHMuU291cmNlRmlsZT4ge1xuICBjb25zdCBhZmZlY3RlZEZpbGVzID0gbmV3IFNldDx0cy5Tb3VyY2VGaWxlPigpO1xuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBjb25zdCByZXN1bHQgPSBidWlsZGVyLmdldFNlbWFudGljRGlhZ25vc3RpY3NPZk5leHRBZmZlY3RlZEZpbGUodW5kZWZpbmVkLCAoc291cmNlRmlsZSkgPT4ge1xuICAgICAgLy8gSWYgdGhlIGFmZmVjdGVkIGZpbGUgaXMgYSBUVEMgc2hpbSwgYWRkIHRoZSBzaGltJ3Mgb3JpZ2luYWwgc291cmNlIGZpbGUuXG4gICAgICAvLyBUaGlzIGVuc3VyZXMgdGhhdCBjaGFuZ2VzIHRoYXQgYWZmZWN0IFRUQyBhcmUgdHlwZWNoZWNrZWQgZXZlbiB3aGVuIHRoZSBjaGFuZ2VzXG4gICAgICAvLyBhcmUgb3RoZXJ3aXNlIHVucmVsYXRlZCBmcm9tIGEgVFMgcGVyc3BlY3RpdmUgYW5kIGRvIG5vdCByZXN1bHQgaW4gSXZ5IGNvZGVnZW4gY2hhbmdlcy5cbiAgICAgIC8vIEZvciBleGFtcGxlLCBjaGFuZ2luZyBASW5wdXQgcHJvcGVydHkgdHlwZXMgb2YgYSBkaXJlY3RpdmUgdXNlZCBpbiBhbm90aGVyIGNvbXBvbmVudCdzXG4gICAgICAvLyB0ZW1wbGF0ZS5cbiAgICAgIC8vIEEgVFRDIHNoaW0gaXMgYSBmaWxlIHRoYXQgaGFzIGJlZW4gaWdub3JlZCBmb3IgZGlhZ25vc3RpY3MgYW5kIGhhcyBhIGZpbGVuYW1lIGVuZGluZyBpbiBgLm5ndHlwZWNoZWNrLnRzYC5cbiAgICAgIGlmIChpZ25vcmVGb3JEaWFnbm9zdGljcy5oYXMoc291cmNlRmlsZSkgJiYgc291cmNlRmlsZS5maWxlTmFtZS5lbmRzV2l0aCgnLm5ndHlwZWNoZWNrLnRzJykpIHtcbiAgICAgICAgLy8gVGhpcyBmaWxlIG5hbWUgY29udmVyc2lvbiByZWxpZXMgb24gaW50ZXJuYWwgY29tcGlsZXIgbG9naWMgYW5kIHNob3VsZCBiZSBjb252ZXJ0ZWRcbiAgICAgICAgLy8gdG8gYW4gb2ZmaWNpYWwgbWV0aG9kIHdoZW4gYXZhaWxhYmxlLiAxNSBpcyBsZW5ndGggb2YgYC5uZ3R5cGVjaGVjay50c2BcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxGaWxlbmFtZSA9IHNvdXJjZUZpbGUuZmlsZU5hbWUuc2xpY2UoMCwgLTE1KSArICcudHMnO1xuICAgICAgICBjb25zdCBvcmlnaW5hbFNvdXJjZUZpbGUgPSBidWlsZGVyLmdldFNvdXJjZUZpbGUob3JpZ2luYWxGaWxlbmFtZSk7XG4gICAgICAgIGlmIChvcmlnaW5hbFNvdXJjZUZpbGUpIHtcbiAgICAgICAgICBhZmZlY3RlZEZpbGVzLmFkZChvcmlnaW5hbFNvdXJjZUZpbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgIGlmICghcmVzdWx0KSB7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBhZmZlY3RlZEZpbGVzLmFkZChyZXN1bHQuYWZmZWN0ZWQgYXMgdHMuU291cmNlRmlsZSk7XG4gIH1cblxuICAvLyBBIGZpbGUgaXMgYWxzbyBhZmZlY3RlZCBpZiB0aGUgQW5ndWxhciBjb21waWxlciByZXF1aXJlcyBpdCB0byBiZSBlbWl0dGVkXG4gIGZvciAoY29uc3Qgc291cmNlRmlsZSBvZiBidWlsZGVyLmdldFNvdXJjZUZpbGVzKCkpIHtcbiAgICBpZiAoaWdub3JlRm9yRW1pdC5oYXMoc291cmNlRmlsZSkgfHwgaW5jcmVtZW50YWxDb21waWxhdGlvbi5zYWZlVG9Ta2lwRW1pdChzb3VyY2VGaWxlKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgYWZmZWN0ZWRGaWxlcy5hZGQoc291cmNlRmlsZSk7XG4gIH1cblxuICByZXR1cm4gYWZmZWN0ZWRGaWxlcztcbn1cbiJdfQ==