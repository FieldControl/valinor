(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/src/ast/utils", ["require", "exports", "@angular/compiler-cli/linker/src/fatal_linker_error"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assert = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var fatal_linker_error_1 = require("@angular/compiler-cli/linker/src/fatal_linker_error");
    /**
     * Assert that the given `node` is of the type guarded by the `predicate` function.
     */
    function assert(node, predicate, expected) {
        if (!predicate(node)) {
            throw new fatal_linker_error_1.FatalLinkerError(node, "Unsupported syntax, expected " + expected + ".");
        }
    }
    exports.assert = assert;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbGlua2VyL3NyYy9hc3QvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsMEZBQXVEO0lBRXZEOztPQUVHO0lBQ0gsU0FBZ0IsTUFBTSxDQUNsQixJQUFPLEVBQUUsU0FBaUMsRUFBRSxRQUFnQjtRQUM5RCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxxQ0FBZ0IsQ0FBQyxJQUFJLEVBQUUsa0NBQWdDLFFBQVEsTUFBRyxDQUFDLENBQUM7U0FDL0U7SUFDSCxDQUFDO0lBTEQsd0JBS0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7RmF0YWxMaW5rZXJFcnJvcn0gZnJvbSAnLi4vZmF0YWxfbGlua2VyX2Vycm9yJztcblxuLyoqXG4gKiBBc3NlcnQgdGhhdCB0aGUgZ2l2ZW4gYG5vZGVgIGlzIG9mIHRoZSB0eXBlIGd1YXJkZWQgYnkgdGhlIGBwcmVkaWNhdGVgIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0PFQsIEsgZXh0ZW5kcyBUPihcbiAgICBub2RlOiBULCBwcmVkaWNhdGU6IChub2RlOiBUKSA9PiBub2RlIGlzIEssIGV4cGVjdGVkOiBzdHJpbmcpOiBhc3NlcnRzIG5vZGUgaXMgSyB7XG4gIGlmICghcHJlZGljYXRlKG5vZGUpKSB7XG4gICAgdGhyb3cgbmV3IEZhdGFsTGlua2VyRXJyb3Iobm9kZSwgYFVuc3VwcG9ydGVkIHN5bnRheCwgZXhwZWN0ZWQgJHtleHBlY3RlZH0uYCk7XG4gIH1cbn1cbiJdfQ==