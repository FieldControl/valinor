import { Type } from '@nestjs/common';
import { MappedType } from './mapped-type.interface';
import { RemoveFieldsWithType } from './types/remove-fields-with-type.type';
export declare function PartialType<T>(classRef: Type<T>, options?: {
    skipNullProperties?: boolean;
}): MappedType<RemoveFieldsWithType<Partial<T>, Function>>;
