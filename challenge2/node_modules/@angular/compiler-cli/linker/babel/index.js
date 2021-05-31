(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/linker/babel", ["require", "exports", "@angular/compiler-cli/linker/babel/src/babel_plugin", "@angular/compiler-cli/linker/babel/src/es2015_linker_plugin"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createEs2015LinkerPlugin = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var babel_plugin_1 = require("@angular/compiler-cli/linker/babel/src/babel_plugin");
    var es2015_linker_plugin_1 = require("@angular/compiler-cli/linker/babel/src/es2015_linker_plugin");
    Object.defineProperty(exports, "createEs2015LinkerPlugin", { enumerable: true, get: function () { return es2015_linker_plugin_1.createEs2015LinkerPlugin; } });
    exports.default = babel_plugin_1.defaultLinkerPlugin;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbGlua2VyL2JhYmVsL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILG9GQUF1RDtJQUV2RCxvR0FBb0U7SUFBNUQsZ0lBQUEsd0JBQXdCLE9BQUE7SUFDaEMsa0JBQWUsa0NBQW1CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7ZGVmYXVsdExpbmtlclBsdWdpbn0gZnJvbSAnLi9zcmMvYmFiZWxfcGx1Z2luJztcblxuZXhwb3J0IHtjcmVhdGVFczIwMTVMaW5rZXJQbHVnaW59IGZyb20gJy4vc3JjL2VzMjAxNV9saW5rZXJfcGx1Z2luJztcbmV4cG9ydCBkZWZhdWx0IGRlZmF1bHRMaW5rZXJQbHVnaW47XG4iXX0=