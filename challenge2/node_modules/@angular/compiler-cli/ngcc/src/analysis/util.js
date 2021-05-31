(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/analysis/util", ["require", "exports", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NOOP_DEPENDENCY_TRACKER = exports.isWithinPackage = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    function isWithinPackage(packagePath, filePath) {
        var relativePath = file_system_1.relative(packagePath, filePath);
        return file_system_1.isLocalRelativePath(relativePath) && !relativePath.startsWith('node_modules/');
    }
    exports.isWithinPackage = isWithinPackage;
    var NoopDependencyTracker = /** @class */ (function () {
        function NoopDependencyTracker() {
        }
        NoopDependencyTracker.prototype.addDependency = function () { };
        NoopDependencyTracker.prototype.addResourceDependency = function () { };
        NoopDependencyTracker.prototype.recordDependencyAnalysisFailure = function () { };
        return NoopDependencyTracker;
    }());
    exports.NOOP_DEPENDENCY_TRACKER = new NoopDependencyTracker();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy9hbmFseXNpcy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDJFQUE2RjtJQUc3RixTQUFnQixlQUFlLENBQUMsV0FBMkIsRUFBRSxRQUF3QjtRQUNuRixJQUFNLFlBQVksR0FBRyxzQkFBUSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNyRCxPQUFPLGlDQUFtQixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBSEQsMENBR0M7SUFFRDtRQUFBO1FBSUEsQ0FBQztRQUhDLDZDQUFhLEdBQWIsY0FBdUIsQ0FBQztRQUN4QixxREFBcUIsR0FBckIsY0FBK0IsQ0FBQztRQUNoQywrREFBK0IsR0FBL0IsY0FBeUMsQ0FBQztRQUM1Qyw0QkFBQztJQUFELENBQUMsQUFKRCxJQUlDO0lBRVksUUFBQSx1QkFBdUIsR0FBc0IsSUFBSSxxQkFBcUIsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBpc0xvY2FsUmVsYXRpdmVQYXRoLCByZWxhdGl2ZX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7RGVwZW5kZW5jeVRyYWNrZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9pbmNyZW1lbnRhbC9hcGknO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNXaXRoaW5QYWNrYWdlKHBhY2thZ2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgZmlsZVBhdGg6IEFic29sdXRlRnNQYXRoKTogYm9vbGVhbiB7XG4gIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlKHBhY2thZ2VQYXRoLCBmaWxlUGF0aCk7XG4gIHJldHVybiBpc0xvY2FsUmVsYXRpdmVQYXRoKHJlbGF0aXZlUGF0aCkgJiYgIXJlbGF0aXZlUGF0aC5zdGFydHNXaXRoKCdub2RlX21vZHVsZXMvJyk7XG59XG5cbmNsYXNzIE5vb3BEZXBlbmRlbmN5VHJhY2tlciBpbXBsZW1lbnRzIERlcGVuZGVuY3lUcmFja2VyIHtcbiAgYWRkRGVwZW5kZW5jeSgpOiB2b2lkIHt9XG4gIGFkZFJlc291cmNlRGVwZW5kZW5jeSgpOiB2b2lkIHt9XG4gIHJlY29yZERlcGVuZGVuY3lBbmFseXNpc0ZhaWx1cmUoKTogdm9pZCB7fVxufVxuXG5leHBvcnQgY29uc3QgTk9PUF9ERVBFTkRFTkNZX1RSQUNLRVI6IERlcGVuZGVuY3lUcmFja2VyID0gbmV3IE5vb3BEZXBlbmRlbmN5VHJhY2tlcigpO1xuIl19