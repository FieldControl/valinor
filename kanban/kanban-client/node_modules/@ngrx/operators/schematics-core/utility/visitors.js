"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitDecorator = exports.visitNgModules = exports.visitComponents = exports.visitNgModuleExports = exports.visitNgModuleImports = exports.visitTemplates = exports.visitTSSourceFiles = void 0;
var ts = require("typescript");
var core_1 = require("@angular-devkit/core");
function visitTSSourceFiles(tree, visitor) {
    var e_1, _a;
    var result = undefined;
    try {
        for (var _b = __values(visit(tree.root)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var sourceFile = _c.value;
            result = visitor(sourceFile, tree, result);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return result;
}
exports.visitTSSourceFiles = visitTSSourceFiles;
function visitTemplates(tree, visitor) {
    visitTSSourceFiles(tree, function (source) {
        visitComponents(source, function (_, decoratorExpressionNode) {
            ts.forEachChild(decoratorExpressionNode, function findTemplates(n) {
                if (ts.isPropertyAssignment(n) && ts.isIdentifier(n.name)) {
                    if (n.name.text === 'template' &&
                        ts.isStringLiteralLike(n.initializer)) {
                        // Need to add an offset of one to the start because the template quotes are
                        // not part of the template content.
                        var templateStartIdx = n.initializer.getStart() + 1;
                        visitor({
                            fileName: source.fileName,
                            content: n.initializer.text,
                            inline: true,
                            start: templateStartIdx,
                        }, tree);
                        return;
                    }
                    else if (n.name.text === 'templateUrl' &&
                        ts.isStringLiteralLike(n.initializer)) {
                        var parts = (0, core_1.normalize)(source.fileName).split('/').slice(0, -1);
                        var templatePath = (0, core_1.resolve)((0, core_1.normalize)(parts.join('/')), (0, core_1.normalize)(n.initializer.text));
                        if (!tree.exists(templatePath)) {
                            return;
                        }
                        var fileContent = tree.read(templatePath);
                        if (!fileContent) {
                            return;
                        }
                        visitor({
                            fileName: templatePath,
                            content: fileContent.toString(),
                            inline: false,
                            start: 0,
                        }, tree);
                        return;
                    }
                }
                ts.forEachChild(n, findTemplates);
            });
        });
    });
}
exports.visitTemplates = visitTemplates;
function visitNgModuleImports(sourceFile, callback) {
    visitNgModuleProperty(sourceFile, callback, 'imports');
}
exports.visitNgModuleImports = visitNgModuleImports;
function visitNgModuleExports(sourceFile, callback) {
    visitNgModuleProperty(sourceFile, callback, 'exports');
}
exports.visitNgModuleExports = visitNgModuleExports;
function visitNgModuleProperty(sourceFile, callback, property) {
    visitNgModules(sourceFile, function (_, decoratorExpressionNode) {
        ts.forEachChild(decoratorExpressionNode, function findTemplates(n) {
            if (ts.isPropertyAssignment(n) &&
                ts.isIdentifier(n.name) &&
                n.name.text === property &&
                ts.isArrayLiteralExpression(n.initializer)) {
                callback(n, n.initializer.elements);
                return;
            }
            ts.forEachChild(n, findTemplates);
        });
    });
}
function visitComponents(sourceFile, callback) {
    visitDecorator(sourceFile, 'Component', callback);
}
exports.visitComponents = visitComponents;
function visitNgModules(sourceFile, callback) {
    visitDecorator(sourceFile, 'NgModule', callback);
}
exports.visitNgModules = visitNgModules;
function visitDecorator(sourceFile, decoratorName, callback) {
    ts.forEachChild(sourceFile, function findClassDeclaration(node) {
        if (!ts.isClassDeclaration(node)) {
            ts.forEachChild(node, findClassDeclaration);
        }
        var classDeclarationNode = node;
        var decorators = ts.getDecorators(classDeclarationNode);
        if (!decorators || !decorators.length) {
            return;
        }
        var componentDecorator = decorators.find(function (d) {
            return (ts.isCallExpression(d.expression) &&
                ts.isIdentifier(d.expression.expression) &&
                d.expression.expression.text === decoratorName);
        });
        if (!componentDecorator) {
            return;
        }
        var expression = componentDecorator.expression;
        if (!ts.isCallExpression(expression)) {
            return;
        }
        var _a = __read(expression.arguments, 1), arg = _a[0];
        if (!arg || !ts.isObjectLiteralExpression(arg)) {
            return;
        }
        callback(classDeclarationNode, arg);
    });
}
exports.visitDecorator = visitDecorator;
function visit(directory) {
    var _a, _b, path, entry, content, source, e_2_1, _c, _d, path, e_3_1;
    var e_2, _e, e_3, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 5, 6, 7]);
                _a = __values(directory.subfiles), _b = _a.next();
                _g.label = 1;
            case 1:
                if (!!_b.done) return [3 /*break*/, 4];
                path = _b.value;
                if (!(path.endsWith('.ts') && !path.endsWith('.d.ts'))) return [3 /*break*/, 3];
                entry = directory.file(path);
                if (!entry) return [3 /*break*/, 3];
                content = entry.content;
                source = ts.createSourceFile(entry.path, content.toString().replace(/^\uFEFF/, ''), ts.ScriptTarget.Latest, true);
                return [4 /*yield*/, source];
            case 2:
                _g.sent();
                _g.label = 3;
            case 3:
                _b = _a.next();
                return [3 /*break*/, 1];
            case 4: return [3 /*break*/, 7];
            case 5:
                e_2_1 = _g.sent();
                e_2 = { error: e_2_1 };
                return [3 /*break*/, 7];
            case 6:
                try {
                    if (_b && !_b.done && (_e = _a.return)) _e.call(_a);
                }
                finally { if (e_2) throw e_2.error; }
                return [7 /*endfinally*/];
            case 7:
                _g.trys.push([7, 12, 13, 14]);
                _c = __values(directory.subdirs), _d = _c.next();
                _g.label = 8;
            case 8:
                if (!!_d.done) return [3 /*break*/, 11];
                path = _d.value;
                if (path === 'node_modules') {
                    return [3 /*break*/, 10];
                }
                return [5 /*yield**/, __values(visit(directory.dir(path)))];
            case 9:
                _g.sent();
                _g.label = 10;
            case 10:
                _d = _c.next();
                return [3 /*break*/, 8];
            case 11: return [3 /*break*/, 14];
            case 12:
                e_3_1 = _g.sent();
                e_3 = { error: e_3_1 };
                return [3 /*break*/, 14];
            case 13:
                try {
                    if (_d && !_d.done && (_f = _c.return)) _f.call(_c);
                }
                finally { if (e_3) throw e_3.error; }
                return [7 /*endfinally*/];
            case 14: return [2 /*return*/];
        }
    });
}
//# sourceMappingURL=visitors.js.map