import type { GraphQLError, DocumentNode } from 'graphql';
import type { GraphQLRequestContextDidResolveOperation, GraphQLRequestContext, GraphQLRequestContextWillSendResponse, BaseContext } from '../../externalTypes/index.js';
import type { Logger } from '@apollo/utils.logger';
import type { Trace } from '@apollo/usage-reporting-protobuf';
import type { Fetcher } from '@apollo/utils.fetcher';
export interface ApolloServerPluginUsageReportingOptions<TContext extends BaseContext> {
    sendTraces?: boolean;
    sendVariableValues?: VariableValueOptions;
    sendHeaders?: SendValuesBaseOptions;
    sendErrors?: SendErrorsOptions;
    fieldLevelInstrumentation?: number | ((request: GraphQLRequestContextDidResolveOperation<TContext>) => Promise<number | boolean>);
    includeRequest?: (request: GraphQLRequestContextDidResolveOperation<TContext> | GraphQLRequestContextWillSendResponse<TContext>) => Promise<boolean>;
    generateClientInfo?: GenerateClientInfo<TContext>;
    overrideReportedSchema?: string;
    sendUnexecutableOperationDocuments?: boolean;
    experimental_sendOperationAsTrace?: (trace: Trace, statsReportKey: string) => boolean;
    sendReportsImmediately?: boolean;
    fetcher?: Fetcher;
    reportIntervalMs?: number;
    maxUncompressedReportSize?: number;
    maxAttempts?: number;
    minimumRetryDelayMs?: number;
    requestTimeoutMs?: number;
    logger?: Logger;
    reportErrorFunction?: (err: Error) => void;
    endpointUrl?: string;
    debugPrintReports?: boolean;
    calculateSignature?: (ast: DocumentNode, operationName: string) => string;
    __onlyIfSchemaIsNotSubgraph?: boolean;
}
export type SendValuesBaseOptions = {
    onlyNames: Array<string>;
} | {
    exceptNames: Array<string>;
} | {
    all: true;
} | {
    none: true;
};
type VariableValueTransformOptions = {
    variables: Record<string, any>;
    operationString?: string;
};
export type VariableValueOptions = {
    transform: (options: VariableValueTransformOptions) => Record<string, any>;
} | SendValuesBaseOptions;
export type SendErrorsOptions = {
    unmodified: true;
} | {
    masked: true;
} | {
    transform: (err: GraphQLError) => GraphQLError | null;
};
export interface ClientInfo {
    clientName?: string;
    clientVersion?: string;
}
export type GenerateClientInfo<TContext extends BaseContext> = (requestContext: GraphQLRequestContext<TContext>) => ClientInfo;
export {};
//# sourceMappingURL=options.d.ts.map