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
exports.TaskResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const task_service_1 = require("../../application/services/task.service");
const task_entity_1 = require("../../domain/entities/task.entity");
const create_task_input_1 = require("../../application/dto/taskDto/create-task.input");
const update_task_input_1 = require("../../application/dto/taskDto/update-task.input");
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../guard/auth.guard");
const throttler_1 = require("@nestjs/throttler");
let TaskResolver = class TaskResolver {
    constructor(taskService) {
        this.taskService = taskService;
    }
    createTask(createTaskInput) {
        return this.taskService.create(createTaskInput);
    }
    findAll() {
        return this.taskService.findAll();
    }
    findOne(id) {
        return this.taskService.findOne(id);
    }
    updateTask(updateTaskInput) {
        return this.taskService.update(updateTaskInput.id, updateTaskInput);
    }
    updateTasks(updateTasksInput) {
        return this.taskService.updateMany(updateTasksInput);
    }
    removeTask(id) {
        return this.taskService.remove(id);
    }
};
exports.TaskResolver = TaskResolver;
__decorate([
    (0, graphql_1.Mutation)(() => task_entity_1.Task),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, graphql_1.Args)('createTaskInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_input_1.CreateTaskInput]),
    __metadata("design:returntype", void 0)
], TaskResolver.prototype, "createTask", null);
__decorate([
    (0, graphql_1.Query)(() => [task_entity_1.Task], { name: 'tasks' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TaskResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => task_entity_1.Task, { name: 'task' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TaskResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => task_entity_1.Task),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, graphql_1.Args)('updateTaskInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_task_input_1.UpdateTaskInput]),
    __metadata("design:returntype", void 0)
], TaskResolver.prototype, "updateTask", null);
__decorate([
    (0, graphql_1.Mutation)(() => [task_entity_1.Task]),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, graphql_1.Args)('updateTasksInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_task_input_1.UpdateTasksInput]),
    __metadata("design:returntype", void 0)
], TaskResolver.prototype, "updateTasks", null);
__decorate([
    (0, graphql_1.Mutation)(() => task_entity_1.Task),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TaskResolver.prototype, "removeTask", null);
exports.TaskResolver = TaskResolver = __decorate([
    (0, graphql_1.Resolver)(() => task_entity_1.Task),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TaskResolver);
//# sourceMappingURL=task.resolver.js.map