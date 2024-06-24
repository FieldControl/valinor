"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayWithGlobalCacheCollection = void 0;
class ArrayWithGlobalCacheCollection {
    constructor(globalArray) {
        this.globalArray = globalArray;
        this.internalArray = [];
    }
    getAll() {
        return this.internalArray;
    }
    push(...items) {
        this.globalArray.push(...items);
        return this.internalArray.push(...items);
    }
    unshift(...items) {
        this.globalArray.unshift(...items);
        return this.internalArray.unshift(...items);
    }
    reverse() {
        return this.internalArray.reverse();
    }
    reduce(callbackfn, initialValue) {
        return this.internalArray.reduce(callbackfn, initialValue);
    }
}
exports.ArrayWithGlobalCacheCollection = ArrayWithGlobalCacheCollection;
