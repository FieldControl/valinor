(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/locking/sync_locker", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SyncLocker = void 0;
    /**
     * SyncLocker is used to prevent more than one instance of ngcc executing at the same time,
     * when being called in a synchronous context.
     *
     * * When ngcc starts executing, it creates a file in the `compiler-cli/ngcc` folder.
     * * If it finds one is already there then it fails with a suitable error message.
     * * When ngcc completes executing, it removes the file so that future ngcc executions can start.
     */
    var SyncLocker = /** @class */ (function () {
        function SyncLocker(lockFile) {
            this.lockFile = lockFile;
        }
        /**
         * Run the given function guarded by the lock file.
         *
         * @param fn the function to run.
         * @returns the value returned from the `fn` call.
         */
        SyncLocker.prototype.lock = function (fn) {
            this.create();
            try {
                return fn();
            }
            finally {
                this.lockFile.remove();
            }
        };
        /**
         * Write a lock file to disk, or error if there is already one there.
         */
        SyncLocker.prototype.create = function () {
            try {
                this.lockFile.write();
            }
            catch (e) {
                if (e.code !== 'EEXIST') {
                    throw e;
                }
                this.handleExistingLockFile();
            }
        };
        /**
         * The lock-file already exists so raise a helpful error.
         */
        SyncLocker.prototype.handleExistingLockFile = function () {
            var pid = this.lockFile.read();
            throw new Error("ngcc is already running at process with id " + pid + ".\n" +
                "If you are running multiple builds in parallel then you might try pre-processing your node_modules via the command line ngcc tool before starting the builds.\n" +
                ("(If you are sure no ngcc process is running then you should delete the lock-file at " + this.lockFile.path + ".)"));
        };
        return SyncLocker;
    }());
    exports.SyncLocker = SyncLocker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luY19sb2NrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvbG9ja2luZy9zeW5jX2xvY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFTQTs7Ozs7OztPQU9HO0lBQ0g7UUFDRSxvQkFBb0IsUUFBa0I7WUFBbEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFHLENBQUM7UUFFMUM7Ozs7O1dBS0c7UUFDSCx5QkFBSSxHQUFKLFVBQVEsRUFBVztZQUNqQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDZCxJQUFJO2dCQUNGLE9BQU8sRUFBRSxFQUFFLENBQUM7YUFDYjtvQkFBUztnQkFDUixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ3hCO1FBQ0gsQ0FBQztRQUVEOztXQUVHO1FBQ08sMkJBQU0sR0FBaEI7WUFDRSxJQUFJO2dCQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDdkI7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDVixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO29CQUN2QixNQUFNLENBQUMsQ0FBQztpQkFDVDtnQkFDRCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzthQUMvQjtRQUNILENBQUM7UUFFRDs7V0FFRztRQUNPLDJDQUFzQixHQUFoQztZQUNFLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakMsTUFBTSxJQUFJLEtBQUssQ0FDWCxnREFBOEMsR0FBRyxRQUFLO2dCQUN0RCxpS0FBaUs7aUJBQ2pLLHlGQUNJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxPQUFJLENBQUEsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFDSCxpQkFBQztJQUFELENBQUMsQUEzQ0QsSUEyQ0M7SUEzQ1ksZ0NBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7TG9ja0ZpbGV9IGZyb20gJy4vbG9ja19maWxlJztcblxuLyoqXG4gKiBTeW5jTG9ja2VyIGlzIHVzZWQgdG8gcHJldmVudCBtb3JlIHRoYW4gb25lIGluc3RhbmNlIG9mIG5nY2MgZXhlY3V0aW5nIGF0IHRoZSBzYW1lIHRpbWUsXG4gKiB3aGVuIGJlaW5nIGNhbGxlZCBpbiBhIHN5bmNocm9ub3VzIGNvbnRleHQuXG4gKlxuICogKiBXaGVuIG5nY2Mgc3RhcnRzIGV4ZWN1dGluZywgaXQgY3JlYXRlcyBhIGZpbGUgaW4gdGhlIGBjb21waWxlci1jbGkvbmdjY2AgZm9sZGVyLlxuICogKiBJZiBpdCBmaW5kcyBvbmUgaXMgYWxyZWFkeSB0aGVyZSB0aGVuIGl0IGZhaWxzIHdpdGggYSBzdWl0YWJsZSBlcnJvciBtZXNzYWdlLlxuICogKiBXaGVuIG5nY2MgY29tcGxldGVzIGV4ZWN1dGluZywgaXQgcmVtb3ZlcyB0aGUgZmlsZSBzbyB0aGF0IGZ1dHVyZSBuZ2NjIGV4ZWN1dGlvbnMgY2FuIHN0YXJ0LlxuICovXG5leHBvcnQgY2xhc3MgU3luY0xvY2tlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9ja0ZpbGU6IExvY2tGaWxlKSB7fVxuXG4gIC8qKlxuICAgKiBSdW4gdGhlIGdpdmVuIGZ1bmN0aW9uIGd1YXJkZWQgYnkgdGhlIGxvY2sgZmlsZS5cbiAgICpcbiAgICogQHBhcmFtIGZuIHRoZSBmdW5jdGlvbiB0byBydW4uXG4gICAqIEByZXR1cm5zIHRoZSB2YWx1ZSByZXR1cm5lZCBmcm9tIHRoZSBgZm5gIGNhbGwuXG4gICAqL1xuICBsb2NrPFQ+KGZuOiAoKSA9PiBUKTogVCB7XG4gICAgdGhpcy5jcmVhdGUoKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZuKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMubG9ja0ZpbGUucmVtb3ZlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdyaXRlIGEgbG9jayBmaWxlIHRvIGRpc2ssIG9yIGVycm9yIGlmIHRoZXJlIGlzIGFscmVhZHkgb25lIHRoZXJlLlxuICAgKi9cbiAgcHJvdGVjdGVkIGNyZWF0ZSgpOiB2b2lkIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5sb2NrRmlsZS53cml0ZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLmNvZGUgIT09ICdFRVhJU1QnKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgICB0aGlzLmhhbmRsZUV4aXN0aW5nTG9ja0ZpbGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhlIGxvY2stZmlsZSBhbHJlYWR5IGV4aXN0cyBzbyByYWlzZSBhIGhlbHBmdWwgZXJyb3IuXG4gICAqL1xuICBwcm90ZWN0ZWQgaGFuZGxlRXhpc3RpbmdMb2NrRmlsZSgpOiB2b2lkIHtcbiAgICBjb25zdCBwaWQgPSB0aGlzLmxvY2tGaWxlLnJlYWQoKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBuZ2NjIGlzIGFscmVhZHkgcnVubmluZyBhdCBwcm9jZXNzIHdpdGggaWQgJHtwaWR9LlxcbmAgK1xuICAgICAgICBgSWYgeW91IGFyZSBydW5uaW5nIG11bHRpcGxlIGJ1aWxkcyBpbiBwYXJhbGxlbCB0aGVuIHlvdSBtaWdodCB0cnkgcHJlLXByb2Nlc3NpbmcgeW91ciBub2RlX21vZHVsZXMgdmlhIHRoZSBjb21tYW5kIGxpbmUgbmdjYyB0b29sIGJlZm9yZSBzdGFydGluZyB0aGUgYnVpbGRzLlxcbmAgK1xuICAgICAgICBgKElmIHlvdSBhcmUgc3VyZSBubyBuZ2NjIHByb2Nlc3MgaXMgcnVubmluZyB0aGVuIHlvdSBzaG91bGQgZGVsZXRlIHRoZSBsb2NrLWZpbGUgYXQgJHtcbiAgICAgICAgICAgIHRoaXMubG9ja0ZpbGUucGF0aH0uKWApO1xuICB9XG59XG4iXX0=