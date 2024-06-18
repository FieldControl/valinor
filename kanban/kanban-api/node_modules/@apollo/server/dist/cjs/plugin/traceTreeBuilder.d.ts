import { GraphQLError, type GraphQLResolveInfo } from 'graphql';
import { Trace, google } from '@apollo/usage-reporting-protobuf';
import type { SendErrorsOptions } from './usageReporting';
export declare class TraceTreeBuilder {
    private rootNode;
    trace: Trace;
    startHrTime?: [number, number];
    private stopped;
    private nodes;
    private readonly transformError;
    constructor(options: {
        maskedBy: string;
        sendErrors?: SendErrorsOptions;
    });
    startTiming(): void;
    stopTiming(): void;
    willResolveField(info: GraphQLResolveInfo): () => void;
    didEncounterErrors(errors: readonly GraphQLError[]): void;
    private addProtobufError;
    private newNode;
    private ensureParentNode;
    private transformAndNormalizeError;
}
export declare function dateToProtoTimestamp(date: Date): google.protobuf.Timestamp;
//# sourceMappingURL=traceTreeBuilder.d.ts.map