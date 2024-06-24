"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumDefinitionFactory = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const graphql_1 = require("graphql");
let EnumDefinitionFactory = class EnumDefinitionFactory {
    create(metadata) {
        const enumValues = this.getEnumValues(metadata.ref);
        return {
            enumRef: metadata.ref,
            type: new graphql_1.GraphQLEnumType({
                name: metadata.name,
                description: metadata.description,
                values: Object.keys(enumValues).reduce((prevValue, key) => {
                    const valueMap = metadata.valuesMap[key];
                    prevValue[key] = {
                        value: enumValues[key],
                        description: valueMap?.description,
                        deprecationReason: valueMap?.deprecationReason,
                    };
                    return prevValue;
                }, {}),
            }),
        };
    }
    getEnumValues(enumObject) {
        const enumKeys = Object.keys(enumObject).filter((key) => isNaN(parseInt(key, 10)));
        return enumKeys.reduce((prev, nextKey) => {
            prev[nextKey] = enumObject[nextKey];
            return prev;
        }, {});
    }
};
exports.EnumDefinitionFactory = EnumDefinitionFactory;
exports.EnumDefinitionFactory = EnumDefinitionFactory = tslib_1.__decorate([
    (0, common_1.Injectable)()
], EnumDefinitionFactory);
