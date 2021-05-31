"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const fs_1 = require("fs");
const path_1 = require("path");
const ts = require("typescript");
const vendored_ast_utils_1 = require("../utils/vendored-ast-utils");
const get_project_1 = require("./get-project");
const schematic_options_1 = require("./schematic-options");
/**
 * Build a default project path for generating.
 * @param project The project to build the path for.
 */
function buildDefaultPath(project) {
    const root = project.sourceRoot
        ? `/${project.sourceRoot}/`
        : `/${project.root}/src/`;
    const projectDirName = project.extensions.projectType === workspace_models_1.ProjectType.Application ? 'app' : 'lib';
    return `${root}${projectDirName}`;
}
/**
 * List of style extensions which are CSS compatible. All supported CLI style extensions can be
 * found here: angular/angular-cli/master/packages/schematics/angular/ng-new/schema.json#L118-L122
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
        const componentPath = `/${options.path}/`
            + (options.flat ? '' : core_1.strings.dasherize(options.name) + '/')
            + core_1.strings.dasherize(options.name)
            + '.component';
        const relativePath = find_module_1.buildRelativePath(modulePath, componentPath);
        const classifiedName = core_1.strings.classify(`${options.name}Component`);
        const declarationChanges = vendored_ast_utils_1.addDeclarationToModule(source, modulePath, classifiedName, relativePath);
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
            const exportChanges = vendored_ast_utils_1.addExportToModule(source, modulePath, core_1.strings.classify(`${options.name}Component`), relativePath);
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
    return (host, context) => __awaiter(this, void 0, void 0, function* () {
        const workspace = yield workspace_1.getWorkspace(host);
        const project = get_project_1.getProjectFromWorkspace(workspace, options.project);
        const defaultComponentOptions = schematic_options_1.getDefaultComponentOptions(project);
        // TODO(devversion): Remove if we drop support for older CLI versions.
        // This handles an unreported breaking change from the @angular-devkit/schematics. Previously
        // the description path resolved to the factory file, but starting from 6.2.0, it resolves
        // to the factory directory.
        const schematicPath = fs_1.statSync(context.schematic.description.path).isDirectory() ?
            context.schematic.description.path :
            path_1.dirname(context.schematic.description.path);
        const schematicFilesUrl = './files';
        const schematicFilesPath = path_1.resolve(schematicPath, schematicFilesUrl);
        // Add the default component option values to the options if an option is not explicitly
        // specified but a default component option is available.
        Object.keys(options)
            .filter(optionName => options[optionName] == null && defaultComponentOptions[optionName])
            .forEach(optionName => options[optionName] = defaultComponentOptions[optionName]);
        if (options.path === undefined) {
            // TODO(jelbourn): figure out if the need for this `as any` is a bug due to two different
            // incompatible `ProjectDefinition` classes in @angular-devkit
            options.path = buildDefaultPath(project);
        }
        options.module = find_module_1.findModuleFromOptions(host, options);
        const parsedPath = parse_name_1.parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        options.selector = options.selector || buildSelector(options, project.prefix);
        validation_1.validateName(options.name);
        validation_1.validateHtmlSelector(options.selector);
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
        const baseTemplateContext = Object.assign(Object.assign(Object.assign({}, core_1.strings), { 'if-flat': (s) => options.flat ? '' : s }), options);
        // Key-value object that includes the specified additional files with their loaded content.
        // The resolved contents can be used inside EJS templates.
        const resolvedFiles = {};
        for (let key in additionalFiles) {
            if (additionalFiles[key]) {
                const fileContent = fs_1.readFileSync(path_1.join(schematicFilesPath, additionalFiles[key]), 'utf-8');
                // Interpolate the additional files with the base EJS template context.
                resolvedFiles[key] = core_1.template(fileContent)(baseTemplateContext);
            }
        }
        const templateSource = schematics_1.apply(schematics_1.url(schematicFilesUrl), [
            options.skipTests ? schematics_1.filter(path => !path.endsWith('.spec.ts.template')) : schematics_1.noop(),
            options.inlineStyle ? schematics_1.filter(path => !path.endsWith('.__style__.template')) : schematics_1.noop(),
            options.inlineTemplate ? schematics_1.filter(path => !path.endsWith('.html.template')) : schematics_1.noop(),
            // Treat the template options as any, because the type definition for the template options
            // is made unnecessarily explicit. Every type of object can be used in the EJS template.
            schematics_1.applyTemplates(Object.assign({ indentTextContent, resolvedFiles }, baseTemplateContext)),
            // TODO(devversion): figure out why we cannot just remove the first parameter
            // See for example: angular-cli#schematics/angular/component/index.ts#L160
            schematics_1.move(null, parsedPath.path),
        ]);
        return () => schematics_1.chain([
            schematics_1.branchAndMerge(schematics_1.chain([
                addDeclarationToNgModule(options),
                schematics_1.mergeWith(templateSource),
            ])),
        ])(host, context);
    });
}
exports.buildComponent = buildComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL3V0aWxzL2J1aWxkLWNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7QUFFSCwrQ0FBOEU7QUFDOUUsMkRBYW9DO0FBR3BDLCtEQUFnRTtBQUNoRSxxRUFBbUU7QUFDbkUseUVBQWlHO0FBQ2pHLHVFQUFpRTtBQUNqRSx1RUFBMEY7QUFDMUYsbUZBQXlFO0FBQ3pFLDJCQUEwQztBQUMxQywrQkFBNEM7QUFDNUMsaUNBQWlDO0FBQ2pDLG9FQUdxQztBQUNyQywrQ0FBc0Q7QUFDdEQsMkRBQStEO0FBRy9EOzs7R0FHRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsT0FBMEI7SUFDbEQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVU7UUFDN0IsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsR0FBRztRQUMzQixDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUM7SUFFNUIsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEtBQUssOEJBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBRWxHLE9BQU8sR0FBRyxJQUFJLEdBQUcsY0FBYyxFQUFFLENBQUM7QUFDcEMsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBRXZELFNBQVMsa0JBQWtCLENBQUMsSUFBVSxFQUFFLFVBQWtCO0lBQ3hELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkMsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1FBQ2pC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QUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQUksRUFBRTtZQUNwRixPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxtQkFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQUksRUFBRTtZQUNsRiwwRkFBMEY7WUFDMUYsd0ZBQXdGO1lBQ3hGLDJCQUFjLENBQUMsZ0JBQUMsaUJBQWlCLEVBQUUsYUFBYSxJQUFLLG1CQUFtQixDQUFRLENBQUM7WUFDakYsNkVBQTZFO1lBQzdFLDBFQUEwRTtZQUMxRSxpQkFBSSxDQUFDLElBQVcsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDO1NBQ25DLENBQUMsQ0FBQztRQUVILE9BQU8sR0FBRyxFQUFFLENBQUMsa0JBQUssQ0FBQztZQUNqQiwyQkFBYyxDQUFDLGtCQUFLLENBQUM7Z0JBQ25CLHdCQUF3QixDQUFDLE9BQU8sQ0FBQztnQkFDakMsc0JBQVMsQ0FBQyxjQUFjLENBQUM7YUFDMUIsQ0FBQyxDQUFDO1NBQ0osQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwQixDQUFDLENBQUEsQ0FBQztBQUNKLENBQUM7QUEzRkQsd0NBMkZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7c3RyaW5ncywgdGVtcGxhdGUgYXMgaW50ZXJwb2xhdGVUZW1wbGF0ZX0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHtcbiAgYXBwbHksXG4gIGFwcGx5VGVtcGxhdGVzLFxuICBicmFuY2hBbmRNZXJnZSxcbiAgY2hhaW4sXG4gIGZpbHRlcixcbiAgbWVyZ2VXaXRoLFxuICBtb3ZlLFxuICBub29wLFxuICBSdWxlLFxuICBTY2hlbWF0aWNzRXhjZXB0aW9uLFxuICBUcmVlLFxuICB1cmwsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7RmlsZVN5c3RlbVNjaGVtYXRpY0NvbnRleHR9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rvb2xzJztcbmltcG9ydCB7U2NoZW1hIGFzIENvbXBvbmVudE9wdGlvbnMsIFN0eWxlfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL2NvbXBvbmVudC9zY2hlbWEnO1xuaW1wb3J0IHtJbnNlcnRDaGFuZ2V9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS9jaGFuZ2UnO1xuaW1wb3J0IHtnZXRXb3Jrc3BhY2V9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS93b3Jrc3BhY2UnO1xuaW1wb3J0IHtidWlsZFJlbGF0aXZlUGF0aCwgZmluZE1vZHVsZUZyb21PcHRpb25zfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvZmluZC1tb2R1bGUnO1xuaW1wb3J0IHtwYXJzZU5hbWV9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS9wYXJzZS1uYW1lJztcbmltcG9ydCB7dmFsaWRhdGVIdG1sU2VsZWN0b3IsIHZhbGlkYXRlTmFtZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3ZhbGlkYXRpb24nO1xuaW1wb3J0IHtQcm9qZWN0VHlwZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3dvcmtzcGFjZS1tb2RlbHMnO1xuaW1wb3J0IHtyZWFkRmlsZVN5bmMsIHN0YXRTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2Rpcm5hbWUsIGpvaW4sIHJlc29sdmV9IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge1xuICBhZGREZWNsYXJhdGlvblRvTW9kdWxlLFxuICBhZGRFeHBvcnRUb01vZHVsZSxcbn0gZnJvbSAnLi4vdXRpbHMvdmVuZG9yZWQtYXN0LXV0aWxzJztcbmltcG9ydCB7Z2V0UHJvamVjdEZyb21Xb3Jrc3BhY2V9IGZyb20gJy4vZ2V0LXByb2plY3QnO1xuaW1wb3J0IHtnZXREZWZhdWx0Q29tcG9uZW50T3B0aW9uc30gZnJvbSAnLi9zY2hlbWF0aWMtb3B0aW9ucyc7XG5pbXBvcnQge1Byb2plY3REZWZpbml0aW9ufSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZS9zcmMvd29ya3NwYWNlJztcblxuLyoqXG4gKiBCdWlsZCBhIGRlZmF1bHQgcHJvamVjdCBwYXRoIGZvciBnZW5lcmF0aW5nLlxuICogQHBhcmFtIHByb2plY3QgVGhlIHByb2plY3QgdG8gYnVpbGQgdGhlIHBhdGggZm9yLlxuICovXG5mdW5jdGlvbiBidWlsZERlZmF1bHRQYXRoKHByb2plY3Q6IFByb2plY3REZWZpbml0aW9uKTogc3RyaW5nIHtcbiAgY29uc3Qgcm9vdCA9IHByb2plY3Quc291cmNlUm9vdFxuICAgID8gYC8ke3Byb2plY3Quc291cmNlUm9vdH0vYFxuICAgIDogYC8ke3Byb2plY3Qucm9vdH0vc3JjL2A7XG5cbiAgY29uc3QgcHJvamVjdERpck5hbWUgPSBwcm9qZWN0LmV4dGVuc2lvbnMucHJvamVjdFR5cGUgPT09IFByb2plY3RUeXBlLkFwcGxpY2F0aW9uID8gJ2FwcCcgOiAnbGliJztcblxuICByZXR1cm4gYCR7cm9vdH0ke3Byb2plY3REaXJOYW1lfWA7XG59XG5cbi8qKlxuICogTGlzdCBvZiBzdHlsZSBleHRlbnNpb25zIHdoaWNoIGFyZSBDU1MgY29tcGF0aWJsZS4gQWxsIHN1cHBvcnRlZCBDTEkgc3R5bGUgZXh0ZW5zaW9ucyBjYW4gYmVcbiAqIGZvdW5kIGhlcmU6IGFuZ3VsYXIvYW5ndWxhci1jbGkvbWFzdGVyL3BhY2thZ2VzL3NjaGVtYXRpY3MvYW5ndWxhci9uZy1uZXcvc2NoZW1hLmpzb24jTDExOC1MMTIyXG4gKi9cbmNvbnN0IHN1cHBvcnRlZENzc0V4dGVuc2lvbnMgPSBbJ2NzcycsICdzY3NzJywgJ2xlc3MnXTtcblxuZnVuY3Rpb24gcmVhZEludG9Tb3VyY2VGaWxlKGhvc3Q6IFRyZWUsIG1vZHVsZVBhdGg6IHN0cmluZykge1xuICBjb25zdCB0ZXh0ID0gaG9zdC5yZWFkKG1vZHVsZVBhdGgpO1xuICBpZiAodGV4dCA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBGaWxlICR7bW9kdWxlUGF0aH0gZG9lcyBub3QgZXhpc3QuYCk7XG4gIH1cblxuICByZXR1cm4gdHMuY3JlYXRlU291cmNlRmlsZShtb2R1bGVQYXRoLCB0ZXh0LnRvU3RyaW5nKCd1dGYtOCcpLCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gYWRkRGVjbGFyYXRpb25Ub05nTW9kdWxlKG9wdGlvbnM6IENvbXBvbmVudE9wdGlvbnMpOiBSdWxlIHtcbiAgcmV0dXJuIChob3N0OiBUcmVlKSA9PiB7XG4gICAgaWYgKG9wdGlvbnMuc2tpcEltcG9ydCB8fCAhb3B0aW9ucy5tb2R1bGUpIHtcbiAgICAgIHJldHVybiBob3N0O1xuICAgIH1cblxuICAgIGNvbnN0IG1vZHVsZVBhdGggPSBvcHRpb25zLm1vZHVsZTtcbiAgICBsZXQgc291cmNlID0gcmVhZEludG9Tb3VyY2VGaWxlKGhvc3QsIG1vZHVsZVBhdGgpO1xuXG4gICAgY29uc3QgY29tcG9uZW50UGF0aCA9IGAvJHtvcHRpb25zLnBhdGh9L2BcbiAgICAgICsgKG9wdGlvbnMuZmxhdCA/ICcnIDogc3RyaW5ncy5kYXNoZXJpemUob3B0aW9ucy5uYW1lKSArICcvJylcbiAgICAgICsgc3RyaW5ncy5kYXNoZXJpemUob3B0aW9ucy5uYW1lKVxuICAgICAgKyAnLmNvbXBvbmVudCc7XG4gICAgY29uc3QgcmVsYXRpdmVQYXRoID0gYnVpbGRSZWxhdGl2ZVBhdGgobW9kdWxlUGF0aCwgY29tcG9uZW50UGF0aCk7XG4gICAgY29uc3QgY2xhc3NpZmllZE5hbWUgPSBzdHJpbmdzLmNsYXNzaWZ5KGAke29wdGlvbnMubmFtZX1Db21wb25lbnRgKTtcblxuICAgIGNvbnN0IGRlY2xhcmF0aW9uQ2hhbmdlcyA9IGFkZERlY2xhcmF0aW9uVG9Nb2R1bGUoXG4gICAgICBzb3VyY2UsXG4gICAgICBtb2R1bGVQYXRoLFxuICAgICAgY2xhc3NpZmllZE5hbWUsXG4gICAgICByZWxhdGl2ZVBhdGgpO1xuXG4gICAgY29uc3QgZGVjbGFyYXRpb25SZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUobW9kdWxlUGF0aCk7XG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgZGVjbGFyYXRpb25DaGFuZ2VzKSB7XG4gICAgICBpZiAoY2hhbmdlIGluc3RhbmNlb2YgSW5zZXJ0Q2hhbmdlKSB7XG4gICAgICAgIGRlY2xhcmF0aW9uUmVjb3JkZXIuaW5zZXJ0TGVmdChjaGFuZ2UucG9zLCBjaGFuZ2UudG9BZGQpO1xuICAgICAgfVxuICAgIH1cbiAgICBob3N0LmNvbW1pdFVwZGF0ZShkZWNsYXJhdGlvblJlY29yZGVyKTtcblxuICAgIGlmIChvcHRpb25zLmV4cG9ydCkge1xuICAgICAgLy8gTmVlZCB0byByZWZyZXNoIHRoZSBBU1QgYmVjYXVzZSB3ZSBvdmVyd3JvdGUgdGhlIGZpbGUgaW4gdGhlIGhvc3QuXG4gICAgICBzb3VyY2UgPSByZWFkSW50b1NvdXJjZUZpbGUoaG9zdCwgbW9kdWxlUGF0aCk7XG5cbiAgICAgIGNvbnN0IGV4cG9ydFJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShtb2R1bGVQYXRoKTtcbiAgICAgIGNvbnN0IGV4cG9ydENoYW5nZXMgPSBhZGRFeHBvcnRUb01vZHVsZShcbiAgICAgICAgc291cmNlLFxuICAgICAgICBtb2R1bGVQYXRoLFxuICAgICAgICBzdHJpbmdzLmNsYXNzaWZ5KGAke29wdGlvbnMubmFtZX1Db21wb25lbnRgKSxcbiAgICAgICAgcmVsYXRpdmVQYXRoKTtcblxuICAgICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgZXhwb3J0Q2hhbmdlcykge1xuICAgICAgICBpZiAoY2hhbmdlIGluc3RhbmNlb2YgSW5zZXJ0Q2hhbmdlKSB7XG4gICAgICAgICAgZXhwb3J0UmVjb3JkZXIuaW5zZXJ0TGVmdChjaGFuZ2UucG9zLCBjaGFuZ2UudG9BZGQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBob3N0LmNvbW1pdFVwZGF0ZShleHBvcnRSZWNvcmRlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhvc3Q7XG4gIH07XG59XG5cblxuZnVuY3Rpb24gYnVpbGRTZWxlY3RvcihvcHRpb25zOiBDb21wb25lbnRPcHRpb25zLCBwcm9qZWN0UHJlZml4Pzogc3RyaW5nKSB7XG4gIGxldCBzZWxlY3RvciA9IHN0cmluZ3MuZGFzaGVyaXplKG9wdGlvbnMubmFtZSk7XG4gIGlmIChvcHRpb25zLnByZWZpeCkge1xuICAgIHNlbGVjdG9yID0gYCR7b3B0aW9ucy5wcmVmaXh9LSR7c2VsZWN0b3J9YDtcbiAgfSBlbHNlIGlmIChvcHRpb25zLnByZWZpeCA9PT0gdW5kZWZpbmVkICYmIHByb2plY3RQcmVmaXgpIHtcbiAgICBzZWxlY3RvciA9IGAke3Byb2plY3RQcmVmaXh9LSR7c2VsZWN0b3J9YDtcbiAgfVxuXG4gIHJldHVybiBzZWxlY3Rvcjtcbn1cblxuLyoqXG4gKiBJbmRlbnRzIHRoZSB0ZXh0IGNvbnRlbnQgd2l0aCB0aGUgYW1vdW50IG9mIHNwZWNpZmllZCBzcGFjZXMuIFRoZSBzcGFjZXMgd2lsbCBiZSBhZGRlZCBhZnRlclxuICogZXZlcnkgbGluZS1icmVhay4gVGhpcyB1dGlsaXR5IGZ1bmN0aW9uIGNhbiBiZSB1c2VkIGluc2lkZSBvZiBFSlMgdGVtcGxhdGVzIHRvIHByb3Blcmx5XG4gKiBpbmNsdWRlIHRoZSBhZGRpdGlvbmFsIGZpbGVzLlxuICovXG5mdW5jdGlvbiBpbmRlbnRUZXh0Q29udGVudCh0ZXh0OiBzdHJpbmcsIG51bVNwYWNlczogbnVtYmVyKTogc3RyaW5nIHtcbiAgLy8gSW4gdGhlIE1hdGVyaWFsIHByb2plY3QgdGhlcmUgc2hvdWxkIGJlIG9ubHkgTEYgbGluZS1lbmRpbmdzLCBidXQgdGhlIHNjaGVtYXRpYyBmaWxlc1xuICAvLyBhcmUgbm90IGJlaW5nIGxpbnRlZCBhbmQgdGhlcmVmb3JlIHRoZXJlIGNhbiBiZSBhbHNvIENSTEYgb3IganVzdCBDUiBsaW5lLWVuZGluZ3MuXG4gIHJldHVybiB0ZXh0LnJlcGxhY2UoLyhcXHJcXG58XFxyfFxcbikvZywgYCQxJHsnICcucmVwZWF0KG51bVNwYWNlcyl9YCk7XG59XG5cbi8qKlxuICogUnVsZSB0aGF0IGNvcGllcyBhbmQgaW50ZXJwb2xhdGVzIHRoZSBmaWxlcyB0aGF0IGJlbG9uZyB0byB0aGlzIHNjaGVtYXRpYyBjb250ZXh0LiBBZGRpdGlvbmFsbHlcbiAqIGEgbGlzdCBvZiBmaWxlIHBhdGhzIGNhbiBiZSBwYXNzZWQgdG8gdGhpcyBydWxlIGluIG9yZGVyIHRvIGV4cG9zZSB0aGVtIGluc2lkZSB0aGUgRUpTXG4gKiB0ZW1wbGF0ZSBjb250ZXh0LlxuICpcbiAqIFRoaXMgYWxsb3dzIGlubGluaW5nIHRoZSBleHRlcm5hbCB0ZW1wbGF0ZSBvciBzdHlsZXNoZWV0IGZpbGVzIGluIEVKUyB3aXRob3V0IGhhdmluZ1xuICogdG8gbWFudWFsbHkgZHVwbGljYXRlIHRoZSBmaWxlIGNvbnRlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENvbXBvbmVudChvcHRpb25zOiBDb21wb25lbnRPcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxGaWxlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fSk6IFJ1bGUge1xuXG4gIHJldHVybiBhc3luYyAoaG9zdDogVHJlZSwgY29udGV4dDogRmlsZVN5c3RlbVNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoaG9zdCk7XG4gICAgY29uc3QgcHJvamVjdCA9IGdldFByb2plY3RGcm9tV29ya3NwYWNlKHdvcmtzcGFjZSwgb3B0aW9ucy5wcm9qZWN0KTtcbiAgICBjb25zdCBkZWZhdWx0Q29tcG9uZW50T3B0aW9ucyA9IGdldERlZmF1bHRDb21wb25lbnRPcHRpb25zKHByb2plY3QpO1xuXG4gICAgLy8gVE9ETyhkZXZ2ZXJzaW9uKTogUmVtb3ZlIGlmIHdlIGRyb3Agc3VwcG9ydCBmb3Igb2xkZXIgQ0xJIHZlcnNpb25zLlxuICAgIC8vIFRoaXMgaGFuZGxlcyBhbiB1bnJlcG9ydGVkIGJyZWFraW5nIGNoYW5nZSBmcm9tIHRoZSBAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy4gUHJldmlvdXNseVxuICAgIC8vIHRoZSBkZXNjcmlwdGlvbiBwYXRoIHJlc29sdmVkIHRvIHRoZSBmYWN0b3J5IGZpbGUsIGJ1dCBzdGFydGluZyBmcm9tIDYuMi4wLCBpdCByZXNvbHZlc1xuICAgIC8vIHRvIHRoZSBmYWN0b3J5IGRpcmVjdG9yeS5cbiAgICBjb25zdCBzY2hlbWF0aWNQYXRoID0gc3RhdFN5bmMoY29udGV4dC5zY2hlbWF0aWMuZGVzY3JpcHRpb24ucGF0aCkuaXNEaXJlY3RvcnkoKSA/XG4gICAgICAgIGNvbnRleHQuc2NoZW1hdGljLmRlc2NyaXB0aW9uLnBhdGggOlxuICAgICAgICBkaXJuYW1lKGNvbnRleHQuc2NoZW1hdGljLmRlc2NyaXB0aW9uLnBhdGgpO1xuXG4gICAgY29uc3Qgc2NoZW1hdGljRmlsZXNVcmwgPSAnLi9maWxlcyc7XG4gICAgY29uc3Qgc2NoZW1hdGljRmlsZXNQYXRoID0gcmVzb2x2ZShzY2hlbWF0aWNQYXRoLCBzY2hlbWF0aWNGaWxlc1VybCk7XG5cbiAgICAvLyBBZGQgdGhlIGRlZmF1bHQgY29tcG9uZW50IG9wdGlvbiB2YWx1ZXMgdG8gdGhlIG9wdGlvbnMgaWYgYW4gb3B0aW9uIGlzIG5vdCBleHBsaWNpdGx5XG4gICAgLy8gc3BlY2lmaWVkIGJ1dCBhIGRlZmF1bHQgY29tcG9uZW50IG9wdGlvbiBpcyBhdmFpbGFibGUuXG4gICAgT2JqZWN0LmtleXMob3B0aW9ucylcbiAgICAgIC5maWx0ZXIob3B0aW9uTmFtZSA9PiBvcHRpb25zW29wdGlvbk5hbWVdID09IG51bGwgJiYgZGVmYXVsdENvbXBvbmVudE9wdGlvbnNbb3B0aW9uTmFtZV0pXG4gICAgICAuZm9yRWFjaChvcHRpb25OYW1lID0+IG9wdGlvbnNbb3B0aW9uTmFtZV0gPSBkZWZhdWx0Q29tcG9uZW50T3B0aW9uc1tvcHRpb25OYW1lXSk7XG5cbiAgICBpZiAob3B0aW9ucy5wYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFRPRE8oamVsYm91cm4pOiBmaWd1cmUgb3V0IGlmIHRoZSBuZWVkIGZvciB0aGlzIGBhcyBhbnlgIGlzIGEgYnVnIGR1ZSB0byB0d28gZGlmZmVyZW50XG4gICAgICAvLyBpbmNvbXBhdGlibGUgYFByb2plY3REZWZpbml0aW9uYCBjbGFzc2VzIGluIEBhbmd1bGFyLWRldmtpdFxuICAgICAgb3B0aW9ucy5wYXRoID0gYnVpbGREZWZhdWx0UGF0aChwcm9qZWN0IGFzIGFueSk7XG4gICAgfVxuXG4gICAgb3B0aW9ucy5tb2R1bGUgPSBmaW5kTW9kdWxlRnJvbU9wdGlvbnMoaG9zdCwgb3B0aW9ucyk7XG5cbiAgICBjb25zdCBwYXJzZWRQYXRoID0gcGFyc2VOYW1lKG9wdGlvbnMucGF0aCEsIG9wdGlvbnMubmFtZSk7XG5cbiAgICBvcHRpb25zLm5hbWUgPSBwYXJzZWRQYXRoLm5hbWU7XG4gICAgb3B0aW9ucy5wYXRoID0gcGFyc2VkUGF0aC5wYXRoO1xuICAgIG9wdGlvbnMuc2VsZWN0b3IgPSBvcHRpb25zLnNlbGVjdG9yIHx8IGJ1aWxkU2VsZWN0b3Iob3B0aW9ucywgcHJvamVjdC5wcmVmaXgpO1xuXG4gICAgdmFsaWRhdGVOYW1lKG9wdGlvbnMubmFtZSk7XG4gICAgdmFsaWRhdGVIdG1sU2VsZWN0b3Iob3B0aW9ucy5zZWxlY3RvciEpO1xuXG4gICAgLy8gSW4gY2FzZSB0aGUgc3BlY2lmaWVkIHN0eWxlIGV4dGVuc2lvbiBpcyBub3QgcGFydCBvZiB0aGUgc3VwcG9ydGVkIENTUyBzdXBlcnNldHMsXG4gICAgLy8gd2UgZ2VuZXJhdGUgdGhlIHN0eWxlc2hlZXRzIHdpdGggdGhlIFwiY3NzXCIgZXh0ZW5zaW9uLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBkb24ndFxuICAgIC8vIGFjY2lkZW50YWxseSBnZW5lcmF0ZSBpbnZhbGlkIHN0eWxlc2hlZXRzIChlLmcuIGRyYWctZHJvcC1jb21wLnN0eWwpIHdoaWNoIHdpbGxcbiAgICAvLyBicmVhayB0aGUgQW5ndWxhciBDTEkgcHJvamVjdC4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL2lzc3Vlcy8xNTE2NFxuICAgIGlmICghc3VwcG9ydGVkQ3NzRXh0ZW5zaW9ucy5pbmNsdWRlcyhvcHRpb25zLnN0eWxlISkpIHtcbiAgICAgIC8vIFRPRE86IENhc3QgaXMgbmVjZXNzYXJ5IGFzIHdlIGNhbid0IHVzZSB0aGUgU3R5bGUgZW51bSB3aGljaCBoYXMgYmVlbiBpbnRyb2R1Y2VkXG4gICAgICAvLyB3aXRoaW4gQ0xJIHY3LjMuMC1yYy4wLiBUaGlzIHdvdWxkIGJyZWFrIHRoZSBzY2hlbWF0aWMgZm9yIG9sZGVyIENMSSB2ZXJzaW9ucy5cbiAgICAgIG9wdGlvbnMuc3R5bGUgPSAnY3NzJyBhcyBTdHlsZTtcbiAgICB9XG5cbiAgICAvLyBPYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgYXMgY29udGV4dCBmb3IgdGhlIEVKUyB0ZW1wbGF0ZXMuXG4gICAgY29uc3QgYmFzZVRlbXBsYXRlQ29udGV4dCA9IHtcbiAgICAgIC4uLnN0cmluZ3MsXG4gICAgICAnaWYtZmxhdCc6IChzOiBzdHJpbmcpID0+IG9wdGlvbnMuZmxhdCA/ICcnIDogcyxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfTtcblxuICAgIC8vIEtleS12YWx1ZSBvYmplY3QgdGhhdCBpbmNsdWRlcyB0aGUgc3BlY2lmaWVkIGFkZGl0aW9uYWwgZmlsZXMgd2l0aCB0aGVpciBsb2FkZWQgY29udGVudC5cbiAgICAvLyBUaGUgcmVzb2x2ZWQgY29udGVudHMgY2FuIGJlIHVzZWQgaW5zaWRlIEVKUyB0ZW1wbGF0ZXMuXG4gICAgY29uc3QgcmVzb2x2ZWRGaWxlcyA9IHt9O1xuXG4gICAgZm9yIChsZXQga2V5IGluIGFkZGl0aW9uYWxGaWxlcykge1xuICAgICAgaWYgKGFkZGl0aW9uYWxGaWxlc1trZXldKSB7XG4gICAgICAgIGNvbnN0IGZpbGVDb250ZW50ID0gcmVhZEZpbGVTeW5jKGpvaW4oc2NoZW1hdGljRmlsZXNQYXRoLCBhZGRpdGlvbmFsRmlsZXNba2V5XSksICd1dGYtOCcpO1xuXG4gICAgICAgIC8vIEludGVycG9sYXRlIHRoZSBhZGRpdGlvbmFsIGZpbGVzIHdpdGggdGhlIGJhc2UgRUpTIHRlbXBsYXRlIGNvbnRleHQuXG4gICAgICAgIHJlc29sdmVkRmlsZXNba2V5XSA9IGludGVycG9sYXRlVGVtcGxhdGUoZmlsZUNvbnRlbnQpKGJhc2VUZW1wbGF0ZUNvbnRleHQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHRlbXBsYXRlU291cmNlID0gYXBwbHkodXJsKHNjaGVtYXRpY0ZpbGVzVXJsKSwgW1xuICAgICAgb3B0aW9ucy5za2lwVGVzdHMgPyBmaWx0ZXIocGF0aCA9PiAhcGF0aC5lbmRzV2l0aCgnLnNwZWMudHMudGVtcGxhdGUnKSkgOiBub29wKCksXG4gICAgICBvcHRpb25zLmlubGluZVN0eWxlID8gZmlsdGVyKHBhdGggPT4gIXBhdGguZW5kc1dpdGgoJy5fX3N0eWxlX18udGVtcGxhdGUnKSkgOiBub29wKCksXG4gICAgICBvcHRpb25zLmlubGluZVRlbXBsYXRlID8gZmlsdGVyKHBhdGggPT4gIXBhdGguZW5kc1dpdGgoJy5odG1sLnRlbXBsYXRlJykpIDogbm9vcCgpLFxuICAgICAgLy8gVHJlYXQgdGhlIHRlbXBsYXRlIG9wdGlvbnMgYXMgYW55LCBiZWNhdXNlIHRoZSB0eXBlIGRlZmluaXRpb24gZm9yIHRoZSB0ZW1wbGF0ZSBvcHRpb25zXG4gICAgICAvLyBpcyBtYWRlIHVubmVjZXNzYXJpbHkgZXhwbGljaXQuIEV2ZXJ5IHR5cGUgb2Ygb2JqZWN0IGNhbiBiZSB1c2VkIGluIHRoZSBFSlMgdGVtcGxhdGUuXG4gICAgICBhcHBseVRlbXBsYXRlcyh7aW5kZW50VGV4dENvbnRlbnQsIHJlc29sdmVkRmlsZXMsIC4uLmJhc2VUZW1wbGF0ZUNvbnRleHR9IGFzIGFueSksXG4gICAgICAvLyBUT0RPKGRldnZlcnNpb24pOiBmaWd1cmUgb3V0IHdoeSB3ZSBjYW5ub3QganVzdCByZW1vdmUgdGhlIGZpcnN0IHBhcmFtZXRlclxuICAgICAgLy8gU2VlIGZvciBleGFtcGxlOiBhbmd1bGFyLWNsaSNzY2hlbWF0aWNzL2FuZ3VsYXIvY29tcG9uZW50L2luZGV4LnRzI0wxNjBcbiAgICAgIG1vdmUobnVsbCBhcyBhbnksIHBhcnNlZFBhdGgucGF0aCksXG4gICAgXSk7XG5cbiAgICByZXR1cm4gKCkgPT4gY2hhaW4oW1xuICAgICAgYnJhbmNoQW5kTWVyZ2UoY2hhaW4oW1xuICAgICAgICBhZGREZWNsYXJhdGlvblRvTmdNb2R1bGUob3B0aW9ucyksXG4gICAgICAgIG1lcmdlV2l0aCh0ZW1wbGF0ZVNvdXJjZSksXG4gICAgICBdKSksXG4gICAgXSkoaG9zdCwgY29udGV4dCk7XG4gIH07XG59XG4iXX0=