/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { execute } from './builder';
import type { DevServerBuilderOutput } from './output';
import type { Schema as DevServerBuilderOptions } from './schema';
export { type DevServerBuilderOptions, type DevServerBuilderOutput, execute as executeDevServerBuilder, };
declare const _default: import("../../../../../angular_devkit/architect/src/internal").Builder<DevServerBuilderOptions & import("../../../../../angular_devkit/core/src").JsonObject>;
export default _default;
export { execute as executeDevServer };
