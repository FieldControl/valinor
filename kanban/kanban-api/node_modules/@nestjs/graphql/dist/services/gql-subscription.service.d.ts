import { execute as graphqlExecute, GraphQLSchema, subscribe as graphqlSubscribe } from 'graphql';
import { ServerOptions } from 'graphql-ws';
import { ServerOptions as SubscriptionTransportWsServerOptions } from 'subscriptions-transport-ws';
export type GraphQLWsSubscriptionsConfig = Partial<Pick<ServerOptions, 'connectionInitWaitTimeout' | 'onConnect' | 'onDisconnect' | 'onClose' | 'onSubscribe' | 'onNext'>> & {
    path?: string;
};
export type GraphQLSubscriptionTransportWsConfig = Partial<Pick<SubscriptionTransportWsServerOptions, 'onConnect' | 'onDisconnect' | 'onOperation' | 'keepAlive'>> & {
    path?: string;
};
export type SubscriptionConfig = {
    'graphql-ws'?: GraphQLWsSubscriptionsConfig | boolean;
    'subscriptions-transport-ws'?: GraphQLSubscriptionTransportWsConfig | boolean;
};
export interface GqlSubscriptionServiceOptions extends SubscriptionConfig {
    schema: GraphQLSchema;
    execute?: typeof graphqlExecute;
    subscribe?: typeof graphqlSubscribe;
    path?: string;
    context?: ServerOptions['context'];
}
export declare class GqlSubscriptionService {
    private readonly options;
    private readonly httpServer;
    private readonly wss;
    private readonly subTransWs;
    private wsGqlDisposable;
    private subServer;
    constructor(options: GqlSubscriptionServiceOptions, httpServer: any);
    private initialize;
    stop(): Promise<void>;
}
//# sourceMappingURL=gql-subscription.service.d.ts.map