"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuilder = void 0;
const core_1 = require("@angular-devkit/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const api_1 = require("./api");
const internal_1 = require("./internal");
const jobs_1 = require("./jobs");
const schedule_by_name_1 = require("./schedule-by-name");
// eslint-disable-next-line max-lines-per-function
function createBuilder(fn) {
    const cjh = jobs_1.createJobHandler;
    // eslint-disable-next-line max-lines-per-function
    const handler = cjh((options, context) => {
        const scheduler = context.scheduler;
        const progressChannel = context.createChannel('progress');
        const logChannel = context.createChannel('log');
        let currentState = api_1.BuilderProgressState.Stopped;
        const teardownLogics = [];
        let tearingDown = false;
        let current = 0;
        let status = '';
        let total = 1;
        function log(entry) {
            logChannel.next(entry);
        }
        function progress(progress, context) {
            currentState = progress.state;
            if (progress.state === api_1.BuilderProgressState.Running) {
                current = progress.current;
                total = progress.total !== undefined ? progress.total : total;
                if (progress.status === undefined) {
                    progress.status = status;
                }
                else {
                    status = progress.status;
                }
            }
            progressChannel.next({
                ...progress,
                ...(context.target && { target: context.target }),
                ...(context.builder && { builder: context.builder }),
                id: context.id,
            });
        }
        return new rxjs_1.Observable((observer) => {
            const subscriptions = [];
            const inputSubscription = context.inboundBus.subscribe((i) => {
                switch (i.kind) {
                    case jobs_1.JobInboundMessageKind.Stop:
                        // Run teardown logic then complete.
                        tearingDown = true;
                        Promise.all(teardownLogics.map((fn) => fn() || Promise.resolve())).then(() => observer.complete(), (err) => observer.error(err));
                        break;
                    case jobs_1.JobInboundMessageKind.Input:
                        if (!tearingDown) {
                            onInput(i.value);
                        }
                        break;
                }
            });
            function onInput(i) {
                const builder = i.info;
                const loggerName = i.target
                    ? (0, api_1.targetStringFromTarget)(i.target)
                    : builder.builderName;
                const logger = new core_1.logging.Logger(loggerName);
                subscriptions.push(logger.subscribe((entry) => log(entry)));
                const context = {
                    builder,
                    workspaceRoot: i.workspaceRoot,
                    currentDirectory: i.currentDirectory,
                    target: i.target,
                    logger: logger,
                    id: i.id,
                    async scheduleTarget(target, overrides = {}, scheduleOptions = {}) {
                        const run = await (0, schedule_by_name_1.scheduleByTarget)(target, overrides, {
                            scheduler,
                            logger: scheduleOptions.logger || logger.createChild(''),
                            workspaceRoot: i.workspaceRoot,
                            currentDirectory: i.currentDirectory,
                        });
                        // We don't want to subscribe errors and complete.
                        subscriptions.push(run.progress.subscribe((event) => progressChannel.next(event)));
                        return run;
                    },
                    async scheduleBuilder(builderName, options = {}, scheduleOptions = {}) {
                        const run = await (0, schedule_by_name_1.scheduleByName)(builderName, options, {
                            scheduler,
                            target: scheduleOptions.target,
                            logger: scheduleOptions.logger || logger.createChild(''),
                            workspaceRoot: i.workspaceRoot,
                            currentDirectory: i.currentDirectory,
                        });
                        // We don't want to subscribe errors and complete.
                        subscriptions.push(run.progress.subscribe((event) => progressChannel.next(event)));
                        return run;
                    },
                    async getTargetOptions(target) {
                        return scheduler
                            .schedule('..getTargetOptions', target)
                            .output.toPromise();
                    },
                    async getProjectMetadata(target) {
                        return scheduler
                            .schedule('..getProjectMetadata', target)
                            .output.toPromise();
                    },
                    async getBuilderNameForTarget(target) {
                        return scheduler
                            .schedule('..getBuilderNameForTarget', target)
                            .output.toPromise();
                    },
                    async validateOptions(options, builderName) {
                        return scheduler
                            .schedule('..validateOptions', [
                            builderName,
                            options,
                        ])
                            .output.toPromise();
                    },
                    reportRunning() {
                        switch (currentState) {
                            case api_1.BuilderProgressState.Waiting:
                            case api_1.BuilderProgressState.Stopped:
                                progress({ state: api_1.BuilderProgressState.Running, current: 0, total }, context);
                                break;
                        }
                    },
                    reportStatus(status) {
                        switch (currentState) {
                            case api_1.BuilderProgressState.Running:
                                progress({ state: currentState, status, current, total }, context);
                                break;
                            case api_1.BuilderProgressState.Waiting:
                                progress({ state: currentState, status }, context);
                                break;
                        }
                    },
                    reportProgress(current, total, status) {
                        switch (currentState) {
                            case api_1.BuilderProgressState.Running:
                                progress({ state: currentState, current, total, status }, context);
                        }
                    },
                    addTeardown(teardown) {
                        teardownLogics.push(teardown);
                    },
                };
                context.reportRunning();
                let result;
                try {
                    result = fn(i.options, context);
                    if ((0, api_1.isBuilderOutput)(result)) {
                        result = (0, rxjs_1.of)(result);
                    }
                    else if (!(0, rxjs_1.isObservable)(result) && isAsyncIterable(result)) {
                        result = (0, api_1.fromAsyncIterable)(result);
                    }
                    else {
                        result = (0, rxjs_1.from)(result);
                    }
                }
                catch (e) {
                    result = (0, rxjs_1.throwError)(e);
                }
                // Manage some state automatically.
                progress({ state: api_1.BuilderProgressState.Running, current: 0, total: 1 }, context);
                subscriptions.push(result
                    .pipe((0, operators_1.defaultIfEmpty)({ success: false }), (0, operators_1.tap)(() => {
                    progress({ state: api_1.BuilderProgressState.Running, current: total }, context);
                    progress({ state: api_1.BuilderProgressState.Stopped }, context);
                }), (0, operators_1.mergeMap)(async (value) => {
                    // Allow the log queue to flush
                    await new Promise(setImmediate);
                    return value;
                }))
                    .subscribe((message) => observer.next(message), (error) => observer.error(error), () => observer.complete()));
            }
            return () => {
                subscriptions.forEach((x) => x.unsubscribe());
                inputSubscription.unsubscribe();
            };
        });
    });
    return {
        handler,
        [internal_1.BuilderSymbol]: true,
        [internal_1.BuilderVersionSymbol]: require('../package.json').version,
    };
}
exports.createBuilder = createBuilder;
function isAsyncIterable(obj) {
    return !!obj && typeof obj[Symbol.asyncIterator] === 'function';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9hcmNoaXRlY3Qvc3JjL2NyZWF0ZS1idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtDQUFxRDtBQUNyRCwrQkFBb0Y7QUFDcEYsOENBQStEO0FBQy9ELCtCQWFlO0FBQ2YseUNBQTBFO0FBQzFFLGlDQUFpRTtBQUNqRSx5REFBc0U7QUFFdEUsa0RBQWtEO0FBQ2xELFNBQWdCLGFBQWEsQ0FDM0IsRUFBMEI7SUFFMUIsTUFBTSxHQUFHLEdBQUcsdUJBQWdCLENBQUM7SUFDN0Isa0RBQWtEO0lBQ2xELE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBc0MsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDNUUsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUNwQyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEQsSUFBSSxZQUFZLEdBQXlCLDBCQUFvQixDQUFDLE9BQU8sQ0FBQztRQUN0RSxNQUFNLGNBQWMsR0FBMEMsRUFBRSxDQUFDO1FBQ2pFLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUVkLFNBQVMsR0FBRyxDQUFDLEtBQXVCO1lBQ2xDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUNELFNBQVMsUUFBUSxDQUFDLFFBQThCLEVBQUUsT0FBdUI7WUFDdkUs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QUFRLEVBQUUsQ0FDMUIsQ0FDSixDQUFDO1lBQ0osQ0FBQztZQUVELE9BQU8sR0FBRyxFQUFFO2dCQUNWLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNsQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTztRQUNMLE9BQU87UUFDUCxDQUFDLHdCQUFhLENBQUMsRUFBRSxJQUFJO1FBQ3JCLENBQUMsK0JBQW9CLENBQUMsRUFBRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPO0tBQzNELENBQUM7QUFDSixDQUFDO0FBOU5ELHNDQThOQztBQUVELFNBQVMsZUFBZSxDQUFJLEdBQVk7SUFDdEMsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLE9BQVEsR0FBd0IsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssVUFBVSxDQUFDO0FBQ3hGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsganNvbiwgbG9nZ2luZyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YnNjcmlwdGlvbiwgZnJvbSwgaXNPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgZGVmYXVsdElmRW1wdHksIG1lcmdlTWFwLCB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1xuICBCdWlsZGVyQ29udGV4dCxcbiAgQnVpbGRlckhhbmRsZXJGbixcbiAgQnVpbGRlckluZm8sXG4gIEJ1aWxkZXJJbnB1dCxcbiAgQnVpbGRlck91dHB1dCxcbiAgQnVpbGRlclByb2dyZXNzU3RhdGUsXG4gIFNjaGVkdWxlT3B0aW9ucyxcbiAgVGFyZ2V0LFxuICBUeXBlZEJ1aWxkZXJQcm9ncmVzcyxcbiAgZnJvbUFzeW5jSXRlcmFibGUsXG4gIGlzQnVpbGRlck91dHB1dCxcbiAgdGFyZ2V0U3RyaW5nRnJvbVRhcmdldCxcbn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHsgQnVpbGRlciwgQnVpbGRlclN5bWJvbCwgQnVpbGRlclZlcnNpb25TeW1ib2wgfSBmcm9tICcuL2ludGVybmFsJztcbmltcG9ydCB7IEpvYkluYm91bmRNZXNzYWdlS2luZCwgY3JlYXRlSm9iSGFuZGxlciB9IGZyb20gJy4vam9icyc7XG5pbXBvcnQgeyBzY2hlZHVsZUJ5TmFtZSwgc2NoZWR1bGVCeVRhcmdldCB9IGZyb20gJy4vc2NoZWR1bGUtYnktbmFtZSc7XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBtYXgtbGluZXMtcGVyLWZ1bmN0aW9uXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQnVpbGRlcjxPcHRUID0ganNvbi5Kc29uT2JqZWN0LCBPdXRUIGV4dGVuZHMgQnVpbGRlck91dHB1dCA9IEJ1aWxkZXJPdXRwdXQ+KFxuICBmbjogQnVpbGRlckhhbmRsZXJGbjxPcHRUPixcbik6IEJ1aWxkZXI8T3B0VCAmIGpzb24uSnNvbk9iamVjdD4ge1xuICBjb25zdCBjamggPSBjcmVhdGVKb2JIYW5kbGVyO1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbWF4LWxpbmVzLXBlci1mdW5jdGlvblxuICBjb25zdCBoYW5kbGVyID0gY2poPGpzb24uSnNvbk9iamVjdCwgQnVpbGRlcklucHV0LCBPdXRUPigob3B0aW9ucywgY29udGV4dCkgPT4ge1xuICAgIGNvbnN0IHNjaGVkdWxlciA9IGNvbnRleHQuc2NoZWR1bGVyO1xuICAgIGNvbnN0IHByb2dyZXNzQ2hhbm5lbCA9IGNvbnRleHQuY3JlYXRlQ2hhbm5lbCgncHJvZ3Jlc3MnKTtcbiAgICBjb25zdCBsb2dDaGFubmVsID0gY29udGV4dC5jcmVhdGVDaGFubmVsKCdsb2cnKTtcbiAgICBsZXQgY3VycmVudFN0YXRlOiBCdWlsZGVyUHJvZ3Jlc3NTdGF0ZSA9IEJ1aWxkZXJQcm9ncmVzc1N0YXRlLlN0b3BwZWQ7XG4gICAgY29uc3QgdGVhcmRvd25Mb2dpY3M6IEFycmF5PCgpID0+IFByb21pc2VMaWtlPHZvaWQ+IHwgdm9pZD4gPSBbXTtcbiAgICBsZXQgdGVhcmluZ0Rvd24gPSBmYWxzZTtcbiAgICBsZXQgY3VycmVudCA9IDA7XG4gICAgbGV0IHN0YXR1cyA9ICcnO1xuICAgIGxldCB0b3RhbCA9IDE7XG5cbiAgICBmdW5jdGlvbiBsb2coZW50cnk6IGxvZ2dpbmcuTG9nRW50cnkpIHtcbiAgICAgIGxvZ0NoYW5uZWwubmV4dChlbnRyeSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHByb2dyZXNzKHByb2dyZXNzOiBUeXBlZEJ1aWxkZXJQcm9ncmVzcywgY29udGV4dDogQnVpbGRlckNvbnRleHQpIHtcbiAgICAgIGN1cnJlbnRTdGF0ZSA9IHByb2dyZXNzLnN0YXRlO1xuICAgICAgaWYgKHByb2dyZXNzLnN0YXRlID09PSBCdWlsZGVyUHJvZ3Jlc3NTdGF0ZS5SdW5uaW5nKSB7XG4gICAgICAgIGN1cnJlbnQgPSBwcm9ncmVzcy5jdXJyZW50O1xuICAgICAgICB0b3RhbCA9IHByb2dyZXNzLnRvdGFsICE9PSB1bmRlZmluZWQgPyBwcm9ncmVzcy50b3RhbCA6IHRvdGFsO1xuXG4gICAgICAgIGlmIChwcm9ncmVzcy5zdGF0dXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHByb2dyZXNzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGF0dXMgPSBwcm9ncmVzcy5zdGF0dXM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHJvZ3Jlc3NDaGFubmVsLm5leHQoe1xuICAgICAgICAuLi4ocHJvZ3Jlc3MgYXMganNvbi5Kc29uT2JqZWN0KSxcbiAgICAgICAgLi4uKGNvbnRleHQudGFyZ2V0ICYmIHsgdGFyZ2V0OiBjb250ZXh0LnRhcmdldCB9KSxcbiAgICAgICAgLi4uKGNvbnRleHQuYnVpbGRlciAmJiB7IGJ1aWxkZXI6IGNvbnRleHQuYnVpbGRlciB9KSxcbiAgICAgICAgaWQ6IGNvbnRleHQuaWQsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGU8T3V0VD4oKG9ic2VydmVyKSA9PiB7XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb25zOiBTdWJzY3JpcHRpb25bXSA9IFtdO1xuXG4gICAgICBjb25zdCBpbnB1dFN1YnNjcmlwdGlvbiA9IGNvbnRleHQuaW5ib3VuZEJ1cy5zdWJzY3JpYmUoKGkpID0+IHtcbiAgICAgICAgc3dpdGNoIChpLmtpbmQpIHtcbiAgICAgICAgICBjYXNlIEpvYkluYm91bmRNZXNzYWdlS2luZC5TdG9wOlxuICAgICAgICAgICAgLy8gUnVuIHRlYXJkb3duIGxvZ2ljIHRoZW4gY29tcGxldGUuXG4gICAgICAgICAgICB0ZWFyaW5nRG93biA9IHRydWU7XG4gICAgICAgICAgICBQcm9taXNlLmFsbCh0ZWFyZG93bkxvZ2ljcy5tYXAoKGZuKSA9PiBmbigpIHx8IFByb21pc2UucmVzb2x2ZSgpKSkudGhlbihcbiAgICAgICAgICAgICAgKCkgPT4gb2JzZXJ2ZXIuY29tcGxldGUoKSxcbiAgICAgICAgICAgICAgKGVycikgPT4gb2JzZXJ2ZXIuZXJyb3IoZXJyKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIEpvYkluYm91bmRNZXNzYWdlS2luZC5JbnB1dDpcbiAgICAgICAgICAgIGlmICghdGVhcmluZ0Rvd24pIHtcbiAgICAgICAgICAgICAgb25JbnB1dChpLnZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gb25JbnB1dChpOiBCdWlsZGVySW5wdXQpIHtcbiAgICAgICAgY29uc3QgYnVpbGRlciA9IGkuaW5mbyBhcyBCdWlsZGVySW5mbztcbiAgICAgICAgY29uc3QgbG9nZ2VyTmFtZSA9IGkudGFyZ2V0XG4gICAgICAgICAgPyB0YXJnZXRTdHJpbmdGcm9tVGFyZ2V0KGkudGFyZ2V0IGFzIFRhcmdldClcbiAgICAgICAgICA6IGJ1aWxkZXIuYnVpbGRlck5hbWU7XG4gICAgICAgIGNvbnN0IGxvZ2dlciA9IG5ldyBsb2dnaW5nLkxvZ2dlcihsb2dnZXJOYW1lKTtcblxuICAgICAgICBzdWJzY3JpcHRpb25zLnB1c2gobG9nZ2VyLnN1YnNjcmliZSgoZW50cnkpID0+IGxvZyhlbnRyeSkpKTtcblxuICAgICAgICBjb25zdCBjb250ZXh0OiBCdWlsZGVyQ29udGV4dCA9IHtcbiAgICAgICAgICBidWlsZGVyLFxuICAgICAgICAgIHdvcmtzcGFjZVJvb3Q6IGkud29ya3NwYWNlUm9vdCxcbiAgICAgICAgICBjdXJyZW50RGlyZWN0b3J5OiBpLmN1cnJlbnREaXJlY3RvcnksXG4gICAgICAgICAgdGFyZ2V0OiBpLnRhcmdldCBhcyBUYXJnZXQsXG4gICAgICAgICAgbG9nZ2VyOiBsb2dnZXIsXG4gICAgICAgICAgaWQ6IGkuaWQsXG4gICAgICAgICAgYXN5bmMgc2NoZWR1bGVUYXJnZXQoXG4gICAgICAgICAgICB0YXJnZXQ6IFRhcmdldCxcbiAgICAgICAgICAgIG92ZXJyaWRlczoganNvbi5Kc29uT2JqZWN0ID0ge30sXG4gICAgICAgICAgICBzY2hlZHVsZU9wdGlvbnM6IFNjaGVkdWxlT3B0aW9ucyA9IHt9LFxuICAgICAgICAgICkge1xuICAgICAgICAgICAgY29uc3QgcnVuID0gYXdhaXQgc2NoZWR1bGVCeVRhcmdldCh0YXJnZXQsIG92ZXJyaWRlcywge1xuICAgICAgICAgICAgICBzY2hlZHVsZXIsXG4gICAgICAgICAgICAgIGxvZ2dlcjogc2NoZWR1bGVPcHRpb25zLmxvZ2dlciB8fCBsb2dnZXIuY3JlYXRlQ2hpbGQoJycpLFxuICAgICAgICAgICAgICB3b3Jrc3BhY2VSb290OiBpLndvcmtzcGFjZVJvb3QsXG4gICAgICAgICAgICAgIGN1cnJlbnREaXJlY3Rvcnk6IGkuY3VycmVudERpcmVjdG9yeSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBXZSBkb24ndCB3YW50IHRvIHN1YnNjcmliZSBlcnJvcnMgYW5kIGNvbXBsZXRlLlxuICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy5wdXNoKHJ1bi5wcm9ncmVzcy5zdWJzY3JpYmUoKGV2ZW50KSA9PiBwcm9ncmVzc0NoYW5uZWwubmV4dChldmVudCkpKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJ1bjtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFzeW5jIHNjaGVkdWxlQnVpbGRlcihcbiAgICAgICAgICAgIGJ1aWxkZXJOYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICBvcHRpb25zOiBqc29uLkpzb25PYmplY3QgPSB7fSxcbiAgICAgICAgICAgIHNjaGVkdWxlT3B0aW9uczogU2NoZWR1bGVPcHRpb25zID0ge30sXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBjb25zdCBydW4gPSBhd2FpdCBzY2hlZHVsZUJ5TmFtZShidWlsZGVyTmFtZSwgb3B0aW9ucywge1xuICAgICAgICAgICAgICBzY2hlZHVsZXIsXG4gICAgICAgICAgICAgIHRhcmdldDogc2NoZWR1bGVPcHRpb25zLnRhcmdldCxcbiAgICAgICAgICAgICAgbG9nZ2VyOiBzY2hlZHVsZU9wdGlvbnMubG9nZ2VyIHx8IGxvZ2dlci5jcmVhdGVDaGlsZCgnJyksXG4gICAgICAgICAgICAgIHdvcmtzcGFjZVJvb3Q6IGkud29ya3NwYWNlUm9vdCxcbiAgICAgICAgICAgICAgY3VycmVudERpcmVjdG9yeTogaS5jdXJyZW50RGlyZWN0b3J5LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gc3Vic2NyaWJlIGVycm9ycyBhbmQgY29tcGxldGUuXG4gICAgICAgICAgICBzdWJzY3JpcHRpb25zLnB1c2gocnVuLnByb2dyZXNzLnN1YnNjcmliZSgoZXZlbnQpID0+IHByb2dyZXNzQ2hhbm5lbC5uZXh0KGV2ZW50KSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gcnVuO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgYXN5bmMgZ2V0VGFyZ2V0T3B0aW9ucyh0YXJnZXQ6IFRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlclxuICAgICAgICAgICAgICAuc2NoZWR1bGU8VGFyZ2V0LCBqc29uLkpzb25WYWx1ZSwganNvbi5Kc29uT2JqZWN0PignLi5nZXRUYXJnZXRPcHRpb25zJywgdGFyZ2V0KVxuICAgICAgICAgICAgICAub3V0cHV0LnRvUHJvbWlzZSgpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgYXN5bmMgZ2V0UHJvamVjdE1ldGFkYXRhKHRhcmdldDogVGFyZ2V0IHwgc3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gc2NoZWR1bGVyXG4gICAgICAgICAgICAgIC5zY2hlZHVsZTxUYXJnZXQgfCBzdHJpbmcsIGpzb24uSnNvblZhbHVlLCBqc29uLkpzb25PYmplY3Q+KFxuICAgICAgICAgICAgICAgICcuLmdldFByb2plY3RNZXRhZGF0YScsXG4gICAgICAgICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIC5vdXRwdXQudG9Qcm9taXNlKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhc3luYyBnZXRCdWlsZGVyTmFtZUZvclRhcmdldCh0YXJnZXQ6IFRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuIHNjaGVkdWxlclxuICAgICAgICAgICAgICAuc2NoZWR1bGU8VGFyZ2V0LCBqc29uLkpzb25WYWx1ZSwgc3RyaW5nPignLi5nZXRCdWlsZGVyTmFtZUZvclRhcmdldCcsIHRhcmdldClcbiAgICAgICAgICAgICAgLm91dHB1dC50b1Byb21pc2UoKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFzeW5jIHZhbGlkYXRlT3B0aW9uczxUIGV4dGVuZHMganNvbi5Kc29uT2JqZWN0ID0ganNvbi5Kc29uT2JqZWN0PihcbiAgICAgICAgICAgIG9wdGlvbnM6IGpzb24uSnNvbk9iamVjdCxcbiAgICAgICAgICAgIGJ1aWxkZXJOYW1lOiBzdHJpbmcsXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gc2NoZWR1bGVyXG4gICAgICAgICAgICAgIC5zY2hlZHVsZTxbc3RyaW5nLCBqc29uLkpzb25PYmplY3RdLCBqc29uLkpzb25WYWx1ZSwgVD4oJy4udmFsaWRhdGVPcHRpb25zJywgW1xuICAgICAgICAgICAgICAgIGJ1aWxkZXJOYW1lLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIC5vdXRwdXQudG9Qcm9taXNlKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZXBvcnRSdW5uaW5nKCkge1xuICAgICAgICAgICAgc3dpdGNoIChjdXJyZW50U3RhdGUpIHtcbiAgICAgICAgICAgICAgY2FzZSBCdWlsZGVyUHJvZ3Jlc3NTdGF0ZS5XYWl0aW5nOlxuICAgICAgICAgICAgICBjYXNlIEJ1aWxkZXJQcm9ncmVzc1N0YXRlLlN0b3BwZWQ6XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MoeyBzdGF0ZTogQnVpbGRlclByb2dyZXNzU3RhdGUuUnVubmluZywgY3VycmVudDogMCwgdG90YWwgfSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZXBvcnRTdGF0dXMoc3RhdHVzOiBzdHJpbmcpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoY3VycmVudFN0YXRlKSB7XG4gICAgICAgICAgICAgIGNhc2UgQnVpbGRlclByb2dyZXNzU3RhdGUuUnVubmluZzpcbiAgICAgICAgICAgICAgICBwcm9ncmVzcyh7IHN0YXRlOiBjdXJyZW50U3RhdGUsIHN0YXR1cywgY3VycmVudCwgdG90YWwgfSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgQnVpbGRlclByb2dyZXNzU3RhdGUuV2FpdGluZzpcbiAgICAgICAgICAgICAgICBwcm9ncmVzcyh7IHN0YXRlOiBjdXJyZW50U3RhdGUsIHN0YXR1cyB9LCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlcG9ydFByb2dyZXNzKGN1cnJlbnQ6IG51bWJlciwgdG90YWw/OiBudW1iZXIsIHN0YXR1cz86IHN0cmluZykge1xuICAgICAgICAgICAgc3dpdGNoIChjdXJyZW50U3RhdGUpIHtcbiAgICAgICAgICAgICAgY2FzZSBCdWlsZGVyUHJvZ3Jlc3NTdGF0ZS5SdW5uaW5nOlxuICAgICAgICAgICAgICAgIHByb2dyZXNzKHsgc3RhdGU6IGN1cnJlbnRTdGF0ZSwgY3VycmVudCwgdG90YWwsIHN0YXR1cyB9LCBjb250ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGFkZFRlYXJkb3duKHRlYXJkb3duOiAoKSA9PiBQcm9taXNlPHZvaWQ+IHwgdm9pZCk6IHZvaWQge1xuICAgICAgICAgICAgdGVhcmRvd25Mb2dpY3MucHVzaCh0ZWFyZG93bik7XG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb250ZXh0LnJlcG9ydFJ1bm5pbmcoKTtcbiAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSBmbihpLm9wdGlvbnMgYXMgdW5rbm93biBhcyBPcHRULCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoaXNCdWlsZGVyT3V0cHV0KHJlc3VsdCkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IG9mKHJlc3VsdCk7XG4gICAgICAgICAgfSBlbHNlIGlmICghaXNPYnNlcnZhYmxlKHJlc3VsdCkgJiYgaXNBc3luY0l0ZXJhYmxlKHJlc3VsdCkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGZyb21Bc3luY0l0ZXJhYmxlKHJlc3VsdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGZyb20ocmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXN1bHQgPSB0aHJvd0Vycm9yKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWFuYWdlIHNvbWUgc3RhdGUgYXV0b21hdGljYWxseS5cbiAgICAgICAgcHJvZ3Jlc3MoeyBzdGF0ZTogQnVpbGRlclByb2dyZXNzU3RhdGUuUnVubmluZywgY3VycmVudDogMCwgdG90YWw6IDEgfSwgY29udGV4dCk7XG4gICAgICAgIHN1YnNjcmlwdGlvbnMucHVzaChcbiAgICAgICAgICByZXN1bHRcbiAgICAgICAgICAgIC5waXBlKFxuICAgICAgICAgICAgICBkZWZhdWx0SWZFbXB0eSh7IHN1Y2Nlc3M6IGZhbHNlIH0gYXMgdW5rbm93biksXG4gICAgICAgICAgICAgIHRhcCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MoeyBzdGF0ZTogQnVpbGRlclByb2dyZXNzU3RhdGUuUnVubmluZywgY3VycmVudDogdG90YWwgfSwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MoeyBzdGF0ZTogQnVpbGRlclByb2dyZXNzU3RhdGUuU3RvcHBlZCB9LCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIG1lcmdlTWFwKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEFsbG93IHRoZSBsb2cgcXVldWUgdG8gZmx1c2hcbiAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPihzZXRJbW1lZGlhdGUpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoXG4gICAgICAgICAgICAgIChtZXNzYWdlKSA9PiBvYnNlcnZlci5uZXh0KG1lc3NhZ2UgYXMgT3V0VCksXG4gICAgICAgICAgICAgIChlcnJvcikgPT4gb2JzZXJ2ZXIuZXJyb3IoZXJyb3IpLFxuICAgICAgICAgICAgICAoKSA9PiBvYnNlcnZlci5jb21wbGV0ZSgpLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5mb3JFYWNoKCh4KSA9PiB4LnVuc3Vic2NyaWJlKCkpO1xuICAgICAgICBpbnB1dFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBoYW5kbGVyLFxuICAgIFtCdWlsZGVyU3ltYm9sXTogdHJ1ZSxcbiAgICBbQnVpbGRlclZlcnNpb25TeW1ib2xdOiByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uLFxuICB9O1xufVxuXG5mdW5jdGlvbiBpc0FzeW5jSXRlcmFibGU8VD4ob2JqOiB1bmtub3duKTogb2JqIGlzIEFzeW5jSXRlcmFibGU8VD4ge1xuICByZXR1cm4gISFvYmogJiYgdHlwZW9mIChvYmogYXMgQXN5bmNJdGVyYWJsZTxUPilbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID09PSAnZnVuY3Rpb24nO1xufVxuIl19