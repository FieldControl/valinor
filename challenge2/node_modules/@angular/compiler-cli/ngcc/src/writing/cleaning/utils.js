(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/writing/cleaning/utils", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isLocalDirectory = void 0;
    /**
     * Returns true if the given `path` is a directory (not a symlink) and actually exists.
     *
     * @param fs the current filesystem
     * @param path the path to check
     */
    function isLocalDirectory(fs, path) {
        if (fs.exists(path)) {
            var stat = fs.lstat(path);
            return stat.isDirectory();
        }
        else {
            return false;
        }
    }
    exports.isLocalDirectory = isLocalDirectory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvd3JpdGluZy9jbGVhbmluZy91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFTQTs7Ozs7T0FLRztJQUNILFNBQWdCLGdCQUFnQixDQUFDLEVBQXNCLEVBQUUsSUFBb0I7UUFDM0UsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ25CLElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDM0I7YUFBTTtZQUNMLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7SUFDSCxDQUFDO0lBUEQsNENBT0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIFJlYWRvbmx5RmlsZVN5c3RlbX0gZnJvbSAnLi4vLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIGBwYXRoYCBpcyBhIGRpcmVjdG9yeSAobm90IGEgc3ltbGluaykgYW5kIGFjdHVhbGx5IGV4aXN0cy5cbiAqXG4gKiBAcGFyYW0gZnMgdGhlIGN1cnJlbnQgZmlsZXN5c3RlbVxuICogQHBhcmFtIHBhdGggdGhlIHBhdGggdG8gY2hlY2tcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzTG9jYWxEaXJlY3RvcnkoZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSwgcGF0aDogQWJzb2x1dGVGc1BhdGgpOiBib29sZWFuIHtcbiAgaWYgKGZzLmV4aXN0cyhwYXRoKSkge1xuICAgIGNvbnN0IHN0YXQgPSBmcy5sc3RhdChwYXRoKTtcbiAgICByZXR1cm4gc3RhdC5pc0RpcmVjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19