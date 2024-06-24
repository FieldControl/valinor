import type { WithRequired } from '@apollo/utils.withrequired';
import type express from 'express';
import type { ApolloServer } from '../index.js';
import type { BaseContext, ContextFunction } from '../externalTypes/index.js';
export interface ExpressContextFunctionArgument {
    req: express.Request;
    res: express.Response;
}
export interface ExpressMiddlewareOptions<TContext extends BaseContext> {
    context?: ContextFunction<[ExpressContextFunctionArgument], TContext>;
}
export declare function expressMiddleware(server: ApolloServer<BaseContext>, options?: ExpressMiddlewareOptions<BaseContext>): express.RequestHandler;
export declare function expressMiddleware<TContext extends BaseContext>(server: ApolloServer<TContext>, options: WithRequired<ExpressMiddlewareOptions<TContext>, 'context'>): express.RequestHandler;
//# sourceMappingURL=index.d.ts.map