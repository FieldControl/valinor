(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_windows", ["require", "exports", "tslib", "path", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MockFileSystemWindows = void 0;
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
    var MockFileSystemWindows = /** @class */ (function (_super) {
        tslib_1.__extends(MockFileSystemWindows, _super);
        function MockFileSystemWindows() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MockFileSystemWindows.prototype.resolve = function () {
            var _a;
            var paths = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                paths[_i] = arguments[_i];
            }
            var resolved = (_a = p.win32).resolve.apply(_a, tslib_1.__spreadArray([this.pwd()], tslib_1.__read(paths)));
            return this.normalize(resolved);
        };
        MockFileSystemWindows.prototype.dirname = function (path) {
            return this.normalize(p.win32.dirname(path));
        };
        MockFileSystemWindows.prototype.join = function (basePath) {
            var _a;
            var paths = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                paths[_i - 1] = arguments[_i];
            }
            return this.normalize((_a = p.win32).join.apply(_a, tslib_1.__spreadArray([basePath], tslib_1.__read(paths))));
        };
        MockFileSystemWindows.prototype.relative = function (from, to) {
            return this.normalize(p.win32.relative(from, to));
        };
        MockFileSystemWindows.prototype.basename = function (filePath, extension) {
            return p.win32.basename(filePath, extension);
        };
        MockFileSystemWindows.prototype.isRooted = function (path) {
            return /^([A-Z]:)?([\\\/]|$)/i.test(path);
        };
        MockFileSystemWindows.prototype.splitPath = function (path) {
            return path.split(/[\\\/]/);
        };
        MockFileSystemWindows.prototype.normalize = function (path) {
            return path.replace(/^[\/\\]/i, 'C:/').replace(/\\/g, '/');
        };
        return MockFileSystemWindows;
    }(mock_file_system_1.MockFileSystem));
    exports.MockFileSystemWindows = MockFileSystemWindows;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19maWxlX3N5c3RlbV93aW5kb3dzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9maWxlX3N5c3RlbS90ZXN0aW5nL3NyYy9tb2NrX2ZpbGVfc3lzdGVtX3dpbmRvd3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDhCQUE4QjtJQUM5Qix3QkFBMEI7SUFHMUIsNkdBQWtEO0lBRWxEO1FBQTJDLGlEQUFjO1FBQXpEOztRQWlDQSxDQUFDO1FBaENDLHVDQUFPLEdBQVA7O1lBQVEsZUFBa0I7aUJBQWxCLFVBQWtCLEVBQWxCLHFCQUFrQixFQUFsQixJQUFrQjtnQkFBbEIsMEJBQWtCOztZQUN4QixJQUFNLFFBQVEsR0FBRyxDQUFBLEtBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQSxDQUFDLE9BQU8sa0NBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxrQkFBSyxLQUFLLEdBQUMsQ0FBQztZQUN2RCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBMEIsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFRCx1Q0FBTyxHQUFQLFVBQTBCLElBQU87WUFDL0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBTSxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVELG9DQUFJLEdBQUosVUFBdUIsUUFBVzs7WUFBRSxlQUFrQjtpQkFBbEIsVUFBa0IsRUFBbEIscUJBQWtCLEVBQWxCLElBQWtCO2dCQUFsQiw4QkFBa0I7O1lBQ3BELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBLEtBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQSxDQUFDLElBQUksa0NBQUMsUUFBUSxrQkFBSyxLQUFLLElBQU8sQ0FBQztRQUMvRCxDQUFDO1FBRUQsd0NBQVEsR0FBUixVQUErQixJQUFPLEVBQUUsRUFBSztZQUMzQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFpQyxDQUFDO1FBQ3BGLENBQUM7UUFFRCx3Q0FBUSxHQUFSLFVBQVMsUUFBZ0IsRUFBRSxTQUFrQjtZQUMzQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQWdCLENBQUM7UUFDOUQsQ0FBQztRQUVELHdDQUFRLEdBQVIsVUFBUyxJQUFZO1lBQ25CLE9BQU8sdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFUyx5Q0FBUyxHQUFuQixVQUEwQyxJQUFPO1lBQy9DLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQseUNBQVMsR0FBVCxVQUFnQyxJQUFPO1lBQ3JDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQU0sQ0FBQztRQUNsRSxDQUFDO1FBQ0gsNEJBQUM7SUFBRCxDQUFDLEFBakNELENBQTJDLGlDQUFjLEdBaUN4RDtJQWpDWSxzREFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwibm9kZVwiIC8+XG5pbXBvcnQgKiBhcyBwIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBQYXRoU2VnbWVudCwgUGF0aFN0cmluZ30gZnJvbSAnLi4vLi4vc3JjL3R5cGVzJztcbmltcG9ydCB7TW9ja0ZpbGVTeXN0ZW19IGZyb20gJy4vbW9ja19maWxlX3N5c3RlbSc7XG5cbmV4cG9ydCBjbGFzcyBNb2NrRmlsZVN5c3RlbVdpbmRvd3MgZXh0ZW5kcyBNb2NrRmlsZVN5c3RlbSB7XG4gIHJlc29sdmUoLi4ucGF0aHM6IHN0cmluZ1tdKTogQWJzb2x1dGVGc1BhdGgge1xuICAgIGNvbnN0IHJlc29sdmVkID0gcC53aW4zMi5yZXNvbHZlKHRoaXMucHdkKCksIC4uLnBhdGhzKTtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUocmVzb2x2ZWQgYXMgQWJzb2x1dGVGc1BhdGgpO1xuICB9XG5cbiAgZGlybmFtZTxUIGV4dGVuZHMgc3RyaW5nPihwYXRoOiBUKTogVCB7XG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKHAud2luMzIuZGlybmFtZShwYXRoKSBhcyBUKTtcbiAgfVxuXG4gIGpvaW48VCBleHRlbmRzIHN0cmluZz4oYmFzZVBhdGg6IFQsIC4uLnBhdGhzOiBzdHJpbmdbXSk6IFQge1xuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZShwLndpbjMyLmpvaW4oYmFzZVBhdGgsIC4uLnBhdGhzKSkgYXMgVDtcbiAgfVxuXG4gIHJlbGF0aXZlPFQgZXh0ZW5kcyBQYXRoU3RyaW5nPihmcm9tOiBULCB0bzogVCk6IFBhdGhTZWdtZW50fEFic29sdXRlRnNQYXRoIHtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUocC53aW4zMi5yZWxhdGl2ZShmcm9tLCB0bykpIGFzIFBhdGhTZWdtZW50IHwgQWJzb2x1dGVGc1BhdGg7XG4gIH1cblxuICBiYXNlbmFtZShmaWxlUGF0aDogc3RyaW5nLCBleHRlbnNpb24/OiBzdHJpbmcpOiBQYXRoU2VnbWVudCB7XG4gICAgcmV0dXJuIHAud2luMzIuYmFzZW5hbWUoZmlsZVBhdGgsIGV4dGVuc2lvbikgYXMgUGF0aFNlZ21lbnQ7XG4gIH1cblxuICBpc1Jvb3RlZChwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gL14oW0EtWl06KT8oW1xcXFxcXC9dfCQpL2kudGVzdChwYXRoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzcGxpdFBhdGg8VCBleHRlbmRzIFBhdGhTdHJpbmc+KHBhdGg6IFQpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHBhdGguc3BsaXQoL1tcXFxcXFwvXS8pO1xuICB9XG5cbiAgbm9ybWFsaXplPFQgZXh0ZW5kcyBQYXRoU3RyaW5nPihwYXRoOiBUKTogVCB7XG4gICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXltcXC9cXFxcXS9pLCAnQzovJykucmVwbGFjZSgvXFxcXC9nLCAnLycpIGFzIFQ7XG4gIH1cbn1cbiJdfQ==