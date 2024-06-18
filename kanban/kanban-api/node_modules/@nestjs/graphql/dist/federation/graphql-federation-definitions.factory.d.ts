import { DefinitionsGeneratorOptions } from '../graphql-ast.explorer';
import { GraphQLDefinitionsFactory } from '../graphql-definitions.factory';
export declare class GraphQLFederationDefinitionsFactory extends GraphQLDefinitionsFactory {
    protected exploreAndEmit(typePaths: string[], path: string, outputAs: 'class' | 'interface', isDebugEnabled: boolean, definitionsGeneratorOptions: DefinitionsGeneratorOptions, typeDefs?: string | string[]): Promise<void>;
}
//# sourceMappingURL=graphql-federation-definitions.factory.d.ts.map