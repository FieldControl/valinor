import type { NonFtv1ErrorPath } from '@apollo/server-gateway-interface';
import { type google, type IContextualizedStats, type IFieldStat, type IPathErrorStats, type IQueryLatencyStats, type IReport, type IStatsContext, type ITracesAndStats, type ITypeStat, type ReportHeader, Trace } from '@apollo/usage-reporting-protobuf';
import type { ReferencedFieldsByType } from '@apollo/utils.usagereporting';
import { DurationHistogram } from './durationHistogram.js';
export declare class SizeEstimator {
    bytes: number;
}
export declare class OurReport implements Required<IReport> {
    readonly header: ReportHeader;
    tracesPreAggregated: boolean;
    constructor(header: ReportHeader);
    readonly tracesPerQuery: Record<string, OurTracesAndStats>;
    endTime: google.protobuf.ITimestamp | null;
    operationCount: number;
    readonly sizeEstimator: SizeEstimator;
    ensureCountsAreIntegers(): void;
    addTrace({ statsReportKey, trace, asTrace, referencedFieldsByType, maxTraceBytes, nonFtv1ErrorPaths, }: {
        statsReportKey: string;
        trace: Trace;
        asTrace: boolean;
        referencedFieldsByType: ReferencedFieldsByType;
        maxTraceBytes?: number;
        nonFtv1ErrorPaths: NonFtv1ErrorPath[];
    }): void;
    private getTracesAndStats;
}
declare class OurTracesAndStats implements Required<ITracesAndStats> {
    readonly referencedFieldsByType: ReferencedFieldsByType;
    constructor(referencedFieldsByType: ReferencedFieldsByType);
    readonly trace: Uint8Array[];
    readonly statsWithContext: StatsByContext;
    readonly internalTracesContributingToStats: Uint8Array[];
    ensureCountsAreIntegers(): void;
}
declare class StatsByContext {
    readonly map: {
        [k: string]: OurContextualizedStats;
    };
    toArray(): IContextualizedStats[];
    ensureCountsAreIntegers(): void;
    addTrace(trace: Trace, sizeEstimator: SizeEstimator, nonFtv1ErrorPaths: NonFtv1ErrorPath[]): void;
    private getContextualizedStats;
}
export declare class OurContextualizedStats implements Required<IContextualizedStats> {
    readonly context: IStatsContext;
    queryLatencyStats: OurQueryLatencyStats;
    perTypeStat: {
        [k: string]: OurTypeStat;
    };
    constructor(context: IStatsContext);
    ensureCountsAreIntegers(): void;
    addTrace(trace: Trace, sizeEstimator: SizeEstimator, nonFtv1ErrorPaths?: NonFtv1ErrorPath[]): void;
    getTypeStat(parentType: string, sizeEstimator: SizeEstimator): OurTypeStat;
}
declare class OurQueryLatencyStats implements Required<IQueryLatencyStats> {
    latencyCount: DurationHistogram;
    requestCount: number;
    requestsWithoutFieldInstrumentation: number;
    cacheHits: number;
    persistedQueryHits: number;
    persistedQueryMisses: number;
    cacheLatencyCount: DurationHistogram;
    rootErrorStats: OurPathErrorStats;
    requestsWithErrorsCount: number;
    publicCacheTtlCount: DurationHistogram;
    privateCacheTtlCount: DurationHistogram;
    registeredOperationCount: number;
    forbiddenOperationCount: number;
}
declare class OurPathErrorStats implements Required<IPathErrorStats> {
    children: {
        [k: string]: OurPathErrorStats;
    };
    errorsCount: number;
    requestsWithErrorsCount: number;
    getChild(subPath: string, sizeEstimator: SizeEstimator): OurPathErrorStats;
}
declare class OurTypeStat implements Required<ITypeStat> {
    perFieldStat: {
        [k: string]: OurFieldStat;
    };
    getFieldStat(fieldName: string, returnType: string, sizeEstimator: SizeEstimator): OurFieldStat;
    ensureCountsAreIntegers(): void;
}
declare class OurFieldStat implements Required<IFieldStat> {
    readonly returnType: string;
    errorsCount: number;
    observedExecutionCount: number;
    estimatedExecutionCount: number;
    requestsWithErrorsCount: number;
    latencyCount: DurationHistogram;
    constructor(returnType: string);
    ensureCountsAreIntegers(): void;
}
export {};
//# sourceMappingURL=stats.d.ts.map