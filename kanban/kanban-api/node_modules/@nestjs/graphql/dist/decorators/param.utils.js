"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGqlPipesParamDecorator = exports.addPipesMetadata = exports.createGqlParamDecorator = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
require("reflect-metadata");
const graphql_constants_1 = require("../graphql.constants");
function assignMetadata(args, paramtype, index, data, ...pipes) {
    return {
        ...args,
        [`${paramtype}:${index}`]: {
            index,
            data,
            pipes,
        },
    };
}
const createGqlParamDecorator = (paramtype) => {
    return (data) => (target, key, index) => {
        const args = Reflect.getMetadata(graphql_constants_1.PARAM_ARGS_METADATA, target.constructor, key) || {};
        Reflect.defineMetadata(graphql_constants_1.PARAM_ARGS_METADATA, assignMetadata(args, paramtype, index, data), target.constructor, key);
    };
};
exports.createGqlParamDecorator = createGqlParamDecorator;
const addPipesMetadata = (paramtype, data, pipes, target, key, index) => {
    const args = Reflect.getMetadata(graphql_constants_1.PARAM_ARGS_METADATA, target.constructor, key) || {};
    const hasParamData = (0, shared_utils_1.isNil)(data) || (0, shared_utils_1.isString)(data);
    const paramData = hasParamData ? data : undefined;
    const paramPipes = hasParamData ? pipes : [data, ...pipes];
    Reflect.defineMetadata(graphql_constants_1.PARAM_ARGS_METADATA, assignMetadata(args, paramtype, index, paramData, ...paramPipes), target.constructor, key);
};
exports.addPipesMetadata = addPipesMetadata;
const createGqlPipesParamDecorator = (paramtype) => (data, ...pipes) => (target, key, index) => {
    (0, exports.addPipesMetadata)(paramtype, data, pipes, target, key, index);
};
exports.createGqlPipesParamDecorator = createGqlPipesParamDecorator;
