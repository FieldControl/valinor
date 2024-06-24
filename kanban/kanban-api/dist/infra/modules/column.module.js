"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnModule = void 0;
const column_service_1 = require("../../application/services/column.service");
const auth_guard_1 = require("../../guard/auth.guard");
const common_1 = require("@nestjs/common");
const column_resolver_1 = require("../../presenters/resolvers/column.resolver");
const auth_module_1 = require("./auth.module");
let ColumnModule = class ColumnModule {
};
exports.ColumnModule = ColumnModule;
exports.ColumnModule = ColumnModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        providers: [column_resolver_1.ColumnResolver, column_service_1.ColumnService, auth_guard_1.AuthGuard],
    })
], ColumnModule);
//# sourceMappingURL=column.module.js.map