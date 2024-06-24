import { ApolloServer, type BaseContext } from '@apollo/server';
import { AbstractGraphQLDriver } from '@nestjs/graphql';
import { ApolloDriverConfig } from '../interfaces';
export declare abstract class ApolloBaseDriver<T extends Record<string, any> = ApolloDriverConfig> extends AbstractGraphQLDriver<T> {
    protected apolloServer: ApolloServer<BaseContext>;
    get instance(): ApolloServer<BaseContext>;
    start(apolloOptions: T): Promise<void>;
    stop(): Promise<void>;
    mergeDefaultOptions(options: T): Promise<T>;
    subscriptionWithFilter(instanceRef: unknown, filterFn: (payload: any, variables: any, context: any) => boolean | Promise<boolean>, createSubscribeContext: Function): <TPayload, TVariables, TContext, TInfo>(args_0: TPayload, args_1: TVariables, args_2: TContext, args_3: TInfo) => any;
    protected registerExpress(options: T, { preStartHook }?: {
        preStartHook?: () => void;
    }): Promise<void>;
    protected registerFastify(options: T, { preStartHook }?: {
        preStartHook?: () => void;
    }): Promise<void>;
    private wrapFormatErrorFn;
    private createTransformHttpErrorFn;
    private wrapContextResolver;
    private assignReqProperty;
}
//# sourceMappingURL=apollo-base.driver.d.ts.map