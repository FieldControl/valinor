"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whenResultIsFinished = exports.pluginsEnabledForSchemaResolvers = exports.enablePluginsForSchemaResolvers = exports.symbolUserFieldResolver = exports.symbolExecutionDispatcherWillResolveField = void 0;
const graphql_1 = require("graphql");
exports.symbolExecutionDispatcherWillResolveField = Symbol('apolloServerExecutionDispatcherWillResolveField');
exports.symbolUserFieldResolver = Symbol('apolloServerUserFieldResolver');
const symbolPluginsEnabled = Symbol('apolloServerPluginsEnabled');
function enablePluginsForSchemaResolvers(schema) {
    if (pluginsEnabledForSchemaResolvers(schema)) {
        return schema;
    }
    Object.defineProperty(schema, symbolPluginsEnabled, {
        value: true,
    });
    const typeMap = schema.getTypeMap();
    Object.values(typeMap).forEach((type) => {
        if (!(0, graphql_1.getNamedType)(type).name.startsWith('__') &&
            type instanceof graphql_1.GraphQLObjectType) {
            const fields = type.getFields();
            Object.values(fields).forEach((field) => {
                wrapField(field);
            });
        }
    });
    return schema;
}
exports.enablePluginsForSchemaResolvers = enablePluginsForSchemaResolvers;
function pluginsEnabledForSchemaResolvers(schema) {
    return !!schema[symbolPluginsEnabled];
}
exports.pluginsEnabledForSchemaResolvers = pluginsEnabledForSchemaResolvers;
function wrapField(field) {
    const originalFieldResolve = field.resolve;
    field.resolve = (source, args, contextValue, info) => {
        const willResolveField = contextValue?.[exports.symbolExecutionDispatcherWillResolveField];
        const userFieldResolver = contextValue?.[exports.symbolUserFieldResolver];
        const didResolveField = typeof willResolveField === 'function' &&
            willResolveField({ source, args, contextValue, info });
        const fieldResolver = originalFieldResolve || userFieldResolver || graphql_1.defaultFieldResolver;
        try {
            const result = fieldResolver(source, args, contextValue, info);
            if (typeof didResolveField === 'function') {
                whenResultIsFinished(result, didResolveField);
            }
            return result;
        }
        catch (error) {
            if (typeof didResolveField === 'function') {
                didResolveField(error);
            }
            throw error;
        }
    };
}
function isPromise(x) {
    return x && typeof x.then === 'function';
}
function whenResultIsFinished(result, callback) {
    if (isPromise(result)) {
        result.then((r) => whenResultIsFinished(r, callback), (err) => callback(err));
    }
    else if (Array.isArray(result)) {
        if (result.some(isPromise)) {
            Promise.all(result).then((r) => callback(null, r), (err) => callback(err));
        }
        else {
            callback(null, result);
        }
    }
    else {
        callback(null, result);
    }
}
exports.whenResultIsFinished = whenResultIsFinished;
//# sourceMappingURL=schemaInstrumentation.js.map