/// <reference types="node" />
/// <reference types="node" />
import type { WithRequired } from '@apollo/utils.withrequired';
import { type IncomingMessage, type ServerResponse } from 'http';
import type { ListenOptions } from 'net';
import type { ApolloServer } from '../ApolloServer.js';
import type { BaseContext, ContextFunction } from '../externalTypes/index.js';
export interface StandaloneServerContextFunctionArgument {
    req: IncomingMessage;
    res: ServerResponse;
}
export interface StartStandaloneServerOptions<TContext extends BaseContext> {
    context?: ContextFunction<[
        StandaloneServerContextFunctionArgument
    ], TContext>;
}
export declare function startStandaloneServer(server: ApolloServer<BaseContext>, options?: StartStandaloneServerOptions<BaseContext> & {
    listen?: ListenOptions;
}): Promise<{
    url: string;
}>;
export declare function startStandaloneServer<TContext extends BaseContext>(server: ApolloServer<TContext>, options: WithRequired<StartStandaloneServerOptions<TContext>, 'context'> & {
    listen?: ListenOptions;
}): Promise<{
    url: string;
}>;
//# sourceMappingURL=index.d.ts.map