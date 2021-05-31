(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc", ["require", "exports", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/main", "@angular/compiler-cli/src/ngtsc/logging", "@angular/compiler-cli/ngcc/src/ngcc_options"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.process = exports.clearTsConfigCache = exports.LogLevel = exports.ConsoleLogger = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var main_1 = require("@angular/compiler-cli/ngcc/src/main");
    var logging_1 = require("@angular/compiler-cli/src/ngtsc/logging");
    Object.defineProperty(exports, "ConsoleLogger", { enumerable: true, get: function () { return logging_1.ConsoleLogger; } });
    Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return logging_1.LogLevel; } });
    var ngcc_options_1 = require("@angular/compiler-cli/ngcc/src/ngcc_options");
    Object.defineProperty(exports, "clearTsConfigCache", { enumerable: true, get: function () { return ngcc_options_1.clearTsConfigCache; } });
    function process(options) {
        file_system_1.setFileSystem(new file_system_1.NodeJSFileSystem());
        return main_1.mainNgcc(options);
    }
    exports.process = process;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyRUFBeUU7SUFFekUsNERBQW9DO0lBR3BDLG1FQUFxRTtJQUE3RCx3R0FBQSxhQUFhLE9BQUE7SUFBVSxtR0FBQSxRQUFRLE9BQUE7SUFDdkMsNEVBQXNHO0lBQTVFLGtIQUFBLGtCQUFrQixPQUFBO0lBSzVDLFNBQWdCLE9BQU8sQ0FBQyxPQUF5QztRQUMvRCwyQkFBYSxDQUFDLElBQUksOEJBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sZUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFIRCwwQkFHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtOb2RlSlNGaWxlU3lzdGVtLCBzZXRGaWxlU3lzdGVtfSBmcm9tICcuLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuXG5pbXBvcnQge21haW5OZ2NjfSBmcm9tICcuL3NyYy9tYWluJztcbmltcG9ydCB7QXN5bmNOZ2NjT3B0aW9ucywgU3luY05nY2NPcHRpb25zfSBmcm9tICcuL3NyYy9uZ2NjX29wdGlvbnMnO1xuXG5leHBvcnQge0NvbnNvbGVMb2dnZXIsIExvZ2dlciwgTG9nTGV2ZWx9IGZyb20gJy4uL3NyYy9uZ3RzYy9sb2dnaW5nJztcbmV4cG9ydCB7QXN5bmNOZ2NjT3B0aW9ucywgY2xlYXJUc0NvbmZpZ0NhY2hlLCBOZ2NjT3B0aW9ucywgU3luY05nY2NPcHRpb25zfSBmcm9tICcuL3NyYy9uZ2NjX29wdGlvbnMnO1xuZXhwb3J0IHtQYXRoTWFwcGluZ3N9IGZyb20gJy4vc3JjL3BhdGhfbWFwcGluZ3MnO1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2VzczxUIGV4dGVuZHMgQXN5bmNOZ2NjT3B0aW9uc3xTeW5jTmdjY09wdGlvbnM+KG9wdGlvbnM6IFQpOlxuICAgIFQgZXh0ZW5kcyBBc3luY05nY2NPcHRpb25zID8gUHJvbWlzZTx2b2lkPjogdm9pZDtcbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzKG9wdGlvbnM6IEFzeW5jTmdjY09wdGlvbnN8U3luY05nY2NPcHRpb25zKTogdm9pZHxQcm9taXNlPHZvaWQ+IHtcbiAgc2V0RmlsZVN5c3RlbShuZXcgTm9kZUpTRmlsZVN5c3RlbSgpKTtcbiAgcmV0dXJuIG1haW5OZ2NjKG9wdGlvbnMpO1xufVxuIl19