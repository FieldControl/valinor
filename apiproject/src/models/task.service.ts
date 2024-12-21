import { randomUUID } from "crypto";
import { PrismaService } from "src/database/prisma.service";

export class Task {
  id?: string;
  title?: string;
  description?: string;
  userId?: string;
  status?: number;
  data?: Date;
  constructor(
    id?: string,
    title?: string,
    description?: string,
    userId?: string,
    status?: number,
    data?: Date,
  ) {
    this.id = id ? id : randomUUID();
    this.title = title;
    this.description = description;
    this.userId = userId;
    this.status = status;
    this.data = data ? data : new Date();
  }
  async getTasksByUserId(userId: string) {
    const prisma = new PrismaService();
    const userTasks = await prisma.tesks.findMany({
      where: {
        userId: userId,
      },
    });
    return userTasks;
  }
  async getTaskById(id: string) {
    const prisma = new PrismaService();
    const task = await prisma.tesks.findUnique({
      where: {
        id: id,
      },
    });
    return task;
  }
  async postTask(task: Task) {
    const prisma = new PrismaService();
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
  async putTask(task: Task) {
    const prisma = new PrismaService();
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
  async deleteTask(id: string) {
    const prisma = new PrismaService();
    const deletedTask = await prisma.tesks.delete({
      where: {
        id: id,
      },
    });
    return deletedTask;
  }
}
