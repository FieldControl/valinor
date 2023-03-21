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
const ts = __importStar(require("../../third_party/github.com/Microsoft/TypeScript/lib/typescript"));
function* visit(directory) {
    for (const path of directory.subfiles) {
        if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
            const entry = directory.file(path);
            if (entry) {
                const content = entry.content;
                if (content.includes('@angular/platform-server') && content.includes('renderModule')) {
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
    return (tree) => {
        for (const sourceFile of visit(tree.root)) {
            let recorder;
            let printer;
            ts.forEachChild(sourceFile, function analyze(node) {
                if (!(ts.isExportDeclaration(node) &&
                    node.moduleSpecifier &&
                    ts.isStringLiteral(node.moduleSpecifier) &&
                    node.moduleSpecifier.text === '@angular/platform-server' &&
                    node.exportClause &&
                    ts.isNamedExports(node.exportClause))) {
                    // Not a @angular/platform-server named export.
                    return;
                }
                const exportClause = node.exportClause;
                const newElements = [];
                for (const element of exportClause.elements) {
                    if (element.name.text !== 'renderModule') {
                        newElements.push(element);
                    }
                }
                if (newElements.length === exportClause.elements.length) {
                    // No changes
                    return;
                }
                recorder !== null && recorder !== void 0 ? recorder : (recorder = tree.beginUpdate(sourceFile.fileName));
                if (newElements.length) {
                    // Update named exports as there are leftovers.
                    const newExportClause = ts.factory.updateNamedExports(exportClause, newElements);
                    printer !== null && printer !== void 0 ? printer : (printer = ts.createPrinter());
                    const fix = printer.printNode(ts.EmitHint.Unspecified, newExportClause, sourceFile);
                    const index = exportClause.getStart();
                    const length = exportClause.getWidth();
                    recorder.remove(index, length).insertLeft(index, fix);
                }
                else {
                    // Delete export as no exports remain.
                    recorder.remove(node.getStart(), node.getWidth());
                }
                ts.forEachChild(node, analyze);
            });
            if (recorder) {
                tree.commitUpdate(recorder);
            }
        }
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLXBsYXRmb3JtLXNlcnZlci1leHBvcnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hdGljcy9hbmd1bGFyL21pZ3JhdGlvbnMvdXBkYXRlLTE1L3JlbW92ZS1wbGF0Zm9ybS1zZXJ2ZXItZXhwb3J0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0gscUdBQXVGO0FBRXZGLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFtQjtJQUNqQyxLQUFLLE1BQU0sSUFBSSxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUU7UUFDckMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNuRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25DLElBQUksS0FBSyxFQUFFO2dCQUNULE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7Z0JBQzlCLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUU7b0JBQ3BGLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDaEMsS0FBSyxDQUFDLElBQUksRUFDVixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFDekMsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQ3RCLElBQUksQ0FDTCxDQUFDO29CQUVGLE1BQU0sTUFBTSxDQUFDO2lCQUNkO2FBQ0Y7U0FDRjtLQUNGO0lBRUQsS0FBSyxNQUFNLElBQUksSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFO1FB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SixDQUFDO0FBMURELDRCQTBEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBEaXJFbnRyeSwgUnVsZSwgVXBkYXRlUmVjb3JkZXIgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICcuLi8uLi90aGlyZF9wYXJ0eS9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2xpYi90eXBlc2NyaXB0JztcblxuZnVuY3Rpb24qIHZpc2l0KGRpcmVjdG9yeTogRGlyRW50cnkpOiBJdGVyYWJsZUl0ZXJhdG9yPHRzLlNvdXJjZUZpbGU+IHtcbiAgZm9yIChjb25zdCBwYXRoIG9mIGRpcmVjdG9yeS5zdWJmaWxlcykge1xuICAgIGlmIChwYXRoLmVuZHNXaXRoKCcudHMnKSAmJiAhcGF0aC5lbmRzV2l0aCgnLmQudHMnKSkge1xuICAgICAgY29uc3QgZW50cnkgPSBkaXJlY3RvcnkuZmlsZShwYXRoKTtcbiAgICAgIGlmIChlbnRyeSkge1xuICAgICAgICBjb25zdCBjb250ZW50ID0gZW50cnkuY29udGVudDtcbiAgICAgICAgaWYgKGNvbnRlbnQuaW5jbHVkZXMoJ0Bhbmd1bGFyL3BsYXRmb3JtLXNlcnZlcicpICYmIGNvbnRlbnQuaW5jbHVkZXMoJ3JlbmRlck1vZHVsZScpKSB7XG4gICAgICAgICAgY29uc3Qgc291cmNlID0gdHMuY3JlYXRlU291cmNlRmlsZShcbiAgICAgICAgICAgIGVudHJ5LnBhdGgsXG4gICAgICAgICAgICBjb250ZW50LnRvU3RyaW5nKCkucmVwbGFjZSgvXlxcdUZFRkYvLCAnJyksXG4gICAgICAgICAgICB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LFxuICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgeWllbGQgc291cmNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yIChjb25zdCBwYXRoIG9mIGRpcmVjdG9yeS5zdWJkaXJzKSB7XG4gICAgaWYgKHBhdGggPT09ICdub2RlX21vZHVsZXMnIHx8IHBhdGguc3RhcnRzV2l0aCgnLicpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB5aWVsZCogdmlzaXQoZGlyZWN0b3J5LmRpcihwYXRoKSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCk6IFJ1bGUge1xuICByZXR1cm4gKHRyZWUpID0+IHtcbiAgICBmb3IgKGNvbnN0IHNvdXJjZUZpbGUgb2YgdmlzaXQodHJlZS5yb290KSkge1xuICAgICAgbGV0IHJlY29yZGVyOiBVcGRhdGVSZWNvcmRlciB8IHVuZGVmaW5lZDtcbiAgICAgIGxldCBwcmludGVyOiB0cy5QcmludGVyIHwgdW5kZWZpbmVkO1xuXG4gICAgICB0cy5mb3JFYWNoQ2hpbGQoc291cmNlRmlsZSwgZnVuY3Rpb24gYW5hbHl6ZShub2RlKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhKFxuICAgICAgICAgICAgdHMuaXNFeHBvcnREZWNsYXJhdGlvbihub2RlKSAmJlxuICAgICAgICAgICAgbm9kZS5tb2R1bGVTcGVjaWZpZXIgJiZcbiAgICAgICAgICAgIHRzLmlzU3RyaW5nTGl0ZXJhbChub2RlLm1vZHVsZVNwZWNpZmllcikgJiZcbiAgICAgICAgICAgIG5vZGUubW9kdWxlU3BlY2lmaWVyLnRleHQgPT09ICdAYW5ndWxhci9wbGF0Zm9ybS1zZXJ2ZXInICYmXG4gICAgICAgICAgICBub2RlLmV4cG9ydENsYXVzZSAmJlxuICAgICAgICAgICAgdHMuaXNOYW1lZEV4cG9ydHMobm9kZS5leHBvcnRDbGF1c2UpXG4gICAgICAgICAgKVxuICAgICAgICApIHtcbiAgICAgICAgICAvLyBOb3QgYSBAYW5ndWxhci9wbGF0Zm9ybS1zZXJ2ZXIgbmFtZWQgZXhwb3J0LlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGV4cG9ydENsYXVzZSA9IG5vZGUuZXhwb3J0Q2xhdXNlO1xuICAgICAgICBjb25zdCBuZXdFbGVtZW50czogdHMuRXhwb3J0U3BlY2lmaWVyW10gPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGV4cG9ydENsYXVzZS5lbGVtZW50cykge1xuICAgICAgICAgIGlmIChlbGVtZW50Lm5hbWUudGV4dCAhPT0gJ3JlbmRlck1vZHVsZScpIHtcbiAgICAgICAgICAgIG5ld0VsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5ld0VsZW1lbnRzLmxlbmd0aCA9PT0gZXhwb3J0Q2xhdXNlLmVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgIC8vIE5vIGNoYW5nZXNcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZWNvcmRlciA/Pz0gdHJlZS5iZWdpblVwZGF0ZShzb3VyY2VGaWxlLmZpbGVOYW1lKTtcblxuICAgICAgICBpZiAobmV3RWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgLy8gVXBkYXRlIG5hbWVkIGV4cG9ydHMgYXMgdGhlcmUgYXJlIGxlZnRvdmVycy5cbiAgICAgICAgICBjb25zdCBuZXdFeHBvcnRDbGF1c2UgPSB0cy5mYWN0b3J5LnVwZGF0ZU5hbWVkRXhwb3J0cyhleHBvcnRDbGF1c2UsIG5ld0VsZW1lbnRzKTtcbiAgICAgICAgICBwcmludGVyID8/PSB0cy5jcmVhdGVQcmludGVyKCk7XG4gICAgICAgICAgY29uc3QgZml4ID0gcHJpbnRlci5wcmludE5vZGUodHMuRW1pdEhpbnQuVW5zcGVjaWZpZWQsIG5ld0V4cG9ydENsYXVzZSwgc291cmNlRmlsZSk7XG5cbiAgICAgICAgICBjb25zdCBpbmRleCA9IGV4cG9ydENsYXVzZS5nZXRTdGFydCgpO1xuICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IGV4cG9ydENsYXVzZS5nZXRXaWR0aCgpO1xuICAgICAgICAgIHJlY29yZGVyLnJlbW92ZShpbmRleCwgbGVuZ3RoKS5pbnNlcnRMZWZ0KGluZGV4LCBmaXgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIERlbGV0ZSBleHBvcnQgYXMgbm8gZXhwb3J0cyByZW1haW4uXG4gICAgICAgICAgcmVjb3JkZXIucmVtb3ZlKG5vZGUuZ2V0U3RhcnQoKSwgbm9kZS5nZXRXaWR0aCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRzLmZvckVhY2hDaGlsZChub2RlLCBhbmFseXplKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocmVjb3JkZXIpIHtcbiAgICAgICAgdHJlZS5jb21taXRVcGRhdGUocmVjb3JkZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cbiJdfQ==