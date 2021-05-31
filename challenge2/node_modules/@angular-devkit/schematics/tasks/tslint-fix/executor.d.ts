/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TaskExecutor } from '../../src';
import { TslintFixTaskOptions } from './options';
/** @deprecated since version 11. Use `ng lint --fix` directly instead. */
export default function (): TaskExecutor<TslintFixTaskOptions>;
