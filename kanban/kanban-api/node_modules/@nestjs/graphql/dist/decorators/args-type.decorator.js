"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgsType = void 0;
const class_type_enum_1 = require("../enums/class-type.enum");
const lazy_metadata_storage_1 = require("../schema-builder/storages/lazy-metadata.storage");
const type_metadata_storage_1 = require("../schema-builder/storages/type-metadata.storage");
const add_class_type_metadata_util_1 = require("../utils/add-class-type-metadata.util");
/**
 * Decorator that marks a class as a resolver arguments type.
 */
function ArgsType() {
    return (target) => {
        const metadata = {
            name: target.name,
            target,
        };
        lazy_metadata_storage_1.LazyMetadataStorage.store(() => type_metadata_storage_1.TypeMetadataStorage.addArgsMetadata(metadata));
        // This function must be called eagerly to allow resolvers
        // accessing the "name" property
        type_metadata_storage_1.TypeMetadataStorage.addArgsMetadata(metadata);
        (0, add_class_type_metadata_util_1.addClassTypeMetadata)(target, class_type_enum_1.ClassType.ARGS);
    };
}
exports.ArgsType = ArgsType;
