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
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const tasks_1 = require("@angular-devkit/schematics/tasks");
const ts = __importStar(require("../third_party/github.com/Microsoft/TypeScript/lib/typescript"));
const ast_utils_1 = require("../utility/ast-utils");
const dependencies_1 = require("../utility/dependencies");
const latest_versions_1 = require("../utility/latest-versions");
const ng_ast_utils_1 = require("../utility/ng-ast-utils");
const paths_1 = require("../utility/paths");
const project_targets_1 = require("../utility/project-targets");
const workspace_1 = require("../utility/workspace");
const workspace_models_1 = require("../utility/workspace-models");
function updateConfigFile(options, tsConfigDirectory) {
    return (0, workspace_1.updateWorkspace)((workspace) => {
        var _a;
        const clientProject = workspace.projects.get(options.project);
        if (clientProject) {
            // In case the browser builder hashes the assets
            // we need to add this setting to the server builder
            // as otherwise when assets it will be requested twice.
            // One for the server which will be unhashed, and other on the client which will be hashed.
            const getServerOptions = (options = {}) => {
                return {
                    outputHashing: (options === null || options === void 0 ? void 0 : options.outputHashing) === 'all' ? 'media' : options === null || options === void 0 ? void 0 : options.outputHashing,
                    fileReplacements: options === null || options === void 0 ? void 0 : options.fileReplacements,
                    optimization: (options === null || options === void 0 ? void 0 : options.optimization) === undefined ? undefined : !!(options === null || options === void 0 ? void 0 : options.optimization),
                    sourceMap: options === null || options === void 0 ? void 0 : options.sourceMap,
                    localization: options === null || options === void 0 ? void 0 : options.localization,
                    stylePreprocessorOptions: options === null || options === void 0 ? void 0 : options.stylePreprocessorOptions,
                    resourcesOutputPath: options === null || options === void 0 ? void 0 : options.resourcesOutputPath,
                    deployUrl: options === null || options === void 0 ? void 0 : options.deployUrl,
                    i18nMissingTranslation: options === null || options === void 0 ? void 0 : options.i18nMissingTranslation,
                    preserveSymlinks: options === null || options === void 0 ? void 0 : options.preserveSymlinks,
                    extractLicenses: options === null || options === void 0 ? void 0 : options.extractLicenses,
                    inlineStyleLanguage: options === null || options === void 0 ? void 0 : options.inlineStyleLanguage,
                    vendorChunk: options === null || options === void 0 ? void 0 : options.vendorChunk,
                };
            };
            const buildTarget = clientProject.targets.get('build');
            if (buildTarget === null || buildTarget === void 0 ? void 0 : buildTarget.options) {
                buildTarget.options.outputPath = `dist/${options.project}/browser`;
            }
            const buildConfigurations = buildTarget === null || buildTarget === void 0 ? void 0 : buildTarget.configurations;
            const configurations = {};
            if (buildConfigurations) {
                for (const [key, options] of Object.entries(buildConfigurations)) {
                    configurations[key] = getServerOptions(options);
                }
            }
            const mainPath = options.main;
            const sourceRoot = (_a = clientProject.sourceRoot) !== null && _a !== void 0 ? _a : (0, core_1.join)((0, core_1.normalize)(clientProject.root), 'src');
            const serverTsConfig = (0, core_1.join)(tsConfigDirectory, 'tsconfig.server.json');
            clientProject.targets.add({
                name: 'server',
                builder: workspace_models_1.Builders.Server,
                defaultConfiguration: 'production',
                options: {
                    outputPath: `dist/${options.project}/server`,
                    main: (0, core_1.join)((0, core_1.normalize)(sourceRoot), mainPath.endsWith('.ts') ? mainPath : mainPath + '.ts'),
                    tsConfig: serverTsConfig,
                    ...((buildTarget === null || buildTarget === void 0 ? void 0 : buildTarget.options) ? getServerOptions(buildTarget === null || buildTarget === void 0 ? void 0 : buildTarget.options) : {}),
                },
                configurations,
            });
        }
    });
}
function findBrowserModuleImport(host, modulePath) {
    const moduleFileText = host.readText(modulePath);
    const source = ts.createSourceFile(modulePath, moduleFileText, ts.ScriptTarget.Latest, true);
    const decoratorMetadata = (0, ast_utils_1.getDecoratorMetadata)(source, 'NgModule', '@angular/core')[0];
    const browserModuleNode = (0, ast_utils_1.findNode)(decoratorMetadata, ts.SyntaxKind.Identifier, 'BrowserModule');
    if (browserModuleNode === null) {
        throw new schematics_1.SchematicsException(`Cannot find BrowserModule import in ${modulePath}`);
    }
    return browserModuleNode;
}
function addServerTransition(options, mainFile, clientProjectRoot) {
    return (host) => {
        const mainPath = (0, core_1.normalize)('/' + mainFile);
        const bootstrapModuleRelativePath = (0, ng_ast_utils_1.findBootstrapModulePath)(host, mainPath);
        const bootstrapModulePath = (0, core_1.normalize)(`/${clientProjectRoot}/src/${bootstrapModuleRelativePath}.ts`);
        const browserModuleImport = findBrowserModuleImport(host, bootstrapModulePath);
        const transitionCallRecorder = host.beginUpdate(bootstrapModulePath);
        const position = browserModuleImport.pos + browserModuleImport.getFullWidth();
        const browserModuleFullImport = browserModuleImport.parent;
        if (browserModuleFullImport.getText() === 'BrowserModule.withServerTransition') {
            // Remove any existing withServerTransition as otherwise we might have incorrect configuration.
            transitionCallRecorder.remove(position, browserModuleFullImport.parent.getFullWidth() - browserModuleImport.getFullWidth());
        }
        transitionCallRecorder.insertLeft(position, `.withServerTransition({ appId: '${options.appId}' })`);
        host.commitUpdate(transitionCallRecorder);
    };
}
function addDependencies() {
    return (host) => {
        const coreDep = (0, dependencies_1.getPackageJsonDependency)(host, '@angular/core');
        if (coreDep === null) {
            throw new schematics_1.SchematicsException('Could not find version.');
        }
        const platformServerDep = {
            ...coreDep,
            name: '@angular/platform-server',
        };
        (0, dependencies_1.addPackageJsonDependency)(host, platformServerDep);
        (0, dependencies_1.addPackageJsonDependency)(host, {
            type: dependencies_1.NodeDependencyType.Dev,
            name: '@types/node',
            version: latest_versions_1.latestVersions['@types/node'],
        });
    };
}
function default_1(options) {
    return async (host, context) => {
        const workspace = await (0, workspace_1.getWorkspace)(host);
        const clientProject = workspace.projects.get(options.project);
        if (!clientProject || clientProject.extensions.projectType !== 'application') {
            throw new schematics_1.SchematicsException(`Universal requires a project type of "application".`);
        }
        const clientBuildTarget = clientProject.targets.get('build');
        if (!clientBuildTarget) {
            throw (0, project_targets_1.targetBuildNotFoundError)();
        }
        const clientBuildOptions = (clientBuildTarget.options ||
            {});
        if (!options.skipInstall) {
            context.addTask(new tasks_1.NodePackageInstallTask());
        }
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./files/src'), [
            (0, schematics_1.applyTemplates)({
                ...schematics_1.strings,
                ...options,
                stripTsExtension: (s) => s.replace(/\.ts$/, ''),
            }),
            (0, schematics_1.move)((0, core_1.join)((0, core_1.normalize)(clientProject.root), 'src')),
        ]);
        const clientTsConfig = (0, core_1.normalize)(clientBuildOptions.tsConfig);
        const tsConfigExtends = (0, core_1.basename)(clientTsConfig);
        const tsConfigDirectory = (0, core_1.dirname)(clientTsConfig);
        const rootSource = (0, schematics_1.apply)((0, schematics_1.url)('./files/root'), [
            (0, schematics_1.applyTemplates)({
                ...schematics_1.strings,
                ...options,
                stripTsExtension: (s) => s.replace(/\.ts$/, ''),
                tsConfigExtends,
                hasLocalizePackage: !!(0, dependencies_1.getPackageJsonDependency)(host, '@angular/localize'),
                relativePathToWorkspaceRoot: (0, paths_1.relativePathToWorkspaceRoot)(tsConfigDirectory),
            }),
            (0, schematics_1.move)(tsConfigDirectory),
        ]);
        return (0, schematics_1.chain)([
            (0, schematics_1.mergeWith)(templateSource),
            (0, schematics_1.mergeWith)(rootSource),
            addDependencies(),
            updateConfigFile(options, tsConfigDirectory),
            addServerTransition(options, clientBuildOptions.main, clientProject.root),
        ]);
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWF0aWNzL2FuZ3VsYXIvdW5pdmVyc2FsL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCwrQ0FBMkY7QUFDM0YsMkRBWW9DO0FBQ3BDLDREQUEwRTtBQUMxRSxrR0FBb0Y7QUFDcEYsb0RBQXNFO0FBQ3RFLDBEQUlpQztBQUNqQyxnRUFBNEQ7QUFDNUQsMERBQWtFO0FBQ2xFLDRDQUErRDtBQUMvRCxnRUFBc0U7QUFDdEUsb0RBQXFFO0FBQ3JFLGtFQUE4RTtBQUc5RSxTQUFTLGdCQUFnQixDQUFDLE9BQXlCLEVBQUUsaUJBQXVCO0lBQzFFLE9BQU8sSUFBQSwyQkFBZSxFQUFDLENBQUMsU0FBUyxFQUFFLEVBQUU7O1FBQ25DLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU5RCxJQUFJLGFBQWEsRUFBRTtZQUNqQixnREFBZ0Q7WUFDaEQsb0RBQW9EO1lBQ3BELHVEQUF1RDtZQUN2RCwyRkFBMkY7WUFDM0YsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLFVBQWlELEVBQUUsRUFBTSxFQUFFO2dCQUNuRixPQUFPO29CQUNMLGFBQWEsRUFBRSxDQUFBLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxhQUFhLE1BQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxhQUFhO29CQUNsRixnQkFBZ0IsRUFBRSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsZ0JBQWdCO29CQUMzQyxZQUFZLEVBQUUsQ0FBQSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsWUFBWSxN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QUM7WUFDNUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDO1NBQzFFLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQztBQUNKLENBQUM7QUF0REQsNEJBc0RDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IEpzb25WYWx1ZSwgUGF0aCwgYmFzZW5hbWUsIGRpcm5hbWUsIGpvaW4sIG5vcm1hbGl6ZSB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7XG4gIFJ1bGUsXG4gIFNjaGVtYXRpY0NvbnRleHQsXG4gIFNjaGVtYXRpY3NFeGNlcHRpb24sXG4gIFRyZWUsXG4gIGFwcGx5LFxuICBhcHBseVRlbXBsYXRlcyxcbiAgY2hhaW4sXG4gIG1lcmdlV2l0aCxcbiAgbW92ZSxcbiAgc3RyaW5ncyxcbiAgdXJsLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyBOb2RlUGFja2FnZUluc3RhbGxUYXNrIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdGFza3MnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi4vdGhpcmRfcGFydHkvZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9saWIvdHlwZXNjcmlwdCc7XG5pbXBvcnQgeyBmaW5kTm9kZSwgZ2V0RGVjb3JhdG9yTWV0YWRhdGEgfSBmcm9tICcuLi91dGlsaXR5L2FzdC11dGlscyc7XG5pbXBvcnQge1xuICBOb2RlRGVwZW5kZW5jeVR5cGUsXG4gIGFkZFBhY2thZ2VKc29uRGVwZW5kZW5jeSxcbiAgZ2V0UGFja2FnZUpzb25EZXBlbmRlbmN5LFxufSBmcm9tICcuLi91dGlsaXR5L2RlcGVuZGVuY2llcyc7XG5pbXBvcnQgeyBsYXRlc3RWZXJzaW9ucyB9IGZyb20gJy4uL3V0aWxpdHkvbGF0ZXN0LXZlcnNpb25zJztcbmltcG9ydCB7IGZpbmRCb290c3RyYXBNb2R1bGVQYXRoIH0gZnJvbSAnLi4vdXRpbGl0eS9uZy1hc3QtdXRpbHMnO1xuaW1wb3J0IHsgcmVsYXRpdmVQYXRoVG9Xb3Jrc3BhY2VSb290IH0gZnJvbSAnLi4vdXRpbGl0eS9wYXRocyc7XG5pbXBvcnQgeyB0YXJnZXRCdWlsZE5vdEZvdW5kRXJyb3IgfSBmcm9tICcuLi91dGlsaXR5L3Byb2plY3QtdGFyZ2V0cyc7XG5pbXBvcnQgeyBnZXRXb3Jrc3BhY2UsIHVwZGF0ZVdvcmtzcGFjZSB9IGZyb20gJy4uL3V0aWxpdHkvd29ya3NwYWNlJztcbmltcG9ydCB7IEJyb3dzZXJCdWlsZGVyT3B0aW9ucywgQnVpbGRlcnMgfSBmcm9tICcuLi91dGlsaXR5L3dvcmtzcGFjZS1tb2RlbHMnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFVuaXZlcnNhbE9wdGlvbnMgfSBmcm9tICcuL3NjaGVtYSc7XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvbmZpZ0ZpbGUob3B0aW9uczogVW5pdmVyc2FsT3B0aW9ucywgdHNDb25maWdEaXJlY3Rvcnk6IFBhdGgpOiBSdWxlIHtcbiAgcmV0dXJuIHVwZGF0ZVdvcmtzcGFjZSgod29ya3NwYWNlKSA9PiB7XG4gICAgY29uc3QgY2xpZW50UHJvamVjdCA9IHdvcmtzcGFjZS5wcm9qZWN0cy5nZXQob3B0aW9ucy5wcm9qZWN0KTtcblxuICAgIGlmIChjbGllbnRQcm9qZWN0KSB7XG4gICAgICAvLyBJbiBjYXNlIHRoZSBicm93c2VyIGJ1aWxkZXIgaGFzaGVzIHRoZSBhc3NldHNcbiAgICAgIC8vIHdlIG5lZWQgdG8gYWRkIHRoaXMgc2V0dGluZyB0byB0aGUgc2VydmVyIGJ1aWxkZXJcbiAgICAgIC8vIGFzIG90aGVyd2lzZSB3aGVuIGFzc2V0cyBpdCB3aWxsIGJlIHJlcXVlc3RlZCB0d2ljZS5cbiAgICAgIC8vIE9uZSBmb3IgdGhlIHNlcnZlciB3aGljaCB3aWxsIGJlIHVuaGFzaGVkLCBhbmQgb3RoZXIgb24gdGhlIGNsaWVudCB3aGljaCB3aWxsIGJlIGhhc2hlZC5cbiAgICAgIGNvbnN0IGdldFNlcnZlck9wdGlvbnMgPSAob3B0aW9uczogUmVjb3JkPHN0cmluZywgSnNvblZhbHVlIHwgdW5kZWZpbmVkPiA9IHt9KToge30gPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG91dHB1dEhhc2hpbmc6IG9wdGlvbnM/Lm91dHB1dEhhc2hpbmcgPT09ICdhbGwnID8gJ21lZGlhJyA6IG9wdGlvbnM/Lm91dHB1dEhhc2hpbmcsXG4gICAgICAgICAgZmlsZVJlcGxhY2VtZW50czogb3B0aW9ucz8uZmlsZVJlcGxhY2VtZW50cyxcbiAgICAgICAgICBvcHRpbWl6YXRpb246IG9wdGlvbnM/Lm9wdGltaXphdGlvbiA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogISFvcHRpb25zPy5vcHRpbWl6YXRpb24sXG4gICAgICAgICAgc291cmNlTWFwOiBvcHRpb25zPy5zb3VyY2VNYXAsXG4gICAgICAgICAgbG9jYWxpemF0aW9uOiBvcHRpb25zPy5sb2NhbGl6YXRpb24sXG4gICAgICAgICAgc3R5bGVQcmVwcm9jZXNzb3JPcHRpb25zOiBvcHRpb25zPy5zdHlsZVByZXByb2Nlc3Nvck9wdGlvbnMsXG4gICAgICAgICAgcmVzb3VyY2VzT3V0cHV0UGF0aDogb3B0aW9ucz8ucmVzb3VyY2VzT3V0cHV0UGF0aCxcbiAgICAgICAgICBkZXBsb3lVcmw6IG9wdGlvbnM/LmRlcGxveVVybCxcbiAgICAgICAgICBpMThuTWlzc2luZ1RyYW5zbGF0aW9uOiBvcHRpb25zPy5pMThuTWlzc2luZ1RyYW5zbGF0aW9uLFxuICAgICAgICAgIHByZXNlcnZlU3ltbGlua3M6IG9wdGlvbnM/LnByZXNlcnZlU3ltbGlua3MsXG4gICAgICAgICAgZXh0cmFjdExpY2Vuc2VzOiBvcHRpb25zPy5leHRyYWN0TGljZW5zZXMsXG4gICAgICAgICAgaW5saW5lU3R5bGVMYW5ndWFnZTogb3B0aW9ucz8uaW5saW5lU3R5bGVMYW5ndWFnZSxcbiAgICAgICAgICB2ZW5kb3JDaHVuazogb3B0aW9ucz8udmVuZG9yQ2h1bmssXG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBidWlsZFRhcmdldCA9IGNsaWVudFByb2plY3QudGFyZ2V0cy5nZXQoJ2J1aWxkJyk7XG4gICAgICBpZiAoYnVpbGRUYXJnZXQ/Lm9wdGlvbnMpIHtcbiAgICAgICAgYnVpbGRUYXJnZXQub3B0aW9ucy5vdXRwdXRQYXRoID0gYGRpc3QvJHtvcHRpb25zLnByb2plY3R9L2Jyb3dzZXJgO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBidWlsZENvbmZpZ3VyYXRpb25zID0gYnVpbGRUYXJnZXQ/LmNvbmZpZ3VyYXRpb25zO1xuICAgICAgY29uc3QgY29uZmlndXJhdGlvbnM6IFJlY29yZDxzdHJpbmcsIHt9PiA9IHt9O1xuICAgICAgaWYgKGJ1aWxkQ29uZmlndXJhdGlvbnMpIHtcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCBvcHRpb25zXSBvZiBPYmplY3QuZW50cmllcyhidWlsZENvbmZpZ3VyYXRpb25zKSkge1xuICAgICAgICAgIGNvbmZpZ3VyYXRpb25zW2tleV0gPSBnZXRTZXJ2ZXJPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1haW5QYXRoID0gb3B0aW9ucy5tYWluIGFzIHN0cmluZztcbiAgICAgIGNvbnN0IHNvdXJjZVJvb3QgPSBjbGllbnRQcm9qZWN0LnNvdXJjZVJvb3QgPz8gam9pbihub3JtYWxpemUoY2xpZW50UHJvamVjdC5yb290KSwgJ3NyYycpO1xuICAgICAgY29uc3Qgc2VydmVyVHNDb25maWcgPSBqb2luKHRzQ29uZmlnRGlyZWN0b3J5LCAndHNjb25maWcuc2VydmVyLmpzb24nKTtcbiAgICAgIGNsaWVudFByb2plY3QudGFyZ2V0cy5hZGQoe1xuICAgICAgICBuYW1lOiAnc2VydmVyJyxcbiAgICAgICAgYnVpbGRlcjogQnVpbGRlcnMuU2VydmVyLFxuICAgICAgICBkZWZhdWx0Q29uZmlndXJhdGlvbjogJ3Byb2R1Y3Rpb24nLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgb3V0cHV0UGF0aDogYGRpc3QvJHtvcHRpb25zLnByb2plY3R9L3NlcnZlcmAsXG4gICAgICAgICAgbWFpbjogam9pbihub3JtYWxpemUoc291cmNlUm9vdCksIG1haW5QYXRoLmVuZHNXaXRoKCcudHMnKSA/IG1haW5QYXRoIDogbWFpblBhdGggKyAnLnRzJyksXG4gICAgICAgICAgdHNDb25maWc6IHNlcnZlclRzQ29uZmlnLFxuICAgICAgICAgIC4uLihidWlsZFRhcmdldD8ub3B0aW9ucyA/IGdldFNlcnZlck9wdGlvbnMoYnVpbGRUYXJnZXQ/Lm9wdGlvbnMpIDoge30pLFxuICAgICAgICB9LFxuICAgICAgICBjb25maWd1cmF0aW9ucyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGZpbmRCcm93c2VyTW9kdWxlSW1wb3J0KGhvc3Q6IFRyZWUsIG1vZHVsZVBhdGg6IHN0cmluZyk6IHRzLk5vZGUge1xuICBjb25zdCBtb2R1bGVGaWxlVGV4dCA9IGhvc3QucmVhZFRleHQobW9kdWxlUGF0aCk7XG4gIGNvbnN0IHNvdXJjZSA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUobW9kdWxlUGF0aCwgbW9kdWxlRmlsZVRleHQsIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsIHRydWUpO1xuXG4gIGNvbnN0IGRlY29yYXRvck1ldGFkYXRhID0gZ2V0RGVjb3JhdG9yTWV0YWRhdGEoc291cmNlLCAnTmdNb2R1bGUnLCAnQGFuZ3VsYXIvY29yZScpWzBdO1xuICBjb25zdCBicm93c2VyTW9kdWxlTm9kZSA9IGZpbmROb2RlKGRlY29yYXRvck1ldGFkYXRhLCB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIsICdCcm93c2VyTW9kdWxlJyk7XG5cbiAgaWYgKGJyb3dzZXJNb2R1bGVOb2RlID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYENhbm5vdCBmaW5kIEJyb3dzZXJNb2R1bGUgaW1wb3J0IGluICR7bW9kdWxlUGF0aH1gKTtcbiAgfVxuXG4gIHJldHVybiBicm93c2VyTW9kdWxlTm9kZTtcbn1cblxuZnVuY3Rpb24gYWRkU2VydmVyVHJhbnNpdGlvbihcbiAgb3B0aW9uczogVW5pdmVyc2FsT3B0aW9ucyxcbiAgbWFpbkZpbGU6IHN0cmluZyxcbiAgY2xpZW50UHJvamVjdFJvb3Q6IHN0cmluZyxcbik6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUpID0+IHtcbiAgICBjb25zdCBtYWluUGF0aCA9IG5vcm1hbGl6ZSgnLycgKyBtYWluRmlsZSk7XG5cbiAgICBjb25zdCBib290c3RyYXBNb2R1bGVSZWxhdGl2ZVBhdGggPSBmaW5kQm9vdHN0cmFwTW9kdWxlUGF0aChob3N0LCBtYWluUGF0aCk7XG4gICAgY29uc3QgYm9vdHN0cmFwTW9kdWxlUGF0aCA9IG5vcm1hbGl6ZShcbiAgICAgIGAvJHtjbGllbnRQcm9qZWN0Um9vdH0vc3JjLyR7Ym9vdHN0cmFwTW9kdWxlUmVsYXRpdmVQYXRofS50c2AsXG4gICAgKTtcblxuICAgIGNvbnN0IGJyb3dzZXJNb2R1bGVJbXBvcnQgPSBmaW5kQnJvd3Nlck1vZHVsZUltcG9ydChob3N0LCBib290c3RyYXBNb2R1bGVQYXRoKTtcbiAgICBjb25zdCB0cmFuc2l0aW9uQ2FsbFJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShib290c3RyYXBNb2R1bGVQYXRoKTtcbiAgICBjb25zdCBwb3NpdGlvbiA9IGJyb3dzZXJNb2R1bGVJbXBvcnQucG9zICsgYnJvd3Nlck1vZHVsZUltcG9ydC5nZXRGdWxsV2lkdGgoKTtcbiAgICBjb25zdCBicm93c2VyTW9kdWxlRnVsbEltcG9ydCA9IGJyb3dzZXJNb2R1bGVJbXBvcnQucGFyZW50O1xuXG4gICAgaWYgKGJyb3dzZXJNb2R1bGVGdWxsSW1wb3J0LmdldFRleHQoKSA9PT0gJ0Jyb3dzZXJNb2R1bGUud2l0aFNlcnZlclRyYW5zaXRpb24nKSB7XG4gICAgICAvLyBSZW1vdmUgYW55IGV4aXN0aW5nIHdpdGhTZXJ2ZXJUcmFuc2l0aW9uIGFzIG90aGVyd2lzZSB3ZSBtaWdodCBoYXZlIGluY29ycmVjdCBjb25maWd1cmF0aW9uLlxuICAgICAgdHJhbnNpdGlvbkNhbGxSZWNvcmRlci5yZW1vdmUoXG4gICAgICAgIHBvc2l0aW9uLFxuICAgICAgICBicm93c2VyTW9kdWxlRnVsbEltcG9ydC5wYXJlbnQuZ2V0RnVsbFdpZHRoKCkgLSBicm93c2VyTW9kdWxlSW1wb3J0LmdldEZ1bGxXaWR0aCgpLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0cmFuc2l0aW9uQ2FsbFJlY29yZGVyLmluc2VydExlZnQoXG4gICAgICBwb3NpdGlvbixcbiAgICAgIGAud2l0aFNlcnZlclRyYW5zaXRpb24oeyBhcHBJZDogJyR7b3B0aW9ucy5hcHBJZH0nIH0pYCxcbiAgICApO1xuICAgIGhvc3QuY29tbWl0VXBkYXRlKHRyYW5zaXRpb25DYWxsUmVjb3JkZXIpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhZGREZXBlbmRlbmNpZXMoKTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSkgPT4ge1xuICAgIGNvbnN0IGNvcmVEZXAgPSBnZXRQYWNrYWdlSnNvbkRlcGVuZGVuY3koaG9zdCwgJ0Bhbmd1bGFyL2NvcmUnKTtcbiAgICBpZiAoY29yZURlcCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ0NvdWxkIG5vdCBmaW5kIHZlcnNpb24uJyk7XG4gICAgfVxuICAgIGNvbnN0IHBsYXRmb3JtU2VydmVyRGVwID0ge1xuICAgICAgLi4uY29yZURlcCxcbiAgICAgIG5hbWU6ICdAYW5ndWxhci9wbGF0Zm9ybS1zZXJ2ZXInLFxuICAgIH07XG4gICAgYWRkUGFja2FnZUpzb25EZXBlbmRlbmN5KGhvc3QsIHBsYXRmb3JtU2VydmVyRGVwKTtcblxuICAgIGFkZFBhY2thZ2VKc29uRGVwZW5kZW5jeShob3N0LCB7XG4gICAgICB0eXBlOiBOb2RlRGVwZW5kZW5jeVR5cGUuRGV2LFxuICAgICAgbmFtZTogJ0B0eXBlcy9ub2RlJyxcbiAgICAgIHZlcnNpb246IGxhdGVzdFZlcnNpb25zWydAdHlwZXMvbm9kZSddLFxuICAgIH0pO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAob3B0aW9uczogVW5pdmVyc2FsT3B0aW9ucyk6IFJ1bGUge1xuICByZXR1cm4gYXN5bmMgKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoaG9zdCk7XG5cbiAgICBjb25zdCBjbGllbnRQcm9qZWN0ID0gd29ya3NwYWNlLnByb2plY3RzLmdldChvcHRpb25zLnByb2plY3QpO1xuICAgIGlmICghY2xpZW50UHJvamVjdCB8fCBjbGllbnRQcm9qZWN0LmV4dGVuc2lvbnMucHJvamVjdFR5cGUgIT09ICdhcHBsaWNhdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBVbml2ZXJzYWwgcmVxdWlyZXMgYSBwcm9qZWN0IHR5cGUgb2YgXCJhcHBsaWNhdGlvblwiLmApO1xuICAgIH1cblxuICAgIGNvbnN0IGNsaWVudEJ1aWxkVGFyZ2V0ID0gY2xpZW50UHJvamVjdC50YXJnZXRzLmdldCgnYnVpbGQnKTtcbiAgICBpZiAoIWNsaWVudEJ1aWxkVGFyZ2V0KSB7XG4gICAgICB0aHJvdyB0YXJnZXRCdWlsZE5vdEZvdW5kRXJyb3IoKTtcbiAgICB9XG5cbiAgICBjb25zdCBjbGllbnRCdWlsZE9wdGlvbnMgPSAoY2xpZW50QnVpbGRUYXJnZXQub3B0aW9ucyB8fFxuICAgICAge30pIGFzIHVua25vd24gYXMgQnJvd3NlckJ1aWxkZXJPcHRpb25zO1xuXG4gICAgaWYgKCFvcHRpb25zLnNraXBJbnN0YWxsKSB7XG4gICAgICBjb250ZXh0LmFkZFRhc2sobmV3IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2soKSk7XG4gICAgfVxuXG4gICAgY29uc3QgdGVtcGxhdGVTb3VyY2UgPSBhcHBseSh1cmwoJy4vZmlsZXMvc3JjJyksIFtcbiAgICAgIGFwcGx5VGVtcGxhdGVzKHtcbiAgICAgICAgLi4uc3RyaW5ncyxcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgc3RyaXBUc0V4dGVuc2lvbjogKHM6IHN0cmluZykgPT4gcy5yZXBsYWNlKC9cXC50cyQvLCAnJyksXG4gICAgICB9KSxcbiAgICAgIG1vdmUoam9pbihub3JtYWxpemUoY2xpZW50UHJvamVjdC5yb290KSwgJ3NyYycpKSxcbiAgICBdKTtcblxuICAgIGNvbnN0IGNsaWVudFRzQ29uZmlnID0gbm9ybWFsaXplKGNsaWVudEJ1aWxkT3B0aW9ucy50c0NvbmZpZyk7XG4gICAgY29uc3QgdHNDb25maWdFeHRlbmRzID0gYmFzZW5hbWUoY2xpZW50VHNDb25maWcpO1xuICAgIGNvbnN0IHRzQ29uZmlnRGlyZWN0b3J5ID0gZGlybmFtZShjbGllbnRUc0NvbmZpZyk7XG5cbiAgICBjb25zdCByb290U291cmNlID0gYXBwbHkodXJsKCcuL2ZpbGVzL3Jvb3QnKSwgW1xuICAgICAgYXBwbHlUZW1wbGF0ZXMoe1xuICAgICAgICAuLi5zdHJpbmdzLFxuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICBzdHJpcFRzRXh0ZW5zaW9uOiAoczogc3RyaW5nKSA9PiBzLnJlcGxhY2UoL1xcLnRzJC8sICcnKSxcbiAgICAgICAgdHNDb25maWdFeHRlbmRzLFxuICAgICAgICBoYXNMb2NhbGl6ZVBhY2thZ2U6ICEhZ2V0UGFja2FnZUpzb25EZXBlbmRlbmN5KGhvc3QsICdAYW5ndWxhci9sb2NhbGl6ZScpLFxuICAgICAgICByZWxhdGl2ZVBhdGhUb1dvcmtzcGFjZVJvb3Q6IHJlbGF0aXZlUGF0aFRvV29ya3NwYWNlUm9vdCh0c0NvbmZpZ0RpcmVjdG9yeSksXG4gICAgICB9KSxcbiAgICAgIG1vdmUodHNDb25maWdEaXJlY3RvcnkpLFxuICAgIF0pO1xuXG4gICAgcmV0dXJuIGNoYWluKFtcbiAgICAgIG1lcmdlV2l0aCh0ZW1wbGF0ZVNvdXJjZSksXG4gICAgICBtZXJnZVdpdGgocm9vdFNvdXJjZSksXG4gICAgICBhZGREZXBlbmRlbmNpZXMoKSxcbiAgICAgIHVwZGF0ZUNvbmZpZ0ZpbGUob3B0aW9ucywgdHNDb25maWdEaXJlY3RvcnkpLFxuICAgICAgYWRkU2VydmVyVHJhbnNpdGlvbihvcHRpb25zLCBjbGllbnRCdWlsZE9wdGlvbnMubWFpbiwgY2xpZW50UHJvamVjdC5yb290KSxcbiAgICBdKTtcbiAgfTtcbn1cbiJdfQ==