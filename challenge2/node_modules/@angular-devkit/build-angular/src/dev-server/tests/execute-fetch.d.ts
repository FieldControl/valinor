/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { RequestInit, Response } from 'node-fetch';
import { BuilderHarness, BuilderHarnessExecutionOptions, BuilderHarnessExecutionResult } from '../../testing/builder-harness';
export declare function executeOnceAndFetch<T>(harness: BuilderHarness<T>, url: string, options?: Partial<BuilderHarnessExecutionOptions> & {
    request?: RequestInit;
}): Promise<BuilderHarnessExecutionResult & {
    response?: Response;
}>;
