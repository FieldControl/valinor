import LRUCache from 'lru-cache';
import { iterateOverTrace } from './iterateOverTrace.js';
import { DurationHistogram } from './durationHistogram.js';
export function defaultSendOperationsAsTrace() {
    const cache = new LRUCache({
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
            DurationHistogram.durationToBucket(trace.durationNs),
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
function traceHasErrors(trace) {
    let hasErrors = false;
    function traceNodeStats(node) {
        if ((node.error?.length ?? 0) > 0) {
            hasErrors = true;
        }
        return hasErrors;
    }
    iterateOverTrace(trace, traceNodeStats, false);
    return hasErrors;
}
//# sourceMappingURL=defaultSendOperationsAsTrace.js.map