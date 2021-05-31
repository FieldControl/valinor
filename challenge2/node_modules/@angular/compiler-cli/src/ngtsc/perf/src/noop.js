(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/perf/src/noop", ["require", "exports", "@angular/compiler-cli/src/ngtsc/perf/src/api"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NOOP_PERF_RECORDER = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var api_1 = require("@angular/compiler-cli/src/ngtsc/perf/src/api");
    var NoopPerfRecorder = /** @class */ (function () {
        function NoopPerfRecorder() {
        }
        NoopPerfRecorder.prototype.eventCount = function () { };
        NoopPerfRecorder.prototype.memory = function () { };
        NoopPerfRecorder.prototype.phase = function () {
            return api_1.PerfPhase.Unaccounted;
        };
        NoopPerfRecorder.prototype.inPhase = function (phase, fn) {
            return fn();
        };
        NoopPerfRecorder.prototype.reset = function () { };
        return NoopPerfRecorder;
    }());
    exports.NOOP_PERF_RECORDER = new NoopPerfRecorder();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvcGVyZi9zcmMvbm9vcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxvRUFBOEM7SUFFOUM7UUFBQTtRQWNBLENBQUM7UUFiQyxxQ0FBVSxHQUFWLGNBQW9CLENBQUM7UUFFckIsaUNBQU0sR0FBTixjQUFnQixDQUFDO1FBRWpCLGdDQUFLLEdBQUw7WUFDRSxPQUFPLGVBQVMsQ0FBQyxXQUFXLENBQUM7UUFDL0IsQ0FBQztRQUVELGtDQUFPLEdBQVAsVUFBVyxLQUFnQixFQUFFLEVBQVc7WUFDdEMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFFRCxnQ0FBSyxHQUFMLGNBQWUsQ0FBQztRQUNsQix1QkFBQztJQUFELENBQUMsQUFkRCxJQWNDO0lBR1ksUUFBQSxrQkFBa0IsR0FBaUIsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1BlcmZQaGFzZSwgUGVyZlJlY29yZGVyfSBmcm9tICcuL2FwaSc7XG5cbmNsYXNzIE5vb3BQZXJmUmVjb3JkZXIgaW1wbGVtZW50cyBQZXJmUmVjb3JkZXIge1xuICBldmVudENvdW50KCk6IHZvaWQge31cblxuICBtZW1vcnkoKTogdm9pZCB7fVxuXG4gIHBoYXNlKCk6IFBlcmZQaGFzZSB7XG4gICAgcmV0dXJuIFBlcmZQaGFzZS5VbmFjY291bnRlZDtcbiAgfVxuXG4gIGluUGhhc2U8VD4ocGhhc2U6IFBlcmZQaGFzZSwgZm46ICgpID0+IFQpOiBUIHtcbiAgICByZXR1cm4gZm4oKTtcbiAgfVxuXG4gIHJlc2V0KCk6IHZvaWQge31cbn1cblxuXG5leHBvcnQgY29uc3QgTk9PUF9QRVJGX1JFQ09SREVSOiBQZXJmUmVjb3JkZXIgPSBuZXcgTm9vcFBlcmZSZWNvcmRlcigpO1xuIl19