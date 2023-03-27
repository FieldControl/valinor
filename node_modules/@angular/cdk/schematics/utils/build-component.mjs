"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildComponent = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const change_1 = require("@schematics/angular/utility/change");
const workspace_1 = require("@schematics/angular/utility/workspace");
const find_module_1 = require("@schematics/angular/utility/find-module");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const validation_1 = require("@schematics/angular/utility/validation");
const workspace_models_1 = require("@schematics/angular/utility/workspace-models");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const fs_1 = require("fs");
const path_1 = require("path");
const ts = require("typescript");
const get_project_1 = require("./get-project");
const schematic_options_1 = require("./schematic-options");
/**
 * Build a default project path for generating.
 * @param project The project to build the path for.
 */
function buildDefaultPath(project) {
    const root = project.sourceRoot ? `/${project.sourceRoot}/` : `/${project.root}/src/`;
    const projectDirName = project.extensions.projectType === workspace_models_1.ProjectType.Application ? 'app' : 'lib';
    return `${root}${projectDirName}`;
}
/**
 * List of style extensions which are CSS compatible. All supported CLI style extensions can be
 * found here: angular/angular-cli/main/packages/schematics/angular/ng-new/schema.json#L118-L122
 */
const supportedCssExtensions = ['css', 'scss', 'less'];
function readIntoSourceFile(host, modulePath) {
    const text = host.read(modulePath);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
    }
    return ts.createSourceFile(modulePath, text.toString('utf-8'), ts.ScriptTarget.Latest, true);
}
function addDeclarationToNgModule(options) {
    return (host) => {
        if (options.skipImport || !options.module) {
            return host;
        }
        const modulePath = options.module;
        let source = readIntoSourceFile(host, modulePath);
        const componentPath = `/${options.path}/` +
            (options.flat ? '' : core_1.strings.dasherize(options.name) + '/') +
            core_1.strings.dasherize(options.name) +
            '.component';
        const relativePath = (0, find_module_1.buildRelativePath)(modulePath, componentPath);
        const classifiedName = core_1.strings.classify(`${options.name}Component`);
        const declarationChanges = (0, ast_utils_1.addDeclarationToModule)(source, modulePath, classifiedName, relativePath);
        const declarationRecorder = host.beginUpdate(modulePath);
        for (const change of declarationChanges) {
            if (change instanceof change_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        if (options.export) {
            // Need to refresh the AST because we overwrote the file in the host.
            source = readIntoSourceFile(host, modulePath);
            const exportRecorder = host.beginUpdate(modulePath);
            const exportChanges = (0, ast_utils_1.addExportToModule)(source, modulePath, core_1.strings.classify(`${options.name}Component`), relativePath);
            for (const change of exportChanges) {
                if (change instanceof change_1.InsertChange) {
                    exportRecorder.insertLeft(change.pos, change.toAdd);
                }
            }
            host.commitUpdate(exportRecorder);
        }
        return host;
    };
}
function buildSelector(options, projectPrefix) {
    let selector = core_1.strings.dasherize(options.name);
    if (options.prefix) {
        selector = `${options.prefix}-${selector}`;
    }
    else if (options.prefix === undefined && projectPrefix) {
        selector = `${projectPrefix}-${selector}`;
    }
    return selector;
}
/**
 * Indents the text content with the amount of specified spaces. The spaces will be added after
 * every line-break. This utility function can be used inside of EJS templates to properly
 * include the additional files.
 */
function indentTextContent(text, numSpaces) {
    // In the Material project there should be only LF line-endings, but the schematic files
    // are not being linted and therefore there can be also CRLF or just CR line-endings.
    return text.replace(/(\r\n|\r|\n)/g, `$1${' '.repeat(numSpaces)}`);
}
/**
 * Rule that copies and interpolates the files that belong to this schematic context. Additionally
 * a list of file paths can be passed to this rule in order to expose them inside the EJS
 * template context.
 *
 * This allows inlining the external template or stylesheet files in EJS without having
 * to manually duplicate the file content.
 */
function buildComponent(options, additionalFiles = {}) {
    return async (host, ctx) => {
        const context = ctx;
        const workspace = await (0, workspace_1.getWorkspace)(host);
        const project = (0, get_project_1.getProjectFromWorkspace)(workspace, options.project);
        const defaultComponentOptions = (0, schematic_options_1.getDefaultComponentOptions)(project);
        // TODO(devversion): Remove if we drop support for older CLI versions.
        // This handles an unreported breaking change from the @angular-devkit/schematics. Previously
        // the description path resolved to the factory file, but starting from 6.2.0, it resolves
        // to the factory directory.
        const schematicPath = (0, fs_1.statSync)(context.schematic.description.path).isDirectory()
            ? context.schematic.description.path
            : (0, path_1.dirname)(context.schematic.description.path);
        const schematicFilesUrl = './files';
        const schematicFilesPath = (0, path_1.resolve)(schematicPath, schematicFilesUrl);
        // Add the default component option values to the options if an option is not explicitly
        // specified but a default component option is available.
        Object.keys(options)
            .filter(key => options[key] == null &&
            defaultComponentOptions[key])
            .forEach(key => (options[key] = defaultComponentOptions[key]));
        if (options.path === undefined) {
            // TODO(jelbourn): figure out if the need for this `as any` is a bug due to two different
            // incompatible `ProjectDefinition` classes in @angular-devkit
            options.path = buildDefaultPath(project);
        }
        options.module = (0, find_module_1.findModuleFromOptions)(host, options);
        const parsedPath = (0, parse_name_1.parseName)(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        options.selector = options.selector || buildSelector(options, project.prefix);
        (0, validation_1.validateHtmlSelector)(options.selector);
        // In case the specified style extension is not part of the supported CSS supersets,
        // we generate the stylesheets with the "css" extension. This ensures that we don't
        // accidentally generate invalid stylesheets (e.g. drag-drop-comp.styl) which will
        // break the Angular CLI project. See: https://github.com/angular/components/issues/15164
        if (!supportedCssExtensions.includes(options.style)) {
            // TODO: Cast is necessary as we can't use the Style enum which has been introduced
            // within CLI v7.3.0-rc.0. This would break the schematic for older CLI versions.
            options.style = 'css';
        }
        // Object that will be used as context for the EJS templates.
        const baseTemplateContext = {
            ...core_1.strings,
            'if-flat': (s) => (options.flat ? '' : s),
            ...options,
        };
        // Key-value object that includes the specified additional files with their loaded content.
        // The resolved contents can be used inside EJS templates.
        const resolvedFiles = {};
        for (let key in additionalFiles) {
            if (additionalFiles[key]) {
                const fileContent = (0, fs_1.readFileSync)((0, path_1.join)(schematicFilesPath, additionalFiles[key]), 'utf-8');
                // Interpolate the additional files with the base EJS template context.
                resolvedFiles[key] = (0, core_1.template)(fileContent)(baseTemplateContext);
            }
        }
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)(schematicFilesUrl), [
            options.skipTests ? (0, schematics_1.filter)(path => !path.endsWith('.spec.ts.template')) : (0, schematics_1.noop)(),
            options.inlineStyle ? (0, schematics_1.filter)(path => !path.endsWith('.__style__.template')) : (0, schematics_1.noop)(),
            options.inlineTemplate ? (0, schematics_1.filter)(path => !path.endsWith('.html.template')) : (0, schematics_1.noop)(),
            // Treat the template options as any, because the type definition for the template options
            // is made unnecessarily explicit. Every type of object can be used in the EJS template.
            (0, schematics_1.applyTemplates)({ indentTextContent, resolvedFiles, ...baseTemplateContext }),
            // TODO(devversion): figure out why we cannot just remove the first parameter
            // See for example: angular-cli#schematics/angular/component/index.ts#L160
            (0, schematics_1.move)(null, parsedPath.path),
        ]);
        return () => (0, schematics_1.chain)([
            (0, schematics_1.branchAndMerge)((0, schematics_1.chain)([addDeclarationToNgModule(options), (0, schematics_1.mergeWith)(templateSource)])),
        ])(host, context);
    };
}
exports.buildComponent = buildComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL3V0aWxzL2J1aWxkLWNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQ0FBOEU7QUFDOUUsMkRBYW9DO0FBR3BDLCtEQUFnRTtBQUNoRSxxRUFBbUU7QUFDbkUseUVBQWlHO0FBQ2pHLHVFQUFpRTtBQUNqRSx1RUFBNEU7QUFDNUUsbUZBQXlFO0FBQ3pFLHFFQUFnRztBQUNoRywyQkFBMEM7QUFDMUMsK0JBQTRDO0FBQzVDLGlDQUFpQztBQUNqQywrQ0FBc0Q7QUFDdEQsMkRBQStEO0FBRy9EOzs7R0FHRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsT0FBMEI7SUFDbEQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDO0lBRXRGLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxLQUFLLDhCQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUVsRyxPQUFPLEdBQUcsSUFBSSxHQUFHLGNBQWMsRUFBRSxDQUFDO0FBQ3BDLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLHNCQUFzQixHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUV2RCxTQUFTLGtCQUFrQixDQUFDLElBQVUsRUFBRSxVQUFrQjtJQUN4RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ25DLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtRQUNqQixNQUFNLElBQUksZ0NBQW1CLENBQUMsUUFBUSxVQUFVLGtCQUFrQixDQUFDLENBQUM7S0FDckU7SUFFRCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMvRixDQUFDO0FBRUQsU0FBUyx3QkFBd0IsQ0FBQyxPQUF5QjtJQUN6RCxPQUFPLENBQUMsSUFBVSxFQUFFLEVBQUU7UUFDcEIsSUFBSSxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUN6QyxPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUNsQyxJQUFJLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFbEQsTUFBTSxhQUFhLEdBQ2pCLElBQUksT0FBTyxDQUFDLElBQUksR0FBRztZQUNuQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO1lBQzNELGNBQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztZQUMvQixZQUFZLENBQUM7UUFDZixNQUFNLFlBQVksR0FBRyxJQUFBLCtCQUFpQixFQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNsRSxNQUFNLGNBQWMsR0FBRyxjQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUM7UUFFcEUsTUFBTSxrQkFBa0IsR0FBRyxJQUFBLGtDQUFzQixFQUMvQyxNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFDZCxZQUFZLENBQ2IsQ0FBQztRQUVGLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RCxLQUFLLE1BQU0sTUFBTSxJQUFJLGtCQUFrQixFQUFFO1lBQ3ZDLElBQUksTUFBTSxZQUFZLHFCQUFZLEVBQUU7Z0JBQ2xDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMxRDtTQUNGO1FBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRXZDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUNsQixxRUFBcUU7WUFDckUsTUFBTSxHQUFHLGtCQUFrQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztZQUU5QyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sYUFBYSxHQUFHLElBQUEsNkJBQWlCLEVBQ3JDLE1BQU0sRUFDTixVQUFVLEVBQ1YsY0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxFQUM1QyxZQUFZLENBQ2IsQ0FBQztZQUVGLEtBQUssTUFBTSxNQUFNLElBQUksYUFBYSxFQUFFO2dCQUNsQyxJQUFJLE1BQU0sWUFBWSxxQkFBWSxFQUFFO29CQUNsQyxjQUFjLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNyRDthQUNGO1lBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUNuQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLE9BQXlCLEVBQUUsYUFBc0I7SUFDdEUsSUFBSSxRQUFRLEdBQUcsY0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0MsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO1FBQ2xCLFFBQVEsR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksUUFBUSxFQUFFLENBQUM7S0FDNUM7U0FBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLGFBQWEsRUFBRTtRQUN4RCxRQUFRLEdBQUcsR0FBRyxhQUFhLElBQUksUUFBUSxFQUFFLENBQUM7S0FDM0M7SUFFRCxPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQVMsaUJBQWlCLENBQUMsSUFBWSxFQUFFLFNBQWlCO0lBQ3hELHdGQUF3RjtJQUN4RixxRkFBcUY7SUFDckYsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxLQUFLLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3JFLENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsU0FBZ0IsY0FBYyxDQUM1QixPQUF5QixFQUN6QixrQkFBMkMsRUFBRTtJQUU3QyxPQUFPLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDekIsTUFBTSxPQUFPLEdBQUcsR0FBaUMsQ0FBQztRQUNsRCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsd0JBQVksRUFBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxNQUFNLE9BQU8sR0FBRyxJQUFBLHFDQUF1QixFQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEUsTUFBTSx1QkFBdUIsR0FBRyxJQUFBLDhDQUEwQixFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXBFLHNFQUFzRTtRQUN0RSw2RkFBNkY7UUFDN0YsMEZBQTBGO1FBQzFGLDRCQUE0QjtRQUM1QixNQUFNLGFBQWEsR0FBRyxJQUFBLGFBQVEsRUFBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUU7WUFDOUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUk7WUFDcEMsQ0FBQyxDQUFDLElBQUEsY0FBTyxFQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhELE1BQU0saUJBQWlCLEdBQUcsU0FBUyxDQUFDO1FBQ3BDLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSxjQUFPLEVBQUMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFckUsd0ZBQXdGO1FBQ3hGLHlEQUF5RDtRQUN6RCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUNqQixNQUFNLENBQ0wsR0FBRyxDQUFDLEVBQUUsQ0FDSixPQUFPLENBQUMsR0FBNkIsQ0FBQyxJQUFJLElBQUk7WUFDOUMsdUJBQXVCLENBQUMsR0FBNkIsQ0FBQyxDQUN6RDthQUNBLE9BQU8sQ0FDTixHQUFHLENBQUMsRUFBRSxDQUNKLENBQUUsT0FBZSxDQUFDLEdBQUcsQ0FBQyxHQUFJLHVCQUE0QyxDQUNwRSxHQUE2QixDQUM5QixDQUFDLENBQ0wsQ0FBQztRQUVKLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDOUIseUZBQXlGO1lBQ3pGLDhEQUE4RDtZQUM5RCxPQUFPLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDLE9BQWMsQ0FBQyxDQUFDO1NBQ2pEO1FBRUQsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFBLG1DQUFxQixFQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV0RCxNQUFNLFVBQVUsR0FBRyxJQUFBLHNCQUFTLEVBQUMsT0FBTyxDQUFDLElBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFMUQsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztRQUMvQixPQUFPLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFOUUsSUFBQSxpQ0FBb0IsRUFBQyxPQUFPLENBQUMsUUFBUyxDQUFDLENBQUM7UUFFeEMsb0ZBQW9GO1FBQ3BGLG1GQUFtRjtRQUNuRixrRkFBa0Y7UUFDbEYseUZBQXlGO1FBQ3pGLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQU0sQ0FBQyxFQUFFO1lBQ3BELG1GQUFtRjtZQUNuRixpRkFBaUY7WUFDakYsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFjLENBQUM7U0FDaEM7UUFFRCw2REFBNkQ7UUFDN0QsTUFBTSxtQkFBbUIsR0FBRztZQUMxQixHQUFHLGNBQU87WUFDVixTQUFTLEVBQUUsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakQsR0FBRyxPQUFPO1NBQ1gsQ0FBQztRQUVGLDJGQUEyRjtRQUMzRiwwREFBMEQ7UUFDMUQsTUFBTSxhQUFhLEdBQTJCLEVBQUUsQ0FBQztRQUVqRCxLQUFLLElBQUksR0FBRyxJQUFJLGVBQWUsRUFBRTtZQUMvQixJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDeEIsTUFBTSxXQUFXLEdBQUcsSUFBQSxpQkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLGtCQUFrQixFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUUxRix1RUFBdUU7Z0JBQ3ZFLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFBLGVBQW1CLEVBQUMsV0FBVyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQzthQUM1RTtTQUNGO1FBRUQsTUFBTSxjQUFjLEdBQUcsSUFBQSxrQkFBSyxFQUFDLElBQUEsZ0JBQUcsRUFBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQ25ELE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUEsbUJBQU0sRUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUEsaUJBQUksR0FBRTtZQUNoRixPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFBLG1CQUFNLEVBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLGlCQUFJLEdBQUU7WUFDcEYsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBQSxtQkFBTSxFQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxpQkFBSSxHQUFFO1lBQ2xGLDBGQUEwRjtZQUMxRix3RkFBd0Y7WUFDeEYsSUFBQSwyQkFBYyxFQUFDLEVBQUMsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLEdBQUcsbUJBQW1CLEVBQVEsQ0FBQztZQUNqRiw2RUFBNkU7WUFDN0UsMEVBQTBFO1lBQzFFLElBQUEsaUJBQUksRUFBQyxJQUFXLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQztTQUNuQyxDQUFDLENBQUM7UUFFSCxPQUFPLEdBQUcsRUFBRSxDQUNWLElBQUEsa0JBQUssRUFBQztZQUNKLElBQUEsMkJBQWMsRUFBQyxJQUFBLGtCQUFLLEVBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFBLHNCQUFTLEVBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RGLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEIsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQW5HRCx3Q0FtR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtzdHJpbmdzLCB0ZW1wbGF0ZSBhcyBpbnRlcnBvbGF0ZVRlbXBsYXRlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQge1xuICBhcHBseSxcbiAgYXBwbHlUZW1wbGF0ZXMsXG4gIGJyYW5jaEFuZE1lcmdlLFxuICBjaGFpbixcbiAgZmlsdGVyLFxuICBtZXJnZVdpdGgsXG4gIG1vdmUsXG4gIG5vb3AsXG4gIFJ1bGUsXG4gIFNjaGVtYXRpY3NFeGNlcHRpb24sXG4gIFRyZWUsXG4gIHVybCxcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtGaWxlU3lzdGVtU2NoZW1hdGljQ29udGV4dH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdG9vbHMnO1xuaW1wb3J0IHtTY2hlbWEgYXMgQ29tcG9uZW50T3B0aW9ucywgU3R5bGV9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvY29tcG9uZW50L3NjaGVtYSc7XG5pbXBvcnQge0luc2VydENoYW5nZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L2NoYW5nZSc7XG5pbXBvcnQge2dldFdvcmtzcGFjZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3dvcmtzcGFjZSc7XG5pbXBvcnQge2J1aWxkUmVsYXRpdmVQYXRoLCBmaW5kTW9kdWxlRnJvbU9wdGlvbnN9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS9maW5kLW1vZHVsZSc7XG5pbXBvcnQge3BhcnNlTmFtZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3BhcnNlLW5hbWUnO1xuaW1wb3J0IHt2YWxpZGF0ZUh0bWxTZWxlY3Rvcn0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtQcm9qZWN0VHlwZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3dvcmtzcGFjZS1tb2RlbHMnO1xuaW1wb3J0IHthZGREZWNsYXJhdGlvblRvTW9kdWxlLCBhZGRFeHBvcnRUb01vZHVsZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L2FzdC11dGlscyc7XG5pbXBvcnQge3JlYWRGaWxlU3luYywgc3RhdFN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7ZGlybmFtZSwgam9pbiwgcmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcbmltcG9ydCB7Z2V0UHJvamVjdEZyb21Xb3Jrc3BhY2V9IGZyb20gJy4vZ2V0LXByb2plY3QnO1xuaW1wb3J0IHtnZXREZWZhdWx0Q29tcG9uZW50T3B0aW9uc30gZnJvbSAnLi9zY2hlbWF0aWMtb3B0aW9ucyc7XG5pbXBvcnQge1Byb2plY3REZWZpbml0aW9ufSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZS9zcmMvd29ya3NwYWNlJztcblxuLyoqXG4gKiBCdWlsZCBhIGRlZmF1bHQgcHJvamVjdCBwYXRoIGZvciBnZW5lcmF0aW5nLlxuICogQHBhcmFtIHByb2plY3QgVGhlIHByb2plY3QgdG8gYnVpbGQgdGhlIHBhdGggZm9yLlxuICovXG5mdW5jdGlvbiBidWlsZERlZmF1bHRQYXRoKHByb2plY3Q6IFByb2plY3REZWZpbml0aW9uKTogc3RyaW5nIHtcbiAgY29uc3Qgcm9vdCA9IHByb2plY3Quc291cmNlUm9vdCA/IGAvJHtwcm9qZWN0LnNvdXJjZVJvb3R9L2AgOiBgLyR7cHJvamVjdC5yb290fS9zcmMvYDtcblxuICBjb25zdCBwcm9qZWN0RGlyTmFtZSA9IHByb2plY3QuZXh0ZW5zaW9ucy5wcm9qZWN0VHlwZSA9PT0gUHJvamVjdFR5cGUuQXBwbGljYXRpb24gPyAnYXBwJyA6ICdsaWInO1xuXG4gIHJldHVybiBgJHtyb290fSR7cHJvamVjdERpck5hbWV9YDtcbn1cblxuLyoqXG4gKiBMaXN0IG9mIHN0eWxlIGV4dGVuc2lvbnMgd2hpY2ggYXJlIENTUyBjb21wYXRpYmxlLiBBbGwgc3VwcG9ydGVkIENMSSBzdHlsZSBleHRlbnNpb25zIGNhbiBiZVxuICogZm91bmQgaGVyZTogYW5ndWxhci9hbmd1bGFyLWNsaS9tYWluL3BhY2thZ2VzL3NjaGVtYXRpY3MvYW5ndWxhci9uZy1uZXcvc2NoZW1hLmpzb24jTDExOC1MMTIyXG4gKi9cbmNvbnN0IHN1cHBvcnRlZENzc0V4dGVuc2lvbnMgPSBbJ2NzcycsICdzY3NzJywgJ2xlc3MnXTtcblxuZnVuY3Rpb24gcmVhZEludG9Tb3VyY2VGaWxlKGhvc3Q6IFRyZWUsIG1vZHVsZVBhdGg6IHN0cmluZykge1xuICBjb25zdCB0ZXh0ID0gaG9zdC5yZWFkKG1vZHVsZVBhdGgpO1xuICBpZiAodGV4dCA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBGaWxlICR7bW9kdWxlUGF0aH0gZG9lcyBub3QgZXhpc3QuYCk7XG4gIH1cblxuICByZXR1cm4gdHMuY3JlYXRlU291cmNlRmlsZShtb2R1bGVQYXRoLCB0ZXh0LnRvU3RyaW5nKCd1dGYtOCcpLCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gYWRkRGVjbGFyYXRpb25Ub05nTW9kdWxlKG9wdGlvbnM6IENvbXBvbmVudE9wdGlvbnMpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlKSA9PiB7XG4gICAgaWYgKG9wdGlvbnMuc2tpcEltcG9ydCB8fCAhb3B0aW9ucy5tb2R1bGUpIHtcbiAgICAgIHJldHVybiBob3N0O1xuICAgIH1cblxuICAgIGNvbnN0IG1vZHVsZVBhdGggPSBvcHRpb25zLm1vZHVsZTtcbiAgICBsZXQgc291cmNlID0gcmVhZEludG9Tb3VyY2VGaWxlKGhvc3QsIG1vZHVsZVBhdGgpO1xuXG4gICAgY29uc3QgY29tcG9uZW50UGF0aCA9XG4gICAgICBgLyR7b3B0aW9ucy5wYXRofS9gICtcbiAgICAgIChvcHRpb25zLmZsYXQgPyAnJyA6IHN0cmluZ3MuZGFzaGVyaXplKG9wdGlvbnMubmFtZSkgKyAnLycpICtcbiAgICAgIHN0cmluZ3MuZGFzaGVyaXplKG9wdGlvbnMubmFtZSkgK1xuICAgICAgJy5jb21wb25lbnQnO1xuICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IGJ1aWxkUmVsYXRpdmVQYXRoKG1vZHVsZVBhdGgsIGNvbXBvbmVudFBhdGgpO1xuICAgIGNvbnN0IGNsYXNzaWZpZWROYW1lID0gc3RyaW5ncy5jbGFzc2lmeShgJHtvcHRpb25zLm5hbWV9Q29tcG9uZW50YCk7XG5cbiAgICBjb25zdCBkZWNsYXJhdGlvbkNoYW5nZXMgPSBhZGREZWNsYXJhdGlvblRvTW9kdWxlKFxuICAgICAgc291cmNlLFxuICAgICAgbW9kdWxlUGF0aCxcbiAgICAgIGNsYXNzaWZpZWROYW1lLFxuICAgICAgcmVsYXRpdmVQYXRoLFxuICAgICk7XG5cbiAgICBjb25zdCBkZWNsYXJhdGlvblJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShtb2R1bGVQYXRoKTtcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBkZWNsYXJhdGlvbkNoYW5nZXMpIHtcbiAgICAgIGlmIChjaGFuZ2UgaW5zdGFuY2VvZiBJbnNlcnRDaGFuZ2UpIHtcbiAgICAgICAgZGVjbGFyYXRpb25SZWNvcmRlci5pbnNlcnRMZWZ0KGNoYW5nZS5wb3MsIGNoYW5nZS50b0FkZCk7XG4gICAgICB9XG4gICAgfVxuICAgIGhvc3QuY29tbWl0VXBkYXRlKGRlY2xhcmF0aW9uUmVjb3JkZXIpO1xuXG4gICAgaWYgKG9wdGlvbnMuZXhwb3J0KSB7XG4gICAgICAvLyBOZWVkIHRvIHJlZnJlc2ggdGhlIEFTVCBiZWNhdXNlIHdlIG92ZXJ3cm90ZSB0aGUgZmlsZSBpbiB0aGUgaG9zdC5cbiAgICAgIHNvdXJjZSA9IHJlYWRJbnRvU291cmNlRmlsZShob3N0LCBtb2R1bGVQYXRoKTtcblxuICAgICAgY29uc3QgZXhwb3J0UmVjb3JkZXIgPSBob3N0LmJlZ2luVXBkYXRlKG1vZHVsZVBhdGgpO1xuICAgICAgY29uc3QgZXhwb3J0Q2hhbmdlcyA9IGFkZEV4cG9ydFRvTW9kdWxlKFxuICAgICAgICBzb3VyY2UsXG4gICAgICAgIG1vZHVsZVBhdGgsXG4gICAgICAgIHN0cmluZ3MuY2xhc3NpZnkoYCR7b3B0aW9ucy5uYW1lfUNvbXBvbmVudGApLFxuICAgICAgICByZWxhdGl2ZVBhdGgsXG4gICAgICApO1xuXG4gICAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBleHBvcnRDaGFuZ2VzKSB7XG4gICAgICAgIGlmIChjaGFuZ2UgaW5zdGFuY2VvZiBJbnNlcnRDaGFuZ2UpIHtcbiAgICAgICAgICBleHBvcnRSZWNvcmRlci5pbnNlcnRMZWZ0KGNoYW5nZS5wb3MsIGNoYW5nZS50b0FkZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGhvc3QuY29tbWl0VXBkYXRlKGV4cG9ydFJlY29yZGVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYnVpbGRTZWxlY3RvcihvcHRpb25zOiBDb21wb25lbnRPcHRpb25zLCBwcm9qZWN0UHJlZml4Pzogc3RyaW5nKSB7XG4gIGxldCBzZWxlY3RvciA9IHN0cmluZ3MuZGFzaGVyaXplKG9wdGlvbnMubmFtZSk7XG4gIGlmIChvcHRpb25zLnByZWZpeCkge1xuICAgIHNlbGVjdG9yID0gYCR7b3B0aW9ucy5wcmVmaXh9LSR7c2VsZWN0b3J9YDtcbiAgfSBlbHNlIGlmIChvcHRpb25zLnByZWZpeCA9PT0gdW5kZWZpbmVkICYmIHByb2plY3RQcmVmaXgpIHtcbiAgICBzZWxlY3RvciA9IGAke3Byb2plY3RQcmVmaXh9LSR7c2VsZWN0b3J9YDtcbiAgfVxuXG4gIHJldHVybiBzZWxlY3Rvcjtcbn1cblxuLyoqXG4gKiBJbmRlbnRzIHRoZSB0ZXh0IGNvbnRlbnQgd2l0aCB0aGUgYW1vdW50IG9mIHNwZWNpZmllZCBzcGFjZXMuIFRoZSBzcGFjZXMgd2lsbCBiZSBhZGRlZCBhZnRlclxuICogZXZlcnkgbGluZS1icmVhay4gVGhpcyB1dGlsaXR5IGZ1bmN0aW9uIGNhbiBiZSB1c2VkIGluc2lkZSBvZiBFSlMgdGVtcGxhdGVzIHRvIHByb3Blcmx5XG4gKiBpbmNsdWRlIHRoZSBhZGRpdGlvbmFsIGZpbGVzLlxuICovXG5mdW5jdGlvbiBpbmRlbnRUZXh0Q29udGVudCh0ZXh0OiBzdHJpbmcsIG51bVNwYWNlczogbnVtYmVyKTogc3RyaW5nIHtcbiAgLy8gSW4gdGhlIE1hdGVyaWFsIHByb2plY3QgdGhlcmUgc2hvdWxkIGJlIG9ubHkgTEYgbGluZS1lbmRpbmdzLCBidXQgdGhlIHNjaGVtYXRpYyBmaWxlc1xuICAvLyBhcmUgbm90IGJlaW5nIGxpbnRlZCBhbmQgdGhlcmVmb3JlIHRoZXJlIGNhbiBiZSBhbHNvIENSTEYgb3IganVzdCBDUiBsaW5lLWVuZGluZ3MuXG4gIHJldHVybiB0ZXh0LnJlcGxhY2UoLyhcXHJcXG58XFxyfFxcbikvZywgYCQxJHsnICcucmVwZWF0KG51bVNwYWNlcyl9YCk7XG59XG5cbi8qKlxuICogUnVsZSB0aGF0IGNvcGllcyBhbmQgaW50ZXJwb2xhdGVzIHRoZSBmaWxlcyB0aGF0IGJlbG9uZyB0byB0aGlzIHNjaGVtYXRpYyBjb250ZXh0LiBBZGRpdGlvbmFsbHlcbiAqIGEgbGlzdCBvZiBmaWxlIHBhdGhzIGNhbiBiZSBwYXNzZWQgdG8gdGhpcyBydWxlIGluIG9yZGVyIHRvIGV4cG9zZSB0aGVtIGluc2lkZSB0aGUgRUpTXG4gKiB0ZW1wbGF0ZSBjb250ZXh0LlxuICpcbiAqIFRoaXMgYWxsb3dzIGlubGluaW5nIHRoZSBleHRlcm5hbCB0ZW1wbGF0ZSBvciBzdHlsZXNoZWV0IGZpbGVzIGluIEVKUyB3aXRob3V0IGhhdmluZ1xuICogdG8gbWFudWFsbHkgZHVwbGljYXRlIHRoZSBmaWxlIGNvbnRlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENvbXBvbmVudChcbiAgb3B0aW9uczogQ29tcG9uZW50T3B0aW9ucyxcbiAgYWRkaXRpb25hbEZpbGVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9LFxuKTogUnVsZSB7XG4gIHJldHVybiBhc3luYyAoaG9zdCwgY3R4KSA9PiB7XG4gICAgY29uc3QgY29udGV4dCA9IGN0eCBhcyBGaWxlU3lzdGVtU2NoZW1hdGljQ29udGV4dDtcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoaG9zdCk7XG4gICAgY29uc3QgcHJvamVjdCA9IGdldFByb2plY3RGcm9tV29ya3NwYWNlKHdvcmtzcGFjZSwgb3B0aW9ucy5wcm9qZWN0KTtcbiAgICBjb25zdCBkZWZhdWx0Q29tcG9uZW50T3B0aW9ucyA9IGdldERlZmF1bHRDb21wb25lbnRPcHRpb25zKHByb2plY3QpO1xuXG4gICAgLy8gVE9ETyhkZXZ2ZXJzaW9uKTogUmVtb3ZlIGlmIHdlIGRyb3Agc3VwcG9ydCBmb3Igb2xkZXIgQ0xJIHZlcnNpb25zLlxuICAgIC8vIFRoaXMgaGFuZGxlcyBhbiB1bnJlcG9ydGVkIGJyZWFraW5nIGNoYW5nZSBmcm9tIHRoZSBAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy4gUHJldmlvdXNseVxuICAgIC8vIHRoZSBkZXNjcmlwdGlvbiBwYXRoIHJlc29sdmVkIHRvIHRoZSBmYWN0b3J5IGZpbGUsIGJ1dCBzdGFydGluZyBmcm9tIDYuMi4wLCBpdCByZXNvbHZlc1xuICAgIC8vIHRvIHRoZSBmYWN0b3J5IGRpcmVjdG9yeS5cbiAgICBjb25zdCBzY2hlbWF0aWNQYXRoID0gc3RhdFN5bmMoY29udGV4dC5zY2hlbWF0aWMuZGVzY3JpcHRpb24ucGF0aCkuaXNEaXJlY3RvcnkoKVxuICAgICAgPyBjb250ZXh0LnNjaGVtYXRpYy5kZXNjcmlwdGlvbi5wYXRoXG4gICAgICA6IGRpcm5hbWUoY29udGV4dC5zY2hlbWF0aWMuZGVzY3JpcHRpb24ucGF0aCk7XG5cbiAgICBjb25zdCBzY2hlbWF0aWNGaWxlc1VybCA9ICcuL2ZpbGVzJztcbiAgICBjb25zdCBzY2hlbWF0aWNGaWxlc1BhdGggPSByZXNvbHZlKHNjaGVtYXRpY1BhdGgsIHNjaGVtYXRpY0ZpbGVzVXJsKTtcblxuICAgIC8vIEFkZCB0aGUgZGVmYXVsdCBjb21wb25lbnQgb3B0aW9uIHZhbHVlcyB0byB0aGUgb3B0aW9ucyBpZiBhbiBvcHRpb24gaXMgbm90IGV4cGxpY2l0bHlcbiAgICAvLyBzcGVjaWZpZWQgYnV0IGEgZGVmYXVsdCBjb21wb25lbnQgb3B0aW9uIGlzIGF2YWlsYWJsZS5cbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKVxuICAgICAgLmZpbHRlcihcbiAgICAgICAga2V5ID0+XG4gICAgICAgICAgb3B0aW9uc1trZXkgYXMga2V5b2YgQ29tcG9uZW50T3B0aW9uc10gPT0gbnVsbCAmJlxuICAgICAgICAgIGRlZmF1bHRDb21wb25lbnRPcHRpb25zW2tleSBhcyBrZXlvZiBDb21wb25lbnRPcHRpb25zXSxcbiAgICAgIClcbiAgICAgIC5mb3JFYWNoKFxuICAgICAgICBrZXkgPT5cbiAgICAgICAgICAoKG9wdGlvbnMgYXMgYW55KVtrZXldID0gKGRlZmF1bHRDb21wb25lbnRPcHRpb25zIGFzIENvbXBvbmVudE9wdGlvbnMpW1xuICAgICAgICAgICAga2V5IGFzIGtleW9mIENvbXBvbmVudE9wdGlvbnNcbiAgICAgICAgICBdKSxcbiAgICAgICk7XG5cbiAgICBpZiAob3B0aW9ucy5wYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFRPRE8oamVsYm91cm4pOiBmaWd1cmUgb3V0IGlmIHRoZSBuZWVkIGZvciB0aGlzIGBhcyBhbnlgIGlzIGEgYnVnIGR1ZSB0byB0d28gZGlmZmVyZW50XG4gICAgICAvLyBpbmNvbXBhdGlibGUgYFByb2plY3REZWZpbml0aW9uYCBjbGFzc2VzIGluIEBhbmd1bGFyLWRldmtpdFxuICAgICAgb3B0aW9ucy5wYXRoID0gYnVpbGREZWZhdWx0UGF0aChwcm9qZWN0IGFzIGFueSk7XG4gICAgfVxuXG4gICAgb3B0aW9ucy5tb2R1bGUgPSBmaW5kTW9kdWxlRnJvbU9wdGlvbnMoaG9zdCwgb3B0aW9ucyk7XG5cbiAgICBjb25zdCBwYXJzZWRQYXRoID0gcGFyc2VOYW1lKG9wdGlvbnMucGF0aCEsIG9wdGlvbnMubmFtZSk7XG5cbiAgICBvcHRpb25zLm5hbWUgPSBwYXJzZWRQYXRoLm5hbWU7XG4gICAgb3B0aW9ucy5wYXRoID0gcGFyc2VkUGF0aC5wYXRoO1xuICAgIG9wdGlvbnMuc2VsZWN0b3IgPSBvcHRpb25zLnNlbGVjdG9yIHx8IGJ1aWxkU2VsZWN0b3Iob3B0aW9ucywgcHJvamVjdC5wcmVmaXgpO1xuXG4gICAgdmFsaWRhdGVIdG1sU2VsZWN0b3Iob3B0aW9ucy5zZWxlY3RvciEpO1xuXG4gICAgLy8gSW4gY2FzZSB0aGUgc3BlY2lmaWVkIHN0eWxlIGV4dGVuc2lvbiBpcyBub3QgcGFydCBvZiB0aGUgc3VwcG9ydGVkIENTUyBzdXBlcnNldHMsXG4gICAgLy8gd2UgZ2VuZXJhdGUgdGhlIHN0eWxlc2hlZXRzIHdpdGggdGhlIFwiY3NzXCIgZXh0ZW5zaW9uLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBkb24ndFxuICAgIC8vIGFjY2lkZW50YWxseSBnZW5lcmF0ZSBpbnZhbGlkIHN0eWxlc2hlZXRzIChlLmcuIGRyYWctZHJvcC1jb21wLnN0eWwpIHdoaWNoIHdpbGxcbiAgICAvLyBicmVhayB0aGUgQW5ndWxhciBDTEkgcHJvamVjdC4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL2lzc3Vlcy8xNTE2NFxuICAgIGlmICghc3VwcG9ydGVkQ3NzRXh0ZW5zaW9ucy5pbmNsdWRlcyhvcHRpb25zLnN0eWxlISkpIHtcbiAgICAgIC8vIFRPRE86IENhc3QgaXMgbmVjZXNzYXJ5IGFzIHdlIGNhbid0IHVzZSB0aGUgU3R5bGUgZW51bSB3aGljaCBoYXMgYmVlbiBpbnRyb2R1Y2VkXG4gICAgICAvLyB3aXRoaW4gQ0xJIHY3LjMuMC1yYy4wLiBUaGlzIHdvdWxkIGJyZWFrIHRoZSBzY2hlbWF0aWMgZm9yIG9sZGVyIENMSSB2ZXJzaW9ucy5cbiAgICAgIG9wdGlvbnMuc3R5bGUgPSAnY3NzJyBhcyBTdHlsZTtcbiAgICB9XG5cbiAgICAvLyBPYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgYXMgY29udGV4dCBmb3IgdGhlIEVKUyB0ZW1wbGF0ZXMuXG4gICAgY29uc3QgYmFzZVRlbXBsYXRlQ29udGV4dCA9IHtcbiAgICAgIC4uLnN0cmluZ3MsXG4gICAgICAnaWYtZmxhdCc6IChzOiBzdHJpbmcpID0+IChvcHRpb25zLmZsYXQgPyAnJyA6IHMpLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICB9O1xuXG4gICAgLy8gS2V5LXZhbHVlIG9iamVjdCB0aGF0IGluY2x1ZGVzIHRoZSBzcGVjaWZpZWQgYWRkaXRpb25hbCBmaWxlcyB3aXRoIHRoZWlyIGxvYWRlZCBjb250ZW50LlxuICAgIC8vIFRoZSByZXNvbHZlZCBjb250ZW50cyBjYW4gYmUgdXNlZCBpbnNpZGUgRUpTIHRlbXBsYXRlcy5cbiAgICBjb25zdCByZXNvbHZlZEZpbGVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG5cbiAgICBmb3IgKGxldCBrZXkgaW4gYWRkaXRpb25hbEZpbGVzKSB7XG4gICAgICBpZiAoYWRkaXRpb25hbEZpbGVzW2tleV0pIHtcbiAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSByZWFkRmlsZVN5bmMoam9pbihzY2hlbWF0aWNGaWxlc1BhdGgsIGFkZGl0aW9uYWxGaWxlc1trZXldKSwgJ3V0Zi04Jyk7XG5cbiAgICAgICAgLy8gSW50ZXJwb2xhdGUgdGhlIGFkZGl0aW9uYWwgZmlsZXMgd2l0aCB0aGUgYmFzZSBFSlMgdGVtcGxhdGUgY29udGV4dC5cbiAgICAgICAgcmVzb2x2ZWRGaWxlc1trZXldID0gaW50ZXJwb2xhdGVUZW1wbGF0ZShmaWxlQ29udGVudCkoYmFzZVRlbXBsYXRlQ29udGV4dCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdGVtcGxhdGVTb3VyY2UgPSBhcHBseSh1cmwoc2NoZW1hdGljRmlsZXNVcmwpLCBbXG4gICAgICBvcHRpb25zLnNraXBUZXN0cyA/IGZpbHRlcihwYXRoID0+ICFwYXRoLmVuZHNXaXRoKCcuc3BlYy50cy50ZW1wbGF0ZScpKSA6IG5vb3AoKSxcbiAgICAgIG9wdGlvbnMuaW5saW5lU3R5bGUgPyBmaWx0ZXIocGF0aCA9PiAhcGF0aC5lbmRzV2l0aCgnLl9fc3R5bGVfXy50ZW1wbGF0ZScpKSA6IG5vb3AoKSxcbiAgICAgIG9wdGlvbnMuaW5saW5lVGVtcGxhdGUgPyBmaWx0ZXIocGF0aCA9PiAhcGF0aC5lbmRzV2l0aCgnLmh0bWwudGVtcGxhdGUnKSkgOiBub29wKCksXG4gICAgICAvLyBUcmVhdCB0aGUgdGVtcGxhdGUgb3B0aW9ucyBhcyBhbnksIGJlY2F1c2UgdGhlIHR5cGUgZGVmaW5pdGlvbiBmb3IgdGhlIHRlbXBsYXRlIG9wdGlvbnNcbiAgICAgIC8vIGlzIG1hZGUgdW5uZWNlc3NhcmlseSBleHBsaWNpdC4gRXZlcnkgdHlwZSBvZiBvYmplY3QgY2FuIGJlIHVzZWQgaW4gdGhlIEVKUyB0ZW1wbGF0ZS5cbiAgICAgIGFwcGx5VGVtcGxhdGVzKHtpbmRlbnRUZXh0Q29udGVudCwgcmVzb2x2ZWRGaWxlcywgLi4uYmFzZVRlbXBsYXRlQ29udGV4dH0gYXMgYW55KSxcbiAgICAgIC8vIFRPRE8oZGV2dmVyc2lvbik6IGZpZ3VyZSBvdXQgd2h5IHdlIGNhbm5vdCBqdXN0IHJlbW92ZSB0aGUgZmlyc3QgcGFyYW1ldGVyXG4gICAgICAvLyBTZWUgZm9yIGV4YW1wbGU6IGFuZ3VsYXItY2xpI3NjaGVtYXRpY3MvYW5ndWxhci9jb21wb25lbnQvaW5kZXgudHMjTDE2MFxuICAgICAgbW92ZShudWxsIGFzIGFueSwgcGFyc2VkUGF0aC5wYXRoKSxcbiAgICBdKTtcblxuICAgIHJldHVybiAoKSA9PlxuICAgICAgY2hhaW4oW1xuICAgICAgICBicmFuY2hBbmRNZXJnZShjaGFpbihbYWRkRGVjbGFyYXRpb25Ub05nTW9kdWxlKG9wdGlvbnMpLCBtZXJnZVdpdGgodGVtcGxhdGVTb3VyY2UpXSkpLFxuICAgICAgXSkoaG9zdCwgY29udGV4dCk7XG4gIH07XG59XG4iXX0=