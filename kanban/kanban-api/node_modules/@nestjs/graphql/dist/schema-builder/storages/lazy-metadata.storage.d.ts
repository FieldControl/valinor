import { Type } from '@nestjs/common';
export declare class LazyMetadataStorageHost {
    private readonly lazyMetadataByTarget;
    store(func: Function): void;
    store(target: Type<unknown>, func: Function): void;
    store(target: Type<unknown>, func: Function, options?: {
        isField: boolean;
    }): void;
    load(types?: Function[], options?: {
        skipFieldLazyMetadata?: boolean;
    }): void;
    private concatPrototypes;
    private updateStorage;
}
export declare const LazyMetadataStorage: LazyMetadataStorageHost;
//# sourceMappingURL=lazy-metadata.storage.d.ts.map