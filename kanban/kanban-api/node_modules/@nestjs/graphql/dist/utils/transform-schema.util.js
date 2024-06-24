"use strict";
// This file is copied from `apollographql/federation`. The only difference is
// that it has a hack to not remove federation specific properties.
// https://github.com/apollographql/federation/blob/main/subgraph-js/src/schema-helper/transformSchema.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformSchema = void 0;
const graphql_1 = require("graphql");
function transformSchema(schema, transformType) {
    const typeMap = Object.create(null);
    for (const oldType of Object.values(schema.getTypeMap())) {
        if ((0, graphql_1.isIntrospectionType)(oldType))
            continue;
        const result = transformType(oldType);
        // Returning `null` removes the type.
        if (result === null)
            continue;
        // Returning `undefined` keeps the old type.
        const newType = result || oldType;
        typeMap[newType.name] = recreateNamedType(newType);
    }
    const schemaConfig = schema.toConfig();
    return new graphql_1.GraphQLSchema({
        ...schemaConfig,
        types: Object.values(typeMap),
        query: replaceMaybeType(schemaConfig.query),
        mutation: replaceMaybeType(schemaConfig.mutation),
        subscription: replaceMaybeType(schemaConfig.subscription),
        directives: replaceDirectives([...schemaConfig.directives]),
    });
    function recreateNamedType(type) {
        if ((0, graphql_1.isObjectType)(type)) {
            const config = type.toConfig();
            const objectType = new graphql_1.GraphQLObjectType({
                ...config,
                interfaces: () => config.interfaces.map(replaceNamedType),
                fields: () => replaceFields(config.fields),
            });
            if (type.extensions?.apollo?.subgraph?.resolveReference) {
                objectType.extensions = {
                    ...objectType.extensions,
                    apollo: {
                        ...objectType.extensions.apollo,
                        subgraph: {
                            ...objectType.extensions.apollo.subgraph,
                            resolveReference: type.extensions.apollo.subgraph.resolveReference,
                        },
                    },
                };
                /**
                 * Backcompat for old versions of @apollo/subgraph which didn't use
                 * `extensions` This can be removed when support for @apollo/subgraph <
                 * 0.4.2 is dropped Reference:
                 * https://github.com/apollographql/federation/pull/1747
                 */
                // @ts-expect-error (explanation above)
            }
            else if (type.resolveReference) {
                // @ts-expect-error (explanation above)
                objectType.resolveReference = type.resolveReference;
            }
            return objectType;
        }
        else if ((0, graphql_1.isInterfaceType)(type)) {
            const config = type.toConfig();
            return new graphql_1.GraphQLInterfaceType({
                ...config,
                interfaces: () => config.interfaces.map(replaceNamedType),
                fields: () => replaceFields(config.fields),
            });
        }
        else if ((0, graphql_1.isUnionType)(type)) {
            const config = type.toConfig();
            return new graphql_1.GraphQLUnionType({
                ...config,
                types: () => config.types.map(replaceNamedType),
            });
        }
        else if ((0, graphql_1.isInputObjectType)(type)) {
            const config = type.toConfig();
            return new graphql_1.GraphQLInputObjectType({
                ...config,
                fields: () => replaceInputFields(config.fields),
            });
        }
        return type;
    }
    function replaceType(type) {
        if ((0, graphql_1.isListType)(type)) {
            return new graphql_1.GraphQLList(replaceType(type.ofType));
        }
        else if ((0, graphql_1.isNonNullType)(type)) {
            return new graphql_1.GraphQLNonNull(replaceType(type.ofType));
        }
        return replaceNamedType(type);
    }
    function replaceNamedType(type) {
        const newType = typeMap[type.name];
        return newType ? newType : type;
    }
    function replaceMaybeType(type) {
        return type ? replaceNamedType(type) : undefined;
    }
    function replaceFields(fieldsMap) {
        return mapValues(fieldsMap, (field) => ({
            ...field,
            type: replaceType(field.type),
            args: field.args ? replaceArgs(field.args) : undefined,
        }));
    }
    function replaceInputFields(fieldsMap) {
        return mapValues(fieldsMap, (field) => ({
            ...field,
            type: replaceType(field.type),
        }));
    }
    function replaceArgs(args) {
        return mapValues(args, (arg) => ({
            ...arg,
            type: replaceType(arg.type),
        }));
    }
    function replaceDirectives(directives) {
        return directives.map((directive) => {
            const config = directive.toConfig();
            return new graphql_1.GraphQLDirective({
                ...config,
                args: replaceArgs(config.args),
            });
        });
    }
}
exports.transformSchema = transformSchema;
function mapValues(object, callback) {
    const result = Object.create(null);
    for (const [key, value] of Object.entries(object)) {
        result[key] = callback(value);
    }
    return result;
}
