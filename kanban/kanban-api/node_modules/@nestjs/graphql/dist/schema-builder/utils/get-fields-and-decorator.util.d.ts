import { Type } from '@nestjs/common';
import 'reflect-metadata';
import { ArgsType, InputType, InterfaceType, ObjectType } from '../../decorators';
import { PropertyMetadata } from '../metadata';
export declare function getFieldsAndDecoratorForType<T>(objType: Type<T>, options?: {
    overrideFields?: boolean;
}): {
    fields: PropertyMetadata[];
    decoratorFactory: ClassDecorator;
};
type ClassDecorator = typeof ArgsType | typeof InterfaceType | typeof ObjectType | typeof InputType;
export {};
//# sourceMappingURL=get-fields-and-decorator.util.d.ts.map