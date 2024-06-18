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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infra/data/client/prisma.service");
let ProjectService = class ProjectService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async create(createProjectInput) {
        const { title, description, userIds } = createProjectInput;
        if (!userIds || userIds.length === 0) {
            throw new common_1.BadRequestException('At least one user ID must be provided');
        }
        const users = await this.prismaService.user.findMany({
            where: {
                id: { in: userIds },
            },
        });
        if (users.length !== userIds.length) {
            throw new common_1.NotFoundException('One or more user IDs not found');
        }
        return await this.prismaService.project.create({
            data: {
                title,
                description,
                users: {
                    connect: userIds.map((id) => ({ id })),
                },
            },
            include: {
                users: true,
                columns: {
                    include: {
                        tasks: true,
                    },
                },
            },
        });
    }
    async findAll() {
        return await this.prismaService.project.findMany({
            include: {
                users: true,
                columns: {
                    include: {
                        tasks: {
                            include: {
                                column: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findOne(id) {
        return await this.prismaService.project.findFirst({
            where: { id },
            include: {
                users: true,
                columns: {
                    include: {
                        tasks: {
                            include: {
                                column: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async update(id, updateProjectInput) {
        const { title, description, userIds, columnIds } = updateProjectInput;
        if (userIds && userIds.length > 0) {
            const users = await this.prismaService.user.findMany({
                where: {
                    id: { in: userIds },
                },
            });
            if (!users) {
                throw new common_1.NotFoundException('User Not found');
            }
        }
        if (columnIds && columnIds.length > 0) {
            const columns = await this.prismaService.column.findMany({
                where: {
                    id: { in: columnIds },
                },
            });
            if (!columns) {
                throw new common_1.NotFoundException('Column Not found');
            }
        }
        return await this.prismaService.project.update({
            where: { id },
            data: {
                title,
                description,
                ...(userIds && {
                    users: {
                        connect: userIds.map((userId) => ({ id: userId })),
                    },
                }),
                ...(columnIds && {
                    columns: {
                        connect: columnIds.map((columnId) => ({ id: columnId })),
                    },
                }),
            },
            include: {
                users: true,
                columns: {
                    include: {
                        tasks: true,
                    },
                },
            },
        });
    }
    async remove(id) {
        return this.prismaService.project.delete({
            where: { id },
        });
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectService);
//# sourceMappingURL=project.service.js.map