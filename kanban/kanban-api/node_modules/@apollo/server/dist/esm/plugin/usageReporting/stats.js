import { Trace, } from '@apollo/usage-reporting-protobuf';
import { DurationHistogram } from './durationHistogram.js';
import { iterateOverTrace } from './iterateOverTrace.js';
export class SizeEstimator {
    constructor() {
        this.bytes = 0;
    }
}
export class OurReport {
    constructor(header) {
        this.header = header;
        this.tracesPreAggregated = false;
        this.tracesPerQuery = Object.create(null);
        this.endTime = null;
        this.operationCount = 0;
        this.sizeEstimator = new SizeEstimator();
    }
    ensureCountsAreIntegers() {
        for (const tracesAndStats of Object.values(this.tracesPerQuery)) {
            tracesAndStats.ensureCountsAreIntegers();
        }
    }
    addTrace({ statsReportKey, trace, asTrace, referencedFieldsByType, maxTraceBytes = 10 * 1024 * 1024, nonFtv1ErrorPaths, }) {
        const tracesAndStats = this.getTracesAndStats({
            statsReportKey,
            referencedFieldsByType,
        });
        if (asTrace) {
            const encodedTrace = Trace.encode(trace).finish();
            if (!isNaN(maxTraceBytes) && encodedTrace.length > maxTraceBytes) {
                tracesAndStats.statsWithContext.addTrace(trace, this.sizeEstimator, nonFtv1ErrorPaths);
            }
            else {
                tracesAndStats.trace.push(encodedTrace);
                this.sizeEstimator.bytes += 2 + encodedTrace.length;
            }
        }
        else {
            tracesAndStats.statsWithContext.addTrace(trace, this.sizeEstimator, nonFtv1ErrorPaths);
        }
    }
    getTracesAndStats({ statsReportKey, referencedFieldsByType, }) {
        const existing = this.tracesPerQuery[statsReportKey];
        if (existing) {
            return existing;
        }
        this.sizeEstimator.bytes += estimatedBytesForString(statsReportKey);
        for (const [typeName, referencedFieldsForType] of Object.entries(referencedFieldsByType)) {
            this.sizeEstimator.bytes += 2 + 2;
            if (referencedFieldsForType.isInterface) {
                this.sizeEstimator.bytes += 2;
            }
            this.sizeEstimator.bytes += estimatedBytesForString(typeName);
            for (const fieldName of referencedFieldsForType.fieldNames) {
                this.sizeEstimator.bytes += estimatedBytesForString(fieldName);
            }
        }
        return (this.tracesPerQuery[statsReportKey] = new OurTracesAndStats(referencedFieldsByType));
    }
}
class OurTracesAndStats {
    constructor(referencedFieldsByType) {
        this.referencedFieldsByType = referencedFieldsByType;
        this.trace = [];
        this.statsWithContext = new StatsByContext();
        this.internalTracesContributingToStats = [];
    }
    ensureCountsAreIntegers() {
        this.statsWithContext.ensureCountsAreIntegers();
    }
}
class StatsByContext {
    constructor() {
        this.map = Object.create(null);
    }
    toArray() {
        return Object.values(this.map);
    }
    ensureCountsAreIntegers() {
        for (const contextualizedStats of Object.values(this.map)) {
            contextualizedStats.ensureCountsAreIntegers();
        }
    }
    addTrace(trace, sizeEstimator, nonFtv1ErrorPaths) {
        this.getContextualizedStats(trace, sizeEstimator).addTrace(trace, sizeEstimator, nonFtv1ErrorPaths);
    }
    getContextualizedStats(trace, sizeEstimator) {
        const statsContext = {
            clientName: trace.clientName,
            clientVersion: trace.clientVersion,
        };
        const statsContextKey = JSON.stringify(statsContext);
        const existing = this.map[statsContextKey];
        if (existing) {
            return existing;
        }
        sizeEstimator.bytes +=
            20 +
                estimatedBytesForString(trace.clientName) +
                estimatedBytesForString(trace.clientVersion);
        const contextualizedStats = new OurContextualizedStats(statsContext);
        this.map[statsContextKey] = contextualizedStats;
        return contextualizedStats;
    }
}
export class OurContextualizedStats {
    constructor(context) {
        this.context = context;
        this.queryLatencyStats = new OurQueryLatencyStats();
        this.perTypeStat = Object.create(null);
    }
    ensureCountsAreIntegers() {
        for (const typeStat of Object.values(this.perTypeStat)) {
            typeStat.ensureCountsAreIntegers();
        }
    }
    addTrace(trace, sizeEstimator, nonFtv1ErrorPaths = []) {
        const { fieldExecutionWeight } = trace;
        if (!fieldExecutionWeight) {
            this.queryLatencyStats.requestsWithoutFieldInstrumentation++;
        }
        this.queryLatencyStats.requestCount++;
        if (trace.fullQueryCacheHit) {
            this.queryLatencyStats.cacheLatencyCount.incrementDuration(trace.durationNs);
            this.queryLatencyStats.cacheHits++;
        }
        else {
            this.queryLatencyStats.latencyCount.incrementDuration(trace.durationNs);
        }
        if (!trace.fullQueryCacheHit && trace.cachePolicy?.maxAgeNs != null) {
            switch (trace.cachePolicy.scope) {
                case Trace.CachePolicy.Scope.PRIVATE:
                    this.queryLatencyStats.privateCacheTtlCount.incrementDuration(trace.cachePolicy.maxAgeNs);
                    break;
                case Trace.CachePolicy.Scope.PUBLIC:
                    this.queryLatencyStats.publicCacheTtlCount.incrementDuration(trace.cachePolicy.maxAgeNs);
                    break;
            }
        }
        if (trace.persistedQueryHit) {
            this.queryLatencyStats.persistedQueryHits++;
        }
        if (trace.persistedQueryRegister) {
            this.queryLatencyStats.persistedQueryMisses++;
        }
        if (trace.forbiddenOperation) {
            this.queryLatencyStats.forbiddenOperationCount++;
        }
        if (trace.registeredOperation) {
            this.queryLatencyStats.registeredOperationCount++;
        }
        let hasError = false;
        const errorPathStats = new Set();
        const traceNodeStats = (node, path) => {
            if (node.error?.length) {
                hasError = true;
                let currPathErrorStats = this.queryLatencyStats.rootErrorStats;
                path.toArray().forEach((subPath) => {
                    currPathErrorStats = currPathErrorStats.getChild(subPath, sizeEstimator);
                });
                errorPathStats.add(currPathErrorStats);
                currPathErrorStats.errorsCount += node.error.length;
            }
            if (fieldExecutionWeight) {
                const fieldName = node.originalFieldName || node.responseName;
                if (node.parentType &&
                    fieldName &&
                    node.type &&
                    node.endTime != null &&
                    node.startTime != null &&
                    node.endTime >= node.startTime) {
                    const typeStat = this.getTypeStat(node.parentType, sizeEstimator);
                    const fieldStat = typeStat.getFieldStat(fieldName, node.type, sizeEstimator);
                    fieldStat.errorsCount += node.error?.length ?? 0;
                    fieldStat.observedExecutionCount++;
                    fieldStat.estimatedExecutionCount += fieldExecutionWeight;
                    fieldStat.requestsWithErrorsCount +=
                        (node.error?.length ?? 0) > 0 ? 1 : 0;
                    fieldStat.latencyCount.incrementDuration(node.endTime - node.startTime, fieldExecutionWeight);
                }
            }
            return false;
        };
        iterateOverTrace(trace, traceNodeStats, true);
        for (const { subgraph, path } of nonFtv1ErrorPaths) {
            hasError = true;
            if (path) {
                let currPathErrorStats = this.queryLatencyStats.rootErrorStats.getChild(`service:${subgraph}`, sizeEstimator);
                path.forEach((subPath) => {
                    if (typeof subPath === 'string') {
                        currPathErrorStats = currPathErrorStats.getChild(subPath, sizeEstimator);
                    }
                });
                errorPathStats.add(currPathErrorStats);
                currPathErrorStats.errorsCount += 1;
            }
        }
        for (const errorPath of errorPathStats) {
            errorPath.requestsWithErrorsCount += 1;
        }
        if (hasError) {
            this.queryLatencyStats.requestsWithErrorsCount++;
        }
    }
    getTypeStat(parentType, sizeEstimator) {
        const existing = this.perTypeStat[parentType];
        if (existing) {
            return existing;
        }
        sizeEstimator.bytes += estimatedBytesForString(parentType);
        const typeStat = new OurTypeStat();
        this.perTypeStat[parentType] = typeStat;
        return typeStat;
    }
}
class OurQueryLatencyStats {
    constructor() {
        this.latencyCount = new DurationHistogram();
        this.requestCount = 0;
        this.requestsWithoutFieldInstrumentation = 0;
        this.cacheHits = 0;
        this.persistedQueryHits = 0;
        this.persistedQueryMisses = 0;
        this.cacheLatencyCount = new DurationHistogram();
        this.rootErrorStats = new OurPathErrorStats();
        this.requestsWithErrorsCount = 0;
        this.publicCacheTtlCount = new DurationHistogram();
        this.privateCacheTtlCount = new DurationHistogram();
        this.registeredOperationCount = 0;
        this.forbiddenOperationCount = 0;
    }
}
class OurPathErrorStats {
    constructor() {
        this.children = Object.create(null);
        this.errorsCount = 0;
        this.requestsWithErrorsCount = 0;
    }
    getChild(subPath, sizeEstimator) {
        const existing = this.children[subPath];
        if (existing) {
            return existing;
        }
        const child = new OurPathErrorStats();
        this.children[subPath] = child;
        sizeEstimator.bytes += estimatedBytesForString(subPath) + 4;
        return child;
    }
}
class OurTypeStat {
    constructor() {
        this.perFieldStat = Object.create(null);
    }
    getFieldStat(fieldName, returnType, sizeEstimator) {
        const existing = this.perFieldStat[fieldName];
        if (existing) {
            return existing;
        }
        sizeEstimator.bytes +=
            estimatedBytesForString(fieldName) +
                estimatedBytesForString(returnType) +
                10;
        const fieldStat = new OurFieldStat(returnType);
        this.perFieldStat[fieldName] = fieldStat;
        return fieldStat;
    }
    ensureCountsAreIntegers() {
        for (const fieldStat of Object.values(this.perFieldStat)) {
            fieldStat.ensureCountsAreIntegers();
        }
    }
}
class OurFieldStat {
    constructor(returnType) {
        this.returnType = returnType;
        this.errorsCount = 0;
        this.observedExecutionCount = 0;
        this.estimatedExecutionCount = 0;
        this.requestsWithErrorsCount = 0;
        this.latencyCount = new DurationHistogram();
    }
    ensureCountsAreIntegers() {
        this.estimatedExecutionCount = Math.floor(this.estimatedExecutionCount);
    }
}
function estimatedBytesForString(s) {
    return 2 + Buffer.byteLength(s);
}
//# sourceMappingURL=stats.js.map