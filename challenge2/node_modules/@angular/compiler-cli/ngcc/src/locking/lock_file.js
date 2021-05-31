(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/locking/lock_file", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLockFilePath = void 0;
    function getLockFilePath(fs) {
        return fs.resolve(require.resolve('@angular/compiler-cli/ngcc'), '../__ngcc_lock_file__');
    }
    exports.getLockFilePath = getLockFilePath;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9ja19maWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2xvY2tpbmcvbG9ja19maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQVNBLFNBQWdCLGVBQWUsQ0FBQyxFQUFvQjtRQUNsRCxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDNUYsQ0FBQztJQUZELDBDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBQYXRoTWFuaXB1bGF0aW9ufSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9ja0ZpbGVQYXRoKGZzOiBQYXRoTWFuaXB1bGF0aW9uKSB7XG4gIHJldHVybiBmcy5yZXNvbHZlKHJlcXVpcmUucmVzb2x2ZSgnQGFuZ3VsYXIvY29tcGlsZXItY2xpL25nY2MnKSwgJy4uL19fbmdjY19sb2NrX2ZpbGVfXycpO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvY2tGaWxlIHtcbiAgcGF0aDogQWJzb2x1dGVGc1BhdGg7XG4gIC8qKlxuICAgKiBXcml0ZSBhIGxvY2sgZmlsZSB0byBkaXNrIGNvbnRhaW5pbmcgdGhlIFBJRCBvZiB0aGUgY3VycmVudCBwcm9jZXNzLlxuICAgKi9cbiAgd3JpdGUoKTogdm9pZDtcblxuICAvKipcbiAgICogUmVhZCB0aGUgUElELCBvZiB0aGUgcHJvY2VzcyBob2xkaW5nIHRoZSBsb2NrLCBmcm9tIHRoZSBsb2NrLWZpbGUuXG4gICAqXG4gICAqIEl0IGlzIGZlYXNpYmxlIHRoYXQgdGhlIGxvY2stZmlsZSB3YXMgcmVtb3ZlZCBiZXR3ZWVuIHRoZSBjYWxsIHRvIGB3cml0ZSgpYCB0aGF0IGVmZmVjdGl2ZWx5XG4gICAqIGNoZWNrcyBmb3IgZXhpc3RlbmNlIGFuZCB0aGlzIGF0dGVtcHQgdG8gcmVhZCB0aGUgZmlsZS4gSWYgc28gdGhlbiB0aGlzIG1ldGhvZCBzaG91bGQganVzdFxuICAgKiBncmFjZWZ1bGx5IHJldHVybiBgXCJ7dW5rbm93bn1cImAuXG4gICAqL1xuICByZWFkKCk6IHN0cmluZztcblxuICAvKipcbiAgICogUmVtb3ZlIHRoZSBsb2NrIGZpbGUgZnJvbSBkaXNrLCB3aGV0aGVyIG9yIG5vdCBpdCBleGlzdHMuXG4gICAqL1xuICByZW1vdmUoKTogdm9pZDtcbn1cbiJdfQ==