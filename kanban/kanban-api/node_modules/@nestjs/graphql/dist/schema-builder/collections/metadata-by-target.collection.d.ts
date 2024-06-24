import { MetadataCollectionModel } from './metada-collection-model.interface';
import { TargetMetadataCollection } from './target-metadata.collection';
export declare class MetadataByTargetCollection {
    readonly all: MetadataCollectionModel;
    private readonly storageMap;
    private readonly storageList;
    get(target: Function): TargetMetadataCollection;
    compile(): void;
    private reversePredicate;
}
//# sourceMappingURL=metadata-by-target.collection.d.ts.map