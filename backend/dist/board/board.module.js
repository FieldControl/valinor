"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardModule = void 0;
const common_1 = require("@nestjs/common");
const board_service_1 = require("./board.service");
const board_controller_1 = require("./board.controller");
const typeorm_1 = require("@nestjs/typeorm");
const board_entity_1 = require("./entities/board.entity");
const user_module_1 = require("../user/user.module");
let BoardModule = class BoardModule {
};
exports.BoardModule = BoardModule;
exports.BoardModule = BoardModule = __decorate([
    (0, common_1.Module)({
        controllers: [board_controller_1.BoardController],
        providers: [board_service_1.BoardService],
        imports: [typeorm_1.TypeOrmModule.forFeature([board_entity_1.Board]), user_module_1.UserModule],
    })
], BoardModule);
//# sourceMappingURL=board.module.js.map