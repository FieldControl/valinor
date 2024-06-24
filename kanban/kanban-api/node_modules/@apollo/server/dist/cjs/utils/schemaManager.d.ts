import type { Logger } from '@apollo/utils.logger';
import type { GraphQLSchema } from 'graphql';
import type { GatewayExecutor, GatewayInterface, GatewayUnsubscriber } from '@apollo/server-gateway-interface';
import type { SchemaDerivedData } from '../ApolloServer.js';
import type { ApolloConfig, GraphQLSchemaContext } from '../externalTypes/index.js';
type SchemaDerivedDataProvider = (apiSchema: GraphQLSchema) => SchemaDerivedData;
export declare class SchemaManager {
    private readonly logger;
    private readonly schemaDerivedDataProvider;
    private readonly onSchemaLoadOrUpdateListeners;
    private isStopped;
    private schemaDerivedData?;
    private schemaContext?;
    private readonly modeSpecificState;
    constructor(options: ({
        gateway: GatewayInterface;
        apolloConfig: ApolloConfig;
    } | {
        apiSchema: GraphQLSchema;
    }) & {
        logger: Logger;
        schemaDerivedDataProvider: SchemaDerivedDataProvider;
    });
    start(): Promise<GatewayExecutor | null>;
    onSchemaLoadOrUpdate(callback: (schemaContext: GraphQLSchemaContext) => void): GatewayUnsubscriber;
    getSchemaDerivedData(): SchemaDerivedData;
    stop(): Promise<void>;
    private processSchemaLoadOrUpdateEvent;
}
export {};
//# sourceMappingURL=schemaManager.d.ts.map