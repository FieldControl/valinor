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
        define("@angular/compiler-cli/src/ngtsc/typecheck/api/scope", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NvcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3R5cGVjaGVjay9hcGkvc2NvcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9ufSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcblxuLyoqXG4gKiBNZXRhZGF0YSBvbiBhIGRpcmVjdGl2ZSB3aGljaCBpcyBhdmFpbGFibGUgaW4gdGhlIHNjb3BlIG9mIGEgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlyZWN0aXZlSW5TY29wZSB7XG4gIC8qKlxuICAgKiBUaGUgYHRzLlN5bWJvbGAgZm9yIHRoZSBkaXJlY3RpdmUgY2xhc3MuXG4gICAqL1xuICB0c1N5bWJvbDogdHMuU3ltYm9sO1xuXG4gIC8qKlxuICAgKiBUaGUgbW9kdWxlIHdoaWNoIGRlY2xhcmVzIHRoZSBkaXJlY3RpdmUuXG4gICAqL1xuICBuZ01vZHVsZTogQ2xhc3NEZWNsYXJhdGlvbnxudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgc2VsZWN0b3IgZm9yIHRoZSBkaXJlY3RpdmUgb3IgY29tcG9uZW50LlxuICAgKi9cbiAgc2VsZWN0b3I6IHN0cmluZztcblxuICAvKipcbiAgICogYHRydWVgIGlmIHRoaXMgZGlyZWN0aXZlIGlzIGEgY29tcG9uZW50LlxuICAgKi9cbiAgaXNDb21wb25lbnQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIGB0cnVlYCBpZiB0aGlzIGRpcmVjdGl2ZSBpcyBhIHN0cnVjdHVyYWwgZGlyZWN0aXZlLlxuICAgKi9cbiAgaXNTdHJ1Y3R1cmFsOiBib29sZWFuO1xufVxuXG4vKipcbiAqIE1ldGFkYXRhIGZvciBhIHBpcGUgd2hpY2ggaXMgYXZhaWxhYmxlIGluIHRoZSBzY29wZSBvZiBhIHRlbXBsYXRlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBpcGVJblNjb3BlIHtcbiAgLyoqXG4gICAqIFRoZSBgdHMuU3ltYm9sYCBmb3IgdGhlIHBpcGUgY2xhc3MuXG4gICAqL1xuICB0c1N5bWJvbDogdHMuU3ltYm9sO1xuXG4gIC8qKlxuICAgKiBOYW1lIG9mIHRoZSBwaXBlLlxuICAgKi9cbiAgbmFtZTogc3RyaW5nO1xufVxuIl19