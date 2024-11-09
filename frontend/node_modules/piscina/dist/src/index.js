"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _DirectlyTransferable_value, _ArrayBufferViewTransferable_view, _Piscina_pool;
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.queueOptionsSymbol = exports.valueSymbol = exports.transferableSymbol = exports.Piscina = exports.workerData = exports.isWorkerThread = exports.move = void 0;
const worker_threads_1 = require("worker_threads");
const events_1 = require("events");
const async_hooks_1 = require("async_hooks");
const os_1 = require("os");
const url_1 = require("url");
const path_1 = require("path");
const util_1 = require("util");
const assert_1 = __importDefault(require("assert"));
const perf_hooks_1 = require("perf_hooks");
const common_1 = require("./common");
Object.defineProperty(exports, "queueOptionsSymbol", { enumerable: true, get: function () { return common_1.kQueueOptions; } });
Object.defineProperty(exports, "transferableSymbol", { enumerable: true, get: function () { return common_1.kTransferable; } });
Object.defineProperty(exports, "valueSymbol", { enumerable: true, get: function () { return common_1.kValue; } });
const package_json_1 = require("../package.json");
Object.defineProperty(exports, "version", { enumerable: true, get: function () { return package_json_1.version; } });
const promises_1 = require("timers/promises");
const cpuCount = (() => {
    try {
        return (0, os_1.cpus)().length;
    }
    catch {
        /* istanbul ignore next */
        return 1;
    }
})();
/* eslint-enable camelcase */
function createHistogramSummary(histogram) {
    const { mean, stddev, min, max } = histogram;
    return {
        average: mean / 1000,
        mean: mean / 1000,
        stddev,
        min: min / 1000,
        max: max / 1000,
        p0_001: histogram.percentile(0.001) / 1000,
        p0_01: histogram.percentile(0.01) / 1000,
        p0_1: histogram.percentile(0.1) / 1000,
        p1: histogram.percentile(1) / 1000,
        p2_5: histogram.percentile(2.5) / 1000,
        p10: histogram.percentile(10) / 1000,
        p25: histogram.percentile(25) / 1000,
        p50: histogram.percentile(50) / 1000,
        p75: histogram.percentile(75) / 1000,
        p90: histogram.percentile(90) / 1000,
        p97_5: histogram.percentile(97.5) / 1000,
        p99: histogram.percentile(99) / 1000,
        p99_9: histogram.percentile(99.9) / 1000,
        p99_99: histogram.percentile(99.99) / 1000,
        p99_999: histogram.percentile(99.999) / 1000
    };
}
function toHistogramIntegerNano(milliseconds) {
    return Math.max(1, Math.trunc(milliseconds * 1000));
}
;
function onabort(abortSignal, listener) {
    if ('addEventListener' in abortSignal) {
        abortSignal.addEventListener('abort', listener, { once: true });
    }
    else {
        abortSignal.once('abort', listener);
    }
}
class AbortError extends Error {
    constructor(reason) {
        // TS does not recognizes the cause clause
        // @ts-expect-error
        super('The task has been aborted', { cause: reason });
    }
    get name() { return 'AbortError'; }
}
class ArrayTaskQueue {
    constructor() {
        this.tasks = [];
    }
    get size() { return this.tasks.length; }
    shift() {
        return this.tasks.shift();
    }
    push(task) {
        this.tasks.push(task);
    }
    remove(task) {
        const index = this.tasks.indexOf(task);
        assert_1.default.notStrictEqual(index, -1);
        this.tasks.splice(index, 1);
    }
}
const kDefaultOptions = {
    filename: null,
    name: 'default',
    minThreads: Math.max(Math.floor(cpuCount / 2), 1),
    maxThreads: cpuCount * 1.5,
    idleTimeout: 0,
    maxQueue: Infinity,
    concurrentTasksPerWorker: 1,
    useAtomics: true,
    taskQueue: new ArrayTaskQueue(),
    niceIncrement: 0,
    trackUnmanagedFds: true,
    closeTimeout: 30000,
    recordTiming: true
};
const kDefaultRunOptions = {
    transferList: undefined,
    filename: null,
    signal: null,
    name: null
};
const kDefaultCloseOptions = {
    force: false
};
class DirectlyTransferable {
    constructor(value) {
        _DirectlyTransferable_value.set(this, void 0);
        __classPrivateFieldSet(this, _DirectlyTransferable_value, value, "f");
    }
    get [(_DirectlyTransferable_value = new WeakMap(), common_1.kTransferable)]() { return __classPrivateFieldGet(this, _DirectlyTransferable_value, "f"); }
    get [common_1.kValue]() { return __classPrivateFieldGet(this, _DirectlyTransferable_value, "f"); }
}
class ArrayBufferViewTransferable {
    constructor(view) {
        _ArrayBufferViewTransferable_view.set(this, void 0);
        __classPrivateFieldSet(this, _ArrayBufferViewTransferable_view, view, "f");
    }
    get [(_ArrayBufferViewTransferable_view = new WeakMap(), common_1.kTransferable)]() { return __classPrivateFieldGet(this, _ArrayBufferViewTransferable_view, "f").buffer; }
    get [common_1.kValue]() { return __classPrivateFieldGet(this, _ArrayBufferViewTransferable_view, "f"); }
}
let taskIdCounter = 0;
function maybeFileURLToPath(filename) {
    return filename.startsWith('file:')
        ? (0, url_1.fileURLToPath)(new url_1.URL(filename))
        : filename;
}
// Extend AsyncResource so that async relations between posting a task and
// receiving its result are visible to diagnostic tools.
class TaskInfo extends async_hooks_1.AsyncResource {
    constructor(task, transferList, filename, name, callback, abortSignal, triggerAsyncId) {
        super('Piscina.Task', { requireManualDestroy: true, triggerAsyncId });
        this.abortListener = null;
        this.workerInfo = null;
        this.callback = callback;
        this.task = task;
        this.transferList = transferList;
        // If the task is a Transferable returned by
        // Piscina.move(), then add it to the transferList
        // automatically
        if ((0, common_1.isMovable)(task)) {
            // This condition should never be hit but typescript
            // complains if we dont do the check.
            /* istanbul ignore if */
            if (this.transferList == null) {
                this.transferList = [];
            }
            this.transferList =
                this.transferList.concat(task[common_1.kTransferable]);
            this.task = task[common_1.kValue];
        }
        this.filename = filename;
        this.name = name;
        this.taskId = taskIdCounter++;
        this.abortSignal = abortSignal;
        this.created = perf_hooks_1.performance.now();
        this.started = 0;
    }
    releaseTask() {
        const ret = this.task;
        this.task = null;
        return ret;
    }
    done(err, result) {
        this.runInAsyncScope(this.callback, null, err, result);
        this.emitDestroy(); // `TaskInfo`s are used only once.
        // If an abort signal was used, remove the listener from it when
        // done to make sure we do not accidentally leak.
        if (this.abortSignal && this.abortListener) {
            if ('removeEventListener' in this.abortSignal && this.abortListener) {
                this.abortSignal.removeEventListener('abort', this.abortListener);
            }
            else {
                this.abortSignal.off('abort', this.abortListener);
            }
        }
    }
    get [common_1.kQueueOptions]() {
        return common_1.kQueueOptions in this.task ? this.task[common_1.kQueueOptions] : null;
    }
}
class AsynchronouslyCreatedResource {
    constructor() {
        this.onreadyListeners = [];
    }
    markAsReady() {
        const listeners = this.onreadyListeners;
        (0, assert_1.default)(listeners !== null);
        this.onreadyListeners = null;
        for (const listener of listeners) {
            listener();
        }
    }
    isReady() {
        return this.onreadyListeners === null;
    }
    onReady(fn) {
        if (this.onreadyListeners === null) {
            fn(); // Zalgo is okay here.
            return;
        }
        this.onreadyListeners.push(fn);
    }
}
class AsynchronouslyCreatedResourcePool {
    constructor(maximumUsage) {
        this.pendingItems = new Set();
        this.readyItems = new Set();
        this.maximumUsage = maximumUsage;
        this.onAvailableListeners = [];
    }
    add(item) {
        this.pendingItems.add(item);
        item.onReady(() => {
            /* istanbul ignore else */
            if (this.pendingItems.has(item)) {
                this.pendingItems.delete(item);
                this.readyItems.add(item);
                this.maybeAvailable(item);
            }
        });
    }
    delete(item) {
        this.pendingItems.delete(item);
        this.readyItems.delete(item);
    }
    findAvailable() {
        let minUsage = this.maximumUsage;
        let candidate = null;
        for (const item of this.readyItems) {
            const usage = item.currentUsage();
            if (usage === 0)
                return item;
            if (usage < minUsage) {
                candidate = item;
                minUsage = usage;
            }
        }
        return candidate;
    }
    *[Symbol.iterator]() {
        yield* this.pendingItems;
        yield* this.readyItems;
    }
    get size() {
        return this.pendingItems.size + this.readyItems.size;
    }
    maybeAvailable(item) {
        /* istanbul ignore else */
        if (item.currentUsage() < this.maximumUsage) {
            for (const listener of this.onAvailableListeners) {
                listener(item);
            }
        }
    }
    onAvailable(fn) {
        this.onAvailableListeners.push(fn);
    }
}
const Errors = {
    ThreadTermination: () => new Error('Terminating worker thread'),
    FilenameNotProvided: () => new Error('filename must be provided to run() or in options object'),
    TaskQueueAtLimit: () => new Error('Task queue is at limit'),
    NoTaskQueueAvailable: () => new Error('No task queue available and all Workers are busy'),
    CloseTimeout: () => new Error('Close operation timed out')
};
class WorkerInfo extends AsynchronouslyCreatedResource {
    constructor(worker, port, onMessage) {
        super();
        this.idleTimeout = null; // eslint-disable-line no-undef
        this.lastSeenResponseCount = 0;
        this.worker = worker;
        this.port = port;
        this.port.on('message', (message) => this._handleResponse(message));
        this.onMessage = onMessage;
        this.taskInfos = new Map();
        this.sharedBuffer = new Int32Array(new SharedArrayBuffer(common_1.kFieldCount * Int32Array.BYTES_PER_ELEMENT));
    }
    destroy() {
        this.worker.terminate();
        this.port.close();
        this.clearIdleTimeout();
        for (const taskInfo of this.taskInfos.values()) {
            taskInfo.done(Errors.ThreadTermination());
        }
        this.taskInfos.clear();
    }
    clearIdleTimeout() {
        if (this.idleTimeout !== null) {
            clearTimeout(this.idleTimeout);
            this.idleTimeout = null;
        }
    }
    ref() {
        this.port.ref();
        return this;
    }
    unref() {
        // Note: Do not call ref()/unref() on the Worker itself since that may cause
        // a hard crash, see https://github.com/nodejs/node/pull/33394.
        this.port.unref();
        return this;
    }
    _handleResponse(message) {
        this.onMessage(message);
        if (this.taskInfos.size === 0) {
            // No more tasks running on this Worker means it should not keep the
            // process running.
            this.unref();
        }
    }
    postTask(taskInfo) {
        (0, assert_1.default)(!this.taskInfos.has(taskInfo.taskId));
        const message = {
            task: taskInfo.releaseTask(),
            taskId: taskInfo.taskId,
            filename: taskInfo.filename,
            name: taskInfo.name
        };
        try {
            this.port.postMessage(message, taskInfo.transferList);
        }
        catch (err) {
            // This would mostly happen if e.g. message contains unserializable data
            // or transferList is invalid.
            taskInfo.done(err);
            return;
        }
        taskInfo.workerInfo = this;
        this.taskInfos.set(taskInfo.taskId, taskInfo);
        this.ref();
        this.clearIdleTimeout();
        // Inform the worker that there are new messages posted, and wake it up
        // if it is waiting for one.
        Atomics.add(this.sharedBuffer, common_1.kRequestCountField, 1);
        Atomics.notify(this.sharedBuffer, common_1.kRequestCountField, 1);
    }
    processPendingMessages() {
        // If we *know* that there are more messages than we have received using
        // 'message' events yet, then try to load and handle them synchronously,
        // without the need to wait for more expensive events on the event loop.
        // This would usually break async tracking, but in our case, we already have
        // the extra TaskInfo/AsyncResource layer that rectifies that situation.
        const actualResponseCount = Atomics.load(this.sharedBuffer, common_1.kResponseCountField);
        if (actualResponseCount !== this.lastSeenResponseCount) {
            this.lastSeenResponseCount = actualResponseCount;
            let entry;
            while ((entry = (0, worker_threads_1.receiveMessageOnPort)(this.port)) !== undefined) {
                this._handleResponse(entry.message);
            }
        }
    }
    isRunningAbortableTask() {
        // If there are abortable tasks, we are running one at most per Worker.
        if (this.taskInfos.size !== 1)
            return false;
        const [[, task]] = this.taskInfos;
        return task.abortSignal !== null;
    }
    currentUsage() {
        if (this.isRunningAbortableTask())
            return Infinity;
        return this.taskInfos.size;
    }
}
class ThreadPool {
    constructor(publicInterface, options) {
        var _a;
        this.skipQueue = [];
        this.completed = 0;
        this.start = perf_hooks_1.performance.now();
        this.inProcessPendingMessages = false;
        this.startingUp = false;
        this.closingUp = false;
        this.workerFailsDuringBootstrap = false;
        this.destroying = false;
        this.publicInterface = publicInterface;
        this.taskQueue = options.taskQueue || new ArrayTaskQueue();
        const filename = options.filename ? maybeFileURLToPath(options.filename) : null;
        this.options = { ...kDefaultOptions, ...options, filename, maxQueue: 0 };
        if (this.options.recordTiming) {
            this.runTime = (0, perf_hooks_1.createHistogram)();
            this.waitTime = (0, perf_hooks_1.createHistogram)();
        }
        // The >= and <= could be > and < but this way we get 100 % coverage 🙃
        if (options.maxThreads !== undefined &&
            this.options.minThreads >= options.maxThreads) {
            this.options.minThreads = options.maxThreads;
        }
        if (options.minThreads !== undefined &&
            this.options.maxThreads <= options.minThreads) {
            this.options.maxThreads = options.minThreads;
        }
        if (options.maxQueue === 'auto') {
            this.options.maxQueue = this.options.maxThreads ** 2;
        }
        else {
            this.options.maxQueue = (_a = options.maxQueue) !== null && _a !== void 0 ? _a : kDefaultOptions.maxQueue;
        }
        this.workers = new AsynchronouslyCreatedResourcePool(this.options.concurrentTasksPerWorker);
        this.workers.onAvailable((w) => this._onWorkerAvailable(w));
        this.startingUp = true;
        this._ensureMinimumWorkers();
        this.startingUp = false;
        this.needsDrain = false;
    }
    _ensureMinimumWorkers() {
        if (this.closingUp || this.destroying) {
            return;
        }
        while (this.workers.size < this.options.minThreads) {
            this._addNewWorker();
        }
    }
    _addNewWorker() {
        const pool = this;
        const worker = new worker_threads_1.Worker((0, path_1.resolve)(__dirname, 'worker.js'), {
            env: this.options.env,
            argv: this.options.argv,
            execArgv: this.options.execArgv,
            resourceLimits: this.options.resourceLimits,
            workerData: this.options.workerData,
            trackUnmanagedFds: this.options.trackUnmanagedFds
        });
        const { port1, port2 } = new worker_threads_1.MessageChannel();
        const workerInfo = new WorkerInfo(worker, port1, onMessage);
        if (this.startingUp) {
            // There is no point in waiting for the initial set of Workers to indicate
            // that they are ready, we just mark them as such from the start.
            workerInfo.markAsReady();
        }
        const message = {
            filename: this.options.filename,
            name: this.options.name,
            port: port2,
            sharedBuffer: workerInfo.sharedBuffer,
            useAtomics: this.options.useAtomics,
            niceIncrement: this.options.niceIncrement
        };
        worker.postMessage(message, [port2]);
        function onMessage(message) {
            const { taskId, result } = message;
            // In case of success: Call the callback that was passed to `runTask`,
            // remove the `TaskInfo` associated with the Worker, which marks it as
            // free again.
            const taskInfo = workerInfo.taskInfos.get(taskId);
            workerInfo.taskInfos.delete(taskId);
            pool.workers.maybeAvailable(workerInfo);
            /* istanbul ignore if */
            if (taskInfo === undefined) {
                const err = new Error(`Unexpected message from Worker: ${(0, util_1.inspect)(message)}`);
                pool.publicInterface.emit('error', err);
            }
            else {
                taskInfo.done(message.error, result);
            }
            pool._processPendingMessages();
        }
        function onReady() {
            if (workerInfo.currentUsage() === 0) {
                workerInfo.unref();
            }
            if (!workerInfo.isReady()) {
                workerInfo.markAsReady();
            }
        }
        function onEventMessage(message) {
            pool.publicInterface.emit('message', message);
        }
        worker.on('message', (message) => {
            message instanceof Object && common_1.READY in message ? onReady() : onEventMessage(message);
        });
        worker.on('error', (err) => {
            this._onError(worker, workerInfo, err, false);
        });
        worker.on('exit', (exitCode) => {
            if (this.destroying) {
                return;
            }
            const err = new Error(`worker exited with code: ${exitCode}`);
            // Only error unfinished tasks on process exit, since there are legitimate
            // reasons to exit workers and we want to handle that gracefully when possible.
            this._onError(worker, workerInfo, err, true);
        });
        worker.unref();
        port1.on('close', () => {
            // The port is only closed if the Worker stops for some reason, but we
            // always .unref() the Worker itself. We want to receive e.g. 'error'
            // events on it, so we ref it once we know it's going to exit anyway.
            worker.ref();
        });
        this.workers.add(workerInfo);
    }
    _onError(worker, workerInfo, err, onlyErrorUnfinishedTasks) {
        // Work around the bug in https://github.com/nodejs/node/pull/33394
        worker.ref = () => { };
        const taskInfos = [...workerInfo.taskInfos.values()];
        workerInfo.taskInfos.clear();
        // Remove the worker from the list and potentially start a new Worker to
        // replace the current one.
        this._removeWorker(workerInfo);
        if (workerInfo.isReady() && !this.workerFailsDuringBootstrap) {
            this._ensureMinimumWorkers();
        }
        else {
            // Do not start new workers over and over if they already fail during
            // bootstrap, there's no point.
            this.workerFailsDuringBootstrap = true;
        }
        if (taskInfos.length > 0) {
            // If there are remaining unfinished tasks, call the callback that was
            // passed to `postTask` with the error
            for (const taskInfo of taskInfos) {
                taskInfo.done(err, null);
            }
        }
        else if (!onlyErrorUnfinishedTasks) {
            // If there are no unfinished tasks, instead emit an 'error' event
            this.publicInterface.emit('error', err);
        }
    }
    _processPendingMessages() {
        if (this.inProcessPendingMessages || !this.options.useAtomics) {
            return;
        }
        this.inProcessPendingMessages = true;
        try {
            for (const workerInfo of this.workers) {
                workerInfo.processPendingMessages();
            }
        }
        finally {
            this.inProcessPendingMessages = false;
        }
    }
    _removeWorker(workerInfo) {
        workerInfo.destroy();
        this.workers.delete(workerInfo);
    }
    _onWorkerAvailable(workerInfo) {
        var _a;
        while ((this.taskQueue.size > 0 || this.skipQueue.length > 0) &&
            workerInfo.currentUsage() < this.options.concurrentTasksPerWorker) {
            // The skipQueue will have tasks that we previously shifted off
            // the task queue but had to skip over... we have to make sure
            // we drain that before we drain the taskQueue.
            const taskInfo = this.skipQueue.shift() ||
                this.taskQueue.shift();
            // If the task has an abortSignal and the worker has any other
            // tasks, we cannot distribute the task to it. Skip for now.
            if (taskInfo.abortSignal && workerInfo.taskInfos.size > 0) {
                this.skipQueue.push(taskInfo);
                break;
            }
            const now = perf_hooks_1.performance.now();
            (_a = this.waitTime) === null || _a === void 0 ? void 0 : _a.record(toHistogramIntegerNano(now - taskInfo.created));
            taskInfo.started = now;
            workerInfo.postTask(taskInfo);
            this._maybeDrain();
            return;
        }
        if (workerInfo.taskInfos.size === 0 &&
            this.workers.size > this.options.minThreads) {
            workerInfo.idleTimeout = setTimeout(() => {
                assert_1.default.strictEqual(workerInfo.taskInfos.size, 0);
                if (this.workers.size > this.options.minThreads) {
                    this._removeWorker(workerInfo);
                }
            }, this.options.idleTimeout).unref();
        }
    }
    runTask(task, options) {
        var _a, _b;
        let { filename, name } = options;
        const { transferList = [] } = options;
        if (filename == null) {
            filename = this.options.filename;
        }
        if (name == null) {
            name = this.options.name;
        }
        if (typeof filename !== 'string') {
            return Promise.reject(Errors.FilenameNotProvided());
        }
        filename = maybeFileURLToPath(filename);
        let signal;
        if (this.closingUp) {
            const closingUpAbortController = new AbortController();
            closingUpAbortController.abort('queue is closing up');
            signal = closingUpAbortController.signal;
        }
        else {
            signal = (_a = options.signal) !== null && _a !== void 0 ? _a : null;
        }
        let resolve;
        let reject;
        // eslint-disable-next-line
        const ret = new Promise((res, rej) => { resolve = res; reject = rej; });
        const taskInfo = new TaskInfo(task, transferList, filename, name, (err, result) => {
            var _a;
            this.completed++;
            if (taskInfo.started) {
                (_a = this.runTime) === null || _a === void 0 ? void 0 : _a.record(toHistogramIntegerNano(perf_hooks_1.performance.now() - taskInfo.started));
            }
            if (err !== null) {
                reject(err);
            }
            else {
                resolve(result);
            }
            this._maybeDrain();
        }, signal, this.publicInterface.asyncResource.asyncId());
        if (signal !== null) {
            // If the AbortSignal has an aborted property and it's truthy,
            // reject immediately.
            if (signal.aborted) {
                return Promise.reject(new AbortError(signal.reason));
            }
            taskInfo.abortListener = () => {
                // Call reject() first to make sure we always reject with the AbortError
                // if the task is aborted, not with an Error from the possible
                // thread termination below.
                reject(new AbortError(signal.reason));
                if (taskInfo.workerInfo !== null) {
                    // Already running: We cancel the Worker this is running on.
                    this._removeWorker(taskInfo.workerInfo);
                    this._ensureMinimumWorkers();
                }
                else {
                    // Not yet running: Remove it from the queue.
                    this.taskQueue.remove(taskInfo);
                }
            };
            onabort(signal, taskInfo.abortListener);
        }
        // If there is a task queue, there's no point in looking for an available
        // Worker thread. Add this task to the queue, if possible.
        if (this.taskQueue.size > 0) {
            const totalCapacity = this.options.maxQueue + this.pendingCapacity();
            if (this.taskQueue.size >= totalCapacity) {
                if (this.options.maxQueue === 0) {
                    return Promise.reject(Errors.NoTaskQueueAvailable());
                }
                else {
                    return Promise.reject(Errors.TaskQueueAtLimit());
                }
            }
            else {
                if (this.workers.size < this.options.maxThreads) {
                    this._addNewWorker();
                }
                this.taskQueue.push(taskInfo);
            }
            this._maybeDrain();
            return ret;
        }
        // Look for a Worker with a minimum number of tasks it is currently running.
        let workerInfo = this.workers.findAvailable();
        // If we want the ability to abort this task, use only workers that have
        // no running tasks.
        if (workerInfo !== null && workerInfo.currentUsage() > 0 && signal) {
            workerInfo = null;
        }
        // If no Worker was found, or that Worker was handling another task in some
        // way, and we still have the ability to spawn new threads, do so.
        let waitingForNewWorker = false;
        if ((workerInfo === null || workerInfo.currentUsage() > 0) &&
            this.workers.size < this.options.maxThreads) {
            this._addNewWorker();
            waitingForNewWorker = true;
        }
        // If no Worker is found, try to put the task into the queue.
        if (workerInfo === null) {
            if (this.options.maxQueue <= 0 && !waitingForNewWorker) {
                return Promise.reject(Errors.NoTaskQueueAvailable());
            }
            else {
                this.taskQueue.push(taskInfo);
            }
            this._maybeDrain();
            return ret;
        }
        // TODO(addaleax): Clean up the waitTime/runTime recording.
        const now = perf_hooks_1.performance.now();
        (_b = this.waitTime) === null || _b === void 0 ? void 0 : _b.record(toHistogramIntegerNano(now - taskInfo.created));
        taskInfo.started = now;
        workerInfo.postTask(taskInfo);
        this._maybeDrain();
        return ret;
    }
    pendingCapacity() {
        return this.workers.pendingItems.size *
            this.options.concurrentTasksPerWorker;
    }
    _maybeDrain() {
        const totalCapacity = this.options.maxQueue + this.pendingCapacity();
        const totalQueueSize = this.taskQueue.size + this.skipQueue.length;
        if (totalQueueSize === 0) {
            this.needsDrain = false;
            this.publicInterface.emit('drain');
        }
        if (totalQueueSize >= totalCapacity) {
            this.needsDrain = true;
            this.publicInterface.emit('needsDrain');
        }
    }
    async destroy() {
        this.destroying = true;
        while (this.skipQueue.length > 0) {
            const taskInfo = this.skipQueue.shift();
            taskInfo.done(new Error('Terminating worker thread'));
        }
        while (this.taskQueue.size > 0) {
            const taskInfo = this.taskQueue.shift();
            taskInfo.done(new Error('Terminating worker thread'));
        }
        const exitEvents = [];
        while (this.workers.size > 0) {
            const [workerInfo] = this.workers;
            exitEvents.push((0, events_1.once)(workerInfo.worker, 'exit'));
            this._removeWorker(workerInfo);
        }
        try {
            await Promise.all(exitEvents);
        }
        finally {
            this.destroying = false;
        }
    }
    async close(options) {
        this.closingUp = true;
        if (options.force) {
            const skipQueueLength = this.skipQueue.length;
            for (let i = 0; i < skipQueueLength; i++) {
                const taskInfo = this.skipQueue.shift();
                if (taskInfo.workerInfo === null) {
                    taskInfo.done(new AbortError('pool is closed'));
                }
                else {
                    this.skipQueue.push(taskInfo);
                }
            }
            const taskQueueLength = this.taskQueue.size;
            for (let i = 0; i < taskQueueLength; i++) {
                const taskInfo = this.taskQueue.shift();
                if (taskInfo.workerInfo === null) {
                    taskInfo.done(new AbortError('pool is closed'));
                }
                else {
                    this.taskQueue.push(taskInfo);
                }
            }
        }
        const onPoolFlushed = () => new Promise((resolve) => {
            const numberOfWorkers = this.workers.size;
            let numberOfWorkersDone = 0;
            const checkIfWorkerIsDone = (workerInfo) => {
                if (workerInfo.taskInfos.size === 0) {
                    numberOfWorkersDone++;
                }
                if (numberOfWorkers === numberOfWorkersDone) {
                    resolve();
                }
            };
            for (const workerInfo of this.workers) {
                checkIfWorkerIsDone(workerInfo);
                workerInfo.port.on('message', () => checkIfWorkerIsDone(workerInfo));
            }
        });
        const throwOnTimeOut = async (timeout) => {
            await (0, promises_1.setTimeout)(timeout);
            throw Errors.CloseTimeout();
        };
        try {
            await Promise.race([
                onPoolFlushed(),
                throwOnTimeOut(this.options.closeTimeout)
            ]);
        }
        catch (error) {
            this.publicInterface.emit('error', error);
        }
        finally {
            await this.destroy();
            this.publicInterface.emit('close');
            this.closingUp = false;
        }
    }
}
class Piscina extends events_1.EventEmitterAsyncResource {
    constructor(options = {}) {
        super({ ...options, name: 'Piscina' });
        _Piscina_pool.set(this, void 0);
        if (typeof options.filename !== 'string' && options.filename != null) {
            throw new TypeError('options.filename must be a string or null');
        }
        if (typeof options.name !== 'string' && options.name != null) {
            throw new TypeError('options.name must be a string or null');
        }
        if (options.minThreads !== undefined &&
            (typeof options.minThreads !== 'number' || options.minThreads < 0)) {
            throw new TypeError('options.minThreads must be a non-negative integer');
        }
        if (options.maxThreads !== undefined &&
            (typeof options.maxThreads !== 'number' || options.maxThreads < 1)) {
            throw new TypeError('options.maxThreads must be a positive integer');
        }
        if (options.minThreads !== undefined && options.maxThreads !== undefined &&
            options.minThreads > options.maxThreads) {
            throw new RangeError('options.minThreads and options.maxThreads must not conflict');
        }
        if (options.idleTimeout !== undefined &&
            (typeof options.idleTimeout !== 'number' || options.idleTimeout < 0)) {
            throw new TypeError('options.idleTimeout must be a non-negative integer');
        }
        if (options.maxQueue !== undefined &&
            options.maxQueue !== 'auto' &&
            (typeof options.maxQueue !== 'number' || options.maxQueue < 0)) {
            throw new TypeError('options.maxQueue must be a non-negative integer');
        }
        if (options.concurrentTasksPerWorker !== undefined &&
            (typeof options.concurrentTasksPerWorker !== 'number' ||
                options.concurrentTasksPerWorker < 1)) {
            throw new TypeError('options.concurrentTasksPerWorker must be a positive integer');
        }
        if (options.useAtomics !== undefined &&
            typeof options.useAtomics !== 'boolean') {
            throw new TypeError('options.useAtomics must be a boolean value');
        }
        if (options.resourceLimits !== undefined &&
            (typeof options.resourceLimits !== 'object' ||
                options.resourceLimits === null)) {
            throw new TypeError('options.resourceLimits must be an object');
        }
        if (options.taskQueue !== undefined && !(0, common_1.isTaskQueue)(options.taskQueue)) {
            throw new TypeError('options.taskQueue must be a TaskQueue object');
        }
        if (options.niceIncrement !== undefined &&
            (typeof options.niceIncrement !== 'number' || options.niceIncrement < 0)) {
            throw new TypeError('options.niceIncrement must be a non-negative integer');
        }
        if (options.trackUnmanagedFds !== undefined &&
            typeof options.trackUnmanagedFds !== 'boolean') {
            throw new TypeError('options.trackUnmanagedFds must be a boolean value');
        }
        if (options.closeTimeout !== undefined && (typeof options.closeTimeout !== 'number' || options.closeTimeout < 0)) {
            throw new TypeError('options.closeTimeout must be a non-negative integer');
        }
        __classPrivateFieldSet(this, _Piscina_pool, new ThreadPool(this, options), "f");
    }
    /** @deprecated Use run(task, options) instead **/
    runTask(task, transferList, filename, signal) {
        // If transferList is a string or AbortSignal, shift it.
        if ((typeof transferList === 'object' && !Array.isArray(transferList)) ||
            typeof transferList === 'string') {
            signal = filename;
            filename = transferList;
            transferList = undefined;
        }
        // If filename is an AbortSignal, shift it.
        if (typeof filename === 'object' && !Array.isArray(filename)) {
            signal = filename;
            filename = undefined;
        }
        if (transferList !== undefined && !Array.isArray(transferList)) {
            return Promise.reject(new TypeError('transferList argument must be an Array'));
        }
        if (filename !== undefined && typeof filename !== 'string') {
            return Promise.reject(new TypeError('filename argument must be a string'));
        }
        if (signal !== undefined && typeof signal !== 'object') {
            return Promise.reject(new TypeError('signal argument must be an object'));
        }
        return __classPrivateFieldGet(this, _Piscina_pool, "f").runTask(task, {
            transferList,
            filename: filename || null,
            name: 'default',
            signal: signal || null
        });
    }
    run(task, options = kDefaultRunOptions) {
        if (options === null || typeof options !== 'object') {
            return Promise.reject(new TypeError('options must be an object'));
        }
        const { transferList, filename, name, signal } = options;
        if (transferList !== undefined && !Array.isArray(transferList)) {
            return Promise.reject(new TypeError('transferList argument must be an Array'));
        }
        if (filename != null && typeof filename !== 'string') {
            return Promise.reject(new TypeError('filename argument must be a string'));
        }
        if (name != null && typeof name !== 'string') {
            return Promise.reject(new TypeError('name argument must be a string'));
        }
        if (signal != null && typeof signal !== 'object') {
            return Promise.reject(new TypeError('signal argument must be an object'));
        }
        return __classPrivateFieldGet(this, _Piscina_pool, "f").runTask(task, { transferList, filename, name, signal });
    }
    async close(options = kDefaultCloseOptions) {
        if (options === null || typeof options !== 'object') {
            throw TypeError('options must be an object');
        }
        let { force } = options;
        if (force !== undefined && typeof force !== 'boolean') {
            return Promise.reject(new TypeError('force argument must be a boolean'));
        }
        force !== null && force !== void 0 ? force : (force = kDefaultCloseOptions.force);
        return __classPrivateFieldGet(this, _Piscina_pool, "f").close({
            force
        });
    }
    destroy() {
        return __classPrivateFieldGet(this, _Piscina_pool, "f").destroy();
    }
    get maxThreads() {
        return __classPrivateFieldGet(this, _Piscina_pool, "f").options.maxThreads;
    }
    get minThreads() {
        return __classPrivateFieldGet(this, _Piscina_pool, "f").options.minThreads;
    }
    get options() {
        return __classPrivateFieldGet(this, _Piscina_pool, "f").options;
    }
    get threads() {
        const ret = [];
        for (const workerInfo of __classPrivateFieldGet(this, _Piscina_pool, "f").workers) {
            ret.push(workerInfo.worker);
        }
        return ret;
    }
    get queueSize() {
        const pool = __classPrivateFieldGet(this, _Piscina_pool, "f");
        return Math.max(pool.taskQueue.size - pool.pendingCapacity(), 0);
    }
    get completed() {
        return __classPrivateFieldGet(this, _Piscina_pool, "f").completed;
    }
    get waitTime() {
        if (!__classPrivateFieldGet(this, _Piscina_pool, "f").waitTime) {
            return null;
        }
        return createHistogramSummary(__classPrivateFieldGet(this, _Piscina_pool, "f").waitTime);
    }
    get runTime() {
        if (!__classPrivateFieldGet(this, _Piscina_pool, "f").runTime) {
            return null;
        }
        return createHistogramSummary(__classPrivateFieldGet(this, _Piscina_pool, "f").runTime);
    }
    get utilization() {
        if (!__classPrivateFieldGet(this, _Piscina_pool, "f").runTime) {
            return 0;
        }
        // count is available as of Node.js v16.14.0 but not present in the types
        const count = __classPrivateFieldGet(this, _Piscina_pool, "f").runTime.count;
        if (count === 0) {
            return 0;
        }
        // The capacity is the max compute time capacity of the
        // pool to this point in time as determined by the length
        // of time the pool has been running multiplied by the
        // maximum number of threads.
        const capacity = this.duration * __classPrivateFieldGet(this, _Piscina_pool, "f").options.maxThreads;
        const totalMeanRuntime = (__classPrivateFieldGet(this, _Piscina_pool, "f").runTime.mean / 1000) * count;
        // We calculate the appoximate pool utilization by multiplying
        // the mean run time of all tasks by the number of runtime
        // samples taken and dividing that by the capacity. The
        // theory here is that capacity represents the absolute upper
        // limit of compute time this pool could ever attain (but
        // never will for a variety of reasons. Multiplying the
        // mean run time by the number of tasks sampled yields an
        // approximation of the realized compute time. The utilization
        // then becomes a point-in-time measure of how active the
        // pool is.
        return totalMeanRuntime / capacity;
    }
    get duration() {
        return perf_hooks_1.performance.now() - __classPrivateFieldGet(this, _Piscina_pool, "f").start;
    }
    get needsDrain() {
        return __classPrivateFieldGet(this, _Piscina_pool, "f").needsDrain;
    }
    static get isWorkerThread() {
        return common_1.commonState.isWorkerThread;
    }
    static get workerData() {
        return common_1.commonState.workerData;
    }
    static get version() {
        return package_json_1.version;
    }
    static get Piscina() {
        return Piscina;
    }
    static move(val) {
        if (val != null && typeof val === 'object' && typeof val !== 'function') {
            if (!(0, common_1.isTransferable)(val)) {
                if (util_1.types.isArrayBufferView(val)) {
                    val = new ArrayBufferViewTransferable(val);
                }
                else {
                    val = new DirectlyTransferable(val);
                }
            }
            (0, common_1.markMovable)(val);
        }
        return val;
    }
    static get transferableSymbol() { return common_1.kTransferable; }
    static get valueSymbol() { return common_1.kValue; }
    static get queueOptionsSymbol() { return common_1.kQueueOptions; }
}
exports.Piscina = Piscina;
_Piscina_pool = new WeakMap();
exports.default = Piscina;
exports.move = Piscina.move;
exports.isWorkerThread = Piscina.isWorkerThread;
exports.workerData = Piscina.workerData;
//# sourceMappingURL=index.js.map