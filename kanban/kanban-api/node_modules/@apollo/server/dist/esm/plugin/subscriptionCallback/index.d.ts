import type { Logger } from '@apollo/utils.logger';
import retry from 'async-retry';
import type { ApolloServerPlugin } from '../../externalTypes/index.js';
export interface ApolloServerPluginSubscriptionCallbackOptions {
    maxConsecutiveHeartbeatFailures?: number;
    logger?: Logger;
    retry?: retry.Options;
}
export declare function ApolloServerPluginSubscriptionCallback(options?: ApolloServerPluginSubscriptionCallbackOptions): ApolloServerPlugin;
//# sourceMappingURL=index.d.ts.map