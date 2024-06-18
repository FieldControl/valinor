import { PropertyDirectiveMetadata } from '../metadata';
import { MetadataListByNameCollection } from './metadata-list-by-name.collection';
export declare class FieldDirectiveCollection extends MetadataListByNameCollection<PropertyDirectiveMetadata> {
    sdls: Set<string>;
    fieldNames: Set<string>;
    uniqueCombinations: Set<string>;
    add(value: PropertyDirectiveMetadata): void;
}
//# sourceMappingURL=field-directive.collection.d.ts.map