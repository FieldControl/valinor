import type { FormattedExecutionResult, GraphQLFormattedError } from "graphql";
import type { NetworkError } from "../../errors/index.js";
import { Observable } from "../../utilities/index.js";
import type { Operation, FetchResult, NextLink } from "../core/index.js";
import { ApolloLink } from "../core/index.js";
export interface ErrorResponse {
    /**
     * Errors returned in the `errors` property of the GraphQL response.
     */
    graphQLErrors?: ReadonlyArray<GraphQLFormattedError>;
    /**
     * Errors thrown during a network request. This is usually an error thrown
     * during a `fetch` call or an error while parsing the response from the
     * network.
     */
    networkError?: NetworkError;
    /**
     * Fatal transport-level errors from multipart subscriptions.
     * See the [multipart subscription protocol](https://www.apollographql.com/docs/graphos/routing/operations/subscriptions/multipart-protocol#message-and-error-format) for more information.
     */
    protocolErrors?: ReadonlyArray<GraphQLFormattedError>;
    response?: FormattedExecutionResult;
    operation: Operation;
    forward: NextLink;
}
export declare namespace ErrorLink {
    /**
     * Callback to be triggered when an error occurs within the link stack.
     */
    interface ErrorHandler {
        (error: ErrorResponse): Observable<FetchResult> | void;
    }
}
export import ErrorHandler = ErrorLink.ErrorHandler;
export declare function onError(errorHandler: ErrorHandler): ApolloLink;
export declare class ErrorLink extends ApolloLink {
    private link;
    constructor(errorHandler: ErrorLink.ErrorHandler);
    request(operation: Operation, forward: NextLink): Observable<FetchResult> | null;
}
//# sourceMappingURL=index.d.ts.map