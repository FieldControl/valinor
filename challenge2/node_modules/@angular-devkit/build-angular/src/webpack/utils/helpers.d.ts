/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ScriptTarget } from 'typescript';
import { Configuration, SourceMapDevToolPlugin } from 'webpack';
import { ExtraEntryPoint, ExtraEntryPointClass } from '../../browser/schema';
export interface HashFormat {
    chunk: string;
    extract: string;
    file: string;
    script: string;
}
export declare function getOutputHashFormat(option: string, length?: number): HashFormat;
export declare type NormalizedEntryPoint = Required<ExtraEntryPointClass>;
export declare function normalizeExtraEntryPoints(extraEntryPoints: ExtraEntryPoint[], defaultBundleName: string): NormalizedEntryPoint[];
export declare function getSourceMapDevTool(scriptsSourceMap: boolean | undefined, stylesSourceMap: boolean | undefined, hiddenSourceMap?: boolean, inlineSourceMap?: boolean): SourceMapDevToolPlugin;
/**
 * Returns an ES version file suffix to differentiate between various builds.
 */
export declare function getEsVersionForFileName(scriptTarget: ScriptTarget | undefined, esVersionInFileName?: boolean): string;
export declare function isPolyfillsEntry(name: string): boolean;
export declare function getWatchOptions(poll: number | undefined): Configuration['watchOptions'];
export declare function assetNameTemplateFactory(hashFormat: HashFormat): (resourcePath: string) => string;
