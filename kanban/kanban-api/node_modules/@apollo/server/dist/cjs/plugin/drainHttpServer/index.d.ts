/// <reference types="node" />
import type http from 'http';
import type { ApolloServerPlugin } from '../../externalTypes/index.js';
export interface ApolloServerPluginDrainHttpServerOptions {
    httpServer: http.Server;
    stopGracePeriodMillis?: number;
}
export declare function ApolloServerPluginDrainHttpServer(options: ApolloServerPluginDrainHttpServerOptions): ApolloServerPlugin;
//# sourceMappingURL=index.d.ts.map