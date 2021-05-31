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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/metadata", ["require", "exports", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extractClassMetadata = void 0;
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    /**
     * Given a class declaration, generate a call to `setClassMetadata` with the Angular metadata
     * present on the class or its member fields. An ngDevMode guard is used to allow the call to be
     * tree-shaken away, as the `setClassMetadata` invocation is only needed for testing purposes.
     *
     * If no such metadata is present, this function returns `null`. Otherwise, the call is returned
     * as a `Statement` for inclusion along with the class.
     */
    function extractClassMetadata(clazz, reflection, isCore, annotateForClosureCompiler) {
        if (!reflection.isClass(clazz)) {
            return null;
        }
        var id = reflection.getAdjacentNameOfClass(clazz);
        // Reflect over the class decorators. If none are present, or those that are aren't from
        // Angular, then return null. Otherwise, turn them into metadata.
        var classDecorators = reflection.getDecoratorsOfDeclaration(clazz);
        if (classDecorators === null) {
            return null;
        }
        var ngClassDecorators = classDecorators.filter(function (dec) { return isAngularDecorator(dec, isCore); })
            .map(function (decorator) { return decoratorToMetadata(decorator, annotateForClosureCompiler); })
            // Since the `setClassMetadata` call is intended to be emitted after the class
            // declaration, we have to strip references to the existing identifiers or
            // TypeScript might generate invalid code when it emits to JS. In particular
            // this can break when emitting a class to ES5 which has a custom decorator
            // and is referenced inside of its own metadata (see #39509 for more information).
            .map(function (decorator) { return removeIdentifierReferences(decorator, id.text); });
        if (ngClassDecorators.length === 0) {
            return null;
        }
        var metaDecorators = new compiler_1.WrappedNodeExpr(ts.createArrayLiteral(ngClassDecorators));
        // Convert the constructor parameters to metadata, passing null if none are present.
        var metaCtorParameters = null;
        var classCtorParameters = reflection.getConstructorParameters(clazz);
        if (classCtorParameters !== null) {
            var ctorParameters = classCtorParameters.map(function (param) { return ctorParameterToMetadata(param, isCore); });
            metaCtorParameters = new compiler_1.FunctionExpr([], [
                new compiler_1.ReturnStatement(new compiler_1.LiteralArrayExpr(ctorParameters)),
            ]);
        }
        // Do the same for property decorators.
        var metaPropDecorators = null;
        var classMembers = reflection.getMembersOfClass(clazz).filter(function (member) { return !member.isStatic && member.decorators !== null && member.decorators.length > 0; });
        var duplicateDecoratedMemberNames = classMembers.map(function (member) { return member.name; }).filter(function (name, i, arr) { return arr.indexOf(name) < i; });
        if (duplicateDecoratedMemberNames.length > 0) {
            // This should theoretically never happen, because the only way to have duplicate instance
            // member names is getter/setter pairs and decorators cannot appear in both a getter and the
            // corresponding setter.
            throw new Error("Duplicate decorated properties found on class '" + clazz.name.text + "': " +
                duplicateDecoratedMemberNames.join(', '));
        }
        var decoratedMembers = classMembers.map(function (member) { var _a; return classMemberToMetadata((_a = member.nameNode) !== null && _a !== void 0 ? _a : member.name, member.decorators, isCore); });
        if (decoratedMembers.length > 0) {
            metaPropDecorators = new compiler_1.WrappedNodeExpr(ts.createObjectLiteral(decoratedMembers));
        }
        return {
            type: new compiler_1.WrappedNodeExpr(id),
            decorators: metaDecorators,
            ctorParameters: metaCtorParameters,
            propDecorators: metaPropDecorators,
        };
    }
    exports.extractClassMetadata = extractClassMetadata;
    /**
     * Convert a reflected constructor parameter to metadata.
     */
    function ctorParameterToMetadata(param, isCore) {
        // Parameters sometimes have a type that can be referenced. If so, then use it, otherwise
        // its type is undefined.
        var type = param.typeValueReference.kind !== 2 /* UNAVAILABLE */ ?
            util_1.valueReferenceToExpression(param.typeValueReference) :
            new compiler_1.LiteralExpr(undefined);
        var mapEntries = [
            { key: 'type', value: type, quoted: false },
        ];
        // If the parameter has decorators, include the ones from Angular.
        if (param.decorators !== null) {
            var ngDecorators = param.decorators.filter(function (dec) { return isAngularDecorator(dec, isCore); })
                .map(function (decorator) { return decoratorToMetadata(decorator); });
            var value = new compiler_1.WrappedNodeExpr(ts.createArrayLiteral(ngDecorators));
            mapEntries.push({ key: 'decorators', value: value, quoted: false });
        }
        return compiler_1.literalMap(mapEntries);
    }
    /**
     * Convert a reflected class member to metadata.
     */
    function classMemberToMetadata(name, decorators, isCore) {
        var ngDecorators = decorators.filter(function (dec) { return isAngularDecorator(dec, isCore); })
            .map(function (decorator) { return decoratorToMetadata(decorator); });
        var decoratorMeta = ts.createArrayLiteral(ngDecorators);
        return ts.createPropertyAssignment(name, decoratorMeta);
    }
    /**
     * Convert a reflected decorator to metadata.
     */
    function decoratorToMetadata(decorator, wrapFunctionsInParens) {
        if (decorator.identifier === null) {
            throw new Error('Illegal state: synthesized decorator cannot be emitted in class metadata.');
        }
        // Decorators have a type.
        var properties = [
            ts.createPropertyAssignment('type', ts.getMutableClone(decorator.identifier)),
        ];
        // Sometimes they have arguments.
        if (decorator.args !== null && decorator.args.length > 0) {
            var args = decorator.args.map(function (arg) {
                var expr = ts.getMutableClone(arg);
                return wrapFunctionsInParens ? util_1.wrapFunctionExpressionsInParens(expr) : expr;
            });
            properties.push(ts.createPropertyAssignment('args', ts.createArrayLiteral(args)));
        }
        return ts.createObjectLiteral(properties, true);
    }
    /**
     * Whether a given decorator should be treated as an Angular decorator.
     *
     * Either it's used in @angular/core, or it's imported from there.
     */
    function isAngularDecorator(decorator, isCore) {
        return isCore || (decorator.import !== null && decorator.import.from === '@angular/core');
    }
    /**
     * Recursively recreates all of the `Identifier` descendant nodes with a particular name inside
     * of an AST node, thus removing any references to them. Useful if a particular node has to be t
     * aken from one place any emitted to another one exactly as it has been written.
     */
    function removeIdentifierReferences(node, name) {
        var result = ts.transform(node, [function (context) { return function (root) { return ts.visitNode(root, function walk(current) {
                return ts.isIdentifier(current) && current.text === name ?
                    ts.createIdentifier(current.text) :
                    ts.visitEachChild(current, walk, context);
            }); }; }]);
        return result.transformed[0];
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2Fubm90YXRpb25zL3NyYy9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBeUo7SUFDekosK0JBQWlDO0lBSWpDLDZFQUFtRjtJQUVuRjs7Ozs7OztPQU9HO0lBQ0gsU0FBZ0Isb0JBQW9CLENBQ2hDLEtBQXNCLEVBQUUsVUFBMEIsRUFBRSxNQUFlLEVBQ25FLDBCQUFvQztRQUN0QyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM5QixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXBELHdGQUF3RjtRQUN4RixpRUFBaUU7UUFDakUsSUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JFLElBQUksZUFBZSxLQUFLLElBQUksRUFBRTtZQUM1QixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBTSxpQkFBaUIsR0FDbkIsZUFBZSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBL0IsQ0FBK0IsQ0FBQzthQUN6RCxHQUFHLENBQUMsVUFBQSxTQUFTLElBQUksT0FBQSxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsMEJBQTBCLENBQUMsRUFBMUQsQ0FBMEQsQ0FBQztZQUM3RSw4RUFBOEU7WUFDOUUsMEVBQTBFO1lBQzFFLDRFQUE0RTtZQUM1RSwyRUFBMkU7WUFDM0Usa0ZBQWtGO2FBQ2pGLEdBQUcsQ0FBQyxVQUFBLFNBQVMsSUFBSSxPQUFBLDBCQUEwQixDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQTlDLENBQThDLENBQUMsQ0FBQztRQUMxRSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbEMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQU0sY0FBYyxHQUFHLElBQUksMEJBQWUsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBRXJGLG9GQUFvRjtRQUNwRixJQUFJLGtCQUFrQixHQUFvQixJQUFJLENBQUM7UUFDL0MsSUFBTSxtQkFBbUIsR0FBRyxVQUFVLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkUsSUFBSSxtQkFBbUIsS0FBSyxJQUFJLEVBQUU7WUFDaEMsSUFBTSxjQUFjLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsdUJBQXVCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUF0QyxDQUFzQyxDQUFDLENBQUM7WUFDaEcsa0JBQWtCLEdBQUcsSUFBSSx1QkFBWSxDQUFDLEVBQUUsRUFBRTtnQkFDeEMsSUFBSSwwQkFBZSxDQUFDLElBQUksMkJBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7YUFDMUQsQ0FBQyxDQUFDO1NBQ0o7UUFFRCx1Q0FBdUM7UUFDdkMsSUFBSSxrQkFBa0IsR0FBb0IsSUFBSSxDQUFDO1FBQy9DLElBQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQzNELFVBQUEsTUFBTSxJQUFJLE9BQUEsQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxVQUFVLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBOUUsQ0FBOEUsQ0FBQyxDQUFDO1FBQzlGLElBQU0sNkJBQTZCLEdBQy9CLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLENBQUMsSUFBSSxFQUFYLENBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFLLE9BQUEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQztRQUM1RixJQUFJLDZCQUE2QixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDNUMsMEZBQTBGO1lBQzFGLDRGQUE0RjtZQUM1Rix3QkFBd0I7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FDWCxvREFBa0QsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQUs7Z0JBQ3RFLDZCQUE2QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQy9DO1FBQ0QsSUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUNyQyxVQUFBLE1BQU0sWUFBSSxPQUFBLHFCQUFxQixDQUFDLE1BQUEsTUFBTSxDQUFDLFFBQVEsbUNBQUksTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsVUFBVyxFQUFFLE1BQU0sQ0FBQyxDQUFBLEVBQUEsQ0FBQyxDQUFDO1FBQ2pHLElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUMvQixrQkFBa0IsR0FBRyxJQUFJLDBCQUFlLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztTQUNwRjtRQUVELE9BQU87WUFDTCxJQUFJLEVBQUUsSUFBSSwwQkFBZSxDQUFDLEVBQUUsQ0FBQztZQUM3QixVQUFVLEVBQUUsY0FBYztZQUMxQixjQUFjLEVBQUUsa0JBQWtCO1lBQ2xDLGNBQWMsRUFBRSxrQkFBa0I7U0FDbkMsQ0FBQztJQUNKLENBQUM7SUFoRUQsb0RBZ0VDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLHVCQUF1QixDQUFDLEtBQW9CLEVBQUUsTUFBZTtRQUNwRSx5RkFBeUY7UUFDekYseUJBQXlCO1FBQ3pCLElBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLHdCQUF1QyxDQUFDLENBQUM7WUFDL0UsaUNBQTBCLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUN0RCxJQUFJLHNCQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFL0IsSUFBTSxVQUFVLEdBQXNEO1lBQ3BFLEVBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUM7U0FDMUMsQ0FBQztRQUVGLGtFQUFrRTtRQUNsRSxJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssSUFBSSxFQUFFO1lBQzdCLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsa0JBQWtCLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUEvQixDQUErQixDQUFDO2lCQUMxRCxHQUFHLENBQUMsVUFBQyxTQUFvQixJQUFLLE9BQUEsbUJBQW1CLENBQUMsU0FBUyxDQUFDLEVBQTlCLENBQThCLENBQUMsQ0FBQztZQUN4RixJQUFNLEtBQUssR0FBRyxJQUFJLDBCQUFlLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDdkUsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsS0FBSyxPQUFBLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7U0FDNUQ7UUFDRCxPQUFPLHFCQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxxQkFBcUIsQ0FDMUIsSUFBNEIsRUFBRSxVQUF1QixFQUFFLE1BQWU7UUFDeEUsSUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBL0IsQ0FBK0IsQ0FBQzthQUNwRCxHQUFHLENBQUMsVUFBQyxTQUFvQixJQUFLLE9BQUEsbUJBQW1CLENBQUMsU0FBUyxDQUFDLEVBQTlCLENBQThCLENBQUMsQ0FBQztRQUN4RixJQUFNLGFBQWEsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUQsT0FBTyxFQUFFLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMsbUJBQW1CLENBQ3hCLFNBQW9CLEVBQUUscUJBQStCO1FBQ3ZELElBQUksU0FBUyxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUU7WUFDakMsTUFBTSxJQUFJLEtBQUssQ0FBQywyRUFBMkUsQ0FBQyxDQUFDO1NBQzlGO1FBQ0QsMEJBQTBCO1FBQzFCLElBQU0sVUFBVSxHQUFrQztZQUNoRCxFQUFFLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzlFLENBQUM7UUFDRixpQ0FBaUM7UUFDakMsSUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDeEQsSUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHO2dCQUNqQyxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQyxPQUFPLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxzQ0FBK0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzlFLENBQUMsQ0FBQyxDQUFDO1lBQ0gsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkY7UUFDRCxPQUFPLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxTQUFTLGtCQUFrQixDQUFDLFNBQW9CLEVBQUUsTUFBZTtRQUMvRCxPQUFPLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEtBQUssSUFBSSxJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLGVBQWUsQ0FBQyxDQUFDO0lBQzVGLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUywwQkFBMEIsQ0FBb0IsSUFBTyxFQUFFLElBQVk7UUFDMUUsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FDdkIsSUFBSSxFQUFFLENBQUMsVUFBQSxPQUFPLElBQUksT0FBQSxVQUFBLElBQUksSUFBSSxPQUFBLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsSUFBSSxDQUFDLE9BQWdCO2dCQUN6RSxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztvQkFDdEQsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNuQyxFQUFFLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLEVBSndCLENBSXhCLEVBSmdCLENBSWhCLENBQUMsQ0FBQyxDQUFDO1FBRVQsT0FBTyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFeHByZXNzaW9uLCBGdW5jdGlvbkV4cHIsIExpdGVyYWxBcnJheUV4cHIsIExpdGVyYWxFeHByLCBsaXRlcmFsTWFwLCBSM0NsYXNzTWV0YWRhdGEsIFJldHVyblN0YXRlbWVudCwgV3JhcHBlZE5vZGVFeHByfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtDdG9yUGFyYW1ldGVyLCBEZWNsYXJhdGlvbk5vZGUsIERlY29yYXRvciwgUmVmbGVjdGlvbkhvc3QsIFR5cGVWYWx1ZVJlZmVyZW5jZUtpbmR9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuXG5pbXBvcnQge3ZhbHVlUmVmZXJlbmNlVG9FeHByZXNzaW9uLCB3cmFwRnVuY3Rpb25FeHByZXNzaW9uc0luUGFyZW5zfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIEdpdmVuIGEgY2xhc3MgZGVjbGFyYXRpb24sIGdlbmVyYXRlIGEgY2FsbCB0byBgc2V0Q2xhc3NNZXRhZGF0YWAgd2l0aCB0aGUgQW5ndWxhciBtZXRhZGF0YVxuICogcHJlc2VudCBvbiB0aGUgY2xhc3Mgb3IgaXRzIG1lbWJlciBmaWVsZHMuIEFuIG5nRGV2TW9kZSBndWFyZCBpcyB1c2VkIHRvIGFsbG93IHRoZSBjYWxsIHRvIGJlXG4gKiB0cmVlLXNoYWtlbiBhd2F5LCBhcyB0aGUgYHNldENsYXNzTWV0YWRhdGFgIGludm9jYXRpb24gaXMgb25seSBuZWVkZWQgZm9yIHRlc3RpbmcgcHVycG9zZXMuXG4gKlxuICogSWYgbm8gc3VjaCBtZXRhZGF0YSBpcyBwcmVzZW50LCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgYG51bGxgLiBPdGhlcndpc2UsIHRoZSBjYWxsIGlzIHJldHVybmVkXG4gKiBhcyBhIGBTdGF0ZW1lbnRgIGZvciBpbmNsdXNpb24gYWxvbmcgd2l0aCB0aGUgY2xhc3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0Q2xhc3NNZXRhZGF0YShcbiAgICBjbGF6ejogRGVjbGFyYXRpb25Ob2RlLCByZWZsZWN0aW9uOiBSZWZsZWN0aW9uSG9zdCwgaXNDb3JlOiBib29sZWFuLFxuICAgIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyPzogYm9vbGVhbik6IFIzQ2xhc3NNZXRhZGF0YXxudWxsIHtcbiAgaWYgKCFyZWZsZWN0aW9uLmlzQ2xhc3MoY2xhenopKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgaWQgPSByZWZsZWN0aW9uLmdldEFkamFjZW50TmFtZU9mQ2xhc3MoY2xhenopO1xuXG4gIC8vIFJlZmxlY3Qgb3ZlciB0aGUgY2xhc3MgZGVjb3JhdG9ycy4gSWYgbm9uZSBhcmUgcHJlc2VudCwgb3IgdGhvc2UgdGhhdCBhcmUgYXJlbid0IGZyb21cbiAgLy8gQW5ndWxhciwgdGhlbiByZXR1cm4gbnVsbC4gT3RoZXJ3aXNlLCB0dXJuIHRoZW0gaW50byBtZXRhZGF0YS5cbiAgY29uc3QgY2xhc3NEZWNvcmF0b3JzID0gcmVmbGVjdGlvbi5nZXREZWNvcmF0b3JzT2ZEZWNsYXJhdGlvbihjbGF6eik7XG4gIGlmIChjbGFzc0RlY29yYXRvcnMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBuZ0NsYXNzRGVjb3JhdG9ycyA9XG4gICAgICBjbGFzc0RlY29yYXRvcnMuZmlsdGVyKGRlYyA9PiBpc0FuZ3VsYXJEZWNvcmF0b3IoZGVjLCBpc0NvcmUpKVxuICAgICAgICAgIC5tYXAoZGVjb3JhdG9yID0+IGRlY29yYXRvclRvTWV0YWRhdGEoZGVjb3JhdG9yLCBhbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlcikpXG4gICAgICAgICAgLy8gU2luY2UgdGhlIGBzZXRDbGFzc01ldGFkYXRhYCBjYWxsIGlzIGludGVuZGVkIHRvIGJlIGVtaXR0ZWQgYWZ0ZXIgdGhlIGNsYXNzXG4gICAgICAgICAgLy8gZGVjbGFyYXRpb24sIHdlIGhhdmUgdG8gc3RyaXAgcmVmZXJlbmNlcyB0byB0aGUgZXhpc3RpbmcgaWRlbnRpZmllcnMgb3JcbiAgICAgICAgICAvLyBUeXBlU2NyaXB0IG1pZ2h0IGdlbmVyYXRlIGludmFsaWQgY29kZSB3aGVuIGl0IGVtaXRzIHRvIEpTLiBJbiBwYXJ0aWN1bGFyXG4gICAgICAgICAgLy8gdGhpcyBjYW4gYnJlYWsgd2hlbiBlbWl0dGluZyBhIGNsYXNzIHRvIEVTNSB3aGljaCBoYXMgYSBjdXN0b20gZGVjb3JhdG9yXG4gICAgICAgICAgLy8gYW5kIGlzIHJlZmVyZW5jZWQgaW5zaWRlIG9mIGl0cyBvd24gbWV0YWRhdGEgKHNlZSAjMzk1MDkgZm9yIG1vcmUgaW5mb3JtYXRpb24pLlxuICAgICAgICAgIC5tYXAoZGVjb3JhdG9yID0+IHJlbW92ZUlkZW50aWZpZXJSZWZlcmVuY2VzKGRlY29yYXRvciwgaWQudGV4dCkpO1xuICBpZiAobmdDbGFzc0RlY29yYXRvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgbWV0YURlY29yYXRvcnMgPSBuZXcgV3JhcHBlZE5vZGVFeHByKHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChuZ0NsYXNzRGVjb3JhdG9ycykpO1xuXG4gIC8vIENvbnZlcnQgdGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlcnMgdG8gbWV0YWRhdGEsIHBhc3NpbmcgbnVsbCBpZiBub25lIGFyZSBwcmVzZW50LlxuICBsZXQgbWV0YUN0b3JQYXJhbWV0ZXJzOiBFeHByZXNzaW9ufG51bGwgPSBudWxsO1xuICBjb25zdCBjbGFzc0N0b3JQYXJhbWV0ZXJzID0gcmVmbGVjdGlvbi5nZXRDb25zdHJ1Y3RvclBhcmFtZXRlcnMoY2xhenopO1xuICBpZiAoY2xhc3NDdG9yUGFyYW1ldGVycyAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGN0b3JQYXJhbWV0ZXJzID0gY2xhc3NDdG9yUGFyYW1ldGVycy5tYXAocGFyYW0gPT4gY3RvclBhcmFtZXRlclRvTWV0YWRhdGEocGFyYW0sIGlzQ29yZSkpO1xuICAgIG1ldGFDdG9yUGFyYW1ldGVycyA9IG5ldyBGdW5jdGlvbkV4cHIoW10sIFtcbiAgICAgIG5ldyBSZXR1cm5TdGF0ZW1lbnQobmV3IExpdGVyYWxBcnJheUV4cHIoY3RvclBhcmFtZXRlcnMpKSxcbiAgICBdKTtcbiAgfVxuXG4gIC8vIERvIHRoZSBzYW1lIGZvciBwcm9wZXJ0eSBkZWNvcmF0b3JzLlxuICBsZXQgbWV0YVByb3BEZWNvcmF0b3JzOiBFeHByZXNzaW9ufG51bGwgPSBudWxsO1xuICBjb25zdCBjbGFzc01lbWJlcnMgPSByZWZsZWN0aW9uLmdldE1lbWJlcnNPZkNsYXNzKGNsYXp6KS5maWx0ZXIoXG4gICAgICBtZW1iZXIgPT4gIW1lbWJlci5pc1N0YXRpYyAmJiBtZW1iZXIuZGVjb3JhdG9ycyAhPT0gbnVsbCAmJiBtZW1iZXIuZGVjb3JhdG9ycy5sZW5ndGggPiAwKTtcbiAgY29uc3QgZHVwbGljYXRlRGVjb3JhdGVkTWVtYmVyTmFtZXMgPVxuICAgICAgY2xhc3NNZW1iZXJzLm1hcChtZW1iZXIgPT4gbWVtYmVyLm5hbWUpLmZpbHRlcigobmFtZSwgaSwgYXJyKSA9PiBhcnIuaW5kZXhPZihuYW1lKSA8IGkpO1xuICBpZiAoZHVwbGljYXRlRGVjb3JhdGVkTWVtYmVyTmFtZXMubGVuZ3RoID4gMCkge1xuICAgIC8vIFRoaXMgc2hvdWxkIHRoZW9yZXRpY2FsbHkgbmV2ZXIgaGFwcGVuLCBiZWNhdXNlIHRoZSBvbmx5IHdheSB0byBoYXZlIGR1cGxpY2F0ZSBpbnN0YW5jZVxuICAgIC8vIG1lbWJlciBuYW1lcyBpcyBnZXR0ZXIvc2V0dGVyIHBhaXJzIGFuZCBkZWNvcmF0b3JzIGNhbm5vdCBhcHBlYXIgaW4gYm90aCBhIGdldHRlciBhbmQgdGhlXG4gICAgLy8gY29ycmVzcG9uZGluZyBzZXR0ZXIuXG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgRHVwbGljYXRlIGRlY29yYXRlZCBwcm9wZXJ0aWVzIGZvdW5kIG9uIGNsYXNzICcke2NsYXp6Lm5hbWUudGV4dH0nOiBgICtcbiAgICAgICAgZHVwbGljYXRlRGVjb3JhdGVkTWVtYmVyTmFtZXMuam9pbignLCAnKSk7XG4gIH1cbiAgY29uc3QgZGVjb3JhdGVkTWVtYmVycyA9IGNsYXNzTWVtYmVycy5tYXAoXG4gICAgICBtZW1iZXIgPT4gY2xhc3NNZW1iZXJUb01ldGFkYXRhKG1lbWJlci5uYW1lTm9kZSA/PyBtZW1iZXIubmFtZSwgbWVtYmVyLmRlY29yYXRvcnMhLCBpc0NvcmUpKTtcbiAgaWYgKGRlY29yYXRlZE1lbWJlcnMubGVuZ3RoID4gMCkge1xuICAgIG1ldGFQcm9wRGVjb3JhdG9ycyA9IG5ldyBXcmFwcGVkTm9kZUV4cHIodHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChkZWNvcmF0ZWRNZW1iZXJzKSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHR5cGU6IG5ldyBXcmFwcGVkTm9kZUV4cHIoaWQpLFxuICAgIGRlY29yYXRvcnM6IG1ldGFEZWNvcmF0b3JzLFxuICAgIGN0b3JQYXJhbWV0ZXJzOiBtZXRhQ3RvclBhcmFtZXRlcnMsXG4gICAgcHJvcERlY29yYXRvcnM6IG1ldGFQcm9wRGVjb3JhdG9ycyxcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcmVmbGVjdGVkIGNvbnN0cnVjdG9yIHBhcmFtZXRlciB0byBtZXRhZGF0YS5cbiAqL1xuZnVuY3Rpb24gY3RvclBhcmFtZXRlclRvTWV0YWRhdGEocGFyYW06IEN0b3JQYXJhbWV0ZXIsIGlzQ29yZTogYm9vbGVhbik6IEV4cHJlc3Npb24ge1xuICAvLyBQYXJhbWV0ZXJzIHNvbWV0aW1lcyBoYXZlIGEgdHlwZSB0aGF0IGNhbiBiZSByZWZlcmVuY2VkLiBJZiBzbywgdGhlbiB1c2UgaXQsIG90aGVyd2lzZVxuICAvLyBpdHMgdHlwZSBpcyB1bmRlZmluZWQuXG4gIGNvbnN0IHR5cGUgPSBwYXJhbS50eXBlVmFsdWVSZWZlcmVuY2Uua2luZCAhPT0gVHlwZVZhbHVlUmVmZXJlbmNlS2luZC5VTkFWQUlMQUJMRSA/XG4gICAgICB2YWx1ZVJlZmVyZW5jZVRvRXhwcmVzc2lvbihwYXJhbS50eXBlVmFsdWVSZWZlcmVuY2UpIDpcbiAgICAgIG5ldyBMaXRlcmFsRXhwcih1bmRlZmluZWQpO1xuXG4gIGNvbnN0IG1hcEVudHJpZXM6IHtrZXk6IHN0cmluZywgdmFsdWU6IEV4cHJlc3Npb24sIHF1b3RlZDogZmFsc2V9W10gPSBbXG4gICAge2tleTogJ3R5cGUnLCB2YWx1ZTogdHlwZSwgcXVvdGVkOiBmYWxzZX0sXG4gIF07XG5cbiAgLy8gSWYgdGhlIHBhcmFtZXRlciBoYXMgZGVjb3JhdG9ycywgaW5jbHVkZSB0aGUgb25lcyBmcm9tIEFuZ3VsYXIuXG4gIGlmIChwYXJhbS5kZWNvcmF0b3JzICE9PSBudWxsKSB7XG4gICAgY29uc3QgbmdEZWNvcmF0b3JzID0gcGFyYW0uZGVjb3JhdG9ycy5maWx0ZXIoZGVjID0+IGlzQW5ndWxhckRlY29yYXRvcihkZWMsIGlzQ29yZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGRlY29yYXRvcjogRGVjb3JhdG9yKSA9PiBkZWNvcmF0b3JUb01ldGFkYXRhKGRlY29yYXRvcikpO1xuICAgIGNvbnN0IHZhbHVlID0gbmV3IFdyYXBwZWROb2RlRXhwcih0cy5jcmVhdGVBcnJheUxpdGVyYWwobmdEZWNvcmF0b3JzKSk7XG4gICAgbWFwRW50cmllcy5wdXNoKHtrZXk6ICdkZWNvcmF0b3JzJywgdmFsdWUsIHF1b3RlZDogZmFsc2V9KTtcbiAgfVxuICByZXR1cm4gbGl0ZXJhbE1hcChtYXBFbnRyaWVzKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcmVmbGVjdGVkIGNsYXNzIG1lbWJlciB0byBtZXRhZGF0YS5cbiAqL1xuZnVuY3Rpb24gY2xhc3NNZW1iZXJUb01ldGFkYXRhKFxuICAgIG5hbWU6IHRzLlByb3BlcnR5TmFtZXxzdHJpbmcsIGRlY29yYXRvcnM6IERlY29yYXRvcltdLCBpc0NvcmU6IGJvb2xlYW4pOiB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQge1xuICBjb25zdCBuZ0RlY29yYXRvcnMgPSBkZWNvcmF0b3JzLmZpbHRlcihkZWMgPT4gaXNBbmd1bGFyRGVjb3JhdG9yKGRlYywgaXNDb3JlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGRlY29yYXRvcjogRGVjb3JhdG9yKSA9PiBkZWNvcmF0b3JUb01ldGFkYXRhKGRlY29yYXRvcikpO1xuICBjb25zdCBkZWNvcmF0b3JNZXRhID0gdHMuY3JlYXRlQXJyYXlMaXRlcmFsKG5nRGVjb3JhdG9ycyk7XG4gIHJldHVybiB0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQobmFtZSwgZGVjb3JhdG9yTWV0YSk7XG59XG5cbi8qKlxuICogQ29udmVydCBhIHJlZmxlY3RlZCBkZWNvcmF0b3IgdG8gbWV0YWRhdGEuXG4gKi9cbmZ1bmN0aW9uIGRlY29yYXRvclRvTWV0YWRhdGEoXG4gICAgZGVjb3JhdG9yOiBEZWNvcmF0b3IsIHdyYXBGdW5jdGlvbnNJblBhcmVucz86IGJvb2xlYW4pOiB0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbiB7XG4gIGlmIChkZWNvcmF0b3IuaWRlbnRpZmllciA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSWxsZWdhbCBzdGF0ZTogc3ludGhlc2l6ZWQgZGVjb3JhdG9yIGNhbm5vdCBiZSBlbWl0dGVkIGluIGNsYXNzIG1ldGFkYXRhLicpO1xuICB9XG4gIC8vIERlY29yYXRvcnMgaGF2ZSBhIHR5cGUuXG4gIGNvbnN0IHByb3BlcnRpZXM6IHRzLk9iamVjdExpdGVyYWxFbGVtZW50TGlrZVtdID0gW1xuICAgIHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCgndHlwZScsIHRzLmdldE11dGFibGVDbG9uZShkZWNvcmF0b3IuaWRlbnRpZmllcikpLFxuICBdO1xuICAvLyBTb21ldGltZXMgdGhleSBoYXZlIGFyZ3VtZW50cy5cbiAgaWYgKGRlY29yYXRvci5hcmdzICE9PSBudWxsICYmIGRlY29yYXRvci5hcmdzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBhcmdzID0gZGVjb3JhdG9yLmFyZ3MubWFwKGFyZyA9PiB7XG4gICAgICBjb25zdCBleHByID0gdHMuZ2V0TXV0YWJsZUNsb25lKGFyZyk7XG4gICAgICByZXR1cm4gd3JhcEZ1bmN0aW9uc0luUGFyZW5zID8gd3JhcEZ1bmN0aW9uRXhwcmVzc2lvbnNJblBhcmVucyhleHByKSA6IGV4cHI7XG4gICAgfSk7XG4gICAgcHJvcGVydGllcy5wdXNoKHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCgnYXJncycsIHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChhcmdzKSkpO1xuICB9XG4gIHJldHVybiB0cy5jcmVhdGVPYmplY3RMaXRlcmFsKHByb3BlcnRpZXMsIHRydWUpO1xufVxuXG4vKipcbiAqIFdoZXRoZXIgYSBnaXZlbiBkZWNvcmF0b3Igc2hvdWxkIGJlIHRyZWF0ZWQgYXMgYW4gQW5ndWxhciBkZWNvcmF0b3IuXG4gKlxuICogRWl0aGVyIGl0J3MgdXNlZCBpbiBAYW5ndWxhci9jb3JlLCBvciBpdCdzIGltcG9ydGVkIGZyb20gdGhlcmUuXG4gKi9cbmZ1bmN0aW9uIGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3I6IERlY29yYXRvciwgaXNDb3JlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0NvcmUgfHwgKGRlY29yYXRvci5pbXBvcnQgIT09IG51bGwgJiYgZGVjb3JhdG9yLmltcG9ydC5mcm9tID09PSAnQGFuZ3VsYXIvY29yZScpO1xufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IHJlY3JlYXRlcyBhbGwgb2YgdGhlIGBJZGVudGlmaWVyYCBkZXNjZW5kYW50IG5vZGVzIHdpdGggYSBwYXJ0aWN1bGFyIG5hbWUgaW5zaWRlXG4gKiBvZiBhbiBBU1Qgbm9kZSwgdGh1cyByZW1vdmluZyBhbnkgcmVmZXJlbmNlcyB0byB0aGVtLiBVc2VmdWwgaWYgYSBwYXJ0aWN1bGFyIG5vZGUgaGFzIHRvIGJlIHRcbiAqIGFrZW4gZnJvbSBvbmUgcGxhY2UgYW55IGVtaXR0ZWQgdG8gYW5vdGhlciBvbmUgZXhhY3RseSBhcyBpdCBoYXMgYmVlbiB3cml0dGVuLlxuICovXG5mdW5jdGlvbiByZW1vdmVJZGVudGlmaWVyUmVmZXJlbmNlczxUIGV4dGVuZHMgdHMuTm9kZT4obm9kZTogVCwgbmFtZTogc3RyaW5nKTogVCB7XG4gIGNvbnN0IHJlc3VsdCA9IHRzLnRyYW5zZm9ybShcbiAgICAgIG5vZGUsIFtjb250ZXh0ID0+IHJvb3QgPT4gdHMudmlzaXROb2RlKHJvb3QsIGZ1bmN0aW9uIHdhbGsoY3VycmVudDogdHMuTm9kZSk6IHRzLk5vZGUge1xuICAgICAgICByZXR1cm4gdHMuaXNJZGVudGlmaWVyKGN1cnJlbnQpICYmIGN1cnJlbnQudGV4dCA9PT0gbmFtZSA/XG4gICAgICAgICAgICB0cy5jcmVhdGVJZGVudGlmaWVyKGN1cnJlbnQudGV4dCkgOlxuICAgICAgICAgICAgdHMudmlzaXRFYWNoQ2hpbGQoY3VycmVudCwgd2FsaywgY29udGV4dCk7XG4gICAgICB9KV0pO1xuXG4gIHJldHVybiByZXN1bHQudHJhbnNmb3JtZWRbMF07XG59XG4iXX0=