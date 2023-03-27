import type { DocumentNode } from 'graphql';
import type { TypedDocumentNode } from '@apollo/client/core';
import type { Observable } from 'rxjs';
import { Apollo } from './apollo';
import { SubscriptionOptionsAlone, ExtraSubscriptionOptions, SubscriptionResult, EmptyObject } from './types';
import * as i0 from "@angular/core";
export declare class Subscription<T = any, V = EmptyObject> {
    protected apollo: Apollo;
    readonly document: DocumentNode | TypedDocumentNode<T, V>;
    client: string;
    constructor(apollo: Apollo);
    subscribe(variables?: V, options?: SubscriptionOptionsAlone<V, T>, extra?: ExtraSubscriptionOptions): Observable<SubscriptionResult<T>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<Subscription<any, any>, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<Subscription<any, any>>;
}
