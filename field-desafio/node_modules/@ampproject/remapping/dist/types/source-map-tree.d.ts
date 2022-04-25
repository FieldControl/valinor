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
import type OriginalSource from './original-source';
import type { DecodedSourceMap, SourceMapSegmentObject } from './types';
declare type Sources = OriginalSource | SourceMapTree;
/**
 * SourceMapTree represents a single sourcemap, with the ability to trace
 * mappings into its child nodes (which may themselves be SourceMapTrees).
 */
export default class SourceMapTree {
    map: DecodedSourceMap;
    sources: Sources[];
    private lastLine;
    private lastColumn;
    private lastIndex;
    constructor(map: DecodedSourceMap, sources: Sources[]);
    /**
     * traceMappings is only called on the root level SourceMapTree, and begins
     * the process of resolving each mapping in terms of the original source
     * files.
     */
    traceMappings(): DecodedSourceMap;
    /**
     * traceSegment is only called on children SourceMapTrees. It recurses down
     * into its own child SourceMapTrees, until we find the original source map.
     */
    traceSegment(line: number, column: number, name: string): SourceMapSegmentObject | null;
}
export {};
