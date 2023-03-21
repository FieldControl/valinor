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
exports.getAppModulePath = exports.findBootstrapModulePath = exports.findBootstrapModuleCall = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const path_1 = require("path");
const ts = __importStar(require("../third_party/github.com/Microsoft/TypeScript/lib/typescript"));
const ast_utils_1 = require("../utility/ast-utils");
function findBootstrapModuleCall(host, mainPath) {
    const mainText = host.readText(mainPath);
    const source = ts.createSourceFile(mainPath, mainText, ts.ScriptTarget.Latest, true);
    const allNodes = (0, ast_utils_1.getSourceNodes)(source);
    let bootstrapCall = null;
    for (const node of allNodes) {
        let bootstrapCallNode = null;
        bootstrapCallNode = (0, ast_utils_1.findNode)(node, ts.SyntaxKind.Identifier, 'bootstrapModule');
        // Walk up the parent until CallExpression is found.
        while (bootstrapCallNode &&
            bootstrapCallNode.parent &&
            bootstrapCallNode.parent.kind !== ts.SyntaxKind.CallExpression) {
            bootstrapCallNode = bootstrapCallNode.parent;
        }
        if (bootstrapCallNode !== null &&
            bootstrapCallNode.parent !== undefined &&
            bootstrapCallNode.parent.kind === ts.SyntaxKind.CallExpression) {
            bootstrapCall = bootstrapCallNode.parent;
            break;
        }
    }
    return bootstrapCall;
}
exports.findBootstrapModuleCall = findBootstrapModuleCall;
function findBootstrapModulePath(host, mainPath) {
    const bootstrapCall = findBootstrapModuleCall(host, mainPath);
    if (!bootstrapCall) {
        throw new schematics_1.SchematicsException('Bootstrap call not found');
    }
    const bootstrapModule = bootstrapCall.arguments[0];
    const mainText = host.readText(mainPath);
    const source = ts.createSourceFile(mainPath, mainText, ts.ScriptTarget.Latest, true);
    const allNodes = (0, ast_utils_1.getSourceNodes)(source);
    const bootstrapModuleRelativePath = allNodes
        .filter(ts.isImportDeclaration)
        .filter((imp) => {
        return (0, ast_utils_1.findNode)(imp, ts.SyntaxKind.Identifier, bootstrapModule.getText());
    })
        .map((imp) => {
        const modulePathStringLiteral = imp.moduleSpecifier;
        return modulePathStringLiteral.text;
    })[0];
    return bootstrapModuleRelativePath;
}
exports.findBootstrapModulePath = findBootstrapModulePath;
function getAppModulePath(host, mainPath) {
    const moduleRelativePath = findBootstrapModulePath(host, mainPath);
    const mainDir = (0, path_1.dirname)(mainPath);
    const modulePath = (0, core_1.normalize)(`/${mainDir}/${moduleRelativePath}.ts`);
    return modulePath;
}
exports.getAppModulePath = getAppModulePath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctYXN0LXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvbmctYXN0LXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUgsK0NBQWlEO0FBQ2pELDJEQUF1RTtBQUN2RSwrQkFBK0I7QUFDL0Isa0dBQW9GO0FBQ3BGLG9EQUFnRTtBQUVoRSxTQUFnQix1QkFBdUIsQ0FBQyxJQUFVLEVBQUUsUUFBZ0I7SUFDbEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6QyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVyRixNQUFNLFFBQVEsR0FBRyxJQUFBLDBCQUFjLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFFeEMsSUFBSSxhQUFhLEdBQTZCLElBQUksQ0FBQztJQUVuRCxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsRUFBRTtRQUMzQixJQUFJLGlCQUFpQixHQUFtQixJQUFJLENBQUM7UUFDN0MsaUJBQWlCLEdBQUcsSUFBQSxvQkFBUSxFQUFDLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRWhGLG9EQUFvRDtRQUNwRCxPQUNFLGlCQUFpQjtZQUNqQixpQkFBaUIsQ0FBQyxNQUFNO1lBQ3hCLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQzlEO1lBQ0EsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDO1NBQzlDO1FBRUQsSUFDRSxpQkFBaUIsS0FBSyxJQUFJO1lBQzFCLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxTQUFTO1lBQ3RDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQzlEO1lBQ0EsYUFBYSxHQUFHLGlCQUFpQixDQUFDLE1BQTJCLENBQUM7WUFDOUQsTUFBTTtTQUNQO0tBQ0Y7SUFFRCxPQUFPLGFBQWEsQ0FBQztBQUN2QixDQUFDO0FBaENELDBEQWdDQztBQUVELFNBQWdCLHVCQUF1QixDQUFDLElBQVUsRUFBRSxRQUFnQjtJQUNsRSxNQUFNLGFBQWEsR0FBRyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDOUQsSUFBSSxDQUFDLGFBQWEsRUFBRTtRQUNsQixNQUFNLElBQUksZ0NBQW1CLENBQUMsMEJBQTBCLENBQUMsQ0FBQztLQUMzRDtJQUVELE1BQU0sZUFBZSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFbkQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6QyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyRixNQUFNLFFBQVEsR0FBRyxJQUFBLDBCQUFjLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEMsTUFBTSwyQkFBMkIsR0FBRyxRQUFRO1NBQ3pDLE1BQU0sQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUM7U0FDOUIsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDZCxPQUFPLElBQUEsb0JBQVEsRUFBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDNUUsQ0FBQyxDQUFDO1NBQ0QsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDWCxNQUFNLHVCQUF1QixHQUFHLEdBQUcsQ0FBQyxlQUFtQyxDQUFDO1FBRXhFLE9BQU8sdUJBQXVCLENBQUMsSUFBSSxDQUFDO0lBQ3RDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRVIsT0FBTywyQkFBMkIsQ0FBQztBQUNyQyxDQUFDO0FBdkJELDBEQXVCQztBQUVELFNBQWdCLGdCQUFnQixDQUFDLElBQVUsRUFBRSxRQUFnQjtJQUMzRCxNQUFNLGtCQUFrQixHQUFHLHVCQUF1QixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuRSxNQUFNLE9BQU8sR0FBRyxJQUFBLGNBQU8sRUFBQyxRQUFRLENBQUMsQ0FBQztJQUNsQyxNQUFNLFVBQVUsR0FBRyxJQUFBLGdCQUFTLEVBQUMsSUFBSSxPQUFPLElBQUksa0JBQWtCLEtBQUssQ0FBQyxDQUFDO0lBRXJFLE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUM7QUFORCw0Q0FNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgeyBub3JtYWxpemUgfSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyBTY2hlbWF0aWNzRXhjZXB0aW9uLCBUcmVlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAnLi4vdGhpcmRfcGFydHkvZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9saWIvdHlwZXNjcmlwdCc7XG5pbXBvcnQgeyBmaW5kTm9kZSwgZ2V0U291cmNlTm9kZXMgfSBmcm9tICcuLi91dGlsaXR5L2FzdC11dGlscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQm9vdHN0cmFwTW9kdWxlQ2FsbChob3N0OiBUcmVlLCBtYWluUGF0aDogc3RyaW5nKTogdHMuQ2FsbEV4cHJlc3Npb24gfCBudWxsIHtcbiAgY29uc3QgbWFpblRleHQgPSBob3N0LnJlYWRUZXh0KG1haW5QYXRoKTtcbiAgY29uc3Qgc291cmNlID0gdHMuY3JlYXRlU291cmNlRmlsZShtYWluUGF0aCwgbWFpblRleHQsIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsIHRydWUpO1xuXG4gIGNvbnN0IGFsbE5vZGVzID0gZ2V0U291cmNlTm9kZXMoc291cmNlKTtcblxuICBsZXQgYm9vdHN0cmFwQ2FsbDogdHMuQ2FsbEV4cHJlc3Npb24gfCBudWxsID0gbnVsbDtcblxuICBmb3IgKGNvbnN0IG5vZGUgb2YgYWxsTm9kZXMpIHtcbiAgICBsZXQgYm9vdHN0cmFwQ2FsbE5vZGU6IHRzLk5vZGUgfCBudWxsID0gbnVsbDtcbiAgICBib290c3RyYXBDYWxsTm9kZSA9IGZpbmROb2RlKG5vZGUsIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllciwgJ2Jvb3RzdHJhcE1vZHVsZScpO1xuXG4gICAgLy8gV2FsayB1cCB0aGUgcGFyZW50IHVudGlsIENhbGxFeHByZXNzaW9uIGlzIGZvdW5kLlxuICAgIHdoaWxlIChcbiAgICAgIGJvb3RzdHJhcENhbGxOb2RlICYmXG4gICAgICBib290c3RyYXBDYWxsTm9kZS5wYXJlbnQgJiZcbiAgICAgIGJvb3RzdHJhcENhbGxOb2RlLnBhcmVudC5raW5kICE9PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uXG4gICAgKSB7XG4gICAgICBib290c3RyYXBDYWxsTm9kZSA9IGJvb3RzdHJhcENhbGxOb2RlLnBhcmVudDtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBib290c3RyYXBDYWxsTm9kZSAhPT0gbnVsbCAmJlxuICAgICAgYm9vdHN0cmFwQ2FsbE5vZGUucGFyZW50ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIGJvb3RzdHJhcENhbGxOb2RlLnBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uXG4gICAgKSB7XG4gICAgICBib290c3RyYXBDYWxsID0gYm9vdHN0cmFwQ2FsbE5vZGUucGFyZW50IGFzIHRzLkNhbGxFeHByZXNzaW9uO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJvb3RzdHJhcENhbGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQm9vdHN0cmFwTW9kdWxlUGF0aChob3N0OiBUcmVlLCBtYWluUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgYm9vdHN0cmFwQ2FsbCA9IGZpbmRCb290c3RyYXBNb2R1bGVDYWxsKGhvc3QsIG1haW5QYXRoKTtcbiAgaWYgKCFib290c3RyYXBDYWxsKSB7XG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ0Jvb3RzdHJhcCBjYWxsIG5vdCBmb3VuZCcpO1xuICB9XG5cbiAgY29uc3QgYm9vdHN0cmFwTW9kdWxlID0gYm9vdHN0cmFwQ2FsbC5hcmd1bWVudHNbMF07XG5cbiAgY29uc3QgbWFpblRleHQgPSBob3N0LnJlYWRUZXh0KG1haW5QYXRoKTtcbiAgY29uc3Qgc291cmNlID0gdHMuY3JlYXRlU291cmNlRmlsZShtYWluUGF0aCwgbWFpblRleHQsIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsIHRydWUpO1xuICBjb25zdCBhbGxOb2RlcyA9IGdldFNvdXJjZU5vZGVzKHNvdXJjZSk7XG4gIGNvbnN0IGJvb3RzdHJhcE1vZHVsZVJlbGF0aXZlUGF0aCA9IGFsbE5vZGVzXG4gICAgLmZpbHRlcih0cy5pc0ltcG9ydERlY2xhcmF0aW9uKVxuICAgIC5maWx0ZXIoKGltcCkgPT4ge1xuICAgICAgcmV0dXJuIGZpbmROb2RlKGltcCwgdHMuU3ludGF4S2luZC5JZGVudGlmaWVyLCBib290c3RyYXBNb2R1bGUuZ2V0VGV4dCgpKTtcbiAgICB9KVxuICAgIC5tYXAoKGltcCkgPT4ge1xuICAgICAgY29uc3QgbW9kdWxlUGF0aFN0cmluZ0xpdGVyYWwgPSBpbXAubW9kdWxlU3BlY2lmaWVyIGFzIHRzLlN0cmluZ0xpdGVyYWw7XG5cbiAgICAgIHJldHVybiBtb2R1bGVQYXRoU3RyaW5nTGl0ZXJhbC50ZXh0O1xuICAgIH0pWzBdO1xuXG4gIHJldHVybiBib290c3RyYXBNb2R1bGVSZWxhdGl2ZVBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcHBNb2R1bGVQYXRoKGhvc3Q6IFRyZWUsIG1haW5QYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtb2R1bGVSZWxhdGl2ZVBhdGggPSBmaW5kQm9vdHN0cmFwTW9kdWxlUGF0aChob3N0LCBtYWluUGF0aCk7XG4gIGNvbnN0IG1haW5EaXIgPSBkaXJuYW1lKG1haW5QYXRoKTtcbiAgY29uc3QgbW9kdWxlUGF0aCA9IG5vcm1hbGl6ZShgLyR7bWFpbkRpcn0vJHttb2R1bGVSZWxhdGl2ZVBhdGh9LnRzYCk7XG5cbiAgcmV0dXJuIG1vZHVsZVBhdGg7XG59XG4iXX0=