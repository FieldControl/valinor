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
        define("@angular/compiler-cli/src/ngtsc/file_system/testing", ["require", "exports", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_native", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_posix", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_windows", "@angular/compiler-cli/src/ngtsc/file_system/testing/src/test_helper"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runInEachFileSystem = exports.initMockFileSystem = exports.MockFileSystemWindows = exports.MockFileSystemPosix = exports.MockFileSystemNative = exports.MockFileSystem = void 0;
    var mock_file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system");
    Object.defineProperty(exports, "MockFileSystem", { enumerable: true, get: function () { return mock_file_system_1.MockFileSystem; } });
    var mock_file_system_native_1 = require("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_native");
    Object.defineProperty(exports, "MockFileSystemNative", { enumerable: true, get: function () { return mock_file_system_native_1.MockFileSystemNative; } });
    var mock_file_system_posix_1 = require("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_posix");
    Object.defineProperty(exports, "MockFileSystemPosix", { enumerable: true, get: function () { return mock_file_system_posix_1.MockFileSystemPosix; } });
    var mock_file_system_windows_1 = require("@angular/compiler-cli/src/ngtsc/file_system/testing/src/mock_file_system_windows");
    Object.defineProperty(exports, "MockFileSystemWindows", { enumerable: true, get: function () { return mock_file_system_windows_1.MockFileSystemWindows; } });
    var test_helper_1 = require("@angular/compiler-cli/src/ngtsc/file_system/testing/src/test_helper");
    Object.defineProperty(exports, "initMockFileSystem", { enumerable: true, get: function () { return test_helper_1.initMockFileSystem; } });
    Object.defineProperty(exports, "runInEachFileSystem", { enumerable: true, get: function () { return test_helper_1.runInEachFileSystem; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2ZpbGVfc3lzdGVtL3Rlc3RpbmcvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsNkdBQThEO0lBQTlDLGtIQUFBLGNBQWMsT0FBQTtJQUM5QiwySEFBbUU7SUFBM0QsK0hBQUEsb0JBQW9CLE9BQUE7SUFDNUIseUhBQWlFO0lBQXpELDZIQUFBLG1CQUFtQixPQUFBO0lBQzNCLDZIQUFxRTtJQUE3RCxpSUFBQSxxQkFBcUIsT0FBQTtJQUM3QixtR0FBb0Y7SUFBNUUsaUhBQUEsa0JBQWtCLE9BQUE7SUFBRSxrSEFBQSxtQkFBbUIsT0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5leHBvcnQge0ZvbGRlciwgTW9ja0ZpbGVTeXN0ZW19IGZyb20gJy4vc3JjL21vY2tfZmlsZV9zeXN0ZW0nO1xuZXhwb3J0IHtNb2NrRmlsZVN5c3RlbU5hdGl2ZX0gZnJvbSAnLi9zcmMvbW9ja19maWxlX3N5c3RlbV9uYXRpdmUnO1xuZXhwb3J0IHtNb2NrRmlsZVN5c3RlbVBvc2l4fSBmcm9tICcuL3NyYy9tb2NrX2ZpbGVfc3lzdGVtX3Bvc2l4JztcbmV4cG9ydCB7TW9ja0ZpbGVTeXN0ZW1XaW5kb3dzfSBmcm9tICcuL3NyYy9tb2NrX2ZpbGVfc3lzdGVtX3dpbmRvd3MnO1xuZXhwb3J0IHtpbml0TW9ja0ZpbGVTeXN0ZW0sIHJ1bkluRWFjaEZpbGVTeXN0ZW0sIFRlc3RGaWxlfSBmcm9tICcuL3NyYy90ZXN0X2hlbHBlcic7XG4iXX0=