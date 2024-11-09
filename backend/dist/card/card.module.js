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
const card_service_1 = require("./card.service");
const card_controller_1 = require("./card.controller");
const typeorm_1 = require("@nestjs/typeorm");
const card_entity_1 = require("./entities/card.entity");
const swimlane_module_1 = require("../swimlane/swimlane.module");
const user_module_1 = require("../user/user.module");
let CardModule = class CardModule {
};
exports.CardModule = CardModule;
exports.CardModule = CardModule = __decorate([
    (0, common_1.Module)({
        controllers: [card_controller_1.CardController],
        providers: [card_service_1.CardService],
        imports: [typeorm_1.TypeOrmModule.forFeature([card_entity_1.Card]), swimlane_module_1.SwimlaneModule, user_module_1.UserModule],
    })
], CardModule);
//# sourceMappingURL=card.module.js.map