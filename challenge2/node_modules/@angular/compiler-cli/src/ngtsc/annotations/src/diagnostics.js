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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/diagnostics", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/partial_evaluator", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkInheritanceOfDirective = exports.getUndecoratedClassWithAngularFeaturesDiagnostic = exports.getDirectiveDiagnostics = exports.getProviderDiagnostics = exports.createValueHasWrongTypeError = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var partial_evaluator_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    /**
     * Creates a `FatalDiagnosticError` for a node that did not evaluate to the expected type. The
     * diagnostic that is created will include details on why the value is incorrect, i.e. it includes
     * a representation of the actual type that was unsupported, or in the case of a dynamic value the
     * trace to the node where the dynamic value originated.
     *
     * @param node The node for which the diagnostic should be produced.
     * @param value The evaluated value that has the wrong type.
     * @param messageText The message text of the error.
     */
    function createValueHasWrongTypeError(node, value, messageText) {
        var _a;
        var chainedMessage;
        var relatedInformation;
        if (value instanceof partial_evaluator_1.DynamicValue) {
            chainedMessage = 'Value could not be determined statically.';
            relatedInformation = partial_evaluator_1.traceDynamicValue(node, value);
        }
        else if (value instanceof imports_1.Reference) {
            var target = value.debugName !== null ? "'" + value.debugName + "'" : 'an anonymous declaration';
            chainedMessage = "Value is a reference to " + target + ".";
            var referenceNode = (_a = typescript_1.identifierOfNode(value.node)) !== null && _a !== void 0 ? _a : value.node;
            relatedInformation = [diagnostics_1.makeRelatedInformation(referenceNode, 'Reference is declared here.')];
        }
        else {
            chainedMessage = "Value is of type '" + partial_evaluator_1.describeResolvedType(value) + "'.";
        }
        var chain = {
            messageText: messageText,
            category: ts.DiagnosticCategory.Error,
            code: 0,
            next: [{
                    messageText: chainedMessage,
                    category: ts.DiagnosticCategory.Message,
                    code: 0,
                }]
        };
        return new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, node, chain, relatedInformation);
    }
    exports.createValueHasWrongTypeError = createValueHasWrongTypeError;
    /**
     * Gets the diagnostics for a set of provider classes.
     * @param providerClasses Classes that should be checked.
     * @param providersDeclaration Node that declares the providers array.
     * @param registry Registry that keeps track of the registered injectable classes.
     */
    function getProviderDiagnostics(providerClasses, providersDeclaration, registry) {
        var e_1, _a;
        var diagnostics = [];
        try {
            for (var providerClasses_1 = tslib_1.__values(providerClasses), providerClasses_1_1 = providerClasses_1.next(); !providerClasses_1_1.done; providerClasses_1_1 = providerClasses_1.next()) {
                var provider = providerClasses_1_1.value;
                if (registry.isInjectable(provider.node)) {
                    continue;
                }
                var contextNode = provider.getOriginForDiagnostics(providersDeclaration);
                diagnostics.push(diagnostics_1.makeDiagnostic(diagnostics_1.ErrorCode.UNDECORATED_PROVIDER, contextNode, "The class '" + provider.node.name
                    .text + "' cannot be created via dependency injection, as it does not have an Angular decorator. This will result in an error at runtime.\n\nEither add the @Injectable() decorator to '" + provider.node.name
                    .text + "', or configure a different provider (such as a provider with 'useFactory').\n", [diagnostics_1.makeRelatedInformation(provider.node, "'" + provider.node.name.text + "' is declared here.")]));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (providerClasses_1_1 && !providerClasses_1_1.done && (_a = providerClasses_1.return)) _a.call(providerClasses_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return diagnostics;
    }
    exports.getProviderDiagnostics = getProviderDiagnostics;
    function getDirectiveDiagnostics(node, reader, evaluator, reflector, scopeRegistry, kind) {
        var diagnostics = [];
        var addDiagnostics = function (more) {
            if (more === null) {
                return;
            }
            else if (diagnostics === null) {
                diagnostics = Array.isArray(more) ? more : [more];
            }
            else if (Array.isArray(more)) {
                diagnostics.push.apply(diagnostics, tslib_1.__spreadArray([], tslib_1.__read(more)));
            }
            else {
                diagnostics.push(more);
            }
        };
        var duplicateDeclarations = scopeRegistry.getDuplicateDeclarations(node);
        if (duplicateDeclarations !== null) {
            addDiagnostics(util_1.makeDuplicateDeclarationError(node, duplicateDeclarations, kind));
        }
        addDiagnostics(checkInheritanceOfDirective(node, reader, reflector, evaluator));
        return diagnostics;
    }
    exports.getDirectiveDiagnostics = getDirectiveDiagnostics;
    function getUndecoratedClassWithAngularFeaturesDiagnostic(node) {
        return diagnostics_1.makeDiagnostic(diagnostics_1.ErrorCode.UNDECORATED_CLASS_USING_ANGULAR_FEATURES, node.name, "Class is using Angular features but is not decorated. Please add an explicit " +
            "Angular decorator.");
    }
    exports.getUndecoratedClassWithAngularFeaturesDiagnostic = getUndecoratedClassWithAngularFeaturesDiagnostic;
    function checkInheritanceOfDirective(node, reader, reflector, evaluator) {
        if (!reflector.isClass(node) || reflector.getConstructorParameters(node) !== null) {
            // We should skip nodes that aren't classes. If a constructor exists, then no base class
            // definition is required on the runtime side - it's legal to inherit from any class.
            return null;
        }
        // The extends clause is an expression which can be as dynamic as the user wants. Try to
        // evaluate it, but fall back on ignoring the clause if it can't be understood. This is a View
        // Engine compatibility hack: View Engine ignores 'extends' expressions that it cannot understand.
        var baseClass = util_1.readBaseClass(node, reflector, evaluator);
        while (baseClass !== null) {
            if (baseClass === 'dynamic') {
                return null;
            }
            // We can skip the base class if it has metadata.
            var baseClassMeta = reader.getDirectiveMetadata(baseClass);
            if (baseClassMeta !== null) {
                return null;
            }
            // If the base class has a blank constructor we can skip it since it can't be using DI.
            var baseClassConstructorParams = reflector.getConstructorParameters(baseClass.node);
            var newParentClass = util_1.readBaseClass(baseClass.node, reflector, evaluator);
            if (baseClassConstructorParams !== null && baseClassConstructorParams.length > 0) {
                // This class has a non-trivial constructor, that's an error!
                return getInheritedUndecoratedCtorDiagnostic(node, baseClass, reader);
            }
            else if (baseClassConstructorParams !== null || newParentClass === null) {
                // This class has a trivial constructor, or no constructor + is the
                // top of the inheritance chain, so it's okay.
                return null;
            }
            // Go up the chain and continue
            baseClass = newParentClass;
        }
        return null;
    }
    exports.checkInheritanceOfDirective = checkInheritanceOfDirective;
    function getInheritedUndecoratedCtorDiagnostic(node, baseClass, reader) {
        var subclassMeta = reader.getDirectiveMetadata(new imports_1.Reference(node));
        var dirOrComp = subclassMeta.isComponent ? 'Component' : 'Directive';
        var baseClassName = baseClass.debugName;
        return diagnostics_1.makeDiagnostic(diagnostics_1.ErrorCode.DIRECTIVE_INHERITS_UNDECORATED_CTOR, node.name, "The " + dirOrComp.toLowerCase() + " " + node.name.text + " inherits its constructor from " + baseClassName + ", " +
            "but the latter does not have an Angular decorator of its own. Dependency injection will not be able to " +
            ("resolve the parameters of " + baseClassName + "'s constructor. Either add a @Directive decorator ") +
            ("to " + baseClassName + ", or add an explicit constructor to " + node.name.text + "."));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2Fubm90YXRpb25zL3NyYy9kaWFnbm9zdGljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBRWpDLDJFQUEwRztJQUMxRyxtRUFBd0M7SUFFeEMsdUZBQStIO0lBRy9ILGtGQUEyRDtJQUUzRCw2RUFBb0U7SUFFcEU7Ozs7Ozs7OztPQVNHO0lBQ0gsU0FBZ0IsNEJBQTRCLENBQ3hDLElBQWEsRUFBRSxLQUFvQixFQUFFLFdBQW1COztRQUMxRCxJQUFJLGNBQXNCLENBQUM7UUFDM0IsSUFBSSxrQkFBK0QsQ0FBQztRQUNwRSxJQUFJLEtBQUssWUFBWSxnQ0FBWSxFQUFFO1lBQ2pDLGNBQWMsR0FBRywyQ0FBMkMsQ0FBQztZQUM3RCxrQkFBa0IsR0FBRyxxQ0FBaUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDckQ7YUFBTSxJQUFJLEtBQUssWUFBWSxtQkFBUyxFQUFFO1lBQ3JDLElBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFJLEtBQUssQ0FBQyxTQUFTLE1BQUcsQ0FBQyxDQUFDLENBQUMsMEJBQTBCLENBQUM7WUFDOUYsY0FBYyxHQUFHLDZCQUEyQixNQUFNLE1BQUcsQ0FBQztZQUV0RCxJQUFNLGFBQWEsR0FBRyxNQUFBLDZCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsbUNBQUksS0FBSyxDQUFDLElBQUksQ0FBQztZQUNqRSxrQkFBa0IsR0FBRyxDQUFDLG9DQUFzQixDQUFDLGFBQWEsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDLENBQUM7U0FDN0Y7YUFBTTtZQUNMLGNBQWMsR0FBRyx1QkFBcUIsd0NBQW9CLENBQUMs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R0FBRyxDQUFDLEVBQUU7Z0JBQ2hGLDZEQUE2RDtnQkFDN0QsT0FBTyxxQ0FBcUMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3ZFO2lCQUFNLElBQUksMEJBQTBCLEtBQUssSUFBSSxJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3pFLG1FQUFtRTtnQkFDbkUsOENBQThDO2dCQUM5QyxPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsK0JBQStCO1lBQy9CLFNBQVMsR0FBRyxjQUFjLENBQUM7U0FDNUI7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUEzQ0Qsa0VBMkNDO0lBRUQsU0FBUyxxQ0FBcUMsQ0FDMUMsSUFBc0IsRUFBRSxTQUFvQixFQUFFLE1BQXNCO1FBQ3RFLElBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLG1CQUFTLENBQUMsSUFBSSxDQUFDLENBQUUsQ0FBQztRQUN2RSxJQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztRQUN2RSxJQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO1FBRTFDLE9BQU8sNEJBQWMsQ0FDakIsdUJBQVMsQ0FBQyxtQ0FBbUMsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUN4RCxTQUFPLFNBQVMsQ0FBQyxXQUFXLEVBQUUsU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksdUNBQzVDLGFBQWEsT0FBSTtZQUNqQix5R0FBeUc7YUFDekcsK0JBQ0ksYUFBYSx1REFBb0QsQ0FBQTthQUNyRSxRQUFNLGFBQWEsNENBQXVDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFHLENBQUEsQ0FBQyxDQUFDO0lBQ3ZGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7RXJyb3JDb2RlLCBGYXRhbERpYWdub3N0aWNFcnJvciwgbWFrZURpYWdub3N0aWMsIG1ha2VSZWxhdGVkSW5mb3JtYXRpb259IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzJztcbmltcG9ydCB7UmVmZXJlbmNlfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7SW5qZWN0YWJsZUNsYXNzUmVnaXN0cnksIE1ldGFkYXRhUmVhZGVyfSBmcm9tICcuLi8uLi9tZXRhZGF0YSc7XG5pbXBvcnQge2Rlc2NyaWJlUmVzb2x2ZWRUeXBlLCBEeW5hbWljVmFsdWUsIFBhcnRpYWxFdmFsdWF0b3IsIFJlc29sdmVkVmFsdWUsIHRyYWNlRHluYW1pY1ZhbHVlfSBmcm9tICcuLi8uLi9wYXJ0aWFsX2V2YWx1YXRvcic7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb24sIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7TG9jYWxNb2R1bGVTY29wZVJlZ2lzdHJ5fSBmcm9tICcuLi8uLi9zY29wZSc7XG5pbXBvcnQge2lkZW50aWZpZXJPZk5vZGV9IGZyb20gJy4uLy4uL3V0aWwvc3JjL3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge21ha2VEdXBsaWNhdGVEZWNsYXJhdGlvbkVycm9yLCByZWFkQmFzZUNsYXNzfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBgRmF0YWxEaWFnbm9zdGljRXJyb3JgIGZvciBhIG5vZGUgdGhhdCBkaWQgbm90IGV2YWx1YXRlIHRvIHRoZSBleHBlY3RlZCB0eXBlLiBUaGVcbiAqIGRpYWdub3N0aWMgdGhhdCBpcyBjcmVhdGVkIHdpbGwgaW5jbHVkZSBkZXRhaWxzIG9uIHdoeSB0aGUgdmFsdWUgaXMgaW5jb3JyZWN0LCBpLmUuIGl0IGluY2x1ZGVzXG4gKiBhIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhY3R1YWwgdHlwZSB0aGF0IHdhcyB1bnN1cHBvcnRlZCwgb3IgaW4gdGhlIGNhc2Ugb2YgYSBkeW5hbWljIHZhbHVlIHRoZVxuICogdHJhY2UgdG8gdGhlIG5vZGUgd2hlcmUgdGhlIGR5bmFtaWMgdmFsdWUgb3JpZ2luYXRlZC5cbiAqXG4gKiBAcGFyYW0gbm9kZSBUaGUgbm9kZSBmb3Igd2hpY2ggdGhlIGRpYWdub3N0aWMgc2hvdWxkIGJlIHByb2R1Y2VkLlxuICogQHBhcmFtIHZhbHVlIFRoZSBldmFsdWF0ZWQgdmFsdWUgdGhhdCBoYXMgdGhlIHdyb25nIHR5cGUuXG4gKiBAcGFyYW0gbWVzc2FnZVRleHQgVGhlIG1lc3NhZ2UgdGV4dCBvZiB0aGUgZXJyb3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yKFxuICAgIG5vZGU6IHRzLk5vZGUsIHZhbHVlOiBSZXNvbHZlZFZhbHVlLCBtZXNzYWdlVGV4dDogc3RyaW5nKTogRmF0YWxEaWFnbm9zdGljRXJyb3Ige1xuICBsZXQgY2hhaW5lZE1lc3NhZ2U6IHN0cmluZztcbiAgbGV0IHJlbGF0ZWRJbmZvcm1hdGlvbjogdHMuRGlhZ25vc3RpY1JlbGF0ZWRJbmZvcm1hdGlvbltdfHVuZGVmaW5lZDtcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRHluYW1pY1ZhbHVlKSB7XG4gICAgY2hhaW5lZE1lc3NhZ2UgPSAnVmFsdWUgY291bGQgbm90IGJlIGRldGVybWluZWQgc3RhdGljYWxseS4nO1xuICAgIHJlbGF0ZWRJbmZvcm1hdGlvbiA9IHRyYWNlRHluYW1pY1ZhbHVlKG5vZGUsIHZhbHVlKTtcbiAgfSBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFJlZmVyZW5jZSkge1xuICAgIGNvbnN0IHRhcmdldCA9IHZhbHVlLmRlYnVnTmFtZSAhPT0gbnVsbCA/IGAnJHt2YWx1ZS5kZWJ1Z05hbWV9J2AgOiAnYW4gYW5vbnltb3VzIGRlY2xhcmF0aW9uJztcbiAgICBjaGFpbmVkTWVzc2FnZSA9IGBWYWx1ZSBpcyBhIHJlZmVyZW5jZSB0byAke3RhcmdldH0uYDtcblxuICAgIGNvbnN0IHJlZmVyZW5jZU5vZGUgPSBpZGVudGlmaWVyT2ZOb2RlKHZhbHVlLm5vZGUpID8/IHZhbHVlLm5vZGU7XG4gICAgcmVsYXRlZEluZm9ybWF0aW9uID0gW21ha2VSZWxhdGVkSW5mb3JtYXRpb24ocmVmZXJlbmNlTm9kZSwgJ1JlZmVyZW5jZSBpcyBkZWNsYXJlZCBoZXJlLicpXTtcbiAgfSBlbHNlIHtcbiAgICBjaGFpbmVkTWVzc2FnZSA9IGBWYWx1ZSBpcyBvZiB0eXBlICcke2Rlc2NyaWJlUmVzb2x2ZWRUeXBlKHZhbHVlKX0nLmA7XG4gIH1cblxuICBjb25zdCBjaGFpbjogdHMuRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiA9IHtcbiAgICBtZXNzYWdlVGV4dCxcbiAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgIGNvZGU6IDAsXG4gICAgbmV4dDogW3tcbiAgICAgIG1lc3NhZ2VUZXh0OiBjaGFpbmVkTWVzc2FnZSxcbiAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuTWVzc2FnZSxcbiAgICAgIGNvZGU6IDAsXG4gICAgfV1cbiAgfTtcblxuICByZXR1cm4gbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKEVycm9yQ29kZS5WQUxVRV9IQVNfV1JPTkdfVFlQRSwgbm9kZSwgY2hhaW4sIHJlbGF0ZWRJbmZvcm1hdGlvbik7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgZGlhZ25vc3RpY3MgZm9yIGEgc2V0IG9mIHByb3ZpZGVyIGNsYXNzZXMuXG4gKiBAcGFyYW0gcHJvdmlkZXJDbGFzc2VzIENsYXNzZXMgdGhhdCBzaG91bGQgYmUgY2hlY2tlZC5cbiAqIEBwYXJhbSBwcm92aWRlcnNEZWNsYXJhdGlvbiBOb2RlIHRoYXQgZGVjbGFyZXMgdGhlIHByb3ZpZGVycyBhcnJheS5cbiAqIEBwYXJhbSByZWdpc3RyeSBSZWdpc3RyeSB0aGF0IGtlZXBzIHRyYWNrIG9mIHRoZSByZWdpc3RlcmVkIGluamVjdGFibGUgY2xhc3Nlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3ZpZGVyRGlhZ25vc3RpY3MoXG4gICAgcHJvdmlkZXJDbGFzc2VzOiBTZXQ8UmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+PiwgcHJvdmlkZXJzRGVjbGFyYXRpb246IHRzLkV4cHJlc3Npb24sXG4gICAgcmVnaXN0cnk6IEluamVjdGFibGVDbGFzc1JlZ2lzdHJ5KTogdHMuRGlhZ25vc3RpY1tdIHtcbiAgY29uc3QgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuXG4gIGZvciAoY29uc3QgcHJvdmlkZXIgb2YgcHJvdmlkZXJDbGFzc2VzKSB7XG4gICAgaWYgKHJlZ2lzdHJ5LmlzSW5qZWN0YWJsZShwcm92aWRlci5ub2RlKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGV4dE5vZGUgPSBwcm92aWRlci5nZXRPcmlnaW5Gb3JEaWFnbm9zdGljcyhwcm92aWRlcnNEZWNsYXJhdGlvbik7XG4gICAgZGlhZ25vc3RpY3MucHVzaChtYWtlRGlhZ25vc3RpYyhcbiAgICAgICAgRXJyb3JDb2RlLlVOREVDT1JBVEVEX1BST1ZJREVSLCBjb250ZXh0Tm9kZSxcbiAgICAgICAgYFRoZSBjbGFzcyAnJHtcbiAgICAgICAgICAgIHByb3ZpZGVyLm5vZGUubmFtZVxuICAgICAgICAgICAgICAgIC50ZXh0fScgY2Fubm90IGJlIGNyZWF0ZWQgdmlhIGRlcGVuZGVuY3kgaW5qZWN0aW9uLCBhcyBpdCBkb2VzIG5vdCBoYXZlIGFuIEFuZ3VsYXIgZGVjb3JhdG9yLiBUaGlzIHdpbGwgcmVzdWx0IGluIGFuIGVycm9yIGF0IHJ1bnRpbWUuXG5cbkVpdGhlciBhZGQgdGhlIEBJbmplY3RhYmxlKCkgZGVjb3JhdG9yIHRvICcke1xuICAgICAgICAgICAgcHJvdmlkZXIubm9kZS5uYW1lXG4gICAgICAgICAgICAgICAgLnRleHR9Jywgb3IgY29uZmlndXJlIGEgZGlmZmVyZW50IHByb3ZpZGVyIChzdWNoIGFzIGEgcHJvdmlkZXIgd2l0aCAndXNlRmFjdG9yeScpLlxuYCxcbiAgICAgICAgW21ha2VSZWxhdGVkSW5mb3JtYXRpb24ocHJvdmlkZXIubm9kZSwgYCcke3Byb3ZpZGVyLm5vZGUubmFtZS50ZXh0fScgaXMgZGVjbGFyZWQgaGVyZS5gKV0pKTtcbiAgfVxuXG4gIHJldHVybiBkaWFnbm9zdGljcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERpcmVjdGl2ZURpYWdub3N0aWNzKFxuICAgIG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIHJlYWRlcjogTWV0YWRhdGFSZWFkZXIsIGV2YWx1YXRvcjogUGFydGlhbEV2YWx1YXRvcixcbiAgICByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LCBzY29wZVJlZ2lzdHJ5OiBMb2NhbE1vZHVsZVNjb3BlUmVnaXN0cnksXG4gICAga2luZDogc3RyaW5nKTogdHMuRGlhZ25vc3RpY1tdfG51bGwge1xuICBsZXQgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXXxudWxsID0gW107XG5cbiAgY29uc3QgYWRkRGlhZ25vc3RpY3MgPSAobW9yZTogdHMuRGlhZ25vc3RpY3x0cy5EaWFnbm9zdGljW118bnVsbCkgPT4ge1xuICAgIGlmIChtb3JlID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChkaWFnbm9zdGljcyA9PT0gbnVsbCkge1xuICAgICAgZGlhZ25vc3RpY3MgPSBBcnJheS5pc0FycmF5KG1vcmUpID8gbW9yZSA6IFttb3JlXTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkobW9yZSkpIHtcbiAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4ubW9yZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpYWdub3N0aWNzLnB1c2gobW9yZSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGR1cGxpY2F0ZURlY2xhcmF0aW9ucyA9IHNjb3BlUmVnaXN0cnkuZ2V0RHVwbGljYXRlRGVjbGFyYXRpb25zKG5vZGUpO1xuXG4gIGlmIChkdXBsaWNhdGVEZWNsYXJhdGlvbnMgIT09IG51bGwpIHtcbiAgICBhZGREaWFnbm9zdGljcyhtYWtlRHVwbGljYXRlRGVjbGFyYXRpb25FcnJvcihub2RlLCBkdXBsaWNhdGVEZWNsYXJhdGlvbnMsIGtpbmQpKTtcbiAgfVxuXG4gIGFkZERpYWdub3N0aWNzKGNoZWNrSW5oZXJpdGFuY2VPZkRpcmVjdGl2ZShub2RlLCByZWFkZXIsIHJlZmxlY3RvciwgZXZhbHVhdG9yKSk7XG4gIHJldHVybiBkaWFnbm9zdGljcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFVuZGVjb3JhdGVkQ2xhc3NXaXRoQW5ndWxhckZlYXR1cmVzRGlhZ25vc3RpYyhub2RlOiBDbGFzc0RlY2xhcmF0aW9uKTpcbiAgICB0cy5EaWFnbm9zdGljIHtcbiAgcmV0dXJuIG1ha2VEaWFnbm9zdGljKFxuICAgICAgRXJyb3JDb2RlLlVOREVDT1JBVEVEX0NMQVNTX1VTSU5HX0FOR1VMQVJfRkVBVFVSRVMsIG5vZGUubmFtZSxcbiAgICAgIGBDbGFzcyBpcyB1c2luZyBBbmd1bGFyIGZlYXR1cmVzIGJ1dCBpcyBub3QgZGVjb3JhdGVkLiBQbGVhc2UgYWRkIGFuIGV4cGxpY2l0IGAgK1xuICAgICAgICAgIGBBbmd1bGFyIGRlY29yYXRvci5gKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrSW5oZXJpdGFuY2VPZkRpcmVjdGl2ZShcbiAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCByZWFkZXI6IE1ldGFkYXRhUmVhZGVyLCByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LFxuICAgIGV2YWx1YXRvcjogUGFydGlhbEV2YWx1YXRvcik6IHRzLkRpYWdub3N0aWN8bnVsbCB7XG4gIGlmICghcmVmbGVjdG9yLmlzQ2xhc3Mobm9kZSkgfHwgcmVmbGVjdG9yLmdldENvbnN0cnVjdG9yUGFyYW1ldGVycyhub2RlKSAhPT0gbnVsbCkge1xuICAgIC8vIFdlIHNob3VsZCBza2lwIG5vZGVzIHRoYXQgYXJlbid0IGNsYXNzZXMuIElmIGEgY29uc3RydWN0b3IgZXhpc3RzLCB0aGVuIG5vIGJhc2UgY2xhc3NcbiAgICAvLyBkZWZpbml0aW9uIGlzIHJlcXVpcmVkIG9uIHRoZSBydW50aW1lIHNpZGUgLSBpdCdzIGxlZ2FsIHRvIGluaGVyaXQgZnJvbSBhbnkgY2xhc3MuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBUaGUgZXh0ZW5kcyBjbGF1c2UgaXMgYW4gZXhwcmVzc2lvbiB3aGljaCBjYW4gYmUgYXMgZHluYW1pYyBhcyB0aGUgdXNlciB3YW50cy4gVHJ5IHRvXG4gIC8vIGV2YWx1YXRlIGl0LCBidXQgZmFsbCBiYWNrIG9uIGlnbm9yaW5nIHRoZSBjbGF1c2UgaWYgaXQgY2FuJ3QgYmUgdW5kZXJzdG9vZC4gVGhpcyBpcyBhIFZpZXdcbiAgLy8gRW5naW5lIGNvbXBhdGliaWxpdHkgaGFjazogVmlldyBFbmdpbmUgaWdub3JlcyAnZXh0ZW5kcycgZXhwcmVzc2lvbnMgdGhhdCBpdCBjYW5ub3QgdW5kZXJzdGFuZC5cbiAgbGV0IGJhc2VDbGFzcyA9IHJlYWRCYXNlQ2xhc3Mobm9kZSwgcmVmbGVjdG9yLCBldmFsdWF0b3IpO1xuXG4gIHdoaWxlIChiYXNlQ2xhc3MgIT09IG51bGwpIHtcbiAgICBpZiAoYmFzZUNsYXNzID09PSAnZHluYW1pYycpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFdlIGNhbiBza2lwIHRoZSBiYXNlIGNsYXNzIGlmIGl0IGhhcyBtZXRhZGF0YS5cbiAgICBjb25zdCBiYXNlQ2xhc3NNZXRhID0gcmVhZGVyLmdldERpcmVjdGl2ZU1ldGFkYXRhKGJhc2VDbGFzcyk7XG4gICAgaWYgKGJhc2VDbGFzc01ldGEgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBiYXNlIGNsYXNzIGhhcyBhIGJsYW5rIGNvbnN0cnVjdG9yIHdlIGNhbiBza2lwIGl0IHNpbmNlIGl0IGNhbid0IGJlIHVzaW5nIERJLlxuICAgIGNvbnN0IGJhc2VDbGFzc0NvbnN0cnVjdG9yUGFyYW1zID0gcmVmbGVjdG9yLmdldENvbnN0cnVjdG9yUGFyYW1ldGVycyhiYXNlQ2xhc3Mubm9kZSk7XG4gICAgY29uc3QgbmV3UGFyZW50Q2xhc3MgPSByZWFkQmFzZUNsYXNzKGJhc2VDbGFzcy5ub2RlLCByZWZsZWN0b3IsIGV2YWx1YXRvcik7XG5cbiAgICBpZiAoYmFzZUNsYXNzQ29uc3RydWN0b3JQYXJhbXMgIT09IG51bGwgJiYgYmFzZUNsYXNzQ29uc3RydWN0b3JQYXJhbXMubGVuZ3RoID4gMCkge1xuICAgICAgLy8gVGhpcyBjbGFzcyBoYXMgYSBub24tdHJpdmlhbCBjb25zdHJ1Y3RvciwgdGhhdCdzIGFuIGVycm9yIVxuICAgICAgcmV0dXJuIGdldEluaGVyaXRlZFVuZGVjb3JhdGVkQ3RvckRpYWdub3N0aWMobm9kZSwgYmFzZUNsYXNzLCByZWFkZXIpO1xuICAgIH0gZWxzZSBpZiAoYmFzZUNsYXNzQ29uc3RydWN0b3JQYXJhbXMgIT09IG51bGwgfHwgbmV3UGFyZW50Q2xhc3MgPT09IG51bGwpIHtcbiAgICAgIC8vIFRoaXMgY2xhc3MgaGFzIGEgdHJpdmlhbCBjb25zdHJ1Y3Rvciwgb3Igbm8gY29uc3RydWN0b3IgKyBpcyB0aGVcbiAgICAgIC8vIHRvcCBvZiB0aGUgaW5oZXJpdGFuY2UgY2hhaW4sIHNvIGl0J3Mgb2theS5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIEdvIHVwIHRoZSBjaGFpbiBhbmQgY29udGludWVcbiAgICBiYXNlQ2xhc3MgPSBuZXdQYXJlbnRDbGFzcztcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBnZXRJbmhlcml0ZWRVbmRlY29yYXRlZEN0b3JEaWFnbm9zdGljKFxuICAgIG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGJhc2VDbGFzczogUmVmZXJlbmNlLCByZWFkZXI6IE1ldGFkYXRhUmVhZGVyKSB7XG4gIGNvbnN0IHN1YmNsYXNzTWV0YSA9IHJlYWRlci5nZXREaXJlY3RpdmVNZXRhZGF0YShuZXcgUmVmZXJlbmNlKG5vZGUpKSE7XG4gIGNvbnN0IGRpck9yQ29tcCA9IHN1YmNsYXNzTWV0YS5pc0NvbXBvbmVudCA/ICdDb21wb25lbnQnIDogJ0RpcmVjdGl2ZSc7XG4gIGNvbnN0IGJhc2VDbGFzc05hbWUgPSBiYXNlQ2xhc3MuZGVidWdOYW1lO1xuXG4gIHJldHVybiBtYWtlRGlhZ25vc3RpYyhcbiAgICAgIEVycm9yQ29kZS5ESVJFQ1RJVkVfSU5IRVJJVFNfVU5ERUNPUkFURURfQ1RPUiwgbm9kZS5uYW1lLFxuICAgICAgYFRoZSAke2Rpck9yQ29tcC50b0xvd2VyQ2FzZSgpfSAke25vZGUubmFtZS50ZXh0fSBpbmhlcml0cyBpdHMgY29uc3RydWN0b3IgZnJvbSAke1xuICAgICAgICAgIGJhc2VDbGFzc05hbWV9LCBgICtcbiAgICAgICAgICBgYnV0IHRoZSBsYXR0ZXIgZG9lcyBub3QgaGF2ZSBhbiBBbmd1bGFyIGRlY29yYXRvciBvZiBpdHMgb3duLiBEZXBlbmRlbmN5IGluamVjdGlvbiB3aWxsIG5vdCBiZSBhYmxlIHRvIGAgK1xuICAgICAgICAgIGByZXNvbHZlIHRoZSBwYXJhbWV0ZXJzIG9mICR7XG4gICAgICAgICAgICAgIGJhc2VDbGFzc05hbWV9J3MgY29uc3RydWN0b3IuIEVpdGhlciBhZGQgYSBARGlyZWN0aXZlIGRlY29yYXRvciBgICtcbiAgICAgICAgICBgdG8gJHtiYXNlQ2xhc3NOYW1lfSwgb3IgYWRkIGFuIGV4cGxpY2l0IGNvbnN0cnVjdG9yIHRvICR7bm9kZS5uYW1lLnRleHR9LmApO1xufVxuIl19