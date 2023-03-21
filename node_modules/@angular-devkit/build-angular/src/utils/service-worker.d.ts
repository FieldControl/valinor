/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import type { Config } from '@angular/service-worker/config';
import { promises as fsPromises } from 'fs';
export declare function augmentAppWithServiceWorker(appRoot: string, workspaceRoot: string, outputPath: string, baseHref: string, ngswConfigPath?: string, inputputFileSystem?: typeof fsPromises, outputFileSystem?: typeof fsPromises): Promise<void>;
export declare function augmentAppWithServiceWorkerEsbuild(workspaceRoot: string, configPath: string, outputPath: string, baseHref: string): Promise<void>;
export declare function augmentAppWithServiceWorkerCore(config: Config, outputPath: string, baseHref: string, inputputFileSystem?: typeof fsPromises, outputFileSystem?: typeof fsPromises): Promise<void>;
