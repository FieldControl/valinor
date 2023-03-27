import { HttpClient } from '@angular/common/http';
import { ApolloLink, Observable as LinkObservable, Operation, FetchResult } from '@apollo/client/core';
import { BatchOptions } from './types';
import * as i0 from "@angular/core";
export declare class HttpBatchLinkHandler extends ApolloLink {
    private httpClient;
    private options;
    batcher: ApolloLink;
    private batchInterval;
    private batchMax;
    private print;
    constructor(httpClient: HttpClient, options: BatchOptions);
    private createOptions;
    private createBody;
    private createHeaders;
    private createBatchKey;
    request(op: Operation): LinkObservable<FetchResult> | null;
}
export declare class HttpBatchLink {
    private httpClient;
    constructor(httpClient: HttpClient);
    create(options: BatchOptions): HttpBatchLinkHandler;
    static ɵfac: i0.ɵɵFactoryDeclaration<HttpBatchLink, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HttpBatchLink>;
}
