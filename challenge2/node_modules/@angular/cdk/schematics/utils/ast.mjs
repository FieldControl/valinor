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
exports.findModuleFromOptions = exports.addModuleImportToModule = exports.addModuleImportToRootModule = exports.parseSourceFile = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const change_1 = require("@schematics/angular/utility/change");
const workspace_1 = require("@schematics/angular/utility/workspace");
const find_module_1 = require("@schematics/angular/utility/find-module");
const ts = require("typescript");
const project_main_file_1 = require("./project-main-file");
const vendored_ast_utils_1 = require("./vendored-ast-utils");
/** Reads file given path and returns TypeScript source file. */
function parseSourceFile(host, path) {
    const buffer = host.read(path);
    if (!buffer) {
        throw new schematics_1.SchematicsException(`Could not find file for path: ${path}`);
    }
    return ts.createSourceFile(path, buffer.toString(), ts.ScriptTarget.Latest, true);
}
exports.parseSourceFile = parseSourceFile;
/** Import and add module to root app module. */
function addModuleImportToRootModule(host, moduleName, src, project) {
    const modulePath = vendored_ast_utils_1.getAppModulePath(host, project_main_file_1.getProjectMainFile(project));
    addModuleImportToModule(host, modulePath, moduleName, src);
}
exports.addModuleImportToRootModule = addModuleImportToRootModule;
/**
 * Import and add module to specific module path.
 * @param host the tree we are updating
 * @param modulePath src location of the module to import
 * @param moduleName name of module to import
 * @param src src location to import
 */
function addModuleImportToModule(host, modulePath, moduleName, src) {
    const moduleSource = parseSourceFile(host, modulePath);
    if (!moduleSource) {
        throw new schematics_1.SchematicsException(`Module not found: ${modulePath}`);
    }
    const changes = vendored_ast_utils_1.addImportToModule(moduleSource, modulePath, moduleName, src);
    const recorder = host.beginUpdate(modulePath);
    changes.forEach(change => {
        if (change instanceof change_1.InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
    });
    host.commitUpdate(recorder);
}
exports.addModuleImportToModule = addModuleImportToModule;
/** Wraps the internal find module from options with undefined path handling  */
function findModuleFromOptions(host, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspace = yield workspace_1.getWorkspace(host);
        if (!options.project) {
            options.project = Array.from(workspace.projects.keys())[0];
        }
        const project = workspace.projects.get(options.project);
        if (options.path === undefined) {
            options.path = `/${project.root}/src/app`;
        }
        return find_module_1.findModuleFromOptions(host, options);
    });
}
exports.findModuleFromOptions = findModuleFromOptions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL3V0aWxzL2FzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7QUFFSCwyREFBcUU7QUFFckUsK0RBQWdFO0FBQ2hFLHFFQUFtRTtBQUNuRSx5RUFBb0c7QUFFcEcsaUNBQWlDO0FBQ2pDLDJEQUF1RDtBQUN2RCw2REFBeUU7QUFFekUsZ0VBQWdFO0FBQ2hFLFNBQWdCLGVBQWUsQ0FBQyxJQUFVLEVBQUUsSUFBWTtJQUN0RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9CLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDWCxNQUFNLElBQUksZ0NBQW1CLENBQUMsaUNBQWlDLElBQUksRUFBRSxDQUFDLENBQUM7S0FDeEU7SUFDRCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BGLENBQUM7QUFORCwwQ0FNQztBQUVELGdEQUFnRDtBQUNoRCxTQUFnQiwyQkFBMkIsQ0FBQyxJQUFVLEVBQUUsVUFBa0IsRUFBRSxHQUFXLEVBQzNDLE9BQTBCO0lBQ3BFLE1BQU0sVUFBVSxHQUFHLHFDQUFnQixDQUFDLElBQUksRUFBRSxzQ0FBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLHVCQUF1QixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFKRCxrRUFJQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLHVCQUF1QixDQUFDLElBQVUsRUFBRSxVQUFrQixFQUFFLFVBQWtCLEVBQ2xELEdBQVc7SUFFakQsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUV2RCxJQUFJLENBQUMsWUFBWSxFQUFFO1FBQ2pCLE1BQU0sSUFBSSxnQ0FBbUIsQ0FBQyxxQkFBcUIsVUFBVSxFQUFFLENBQUMsQ0FBQztLQUNsRTtJQUVELE1BQU0sT0FBTyxHQUFHLHNDQUFpQixDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzdFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFOUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUN2QixJQUFJLE1BQU0sWUFBWSxxQkFBWSxFQUFFO1lBQ2xDLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0M7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQW5CRCwwREFtQkM7QUFFRCxnRkFBZ0Y7QUFDaEYsU0FBc0IscUJBQXFCLENBQUMsSUFBVSxFQUFFLE9BQXlCOztRQUUvRSxNQUFNLFNBQVMsR0FBRyxNQUFNLHdCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDcEIsT0FBTyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM1RDtRQUVELE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUUsQ0FBQztRQUV6RCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQzlCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxVQUFVLENBQUM7U0FDM0M7UUFFRCxPQUFPLG1DQUFrQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzQyxDQUFDO0NBQUE7QUFmRCxzREFlQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1NjaGVtYXRpY3NFeGNlcHRpb24sIFRyZWV9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcbmltcG9ydCB7U2NoZW1hIGFzIENvbXBvbmVudE9wdGlvbnN9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvY29tcG9uZW50L3NjaGVtYSc7XG5pbXBvcnQge0luc2VydENoYW5nZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L2NoYW5nZSc7XG5pbXBvcnQge2dldFdvcmtzcGFjZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3dvcmtzcGFjZSc7XG5pbXBvcnQge2ZpbmRNb2R1bGVGcm9tT3B0aW9ucyBhcyBpbnRlcm5hbEZpbmRNb2R1bGV9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS9maW5kLW1vZHVsZSc7XG5pbXBvcnQge1Byb2plY3REZWZpbml0aW9ufSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZS9zcmMvd29ya3NwYWNlJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtnZXRQcm9qZWN0TWFpbkZpbGV9IGZyb20gJy4vcHJvamVjdC1tYWluLWZpbGUnO1xuaW1wb3J0IHthZGRJbXBvcnRUb01vZHVsZSwgZ2V0QXBwTW9kdWxlUGF0aH0gZnJvbSAnLi92ZW5kb3JlZC1hc3QtdXRpbHMnO1xuXG4vKiogUmVhZHMgZmlsZSBnaXZlbiBwYXRoIGFuZCByZXR1cm5zIFR5cGVTY3JpcHQgc291cmNlIGZpbGUuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTb3VyY2VGaWxlKGhvc3Q6IFRyZWUsIHBhdGg6IHN0cmluZyk6IHRzLlNvdXJjZUZpbGUge1xuICBjb25zdCBidWZmZXIgPSBob3N0LnJlYWQocGF0aCk7XG4gIGlmICghYnVmZmVyKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYENvdWxkIG5vdCBmaW5kIGZpbGUgZm9yIHBhdGg6ICR7cGF0aH1gKTtcbiAgfVxuICByZXR1cm4gdHMuY3JlYXRlU291cmNlRmlsZShwYXRoLCBidWZmZXIudG9TdHJpbmcoKSwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgdHJ1ZSk7XG59XG5cbi8qKiBJbXBvcnQgYW5kIGFkZCBtb2R1bGUgdG8gcm9vdCBhcHAgbW9kdWxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZE1vZHVsZUltcG9ydFRvUm9vdE1vZHVsZShob3N0OiBUcmVlLCBtb2R1bGVOYW1lOiBzdHJpbmcsIHNyYzogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBQcm9qZWN0RGVmaW5pdGlvbikge1xuICBjb25zdCBtb2R1bGVQYXRoID0gZ2V0QXBwTW9kdWxlUGF0aChob3N0LCBnZXRQcm9qZWN0TWFpbkZpbGUocHJvamVjdCkpO1xuICBhZGRNb2R1bGVJbXBvcnRUb01vZHVsZShob3N0LCBtb2R1bGVQYXRoLCBtb2R1bGVOYW1lLCBzcmMpO1xufVxuXG4vKipcbiAqIEltcG9ydCBhbmQgYWRkIG1vZHVsZSB0byBzcGVjaWZpYyBtb2R1bGUgcGF0aC5cbiAqIEBwYXJhbSBob3N0IHRoZSB0cmVlIHdlIGFyZSB1cGRhdGluZ1xuICogQHBhcmFtIG1vZHVsZVBhdGggc3JjIGxvY2F0aW9uIG9mIHRoZSBtb2R1bGUgdG8gaW1wb3J0XG4gKiBAcGFyYW0gbW9kdWxlTmFtZSBuYW1lIG9mIG1vZHVsZSB0byBpbXBvcnRcbiAqIEBwYXJhbSBzcmMgc3JjIGxvY2F0aW9uIHRvIGltcG9ydFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkTW9kdWxlSW1wb3J0VG9Nb2R1bGUoaG9zdDogVHJlZSwgbW9kdWxlUGF0aDogc3RyaW5nLCBtb2R1bGVOYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBzdHJpbmcpIHtcblxuICBjb25zdCBtb2R1bGVTb3VyY2UgPSBwYXJzZVNvdXJjZUZpbGUoaG9zdCwgbW9kdWxlUGF0aCk7XG5cbiAgaWYgKCFtb2R1bGVTb3VyY2UpIHtcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgTW9kdWxlIG5vdCBmb3VuZDogJHttb2R1bGVQYXRofWApO1xuICB9XG5cbiAgY29uc3QgY2hhbmdlcyA9IGFkZEltcG9ydFRvTW9kdWxlKG1vZHVsZVNvdXJjZSwgbW9kdWxlUGF0aCwgbW9kdWxlTmFtZSwgc3JjKTtcbiAgY29uc3QgcmVjb3JkZXIgPSBob3N0LmJlZ2luVXBkYXRlKG1vZHVsZVBhdGgpO1xuXG4gIGNoYW5nZXMuZm9yRWFjaChjaGFuZ2UgPT4ge1xuICAgIGlmIChjaGFuZ2UgaW5zdGFuY2VvZiBJbnNlcnRDaGFuZ2UpIHtcbiAgICAgIHJlY29yZGVyLmluc2VydExlZnQoY2hhbmdlLnBvcywgY2hhbmdlLnRvQWRkKTtcbiAgICB9XG4gIH0pO1xuXG4gIGhvc3QuY29tbWl0VXBkYXRlKHJlY29yZGVyKTtcbn1cblxuLyoqIFdyYXBzIHRoZSBpbnRlcm5hbCBmaW5kIG1vZHVsZSBmcm9tIG9wdGlvbnMgd2l0aCB1bmRlZmluZWQgcGF0aCBoYW5kbGluZyAgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kTW9kdWxlRnJvbU9wdGlvbnMoaG9zdDogVHJlZSwgb3B0aW9uczogQ29tcG9uZW50T3B0aW9ucyk6XG4gIFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiB7XG4gIGNvbnN0IHdvcmtzcGFjZSA9IGF3YWl0IGdldFdvcmtzcGFjZShob3N0KTtcblxuICBpZiAoIW9wdGlvbnMucHJvamVjdCkge1xuICAgIG9wdGlvbnMucHJvamVjdCA9IEFycmF5LmZyb20od29ya3NwYWNlLnByb2plY3RzLmtleXMoKSlbMF07XG4gIH1cblxuICBjb25zdCBwcm9qZWN0ID0gd29ya3NwYWNlLnByb2plY3RzLmdldChvcHRpb25zLnByb2plY3QpITtcblxuICBpZiAob3B0aW9ucy5wYXRoID09PSB1bmRlZmluZWQpIHtcbiAgICBvcHRpb25zLnBhdGggPSBgLyR7cHJvamVjdC5yb290fS9zcmMvYXBwYDtcbiAgfVxuXG4gIHJldHVybiBpbnRlcm5hbEZpbmRNb2R1bGUoaG9zdCwgb3B0aW9ucyk7XG59XG4iXX0=