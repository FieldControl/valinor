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
        define("@angular/compiler-cli/src/ngtsc/logging/src/logger", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LogLevel = void 0;
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["debug"] = 0] = "debug";
        LogLevel[LogLevel["info"] = 1] = "info";
        LogLevel[LogLevel["warn"] = 2] = "warn";
        LogLevel[LogLevel["error"] = 3] = "error";
    })(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9sb2dnaW5nL3NyYy9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBY0gsSUFBWSxRQUtYO0lBTEQsV0FBWSxRQUFRO1FBQ2xCLHlDQUFLLENBQUE7UUFDTCx1Q0FBSSxDQUFBO1FBQ0osdUNBQUksQ0FBQTtRQUNKLHlDQUFLLENBQUE7SUFDUCxDQUFDLEVBTFcsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUFLbkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBJbXBsZW1lbnQgdGhpcyBpbnRlcmZhY2UgaWYgeW91IHdhbnQgdG8gcHJvdmlkZSBkaWZmZXJlbnQgbG9nZ2luZ1xuICogb3V0cHV0IGZyb20gdGhlIHN0YW5kYXJkIENvbnNvbGVMb2dnZXIuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyIHtcbiAgbGV2ZWw6IExvZ0xldmVsO1xuICBkZWJ1ZyguLi5hcmdzOiBzdHJpbmdbXSk6IHZvaWQ7XG4gIGluZm8oLi4uYXJnczogc3RyaW5nW10pOiB2b2lkO1xuICB3YXJuKC4uLmFyZ3M6IHN0cmluZ1tdKTogdm9pZDtcbiAgZXJyb3IoLi4uYXJnczogc3RyaW5nW10pOiB2b2lkO1xufVxuXG5leHBvcnQgZW51bSBMb2dMZXZlbCB7XG4gIGRlYnVnLFxuICBpbmZvLFxuICB3YXJuLFxuICBlcnJvcixcbn1cbiJdfQ==