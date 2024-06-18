import { FieldOptions, InputTypeOptions, InterfaceTypeOptions, ObjectTypeOptions, ReturnTypeFunc } from '..';
import * as typeFactories from '../type-factories';
export declare function ArgsType(): ClassDecorator;
export declare function Directive(sdl: string): MethodDecorator & PropertyDecorator & ClassDecorator;
export declare function Extensions(value: Record<string, unknown>): MethodDecorator & ClassDecorator & PropertyDecorator;
export declare function Field(typeOrOptions?: ReturnTypeFunc | FieldOptions, fieldOptions?: FieldOptions): PropertyDecorator & MethodDecorator;
export declare function HideField(): PropertyDecorator;
export declare function InputType(nameOrOptions?: string | InputTypeOptions, inputTypeOptions?: InputTypeOptions): ClassDecorator;
export declare function InterfaceType(nameOrOptions?: string | InterfaceTypeOptions, interfaceOptions?: InterfaceTypeOptions): ClassDecorator;
export declare function ObjectType(nameOrOptions?: string | ObjectTypeOptions, objectTypeOptions?: ObjectTypeOptions): ClassDecorator;
export declare function Scalar(name: string, typeFunc?: ReturnTypeFunc): ClassDecorator;
export declare function dummyFn(): void;
export declare const createUnionType: typeof typeFactories.createUnionType;
export declare const registerEnumType: typeof typeFactories.registerEnumType;
//# sourceMappingURL=graphql-model-shim.d.ts.map