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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptPathsPlugin = void 0;
const path = __importStar(require("path"));
class TypeScriptPathsPlugin {
    constructor(options) {
        if (options) {
            this.update(options);
        }
    }
    /**
     * Update the plugin with new path mapping option values.
     * The options will also be preprocessed to reduce the overhead of individual resolve actions
     * during a build.
     *
     * @param options The `paths` and `baseUrl` options from TypeScript's `CompilerOptions`.
     */
    update(options) {
        var _a, _b;
        this.baseUrl = options.baseUrl;
        this.patterns = undefined;
        if (options.paths) {
            for (const [pattern, potentials] of Object.entries(options.paths)) {
                // Ignore any entries that would not result in a new mapping
                if (potentials.length === 0 || potentials.every((potential) => potential === '*')) {
                    continue;
                }
                const starIndex = pattern.indexOf('*');
                let prefix = pattern;
                let suffix;
                if (starIndex > -1) {
                    prefix = pattern.slice(0, starIndex);
                    if (starIndex < pattern.length - 1) {
                        suffix = pattern.slice(starIndex + 1);
                    }
                }
                (_a = this.patterns) !== null && _a !== void 0 ? _a : (this.patterns = []);
                this.patterns.push({
                    starIndex,
                    prefix,
                    suffix,
                    potentials: potentials.map((potential) => {
                        const potentialStarIndex = potential.indexOf('*');
                        if (potentialStarIndex === -1) {
                            return { hasStar: false, prefix: potential };
                        }
                        return {
                            hasStar: true,
                            prefix: potential.slice(0, potentialStarIndex),
                            suffix: potentialStarIndex < potential.length - 1
                                ? potential.slice(potentialStarIndex + 1)
                                : undefined,
                        };
                    }),
                });
            }
            // Sort patterns so that exact matches take priority then largest prefix match
            (_b = this.patterns) === null || _b === void 0 ? void 0 : _b.sort((a, b) => {
                if (a.starIndex === -1) {
                    return -1;
                }
                else if (b.starIndex === -1) {
                    return 1;
                }
                else {
                    return b.starIndex - a.starIndex;
                }
            });
        }
    }
    apply(resolver) {
        const target = resolver.ensureHook('resolve');
        // To support synchronous resolvers this hook cannot be promise based.
        // Webpack supports synchronous resolution with `tap` and `tapAsync` hooks.
        resolver
            .getHook('described-resolve')
            .tapAsync('TypeScriptPathsPlugin', (request, resolveContext, callback) => {
            var _a, _b;
            // Preprocessing of the options will ensure that `patterns` is either undefined or has elements to check
            if (!this.patterns) {
                callback();
                return;
            }
            if (!request || request.typescriptPathMapped) {
                callback();
                return;
            }
            const originalRequest = request.request || request.path;
            if (!originalRequest) {
                callback();
                return;
            }
            // Only work on Javascript/TypeScript issuers.
            if (!((_b = (_a = request === null || request === void 0 ? void 0 : request.context) === null || _a === void 0 ? void 0 : _a.issuer) === null || _b === void 0 ? void 0 : _b.match(/\.[cm]?[jt]sx?$/))) {
                callback();
                return;
            }
            switch (originalRequest[0]) {
                case '.':
                case '/':
                    // Relative or absolute requests are not mapped
                    callback();
                    return;
                case '!':
                    // Ignore all webpack special requests
                    if (originalRequest.length > 1 && originalRequest[1] === '!') {
                        callback();
                        return;
                    }
                    break;
            }
            // A generator is used to limit the amount of replacements requests that need to be created.
            // For example, if the first one resolves, any others are not needed and do not need
            // to be created.
            const requests = this.createReplacementRequests(request, originalRequest);
            const tryResolve = () => {
                const next = requests.next();
                if (next.done) {
                    callback();
                    return;
                }
                resolver.doResolve(target, next.value, '', resolveContext, (error, result) => {
                    if (error) {
                        callback(error);
                    }
                    else if (result) {
                        callback(undefined, result);
                    }
                    else {
                        tryResolve();
                    }
                });
            };
            tryResolve();
        });
    }
    *findReplacements(originalRequest) {
        if (!this.patterns) {
            return;
        }
        // check if any path mapping rules are relevant
        for (const { starIndex, prefix, suffix, potentials } of this.patterns) {
            let partial;
            if (starIndex === -1) {
                // No star means an exact match is required
                if (prefix === originalRequest) {
                    partial = '';
                }
            }
            else if (starIndex === 0 && !suffix) {
                // Everything matches a single wildcard pattern ("*")
                partial = originalRequest;
            }
            else if (!suffix) {
                // No suffix means the star is at the end of the pattern
                if (originalRequest.startsWith(prefix)) {
                    partial = originalRequest.slice(prefix.length);
                }
            }
            else {
                // Star was in the middle of the pattern
                if (originalRequest.startsWith(prefix) && originalRequest.endsWith(suffix)) {
                    partial = originalRequest.substring(prefix.length, originalRequest.length - suffix.length);
                }
            }
            // If request was not matched, move on to the next pattern
            if (partial === undefined) {
                continue;
            }
            // Create the full replacement values based on the original request and the potentials
            // for the successfully matched pattern.
            for (const { hasStar, prefix, suffix } of potentials) {
                let replacement = prefix;
                if (hasStar) {
                    replacement += partial;
                    if (suffix) {
                        replacement += suffix;
                    }
                }
                yield replacement;
            }
        }
    }
    *createReplacementRequests(request, originalRequest) {
        var _a;
        for (const replacement of this.findReplacements(originalRequest)) {
            const targetPath = path.resolve((_a = this.baseUrl) !== null && _a !== void 0 ? _a : '', replacement);
            // Resolution in the original callee location, but with the updated request
            // to point to the mapped target location.
            yield {
                ...request,
                request: targetPath,
                typescriptPathMapped: true,
            };
            // If there is no extension. i.e. the target does not refer to an explicit
            // file, then this is a candidate for module/package resolution.
            const canBeModule = path.extname(targetPath) === '';
            if (canBeModule) {
                // Resolution in the target location, preserving the original request.
                // This will work with the `resolve-in-package` resolution hook, supporting
                // package exports for e.g. locally-built APF libraries.
                yield {
                    ...request,
                    path: targetPath,
                    typescriptPathMapped: true,
                };
            }
        }
    }
}
exports.TypeScriptPathsPlugin = TypeScriptPathsPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aHMtcGx1Z2luLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvbmd0b29scy93ZWJwYWNrL3NyYy9wYXRocy1wbHVnaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCwyQ0FBNkI7QUF3QjdCLE1BQWEscUJBQXFCO0lBSWhDLFlBQVksT0FBc0M7UUFDaEQsSUFBSSxPQUFPLEVBQUU7WUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3RCO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILE1BQU0sQ0FBQyxPQUFxQzs7UUFDMUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1FBRTFCLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtZQUNqQixLQUFLLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ2pFLDREQUE0RDtnQkFDNUQsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTLEtBQUssR0FBRyxDQUFDLEVBQUU7b0JBQ2pGLFNBQVM7aUJBQ1Y7Z0JBRUQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDO2dCQUNyQixJQUFJLE1BQU0sQ0FBQztnQkFDWCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDbEIsTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFF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SUFBSSxVQUFVLEVBQUU7Z0JBQ3BELElBQUksV0FBVyxHQUFHLE1BQU0sQ0FBQztnQkFFekIsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsV0FBVyxJQUFJLE9BQU8sQ0FBQztvQkFDdkIsSUFBSSxNQUFNLEVBQUU7d0JBQ1YsV0FBVyxJQUFJLE1BQU0sQ0FBQztxQkFDdkI7aUJBQ0Y7Z0JBRUQsTUFBTSxXQUFXLENBQUM7YUFDbkI7U0FDRjtJQUNILENBQUM7SUFFRCxDQUFDLHlCQUF5QixDQUN4QixPQUFrQyxFQUNsQyxlQUF1Qjs7UUFFdkIsS0FBSyxNQUFNLFdBQVcsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDaEUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFBLElBQUksQ0FBQyxPQUFPLG1DQUFJLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNqRSwyRUFBMkU7WUFDM0UsMENBQTBDO1lBQzFDLE1BQU07Z0JBQ0osR0FBRyxPQUFPO2dCQUNWLE9BQU8sRUFBRSxVQUFVO2dCQUNuQixvQkFBb0IsRUFBRSxJQUFJO2FBQzNCLENBQUM7WUFFRiwwRUFBMEU7WUFDMUUsZ0VBQWdFO1lBQ2hFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BELElBQUksV0FBVyxFQUFFO2dCQUNmLHNFQUFzRTtnQkFDdEUsMkVBQTJFO2dCQUMzRSx3REFBd0Q7Z0JBQ3hELE1BQU07b0JBQ0osR0FBRyxPQUFPO29CQUNWLElBQUksRUFBRSxVQUFVO29CQUNoQixvQkFBb0IsRUFBRSxJQUFJO2lCQUMzQixDQUFDO2FBQ0g7U0FDRjtJQUNILENBQUM7Q0FDRjtBQXRQRCxzREFzUEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IENvbXBpbGVyT3B0aW9ucyB9IGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHR5cGUgeyBSZXNvbHZlciB9IGZyb20gJ3dlYnBhY2snO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWludGVyZmFjZVxuZXhwb3J0IGludGVyZmFjZSBUeXBlU2NyaXB0UGF0aHNQbHVnaW5PcHRpb25zIGV4dGVuZHMgUGljazxDb21waWxlck9wdGlvbnMsICdwYXRocycgfCAnYmFzZVVybCc+IHt9XG5cbi8vIEV4dHJhY3QgUmVzb2x2ZXJSZXF1ZXN0IHR5cGUgZnJvbSBXZWJwYWNrIHR5cGVzIHNpbmNlIGl0IGlzIG5vdCBkaXJlY3RseSBleHBvcnRlZFxudHlwZSBSZXNvbHZlclJlcXVlc3QgPSBOb25OdWxsYWJsZTxQYXJhbWV0ZXJzPFBhcmFtZXRlcnM8UmVzb2x2ZXJbJ3Jlc29sdmUnXT5bNF0+WzJdPjtcblxuaW50ZXJmYWNlIFBhdGhQbHVnaW5SZXNvbHZlclJlcXVlc3QgZXh0ZW5kcyBSZXNvbHZlclJlcXVlc3Qge1xuICBjb250ZXh0Pzoge1xuICAgIGlzc3Vlcj86IHN0cmluZztcbiAgfTtcbiAgdHlwZXNjcmlwdFBhdGhNYXBwZWQ/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgUGF0aFBhdHRlcm4ge1xuICBzdGFySW5kZXg6IG51bWJlcjtcbiAgcHJlZml4OiBzdHJpbmc7XG4gIHN1ZmZpeD86IHN0cmluZztcbiAgcG90ZW50aWFsczogeyBoYXNTdGFyOiBib29sZWFuOyBwcmVmaXg6IHN0cmluZzsgc3VmZml4Pzogc3RyaW5nIH1bXTtcbn1cblxuZXhwb3J0IGNsYXNzIFR5cGVTY3JpcHRQYXRoc1BsdWdpbiB7XG4gIHByaXZhdGUgYmFzZVVybD86IHN0cmluZztcbiAgcHJpdmF0ZSBwYXR0ZXJucz86IFBhdGhQYXR0ZXJuW107XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IFR5cGVTY3JpcHRQYXRoc1BsdWdpbk9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgdGhpcy51cGRhdGUob3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgcGx1Z2luIHdpdGggbmV3IHBhdGggbWFwcGluZyBvcHRpb24gdmFsdWVzLlxuICAgKiBUaGUgb3B0aW9ucyB3aWxsIGFsc28gYmUgcHJlcHJvY2Vzc2VkIHRvIHJlZHVjZSB0aGUgb3ZlcmhlYWQgb2YgaW5kaXZpZHVhbCByZXNvbHZlIGFjdGlvbnNcbiAgICogZHVyaW5nIGEgYnVpbGQuXG4gICAqXG4gICAqIEBwYXJhbSBvcHRpb25zIFRoZSBgcGF0aHNgIGFuZCBgYmFzZVVybGAgb3B0aW9ucyBmcm9tIFR5cGVTY3JpcHQncyBgQ29tcGlsZXJPcHRpb25zYC5cbiAgICovXG4gIHVwZGF0ZShvcHRpb25zOiBUeXBlU2NyaXB0UGF0aHNQbHVnaW5PcHRpb25zKTogdm9pZCB7XG4gICAgdGhpcy5iYXNlVXJsID0gb3B0aW9ucy5iYXNlVXJsO1xuICAgIHRoaXMucGF0dGVybnMgPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAob3B0aW9ucy5wYXRocykge1xuICAgICAgZm9yIChjb25zdCBbcGF0dGVybiwgcG90ZW50aWFsc10gb2YgT2JqZWN0LmVudHJpZXMob3B0aW9ucy5wYXRocykpIHtcbiAgICAgICAgLy8gSWdub3JlIGFueSBlbnRyaWVzIHRoYXQgd291bGQgbm90IHJlc3VsdCBpbiBhIG5ldyBtYXBwaW5nXG4gICAgICAgIGlmIChwb3RlbnRpYWxzLmxlbmd0aCA9PT0gMCB8fCBwb3RlbnRpYWxzLmV2ZXJ5KChwb3RlbnRpYWwpID0+IHBvdGVudGlhbCA9PT0gJyonKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3RhckluZGV4ID0gcGF0dGVybi5pbmRleE9mKCcqJyk7XG4gICAgICAgIGxldCBwcmVmaXggPSBwYXR0ZXJuO1xuICAgICAgICBsZXQgc3VmZml4O1xuICAgICAgICBpZiAoc3RhckluZGV4ID4gLTEpIHtcbiAgICAgICAgICBwcmVmaXggPSBwYXR0ZXJuLnNsaWNlKDAsIHN0YXJJbmRleCk7XG4gICAgICAgICAgaWYgKHN0YXJJbmRleCA8IHBhdHRlcm4ubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgc3VmZml4ID0gcGF0dGVybi5zbGljZShzdGFySW5kZXggKyAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBhdHRlcm5zID8/PSBbXTtcbiAgICAgICAgdGhpcy5wYXR0ZXJucy5wdXNoKHtcbiAgICAgICAgICBzdGFySW5kZXgsXG4gICAgICAgICAgcHJlZml4LFxuICAgICAgICAgIHN1ZmZpeCxcbiAgICAgICAgICBwb3RlbnRpYWxzOiBwb3RlbnRpYWxzLm1hcCgocG90ZW50aWFsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3RlbnRpYWxTdGFySW5kZXggPSBwb3RlbnRpYWwuaW5kZXhPZignKicpO1xuICAgICAgICAgICAgaWYgKHBvdGVudGlhbFN0YXJJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgaGFzU3RhcjogZmFsc2UsIHByZWZpeDogcG90ZW50aWFsIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGhhc1N0YXI6IHRydWUsXG4gICAgICAgICAgICAgIHByZWZpeDogcG90ZW50aWFsLnNsaWNlKDAsIHBvdGVudGlhbFN0YXJJbmRleCksXG4gICAgICAgICAgICAgIHN1ZmZpeDpcbiAgICAgICAgICAgICAgICBwb3RlbnRpYWxTdGFySW5kZXggPCBwb3RlbnRpYWwubGVuZ3RoIC0gMVxuICAgICAgICAgICAgICAgICAgPyBwb3RlbnRpYWwuc2xpY2UocG90ZW50aWFsU3RhckluZGV4ICsgMSlcbiAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNvcnQgcGF0dGVybnMgc28gdGhhdCBleGFjdCBtYXRjaGVzIHRha2UgcHJpb3JpdHkgdGhlbiBsYXJnZXN0IHByZWZpeCBtYXRjaFxuICAgICAgdGhpcy5wYXR0ZXJucz8uc29ydCgoYSwgYikgPT4ge1xuICAgICAgICBpZiAoYS5zdGFySW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9IGVsc2UgaWYgKGIuc3RhckluZGV4ID09PSAtMSkge1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBiLnN0YXJJbmRleCAtIGEuc3RhckluZGV4O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBhcHBseShyZXNvbHZlcjogUmVzb2x2ZXIpOiB2b2lkIHtcbiAgICBjb25zdCB0YXJnZXQgPSByZXNvbHZlci5lbnN1cmVIb29rKCdyZXNvbHZlJyk7XG5cbiAgICAvLyBUbyBzdXBwb3J0IHN5bmNocm9ub3VzIHJlc29sdmVycyB0aGlzIGhvb2sgY2Fubm90IGJlIHByb21pc2UgYmFzZWQuXG4gICAgLy8gV2VicGFjayBzdXBwb3J0cyBzeW5jaHJvbm91cyByZXNvbHV0aW9uIHdpdGggYHRhcGAgYW5kIGB0YXBBc3luY2AgaG9va3MuXG4gICAgcmVzb2x2ZXJcbiAgICAgIC5nZXRIb29rKCdkZXNjcmliZWQtcmVzb2x2ZScpXG4gICAgICAudGFwQXN5bmMoXG4gICAgICAgICdUeXBlU2NyaXB0UGF0aHNQbHVnaW4nLFxuICAgICAgICAocmVxdWVzdDogUGF0aFBsdWdpblJlc29sdmVyUmVxdWVzdCwgcmVzb2x2ZUNvbnRleHQsIGNhbGxiYWNrKSA9PiB7XG4gICAgICAgICAgLy8gUHJlcHJvY2Vzc2luZyBvZiB0aGUgb3B0aW9ucyB3aWxsIGVuc3VyZSB0aGF0IGBwYXR0ZXJuc2AgaXMgZWl0aGVyIHVuZGVmaW5lZCBvciBoYXMgZWxlbWVudHMgdG8gY2hlY2tcbiAgICAgICAgICBpZiAoIXRoaXMucGF0dGVybnMpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC50eXBlc2NyaXB0UGF0aE1hcHBlZCkge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsUmVxdWVzdCA9IHJlcXVlc3QucmVxdWVzdCB8fCByZXF1ZXN0LnBhdGg7XG4gICAgICAgICAgaWYgKCFvcmlnaW5hbFJlcXVlc3QpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBPbmx5IHdvcmsgb24gSmF2YXNjcmlwdC9UeXBlU2NyaXB0IGlzc3VlcnMuXG4gICAgICAgICAgaWYgKCFyZXF1ZXN0Py5jb250ZXh0Py5pc3N1ZXI/Lm1hdGNoKC9cXC5bY21dP1tqdF1zeD8kLykpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzd2l0Y2ggKG9yaWdpbmFsUmVxdWVzdFswXSkge1xuICAgICAgICAgICAgY2FzZSAnLic6XG4gICAgICAgICAgICBjYXNlICcvJzpcbiAgICAgICAgICAgICAgLy8gUmVsYXRpdmUgb3IgYWJzb2x1dGUgcmVxdWVzdHMgYXJlIG5vdCBtYXBwZWRcbiAgICAgICAgICAgICAgY2FsbGJhY2soKTtcblxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICBjYXNlICchJzpcbiAgICAgICAgICAgICAgLy8gSWdub3JlIGFsbCB3ZWJwYWNrIHNwZWNpYWwgcmVxdWVzdHNcbiAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsUmVxdWVzdC5sZW5ndGggPiAxICYmIG9yaWdpbmFsUmVxdWVzdFsxXSA9PT0gJyEnKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBBIGdlbmVyYXRvciBpcyB1c2VkIHRvIGxpbWl0IHRoZSBhbW91bnQgb2YgcmVwbGFjZW1lbnRzIHJlcXVlc3RzIHRoYXQgbmVlZCB0byBiZSBjcmVhdGVkLlxuICAgICAgICAgIC8vIEZvciBleGFtcGxlLCBpZiB0aGUgZmlyc3Qgb25lIHJlc29sdmVzLCBhbnkgb3RoZXJzIGFyZSBub3QgbmVlZGVkIGFuZCBkbyBub3QgbmVlZFxuICAgICAgICAgIC8vIHRvIGJlIGNyZWF0ZWQuXG4gICAgICAgICAgY29uc3QgcmVxdWVzdHMgPSB0aGlzLmNyZWF0ZVJlcGxhY2VtZW50UmVxdWVzdHMocmVxdWVzdCwgb3JpZ2luYWxSZXF1ZXN0KTtcblxuICAgICAgICAgIGNvbnN0IHRyeVJlc29sdmUgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXh0ID0gcmVxdWVzdHMubmV4dCgpO1xuICAgICAgICAgICAgaWYgKG5leHQuZG9uZSkge1xuICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuXG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzb2x2ZXIuZG9SZXNvbHZlKFxuICAgICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICAgIG5leHQudmFsdWUsXG4gICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICByZXNvbHZlQ29udGV4dCxcbiAgICAgICAgICAgICAgKGVycm9yOiBFcnJvciB8IG51bGwgfCB1bmRlZmluZWQsIHJlc3VsdDogUmVzb2x2ZXJSZXF1ZXN0IHwgbnVsbCB8IHVuZGVmaW5lZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICBjYWxsYmFjayh1bmRlZmluZWQsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHRyeVJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB0cnlSZXNvbHZlKCk7XG4gICAgICAgIH0sXG4gICAgICApO1xuICB9XG5cbiAgKmZpbmRSZXBsYWNlbWVudHMob3JpZ2luYWxSZXF1ZXN0OiBzdHJpbmcpOiBJdGVyYWJsZUl0ZXJhdG9yPHN0cmluZz4ge1xuICAgIGlmICghdGhpcy5wYXR0ZXJucykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIGFueSBwYXRoIG1hcHBpbmcgcnVsZXMgYXJlIHJlbGV2YW50XG4gICAgZm9yIChjb25zdCB7IHN0YXJJbmRleCwgcHJlZml4LCBzdWZmaXgsIHBvdGVudGlhbHMgfSBvZiB0aGlzLnBhdHRlcm5zKSB7XG4gICAgICBsZXQgcGFydGlhbDtcblxuICAgICAgaWYgKHN0YXJJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgLy8gTm8gc3RhciBtZWFucyBhbiBleGFjdCBtYXRjaCBpcyByZXF1aXJlZFxuICAgICAgICBpZiAocHJlZml4ID09PSBvcmlnaW5hbFJlcXVlc3QpIHtcbiAgICAgICAgICBwYXJ0aWFsID0gJyc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3RhckluZGV4ID09PSAwICYmICFzdWZmaXgpIHtcbiAgICAgICAgLy8gRXZlcnl0aGluZyBtYXRjaGVzIGEgc2luZ2xlIHdpbGRjYXJkIHBhdHRlcm4gKFwiKlwiKVxuICAgICAgICBwYXJ0aWFsID0gb3JpZ2luYWxSZXF1ZXN0O1xuICAgICAgfSBlbHNlIGlmICghc3VmZml4KSB7XG4gICAgICAgIC8vIE5vIHN1ZmZpeCBtZWFucyB0aGUgc3RhciBpcyBhdCB0aGUgZW5kIG9mIHRoZSBwYXR0ZXJuXG4gICAgICAgIGlmIChvcmlnaW5hbFJlcXVlc3Quc3RhcnRzV2l0aChwcmVmaXgpKSB7XG4gICAgICAgICAgcGFydGlhbCA9IG9yaWdpbmFsUmVxdWVzdC5zbGljZShwcmVmaXgubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU3RhciB3YXMgaW4gdGhlIG1pZGRsZSBvZiB0aGUgcGF0dGVyblxuICAgICAgICBpZiAob3JpZ2luYWxSZXF1ZXN0LnN0YXJ0c1dpdGgocHJlZml4KSAmJiBvcmlnaW5hbFJlcXVlc3QuZW5kc1dpdGgoc3VmZml4KSkge1xuICAgICAgICAgIHBhcnRpYWwgPSBvcmlnaW5hbFJlcXVlc3Quc3Vic3RyaW5nKFxuICAgICAgICAgICAgcHJlZml4Lmxlbmd0aCxcbiAgICAgICAgICAgIG9yaWdpbmFsUmVxdWVzdC5sZW5ndGggLSBzdWZmaXgubGVuZ3RoLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgcmVxdWVzdCB3YXMgbm90IG1hdGNoZWQsIG1vdmUgb24gdG8gdGhlIG5leHQgcGF0dGVyblxuICAgICAgaWYgKHBhcnRpYWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gQ3JlYXRlIHRoZSBmdWxsIHJlcGxhY2VtZW50IHZhbHVlcyBiYXNlZCBvbiB0aGUgb3JpZ2luYWwgcmVxdWVzdCBhbmQgdGhlIHBvdGVudGlhbHNcbiAgICAgIC8vIGZvciB0aGUgc3VjY2Vzc2Z1bGx5IG1hdGNoZWQgcGF0dGVybi5cbiAgICAgIGZvciAoY29uc3QgeyBoYXNTdGFyLCBwcmVmaXgsIHN1ZmZpeCB9IG9mIHBvdGVudGlhbHMpIHtcbiAgICAgICAgbGV0IHJlcGxhY2VtZW50ID0gcHJlZml4O1xuXG4gICAgICAgIGlmIChoYXNTdGFyKSB7XG4gICAgICAgICAgcmVwbGFjZW1lbnQgKz0gcGFydGlhbDtcbiAgICAgICAgICBpZiAoc3VmZml4KSB7XG4gICAgICAgICAgICByZXBsYWNlbWVudCArPSBzdWZmaXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgeWllbGQgcmVwbGFjZW1lbnQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgKmNyZWF0ZVJlcGxhY2VtZW50UmVxdWVzdHMoXG4gICAgcmVxdWVzdDogUGF0aFBsdWdpblJlc29sdmVyUmVxdWVzdCxcbiAgICBvcmlnaW5hbFJlcXVlc3Q6IHN0cmluZyxcbiAgKTogSXRlcmFibGVJdGVyYXRvcjxQYXRoUGx1Z2luUmVzb2x2ZXJSZXF1ZXN0PiB7XG4gICAgZm9yIChjb25zdCByZXBsYWNlbWVudCBvZiB0aGlzLmZpbmRSZXBsYWNlbWVudHMob3JpZ2luYWxSZXF1ZXN0KSkge1xuICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IHBhdGgucmVzb2x2ZSh0aGlzLmJhc2VVcmwgPz8gJycsIHJlcGxhY2VtZW50KTtcbiAgICAgIC8vIFJlc29sdXRpb24gaW4gdGhlIG9yaWdpbmFsIGNhbGxlZSBsb2NhdGlvbiwgYnV0IHdpdGggdGhlIHVwZGF0ZWQgcmVxdWVzdFxuICAgICAgLy8gdG8gcG9pbnQgdG8gdGhlIG1hcHBlZCB0YXJnZXQgbG9jYXRpb24uXG4gICAgICB5aWVsZCB7XG4gICAgICAgIC4uLnJlcXVlc3QsXG4gICAgICAgIHJlcXVlc3Q6IHRhcmdldFBhdGgsXG4gICAgICAgIHR5cGVzY3JpcHRQYXRoTWFwcGVkOiB0cnVlLFxuICAgICAgfTtcblxuICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gZXh0ZW5zaW9uLiBpLmUuIHRoZSB0YXJnZXQgZG9lcyBub3QgcmVmZXIgdG8gYW4gZXhwbGljaXRcbiAgICAgIC8vIGZpbGUsIHRoZW4gdGhpcyBpcyBhIGNhbmRpZGF0ZSBmb3IgbW9kdWxlL3BhY2thZ2UgcmVzb2x1dGlvbi5cbiAgICAgIGNvbnN0IGNhbkJlTW9kdWxlID0gcGF0aC5leHRuYW1lKHRhcmdldFBhdGgpID09PSAnJztcbiAgICAgIGlmIChjYW5CZU1vZHVsZSkge1xuICAgICAgICAvLyBSZXNvbHV0aW9uIGluIHRoZSB0YXJnZXQgbG9jYXRpb24sIHByZXNlcnZpbmcgdGhlIG9yaWdpbmFsIHJlcXVlc3QuXG4gICAgICAgIC8vIFRoaXMgd2lsbCB3b3JrIHdpdGggdGhlIGByZXNvbHZlLWluLXBhY2thZ2VgIHJlc29sdXRpb24gaG9vaywgc3VwcG9ydGluZ1xuICAgICAgICAvLyBwYWNrYWdlIGV4cG9ydHMgZm9yIGUuZy4gbG9jYWxseS1idWlsdCBBUEYgbGlicmFyaWVzLlxuICAgICAgICB5aWVsZCB7XG4gICAgICAgICAgLi4ucmVxdWVzdCxcbiAgICAgICAgICBwYXRoOiB0YXJnZXRQYXRoLFxuICAgICAgICAgIHR5cGVzY3JpcHRQYXRoTWFwcGVkOiB0cnVlLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19