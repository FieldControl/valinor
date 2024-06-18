"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetMetadataCollection = void 0;
const array_with_global_cache_collection_1 = require("./array-with-global-cache.collection");
const field_directive_collection_1 = require("./field-directive.collection");
const metadata_by_name_collection_1 = require("./metadata-by-name.collection");
const metadata_list_by_name_collection_1 = require("./metadata-list-by-name.collection");
class TargetMetadataCollection {
    constructor(all) {
        this.all = all;
        this.fields = new metadata_by_name_collection_1.MetadataByNameCollection();
        this.params = new metadata_list_by_name_collection_1.MetadataListByNameCollection();
        this.fieldDirectives = new field_directive_collection_1.FieldDirectiveCollection(this.all.fieldDirectives);
        this.fieldExtensions = new metadata_list_by_name_collection_1.MetadataListByNameCollection(this.all.fieldExtensions);
        this.classDirectives = new array_with_global_cache_collection_1.ArrayWithGlobalCacheCollection(this.all.classDirectives);
        this.classExtensions = new array_with_global_cache_collection_1.ArrayWithGlobalCacheCollection(this.all.classExtensions);
    }
    set argumentType(val) {
        this._argumentType = val;
        this.all.argumentType.push(val);
    }
    get argumentType() {
        return this._argumentType;
    }
    set interface(val) {
        this._interface = val;
        this.all.interface.set(val.target, val);
    }
    get interface() {
        return this._interface;
    }
    set inputType(val) {
        this._inputType = val;
        this.all.inputType.push(val);
    }
    get inputType() {
        return this._inputType;
    }
    set objectType(val) {
        this._objectType = val;
        this.all.objectType.push(val);
    }
    get objectType() {
        return this._objectType;
    }
    set resolver(val) {
        this._resolver = val;
        this.all.resolver.push(val);
    }
    get resolver() {
        return this._resolver;
    }
}
exports.TargetMetadataCollection = TargetMetadataCollection;
