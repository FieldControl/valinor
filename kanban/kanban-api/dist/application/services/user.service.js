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
exports.UserService = void 0;
const prisma_service_1 = require("../../infra/data/client/prisma.service");
const common_1 = require("@nestjs/common");
const bcrypt_1 = require("bcrypt");
let UserService = class UserService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async create(createUserInput) {
        const { email, password } = createUserInput;
        const pass = password ? (0, bcrypt_1.hashSync)(password, 10) : undefined;
        const user = await this.prismaService.user.findFirst({
            where: { email },
        });
        if (user) {
            throw new common_1.NotFoundException('This email is already in use.');
        }
        return await this.prismaService.user.create({
            data: {
                ...createUserInput,
                password: pass,
            },
        });
    }
    async findAll() {
        return await this.prismaService.user.findMany({
            include: {
                projects: {
                    include: {
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
                },
            },
        });
    }
    async findOne(id) {
        return await this.prismaService.user.findFirst({
            where: { id },
            include: {
                projects: {
                    include: {
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
                },
            },
        });
    }
    async update(id, updateUserInput) {
        const { name, email, password, projectIds } = updateUserInput;
        const pass = password ? (0, bcrypt_1.hashSync)(password, 10) : undefined;
        if (projectIds && projectIds.length > 0) {
            const projects = await this.prismaService.project.findMany({
                where: {
                    id: { in: projectIds },
                },
            });
            if (projects.length !== projectIds.length) {
                throw new common_1.NotFoundException('One or more project IDs not found');
            }
        }
        return await this.prismaService.user.update({
            where: { id },
            data: {
                name,
                email,
                ...(pass && { password: pass }),
                ...(projectIds && {
                    projects: {
                        connect: projectIds.map((projectId) => ({ id: projectId })),
                    },
                }),
            },
        });
    }
    async remove(id) {
        return this.prismaService.user.delete({
            where: { id },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map