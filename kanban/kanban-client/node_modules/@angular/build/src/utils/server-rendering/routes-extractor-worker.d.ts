/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import type { ESMInMemoryFileLoaderWorkerData } from './esm-in-memory-loader/loader-hooks';
export interface RoutesExtractorWorkerData extends ESMInMemoryFileLoaderWorkerData {
    document: string;
    verbose: boolean;
    assetFiles: Record</** Destination */ string, /** Source */ string>;
}
export interface RoutersExtractorWorkerResult {
    routes: string[];
    warnings?: string[];
}
/** Renders an application based on a provided options. */
declare function extractRoutes(): Promise<RoutersExtractorWorkerResult>;
declare const _default: typeof extractRoutes;
export default _default;
