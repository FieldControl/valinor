import { FederationConfig, FederationVersion } from '../interfaces';
export interface TypeDefsDecorator<T = FederationConfig> {
    decorate(typeDefs: string, options: T): string;
}
export declare class TypeDefsDecoratorFactory {
    private readonly logger;
    create(federationVersion: FederationVersion, apolloSubgraphVersion: number): TypeDefsDecorator | undefined;
}
//# sourceMappingURL=type-defs-decorator.factory.d.ts.map