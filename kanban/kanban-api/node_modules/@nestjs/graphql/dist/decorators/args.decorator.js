"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Args = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
require("reflect-metadata");
const gql_paramtype_enum_1 = require("../enums/gql-paramtype.enum");
const lazy_metadata_storage_1 = require("../schema-builder/storages/lazy-metadata.storage");
const type_metadata_storage_1 = require("../schema-builder/storages/type-metadata.storage");
const is_pipe_util_1 = require("../utils/is-pipe.util");
const reflection_utilts_1 = require("../utils/reflection.utilts");
const param_utils_1 = require("./param.utils");
/**
 * Resolver method parameter decorator. Extracts the arguments
 * object from the underlying platform and populates the decorated
 * parameter with the value of either all arguments or a single specified argument.
 */
function Args(propertyOrOptionsOrPipe, optionsOrPipe, ...pipes) {
    const [property, argOptions, argPipes] = getArgsOptions(propertyOrOptionsOrPipe, optionsOrPipe, pipes);
    return (target, key, index) => {
        (0, param_utils_1.addPipesMetadata)(gql_paramtype_enum_1.GqlParamtype.ARGS, property, argPipes, target, key, index);
        lazy_metadata_storage_1.LazyMetadataStorage.store(target.constructor, () => {
            const { typeFn: reflectedTypeFn, options } = (0, reflection_utilts_1.reflectTypeFromMetadata)({
                metadataKey: 'design:paramtypes',
                prototype: target,
                propertyKey: key,
                index: index,
                explicitTypeFn: argOptions.type,
                typeOptions: argOptions,
            });
            const metadata = {
                target: target.constructor,
                methodName: key,
                typeFn: reflectedTypeFn,
                index,
                options,
            };
            if (property && (0, shared_utils_1.isString)(property)) {
                type_metadata_storage_1.TypeMetadataStorage.addMethodParamMetadata({
                    kind: 'arg',
                    name: property,
                    description: argOptions.description,
                    ...metadata,
                });
            }
            else {
                type_metadata_storage_1.TypeMetadataStorage.addMethodParamMetadata({
                    kind: 'args',
                    ...metadata,
                });
            }
        });
    };
}
exports.Args = Args;
function getArgsOptions(propertyOrOptionsOrPipe, optionsOrPipe, pipes) {
    if (!propertyOrOptionsOrPipe || (0, shared_utils_1.isString)(propertyOrOptionsOrPipe)) {
        const propertyKey = propertyOrOptionsOrPipe;
        let options = {};
        let argPipes = [];
        if ((0, is_pipe_util_1.isPipe)(optionsOrPipe)) {
            argPipes = [optionsOrPipe].concat(pipes);
        }
        else {
            options = optionsOrPipe || {};
            argPipes = pipes;
        }
        return [propertyKey, options, argPipes];
    }
    const isArgsOptionsObject = (0, shared_utils_1.isObject)(propertyOrOptionsOrPipe) &&
        !(0, shared_utils_1.isFunction)(propertyOrOptionsOrPipe.transform);
    if (isArgsOptionsObject) {
        const argOptions = propertyOrOptionsOrPipe;
        const propertyKey = argOptions.name;
        const argPipes = optionsOrPipe ? [optionsOrPipe].concat(pipes) : pipes;
        return [
            propertyKey,
            argOptions,
            argPipes,
        ];
    }
    // concatenate all pipes
    let argPipes = [propertyOrOptionsOrPipe];
    if (optionsOrPipe) {
        argPipes = argPipes.concat(optionsOrPipe);
    }
    argPipes = argPipes.concat(pipes);
    return [undefined, {}, argPipes];
}
