(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/source_maps", ["require", "exports", "convert-source-map", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/sourcemaps"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderSourceAndMap = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var convert_source_map_1 = require("convert-source-map");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var sourcemaps_1 = require("@angular/compiler-cli/src/ngtsc/sourcemaps");
    /**
     * Merge the input and output source-maps, replacing the source-map comment in the output file
     * with an appropriate source-map comment pointing to the merged source-map.
     */
    function renderSourceAndMap(logger, fs, sourceFile, generatedMagicString) {
        var _a;
        var sourceFilePath = file_system_1.absoluteFromSourceFile(sourceFile);
        var sourceMapPath = file_system_1.absoluteFrom(sourceFilePath + ".map");
        var generatedContent = generatedMagicString.toString();
        var generatedMap = generatedMagicString.generateMap({ file: sourceFilePath, source: sourceFilePath, includeContent: true });
        try {
            var loader = new sourcemaps_1.SourceFileLoader(fs, logger, {});
            var generatedFile = loader.loadSourceFile(sourceFilePath, generatedContent, { map: generatedMap, mapPath: sourceMapPath });
            var rawMergedMap = generatedFile.renderFlattenedSourceMap();
            var mergedMap = convert_source_map_1.fromObject(rawMergedMap);
            var originalFile = loader.loadSourceFile(sourceFilePath, generatedMagicString.original);
            if (originalFile.rawMap === null && !sourceFile.isDeclarationFile ||
                ((_a = originalFile.rawMap) === null || _a === void 0 ? void 0 : _a.origin) === sourcemaps_1.ContentOrigin.Inline) {
                // We render an inline source map if one of:
                // * there was no input source map and this is not a typings file;
                // * the input source map exists and was inline.
                //
                // We do not generate inline source maps for typings files unless there explicitly was one in
                // the input file because these inline source maps can be very large and it impacts on the
                // performance of IDEs that need to read them to provide intellisense etc.
                return [
                    { path: sourceFilePath, contents: generatedFile.contents + "\n" + mergedMap.toComment() }
                ];
            }
            var sourceMapComment = convert_source_map_1.generateMapFileComment(fs.basename(sourceFilePath) + ".map");
            return [
                { path: sourceFilePath, contents: generatedFile.contents + "\n" + sourceMapComment },
                { path: sourceMapPath, contents: mergedMap.toJSON() }
            ];
        }
        catch (e) {
            logger.error("Error when flattening the source-map \"" + sourceMapPath + "\" for \"" + sourceFilePath + "\": " + e.toString());
            return [
                { path: sourceFilePath, contents: generatedContent },
                { path: sourceMapPath, contents: convert_source_map_1.fromObject(generatedMap).toJSON() },
            ];
        }
    }
    exports.renderSourceAndMap = renderSourceAndMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX21hcHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcmVuZGVyaW5nL3NvdXJjZV9tYXBzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHlEQUEwRjtJQUkxRiwyRUFBd0c7SUFFeEcseUVBQTRGO0lBVTVGOzs7T0FHRztJQUNILFNBQWdCLGtCQUFrQixDQUM5QixNQUFjLEVBQUUsRUFBc0IsRUFBRSxVQUF5QixFQUNqRSxvQkFBaUM7O1FBQ25DLElBQU0sY0FBYyxHQUFHLG9DQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFELElBQU0sYUFBYSxHQUFHLDBCQUFZLENBQUksY0FBYyxTQUFNLENBQUMsQ0FBQztRQUM1RCxJQUFNLGdCQUFnQixHQUFHLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3pELElBQU0sWUFBWSxHQUFpQixvQkFBb0IsQ0FBQyxXQUFXLENBQy9ELEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBRTFFLElBQUk7WUFDRixJQUFNLE1BQU0sR0FBRyxJQUFJLDZCQUFnQixDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEQsSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FDdkMsY0FBYyxFQUFFLGdCQUFnQixFQUFFLEVBQUMsR0FBRyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFDLENBQUMsQ0FBQztZQUVuRixJQUFNLFlBQVksR0FBaUIsYUFBYSxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDNUUsSUFBTSxTQUFTLEdBQUcsK0JBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMzQyxJQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFBRSxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxRixJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQjtnQkFDN0QsQ0FBQSxNQUFBLFlBQVksQ0FBQyxNQUFNLDBDQUFFLE1BQU0sTUFBSywwQkFBYSxDQUFDLE1BQU0sRUFBRTtnQkFDeEQsNENBQTRDO2dCQUM1QyxrRUFBa0U7Z0JBQ2xFLGdEQUFnRDtnQkFDaEQsRUFBRTtnQkFDRiw2RkFBNkY7Z0JBQzdGLDBGQUEwRjtnQkFDMUYsMEVBQTBFO2dCQUMxRSxPQUFPO29CQUNMLEVBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUssYUFBYSxDQUFDLFFBQVEsVUFBSyxTQUFTLENBQUMsU0FBUyxFQUFJLEVBQUM7aUJBQ3hGLENBQUM7YUFDSDtZQUVELElBQU0sZ0JBQWdCLEdBQUcsMkNBQXNCLENBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBTSxDQUFDLENBQUM7WUFDdEYsT0FBTztnQkFDTCxFQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFLLGFBQWEsQ0FBQyxRQUFRLFVBQUssZ0JBQWtCLEVBQUM7Z0JBQ2xGLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFDO2FBQ3BELENBQUM7U0FDSDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsTUFBTSxDQUFDLEtBQUssQ0FBQyw0Q0FBeUMsYUFBYSxpQkFDL0QsY0FBYyxZQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUksQ0FBQyxDQUFDO1lBQ3hDLE9BQU87Z0JBQ0wsRUFBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBQztnQkFDbEQsRUFBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSwrQkFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDO2FBQ25FLENBQUM7U0FDSDtJQUNILENBQUM7SUE1Q0QsZ0RBNENDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2Zyb21PYmplY3QsIGdlbmVyYXRlTWFwRmlsZUNvbW1lbnQsIFNvdXJjZU1hcENvbnZlcnRlcn0gZnJvbSAnY29udmVydC1zb3VyY2UtbWFwJztcbmltcG9ydCBNYWdpY1N0cmluZyBmcm9tICdtYWdpYy1zdHJpbmcnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7YWJzb2x1dGVGcm9tLCBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlLCBSZWFkb25seUZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtDb250ZW50T3JpZ2luLCBSYXdTb3VyY2VNYXAsIFNvdXJjZUZpbGVMb2FkZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9zb3VyY2VtYXBzJztcblxuaW1wb3J0IHtGaWxlVG9Xcml0ZX0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU291cmNlTWFwSW5mbyB7XG4gIHNvdXJjZTogc3RyaW5nO1xuICBtYXA6IFNvdXJjZU1hcENvbnZlcnRlcnxudWxsO1xuICBpc0lubGluZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBNZXJnZSB0aGUgaW5wdXQgYW5kIG91dHB1dCBzb3VyY2UtbWFwcywgcmVwbGFjaW5nIHRoZSBzb3VyY2UtbWFwIGNvbW1lbnQgaW4gdGhlIG91dHB1dCBmaWxlXG4gKiB3aXRoIGFuIGFwcHJvcHJpYXRlIHNvdXJjZS1tYXAgY29tbWVudCBwb2ludGluZyB0byB0aGUgbWVyZ2VkIHNvdXJjZS1tYXAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJTb3VyY2VBbmRNYXAoXG4gICAgbG9nZ2VyOiBMb2dnZXIsIGZzOiBSZWFkb25seUZpbGVTeXN0ZW0sIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsXG4gICAgZ2VuZXJhdGVkTWFnaWNTdHJpbmc6IE1hZ2ljU3RyaW5nKTogRmlsZVRvV3JpdGVbXSB7XG4gIGNvbnN0IHNvdXJjZUZpbGVQYXRoID0gYWJzb2x1dGVGcm9tU291cmNlRmlsZShzb3VyY2VGaWxlKTtcbiAgY29uc3Qgc291cmNlTWFwUGF0aCA9IGFic29sdXRlRnJvbShgJHtzb3VyY2VGaWxlUGF0aH0ubWFwYCk7XG4gIGNvbnN0IGdlbmVyYXRlZENvbnRlbnQgPSBnZW5lcmF0ZWRNYWdpY1N0cmluZy50b1N0cmluZygpO1xuICBjb25zdCBnZW5lcmF0ZWRNYXA6IFJhd1NvdXJjZU1hcCA9IGdlbmVyYXRlZE1hZ2ljU3RyaW5nLmdlbmVyYXRlTWFwKFxuICAgICAge2ZpbGU6IHNvdXJjZUZpbGVQYXRoLCBzb3VyY2U6IHNvdXJjZUZpbGVQYXRoLCBpbmNsdWRlQ29udGVudDogdHJ1ZX0pO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgbG9hZGVyID0gbmV3IFNvdXJjZUZpbGVMb2FkZXIoZnMsIGxvZ2dlciwge30pO1xuICAgIGNvbnN0IGdlbmVyYXRlZEZpbGUgPSBsb2FkZXIubG9hZFNvdXJjZUZpbGUoXG4gICAgICAgIHNvdXJjZUZpbGVQYXRoLCBnZW5lcmF0ZWRDb250ZW50LCB7bWFwOiBnZW5lcmF0ZWRNYXAsIG1hcFBhdGg6IHNvdXJjZU1hcFBhdGh9KTtcblxuICAgIGNvbnN0IHJhd01lcmdlZE1hcDogUmF3U291cmNlTWFwID0gZ2VuZXJhdGVkRmlsZS5yZW5kZXJGbGF0dGVuZWRTb3VyY2VNYXAoKTtcbiAgICBjb25zdCBtZXJnZWRNYXAgPSBmcm9tT2JqZWN0KHJhd01lcmdlZE1hcCk7XG4gICAgY29uc3Qgb3JpZ2luYWxGaWxlID0gbG9hZGVyLmxvYWRTb3VyY2VGaWxlKHNvdXJjZUZpbGVQYXRoLCBnZW5lcmF0ZWRNYWdpY1N0cmluZy5vcmlnaW5hbCk7XG4gICAgaWYgKG9yaWdpbmFsRmlsZS5yYXdNYXAgPT09IG51bGwgJiYgIXNvdXJjZUZpbGUuaXNEZWNsYXJhdGlvbkZpbGUgfHxcbiAgICAgICAgb3JpZ2luYWxGaWxlLnJhd01hcD8ub3JpZ2luID09PSBDb250ZW50T3JpZ2luLklubGluZSkge1xuICAgICAgLy8gV2UgcmVuZGVyIGFuIGlubGluZSBzb3VyY2UgbWFwIGlmIG9uZSBvZjpcbiAgICAgIC8vICogdGhlcmUgd2FzIG5vIGlucHV0IHNvdXJjZSBtYXAgYW5kIHRoaXMgaXMgbm90IGEgdHlwaW5ncyBmaWxlO1xuICAgICAgLy8gKiB0aGUgaW5wdXQgc291cmNlIG1hcCBleGlzdHMgYW5kIHdhcyBpbmxpbmUuXG4gICAgICAvL1xuICAgICAgLy8gV2UgZG8gbm90IGdlbmVyYXRlIGlubGluZSBzb3VyY2UgbWFwcyBmb3IgdHlwaW5ncyBmaWxlcyB1bmxlc3MgdGhlcmUgZXhwbGljaXRseSB3YXMgb25lIGluXG4gICAgICAvLyB0aGUgaW5wdXQgZmlsZSBiZWNhdXNlIHRoZXNlIGlubGluZSBzb3VyY2UgbWFwcyBjYW4gYmUgdmVyeSBsYXJnZSBhbmQgaXQgaW1wYWN0cyBvbiB0aGVcbiAgICAgIC8vIHBlcmZvcm1hbmNlIG9mIElERXMgdGhhdCBuZWVkIHRvIHJlYWQgdGhlbSB0byBwcm92aWRlIGludGVsbGlzZW5zZSBldGMuXG4gICAgICByZXR1cm4gW1xuICAgICAgICB7cGF0aDogc291cmNlRmlsZVBhdGgsIGNvbnRlbnRzOiBgJHtnZW5lcmF0ZWRGaWxlLmNvbnRlbnRzfVxcbiR7bWVyZ2VkTWFwLnRvQ29tbWVudCgpfWB9XG4gICAgICBdO1xuICAgIH1cblxuICAgIGNvbnN0IHNvdXJjZU1hcENvbW1lbnQgPSBnZW5lcmF0ZU1hcEZpbGVDb21tZW50KGAke2ZzLmJhc2VuYW1lKHNvdXJjZUZpbGVQYXRoKX0ubWFwYCk7XG4gICAgcmV0dXJuIFtcbiAgICAgIHtwYXRoOiBzb3VyY2VGaWxlUGF0aCwgY29udGVudHM6IGAke2dlbmVyYXRlZEZpbGUuY29udGVudHN9XFxuJHtzb3VyY2VNYXBDb21tZW50fWB9LFxuICAgICAge3BhdGg6IHNvdXJjZU1hcFBhdGgsIGNvbnRlbnRzOiBtZXJnZWRNYXAudG9KU09OKCl9XG4gICAgXTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGxvZ2dlci5lcnJvcihgRXJyb3Igd2hlbiBmbGF0dGVuaW5nIHRoZSBzb3VyY2UtbWFwIFwiJHtzb3VyY2VNYXBQYXRofVwiIGZvciBcIiR7XG4gICAgICAgIHNvdXJjZUZpbGVQYXRofVwiOiAke2UudG9TdHJpbmcoKX1gKTtcbiAgICByZXR1cm4gW1xuICAgICAge3BhdGg6IHNvdXJjZUZpbGVQYXRoLCBjb250ZW50czogZ2VuZXJhdGVkQ29udGVudH0sXG4gICAgICB7cGF0aDogc291cmNlTWFwUGF0aCwgY29udGVudHM6IGZyb21PYmplY3QoZ2VuZXJhdGVkTWFwKS50b0pTT04oKX0sXG4gICAgXTtcbiAgfVxufVxuIl19