import { type GraphQLSchema } from 'graphql';
import type { BaseContext } from '../externalTypes/index.js';
export declare const symbolExecutionDispatcherWillResolveField: unique symbol;
export declare const symbolUserFieldResolver: unique symbol;
declare const symbolPluginsEnabled: unique symbol;
export declare function enablePluginsForSchemaResolvers<TContext extends BaseContext>(schema: GraphQLSchema & {
    [symbolPluginsEnabled]?: boolean;
}): GraphQLSchema & {
    [symbolPluginsEnabled]?: boolean | undefined;
};
export declare function pluginsEnabledForSchemaResolvers(schema: GraphQLSchema & {
    [symbolPluginsEnabled]?: boolean;
}): boolean;
export declare function whenResultIsFinished(result: any, callback: (err: Error | null, result?: any) => void): void;
export {};
//# sourceMappingURL=schemaInstrumentation.d.ts.map