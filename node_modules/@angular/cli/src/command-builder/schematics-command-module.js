"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchematicsCommandModule = exports.DEFAULT_SCHEMATICS_COLLECTION = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const tools_1 = require("@angular-devkit/schematics/tools");
const path_1 = require("path");
const analytics_1 = require("../analytics/analytics");
const analytics_parameters_1 = require("../analytics/analytics-parameters");
const config_1 = require("../utilities/config");
const error_1 = require("../utilities/error");
const memoize_1 = require("../utilities/memoize");
const tty_1 = require("../utilities/tty");
const command_module_1 = require("./command-module");
const json_schema_1 = require("./utilities/json-schema");
const schematic_engine_host_1 = require("./utilities/schematic-engine-host");
const schematic_workflow_1 = require("./utilities/schematic-workflow");
exports.DEFAULT_SCHEMATICS_COLLECTION = '@schematics/angular';
class SchematicsCommandModule extends command_module_1.CommandModule {
    constructor() {
        super(...arguments);
        this.scope = command_module_1.CommandScope.In;
        this.allowPrivateSchematics = false;
        this.defaultProjectDeprecationWarningShown = false;
    }
    async builder(argv) {
        return argv
            .option('interactive', {
            describe: 'Enable interactive input prompts.',
            type: 'boolean',
            default: true,
        })
            .option('dry-run', {
            describe: 'Run through and reports activity without writing out results.',
            type: 'boolean',
            default: false,
        })
            .option('defaults', {
            describe: 'Disable interactive input prompts for options with a default.',
            type: 'boolean',
            default: false,
        })
            .option('force', {
            describe: 'Force overwriting of existing files.',
            type: 'boolean',
            default: false,
        })
            .strict();
    }
    /** Get schematic schema options.*/
    async getSchematicOptions(collection, schematicName, workflow) {
        const schematic = collection.createSchematic(schematicName, true);
        const { schemaJson } = schematic.description;
        if (!schemaJson) {
            return [];
        }
        return (0, json_schema_1.parseJsonSchemaToOptions)(workflow.registry, schemaJson);
    }
    getOrCreateWorkflowForBuilder(collectionName) {
        return new tools_1.NodeWorkflow(this.context.root, {
            resolvePaths: this.getResolvePaths(collectionName),
            engineHostCreator: (options) => new schematic_engine_host_1.SchematicEngineHost(options.resolvePaths),
        });
    }
    async getOrCreateWorkflowForExecution(collectionName, options) {
        const { logger, root, packageManager } = this.context;
        const { force, dryRun, packageRegistry } = options;
        const workflow = new tools_1.NodeWorkflow(root, {
            force,
            dryRun,
            packageManager: packageManager.name,
            // A schema registry is required to allow customizing addUndefinedDefaults
            registry: new core_1.schema.CoreSchemaRegistry(schematics_1.formats.standardFormats),
            packageRegistry,
            resolvePaths: this.getResolvePaths(collectionName),
            schemaValidation: true,
            optionTransforms: [
                // Add configuration file defaults
                async (schematic, current) => {
                    const projectName = typeof (current === null || current === void 0 ? void 0 : current.project) === 'string' ? current.project : this.getProjectName();
                    return {
                        ...(await (0, config_1.getSchematicDefaults)(schematic.collection.name, schematic.name, projectName)),
                        ...current,
                    };
                },
            ],
            engineHostCreator: (options) => new schematic_engine_host_1.SchematicEngineHost(options.resolvePaths),
        });
        workflow.registry.addPostTransform(core_1.schema.transforms.addUndefinedDefaults);
        workflow.registry.useXDeprecatedProvider((msg) => logger.warn(msg));
        workflow.registry.addSmartDefaultProvider('projectName', () => this.getProjectName());
        const workingDir = (0, core_1.normalize)((0, path_1.relative)(this.context.root, process.cwd()));
        workflow.registry.addSmartDefaultProvider('workingDirectory', () => workingDir === '' ? undefined : workingDir);
        let shouldReportAnalytics = true;
        workflow.engineHost.registerOptionsTransform(async (schematic, options) => {
            // Report analytics
            if (shouldReportAnalytics) {
                shouldReportAnalytics = false;
                const { collection: { name: collectionName }, name: schematicName, } = schematic;
                const analytics = (0, analytics_1.isPackageNameSafeForAnalytics)(collectionName)
                    ? await this.getAnalytics()
                    : undefined;
                analytics === null || analytics === void 0 ? void 0 : analytics.reportSchematicRunEvent({
                    [analytics_parameters_1.EventCustomDimension.SchematicCollectionName]: collectionName,
                    [analytics_parameters_1.EventCustomDimension.SchematicName]: schematicName,
                    ...this.getAnalyticsParameters(options),
                });
            }
            return options;
        });
        if (options.interactive !== false && (0, tty_1.isTTY)()) {
            workflow.registry.usePromptProvider(async (definitions) => {
                const questions = definitions
                    .filter((definition) => !options.defaults || definition.default === undefined)
                    .map((definition) => {
                    var _a;
                    const question = {
                        name: definition.id,
                        message: definition.message,
                        default: definition.default,
                    };
                    const validator = definition.validator;
                    if (validator) {
                        question.validate = (input) => validator(input);
                        // Filter allows transformation of the value prior to validation
                        question.filter = async (input) => {
                            for (const type of definition.propertyTypes) {
                                let value;
                                switch (type) {
                                    case 'string':
                                        value = String(input);
                                        break;
                                    case 'integer':
                                    case 'number':
                                        value = Number(input);
                                        break;
                                    default:
                                        value = input;
                                        break;
                                }
                                // Can be a string if validation fails
                                const isValid = (await validator(value)) === true;
                                if (isValid) {
                                    return value;
                                }
                            }
                            return input;
                        };
                    }
                    switch (definition.type) {
                        case 'confirmation':
                            question.type = 'confirm';
                            break;
                        case 'list':
                            question.type = definition.multiselect ? 'checkbox' : 'list';
                            question.choices = (_a = definition.items) === null || _a === void 0 ? void 0 : _a.map((item) => {
                                return typeof item == 'string'
                                    ? item
                                    : {
                                        name: item.label,
                                        value: item.value,
                                    };
                            });
                            break;
                        default:
                            question.type = definition.type;
                            break;
                    }
                    return question;
                });
                if (questions.length) {
                    const { prompt } = await Promise.resolve().then(() => __importStar(require('inquirer')));
                    return prompt(questions);
                }
                else {
                    return {};
                }
            });
        }
        return workflow;
    }
    async getSchematicCollections() {
        var _a;
        // Resolve relative collections from the location of `angular.json`
        const resolveRelativeCollection = (collectionName) => collectionName.charAt(0) === '.'
            ? (0, path_1.resolve)(this.context.root, collectionName)
            : collectionName;
        const getSchematicCollections = (configSection) => {
            if (!configSection) {
                return undefined;
            }
            const { schematicCollections, defaultCollection } = configSection;
            if (Array.isArray(schematicCollections)) {
                return new Set(schematicCollections.map((c) => resolveRelativeCollection(c)));
            }
            else if (typeof defaultCollection === 'string') {
                return new Set([resolveRelativeCollection(defaultCollection)]);
            }
            return undefined;
        };
        const { workspace, globalConfiguration } = this.context;
        if (workspace) {
            const project = (0, config_1.getProjectByCwd)(workspace);
            if (project) {
                const value = getSchematicCollections(workspace.getProjectCli(project));
                if (value) {
                    return value;
                }
            }
        }
        const value = (_a = getSchematicCollections(workspace === null || workspace === void 0 ? void 0 : workspace.getCli())) !== null && _a !== void 0 ? _a : getSchematicCollections(globalConfiguration.getCli());
        if (value) {
            return value;
        }
        return new Set([exports.DEFAULT_SCHEMATICS_COLLECTION]);
    }
    parseSchematicInfo(schematic) {
        if (schematic === null || schematic === void 0 ? void 0 : schematic.includes(':')) {
            const [collectionName, schematicName] = schematic.split(':', 2);
            return [collectionName, schematicName];
        }
        return [undefined, schematic];
    }
    async runSchematic(options) {
        const { logger } = this.context;
        const { schematicOptions, executionOptions, collectionName, schematicName } = options;
        const workflow = await this.getOrCreateWorkflowForExecution(collectionName, executionOptions);
        if (!schematicName) {
            throw new Error('schematicName cannot be undefined.');
        }
        const { unsubscribe, files } = (0, schematic_workflow_1.subscribeToWorkflow)(workflow, logger);
        try {
            await workflow
                .execute({
                collection: collectionName,
                schematic: schematicName,
                options: schematicOptions,
                logger,
                allowPrivate: this.allowPrivateSchematics,
            })
                .toPromise();
            if (!files.size) {
                logger.info('Nothing to be done.');
            }
            if (executionOptions.dryRun) {
                logger.warn(`\nNOTE: The "--dry-run" option means no changes were made.`);
            }
        }
        catch (err) {
            // In case the workflow was not successful, show an appropriate error message.
            if (err instanceof schematics_1.UnsuccessfulWorkflowExecution) {
                // "See above" because we already printed the error.
                logger.fatal('The Schematic workflow failed. See above.');
            }
            else {
                (0, error_1.assertIsError)(err);
                logger.fatal(err.message);
            }
            return 1;
        }
        finally {
            unsubscribe();
        }
        return 0;
    }
    getProjectName() {
        const { workspace, logger } = this.context;
        if (!workspace) {
            return undefined;
        }
        const projectName = (0, config_1.getProjectByCwd)(workspace);
        if (projectName) {
            return projectName;
        }
        const defaultProjectName = workspace.extensions['defaultProject'];
        if (typeof defaultProjectName === 'string' && defaultProjectName) {
            if (!this.defaultProjectDeprecationWarningShown) {
                logger.warn(core_1.tags.oneLine `
             DEPRECATED: The 'defaultProject' workspace option has been deprecated.
             The project to use will be determined from the current working directory.
           `);
                this.defaultProjectDeprecationWarningShown = true;
            }
            return defaultProjectName;
        }
        return undefined;
    }
    getResolvePaths(collectionName) {
        const { workspace, root } = this.context;
        return workspace
            ? // Workspace
                collectionName === exports.DEFAULT_SCHEMATICS_COLLECTION
                    ? // Favor __dirname for @schematics/angular to use the build-in version
                        [__dirname, process.cwd(), root]
                    : [process.cwd(), root, __dirname]
            : // Global
                [__dirname, process.cwd()];
    }
}
__decorate([
    memoize_1.memoize,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", tools_1.NodeWorkflow)
], SchematicsCommandModule.prototype, "getOrCreateWorkflowForBuilder", null);
__decorate([
    memoize_1.memoize,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SchematicsCommandModule.prototype, "getOrCreateWorkflowForExecution", null);
__decorate([
    memoize_1.memoize,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchematicsCommandModule.prototype, "getSchematicCollections", null);
exports.SchematicsCommandModule = SchematicsCommandModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NoZW1hdGljcy1jb21tYW5kLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXIvY2xpL3NyYy9jb21tYW5kLWJ1aWxkZXIvc2NoZW1hdGljcy1jb21tYW5kLW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILCtDQUFrRjtBQUNsRiwyREFBZ0c7QUFDaEcsNERBSTBDO0FBRTFDLCtCQUF5QztBQUV6QyxzREFBdUU7QUFDdkUsNEVBQXlFO0FBQ3pFLGdEQUE0RTtBQUM1RSw4Q0FBbUQ7QUFDbkQsa0RBQStDO0FBQy9DLDBDQUF5QztBQUN6QyxxREFNMEI7QUFDMUIseURBQTJFO0FBQzNFLDZFQUF3RTtBQUN4RSx1RUFBcUU7QUFFeEQsUUFBQSw2QkFBNkIsR0FBRyxxQkFBcUIsQ0FBQztBQWFuRSxNQUFzQix1QkFDcEIsU0FBUSw4QkFBb0M7SUFEOUM7O1FBSVcsVUFBSyxHQUFHLDZCQUFZLENBQUMsRUFBRSxDQUFDO1FBQ2QsMkJBQXNCLEdBQVksS0FBSyxDQUFDO1FBaVRuRCwwQ0FBcUMsR0FBRyxLQUFLLENBQUM7SUF5Q3hELENBQUM7SUF4VkMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFVO1FBQ3RCLE9BQU8sSUFBSTthQUNSLE1BQU0sQ0FBQyxhQUFhLEVBQUU7WUFDckIsUUFBUSxFQUFFLG1DQUFtQztZQUM3QyxJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxJQUFJO1NBQ2QsQ0FBQzthQUNELE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDakIsUUFBUSxFQUFFLCtEQUErRDtZQUN6RSxJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxLQUFLO1NBQ2YsQ0FBQzthQUNELE1BQU0sQ0FBQyxVQUFVLEVBQUU7WUFDbEIsUUFBUSxFQUFFLCtEQUErRDtZ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U0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7Q0FDRjtBQS9TQztJQUFDLGlCQUFPOzs7b0NBQ3lELG9CQUFZOzRFQUs1RTtBQUdlO0lBRGYsaUJBQU87Ozs7OEVBOElQO0FBR2U7SUFEZixpQkFBTzs7OztzRUE0Q1A7QUFwUEgsMERBK1ZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IG5vcm1hbGl6ZSBhcyBkZXZraXROb3JtYWxpemUsIHNjaGVtYSwgdGFncyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IENvbGxlY3Rpb24sIFVuc3VjY2Vzc2Z1bFdvcmtmbG93RXhlY3V0aW9uLCBmb3JtYXRzIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtcbiAgRmlsZVN5c3RlbUNvbGxlY3Rpb25EZXNjcmlwdGlvbixcbiAgRmlsZVN5c3RlbVNjaGVtYXRpY0Rlc2NyaXB0aW9uLFxuICBOb2RlV29ya2Zsb3csXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rvb2xzJztcbmltcG9ydCB0eXBlIHsgQ2hlY2tib3hRdWVzdGlvbiwgUXVlc3Rpb24gfSBmcm9tICdpbnF1aXJlcic7XG5pbXBvcnQgeyByZWxhdGl2ZSwgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQXJndiB9IGZyb20gJ3lhcmdzJztcbmltcG9ydCB7IGlzUGFja2FnZU5hbWVTYWZlRm9yQW5hbHl0aWNzIH0gZnJvbSAnLi4vYW5hbHl0aWNzL2FuYWx5dGljcyc7XG5pbXBvcnQgeyBFdmVudEN1c3RvbURpbWVuc2lvbiB9IGZyb20gJy4uL2FuYWx5dGljcy9hbmFseXRpY3MtcGFyYW1ldGVycyc7XG5pbXBvcnQgeyBnZXRQcm9qZWN0QnlDd2QsIGdldFNjaGVtYXRpY0RlZmF1bHRzIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2NvbmZpZyc7XG5pbXBvcnQgeyBhc3NlcnRJc0Vycm9yIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Vycm9yJztcbmltcG9ydCB7IG1lbW9pemUgfSBmcm9tICcuLi91dGlsaXRpZXMvbWVtb2l6ZSc7XG5pbXBvcnQgeyBpc1RUWSB9IGZyb20gJy4uL3V0aWxpdGllcy90dHknO1xuaW1wb3J0IHtcbiAgQ29tbWFuZE1vZHVsZSxcbiAgQ29tbWFuZE1vZHVsZUltcGxlbWVudGF0aW9uLFxuICBDb21tYW5kU2NvcGUsXG4gIE9wdGlvbnMsXG4gIE90aGVyT3B0aW9ucyxcbn0gZnJvbSAnLi9jb21tYW5kLW1vZHVsZSc7XG5pbXBvcnQgeyBPcHRpb24sIHBhcnNlSnNvblNjaGVtYVRvT3B0aW9ucyB9IGZyb20gJy4vdXRpbGl0aWVzL2pzb24tc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYXRpY0VuZ2luZUhvc3QgfSBmcm9tICcuL3V0aWxpdGllcy9zY2hlbWF0aWMtZW5naW5lLWhvc3QnO1xuaW1wb3J0IHsgc3Vic2NyaWJlVG9Xb3JrZmxvdyB9IGZyb20gJy4vdXRpbGl0aWVzL3NjaGVtYXRpYy13b3JrZmxvdyc7XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1NDSEVNQVRJQ1NfQ09MTEVDVElPTiA9ICdAc2NoZW1hdGljcy9hbmd1bGFyJztcblxuZXhwb3J0IGludGVyZmFjZSBTY2hlbWF0aWNzQ29tbWFuZEFyZ3Mge1xuICBpbnRlcmFjdGl2ZTogYm9vbGVhbjtcbiAgZm9yY2U6IGJvb2xlYW47XG4gICdkcnktcnVuJzogYm9vbGVhbjtcbiAgZGVmYXVsdHM6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NoZW1hdGljc0V4ZWN1dGlvbk9wdGlvbnMgZXh0ZW5kcyBPcHRpb25zPFNjaGVtYXRpY3NDb21tYW5kQXJncz4ge1xuICBwYWNrYWdlUmVnaXN0cnk/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTY2hlbWF0aWNzQ29tbWFuZE1vZHVsZVxuICBleHRlbmRzIENvbW1hbmRNb2R1bGU8U2NoZW1hdGljc0NvbW1hbmRBcmdzPlxuICBpbXBsZW1lbnRzIENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvbjxTY2hlbWF0aWNzQ29tbWFuZEFyZ3M+XG57XG4gIG92ZXJyaWRlIHNjb3BlID0gQ29tbWFuZFNjb3BlLkluO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgYWxsb3dQcml2YXRlU2NoZW1hdGljczogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGFzeW5jIGJ1aWxkZXIoYXJndjogQXJndik6IFByb21pc2U8QXJndjxTY2hlbWF0aWNzQ29tbWFuZEFyZ3M+PiB7XG4gICAgcmV0dXJuIGFyZ3ZcbiAgICAgIC5vcHRpb24oJ2ludGVyYWN0aXZlJywge1xuICAgICAgICBkZXNjcmliZTogJ0VuYWJsZSBpbnRlcmFjdGl2ZSBpbnB1dCBwcm9tcHRzLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIH0pXG4gICAgICAub3B0aW9uKCdkcnktcnVuJywge1xuICAgICAgICBkZXNjcmliZTogJ1J1biB0aHJvdWdoIGFuZCByZXBvcnRzIGFjdGl2aXR5IHdpdGhvdXQgd3JpdGluZyBvdXQgcmVzdWx0cy4nLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ2RlZmF1bHRzJywge1xuICAgICAgICBkZXNjcmliZTogJ0Rpc2FibGUgaW50ZXJhY3RpdmUgaW5wdXQgcHJvbXB0cyBmb3Igb3B0aW9ucyB3aXRoIGEgZGVmYXVsdC4nLFxuICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ2ZvcmNlJywge1xuICAgICAgICBkZXNjcmliZTogJ0ZvcmNlIG92ZXJ3cml0aW5nIG9mIGV4aXN0aW5nIGZpbGVzLicsXG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICB9KVxuICAgICAgLnN0cmljdCgpO1xuICB9XG5cbiAgLyoqIEdldCBzY2hlbWF0aWMgc2NoZW1hIG9wdGlvbnMuKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGdldFNjaGVtYXRpY09wdGlvbnMoXG4gICAgY29sbGVjdGlvbjogQ29sbGVjdGlvbjxGaWxlU3lzdGVtQ29sbGVjdGlvbkRlc2NyaXB0aW9uLCBGaWxlU3lzdGVtU2NoZW1hdGljRGVzY3JpcHRpb24+LFxuICAgIHNjaGVtYXRpY05hbWU6IHN0cmluZyxcbiAgICB3b3JrZmxvdzogTm9kZVdvcmtmbG93LFxuICApOiBQcm9taXNlPE9wdGlvbltdPiB7XG4gICAgY29uc3Qgc2NoZW1hdGljID0gY29sbGVjdGlvbi5jcmVhdGVTY2hlbWF0aWMoc2NoZW1hdGljTmFtZSwgdHJ1ZSk7XG4gICAgY29uc3QgeyBzY2hlbWFKc29uIH0gPSBzY2hlbWF0aWMuZGVzY3JpcHRpb247XG5cbiAgICBpZiAoIXNjaGVtYUpzb24pIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyc2VKc29uU2NoZW1hVG9PcHRpb25zKHdvcmtmbG93LnJlZ2lzdHJ5LCBzY2hlbWFKc29uKTtcbiAgfVxuXG4gIEBtZW1vaXplXG4gIHByb3RlY3RlZCBnZXRPckNyZWF0ZVdvcmtmbG93Rm9yQnVpbGRlcihjb2xsZWN0aW9uTmFtZTogc3RyaW5nKTogTm9kZVdvcmtmbG93IHtcbiAgICByZXR1cm4gbmV3IE5vZGVXb3JrZmxvdyh0aGlzLmNvbnRleHQucm9vdCwge1xuICAgICAgcmVzb2x2ZVBhdGhzOiB0aGlzLmdldFJlc29sdmVQYXRocyhjb2xsZWN0aW9uTmFtZSksXG4gICAgICBlbmdpbmVIb3N0Q3JlYXRvcjogKG9wdGlvbnMpID0+IG5ldyBTY2hlbWF0aWNFbmdpbmVIb3N0KG9wdGlvbnMucmVzb2x2ZVBhdGhzKSxcbiAgICB9KTtcbiAgfVxuXG4gIEBtZW1vaXplXG4gIHByb3RlY3RlZCBhc3luYyBnZXRPckNyZWF0ZVdvcmtmbG93Rm9yRXhlY3V0aW9uKFxuICAgIGNvbGxlY3Rpb25OYW1lOiBzdHJpbmcsXG4gICAgb3B0aW9uczogU2NoZW1hdGljc0V4ZWN1dGlvbk9wdGlvbnMsXG4gICk6IFByb21pc2U8Tm9kZVdvcmtmbG93PiB7XG4gICAgY29uc3QgeyBsb2dnZXIsIHJvb3QsIHBhY2thZ2VNYW5hZ2VyIH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgY29uc3QgeyBmb3JjZSwgZHJ5UnVuLCBwYWNrYWdlUmVnaXN0cnkgfSA9IG9wdGlvbnM7XG5cbiAgICBjb25zdCB3b3JrZmxvdyA9IG5ldyBOb2RlV29ya2Zsb3cocm9vdCwge1xuICAgICAgZm9yY2UsXG4gICAgICBkcnlSdW4sXG4gICAgICBwYWNrYWdlTWFuYWdlcjogcGFja2FnZU1hbmFnZXIubmFtZSxcbiAgICAgIC8vIEEgc2NoZW1hIHJlZ2lzdHJ5IGlzIHJlcXVpcmVkIHRvIGFsbG93IGN1c3RvbWl6aW5nIGFkZFVuZGVmaW5lZERlZmF1bHRzXG4gICAgICByZWdpc3RyeTogbmV3IHNjaGVtYS5Db3JlU2NoZW1hUmVnaXN0cnkoZm9ybWF0cy5zdGFuZGFyZEZvcm1hdHMpLFxuICAgICAgcGFja2FnZVJlZ2lzdHJ5LFxuICAgICAgcmVzb2x2ZVBhdGhzOiB0aGlzLmdldFJlc29sdmVQYXRocyhjb2xsZWN0aW9uTmFtZSksXG4gICAgICBzY2hlbWFWYWxpZGF0aW9uOiB0cnVlLFxuICAgICAgb3B0aW9uVHJhbnNmb3JtczogW1xuICAgICAgICAvLyBBZGQgY29uZmlndXJhdGlvbiBmaWxlIGRlZmF1bHRzXG4gICAgICAgIGFzeW5jIChzY2hlbWF0aWMsIGN1cnJlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBwcm9qZWN0TmFtZSA9XG4gICAgICAgICAgICB0eXBlb2YgY3VycmVudD8ucHJvamVjdCA9PT0gJ3N0cmluZycgPyBjdXJyZW50LnByb2plY3QgOiB0aGlzLmdldFByb2plY3ROYW1lKCk7XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uKGF3YWl0IGdldFNjaGVtYXRpY0RlZmF1bHRzKHNjaGVtYXRpYy5jb2xsZWN0aW9uLm5hbWUsIHNjaGVtYXRpYy5uYW1lLCBwcm9qZWN0TmFtZSkpLFxuICAgICAgICAgICAgLi4uY3VycmVudCxcbiAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGVuZ2luZUhvc3RDcmVhdG9yOiAob3B0aW9ucykgPT4gbmV3IFNjaGVtYXRpY0VuZ2luZUhvc3Qob3B0aW9ucy5yZXNvbHZlUGF0aHMpLFxuICAgIH0pO1xuXG4gICAgd29ya2Zsb3cucmVnaXN0cnkuYWRkUG9zdFRyYW5zZm9ybShzY2hlbWEudHJhbnNmb3Jtcy5hZGRVbmRlZmluZWREZWZhdWx0cyk7XG4gICAgd29ya2Zsb3cucmVnaXN0cnkudXNlWERlcHJlY2F0ZWRQcm92aWRlcigobXNnKSA9PiBsb2dnZXIud2Fybihtc2cpKTtcbiAgICB3b3JrZmxvdy5yZWdpc3RyeS5hZGRTbWFydERlZmF1bHRQcm92aWRlcigncHJvamVjdE5hbWUnLCAoKSA9PiB0aGlzLmdldFByb2plY3ROYW1lKCkpO1xuXG4gICAgY29uc3Qgd29ya2luZ0RpciA9IGRldmtpdE5vcm1hbGl6ZShyZWxhdGl2ZSh0aGlzLmNvbnRleHQucm9vdCwgcHJvY2Vzcy5jd2QoKSkpO1xuICAgIHdvcmtmbG93LnJlZ2lzdHJ5LmFkZFNtYXJ0RGVmYXVsdFByb3ZpZGVyKCd3b3JraW5nRGlyZWN0b3J5JywgKCkgPT5cbiAgICAgIHdvcmtpbmdEaXIgPT09ICcnID8gdW5kZWZpbmVkIDogd29ya2luZ0RpcixcbiAgICApO1xuXG4gICAgbGV0IHNob3VsZFJlcG9ydEFuYWx5dGljcyA9IHRydWU7XG4gICAgd29ya2Zsb3cuZW5naW5lSG9zdC5yZWdpc3Rlck9wdGlvbnNUcmFuc2Zvcm0oYXN5bmMgKHNjaGVtYXRpYywgb3B0aW9ucykgPT4ge1xuICAgICAgLy8gUmVwb3J0IGFuYWx5dGljc1xuICAgICAgaWYgKHNob3VsZFJlcG9ydEFuYWx5dGljcykge1xuICAgICAgICBzaG91bGRSZXBvcnRBbmFseXRpY3MgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgY29sbGVjdGlvbjogeyBuYW1lOiBjb2xsZWN0aW9uTmFtZSB9LFxuICAgICAgICAgIG5hbWU6IHNjaGVtYXRpY05hbWUsXG4gICAgICAgIH0gPSBzY2hlbWF0aWM7XG5cbiAgICAgICAgY29uc3QgYW5hbHl0aWNzID0gaXNQYWNrYWdlTmFtZVNhZmVGb3JBbmFseXRpY3MoY29sbGVjdGlvbk5hbWUpXG4gICAgICAgICAgPyBhd2FpdCB0aGlzLmdldEFuYWx5dGljcygpXG4gICAgICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgYW5hbHl0aWNzPy5yZXBvcnRTY2hlbWF0aWNSdW5FdmVudCh7XG4gICAgICAgICAgW0V2ZW50Q3VzdG9tRGltZW5zaW9uLlNjaGVtYXRpY0NvbGxlY3Rpb25OYW1lXTogY29sbGVjdGlvbk5hbWUsXG4gICAgICAgICAgW0V2ZW50Q3VzdG9tRGltZW5zaW9uLlNjaGVtYXRpY05hbWVdOiBzY2hlbWF0aWNOYW1lLFxuICAgICAgICAgIC4uLnRoaXMuZ2V0QW5hbHl0aWNzUGFyYW1ldGVycyhvcHRpb25zIGFzIHVua25vd24gYXMge30pLFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgfSk7XG5cbiAgICBpZiAob3B0aW9ucy5pbnRlcmFjdGl2ZSAhPT0gZmFsc2UgJiYgaXNUVFkoKSkge1xuICAgICAgd29ya2Zsb3cucmVnaXN0cnkudXNlUHJvbXB0UHJvdmlkZXIoYXN5bmMgKGRlZmluaXRpb25zOiBBcnJheTxzY2hlbWEuUHJvbXB0RGVmaW5pdGlvbj4pID0+IHtcbiAgICAgICAgY29uc3QgcXVlc3Rpb25zID0gZGVmaW5pdGlvbnNcbiAgICAgICAgICAuZmlsdGVyKChkZWZpbml0aW9uKSA9PiAhb3B0aW9ucy5kZWZhdWx0cyB8fCBkZWZpbml0aW9uLmRlZmF1bHQgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAubWFwKChkZWZpbml0aW9uKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBxdWVzdGlvbjogUXVlc3Rpb24gPSB7XG4gICAgICAgICAgICAgIG5hbWU6IGRlZmluaXRpb24uaWQsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6IGRlZmluaXRpb24ubWVzc2FnZSxcbiAgICAgICAgICAgICAgZGVmYXVsdDogZGVmaW5pdGlvbi5kZWZhdWx0LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdmFsaWRhdG9yID0gZGVmaW5pdGlvbi52YWxpZGF0b3I7XG4gICAgICAgICAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICAgICAgICAgIHF1ZXN0aW9uLnZhbGlkYXRlID0gKGlucHV0KSA9PiB2YWxpZGF0b3IoaW5wdXQpO1xuXG4gICAgICAgICAgICAgIC8vIEZpbHRlciBhbGxvd3MgdHJhbnNmb3JtYXRpb24gb2YgdGhlIHZhbHVlIHByaW9yIHRvIHZhbGlkYXRpb25cbiAgICAgICAgICAgICAgcXVlc3Rpb24uZmlsdGVyID0gYXN5bmMgKGlucHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0eXBlIG9mIGRlZmluaXRpb24ucHJvcGVydHlUeXBlcykge1xuICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBTdHJpbmcoaW5wdXQpO1xuICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdpbnRlZ2VyJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IE51bWJlcihpbnB1dCk7XG4gICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBpbnB1dDtcbiAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIC8vIENhbiBiZSBhIHN0cmluZyBpZiB2YWxpZGF0aW9uIGZhaWxzXG4gICAgICAgICAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gKGF3YWl0IHZhbGlkYXRvcih2YWx1ZSkpID09PSB0cnVlO1xuICAgICAgICAgICAgICAgICAgaWYgKGlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBpbnB1dDtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChkZWZpbml0aW9uLnR5cGUpIHtcbiAgICAgICAgICAgICAgY2FzZSAnY29uZmlybWF0aW9uJzpcbiAgICAgICAgICAgICAgICBxdWVzdGlvbi50eXBlID0gJ2NvbmZpcm0nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICdsaXN0JzpcbiAgICAgICAgICAgICAgICBxdWVzdGlvbi50eXBlID0gZGVmaW5pdGlvbi5tdWx0aXNlbGVjdCA/ICdjaGVja2JveCcgOiAnbGlzdCc7XG4gICAgICAgICAgICAgICAgKHF1ZXN0aW9uIGFzIENoZWNrYm94UXVlc3Rpb24pLmNob2ljZXMgPSBkZWZpbml0aW9uLml0ZW1zPy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgaXRlbSA9PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgICAgICA/IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLmxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGl0ZW0udmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBxdWVzdGlvbi50eXBlID0gZGVmaW5pdGlvbi50eXBlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcXVlc3Rpb247XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHF1ZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zdCB7IHByb21wdCB9ID0gYXdhaXQgaW1wb3J0KCdpbnF1aXJlcicpO1xuXG4gICAgICAgICAgcmV0dXJuIHByb21wdChxdWVzdGlvbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHdvcmtmbG93O1xuICB9XG5cbiAgQG1lbW9pemVcbiAgcHJvdGVjdGVkIGFzeW5jIGdldFNjaGVtYXRpY0NvbGxlY3Rpb25zKCk6IFByb21pc2U8U2V0PHN0cmluZz4+IHtcbiAgICAvLyBSZXNvbHZlIHJlbGF0aXZlIGNvbGxlY3Rpb25zIGZyb20gdGhlIGxvY2F0aW9uIG9mIGBhbmd1bGFyLmpzb25gXG4gICAgY29uc3QgcmVzb2x2ZVJlbGF0aXZlQ29sbGVjdGlvbiA9IChjb2xsZWN0aW9uTmFtZTogc3RyaW5nKSA9PlxuICAgICAgY29sbGVjdGlvbk5hbWUuY2hhckF0KDApID09PSAnLidcbiAgICAgICAgPyByZXNvbHZlKHRoaXMuY29udGV4dC5yb290LCBjb2xsZWN0aW9uTmFtZSlcbiAgICAgICAgOiBjb2xsZWN0aW9uTmFtZTtcblxuICAgIGNvbnN0IGdldFNjaGVtYXRpY0NvbGxlY3Rpb25zID0gKFxuICAgICAgY29uZmlnU2VjdGlvbjogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQsXG4gICAgKTogU2V0PHN0cmluZz4gfCB1bmRlZmluZWQgPT4ge1xuICAgICAgaWYgKCFjb25maWdTZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHsgc2NoZW1hdGljQ29sbGVjdGlvbnMsIGRlZmF1bHRDb2xsZWN0aW9uIH0gPSBjb25maWdTZWN0aW9uO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc2NoZW1hdGljQ29sbGVjdGlvbnMpKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2V0KHNjaGVtYXRpY0NvbGxlY3Rpb25zLm1hcCgoYykgPT4gcmVzb2x2ZVJlbGF0aXZlQ29sbGVjdGlvbihjKSkpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmYXVsdENvbGxlY3Rpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2V0KFtyZXNvbHZlUmVsYXRpdmVDb2xsZWN0aW9uKGRlZmF1bHRDb2xsZWN0aW9uKV0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG5cbiAgICBjb25zdCB7IHdvcmtzcGFjZSwgZ2xvYmFsQ29uZmlndXJhdGlvbiB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGlmICh3b3Jrc3BhY2UpIHtcbiAgICAgIGNvbnN0IHByb2plY3QgPSBnZXRQcm9qZWN0QnlDd2Qod29ya3NwYWNlKTtcbiAgICAgIGlmIChwcm9qZWN0KSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZ2V0U2NoZW1hdGljQ29sbGVjdGlvbnMod29ya3NwYWNlLmdldFByb2plY3RDbGkocHJvamVjdCkpO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZSA9XG4gICAgICBnZXRTY2hlbWF0aWNDb2xsZWN0aW9ucyh3b3Jrc3BhY2U/LmdldENsaSgpKSA/P1xuICAgICAgZ2V0U2NoZW1hdGljQ29sbGVjdGlvbnMoZ2xvYmFsQ29uZmlndXJhdGlvbi5nZXRDbGkoKSk7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBTZXQoW0RFRkFVTFRfU0NIRU1BVElDU19DT0xMRUNUSU9OXSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcGFyc2VTY2hlbWF0aWNJbmZvKFxuICAgIHNjaGVtYXRpYzogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICApOiBbY29sbGVjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCwgc2NoZW1hdGljTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkXSB7XG4gICAgaWYgKHNjaGVtYXRpYz8uaW5jbHVkZXMoJzonKSkge1xuICAgICAgY29uc3QgW2NvbGxlY3Rpb25OYW1lLCBzY2hlbWF0aWNOYW1lXSA9IHNjaGVtYXRpYy5zcGxpdCgnOicsIDIpO1xuXG4gICAgICByZXR1cm4gW2NvbGxlY3Rpb25OYW1lLCBzY2hlbWF0aWNOYW1lXTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3VuZGVmaW5lZCwgc2NoZW1hdGljXTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBydW5TY2hlbWF0aWMob3B0aW9uczoge1xuICAgIGV4ZWN1dGlvbk9wdGlvbnM6IFNjaGVtYXRpY3NFeGVjdXRpb25PcHRpb25zO1xuICAgIHNjaGVtYXRpY09wdGlvbnM6IE90aGVyT3B0aW9ucztcbiAgICBjb2xsZWN0aW9uTmFtZTogc3RyaW5nO1xuICAgIHNjaGVtYXRpY05hbWU6IHN0cmluZztcbiAgfSk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgeyBsb2dnZXIgfSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCB7IHNjaGVtYXRpY09wdGlvbnMsIGV4ZWN1dGlvbk9wdGlvbnMsIGNvbGxlY3Rpb25OYW1lLCBzY2hlbWF0aWNOYW1lIH0gPSBvcHRpb25zO1xuICAgIGNvbnN0IHdvcmtmbG93ID0gYXdhaXQgdGhpcy5nZXRPckNyZWF0ZVdvcmtmbG93Rm9yRXhlY3V0aW9uKGNvbGxlY3Rpb25OYW1lLCBleGVjdXRpb25PcHRpb25zKTtcblxuICAgIGlmICghc2NoZW1hdGljTmFtZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdzY2hlbWF0aWNOYW1lIGNhbm5vdCBiZSB1bmRlZmluZWQuJyk7XG4gICAgfVxuXG4gICAgY29uc3QgeyB1bnN1YnNjcmliZSwgZmlsZXMgfSA9IHN1YnNjcmliZVRvV29ya2Zsb3cod29ya2Zsb3csIGxvZ2dlcik7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgd29ya2Zsb3dcbiAgICAgICAgLmV4ZWN1dGUoe1xuICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb25OYW1lLFxuICAgICAgICAgIHNjaGVtYXRpYzogc2NoZW1hdGljTmFtZSxcbiAgICAgICAgICBvcHRpb25zOiBzY2hlbWF0aWNPcHRpb25zLFxuICAgICAgICAgIGxvZ2dlcixcbiAgICAgICAgICBhbGxvd1ByaXZhdGU6IHRoaXMuYWxsb3dQcml2YXRlU2NoZW1hdGljcyxcbiAgICAgICAgfSlcbiAgICAgICAgLnRvUHJvbWlzZSgpO1xuXG4gICAgICBpZiAoIWZpbGVzLnNpemUpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ05vdGhpbmcgdG8gYmUgZG9uZS4nKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4ZWN1dGlvbk9wdGlvbnMuZHJ5UnVuKSB7XG4gICAgICAgIGxvZ2dlci53YXJuKGBcXG5OT1RFOiBUaGUgXCItLWRyeS1ydW5cIiBvcHRpb24gbWVhbnMgbm8gY2hhbmdlcyB3ZXJlIG1hZGUuYCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBJbiBjYXNlIHRoZSB3b3JrZmxvdyB3YXMgbm90IHN1Y2Nlc3NmdWwsIHNob3cgYW4gYXBwcm9wcmlhdGUgZXJyb3IgbWVzc2FnZS5cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBVbnN1Y2Nlc3NmdWxXb3JrZmxvd0V4ZWN1dGlvbikge1xuICAgICAgICAvLyBcIlNlZSBhYm92ZVwiIGJlY2F1c2Ugd2UgYWxyZWFkeSBwcmludGVkIHRoZSBlcnJvci5cbiAgICAgICAgbG9nZ2VyLmZhdGFsKCdUaGUgU2NoZW1hdGljIHdvcmtmbG93IGZhaWxlZC4gU2VlIGFib3ZlLicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXNzZXJ0SXNFcnJvcihlcnIpO1xuICAgICAgICBsb2dnZXIuZmF0YWwoZXJyLm1lc3NhZ2UpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gMTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHByaXZhdGUgZGVmYXVsdFByb2plY3REZXByZWNhdGlvbldhcm5pbmdTaG93biA9IGZhbHNlO1xuICBwcml2YXRlIGdldFByb2plY3ROYW1lKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyB3b3Jrc3BhY2UsIGxvZ2dlciB9ID0gdGhpcy5jb250ZXh0O1xuICAgIGlmICghd29ya3NwYWNlKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IHByb2plY3ROYW1lID0gZ2V0UHJvamVjdEJ5Q3dkKHdvcmtzcGFjZSk7XG4gICAgaWYgKHByb2plY3ROYW1lKSB7XG4gICAgICByZXR1cm4gcHJvamVjdE5hbWU7XG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdFByb2plY3ROYW1lID0gd29ya3NwYWNlLmV4dGVuc2lvbnNbJ2RlZmF1bHRQcm9qZWN0J107XG4gICAgaWYgKHR5cGVvZiBkZWZhdWx0UHJvamVjdE5hbWUgPT09ICdzdHJpbmcnICYmIGRlZmF1bHRQcm9qZWN0TmFtZSkge1xuICAgICAgaWYgKCF0aGlzLmRlZmF1bHRQcm9qZWN0RGVwcmVjYXRpb25XYXJuaW5nU2hvd24pIHtcbiAgICAgICAgbG9nZ2VyLndhcm4odGFncy5vbmVMaW5lYFxuICAgICAgICAgICAgIERFUFJFQ0FURUQ6IFRoZSAnZGVmYXVsdFByb2plY3QnIHdvcmtzcGFjZSBvcHRpb24gaGFzIGJlZW4gZGVwcmVjYXRlZC5cbiAgICAgICAgICAgICBUaGUgcHJvamVjdCB0byB1c2Ugd2lsbCBiZSBkZXRlcm1pbmVkIGZyb20gdGhlIGN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnkuXG4gICAgICAgICAgIGApO1xuXG4gICAgICAgIHRoaXMuZGVmYXVsdFByb2plY3REZXByZWNhdGlvbldhcm5pbmdTaG93biA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZhdWx0UHJvamVjdE5hbWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmVzb2x2ZVBhdGhzKGNvbGxlY3Rpb25OYW1lOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgeyB3b3Jrc3BhY2UsIHJvb3QgfSA9IHRoaXMuY29udGV4dDtcblxuICAgIHJldHVybiB3b3Jrc3BhY2VcbiAgICAgID8gLy8gV29ya3NwYWNlXG4gICAgICAgIGNvbGxlY3Rpb25OYW1lID09PSBERUZBVUxUX1NDSEVNQVRJQ1NfQ09MTEVDVElPTlxuICAgICAgICA/IC8vIEZhdm9yIF9fZGlybmFtZSBmb3IgQHNjaGVtYXRpY3MvYW5ndWxhciB0byB1c2UgdGhlIGJ1aWxkLWluIHZlcnNpb25cbiAgICAgICAgICBbX19kaXJuYW1lLCBwcm9jZXNzLmN3ZCgpLCByb290XVxuICAgICAgICA6IFtwcm9jZXNzLmN3ZCgpLCByb290LCBfX2Rpcm5hbWVdXG4gICAgICA6IC8vIEdsb2JhbFxuICAgICAgICBbX19kaXJuYW1lLCBwcm9jZXNzLmN3ZCgpXTtcbiAgfVxufVxuIl19