import { GraphQLSchema } from 'graphql';
import { AutoSchemaFileValue, GqlModuleOptions } from './interfaces';
import { BuildSchemaOptions } from './interfaces/build-schema-options.interface';
import { GraphQLSchemaFactory } from './schema-builder/graphql-schema.factory';
import { FileSystemHelper } from './schema-builder/helpers/file-system.helper';
import { ScalarsExplorerService } from './services';
export declare class GraphQLSchemaBuilder {
    private readonly scalarsExplorerService;
    private readonly gqlSchemaFactory;
    private readonly fileSystemHelper;
    constructor(scalarsExplorerService: ScalarsExplorerService, gqlSchemaFactory: GraphQLSchemaFactory, fileSystemHelper: FileSystemHelper);
    build(autoSchemaFile: AutoSchemaFileValue, options: GqlModuleOptions, resolvers: Function[]): Promise<any>;
    generateSchema(resolvers: Function[], autoSchemaFile: AutoSchemaFileValue, options?: BuildSchemaOptions, sortSchema?: boolean, transformSchema?: (schema: GraphQLSchema) => GraphQLSchema | Promise<GraphQLSchema>): Promise<GraphQLSchema>;
}
//# sourceMappingURL=graphql-schema.builder.d.ts.map