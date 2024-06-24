"use strict";
var TypeDefsDecoratorFactory_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeDefsDecoratorFactory = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const type_defs_federation2_decorator_1 = require("./type-defs-federation2.decorator");
let TypeDefsDecoratorFactory = TypeDefsDecoratorFactory_1 = class TypeDefsDecoratorFactory {
    constructor() {
        this.logger = new common_1.Logger(TypeDefsDecoratorFactory_1.name);
    }
    create(federationVersion, apolloSubgraphVersion) {
        switch (federationVersion) {
            case 2: {
                if (apolloSubgraphVersion === 1) {
                    this.logger.error('To use Apollo Federation v2, you have to install the @apollo/subgraph@^2.0.0.');
                    return;
                }
                return new type_defs_federation2_decorator_1.TypeDefsFederation2Decorator();
            }
            default:
                return;
        }
    }
};
exports.TypeDefsDecoratorFactory = TypeDefsDecoratorFactory;
exports.TypeDefsDecoratorFactory = TypeDefsDecoratorFactory = TypeDefsDecoratorFactory_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], TypeDefsDecoratorFactory);
