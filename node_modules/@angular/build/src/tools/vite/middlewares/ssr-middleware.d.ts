/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { Connect, ViteDevServer } from 'vite';
export declare function createAngularSSRMiddleware(server: ViteDevServer, outputFiles: Map<string, {
    contents: Uint8Array;
    servable: boolean;
}>, indexHtmlTransformer?: (content: string) => Promise<string>): Connect.NextHandleFunction;
