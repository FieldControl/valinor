import { GraphQLInterfaceType } from 'graphql';
import { BuildSchemaOptions } from '../../interfaces';
import { InterfaceMetadata } from '../metadata/interface.metadata';
import { OrphanedReferenceRegistry } from '../services/orphaned-reference.registry';
import { TypeFieldsAccessor } from '../services/type-fields.accessor';
import { TypeDefinitionsStorage } from '../storages/type-definitions.storage';
import { ArgsFactory } from './args.factory';
import { AstDefinitionNodeFactory } from './ast-definition-node.factory';
import { OutputTypeFactory } from './output-type.factory';
import { ResolveTypeFactory } from './resolve-type.factory';
export interface InterfaceTypeDefinition {
    target: Function;
    type: GraphQLInterfaceType;
    isAbstract: boolean;
    interfaces: Function[];
}
export declare class InterfaceDefinitionFactory {
    private readonly resolveTypeFactory;
    private readonly typeDefinitionsStorage;
    private readonly outputTypeFactory;
    private readonly orphanedReferenceRegistry;
    private readonly typeFieldsAccessor;
    private readonly argsFactory;
    private readonly astDefinitionNodeFactory;
    constructor(resolveTypeFactory: ResolveTypeFactory, typeDefinitionsStorage: TypeDefinitionsStorage, outputTypeFactory: OutputTypeFactory, orphanedReferenceRegistry: OrphanedReferenceRegistry, typeFieldsAccessor: TypeFieldsAccessor, argsFactory: ArgsFactory, astDefinitionNodeFactory: AstDefinitionNodeFactory);
    create(metadata: InterfaceMetadata, options: BuildSchemaOptions): InterfaceTypeDefinition;
    private createResolveTypeFn;
    private generateFields;
    private generateInterfaces;
}
//# sourceMappingURL=interface-definition.factory.d.ts.map