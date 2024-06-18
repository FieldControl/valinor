import { GraphQLSchema } from 'graphql';
/**
 * Removes "temp__" field from schema added
 * because of "merge-graphql-schemas" library issues.
 **/
export declare function removeTempField(schema: GraphQLSchema): GraphQLSchema;
//# sourceMappingURL=remove-temp.util.d.ts.map