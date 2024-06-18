import { GraphQLResolveInfo } from 'graphql';
import { FieldMiddleware } from '../interfaces';
export declare function decorateFieldResolverWithMiddleware<TSource extends object = any, TContext = {}, TArgs = {
    [argName: string]: any;
}, TOutput = any>(originalResolveFnFactory: (...args: [TSource, TArgs, TContext, GraphQLResolveInfo]) => Function, middlewareFunctions?: FieldMiddleware[]): (root: TSource, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TOutput | Promise<TOutput>;
//# sourceMappingURL=decorate-field-resolver.util.d.ts.map