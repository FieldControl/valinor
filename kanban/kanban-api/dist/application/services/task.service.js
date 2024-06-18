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
const prisma_service_1 = require("../../infra/data/client/prisma.service");
const common_1 = require("@nestjs/common");
let TaskService = class TaskService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async create(createTaskInput) {
        const { title, description, columnId, order } = createTaskInput;
        let newOrder = order;
        if (newOrder === undefined) {
            const maxOrderTask = await this.prismaService.task.findFirst({
                where: { columnId },
                orderBy: {
                    order: 'desc',
                },
                select: {
                    order: true,
                },
            });
            newOrder = (maxOrderTask?.order ?? 0) + 1;
        }
        return await this.prismaService.task.create({
            data: {
                title,
                description,
                order: newOrder,
                column: {
                    connect: { id: columnId },
                },
            },
            include: {
                column: true,
            },
        });
    }
    async findAll() {
        return await this.prismaService.task.findMany({
            include: {
                column: true,
            },
        });
    }
    async findOne(id) {
        return await this.prismaService.task.findFirst({
            where: { id },
            include: {
                column: true,
            },
        });
    }
    async update(id, updateTaskInput) {
        const { title, description, columnId, order } = updateTaskInput;
        if (columnId && columnId.length > 0) {
            const column = await this.prismaService.column.findFirst({
                where: { id: columnId },
            });
            if (!column) {
                throw new common_1.NotFoundException('Colum Not found');
            }
        }
        return await this.prismaService.task.update({
            where: { id },
            data: {
                title,
                description,
                order,
                ...(columnId && {
                    column: { connect: { id: columnId } },
                }),
            },
            include: {
                column: true,
            },
        });
    }
    async updateMany(updateTasksInput) {
        const { tasks } = updateTasksInput;
        const updatePromises = tasks.map((task) => {
            const { id, title, description, columnId, order } = task;
            return this.prismaService.task.update({
                where: { id },
                data: {
                    title,
                    description,
                    order,
                    ...(columnId && {
                        column: {
                            connect: { id: columnId },
                        },
                    }),
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    order: true,
                    column: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            });
        });
        return await this.prismaService.$transaction(updatePromises);
    }
    async remove(id) {
        return this.prismaService.task.delete({
            where: { id },
        });
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaskService);
//# sourceMappingURL=task.service.js.map