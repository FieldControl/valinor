"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoggerJob = exports.createJobFactory = exports.createJobHandler = exports.ChannelAlreadyExistException = void 0;
const core_1 = require("@angular-devkit/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const api_1 = require("./api");
class ChannelAlreadyExistException extends core_1.BaseException {
    constructor(name) {
        super(`Channel ${JSON.stringify(name)} already exist.`);
    }
}
exports.ChannelAlreadyExistException = ChannelAlreadyExistException;
/**
 * Make a simple job handler that sets start and end from a function that's synchronous.
 *
 * @param fn The function to create a handler for.
 * @param options An optional set of properties to set on the handler. Some fields might be
 *   required by registry or schedulers.
 */
function createJobHandler(fn, options = {}) {
    const handler = (argument, context) => {
        const description = context.description;
        const inboundBus = context.inboundBus;
        const inputChannel = new rxjs_1.Subject();
        let subscription;
        return new rxjs_1.Observable((subject) => {
            function complete() {
                if (subscription) {
                    subscription.unsubscribe();
                }
                subject.next({ kind: api_1.JobOutboundMessageKind.End, description });
                subject.complete();
                inputChannel.complete();
            }
            // Handle input.
            const inboundSub = inboundBus.subscribe((message) => {
                switch (message.kind) {
                    case api_1.JobInboundMessageKind.Ping:
                        subject.next({ kind: api_1.JobOutboundMessageKind.Pong, description, id: message.id });
                        break;
                    case api_1.JobInboundMessageKind.Stop:
                        // There's no way to cancel a promise or a synchronous function, but we do cancel
                        // observables where possible.
                        complete();
                        break;
                    case api_1.JobInboundMessageKind.Input:
                        inputChannel.next(message.value);
                        break;
                }
            });
            // Execute the function with the additional context.
            const channels = new Map();
            const newContext = {
                ...context,
                input: inputChannel.asObservable(),
                createChannel(name) {
                    if (channels.has(name)) {
                        throw new ChannelAlreadyExistException(name);
                    }
                    const channelSubject = new rxjs_1.Subject();
                    const channelSub = channelSubject.subscribe((message) => {
                        subject.next({
                            kind: api_1.JobOutboundMessageKind.ChannelMessage,
                            description,
                            name,
                            message,
                        });
                    }, (error) => {
                        subject.next({ kind: api_1.JobOutboundMessageKind.ChannelError, description, name, error });
                        // This can be reopened.
                        channels.delete(name);
                    }, () => {
                        subject.next({ kind: api_1.JobOutboundMessageKind.ChannelComplete, description, name });
                        // This can be reopened.
                        channels.delete(name);
                    });
                    channels.set(name, channelSubject);
                    if (subscription) {
                        subscription.add(channelSub);
                    }
                    return channelSubject;
                },
            };
            subject.next({ kind: api_1.JobOutboundMessageKind.Start, description });
            let result = fn(argument, newContext);
            // If the result is a promise, simply wait for it to complete before reporting the result.
            if ((0, core_1.isPromise)(result)) {
                result = (0, rxjs_1.from)(result);
            }
            else if (!(0, rxjs_1.isObservable)(result)) {
                result = (0, rxjs_1.of)(result);
            }
            subscription = result.subscribe((value) => subject.next({ kind: api_1.JobOutboundMessageKind.Output, description, value }), (error) => subject.error(error), () => complete());
            subscription.add(inboundSub);
            return subscription;
        });
    };
    return Object.assign(handler, { jobDescription: options });
}
exports.createJobHandler = createJobHandler;
/**
 * Lazily create a job using a function.
 * @param loader A factory function that returns a promise/observable of a JobHandler.
 * @param options Same options as createJob.
 */
function createJobFactory(loader, options = {}) {
    const handler = (argument, context) => {
        return (0, rxjs_1.from)(loader()).pipe((0, operators_1.switchMap)((fn) => fn(argument, context)));
    };
    return Object.assign(handler, { jobDescription: options });
}
exports.createJobFactory = createJobFactory;
/**
 * Creates a job that logs out input/output messages of another Job. The messages are still
 * propagated to the other job.
 */
function createLoggerJob(job, logger) {
    const handler = (argument, context) => {
        context.inboundBus
            .pipe((0, operators_1.tap)((message) => logger.info(`Input: ${JSON.stringify(message)}`)))
            .subscribe();
        return job(argument, context).pipe((0, operators_1.tap)((message) => logger.info(`Message: ${JSON.stringify(message)}`), (error) => logger.warn(`Error: ${JSON.stringify(error)}`), () => logger.info(`Completed`)));
    };
    return Object.assign(handler, job);
}
exports.createLoggerJob = createLoggerJob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWpvYi1oYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYXJjaGl0ZWN0L3NyYy9qb2JzL2NyZWF0ZS1qb2ItaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQ0FBb0Y7QUFDcEYsK0JBQTJGO0FBQzNGLDhDQUFnRDtBQUNoRCwrQkFPZTtBQUVmLE1BQWEsNEJBQTZCLFNBQVEsb0JBQWE7SUFDN0QsWUFBWSxJQUFZO1FBQ3RCLEtBQUssQ0FBQyxXQUFXLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDMUQsQ0FBQztDQUNGO0FBSkQsb0VBSUM7QUF5QkQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsZ0JBQWdCLENBQzlCLEVBQStCLEVBQy9CLFVBQW1DLEVBQUU7SUFFckMsTUFBTSxPQUFPLEdBQUcsQ0FBQyxRQUFXLEVBQUUsT0FBbUMsRUFBRSxFQUFFO1FBQ25FLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7UUFDeEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUN0QyxNQUFNLFlBQVksR0FBRyxJQUFJLGNBQU8sRUFBSyxDQUFDO1FBQ3RDLElBQUksWUFBMEIsQ0FBQztRQUUvQixPQUFPLElBQUksaUJBQVUsQ0FBd0IsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUN2RCxTQUFTLFFBQVE7Z0JBQ2YsSUFBSSxZQUFZLEVBQUU7b0JBQ2hCLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztpQkFDNUI7Z0JBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSw0QkFBc0IsQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFDaEUsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNuQixZ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LGVBQWUsQ0FDN0IsR0FBd0IsRUFDeEIsTUFBeUI7SUFFekIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxRQUFXLEVBQUUsT0FBbUMsRUFBRSxFQUFFO1FBQ25FLE9BQU8sQ0FBQyxVQUFVO2FBQ2YsSUFBSSxDQUFDLElBQUEsZUFBRyxFQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN4RSxTQUFTLEVBQUUsQ0FBQztRQUVmLE9BQU8sR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQ2hDLElBQUEsZUFBRyxFQUNELENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQy9ELENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQ3pELEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQy9CLENBQ0YsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUVGLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDckMsQ0FBQztBQW5CRCwwQ0FtQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgQmFzZUV4Y2VwdGlvbiwgSnNvblZhbHVlLCBpc1Byb21pc2UsIGxvZ2dpbmcgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBPYnNlcnZlciwgU3ViamVjdCwgU3Vic2NyaXB0aW9uLCBmcm9tLCBpc09ic2VydmFibGUsIG9mIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBzd2l0Y2hNYXAsIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7XG4gIEpvYkRlc2NyaXB0aW9uLFxuICBKb2JIYW5kbGVyLFxuICBKb2JIYW5kbGVyQ29udGV4dCxcbiAgSm9iSW5ib3VuZE1lc3NhZ2VLaW5kLFxuICBKb2JPdXRib3VuZE1lc3NhZ2UsXG4gIEpvYk91dGJvdW5kTWVzc2FnZUtpbmQsXG59IGZyb20gJy4vYXBpJztcblxuZXhwb3J0IGNsYXNzIENoYW5uZWxBbHJlYWR5RXhpc3RFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoYENoYW5uZWwgJHtKU09OLnN0cmluZ2lmeShuYW1lKX0gYWxyZWFkeSBleGlzdC5gKTtcbiAgfVxufVxuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgdGhlIEpvYkhhbmRsZXIgY29udGV4dCB0aGF0IGlzIHVzZWQgd2hlbiB1c2luZyBgY3JlYXRlSm9iSGFuZGxlcigpYC4gSXQgZXh0ZW5kc1xuICogdGhlIGJhc2ljIGBKb2JIYW5kbGVyQ29udGV4dGAgd2l0aCBhZGRpdGlvbmFsIGZ1bmN0aW9uYWxpdHkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2ltcGxlSm9iSGFuZGxlckNvbnRleHQ8XG4gIEEgZXh0ZW5kcyBKc29uVmFsdWUsXG4gIEkgZXh0ZW5kcyBKc29uVmFsdWUsXG4gIE8gZXh0ZW5kcyBKc29uVmFsdWUsXG4+IGV4dGVuZHMgSm9iSGFuZGxlckNvbnRleHQ8QSwgSSwgTz4ge1xuICBjcmVhdGVDaGFubmVsOiAobmFtZTogc3RyaW5nKSA9PiBPYnNlcnZlcjxKc29uVmFsdWU+O1xuICBpbnB1dDogT2JzZXJ2YWJsZTxJPjtcbn1cblxuLyoqXG4gKiBBIHNpbXBsZSB2ZXJzaW9uIG9mIHRoZSBKb2JIYW5kbGVyLiBUaGlzIHNpbXBsaWZpZXMgYSBsb3Qgb2YgdGhlIGludGVyYWN0aW9uIHdpdGggdGhlIGpvYlxuICogc2NoZWR1bGVyIGFuZCByZWdpc3RyeS4gRm9yIGV4YW1wbGUsIGluc3RlYWQgb2YgcmV0dXJuaW5nIGEgSm9iT3V0Ym91bmRNZXNzYWdlIG9ic2VydmFibGUsIHlvdVxuICogY2FuIGRpcmVjdGx5IHJldHVybiBhbiBvdXRwdXQuXG4gKi9cbmV4cG9ydCB0eXBlIFNpbXBsZUpvYkhhbmRsZXJGbjxBIGV4dGVuZHMgSnNvblZhbHVlLCBJIGV4dGVuZHMgSnNvblZhbHVlLCBPIGV4dGVuZHMgSnNvblZhbHVlPiA9IChcbiAgaW5wdXQ6IEEsXG4gIGNvbnRleHQ6IFNpbXBsZUpvYkhhbmRsZXJDb250ZXh0PEEsIEksIE8+LFxuKSA9PiBPIHwgUHJvbWlzZTxPPiB8IE9ic2VydmFibGU8Tz47XG5cbi8qKlxuICogTWFrZSBhIHNpbXBsZSBqb2IgaGFuZGxlciB0aGF0IHNldHMgc3RhcnQgYW5kIGVuZCBmcm9tIGEgZnVuY3Rpb24gdGhhdCdzIHN5bmNocm9ub3VzLlxuICpcbiAqIEBwYXJhbSBmbiBUaGUgZnVuY3Rpb24gdG8gY3JlYXRlIGEgaGFuZGxlciBmb3IuXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvcHRpb25hbCBzZXQgb2YgcHJvcGVydGllcyB0byBzZXQgb24gdGhlIGhhbmRsZXIuIFNvbWUgZmllbGRzIG1pZ2h0IGJlXG4gKiAgIHJlcXVpcmVkIGJ5IHJlZ2lzdHJ5IG9yIHNjaGVkdWxlcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVKb2JIYW5kbGVyPEEgZXh0ZW5kcyBKc29uVmFsdWUsIEkgZXh0ZW5kcyBKc29uVmFsdWUsIE8gZXh0ZW5kcyBKc29uVmFsdWU+KFxuICBmbjogU2ltcGxlSm9iSGFuZGxlckZuPEEsIEksIE8+LFxuICBvcHRpb25zOiBQYXJ0aWFsPEpvYkRlc2NyaXB0aW9uPiA9IHt9LFxuKTogSm9iSGFuZGxlcjxBLCBJLCBPPiB7XG4gIGNvbnN0IGhhbmRsZXIgPSAoYXJndW1lbnQ6IEEsIGNvbnRleHQ6IEpvYkhhbmRsZXJDb250ZXh0PEEsIEksIE8+KSA9PiB7XG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBjb250ZXh0LmRlc2NyaXB0aW9uO1xuICAgIGNvbnN0IGluYm91bmRCdXMgPSBjb250ZXh0LmluYm91bmRCdXM7XG4gICAgY29uc3QgaW5wdXRDaGFubmVsID0gbmV3IFN1YmplY3Q8ST4oKTtcbiAgICBsZXQgc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG5cbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8Sm9iT3V0Ym91bmRNZXNzYWdlPE8+Pigoc3ViamVjdCkgPT4ge1xuICAgICAgZnVuY3Rpb24gY29tcGxldGUoKSB7XG4gICAgICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBzdWJqZWN0Lm5leHQoeyBraW5kOiBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLkVuZCwgZGVzY3JpcHRpb24gfSk7XG4gICAgICAgIHN1YmplY3QuY29tcGxldGUoKTtcbiAgICAgICAgaW5wdXRDaGFubmVsLmNvbXBsZXRlKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEhhbmRsZSBpbnB1dC5cbiAgICAgIGNvbnN0IGluYm91bmRTdWIgPSBpbmJvdW5kQnVzLnN1YnNjcmliZSgobWVzc2FnZSkgPT4ge1xuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2Uua2luZCkge1xuICAgICAgICAgIGNhc2UgSm9iSW5ib3VuZE1lc3NhZ2VLaW5kLlBpbmc6XG4gICAgICAgICAgICBzdWJqZWN0Lm5leHQoeyBraW5kOiBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLlBvbmcsIGRlc2NyaXB0aW9uLCBpZDogbWVzc2FnZS5pZCB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBKb2JJbmJvdW5kTWVzc2FnZUtpbmQuU3RvcDpcbiAgICAgICAgICAgIC8vIFRoZXJlJ3Mgbm8gd2F5IHRvIGNhbmNlbCBhIHByb21pc2Ugb3IgYSBzeW5jaHJvbm91cyBmdW5jdGlvbiwgYnV0IHdlIGRvIGNhbmNlbFxuICAgICAgICAgICAgLy8gb2JzZXJ2YWJsZXMgd2hlcmUgcG9zc2libGUuXG4gICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIEpvYkluYm91bmRNZXNzYWdlS2luZC5JbnB1dDpcbiAgICAgICAgICAgIGlucHV0Q2hhbm5lbC5uZXh0KG1lc3NhZ2UudmFsdWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBFeGVjdXRlIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSBhZGRpdGlvbmFsIGNvbnRleHQuXG4gICAgICBjb25zdCBjaGFubmVscyA9IG5ldyBNYXA8c3RyaW5nLCBTdWJqZWN0PEpzb25WYWx1ZT4+KCk7XG5cbiAgICAgIGNvbnN0IG5ld0NvbnRleHQ6IFNpbXBsZUpvYkhhbmRsZXJDb250ZXh0PEEsIEksIE8+ID0ge1xuICAgICAgICAuLi5jb250ZXh0LFxuICAgICAgICBpbnB1dDogaW5wdXRDaGFubmVsLmFzT2JzZXJ2YWJsZSgpLFxuICAgICAgICBjcmVhdGVDaGFubmVsKG5hbWU6IHN0cmluZykge1xuICAgICAgICAgIGlmIChjaGFubmVscy5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBDaGFubmVsQWxyZWFkeUV4aXN0RXhjZXB0aW9uKG5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBjaGFubmVsU3ViamVjdCA9IG5ldyBTdWJqZWN0PEpzb25WYWx1ZT4oKTtcbiAgICAgICAgICBjb25zdCBjaGFubmVsU3ViID0gY2hhbm5lbFN1YmplY3Quc3Vic2NyaWJlKFxuICAgICAgICAgICAgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgICAgc3ViamVjdC5uZXh0KHtcbiAgICAgICAgICAgICAgICBraW5kOiBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLkNoYW5uZWxNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgIHN1YmplY3QubmV4dCh7IGtpbmQ6IEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuQ2hhbm5lbEVycm9yLCBkZXNjcmlwdGlvbiwgbmFtZSwgZXJyb3IgfSk7XG4gICAgICAgICAgICAgIC8vIFRoaXMgY2FuIGJlIHJlb3BlbmVkLlxuICAgICAgICAgICAgICBjaGFubmVscy5kZWxldGUobmFtZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICBzdWJqZWN0Lm5leHQoeyBraW5kOiBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLkNoYW5uZWxDb21wbGV0ZSwgZGVzY3JpcHRpb24sIG5hbWUgfSk7XG4gICAgICAgICAgICAgIC8vIFRoaXMgY2FuIGJlIHJlb3BlbmVkLlxuICAgICAgICAgICAgICBjaGFubmVscy5kZWxldGUobmFtZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBjaGFubmVscy5zZXQobmFtZSwgY2hhbm5lbFN1YmplY3QpO1xuICAgICAgICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5hZGQoY2hhbm5lbFN1Yik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGNoYW5uZWxTdWJqZWN0O1xuICAgICAgICB9LFxuICAgICAgfTtcblxuICAgICAgc3ViamVjdC5uZXh0KHsga2luZDogSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5TdGFydCwgZGVzY3JpcHRpb24gfSk7XG4gICAgICBsZXQgcmVzdWx0ID0gZm4oYXJndW1lbnQsIG5ld0NvbnRleHQpO1xuICAgICAgLy8gSWYgdGhlIHJlc3VsdCBpcyBhIHByb21pc2UsIHNpbXBseSB3YWl0IGZvciBpdCB0byBjb21wbGV0ZSBiZWZvcmUgcmVwb3J0aW5nIHRoZSByZXN1bHQuXG4gICAgICBpZiAoaXNQcm9taXNlKHJlc3VsdCkpIHtcbiAgICAgICAgcmVzdWx0ID0gZnJvbShyZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICghaXNPYnNlcnZhYmxlKHJlc3VsdCkpIHtcbiAgICAgICAgcmVzdWx0ID0gb2YocmVzdWx0IGFzIE8pO1xuICAgICAgfVxuXG4gICAgICBzdWJzY3JpcHRpb24gPSAocmVzdWx0IGFzIE9ic2VydmFibGU8Tz4pLnN1YnNjcmliZShcbiAgICAgICAgKHZhbHVlOiBPKSA9PiBzdWJqZWN0Lm5leHQoeyBraW5kOiBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLk91dHB1dCwgZGVzY3JpcHRpb24sIHZhbHVlIH0pLFxuICAgICAgICAoZXJyb3IpID0+IHN1YmplY3QuZXJyb3IoZXJyb3IpLFxuICAgICAgICAoKSA9PiBjb21wbGV0ZSgpLFxuICAgICAgKTtcbiAgICAgIHN1YnNjcmlwdGlvbi5hZGQoaW5ib3VuZFN1Yik7XG5cbiAgICAgIHJldHVybiBzdWJzY3JpcHRpb247XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaGFuZGxlciwgeyBqb2JEZXNjcmlwdGlvbjogb3B0aW9ucyB9KTtcbn1cblxuLyoqXG4gKiBMYXppbHkgY3JlYXRlIGEgam9iIHVzaW5nIGEgZnVuY3Rpb24uXG4gKiBAcGFyYW0gbG9hZGVyIEEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBwcm9taXNlL29ic2VydmFibGUgb2YgYSBKb2JIYW5kbGVyLlxuICogQHBhcmFtIG9wdGlvbnMgU2FtZSBvcHRpb25zIGFzIGNyZWF0ZUpvYi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUpvYkZhY3Rvcnk8QSBleHRlbmRzIEpzb25WYWx1ZSwgSSBleHRlbmRzIEpzb25WYWx1ZSwgTyBleHRlbmRzIEpzb25WYWx1ZT4oXG4gIGxvYWRlcjogKCkgPT4gUHJvbWlzZTxKb2JIYW5kbGVyPEEsIEksIE8+PixcbiAgb3B0aW9uczogUGFydGlhbDxKb2JEZXNjcmlwdGlvbj4gPSB7fSxcbik6IEpvYkhhbmRsZXI8QSwgSSwgTz4ge1xuICBjb25zdCBoYW5kbGVyID0gKGFyZ3VtZW50OiBBLCBjb250ZXh0OiBKb2JIYW5kbGVyQ29udGV4dDxBLCBJLCBPPikgPT4ge1xuICAgIHJldHVybiBmcm9tKGxvYWRlcigpKS5waXBlKHN3aXRjaE1hcCgoZm4pID0+IGZuKGFyZ3VtZW50LCBjb250ZXh0KSkpO1xuICB9O1xuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKGhhbmRsZXIsIHsgam9iRGVzY3JpcHRpb246IG9wdGlvbnMgfSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGpvYiB0aGF0IGxvZ3Mgb3V0IGlucHV0L291dHB1dCBtZXNzYWdlcyBvZiBhbm90aGVyIEpvYi4gVGhlIG1lc3NhZ2VzIGFyZSBzdGlsbFxuICogcHJvcGFnYXRlZCB0byB0aGUgb3RoZXIgam9iLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTG9nZ2VySm9iPEEgZXh0ZW5kcyBKc29uVmFsdWUsIEkgZXh0ZW5kcyBKc29uVmFsdWUsIE8gZXh0ZW5kcyBKc29uVmFsdWU+KFxuICBqb2I6IEpvYkhhbmRsZXI8QSwgSSwgTz4sXG4gIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGksXG4pOiBKb2JIYW5kbGVyPEEsIEksIE8+IHtcbiAgY29uc3QgaGFuZGxlciA9IChhcmd1bWVudDogQSwgY29udGV4dDogSm9iSGFuZGxlckNvbnRleHQ8QSwgSSwgTz4pID0+IHtcbiAgICBjb250ZXh0LmluYm91bmRCdXNcbiAgICAgIC5waXBlKHRhcCgobWVzc2FnZSkgPT4gbG9nZ2VyLmluZm8oYElucHV0OiAke0pTT04uc3RyaW5naWZ5KG1lc3NhZ2UpfWApKSlcbiAgICAgIC5zdWJzY3JpYmUoKTtcblxuICAgIHJldHVybiBqb2IoYXJndW1lbnQsIGNvbnRleHQpLnBpcGUoXG4gICAgICB0YXAoXG4gICAgICAgIChtZXNzYWdlKSA9PiBsb2dnZXIuaW5mbyhgTWVzc2FnZTogJHtKU09OLnN0cmluZ2lmeShtZXNzYWdlKX1gKSxcbiAgICAgICAgKGVycm9yKSA9PiBsb2dnZXIud2FybihgRXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoZXJyb3IpfWApLFxuICAgICAgICAoKSA9PiBsb2dnZXIuaW5mbyhgQ29tcGxldGVkYCksXG4gICAgICApLFxuICAgICk7XG4gIH07XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaGFuZGxlciwgam9iKTtcbn1cbiJdfQ==