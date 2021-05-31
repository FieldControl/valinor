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
        define("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system/src/helpers"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isFolder = exports.isSymLink = exports.isFile = exports.SymLink = exports.MockFileSystem = void 0;
    var tslib_1 = require("tslib");
    var helpers_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/helpers");
    /**
     * An in-memory file system that can be used in unit tests.
     */
    var MockFileSystem = /** @class */ (function () {
        function MockFileSystem(_isCaseSensitive, cwd) {
            if (_isCaseSensitive === void 0) { _isCaseSensitive = false; }
            if (cwd === void 0) { cwd = '/'; }
            this._isCaseSensitive = _isCaseSensitive;
            this._fileTree = {};
            this._cwd = this.normalize(cwd);
        }
        MockFileSystem.prototype.isCaseSensitive = function () {
            return this._isCaseSensitive;
        };
        MockFileSystem.prototype.exists = function (path) {
            return this.findFromPath(path).entity !== null;
        };
        MockFileSystem.prototype.readFile = function (path) {
            var entity = this.findFromPath(path).entity;
            if (isFile(entity)) {
                return entity.toString();
            }
            else {
                throw new MockFileSystemError('ENOENT', path, "File \"" + path + "\" does not exist.");
            }
        };
        MockFileSystem.prototype.readFileBuffer = function (path) {
            var entity = this.findFromPath(path).entity;
            if (isFile(entity)) {
                return entity instanceof Uint8Array ? entity : new Buffer(entity);
            }
            else {
                throw new MockFileSystemError('ENOENT', path, "File \"" + path + "\" does not exist.");
            }
        };
        MockFileSystem.prototype.writeFile = function (path, data, exclusive) {
            if (exclusive === void 0) { exclusive = false; }
            var _a = tslib_1.__read(this.splitIntoFolderAndFile(path), 2), folderPath = _a[0], basename = _a[1];
            var entity = this.findFromPath(folderPath).entity;
            if (entity === null || !isFolder(entity)) {
                throw new MockFileSystemError('ENOENT', path, "Unable to write file \"" + path + "\". The containing folder does not exist.");
            }
            if (exclusive && entity[basename] !== undefined) {
                throw new MockFileSystemError('EEXIST', path, "Unable to exclusively write file \"" + path + "\". The file already exists.");
            }
            entity[basename] = data;
        };
        MockFileSystem.prototype.removeFile = function (path) {
            var _a = tslib_1.__read(this.splitIntoFolderAndFile(path), 2), folderPath = _a[0], basename = _a[1];
            var entity = this.findFromPath(folderPath).entity;
            if (entity === null || !isFolder(entity)) {
                throw new MockFileSystemError('ENOENT', path, "Unable to remove file \"" + path + "\". The containing folder does not exist.");
            }
            if (isFolder(entity[basename])) {
                throw new MockFileSystemError('EISDIR', path, "Unable to remove file \"" + path + "\". The path to remove is a folder.");
            }
            delete entity[basename];
        };
        MockFileSystem.prototype.symlink = function (target, path) {
            var _a = tslib_1.__read(this.splitIntoFolderAndFile(path), 2), folderPath = _a[0], basename = _a[1];
            var entity = this.findFromPath(folderPath).entity;
            if (entity === null || !isFolder(entity)) {
                throw new MockFileSystemError('ENOENT', path, "Unable to create symlink at \"" + path + "\". The containing folder does not exist.");
            }
            entity[basename] = new SymLink(target);
        };
        MockFileSystem.prototype.readdir = function (path) {
            var entity = this.findFromPath(path).entity;
            if (entity === null) {
                throw new MockFileSystemError('ENOENT', path, "Unable to read directory \"" + path + "\". It does not exist.");
            }
            if (isFile(entity)) {
                throw new MockFileSystemError('ENOTDIR', path, "Unable to read directory \"" + path + "\". It is a file.");
            }
            return Object.keys(entity);
        };
        MockFileSystem.prototype.lstat = function (path) {
            var entity = this.findFromPath(path).entity;
            if (entity === null) {
                throw new MockFileSystemError('ENOENT', path, "File \"" + path + "\" does not exist.");
            }
            return new MockFileStats(entity);
        };
        MockFileSystem.prototype.stat = function (path) {
            var entity = this.findFromPath(path, { followSymLinks: true }).entity;
            if (entity === null) {
                throw new MockFileSystemError('ENOENT', path, "File \"" + path + "\" does not exist.");
            }
            return new MockFileStats(entity);
        };
        MockFileSystem.prototype.copyFile = function (from, to) {
            this.writeFile(to, this.readFile(from));
        };
        MockFileSystem.prototype.moveFile = function (from, to) {
            this.writeFile(to, this.readFile(from));
            var result = this.findFromPath(helpers_1.dirname(from));
            var folder = result.entity;
            var name = helpers_1.basename(from);
            delete folder[name];
        };
        MockFileSystem.prototype.ensureDir = function (path) {
            var e_1, _a;
            var _this = this;
            var segments = this.splitPath(path).map(function (segment) { return _this.getCanonicalPath(segment); });
            // Convert the root folder to a canonical empty string `''` (on Windows it would be `'C:'`).
            segments[0] = '';
            if (segments.length > 1 && segments[segments.length - 1] === '') {
                // Remove a trailing slash (unless the path was only `/`)
                segments.pop();
            }
            var current = this._fileTree;
            try {
                for (var segments_1 = tslib_1.__values(segments), segments_1_1 = segments_1.next(); !segments_1_1.done; segments_1_1 = segments_1.next()) {
                    var segment = segments_1_1.value;
                    if (isFile(current[segment])) {
                        throw new Error("Folder already exists as a file.");
                    }
                    if (!current[segment]) {
                        current[segment] = {};
                    }
                    current = current[segment];
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (segments_1_1 && !segments_1_1.done && (_a = segments_1.return)) _a.call(segments_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return current;
        };
        MockFileSystem.prototype.removeDeep = function (path) {
            var _a = tslib_1.__read(this.splitIntoFolderAndFile(path), 2), folderPath = _a[0], basename = _a[1];
            var entity = this.findFromPath(folderPath).entity;
            if (entity === null || !isFolder(entity)) {
                throw new MockFileSystemError('ENOENT', path, "Unable to remove folder \"" + path + "\". The containing folder does not exist.");
            }
            delete entity[basename];
        };
        MockFileSystem.prototype.isRoot = function (path) {
            return this.dirname(path) === path;
        };
        MockFileSystem.prototype.extname = function (path) {
            var match = /.+(\.[^.]*)$/.exec(path);
            return match !== null ? match[1] : '';
        };
        MockFileSystem.prototype.realpath = function (filePath) {
            var result = this.findFromPath(filePath, { followSymLinks: true });
            if (result.entity === null) {
                throw new MockFileSystemError('ENOENT', filePath, "Unable to find the real path of \"" + filePath + "\". It does not exist.");
            }
            else {
                return result.path;
            }
        };
        MockFileSystem.prototype.pwd = function () {
            return this._cwd;
        };
        MockFileSystem.prototype.chdir = function (path) {
            this._cwd = this.normalize(path);
        };
        MockFileSystem.prototype.getDefaultLibLocation = function () {
            // Mimic the node module resolution algorithm and start in the current directory, then look
            // progressively further up the tree until reaching the FS root.
            // E.g. if the current directory is /foo/bar, look in /foo/bar/node_modules, then
            // /foo/node_modules, then /node_modules.
            var path = 'node_modules/typescript/lib';
            var resolvedPath = this.resolve(path);
            // Construct a path for the top-level node_modules to identify the stopping point.
            var topLevelNodeModules = this.resolve('/' + path);
            while (resolvedPath !== topLevelNodeModules) {
                if (this.exists(resolvedPath)) {
                    return resolvedPath;
                }
                // Not here, look one level higher.
                path = '../' + path;
                resolvedPath = this.resolve(path);
            }
            // The loop exits before checking the existence of /node_modules/typescript at the top level.
            // This is intentional - if no /node_modules/typescript exists anywhere in the tree, there's
            // nothing this function can do about it, and TS may error later if it looks for a lib.d.ts file
            // within this directory. It might be okay, though, if TS never checks for one.
            return topLevelNodeModules;
        };
        MockFileSystem.prototype.dump = function () {
            var entity = this.findFromPath(this.resolve('/')).entity;
            if (entity === null || !isFolder(entity)) {
                return {};
            }
            return this.cloneFolder(entity);
        };
        MockFileSystem.prototype.init = function (folder) {
            this.mount(this.resolve('/'), folder);
        };
        MockFileSystem.prototype.mount = function (path, folder) {
            if (this.exists(path)) {
                throw new Error("Unable to mount in '" + path + "' as it already exists.");
            }
            var mountFolder = this.ensureDir(path);
            this.copyInto(folder, mountFolder);
        };
        MockFileSystem.prototype.cloneFolder = function (folder) {
            var clone = {};
            this.copyInto(folder, clone);
            return clone;
        };
        MockFileSystem.prototype.copyInto = function (from, to) {
            for (var path in from) {
                var item = from[path];
                var canonicalPath = this.getCanonicalPath(path);
                if (isSymLink(item)) {
                    to[canonicalPath] = new SymLink(this.getCanonicalPath(item.path));
                }
                else if (isFolder(item)) {
                    to[canonicalPath] = this.cloneFolder(item);
                }
                else {
                    to[canonicalPath] = from[path];
                }
            }
        };
        MockFileSystem.prototype.findFromPath = function (path, options) {
            var followSymLinks = !!options && options.followSymLinks;
            var segments = this.splitPath(path);
            if (segments.length > 1 && segments[segments.length - 1] === '') {
                // Remove a trailing slash (unless the path was only `/`)
                segments.pop();
            }
            // Convert the root folder to a canonical empty string `""` (on Windows it would be `C:`).
            segments[0] = '';
            var current = this._fileTree;
            while (segments.length) {
                current = current[this.getCanonicalPath(segments.shift())];
                if (current === undefined) {
                    return { path: path, entity: null };
                }
                if (segments.length > 0 && (!isFolder(current))) {
                    current = null;
                    break;
                }
                if (isFile(current)) {
                    break;
                }
                if (isSymLink(current)) {
                    if (followSymLinks) {
                        return this.findFromPath(helpers_1.resolve.apply(void 0, tslib_1.__spreadArray([current.path], tslib_1.__read(segments))), { followSymLinks: followSymLinks });
                    }
                    else {
                        break;
                    }
                }
            }
            return { path: path, entity: current };
        };
        MockFileSystem.prototype.splitIntoFolderAndFile = function (path) {
            var segments = this.splitPath(this.getCanonicalPath(path));
            var file = segments.pop();
            return [path.substring(0, path.length - file.length - 1), file];
        };
        MockFileSystem.prototype.getCanonicalPath = function (p) {
            return this.isCaseSensitive() ? p : p.toLowerCase();
        };
        return MockFileSystem;
    }());
    exports.MockFileSystem = MockFileSystem;
    var SymLink = /** @class */ (function () {
        function SymLink(path) {
            this.path = path;
        }
        return SymLink;
    }());
    exports.SymLink = SymLink;
    var MockFileStats = /** @class */ (function () {
        function MockFileStats(entity) {
            this.entity = entity;
        }
        MockFileStats.prototype.isFile = function () {
            return isFile(this.entity);
        };
        MockFileStats.prototype.isDirectory = function () {
            return isFolder(this.entity);
        };
        MockFileStats.prototype.isSymbolicLink = function () {
            return isSymLink(this.entity);
        };
        return MockFileStats;
    }());
    var MockFileSystemError = /** @class */ (function (_super) {
        tslib_1.__extends(MockFileSystemError, _super);
        function MockFileSystemError(code, path, message) {
            var _this = _super.call(this, message) || this;
            _this.code = code;
            _this.path = path;
            return _this;
        }
        return MockFileSystemError;
    }(Error));
    function isFile(item) {
        return Buffer.isBuffer(item) || typeof item === 'string';
    }
    exports.isFile = isFile;
    function isSymLink(item) {
        return item instanceof SymLink;
    }
    exports.isSymLink = isSymLink;
    function isFolder(item) {
        return item !== null && !isFile(item) && !isSymLink(item);
    }
    exports.isFolder = isFolder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19maWxlX3N5c3RlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0vdGVzdGluZy9zcmMvbW9ja19maWxlX3N5c3RlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsbUZBQTZEO0lBRzdEOztPQUVHO0lBQ0g7UUFLRSx3QkFBb0IsZ0JBQXdCLEVBQUUsR0FBMkM7WUFBckUsaUNBQUEsRUFBQSx3QkFBd0I7WUFBRSxvQkFBQSxFQUFBLE1BQXNCLEdBQXFCO1lBQXJFLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBUTtZQUpwQyxjQUFTLEdBQVcsRUFBRSxDQUFDO1lBSzdCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRUQsd0NBQWUsR0FBZjtZQUNFLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQy9CLENBQUM7UUFFRCwrQkFBTSxHQUFOLFVBQU8sSUFBb0I7WUFDekIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUM7UUFDakQsQ0FBQztRQUVELGlDQUFRLEdBQVIsVUFBUyxJQUFvQjtZQUNwQixJQUFBLE1BQU0sR0FBSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUEzQixDQUE0QjtZQUN6QyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDbEIsT0FBTyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDMUI7aUJBQU07Z0JBQ0wsTUFBTSxJQUFJLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsWUFBUyxJQUFJLHVCQUFtQixDQUFDLENBQUM7YUFDakY7UUFDSCxDQUFDO1FB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QUFLLEdBSXRDO0lBRUQsU0FBZ0IsTUFBTSxDQUFDLElBQWlCO1FBQ3RDLE9BQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLENBQUM7SUFDM0QsQ0FBQztJQUZELHdCQUVDO0lBRUQsU0FBZ0IsU0FBUyxDQUFDLElBQWlCO1FBQ3pDLE9BQU8sSUFBSSxZQUFZLE9BQU8sQ0FBQztJQUNqQyxDQUFDO0lBRkQsOEJBRUM7SUFFRCxTQUFnQixRQUFRLENBQUMsSUFBaUI7UUFDeEMsT0FBTyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFGRCw0QkFFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Jhc2VuYW1lLCBkaXJuYW1lLCByZXNvbHZlfSBmcm9tICcuLi8uLi9zcmMvaGVscGVycyc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBGaWxlU3RhdHMsIEZpbGVTeXN0ZW0sIFBhdGhTZWdtZW50LCBQYXRoU3RyaW5nfSBmcm9tICcuLi8uLi9zcmMvdHlwZXMnO1xuXG4vKipcbiAqIEFuIGluLW1lbW9yeSBmaWxlIHN5c3RlbSB0aGF0IGNhbiBiZSB1c2VkIGluIHVuaXQgdGVzdHMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNb2NrRmlsZVN5c3RlbSBpbXBsZW1lbnRzIEZpbGVTeXN0ZW0ge1xuICBwcml2YXRlIF9maWxlVHJlZTogRm9sZGVyID0ge307XG4gIHByaXZhdGUgX2N3ZDogQWJzb2x1dGVGc1BhdGg7XG5cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pc0Nhc2VTZW5zaXRpdmUgPSBmYWxzZSwgY3dkOiBBYnNvbHV0ZUZzUGF0aCA9ICcvJyBhcyBBYnNvbHV0ZUZzUGF0aCkge1xuICAgIHRoaXMuX2N3ZCA9IHRoaXMubm9ybWFsaXplKGN3ZCk7XG4gIH1cblxuICBpc0Nhc2VTZW5zaXRpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQ2FzZVNlbnNpdGl2ZTtcbiAgfVxuXG4gIGV4aXN0cyhwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRGcm9tUGF0aChwYXRoKS5lbnRpdHkgIT09IG51bGw7XG4gIH1cblxuICByZWFkRmlsZShwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHN0cmluZyB7XG4gICAgY29uc3Qge2VudGl0eX0gPSB0aGlzLmZpbmRGcm9tUGF0aChwYXRoKTtcbiAgICBpZiAoaXNGaWxlKGVudGl0eSkpIHtcbiAgICAgIHJldHVybiBlbnRpdHkudG9TdHJpbmcoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IE1vY2tGaWxlU3lzdGVtRXJyb3IoJ0VOT0VOVCcsIHBhdGgsIGBGaWxlIFwiJHtwYXRofVwiIGRvZXMgbm90IGV4aXN0LmApO1xuICAgIH1cbiAgfVxuXG4gIHJlYWRGaWxlQnVmZmVyKHBhdGg6IEFic29sdXRlRnNQYXRoKTogVWludDhBcnJheSB7XG4gICAgY29uc3Qge2VudGl0eX0gPSB0aGlzLmZpbmRGcm9tUGF0aChwYXRoKTtcbiAgICBpZiAoaXNGaWxlKGVudGl0eSkpIHtcbiAgICAgIHJldHVybiBlbnRpdHkgaW5zdGFuY2VvZiBVaW50OEFycmF5ID8gZW50aXR5IDogbmV3IEJ1ZmZlcihlbnRpdHkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgTW9ja0ZpbGVTeXN0ZW1FcnJvcignRU5PRU5UJywgcGF0aCwgYEZpbGUgXCIke3BhdGh9XCIgZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgfVxuICB9XG5cbiAgd3JpdGVGaWxlKHBhdGg6IEFic29sdXRlRnNQYXRoLCBkYXRhOiBzdHJpbmd8VWludDhBcnJheSwgZXhjbHVzaXZlOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBbZm9sZGVyUGF0aCwgYmFzZW5hbWVdID0gdGhpcy5zcGxpdEludG9Gb2xkZXJBbmRGaWxlKHBhdGgpO1xuICAgIGNvbnN0IHtlbnRpdHl9ID0gdGhpcy5maW5kRnJvbVBhdGgoZm9sZGVyUGF0aCk7XG4gICAgaWYgKGVudGl0eSA9PT0gbnVsbCB8fCAhaXNGb2xkZXIoZW50aXR5KSkge1xuICAgICAgdGhyb3cgbmV3IE1vY2tGaWxlU3lzdGVtRXJyb3IoXG4gICAgICAgICAgJ0VOT0VOVCcsIHBhdGgsIGBVbmFibGUgdG8gd3JpdGUgZmlsZSBcIiR7cGF0aH1cIi4gVGhlIGNvbnRhaW5pbmcgZm9sZGVyIGRvZXMgbm90IGV4aXN0LmApO1xuICAgIH1cbiAgICBpZiAoZXhjbHVzaXZlICYmIGVudGl0eVtiYXNlbmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IE1vY2tGaWxlU3lzdGVtRXJyb3IoXG4gICAgICAgICAgJ0VFWElTVCcsIHBhdGgsIGBVbmFibGUgdG8gZXhjbHVzaXZlbHkgd3JpdGUgZmlsZSBcIiR7cGF0aH1cIi4gVGhlIGZpbGUgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgfVxuICAgIGVudGl0eVtiYXNlbmFtZV0gPSBkYXRhO1xuICB9XG5cbiAgcmVtb3ZlRmlsZShwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIGNvbnN0IFtmb2xkZXJQYXRoLCBiYXNlbmFtZV0gPSB0aGlzLnNwbGl0SW50b0ZvbGRlckFuZEZpbGUocGF0aCk7XG4gICAgY29uc3Qge2VudGl0eX0gPSB0aGlzLmZpbmRGcm9tUGF0aChmb2xkZXJQYXRoKTtcbiAgICBpZiAoZW50aXR5ID09PSBudWxsIHx8ICFpc0ZvbGRlcihlbnRpdHkpKSB7XG4gICAgICB0aHJvdyBuZXcgTW9ja0ZpbGVTeXN0ZW1FcnJvcihcbiAgICAgICAgICAnRU5PRU5UJywgcGF0aCwgYFVuYWJsZSB0byByZW1vdmUgZmlsZSBcIiR7cGF0aH1cIi4gVGhlIGNvbnRhaW5pbmcgZm9sZGVyIGRvZXMgbm90IGV4aXN0LmApO1xuICAgIH1cbiAgICBpZiAoaXNGb2xkZXIoZW50aXR5W2Jhc2VuYW1lXSkpIHtcbiAgICAgIHRocm93IG5ldyBNb2NrRmlsZVN5c3RlbUVycm9yKFxuICAgICAgICAgICdFSVNESVInLCBwYXRoLCBgVW5hYmxlIHRvIHJlbW92ZSBmaWxlIFwiJHtwYXRofVwiLiBUaGUgcGF0aCB0byByZW1vdmUgaXMgYSBmb2xkZXIuYCk7XG4gICAgfVxuICAgIGRlbGV0ZSBlbnRpdHlbYmFzZW5hbWVdO1xuICB9XG5cbiAgc3ltbGluayh0YXJnZXQ6IEFic29sdXRlRnNQYXRoLCBwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIGNvbnN0IFtmb2xkZXJQYXRoLCBiYXNlbmFtZV0gPSB0aGlzLnNwbGl0SW50b0ZvbGRlckFuZEZpbGUocGF0aCk7XG4gICAgY29uc3Qge2VudGl0eX0gPSB0aGlzLmZpbmRGcm9tUGF0aChmb2xkZXJQYXRoKTtcbiAgICBpZiAoZW50aXR5ID09PSBudWxsIHx8ICFpc0ZvbGRlcihlbnRpdHkpKSB7XG4gICAgICB0aHJvdyBuZXcgTW9ja0ZpbGVTeXN0ZW1FcnJvcihcbiAgICAgICAgICAnRU5PRU5UJywgcGF0aCxcbiAgICAgICAgICBgVW5hYmxlIHRvIGNyZWF0ZSBzeW1saW5rIGF0IFwiJHtwYXRofVwiLiBUaGUgY29udGFpbmluZyBmb2xkZXIgZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgfVxuICAgIGVudGl0eVtiYXNlbmFtZV0gPSBuZXcgU3ltTGluayh0YXJnZXQpO1xuICB9XG5cbiAgcmVhZGRpcihwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IFBhdGhTZWdtZW50W10ge1xuICAgIGNvbnN0IHtlbnRpdHl9ID0gdGhpcy5maW5kRnJvbVBhdGgocGF0aCk7XG4gICAgaWYgKGVudGl0eSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IE1vY2tGaWxlU3lzdGVtRXJyb3IoXG4gICAgICAgICAgJ0VOT0VOVCcsIHBhdGgsIGBVbmFibGUgdG8gcmVhZCBkaXJlY3RvcnkgXCIke3BhdGh9XCIuIEl0IGRvZXMgbm90IGV4aXN0LmApO1xuICAgIH1cbiAgICBpZiAoaXNGaWxlKGVudGl0eSkpIHtcbiAgICAgIHRocm93IG5ldyBNb2NrRmlsZVN5c3RlbUVycm9yKFxuICAgICAgICAgICdFTk9URElSJywgcGF0aCwgYFVuYWJsZSB0byByZWFkIGRpcmVjdG9yeSBcIiR7cGF0aH1cIi4gSXQgaXMgYSBmaWxlLmApO1xuICAgIH1cbiAgICByZXR1cm4gT2JqZWN0LmtleXMoZW50aXR5KSBhcyBQYXRoU2VnbWVudFtdO1xuICB9XG5cbiAgbHN0YXQocGF0aDogQWJzb2x1dGVGc1BhdGgpOiBGaWxlU3RhdHMge1xuICAgIGNvbnN0IHtlbnRpdHl9ID0gdGhpcy5maW5kRnJvbVBhdGgocGF0aCk7XG4gICAgaWYgKGVudGl0eSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IE1vY2tGaWxlU3lzdGVtRXJyb3IoJ0VOT0VOVCcsIHBhdGgsIGBGaWxlIFwiJHtwYXRofVwiIGRvZXMgbm90IGV4aXN0LmApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IE1vY2tGaWxlU3RhdHMoZW50aXR5KTtcbiAgfVxuXG4gIHN0YXQocGF0aDogQWJzb2x1dGVGc1BhdGgpOiBGaWxlU3RhdHMge1xuICAgIGNvbnN0IHtlbnRpdHl9ID0gdGhpcy5maW5kRnJvbVBhdGgocGF0aCwge2ZvbGxvd1N5bUxpbmtzOiB0cnVlfSk7XG4gICAgaWYgKGVudGl0eSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IE1vY2tGaWxlU3lzdGVtRXJyb3IoJ0VOT0VOVCcsIHBhdGgsIGBGaWxlIFwiJHtwYXRofVwiIGRvZXMgbm90IGV4aXN0LmApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IE1vY2tGaWxlU3RhdHMoZW50aXR5KTtcbiAgfVxuXG4gIGNvcHlGaWxlKGZyb206IEFic29sdXRlRnNQYXRoLCB0bzogQWJzb2x1dGVGc1BhdGgpOiB2b2lkIHtcbiAgICB0aGlzLndyaXRlRmlsZSh0bywgdGhpcy5yZWFkRmlsZShmcm9tKSk7XG4gIH1cblxuICBtb3ZlRmlsZShmcm9tOiBBYnNvbHV0ZUZzUGF0aCwgdG86IEFic29sdXRlRnNQYXRoKTogdm9pZCB7XG4gICAgdGhpcy53cml0ZUZpbGUodG8sIHRoaXMucmVhZEZpbGUoZnJvbSkpO1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuZmluZEZyb21QYXRoKGRpcm5hbWUoZnJvbSkpO1xuICAgIGNvbnN0IGZvbGRlciA9IHJlc3VsdC5lbnRpdHkgYXMgRm9sZGVyO1xuICAgIGNvbnN0IG5hbWUgPSBiYXNlbmFtZShmcm9tKTtcbiAgICBkZWxldGUgZm9sZGVyW25hbWVdO1xuICB9XG5cbiAgZW5zdXJlRGlyKHBhdGg6IEFic29sdXRlRnNQYXRoKTogRm9sZGVyIHtcbiAgICBjb25zdCBzZWdtZW50cyA9IHRoaXMuc3BsaXRQYXRoKHBhdGgpLm1hcChzZWdtZW50ID0+IHRoaXMuZ2V0Q2Fub25pY2FsUGF0aChzZWdtZW50KSk7XG5cbiAgICAvLyBDb252ZXJ0IHRoZSByb290IGZvbGRlciB0byBhIGNhbm9uaWNhbCBlbXB0eSBzdHJpbmcgYCcnYCAob24gV2luZG93cyBpdCB3b3VsZCBiZSBgJ0M6J2ApLlxuICAgIHNlZ21lbnRzWzBdID0gJyc7XG4gICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA+IDEgJiYgc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV0gPT09ICcnKSB7XG4gICAgICAvLyBSZW1vdmUgYSB0cmFpbGluZyBzbGFzaCAodW5sZXNzIHRoZSBwYXRoIHdhcyBvbmx5IGAvYClcbiAgICAgIHNlZ21lbnRzLnBvcCgpO1xuICAgIH1cblxuICAgIGxldCBjdXJyZW50OiBGb2xkZXIgPSB0aGlzLl9maWxlVHJlZTtcbiAgICBmb3IgKGNvbnN0IHNlZ21lbnQgb2Ygc2VnbWVudHMpIHtcbiAgICAgIGlmIChpc0ZpbGUoY3VycmVudFtzZWdtZW50XSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGb2xkZXIgYWxyZWFkeSBleGlzdHMgYXMgYSBmaWxlLmApO1xuICAgICAgfVxuICAgICAgaWYgKCFjdXJyZW50W3NlZ21lbnRdKSB7XG4gICAgICAgIGN1cnJlbnRbc2VnbWVudF0gPSB7fTtcbiAgICAgIH1cbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50W3NlZ21lbnRdIGFzIEZvbGRlcjtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnQ7XG4gIH1cblxuICByZW1vdmVEZWVwKHBhdGg6IEFic29sdXRlRnNQYXRoKTogdm9pZCB7XG4gICAgY29uc3QgW2ZvbGRlclBhdGgsIGJhc2VuYW1lXSA9IHRoaXMuc3BsaXRJbnRvRm9sZGVyQW5kRmlsZShwYXRoKTtcbiAgICBjb25zdCB7ZW50aXR5fSA9IHRoaXMuZmluZEZyb21QYXRoKGZvbGRlclBhdGgpO1xuICAgIGlmIChlbnRpdHkgPT09IG51bGwgfHwgIWlzRm9sZGVyKGVudGl0eSkpIHtcbiAgICAgIHRocm93IG5ldyBNb2NrRmlsZVN5c3RlbUVycm9yKFxuICAgICAgICAgICdFTk9FTlQnLCBwYXRoLFxuICAgICAgICAgIGBVbmFibGUgdG8gcmVtb3ZlIGZvbGRlciBcIiR7cGF0aH1cIi4gVGhlIGNvbnRhaW5pbmcgZm9sZGVyIGRvZXMgbm90IGV4aXN0LmApO1xuICAgIH1cbiAgICBkZWxldGUgZW50aXR5W2Jhc2VuYW1lXTtcbiAgfVxuXG4gIGlzUm9vdChwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmRpcm5hbWUocGF0aCkgPT09IHBhdGg7XG4gIH1cblxuICBleHRuYW1lKHBhdGg6IEFic29sdXRlRnNQYXRofFBhdGhTZWdtZW50KTogc3RyaW5nIHtcbiAgICBjb25zdCBtYXRjaCA9IC8uKyhcXC5bXi5dKikkLy5leGVjKHBhdGgpO1xuICAgIHJldHVybiBtYXRjaCAhPT0gbnVsbCA/IG1hdGNoWzFdIDogJyc7XG4gIH1cblxuICByZWFscGF0aChmaWxlUGF0aDogQWJzb2x1dGVGc1BhdGgpOiBBYnNvbHV0ZUZzUGF0aCB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5maW5kRnJvbVBhdGgoZmlsZVBhdGgsIHtmb2xsb3dTeW1MaW5rczogdHJ1ZX0pO1xuICAgIGlmIChyZXN1bHQuZW50aXR5ID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgTW9ja0ZpbGVTeXN0ZW1FcnJvcihcbiAgICAgICAgICAnRU5PRU5UJywgZmlsZVBhdGgsIGBVbmFibGUgdG8gZmluZCB0aGUgcmVhbCBwYXRoIG9mIFwiJHtmaWxlUGF0aH1cIi4gSXQgZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZXN1bHQucGF0aDtcbiAgICB9XG4gIH1cblxuICBwd2QoKTogQWJzb2x1dGVGc1BhdGgge1xuICAgIHJldHVybiB0aGlzLl9jd2Q7XG4gIH1cblxuICBjaGRpcihwYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIHRoaXMuX2N3ZCA9IHRoaXMubm9ybWFsaXplKHBhdGgpO1xuICB9XG5cbiAgZ2V0RGVmYXVsdExpYkxvY2F0aW9uKCk6IEFic29sdXRlRnNQYXRoIHtcbiAgICAvLyBNaW1pYyB0aGUgbm9kZSBtb2R1bGUgcmVzb2x1dGlvbiBhbGdvcml0aG0gYW5kIHN0YXJ0IGluIHRoZSBjdXJyZW50IGRpcmVjdG9yeSwgdGhlbiBsb29rXG4gICAgLy8gcHJvZ3Jlc3NpdmVseSBmdXJ0aGVyIHVwIHRoZSB0cmVlIHVudGlsIHJlYWNoaW5nIHRoZSBGUyByb290LlxuICAgIC8vIEUuZy4gaWYgdGhlIGN1cnJlbnQgZGlyZWN0b3J5IGlzIC9mb28vYmFyLCBsb29rIGluIC9mb28vYmFyL25vZGVfbW9kdWxlcywgdGhlblxuICAgIC8vIC9mb28vbm9kZV9tb2R1bGVzLCB0aGVuIC9ub2RlX21vZHVsZXMuXG5cbiAgICBsZXQgcGF0aCA9ICdub2RlX21vZHVsZXMvdHlwZXNjcmlwdC9saWInO1xuICAgIGxldCByZXNvbHZlZFBhdGggPSB0aGlzLnJlc29sdmUocGF0aCk7XG5cbiAgICAvLyBDb25zdHJ1Y3QgYSBwYXRoIGZvciB0aGUgdG9wLWxldmVsIG5vZGVfbW9kdWxlcyB0byBpZGVudGlmeSB0aGUgc3RvcHBpbmcgcG9pbnQuXG4gICAgY29uc3QgdG9wTGV2ZWxOb2RlTW9kdWxlcyA9IHRoaXMucmVzb2x2ZSgnLycgKyBwYXRoKTtcblxuICAgIHdoaWxlIChyZXNvbHZlZFBhdGggIT09IHRvcExldmVsTm9kZU1vZHVsZXMpIHtcbiAgICAgIGlmICh0aGlzLmV4aXN0cyhyZXNvbHZlZFBhdGgpKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlZFBhdGg7XG4gICAgICB9XG5cbiAgICAgIC8vIE5vdCBoZXJlLCBsb29rIG9uZSBsZXZlbCBoaWdoZXIuXG4gICAgICBwYXRoID0gJy4uLycgKyBwYXRoO1xuICAgICAgcmVzb2x2ZWRQYXRoID0gdGhpcy5yZXNvbHZlKHBhdGgpO1xuICAgIH1cblxuICAgIC8vIFRoZSBsb29wIGV4aXRzIGJlZm9yZSBjaGVja2luZyB0aGUgZXhpc3RlbmNlIG9mIC9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdCBhdCB0aGUgdG9wIGxldmVsLlxuICAgIC8vIFRoaXMgaXMgaW50ZW50aW9uYWwgLSBpZiBubyAvbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQgZXhpc3RzIGFueXdoZXJlIGluIHRoZSB0cmVlLCB0aGVyZSdzXG4gICAgLy8gbm90aGluZyB0aGlzIGZ1bmN0aW9uIGNhbiBkbyBhYm91dCBpdCwgYW5kIFRTIG1heSBlcnJvciBsYXRlciBpZiBpdCBsb29rcyBmb3IgYSBsaWIuZC50cyBmaWxlXG4gICAgLy8gd2l0aGluIHRoaXMgZGlyZWN0b3J5LiBJdCBtaWdodCBiZSBva2F5LCB0aG91Z2gsIGlmIFRTIG5ldmVyIGNoZWNrcyBmb3Igb25lLlxuICAgIHJldHVybiB0b3BMZXZlbE5vZGVNb2R1bGVzO1xuICB9XG5cbiAgYWJzdHJhY3QgcmVzb2x2ZSguLi5wYXRoczogc3RyaW5nW10pOiBBYnNvbHV0ZUZzUGF0aDtcbiAgYWJzdHJhY3QgZGlybmFtZTxUIGV4dGVuZHMgc3RyaW5nPihmaWxlOiBUKTogVDtcbiAgYWJzdHJhY3Qgam9pbjxUIGV4dGVuZHMgc3RyaW5nPihiYXNlUGF0aDogVCwgLi4ucGF0aHM6IHN0cmluZ1tdKTogVDtcbiAgYWJzdHJhY3QgcmVsYXRpdmU8VCBleHRlbmRzIFBhdGhTdHJpbmc+KGZyb206IFQsIHRvOiBUKTogUGF0aFNlZ21lbnR8QWJzb2x1dGVGc1BhdGg7XG4gIGFic3RyYWN0IGJhc2VuYW1lKGZpbGVQYXRoOiBzdHJpbmcsIGV4dGVuc2lvbj86IHN0cmluZyk6IFBhdGhTZWdtZW50O1xuICBhYnN0cmFjdCBpc1Jvb3RlZChwYXRoOiBzdHJpbmcpOiBib29sZWFuO1xuICBhYnN0cmFjdCBub3JtYWxpemU8VCBleHRlbmRzIFBhdGhTdHJpbmc+KHBhdGg6IFQpOiBUO1xuICBwcm90ZWN0ZWQgYWJzdHJhY3Qgc3BsaXRQYXRoPFQgZXh0ZW5kcyBQYXRoU3RyaW5nPihwYXRoOiBUKTogc3RyaW5nW107XG5cbiAgZHVtcCgpOiBGb2xkZXIge1xuICAgIGNvbnN0IHtlbnRpdHl9ID0gdGhpcy5maW5kRnJvbVBhdGgodGhpcy5yZXNvbHZlKCcvJykpO1xuICAgIGlmIChlbnRpdHkgPT09IG51bGwgfHwgIWlzRm9sZGVyKGVudGl0eSkpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jbG9uZUZvbGRlcihlbnRpdHkpO1xuICB9XG5cbiAgaW5pdChmb2xkZXI6IEZvbGRlcik6IHZvaWQge1xuICAgIHRoaXMubW91bnQodGhpcy5yZXNvbHZlKCcvJyksIGZvbGRlcik7XG4gIH1cblxuICBtb3VudChwYXRoOiBBYnNvbHV0ZUZzUGF0aCwgZm9sZGVyOiBGb2xkZXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5leGlzdHMocGF0aCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIG1vdW50IGluICcke3BhdGh9JyBhcyBpdCBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICB9XG4gICAgY29uc3QgbW91bnRGb2xkZXIgPSB0aGlzLmVuc3VyZURpcihwYXRoKTtcblxuICAgIHRoaXMuY29weUludG8oZm9sZGVyLCBtb3VudEZvbGRlcik7XG4gIH1cblxuICBwcml2YXRlIGNsb25lRm9sZGVyKGZvbGRlcjogRm9sZGVyKTogRm9sZGVyIHtcbiAgICBjb25zdCBjbG9uZTogRm9sZGVyID0ge307XG4gICAgdGhpcy5jb3B5SW50byhmb2xkZXIsIGNsb25lKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICBwcml2YXRlIGNvcHlJbnRvKGZyb206IEZvbGRlciwgdG86IEZvbGRlcik6IHZvaWQge1xuICAgIGZvciAoY29uc3QgcGF0aCBpbiBmcm9tKSB7XG4gICAgICBjb25zdCBpdGVtID0gZnJvbVtwYXRoXTtcbiAgICAgIGNvbnN0IGNhbm9uaWNhbFBhdGggPSB0aGlzLmdldENhbm9uaWNhbFBhdGgocGF0aCk7XG4gICAgICBpZiAoaXNTeW1MaW5rKGl0ZW0pKSB7XG4gICAgICAgIHRvW2Nhbm9uaWNhbFBhdGhdID0gbmV3IFN5bUxpbmsodGhpcy5nZXRDYW5vbmljYWxQYXRoKGl0ZW0ucGF0aCkpO1xuICAgICAgfSBlbHNlIGlmIChpc0ZvbGRlcihpdGVtKSkge1xuICAgICAgICB0b1tjYW5vbmljYWxQYXRoXSA9IHRoaXMuY2xvbmVGb2xkZXIoaXRlbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b1tjYW5vbmljYWxQYXRoXSA9IGZyb21bcGF0aF07XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICBwcm90ZWN0ZWQgZmluZEZyb21QYXRoKHBhdGg6IEFic29sdXRlRnNQYXRoLCBvcHRpb25zPzoge2ZvbGxvd1N5bUxpbmtzOiBib29sZWFufSk6IEZpbmRSZXN1bHQge1xuICAgIGNvbnN0IGZvbGxvd1N5bUxpbmtzID0gISFvcHRpb25zICYmIG9wdGlvbnMuZm9sbG93U3ltTGlua3M7XG4gICAgY29uc3Qgc2VnbWVudHMgPSB0aGlzLnNwbGl0UGF0aChwYXRoKTtcbiAgICBpZiAoc2VnbWVudHMubGVuZ3RoID4gMSAmJiBzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXSA9PT0gJycpIHtcbiAgICAgIC8vIFJlbW92ZSBhIHRyYWlsaW5nIHNsYXNoICh1bmxlc3MgdGhlIHBhdGggd2FzIG9ubHkgYC9gKVxuICAgICAgc2VnbWVudHMucG9wKCk7XG4gICAgfVxuICAgIC8vIENvbnZlcnQgdGhlIHJvb3QgZm9sZGVyIHRvIGEgY2Fub25pY2FsIGVtcHR5IHN0cmluZyBgXCJcImAgKG9uIFdpbmRvd3MgaXQgd291bGQgYmUgYEM6YCkuXG4gICAgc2VnbWVudHNbMF0gPSAnJztcbiAgICBsZXQgY3VycmVudDogRW50aXR5fG51bGwgPSB0aGlzLl9maWxlVHJlZTtcbiAgICB3aGlsZSAoc2VnbWVudHMubGVuZ3RoKSB7XG4gICAgICBjdXJyZW50ID0gY3VycmVudFt0aGlzLmdldENhbm9uaWNhbFBhdGgoc2VnbWVudHMuc2hpZnQoKSEpXTtcbiAgICAgIGlmIChjdXJyZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHtwYXRoLCBlbnRpdHk6IG51bGx9O1xuICAgICAgfVxuICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA+IDAgJiYgKCFpc0ZvbGRlcihjdXJyZW50KSkpIHtcbiAgICAgICAgY3VycmVudCA9IG51bGw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKGlzRmlsZShjdXJyZW50KSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChpc1N5bUxpbmsoY3VycmVudCkpIHtcbiAgICAgICAgaWYgKGZvbGxvd1N5bUxpbmtzKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmluZEZyb21QYXRoKHJlc29sdmUoY3VycmVudC5wYXRoLCAuLi5zZWdtZW50cyksIHtmb2xsb3dTeW1MaW5rc30pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7cGF0aCwgZW50aXR5OiBjdXJyZW50fTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzcGxpdEludG9Gb2xkZXJBbmRGaWxlKHBhdGg6IEFic29sdXRlRnNQYXRoKTogW0Fic29sdXRlRnNQYXRoLCBzdHJpbmddIHtcbiAgICBjb25zdCBzZWdtZW50cyA9IHRoaXMuc3BsaXRQYXRoKHRoaXMuZ2V0Q2Fub25pY2FsUGF0aChwYXRoKSk7XG4gICAgY29uc3QgZmlsZSA9IHNlZ21lbnRzLnBvcCgpITtcbiAgICByZXR1cm4gW3BhdGguc3Vic3RyaW5nKDAsIHBhdGgubGVuZ3RoIC0gZmlsZS5sZW5ndGggLSAxKSBhcyBBYnNvbHV0ZUZzUGF0aCwgZmlsZV07XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0Q2Fub25pY2FsUGF0aDxUIGV4dGVuZHMgc3RyaW5nPihwOiBUKTogVCB7XG4gICAgcmV0dXJuIHRoaXMuaXNDYXNlU2Vuc2l0aXZlKCkgPyBwIDogcC50b0xvd2VyQ2FzZSgpIGFzIFQ7XG4gIH1cbn1cbmV4cG9ydCBpbnRlcmZhY2UgRmluZFJlc3VsdCB7XG4gIHBhdGg6IEFic29sdXRlRnNQYXRoO1xuICBlbnRpdHk6IEVudGl0eXxudWxsO1xufVxuZXhwb3J0IHR5cGUgRW50aXR5ID0gRm9sZGVyfEZpbGV8U3ltTGluaztcbmV4cG9ydCBpbnRlcmZhY2UgRm9sZGVyIHtcbiAgW3BhdGhTZWdtZW50czogc3RyaW5nXTogRW50aXR5O1xufVxuZXhwb3J0IHR5cGUgRmlsZSA9IHN0cmluZ3xVaW50OEFycmF5O1xuZXhwb3J0IGNsYXNzIFN5bUxpbmsge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGF0aDogQWJzb2x1dGVGc1BhdGgpIHt9XG59XG5cbmNsYXNzIE1vY2tGaWxlU3RhdHMgaW1wbGVtZW50cyBGaWxlU3RhdHMge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVudGl0eTogRW50aXR5KSB7fVxuICBpc0ZpbGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzRmlsZSh0aGlzLmVudGl0eSk7XG4gIH1cbiAgaXNEaXJlY3RvcnkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGlzRm9sZGVyKHRoaXMuZW50aXR5KTtcbiAgfVxuICBpc1N5bWJvbGljTGluaygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNTeW1MaW5rKHRoaXMuZW50aXR5KTtcbiAgfVxufVxuXG5jbGFzcyBNb2NrRmlsZVN5c3RlbUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29kZTogc3RyaW5nLCBwdWJsaWMgcGF0aDogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGaWxlKGl0ZW06IEVudGl0eXxudWxsKTogaXRlbSBpcyBGaWxlIHtcbiAgcmV0dXJuIEJ1ZmZlci5pc0J1ZmZlcihpdGVtKSB8fCB0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZyc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N5bUxpbmsoaXRlbTogRW50aXR5fG51bGwpOiBpdGVtIGlzIFN5bUxpbmsge1xuICByZXR1cm4gaXRlbSBpbnN0YW5jZW9mIFN5bUxpbms7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0ZvbGRlcihpdGVtOiBFbnRpdHl8bnVsbCk6IGl0ZW0gaXMgRm9sZGVyIHtcbiAgcmV0dXJuIGl0ZW0gIT09IG51bGwgJiYgIWlzRmlsZShpdGVtKSAmJiAhaXNTeW1MaW5rKGl0ZW0pO1xufVxuIl19