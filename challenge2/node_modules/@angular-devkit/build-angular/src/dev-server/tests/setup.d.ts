/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Schema as BrowserSchema } from '../../browser/schema';
import { BuilderHarness } from '../../testing/builder-harness';
import { Schema } from '../schema';
export { describeBuilder } from '../../testing';
export declare const DEV_SERVER_BUILDER_INFO: Readonly<{
    name: string;
    schemaPath: string;
}>;
/**
 * Contains all required dev-server builder fields.
 * The port is also set to zero to ensure a free port is used for each test which
 * supports parallel test execution.
 */
export declare const BASE_OPTIONS: Readonly<Schema>;
/**
 * Maximum time for single build/rebuild
 * This accounts for CI variability.
 */
export declare const BUILD_TIMEOUT = 15000;
/**
 * Adds a `build` target to a builder test harness for the browser builder with the base options
 * used by the browser builder tests.
 *
 * @param harness The builder harness to use when setting up the browser builder target
 * @param extraOptions The additional options that should be used when executing the target.
 */
export declare function setupBrowserTarget<T>(harness: BuilderHarness<T>, extraOptions?: Partial<BrowserSchema>): void;
