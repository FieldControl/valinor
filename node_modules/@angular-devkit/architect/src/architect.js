"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Architect = void 0;
const core_1 = require("@angular-devkit/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const api_1 = require("./api");
const jobs_1 = require("./jobs");
const schedule_by_name_1 = require("./schedule-by-name");
const inputSchema = require('./input-schema.json');
const outputSchema = require('./output-schema.json');
function _createJobHandlerFromBuilderInfo(info, target, host, registry, baseOptions) {
    const jobDescription = {
        name: target ? `{${(0, api_1.targetStringFromTarget)(target)}}` : info.builderName,
        argument: { type: 'object' },
        input: inputSchema,
        output: outputSchema,
        info,
    };
    function handler(argument, context) {
        // Add input validation to the inbound bus.
        const inboundBusWithInputValidation = context.inboundBus.pipe((0, operators_1.concatMap)((message) => {
            if (message.kind === jobs_1.JobInboundMessageKind.Input) {
                const v = message.value;
                const options = {
                    ...baseOptions,
                    ...v.options,
                };
                // Validate v against the options schema.
                return registry.compile(info.optionSchema).pipe((0, operators_1.concatMap)((validation) => validation(options)), (0, operators_1.map)((validationResult) => {
                    const { data, success, errors } = validationResult;
                    if (success) {
                        return { ...v, options: data };
                    }
                    throw new core_1.json.schema.SchemaValidationException(errors);
                }), (0, operators_1.map)((value) => ({ ...message, value })));
            }
            else {
                return (0, rxjs_1.of)(message);
            }
        }), 
        // Using a share replay because the job might be synchronously sending input, but
        // asynchronously listening to it.
        (0, operators_1.shareReplay)(1));
        // Make an inboundBus that completes instead of erroring out.
        // We'll merge the errors into the output instead.
        const inboundBus = (0, rxjs_1.onErrorResumeNext)(inboundBusWithInputValidation);
        const output = (0, rxjs_1.from)(host.loadBuilder(info)).pipe((0, operators_1.concatMap)((builder) => {
            if (builder === null) {
                throw new Error(`Cannot load builder for builderInfo ${JSON.stringify(info, null, 2)}`);
            }
            return builder.handler(argument, { ...context, inboundBus }).pipe((0, operators_1.map)((output) => {
                if (output.kind === jobs_1.JobOutboundMessageKind.Output) {
                    // Add target to it.
                    return {
                        ...output,
                        value: {
                            ...output.value,
                            ...(target ? { target } : 0),
                        },
                    };
                }
                else {
                    return output;
                }
            }));
        }), 
        // Share subscriptions to the output, otherwise the the handler will be re-run.
        (0, operators_1.shareReplay)());
        // Separate the errors from the inbound bus into their own observable that completes when the
        // builder output does.
        const inboundBusErrors = inboundBusWithInputValidation.pipe((0, operators_1.ignoreElements)(), (0, operators_1.takeUntil)((0, rxjs_1.onErrorResumeNext)(output.pipe((0, operators_1.last)()))));
        // Return the builder output plus any input errors.
        return (0, rxjs_1.merge)(inboundBusErrors, output);
    }
    return (0, rxjs_1.of)(Object.assign(handler, { jobDescription }));
}
/**
 * A JobRegistry that resolves builder targets from the host.
 */
class ArchitectBuilderJobRegistry {
    constructor(_host, _registry, _jobCache, _infoCache) {
        this._host = _host;
        this._registry = _registry;
        this._jobCache = _jobCache;
        this._infoCache = _infoCache;
    }
    _resolveBuilder(name) {
        const cache = this._infoCache;
        if (cache) {
            const maybeCache = cache.get(name);
            if (maybeCache !== undefined) {
                return maybeCache;
            }
            const info = (0, rxjs_1.from)(this._host.resolveBuilder(name)).pipe((0, operators_1.shareReplay)(1));
            cache.set(name, info);
            return info;
        }
        return (0, rxjs_1.from)(this._host.resolveBuilder(name));
    }
    _createBuilder(info, target, options) {
        const cache = this._jobCache;
        if (target) {
            const maybeHit = cache && cache.get((0, api_1.targetStringFromTarget)(target));
            if (maybeHit) {
                return maybeHit;
            }
        }
        else {
            const maybeHit = cache && cache.get(info.builderName);
            if (maybeHit) {
                return maybeHit;
            }
        }
        const result = _createJobHandlerFromBuilderInfo(info, target, this._host, this._registry, options || {});
        if (cache) {
            if (target) {
                cache.set((0, api_1.targetStringFromTarget)(target), result.pipe((0, operators_1.shareReplay)(1)));
            }
            else {
                cache.set(info.builderName, result.pipe((0, operators_1.shareReplay)(1)));
            }
        }
        return result;
    }
    get(name) {
        const m = name.match(/^([^:]+):([^:]+)$/i);
        if (!m) {
            return (0, rxjs_1.of)(null);
        }
        return (0, rxjs_1.from)(this._resolveBuilder(name)).pipe((0, operators_1.concatMap)((builderInfo) => (builderInfo ? this._createBuilder(builderInfo) : (0, rxjs_1.of)(null))), (0, operators_1.first)(null, null));
    }
}
/**
 * A JobRegistry that resolves targets from the host.
 */
class ArchitectTargetJobRegistry extends ArchitectBuilderJobRegistry {
    get(name) {
        const m = name.match(/^{([^:]+):([^:]+)(?::([^:]*))?}$/i);
        if (!m) {
            return (0, rxjs_1.of)(null);
        }
        const target = {
            project: m[1],
            target: m[2],
            configuration: m[3],
        };
        return (0, rxjs_1.from)(Promise.all([
            this._host.getBuilderNameForTarget(target),
            this._host.getOptionsForTarget(target),
        ])).pipe((0, operators_1.concatMap)(([builderStr, options]) => {
            if (builderStr === null || options === null) {
                return (0, rxjs_1.of)(null);
            }
            return this._resolveBuilder(builderStr).pipe((0, operators_1.concatMap)((builderInfo) => {
                if (builderInfo === null) {
                    return (0, rxjs_1.of)(null);
                }
                return this._createBuilder(builderInfo, target, options);
            }));
        }), (0, operators_1.first)(null, null));
    }
}
function _getTargetOptionsFactory(host) {
    return (0, jobs_1.createJobHandler)((target) => {
        return host.getOptionsForTarget(target).then((options) => {
            if (options === null) {
                throw new Error(`Invalid target: ${JSON.stringify(target)}.`);
            }
            return options;
        });
    }, {
        name: '..getTargetOptions',
        output: { type: 'object' },
        argument: inputSchema.properties.target,
    });
}
function _getProjectMetadataFactory(host) {
    return (0, jobs_1.createJobHandler)((target) => {
        return host.getProjectMetadata(target).then((options) => {
            if (options === null) {
                throw new Error(`Invalid target: ${JSON.stringify(target)}.`);
            }
            return options;
        });
    }, {
        name: '..getProjectMetadata',
        output: { type: 'object' },
        argument: {
            oneOf: [{ type: 'string' }, inputSchema.properties.target],
        },
    });
}
function _getBuilderNameForTargetFactory(host) {
    return (0, jobs_1.createJobHandler)(async (target) => {
        const builderName = await host.getBuilderNameForTarget(target);
        if (!builderName) {
            throw new Error(`No builder were found for target ${(0, api_1.targetStringFromTarget)(target)}.`);
        }
        return builderName;
    }, {
        name: '..getBuilderNameForTarget',
        output: { type: 'string' },
        argument: inputSchema.properties.target,
    });
}
function _validateOptionsFactory(host, registry) {
    return (0, jobs_1.createJobHandler)(async ([builderName, options]) => {
        // Get option schema from the host.
        const builderInfo = await host.resolveBuilder(builderName);
        if (!builderInfo) {
            throw new Error(`No builder info were found for builder ${JSON.stringify(builderName)}.`);
        }
        return registry
            .compile(builderInfo.optionSchema)
            .pipe((0, operators_1.concatMap)((validation) => validation(options)), (0, operators_1.switchMap)(({ data, success, errors }) => {
            if (success) {
                return (0, rxjs_1.of)(data);
            }
            throw new core_1.json.schema.SchemaValidationException(errors);
        }))
            .toPromise();
    }, {
        name: '..validateOptions',
        output: { type: 'object' },
        argument: {
            type: 'array',
            items: [{ type: 'string' }, { type: 'object' }],
        },
    });
}
class Architect {
    constructor(_host, registry = new core_1.json.schema.CoreSchemaRegistry(), additionalJobRegistry) {
        this._host = _host;
        this._jobCache = new Map();
        this._infoCache = new Map();
        const privateArchitectJobRegistry = new jobs_1.SimpleJobRegistry();
        // Create private jobs.
        privateArchitectJobRegistry.register(_getTargetOptionsFactory(_host));
        privateArchitectJobRegistry.register(_getBuilderNameForTargetFactory(_host));
        privateArchitectJobRegistry.register(_validateOptionsFactory(_host, registry));
        privateArchitectJobRegistry.register(_getProjectMetadataFactory(_host));
        const jobRegistry = new jobs_1.FallbackRegistry([
            new ArchitectTargetJobRegistry(_host, registry, this._jobCache, this._infoCache),
            new ArchitectBuilderJobRegistry(_host, registry, this._jobCache, this._infoCache),
            privateArchitectJobRegistry,
            ...(additionalJobRegistry ? [additionalJobRegistry] : []),
        ]);
        this._scheduler = new jobs_1.SimpleScheduler(jobRegistry, registry);
    }
    has(name) {
        return this._scheduler.has(name);
    }
    scheduleBuilder(name, options, scheduleOptions = {}) {
        // The below will match 'project:target:configuration'
        if (!/^[^:]+:[^:]+(:[^:]+)?$/.test(name)) {
            throw new Error('Invalid builder name: ' + JSON.stringify(name));
        }
        return (0, schedule_by_name_1.scheduleByName)(name, options, {
            scheduler: this._scheduler,
            logger: scheduleOptions.logger || new core_1.logging.NullLogger(),
            currentDirectory: this._host.getCurrentDirectory(),
            workspaceRoot: this._host.getWorkspaceRoot(),
        });
    }
    scheduleTarget(target, overrides = {}, scheduleOptions = {}) {
        return (0, schedule_by_name_1.scheduleByTarget)(target, overrides, {
            scheduler: this._scheduler,
            logger: scheduleOptions.logger || new core_1.logging.NullLogger(),
            currentDirectory: this._host.getCurrentDirectory(),
            workspaceRoot: this._host.getWorkspaceRoot(),
        });
    }
}
exports.Architect = Architect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJjaGl0ZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYXJjaGl0ZWN0L3NyYy9hcmNoaXRlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQXFEO0FBQ3JELCtCQUFzRTtBQUN0RSw4Q0FTd0I7QUFDeEIsK0JBUWU7QUFFZixpQ0FhZ0I7QUFDaEIseURBQXNFO0FBRXRFLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBRXJELFNBQVMsZ0NBQWdDLENBQ3ZDLElBQWlCLEVBQ2pCLE1BQTBCLEVBQzFCLElBQW1CLEVBQ25CLFFBQW9DLEVBQ3BDLFdBQTRCO0lBRTVCLE1BQU0sY0FBYyxHQUF1QjtRQUN6QyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUEsNEJBQXNCLEVBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVc7UUFDdkUsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtRQUM1QixLQUFLLEVBQUUsV0FBVztRQUNsQixNQUFNLEVBQUUsWUFBWTtRQUNwQixJQUFJO0tBQ0wsQ0FBQztJQUVGLFNBQVMsT0FBTyxDQUFDLFFBQXlCLEVBQUUsT0FBMEI7UUFDcEUsMkNBQTJDO1FBQzNDLE1BQU0sNkJBQTZCLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQzNELElBQUEscUJBQVMsRUFBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3BCLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyw0QkFBcUIsQ0FBQyxLQUFLLEVBQUU7Z0JBQ2hELE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFxQixDQUFDO2dCQUN4QyxN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Q0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxlQUFlLENBQ2IsSUFBWSxFQUNaLE9BQXdCLEVBQ3hCLGtCQUFtQyxFQUFFO1FBRXJDLHNEQUFzRDtRQUN0RCxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ2xFO1FBRUQsT0FBTyxJQUFBLGlDQUFjLEVBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUNuQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDMUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxNQUFNLElBQUksSUFBSSxjQUFPLENBQUMsVUFBVSxFQUFFO1lBQzFELGdCQUFnQixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUU7WUFDbEQsYUFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7U0FDN0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNELGNBQWMsQ0FDWixNQUFjLEVBQ2QsWUFBNkIsRUFBRSxFQUMvQixrQkFBbUMsRUFBRTtRQUVyQyxPQUFPLElBQUEsbUNBQWdCLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRTtZQUN6QyxTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDMUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxNQUFNLElBQUksSUFBSSxjQUFPLENBQUMsVUFBVSxFQUFFO1lBQzFELGdCQUFnQixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUU7WUFDbEQsYUFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7U0FDN0MsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBNURELDhCQTREQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBqc29uLCBsb2dnaW5nIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbSwgbWVyZ2UsIG9mLCBvbkVycm9yUmVzdW1lTmV4dCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgY29uY2F0TWFwLFxuICBmaXJzdCxcbiAgaWdub3JlRWxlbWVudHMsXG4gIGxhc3QsXG4gIG1hcCxcbiAgc2hhcmVSZXBsYXksXG4gIHN3aXRjaE1hcCxcbiAgdGFrZVVudGlsLFxufSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1xuICBCdWlsZGVySW5mbyxcbiAgQnVpbGRlcklucHV0LFxuICBCdWlsZGVyT3V0cHV0LFxuICBCdWlsZGVyUmVnaXN0cnksXG4gIEJ1aWxkZXJSdW4sXG4gIFRhcmdldCxcbiAgdGFyZ2V0U3RyaW5nRnJvbVRhcmdldCxcbn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHsgQXJjaGl0ZWN0SG9zdCwgQnVpbGRlckRlc2NyaXB0aW9uLCBCdWlsZGVySm9iSGFuZGxlciB9IGZyb20gJy4vaW50ZXJuYWwnO1xuaW1wb3J0IHtcbiAgRmFsbGJhY2tSZWdpc3RyeSxcbiAgSm9iSGFuZGxlcixcbiAgSm9iSGFuZGxlckNvbnRleHQsXG4gIEpvYkluYm91bmRNZXNzYWdlLFxuICBKb2JJbmJvdW5kTWVzc2FnZUtpbmQsXG4gIEpvYk5hbWUsXG4gIEpvYk91dGJvdW5kTWVzc2FnZUtpbmQsXG4gIFJlZ2lzdHJ5LFxuICBTY2hlZHVsZXIsXG4gIFNpbXBsZUpvYlJlZ2lzdHJ5LFxuICBTaW1wbGVTY2hlZHVsZXIsXG4gIGNyZWF0ZUpvYkhhbmRsZXIsXG59IGZyb20gJy4vam9icyc7XG5pbXBvcnQgeyBzY2hlZHVsZUJ5TmFtZSwgc2NoZWR1bGVCeVRhcmdldCB9IGZyb20gJy4vc2NoZWR1bGUtYnktbmFtZSc7XG5cbmNvbnN0IGlucHV0U2NoZW1hID0gcmVxdWlyZSgnLi9pbnB1dC1zY2hlbWEuanNvbicpO1xuY29uc3Qgb3V0cHV0U2NoZW1hID0gcmVxdWlyZSgnLi9vdXRwdXQtc2NoZW1hLmpzb24nKTtcblxuZnVuY3Rpb24gX2NyZWF0ZUpvYkhhbmRsZXJGcm9tQnVpbGRlckluZm8oXG4gIGluZm86IEJ1aWxkZXJJbmZvLFxuICB0YXJnZXQ6IFRhcmdldCB8IHVuZGVmaW5lZCxcbiAgaG9zdDogQXJjaGl0ZWN0SG9zdCxcbiAgcmVnaXN0cnk6IGpzb24uc2NoZW1hLlNjaGVtYVJlZ2lzdHJ5LFxuICBiYXNlT3B0aW9uczoganNvbi5Kc29uT2JqZWN0LFxuKTogT2JzZXJ2YWJsZTxCdWlsZGVySm9iSGFuZGxlcj4ge1xuICBjb25zdCBqb2JEZXNjcmlwdGlvbjogQnVpbGRlckRlc2NyaXB0aW9uID0ge1xuICAgIG5hbWU6IHRhcmdldCA/IGB7JHt0YXJnZXRTdHJpbmdGcm9tVGFyZ2V0KHRhcmdldCl9fWAgOiBpbmZvLmJ1aWxkZXJOYW1lLFxuICAgIGFyZ3VtZW50OiB7IHR5cGU6ICdvYmplY3QnIH0sXG4gICAgaW5wdXQ6IGlucHV0U2NoZW1hLFxuICAgIG91dHB1dDogb3V0cHV0U2NoZW1hLFxuICAgIGluZm8sXG4gIH07XG5cbiAgZnVuY3Rpb24gaGFuZGxlcihhcmd1bWVudDoganNvbi5Kc29uT2JqZWN0LCBjb250ZXh0OiBKb2JIYW5kbGVyQ29udGV4dCkge1xuICAgIC8vIEFkZCBpbnB1dCB2YWxpZGF0aW9uIHRvIHRoZSBpbmJvdW5kIGJ1cy5cbiAgICBjb25zdCBpbmJvdW5kQnVzV2l0aElucHV0VmFsaWRhdGlvbiA9IGNvbnRleHQuaW5ib3VuZEJ1cy5waXBlKFxuICAgICAgY29uY2F0TWFwKChtZXNzYWdlKSA9PiB7XG4gICAgICAgIGlmIChtZXNzYWdlLmtpbmQgPT09IEpvYkluYm91bmRNZXNzYWdlS2luZC5JbnB1dCkge1xuICAgICAgICAgIGNvbnN0IHYgPSBtZXNzYWdlLnZhbHVlIGFzIEJ1aWxkZXJJbnB1dDtcbiAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgLi4uYmFzZU9wdGlvbnMsXG4gICAgICAgICAgICAuLi52Lm9wdGlvbnMsXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vIFZhbGlkYXRlIHYgYWdhaW5zdCB0aGUgb3B0aW9ucyBzY2hlbWEuXG4gICAgICAgICAgcmV0dXJuIHJlZ2lzdHJ5LmNvbXBpbGUoaW5mby5vcHRpb25TY2hlbWEpLnBpcGUoXG4gICAgICAgICAgICBjb25jYXRNYXAoKHZhbGlkYXRpb24pID0+IHZhbGlkYXRpb24ob3B0aW9ucykpLFxuICAgICAgICAgICAgbWFwKCh2YWxpZGF0aW9uUmVzdWx0OiBqc29uLnNjaGVtYS5TY2hlbWFWYWxpZGF0b3JSZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgeyBkYXRhLCBzdWNjZXNzLCBlcnJvcnMgfSA9IHZhbGlkYXRpb25SZXN1bHQ7XG4gICAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgLi4udiwgb3B0aW9uczogZGF0YSB9IGFzIEJ1aWxkZXJJbnB1dDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRocm93IG5ldyBqc29uLnNjaGVtYS5TY2hlbWFWYWxpZGF0aW9uRXhjZXB0aW9uKGVycm9ycyk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG1hcCgodmFsdWUpID0+ICh7IC4uLm1lc3NhZ2UsIHZhbHVlIH0pKSxcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBvZihtZXNzYWdlIGFzIEpvYkluYm91bmRNZXNzYWdlPEJ1aWxkZXJJbnB1dD4pO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIC8vIFVzaW5nIGEgc2hhcmUgcmVwbGF5IGJlY2F1c2UgdGhlIGpvYiBtaWdodCBiZSBzeW5jaHJvbm91c2x5IHNlbmRpbmcgaW5wdXQsIGJ1dFxuICAgICAgLy8gYXN5bmNocm9ub3VzbHkgbGlzdGVuaW5nIHRvIGl0LlxuICAgICAgc2hhcmVSZXBsYXkoMSksXG4gICAgKTtcblxuICAgIC8vIE1ha2UgYW4gaW5ib3VuZEJ1cyB0aGF0IGNvbXBsZXRlcyBpbnN0ZWFkIG9mIGVycm9yaW5nIG91dC5cbiAgICAvLyBXZSdsbCBtZXJnZSB0aGUgZXJyb3JzIGludG8gdGhlIG91dHB1dCBpbnN0ZWFkLlxuICAgIGNvbnN0IGluYm91bmRCdXMgPSBvbkVycm9yUmVzdW1lTmV4dChpbmJvdW5kQnVzV2l0aElucHV0VmFsaWRhdGlvbik7XG5cbiAgICBjb25zdCBvdXRwdXQgPSBmcm9tKGhvc3QubG9hZEJ1aWxkZXIoaW5mbykpLnBpcGUoXG4gICAgICBjb25jYXRNYXAoKGJ1aWxkZXIpID0+IHtcbiAgICAgICAgaWYgKGJ1aWxkZXIgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBsb2FkIGJ1aWxkZXIgZm9yIGJ1aWxkZXJJbmZvICR7SlNPTi5zdHJpbmdpZnkoaW5mbywgbnVsbCwgMil9YCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYnVpbGRlci5oYW5kbGVyKGFyZ3VtZW50LCB7IC4uLmNvbnRleHQsIGluYm91bmRCdXMgfSkucGlwZShcbiAgICAgICAgICBtYXAoKG91dHB1dCkgPT4ge1xuICAgICAgICAgICAgaWYgKG91dHB1dC5raW5kID09PSBKb2JPdXRib3VuZE1lc3NhZ2VLaW5kLk91dHB1dCkge1xuICAgICAgICAgICAgICAvLyBBZGQgdGFyZ2V0IHRvIGl0LlxuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIC4uLm91dHB1dCxcbiAgICAgICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICAgICAgLi4ub3V0cHV0LnZhbHVlLFxuICAgICAgICAgICAgICAgICAgLi4uKHRhcmdldCA/IHsgdGFyZ2V0IH0gOiAwKSxcbiAgICAgICAgICAgICAgICB9IGFzIHVua25vd24gYXMganNvbi5Kc29uT2JqZWN0LFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH0pLFxuICAgICAgLy8gU2hhcmUgc3Vic2NyaXB0aW9ucyB0byB0aGUgb3V0cHV0LCBvdGhlcndpc2UgdGhlIHRoZSBoYW5kbGVyIHdpbGwgYmUgcmUtcnVuLlxuICAgICAgc2hhcmVSZXBsYXkoKSxcbiAgICApO1xuXG4gICAgLy8gU2VwYXJhdGUgdGhlIGVycm9ycyBmcm9tIHRoZSBpbmJvdW5kIGJ1cyBpbnRvIHRoZWlyIG93biBvYnNlcnZhYmxlIHRoYXQgY29tcGxldGVzIHdoZW4gdGhlXG4gICAgLy8gYnVpbGRlciBvdXRwdXQgZG9lcy5cbiAgICBjb25zdCBpbmJvdW5kQnVzRXJyb3JzID0gaW5ib3VuZEJ1c1dpdGhJbnB1dFZhbGlkYXRpb24ucGlwZShcbiAgICAgIGlnbm9yZUVsZW1lbnRzKCksXG4gICAgICB0YWtlVW50aWwob25FcnJvclJlc3VtZU5leHQob3V0cHV0LnBpcGUobGFzdCgpKSkpLFxuICAgICk7XG5cbiAgICAvLyBSZXR1cm4gdGhlIGJ1aWxkZXIgb3V0cHV0IHBsdXMgYW55IGlucHV0IGVycm9ycy5cbiAgICByZXR1cm4gbWVyZ2UoaW5ib3VuZEJ1c0Vycm9ycywgb3V0cHV0KTtcbiAgfVxuXG4gIHJldHVybiBvZihPYmplY3QuYXNzaWduKGhhbmRsZXIsIHsgam9iRGVzY3JpcHRpb24gfSkgYXMgQnVpbGRlckpvYkhhbmRsZXIpO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNjaGVkdWxlT3B0aW9ucyB7XG4gIGxvZ2dlcj86IGxvZ2dpbmcuTG9nZ2VyO1xufVxuXG4vKipcbiAqIEEgSm9iUmVnaXN0cnkgdGhhdCByZXNvbHZlcyBidWlsZGVyIHRhcmdldHMgZnJvbSB0aGUgaG9zdC5cbiAqL1xuY2xhc3MgQXJjaGl0ZWN0QnVpbGRlckpvYlJlZ2lzdHJ5IGltcGxlbWVudHMgQnVpbGRlclJlZ2lzdHJ5IHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIF9ob3N0OiBBcmNoaXRlY3RIb3N0LFxuICAgIHByb3RlY3RlZCBfcmVnaXN0cnk6IGpzb24uc2NoZW1hLlNjaGVtYVJlZ2lzdHJ5LFxuICAgIHByb3RlY3RlZCBfam9iQ2FjaGU/OiBNYXA8c3RyaW5nLCBPYnNlcnZhYmxlPEJ1aWxkZXJKb2JIYW5kbGVyIHwgbnVsbD4+LFxuICAgIHByb3RlY3RlZCBfaW5mb0NhY2hlPzogTWFwPHN0cmluZywgT2JzZXJ2YWJsZTxCdWlsZGVySW5mbyB8IG51bGw+PixcbiAgKSB7fVxuXG4gIHByb3RlY3RlZCBfcmVzb2x2ZUJ1aWxkZXIobmFtZTogc3RyaW5nKTogT2JzZXJ2YWJsZTxCdWlsZGVySW5mbyB8IG51bGw+IHtcbiAgICBjb25zdCBjYWNoZSA9IHRoaXMuX2luZm9DYWNoZTtcbiAgICBpZiAoY2FjaGUpIHtcbiAgICAgIGNvbnN0IG1heWJlQ2FjaGUgPSBjYWNoZS5nZXQobmFtZSk7XG4gICAgICBpZiAobWF5YmVDYWNoZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBtYXliZUNhY2hlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpbmZvID0gZnJvbSh0aGlzLl9ob3N0LnJlc29sdmVCdWlsZGVyKG5hbWUpKS5waXBlKHNoYXJlUmVwbGF5KDEpKTtcbiAgICAgIGNhY2hlLnNldChuYW1lLCBpbmZvKTtcblxuICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuXG4gICAgcmV0dXJuIGZyb20odGhpcy5faG9zdC5yZXNvbHZlQnVpbGRlcihuYW1lKSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2NyZWF0ZUJ1aWxkZXIoXG4gICAgaW5mbzogQnVpbGRlckluZm8sXG4gICAgdGFyZ2V0PzogVGFyZ2V0LFxuICAgIG9wdGlvbnM/OiBqc29uLkpzb25PYmplY3QsXG4gICk6IE9ic2VydmFibGU8QnVpbGRlckpvYkhhbmRsZXIgfCBudWxsPiB7XG4gICAgY29uc3QgY2FjaGUgPSB0aGlzLl9qb2JDYWNoZTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBjb25zdCBtYXliZUhpdCA9IGNhY2hlICYmIGNhY2hlLmdldCh0YXJnZXRTdHJpbmdGcm9tVGFyZ2V0KHRhcmdldCkpO1xuICAgICAgaWYgKG1heWJlSGl0KSB7XG4gICAgICAgIHJldHVybiBtYXliZUhpdDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbWF5YmVIaXQgPSBjYWNoZSAmJiBjYWNoZS5nZXQoaW5mby5idWlsZGVyTmFtZSk7XG4gICAgICBpZiAobWF5YmVIaXQpIHtcbiAgICAgICAgcmV0dXJuIG1heWJlSGl0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IF9jcmVhdGVKb2JIYW5kbGVyRnJvbUJ1aWxkZXJJbmZvKFxuICAgICAgaW5mbyxcbiAgICAgIHRhcmdldCxcbiAgICAgIHRoaXMuX2hvc3QsXG4gICAgICB0aGlzLl9yZWdpc3RyeSxcbiAgICAgIG9wdGlvbnMgfHwge30sXG4gICAgKTtcblxuICAgIGlmIChjYWNoZSkge1xuICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICBjYWNoZS5zZXQodGFyZ2V0U3RyaW5nRnJvbVRhcmdldCh0YXJnZXQpLCByZXN1bHQucGlwZShzaGFyZVJlcGxheSgxKSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FjaGUuc2V0KGluZm8uYnVpbGRlck5hbWUsIHJlc3VsdC5waXBlKHNoYXJlUmVwbGF5KDEpKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGdldDxBIGV4dGVuZHMganNvbi5Kc29uT2JqZWN0LCBJIGV4dGVuZHMgQnVpbGRlcklucHV0LCBPIGV4dGVuZHMgQnVpbGRlck91dHB1dD4oXG4gICAgbmFtZTogc3RyaW5nLFxuICApOiBPYnNlcnZhYmxlPEpvYkhhbmRsZXI8QSwgSSwgTz4gfCBudWxsPiB7XG4gICAgY29uc3QgbSA9IG5hbWUubWF0Y2goL14oW146XSspOihbXjpdKykkL2kpO1xuICAgIGlmICghbSkge1xuICAgICAgcmV0dXJuIG9mKG51bGwpO1xuICAgIH1cblxuICAgIHJldHVybiBmcm9tKHRoaXMuX3Jlc29sdmVCdWlsZGVyKG5hbWUpKS5waXBlKFxuICAgICAgY29uY2F0TWFwKChidWlsZGVySW5mbykgPT4gKGJ1aWxkZXJJbmZvID8gdGhpcy5fY3JlYXRlQnVpbGRlcihidWlsZGVySW5mbykgOiBvZihudWxsKSkpLFxuICAgICAgZmlyc3QobnVsbCwgbnVsbCksXG4gICAgKSBhcyBPYnNlcnZhYmxlPEpvYkhhbmRsZXI8QSwgSSwgTz4gfCBudWxsPjtcbiAgfVxufVxuXG4vKipcbiAqIEEgSm9iUmVnaXN0cnkgdGhhdCByZXNvbHZlcyB0YXJnZXRzIGZyb20gdGhlIGhvc3QuXG4gKi9cbmNsYXNzIEFyY2hpdGVjdFRhcmdldEpvYlJlZ2lzdHJ5IGV4dGVuZHMgQXJjaGl0ZWN0QnVpbGRlckpvYlJlZ2lzdHJ5IHtcbiAgb3ZlcnJpZGUgZ2V0PEEgZXh0ZW5kcyBqc29uLkpzb25PYmplY3QsIEkgZXh0ZW5kcyBCdWlsZGVySW5wdXQsIE8gZXh0ZW5kcyBCdWlsZGVyT3V0cHV0PihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICk6IE9ic2VydmFibGU8Sm9iSGFuZGxlcjxBLCBJLCBPPiB8IG51bGw+IHtcbiAgICBjb25zdCBtID0gbmFtZS5tYXRjaCgvXnsoW146XSspOihbXjpdKykoPzo6KFteOl0qKSk/fSQvaSk7XG4gICAgaWYgKCFtKSB7XG4gICAgICByZXR1cm4gb2YobnVsbCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFyZ2V0ID0ge1xuICAgICAgcHJvamVjdDogbVsxXSxcbiAgICAgIHRhcmdldDogbVsyXSxcbiAgICAgIGNvbmZpZ3VyYXRpb246IG1bM10sXG4gICAgfTtcblxuICAgIHJldHVybiBmcm9tKFxuICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICB0aGlzLl9ob3N0LmdldEJ1aWxkZXJOYW1lRm9yVGFyZ2V0KHRhcmdldCksXG4gICAgICAgIHRoaXMuX2hvc3QuZ2V0T3B0aW9uc0ZvclRhcmdldCh0YXJnZXQpLFxuICAgICAgXSksXG4gICAgKS5waXBlKFxuICAgICAgY29uY2F0TWFwKChbYnVpbGRlclN0ciwgb3B0aW9uc10pID0+IHtcbiAgICAgICAgaWYgKGJ1aWxkZXJTdHIgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBvZihudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9yZXNvbHZlQnVpbGRlcihidWlsZGVyU3RyKS5waXBlKFxuICAgICAgICAgIGNvbmNhdE1hcCgoYnVpbGRlckluZm8pID0+IHtcbiAgICAgICAgICAgIGlmIChidWlsZGVySW5mbyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICByZXR1cm4gb2YobnVsbCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVCdWlsZGVyKGJ1aWxkZXJJbmZvLCB0YXJnZXQsIG9wdGlvbnMpO1xuICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgfSksXG4gICAgICBmaXJzdChudWxsLCBudWxsKSxcbiAgICApIGFzIE9ic2VydmFibGU8Sm9iSGFuZGxlcjxBLCBJLCBPPiB8IG51bGw+O1xuICB9XG59XG5cbmZ1bmN0aW9uIF9nZXRUYXJnZXRPcHRpb25zRmFjdG9yeShob3N0OiBBcmNoaXRlY3RIb3N0KSB7XG4gIHJldHVybiBjcmVhdGVKb2JIYW5kbGVyPFRhcmdldCwganNvbi5Kc29uVmFsdWUsIGpzb24uSnNvbk9iamVjdD4oXG4gICAgKHRhcmdldCkgPT4ge1xuICAgICAgcmV0dXJuIGhvc3QuZ2V0T3B0aW9uc0ZvclRhcmdldCh0YXJnZXQpLnRoZW4oKG9wdGlvbnMpID0+IHtcbiAgICAgICAgaWYgKG9wdGlvbnMgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdGFyZ2V0OiAke0pTT04uc3RyaW5naWZ5KHRhcmdldCl9LmApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICcuLmdldFRhcmdldE9wdGlvbnMnLFxuICAgICAgb3V0cHV0OiB7IHR5cGU6ICdvYmplY3QnIH0sXG4gICAgICBhcmd1bWVudDogaW5wdXRTY2hlbWEucHJvcGVydGllcy50YXJnZXQsXG4gICAgfSxcbiAgKTtcbn1cblxuZnVuY3Rpb24gX2dldFByb2plY3RNZXRhZGF0YUZhY3RvcnkoaG9zdDogQXJjaGl0ZWN0SG9zdCkge1xuICByZXR1cm4gY3JlYXRlSm9iSGFuZGxlcjxUYXJnZXQsIGpzb24uSnNvblZhbHVlLCBqc29uLkpzb25PYmplY3Q+KFxuICAgICh0YXJnZXQpID0+IHtcbiAgICAgIHJldHVybiBob3N0LmdldFByb2plY3RNZXRhZGF0YSh0YXJnZXQpLnRoZW4oKG9wdGlvbnMpID0+IHtcbiAgICAgICAgaWYgKG9wdGlvbnMgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdGFyZ2V0OiAke0pTT04uc3RyaW5naWZ5KHRhcmdldCl9LmApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICcuLmdldFByb2plY3RNZXRhZGF0YScsXG4gICAgICBvdXRwdXQ6IHsgdHlwZTogJ29iamVjdCcgfSxcbiAgICAgIGFyZ3VtZW50OiB7XG4gICAgICAgIG9uZU9mOiBbeyB0eXBlOiAnc3RyaW5nJyB9LCBpbnB1dFNjaGVtYS5wcm9wZXJ0aWVzLnRhcmdldF0sXG4gICAgICB9LFxuICAgIH0sXG4gICk7XG59XG5cbmZ1bmN0aW9uIF9nZXRCdWlsZGVyTmFtZUZvclRhcmdldEZhY3RvcnkoaG9zdDogQXJjaGl0ZWN0SG9zdCkge1xuICByZXR1cm4gY3JlYXRlSm9iSGFuZGxlcjxUYXJnZXQsIG5ldmVyLCBzdHJpbmc+KFxuICAgIGFzeW5jICh0YXJnZXQpID0+IHtcbiAgICAgIGNvbnN0IGJ1aWxkZXJOYW1lID0gYXdhaXQgaG9zdC5nZXRCdWlsZGVyTmFtZUZvclRhcmdldCh0YXJnZXQpO1xuICAgICAgaWYgKCFidWlsZGVyTmFtZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIGJ1aWxkZXIgd2VyZSBmb3VuZCBmb3IgdGFyZ2V0ICR7dGFyZ2V0U3RyaW5nRnJvbVRhcmdldCh0YXJnZXQpfS5gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGJ1aWxkZXJOYW1lO1xuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogJy4uZ2V0QnVpbGRlck5hbWVGb3JUYXJnZXQnLFxuICAgICAgb3V0cHV0OiB7IHR5cGU6ICdzdHJpbmcnIH0sXG4gICAgICBhcmd1bWVudDogaW5wdXRTY2hlbWEucHJvcGVydGllcy50YXJnZXQsXG4gICAgfSxcbiAgKTtcbn1cblxuZnVuY3Rpb24gX3ZhbGlkYXRlT3B0aW9uc0ZhY3RvcnkoaG9zdDogQXJjaGl0ZWN0SG9zdCwgcmVnaXN0cnk6IGpzb24uc2NoZW1hLlNjaGVtYVJlZ2lzdHJ5KSB7XG4gIHJldHVybiBjcmVhdGVKb2JIYW5kbGVyPFtzdHJpbmcsIGpzb24uSnNvbk9iamVjdF0sIG5ldmVyLCBqc29uLkpzb25PYmplY3Q+KFxuICAgIGFzeW5jIChbYnVpbGRlck5hbWUsIG9wdGlvbnNdKSA9PiB7XG4gICAgICAvLyBHZXQgb3B0aW9uIHNjaGVtYSBmcm9tIHRoZSBob3N0LlxuICAgICAgY29uc3QgYnVpbGRlckluZm8gPSBhd2FpdCBob3N0LnJlc29sdmVCdWlsZGVyKGJ1aWxkZXJOYW1lKTtcbiAgICAgIGlmICghYnVpbGRlckluZm8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBidWlsZGVyIGluZm8gd2VyZSBmb3VuZCBmb3IgYnVpbGRlciAke0pTT04uc3RyaW5naWZ5KGJ1aWxkZXJOYW1lKX0uYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZWdpc3RyeVxuICAgICAgICAuY29tcGlsZShidWlsZGVySW5mby5vcHRpb25TY2hlbWEpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgIGNvbmNhdE1hcCgodmFsaWRhdGlvbikgPT4gdmFsaWRhdGlvbihvcHRpb25zKSksXG4gICAgICAgICAgc3dpdGNoTWFwKCh7IGRhdGEsIHN1Y2Nlc3MsIGVycm9ycyB9KSA9PiB7XG4gICAgICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICByZXR1cm4gb2YoZGF0YSBhcyBqc29uLkpzb25PYmplY3QpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aHJvdyBuZXcganNvbi5zY2hlbWEuU2NoZW1hVmFsaWRhdGlvbkV4Y2VwdGlvbihlcnJvcnMpO1xuICAgICAgICAgIH0pLFxuICAgICAgICApXG4gICAgICAgIC50b1Byb21pc2UoKTtcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICcuLnZhbGlkYXRlT3B0aW9ucycsXG4gICAgICBvdXRwdXQ6IHsgdHlwZTogJ29iamVjdCcgfSxcbiAgICAgIGFyZ3VtZW50OiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGl0ZW1zOiBbeyB0eXBlOiAnc3RyaW5nJyB9LCB7IHR5cGU6ICdvYmplY3QnIH1dLFxuICAgICAgfSxcbiAgICB9LFxuICApO1xufVxuXG5leHBvcnQgY2xhc3MgQXJjaGl0ZWN0IHtcbiAgcHJpdmF0ZSByZWFkb25seSBfc2NoZWR1bGVyOiBTY2hlZHVsZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgX2pvYkNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIE9ic2VydmFibGU8QnVpbGRlckpvYkhhbmRsZXI+PigpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9pbmZvQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgT2JzZXJ2YWJsZTxCdWlsZGVySW5mbz4+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfaG9zdDogQXJjaGl0ZWN0SG9zdCxcbiAgICByZWdpc3RyeToganNvbi5zY2hlbWEuU2NoZW1hUmVnaXN0cnkgPSBuZXcganNvbi5zY2hlbWEuQ29yZVNjaGVtYVJlZ2lzdHJ5KCksXG4gICAgYWRkaXRpb25hbEpvYlJlZ2lzdHJ5PzogUmVnaXN0cnksXG4gICkge1xuICAgIGNvbnN0IHByaXZhdGVBcmNoaXRlY3RKb2JSZWdpc3RyeSA9IG5ldyBTaW1wbGVKb2JSZWdpc3RyeSgpO1xuICAgIC8vIENyZWF0ZSBwcml2YXRlIGpvYnMuXG4gICAgcHJpdmF0ZUFyY2hpdGVjdEpvYlJlZ2lzdHJ5LnJlZ2lzdGVyKF9nZXRUYXJnZXRPcHRpb25zRmFjdG9yeShfaG9zdCkpO1xuICAgIHByaXZhdGVBcmNoaXRlY3RKb2JSZWdpc3RyeS5yZWdpc3RlcihfZ2V0QnVpbGRlck5hbWVGb3JUYXJnZXRGYWN0b3J5KF9ob3N0KSk7XG4gICAgcHJpdmF0ZUFyY2hpdGVjdEpvYlJlZ2lzdHJ5LnJlZ2lzdGVyKF92YWxpZGF0ZU9wdGlvbnNGYWN0b3J5KF9ob3N0LCByZWdpc3RyeSkpO1xuICAgIHByaXZhdGVBcmNoaXRlY3RKb2JSZWdpc3RyeS5yZWdpc3RlcihfZ2V0UHJvamVjdE1ldGFkYXRhRmFjdG9yeShfaG9zdCkpO1xuXG4gICAgY29uc3Qgam9iUmVnaXN0cnkgPSBuZXcgRmFsbGJhY2tSZWdpc3RyeShbXG4gICAgICBuZXcgQXJjaGl0ZWN0VGFyZ2V0Sm9iUmVnaXN0cnkoX2hvc3QsIHJlZ2lzdHJ5LCB0aGlzLl9qb2JDYWNoZSwgdGhpcy5faW5mb0NhY2hlKSxcbiAgICAgIG5ldyBBcmNoaXRlY3RCdWlsZGVySm9iUmVnaXN0cnkoX2hvc3QsIHJlZ2lzdHJ5LCB0aGlzLl9qb2JDYWNoZSwgdGhpcy5faW5mb0NhY2hlKSxcbiAgICAgIHByaXZhdGVBcmNoaXRlY3RKb2JSZWdpc3RyeSxcbiAgICAgIC4uLihhZGRpdGlvbmFsSm9iUmVnaXN0cnkgPyBbYWRkaXRpb25hbEpvYlJlZ2lzdHJ5XSA6IFtdKSxcbiAgICBdIGFzIFJlZ2lzdHJ5W10pO1xuXG4gICAgdGhpcy5fc2NoZWR1bGVyID0gbmV3IFNpbXBsZVNjaGVkdWxlcihqb2JSZWdpc3RyeSwgcmVnaXN0cnkpO1xuICB9XG5cbiAgaGFzKG5hbWU6IEpvYk5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fc2NoZWR1bGVyLmhhcyhuYW1lKTtcbiAgfVxuXG4gIHNjaGVkdWxlQnVpbGRlcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgb3B0aW9uczoganNvbi5Kc29uT2JqZWN0LFxuICAgIHNjaGVkdWxlT3B0aW9uczogU2NoZWR1bGVPcHRpb25zID0ge30sXG4gICk6IFByb21pc2U8QnVpbGRlclJ1bj4ge1xuICAgIC8vIFRoZSBiZWxvdyB3aWxsIG1hdGNoICdwcm9qZWN0OnRhcmdldDpjb25maWd1cmF0aW9uJ1xuICAgIGlmICghL15bXjpdKzpbXjpdKyg6W146XSspPyQvLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBidWlsZGVyIG5hbWU6ICcgKyBKU09OLnN0cmluZ2lmeShuYW1lKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNjaGVkdWxlQnlOYW1lKG5hbWUsIG9wdGlvbnMsIHtcbiAgICAgIHNjaGVkdWxlcjogdGhpcy5fc2NoZWR1bGVyLFxuICAgICAgbG9nZ2VyOiBzY2hlZHVsZU9wdGlvbnMubG9nZ2VyIHx8IG5ldyBsb2dnaW5nLk51bGxMb2dnZXIoKSxcbiAgICAgIGN1cnJlbnREaXJlY3Rvcnk6IHRoaXMuX2hvc3QuZ2V0Q3VycmVudERpcmVjdG9yeSgpLFxuICAgICAgd29ya3NwYWNlUm9vdDogdGhpcy5faG9zdC5nZXRXb3Jrc3BhY2VSb290KCksXG4gICAgfSk7XG4gIH1cbiAgc2NoZWR1bGVUYXJnZXQoXG4gICAgdGFyZ2V0OiBUYXJnZXQsXG4gICAgb3ZlcnJpZGVzOiBqc29uLkpzb25PYmplY3QgPSB7fSxcbiAgICBzY2hlZHVsZU9wdGlvbnM6IFNjaGVkdWxlT3B0aW9ucyA9IHt9LFxuICApOiBQcm9taXNlPEJ1aWxkZXJSdW4+IHtcbiAgICByZXR1cm4gc2NoZWR1bGVCeVRhcmdldCh0YXJnZXQsIG92ZXJyaWRlcywge1xuICAgICAgc2NoZWR1bGVyOiB0aGlzLl9zY2hlZHVsZXIsXG4gICAgICBsb2dnZXI6IHNjaGVkdWxlT3B0aW9ucy5sb2dnZXIgfHwgbmV3IGxvZ2dpbmcuTnVsbExvZ2dlcigpLFxuICAgICAgY3VycmVudERpcmVjdG9yeTogdGhpcy5faG9zdC5nZXRDdXJyZW50RGlyZWN0b3J5KCksXG4gICAgICB3b3Jrc3BhY2VSb290OiB0aGlzLl9ob3N0LmdldFdvcmtzcGFjZVJvb3QoKSxcbiAgICB9KTtcbiAgfVxufVxuIl19