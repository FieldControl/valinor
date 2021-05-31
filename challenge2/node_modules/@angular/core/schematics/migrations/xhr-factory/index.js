(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/core/schematics/migrations/xhr-factory", ["require", "exports", "typescript", "@angular/core/schematics/utils/typescript/imports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ts = require("typescript");
    const imports_1 = require("@angular/core/schematics/utils/typescript/imports");
    function* visit(directory) {
        for (const path of directory.subfiles) {
            if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
                const entry = directory.file(path);
                if (entry) {
                    const content = entry.content;
                    if (content.includes('XhrFactory')) {
                        const source = ts.createSourceFile(entry.path, content.toString().replace(/^\uFEFF/, ''), ts.ScriptTarget.Latest, true);
                        yield source;
                    }
                }
            }
        }
        for (const path of directory.subdirs) {
            if (path === 'node_modules' || path.startsWith('.')) {
                continue;
            }
            yield* visit(directory.dir(path));
        }
    }
    function default_1() {
        return tree => {
            const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
            for (const sourceFile of visit(tree.root)) {
                let recorder;
                const allImportDeclarations = sourceFile.statements.filter(n => ts.isImportDeclaration(n));
                if (allImportDeclarations.length === 0) {
                    continue;
                }
                const httpCommonImport = findImportDeclaration('@angular/common/http', allImportDeclarations);
                if (!httpCommonImport) {
                    continue;
                }
                const commonHttpNamedBinding = getNamedImports(httpCommonImport);
                if (commonHttpNamedBinding) {
                    const commonHttpNamedImports = commonHttpNamedBinding.elements;
                    const xhrFactorySpecifier = imports_1.findImportSpecifier(commonHttpNamedImports, 'XhrFactory');
                    if (!xhrFactorySpecifier) {
                        continue;
                    }
                    recorder = tree.beginUpdate(sourceFile.fileName);
                    // Remove 'XhrFactory' from '@angular/common/http'
                    if (commonHttpNamedImports.length > 1) {
                        // Remove 'XhrFactory' named import
                        const index = commonHttpNamedBinding.getStart();
                        const length = commonHttpNamedBinding.getWidth();
                        const newImports = printer.printNode(ts.EmitHint.Unspecified, ts.factory.updateNamedImports(commonHttpNamedBinding, commonHttpNamedBinding.elements.filter(e => e !== xhrFactorySpecifier)), sourceFile);
                        recorder.remove(index, length).insertLeft(index, newImports);
                    }
                    else {
                        // Remove '@angular/common/http' import
                        const index = httpCommonImport.getFullStart();
                        const length = httpCommonImport.getFullWidth();
                        recorder.remove(index, length);
                    }
                    // Import XhrFactory from @angular/common
                    const commonImport = findImportDeclaration('@angular/common', allImportDeclarations);
                    const commonNamedBinding = getNamedImports(commonImport);
                    if (commonNamedBinding) {
                        // Already has an import for '@angular/common', just add the named import.
                        const index = commonNamedBinding.getStart();
                        const length = commonNamedBinding.getWidth();
                        const newImports = printer.printNode(ts.EmitHint.Unspecified, ts.factory.updateNamedImports(commonNamedBinding, [...commonNamedBinding.elements, xhrFactorySpecifier]), sourceFile);
                        recorder.remove(index, length).insertLeft(index, newImports);
                    }
                    else {
                        // Add import to '@angular/common'
                        const index = httpCommonImport.getFullStart();
                        recorder.insertLeft(index, `\nimport { XhrFactory } from '@angular/common';`);
                    }
                }
                if (recorder) {
                    tree.commitUpdate(recorder);
                }
            }
        };
    }
    exports.default = default_1;
    function findImportDeclaration(moduleSpecifier, importDeclarations) {
        return importDeclarations.find(n => ts.isStringLiteral(n.moduleSpecifier) && n.moduleSpecifier.text === moduleSpecifier);
    }
    function getNamedImports(importDeclaration) {
        var _a;
        const namedBindings = (_a = importDeclaration === null || importDeclaration === void 0 ? void 0 : importDeclaration.importClause) === null || _a === void 0 ? void 0 : _a.namedBindings;
        if (namedBindings && ts.isNamedImports(namedBindings)) {
            return namedBindings;
        }
        return undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NjaGVtYXRpY3MvbWlncmF0aW9ucy94aHItZmFjdG9yeS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQVFBLGlDQUFpQztJQUNqQywrRUFBbUU7SUFFbkUsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQW1CO1FBQ2pDLEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRTtZQUNyQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNuRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLEtBQUssRUFBRTtvQkFDVCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO29CQUM5QixJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUU7d0JBQ2xDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDOUIsS0FBSyxDQUFDLElBQUksRUFDVixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFDekMsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQ3RCLElBQUksQ0FDUCxDQUFDO3dCQUVGLE1BQU0sTUFBTSxDQUFDO3FCQUNkO2lCQUNGO2FBQ0Y7U0FDRjtRQUVELEtBQUssTUFBTSxJQUFJLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRTtZQUNwQyxJQUFJLElBQUksS0FBSyxjQUFjLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbkQsU0FBUzthQUNWO1lBRUQsS0FBSyxDQUFDLENBQUMs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UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0RpckVudHJ5LCBSdWxlLCBVcGRhdGVSZWNvcmRlcn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge2ZpbmRJbXBvcnRTcGVjaWZpZXJ9IGZyb20gJy4uLy4uL3V0aWxzL3R5cGVzY3JpcHQvaW1wb3J0cyc7XG5cbmZ1bmN0aW9uKiB2aXNpdChkaXJlY3Rvcnk6IERpckVudHJ5KTogSXRlcmFibGVJdGVyYXRvcjx0cy5Tb3VyY2VGaWxlPiB7XG4gIGZvciAoY29uc3QgcGF0aCBvZiBkaXJlY3Rvcnkuc3ViZmlsZXMpIHtcbiAgICBpZiAocGF0aC5lbmRzV2l0aCgnLnRzJykgJiYgIXBhdGguZW5kc1dpdGgoJy5kLnRzJykpIHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gZGlyZWN0b3J5LmZpbGUocGF0aCk7XG4gICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGVudHJ5LmNvbnRlbnQ7XG4gICAgICAgIGlmIChjb250ZW50LmluY2x1ZGVzKCdYaHJGYWN0b3J5JykpIHtcbiAgICAgICAgICBjb25zdCBzb3VyY2UgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKFxuICAgICAgICAgICAgICBlbnRyeS5wYXRoLFxuICAgICAgICAgICAgICBjb250ZW50LnRvU3RyaW5nKCkucmVwbGFjZSgvXlxcdUZFRkYvLCAnJyksXG4gICAgICAgICAgICAgIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsXG4gICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIHlpZWxkIHNvdXJjZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoY29uc3QgcGF0aCBvZiBkaXJlY3Rvcnkuc3ViZGlycykge1xuICAgIGlmIChwYXRoID09PSAnbm9kZV9tb2R1bGVzJyB8fCBwYXRoLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgeWllbGQqIHZpc2l0KGRpcmVjdG9yeS5kaXIocGF0aCkpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCk6IFJ1bGUge1xuICByZXR1cm4gdHJlZSA9PiB7XG4gICAgY29uc3QgcHJpbnRlciA9IHRzLmNyZWF0ZVByaW50ZXIoe25ld0xpbmU6IHRzLk5ld0xpbmVLaW5kLkxpbmVGZWVkfSk7XG5cbiAgICBmb3IgKGNvbnN0IHNvdXJjZUZpbGUgb2YgdmlzaXQodHJlZS5yb290KSkge1xuICAgICAgbGV0IHJlY29yZGVyOiBVcGRhdGVSZWNvcmRlcnx1bmRlZmluZWQ7XG5cbiAgICAgIGNvbnN0IGFsbEltcG9ydERlY2xhcmF0aW9ucyA9XG4gICAgICAgICAgc291cmNlRmlsZS5zdGF0ZW1lbnRzLmZpbHRlcihuID0+IHRzLmlzSW1wb3J0RGVjbGFyYXRpb24obikpIGFzIHRzLkltcG9ydERlY2xhcmF0aW9uW107XG4gICAgICBpZiAoYWxsSW1wb3J0RGVjbGFyYXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaHR0cENvbW1vbkltcG9ydCA9IGZpbmRJbXBvcnREZWNsYXJhdGlvbignQGFuZ3VsYXIvY29tbW9uL2h0dHAnLCBhbGxJbXBvcnREZWNsYXJhdGlvbnMpO1xuICAgICAgaWYgKCFodHRwQ29tbW9uSW1wb3J0KSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb21tb25IdHRwTmFtZWRCaW5kaW5nID0gZ2V0TmFtZWRJbXBvcnRzKGh0dHBDb21tb25JbXBvcnQpO1xuICAgICAgaWYgKGNvbW1vbkh0dHBOYW1lZEJpbmRpbmcpIHtcbiAgICAgICAgY29uc3QgY29tbW9uSHR0cE5hbWVkSW1wb3J0cyA9IGNvbW1vbkh0dHBOYW1lZEJpbmRpbmcuZWxlbWVudHM7XG4gICAgICAgIGNvbnN0IHhockZhY3RvcnlTcGVjaWZpZXIgPSBmaW5kSW1wb3J0U3BlY2lmaWVyKGNvbW1vbkh0dHBOYW1lZEltcG9ydHMsICdYaHJGYWN0b3J5Jyk7XG5cbiAgICAgICAgaWYgKCF4aHJGYWN0b3J5U3BlY2lmaWVyKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICByZWNvcmRlciA9IHRyZWUuYmVnaW5VcGRhdGUoc291cmNlRmlsZS5maWxlTmFtZSk7XG5cbiAgICAgICAgLy8gUmVtb3ZlICdYaHJGYWN0b3J5JyBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCdcbiAgICAgICAgaWYgKGNvbW1vbkh0dHBOYW1lZEltcG9ydHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIC8vIFJlbW92ZSAnWGhyRmFjdG9yeScgbmFtZWQgaW1wb3J0XG4gICAgICAgICAgY29uc3QgaW5kZXggPSBjb21tb25IdHRwTmFtZWRCaW5kaW5nLmdldFN0YXJ0KCk7XG4gICAgICAgICAgY29uc3QgbGVuZ3RoID0gY29tbW9uSHR0cE5hbWVkQmluZGluZy5nZXRXaWR0aCgpO1xuXG4gICAgICAgICAgY29uc3QgbmV3SW1wb3J0cyA9IHByaW50ZXIucHJpbnROb2RlKFxuICAgICAgICAgICAgICB0cy5FbWl0SGludC5VbnNwZWNpZmllZCxcbiAgICAgICAgICAgICAgdHMuZmFjdG9yeS51cGRhdGVOYW1lZEltcG9ydHMoXG4gICAgICAgICAgICAgICAgICBjb21tb25IdHRwTmFtZWRCaW5kaW5nLFxuICAgICAgICAgICAgICAgICAgY29tbW9uSHR0cE5hbWVkQmluZGluZy5lbGVtZW50cy5maWx0ZXIoZSA9PiBlICE9PSB4aHJGYWN0b3J5U3BlY2lmaWVyKSksXG4gICAgICAgICAgICAgIHNvdXJjZUZpbGUpO1xuICAgICAgICAgIHJlY29yZGVyLnJlbW92ZShpbmRleCwgbGVuZ3RoKS5pbnNlcnRMZWZ0KGluZGV4LCBuZXdJbXBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBSZW1vdmUgJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJyBpbXBvcnRcbiAgICAgICAgICBjb25zdCBpbmRleCA9IGh0dHBDb21tb25JbXBvcnQuZ2V0RnVsbFN0YXJ0KCk7XG4gICAgICAgICAgY29uc3QgbGVuZ3RoID0gaHR0cENvbW1vbkltcG9ydC5nZXRGdWxsV2lkdGgoKTtcbiAgICAgICAgICByZWNvcmRlci5yZW1vdmUoaW5kZXgsIGxlbmd0aCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbXBvcnQgWGhyRmFjdG9yeSBmcm9tIEBhbmd1bGFyL2NvbW1vblxuICAgICAgICBjb25zdCBjb21tb25JbXBvcnQgPSBmaW5kSW1wb3J0RGVjbGFyYXRpb24oJ0Bhbmd1bGFyL2NvbW1vbicsIGFsbEltcG9ydERlY2xhcmF0aW9ucyk7XG4gICAgICAgIGNvbnN0IGNvbW1vbk5hbWVkQmluZGluZyA9IGdldE5hbWVkSW1wb3J0cyhjb21tb25JbXBvcnQpO1xuICAgICAgICBpZiAoY29tbW9uTmFtZWRCaW5kaW5nKSB7XG4gICAgICAgICAgLy8gQWxyZWFkeSBoYXMgYW4gaW1wb3J0IGZvciAnQGFuZ3VsYXIvY29tbW9uJywganVzdCBhZGQgdGhlIG5hbWVkIGltcG9ydC5cbiAgICAgICAgICBjb25zdCBpbmRleCA9IGNvbW1vbk5hbWVkQmluZGluZy5nZXRTdGFydCgpO1xuICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IGNvbW1vbk5hbWVkQmluZGluZy5nZXRXaWR0aCgpO1xuICAgICAgICAgIGNvbnN0IG5ld0ltcG9ydHMgPSBwcmludGVyLnByaW50Tm9kZShcbiAgICAgICAgICAgICAgdHMuRW1pdEhpbnQuVW5zcGVjaWZpZWQsXG4gICAgICAgICAgICAgIHRzLmZhY3RvcnkudXBkYXRlTmFtZWRJbXBvcnRzKFxuICAgICAgICAgICAgICAgICAgY29tbW9uTmFtZWRCaW5kaW5nLCBbLi4uY29tbW9uTmFtZWRCaW5kaW5nLmVsZW1lbnRzLCB4aHJGYWN0b3J5U3BlY2lmaWVyXSksXG4gICAgICAgICAgICAgIHNvdXJjZUZpbGUpO1xuXG4gICAgICAgICAgcmVjb3JkZXIucmVtb3ZlKGluZGV4LCBsZW5ndGgpLmluc2VydExlZnQoaW5kZXgsIG5ld0ltcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEFkZCBpbXBvcnQgdG8gJ0Bhbmd1bGFyL2NvbW1vbidcbiAgICAgICAgICBjb25zdCBpbmRleCA9IGh0dHBDb21tb25JbXBvcnQuZ2V0RnVsbFN0YXJ0KCk7XG4gICAgICAgICAgcmVjb3JkZXIuaW5zZXJ0TGVmdChpbmRleCwgYFxcbmltcG9ydCB7IFhockZhY3RvcnkgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO2ApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmRlcikge1xuICAgICAgICB0cmVlLmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBmaW5kSW1wb3J0RGVjbGFyYXRpb24obW9kdWxlU3BlY2lmaWVyOiBzdHJpbmcsIGltcG9ydERlY2xhcmF0aW9uczogdHMuSW1wb3J0RGVjbGFyYXRpb25bXSk6XG4gICAgdHMuSW1wb3J0RGVjbGFyYXRpb258dW5kZWZpbmVkIHtcbiAgcmV0dXJuIGltcG9ydERlY2xhcmF0aW9ucy5maW5kKFxuICAgICAgbiA9PiB0cy5pc1N0cmluZ0xpdGVyYWwobi5tb2R1bGVTcGVjaWZpZXIpICYmIG4ubW9kdWxlU3BlY2lmaWVyLnRleHQgPT09IG1vZHVsZVNwZWNpZmllcik7XG59XG5cbmZ1bmN0aW9uIGdldE5hbWVkSW1wb3J0cyhpbXBvcnREZWNsYXJhdGlvbjogdHMuSW1wb3J0RGVjbGFyYXRpb258dW5kZWZpbmVkKTogdHMuTmFtZWRJbXBvcnRzfFxuICAgIHVuZGVmaW5lZCB7XG4gIGNvbnN0IG5hbWVkQmluZGluZ3MgPSBpbXBvcnREZWNsYXJhdGlvbj8uaW1wb3J0Q2xhdXNlPy5uYW1lZEJpbmRpbmdzO1xuICBpZiAobmFtZWRCaW5kaW5ncyAmJiB0cy5pc05hbWVkSW1wb3J0cyhuYW1lZEJpbmRpbmdzKSkge1xuICAgIHJldHVybiBuYW1lZEJpbmRpbmdzO1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn0iXX0=