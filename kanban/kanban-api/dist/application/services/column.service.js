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
exports.ColumnService = void 0;
const prisma_service_1 = require("../../infra/data/client/prisma.service");
const common_1 = require("@nestjs/common");
let ColumnService = class ColumnService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async create(createColumnInput) {
        const { title, description, projectId, order } = createColumnInput;
        const project = await this.prismaService.project.findFirst({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.BadRequestException('Project not found');
        }
        let newOrder = order;
        if (newOrder === undefined) {
            const maxOrderTask = await this.prismaService.column.findFirst({
                where: { projectId },
                orderBy: {
                    order: 'desc',
                },
                select: {
                    order: true,
                },
            });
            newOrder = (maxOrderTask?.order ?? 0) + 1;
        }
        return await this.prismaService.column.create({
            data: {
                title,
                description,
                order: newOrder,
                project: {
                    connect: { id: projectId },
                },
            },
            include: {
                project: true,
                tasks: {
                    include: {
                        column: true,
                    },
                },
            },
        });
    }
    async findAll() {
        return await this.prismaService.column.findMany({
            include: {
                project: true,
                tasks: {
                    include: {
                        column: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        return await this.prismaService.column.findFirst({
            where: { id },
            include: {
                project: true,
                tasks: {
                    include: {
                        column: true,
                    },
                },
            },
        });
    }
    async update(id, updateColumnInput) {
        const { title, description, projectId, taskIds } = updateColumnInput;
        if (projectId && projectId.length > 0) {
            const project = await this.prismaService.project.findFirst({
                where: { id: projectId },
            });
            if (!project) {
                throw new common_1.NotFoundException('Project Not found');
            }
        }
        if (taskIds && taskIds.length > 0) {
            const tasks = await this.prismaService.task.findMany({
                where: {
                    id: { in: taskIds },
                },
            });
            if (!tasks) {
                throw new common_1.NotFoundException('Task Not found');
            }
        }
        return await this.prismaService.column.update({
            where: { id },
            data: {
                title,
                description,
                ...(projectId && {
                    project: {
                        connect: { id: projectId },
                    },
                }),
                ...(taskIds && {
                    tasks: {
                        connect: taskIds.map((taskId) => ({ id: taskId })),
                    },
                }),
            },
            include: {
                project: true,
                tasks: {
                    include: {
                        column: true,
                    },
                },
            },
        });
    }
    async updateMany(updateColumnsInput) {
        const { columns } = updateColumnsInput;
        const updatePromises = columns.map((column) => {
            const { id, title, description, projectId, taskIds, order } = column;
            return this.prismaService.column.update({
                where: { id },
                data: {
                    title,
                    description,
                    order,
                    ...(projectId && {
                        project: {
                            connect: { id: projectId },
                        },
                    }),
                    ...(taskIds && {
                        tasks: {
                            connect: taskIds.map((taskId) => ({ id: taskId })),
                        },
                    }),
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    order: true,
                    tasks: {
                        select: {
                            id: true,
                            title: true,
                            column: {
                                select: {
                                    id: true,
                                    title: true,
                                },
                            },
                        },
                    },
                },
            });
        });
        return await this.prismaService.$transaction(updatePromises);
    }
    async remove(id) {
        return this.prismaService.column.delete({
            where: { id },
        });
    }
};
exports.ColumnService = ColumnService;
exports.ColumnService = ColumnService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ColumnService);
//# sourceMappingURL=column.service.js.map