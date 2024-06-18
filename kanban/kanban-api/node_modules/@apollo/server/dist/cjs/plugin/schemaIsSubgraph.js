"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaIsSubgraph = void 0;
const graphql_1 = require("graphql");
function schemaIsSubgraph(schema) {
    const serviceType = schema.getType('_Service');
    if (!(0, graphql_1.isObjectType)(serviceType)) {
        return false;
    }
    const sdlField = serviceType.getFields().sdl;
    if (!sdlField) {
        return false;
    }
    let sdlFieldType = sdlField.type;
    if ((0, graphql_1.isNonNullType)(sdlFieldType)) {
        sdlFieldType = sdlFieldType.ofType;
    }
    if (!(0, graphql_1.isScalarType)(sdlFieldType)) {
        return false;
    }
    return sdlFieldType.name == 'String';
}
exports.schemaIsSubgraph = schemaIsSubgraph;
//# sourceMappingURL=schemaIsSubgraph.js.map