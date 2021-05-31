(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_native", ["require", "exports", "tslib", "os", "@angular/compiler-cli/src/ngtsc/file_system/src/node_js_file_system", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MockFileSystemNative = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /// <reference types="node" />
    var os = require("os");
    var node_js_file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/node_js_file_system");
    var mock_file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system");
    var isWindows = os.platform() === 'win32';
    var MockFileSystemNative = /** @class */ (function (_super) {
        tslib_1.__extends(MockFileSystemNative, _super);
        function MockFileSystemNative(cwd) {
            if (cwd === void 0) { cwd = '/'; }
            return _super.call(this, undefined, cwd) || this;
        }
        // Delegate to the real NodeJSFileSystem for these path related methods
        MockFileSystemNative.prototype.resolve = function () {
            var _a;
            var paths = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                paths[_i] = arguments[_i];
            }
            return (_a = node_js_file_system_1.NodeJSFileSystem.prototype.resolve).call.apply(_a, tslib_1.__spreadArray([this, this.pwd()], tslib_1.__read(paths)));
        };
        MockFileSystemNative.prototype.dirname = function (file) {
            return node_js_file_system_1.NodeJSFileSystem.prototype.dirname.call(this, file);
        };
        MockFileSystemNative.prototype.join = function (basePath) {
            var _a;
            var paths = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                paths[_i - 1] = arguments[_i];
            }
            return (_a = node_js_file_system_1.NodeJSFileSystem.prototype.join).call.apply(_a, tslib_1.__spreadArray([this, basePath], tslib_1.__read(paths)));
        };
        MockFileSystemNative.prototype.relative = function (from, to) {
            return node_js_file_system_1.NodeJSFileSystem.prototype.relative.call(this, from, to);
        };
        MockFileSystemNative.prototype.basename = function (filePath, extension) {
            return node_js_file_system_1.NodeJSFileSystem.prototype.basename.call(this, filePath, extension);
        };
        MockFileSystemNative.prototype.isCaseSensitive = function () {
            return node_js_file_system_1.NodeJSFileSystem.prototype.isCaseSensitive.call(this);
        };
        MockFileSystemNative.prototype.isRooted = function (path) {
            return node_js_file_system_1.NodeJSFileSystem.prototype.isRooted.call(this, path);
        };
        MockFileSystemNative.prototype.isRoot = function (path) {
            return node_js_file_system_1.NodeJSFileSystem.prototype.isRoot.call(this, path);
        };
        MockFileSystemNative.prototype.normalize = function (path) {
            // When running in Windows, absolute paths are normalized to always include a drive letter. This
            // ensures that rooted posix paths used in tests will be normalized to real Windows paths, i.e.
            // including a drive letter. Note that the same normalization is done in emulated Windows mode
            // (see `MockFileSystemWindows`) so that the behavior is identical between native Windows and
            // emulated Windows mode.
            if (isWindows) {
                path = path.replace(/^[\/\\]/i, 'C:/');
            }
            return node_js_file_system_1.NodeJSFileSystem.prototype.normalize.call(this, path);
        };
        MockFileSystemNative.prototype.splitPath = function (path) {
            return path.split(/[\\\/]/);
        };
        return MockFileSystemNative;
    }(mock_file_system_1.MockFileSystem));
    exports.MockFileSystemNative = MockFileSystemNative;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19maWxlX3N5c3RlbV9uYXRpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2ZpbGVfc3lzdGVtL3Rlc3Rpbmcvc3JjL21vY2tfZmlsZV9zeXN0ZW1fbmF0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw4QkFBOEI7SUFDOUIsdUJBQXlCO0lBQ3pCLDJHQUErRDtJQUcvRCw2R0FBa0Q7SUFFbEQsSUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sQ0FBQztJQUU1QztRQUEwQyxnREFBYztRQUN0RCw4QkFBWSxHQUEyQztZQUEzQyxvQkFBQSxFQUFBLE1BQXNCLEdBQXFCO21CQUNyRCxrQkFBTSxTQUFTLEVBQUUsR0FBRyxDQUFDO1FBQ3ZCLENBQUM7UUFFRCx1RUFBdUU7UUFFdkUsc0NBQU8sR0FBUDs7WUFBUSxlQUFrQjtpQkFBbEIsVUFBa0IsRUFBbEIscUJBQWtCLEVBQWxCLElBQWtCO2dCQUFsQiwwQkFBa0I7O1lBQ3hCLE9BQU8sQ0FBQSxLQUFBLHNDQUFnQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUEsQ0FBQyxJQUFJLGtDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLGtCQUFLLEtBQUssSUFBRTtRQUM3RSxDQUFDO1FBQ0Qsc0NBQU8sR0FBUCxVQUEwQixJQUFPO1lBQy9CLE9BQU8sc0NBQWdCLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBTSxDQUFDO1FBQ2xFLENBQUM7UUFDRCxtQ0FBSSxHQUFKLFVBQXVCLFFBQVc7O1lBQUUsZUFBa0I7aUJBQWxCLFVBQWtCLEVBQWxCLHFCQUFrQixFQUFsQixJQUFrQjtnQkFBbEIsOEJBQWtCOztZQUNwRCxPQUFPLENBQUEsS0FBQSxzQ0FBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFBLENBQUMsSUFBSSxrQ0FBQyxJQUFJLEVBQUUsUUFBUSxrQkFBSyxLQUFLLEdBQU0sQ0FBQztRQUM3RSxDQUFDO1FBQ0QsdUNBQVEsR0FBUixVQUErQixJQUFPLEVBQUUsRUFBSztZQUMzQyxPQUFPLHNDQUFnQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbEUsQ0FBQztRQUVELHVDQUFRLEdBQVIsVUFBUyxRQUFnQixFQUFFLFNBQWtCO1lBQzNDLE9BQU8sc0NBQWdCLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM3RSxDQUFDO1FBRUQsOENBQWUsR0FBZjtZQUNFLE9BQU8sc0NBQWdCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVELHVDQUFRLEdBQVIsVUFBUyxJQUFZO1lBQ25CLE9BQU8sc0NBQWdCLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzlELENBQUM7UUFFRCxxQ0FBTSxHQUFOLFVBQU8sSUFBb0I7WUFDekIsT0FBTyxzQ0FBZ0IsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVELHdDQUFTLEdBQVQsVUFBZ0MsSUFBTztZQUNyQyxnR0FBZ0c7WUFDaEcsK0ZBQStGO1lBQy9GLDhGQUE4RjtZQUM5Riw2RkFBNkY7WUFDN0YseUJBQXlCO1lBQ3pCLElBQUksU0FBUyxFQUFFO2dCQUNiLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQU0sQ0FBQzthQUM3QztZQUVELE9BQU8sc0NBQWdCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBTSxDQUFDO1FBQ3BFLENBQUM7UUFFUyx3Q0FBUyxHQUFuQixVQUF1QixJQUFZO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBQ0gsMkJBQUM7SUFBRCxDQUFDLEFBcERELENBQTBDLGlDQUFjLEdBb0R2RDtJQXBEWSxvREFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwibm9kZVwiIC8+XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5pbXBvcnQge05vZGVKU0ZpbGVTeXN0ZW19IGZyb20gJy4uLy4uL3NyYy9ub2RlX2pzX2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIFBhdGhTZWdtZW50LCBQYXRoU3RyaW5nfSBmcm9tICcuLi8uLi9zcmMvdHlwZXMnO1xuXG5pbXBvcnQge01vY2tGaWxlU3lzdGVtfSBmcm9tICcuL21vY2tfZmlsZV9zeXN0ZW0nO1xuXG5jb25zdCBpc1dpbmRvd3MgPSBvcy5wbGF0Zm9ybSgpID09PSAnd2luMzInO1xuXG5leHBvcnQgY2xhc3MgTW9ja0ZpbGVTeXN0ZW1OYXRpdmUgZXh0ZW5kcyBNb2NrRmlsZVN5c3RlbSB7XG4gIGNvbnN0cnVjdG9yKGN3ZDogQWJzb2x1dGVGc1BhdGggPSAnLycgYXMgQWJzb2x1dGVGc1BhdGgpIHtcbiAgICBzdXBlcih1bmRlZmluZWQsIGN3ZCk7XG4gIH1cblxuICAvLyBEZWxlZ2F0ZSB0byB0aGUgcmVhbCBOb2RlSlNGaWxlU3lzdGVtIGZvciB0aGVzZSBwYXRoIHJlbGF0ZWQgbWV0aG9kc1xuXG4gIHJlc29sdmUoLi4ucGF0aHM6IHN0cmluZ1tdKTogQWJzb2x1dGVGc1BhdGgge1xuICAgIHJldHVybiBOb2RlSlNGaWxlU3lzdGVtLnByb3RvdHlwZS5yZXNvbHZlLmNhbGwodGhpcywgdGhpcy5wd2QoKSwgLi4ucGF0aHMpO1xuICB9XG4gIGRpcm5hbWU8VCBleHRlbmRzIHN0cmluZz4oZmlsZTogVCk6IFQge1xuICAgIHJldHVybiBOb2RlSlNGaWxlU3lzdGVtLnByb3RvdHlwZS5kaXJuYW1lLmNhbGwodGhpcywgZmlsZSkgYXMgVDtcbiAgfVxuICBqb2luPFQgZXh0ZW5kcyBzdHJpbmc+KGJhc2VQYXRoOiBULCAuLi5wYXRoczogc3RyaW5nW10pOiBUIHtcbiAgICByZXR1cm4gTm9kZUpTRmlsZVN5c3RlbS5wcm90b3R5cGUuam9pbi5jYWxsKHRoaXMsIGJhc2VQYXRoLCAuLi5wYXRocykgYXMgVDtcbiAgfVxuICByZWxhdGl2ZTxUIGV4dGVuZHMgUGF0aFN0cmluZz4oZnJvbTogVCwgdG86IFQpOiBQYXRoU2VnbWVudHxBYnNvbHV0ZUZzUGF0aCB7XG4gICAgcmV0dXJuIE5vZGVKU0ZpbGVTeXN0ZW0ucHJvdG90eXBlLnJlbGF0aXZlLmNhbGwodGhpcywgZnJvbSwgdG8pO1xuICB9XG5cbiAgYmFzZW5hbWUoZmlsZVBhdGg6IHN0cmluZywgZXh0ZW5zaW9uPzogc3RyaW5nKTogUGF0aFNlZ21lbnQge1xuICAgIHJldHVybiBOb2RlSlNGaWxlU3lzdGVtLnByb3RvdHlwZS5iYXNlbmFtZS5jYWxsKHRoaXMsIGZpbGVQYXRoLCBleHRlbnNpb24pO1xuICB9XG5cbiAgaXNDYXNlU2Vuc2l0aXZlKCkge1xuICAgIHJldHVybiBOb2RlSlNGaWxlU3lzdGVtLnByb3RvdHlwZS5pc0Nhc2VTZW5zaXRpdmUuY2FsbCh0aGlzKTtcbiAgfVxuXG4gIGlzUm9vdGVkKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBOb2RlSlNGaWxlU3lzdGVtLnByb3RvdHlwZS5pc1Jvb3RlZC5jYWxsKHRoaXMsIHBhdGgpO1xuICB9XG5cbiAgaXNSb290KHBhdGg6IEFic29sdXRlRnNQYXRoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE5vZGVKU0ZpbGVTeXN0ZW0ucHJvdG90eXBlLmlzUm9vdC5jYWxsKHRoaXMsIHBhdGgpO1xuICB9XG5cbiAgbm9ybWFsaXplPFQgZXh0ZW5kcyBQYXRoU3RyaW5nPihwYXRoOiBUKTogVCB7XG4gICAgLy8gV2hlbiBydW5uaW5nIGluIFdpbmRvd3MsIGFic29sdXRlIHBhdGhzIGFyZSBub3JtYWxpemVkIHRvIGFsd2F5cyBpbmNsdWRlIGEgZHJpdmUgbGV0dGVyLiBUaGlzXG4gICAgLy8gZW5zdXJlcyB0aGF0IHJvb3RlZCBwb3NpeCBwYXRocyB1c2VkIGluIHRlc3RzIHdpbGwgYmUgbm9ybWFsaXplZCB0byByZWFsIFdpbmRvd3MgcGF0aHMsIGkuZS5cbiAgICAvLyBpbmNsdWRpbmcgYSBkcml2ZSBsZXR0ZXIuIE5vdGUgdGhhdCB0aGUgc2FtZSBub3JtYWxpemF0aW9uIGlzIGRvbmUgaW4gZW11bGF0ZWQgV2luZG93cyBtb2RlXG4gICAgLy8gKHNlZSBgTW9ja0ZpbGVTeXN0ZW1XaW5kb3dzYCkgc28gdGhhdCB0aGUgYmVoYXZpb3IgaXMgaWRlbnRpY2FsIGJldHdlZW4gbmF0aXZlIFdpbmRvd3MgYW5kXG4gICAgLy8gZW11bGF0ZWQgV2luZG93cyBtb2RlLlxuICAgIGlmIChpc1dpbmRvd3MpIHtcbiAgICAgIHBhdGggPSBwYXRoLnJlcGxhY2UoL15bXFwvXFxcXF0vaSwgJ0M6LycpIGFzIFQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIE5vZGVKU0ZpbGVTeXN0ZW0ucHJvdG90eXBlLm5vcm1hbGl6ZS5jYWxsKHRoaXMsIHBhdGgpIGFzIFQ7XG4gIH1cblxuICBwcm90ZWN0ZWQgc3BsaXRQYXRoPFQ+KHBhdGg6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gcGF0aC5zcGxpdCgvW1xcXFxcXC9dLyk7XG4gIH1cbn1cbiJdfQ==