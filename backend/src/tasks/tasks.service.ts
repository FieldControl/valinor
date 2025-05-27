import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    return await this.prisma.task.create({
      data: {
        name: createTaskDto.name.trim(),
        columnId: createTaskDto.columnId,
        order: createTaskDto.order,
      },
    });
  }

  async getByColumn(id: string) {
    return await this.prisma.task.findMany({
      where: { columnId: id },
    });
  }

  async update(id: string, updateTaskDto: CreateTaskDto) {
    return await this.prisma.task.update({
      where: { id },
      data: {
        name: updateTaskDto.name.trim(),
        columnId: updateTaskDto.columnId,
        order: updateTaskDto.order,
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.task.delete({
      where: { id },
    });
  }

  async updateTaskColumn(id: string, columnId: string) {
    // Verifica se a coluna existe
    const columnExists = await this.prisma.column.findUnique({
      where: { id: columnId }
    });
  
    if (!columnExists) {
      throw new NotFoundException('Column not found');
    }
  
    return this.prisma.task.update({
      where: { id },
      data: { columnId },
    });
  }
}
