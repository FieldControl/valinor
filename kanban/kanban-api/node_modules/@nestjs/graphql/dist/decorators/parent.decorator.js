"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parent = void 0;
const gql_paramtype_enum_1 = require("../enums/gql-paramtype.enum");
const param_utils_1 = require("./param.utils");
/**
 * Resolver method parameter decorator. Extracts the parent/root
 * object from the underlying platform and populates the decorated
 * parameter with the value of parent/root.
 */
exports.Parent = (0, param_utils_1.createGqlParamDecorator)(gql_paramtype_enum_1.GqlParamtype.ROOT);
