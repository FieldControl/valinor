(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/utils", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/reflection"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stripExtension = exports.stripDollarSuffix = exports.getTsHelperFnFromIdentifier = exports.getTsHelperFnFromDeclaration = exports.resolveFileWithPostfixes = exports.FactoryMap = exports.isRelativePath = exports.hasNameIdentifier = exports.findAll = exports.getNameText = exports.isDefined = exports.getOriginalSymbol = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    function getOriginalSymbol(checker) {
        return function (symbol) {
            return ts.SymbolFlags.Alias & symbol.flags ? checker.getAliasedSymbol(symbol) : symbol;
        };
    }
    exports.getOriginalSymbol = getOriginalSymbol;
    function isDefined(value) {
        return (value !== undefined) && (value !== null);
    }
    exports.isDefined = isDefined;
    function getNameText(name) {
        return ts.isIdentifier(name) || ts.isLiteralExpression(name) ? name.text : name.getText();
    }
    exports.getNameText = getNameText;
    /**
     * Parse down the AST and capture all the nodes that satisfy the test.
     * @param node The start node.
     * @param test The function that tests whether a node should be included.
     * @returns a collection of nodes that satisfy the test.
     */
    function findAll(node, test) {
        var nodes = [];
        findAllVisitor(node);
        return nodes;
        function findAllVisitor(n) {
            if (test(n)) {
                nodes.push(n);
            }
            else {
                n.forEachChild(function (child) { return findAllVisitor(child); });
            }
        }
    }
    exports.findAll = findAll;
    /**
     * Does the given declaration have a name which is an identifier?
     * @param declaration The declaration to test.
     * @returns true if the declaration has an identifier for a name.
     */
    function hasNameIdentifier(declaration) {
        var namedDeclaration = declaration;
        return namedDeclaration.name !== undefined && ts.isIdentifier(namedDeclaration.name);
    }
    exports.hasNameIdentifier = hasNameIdentifier;
    /**
     * Test whether a path is "relative".
     *
     * Relative paths start with `/`, `./` or `../` (or the Windows equivalents); or are simply `.` or
     * `..`.
     */
    function isRelativePath(path) {
        return file_system_1.isRooted(path) || /^\.\.?(\/|\\|$)/.test(path);
    }
    exports.isRelativePath = isRelativePath;
    /**
     * A `Map`-like object that can compute and memoize a missing value for any key.
     *
     * The computed values are memoized, so the factory function is not called more than once per key.
     * This is useful for storing values that are expensive to compute and may be used multiple times.
     */
    // NOTE:
    // Ideally, this class should extend `Map`, but that causes errors in ES5 transpiled code:
    // `TypeError: Constructor Map requires 'new'`
    var FactoryMap = /** @class */ (function () {
        function FactoryMap(factory, entries) {
            this.factory = factory;
            this.internalMap = new Map(entries);
        }
        FactoryMap.prototype.get = function (key) {
            if (!this.internalMap.has(key)) {
                this.internalMap.set(key, this.factory(key));
            }
            return this.internalMap.get(key);
        };
        FactoryMap.prototype.set = function (key, value) {
            this.internalMap.set(key, value);
        };
        return FactoryMap;
    }());
    exports.FactoryMap = FactoryMap;
    /**
     * Attempt to resolve a `path` to a file by appending the provided `postFixes`
     * to the `path` and checking if the file exists on disk.
     * @returns An absolute path to the first matching existing file, or `null` if none exist.
     */
    function resolveFileWithPostfixes(fs, path, postFixes) {
        var e_1, _a;
        try {
            for (var postFixes_1 = tslib_1.__values(postFixes), postFixes_1_1 = postFixes_1.next(); !postFixes_1_1.done; postFixes_1_1 = postFixes_1.next()) {
                var postFix = postFixes_1_1.value;
                var testPath = file_system_1.absoluteFrom(path + postFix);
                if (fs.exists(testPath) && fs.stat(testPath).isFile()) {
                    return testPath;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (postFixes_1_1 && !postFixes_1_1.done && (_a = postFixes_1.return)) _a.call(postFixes_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    exports.resolveFileWithPostfixes = resolveFileWithPostfixes;
    /**
     * Determine whether a function declaration corresponds with a TypeScript helper function, returning
     * its kind if so or null if the declaration does not seem to correspond with such a helper.
     */
    function getTsHelperFnFromDeclaration(decl) {
        if (!ts.isFunctionDeclaration(decl) && !ts.isVariableDeclaration(decl)) {
            return null;
        }
        if (decl.name === undefined || !ts.isIdentifier(decl.name)) {
            return null;
        }
        return getTsHelperFnFromIdentifier(decl.name);
    }
    exports.getTsHelperFnFromDeclaration = getTsHelperFnFromDeclaration;
    /**
     * Determine whether an identifier corresponds with a TypeScript helper function (based on its
     * name), returning its kind if so or null if the identifier does not seem to correspond with such a
     * helper.
     */
    function getTsHelperFnFromIdentifier(id) {
        switch (stripDollarSuffix(id.text)) {
            case '__assign':
                return reflection_1.KnownDeclaration.TsHelperAssign;
            case '__spread':
                return reflection_1.KnownDeclaration.TsHelperSpread;
            case '__spreadArrays':
                return reflection_1.KnownDeclaration.TsHelperSpreadArrays;
            case '__spreadArray':
                return reflection_1.KnownDeclaration.TsHelperSpreadArray;
            case '__read':
                return reflection_1.KnownDeclaration.TsHelperRead;
            default:
                return null;
        }
    }
    exports.getTsHelperFnFromIdentifier = getTsHelperFnFromIdentifier;
    /**
     * An identifier may become repeated when bundling multiple source files into a single bundle, so
     * bundlers have a strategy of suffixing non-unique identifiers with a suffix like $2. This function
     * strips off such suffixes, so that ngcc deals with the canonical name of an identifier.
     * @param value The value to strip any suffix of, if applicable.
     * @returns The canonical representation of the value, without any suffix.
     */
    function stripDollarSuffix(value) {
        return value.replace(/\$\d+$/, '');
    }
    exports.stripDollarSuffix = stripDollarSuffix;
    function stripExtension(fileName) {
        return fileName.replace(/\..+$/, '');
    }
    exports.stripExtension = stripExtension;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILCtCQUFpQztJQUVqQywyRUFBdUc7SUFDdkcseUVBQTZFO0lBd0I3RSxTQUFnQixpQkFBaUIsQ0FBQyxPQUF1QjtRQUN2RCxPQUFPLFVBQVMsTUFBaUI7WUFDL0IsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUN6RixDQUFDLENBQUM7SUFDSixDQUFDO0lBSkQsOENBSUM7SUFFRCxTQUFnQixTQUFTLENBQUksS0FBdUI7UUFDbEQsT0FBTyxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRkQsOEJBRUM7SUFFRCxTQUFnQixXQUFXLENBQUMsSUFBb0M7UUFDOUQsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzVGLENBQUM7SUFGRCxrQ0FFQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBZ0IsT0FBTyxDQUFJLElBQWEsRUFBRSxJQUE0QztRQUNwRixJQUFNLEtBQUssR0FBUSxFQUFFLENBQUM7UUFDdEIsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sS0FBSyxDQUFDO1FBRWIsU0FBUyxjQUFjLENBQUMs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SSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFWRCxvRUFVQztJQUVEOzs7O09BSUc7SUFDSCxTQUFnQiwyQkFBMkIsQ0FBQyxFQUFpQjtRQUMzRCxRQUFRLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNsQyxLQUFLLFVBQVU7Z0JBQ2IsT0FBTyw2QkFBZ0IsQ0FBQyxjQUFjLENBQUM7WUFDekMsS0FBSyxVQUFVO2dCQUNiLE9BQU8sNkJBQWdCLENBQUMsY0FBYyxDQUFDO1lBQ3pDLEtBQUssZ0JBQWdCO2dCQUNuQixPQUFPLDZCQUFnQixDQUFDLG9CQUFvQixDQUFDO1lBQy9DLEtBQUssZUFBZTtnQkFDbEIsT0FBTyw2QkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQztZQUM5QyxLQUFLLFFBQVE7Z0JBQ1gsT0FBTyw2QkFBZ0IsQ0FBQyxZQUFZLENBQUM7WUFDdkM7Z0JBQ0UsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNILENBQUM7SUFmRCxrRUFlQztJQUVEOzs7Ozs7T0FNRztJQUNILFNBQWdCLGlCQUFpQixDQUFDLEtBQWE7UUFDN0MsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRkQsOENBRUM7SUFFRCxTQUFnQixjQUFjLENBQUMsUUFBZ0I7UUFDN0MsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRkQsd0NBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge2Fic29sdXRlRnJvbSwgQWJzb2x1dGVGc1BhdGgsIGlzUm9vdGVkLCBSZWFkb25seUZpbGVTeXN0ZW19IGZyb20gJy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0RlY2xhcmF0aW9uTm9kZSwgS25vd25EZWNsYXJhdGlvbn0gZnJvbSAnLi4vLi4vc3JjL25ndHNjL3JlZmxlY3Rpb24nO1xuXG4vKipcbiAqIEEgbGlzdCAoYEFycmF5YCkgb2YgcGFydGlhbGx5IG9yZGVyZWQgYFRgIGl0ZW1zLlxuICpcbiAqIFRoZSBpdGVtcyBpbiB0aGUgbGlzdCBhcmUgcGFydGlhbGx5IG9yZGVyZWQgaW4gdGhlIHNlbnNlIHRoYXQgYW55IGVsZW1lbnQgaGFzIGVpdGhlciB0aGUgc2FtZSBvclxuICogaGlnaGVyIHByZWNlZGVuY2UgdGhhbiBhbnkgZWxlbWVudCB3aGljaCBhcHBlYXJzIGxhdGVyIGluIHRoZSBsaXN0LiBXaGF0IFwiaGlnaGVyIHByZWNlZGVuY2VcIlxuICogbWVhbnMgYW5kIGhvdyBpdCBpcyBkZXRlcm1pbmVkIGlzIGltcGxlbWVudGF0aW9uLWRlcGVuZGVudC5cbiAqXG4gKiBTZWUgW1BhcnRpYWxseU9yZGVyZWRTZXRdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1BhcnRpYWxseV9vcmRlcmVkX3NldCkgZm9yIG1vcmUgZGV0YWlscy5cbiAqIChSZWZyYWluaW5nIGZyb20gdXNpbmcgdGhlIHRlcm0gXCJzZXRcIiBoZXJlLCB0byBhdm9pZCBjb25mdXNpb24gd2l0aCBKYXZhU2NyaXB0J3NcbiAqIFtTZXRdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1NldCkuKVxuICpcbiAqIE5PVEU6IEEgcGxhaW4gYEFycmF5PFQ+YCBpcyBub3QgYXNzaWduYWJsZSB0byBhIGBQYXJ0aWFsbHlPcmRlcmVkTGlzdDxUPmAsIGJ1dCBhXG4gKiAgICAgICBgUGFydGlhbGx5T3JkZXJlZExpc3Q8VD5gIGlzIGFzc2lnbmFibGUgdG8gYW4gYEFycmF5PFQ+YC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJ0aWFsbHlPcmRlcmVkTGlzdDxUPiBleHRlbmRzIEFycmF5PFQ+IHtcbiAgX3BhcnRpYWxseU9yZGVyZWQ6IHRydWU7XG5cbiAgbWFwPFU+KGNhbGxiYWNrZm46ICh2YWx1ZTogVCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFBhcnRpYWxseU9yZGVyZWRMaXN0PFQ+KSA9PiBVLCB0aGlzQXJnPzogYW55KTpcbiAgICAgIFBhcnRpYWxseU9yZGVyZWRMaXN0PFU+O1xuICBzbGljZSguLi5hcmdzOiBQYXJhbWV0ZXJzPEFycmF5PFQ+WydzbGljZSddPik6IFBhcnRpYWxseU9yZGVyZWRMaXN0PFQ+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JpZ2luYWxTeW1ib2woY2hlY2tlcjogdHMuVHlwZUNoZWNrZXIpOiAoc3ltYm9sOiB0cy5TeW1ib2wpID0+IHRzLlN5bWJvbCB7XG4gIHJldHVybiBmdW5jdGlvbihzeW1ib2w6IHRzLlN5bWJvbCkge1xuICAgIHJldHVybiB0cy5TeW1ib2xGbGFncy5BbGlhcyAmIHN5bWJvbC5mbGFncyA/IGNoZWNrZXIuZ2V0QWxpYXNlZFN5bWJvbChzeW1ib2wpIDogc3ltYm9sO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEZWZpbmVkPFQ+KHZhbHVlOiBUfHVuZGVmaW5lZHxudWxsKTogdmFsdWUgaXMgVCB7XG4gIHJldHVybiAodmFsdWUgIT09IHVuZGVmaW5lZCkgJiYgKHZhbHVlICE9PSBudWxsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5hbWVUZXh0KG5hbWU6IHRzLlByb3BlcnR5TmFtZXx0cy5CaW5kaW5nTmFtZSk6IHN0cmluZyB7XG4gIHJldHVybiB0cy5pc0lkZW50aWZpZXIobmFtZSkgfHwgdHMuaXNMaXRlcmFsRXhwcmVzc2lvbihuYW1lKSA/IG5hbWUudGV4dCA6IG5hbWUuZ2V0VGV4dCgpO1xufVxuXG4vKipcbiAqIFBhcnNlIGRvd24gdGhlIEFTVCBhbmQgY2FwdHVyZSBhbGwgdGhlIG5vZGVzIHRoYXQgc2F0aXNmeSB0aGUgdGVzdC5cbiAqIEBwYXJhbSBub2RlIFRoZSBzdGFydCBub2RlLlxuICogQHBhcmFtIHRlc3QgVGhlIGZ1bmN0aW9uIHRoYXQgdGVzdHMgd2hldGhlciBhIG5vZGUgc2hvdWxkIGJlIGluY2x1ZGVkLlxuICogQHJldHVybnMgYSBjb2xsZWN0aW9uIG9mIG5vZGVzIHRoYXQgc2F0aXNmeSB0aGUgdGVzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRBbGw8VD4obm9kZTogdHMuTm9kZSwgdGVzdDogKG5vZGU6IHRzLk5vZGUpID0+IG5vZGUgaXMgdHMuTm9kZSAmIFQpOiBUW10ge1xuICBjb25zdCBub2RlczogVFtdID0gW107XG4gIGZpbmRBbGxWaXNpdG9yKG5vZGUpO1xuICByZXR1cm4gbm9kZXM7XG5cbiAgZnVuY3Rpb24gZmluZEFsbFZpc2l0b3IobjogdHMuTm9kZSkge1xuICAgIGlmICh0ZXN0KG4pKSB7XG4gICAgICBub2Rlcy5wdXNoKG4pO1xuICAgIH0gZWxzZSB7XG4gICAgICBuLmZvckVhY2hDaGlsZChjaGlsZCA9PiBmaW5kQWxsVmlzaXRvcihjaGlsZCkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERvZXMgdGhlIGdpdmVuIGRlY2xhcmF0aW9uIGhhdmUgYSBuYW1lIHdoaWNoIGlzIGFuIGlkZW50aWZpZXI/XG4gKiBAcGFyYW0gZGVjbGFyYXRpb24gVGhlIGRlY2xhcmF0aW9uIHRvIHRlc3QuXG4gKiBAcmV0dXJucyB0cnVlIGlmIHRoZSBkZWNsYXJhdGlvbiBoYXMgYW4gaWRlbnRpZmllciBmb3IgYSBuYW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzTmFtZUlkZW50aWZpZXIoZGVjbGFyYXRpb246IHRzLk5vZGUpOiBkZWNsYXJhdGlvbiBpcyBEZWNsYXJhdGlvbk5vZGUmXG4gICAge25hbWU6IHRzLklkZW50aWZpZXJ9IHtcbiAgY29uc3QgbmFtZWREZWNsYXJhdGlvbjogdHMuTm9kZSZ7bmFtZT86IHRzLk5vZGV9ID0gZGVjbGFyYXRpb247XG4gIHJldHVybiBuYW1lZERlY2xhcmF0aW9uLm5hbWUgIT09IHVuZGVmaW5lZCAmJiB0cy5pc0lkZW50aWZpZXIobmFtZWREZWNsYXJhdGlvbi5uYW1lKTtcbn1cblxuLyoqXG4gKiBUZXN0IHdoZXRoZXIgYSBwYXRoIGlzIFwicmVsYXRpdmVcIi5cbiAqXG4gKiBSZWxhdGl2ZSBwYXRocyBzdGFydCB3aXRoIGAvYCwgYC4vYCBvciBgLi4vYCAob3IgdGhlIFdpbmRvd3MgZXF1aXZhbGVudHMpOyBvciBhcmUgc2ltcGx5IGAuYCBvclxuICogYC4uYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVsYXRpdmVQYXRoKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNSb290ZWQocGF0aCkgfHwgL15cXC5cXC4/KFxcL3xcXFxcfCQpLy50ZXN0KHBhdGgpO1xufVxuXG4vKipcbiAqIEEgYE1hcGAtbGlrZSBvYmplY3QgdGhhdCBjYW4gY29tcHV0ZSBhbmQgbWVtb2l6ZSBhIG1pc3NpbmcgdmFsdWUgZm9yIGFueSBrZXkuXG4gKlxuICogVGhlIGNvbXB1dGVkIHZhbHVlcyBhcmUgbWVtb2l6ZWQsIHNvIHRoZSBmYWN0b3J5IGZ1bmN0aW9uIGlzIG5vdCBjYWxsZWQgbW9yZSB0aGFuIG9uY2UgcGVyIGtleS5cbiAqIFRoaXMgaXMgdXNlZnVsIGZvciBzdG9yaW5nIHZhbHVlcyB0aGF0IGFyZSBleHBlbnNpdmUgdG8gY29tcHV0ZSBhbmQgbWF5IGJlIHVzZWQgbXVsdGlwbGUgdGltZXMuXG4gKi9cbi8vIE5PVEU6XG4vLyBJZGVhbGx5LCB0aGlzIGNsYXNzIHNob3VsZCBleHRlbmQgYE1hcGAsIGJ1dCB0aGF0IGNhdXNlcyBlcnJvcnMgaW4gRVM1IHRyYW5zcGlsZWQgY29kZTpcbi8vIGBUeXBlRXJyb3I6IENvbnN0cnVjdG9yIE1hcCByZXF1aXJlcyAnbmV3J2BcbmV4cG9ydCBjbGFzcyBGYWN0b3J5TWFwPEssIFY+IHtcbiAgcHJpdmF0ZSBpbnRlcm5hbE1hcDogTWFwPEssIFY+O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZmFjdG9yeTogKGtleTogSykgPT4gViwgZW50cmllcz86IHJlYWRvbmx5KHJlYWRvbmx5W0ssIFZdKVtdfG51bGwpIHtcbiAgICB0aGlzLmludGVybmFsTWFwID0gbmV3IE1hcChlbnRyaWVzKTtcbiAgfVxuXG4gIGdldChrZXk6IEspOiBWIHtcbiAgICBpZiAoIXRoaXMuaW50ZXJuYWxNYXAuaGFzKGtleSkpIHtcbiAgICAgIHRoaXMuaW50ZXJuYWxNYXAuc2V0KGtleSwgdGhpcy5mYWN0b3J5KGtleSkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmludGVybmFsTWFwLmdldChrZXkpITtcbiAgfVxuXG4gIHNldChrZXk6IEssIHZhbHVlOiBWKTogdm9pZCB7XG4gICAgdGhpcy5pbnRlcm5hbE1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBdHRlbXB0IHRvIHJlc29sdmUgYSBgcGF0aGAgdG8gYSBmaWxlIGJ5IGFwcGVuZGluZyB0aGUgcHJvdmlkZWQgYHBvc3RGaXhlc2BcbiAqIHRvIHRoZSBgcGF0aGAgYW5kIGNoZWNraW5nIGlmIHRoZSBmaWxlIGV4aXN0cyBvbiBkaXNrLlxuICogQHJldHVybnMgQW4gYWJzb2x1dGUgcGF0aCB0byB0aGUgZmlyc3QgbWF0Y2hpbmcgZXhpc3RpbmcgZmlsZSwgb3IgYG51bGxgIGlmIG5vbmUgZXhpc3QuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRmlsZVdpdGhQb3N0Zml4ZXMoXG4gICAgZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSwgcGF0aDogQWJzb2x1dGVGc1BhdGgsIHBvc3RGaXhlczogc3RyaW5nW10pOiBBYnNvbHV0ZUZzUGF0aHxudWxsIHtcbiAgZm9yIChjb25zdCBwb3N0Rml4IG9mIHBvc3RGaXhlcykge1xuICAgIGNvbnN0IHRlc3RQYXRoID0gYWJzb2x1dGVGcm9tKHBhdGggKyBwb3N0Rml4KTtcbiAgICBpZiAoZnMuZXhpc3RzKHRlc3RQYXRoKSAmJiBmcy5zdGF0KHRlc3RQYXRoKS5pc0ZpbGUoKSkge1xuICAgICAgcmV0dXJuIHRlc3RQYXRoO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hldGhlciBhIGZ1bmN0aW9uIGRlY2xhcmF0aW9uIGNvcnJlc3BvbmRzIHdpdGggYSBUeXBlU2NyaXB0IGhlbHBlciBmdW5jdGlvbiwgcmV0dXJuaW5nXG4gKiBpdHMga2luZCBpZiBzbyBvciBudWxsIGlmIHRoZSBkZWNsYXJhdGlvbiBkb2VzIG5vdCBzZWVtIHRvIGNvcnJlc3BvbmQgd2l0aCBzdWNoIGEgaGVscGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHNIZWxwZXJGbkZyb21EZWNsYXJhdGlvbihkZWNsOiBEZWNsYXJhdGlvbk5vZGUpOiBLbm93bkRlY2xhcmF0aW9ufG51bGwge1xuICBpZiAoIXRzLmlzRnVuY3Rpb25EZWNsYXJhdGlvbihkZWNsKSAmJiAhdHMuaXNWYXJpYWJsZURlY2xhcmF0aW9uKGRlY2wpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAoZGVjbC5uYW1lID09PSB1bmRlZmluZWQgfHwgIXRzLmlzSWRlbnRpZmllcihkZWNsLm5hbWUpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gZ2V0VHNIZWxwZXJGbkZyb21JZGVudGlmaWVyKGRlY2wubmFtZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIHdoZXRoZXIgYW4gaWRlbnRpZmllciBjb3JyZXNwb25kcyB3aXRoIGEgVHlwZVNjcmlwdCBoZWxwZXIgZnVuY3Rpb24gKGJhc2VkIG9uIGl0c1xuICogbmFtZSksIHJldHVybmluZyBpdHMga2luZCBpZiBzbyBvciBudWxsIGlmIHRoZSBpZGVudGlmaWVyIGRvZXMgbm90IHNlZW0gdG8gY29ycmVzcG9uZCB3aXRoIHN1Y2ggYVxuICogaGVscGVyLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHNIZWxwZXJGbkZyb21JZGVudGlmaWVyKGlkOiB0cy5JZGVudGlmaWVyKTogS25vd25EZWNsYXJhdGlvbnxudWxsIHtcbiAgc3dpdGNoIChzdHJpcERvbGxhclN1ZmZpeChpZC50ZXh0KSkge1xuICAgIGNhc2UgJ19fYXNzaWduJzpcbiAgICAgIHJldHVybiBLbm93bkRlY2xhcmF0aW9uLlRzSGVscGVyQXNzaWduO1xuICAgIGNhc2UgJ19fc3ByZWFkJzpcbiAgICAgIHJldHVybiBLbm93bkRlY2xhcmF0aW9uLlRzSGVscGVyU3ByZWFkO1xuICAgIGNhc2UgJ19fc3ByZWFkQXJyYXlzJzpcbiAgICAgIHJldHVybiBLbm93bkRlY2xhcmF0aW9uLlRzSGVscGVyU3ByZWFkQXJyYXlzO1xuICAgIGNhc2UgJ19fc3ByZWFkQXJyYXknOlxuICAgICAgcmV0dXJuIEtub3duRGVjbGFyYXRpb24uVHNIZWxwZXJTcHJlYWRBcnJheTtcbiAgICBjYXNlICdfX3JlYWQnOlxuICAgICAgcmV0dXJuIEtub3duRGVjbGFyYXRpb24uVHNIZWxwZXJSZWFkO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIEFuIGlkZW50aWZpZXIgbWF5IGJlY29tZSByZXBlYXRlZCB3aGVuIGJ1bmRsaW5nIG11bHRpcGxlIHNvdXJjZSBmaWxlcyBpbnRvIGEgc2luZ2xlIGJ1bmRsZSwgc29cbiAqIGJ1bmRsZXJzIGhhdmUgYSBzdHJhdGVneSBvZiBzdWZmaXhpbmcgbm9uLXVuaXF1ZSBpZGVudGlmaWVycyB3aXRoIGEgc3VmZml4IGxpa2UgJDIuIFRoaXMgZnVuY3Rpb25cbiAqIHN0cmlwcyBvZmYgc3VjaCBzdWZmaXhlcywgc28gdGhhdCBuZ2NjIGRlYWxzIHdpdGggdGhlIGNhbm9uaWNhbCBuYW1lIG9mIGFuIGlkZW50aWZpZXIuXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIHN0cmlwIGFueSBzdWZmaXggb2YsIGlmIGFwcGxpY2FibGUuXG4gKiBAcmV0dXJucyBUaGUgY2Fub25pY2FsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2YWx1ZSwgd2l0aG91dCBhbnkgc3VmZml4LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBEb2xsYXJTdWZmaXgodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXCRcXGQrJC8sICcnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwRXh0ZW5zaW9uKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gZmlsZU5hbWUucmVwbGFjZSgvXFwuLiskLywgJycpO1xufVxuIl19