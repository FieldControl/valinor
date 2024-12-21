"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const task_controller_1 = require("./controllers/task.controller");
const user_controller_1 = require("./controllers/user.controller");
const prisma_service_1 = require("./database/prisma.service");
const user_service_1 = require("./models/user.service");
const task_service_1 = require("./models/task.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [user_controller_1.UserController, task_controller_1.TaskController],
        providers: [prisma_service_1.PrismaService, user_service_1.Users, task_service_1.Task],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map