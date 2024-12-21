"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const crypto_1 = require("crypto");
const prisma_service_1 = require("../database/prisma.service");
class Task {
    constructor(id, title, description, userId, status, data) {
        this.id = id ? id : (0, crypto_1.randomUUID)();
        this.title = title;
        this.description = description;
        this.userId = userId;
        this.status = status;
        this.data = data ? data : new Date();
    }
    async getTasksByUserId(userId) {
        const prisma = new prisma_service_1.PrismaService();
        const userTasks = await prisma.tesks.findMany({
            where: {
                userId: userId,
            },
        });
        return userTasks;
    }
    async getTaskById(id) {
        const prisma = new prisma_service_1.PrismaService();
        const task = await prisma.tesks.findUnique({
            where: {
                id: id,
            },
        });
        return task;
    }
    async postTask(task) {
        const prisma = new prisma_service_1.PrismaService();
        console.log(task);
        const newTask = await prisma.tesks.create({
            data: {
                id: task.id,
                title: task.title,
                description: task.description,
                userId: task.userId,
                status: task.status,
                data: task.data,
            },
        });
        return newTask;
    }
    async putTask(task) {
        const prisma = new prisma_service_1.PrismaService();
        const updatedTask = await prisma.tesks.update({
            where: {
                id: task.id,
            },
            data: {
                title: task.title,
                description: task.description,
                userId: task.userId,
                status: task.status,
                data: task.data,
            },
        });
        return updatedTask;
    }
    async deleteTask(id) {
        const prisma = new prisma_service_1.PrismaService();
        const deletedTask = await prisma.tesks.delete({
            where: {
                id: id,
            },
        });
        return deletedTask;
    }
}
exports.Task = Task;
//# sourceMappingURL=task.service.js.map