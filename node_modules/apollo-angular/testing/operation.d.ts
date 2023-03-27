import { ApolloError, Operation as LinkOperation, FetchResult } from '@apollo/client/core';
import { GraphQLError, ExecutionResult } from 'graphql';
import { Observer } from 'rxjs';
export declare type Operation = LinkOperation & {
    clientName: string;
};
export declare class TestOperation<T = {
    [key: string]: any;
}> {
    operation: Operation;
    private observer;
    constructor(operation: Operation, observer: Observer<FetchResult<T>>);
    flush(result: ExecutionResult | ApolloError): void;
    flushData(data: {
        [key: string]: any;
    } | null): void;
    networkError(error: Error): void;
    graphqlErrors(errors: GraphQLError[]): void;
}
