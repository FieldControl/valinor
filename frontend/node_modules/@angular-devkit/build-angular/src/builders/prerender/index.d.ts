/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { json } from '@angular-devkit/core';
import { Schema } from './schema';
type PrerenderBuilderOptions = Schema & json.JsonObject;
type PrerenderBuilderOutput = BuilderOutput;
/**
 * Builds the browser and server, then renders each route in options.routes
 * and writes them to prerender/<route>/index.html for each output path in
 * the browser result.
 */
export declare function execute(options: PrerenderBuilderOptions, context: BuilderContext): Promise<PrerenderBuilderOutput>;
declare const _default: import("../../../../architect/src/internal").Builder<Schema & json.JsonObject>;
export default _default;
