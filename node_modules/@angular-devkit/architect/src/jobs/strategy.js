"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = void 0;
const core_1 = require("@angular-devkit/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const api_1 = require("./api");
// eslint-disable-next-line @typescript-eslint/no-namespace
var strategy;
(function (strategy) {
    /**
     * Creates a JobStrategy that serializes every call. This strategy can be mixed between jobs.
     */
    function serialize() {
        let latest = (0, rxjs_1.of)();
        return (handler, options) => {
            const newHandler = (argument, context) => {
                const previous = latest;
                latest = (0, rxjs_1.concat)(previous.pipe((0, operators_1.ignoreElements)()), new rxjs_1.Observable((o) => handler(argument, context).subscribe(o))).pipe((0, operators_1.shareReplay)(0));
                return latest;
            };
            return Object.assign(newHandler, {
                jobDescription: Object.assign({}, handler.jobDescription, options),
            });
        };
    }
    strategy.serialize = serialize;
    /**
     * Creates a JobStrategy that will always reuse a running job, and restart it if the job ended.
     * @param replayMessages Replay ALL messages if a job is reused, otherwise just hook up where it
     * is.
     */
    function reuse(replayMessages = false) {
        let inboundBus = new rxjs_1.Subject();
        let run = null;
        let state = null;
        return (handler, options) => {
            const newHandler = (argument, context) => {
                // Forward inputs.
                const subscription = context.inboundBus.subscribe(inboundBus);
                if (run) {
                    return (0, rxjs_1.concat)(
                    // Update state.
                    (0, rxjs_1.of)(state), run).pipe((0, operators_1.finalize)(() => subscription.unsubscribe()));
                }
                run = handler(argument, { ...context, inboundBus: inboundBus.asObservable() }).pipe((0, operators_1.tap)((message) => {
                    if (message.kind == api_1.JobOutboundMessageKind.Start ||
                        message.kind == api_1.JobOutboundMessageKind.OnReady ||
                        message.kind == api_1.JobOutboundMessageKind.End) {
                        state = message;
                    }
                }, undefined, () => {
                    subscription.unsubscribe();
                    inboundBus = new rxjs_1.Subject();
                    run = null;
                }), replayMessages ? (0, operators_1.shareReplay)() : (0, operators_1.share)());
                return run;
            };
            return Object.assign(newHandler, handler, options || {});
        };
    }
    strategy.reuse = reuse;
    /**
     * Creates a JobStrategy that will reuse a running job if the argument matches.
     * @param replayMessages Replay ALL messages if a job is reused, otherwise just hook up where it
     * is.
     */
    function memoize(replayMessages = false) {
        const runs = new Map();
        return (handler, options) => {
            const newHandler = (argument, context) => {
                const argumentJson = JSON.stringify((0, core_1.isJsonObject)(argument)
                    ? Object.keys(argument)
                        .sort()
                        .reduce((result, key) => {
                        result[key] = argument[key];
                        return result;
                    }, {})
                    : argument);
                const maybeJob = runs.get(argumentJson);
                if (maybeJob) {
                    return maybeJob;
                }
                const run = handler(argument, context).pipe(replayMessages ? (0, operators_1.shareReplay)() : (0, operators_1.share)());
                runs.set(argumentJson, run);
                return run;
            };
            return Object.assign(newHandler, handler, options || {});
        };
    }
    strategy.memoize = memoize;
})(strategy = exports.strategy || (exports.strategy = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9hcmNoaXRlY3Qvc3JjL2pvYnMvc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQTJFO0FBQzNFLCtCQUF1RDtBQUN2RCw4Q0FBbUY7QUFDbkYsK0JBT2U7QUFFZiwyREFBMkQ7QUFDM0QsSUFBaUIsUUFBUSxDQW9JeEI7QUFwSUQsV0FBaUIsUUFBUTtJQVV2Qjs7T0FFRztJQUNILFNBQWdCLFNBQVM7UUFLdkIsSUFBSSxNQUFNLEdBQXNDLElBQUEsU0FBRSxHQUFFLENBQUM7UUFFckQsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUMxQixNQUFNLFVBQVUsR0FBRyxDQUFDLFFBQVcsRUFBRSxPQUFtQyxFQUFFLEVBQUU7Z0JBQ3RFLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQztnQkFDeEIsTUFBTSxHQUFHLElBQUEsYUFBTSxFQUNiLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBQSwwQkFBYyxHQUFFLENBQUMsRUFDL0IsSUFBSSxpQkFBVSxDQUF3QixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDdEYsQ0FBQyxJQUFJLENBQUMsSUFBQSx1QkFBVyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXZCLE9BQU8sTUFBTSxDQUFDO1lBQ2hCLENBQUMsQ0FBQztZQUVGLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7Z0JBQy9CLGNBQWMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQzthQUNuRSxDQUFDLENBQUM7UUFDTCxDQUFD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QUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBRXhDLElBQUksUUFBUSxFQUFFO29CQUNaLE9BQU8sUUFBUSxDQUFDO2lCQUNqQjtnQkFFRCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUEsdUJBQVcsR0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFBLGlCQUFLLEdBQUUsQ0FBQyxDQUFDO2dCQUN0RixJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFFNUIsT0FBTyxHQUFHLENBQUM7WUFDYixDQUFDLENBQUM7WUFFRixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQWxDZSxnQkFBTyxVQWtDdEIsQ0FBQTtBQUNILENBQUMsRUFwSWdCLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBb0l4QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBKc29uT2JqZWN0LCBKc29uVmFsdWUsIGlzSnNvbk9iamVjdCB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YmplY3QsIGNvbmNhdCwgb2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZpbmFsaXplLCBpZ25vcmVFbGVtZW50cywgc2hhcmUsIHNoYXJlUmVwbGF5LCB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1xuICBKb2JEZXNjcmlwdGlvbixcbiAgSm9iSGFuZGxlcixcbiAgSm9iSGFuZGxlckNvbnRleHQsXG4gIEpvYkluYm91bmRNZXNzYWdlLFxuICBKb2JPdXRib3VuZE1lc3NhZ2UsXG4gIEpvYk91dGJvdW5kTWVzc2FnZUtpbmQsXG59IGZyb20gJy4vYXBpJztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1uYW1lc3BhY2VcbmV4cG9ydCBuYW1lc3BhY2Ugc3RyYXRlZ3kge1xuICBleHBvcnQgdHlwZSBKb2JTdHJhdGVneTxcbiAgICBBIGV4dGVuZHMgSnNvblZhbHVlID0gSnNvblZhbHVlLFxuICAgIEkgZXh0ZW5kcyBKc29uVmFsdWUgPSBKc29uVmFsdWUsXG4gICAgTyBleHRlbmRzIEpzb25WYWx1ZSA9IEpzb25WYWx1ZSxcbiAgPiA9IChcbiAgICBoYW5kbGVyOiBKb2JIYW5kbGVyPEEsIEksIE8+LFxuICAgIG9wdGlvbnM/OiBQYXJ0aWFsPFJlYWRvbmx5PEpvYkRlc2NyaXB0aW9uPj4sXG4gICkgPT4gSm9iSGFuZGxlcjxBLCBJLCBPPjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIEpvYlN0cmF0ZWd5IHRoYXQgc2VyaWFsaXplcyBldmVyeSBjYWxsLiBUaGlzIHN0cmF0ZWd5IGNhbiBiZSBtaXhlZCBiZXR3ZWVuIGpvYnMuXG4gICAqL1xuICBleHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplPFxuICAgIEEgZXh0ZW5kcyBKc29uVmFsdWUgPSBKc29uVmFsdWUsXG4gICAgSSBleHRlbmRzIEpzb25WYWx1ZSA9IEpzb25WYWx1ZSxcbiAgICBPIGV4dGVuZHMgSnNvblZhbHVlID0gSnNvblZhbHVlLFxuICA+KCk6IEpvYlN0cmF0ZWd5PEEsIEksIE8+IHtcbiAgICBsZXQgbGF0ZXN0OiBPYnNlcnZhYmxlPEpvYk91dGJvdW5kTWVzc2FnZTxPPj4gPSBvZigpO1xuXG4gICAgcmV0dXJuIChoYW5kbGVyLCBvcHRpb25zKSA9PiB7XG4gICAgICBjb25zdCBuZXdIYW5kbGVyID0gKGFyZ3VtZW50OiBBLCBjb250ZXh0OiBKb2JIYW5kbGVyQ29udGV4dDxBLCBJLCBPPikgPT4ge1xuICAgICAgICBjb25zdCBwcmV2aW91cyA9IGxhdGVzdDtcbiAgICAgICAgbGF0ZXN0ID0gY29uY2F0KFxuICAgICAgICAgIHByZXZpb3VzLnBpcGUoaWdub3JlRWxlbWVudHMoKSksXG4gICAgICAgICAgbmV3IE9ic2VydmFibGU8Sm9iT3V0Ym91bmRNZXNzYWdlPE8+PigobykgPT4gaGFuZGxlcihhcmd1bWVudCwgY29udGV4dCkuc3Vic2NyaWJlKG8pKSxcbiAgICAgICAgKS5waXBlKHNoYXJlUmVwbGF5KDApKTtcblxuICAgICAgICByZXR1cm4gbGF0ZXN0O1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3SGFuZGxlciwge1xuICAgICAgICBqb2JEZXNjcmlwdGlvbjogT2JqZWN0LmFzc2lnbih7fSwgaGFuZGxlci5qb2JEZXNjcmlwdGlvbiwgb3B0aW9ucyksXG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBKb2JTdHJhdGVneSB0aGF0IHdpbGwgYWx3YXlzIHJldXNlIGEgcnVubmluZyBqb2IsIGFuZCByZXN0YXJ0IGl0IGlmIHRoZSBqb2IgZW5kZWQuXG4gICAqIEBwYXJhbSByZXBsYXlNZXNzYWdlcyBSZXBsYXkgQUxMIG1lc3NhZ2VzIGlmIGEgam9iIGlzIHJldXNlZCwgb3RoZXJ3aXNlIGp1c3QgaG9vayB1cCB3aGVyZSBpdFxuICAgKiBpcy5cbiAgICovXG4gIGV4cG9ydCBmdW5jdGlvbiByZXVzZTxcbiAgICBBIGV4dGVuZHMgSnNvblZhbHVlID0gSnNvblZhbHVlLFxuICAgIEkgZXh0ZW5kcyBKc29uVmFsdWUgPSBKc29uVmFsdWUsXG4gICAgTyBleHRlbmRzIEpzb25WYWx1ZSA9IEpzb25WYWx1ZSxcbiAgPihyZXBsYXlNZXNzYWdlcyA9IGZhbHNlKTogSm9iU3RyYXRlZ3k8QSwgSSwgTz4ge1xuICAgIGxldCBpbmJvdW5kQnVzID0gbmV3IFN1YmplY3Q8Sm9iSW5ib3VuZE1lc3NhZ2U8ST4+KCk7XG4gICAgbGV0IHJ1bjogT2JzZXJ2YWJsZTxKb2JPdXRib3VuZE1lc3NhZ2U8Tz4+IHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IHN0YXRlOiBKb2JPdXRib3VuZE1lc3NhZ2U8Tz4gfCBudWxsID0gbnVsbDtcblxuICAgIHJldHVybiAoaGFuZGxlciwgb3B0aW9ucykgPT4ge1xuICAgICAgY29uc3QgbmV3SGFuZGxlciA9IChhcmd1bWVudDogQSwgY29udGV4dDogSm9iSGFuZGxlckNvbnRleHQ8QSwgSSwgTz4pID0+IHtcbiAgICAgICAgLy8gRm9yd2FyZCBpbnB1dHMuXG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IGNvbnRleHQuaW5ib3VuZEJ1cy5zdWJzY3JpYmUoaW5ib3VuZEJ1cyk7XG5cbiAgICAgICAgaWYgKHJ1bikge1xuICAgICAgICAgIHJldHVybiBjb25jYXQoXG4gICAgICAgICAgICAvLyBVcGRhdGUgc3RhdGUuXG4gICAgICAgICAgICBvZihzdGF0ZSksXG4gICAgICAgICAgICBydW4sXG4gICAgICAgICAgKS5waXBlKGZpbmFsaXplKCgpID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKSk7XG4gICAgICAgIH1cblxuICAgICAgICBydW4gPSBoYW5kbGVyKGFyZ3VtZW50LCB7IC4uLmNvbnRleHQsIGluYm91bmRCdXM6IGluYm91bmRCdXMuYXNPYnNlcnZhYmxlKCkgfSkucGlwZShcbiAgICAgICAgICB0YXAoXG4gICAgICAgICAgICAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5raW5kID09IEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuU3RhcnQgfHxcbiAgICAgICAgICAgICAgICBtZXNzYWdlLmtpbmQgPT0gSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5PblJlYWR5IHx8XG4gICAgICAgICAgICAgICAgbWVzc2FnZS5raW5kID09IEpvYk91dGJvdW5kTWVzc2FnZUtpbmQuRW5kXG4gICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHN0YXRlID0gbWVzc2FnZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgIGluYm91bmRCdXMgPSBuZXcgU3ViamVjdDxKb2JJbmJvdW5kTWVzc2FnZTxJPj4oKTtcbiAgICAgICAgICAgICAgcnVuID0gbnVsbDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgKSxcbiAgICAgICAgICByZXBsYXlNZXNzYWdlcyA/IHNoYXJlUmVwbGF5KCkgOiBzaGFyZSgpLFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBydW47XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXdIYW5kbGVyLCBoYW5kbGVyLCBvcHRpb25zIHx8IHt9KTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBKb2JTdHJhdGVneSB0aGF0IHdpbGwgcmV1c2UgYSBydW5uaW5nIGpvYiBpZiB0aGUgYXJndW1lbnQgbWF0Y2hlcy5cbiAgICogQHBhcmFtIHJlcGxheU1lc3NhZ2VzIFJlcGxheSBBTEwgbWVzc2FnZXMgaWYgYSBqb2IgaXMgcmV1c2VkLCBvdGhlcndpc2UganVzdCBob29rIHVwIHdoZXJlIGl0XG4gICAqIGlzLlxuICAgKi9cbiAgZXhwb3J0IGZ1bmN0aW9uIG1lbW9pemU8XG4gICAgQSBleHRlbmRzIEpzb25WYWx1ZSA9IEpzb25WYWx1ZSxcbiAgICBJIGV4dGVuZHMgSnNvblZhbHVlID0gSnNvblZhbHVlLFxuICAgIE8gZXh0ZW5kcyBKc29uVmFsdWUgPSBKc29uVmFsdWUsXG4gID4ocmVwbGF5TWVzc2FnZXMgPSBmYWxzZSk6IEpvYlN0cmF0ZWd5PEEsIEksIE8+IHtcbiAgICBjb25zdCBydW5zID0gbmV3IE1hcDxzdHJpbmcsIE9ic2VydmFibGU8Sm9iT3V0Ym91bmRNZXNzYWdlPE8+Pj4oKTtcblxuICAgIHJldHVybiAoaGFuZGxlciwgb3B0aW9ucykgPT4ge1xuICAgICAgY29uc3QgbmV3SGFuZGxlciA9IChhcmd1bWVudDogQSwgY29udGV4dDogSm9iSGFuZGxlckNvbnRleHQ8QSwgSSwgTz4pID0+IHtcbiAgICAgICAgY29uc3QgYXJndW1lbnRKc29uID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgICAgICAgaXNKc29uT2JqZWN0KGFyZ3VtZW50KVxuICAgICAgICAgICAgPyBPYmplY3Qua2V5cyhhcmd1bWVudClcbiAgICAgICAgICAgICAgICAuc29ydCgpXG4gICAgICAgICAgICAgICAgLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gYXJndW1lbnRba2V5XTtcblxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9LCB7fSBhcyBKc29uT2JqZWN0KVxuICAgICAgICAgICAgOiBhcmd1bWVudCxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgbWF5YmVKb2IgPSBydW5zLmdldChhcmd1bWVudEpzb24pO1xuXG4gICAgICAgIGlmIChtYXliZUpvYikge1xuICAgICAgICAgIHJldHVybiBtYXliZUpvYjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJ1biA9IGhhbmRsZXIoYXJndW1lbnQsIGNvbnRleHQpLnBpcGUocmVwbGF5TWVzc2FnZXMgPyBzaGFyZVJlcGxheSgpIDogc2hhcmUoKSk7XG4gICAgICAgIHJ1bnMuc2V0KGFyZ3VtZW50SnNvbiwgcnVuKTtcblxuICAgICAgICByZXR1cm4gcnVuO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3SGFuZGxlciwgaGFuZGxlciwgb3B0aW9ucyB8fCB7fSk7XG4gICAgfTtcbiAgfVxufVxuIl19