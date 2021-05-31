/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
import * as fs from 'fs';
import { ProcessBundleOptions, ProcessBundleResult } from './process-bundle';
export interface CacheEntry {
    path: string;
    size: number;
    integrity?: string;
}
export declare class BundleActionCache {
    private readonly cachePath;
    private readonly integrityAlgorithm?;
    constructor(cachePath: string, integrityAlgorithm?: string | undefined);
    static copyEntryContent(entry: CacheEntry | string, dest: fs.PathLike): void;
    generateIntegrityValue(content: string): string;
    generateBaseCacheKey(content: string): string;
    generateCacheKeys(action: ProcessBundleOptions): string[];
    getCacheEntries(cacheKeys: (string | undefined)[]): Promise<(CacheEntry | null)[] | false>;
    getCachedBundleResult(action: ProcessBundleOptions): Promise<ProcessBundleResult | null>;
}
