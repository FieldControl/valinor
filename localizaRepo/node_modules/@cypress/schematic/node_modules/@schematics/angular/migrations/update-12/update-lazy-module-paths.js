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
const ts = __importStar(require("../../third_party/github.com/Microsoft/TypeScript/lib/typescript"));
function* visit(directory) {
    for (const path of directory.subfiles) {
        if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
            const entry = directory.file(path);
            if (entry) {
                const content = entry.content;
                if (content.includes('loadChildren')) {
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
            ts.forEachChild(sourceFile, function analyze(node) {
                if (ts.isPropertyAssignment(node) &&
                    (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) &&
                    node.name.text === 'loadChildren' &&
                    ts.isStringLiteral(node.initializer)) {
                    const valueNode = node.initializer;
                    const parts = valueNode.text.split('#');
                    const path = parts[0];
                    const moduleName = parts[1] || 'default';
                    const fix = `() => import('${path}').then(m => m.${moduleName})`;
                    if (!recorder) {
                        recorder = tree.beginUpdate(sourceFile.fileName);
                    }
                    const index = valueNode.getStart();
                    const length = valueNode.getWidth();
                    recorder.remove(index, length).insertLeft(index, fix);
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
