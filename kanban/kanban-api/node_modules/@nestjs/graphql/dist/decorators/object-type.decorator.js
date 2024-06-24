"use strict";
/**
 * The API surface of this module has been heavily inspired by the "type-graphql" library (https://github.com/MichalLytek/type-graphql), originally designed & released by Michal Lytek.
 * In the v6 major release of NestJS, we introduced the code-first approach as a compatibility layer between this package and the `@nestjs/graphql` module.
 * Eventually, our team decided to reimplement all the features from scratch due to a lack of flexibility.
 * To avoid numerous breaking changes, the public API is backward-compatible and may resemble "type-graphql".
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectType = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const class_type_enum_1 = require("../enums/class-type.enum");
const lazy_metadata_storage_1 = require("../schema-builder/storages/lazy-metadata.storage");
const type_metadata_storage_1 = require("../schema-builder/storages/type-metadata.storage");
const add_class_type_metadata_util_1 = require("../utils/add-class-type-metadata.util");
/**
 * Decorator that marks a class as a GraphQL type.
 */
function ObjectType(nameOrOptions, objectTypeOptions) {
    const [name, options = {}] = (0, shared_utils_1.isString)(nameOrOptions)
        ? [nameOrOptions, objectTypeOptions]
        : [undefined, nameOrOptions];
    return (target) => {
        const parentType = type_metadata_storage_1.TypeMetadataStorage.getObjectTypeMetadataByTarget(Object.getPrototypeOf(target));
        const addObjectTypeMetadata = () => type_metadata_storage_1.TypeMetadataStorage.addObjectTypeMetadata({
            name: name || target.name,
            target,
            description: parentType?.inheritDescription
                ? options.description ?? parentType?.description
                : options.description,
            interfaces: options.implements,
            isAbstract: options.isAbstract,
            inheritDescription: options.inheritDescription,
        });
        // This function must be called eagerly to allow resolvers
        // accessing the "name" property
        addObjectTypeMetadata();
        lazy_metadata_storage_1.LazyMetadataStorage.store(addObjectTypeMetadata);
        (0, add_class_type_metadata_util_1.addClassTypeMetadata)(target, class_type_enum_1.ClassType.OBJECT);
    };
}
exports.ObjectType = ObjectType;
