"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModule = void 0;
const task_service_1 = require("../../application/services/task.service");
const auth_guard_1 = require("../../guard/auth.guard");
const common_1 = require("@nestjs/common");
const task_resolver_1 = require("../../presenters/resolvers/task.resolver");
const auth_module_1 = require("./auth.module");
let TaskModule = class TaskModule {
};
exports.TaskModule = TaskModule;
exports.TaskModule = TaskModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        providers: [task_resolver_1.TaskResolver, task_service_1.TaskService, auth_guard_1.AuthGuard],
    })
], TaskModule);
//# sourceMappingURL=task.module.js.map