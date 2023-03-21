/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Logger } from '../../../src/ngtsc/logging';
import { AsyncLocker } from '../locking/async_locker';
import { SyncLocker } from '../locking/sync_locker';
import { AnalyzeEntryPointsFn, CreateCompileFn, Executor } from './api';
import { CreateTaskCompletedCallback } from './tasks/api';
export declare abstract class SingleProcessorExecutorBase {
    private logger;
    private createTaskCompletedCallback;
    constructor(logger: Logger, createTaskCompletedCallback: CreateTaskCompletedCallback);
    doExecute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn): void | Promise<void>;
}
/**
 * An `Executor` that processes all tasks serially and completes synchronously.
 */
export declare class SingleProcessExecutorSync extends SingleProcessorExecutorBase implements Executor {
    private lockFile;
    constructor(logger: Logger, lockFile: SyncLocker, createTaskCompletedCallback: CreateTaskCompletedCallback);
    execute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn): void;
}
/**
 * An `Executor` that processes all tasks serially, but still completes asynchronously.
 */
export declare class SingleProcessExecutorAsync extends SingleProcessorExecutorBase implements Executor {
    private lockFile;
    constructor(logger: Logger, lockFile: AsyncLocker, createTaskCompletedCallback: CreateTaskCompletedCallback);
    execute(analyzeEntryPoints: AnalyzeEntryPointsFn, createCompileFn: CreateCompileFn): Promise<void>;
}
