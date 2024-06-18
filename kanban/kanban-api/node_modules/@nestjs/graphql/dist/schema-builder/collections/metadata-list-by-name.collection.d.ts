import { MetadataByNameCollection } from './metadata-by-name.collection';
export declare class MetadataListByNameCollection<T> extends MetadataByNameCollection<T[]> {
    protected globalArray: Array<T>;
    constructor(globalArray?: Array<T>);
    getByName(name: string): T[];
    add(value: T, name: string): void;
    unshift(value: T, name: string): void;
}
//# sourceMappingURL=metadata-list-by-name.collection.d.ts.map