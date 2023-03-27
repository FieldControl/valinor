"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleByTarget = exports.scheduleByName = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const api_1 = require("./api");
const jobs_1 = require("./jobs");
const progressSchema = require('./progress-schema.json');
let _uniqueId = 0;
async function scheduleByName(name, buildOptions, options) {
    const childLoggerName = options.target ? `{${(0, api_1.targetStringFromTarget)(options.target)}}` : name;
    const logger = options.logger.createChild(childLoggerName);
    const job = options.scheduler.schedule(name, {});
    let stateSubscription;
    const workspaceRoot = await options.workspaceRoot;
    const currentDirectory = await options.currentDirectory;
    const description = await job.description.toPromise();
    const info = description.info;
    const id = ++_uniqueId;
    const message = {
        id,
        currentDirectory,
        workspaceRoot,
        info: info,
        options: buildOptions,
        ...(options.target ? { target: options.target } : {}),
    };
    // Wait for the job to be ready.
    if (job.state !== jobs_1.JobState.Started) {
        stateSubscription = job.outboundBus.subscribe((event) => {
            if (event.kind === jobs_1.JobOutboundMessageKind.Start) {
                job.input.next(message);
            }
        }, () => { });
    }
    else {
        job.input.next(message);
    }
    const logChannelSub = job.getChannel('log').subscribe((entry) => {
        logger.next(entry);
    }, () => { });
    const s = job.outboundBus.subscribe({
        error() { },
        complete() {
            s.unsubscribe();
            logChannelSub.unsubscribe();
            if (stateSubscription) {
                stateSubscription.unsubscribe();
            }
        },
    });
    const output = job.output.pipe((0, operators_1.map)((output) => ({
        ...output,
        ...(options.target ? { target: options.target } : 0),
        info,
    })), (0, operators_1.shareReplay)());
    // Start the builder.
    output.pipe((0, operators_1.first)()).subscribe({
        error() { },
    });
    return {
        id,
        info,
        // This is a getter so that it always returns the next output, and not the same one.
        get result() {
            return output.pipe((0, operators_1.first)()).toPromise();
        },
        output,
        progress: job
            .getChannel('progress', progressSchema)
            .pipe((0, operators_1.shareReplay)(1)),
        stop() {
            job.stop();
            return job.outboundBus
                .pipe((0, operators_1.ignoreElements)(), (0, operators_1.catchError)(() => rxjs_1.EMPTY))
                .toPromise();
        },
    };
}
exports.scheduleByName = scheduleByName;
async function scheduleByTarget(target, overrides, options) {
    return scheduleByName(`{${(0, api_1.targetStringFromTarget)(target)}}`, overrides, {
        ...options,
        target,
        logger: options.logger,
    });
}
exports.scheduleByTarget = scheduleByTarget;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZWR1bGUtYnktbmFtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2FyY2hpdGVjdC9zcmMvc2NoZWR1bGUtYnktbmFtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFHSCwrQkFBMkM7QUFDM0MsOENBQXFGO0FBQ3JGLCtCQVFlO0FBQ2YsaUNBQXFFO0FBRXJFLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBRXpELElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztBQUVYLEtBQUssVUFBVSxjQUFjLENBQ2xDLElBQVksRUFDWixZQUE2QixFQUM3QixPQU1DO0lBRUQsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFBLDRCQUFzQixFQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDOUYsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDM0QsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQWtDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNsRixJQUFJLGlCQUErQixDQUFDO0lBRXBDLE1BQU0sYUFBYSxHQUFHLE1BQU0sT0FBTyxDQUFDLGFBQWEsQ0FBQztJQUNsRCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sT0FBTyxDQUFDLGdCQUFnQixDQUFDO0lBRXhELE1BQU0sV0FBVyxHQUFHLE1BQU0sR0FBRyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN0RCxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsSUFBbUIsQ0FBQztJQUM3QyxNQUFNLEVBQUUsR0FBRyxFQUFFLFNBQVMsQ0FBQztJQUV2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Q0FBQztBQXRHRCx3Q0FzR0M7QUFFTSxLQUFLLFVBQVUsZ0JBQWdCLENBQ3BDLE1BQWMsRUFDZCxTQUEwQixFQUMxQixPQUtDO0lBRUQsT0FBTyxjQUFjLENBQUMsSUFBSSxJQUFBLDRCQUFzQixFQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFO1FBQ3RFLEdBQUcsT0FBTztRQUNWLE1BQU07UUFDTixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07S0FDdkIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQWZELDRDQWVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IGpzb24sIGxvZ2dpbmcgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBFTVBUWSwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBjYXRjaEVycm9yLCBmaXJzdCwgaWdub3JlRWxlbWVudHMsIG1hcCwgc2hhcmVSZXBsYXkgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1xuICBCdWlsZGVySW5mbyxcbiAgQnVpbGRlcklucHV0LFxuICBCdWlsZGVyT3V0cHV0LFxuICBCdWlsZGVyUHJvZ3Jlc3NSZXBvcnQsXG4gIEJ1aWxkZXJSdW4sXG4gIFRhcmdldCxcbiAgdGFyZ2V0U3RyaW5nRnJvbVRhcmdldCxcbn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHsgSm9iT3V0Ym91bmRNZXNzYWdlS2luZCwgSm9iU3RhdGUsIFNjaGVkdWxlciB9IGZyb20gJy4vam9icyc7XG5cbmNvbnN0IHByb2dyZXNzU2NoZW1hID0gcmVxdWlyZSgnLi9wcm9ncmVzcy1zY2hlbWEuanNvbicpO1xuXG5sZXQgX3VuaXF1ZUlkID0gMDtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNjaGVkdWxlQnlOYW1lKFxuICBuYW1lOiBzdHJpbmcsXG4gIGJ1aWxkT3B0aW9uczoganNvbi5Kc29uT2JqZWN0LFxuICBvcHRpb25zOiB7XG4gICAgdGFyZ2V0PzogVGFyZ2V0O1xuICAgIHNjaGVkdWxlcjogU2NoZWR1bGVyO1xuICAgIGxvZ2dlcjogbG9nZ2luZy5Mb2dnZXJBcGk7XG4gICAgd29ya3NwYWNlUm9vdDogc3RyaW5nIHwgUHJvbWlzZTxzdHJpbmc+O1xuICAgIGN1cnJlbnREaXJlY3Rvcnk6IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPjtcbiAgfSxcbik6IFByb21pc2U8QnVpbGRlclJ1bj4ge1xuICBjb25zdCBjaGlsZExvZ2dlck5hbWUgPSBvcHRpb25zLnRhcmdldCA/IGB7JHt0YXJnZXRTdHJpbmdGcm9tVGFyZ2V0KG9wdGlvbnMudGFyZ2V0KX19YCA6IG5hbWU7XG4gIGNvbnN0IGxvZ2dlciA9IG9wdGlvbnMubG9nZ2VyLmNyZWF0ZUNoaWxkKGNoaWxkTG9nZ2VyTmFtZSk7XG4gIGNvbnN0IGpvYiA9IG9wdGlvbnMuc2NoZWR1bGVyLnNjaGVkdWxlPHt9LCBCdWlsZGVySW5wdXQsIEJ1aWxkZXJPdXRwdXQ+KG5hbWUsIHt9KTtcbiAgbGV0IHN0YXRlU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG5cbiAgY29uc3Qgd29ya3NwYWNlUm9vdCA9IGF3YWl0IG9wdGlvbnMud29ya3NwYWNlUm9vdDtcbiAgY29uc3QgY3VycmVudERpcmVjdG9yeSA9IGF3YWl0IG9wdGlvbnMuY3VycmVudERpcmVjdG9yeTtcblxuICBjb25zdCBkZXNjcmlwdGlvbiA9IGF3YWl0IGpvYi5kZXNjcmlwdGlvbi50b1Byb21pc2UoKTtcbiAgY29uc3QgaW5mbyA9IGRlc2NyaXB0aW9uLmluZm8gYXMgQnVpbGRlckluZm87XG4gIGNvbnN0IGlkID0gKytfdW5pcXVlSWQ7XG5cbiAgY29uc3QgbWVzc2FnZSA9IHtcbiAgICBpZCxcbiAgICBjdXJyZW50RGlyZWN0b3J5LFxuICAgIHdvcmtzcGFjZVJvb3QsXG4gICAgaW5mbzogaW5mbyxcbiAgICBvcHRpb25zOiBidWlsZE9wdGlvbnMsXG4gICAgLi4uKG9wdGlvbnMudGFyZ2V0ID8geyB0YXJnZXQ6IG9wdGlvbnMudGFyZ2V0IH0gOiB7fSksXG4gIH07XG5cbiAgLy8gV2FpdCBmb3IgdGhlIGpvYiB0byBiZSByZWFkeS5cbiAgaWYgKGpvYi5zdGF0ZSAhPT0gSm9iU3RhdGUuU3RhcnRlZCkge1xuICAgIHN0YXRlU3Vic2NyaXB0aW9uID0gam9iLm91dGJvdW5kQnVzLnN1YnNjcmliZShcbiAgICAgIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQua2luZCA9PT0gSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5TdGFydCkge1xuICAgICAgICAgIGpvYi5pbnB1dC5uZXh0KG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgKCkgPT4ge30sXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBqb2IuaW5wdXQubmV4dChtZXNzYWdlKTtcbiAgfVxuXG4gIGNvbnN0IGxvZ0NoYW5uZWxTdWIgPSBqb2IuZ2V0Q2hhbm5lbDxsb2dnaW5nLkxvZ0VudHJ5PignbG9nJykuc3Vic2NyaWJlKFxuICAgIChlbnRyeSkgPT4ge1xuICAgICAgbG9nZ2VyLm5leHQoZW50cnkpO1xuICAgIH0sXG4gICAgKCkgPT4ge30sXG4gICk7XG5cbiAgY29uc3QgcyA9IGpvYi5vdXRib3VuZEJ1cy5zdWJzY3JpYmUoe1xuICAgIGVycm9yKCkge30sXG4gICAgY29tcGxldGUoKSB7XG4gICAgICBzLnVuc3Vic2NyaWJlKCk7XG4gICAgICBsb2dDaGFubmVsU3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICBpZiAoc3RhdGVTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgc3RhdGVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIH1cbiAgICB9LFxuICB9KTtcbiAgY29uc3Qgb3V0cHV0ID0gam9iLm91dHB1dC5waXBlKFxuICAgIG1hcChcbiAgICAgIChvdXRwdXQpID0+XG4gICAgICAgICh7XG4gICAgICAgICAgLi4ub3V0cHV0LFxuICAgICAgICAgIC4uLihvcHRpb25zLnRhcmdldCA/IHsgdGFyZ2V0OiBvcHRpb25zLnRhcmdldCB9IDogMCksXG4gICAgICAgICAgaW5mbyxcbiAgICAgICAgfSBhcyB1bmtub3duIGFzIEJ1aWxkZXJPdXRwdXQpLFxuICAgICksXG4gICAgc2hhcmVSZXBsYXkoKSxcbiAgKTtcblxuICAvLyBTdGFydCB0aGUgYnVpbGRlci5cbiAgb3V0cHV0LnBpcGUoZmlyc3QoKSkuc3Vic2NyaWJlKHtcbiAgICBlcnJvcigpIHt9LFxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGlkLFxuICAgIGluZm8sXG4gICAgLy8gVGhpcyBpcyBhIGdldHRlciBzbyB0aGF0IGl0IGFsd2F5cyByZXR1cm5zIHRoZSBuZXh0IG91dHB1dCwgYW5kIG5vdCB0aGUgc2FtZSBvbmUuXG4gICAgZ2V0IHJlc3VsdCgpIHtcbiAgICAgIHJldHVybiBvdXRwdXQucGlwZShmaXJzdCgpKS50b1Byb21pc2UoKTtcbiAgICB9LFxuICAgIG91dHB1dCxcbiAgICBwcm9ncmVzczogam9iXG4gICAgICAuZ2V0Q2hhbm5lbDxCdWlsZGVyUHJvZ3Jlc3NSZXBvcnQ+KCdwcm9ncmVzcycsIHByb2dyZXNzU2NoZW1hKVxuICAgICAgLnBpcGUoc2hhcmVSZXBsYXkoMSkpLFxuICAgIHN0b3AoKSB7XG4gICAgICBqb2Iuc3RvcCgpO1xuXG4gICAgICByZXR1cm4gam9iLm91dGJvdW5kQnVzXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgIGlnbm9yZUVsZW1lbnRzKCksXG4gICAgICAgICAgY2F0Y2hFcnJvcigoKSA9PiBFTVBUWSksXG4gICAgICAgIClcbiAgICAgICAgLnRvUHJvbWlzZSgpO1xuICAgIH0sXG4gIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzY2hlZHVsZUJ5VGFyZ2V0KFxuICB0YXJnZXQ6IFRhcmdldCxcbiAgb3ZlcnJpZGVzOiBqc29uLkpzb25PYmplY3QsXG4gIG9wdGlvbnM6IHtcbiAgICBzY2hlZHVsZXI6IFNjaGVkdWxlcjtcbiAgICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpO1xuICAgIHdvcmtzcGFjZVJvb3Q6IHN0cmluZyB8IFByb21pc2U8c3RyaW5nPjtcbiAgICBjdXJyZW50RGlyZWN0b3J5OiBzdHJpbmcgfCBQcm9taXNlPHN0cmluZz47XG4gIH0sXG4pOiBQcm9taXNlPEJ1aWxkZXJSdW4+IHtcbiAgcmV0dXJuIHNjaGVkdWxlQnlOYW1lKGB7JHt0YXJnZXRTdHJpbmdGcm9tVGFyZ2V0KHRhcmdldCl9fWAsIG92ZXJyaWRlcywge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgdGFyZ2V0LFxuICAgIGxvZ2dlcjogb3B0aW9ucy5sb2dnZXIsXG4gIH0pO1xufVxuIl19