/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { BuilderContext } from '@angular-devkit/architect';
import type { Plugin } from 'esbuild';
import type { Connect, DepOptimizationConfig, InlineConfig } from 'vite';
import { Result } from '../application/results';
import { type ApplicationBuilderInternalOptions, type ExternalResultMetadata, JavaScriptTransformer } from './internal';
import type { NormalizedDevServerOptions } from './options';
import type { DevServerBuilderOutput } from './output';
interface OutputFileRecord {
    contents: Uint8Array;
    size: number;
    hash?: string;
    updated: boolean;
    servable: boolean;
}
interface DevServerExternalResultMetadata extends Omit<ExternalResultMetadata, 'explicit'> {
    explicitBrowser: string[];
    explicitServer: string[];
}
export type BuilderAction = (options: ApplicationBuilderInternalOptions, context: BuilderContext, plugins?: Plugin[]) => AsyncIterable<Result>;
export declare function serveWithVite(serverOptions: NormalizedDevServerOptions, builderName: string, builderAction: BuilderAction, context: BuilderContext, transformers?: {
    indexHtml?: (content: string) => Promise<string>;
}, extensions?: {
    middleware?: Connect.NextHandleFunction[];
    buildPlugins?: Plugin[];
}): AsyncIterableIterator<DevServerBuilderOutput>;
export declare function setupServer(serverOptions: NormalizedDevServerOptions, outputFiles: Map<string, OutputFileRecord>, assets: Map<string, string>, preserveSymlinks: boolean | undefined, externalMetadata: DevServerExternalResultMetadata, ssr: boolean, prebundleTransformer: JavaScriptTransformer, target: string[], zoneless: boolean, prebundleLoaderExtensions: EsbuildLoaderOption | undefined, extensionMiddleware?: Connect.NextHandleFunction[], indexHtmlTransformer?: (content: string) => Promise<string>, thirdPartySourcemaps?: boolean): Promise<InlineConfig>;
type EsbuildLoaderOption = Exclude<DepOptimizationConfig['esbuildOptions'], undefined>['loader'];
export {};
