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
        define("@angular/core/schematics/migrations/renderer-to-renderer2", ["require", "exports", "@angular-devkit/schematics", "path", "typescript", "@angular/core/schematics/utils/project_tsconfig_paths", "@angular/core/schematics/utils/typescript/compiler_host", "@angular/core/schematics/utils/typescript/imports", "@angular/core/schematics/utils/typescript/nodes", "@angular/core/schematics/migrations/renderer-to-renderer2/helpers", "@angular/core/schematics/migrations/renderer-to-renderer2/migration", "@angular/core/schematics/migrations/renderer-to-renderer2/util"], factory);
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
    const helpers_1 = require("@angular/core/schematics/migrations/renderer-to-renderer2/helpers");
    const migration_1 = require("@angular/core/schematics/migrations/renderer-to-renderer2/migration");
    const util_1 = require("@angular/core/schematics/migrations/renderer-to-renderer2/util");
    const MODULE_AUGMENTATION_FILENAME = 'ɵɵRENDERER_MIGRATION_CORE_AUGMENTATION.d.ts';
    /**
     * Migration that switches from `Renderer` to `Renderer2`. More information on how it works:
     * https://hackmd.angular.io/UTzUZTnPRA-cSa_4mHyfYw
     */
    function default_1() {
        return (tree) => {
            const { buildPaths, testPaths } = project_tsconfig_paths_1.getProjectTsConfigPaths(tree);
            const basePath = process.cwd();
            const allPaths = [...buildPaths, ...testPaths];
            if (!allPaths.length) {
                throw new schematics_1.SchematicsException('Could not find any tsconfig file. Cannot migrate Renderer usages to Renderer2.');
            }
            for (const tsconfigPath of allPaths) {
                runRendererToRenderer2Migration(tree, tsconfigPath, basePath);
            }
        };
    }
    exports.default = default_1;
    function runRendererToRenderer2Migration(tree, tsconfigPath, basePath) {
        // Technically we can get away with using `MODULE_AUGMENTATION_FILENAME` as the path, but as of
        // TS 4.2, the module resolution caching seems to be more aggressive which causes the file to be
        // retained between test runs. We can avoid it by using the full path.
        const augmentedFilePath = path_1.join(basePath, MODULE_AUGMENTATION_FILENAME);
        const { program } = compiler_host_1.createMigrationProgram(tree, tsconfigPath, basePath, fileName => {
            // In case the module augmentation file has been requested, we return a source file that
            // augments "@angular/core" to include a named export called "Renderer". This ensures that
            // we can rely on the type checker for this migration in v9 where "Renderer" has been removed.
            if (path_1.basename(fileName) === MODULE_AUGMENTATION_FILENAME) {
                return `
        import '@angular/core';
        declare module "@angular/core" {
          class Renderer {}
        }
      `;
            }
            return undefined;
        }, [augmentedFilePath]);
        const typeChecker = program.getTypeChecker();
        const printer = ts.createPrinter();
        const sourceFiles = program.getSourceFiles().filter(sourceFile => compiler_host_1.canMigrateFile(basePath, sourceFile, program));
        sourceFiles.forEach(sourceFile => {
            const rendererImportSpecifier = imports_1.getImportSpecifier(sourceFile, '@angular/core', 'Renderer');
            const rendererImport = rendererImportSpecifier ?
                nodes_1.closestNode(rendererImportSpecifier, ts.SyntaxKind.NamedImports) :
                null;
            // If there are no imports for the `Renderer`, we can exit early.
            if (!rendererImportSpecifier || !rendererImport) {
                return;
            }
            const { typedNodes, methodCalls, forwardRefs } = util_1.findRendererReferences(sourceFile, typeChecker, rendererImportSpecifier);
            const update = tree.beginUpdate(path_1.relative(basePath, sourceFile.fileName));
            const helpersToAdd = new Set();
            // Change the `Renderer` import to `Renderer2`.
            update.remove(rendererImport.getStart(), rendererImport.getWidth());
            update.insertRight(rendererImport.getStart(), printer.printNode(ts.EmitHint.Unspecified, imports_1.replaceImport(rendererImport, 'Renderer', 'Renderer2'), sourceFile));
            // Change the method parameter and property types to `Renderer2`.
            typedNodes.forEach(node => {
                const type = node.type;
                if (type) {
                    update.remove(type.getStart(), type.getWidth());
                    update.insertRight(type.getStart(), 'Renderer2');
                }
            });
            // Change all identifiers inside `forwardRef` referring to the `Renderer`.
            forwardRefs.forEach(identifier => {
                update.remove(identifier.getStart(), identifier.getWidth());
                update.insertRight(identifier.getStart(), 'Renderer2');
            });
            // Migrate all of the method calls.
            methodCalls.forEach(call => {
                const { node, requiredHelpers } = migration_1.migrateExpression(call, typeChecker);
                if (node) {
                    // If we migrated the node to a new expression, replace only the call expression.
                    update.remove(call.getStart(), call.getWidth());
                    update.insertRight(call.getStart(), printer.printNode(ts.EmitHint.Unspecified, node, sourceFile));
                }
                else if (call.parent && ts.isExpressionStatement(call.parent)) {
                    // Otherwise if the call is inside an expression statement, drop the entire statement.
                    // This takes care of any trailing semicolons. We only need to drop nodes for cases like
                    // `setBindingDebugInfo` which have been noop for a while so they can be removed safely.
                    update.remove(call.parent.getStart(), call.parent.getWidth());
                }
                if (requiredHelpers) {
                    requiredHelpers.forEach(helperName => helpersToAdd.add(helperName));
                }
            });
            // Some of the methods can't be mapped directly to `Renderer2` and need extra logic around them.
            // The safest way to do so is to declare helper functions similar to the ones emitted by TS
            // which encapsulate the extra "glue" logic. We should only emit these functions once per file.
            helpersToAdd.forEach(helperName => {
                update.insertLeft(sourceFile.endOfFileToken.getStart(), helpers_1.getHelper(helperName, sourceFile, printer));
            });
            tree.commitUpdate(update);
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NjaGVtYXRpY3MvbWlncmF0aW9ucy9yZW5kZXJlci10by1yZW5kZXJlcjIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCwyREFBMkU7SUFDM0UsK0JBQThDO0lBQzlDLGlDQUFpQztJQUVqQyxrR0FBMkU7SUFDM0UsMkZBQTRGO0lBQzVGLCtFQUFpRjtJQUNqRiwyRUFBeUQ7SUFFekQsK0ZBQW9EO0lBQ3BELG1HQUE4QztJQUM5Qyx5RkFBOEM7SUFFOUMsTUFBTSw0QkFBNEIsR0FBRyw2Q0FBNkMsQ0FBQztJQUVuRjs7O09BR0c7SUFDSDtRQUNFLE9BQU8sQ0FBQyxJQUFVLEVBQUUsRUFBRTtZQUNwQixNQUFNLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBQyxHQUFHLGdEQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMvQixNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQUcsVUFBVSxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3BCLE1BQU0sSUFBSSxnQ0FBbUIsQ0FDekIsZ0ZBQWdGLENBQUMsQ0FBQzthQUN2RjtZQUVELEtBQUssTUFBTSxZQUFZLElBQUksUUFBUSxFQUFFO2dCQUNuQywrQkFBK0IsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQy9EO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQWZELDRCQWVDO0lBRUQsU0FBUywrQkFBK0IsQ0FBQyxJQUFVLEVBQUUsWUFBb0IsRUFBRSxRQUFnQjtRQUN6RiwrRkFBK0Y7UUFDL0YsZ0dBQWdHO1FBQ2hHLHNFQUFzRTtRQUN0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aEMsTUFBTSxDQUFDLFVBQVUsQ0FDYixVQUFVLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxFQUFFLG1CQUFTLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSdWxlLCBTY2hlbWF0aWNzRXhjZXB0aW9uLCBUcmVlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQge2Jhc2VuYW1lLCBqb2luLCByZWxhdGl2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtnZXRQcm9qZWN0VHNDb25maWdQYXRoc30gZnJvbSAnLi4vLi4vdXRpbHMvcHJvamVjdF90c2NvbmZpZ19wYXRocyc7XG5pbXBvcnQge2Nhbk1pZ3JhdGVGaWxlLCBjcmVhdGVNaWdyYXRpb25Qcm9ncmFtfSBmcm9tICcuLi8uLi91dGlscy90eXBlc2NyaXB0L2NvbXBpbGVyX2hvc3QnO1xuaW1wb3J0IHtnZXRJbXBvcnRTcGVjaWZpZXIsIHJlcGxhY2VJbXBvcnR9IGZyb20gJy4uLy4uL3V0aWxzL3R5cGVzY3JpcHQvaW1wb3J0cyc7XG5pbXBvcnQge2Nsb3Nlc3ROb2RlfSBmcm9tICcuLi8uLi91dGlscy90eXBlc2NyaXB0L25vZGVzJztcblxuaW1wb3J0IHtnZXRIZWxwZXIsIEhlbHBlckZ1bmN0aW9ufSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHttaWdyYXRlRXhwcmVzc2lvbn0gZnJvbSAnLi9taWdyYXRpb24nO1xuaW1wb3J0IHtmaW5kUmVuZGVyZXJSZWZlcmVuY2VzfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBNT0RVTEVfQVVHTUVOVEFUSU9OX0ZJTEVOQU1FID0gJ8m1ybVSRU5ERVJFUl9NSUdSQVRJT05fQ09SRV9BVUdNRU5UQVRJT04uZC50cyc7XG5cbi8qKlxuICogTWlncmF0aW9uIHRoYXQgc3dpdGNoZXMgZnJvbSBgUmVuZGVyZXJgIHRvIGBSZW5kZXJlcjJgLiBNb3JlIGluZm9ybWF0aW9uIG9uIGhvdyBpdCB3b3JrczpcbiAqIGh0dHBzOi8vaGFja21kLmFuZ3VsYXIuaW8vVVR6VVpUblBSQS1jU2FfNG1IeWZZd1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpOiBSdWxlIHtcbiAgcmV0dXJuICh0cmVlOiBUcmVlKSA9PiB7XG4gICAgY29uc3Qge2J1aWxkUGF0aHMsIHRlc3RQYXRoc30gPSBnZXRQcm9qZWN0VHNDb25maWdQYXRocyh0cmVlKTtcbiAgICBjb25zdCBiYXNlUGF0aCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgY29uc3QgYWxsUGF0aHMgPSBbLi4uYnVpbGRQYXRocywgLi4udGVzdFBhdGhzXTtcblxuICAgIGlmICghYWxsUGF0aHMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihcbiAgICAgICAgICAnQ291bGQgbm90IGZpbmQgYW55IHRzY29uZmlnIGZpbGUuIENhbm5vdCBtaWdyYXRlIFJlbmRlcmVyIHVzYWdlcyB0byBSZW5kZXJlcjIuJyk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCB0c2NvbmZpZ1BhdGggb2YgYWxsUGF0aHMpIHtcbiAgICAgIHJ1blJlbmRlcmVyVG9SZW5kZXJlcjJNaWdyYXRpb24odHJlZSwgdHNjb25maWdQYXRoLCBiYXNlUGF0aCk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBydW5SZW5kZXJlclRvUmVuZGVyZXIyTWlncmF0aW9uKHRyZWU6IFRyZWUsIHRzY29uZmlnUGF0aDogc3RyaW5nLCBiYXNlUGF0aDogc3RyaW5nKSB7XG4gIC8vIFRlY2huaWNhbGx5IHdlIGNhbiBnZXQgYXdheSB3aXRoIHVzaW5nIGBNT0RVTEVfQVVHTUVOVEFUSU9OX0ZJTEVOQU1FYCBhcyB0aGUgcGF0aCwgYnV0IGFzIG9mXG4gIC8vIFRTIDQuMiwgdGhlIG1vZHVsZSByZXNvbHV0aW9uIGNhY2hpbmcgc2VlbXMgdG8gYmUgbW9yZSBhZ2dyZXNzaXZlIHdoaWNoIGNhdXNlcyB0aGUgZmlsZSB0byBiZVxuICAvLyByZXRhaW5lZCBiZXR3ZWVuIHRlc3QgcnVucy4gV2UgY2FuIGF2b2lkIGl0IGJ5IHVzaW5nIHRoZSBmdWxsIHBhdGguXG4gIGNvbnN0IGF1Z21lbnRlZEZpbGVQYXRoID0gam9pbihiYXNlUGF0aCwgTU9EVUxFX0FVR01FTlRBVElPTl9GSUxFTkFNRSk7XG4gIGNvbnN0IHtwcm9ncmFtfSA9IGNyZWF0ZU1pZ3JhdGlvblByb2dyYW0odHJlZSwgdHNjb25maWdQYXRoLCBiYXNlUGF0aCwgZmlsZU5hbWUgPT4ge1xuICAgIC8vIEluIGNhc2UgdGhlIG1vZHVsZSBhdWdtZW50YXRpb24gZmlsZSBoYXMgYmVlbiByZXF1ZXN0ZWQsIHdlIHJldHVybiBhIHNvdXJjZSBmaWxlIHRoYXRcbiAgICAvLyBhdWdtZW50cyBcIkBhbmd1bGFyL2NvcmVcIiB0byBpbmNsdWRlIGEgbmFtZWQgZXhwb3J0IGNhbGxlZCBcIlJlbmRlcmVyXCIuIFRoaXMgZW5zdXJlcyB0aGF0XG4gICAgLy8gd2UgY2FuIHJlbHkgb24gdGhlIHR5cGUgY2hlY2tlciBmb3IgdGhpcyBtaWdyYXRpb24gaW4gdjkgd2hlcmUgXCJSZW5kZXJlclwiIGhhcyBiZWVuIHJlbW92ZWQuXG4gICAgaWYgKGJhc2VuYW1lKGZpbGVOYW1lKSA9PT0gTU9EVUxFX0FVR01FTlRBVElPTl9GSUxFTkFNRSkge1xuICAgICAgcmV0dXJuIGBcbiAgICAgICAgaW1wb3J0ICdAYW5ndWxhci9jb3JlJztcbiAgICAgICAgZGVjbGFyZSBtb2R1bGUgXCJAYW5ndWxhci9jb3JlXCIge1xuICAgICAgICAgIGNsYXNzIFJlbmRlcmVyIHt9XG4gICAgICAgIH1cbiAgICAgIGA7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0sIFthdWdtZW50ZWRGaWxlUGF0aF0pO1xuICBjb25zdCB0eXBlQ2hlY2tlciA9IHByb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKTtcbiAgY29uc3QgcHJpbnRlciA9IHRzLmNyZWF0ZVByaW50ZXIoKTtcbiAgY29uc3Qgc291cmNlRmlsZXMgPVxuICAgICAgcHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLmZpbHRlcihzb3VyY2VGaWxlID0+IGNhbk1pZ3JhdGVGaWxlKGJhc2VQYXRoLCBzb3VyY2VGaWxlLCBwcm9ncmFtKSk7XG5cbiAgc291cmNlRmlsZXMuZm9yRWFjaChzb3VyY2VGaWxlID0+IHtcbiAgICBjb25zdCByZW5kZXJlckltcG9ydFNwZWNpZmllciA9IGdldEltcG9ydFNwZWNpZmllcihzb3VyY2VGaWxlLCAnQGFuZ3VsYXIvY29yZScsICdSZW5kZXJlcicpO1xuICAgIGNvbnN0IHJlbmRlcmVySW1wb3J0ID0gcmVuZGVyZXJJbXBvcnRTcGVjaWZpZXIgP1xuICAgICAgICBjbG9zZXN0Tm9kZTx0cy5OYW1lZEltcG9ydHM+KHJlbmRlcmVySW1wb3J0U3BlY2lmaWVyLCB0cy5TeW50YXhLaW5kLk5hbWVkSW1wb3J0cykgOlxuICAgICAgICBudWxsO1xuXG4gICAgLy8gSWYgdGhlcmUgYXJlIG5vIGltcG9ydHMgZm9yIHRoZSBgUmVuZGVyZXJgLCB3ZSBjYW4gZXhpdCBlYXJseS5cbiAgICBpZiAoIXJlbmRlcmVySW1wb3J0U3BlY2lmaWVyIHx8ICFyZW5kZXJlckltcG9ydCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHt0eXBlZE5vZGVzLCBtZXRob2RDYWxscywgZm9yd2FyZFJlZnN9ID1cbiAgICAgICAgZmluZFJlbmRlcmVyUmVmZXJlbmNlcyhzb3VyY2VGaWxlLCB0eXBlQ2hlY2tlciwgcmVuZGVyZXJJbXBvcnRTcGVjaWZpZXIpO1xuICAgIGNvbnN0IHVwZGF0ZSA9IHRyZWUuYmVnaW5VcGRhdGUocmVsYXRpdmUoYmFzZVBhdGgsIHNvdXJjZUZpbGUuZmlsZU5hbWUpKTtcbiAgICBjb25zdCBoZWxwZXJzVG9BZGQgPSBuZXcgU2V0PEhlbHBlckZ1bmN0aW9uPigpO1xuXG4gICAgLy8gQ2hhbmdlIHRoZSBgUmVuZGVyZXJgIGltcG9ydCB0byBgUmVuZGVyZXIyYC5cbiAgICB1cGRhdGUucmVtb3ZlKHJlbmRlcmVySW1wb3J0LmdldFN0YXJ0KCksIHJlbmRlcmVySW1wb3J0LmdldFdpZHRoKCkpO1xuICAgIHVwZGF0ZS5pbnNlcnRSaWdodChcbiAgICAgICAgcmVuZGVyZXJJbXBvcnQuZ2V0U3RhcnQoKSxcbiAgICAgICAgcHJpbnRlci5wcmludE5vZGUoXG4gICAgICAgICAgICB0cy5FbWl0SGludC5VbnNwZWNpZmllZCwgcmVwbGFjZUltcG9ydChyZW5kZXJlckltcG9ydCwgJ1JlbmRlcmVyJywgJ1JlbmRlcmVyMicpLFxuICAgICAgICAgICAgc291cmNlRmlsZSkpO1xuXG4gICAgLy8gQ2hhbmdlIHRoZSBtZXRob2QgcGFyYW1ldGVyIGFuZCBwcm9wZXJ0eSB0eXBlcyB0byBgUmVuZGVyZXIyYC5cbiAgICB0eXBlZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICBjb25zdCB0eXBlID0gbm9kZS50eXBlO1xuXG4gICAgICBpZiAodHlwZSkge1xuICAgICAgICB1cGRhdGUucmVtb3ZlKHR5cGUuZ2V0U3RhcnQoKSwgdHlwZS5nZXRXaWR0aCgpKTtcbiAgICAgICAgdXBkYXRlLmluc2VydFJpZ2h0KHR5cGUuZ2V0U3RhcnQoKSwgJ1JlbmRlcmVyMicpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQ2hhbmdlIGFsbCBpZGVudGlmaWVycyBpbnNpZGUgYGZvcndhcmRSZWZgIHJlZmVycmluZyB0byB0aGUgYFJlbmRlcmVyYC5cbiAgICBmb3J3YXJkUmVmcy5mb3JFYWNoKGlkZW50aWZpZXIgPT4ge1xuICAgICAgdXBkYXRlLnJlbW92ZShpZGVudGlmaWVyLmdldFN0YXJ0KCksIGlkZW50aWZpZXIuZ2V0V2lkdGgoKSk7XG4gICAgICB1cGRhdGUuaW5zZXJ0UmlnaHQoaWRlbnRpZmllci5nZXRTdGFydCgpLCAnUmVuZGVyZXIyJyk7XG4gICAgfSk7XG5cbiAgICAvLyBNaWdyYXRlIGFsbCBvZiB0aGUgbWV0aG9kIGNhbGxzLlxuICAgIG1ldGhvZENhbGxzLmZvckVhY2goY2FsbCA9PiB7XG4gICAgICBjb25zdCB7bm9kZSwgcmVxdWlyZWRIZWxwZXJzfSA9IG1pZ3JhdGVFeHByZXNzaW9uKGNhbGwsIHR5cGVDaGVja2VyKTtcblxuICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgLy8gSWYgd2UgbWlncmF0ZWQgdGhlIG5vZGUgdG8gYSBuZXcgZXhwcmVzc2lvbiwgcmVwbGFjZSBvbmx5IHRoZSBjYWxsIGV4cHJlc3Npb24uXG4gICAgICAgIHVwZGF0ZS5yZW1vdmUoY2FsbC5nZXRTdGFydCgpLCBjYWxsLmdldFdpZHRoKCkpO1xuICAgICAgICB1cGRhdGUuaW5zZXJ0UmlnaHQoXG4gICAgICAgICAgICBjYWxsLmdldFN0YXJ0KCksIHByaW50ZXIucHJpbnROb2RlKHRzLkVtaXRIaW50LlVuc3BlY2lmaWVkLCBub2RlLCBzb3VyY2VGaWxlKSk7XG4gICAgICB9IGVsc2UgaWYgKGNhbGwucGFyZW50ICYmIHRzLmlzRXhwcmVzc2lvblN0YXRlbWVudChjYWxsLnBhcmVudCkpIHtcbiAgICAgICAgLy8gT3RoZXJ3aXNlIGlmIHRoZSBjYWxsIGlzIGluc2lkZSBhbiBleHByZXNzaW9uIHN0YXRlbWVudCwgZHJvcCB0aGUgZW50aXJlIHN0YXRlbWVudC5cbiAgICAgICAgLy8gVGhpcyB0YWtlcyBjYXJlIG9mIGFueSB0cmFpbGluZyBzZW1pY29sb25zLiBXZSBvbmx5IG5lZWQgdG8gZHJvcCBub2RlcyBmb3IgY2FzZXMgbGlrZVxuICAgICAgICAvLyBgc2V0QmluZGluZ0RlYnVnSW5mb2Agd2hpY2ggaGF2ZSBiZWVuIG5vb3AgZm9yIGEgd2hpbGUgc28gdGhleSBjYW4gYmUgcmVtb3ZlZCBzYWZlbHkuXG4gICAgICAgIHVwZGF0ZS5yZW1vdmUoY2FsbC5wYXJlbnQuZ2V0U3RhcnQoKSwgY2FsbC5wYXJlbnQuZ2V0V2lkdGgoKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZXF1aXJlZEhlbHBlcnMpIHtcbiAgICAgICAgcmVxdWlyZWRIZWxwZXJzLmZvckVhY2goaGVscGVyTmFtZSA9PiBoZWxwZXJzVG9BZGQuYWRkKGhlbHBlck5hbWUpKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFNvbWUgb2YgdGhlIG1ldGhvZHMgY2FuJ3QgYmUgbWFwcGVkIGRpcmVjdGx5IHRvIGBSZW5kZXJlcjJgIGFuZCBuZWVkIGV4dHJhIGxvZ2ljIGFyb3VuZCB0aGVtLlxuICAgIC8vIFRoZSBzYWZlc3Qgd2F5IHRvIGRvIHNvIGlzIHRvIGRlY2xhcmUgaGVscGVyIGZ1bmN0aW9ucyBzaW1pbGFyIHRvIHRoZSBvbmVzIGVtaXR0ZWQgYnkgVFNcbiAgICAvLyB3aGljaCBlbmNhcHN1bGF0ZSB0aGUgZXh0cmEgXCJnbHVlXCIgbG9naWMuIFdlIHNob3VsZCBvbmx5IGVtaXQgdGhlc2UgZnVuY3Rpb25zIG9uY2UgcGVyIGZpbGUuXG4gICAgaGVscGVyc1RvQWRkLmZvckVhY2goaGVscGVyTmFtZSA9PiB7XG4gICAgICB1cGRhdGUuaW5zZXJ0TGVmdChcbiAgICAgICAgICBzb3VyY2VGaWxlLmVuZE9mRmlsZVRva2VuLmdldFN0YXJ0KCksIGdldEhlbHBlcihoZWxwZXJOYW1lLCBzb3VyY2VGaWxlLCBwcmludGVyKSk7XG4gICAgfSk7XG5cbiAgICB0cmVlLmNvbW1pdFVwZGF0ZSh1cGRhdGUpO1xuICB9KTtcbn1cbiJdfQ==