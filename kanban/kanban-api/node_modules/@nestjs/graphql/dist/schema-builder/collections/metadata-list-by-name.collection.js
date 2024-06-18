"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataListByNameCollection = void 0;
const metadata_by_name_collection_1 = require("./metadata-by-name.collection");
class MetadataListByNameCollection extends metadata_by_name_collection_1.MetadataByNameCollection {
    constructor(globalArray = null) {
        super();
        this.globalArray = globalArray;
    }
    getByName(name) {
        return super.getByName(name) || [];
    }
    add(value, name) {
        let arrayResult = super.getByName(name);
        if (!arrayResult) {
            arrayResult = [];
            this.internalCollection.set(name, arrayResult);
        }
        arrayResult.push(value);
        this.all.push(value);
        this.globalArray && this.globalArray.push(value);
    }
    unshift(value, name) {
        let arrayResult = super.getByName(name);
        if (!arrayResult) {
            arrayResult = [];
            this.internalCollection.set(name, arrayResult);
        }
        arrayResult.unshift(value);
        this.all.push(value);
        this.globalArray && this.globalArray.unshift(value);
    }
}
exports.MetadataListByNameCollection = MetadataListByNameCollection;
