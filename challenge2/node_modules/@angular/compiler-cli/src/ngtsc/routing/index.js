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
        define("@angular/compiler-cli/src/ngtsc/routing", ["require", "exports", "@angular/compiler-cli/src/ngtsc/routing/src/analyzer", "@angular/compiler-cli/src/ngtsc/routing/src/route"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.entryPointKeyFor = exports.NgModuleRouteAnalyzer = void 0;
    /// <reference types="node" />
    var analyzer_1 = require("@angular/compiler-cli/src/ngtsc/routing/src/analyzer");
    Object.defineProperty(exports, "NgModuleRouteAnalyzer", { enumerable: true, get: function () { return analyzer_1.NgModuleRouteAnalyzer; } });
    var route_1 = require("@angular/compiler-cli/src/ngtsc/routing/src/route");
    Object.defineProperty(exports, "entryPointKeyFor", { enumerable: true, get: function () { return route_1.entryPointKeyFor; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3JvdXRpbmcvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsOEJBQThCO0lBRTlCLGlGQUFnRTtJQUE3QyxpSEFBQSxxQkFBcUIsT0FBQTtJQUN4QywyRUFBNkM7SUFBckMseUdBQUEsZ0JBQWdCLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJub2RlXCIgLz5cblxuZXhwb3J0IHtMYXp5Um91dGUsIE5nTW9kdWxlUm91dGVBbmFseXplcn0gZnJvbSAnLi9zcmMvYW5hbHl6ZXInO1xuZXhwb3J0IHtlbnRyeVBvaW50S2V5Rm9yfSBmcm9tICcuL3NyYy9yb3V0ZSc7XG4iXX0=