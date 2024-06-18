import { FieldDefinitionNode, GraphQLInputType, GraphQLOutputType, InputObjectTypeDefinitionNode, InputValueDefinitionNode, InterfaceTypeDefinitionNode, ObjectTypeDefinitionNode } from 'graphql';
import { DirectiveMetadata } from '../metadata/directive.metadata';
export declare class AstDefinitionNodeFactory {
    /**
     * The implementation of this class has been heavily inspired by the folllowing code:
     * @ref https://github.com/MichalLytek/type-graphql/blob/master/src/schema/definition-node.ts
     * implemented in this PR https://github.com/MichalLytek/type-graphql/pull/369 by Jordan Stous (https://github.com/j)
     */
    createObjectTypeNode(name: string, directiveMetadata?: DirectiveMetadata[]): ObjectTypeDefinitionNode | undefined;
    createInputObjectTypeNode(name: string, directiveMetadata?: DirectiveMetadata[]): InputObjectTypeDefinitionNode | undefined;
    createInterfaceTypeNode(name: string, directiveMetadata?: DirectiveMetadata[]): InterfaceTypeDefinitionNode | undefined;
    createFieldNode(name: string, type: GraphQLOutputType, directiveMetadata?: DirectiveMetadata[]): FieldDefinitionNode | undefined;
    createInputValueNode(name: string, type: GraphQLInputType, directiveMetadata?: DirectiveMetadata[]): InputValueDefinitionNode | undefined;
    createArgNode(name: string, type: GraphQLInputType, directiveMetadata?: DirectiveMetadata[]): InputValueDefinitionNode | undefined;
    private createDirectiveNode;
}
//# sourceMappingURL=ast-definition-node.factory.d.ts.map