"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSendOperationsAsTrace = void 0;
const lru_cache_1 = __importDefault(require("lru-cache"));
const iterateOverTrace_js_1 = require("./iterateOverTrace.js");
const durationHistogram_js_1 = require("./durationHistogram.js");
function defaultSendOperationsAsTrace() {
    const cache = new lru_cache_1.default({
        maxSize: Math.pow(2, 20),
        sizeCalculation: (_val, key) => {
            return (key && Buffer.byteLength(key)) || 0;
        },
    });
    return (trace, statsReportKey) => {
        const endTimeSeconds = trace.endTime?.seconds;
        if (endTimeSeconds == null) {
            throw Error('programming error: endTime not set on trace');
        }
        const hasErrors = traceHasErrors(trace);
        const cacheKey = JSON.stringify([
            statsReportKey,
            durationHistogram_js_1.DurationHistogram.durationToBucket(trace.durationNs),
            Math.floor(endTimeSeconds / 60),
            hasErrors ? Math.floor(endTimeSeconds / 5) : '',
        ]);
        if (cache.get(cacheKey)) {
            return false;
        }
        cache.set(cacheKey, true);
        return true;
    };
}
exports.defaultSendOperationsAsTrace = defaultSendOperationsAsTrace;
function traceHasErrors(trace) {
    let hasErrors = false;
    function traceNodeStats(node) {
        if ((node.error?.length ?? 0) > 0) {
            hasErrors = true;
        }
        return hasErrors;
    }
    (0, iterateOverTrace_js_1.iterateOverTrace)(trace, traceNodeStats, false);
    return hasErrors;
}
//# sourceMappingURL=defaultSendOperationsAsTrace.js.map