"use strict";
/**
 * The API surface of this module has been heavily inspired by the "type-graphql" library (https://github.com/MichalLytek/type-graphql), originally designed & released by Michal Lytek.
 * In the v6 major release of NestJS, we introduced the code-first approach as a compatibility layer between this package and the `@nestjs/graphql` module.
 * Eventually, our team decided to reimplement all the features from scratch due to a lack of flexibility.
 * To avoid numerous breaking changes, the public API is backward-compatible and may resemble "type-graphql".
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFieldMetadata = exports.Field = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const lazy_metadata_storage_1 = require("../schema-builder/storages/lazy-metadata.storage");
const type_metadata_storage_1 = require("../schema-builder/storages/type-metadata.storage");
const reflection_utilts_1 = require("../utils/reflection.utilts");
/**
 * @Field() decorator is used to mark a specific class property as a GraphQL field.
 * Only properties decorated with this decorator will be defined in the schema.
 */
function Field(typeOrOptions, fieldOptions) {
    return (prototype, propertyKey, descriptor) => {
        addFieldMetadata(typeOrOptions, fieldOptions, prototype, propertyKey, descriptor);
    };
}
exports.Field = Field;
function addFieldMetadata(typeOrOptions, fieldOptions, prototype, propertyKey, descriptor, loadEagerly) {
    const [typeFunc, options = {}] = (0, shared_utils_1.isFunction)(typeOrOptions)
        ? [typeOrOptions, fieldOptions]
        : [undefined, typeOrOptions];
    const applyMetadataFn = () => {
        const isResolver = !!descriptor;
        const isResolverMethod = !!(descriptor && descriptor.value);
        const { typeFn: getType, options: typeOptions } = (0, reflection_utilts_1.reflectTypeFromMetadata)({
            metadataKey: isResolverMethod ? 'design:returntype' : 'design:type',
            prototype,
            propertyKey,
            explicitTypeFn: typeFunc,
            typeOptions: options,
            ignoreOnUndefinedType: loadEagerly,
        });
        type_metadata_storage_1.TypeMetadataStorage.addClassFieldMetadata({
            name: propertyKey,
            schemaName: options.name || propertyKey,
            typeFn: getType,
            options: typeOptions,
            target: prototype.constructor,
            description: options.description,
            deprecationReason: options.deprecationReason,
            complexity: options.complexity,
            middleware: options.middleware,
        });
        if (isResolver) {
            type_metadata_storage_1.TypeMetadataStorage.addResolverPropertyMetadata({
                kind: 'internal',
                methodName: propertyKey,
                schemaName: options.name || propertyKey,
                target: prototype.constructor,
                complexity: options.complexity,
            });
        }
    };
    if (loadEagerly) {
        applyMetadataFn();
    }
    else {
        lazy_metadata_storage_1.LazyMetadataStorage.store(prototype.constructor, applyMetadataFn, { isField: true });
    }
}
exports.addFieldMetadata = addFieldMetadata;
