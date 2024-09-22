import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { TasksService } from '../../../tasks/tasks.service';
import { PrismaService } from '../../../prisma/prisma.service';

// mocks
import {
  taskMock,
  updateTaskDto,
  createTaskDto,
  updatedTaskMock,
} from '../../mocks/tasks.mocks';

describe('TasksService tests', () => {
  let tasksService: TasksService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [TasksService, PrismaService],
    }).compile();

    tasksService = testModule.get<TasksService>(TasksService);
    prismaService = testModule.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create method', () => {
    it('should create a new task', async () => {
      jest.spyOn(prismaService.task, 'create').mockResolvedValue(taskMock);

      const response = await tasksService.create(createTaskDto);

      expect(response).toEqual(taskMock);
      expect(prismaService.task.create).toHaveBeenCalledTimes(1);
      expect(prismaService.task.create).toHaveBeenCalledWith({
        data: createTaskDto,
      });
    });
  });

  describe('findAll method', () => {
    it('should return an array of tasks', async () => {
      jest.spyOn(prismaService.task, 'findMany').mockResolvedValue([taskMock]);

      const response = await tasksService.findAll();

      expect(response).toEqual([taskMock]);
      expect(prismaService.task.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne method', () => {
    it('should return the task with the specified id', async () => {
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue(taskMock);

      const response = await tasksService.findOne(taskMock.id);

      expect(response).toEqual(taskMock);
      expect(prismaService.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskMock.id },
      });
    });

    it('should throw an error when task is not found', async () => {
      jest
        .spyOn(prismaService.task, 'findUnique')
        .mockRejectedValue(new NotFoundException('task not found'));

      try {
        await tasksService.findOne('incorrect id');
      } catch (error) {
        expect(error).toEqual(new NotFoundException('task not found'));
      }

      expect(prismaService.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'incorrect id' },
      });
    });
  });

  describe('update method', () => {
    it('should update the specified task correctly', async () => {
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue(taskMock);
      jest
        .spyOn(prismaService.task, 'update')
        .mockResolvedValue(updatedTaskMock);

      const response = await tasksService.update(taskMock.id, updateTaskDto);

      expect(response).toEqual(updatedTaskMock);
      expect(prismaService.task.update).toHaveBeenCalledTimes(1);
      expect(prismaService.task.update).toHaveBeenCalledWith({
        where: { id: taskMock.id },
        data: updateTaskDto,
      });
    });

    it('should throw an error when task is not found', async () => {
      jest
        .spyOn(prismaService.task, 'findUnique')
        .mockRejectedValue(new NotFoundException('task not found'));

      try {
        await tasksService.update('incorrect id', updateTaskDto);
      } catch (error) {
        expect(error).toEqual(new NotFoundException('task not found'));
      }

      expect(prismaService.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'incorrect id' },
      });
    });
  });

  describe('remove method', () => {
    it('should delete the specified task', async () => {
      jest.spyOn(prismaService.task, 'findUnique').mockResolvedValue(taskMock);
      jest.spyOn(prismaService.task, 'delete').mockImplementation(jest.fn());

      expect(await tasksService.remove(taskMock.id)).toBeUndefined();

      expect(prismaService.task.delete).toHaveBeenCalledTimes(1);
      expect(prismaService.task.delete).toHaveBeenCalledWith({
        where: { id: taskMock.id },
      });
    });

    it('should throw an error when task is not found', async () => {
      jest
        .spyOn(prismaService.task, 'findUnique')
        .mockRejectedValue(new NotFoundException('task not found'));

      try {
        await tasksService.remove('incorrect id');
      } catch (error) {
        expect(error).toEqual(new NotFoundException('task not found'));
      }

      expect(prismaService.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'incorrect id' },
      });
    });
  });
});
