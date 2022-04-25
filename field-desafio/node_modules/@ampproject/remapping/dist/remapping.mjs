import { decode, encode } from 'sourcemap-codec';
import resolveUri from '@jridgewell/resolve-uri';

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Creates a brand new (prototype-less) object with the enumerable-own
 * properties of `target`. Any enumerable-own properties from `source` which
 * are not present on `target` will be copied as well.
 */
function defaults(target, source) {
    return Object.assign(Object.create(null), source, target);
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Decodes an input sourcemap into a `DecodedSourceMap` sourcemap object.
 *
 * Valid input maps include a `DecodedSourceMap`, a `RawSourceMap`, or JSON
 * representations of either type.
 */
function decodeSourceMap(map) {
    if (typeof map === 'string') {
        map = JSON.parse(map);
    }
    let { mappings } = map;
    if (typeof mappings === 'string') {
        mappings = sortMappings(decode(mappings), true);
    }
    else {
        // Clone the Line so that we can sort it. We don't want to mutate an array
        // that we don't own directly.
        mappings = sortMappings(mappings, false);
    }
    return defaults({ mappings }, map);
}
function firstUnsortedSegmentLine(mappings) {
    for (let i = 0; i < mappings.length; i++) {
        const segments = mappings[i];
        for (let j = 1; j < segments.length; j++) {
            if (segments[j][0] < segments[j - 1][0]) {
                return i;
            }
        }
    }
    return mappings.length;
}
function sortMappings(mappings, owned) {
    const unosrtedIndex = firstUnsortedSegmentLine(mappings);
    if (unosrtedIndex === mappings.length)
        return mappings;
    if (!owned)
        mappings = mappings.slice();
    for (let i = unosrtedIndex; i < mappings.length; i++) {
        mappings[i] = sortSegments(mappings[i], owned);
    }
    return mappings;
}
function sortSegments(segments, owned) {
    if (!owned)
        segments = segments.slice();
    return segments.sort(segmentComparator);
}
function segmentComparator(a, b) {
    return a[0] - b[0];
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A "leaf" node in the sourcemap tree, representing an original, unmodified
 * source file. Recursive segment tracing ends at the `OriginalSource`.
 */
class OriginalSource {
    constructor(filename, content) {
        this.filename = filename;
        this.content = content;
    }
    /**
     * Tracing a `SourceMapSegment` ends when we get to an `OriginalSource`,
     * meaning this line/column location originated from this source file.
     */
    traceSegment(line, column, name) {
        return { column, line, name, source: this };
    }
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function resolve(input, base) {
    // The base is always treated as a directory, if it's not empty.
    // https://github.com/mozilla/source-map/blob/8cb3ee57/lib/util.js#L327
    // https://github.com/chromium/chromium/blob/da4adbb3/third_party/blink/renderer/devtools/front_end/sdk/SourceMap.js#L400-L401
    if (base && !base.endsWith('/'))
        base += '/';
    return resolveUri(input, base);
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A binary search implementation that returns the index if a match is found,
 * or the negated index of where the `needle` should be inserted.
 *
 * The `comparator` callback receives both the `item` under comparison and the
 * needle we are searching for. It must return `0` if the `item` is a match,
 * any negative number if `item` is too small (and we must search after it), or
 * any positive number if the `item` is too large (and we must search before
 * it).
 *
 * If no match is found, a negated index of where to insert the `needle` is
 * returned. This negated index is guaranteed to be less than 0. To insert an
 * item, negate it (again) and splice:
 *
 * ```js
 * const array = [1, 3];
 * const needle = 2;
 * const index = binarySearch(array, needle, (item, needle) => item - needle);
 *
 * assert.equal(index, -2);
 * assert.equal(~index, 1);
 * array.splice(~index, 0, needle);
 * assert.deepEqual(array, [1, 2, 3]);
 * ```
 */
function binarySearch(haystack, needle, comparator, low, high) {
    low = Math.max(low, 0);
    while (low <= high) {
        const mid = low + ((high - low) >> 1);
        const cmp = comparator(haystack[mid], needle);
        if (cmp === 0) {
            return mid;
        }
        if (cmp < 0) {
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    return ~low;
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * FastStringArray acts like a `Set` (allowing only one occurrence of a string
 * `key`), but provides the index of the `key` in the backing array.
 *
 * This is designed to allow synchronizing a second array with the contents of
 * the backing array, like how `sourcesContent[i]` is the source content
 * associated with `source[i]`, and there are never duplicates.
 */
class FastStringArray {
    constructor() {
        this.indexes = Object.create(null);
        this.array = [];
    }
    /**
     * Puts `key` into the backing array, if it is not already present. Returns
     * the index of the `key` in the backing array.
     */
    put(key) {
        const { array, indexes } = this;
        // The key may or may not be present. If it is present, it's a number.
        let index = indexes[key];
        // If it's not yet present, we need to insert it and track the index in the
        // indexes.
        if (index === undefined) {
            index = indexes[key] = array.length;
            array.push(key);
        }
        return index;
    }
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * SourceMapTree represents a single sourcemap, with the ability to trace
 * mappings into its child nodes (which may themselves be SourceMapTrees).
 */
class SourceMapTree {
    constructor(map, sources) {
        this.map = map;
        this.sources = sources;
        this.lastLine = 0;
        this.lastColumn = 0;
        this.lastIndex = 0;
    }
    /**
     * traceMappings is only called on the root level SourceMapTree, and begins
     * the process of resolving each mapping in terms of the original source
     * files.
     */
    traceMappings() {
        const mappings = [];
        const names = new FastStringArray();
        const sources = new FastStringArray();
        const sourcesContent = [];
        const { mappings: rootMappings, names: rootNames } = this.map;
        for (let i = 0; i < rootMappings.length; i++) {
            const segments = rootMappings[i];
            const tracedSegments = [];
            let lastTraced = undefined;
            for (let j = 0; j < segments.length; j++) {
                const segment = segments[j];
                // 1-length segments only move the current generated column, there's no
                // source information to gather from it.
                if (segment.length === 1)
                    continue;
                const source = this.sources[segment[1]];
                const traced = source.traceSegment(segment[2], segment[3], segment.length === 5 ? rootNames[segment[4]] : '');
                if (!traced)
                    continue;
                // So we traced a segment down into its original source file. Now push a
                // new segment pointing to this location.
                const { column, line, name } = traced;
                const { content, filename } = traced.source;
                // Store the source location, and ensure we keep sourcesContent up to
                // date with the sources array.
                const sourceIndex = sources.put(filename);
                sourcesContent[sourceIndex] = content;
                if (lastTraced &&
                    lastTraced[1] === sourceIndex &&
                    lastTraced[2] === line &&
                    lastTraced[3] === column) {
                    // This is a duplicate mapping pointing at the exact same starting point in the source file.
                    // It doesn't provide any new information, and only bloats the sourcemap.
                    continue;
                }
                // This looks like unnecessary duplication, but it noticeably increases
                // performance. If we were to push the nameIndex onto length-4 array, v8
                // would internally allocate 22 slots! That's 68 wasted bytes! Array
                // literals have the same capacity as their length, saving memory.
                if (name) {
                    lastTraced = [segment[0], sourceIndex, line, column, names.put(name)];
                }
                else {
                    lastTraced = [segment[0], sourceIndex, line, column];
                }
                tracedSegments.push(lastTraced);
            }
            mappings.push(tracedSegments);
        }
        // TODO: Make all sources relative to the sourceRoot.
        return defaults({
            mappings,
            names: names.array,
            sources: sources.array,
            sourcesContent,
        }, this.map);
    }
    /**
     * traceSegment is only called on children SourceMapTrees. It recurses down
     * into its own child SourceMapTrees, until we find the original source map.
     */
    traceSegment(line, column, name) {
        const { mappings, names } = this.map;
        // It's common for parent sourcemaps to have pointers to lines that have no
        // mapping (like a "//# sourceMappingURL=") at the end of the child file.
        if (line >= mappings.length)
            return null;
        const segments = mappings[line];
        if (segments.length === 0)
            return null;
        let low = 0;
        let high = segments.length - 1;
        if (line === this.lastLine) {
            if (column >= this.lastColumn) {
                low = this.lastIndex;
            }
            else {
                high = this.lastIndex;
            }
        }
        let index = binarySearch(segments, column, segmentComparator$1, low, high);
        this.lastLine = line;
        this.lastColumn = column;
        if (index === -1) {
            this.lastIndex = index;
            return null; // we come before any mapped segment
        }
        // If we can't find a segment that lines up to this column, we use the
        // segment before.
        if (index < 0) {
            index = ~index - 1;
        }
        this.lastIndex = index;
        const segment = segments[index];
        // 1-length segments only move the current generated column, there's no
        // source information to gather from it.
        if (segment.length === 1)
            return null;
        const source = this.sources[segment[1]];
        // So now we can recurse down, until we hit the original source file.
        return source.traceSegment(segment[2], segment[3], 
        // A child map's recorded name for this segment takes precedence over the
        // parent's mapped name. Imagine a mangler changing the name over, etc.
        segment.length === 5 ? names[segment[4]] : name);
    }
}
function segmentComparator$1(segment, column) {
    return segment[0] - column;
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Removes the filename from a path.
 */
function stripFilename(path) {
    if (!path)
        return '';
    const index = path.lastIndexOf('/');
    return path.slice(0, index + 1);
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function asArray(value) {
    if (Array.isArray(value))
        return value;
    return [value];
}
/**
 * Recursively builds a tree structure out of sourcemap files, with each node
 * being either an `OriginalSource` "leaf" or a `SourceMapTree` composed of
 * `OriginalSource`s and `SourceMapTree`s.
 *
 * Every sourcemap is composed of a collection of source files and mappings
 * into locations of those source files. When we generate a `SourceMapTree` for
 * the sourcemap, we attempt to load each source file's own sourcemap. If it
 * does not have an associated sourcemap, it is considered an original,
 * unmodified source file.
 */
function buildSourceMapTree(input, loader, relativeRoot) {
    const maps = asArray(input).map(decodeSourceMap);
    const map = maps.pop();
    for (let i = 0; i < maps.length; i++) {
        if (maps[i].sources.length > 1) {
            throw new Error(`Transformation map ${i} must have exactly one source file.\n` +
                'Did you specify these with the most recent transformation maps first?');
        }
    }
    const { sourceRoot, sources, sourcesContent } = map;
    const children = sources.map((sourceFile, i) => {
        // Each source file is loaded relative to the sourcemap's own sourceRoot,
        // which is itself relative to the sourcemap's parent.
        const uri = resolve(sourceFile || '', resolve(sourceRoot || '', stripFilename(relativeRoot)));
        // Use the provided loader callback to retrieve the file's sourcemap.
        // TODO: We should eventually support async loading of sourcemap files.
        const sourceMap = loader(uri);
        // If there is no sourcemap, then it is an unmodified source file.
        if (!sourceMap) {
            // The source file's actual contents must be included in the sourcemap
            // (done when generating the sourcemap) for it to be included as a
            // sourceContent in the output sourcemap.
            const sourceContent = sourcesContent ? sourcesContent[i] : null;
            return new OriginalSource(uri, sourceContent);
        }
        // Else, it's a real sourcemap, and we need to recurse into it to load its
        // source files.
        return buildSourceMapTree(decodeSourceMap(sourceMap), loader, uri);
    });
    let tree = new SourceMapTree(map, children);
    for (let i = maps.length - 1; i >= 0; i--) {
        tree = new SourceMapTree(maps[i], [tree]);
    }
    return tree;
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * A SourceMap v3 compatible sourcemap, which only includes fields that were
 * provided to it.
 */
class SourceMap {
    constructor(map, options) {
        this.version = 3; // SourceMap spec says this should be first.
        if ('file' in map)
            this.file = map.file;
        this.mappings = options.decodedMappings ? map.mappings : encode(map.mappings);
        this.names = map.names;
        // TODO: We first need to make all source URIs relative to the sourceRoot
        // before we can support a sourceRoot.
        // if ('sourceRoot' in map) this.sourceRoot = map.sourceRoot;
        this.sources = map.sources;
        if (!options.excludeContent && 'sourcesContent' in map) {
            this.sourcesContent = map.sourcesContent;
        }
    }
    toString() {
        return JSON.stringify(this);
    }
}

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Traces through all the mappings in the root sourcemap, through the sources
 * (and their sourcemaps), all the way back to the original source location.
 *
 * `loader` will be called every time we encounter a source file. If it returns
 * a sourcemap, we will recurse into that sourcemap to continue the trace. If
 * it returns a falsey value, that source file is treated as an original,
 * unmodified source file.
 *
 * Pass `excludeContent` to exclude any self-containing source file content
 * from the output sourcemap.
 *
 * Pass `decodedMappings` to receive a SourceMap with decoded (instead of
 * VLQ encoded) mappings.
 */
function remapping(input, loader, options) {
    const opts = typeof options === 'object' ? options : { excludeContent: !!options, decodedMappings: false };
    const graph = buildSourceMapTree(input, loader);
    return new SourceMap(graph.traceMappings(), opts);
}

export default remapping;
//# sourceMappingURL=remapping.mjs.map
