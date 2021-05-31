/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/perf/src/recorder", ["require", "exports", "@angular/compiler-cli/src/ngtsc/perf/src/api", "@angular/compiler-cli/src/ngtsc/perf/src/clock"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DelegatingPerfRecorder = exports.ActivePerfRecorder = void 0;
    var api_1 = require("@angular/compiler-cli/src/ngtsc/perf/src/api");
    var clock_1 = require("@angular/compiler-cli/src/ngtsc/perf/src/clock");
    /**
     * A `PerfRecorder` that actively tracks performance statistics.
     */
    var ActivePerfRecorder = /** @class */ (function () {
        function ActivePerfRecorder(zeroTime) {
            this.zeroTime = zeroTime;
            this.currentPhase = api_1.PerfPhase.Unaccounted;
            this.currentPhaseEntered = this.zeroTime;
            this.counters = Array(api_1.PerfEvent.LAST).fill(0);
            this.phaseTime = Array(api_1.PerfPhase.LAST).fill(0);
            this.bytes = Array(api_1.PerfCheckpoint.LAST).fill(0);
            // Take an initial memory snapshot before any other compilation work begins.
            this.memory(api_1.PerfCheckpoint.Initial);
        }
        /**
         * Creates an `ActivePerfRecoder` with its zero point set to the current time.
         */
        ActivePerfRecorder.zeroedToNow = function () {
            return new ActivePerfRecorder(clock_1.mark());
        };
        ActivePerfRecorder.prototype.reset = function () {
            this.counters = Array(api_1.PerfEvent.LAST).fill(0);
            this.phaseTime = Array(api_1.PerfPhase.LAST).fill(0);
            this.bytes = Array(api_1.PerfCheckpoint.LAST).fill(0);
            this.zeroTime = clock_1.mark();
            this.currentPhase = api_1.PerfPhase.Unaccounted;
            this.currentPhaseEntered = this.zeroTime;
        };
        ActivePerfRecorder.prototype.memory = function (after) {
            this.bytes[after] = process.memoryUsage().heapUsed;
        };
        ActivePerfRecorder.prototype.phase = function (phase) {
            var previous = this.currentPhase;
            this.phaseTime[this.currentPhase] += clock_1.timeSinceInMicros(this.currentPhaseEntered);
            this.currentPhase = phase;
            this.currentPhaseEntered = clock_1.mark();
            return previous;
        };
        ActivePerfRecorder.prototype.inPhase = function (phase, fn) {
            var previousPhase = this.phase(phase);
            try {
                return fn();
            }
            finally {
                this.phase(previousPhase);
            }
        };
        ActivePerfRecorder.prototype.eventCount = function (counter, incrementBy) {
            if (incrementBy === void 0) { incrementBy = 1; }
            this.counters[counter] += incrementBy;
        };
        /**
         * Return the current performance metrics as a serializable object.
         */
        ActivePerfRecorder.prototype.finalize = function () {
            // Track the last segment of time spent in `this.currentPhase` in the time array.
            this.phase(api_1.PerfPhase.Unaccounted);
            var results = {
                events: {},
                phases: {},
                memory: {},
            };
            for (var i = 0; i < this.phaseTime.length; i++) {
                if (this.phaseTime[i] > 0) {
                    results.phases[api_1.PerfPhase[i]] = this.phaseTime[i];
                }
            }
            for (var i = 0; i < this.phaseTime.length; i++) {
                if (this.counters[i] > 0) {
                    results.events[api_1.PerfEvent[i]] = this.counters[i];
                }
            }
            for (var i = 0; i < this.bytes.length; i++) {
                if (this.bytes[i] > 0) {
                    results.memory[api_1.PerfCheckpoint[i]] = this.bytes[i];
                }
            }
            return results;
        };
        return ActivePerfRecorder;
    }());
    exports.ActivePerfRecorder = ActivePerfRecorder;
    /**
     * A `PerfRecorder` that delegates to a target `PerfRecorder` which can be updated later.
     *
     * `DelegatingPerfRecorder` is useful when a compiler class that needs a `PerfRecorder` can outlive
     * the current compilation. This is true for most compiler classes as resource-only changes reuse
     * the same `NgCompiler` for a new compilation.
     */
    var DelegatingPerfRecorder = /** @class */ (function () {
        function DelegatingPerfRecorder(target) {
            this.target = target;
        }
        DelegatingPerfRecorder.prototype.eventCount = function (counter, incrementBy) {
            this.target.eventCount(counter, incrementBy);
        };
        DelegatingPerfRecorder.prototype.phase = function (phase) {
            return this.target.phase(phase);
        };
        DelegatingPerfRecorder.prototype.inPhase = function (phase, fn) {
            // Note: this doesn't delegate to `this.target.inPhase` but instead is implemented manually here
            // to avoid adding an additional frame of noise to the stack when debugging.
            var previousPhase = this.target.phase(phase);
            try {
                return fn();
            }
            finally {
                this.target.phase(previousPhase);
            }
        };
        DelegatingPerfRecorder.prototype.memory = function (after) {
            this.target.memory(after);
        };
        DelegatingPerfRecorder.prototype.reset = function () {
            this.target.reset();
        };
        return DelegatingPerfRecorder;
    }());
    exports.DelegatingPerfRecorder = DelegatingPerfRecorder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3BlcmYvc3JjL3JlY29yZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILDhCQUE4Qjs7Ozs7Ozs7Ozs7OztJQUU5QixvRUFBeUU7SUFDekUsd0VBQXdEO0lBV3hEOztPQUVHO0lBQ0g7UUFlRSw0QkFBNEIsUUFBZ0I7WUFBaEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQVZwQyxpQkFBWSxHQUFHLGVBQVMsQ0FBQyxXQUFXLENBQUM7WUFDckMsd0JBQW1CLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQVUxQyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxlQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLGVBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsb0JBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFaEQsNEVBQTRFO1lBQzVFLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBZEQ7O1dBRUc7UUFDSSw4QkFBVyxHQUFsQjtZQUNFLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxZQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFXRCxrQ0FBSyxHQUFMO1lBQ0UsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsZUFBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJ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UUFDdEIsQ0FBQztRQUNILDZCQUFDO0lBQUQsQ0FBQyxBQTdCRCxJQTZCQztJQTdCWSx3REFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwibm9kZVwiIC8+XG5cbmltcG9ydCB7UGVyZkNoZWNrcG9pbnQsIFBlcmZFdmVudCwgUGVyZlBoYXNlLCBQZXJmUmVjb3JkZXJ9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7SHJUaW1lLCBtYXJrLCB0aW1lU2luY2VJbk1pY3Jvc30gZnJvbSAnLi9jbG9jayc7XG5cbi8qKlxuICogU2VyaWFsaXphYmxlIHBlcmZvcm1hbmNlIGRhdGEgZm9yIHRoZSBjb21waWxhdGlvbiwgdXNpbmcgc3RyaW5nIG5hbWVzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBlcmZSZXN1bHRzIHtcbiAgZXZlbnRzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuICBwaGFzZXM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gIG1lbW9yeTogUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcbn1cblxuLyoqXG4gKiBBIGBQZXJmUmVjb3JkZXJgIHRoYXQgYWN0aXZlbHkgdHJhY2tzIHBlcmZvcm1hbmNlIHN0YXRpc3RpY3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBBY3RpdmVQZXJmUmVjb3JkZXIgaW1wbGVtZW50cyBQZXJmUmVjb3JkZXIge1xuICBwcml2YXRlIGNvdW50ZXJzOiBudW1iZXJbXTtcbiAgcHJpdmF0ZSBwaGFzZVRpbWU6IG51bWJlcltdO1xuICBwcml2YXRlIGJ5dGVzOiBudW1iZXJbXTtcblxuICBwcml2YXRlIGN1cnJlbnRQaGFzZSA9IFBlcmZQaGFzZS5VbmFjY291bnRlZDtcbiAgcHJpdmF0ZSBjdXJyZW50UGhhc2VFbnRlcmVkID0gdGhpcy56ZXJvVGltZTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBgQWN0aXZlUGVyZlJlY29kZXJgIHdpdGggaXRzIHplcm8gcG9pbnQgc2V0IHRvIHRoZSBjdXJyZW50IHRpbWUuXG4gICAqL1xuICBzdGF0aWMgemVyb2VkVG9Ob3coKTogQWN0aXZlUGVyZlJlY29yZGVyIHtcbiAgICByZXR1cm4gbmV3IEFjdGl2ZVBlcmZSZWNvcmRlcihtYXJrKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3Rvcihwcml2YXRlIHplcm9UaW1lOiBIclRpbWUpIHtcbiAgICB0aGlzLmNvdW50ZXJzID0gQXJyYXkoUGVyZkV2ZW50LkxBU1QpLmZpbGwoMCk7XG4gICAgdGhpcy5waGFzZVRpbWUgPSBBcnJheShQZXJmUGhhc2UuTEFTVCkuZmlsbCgwKTtcbiAgICB0aGlzLmJ5dGVzID0gQXJyYXkoUGVyZkNoZWNrcG9pbnQuTEFTVCkuZmlsbCgwKTtcblxuICAgIC8vIFRha2UgYW4gaW5pdGlhbCBtZW1vcnkgc25hcHNob3QgYmVmb3JlIGFueSBvdGhlciBjb21waWxhdGlvbiB3b3JrIGJlZ2lucy5cbiAgICB0aGlzLm1lbW9yeShQZXJmQ2hlY2twb2ludC5Jbml0aWFsKTtcbiAgfVxuXG4gIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuY291bnRlcnMgPSBBcnJheShQZXJmRXZlbnQuTEFTVCkuZmlsbCgwKTtcbiAgICB0aGlzLnBoYXNlVGltZSA9IEFycmF5KFBlcmZQaGFzZS5MQVNUKS5maWxsKDApO1xuICAgIHRoaXMuYnl0ZXMgPSBBcnJheShQZXJmQ2hlY2twb2ludC5MQVNUKS5maWxsKDApO1xuICAgIHRoaXMuemVyb1RpbWUgPSBtYXJrKCk7XG4gICAgdGhpcy5jdXJyZW50UGhhc2UgPSBQZXJmUGhhc2UuVW5hY2NvdW50ZWQ7XG4gICAgdGhpcy5jdXJyZW50UGhhc2VFbnRlcmVkID0gdGhpcy56ZXJvVGltZTtcbiAgfVxuXG4gIG1lbW9yeShhZnRlcjogUGVyZkNoZWNrcG9pbnQpOiB2b2lkIHtcbiAgICB0aGlzLmJ5dGVzW2FmdGVyXSA9IHByb2Nlc3MubWVtb3J5VXNhZ2UoKS5oZWFwVXNlZDtcbiAgfVxuXG4gIHBoYXNlKHBoYXNlOiBQZXJmUGhhc2UpOiBQZXJmUGhhc2Uge1xuICAgIGNvbnN0IHByZXZpb3VzID0gdGhpcy5jdXJyZW50UGhhc2U7XG4gICAgdGhpcy5waGFzZVRpbWVbdGhpcy5jdXJyZW50UGhhc2VdICs9IHRpbWVTaW5jZUluTWljcm9zKHRoaXMuY3VycmVudFBoYXNlRW50ZXJlZCk7XG4gICAgdGhpcy5jdXJyZW50UGhhc2UgPSBwaGFzZTtcbiAgICB0aGlzLmN1cnJlbnRQaGFzZUVudGVyZWQgPSBtYXJrKCk7XG4gICAgcmV0dXJuIHByZXZpb3VzO1xuICB9XG5cbiAgaW5QaGFzZTxUPihwaGFzZTogUGVyZlBoYXNlLCBmbjogKCkgPT4gVCk6IFQge1xuICAgIGNvbnN0IHByZXZpb3VzUGhhc2UgPSB0aGlzLnBoYXNlKHBoYXNlKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZuKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMucGhhc2UocHJldmlvdXNQaGFzZSk7XG4gICAgfVxuICB9XG5cbiAgZXZlbnRDb3VudChjb3VudGVyOiBQZXJmRXZlbnQsIGluY3JlbWVudEJ5OiBudW1iZXIgPSAxKTogdm9pZCB7XG4gICAgdGhpcy5jb3VudGVyc1tjb3VudGVyXSArPSBpbmNyZW1lbnRCeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIGN1cnJlbnQgcGVyZm9ybWFuY2UgbWV0cmljcyBhcyBhIHNlcmlhbGl6YWJsZSBvYmplY3QuXG4gICAqL1xuICBmaW5hbGl6ZSgpOiBQZXJmUmVzdWx0cyB7XG4gICAgLy8gVHJhY2sgdGhlIGxhc3Qgc2VnbWVudCBvZiB0aW1lIHNwZW50IGluIGB0aGlzLmN1cnJlbnRQaGFzZWAgaW4gdGhlIHRpbWUgYXJyYXkuXG4gICAgdGhpcy5waGFzZShQZXJmUGhhc2UuVW5hY2NvdW50ZWQpO1xuXG4gICAgY29uc3QgcmVzdWx0czogUGVyZlJlc3VsdHMgPSB7XG4gICAgICBldmVudHM6IHt9LFxuICAgICAgcGhhc2VzOiB7fSxcbiAgICAgIG1lbW9yeToge30sXG4gICAgfTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5waGFzZVRpbWUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnBoYXNlVGltZVtpXSA+IDApIHtcbiAgICAgICAgcmVzdWx0cy5waGFzZXNbUGVyZlBoYXNlW2ldXSA9IHRoaXMucGhhc2VUaW1lW2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5waGFzZVRpbWUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmNvdW50ZXJzW2ldID4gMCkge1xuICAgICAgICByZXN1bHRzLmV2ZW50c1tQZXJmRXZlbnRbaV1dID0gdGhpcy5jb3VudGVyc1tpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYnl0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmJ5dGVzW2ldID4gMCkge1xuICAgICAgICByZXN1bHRzLm1lbW9yeVtQZXJmQ2hlY2twb2ludFtpXV0gPSB0aGlzLmJ5dGVzW2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59XG5cbi8qKlxuICogQSBgUGVyZlJlY29yZGVyYCB0aGF0IGRlbGVnYXRlcyB0byBhIHRhcmdldCBgUGVyZlJlY29yZGVyYCB3aGljaCBjYW4gYmUgdXBkYXRlZCBsYXRlci5cbiAqXG4gKiBgRGVsZWdhdGluZ1BlcmZSZWNvcmRlcmAgaXMgdXNlZnVsIHdoZW4gYSBjb21waWxlciBjbGFzcyB0aGF0IG5lZWRzIGEgYFBlcmZSZWNvcmRlcmAgY2FuIG91dGxpdmVcbiAqIHRoZSBjdXJyZW50IGNvbXBpbGF0aW9uLiBUaGlzIGlzIHRydWUgZm9yIG1vc3QgY29tcGlsZXIgY2xhc3NlcyBhcyByZXNvdXJjZS1vbmx5IGNoYW5nZXMgcmV1c2VcbiAqIHRoZSBzYW1lIGBOZ0NvbXBpbGVyYCBmb3IgYSBuZXcgY29tcGlsYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWxlZ2F0aW5nUGVyZlJlY29yZGVyIGltcGxlbWVudHMgUGVyZlJlY29yZGVyIHtcbiAgY29uc3RydWN0b3IocHVibGljIHRhcmdldDogUGVyZlJlY29yZGVyKSB7fVxuXG4gIGV2ZW50Q291bnQoY291bnRlcjogUGVyZkV2ZW50LCBpbmNyZW1lbnRCeT86IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMudGFyZ2V0LmV2ZW50Q291bnQoY291bnRlciwgaW5jcmVtZW50QnkpO1xuICB9XG5cbiAgcGhhc2UocGhhc2U6IFBlcmZQaGFzZSk6IFBlcmZQaGFzZSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0LnBoYXNlKHBoYXNlKTtcbiAgfVxuXG4gIGluUGhhc2U8VD4ocGhhc2U6IFBlcmZQaGFzZSwgZm46ICgpID0+IFQpOiBUIHtcbiAgICAvLyBOb3RlOiB0aGlzIGRvZXNuJ3QgZGVsZWdhdGUgdG8gYHRoaXMudGFyZ2V0LmluUGhhc2VgIGJ1dCBpbnN0ZWFkIGlzIGltcGxlbWVudGVkIG1hbnVhbGx5IGhlcmVcbiAgICAvLyB0byBhdm9pZCBhZGRpbmcgYW4gYWRkaXRpb25hbCBmcmFtZSBvZiBub2lzZSB0byB0aGUgc3RhY2sgd2hlbiBkZWJ1Z2dpbmcuXG4gICAgY29uc3QgcHJldmlvdXNQaGFzZSA9IHRoaXMudGFyZ2V0LnBoYXNlKHBoYXNlKTtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZuKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMudGFyZ2V0LnBoYXNlKHByZXZpb3VzUGhhc2UpO1xuICAgIH1cbiAgfVxuXG4gIG1lbW9yeShhZnRlcjogUGVyZkNoZWNrcG9pbnQpOiB2b2lkIHtcbiAgICB0aGlzLnRhcmdldC5tZW1vcnkoYWZ0ZXIpO1xuICB9XG5cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy50YXJnZXQucmVzZXQoKTtcbiAgfVxufVxuIl19