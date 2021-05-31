(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/writing/cleaning/cleaning_strategies", ["require", "exports", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/packages/build_marker", "@angular/compiler-cli/ngcc/src/writing/in_place_file_writer", "@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer", "@angular/compiler-cli/ngcc/src/writing/cleaning/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackupFileCleaner = exports.NgccDirectoryCleaner = exports.PackageJsonCleaner = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var build_marker_1 = require("@angular/compiler-cli/ngcc/src/packages/build_marker");
    var in_place_file_writer_1 = require("@angular/compiler-cli/ngcc/src/writing/in_place_file_writer");
    var new_entry_point_file_writer_1 = require("@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/writing/cleaning/utils");
    /**
     * A CleaningStrategy that reverts changes to package.json files by removing the build marker and
     * other properties.
     */
    var PackageJsonCleaner = /** @class */ (function () {
        function PackageJsonCleaner(fs) {
            this.fs = fs;
        }
        PackageJsonCleaner.prototype.canClean = function (_path, basename) {
            return basename === 'package.json';
        };
        PackageJsonCleaner.prototype.clean = function (path, _basename) {
            var packageJson = JSON.parse(this.fs.readFile(path));
            if (build_marker_1.cleanPackageJson(packageJson)) {
                this.fs.writeFile(path, JSON.stringify(packageJson, null, 2) + "\n");
            }
        };
        return PackageJsonCleaner;
    }());
    exports.PackageJsonCleaner = PackageJsonCleaner;
    /**
     * A CleaningStrategy that removes the extra directory containing generated entry-point formats.
     */
    var NgccDirectoryCleaner = /** @class */ (function () {
        function NgccDirectoryCleaner(fs) {
            this.fs = fs;
        }
        NgccDirectoryCleaner.prototype.canClean = function (path, basename) {
            return basename === new_entry_point_file_writer_1.NGCC_DIRECTORY && utils_1.isLocalDirectory(this.fs, path);
        };
        NgccDirectoryCleaner.prototype.clean = function (path, _basename) {
            this.fs.removeDeep(path);
        };
        return NgccDirectoryCleaner;
    }());
    exports.NgccDirectoryCleaner = NgccDirectoryCleaner;
    /**
     * A CleaningStrategy that reverts files that were overwritten and removes the backup files that
     * ngcc created.
     */
    var BackupFileCleaner = /** @class */ (function () {
        function BackupFileCleaner(fs) {
            this.fs = fs;
        }
        BackupFileCleaner.prototype.canClean = function (path, basename) {
            return this.fs.extname(basename) === in_place_file_writer_1.NGCC_BACKUP_EXTENSION &&
                this.fs.exists(file_system_1.absoluteFrom(path.replace(in_place_file_writer_1.NGCC_BACKUP_EXTENSION, '')));
        };
        BackupFileCleaner.prototype.clean = function (path, _basename) {
            this.fs.moveFile(path, file_system_1.absoluteFrom(path.replace(in_place_file_writer_1.NGCC_BACKUP_EXTENSION, '')));
        };
        return BackupFileCleaner;
    }());
    exports.BackupFileCleaner = BackupFileCleaner;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYW5pbmdfc3RyYXRlZ2llcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9uZ2NjL3NyYy93cml0aW5nL2NsZWFuaW5nL2NsZWFuaW5nX3N0cmF0ZWdpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsMkVBQXdHO0lBQ3hHLHFGQUE2RDtJQUU3RCxvR0FBOEQ7SUFDOUQsa0hBQThEO0lBRTlELCtFQUF5QztJQVV6Qzs7O09BR0c7SUFDSDtRQUNFLDRCQUFvQixFQUFjO1lBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUFHLENBQUM7UUFDdEMscUNBQVEsR0FBUixVQUFTLEtBQXFCLEVBQUUsUUFBcUI7WUFDbkQsT0FBTyxRQUFRLEtBQUssY0FBYyxDQUFDO1FBQ3JDLENBQUM7UUFDRCxrQ0FBSyxHQUFMLFVBQU0sSUFBb0IsRUFBRSxTQUFzQjtZQUNoRCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUEwQixDQUFDO1lBQ2hGLElBQUksK0JBQWdCLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ2pDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksRUFBSyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQUksQ0FBQyxDQUFDO2FBQ3RFO1FBQ0gsQ0FBQztRQUNILHlCQUFDO0lBQUQsQ0FBQyxBQVhELElBV0M7SUFYWSxnREFBa0I7SUFhL0I7O09BRUc7SUFDSDtRQUNFLDhCQUFvQixFQUFjO1lBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUFHLENBQUM7UUFDdEMsdUNBQVEsR0FBUixVQUFTLElBQW9CLEVBQUUsUUFBcUI7WUFDbEQsT0FBTyxRQUFRLEtBQUssNENBQWMsSUFBSSx3QkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFDRCxvQ0FBSyxHQUFMLFVBQU0sSUFBb0IsRUFBRSxTQUFzQjtZQUNoRCxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBQ0gsMkJBQUM7SUFBRCxDQUFDLEFBUkQsSUFRQztJQVJZLG9EQUFvQjtJQVVqQzs7O09BR0c7SUFDSDtRQUNFLDJCQUFvQixFQUFjO1lBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUFHLENBQUM7UUFDdEMsb0NBQVEsR0FBUixVQUFTLElBQW9CLEVBQUUsUUFBcUI7WUFDbEQsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyw0Q0FBcUI7Z0JBQ3RELElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLDBCQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyw0Q0FBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUNELGlDQUFLLEdBQUwsVUFBTSxJQUFvQixFQUFFLFNBQXNCO1lBQ2hELElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSwwQkFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsNENBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFDSCx3QkFBQztJQUFELENBQUMsQUFURCxJQVNDO0lBVFksOENBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2Fic29sdXRlRnJvbSwgQWJzb2x1dGVGc1BhdGgsIEZpbGVTeXN0ZW0sIFBhdGhTZWdtZW50fSBmcm9tICcuLi8uLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtjbGVhblBhY2thZ2VKc29ufSBmcm9tICcuLi8uLi9wYWNrYWdlcy9idWlsZF9tYXJrZXInO1xuaW1wb3J0IHtFbnRyeVBvaW50UGFja2FnZUpzb259IGZyb20gJy4uLy4uL3BhY2thZ2VzL2VudHJ5X3BvaW50JztcbmltcG9ydCB7TkdDQ19CQUNLVVBfRVhURU5TSU9OfSBmcm9tICcuLi9pbl9wbGFjZV9maWxlX3dyaXRlcic7XG5pbXBvcnQge05HQ0NfRElSRUNUT1JZfSBmcm9tICcuLi9uZXdfZW50cnlfcG9pbnRfZmlsZV93cml0ZXInO1xuXG5pbXBvcnQge2lzTG9jYWxEaXJlY3Rvcnl9IGZyb20gJy4vdXRpbHMnO1xuXG4vKipcbiAqIEltcGxlbWVudCB0aGlzIGludGVyZmFjZSB0byBleHRlbmQgdGhlIGNsZWFuaW5nIHN0cmF0ZWdpZXMgb2YgdGhlIGBQYWNrYWdlQ2xlYW5lcmAuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2xlYW5pbmdTdHJhdGVneSB7XG4gIGNhbkNsZWFuKHBhdGg6IEFic29sdXRlRnNQYXRoLCBiYXNlbmFtZTogUGF0aFNlZ21lbnQpOiBib29sZWFuO1xuICBjbGVhbihwYXRoOiBBYnNvbHV0ZUZzUGF0aCwgYmFzZW5hbWU6IFBhdGhTZWdtZW50KTogdm9pZDtcbn1cblxuLyoqXG4gKiBBIENsZWFuaW5nU3RyYXRlZ3kgdGhhdCByZXZlcnRzIGNoYW5nZXMgdG8gcGFja2FnZS5qc29uIGZpbGVzIGJ5IHJlbW92aW5nIHRoZSBidWlsZCBtYXJrZXIgYW5kXG4gKiBvdGhlciBwcm9wZXJ0aWVzLlxuICovXG5leHBvcnQgY2xhc3MgUGFja2FnZUpzb25DbGVhbmVyIGltcGxlbWVudHMgQ2xlYW5pbmdTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZnM6IEZpbGVTeXN0ZW0pIHt9XG4gIGNhbkNsZWFuKF9wYXRoOiBBYnNvbHV0ZUZzUGF0aCwgYmFzZW5hbWU6IFBhdGhTZWdtZW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGJhc2VuYW1lID09PSAncGFja2FnZS5qc29uJztcbiAgfVxuICBjbGVhbihwYXRoOiBBYnNvbHV0ZUZzUGF0aCwgX2Jhc2VuYW1lOiBQYXRoU2VnbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IHBhY2thZ2VKc29uID0gSlNPTi5wYXJzZSh0aGlzLmZzLnJlYWRGaWxlKHBhdGgpKSBhcyBFbnRyeVBvaW50UGFja2FnZUpzb247XG4gICAgaWYgKGNsZWFuUGFja2FnZUpzb24ocGFja2FnZUpzb24pKSB7XG4gICAgICB0aGlzLmZzLndyaXRlRmlsZShwYXRoLCBgJHtKU09OLnN0cmluZ2lmeShwYWNrYWdlSnNvbiwgbnVsbCwgMil9XFxuYCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQSBDbGVhbmluZ1N0cmF0ZWd5IHRoYXQgcmVtb3ZlcyB0aGUgZXh0cmEgZGlyZWN0b3J5IGNvbnRhaW5pbmcgZ2VuZXJhdGVkIGVudHJ5LXBvaW50IGZvcm1hdHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ2NjRGlyZWN0b3J5Q2xlYW5lciBpbXBsZW1lbnRzIENsZWFuaW5nU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZzOiBGaWxlU3lzdGVtKSB7fVxuICBjYW5DbGVhbihwYXRoOiBBYnNvbHV0ZUZzUGF0aCwgYmFzZW5hbWU6IFBhdGhTZWdtZW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGJhc2VuYW1lID09PSBOR0NDX0RJUkVDVE9SWSAmJiBpc0xvY2FsRGlyZWN0b3J5KHRoaXMuZnMsIHBhdGgpO1xuICB9XG4gIGNsZWFuKHBhdGg6IEFic29sdXRlRnNQYXRoLCBfYmFzZW5hbWU6IFBhdGhTZWdtZW50KTogdm9pZCB7XG4gICAgdGhpcy5mcy5yZW1vdmVEZWVwKHBhdGgpO1xuICB9XG59XG5cbi8qKlxuICogQSBDbGVhbmluZ1N0cmF0ZWd5IHRoYXQgcmV2ZXJ0cyBmaWxlcyB0aGF0IHdlcmUgb3ZlcndyaXR0ZW4gYW5kIHJlbW92ZXMgdGhlIGJhY2t1cCBmaWxlcyB0aGF0XG4gKiBuZ2NjIGNyZWF0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBCYWNrdXBGaWxlQ2xlYW5lciBpbXBsZW1lbnRzIENsZWFuaW5nU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZzOiBGaWxlU3lzdGVtKSB7fVxuICBjYW5DbGVhbihwYXRoOiBBYnNvbHV0ZUZzUGF0aCwgYmFzZW5hbWU6IFBhdGhTZWdtZW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZnMuZXh0bmFtZShiYXNlbmFtZSkgPT09IE5HQ0NfQkFDS1VQX0VYVEVOU0lPTiAmJlxuICAgICAgICB0aGlzLmZzLmV4aXN0cyhhYnNvbHV0ZUZyb20ocGF0aC5yZXBsYWNlKE5HQ0NfQkFDS1VQX0VYVEVOU0lPTiwgJycpKSk7XG4gIH1cbiAgY2xlYW4ocGF0aDogQWJzb2x1dGVGc1BhdGgsIF9iYXNlbmFtZTogUGF0aFNlZ21lbnQpOiB2b2lkIHtcbiAgICB0aGlzLmZzLm1vdmVGaWxlKHBhdGgsIGFic29sdXRlRnJvbShwYXRoLnJlcGxhY2UoTkdDQ19CQUNLVVBfRVhURU5TSU9OLCAnJykpKTtcbiAgfVxufVxuIl19