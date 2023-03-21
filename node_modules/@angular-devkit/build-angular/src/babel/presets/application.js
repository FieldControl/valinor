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
const assert_1 = require("assert");
const browserslist_1 = __importDefault(require("browserslist"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * List of browsers which are affected by a WebKit bug where class field
 * initializers might have incorrect variable scopes.
 *
 * See: https://github.com/angular/angular-cli/issues/24355#issuecomment-1333477033
 * See: https://github.com/WebKit/WebKit/commit/e8788a34b3d5f5b4edd7ff6450b80936bff396f2
 */
const safariClassFieldScopeBugBrowsers = new Set((0, browserslist_1.default)([
    // Safari <15 is technically not supported via https://angular.io/guide/browser-support,
    // but we apply the workaround if forcibly selected.
    'Safari <=15',
    'iOS <=15',
]));
function createI18nDiagnostics(reporter) {
    const diagnostics = new (class {
        constructor() {
            this.messages = [];
            this.hasErrors = false;
        }
        add(type, message) {
            if (type === 'ignore') {
                return;
            }
            this.messages.push({ type, message });
            this.hasErrors || (this.hasErrors = type === 'error');
            reporter === null || reporter === void 0 ? void 0 : reporter(type, message);
        }
        error(message) {
            this.add('error', message);
        }
        warn(message) {
            this.add('warning', message);
        }
        merge(other) {
            for (const diagnostic of other.messages) {
                this.add(diagnostic.type, diagnostic.message);
            }
        }
        formatDiagnostics() {
            assert_1.strict.fail('@angular/localize Diagnostics formatDiagnostics should not be called from within babel.');
        }
    })();
    return diagnostics;
}
function createI18nPlugins(locale, translation, missingTranslationBehavior, diagnosticReporter, pluginCreators) {
    const diagnostics = createI18nDiagnostics(diagnosticReporter);
    const plugins = [];
    const { makeEs2015TranslatePlugin, makeLocalePlugin } = pluginCreators;
    if (translation) {
        plugins.push(makeEs2015TranslatePlugin(diagnostics, translation, {
            missingTranslation: missingTranslationBehavior,
        }));
    }
    plugins.push(makeLocalePlugin(locale));
    return plugins;
}
function createNgtscLogger(reporter) {
    return {
        level: 1,
        debug(...args) { },
        info(...args) {
            reporter === null || reporter === void 0 ? void 0 : reporter('info', args.join());
        },
        warn(...args) {
            reporter === null || reporter === void 0 ? void 0 : reporter('warning', args.join());
        },
        error(...args) {
            reporter === null || reporter === void 0 ? void 0 : reporter('error', args.join());
        },
    };
}
function default_1(api, options) {
    var _a, _b;
    const presets = [];
    const plugins = [];
    let needRuntimeTransform = false;
    if ((_a = options.angularLinker) === null || _a === void 0 ? void 0 : _a.shouldLink) {
        plugins.push(options.angularLinker.linkerPluginCreator({
            linkerJitMode: options.angularLinker.jitMode,
            // This is a workaround until https://github.com/angular/angular/issues/42769 is fixed.
            sourceMapping: false,
            logger: createNgtscLogger(options.diagnosticReporter),
            fileSystem: {
                resolve: path.resolve,
                exists: fs.existsSync,
                dirname: path.dirname,
                relative: path.relative,
                readFile: fs.readFileSync,
                // Node.JS types don't overlap the Compiler types.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            },
        }));
    }
    // Applications code ES version can be controlled using TypeScript's `target` option.
    // However, this doesn't effect libraries and hence we use preset-env to downlevel ES features
    // based on the supported browsers in browserslist.
    if (options.supportedBrowsers) {
        const includePlugins = [];
        // If a Safari browser affected by the class field scope bug is selected, we
        // downlevel class properties by ensuring the class properties Babel plugin
        // is always included- regardless of the preset-env targets.
        if (options.supportedBrowsers.some((b) => safariClassFieldScopeBugBrowsers.has(b))) {
            includePlugins.push('@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-private-methods');
        }
        presets.push([
            require('@babel/preset-env').default,
            {
                bugfixes: true,
                modules: false,
                targets: options.supportedBrowsers,
                include: includePlugins,
                exclude: ['transform-typeof-symbol'],
            },
        ]);
        needRuntimeTransform = true;
    }
    if (options.i18n) {
        const { locale, missingTranslationBehavior, pluginCreators, translation } = options.i18n;
        const i18nPlugins = createI18nPlugins(locale, translation, missingTranslationBehavior || 'ignore', options.diagnosticReporter, pluginCreators);
        plugins.push(...i18nPlugins);
    }
    if (options.forceAsyncTransformation) {
        // Always transform async/await to support Zone.js
        plugins.push(require('@babel/plugin-transform-async-to-generator').default, require('@babel/plugin-proposal-async-generator-functions').default);
        needRuntimeTransform = true;
    }
    if (options.optimize) {
        if (options.optimize.pureTopLevel) {
            plugins.push(require('../plugins/pure-toplevel-functions').default);
        }
        plugins.push(require('../plugins/elide-angular-metadata').default, [
            require('../plugins/adjust-typescript-enums').default,
            { loose: options.optimize.looseEnums },
        ], [
            require('../plugins/adjust-static-class-members').default,
            { wrapDecorators: options.optimize.wrapDecorators },
        ]);
    }
    if (options.instrumentCode) {
        plugins.push([
            require('babel-plugin-istanbul').default,
            {
                inputSourceMap: (_b = options.instrumentCode.inputSourceMap) !== null && _b !== void 0 ? _b : false,
                cwd: options.instrumentCode.includedBasePath,
            },
        ]);
    }
    if (needRuntimeTransform) {
        // Babel equivalent to TypeScript's `importHelpers` option
        plugins.push([
            require('@babel/plugin-transform-runtime').default,
            {
                useESModules: true,
                version: require('@babel/runtime/package.json').version,
                absoluteRuntime: path.dirname(require.resolve('@babel/runtime/package.json')),
            },
        ]);
    }
    return { presets, plugins };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9idWlsZF9hbmd1bGFyL3NyYy9iYWJlbC9wcmVzZXRzL2FwcGxpY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFTSCxtQ0FBMEM7QUFDMUMsZ0VBQXdDO0FBQ3hDLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFFN0I7Ozs7OztHQU1HO0FBQ0gsTUFBTSxnQ0FBZ0MsR0FBRyxJQUFJLEdBQUcsQ0FDOUMsSUFBQSxzQkFBWSxFQUFDO0lBQ1gsd0ZBQXdGO0lBQ3hGLG9EQUFvRDtJQUNwRCxhQUFhO0lBQ2IsVUFBVTtDQUNYLENBQUMsQ0FDSCxDQUFDO0FBa0RGLFNBQVMscUJBQXFCLENBQUMsUUFBd0M7SUFDckUsTUFBTSxXQUFXLEdBQWdCLElBQUksQ0FBQztRQUFBO1lBQzNCLGFBQVEsR0FBNEIsRUFBRSxDQUFDO1lBQ2hELGNBQVMsR0FBRyxLQUFLLENBQUM7UUErQnBCLENBQUM7UUE3QkMsR0FBRyxDQUFDLElBQWdDLEVBQUUsT0FBZTtZQUNuRCxJQUFJLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQ3JCLE9BQU87YUFDUjtZQUVELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLFNBQVMsS0FBZCxJQUFJLENBQUMsU0FBUyxHQUFLLElBQUksS0FBSyxPQUFPLEVBQUM7WUFDcEMsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFHLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRUQsS0FBSyxDQUFDLE9BQWU7WUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxD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QyxDQUFDLENBQUMsT0FBTztZQUNsRDtnQkFDRSxZQUFZLEVBQUUsSUFBSTtnQkFDbEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLE9BQU87Z0JBQ3ZELGVBQWUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQzthQUM5RTtTQUNGLENBQUMsQ0FBQztLQUNKO0lBRUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUM5QixDQUFDO0FBckhELDRCQXFIQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgdHlwZSB7IMm1UGFyc2VkVHJhbnNsYXRpb24gfSBmcm9tICdAYW5ndWxhci9sb2NhbGl6ZSc7XG5pbXBvcnQgdHlwZSB7XG4gIERpYWdub3N0aWNIYW5kbGluZ1N0cmF0ZWd5LFxuICBEaWFnbm9zdGljcyxcbiAgbWFrZUVzMjAxNVRyYW5zbGF0ZVBsdWdpbixcbiAgbWFrZUxvY2FsZVBsdWdpbixcbn0gZnJvbSAnQGFuZ3VsYXIvbG9jYWxpemUvdG9vbHMnO1xuaW1wb3J0IHsgc3RyaWN0IGFzIGFzc2VydCB9IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgYnJvd3NlcnNsaXN0IGZyb20gJ2Jyb3dzZXJzbGlzdCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vKipcbiAqIExpc3Qgb2YgYnJvd3NlcnMgd2hpY2ggYXJlIGFmZmVjdGVkIGJ5IGEgV2ViS2l0IGJ1ZyB3aGVyZSBjbGFzcyBmaWVsZFxuICogaW5pdGlhbGl6ZXJzIG1pZ2h0IGhhdmUgaW5jb3JyZWN0IHZhcmlhYmxlIHNjb3Blcy5cbiAqXG4gKiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXItY2xpL2lzc3Vlcy8yNDM1NSNpc3N1ZWNvbW1lbnQtMTMzMzQ3NzAzM1xuICogU2VlOiBodHRwczovL2dpdGh1Yi5jb20vV2ViS2l0L1dlYktpdC9jb21taXQvZTg3ODhhMzRiM2Q1ZjViNGVkZDdmZjY0NTBiODA5MzZiZmYzOTZmMlxuICovXG5jb25zdCBzYWZhcmlDbGFzc0ZpZWxkU2NvcGVCdWdCcm93c2VycyA9IG5ldyBTZXQoXG4gIGJyb3dzZXJzbGlzdChbXG4gICAgLy8gU2FmYXJpIDwxNSBpcyB0ZWNobmljYWxseSBub3Qgc3VwcG9ydGVkIHZpYSBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvYnJvd3Nlci1zdXBwb3J0LFxuICAgIC8vIGJ1dCB3ZSBhcHBseSB0aGUgd29ya2Fyb3VuZCBpZiBmb3JjaWJseSBzZWxlY3RlZC5cbiAgICAnU2FmYXJpIDw9MTUnLFxuICAgICdpT1MgPD0xNScsXG4gIF0pLFxuKTtcblxuZXhwb3J0IHR5cGUgRGlhZ25vc3RpY1JlcG9ydGVyID0gKHR5cGU6ICdlcnJvcicgfCAnd2FybmluZycgfCAnaW5mbycsIG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZDtcblxuLyoqXG4gKiBBbiBpbnRlcmZhY2UgcmVwcmVzZW50aW5nIHRoZSBmYWN0b3J5IGZ1bmN0aW9ucyBmb3IgdGhlIGBAYW5ndWxhci9sb2NhbGl6ZWAgdHJhbnNsYXRpb24gQmFiZWwgcGx1Z2lucy5cbiAqIFRoaXMgbXVzdCBiZSBwcm92aWRlZCBmb3IgdGhlIEVTTSBpbXBvcnRzIHNpbmNlIGR5bmFtaWMgaW1wb3J0cyBhcmUgcmVxdWlyZWQgdG8gYmUgYXN5bmNocm9ub3VzIGFuZFxuICogQmFiZWwgcHJlc2V0cyBjdXJyZW50bHkgY2FuIG9ubHkgYmUgc3luY2hyb25vdXMuXG4gKlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEkxOG5QbHVnaW5DcmVhdG9ycyB7XG4gIG1ha2VFczIwMTVUcmFuc2xhdGVQbHVnaW46IHR5cGVvZiBtYWtlRXMyMDE1VHJhbnNsYXRlUGx1Z2luO1xuICBtYWtlTG9jYWxlUGx1Z2luOiB0eXBlb2YgbWFrZUxvY2FsZVBsdWdpbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBcHBsaWNhdGlvblByZXNldE9wdGlvbnMge1xuICBpMThuPzoge1xuICAgIGxvY2FsZTogc3RyaW5nO1xuICAgIG1pc3NpbmdUcmFuc2xhdGlvbkJlaGF2aW9yPzogJ2Vycm9yJyB8ICd3YXJuaW5nJyB8ICdpZ25vcmUnO1xuICAgIHRyYW5zbGF0aW9uPzogUmVjb3JkPHN0cmluZywgybVQYXJzZWRUcmFuc2xhdGlvbj47XG4gICAgdHJhbnNsYXRpb25GaWxlcz86IHN0cmluZ1tdO1xuICAgIHBsdWdpbkNyZWF0b3JzOiBJMThuUGx1Z2luQ3JlYXRvcnM7XG4gIH07XG5cbiAgYW5ndWxhckxpbmtlcj86IHtcbiAgICBzaG91bGRMaW5rOiBib29sZWFuO1xuICAgIGppdE1vZGU6IGJvb2xlYW47XG4gICAgbGlua2VyUGx1Z2luQ3JlYXRvcjogdHlwZW9mIGltcG9ydCgnQGFuZ3VsYXIvY29tcGlsZXItY2xpL2xpbmtlci9iYWJlbCcpLmNyZWF0ZUVzMjAxNUxpbmtlclBsdWdpbjtcbiAgfTtcblxuICBmb3JjZUFzeW5jVHJhbnNmb3JtYXRpb24/OiBib29sZWFuO1xuICBpbnN0cnVtZW50Q29kZT86IHtcbiAgICBpbmNsdWRlZEJhc2VQYXRoOiBzdHJpbmc7XG4gICAgaW5wdXRTb3VyY2VNYXA6IHVua25vd247XG4gIH07XG4gIG9wdGltaXplPzoge1xuICAgIGxvb3NlRW51bXM6IGJvb2xlYW47XG4gICAgcHVyZVRvcExldmVsOiBib29sZWFuO1xuICAgIHdyYXBEZWNvcmF0b3JzOiBib29sZWFuO1xuICB9O1xuXG4gIHN1cHBvcnRlZEJyb3dzZXJzPzogc3RyaW5nW107XG4gIGRpYWdub3N0aWNSZXBvcnRlcj86IERpYWdub3N0aWNSZXBvcnRlcjtcbn1cblxuLy8gRXh0cmFjdCBMb2dnZXIgdHlwZSBmcm9tIHRoZSBsaW5rZXIgZnVuY3Rpb24gdG8gYXZvaWQgZGVlcCBpbXBvcnRpbmcgdG8gYWNjZXNzIHRoZSB0eXBlXG50eXBlIE5ndHNjTG9nZ2VyID0gUGFyYW1ldGVyczxcbiAgdHlwZW9mIGltcG9ydCgnQGFuZ3VsYXIvY29tcGlsZXItY2xpL2xpbmtlci9iYWJlbCcpLmNyZWF0ZUVzMjAxNUxpbmtlclBsdWdpblxuPlswXVsnbG9nZ2VyJ107XG5cbmZ1bmN0aW9uIGNyZWF0ZUkxOG5EaWFnbm9zdGljcyhyZXBvcnRlcjogRGlhZ25vc3RpY1JlcG9ydGVyIHwgdW5kZWZpbmVkKTogRGlhZ25vc3RpY3Mge1xuICBjb25zdCBkaWFnbm9zdGljczogRGlhZ25vc3RpY3MgPSBuZXcgKGNsYXNzIHtcbiAgICByZWFkb25seSBtZXNzYWdlczogRGlhZ25vc3RpY3NbJ21lc3NhZ2VzJ10gPSBbXTtcbiAgICBoYXNFcnJvcnMgPSBmYWxzZTtcblxuICAgIGFkZCh0eXBlOiBEaWFnbm9zdGljSGFuZGxpbmdTdHJhdGVneSwgbWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICBpZiAodHlwZSA9PT0gJ2lnbm9yZScpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm1lc3NhZ2VzLnB1c2goeyB0eXBlLCBtZXNzYWdlIH0pO1xuICAgICAgdGhpcy5oYXNFcnJvcnMgfHw9IHR5cGUgPT09ICdlcnJvcic7XG4gICAgICByZXBvcnRlcj8uKHR5cGUsIG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGVycm9yKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgICAgdGhpcy5hZGQoJ2Vycm9yJywgbWVzc2FnZSk7XG4gICAgfVxuXG4gICAgd2FybihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgIHRoaXMuYWRkKCd3YXJuaW5nJywgbWVzc2FnZSk7XG4gICAgfVxuXG4gICAgbWVyZ2Uob3RoZXI6IERpYWdub3N0aWNzKTogdm9pZCB7XG4gICAgICBmb3IgKGNvbnN0IGRpYWdub3N0aWMgb2Ygb3RoZXIubWVzc2FnZXMpIHtcbiAgICAgICAgdGhpcy5hZGQoZGlhZ25vc3RpYy50eXBlLCBkaWFnbm9zdGljLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvcm1hdERpYWdub3N0aWNzKCk6IG5ldmVyIHtcbiAgICAgIGFzc2VydC5mYWlsKFxuICAgICAgICAnQGFuZ3VsYXIvbG9jYWxpemUgRGlhZ25vc3RpY3MgZm9ybWF0RGlhZ25vc3RpY3Mgc2hvdWxkIG5vdCBiZSBjYWxsZWQgZnJvbSB3aXRoaW4gYmFiZWwuJyxcbiAgICAgICk7XG4gICAgfVxuICB9KSgpO1xuXG4gIHJldHVybiBkaWFnbm9zdGljcztcbn1cblxuZnVuY3Rpb24gY3JlYXRlSTE4blBsdWdpbnMoXG4gIGxvY2FsZTogc3RyaW5nLFxuICB0cmFuc2xhdGlvbjogUmVjb3JkPHN0cmluZywgybVQYXJzZWRUcmFuc2xhdGlvbj4gfCB1bmRlZmluZWQsXG4gIG1pc3NpbmdUcmFuc2xhdGlvbkJlaGF2aW9yOiAnZXJyb3InIHwgJ3dhcm5pbmcnIHwgJ2lnbm9yZScsXG4gIGRpYWdub3N0aWNSZXBvcnRlcjogRGlhZ25vc3RpY1JlcG9ydGVyIHwgdW5kZWZpbmVkLFxuICBwbHVnaW5DcmVhdG9yczogSTE4blBsdWdpbkNyZWF0b3JzLFxuKSB7XG4gIGNvbnN0IGRpYWdub3N0aWNzID0gY3JlYXRlSTE4bkRpYWdub3N0aWNzKGRpYWdub3N0aWNSZXBvcnRlcik7XG4gIGNvbnN0IHBsdWdpbnMgPSBbXTtcblxuICBjb25zdCB7IG1ha2VFczIwMTVUcmFuc2xhdGVQbHVnaW4sIG1ha2VMb2NhbGVQbHVnaW4gfSA9IHBsdWdpbkNyZWF0b3JzO1xuXG4gIGlmICh0cmFuc2xhdGlvbikge1xuICAgIHBsdWdpbnMucHVzaChcbiAgICAgIG1ha2VFczIwMTVUcmFuc2xhdGVQbHVnaW4oZGlhZ25vc3RpY3MsIHRyYW5zbGF0aW9uLCB7XG4gICAgICAgIG1pc3NpbmdUcmFuc2xhdGlvbjogbWlzc2luZ1RyYW5zbGF0aW9uQmVoYXZpb3IsXG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgcGx1Z2lucy5wdXNoKG1ha2VMb2NhbGVQbHVnaW4obG9jYWxlKSk7XG5cbiAgcmV0dXJuIHBsdWdpbnM7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU5ndHNjTG9nZ2VyKHJlcG9ydGVyOiBEaWFnbm9zdGljUmVwb3J0ZXIgfCB1bmRlZmluZWQpOiBOZ3RzY0xvZ2dlciB7XG4gIHJldHVybiB7XG4gICAgbGV2ZWw6IDEsIC8vIEluZm8gbGV2ZWxcbiAgICBkZWJ1ZyguLi5hcmdzOiBzdHJpbmdbXSkge30sXG4gICAgaW5mbyguLi5hcmdzOiBzdHJpbmdbXSkge1xuICAgICAgcmVwb3J0ZXI/LignaW5mbycsIGFyZ3Muam9pbigpKTtcbiAgICB9LFxuICAgIHdhcm4oLi4uYXJnczogc3RyaW5nW10pIHtcbiAgICAgIHJlcG9ydGVyPy4oJ3dhcm5pbmcnLCBhcmdzLmpvaW4oKSk7XG4gICAgfSxcbiAgICBlcnJvciguLi5hcmdzOiBzdHJpbmdbXSkge1xuICAgICAgcmVwb3J0ZXI/LignZXJyb3InLCBhcmdzLmpvaW4oKSk7XG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGFwaTogdW5rbm93biwgb3B0aW9uczogQXBwbGljYXRpb25QcmVzZXRPcHRpb25zKSB7XG4gIGNvbnN0IHByZXNldHMgPSBbXTtcbiAgY29uc3QgcGx1Z2lucyA9IFtdO1xuICBsZXQgbmVlZFJ1bnRpbWVUcmFuc2Zvcm0gPSBmYWxzZTtcblxuICBpZiAob3B0aW9ucy5hbmd1bGFyTGlua2VyPy5zaG91bGRMaW5rKSB7XG4gICAgcGx1Z2lucy5wdXNoKFxuICAgICAgb3B0aW9ucy5hbmd1bGFyTGlua2VyLmxpbmtlclBsdWdpbkNyZWF0b3Ioe1xuICAgICAgICBsaW5rZXJKaXRNb2RlOiBvcHRpb25zLmFuZ3VsYXJMaW5rZXIuaml0TW9kZSxcbiAgICAgICAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgdW50aWwgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvNDI3NjkgaXMgZml4ZWQuXG4gICAgICAgIHNvdXJjZU1hcHBpbmc6IGZhbHNlLFxuICAgICAgICBsb2dnZXI6IGNyZWF0ZU5ndHNjTG9nZ2VyKG9wdGlvbnMuZGlhZ25vc3RpY1JlcG9ydGVyKSxcbiAgICAgICAgZmlsZVN5c3RlbToge1xuICAgICAgICAgIHJlc29sdmU6IHBhdGgucmVzb2x2ZSxcbiAgICAgICAgICBleGlzdHM6IGZzLmV4aXN0c1N5bmMsXG4gICAgICAgICAgZGlybmFtZTogcGF0aC5kaXJuYW1lLFxuICAgICAgICAgIHJlbGF0aXZlOiBwYXRoLnJlbGF0aXZlLFxuICAgICAgICAgIHJlYWRGaWxlOiBmcy5yZWFkRmlsZVN5bmMsXG4gICAgICAgICAgLy8gTm9kZS5KUyB0eXBlcyBkb24ndCBvdmVybGFwIHRoZSBDb21waWxlciB0eXBlcy5cbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICB9IGFzIGFueSxcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICAvLyBBcHBsaWNhdGlvbnMgY29kZSBFUyB2ZXJzaW9uIGNhbiBiZSBjb250cm9sbGVkIHVzaW5nIFR5cGVTY3JpcHQncyBgdGFyZ2V0YCBvcHRpb24uXG4gIC8vIEhvd2V2ZXIsIHRoaXMgZG9lc24ndCBlZmZlY3QgbGlicmFyaWVzIGFuZCBoZW5jZSB3ZSB1c2UgcHJlc2V0LWVudiB0byBkb3dubGV2ZWwgRVMgZmVhdHVyZXNcbiAgLy8gYmFzZWQgb24gdGhlIHN1cHBvcnRlZCBicm93c2VycyBpbiBicm93c2Vyc2xpc3QuXG4gIGlmIChvcHRpb25zLnN1cHBvcnRlZEJyb3dzZXJzKSB7XG4gICAgY29uc3QgaW5jbHVkZVBsdWdpbnM6IHN0cmluZ1tdID0gW107XG5cbiAgICAvLyBJZiBhIFNhZmFyaSBicm93c2VyIGFmZmVjdGVkIGJ5IHRoZSBjbGFzcyBmaWVsZCBzY29wZSBidWcgaXMgc2VsZWN0ZWQsIHdlXG4gICAgLy8gZG93bmxldmVsIGNsYXNzIHByb3BlcnRpZXMgYnkgZW5zdXJpbmcgdGhlIGNsYXNzIHByb3BlcnRpZXMgQmFiZWwgcGx1Z2luXG4gICAgLy8gaXMgYWx3YXlzIGluY2x1ZGVkLSByZWdhcmRsZXNzIG9mIHRoZSBwcmVzZXQtZW52IHRhcmdldHMuXG4gICAgaWYgKG9wdGlvbnMuc3VwcG9ydGVkQnJvd3NlcnMuc29tZSgoYikgPT4gc2FmYXJpQ2xhc3NGaWVsZFNjb3BlQnVnQnJvd3NlcnMuaGFzKGIpKSkge1xuICAgICAgaW5jbHVkZVBsdWdpbnMucHVzaChcbiAgICAgICAgJ0BiYWJlbC9wbHVnaW4tcHJvcG9zYWwtY2xhc3MtcHJvcGVydGllcycsXG4gICAgICAgICdAYmFiZWwvcGx1Z2luLXByb3Bvc2FsLXByaXZhdGUtbWV0aG9kcycsXG4gICAgICApO1xuICAgIH1cblxuICAgIHByZXNldHMucHVzaChbXG4gICAgICByZXF1aXJlKCdAYmFiZWwvcHJlc2V0LWVudicpLmRlZmF1bHQsXG4gICAgICB7XG4gICAgICAgIGJ1Z2ZpeGVzOiB0cnVlLFxuICAgICAgICBtb2R1bGVzOiBmYWxzZSxcbiAgICAgICAgdGFyZ2V0czogb3B0aW9ucy5zdXBwb3J0ZWRCcm93c2VycyxcbiAgICAgICAgaW5jbHVkZTogaW5jbHVkZVBsdWdpbnMsXG4gICAgICAgIGV4Y2x1ZGU6IFsndHJhbnNmb3JtLXR5cGVvZi1zeW1ib2wnXSxcbiAgICAgIH0sXG4gICAgXSk7XG4gICAgbmVlZFJ1bnRpbWVUcmFuc2Zvcm0gPSB0cnVlO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuaTE4bikge1xuICAgIGNvbnN0IHsgbG9jYWxlLCBtaXNzaW5nVHJhbnNsYXRpb25CZWhhdmlvciwgcGx1Z2luQ3JlYXRvcnMsIHRyYW5zbGF0aW9uIH0gPSBvcHRpb25zLmkxOG47XG4gICAgY29uc3QgaTE4blBsdWdpbnMgPSBjcmVhdGVJMThuUGx1Z2lucyhcbiAgICAgIGxvY2FsZSxcbiAgICAgIHRyYW5zbGF0aW9uLFxuICAgICAgbWlzc2luZ1RyYW5zbGF0aW9uQmVoYXZpb3IgfHwgJ2lnbm9yZScsXG4gICAgICBvcHRpb25zLmRpYWdub3N0aWNSZXBvcnRlcixcbiAgICAgIHBsdWdpbkNyZWF0b3JzLFxuICAgICk7XG5cbiAgICBwbHVnaW5zLnB1c2goLi4uaTE4blBsdWdpbnMpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuZm9yY2VBc3luY1RyYW5zZm9ybWF0aW9uKSB7XG4gICAgLy8gQWx3YXlzIHRyYW5zZm9ybSBhc3luYy9hd2FpdCB0byBzdXBwb3J0IFpvbmUuanNcbiAgICBwbHVnaW5zLnB1c2goXG4gICAgICByZXF1aXJlKCdAYmFiZWwvcGx1Z2luLXRyYW5zZm9ybS1hc3luYy10by1nZW5lcmF0b3InKS5kZWZhdWx0LFxuICAgICAgcmVxdWlyZSgnQGJhYmVsL3BsdWdpbi1wcm9wb3NhbC1hc3luYy1nZW5lcmF0b3ItZnVuY3Rpb25zJykuZGVmYXVsdCxcbiAgICApO1xuICAgIG5lZWRSdW50aW1lVHJhbnNmb3JtID0gdHJ1ZTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLm9wdGltaXplKSB7XG4gICAgaWYgKG9wdGlvbnMub3B0aW1pemUucHVyZVRvcExldmVsKSB7XG4gICAgICBwbHVnaW5zLnB1c2gocmVxdWlyZSgnLi4vcGx1Z2lucy9wdXJlLXRvcGxldmVsLWZ1bmN0aW9ucycpLmRlZmF1bHQpO1xuICAgIH1cblxuICAgIHBsdWdpbnMucHVzaChcbiAgICAgIHJlcXVpcmUoJy4uL3BsdWdpbnMvZWxpZGUtYW5ndWxhci1tZXRhZGF0YScpLmRlZmF1bHQsXG4gICAgICBbXG4gICAgICAgIHJlcXVpcmUoJy4uL3BsdWdpbnMvYWRqdXN0LXR5cGVzY3JpcHQtZW51bXMnKS5kZWZhdWx0LFxuICAgICAgICB7IGxvb3NlOiBvcHRpb25zLm9wdGltaXplLmxvb3NlRW51bXMgfSxcbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIHJlcXVpcmUoJy4uL3BsdWdpbnMvYWRqdXN0LXN0YXRpYy1jbGFzcy1tZW1iZXJzJykuZGVmYXVsdCxcbiAgICAgICAgeyB3cmFwRGVjb3JhdG9yczogb3B0aW9ucy5vcHRpbWl6ZS53cmFwRGVjb3JhdG9ycyB9LFxuICAgICAgXSxcbiAgICApO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMuaW5zdHJ1bWVudENvZGUpIHtcbiAgICBwbHVnaW5zLnB1c2goW1xuICAgICAgcmVxdWlyZSgnYmFiZWwtcGx1Z2luLWlzdGFuYnVsJykuZGVmYXVsdCxcbiAgICAgIHtcbiAgICAgICAgaW5wdXRTb3VyY2VNYXA6IG9wdGlvbnMuaW5zdHJ1bWVudENvZGUuaW5wdXRTb3VyY2VNYXAgPz8gZmFsc2UsXG4gICAgICAgIGN3ZDogb3B0aW9ucy5pbnN0cnVtZW50Q29kZS5pbmNsdWRlZEJhc2VQYXRoLFxuICAgICAgfSxcbiAgICBdKTtcbiAgfVxuXG4gIGlmIChuZWVkUnVudGltZVRyYW5zZm9ybSkge1xuICAgIC8vIEJhYmVsIGVxdWl2YWxlbnQgdG8gVHlwZVNjcmlwdCdzIGBpbXBvcnRIZWxwZXJzYCBvcHRpb25cbiAgICBwbHVnaW5zLnB1c2goW1xuICAgICAgcmVxdWlyZSgnQGJhYmVsL3BsdWdpbi10cmFuc2Zvcm0tcnVudGltZScpLmRlZmF1bHQsXG4gICAgICB7XG4gICAgICAgIHVzZUVTTW9kdWxlczogdHJ1ZSxcbiAgICAgICAgdmVyc2lvbjogcmVxdWlyZSgnQGJhYmVsL3J1bnRpbWUvcGFja2FnZS5qc29uJykudmVyc2lvbixcbiAgICAgICAgYWJzb2x1dGVSdW50aW1lOiBwYXRoLmRpcm5hbWUocmVxdWlyZS5yZXNvbHZlKCdAYmFiZWwvcnVudGltZS9wYWNrYWdlLmpzb24nKSksXG4gICAgICB9LFxuICAgIF0pO1xuICB9XG5cbiAgcmV0dXJuIHsgcHJlc2V0cywgcGx1Z2lucyB9O1xufVxuIl19