"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
const crypto_1 = require("crypto");
const prisma_service_1 = require("../database/prisma.service");
class Users {
    constructor(id, name, email, password) {
        this.id = id ? id : (0, crypto_1.randomUUID)();
        this.name = name;
        this.email = email;
        this.password = password;
    }
    async postUser(user) {
        const prisma = new prisma_service_1.PrismaService();
        const newUser = await prisma.users.create({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
            },
        });
        return {
            newUser,
        };
    }
    async putUser(user) {
        const prisma = new prisma_service_1.PrismaService();
        console.log(user);
        const updateUser = await prisma.users.update({
            where: {
                id: user.id,
            },
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
            },
        });
        return {
            updateUser,
        };
    }
    async deleteUser(id) {
        const prisma = new prisma_service_1.PrismaService();
        try {
            const deleteUser = await prisma.users.delete({
                where: {
                    id: id,
                },
            });
            return {
                deleteUser,
            };
        }
        catch (error) {
            console.log(error);
            return {
                error: error,
            };
        }
    }
    async login(email, password) {
        const prisma = new prisma_service_1.PrismaService();
        const user = await prisma.users.findFirst({
            where: {
                email: email,
                password: password,
            },
        });
        return {
            user,
        };
    }
}
exports.Users = Users;
//# sourceMappingURL=user.service.js.map