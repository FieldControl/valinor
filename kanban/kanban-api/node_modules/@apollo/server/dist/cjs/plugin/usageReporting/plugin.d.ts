import { Trace } from '@apollo/usage-reporting-protobuf';
import type { ApolloServerPlugin, BaseContext } from '../../externalTypes/index.js';
import type { ApolloServerPluginUsageReportingOptions, SendValuesBaseOptions } from './options.js';
import type { HeaderMap } from '../../utils/HeaderMap.js';
export declare function ApolloServerPluginUsageReporting<TContext extends BaseContext>(options?: ApolloServerPluginUsageReportingOptions<TContext>): ApolloServerPlugin<TContext>;
export declare function makeHTTPRequestHeaders(http: Trace.IHTTP, headers: HeaderMap, sendHeaders?: SendValuesBaseOptions): void;
//# sourceMappingURL=plugin.d.ts.map