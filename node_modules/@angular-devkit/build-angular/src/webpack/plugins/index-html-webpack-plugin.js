"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexHtmlWebpackPlugin = void 0;
const path_1 = require("path");
const webpack_1 = require("webpack");
const error_1 = require("../../utils/error");
const index_html_generator_1 = require("../../utils/index-file/index-html-generator");
const webpack_diagnostics_1 = require("../../utils/webpack-diagnostics");
const PLUGIN_NAME = 'index-html-webpack-plugin';
class IndexHtmlWebpackPlugin extends index_html_generator_1.IndexHtmlGenerator {
    get compilation() {
        if (this._compilation) {
            return this._compilation;
        }
        throw new Error('compilation is undefined.');
    }
    constructor(options) {
        super(options);
        this.options = options;
    }
    apply(compiler) {
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            this._compilation = compilation;
            compilation.hooks.processAssets.tapPromise({
                name: PLUGIN_NAME,
                stage: webpack_1.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE + 1,
            }, callback);
        });
        const callback = async (assets) => {
            const files = [];
            try {
                for (const chunk of this.compilation.chunks) {
                    for (const file of chunk.files) {
                        if (file.endsWith('.hot-update.js')) {
                            continue;
                        }
                        files.push({
                            name: chunk.name,
                            file,
                            extension: (0, path_1.extname)(file),
                        });
                    }
                }
                const { content, warnings, errors } = await this.process({
                    files,
                    outputPath: (0, path_1.dirname)(this.options.outputPath),
                    baseHref: this.options.baseHref,
                    lang: this.options.lang,
                });
                assets[this.options.outputPath] = new webpack_1.sources.RawSource(content);
                warnings.forEach((msg) => (0, webpack_diagnostics_1.addWarning)(this.compilation, msg));
                errors.forEach((msg) => (0, webpack_diagnostics_1.addError)(this.compilation, msg));
            }
            catch (error) {
                (0, error_1.assertIsError)(error);
                (0, webpack_diagnostics_1.addError)(this.compilation, error.message);
            }
        };
    }
    async readAsset(path) {
        const data = this.compilation.assets[(0, path_1.basename)(path)].source();
        return typeof data === 'string' ? data : data.toString();
    }
    async readIndex(path) {
        return new Promise((resolve, reject) => {
            this.compilation.inputFileSystem.readFile(path, (err, data) => {
                var _a;
                if (err) {
                    reject(err);
                    return;
                }
                this.compilation.fileDependencies.add(path);
                resolve((_a = data === null || data === void 0 ? void 0 : data.toString()) !== null && _a !== void 0 ? _a : '');
            });
        });
    }
}
exports.IndexHtmlWebpackPlugin = IndexHtmlWebpackPlugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtaHRtbC13ZWJwYWNrLXBsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2J1aWxkX2FuZ3VsYXIvc3JjL3dlYnBhY2svcGx1Z2lucy9pbmRleC1odG1sLXdlYnBhY2stcGx1Z2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUFrRDtBQUNsRCxxQ0FBeUQ7QUFDekQsNkNBQWtEO0FBRWxELHNGQUlxRDtBQUNyRCx5RUFBdUU7QUFNdkUsTUFBTSxXQUFXLEdBQUcsMkJBQTJCLENBQUM7QUFDaEQsTUFBYSxzQkFBdUIsU0FBUSx5Q0FBa0I7SUFFNUQsSUFBSSxXQUFXO1FBQ2IsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3JCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztTQUMxQjtRQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsWUFBOEIsT0FBc0M7UUFDbEUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRGEsWUFBTyxHQUFQLE9BQU8sQ0FBK0I7SUFFcEUsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFrQjtRQUN0QixRQUFRLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDOUQsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7WUFDaEMsV0FBVyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUN4QztnQkFDRSxJQUFJLEVBQUUsV0FBVztnQkFDakIsS0FBSyxFQUFFLHFCQUFXLENBQUMsNkJBQTZCLEdBQUcsQ0FBQzthQUNyRCxFQUNELFFBQVEsQ0FDVCxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLFFBQVEsR0FBRyxLQUFL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bnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IGJhc2VuYW1lLCBkaXJuYW1lLCBleHRuYW1lIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBDb21waWxhdGlvbiwgQ29tcGlsZXIsIHNvdXJjZXMgfSBmcm9tICd3ZWJwYWNrJztcbmltcG9ydCB7IGFzc2VydElzRXJyb3IgfSBmcm9tICcuLi8uLi91dGlscy9lcnJvcic7XG5pbXBvcnQgeyBGaWxlSW5mbyB9IGZyb20gJy4uLy4uL3V0aWxzL2luZGV4LWZpbGUvYXVnbWVudC1pbmRleC1odG1sJztcbmltcG9ydCB7XG4gIEluZGV4SHRtbEdlbmVyYXRvcixcbiAgSW5kZXhIdG1sR2VuZXJhdG9yT3B0aW9ucyxcbiAgSW5kZXhIdG1sR2VuZXJhdG9yUHJvY2Vzc09wdGlvbnMsXG59IGZyb20gJy4uLy4uL3V0aWxzL2luZGV4LWZpbGUvaW5kZXgtaHRtbC1nZW5lcmF0b3InO1xuaW1wb3J0IHsgYWRkRXJyb3IsIGFkZFdhcm5pbmcgfSBmcm9tICcuLi8uLi91dGlscy93ZWJwYWNrLWRpYWdub3N0aWNzJztcblxuZXhwb3J0IGludGVyZmFjZSBJbmRleEh0bWxXZWJwYWNrUGx1Z2luT3B0aW9uc1xuICBleHRlbmRzIEluZGV4SHRtbEdlbmVyYXRvck9wdGlvbnMsXG4gICAgT21pdDxJbmRleEh0bWxHZW5lcmF0b3JQcm9jZXNzT3B0aW9ucywgJ2ZpbGVzJz4ge31cblxuY29uc3QgUExVR0lOX05BTUUgPSAnaW5kZXgtaHRtbC13ZWJwYWNrLXBsdWdpbic7XG5leHBvcnQgY2xhc3MgSW5kZXhIdG1sV2VicGFja1BsdWdpbiBleHRlbmRzIEluZGV4SHRtbEdlbmVyYXRvciB7XG4gIHByaXZhdGUgX2NvbXBpbGF0aW9uOiBDb21waWxhdGlvbiB8IHVuZGVmaW5lZDtcbiAgZ2V0IGNvbXBpbGF0aW9uKCk6IENvbXBpbGF0aW9uIHtcbiAgICBpZiAodGhpcy5fY29tcGlsYXRpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLl9jb21waWxhdGlvbjtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbXBpbGF0aW9uIGlzIHVuZGVmaW5lZC4nKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG92ZXJyaWRlIHJlYWRvbmx5IG9wdGlvbnM6IEluZGV4SHRtbFdlYnBhY2tQbHVnaW5PcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucyk7XG4gIH1cblxuICBhcHBseShjb21waWxlcjogQ29tcGlsZXIpIHtcbiAgICBjb21waWxlci5ob29rcy50aGlzQ29tcGlsYXRpb24udGFwKFBMVUdJTl9OQU1FLCAoY29tcGlsYXRpb24pID0+IHtcbiAgICAgIHRoaXMuX2NvbXBpbGF0aW9uID0gY29tcGlsYXRpb247XG4gICAgICBjb21waWxhdGlvbi5ob29rcy5wcm9jZXNzQXNzZXRzLnRhcFByb21pc2UoXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBQTFVHSU5fTkFNRSxcbiAgICAgICAgICBzdGFnZTogQ29tcGlsYXRpb24uUFJPQ0VTU19BU1NFVFNfU1RBR0VfT1BUSU1JWkUgKyAxLFxuICAgICAgICB9LFxuICAgICAgICBjYWxsYmFjayxcbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBjYWxsYmFjayA9IGFzeW5jIChhc3NldHM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiB7XG4gICAgICBjb25zdCBmaWxlczogRmlsZUluZm9bXSA9IFtdO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKGNvbnN0IGNodW5rIG9mIHRoaXMuY29tcGlsYXRpb24uY2h1bmtzKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGNodW5rLmZpbGVzKSB7XG4gICAgICAgICAgICBpZiAoZmlsZS5lbmRzV2l0aCgnLmhvdC11cGRhdGUuanMnKSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZmlsZXMucHVzaCh7XG4gICAgICAgICAgICAgIG5hbWU6IGNodW5rLm5hbWUsXG4gICAgICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgICAgIGV4dGVuc2lvbjogZXh0bmFtZShmaWxlKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHsgY29udGVudCwgd2FybmluZ3MsIGVycm9ycyB9ID0gYXdhaXQgdGhpcy5wcm9jZXNzKHtcbiAgICAgICAgICBmaWxlcyxcbiAgICAgICAgICBvdXRwdXRQYXRoOiBkaXJuYW1lKHRoaXMub3B0aW9ucy5vdXRwdXRQYXRoKSxcbiAgICAgICAgICBiYXNlSHJlZjogdGhpcy5vcHRpb25zLmJhc2VIcmVmLFxuICAgICAgICAgIGxhbmc6IHRoaXMub3B0aW9ucy5sYW5nLFxuICAgICAgICB9KTtcblxuICAgICAgICBhc3NldHNbdGhpcy5vcHRpb25zLm91dHB1dFBhdGhdID0gbmV3IHNvdXJjZXMuUmF3U291cmNlKGNvbnRlbnQpO1xuXG4gICAgICAgIHdhcm5pbmdzLmZvckVhY2goKG1zZykgPT4gYWRkV2FybmluZyh0aGlzLmNvbXBpbGF0aW9uLCBtc2cpKTtcbiAgICAgICAgZXJyb3JzLmZvckVhY2goKG1zZykgPT4gYWRkRXJyb3IodGhpcy5jb21waWxhdGlvbiwgbXNnKSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBhc3NlcnRJc0Vycm9yKGVycm9yKTtcbiAgICAgICAgYWRkRXJyb3IodGhpcy5jb21waWxhdGlvbiwgZXJyb3IubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIG92ZXJyaWRlIGFzeW5jIHJlYWRBc3NldChwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLmNvbXBpbGF0aW9uLmFzc2V0c1tiYXNlbmFtZShwYXRoKV0uc291cmNlKCk7XG5cbiAgICByZXR1cm4gdHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnID8gZGF0YSA6IGRhdGEudG9TdHJpbmcoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBhc3luYyByZWFkSW5kZXgocGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmNvbXBpbGF0aW9uLmlucHV0RmlsZVN5c3RlbS5yZWFkRmlsZShcbiAgICAgICAgcGF0aCxcbiAgICAgICAgKGVycj86IEVycm9yIHwgbnVsbCwgZGF0YT86IHN0cmluZyB8IEJ1ZmZlcikgPT4ge1xuICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5jb21waWxhdGlvbi5maWxlRGVwZW5kZW5jaWVzLmFkZChwYXRoKTtcbiAgICAgICAgICByZXNvbHZlKGRhdGE/LnRvU3RyaW5nKCkgPz8gJycpO1xuICAgICAgICB9LFxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxufVxuIl19