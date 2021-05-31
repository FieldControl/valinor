(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/locking/lock_file_with_child_process/index", ["require", "exports", "child_process", "@angular/compiler-cli/src/ngtsc/logging", "@angular/compiler-cli/ngcc/src/locking/lock_file", "@angular/compiler-cli/ngcc/src/locking/lock_file_with_child_process/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LockFileWithChildProcess = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var child_process_1 = require("child_process");
    var logging_1 = require("@angular/compiler-cli/src/ngtsc/logging");
    var lock_file_1 = require("@angular/compiler-cli/ngcc/src/locking/lock_file");
    var util_1 = require("@angular/compiler-cli/ngcc/src/locking/lock_file_with_child_process/util");
    /// <reference types="node" />
    /**
     * This `LockFile` implementation uses a child-process to remove the lock file when the main process
     * exits (for whatever reason).
     *
     * There are a few milliseconds between the child-process being forked and it registering its
     * `disconnect` event, which is responsible for tidying up the lock-file in the event that the main
     * process exits unexpectedly.
     *
     * We eagerly create the unlocker child-process so that it maximizes the time before the lock-file
     * is actually written, which makes it very unlikely that the unlocker would not be ready in the
     * case that the developer hits Ctrl-C or closes the terminal within a fraction of a second of the
     * lock-file being created.
     *
     * The worst case scenario is that ngcc is killed too quickly and leaves behind an orphaned
     * lock-file. In which case the next ngcc run will display a helpful error message about deleting
     * the lock-file.
     */
    var LockFileWithChildProcess = /** @class */ (function () {
        function LockFileWithChildProcess(fs, logger) {
            this.fs = fs;
            this.logger = logger;
            this.path = lock_file_1.getLockFilePath(fs);
            this.unlocker = this.createUnlocker(this.path);
        }
        LockFileWithChildProcess.prototype.write = function () {
            if (this.unlocker === null) {
                // In case we already disconnected the previous unlocker child-process, perhaps by calling
                // `remove()`. Normally the LockFile should only be used once per instance.
                this.unlocker = this.createUnlocker(this.path);
            }
            this.logger.debug("Attemping to write lock-file at " + this.path + " with PID " + process.pid);
            // To avoid race conditions, check for existence of the lock-file by trying to create it.
            // This will throw an error if the file already exists.
            this.fs.writeFile(this.path, process.pid.toString(), /* exclusive */ true);
            this.logger.debug("Written lock-file at " + this.path + " with PID " + process.pid);
        };
        LockFileWithChildProcess.prototype.read = function () {
            try {
                return this.fs.readFile(this.path);
            }
            catch (_a) {
                return '{unknown}';
            }
        };
        LockFileWithChildProcess.prototype.remove = function () {
            util_1.removeLockFile(this.fs, this.logger, this.path, process.pid.toString());
            if (this.unlocker !== null) {
                // If there is an unlocker child-process then disconnect from it so that it can exit itself.
                this.unlocker.disconnect();
                this.unlocker = null;
            }
        };
        LockFileWithChildProcess.prototype.createUnlocker = function (path) {
            var _a, _b;
            this.logger.debug('Forking unlocker child-process');
            var logLevel = this.logger.level !== undefined ? this.logger.level.toString() : logging_1.LogLevel.info.toString();
            var isWindows = process.platform === 'win32';
            var unlocker = child_process_1.fork(__dirname + '/unlocker.js', [path, logLevel], { detached: true, stdio: isWindows ? 'pipe' : 'inherit' });
            if (isWindows) {
                (_a = unlocker.stdout) === null || _a === void 0 ? void 0 : _a.on('data', process.stdout.write.bind(process.stdout));
                (_b = unlocker.stderr) === null || _b === void 0 ? void 0 : _b.on('data', process.stderr.write.bind(process.stderr));
            }
            return unlocker;
        };
        return LockFileWithChildProcess;
    }());
    exports.LockFileWithChildProcess = LockFileWithChildProcess;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvbG9ja2luZy9sb2NrX2ZpbGVfd2l0aF9jaGlsZF9wcm9jZXNzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILCtDQUFpRDtJQUdqRCxtRUFBK0Q7SUFDL0QsOEVBQXVEO0lBRXZELGlHQUFzQztJQUV0Qyw4QkFBOEI7SUFFOUI7Ozs7Ozs7Ozs7Ozs7Ozs7T0FnQkc7SUFDSDtRQUlFLGtDQUFzQixFQUFjLEVBQVksTUFBYztZQUF4QyxPQUFFLEdBQUYsRUFBRSxDQUFZO1lBQVksV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUM1RCxJQUFJLENBQUMsSUFBSSxHQUFHLDJCQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBR0Qsd0NBQUssR0FBTDtZQUNFLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7Z0JBQzFCLDBGQUEwRjtnQkFDMUYsMkVBQTJFO2dCQUMzRSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hEO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMscUNBQW1DLElBQUksQ0FBQyxJQUFJLGtCQUFhLE9BQU8sQ0FBQyxHQUFLLENBQUMsQ0FBQztZQUMxRix5RkFBeUY7WUFDekYsdURBQXVEO1lBQ3ZELElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsMEJBQXdCLElBQUksQ0FBQyxJQUFJLGtCQUFhLE9BQU8sQ0FBQyxHQUFLLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBRUQsdUNBQUksR0FBSjtZQUNFLElBQUk7Z0JBQ0YsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDcEM7WUFBQyxXQUFNO2dCQUNOLE9BQU8sV0FBVyxDQUFDO2FBQ3BCO1FBQ0gsQ0FBQztRQUVELHlDQUFNLEdBQU47WUFDRSxxQkFBYyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN4RSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO2dCQUMxQiw0RkFBNEY7Z0JBQzVGLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2FBQ3RCO1FBQ0gsQ0FBQztRQUVTLGlEQUFjLEdBQXhCLFVBQXlCLElBQW9COztZQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1lBQ3BELElBQU0sUUFBUSxHQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLGtCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzlGLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxDQUFDO1lBQy9DLElBQU0sUUFBUSxHQUFHLG9CQUFJLENBQ2pCLFNBQVMsR0FBRyxjQUFjLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQzVDLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBQyxDQUFDLENBQUM7WUFDN0QsSUFBSSxTQUFTLEVBQUU7Z0JBQ2IsTUFBQSxRQUFRLENBQUMsTUFBTSwwQ0FBRSxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDdkUsTUFBQSxRQUFRLENBQUMsTUFBTSwwQ0FBRSxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUN4RTtZQUNELE9BQU8sUUFBUSxDQUFDO1FBQ2xCLENBQUM7UUFDSCwrQkFBQztJQUFELENBQUMsQUF0REQsSUFzREM7SUF0RFksNERBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0NoaWxkUHJvY2VzcywgZm9ya30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIEZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlciwgTG9nTGV2ZWx9IGZyb20gJy4uLy4uLy4uLy4uL3NyYy9uZ3RzYy9sb2dnaW5nJztcbmltcG9ydCB7Z2V0TG9ja0ZpbGVQYXRoLCBMb2NrRmlsZX0gZnJvbSAnLi4vbG9ja19maWxlJztcblxuaW1wb3J0IHtyZW1vdmVMb2NrRmlsZX0gZnJvbSAnLi91dGlsJztcblxuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJub2RlXCIgLz5cblxuLyoqXG4gKiBUaGlzIGBMb2NrRmlsZWAgaW1wbGVtZW50YXRpb24gdXNlcyBhIGNoaWxkLXByb2Nlc3MgdG8gcmVtb3ZlIHRoZSBsb2NrIGZpbGUgd2hlbiB0aGUgbWFpbiBwcm9jZXNzXG4gKiBleGl0cyAoZm9yIHdoYXRldmVyIHJlYXNvbikuXG4gKlxuICogVGhlcmUgYXJlIGEgZmV3IG1pbGxpc2Vjb25kcyBiZXR3ZWVuIHRoZSBjaGlsZC1wcm9jZXNzIGJlaW5nIGZvcmtlZCBhbmQgaXQgcmVnaXN0ZXJpbmcgaXRzXG4gKiBgZGlzY29ubmVjdGAgZXZlbnQsIHdoaWNoIGlzIHJlc3BvbnNpYmxlIGZvciB0aWR5aW5nIHVwIHRoZSBsb2NrLWZpbGUgaW4gdGhlIGV2ZW50IHRoYXQgdGhlIG1haW5cbiAqIHByb2Nlc3MgZXhpdHMgdW5leHBlY3RlZGx5LlxuICpcbiAqIFdlIGVhZ2VybHkgY3JlYXRlIHRoZSB1bmxvY2tlciBjaGlsZC1wcm9jZXNzIHNvIHRoYXQgaXQgbWF4aW1pemVzIHRoZSB0aW1lIGJlZm9yZSB0aGUgbG9jay1maWxlXG4gKiBpcyBhY3R1YWxseSB3cml0dGVuLCB3aGljaCBtYWtlcyBpdCB2ZXJ5IHVubGlrZWx5IHRoYXQgdGhlIHVubG9ja2VyIHdvdWxkIG5vdCBiZSByZWFkeSBpbiB0aGVcbiAqIGNhc2UgdGhhdCB0aGUgZGV2ZWxvcGVyIGhpdHMgQ3RybC1DIG9yIGNsb3NlcyB0aGUgdGVybWluYWwgd2l0aGluIGEgZnJhY3Rpb24gb2YgYSBzZWNvbmQgb2YgdGhlXG4gKiBsb2NrLWZpbGUgYmVpbmcgY3JlYXRlZC5cbiAqXG4gKiBUaGUgd29yc3QgY2FzZSBzY2VuYXJpbyBpcyB0aGF0IG5nY2MgaXMga2lsbGVkIHRvbyBxdWlja2x5IGFuZCBsZWF2ZXMgYmVoaW5kIGFuIG9ycGhhbmVkXG4gKiBsb2NrLWZpbGUuIEluIHdoaWNoIGNhc2UgdGhlIG5leHQgbmdjYyBydW4gd2lsbCBkaXNwbGF5IGEgaGVscGZ1bCBlcnJvciBtZXNzYWdlIGFib3V0IGRlbGV0aW5nXG4gKiB0aGUgbG9jay1maWxlLlxuICovXG5leHBvcnQgY2xhc3MgTG9ja0ZpbGVXaXRoQ2hpbGRQcm9jZXNzIGltcGxlbWVudHMgTG9ja0ZpbGUge1xuICBwYXRoOiBBYnNvbHV0ZUZzUGF0aDtcbiAgcHJpdmF0ZSB1bmxvY2tlcjogQ2hpbGRQcm9jZXNzfG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGZzOiBGaWxlU3lzdGVtLCBwcm90ZWN0ZWQgbG9nZ2VyOiBMb2dnZXIpIHtcbiAgICB0aGlzLnBhdGggPSBnZXRMb2NrRmlsZVBhdGgoZnMpO1xuICAgIHRoaXMudW5sb2NrZXIgPSB0aGlzLmNyZWF0ZVVubG9ja2VyKHRoaXMucGF0aCk7XG4gIH1cblxuXG4gIHdyaXRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnVubG9ja2VyID09PSBudWxsKSB7XG4gICAgICAvLyBJbiBjYXNlIHdlIGFscmVhZHkgZGlzY29ubmVjdGVkIHRoZSBwcmV2aW91cyB1bmxvY2tlciBjaGlsZC1wcm9jZXNzLCBwZXJoYXBzIGJ5IGNhbGxpbmdcbiAgICAgIC8vIGByZW1vdmUoKWAuIE5vcm1hbGx5IHRoZSBMb2NrRmlsZSBzaG91bGQgb25seSBiZSB1c2VkIG9uY2UgcGVyIGluc3RhbmNlLlxuICAgICAgdGhpcy51bmxvY2tlciA9IHRoaXMuY3JlYXRlVW5sb2NrZXIodGhpcy5wYXRoKTtcbiAgICB9XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoYEF0dGVtcGluZyB0byB3cml0ZSBsb2NrLWZpbGUgYXQgJHt0aGlzLnBhdGh9IHdpdGggUElEICR7cHJvY2Vzcy5waWR9YCk7XG4gICAgLy8gVG8gYXZvaWQgcmFjZSBjb25kaXRpb25zLCBjaGVjayBmb3IgZXhpc3RlbmNlIG9mIHRoZSBsb2NrLWZpbGUgYnkgdHJ5aW5nIHRvIGNyZWF0ZSBpdC5cbiAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIGZpbGUgYWxyZWFkeSBleGlzdHMuXG4gICAgdGhpcy5mcy53cml0ZUZpbGUodGhpcy5wYXRoLCBwcm9jZXNzLnBpZC50b1N0cmluZygpLCAvKiBleGNsdXNpdmUgKi8gdHJ1ZSk7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoYFdyaXR0ZW4gbG9jay1maWxlIGF0ICR7dGhpcy5wYXRofSB3aXRoIFBJRCAke3Byb2Nlc3MucGlkfWApO1xuICB9XG5cbiAgcmVhZCgpOiBzdHJpbmcge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdGhpcy5mcy5yZWFkRmlsZSh0aGlzLnBhdGgpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuICd7dW5rbm93bn0nO1xuICAgIH1cbiAgfVxuXG4gIHJlbW92ZSgpIHtcbiAgICByZW1vdmVMb2NrRmlsZSh0aGlzLmZzLCB0aGlzLmxvZ2dlciwgdGhpcy5wYXRoLCBwcm9jZXNzLnBpZC50b1N0cmluZygpKTtcbiAgICBpZiAodGhpcy51bmxvY2tlciAhPT0gbnVsbCkge1xuICAgICAgLy8gSWYgdGhlcmUgaXMgYW4gdW5sb2NrZXIgY2hpbGQtcHJvY2VzcyB0aGVuIGRpc2Nvbm5lY3QgZnJvbSBpdCBzbyB0aGF0IGl0IGNhbiBleGl0IGl0c2VsZi5cbiAgICAgIHRoaXMudW5sb2NrZXIuZGlzY29ubmVjdCgpO1xuICAgICAgdGhpcy51bmxvY2tlciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZVVubG9ja2VyKHBhdGg6IEFic29sdXRlRnNQYXRoKTogQ2hpbGRQcm9jZXNzIHtcbiAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnRm9ya2luZyB1bmxvY2tlciBjaGlsZC1wcm9jZXNzJyk7XG4gICAgY29uc3QgbG9nTGV2ZWwgPVxuICAgICAgICB0aGlzLmxvZ2dlci5sZXZlbCAhPT0gdW5kZWZpbmVkID8gdGhpcy5sb2dnZXIubGV2ZWwudG9TdHJpbmcoKSA6IExvZ0xldmVsLmluZm8udG9TdHJpbmcoKTtcbiAgICBjb25zdCBpc1dpbmRvd3MgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuICAgIGNvbnN0IHVubG9ja2VyID0gZm9yayhcbiAgICAgICAgX19kaXJuYW1lICsgJy91bmxvY2tlci5qcycsIFtwYXRoLCBsb2dMZXZlbF0sXG4gICAgICAgIHtkZXRhY2hlZDogdHJ1ZSwgc3RkaW86IGlzV2luZG93cyA/ICdwaXBlJyA6ICdpbmhlcml0J30pO1xuICAgIGlmIChpc1dpbmRvd3MpIHtcbiAgICAgIHVubG9ja2VyLnN0ZG91dD8ub24oJ2RhdGEnLCBwcm9jZXNzLnN0ZG91dC53cml0ZS5iaW5kKHByb2Nlc3Muc3Rkb3V0KSk7XG4gICAgICB1bmxvY2tlci5zdGRlcnI/Lm9uKCdkYXRhJywgcHJvY2Vzcy5zdGRlcnIud3JpdGUuYmluZChwcm9jZXNzLnN0ZGVycikpO1xuICAgIH1cbiAgICByZXR1cm4gdW5sb2NrZXI7XG4gIH1cbn1cbiJdfQ==