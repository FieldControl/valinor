import { type DocumentNode, type GraphQLSchema } from "graphql";
import { ReferencedFieldsForType } from "@apollo/usage-reporting-protobuf";
export interface OperationDerivedData {
    signature: string;
    referencedFieldsByType: ReferencedFieldsByType;
}
export type ReferencedFieldsByType = Record<string, ReferencedFieldsForType>;
export declare function calculateReferencedFieldsByType({ document, schema, resolvedOperationName, }: {
    document: DocumentNode;
    resolvedOperationName: string | null;
    schema: GraphQLSchema;
}): ReferencedFieldsByType;
//# sourceMappingURL=calculateReferencedFieldsByType.d.ts.map