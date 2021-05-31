"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceNodeModulesArchitectHost = void 0;
const path = require("path");
const v8_1 = require("v8");
const internal_1 = require("../src/internal");
function clone(obj) {
    try {
        return v8_1.deserialize(v8_1.serialize(obj));
    }
    catch {
        return JSON.parse(JSON.stringify(obj));
    }
}
function findProjectTarget(workspace, project, target) {
    const projectDefinition = workspace.projects.get(project);
    if (!projectDefinition) {
        throw new Error(`Project "${project}" does not exist.`);
    }
    const targetDefinition = projectDefinition.targets.get(target);
    if (!targetDefinition) {
        throw new Error('Project target does not exist.');
    }
    return targetDefinition;
}
class WorkspaceNodeModulesArchitectHost {
    constructor(workspaceOrHost, _root) {
        this._root = _root;
        if ('getBuilderName' in workspaceOrHost) {
            this.workspaceHost = workspaceOrHost;
        }
        else {
            this.workspaceHost = {
                async getBuilderName(project, target) {
                    const targetDefinition = findProjectTarget(workspaceOrHost, project, target);
                    return targetDefinition.builder;
                },
                async getOptions(project, target, configuration) {
                    var _a, _b, _c, _d;
                    const targetDefinition = findProjectTarget(workspaceOrHost, project, target);
                    if (configuration === undefined) {
                        return ((_a = targetDefinition.options) !== null && _a !== void 0 ? _a : {});
                    }
                    if (!((_b = targetDefinition.configurations) === null || _b === void 0 ? void 0 : _b[configuration])) {
                        throw new Error(`Configuration '${configuration}' is not set in the workspace.`);
                    }
                    return ((_d = (_c = targetDefinition.configurations) === null || _c === void 0 ? void 0 : _c[configuration]) !== null && _d !== void 0 ? _d : {});
                },
                async getMetadata(project) {
                    const projectDefinition = workspaceOrHost.projects.get(project);
                    if (!projectDefinition) {
                        throw new Error(`Project "${project}" does not exist.`);
                    }
                    return {
                        root: projectDefinition.root,
                        sourceRoot: projectDefinition.sourceRoot,
                        prefix: projectDefinition.prefix,
                        ...clone(projectDefinition.extensions),
                    };
                },
                async hasTarget(project, target) {
                    var _a;
                    return !!((_a = workspaceOrHost.projects.get(project)) === null || _a === void 0 ? void 0 : _a.targets.has(target));
                },
                async getDefaultConfigurationName(project, target) {
                    var _a, _b;
                    return (_b = (_a = workspaceOrHost.projects.get(project)) === null || _a === void 0 ? void 0 : _a.targets.get(target)) === null || _b === void 0 ? void 0 : _b.defaultConfiguration;
                },
            };
        }
    }
    async getBuilderNameForTarget(target) {
        return this.workspaceHost.getBuilderName(target.project, target.target);
    }
    /**
     * Resolve a builder. This needs to be a string which will be used in a dynamic `import()`
     * clause. This should throw if no builder can be found. The dynamic import will throw if
     * it is unsupported.
     * @param builderStr The name of the builder to be used.
     * @returns All the info needed for the builder itself.
     */
    resolveBuilder(builderStr) {
        const [packageName, builderName] = builderStr.split(':', 2);
        if (!builderName) {
            throw new Error('No builder name specified.');
        }
        const packageJsonPath = require.resolve(packageName + '/package.json', {
            paths: [this._root],
        });
        const packageJson = require(packageJsonPath);
        if (!packageJson['builders']) {
            throw new Error(`Package ${JSON.stringify(packageName)} has no builders defined.`);
        }
        const builderJsonPath = path.resolve(path.dirname(packageJsonPath), packageJson['builders']);
        const builderJson = require(builderJsonPath);
        const builder = builderJson.builders && builderJson.builders[builderName];
        if (!builder) {
            throw new Error(`Cannot find builder ${JSON.stringify(builderStr)}.`);
        }
        const importPath = builder.implementation;
        if (!importPath) {
            throw new Error('Could not find the implementation for builder ' + builderStr);
        }
        return Promise.resolve({
            name: builderStr,
            builderName,
            description: builder['description'],
            optionSchema: require(path.resolve(path.dirname(builderJsonPath), builder.schema)),
            import: path.resolve(path.dirname(builderJsonPath), importPath),
        });
    }
    async getCurrentDirectory() {
        return process.cwd();
    }
    async getWorkspaceRoot() {
        return this._root;
    }
    async getOptionsForTarget(target) {
        if (!(await this.workspaceHost.hasTarget(target.project, target.target))) {
            return null;
        }
        let options = await this.workspaceHost.getOptions(target.project, target.target);
        const targetConfiguration = target.configuration ||
            (await this.workspaceHost.getDefaultConfigurationName(target.project, target.target));
        if (targetConfiguration) {
            const configurations = targetConfiguration.split(',').map((c) => c.trim());
            for (const configuration of configurations) {
                options = {
                    ...options,
                    ...(await this.workspaceHost.getOptions(target.project, target.target, configuration)),
                };
            }
        }
        return clone(options);
    }
    async getProjectMetadata(target) {
        const projectName = typeof target === 'string' ? target : target.project;
        const metadata = this.workspaceHost.getMetadata(projectName);
        return metadata;
    }
    async loadBuilder(info) {
        const builder = (await Promise.resolve().then(() => require(info.import))).default;
        if (builder[internal_1.BuilderSymbol]) {
            return builder;
        }
        throw new Error('Builder is not a builder');
    }
}
exports.WorkspaceNodeModulesArchitectHost = WorkspaceNodeModulesArchitectHost;
