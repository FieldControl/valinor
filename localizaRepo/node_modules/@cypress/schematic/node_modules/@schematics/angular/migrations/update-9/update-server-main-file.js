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
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.updateServerMainFile = void 0;
const ts = __importStar(require("../../third_party/github.com/Microsoft/TypeScript/lib/typescript"));
const ast_utils_1 = require("../../utility/ast-utils");
const workspace_1 = require("../../utility/workspace");
const workspace_models_1 = require("../../utility/workspace-models");
/**
 * Update the `main.server.ts` file by adding exports to `renderModule` and `renderModuleFactory` which are
 * now required for Universal and App-Shell for Ivy and `bundleDependencies`.
 */
function updateServerMainFile() {
    return async (tree) => {
        var _a;
        const workspace = await workspace_1.getWorkspace(tree);
        for (const [targetName, target] of workspace_1.allWorkspaceTargets(workspace)) {
            if (targetName !== 'server' || target.builder !== workspace_models_1.Builders.Server) {
                continue;
            }
            // find the main server file
            const mainFilePath = (_a = target.options) === null || _a === void 0 ? void 0 : _a.main;
            if (!mainFilePath || typeof mainFilePath !== 'string') {
                continue;
            }
            const content = tree.read(mainFilePath);
            if (!content) {
                continue;
            }
            const source = ts.createSourceFile(mainFilePath, content.toString().replace(/^\uFEFF/, ''), ts.ScriptTarget.Latest, true);
            // find exports in main server file
            const exportDeclarations = ast_utils_1.findNodes(source, ts.SyntaxKind.ExportDeclaration);
            const platformServerExports = exportDeclarations.filter(({ moduleSpecifier }) => moduleSpecifier &&
                ts.isStringLiteral(moduleSpecifier) &&
                moduleSpecifier.text === '@angular/platform-server');
            let hasRenderModule = false;
            let hasRenderModuleFactory = false;
            // find exports of renderModule or renderModuleFactory
            for (const { exportClause } of platformServerExports) {
                if (exportClause && ts.isNamedExports(exportClause)) {
                    if (!hasRenderModuleFactory) {
                        hasRenderModuleFactory = exportClause.elements.some(({ name }) => name.text === 'renderModuleFactory');
                    }
                    if (!hasRenderModule) {
                        hasRenderModule = exportClause.elements.some(({ name }) => name.text === 'renderModule');
                    }
                }
            }
            if (hasRenderModule && hasRenderModuleFactory) {
                // We have both required exports
                continue;
            }
            let exportSpecifiers = [];
            let updateExisting = false;
            // Add missing exports
            if (platformServerExports.length) {
                const { exportClause } = platformServerExports[0];
                if (!exportClause || ts.isNamespaceExport(exportClause)) {
                    continue;
                }
                exportSpecifiers = [...exportClause.elements];
                updateExisting = true;
            }
            if (!hasRenderModule) {
                exportSpecifiers.push(ts.createExportSpecifier(undefined, ts.createIdentifier('renderModule')));
            }
            if (!hasRenderModuleFactory) {
                exportSpecifiers.push(ts.createExportSpecifier(undefined, ts.createIdentifier('renderModuleFactory')));
            }
            // Create a TS printer to get the text of the export node
            const printer = ts.createPrinter();
            const moduleSpecifier = ts.createStringLiteral('@angular/platform-server');
            // TypeScript will emit the Node with double quotes.
            // In schematics we usually write code with a single quotes
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            moduleSpecifier.singleQuote = true;
            const newExportDeclarationText = printer.printNode(ts.EmitHint.Unspecified, ts.createExportDeclaration(undefined, undefined, ts.createNamedExports(exportSpecifiers), moduleSpecifier), source);
            const recorder = tree.beginUpdate(mainFilePath);
            if (updateExisting) {
                const start = platformServerExports[0].getStart();
                const width = platformServerExports[0].getWidth();
                recorder.remove(start, width).insertLeft(start, newExportDeclarationText);
            }
            else {
                recorder.insertLeft(source.getWidth(), '\n' + newExportDeclarationText);
            }
            tree.commitUpdate(recorder);
        }
    };
}
exports.updateServerMainFile = updateServerMainFile;
