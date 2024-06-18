"use strict";
/**
 * The API surface of this module has been heavily inspired by the "type-graphql" library (https://github.com/MichalLytek/type-graphql), originally designed & released by Michal Lytek.
 * In the v6 major release of NestJS, we introduced the code-first approach as a compatibility layer between this package and the `@nestjs/graphql` module.
 * Eventually, our team decided to reimplement all the features from scratch due to a lack of flexibility.
 * To avoid numerous breaking changes, the public API is backward-compatible and may resemble "type-graphql".
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputType = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const class_type_enum_1 = require("../enums/class-type.enum");
const lazy_metadata_storage_1 = require("../schema-builder/storages/lazy-metadata.storage");
const type_metadata_storage_1 = require("../schema-builder/storages/type-metadata.storage");
const add_class_type_metadata_util_1 = require("../utils/add-class-type-metadata.util");
/**
 * Decorator that marks a class as a GraphQL input type.
 */
function InputType(nameOrOptions, inputTypeOptions) {
    const [name, options = {}] = (0, shared_utils_1.isString)(nameOrOptions)
        ? [nameOrOptions, inputTypeOptions]
        : [undefined, nameOrOptions];
    return (target) => {
        const metadata = {
            target,
            name: name || target.name,
            description: options.description,
            isAbstract: options.isAbstract,
        };
        lazy_metadata_storage_1.LazyMetadataStorage.store(() => type_metadata_storage_1.TypeMetadataStorage.addInputTypeMetadata(metadata));
        (0, add_class_type_metadata_util_1.addClassTypeMetadata)(target, class_type_enum_1.ClassType.INPUT);
    };
}
exports.InputType = InputType;
