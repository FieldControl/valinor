"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnsModule = void 0;
const common_1 = require("@nestjs/common");
const columns_controller_1 = require("./columns.controller");
const columns_service_1 = require("./columns.service");
let ColumnsModule = class ColumnsModule {
};
exports.ColumnsModule = ColumnsModule;
exports.ColumnsModule = ColumnsModule = __decorate([
    (0, common_1.Module)({
        controllers: [columns_controller_1.ColumnsController],
        providers: [columns_service_1.ColumnsService],
    })
], ColumnsModule);
//# sourceMappingURL=columns.module.js.map