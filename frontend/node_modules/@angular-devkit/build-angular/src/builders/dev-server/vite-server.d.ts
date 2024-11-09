/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import type { BuilderContext } from '@angular-devkit/architect';
import type { Plugin } from 'esbuild';
import type { Connect, DepOptimizationConfig, InlineConfig } from 'vite';
import { ExternalResultMetadata } from '../../tools/esbuild/bundler-execution-result';
import { JavaScriptTransformer } from '../../tools/esbuild/javascript-transformer';
import type { NormalizedDevServerOptions } from './options';
import type { DevServerBuilderOutput } from './webpack-server';
interface OutputFileRecord {
    contents: Uint8Array;
    size: number;
    hash?: string;
    updated: boolean;
    servable: boolean;
}
export declare function serveWithVite(serverOptions: NormalizedDevServerOptions, builderName: string, context: BuilderContext, transformers?: {
    indexHtml?: (content: string) => Promise<string>;
}, extensions?: {
    middleware?: Connect.NextHandleFunction[];
    buildPlugins?: Plugin[];
}): AsyncIterableIterator<DevServerBuilderOutput>;
export declare function setupServer(serverOptions: NormalizedDevServerOptions, outputFiles: Map<string, OutputFileRecord>, assets: Map<string, string>, preserveSymlinks: boolean | undefined, externalMetadata: ExternalResultMetadata, ssr: boolean, prebundleTransformer: JavaScriptTransformer, target: string[], prebundleLoaderExtensions: EsbuildLoaderOption | undefined, extensionMiddleware?: Connect.NextHandleFunction[], indexHtmlTransformer?: (content: string) => Promise<string>, thirdPartySourcemaps?: boolean): Promise<InlineConfig>;
type EsbuildLoaderOption = Exclude<DepOptimizationConfig['esbuildOptions'], undefined>['loader'];
export {};
