"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitiesMetadataStorage = void 0;
class EntitiesMetadataStorage {
    static addEntitiesByDataSource(dataSource, entities) {
        const dataSourceToken = typeof dataSource === 'string' ? dataSource : dataSource.name;
        if (!dataSourceToken) {
            return;
        }
        let collection = this.storage.get(dataSourceToken);
        if (!collection) {
            collection = [];
            this.storage.set(dataSourceToken, collection);
        }
        entities.forEach((entity) => {
            if (collection.includes(entity)) {
                return;
            }
            collection.push(entity);
        });
    }
    static getEntitiesByDataSource(dataSource) {
        const dataSourceToken = typeof dataSource === 'string' ? dataSource : dataSource.name;
        if (!dataSourceToken) {
            return [];
        }
        return this.storage.get(dataSourceToken) || [];
    }
}
exports.EntitiesMetadataStorage = EntitiesMetadataStorage;
EntitiesMetadataStorage.storage = new Map();
