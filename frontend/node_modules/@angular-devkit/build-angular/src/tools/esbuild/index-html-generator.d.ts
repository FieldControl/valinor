/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NormalizedApplicationBuildOptions } from '../../builders/application/options';
import { BuildOutputFile, InitialFileRecord } from './bundler-context';
export declare function generateIndexHtml(initialFiles: Map<string, InitialFileRecord>, outputFiles: BuildOutputFile[], buildOptions: NormalizedApplicationBuildOptions, lang?: string): Promise<{
    content: string;
    contentWithoutCriticalCssInlined: string;
    warnings: string[];
    errors: string[];
}>;
