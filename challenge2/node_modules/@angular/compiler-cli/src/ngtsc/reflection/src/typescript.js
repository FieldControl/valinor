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
        define("@angular/compiler-cli/src/ngtsc/reflection/src/typescript", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/reflection/src/host", "@angular/compiler-cli/src/ngtsc/reflection/src/type_to_value", "@angular/compiler-cli/src/ngtsc/reflection/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reflectObjectLiteral = exports.findMember = exports.filterToMembersWithDecorator = exports.reflectTypeEntityToDeclaration = exports.reflectIdentifierOfDeclaration = exports.reflectNameOfDeclaration = exports.TypeScriptReflectionHost = void 0;
    var ts = require("typescript");
    var host_1 = require("@angular/compiler-cli/src/ngtsc/reflection/src/host");
    var type_to_value_1 = require("@angular/compiler-cli/src/ngtsc/reflection/src/type_to_value");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/reflection/src/util");
    /**
     * reflector.ts implements static reflection of declarations using the TypeScript `ts.TypeChecker`.
     */
    var TypeScriptReflectionHost = /** @class */ (function () {
        function TypeScriptReflectionHost(checker) {
            this.checker = checker;
        }
        TypeScriptReflectionHost.prototype.getDecoratorsOfDeclaration = function (declaration) {
            var _this = this;
            if (declaration.decorators === undefined || declaration.decorators.length === 0) {
                return null;
            }
            return declaration.decorators.map(function (decorator) { return _this._reflectDecorator(decorator); })
                .filter(function (dec) { return dec !== null; });
        };
        TypeScriptReflectionHost.prototype.getMembersOfClass = function (clazz) {
            var _this = this;
            var tsClazz = castDeclarationToClassOrDie(clazz);
            return tsClazz.members.map(function (member) { return _this._reflectMember(member); })
                .filter(function (member) { return member !== null; });
        };
        TypeScriptReflectionHost.prototype.getConstructorParameters = function (clazz) {
            var _this = this;
            var tsClazz = castDeclarationToClassOrDie(clazz);
            var isDeclaration = tsClazz.getSourceFile().isDeclarationFile;
            // For non-declaration files, we want to find the constructor with a `body`. The constructors
            // without a `body` are overloads whereas we want the implementation since it's the one that'll
            // be executed and which can have decorators. For declaration files, we take the first one that
            // we get.
            var ctor = tsClazz.members.find(function (member) {
                return ts.isConstructorDeclaration(member) && (isDeclaration || member.body !== undefined);
            });
            if (ctor === undefined) {
                return null;
            }
            return ctor.parameters.map(function (node) {
                // The name of the parameter is easy.
                var name = parameterName(node.name);
                var decorators = _this.getDecoratorsOfDeclaration(node);
                // It may or may not be possible to write an expression that refers to the value side of the
                // type named for the parameter.
                var originalTypeNode = node.type || null;
                var typeNode = originalTypeNode;
                // Check if we are dealing with a simple nullable union type e.g. `foo: Foo|null`
                // and extract the type. More complex union types e.g. `foo: Foo|Bar` are not supported.
                // We also don't need to support `foo: Foo|undefined` because Angular's DI injects `null` for
                // optional tokes that don't have providers.
                if (typeNode && ts.isUnionTypeNode(typeNode)) {
                    var childTypeNodes = typeNode.types.filter(function (childTypeNode) {
                        return !(ts.isLiteralTypeNode(childTypeNode) &&
                            childTypeNode.literal.kind === ts.SyntaxKind.NullKeyword);
                    });
                    if (childTypeNodes.length === 1) {
                        typeNode = childTypeNodes[0];
                    }
                }
                var typeValueReference = type_to_value_1.typeToValue(typeNode, _this.checker);
                return {
                    name: name,
                    nameNode: node.name,
                    typeValueReference: typeValueReference,
                    typeNode: originalTypeNode,
                    decorators: decorators,
                };
            });
        };
        TypeScriptReflectionHost.prototype.getImportOfIdentifier = function (id) {
            var directImport = this.getDirectImportOfIdentifier(id);
            if (directImport !== null) {
                return directImport;
            }
            else if (ts.isQualifiedName(id.parent) && id.parent.right === id) {
                return this.getImportOfNamespacedIdentifier(id, getQualifiedNameRoot(id.parent));
            }
            else if (ts.isPropertyAccessExpression(id.parent) && id.parent.name === id) {
                return this.getImportOfNamespacedIdentifier(id, getFarLeftIdentifier(id.parent));
            }
            else {
                return null;
            }
        };
        TypeScriptReflectionHost.prototype.getExportsOfModule = function (node) {
            var _this = this;
            // In TypeScript code, modules are only ts.SourceFiles. Throw if the node isn't a module.
            if (!ts.isSourceFile(node)) {
                throw new Error("getExportsOfModule() called on non-SourceFile in TS code");
            }
            // Reflect the module to a Symbol, and use getExportsOfModule() to get a list of exported
            // Symbols.
            var symbol = this.checker.getSymbolAtLocation(node);
            if (symbol === undefined) {
                return null;
            }
            var map = new Map();
            this.checker.getExportsOfModule(symbol).forEach(function (exportSymbol) {
                // Map each exported Symbol to a Declaration and add it to the map.
                var decl = _this.getDeclarationOfSymbol(exportSymbol, null);
                if (decl !== null) {
                    map.set(exportSymbol.name, decl);
                }
            });
            return map;
        };
        TypeScriptReflectionHost.prototype.isClass = function (node) {
            // For our purposes, classes are "named" ts.ClassDeclarations;
            // (`node.name` can be undefined in unnamed default exports: `default export class { ... }`).
            return util_1.isNamedClassDeclaration(node);
        };
        TypeScriptReflectionHost.prototype.hasBaseClass = function (clazz) {
            return this.getBaseClassExpression(clazz) !== null;
        };
        TypeScriptReflectionHost.prototype.getBaseClassExpression = function (clazz) {
            if (!(ts.isClassDeclaration(clazz) || ts.isClassExpression(clazz)) ||
                clazz.heritageClauses === undefined) {
                return null;
            }
            var extendsClause = clazz.heritageClauses.find(function (clause) { return clause.token === ts.SyntaxKind.ExtendsKeyword; });
            if (extendsClause === undefined) {
                return null;
            }
            var extendsType = extendsClause.types[0];
            if (extendsType === undefined) {
                return null;
            }
            return extendsType.expression;
        };
        TypeScriptReflectionHost.prototype.getDeclarationOfIdentifier = function (id) {
            // Resolve the identifier to a Symbol, and return the declaration of that.
            var symbol = this.checker.getSymbolAtLocation(id);
            if (symbol === undefined) {
                return null;
            }
            return this.getDeclarationOfSymbol(symbol, id);
        };
        TypeScriptReflectionHost.prototype.getDefinitionOfFunction = function (node) {
            if (!ts.isFunctionDeclaration(node) && !ts.isMethodDeclaration(node) &&
                !ts.isFunctionExpression(node)) {
                return null;
            }
            return {
                node: node,
                body: node.body !== undefined ? Array.from(node.body.statements) : null,
                parameters: node.parameters.map(function (param) {
                    var name = parameterName(param.name);
                    var initializer = param.initializer || null;
                    return { name: name, node: param, initializer: initializer };
                }),
            };
        };
        TypeScriptReflectionHost.prototype.getGenericArityOfClass = function (clazz) {
            if (!ts.isClassDeclaration(clazz)) {
                return null;
            }
            return clazz.typeParameters !== undefined ? clazz.typeParameters.length : 0;
        };
        TypeScriptReflectionHost.prototype.getVariableValue = function (declaration) {
            return declaration.initializer || null;
        };
        TypeScriptReflectionHost.prototype.getDtsDeclaration = function (_) {
            return null;
        };
        TypeScriptReflectionHost.prototype.getInternalNameOfClass = function (clazz) {
            return clazz.name;
        };
        TypeScriptReflectionHost.prototype.getAdjacentNameOfClass = function (clazz) {
            return clazz.name;
        };
        TypeScriptReflectionHost.prototype.getDirectImportOfIdentifier = function (id) {
            var symbol = this.checker.getSymbolAtLocation(id);
            if (symbol === undefined || symbol.declarations === undefined ||
                symbol.declarations.length !== 1) {
                return null;
            }
            var decl = symbol.declarations[0];
            var importDecl = getContainingImportDeclaration(decl);
            // Ignore declarations that are defined locally (not imported).
            if (importDecl === null) {
                return null;
            }
            // The module specifier is guaranteed to be a string literal, so this should always pass.
            if (!ts.isStringLiteral(importDecl.moduleSpecifier)) {
                // Not allowed to happen in TypeScript ASTs.
                return null;
            }
            return { from: importDecl.moduleSpecifier.text, name: getExportedName(decl, id) };
        };
        /**
         * Try to get the import info for this identifier as though it is a namespaced import.
         *
         * For example, if the identifier is the `Directive` part of a qualified type chain like:
         *
         * ```
         * core.Directive
         * ```
         *
         * then it might be that `core` is a namespace import such as:
         *
         * ```
         * import * as core from 'tslib';
         * ```
         *
         * @param id the TypeScript identifier to find the import info for.
         * @returns The import info if this is a namespaced import or `null`.
         */
        TypeScriptReflectionHost.prototype.getImportOfNamespacedIdentifier = function (id, namespaceIdentifier) {
            if (namespaceIdentifier === null) {
                return null;
            }
            var namespaceSymbol = this.checker.getSymbolAtLocation(namespaceIdentifier);
            if (!namespaceSymbol) {
                return null;
            }
            var declaration = namespaceSymbol.declarations.length === 1 ? namespaceSymbol.declarations[0] : null;
            if (!declaration) {
                return null;
            }
            var namespaceDeclaration = ts.isNamespaceImport(declaration) ? declaration : null;
            if (!namespaceDeclaration) {
                return null;
            }
            var importDeclaration = namespaceDeclaration.parent.parent;
            if (!ts.isStringLiteral(importDeclaration.moduleSpecifier)) {
                // Should not happen as this would be invalid TypesScript
                return null;
            }
            return {
                from: importDeclaration.moduleSpecifier.text,
                name: id.text,
            };
        };
        /**
         * Resolve a `ts.Symbol` to its declaration, keeping track of the `viaModule` along the way.
         */
        TypeScriptReflectionHost.prototype.getDeclarationOfSymbol = function (symbol, originalId) {
            // If the symbol points to a ShorthandPropertyAssignment, resolve it.
            var valueDeclaration = undefined;
            if (symbol.valueDeclaration !== undefined) {
                valueDeclaration = symbol.valueDeclaration;
            }
            else if (symbol.declarations !== undefined && symbol.declarations.length > 0) {
                valueDeclaration = symbol.declarations[0];
            }
            if (valueDeclaration !== undefined && ts.isShorthandPropertyAssignment(valueDeclaration)) {
                var shorthandSymbol = this.checker.getShorthandAssignmentValueSymbol(valueDeclaration);
                if (shorthandSymbol === undefined) {
                    return null;
                }
                return this.getDeclarationOfSymbol(shorthandSymbol, originalId);
            }
            else if (valueDeclaration !== undefined && ts.isExportSpecifier(valueDeclaration)) {
                var targetSymbol = this.checker.getExportSpecifierLocalTargetSymbol(valueDeclaration);
                if (targetSymbol === undefined) {
                    return null;
                }
                return this.getDeclarationOfSymbol(targetSymbol, originalId);
            }
            var importInfo = originalId && this.getImportOfIdentifier(originalId);
            var viaModule = importInfo !== null && importInfo.from !== null && !importInfo.from.startsWith('.') ?
                importInfo.from :
                null;
            // Now, resolve the Symbol to its declaration by following any and all aliases.
            while (symbol.flags & ts.SymbolFlags.Alias) {
                symbol = this.checker.getAliasedSymbol(symbol);
            }
            // Look at the resolved Symbol's declarations and pick one of them to return. Value declarations
            // are given precedence over type declarations.
            if (symbol.valueDeclaration !== undefined) {
                return {
                    node: symbol.valueDeclaration,
                    known: null,
                    viaModule: viaModule,
                    identity: null,
                    kind: 0 /* Concrete */,
                };
            }
            else if (symbol.declarations !== undefined && symbol.declarations.length > 0) {
                return {
                    node: symbol.declarations[0],
                    known: null,
                    viaModule: viaModule,
                    identity: null,
                    kind: 0 /* Concrete */,
                };
            }
            else {
                return null;
            }
        };
        TypeScriptReflectionHost.prototype._reflectDecorator = function (node) {
            // Attempt to resolve the decorator expression into a reference to a concrete Identifier. The
            // expression may contain a call to a function which returns the decorator function, in which
            // case we want to return the arguments.
            var decoratorExpr = node.expression;
            var args = null;
            // Check for call expressions.
            if (ts.isCallExpression(decoratorExpr)) {
                args = Array.from(decoratorExpr.arguments);
                decoratorExpr = decoratorExpr.expression;
            }
            // The final resolved decorator should be a `ts.Identifier` - if it's not, then something is
            // wrong and the decorator can't be resolved statically.
            if (!host_1.isDecoratorIdentifier(decoratorExpr)) {
                return null;
            }
            var decoratorIdentifier = ts.isIdentifier(decoratorExpr) ? decoratorExpr : decoratorExpr.name;
            var importDecl = this.getImportOfIdentifier(decoratorIdentifier);
            return {
                name: decoratorIdentifier.text,
                identifier: decoratorExpr,
                import: importDecl,
                node: node,
                args: args,
            };
        };
        TypeScriptReflectionHost.prototype._reflectMember = function (node) {
            var kind = null;
            var value = null;
            var name = null;
            var nameNode = null;
            if (ts.isPropertyDeclaration(node)) {
                kind = host_1.ClassMemberKind.Property;
                value = node.initializer || null;
            }
            else if (ts.isGetAccessorDeclaration(node)) {
                kind = host_1.ClassMemberKind.Getter;
            }
            else if (ts.isSetAccessorDeclaration(node)) {
                kind = host_1.ClassMemberKind.Setter;
            }
            else if (ts.isMethodDeclaration(node)) {
                kind = host_1.ClassMemberKind.Method;
            }
            else if (ts.isConstructorDeclaration(node)) {
                kind = host_1.ClassMemberKind.Constructor;
            }
            else {
                return null;
            }
            if (ts.isConstructorDeclaration(node)) {
                name = 'constructor';
            }
            else if (ts.isIdentifier(node.name)) {
                name = node.name.text;
                nameNode = node.name;
            }
            else if (ts.isStringLiteral(node.name)) {
                name = node.name.text;
                nameNode = node.name;
            }
            else {
                return null;
            }
            var decorators = this.getDecoratorsOfDeclaration(node);
            var isStatic = node.modifiers !== undefined &&
                node.modifiers.some(function (mod) { return mod.kind === ts.SyntaxKind.StaticKeyword; });
            return {
                node: node,
                implementation: node,
                kind: kind,
                type: node.type || null,
                name: name,
                nameNode: nameNode,
                decorators: decorators,
                value: value,
                isStatic: isStatic,
            };
        };
        return TypeScriptReflectionHost;
    }());
    exports.TypeScriptReflectionHost = TypeScriptReflectionHost;
    function reflectNameOfDeclaration(decl) {
        var id = reflectIdentifierOfDeclaration(decl);
        return id && id.text || null;
    }
    exports.reflectNameOfDeclaration = reflectNameOfDeclaration;
    function reflectIdentifierOfDeclaration(decl) {
        if (ts.isClassDeclaration(decl) || ts.isFunctionDeclaration(decl)) {
            return decl.name || null;
        }
        else if (ts.isVariableDeclaration(decl)) {
            if (ts.isIdentifier(decl.name)) {
                return decl.name;
            }
        }
        return null;
    }
    exports.reflectIdentifierOfDeclaration = reflectIdentifierOfDeclaration;
    function reflectTypeEntityToDeclaration(type, checker) {
        var realSymbol = checker.getSymbolAtLocation(type);
        if (realSymbol === undefined) {
            throw new Error("Cannot resolve type entity " + type.getText() + " to symbol");
        }
        while (realSymbol.flags & ts.SymbolFlags.Alias) {
            realSymbol = checker.getAliasedSymbol(realSymbol);
        }
        var node = null;
        if (realSymbol.valueDeclaration !== undefined) {
            node = realSymbol.valueDeclaration;
        }
        else if (realSymbol.declarations !== undefined && realSymbol.declarations.length === 1) {
            node = realSymbol.declarations[0];
        }
        else {
            throw new Error("Cannot resolve type entity symbol to declaration");
        }
        if (ts.isQualifiedName(type)) {
            if (!ts.isIdentifier(type.left)) {
                throw new Error("Cannot handle qualified name with non-identifier lhs");
            }
            var symbol = checker.getSymbolAtLocation(type.left);
            if (symbol === undefined || symbol.declarations === undefined ||
                symbol.declarations.length !== 1) {
                throw new Error("Cannot resolve qualified type entity lhs to symbol");
            }
            var decl = symbol.declarations[0];
            if (ts.isNamespaceImport(decl)) {
                var clause = decl.parent;
                var importDecl = clause.parent;
                if (!ts.isStringLiteral(importDecl.moduleSpecifier)) {
                    throw new Error("Module specifier is not a string");
                }
                return { node: node, from: importDecl.moduleSpecifier.text };
            }
            else {
                throw new Error("Unknown import type?");
            }
        }
        else {
            return { node: node, from: null };
        }
    }
    exports.reflectTypeEntityToDeclaration = reflectTypeEntityToDeclaration;
    function filterToMembersWithDecorator(members, name, module) {
        return members.filter(function (member) { return !member.isStatic; })
            .map(function (member) {
            if (member.decorators === null) {
                return null;
            }
            var decorators = member.decorators.filter(function (dec) {
                if (dec.import !== null) {
                    return dec.import.name === name && (module === undefined || dec.import.from === module);
                }
                else {
                    return dec.name === name && module === undefined;
                }
            });
            if (decorators.length === 0) {
                return null;
            }
            return { member: member, decorators: decorators };
        })
            .filter(function (value) { return value !== null; });
    }
    exports.filterToMembersWithDecorator = filterToMembersWithDecorator;
    function findMember(members, name, isStatic) {
        if (isStatic === void 0) { isStatic = false; }
        return members.find(function (member) { return member.isStatic === isStatic && member.name === name; }) || null;
    }
    exports.findMember = findMember;
    function reflectObjectLiteral(node) {
        var map = new Map();
        node.properties.forEach(function (prop) {
            if (ts.isPropertyAssignment(prop)) {
                var name_1 = propertyNameToString(prop.name);
                if (name_1 === null) {
                    return;
                }
                map.set(name_1, prop.initializer);
            }
            else if (ts.isShorthandPropertyAssignment(prop)) {
                map.set(prop.name.text, prop.name);
            }
            else {
                return;
            }
        });
        return map;
    }
    exports.reflectObjectLiteral = reflectObjectLiteral;
    function castDeclarationToClassOrDie(declaration) {
        if (!ts.isClassDeclaration(declaration)) {
            throw new Error("Reflecting on a " + ts.SyntaxKind[declaration.kind] + " instead of a ClassDeclaration.");
        }
        return declaration;
    }
    function parameterName(name) {
        if (ts.isIdentifier(name)) {
            return name.text;
        }
        else {
            return null;
        }
    }
    function propertyNameToString(node) {
        if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
            return node.text;
        }
        else {
            return null;
        }
    }
    /**
     * Compute the left most identifier in a qualified type chain. E.g. the `a` of `a.b.c.SomeType`.
     * @param qualifiedName The starting property access expression from which we want to compute
     * the left most identifier.
     * @returns the left most identifier in the chain or `null` if it is not an identifier.
     */
    function getQualifiedNameRoot(qualifiedName) {
        while (ts.isQualifiedName(qualifiedName.left)) {
            qualifiedName = qualifiedName.left;
        }
        return ts.isIdentifier(qualifiedName.left) ? qualifiedName.left : null;
    }
    /**
     * Compute the left most identifier in a property access chain. E.g. the `a` of `a.b.c.d`.
     * @param propertyAccess The starting property access expression from which we want to compute
     * the left most identifier.
     * @returns the left most identifier in the chain or `null` if it is not an identifier.
     */
    function getFarLeftIdentifier(propertyAccess) {
        while (ts.isPropertyAccessExpression(propertyAccess.expression)) {
            propertyAccess = propertyAccess.expression;
        }
        return ts.isIdentifier(propertyAccess.expression) ? propertyAccess.expression : null;
    }
    /**
     * Return the ImportDeclaration for the given `node` if it is either an `ImportSpecifier` or a
     * `NamespaceImport`. If not return `null`.
     */
    function getContainingImportDeclaration(node) {
        return ts.isImportSpecifier(node) ? node.parent.parent.parent :
            ts.isNamespaceImport(node) ? node.parent.parent : null;
    }
    /**
     * Compute the name by which the `decl` was exported, not imported.
     * If no such declaration can be found (e.g. it is a namespace import)
     * then fallback to the `originalId`.
     */
    function getExportedName(decl, originalId) {
        return ts.isImportSpecifier(decl) ?
            (decl.propertyName !== undefined ? decl.propertyName : decl.name).text :
            originalId.text;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvcmVmbGVjdGlvbi9zcmMvdHlwZXNjcmlwdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakMsNEVBQWtOO0lBQ2xOLDhGQUE0QztJQUM1Qyw0RUFBK0M7SUFFL0M7O09BRUc7SUFFSDtRQUNFLGtDQUFzQixPQUF1QjtZQUF2QixZQUFPLEdBQVAsT0FBTyxDQUFnQjtRQUFHLENBQUM7UUFFakQsNkRBQTBCLEdBQTFCLFVBQTJCLFdBQTRCO1lBQXZELGlCQU1DO1lBTEMsSUFBSSxXQUFXLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQy9FLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxPQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsU0FBUyxJQUFJLE9BQUEsS0FBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxFQUFqQyxDQUFpQyxDQUFDO2lCQUM1RSxNQUFNLENBQUMsVUFBQyxHQUFHLElBQXVCLE9BQUEsR0FBRyxLQUFLLElBQUksRUFBWixDQUFZLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRUQsb0RBQWlCLEdBQWpCLFVBQWtCLEtBQXVCO1lBQXpDLGlCQUlDO1lBSEMsSUFBTSxPQUFPLEdBQUcsMkJBQTJCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLEtBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQTNCLENBQTJCLENBQUM7aUJBQzVELE1BQU0sQ0FBQyxVQUFDLE1BQU0sSUFBNEIs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LENBQUMsQ0FBQyxDQUFDO1lBQy9CLENBQUMsSUFBSSxDQUFDLFlBQVksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4RSxVQUFVLENBQUMsSUFBSSxDQUFDO0lBQ3RCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgQ2xhc3NNZW1iZXIsIENsYXNzTWVtYmVyS2luZCwgQ3RvclBhcmFtZXRlciwgRGVjbGFyYXRpb24sIERlY2xhcmF0aW9uS2luZCwgRGVjbGFyYXRpb25Ob2RlLCBEZWNvcmF0b3IsIEZ1bmN0aW9uRGVmaW5pdGlvbiwgSW1wb3J0LCBpc0RlY29yYXRvcklkZW50aWZpZXIsIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuL2hvc3QnO1xuaW1wb3J0IHt0eXBlVG9WYWx1ZX0gZnJvbSAnLi90eXBlX3RvX3ZhbHVlJztcbmltcG9ydCB7aXNOYW1lZENsYXNzRGVjbGFyYXRpb259IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogcmVmbGVjdG9yLnRzIGltcGxlbWVudHMgc3RhdGljIHJlZmxlY3Rpb24gb2YgZGVjbGFyYXRpb25zIHVzaW5nIHRoZSBUeXBlU2NyaXB0IGB0cy5UeXBlQ2hlY2tlcmAuXG4gKi9cblxuZXhwb3J0IGNsYXNzIFR5cGVTY3JpcHRSZWZsZWN0aW9uSG9zdCBpbXBsZW1lbnRzIFJlZmxlY3Rpb25Ib3N0IHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyKSB7fVxuXG4gIGdldERlY29yYXRvcnNPZkRlY2xhcmF0aW9uKGRlY2xhcmF0aW9uOiBEZWNsYXJhdGlvbk5vZGUpOiBEZWNvcmF0b3JbXXxudWxsIHtcbiAgICBpZiAoZGVjbGFyYXRpb24uZGVjb3JhdG9ycyA9PT0gdW5kZWZpbmVkIHx8IGRlY2xhcmF0aW9uLmRlY29yYXRvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGRlY2xhcmF0aW9uLmRlY29yYXRvcnMubWFwKGRlY29yYXRvciA9PiB0aGlzLl9yZWZsZWN0RGVjb3JhdG9yKGRlY29yYXRvcikpXG4gICAgICAgIC5maWx0ZXIoKGRlYyk6IGRlYyBpcyBEZWNvcmF0b3IgPT4gZGVjICE9PSBudWxsKTtcbiAgfVxuXG4gIGdldE1lbWJlcnNPZkNsYXNzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogQ2xhc3NNZW1iZXJbXSB7XG4gICAgY29uc3QgdHNDbGF6eiA9IGNhc3REZWNsYXJhdGlvblRvQ2xhc3NPckRpZShjbGF6eik7XG4gICAgcmV0dXJuIHRzQ2xhenoubWVtYmVycy5tYXAobWVtYmVyID0+IHRoaXMuX3JlZmxlY3RNZW1iZXIobWVtYmVyKSlcbiAgICAgICAgLmZpbHRlcigobWVtYmVyKTogbWVtYmVyIGlzIENsYXNzTWVtYmVyID0+IG1lbWJlciAhPT0gbnVsbCk7XG4gIH1cblxuICBnZXRDb25zdHJ1Y3RvclBhcmFtZXRlcnMoY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiBDdG9yUGFyYW1ldGVyW118bnVsbCB7XG4gICAgY29uc3QgdHNDbGF6eiA9IGNhc3REZWNsYXJhdGlvblRvQ2xhc3NPckRpZShjbGF6eik7XG5cbiAgICBjb25zdCBpc0RlY2xhcmF0aW9uID0gdHNDbGF6ei5nZXRTb3VyY2VGaWxlKCkuaXNEZWNsYXJhdGlvbkZpbGU7XG4gICAgLy8gRm9yIG5vbi1kZWNsYXJhdGlvbiBmaWxlcywgd2Ugd2FudCB0byBmaW5kIHRoZSBjb25zdHJ1Y3RvciB3aXRoIGEgYGJvZHlgLiBUaGUgY29uc3RydWN0b3JzXG4gICAgLy8gd2l0aG91dCBhIGBib2R5YCBhcmUgb3ZlcmxvYWRzIHdoZXJlYXMgd2Ugd2FudCB0aGUgaW1wbGVtZW50YXRpb24gc2luY2UgaXQncyB0aGUgb25lIHRoYXQnbGxcbiAgICAvLyBiZSBleGVjdXRlZCBhbmQgd2hpY2ggY2FuIGhhdmUgZGVjb3JhdG9ycy4gRm9yIGRlY2xhcmF0aW9uIGZpbGVzLCB3ZSB0YWtlIHRoZSBmaXJzdCBvbmUgdGhhdFxuICAgIC8vIHdlIGdldC5cbiAgICBjb25zdCBjdG9yID0gdHNDbGF6ei5tZW1iZXJzLmZpbmQoXG4gICAgICAgIChtZW1iZXIpOiBtZW1iZXIgaXMgdHMuQ29uc3RydWN0b3JEZWNsYXJhdGlvbiA9PlxuICAgICAgICAgICAgdHMuaXNDb25zdHJ1Y3RvckRlY2xhcmF0aW9uKG1lbWJlcikgJiYgKGlzRGVjbGFyYXRpb24gfHwgbWVtYmVyLmJvZHkgIT09IHVuZGVmaW5lZCkpO1xuICAgIGlmIChjdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBjdG9yLnBhcmFtZXRlcnMubWFwKG5vZGUgPT4ge1xuICAgICAgLy8gVGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlciBpcyBlYXN5LlxuICAgICAgY29uc3QgbmFtZSA9IHBhcmFtZXRlck5hbWUobm9kZS5uYW1lKTtcblxuICAgICAgY29uc3QgZGVjb3JhdG9ycyA9IHRoaXMuZ2V0RGVjb3JhdG9yc09mRGVjbGFyYXRpb24obm9kZSk7XG5cbiAgICAgIC8vIEl0IG1heSBvciBtYXkgbm90IGJlIHBvc3NpYmxlIHRvIHdyaXRlIGFuIGV4cHJlc3Npb24gdGhhdCByZWZlcnMgdG8gdGhlIHZhbHVlIHNpZGUgb2YgdGhlXG4gICAgICAvLyB0eXBlIG5hbWVkIGZvciB0aGUgcGFyYW1ldGVyLlxuXG4gICAgICBsZXQgb3JpZ2luYWxUeXBlTm9kZSA9IG5vZGUudHlwZSB8fCBudWxsO1xuICAgICAgbGV0IHR5cGVOb2RlID0gb3JpZ2luYWxUeXBlTm9kZTtcblxuICAgICAgLy8gQ2hlY2sgaWYgd2UgYXJlIGRlYWxpbmcgd2l0aCBhIHNpbXBsZSBudWxsYWJsZSB1bmlvbiB0eXBlIGUuZy4gYGZvbzogRm9vfG51bGxgXG4gICAgICAvLyBhbmQgZXh0cmFjdCB0aGUgdHlwZS4gTW9yZSBjb21wbGV4IHVuaW9uIHR5cGVzIGUuZy4gYGZvbzogRm9vfEJhcmAgYXJlIG5vdCBzdXBwb3J0ZWQuXG4gICAgICAvLyBXZSBhbHNvIGRvbid0IG5lZWQgdG8gc3VwcG9ydCBgZm9vOiBGb298dW5kZWZpbmVkYCBiZWNhdXNlIEFuZ3VsYXIncyBESSBpbmplY3RzIGBudWxsYCBmb3JcbiAgICAgIC8vIG9wdGlvbmFsIHRva2VzIHRoYXQgZG9uJ3QgaGF2ZSBwcm92aWRlcnMuXG4gICAgICBpZiAodHlwZU5vZGUgJiYgdHMuaXNVbmlvblR5cGVOb2RlKHR5cGVOb2RlKSkge1xuICAgICAgICBsZXQgY2hpbGRUeXBlTm9kZXMgPSB0eXBlTm9kZS50eXBlcy5maWx0ZXIoXG4gICAgICAgICAgICBjaGlsZFR5cGVOb2RlID0+XG4gICAgICAgICAgICAgICAgISh0cy5pc0xpdGVyYWxUeXBlTm9kZShjaGlsZFR5cGVOb2RlKSAmJlxuICAgICAgICAgICAgICAgICAgY2hpbGRUeXBlTm9kZS5saXRlcmFsLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQpKTtcblxuICAgICAgICBpZiAoY2hpbGRUeXBlTm9kZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgdHlwZU5vZGUgPSBjaGlsZFR5cGVOb2Rlc1swXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCB0eXBlVmFsdWVSZWZlcmVuY2UgPSB0eXBlVG9WYWx1ZSh0eXBlTm9kZSwgdGhpcy5jaGVja2VyKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgbmFtZU5vZGU6IG5vZGUubmFtZSxcbiAgICAgICAgdHlwZVZhbHVlUmVmZXJlbmNlLFxuICAgICAgICB0eXBlTm9kZTogb3JpZ2luYWxUeXBlTm9kZSxcbiAgICAgICAgZGVjb3JhdG9ycyxcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBnZXRJbXBvcnRPZklkZW50aWZpZXIoaWQ6IHRzLklkZW50aWZpZXIpOiBJbXBvcnR8bnVsbCB7XG4gICAgY29uc3QgZGlyZWN0SW1wb3J0ID0gdGhpcy5nZXREaXJlY3RJbXBvcnRPZklkZW50aWZpZXIoaWQpO1xuICAgIGlmIChkaXJlY3RJbXBvcnQgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBkaXJlY3RJbXBvcnQ7XG4gICAgfSBlbHNlIGlmICh0cy5pc1F1YWxpZmllZE5hbWUoaWQucGFyZW50KSAmJiBpZC5wYXJlbnQucmlnaHQgPT09IGlkKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRJbXBvcnRPZk5hbWVzcGFjZWRJZGVudGlmaWVyKGlkLCBnZXRRdWFsaWZpZWROYW1lUm9vdChpZC5wYXJlbnQpKTtcbiAgICB9IGVsc2UgaWYgKHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKGlkLnBhcmVudCkgJiYgaWQucGFyZW50Lm5hbWUgPT09IGlkKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRJbXBvcnRPZk5hbWVzcGFjZWRJZGVudGlmaWVyKGlkLCBnZXRGYXJMZWZ0SWRlbnRpZmllcihpZC5wYXJlbnQpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgZ2V0RXhwb3J0c09mTW9kdWxlKG5vZGU6IHRzLk5vZGUpOiBNYXA8c3RyaW5nLCBEZWNsYXJhdGlvbj58bnVsbCB7XG4gICAgLy8gSW4gVHlwZVNjcmlwdCBjb2RlLCBtb2R1bGVzIGFyZSBvbmx5IHRzLlNvdXJjZUZpbGVzLiBUaHJvdyBpZiB0aGUgbm9kZSBpc24ndCBhIG1vZHVsZS5cbiAgICBpZiAoIXRzLmlzU291cmNlRmlsZShub2RlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBnZXRFeHBvcnRzT2ZNb2R1bGUoKSBjYWxsZWQgb24gbm9uLVNvdXJjZUZpbGUgaW4gVFMgY29kZWApO1xuICAgIH1cblxuICAgIC8vIFJlZmxlY3QgdGhlIG1vZHVsZSB0byBhIFN5bWJvbCwgYW5kIHVzZSBnZXRFeHBvcnRzT2ZNb2R1bGUoKSB0byBnZXQgYSBsaXN0IG9mIGV4cG9ydGVkXG4gICAgLy8gU3ltYm9scy5cbiAgICBjb25zdCBzeW1ib2wgPSB0aGlzLmNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihub2RlKTtcbiAgICBpZiAoc3ltYm9sID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG1hcCA9IG5ldyBNYXA8c3RyaW5nLCBEZWNsYXJhdGlvbj4oKTtcbiAgICB0aGlzLmNoZWNrZXIuZ2V0RXhwb3J0c09mTW9kdWxlKHN5bWJvbCkuZm9yRWFjaChleHBvcnRTeW1ib2wgPT4ge1xuICAgICAgLy8gTWFwIGVhY2ggZXhwb3J0ZWQgU3ltYm9sIHRvIGEgRGVjbGFyYXRpb24gYW5kIGFkZCBpdCB0byB0aGUgbWFwLlxuICAgICAgY29uc3QgZGVjbCA9IHRoaXMuZ2V0RGVjbGFyYXRpb25PZlN5bWJvbChleHBvcnRTeW1ib2wsIG51bGwpO1xuICAgICAgaWYgKGRlY2wgIT09IG51bGwpIHtcbiAgICAgICAgbWFwLnNldChleHBvcnRTeW1ib2wubmFtZSwgZGVjbCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG1hcDtcbiAgfVxuXG4gIGlzQ2xhc3Mobm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgQ2xhc3NEZWNsYXJhdGlvbiB7XG4gICAgLy8gRm9yIG91ciBwdXJwb3NlcywgY2xhc3NlcyBhcmUgXCJuYW1lZFwiIHRzLkNsYXNzRGVjbGFyYXRpb25zO1xuICAgIC8vIChgbm9kZS5uYW1lYCBjYW4gYmUgdW5kZWZpbmVkIGluIHVubmFtZWQgZGVmYXVsdCBleHBvcnRzOiBgZGVmYXVsdCBleHBvcnQgY2xhc3MgeyAuLi4gfWApLlxuICAgIHJldHVybiBpc05hbWVkQ2xhc3NEZWNsYXJhdGlvbihub2RlKTtcbiAgfVxuXG4gIGhhc0Jhc2VDbGFzcyhjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldEJhc2VDbGFzc0V4cHJlc3Npb24oY2xhenopICE9PSBudWxsO1xuICB9XG5cbiAgZ2V0QmFzZUNsYXNzRXhwcmVzc2lvbihjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbik6IHRzLkV4cHJlc3Npb258bnVsbCB7XG4gICAgaWYgKCEodHMuaXNDbGFzc0RlY2xhcmF0aW9uKGNsYXp6KSB8fCB0cy5pc0NsYXNzRXhwcmVzc2lvbihjbGF6eikpIHx8XG4gICAgICAgIGNsYXp6Lmhlcml0YWdlQ2xhdXNlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgZXh0ZW5kc0NsYXVzZSA9XG4gICAgICAgIGNsYXp6Lmhlcml0YWdlQ2xhdXNlcy5maW5kKGNsYXVzZSA9PiBjbGF1c2UudG9rZW4gPT09IHRzLlN5bnRheEtpbmQuRXh0ZW5kc0tleXdvcmQpO1xuICAgIGlmIChleHRlbmRzQ2xhdXNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBleHRlbmRzVHlwZSA9IGV4dGVuZHNDbGF1c2UudHlwZXNbMF07XG4gICAgaWYgKGV4dGVuZHNUeXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gZXh0ZW5kc1R5cGUuZXhwcmVzc2lvbjtcbiAgfVxuXG4gIGdldERlY2xhcmF0aW9uT2ZJZGVudGlmaWVyKGlkOiB0cy5JZGVudGlmaWVyKTogRGVjbGFyYXRpb258bnVsbCB7XG4gICAgLy8gUmVzb2x2ZSB0aGUgaWRlbnRpZmllciB0byBhIFN5bWJvbCwgYW5kIHJldHVybiB0aGUgZGVjbGFyYXRpb24gb2YgdGhhdC5cbiAgICBsZXQgc3ltYm9sOiB0cy5TeW1ib2x8dW5kZWZpbmVkID0gdGhpcy5jaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24oaWQpO1xuICAgIGlmIChzeW1ib2wgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldERlY2xhcmF0aW9uT2ZTeW1ib2woc3ltYm9sLCBpZCk7XG4gIH1cblxuICBnZXREZWZpbml0aW9uT2ZGdW5jdGlvbihub2RlOiB0cy5Ob2RlKTogRnVuY3Rpb25EZWZpbml0aW9ufG51bGwge1xuICAgIGlmICghdHMuaXNGdW5jdGlvbkRlY2xhcmF0aW9uKG5vZGUpICYmICF0cy5pc01ldGhvZERlY2xhcmF0aW9uKG5vZGUpICYmXG4gICAgICAgICF0cy5pc0Z1bmN0aW9uRXhwcmVzc2lvbihub2RlKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBub2RlLFxuICAgICAgYm9keTogbm9kZS5ib2R5ICE9PSB1bmRlZmluZWQgPyBBcnJheS5mcm9tKG5vZGUuYm9keS5zdGF0ZW1lbnRzKSA6IG51bGwsXG4gICAgICBwYXJhbWV0ZXJzOiBub2RlLnBhcmFtZXRlcnMubWFwKHBhcmFtID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHBhcmFtZXRlck5hbWUocGFyYW0ubmFtZSk7XG4gICAgICAgIGNvbnN0IGluaXRpYWxpemVyID0gcGFyYW0uaW5pdGlhbGl6ZXIgfHwgbnVsbDtcbiAgICAgICAgcmV0dXJuIHtuYW1lLCBub2RlOiBwYXJhbSwgaW5pdGlhbGl6ZXJ9O1xuICAgICAgfSksXG4gICAgfTtcbiAgfVxuXG4gIGdldEdlbmVyaWNBcml0eU9mQ2xhc3MoY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiBudW1iZXJ8bnVsbCB7XG4gICAgaWYgKCF0cy5pc0NsYXNzRGVjbGFyYXRpb24oY2xhenopKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGNsYXp6LnR5cGVQYXJhbWV0ZXJzICE9PSB1bmRlZmluZWQgPyBjbGF6ei50eXBlUGFyYW1ldGVycy5sZW5ndGggOiAwO1xuICB9XG5cbiAgZ2V0VmFyaWFibGVWYWx1ZShkZWNsYXJhdGlvbjogdHMuVmFyaWFibGVEZWNsYXJhdGlvbik6IHRzLkV4cHJlc3Npb258bnVsbCB7XG4gICAgcmV0dXJuIGRlY2xhcmF0aW9uLmluaXRpYWxpemVyIHx8IG51bGw7XG4gIH1cblxuICBnZXREdHNEZWNsYXJhdGlvbihfOiBDbGFzc0RlY2xhcmF0aW9uKTogdHMuRGVjbGFyYXRpb258bnVsbCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRJbnRlcm5hbE5hbWVPZkNsYXNzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogdHMuSWRlbnRpZmllciB7XG4gICAgcmV0dXJuIGNsYXp6Lm5hbWU7XG4gIH1cblxuICBnZXRBZGphY2VudE5hbWVPZkNsYXNzKGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogdHMuSWRlbnRpZmllciB7XG4gICAgcmV0dXJuIGNsYXp6Lm5hbWU7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0RGlyZWN0SW1wb3J0T2ZJZGVudGlmaWVyKGlkOiB0cy5JZGVudGlmaWVyKTogSW1wb3J0fG51bGwge1xuICAgIGNvbnN0IHN5bWJvbCA9IHRoaXMuY2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKGlkKTtcblxuICAgIGlmIChzeW1ib2wgPT09IHVuZGVmaW5lZCB8fCBzeW1ib2wuZGVjbGFyYXRpb25zID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgc3ltYm9sLmRlY2xhcmF0aW9ucy5sZW5ndGggIT09IDEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGRlY2wgPSBzeW1ib2wuZGVjbGFyYXRpb25zWzBdO1xuICAgIGNvbnN0IGltcG9ydERlY2wgPSBnZXRDb250YWluaW5nSW1wb3J0RGVjbGFyYXRpb24oZGVjbCk7XG5cbiAgICAvLyBJZ25vcmUgZGVjbGFyYXRpb25zIHRoYXQgYXJlIGRlZmluZWQgbG9jYWxseSAobm90IGltcG9ydGVkKS5cbiAgICBpZiAoaW1wb3J0RGVjbCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gVGhlIG1vZHVsZSBzcGVjaWZpZXIgaXMgZ3VhcmFudGVlZCB0byBiZSBhIHN0cmluZyBsaXRlcmFsLCBzbyB0aGlzIHNob3VsZCBhbHdheXMgcGFzcy5cbiAgICBpZiAoIXRzLmlzU3RyaW5nTGl0ZXJhbChpbXBvcnREZWNsLm1vZHVsZVNwZWNpZmllcikpIHtcbiAgICAgIC8vIE5vdCBhbGxvd2VkIHRvIGhhcHBlbiBpbiBUeXBlU2NyaXB0IEFTVHMuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4ge2Zyb206IGltcG9ydERlY2wubW9kdWxlU3BlY2lmaWVyLnRleHQsIG5hbWU6IGdldEV4cG9ydGVkTmFtZShkZWNsLCBpZCl9O1xuICB9XG5cbiAgLyoqXG4gICAqIFRyeSB0byBnZXQgdGhlIGltcG9ydCBpbmZvIGZvciB0aGlzIGlkZW50aWZpZXIgYXMgdGhvdWdoIGl0IGlzIGEgbmFtZXNwYWNlZCBpbXBvcnQuXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCBpZiB0aGUgaWRlbnRpZmllciBpcyB0aGUgYERpcmVjdGl2ZWAgcGFydCBvZiBhIHF1YWxpZmllZCB0eXBlIGNoYWluIGxpa2U6XG4gICAqXG4gICAqIGBgYFxuICAgKiBjb3JlLkRpcmVjdGl2ZVxuICAgKiBgYGBcbiAgICpcbiAgICogdGhlbiBpdCBtaWdodCBiZSB0aGF0IGBjb3JlYCBpcyBhIG5hbWVzcGFjZSBpbXBvcnQgc3VjaCBhczpcbiAgICpcbiAgICogYGBgXG4gICAqIGltcG9ydCAqIGFzIGNvcmUgZnJvbSAndHNsaWInO1xuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIGlkIHRoZSBUeXBlU2NyaXB0IGlkZW50aWZpZXIgdG8gZmluZCB0aGUgaW1wb3J0IGluZm8gZm9yLlxuICAgKiBAcmV0dXJucyBUaGUgaW1wb3J0IGluZm8gaWYgdGhpcyBpcyBhIG5hbWVzcGFjZWQgaW1wb3J0IG9yIGBudWxsYC5cbiAgICovXG4gIHByb3RlY3RlZCBnZXRJbXBvcnRPZk5hbWVzcGFjZWRJZGVudGlmaWVyKFxuICAgICAgaWQ6IHRzLklkZW50aWZpZXIsIG5hbWVzcGFjZUlkZW50aWZpZXI6IHRzLklkZW50aWZpZXJ8bnVsbCk6IEltcG9ydHxudWxsIHtcbiAgICBpZiAobmFtZXNwYWNlSWRlbnRpZmllciA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IG5hbWVzcGFjZVN5bWJvbCA9IHRoaXMuY2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKG5hbWVzcGFjZUlkZW50aWZpZXIpO1xuICAgIGlmICghbmFtZXNwYWNlU3ltYm9sKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgZGVjbGFyYXRpb24gPVxuICAgICAgICBuYW1lc3BhY2VTeW1ib2wuZGVjbGFyYXRpb25zLmxlbmd0aCA9PT0gMSA/IG5hbWVzcGFjZVN5bWJvbC5kZWNsYXJhdGlvbnNbMF0gOiBudWxsO1xuICAgIGlmICghZGVjbGFyYXRpb24pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBuYW1lc3BhY2VEZWNsYXJhdGlvbiA9IHRzLmlzTmFtZXNwYWNlSW1wb3J0KGRlY2xhcmF0aW9uKSA/IGRlY2xhcmF0aW9uIDogbnVsbDtcbiAgICBpZiAoIW5hbWVzcGFjZURlY2xhcmF0aW9uKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBpbXBvcnREZWNsYXJhdGlvbiA9IG5hbWVzcGFjZURlY2xhcmF0aW9uLnBhcmVudC5wYXJlbnQ7XG4gICAgaWYgKCF0cy5pc1N0cmluZ0xpdGVyYWwoaW1wb3J0RGVjbGFyYXRpb24ubW9kdWxlU3BlY2lmaWVyKSkge1xuICAgICAgLy8gU2hvdWxkIG5vdCBoYXBwZW4gYXMgdGhpcyB3b3VsZCBiZSBpbnZhbGlkIFR5cGVzU2NyaXB0XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgZnJvbTogaW1wb3J0RGVjbGFyYXRpb24ubW9kdWxlU3BlY2lmaWVyLnRleHQsXG4gICAgICBuYW1lOiBpZC50ZXh0LFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZSBhIGB0cy5TeW1ib2xgIHRvIGl0cyBkZWNsYXJhdGlvbiwga2VlcGluZyB0cmFjayBvZiB0aGUgYHZpYU1vZHVsZWAgYWxvbmcgdGhlIHdheS5cbiAgICovXG4gIHByb3RlY3RlZCBnZXREZWNsYXJhdGlvbk9mU3ltYm9sKHN5bWJvbDogdHMuU3ltYm9sLCBvcmlnaW5hbElkOiB0cy5JZGVudGlmaWVyfG51bGwpOiBEZWNsYXJhdGlvblxuICAgICAgfG51bGwge1xuICAgIC8vIElmIHRoZSBzeW1ib2wgcG9pbnRzIHRvIGEgU2hvcnRoYW5kUHJvcGVydHlBc3NpZ25tZW50LCByZXNvbHZlIGl0LlxuICAgIGxldCB2YWx1ZURlY2xhcmF0aW9uOiB0cy5EZWNsYXJhdGlvbnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgaWYgKHN5bWJvbC52YWx1ZURlY2xhcmF0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhbHVlRGVjbGFyYXRpb24gPSBzeW1ib2wudmFsdWVEZWNsYXJhdGlvbjtcbiAgICB9IGVsc2UgaWYgKHN5bWJvbC5kZWNsYXJhdGlvbnMgIT09IHVuZGVmaW5lZCAmJiBzeW1ib2wuZGVjbGFyYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhbHVlRGVjbGFyYXRpb24gPSBzeW1ib2wuZGVjbGFyYXRpb25zWzBdO1xuICAgIH1cbiAgICBpZiAodmFsdWVEZWNsYXJhdGlvbiAhPT0gdW5kZWZpbmVkICYmIHRzLmlzU2hvcnRoYW5kUHJvcGVydHlBc3NpZ25tZW50KHZhbHVlRGVjbGFyYXRpb24pKSB7XG4gICAgICBjb25zdCBzaG9ydGhhbmRTeW1ib2wgPSB0aGlzLmNoZWNrZXIuZ2V0U2hvcnRoYW5kQXNzaWdubWVudFZhbHVlU3ltYm9sKHZhbHVlRGVjbGFyYXRpb24pO1xuICAgICAgaWYgKHNob3J0aGFuZFN5bWJvbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZ2V0RGVjbGFyYXRpb25PZlN5bWJvbChzaG9ydGhhbmRTeW1ib2wsIG9yaWdpbmFsSWQpO1xuICAgIH0gZWxzZSBpZiAodmFsdWVEZWNsYXJhdGlvbiAhPT0gdW5kZWZpbmVkICYmIHRzLmlzRXhwb3J0U3BlY2lmaWVyKHZhbHVlRGVjbGFyYXRpb24pKSB7XG4gICAgICBjb25zdCB0YXJnZXRTeW1ib2wgPSB0aGlzLmNoZWNrZXIuZ2V0RXhwb3J0U3BlY2lmaWVyTG9jYWxUYXJnZXRTeW1ib2wodmFsdWVEZWNsYXJhdGlvbik7XG4gICAgICBpZiAodGFyZ2V0U3ltYm9sID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5nZXREZWNsYXJhdGlvbk9mU3ltYm9sKHRhcmdldFN5bWJvbCwgb3JpZ2luYWxJZCk7XG4gICAgfVxuXG4gICAgY29uc3QgaW1wb3J0SW5mbyA9IG9yaWdpbmFsSWQgJiYgdGhpcy5nZXRJbXBvcnRPZklkZW50aWZpZXIob3JpZ2luYWxJZCk7XG4gICAgY29uc3QgdmlhTW9kdWxlID1cbiAgICAgICAgaW1wb3J0SW5mbyAhPT0gbnVsbCAmJiBpbXBvcnRJbmZvLmZyb20gIT09IG51bGwgJiYgIWltcG9ydEluZm8uZnJvbS5zdGFydHNXaXRoKCcuJykgP1xuICAgICAgICBpbXBvcnRJbmZvLmZyb20gOlxuICAgICAgICBudWxsO1xuXG4gICAgLy8gTm93LCByZXNvbHZlIHRoZSBTeW1ib2wgdG8gaXRzIGRlY2xhcmF0aW9uIGJ5IGZvbGxvd2luZyBhbnkgYW5kIGFsbCBhbGlhc2VzLlxuICAgIHdoaWxlIChzeW1ib2wuZmxhZ3MgJiB0cy5TeW1ib2xGbGFncy5BbGlhcykge1xuICAgICAgc3ltYm9sID0gdGhpcy5jaGVja2VyLmdldEFsaWFzZWRTeW1ib2woc3ltYm9sKTtcbiAgICB9XG5cbiAgICAvLyBMb29rIGF0IHRoZSByZXNvbHZlZCBTeW1ib2wncyBkZWNsYXJhdGlvbnMgYW5kIHBpY2sgb25lIG9mIHRoZW0gdG8gcmV0dXJuLiBWYWx1ZSBkZWNsYXJhdGlvbnNcbiAgICAvLyBhcmUgZ2l2ZW4gcHJlY2VkZW5jZSBvdmVyIHR5cGUgZGVjbGFyYXRpb25zLlxuICAgIGlmIChzeW1ib2wudmFsdWVEZWNsYXJhdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBub2RlOiBzeW1ib2wudmFsdWVEZWNsYXJhdGlvbixcbiAgICAgICAga25vd246IG51bGwsXG4gICAgICAgIHZpYU1vZHVsZSxcbiAgICAgICAgaWRlbnRpdHk6IG51bGwsXG4gICAgICAgIGtpbmQ6IERlY2xhcmF0aW9uS2luZC5Db25jcmV0ZSxcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChzeW1ib2wuZGVjbGFyYXRpb25zICE9PSB1bmRlZmluZWQgJiYgc3ltYm9sLmRlY2xhcmF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBub2RlOiBzeW1ib2wuZGVjbGFyYXRpb25zWzBdLFxuICAgICAgICBrbm93bjogbnVsbCxcbiAgICAgICAgdmlhTW9kdWxlLFxuICAgICAgICBpZGVudGl0eTogbnVsbCxcbiAgICAgICAga2luZDogRGVjbGFyYXRpb25LaW5kLkNvbmNyZXRlLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVmbGVjdERlY29yYXRvcihub2RlOiB0cy5EZWNvcmF0b3IpOiBEZWNvcmF0b3J8bnVsbCB7XG4gICAgLy8gQXR0ZW1wdCB0byByZXNvbHZlIHRoZSBkZWNvcmF0b3IgZXhwcmVzc2lvbiBpbnRvIGEgcmVmZXJlbmNlIHRvIGEgY29uY3JldGUgSWRlbnRpZmllci4gVGhlXG4gICAgLy8gZXhwcmVzc2lvbiBtYXkgY29udGFpbiBhIGNhbGwgdG8gYSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIHRoZSBkZWNvcmF0b3IgZnVuY3Rpb24sIGluIHdoaWNoXG4gICAgLy8gY2FzZSB3ZSB3YW50IHRvIHJldHVybiB0aGUgYXJndW1lbnRzLlxuICAgIGxldCBkZWNvcmF0b3JFeHByOiB0cy5FeHByZXNzaW9uID0gbm9kZS5leHByZXNzaW9uO1xuICAgIGxldCBhcmdzOiB0cy5FeHByZXNzaW9uW118bnVsbCA9IG51bGw7XG5cbiAgICAvLyBDaGVjayBmb3IgY2FsbCBleHByZXNzaW9ucy5cbiAgICBpZiAodHMuaXNDYWxsRXhwcmVzc2lvbihkZWNvcmF0b3JFeHByKSkge1xuICAgICAgYXJncyA9IEFycmF5LmZyb20oZGVjb3JhdG9yRXhwci5hcmd1bWVudHMpO1xuICAgICAgZGVjb3JhdG9yRXhwciA9IGRlY29yYXRvckV4cHIuZXhwcmVzc2lvbjtcbiAgICB9XG5cbiAgICAvLyBUaGUgZmluYWwgcmVzb2x2ZWQgZGVjb3JhdG9yIHNob3VsZCBiZSBhIGB0cy5JZGVudGlmaWVyYCAtIGlmIGl0J3Mgbm90LCB0aGVuIHNvbWV0aGluZyBpc1xuICAgIC8vIHdyb25nIGFuZCB0aGUgZGVjb3JhdG9yIGNhbid0IGJlIHJlc29sdmVkIHN0YXRpY2FsbHkuXG4gICAgaWYgKCFpc0RlY29yYXRvcklkZW50aWZpZXIoZGVjb3JhdG9yRXhwcikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGRlY29yYXRvcklkZW50aWZpZXIgPSB0cy5pc0lkZW50aWZpZXIoZGVjb3JhdG9yRXhwcikgPyBkZWNvcmF0b3JFeHByIDogZGVjb3JhdG9yRXhwci5uYW1lO1xuICAgIGNvbnN0IGltcG9ydERlY2wgPSB0aGlzLmdldEltcG9ydE9mSWRlbnRpZmllcihkZWNvcmF0b3JJZGVudGlmaWVyKTtcblxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBkZWNvcmF0b3JJZGVudGlmaWVyLnRleHQsXG4gICAgICBpZGVudGlmaWVyOiBkZWNvcmF0b3JFeHByLFxuICAgICAgaW1wb3J0OiBpbXBvcnREZWNsLFxuICAgICAgbm9kZSxcbiAgICAgIGFyZ3MsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlZmxlY3RNZW1iZXIobm9kZTogdHMuQ2xhc3NFbGVtZW50KTogQ2xhc3NNZW1iZXJ8bnVsbCB7XG4gICAgbGV0IGtpbmQ6IENsYXNzTWVtYmVyS2luZHxudWxsID0gbnVsbDtcbiAgICBsZXQgdmFsdWU6IHRzLkV4cHJlc3Npb258bnVsbCA9IG51bGw7XG4gICAgbGV0IG5hbWU6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgICBsZXQgbmFtZU5vZGU6IHRzLklkZW50aWZpZXJ8dHMuU3RyaW5nTGl0ZXJhbHxudWxsID0gbnVsbDtcblxuICAgIGlmICh0cy5pc1Byb3BlcnR5RGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgIGtpbmQgPSBDbGFzc01lbWJlcktpbmQuUHJvcGVydHk7XG4gICAgICB2YWx1ZSA9IG5vZGUuaW5pdGlhbGl6ZXIgfHwgbnVsbDtcbiAgICB9IGVsc2UgaWYgKHRzLmlzR2V0QWNjZXNzb3JEZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAga2luZCA9IENsYXNzTWVtYmVyS2luZC5HZXR0ZXI7XG4gICAgfSBlbHNlIGlmICh0cy5pc1NldEFjY2Vzc29yRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgIGtpbmQgPSBDbGFzc01lbWJlcktpbmQuU2V0dGVyO1xuICAgIH0gZWxzZSBpZiAodHMuaXNNZXRob2REZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAga2luZCA9IENsYXNzTWVtYmVyS2luZC5NZXRob2Q7XG4gICAgfSBlbHNlIGlmICh0cy5pc0NvbnN0cnVjdG9yRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgIGtpbmQgPSBDbGFzc01lbWJlcktpbmQuQ29uc3RydWN0b3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0cy5pc0NvbnN0cnVjdG9yRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgIG5hbWUgPSAnY29uc3RydWN0b3InO1xuICAgIH0gZWxzZSBpZiAodHMuaXNJZGVudGlmaWVyKG5vZGUubmFtZSkpIHtcbiAgICAgIG5hbWUgPSBub2RlLm5hbWUudGV4dDtcbiAgICAgIG5hbWVOb2RlID0gbm9kZS5uYW1lO1xuICAgIH0gZWxzZSBpZiAodHMuaXNTdHJpbmdMaXRlcmFsKG5vZGUubmFtZSkpIHtcbiAgICAgIG5hbWUgPSBub2RlLm5hbWUudGV4dDtcbiAgICAgIG5hbWVOb2RlID0gbm9kZS5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkZWNvcmF0b3JzID0gdGhpcy5nZXREZWNvcmF0b3JzT2ZEZWNsYXJhdGlvbihub2RlKTtcbiAgICBjb25zdCBpc1N0YXRpYyA9IG5vZGUubW9kaWZpZXJzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgbm9kZS5tb2RpZmllcnMuc29tZShtb2QgPT4gbW9kLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU3RhdGljS2V5d29yZCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgbm9kZSxcbiAgICAgIGltcGxlbWVudGF0aW9uOiBub2RlLFxuICAgICAga2luZCxcbiAgICAgIHR5cGU6IG5vZGUudHlwZSB8fCBudWxsLFxuICAgICAgbmFtZSxcbiAgICAgIG5hbWVOb2RlLFxuICAgICAgZGVjb3JhdG9ycyxcbiAgICAgIHZhbHVlLFxuICAgICAgaXNTdGF0aWMsXG4gICAgfTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmbGVjdE5hbWVPZkRlY2xhcmF0aW9uKGRlY2w6IHRzLkRlY2xhcmF0aW9uKTogc3RyaW5nfG51bGwge1xuICBjb25zdCBpZCA9IHJlZmxlY3RJZGVudGlmaWVyT2ZEZWNsYXJhdGlvbihkZWNsKTtcbiAgcmV0dXJuIGlkICYmIGlkLnRleHQgfHwgbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZmxlY3RJZGVudGlmaWVyT2ZEZWNsYXJhdGlvbihkZWNsOiB0cy5EZWNsYXJhdGlvbik6IHRzLklkZW50aWZpZXJ8bnVsbCB7XG4gIGlmICh0cy5pc0NsYXNzRGVjbGFyYXRpb24oZGVjbCkgfHwgdHMuaXNGdW5jdGlvbkRlY2xhcmF0aW9uKGRlY2wpKSB7XG4gICAgcmV0dXJuIGRlY2wubmFtZSB8fCBudWxsO1xuICB9IGVsc2UgaWYgKHRzLmlzVmFyaWFibGVEZWNsYXJhdGlvbihkZWNsKSkge1xuICAgIGlmICh0cy5pc0lkZW50aWZpZXIoZGVjbC5uYW1lKSkge1xuICAgICAgcmV0dXJuIGRlY2wubmFtZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWZsZWN0VHlwZUVudGl0eVRvRGVjbGFyYXRpb24oXG4gICAgdHlwZTogdHMuRW50aXR5TmFtZSwgY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIpOiB7bm9kZTogdHMuRGVjbGFyYXRpb24sIGZyb206IHN0cmluZ3xudWxsfSB7XG4gIGxldCByZWFsU3ltYm9sID0gY2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKHR5cGUpO1xuICBpZiAocmVhbFN5bWJvbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgcmVzb2x2ZSB0eXBlIGVudGl0eSAke3R5cGUuZ2V0VGV4dCgpfSB0byBzeW1ib2xgKTtcbiAgfVxuICB3aGlsZSAocmVhbFN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSB7XG4gICAgcmVhbFN5bWJvbCA9IGNoZWNrZXIuZ2V0QWxpYXNlZFN5bWJvbChyZWFsU3ltYm9sKTtcbiAgfVxuXG4gIGxldCBub2RlOiB0cy5EZWNsYXJhdGlvbnxudWxsID0gbnVsbDtcbiAgaWYgKHJlYWxTeW1ib2wudmFsdWVEZWNsYXJhdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbm9kZSA9IHJlYWxTeW1ib2wudmFsdWVEZWNsYXJhdGlvbjtcbiAgfSBlbHNlIGlmIChyZWFsU3ltYm9sLmRlY2xhcmF0aW9ucyAhPT0gdW5kZWZpbmVkICYmIHJlYWxTeW1ib2wuZGVjbGFyYXRpb25zLmxlbmd0aCA9PT0gMSkge1xuICAgIG5vZGUgPSByZWFsU3ltYm9sLmRlY2xhcmF0aW9uc1swXTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCByZXNvbHZlIHR5cGUgZW50aXR5IHN5bWJvbCB0byBkZWNsYXJhdGlvbmApO1xuICB9XG5cbiAgaWYgKHRzLmlzUXVhbGlmaWVkTmFtZSh0eXBlKSkge1xuICAgIGlmICghdHMuaXNJZGVudGlmaWVyKHR5cGUubGVmdCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGhhbmRsZSBxdWFsaWZpZWQgbmFtZSB3aXRoIG5vbi1pZGVudGlmaWVyIGxoc2ApO1xuICAgIH1cbiAgICBjb25zdCBzeW1ib2wgPSBjaGVja2VyLmdldFN5bWJvbEF0TG9jYXRpb24odHlwZS5sZWZ0KTtcbiAgICBpZiAoc3ltYm9sID09PSB1bmRlZmluZWQgfHwgc3ltYm9sLmRlY2xhcmF0aW9ucyA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgIHN5bWJvbC5kZWNsYXJhdGlvbnMubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCByZXNvbHZlIHF1YWxpZmllZCB0eXBlIGVudGl0eSBsaHMgdG8gc3ltYm9sYCk7XG4gICAgfVxuICAgIGNvbnN0IGRlY2wgPSBzeW1ib2wuZGVjbGFyYXRpb25zWzBdO1xuICAgIGlmICh0cy5pc05hbWVzcGFjZUltcG9ydChkZWNsKSkge1xuICAgICAgY29uc3QgY2xhdXNlID0gZGVjbC5wYXJlbnQhO1xuICAgICAgY29uc3QgaW1wb3J0RGVjbCA9IGNsYXVzZS5wYXJlbnQhO1xuICAgICAgaWYgKCF0cy5pc1N0cmluZ0xpdGVyYWwoaW1wb3J0RGVjbC5tb2R1bGVTcGVjaWZpZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgTW9kdWxlIHNwZWNpZmllciBpcyBub3QgYSBzdHJpbmdgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7bm9kZSwgZnJvbTogaW1wb3J0RGVjbC5tb2R1bGVTcGVjaWZpZXIudGV4dH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBpbXBvcnQgdHlwZT9gKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHtub2RlLCBmcm9tOiBudWxsfTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyVG9NZW1iZXJzV2l0aERlY29yYXRvcihtZW1iZXJzOiBDbGFzc01lbWJlcltdLCBuYW1lOiBzdHJpbmcsIG1vZHVsZT86IHN0cmluZyk6XG4gICAge21lbWJlcjogQ2xhc3NNZW1iZXIsIGRlY29yYXRvcnM6IERlY29yYXRvcltdfVtdIHtcbiAgcmV0dXJuIG1lbWJlcnMuZmlsdGVyKG1lbWJlciA9PiAhbWVtYmVyLmlzU3RhdGljKVxuICAgICAgLm1hcChtZW1iZXIgPT4ge1xuICAgICAgICBpZiAobWVtYmVyLmRlY29yYXRvcnMgPT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRlY29yYXRvcnMgPSBtZW1iZXIuZGVjb3JhdG9ycy5maWx0ZXIoZGVjID0+IHtcbiAgICAgICAgICBpZiAoZGVjLmltcG9ydCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGRlYy5pbXBvcnQubmFtZSA9PT0gbmFtZSAmJiAobW9kdWxlID09PSB1bmRlZmluZWQgfHwgZGVjLmltcG9ydC5mcm9tID09PSBtb2R1bGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZGVjLm5hbWUgPT09IG5hbWUgJiYgbW9kdWxlID09PSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZGVjb3JhdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7bWVtYmVyLCBkZWNvcmF0b3JzfTtcbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKCh2YWx1ZSk6IHZhbHVlIGlzIHttZW1iZXI6IENsYXNzTWVtYmVyLCBkZWNvcmF0b3JzOiBEZWNvcmF0b3JbXX0gPT4gdmFsdWUgIT09IG51bGwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZE1lbWJlcihcbiAgICBtZW1iZXJzOiBDbGFzc01lbWJlcltdLCBuYW1lOiBzdHJpbmcsIGlzU3RhdGljOiBib29sZWFuID0gZmFsc2UpOiBDbGFzc01lbWJlcnxudWxsIHtcbiAgcmV0dXJuIG1lbWJlcnMuZmluZChtZW1iZXIgPT4gbWVtYmVyLmlzU3RhdGljID09PSBpc1N0YXRpYyAmJiBtZW1iZXIubmFtZSA9PT0gbmFtZSkgfHwgbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZmxlY3RPYmplY3RMaXRlcmFsKG5vZGU6IHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uKTogTWFwPHN0cmluZywgdHMuRXhwcmVzc2lvbj4ge1xuICBjb25zdCBtYXAgPSBuZXcgTWFwPHN0cmluZywgdHMuRXhwcmVzc2lvbj4oKTtcbiAgbm9kZS5wcm9wZXJ0aWVzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgaWYgKHRzLmlzUHJvcGVydHlBc3NpZ25tZW50KHByb3ApKSB7XG4gICAgICBjb25zdCBuYW1lID0gcHJvcGVydHlOYW1lVG9TdHJpbmcocHJvcC5uYW1lKTtcbiAgICAgIGlmIChuYW1lID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIG1hcC5zZXQobmFtZSwgcHJvcC5pbml0aWFsaXplcik7XG4gICAgfSBlbHNlIGlmICh0cy5pc1Nob3J0aGFuZFByb3BlcnR5QXNzaWdubWVudChwcm9wKSkge1xuICAgICAgbWFwLnNldChwcm9wLm5hbWUudGV4dCwgcHJvcC5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBtYXA7XG59XG5cbmZ1bmN0aW9uIGNhc3REZWNsYXJhdGlvblRvQ2xhc3NPckRpZShkZWNsYXJhdGlvbjogQ2xhc3NEZWNsYXJhdGlvbik6XG4gICAgQ2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPiB7XG4gIGlmICghdHMuaXNDbGFzc0RlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFJlZmxlY3Rpbmcgb24gYSAke3RzLlN5bnRheEtpbmRbZGVjbGFyYXRpb24ua2luZF19IGluc3RlYWQgb2YgYSBDbGFzc0RlY2xhcmF0aW9uLmApO1xuICB9XG4gIHJldHVybiBkZWNsYXJhdGlvbjtcbn1cblxuZnVuY3Rpb24gcGFyYW1ldGVyTmFtZShuYW1lOiB0cy5CaW5kaW5nTmFtZSk6IHN0cmluZ3xudWxsIHtcbiAgaWYgKHRzLmlzSWRlbnRpZmllcihuYW1lKSkge1xuICAgIHJldHVybiBuYW1lLnRleHQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJvcGVydHlOYW1lVG9TdHJpbmcobm9kZTogdHMuUHJvcGVydHlOYW1lKTogc3RyaW5nfG51bGwge1xuICBpZiAodHMuaXNJZGVudGlmaWVyKG5vZGUpIHx8IHRzLmlzU3RyaW5nTGl0ZXJhbChub2RlKSB8fCB0cy5pc051bWVyaWNMaXRlcmFsKG5vZGUpKSB7XG4gICAgcmV0dXJuIG5vZGUudGV4dDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIENvbXB1dGUgdGhlIGxlZnQgbW9zdCBpZGVudGlmaWVyIGluIGEgcXVhbGlmaWVkIHR5cGUgY2hhaW4uIEUuZy4gdGhlIGBhYCBvZiBgYS5iLmMuU29tZVR5cGVgLlxuICogQHBhcmFtIHF1YWxpZmllZE5hbWUgVGhlIHN0YXJ0aW5nIHByb3BlcnR5IGFjY2VzcyBleHByZXNzaW9uIGZyb20gd2hpY2ggd2Ugd2FudCB0byBjb21wdXRlXG4gKiB0aGUgbGVmdCBtb3N0IGlkZW50aWZpZXIuXG4gKiBAcmV0dXJucyB0aGUgbGVmdCBtb3N0IGlkZW50aWZpZXIgaW4gdGhlIGNoYWluIG9yIGBudWxsYCBpZiBpdCBpcyBub3QgYW4gaWRlbnRpZmllci5cbiAqL1xuZnVuY3Rpb24gZ2V0UXVhbGlmaWVkTmFtZVJvb3QocXVhbGlmaWVkTmFtZTogdHMuUXVhbGlmaWVkTmFtZSk6IHRzLklkZW50aWZpZXJ8bnVsbCB7XG4gIHdoaWxlICh0cy5pc1F1YWxpZmllZE5hbWUocXVhbGlmaWVkTmFtZS5sZWZ0KSkge1xuICAgIHF1YWxpZmllZE5hbWUgPSBxdWFsaWZpZWROYW1lLmxlZnQ7XG4gIH1cbiAgcmV0dXJuIHRzLmlzSWRlbnRpZmllcihxdWFsaWZpZWROYW1lLmxlZnQpID8gcXVhbGlmaWVkTmFtZS5sZWZ0IDogbnVsbDtcbn1cblxuLyoqXG4gKiBDb21wdXRlIHRoZSBsZWZ0IG1vc3QgaWRlbnRpZmllciBpbiBhIHByb3BlcnR5IGFjY2VzcyBjaGFpbi4gRS5nLiB0aGUgYGFgIG9mIGBhLmIuYy5kYC5cbiAqIEBwYXJhbSBwcm9wZXJ0eUFjY2VzcyBUaGUgc3RhcnRpbmcgcHJvcGVydHkgYWNjZXNzIGV4cHJlc3Npb24gZnJvbSB3aGljaCB3ZSB3YW50IHRvIGNvbXB1dGVcbiAqIHRoZSBsZWZ0IG1vc3QgaWRlbnRpZmllci5cbiAqIEByZXR1cm5zIHRoZSBsZWZ0IG1vc3QgaWRlbnRpZmllciBpbiB0aGUgY2hhaW4gb3IgYG51bGxgIGlmIGl0IGlzIG5vdCBhbiBpZGVudGlmaWVyLlxuICovXG5mdW5jdGlvbiBnZXRGYXJMZWZ0SWRlbnRpZmllcihwcm9wZXJ0eUFjY2VzczogdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKTogdHMuSWRlbnRpZmllcnxudWxsIHtcbiAgd2hpbGUgKHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKHByb3BlcnR5QWNjZXNzLmV4cHJlc3Npb24pKSB7XG4gICAgcHJvcGVydHlBY2Nlc3MgPSBwcm9wZXJ0eUFjY2Vzcy5leHByZXNzaW9uO1xuICB9XG4gIHJldHVybiB0cy5pc0lkZW50aWZpZXIocHJvcGVydHlBY2Nlc3MuZXhwcmVzc2lvbikgPyBwcm9wZXJ0eUFjY2Vzcy5leHByZXNzaW9uIDogbnVsbDtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIEltcG9ydERlY2xhcmF0aW9uIGZvciB0aGUgZ2l2ZW4gYG5vZGVgIGlmIGl0IGlzIGVpdGhlciBhbiBgSW1wb3J0U3BlY2lmaWVyYCBvciBhXG4gKiBgTmFtZXNwYWNlSW1wb3J0YC4gSWYgbm90IHJldHVybiBgbnVsbGAuXG4gKi9cbmZ1bmN0aW9uIGdldENvbnRhaW5pbmdJbXBvcnREZWNsYXJhdGlvbihub2RlOiB0cy5Ob2RlKTogdHMuSW1wb3J0RGVjbGFyYXRpb258bnVsbCB7XG4gIHJldHVybiB0cy5pc0ltcG9ydFNwZWNpZmllcihub2RlKSA/IG5vZGUucGFyZW50IS5wYXJlbnQhLnBhcmVudCEgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cy5pc05hbWVzcGFjZUltcG9ydChub2RlKSA/IG5vZGUucGFyZW50LnBhcmVudCA6IG51bGw7XG59XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgbmFtZSBieSB3aGljaCB0aGUgYGRlY2xgIHdhcyBleHBvcnRlZCwgbm90IGltcG9ydGVkLlxuICogSWYgbm8gc3VjaCBkZWNsYXJhdGlvbiBjYW4gYmUgZm91bmQgKGUuZy4gaXQgaXMgYSBuYW1lc3BhY2UgaW1wb3J0KVxuICogdGhlbiBmYWxsYmFjayB0byB0aGUgYG9yaWdpbmFsSWRgLlxuICovXG5mdW5jdGlvbiBnZXRFeHBvcnRlZE5hbWUoZGVjbDogdHMuRGVjbGFyYXRpb24sIG9yaWdpbmFsSWQ6IHRzLklkZW50aWZpZXIpOiBzdHJpbmcge1xuICByZXR1cm4gdHMuaXNJbXBvcnRTcGVjaWZpZXIoZGVjbCkgP1xuICAgICAgKGRlY2wucHJvcGVydHlOYW1lICE9PSB1bmRlZmluZWQgPyBkZWNsLnByb3BlcnR5TmFtZSA6IGRlY2wubmFtZSkudGV4dCA6XG4gICAgICBvcmlnaW5hbElkLnRleHQ7XG59XG4iXX0=