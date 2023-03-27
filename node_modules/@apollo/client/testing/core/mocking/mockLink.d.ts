import { ApolloLink, Operation, GraphQLRequest, FetchResult } from '../../../link/core';
import { Observable } from '../../../utilities';
export type ResultFunction<T> = () => T;
export interface MockedResponse<TData = Record<string, any>, TVariables = Record<string, any>> {
    request: GraphQLRequest<TVariables>;
    result?: FetchResult<TData> | ResultFunction<FetchResult<TData>>;
    error?: Error;
    delay?: number;
    newData?: ResultFunction<FetchResult>;
}
export interface MockLinkOptions {
    showWarnings?: boolean;
}
export declare class MockLink extends ApolloLink {
    operation: Operation;
    addTypename: Boolean;
    showWarnings: boolean;
    private mockedResponsesByKey;
    constructor(mockedResponses: ReadonlyArray<MockedResponse>, addTypename?: Boolean, options?: MockLinkOptions);
    addMockedResponse(mockedResponse: MockedResponse): void;
    request(operation: Operation): Observable<FetchResult> | null;
    private normalizeMockedResponse;
}
export interface MockApolloLink extends ApolloLink {
    operation?: Operation;
}
export declare function mockSingleLink(...mockedResponses: Array<any>): MockApolloLink;
//# sourceMappingURL=mockLink.d.ts.map