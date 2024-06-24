import { ClassMetadata, MethodArgsMetadata, PropertyExtensionsMetadata, PropertyMetadata, ResolverClassMetadata } from '../metadata';
import { ObjectTypeMetadata } from '../metadata/object-type.metadata';
import { ArrayWithGlobalCacheCollection } from './array-with-global-cache.collection';
import { FieldDirectiveCollection } from './field-directive.collection';
import { MetadataCollectionModel } from './metada-collection-model.interface';
import { MetadataByNameCollection } from './metadata-by-name.collection';
import { MetadataListByNameCollection } from './metadata-list-by-name.collection';
export declare class TargetMetadataCollection {
    private readonly all;
    constructor(all: MetadataCollectionModel);
    fields: MetadataByNameCollection<PropertyMetadata>;
    params: MetadataListByNameCollection<MethodArgsMetadata>;
    fieldDirectives: FieldDirectiveCollection;
    fieldExtensions: MetadataListByNameCollection<PropertyExtensionsMetadata>;
    classDirectives: ArrayWithGlobalCacheCollection<import("../metadata").DirectiveMetadata>;
    classExtensions: ArrayWithGlobalCacheCollection<import("../metadata").ExtensionsMetadata>;
    private _argumentType;
    private _interface;
    private _inputType;
    private _objectType;
    private _resolver;
    set argumentType(val: ClassMetadata);
    get argumentType(): ClassMetadata;
    set interface(val: ClassMetadata);
    get interface(): ClassMetadata;
    set inputType(val: ClassMetadata);
    get inputType(): ClassMetadata;
    set objectType(val: ObjectTypeMetadata);
    get objectType(): ObjectTypeMetadata;
    set resolver(val: ResolverClassMetadata);
    get resolver(): ResolverClassMetadata;
}
//# sourceMappingURL=target-metadata.collection.d.ts.map