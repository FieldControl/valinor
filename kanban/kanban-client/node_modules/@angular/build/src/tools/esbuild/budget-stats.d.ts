/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import type { Metafile } from 'esbuild';
import type { BudgetStats } from '../../utils/bundle-calculator';
import type { InitialFileRecord } from './bundler-context';
/**
 * Generates a bundle budget calculator compatible stats object that provides
 * the necessary information for the Webpack-based bundle budget code to
 * interoperate with the esbuild-based builders.
 * @param metafile The esbuild metafile of a build to use.
 * @param initialFiles The records of all initial files of a build.
 * @returns A bundle budget compatible stats object.
 */
export declare function generateBudgetStats(metafile: Metafile, initialFiles: Map<string, InitialFileRecord>): BudgetStats;
