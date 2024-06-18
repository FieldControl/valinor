"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldDirectiveCollection = void 0;
const metadata_list_by_name_collection_1 = require("./metadata-list-by-name.collection");
class FieldDirectiveCollection extends metadata_list_by_name_collection_1.MetadataListByNameCollection {
    constructor() {
        super(...arguments);
        this.sdls = new Set();
        this.fieldNames = new Set();
        this.uniqueCombinations = new Set();
    }
    add(value) {
        const combinationKey = `${value.sdl}${value.fieldName}`;
        if (this.uniqueCombinations.has(combinationKey)) {
            return;
        }
        super.add(value, value.fieldName);
        this.sdls.add(value.sdl);
        this.fieldNames.add(value.fieldName);
        this.uniqueCombinations.add(combinationKey);
        this.globalArray?.push(value);
    }
}
exports.FieldDirectiveCollection = FieldDirectiveCollection;
