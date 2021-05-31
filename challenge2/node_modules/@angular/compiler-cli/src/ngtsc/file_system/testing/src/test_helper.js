(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/file_system/testing/src/test_helper", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system/src/helpers", "@angular/compiler-cli/src/ngtsc/file_system/src/invalid_file_system", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_native", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_posix", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_windows"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initMockFileSystem = exports.runInEachFileSystem = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /// <reference types="jasmine"/>
    var ts = require("typescript");
    var helpers_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/helpers");
    var invalid_file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system/src/invalid_file_system");
    var mock_file_system_native_1 = require("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_native");
    var mock_file_system_posix_1 = require("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_posix");
    var mock_file_system_windows_1 = require("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_windows");
    var FS_NATIVE = 'Native';
    var FS_OS_X = 'OS/X';
    var FS_UNIX = 'Unix';
    var FS_WINDOWS = 'Windows';
    var FS_ALL = [FS_OS_X, FS_WINDOWS, FS_UNIX, FS_NATIVE];
    function runInEachFileSystemFn(callback) {
        FS_ALL.forEach(function (os) { return runInFileSystem(os, callback, false); });
    }
    function runInFileSystem(os, callback, error) {
        describe("<<FileSystem: " + os + ">>", function () {
            beforeEach(function () { return initMockFileSystem(os); });
            afterEach(function () { return helpers_1.setFileSystem(new invalid_file_system_1.InvalidFileSystem()); });
            callback(os);
            if (error) {
                afterAll(function () {
                    throw new Error("runInFileSystem limited to " + os + ", cannot pass");
                });
            }
        });
    }
    exports.runInEachFileSystem = runInEachFileSystemFn;
    exports.runInEachFileSystem.native = function (callback) {
        return runInFileSystem(FS_NATIVE, callback, true);
    };
    exports.runInEachFileSystem.osX = function (callback) {
        return runInFileSystem(FS_OS_X, callback, true);
    };
    exports.runInEachFileSystem.unix = function (callback) {
        return runInFileSystem(FS_UNIX, callback, true);
    };
    exports.runInEachFileSystem.windows = function (callback) {
        return runInFileSystem(FS_WINDOWS, callback, true);
    };
    function initMockFileSystem(os, cwd) {
        var fs = createMockFileSystem(os, cwd);
        helpers_1.setFileSystem(fs);
        monkeyPatchTypeScript(os, fs);
        return fs;
    }
    exports.initMockFileSystem = initMockFileSystem;
    function createMockFileSystem(os, cwd) {
        switch (os) {
            case 'OS/X':
                return new mock_file_system_posix_1.MockFileSystemPosix(/* isCaseSensitive */ false, cwd);
            case 'Unix':
                return new mock_file_system_posix_1.MockFileSystemPosix(/* isCaseSensitive */ true, cwd);
            case 'Windows':
                return new mock_file_system_windows_1.MockFileSystemWindows(/* isCaseSensitive*/ false, cwd);
            case 'Native':
                return new mock_file_system_native_1.MockFileSystemNative(cwd);
            default:
                throw new Error('FileSystem not supported');
        }
    }
    function monkeyPatchTypeScript(os, fs) {
        ts.sys.directoryExists = function (path) {
            var absPath = fs.resolve(path);
            return fs.exists(absPath) && fs.stat(absPath).isDirectory();
        };
        ts.sys.fileExists = function (path) {
            var absPath = fs.resolve(path);
            return fs.exists(absPath) && fs.stat(absPath).isFile();
        };
        ts.sys.getCurrentDirectory = function () { return fs.pwd(); };
        ts.sys.getDirectories = getDirectories;
        ts.sys.readFile = fs.readFile.bind(fs);
        ts.sys.resolvePath = fs.resolve.bind(fs);
        ts.sys.writeFile = fs.writeFile.bind(fs);
        ts.sys.readDirectory = readDirectory;
        function getDirectories(path) {
            return fs.readdir(helpers_1.absoluteFrom(path)).filter(function (p) { return fs.stat(fs.resolve(path, p)).isDirectory(); });
        }
        function getFileSystemEntries(path) {
            var e_1, _a;
            var files = [];
            var directories = [];
            var absPath = fs.resolve(path);
            var entries = fs.readdir(absPath);
            try {
                for (var entries_1 = tslib_1.__values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
                    var entry = entries_1_1.value;
                    if (entry == '.' || entry === '..') {
                        continue;
                    }
                    var absPath_1 = fs.resolve(path, entry);
                    var stat = fs.stat(absPath_1);
                    if (stat.isDirectory()) {
                        directories.push(absPath_1);
                    }
                    else if (stat.isFile()) {
                        files.push(absPath_1);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return { files: files, directories: directories };
        }
        function realPath(path) {
            return fs.realpath(fs.resolve(path));
        }
        // Rather than completely re-implementing we are using the `ts.matchFiles` function,
        // which is internal to the `ts` namespace.
        var tsMatchFiles = ts.matchFiles;
        function readDirectory(path, extensions, excludes, includes, depth) {
            return tsMatchFiles(path, extensions, excludes, includes, fs.isCaseSensitive(), fs.pwd(), depth, getFileSystemEntries, realPath);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9oZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2ZpbGVfc3lzdGVtL3Rlc3Rpbmcvc3JjL3Rlc3RfaGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxnQ0FBZ0M7SUFDaEMsK0JBQWlDO0lBRWpDLG1GQUE4RDtJQUM5RCwyR0FBZ0U7SUFJaEUsMkhBQStEO0lBQy9ELHlIQUE2RDtJQUM3RCw2SEFBaUU7SUFnQmpFLElBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUMzQixJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDdkIsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUM3QixJQUFNLE1BQU0sR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBRXpELFNBQVMscUJBQXFCLENBQUMsUUFBOEI7UUFDM0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLGVBQWUsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFwQyxDQUFvQyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELFNBQVMsZUFBZSxDQUFDLEVBQVUsRUFBRSxRQUE4QixFQUFFLEtBQWM7UUFDakYsUUFBUSxDQUFDLG1CQUFpQixFQUFFLE9BQUksRUFBRTtZQUNoQyxVQUFVLENBQUMsY0FBTSxPQUFBLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxFQUF0QixDQUFzQixDQUFDLENBQUM7WUFDekMsU0FBUyxDQUFDLGNBQU0sT0FBQSx1QkFBYSxDQUFDLElBQUksdUNBQWlCLEVBQUUsQ0FBQyxFQUF0QyxDQUFzQyxDQUFDLENBQUM7WUFDeEQsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2IsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsUUFBUSxDQUFDO29CQUNQLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQThCLEVBQUUsa0JBQWUsQ0FBQyxDQUFDO2dCQUNuRSxDQUFDLENBQUMsQ0FBQzthQUNKO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRVksUUFBQSxtQkFBbUIsR0FDNUIscUJBQThDLENBQUM7SUFFbkQsMkJBQW1CLENBQUMsTUFBTSxHQUFHLFVBQUMsUUFBOEI7UUFDeEQsT0FBQSxlQUFlLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUM7SUFBMUMsQ0FBMEMsQ0FBQztJQUMvQywyQkFBbUIsQ0FBQyxHQUFHLEdBQUcsVUFBQyxRQUE4QjtRQUNyRCxPQUFBLGVBQWUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQztJQUF4QyxDQUF3QyxDQUFDO0lBQzdDLDJCQUFtQixDQUFDLElBQUksR0FBRyxVQUFDLFFBQThCO1FBQ3RELE9BQUEsZUFBZSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDO0lBQXhDLENBQXdDLENBQUM7SUFDN0MsMkJBQW1CLENBQUMsT0FBTyxHQUFHLFVBQUMsUUFBOEI7UUFDekQsT0FBQSxlQUFlLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUM7SUFBM0MsQ0FBMkMsQ0FBQztJQUVoRCxTQUFnQixrQkFBa0IsQ0FBQyxFQUFVLEVBQUUsR0FBb0I7UUFDakUsSUFBTSxFQUFFLEdBQUcsb0JBQW9CLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLHVCQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEIscUJBQXFCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlCLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUxELGdEQUtDO0lBRUQsU0FBUyxvQkFBb0IsQ0FBQyxFQUFVLEVBQUUsR0FBb0I7UUFDNUQsUUFBUSxFQUFFLEVBQUU7WUFDVixLQUFLLE1BQU07Z0JBQ1QsT0FBTyxJQUFJLDRDQUFtQixDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNuRSxLQUFLLE1BQU07Z0JBQ1QsT0FBTyxJQUFJLDRDQUFtQixDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNsRSxLQUFLLFNBQVM7Z0JBQ1osT0FBTyxJQUFJLGdEQUFxQixDQUFDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNwRSxLQUFLLFFBQVE7Z0JBQ1gsT0FBTyxJQUFJLDhDQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZDO2dCQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztTQUMvQztJQUNILENBQUM7SUFFRCxTQUFTLHFCQUFxQixDQUFDLEVBQVUsRUFBRSxFQUFrQjtRQUMzRCxFQUFFLENBQUMsR0FBRyxDQUFDLGVBQWUsR0FBRyxVQUFBLElBQUk7WUFDM0IsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM5RCxDQUFDLENBQUM7UUFDRixFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxVQUFBLElBQUk7WUFDdEIsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN6RCxDQUFDLENBQUM7UUFDRixFQUFFLENBQUMsR0FBRyxDQUFDLG1CQUFtQixHQUFHLGNBQU0sT0FBQSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQVIsQ0FBUSxDQUFDO1FBQzVDLEVBQUUsQ0FBQyxHQUFHLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUN2QyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QyxFQUFFLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QyxFQUFFLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFFckMsU0FBUyxjQUFjLENBQUMsSUFBWTtZQUNsQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsc0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBMUMsQ0FBMEMsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFRCxTQUFTLG9CQUFvQixDQUFDLElBQVk7O1lBQ3hDLElBQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztZQUMzQixJQUFNLFdBQVcsR0FBYSxFQUFFLENBQUM7WUFDakMsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqQyxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztnQkFDcEMsS0FBb0IsSUFBQSxZQUFBLGlCQUFBLE9BQU8sQ0FBQSxnQ0FBQSxxREFBRTtvQkFBeEIsSUFBTSxLQUFLLG9CQUFBO29CQUNkLElBQUksS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO3dCQUNsQyxTQUFTO3FCQUNWO29CQUNELElBQU0sU0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUN4QyxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQU8sQ0FBQyxDQUFDO29CQUM5QixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTt3QkFDdEIsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFPLENBQUMsQ0FBQztxQkFDM0I7eUJBQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUU7d0JBQ3hCLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBTyxDQUFDLENBQUM7cUJBQ3JCO2lCQUNGOzs7Ozs7Ozs7WUFDRCxPQUFPLEVBQUMsS0FBSyxPQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUMsQ0FBQztRQUM5QixDQUFDO1FBRUQsU0FBUyxRQUFRLENBQUMsSUFBWTtZQUM1QixPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFRCxvRkFBb0Y7UUFDcEYsMkNBQTJDO1FBQzNDLElBQU0sWUFBWSxHQUtxQyxFQUFVLENBQUMsVUFBVSxDQUFDO1FBRTdFLFNBQVMsYUFBYSxDQUNsQixJQUFZLEVBQUUsVUFBa0MsRUFBRSxRQUFnQyxFQUNsRixRQUFnQyxFQUFFLEtBQWM7WUFDbEQsT0FBTyxZQUFZLENBQ2YsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUMzRSxvQkFBb0IsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0QyxDQUFDO0lBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJqYXNtaW5lXCIvPlxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7YWJzb2x1dGVGcm9tLCBzZXRGaWxlU3lzdGVtfSBmcm9tICcuLi8uLi9zcmMvaGVscGVycyc7XG5pbXBvcnQge0ludmFsaWRGaWxlU3lzdGVtfSBmcm9tICcuLi8uLi9zcmMvaW52YWxpZF9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRofSBmcm9tICcuLi8uLi9zcmMvdHlwZXMnO1xuXG5pbXBvcnQge01vY2tGaWxlU3lzdGVtfSBmcm9tICcuL21vY2tfZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtNb2NrRmlsZVN5c3RlbU5hdGl2ZX0gZnJvbSAnLi9tb2NrX2ZpbGVfc3lzdGVtX25hdGl2ZSc7XG5pbXBvcnQge01vY2tGaWxlU3lzdGVtUG9zaXh9IGZyb20gJy4vbW9ja19maWxlX3N5c3RlbV9wb3NpeCc7XG5pbXBvcnQge01vY2tGaWxlU3lzdGVtV2luZG93c30gZnJvbSAnLi9tb2NrX2ZpbGVfc3lzdGVtX3dpbmRvd3MnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRlc3RGaWxlIHtcbiAgbmFtZTogQWJzb2x1dGVGc1BhdGg7XG4gIGNvbnRlbnRzOiBzdHJpbmc7XG4gIGlzUm9vdD86IGJvb2xlYW58dW5kZWZpbmVkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJ1bkluRWFjaEZpbGVTeXN0ZW1GbiB7XG4gIChjYWxsYmFjazogKG9zOiBzdHJpbmcpID0+IHZvaWQpOiB2b2lkO1xuICB3aW5kb3dzKGNhbGxiYWNrOiAob3M6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQ7XG4gIHVuaXgoY2FsbGJhY2s6IChvczogc3RyaW5nKSA9PiB2b2lkKTogdm9pZDtcbiAgbmF0aXZlKGNhbGxiYWNrOiAob3M6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQ7XG4gIG9zWChjYWxsYmFjazogKG9zOiBzdHJpbmcpID0+IHZvaWQpOiB2b2lkO1xufVxuXG5jb25zdCBGU19OQVRJVkUgPSAnTmF0aXZlJztcbmNvbnN0IEZTX09TX1ggPSAnT1MvWCc7XG5jb25zdCBGU19VTklYID0gJ1VuaXgnO1xuY29uc3QgRlNfV0lORE9XUyA9ICdXaW5kb3dzJztcbmNvbnN0IEZTX0FMTCA9IFtGU19PU19YLCBGU19XSU5ET1dTLCBGU19VTklYLCBGU19OQVRJVkVdO1xuXG5mdW5jdGlvbiBydW5JbkVhY2hGaWxlU3lzdGVtRm4oY2FsbGJhY2s6IChvczogc3RyaW5nKSA9PiB2b2lkKSB7XG4gIEZTX0FMTC5mb3JFYWNoKG9zID0+IHJ1bkluRmlsZVN5c3RlbShvcywgY2FsbGJhY2ssIGZhbHNlKSk7XG59XG5cbmZ1bmN0aW9uIHJ1bkluRmlsZVN5c3RlbShvczogc3RyaW5nLCBjYWxsYmFjazogKG9zOiBzdHJpbmcpID0+IHZvaWQsIGVycm9yOiBib29sZWFuKSB7XG4gIGRlc2NyaWJlKGA8PEZpbGVTeXN0ZW06ICR7b3N9Pj5gLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiBpbml0TW9ja0ZpbGVTeXN0ZW0ob3MpKTtcbiAgICBhZnRlckVhY2goKCkgPT4gc2V0RmlsZVN5c3RlbShuZXcgSW52YWxpZEZpbGVTeXN0ZW0oKSkpO1xuICAgIGNhbGxiYWNrKG9zKTtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIGFmdGVyQWxsKCgpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBydW5JbkZpbGVTeXN0ZW0gbGltaXRlZCB0byAke29zfSwgY2Fubm90IHBhc3NgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBjb25zdCBydW5JbkVhY2hGaWxlU3lzdGVtOiBSdW5JbkVhY2hGaWxlU3lzdGVtRm4gPVxuICAgIHJ1bkluRWFjaEZpbGVTeXN0ZW1GbiBhcyBSdW5JbkVhY2hGaWxlU3lzdGVtRm47XG5cbnJ1bkluRWFjaEZpbGVTeXN0ZW0ubmF0aXZlID0gKGNhbGxiYWNrOiAob3M6IHN0cmluZykgPT4gdm9pZCkgPT5cbiAgICBydW5JbkZpbGVTeXN0ZW0oRlNfTkFUSVZFLCBjYWxsYmFjaywgdHJ1ZSk7XG5ydW5JbkVhY2hGaWxlU3lzdGVtLm9zWCA9IChjYWxsYmFjazogKG9zOiBzdHJpbmcpID0+IHZvaWQpID0+XG4gICAgcnVuSW5GaWxlU3lzdGVtKEZTX09TX1gsIGNhbGxiYWNrLCB0cnVlKTtcbnJ1bkluRWFjaEZpbGVTeXN0ZW0udW5peCA9IChjYWxsYmFjazogKG9zOiBzdHJpbmcpID0+IHZvaWQpID0+XG4gICAgcnVuSW5GaWxlU3lzdGVtKEZTX1VOSVgsIGNhbGxiYWNrLCB0cnVlKTtcbnJ1bkluRWFjaEZpbGVTeXN0ZW0ud2luZG93cyA9IChjYWxsYmFjazogKG9zOiBzdHJpbmcpID0+IHZvaWQpID0+XG4gICAgcnVuSW5GaWxlU3lzdGVtKEZTX1dJTkRPV1MsIGNhbGxiYWNrLCB0cnVlKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNb2NrRmlsZVN5c3RlbShvczogc3RyaW5nLCBjd2Q/OiBBYnNvbHV0ZUZzUGF0aCk6IE1vY2tGaWxlU3lzdGVtIHtcbiAgY29uc3QgZnMgPSBjcmVhdGVNb2NrRmlsZVN5c3RlbShvcywgY3dkKTtcbiAgc2V0RmlsZVN5c3RlbShmcyk7XG4gIG1vbmtleVBhdGNoVHlwZVNjcmlwdChvcywgZnMpO1xuICByZXR1cm4gZnM7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1vY2tGaWxlU3lzdGVtKG9zOiBzdHJpbmcsIGN3ZD86IEFic29sdXRlRnNQYXRoKTogTW9ja0ZpbGVTeXN0ZW0ge1xuICBzd2l0Y2ggKG9zKSB7XG4gICAgY2FzZSAnT1MvWCc6XG4gICAgICByZXR1cm4gbmV3IE1vY2tGaWxlU3lzdGVtUG9zaXgoLyogaXNDYXNlU2Vuc2l0aXZlICovIGZhbHNlLCBjd2QpO1xuICAgIGNhc2UgJ1VuaXgnOlxuICAgICAgcmV0dXJuIG5ldyBNb2NrRmlsZVN5c3RlbVBvc2l4KC8qIGlzQ2FzZVNlbnNpdGl2ZSAqLyB0cnVlLCBjd2QpO1xuICAgIGNhc2UgJ1dpbmRvd3MnOlxuICAgICAgcmV0dXJuIG5ldyBNb2NrRmlsZVN5c3RlbVdpbmRvd3MoLyogaXNDYXNlU2Vuc2l0aXZlKi8gZmFsc2UsIGN3ZCk7XG4gICAgY2FzZSAnTmF0aXZlJzpcbiAgICAgIHJldHVybiBuZXcgTW9ja0ZpbGVTeXN0ZW1OYXRpdmUoY3dkKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGaWxlU3lzdGVtIG5vdCBzdXBwb3J0ZWQnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtb25rZXlQYXRjaFR5cGVTY3JpcHQob3M6IHN0cmluZywgZnM6IE1vY2tGaWxlU3lzdGVtKSB7XG4gIHRzLnN5cy5kaXJlY3RvcnlFeGlzdHMgPSBwYXRoID0+IHtcbiAgICBjb25zdCBhYnNQYXRoID0gZnMucmVzb2x2ZShwYXRoKTtcbiAgICByZXR1cm4gZnMuZXhpc3RzKGFic1BhdGgpICYmIGZzLnN0YXQoYWJzUGF0aCkuaXNEaXJlY3RvcnkoKTtcbiAgfTtcbiAgdHMuc3lzLmZpbGVFeGlzdHMgPSBwYXRoID0+IHtcbiAgICBjb25zdCBhYnNQYXRoID0gZnMucmVzb2x2ZShwYXRoKTtcbiAgICByZXR1cm4gZnMuZXhpc3RzKGFic1BhdGgpICYmIGZzLnN0YXQoYWJzUGF0aCkuaXNGaWxlKCk7XG4gIH07XG4gIHRzLnN5cy5nZXRDdXJyZW50RGlyZWN0b3J5ID0gKCkgPT4gZnMucHdkKCk7XG4gIHRzLnN5cy5nZXREaXJlY3RvcmllcyA9IGdldERpcmVjdG9yaWVzO1xuICB0cy5zeXMucmVhZEZpbGUgPSBmcy5yZWFkRmlsZS5iaW5kKGZzKTtcbiAgdHMuc3lzLnJlc29sdmVQYXRoID0gZnMucmVzb2x2ZS5iaW5kKGZzKTtcbiAgdHMuc3lzLndyaXRlRmlsZSA9IGZzLndyaXRlRmlsZS5iaW5kKGZzKTtcbiAgdHMuc3lzLnJlYWREaXJlY3RvcnkgPSByZWFkRGlyZWN0b3J5O1xuXG4gIGZ1bmN0aW9uIGdldERpcmVjdG9yaWVzKHBhdGg6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gZnMucmVhZGRpcihhYnNvbHV0ZUZyb20ocGF0aCkpLmZpbHRlcihwID0+IGZzLnN0YXQoZnMucmVzb2x2ZShwYXRoLCBwKSkuaXNEaXJlY3RvcnkoKSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRGaWxlU3lzdGVtRW50cmllcyhwYXRoOiBzdHJpbmcpOiBGaWxlU3lzdGVtRW50cmllcyB7XG4gICAgY29uc3QgZmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgZGlyZWN0b3JpZXM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgYWJzUGF0aCA9IGZzLnJlc29sdmUocGF0aCk7XG4gICAgY29uc3QgZW50cmllcyA9IGZzLnJlYWRkaXIoYWJzUGF0aCk7XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICBpZiAoZW50cnkgPT0gJy4nIHx8IGVudHJ5ID09PSAnLi4nKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgYWJzUGF0aCA9IGZzLnJlc29sdmUocGF0aCwgZW50cnkpO1xuICAgICAgY29uc3Qgc3RhdCA9IGZzLnN0YXQoYWJzUGF0aCk7XG4gICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgIGRpcmVjdG9yaWVzLnB1c2goYWJzUGF0aCk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXQuaXNGaWxlKCkpIHtcbiAgICAgICAgZmlsZXMucHVzaChhYnNQYXRoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtmaWxlcywgZGlyZWN0b3JpZXN9O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVhbFBhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gZnMucmVhbHBhdGgoZnMucmVzb2x2ZShwYXRoKSk7XG4gIH1cblxuICAvLyBSYXRoZXIgdGhhbiBjb21wbGV0ZWx5IHJlLWltcGxlbWVudGluZyB3ZSBhcmUgdXNpbmcgdGhlIGB0cy5tYXRjaEZpbGVzYCBmdW5jdGlvbixcbiAgLy8gd2hpY2ggaXMgaW50ZXJuYWwgdG8gdGhlIGB0c2AgbmFtZXNwYWNlLlxuICBjb25zdCB0c01hdGNoRmlsZXM6IChcbiAgICAgIHBhdGg6IHN0cmluZywgZXh0ZW5zaW9uczogUmVhZG9ubHlBcnJheTxzdHJpbmc+fHVuZGVmaW5lZCxcbiAgICAgIGV4Y2x1ZGVzOiBSZWFkb25seUFycmF5PHN0cmluZz58dW5kZWZpbmVkLCBpbmNsdWRlczogUmVhZG9ubHlBcnJheTxzdHJpbmc+fHVuZGVmaW5lZCxcbiAgICAgIHVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXM6IGJvb2xlYW4sIGN1cnJlbnREaXJlY3Rvcnk6IHN0cmluZywgZGVwdGg6IG51bWJlcnx1bmRlZmluZWQsXG4gICAgICBnZXRGaWxlU3lzdGVtRW50cmllczogKHBhdGg6IHN0cmluZykgPT4gRmlsZVN5c3RlbUVudHJpZXMsXG4gICAgICByZWFscGF0aDogKHBhdGg6IHN0cmluZykgPT4gc3RyaW5nKSA9PiBzdHJpbmdbXSA9ICh0cyBhcyBhbnkpLm1hdGNoRmlsZXM7XG5cbiAgZnVuY3Rpb24gcmVhZERpcmVjdG9yeShcbiAgICAgIHBhdGg6IHN0cmluZywgZXh0ZW5zaW9ucz86IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiwgZXhjbHVkZXM/OiBSZWFkb25seUFycmF5PHN0cmluZz4sXG4gICAgICBpbmNsdWRlcz86IFJlYWRvbmx5QXJyYXk8c3RyaW5nPiwgZGVwdGg/OiBudW1iZXIpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRzTWF0Y2hGaWxlcyhcbiAgICAgICAgcGF0aCwgZXh0ZW5zaW9ucywgZXhjbHVkZXMsIGluY2x1ZGVzLCBmcy5pc0Nhc2VTZW5zaXRpdmUoKSwgZnMucHdkKCksIGRlcHRoLFxuICAgICAgICBnZXRGaWxlU3lzdGVtRW50cmllcywgcmVhbFBhdGgpO1xuICB9XG59XG5cbmludGVyZmFjZSBGaWxlU3lzdGVtRW50cmllcyB7XG4gIHJlYWRvbmx5IGZpbGVzOiBSZWFkb25seUFycmF5PHN0cmluZz47XG4gIHJlYWRvbmx5IGRpcmVjdG9yaWVzOiBSZWFkb25seUFycmF5PHN0cmluZz47XG59XG4iXX0=