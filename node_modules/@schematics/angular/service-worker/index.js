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
const utility_1 = require("../utility");
const ast_utils_1 = require("../utility/ast-utils");
const change_1 = require("../utility/change");
const dependencies_1 = require("../utility/dependencies");
const ng_ast_utils_1 = require("../utility/ng-ast-utils");
const paths_1 = require("../utility/paths");
const project_targets_1 = require("../utility/project-targets");
function addDependencies() {
    return (host, context) => {
        const packageName = '@angular/service-worker';
        context.logger.debug(`adding dependency (${packageName})`);
        const coreDep = (0, dependencies_1.getPackageJsonDependency)(host, '@angular/core');
        if (coreDep === null) {
            throw new schematics_1.SchematicsException('Could not find version.');
        }
        const serviceWorkerDep = {
            ...coreDep,
            name: packageName,
        };
        (0, dependencies_1.addPackageJsonDependency)(host, serviceWorkerDep);
        return host;
    };
}
function updateAppModule(mainPath) {
    return (host, context) => {
        context.logger.debug('Updating appmodule');
        const modulePath = (0, ng_ast_utils_1.getAppModulePath)(host, mainPath);
        context.logger.debug(`module path: ${modulePath}`);
        addImport(host, modulePath, 'ServiceWorkerModule', '@angular/service-worker');
        addImport(host, modulePath, 'isDevMode', '@angular/core');
        // register SW in application module
        const importText = core_1.tags.stripIndent `
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: !isDevMode(),
        // Register the ServiceWorker as soon as the application is stable
        // or after 30 seconds (whichever comes first).
        registrationStrategy: 'registerWhenStable:30000'
      })
    `;
        const moduleSource = getTsSourceFile(host, modulePath);
        const metadataChanges = (0, ast_utils_1.addSymbolToNgModuleMetadata)(moduleSource, modulePath, 'imports', importText);
        if (metadataChanges) {
            const recorder = host.beginUpdate(modulePath);
            (0, change_1.applyToUpdateRecorder)(recorder, metadataChanges);
            host.commitUpdate(recorder);
        }
        return host;
    };
}
function getTsSourceFile(host, path) {
    const content = host.readText(path);
    const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
    return source;
}
function default_1(options) {
    return async (host, context) => {
        const workspace = await (0, utility_1.readWorkspace)(host);
        const project = workspace.projects.get(options.project);
        if (!project) {
            throw new schematics_1.SchematicsException(`Invalid project name (${options.project})`);
        }
        if (project.extensions.projectType !== 'application') {
            throw new schematics_1.SchematicsException(`Service worker requires a project type of "application".`);
        }
        const buildTarget = project.targets.get('build');
        if (!buildTarget) {
            throw (0, project_targets_1.targetBuildNotFoundError)();
        }
        const buildOptions = (buildTarget.options || {});
        const root = project.root;
        buildOptions.serviceWorker = true;
        buildOptions.ngswConfigPath = (0, core_1.join)((0, core_1.normalize)(root), 'ngsw-config.json');
        let { resourcesOutputPath = '' } = buildOptions;
        if (resourcesOutputPath) {
            resourcesOutputPath = (0, core_1.normalize)(`/${resourcesOutputPath}`);
        }
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./files'), [
            (0, schematics_1.applyTemplates)({
                ...options,
                resourcesOutputPath,
                relativePathToWorkspaceRoot: (0, paths_1.relativePathToWorkspaceRoot)(project.root),
            }),
            (0, schematics_1.move)(project.root),
        ]);
        context.addTask(new tasks_1.NodePackageInstallTask());
        await (0, utility_1.writeWorkspace)(host, workspace);
        return (0, schematics_1.chain)([
            (0, schematics_1.mergeWith)(templateSource),
            addDependencies(),
            updateAppModule(buildOptions.main),
        ]);
    };
}
exports.default = default_1;
function addImport(host, filePath, symbolName, moduleName) {
    const moduleSource = getTsSourceFile(host, filePath);
    const change = (0, ast_utils_1.insertImport)(moduleSource, filePath, symbolName, moduleName);
    if (change) {
        const recorder = host.beginUpdate(filePath);
        (0, change_1.applyToUpdateRecorder)(recorder, [change]);
        host.commitUpdate(recorder);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9zY2hlbWF0aWNzL2FuZ3VsYXIvc2VydmljZS13b3JrZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVILCtDQUE2RDtBQUM3RCwyREFXb0M7QUFDcEMsNERBQTBFO0FBQzFFLGtHQUFvRjtBQUNwRix3Q0FBMkQ7QUFDM0Qsb0RBQWlGO0FBQ2pGLDhDQUEwRDtBQUMxRCwwREFBNkY7QUFDN0YsMERBQTJEO0FBQzNELDRDQUErRDtBQUMvRCxnRUFBc0U7QUFJdEUsU0FBUyxlQUFlO0lBQ3RCLE9BQU8sQ0FBQyxJQUFVLEVBQUUsT0FBeUIsRUFBRSxFQUFFO1FBQy9DLE1BQU0sV0FBVyxHQUFHLHlCQUF5QixDQUFDO1FBQzlDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFzQixXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQzNELE1BQU0sT0FBTyxHQUFHLElBQUEsdUNBQXdCLEVBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ2hFLElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtZQUNwQixNQUFNLElBQUksZ0NBQW1CLENBQUMseUJBQXlCLENBQUMsQ0FBQztTQUMxRDtRQUNELE1BQU0sZ0JBQWdCLEdBQUc7WUFDdkIsR0FBRyxPQUFPO1lBQ1YsSUFBSSxFQUFFLFdBQVc7U0FDbEIsQ0FBQztRQUNGLElBQUEsdUNBQXdCLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFFakQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsUUFBZ0I7SUFDdkMsT0FBTyxDQUFDLElBQVUsRUFBRSxPQUF5QixFQUFFLEVBQUU7UUFDL0MsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFL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QUMsQ0FBQztLQUM3QjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgam9pbiwgbm9ybWFsaXplLCB0YWdzIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHtcbiAgUnVsZSxcbiAgU2NoZW1hdGljQ29udGV4dCxcbiAgU2NoZW1hdGljc0V4Y2VwdGlvbixcbiAgVHJlZSxcbiAgYXBwbHksXG4gIGFwcGx5VGVtcGxhdGVzLFxuICBjaGFpbixcbiAgbWVyZ2VXaXRoLFxuICBtb3ZlLFxuICB1cmwsXG59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2sgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90YXNrcyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICcuLi90aGlyZF9wYXJ0eS9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2xpYi90eXBlc2NyaXB0JztcbmltcG9ydCB7IHJlYWRXb3Jrc3BhY2UsIHdyaXRlV29ya3NwYWNlIH0gZnJvbSAnLi4vdXRpbGl0eSc7XG5pbXBvcnQgeyBhZGRTeW1ib2xUb05nTW9kdWxlTWV0YWRhdGEsIGluc2VydEltcG9ydCB9IGZyb20gJy4uL3V0aWxpdHkvYXN0LXV0aWxzJztcbmltcG9ydCB7IGFwcGx5VG9VcGRhdGVSZWNvcmRlciB9IGZyb20gJy4uL3V0aWxpdHkvY2hhbmdlJztcbmltcG9ydCB7IGFkZFBhY2thZ2VKc29uRGVwZW5kZW5jeSwgZ2V0UGFja2FnZUpzb25EZXBlbmRlbmN5IH0gZnJvbSAnLi4vdXRpbGl0eS9kZXBlbmRlbmNpZXMnO1xuaW1wb3J0IHsgZ2V0QXBwTW9kdWxlUGF0aCB9IGZyb20gJy4uL3V0aWxpdHkvbmctYXN0LXV0aWxzJztcbmltcG9ydCB7IHJlbGF0aXZlUGF0aFRvV29ya3NwYWNlUm9vdCB9IGZyb20gJy4uL3V0aWxpdHkvcGF0aHMnO1xuaW1wb3J0IHsgdGFyZ2V0QnVpbGROb3RGb3VuZEVycm9yIH0gZnJvbSAnLi4vdXRpbGl0eS9wcm9qZWN0LXRhcmdldHMnO1xuaW1wb3J0IHsgQnJvd3NlckJ1aWxkZXJPcHRpb25zIH0gZnJvbSAnLi4vdXRpbGl0eS93b3Jrc3BhY2UtbW9kZWxzJztcbmltcG9ydCB7IFNjaGVtYSBhcyBTZXJ2aWNlV29ya2VyT3B0aW9ucyB9IGZyb20gJy4vc2NoZW1hJztcblxuZnVuY3Rpb24gYWRkRGVwZW5kZW5jaWVzKCk6IFJ1bGUge1xuICByZXR1cm4gKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQpID0+IHtcbiAgICBjb25zdCBwYWNrYWdlTmFtZSA9ICdAYW5ndWxhci9zZXJ2aWNlLXdvcmtlcic7XG4gICAgY29udGV4dC5sb2dnZXIuZGVidWcoYGFkZGluZyBkZXBlbmRlbmN5ICgke3BhY2thZ2VOYW1lfSlgKTtcbiAgICBjb25zdCBjb3JlRGVwID0gZ2V0UGFja2FnZUpzb25EZXBlbmRlbmN5KGhvc3QsICdAYW5ndWxhci9jb3JlJyk7XG4gICAgaWYgKGNvcmVEZXAgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKCdDb3VsZCBub3QgZmluZCB2ZXJzaW9uLicpO1xuICAgIH1cbiAgICBjb25zdCBzZXJ2aWNlV29ya2VyRGVwID0ge1xuICAgICAgLi4uY29yZURlcCxcbiAgICAgIG5hbWU6IHBhY2thZ2VOYW1lLFxuICAgIH07XG4gICAgYWRkUGFja2FnZUpzb25EZXBlbmRlbmN5KGhvc3QsIHNlcnZpY2VXb3JrZXJEZXApO1xuXG4gICAgcmV0dXJuIGhvc3Q7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUFwcE1vZHVsZShtYWluUGF0aDogc3RyaW5nKTogUnVsZSB7XG4gIHJldHVybiAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xuICAgIGNvbnRleHQubG9nZ2VyLmRlYnVnKCdVcGRhdGluZyBhcHBtb2R1bGUnKTtcblxuICAgIGNvbnN0IG1vZHVsZVBhdGggPSBnZXRBcHBNb2R1bGVQYXRoKGhvc3QsIG1haW5QYXRoKTtcbiAgICBjb250ZXh0LmxvZ2dlci5kZWJ1ZyhgbW9kdWxlIHBhdGg6ICR7bW9kdWxlUGF0aH1gKTtcblxuICAgIGFkZEltcG9ydChob3N0LCBtb2R1bGVQYXRoLCAnU2VydmljZVdvcmtlck1vZHVsZScsICdAYW5ndWxhci9zZXJ2aWNlLXdvcmtlcicpO1xuICAgIGFkZEltcG9ydChob3N0LCBtb2R1bGVQYXRoLCAnaXNEZXZNb2RlJywgJ0Bhbmd1bGFyL2NvcmUnKTtcblxuICAgIC8vIHJlZ2lzdGVyIFNXIGluIGFwcGxpY2F0aW9uIG1vZHVsZVxuICAgIGNvbnN0IGltcG9ydFRleHQgPSB0YWdzLnN0cmlwSW5kZW50YFxuICAgICAgU2VydmljZVdvcmtlck1vZHVsZS5yZWdpc3Rlcignbmdzdy13b3JrZXIuanMnLCB7XG4gICAgICAgIGVuYWJsZWQ6ICFpc0Rldk1vZGUoKSxcbiAgICAgICAgLy8gUmVnaXN0ZXIgdGhlIFNlcnZpY2VXb3JrZXIgYXMgc29vbiBhcyB0aGUgYXBwbGljYXRpb24gaXMgc3RhYmxlXG4gICAgICAgIC8vIG9yIGFmdGVyIDMwIHNlY29uZHMgKHdoaWNoZXZlciBjb21lcyBmaXJzdCkuXG4gICAgICAgIHJlZ2lzdHJhdGlvblN0cmF0ZWd5OiAncmVnaXN0ZXJXaGVuU3RhYmxlOjMwMDAwJ1xuICAgICAgfSlcbiAgICBgO1xuICAgIGNvbnN0IG1vZHVsZVNvdXJjZSA9IGdldFRzU291cmNlRmlsZShob3N0LCBtb2R1bGVQYXRoKTtcbiAgICBjb25zdCBtZXRhZGF0YUNoYW5nZXMgPSBhZGRTeW1ib2xUb05nTW9kdWxlTWV0YWRhdGEoXG4gICAgICBtb2R1bGVTb3VyY2UsXG4gICAgICBtb2R1bGVQYXRoLFxuICAgICAgJ2ltcG9ydHMnLFxuICAgICAgaW1wb3J0VGV4dCxcbiAgICApO1xuICAgIGlmIChtZXRhZGF0YUNoYW5nZXMpIHtcbiAgICAgIGNvbnN0IHJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShtb2R1bGVQYXRoKTtcbiAgICAgIGFwcGx5VG9VcGRhdGVSZWNvcmRlcihyZWNvcmRlciwgbWV0YWRhdGFDaGFuZ2VzKTtcbiAgICAgIGhvc3QuY29tbWl0VXBkYXRlKHJlY29yZGVyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaG9zdDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0VHNTb3VyY2VGaWxlKGhvc3Q6IFRyZWUsIHBhdGg6IHN0cmluZyk6IHRzLlNvdXJjZUZpbGUge1xuICBjb25zdCBjb250ZW50ID0gaG9zdC5yZWFkVGV4dChwYXRoKTtcbiAgY29uc3Qgc291cmNlID0gdHMuY3JlYXRlU291cmNlRmlsZShwYXRoLCBjb250ZW50LCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCB0cnVlKTtcblxuICByZXR1cm4gc291cmNlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAob3B0aW9uczogU2VydmljZVdvcmtlck9wdGlvbnMpOiBSdWxlIHtcbiAgcmV0dXJuIGFzeW5jIChob3N0OiBUcmVlLCBjb250ZXh0OiBTY2hlbWF0aWNDb250ZXh0KSA9PiB7XG4gICAgY29uc3Qgd29ya3NwYWNlID0gYXdhaXQgcmVhZFdvcmtzcGFjZShob3N0KTtcbiAgICBjb25zdCBwcm9qZWN0ID0gd29ya3NwYWNlLnByb2plY3RzLmdldChvcHRpb25zLnByb2plY3QpO1xuICAgIGlmICghcHJvamVjdCkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYEludmFsaWQgcHJvamVjdCBuYW1lICgke29wdGlvbnMucHJvamVjdH0pYCk7XG4gICAgfVxuICAgIGlmIChwcm9qZWN0LmV4dGVuc2lvbnMucHJvamVjdFR5cGUgIT09ICdhcHBsaWNhdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBTZXJ2aWNlIHdvcmtlciByZXF1aXJlcyBhIHByb2plY3QgdHlwZSBvZiBcImFwcGxpY2F0aW9uXCIuYCk7XG4gICAgfVxuICAgIGNvbnN0IGJ1aWxkVGFyZ2V0ID0gcHJvamVjdC50YXJnZXRzLmdldCgnYnVpbGQnKTtcbiAgICBpZiAoIWJ1aWxkVGFyZ2V0KSB7XG4gICAgICB0aHJvdyB0YXJnZXRCdWlsZE5vdEZvdW5kRXJyb3IoKTtcbiAgICB9XG4gICAgY29uc3QgYnVpbGRPcHRpb25zID0gKGJ1aWxkVGFyZ2V0Lm9wdGlvbnMgfHwge30pIGFzIHVua25vd24gYXMgQnJvd3NlckJ1aWxkZXJPcHRpb25zO1xuICAgIGNvbnN0IHJvb3QgPSBwcm9qZWN0LnJvb3Q7XG4gICAgYnVpbGRPcHRpb25zLnNlcnZpY2VXb3JrZXIgPSB0cnVlO1xuICAgIGJ1aWxkT3B0aW9ucy5uZ3N3Q29uZmlnUGF0aCA9IGpvaW4obm9ybWFsaXplKHJvb3QpLCAnbmdzdy1jb25maWcuanNvbicpO1xuXG4gICAgbGV0IHsgcmVzb3VyY2VzT3V0cHV0UGF0aCA9ICcnIH0gPSBidWlsZE9wdGlvbnM7XG4gICAgaWYgKHJlc291cmNlc091dHB1dFBhdGgpIHtcbiAgICAgIHJlc291cmNlc091dHB1dFBhdGggPSBub3JtYWxpemUoYC8ke3Jlc291cmNlc091dHB1dFBhdGh9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgdGVtcGxhdGVTb3VyY2UgPSBhcHBseSh1cmwoJy4vZmlsZXMnKSwgW1xuICAgICAgYXBwbHlUZW1wbGF0ZXMoe1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICByZXNvdXJjZXNPdXRwdXRQYXRoLFxuICAgICAgICByZWxhdGl2ZVBhdGhUb1dvcmtzcGFjZVJvb3Q6IHJlbGF0aXZlUGF0aFRvV29ya3NwYWNlUm9vdChwcm9qZWN0LnJvb3QpLFxuICAgICAgfSksXG4gICAgICBtb3ZlKHByb2plY3Qucm9vdCksXG4gICAgXSk7XG5cbiAgICBjb250ZXh0LmFkZFRhc2sobmV3IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2soKSk7XG5cbiAgICBhd2FpdCB3cml0ZVdvcmtzcGFjZShob3N0LCB3b3Jrc3BhY2UpO1xuXG4gICAgcmV0dXJuIGNoYWluKFtcbiAgICAgIG1lcmdlV2l0aCh0ZW1wbGF0ZVNvdXJjZSksXG4gICAgICBhZGREZXBlbmRlbmNpZXMoKSxcbiAgICAgIHVwZGF0ZUFwcE1vZHVsZShidWlsZE9wdGlvbnMubWFpbiksXG4gICAgXSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZEltcG9ydChob3N0OiBUcmVlLCBmaWxlUGF0aDogc3RyaW5nLCBzeW1ib2xOYW1lOiBzdHJpbmcsIG1vZHVsZU5hbWU6IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCBtb2R1bGVTb3VyY2UgPSBnZXRUc1NvdXJjZUZpbGUoaG9zdCwgZmlsZVBhdGgpO1xuICBjb25zdCBjaGFuZ2UgPSBpbnNlcnRJbXBvcnQobW9kdWxlU291cmNlLCBmaWxlUGF0aCwgc3ltYm9sTmFtZSwgbW9kdWxlTmFtZSk7XG5cbiAgaWYgKGNoYW5nZSkge1xuICAgIGNvbnN0IHJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShmaWxlUGF0aCk7XG4gICAgYXBwbHlUb1VwZGF0ZVJlY29yZGVyKHJlY29yZGVyLCBbY2hhbmdlXSk7XG4gICAgaG9zdC5jb21taXRVcGRhdGUocmVjb3JkZXIpO1xuICB9XG59XG4iXX0=