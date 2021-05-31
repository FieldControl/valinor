(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/file_system/src/node_js_file_system", ["require", "exports", "tslib", "fs", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeJSFileSystem = exports.NodeJSReadonlyFileSystem = exports.NodeJSPathManipulation = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /// <reference types="node" />
    var fs = require("fs");
    var p = require("path");
    /**
     * A wrapper around the Node.js file-system that supports path manipulation.
     */
    var NodeJSPathManipulation = /** @class */ (function () {
        function NodeJSPathManipulation() {
        }
        NodeJSPathManipulation.prototype.pwd = function () {
            return this.normalize(process.cwd());
        };
        NodeJSPathManipulation.prototype.chdir = function (dir) {
            process.chdir(dir);
        };
        NodeJSPathManipulation.prototype.resolve = function () {
            var paths = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                paths[_i] = arguments[_i];
            }
            return this.normalize(p.resolve.apply(p, tslib_1.__spreadArray([], tslib_1.__read(paths))));
        };
        NodeJSPathManipulation.prototype.dirname = function (file) {
            return this.normalize(p.dirname(file));
        };
        NodeJSPathManipulation.prototype.join = function (basePath) {
            var paths = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                paths[_i - 1] = arguments[_i];
            }
            return this.normalize(p.join.apply(p, tslib_1.__spreadArray([basePath], tslib_1.__read(paths))));
        };
        NodeJSPathManipulation.prototype.isRoot = function (path) {
            return this.dirname(path) === this.normalize(path);
        };
        NodeJSPathManipulation.prototype.isRooted = function (path) {
            return p.isAbsolute(path);
        };
        NodeJSPathManipulation.prototype.relative = function (from, to) {
            return this.normalize(p.relative(from, to));
        };
        NodeJSPathManipulation.prototype.basename = function (filePath, extension) {
            return p.basename(filePath, extension);
        };
        NodeJSPathManipulation.prototype.extname = function (path) {
            return p.extname(path);
        };
        NodeJSPathManipulation.prototype.normalize = function (path) {
            // Convert backslashes to forward slashes
            return path.replace(/\\/g, '/');
        };
        return NodeJSPathManipulation;
    }());
    exports.NodeJSPathManipulation = NodeJSPathManipulation;
    /**
     * A wrapper around the Node.js file-system that supports readonly operations and path manipulation.
     */
    var NodeJSReadonlyFileSystem = /** @class */ (function (_super) {
        tslib_1.__extends(NodeJSReadonlyFileSystem, _super);
        function NodeJSReadonlyFileSystem() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._caseSensitive = undefined;
            return _this;
        }
        NodeJSReadonlyFileSystem.prototype.isCaseSensitive = function () {
            if (this._caseSensitive === undefined) {
                // Note the use of the real file-system is intentional:
                // `this.exists()` relies upon `isCaseSensitive()` so that would cause an infinite recursion.
                this._caseSensitive = !fs.existsSync(this.normalize(toggleCase(__filename)));
            }
            return this._caseSensitive;
        };
        NodeJSReadonlyFileSystem.prototype.exists = function (path) {
            return fs.existsSync(path);
        };
        NodeJSReadonlyFileSystem.prototype.readFile = function (path) {
            return fs.readFileSync(path, 'utf8');
        };
        NodeJSReadonlyFileSystem.prototype.readFileBuffer = function (path) {
            return fs.readFileSync(path);
        };
        NodeJSReadonlyFileSystem.prototype.readdir = function (path) {
            return fs.readdirSync(path);
        };
        NodeJSReadonlyFileSystem.prototype.lstat = function (path) {
            return fs.lstatSync(path);
        };
        NodeJSReadonlyFileSystem.prototype.stat = function (path) {
            return fs.statSync(path);
        };
        NodeJSReadonlyFileSystem.prototype.realpath = function (path) {
            return this.resolve(fs.realpathSync(path));
        };
        NodeJSReadonlyFileSystem.prototype.getDefaultLibLocation = function () {
            return this.resolve(require.resolve('typescript'), '..');
        };
        return NodeJSReadonlyFileSystem;
    }(NodeJSPathManipulation));
    exports.NodeJSReadonlyFileSystem = NodeJSReadonlyFileSystem;
    /**
     * A wrapper around the Node.js file-system (i.e. the `fs` package).
     */
    var NodeJSFileSystem = /** @class */ (function (_super) {
        tslib_1.__extends(NodeJSFileSystem, _super);
        function NodeJSFileSystem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NodeJSFileSystem.prototype.writeFile = function (path, data, exclusive) {
            if (exclusive === void 0) { exclusive = false; }
            fs.writeFileSync(path, data, exclusive ? { flag: 'wx' } : undefined);
        };
        NodeJSFileSystem.prototype.removeFile = function (path) {
            fs.unlinkSync(path);
        };
        NodeJSFileSystem.prototype.symlink = function (target, path) {
            fs.symlinkSync(target, path);
        };
        NodeJSFileSystem.prototype.copyFile = function (from, to) {
            fs.copyFileSync(from, to);
        };
        NodeJSFileSystem.prototype.moveFile = function (from, to) {
            fs.renameSync(from, to);
        };
        NodeJSFileSystem.prototype.ensureDir = function (path) {
            var parents = [];
            while (!this.isRoot(path) && !this.exists(path)) {
                parents.push(path);
                path = this.dirname(path);
            }
            while (parents.length) {
                this.safeMkdir(parents.pop());
            }
        };
        NodeJSFileSystem.prototype.removeDeep = function (path) {
            fs.rmdirSync(path, { recursive: true });
        };
        NodeJSFileSystem.prototype.safeMkdir = function (path) {
            try {
                fs.mkdirSync(path);
            }
            catch (err) {
                // Ignore the error, if the path already exists and points to a directory.
                // Re-throw otherwise.
                if (!this.exists(path) || !this.stat(path).isDirectory()) {
                    throw err;
                }
            }
        };
        return NodeJSFileSystem;
    }(NodeJSReadonlyFileSystem));
    exports.NodeJSFileSystem = NodeJSFileSystem;
    /**
     * Toggle the case of each character in a string.
     */
    function toggleCase(str) {
        return str.replace(/\w/g, function (ch) { return ch.toUpperCase() === ch ? ch.toLowerCase() : ch.toUpperCase(); });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9qc19maWxlX3N5c3RlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0vc3JjL25vZGVfanNfZmlsZV9zeXN0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDhCQUE4QjtJQUM5Qix1QkFBeUI7SUFDekIsd0JBQTBCO0lBRzFCOztPQUVHO0lBQ0g7UUFBQTtRQW9DQSxDQUFDO1FBbkNDLG9DQUFHLEdBQUg7WUFDRSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFtQixDQUFDO1FBQ3pELENBQUM7UUFDRCxzQ0FBSyxHQUFMLFVBQU0sR0FBbUI7WUFDdkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQixDQUFDO1FBQ0Qsd0NBQU8sR0FBUDtZQUFRLGVBQWtCO2lCQUFsQixVQUFrQixFQUFsQixxQkFBa0IsRUFBbEIsSUFBa0I7Z0JBQWxCLDBCQUFrQjs7WUFDeEIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLE9BQVQsQ0FBQywyQ0FBWSxLQUFLLElBQW9CLENBQUM7UUFDL0QsQ0FBQztRQUVELHdDQUFPLEdBQVAsVUFBMEIsSUFBTztZQUMvQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBTSxDQUFDO1FBQzlDLENBQUM7UUFDRCxxQ0FBSSxHQUFKLFVBQXVCLFFBQVc7WUFBRSxlQUFrQjtpQkFBbEIsVUFBa0IsRUFBbEIscUJBQWtCLEVBQWxCLElBQWtCO2dCQUFsQiw4QkFBa0I7O1lBQ3BELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFOLENBQUMseUJBQU0sUUFBUSxr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LENBQUM7YUFDM0I7WUFDRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRyxDQUFDLENBQUM7YUFDaEM7UUFDSCxDQUFDO1FBQ0QscUNBQVUsR0FBVixVQUFXLElBQW9CO1lBQzdCLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVPLG9DQUFTLEdBQWpCLFVBQWtCLElBQW9CO1lBQ3BDLElBQUk7Z0JBQ0YsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNwQjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNaLDBFQUEwRTtnQkFDMUUsc0JBQXNCO2dCQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7b0JBQ3hELE1BQU0sR0FBRyxDQUFDO2lCQUNYO2FBQ0Y7UUFDSCxDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBekNELENBQXNDLHdCQUF3QixHQXlDN0Q7SUF6Q1ksNENBQWdCO0lBMkM3Qjs7T0FFRztJQUNILFNBQVMsVUFBVSxDQUFDLEdBQVc7UUFDN0IsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUE3RCxDQUE2RCxDQUFDLENBQUM7SUFDakcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJub2RlXCIgLz5cbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHAgZnJvbSAncGF0aCc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBGaWxlU3RhdHMsIEZpbGVTeXN0ZW0sIFBhdGhNYW5pcHVsYXRpb24sIFBhdGhTZWdtZW50LCBQYXRoU3RyaW5nLCBSZWFkb25seUZpbGVTeXN0ZW19IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIEEgd3JhcHBlciBhcm91bmQgdGhlIE5vZGUuanMgZmlsZS1zeXN0ZW0gdGhhdCBzdXBwb3J0cyBwYXRoIG1hbmlwdWxhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIE5vZGVKU1BhdGhNYW5pcHVsYXRpb24gaW1wbGVtZW50cyBQYXRoTWFuaXB1bGF0aW9uIHtcbiAgcHdkKCk6IEFic29sdXRlRnNQYXRoIHtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUocHJvY2Vzcy5jd2QoKSkgYXMgQWJzb2x1dGVGc1BhdGg7XG4gIH1cbiAgY2hkaXIoZGlyOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIHByb2Nlc3MuY2hkaXIoZGlyKTtcbiAgfVxuICByZXNvbHZlKC4uLnBhdGhzOiBzdHJpbmdbXSk6IEFic29sdXRlRnNQYXRoIHtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUocC5yZXNvbHZlKC4uLnBhdGhzKSkgYXMgQWJzb2x1dGVGc1BhdGg7XG4gIH1cblxuICBkaXJuYW1lPFQgZXh0ZW5kcyBzdHJpbmc+KGZpbGU6IFQpOiBUIHtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUocC5kaXJuYW1lKGZpbGUpKSBhcyBUO1xuICB9XG4gIGpvaW48VCBleHRlbmRzIHN0cmluZz4oYmFzZVBhdGg6IFQsIC4uLnBhdGhzOiBzdHJpbmdbXSk6IFQge1xuICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZShwLmpvaW4oYmFzZVBhdGgsIC4uLnBhdGhzKSkgYXMgVDtcbiAgfVxuICBpc1Jvb3QocGF0aDogQWJzb2x1dGVGc1BhdGgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5kaXJuYW1lKHBhdGgpID09PSB0aGlzLm5vcm1hbGl6ZShwYXRoKTtcbiAgfVxuICBpc1Jvb3RlZChwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gcC5pc0Fic29sdXRlKHBhdGgpO1xuICB9XG4gIHJlbGF0aXZlPFQgZXh0ZW5kcyBQYXRoU3RyaW5nPihmcm9tOiBULCB0bzogVCk6IFBhdGhTZWdtZW50fEFic29sdXRlRnNQYXRoIHtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUocC5yZWxhdGl2ZShmcm9tLCB0bykpIGFzIFBhdGhTZWdtZW50IHwgQWJzb2x1dGVGc1BhdGg7XG4gIH1cbiAgYmFzZW5hbWUoZmlsZVBhdGg6IHN0cmluZywgZXh0ZW5zaW9uPzogc3RyaW5nKTogUGF0aFNlZ21lbnQge1xuICAgIHJldHVybiBwLmJhc2VuYW1lKGZpbGVQYXRoLCBleHRlbnNpb24pIGFzIFBhdGhTZWdtZW50O1xuICB9XG4gIGV4dG5hbWUocGF0aDogQWJzb2x1dGVGc1BhdGh8UGF0aFNlZ21lbnQpOiBzdHJpbmcge1xuICAgIHJldHVybiBwLmV4dG5hbWUocGF0aCk7XG4gIH1cbiAgbm9ybWFsaXplPFQgZXh0ZW5kcyBzdHJpbmc+KHBhdGg6IFQpOiBUIHtcbiAgICAvLyBDb252ZXJ0IGJhY2tzbGFzaGVzIHRvIGZvcndhcmQgc2xhc2hlc1xuICAgIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKSBhcyBUO1xuICB9XG59XG5cbi8qKlxuICogQSB3cmFwcGVyIGFyb3VuZCB0aGUgTm9kZS5qcyBmaWxlLXN5c3RlbSB0aGF0IHN1cHBvcnRzIHJlYWRvbmx5IG9wZXJhdGlvbnMgYW5kIHBhdGggbWFuaXB1bGF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgTm9kZUpTUmVhZG9ubHlGaWxlU3lzdGVtIGV4dGVuZHMgTm9kZUpTUGF0aE1hbmlwdWxhdGlvbiBpbXBsZW1lbnRzIFJlYWRvbmx5RmlsZVN5c3RlbSB7XG4gIHByaXZhdGUgX2Nhc2VTZW5zaXRpdmU6IGJvb2xlYW58dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBpc0Nhc2VTZW5zaXRpdmUoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX2Nhc2VTZW5zaXRpdmUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gTm90ZSB0aGUgdXNlIG9mIHRoZSByZWFsIGZpbGUtc3lzdGVtIGlzIGludGVudGlvbmFsOlxuICAgICAgLy8gYHRoaXMuZXhpc3RzKClgIHJlbGllcyB1cG9uIGBpc0Nhc2VTZW5zaXRpdmUoKWAgc28gdGhhdCB3b3VsZCBjYXVzZSBhbiBpbmZpbml0ZSByZWN1cnNpb24uXG4gICAgICB0aGlzLl9jYXNlU2Vuc2l0aXZlID0gIWZzLmV4aXN0c1N5bmModGhpcy5ub3JtYWxpemUodG9nZ2xlQ2FzZShfX2ZpbGVuYW1lKSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY2FzZVNlbnNpdGl2ZTtcbiAgfVxuICBleGlzdHMocGF0aDogQWJzb2x1dGVGc1BhdGgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZnMuZXhpc3RzU3luYyhwYXRoKTtcbiAgfVxuICByZWFkRmlsZShwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhwYXRoLCAndXRmOCcpO1xuICB9XG4gIHJlYWRGaWxlQnVmZmVyKHBhdGg6IEFic29sdXRlRnNQYXRoKTogVWludDhBcnJheSB7XG4gICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhwYXRoKTtcbiAgfVxuICByZWFkZGlyKHBhdGg6IEFic29sdXRlRnNQYXRoKTogUGF0aFNlZ21lbnRbXSB7XG4gICAgcmV0dXJuIGZzLnJlYWRkaXJTeW5jKHBhdGgpIGFzIFBhdGhTZWdtZW50W107XG4gIH1cbiAgbHN0YXQocGF0aDogQWJzb2x1dGVGc1BhdGgpOiBGaWxlU3RhdHMge1xuICAgIHJldHVybiBmcy5sc3RhdFN5bmMocGF0aCk7XG4gIH1cbiAgc3RhdChwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEZpbGVTdGF0cyB7XG4gICAgcmV0dXJuIGZzLnN0YXRTeW5jKHBhdGgpO1xuICB9XG4gIHJlYWxwYXRoKHBhdGg6IEFic29sdXRlRnNQYXRoKTogQWJzb2x1dGVGc1BhdGgge1xuICAgIHJldHVybiB0aGlzLnJlc29sdmUoZnMucmVhbHBhdGhTeW5jKHBhdGgpKTtcbiAgfVxuICBnZXREZWZhdWx0TGliTG9jYXRpb24oKTogQWJzb2x1dGVGc1BhdGgge1xuICAgIHJldHVybiB0aGlzLnJlc29sdmUocmVxdWlyZS5yZXNvbHZlKCd0eXBlc2NyaXB0JyksICcuLicpO1xuICB9XG59XG5cbi8qKlxuICogQSB3cmFwcGVyIGFyb3VuZCB0aGUgTm9kZS5qcyBmaWxlLXN5c3RlbSAoaS5lLiB0aGUgYGZzYCBwYWNrYWdlKS5cbiAqL1xuZXhwb3J0IGNsYXNzIE5vZGVKU0ZpbGVTeXN0ZW0gZXh0ZW5kcyBOb2RlSlNSZWFkb25seUZpbGVTeXN0ZW0gaW1wbGVtZW50cyBGaWxlU3lzdGVtIHtcbiAgd3JpdGVGaWxlKHBhdGg6IEFic29sdXRlRnNQYXRoLCBkYXRhOiBzdHJpbmd8VWludDhBcnJheSwgZXhjbHVzaXZlOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGgsIGRhdGEsIGV4Y2x1c2l2ZSA/IHtmbGFnOiAnd3gnfSA6IHVuZGVmaW5lZCk7XG4gIH1cbiAgcmVtb3ZlRmlsZShwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIGZzLnVubGlua1N5bmMocGF0aCk7XG4gIH1cbiAgc3ltbGluayh0YXJnZXQ6IEFic29sdXRlRnNQYXRoLCBwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIGZzLnN5bWxpbmtTeW5jKHRhcmdldCwgcGF0aCk7XG4gIH1cbiAgY29weUZpbGUoZnJvbTogQWJzb2x1dGVGc1BhdGgsIHRvOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIGZzLmNvcHlGaWxlU3luYyhmcm9tLCB0byk7XG4gIH1cbiAgbW92ZUZpbGUoZnJvbTogQWJzb2x1dGVGc1BhdGgsIHRvOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIGZzLnJlbmFtZVN5bmMoZnJvbSwgdG8pO1xuICB9XG4gIGVuc3VyZURpcihwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIGNvbnN0IHBhcmVudHM6IEFic29sdXRlRnNQYXRoW10gPSBbXTtcbiAgICB3aGlsZSAoIXRoaXMuaXNSb290KHBhdGgpICYmICF0aGlzLmV4aXN0cyhwYXRoKSkge1xuICAgICAgcGFyZW50cy5wdXNoKHBhdGgpO1xuICAgICAgcGF0aCA9IHRoaXMuZGlybmFtZShwYXRoKTtcbiAgICB9XG4gICAgd2hpbGUgKHBhcmVudHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnNhZmVNa2RpcihwYXJlbnRzLnBvcCgpISk7XG4gICAgfVxuICB9XG4gIHJlbW92ZURlZXAocGF0aDogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHtcbiAgICBmcy5ybWRpclN5bmMocGF0aCwge3JlY3Vyc2l2ZTogdHJ1ZX0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzYWZlTWtkaXIocGF0aDogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgZnMubWtkaXJTeW5jKHBhdGgpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gSWdub3JlIHRoZSBlcnJvciwgaWYgdGhlIHBhdGggYWxyZWFkeSBleGlzdHMgYW5kIHBvaW50cyB0byBhIGRpcmVjdG9yeS5cbiAgICAgIC8vIFJlLXRocm93IG90aGVyd2lzZS5cbiAgICAgIGlmICghdGhpcy5leGlzdHMocGF0aCkgfHwgIXRoaXMuc3RhdChwYXRoKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUb2dnbGUgdGhlIGNhc2Ugb2YgZWFjaCBjaGFyYWN0ZXIgaW4gYSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIHRvZ2dsZUNhc2Uoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xcdy9nLCBjaCA9PiBjaC50b1VwcGVyQ2FzZSgpID09PSBjaCA/IGNoLnRvTG93ZXJDYXNlKCkgOiBjaC50b1VwcGVyQ2FzZSgpKTtcbn1cbiJdfQ==