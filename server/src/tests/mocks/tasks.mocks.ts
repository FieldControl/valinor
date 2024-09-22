import { Task } from '@prisma/client';
import { randomUUID } from 'crypto';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { UpdateTaskDto } from 'src/tasks/dto/update-task.dto';

export const taskMock: Task = {
  id: randomUUID(),
  title: 'Test task',
  description: 'Task description',
  position: 1,
  columnId: randomUUID(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const updatedTaskMock: Task = {
  id: taskMock.id,
  title: 'Updated title',
  description: 'Updated description',
  position: taskMock.position,
  columnId: taskMock.columnId,
  createdAt: taskMock.createdAt,
  updatedAt: taskMock.updatedAt,
};

export const createTaskDto: CreateTaskDto = {
  title: 'Test task',
  description: 'Task description',
  columnId: taskMock.columnId,
};

export const updateTaskDto: UpdateTaskDto = {
  title: 'Updated title',
  description: 'Updated description',
};
