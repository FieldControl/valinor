/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/transformers/metadata_reader", ["require", "exports", "tslib", "@angular/compiler-cli/src/metadata/index", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readMetadata = exports.createMetadataReaderCache = void 0;
    var tslib_1 = require("tslib");
    var metadata_1 = require("@angular/compiler-cli/src/metadata/index");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    function createMetadataReaderCache() {
        var data = new Map();
        return { data: data };
    }
    exports.createMetadataReaderCache = createMetadataReaderCache;
    function readMetadata(filePath, host, cache) {
        var metadatas = cache && cache.data.get(filePath);
        if (metadatas) {
            return metadatas;
        }
        if (host.fileExists(filePath)) {
            // If the file doesn't exists then we cannot return metadata for the file.
            // This will occur if the user referenced a declared module for which no file
            // exists for the module (i.e. jQuery or angularjs).
            if (util_1.DTS.test(filePath)) {
                metadatas = readMetadataFile(host, filePath);
                if (!metadatas) {
                    // If there is a .d.ts file but no metadata file we need to produce a
                    // metadata from the .d.ts file as metadata files capture reexports
                    // (starting with v3).
                    metadatas = [upgradeMetadataWithDtsData(host, { '__symbolic': 'module', 'version': 1, 'metadata': {} }, filePath)];
                }
            }
            else {
                var metadata = host.getSourceFileMetadata(filePath);
                metadatas = metadata ? [metadata] : [];
            }
        }
        if (cache && (!host.cacheMetadata || host.cacheMetadata(filePath))) {
            cache.data.set(filePath, metadatas);
        }
        return metadatas;
    }
    exports.readMetadata = readMetadata;
    function readMetadataFile(host, dtsFilePath) {
        var metadataPath = dtsFilePath.replace(util_1.DTS, '.metadata.json');
        if (!host.fileExists(metadataPath)) {
            return undefined;
        }
        try {
            var metadataOrMetadatas = JSON.parse(host.readFile(metadataPath));
            var metadatas = metadataOrMetadatas ?
                (Array.isArray(metadataOrMetadatas) ? metadataOrMetadatas : [metadataOrMetadatas]) :
                [];
            if (metadatas.length) {
                var maxMetadata = metadatas.reduce(function (p, c) { return p.version > c.version ? p : c; });
                if (maxMetadata.version < metadata_1.METADATA_VERSION) {
                    metadatas.push(upgradeMetadataWithDtsData(host, maxMetadata, dtsFilePath));
                }
            }
            return metadatas;
        }
        catch (e) {
            console.error("Failed to read JSON file " + metadataPath);
            throw e;
        }
    }
    function upgradeMetadataWithDtsData(host, oldMetadata, dtsFilePath) {
        // patch v1 to v3 by adding exports and the `extends` clause.
        // patch v3 to v4 by adding `interface` symbols for TypeAlias
        var newMetadata = {
            '__symbolic': 'module',
            'version': metadata_1.METADATA_VERSION,
            'metadata': tslib_1.__assign({}, oldMetadata.metadata),
        };
        if (oldMetadata.exports) {
            newMetadata.exports = oldMetadata.exports;
        }
        if (oldMetadata.importAs) {
            newMetadata.importAs = oldMetadata.importAs;
        }
        if (oldMetadata.origins) {
            newMetadata.origins = oldMetadata.origins;
        }
        var dtsMetadata = host.getSourceFileMetadata(dtsFilePath);
        if (dtsMetadata) {
            for (var prop in dtsMetadata.metadata) {
                if (!newMetadata.metadata[prop]) {
                    newMetadata.metadata[prop] = dtsMetadata.metadata[prop];
                }
            }
            if (dtsMetadata['importAs'])
                newMetadata['importAs'] = dtsMetadata['importAs'];
            // Only copy exports from exports from metadata prior to version 3.
            // Starting with version 3 the collector began collecting exports and
            // this should be redundant. Also, with bundler will rewrite the exports
            // which will hoist the exports from modules referenced indirectly causing
            // the imports to be different than the .d.ts files and using the .d.ts file
            // exports would cause the StaticSymbolResolver to redirect symbols to the
            // incorrect location.
            if ((!oldMetadata.version || oldMetadata.version < 3) && dtsMetadata.exports) {
                newMetadata.exports = dtsMetadata.exports;
            }
        }
        return newMetadata;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGFfcmVhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy90cmFuc2Zvcm1lcnMvbWV0YWRhdGFfcmVhZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCxxRUFBNkQ7SUFFN0Qsb0VBQTJCO0lBZ0IzQixTQUFnQix5QkFBeUI7UUFDdkMsSUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQXNDLENBQUM7UUFDM0QsT0FBTyxFQUFDLElBQUksTUFBQSxFQUFDLENBQUM7SUFDaEIsQ0FBQztJQUhELDhEQUdDO0lBRUQsU0FBZ0IsWUFBWSxDQUN4QixRQUFnQixFQUFFLElBQXdCLEVBQUUsS0FBMkI7UUFFekUsSUFBSSxTQUFTLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELElBQUksU0FBUyxFQUFFO1lBQ2IsT0FBTyxTQUFTLENBQUM7U0FDbEI7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDN0IsMEVBQTBFO1lBQzFFLDZFQUE2RTtZQUM3RSxvREFBb0Q7WUFDcEQsSUFBSSxVQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN0QixTQUFTLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUNkLHFFQUFxRTtvQkFDckUsbUVBQW1FO29CQUNuRSxzQkFBc0I7b0JBQ3RCLFNBQVMsR0FBRyxDQUFDLDBCQUEwQixDQUNuQyxJQUFJLEVBQUUsRUFBQyxZQUFZLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBQyxFQUFFLFFBQVEsQ0FBQyxDQUFD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LEtBQUssSUFBSSxJQUFJLElBQUksV0FBVyxDQUFDLFFBQVEsRUFBRTtnQkFDckMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQy9CLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDekQ7YUFDRjtZQUNELElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQztnQkFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRS9FLG1FQUFtRTtZQUNuRSxxRUFBcUU7WUFDckUsd0VBQXdFO1lBQ3hFLDBFQUEwRTtZQUMxRSw0RUFBNEU7WUFDNUUsMEVBQTBFO1lBQzFFLHNCQUFzQjtZQUN0QixJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRTtnQkFDNUUsV0FBVyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO2FBQzNDO1NBQ0Y7UUFDRCxPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge01FVEFEQVRBX1ZFUlNJT04sIE1vZHVsZU1ldGFkYXRhfSBmcm9tICcuLi9tZXRhZGF0YSc7XG5cbmltcG9ydCB7RFRTfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1ldGFkYXRhUmVhZGVySG9zdCB7XG4gIGdldFNvdXJjZUZpbGVNZXRhZGF0YShmaWxlUGF0aDogc3RyaW5nKTogTW9kdWxlTWV0YWRhdGF8dW5kZWZpbmVkO1xuICBjYWNoZU1ldGFkYXRhPyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbjtcbiAgZmlsZUV4aXN0cyhmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbjtcbiAgcmVhZEZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZXRhZGF0YVJlYWRlckNhY2hlIHtcbiAgLyoqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgZGF0YTogTWFwPHN0cmluZywgTW9kdWxlTWV0YWRhdGFbXXx1bmRlZmluZWQ+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTWV0YWRhdGFSZWFkZXJDYWNoZSgpOiBNZXRhZGF0YVJlYWRlckNhY2hlIHtcbiAgY29uc3QgZGF0YSA9IG5ldyBNYXA8c3RyaW5nLCBNb2R1bGVNZXRhZGF0YVtdfHVuZGVmaW5lZD4oKTtcbiAgcmV0dXJuIHtkYXRhfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRNZXRhZGF0YShcbiAgICBmaWxlUGF0aDogc3RyaW5nLCBob3N0OiBNZXRhZGF0YVJlYWRlckhvc3QsIGNhY2hlPzogTWV0YWRhdGFSZWFkZXJDYWNoZSk6IE1vZHVsZU1ldGFkYXRhW118XG4gICAgdW5kZWZpbmVkIHtcbiAgbGV0IG1ldGFkYXRhcyA9IGNhY2hlICYmIGNhY2hlLmRhdGEuZ2V0KGZpbGVQYXRoKTtcbiAgaWYgKG1ldGFkYXRhcykge1xuICAgIHJldHVybiBtZXRhZGF0YXM7XG4gIH1cbiAgaWYgKGhvc3QuZmlsZUV4aXN0cyhmaWxlUGF0aCkpIHtcbiAgICAvLyBJZiB0aGUgZmlsZSBkb2Vzbid0IGV4aXN0cyB0aGVuIHdlIGNhbm5vdCByZXR1cm4gbWV0YWRhdGEgZm9yIHRoZSBmaWxlLlxuICAgIC8vIFRoaXMgd2lsbCBvY2N1ciBpZiB0aGUgdXNlciByZWZlcmVuY2VkIGEgZGVjbGFyZWQgbW9kdWxlIGZvciB3aGljaCBubyBmaWxlXG4gICAgLy8gZXhpc3RzIGZvciB0aGUgbW9kdWxlIChpLmUuIGpRdWVyeSBvciBhbmd1bGFyanMpLlxuICAgIGlmIChEVFMudGVzdChmaWxlUGF0aCkpIHtcbiAgICAgIG1ldGFkYXRhcyA9IHJlYWRNZXRhZGF0YUZpbGUoaG9zdCwgZmlsZVBhdGgpO1xuICAgICAgaWYgKCFtZXRhZGF0YXMpIHtcbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSAuZC50cyBmaWxlIGJ1dCBubyBtZXRhZGF0YSBmaWxlIHdlIG5lZWQgdG8gcHJvZHVjZSBhXG4gICAgICAgIC8vIG1ldGFkYXRhIGZyb20gdGhlIC5kLnRzIGZpbGUgYXMgbWV0YWRhdGEgZmlsZXMgY2FwdHVyZSByZWV4cG9ydHNcbiAgICAgICAgLy8gKHN0YXJ0aW5nIHdpdGggdjMpLlxuICAgICAgICBtZXRhZGF0YXMgPSBbdXBncmFkZU1ldGFkYXRhV2l0aER0c0RhdGEoXG4gICAgICAgICAgICBob3N0LCB7J19fc3ltYm9saWMnOiAnbW9kdWxlJywgJ3ZlcnNpb24nOiAxLCAnbWV0YWRhdGEnOiB7fX0sIGZpbGVQYXRoKV07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG1ldGFkYXRhID0gaG9zdC5nZXRTb3VyY2VGaWxlTWV0YWRhdGEoZmlsZVBhdGgpO1xuICAgICAgbWV0YWRhdGFzID0gbWV0YWRhdGEgPyBbbWV0YWRhdGFdIDogW107XG4gICAgfVxuICB9XG4gIGlmIChjYWNoZSAmJiAoIWhvc3QuY2FjaGVNZXRhZGF0YSB8fCBob3N0LmNhY2hlTWV0YWRhdGEoZmlsZVBhdGgpKSkge1xuICAgIGNhY2hlLmRhdGEuc2V0KGZpbGVQYXRoLCBtZXRhZGF0YXMpO1xuICB9XG4gIHJldHVybiBtZXRhZGF0YXM7XG59XG5cblxuZnVuY3Rpb24gcmVhZE1ldGFkYXRhRmlsZShob3N0OiBNZXRhZGF0YVJlYWRlckhvc3QsIGR0c0ZpbGVQYXRoOiBzdHJpbmcpOiBNb2R1bGVNZXRhZGF0YVtdfFxuICAgIHVuZGVmaW5lZCB7XG4gIGNvbnN0IG1ldGFkYXRhUGF0aCA9IGR0c0ZpbGVQYXRoLnJlcGxhY2UoRFRTLCAnLm1ldGFkYXRhLmpzb24nKTtcbiAgaWYgKCFob3N0LmZpbGVFeGlzdHMobWV0YWRhdGFQYXRoKSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBtZXRhZGF0YU9yTWV0YWRhdGFzID1cbiAgICAgICAgSlNPTi5wYXJzZShob3N0LnJlYWRGaWxlKG1ldGFkYXRhUGF0aCkpIGFzIE1vZHVsZU1ldGFkYXRhIHwgTW9kdWxlTWV0YWRhdGFbXSB8IHVuZGVmaW5lZDtcbiAgICBjb25zdCBtZXRhZGF0YXMgPSBtZXRhZGF0YU9yTWV0YWRhdGFzID9cbiAgICAgICAgKEFycmF5LmlzQXJyYXkobWV0YWRhdGFPck1ldGFkYXRhcykgPyBtZXRhZGF0YU9yTWV0YWRhdGFzIDogW21ldGFkYXRhT3JNZXRhZGF0YXNdKSA6XG4gICAgICAgIFtdO1xuICAgIGlmIChtZXRhZGF0YXMubGVuZ3RoKSB7XG4gICAgICBsZXQgbWF4TWV0YWRhdGEgPSBtZXRhZGF0YXMucmVkdWNlKChwLCBjKSA9PiBwLnZlcnNpb24gPiBjLnZlcnNpb24gPyBwIDogYyk7XG4gICAgICBpZiAobWF4TWV0YWRhdGEudmVyc2lvbiA8IE1FVEFEQVRBX1ZFUlNJT04pIHtcbiAgICAgICAgbWV0YWRhdGFzLnB1c2godXBncmFkZU1ldGFkYXRhV2l0aER0c0RhdGEoaG9zdCwgbWF4TWV0YWRhdGEsIGR0c0ZpbGVQYXRoKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZXRhZGF0YXM7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gcmVhZCBKU09OIGZpbGUgJHttZXRhZGF0YVBhdGh9YCk7XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG5mdW5jdGlvbiB1cGdyYWRlTWV0YWRhdGFXaXRoRHRzRGF0YShcbiAgICBob3N0OiBNZXRhZGF0YVJlYWRlckhvc3QsIG9sZE1ldGFkYXRhOiBNb2R1bGVNZXRhZGF0YSwgZHRzRmlsZVBhdGg6IHN0cmluZyk6IE1vZHVsZU1ldGFkYXRhIHtcbiAgLy8gcGF0Y2ggdjEgdG8gdjMgYnkgYWRkaW5nIGV4cG9ydHMgYW5kIHRoZSBgZXh0ZW5kc2AgY2xhdXNlLlxuICAvLyBwYXRjaCB2MyB0byB2NCBieSBhZGRpbmcgYGludGVyZmFjZWAgc3ltYm9scyBmb3IgVHlwZUFsaWFzXG4gIGxldCBuZXdNZXRhZGF0YTogTW9kdWxlTWV0YWRhdGEgPSB7XG4gICAgJ19fc3ltYm9saWMnOiAnbW9kdWxlJyxcbiAgICAndmVyc2lvbic6IE1FVEFEQVRBX1ZFUlNJT04sXG4gICAgJ21ldGFkYXRhJzogey4uLm9sZE1ldGFkYXRhLm1ldGFkYXRhfSxcbiAgfTtcbiAgaWYgKG9sZE1ldGFkYXRhLmV4cG9ydHMpIHtcbiAgICBuZXdNZXRhZGF0YS5leHBvcnRzID0gb2xkTWV0YWRhdGEuZXhwb3J0cztcbiAgfVxuICBpZiAob2xkTWV0YWRhdGEuaW1wb3J0QXMpIHtcbiAgICBuZXdNZXRhZGF0YS5pbXBvcnRBcyA9IG9sZE1ldGFkYXRhLmltcG9ydEFzO1xuICB9XG4gIGlmIChvbGRNZXRhZGF0YS5vcmlnaW5zKSB7XG4gICAgbmV3TWV0YWRhdGEub3JpZ2lucyA9IG9sZE1ldGFkYXRhLm9yaWdpbnM7XG4gIH1cbiAgY29uc3QgZHRzTWV0YWRhdGEgPSBob3N0LmdldFNvdXJjZUZpbGVNZXRhZGF0YShkdHNGaWxlUGF0aCk7XG4gIGlmIChkdHNNZXRhZGF0YSkge1xuICAgIGZvciAobGV0IHByb3AgaW4gZHRzTWV0YWRhdGEubWV0YWRhdGEpIHtcbiAgICAgIGlmICghbmV3TWV0YWRhdGEubWV0YWRhdGFbcHJvcF0pIHtcbiAgICAgICAgbmV3TWV0YWRhdGEubWV0YWRhdGFbcHJvcF0gPSBkdHNNZXRhZGF0YS5tZXRhZGF0YVtwcm9wXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGR0c01ldGFkYXRhWydpbXBvcnRBcyddKSBuZXdNZXRhZGF0YVsnaW1wb3J0QXMnXSA9IGR0c01ldGFkYXRhWydpbXBvcnRBcyddO1xuXG4gICAgLy8gT25seSBjb3B5IGV4cG9ydHMgZnJvbSBleHBvcnRzIGZyb20gbWV0YWRhdGEgcHJpb3IgdG8gdmVyc2lvbiAzLlxuICAgIC8vIFN0YXJ0aW5nIHdpdGggdmVyc2lvbiAzIHRoZSBjb2xsZWN0b3IgYmVnYW4gY29sbGVjdGluZyBleHBvcnRzIGFuZFxuICAgIC8vIHRoaXMgc2hvdWxkIGJlIHJlZHVuZGFudC4gQWxzbywgd2l0aCBidW5kbGVyIHdpbGwgcmV3cml0ZSB0aGUgZXhwb3J0c1xuICAgIC8vIHdoaWNoIHdpbGwgaG9pc3QgdGhlIGV4cG9ydHMgZnJvbSBtb2R1bGVzIHJlZmVyZW5jZWQgaW5kaXJlY3RseSBjYXVzaW5nXG4gICAgLy8gdGhlIGltcG9ydHMgdG8gYmUgZGlmZmVyZW50IHRoYW4gdGhlIC5kLnRzIGZpbGVzIGFuZCB1c2luZyB0aGUgLmQudHMgZmlsZVxuICAgIC8vIGV4cG9ydHMgd291bGQgY2F1c2UgdGhlIFN0YXRpY1N5bWJvbFJlc29sdmVyIHRvIHJlZGlyZWN0IHN5bWJvbHMgdG8gdGhlXG4gICAgLy8gaW5jb3JyZWN0IGxvY2F0aW9uLlxuICAgIGlmICgoIW9sZE1ldGFkYXRhLnZlcnNpb24gfHwgb2xkTWV0YWRhdGEudmVyc2lvbiA8IDMpICYmIGR0c01ldGFkYXRhLmV4cG9ydHMpIHtcbiAgICAgIG5ld01ldGFkYXRhLmV4cG9ydHMgPSBkdHNNZXRhZGF0YS5leHBvcnRzO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbmV3TWV0YWRhdGE7XG59XG4iXX0=