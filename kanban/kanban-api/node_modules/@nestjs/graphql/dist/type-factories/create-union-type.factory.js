"use strict";
/**
 * The API surface of this module has been heavily inspired by the "type-graphql" library (https://github.com/MichalLytek/type-graphql), originally designed & released by Michal Lytek.
 * In the v6 major release of NestJS, we introduced the code-first approach as a compatibility layer between this package and the `@nestjs/graphql` module.
 * Eventually, our team decided to reimplement all the features from scratch due to a lack of flexibility.
 * To avoid numerous breaking changes, the public API is backward-compatible and may resemble "type-graphql".
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUnionType = void 0;
const lazy_metadata_storage_1 = require("../schema-builder/storages/lazy-metadata.storage");
const type_metadata_storage_1 = require("../schema-builder/storages/type-metadata.storage");
/**
 * Creates a GraphQL union type composed of types references.
 * @param options
 */
function createUnionType(options) {
    const { name, description, types, resolveType } = options;
    const id = Symbol(name);
    lazy_metadata_storage_1.LazyMetadataStorage.store(() => type_metadata_storage_1.TypeMetadataStorage.addUnionMetadata({
        id,
        name,
        description,
        typesFn: types,
        resolveType,
    }));
    return id;
}
exports.createUnionType = createUnionType;
