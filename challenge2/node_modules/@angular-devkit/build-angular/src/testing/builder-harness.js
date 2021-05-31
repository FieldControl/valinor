"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderHarness = void 0;
const architect_1 = require("@angular-devkit/architect");
const core_1 = require("@angular-devkit/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const file_watching_1 = require("./file-watching");
class BuilderHarness {
    constructor(builderHandler, host, builderInfo) {
        this.builderHandler = builderHandler;
        this.host = host;
        this.schemaRegistry = new core_1.json.schema.CoreSchemaRegistry();
        this.projectName = 'test';
        this.projectMetadata = { root: '.', sourceRoot: 'src' };
        this.options = new Map();
        this.builderTargets = new Map();
        // Generate default pseudo builder info for test purposes
        this.builderInfo = {
            builderName: builderHandler.name,
            description: '',
            optionSchema: true,
            ...builderInfo,
        };
        this.schemaRegistry.addPostTransform(core_1.json.schema.transforms.addUndefinedDefaults);
    }
    useProject(name, metadata = {}) {
        if (!name) {
            throw new Error('Project name cannot be an empty string.');
        }
        this.projectName = name;
        this.projectMetadata = metadata;
        return this;
    }
    useTarget(name, baseOptions) {
        if (!name) {
            throw new Error('Target name cannot be an empty string.');
        }
        this.targetName = name;
        this.options.set(null, baseOptions);
        return this;
    }
    withConfiguration(configuration, options) {
        this.options.set(configuration, options);
        return this;
    }
    withBuilderTarget(target, handler, options, info) {
        this.builderTargets.set(target, {
            handler,
            options: options || {},
            info: { builderName: handler.name, description: '', optionSchema: true, ...info },
        });
        return this;
    }
    execute(options = {}) {
        var _a;
        const { configuration, outputLogsOnException = true, outputLogsOnFailure = true, useNativeFileWatching = false, } = options;
        const targetOptions = {
            ...this.options.get(null),
            ...((_a = (configuration && this.options.get(configuration))) !== null && _a !== void 0 ? _a : {}),
        };
        if (!useNativeFileWatching) {
            if (this.watcherNotifier) {
                throw new Error('Only one harness execution at a time is supported.');
            }
            this.watcherNotifier = new file_watching_1.WatcherNotifier();
        }
        const contextHost = {
            findBuilderByTarget: async (project, target) => {
                this.validateProjectName(project);
                if (target === this.targetName) {
                    return {
                        info: this.builderInfo,
                        handler: this.builderHandler,
                    };
                }
                const builderTarget = this.builderTargets.get(target);
                if (builderTarget) {
                    return { info: builderTarget.info, handler: builderTarget.handler };
                }
                throw new Error('Project target does not exist.');
            },
            async getBuilderName(project, target) {
                return (await this.findBuilderByTarget(project, target)).info.builderName;
            },
            getMetadata: async (project) => {
                this.validateProjectName(project);
                return this.projectMetadata;
            },
            getOptions: async (project, target, configuration) => {
                var _a, _b;
                this.validateProjectName(project);
                if (target === this.targetName) {
                    return (_a = this.options.get(configuration !== null && configuration !== void 0 ? configuration : null)) !== null && _a !== void 0 ? _a : {};
                }
                else if (configuration !== undefined) {
                    // Harness builder targets currently do not support configurations
                    return {};
                }
                else {
                    return ((_b = this.builderTargets.get(target)) === null || _b === void 0 ? void 0 : _b.options) || {};
                }
            },
            hasTarget: async (project, target) => {
                this.validateProjectName(project);
                return this.targetName === target || this.builderTargets.has(target);
            },
            getDefaultConfigurationName: async (_project, _target) => {
                return undefined;
            },
            validate: async (options, builderName) => {
                let schema;
                if (builderName === this.builderInfo.builderName) {
                    schema = this.builderInfo.optionSchema;
                }
                else {
                    for (const [, value] of this.builderTargets) {
                        if (value.info.builderName === builderName) {
                            schema = value.info.optionSchema;
                            break;
                        }
                    }
                }
                const validator = await this.schemaRegistry.compile(schema !== null && schema !== void 0 ? schema : true).toPromise();
                const { data } = await validator(options).toPromise();
                return data;
            },
        };
        const context = new HarnessBuilderContext(this.builderInfo, core_1.getSystemPath(this.host.root()), contextHost, useNativeFileWatching ? undefined : this.watcherNotifier);
        if (this.targetName !== undefined) {
            context.target = {
                project: this.projectName,
                target: this.targetName,
                configuration: configuration,
            };
        }
        const logs = [];
        context.logger.subscribe((e) => logs.push(e));
        return this.schemaRegistry.compile(this.builderInfo.optionSchema).pipe(operators_1.mergeMap((validator) => validator(targetOptions)), operators_1.map((validationResult) => validationResult.data), operators_1.mergeMap((data) => convertBuilderOutputToObservable(this.builderHandler(data, context))), operators_1.map((buildResult) => ({ result: buildResult, error: undefined })), operators_1.catchError((error) => {
            if (outputLogsOnException) {
                // eslint-disable-next-line no-console
                console.error(logs.map((entry) => entry.message).join('\n'));
                // eslint-disable-next-line no-console
                console.error(error);
            }
            return rxjs_1.of({ result: undefined, error });
        }), operators_1.map(({ result, error }) => {
            if (outputLogsOnFailure && (result === null || result === void 0 ? void 0 : result.success) === false && logs.length > 0) {
                // eslint-disable-next-line no-console
                console.error(logs.map((entry) => entry.message).join('\n'));
            }
            // Capture current logs and clear for next
            const currentLogs = logs.slice();
            logs.length = 0;
            return { result, error, logs: currentLogs };
        }), operators_1.finalize(() => {
            this.watcherNotifier = undefined;
            for (const teardown of context.teardowns) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                teardown();
            }
        }));
    }
    async executeOnce(options) {
        // Return the first result
        return this.execute(options).pipe(operators_1.first()).toPromise();
    }
    async appendToFile(path, content) {
        await this.writeFile(path, this.readFile(path).concat(content));
    }
    async writeFile(path, content) {
        var _a;
        this.host
            .scopedSync()
            .write(core_1.normalize(path), typeof content === 'string' ? Buffer.from(content) : content);
        (_a = this.watcherNotifier) === null || _a === void 0 ? void 0 : _a.notify([
            { path: core_1.getSystemPath(core_1.join(this.host.root(), path)), type: 'modified' },
        ]);
    }
    async writeFiles(files) {
        var _a;
        const watchEvents = this.watcherNotifier
            ? []
            : undefined;
        for (const [path, content] of Object.entries(files)) {
            this.host
                .scopedSync()
                .write(core_1.normalize(path), typeof content === 'string' ? Buffer.from(content) : content);
            watchEvents === null || watchEvents === void 0 ? void 0 : watchEvents.push({ path: core_1.getSystemPath(core_1.join(this.host.root(), path)), type: 'modified' });
        }
        if (watchEvents) {
            (_a = this.watcherNotifier) === null || _a === void 0 ? void 0 : _a.notify(watchEvents);
        }
    }
    async removeFile(path) {
        var _a;
        this.host.scopedSync().delete(core_1.normalize(path));
        (_a = this.watcherNotifier) === null || _a === void 0 ? void 0 : _a.notify([
            { path: core_1.getSystemPath(core_1.join(this.host.root(), path)), type: 'deleted' },
        ]);
    }
    async modifyFile(path, modifier) {
        var _a;
        const content = this.readFile(path);
        await this.writeFile(path, await modifier(content));
        (_a = this.watcherNotifier) === null || _a === void 0 ? void 0 : _a.notify([
            { path: core_1.getSystemPath(core_1.join(this.host.root(), path)), type: 'modified' },
        ]);
    }
    hasFile(path) {
        return this.host.scopedSync().exists(core_1.normalize(path));
    }
    hasFileMatch(directory, pattern) {
        return this.host
            .scopedSync()
            .list(core_1.normalize(directory))
            .some((name) => pattern.test(name));
    }
    readFile(path) {
        const content = this.host.scopedSync().read(core_1.normalize(path));
        return Buffer.from(content).toString('utf8');
    }
    validateProjectName(name) {
        if (name !== this.projectName) {
            throw new Error(`Project "${name}" does not exist.`);
        }
    }
}
exports.BuilderHarness = BuilderHarness;
class HarnessBuilderContext {
    constructor(builder, basePath, contextHost, watcherFactory) {
        this.builder = builder;
        this.contextHost = contextHost;
        this.watcherFactory = watcherFactory;
        this.id = Math.trunc(Math.random() * 1000000);
        this.logger = new core_1.logging.Logger(`builder-harness-${this.id}`);
        this.teardowns = [];
        this.workspaceRoot = this.currentDirectory = basePath;
    }
    get analytics() {
        // Can be undefined even though interface does not allow it
        return undefined;
    }
    addTeardown(teardown) {
        this.teardowns.push(teardown);
    }
    async getBuilderNameForTarget(target) {
        return this.contextHost.getBuilderName(target.project, target.target);
    }
    async getProjectMetadata(targetOrName) {
        const project = typeof targetOrName === 'string' ? targetOrName : targetOrName.project;
        return this.contextHost.getMetadata(project);
    }
    async getTargetOptions(target) {
        return this.contextHost.getOptions(target.project, target.target, target.configuration);
    }
    // Unused by builders in this package
    async scheduleBuilder(builderName, options, scheduleOptions) {
        throw new Error('Not Implemented.');
    }
    async scheduleTarget(target, overrides, scheduleOptions) {
        const { info, handler } = await this.contextHost.findBuilderByTarget(target.project, target.target);
        const targetOptions = await this.validateOptions({
            ...(await this.getTargetOptions(target)),
            ...overrides,
        }, info.builderName);
        const context = new HarnessBuilderContext(info, this.workspaceRoot, this.contextHost, this.watcherFactory);
        context.target = target;
        context.logger = (scheduleOptions === null || scheduleOptions === void 0 ? void 0 : scheduleOptions.logger) || this.logger.createChild('');
        const progressSubject = new rxjs_1.Subject();
        const output = convertBuilderOutputToObservable(handler(targetOptions, context));
        const run = {
            id: context.id,
            info,
            progress: progressSubject.asObservable(),
            async stop() {
                for (const teardown of context.teardowns) {
                    await teardown();
                }
                progressSubject.complete();
            },
            output: output.pipe(operators_1.shareReplay()),
            get result() {
                return this.output.pipe(operators_1.first()).toPromise();
            },
        };
        return run;
    }
    async validateOptions(options, builderName) {
        return this.contextHost.validate(options, builderName);
    }
    // Unused report methods
    reportRunning() { }
    reportStatus() { }
    reportProgress() { }
}
function isAsyncIterable(obj) {
    return !!obj && typeof obj[Symbol.asyncIterator] === 'function';
}
function convertBuilderOutputToObservable(output) {
    if (architect_1.isBuilderOutput(output)) {
        return rxjs_1.of(output);
    }
    else if (isAsyncIterable(output)) {
        return architect_1.fromAsyncIterable(output);
    }
    else {
        return rxjs_1.from(output);
    }
}
