/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Logger } from '../../../../src/ngtsc/logging';
import { CreateCompileFn } from '../api';
export declare function startWorker(logger: Logger, createCompileFn: CreateCompileFn): Promise<void>;
