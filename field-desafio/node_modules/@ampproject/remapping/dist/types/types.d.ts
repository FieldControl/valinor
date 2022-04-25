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
interface SourceMapV3 {
    file?: string | null;
    names: string[];
    sourceRoot?: string;
    sources: (string | null)[];
    sourcesContent?: (string | null)[];
    version: 3;
}
declare type Column = number;
declare type SourcesIndex = number;
declare type SourceLine = number;
declare type SourceColumn = number;
declare type NamesIndex = number;
export declare type SourceMapSegment = [Column] | [Column, SourcesIndex, SourceLine, SourceColumn] | [Column, SourcesIndex, SourceLine, SourceColumn, NamesIndex];
export interface RawSourceMap extends SourceMapV3 {
    mappings: string;
}
export interface DecodedSourceMap extends SourceMapV3 {
    mappings: SourceMapSegment[][];
}
export interface SourceMapSegmentObject {
    column: number;
    line: number;
    name: string;
    source: {
        content: string | null;
        filename: string;
    };
}
export declare type SourceMapInput = string | RawSourceMap | DecodedSourceMap;
export declare type SourceMapLoader = (file: string) => SourceMapInput | null | undefined;
export declare type Options = {
    excludeContent: boolean;
    decodedMappings: boolean;
};
export {};
