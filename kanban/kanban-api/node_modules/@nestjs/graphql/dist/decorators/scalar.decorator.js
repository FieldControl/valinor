"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scalar = void 0;
const common_1 = require("@nestjs/common");
const graphql_constants_1 = require("../graphql.constants");
/**
 * Decorator that marks a class as a GraphQL scalar.
 */
function Scalar(name, typeFunc) {
    return (target, key, descriptor) => {
        (0, common_1.SetMetadata)(graphql_constants_1.SCALAR_NAME_METADATA, name)(target, key, descriptor);
        (0, common_1.SetMetadata)(graphql_constants_1.SCALAR_TYPE_METADATA, typeFunc)(target, key, descriptor);
    };
}
exports.Scalar = Scalar;
