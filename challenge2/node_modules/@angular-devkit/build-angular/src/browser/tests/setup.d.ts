/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Schema } from '../schema';
export { describeBuilder } from '../../testing';
export declare const BROWSER_BUILDER_INFO: Readonly<{
    name: string;
    schemaPath: string;
}>;
/**
 * Contains all required browser builder fields.
 * Also disables progress reporting to minimize logging output.
 */
export declare const BASE_OPTIONS: Readonly<Schema>;
