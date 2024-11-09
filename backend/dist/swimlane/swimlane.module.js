"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwimlaneModule = void 0;
const common_1 = require("@nestjs/common");
const swimlane_service_1 = require("./swimlane.service");
const swimlane_controller_1 = require("./swimlane.controller");
const typeorm_1 = require("@nestjs/typeorm");
const swimlane_entity_1 = require("./entities/swimlane.entity");
const user_module_1 = require("../user/user.module");
let SwimlaneModule = class SwimlaneModule {
};
exports.SwimlaneModule = SwimlaneModule;
exports.SwimlaneModule = SwimlaneModule = __decorate([
    (0, common_1.Module)({
        controllers: [swimlane_controller_1.SwimlaneController],
        providers: [swimlane_service_1.SwimlaneService],
        imports: [typeorm_1.TypeOrmModule.forFeature([swimlane_entity_1.Swimlane]), user_module_1.UserModule],
        exports: [swimlane_service_1.SwimlaneService],
    })
], SwimlaneModule);
//# sourceMappingURL=swimlane.module.js.map