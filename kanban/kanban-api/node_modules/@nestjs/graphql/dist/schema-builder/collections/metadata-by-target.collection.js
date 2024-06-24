"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataByTargetCollection = void 0;
const target_metadata_collection_1 = require("./target-metadata.collection");
class MetadataByTargetCollection {
    constructor() {
        this.all = {
            argumentType: [],
            interface: new Map(),
            inputType: [],
            objectType: [],
            resolver: [],
            classDirectives: [],
            classExtensions: [],
            fieldDirectives: [],
            fieldExtensions: [],
        };
        this.storageMap = new Map();
        this.storageList = new Array();
    }
    get(target) {
        let metadata = this.storageMap.get(target);
        if (!metadata) {
            metadata = new target_metadata_collection_1.TargetMetadataCollection(this.all);
            this.storageMap.set(target, metadata);
            this.storageList.push(metadata);
        }
        return metadata;
    }
    compile() {
        this.reversePredicate((t) => t.classDirectives.getAll());
        this.reversePredicate((t) => t.classExtensions.getAll());
        this.reversePredicate((t) => t.fieldDirectives.getAll());
        this.reversePredicate((t) => t.fieldExtensions.getAll());
    }
    reversePredicate(predicate) {
        this.storageList.forEach((t) => predicate(t).reverse());
    }
}
exports.MetadataByTargetCollection = MetadataByTargetCollection;
