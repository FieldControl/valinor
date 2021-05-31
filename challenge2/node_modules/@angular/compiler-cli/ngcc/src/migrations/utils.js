(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/migrations/utils", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/reflection"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createInjectableDecorator = exports.createComponentDecorator = exports.createDirectiveDecorator = exports.hasConstructor = exports.hasPipeDecorator = exports.hasDirectiveDecorator = exports.isClassDeclaration = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    function isClassDeclaration(clazz) {
        return reflection_1.isNamedClassDeclaration(clazz) || reflection_1.isNamedFunctionDeclaration(clazz) ||
            reflection_1.isNamedVariableDeclaration(clazz);
    }
    exports.isClassDeclaration = isClassDeclaration;
    /**
     * Returns true if the `clazz` is decorated as a `Directive` or `Component`.
     */
    function hasDirectiveDecorator(host, clazz) {
        var ref = new imports_1.Reference(clazz);
        return host.metadata.getDirectiveMetadata(ref) !== null;
    }
    exports.hasDirectiveDecorator = hasDirectiveDecorator;
    /**
     * Returns true if the `clazz` is decorated as a `Pipe`.
     */
    function hasPipeDecorator(host, clazz) {
        var ref = new imports_1.Reference(clazz);
        return host.metadata.getPipeMetadata(ref) !== null;
    }
    exports.hasPipeDecorator = hasPipeDecorator;
    /**
     * Returns true if the `clazz` has its own constructor function.
     */
    function hasConstructor(host, clazz) {
        return host.reflectionHost.getConstructorParameters(clazz) !== null;
    }
    exports.hasConstructor = hasConstructor;
    /**
     * Create an empty `Directive` decorator that will be associated with the `clazz`.
     */
    function createDirectiveDecorator(clazz, metadata) {
        var args = [];
        if (metadata !== undefined) {
            var metaArgs = [];
            if (metadata.selector !== null) {
                metaArgs.push(property('selector', metadata.selector));
            }
            if (metadata.exportAs !== null) {
                metaArgs.push(property('exportAs', metadata.exportAs.join(', ')));
            }
            args.push(reifySourceFile(ts.createObjectLiteral(metaArgs)));
        }
        return {
            name: 'Directive',
            identifier: null,
            import: { name: 'Directive', from: '@angular/core' },
            node: null,
            synthesizedFor: clazz.name,
            args: args,
        };
    }
    exports.createDirectiveDecorator = createDirectiveDecorator;
    /**
     * Create an empty `Component` decorator that will be associated with the `clazz`.
     */
    function createComponentDecorator(clazz, metadata) {
        var metaArgs = [
            property('template', ''),
        ];
        if (metadata.selector !== null) {
            metaArgs.push(property('selector', metadata.selector));
        }
        if (metadata.exportAs !== null) {
            metaArgs.push(property('exportAs', metadata.exportAs.join(', ')));
        }
        return {
            name: 'Component',
            identifier: null,
            import: { name: 'Component', from: '@angular/core' },
            node: null,
            synthesizedFor: clazz.name,
            args: [
                reifySourceFile(ts.createObjectLiteral(metaArgs)),
            ],
        };
    }
    exports.createComponentDecorator = createComponentDecorator;
    /**
     * Create an empty `Injectable` decorator that will be associated with the `clazz`.
     */
    function createInjectableDecorator(clazz) {
        return {
            name: 'Injectable',
            identifier: null,
            import: { name: 'Injectable', from: '@angular/core' },
            node: null,
            synthesizedFor: clazz.name,
            args: [],
        };
    }
    exports.createInjectableDecorator = createInjectableDecorator;
    function property(name, value) {
        return ts.createPropertyAssignment(name, ts.createStringLiteral(value));
    }
    var EMPTY_SF = ts.createSourceFile('(empty)', '', ts.ScriptTarget.Latest);
    /**
     * Takes a `ts.Expression` and returns the same `ts.Expression`, but with an associated
     * `ts.SourceFile`.
     *
     * This transformation is necessary to use synthetic `ts.Expression`s with the `PartialEvaluator`,
     * and many decorator arguments are interpreted in this way.
     */
    function reifySourceFile(expr) {
        var printer = ts.createPrinter();
        var exprText = printer.printNode(ts.EmitHint.Unspecified, expr, EMPTY_SF);
        var sf = ts.createSourceFile('(synthetic)', "const expr = " + exprText + ";", ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
        var stmt = sf.statements[0];
        if (!ts.isVariableStatement(stmt)) {
            throw new Error("Expected VariableStatement, got " + ts.SyntaxKind[stmt.kind]);
        }
        return stmt.declarationList.declarations[0].initializer;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvbWlncmF0aW9ucy91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwrQkFBaUM7SUFDakMsbUVBQXFEO0lBQ3JELHlFQUEySjtJQUczSixTQUFnQixrQkFBa0IsQ0FBQyxLQUFjO1FBQy9DLE9BQU8sb0NBQXVCLENBQUMsS0FBSyxDQUFDLElBQUksdUNBQTBCLENBQUMsS0FBSyxDQUFDO1lBQ3RFLHVDQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFIRCxnREFHQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IscUJBQXFCLENBQUMsSUFBbUIsRUFBRSxLQUF1QjtRQUNoRixJQUFNLEdBQUcsR0FBRyxJQUFJLG1CQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQztJQUMxRCxDQUFDO0lBSEQsc0RBR0M7SUFFRDs7T0FFRztJQUNILFNBQWdCLGdCQUFnQixDQUFDLElBQW1CLEVBQUUsS0FBdUI7UUFDM0UsSUFBTSxHQUFHLEdBQUcsSUFBSSxtQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDO0lBQ3JELENBQUM7SUFIRCw0Q0FHQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsY0FBYyxDQUFDLElBQW1CLEVBQUUsS0FBdUI7UUFDekUsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQztJQUN0RSxDQUFDO0lBRkQsd0NBRUM7SUFFRDs7T0FF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QyxTQUFTLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFNUU7Ozs7OztPQU1HO0lBQ0gsU0FBUyxlQUFlLENBQUMsSUFBbUI7UUFDMUMsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ25DLElBQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzVFLElBQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FDMUIsYUFBYSxFQUFFLGtCQUFnQixRQUFRLE1BQUcsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoRyxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDakMsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBbUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFHLENBQUMsQ0FBQztTQUNoRjtRQUNELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBWSxDQUFDO0lBQzNELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtSZWZlcmVuY2V9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9pbXBvcnRzJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgRGVjb3JhdG9yLCBpc05hbWVkQ2xhc3NEZWNsYXJhdGlvbiwgaXNOYW1lZEZ1bmN0aW9uRGVjbGFyYXRpb24sIGlzTmFtZWRWYXJpYWJsZURlY2xhcmF0aW9ufSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvcmVmbGVjdGlvbic7XG5pbXBvcnQge01pZ3JhdGlvbkhvc3R9IGZyb20gJy4vbWlncmF0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ2xhc3NEZWNsYXJhdGlvbihjbGF6ejogdHMuTm9kZSk6IGNsYXp6IGlzIENsYXNzRGVjbGFyYXRpb248dHMuRGVjbGFyYXRpb24+IHtcbiAgcmV0dXJuIGlzTmFtZWRDbGFzc0RlY2xhcmF0aW9uKGNsYXp6KSB8fCBpc05hbWVkRnVuY3Rpb25EZWNsYXJhdGlvbihjbGF6eikgfHxcbiAgICAgIGlzTmFtZWRWYXJpYWJsZURlY2xhcmF0aW9uKGNsYXp6KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGBjbGF6emAgaXMgZGVjb3JhdGVkIGFzIGEgYERpcmVjdGl2ZWAgb3IgYENvbXBvbmVudGAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXNEaXJlY3RpdmVEZWNvcmF0b3IoaG9zdDogTWlncmF0aW9uSG9zdCwgY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiBib29sZWFuIHtcbiAgY29uc3QgcmVmID0gbmV3IFJlZmVyZW5jZShjbGF6eik7XG4gIHJldHVybiBob3N0Lm1ldGFkYXRhLmdldERpcmVjdGl2ZU1ldGFkYXRhKHJlZikgIT09IG51bGw7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBgY2xhenpgIGlzIGRlY29yYXRlZCBhcyBhIGBQaXBlYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc1BpcGVEZWNvcmF0b3IoaG9zdDogTWlncmF0aW9uSG9zdCwgY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiBib29sZWFuIHtcbiAgY29uc3QgcmVmID0gbmV3IFJlZmVyZW5jZShjbGF6eik7XG4gIHJldHVybiBob3N0Lm1ldGFkYXRhLmdldFBpcGVNZXRhZGF0YShyZWYpICE9PSBudWxsO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgYGNsYXp6YCBoYXMgaXRzIG93biBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc0NvbnN0cnVjdG9yKGhvc3Q6IE1pZ3JhdGlvbkhvc3QsIGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uKTogYm9vbGVhbiB7XG4gIHJldHVybiBob3N0LnJlZmxlY3Rpb25Ib3N0LmdldENvbnN0cnVjdG9yUGFyYW1ldGVycyhjbGF6eikgIT09IG51bGw7XG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIGVtcHR5IGBEaXJlY3RpdmVgIGRlY29yYXRvciB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBgY2xhenpgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGlyZWN0aXZlRGVjb3JhdG9yKFxuICAgIGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uLFxuICAgIG1ldGFkYXRhPzoge3NlbGVjdG9yOiBzdHJpbmd8bnVsbCwgZXhwb3J0QXM6IHN0cmluZ1tdfG51bGx9KTogRGVjb3JhdG9yIHtcbiAgY29uc3QgYXJnczogdHMuRXhwcmVzc2lvbltdID0gW107XG4gIGlmIChtZXRhZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgbWV0YUFyZ3M6IHRzLlByb3BlcnR5QXNzaWdubWVudFtdID0gW107XG4gICAgaWYgKG1ldGFkYXRhLnNlbGVjdG9yICE9PSBudWxsKSB7XG4gICAgICBtZXRhQXJncy5wdXNoKHByb3BlcnR5KCdzZWxlY3RvcicsIG1ldGFkYXRhLnNlbGVjdG9yKSk7XG4gICAgfVxuICAgIGlmIChtZXRhZGF0YS5leHBvcnRBcyAhPT0gbnVsbCkge1xuICAgICAgbWV0YUFyZ3MucHVzaChwcm9wZXJ0eSgnZXhwb3J0QXMnLCBtZXRhZGF0YS5leHBvcnRBcy5qb2luKCcsICcpKSk7XG4gICAgfVxuICAgIGFyZ3MucHVzaChyZWlmeVNvdXJjZUZpbGUodHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChtZXRhQXJncykpKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIG5hbWU6ICdEaXJlY3RpdmUnLFxuICAgIGlkZW50aWZpZXI6IG51bGwsXG4gICAgaW1wb3J0OiB7bmFtZTogJ0RpcmVjdGl2ZScsIGZyb206ICdAYW5ndWxhci9jb3JlJ30sXG4gICAgbm9kZTogbnVsbCxcbiAgICBzeW50aGVzaXplZEZvcjogY2xhenoubmFtZSxcbiAgICBhcmdzLFxuICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBlbXB0eSBgQ29tcG9uZW50YCBkZWNvcmF0b3IgdGhhdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgYGNsYXp6YC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudERlY29yYXRvcihcbiAgICBjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbixcbiAgICBtZXRhZGF0YToge3NlbGVjdG9yOiBzdHJpbmd8bnVsbCwgZXhwb3J0QXM6IHN0cmluZ1tdfG51bGx9KTogRGVjb3JhdG9yIHtcbiAgY29uc3QgbWV0YUFyZ3M6IHRzLlByb3BlcnR5QXNzaWdubWVudFtdID0gW1xuICAgIHByb3BlcnR5KCd0ZW1wbGF0ZScsICcnKSxcbiAgXTtcbiAgaWYgKG1ldGFkYXRhLnNlbGVjdG9yICE9PSBudWxsKSB7XG4gICAgbWV0YUFyZ3MucHVzaChwcm9wZXJ0eSgnc2VsZWN0b3InLCBtZXRhZGF0YS5zZWxlY3RvcikpO1xuICB9XG4gIGlmIChtZXRhZGF0YS5leHBvcnRBcyAhPT0gbnVsbCkge1xuICAgIG1ldGFBcmdzLnB1c2gocHJvcGVydHkoJ2V4cG9ydEFzJywgbWV0YWRhdGEuZXhwb3J0QXMuam9pbignLCAnKSkpO1xuICB9XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ0NvbXBvbmVudCcsXG4gICAgaWRlbnRpZmllcjogbnVsbCxcbiAgICBpbXBvcnQ6IHtuYW1lOiAnQ29tcG9uZW50JywgZnJvbTogJ0Bhbmd1bGFyL2NvcmUnfSxcbiAgICBub2RlOiBudWxsLFxuICAgIHN5bnRoZXNpemVkRm9yOiBjbGF6ei5uYW1lLFxuICAgIGFyZ3M6IFtcbiAgICAgIHJlaWZ5U291cmNlRmlsZSh0cy5jcmVhdGVPYmplY3RMaXRlcmFsKG1ldGFBcmdzKSksXG4gICAgXSxcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYW4gZW1wdHkgYEluamVjdGFibGVgIGRlY29yYXRvciB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBgY2xhenpgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW5qZWN0YWJsZURlY29yYXRvcihjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbik6IERlY29yYXRvciB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ0luamVjdGFibGUnLFxuICAgIGlkZW50aWZpZXI6IG51bGwsXG4gICAgaW1wb3J0OiB7bmFtZTogJ0luamVjdGFibGUnLCBmcm9tOiAnQGFuZ3VsYXIvY29yZSd9LFxuICAgIG5vZGU6IG51bGwsXG4gICAgc3ludGhlc2l6ZWRGb3I6IGNsYXp6Lm5hbWUsXG4gICAgYXJnczogW10sXG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb3BlcnR5KG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHRzLlByb3BlcnR5QXNzaWdubWVudCB7XG4gIHJldHVybiB0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQobmFtZSwgdHMuY3JlYXRlU3RyaW5nTGl0ZXJhbCh2YWx1ZSkpO1xufVxuXG5jb25zdCBFTVBUWV9TRiA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoJyhlbXB0eSknLCAnJywgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCk7XG5cbi8qKlxuICogVGFrZXMgYSBgdHMuRXhwcmVzc2lvbmAgYW5kIHJldHVybnMgdGhlIHNhbWUgYHRzLkV4cHJlc3Npb25gLCBidXQgd2l0aCBhbiBhc3NvY2lhdGVkXG4gKiBgdHMuU291cmNlRmlsZWAuXG4gKlxuICogVGhpcyB0cmFuc2Zvcm1hdGlvbiBpcyBuZWNlc3NhcnkgdG8gdXNlIHN5bnRoZXRpYyBgdHMuRXhwcmVzc2lvbmBzIHdpdGggdGhlIGBQYXJ0aWFsRXZhbHVhdG9yYCxcbiAqIGFuZCBtYW55IGRlY29yYXRvciBhcmd1bWVudHMgYXJlIGludGVycHJldGVkIGluIHRoaXMgd2F5LlxuICovXG5mdW5jdGlvbiByZWlmeVNvdXJjZUZpbGUoZXhwcjogdHMuRXhwcmVzc2lvbik6IHRzLkV4cHJlc3Npb24ge1xuICBjb25zdCBwcmludGVyID0gdHMuY3JlYXRlUHJpbnRlcigpO1xuICBjb25zdCBleHByVGV4dCA9IHByaW50ZXIucHJpbnROb2RlKHRzLkVtaXRIaW50LlVuc3BlY2lmaWVkLCBleHByLCBFTVBUWV9TRik7XG4gIGNvbnN0IHNmID0gdHMuY3JlYXRlU291cmNlRmlsZShcbiAgICAgICcoc3ludGhldGljKScsIGBjb25zdCBleHByID0gJHtleHByVGV4dH07YCwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgdHJ1ZSwgdHMuU2NyaXB0S2luZC5KUyk7XG4gIGNvbnN0IHN0bXQgPSBzZi5zdGF0ZW1lbnRzWzBdO1xuICBpZiAoIXRzLmlzVmFyaWFibGVTdGF0ZW1lbnQoc3RtdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIFZhcmlhYmxlU3RhdGVtZW50LCBnb3QgJHt0cy5TeW50YXhLaW5kW3N0bXQua2luZF19YCk7XG4gIH1cbiAgcmV0dXJuIHN0bXQuZGVjbGFyYXRpb25MaXN0LmRlY2xhcmF0aW9uc1swXS5pbml0aWFsaXplciE7XG59XG4iXX0=