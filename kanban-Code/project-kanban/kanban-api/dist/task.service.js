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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./database/prisma.service");
let TaskService = class TaskService {
    constructor(prismaService) {
        this.prismaService = prismaService;
        this.taskArray = [];
    }
    async getTask() {
        const tasks = await this.prismaService.task.findMany();
        return tasks;
    }
    async createTask(task) {
        const createdTask = await this.prismaService.task.create({
            data: {
                text: task.text,
                columnId: task.columnId
            }
        });
        return createdTask;
    }
    async deleteTask(task) {
        const deleteTask = await this.prismaService.task.delete({
            where: {
                id: task.id,
                columnId: task.columnId
            }
        });
        return deleteTask;
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaskService);
//# sourceMappingURL=task.service.js.map