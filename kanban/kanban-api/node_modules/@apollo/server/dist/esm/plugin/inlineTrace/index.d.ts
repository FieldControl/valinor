import type { SendErrorsOptions } from '../usageReporting/index.js';
import type { ApolloServerPlugin } from '../../externalTypes/index.js';
export interface ApolloServerPluginInlineTraceOptions {
    includeErrors?: SendErrorsOptions;
    __onlyIfSchemaIsSubgraph?: boolean;
}
export declare function ApolloServerPluginInlineTrace(options?: ApolloServerPluginInlineTraceOptions): ApolloServerPlugin;
//# sourceMappingURL=index.d.ts.map