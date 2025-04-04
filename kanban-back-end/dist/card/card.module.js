"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardModule = void 0;
const common_1 = require("@nestjs/common");
const card_resolver_1 = require("./card.resolver");
const card_service_1 = require("./card.service");
const column_module_1 = require("../column/column.module");
let CardModule = class CardModule {
};
exports.CardModule = CardModule;
exports.CardModule = CardModule = __decorate([
    (0, common_1.Module)({
        imports: [column_module_1.ColumnModule],
        providers: [card_resolver_1.CardResolver, card_service_1.CardService],
    })
], CardModule);
//# sourceMappingURL=card.module.js.map