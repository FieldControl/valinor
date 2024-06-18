"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataByNameCollection = void 0;
class MetadataByNameCollection {
    constructor() {
        this.internalCollection = new Map();
        this.all = [];
    }
    getAll() {
        return [...this.all];
    }
    getByName(name) {
        return this.internalCollection.get(name);
    }
    add(value, name) {
        if (this.internalCollection.has(name)) {
            return;
        }
        this.internalCollection.set(name, value);
        this.all.push(value);
    }
    unshift(value, name) {
        if (this.internalCollection.has(name)) {
            return;
        }
        this.internalCollection.set(name, value);
        this.all.unshift(value);
    }
}
exports.MetadataByNameCollection = MetadataByNameCollection;
