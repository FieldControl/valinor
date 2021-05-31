(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file", ["require", "exports", "tslib", "convert-source-map", "sourcemap-codec", "@angular/compiler-cli/src/ngtsc/sourcemaps/src/segment_marker"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeStartOfLinePositions = exports.ensureOriginalSegmentLinks = exports.extractOriginalSegments = exports.parseMappings = exports.mergeMappings = exports.findLastMappingIndexBefore = exports.SourceFile = exports.removeSourceMapComments = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var convert_source_map_1 = require("convert-source-map");
    var sourcemap_codec_1 = require("sourcemap-codec");
    var segment_marker_1 = require("@angular/compiler-cli/src/ngtsc/sourcemaps/src/segment_marker");
    function removeSourceMapComments(contents) {
        return convert_source_map_1.removeMapFileComments(convert_source_map_1.removeComments(contents)).replace(/\n\n$/, '\n');
    }
    exports.removeSourceMapComments = removeSourceMapComments;
    var SourceFile = /** @class */ (function () {
        function SourceFile(
        /** The path to this source file. */
        sourcePath, 
        /** The contents of this source file. */
        contents, 
        /** The raw source map (if any) referenced by this source file. */
        rawMap, 
        /** Any source files referenced by the raw source map associated with this source file. */
        sources, fs) {
            this.sourcePath = sourcePath;
            this.contents = contents;
            this.rawMap = rawMap;
            this.sources = sources;
            this.fs = fs;
            this.contents = removeSourceMapComments(contents);
            this.startOfLinePositions = computeStartOfLinePositions(this.contents);
            this.flattenedMappings = this.flattenMappings();
        }
        /**
         * Render the raw source map generated from the flattened mappings.
         */
        SourceFile.prototype.renderFlattenedSourceMap = function () {
            var e_1, _a;
            var _this = this;
            var sources = new IndexedMap();
            var names = new IndexedSet();
            var mappings = [];
            var sourcePathDir = this.fs.dirname(this.sourcePath);
            // Computing the relative path can be expensive, and we are likely to have the same path for
            // many (if not all!) mappings.
            var relativeSourcePathCache = new Cache(function (input) { return _this.fs.relative(sourcePathDir, input); });
            try {
                for (var _b = tslib_1.__values(this.flattenedMappings), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var mapping = _c.value;
                    var sourceIndex = sources.set(relativeSourcePathCache.get(mapping.originalSource.sourcePath), mapping.originalSource.contents);
                    var mappingArray = [
                        mapping.generatedSegment.column,
                        sourceIndex,
                        mapping.originalSegment.line,
                        mapping.originalSegment.column,
                    ];
                    if (mapping.name !== undefined) {
                        var nameIndex = names.add(mapping.name);
                        mappingArray.push(nameIndex);
                    }
                    // Ensure a mapping line array for this mapping.
                    var line = mapping.generatedSegment.line;
                    while (line >= mappings.length) {
                        mappings.push([]);
                    }
                    // Add this mapping to the line
                    mappings[line].push(mappingArray);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var sourceMap = {
                version: 3,
                file: this.fs.relative(sourcePathDir, this.sourcePath),
                sources: sources.keys,
                names: names.values,
                mappings: sourcemap_codec_1.encode(mappings),
                sourcesContent: sources.values,
            };
            return sourceMap;
        };
        /**
         * Find the original mapped location for the given `line` and `column` in the generated file.
         *
         * First we search for a mapping whose generated segment is at or directly before the given
         * location. Then we compute the offset between the given location and the matching generated
         * segment. Finally we apply this offset to the original source segment to get the desired
         * original location.
         */
        SourceFile.prototype.getOriginalLocation = function (line, column) {
            if (this.flattenedMappings.length === 0) {
                return null;
            }
            var position;
            if (line < this.startOfLinePositions.length) {
                position = this.startOfLinePositions[line] + column;
            }
            else {
                // The line is off the end of the file, so just assume we are at the end of the file.
                position = this.contents.length;
            }
            var locationSegment = { line: line, column: column, position: position, next: undefined };
            var mappingIndex = findLastMappingIndexBefore(this.flattenedMappings, locationSegment, false, 0);
            if (mappingIndex < 0) {
                mappingIndex = 0;
            }
            var _a = this.flattenedMappings[mappingIndex], originalSegment = _a.originalSegment, originalSource = _a.originalSource, generatedSegment = _a.generatedSegment;
            var offset = locationSegment.position - generatedSegment.position;
            var offsetOriginalSegment = segment_marker_1.offsetSegment(originalSource.startOfLinePositions, originalSegment, offset);
            return {
                file: originalSource.sourcePath,
                line: offsetOriginalSegment.line,
                column: offsetOriginalSegment.column,
            };
        };
        /**
         * Flatten the parsed mappings for this source file, so that all the mappings are to pure original
         * source files with no transitive source maps.
         */
        SourceFile.prototype.flattenMappings = function () {
            var mappings = parseMappings(this.rawMap && this.rawMap.map, this.sources, this.startOfLinePositions);
            ensureOriginalSegmentLinks(mappings);
            var flattenedMappings = [];
            for (var mappingIndex = 0; mappingIndex < mappings.length; mappingIndex++) {
                var aToBmapping = mappings[mappingIndex];
                var bSource = aToBmapping.originalSource;
                if (bSource.flattenedMappings.length === 0) {
                    // The b source file has no mappings of its own (i.e. it is a pure original file)
                    // so just use the mapping as-is.
                    flattenedMappings.push(aToBmapping);
                    continue;
                }
                // The `incomingStart` and `incomingEnd` are the `SegmentMarker`s in `B` that represent the
                // section of `B` source file that is being mapped to by the current `aToBmapping`.
                //
                // For example, consider the mappings from A to B:
                //
                // src A   src B     mapping
                //
                //   a ----- a       [0, 0]
                //   b       b
                //   f -  /- c       [4, 2]
                //   g  \ /  d
                //   c -/\   e
                //   d    \- f       [2, 5]
                //   e
                //
                // For mapping [0,0] the incoming start and end are 0 and 2 (i.e. the range a, b, c)
                // For mapping [4,2] the incoming start and end are 2 and 5 (i.e. the range c, d, e, f)
                //
                var incomingStart = aToBmapping.originalSegment;
                var incomingEnd = incomingStart.next;
                // The `outgoingStartIndex` and `outgoingEndIndex` are the indices of the range of mappings
                // that leave `b` that we are interested in merging with the aToBmapping.
                // We actually care about all the markers from the last bToCmapping directly before the
                // `incomingStart` to the last bToCmaping directly before the `incomingEnd`, inclusive.
                //
                // For example, if we consider the range 2 to 5 from above (i.e. c, d, e, f) with the
                // following mappings from B to C:
                //
                //   src B   src C     mapping
                //     a
                //     b ----- b       [1, 0]
                //   - c       c
                //  |  d       d
                //  |  e ----- 1       [4, 3]
                //   - f  \    2
                //         \   3
                //          \- e       [4, 6]
                //
                // The range with `incomingStart` at 2 and `incomingEnd` at 5 has outgoing start mapping of
                // [1,0] and outgoing end mapping of [4, 6], which also includes [4, 3].
                //
                var outgoingStartIndex = findLastMappingIndexBefore(bSource.flattenedMappings, incomingStart, false, 0);
                if (outgoingStartIndex < 0) {
                    outgoingStartIndex = 0;
                }
                var outgoingEndIndex = incomingEnd !== undefined ?
                    findLastMappingIndexBefore(bSource.flattenedMappings, incomingEnd, true, outgoingStartIndex) :
                    bSource.flattenedMappings.length - 1;
                for (var bToCmappingIndex = outgoingStartIndex; bToCmappingIndex <= outgoingEndIndex; bToCmappingIndex++) {
                    var bToCmapping = bSource.flattenedMappings[bToCmappingIndex];
                    flattenedMappings.push(mergeMappings(this, aToBmapping, bToCmapping));
                }
            }
            return flattenedMappings;
        };
        return SourceFile;
    }());
    exports.SourceFile = SourceFile;
    /**
     *
     * @param mappings The collection of mappings whose segment-markers we are searching.
     * @param marker The segment-marker to match against those of the given `mappings`.
     * @param exclusive If exclusive then we must find a mapping with a segment-marker that is
     * exclusively earlier than the given `marker`.
     * If not exclusive then we can return the highest mappings with an equivalent segment-marker to the
     * given `marker`.
     * @param lowerIndex If provided, this is used as a hint that the marker we are searching for has an
     * index that is no lower than this.
     */
    function findLastMappingIndexBefore(mappings, marker, exclusive, lowerIndex) {
        var upperIndex = mappings.length - 1;
        var test = exclusive ? -1 : 0;
        if (segment_marker_1.compareSegments(mappings[lowerIndex].generatedSegment, marker) > test) {
            // Exit early since the marker is outside the allowed range of mappings.
            return -1;
        }
        var matchingIndex = -1;
        while (lowerIndex <= upperIndex) {
            var index = (upperIndex + lowerIndex) >> 1;
            if (segment_marker_1.compareSegments(mappings[index].generatedSegment, marker) <= test) {
                matchingIndex = index;
                lowerIndex = index + 1;
            }
            else {
                upperIndex = index - 1;
            }
        }
        return matchingIndex;
    }
    exports.findLastMappingIndexBefore = findLastMappingIndexBefore;
    /**
     * Merge two mappings that go from A to B and B to C, to result in a mapping that goes from A to C.
     */
    function mergeMappings(generatedSource, ab, bc) {
        var name = bc.name || ab.name;
        // We need to modify the segment-markers of the new mapping to take into account the shifts that
        // occur due to the combination of the two mappings.
        // For example:
        // * Simple map where the B->C starts at the same place the A->B ends:
        //
        // ```
        // A: 1 2 b c d
        //        |        A->B [2,0]
        //        |              |
        // B:     b c d    A->C [2,1]
        //        |                |
        //        |        B->C [0,1]
        // C:   a b c d e
        // ```
        // * More complicated case where diffs of segment-markers is needed:
        //
        // ```
        // A: b 1 2 c d
        //     \
        //      |            A->B  [0,1*]    [0,1*]
        //      |                   |         |+3
        // B: a b 1 2 c d    A->C  [0,1]     [3,2]
        //    |      /                |+1       |
        //    |     /        B->C [0*,0]    [4*,2]
        //    |    /
        // C: a b c d e
        // ```
        //
        // `[0,1]` mapping from A->C:
        // The difference between the "original segment-marker" of A->B (1*) and the "generated
        // segment-marker of B->C (0*): `1 - 0 = +1`.
        // Since it is positive we must increment the "original segment-marker" with `1` to give [0,1].
        //
        // `[3,2]` mapping from A->C:
        // The difference between the "original segment-marker" of A->B (1*) and the "generated
        // segment-marker" of B->C (4*): `1 - 4 = -3`.
        // Since it is negative we must increment the "generated segment-marker" with `3` to give [3,2].
        var diff = segment_marker_1.compareSegments(bc.generatedSegment, ab.originalSegment);
        if (diff > 0) {
            return {
                name: name,
                generatedSegment: segment_marker_1.offsetSegment(generatedSource.startOfLinePositions, ab.generatedSegment, diff),
                originalSource: bc.originalSource,
                originalSegment: bc.originalSegment,
            };
        }
        else {
            return {
                name: name,
                generatedSegment: ab.generatedSegment,
                originalSource: bc.originalSource,
                originalSegment: segment_marker_1.offsetSegment(bc.originalSource.startOfLinePositions, bc.originalSegment, -diff),
            };
        }
    }
    exports.mergeMappings = mergeMappings;
    /**
     * Parse the `rawMappings` into an array of parsed mappings, which reference source-files provided
     * in the `sources` parameter.
     */
    function parseMappings(rawMap, sources, generatedSourceStartOfLinePositions) {
        var e_2, _a;
        if (rawMap === null) {
            return [];
        }
        var rawMappings = sourcemap_codec_1.decode(rawMap.mappings);
        if (rawMappings === null) {
            return [];
        }
        var mappings = [];
        for (var generatedLine = 0; generatedLine < rawMappings.length; generatedLine++) {
            var generatedLineMappings = rawMappings[generatedLine];
            try {
                for (var generatedLineMappings_1 = (e_2 = void 0, tslib_1.__values(generatedLineMappings)), generatedLineMappings_1_1 = generatedLineMappings_1.next(); !generatedLineMappings_1_1.done; generatedLineMappings_1_1 = generatedLineMappings_1.next()) {
                    var rawMapping = generatedLineMappings_1_1.value;
                    if (rawMapping.length >= 4) {
                        var originalSource = sources[rawMapping[1]];
                        if (originalSource === null || originalSource === undefined) {
                            // the original source is missing so ignore this mapping
                            continue;
                        }
                        var generatedColumn = rawMapping[0];
                        var name_1 = rawMapping.length === 5 ? rawMap.names[rawMapping[4]] : undefined;
                        var line = rawMapping[2];
                        var column = rawMapping[3];
                        var generatedSegment = {
                            line: generatedLine,
                            column: generatedColumn,
                            position: generatedSourceStartOfLinePositions[generatedLine] + generatedColumn,
                            next: undefined,
                        };
                        var originalSegment = {
                            line: line,
                            column: column,
                            position: originalSource.startOfLinePositions[line] + column,
                            next: undefined,
                        };
                        mappings.push({ name: name_1, generatedSegment: generatedSegment, originalSegment: originalSegment, originalSource: originalSource });
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (generatedLineMappings_1_1 && !generatedLineMappings_1_1.done && (_a = generatedLineMappings_1.return)) _a.call(generatedLineMappings_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        return mappings;
    }
    exports.parseMappings = parseMappings;
    /**
     * Extract the segment markers from the original source files in each mapping of an array of
     * `mappings`.
     *
     * @param mappings The mappings whose original segments we want to extract
     * @returns Return a map from original source-files (referenced in the `mappings`) to arrays of
     * segment-markers sorted by their order in their source file.
     */
    function extractOriginalSegments(mappings) {
        var e_3, _a;
        var originalSegments = new Map();
        try {
            for (var mappings_1 = tslib_1.__values(mappings), mappings_1_1 = mappings_1.next(); !mappings_1_1.done; mappings_1_1 = mappings_1.next()) {
                var mapping = mappings_1_1.value;
                var originalSource = mapping.originalSource;
                if (!originalSegments.has(originalSource)) {
                    originalSegments.set(originalSource, []);
                }
                var segments = originalSegments.get(originalSource);
                segments.push(mapping.originalSegment);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (mappings_1_1 && !mappings_1_1.done && (_a = mappings_1.return)) _a.call(mappings_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        originalSegments.forEach(function (segmentMarkers) { return segmentMarkers.sort(segment_marker_1.compareSegments); });
        return originalSegments;
    }
    exports.extractOriginalSegments = extractOriginalSegments;
    /**
     * Update the original segments of each of the given `mappings` to include a link to the next
     * segment in the source file.
     *
     * @param mappings the mappings whose segments should be updated
     */
    function ensureOriginalSegmentLinks(mappings) {
        var segmentsBySource = extractOriginalSegments(mappings);
        segmentsBySource.forEach(function (markers) {
            for (var i = 0; i < markers.length - 1; i++) {
                markers[i].next = markers[i + 1];
            }
        });
    }
    exports.ensureOriginalSegmentLinks = ensureOriginalSegmentLinks;
    function computeStartOfLinePositions(str) {
        // The `1` is to indicate a newline character between the lines.
        // Note that in the actual contents there could be more than one character that indicates a
        // newline
        // - e.g. \r\n - but that is not important here since segment-markers are in line/column pairs and
        // so differences in length due to extra `\r` characters do not affect the algorithms.
        var NEWLINE_MARKER_OFFSET = 1;
        var lineLengths = computeLineLengths(str);
        var startPositions = [0]; // First line starts at position 0
        for (var i = 0; i < lineLengths.length - 1; i++) {
            startPositions.push(startPositions[i] + lineLengths[i] + NEWLINE_MARKER_OFFSET);
        }
        return startPositions;
    }
    exports.computeStartOfLinePositions = computeStartOfLinePositions;
    function computeLineLengths(str) {
        return (str.split(/\n/)).map(function (s) { return s.length; });
    }
    /**
     * A collection of mappings between `keys` and `values` stored in the order in which the keys are
     * first seen.
     *
     * The difference between this and a standard `Map` is that when you add a key-value pair the index
     * of the `key` is returned.
     */
    var IndexedMap = /** @class */ (function () {
        function IndexedMap() {
            this.map = new Map();
            /**
             * An array of keys added to this map.
             *
             * This array is guaranteed to be in the order of the first time the key was added to the map.
             */
            this.keys = [];
            /**
             * An array of values added to this map.
             *
             * This array is guaranteed to be in the order of the first time the associated key was added to
             * the map.
             */
            this.values = [];
        }
        /**
         * Associate the `value` with the `key` and return the index of the key in the collection.
         *
         * If the `key` already exists then the `value` is not set and the index of that `key` is
         * returned; otherwise the `key` and `value` are stored and the index of the new `key` is
         * returned.
         *
         * @param key the key to associated with the `value`.
         * @param value the value to associated with the `key`.
         * @returns the index of the `key` in the `keys` array.
         */
        IndexedMap.prototype.set = function (key, value) {
            if (this.map.has(key)) {
                return this.map.get(key);
            }
            var index = this.values.push(value) - 1;
            this.keys.push(key);
            this.map.set(key, index);
            return index;
        };
        return IndexedMap;
    }());
    /**
     * A collection of `values` stored in the order in which they were added.
     *
     * The difference between this and a standard `Set` is that when you add a value the index of that
     * item is returned.
     */
    var IndexedSet = /** @class */ (function () {
        function IndexedSet() {
            this.map = new Map();
            /**
             * An array of values added to this set.
             * This array is guaranteed to be in the order of the first time the value was added to the set.
             */
            this.values = [];
        }
        /**
         * Add the `value` to the `values` array, if it doesn't already exist; returning the index of the
         * `value` in the `values` array.
         *
         * If the `value` already exists then the index of that `value` is returned, otherwise the new
         * `value` is stored and the new index returned.
         *
         * @param value the value to add to the set.
         * @returns the index of the `value` in the `values` array.
         */
        IndexedSet.prototype.add = function (value) {
            if (this.map.has(value)) {
                return this.map.get(value);
            }
            var index = this.values.push(value) - 1;
            this.map.set(value, index);
            return index;
        };
        return IndexedSet;
    }());
    var Cache = /** @class */ (function () {
        function Cache(computeFn) {
            this.computeFn = computeFn;
            this.map = new Map();
        }
        Cache.prototype.get = function (input) {
            if (!this.map.has(input)) {
                this.map.set(input, this.computeFn(input));
            }
            return this.map.get(input);
        };
        return Cache;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3NvdXJjZW1hcHMvc3JjL3NvdXJjZV9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCx5REFBeUU7SUFDekUsbURBQW9GO0lBS3BGLGdHQUErRTtJQUUvRSxTQUFnQix1QkFBdUIsQ0FBQyxRQUFnQjtRQUN0RCxPQUFPLDBDQUFxQixDQUFDLG1DQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFGRCwwREFFQztJQUVEO1FBV0U7UUFDSSxvQ0FBb0M7UUFDM0IsVUFBMEI7UUFDbkMsd0NBQXdDO1FBQy9CLFFBQWdCO1FBQ3pCLGtFQUFrRTtRQUN6RCxNQUEwQjtRQUNuQywwRkFBMEY7UUFDakYsT0FBNEIsRUFDN0IsRUFBb0I7WUFQbkIsZUFBVSxHQUFWLFVBQVUsQ0FBZ0I7WUFFMUIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUVoQixXQUFNLEdBQU4sTUFBTSxDQUFvQjtZQUUxQixZQUFPLEdBQVAsT0FBTyxDQUFxQjtZQUM3QixPQUFFLEdBQUYsRUFBRSxDQUFrQjtZQUU5QixJQUFJLENBQUMsUUFBUSxHQUFHLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxvQkFBb0IsR0FBRywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNsRCxDQUFDO1FBRUQ7O1dBRUc7UUFDSCw2Q0FBd0IsR0FBeEI7O1lBQUEsaUJBMkNDO1lBMUNDLElBQU0sT0FBTyxHQUFHLElBQUksVUFBVSxFQUFr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QU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUNILGlCQUFDO0lBQUQsQ0FBQyxBQTNCRCxJQTJCQztJQUVEO1FBRUUsZUFBb0IsU0FBbUM7WUFBbkMsY0FBUyxHQUFULFNBQVMsQ0FBMEI7WUFEL0MsUUFBRyxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1FBQ21CLENBQUM7UUFDM0QsbUJBQUcsR0FBSCxVQUFJLEtBQVk7WUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDNUM7WUFDRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxDQUFDO1FBQzlCLENBQUM7UUFDSCxZQUFDO0lBQUQsQ0FBQyxBQVRELElBU0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVtb3ZlQ29tbWVudHMsIHJlbW92ZU1hcEZpbGVDb21tZW50c30gZnJvbSAnY29udmVydC1zb3VyY2UtbWFwJztcbmltcG9ydCB7ZGVjb2RlLCBlbmNvZGUsIFNvdXJjZU1hcE1hcHBpbmdzLCBTb3VyY2VNYXBTZWdtZW50fSBmcm9tICdzb3VyY2VtYXAtY29kZWMnO1xuXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBQYXRoTWFuaXB1bGF0aW9ufSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5cbmltcG9ydCB7UmF3U291cmNlTWFwLCBTb3VyY2VNYXBJbmZvfSBmcm9tICcuL3Jhd19zb3VyY2VfbWFwJztcbmltcG9ydCB7Y29tcGFyZVNlZ21lbnRzLCBvZmZzZXRTZWdtZW50LCBTZWdtZW50TWFya2VyfSBmcm9tICcuL3NlZ21lbnRfbWFya2VyJztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVNvdXJjZU1hcENvbW1lbnRzKGNvbnRlbnRzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcmVtb3ZlTWFwRmlsZUNvbW1lbnRzKHJlbW92ZUNvbW1lbnRzKGNvbnRlbnRzKSkucmVwbGFjZSgvXFxuXFxuJC8sICdcXG4nKTtcbn1cblxuZXhwb3J0IGNsYXNzIFNvdXJjZUZpbGUge1xuICAvKipcbiAgICogVGhlIHBhcnNlZCBtYXBwaW5ncyB0aGF0IGhhdmUgYmVlbiBmbGF0dGVuZWQgc28gdGhhdCBhbnkgaW50ZXJtZWRpYXRlIHNvdXJjZSBtYXBwaW5ncyBoYXZlIGJlZW5cbiAgICogZmxhdHRlbmVkLlxuICAgKlxuICAgKiBUaGUgcmVzdWx0IGlzIHRoYXQgYW55IHNvdXJjZSBmaWxlIG1lbnRpb25lZCBpbiB0aGUgZmxhdHRlbmVkIG1hcHBpbmdzIGhhdmUgbm8gc291cmNlIG1hcCAoYXJlXG4gICAqIHB1cmUgb3JpZ2luYWwgc291cmNlIGZpbGVzKS5cbiAgICovXG4gIHJlYWRvbmx5IGZsYXR0ZW5lZE1hcHBpbmdzOiBNYXBwaW5nW107XG4gIHJlYWRvbmx5IHN0YXJ0T2ZMaW5lUG9zaXRpb25zOiBudW1iZXJbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBUaGUgcGF0aCB0byB0aGlzIHNvdXJjZSBmaWxlLiAqL1xuICAgICAgcmVhZG9ubHkgc291cmNlUGF0aDogQWJzb2x1dGVGc1BhdGgsXG4gICAgICAvKiogVGhlIGNvbnRlbnRzIG9mIHRoaXMgc291cmNlIGZpbGUuICovXG4gICAgICByZWFkb25seSBjb250ZW50czogc3RyaW5nLFxuICAgICAgLyoqIFRoZSByYXcgc291cmNlIG1hcCAoaWYgYW55KSByZWZlcmVuY2VkIGJ5IHRoaXMgc291cmNlIGZpbGUuICovXG4gICAgICByZWFkb25seSByYXdNYXA6IFNvdXJjZU1hcEluZm98bnVsbCxcbiAgICAgIC8qKiBBbnkgc291cmNlIGZpbGVzIHJlZmVyZW5jZWQgYnkgdGhlIHJhdyBzb3VyY2UgbWFwIGFzc29jaWF0ZWQgd2l0aCB0aGlzIHNvdXJjZSBmaWxlLiAqL1xuICAgICAgcmVhZG9ubHkgc291cmNlczogKFNvdXJjZUZpbGV8bnVsbClbXSxcbiAgICAgIHByaXZhdGUgZnM6IFBhdGhNYW5pcHVsYXRpb24sXG4gICkge1xuICAgIHRoaXMuY29udGVudHMgPSByZW1vdmVTb3VyY2VNYXBDb21tZW50cyhjb250ZW50cyk7XG4gICAgdGhpcy5zdGFydE9mTGluZVBvc2l0aW9ucyA9IGNvbXB1dGVTdGFydE9mTGluZVBvc2l0aW9ucyh0aGlzLmNvbnRlbnRzKTtcbiAgICB0aGlzLmZsYXR0ZW5lZE1hcHBpbmdzID0gdGhpcy5mbGF0dGVuTWFwcGluZ3MoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIHJhdyBzb3VyY2UgbWFwIGdlbmVyYXRlZCBmcm9tIHRoZSBmbGF0dGVuZWQgbWFwcGluZ3MuXG4gICAqL1xuICByZW5kZXJGbGF0dGVuZWRTb3VyY2VNYXAoKTogUmF3U291cmNlTWFwIHtcbiAgICBjb25zdCBzb3VyY2VzID0gbmV3IEluZGV4ZWRNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gICAgY29uc3QgbmFtZXMgPSBuZXcgSW5kZXhlZFNldDxzdHJpbmc+KCk7XG4gICAgY29uc3QgbWFwcGluZ3M6IFNvdXJjZU1hcE1hcHBpbmdzID0gW107XG4gICAgY29uc3Qgc291cmNlUGF0aERpciA9IHRoaXMuZnMuZGlybmFtZSh0aGlzLnNvdXJjZVBhdGgpO1xuICAgIC8vIENvbXB1dGluZyB0aGUgcmVsYXRpdmUgcGF0aCBjYW4gYmUgZXhwZW5zaXZlLCBhbmQgd2UgYXJlIGxpa2VseSB0byBoYXZlIHRoZSBzYW1lIHBhdGggZm9yXG4gICAgLy8gbWFueSAoaWYgbm90IGFsbCEpIG1hcHBpbmdzLlxuICAgIGNvbnN0IHJlbGF0aXZlU291cmNlUGF0aENhY2hlID1cbiAgICAgICAgbmV3IENhY2hlPHN0cmluZywgc3RyaW5nPihpbnB1dCA9PiB0aGlzLmZzLnJlbGF0aXZlKHNvdXJjZVBhdGhEaXIsIGlucHV0KSk7XG5cbiAgICBmb3IgKGNvbnN0IG1hcHBpbmcgb2YgdGhpcy5mbGF0dGVuZWRNYXBwaW5ncykge1xuICAgICAgY29uc3Qgc291cmNlSW5kZXggPSBzb3VyY2VzLnNldChcbiAgICAgICAgICByZWxhdGl2ZVNvdXJjZVBhdGhDYWNoZS5nZXQobWFwcGluZy5vcmlnaW5hbFNvdXJjZS5zb3VyY2VQYXRoKSxcbiAgICAgICAgICBtYXBwaW5nLm9yaWdpbmFsU291cmNlLmNvbnRlbnRzKTtcbiAgICAgIGNvbnN0IG1hcHBpbmdBcnJheTogU291cmNlTWFwU2VnbWVudCA9IFtcbiAgICAgICAgbWFwcGluZy5nZW5lcmF0ZWRTZWdtZW50LmNvbHVtbixcbiAgICAgICAgc291cmNlSW5kZXgsXG4gICAgICAgIG1hcHBpbmcub3JpZ2luYWxTZWdtZW50LmxpbmUsXG4gICAgICAgIG1hcHBpbmcub3JpZ2luYWxTZWdtZW50LmNvbHVtbixcbiAgICAgIF07XG4gICAgICBpZiAobWFwcGluZy5uYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgbmFtZUluZGV4ID0gbmFtZXMuYWRkKG1hcHBpbmcubmFtZSk7XG4gICAgICAgIG1hcHBpbmdBcnJheS5wdXNoKG5hbWVJbmRleCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEVuc3VyZSBhIG1hcHBpbmcgbGluZSBhcnJheSBmb3IgdGhpcyBtYXBwaW5nLlxuICAgICAgY29uc3QgbGluZSA9IG1hcHBpbmcuZ2VuZXJhdGVkU2VnbWVudC5saW5lO1xuICAgICAgd2hpbGUgKGxpbmUgPj0gbWFwcGluZ3MubGVuZ3RoKSB7XG4gICAgICAgIG1hcHBpbmdzLnB1c2goW10pO1xuICAgICAgfVxuICAgICAgLy8gQWRkIHRoaXMgbWFwcGluZyB0byB0aGUgbGluZVxuICAgICAgbWFwcGluZ3NbbGluZV0ucHVzaChtYXBwaW5nQXJyYXkpO1xuICAgIH1cblxuICAgIGNvbnN0IHNvdXJjZU1hcDogUmF3U291cmNlTWFwID0ge1xuICAgICAgdmVyc2lvbjogMyxcbiAgICAgIGZpbGU6IHRoaXMuZnMucmVsYXRpdmUoc291cmNlUGF0aERpciwgdGhpcy5zb3VyY2VQYXRoKSxcbiAgICAgIHNvdXJjZXM6IHNvdXJjZXMua2V5cyxcbiAgICAgIG5hbWVzOiBuYW1lcy52YWx1ZXMsXG4gICAgICBtYXBwaW5nczogZW5jb2RlKG1hcHBpbmdzKSxcbiAgICAgIHNvdXJjZXNDb250ZW50OiBzb3VyY2VzLnZhbHVlcyxcbiAgICB9O1xuICAgIHJldHVybiBzb3VyY2VNYXA7XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUgb3JpZ2luYWwgbWFwcGVkIGxvY2F0aW9uIGZvciB0aGUgZ2l2ZW4gYGxpbmVgIGFuZCBgY29sdW1uYCBpbiB0aGUgZ2VuZXJhdGVkIGZpbGUuXG4gICAqXG4gICAqIEZpcnN0IHdlIHNlYXJjaCBmb3IgYSBtYXBwaW5nIHdob3NlIGdlbmVyYXRlZCBzZWdtZW50IGlzIGF0IG9yIGRpcmVjdGx5IGJlZm9yZSB0aGUgZ2l2ZW5cbiAgICogbG9jYXRpb24uIFRoZW4gd2UgY29tcHV0ZSB0aGUgb2Zmc2V0IGJldHdlZW4gdGhlIGdpdmVuIGxvY2F0aW9uIGFuZCB0aGUgbWF0Y2hpbmcgZ2VuZXJhdGVkXG4gICAqIHNlZ21lbnQuIEZpbmFsbHkgd2UgYXBwbHkgdGhpcyBvZmZzZXQgdG8gdGhlIG9yaWdpbmFsIHNvdXJjZSBzZWdtZW50IHRvIGdldCB0aGUgZGVzaXJlZFxuICAgKiBvcmlnaW5hbCBsb2NhdGlvbi5cbiAgICovXG4gIGdldE9yaWdpbmFsTG9jYXRpb24obGluZTogbnVtYmVyLCBjb2x1bW46IG51bWJlcik6XG4gICAgICB7ZmlsZTogQWJzb2x1dGVGc1BhdGgsIGxpbmU6IG51bWJlciwgY29sdW1uOiBudW1iZXJ9fG51bGwge1xuICAgIGlmICh0aGlzLmZsYXR0ZW5lZE1hcHBpbmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHBvc2l0aW9uOiBudW1iZXI7XG4gICAgaWYgKGxpbmUgPCB0aGlzLnN0YXJ0T2ZMaW5lUG9zaXRpb25zLmxlbmd0aCkge1xuICAgICAgcG9zaXRpb24gPSB0aGlzLnN0YXJ0T2ZMaW5lUG9zaXRpb25zW2xpbmVdICsgY29sdW1uO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgbGluZSBpcyBvZmYgdGhlIGVuZCBvZiB0aGUgZmlsZSwgc28ganVzdCBhc3N1bWUgd2UgYXJlIGF0IHRoZSBlbmQgb2YgdGhlIGZpbGUuXG4gICAgICBwb3NpdGlvbiA9IHRoaXMuY29udGVudHMubGVuZ3RoO1xuICAgIH1cblxuICAgIGNvbnN0IGxvY2F0aW9uU2VnbWVudDogU2VnbWVudE1hcmtlciA9IHtsaW5lLCBjb2x1bW4sIHBvc2l0aW9uLCBuZXh0OiB1bmRlZmluZWR9O1xuXG4gICAgbGV0IG1hcHBpbmdJbmRleCA9XG4gICAgICAgIGZpbmRMYXN0TWFwcGluZ0luZGV4QmVmb3JlKHRoaXMuZmxhdHRlbmVkTWFwcGluZ3MsIGxvY2F0aW9uU2VnbWVudCwgZmFsc2UsIDApO1xuICAgIGlmIChtYXBwaW5nSW5kZXggPCAwKSB7XG4gICAgICBtYXBwaW5nSW5kZXggPSAwO1xuICAgIH1cbiAgICBjb25zdCB7b3JpZ2luYWxTZWdtZW50LCBvcmlnaW5hbFNvdXJjZSwgZ2VuZXJhdGVkU2VnbWVudH0gPVxuICAgICAgICB0aGlzLmZsYXR0ZW5lZE1hcHBpbmdzW21hcHBpbmdJbmRleF07XG4gICAgY29uc3Qgb2Zmc2V0ID0gbG9jYXRpb25TZWdtZW50LnBvc2l0aW9uIC0gZ2VuZXJhdGVkU2VnbWVudC5wb3NpdGlvbjtcbiAgICBjb25zdCBvZmZzZXRPcmlnaW5hbFNlZ21lbnQgPVxuICAgICAgICBvZmZzZXRTZWdtZW50KG9yaWdpbmFsU291cmNlLnN0YXJ0T2ZMaW5lUG9zaXRpb25zLCBvcmlnaW5hbFNlZ21lbnQsIG9mZnNldCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZmlsZTogb3JpZ2luYWxTb3VyY2Uuc291cmNlUGF0aCxcbiAgICAgIGxpbmU6IG9mZnNldE9yaWdpbmFsU2VnbWVudC5saW5lLFxuICAgICAgY29sdW1uOiBvZmZzZXRPcmlnaW5hbFNlZ21lbnQuY29sdW1uLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRmxhdHRlbiB0aGUgcGFyc2VkIG1hcHBpbmdzIGZvciB0aGlzIHNvdXJjZSBmaWxlLCBzbyB0aGF0IGFsbCB0aGUgbWFwcGluZ3MgYXJlIHRvIHB1cmUgb3JpZ2luYWxcbiAgICogc291cmNlIGZpbGVzIHdpdGggbm8gdHJhbnNpdGl2ZSBzb3VyY2UgbWFwcy5cbiAgICovXG4gIHByaXZhdGUgZmxhdHRlbk1hcHBpbmdzKCk6IE1hcHBpbmdbXSB7XG4gICAgY29uc3QgbWFwcGluZ3MgPVxuICAgICAgICBwYXJzZU1hcHBpbmdzKHRoaXMucmF3TWFwICYmIHRoaXMucmF3TWFwLm1hcCwgdGhpcy5zb3VyY2VzLCB0aGlzLnN0YXJ0T2ZMaW5lUG9zaXRpb25zKTtcbiAgICBlbnN1cmVPcmlnaW5hbFNlZ21lbnRMaW5rcyhtYXBwaW5ncyk7XG4gICAgY29uc3QgZmxhdHRlbmVkTWFwcGluZ3M6IE1hcHBpbmdbXSA9IFtdO1xuICAgIGZvciAobGV0IG1hcHBpbmdJbmRleCA9IDA7IG1hcHBpbmdJbmRleCA8IG1hcHBpbmdzLmxlbmd0aDsgbWFwcGluZ0luZGV4KyspIHtcbiAgICAgIGNvbnN0IGFUb0JtYXBwaW5nID0gbWFwcGluZ3NbbWFwcGluZ0luZGV4XTtcbiAgICAgIGNvbnN0IGJTb3VyY2UgPSBhVG9CbWFwcGluZy5vcmlnaW5hbFNvdXJjZTtcbiAgICAgIGlmIChiU291cmNlLmZsYXR0ZW5lZE1hcHBpbmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyBUaGUgYiBzb3VyY2UgZmlsZSBoYXMgbm8gbWFwcGluZ3Mgb2YgaXRzIG93biAoaS5lLiBpdCBpcyBhIHB1cmUgb3JpZ2luYWwgZmlsZSlcbiAgICAgICAgLy8gc28ganVzdCB1c2UgdGhlIG1hcHBpbmcgYXMtaXMuXG4gICAgICAgIGZsYXR0ZW5lZE1hcHBpbmdzLnB1c2goYVRvQm1hcHBpbmcpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGBpbmNvbWluZ1N0YXJ0YCBhbmQgYGluY29taW5nRW5kYCBhcmUgdGhlIGBTZWdtZW50TWFya2VyYHMgaW4gYEJgIHRoYXQgcmVwcmVzZW50IHRoZVxuICAgICAgLy8gc2VjdGlvbiBvZiBgQmAgc291cmNlIGZpbGUgdGhhdCBpcyBiZWluZyBtYXBwZWQgdG8gYnkgdGhlIGN1cnJlbnQgYGFUb0JtYXBwaW5nYC5cbiAgICAgIC8vXG4gICAgICAvLyBGb3IgZXhhbXBsZSwgY29uc2lkZXIgdGhlIG1hcHBpbmdzIGZyb20gQSB0byBCOlxuICAgICAgLy9cbiAgICAgIC8vIHNyYyBBICAgc3JjIEIgICAgIG1hcHBpbmdcbiAgICAgIC8vXG4gICAgICAvLyAgIGEgLS0tLS0gYSAgICAgICBbMCwgMF1cbiAgICAgIC8vICAgYiAgICAgICBiXG4gICAgICAvLyAgIGYgLSAgLy0gYyAgICAgICBbNCwgMl1cbiAgICAgIC8vICAgZyAgXFwgLyAgZFxuICAgICAgLy8gICBjIC0vXFwgICBlXG4gICAgICAvLyAgIGQgICAgXFwtIGYgICAgICAgWzIsIDVdXG4gICAgICAvLyAgIGVcbiAgICAgIC8vXG4gICAgICAvLyBGb3IgbWFwcGluZyBbMCwwXSB0aGUgaW5jb21pbmcgc3RhcnQgYW5kIGVuZCBhcmUgMCBhbmQgMiAoaS5lLiB0aGUgcmFuZ2UgYSwgYiwgYylcbiAgICAgIC8vIEZvciBtYXBwaW5nIFs0LDJdIHRoZSBpbmNvbWluZyBzdGFydCBhbmQgZW5kIGFyZSAyIGFuZCA1IChpLmUuIHRoZSByYW5nZSBjLCBkLCBlLCBmKVxuICAgICAgLy9cbiAgICAgIGNvbnN0IGluY29taW5nU3RhcnQgPSBhVG9CbWFwcGluZy5vcmlnaW5hbFNlZ21lbnQ7XG4gICAgICBjb25zdCBpbmNvbWluZ0VuZCA9IGluY29taW5nU3RhcnQubmV4dDtcblxuICAgICAgLy8gVGhlIGBvdXRnb2luZ1N0YXJ0SW5kZXhgIGFuZCBgb3V0Z29pbmdFbmRJbmRleGAgYXJlIHRoZSBpbmRpY2VzIG9mIHRoZSByYW5nZSBvZiBtYXBwaW5nc1xuICAgICAgLy8gdGhhdCBsZWF2ZSBgYmAgdGhhdCB3ZSBhcmUgaW50ZXJlc3RlZCBpbiBtZXJnaW5nIHdpdGggdGhlIGFUb0JtYXBwaW5nLlxuICAgICAgLy8gV2UgYWN0dWFsbHkgY2FyZSBhYm91dCBhbGwgdGhlIG1hcmtlcnMgZnJvbSB0aGUgbGFzdCBiVG9DbWFwcGluZyBkaXJlY3RseSBiZWZvcmUgdGhlXG4gICAgICAvLyBgaW5jb21pbmdTdGFydGAgdG8gdGhlIGxhc3QgYlRvQ21hcGluZyBkaXJlY3RseSBiZWZvcmUgdGhlIGBpbmNvbWluZ0VuZGAsIGluY2x1c2l2ZS5cbiAgICAgIC8vXG4gICAgICAvLyBGb3IgZXhhbXBsZSwgaWYgd2UgY29uc2lkZXIgdGhlIHJhbmdlIDIgdG8gNSBmcm9tIGFib3ZlIChpLmUuIGMsIGQsIGUsIGYpIHdpdGggdGhlXG4gICAgICAvLyBmb2xsb3dpbmcgbWFwcGluZ3MgZnJvbSBCIHRvIEM6XG4gICAgICAvL1xuICAgICAgLy8gICBzcmMgQiAgIHNyYyBDICAgICBtYXBwaW5nXG4gICAgICAvLyAgICAgYVxuICAgICAgLy8gICAgIGIgLS0tLS0gYiAgICAgICBbMSwgMF1cbiAgICAgIC8vICAgLSBjICAgICAgIGNcbiAgICAgIC8vICB8ICBkICAgICAgIGRcbiAgICAgIC8vICB8ICBlIC0tLS0tIDEgICAgICAgWzQsIDNdXG4gICAgICAvLyAgIC0gZiAgXFwgICAgMlxuICAgICAgLy8gICAgICAgICBcXCAgIDNcbiAgICAgIC8vICAgICAgICAgIFxcLSBlICAgICAgIFs0LCA2XVxuICAgICAgLy9cbiAgICAgIC8vIFRoZSByYW5nZSB3aXRoIGBpbmNvbWluZ1N0YXJ0YCBhdCAyIGFuZCBgaW5jb21pbmdFbmRgIGF0IDUgaGFzIG91dGdvaW5nIHN0YXJ0IG1hcHBpbmcgb2ZcbiAgICAgIC8vIFsxLDBdIGFuZCBvdXRnb2luZyBlbmQgbWFwcGluZyBvZiBbNCwgNl0sIHdoaWNoIGFsc28gaW5jbHVkZXMgWzQsIDNdLlxuICAgICAgLy9cbiAgICAgIGxldCBvdXRnb2luZ1N0YXJ0SW5kZXggPVxuICAgICAgICAgIGZpbmRMYXN0TWFwcGluZ0luZGV4QmVmb3JlKGJTb3VyY2UuZmxhdHRlbmVkTWFwcGluZ3MsIGluY29taW5nU3RhcnQsIGZhbHNlLCAwKTtcbiAgICAgIGlmIChvdXRnb2luZ1N0YXJ0SW5kZXggPCAwKSB7XG4gICAgICAgIG91dGdvaW5nU3RhcnRJbmRleCA9IDA7XG4gICAgICB9XG4gICAgICBjb25zdCBvdXRnb2luZ0VuZEluZGV4ID0gaW5jb21pbmdFbmQgIT09IHVuZGVmaW5lZCA/XG4gICAgICAgICAgZmluZExhc3RNYXBwaW5nSW5kZXhCZWZvcmUoXG4gICAgICAgICAgICAgIGJTb3VyY2UuZmxhdHRlbmVkTWFwcGluZ3MsIGluY29taW5nRW5kLCB0cnVlLCBvdXRnb2luZ1N0YXJ0SW5kZXgpIDpcbiAgICAgICAgICBiU291cmNlLmZsYXR0ZW5lZE1hcHBpbmdzLmxlbmd0aCAtIDE7XG5cbiAgICAgIGZvciAobGV0IGJUb0NtYXBwaW5nSW5kZXggPSBvdXRnb2luZ1N0YXJ0SW5kZXg7IGJUb0NtYXBwaW5nSW5kZXggPD0gb3V0Z29pbmdFbmRJbmRleDtcbiAgICAgICAgICAgYlRvQ21hcHBpbmdJbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IGJUb0NtYXBwaW5nOiBNYXBwaW5nID0gYlNvdXJjZS5mbGF0dGVuZWRNYXBwaW5nc1tiVG9DbWFwcGluZ0luZGV4XTtcbiAgICAgICAgZmxhdHRlbmVkTWFwcGluZ3MucHVzaChtZXJnZU1hcHBpbmdzKHRoaXMsIGFUb0JtYXBwaW5nLCBiVG9DbWFwcGluZykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmxhdHRlbmVkTWFwcGluZ3M7XG4gIH1cbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIG1hcHBpbmdzIFRoZSBjb2xsZWN0aW9uIG9mIG1hcHBpbmdzIHdob3NlIHNlZ21lbnQtbWFya2VycyB3ZSBhcmUgc2VhcmNoaW5nLlxuICogQHBhcmFtIG1hcmtlciBUaGUgc2VnbWVudC1tYXJrZXIgdG8gbWF0Y2ggYWdhaW5zdCB0aG9zZSBvZiB0aGUgZ2l2ZW4gYG1hcHBpbmdzYC5cbiAqIEBwYXJhbSBleGNsdXNpdmUgSWYgZXhjbHVzaXZlIHRoZW4gd2UgbXVzdCBmaW5kIGEgbWFwcGluZyB3aXRoIGEgc2VnbWVudC1tYXJrZXIgdGhhdCBpc1xuICogZXhjbHVzaXZlbHkgZWFybGllciB0aGFuIHRoZSBnaXZlbiBgbWFya2VyYC5cbiAqIElmIG5vdCBleGNsdXNpdmUgdGhlbiB3ZSBjYW4gcmV0dXJuIHRoZSBoaWdoZXN0IG1hcHBpbmdzIHdpdGggYW4gZXF1aXZhbGVudCBzZWdtZW50LW1hcmtlciB0byB0aGVcbiAqIGdpdmVuIGBtYXJrZXJgLlxuICogQHBhcmFtIGxvd2VySW5kZXggSWYgcHJvdmlkZWQsIHRoaXMgaXMgdXNlZCBhcyBhIGhpbnQgdGhhdCB0aGUgbWFya2VyIHdlIGFyZSBzZWFyY2hpbmcgZm9yIGhhcyBhblxuICogaW5kZXggdGhhdCBpcyBubyBsb3dlciB0aGFuIHRoaXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kTGFzdE1hcHBpbmdJbmRleEJlZm9yZShcbiAgICBtYXBwaW5nczogTWFwcGluZ1tdLCBtYXJrZXI6IFNlZ21lbnRNYXJrZXIsIGV4Y2x1c2l2ZTogYm9vbGVhbiwgbG93ZXJJbmRleDogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IHVwcGVySW5kZXggPSBtYXBwaW5ncy5sZW5ndGggLSAxO1xuICBjb25zdCB0ZXN0ID0gZXhjbHVzaXZlID8gLTEgOiAwO1xuXG4gIGlmIChjb21wYXJlU2VnbWVudHMobWFwcGluZ3NbbG93ZXJJbmRleF0uZ2VuZXJhdGVkU2VnbWVudCwgbWFya2VyKSA+IHRlc3QpIHtcbiAgICAvLyBFeGl0IGVhcmx5IHNpbmNlIHRoZSBtYXJrZXIgaXMgb3V0c2lkZSB0aGUgYWxsb3dlZCByYW5nZSBvZiBtYXBwaW5ncy5cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBsZXQgbWF0Y2hpbmdJbmRleCA9IC0xO1xuICB3aGlsZSAobG93ZXJJbmRleCA8PSB1cHBlckluZGV4KSB7XG4gICAgY29uc3QgaW5kZXggPSAodXBwZXJJbmRleCArIGxvd2VySW5kZXgpID4+IDE7XG4gICAgaWYgKGNvbXBhcmVTZWdtZW50cyhtYXBwaW5nc1tpbmRleF0uZ2VuZXJhdGVkU2VnbWVudCwgbWFya2VyKSA8PSB0ZXN0KSB7XG4gICAgICBtYXRjaGluZ0luZGV4ID0gaW5kZXg7XG4gICAgICBsb3dlckluZGV4ID0gaW5kZXggKyAxO1xuICAgIH0gZWxzZSB7XG4gICAgICB1cHBlckluZGV4ID0gaW5kZXggLSAxO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbWF0Y2hpbmdJbmRleDtcbn1cblxuLyoqXG4gKiBBIE1hcHBpbmcgY29uc2lzdHMgb2YgdHdvIHNlZ21lbnQgbWFya2Vyczogb25lIGluIHRoZSBnZW5lcmF0ZWQgc291cmNlIGFuZCBvbmUgaW4gdGhlIG9yaWdpbmFsXG4gKiBzb3VyY2UsIHdoaWNoIGluZGljYXRlIHRoZSBzdGFydCBvZiBlYWNoIHNlZ21lbnQuIFRoZSBlbmQgb2YgYSBzZWdtZW50IGlzIGluZGljYXRlZCBieSB0aGUgZmlyc3RcbiAqIHNlZ21lbnQgbWFya2VyIG9mIGFub3RoZXIgbWFwcGluZyB3aG9zZSBzdGFydCBpcyBncmVhdGVyIG9yIGVxdWFsIHRvIHRoaXMgb25lLlxuICpcbiAqIEl0IG1heSBhbHNvIGluY2x1ZGUgYSBuYW1lIGFzc29jaWF0ZWQgd2l0aCB0aGUgc2VnbWVudCBiZWluZyBtYXBwZWQuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWFwcGluZyB7XG4gIHJlYWRvbmx5IGdlbmVyYXRlZFNlZ21lbnQ6IFNlZ21lbnRNYXJrZXI7XG4gIHJlYWRvbmx5IG9yaWdpbmFsU291cmNlOiBTb3VyY2VGaWxlO1xuICByZWFkb25seSBvcmlnaW5hbFNlZ21lbnQ6IFNlZ21lbnRNYXJrZXI7XG4gIHJlYWRvbmx5IG5hbWU/OiBzdHJpbmc7XG59XG5cblxuXG4vKipcbiAqIE1lcmdlIHR3byBtYXBwaW5ncyB0aGF0IGdvIGZyb20gQSB0byBCIGFuZCBCIHRvIEMsIHRvIHJlc3VsdCBpbiBhIG1hcHBpbmcgdGhhdCBnb2VzIGZyb20gQSB0byBDLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VNYXBwaW5ncyhnZW5lcmF0ZWRTb3VyY2U6IFNvdXJjZUZpbGUsIGFiOiBNYXBwaW5nLCBiYzogTWFwcGluZyk6IE1hcHBpbmcge1xuICBjb25zdCBuYW1lID0gYmMubmFtZSB8fCBhYi5uYW1lO1xuXG4gIC8vIFdlIG5lZWQgdG8gbW9kaWZ5IHRoZSBzZWdtZW50LW1hcmtlcnMgb2YgdGhlIG5ldyBtYXBwaW5nIHRvIHRha2UgaW50byBhY2NvdW50IHRoZSBzaGlmdHMgdGhhdFxuICAvLyBvY2N1ciBkdWUgdG8gdGhlIGNvbWJpbmF0aW9uIG9mIHRoZSB0d28gbWFwcGluZ3MuXG4gIC8vIEZvciBleGFtcGxlOlxuXG4gIC8vICogU2ltcGxlIG1hcCB3aGVyZSB0aGUgQi0+QyBzdGFydHMgYXQgdGhlIHNhbWUgcGxhY2UgdGhlIEEtPkIgZW5kczpcbiAgLy9cbiAgLy8gYGBgXG4gIC8vIEE6IDEgMiBiIGMgZFxuICAvLyAgICAgICAgfCAgICAgICAgQS0+QiBbMiwwXVxuICAvLyAgICAgICAgfCAgICAgICAgICAgICAgfFxuICAvLyBCOiAgICAgYiBjIGQgICAgQS0+QyBbMiwxXVxuICAvLyAgICAgICAgfCAgICAgICAgICAgICAgICB8XG4gIC8vICAgICAgICB8ICAgICAgICBCLT5DIFswLDFdXG4gIC8vIEM6ICAgYSBiIGMgZCBlXG4gIC8vIGBgYFxuXG4gIC8vICogTW9yZSBjb21wbGljYXRlZCBjYXNlIHdoZXJlIGRpZmZzIG9mIHNlZ21lbnQtbWFya2VycyBpcyBuZWVkZWQ6XG4gIC8vXG4gIC8vIGBgYFxuICAvLyBBOiBiIDEgMiBjIGRcbiAgLy8gICAgIFxcXG4gIC8vICAgICAgfCAgICAgICAgICAgIEEtPkIgIFswLDEqXSAgICBbMCwxKl1cbiAgLy8gICAgICB8ICAgICAgICAgICAgICAgICAgIHwgICAgICAgICB8KzNcbiAgLy8gQjogYSBiIDEgMiBjIGQgICAgQS0+QyAgWzAsMV0gICAgIFszLDJdXG4gIC8vICAgIHwgICAgICAvICAgICAgICAgICAgICAgIHwrMSAgICAgICB8XG4gIC8vICAgIHwgICAgIC8gICAgICAgIEItPkMgWzAqLDBdICAgIFs0KiwyXVxuICAvLyAgICB8ICAgIC9cbiAgLy8gQzogYSBiIGMgZCBlXG4gIC8vIGBgYFxuICAvL1xuICAvLyBgWzAsMV1gIG1hcHBpbmcgZnJvbSBBLT5DOlxuICAvLyBUaGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBcIm9yaWdpbmFsIHNlZ21lbnQtbWFya2VyXCIgb2YgQS0+QiAoMSopIGFuZCB0aGUgXCJnZW5lcmF0ZWRcbiAgLy8gc2VnbWVudC1tYXJrZXIgb2YgQi0+QyAoMCopOiBgMSAtIDAgPSArMWAuXG4gIC8vIFNpbmNlIGl0IGlzIHBvc2l0aXZlIHdlIG11c3QgaW5jcmVtZW50IHRoZSBcIm9yaWdpbmFsIHNlZ21lbnQtbWFya2VyXCIgd2l0aCBgMWAgdG8gZ2l2ZSBbMCwxXS5cbiAgLy9cbiAgLy8gYFszLDJdYCBtYXBwaW5nIGZyb20gQS0+QzpcbiAgLy8gVGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgXCJvcmlnaW5hbCBzZWdtZW50LW1hcmtlclwiIG9mIEEtPkIgKDEqKSBhbmQgdGhlIFwiZ2VuZXJhdGVkXG4gIC8vIHNlZ21lbnQtbWFya2VyXCIgb2YgQi0+QyAoNCopOiBgMSAtIDQgPSAtM2AuXG4gIC8vIFNpbmNlIGl0IGlzIG5lZ2F0aXZlIHdlIG11c3QgaW5jcmVtZW50IHRoZSBcImdlbmVyYXRlZCBzZWdtZW50LW1hcmtlclwiIHdpdGggYDNgIHRvIGdpdmUgWzMsMl0uXG5cbiAgY29uc3QgZGlmZiA9IGNvbXBhcmVTZWdtZW50cyhiYy5nZW5lcmF0ZWRTZWdtZW50LCBhYi5vcmlnaW5hbFNlZ21lbnQpO1xuICBpZiAoZGlmZiA+IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSxcbiAgICAgIGdlbmVyYXRlZFNlZ21lbnQ6XG4gICAgICAgICAgb2Zmc2V0U2VnbWVudChnZW5lcmF0ZWRTb3VyY2Uuc3RhcnRPZkxpbmVQb3NpdGlvbnMsIGFiLmdlbmVyYXRlZFNlZ21lbnQsIGRpZmYpLFxuICAgICAgb3JpZ2luYWxTb3VyY2U6IGJjLm9yaWdpbmFsU291cmNlLFxuICAgICAgb3JpZ2luYWxTZWdtZW50OiBiYy5vcmlnaW5hbFNlZ21lbnQsXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZSxcbiAgICAgIGdlbmVyYXRlZFNlZ21lbnQ6IGFiLmdlbmVyYXRlZFNlZ21lbnQsXG4gICAgICBvcmlnaW5hbFNvdXJjZTogYmMub3JpZ2luYWxTb3VyY2UsXG4gICAgICBvcmlnaW5hbFNlZ21lbnQ6XG4gICAgICAgICAgb2Zmc2V0U2VnbWVudChiYy5vcmlnaW5hbFNvdXJjZS5zdGFydE9mTGluZVBvc2l0aW9ucywgYmMub3JpZ2luYWxTZWdtZW50LCAtZGlmZiksXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBgcmF3TWFwcGluZ3NgIGludG8gYW4gYXJyYXkgb2YgcGFyc2VkIG1hcHBpbmdzLCB3aGljaCByZWZlcmVuY2Ugc291cmNlLWZpbGVzIHByb3ZpZGVkXG4gKiBpbiB0aGUgYHNvdXJjZXNgIHBhcmFtZXRlci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTWFwcGluZ3MoXG4gICAgcmF3TWFwOiBSYXdTb3VyY2VNYXB8bnVsbCwgc291cmNlczogKFNvdXJjZUZpbGV8bnVsbClbXSxcbiAgICBnZW5lcmF0ZWRTb3VyY2VTdGFydE9mTGluZVBvc2l0aW9uczogbnVtYmVyW10pOiBNYXBwaW5nW10ge1xuICBpZiAocmF3TWFwID09PSBudWxsKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29uc3QgcmF3TWFwcGluZ3MgPSBkZWNvZGUocmF3TWFwLm1hcHBpbmdzKTtcbiAgaWYgKHJhd01hcHBpbmdzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29uc3QgbWFwcGluZ3M6IE1hcHBpbmdbXSA9IFtdO1xuICBmb3IgKGxldCBnZW5lcmF0ZWRMaW5lID0gMDsgZ2VuZXJhdGVkTGluZSA8IHJhd01hcHBpbmdzLmxlbmd0aDsgZ2VuZXJhdGVkTGluZSsrKSB7XG4gICAgY29uc3QgZ2VuZXJhdGVkTGluZU1hcHBpbmdzID0gcmF3TWFwcGluZ3NbZ2VuZXJhdGVkTGluZV07XG4gICAgZm9yIChjb25zdCByYXdNYXBwaW5nIG9mIGdlbmVyYXRlZExpbmVNYXBwaW5ncykge1xuICAgICAgaWYgKHJhd01hcHBpbmcubGVuZ3RoID49IDQpIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxTb3VyY2UgPSBzb3VyY2VzW3Jhd01hcHBpbmdbMV0hXTtcbiAgICAgICAgaWYgKG9yaWdpbmFsU291cmNlID09PSBudWxsIHx8IG9yaWdpbmFsU291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyB0aGUgb3JpZ2luYWwgc291cmNlIGlzIG1pc3Npbmcgc28gaWdub3JlIHRoaXMgbWFwcGluZ1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGdlbmVyYXRlZENvbHVtbiA9IHJhd01hcHBpbmdbMF07XG4gICAgICAgIGNvbnN0IG5hbWUgPSByYXdNYXBwaW5nLmxlbmd0aCA9PT0gNSA/IHJhd01hcC5uYW1lc1tyYXdNYXBwaW5nWzRdXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3QgbGluZSA9IHJhd01hcHBpbmdbMl0hO1xuICAgICAgICBjb25zdCBjb2x1bW4gPSByYXdNYXBwaW5nWzNdITtcbiAgICAgICAgY29uc3QgZ2VuZXJhdGVkU2VnbWVudDogU2VnbWVudE1hcmtlciA9IHtcbiAgICAgICAgICBsaW5lOiBnZW5lcmF0ZWRMaW5lLFxuICAgICAgICAgIGNvbHVtbjogZ2VuZXJhdGVkQ29sdW1uLFxuICAgICAgICAgIHBvc2l0aW9uOiBnZW5lcmF0ZWRTb3VyY2VTdGFydE9mTGluZVBvc2l0aW9uc1tnZW5lcmF0ZWRMaW5lXSArIGdlbmVyYXRlZENvbHVtbixcbiAgICAgICAgICBuZXh0OiB1bmRlZmluZWQsXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsU2VnbWVudDogU2VnbWVudE1hcmtlciA9IHtcbiAgICAgICAgICBsaW5lLFxuICAgICAgICAgIGNvbHVtbixcbiAgICAgICAgICBwb3NpdGlvbjogb3JpZ2luYWxTb3VyY2Uuc3RhcnRPZkxpbmVQb3NpdGlvbnNbbGluZV0gKyBjb2x1bW4sXG4gICAgICAgICAgbmV4dDogdW5kZWZpbmVkLFxuICAgICAgICB9O1xuICAgICAgICBtYXBwaW5ncy5wdXNoKHtuYW1lLCBnZW5lcmF0ZWRTZWdtZW50LCBvcmlnaW5hbFNlZ21lbnQsIG9yaWdpbmFsU291cmNlfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtYXBwaW5ncztcbn1cblxuLyoqXG4gKiBFeHRyYWN0IHRoZSBzZWdtZW50IG1hcmtlcnMgZnJvbSB0aGUgb3JpZ2luYWwgc291cmNlIGZpbGVzIGluIGVhY2ggbWFwcGluZyBvZiBhbiBhcnJheSBvZlxuICogYG1hcHBpbmdzYC5cbiAqXG4gKiBAcGFyYW0gbWFwcGluZ3MgVGhlIG1hcHBpbmdzIHdob3NlIG9yaWdpbmFsIHNlZ21lbnRzIHdlIHdhbnQgdG8gZXh0cmFjdFxuICogQHJldHVybnMgUmV0dXJuIGEgbWFwIGZyb20gb3JpZ2luYWwgc291cmNlLWZpbGVzIChyZWZlcmVuY2VkIGluIHRoZSBgbWFwcGluZ3NgKSB0byBhcnJheXMgb2ZcbiAqIHNlZ21lbnQtbWFya2VycyBzb3J0ZWQgYnkgdGhlaXIgb3JkZXIgaW4gdGhlaXIgc291cmNlIGZpbGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0T3JpZ2luYWxTZWdtZW50cyhtYXBwaW5nczogTWFwcGluZ1tdKTogTWFwPFNvdXJjZUZpbGUsIFNlZ21lbnRNYXJrZXJbXT4ge1xuICBjb25zdCBvcmlnaW5hbFNlZ21lbnRzID0gbmV3IE1hcDxTb3VyY2VGaWxlLCBTZWdtZW50TWFya2VyW10+KCk7XG4gIGZvciAoY29uc3QgbWFwcGluZyBvZiBtYXBwaW5ncykge1xuICAgIGNvbnN0IG9yaWdpbmFsU291cmNlID0gbWFwcGluZy5vcmlnaW5hbFNvdXJjZTtcbiAgICBpZiAoIW9yaWdpbmFsU2VnbWVudHMuaGFzKG9yaWdpbmFsU291cmNlKSkge1xuICAgICAgb3JpZ2luYWxTZWdtZW50cy5zZXQob3JpZ2luYWxTb3VyY2UsIFtdKTtcbiAgICB9XG4gICAgY29uc3Qgc2VnbWVudHMgPSBvcmlnaW5hbFNlZ21lbnRzLmdldChvcmlnaW5hbFNvdXJjZSkhO1xuICAgIHNlZ21lbnRzLnB1c2gobWFwcGluZy5vcmlnaW5hbFNlZ21lbnQpO1xuICB9XG4gIG9yaWdpbmFsU2VnbWVudHMuZm9yRWFjaChzZWdtZW50TWFya2VycyA9PiBzZWdtZW50TWFya2Vycy5zb3J0KGNvbXBhcmVTZWdtZW50cykpO1xuICByZXR1cm4gb3JpZ2luYWxTZWdtZW50cztcbn1cblxuLyoqXG4gKiBVcGRhdGUgdGhlIG9yaWdpbmFsIHNlZ21lbnRzIG9mIGVhY2ggb2YgdGhlIGdpdmVuIGBtYXBwaW5nc2AgdG8gaW5jbHVkZSBhIGxpbmsgdG8gdGhlIG5leHRcbiAqIHNlZ21lbnQgaW4gdGhlIHNvdXJjZSBmaWxlLlxuICpcbiAqIEBwYXJhbSBtYXBwaW5ncyB0aGUgbWFwcGluZ3Mgd2hvc2Ugc2VnbWVudHMgc2hvdWxkIGJlIHVwZGF0ZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZU9yaWdpbmFsU2VnbWVudExpbmtzKG1hcHBpbmdzOiBNYXBwaW5nW10pOiB2b2lkIHtcbiAgY29uc3Qgc2VnbWVudHNCeVNvdXJjZSA9IGV4dHJhY3RPcmlnaW5hbFNlZ21lbnRzKG1hcHBpbmdzKTtcbiAgc2VnbWVudHNCeVNvdXJjZS5mb3JFYWNoKG1hcmtlcnMgPT4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWFya2Vycy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIG1hcmtlcnNbaV0ubmV4dCA9IG1hcmtlcnNbaSArIDFdO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlU3RhcnRPZkxpbmVQb3NpdGlvbnMoc3RyOiBzdHJpbmcpIHtcbiAgLy8gVGhlIGAxYCBpcyB0byBpbmRpY2F0ZSBhIG5ld2xpbmUgY2hhcmFjdGVyIGJldHdlZW4gdGhlIGxpbmVzLlxuICAvLyBOb3RlIHRoYXQgaW4gdGhlIGFjdHVhbCBjb250ZW50cyB0aGVyZSBjb3VsZCBiZSBtb3JlIHRoYW4gb25lIGNoYXJhY3RlciB0aGF0IGluZGljYXRlcyBhXG4gIC8vIG5ld2xpbmVcbiAgLy8gLSBlLmcuIFxcclxcbiAtIGJ1dCB0aGF0IGlzIG5vdCBpbXBvcnRhbnQgaGVyZSBzaW5jZSBzZWdtZW50LW1hcmtlcnMgYXJlIGluIGxpbmUvY29sdW1uIHBhaXJzIGFuZFxuICAvLyBzbyBkaWZmZXJlbmNlcyBpbiBsZW5ndGggZHVlIHRvIGV4dHJhIGBcXHJgIGNoYXJhY3RlcnMgZG8gbm90IGFmZmVjdCB0aGUgYWxnb3JpdGhtcy5cbiAgY29uc3QgTkVXTElORV9NQVJLRVJfT0ZGU0VUID0gMTtcbiAgY29uc3QgbGluZUxlbmd0aHMgPSBjb21wdXRlTGluZUxlbmd0aHMoc3RyKTtcbiAgY29uc3Qgc3RhcnRQb3NpdGlvbnMgPSBbMF07ICAvLyBGaXJzdCBsaW5lIHN0YXJ0cyBhdCBwb3NpdGlvbiAwXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZUxlbmd0aHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgc3RhcnRQb3NpdGlvbnMucHVzaChzdGFydFBvc2l0aW9uc1tpXSArIGxpbmVMZW5ndGhzW2ldICsgTkVXTElORV9NQVJLRVJfT0ZGU0VUKTtcbiAgfVxuICByZXR1cm4gc3RhcnRQb3NpdGlvbnM7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVMaW5lTGVuZ3RocyhzdHI6IHN0cmluZyk6IG51bWJlcltdIHtcbiAgcmV0dXJuIChzdHIuc3BsaXQoL1xcbi8pKS5tYXAocyA9PiBzLmxlbmd0aCk7XG59XG5cbi8qKlxuICogQSBjb2xsZWN0aW9uIG9mIG1hcHBpbmdzIGJldHdlZW4gYGtleXNgIGFuZCBgdmFsdWVzYCBzdG9yZWQgaW4gdGhlIG9yZGVyIGluIHdoaWNoIHRoZSBrZXlzIGFyZVxuICogZmlyc3Qgc2Vlbi5cbiAqXG4gKiBUaGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoaXMgYW5kIGEgc3RhbmRhcmQgYE1hcGAgaXMgdGhhdCB3aGVuIHlvdSBhZGQgYSBrZXktdmFsdWUgcGFpciB0aGUgaW5kZXhcbiAqIG9mIHRoZSBga2V5YCBpcyByZXR1cm5lZC5cbiAqL1xuY2xhc3MgSW5kZXhlZE1hcDxLLCBWPiB7XG4gIHByaXZhdGUgbWFwID0gbmV3IE1hcDxLLCBudW1iZXI+KCk7XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIGtleXMgYWRkZWQgdG8gdGhpcyBtYXAuXG4gICAqXG4gICAqIFRoaXMgYXJyYXkgaXMgZ3VhcmFudGVlZCB0byBiZSBpbiB0aGUgb3JkZXIgb2YgdGhlIGZpcnN0IHRpbWUgdGhlIGtleSB3YXMgYWRkZWQgdG8gdGhlIG1hcC5cbiAgICovXG4gIHJlYWRvbmx5IGtleXM6IEtbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiB2YWx1ZXMgYWRkZWQgdG8gdGhpcyBtYXAuXG4gICAqXG4gICAqIFRoaXMgYXJyYXkgaXMgZ3VhcmFudGVlZCB0byBiZSBpbiB0aGUgb3JkZXIgb2YgdGhlIGZpcnN0IHRpbWUgdGhlIGFzc29jaWF0ZWQga2V5IHdhcyBhZGRlZCB0b1xuICAgKiB0aGUgbWFwLlxuICAgKi9cbiAgcmVhZG9ubHkgdmFsdWVzOiBWW10gPSBbXTtcblxuICAvKipcbiAgICogQXNzb2NpYXRlIHRoZSBgdmFsdWVgIHdpdGggdGhlIGBrZXlgIGFuZCByZXR1cm4gdGhlIGluZGV4IG9mIHRoZSBrZXkgaW4gdGhlIGNvbGxlY3Rpb24uXG4gICAqXG4gICAqIElmIHRoZSBga2V5YCBhbHJlYWR5IGV4aXN0cyB0aGVuIHRoZSBgdmFsdWVgIGlzIG5vdCBzZXQgYW5kIHRoZSBpbmRleCBvZiB0aGF0IGBrZXlgIGlzXG4gICAqIHJldHVybmVkOyBvdGhlcndpc2UgdGhlIGBrZXlgIGFuZCBgdmFsdWVgIGFyZSBzdG9yZWQgYW5kIHRoZSBpbmRleCBvZiB0aGUgbmV3IGBrZXlgIGlzXG4gICAqIHJldHVybmVkLlxuICAgKlxuICAgKiBAcGFyYW0ga2V5IHRoZSBrZXkgdG8gYXNzb2NpYXRlZCB3aXRoIHRoZSBgdmFsdWVgLlxuICAgKiBAcGFyYW0gdmFsdWUgdGhlIHZhbHVlIHRvIGFzc29jaWF0ZWQgd2l0aCB0aGUgYGtleWAuXG4gICAqIEByZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgYGtleWAgaW4gdGhlIGBrZXlzYCBhcnJheS5cbiAgICovXG4gIHNldChrZXk6IEssIHZhbHVlOiBWKTogbnVtYmVyIHtcbiAgICBpZiAodGhpcy5tYXAuaGFzKGtleSkpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hcC5nZXQoa2V5KSE7XG4gICAgfVxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy52YWx1ZXMucHVzaCh2YWx1ZSkgLSAxO1xuICAgIHRoaXMua2V5cy5wdXNoKGtleSk7XG4gICAgdGhpcy5tYXAuc2V0KGtleSwgaW5kZXgpO1xuICAgIHJldHVybiBpbmRleDtcbiAgfVxufVxuXG4vKipcbiAqIEEgY29sbGVjdGlvbiBvZiBgdmFsdWVzYCBzdG9yZWQgaW4gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgd2VyZSBhZGRlZC5cbiAqXG4gKiBUaGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoaXMgYW5kIGEgc3RhbmRhcmQgYFNldGAgaXMgdGhhdCB3aGVuIHlvdSBhZGQgYSB2YWx1ZSB0aGUgaW5kZXggb2YgdGhhdFxuICogaXRlbSBpcyByZXR1cm5lZC5cbiAqL1xuY2xhc3MgSW5kZXhlZFNldDxWPiB7XG4gIHByaXZhdGUgbWFwID0gbmV3IE1hcDxWLCBudW1iZXI+KCk7XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIHZhbHVlcyBhZGRlZCB0byB0aGlzIHNldC5cbiAgICogVGhpcyBhcnJheSBpcyBndWFyYW50ZWVkIHRvIGJlIGluIHRoZSBvcmRlciBvZiB0aGUgZmlyc3QgdGltZSB0aGUgdmFsdWUgd2FzIGFkZGVkIHRvIHRoZSBzZXQuXG4gICAqL1xuICByZWFkb25seSB2YWx1ZXM6IFZbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBBZGQgdGhlIGB2YWx1ZWAgdG8gdGhlIGB2YWx1ZXNgIGFycmF5LCBpZiBpdCBkb2Vzbid0IGFscmVhZHkgZXhpc3Q7IHJldHVybmluZyB0aGUgaW5kZXggb2YgdGhlXG4gICAqIGB2YWx1ZWAgaW4gdGhlIGB2YWx1ZXNgIGFycmF5LlxuICAgKlxuICAgKiBJZiB0aGUgYHZhbHVlYCBhbHJlYWR5IGV4aXN0cyB0aGVuIHRoZSBpbmRleCBvZiB0aGF0IGB2YWx1ZWAgaXMgcmV0dXJuZWQsIG90aGVyd2lzZSB0aGUgbmV3XG4gICAqIGB2YWx1ZWAgaXMgc3RvcmVkIGFuZCB0aGUgbmV3IGluZGV4IHJldHVybmVkLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgdGhlIHZhbHVlIHRvIGFkZCB0byB0aGUgc2V0LlxuICAgKiBAcmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGB2YWx1ZWAgaW4gdGhlIGB2YWx1ZXNgIGFycmF5LlxuICAgKi9cbiAgYWRkKHZhbHVlOiBWKTogbnVtYmVyIHtcbiAgICBpZiAodGhpcy5tYXAuaGFzKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRoaXMubWFwLmdldCh2YWx1ZSkhO1xuICAgIH1cbiAgICBjb25zdCBpbmRleCA9IHRoaXMudmFsdWVzLnB1c2godmFsdWUpIC0gMTtcbiAgICB0aGlzLm1hcC5zZXQodmFsdWUsIGluZGV4KTtcbiAgICByZXR1cm4gaW5kZXg7XG4gIH1cbn1cblxuY2xhc3MgQ2FjaGU8SW5wdXQsIENhY2hlZD4ge1xuICBwcml2YXRlIG1hcCA9IG5ldyBNYXA8SW5wdXQsIENhY2hlZD4oKTtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjb21wdXRlRm46IChpbnB1dDogSW5wdXQpID0+IENhY2hlZCkge31cbiAgZ2V0KGlucHV0OiBJbnB1dCk6IENhY2hlZCB7XG4gICAgaWYgKCF0aGlzLm1hcC5oYXMoaW5wdXQpKSB7XG4gICAgICB0aGlzLm1hcC5zZXQoaW5wdXQsIHRoaXMuY29tcHV0ZUZuKGlucHV0KSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1hcC5nZXQoaW5wdXQpITtcbiAgfVxufVxuIl19