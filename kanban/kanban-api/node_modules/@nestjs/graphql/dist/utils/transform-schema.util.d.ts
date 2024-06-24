import { GraphQLNamedType, GraphQLResolveInfo, GraphQLSchema } from 'graphql';
type GraphQLReferenceResolver<TContext> = (reference: object, context: TContext, info: GraphQLResolveInfo) => any;
interface ApolloSubgraphExtensions<TContext> {
    resolveReference?: GraphQLReferenceResolver<TContext>;
}
declare module 'graphql/type/definition' {
    interface GraphQLObjectTypeExtensions<_TSource = any, _TContext = any> {
        apollo?: {
            subgraph?: ApolloSubgraphExtensions<_TContext>;
        };
    }
    interface GraphQLInterfaceTypeExtensions<_TSource = any, _TContext = any> {
        apollo?: {
            subgraph?: ApolloSubgraphExtensions<_TContext>;
        };
    }
    interface GraphQLUnionTypeExtensions<_TSource = any, _TContext = any> {
        apollo?: {
            subgraph?: ApolloSubgraphExtensions<_TContext>;
        };
    }
}
type TypeTransformer = (type: GraphQLNamedType) => GraphQLNamedType | null | undefined;
export declare function transformSchema(schema: GraphQLSchema, transformType: TypeTransformer): GraphQLSchema;
export {};
//# sourceMappingURL=transform-schema.util.d.ts.map