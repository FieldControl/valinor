(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_posix", ["require", "exports", "tslib", "path", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MockFileSystemPosix = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /// <reference types="node" />
    var p = require("path");
    var mock_file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system");
    var MockFileSystemPosix = /** @class */ (function (_super) {
        tslib_1.__extends(MockFileSystemPosix, _super);
        function MockFileSystemPosix() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MockFileSystemPosix.prototype.resolve = function () {
            var _a;
            var paths = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                paths[_i] = arguments[_i];
            }
            var resolved = (_a = p.posix).resolve.apply(_a, tslib_1.__spreadArray([this.pwd()], tslib_1.__read(paths)));
            return this.normalize(resolved);
        };
        MockFileSystemPosix.prototype.dirname = function (file) {
            return this.normalize(p.posix.dirname(file));
        };
        MockFileSystemPosix.prototype.join = function (basePath) {
            var _a;
            var paths = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                paths[_i - 1] = arguments[_i];
            }
            return this.normalize((_a = p.posix).join.apply(_a, tslib_1.__spreadArray([basePath], tslib_1.__read(paths))));
        };
        MockFileSystemPosix.prototype.relative = function (from, to) {
            return this.normalize(p.posix.relative(from, to));
        };
        MockFileSystemPosix.prototype.basename = function (filePath, extension) {
            return p.posix.basename(filePath, extension);
        };
        MockFileSystemPosix.prototype.isRooted = function (path) {
            return path.startsWith('/');
        };
        MockFileSystemPosix.prototype.splitPath = function (path) {
            return path.split('/');
        };
        MockFileSystemPosix.prototype.normalize = function (path) {
            return path.replace(/^[a-z]:\//i, '/').replace(/\\/g, '/');
        };
        return MockFileSystemPosix;
    }(mock_file_system_1.MockFileSystem));
    exports.MockFileSystemPosix = MockFileSystemPosix;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19maWxlX3N5c3RlbV9wb3NpeC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0vdGVzdGluZy9zcmMvbW9ja19maWxlX3N5c3RlbV9wb3NpeC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsOEJBQThCO0lBQzlCLHdCQUEwQjtJQUcxQiw2R0FBa0Q7SUFFbEQ7UUFBeUMsK0NBQWM7UUFBdkQ7O1FBaUNBLENBQUM7UUFoQ0MscUNBQU8sR0FBUDs7WUFBUSxlQUFrQjtpQkFBbEIsVUFBa0IsRUFBbEIscUJBQWtCLEVBQWxCLElBQWtCO2dCQUFsQiwwQkFBa0I7O1lBQ3hCLElBQU0sUUFBUSxHQUFHLENBQUEsS0FBQSxDQUFDLENBQUMsS0FBSyxDQUFBLENBQUMsT0FBTyxrQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLGtCQUFLLEtBQUssR0FBQyxDQUFDO1lBQ3ZELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQW1CLENBQUM7UUFDcEQsQ0FBQztRQUVELHFDQUFPLEdBQVAsVUFBMEIsSUFBTztZQUMvQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQU0sQ0FBQztRQUNwRCxDQUFDO1FBRUQsa0NBQUksR0FBSixVQUF1QixRQUFXOztZQUFFLGVBQWtCO2lCQUFsQixVQUFrQixFQUFsQixxQkFBa0IsRUFBbEIsSUFBa0I7Z0JBQWxCLDhCQUFrQjs7WUFDcEQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUEsS0FBQSxDQUFDLENBQUMsS0FBSyxDQUFBLENBQUMsSUFBSSxrQ0FBQyxRQUFRLGtCQUFLLEtBQUssSUFBTyxDQUFDO1FBQy9ELENBQUM7UUFFRCxzQ0FBUSxHQUFSLFVBQStCLElBQU8sRUFBRSxFQUFLO1lBQzNDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQWlDLENBQUM7UUFDcEYsQ0FBQztRQUVELHNDQUFRLEdBQVIsVUFBUyxRQUFnQixFQUFFLFNBQWtCO1lBQzNDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBZ0IsQ0FBQztRQUM5RCxDQUFDO1FBRUQsc0NBQVEsR0FBUixVQUFTLElBQVk7WUFDbkIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFUyx1Q0FBUyxHQUFuQixVQUEwQyxJQUFPO1lBQy9DLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBRUQsdUNBQVMsR0FBVCxVQUFnQyxJQUFPO1lBQ3JDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQU0sQ0FBQztRQUNsRSxDQUFDO1FBQ0gsMEJBQUM7SUFBRCxDQUFDLEFBakNELENBQXlDLGlDQUFjLEdBaUN0RDtJQWpDWSxrREFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwibm9kZVwiIC8+XG5pbXBvcnQgKiBhcyBwIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBQYXRoU2VnbWVudCwgUGF0aFN0cmluZ30gZnJvbSAnLi4vLi4vc3JjL3R5cGVzJztcbmltcG9ydCB7TW9ja0ZpbGVTeXN0ZW19IGZyb20gJy4vbW9ja19maWxlX3N5c3RlbSc7XG5cbmV4cG9ydCBjbGFzcyBNb2NrRmlsZVN5c3RlbVBvc2l4IGV4dGVuZHMgTW9ja0ZpbGVTeXN0ZW0ge1xuICByZXNvbHZlKC4uLnBhdGhzOiBzdHJpbmdbXSk6IEFic29sdXRlRnNQYXRoIHtcbiAgICBjb25zdCByZXNvbHZlZCA9IHAucG9zaXgucmVzb2x2ZSh0aGlzLnB3ZCgpLCAuLi5wYXRocyk7XG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKHJlc29sdmVkKSBhcyBBYnNvbHV0ZUZzUGF0aDtcbiAgfVxuXG4gIGRpcm5hbWU8VCBleHRlbmRzIHN0cmluZz4oZmlsZTogVCk6IFQge1xuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZShwLnBvc2l4LmRpcm5hbWUoZmlsZSkpIGFzIFQ7XG4gIH1cblxuICBqb2luPFQgZXh0ZW5kcyBzdHJpbmc+KGJhc2VQYXRoOiBULCAuLi5wYXRoczogc3RyaW5nW10pOiBUIHtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUocC5wb3NpeC5qb2luKGJhc2VQYXRoLCAuLi5wYXRocykpIGFzIFQ7XG4gIH1cblxuICByZWxhdGl2ZTxUIGV4dGVuZHMgUGF0aFN0cmluZz4oZnJvbTogVCwgdG86IFQpOiBQYXRoU2VnbWVudHxBYnNvbHV0ZUZzUGF0aCB7XG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKHAucG9zaXgucmVsYXRpdmUoZnJvbSwgdG8pKSBhcyBQYXRoU2VnbWVudCB8IEFic29sdXRlRnNQYXRoO1xuICB9XG5cbiAgYmFzZW5hbWUoZmlsZVBhdGg6IHN0cmluZywgZXh0ZW5zaW9uPzogc3RyaW5nKTogUGF0aFNlZ21lbnQge1xuICAgIHJldHVybiBwLnBvc2l4LmJhc2VuYW1lKGZpbGVQYXRoLCBleHRlbnNpb24pIGFzIFBhdGhTZWdtZW50O1xuICB9XG5cbiAgaXNSb290ZWQocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHBhdGguc3RhcnRzV2l0aCgnLycpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHNwbGl0UGF0aDxUIGV4dGVuZHMgUGF0aFN0cmluZz4ocGF0aDogVCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gcGF0aC5zcGxpdCgnLycpO1xuICB9XG5cbiAgbm9ybWFsaXplPFQgZXh0ZW5kcyBQYXRoU3RyaW5nPihwYXRoOiBUKTogVCB7XG4gICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXlthLXpdOlxcLy9pLCAnLycpLnJlcGxhY2UoL1xcXFwvZywgJy8nKSBhcyBUO1xuICB9XG59XG4iXX0=