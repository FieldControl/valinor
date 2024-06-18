import { isObjectType, isScalarType, isNonNullType, } from 'graphql';
export function schemaIsSubgraph(schema) {
    const serviceType = schema.getType('_Service');
    if (!isObjectType(serviceType)) {
        return false;
    }
    const sdlField = serviceType.getFields().sdl;
    if (!sdlField) {
        return false;
    }
    let sdlFieldType = sdlField.type;
    if (isNonNullType(sdlFieldType)) {
        sdlFieldType = sdlFieldType.ofType;
    }
    if (!isScalarType(sdlFieldType)) {
        return false;
    }
    return sdlFieldType.name == 'String';
}
//# sourceMappingURL=schemaIsSubgraph.js.map