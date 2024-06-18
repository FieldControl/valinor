import type { ApolloServerPlugin } from '../../externalTypes/index.js';
import type { Fetcher } from '@apollo/utils.fetcher';
export interface ApolloServerPluginSchemaReportingOptions {
    initialDelayMaxMs?: number;
    overrideReportedSchema?: string;
    endpointUrl?: string;
    fetcher?: Fetcher;
}
export declare function ApolloServerPluginSchemaReporting({ initialDelayMaxMs, overrideReportedSchema, endpointUrl, fetcher, }?: ApolloServerPluginSchemaReportingOptions): ApolloServerPlugin;
//# sourceMappingURL=index.d.ts.map