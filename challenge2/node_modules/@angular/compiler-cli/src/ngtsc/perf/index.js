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
        define("@angular/compiler-cli/src/ngtsc/perf", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/perf/src/api", "@angular/compiler-cli/src/ngtsc/perf/src/noop", "@angular/compiler-cli/src/ngtsc/perf/src/recorder"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DelegatingPerfRecorder = exports.ActivePerfRecorder = exports.NOOP_PERF_RECORDER = void 0;
    var tslib_1 = require("tslib");
    tslib_1.__exportStar(require("@angular/compiler-cli/src/ngtsc/perf/src/api"), exports);
    var noop_1 = require("@angular/compiler-cli/src/ngtsc/perf/src/noop");
    Object.defineProperty(exports, "NOOP_PERF_RECORDER", { enumerable: true, get: function () { return noop_1.NOOP_PERF_RECORDER; } });
    var recorder_1 = require("@angular/compiler-cli/src/ngtsc/perf/src/recorder");
    Object.defineProperty(exports, "ActivePerfRecorder", { enumerable: true, get: function () { return recorder_1.ActivePerfRecorder; } });
    Object.defineProperty(exports, "DelegatingPerfRecorder", { enumerable: true, get: function () { return recorder_1.DelegatingPerfRecorder; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3BlcmYvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILHVGQUEwQjtJQUMxQixzRUFBOEM7SUFBdEMsMEdBQUEsa0JBQWtCLE9BQUE7SUFDMUIsOEVBQTBFO0lBQWxFLDhHQUFBLGtCQUFrQixPQUFBO0lBQUUsa0hBQUEsc0JBQXNCLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0ICogZnJvbSAnLi9zcmMvYXBpJztcbmV4cG9ydCB7Tk9PUF9QRVJGX1JFQ09SREVSfSBmcm9tICcuL3NyYy9ub29wJztcbmV4cG9ydCB7QWN0aXZlUGVyZlJlY29yZGVyLCBEZWxlZ2F0aW5nUGVyZlJlY29yZGVyfSBmcm9tICcuL3NyYy9yZWNvcmRlcic7XG4iXX0=