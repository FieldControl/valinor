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
        define("@angular/compiler/src/render3/r3_factory", ["require", "exports", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isExpressionFactoryMetadata = exports.isDelegatedFactoryMetadata = exports.createFactoryType = exports.compileFactoryFunction = exports.FactoryTarget = exports.R3FactoryDelegateType = void 0;
    var o = require("@angular/compiler/src/output/output_ast");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var util_1 = require("@angular/compiler/src/render3/util");
    var R3FactoryDelegateType;
    (function (R3FactoryDelegateType) {
        R3FactoryDelegateType[R3FactoryDelegateType["Class"] = 0] = "Class";
        R3FactoryDelegateType[R3FactoryDelegateType["Function"] = 1] = "Function";
    })(R3FactoryDelegateType = exports.R3FactoryDelegateType || (exports.R3FactoryDelegateType = {}));
    var FactoryTarget;
    (function (FactoryTarget) {
        FactoryTarget[FactoryTarget["Directive"] = 0] = "Directive";
        FactoryTarget[FactoryTarget["Component"] = 1] = "Component";
        FactoryTarget[FactoryTarget["Injectable"] = 2] = "Injectable";
        FactoryTarget[FactoryTarget["Pipe"] = 3] = "Pipe";
        FactoryTarget[FactoryTarget["NgModule"] = 4] = "NgModule";
    })(FactoryTarget = exports.FactoryTarget || (exports.FactoryTarget = {}));
    /**
     * Construct a factory function expression for the given `R3FactoryMetadata`.
     */
    function compileFactoryFunction(meta) {
        var t = o.variable('t');
        var baseFactoryVar = null;
        // The type to instantiate via constructor invocation. If there is no delegated factory, meaning
        // this type is always created by constructor invocation, then this is the type-to-create
        // parameter provided by the user (t) if specified, or the current type if not. If there is a
        // delegated factory (which is used to create the current type) then this is only the type-to-
        // create parameter (t).
        var typeForCtor = !isDelegatedFactoryMetadata(meta) ?
            new o.BinaryOperatorExpr(o.BinaryOperator.Or, t, meta.internalType) :
            t;
        var ctorExpr = null;
        if (meta.deps !== null) {
            // There is a constructor (either explicitly or implicitly defined).
            if (meta.deps !== 'invalid') {
                ctorExpr = new o.InstantiateExpr(typeForCtor, injectDependencies(meta.deps, meta.target));
            }
        }
        else {
            // There is no constructor, use the base class' factory to construct typeForCtor.
            baseFactoryVar = o.variable("\u0275" + meta.name + "_BaseFactory");
            ctorExpr = baseFactoryVar.callFn([typeForCtor]);
        }
        var body = [];
        var retExpr = null;
        function makeConditionalFactory(nonCtorExpr) {
            var r = o.variable('r');
            body.push(r.set(o.NULL_EXPR).toDeclStmt());
            var ctorStmt = ctorExpr !== null ? r.set(ctorExpr).toStmt() :
                o.importExpr(r3_identifiers_1.Identifiers.invalidFactory).callFn([]).toStmt();
            body.push(o.ifStmt(t, [ctorStmt], [r.set(nonCtorExpr).toStmt()]));
            return r;
        }
        if (isDelegatedFactoryMetadata(meta)) {
            // This type is created with a delegated factory. If a type parameter is not specified, call
            // the factory instead.
            var delegateArgs = injectDependencies(meta.delegateDeps, meta.target);
            // Either call `new delegate(...)` or `delegate(...)` depending on meta.delegateType.
            var factoryExpr = new (meta.delegateType === R3FactoryDelegateType.Class ?
                o.InstantiateExpr :
                o.InvokeFunctionExpr)(meta.delegate, delegateArgs);
            retExpr = makeConditionalFactory(factoryExpr);
        }
        else if (isExpressionFactoryMetadata(meta)) {
            // TODO(alxhub): decide whether to lower the value here or in the caller
            retExpr = makeConditionalFactory(meta.expression);
        }
        else {
            retExpr = ctorExpr;
        }
        if (retExpr === null) {
            // The expression cannot be formed so render an `ɵɵinvalidFactory()` call.
            body.push(o.importExpr(r3_identifiers_1.Identifiers.invalidFactory).callFn([]).toStmt());
        }
        else if (baseFactoryVar !== null) {
            // This factory uses a base factory, so call `ɵɵgetInheritedFactory()` to compute it.
            var getInheritedFactoryCall = o.importExpr(r3_identifiers_1.Identifiers.getInheritedFactory).callFn([meta.internalType]);
            // Memoize the base factoryFn: `baseFactory || (baseFactory = ɵɵgetInheritedFactory(...))`
            var baseFactory = new o.BinaryOperatorExpr(o.BinaryOperator.Or, baseFactoryVar, baseFactoryVar.set(getInheritedFactoryCall));
            body.push(new o.ReturnStatement(baseFactory.callFn([typeForCtor])));
        }
        else {
            // This is straightforward factory, just return it.
            body.push(new o.ReturnStatement(retExpr));
        }
        var factoryFn = o.fn([new o.FnParam('t', o.DYNAMIC_TYPE)], body, o.INFERRED_TYPE, undefined, meta.name + "_Factory");
        if (baseFactoryVar !== null) {
            // There is a base factory variable so wrap its declaration along with the factory function into
            // an IIFE.
            factoryFn = o.fn([], [
                new o.DeclareVarStmt(baseFactoryVar.name),
                new o.ReturnStatement(factoryFn)
            ]).callFn([], /* sourceSpan */ undefined, /* pure */ true);
        }
        return {
            expression: factoryFn,
            statements: [],
            type: createFactoryType(meta),
        };
    }
    exports.compileFactoryFunction = compileFactoryFunction;
    function createFactoryType(meta) {
        var ctorDepsType = meta.deps !== null && meta.deps !== 'invalid' ? createCtorDepsType(meta.deps) : o.NONE_TYPE;
        return o.expressionType(o.importExpr(r3_identifiers_1.Identifiers.FactoryDeclaration, [util_1.typeWithParameters(meta.type.type, meta.typeArgumentCount), ctorDepsType]));
    }
    exports.createFactoryType = createFactoryType;
    function injectDependencies(deps, target) {
        return deps.map(function (dep, index) { return compileInjectDependency(dep, target, index); });
    }
    function compileInjectDependency(dep, target, index) {
        // Interpret the dependency according to its resolved type.
        if (dep.token === null) {
            return o.importExpr(r3_identifiers_1.Identifiers.invalidFactoryDep).callFn([o.literal(index)]);
        }
        else if (dep.attributeNameType === null) {
            // Build up the injection flags according to the metadata.
            var flags = 0 /* Default */ | (dep.self ? 2 /* Self */ : 0) |
                (dep.skipSelf ? 4 /* SkipSelf */ : 0) | (dep.host ? 1 /* Host */ : 0) |
                (dep.optional ? 8 /* Optional */ : 0) |
                (target === FactoryTarget.Pipe ? 16 /* ForPipe */ : 0);
            // If this dependency is optional or otherwise has non-default flags, then additional
            // parameters describing how to inject the dependency must be passed to the inject function
            // that's being used.
            var flagsParam = (flags !== 0 /* Default */ || dep.optional) ? o.literal(flags) : null;
            // Build up the arguments to the injectFn call.
            var injectArgs = [dep.token];
            if (flagsParam) {
                injectArgs.push(flagsParam);
            }
            var injectFn = getInjectFn(target);
            return o.importExpr(injectFn).callFn(injectArgs);
        }
        else {
            // The `dep.attributeTypeName` value is defined, which indicates that this is an `@Attribute()`
            // type dependency. For the generated JS we still want to use the `dep.token` value in case the
            // name given for the attribute is not a string literal. For example given `@Attribute(foo())`,
            // we want to generate `ɵɵinjectAttribute(foo())`.
            //
            // The `dep.attributeTypeName` is only actually used (in `createCtorDepType()`) to generate
            // typings.
            return o.importExpr(r3_identifiers_1.Identifiers.injectAttribute).callFn([dep.token]);
        }
    }
    function createCtorDepsType(deps) {
        var hasTypes = false;
        var attributeTypes = deps.map(function (dep) {
            var type = createCtorDepType(dep);
            if (type !== null) {
                hasTypes = true;
                return type;
            }
            else {
                return o.literal(null);
            }
        });
        if (hasTypes) {
            return o.expressionType(o.literalArr(attributeTypes));
        }
        else {
            return o.NONE_TYPE;
        }
    }
    function createCtorDepType(dep) {
        var entries = [];
        if (dep.attributeNameType !== null) {
            entries.push({ key: 'attribute', value: dep.attributeNameType, quoted: false });
        }
        if (dep.optional) {
            entries.push({ key: 'optional', value: o.literal(true), quoted: false });
        }
        if (dep.host) {
            entries.push({ key: 'host', value: o.literal(true), quoted: false });
        }
        if (dep.self) {
            entries.push({ key: 'self', value: o.literal(true), quoted: false });
        }
        if (dep.skipSelf) {
            entries.push({ key: 'skipSelf', value: o.literal(true), quoted: false });
        }
        return entries.length > 0 ? o.literalMap(entries) : null;
    }
    function isDelegatedFactoryMetadata(meta) {
        return meta.delegateType !== undefined;
    }
    exports.isDelegatedFactoryMetadata = isDelegatedFactoryMetadata;
    function isExpressionFactoryMetadata(meta) {
        return meta.expression !== undefined;
    }
    exports.isExpressionFactoryMetadata = isExpressionFactoryMetadata;
    function getInjectFn(target) {
        switch (target) {
            case FactoryTarget.Component:
            case FactoryTarget.Directive:
            case FactoryTarget.Pipe:
                return r3_identifiers_1.Identifiers.directiveInject;
            case FactoryTarget.NgModule:
            case FactoryTarget.Injectable:
            default:
                return r3_identifiers_1.Identifiers.inject;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9yZW5kZXIzL3IzX2ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBS0gsMkRBQTBDO0lBQzFDLCtFQUE0RDtJQUc1RCwyREFBNkU7SUErQzdFLElBQVkscUJBR1g7SUFIRCxXQUFZLHFCQUFxQjtRQUMvQixtRUFBUyxDQUFBO1FBQ1QseUVBQVksQ0FBQTtJQUNkLENBQUMsRUFIVyxxQkFBcUIsR0FBckIsNkJBQXFCLEtBQXJCLDZCQUFxQixRQUdoQztJQWVELElBQVksYUFNWDtJQU5ELFdBQVksYUFBYTtRQUN2QiwyREFBYSxDQUFBO1FBQ2IsMkRBQWEsQ0FBQTtRQUNiLDZEQUFjLENBQUE7UUFDZCxpREFBUSxDQUFBO1FBQ1IseURBQVksQ0FBQTtJQUNkLENBQUMsRUFOVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQU14QjtJQXFDRDs7T0FFRztJQUNILFNBQWdCLHNCQUFzQixDQUFDLElBQXVCO1FBQzVELElBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBSSxjQUFjLEdBQXVCLElBQUksQ0FBQztRQUU5QyxnR0FBZ0c7UUFDaEcseUZBQXlGO1FBQ3pGLDZGQUE2RjtRQUM3Riw4RkFBOEY7UUFDOUYsd0JBQXdCO1FBQ3hCLElBQU0sV0FBVyxHQUFHLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDckUsQ0FBQyxDQUFDO1FBRU4sSUFBSSxRQUFRLEdBQXNCLElBQUksQ0FB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QUFLLGFBQWEsQ0FBQyxTQUFTLENBQUM7WUFDN0IsS0FBSyxhQUFhLENBQUMsU0FBUyxDQUFDO1lBQzdCLEtBQUssYUFBYSxDQUFDLElBQUk7Z0JBQ3JCLE9BQU8sNEJBQUUsQ0FBQyxlQUFlLENBQUM7WUFDNUIsS0FBSyxhQUFhLENBQUMsUUFBUSxDQUFDO1lBQzVCLEtBQUssYUFBYSxDQUFDLFVBQVUsQ0FBQztZQUM5QjtnQkFDRSxPQUFPLDRCQUFFLENBQUMsTUFBTSxDQUFDO1NBQ3BCO0lBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1N0YXRpY1N5bWJvbH0gZnJvbSAnLi4vYW90L3N0YXRpY19zeW1ib2wnO1xuaW1wb3J0IHtDb21waWxlVHlwZU1ldGFkYXRhLCB0b2tlblJlZmVyZW5jZX0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge0luamVjdEZsYWdzfSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVycyBhcyBSM30gZnJvbSAnLi4vcmVuZGVyMy9yM19pZGVudGlmaWVycyc7XG5pbXBvcnQge091dHB1dENvbnRleHR9IGZyb20gJy4uL3V0aWwnO1xuXG5pbXBvcnQge1IzQ29tcGlsZWRFeHByZXNzaW9uLCBSM1JlZmVyZW5jZSwgdHlwZVdpdGhQYXJhbWV0ZXJzfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHt1bnN1cHBvcnRlZH0gZnJvbSAnLi92aWV3L3V0aWwnO1xuXG5cblxuLyoqXG4gKiBNZXRhZGF0YSByZXF1aXJlZCBieSB0aGUgZmFjdG9yeSBnZW5lcmF0b3IgdG8gZ2VuZXJhdGUgYSBgZmFjdG9yeWAgZnVuY3Rpb24gZm9yIGEgdHlwZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSM0NvbnN0cnVjdG9yRmFjdG9yeU1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIFN0cmluZyBuYW1lIG9mIHRoZSB0eXBlIGJlaW5nIGdlbmVyYXRlZCAodXNlZCB0byBuYW1lIHRoZSBmYWN0b3J5IGZ1bmN0aW9uKS5cbiAgICovXG4gIG5hbWU6IHN0cmluZztcblxuICAvKipcbiAgICogQW4gZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgdGhlIGludGVyZmFjZSB0eXBlIGJlaW5nIGNvbnN0cnVjdGVkLlxuICAgKi9cbiAgdHlwZTogUjNSZWZlcmVuY2U7XG5cbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSBjb25zdHJ1Y3RvciB0eXBlLCBpbnRlbmRlZCBmb3IgdXNlIHdpdGhpbiBhIGNsYXNzIGRlZmluaXRpb25cbiAgICogaXRzZWxmLlxuICAgKlxuICAgKiBUaGlzIGNhbiBkaWZmZXIgZnJvbSB0aGUgb3V0ZXIgYHR5cGVgIGlmIHRoZSBjbGFzcyBpcyBiZWluZyBjb21waWxlZCBieSBuZ2NjIGFuZCBpcyBpbnNpZGVcbiAgICogYW4gSUlGRSBzdHJ1Y3R1cmUgdGhhdCB1c2VzIGEgZGlmZmVyZW50IG5hbWUgaW50ZXJuYWxseS5cbiAgICovXG4gIGludGVybmFsVHlwZTogby5FeHByZXNzaW9uO1xuXG4gIC8qKiBOdW1iZXIgb2YgYXJndW1lbnRzIGZvciB0aGUgYHR5cGVgLiAqL1xuICB0eXBlQXJndW1lbnRDb3VudDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBSZWdhcmRsZXNzIG9mIHdoZXRoZXIgYGZuT3JDbGFzc2AgaXMgYSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBvciBhIHVzZXItZGVmaW5lZCBmYWN0b3J5LCBpdFxuICAgKiBtYXkgaGF2ZSAwIG9yIG1vcmUgcGFyYW1ldGVycywgd2hpY2ggd2lsbCBiZSBpbmplY3RlZCBhY2NvcmRpbmcgdG8gdGhlIGBSM0RlcGVuZGVuY3lNZXRhZGF0YWBcbiAgICogZm9yIHRob3NlIHBhcmFtZXRlcnMuIElmIHRoaXMgaXMgYG51bGxgLCB0aGVuIHRoZSB0eXBlJ3MgY29uc3RydWN0b3IgaXMgbm9uZXhpc3RlbnQgYW5kIHdpbGxcbiAgICogYmUgaW5oZXJpdGVkIGZyb20gYGZuT3JDbGFzc2Agd2hpY2ggaXMgaW50ZXJwcmV0ZWQgYXMgdGhlIGN1cnJlbnQgdHlwZS4gSWYgdGhpcyBpcyBgJ2ludmFsaWQnYCxcbiAgICogdGhlbiBvbmUgb3IgbW9yZSBvZiB0aGUgcGFyYW1ldGVycyB3YXNuJ3QgcmVzb2x2YWJsZSBhbmQgYW55IGF0dGVtcHQgdG8gdXNlIHRoZXNlIGRlcHMgd2lsbFxuICAgKiByZXN1bHQgaW4gYSBydW50aW1lIGVycm9yLlxuICAgKi9cbiAgZGVwczogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXXwnaW52YWxpZCd8bnVsbDtcblxuICAvKipcbiAgICogVHlwZSBvZiB0aGUgdGFyZ2V0IGJlaW5nIGNyZWF0ZWQgYnkgdGhlIGZhY3RvcnkuXG4gICAqL1xuICB0YXJnZXQ6IEZhY3RvcnlUYXJnZXQ7XG59XG5cbmV4cG9ydCBlbnVtIFIzRmFjdG9yeURlbGVnYXRlVHlwZSB7XG4gIENsYXNzID0gMCxcbiAgRnVuY3Rpb24gPSAxLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFIzRGVsZWdhdGVkRm5PckNsYXNzTWV0YWRhdGEgZXh0ZW5kcyBSM0NvbnN0cnVjdG9yRmFjdG9yeU1ldGFkYXRhIHtcbiAgZGVsZWdhdGU6IG8uRXhwcmVzc2lvbjtcbiAgZGVsZWdhdGVUeXBlOiBSM0ZhY3RvcnlEZWxlZ2F0ZVR5cGU7XG4gIGRlbGVnYXRlRGVwczogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSM0V4cHJlc3Npb25GYWN0b3J5TWV0YWRhdGEgZXh0ZW5kcyBSM0NvbnN0cnVjdG9yRmFjdG9yeU1ldGFkYXRhIHtcbiAgZXhwcmVzc2lvbjogby5FeHByZXNzaW9uO1xufVxuXG5leHBvcnQgdHlwZSBSM0ZhY3RvcnlNZXRhZGF0YSA9XG4gICAgUjNDb25zdHJ1Y3RvckZhY3RvcnlNZXRhZGF0YXxSM0RlbGVnYXRlZEZuT3JDbGFzc01ldGFkYXRhfFIzRXhwcmVzc2lvbkZhY3RvcnlNZXRhZGF0YTtcblxuZXhwb3J0IGVudW0gRmFjdG9yeVRhcmdldCB7XG4gIERpcmVjdGl2ZSA9IDAsXG4gIENvbXBvbmVudCA9IDEsXG4gIEluamVjdGFibGUgPSAyLFxuICBQaXBlID0gMyxcbiAgTmdNb2R1bGUgPSA0LFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFIzRGVwZW5kZW5jeU1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIEFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSB0b2tlbiBvciB2YWx1ZSB0byBiZSBpbmplY3RlZC5cbiAgICogT3IgYG51bGxgIGlmIHRoZSBkZXBlbmRlbmN5IGNvdWxkIG5vdCBiZSByZXNvbHZlZCAtIG1ha2luZyBpdCBpbnZhbGlkLlxuICAgKi9cbiAgdG9rZW46IG8uRXhwcmVzc2lvbnxudWxsO1xuXG4gIC8qKlxuICAgKiBJZiBhbiBAQXR0cmlidXRlIGRlY29yYXRvciBpcyBwcmVzZW50LCB0aGlzIGlzIHRoZSBsaXRlcmFsIHR5cGUgb2YgdGhlIGF0dHJpYnV0ZSBuYW1lLCBvclxuICAgKiB0aGUgdW5rbm93biB0eXBlIGlmIG5vIGxpdGVyYWwgdHlwZSBpcyBhdmFpbGFibGUgKGUuZy4gdGhlIGF0dHJpYnV0ZSBuYW1lIGlzIGFuIGV4cHJlc3Npb24pLlxuICAgKiBPdGhlcndpc2UgaXQgaXMgbnVsbDtcbiAgICovXG4gIGF0dHJpYnV0ZU5hbWVUeXBlOiBvLkV4cHJlc3Npb258bnVsbDtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZGVwZW5kZW5jeSBoYXMgYW4gQEhvc3QgcXVhbGlmaWVyLlxuICAgKi9cbiAgaG9zdDogYm9vbGVhbjtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZGVwZW5kZW5jeSBoYXMgYW4gQE9wdGlvbmFsIHF1YWxpZmllci5cbiAgICovXG4gIG9wdGlvbmFsOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBkZXBlbmRlbmN5IGhhcyBhbiBAU2VsZiBxdWFsaWZpZXIuXG4gICAqL1xuICBzZWxmOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBkZXBlbmRlbmN5IGhhcyBhbiBAU2tpcFNlbGYgcXVhbGlmaWVyLlxuICAgKi9cbiAgc2tpcFNlbGY6IGJvb2xlYW47XG59XG5cbi8qKlxuICogQ29uc3RydWN0IGEgZmFjdG9yeSBmdW5jdGlvbiBleHByZXNzaW9uIGZvciB0aGUgZ2l2ZW4gYFIzRmFjdG9yeU1ldGFkYXRhYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVGYWN0b3J5RnVuY3Rpb24obWV0YTogUjNGYWN0b3J5TWV0YWRhdGEpOiBSM0NvbXBpbGVkRXhwcmVzc2lvbiB7XG4gIGNvbnN0IHQgPSBvLnZhcmlhYmxlKCd0Jyk7XG4gIGxldCBiYXNlRmFjdG9yeVZhcjogby5SZWFkVmFyRXhwcnxudWxsID0gbnVsbDtcblxuICAvLyBUaGUgdHlwZSB0byBpbnN0YW50aWF0ZSB2aWEgY29uc3RydWN0b3IgaW52b2NhdGlvbi4gSWYgdGhlcmUgaXMgbm8gZGVsZWdhdGVkIGZhY3RvcnksIG1lYW5pbmdcbiAgLy8gdGhpcyB0eXBlIGlzIGFsd2F5cyBjcmVhdGVkIGJ5IGNvbnN0cnVjdG9yIGludm9jYXRpb24sIHRoZW4gdGhpcyBpcyB0aGUgdHlwZS10by1jcmVhdGVcbiAgLy8gcGFyYW1ldGVyIHByb3ZpZGVkIGJ5IHRoZSB1c2VyICh0KSBpZiBzcGVjaWZpZWQsIG9yIHRoZSBjdXJyZW50IHR5cGUgaWYgbm90LiBJZiB0aGVyZSBpcyBhXG4gIC8vIGRlbGVnYXRlZCBmYWN0b3J5ICh3aGljaCBpcyB1c2VkIHRvIGNyZWF0ZSB0aGUgY3VycmVudCB0eXBlKSB0aGVuIHRoaXMgaXMgb25seSB0aGUgdHlwZS10by1cbiAgLy8gY3JlYXRlIHBhcmFtZXRlciAodCkuXG4gIGNvbnN0IHR5cGVGb3JDdG9yID0gIWlzRGVsZWdhdGVkRmFjdG9yeU1ldGFkYXRhKG1ldGEpID9cbiAgICAgIG5ldyBvLkJpbmFyeU9wZXJhdG9yRXhwcihvLkJpbmFyeU9wZXJhdG9yLk9yLCB0LCBtZXRhLmludGVybmFsVHlwZSkgOlxuICAgICAgdDtcblxuICBsZXQgY3RvckV4cHI6IG8uRXhwcmVzc2lvbnxudWxsID0gbnVsbDtcbiAgaWYgKG1ldGEuZGVwcyAhPT0gbnVsbCkge1xuICAgIC8vIFRoZXJlIGlzIGEgY29uc3RydWN0b3IgKGVpdGhlciBleHBsaWNpdGx5IG9yIGltcGxpY2l0bHkgZGVmaW5lZCkuXG4gICAgaWYgKG1ldGEuZGVwcyAhPT0gJ2ludmFsaWQnKSB7XG4gICAgICBjdG9yRXhwciA9IG5ldyBvLkluc3RhbnRpYXRlRXhwcih0eXBlRm9yQ3RvciwgaW5qZWN0RGVwZW5kZW5jaWVzKG1ldGEuZGVwcywgbWV0YS50YXJnZXQpKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gVGhlcmUgaXMgbm8gY29uc3RydWN0b3IsIHVzZSB0aGUgYmFzZSBjbGFzcycgZmFjdG9yeSB0byBjb25zdHJ1Y3QgdHlwZUZvckN0b3IuXG4gICAgYmFzZUZhY3RvcnlWYXIgPSBvLnZhcmlhYmxlKGDJtSR7bWV0YS5uYW1lfV9CYXNlRmFjdG9yeWApO1xuICAgIGN0b3JFeHByID0gYmFzZUZhY3RvcnlWYXIuY2FsbEZuKFt0eXBlRm9yQ3Rvcl0pO1xuICB9XG5cbiAgY29uc3QgYm9keTogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICBsZXQgcmV0RXhwcjogby5FeHByZXNzaW9ufG51bGwgPSBudWxsO1xuXG4gIGZ1bmN0aW9uIG1ha2VDb25kaXRpb25hbEZhY3Rvcnkobm9uQ3RvckV4cHI6IG8uRXhwcmVzc2lvbik6IG8uUmVhZFZhckV4cHIge1xuICAgIGNvbnN0IHIgPSBvLnZhcmlhYmxlKCdyJyk7XG4gICAgYm9keS5wdXNoKHIuc2V0KG8uTlVMTF9FWFBSKS50b0RlY2xTdG10KCkpO1xuICAgIGNvbnN0IGN0b3JTdG10ID0gY3RvckV4cHIgIT09IG51bGwgPyByLnNldChjdG9yRXhwcikudG9TdG10KCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmltcG9ydEV4cHIoUjMuaW52YWxpZEZhY3RvcnkpLmNhbGxGbihbXSkudG9TdG10KCk7XG4gICAgYm9keS5wdXNoKG8uaWZTdG10KHQsIFtjdG9yU3RtdF0sIFtyLnNldChub25DdG9yRXhwcikudG9TdG10KCldKSk7XG4gICAgcmV0dXJuIHI7XG4gIH1cblxuICBpZiAoaXNEZWxlZ2F0ZWRGYWN0b3J5TWV0YWRhdGEobWV0YSkpIHtcbiAgICAvLyBUaGlzIHR5cGUgaXMgY3JlYXRlZCB3aXRoIGEgZGVsZWdhdGVkIGZhY3RvcnkuIElmIGEgdHlwZSBwYXJhbWV0ZXIgaXMgbm90IHNwZWNpZmllZCwgY2FsbFxuICAgIC8vIHRoZSBmYWN0b3J5IGluc3RlYWQuXG4gICAgY29uc3QgZGVsZWdhdGVBcmdzID0gaW5qZWN0RGVwZW5kZW5jaWVzKG1ldGEuZGVsZWdhdGVEZXBzLCBtZXRhLnRhcmdldCk7XG4gICAgLy8gRWl0aGVyIGNhbGwgYG5ldyBkZWxlZ2F0ZSguLi4pYCBvciBgZGVsZWdhdGUoLi4uKWAgZGVwZW5kaW5nIG9uIG1ldGEuZGVsZWdhdGVUeXBlLlxuICAgIGNvbnN0IGZhY3RvcnlFeHByID0gbmV3IChcbiAgICAgICAgbWV0YS5kZWxlZ2F0ZVR5cGUgPT09IFIzRmFjdG9yeURlbGVnYXRlVHlwZS5DbGFzcyA/XG4gICAgICAgICAgICBvLkluc3RhbnRpYXRlRXhwciA6XG4gICAgICAgICAgICBvLkludm9rZUZ1bmN0aW9uRXhwcikobWV0YS5kZWxlZ2F0ZSwgZGVsZWdhdGVBcmdzKTtcbiAgICByZXRFeHByID0gbWFrZUNvbmRpdGlvbmFsRmFjdG9yeShmYWN0b3J5RXhwcik7XG4gIH0gZWxzZSBpZiAoaXNFeHByZXNzaW9uRmFjdG9yeU1ldGFkYXRhKG1ldGEpKSB7XG4gICAgLy8gVE9ETyhhbHhodWIpOiBkZWNpZGUgd2hldGhlciB0byBsb3dlciB0aGUgdmFsdWUgaGVyZSBvciBpbiB0aGUgY2FsbGVyXG4gICAgcmV0RXhwciA9IG1ha2VDb25kaXRpb25hbEZhY3RvcnkobWV0YS5leHByZXNzaW9uKTtcbiAgfSBlbHNlIHtcbiAgICByZXRFeHByID0gY3RvckV4cHI7XG4gIH1cblxuXG4gIGlmIChyZXRFeHByID09PSBudWxsKSB7XG4gICAgLy8gVGhlIGV4cHJlc3Npb24gY2Fubm90IGJlIGZvcm1lZCBzbyByZW5kZXIgYW4gYMm1ybVpbnZhbGlkRmFjdG9yeSgpYCBjYWxsLlxuICAgIGJvZHkucHVzaChvLmltcG9ydEV4cHIoUjMuaW52YWxpZEZhY3RvcnkpLmNhbGxGbihbXSkudG9TdG10KCkpO1xuICB9IGVsc2UgaWYgKGJhc2VGYWN0b3J5VmFyICE9PSBudWxsKSB7XG4gICAgLy8gVGhpcyBmYWN0b3J5IHVzZXMgYSBiYXNlIGZhY3RvcnksIHNvIGNhbGwgYMm1ybVnZXRJbmhlcml0ZWRGYWN0b3J5KClgIHRvIGNvbXB1dGUgaXQuXG4gICAgY29uc3QgZ2V0SW5oZXJpdGVkRmFjdG9yeUNhbGwgPVxuICAgICAgICBvLmltcG9ydEV4cHIoUjMuZ2V0SW5oZXJpdGVkRmFjdG9yeSkuY2FsbEZuKFttZXRhLmludGVybmFsVHlwZV0pO1xuICAgIC8vIE1lbW9pemUgdGhlIGJhc2UgZmFjdG9yeUZuOiBgYmFzZUZhY3RvcnkgfHwgKGJhc2VGYWN0b3J5ID0gybXJtWdldEluaGVyaXRlZEZhY3RvcnkoLi4uKSlgXG4gICAgY29uc3QgYmFzZUZhY3RvcnkgPSBuZXcgby5CaW5hcnlPcGVyYXRvckV4cHIoXG4gICAgICAgIG8uQmluYXJ5T3BlcmF0b3IuT3IsIGJhc2VGYWN0b3J5VmFyLCBiYXNlRmFjdG9yeVZhci5zZXQoZ2V0SW5oZXJpdGVkRmFjdG9yeUNhbGwpKTtcbiAgICBib2R5LnB1c2gobmV3IG8uUmV0dXJuU3RhdGVtZW50KGJhc2VGYWN0b3J5LmNhbGxGbihbdHlwZUZvckN0b3JdKSkpO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoaXMgaXMgc3RyYWlnaHRmb3J3YXJkIGZhY3RvcnksIGp1c3QgcmV0dXJuIGl0LlxuICAgIGJvZHkucHVzaChuZXcgby5SZXR1cm5TdGF0ZW1lbnQocmV0RXhwcikpO1xuICB9XG5cbiAgbGV0IGZhY3RvcnlGbjogby5FeHByZXNzaW9uID0gby5mbihcbiAgICAgIFtuZXcgby5GblBhcmFtKCd0Jywgby5EWU5BTUlDX1RZUEUpXSwgYm9keSwgby5JTkZFUlJFRF9UWVBFLCB1bmRlZmluZWQsXG4gICAgICBgJHttZXRhLm5hbWV9X0ZhY3RvcnlgKTtcblxuICBpZiAoYmFzZUZhY3RvcnlWYXIgIT09IG51bGwpIHtcbiAgICAvLyBUaGVyZSBpcyBhIGJhc2UgZmFjdG9yeSB2YXJpYWJsZSBzbyB3cmFwIGl0cyBkZWNsYXJhdGlvbiBhbG9uZyB3aXRoIHRoZSBmYWN0b3J5IGZ1bmN0aW9uIGludG9cbiAgICAvLyBhbiBJSUZFLlxuICAgIGZhY3RvcnlGbiA9IG8uZm4oW10sIFtcbiAgICAgICAgICAgICAgICAgICBuZXcgby5EZWNsYXJlVmFyU3RtdChiYXNlRmFjdG9yeVZhci5uYW1lISksIG5ldyBvLlJldHVyblN0YXRlbWVudChmYWN0b3J5Rm4pXG4gICAgICAgICAgICAgICAgIF0pLmNhbGxGbihbXSwgLyogc291cmNlU3BhbiAqLyB1bmRlZmluZWQsIC8qIHB1cmUgKi8gdHJ1ZSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGV4cHJlc3Npb246IGZhY3RvcnlGbixcbiAgICBzdGF0ZW1lbnRzOiBbXSxcbiAgICB0eXBlOiBjcmVhdGVGYWN0b3J5VHlwZShtZXRhKSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZhY3RvcnlUeXBlKG1ldGE6IFIzRmFjdG9yeU1ldGFkYXRhKSB7XG4gIGNvbnN0IGN0b3JEZXBzVHlwZSA9XG4gICAgICBtZXRhLmRlcHMgIT09IG51bGwgJiYgbWV0YS5kZXBzICE9PSAnaW52YWxpZCcgPyBjcmVhdGVDdG9yRGVwc1R5cGUobWV0YS5kZXBzKSA6IG8uTk9ORV9UWVBFO1xuICByZXR1cm4gby5leHByZXNzaW9uVHlwZShvLmltcG9ydEV4cHIoXG4gICAgICBSMy5GYWN0b3J5RGVjbGFyYXRpb24sXG4gICAgICBbdHlwZVdpdGhQYXJhbWV0ZXJzKG1ldGEudHlwZS50eXBlLCBtZXRhLnR5cGVBcmd1bWVudENvdW50KSwgY3RvckRlcHNUeXBlXSkpO1xufVxuXG5mdW5jdGlvbiBpbmplY3REZXBlbmRlbmNpZXMoZGVwczogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXSwgdGFyZ2V0OiBGYWN0b3J5VGFyZ2V0KTogby5FeHByZXNzaW9uW10ge1xuICByZXR1cm4gZGVwcy5tYXAoKGRlcCwgaW5kZXgpID0+IGNvbXBpbGVJbmplY3REZXBlbmRlbmN5KGRlcCwgdGFyZ2V0LCBpbmRleCkpO1xufVxuXG5mdW5jdGlvbiBjb21waWxlSW5qZWN0RGVwZW5kZW5jeShcbiAgICBkZXA6IFIzRGVwZW5kZW5jeU1ldGFkYXRhLCB0YXJnZXQ6IEZhY3RvcnlUYXJnZXQsIGluZGV4OiBudW1iZXIpOiBvLkV4cHJlc3Npb24ge1xuICAvLyBJbnRlcnByZXQgdGhlIGRlcGVuZGVuY3kgYWNjb3JkaW5nIHRvIGl0cyByZXNvbHZlZCB0eXBlLlxuICBpZiAoZGVwLnRva2VuID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5pbnZhbGlkRmFjdG9yeURlcCkuY2FsbEZuKFtvLmxpdGVyYWwoaW5kZXgpXSk7XG4gIH0gZWxzZSBpZiAoZGVwLmF0dHJpYnV0ZU5hbWVUeXBlID09PSBudWxsKSB7XG4gICAgLy8gQnVpbGQgdXAgdGhlIGluamVjdGlvbiBmbGFncyBhY2NvcmRpbmcgdG8gdGhlIG1ldGFkYXRhLlxuICAgIGNvbnN0IGZsYWdzID0gSW5qZWN0RmxhZ3MuRGVmYXVsdCB8IChkZXAuc2VsZiA/IEluamVjdEZsYWdzLlNlbGYgOiAwKSB8XG4gICAgICAgIChkZXAuc2tpcFNlbGYgPyBJbmplY3RGbGFncy5Ta2lwU2VsZiA6IDApIHwgKGRlcC5ob3N0ID8gSW5qZWN0RmxhZ3MuSG9zdCA6IDApIHxcbiAgICAgICAgKGRlcC5vcHRpb25hbCA/IEluamVjdEZsYWdzLk9wdGlvbmFsIDogMCkgfFxuICAgICAgICAodGFyZ2V0ID09PSBGYWN0b3J5VGFyZ2V0LlBpcGUgPyBJbmplY3RGbGFncy5Gb3JQaXBlIDogMCk7XG5cbiAgICAvLyBJZiB0aGlzIGRlcGVuZGVuY3kgaXMgb3B0aW9uYWwgb3Igb3RoZXJ3aXNlIGhhcyBub24tZGVmYXVsdCBmbGFncywgdGhlbiBhZGRpdGlvbmFsXG4gICAgLy8gcGFyYW1ldGVycyBkZXNjcmliaW5nIGhvdyB0byBpbmplY3QgdGhlIGRlcGVuZGVuY3kgbXVzdCBiZSBwYXNzZWQgdG8gdGhlIGluamVjdCBmdW5jdGlvblxuICAgIC8vIHRoYXQncyBiZWluZyB1c2VkLlxuICAgIGxldCBmbGFnc1BhcmFtOiBvLkxpdGVyYWxFeHByfG51bGwgPVxuICAgICAgICAoZmxhZ3MgIT09IEluamVjdEZsYWdzLkRlZmF1bHQgfHwgZGVwLm9wdGlvbmFsKSA/IG8ubGl0ZXJhbChmbGFncykgOiBudWxsO1xuXG4gICAgLy8gQnVpbGQgdXAgdGhlIGFyZ3VtZW50cyB0byB0aGUgaW5qZWN0Rm4gY2FsbC5cbiAgICBjb25zdCBpbmplY3RBcmdzID0gW2RlcC50b2tlbl07XG4gICAgaWYgKGZsYWdzUGFyYW0pIHtcbiAgICAgIGluamVjdEFyZ3MucHVzaChmbGFnc1BhcmFtKTtcbiAgICB9XG4gICAgY29uc3QgaW5qZWN0Rm4gPSBnZXRJbmplY3RGbih0YXJnZXQpO1xuICAgIHJldHVybiBvLmltcG9ydEV4cHIoaW5qZWN0Rm4pLmNhbGxGbihpbmplY3RBcmdzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGUgYGRlcC5hdHRyaWJ1dGVUeXBlTmFtZWAgdmFsdWUgaXMgZGVmaW5lZCwgd2hpY2ggaW5kaWNhdGVzIHRoYXQgdGhpcyBpcyBhbiBgQEF0dHJpYnV0ZSgpYFxuICAgIC8vIHR5cGUgZGVwZW5kZW5jeS4gRm9yIHRoZSBnZW5lcmF0ZWQgSlMgd2Ugc3RpbGwgd2FudCB0byB1c2UgdGhlIGBkZXAudG9rZW5gIHZhbHVlIGluIGNhc2UgdGhlXG4gICAgLy8gbmFtZSBnaXZlbiBmb3IgdGhlIGF0dHJpYnV0ZSBpcyBub3QgYSBzdHJpbmcgbGl0ZXJhbC4gRm9yIGV4YW1wbGUgZ2l2ZW4gYEBBdHRyaWJ1dGUoZm9vKCkpYCxcbiAgICAvLyB3ZSB3YW50IHRvIGdlbmVyYXRlIGDJtcm1aW5qZWN0QXR0cmlidXRlKGZvbygpKWAuXG4gICAgLy9cbiAgICAvLyBUaGUgYGRlcC5hdHRyaWJ1dGVUeXBlTmFtZWAgaXMgb25seSBhY3R1YWxseSB1c2VkIChpbiBgY3JlYXRlQ3RvckRlcFR5cGUoKWApIHRvIGdlbmVyYXRlXG4gICAgLy8gdHlwaW5ncy5cbiAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLmluamVjdEF0dHJpYnV0ZSkuY2FsbEZuKFtkZXAudG9rZW5dKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDdG9yRGVwc1R5cGUoZGVwczogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXSk6IG8uVHlwZSB7XG4gIGxldCBoYXNUeXBlcyA9IGZhbHNlO1xuICBjb25zdCBhdHRyaWJ1dGVUeXBlcyA9IGRlcHMubWFwKGRlcCA9PiB7XG4gICAgY29uc3QgdHlwZSA9IGNyZWF0ZUN0b3JEZXBUeXBlKGRlcCk7XG4gICAgaWYgKHR5cGUgIT09IG51bGwpIHtcbiAgICAgIGhhc1R5cGVzID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0eXBlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gby5saXRlcmFsKG51bGwpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKGhhc1R5cGVzKSB7XG4gICAgcmV0dXJuIG8uZXhwcmVzc2lvblR5cGUoby5saXRlcmFsQXJyKGF0dHJpYnV0ZVR5cGVzKSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG8uTk9ORV9UWVBFO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUN0b3JEZXBUeXBlKGRlcDogUjNEZXBlbmRlbmN5TWV0YWRhdGEpOiBvLkxpdGVyYWxNYXBFeHByfG51bGwge1xuICBjb25zdCBlbnRyaWVzOiB7a2V5OiBzdHJpbmcsIHF1b3RlZDogYm9vbGVhbiwgdmFsdWU6IG8uRXhwcmVzc2lvbn1bXSA9IFtdO1xuXG4gIGlmIChkZXAuYXR0cmlidXRlTmFtZVR5cGUgIT09IG51bGwpIHtcbiAgICBlbnRyaWVzLnB1c2goe2tleTogJ2F0dHJpYnV0ZScsIHZhbHVlOiBkZXAuYXR0cmlidXRlTmFtZVR5cGUsIHF1b3RlZDogZmFsc2V9KTtcbiAgfVxuICBpZiAoZGVwLm9wdGlvbmFsKSB7XG4gICAgZW50cmllcy5wdXNoKHtrZXk6ICdvcHRpb25hbCcsIHZhbHVlOiBvLmxpdGVyYWwodHJ1ZSksIHF1b3RlZDogZmFsc2V9KTtcbiAgfVxuICBpZiAoZGVwLmhvc3QpIHtcbiAgICBlbnRyaWVzLnB1c2goe2tleTogJ2hvc3QnLCB2YWx1ZTogby5saXRlcmFsKHRydWUpLCBxdW90ZWQ6IGZhbHNlfSk7XG4gIH1cbiAgaWYgKGRlcC5zZWxmKSB7XG4gICAgZW50cmllcy5wdXNoKHtrZXk6ICdzZWxmJywgdmFsdWU6IG8ubGl0ZXJhbCh0cnVlKSwgcXVvdGVkOiBmYWxzZX0pO1xuICB9XG4gIGlmIChkZXAuc2tpcFNlbGYpIHtcbiAgICBlbnRyaWVzLnB1c2goe2tleTogJ3NraXBTZWxmJywgdmFsdWU6IG8ubGl0ZXJhbCh0cnVlKSwgcXVvdGVkOiBmYWxzZX0pO1xuICB9XG5cbiAgcmV0dXJuIGVudHJpZXMubGVuZ3RoID4gMCA/IG8ubGl0ZXJhbE1hcChlbnRyaWVzKSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RlbGVnYXRlZEZhY3RvcnlNZXRhZGF0YShtZXRhOiBSM0ZhY3RvcnlNZXRhZGF0YSk6XG4gICAgbWV0YSBpcyBSM0RlbGVnYXRlZEZuT3JDbGFzc01ldGFkYXRhIHtcbiAgcmV0dXJuIChtZXRhIGFzIGFueSkuZGVsZWdhdGVUeXBlICE9PSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0V4cHJlc3Npb25GYWN0b3J5TWV0YWRhdGEobWV0YTogUjNGYWN0b3J5TWV0YWRhdGEpOlxuICAgIG1ldGEgaXMgUjNFeHByZXNzaW9uRmFjdG9yeU1ldGFkYXRhIHtcbiAgcmV0dXJuIChtZXRhIGFzIGFueSkuZXhwcmVzc2lvbiAhPT0gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBnZXRJbmplY3RGbih0YXJnZXQ6IEZhY3RvcnlUYXJnZXQpOiBvLkV4dGVybmFsUmVmZXJlbmNlIHtcbiAgc3dpdGNoICh0YXJnZXQpIHtcbiAgICBjYXNlIEZhY3RvcnlUYXJnZXQuQ29tcG9uZW50OlxuICAgIGNhc2UgRmFjdG9yeVRhcmdldC5EaXJlY3RpdmU6XG4gICAgY2FzZSBGYWN0b3J5VGFyZ2V0LlBpcGU6XG4gICAgICByZXR1cm4gUjMuZGlyZWN0aXZlSW5qZWN0O1xuICAgIGNhc2UgRmFjdG9yeVRhcmdldC5OZ01vZHVsZTpcbiAgICBjYXNlIEZhY3RvcnlUYXJnZXQuSW5qZWN0YWJsZTpcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFIzLmluamVjdDtcbiAgfVxufVxuIl19