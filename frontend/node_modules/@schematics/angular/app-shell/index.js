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
const standalone_1 = require("../private/standalone");
const ts = __importStar(require("../third_party/github.com/Microsoft/TypeScript/lib/typescript"));
const ast_utils_1 = require("../utility/ast-utils");
const change_1 = require("../utility/change");
const ng_ast_utils_1 = require("../utility/ng-ast-utils");
const util_1 = require("../utility/standalone/util");
const workspace_1 = require("../utility/workspace");
const workspace_models_1 = require("../utility/workspace-models");
const APP_SHELL_ROUTE = 'shell';
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
        catch { }
    }
    return template;
}
function getBootstrapComponentPath(host, mainPath) {
    const mainSource = getSourceFile(host, mainPath);
    const bootstrapAppCall = (0, standalone_1.findBootstrapApplicationCall)(mainSource);
    let bootstrappingFilePath;
    let bootstrappingSource;
    let componentName;
    if (bootstrapAppCall) {
        // Standalone Application
        componentName = bootstrapAppCall.arguments[0].getText();
        bootstrappingFilePath = mainPath;
        bootstrappingSource = mainSource;
    }
    else {
        // NgModule Application
        const modulePath = (0, ng_ast_utils_1.getAppModulePath)(host, mainPath);
        const moduleSource = getSourceFile(host, modulePath);
        const metadataNode = (0, ast_utils_1.getDecoratorMetadata)(moduleSource, 'NgModule', '@angular/core')[0];
        const bootstrapProperty = getMetadataProperty(metadataNode, 'bootstrap');
        const arrLiteral = bootstrapProperty.initializer;
        componentName = arrLiteral.elements[0].getText();
        bootstrappingSource = moduleSource;
        bootstrappingFilePath = modulePath;
    }
    const componentRelativeFilePath = (0, ast_utils_1.getSourceNodes)(bootstrappingSource)
        .filter(ts.isImportDeclaration)
        .filter((imp) => {
        return (0, ast_utils_1.findNode)(imp, ts.SyntaxKind.Identifier, componentName);
    })
        .map((imp) => {
        const pathStringLiteral = imp.moduleSpecifier;
        return pathStringLiteral.text;
    })[0];
    return (0, core_1.join)((0, core_1.dirname)((0, core_1.normalize)(bootstrappingFilePath)), componentRelativeFilePath + '.ts');
}
// end helper functions.
function validateProject(mainPath) {
    return (host) => {
        const routerOutletCheckRegex = /<router-outlet.*?>([\s\S]*?)(?:<\/router-outlet>)?/;
        const componentPath = getBootstrapComponentPath(host, mainPath);
        const tmpl = getComponentTemplateInfo(host, componentPath);
        const template = getComponentTemplate(host, componentPath, tmpl);
        if (!routerOutletCheckRegex.test(template)) {
            throw new schematics_1.SchematicsException(`Prerequisite for application shell is to define a router-outlet in your root component.`);
        }
    };
}
function addAppShellConfigToWorkspace(options) {
    return (host, context) => {
        return (0, workspace_1.updateWorkspace)((workspace) => {
            const project = workspace.projects.get(options.project);
            if (!project) {
                return;
            }
            const buildTarget = project.targets.get('build');
            if (buildTarget?.builder === workspace_models_1.Builders.Application) {
                // Application builder configuration.
                const prodConfig = buildTarget.configurations?.production;
                if (!prodConfig) {
                    throw new schematics_1.SchematicsException(`A "production" configuration is not defined for the "build" builder.`);
                }
                prodConfig.appShell = true;
                return;
            }
            // Webpack based builders configuration.
            // Validation of targets is handled already in the main function.
            // Duplicate keys means that we have configurations in both server and build builders.
            const serverConfigKeys = project.targets.get('server')?.configurations ?? {};
            const buildConfigKeys = project.targets.get('build')?.configurations ?? {};
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
                    route: APP_SHELL_ROUTE,
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
        const project = workspace.projects.get(options.project);
        if (!project) {
            throw new schematics_1.SchematicsException(`Invalid project name (${options.project})`);
        }
        const modulePath = getServerModulePath(host, project.sourceRoot || 'src', 'main.server.ts');
        if (modulePath === null) {
            throw new schematics_1.SchematicsException('Server module not found.');
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
            const routeText = `\n\nconst routes: Routes = [ { path: '${APP_SHELL_ROUTE}', component: AppShellComponent }];`;
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
function addStandaloneServerRoute(options) {
    return async (host) => {
        const workspace = await (0, workspace_1.getWorkspace)(host);
        const project = workspace.projects.get(options.project);
        if (!project) {
            throw new schematics_1.SchematicsException(`Project name "${options.project}" doesn't not exist.`);
        }
        const configFilePath = (0, core_1.join)((0, core_1.normalize)(project.sourceRoot ?? 'src'), 'app/app.config.server.ts');
        if (!host.exists(configFilePath)) {
            throw new schematics_1.SchematicsException(`Cannot find "${configFilePath}".`);
        }
        let configSourceFile = getSourceFile(host, configFilePath);
        if (!(0, ast_utils_1.isImported)(configSourceFile, 'ROUTES', '@angular/router')) {
            const routesChange = (0, ast_utils_1.insertImport)(configSourceFile, configFilePath, 'ROUTES', '@angular/router');
            const recorder = host.beginUpdate(configFilePath);
            if (routesChange) {
                (0, change_1.applyToUpdateRecorder)(recorder, [routesChange]);
                host.commitUpdate(recorder);
            }
        }
        configSourceFile = getSourceFile(host, configFilePath);
        const providersLiteral = (0, ast_utils_1.findNodes)(configSourceFile, ts.isPropertyAssignment).find((n) => ts.isArrayLiteralExpression(n.initializer) && n.name.getText() === 'providers')?.initializer;
        if (!providersLiteral) {
            throw new schematics_1.SchematicsException(`Cannot find the "providers" configuration in "${configFilePath}".`);
        }
        // Add route to providers literal.
        const newProvidersLiteral = ts.factory.updateArrayLiteralExpression(providersLiteral, [
            ...providersLiteral.elements,
            ts.factory.createObjectLiteralExpression([
                ts.factory.createPropertyAssignment('provide', ts.factory.createIdentifier('ROUTES')),
                ts.factory.createPropertyAssignment('multi', ts.factory.createIdentifier('true')),
                ts.factory.createPropertyAssignment('useValue', ts.factory.createArrayLiteralExpression([
                    ts.factory.createObjectLiteralExpression([
                        ts.factory.createPropertyAssignment('path', ts.factory.createIdentifier(`'${APP_SHELL_ROUTE}'`)),
                        ts.factory.createPropertyAssignment('component', ts.factory.createIdentifier('AppShellComponent')),
                    ], true),
                ], true)),
            ], true),
        ]);
        const recorder = host.beginUpdate(configFilePath);
        recorder.remove(providersLiteral.getStart(), providersLiteral.getWidth());
        const printer = ts.createPrinter();
        recorder.insertRight(providersLiteral.getStart(), printer.printNode(ts.EmitHint.Unspecified, newProvidersLiteral, configSourceFile));
        // Add AppShellComponent import
        const appShellImportChange = (0, ast_utils_1.insertImport)(configSourceFile, configFilePath, 'AppShellComponent', './app-shell/app-shell.component');
        (0, change_1.applyToUpdateRecorder)(recorder, [appShellImportChange]);
        host.commitUpdate(recorder);
    };
}
function default_1(options) {
    return async (tree) => {
        const browserEntryPoint = await (0, util_1.getMainFilePath)(tree, options.project);
        const isStandalone = (0, ng_ast_utils_1.isStandaloneApp)(tree, browserEntryPoint);
        return (0, schematics_1.chain)([
            validateProject(browserEntryPoint),
            (0, schematics_1.schematic)('server', options),
            addAppShellConfigToWorkspace(options),
            isStandalone ? (0, schematics_1.noop)() : addRouterModule(browserEntryPoint),
            isStandalone ? addStandaloneServerRoute(options) : addServerRoutes(options),
            (0, schematics_1.schematic)('component', {
                name: 'app-shell',
                module: 'app.module.server.ts',
                project: options.project,
                standalone: isStandalone,
            }),
        ]);
    };
}
exports.default = default_1;
