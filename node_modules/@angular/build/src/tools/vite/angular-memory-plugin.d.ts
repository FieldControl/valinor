/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { Connect, Plugin } from 'vite';
import { AngularMemoryOutputFiles } from './utils';
export interface AngularMemoryPluginOptions {
    workspaceRoot: string;
    virtualProjectRoot: string;
    outputFiles: AngularMemoryOutputFiles;
    assets: Map<string, string>;
    ssr: boolean;
    external?: string[];
    extensionMiddleware?: Connect.NextHandleFunction[];
    indexHtmlTransformer?: (content: string) => Promise<string>;
    normalizePath: (path: string) => string;
}
export declare function createAngularMemoryPlugin(options: AngularMemoryPluginOptions): Plugin;
