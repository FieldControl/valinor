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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/references_registry", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NoopReferencesRegistry = void 0;
    /**
     * This registry does nothing, since ngtsc does not currently need
     * this functionality.
     * The ngcc tool implements a working version for its purposes.
     */
    var NoopReferencesRegistry = /** @class */ (function () {
        function NoopReferencesRegistry() {
        }
        NoopReferencesRegistry.prototype.add = function (source) {
            var references = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                references[_i - 1] = arguments[_i];
            }
        };
        return NoopReferencesRegistry;
    }());
    exports.NoopReferencesRegistry = NoopReferencesRegistry;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmZXJlbmNlc19yZWdpc3RyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvYW5ub3RhdGlvbnMvc3JjL3JlZmVyZW5jZXNfcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBaUJIOzs7O09BSUc7SUFDSDtRQUFBO1FBRUEsQ0FBQztRQURDLG9DQUFHLEdBQUgsVUFBSSxNQUF1QjtZQUFFLG9CQUEyQztpQkFBM0MsVUFBMkMsRUFBM0MscUJBQTJDLEVBQTNDLElBQTJDO2dCQUEzQyxtQ0FBMkM7O1FBQVMsQ0FBQztRQUNwRiw2QkFBQztJQUFELENBQUMsQUFGRCxJQUVDO0lBRlksd0RBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UmVmZXJlbmNlfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7RGVjbGFyYXRpb25Ob2RlfSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcblxuLyoqXG4gKiBJbXBsZW1lbnQgdGhpcyBpbnRlcmZhY2UgaWYgeW91IHdhbnQgRGVjb3JhdG9ySGFuZGxlcnMgdG8gcmVnaXN0ZXJcbiAqIHJlZmVyZW5jZXMgdGhhdCB0aGV5IGZpbmQgaW4gdGhlaXIgYW5hbHlzaXMgb2YgdGhlIGNvZGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVmZXJlbmNlc1JlZ2lzdHJ5IHtcbiAgLyoqXG4gICAqIFJlZ2lzdGVyIG9uZSBvciBtb3JlIHJlZmVyZW5jZXMgaW4gdGhlIHJlZ2lzdHJ5LlxuICAgKiBAcGFyYW0gcmVmZXJlbmNlcyBBIGNvbGxlY3Rpb24gb2YgcmVmZXJlbmNlcyB0byByZWdpc3Rlci5cbiAgICovXG4gIGFkZChzb3VyY2U6IERlY2xhcmF0aW9uTm9kZSwgLi4ucmVmZXJlbmNlczogUmVmZXJlbmNlPERlY2xhcmF0aW9uTm9kZT5bXSk6IHZvaWQ7XG59XG5cbi8qKlxuICogVGhpcyByZWdpc3RyeSBkb2VzIG5vdGhpbmcsIHNpbmNlIG5ndHNjIGRvZXMgbm90IGN1cnJlbnRseSBuZWVkXG4gKiB0aGlzIGZ1bmN0aW9uYWxpdHkuXG4gKiBUaGUgbmdjYyB0b29sIGltcGxlbWVudHMgYSB3b3JraW5nIHZlcnNpb24gZm9yIGl0cyBwdXJwb3Nlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE5vb3BSZWZlcmVuY2VzUmVnaXN0cnkgaW1wbGVtZW50cyBSZWZlcmVuY2VzUmVnaXN0cnkge1xuICBhZGQoc291cmNlOiBEZWNsYXJhdGlvbk5vZGUsIC4uLnJlZmVyZW5jZXM6IFJlZmVyZW5jZTxEZWNsYXJhdGlvbk5vZGU+W10pOiB2b2lkIHt9XG59XG4iXX0=