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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceNodeModulesArchitectHost = void 0;
const path = __importStar(require("path"));
const url_1 = require("url");
const v8_1 = require("v8");
const internal_1 = require("../src/internal");
function clone(obj) {
    try {
        return (0, v8_1.deserialize)((0, v8_1.serialize)(obj));
    }
    catch (_a) {
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
                        ...clone(workspaceOrHost.extensions),
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
        const builder = await getBuilder(info.import);
        if (builder[internal_1.BuilderSymbol]) {
            return builder;
        }
        // Default handling code is for old builders that incorrectly export `default` with non-ESM module
        if (builder === null || builder === void 0 ? void 0 : builder.default[internal_1.BuilderSymbol]) {
            return builder.default;
        }
        throw new Error('Builder is not a builder');
    }
}
exports.WorkspaceNodeModulesArchitectHost = WorkspaceNodeModulesArchitectHost;
/**
 * This uses a dynamic import to load a module which may be ESM.
 * CommonJS code can load ESM code via a dynamic import. Unfortunately, TypeScript
 * will currently, unconditionally downlevel dynamic import into a require call.
 * require calls cannot load ESM code and will result in a runtime error. To workaround
 * this, a Function constructor is used to prevent TypeScript from changing the dynamic import.
 * Once TypeScript provides support for keeping the dynamic import this workaround can
 * be dropped.
 *
 * @param modulePath The path of the module to load.
 * @returns A Promise that resolves to the dynamically imported module.
 */
function loadEsmModule(modulePath) {
    return new Function('modulePath', `return import(modulePath);`)(modulePath);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getBuilder(builderPath) {
    switch (path.extname(builderPath)) {
        case '.mjs':
            // Load the ESM configuration file using the TypeScript dynamic import workaround.
            // Once TypeScript provides support for keeping the dynamic import this workaround can be
            // changed to a direct dynamic import.
            return (await loadEsmModule((0, url_1.pathToFileURL)(builderPath))).default;
        case '.cjs':
            return require(builderPath);
        default:
            // The file could be either CommonJS or ESM.
            // CommonJS is tried first then ESM if loading fails.
            try {
                return require(builderPath);
            }
            catch (e) {
                if (e.code === 'ERR_REQUIRE_ESM') {
                    // Load the ESM configuration file using the TypeScript dynamic import workaround.
                    // Once TypeScript provides support for keeping the dynamic import this workaround can be
                    // changed to a direct dynamic import.
                    return (await loadEsmModule((0, url_1.pathToFileURL)(builderPath))).default;
                }
                throw e;
            }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS1tb2R1bGVzLWFyY2hpdGVjdC1ob3N0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvYXJjaGl0ZWN0L25vZGUvbm9kZS1tb2R1bGVzLWFyY2hpdGVjdC1ob3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0gsMkNBQTZCO0FBQzdCLDZCQUF5QztBQUN6QywyQkFBNEM7QUFJNUMsOENBQXdFO0FBTXhFLFNBQVMsS0FBSyxDQUFDLEdBQVk7SUFDekIsSUFBSTtRQUNGLE9BQU8sSUFBQSxnQkFBVyxFQUFDLElBQUEsY0FBUyxFQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDcEM7SUFBQyxXQUFNO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUN4QztBQUNILENBQUM7QUFVRCxTQUFTLGlCQUFpQixDQUN4QixTQUF5QyxFQUN6QyxPQUFlLEVBQ2YsTUFBYztJQUVkLE1BQU0saUJBQWlCLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUQsSUFBSSxDQUFDLGlCQUFpQixFQUFFO1FBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxPQUFPLG1CQUFtQixDQUFDLENBQUM7S0FDekQ7SUFFRCxNQUFNLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0QsSUFBSSxDQUFDLGdCQUFnQixFQUFFO1FBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztLQUNuRDtJQUVELE9BQU8sZ0JBQWdCLENBQUM7QUFDMUIsQ0FBQztBQUVELE1BQWEsaUNBQWlDO0lBTzVDLFlBQ0Us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NEIsQ0FBQyxDQUFDLFVBQVUsQ0FBZSxDQUFDO0FBQzVGLENBQUM7QUFFRCw4REFBOEQ7QUFDOUQsS0FBSyxVQUFVLFVBQVUsQ0FBQyxXQUFtQjtJQUMzQyxRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDakMsS0FBSyxNQUFNO1lBQ1Qsa0ZBQWtGO1lBQ2xGLHlGQUF5RjtZQUN6RixzQ0FBc0M7WUFDdEMsT0FBTyxDQUFDLE1BQU0sYUFBYSxDQUF1QixJQUFBLG1CQUFhLEVBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUN6RixLQUFLLE1BQU07WUFDVCxPQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5QjtZQUNFLDRDQUE0QztZQUM1QyxxREFBcUQ7WUFDckQsSUFBSTtnQkFDRixPQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUM3QjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLElBQUssQ0FBMkIsQ0FBQyxJQUFJLEtBQUssaUJBQWlCLEVBQUU7b0JBQzNELGtGQUFrRjtvQkFDbEYseUZBQXlGO29CQUN6RixzQ0FBc0M7b0JBQ3RDLE9BQU8sQ0FBQyxNQUFNLGFBQWEsQ0FBdUIsSUFBQSxtQkFBYSxFQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7aUJBQ3hGO2dCQUVELE1BQU0sQ0FBQyxDQUFDO2FBQ1Q7S0FDSjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsganNvbiwgd29ya3NwYWNlcyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBVUkwsIHBhdGhUb0ZpbGVVUkwgfSBmcm9tICd1cmwnO1xuaW1wb3J0IHsgZGVzZXJpYWxpemUsIHNlcmlhbGl6ZSB9IGZyb20gJ3Y4JztcbmltcG9ydCB7IEJ1aWxkZXJJbmZvIH0gZnJvbSAnLi4vc3JjJztcbmltcG9ydCB7IFNjaGVtYSBhcyBCdWlsZGVyU2NoZW1hIH0gZnJvbSAnLi4vc3JjL2J1aWxkZXJzLXNjaGVtYSc7XG5pbXBvcnQgeyBUYXJnZXQgfSBmcm9tICcuLi9zcmMvaW5wdXQtc2NoZW1hJztcbmltcG9ydCB7IEFyY2hpdGVjdEhvc3QsIEJ1aWxkZXIsIEJ1aWxkZXJTeW1ib2wgfSBmcm9tICcuLi9zcmMvaW50ZXJuYWwnO1xuXG5leHBvcnQgdHlwZSBOb2RlTW9kdWxlc0J1aWxkZXJJbmZvID0gQnVpbGRlckluZm8gJiB7XG4gIGltcG9ydDogc3RyaW5nO1xufTtcblxuZnVuY3Rpb24gY2xvbmUob2JqOiB1bmtub3duKTogdW5rbm93biB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlc2VyaWFsaXplKHNlcmlhbGl6ZShvYmopKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBXb3Jrc3BhY2VIb3N0IHtcbiAgZ2V0QnVpbGRlck5hbWUocHJvamVjdDogc3RyaW5nLCB0YXJnZXQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPjtcbiAgZ2V0TWV0YWRhdGEocHJvamVjdDogc3RyaW5nKTogUHJvbWlzZTxqc29uLkpzb25PYmplY3Q+O1xuICBnZXRPcHRpb25zKHByb2plY3Q6IHN0cmluZywgdGFyZ2V0OiBzdHJpbmcsIGNvbmZpZ3VyYXRpb24/OiBzdHJpbmcpOiBQcm9taXNlPGpzb24uSnNvbk9iamVjdD47XG4gIGhhc1RhcmdldChwcm9qZWN0OiBzdHJpbmcsIHRhcmdldDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPjtcbiAgZ2V0RGVmYXVsdENvbmZpZ3VyYXRpb25OYW1lKHByb2plY3Q6IHN0cmluZywgdGFyZ2V0OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD47XG59XG5cbmZ1bmN0aW9uIGZpbmRQcm9qZWN0VGFyZ2V0KFxuICB3b3Jrc3BhY2U6IHdvcmtzcGFjZXMuV29ya3NwYWNlRGVmaW5pdGlvbixcbiAgcHJvamVjdDogc3RyaW5nLFxuICB0YXJnZXQ6IHN0cmluZyxcbik6IHdvcmtzcGFjZXMuVGFyZ2V0RGVmaW5pdGlvbiB7XG4gIGNvbnN0IHByb2plY3REZWZpbml0aW9uID0gd29ya3NwYWNlLnByb2plY3RzLmdldChwcm9qZWN0KTtcbiAgaWYgKCFwcm9qZWN0RGVmaW5pdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgUHJvamVjdCBcIiR7cHJvamVjdH1cIiBkb2VzIG5vdCBleGlzdC5gKTtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldERlZmluaXRpb24gPSBwcm9qZWN0RGVmaW5pdGlvbi50YXJnZXRzLmdldCh0YXJnZXQpO1xuICBpZiAoIXRhcmdldERlZmluaXRpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb2plY3QgdGFyZ2V0IGRvZXMgbm90IGV4aXN0LicpO1xuICB9XG5cbiAgcmV0dXJuIHRhcmdldERlZmluaXRpb247XG59XG5cbmV4cG9ydCBjbGFzcyBXb3Jrc3BhY2VOb2RlTW9kdWxlc0FyY2hpdGVjdEhvc3QgaW1wbGVtZW50cyBBcmNoaXRlY3RIb3N0PE5vZGVNb2R1bGVzQnVpbGRlckluZm8+IHtcbiAgcHJpdmF0ZSB3b3Jrc3BhY2VIb3N0OiBXb3Jrc3BhY2VIb3N0O1xuXG4gIGNvbnN0cnVjdG9yKHdvcmtzcGFjZUhvc3Q6IFdvcmtzcGFjZUhvc3QsIF9yb290OiBzdHJpbmcpO1xuXG4gIGNvbnN0cnVjdG9yKHdvcmtzcGFjZTogd29ya3NwYWNlcy5Xb3Jrc3BhY2VEZWZpbml0aW9uLCBfcm9vdDogc3RyaW5nKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICB3b3Jrc3BhY2VPckhvc3Q6IHdvcmtzcGFjZXMuV29ya3NwYWNlRGVmaW5pdGlvbiB8IFdvcmtzcGFjZUhvc3QsXG4gICAgcHJvdGVjdGVkIF9yb290OiBzdHJpbmcsXG4gICkge1xuICAgIGlmICgnZ2V0QnVpbGRlck5hbWUnIGluIHdvcmtzcGFjZU9ySG9zdCkge1xuICAgICAgdGhpcy53b3Jrc3BhY2VIb3N0ID0gd29ya3NwYWNlT3JIb3N0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLndvcmtzcGFjZUhvc3QgPSB7XG4gICAgICAgIGFzeW5jIGdldEJ1aWxkZXJOYW1lKHByb2plY3QsIHRhcmdldCkge1xuICAgICAgICAgIGNvbnN0IHRhcmdldERlZmluaXRpb24gPSBmaW5kUHJvamVjdFRhcmdldCh3b3Jrc3BhY2VPckhvc3QsIHByb2plY3QsIHRhcmdldCk7XG5cbiAgICAgICAgICByZXR1cm4gdGFyZ2V0RGVmaW5pdGlvbi5idWlsZGVyO1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyBnZXRPcHRpb25zKHByb2plY3QsIHRhcmdldCwgY29uZmlndXJhdGlvbikge1xuICAgICAgICAgIGNvbnN0IHRhcmdldERlZmluaXRpb24gPSBmaW5kUHJvamVjdFRhcmdldCh3b3Jrc3BhY2VPckhvc3QsIHByb2plY3QsIHRhcmdldCk7XG5cbiAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gKHRhcmdldERlZmluaXRpb24ub3B0aW9ucyA/PyB7fSkgYXMganNvbi5Kc29uT2JqZWN0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghdGFyZ2V0RGVmaW5pdGlvbi5jb25maWd1cmF0aW9ucz8uW2NvbmZpZ3VyYXRpb25dKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbmZpZ3VyYXRpb24gJyR7Y29uZmlndXJhdGlvbn0nIGlzIG5vdCBzZXQgaW4gdGhlIHdvcmtzcGFjZS5gKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gKHRhcmdldERlZmluaXRpb24uY29uZmlndXJhdGlvbnM/Lltjb25maWd1cmF0aW9uXSA/PyB7fSkgYXMganNvbi5Kc29uT2JqZWN0O1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyBnZXRNZXRhZGF0YShwcm9qZWN0KSB7XG4gICAgICAgICAgY29uc3QgcHJvamVjdERlZmluaXRpb24gPSB3b3Jrc3BhY2VPckhvc3QucHJvamVjdHMuZ2V0KHByb2plY3QpO1xuICAgICAgICAgIGlmICghcHJvamVjdERlZmluaXRpb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvamVjdCBcIiR7cHJvamVjdH1cIiBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcm9vdDogcHJvamVjdERlZmluaXRpb24ucm9vdCxcbiAgICAgICAgICAgIHNvdXJjZVJvb3Q6IHByb2plY3REZWZpbml0aW9uLnNvdXJjZVJvb3QsXG4gICAgICAgICAgICBwcmVmaXg6IHByb2plY3REZWZpbml0aW9uLnByZWZpeCxcbiAgICAgICAgICAgIC4uLihjbG9uZSh3b3Jrc3BhY2VPckhvc3QuZXh0ZW5zaW9ucykgYXMge30pLFxuICAgICAgICAgICAgLi4uKGNsb25lKHByb2plY3REZWZpbml0aW9uLmV4dGVuc2lvbnMpIGFzIHt9KSxcbiAgICAgICAgICB9IGFzIHVua25vd24gYXMganNvbi5Kc29uT2JqZWN0O1xuICAgICAgICB9LFxuICAgICAgICBhc3luYyBoYXNUYXJnZXQocHJvamVjdCwgdGFyZ2V0KSB7XG4gICAgICAgICAgcmV0dXJuICEhd29ya3NwYWNlT3JIb3N0LnByb2plY3RzLmdldChwcm9qZWN0KT8udGFyZ2V0cy5oYXModGFyZ2V0KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgZ2V0RGVmYXVsdENvbmZpZ3VyYXRpb25OYW1lKHByb2plY3QsIHRhcmdldCkge1xuICAgICAgICAgIHJldHVybiB3b3Jrc3BhY2VPckhvc3QucHJvamVjdHMuZ2V0KHByb2plY3QpPy50YXJnZXRzLmdldCh0YXJnZXQpPy5kZWZhdWx0Q29uZmlndXJhdGlvbjtcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0QnVpbGRlck5hbWVGb3JUYXJnZXQodGFyZ2V0OiBUYXJnZXQpIHtcbiAgICByZXR1cm4gdGhpcy53b3Jrc3BhY2VIb3N0LmdldEJ1aWxkZXJOYW1lKHRhcmdldC5wcm9qZWN0LCB0YXJnZXQudGFyZ2V0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIGEgYnVpbGRlci4gVGhpcyBuZWVkcyB0byBiZSBhIHN0cmluZyB3aGljaCB3aWxsIGJlIHVzZWQgaW4gYSBkeW5hbWljIGBpbXBvcnQoKWBcbiAgICogY2xhdXNlLiBUaGlzIHNob3VsZCB0aHJvdyBpZiBubyBidWlsZGVyIGNhbiBiZSBmb3VuZC4gVGhlIGR5bmFtaWMgaW1wb3J0IHdpbGwgdGhyb3cgaWZcbiAgICogaXQgaXMgdW5zdXBwb3J0ZWQuXG4gICAqIEBwYXJhbSBidWlsZGVyU3RyIFRoZSBuYW1lIG9mIHRoZSBidWlsZGVyIHRvIGJlIHVzZWQuXG4gICAqIEByZXR1cm5zIEFsbCB0aGUgaW5mbyBuZWVkZWQgZm9yIHRoZSBidWlsZGVyIGl0c2VsZi5cbiAgICovXG4gIHJlc29sdmVCdWlsZGVyKGJ1aWxkZXJTdHI6IHN0cmluZyk6IFByb21pc2U8Tm9kZU1vZHVsZXNCdWlsZGVySW5mbz4ge1xuICAgIGNvbnN0IFtwYWNrYWdlTmFtZSwgYnVpbGRlck5hbWVdID0gYnVpbGRlclN0ci5zcGxpdCgnOicsIDIpO1xuICAgIGlmICghYnVpbGRlck5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gYnVpbGRlciBuYW1lIHNwZWNpZmllZC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSByZXF1aXJlLnJlc29sdmUocGFja2FnZU5hbWUgKyAnL3BhY2thZ2UuanNvbicsIHtcbiAgICAgIHBhdGhzOiBbdGhpcy5fcm9vdF0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBwYWNrYWdlSnNvbiA9IHJlcXVpcmUocGFja2FnZUpzb25QYXRoKTtcbiAgICBpZiAoIXBhY2thZ2VKc29uWydidWlsZGVycyddKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFBhY2thZ2UgJHtKU09OLnN0cmluZ2lmeShwYWNrYWdlTmFtZSl9IGhhcyBubyBidWlsZGVycyBkZWZpbmVkLmApO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1aWxkZXJKc29uUGF0aCA9IHBhdGgucmVzb2x2ZShwYXRoLmRpcm5hbWUocGFja2FnZUpzb25QYXRoKSwgcGFja2FnZUpzb25bJ2J1aWxkZXJzJ10pO1xuICAgIGNvbnN0IGJ1aWxkZXJKc29uID0gcmVxdWlyZShidWlsZGVySnNvblBhdGgpIGFzIEJ1aWxkZXJTY2hlbWE7XG5cbiAgICBjb25zdCBidWlsZGVyID0gYnVpbGRlckpzb24uYnVpbGRlcnMgJiYgYnVpbGRlckpzb24uYnVpbGRlcnNbYnVpbGRlck5hbWVdO1xuXG4gICAgaWYgKCFidWlsZGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kIGJ1aWxkZXIgJHtKU09OLnN0cmluZ2lmeShidWlsZGVyU3RyKX0uYCk7XG4gICAgfVxuXG4gICAgY29uc3QgaW1wb3J0UGF0aCA9IGJ1aWxkZXIuaW1wbGVtZW50YXRpb247XG4gICAgaWYgKCFpbXBvcnRQYXRoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIHRoZSBpbXBsZW1lbnRhdGlvbiBmb3IgYnVpbGRlciAnICsgYnVpbGRlclN0cik7XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICBuYW1lOiBidWlsZGVyU3RyLFxuICAgICAgYnVpbGRlck5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogYnVpbGRlclsnZGVzY3JpcHRpb24nXSxcbiAgICAgIG9wdGlvblNjaGVtYTogcmVxdWlyZShwYXRoLnJlc29sdmUocGF0aC5kaXJuYW1lKGJ1aWxkZXJKc29uUGF0aCksIGJ1aWxkZXIuc2NoZW1hKSksXG4gICAgICBpbXBvcnQ6IHBhdGgucmVzb2x2ZShwYXRoLmRpcm5hbWUoYnVpbGRlckpzb25QYXRoKSwgaW1wb3J0UGF0aCksXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBnZXRDdXJyZW50RGlyZWN0b3J5KCkge1xuICAgIHJldHVybiBwcm9jZXNzLmN3ZCgpO1xuICB9XG5cbiAgYXN5bmMgZ2V0V29ya3NwYWNlUm9vdCgpIHtcbiAgICByZXR1cm4gdGhpcy5fcm9vdDtcbiAgfVxuXG4gIGFzeW5jIGdldE9wdGlvbnNGb3JUYXJnZXQodGFyZ2V0OiBUYXJnZXQpOiBQcm9taXNlPGpzb24uSnNvbk9iamVjdCB8IG51bGw+IHtcbiAgICBpZiAoIShhd2FpdCB0aGlzLndvcmtzcGFjZUhvc3QuaGFzVGFyZ2V0KHRhcmdldC5wcm9qZWN0LCB0YXJnZXQudGFyZ2V0KSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBvcHRpb25zID0gYXdhaXQgdGhpcy53b3Jrc3BhY2VIb3N0LmdldE9wdGlvbnModGFyZ2V0LnByb2plY3QsIHRhcmdldC50YXJnZXQpO1xuICAgIGNvbnN0IHRhcmdldENvbmZpZ3VyYXRpb24gPVxuICAgICAgdGFyZ2V0LmNvbmZpZ3VyYXRpb24gfHxcbiAgICAgIChhd2FpdCB0aGlzLndvcmtzcGFjZUhvc3QuZ2V0RGVmYXVsdENvbmZpZ3VyYXRpb25OYW1lKHRhcmdldC5wcm9qZWN0LCB0YXJnZXQudGFyZ2V0KSk7XG5cbiAgICBpZiAodGFyZ2V0Q29uZmlndXJhdGlvbikge1xuICAgICAgY29uc3QgY29uZmlndXJhdGlvbnMgPSB0YXJnZXRDb25maWd1cmF0aW9uLnNwbGl0KCcsJykubWFwKChjKSA9PiBjLnRyaW0oKSk7XG4gICAgICBmb3IgKGNvbnN0IGNvbmZpZ3VyYXRpb24gb2YgY29uZmlndXJhdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgIC4uLihhd2FpdCB0aGlzLndvcmtzcGFjZUhvc3QuZ2V0T3B0aW9ucyh0YXJnZXQucHJvamVjdCwgdGFyZ2V0LnRhcmdldCwgY29uZmlndXJhdGlvbikpLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjbG9uZShvcHRpb25zKSBhcyBqc29uLkpzb25PYmplY3Q7XG4gIH1cblxuICBhc3luYyBnZXRQcm9qZWN0TWV0YWRhdGEodGFyZ2V0OiBUYXJnZXQgfCBzdHJpbmcpOiBQcm9taXNlPGpzb24uSnNvbk9iamVjdCB8IG51bGw+IHtcbiAgICBjb25zdCBwcm9qZWN0TmFtZSA9IHR5cGVvZiB0YXJnZXQgPT09ICdzdHJpbmcnID8gdGFyZ2V0IDogdGFyZ2V0LnByb2plY3Q7XG4gICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLndvcmtzcGFjZUhvc3QuZ2V0TWV0YWRhdGEocHJvamVjdE5hbWUpO1xuXG4gICAgcmV0dXJuIG1ldGFkYXRhO1xuICB9XG5cbiAgYXN5bmMgbG9hZEJ1aWxkZXIoaW5mbzogTm9kZU1vZHVsZXNCdWlsZGVySW5mbyk6IFByb21pc2U8QnVpbGRlcj4ge1xuICAgIGNvbnN0IGJ1aWxkZXIgPSBhd2FpdCBnZXRCdWlsZGVyKGluZm8uaW1wb3J0KTtcblxuICAgIGlmIChidWlsZGVyW0J1aWxkZXJTeW1ib2xdKSB7XG4gICAgICByZXR1cm4gYnVpbGRlcjtcbiAgICB9XG5cbiAgICAvLyBEZWZhdWx0IGhhbmRsaW5nIGNvZGUgaXMgZm9yIG9sZCBidWlsZGVycyB0aGF0IGluY29ycmVjdGx5IGV4cG9ydCBgZGVmYXVsdGAgd2l0aCBub24tRVNNIG1vZHVsZVxuICAgIGlmIChidWlsZGVyPy5kZWZhdWx0W0J1aWxkZXJTeW1ib2xdKSB7XG4gICAgICByZXR1cm4gYnVpbGRlci5kZWZhdWx0O1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignQnVpbGRlciBpcyBub3QgYSBidWlsZGVyJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGlzIHVzZXMgYSBkeW5hbWljIGltcG9ydCB0byBsb2FkIGEgbW9kdWxlIHdoaWNoIG1heSBiZSBFU00uXG4gKiBDb21tb25KUyBjb2RlIGNhbiBsb2FkIEVTTSBjb2RlIHZpYSBhIGR5bmFtaWMgaW1wb3J0LiBVbmZvcnR1bmF0ZWx5LCBUeXBlU2NyaXB0XG4gKiB3aWxsIGN1cnJlbnRseSwgdW5jb25kaXRpb25hbGx5IGRvd25sZXZlbCBkeW5hbWljIGltcG9ydCBpbnRvIGEgcmVxdWlyZSBjYWxsLlxuICogcmVxdWlyZSBjYWxscyBjYW5ub3QgbG9hZCBFU00gY29kZSBhbmQgd2lsbCByZXN1bHQgaW4gYSBydW50aW1lIGVycm9yLiBUbyB3b3JrYXJvdW5kXG4gKiB0aGlzLCBhIEZ1bmN0aW9uIGNvbnN0cnVjdG9yIGlzIHVzZWQgdG8gcHJldmVudCBUeXBlU2NyaXB0IGZyb20gY2hhbmdpbmcgdGhlIGR5bmFtaWMgaW1wb3J0LlxuICogT25jZSBUeXBlU2NyaXB0IHByb3ZpZGVzIHN1cHBvcnQgZm9yIGtlZXBpbmcgdGhlIGR5bmFtaWMgaW1wb3J0IHRoaXMgd29ya2Fyb3VuZCBjYW5cbiAqIGJlIGRyb3BwZWQuXG4gKlxuICogQHBhcmFtIG1vZHVsZVBhdGggVGhlIHBhdGggb2YgdGhlIG1vZHVsZSB0byBsb2FkLlxuICogQHJldHVybnMgQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGR5bmFtaWNhbGx5IGltcG9ydGVkIG1vZHVsZS5cbiAqL1xuZnVuY3Rpb24gbG9hZEVzbU1vZHVsZTxUPihtb2R1bGVQYXRoOiBzdHJpbmcgfCBVUkwpOiBQcm9taXNlPFQ+IHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbignbW9kdWxlUGF0aCcsIGByZXR1cm4gaW1wb3J0KG1vZHVsZVBhdGgpO2ApKG1vZHVsZVBhdGgpIGFzIFByb21pc2U8VD47XG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG5hc3luYyBmdW5jdGlvbiBnZXRCdWlsZGVyKGJ1aWxkZXJQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICBzd2l0Y2ggKHBhdGguZXh0bmFtZShidWlsZGVyUGF0aCkpIHtcbiAgICBjYXNlICcubWpzJzpcbiAgICAgIC8vIExvYWQgdGhlIEVTTSBjb25maWd1cmF0aW9uIGZpbGUgdXNpbmcgdGhlIFR5cGVTY3JpcHQgZHluYW1pYyBpbXBvcnQgd29ya2Fyb3VuZC5cbiAgICAgIC8vIE9uY2UgVHlwZVNjcmlwdCBwcm92aWRlcyBzdXBwb3J0IGZvciBrZWVwaW5nIHRoZSBkeW5hbWljIGltcG9ydCB0aGlzIHdvcmthcm91bmQgY2FuIGJlXG4gICAgICAvLyBjaGFuZ2VkIHRvIGEgZGlyZWN0IGR5bmFtaWMgaW1wb3J0LlxuICAgICAgcmV0dXJuIChhd2FpdCBsb2FkRXNtTW9kdWxlPHsgZGVmYXVsdDogdW5rbm93biB9PihwYXRoVG9GaWxlVVJMKGJ1aWxkZXJQYXRoKSkpLmRlZmF1bHQ7XG4gICAgY2FzZSAnLmNqcyc6XG4gICAgICByZXR1cm4gcmVxdWlyZShidWlsZGVyUGF0aCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIFRoZSBmaWxlIGNvdWxkIGJlIGVpdGhlciBDb21tb25KUyBvciBFU00uXG4gICAgICAvLyBDb21tb25KUyBpcyB0cmllZCBmaXJzdCB0aGVuIEVTTSBpZiBsb2FkaW5nIGZhaWxzLlxuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHJlcXVpcmUoYnVpbGRlclBhdGgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoKGUgYXMgTm9kZUpTLkVycm5vRXhjZXB0aW9uKS5jb2RlID09PSAnRVJSX1JFUVVJUkVfRVNNJykge1xuICAgICAgICAgIC8vIExvYWQgdGhlIEVTTSBjb25maWd1cmF0aW9uIGZpbGUgdXNpbmcgdGhlIFR5cGVTY3JpcHQgZHluYW1pYyBpbXBvcnQgd29ya2Fyb3VuZC5cbiAgICAgICAgICAvLyBPbmNlIFR5cGVTY3JpcHQgcHJvdmlkZXMgc3VwcG9ydCBmb3Iga2VlcGluZyB0aGUgZHluYW1pYyBpbXBvcnQgdGhpcyB3b3JrYXJvdW5kIGNhbiBiZVxuICAgICAgICAgIC8vIGNoYW5nZWQgdG8gYSBkaXJlY3QgZHluYW1pYyBpbXBvcnQuXG4gICAgICAgICAgcmV0dXJuIChhd2FpdCBsb2FkRXNtTW9kdWxlPHsgZGVmYXVsdDogdW5rbm93biB9PihwYXRoVG9GaWxlVVJMKGJ1aWxkZXJQYXRoKSkpLmRlZmF1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICB9XG59XG4iXX0=