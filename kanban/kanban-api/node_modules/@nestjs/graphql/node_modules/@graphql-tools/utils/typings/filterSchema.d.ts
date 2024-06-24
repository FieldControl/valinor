import { GraphQLSchema } from 'graphql';
import { ArgumentFilter, FieldFilter, RootFieldFilter, TypeFilter } from './Interfaces.js';
export declare function filterSchema({ schema, typeFilter, fieldFilter, rootFieldFilter, objectFieldFilter, interfaceFieldFilter, inputObjectFieldFilter, argumentFilter, }: {
    schema: GraphQLSchema;
    rootFieldFilter?: RootFieldFilter;
    typeFilter?: TypeFilter;
    fieldFilter?: FieldFilter;
    objectFieldFilter?: FieldFilter;
    interfaceFieldFilter?: FieldFilter;
    inputObjectFieldFilter?: FieldFilter;
    argumentFilter?: ArgumentFilter;
}): GraphQLSchema;
