import type { Logger } from '@apollo/utils.logger';
import type { SchemaReport, ReportSchemaResponse } from './generated/operations';
import type { Fetcher } from '@apollo/utils.fetcher';
export declare const schemaReportGql = "#graphql\n  mutation SchemaReport($report: SchemaReport!, $coreSchema: String) {\n    reportSchema(report: $report, coreSchema: $coreSchema) {\n      __typename\n      ... on ReportSchemaError {\n        message\n        code\n      }\n      ... on ReportSchemaResponse {\n        inSeconds\n        withCoreSchema\n      }\n    }\n  }\n";
export declare class SchemaReporter {
    private readonly schemaReport;
    private readonly coreSchema;
    private readonly endpointUrl;
    private readonly logger;
    private readonly initialReportingDelayInMs;
    private readonly fallbackReportingDelayInMs;
    private readonly fetcher;
    private isStopped;
    private pollTimer?;
    private readonly headers;
    constructor(options: {
        schemaReport: SchemaReport;
        coreSchema: string;
        apiKey: string;
        endpointUrl: string | undefined;
        logger: Logger;
        initialReportingDelayInMs: number;
        fallbackReportingDelayInMs: number;
        fetcher?: Fetcher;
    });
    stopped(): boolean;
    start(): void;
    stop(): void;
    private sendOneReportAndScheduleNext;
    reportSchema(withCoreSchema: boolean): Promise<ReportSchemaResponse | null>;
    private apolloQuery;
}
//# sourceMappingURL=schemaReporter.d.ts.map