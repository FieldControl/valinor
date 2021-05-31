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
        define("@angular/compiler-cli/src/ngtsc/core/src/config", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compileUndecoratedClassesWithAngularFeatures = void 0;
    // This file exists as a target for g3 patches which change the Angular compiler's behavior.
    // Separating the patched code in a separate file eliminates the possibility of conflicts with the
    // patch diffs when making changes to the rest of the compiler codebase.
    // In ngtsc we no longer want to compile undecorated classes with Angular features.
    // Migrations for these patterns ran as part of `ng update` and we want to ensure
    // that projects do not regress. See https://hackmd.io/@alx/ryfYYuvzH for more details.
    exports.compileUndecoratedClassesWithAngularFeatures = false;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9jb3JlL3NyYy9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsNEZBQTRGO0lBQzVGLGtHQUFrRztJQUNsRyx3RUFBd0U7SUFFeEUsbUZBQW1GO0lBQ25GLGlGQUFpRjtJQUNqRix1RkFBdUY7SUFDMUUsUUFBQSw0Q0FBNEMsR0FBRyxLQUFLLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVGhpcyBmaWxlIGV4aXN0cyBhcyBhIHRhcmdldCBmb3IgZzMgcGF0Y2hlcyB3aGljaCBjaGFuZ2UgdGhlIEFuZ3VsYXIgY29tcGlsZXIncyBiZWhhdmlvci5cbi8vIFNlcGFyYXRpbmcgdGhlIHBhdGNoZWQgY29kZSBpbiBhIHNlcGFyYXRlIGZpbGUgZWxpbWluYXRlcyB0aGUgcG9zc2liaWxpdHkgb2YgY29uZmxpY3RzIHdpdGggdGhlXG4vLyBwYXRjaCBkaWZmcyB3aGVuIG1ha2luZyBjaGFuZ2VzIHRvIHRoZSByZXN0IG9mIHRoZSBjb21waWxlciBjb2RlYmFzZS5cblxuLy8gSW4gbmd0c2Mgd2Ugbm8gbG9uZ2VyIHdhbnQgdG8gY29tcGlsZSB1bmRlY29yYXRlZCBjbGFzc2VzIHdpdGggQW5ndWxhciBmZWF0dXJlcy5cbi8vIE1pZ3JhdGlvbnMgZm9yIHRoZXNlIHBhdHRlcm5zIHJhbiBhcyBwYXJ0IG9mIGBuZyB1cGRhdGVgIGFuZCB3ZSB3YW50IHRvIGVuc3VyZVxuLy8gdGhhdCBwcm9qZWN0cyBkbyBub3QgcmVncmVzcy4gU2VlIGh0dHBzOi8vaGFja21kLmlvL0BhbHgvcnlmWVl1dnpIIGZvciBtb3JlIGRldGFpbHMuXG5leHBvcnQgY29uc3QgY29tcGlsZVVuZGVjb3JhdGVkQ2xhc3Nlc1dpdGhBbmd1bGFyRmVhdHVyZXMgPSBmYWxzZTtcbiJdfQ==