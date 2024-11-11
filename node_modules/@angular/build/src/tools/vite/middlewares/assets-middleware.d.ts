/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { Connect, ViteDevServer } from 'vite';
import { AngularMemoryOutputFiles } from '../utils';
export declare function createAngularAssetsMiddleware(server: ViteDevServer, assets: Map<string, string>, outputFiles: AngularMemoryOutputFiles): Connect.NextHandleFunction;
