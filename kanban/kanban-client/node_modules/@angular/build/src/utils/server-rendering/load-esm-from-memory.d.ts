/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { MainServerBundleExports, RenderUtilsServerBundleExports } from './main-bundle-exports';
export declare function loadEsmModuleFromMemory(path: './main.server.mjs'): Promise<MainServerBundleExports>;
export declare function loadEsmModuleFromMemory(path: './render-utils.server.mjs'): Promise<RenderUtilsServerBundleExports>;
