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
const prisma_service_1 = require("./database/prisma.service");
const board_controller_1 = require("./board.controller");
const board_service_1 = require("./board.service");
const column_controller_1 = require("./column.controller");
const column_service_1 = require("./column.service");
const app_controller_1 = require("./app.controller");
const task_controller_1 = require("./task.controller");
const task_service_1 = require("./task.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [board_controller_1.BoardController, column_controller_1.ColumnController, task_controller_1.TaskController, app_controller_1.AppController],
        providers: [prisma_service_1.PrismaService, board_service_1.BoardService, column_service_1.ColumnService, task_service_1.TaskService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map