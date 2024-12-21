"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const task_service_1 = require("../models/task.service");
let TaskController = class TaskController {
    async postTask(body) {
        console.log(body);
        const task = new task_service_1.Task("", body.title, body.description, body.userId, body.status, null);
        console.log(task);
        return await new task_service_1.Task().postTask(task);
    }
    async getTasks(id) {
        return await new task_service_1.Task().getTasksByUserId(id);
    }
    async putTask(id, body) {
        const task = new task_service_1.Task(id, body.title, body.description, body.userId, body.status, body.data);
        return await new task_service_1.Task().putTask(task);
    }
    async deleteTask(id) {
        return await new task_service_1.Task().deleteTask(id);
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_2.Post)(),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_service_1.Task]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "postTask", null);
__decorate([
    (0, common_2.Get)("/:id"),
    __param(0, (0, common_2.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Put)("/:id"),
    __param(0, (0, common_2.Param)("id")),
    __param(1, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, task_service_1.Task]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "putTask", null);
__decorate([
    (0, common_1.Delete)("/:id"),
    __param(0, (0, common_2.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "deleteTask", null);
exports.TaskController = TaskController = __decorate([
    (0, common_1.Controller)("/task")
], TaskController);
//# sourceMappingURL=task.controller.js.map