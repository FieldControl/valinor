import { HttpClient } from '@angular/common/http';
import { ApolloLink, Observable as LinkObservable, Operation, FetchResult } from '@apollo/client/core';
import { Options } from './types';
import * as i0 from "@angular/core";
export declare class HttpLinkHandler extends ApolloLink {
    private httpClient;
    private options;
    requester: (operation: Operation) => LinkObservable<FetchResult> | null;
    private print;
    constructor(httpClient: HttpClient, options: Options);
    request(op: Operation): LinkObservable<FetchResult> | null;
}
export declare class HttpLink {
    private httpClient;
    constructor(httpClient: HttpClient);
    create(options: Options): HttpLinkHandler;
    static ɵfac: i0.ɵɵFactoryDeclaration<HttpLink, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HttpLink>;
}
