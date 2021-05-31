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
        define("@angular/compiler-cli/src/ngtsc/incremental/src/strategy", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PatchedProgramIncrementalBuildStrategy = exports.TrackedIncrementalBuildStrategy = exports.NoopIncrementalBuildStrategy = void 0;
    /**
     * A noop implementation of `IncrementalBuildStrategy` which neither returns nor tracks any
     * incremental data.
     */
    var NoopIncrementalBuildStrategy = /** @class */ (function () {
        function NoopIncrementalBuildStrategy() {
        }
        NoopIncrementalBuildStrategy.prototype.getIncrementalState = function () {
            return null;
        };
        NoopIncrementalBuildStrategy.prototype.setIncrementalState = function () { };
        NoopIncrementalBuildStrategy.prototype.toNextBuildStrategy = function () {
            return this;
        };
        return NoopIncrementalBuildStrategy;
    }());
    exports.NoopIncrementalBuildStrategy = NoopIncrementalBuildStrategy;
    /**
     * Tracks an `IncrementalDriver` within the strategy itself.
     */
    var TrackedIncrementalBuildStrategy = /** @class */ (function () {
        function TrackedIncrementalBuildStrategy() {
            this.state = null;
            this.isSet = false;
        }
        TrackedIncrementalBuildStrategy.prototype.getIncrementalState = function () {
            return this.state;
        };
        TrackedIncrementalBuildStrategy.prototype.setIncrementalState = function (state) {
            this.state = state;
            this.isSet = true;
        };
        TrackedIncrementalBuildStrategy.prototype.toNextBuildStrategy = function () {
            var strategy = new TrackedIncrementalBuildStrategy();
            // Only reuse state that was explicitly set via `setIncrementalState`.
            strategy.state = this.isSet ? this.state : null;
            return strategy;
        };
        return TrackedIncrementalBuildStrategy;
    }());
    exports.TrackedIncrementalBuildStrategy = TrackedIncrementalBuildStrategy;
    /**
     * Manages the `IncrementalDriver` associated with a `ts.Program` by monkey-patching it onto the
     * program under `SYM_INCREMENTAL_DRIVER`.
     */
    var PatchedProgramIncrementalBuildStrategy = /** @class */ (function () {
        function PatchedProgramIncrementalBuildStrategy() {
        }
        PatchedProgramIncrementalBuildStrategy.prototype.getIncrementalState = function (program) {
            var state = program[SYM_INCREMENTAL_STATE];
            if (state === undefined) {
                return null;
            }
            return state;
        };
        PatchedProgramIncrementalBuildStrategy.prototype.setIncrementalState = function (state, program) {
            program[SYM_INCREMENTAL_STATE] = state;
        };
        PatchedProgramIncrementalBuildStrategy.prototype.toNextBuildStrategy = function () {
            return this;
        };
        return PatchedProgramIncrementalBuildStrategy;
    }());
    exports.PatchedProgramIncrementalBuildStrategy = PatchedProgramIncrementalBuildStrategy;
    /**
     * Symbol under which the `IncrementalDriver` is stored on a `ts.Program`.
     *
     * The TS model of incremental compilation is based around reuse of a previous `ts.Program` in the
     * construction of a new one. The `NgCompiler` follows this abstraction - passing in a previous
     * `ts.Program` is sufficient to trigger incremental compilation. This previous `ts.Program` need
     * not be from an Angular compilation (that is, it need not have been created from `NgCompiler`).
     *
     * If it is, though, Angular can benefit from reusing previous analysis work. This reuse is managed
     * by the `IncrementalDriver`, which is inherited from the old program to the new program. To
     * support this behind the API of passing an old `ts.Program`, the `IncrementalDriver` is stored on
     * the `ts.Program` under this symbol.
     */
    var SYM_INCREMENTAL_STATE = Symbol('NgIncrementalState');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2luY3JlbWVudGFsL3NyYy9zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUE0Qkg7OztPQUdHO0lBQ0g7UUFBQTtRQVVBLENBQUM7UUFUQywwREFBbUIsR0FBbkI7WUFDRSxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCwwREFBbUIsR0FBbkIsY0FBNkIsQ0FBQztRQUU5QiwwREFBbUIsR0FBbkI7WUFDRSxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDSCxtQ0FBQztJQUFELENBQUMsQUFWRCxJQVVDO0lBVlksb0VBQTRCO0lBWXpDOztPQUVHO0lBQ0g7UUFBQTtZQUNVLFVBQUssR0FBMEIsSUFBSSxDQUFDO1lBQ3BDLFVBQUssR0FBWSxLQUFLLENBQUM7UUFpQmpDLENBQUM7UUFmQyw2REFBbUIsR0FBbkI7WUFDRSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDcEIsQ0FBQztRQUVELDZEQUFtQixHQUFuQixVQUFvQixLQUF1QjtZQUN6QyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNwQixDQUFDO1FBRUQsNkRBQW1CLEdBQW5CO1lBQ0UsSUFBTSxRQUFRLEdBQUcsSUFBSSwrQkFBK0IsRUFBRSxDQUFDO1lBQ3ZELHNFQUFzRTtZQUN0RSxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNoRCxPQUFPLFFBQVEsQ0FBQztRQUNsQixDQUFDO1FBQ0gsc0NBQUM7SUFBRCxDQUFDLEFBbkJELElBbUJDO0lBbkJZLDBFQUErQjtJQXFCNUM7OztPQUdHO0lBQ0g7UUFBQTtRQWdCQSxDQUFDO1FBZkMsb0VBQW1CLEdBQW5CLFVBQW9CLE9BQW1CO1lBQ3JDLElBQU0sS0FBSyxHQUFJLE9BQW1DLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUMxRSxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFFRCxvRUFBbUIsR0FBbkIsVUFBb0IsS0FBdUIsRUFBRSxPQUFtQjtZQUM3RCxPQUFtQyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3RFLENBQUM7UUFFRCxvRUFBbUIsR0FBbkI7WUFDRSxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDSCw2Q0FBQztJQUFELENBQUMsQUFoQkQsSUFnQkM7SUFoQlksd0ZBQXNDO0lBbUJuRDs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxJQUFNLHFCQUFxQixHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtJbmNyZW1lbnRhbFN0YXRlfSBmcm9tICcuL3N0YXRlJztcblxuLyoqXG4gKiBTdHJhdGVneSB1c2VkIHRvIG1hbmFnZSB0aGUgYXNzb2NpYXRpb24gYmV0d2VlbiBhIGB0cy5Qcm9ncmFtYCBhbmQgdGhlIGBJbmNyZW1lbnRhbERyaXZlcmAgd2hpY2hcbiAqIHJlcHJlc2VudHMgdGhlIHJldXNhYmxlIEFuZ3VsYXIgcGFydCBvZiBpdHMgY29tcGlsYXRpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5IHtcbiAgLyoqXG4gICAqIERldGVybWluZSB0aGUgQW5ndWxhciBgSW5jcmVtZW50YWxEcml2ZXJgIGZvciB0aGUgZ2l2ZW4gYHRzLlByb2dyYW1gLCBpZiBvbmUgaXMgYXZhaWxhYmxlLlxuICAgKi9cbiAgZ2V0SW5jcmVtZW50YWxTdGF0ZShwcm9ncmFtOiB0cy5Qcm9ncmFtKTogSW5jcmVtZW50YWxTdGF0ZXxudWxsO1xuXG4gIC8qKlxuICAgKiBBc3NvY2lhdGUgdGhlIGdpdmVuIGBJbmNyZW1lbnRhbERyaXZlcmAgd2l0aCB0aGUgZ2l2ZW4gYHRzLlByb2dyYW1gIGFuZCBtYWtlIGl0IGF2YWlsYWJsZSB0b1xuICAgKiBmdXR1cmUgY29tcGlsYXRpb25zLlxuICAgKi9cbiAgc2V0SW5jcmVtZW50YWxTdGF0ZShkcml2ZXI6IEluY3JlbWVudGFsU3RhdGUsIHByb2dyYW06IHRzLlByb2dyYW0pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHRoaXMgYEluY3JlbWVudGFsQnVpbGRTdHJhdGVneWAgaW50byBhIHBvc3NpYmx5IG5ldyBpbnN0YW5jZSB0byBiZSB1c2VkIGluIHRoZSBuZXh0XG4gICAqIGluY3JlbWVudGFsIGNvbXBpbGF0aW9uIChtYXkgYmUgYSBuby1vcCBpZiB0aGUgc3RyYXRlZ3kgaXMgbm90IHN0YXRlZnVsKS5cbiAgICovXG4gIHRvTmV4dEJ1aWxkU3RyYXRlZ3koKTogSW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5O1xufVxuXG4vKipcbiAqIEEgbm9vcCBpbXBsZW1lbnRhdGlvbiBvZiBgSW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5YCB3aGljaCBuZWl0aGVyIHJldHVybnMgbm9yIHRyYWNrcyBhbnlcbiAqIGluY3JlbWVudGFsIGRhdGEuXG4gKi9cbmV4cG9ydCBjbGFzcyBOb29wSW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5IGltcGxlbWVudHMgSW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5IHtcbiAgZ2V0SW5jcmVtZW50YWxTdGF0ZSgpOiBudWxsIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHNldEluY3JlbWVudGFsU3RhdGUoKTogdm9pZCB7fVxuXG4gIHRvTmV4dEJ1aWxkU3RyYXRlZ3koKTogSW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuXG4vKipcbiAqIFRyYWNrcyBhbiBgSW5jcmVtZW50YWxEcml2ZXJgIHdpdGhpbiB0aGUgc3RyYXRlZ3kgaXRzZWxmLlxuICovXG5leHBvcnQgY2xhc3MgVHJhY2tlZEluY3JlbWVudGFsQnVpbGRTdHJhdGVneSBpbXBsZW1lbnRzIEluY3JlbWVudGFsQnVpbGRTdHJhdGVneSB7XG4gIHByaXZhdGUgc3RhdGU6IEluY3JlbWVudGFsU3RhdGV8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaXNTZXQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBnZXRJbmNyZW1lbnRhbFN0YXRlKCk6IEluY3JlbWVudGFsU3RhdGV8bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGU7XG4gIH1cblxuICBzZXRJbmNyZW1lbnRhbFN0YXRlKHN0YXRlOiBJbmNyZW1lbnRhbFN0YXRlKTogdm9pZCB7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuaXNTZXQgPSB0cnVlO1xuICB9XG5cbiAgdG9OZXh0QnVpbGRTdHJhdGVneSgpOiBUcmFja2VkSW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5IHtcbiAgICBjb25zdCBzdHJhdGVneSA9IG5ldyBUcmFja2VkSW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5KCk7XG4gICAgLy8gT25seSByZXVzZSBzdGF0ZSB0aGF0IHdhcyBleHBsaWNpdGx5IHNldCB2aWEgYHNldEluY3JlbWVudGFsU3RhdGVgLlxuICAgIHN0cmF0ZWd5LnN0YXRlID0gdGhpcy5pc1NldCA/IHRoaXMuc3RhdGUgOiBudWxsO1xuICAgIHJldHVybiBzdHJhdGVneTtcbiAgfVxufVxuXG4vKipcbiAqIE1hbmFnZXMgdGhlIGBJbmNyZW1lbnRhbERyaXZlcmAgYXNzb2NpYXRlZCB3aXRoIGEgYHRzLlByb2dyYW1gIGJ5IG1vbmtleS1wYXRjaGluZyBpdCBvbnRvIHRoZVxuICogcHJvZ3JhbSB1bmRlciBgU1lNX0lOQ1JFTUVOVEFMX0RSSVZFUmAuXG4gKi9cbmV4cG9ydCBjbGFzcyBQYXRjaGVkUHJvZ3JhbUluY3JlbWVudGFsQnVpbGRTdHJhdGVneSBpbXBsZW1lbnRzIEluY3JlbWVudGFsQnVpbGRTdHJhdGVneSB7XG4gIGdldEluY3JlbWVudGFsU3RhdGUocHJvZ3JhbTogdHMuUHJvZ3JhbSk6IEluY3JlbWVudGFsU3RhdGV8bnVsbCB7XG4gICAgY29uc3Qgc3RhdGUgPSAocHJvZ3JhbSBhcyBNYXlIYXZlSW5jcmVtZW50YWxTdGF0ZSlbU1lNX0lOQ1JFTUVOVEFMX1NUQVRFXTtcbiAgICBpZiAoc3RhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIHNldEluY3JlbWVudGFsU3RhdGUoc3RhdGU6IEluY3JlbWVudGFsU3RhdGUsIHByb2dyYW06IHRzLlByb2dyYW0pOiB2b2lkIHtcbiAgICAocHJvZ3JhbSBhcyBNYXlIYXZlSW5jcmVtZW50YWxTdGF0ZSlbU1lNX0lOQ1JFTUVOVEFMX1NUQVRFXSA9IHN0YXRlO1xuICB9XG5cbiAgdG9OZXh0QnVpbGRTdHJhdGVneSgpOiBJbmNyZW1lbnRhbEJ1aWxkU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cblxuLyoqXG4gKiBTeW1ib2wgdW5kZXIgd2hpY2ggdGhlIGBJbmNyZW1lbnRhbERyaXZlcmAgaXMgc3RvcmVkIG9uIGEgYHRzLlByb2dyYW1gLlxuICpcbiAqIFRoZSBUUyBtb2RlbCBvZiBpbmNyZW1lbnRhbCBjb21waWxhdGlvbiBpcyBiYXNlZCBhcm91bmQgcmV1c2Ugb2YgYSBwcmV2aW91cyBgdHMuUHJvZ3JhbWAgaW4gdGhlXG4gKiBjb25zdHJ1Y3Rpb24gb2YgYSBuZXcgb25lLiBUaGUgYE5nQ29tcGlsZXJgIGZvbGxvd3MgdGhpcyBhYnN0cmFjdGlvbiAtIHBhc3NpbmcgaW4gYSBwcmV2aW91c1xuICogYHRzLlByb2dyYW1gIGlzIHN1ZmZpY2llbnQgdG8gdHJpZ2dlciBpbmNyZW1lbnRhbCBjb21waWxhdGlvbi4gVGhpcyBwcmV2aW91cyBgdHMuUHJvZ3JhbWAgbmVlZFxuICogbm90IGJlIGZyb20gYW4gQW5ndWxhciBjb21waWxhdGlvbiAodGhhdCBpcywgaXQgbmVlZCBub3QgaGF2ZSBiZWVuIGNyZWF0ZWQgZnJvbSBgTmdDb21waWxlcmApLlxuICpcbiAqIElmIGl0IGlzLCB0aG91Z2gsIEFuZ3VsYXIgY2FuIGJlbmVmaXQgZnJvbSByZXVzaW5nIHByZXZpb3VzIGFuYWx5c2lzIHdvcmsuIFRoaXMgcmV1c2UgaXMgbWFuYWdlZFxuICogYnkgdGhlIGBJbmNyZW1lbnRhbERyaXZlcmAsIHdoaWNoIGlzIGluaGVyaXRlZCBmcm9tIHRoZSBvbGQgcHJvZ3JhbSB0byB0aGUgbmV3IHByb2dyYW0uIFRvXG4gKiBzdXBwb3J0IHRoaXMgYmVoaW5kIHRoZSBBUEkgb2YgcGFzc2luZyBhbiBvbGQgYHRzLlByb2dyYW1gLCB0aGUgYEluY3JlbWVudGFsRHJpdmVyYCBpcyBzdG9yZWQgb25cbiAqIHRoZSBgdHMuUHJvZ3JhbWAgdW5kZXIgdGhpcyBzeW1ib2wuXG4gKi9cbmNvbnN0IFNZTV9JTkNSRU1FTlRBTF9TVEFURSA9IFN5bWJvbCgnTmdJbmNyZW1lbnRhbFN0YXRlJyk7XG5cbmludGVyZmFjZSBNYXlIYXZlSW5jcmVtZW50YWxTdGF0ZSB7XG4gIFtTWU1fSU5DUkVNRU5UQUxfU1RBVEVdPzogSW5jcmVtZW50YWxTdGF0ZTtcbn1cbiJdfQ==