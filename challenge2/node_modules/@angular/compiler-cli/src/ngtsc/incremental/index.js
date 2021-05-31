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
        define("@angular/compiler-cli/src/ngtsc/incremental", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/incremental/src/incremental", "@angular/compiler-cli/src/ngtsc/incremental/src/noop", "@angular/compiler-cli/src/ngtsc/incremental/src/state", "@angular/compiler-cli/src/ngtsc/incremental/src/strategy"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IncrementalStateKind = exports.NOOP_INCREMENTAL_BUILD = exports.IncrementalCompilation = void 0;
    var tslib_1 = require("tslib");
    var incremental_1 = require("@angular/compiler-cli/src/ngtsc/incremental/src/incremental");
    Object.defineProperty(exports, "IncrementalCompilation", { enumerable: true, get: function () { return incremental_1.IncrementalCompilation; } });
    var noop_1 = require("@angular/compiler-cli/src/ngtsc/incremental/src/noop");
    Object.defineProperty(exports, "NOOP_INCREMENTAL_BUILD", { enumerable: true, get: function () { return noop_1.NOOP_INCREMENTAL_BUILD; } });
    var state_1 = require("@angular/compiler-cli/src/ngtsc/incremental/src/state");
    Object.defineProperty(exports, "IncrementalStateKind", { enumerable: true, get: function () { return state_1.IncrementalStateKind; } });
    tslib_1.__exportStar(require("@angular/compiler-cli/src/ngtsc/incremental/src/strategy"), exports);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2luY3JlbWVudGFsL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwyRkFBeUQ7SUFBakQscUhBQUEsc0JBQXNCLE9BQUE7SUFDOUIsNkVBQWtEO0lBQTFDLDhHQUFBLHNCQUFzQixPQUFBO0lBQzlCLCtFQUEySTtJQUF6Qyw2R0FBQSxvQkFBb0IsT0FBQTtJQUV0SCxtR0FBK0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IHtJbmNyZW1lbnRhbENvbXBpbGF0aW9ufSBmcm9tICcuL3NyYy9pbmNyZW1lbnRhbCc7XG5leHBvcnQge05PT1BfSU5DUkVNRU5UQUxfQlVJTER9IGZyb20gJy4vc3JjL25vb3AnO1xuZXhwb3J0IHtBbmFseXplZEluY3JlbWVudGFsU3RhdGUsIERlbHRhSW5jcmVtZW50YWxTdGF0ZSwgRnJlc2hJbmNyZW1lbnRhbFN0YXRlLCBJbmNyZW1lbnRhbFN0YXRlLCBJbmNyZW1lbnRhbFN0YXRlS2luZH0gZnJvbSAnLi9zcmMvc3RhdGUnO1xuXG5leHBvcnQgKiBmcm9tICcuL3NyYy9zdHJhdGVneSc7XG4iXX0=