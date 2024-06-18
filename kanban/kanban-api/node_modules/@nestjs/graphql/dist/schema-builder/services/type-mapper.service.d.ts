import { Type } from '@nestjs/common';
import { GraphQLScalarType, GraphQLType } from 'graphql';
import { DateScalarMode, GqlTypeReference, NumberScalarMode, ScalarsTypeMap } from '../../interfaces';
import { TypeOptions } from '../../interfaces/type-options.interface';
export declare class TypeMapperSevice {
    mapToScalarType<T extends GqlTypeReference = Type<unknown>>(typeRef: T, scalarsMap?: ScalarsTypeMap[], dateScalarMode?: DateScalarMode, numberScalarMode?: NumberScalarMode): GraphQLScalarType | undefined;
    mapToGqlType<T extends GraphQLType = GraphQLType>(hostType: string, typeRef: T, options: TypeOptions): T;
    private validateTypeOptions;
    private mapToGqlList;
    private hasArrayOptions;
}
//# sourceMappingURL=type-mapper.service.d.ts.map