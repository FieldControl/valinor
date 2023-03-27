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
const utility_1 = require("../../utility");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
function default_1() {
    return async (host) => {
        for (const file of await findTestMainFiles(host)) {
            updateTestFile(host, file);
        }
    };
}
exports.default = default_1;
async function findTestMainFiles(host) {
    const testFiles = new Set();
    const workspace = await (0, utility_1.readWorkspace)(host);
    // find all test.ts files.
    for (const project of workspace.projects.values()) {
        for (const target of project.targets.values()) {
            if (target.builder !== workspace_models_1.Builders.Karma) {
                continue;
            }
            for (const [, options] of (0, workspace_1.allTargetOptions)(target)) {
                if (typeof options.main === 'string') {
                    testFiles.add(options.main);
                }
            }
        }
    }
    return testFiles;
}
function updateTestFile(host, file) {
    const content = host.readText(file);
    if (!content.includes('require.context')) {
        return;
    }
    const sourceFile = ts.createSourceFile(file, content.replace(/^\uFEFF/, ''), ts.ScriptTarget.Latest, true);
    const usedVariableNames = new Set();
    const recorder = host.beginUpdate(sourceFile.fileName);
    ts.forEachChild(sourceFile, (node) => {
        var _a, _b;
        if (ts.isVariableStatement(node)) {
            const variableDeclaration = node.declarationList.declarations[0];
            if ((_a = ts.getModifiers(node)) === null || _a === void 0 ? void 0 : _a.some((m) => m.kind === ts.SyntaxKind.DeclareKeyword)) {
                // `declare const require`
                if (variableDeclaration.name.getText() !== 'require') {
                    return;
                }
            }
            else {
                // `const context = require.context('./', true, /\.spec\.ts$/);`
                if (!((_b = variableDeclaration.initializer) === null || _b === void 0 ? void 0 : _b.getText().startsWith('require.context'))) {
                    return;
                }
                // add variable name as used.
                usedVariableNames.add(variableDeclaration.name.getText());
            }
            // Delete node.
            recorder.remove(node.getFullStart(), node.getFullWidth());
        }
        if (usedVariableNames.size &&
            ts.isExpressionStatement(node) && // context.keys().map(context);
            ts.isCallExpression(node.expression) && // context.keys().map(context);
            ts.isPropertyAccessExpression(node.expression.expression) && // context.keys().map
            ts.isCallExpression(node.expression.expression.expression) && // context.keys()
            ts.isPropertyAccessExpression(node.expression.expression.expression.expression) && // context.keys
            ts.isIdentifier(node.expression.expression.expression.expression.expression) && // context
            usedVariableNames.has(node.expression.expression.expression.expression.expression.getText())) {
            // `context.keys().map(context);`
            // `context.keys().forEach(context);`
            recorder.remove(node.getFullStart(), node.getFullWidth());
        }
    });
    host.commitUpdate(recorder);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLWthcm1hLW1haW4tZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3NjaGVtYXRpY3MvYW5ndWxhci9taWdyYXRpb25zL3VwZGF0ZS0xNS91cGRhdGUta2FybWEtbWFpbi1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHSCxxR0FBdUY7QUFDdkYsMkNBQThDO0FBQzlDLHVEQUEyRDtBQUMzRCxxRUFBMEQ7QUFFMUQ7SUFDRSxPQUFPLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUNwQixLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0saUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDaEQsY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztTQUM1QjtJQUNILENBQUMsQ0FBQztBQUNKLENBQUM7QUFORCw0QkFNQztBQUVELEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxJQUFVO0lBQ3pDLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7SUFDcEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLHVCQUFhLEVBQUMsSUFBSSxDQUFDLENBQUM7SUFFNUMsMEJBQTBCO0lBQzFCLEtBQUssTUFBTSxPQUFPLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRTtRQUNqRCxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDN0MsSUFBSSxNQUFNLENBQUMsT0FBTyxLQUFLLDJCQUFRLENBQUMsS0FBSyxFQUFFO2dCQUNyQyxTQUFTO2FBQ1Y7WUFFRCxLQUFLLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLElBQUEsNEJBQWdCLEVBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2xELElBQUksT0FBTyxPQUFP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QUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUM1RjtZQUNBLGlDQUFpQztZQUNqQyxxQ0FBcUM7WUFDckMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7U0FDM0Q7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBSdWxlLCBUcmVlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi4vLi4vdGhpcmRfcGFydHkvZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9saWIvdHlwZXNjcmlwdCc7XG5pbXBvcnQgeyByZWFkV29ya3NwYWNlIH0gZnJvbSAnLi4vLi4vdXRpbGl0eSc7XG5pbXBvcnQgeyBhbGxUYXJnZXRPcHRpb25zIH0gZnJvbSAnLi4vLi4vdXRpbGl0eS93b3Jrc3BhY2UnO1xuaW1wb3J0IHsgQnVpbGRlcnMgfSBmcm9tICcuLi8uLi91dGlsaXR5L3dvcmtzcGFjZS1tb2RlbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKTogUnVsZSB7XG4gIHJldHVybiBhc3luYyAoaG9zdCkgPT4ge1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiBhd2FpdCBmaW5kVGVzdE1haW5GaWxlcyhob3N0KSkge1xuICAgICAgdXBkYXRlVGVzdEZpbGUoaG9zdCwgZmlsZSk7XG4gICAgfVxuICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBmaW5kVGVzdE1haW5GaWxlcyhob3N0OiBUcmVlKTogUHJvbWlzZTxTZXQ8c3RyaW5nPj4ge1xuICBjb25zdCB0ZXN0RmlsZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgY29uc3Qgd29ya3NwYWNlID0gYXdhaXQgcmVhZFdvcmtzcGFjZShob3N0KTtcblxuICAvLyBmaW5kIGFsbCB0ZXN0LnRzIGZpbGVzLlxuICBmb3IgKGNvbnN0IHByb2plY3Qgb2Ygd29ya3NwYWNlLnByb2plY3RzLnZhbHVlcygpKSB7XG4gICAgZm9yIChjb25zdCB0YXJnZXQgb2YgcHJvamVjdC50YXJnZXRzLnZhbHVlcygpKSB7XG4gICAgICBpZiAodGFyZ2V0LmJ1aWxkZXIgIT09IEJ1aWxkZXJzLkthcm1hKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IFssIG9wdGlvbnNdIG9mIGFsbFRhcmdldE9wdGlvbnModGFyZ2V0KSkge1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMubWFpbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0ZXN0RmlsZXMuYWRkKG9wdGlvbnMubWFpbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGVzdEZpbGVzO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVUZXN0RmlsZShob3N0OiBUcmVlLCBmaWxlOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgY29udGVudCA9IGhvc3QucmVhZFRleHQoZmlsZSk7XG4gIGlmICghY29udGVudC5pbmNsdWRlcygncmVxdWlyZS5jb250ZXh0JykpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBzb3VyY2VGaWxlID0gdHMuY3JlYXRlU291cmNlRmlsZShcbiAgICBmaWxlLFxuICAgIGNvbnRlbnQucmVwbGFjZSgvXlxcdUZFRkYvLCAnJyksXG4gICAgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCxcbiAgICB0cnVlLFxuICApO1xuXG4gIGNvbnN0IHVzZWRWYXJpYWJsZU5hbWVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIGNvbnN0IHJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShzb3VyY2VGaWxlLmZpbGVOYW1lKTtcblxuICB0cy5mb3JFYWNoQ2hpbGQoc291cmNlRmlsZSwgKG5vZGUpID0+IHtcbiAgICBpZiAodHMuaXNWYXJpYWJsZVN0YXRlbWVudChub2RlKSkge1xuICAgICAgY29uc3QgdmFyaWFibGVEZWNsYXJhdGlvbiA9IG5vZGUuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1swXTtcblxuICAgICAgaWYgKHRzLmdldE1vZGlmaWVycyhub2RlKT8uc29tZSgobSkgPT4gbS5raW5kID09PSB0cy5TeW50YXhLaW5kLkRlY2xhcmVLZXl3b3JkKSkge1xuICAgICAgICAvLyBgZGVjbGFyZSBjb25zdCByZXF1aXJlYFxuICAgICAgICBpZiAodmFyaWFibGVEZWNsYXJhdGlvbi5uYW1lLmdldFRleHQoKSAhPT0gJ3JlcXVpcmUnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBgY29uc3QgY29udGV4dCA9IHJlcXVpcmUuY29udGV4dCgnLi8nLCB0cnVlLCAvXFwuc3BlY1xcLnRzJC8pO2BcbiAgICAgICAgaWYgKCF2YXJpYWJsZURlY2xhcmF0aW9uLmluaXRpYWxpemVyPy5nZXRUZXh0KCkuc3RhcnRzV2l0aCgncmVxdWlyZS5jb250ZXh0JykpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgdmFyaWFibGUgbmFtZSBhcyB1c2VkLlxuICAgICAgICB1c2VkVmFyaWFibGVOYW1lcy5hZGQodmFyaWFibGVEZWNsYXJhdGlvbi5uYW1lLmdldFRleHQoKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIERlbGV0ZSBub2RlLlxuICAgICAgcmVjb3JkZXIucmVtb3ZlKG5vZGUuZ2V0RnVsbFN0YXJ0KCksIG5vZGUuZ2V0RnVsbFdpZHRoKCkpO1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHVzZWRWYXJpYWJsZU5hbWVzLnNpemUgJiZcbiAgICAgIHRzLmlzRXhwcmVzc2lvblN0YXRlbWVudChub2RlKSAmJiAvLyBjb250ZXh0LmtleXMoKS5tYXAoY29udGV4dCk7XG4gICAgICB0cy5pc0NhbGxFeHByZXNzaW9uKG5vZGUuZXhwcmVzc2lvbikgJiYgLy8gY29udGV4dC5rZXlzKCkubWFwKGNvbnRleHQpO1xuICAgICAgdHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24obm9kZS5leHByZXNzaW9uLmV4cHJlc3Npb24pICYmIC8vIGNvbnRleHQua2V5cygpLm1hcFxuICAgICAgdHMuaXNDYWxsRXhwcmVzc2lvbihub2RlLmV4cHJlc3Npb24uZXhwcmVzc2lvbi5leHByZXNzaW9uKSAmJiAvLyBjb250ZXh0LmtleXMoKVxuICAgICAgdHMuaXNQcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24obm9kZS5leHByZXNzaW9uLmV4cHJlc3Npb24uZXhwcmVzc2lvbi5leHByZXNzaW9uKSAmJiAvLyBjb250ZXh0LmtleXNcbiAgICAgIHRzLmlzSWRlbnRpZmllcihub2RlLmV4cHJlc3Npb24uZXhwcmVzc2lvbi5leHByZXNzaW9uLmV4cHJlc3Npb24uZXhwcmVzc2lvbikgJiYgLy8gY29udGV4dFxuICAgICAgdXNlZFZhcmlhYmxlTmFtZXMuaGFzKG5vZGUuZXhwcmVzc2lvbi5leHByZXNzaW9uLmV4cHJlc3Npb24uZXhwcmVzc2lvbi5leHByZXNzaW9uLmdldFRleHQoKSlcbiAgICApIHtcbiAgICAgIC8vIGBjb250ZXh0LmtleXMoKS5tYXAoY29udGV4dCk7YFxuICAgICAgLy8gYGNvbnRleHQua2V5cygpLmZvckVhY2goY29udGV4dCk7YFxuICAgICAgcmVjb3JkZXIucmVtb3ZlKG5vZGUuZ2V0RnVsbFN0YXJ0KCksIG5vZGUuZ2V0RnVsbFdpZHRoKCkpO1xuICAgIH1cbiAgfSk7XG5cbiAgaG9zdC5jb21taXRVcGRhdGUocmVjb3JkZXIpO1xufVxuIl19