import { createHash } from '@apollo/utils.createhash';
export function computeCoreSchemaHash(schema) {
    return createHash('sha256').update(schema).digest('hex');
}
//# sourceMappingURL=computeCoreSchemaHash.js.map