import { GraphQLSchema } from 'graphql';
import { GraphQLAstExplorer } from './graphql-ast.explorer';
import { GraphQLSchemaBuilder } from './graphql-schema.builder';
import { GqlModuleOptions } from './interfaces';
import { ResolversExplorerService, ScalarsExplorerService } from './services';
export declare class GraphQLFactory {
    private readonly resolversExplorerService;
    private readonly scalarsExplorerService;
    private readonly graphqlAstExplorer;
    private readonly gqlSchemaBuilder;
    constructor(resolversExplorerService: ResolversExplorerService, scalarsExplorerService: ScalarsExplorerService, graphqlAstExplorer: GraphQLAstExplorer, gqlSchemaBuilder: GraphQLSchemaBuilder);
    generateSchema<T extends GqlModuleOptions>(options?: T): Promise<GraphQLSchema>;
    private overrideOrExtendResolvers;
    generateDefinitions(typeDefs: string | string[], options: GqlModuleOptions): Promise<void>;
}
//# sourceMappingURL=graphql.factory.d.ts.map