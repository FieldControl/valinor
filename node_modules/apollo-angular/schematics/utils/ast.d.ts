import { Tree } from '@angular-devkit/schematics';
import { Change } from '@schematics/angular/utility/change';
import * as ts from 'typescript';
/**
 * Import and add module to the root module.
 * @param host {Tree} The source tree.
 * @param importedModuleName {String} The name of the imported module.
 * @param importedModulePath {String} The location of the imported module.
 * @param projectName {String} The name of the project.
 */
export declare function addModuleImportToRootModule(host: Tree, importedModuleName: string, importedModulePath: string, projectName?: string): void;
export declare function insertImport(source: ts.SourceFile, fileToEdit: string, symbolName: string, fileName: string, isDefault?: boolean): Change;
