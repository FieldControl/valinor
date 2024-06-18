"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeDefsFederation2Decorator = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const utils_1 = require("../utils");
class TypeDefsFederation2Decorator {
    decorate(typeDefs, config = { version: 2 }) {
        const { directives = [
            '@composeDirective',
            '@extends',
            '@external',
            '@inaccessible',
            '@interfaceObject',
            '@key',
            '@override',
            '@provides',
            '@requires',
            '@shareable',
            '@tag',
        ], importUrl = 'https://specs.apollo.dev/federation/v2.3', } = config;
        const mappedDirectives = directives
            .map((directive) => {
            if (!(0, shared_utils_1.isString)(directive)) {
                return (0, utils_1.stringifyWithoutQuotes)(directive);
            }
            let finalDirective = directive;
            if (!directive.startsWith('@')) {
                finalDirective = `@${directive}`;
            }
            return `"${finalDirective}"`;
        })
            .join(', ');
        return `
      extend schema @link(url: "${importUrl}", import: [${mappedDirectives}])
      ${typeDefs}
    `;
    }
}
exports.TypeDefsFederation2Decorator = TypeDefsFederation2Decorator;
