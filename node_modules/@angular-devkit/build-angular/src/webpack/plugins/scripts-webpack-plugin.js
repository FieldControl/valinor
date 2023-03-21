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
exports.ScriptsWebpackPlugin = void 0;
const loader_utils_1 = require("loader-utils");
const path = __importStar(require("path"));
const webpack_1 = require("webpack");
const error_1 = require("../../utils/error");
const webpack_diagnostics_1 = require("../../utils/webpack-diagnostics");
const Entrypoint = require('webpack/lib/Entrypoint');
/**
 * The name of the plugin provided to Webpack when tapping Webpack compiler hooks.
 */
const PLUGIN_NAME = 'scripts-webpack-plugin';
function addDependencies(compilation, scripts) {
    for (const script of scripts) {
        compilation.fileDependencies.add(script);
    }
}
class ScriptsWebpackPlugin {
    constructor(options) {
        this.options = options;
    }
    async shouldSkip(compilation, scripts) {
        if (this._lastBuildTime == undefined) {
            this._lastBuildTime = Date.now();
            return false;
        }
        for (const script of scripts) {
            const scriptTime = await new Promise((resolve, reject) => {
                compilation.fileSystemInfo.getFileTimestamp(script, (error, entry) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(entry && typeof entry !== 'string' ? entry.safeTime : undefined);
                });
            });
            if (!scriptTime || scriptTime > this._lastBuildTime) {
                this._lastBuildTime = Date.now();
                return false;
            }
        }
        return true;
    }
    _insertOutput(compilation, { filename, source }, cached = false) {
        const chunk = new webpack_1.Chunk(this.options.name);
        chunk.rendered = !cached;
        chunk.id = this.options.name;
        chunk.ids = [chunk.id];
        chunk.files.add(filename);
        const entrypoint = new Entrypoint(this.options.name);
        entrypoint.pushChunk(chunk);
        chunk.addGroup(entrypoint);
        compilation.entrypoints.set(this.options.name, entrypoint);
        compilation.chunks.add(chunk);
        compilation.assets[filename] = source;
        compilation.hooks.chunkAsset.call(chunk, filename);
    }
    apply(compiler) {
        if (this.options.scripts.length === 0) {
            return;
        }
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            // Use the resolver from the compilation instead of compiler.
            // Using the latter will causes a lot of `DescriptionFileUtils.loadDescriptionFile` calls.
            // See: https://github.com/angular/angular-cli/issues/24634#issuecomment-1425782668
            const resolver = compilation.resolverFactory.get('normal', {
                preferRelative: true,
                useSyncFileSystemCalls: true,
                // Caching must be disabled because it causes the resolver to become async after a rebuild.
                cache: false,
            });
            const scripts = [];
            for (const script of this.options.scripts) {
                try {
                    const resolvedPath = resolver.resolveSync({}, this.options.basePath, script);
                    if (resolvedPath) {
                        scripts.push(resolvedPath);
                    }
                    else {
                        (0, webpack_diagnostics_1.addError)(compilation, `Cannot resolve '${script}'.`);
                    }
                }
                catch (error) {
                    (0, error_1.assertIsError)(error);
                    (0, webpack_diagnostics_1.addError)(compilation, error.message);
                }
            }
            compilation.hooks.additionalAssets.tapPromise(PLUGIN_NAME, async () => {
                if (await this.shouldSkip(compilation, scripts)) {
                    if (this._cachedOutput) {
                        this._insertOutput(compilation, this._cachedOutput, true);
                    }
                    addDependencies(compilation, scripts);
                    return;
                }
                const sourceGetters = scripts.map((fullPath) => {
                    return new Promise((resolve, reject) => {
                        compilation.inputFileSystem.readFile(fullPath, (err, data) => {
                            var _a;
                            if (err) {
                                reject(err);
                                return;
                            }
                            const content = (_a = data === null || data === void 0 ? void 0 : data.toString()) !== null && _a !== void 0 ? _a : '';
                            let source;
                            if (this.options.sourceMap) {
                                // TODO: Look for source map file (for '.min' scripts, etc.)
                                let adjustedPath = fullPath;
                                if (this.options.basePath) {
                                    adjustedPath = path.relative(this.options.basePath, fullPath);
                                }
                                source = new webpack_1.sources.OriginalSource(content, adjustedPath);
                            }
                            else {
                                source = new webpack_1.sources.RawSource(content);
                            }
                            resolve(source);
                        });
                    });
                });
                const sources = await Promise.all(sourceGetters);
                const concatSource = new webpack_1.sources.ConcatSource();
                sources.forEach((source) => {
                    concatSource.add(source);
                    concatSource.add('\n;');
                });
                const combinedSource = new webpack_1.sources.CachedSource(concatSource);
                const output = { filename: this.options.filename, source: combinedSource };
                this._insertOutput(compilation, output);
                this._cachedOutput = output;
                addDependencies(compilation, scripts);
            });
            compilation.hooks.processAssets.tapPromise({
                name: PLUGIN_NAME,
                stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_DEV_TOOLING,
            }, async () => {
                const assetName = this.options.filename;
                const asset = compilation.getAsset(assetName);
                if (asset) {
                    const interpolatedFilename = (0, loader_utils_1.interpolateName)({ resourcePath: 'scripts.js' }, assetName, { content: asset.source.source() });
                    if (assetName !== interpolatedFilename) {
                        compilation.renameAsset(assetName, interpolatedFilename);
                    }
                }
            });
        });
    }
}
exports.ScriptsWebpackPlugin = ScriptsWebpackPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0cy13ZWJwYWNrLXBsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL3dlYnBhY2svcGx1Z2lucy9zY3JpcHRzLXdlYnBhY2stcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsK0NBQStDO0FBQy9DLDJDQUE2QjtBQUM3QixxQ0FBa0Y7QUFDbEYsNkNBQWtEO0FBQ2xELHlFQUEyRDtBQUUzRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUVyRDs7R0FFRztBQUNILE1BQU0sV0FBVyxHQUFHLHdCQUF3QixDQUFDO0FBZTdDLFNBQVMsZUFBZSxDQUFDLFdBQXdCLEVBQUUsT0FBaUI7SUFDbEUsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7UUFDNUIsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMxQztBQUNILENBQUM7QUFFRCxNQUFhLG9CQUFvQjtJQUkvQixZQUFvQixPQUFvQztRQUFwQyxZQUFPLEdBQVAsT0FBTyxDQUE2QjtJQUFHLENBQUM7SUFFNUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUF3QixFQUFFLE9BQWlCO1FBQzFELElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxTQUFTLEVBQUU7WUFDcEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFakMsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO1lBQzVCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxPQUFPLENBQXFCLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUMzRSxX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QU0sRUFBRSxjQUFjLEVBQUUsQ0FBQztnQkFDM0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3hDLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO2dCQUM1QixlQUFlLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsV0FBVyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUN4QztnQkFDRSxJQUFJLEVBQUUsV0FBVztnQkFDakIsS0FBSyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGdDQUFnQzthQUNyRSxFQUNELEtBQUssSUFBSSxFQUFFO2dCQUNULE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO2dCQUN4QyxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLEtBQUssRUFBRTtvQkFDVCxNQUFNLG9CQUFvQixHQUFHLElBQUEsOEJBQWUsRUFDMUMsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLEVBQzlCLFNBQVMsRUFDVCxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ25DLENBQUM7b0JBQ0YsSUFBSSxTQUFTLEtBQUssb0JBQW9CLEVBQUU7d0JBQ3RDLFdBQVcsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQUM7cUJBQzFEO2lCQUNGO1lBQ0gsQ0FBQyxDQUNGLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXhLRCxvREF3S0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgaW50ZXJwb2xhdGVOYW1lIH0gZnJvbSAnbG9hZGVyLXV0aWxzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBDaHVuaywgQ29tcGlsYXRpb24sIENvbXBpbGVyLCBzb3VyY2VzIGFzIHdlYnBhY2tTb3VyY2VzIH0gZnJvbSAnd2VicGFjayc7XG5pbXBvcnQgeyBhc3NlcnRJc0Vycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvZXJyb3InO1xuaW1wb3J0IHsgYWRkRXJyb3IgfSBmcm9tICcuLi8uLi91dGlscy93ZWJwYWNrLWRpYWdub3N0aWNzJztcblxuY29uc3QgRW50cnlwb2ludCA9IHJlcXVpcmUoJ3dlYnBhY2svbGliL0VudHJ5cG9pbnQnKTtcblxuLyoqXG4gKiBUaGUgbmFtZSBvZiB0aGUgcGx1Z2luIHByb3ZpZGVkIHRvIFdlYnBhY2sgd2hlbiB0YXBwaW5nIFdlYnBhY2sgY29tcGlsZXIgaG9va3MuXG4gKi9cbmNvbnN0IFBMVUdJTl9OQU1FID0gJ3NjcmlwdHMtd2VicGFjay1wbHVnaW4nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNjcmlwdHNXZWJwYWNrUGx1Z2luT3B0aW9ucyB7XG4gIG5hbWU6IHN0cmluZztcbiAgc291cmNlTWFwPzogYm9vbGVhbjtcbiAgc2NyaXB0czogc3RyaW5nW107XG4gIGZpbGVuYW1lOiBzdHJpbmc7XG4gIGJhc2VQYXRoOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBTY3JpcHRPdXRwdXQge1xuICBmaWxlbmFtZTogc3RyaW5nO1xuICBzb3VyY2U6IHdlYnBhY2tTb3VyY2VzLkNhY2hlZFNvdXJjZTtcbn1cblxuZnVuY3Rpb24gYWRkRGVwZW5kZW5jaWVzKGNvbXBpbGF0aW9uOiBDb21waWxhdGlvbiwgc2NyaXB0czogc3RyaW5nW10pOiB2b2lkIHtcbiAgZm9yIChjb25zdCBzY3JpcHQgb2Ygc2NyaXB0cykge1xuICAgIGNvbXBpbGF0aW9uLmZpbGVEZXBlbmRlbmNpZXMuYWRkKHNjcmlwdCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNjcmlwdHNXZWJwYWNrUGx1Z2luIHtcbiAgcHJpdmF0ZSBfbGFzdEJ1aWxkVGltZT86IG51bWJlcjtcbiAgcHJpdmF0ZSBfY2FjaGVkT3V0cHV0PzogU2NyaXB0T3V0cHV0O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgb3B0aW9uczogU2NyaXB0c1dlYnBhY2tQbHVnaW5PcHRpb25zKSB7fVxuXG4gIGFzeW5jIHNob3VsZFNraXAoY29tcGlsYXRpb246IENvbXBpbGF0aW9uLCBzY3JpcHRzOiBzdHJpbmdbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICh0aGlzLl9sYXN0QnVpbGRUaW1lID09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fbGFzdEJ1aWxkVGltZSA9IERhdGUubm93KCk7XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHNjcmlwdCBvZiBzY3JpcHRzKSB7XG4gICAgICBjb25zdCBzY3JpcHRUaW1lID0gYXdhaXQgbmV3IFByb21pc2U8bnVtYmVyIHwgdW5kZWZpbmVkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbXBpbGF0aW9uLmZpbGVTeXN0ZW1JbmZvLmdldEZpbGVUaW1lc3RhbXAoc2NyaXB0LCAoZXJyb3IsIGVudHJ5KSA9PiB7XG4gICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzb2x2ZShlbnRyeSAmJiB0eXBlb2YgZW50cnkgIT09ICdzdHJpbmcnID8gZW50cnkuc2FmZVRpbWUgOiB1bmRlZmluZWQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXNjcmlwdFRpbWUgfHwgc2NyaXB0VGltZSA+IHRoaXMuX2xhc3RCdWlsZFRpbWUpIHtcbiAgICAgICAgdGhpcy5fbGFzdEJ1aWxkVGltZSA9IERhdGUubm93KCk7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5zZXJ0T3V0cHV0KFxuICAgIGNvbXBpbGF0aW9uOiBDb21waWxhdGlvbixcbiAgICB7IGZpbGVuYW1lLCBzb3VyY2UgfTogU2NyaXB0T3V0cHV0LFxuICAgIGNhY2hlZCA9IGZhbHNlLFxuICApIHtcbiAgICBjb25zdCBjaHVuayA9IG5ldyBDaHVuayh0aGlzLm9wdGlvbnMubmFtZSk7XG4gICAgY2h1bmsucmVuZGVyZWQgPSAhY2FjaGVkO1xuICAgIGNodW5rLmlkID0gdGhpcy5vcHRpb25zLm5hbWU7XG4gICAgY2h1bmsuaWRzID0gW2NodW5rLmlkXTtcbiAgICBjaHVuay5maWxlcy5hZGQoZmlsZW5hbWUpO1xuXG4gICAgY29uc3QgZW50cnlwb2ludCA9IG5ldyBFbnRyeXBvaW50KHRoaXMub3B0aW9ucy5uYW1lKTtcbiAgICBlbnRyeXBvaW50LnB1c2hDaHVuayhjaHVuayk7XG4gICAgY2h1bmsuYWRkR3JvdXAoZW50cnlwb2ludCk7XG4gICAgY29tcGlsYXRpb24uZW50cnlwb2ludHMuc2V0KHRoaXMub3B0aW9ucy5uYW1lLCBlbnRyeXBvaW50KTtcbiAgICBjb21waWxhdGlvbi5jaHVua3MuYWRkKGNodW5rKTtcblxuICAgIGNvbXBpbGF0aW9uLmFzc2V0c1tmaWxlbmFtZV0gPSBzb3VyY2U7XG4gICAgY29tcGlsYXRpb24uaG9va3MuY2h1bmtBc3NldC5jYWxsKGNodW5rLCBmaWxlbmFtZSk7XG4gIH1cblxuICBhcHBseShjb21waWxlcjogQ29tcGlsZXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnNjcmlwdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29tcGlsZXIuaG9va3MudGhpc0NvbXBpbGF0aW9uLnRhcChQTFVHSU5fTkFNRSwgKGNvbXBpbGF0aW9uKSA9PiB7XG4gICAgICAvLyBVc2UgdGhlIHJlc29sdmVyIGZyb20gdGhlIGNvbXBpbGF0aW9uIGluc3RlYWQgb2YgY29tcGlsZXIuXG4gICAgICAvLyBVc2luZyB0aGUgbGF0dGVyIHdpbGwgY2F1c2VzIGEgbG90IG9mIGBEZXNjcmlwdGlvbkZpbGVVdGlscy5sb2FkRGVzY3JpcHRpb25GaWxlYCBjYWxscy5cbiAgICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci1jbGkvaXNzdWVzLzI0NjM0I2lzc3VlY29tbWVudC0xNDI1NzgyNjY4XG4gICAgICBjb25zdCByZXNvbHZlciA9IGNvbXBpbGF0aW9uLnJlc29sdmVyRmFjdG9yeS5nZXQoJ25vcm1hbCcsIHtcbiAgICAgICAgcHJlZmVyUmVsYXRpdmU6IHRydWUsXG4gICAgICAgIHVzZVN5bmNGaWxlU3lzdGVtQ2FsbHM6IHRydWUsXG4gICAgICAgIC8vIENhY2hpbmcgbXVzdCBiZSBkaXNhYmxlZCBiZWNhdXNlIGl0IGNhdXNlcyB0aGUgcmVzb2x2ZXIgdG8gYmVjb21lIGFzeW5jIGFmdGVyIGEgcmVidWlsZC5cbiAgICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHNjcmlwdHM6IHN0cmluZ1tdID0gW107XG5cbiAgICAgIGZvciAoY29uc3Qgc2NyaXB0IG9mIHRoaXMub3B0aW9ucy5zY3JpcHRzKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gcmVzb2x2ZXIucmVzb2x2ZVN5bmMoe30sIHRoaXMub3B0aW9ucy5iYXNlUGF0aCwgc2NyaXB0KTtcbiAgICAgICAgICBpZiAocmVzb2x2ZWRQYXRoKSB7XG4gICAgICAgICAgICBzY3JpcHRzLnB1c2gocmVzb2x2ZWRQYXRoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWRkRXJyb3IoY29tcGlsYXRpb24sIGBDYW5ub3QgcmVzb2x2ZSAnJHtzY3JpcHR9Jy5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgYXNzZXJ0SXNFcnJvcihlcnJvcik7XG4gICAgICAgICAgYWRkRXJyb3IoY29tcGlsYXRpb24sIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbXBpbGF0aW9uLmhvb2tzLmFkZGl0aW9uYWxBc3NldHMudGFwUHJvbWlzZShQTFVHSU5fTkFNRSwgYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoYXdhaXQgdGhpcy5zaG91bGRTa2lwKGNvbXBpbGF0aW9uLCBzY3JpcHRzKSkge1xuICAgICAgICAgIGlmICh0aGlzLl9jYWNoZWRPdXRwdXQpIHtcbiAgICAgICAgICAgIHRoaXMuX2luc2VydE91dHB1dChjb21waWxhdGlvbiwgdGhpcy5fY2FjaGVkT3V0cHV0LCB0cnVlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhZGREZXBlbmRlbmNpZXMoY29tcGlsYXRpb24sIHNjcmlwdHMpO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc291cmNlR2V0dGVycyA9IHNjcmlwdHMubWFwKChmdWxsUGF0aCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx3ZWJwYWNrU291cmNlcy5Tb3VyY2U+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbXBpbGF0aW9uLmlucHV0RmlsZVN5c3RlbS5yZWFkRmlsZShcbiAgICAgICAgICAgICAgZnVsbFBhdGgsXG4gICAgICAgICAgICAgIChlcnI/OiBFcnJvciB8IG51bGwsIGRhdGE/OiBzdHJpbmcgfCBCdWZmZXIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcblxuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBkYXRhPy50b1N0cmluZygpID8/ICcnO1xuXG4gICAgICAgICAgICAgICAgbGV0IHNvdXJjZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNvdXJjZU1hcCkge1xuICAgICAgICAgICAgICAgICAgLy8gVE9ETzogTG9vayBmb3Igc291cmNlIG1hcCBmaWxlIChmb3IgJy5taW4nIHNjcmlwdHMsIGV0Yy4pXG5cbiAgICAgICAgICAgICAgICAgIGxldCBhZGp1c3RlZFBhdGggPSBmdWxsUGF0aDtcbiAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFzZVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYWRqdXN0ZWRQYXRoID0gcGF0aC5yZWxhdGl2ZSh0aGlzLm9wdGlvbnMuYmFzZVBhdGgsIGZ1bGxQYXRoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHNvdXJjZSA9IG5ldyB3ZWJwYWNrU291cmNlcy5PcmlnaW5hbFNvdXJjZShjb250ZW50LCBhZGp1c3RlZFBhdGgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzb3VyY2UgPSBuZXcgd2VicGFja1NvdXJjZXMuUmF3U291cmNlKGNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc29sdmUoc291cmNlKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHNvdXJjZXMgPSBhd2FpdCBQcm9taXNlLmFsbChzb3VyY2VHZXR0ZXJzKTtcbiAgICAgICAgY29uc3QgY29uY2F0U291cmNlID0gbmV3IHdlYnBhY2tTb3VyY2VzLkNvbmNhdFNvdXJjZSgpO1xuICAgICAgICBzb3VyY2VzLmZvckVhY2goKHNvdXJjZSkgPT4ge1xuICAgICAgICAgIGNvbmNhdFNvdXJjZS5hZGQoc291cmNlKTtcbiAgICAgICAgICBjb25jYXRTb3VyY2UuYWRkKCdcXG47Jyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGNvbWJpbmVkU291cmNlID0gbmV3IHdlYnBhY2tTb3VyY2VzLkNhY2hlZFNvdXJjZShjb25jYXRTb3VyY2UpO1xuXG4gICAgICAgIGNvbnN0IG91dHB1dCA9IHsgZmlsZW5hbWU6IHRoaXMub3B0aW9ucy5maWxlbmFtZSwgc291cmNlOiBjb21iaW5lZFNvdXJjZSB9O1xuICAgICAgICB0aGlzLl9pbnNlcnRPdXRwdXQoY29tcGlsYXRpb24sIG91dHB1dCk7XG4gICAgICAgIHRoaXMuX2NhY2hlZE91dHB1dCA9IG91dHB1dDtcbiAgICAgICAgYWRkRGVwZW5kZW5jaWVzKGNvbXBpbGF0aW9uLCBzY3JpcHRzKTtcbiAgICAgIH0pO1xuICAgICAgY29tcGlsYXRpb24uaG9va3MucHJvY2Vzc0Fzc2V0cy50YXBQcm9taXNlKFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogUExVR0lOX05BTUUsXG4gICAgICAgICAgc3RhZ2U6IGNvbXBpbGVyLndlYnBhY2suQ29tcGlsYXRpb24uUFJPQ0VTU19BU1NFVFNfU1RBR0VfREVWX1RPT0xJTkcsXG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgICBjb25zdCBhc3NldE5hbWUgPSB0aGlzLm9wdGlvbnMuZmlsZW5hbWU7XG4gICAgICAgICAgY29uc3QgYXNzZXQgPSBjb21waWxhdGlvbi5nZXRBc3NldChhc3NldE5hbWUpO1xuICAgICAgICAgIGlmIChhc3NldCkge1xuICAgICAgICAgICAgY29uc3QgaW50ZXJwb2xhdGVkRmlsZW5hbWUgPSBpbnRlcnBvbGF0ZU5hbWUoXG4gICAgICAgICAgICAgIHsgcmVzb3VyY2VQYXRoOiAnc2NyaXB0cy5qcycgfSxcbiAgICAgICAgICAgICAgYXNzZXROYW1lLFxuICAgICAgICAgICAgICB7IGNvbnRlbnQ6IGFzc2V0LnNvdXJjZS5zb3VyY2UoKSB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChhc3NldE5hbWUgIT09IGludGVycG9sYXRlZEZpbGVuYW1lKSB7XG4gICAgICAgICAgICAgIGNvbXBpbGF0aW9uLnJlbmFtZUFzc2V0KGFzc2V0TmFtZSwgaW50ZXJwb2xhdGVkRmlsZW5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==