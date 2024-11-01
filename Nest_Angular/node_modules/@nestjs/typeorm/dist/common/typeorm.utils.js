"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateString = exports.getDataSourceName = exports.handleRetry = exports.getEntityManagerToken = exports.getDataSourcePrefix = exports.getConnectionToken = exports.getDataSourceToken = exports.getCustomRepositoryToken = exports.getRepositoryToken = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const circular_dependency_exception_1 = require("../exceptions/circular-dependency.exception");
const typeorm_constants_1 = require("../typeorm.constants");
const logger = new common_1.Logger('TypeOrmModule');
/**
 * This function generates an injection token for an Entity or Repository
 * @param {EntityClassOrSchema} entity parameter can either be an Entity or Repository
 * @param {string} [dataSource='default'] DataSource name
 * @returns {string} The Entity | Repository injection token
 */
function getRepositoryToken(entity, dataSource = typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME) {
    if (entity === null || entity === undefined) {
        throw new circular_dependency_exception_1.CircularDependencyException('@InjectRepository()');
    }
    const dataSourcePrefix = getDataSourcePrefix(dataSource);
    if (entity instanceof Function &&
        (entity.prototype instanceof typeorm_1.Repository ||
            entity.prototype instanceof typeorm_1.AbstractRepository)) {
        if (!dataSourcePrefix) {
            return entity;
        }
        return `${dataSourcePrefix}${getCustomRepositoryToken(entity)}`;
    }
    if (entity instanceof typeorm_1.EntitySchema) {
        return `${dataSourcePrefix}${entity.options.target ? entity.options.target.name : entity.options.name}Repository`;
    }
    return `${dataSourcePrefix}${entity.name}Repository`;
}
exports.getRepositoryToken = getRepositoryToken;
/**
 * This function generates an injection token for an Entity or Repository
 * @param {Function} This parameter can either be an Entity or Repository
 * @returns {string} The Repository injection token
 */
function getCustomRepositoryToken(repository) {
    if (repository === null || repository === undefined) {
        throw new circular_dependency_exception_1.CircularDependencyException('@InjectRepository()');
    }
    return repository.name;
}
exports.getCustomRepositoryToken = getCustomRepositoryToken;
/**
 * This function returns a DataSource injection token for the given DataSource, DataSourceOptions or dataSource name.
 * @param {DataSource | DataSourceOptions | string} [dataSource='default'] This optional parameter is either
 * a DataSource, or a DataSourceOptions or a string.
 * @returns {string | Function} The DataSource injection token.
 */
function getDataSourceToken(dataSource = typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME) {
    return typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME === dataSource
        ? typeorm_1.DataSource ?? typeorm_1.Connection
        : 'string' === typeof dataSource
            ? `${dataSource}DataSource`
            : typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME === dataSource.name || !dataSource.name
                ? typeorm_1.DataSource ?? typeorm_1.Connection
                : `${dataSource.name}DataSource`;
}
exports.getDataSourceToken = getDataSourceToken;
/** @deprecated */
exports.getConnectionToken = getDataSourceToken;
/**
 * This function returns a DataSource prefix based on the dataSource name
 * @param {DataSource | DataSourceOptions | string} [dataSource='default'] This optional parameter is either
 * a DataSource, or a DataSourceOptions or a string.
 * @returns {string | Function} The DataSource injection token.
 */
function getDataSourcePrefix(dataSource = typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME) {
    if (dataSource === typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME) {
        return '';
    }
    if (typeof dataSource === 'string') {
        return dataSource + '_';
    }
    if (dataSource.name === typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME || !dataSource.name) {
        return '';
    }
    return dataSource.name + '_';
}
exports.getDataSourcePrefix = getDataSourcePrefix;
/**
 * This function returns an EntityManager injection token for the given DataSource, DataSourceOptions or dataSource name.
 * @param {DataSource | DataSourceOptions | string} [dataSource='default'] This optional parameter is either
 * a DataSource, or a DataSourceOptions or a string.
 * @returns {string | Function} The EntityManager injection token.
 */
function getEntityManagerToken(dataSource = typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME) {
    return typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME === dataSource
        ? typeorm_1.EntityManager
        : 'string' === typeof dataSource
            ? `${dataSource}EntityManager`
            : typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME === dataSource.name || !dataSource.name
                ? typeorm_1.EntityManager
                : `${dataSource.name}EntityManager`;
}
exports.getEntityManagerToken = getEntityManagerToken;
function handleRetry(retryAttempts = 9, retryDelay = 3000, dataSourceName = typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME, verboseRetryLog = false, toRetry) {
    return (source) => source.pipe((0, operators_1.retryWhen)((e) => e.pipe((0, operators_1.scan)((errorCount, error) => {
        if (toRetry && !toRetry(error)) {
            throw error;
        }
        const dataSourceInfo = dataSourceName === typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME
            ? ''
            : ` (${dataSourceName})`;
        const verboseMessage = verboseRetryLog
            ? ` Message: ${error.message}.`
            : '';
        logger.error(`Unable to connect to the database${dataSourceInfo}.${verboseMessage} Retrying (${errorCount + 1})...`, error.stack);
        if (errorCount + 1 >= retryAttempts) {
            throw error;
        }
        return errorCount + 1;
    }, 0), (0, operators_1.delay)(retryDelay))));
}
exports.handleRetry = handleRetry;
function getDataSourceName(options) {
    return options && options.name ? options.name : typeorm_constants_1.DEFAULT_DATA_SOURCE_NAME;
}
exports.getDataSourceName = getDataSourceName;
const generateString = () => (0, uuid_1.v4)();
exports.generateString = generateString;
