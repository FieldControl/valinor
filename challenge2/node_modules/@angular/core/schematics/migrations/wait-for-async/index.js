/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/core/schematics/migrations/wait-for-async", ["require", "exports", "@angular-devkit/schematics", "path", "typescript", "@angular/core/schematics/utils/project_tsconfig_paths", "@angular/core/schematics/utils/typescript/compiler_host", "@angular/core/schematics/utils/typescript/imports", "@angular/core/schematics/utils/typescript/nodes", "@angular/core/schematics/migrations/wait-for-async/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const schematics_1 = require("@angular-devkit/schematics");
    const path_1 = require("path");
    const ts = require("typescript");
    const project_tsconfig_paths_1 = require("@angular/core/schematics/utils/project_tsconfig_paths");
    const compiler_host_1 = require("@angular/core/schematics/utils/typescript/compiler_host");
    const imports_1 = require("@angular/core/schematics/utils/typescript/imports");
    const nodes_1 = require("@angular/core/schematics/utils/typescript/nodes");
    const util_1 = require("@angular/core/schematics/migrations/wait-for-async/util");
    const MODULE_AUGMENTATION_FILENAME = 'ɵɵASYNC_MIGRATION_CORE_AUGMENTATION.d.ts';
    /** Migration that switches from `async` to `waitForAsync`. */
    function default_1() {
        return (tree) => {
            const { buildPaths, testPaths } = project_tsconfig_paths_1.getProjectTsConfigPaths(tree);
            const basePath = process.cwd();
            const allPaths = [...buildPaths, ...testPaths];
            if (!allPaths.length) {
                throw new schematics_1.SchematicsException('Could not find any tsconfig file. Cannot migrate async usages to waitForAsync.');
            }
            for (const tsconfigPath of allPaths) {
                runWaitForAsyncMigration(tree, tsconfigPath, basePath);
            }
        };
    }
    exports.default = default_1;
    function runWaitForAsyncMigration(tree, tsconfigPath, basePath) {
        // Technically we can get away with using `MODULE_AUGMENTATION_FILENAME` as the path, but as of
        // TS 4.2, the module resolution caching seems to be more aggressive which causes the file to be
        // retained between test runs. We can avoid it by using the full path.
        const augmentedFilePath = path_1.join(basePath, MODULE_AUGMENTATION_FILENAME);
        const { program } = compiler_host_1.createMigrationProgram(tree, tsconfigPath, basePath, fileName => {
            // In case the module augmentation file has been requested, we return a source file that
            // augments "@angular/core/testing" to include a named export called "async". This ensures that
            // we can rely on the type checker for this migration after `async` has been removed.
            if (path_1.basename(fileName) === MODULE_AUGMENTATION_FILENAME) {
                return `
        import '@angular/core/testing';
        declare module "@angular/core/testing" {
          function async(fn: Function): any;
        }
      `;
            }
            return undefined;
        }, [augmentedFilePath]);
        const typeChecker = program.getTypeChecker();
        const printer = ts.createPrinter();
        const sourceFiles = program.getSourceFiles().filter(sourceFile => compiler_host_1.canMigrateFile(basePath, sourceFile, program));
        const deprecatedFunction = 'async';
        const newFunction = 'waitForAsync';
        sourceFiles.forEach(sourceFile => {
            const asyncImportSpecifier = imports_1.getImportSpecifier(sourceFile, '@angular/core/testing', deprecatedFunction);
            const asyncImport = asyncImportSpecifier ?
                nodes_1.closestNode(asyncImportSpecifier, ts.SyntaxKind.NamedImports) :
                null;
            // If there are no imports for `async`, we can exit early.
            if (!asyncImportSpecifier || !asyncImport) {
                return;
            }
            const update = tree.beginUpdate(path_1.relative(basePath, sourceFile.fileName));
            // Change the `async` import to `waitForAsync`.
            update.remove(asyncImport.getStart(), asyncImport.getWidth());
            update.insertRight(asyncImport.getStart(), printer.printNode(ts.EmitHint.Unspecified, imports_1.replaceImport(asyncImport, deprecatedFunction, newFunction), sourceFile));
            // Change `async` calls to `waitForAsync`.
            util_1.findAsyncReferences(sourceFile, typeChecker, asyncImportSpecifier).forEach(node => {
                update.remove(node.getStart(), node.getWidth());
                update.insertRight(node.getStart(), newFunction);
            });
            tree.commitUpdate(update);
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NjaGVtYXRpY3MvbWlncmF0aW9ucy93YWl0LWZvci1hc3luYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDJEQUEyRTtJQUMzRSwrQkFBOEM7SUFDOUMsaUNBQWlDO0lBRWpDLGtHQUEyRTtJQUMzRSwyRkFBNEY7SUFDNUYsK0VBQWlGO0lBQ2pGLDJFQUF5RDtJQUV6RCxrRkFBMkM7SUFFM0MsTUFBTSw0QkFBNEIsR0FBRywwQ0FBMEMsQ0FBQztJQUVoRiw4REFBOEQ7SUFDOUQ7UUFDRSxPQUFPLENBQUMsSUFBVSxFQUFFLEVBQUU7WUFDcEIsTUFBTSxFQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUMsR0FBRyxnREFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5RCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDL0IsTUFBTSxRQUFRLEdBQUcsQ0FBQyxHQUFHLFVBQVUsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDO1lBRS9DLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO2dCQUNwQixNQUFNLElBQUksZ0NBQW1CLENBQ3pCLGdGQUFnRixDQUFDLENBQUM7YUFDdkY7WUFFRCxLQUFLLE1BQU0sWUFBWSxJQUFJLFFBQVEsRUFBRTtnQkFDbkMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQzthQUN4RDtRQUNILENBQUMsQ0FBQztJQUNKLENBQUM7SUFmRCw0QkFlQztJQUVELFNBQVMsd0JBQXdCLENBQUMsSUFBVSxFQUFFLFlBQW9CLEVBQUUsUUFBZ0I7UUFDbEYsK0ZBQStGO1FBQy9GLGdHQUFnRztRQUNoRyxzRUFBc0U7UUFDdEUsTUFBTSxpQkFBaUIsR0FBRyxXQUFJLENBQUMsUUFBUSxFQUFFLDRCQUE0QixDQUFDLENBQUM7UUFDdkUsTUFBTSxFQUFDLE9BQU8sRUFBQyxHQUFHLHNDQUFzQixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxFQUFFO1lBQ2hGLHdGQUF3RjtZQUN4RiwrRkFBK0Y7WUFDL0YscUZBQXFGO1lBQ3JGLElBQUksZUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLDRCQUE0QixFQUFFO2dCQUN2RCxPQUFPOzs7OztPQUtOLENBQUM7YUFDSDtZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUN4QixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDN0MsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ25DLE1BQU0sV0FBVyxHQUNiLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyw4QkFBYyxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNqRyxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQztRQUNuQyxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUM7UUFFbkMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUMvQixNQUFNLG9CQUFvQixHQUN0Qiw0QkFBa0IsQ0FBQyxVQUFVLEVBQUUsdUJBQXVCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUNoRixNQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUN0QyxtQkFBVyxDQUFrQixvQkFBb0IsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ2hGLElBQUksQ0FBQztZQUVULDBEQUEwRDtZQUMxRCxJQUFJLENBQUMsb0JBQW9CLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3pDLE9BQU87YUFDUjtZQUVELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBUSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUV6RSwrQ0FBK0M7WUFDL0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUUsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDOUQsTUFBTSxDQUFDLFdBQVcsQ0FDZCxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQ3RCLE9BQU8sQ0FBQyxTQUFTLENBQ2IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsdUJBQWEsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxDQUFDLEVBQ3BGLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFFckIsMENBQTBDO1lBQzFDLDBCQUFtQixDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2hGLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNuRCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UnVsZSwgU2NoZW1hdGljc0V4Y2VwdGlvbiwgVHJlZX0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHtiYXNlbmFtZSwgam9pbiwgcmVsYXRpdmV9IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Z2V0UHJvamVjdFRzQ29uZmlnUGF0aHN9IGZyb20gJy4uLy4uL3V0aWxzL3Byb2plY3RfdHNjb25maWdfcGF0aHMnO1xuaW1wb3J0IHtjYW5NaWdyYXRlRmlsZSwgY3JlYXRlTWlncmF0aW9uUHJvZ3JhbX0gZnJvbSAnLi4vLi4vdXRpbHMvdHlwZXNjcmlwdC9jb21waWxlcl9ob3N0JztcbmltcG9ydCB7Z2V0SW1wb3J0U3BlY2lmaWVyLCByZXBsYWNlSW1wb3J0fSBmcm9tICcuLi8uLi91dGlscy90eXBlc2NyaXB0L2ltcG9ydHMnO1xuaW1wb3J0IHtjbG9zZXN0Tm9kZX0gZnJvbSAnLi4vLi4vdXRpbHMvdHlwZXNjcmlwdC9ub2Rlcyc7XG5cbmltcG9ydCB7ZmluZEFzeW5jUmVmZXJlbmNlc30gZnJvbSAnLi91dGlsJztcblxuY29uc3QgTU9EVUxFX0FVR01FTlRBVElPTl9GSUxFTkFNRSA9ICfJtcm1QVNZTkNfTUlHUkFUSU9OX0NPUkVfQVVHTUVOVEFUSU9OLmQudHMnO1xuXG4vKiogTWlncmF0aW9uIHRoYXQgc3dpdGNoZXMgZnJvbSBgYXN5bmNgIHRvIGB3YWl0Rm9yQXN5bmNgLiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKTogUnVsZSB7XG4gIHJldHVybiAodHJlZTogVHJlZSkgPT4ge1xuICAgIGNvbnN0IHtidWlsZFBhdGhzLCB0ZXN0UGF0aHN9ID0gZ2V0UHJvamVjdFRzQ29uZmlnUGF0aHModHJlZSk7XG4gICAgY29uc3QgYmFzZVBhdGggPSBwcm9jZXNzLmN3ZCgpO1xuICAgIGNvbnN0IGFsbFBhdGhzID0gWy4uLmJ1aWxkUGF0aHMsIC4uLnRlc3RQYXRoc107XG5cbiAgICBpZiAoIWFsbFBhdGhzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oXG4gICAgICAgICAgJ0NvdWxkIG5vdCBmaW5kIGFueSB0c2NvbmZpZyBmaWxlLiBDYW5ub3QgbWlncmF0ZSBhc3luYyB1c2FnZXMgdG8gd2FpdEZvckFzeW5jLicpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgdHNjb25maWdQYXRoIG9mIGFsbFBhdGhzKSB7XG4gICAgICBydW5XYWl0Rm9yQXN5bmNNaWdyYXRpb24odHJlZSwgdHNjb25maWdQYXRoLCBiYXNlUGF0aCk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBydW5XYWl0Rm9yQXN5bmNNaWdyYXRpb24odHJlZTogVHJlZSwgdHNjb25maWdQYXRoOiBzdHJpbmcsIGJhc2VQYXRoOiBzdHJpbmcpIHtcbiAgLy8gVGVjaG5pY2FsbHkgd2UgY2FuIGdldCBhd2F5IHdpdGggdXNpbmcgYE1PRFVMRV9BVUdNRU5UQVRJT05fRklMRU5BTUVgIGFzIHRoZSBwYXRoLCBidXQgYXMgb2ZcbiAgLy8gVFMgNC4yLCB0aGUgbW9kdWxlIHJlc29sdXRpb24gY2FjaGluZyBzZWVtcyB0byBiZSBtb3JlIGFnZ3Jlc3NpdmUgd2hpY2ggY2F1c2VzIHRoZSBmaWxlIHRvIGJlXG4gIC8vIHJldGFpbmVkIGJldHdlZW4gdGVzdCBydW5zLiBXZSBjYW4gYXZvaWQgaXQgYnkgdXNpbmcgdGhlIGZ1bGwgcGF0aC5cbiAgY29uc3QgYXVnbWVudGVkRmlsZVBhdGggPSBqb2luKGJhc2VQYXRoLCBNT0RVTEVfQVVHTUVOVEFUSU9OX0ZJTEVOQU1FKTtcbiAgY29uc3Qge3Byb2dyYW19ID0gY3JlYXRlTWlncmF0aW9uUHJvZ3JhbSh0cmVlLCB0c2NvbmZpZ1BhdGgsIGJhc2VQYXRoLCBmaWxlTmFtZSA9PiB7XG4gICAgLy8gSW4gY2FzZSB0aGUgbW9kdWxlIGF1Z21lbnRhdGlvbiBmaWxlIGhhcyBiZWVuIHJlcXVlc3RlZCwgd2UgcmV0dXJuIGEgc291cmNlIGZpbGUgdGhhdFxuICAgIC8vIGF1Z21lbnRzIFwiQGFuZ3VsYXIvY29yZS90ZXN0aW5nXCIgdG8gaW5jbHVkZSBhIG5hbWVkIGV4cG9ydCBjYWxsZWQgXCJhc3luY1wiLiBUaGlzIGVuc3VyZXMgdGhhdFxuICAgIC8vIHdlIGNhbiByZWx5IG9uIHRoZSB0eXBlIGNoZWNrZXIgZm9yIHRoaXMgbWlncmF0aW9uIGFmdGVyIGBhc3luY2AgaGFzIGJlZW4gcmVtb3ZlZC5cbiAgICBpZiAoYmFzZW5hbWUoZmlsZU5hbWUpID09PSBNT0RVTEVfQVVHTUVOVEFUSU9OX0ZJTEVOQU1FKSB7XG4gICAgICByZXR1cm4gYFxuICAgICAgICBpbXBvcnQgJ0Bhbmd1bGFyL2NvcmUvdGVzdGluZyc7XG4gICAgICAgIGRlY2xhcmUgbW9kdWxlIFwiQGFuZ3VsYXIvY29yZS90ZXN0aW5nXCIge1xuICAgICAgICAgIGZ1bmN0aW9uIGFzeW5jKGZuOiBGdW5jdGlvbik6IGFueTtcbiAgICAgICAgfVxuICAgICAgYDtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSwgW2F1Z21lbnRlZEZpbGVQYXRoXSk7XG4gIGNvbnN0IHR5cGVDaGVja2VyID0gcHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpO1xuICBjb25zdCBwcmludGVyID0gdHMuY3JlYXRlUHJpbnRlcigpO1xuICBjb25zdCBzb3VyY2VGaWxlcyA9XG4gICAgICBwcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkuZmlsdGVyKHNvdXJjZUZpbGUgPT4gY2FuTWlncmF0ZUZpbGUoYmFzZVBhdGgsIHNvdXJjZUZpbGUsIHByb2dyYW0pKTtcbiAgY29uc3QgZGVwcmVjYXRlZEZ1bmN0aW9uID0gJ2FzeW5jJztcbiAgY29uc3QgbmV3RnVuY3Rpb24gPSAnd2FpdEZvckFzeW5jJztcblxuICBzb3VyY2VGaWxlcy5mb3JFYWNoKHNvdXJjZUZpbGUgPT4ge1xuICAgIGNvbnN0IGFzeW5jSW1wb3J0U3BlY2lmaWVyID1cbiAgICAgICAgZ2V0SW1wb3J0U3BlY2lmaWVyKHNvdXJjZUZpbGUsICdAYW5ndWxhci9jb3JlL3Rlc3RpbmcnLCBkZXByZWNhdGVkRnVuY3Rpb24pO1xuICAgIGNvbnN0IGFzeW5jSW1wb3J0ID0gYXN5bmNJbXBvcnRTcGVjaWZpZXIgP1xuICAgICAgICBjbG9zZXN0Tm9kZTx0cy5OYW1lZEltcG9ydHM+KGFzeW5jSW1wb3J0U3BlY2lmaWVyLCB0cy5TeW50YXhLaW5kLk5hbWVkSW1wb3J0cykgOlxuICAgICAgICBudWxsO1xuXG4gICAgLy8gSWYgdGhlcmUgYXJlIG5vIGltcG9ydHMgZm9yIGBhc3luY2AsIHdlIGNhbiBleGl0IGVhcmx5LlxuICAgIGlmICghYXN5bmNJbXBvcnRTcGVjaWZpZXIgfHwgIWFzeW5jSW1wb3J0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdXBkYXRlID0gdHJlZS5iZWdpblVwZGF0ZShyZWxhdGl2ZShiYXNlUGF0aCwgc291cmNlRmlsZS5maWxlTmFtZSkpO1xuXG4gICAgLy8gQ2hhbmdlIHRoZSBgYXN5bmNgIGltcG9ydCB0byBgd2FpdEZvckFzeW5jYC5cbiAgICB1cGRhdGUucmVtb3ZlKGFzeW5jSW1wb3J0LmdldFN0YXJ0KCksIGFzeW5jSW1wb3J0LmdldFdpZHRoKCkpO1xuICAgIHVwZGF0ZS5pbnNlcnRSaWdodChcbiAgICAgICAgYXN5bmNJbXBvcnQuZ2V0U3RhcnQoKSxcbiAgICAgICAgcHJpbnRlci5wcmludE5vZGUoXG4gICAgICAgICAgICB0cy5FbWl0SGludC5VbnNwZWNpZmllZCwgcmVwbGFjZUltcG9ydChhc3luY0ltcG9ydCwgZGVwcmVjYXRlZEZ1bmN0aW9uLCBuZXdGdW5jdGlvbiksXG4gICAgICAgICAgICBzb3VyY2VGaWxlKSk7XG5cbiAgICAvLyBDaGFuZ2UgYGFzeW5jYCBjYWxscyB0byBgd2FpdEZvckFzeW5jYC5cbiAgICBmaW5kQXN5bmNSZWZlcmVuY2VzKHNvdXJjZUZpbGUsIHR5cGVDaGVja2VyLCBhc3luY0ltcG9ydFNwZWNpZmllcikuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIHVwZGF0ZS5yZW1vdmUobm9kZS5nZXRTdGFydCgpLCBub2RlLmdldFdpZHRoKCkpO1xuICAgICAgdXBkYXRlLmluc2VydFJpZ2h0KG5vZGUuZ2V0U3RhcnQoKSwgbmV3RnVuY3Rpb24pO1xuICAgIH0pO1xuXG4gICAgdHJlZS5jb21taXRVcGRhdGUodXBkYXRlKTtcbiAgfSk7XG59XG4iXX0=