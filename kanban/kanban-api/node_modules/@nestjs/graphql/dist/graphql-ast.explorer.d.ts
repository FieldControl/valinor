import { DocumentNode, EnumTypeDefinitionNode, EnumTypeExtensionNode, FieldDefinitionNode, InputObjectTypeDefinitionNode, InputObjectTypeExtensionNode, InputValueDefinitionNode, InterfaceTypeDefinitionNode, InterfaceTypeExtensionNode, ObjectTypeDefinitionNode, ObjectTypeExtensionNode, OperationTypeDefinitionNode, ScalarTypeDefinitionNode, ScalarTypeExtensionNode, TypeNode, TypeSystemDefinitionNode, TypeSystemExtensionNode, UnionTypeDefinitionNode, UnionTypeExtensionNode } from 'graphql';
import type { ClassDeclarationStructure, EnumDeclarationStructure, InterfaceDeclarationStructure, MethodDeclarationStructure, MethodSignatureStructure, OptionalKind, ParameterDeclarationStructure, PropertyDeclarationStructure, PropertySignatureStructure, SourceFile, TypeAliasDeclarationStructure } from 'ts-morph';
export interface DefinitionsGeneratorOptions {
    /**
     * If true, the additional "__typename" field is generated for every object type.
     * @default false
     */
    emitTypenameField?: boolean;
    /**
     * If true, resolvers (query/mutation/etc) are generated as plain fields without arguments.
     * @default false
     */
    skipResolverArgs?: boolean;
    /**
     * If provided, specifies a default generated TypeScript type for custom scalars.
     * @default 'any'
     */
    defaultScalarType?: string;
    /**
     * If provided, specifies a mapping of types to use for custom scalars
     * @default undefined
     */
    customScalarTypeMapping?: Record<string, string | {
        name: string;
    }>;
    /**
     * If provided, specifies a mapping of default scalar types (Int, Boolean, ID, Float, String).
     * @default undefined
     */
    defaultTypeMapping?: Partial<Record<'ID' | 'Boolean' | 'Float' | 'String' | 'Int', string>>;
    /**
     * If provided, specifies a custom header to add after the
     * to the output file (eg. for custom type imports or comments)
     * @default undefined
     */
    additionalHeader?: string;
    /**
     * If true, enums are generated as string literal union types.
     * @default false
     */
    enumsAsTypes?: boolean;
}
export declare class GraphQLAstExplorer {
    private readonly root;
    explore(documentNode: DocumentNode, outputPath: string, mode: 'class' | 'interface', options?: DefinitionsGeneratorOptions): Promise<SourceFile>;
    toDefinitionStructures(item: Readonly<TypeSystemDefinitionNode | TypeSystemExtensionNode>, mode: 'class' | 'interface', options: DefinitionsGeneratorOptions): ClassDeclarationStructure | EnumDeclarationStructure | InterfaceDeclarationStructure | TypeAliasDeclarationStructure;
    toRootSchemaDefinitionStructure(operationTypes: ReadonlyArray<OperationTypeDefinitionNode>, mode: 'class' | 'interface'): ClassDeclarationStructure | InterfaceDeclarationStructure;
    toObjectTypeDefinitionStructure(item: ObjectTypeDefinitionNode | ObjectTypeExtensionNode | InputObjectTypeDefinitionNode | InputObjectTypeExtensionNode | InterfaceTypeDefinitionNode | InterfaceTypeExtensionNode, mode: 'class' | 'interface', options: DefinitionsGeneratorOptions): ClassDeclarationStructure | InterfaceDeclarationStructure;
    toPropertyDeclarationStructure(item: FieldDefinitionNode | InputValueDefinitionNode, options: DefinitionsGeneratorOptions): OptionalKind<PropertyDeclarationStructure> & OptionalKind<PropertySignatureStructure>;
    toMethodDeclarationStructure(item: FieldDefinitionNode | InputValueDefinitionNode, mode: 'class' | 'interface', options: DefinitionsGeneratorOptions): OptionalKind<MethodDeclarationStructure> & OptionalKind<MethodSignatureStructure>;
    getFieldTypeDefinition(typeNode: TypeNode, options: DefinitionsGeneratorOptions): {
        name: string;
        required: boolean;
    };
    unwrapTypeIfNonNull(type: TypeNode): {
        type: TypeNode;
        required: boolean;
    };
    getType(typeName: string, options: DefinitionsGeneratorOptions): string;
    getDefaultTypes(options: DefinitionsGeneratorOptions): {
        [type: string]: string;
    };
    getFunctionParameters(inputs: ReadonlyArray<InputValueDefinitionNode>, options: DefinitionsGeneratorOptions): ParameterDeclarationStructure[];
    toScalarDefinitionStructure(item: ScalarTypeDefinitionNode | ScalarTypeExtensionNode, options: DefinitionsGeneratorOptions): TypeAliasDeclarationStructure;
    toEnumDefinitionStructure(item: EnumTypeDefinitionNode | EnumTypeExtensionNode, options: DefinitionsGeneratorOptions): TypeAliasDeclarationStructure | EnumDeclarationStructure;
    toUnionDefinitionStructure(item: UnionTypeDefinitionNode | UnionTypeExtensionNode): TypeAliasDeclarationStructure;
    addSymbolIfRoot(name: string): string;
    isRoot(name: string): boolean;
}
//# sourceMappingURL=graphql-ast.explorer.d.ts.map