import { DataSource, DataSourceOptions } from 'typeorm';
import { EntityClassOrSchema } from './interfaces/entity-class-or-schema.type';
type DataSourceToken = DataSource | DataSourceOptions | string;
export declare class EntitiesMetadataStorage {
    private static readonly storage;
    static addEntitiesByDataSource(dataSource: DataSourceToken, entities: EntityClassOrSchema[]): void;
    static getEntitiesByDataSource(dataSource: DataSourceToken): EntityClassOrSchema[];
}
export {};
