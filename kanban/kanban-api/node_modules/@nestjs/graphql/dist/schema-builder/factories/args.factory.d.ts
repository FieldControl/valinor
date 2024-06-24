import { GraphQLFieldConfigArgumentMap } from 'graphql';
import { BuildSchemaOptions } from '../../interfaces';
import { MethodArgsMetadata } from '../metadata';
import { InputTypeFactory } from './input-type.factory';
import { AstDefinitionNodeFactory } from './ast-definition-node.factory';
export declare class ArgsFactory {
    private readonly inputTypeFactory;
    private readonly astDefinitionNodeFactory;
    constructor(inputTypeFactory: InputTypeFactory, astDefinitionNodeFactory: AstDefinitionNodeFactory);
    create(args: MethodArgsMetadata[], options: BuildSchemaOptions): GraphQLFieldConfigArgumentMap;
    private inheritParentArgs;
}
//# sourceMappingURL=args.factory.d.ts.map