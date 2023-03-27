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
var _JitCompilation_state;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JitCompilation = void 0;
const node_assert_1 = __importDefault(require("node:assert"));
const typescript_1 = __importDefault(require("typescript"));
const angular_compilation_1 = require("../angular-compilation");
const angular_host_1 = require("../angular-host");
const profiling_1 = require("../profiling");
const jit_resource_transformer_1 = require("./jit-resource-transformer");
class JitCompilationState {
    constructor(typeScriptProgram, constructorParametersDownlevelTransform, replaceResourcesTransform) {
        this.typeScriptProgram = typeScriptProgram;
        this.constructorParametersDownlevelTransform = constructorParametersDownlevelTransform;
        this.replaceResourcesTransform = replaceResourcesTransform;
    }
}
class JitCompilation {
    constructor() {
        _JitCompilation_state.set(this, void 0);
    }
    async initialize(rootNames, compilerOptions, hostOptions, configurationDiagnostics) {
        // Dynamically load the Angular compiler CLI package
        const { constructorParametersDownlevelTransform } = await angular_compilation_1.AngularCompilation.loadCompilerCli();
        // Create Angular compiler host
        const host = (0, angular_host_1.createAngularCompilerHost)(compilerOptions, hostOptions);
        // Create the TypeScript Program
        const typeScriptProgram = (0, profiling_1.profileSync)('TS_CREATE_PROGRAM', () => {
            var _a;
            return typescript_1.default.createEmitAndSemanticDiagnosticsBuilderProgram(rootNames, compilerOptions, host, (_a = __classPrivateFieldGet(this, _JitCompilation_state, "f")) === null || _a === void 0 ? void 0 : _a.typeScriptProgram, configurationDiagnostics);
        });
        const affectedFiles = (0, profiling_1.profileSync)('TS_FIND_AFFECTED', () => findAffectedFiles(typeScriptProgram));
        __classPrivateFieldSet(this, _JitCompilation_state, new JitCompilationState(typeScriptProgram, constructorParametersDownlevelTransform(typeScriptProgram.getProgram()), (0, jit_resource_transformer_1.createJitResourceTransformer)(() => typeScriptProgram.getProgram().getTypeChecker())), "f");
        return { affectedFiles };
    }
    *collectDiagnostics() {
        (0, node_assert_1.default)(__classPrivateFieldGet(this, _JitCompilation_state, "f"), 'Compilation must be initialized prior to collecting diagnostics.');
        const { typeScriptProgram } = __classPrivateFieldGet(this, _JitCompilation_state, "f");
        // Collect program level diagnostics
        yield* typeScriptProgram.getConfigFileParsingDiagnostics();
        yield* typeScriptProgram.getOptionsDiagnostics();
        yield* typeScriptProgram.getGlobalDiagnostics();
        yield* (0, profiling_1.profileSync)('NG_DIAGNOSTICS_SYNTACTIC', () => typeScriptProgram.getSyntacticDiagnostics());
        yield* (0, profiling_1.profileSync)('NG_DIAGNOSTICS_SEMANTIC', () => typeScriptProgram.getSemanticDiagnostics());
    }
    createFileEmitter(onAfterEmit) {
        (0, node_assert_1.default)(__classPrivateFieldGet(this, _JitCompilation_state, "f"), 'Compilation must be initialized prior to emitting files.');
        const { typeScriptProgram, constructorParametersDownlevelTransform, replaceResourcesTransform, } = __classPrivateFieldGet(this, _JitCompilation_state, "f");
        const transformers = {
            before: [replaceResourcesTransform, constructorParametersDownlevelTransform],
        };
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
            onAfterEmit === null || onAfterEmit === void 0 ? void 0 : onAfterEmit(sourceFile);
            return { content, dependencies: [] };
        };
    }
}
exports.JitCompilation = JitCompilation;
_JitCompilation_state = new WeakMap();
function findAffectedFiles(builder) {
    const affectedFiles = new Set();
    let result;
    while ((result = builder.getSemanticDiagnosticsOfNextAffectedFile())) {
        affectedFiles.add(result.affected);
    }
    return affectedFiles;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaml0LWNvbXBpbGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYnVpbGRfYW5ndWxhci9zcmMvYnVpbGRlcnMvYnJvd3Nlci1lc2J1aWxkL2FuZ3VsYXIvaml0LWNvbXBpbGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILDhEQUFpQztBQUNqQyw0REFBNEI7QUFDNUIsZ0VBQTREO0FBQzVELGtEQUFnRjtBQUNoRiw0Q0FBMkM7QUFDM0MseUVBQTBFO0FBRTFFLE1BQU0sbUJBQW1CO0lBQ3ZCLFlBQ2tCLGlCQUE4RCxFQUM5RCx1Q0FBNkUsRUFDN0UseUJBQStEO1FBRi9ELHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBNkM7UUFDOUQsNENBQXVDLEdBQXZDLHVDQUF1QyxDQUFzQztRQUM3RSw4QkFBeUIsR0FBekIseUJBQXlCLENBQXNDO0lBQzlFLENBQUM7Q0FDTDtBQVNELE1BQWEsY0FBYztJQUEzQjtRQUNFLHdDQUE2QjtJQXdGL0IsQ0FBQztJQXRGQyxLQUFLLENBQUMsVUFBVSxDQUNkLFNBQW1CLEVBQ25CLGVBQW1DLEVBQ25DLFdBQStCLEVBQy9CLHdCQUEwQztRQUUxQyxvREFBb0Q7UUFDcEQsTUFBTSxFQUFFLHVDQUF1QyxFQUFFLEdBQUcsTUFBTSx3Q0FBa0IsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUUvRiwrQkFBK0I7UUFDL0IsTUFBTSxJQUFJLEdBQUcsSUFBQSx3Q0FBeUIsRUFBQyxlQUFlLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFckUsZ0NBQWdDO1FBQ2hDLE1BQU0saUJBQWlCLEdBQUcsSUFBQSx1QkFBVyxFQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTs7WUFDOUQsT0FBQSxvQkFBRSxDQUFDLDhDQUE4QyxDQUMvQyxTQUFTLEVBQ1QsZUFBZSxFQUNm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TyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsd0NBQXdDLEVBQUUsQ0FBQyxFQUFFO1FBQ3BFLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQXlCLENBQUMsQ0FBQztLQUNyRDtJQUVELE9BQU8sYUFBYSxDQUFDO0FBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdub2RlOmFzc2VydCc7XG5pbXBvcnQgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgeyBBbmd1bGFyQ29tcGlsYXRpb24gfSBmcm9tICcuLi9hbmd1bGFyLWNvbXBpbGF0aW9uJztcbmltcG9ydCB7IEFuZ3VsYXJIb3N0T3B0aW9ucywgY3JlYXRlQW5ndWxhckNvbXBpbGVySG9zdCB9IGZyb20gJy4uL2FuZ3VsYXItaG9zdCc7XG5pbXBvcnQgeyBwcm9maWxlU3luYyB9IGZyb20gJy4uL3Byb2ZpbGluZyc7XG5pbXBvcnQgeyBjcmVhdGVKaXRSZXNvdXJjZVRyYW5zZm9ybWVyIH0gZnJvbSAnLi9qaXQtcmVzb3VyY2UtdHJhbnNmb3JtZXInO1xuXG5jbGFzcyBKaXRDb21waWxhdGlvblN0YXRlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlYWRvbmx5IHR5cGVTY3JpcHRQcm9ncmFtOiB0cy5FbWl0QW5kU2VtYW50aWNEaWFnbm9zdGljc0J1aWxkZXJQcm9ncmFtLFxuICAgIHB1YmxpYyByZWFkb25seSBjb25zdHJ1Y3RvclBhcmFtZXRlcnNEb3dubGV2ZWxUcmFuc2Zvcm06IHRzLlRyYW5zZm9ybWVyRmFjdG9yeTx0cy5Tb3VyY2VGaWxlPixcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmVwbGFjZVJlc291cmNlc1RyYW5zZm9ybTogdHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLlNvdXJjZUZpbGU+LFxuICApIHt9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW1pdEZpbGVSZXN1bHQge1xuICBjb250ZW50Pzogc3RyaW5nO1xuICBtYXA/OiBzdHJpbmc7XG4gIGRlcGVuZGVuY2llczogcmVhZG9ubHkgc3RyaW5nW107XG59XG5leHBvcnQgdHlwZSBGaWxlRW1pdHRlciA9IChmaWxlOiBzdHJpbmcpID0+IFByb21pc2U8RW1pdEZpbGVSZXN1bHQgfCB1bmRlZmluZWQ+O1xuXG5leHBvcnQgY2xhc3MgSml0Q29tcGlsYXRpb24ge1xuICAjc3RhdGU/OiBKaXRDb21waWxhdGlvblN0YXRlO1xuXG4gIGFzeW5jIGluaXRpYWxpemUoXG4gICAgcm9vdE5hbWVzOiBzdHJpbmdbXSxcbiAgICBjb21waWxlck9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucyxcbiAgICBob3N0T3B0aW9uczogQW5ndWxhckhvc3RPcHRpb25zLFxuICAgIGNvbmZpZ3VyYXRpb25EaWFnbm9zdGljcz86IHRzLkRpYWdub3N0aWNbXSxcbiAgKTogUHJvbWlzZTx7IGFmZmVjdGVkRmlsZXM6IFJlYWRvbmx5U2V0PHRzLlNvdXJjZUZpbGU+IH0+IHtcbiAgICAvLyBEeW5hbWljYWxseSBsb2FkIHRoZSBBbmd1bGFyIGNvbXBpbGVyIENMSSBwYWNrYWdlXG4gICAgY29uc3QgeyBjb25zdHJ1Y3RvclBhcmFtZXRlcnNEb3dubGV2ZWxUcmFuc2Zvcm0gfSA9IGF3YWl0IEFuZ3VsYXJDb21waWxhdGlvbi5sb2FkQ29tcGlsZXJDbGkoKTtcblxuICAgIC8vIENyZWF0ZSBBbmd1bGFyIGNvbXBpbGVyIGhvc3RcbiAgICBjb25zdCBob3N0ID0gY3JlYXRlQW5ndWxhckNvbXBpbGVySG9zdChjb21waWxlck9wdGlvbnMsIGhvc3RPcHRpb25zKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgVHlwZVNjcmlwdCBQcm9ncmFtXG4gICAgY29uc3QgdHlwZVNjcmlwdFByb2dyYW0gPSBwcm9maWxlU3luYygnVFNfQ1JFQVRFX1BST0dSQU0nLCAoKSA9PlxuICAgICAgdHMuY3JlYXRlRW1pdEFuZFNlbWFudGljRGlhZ25vc3RpY3NCdWlsZGVyUHJvZ3JhbShcbiAgICAgICAgcm9vdE5hbWVzLFxuICAgICAgICBjb21waWxlck9wdGlvbnMsXG4gICAgICAgIGhvc3QsXG4gICAgICAgIHRoaXMuI3N0YXRlPy50eXBlU2NyaXB0UHJvZ3JhbSxcbiAgICAgICAgY29uZmlndXJhdGlvbkRpYWdub3N0aWNzLFxuICAgICAgKSxcbiAgICApO1xuXG4gICAgY29uc3QgYWZmZWN0ZWRGaWxlcyA9IHByb2ZpbGVTeW5jKCdUU19GSU5EX0FGRkVDVEVEJywgKCkgPT5cbiAgICAgIGZpbmRBZmZlY3RlZEZpbGVzKHR5cGVTY3JpcHRQcm9ncmFtKSxcbiAgICApO1xuXG4gICAgdGhpcy4jc3RhdGUgPSBuZXcgSml0Q29tcGlsYXRpb25TdGF0ZShcbiAgICAgIHR5cGVTY3JpcHRQcm9ncmFtLFxuICAgICAgY29uc3RydWN0b3JQYXJhbWV0ZXJzRG93bmxldmVsVHJhbnNmb3JtKHR5cGVTY3JpcHRQcm9ncmFtLmdldFByb2dyYW0oKSksXG4gICAgICBjcmVhdGVKaXRSZXNvdXJjZVRyYW5zZm9ybWVyKCgpID0+IHR5cGVTY3JpcHRQcm9ncmFtLmdldFByb2dyYW0oKS5nZXRUeXBlQ2hlY2tlcigpKSxcbiAgICApO1xuXG4gICAgcmV0dXJuIHsgYWZmZWN0ZWRGaWxlcyB9O1xuICB9XG5cbiAgKmNvbGxlY3REaWFnbm9zdGljcygpOiBJdGVyYWJsZTx0cy5EaWFnbm9zdGljPiB7XG4gICAgYXNzZXJ0KHRoaXMuI3N0YXRlLCAnQ29tcGlsYXRpb24gbXVzdCBiZSBpbml0aWFsaXplZCBwcmlvciB0byBjb2xsZWN0aW5nIGRpYWdub3N0aWNzLicpO1xuICAgIGNvbnN0IHsgdHlwZVNjcmlwdFByb2dyYW0gfSA9IHRoaXMuI3N0YXRlO1xuXG4gICAgLy8gQ29sbGVjdCBwcm9ncmFtIGxldmVsIGRpYWdub3N0aWNzXG4gICAgeWllbGQqIHR5cGVTY3JpcHRQcm9ncmFtLmdldENvbmZpZ0ZpbGVQYXJzaW5nRGlhZ25vc3RpY3MoKTtcbiAgICB5aWVsZCogdHlwZVNjcmlwdFByb2dyYW0uZ2V0T3B0aW9uc0RpYWdub3N0aWNzKCk7XG4gICAgeWllbGQqIHR5cGVTY3JpcHRQcm9ncmFtLmdldEdsb2JhbERpYWdub3N0aWNzKCk7XG4gICAgeWllbGQqIHByb2ZpbGVTeW5jKCdOR19ESUFHTk9TVElDU19TWU5UQUNUSUMnLCAoKSA9PlxuICAgICAgdHlwZVNjcmlwdFByb2dyYW0uZ2V0U3ludGFjdGljRGlhZ25vc3RpY3MoKSxcbiAgICApO1xuICAgIHlpZWxkKiBwcm9maWxlU3luYygnTkdfRElBR05PU1RJQ1NfU0VNQU5USUMnLCAoKSA9PiB0eXBlU2NyaXB0UHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKCkpO1xuICB9XG5cbiAgY3JlYXRlRmlsZUVtaXR0ZXIob25BZnRlckVtaXQ/OiAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkgPT4gdm9pZCk6IEZpbGVFbWl0dGVyIHtcbiAgICBhc3NlcnQodGhpcy4jc3RhdGUsICdDb21waWxhdGlvbiBtdXN0IGJlIGluaXRpYWxpemVkIHByaW9yIHRvIGVtaXR0aW5nIGZpbGVzLicpO1xuICAgIGNvbnN0IHtcbiAgICAgIHR5cGVTY3JpcHRQcm9ncmFtLFxuICAgICAgY29uc3RydWN0b3JQYXJhbWV0ZXJzRG93bmxldmVsVHJhbnNmb3JtLFxuICAgICAgcmVwbGFjZVJlc291cmNlc1RyYW5zZm9ybSxcbiAgICB9ID0gdGhpcy4jc3RhdGU7XG5cbiAgICBjb25zdCB0cmFuc2Zvcm1lcnMgPSB7XG4gICAgICBiZWZvcmU6IFtyZXBsYWNlUmVzb3VyY2VzVHJhbnNmb3JtLCBjb25zdHJ1Y3RvclBhcmFtZXRlcnNEb3dubGV2ZWxUcmFuc2Zvcm1dLFxuICAgIH07XG5cbiAgICByZXR1cm4gYXN5bmMgKGZpbGU6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3Qgc291cmNlRmlsZSA9IHR5cGVTY3JpcHRQcm9ncmFtLmdldFNvdXJjZUZpbGUoZmlsZSk7XG4gICAgICBpZiAoIXNvdXJjZUZpbGUpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgbGV0IGNvbnRlbnQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICAgIHR5cGVTY3JpcHRQcm9ncmFtLmVtaXQoXG4gICAgICAgIHNvdXJjZUZpbGUsXG4gICAgICAgIChmaWxlbmFtZSwgZGF0YSkgPT4ge1xuICAgICAgICAgIGlmICgvXFwuW2NtXT9qcyQvLnRlc3QoZmlsZW5hbWUpKSB7XG4gICAgICAgICAgICBjb250ZW50ID0gZGF0YTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVuZGVmaW5lZCAvKiBjYW5jZWxsYXRpb25Ub2tlbiAqLyxcbiAgICAgICAgdW5kZWZpbmVkIC8qIGVtaXRPbmx5RHRzRmlsZXMgKi8sXG4gICAgICAgIHRyYW5zZm9ybWVycyxcbiAgICAgICk7XG5cbiAgICAgIG9uQWZ0ZXJFbWl0Py4oc291cmNlRmlsZSk7XG5cbiAgICAgIHJldHVybiB7IGNvbnRlbnQsIGRlcGVuZGVuY2llczogW10gfTtcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRBZmZlY3RlZEZpbGVzKFxuICBidWlsZGVyOiB0cy5FbWl0QW5kU2VtYW50aWNEaWFnbm9zdGljc0J1aWxkZXJQcm9ncmFtLFxuKTogU2V0PHRzLlNvdXJjZUZpbGU+IHtcbiAgY29uc3QgYWZmZWN0ZWRGaWxlcyA9IG5ldyBTZXQ8dHMuU291cmNlRmlsZT4oKTtcblxuICBsZXQgcmVzdWx0O1xuICB3aGlsZSAoKHJlc3VsdCA9IGJ1aWxkZXIuZ2V0U2VtYW50aWNEaWFnbm9zdGljc09mTmV4dEFmZmVjdGVkRmlsZSgpKSkge1xuICAgIGFmZmVjdGVkRmlsZXMuYWRkKHJlc3VsdC5hZmZlY3RlZCBhcyB0cy5Tb3VyY2VGaWxlKTtcbiAgfVxuXG4gIHJldHVybiBhZmZlY3RlZEZpbGVzO1xufVxuIl19