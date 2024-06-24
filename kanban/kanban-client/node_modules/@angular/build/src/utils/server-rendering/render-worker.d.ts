/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import type { ESMInMemoryFileLoaderWorkerData } from './esm-in-memory-loader/loader-hooks';
import { RenderResult, ServerContext } from './render-page';
export interface RenderWorkerData extends ESMInMemoryFileLoaderWorkerData {
    document: string;
    inlineCriticalCss?: boolean;
    assetFiles: Record</** Destination */ string, /** Source */ string>;
}
export interface RenderOptions {
    route: string;
    serverContext: ServerContext;
}
/** Renders an application based on a provided options. */
declare function render(options: RenderOptions): Promise<RenderResult>;
declare const _default: typeof render;
export default _default;
