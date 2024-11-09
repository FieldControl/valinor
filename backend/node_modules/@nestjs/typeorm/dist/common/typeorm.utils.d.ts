import { Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource, DataSourceOptions } from 'typeorm';
import { EntityClassOrSchema } from '../interfaces/entity-class-or-schema.type';
/**
 * This function generates an injection token for an Entity or Repository
 * @param {EntityClassOrSchema} entity parameter can either be an Entity or Repository
 * @param {string} [dataSource='default'] DataSource name
 * @returns {string} The Entity | Repository injection token
 */
export declare function getRepositoryToken(entity: EntityClassOrSchema, dataSource?: DataSource | DataSourceOptions | string): Function | string;
/**
 * This function generates an injection token for an Entity or Repository
 * @param {Function} This parameter can either be an Entity or Repository
 * @returns {string} The Repository injection token
 */
export declare function getCustomRepositoryToken(repository: Function): string;
/**
 * This function returns a DataSource injection token for the given DataSource, DataSourceOptions or dataSource name.
 * @param {DataSource | DataSourceOptions | string} [dataSource='default'] This optional parameter is either
 * a DataSource, or a DataSourceOptions or a string.
 * @returns {string | Function} The DataSource injection token.
 */
export declare function getDataSourceToken(dataSource?: DataSource | DataSourceOptions | string): string | Function | Type<DataSource>;
/** @deprecated */
export declare const getConnectionToken: typeof getDataSourceToken;
/**
 * This function returns a DataSource prefix based on the dataSource name
 * @param {DataSource | DataSourceOptions | string} [dataSource='default'] This optional parameter is either
 * a DataSource, or a DataSourceOptions or a string.
 * @returns {string | Function} The DataSource injection token.
 */
export declare function getDataSourcePrefix(dataSource?: DataSource | DataSourceOptions | string): string;
/**
 * This function returns an EntityManager injection token for the given DataSource, DataSourceOptions or dataSource name.
 * @param {DataSource | DataSourceOptions | string} [dataSource='default'] This optional parameter is either
 * a DataSource, or a DataSourceOptions or a string.
 * @returns {string | Function} The EntityManager injection token.
 */
export declare function getEntityManagerToken(dataSource?: DataSource | DataSourceOptions | string): string | Function;
export declare function handleRetry(retryAttempts?: number, retryDelay?: number, dataSourceName?: string, verboseRetryLog?: boolean, toRetry?: (err: any) => boolean): <T>(source: Observable<T>) => Observable<T>;
export declare function getDataSourceName(options: DataSourceOptions): string;
export declare const generateString: () => string;
