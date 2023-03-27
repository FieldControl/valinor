import { ApolloLink, GraphQLRequest } from '../core';
import { DefaultContext } from '../../core';
export type ContextSetter = (operation: GraphQLRequest, prevContext: DefaultContext) => Promise<DefaultContext> | DefaultContext;
export declare function setContext(setter: ContextSetter): ApolloLink;
//# sourceMappingURL=index.d.ts.map