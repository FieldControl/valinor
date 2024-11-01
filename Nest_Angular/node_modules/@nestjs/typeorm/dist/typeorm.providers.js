"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTypeOrmProviders = void 0;
const typeorm_1 = require("typeorm");
const typeorm_utils_1 = require("./common/typeorm.utils");
function createTypeOrmProviders(entities, dataSource) {
    return (entities || []).map((entity) => ({
        provide: (0, typeorm_utils_1.getRepositoryToken)(entity, dataSource),
        useFactory: (dataSource) => {
            const entityMetadata = dataSource.entityMetadatas.find((meta) => meta.target === entity);
            const isTreeEntity = typeof entityMetadata?.treeType !== 'undefined';
            return isTreeEntity
                ? dataSource.getTreeRepository(entity)
                : dataSource.options.type === 'mongodb'
                    ? dataSource.getMongoRepository(entity)
                    : dataSource.getRepository(entity);
        },
        inject: [(0, typeorm_utils_1.getDataSourceToken)(dataSource)],
        /**
         * Extra property to workaround dynamic modules serialisation issue
         * that occurs when "TypeOrm#forFeature()" method is called with the same number
         * of arguments and all entities share the same class names.
         */
        targetEntitySchema: (0, typeorm_1.getMetadataArgsStorage)().tables.find((item) => item.target === entity),
    }));
}
exports.createTypeOrmProviders = createTypeOrmProviders;
