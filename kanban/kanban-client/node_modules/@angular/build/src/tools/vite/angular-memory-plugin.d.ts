/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import type { Connect, Plugin } from 'vite';
export interface AngularMemoryPluginOptions {
    workspaceRoot: string;
    virtualProjectRoot: string;
    outputFiles: Map<string, {
        contents: Uint8Array;
        servable: boolean;
    }>;
    assets: Map<string, string>;
    ssr: boolean;
    external?: string[];
    extensionMiddleware?: Connect.NextHandleFunction[];
    extraHeaders?: Record<string, string>;
    indexHtmlTransformer?: (content: string) => Promise<string>;
    normalizePath: (path: string) => string;
}
export declare function createAngularMemoryPlugin(options: AngularMemoryPluginOptions): Plugin;
