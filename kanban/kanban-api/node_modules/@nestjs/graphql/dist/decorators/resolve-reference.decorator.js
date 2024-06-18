"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveReference = void 0;
const common_1 = require("@nestjs/common");
const graphql_constants_1 = require("../graphql.constants");
/**
 * Property reference resolver (method) Decorator.
 */
function ResolveReference() {
    return (target, key, descriptor) => {
        (0, common_1.SetMetadata)(graphql_constants_1.RESOLVER_REFERENCE_METADATA, true)(target, key, descriptor);
    };
}
exports.ResolveReference = ResolveReference;
