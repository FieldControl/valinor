/// <reference types="node" />
/// <reference types="node" />
import { Worker, MessagePort } from 'worker_threads';
import { EventEmitterAsyncResource } from 'events';
import { Transferable, TaskQueue, kQueueOptions, kTransferable, kValue } from './common';
import { version } from '../package.json';
interface AbortSignalEventTargetAddOptions {
    once: boolean;
}
interface AbortSignalEventTarget {
    addEventListener: (name: 'abort', listener: () => void, options?: AbortSignalEventTargetAddOptions) => void;
    removeEventListener: (name: 'abort', listener: () => void) => void;
    aborted?: boolean;
    reason?: unknown;
}
interface AbortSignalEventEmitter {
    off: (name: 'abort', listener: () => void) => void;
    once: (name: 'abort', listener: () => void) => void;
}
type AbortSignalAny = AbortSignalEventTarget | AbortSignalEventEmitter;
type ResourceLimits = Worker extends {
    resourceLimits?: infer T;
} ? T : {};
type EnvSpecifier = typeof Worker extends {
    new (filename: never, options?: {
        env: infer T;
    }): Worker;
} ? T : never;
interface Options {
    filename?: string | null;
    name?: string;
    minThreads?: number;
    maxThreads?: number;
    idleTimeout?: number;
    maxQueue?: number | 'auto';
    concurrentTasksPerWorker?: number;
    useAtomics?: boolean;
    resourceLimits?: ResourceLimits;
    argv?: string[];
    execArgv?: string[];
    env?: EnvSpecifier;
    workerData?: any;
    taskQueue?: TaskQueue;
    niceIncrement?: number;
    trackUnmanagedFds?: boolean;
    closeTimeout?: number;
    recordTiming?: boolean;
}
interface FilledOptions extends Options {
    filename: string | null;
    name: string;
    minThreads: number;
    maxThreads: number;
    idleTimeout: number;
    maxQueue: number;
    concurrentTasksPerWorker: number;
    useAtomics: boolean;
    taskQueue: TaskQueue;
    niceIncrement: number;
    closeTimeout: number;
    recordTiming: boolean;
}
interface RunOptions {
    transferList?: TransferList;
    filename?: string | null;
    signal?: AbortSignalAny | null;
    name?: string | null;
}
interface CloseOptions {
    force?: boolean;
}
type TransferList = MessagePort extends {
    postMessage(value: any, transferList: infer T): any;
} ? T : never;
type TransferListItem = TransferList extends (infer T)[] ? T : never;
export default class Piscina extends EventEmitterAsyncResource {
    #private;
    constructor(options?: Options);
    /** @deprecated Use run(task, options) instead **/
    runTask(task: any, transferList?: TransferList, filename?: string, abortSignal?: AbortSignalAny): Promise<any>;
    /** @deprecated Use run(task, options) instead **/
    runTask(task: any, transferList?: TransferList, filename?: AbortSignalAny, abortSignal?: undefined): Promise<any>;
    /** @deprecated Use run(task, options) instead **/
    runTask(task: any, transferList?: string, filename?: AbortSignalAny, abortSignal?: undefined): Promise<any>;
    /** @deprecated Use run(task, options) instead **/
    runTask(task: any, transferList?: AbortSignalAny, filename?: undefined, abortSignal?: undefined): Promise<any>;
    run(task: any, options?: RunOptions): Promise<any>;
    close(options?: CloseOptions): Promise<void>;
    destroy(): Promise<void>;
    get maxThreads(): number;
    get minThreads(): number;
    get options(): FilledOptions;
    get threads(): Worker[];
    get queueSize(): number;
    get completed(): number;
    get waitTime(): any;
    get runTime(): any;
    get utilization(): number;
    get duration(): number;
    get needsDrain(): boolean;
    static get isWorkerThread(): boolean;
    static get workerData(): any;
    static get version(): string;
    static get Piscina(): typeof Piscina;
    static move(val: Transferable | TransferListItem | ArrayBufferView | ArrayBuffer | MessagePort): ArrayBuffer | ArrayBufferView | MessagePort | Transferable;
    static get transferableSymbol(): symbol;
    static get valueSymbol(): symbol;
    static get queueOptionsSymbol(): symbol;
}
export declare const move: typeof Piscina.move;
export declare const isWorkerThread: boolean;
export declare const workerData: any;
export { Piscina, kTransferable as transferableSymbol, kValue as valueSymbol, kQueueOptions as queueOptionsSymbol, version };
