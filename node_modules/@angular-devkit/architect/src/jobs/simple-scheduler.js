"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleScheduler = exports.JobOutputSchemaValidationError = exports.JobInboundMessageSchemaValidationError = exports.JobArgumentSchemaValidationError = void 0;
const core_1 = require("@angular-devkit/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const api_1 = require("./api");
const exception_1 = require("./exception");
class JobArgumentSchemaValidationError extends core_1.schema.SchemaValidationException {
    constructor(errors) {
        super(errors, 'Job Argument failed to validate. Errors: ');
    }
}
exports.JobArgumentSchemaValidationError = JobArgumentSchemaValidationError;
class JobInboundMessageSchemaValidationError extends core_1.schema.SchemaValidationException {
    constructor(errors) {
        super(errors, 'Job Inbound Message failed to validate. Errors: ');
    }
}
exports.JobInboundMessageSchemaValidationError = JobInboundMessageSchemaValidationError;
class JobOutputSchemaValidationError extends core_1.schema.SchemaValidationException {
    constructor(errors) {
        super(errors, 'Job Output failed to validate. Errors: ');
    }
}
exports.JobOutputSchemaValidationError = JobOutputSchemaValidationError;
function _jobShare() {
    // This is the same code as a `shareReplay()` operator, but uses a dumber Subject rather than a
    // ReplaySubject.
    return (source) => {
        let refCount = 0;
        let subject;
        let hasError = false;
        let isComplete = false;
        let subscription;
        return new rxjs_1.Observable((subscriber) => {
            let innerSub;
            refCount++;
            if (!subject) {
                subject = new rxjs_1.Subject();
                innerSub = subject.subscribe(subscriber);
                subscription = source.subscribe({
                    next(value) {
                        subject.next(value);
                    },
                    error(err) {
                        hasError = true;
                        subject.error(err);
                    },
                    complete() {
                        isComplete = true;
                        subject.complete();
                    },
                });
            }
            else {
                innerSub = subject.subscribe(subscriber);
            }
            return () => {
                refCount--;
                innerSub.unsubscribe();
                if (subscription && refCount === 0 && (isComplete || hasError)) {
                    subscription.unsubscribe();
                }
            };
        });
    };
}
/**
 * Simple scheduler. Should be the base of all registries and schedulers.
 */
class SimpleScheduler {
    constructor(_jobRegistry, _schemaRegistry = new core_1.schema.CoreSchemaRegistry()) {
        this._jobRegistry = _jobRegistry;
        this._schemaRegistry = _schemaRegistry;
        this._internalJobDescriptionMap = new Map();
        this._queue = [];
        this._pauseCounter = 0;
    }
    _getInternalDescription(name) {
        const maybeHandler = this._internalJobDescriptionMap.get(name);
        if (maybeHandler !== undefined) {
            return (0, rxjs_1.of)(maybeHandler);
        }
        const handler = this._jobRegistry.get(name);
        return handler.pipe((0, operators_1.switchMap)((handler) => {
            if (handler === null) {
                return (0, rxjs_1.of)(null);
            }
            const description = {
                // Make a copy of it to be sure it's proper JSON.
                ...JSON.parse(JSON.stringify(handler.jobDescription)),
                name: handler.jobDescription.name || name,
                argument: handler.jobDescription.argument || true,
                input: handler.jobDescription.input || true,
                output: handler.jobDescription.output || true,
                channels: handler.jobDescription.channels || {},
            };
            const handlerWithExtra = Object.assign(handler.bind(undefined), {
                jobDescription: description,
                argumentV: this._schemaRegistry.compile(description.argument).pipe((0, operators_1.shareReplay)(1)),
                inputV: this._schemaRegistry.compile(description.input).pipe((0, operators_1.shareReplay)(1)),
                outputV: this._schemaRegistry.compile(description.output).pipe((0, operators_1.shareReplay)(1)),
            });
            this._internalJobDescriptionMap.set(name, handlerWithExtra);
            return (0, rxjs_1.of)(handlerWithExtra);
        }));
    }
    /**
     * Get a job description for a named job.
     *
     * @param name The name of the job.
     * @returns A description, or null if the job is not registered.
     */
    getDescription(name) {
        return (0, rxjs_1.concat)(this._getInternalDescription(name).pipe((0, operators_1.map)((x) => x && x.jobDescription)), (0, rxjs_1.of)(null)).pipe((0, operators_1.first)());
    }
    /**
     * Returns true if the job name has been registered.
     * @param name The name of the job.
     * @returns True if the job exists, false otherwise.
     */
    has(name) {
        return this.getDescription(name).pipe((0, operators_1.map)((x) => x !== null));
    }
    /**
     * Pause the scheduler, temporary queueing _new_ jobs. Returns a resume function that should be
     * used to resume execution. If multiple `pause()` were called, all their resume functions must
     * be called before the Scheduler actually starts new jobs. Additional calls to the same resume
     * function will have no effect.
     *
     * Jobs already running are NOT paused. This is pausing the scheduler only.
     */
    pause() {
        let called = false;
        this._pauseCounter++;
        return () => {
            if (!called) {
                called = true;
                if (--this._pauseCounter == 0) {
                    // Resume the queue.
                    const q = this._queue;
                    this._queue = [];
                    q.forEach((fn) => fn());
                }
            }
        };
    }
    /**
     * Schedule a job to be run, using its name.
     * @param name The name of job to be run.
     * @param argument The argument to send to the job when starting it.
     * @param options Scheduling options.
     * @returns The Job being run.
     */
    schedule(name, argument, options) {
        if (this._pauseCounter > 0) {
            const waitable = new rxjs_1.Subject();
            this._queue.push(() => waitable.complete());
            return this._scheduleJob(name, argument, options || {}, waitable);
        }
        return this._scheduleJob(name, argument, options || {}, rxjs_1.EMPTY);
    }
    /**
     * Filter messages.
     * @private
     */
    _filterJobOutboundMessages(message, state) {
        switch (message.kind) {
            case api_1.JobOutboundMessageKind.OnReady:
                return state == api_1.JobState.Queued;
            case api_1.JobOutboundMessageKind.Start:
                return state == api_1.JobState.Ready;
            case api_1.JobOutboundMessageKind.End:
                return state == api_1.JobState.Started || state == api_1.JobState.Ready;
        }
        return true;
    }
    /**
     * Return a new state. This is just to simplify the reading of the _createJob method.
     * @private
     */
    _updateState(message, state) {
        switch (message.kind) {
            case api_1.JobOutboundMessageKind.OnReady:
                return api_1.JobState.Ready;
            case api_1.JobOutboundMessageKind.Start:
                return api_1.JobState.Started;
            case api_1.JobOutboundMessageKind.End:
                return api_1.JobState.Ended;
        }
        return state;
    }
    /**
     * Create the job.
     * @private
     */
    _createJob(name, argument, handler, inboundBus, outboundBus) {
        const schemaRegistry = this._schemaRegistry;
        const channelsSubject = new Map();
        const channels = new Map();
        let state = api_1.JobState.Queued;
        let pingId = 0;
        // Create the input channel by having a filter.
        const input = new rxjs_1.Subject();
        input
            .pipe((0, operators_1.concatMap)((message) => handler.pipe((0, operators_1.switchMap)((handler) => {
            if (handler === null) {
                throw new exception_1.JobDoesNotExistException(name);
            }
            else {
                return handler.inputV.pipe((0, operators_1.switchMap)((validate) => validate(message)));
            }
        }))), (0, operators_1.filter)((result) => result.success), (0, operators_1.map)((result) => result.data))
            .subscribe((value) => inboundBus.next({ kind: api_1.JobInboundMessageKind.Input, value }));
        outboundBus = (0, rxjs_1.concat)(outboundBus, 
        // Add an End message at completion. This will be filtered out if the job actually send an
        // End.
        handler.pipe((0, operators_1.switchMap)((handler) => {
            if (handler) {
                return (0, rxjs_1.of)({
                    kind: api_1.JobOutboundMessageKind.End,
                    description: handler.jobDescription,
                });
            }
            else {
                return rxjs_1.EMPTY;
            }
        }))).pipe((0, operators_1.filter)((message) => this._filterJobOutboundMessages(message, state)), 
        // Update internal logic and Job<> members.
        (0, operators_1.tap)((message) => {
            // Update the state.
            state = this._updateState(message, state);
            switch (message.kind) {
                case api_1.JobOutboundMessageKind.ChannelCreate: {
                    const maybeSubject = channelsSubject.get(message.name);
                    // If it doesn't exist or it's closed on the other end.
                    if (!maybeSubject) {
                        const s = new rxjs_1.Subject();
                        channelsSubject.set(message.name, s);
                        channels.set(message.name, s.asObservable());
                    }
                    break;
                }
                case api_1.JobOutboundMessageKind.ChannelMessage: {
                    const maybeSubject = channelsSubject.get(message.name);
                    if (maybeSubject) {
                        maybeSubject.next(message.message);
                    }
                    break;
                }
                case api_1.JobOutboundMessageKind.ChannelComplete: {
                    const maybeSubject = channelsSubject.get(message.name);
                    if (maybeSubject) {
                        maybeSubject.complete();
                        channelsSubject.delete(message.name);
                    }
                    break;
                }
                case api_1.JobOutboundMessageKind.ChannelError: {
                    const maybeSubject = channelsSubject.get(message.name);
                    if (maybeSubject) {
                        maybeSubject.error(message.error);
                        channelsSubject.delete(message.name);
                    }
                    break;
                }
            }
        }, () => {
            state = api_1.JobState.Errored;
        }), 
        // Do output validation (might include default values so this might have side
        // effects). We keep all messages in order.
        (0, operators_1.concatMap)((message) => {
            if (message.kind !== api_1.JobOutboundMessageKind.Output) {
                return (0, rxjs_1.of)(message);
            }
            return handler.pipe((0, operators_1.switchMap)((handler) => {
                if (handler === null) {
                    throw new exception_1.JobDoesNotExistException(name);
                }
                else {
                    return handler.outputV.pipe((0, operators_1.switchMap)((validate) => validate(message.value)), (0, operators_1.switchMap)((output) => {
                        if (!output.success) {
                            throw new JobOutputSchemaValidationError(output.errors);
                        }
                        return (0, rxjs_1.of)({
                            ...message,
                            output: output.data,
                        });
                    }));
                }
            }));
        }), _jobShare());
        const output = outboundBus.pipe((0, operators_1.filter)((x) => x.kind == api_1.JobOutboundMessageKind.Output), (0, operators_1.map)((x) => x.value), (0, operators_1.shareReplay)(1));
        // Return the Job.
        return {
            get state() {
                return state;
            },
            argument,
            description: handler.pipe((0, operators_1.switchMap)((handler) => {
                if (handler === null) {
                    throw new exception_1.JobDoesNotExistException(name);
                }
                else {
                    return (0, rxjs_1.of)(handler.jobDescription);
                }
            })),
            output,
            getChannel(name, schema = true) {
                let maybeObservable = channels.get(name);
                if (!maybeObservable) {
                    const s = new rxjs_1.Subject();
                    channelsSubject.set(name, s);
                    channels.set(name, s.asObservable());
                    maybeObservable = s.asObservable();
                }
                return maybeObservable.pipe(
                // Keep the order of messages.
                (0, operators_1.concatMap)((message) => {
                    return schemaRegistry.compile(schema).pipe((0, operators_1.switchMap)((validate) => validate(message)), (0, operators_1.filter)((x) => x.success), (0, operators_1.map)((x) => x.data));
                }));
            },
            ping() {
                const id = pingId++;
                inboundBus.next({ kind: api_1.JobInboundMessageKind.Ping, id });
                return outboundBus.pipe((0, operators_1.filter)((x) => x.kind === api_1.JobOutboundMessageKind.Pong && x.id == id), (0, operators_1.first)(), (0, operators_1.ignoreElements)());
            },
            stop() {
                inboundBus.next({ kind: api_1.JobInboundMessageKind.Stop });
            },
            input,
            inboundBus,
            outboundBus,
        };
    }
    _scheduleJob(name, argument, options, waitable) {
        // Get handler first, since this can error out if there's no handler for the job name.
        const handler = this._getInternalDescription(name);
        const optionsDeps = (options && options.dependencies) || [];
        const dependencies = Array.isArray(optionsDeps) ? optionsDeps : [optionsDeps];
        const inboundBus = new rxjs_1.Subject();
        const outboundBus = (0, rxjs_1.concat)(
        // Wait for dependencies, make sure to not report messages from dependencies. Subscribe to
        // all dependencies at the same time so they run concurrently.
        (0, rxjs_1.merge)(...dependencies.map((x) => x.outboundBus)).pipe((0, operators_1.ignoreElements)()), 
        // Wait for pause() to clear (if necessary).
        waitable, (0, rxjs_1.from)(handler).pipe((0, operators_1.switchMap)((handler) => new rxjs_1.Observable((subscriber) => {
            if (!handler) {
                throw new exception_1.JobDoesNotExistException(name);
            }
            // Validate the argument.
            return handler.argumentV
                .pipe((0, operators_1.switchMap)((validate) => validate(argument)), (0, operators_1.switchMap)((output) => {
                if (!output.success) {
                    throw new JobArgumentSchemaValidationError(output.errors);
                }
                const argument = output.data;
                const description = handler.jobDescription;
                subscriber.next({ kind: api_1.JobOutboundMessageKind.OnReady, description });
                const context = {
                    description,
                    dependencies: [...dependencies],
                    inboundBus: inboundBus.asObservable(),
                    scheduler: this,
                };
                return handler(argument, context);
            }))
                .subscribe(subscriber);
        }))));
        return this._createJob(name, argument, handler, inboundBus, outboundBus);
    }
}
exports.SimpleScheduler = SimpleScheduler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLXNjaGVkdWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2FyY2hpdGVjdC9zcmMvam9icy9zaW1wbGUtc2NoZWR1bGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtDQUF5RDtBQUN6RCwrQkFXYztBQUNkLDhDQVN3QjtBQUN4QiwrQkFjZTtBQUNmLDJDQUF1RDtBQUV2RCxNQUFhLGdDQUFpQyxTQUFRLGFBQU0sQ0FBQyx5QkFBeUI7SUFDcEYsWUFBWSxNQUFzQztRQUNoRCxLQUFLLENBQUMsTUFBTSxFQUFFLDJDQUEyQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztDQUNGO0FBSkQsNEVBSUM7QUFDRCxNQUFhLHNDQUF1QyxTQUFRLGFBQU0sQ0FBQyx5QkFBeUI7SUFDMUYsWUFBWSxNQUFzQztRQUNoRCxLQUFLLENBQUMsTUFBTSxFQUFFLGtEQUFrRCxDQUFDLENBQUM7SUFDcEUsQ0FBQztDQUNGO0FBSkQsd0ZBSUM7QUFDRCxNQUFhLDhCQUErQixTQUFRLGFBQU0sQ0FBQyx5QkFBeUI7SUFDbEYsWUFBWSxNQUFzQztRQUNoRCxLQUFLLENBQUMsTUFBTSxFQUFFLHlDQUF5QyxDQUFDLENBQUM7SUFDM0QsQ0FBQztDQUNGO0FBSkQsd0VBSUM7QUFVRCxTQUFTLFNBQVM7SUFDaEIsK0ZBQStGO0lBQy9GLGlCQUFpQjtJQUNqQixPQUFPLENBQUMsTUFBcUIsRUFBaUIsRUFBRTtRQUM5QyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxPQUFtQixDQUFDO1FBQ3hCLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxZQUEwQixDQUFDO1FBRS9CLE9BQU8sSUFBSSxpQkFBVSxDQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDdEMsSUFBSSxRQUFzQixDQUFDO1lBQzNCLFFBQVEsRUFBRSxDQUFDO1lBQ1gsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDWixPQUFPLEdBQUcsSUFBSSxjQUFPLEVBQUssQ0FBQztnQkFFM0IsUUFBUSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3pDLFlBQVksR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO29CQUM5QixJQUFJLENBQUMsS0FBSzt3QkFDUixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN0QixDQUFDO29CQUNELEtBQUssQ0FBQyxHQUFHO3dCQUNQLFFBQVEsR0FBRyxJQUFJLENBQUM7d0JBQ2hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3JCLENBQUM7b0JBQ0QsUUFBUTt3QkFDTixVQUFVLEdBQUcsSUFBSSxDQUFDO3dCQUNsQixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQ3JCLENBQUM7aUJBQ0YsQ0FBQyxDQUFDO2FBQ0o7aUJBQU07Z0JBQ0wsUUFBUSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDMUM7WUFFRCxPQUFPLEdBQUcsRUFBRTtnQkFDVixRQUFRLEVBQUUsQ0FBQztnQkFDWCxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3ZCLElBQUksWUFBWSxJQUFJLFFBQVEsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLEVBQUU7b0JBQzlELFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztpQkFDNUI7WUFDSCxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQWEsZUFBZTtJQVUxQixZQUNZLFlBQXVFLEVBQ3ZFLGtCQUF5QyxJQUFJLGFBQU0sQ0FBQyxrQkFBa0IsRUFBRTtRQUR4RSxpQkFBWSxHQUFaLFlBQVksQ0FBMkQ7UUFDdkUsb0JBQWUsR0FBZixlQUFlLENBQXlEO1FBTjVFLCtCQUEwQixHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1FBQ3JFLFdBQU0sR0FBbUIsRUFBRSxDQUFDO1FBQzVCLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO0lBS3ZCLENBQUM7SUFFSSx1QkFBdUIsQ0FBQyxJQUFhO1FBQzNDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0QsSUFBSSxZQUFZLEtBQUssU0FBUyxFQUFFO1lBQzlCLE9BQU8sSUFBQSxTQUFFLEVBQUMsWUFBWSxDQUFDLENBQUM7U0FDekI7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBa0QsSUFBSSxDQUFDLENBQUM7UUFFN0YsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUNqQixJQUFBLHFCQUFTLEVBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNwQixJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7Z0JBQ3BCLE9BQU8sSUFBQSxTQUFFLEVBQUMsSUFBSSxDQUFDLENBQUM7YUFDakI7WUFFRCxNQUFNLFdBQVcsR0FBbUI7Z0JBQ2xDLGlEQUFpRDtnQkFDakQsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUksSUFBSTtnQkFDekMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxJQUFJLElBQUk7Z0JBQ2pELEtBQUssRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssSUFBSSxJQUFJO2dCQUMzQyxNQUFNLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLElBQUksSUFBSTtnQkFDN0MsUUFBUSxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsUUFBUSxJQUFJLEVBQUU7YUFDaEQsQ0FBQztZQUVGLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUM5RCxjQUFjLEVBQUUsV0FBVztnQkFDM0IsU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBQSx1QkFBVyxFQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRixNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFBLHVCQUFXLEVBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVFLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUEsdUJBQVcsRUFBQyxDQUFDLENBQUMsQ0FBQzthQUMvRSxDQUF3QixDQUFDO1lBQzFCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFFNUQsT0FBTyxJQUFBLFNBQUUsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxjQUFjLENBQUMsSUFBYTtRQUMxQixPQUFPLElBQUEsYUFBTSxFQUNYLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBQSxlQUFHLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsRUFDMUUsSUFBQSxTQUFFLEVBQUMsSUFBSSxDQUFDLENBQ1QsQ0FBQyxJQUFJLENBQUMsSUFBQSxpQkFBSyxHQUFFLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEdBQUcsQ0FBQyxJQUFhO1FBQ2YsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFBLGVBQUcsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxLQUFLO1FBQ0gsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVyQixPQUFPLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1gsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDZCxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLEVBQUU7b0JBQzdCLG9CQUFvQjtvQkFDcEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztvQkFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7b0JBQ2pCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7aUJBQ3pCO2FBQ0Y7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsUUFBUSxDQUNOLElBQWEsRUFDYixRQUFXLEVBQ1gsT0FBNEI7UUFFNUIsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsRUFBRTtZQUMxQixNQUFNLFFBQVEsR0FBRyxJQUFJLGNBQU8sRUFBUyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBRTVDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBVSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sSUFBSSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDNUU7UUFFRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQVUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLElBQUksRUFBRSxFQUFFLFlBQUssQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRDs7O09BR0c7SUFDSywwQkFBMEIsQ0FDaEMsT0FBOEIsRUFDOUIsS0FBZTtRQUVmLFFBQVEsT0FBTyxDQUFDLElBQUksRUFBRTtZQUNwQixLQUFLLDRCQUFzQixDQUFDLE9BQU87Z0JBQ2pDLE9BQU8sS0FBSyxJQUFJLGNBQVEsQ0FBQyxNQUFNLENBQUM7WUFDbEMsS0FBSyw0QkFBc0IsQ0FBQyxLQUFLO2dCQUMvQixPQUFPLEtBQUssSUFBSSxjQUFRLENBQUMsS0FBSyxDQUFDO1lBRWpDLEtBQUssNEJBQXNCLENBQUMsR0FBRztnQkFDN0IsT0FBTyxLQUFLLElBQUksY0FBUSxDQUFDLE9BQU8sSUFBSSxLQUFLLElBQUksY0FBUSxDQUFDLEtBQUssQ0FBQztTQUMvRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7T0FHRztJQUNLLFlBQVksQ0FDbEIsT0FBOEIsRUFDOUIsS0FBZTtRQUVmLFFBQVEsT0FBTyxDQUFDLElBQUksRUFBRTtZQUNwQixLQUFLLDRCQUFzQixDQUFDLE9BQU87Z0JBQ2pDLE9BQU8sY0FBUSxDQUFDLEtBQUssQ0FBQztZQUN4QixLQUFLLDRCQUFzQixDQUFDLEtBQUs7Z0JBQy9CLE9BQU8sY0FBUSxDQUFDLE9BQU8sQ0FBQztZQUMxQixLQUFLLDRCQUFzQixDQUFDLEdBQUc7Z0JBQzdCLE9BQU8sY0FBUSxDQUFDLEtBQUssQ0FBQztTQUN6QjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7T0FHRztJQUNLLFVBQVUsQ0FDaEIsSUFBYSxFQUNiLFFBQVcsRUFDWCxPQUErQyxFQUMvQyxVQUEwQyxFQUMxQyxXQUE4QztRQUU5QyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBRTVDLE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxFQUE4QixDQUFDO1FBQzlELE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFDO1FBRTFELElBQUksS0FBSyxHQUFHLGNBQVEsQ0FBQyxNQUFNLENBQUM7UUFDNUIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBRWYsK0NBQStDO1FBQy9DLE1BQU0sS0FBSyxHQUFHLElBQUksY0FBTyxFQUFhLENBQUM7UUFDdkMsS0FBSzthQUNGLElBQUksQ0FDSCxJQUFBLHFCQUFTLEVBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUNwQixPQUFPLENBQUMsSUFBSSxDQUNWLElBQUEscUJBQVMsRUFBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3BCLElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtnQkFDcEIsTUFBTSxJQUFJLG9DQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzFDO2lCQUFNO2dCQUNMLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBQSxxQkFBUyxFQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3hFO1FBQ0gsQ0FBQyxDQUFDLENBQ0gsQ0FDRixFQUNELElBQUEsa0JBQU0sRUFBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUNsQyxJQUFBLGVBQUcsRUFBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQVMsQ0FBQyxDQUNsQzthQUNBLFNBQVMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSwyQkFBcUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXZGLFdBQVcsR0FBRyxJQUFBLGFBQU0sRUFDbEIsV0FBVztRQUNYLDBGQUEwRjtRQUMxRixPQUFPO1FBQ1AsT0FBTyxDQUFDLElBQUksQ0FDVixJQUFBLHFCQUFTLEVBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNwQixJQUFJLE9BQU8sRUFBRTtnQkFDWCxPQUFPLElBQUEsU0FBRSxFQUF3QjtvQkFDL0IsSUFBSSxFQUFFLDRCQUFzQixDQUFDLEdBQUc7b0JBQ2hDLFdBQVcsRUFBRSxPQUFPLENBQUMsY0FBYztpQkFDcEMsQ0FBQyxDQUFDO2FBQ0o7aUJBQU07Z0JBQ0wsT0FBTyxZQUEwQyxDQUFDO2FBQ25EO1FBQ0gsQ0FBQyxDQUFDLENBQ0gsQ0FDRixDQUFDLElBQUksQ0FDSixJQUFBLGtCQUFNLEVBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDcEUsMkNBQTJDO1FBQzNDLElBQUEsZUFBRyxFQUNELENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDVixvQkFBb0I7WUFDcEIsS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRTFDLFFBQVEsT0FBTyxDQUFDLElBQUksRUFBRTtnQkFDcEIsS0FBSyw0QkFBc0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDekMsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3ZELHVEQUF1RDtvQkFDdkQsSUFBSSxDQUFDLFlBQVksRUFBRTt3QkFDakIsTUFBTSxDQUFDLEdBQUcsSUFBSSxjQUFPLEVBQWEsQ0FBQzt3QkFDbkMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUNyQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7cUJBQzlDO29CQUNELE1BQU07aUJBQ1A7Z0JBRUQsS0FBSyw0QkFBc0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDMUMsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3ZELElBQUksWUFBWSxFQUFFO3dCQUNoQixZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDcEM7b0JBQ0QsTUFBTTtpQkFDUDtnQkFFRCxLQUFLLDRCQUFzQixDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUMzQyxNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDdkQsSUFBSSxZQUFZLEVBQUU7d0JBQ2hCLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDeEIsZUFBZSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3RDO29CQUNELE1BQU07aUJBQ1A7Z0JBRUQsS0FBSyw0QkFBc0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDeEMsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3ZELElBQUksWUFBWSxFQUFFO3dCQUNoQixZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDbEMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3RDO29CQUNELE1BQU07aUJBQ1A7YUFDRjtRQUNILENBQUMsRUFDRCxHQUFHLEVBQUU7WUFDSCxLQUFLLEdBQUcsY0FBUSxDQUFDLE9BQU8sQ0FBQztRQUMzQixDQUFDLENBQ0Y7UUFFRCw2RUFBNkU7UUFDN0UsMkNBQTJDO1FBQzNDLElBQUEscUJBQVMsRUFBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3BCLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyw0QkFBc0IsQ0FBQyxNQUFNLEVBQUU7Z0JBQ2xELE9BQU8sSUFBQSxTQUFFLEVBQUMsT0FBTyxDQUFDLENBQUM7YUFDcEI7WUFFRCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQ2pCLElBQUEscUJBQVMsRUFBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNwQixJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7b0JBQ3BCLE1BQU0sSUFBSSxvQ0FBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDMUM7cUJBQU07b0JBQ0wsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDekIsSUFBQSxxQkFBUyxFQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQ2hELElBQUEscUJBQVMsRUFBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO3dCQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTs0QkFDbkIsTUFBTSxJQUFJLDhCQUE4QixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzt5QkFDekQ7d0JBRUQsT0FBTyxJQUFBLFNBQUUsRUFBQzs0QkFDUixHQUFHLE9BQU87NEJBQ1YsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFTO3lCQUNNLENBQUMsQ0FBQztvQkFDcEMsQ0FBQyxDQUFDLENBQ0gsQ0FBQztpQkFDSDtZQUNILENBQUMsQ0FBQyxDQUNrQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxFQUNGLFNBQVMsRUFBRSxDQUNaLENBQUM7UUFFRixNQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsSUFBSSxDQUM3QixJQUFBLGtCQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksNEJBQXNCLENBQUMsTUFBTSxDQUFDLEVBQ3RELElBQUEsZUFBRyxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBRSxDQUFpQyxDQUFDLEtBQUssQ0FBQyxFQUNwRCxJQUFBLHVCQUFXLEVBQUMsQ0FBQyxDQUFDLENBQ2YsQ0FBQztRQUVGLGtCQUFrQjtRQUNsQixPQUFPO1lBQ0wsSUFBSSxLQUFLO2dCQUNQLE9BQU8sS0FBSyxDQUFDO1lBQ2YsQ0FBQztZQUNELFFBQVE7WUFDUixXQUFXLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FDdkIsSUFBQSxxQkFBUyxFQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3BCLElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtvQkFDcEIsTUFBTSxJQUFJLG9DQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUMxQztxQkFBTTtvQkFDTCxPQUFPLElBQUEsU0FBRSxFQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztpQkFDbkM7WUFDSCxDQUFDLENBQUMsQ0FDSDtZQUNELE1BQU07WUFDTixVQUFVLENBQ1IsSUFBYSxFQUNiLFNBQTRCLElBQUk7Z0JBRWhDLElBQUksZUFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxlQUFlLEVBQUU7b0JBQ3BCLE1BQU0sQ0FBQyxHQUFHLElBQUksY0FBTyxFQUFLLENBQUM7b0JBQzNCLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQWtDLENBQUMsQ0FBQztvQkFDOUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7b0JBRXJDLGVBQWUsR0FBRyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7aUJBQ3BDO2dCQUVELE9BQU8sZUFBZSxDQUFDLElBQUk7Z0JBQ3pCLDhCQUE4QjtnQkFDOUIsSUFBQSxxQkFBUyxFQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQ3BCLE9BQU8sY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQ3hDLElBQUEscUJBQVMsRUFBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQzFDLElBQUEsa0JBQU0sRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUN4QixJQUFBLGVBQUcsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQVMsQ0FBQyxDQUN4QixDQUFDO2dCQUNKLENBQUMsQ0FBQyxDQUNILENBQUM7WUFDSixDQUFDO1lBQ0QsSUFBSTtnQkFDRixNQUFNLEVBQUUsR0FBRyxNQUFNLEVBQUUsQ0FBQztnQkFDcEIsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSwyQkFBcUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFFMUQsT0FBTyxXQUFXLENBQUMsSUFBSSxDQUNyQixJQUFBLGtCQUFNLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssNEJBQXNCLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQ25FLElBQUEsaUJBQUssR0FBRSxFQUNQLElBQUEsMEJBQWMsR0FBRSxDQUNqQixDQUFDO1lBQ0osQ0FBQztZQUNELElBQUk7Z0JBQ0YsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSwyQkFBcUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELENBQUM7WUFDRCxLQUFLO1lBQ0wsVUFBVTtZQUNWLFdBQVc7U0FDWixDQUFDO0lBQ0osQ0FBQztJQUVTLFlBQVksQ0FLcEIsSUFBYSxFQUNiLFFBQVcsRUFDWCxPQUEyQixFQUMzQixRQUEyQjtRQUUzQixzRkFBc0Y7UUFDdEYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRW5ELE1BQU0sV0FBVyxHQUFHLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDNUQsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTlFLE1BQU0sVUFBVSxHQUFHLElBQUksY0FBTyxFQUF3QixDQUFDO1FBQ3ZELE1BQU0sV0FBVyxHQUFHLElBQUEsYUFBTTtRQUN4QiwwRkFBMEY7UUFDMUYsOERBQThEO1FBQzlELElBQUEsWUFBSyxFQUFDLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUEsMEJBQWMsR0FBRSxDQUFDO1FBRXZFLDRDQUE0QztRQUM1QyxRQUFRLEVBRVIsSUFBQSxXQUFJLEVBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUNoQixJQUFBLHFCQUFTLEVBQ1AsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUNWLElBQUksaUJBQVUsQ0FBd0IsQ0FBQyxVQUEyQyxFQUFFLEVBQUU7WUFDcEYsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDWixNQUFNLElBQUksb0NBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDMUM7WUFFRCx5QkFBeUI7WUFDekIsT0FBTyxPQUFPLENBQUMsU0FBUztpQkFDckIsSUFBSSxDQUNILElBQUEscUJBQVMsRUFBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQzNDLElBQUEscUJBQVMsRUFBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtvQkFDbkIsTUFBTSxJQUFJLGdDQUFnQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDM0Q7Z0JBRUQsTUFBTSxRQUFRLEdBQU0sTUFBTSxDQUFDLElBQVMsQ0FBQztnQkFDckMsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQztnQkFDM0MsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSw0QkFBc0IsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFFdkUsTUFBTSxPQUFPLEdBQUc7b0JBQ2QsV0FBVztvQkFDWCxZQUFZLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQztvQkFDL0IsVUFBVSxFQUFFLFVBQVUsQ0FBQyxZQUFZLEVBQUU7b0JBQ3JDLFNBQVMsRUFBRSxJQUFrRTtpQkFDOUUsQ0FBQztnQkFFRixPQUFPLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQ0g7aUJBQ0EsU0FBUyxDQUFDLFVBQXFELENBQUMsQ0FBQztRQUN0RSxDQUFDLENBQUMsQ0FDTCxDQUNGLENBQ0YsQ0FBQztRQUVGLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDM0UsQ0FBQztDQUNGO0FBOWFELDBDQThhQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBKc29uVmFsdWUsIHNjaGVtYSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7XG4gIEVNUFRZLFxuICBNb25vVHlwZU9wZXJhdG9yRnVuY3Rpb24sXG4gIE9ic2VydmFibGUsXG4gIE9ic2VydmVyLFxuICBTdWJqZWN0LFxuICBTdWJzY3JpcHRpb24sXG4gIGNvbmNhdCxcbiAgZnJvbSxcbiAgbWVyZ2UsXG4gIG9mLFxufSBmcm9tICdyeGpzJztcbmltcG9ydCB7XG4gIGNvbmNhdE1hcCxcbiAgZmlsdGVyLFxuICBmaXJzdCxcbiAgaWdub3JlRWxlbWVudHMsXG4gIG1hcCxcbiAgc2hhcmVSZXBsYXksXG4gIHN3aXRjaE1hcCxcbiAgdGFwLFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1xuICBKb2IsXG4gIEpvYkRlc2NyaXB0aW9uLFxuICBKb2JIYW5kbGVyLFxuICBKb2JJbmJvdW5kTWVzc2FnZSxcbiAgSm9iSW5ib3VuZE1lc3NhZ2VLaW5kLFxuICBKb2JOYW1lLFxuICBKb2JPdXRib3VuZE1lc3NhZ2UsXG4gIEpvYk91dGJvdW5kTWVzc2FnZUtpbmQsXG4gIEpvYk91dGJvdW5kTWVzc2FnZU91dHB1dCxcbiAgSm9iU3RhdGUsXG4gIFJlZ2lzdHJ5LFxuICBTY2hlZHVsZUpvYk9wdGlvbnMsXG4gIFNjaGVkdWxlcixcbn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHsgSm9iRG9lc05vdEV4aXN0RXhjZXB0aW9uIH0gZnJvbSAnLi9leGNlcHRpb24nO1xuXG5leHBvcnQgY2xhc3MgSm9iQXJndW1lbnRTY2hlbWFWYWxpZGF0aW9uRXJyb3IgZXh0ZW5kcyBzY2hlbWEuU2NoZW1hVmFsaWRhdGlvbkV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKGVycm9ycz86IHNjaGVtYS5TY2hlbWFWYWxpZGF0b3JFcnJvcltdKSB7XG4gICAgc3VwZXIoZXJyb3JzLCAnSm9iIEFyZ3VtZW50IGZhaWxlZCB0byB2YWxpZGF0ZS4gRXJyb3JzOiAnKTtcbiAgfVxufVxuZXhwb3J0IGNsYXNzIEpvYkluYm91bmRNZXNzYWdlU2NoZW1hVmFsaWRhdGlvbkVycm9yIGV4dGVuZHMgc2NoZW1hLlNjaGVtYVZhbGlkYXRpb25FeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihlcnJvcnM/OiBzY2hlbWEuU2NoZW1hVmFsaWRhdG9yRXJyb3JbXSkge1xuICAgIHN1cGVyKGVycm9ycywgJ0pvYiBJbmJvdW5kIE1lc3NhZ2UgZmFpbGVkIHRvIHZhbGlkYXRlLiBFcnJvcnM6ICcpO1xuICB9XG59XG5leHBvcnQgY2xhc3MgSm9iT3V0cHV0U2NoZW1hVmFsaWRhdGlvbkVycm9yIGV4dGVuZHMgc2NoZW1hLlNjaGVtYVZhbGlkYXRpb25FeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihlcnJvcnM/OiBzY2hlbWEuU2NoZW1hVmFsaWRhdG9yRXJyb3JbXSkge1xuICAgIHN1cGVyKGVycm9ycywgJ0pvYiBPdXRwdXQgZmFpbGVkIHRvIHZhbGlkYXRlLiBFcnJvcnM6ICcpO1xuICB9XG59XG5cbmludGVyZmFjZSBKb2JIYW5kbGVyV2l0aEV4dHJhIGV4dGVuZHMgSm9iSGFuZGxlcjxKc29uVmFsdWUsIEpzb25WYWx1ZSwgSnNvblZhbHVlPiB7XG4gIGpvYkRlc2NyaXB0aW9uOiBKb2JEZXNjcmlwdGlvbjtcblxuICBhcmd1bWVudFY6IE9ic2VydmFibGU8c2NoZW1hLlNjaGVtYVZhbGlkYXRvcj47XG4gIG91dHB1dFY6IE9ic2VydmFibGU8c2NoZW1hLlNjaGVtYVZhbGlkYXRvcj47XG4gIGlucHV0VjogT2JzZXJ2YWJsZTxzY2hlbWEuU2NoZW1hVmFsaWRhdG9yPjtcbn1cblxuZnVuY3Rpb24gX2pvYlNoYXJlPFQ+KCk6IE1vbm9UeXBlT3BlcmF0b3JGdW5jdGlvbjxUPiB7XG4gIC8vIFRoaXMgaXMgdGhlIHNhbWUgY29kZSBhcyBhIGBzaGFyZVJlcGxheSgpYCBvcGVyYXRvciwgYnV0IHVzZXMgYSBkdW1iZXIgU3ViamVjdCByYXRoZXIgdGhhbiBhXG4gIC8vIFJlcGxheVN1YmplY3QuXG4gIHJldHVybiAoc291cmNlOiBPYnNlcnZhYmxlPFQ+KTogT2JzZXJ2YWJsZTxUPiA9PiB7XG4gICAgbGV0IHJlZkNvdW50ID0gMDtcbiAgICBsZXQgc3ViamVjdDogU3ViamVjdDxUPjtcbiAgICBsZXQgaGFzRXJyb3IgPSBmYWxzZTtcbiAgICBsZXQgaXNDb21wbGV0ZSA9IGZhbHNlO1xuICAgIGxldCBzdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcblxuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZTxUPigoc3Vic2NyaWJlcikgPT4ge1xuICAgICAgbGV0IGlubmVyU3ViOiBTdWJzY3JpcHRpb247XG4gICAgICByZWZDb3VudCsrO1xuICAgICAgaWYgKCFzdWJqZWN0KSB7XG4gICAgICAgIHN1YmplY3QgPSBuZXcgU3ViamVjdDxUPigpO1xuXG4gICAgICAgIGlubmVyU3ViID0gc3ViamVjdC5zdWJzY3JpYmUoc3Vic2NyaWJlcik7XG4gICAgICAgIHN1YnNjcmlwdGlvbiA9IHNvdXJjZS5zdWJzY3JpYmUoe1xuICAgICAgICAgIG5leHQodmFsdWUpIHtcbiAgICAgICAgICAgIHN1YmplY3QubmV4dCh2YWx1ZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlcnJvcihlcnIpIHtcbiAgICAgICAgICAgIGhhc0Vycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgIHN1YmplY3QuZXJyb3IoZXJyKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbXBsZXRlKCkge1xuICAgICAgICAgICAgaXNDb21wbGV0ZSA9IHRydWU7XG4gICAgICAgICAgICBzdWJqZWN0LmNvbXBsZXRlKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbm5lclN1YiA9IHN1YmplY3Quc3Vic2NyaWJlKHN1YnNjcmliZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICByZWZDb3VudC0tO1xuICAgICAgICBpbm5lclN1Yi51bnN1YnNjcmliZSgpO1xuICAgICAgICBpZiAoc3Vic2NyaXB0aW9uICYmIHJlZkNvdW50ID09PSAwICYmIChpc0NvbXBsZXRlIHx8IGhhc0Vycm9yKSkge1xuICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xufVxuXG4vKipcbiAqIFNpbXBsZSBzY2hlZHVsZXIuIFNob3VsZCBiZSB0aGUgYmFzZSBvZiBhbGwgcmVnaXN0cmllcyBhbmQgc2NoZWR1bGVycy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNpbXBsZVNjaGVkdWxlcjxcbiAgTWluaW11bUFyZ3VtZW50VCBleHRlbmRzIEpzb25WYWx1ZSA9IEpzb25WYWx1ZSxcbiAgTWluaW11bUlucHV0VCBleHRlbmRzIEpzb25WYWx1ZSA9IEpzb25WYWx1ZSxcbiAgTWluaW11bU91dHB1dFQgZXh0ZW5kcyBKc29uVmFsdWUgPSBKc29uVmFsdWUsXG4+IGltcGxlbWVudHMgU2NoZWR1bGVyPE1pbmltdW1Bcmd1bWVudFQsIE1pbmltdW1JbnB1dFQsIE1pbmltdW1PdXRwdXRUPlxue1xuICBwcml2YXRlIF9pbnRlcm5hbEpvYkRlc2NyaXB0aW9uTWFwID0gbmV3IE1hcDxKb2JOYW1lLCBKb2JIYW5kbGVyV2l0aEV4dHJhPigpO1xuICBwcml2YXRlIF9xdWV1ZTogKCgpID0+IHZvaWQpW10gPSBbXTtcbiAgcHJpdmF0ZSBfcGF1c2VDb3VudGVyID0gMDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgX2pvYlJlZ2lzdHJ5OiBSZWdpc3RyeTxNaW5pbXVtQXJndW1lbnRULCBNaW5pbXVtSW5wdXRULCBNaW5pbXVtT3V0cHV0VD4sXG4gICAgcHJvdGVjdGVkIF9zY2hlbWFSZWdpc3RyeTogc2NoZW1hLlNjaGVtYVJlZ2lzdHJ5ID0gbmV3IHNjaGVtYS5Db3JlU2NoZW1hUmVnaXN0cnkoKSxcbiAgKSB7fVxuXG4gIHByaXZhdGUgX2dldEludGVybmFsRGVzY3JpcHRpb24obmFtZTogSm9iTmFtZSk6IE9ic2VydmFibGU8Sm9iSGFuZGxlcldpdGhFeHRyYSB8IG51bGw+IHtcbiAgICBjb25zdCBtYXliZUhhbmRsZXIgPSB0aGlzLl9pbnRlcm5hbEpvYkRlc2NyaXB0aW9uTWFwLmdldChuYW1lKTtcbiAgICBpZiAobWF5YmVIYW5kbGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBvZihtYXliZUhhbmRsZXIpO1xuICAgIH1cblxuICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9qb2JSZWdpc3RyeS5nZXQ8TWluaW11bUFyZ3VtZW50VCwgTWluaW11bUlucHV0VCwgTWluaW11bU91dHB1dFQ+KG5hbWUpO1xuXG4gICAgcmV0dXJuIGhhbmRsZXIucGlwZShcbiAgICAgIHN3aXRjaE1hcCgoaGFuZGxlcikgPT4ge1xuICAgICAgICBpZiAoaGFuZGxlciA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBvZihudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uOiBKb2JEZXNjcmlwdGlvbiA9IHtcbiAgICAgICAgICAvLyBNYWtlIGEgY29weSBvZiBpdCB0byBiZSBzdXJlIGl0J3MgcHJvcGVyIEpTT04uXG4gICAgICAgICAgLi4uSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShoYW5kbGVyLmpvYkRlc2NyaXB0aW9uKSksXG4gICAgICAgICAgbmFtZTogaGFuZGxlci5qb2JEZXNjcmlwdGlvbi5uYW1lIHx8IG5hbWUsXG4gICAgICAgICAgYXJndW1lbnQ6IGhhbmRsZXIuam9iRGVzY3JpcHRpb24uYXJndW1lbnQgfHwgdHJ1ZSxcbiAgICAgICAgICBpbnB1dDogaGFuZGxlci5qb2JEZXNjcmlwdGlvbi5pbnB1dCB8fCB0cnVlLFxuICAgICAgICAgIG91dHB1dDogaGFuZGxlci5qb2JEZXNjcmlwdGlvbi5vdXRwdXQgfHwgdHJ1ZSxcbiAgICAgICAgICBjaGFubmVsczogaGFuZGxlci5qb2JEZXNjcmlwdGlvbi5jaGFubmVscyB8fCB7fSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBoYW5kbGVyV2l0aEV4dHJhID0gT2JqZWN0LmFzc2lnbihoYW5kbGVyLmJpbmQodW5kZWZpbmVkKSwge1xuICAgICAgICAgIGpvYkRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICBhcmd1bWVudFY6IHRoaXMuX3NjaGVtYVJlZ2lzdHJ5LmNvbXBpbGUoZGVzY3JpcHRpb24uYXJndW1lbnQpLnBpcGUoc2hhcmVSZXBsYXkoMSkpLFxuICAgICAgICAgIGlucHV0VjogdGhpcy5fc2NoZW1hUmVnaXN0cnkuY29tcGlsZShkZXNjcmlwdGlvbi5pbnB1dCkucGlwZShzaGFyZVJlcGxheSgxKSksXG4gICAgICAgICAgb3V0cHV0VjogdGhpcy5fc2NoZW1hUmVnaXN0cnkuY29tcGlsZShkZXNjcmlwdGlvbi5vdXRwdXQpLnBpcGUoc2hhcmVSZXBsYXkoMSkpLFxuICAgICAgICB9KSBhcyBKb2JIYW5kbGVyV2l0aEV4dHJhO1xuICAgICAgICB0aGlzLl9pbnRlcm5hbEpvYkRlc2NyaXB0aW9uTWFwLnNldChuYW1lLCBoYW5kbGVyV2l0aEV4dHJhKTtcblxuICAgICAgICByZXR1cm4gb2YoaGFuZGxlcldpdGhFeHRyYSk7XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGpvYiBkZXNjcmlwdGlvbiBmb3IgYSBuYW1lZCBqb2IuXG4gICAqXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBqb2IuXG4gICAqIEByZXR1cm5zIEEgZGVzY3JpcHRpb24sIG9yIG51bGwgaWYgdGhlIGpvYiBpcyBub3QgcmVnaXN0ZXJlZC5cbiAgICovXG4gIGdldERlc2NyaXB0aW9uKG5hbWU6IEpvYk5hbWUpIHtcbiAgICByZXR1cm4gY29uY2F0KFxuICAgICAgdGhpcy5fZ2V0SW50ZXJuYWxEZXNjcmlwdGlvbihuYW1lKS5waXBlKG1hcCgoeCkgPT4geCAmJiB4LmpvYkRlc2NyaXB0aW9uKSksXG4gICAgICBvZihudWxsKSxcbiAgICApLnBpcGUoZmlyc3QoKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBqb2IgbmFtZSBoYXMgYmVlbiByZWdpc3RlcmVkLlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgam9iLlxuICAgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBqb2IgZXhpc3RzLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqL1xuICBoYXMobmFtZTogSm9iTmFtZSkge1xuICAgIHJldHVybiB0aGlzLmdldERlc2NyaXB0aW9uKG5hbWUpLnBpcGUobWFwKCh4KSA9PiB4ICE9PSBudWxsKSk7XG4gIH1cblxuICAvKipcbiAgICogUGF1c2UgdGhlIHNjaGVkdWxlciwgdGVtcG9yYXJ5IHF1ZXVlaW5nIF9uZXdfIGpvYnMuIFJldHVybnMgYSByZXN1bWUgZnVuY3Rpb24gdGhhdCBzaG91bGQgYmVcbiAgICogdXNlZCB0byByZXN1bWUgZXhlY3V0aW9uLiBJZiBtdWx0aXBsZSBgcGF1c2UoKWAgd2VyZSBjYWxsZWQsIGFsbCB0aGVpciByZXN1bWUgZnVuY3Rpb25zIG11c3RcbiAgICogYmUgY2FsbGVkIGJlZm9yZSB0aGUgU2NoZWR1bGVyIGFjdHVhbGx5IHN0YXJ0cyBuZXcgam9icy4gQWRkaXRpb25hbCBjYWxscyB0byB0aGUgc2FtZSByZXN1bWVcbiAgICogZnVuY3Rpb24gd2lsbCBoYXZlIG5vIGVmZmVjdC5cbiAgICpcbiAgICogSm9icyBhbHJlYWR5IHJ1bm5pbmcgYXJlIE5PVCBwYXVzZWQuIFRoaXMgaXMgcGF1c2luZyB0aGUgc2NoZWR1bGVyIG9ubHkuXG4gICAqL1xuICBwYXVzZSgpIHtcbiAgICBsZXQgY2FsbGVkID0gZmFsc2U7XG4gICAgdGhpcy5fcGF1c2VDb3VudGVyKys7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKC0tdGhpcy5fcGF1c2VDb3VudGVyID09IDApIHtcbiAgICAgICAgICAvLyBSZXN1bWUgdGhlIHF1ZXVlLlxuICAgICAgICAgIGNvbnN0IHEgPSB0aGlzLl9xdWV1ZTtcbiAgICAgICAgICB0aGlzLl9xdWV1ZSA9IFtdO1xuICAgICAgICAgIHEuZm9yRWFjaCgoZm4pID0+IGZuKCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZSBhIGpvYiB0byBiZSBydW4sIHVzaW5nIGl0cyBuYW1lLlxuICAgKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiBqb2IgdG8gYmUgcnVuLlxuICAgKiBAcGFyYW0gYXJndW1lbnQgVGhlIGFyZ3VtZW50IHRvIHNlbmQgdG8gdGhlIGpvYiB3aGVuIHN0YXJ0aW5nIGl0LlxuICAgKiBAcGFyYW0gb3B0aW9ucyBTY2hlZHVsaW5nIG9wdGlvbnMuXG4gICAqIEByZXR1cm5zIFRoZSBKb2IgYmVpbmcgcnVuLlxuICAgKi9cbiAgc2NoZWR1bGU8QSBleHRlbmRzIE1pbmltdW1Bcmd1bWVudFQsIEkgZXh0ZW5kcyBNaW5pbXVtSW5wdXRULCBPIGV4dGVuZHMgTWluaW11bU91dHB1dFQ+KFxuICAgIG5hbWU6IEpvYk5hbWUsXG4gICAgYXJndW1lbnQ6IEEsXG4gICAgb3B0aW9ucz86IFNjaGVkdWxlSm9iT3B0aW9ucyxcbiAgKTogSm9iPEEsIEksIE8+IHtcbiAgICBpZiAodGhpcy5fcGF1c2VDb3VudGVyID4gMCkge1xuICAgICAgY29uc3Qgd2FpdGFibGUgPSBuZXcgU3ViamVjdDxuZXZlcj4oKTtcbiAgICAgIHRoaXMuX3F1ZXVlLnB1c2goKCkgPT4gd2FpdGFibGUuY29tcGxldGUoKSk7XG5cbiAgICAgIHJldHVybiB0aGlzLl9zY2hlZHVsZUpvYjxBLCBJLCBPPihuYW1lLCBhcmd1bWVudCwgb3B0aW9ucyB8fCB7fSwgd2FpdGFibGUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9zY2hlZHVsZUpvYjxBLCBJLCBPPihuYW1lLCBhcmd1bWVudCwgb3B0aW9ucyB8fCB7fSwgRU1QVFkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbHRlciBtZXNzYWdlcy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX2ZpbHRlckpvYk91dGJvdW5kTWVzc2FnZXM8TyBleHRlbmRzIE1pbmltdW1PdXRwdXRUPihcbiAgICBtZXNzYWdlOiBKb2JPdXRib3VuZE1lc3NhZ2U8Tz4sXG4gICAgc3RhdGU6IEpvYlN0YXRlLFxuICApIHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2Uua2luZCkge1xuICAgICAgY2FzZSBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLk9uUmVhZHk6XG4gICAgICAgIHJldHVybiBzdGF0ZSA9PSBKb2JTdGF0ZS5RdWV1ZWQ7XG4gICAgICBjYXNlIEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuU3RhcnQ6XG4gICAgICAgIHJldHVybiBzdGF0ZSA9PSBKb2JTdGF0ZS5SZWFkeTtcblxuICAgICAgY2FzZSBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLkVuZDpcbiAgICAgICAgcmV0dXJuIHN0YXRlID09IEpvYlN0YXRlLlN0YXJ0ZWQgfHwgc3RhdGUgPT0gSm9iU3RhdGUuUmVhZHk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgbmV3IHN0YXRlLiBUaGlzIGlzIGp1c3QgdG8gc2ltcGxpZnkgdGhlIHJlYWRpbmcgb2YgdGhlIF9jcmVhdGVKb2IgbWV0aG9kLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlU3RhdGU8TyBleHRlbmRzIE1pbmltdW1PdXRwdXRUPihcbiAgICBtZXNzYWdlOiBKb2JPdXRib3VuZE1lc3NhZ2U8Tz4sXG4gICAgc3RhdGU6IEpvYlN0YXRlLFxuICApOiBKb2JTdGF0ZSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLmtpbmQpIHtcbiAgICAgIGNhc2UgSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5PblJlYWR5OlxuICAgICAgICByZXR1cm4gSm9iU3RhdGUuUmVhZHk7XG4gICAgICBjYXNlIEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuU3RhcnQ6XG4gICAgICAgIHJldHVybiBKb2JTdGF0ZS5TdGFydGVkO1xuICAgICAgY2FzZSBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLkVuZDpcbiAgICAgICAgcmV0dXJuIEpvYlN0YXRlLkVuZGVkO1xuICAgIH1cblxuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgdGhlIGpvYi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX2NyZWF0ZUpvYjxBIGV4dGVuZHMgTWluaW11bUFyZ3VtZW50VCwgSSBleHRlbmRzIE1pbmltdW1JbnB1dFQsIE8gZXh0ZW5kcyBNaW5pbXVtT3V0cHV0VD4oXG4gICAgbmFtZTogSm9iTmFtZSxcbiAgICBhcmd1bWVudDogQSxcbiAgICBoYW5kbGVyOiBPYnNlcnZhYmxlPEpvYkhhbmRsZXJXaXRoRXh0cmEgfCBudWxsPixcbiAgICBpbmJvdW5kQnVzOiBPYnNlcnZlcjxKb2JJbmJvdW5kTWVzc2FnZTxJPj4sXG4gICAgb3V0Ym91bmRCdXM6IE9ic2VydmFibGU8Sm9iT3V0Ym91bmRNZXNzYWdlPE8+PixcbiAgKTogSm9iPEEsIEksIE8+IHtcbiAgICBjb25zdCBzY2hlbWFSZWdpc3RyeSA9IHRoaXMuX3NjaGVtYVJlZ2lzdHJ5O1xuXG4gICAgY29uc3QgY2hhbm5lbHNTdWJqZWN0ID0gbmV3IE1hcDxzdHJpbmcsIFN1YmplY3Q8SnNvblZhbHVlPj4oKTtcbiAgICBjb25zdCBjaGFubmVscyA9IG5ldyBNYXA8c3RyaW5nLCBPYnNlcnZhYmxlPEpzb25WYWx1ZT4+KCk7XG5cbiAgICBsZXQgc3RhdGUgPSBKb2JTdGF0ZS5RdWV1ZWQ7XG4gICAgbGV0IHBpbmdJZCA9IDA7XG5cbiAgICAvLyBDcmVhdGUgdGhlIGlucHV0IGNoYW5uZWwgYnkgaGF2aW5nIGEgZmlsdGVyLlxuICAgIGNvbnN0IGlucHV0ID0gbmV3IFN1YmplY3Q8SnNvblZhbHVlPigpO1xuICAgIGlucHV0XG4gICAgICAucGlwZShcbiAgICAgICAgY29uY2F0TWFwKChtZXNzYWdlKSA9PlxuICAgICAgICAgIGhhbmRsZXIucGlwZShcbiAgICAgICAgICAgIHN3aXRjaE1hcCgoaGFuZGxlcikgPT4ge1xuICAgICAgICAgICAgICBpZiAoaGFuZGxlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBKb2JEb2VzTm90RXhpc3RFeGNlcHRpb24obmFtZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXIuaW5wdXRWLnBpcGUoc3dpdGNoTWFwKCh2YWxpZGF0ZSkgPT4gdmFsaWRhdGUobWVzc2FnZSkpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgKSxcbiAgICAgICAgKSxcbiAgICAgICAgZmlsdGVyKChyZXN1bHQpID0+IHJlc3VsdC5zdWNjZXNzKSxcbiAgICAgICAgbWFwKChyZXN1bHQpID0+IHJlc3VsdC5kYXRhIGFzIEkpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgodmFsdWUpID0+IGluYm91bmRCdXMubmV4dCh7IGtpbmQ6IEpvYkluYm91bmRNZXNzYWdlS2luZC5JbnB1dCwgdmFsdWUgfSkpO1xuXG4gICAgb3V0Ym91bmRCdXMgPSBjb25jYXQoXG4gICAgICBvdXRib3VuZEJ1cyxcbiAgICAgIC8vIEFkZCBhbiBFbmQgbWVzc2FnZSBhdCBjb21wbGV0aW9uLiBUaGlzIHdpbGwgYmUgZmlsdGVyZWQgb3V0IGlmIHRoZSBqb2IgYWN0dWFsbHkgc2VuZCBhblxuICAgICAgLy8gRW5kLlxuICAgICAgaGFuZGxlci5waXBlKFxuICAgICAgICBzd2l0Y2hNYXAoKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICBpZiAoaGFuZGxlcikge1xuICAgICAgICAgICAgcmV0dXJuIG9mPEpvYk91dGJvdW5kTWVzc2FnZTxPPj4oe1xuICAgICAgICAgICAgICBraW5kOiBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLkVuZCxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGhhbmRsZXIuam9iRGVzY3JpcHRpb24sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIEVNUFRZIGFzIE9ic2VydmFibGU8Sm9iT3V0Ym91bmRNZXNzYWdlPE8+PjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgKSxcbiAgICApLnBpcGUoXG4gICAgICBmaWx0ZXIoKG1lc3NhZ2UpID0+IHRoaXMuX2ZpbHRlckpvYk91dGJvdW5kTWVzc2FnZXMobWVzc2FnZSwgc3RhdGUpKSxcbiAgICAgIC8vIFVwZGF0ZSBpbnRlcm5hbCBsb2dpYyBhbmQgSm9iPD4gbWVtYmVycy5cbiAgICAgIHRhcChcbiAgICAgICAgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHN0YXRlLlxuICAgICAgICAgIHN0YXRlID0gdGhpcy5fdXBkYXRlU3RhdGUobWVzc2FnZSwgc3RhdGUpO1xuXG4gICAgICAgICAgc3dpdGNoIChtZXNzYWdlLmtpbmQpIHtcbiAgICAgICAgICAgIGNhc2UgSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5DaGFubmVsQ3JlYXRlOiB7XG4gICAgICAgICAgICAgIGNvbnN0IG1heWJlU3ViamVjdCA9IGNoYW5uZWxzU3ViamVjdC5nZXQobWVzc2FnZS5uYW1lKTtcbiAgICAgICAgICAgICAgLy8gSWYgaXQgZG9lc24ndCBleGlzdCBvciBpdCdzIGNsb3NlZCBvbiB0aGUgb3RoZXIgZW5kLlxuICAgICAgICAgICAgICBpZiAoIW1heWJlU3ViamVjdCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHMgPSBuZXcgU3ViamVjdDxKc29uVmFsdWU+KCk7XG4gICAgICAgICAgICAgICAgY2hhbm5lbHNTdWJqZWN0LnNldChtZXNzYWdlLm5hbWUsIHMpO1xuICAgICAgICAgICAgICAgIGNoYW5uZWxzLnNldChtZXNzYWdlLm5hbWUsIHMuYXNPYnNlcnZhYmxlKCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYXNlIEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuQ2hhbm5lbE1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgY29uc3QgbWF5YmVTdWJqZWN0ID0gY2hhbm5lbHNTdWJqZWN0LmdldChtZXNzYWdlLm5hbWUpO1xuICAgICAgICAgICAgICBpZiAobWF5YmVTdWJqZWN0KSB7XG4gICAgICAgICAgICAgICAgbWF5YmVTdWJqZWN0Lm5leHQobWVzc2FnZS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLkNoYW5uZWxDb21wbGV0ZToge1xuICAgICAgICAgICAgICBjb25zdCBtYXliZVN1YmplY3QgPSBjaGFubmVsc1N1YmplY3QuZ2V0KG1lc3NhZ2UubmFtZSk7XG4gICAgICAgICAgICAgIGlmIChtYXliZVN1YmplY3QpIHtcbiAgICAgICAgICAgICAgICBtYXliZVN1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICBjaGFubmVsc1N1YmplY3QuZGVsZXRlKG1lc3NhZ2UubmFtZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhc2UgSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5DaGFubmVsRXJyb3I6IHtcbiAgICAgICAgICAgICAgY29uc3QgbWF5YmVTdWJqZWN0ID0gY2hhbm5lbHNTdWJqZWN0LmdldChtZXNzYWdlLm5hbWUpO1xuICAgICAgICAgICAgICBpZiAobWF5YmVTdWJqZWN0KSB7XG4gICAgICAgICAgICAgICAgbWF5YmVTdWJqZWN0LmVycm9yKG1lc3NhZ2UuZXJyb3IpO1xuICAgICAgICAgICAgICAgIGNoYW5uZWxzU3ViamVjdC5kZWxldGUobWVzc2FnZS5uYW1lKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBzdGF0ZSA9IEpvYlN0YXRlLkVycm9yZWQ7XG4gICAgICAgIH0sXG4gICAgICApLFxuXG4gICAgICAvLyBEbyBvdXRwdXQgdmFsaWRhdGlvbiAobWlnaHQgaW5jbHVkZSBkZWZhdWx0IHZhbHVlcyBzbyB0aGlzIG1pZ2h0IGhhdmUgc2lkZVxuICAgICAgLy8gZWZmZWN0cykuIFdlIGtlZXAgYWxsIG1lc3NhZ2VzIGluIG9yZGVyLlxuICAgICAgY29uY2F0TWFwKChtZXNzYWdlKSA9PiB7XG4gICAgICAgIGlmIChtZXNzYWdlLmtpbmQgIT09IEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuT3V0cHV0KSB7XG4gICAgICAgICAgcmV0dXJuIG9mKG1lc3NhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGhhbmRsZXIucGlwZShcbiAgICAgICAgICBzd2l0Y2hNYXAoKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICAgIGlmIChoYW5kbGVyID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBKb2JEb2VzTm90RXhpc3RFeGNlcHRpb24obmFtZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlci5vdXRwdXRWLnBpcGUoXG4gICAgICAgICAgICAgICAgc3dpdGNoTWFwKCh2YWxpZGF0ZSkgPT4gdmFsaWRhdGUobWVzc2FnZS52YWx1ZSkpLFxuICAgICAgICAgICAgICAgIHN3aXRjaE1hcCgob3V0cHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoIW91dHB1dC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBKb2JPdXRwdXRTY2hlbWFWYWxpZGF0aW9uRXJyb3Iob3V0cHV0LmVycm9ycyk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHJldHVybiBvZih7XG4gICAgICAgICAgICAgICAgICAgIC4uLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dDogb3V0cHV0LmRhdGEgYXMgTyxcbiAgICAgICAgICAgICAgICAgIH0gYXMgSm9iT3V0Ym91bmRNZXNzYWdlT3V0cHV0PE8+KTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSxcbiAgICAgICAgKSBhcyBPYnNlcnZhYmxlPEpvYk91dGJvdW5kTWVzc2FnZTxPPj47XG4gICAgICB9KSxcbiAgICAgIF9qb2JTaGFyZSgpLFxuICAgICk7XG5cbiAgICBjb25zdCBvdXRwdXQgPSBvdXRib3VuZEJ1cy5waXBlKFxuICAgICAgZmlsdGVyKCh4KSA9PiB4LmtpbmQgPT0gSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5PdXRwdXQpLFxuICAgICAgbWFwKCh4KSA9PiAoeCBhcyBKb2JPdXRib3VuZE1lc3NhZ2VPdXRwdXQ8Tz4pLnZhbHVlKSxcbiAgICAgIHNoYXJlUmVwbGF5KDEpLFxuICAgICk7XG5cbiAgICAvLyBSZXR1cm4gdGhlIEpvYi5cbiAgICByZXR1cm4ge1xuICAgICAgZ2V0IHN0YXRlKCkge1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICB9LFxuICAgICAgYXJndW1lbnQsXG4gICAgICBkZXNjcmlwdGlvbjogaGFuZGxlci5waXBlKFxuICAgICAgICBzd2l0Y2hNYXAoKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICBpZiAoaGFuZGxlciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEpvYkRvZXNOb3RFeGlzdEV4Y2VwdGlvbihuYW1lKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG9mKGhhbmRsZXIuam9iRGVzY3JpcHRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgICApLFxuICAgICAgb3V0cHV0LFxuICAgICAgZ2V0Q2hhbm5lbDxUIGV4dGVuZHMgSnNvblZhbHVlPihcbiAgICAgICAgbmFtZTogSm9iTmFtZSxcbiAgICAgICAgc2NoZW1hOiBzY2hlbWEuSnNvblNjaGVtYSA9IHRydWUsXG4gICAgICApOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICAgICAgbGV0IG1heWJlT2JzZXJ2YWJsZSA9IGNoYW5uZWxzLmdldChuYW1lKTtcbiAgICAgICAgaWYgKCFtYXliZU9ic2VydmFibGUpIHtcbiAgICAgICAgICBjb25zdCBzID0gbmV3IFN1YmplY3Q8VD4oKTtcbiAgICAgICAgICBjaGFubmVsc1N1YmplY3Quc2V0KG5hbWUsIHMgYXMgdW5rbm93biBhcyBTdWJqZWN0PEpzb25WYWx1ZT4pO1xuICAgICAgICAgIGNoYW5uZWxzLnNldChuYW1lLCBzLmFzT2JzZXJ2YWJsZSgpKTtcblxuICAgICAgICAgIG1heWJlT2JzZXJ2YWJsZSA9IHMuYXNPYnNlcnZhYmxlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbWF5YmVPYnNlcnZhYmxlLnBpcGUoXG4gICAgICAgICAgLy8gS2VlcCB0aGUgb3JkZXIgb2YgbWVzc2FnZXMuXG4gICAgICAgICAgY29uY2F0TWFwKChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc2NoZW1hUmVnaXN0cnkuY29tcGlsZShzY2hlbWEpLnBpcGUoXG4gICAgICAgICAgICAgIHN3aXRjaE1hcCgodmFsaWRhdGUpID0+IHZhbGlkYXRlKG1lc3NhZ2UpKSxcbiAgICAgICAgICAgICAgZmlsdGVyKCh4KSA9PiB4LnN1Y2Nlc3MpLFxuICAgICAgICAgICAgICBtYXAoKHgpID0+IHguZGF0YSBhcyBUKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSksXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgcGluZygpIHtcbiAgICAgICAgY29uc3QgaWQgPSBwaW5nSWQrKztcbiAgICAgICAgaW5ib3VuZEJ1cy5uZXh0KHsga2luZDogSm9iSW5ib3VuZE1lc3NhZ2VLaW5kLlBpbmcsIGlkIH0pO1xuXG4gICAgICAgIHJldHVybiBvdXRib3VuZEJ1cy5waXBlKFxuICAgICAgICAgIGZpbHRlcigoeCkgPT4geC5raW5kID09PSBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLlBvbmcgJiYgeC5pZCA9PSBpZCksXG4gICAgICAgICAgZmlyc3QoKSxcbiAgICAgICAgICBpZ25vcmVFbGVtZW50cygpLFxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIHN0b3AoKSB7XG4gICAgICAgIGluYm91bmRCdXMubmV4dCh7IGtpbmQ6IEpvYkluYm91bmRNZXNzYWdlS2luZC5TdG9wIH0pO1xuICAgICAgfSxcbiAgICAgIGlucHV0LFxuICAgICAgaW5ib3VuZEJ1cyxcbiAgICAgIG91dGJvdW5kQnVzLFxuICAgIH07XG4gIH1cblxuICBwcm90ZWN0ZWQgX3NjaGVkdWxlSm9iPFxuICAgIEEgZXh0ZW5kcyBNaW5pbXVtQXJndW1lbnRULFxuICAgIEkgZXh0ZW5kcyBNaW5pbXVtSW5wdXRULFxuICAgIE8gZXh0ZW5kcyBNaW5pbXVtT3V0cHV0VCxcbiAgPihcbiAgICBuYW1lOiBKb2JOYW1lLFxuICAgIGFyZ3VtZW50OiBBLFxuICAgIG9wdGlvbnM6IFNjaGVkdWxlSm9iT3B0aW9ucyxcbiAgICB3YWl0YWJsZTogT2JzZXJ2YWJsZTxuZXZlcj4sXG4gICk6IEpvYjxBLCBJLCBPPiB7XG4gICAgLy8gR2V0IGhhbmRsZXIgZmlyc3QsIHNpbmNlIHRoaXMgY2FuIGVycm9yIG91dCBpZiB0aGVyZSdzIG5vIGhhbmRsZXIgZm9yIHRoZSBqb2IgbmFtZS5cbiAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fZ2V0SW50ZXJuYWxEZXNjcmlwdGlvbihuYW1lKTtcblxuICAgIGNvbnN0IG9wdGlvbnNEZXBzID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5kZXBlbmRlbmNpZXMpIHx8IFtdO1xuICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IEFycmF5LmlzQXJyYXkob3B0aW9uc0RlcHMpID8gb3B0aW9uc0RlcHMgOiBbb3B0aW9uc0RlcHNdO1xuXG4gICAgY29uc3QgaW5ib3VuZEJ1cyA9IG5ldyBTdWJqZWN0PEpvYkluYm91bmRNZXNzYWdlPEk+PigpO1xuICAgIGNvbnN0IG91dGJvdW5kQnVzID0gY29uY2F0KFxuICAgICAgLy8gV2FpdCBmb3IgZGVwZW5kZW5jaWVzLCBtYWtlIHN1cmUgdG8gbm90IHJlcG9ydCBtZXNzYWdlcyBmcm9tIGRlcGVuZGVuY2llcy4gU3Vic2NyaWJlIHRvXG4gICAgICAvLyBhbGwgZGVwZW5kZW5jaWVzIGF0IHRoZSBzYW1lIHRpbWUgc28gdGhleSBydW4gY29uY3VycmVudGx5LlxuICAgICAgbWVyZ2UoLi4uZGVwZW5kZW5jaWVzLm1hcCgoeCkgPT4geC5vdXRib3VuZEJ1cykpLnBpcGUoaWdub3JlRWxlbWVudHMoKSksXG5cbiAgICAgIC8vIFdhaXQgZm9yIHBhdXNlKCkgdG8gY2xlYXIgKGlmIG5lY2Vzc2FyeSkuXG4gICAgICB3YWl0YWJsZSxcblxuICAgICAgZnJvbShoYW5kbGVyKS5waXBlKFxuICAgICAgICBzd2l0Y2hNYXAoXG4gICAgICAgICAgKGhhbmRsZXIpID0+XG4gICAgICAgICAgICBuZXcgT2JzZXJ2YWJsZTxKb2JPdXRib3VuZE1lc3NhZ2U8Tz4+KChzdWJzY3JpYmVyOiBPYnNlcnZlcjxKb2JPdXRib3VuZE1lc3NhZ2U8Tz4+KSA9PiB7XG4gICAgICAgICAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBKb2JEb2VzTm90RXhpc3RFeGNlcHRpb24obmFtZSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBWYWxpZGF0ZSB0aGUgYXJndW1lbnQuXG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyLmFyZ3VtZW50VlxuICAgICAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICAgICAgc3dpdGNoTWFwKCh2YWxpZGF0ZSkgPT4gdmFsaWRhdGUoYXJndW1lbnQpKSxcbiAgICAgICAgICAgICAgICAgIHN3aXRjaE1hcCgob3V0cHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghb3V0cHV0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgSm9iQXJndW1lbnRTY2hlbWFWYWxpZGF0aW9uRXJyb3Iob3V0cHV0LmVycm9ycyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhcmd1bWVudDogQSA9IG91dHB1dC5kYXRhIGFzIEE7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gaGFuZGxlci5qb2JEZXNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlci5uZXh0KHsga2luZDogSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5PblJlYWR5LCBkZXNjcmlwdGlvbiB9KTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgIGRlcGVuZGVuY2llczogWy4uLmRlcGVuZGVuY2llc10sXG4gICAgICAgICAgICAgICAgICAgICAgaW5ib3VuZEJ1czogaW5ib3VuZEJ1cy5hc09ic2VydmFibGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICBzY2hlZHVsZXI6IHRoaXMgYXMgU2NoZWR1bGVyPE1pbmltdW1Bcmd1bWVudFQsIE1pbmltdW1JbnB1dFQsIE1pbmltdW1PdXRwdXRUPixcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlcihhcmd1bWVudCwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZShzdWJzY3JpYmVyIGFzIE9ic2VydmVyPEpvYk91dGJvdW5kTWVzc2FnZTxKc29uVmFsdWU+Pik7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgKSxcbiAgICAgICksXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzLl9jcmVhdGVKb2IobmFtZSwgYXJndW1lbnQsIGhhbmRsZXIsIGluYm91bmRCdXMsIG91dGJvdW5kQnVzKTtcbiAgfVxufVxuIl19