import { HttpLink } from "../../link/http/index.js";
import type { GraphQLFormattedError, InitialIncrementalExecutionResult, SubsequentIncrementalExecutionResult } from "graphql-17-alpha2";
import type { ApolloPayloadResult } from "../../core/index.js";
export declare function mockIncrementalStream<Chunks>({ responseHeaders, }: {
    responseHeaders: Headers;
}): {
    httpLink: HttpLink;
    enqueue: (chunk: Chunks, hasNext: boolean) => void;
    close: () => void;
};
export declare function mockDeferStream<TData = Record<string, unknown>, TExtensions = Record<string, unknown>>(): {
    httpLink: HttpLink;
    enqueueInitialChunk(chunk: InitialIncrementalExecutionResult<TData, TExtensions>): void;
    enqueueSubsequentChunk(chunk: SubsequentIncrementalExecutionResult<TData, TExtensions>): void;
    enqueueErrorChunk(errors: GraphQLFormattedError[]): void;
};
export declare function mockMultipartSubscriptionStream<TData = Record<string, unknown>, TExtensions = Record<string, unknown>>(): {
    httpLink: HttpLink;
    enqueueHeartbeat: () => void;
    enqueuePayloadResult(payload: ApolloPayloadResult<TData, TExtensions>["payload"], hasNext?: boolean): void;
    enqueueProtocolErrors(errors: ApolloPayloadResult["errors"]): void;
};
//# sourceMappingURL=incremental.d.ts.map