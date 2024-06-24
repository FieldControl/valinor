"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resolver = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("@nestjs/common/constants");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
require("reflect-metadata");
const lazy_metadata_storage_1 = require("../schema-builder/storages/lazy-metadata.storage");
const type_metadata_storage_1 = require("../schema-builder/storages/type-metadata.storage");
const resolvers_utils_1 = require("./resolvers.utils");
/**
 * Extracts the name property set through the @ObjectType() decorator (if specified)
 * @param nameOrType type reference
 */
function getObjectOrInterfaceTypeNameIfExists(nameOrType) {
    const ctor = (0, resolvers_utils_1.getClassOrUndefined)(nameOrType);
    const objectMetadata = type_metadata_storage_1.TypeMetadataStorage.getObjectTypeMetadataByTarget(ctor);
    if (!objectMetadata) {
        const interfaceMetadata = type_metadata_storage_1.TypeMetadataStorage.getInterfaceMetadataByTarget(ctor);
        if (!interfaceMetadata) {
            return;
        }
        return interfaceMetadata.name;
    }
    return objectMetadata.name;
}
/**
 * Object resolver decorator.
 */
function Resolver(nameOrTypeOrOptions, options) {
    return (target, key, descriptor) => {
        if (typeof target === 'function') {
            (0, common_1.SetMetadata)(constants_1.ENTRY_PROVIDER_WATERMARK, true)(target);
        }
        const [nameOrType, resolverOptions] = typeof nameOrTypeOrOptions === 'object' && nameOrTypeOrOptions !== null
            ? [undefined, nameOrTypeOrOptions]
            : [nameOrTypeOrOptions, options];
        let name = nameOrType && (0, resolvers_utils_1.getClassName)(nameOrType);
        if ((0, shared_utils_1.isFunction)(nameOrType)) {
            const objectName = getObjectOrInterfaceTypeNameIfExists(nameOrType);
            objectName && (name = objectName);
        }
        (0, resolvers_utils_1.addResolverMetadata)(undefined, name, target, key, descriptor);
        if (!(0, shared_utils_1.isString)(nameOrType)) {
            lazy_metadata_storage_1.LazyMetadataStorage.store(target, () => {
                const typeFn = (0, resolvers_utils_1.getResolverTypeFn)(nameOrType, target);
                type_metadata_storage_1.TypeMetadataStorage.addResolverMetadata({
                    target: target,
                    typeFn: typeFn,
                    isAbstract: (resolverOptions && resolverOptions.isAbstract) || false,
                });
            });
        }
    };
}
exports.Resolver = Resolver;
