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
const ts = __importStar(require("../third_party/github.com/Microsoft/TypeScript/lib/typescript"));
const ast_utils_1 = require("../utility/ast-utils");
const change_1 = require("../utility/change");
const ng_ast_utils_1 = require("../utility/ng-ast-utils");
const project_targets_1 = require("../utility/project-targets");
const workspace_1 = require("../utility/workspace");
const workspace_models_1 = require("../utility/workspace-models");
function getSourceFile(host, path) {
    const content = host.readText(path);
    const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
    return source;
}
function getServerModulePath(host, sourceRoot, mainPath) {
    const mainSource = getSourceFile(host, (0, core_1.join)((0, core_1.normalize)(sourceRoot), mainPath));
    const allNodes = (0, ast_utils_1.getSourceNodes)(mainSource);
    const expNode = allNodes.find((node) => ts.isExportDeclaration(node));
    if (!expNode) {
        return null;
    }
    const relativePath = expNode.moduleSpecifier;
    const modulePath = (0, core_1.normalize)(`/${sourceRoot}/${relativePath.text}.ts`);
    return modulePath;
}
function getComponentTemplateInfo(host, componentPath) {
    const compSource = getSourceFile(host, componentPath);
    const compMetadata = (0, ast_utils_1.getDecoratorMetadata)(compSource, 'Component', '@angular/core')[0];
    return {
        templateProp: getMetadataProperty(compMetadata, 'template'),
        templateUrlProp: getMetadataProperty(compMetadata, 'templateUrl'),
    };
}
function getComponentTemplate(host, compPath, tmplInfo) {
    let template = '';
    if (tmplInfo.templateProp) {
        template = tmplInfo.templateProp.getFullText();
    }
    else if (tmplInfo.templateUrlProp) {
        const templateUrl = tmplInfo.templateUrlProp.initializer.text;
        const dir = (0, core_1.dirname)((0, core_1.normalize)(compPath));
        const templatePath = (0, core_1.join)(dir, templateUrl);
        try {
            template = host.readText(templatePath);
        }
        catch (_a) { }
    }
    return template;
}
function getBootstrapComponentPath(host, mainPath) {
    const modulePath = (0, ng_ast_utils_1.getAppModulePath)(host, mainPath);
    const moduleSource = getSourceFile(host, modulePath);
    const metadataNode = (0, ast_utils_1.getDecoratorMetadata)(moduleSource, 'NgModule', '@angular/core')[0];
    const bootstrapProperty = getMetadataProperty(metadataNode, 'bootstrap');
    const arrLiteral = bootstrapProperty.initializer;
    const componentSymbol = arrLiteral.elements[0].getText();
    const relativePath = (0, ast_utils_1.getSourceNodes)(moduleSource)
        .filter(ts.isImportDeclaration)
        .filter((imp) => {
        return (0, ast_utils_1.findNode)(imp, ts.SyntaxKind.Identifier, componentSymbol);
    })
        .map((imp) => {
        const pathStringLiteral = imp.moduleSpecifier;
        return pathStringLiteral.text;
    })[0];
    return (0, core_1.join)((0, core_1.dirname)((0, core_1.normalize)(modulePath)), relativePath + '.ts');
}
// end helper functions.
function validateProject(mainPath) {
    return (host, context) => {
        const routerOutletCheckRegex = /<router-outlet.*?>([\s\S]*?)<\/router-outlet>/;
        const componentPath = getBootstrapComponentPath(host, mainPath);
        const tmpl = getComponentTemplateInfo(host, componentPath);
        const template = getComponentTemplate(host, componentPath, tmpl);
        if (!routerOutletCheckRegex.test(template)) {
            const errorMsg = `Prerequisite for application shell is to define a router-outlet in your root component.`;
            context.logger.error(errorMsg);
            throw new schematics_1.SchematicsException(errorMsg);
        }
    };
}
function addUniversalTarget(options) {
    return () => {
        // Copy options.
        const universalOptions = {
            ...options,
        };
        // Delete non-universal options.
        delete universalOptions.route;
        return (0, schematics_1.schematic)('universal', universalOptions);
    };
}
function addAppShellConfigToWorkspace(options) {
    return (host, context) => {
        if (!options.route) {
            throw new schematics_1.SchematicsException(`Route is not defined`);
        }
        return (0, workspace_1.updateWorkspace)((workspace) => {
            var _a, _b, _c, _d;
            const project = workspace.projects.get(options.project);
            if (!project) {
                return;
            }
            // Validation of targets is handled already in the main function.
            // Duplicate keys means that we have configurations in both server and build builders.
            const serverConfigKeys = (_b = (_a = project.targets.get('server')) === null || _a === void 0 ? void 0 : _a.configurations) !== null && _b !== void 0 ? _b : {};
            const buildConfigKeys = (_d = (_c = project.targets.get('build')) === null || _c === void 0 ? void 0 : _c.configurations) !== null && _d !== void 0 ? _d : {};
            const configurationNames = Object.keys({
                ...serverConfigKeys,
                ...buildConfigKeys,
            });
            const configurations = {};
            for (const key of configurationNames) {
                if (!serverConfigKeys[key]) {
                    context.logger.warn(`Skipped adding "${key}" configuration to "app-shell" target as it's missing from "server" target.`);
                    continue;
                }
                if (!buildConfigKeys[key]) {
                    context.logger.warn(`Skipped adding "${key}" configuration to "app-shell" target as it's missing from "build" target.`);
                    continue;
                }
                configurations[key] = {
                    browserTarget: `${options.project}:build:${key}`,
                    serverTarget: `${options.project}:server:${key}`,
                };
            }
            project.targets.add({
                name: 'app-shell',
                builder: workspace_models_1.Builders.AppShell,
                defaultConfiguration: configurations['production'] ? 'production' : undefined,
                options: {
                    route: options.route,
                },
                configurations,
            });
        });
    };
}
function addRouterModule(mainPath) {
    return (host) => {
        const modulePath = (0, ng_ast_utils_1.getAppModulePath)(host, mainPath);
        const moduleSource = getSourceFile(host, modulePath);
        const changes = (0, ast_utils_1.addImportToModule)(moduleSource, modulePath, 'RouterModule', '@angular/router');
        const recorder = host.beginUpdate(modulePath);
        (0, change_1.applyToUpdateRecorder)(recorder, changes);
        host.commitUpdate(recorder);
        return host;
    };
}
function getMetadataProperty(metadata, propertyName) {
    const properties = metadata.properties;
    const property = properties.filter(ts.isPropertyAssignment).filter((prop) => {
        const name = prop.name;
        switch (name.kind) {
            case ts.SyntaxKind.Identifier:
                return name.getText() === propertyName;
            case ts.SyntaxKind.StringLiteral:
                return name.text === propertyName;
        }
        return false;
    })[0];
    return property;
}
function addServerRoutes(options) {
    return async (host) => {
        // The workspace gets updated so this needs to be reloaded
        const workspace = await (0, workspace_1.getWorkspace)(host);
        const clientProject = workspace.projects.get(options.project);
        if (!clientProject) {
            throw new Error('Universal schematic removed client project.');
        }
        const clientServerTarget = clientProject.targets.get('server');
        if (!clientServerTarget) {
            throw new Error('Universal schematic did not add server target to client project.');
        }
        const clientServerOptions = clientServerTarget.options;
        if (!clientServerOptions) {
            throw new schematics_1.SchematicsException('Server target does not contain options.');
        }
        const modulePath = getServerModulePath(host, clientProject.sourceRoot || 'src', options.main);
        if (modulePath === null) {
            throw new schematics_1.SchematicsException('Universal/server module not found.');
        }
        let moduleSource = getSourceFile(host, modulePath);
        if (!(0, ast_utils_1.isImported)(moduleSource, 'Routes', '@angular/router')) {
            const recorder = host.beginUpdate(modulePath);
            const routesChange = (0, ast_utils_1.insertImport)(moduleSource, modulePath, 'Routes', '@angular/router');
            if (routesChange) {
                (0, change_1.applyToUpdateRecorder)(recorder, [routesChange]);
            }
            const imports = (0, ast_utils_1.getSourceNodes)(moduleSource)
                .filter((node) => node.kind === ts.SyntaxKind.ImportDeclaration)
                .sort((a, b) => a.getStart() - b.getStart());
            const insertPosition = imports[imports.length - 1].getEnd();
            const routeText = `\n\nconst routes: Routes = [ { path: '${options.route}', component: AppShellComponent }];`;
            recorder.insertRight(insertPosition, routeText);
            host.commitUpdate(recorder);
        }
        moduleSource = getSourceFile(host, modulePath);
        if (!(0, ast_utils_1.isImported)(moduleSource, 'RouterModule', '@angular/router')) {
            const recorder = host.beginUpdate(modulePath);
            const routerModuleChange = (0, ast_utils_1.insertImport)(moduleSource, modulePath, 'RouterModule', '@angular/router');
            if (routerModuleChange) {
                (0, change_1.applyToUpdateRecorder)(recorder, [routerModuleChange]);
            }
            const metadataChange = (0, ast_utils_1.addSymbolToNgModuleMetadata)(moduleSource, modulePath, 'imports', 'RouterModule.forRoot(routes)');
            if (metadataChange) {
                (0, change_1.applyToUpdateRecorder)(recorder, metadataChange);
            }
            host.commitUpdate(recorder);
        }
    };
}
function addShellComponent(options) {
    const componentOptions = {
        name: 'app-shell',
        module: options.rootModuleFileName,
        project: options.project,
    };
    return (0, schematics_1.schematic)('component', componentOptions);
}
function default_1(options) {
    return async (tree) => {
        const workspace = await (0, workspace_1.getWorkspace)(tree);
        const clientProject = workspace.projects.get(options.project);
        if (!clientProject || clientProject.extensions.projectType !== 'application') {
            throw new schematics_1.SchematicsException(`A client project type of "application" is required.`);
        }
        const clientBuildTarget = clientProject.targets.get('build');
        if (!clientBuildTarget) {
            throw (0, project_targets_1.targetBuildNotFoundError)();
        }
        const clientBuildOptions = (clientBuildTarget.options ||
            {});
        return (0, schematics_1.chain)([
            validateProject(clientBuildOptions.main),
            clientProject.targets.has('server') ? (0, schematics_1.noop)() : addUniversalTarget(options),
            addAppShellConfigToWorkspace(options),
            addRouterModule(clientBuildOptions.main),
            addServerRoutes(options),
            addShellComponent(options),
        ]);
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWF0aWNzL2FuZ3VsYXIvYXBwLXNoZWxsL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFSCwrQ0FBZ0U7QUFDaEUsMkRBUW9DO0FBRXBDLGtHQUFvRjtBQUNwRixvREFROEI7QUFDOUIsOENBQTBEO0FBQzFELDBEQUEyRDtBQUMzRCxnRUFBc0U7QUFDdEUsb0RBQXFFO0FBQ3JFLGtFQUFvRztBQUdwRyxTQUFTLGFBQWEsQ0FBQyxJQUFVLEVBQUUsSUFBWTtJQUM3QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRWhGLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxTQUFTLG1CQUFtQixDQUFDLElBQVUsRUFBRSxVQUFrQixFQUFFLFFBQWdCO0lBQzNFLE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBQSxXQUFJLEVBQUMsSUFBQSxnQkFBUyxFQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDOUUsTUFBTSxRQUFRLEdBQUcsSUFBQSwwQkFBYyxFQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzVDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDWixPQUFPLElBQUksQ0FB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QUN4QyxlQUFlLENBQUMsT0FBTyxDQUFDO1lBQ3hCLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztTQUMzQixDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDSixDQUFDO0FBdkJELDRCQXVCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBkaXJuYW1lLCBqb2luLCBub3JtYWxpemUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQge1xuICBSdWxlLFxuICBTY2hlbWF0aWNDb250ZXh0LFxuICBTY2hlbWF0aWNzRXhjZXB0aW9uLFxuICBUcmVlLFxuICBjaGFpbixcbiAgbm9vcCxcbiAgc2NoZW1hdGljLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgeyBTY2hlbWEgYXMgQ29tcG9uZW50T3B0aW9ucyB9IGZyb20gJy4uL2NvbXBvbmVudC9zY2hlbWEnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi4vdGhpcmRfcGFydHkvZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9saWIvdHlwZXNjcmlwdCc7XG5pbXBvcnQge1xuICBhZGRJbXBvcnRUb01vZHVsZSxcbiAgYWRkU3ltYm9sVG9OZ01vZHVsZU1ldGFkYXRhLFxuICBmaW5kTm9kZSxcbiAgZ2V0RGVjb3JhdG9yTWV0YWRhdGEsXG4gIGdldFNvdXJjZU5vZGVzLFxuICBpbnNlcnRJbXBvcnQsXG4gIGlzSW1wb3J0ZWQsXG59IGZyb20gJy4uL3V0aWxpdHkvYXN0LXV0aWxzJztcbmltcG9ydCB7IGFwcGx5VG9VcGRhdGVSZWNvcmRlciB9IGZyb20gJy4uL3V0aWxpdHkvY2hhbmdlJztcbmltcG9ydCB7IGdldEFwcE1vZHVsZVBhdGggfSBmcm9tICcuLi91dGlsaXR5L25nLWFzdC11dGlscyc7XG5pbXBvcnQgeyB0YXJnZXRCdWlsZE5vdEZvdW5kRXJyb3IgfSBmcm9tICcuLi91dGlsaXR5L3Byb2plY3QtdGFyZ2V0cyc7XG5pbXBvcnQgeyBnZXRXb3Jrc3BhY2UsIHVwZGF0ZVdvcmtzcGFjZSB9IGZyb20gJy4uL3V0aWxpdHkvd29ya3NwYWNlJztcbmltcG9ydCB7IEJyb3dzZXJCdWlsZGVyT3B0aW9ucywgQnVpbGRlcnMsIFNlcnZlckJ1aWxkZXJPcHRpb25zIH0gZnJvbSAnLi4vdXRpbGl0eS93b3Jrc3BhY2UtbW9kZWxzJztcbmltcG9ydCB7IFNjaGVtYSBhcyBBcHBTaGVsbE9wdGlvbnMgfSBmcm9tICcuL3NjaGVtYSc7XG5cbmZ1bmN0aW9uIGdldFNvdXJjZUZpbGUoaG9zdDogVHJlZSwgcGF0aDogc3RyaW5nKTogdHMuU291cmNlRmlsZSB7XG4gIGNvbnN0IGNvbnRlbnQgPSBob3N0LnJlYWRUZXh0KHBhdGgpO1xuICBjb25zdCBzb3VyY2UgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKHBhdGgsIGNvbnRlbnQsIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsIHRydWUpO1xuXG4gIHJldHVybiBzb3VyY2U7XG59XG5cbmZ1bmN0aW9uIGdldFNlcnZlck1vZHVsZVBhdGgoaG9zdDogVHJlZSwgc291cmNlUm9vdDogc3RyaW5nLCBtYWluUGF0aDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGNvbnN0IG1haW5Tb3VyY2UgPSBnZXRTb3VyY2VGaWxlKGhvc3QsIGpvaW4obm9ybWFsaXplKHNvdXJjZVJvb3QpLCBtYWluUGF0aCkpO1xuICBjb25zdCBhbGxOb2RlcyA9IGdldFNvdXJjZU5vZGVzKG1haW5Tb3VyY2UpO1xuICBjb25zdCBleHBOb2RlID0gYWxsTm9kZXMuZmluZCgobm9kZSkgPT4gdHMuaXNFeHBvcnREZWNsYXJhdGlvbihub2RlKSk7XG4gIGlmICghZXhwTm9kZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHJlbGF0aXZlUGF0aCA9IChleHBOb2RlIGFzIHRzLkV4cG9ydERlY2xhcmF0aW9uKS5tb2R1bGVTcGVjaWZpZXIgYXMgdHMuU3RyaW5nTGl0ZXJhbDtcbiAgY29uc3QgbW9kdWxlUGF0aCA9IG5vcm1hbGl6ZShgLyR7c291cmNlUm9vdH0vJHtyZWxhdGl2ZVBhdGgudGV4dH0udHNgKTtcblxuICByZXR1cm4gbW9kdWxlUGF0aDtcbn1cblxuaW50ZXJmYWNlIFRlbXBsYXRlSW5mbyB7XG4gIHRlbXBsYXRlUHJvcD86IHRzLlByb3BlcnR5QXNzaWdubWVudDtcbiAgdGVtcGxhdGVVcmxQcm9wPzogdHMuUHJvcGVydHlBc3NpZ25tZW50O1xufVxuXG5mdW5jdGlvbiBnZXRDb21wb25lbnRUZW1wbGF0ZUluZm8oaG9zdDogVHJlZSwgY29tcG9uZW50UGF0aDogc3RyaW5nKTogVGVtcGxhdGVJbmZvIHtcbiAgY29uc3QgY29tcFNvdXJjZSA9IGdldFNvdXJjZUZpbGUoaG9zdCwgY29tcG9uZW50UGF0aCk7XG4gIGNvbnN0IGNvbXBNZXRhZGF0YSA9IGdldERlY29yYXRvck1ldGFkYXRhKGNvbXBTb3VyY2UsICdDb21wb25lbnQnLCAnQGFuZ3VsYXIvY29yZScpWzBdO1xuXG4gIHJldHVybiB7XG4gICAgdGVtcGxhdGVQcm9wOiBnZXRNZXRhZGF0YVByb3BlcnR5KGNvbXBNZXRhZGF0YSwgJ3RlbXBsYXRlJyksXG4gICAgdGVtcGxhdGVVcmxQcm9wOiBnZXRNZXRhZGF0YVByb3BlcnR5KGNvbXBNZXRhZGF0YSwgJ3RlbXBsYXRlVXJsJyksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGdldENvbXBvbmVudFRlbXBsYXRlKGhvc3Q6IFRyZWUsIGNvbXBQYXRoOiBzdHJpbmcsIHRtcGxJbmZvOiBUZW1wbGF0ZUluZm8pOiBzdHJpbmcge1xuICBsZXQgdGVtcGxhdGUgPSAnJztcblxuICBpZiAodG1wbEluZm8udGVtcGxhdGVQcm9wKSB7XG4gICAgdGVtcGxhdGUgPSB0bXBsSW5mby50ZW1wbGF0ZVByb3AuZ2V0RnVsbFRleHQoKTtcbiAgfSBlbHNlIGlmICh0bXBsSW5mby50ZW1wbGF0ZVVybFByb3ApIHtcbiAgICBjb25zdCB0ZW1wbGF0ZVVybCA9ICh0bXBsSW5mby50ZW1wbGF0ZVVybFByb3AuaW5pdGlhbGl6ZXIgYXMgdHMuU3RyaW5nTGl0ZXJhbCkudGV4dDtcbiAgICBjb25zdCBkaXIgPSBkaXJuYW1lKG5vcm1hbGl6ZShjb21wUGF0aCkpO1xuICAgIGNvbnN0IHRlbXBsYXRlUGF0aCA9IGpvaW4oZGlyLCB0ZW1wbGF0ZVVybCk7XG4gICAgdHJ5IHtcbiAgICAgIHRlbXBsYXRlID0gaG9zdC5yZWFkVGV4dCh0ZW1wbGF0ZVBhdGgpO1xuICAgIH0gY2F0Y2gge31cbiAgfVxuXG4gIHJldHVybiB0ZW1wbGF0ZTtcbn1cblxuZnVuY3Rpb24gZ2V0Qm9vdHN0cmFwQ29tcG9uZW50UGF0aChob3N0OiBUcmVlLCBtYWluUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbW9kdWxlUGF0aCA9IGdldEFwcE1vZHVsZVBhdGgoaG9zdCwgbWFpblBhdGgpO1xuICBjb25zdCBtb2R1bGVTb3VyY2UgPSBnZXRTb3VyY2VGaWxlKGhvc3QsIG1vZHVsZVBhdGgpO1xuXG4gIGNvbnN0IG1ldGFkYXRhTm9kZSA9IGdldERlY29yYXRvck1ldGFkYXRhKG1vZHVsZVNvdXJjZSwgJ05nTW9kdWxlJywgJ0Bhbmd1bGFyL2NvcmUnKVswXTtcbiAgY29uc3QgYm9vdHN0cmFwUHJvcGVydHkgPSBnZXRNZXRhZGF0YVByb3BlcnR5KG1ldGFkYXRhTm9kZSwgJ2Jvb3RzdHJhcCcpO1xuXG4gIGNvbnN0IGFyckxpdGVyYWwgPSBib290c3RyYXBQcm9wZXJ0eS5pbml0aWFsaXplciBhcyB0cy5BcnJheUxpdGVyYWxFeHByZXNzaW9uO1xuXG4gIGNvbnN0IGNvbXBvbmVudFN5bWJvbCA9IGFyckxpdGVyYWwuZWxlbWVudHNbMF0uZ2V0VGV4dCgpO1xuXG4gIGNvbnN0IHJlbGF0aXZlUGF0aCA9IGdldFNvdXJjZU5vZGVzKG1vZHVsZVNvdXJjZSlcbiAgICAuZmlsdGVyKHRzLmlzSW1wb3J0RGVjbGFyYXRpb24pXG4gICAgLmZpbHRlcigoaW1wKSA9PiB7XG4gICAgICByZXR1cm4gZmluZE5vZGUoaW1wLCB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIsIGNvbXBvbmVudFN5bWJvbCk7XG4gICAgfSlcbiAgICAubWFwKChpbXApID0+IHtcbiAgICAgIGNvbnN0IHBhdGhTdHJpbmdMaXRlcmFsID0gaW1wLm1vZHVsZVNwZWNpZmllciBhcyB0cy5TdHJpbmdMaXRlcmFsO1xuXG4gICAgICByZXR1cm4gcGF0aFN0cmluZ0xpdGVyYWwudGV4dDtcbiAgICB9KVswXTtcblxuICByZXR1cm4gam9pbihkaXJuYW1lKG5vcm1hbGl6ZShtb2R1bGVQYXRoKSksIHJlbGF0aXZlUGF0aCArICcudHMnKTtcbn1cbi8vIGVuZCBoZWxwZXIgZnVuY3Rpb25zLlxuXG5mdW5jdGlvbiB2YWxpZGF0ZVByb2plY3QobWFpblBhdGg6IHN0cmluZyk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCByb3V0ZXJPdXRsZXRDaGVja1JlZ2V4ID0gLzxyb3V0ZXItb3V0bGV0Lio/PihbXFxzXFxTXSo/KTxcXC9yb3V0ZXItb3V0bGV0Pi87XG5cbiAgICBjb25zdCBjb21wb25lbnRQYXRoID0gZ2V0Qm9vdHN0cmFwQ29tcG9uZW50UGF0aChob3N0LCBtYWluUGF0aCk7XG4gICAgY29uc3QgdG1wbCA9IGdldENvbXBvbmVudFRlbXBsYXRlSW5mbyhob3N0LCBjb21wb25lbnRQYXRoKTtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IGdldENvbXBvbmVudFRlbXBsYXRlKGhvc3QsIGNvbXBvbmVudFBhdGgsIHRtcGwpO1xuICAgIGlmICghcm91dGVyT3V0bGV0Q2hlY2tSZWdleC50ZXN0KHRlbXBsYXRlKSkge1xuICAgICAgY29uc3QgZXJyb3JNc2cgPSBgUHJlcmVxdWlzaXRlIGZvciBhcHBsaWNhdGlvbiBzaGVsbCBpcyB0byBkZWZpbmUgYSByb3V0ZXItb3V0bGV0IGluIHlvdXIgcm9vdCBjb21wb25lbnQuYDtcbiAgICAgIGNvbnRleHQubG9nZ2VyLmVycm9yKGVycm9yTXNnKTtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGVycm9yTXNnKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZFVuaXZlcnNhbFRhcmdldChvcHRpb25zOiBBcHBTaGVsbE9wdGlvbnMpOiBSdWxlIHtcbiAgcmV0dXJuICgpID0+IHtcbiAgICAvLyBDb3B5IG9wdGlvbnMuXG4gICAgY29uc3QgdW5pdmVyc2FsT3B0aW9ucyA9IHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfTtcblxuICAgIC8vIERlbGV0ZSBub24tdW5pdmVyc2FsIG9wdGlvbnMuXG4gICAgZGVsZXRlIHVuaXZlcnNhbE9wdGlvbnMucm91dGU7XG5cbiAgICByZXR1cm4gc2NoZW1hdGljKCd1bml2ZXJzYWwnLCB1bml2ZXJzYWxPcHRpb25zKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkQXBwU2hlbGxDb25maWdUb1dvcmtzcGFjZShvcHRpb25zOiBBcHBTaGVsbE9wdGlvbnMpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0LCBjb250ZXh0KSA9PiB7XG4gICAgaWYgKCFvcHRpb25zLnJvdXRlKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgUm91dGUgaXMgbm90IGRlZmluZWRgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXBkYXRlV29ya3NwYWNlKCh3b3Jrc3BhY2UpID0+IHtcbiAgICAgIGNvbnN0IHByb2plY3QgPSB3b3Jrc3BhY2UucHJvamVjdHMuZ2V0KG9wdGlvbnMucHJvamVjdCk7XG4gICAgICBpZiAoIXByb2plY3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBWYWxpZGF0aW9uIG9mIHRhcmdldHMgaXMgaGFuZGxlZCBhbHJlYWR5IGluIHRoZSBtYWluIGZ1bmN0aW9uLlxuICAgICAgLy8gRHVwbGljYXRlIGtleXMgbWVhbnMgdGhhdCB3ZSBoYXZlIGNvbmZpZ3VyYXRpb25zIGluIGJvdGggc2VydmVyIGFuZCBidWlsZCBidWlsZGVycy5cbiAgICAgIGNvbnN0IHNlcnZlckNvbmZpZ0tleXMgPSBwcm9qZWN0LnRhcmdldHMuZ2V0KCdzZXJ2ZXInKT8uY29uZmlndXJhdGlvbnMgPz8ge307XG4gICAgICBjb25zdCBidWlsZENvbmZpZ0tleXMgPSBwcm9qZWN0LnRhcmdldHMuZ2V0KCdidWlsZCcpPy5jb25maWd1cmF0aW9ucyA/PyB7fTtcblxuICAgICAgY29uc3QgY29uZmlndXJhdGlvbk5hbWVzID0gT2JqZWN0LmtleXMoe1xuICAgICAgICAuLi5zZXJ2ZXJDb25maWdLZXlzLFxuICAgICAgICAuLi5idWlsZENvbmZpZ0tleXMsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgY29uZmlndXJhdGlvbnM6IFJlY29yZDxzdHJpbmcsIHt9PiA9IHt9O1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgY29uZmlndXJhdGlvbk5hbWVzKSB7XG4gICAgICAgIGlmICghc2VydmVyQ29uZmlnS2V5c1trZXldKSB7XG4gICAgICAgICAgY29udGV4dC5sb2dnZXIud2FybihcbiAgICAgICAgICAgIGBTa2lwcGVkIGFkZGluZyBcIiR7a2V5fVwiIGNvbmZpZ3VyYXRpb24gdG8gXCJhcHAtc2hlbGxcIiB0YXJnZXQgYXMgaXQncyBtaXNzaW5nIGZyb20gXCJzZXJ2ZXJcIiB0YXJnZXQuYCxcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWJ1aWxkQ29uZmlnS2V5c1trZXldKSB7XG4gICAgICAgICAgY29udGV4dC5sb2dnZXIud2FybihcbiAgICAgICAgICAgIGBTa2lwcGVkIGFkZGluZyBcIiR7a2V5fVwiIGNvbmZpZ3VyYXRpb24gdG8gXCJhcHAtc2hlbGxcIiB0YXJnZXQgYXMgaXQncyBtaXNzaW5nIGZyb20gXCJidWlsZFwiIHRhcmdldC5gLFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZ3VyYXRpb25zW2tleV0gPSB7XG4gICAgICAgICAgYnJvd3NlclRhcmdldDogYCR7b3B0aW9ucy5wcm9qZWN0fTpidWlsZDoke2tleX1gLFxuICAgICAgICAgIHNlcnZlclRhcmdldDogYCR7b3B0aW9ucy5wcm9qZWN0fTpzZXJ2ZXI6JHtrZXl9YCxcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcHJvamVjdC50YXJnZXRzLmFkZCh7XG4gICAgICAgIG5hbWU6ICdhcHAtc2hlbGwnLFxuICAgICAgICBidWlsZGVyOiBCdWlsZGVycy5BcHBTaGVsbCxcbiAgICAgICAgZGVmYXVsdENvbmZpZ3VyYXRpb246IGNvbmZpZ3VyYXRpb25zWydwcm9kdWN0aW9uJ10gPyAncHJvZHVjdGlvbicgOiB1bmRlZmluZWQsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICByb3V0ZTogb3B0aW9ucy5yb3V0ZSxcbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJhdGlvbnMsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkUm91dGVyTW9kdWxlKG1haW5QYXRoOiBzdHJpbmcpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlKSA9PiB7XG4gICAgY29uc3QgbW9kdWxlUGF0aCA9IGdldEFwcE1vZHVsZVBhdGgoaG9zdCwgbWFpblBhdGgpO1xuICAgIGNvbnN0IG1vZHVsZVNvdXJjZSA9IGdldFNvdXJjZUZpbGUoaG9zdCwgbW9kdWxlUGF0aCk7XG4gICAgY29uc3QgY2hhbmdlcyA9IGFkZEltcG9ydFRvTW9kdWxlKG1vZHVsZVNvdXJjZSwgbW9kdWxlUGF0aCwgJ1JvdXRlck1vZHVsZScsICdAYW5ndWxhci9yb3V0ZXInKTtcbiAgICBjb25zdCByZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUobW9kdWxlUGF0aCk7XG4gICAgYXBwbHlUb1VwZGF0ZVJlY29yZGVyKHJlY29yZGVyLCBjaGFuZ2VzKTtcbiAgICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0TWV0YWRhdGFQcm9wZXJ0eShtZXRhZGF0YTogdHMuTm9kZSwgcHJvcGVydHlOYW1lOiBzdHJpbmcpOiB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQge1xuICBjb25zdCBwcm9wZXJ0aWVzID0gKG1ldGFkYXRhIGFzIHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uKS5wcm9wZXJ0aWVzO1xuICBjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnRpZXMuZmlsdGVyKHRzLmlzUHJvcGVydHlBc3NpZ25tZW50KS5maWx0ZXIoKHByb3ApID0+IHtcbiAgICBjb25zdCBuYW1lID0gcHJvcC5uYW1lO1xuICAgIHN3aXRjaCAobmFtZS5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgICAgcmV0dXJuIG5hbWUuZ2V0VGV4dCgpID09PSBwcm9wZXJ0eU5hbWU7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgcmV0dXJuIG5hbWUudGV4dCA9PT0gcHJvcGVydHlOYW1lO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSlbMF07XG5cbiAgcmV0dXJuIHByb3BlcnR5O1xufVxuXG5mdW5jdGlvbiBhZGRTZXJ2ZXJSb3V0ZXMob3B0aW9uczogQXBwU2hlbGxPcHRpb25zKTogUnVsZSB7XG4gIHJldHVybiBhc3luYyAoaG9zdDogVHJlZSkgPT4ge1xuICAgIC8vIFRoZSB3b3Jrc3BhY2UgZ2V0cyB1cGRhdGVkIHNvIHRoaXMgbmVlZHMgdG8gYmUgcmVsb2FkZWRcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoaG9zdCk7XG4gICAgY29uc3QgY2xpZW50UHJvamVjdCA9IHdvcmtzcGFjZS5wcm9qZWN0cy5nZXQob3B0aW9ucy5wcm9qZWN0KTtcbiAgICBpZiAoIWNsaWVudFByb2plY3QpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5pdmVyc2FsIHNjaGVtYXRpYyByZW1vdmVkIGNsaWVudCBwcm9qZWN0LicpO1xuICAgIH1cbiAgICBjb25zdCBjbGllbnRTZXJ2ZXJUYXJnZXQgPSBjbGllbnRQcm9qZWN0LnRhcmdldHMuZ2V0KCdzZXJ2ZXInKTtcbiAgICBpZiAoIWNsaWVudFNlcnZlclRhcmdldCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbml2ZXJzYWwgc2NoZW1hdGljIGRpZCBub3QgYWRkIHNlcnZlciB0YXJnZXQgdG8gY2xpZW50IHByb2plY3QuJyk7XG4gICAgfVxuICAgIGNvbnN0IGNsaWVudFNlcnZlck9wdGlvbnMgPSBjbGllbnRTZXJ2ZXJUYXJnZXQub3B0aW9ucyBhcyB1bmtub3duIGFzIFNlcnZlckJ1aWxkZXJPcHRpb25zO1xuICAgIGlmICghY2xpZW50U2VydmVyT3B0aW9ucykge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ1NlcnZlciB0YXJnZXQgZG9lcyBub3QgY29udGFpbiBvcHRpb25zLicpO1xuICAgIH1cbiAgICBjb25zdCBtb2R1bGVQYXRoID0gZ2V0U2VydmVyTW9kdWxlUGF0aChcbiAgICAgIGhvc3QsXG4gICAgICBjbGllbnRQcm9qZWN0LnNvdXJjZVJvb3QgfHwgJ3NyYycsXG4gICAgICBvcHRpb25zLm1haW4gYXMgc3RyaW5nLFxuICAgICk7XG4gICAgaWYgKG1vZHVsZVBhdGggPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdVbml2ZXJzYWwvc2VydmVyIG1vZHVsZSBub3QgZm91bmQuJyk7XG4gICAgfVxuXG4gICAgbGV0IG1vZHVsZVNvdXJjZSA9IGdldFNvdXJjZUZpbGUoaG9zdCwgbW9kdWxlUGF0aCk7XG4gICAgaWYgKCFpc0ltcG9ydGVkKG1vZHVsZVNvdXJjZSwgJ1JvdXRlcycsICdAYW5ndWxhci9yb3V0ZXInKSkge1xuICAgICAgY29uc3QgcmVjb3JkZXIgPSBob3N0LmJlZ2luVXBkYXRlKG1vZHVsZVBhdGgpO1xuICAgICAgY29uc3Qgcm91dGVzQ2hhbmdlID0gaW5zZXJ0SW1wb3J0KG1vZHVsZVNvdXJjZSwgbW9kdWxlUGF0aCwgJ1JvdXRlcycsICdAYW5ndWxhci9yb3V0ZXInKTtcbiAgICAgIGlmIChyb3V0ZXNDaGFuZ2UpIHtcbiAgICAgICAgYXBwbHlUb1VwZGF0ZVJlY29yZGVyKHJlY29yZGVyLCBbcm91dGVzQ2hhbmdlXSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGltcG9ydHMgPSBnZXRTb3VyY2VOb2Rlcyhtb2R1bGVTb3VyY2UpXG4gICAgICAgIC5maWx0ZXIoKG5vZGUpID0+IG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbXBvcnREZWNsYXJhdGlvbilcbiAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEuZ2V0U3RhcnQoKSAtIGIuZ2V0U3RhcnQoKSk7XG4gICAgICBjb25zdCBpbnNlcnRQb3NpdGlvbiA9IGltcG9ydHNbaW1wb3J0cy5sZW5ndGggLSAxXS5nZXRFbmQoKTtcbiAgICAgIGNvbnN0IHJvdXRlVGV4dCA9IGBcXG5cXG5jb25zdCByb3V0ZXM6IFJvdXRlcyA9IFsgeyBwYXRoOiAnJHtvcHRpb25zLnJvdXRlfScsIGNvbXBvbmVudDogQXBwU2hlbGxDb21wb25lbnQgfV07YDtcbiAgICAgIHJlY29yZGVyLmluc2VydFJpZ2h0KGluc2VydFBvc2l0aW9uLCByb3V0ZVRleHQpO1xuICAgICAgaG9zdC5jb21taXRVcGRhdGUocmVjb3JkZXIpO1xuICAgIH1cblxuICAgIG1vZHVsZVNvdXJjZSA9IGdldFNvdXJjZUZpbGUoaG9zdCwgbW9kdWxlUGF0aCk7XG4gICAgaWYgKCFpc0ltcG9ydGVkKG1vZHVsZVNvdXJjZSwgJ1JvdXRlck1vZHVsZScsICdAYW5ndWxhci9yb3V0ZXInKSkge1xuICAgICAgY29uc3QgcmVjb3JkZXIgPSBob3N0LmJlZ2luVXBkYXRlKG1vZHVsZVBhdGgpO1xuICAgICAgY29uc3Qgcm91dGVyTW9kdWxlQ2hhbmdlID0gaW5zZXJ0SW1wb3J0KFxuICAgICAgICBtb2R1bGVTb3VyY2UsXG4gICAgICAgIG1vZHVsZVBhdGgsXG4gICAgICAgICdSb3V0ZXJNb2R1bGUnLFxuICAgICAgICAnQGFuZ3VsYXIvcm91dGVyJyxcbiAgICAgICk7XG5cbiAgICAgIGlmIChyb3V0ZXJNb2R1bGVDaGFuZ2UpIHtcbiAgICAgICAgYXBwbHlUb1VwZGF0ZVJlY29yZGVyKHJlY29yZGVyLCBbcm91dGVyTW9kdWxlQ2hhbmdlXSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1ldGFkYXRhQ2hhbmdlID0gYWRkU3ltYm9sVG9OZ01vZHVsZU1ldGFkYXRhKFxuICAgICAgICBtb2R1bGVTb3VyY2UsXG4gICAgICAgIG1vZHVsZVBhdGgsXG4gICAgICAgICdpbXBvcnRzJyxcbiAgICAgICAgJ1JvdXRlck1vZHVsZS5mb3JSb290KHJvdXRlcyknLFxuICAgICAgKTtcbiAgICAgIGlmIChtZXRhZGF0YUNoYW5nZSkge1xuICAgICAgICBhcHBseVRvVXBkYXRlUmVjb3JkZXIocmVjb3JkZXIsIG1ldGFkYXRhQ2hhbmdlKTtcbiAgICAgIH1cbiAgICAgIGhvc3QuY29tbWl0VXBkYXRlKHJlY29yZGVyKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZFNoZWxsQ29tcG9uZW50KG9wdGlvbnM6IEFwcFNoZWxsT3B0aW9ucyk6IFJ1bGUge1xuICBjb25zdCBjb21wb25lbnRPcHRpb25zOiBDb21wb25lbnRPcHRpb25zID0ge1xuICAgIG5hbWU6ICdhcHAtc2hlbGwnLFxuICAgIG1vZHVsZTogb3B0aW9ucy5yb290TW9kdWxlRmlsZU5hbWUsXG4gICAgcHJvamVjdDogb3B0aW9ucy5wcm9qZWN0LFxuICB9O1xuXG4gIHJldHVybiBzY2hlbWF0aWMoJ2NvbXBvbmVudCcsIGNvbXBvbmVudE9wdGlvbnMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAob3B0aW9uczogQXBwU2hlbGxPcHRpb25zKTogUnVsZSB7XG4gIHJldHVybiBhc3luYyAodHJlZSkgPT4ge1xuICAgIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IGdldFdvcmtzcGFjZSh0cmVlKTtcbiAgICBjb25zdCBjbGllbnRQcm9qZWN0ID0gd29ya3NwYWNlLnByb2plY3RzLmdldChvcHRpb25zLnByb2plY3QpO1xuICAgIGlmICghY2xpZW50UHJvamVjdCB8fCBjbGllbnRQcm9qZWN0LmV4dGVuc2lvbnMucHJvamVjdFR5cGUgIT09ICdhcHBsaWNhdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBBIGNsaWVudCBwcm9qZWN0IHR5cGUgb2YgXCJhcHBsaWNhdGlvblwiIGlzIHJlcXVpcmVkLmApO1xuICAgIH1cbiAgICBjb25zdCBjbGllbnRCdWlsZFRhcmdldCA9IGNsaWVudFByb2plY3QudGFyZ2V0cy5nZXQoJ2J1aWxkJyk7XG4gICAgaWYgKCFjbGllbnRCdWlsZFRhcmdldCkge1xuICAgICAgdGhyb3cgdGFyZ2V0QnVpbGROb3RGb3VuZEVycm9yKCk7XG4gICAgfVxuICAgIGNvbnN0IGNsaWVudEJ1aWxkT3B0aW9ucyA9IChjbGllbnRCdWlsZFRhcmdldC5vcHRpb25zIHx8XG4gICAgICB7fSkgYXMgdW5rbm93biBhcyBCcm93c2VyQnVpbGRlck9wdGlvbnM7XG5cbiAgICByZXR1cm4gY2hhaW4oW1xuICAgICAgdmFsaWRhdGVQcm9qZWN0KGNsaWVudEJ1aWxkT3B0aW9ucy5tYWluKSxcbiAgICAgIGNsaWVudFByb2plY3QudGFyZ2V0cy5oYXMoJ3NlcnZlcicpID8gbm9vcCgpIDogYWRkVW5pdmVyc2FsVGFyZ2V0KG9wdGlvbnMpLFxuICAgICAgYWRkQXBwU2hlbGxDb25maWdUb1dvcmtzcGFjZShvcHRpb25zKSxcbiAgICAgIGFkZFJvdXRlck1vZHVsZShjbGllbnRCdWlsZE9wdGlvbnMubWFpbiksXG4gICAgICBhZGRTZXJ2ZXJSb3V0ZXMob3B0aW9ucyksXG4gICAgICBhZGRTaGVsbENvbXBvbmVudChvcHRpb25zKSxcbiAgICBdKTtcbiAgfTtcbn1cbiJdfQ==