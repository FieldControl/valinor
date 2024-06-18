import { getNamedType, GraphQLObjectType, defaultFieldResolver, } from 'graphql';
export const symbolExecutionDispatcherWillResolveField = Symbol('apolloServerExecutionDispatcherWillResolveField');
export const symbolUserFieldResolver = Symbol('apolloServerUserFieldResolver');
const symbolPluginsEnabled = Symbol('apolloServerPluginsEnabled');
export function enablePluginsForSchemaResolvers(schema) {
    if (pluginsEnabledForSchemaResolvers(schema)) {
        return schema;
    }
    Object.defineProperty(schema, symbolPluginsEnabled, {
        value: true,
    });
    const typeMap = schema.getTypeMap();
    Object.values(typeMap).forEach((type) => {
        if (!getNamedType(type).name.startsWith('__') &&
            type instanceof GraphQLObjectType) {
            const fields = type.getFields();
            Object.values(fields).forEach((field) => {
                wrapField(field);
            });
        }
    });
    return schema;
}
export function pluginsEnabledForSchemaResolvers(schema) {
    return !!schema[symbolPluginsEnabled];
}
function wrapField(field) {
    const originalFieldResolve = field.resolve;
    field.resolve = (source, args, contextValue, info) => {
        const willResolveField = contextValue?.[symbolExecutionDispatcherWillResolveField];
        const userFieldResolver = contextValue?.[symbolUserFieldResolver];
        const didResolveField = typeof willResolveField === 'function' &&
            willResolveField({ source, args, contextValue, info });
        const fieldResolver = originalFieldResolve || userFieldResolver || defaultFieldResolver;
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
export function whenResultIsFinished(result, callback) {
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
//# sourceMappingURL=schemaInstrumentation.js.map