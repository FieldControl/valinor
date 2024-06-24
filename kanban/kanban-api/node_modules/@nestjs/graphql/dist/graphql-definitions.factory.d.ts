import { DefinitionsGeneratorOptions, GraphQLAstExplorer } from './graphql-ast.explorer';
import { GraphQLTypesLoader } from './graphql-types.loader';
export type GenerateOptions = DefinitionsGeneratorOptions & {
    typePaths: string[];
    path: string;
    outputAs?: 'class' | 'interface';
    watch?: boolean;
    debug?: boolean;
    typeDefs?: string | string[];
};
export declare class GraphQLDefinitionsFactory {
    protected readonly gqlAstExplorer: GraphQLAstExplorer;
    protected readonly gqlTypesLoader: GraphQLTypesLoader;
    generate(options: GenerateOptions): Promise<void>;
    protected exploreAndEmit(typePaths: string[], path: string, outputAs: 'class' | 'interface', isDebugEnabled: boolean, definitionsGeneratorOptions: DefinitionsGeneratorOptions, typeDefs?: string | string[]): Promise<void>;
    protected printMessage(text: string, isEnabled: boolean): void;
}
//# sourceMappingURL=graphql-definitions.factory.d.ts.map