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
        define("@angular/compiler-cli/src/transformers/downlevel_decorators_transform", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/transformers/patch_alias_reference_resolution"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDownlevelDecoratorsTransform = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var patch_alias_reference_resolution_1 = require("@angular/compiler-cli/src/transformers/patch_alias_reference_resolution");
    /**
     * Whether a given decorator should be treated as an Angular decorator.
     * Either it's used in @angular/core, or it's imported from there.
     */
    function isAngularDecorator(decorator, isCore) {
        return isCore || (decorator.import !== null && decorator.import.from === '@angular/core');
    }
    /*
     #####################################################################
      Code below has been extracted from the tsickle decorator downlevel transformer
      and a few local modifications have been applied:
    
        1. Tsickle by default processed all decorators that had the `@Annotation` JSDoc.
           We modified the transform to only be concerned with known Angular decorators.
        2. Tsickle by default added `@nocollapse` to all generated `ctorParameters` properties.
           We only do this when `annotateForClosureCompiler` is enabled.
        3. Tsickle does not handle union types for dependency injection. i.e. if a injected type
           is denoted with `@Optional`, the actual type could be set to `T | null`.
           See: https://github.com/angular/angular-cli/commit/826803d0736b807867caff9f8903e508970ad5e4.
        4. Tsickle relied on `emitDecoratorMetadata` to be set to `true`. This is due to a limitation
           in TypeScript transformers that never has been fixed. We were able to work around this
           limitation so that `emitDecoratorMetadata` doesn't need to be specified.
           See: `patchAliasReferenceResolution` for more details.
    
      Here is a link to the tsickle revision on which this transformer is based:
      https://github.com/angular/tsickle/blob/fae06becb1570f491806060d83f29f2d50c43cdd/src/decorator_downlevel_transformer.ts
     #####################################################################
    */
    /**
     * Creates the AST for the decorator field type annotation, which has the form
     *     { type: Function, args?: any[] }[]
     */
    function createDecoratorInvocationType() {
        var typeElements = [];
        typeElements.push(ts.createPropertySignature(undefined, 'type', undefined, ts.createTypeReferenceNode(ts.createIdentifier('Function'), undefined), undefined));
        typeElements.push(ts.createPropertySignature(undefined, 'args', ts.createToken(ts.SyntaxKind.QuestionToken), ts.createArrayTypeNode(ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)), undefined));
        return ts.createArrayTypeNode(ts.createTypeLiteralNode(typeElements));
    }
    /**
     * Extracts the type of the decorator (the function or expression invoked), as well as all the
     * arguments passed to the decorator. Returns an AST with the form:
     *
     *     // For @decorator(arg1, arg2)
     *     { type: decorator, args: [arg1, arg2] }
     */
    function extractMetadataFromSingleDecorator(decorator, diagnostics) {
        var e_1, _a;
        var metadataProperties = [];
        var expr = decorator.expression;
        switch (expr.kind) {
            case ts.SyntaxKind.Identifier:
                // The decorator was a plain @Foo.
                metadataProperties.push(ts.createPropertyAssignment('type', expr));
                break;
            case ts.SyntaxKind.CallExpression:
                // The decorator was a call, like @Foo(bar).
                var call = expr;
                metadataProperties.push(ts.createPropertyAssignment('type', call.expression));
                if (call.arguments.length) {
                    var args = [];
                    try {
                        for (var _b = tslib_1.__values(call.arguments), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var arg = _c.value;
                            args.push(arg);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    var argsArrayLiteral = ts.createArrayLiteral(args);
                    argsArrayLiteral.elements.hasTrailingComma = true;
                    metadataProperties.push(ts.createPropertyAssignment('args', argsArrayLiteral));
                }
                break;
            default:
                diagnostics.push({
                    file: decorator.getSourceFile(),
                    start: decorator.getStart(),
                    length: decorator.getEnd() - decorator.getStart(),
                    messageText: ts.SyntaxKind[decorator.kind] + " not implemented in gathering decorator metadata.",
                    category: ts.DiagnosticCategory.Error,
                    code: 0,
                });
                break;
        }
        return ts.createObjectLiteral(metadataProperties);
    }
    /**
     * Takes a list of decorator metadata object ASTs and produces an AST for a
     * static class property of an array of those metadata objects.
     */
    function createDecoratorClassProperty(decoratorList) {
        var modifier = ts.createToken(ts.SyntaxKind.StaticKeyword);
        var type = createDecoratorInvocationType();
        var initializer = ts.createArrayLiteral(decoratorList, true);
        // NB: the .decorators property does not get a @nocollapse property. There is
        // no good reason why - it means .decorators is not runtime accessible if you
        // compile with collapse properties, whereas propDecorators is, which doesn't
        // follow any stringent logic. However this has been the case previously, and
        // adding it back in leads to substantial code size increases as Closure fails
        // to tree shake these props without @nocollapse.
        return ts.createProperty(undefined, [modifier], 'decorators', undefined, type, initializer);
    }
    /**
     * Creates the AST for the 'ctorParameters' field type annotation:
     *   () => ({ type: any, decorators?: {type: Function, args?: any[]}[] }|null)[]
     */
    function createCtorParametersClassPropertyType() {
        // Sorry about this. Try reading just the string literals below.
        var typeElements = [];
        typeElements.push(ts.createPropertySignature(undefined, 'type', undefined, ts.createTypeReferenceNode(ts.createIdentifier('any'), undefined), undefined));
        typeElements.push(ts.createPropertySignature(undefined, 'decorators', ts.createToken(ts.SyntaxKind.QuestionToken), ts.createArrayTypeNode(ts.createTypeLiteralNode([
            ts.createPropertySignature(undefined, 'type', undefined, ts.createTypeReferenceNode(ts.createIdentifier('Function'), undefined), undefined),
            ts.createPropertySignature(undefined, 'args', ts.createToken(ts.SyntaxKind.QuestionToken), ts.createArrayTypeNode(ts.createTypeReferenceNode(ts.createIdentifier('any'), undefined)), undefined),
        ])), undefined));
        return ts.createFunctionTypeNode(undefined, [], ts.createArrayTypeNode(ts.createUnionTypeNode([
            ts.createTypeLiteralNode(typeElements),
            ts.createLiteralTypeNode(ts.createNull()),
        ])));
    }
    /**
     * Sets a Closure \@nocollapse synthetic comment on the given node. This prevents Closure Compiler
     * from collapsing the apparently static property, which would make it impossible to find for code
     * trying to detect it at runtime.
     */
    function addNoCollapseComment(n) {
        ts.setSyntheticLeadingComments(n, [{
                kind: ts.SyntaxKind.MultiLineCommentTrivia,
                text: '* @nocollapse ',
                pos: -1,
                end: -1,
                hasTrailingNewLine: true
            }]);
    }
    /**
     * createCtorParametersClassProperty creates a static 'ctorParameters' property containing
     * downleveled decorator information.
     *
     * The property contains an arrow function that returns an array of object literals of the shape:
     *     static ctorParameters = () => [{
     *       type: SomeClass|undefined,  // the type of the param that's decorated, if it's a value.
     *       decorators: [{
     *         type: DecoratorFn,  // the type of the decorator that's invoked.
     *         args: [ARGS],       // the arguments passed to the decorator.
     *       }]
     *     }];
     */
    function createCtorParametersClassProperty(diagnostics, entityNameToExpression, ctorParameters, isClosureCompilerEnabled) {
        var e_2, _a, e_3, _b;
        var params = [];
        try {
            for (var ctorParameters_1 = tslib_1.__values(ctorParameters), ctorParameters_1_1 = ctorParameters_1.next(); !ctorParameters_1_1.done; ctorParameters_1_1 = ctorParameters_1.next()) {
                var ctorParam = ctorParameters_1_1.value;
                if (!ctorParam.type && ctorParam.decorators.length === 0) {
                    params.push(ts.createNull());
                    continue;
                }
                var paramType = ctorParam.type ?
                    typeReferenceToExpression(entityNameToExpression, ctorParam.type) :
                    undefined;
                var members = [ts.createPropertyAssignment('type', paramType || ts.createIdentifier('undefined'))];
                var decorators = [];
                try {
                    for (var _c = (e_3 = void 0, tslib_1.__values(ctorParam.decorators)), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var deco = _d.value;
                        decorators.push(extractMetadataFromSingleDecorator(deco, diagnostics));
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                if (decorators.length) {
                    members.push(ts.createPropertyAssignment('decorators', ts.createArrayLiteral(decorators)));
                }
                params.push(ts.createObjectLiteral(members));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (ctorParameters_1_1 && !ctorParameters_1_1.done && (_a = ctorParameters_1.return)) _a.call(ctorParameters_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var initializer = ts.createArrowFunction(undefined, undefined, [], undefined, ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken), ts.createArrayLiteral(params, true));
        var type = createCtorParametersClassPropertyType();
        var ctorProp = ts.createProperty(undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], 'ctorParameters', undefined, type, initializer);
        if (isClosureCompilerEnabled) {
            addNoCollapseComment(ctorProp);
        }
        return ctorProp;
    }
    /**
     * createPropDecoratorsClassProperty creates a static 'propDecorators' property containing type
     * information for every property that has a decorator applied.
     *
     *     static propDecorators: {[key: string]: {type: Function, args?: any[]}[]} = {
     *       propA: [{type: MyDecorator, args: [1, 2]}, ...],
     *       ...
     *     };
     */
    function createPropDecoratorsClassProperty(diagnostics, properties) {
        var e_4, _a;
        //  `static propDecorators: {[key: string]: ` + {type: Function, args?: any[]}[] + `} = {\n`);
        var entries = [];
        try {
            for (var _b = tslib_1.__values(properties.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = tslib_1.__read(_c.value, 2), name = _d[0], decorators = _d[1];
                entries.push(ts.createPropertyAssignment(name, ts.createArrayLiteral(decorators.map(function (deco) { return extractMetadataFromSingleDecorator(deco, diagnostics); }))));
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        var initializer = ts.createObjectLiteral(entries, true);
        var type = ts.createTypeLiteralNode([ts.createIndexSignature(undefined, undefined, [ts.createParameter(undefined, undefined, undefined, 'key', undefined, ts.createTypeReferenceNode('string', undefined), undefined)], createDecoratorInvocationType())]);
        return ts.createProperty(undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], 'propDecorators', undefined, type, initializer);
    }
    /**
     * Returns an expression representing the (potentially) value part for the given node.
     *
     * This is a partial re-implementation of TypeScript's serializeTypeReferenceNode. This is a
     * workaround for https://github.com/Microsoft/TypeScript/issues/17516 (serializeTypeReferenceNode
     * not being exposed). In practice this implementation is sufficient for Angular's use of type
     * metadata.
     */
    function typeReferenceToExpression(entityNameToExpression, node) {
        var kind = node.kind;
        if (ts.isLiteralTypeNode(node)) {
            // Treat literal types like their base type (boolean, string, number).
            kind = node.literal.kind;
        }
        switch (kind) {
            case ts.SyntaxKind.FunctionType:
            case ts.SyntaxKind.ConstructorType:
                return ts.createIdentifier('Function');
            case ts.SyntaxKind.ArrayType:
            case ts.SyntaxKind.TupleType:
                return ts.createIdentifier('Array');
            case ts.SyntaxKind.TypePredicate:
            case ts.SyntaxKind.TrueKeyword:
            case ts.SyntaxKind.FalseKeyword:
            case ts.SyntaxKind.BooleanKeyword:
                return ts.createIdentifier('Boolean');
            case ts.SyntaxKind.StringLiteral:
            case ts.SyntaxKind.StringKeyword:
                return ts.createIdentifier('String');
            case ts.SyntaxKind.ObjectKeyword:
                return ts.createIdentifier('Object');
            case ts.SyntaxKind.NumberKeyword:
            case ts.SyntaxKind.NumericLiteral:
                return ts.createIdentifier('Number');
            case ts.SyntaxKind.TypeReference:
                var typeRef = node;
                // Ignore any generic types, just return the base type.
                return entityNameToExpression(typeRef.typeName);
            case ts.SyntaxKind.UnionType:
                var childTypeNodes = node
                    .types.filter(function (t) { return !(ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword); });
                return childTypeNodes.length === 1 ?
                    typeReferenceToExpression(entityNameToExpression, childTypeNodes[0]) :
                    undefined;
            default:
                return undefined;
        }
    }
    /**
     * Checks whether a given symbol refers to a value that exists at runtime (as distinct from a type).
     *
     * Expands aliases, which is important for the case where
     *   import * as x from 'some-module';
     * and x is now a value (the module object).
     */
    function symbolIsRuntimeValue(typeChecker, symbol) {
        if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = typeChecker.getAliasedSymbol(symbol);
        }
        // Note that const enums are a special case, because
        // while they have a value, they don't exist at runtime.
        return (symbol.flags & ts.SymbolFlags.Value & ts.SymbolFlags.ConstEnumExcludes) !== 0;
    }
    /**
     * Gets a transformer for downleveling Angular decorators.
     * @param typeChecker Reference to the program's type checker.
     * @param host Reflection host that is used for determining decorators.
     * @param diagnostics List which will be populated with diagnostics if any.
     * @param isCore Whether the current TypeScript program is for the `@angular/core` package.
     * @param isClosureCompilerEnabled Whether closure annotations need to be added where needed.
     * @param skipClassDecorators Whether class decorators should be skipped from downleveling.
     *   This is useful for JIT mode where class decorators should be preserved as they could rely
     *   on immediate execution. e.g. downleveling `@Injectable` means that the injectable factory
     *   is not created, and injecting the token will not work. If this decorator would not be
     *   downleveled, the `Injectable` decorator will execute immediately on file load, and
     *   Angular will generate the corresponding injectable factory.
     */
    function getDownlevelDecoratorsTransform(typeChecker, host, diagnostics, isCore, isClosureCompilerEnabled, skipClassDecorators) {
        return function (context) {
            // Ensure that referenced type symbols are not elided by TypeScript. Imports for
            // such parameter type symbols previously could be type-only, but now might be also
            // used in the `ctorParameters` static property as a value. We want to make sure
            // that TypeScript does not elide imports for such type references. Read more
            // about this in the description for `loadIsReferencedAliasDeclarationPatch`.
            var referencedParameterTypes = patch_alias_reference_resolution_1.loadIsReferencedAliasDeclarationPatch(context);
            /**
             * Converts an EntityName (from a type annotation) to an expression (accessing a value).
             *
             * For a given qualified name, this walks depth first to find the leftmost identifier,
             * and then converts the path into a property access that can be used as expression.
             */
            function entityNameToExpression(name) {
                var symbol = typeChecker.getSymbolAtLocation(name);
                // Check if the entity name references a symbol that is an actual value. If it is not, it
                // cannot be referenced by an expression, so return undefined.
                if (!symbol || !symbolIsRuntimeValue(typeChecker, symbol) || !symbol.declarations ||
                    symbol.declarations.length === 0) {
                    return undefined;
                }
                // If we deal with a qualified name, build up a property access expression
                // that could be used in the JavaScript output.
                if (ts.isQualifiedName(name)) {
                    var containerExpr = entityNameToExpression(name.left);
                    if (containerExpr === undefined) {
                        return undefined;
                    }
                    return ts.createPropertyAccess(containerExpr, name.right);
                }
                var decl = symbol.declarations[0];
                // If the given entity name has been resolved to an alias import declaration,
                // ensure that the alias declaration is not elided by TypeScript, and use its
                // name identifier to reference it at runtime.
                if (patch_alias_reference_resolution_1.isAliasImportDeclaration(decl)) {
                    referencedParameterTypes.add(decl);
                    // If the entity name resolves to an alias import declaration, we reference the
                    // entity based on the alias import name. This ensures that TypeScript properly
                    // resolves the link to the import. Cloning the original entity name identifier
                    // could lead to an incorrect resolution at local scope. e.g. Consider the following
                    // snippet: `constructor(Dep: Dep) {}`. In such a case, the local `Dep` identifier
                    // would resolve to the actual parameter name, and not to the desired import.
                    // This happens because the entity name identifier symbol is internally considered
                    // as type-only and therefore TypeScript tries to resolve it as value manually.
                    // We can help TypeScript and avoid this non-reliable resolution by using an identifier
                    // that is not type-only and is directly linked to the import alias declaration.
                    if (decl.name !== undefined) {
                        return ts.getMutableClone(decl.name);
                    }
                }
                // Clone the original entity name identifier so that it can be used to reference
                // its value at runtime. This is used when the identifier is resolving to a file
                // local declaration (otherwise it would resolve to an alias import declaration).
                return ts.getMutableClone(name);
            }
            /**
             * Transforms a class element. Returns a three tuple of name, transformed element, and
             * decorators found. Returns an undefined name if there are no decorators to lower on the
             * element, or the element has an exotic name.
             */
            function transformClassElement(element) {
                var e_5, _a;
                element = ts.visitEachChild(element, decoratorDownlevelVisitor, context);
                var decoratorsToKeep = [];
                var toLower = [];
                var decorators = host.getDecoratorsOfDeclaration(element) || [];
                try {
                    for (var decorators_1 = tslib_1.__values(decorators), decorators_1_1 = decorators_1.next(); !decorators_1_1.done; decorators_1_1 = decorators_1.next()) {
                        var decorator = decorators_1_1.value;
                        // We only deal with concrete nodes in TypeScript sources, so we don't
                        // need to handle synthetically created decorators.
                        var decoratorNode = decorator.node;
                        if (!isAngularDecorator(decorator, isCore)) {
                            decoratorsToKeep.push(decoratorNode);
                            continue;
                        }
                        toLower.push(decoratorNode);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (decorators_1_1 && !decorators_1_1.done && (_a = decorators_1.return)) _a.call(decorators_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                if (!toLower.length)
                    return [undefined, element, []];
                if (!element.name || !ts.isIdentifier(element.name)) {
                    // Method has a weird name, e.g.
                    //   [Symbol.foo]() {...}
                    diagnostics.push({
                        file: element.getSourceFile(),
                        start: element.getStart(),
                        length: element.getEnd() - element.getStart(),
                        messageText: "Cannot process decorators for class element with non-analyzable name.",
                        category: ts.DiagnosticCategory.Error,
                        code: 0,
                    });
                    return [undefined, element, []];
                }
                var name = element.name.text;
                var mutable = ts.getMutableClone(element);
                mutable.decorators = decoratorsToKeep.length ?
                    ts.setTextRange(ts.createNodeArray(decoratorsToKeep), mutable.decorators) :
                    undefined;
                return [name, mutable, toLower];
            }
            /**
             * Transforms a constructor. Returns the transformed constructor and the list of parameter
             * information collected, consisting of decorators and optional type.
             */
            function transformConstructor(ctor) {
                var e_6, _a, e_7, _b;
                ctor = ts.visitEachChild(ctor, decoratorDownlevelVisitor, context);
                var newParameters = [];
                var oldParameters = ts.visitParameterList(ctor.parameters, decoratorDownlevelVisitor, context);
                var parametersInfo = [];
                try {
                    for (var oldParameters_1 = tslib_1.__values(oldParameters), oldParameters_1_1 = oldParameters_1.next(); !oldParameters_1_1.done; oldParameters_1_1 = oldParameters_1.next()) {
                        var param = oldParameters_1_1.value;
                        var decoratorsToKeep = [];
                        var paramInfo = { decorators: [], type: null };
                        var decorators = host.getDecoratorsOfDeclaration(param) || [];
                        try {
                            for (var decorators_2 = (e_7 = void 0, tslib_1.__values(decorators)), decorators_2_1 = decorators_2.next(); !decorators_2_1.done; decorators_2_1 = decorators_2.next()) {
                                var decorator = decorators_2_1.value;
                                // We only deal with concrete nodes in TypeScript sources, so we don't
                                // need to handle synthetically created decorators.
                                var decoratorNode = decorator.node;
                                if (!isAngularDecorator(decorator, isCore)) {
                                    decoratorsToKeep.push(decoratorNode);
                                    continue;
                                }
                                paramInfo.decorators.push(decoratorNode);
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (decorators_2_1 && !decorators_2_1.done && (_b = decorators_2.return)) _b.call(decorators_2);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                        if (param.type) {
                            // param has a type provided, e.g. "foo: Bar".
                            // The type will be emitted as a value expression in entityNameToExpression, which takes
                            // care not to emit anything for types that cannot be expressed as a value (e.g.
                            // interfaces).
                            paramInfo.type = param.type;
                        }
                        parametersInfo.push(paramInfo);
                        var newParam = ts.updateParameter(param, 
                        // Must pass 'undefined' to avoid emitting decorator metadata.
                        decoratorsToKeep.length ? decoratorsToKeep : undefined, param.modifiers, param.dotDotDotToken, param.name, param.questionToken, param.type, param.initializer);
                        newParameters.push(newParam);
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (oldParameters_1_1 && !oldParameters_1_1.done && (_a = oldParameters_1.return)) _a.call(oldParameters_1);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                var updated = ts.updateConstructor(ctor, ctor.decorators, ctor.modifiers, newParameters, ts.visitFunctionBody(ctor.body, decoratorDownlevelVisitor, context));
                return [updated, parametersInfo];
            }
            /**
             * Transforms a single class declaration:
             * - dispatches to strip decorators on members
             * - converts decorators on the class to annotations
             * - creates a ctorParameters property
             * - creates a propDecorators property
             */
            function transformClassDeclaration(classDecl) {
                var e_8, _a, e_9, _b;
                classDecl = ts.getMutableClone(classDecl);
                var newMembers = [];
                var decoratedProperties = new Map();
                var classParameters = null;
                try {
                    for (var _c = tslib_1.__values(classDecl.members), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var member = _d.value;
                        switch (member.kind) {
                            case ts.SyntaxKind.PropertyDeclaration:
                            case ts.SyntaxKind.GetAccessor:
                            case ts.SyntaxKind.SetAccessor:
                            case ts.SyntaxKind.MethodDeclaration: {
                                var _e = tslib_1.__read(transformClassElement(member), 3), name = _e[0], newMember = _e[1], decorators = _e[2];
                                newMembers.push(newMember);
                                if (name)
                                    decoratedProperties.set(name, decorators);
                                continue;
                            }
                            case ts.SyntaxKind.Constructor: {
                                var ctor = member;
                                if (!ctor.body)
                                    break;
                                var _f = tslib_1.__read(transformConstructor(member), 2), newMember = _f[0], parametersInfo = _f[1];
                                classParameters = parametersInfo;
                                newMembers.push(newMember);
                                continue;
                            }
                            default:
                                break;
                        }
                        newMembers.push(ts.visitEachChild(member, decoratorDownlevelVisitor, context));
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                // The `ReflectionHost.getDecoratorsOfDeclaration()` method will not return certain kinds of
                // decorators that will never be Angular decorators. So we cannot rely on it to capture all
                // the decorators that should be kept. Instead we start off with a set of the raw decorators
                // on the class, and only remove the ones that have been identified for downleveling.
                var decoratorsToKeep = new Set(classDecl.decorators);
                var possibleAngularDecorators = host.getDecoratorsOfDeclaration(classDecl) || [];
                var hasAngularDecorator = false;
                var decoratorsToLower = [];
                try {
                    for (var possibleAngularDecorators_1 = tslib_1.__values(possibleAngularDecorators), possibleAngularDecorators_1_1 = possibleAngularDecorators_1.next(); !possibleAngularDecorators_1_1.done; possibleAngularDecorators_1_1 = possibleAngularDecorators_1.next()) {
                        var decorator = possibleAngularDecorators_1_1.value;
                        // We only deal with concrete nodes in TypeScript sources, so we don't
                        // need to handle synthetically created decorators.
                        var decoratorNode = decorator.node;
                        var isNgDecorator = isAngularDecorator(decorator, isCore);
                        // Keep track if we come across an Angular class decorator. This is used
                        // for to determine whether constructor parameters should be captured or not.
                        if (isNgDecorator) {
                            hasAngularDecorator = true;
                        }
                        if (isNgDecorator && !skipClassDecorators) {
                            decoratorsToLower.push(extractMetadataFromSingleDecorator(decoratorNode, diagnostics));
                            decoratorsToKeep.delete(decoratorNode);
                        }
                    }
                }
                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                finally {
                    try {
                        if (possibleAngularDecorators_1_1 && !possibleAngularDecorators_1_1.done && (_b = possibleAngularDecorators_1.return)) _b.call(possibleAngularDecorators_1);
                    }
                    finally { if (e_9) throw e_9.error; }
                }
                if (decoratorsToLower.length) {
                    newMembers.push(createDecoratorClassProperty(decoratorsToLower));
                }
                if (classParameters) {
                    if (hasAngularDecorator || classParameters.some(function (p) { return !!p.decorators.length; })) {
                        // Capture constructor parameters if the class has Angular decorator applied,
                        // or if any of the parameters has decorators applied directly.
                        newMembers.push(createCtorParametersClassProperty(diagnostics, entityNameToExpression, classParameters, isClosureCompilerEnabled));
                    }
                }
                if (decoratedProperties.size) {
                    newMembers.push(createPropDecoratorsClassProperty(diagnostics, decoratedProperties));
                }
                var members = ts.setTextRange(ts.createNodeArray(newMembers, classDecl.members.hasTrailingComma), classDecl.members);
                return ts.updateClassDeclaration(classDecl, decoratorsToKeep.size ? Array.from(decoratorsToKeep) : undefined, classDecl.modifiers, classDecl.name, classDecl.typeParameters, classDecl.heritageClauses, members);
            }
            /**
             * Transformer visitor that looks for Angular decorators and replaces them with
             * downleveled static properties. Also collects constructor type metadata for
             * class declaration that are decorated with an Angular decorator.
             */
            function decoratorDownlevelVisitor(node) {
                if (ts.isClassDeclaration(node)) {
                    return transformClassDeclaration(node);
                }
                return ts.visitEachChild(node, decoratorDownlevelVisitor, context);
            }
            return function (sf) {
                // Downlevel decorators and constructor parameter types. We will keep track of all
                // referenced constructor parameter types so that we can instruct TypeScript to
                // not elide their imports if they previously were only type-only.
                return ts.visitEachChild(sf, decoratorDownlevelVisitor, context);
            };
        };
    }
    exports.getDownlevelDecoratorsTransform = getDownlevelDecoratorsTransform;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmxldmVsX2RlY29yYXRvcnNfdHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy90cmFuc2Zvcm1lcnMvZG93bmxldmVsX2RlY29yYXRvcnNfdHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakMsNEhBQW1IO0lBRW5IOzs7T0FHRztJQUNILFNBQVMsa0JBQWtCLENBQUMsU0FBb0IsRUFBRSxNQUFlO1FBQy9ELE9BQU8sTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxJQUFJLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssZUFBZSxDQUFDLENBQUM7SUFDNUYsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQW9CRTtJQUVGOzs7T0FHRztJQUNILFNBQVMsNkJBQTZCO1FBQ3BDLElBQU0sWUFBWSxHQUFxQixFQUFFLENBQUM7UUFDMUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsdUJBQXVCLENBQ3hDLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUM1QixFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDeEYsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsdUJBQXVCLENBQ3hDLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxFQUM5RCxFQUFFLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxTQUFTLENB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QkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQzNFLFNBQVMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxlQUFlLEVBQ3hGLE9BQU8sQ0FBQyxDQUFDO1lBQ2YsQ0FBQztZQUVEOzs7O2VBSUc7WUFDSCxTQUFTLHlCQUF5QixDQUFDLElBQWE7Z0JBQzlDLElBQUksRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFO29CQUMvQixPQUFPLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN4QztnQkFDRCxPQUFPLEVBQUUsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLHlCQUF5QixFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3JFLENBQUM7WUFFRCxPQUFPLFVBQUMsRUFBaUI7Z0JBQ3ZCLGtGQUFrRjtnQkFDbEYsK0VBQStFO2dCQUMvRSxrRUFBa0U7Z0JBQ2xFLE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUseUJBQXlCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbkUsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQXhRRCwwRUF3UUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge0RlY29yYXRvciwgUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uL25ndHNjL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtpc0FsaWFzSW1wb3J0RGVjbGFyYXRpb24sIGxvYWRJc1JlZmVyZW5jZWRBbGlhc0RlY2xhcmF0aW9uUGF0Y2h9IGZyb20gJy4vcGF0Y2hfYWxpYXNfcmVmZXJlbmNlX3Jlc29sdXRpb24nO1xuXG4vKipcbiAqIFdoZXRoZXIgYSBnaXZlbiBkZWNvcmF0b3Igc2hvdWxkIGJlIHRyZWF0ZWQgYXMgYW4gQW5ndWxhciBkZWNvcmF0b3IuXG4gKiBFaXRoZXIgaXQncyB1c2VkIGluIEBhbmd1bGFyL2NvcmUsIG9yIGl0J3MgaW1wb3J0ZWQgZnJvbSB0aGVyZS5cbiAqL1xuZnVuY3Rpb24gaXNBbmd1bGFyRGVjb3JhdG9yKGRlY29yYXRvcjogRGVjb3JhdG9yLCBpc0NvcmU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzQ29yZSB8fCAoZGVjb3JhdG9yLmltcG9ydCAhPT0gbnVsbCAmJiBkZWNvcmF0b3IuaW1wb3J0LmZyb20gPT09ICdAYW5ndWxhci9jb3JlJyk7XG59XG5cbi8qXG4gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gIENvZGUgYmVsb3cgaGFzIGJlZW4gZXh0cmFjdGVkIGZyb20gdGhlIHRzaWNrbGUgZGVjb3JhdG9yIGRvd25sZXZlbCB0cmFuc2Zvcm1lclxuICBhbmQgYSBmZXcgbG9jYWwgbW9kaWZpY2F0aW9ucyBoYXZlIGJlZW4gYXBwbGllZDpcblxuICAgIDEuIFRzaWNrbGUgYnkgZGVmYXVsdCBwcm9jZXNzZWQgYWxsIGRlY29yYXRvcnMgdGhhdCBoYWQgdGhlIGBAQW5ub3RhdGlvbmAgSlNEb2MuXG4gICAgICAgV2UgbW9kaWZpZWQgdGhlIHRyYW5zZm9ybSB0byBvbmx5IGJlIGNvbmNlcm5lZCB3aXRoIGtub3duIEFuZ3VsYXIgZGVjb3JhdG9ycy5cbiAgICAyLiBUc2lja2xlIGJ5IGRlZmF1bHQgYWRkZWQgYEBub2NvbGxhcHNlYCB0byBhbGwgZ2VuZXJhdGVkIGBjdG9yUGFyYW1ldGVyc2AgcHJvcGVydGllcy5cbiAgICAgICBXZSBvbmx5IGRvIHRoaXMgd2hlbiBgYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXJgIGlzIGVuYWJsZWQuXG4gICAgMy4gVHNpY2tsZSBkb2VzIG5vdCBoYW5kbGUgdW5pb24gdHlwZXMgZm9yIGRlcGVuZGVuY3kgaW5qZWN0aW9uLiBpLmUuIGlmIGEgaW5qZWN0ZWQgdHlwZVxuICAgICAgIGlzIGRlbm90ZWQgd2l0aCBgQE9wdGlvbmFsYCwgdGhlIGFjdHVhbCB0eXBlIGNvdWxkIGJlIHNldCB0byBgVCB8IG51bGxgLlxuICAgICAgIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci1jbGkvY29tbWl0LzgyNjgwM2QwNzM2YjgwNzg2N2NhZmY5Zjg5MDNlNTA4OTcwYWQ1ZTQuXG4gICAgNC4gVHNpY2tsZSByZWxpZWQgb24gYGVtaXREZWNvcmF0b3JNZXRhZGF0YWAgdG8gYmUgc2V0IHRvIGB0cnVlYC4gVGhpcyBpcyBkdWUgdG8gYSBsaW1pdGF0aW9uXG4gICAgICAgaW4gVHlwZVNjcmlwdCB0cmFuc2Zvcm1lcnMgdGhhdCBuZXZlciBoYXMgYmVlbiBmaXhlZC4gV2Ugd2VyZSBhYmxlIHRvIHdvcmsgYXJvdW5kIHRoaXNcbiAgICAgICBsaW1pdGF0aW9uIHNvIHRoYXQgYGVtaXREZWNvcmF0b3JNZXRhZGF0YWAgZG9lc24ndCBuZWVkIHRvIGJlIHNwZWNpZmllZC5cbiAgICAgICBTZWU6IGBwYXRjaEFsaWFzUmVmZXJlbmNlUmVzb2x1dGlvbmAgZm9yIG1vcmUgZGV0YWlscy5cblxuICBIZXJlIGlzIGEgbGluayB0byB0aGUgdHNpY2tsZSByZXZpc2lvbiBvbiB3aGljaCB0aGlzIHRyYW5zZm9ybWVyIGlzIGJhc2VkOlxuICBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci90c2lja2xlL2Jsb2IvZmFlMDZiZWNiMTU3MGY0OTE4MDYwNjBkODNmMjlmMmQ1MGM0M2NkZC9zcmMvZGVjb3JhdG9yX2Rvd25sZXZlbF90cmFuc2Zvcm1lci50c1xuICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuKi9cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBBU1QgZm9yIHRoZSBkZWNvcmF0b3IgZmllbGQgdHlwZSBhbm5vdGF0aW9uLCB3aGljaCBoYXMgdGhlIGZvcm1cbiAqICAgICB7IHR5cGU6IEZ1bmN0aW9uLCBhcmdzPzogYW55W10gfVtdXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZURlY29yYXRvckludm9jYXRpb25UeXBlKCk6IHRzLlR5cGVOb2RlIHtcbiAgY29uc3QgdHlwZUVsZW1lbnRzOiB0cy5UeXBlRWxlbWVudFtdID0gW107XG4gIHR5cGVFbGVtZW50cy5wdXNoKHRzLmNyZWF0ZVByb3BlcnR5U2lnbmF0dXJlKFxuICAgICAgdW5kZWZpbmVkLCAndHlwZScsIHVuZGVmaW5lZCxcbiAgICAgIHRzLmNyZWF0ZVR5cGVSZWZlcmVuY2VOb2RlKHRzLmNyZWF0ZUlkZW50aWZpZXIoJ0Z1bmN0aW9uJyksIHVuZGVmaW5lZCksIHVuZGVmaW5lZCkpO1xuICB0eXBlRWxlbWVudHMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eVNpZ25hdHVyZShcbiAgICAgIHVuZGVmaW5lZCwgJ2FyZ3MnLCB0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLlF1ZXN0aW9uVG9rZW4pLFxuICAgICAgdHMuY3JlYXRlQXJyYXlUeXBlTm9kZSh0cy5jcmVhdGVLZXl3b3JkVHlwZU5vZGUodHMuU3ludGF4S2luZC5BbnlLZXl3b3JkKSksIHVuZGVmaW5lZCkpO1xuICByZXR1cm4gdHMuY3JlYXRlQXJyYXlUeXBlTm9kZSh0cy5jcmVhdGVUeXBlTGl0ZXJhbE5vZGUodHlwZUVsZW1lbnRzKSk7XG59XG5cbi8qKlxuICogRXh0cmFjdHMgdGhlIHR5cGUgb2YgdGhlIGRlY29yYXRvciAodGhlIGZ1bmN0aW9uIG9yIGV4cHJlc3Npb24gaW52b2tlZCksIGFzIHdlbGwgYXMgYWxsIHRoZVxuICogYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgZGVjb3JhdG9yLiBSZXR1cm5zIGFuIEFTVCB3aXRoIHRoZSBmb3JtOlxuICpcbiAqICAgICAvLyBGb3IgQGRlY29yYXRvcihhcmcxLCBhcmcyKVxuICogICAgIHsgdHlwZTogZGVjb3JhdG9yLCBhcmdzOiBbYXJnMSwgYXJnMl0gfVxuICovXG5mdW5jdGlvbiBleHRyYWN0TWV0YWRhdGFGcm9tU2luZ2xlRGVjb3JhdG9yKFxuICAgIGRlY29yYXRvcjogdHMuRGVjb3JhdG9yLCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdKTogdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24ge1xuICBjb25zdCBtZXRhZGF0YVByb3BlcnRpZXM6IHRzLk9iamVjdExpdGVyYWxFbGVtZW50TGlrZVtdID0gW107XG4gIGNvbnN0IGV4cHIgPSBkZWNvcmF0b3IuZXhwcmVzc2lvbjtcbiAgc3dpdGNoIChleHByLmtpbmQpIHtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcjpcbiAgICAgIC8vIFRoZSBkZWNvcmF0b3Igd2FzIGEgcGxhaW4gQEZvby5cbiAgICAgIG1ldGFkYXRhUHJvcGVydGllcy5wdXNoKHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCgndHlwZScsIGV4cHIpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbjpcbiAgICAgIC8vIFRoZSBkZWNvcmF0b3Igd2FzIGEgY2FsbCwgbGlrZSBARm9vKGJhcikuXG4gICAgICBjb25zdCBjYWxsID0gZXhwciBhcyB0cy5DYWxsRXhwcmVzc2lvbjtcbiAgICAgIG1ldGFkYXRhUHJvcGVydGllcy5wdXNoKHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCgndHlwZScsIGNhbGwuZXhwcmVzc2lvbikpO1xuICAgICAgaWYgKGNhbGwuYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBhcmdzOiB0cy5FeHByZXNzaW9uW10gPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBhcmcgb2YgY2FsbC5hcmd1bWVudHMpIHtcbiAgICAgICAgICBhcmdzLnB1c2goYXJnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhcmdzQXJyYXlMaXRlcmFsID0gdHMuY3JlYXRlQXJyYXlMaXRlcmFsKGFyZ3MpO1xuICAgICAgICBhcmdzQXJyYXlMaXRlcmFsLmVsZW1lbnRzLmhhc1RyYWlsaW5nQ29tbWEgPSB0cnVlO1xuICAgICAgICBtZXRhZGF0YVByb3BlcnRpZXMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoJ2FyZ3MnLCBhcmdzQXJyYXlMaXRlcmFsKSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgZGlhZ25vc3RpY3MucHVzaCh7XG4gICAgICAgIGZpbGU6IGRlY29yYXRvci5nZXRTb3VyY2VGaWxlKCksXG4gICAgICAgIHN0YXJ0OiBkZWNvcmF0b3IuZ2V0U3RhcnQoKSxcbiAgICAgICAgbGVuZ3RoOiBkZWNvcmF0b3IuZ2V0RW5kKCkgLSBkZWNvcmF0b3IuZ2V0U3RhcnQoKSxcbiAgICAgICAgbWVzc2FnZVRleHQ6XG4gICAgICAgICAgICBgJHt0cy5TeW50YXhLaW5kW2RlY29yYXRvci5raW5kXX0gbm90IGltcGxlbWVudGVkIGluIGdhdGhlcmluZyBkZWNvcmF0b3IgbWV0YWRhdGEuYCxcbiAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgY29kZTogMCxcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIHRzLmNyZWF0ZU9iamVjdExpdGVyYWwobWV0YWRhdGFQcm9wZXJ0aWVzKTtcbn1cblxuLyoqXG4gKiBUYWtlcyBhIGxpc3Qgb2YgZGVjb3JhdG9yIG1ldGFkYXRhIG9iamVjdCBBU1RzIGFuZCBwcm9kdWNlcyBhbiBBU1QgZm9yIGFcbiAqIHN0YXRpYyBjbGFzcyBwcm9wZXJ0eSBvZiBhbiBhcnJheSBvZiB0aG9zZSBtZXRhZGF0YSBvYmplY3RzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVEZWNvcmF0b3JDbGFzc1Byb3BlcnR5KGRlY29yYXRvckxpc3Q6IHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uW10pIHtcbiAgY29uc3QgbW9kaWZpZXIgPSB0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLlN0YXRpY0tleXdvcmQpO1xuICBjb25zdCB0eXBlID0gY3JlYXRlRGVjb3JhdG9ySW52b2NhdGlvblR5cGUoKTtcbiAgY29uc3QgaW5pdGlhbGl6ZXIgPSB0cy5jcmVhdGVBcnJheUxpdGVyYWwoZGVjb3JhdG9yTGlzdCwgdHJ1ZSk7XG4gIC8vIE5COiB0aGUgLmRlY29yYXRvcnMgcHJvcGVydHkgZG9lcyBub3QgZ2V0IGEgQG5vY29sbGFwc2UgcHJvcGVydHkuIFRoZXJlIGlzXG4gIC8vIG5vIGdvb2QgcmVhc29uIHdoeSAtIGl0IG1lYW5zIC5kZWNvcmF0b3JzIGlzIG5vdCBydW50aW1lIGFjY2Vzc2libGUgaWYgeW91XG4gIC8vIGNvbXBpbGUgd2l0aCBjb2xsYXBzZSBwcm9wZXJ0aWVzLCB3aGVyZWFzIHByb3BEZWNvcmF0b3JzIGlzLCB3aGljaCBkb2Vzbid0XG4gIC8vIGZvbGxvdyBhbnkgc3RyaW5nZW50IGxvZ2ljLiBIb3dldmVyIHRoaXMgaGFzIGJlZW4gdGhlIGNhc2UgcHJldmlvdXNseSwgYW5kXG4gIC8vIGFkZGluZyBpdCBiYWNrIGluIGxlYWRzIHRvIHN1YnN0YW50aWFsIGNvZGUgc2l6ZSBpbmNyZWFzZXMgYXMgQ2xvc3VyZSBmYWlsc1xuICAvLyB0byB0cmVlIHNoYWtlIHRoZXNlIHByb3BzIHdpdGhvdXQgQG5vY29sbGFwc2UuXG4gIHJldHVybiB0cy5jcmVhdGVQcm9wZXJ0eSh1bmRlZmluZWQsIFttb2RpZmllcl0sICdkZWNvcmF0b3JzJywgdW5kZWZpbmVkLCB0eXBlLCBpbml0aWFsaXplcik7XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgQVNUIGZvciB0aGUgJ2N0b3JQYXJhbWV0ZXJzJyBmaWVsZCB0eXBlIGFubm90YXRpb246XG4gKiAgICgpID0+ICh7IHR5cGU6IGFueSwgZGVjb3JhdG9ycz86IHt0eXBlOiBGdW5jdGlvbiwgYXJncz86IGFueVtdfVtdIH18bnVsbClbXVxuICovXG5mdW5jdGlvbiBjcmVhdGVDdG9yUGFyYW1ldGVyc0NsYXNzUHJvcGVydHlUeXBlKCk6IHRzLlR5cGVOb2RlIHtcbiAgLy8gU29ycnkgYWJvdXQgdGhpcy4gVHJ5IHJlYWRpbmcganVzdCB0aGUgc3RyaW5nIGxpdGVyYWxzIGJlbG93LlxuICBjb25zdCB0eXBlRWxlbWVudHM6IHRzLlR5cGVFbGVtZW50W10gPSBbXTtcbiAgdHlwZUVsZW1lbnRzLnB1c2godHMuY3JlYXRlUHJvcGVydHlTaWduYXR1cmUoXG4gICAgICB1bmRlZmluZWQsICd0eXBlJywgdW5kZWZpbmVkLFxuICAgICAgdHMuY3JlYXRlVHlwZVJlZmVyZW5jZU5vZGUodHMuY3JlYXRlSWRlbnRpZmllcignYW55JyksIHVuZGVmaW5lZCksIHVuZGVmaW5lZCkpO1xuICB0eXBlRWxlbWVudHMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eVNpZ25hdHVyZShcbiAgICAgIHVuZGVmaW5lZCwgJ2RlY29yYXRvcnMnLCB0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLlF1ZXN0aW9uVG9rZW4pLFxuICAgICAgdHMuY3JlYXRlQXJyYXlUeXBlTm9kZSh0cy5jcmVhdGVUeXBlTGl0ZXJhbE5vZGUoW1xuICAgICAgICB0cy5jcmVhdGVQcm9wZXJ0eVNpZ25hdHVyZShcbiAgICAgICAgICAgIHVuZGVmaW5lZCwgJ3R5cGUnLCB1bmRlZmluZWQsXG4gICAgICAgICAgICB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZSh0cy5jcmVhdGVJZGVudGlmaWVyKCdGdW5jdGlvbicpLCB1bmRlZmluZWQpLCB1bmRlZmluZWQpLFxuICAgICAgICB0cy5jcmVhdGVQcm9wZXJ0eVNpZ25hdHVyZShcbiAgICAgICAgICAgIHVuZGVmaW5lZCwgJ2FyZ3MnLCB0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLlF1ZXN0aW9uVG9rZW4pLFxuICAgICAgICAgICAgdHMuY3JlYXRlQXJyYXlUeXBlTm9kZShcbiAgICAgICAgICAgICAgICB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZSh0cy5jcmVhdGVJZGVudGlmaWVyKCdhbnknKSwgdW5kZWZpbmVkKSksXG4gICAgICAgICAgICB1bmRlZmluZWQpLFxuICAgICAgXSkpLFxuICAgICAgdW5kZWZpbmVkKSk7XG5cbiAgcmV0dXJuIHRzLmNyZWF0ZUZ1bmN0aW9uVHlwZU5vZGUodW5kZWZpbmVkLCBbXSwgdHMuY3JlYXRlQXJyYXlUeXBlTm9kZSh0cy5jcmVhdGVVbmlvblR5cGVOb2RlKFtcbiAgICB0cy5jcmVhdGVUeXBlTGl0ZXJhbE5vZGUodHlwZUVsZW1lbnRzKSxcbiAgICB0cy5jcmVhdGVMaXRlcmFsVHlwZU5vZGUodHMuY3JlYXRlTnVsbCgpKSxcbiAgXSkpKTtcbn1cblxuLyoqXG4gKiBTZXRzIGEgQ2xvc3VyZSBcXEBub2NvbGxhcHNlIHN5bnRoZXRpYyBjb21tZW50IG9uIHRoZSBnaXZlbiBub2RlLiBUaGlzIHByZXZlbnRzIENsb3N1cmUgQ29tcGlsZXJcbiAqIGZyb20gY29sbGFwc2luZyB0aGUgYXBwYXJlbnRseSBzdGF0aWMgcHJvcGVydHksIHdoaWNoIHdvdWxkIG1ha2UgaXQgaW1wb3NzaWJsZSB0byBmaW5kIGZvciBjb2RlXG4gKiB0cnlpbmcgdG8gZGV0ZWN0IGl0IGF0IHJ1bnRpbWUuXG4gKi9cbmZ1bmN0aW9uIGFkZE5vQ29sbGFwc2VDb21tZW50KG46IHRzLk5vZGUpIHtcbiAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKG4sIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6IHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJyogQG5vY29sbGFwc2UgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzVHJhaWxpbmdOZXdMaW5lOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XSk7XG59XG5cbi8qKlxuICogY3JlYXRlQ3RvclBhcmFtZXRlcnNDbGFzc1Byb3BlcnR5IGNyZWF0ZXMgYSBzdGF0aWMgJ2N0b3JQYXJhbWV0ZXJzJyBwcm9wZXJ0eSBjb250YWluaW5nXG4gKiBkb3dubGV2ZWxlZCBkZWNvcmF0b3IgaW5mb3JtYXRpb24uXG4gKlxuICogVGhlIHByb3BlcnR5IGNvbnRhaW5zIGFuIGFycm93IGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBhcnJheSBvZiBvYmplY3QgbGl0ZXJhbHMgb2YgdGhlIHNoYXBlOlxuICogICAgIHN0YXRpYyBjdG9yUGFyYW1ldGVycyA9ICgpID0+IFt7XG4gKiAgICAgICB0eXBlOiBTb21lQ2xhc3N8dW5kZWZpbmVkLCAgLy8gdGhlIHR5cGUgb2YgdGhlIHBhcmFtIHRoYXQncyBkZWNvcmF0ZWQsIGlmIGl0J3MgYSB2YWx1ZS5cbiAqICAgICAgIGRlY29yYXRvcnM6IFt7XG4gKiAgICAgICAgIHR5cGU6IERlY29yYXRvckZuLCAgLy8gdGhlIHR5cGUgb2YgdGhlIGRlY29yYXRvciB0aGF0J3MgaW52b2tlZC5cbiAqICAgICAgICAgYXJnczogW0FSR1NdLCAgICAgICAvLyB0aGUgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgZGVjb3JhdG9yLlxuICogICAgICAgfV1cbiAqICAgICB9XTtcbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ3RvclBhcmFtZXRlcnNDbGFzc1Byb3BlcnR5KFxuICAgIGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10sXG4gICAgZW50aXR5TmFtZVRvRXhwcmVzc2lvbjogKG46IHRzLkVudGl0eU5hbWUpID0+IHRzLkV4cHJlc3Npb24gfCB1bmRlZmluZWQsXG4gICAgY3RvclBhcmFtZXRlcnM6IFBhcmFtZXRlckRlY29yYXRpb25JbmZvW10sXG4gICAgaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkOiBib29sZWFuKTogdHMuUHJvcGVydHlEZWNsYXJhdGlvbiB7XG4gIGNvbnN0IHBhcmFtczogdHMuRXhwcmVzc2lvbltdID0gW107XG5cbiAgZm9yIChjb25zdCBjdG9yUGFyYW0gb2YgY3RvclBhcmFtZXRlcnMpIHtcbiAgICBpZiAoIWN0b3JQYXJhbS50eXBlICYmIGN0b3JQYXJhbS5kZWNvcmF0b3JzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcGFyYW1zLnB1c2godHMuY3JlYXRlTnVsbCgpKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmFtVHlwZSA9IGN0b3JQYXJhbS50eXBlID9cbiAgICAgICAgdHlwZVJlZmVyZW5jZVRvRXhwcmVzc2lvbihlbnRpdHlOYW1lVG9FeHByZXNzaW9uLCBjdG9yUGFyYW0udHlwZSkgOlxuICAgICAgICB1bmRlZmluZWQ7XG4gICAgY29uc3QgbWVtYmVycyA9XG4gICAgICAgIFt0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoJ3R5cGUnLCBwYXJhbVR5cGUgfHwgdHMuY3JlYXRlSWRlbnRpZmllcigndW5kZWZpbmVkJykpXTtcblxuICAgIGNvbnN0IGRlY29yYXRvcnM6IHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGRlY28gb2YgY3RvclBhcmFtLmRlY29yYXRvcnMpIHtcbiAgICAgIGRlY29yYXRvcnMucHVzaChleHRyYWN0TWV0YWRhdGFGcm9tU2luZ2xlRGVjb3JhdG9yKGRlY28sIGRpYWdub3N0aWNzKSk7XG4gICAgfVxuICAgIGlmIChkZWNvcmF0b3JzLmxlbmd0aCkge1xuICAgICAgbWVtYmVycy5wdXNoKHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCgnZGVjb3JhdG9ycycsIHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChkZWNvcmF0b3JzKSkpO1xuICAgIH1cbiAgICBwYXJhbXMucHVzaCh0cy5jcmVhdGVPYmplY3RMaXRlcmFsKG1lbWJlcnMpKTtcbiAgfVxuXG4gIGNvbnN0IGluaXRpYWxpemVyID0gdHMuY3JlYXRlQXJyb3dGdW5jdGlvbihcbiAgICAgIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBbXSwgdW5kZWZpbmVkLCB0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLkVxdWFsc0dyZWF0ZXJUaGFuVG9rZW4pLFxuICAgICAgdHMuY3JlYXRlQXJyYXlMaXRlcmFsKHBhcmFtcywgdHJ1ZSkpO1xuICBjb25zdCB0eXBlID0gY3JlYXRlQ3RvclBhcmFtZXRlcnNDbGFzc1Byb3BlcnR5VHlwZSgpO1xuICBjb25zdCBjdG9yUHJvcCA9IHRzLmNyZWF0ZVByb3BlcnR5KFxuICAgICAgdW5kZWZpbmVkLCBbdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5TdGF0aWNLZXl3b3JkKV0sICdjdG9yUGFyYW1ldGVycycsIHVuZGVmaW5lZCwgdHlwZSxcbiAgICAgIGluaXRpYWxpemVyKTtcbiAgaWYgKGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCkge1xuICAgIGFkZE5vQ29sbGFwc2VDb21tZW50KGN0b3JQcm9wKTtcbiAgfVxuICByZXR1cm4gY3RvclByb3A7XG59XG5cbi8qKlxuICogY3JlYXRlUHJvcERlY29yYXRvcnNDbGFzc1Byb3BlcnR5IGNyZWF0ZXMgYSBzdGF0aWMgJ3Byb3BEZWNvcmF0b3JzJyBwcm9wZXJ0eSBjb250YWluaW5nIHR5cGVcbiAqIGluZm9ybWF0aW9uIGZvciBldmVyeSBwcm9wZXJ0eSB0aGF0IGhhcyBhIGRlY29yYXRvciBhcHBsaWVkLlxuICpcbiAqICAgICBzdGF0aWMgcHJvcERlY29yYXRvcnM6IHtba2V5OiBzdHJpbmddOiB7dHlwZTogRnVuY3Rpb24sIGFyZ3M/OiBhbnlbXX1bXX0gPSB7XG4gKiAgICAgICBwcm9wQTogW3t0eXBlOiBNeURlY29yYXRvciwgYXJnczogWzEsIDJdfSwgLi4uXSxcbiAqICAgICAgIC4uLlxuICogICAgIH07XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVByb3BEZWNvcmF0b3JzQ2xhc3NQcm9wZXJ0eShcbiAgICBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdLCBwcm9wZXJ0aWVzOiBNYXA8c3RyaW5nLCB0cy5EZWNvcmF0b3JbXT4pOiB0cy5Qcm9wZXJ0eURlY2xhcmF0aW9uIHtcbiAgLy8gIGBzdGF0aWMgcHJvcERlY29yYXRvcnM6IHtba2V5OiBzdHJpbmddOiBgICsge3R5cGU6IEZ1bmN0aW9uLCBhcmdzPzogYW55W119W10gKyBgfSA9IHtcXG5gKTtcbiAgY29uc3QgZW50cmllczogdHMuT2JqZWN0TGl0ZXJhbEVsZW1lbnRMaWtlW10gPSBbXTtcbiAgZm9yIChjb25zdCBbbmFtZSwgZGVjb3JhdG9yc10gb2YgcHJvcGVydGllcy5lbnRyaWVzKCkpIHtcbiAgICBlbnRyaWVzLnB1c2godHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KFxuICAgICAgICBuYW1lLFxuICAgICAgICB0cy5jcmVhdGVBcnJheUxpdGVyYWwoXG4gICAgICAgICAgICBkZWNvcmF0b3JzLm1hcChkZWNvID0+IGV4dHJhY3RNZXRhZGF0YUZyb21TaW5nbGVEZWNvcmF0b3IoZGVjbywgZGlhZ25vc3RpY3MpKSkpKTtcbiAgfVxuICBjb25zdCBpbml0aWFsaXplciA9IHRzLmNyZWF0ZU9iamVjdExpdGVyYWwoZW50cmllcywgdHJ1ZSk7XG4gIGNvbnN0IHR5cGUgPSB0cy5jcmVhdGVUeXBlTGl0ZXJhbE5vZGUoW3RzLmNyZWF0ZUluZGV4U2lnbmF0dXJlKFxuICAgICAgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFt0cy5jcmVhdGVQYXJhbWV0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsICdrZXknLCB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZVR5cGVSZWZlcmVuY2VOb2RlKCdzdHJpbmcnLCB1bmRlZmluZWQpLCB1bmRlZmluZWQpXSxcbiAgICAgIGNyZWF0ZURlY29yYXRvckludm9jYXRpb25UeXBlKCkpXSk7XG4gIHJldHVybiB0cy5jcmVhdGVQcm9wZXJ0eShcbiAgICAgIHVuZGVmaW5lZCwgW3RzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuU3RhdGljS2V5d29yZCldLCAncHJvcERlY29yYXRvcnMnLCB1bmRlZmluZWQsIHR5cGUsXG4gICAgICBpbml0aWFsaXplcik7XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBleHByZXNzaW9uIHJlcHJlc2VudGluZyB0aGUgKHBvdGVudGlhbGx5KSB2YWx1ZSBwYXJ0IGZvciB0aGUgZ2l2ZW4gbm9kZS5cbiAqXG4gKiBUaGlzIGlzIGEgcGFydGlhbCByZS1pbXBsZW1lbnRhdGlvbiBvZiBUeXBlU2NyaXB0J3Mgc2VyaWFsaXplVHlwZVJlZmVyZW5jZU5vZGUuIFRoaXMgaXMgYVxuICogd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzUxNiAoc2VyaWFsaXplVHlwZVJlZmVyZW5jZU5vZGVcbiAqIG5vdCBiZWluZyBleHBvc2VkKS4gSW4gcHJhY3RpY2UgdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBzdWZmaWNpZW50IGZvciBBbmd1bGFyJ3MgdXNlIG9mIHR5cGVcbiAqIG1ldGFkYXRhLlxuICovXG5mdW5jdGlvbiB0eXBlUmVmZXJlbmNlVG9FeHByZXNzaW9uKFxuICAgIGVudGl0eU5hbWVUb0V4cHJlc3Npb246IChuOiB0cy5FbnRpdHlOYW1lKSA9PiB0cy5FeHByZXNzaW9uIHwgdW5kZWZpbmVkLFxuICAgIG5vZGU6IHRzLlR5cGVOb2RlKTogdHMuRXhwcmVzc2lvbnx1bmRlZmluZWQge1xuICBsZXQga2luZCA9IG5vZGUua2luZDtcbiAgaWYgKHRzLmlzTGl0ZXJhbFR5cGVOb2RlKG5vZGUpKSB7XG4gICAgLy8gVHJlYXQgbGl0ZXJhbCB0eXBlcyBsaWtlIHRoZWlyIGJhc2UgdHlwZSAoYm9vbGVhbiwgc3RyaW5nLCBudW1iZXIpLlxuICAgIGtpbmQgPSBub2RlLmxpdGVyYWwua2luZDtcbiAgfVxuICBzd2l0Y2ggKGtpbmQpIHtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuRnVuY3Rpb25UeXBlOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5Db25zdHJ1Y3RvclR5cGU6XG4gICAgICByZXR1cm4gdHMuY3JlYXRlSWRlbnRpZmllcignRnVuY3Rpb24nKTtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXJyYXlUeXBlOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5UdXBsZVR5cGU6XG4gICAgICByZXR1cm4gdHMuY3JlYXRlSWRlbnRpZmllcignQXJyYXknKTtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHlwZVByZWRpY2F0ZTpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHJ1ZUtleXdvcmQ6XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLkZhbHNlS2V5d29yZDpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuQm9vbGVhbktleXdvcmQ6XG4gICAgICByZXR1cm4gdHMuY3JlYXRlSWRlbnRpZmllcignQm9vbGVhbicpO1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5TdHJpbmdLZXl3b3JkOlxuICAgICAgcmV0dXJuIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ1N0cmluZycpO1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5PYmplY3RLZXl3b3JkOlxuICAgICAgcmV0dXJuIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ09iamVjdCcpO1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5OdW1iZXJLZXl3b3JkOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5OdW1lcmljTGl0ZXJhbDpcbiAgICAgIHJldHVybiB0cy5jcmVhdGVJZGVudGlmaWVyKCdOdW1iZXInKTtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHlwZVJlZmVyZW5jZTpcbiAgICAgIGNvbnN0IHR5cGVSZWYgPSBub2RlIGFzIHRzLlR5cGVSZWZlcmVuY2VOb2RlO1xuICAgICAgLy8gSWdub3JlIGFueSBnZW5lcmljIHR5cGVzLCBqdXN0IHJldHVybiB0aGUgYmFzZSB0eXBlLlxuICAgICAgcmV0dXJuIGVudGl0eU5hbWVUb0V4cHJlc3Npb24odHlwZVJlZi50eXBlTmFtZSk7XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLlVuaW9uVHlwZTpcbiAgICAgIGNvbnN0IGNoaWxkVHlwZU5vZGVzID1cbiAgICAgICAgICAobm9kZSBhcyB0cy5VbmlvblR5cGVOb2RlKVxuICAgICAgICAgICAgICAudHlwZXMuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgdCA9PiAhKHRzLmlzTGl0ZXJhbFR5cGVOb2RlKHQpICYmIHQubGl0ZXJhbC5raW5kID09PSB0cy5TeW50YXhLaW5kLk51bGxLZXl3b3JkKSk7XG4gICAgICByZXR1cm4gY2hpbGRUeXBlTm9kZXMubGVuZ3RoID09PSAxID9cbiAgICAgICAgICB0eXBlUmVmZXJlbmNlVG9FeHByZXNzaW9uKGVudGl0eU5hbWVUb0V4cHJlc3Npb24sIGNoaWxkVHlwZU5vZGVzWzBdKSA6XG4gICAgICAgICAgdW5kZWZpbmVkO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBzeW1ib2wgcmVmZXJzIHRvIGEgdmFsdWUgdGhhdCBleGlzdHMgYXQgcnVudGltZSAoYXMgZGlzdGluY3QgZnJvbSBhIHR5cGUpLlxuICpcbiAqIEV4cGFuZHMgYWxpYXNlcywgd2hpY2ggaXMgaW1wb3J0YW50IGZvciB0aGUgY2FzZSB3aGVyZVxuICogICBpbXBvcnQgKiBhcyB4IGZyb20gJ3NvbWUtbW9kdWxlJztcbiAqIGFuZCB4IGlzIG5vdyBhIHZhbHVlICh0aGUgbW9kdWxlIG9iamVjdCkuXG4gKi9cbmZ1bmN0aW9uIHN5bWJvbElzUnVudGltZVZhbHVlKHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgc3ltYm9sOiB0cy5TeW1ib2wpOiBib29sZWFuIHtcbiAgaWYgKHN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSB7XG4gICAgc3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0QWxpYXNlZFN5bWJvbChzeW1ib2wpO1xuICB9XG5cbiAgLy8gTm90ZSB0aGF0IGNvbnN0IGVudW1zIGFyZSBhIHNwZWNpYWwgY2FzZSwgYmVjYXVzZVxuICAvLyB3aGlsZSB0aGV5IGhhdmUgYSB2YWx1ZSwgdGhleSBkb24ndCBleGlzdCBhdCBydW50aW1lLlxuICByZXR1cm4gKHN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLlZhbHVlICYgdHMuU3ltYm9sRmxhZ3MuQ29uc3RFbnVtRXhjbHVkZXMpICE9PSAwO1xufVxuXG4vKiogUGFyYW1ldGVyRGVjb3JhdGlvbkluZm8gZGVzY3JpYmVzIHRoZSBpbmZvcm1hdGlvbiBmb3IgYSBzaW5nbGUgY29uc3RydWN0b3IgcGFyYW1ldGVyLiAqL1xuaW50ZXJmYWNlIFBhcmFtZXRlckRlY29yYXRpb25JbmZvIHtcbiAgLyoqXG4gICAqIFRoZSB0eXBlIGRlY2xhcmF0aW9uIGZvciB0aGUgcGFyYW1ldGVyLiBPbmx5IHNldCBpZiB0aGUgdHlwZSBpcyBhIHZhbHVlIChlLmcuIGEgY2xhc3MsIG5vdCBhblxuICAgKiBpbnRlcmZhY2UpLlxuICAgKi9cbiAgdHlwZTogdHMuVHlwZU5vZGV8bnVsbDtcbiAgLyoqIFRoZSBsaXN0IG9mIGRlY29yYXRvcnMgZm91bmQgb24gdGhlIHBhcmFtZXRlciwgbnVsbCBpZiBub25lLiAqL1xuICBkZWNvcmF0b3JzOiB0cy5EZWNvcmF0b3JbXTtcbn1cblxuLyoqXG4gKiBHZXRzIGEgdHJhbnNmb3JtZXIgZm9yIGRvd25sZXZlbGluZyBBbmd1bGFyIGRlY29yYXRvcnMuXG4gKiBAcGFyYW0gdHlwZUNoZWNrZXIgUmVmZXJlbmNlIHRvIHRoZSBwcm9ncmFtJ3MgdHlwZSBjaGVja2VyLlxuICogQHBhcmFtIGhvc3QgUmVmbGVjdGlvbiBob3N0IHRoYXQgaXMgdXNlZCBmb3IgZGV0ZXJtaW5pbmcgZGVjb3JhdG9ycy5cbiAqIEBwYXJhbSBkaWFnbm9zdGljcyBMaXN0IHdoaWNoIHdpbGwgYmUgcG9wdWxhdGVkIHdpdGggZGlhZ25vc3RpY3MgaWYgYW55LlxuICogQHBhcmFtIGlzQ29yZSBXaGV0aGVyIHRoZSBjdXJyZW50IFR5cGVTY3JpcHQgcHJvZ3JhbSBpcyBmb3IgdGhlIGBAYW5ndWxhci9jb3JlYCBwYWNrYWdlLlxuICogQHBhcmFtIGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCBXaGV0aGVyIGNsb3N1cmUgYW5ub3RhdGlvbnMgbmVlZCB0byBiZSBhZGRlZCB3aGVyZSBuZWVkZWQuXG4gKiBAcGFyYW0gc2tpcENsYXNzRGVjb3JhdG9ycyBXaGV0aGVyIGNsYXNzIGRlY29yYXRvcnMgc2hvdWxkIGJlIHNraXBwZWQgZnJvbSBkb3dubGV2ZWxpbmcuXG4gKiAgIFRoaXMgaXMgdXNlZnVsIGZvciBKSVQgbW9kZSB3aGVyZSBjbGFzcyBkZWNvcmF0b3JzIHNob3VsZCBiZSBwcmVzZXJ2ZWQgYXMgdGhleSBjb3VsZCByZWx5XG4gKiAgIG9uIGltbWVkaWF0ZSBleGVjdXRpb24uIGUuZy4gZG93bmxldmVsaW5nIGBASW5qZWN0YWJsZWAgbWVhbnMgdGhhdCB0aGUgaW5qZWN0YWJsZSBmYWN0b3J5XG4gKiAgIGlzIG5vdCBjcmVhdGVkLCBhbmQgaW5qZWN0aW5nIHRoZSB0b2tlbiB3aWxsIG5vdCB3b3JrLiBJZiB0aGlzIGRlY29yYXRvciB3b3VsZCBub3QgYmVcbiAqICAgZG93bmxldmVsZWQsIHRoZSBgSW5qZWN0YWJsZWAgZGVjb3JhdG9yIHdpbGwgZXhlY3V0ZSBpbW1lZGlhdGVseSBvbiBmaWxlIGxvYWQsIGFuZFxuICogICBBbmd1bGFyIHdpbGwgZ2VuZXJhdGUgdGhlIGNvcnJlc3BvbmRpbmcgaW5qZWN0YWJsZSBmYWN0b3J5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RG93bmxldmVsRGVjb3JhdG9yc1RyYW5zZm9ybShcbiAgICB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIGhvc3Q6IFJlZmxlY3Rpb25Ib3N0LCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdLFxuICAgIGlzQ29yZTogYm9vbGVhbiwgaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkOiBib29sZWFuLFxuICAgIHNraXBDbGFzc0RlY29yYXRvcnM6IGJvb2xlYW4pOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCkgPT4ge1xuICAgIC8vIEVuc3VyZSB0aGF0IHJlZmVyZW5jZWQgdHlwZSBzeW1ib2xzIGFyZSBub3QgZWxpZGVkIGJ5IFR5cGVTY3JpcHQuIEltcG9ydHMgZm9yXG4gICAgLy8gc3VjaCBwYXJhbWV0ZXIgdHlwZSBzeW1ib2xzIHByZXZpb3VzbHkgY291bGQgYmUgdHlwZS1vbmx5LCBidXQgbm93IG1pZ2h0IGJlIGFsc29cbiAgICAvLyB1c2VkIGluIHRoZSBgY3RvclBhcmFtZXRlcnNgIHN0YXRpYyBwcm9wZXJ0eSBhcyBhIHZhbHVlLiBXZSB3YW50IHRvIG1ha2Ugc3VyZVxuICAgIC8vIHRoYXQgVHlwZVNjcmlwdCBkb2VzIG5vdCBlbGlkZSBpbXBvcnRzIGZvciBzdWNoIHR5cGUgcmVmZXJlbmNlcy4gUmVhZCBtb3JlXG4gICAgLy8gYWJvdXQgdGhpcyBpbiB0aGUgZGVzY3JpcHRpb24gZm9yIGBsb2FkSXNSZWZlcmVuY2VkQWxpYXNEZWNsYXJhdGlvblBhdGNoYC5cbiAgICBjb25zdCByZWZlcmVuY2VkUGFyYW1ldGVyVHlwZXMgPSBsb2FkSXNSZWZlcmVuY2VkQWxpYXNEZWNsYXJhdGlvblBhdGNoKGNvbnRleHQpO1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYW4gRW50aXR5TmFtZSAoZnJvbSBhIHR5cGUgYW5ub3RhdGlvbikgdG8gYW4gZXhwcmVzc2lvbiAoYWNjZXNzaW5nIGEgdmFsdWUpLlxuICAgICAqXG4gICAgICogRm9yIGEgZ2l2ZW4gcXVhbGlmaWVkIG5hbWUsIHRoaXMgd2Fsa3MgZGVwdGggZmlyc3QgdG8gZmluZCB0aGUgbGVmdG1vc3QgaWRlbnRpZmllcixcbiAgICAgKiBhbmQgdGhlbiBjb252ZXJ0cyB0aGUgcGF0aCBpbnRvIGEgcHJvcGVydHkgYWNjZXNzIHRoYXQgY2FuIGJlIHVzZWQgYXMgZXhwcmVzc2lvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlbnRpdHlOYW1lVG9FeHByZXNzaW9uKG5hbWU6IHRzLkVudGl0eU5hbWUpOiB0cy5FeHByZXNzaW9ufHVuZGVmaW5lZCB7XG4gICAgICBjb25zdCBzeW1ib2wgPSB0eXBlQ2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKG5hbWUpO1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlIGVudGl0eSBuYW1lIHJlZmVyZW5jZXMgYSBzeW1ib2wgdGhhdCBpcyBhbiBhY3R1YWwgdmFsdWUuIElmIGl0IGlzIG5vdCwgaXRcbiAgICAgIC8vIGNhbm5vdCBiZSByZWZlcmVuY2VkIGJ5IGFuIGV4cHJlc3Npb24sIHNvIHJldHVybiB1bmRlZmluZWQuXG4gICAgICBpZiAoIXN5bWJvbCB8fCAhc3ltYm9sSXNSdW50aW1lVmFsdWUodHlwZUNoZWNrZXIsIHN5bWJvbCkgfHwgIXN5bWJvbC5kZWNsYXJhdGlvbnMgfHxcbiAgICAgICAgICBzeW1ib2wuZGVjbGFyYXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgLy8gSWYgd2UgZGVhbCB3aXRoIGEgcXVhbGlmaWVkIG5hbWUsIGJ1aWxkIHVwIGEgcHJvcGVydHkgYWNjZXNzIGV4cHJlc3Npb25cbiAgICAgIC8vIHRoYXQgY291bGQgYmUgdXNlZCBpbiB0aGUgSmF2YVNjcmlwdCBvdXRwdXQuXG4gICAgICBpZiAodHMuaXNRdWFsaWZpZWROYW1lKG5hbWUpKSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lckV4cHIgPSBlbnRpdHlOYW1lVG9FeHByZXNzaW9uKG5hbWUubGVmdCk7XG4gICAgICAgIGlmIChjb250YWluZXJFeHByID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cy5jcmVhdGVQcm9wZXJ0eUFjY2Vzcyhjb250YWluZXJFeHByLCBuYW1lLnJpZ2h0KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRlY2wgPSBzeW1ib2wuZGVjbGFyYXRpb25zWzBdO1xuICAgICAgLy8gSWYgdGhlIGdpdmVuIGVudGl0eSBuYW1lIGhhcyBiZWVuIHJlc29sdmVkIHRvIGFuIGFsaWFzIGltcG9ydCBkZWNsYXJhdGlvbixcbiAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSBhbGlhcyBkZWNsYXJhdGlvbiBpcyBub3QgZWxpZGVkIGJ5IFR5cGVTY3JpcHQsIGFuZCB1c2UgaXRzXG4gICAgICAvLyBuYW1lIGlkZW50aWZpZXIgdG8gcmVmZXJlbmNlIGl0IGF0IHJ1bnRpbWUuXG4gICAgICBpZiAoaXNBbGlhc0ltcG9ydERlY2xhcmF0aW9uKGRlY2wpKSB7XG4gICAgICAgIHJlZmVyZW5jZWRQYXJhbWV0ZXJUeXBlcy5hZGQoZGVjbCk7XG4gICAgICAgIC8vIElmIHRoZSBlbnRpdHkgbmFtZSByZXNvbHZlcyB0byBhbiBhbGlhcyBpbXBvcnQgZGVjbGFyYXRpb24sIHdlIHJlZmVyZW5jZSB0aGVcbiAgICAgICAgLy8gZW50aXR5IGJhc2VkIG9uIHRoZSBhbGlhcyBpbXBvcnQgbmFtZS4gVGhpcyBlbnN1cmVzIHRoYXQgVHlwZVNjcmlwdCBwcm9wZXJseVxuICAgICAgICAvLyByZXNvbHZlcyB0aGUgbGluayB0byB0aGUgaW1wb3J0LiBDbG9uaW5nIHRoZSBvcmlnaW5hbCBlbnRpdHkgbmFtZSBpZGVudGlmaWVyXG4gICAgICAgIC8vIGNvdWxkIGxlYWQgdG8gYW4gaW5jb3JyZWN0IHJlc29sdXRpb24gYXQgbG9jYWwgc2NvcGUuIGUuZy4gQ29uc2lkZXIgdGhlIGZvbGxvd2luZ1xuICAgICAgICAvLyBzbmlwcGV0OiBgY29uc3RydWN0b3IoRGVwOiBEZXApIHt9YC4gSW4gc3VjaCBhIGNhc2UsIHRoZSBsb2NhbCBgRGVwYCBpZGVudGlmaWVyXG4gICAgICAgIC8vIHdvdWxkIHJlc29sdmUgdG8gdGhlIGFjdHVhbCBwYXJhbWV0ZXIgbmFtZSwgYW5kIG5vdCB0byB0aGUgZGVzaXJlZCBpbXBvcnQuXG4gICAgICAgIC8vIFRoaXMgaGFwcGVucyBiZWNhdXNlIHRoZSBlbnRpdHkgbmFtZSBpZGVudGlmaWVyIHN5bWJvbCBpcyBpbnRlcm5hbGx5IGNvbnNpZGVyZWRcbiAgICAgICAgLy8gYXMgdHlwZS1vbmx5IGFuZCB0aGVyZWZvcmUgVHlwZVNjcmlwdCB0cmllcyB0byByZXNvbHZlIGl0IGFzIHZhbHVlIG1hbnVhbGx5LlxuICAgICAgICAvLyBXZSBjYW4gaGVscCBUeXBlU2NyaXB0IGFuZCBhdm9pZCB0aGlzIG5vbi1yZWxpYWJsZSByZXNvbHV0aW9uIGJ5IHVzaW5nIGFuIGlkZW50aWZpZXJcbiAgICAgICAgLy8gdGhhdCBpcyBub3QgdHlwZS1vbmx5IGFuZCBpcyBkaXJlY3RseSBsaW5rZWQgdG8gdGhlIGltcG9ydCBhbGlhcyBkZWNsYXJhdGlvbi5cbiAgICAgICAgaWYgKGRlY2wubmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmV0dXJuIHRzLmdldE11dGFibGVDbG9uZShkZWNsLm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBDbG9uZSB0aGUgb3JpZ2luYWwgZW50aXR5IG5hbWUgaWRlbnRpZmllciBzbyB0aGF0IGl0IGNhbiBiZSB1c2VkIHRvIHJlZmVyZW5jZVxuICAgICAgLy8gaXRzIHZhbHVlIGF0IHJ1bnRpbWUuIFRoaXMgaXMgdXNlZCB3aGVuIHRoZSBpZGVudGlmaWVyIGlzIHJlc29sdmluZyB0byBhIGZpbGVcbiAgICAgIC8vIGxvY2FsIGRlY2xhcmF0aW9uIChvdGhlcndpc2UgaXQgd291bGQgcmVzb2x2ZSB0byBhbiBhbGlhcyBpbXBvcnQgZGVjbGFyYXRpb24pLlxuICAgICAgcmV0dXJuIHRzLmdldE11dGFibGVDbG9uZShuYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1zIGEgY2xhc3MgZWxlbWVudC4gUmV0dXJucyBhIHRocmVlIHR1cGxlIG9mIG5hbWUsIHRyYW5zZm9ybWVkIGVsZW1lbnQsIGFuZFxuICAgICAqIGRlY29yYXRvcnMgZm91bmQuIFJldHVybnMgYW4gdW5kZWZpbmVkIG5hbWUgaWYgdGhlcmUgYXJlIG5vIGRlY29yYXRvcnMgdG8gbG93ZXIgb24gdGhlXG4gICAgICogZWxlbWVudCwgb3IgdGhlIGVsZW1lbnQgaGFzIGFuIGV4b3RpYyBuYW1lLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybUNsYXNzRWxlbWVudChlbGVtZW50OiB0cy5DbGFzc0VsZW1lbnQpOlxuICAgICAgICBbc3RyaW5nfHVuZGVmaW5lZCwgdHMuQ2xhc3NFbGVtZW50LCB0cy5EZWNvcmF0b3JbXV0ge1xuICAgICAgZWxlbWVudCA9IHRzLnZpc2l0RWFjaENoaWxkKGVsZW1lbnQsIGRlY29yYXRvckRvd25sZXZlbFZpc2l0b3IsIGNvbnRleHQpO1xuICAgICAgY29uc3QgZGVjb3JhdG9yc1RvS2VlcDogdHMuRGVjb3JhdG9yW10gPSBbXTtcbiAgICAgIGNvbnN0IHRvTG93ZXI6IHRzLkRlY29yYXRvcltdID0gW107XG4gICAgICBjb25zdCBkZWNvcmF0b3JzID0gaG9zdC5nZXREZWNvcmF0b3JzT2ZEZWNsYXJhdGlvbihlbGVtZW50KSB8fCBbXTtcbiAgICAgIGZvciAoY29uc3QgZGVjb3JhdG9yIG9mIGRlY29yYXRvcnMpIHtcbiAgICAgICAgLy8gV2Ugb25seSBkZWFsIHdpdGggY29uY3JldGUgbm9kZXMgaW4gVHlwZVNjcmlwdCBzb3VyY2VzLCBzbyB3ZSBkb24ndFxuICAgICAgICAvLyBuZWVkIHRvIGhhbmRsZSBzeW50aGV0aWNhbGx5IGNyZWF0ZWQgZGVjb3JhdG9ycy5cbiAgICAgICAgY29uc3QgZGVjb3JhdG9yTm9kZSA9IGRlY29yYXRvci5ub2RlISBhcyB0cy5EZWNvcmF0b3I7XG4gICAgICAgIGlmICghaXNBbmd1bGFyRGVjb3JhdG9yKGRlY29yYXRvciwgaXNDb3JlKSkge1xuICAgICAgICAgIGRlY29yYXRvcnNUb0tlZXAucHVzaChkZWNvcmF0b3JOb2RlKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB0b0xvd2VyLnB1c2goZGVjb3JhdG9yTm9kZSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRvTG93ZXIubGVuZ3RoKSByZXR1cm4gW3VuZGVmaW5lZCwgZWxlbWVudCwgW11dO1xuXG4gICAgICBpZiAoIWVsZW1lbnQubmFtZSB8fCAhdHMuaXNJZGVudGlmaWVyKGVsZW1lbnQubmFtZSkpIHtcbiAgICAgICAgLy8gTWV0aG9kIGhhcyBhIHdlaXJkIG5hbWUsIGUuZy5cbiAgICAgICAgLy8gICBbU3ltYm9sLmZvb10oKSB7Li4ufVxuICAgICAgICBkaWFnbm9zdGljcy5wdXNoKHtcbiAgICAgICAgICBmaWxlOiBlbGVtZW50LmdldFNvdXJjZUZpbGUoKSxcbiAgICAgICAgICBzdGFydDogZWxlbWVudC5nZXRTdGFydCgpLFxuICAgICAgICAgIGxlbmd0aDogZWxlbWVudC5nZXRFbmQoKSAtIGVsZW1lbnQuZ2V0U3RhcnQoKSxcbiAgICAgICAgICBtZXNzYWdlVGV4dDogYENhbm5vdCBwcm9jZXNzIGRlY29yYXRvcnMgZm9yIGNsYXNzIGVsZW1lbnQgd2l0aCBub24tYW5hbHl6YWJsZSBuYW1lLmAsXG4gICAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgICBjb2RlOiAwLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFt1bmRlZmluZWQsIGVsZW1lbnQsIFtdXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmFtZSA9IChlbGVtZW50Lm5hbWUgYXMgdHMuSWRlbnRpZmllcikudGV4dDtcbiAgICAgIGNvbnN0IG11dGFibGUgPSB0cy5nZXRNdXRhYmxlQ2xvbmUoZWxlbWVudCk7XG4gICAgICAobXV0YWJsZSBhcyBhbnkpLmRlY29yYXRvcnMgPSBkZWNvcmF0b3JzVG9LZWVwLmxlbmd0aCA/XG4gICAgICAgICAgdHMuc2V0VGV4dFJhbmdlKHRzLmNyZWF0ZU5vZGVBcnJheShkZWNvcmF0b3JzVG9LZWVwKSwgbXV0YWJsZS5kZWNvcmF0b3JzKSA6XG4gICAgICAgICAgdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIFtuYW1lLCBtdXRhYmxlLCB0b0xvd2VyXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1zIGEgY29uc3RydWN0b3IuIFJldHVybnMgdGhlIHRyYW5zZm9ybWVkIGNvbnN0cnVjdG9yIGFuZCB0aGUgbGlzdCBvZiBwYXJhbWV0ZXJcbiAgICAgKiBpbmZvcm1hdGlvbiBjb2xsZWN0ZWQsIGNvbnNpc3Rpbmcgb2YgZGVjb3JhdG9ycyBhbmQgb3B0aW9uYWwgdHlwZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1Db25zdHJ1Y3RvcihjdG9yOiB0cy5Db25zdHJ1Y3RvckRlY2xhcmF0aW9uKTpcbiAgICAgICAgW3RzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb24sIFBhcmFtZXRlckRlY29yYXRpb25JbmZvW11dIHtcbiAgICAgIGN0b3IgPSB0cy52aXNpdEVhY2hDaGlsZChjdG9yLCBkZWNvcmF0b3JEb3dubGV2ZWxWaXNpdG9yLCBjb250ZXh0KTtcblxuICAgICAgY29uc3QgbmV3UGFyYW1ldGVyczogdHMuUGFyYW1ldGVyRGVjbGFyYXRpb25bXSA9IFtdO1xuICAgICAgY29uc3Qgb2xkUGFyYW1ldGVycyA9XG4gICAgICAgICAgdHMudmlzaXRQYXJhbWV0ZXJMaXN0KGN0b3IucGFyYW1ldGVycywgZGVjb3JhdG9yRG93bmxldmVsVmlzaXRvciwgY29udGV4dCk7XG4gICAgICBjb25zdCBwYXJhbWV0ZXJzSW5mbzogUGFyYW1ldGVyRGVjb3JhdGlvbkluZm9bXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBwYXJhbSBvZiBvbGRQYXJhbWV0ZXJzKSB7XG4gICAgICAgIGNvbnN0IGRlY29yYXRvcnNUb0tlZXA6IHRzLkRlY29yYXRvcltdID0gW107XG4gICAgICAgIGNvbnN0IHBhcmFtSW5mbzogUGFyYW1ldGVyRGVjb3JhdGlvbkluZm8gPSB7ZGVjb3JhdG9yczogW10sIHR5cGU6IG51bGx9O1xuICAgICAgICBjb25zdCBkZWNvcmF0b3JzID0gaG9zdC5nZXREZWNvcmF0b3JzT2ZEZWNsYXJhdGlvbihwYXJhbSkgfHwgW107XG5cbiAgICAgICAgZm9yIChjb25zdCBkZWNvcmF0b3Igb2YgZGVjb3JhdG9ycykge1xuICAgICAgICAgIC8vIFdlIG9ubHkgZGVhbCB3aXRoIGNvbmNyZXRlIG5vZGVzIGluIFR5cGVTY3JpcHQgc291cmNlcywgc28gd2UgZG9uJ3RcbiAgICAgICAgICAvLyBuZWVkIHRvIGhhbmRsZSBzeW50aGV0aWNhbGx5IGNyZWF0ZWQgZGVjb3JhdG9ycy5cbiAgICAgICAgICBjb25zdCBkZWNvcmF0b3JOb2RlID0gZGVjb3JhdG9yLm5vZGUhIGFzIHRzLkRlY29yYXRvcjtcbiAgICAgICAgICBpZiAoIWlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3IsIGlzQ29yZSkpIHtcbiAgICAgICAgICAgIGRlY29yYXRvcnNUb0tlZXAucHVzaChkZWNvcmF0b3JOb2RlKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJhbUluZm8hLmRlY29yYXRvcnMucHVzaChkZWNvcmF0b3JOb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW0udHlwZSkge1xuICAgICAgICAgIC8vIHBhcmFtIGhhcyBhIHR5cGUgcHJvdmlkZWQsIGUuZy4gXCJmb286IEJhclwiLlxuICAgICAgICAgIC8vIFRoZSB0eXBlIHdpbGwgYmUgZW1pdHRlZCBhcyBhIHZhbHVlIGV4cHJlc3Npb24gaW4gZW50aXR5TmFtZVRvRXhwcmVzc2lvbiwgd2hpY2ggdGFrZXNcbiAgICAgICAgICAvLyBjYXJlIG5vdCB0byBlbWl0IGFueXRoaW5nIGZvciB0eXBlcyB0aGF0IGNhbm5vdCBiZSBleHByZXNzZWQgYXMgYSB2YWx1ZSAoZS5nLlxuICAgICAgICAgIC8vIGludGVyZmFjZXMpLlxuICAgICAgICAgIHBhcmFtSW5mbyEudHlwZSA9IHBhcmFtLnR5cGU7XG4gICAgICAgIH1cbiAgICAgICAgcGFyYW1ldGVyc0luZm8ucHVzaChwYXJhbUluZm8pO1xuICAgICAgICBjb25zdCBuZXdQYXJhbSA9IHRzLnVwZGF0ZVBhcmFtZXRlcihcbiAgICAgICAgICAgIHBhcmFtLFxuICAgICAgICAgICAgLy8gTXVzdCBwYXNzICd1bmRlZmluZWQnIHRvIGF2b2lkIGVtaXR0aW5nIGRlY29yYXRvciBtZXRhZGF0YS5cbiAgICAgICAgICAgIGRlY29yYXRvcnNUb0tlZXAubGVuZ3RoID8gZGVjb3JhdG9yc1RvS2VlcCA6IHVuZGVmaW5lZCwgcGFyYW0ubW9kaWZpZXJzLFxuICAgICAgICAgICAgcGFyYW0uZG90RG90RG90VG9rZW4sIHBhcmFtLm5hbWUsIHBhcmFtLnF1ZXN0aW9uVG9rZW4sIHBhcmFtLnR5cGUsIHBhcmFtLmluaXRpYWxpemVyKTtcbiAgICAgICAgbmV3UGFyYW1ldGVycy5wdXNoKG5ld1BhcmFtKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHVwZGF0ZWQgPSB0cy51cGRhdGVDb25zdHJ1Y3RvcihcbiAgICAgICAgICBjdG9yLCBjdG9yLmRlY29yYXRvcnMsIGN0b3IubW9kaWZpZXJzLCBuZXdQYXJhbWV0ZXJzLFxuICAgICAgICAgIHRzLnZpc2l0RnVuY3Rpb25Cb2R5KGN0b3IuYm9keSwgZGVjb3JhdG9yRG93bmxldmVsVmlzaXRvciwgY29udGV4dCkpO1xuICAgICAgcmV0dXJuIFt1cGRhdGVkLCBwYXJhbWV0ZXJzSW5mb107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJhbnNmb3JtcyBhIHNpbmdsZSBjbGFzcyBkZWNsYXJhdGlvbjpcbiAgICAgKiAtIGRpc3BhdGNoZXMgdG8gc3RyaXAgZGVjb3JhdG9ycyBvbiBtZW1iZXJzXG4gICAgICogLSBjb252ZXJ0cyBkZWNvcmF0b3JzIG9uIHRoZSBjbGFzcyB0byBhbm5vdGF0aW9uc1xuICAgICAqIC0gY3JlYXRlcyBhIGN0b3JQYXJhbWV0ZXJzIHByb3BlcnR5XG4gICAgICogLSBjcmVhdGVzIGEgcHJvcERlY29yYXRvcnMgcHJvcGVydHlcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1DbGFzc0RlY2xhcmF0aW9uKGNsYXNzRGVjbDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IHRzLkNsYXNzRGVjbGFyYXRpb24ge1xuICAgICAgY2xhc3NEZWNsID0gdHMuZ2V0TXV0YWJsZUNsb25lKGNsYXNzRGVjbCk7XG5cbiAgICAgIGNvbnN0IG5ld01lbWJlcnM6IHRzLkNsYXNzRWxlbWVudFtdID0gW107XG4gICAgICBjb25zdCBkZWNvcmF0ZWRQcm9wZXJ0aWVzID0gbmV3IE1hcDxzdHJpbmcsIHRzLkRlY29yYXRvcltdPigpO1xuICAgICAgbGV0IGNsYXNzUGFyYW1ldGVyczogUGFyYW1ldGVyRGVjb3JhdGlvbkluZm9bXXxudWxsID0gbnVsbDtcblxuICAgICAgZm9yIChjb25zdCBtZW1iZXIgb2YgY2xhc3NEZWNsLm1lbWJlcnMpIHtcbiAgICAgICAgc3dpdGNoIChtZW1iZXIua2luZCkge1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eURlY2xhcmF0aW9uOlxuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5HZXRBY2Nlc3NvcjpcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU2V0QWNjZXNzb3I6XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk1ldGhvZERlY2xhcmF0aW9uOiB7XG4gICAgICAgICAgICBjb25zdCBbbmFtZSwgbmV3TWVtYmVyLCBkZWNvcmF0b3JzXSA9IHRyYW5zZm9ybUNsYXNzRWxlbWVudChtZW1iZXIpO1xuICAgICAgICAgICAgbmV3TWVtYmVycy5wdXNoKG5ld01lbWJlcik7XG4gICAgICAgICAgICBpZiAobmFtZSkgZGVjb3JhdGVkUHJvcGVydGllcy5zZXQobmFtZSwgZGVjb3JhdG9ycyk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yOiB7XG4gICAgICAgICAgICBjb25zdCBjdG9yID0gbWVtYmVyIGFzIHRzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb247XG4gICAgICAgICAgICBpZiAoIWN0b3IuYm9keSkgYnJlYWs7XG4gICAgICAgICAgICBjb25zdCBbbmV3TWVtYmVyLCBwYXJhbWV0ZXJzSW5mb10gPVxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybUNvbnN0cnVjdG9yKG1lbWJlciBhcyB0cy5Db25zdHJ1Y3RvckRlY2xhcmF0aW9uKTtcbiAgICAgICAgICAgIGNsYXNzUGFyYW1ldGVycyA9IHBhcmFtZXRlcnNJbmZvO1xuICAgICAgICAgICAgbmV3TWVtYmVycy5wdXNoKG5ld01lbWJlcik7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5ld01lbWJlcnMucHVzaCh0cy52aXNpdEVhY2hDaGlsZChtZW1iZXIsIGRlY29yYXRvckRvd25sZXZlbFZpc2l0b3IsIGNvbnRleHQpKTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGBSZWZsZWN0aW9uSG9zdC5nZXREZWNvcmF0b3JzT2ZEZWNsYXJhdGlvbigpYCBtZXRob2Qgd2lsbCBub3QgcmV0dXJuIGNlcnRhaW4ga2luZHMgb2ZcbiAgICAgIC8vIGRlY29yYXRvcnMgdGhhdCB3aWxsIG5ldmVyIGJlIEFuZ3VsYXIgZGVjb3JhdG9ycy4gU28gd2UgY2Fubm90IHJlbHkgb24gaXQgdG8gY2FwdHVyZSBhbGxcbiAgICAgIC8vIHRoZSBkZWNvcmF0b3JzIHRoYXQgc2hvdWxkIGJlIGtlcHQuIEluc3RlYWQgd2Ugc3RhcnQgb2ZmIHdpdGggYSBzZXQgb2YgdGhlIHJhdyBkZWNvcmF0b3JzXG4gICAgICAvLyBvbiB0aGUgY2xhc3MsIGFuZCBvbmx5IHJlbW92ZSB0aGUgb25lcyB0aGF0IGhhdmUgYmVlbiBpZGVudGlmaWVkIGZvciBkb3dubGV2ZWxpbmcuXG4gICAgICBjb25zdCBkZWNvcmF0b3JzVG9LZWVwID0gbmV3IFNldDx0cy5EZWNvcmF0b3I+KGNsYXNzRGVjbC5kZWNvcmF0b3JzKTtcbiAgICAgIGNvbnN0IHBvc3NpYmxlQW5ndWxhckRlY29yYXRvcnMgPSBob3N0LmdldERlY29yYXRvcnNPZkRlY2xhcmF0aW9uKGNsYXNzRGVjbCkgfHwgW107XG5cbiAgICAgIGxldCBoYXNBbmd1bGFyRGVjb3JhdG9yID0gZmFsc2U7XG4gICAgICBjb25zdCBkZWNvcmF0b3JzVG9Mb3dlciA9IFtdO1xuICAgICAgZm9yIChjb25zdCBkZWNvcmF0b3Igb2YgcG9zc2libGVBbmd1bGFyRGVjb3JhdG9ycykge1xuICAgICAgICAvLyBXZSBvbmx5IGRlYWwgd2l0aCBjb25jcmV0ZSBub2RlcyBpbiBUeXBlU2NyaXB0IHNvdXJjZXMsIHNvIHdlIGRvbid0XG4gICAgICAgIC8vIG5lZWQgdG8gaGFuZGxlIHN5bnRoZXRpY2FsbHkgY3JlYXRlZCBkZWNvcmF0b3JzLlxuICAgICAgICBjb25zdCBkZWNvcmF0b3JOb2RlID0gZGVjb3JhdG9yLm5vZGUhIGFzIHRzLkRlY29yYXRvcjtcbiAgICAgICAgY29uc3QgaXNOZ0RlY29yYXRvciA9IGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3IsIGlzQ29yZSk7XG5cbiAgICAgICAgLy8gS2VlcCB0cmFjayBpZiB3ZSBjb21lIGFjcm9zcyBhbiBBbmd1bGFyIGNsYXNzIGRlY29yYXRvci4gVGhpcyBpcyB1c2VkXG4gICAgICAgIC8vIGZvciB0byBkZXRlcm1pbmUgd2hldGhlciBjb25zdHJ1Y3RvciBwYXJhbWV0ZXJzIHNob3VsZCBiZSBjYXB0dXJlZCBvciBub3QuXG4gICAgICAgIGlmIChpc05nRGVjb3JhdG9yKSB7XG4gICAgICAgICAgaGFzQW5ndWxhckRlY29yYXRvciA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNOZ0RlY29yYXRvciAmJiAhc2tpcENsYXNzRGVjb3JhdG9ycykge1xuICAgICAgICAgIGRlY29yYXRvcnNUb0xvd2VyLnB1c2goZXh0cmFjdE1ldGFkYXRhRnJvbVNpbmdsZURlY29yYXRvcihkZWNvcmF0b3JOb2RlLCBkaWFnbm9zdGljcykpO1xuICAgICAgICAgIGRlY29yYXRvcnNUb0tlZXAuZGVsZXRlKGRlY29yYXRvck5vZGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWNvcmF0b3JzVG9Mb3dlci5sZW5ndGgpIHtcbiAgICAgICAgbmV3TWVtYmVycy5wdXNoKGNyZWF0ZURlY29yYXRvckNsYXNzUHJvcGVydHkoZGVjb3JhdG9yc1RvTG93ZXIpKTtcbiAgICAgIH1cbiAgICAgIGlmIChjbGFzc1BhcmFtZXRlcnMpIHtcbiAgICAgICAgaWYgKGhhc0FuZ3VsYXJEZWNvcmF0b3IgfHwgY2xhc3NQYXJhbWV0ZXJzLnNvbWUocCA9PiAhIXAuZGVjb3JhdG9ycy5sZW5ndGgpKSB7XG4gICAgICAgICAgLy8gQ2FwdHVyZSBjb25zdHJ1Y3RvciBwYXJhbWV0ZXJzIGlmIHRoZSBjbGFzcyBoYXMgQW5ndWxhciBkZWNvcmF0b3IgYXBwbGllZCxcbiAgICAgICAgICAvLyBvciBpZiBhbnkgb2YgdGhlIHBhcmFtZXRlcnMgaGFzIGRlY29yYXRvcnMgYXBwbGllZCBkaXJlY3RseS5cbiAgICAgICAgICBuZXdNZW1iZXJzLnB1c2goY3JlYXRlQ3RvclBhcmFtZXRlcnNDbGFzc1Byb3BlcnR5KFxuICAgICAgICAgICAgICBkaWFnbm9zdGljcywgZW50aXR5TmFtZVRvRXhwcmVzc2lvbiwgY2xhc3NQYXJhbWV0ZXJzLCBpc0Nsb3N1cmVDb21waWxlckVuYWJsZWQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGRlY29yYXRlZFByb3BlcnRpZXMuc2l6ZSkge1xuICAgICAgICBuZXdNZW1iZXJzLnB1c2goY3JlYXRlUHJvcERlY29yYXRvcnNDbGFzc1Byb3BlcnR5KGRpYWdub3N0aWNzLCBkZWNvcmF0ZWRQcm9wZXJ0aWVzKSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1lbWJlcnMgPSB0cy5zZXRUZXh0UmFuZ2UoXG4gICAgICAgICAgdHMuY3JlYXRlTm9kZUFycmF5KG5ld01lbWJlcnMsIGNsYXNzRGVjbC5tZW1iZXJzLmhhc1RyYWlsaW5nQ29tbWEpLCBjbGFzc0RlY2wubWVtYmVycyk7XG5cbiAgICAgIHJldHVybiB0cy51cGRhdGVDbGFzc0RlY2xhcmF0aW9uKFxuICAgICAgICAgIGNsYXNzRGVjbCwgZGVjb3JhdG9yc1RvS2VlcC5zaXplID8gQXJyYXkuZnJvbShkZWNvcmF0b3JzVG9LZWVwKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICBjbGFzc0RlY2wubW9kaWZpZXJzLCBjbGFzc0RlY2wubmFtZSwgY2xhc3NEZWNsLnR5cGVQYXJhbWV0ZXJzLCBjbGFzc0RlY2wuaGVyaXRhZ2VDbGF1c2VzLFxuICAgICAgICAgIG1lbWJlcnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyYW5zZm9ybWVyIHZpc2l0b3IgdGhhdCBsb29rcyBmb3IgQW5ndWxhciBkZWNvcmF0b3JzIGFuZCByZXBsYWNlcyB0aGVtIHdpdGhcbiAgICAgKiBkb3dubGV2ZWxlZCBzdGF0aWMgcHJvcGVydGllcy4gQWxzbyBjb2xsZWN0cyBjb25zdHJ1Y3RvciB0eXBlIG1ldGFkYXRhIGZvclxuICAgICAqIGNsYXNzIGRlY2xhcmF0aW9uIHRoYXQgYXJlIGRlY29yYXRlZCB3aXRoIGFuIEFuZ3VsYXIgZGVjb3JhdG9yLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRlY29yYXRvckRvd25sZXZlbFZpc2l0b3Iobm9kZTogdHMuTm9kZSk6IHRzLk5vZGUge1xuICAgICAgaWYgKHRzLmlzQ2xhc3NEZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAgICByZXR1cm4gdHJhbnNmb3JtQ2xhc3NEZWNsYXJhdGlvbihub2RlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChub2RlLCBkZWNvcmF0b3JEb3dubGV2ZWxWaXNpdG9yLCBjb250ZXh0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNmOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XG4gICAgICAvLyBEb3dubGV2ZWwgZGVjb3JhdG9ycyBhbmQgY29uc3RydWN0b3IgcGFyYW1ldGVyIHR5cGVzLiBXZSB3aWxsIGtlZXAgdHJhY2sgb2YgYWxsXG4gICAgICAvLyByZWZlcmVuY2VkIGNvbnN0cnVjdG9yIHBhcmFtZXRlciB0eXBlcyBzbyB0aGF0IHdlIGNhbiBpbnN0cnVjdCBUeXBlU2NyaXB0IHRvXG4gICAgICAvLyBub3QgZWxpZGUgdGhlaXIgaW1wb3J0cyBpZiB0aGV5IHByZXZpb3VzbHkgd2VyZSBvbmx5IHR5cGUtb25seS5cbiAgICAgIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChzZiwgZGVjb3JhdG9yRG93bmxldmVsVmlzaXRvciwgY29udGV4dCk7XG4gICAgfTtcbiAgfTtcbn1cbiJdfQ==