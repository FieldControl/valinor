import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { TasksController } from '../../../tasks/tasks.controller';
import { TasksService } from '../../../tasks/tasks.service';

// mocks
import {
  taskMock,
  updateTaskDto,
  createTaskDto,
  updatedTaskMock,
} from '../../mocks/tasks.mocks';

describe('TasksController tests', () => {
  let tasksController: TasksController;

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    tasksController = testModule.get<TasksController>(TasksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create method', () => {
    it('should create a new task', async () => {
      jest.spyOn(mockTasksService, 'create').mockResolvedValue(taskMock);

      const response = await tasksController.create(createTaskDto);

      expect(response).toEqual(taskMock);
      expect(mockTasksService.create).toHaveBeenCalledTimes(1);
      expect(mockTasksService.create).toHaveBeenCalledWith(createTaskDto);
    });
  });

  describe('findAll method', () => {
    it('should return an array of tasks', async () => {
      jest.spyOn(mockTasksService, 'findAll').mockResolvedValue([taskMock]);

      const response = await tasksController.findAll();

      expect(response).toEqual([taskMock]);
      expect(mockTasksService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne method', () => {
    it('should return the task with the specified id', async () => {
      jest.spyOn(mockTasksService, 'findOne').mockResolvedValue(taskMock);

      const response = await mockTasksService.findOne(taskMock.id);

      expect(response).toEqual(taskMock);
      expect(mockTasksService.findOne).toHaveBeenCalledTimes(1);
      expect(mockTasksService.findOne).toHaveBeenCalledWith(taskMock.id);
    });

    it('should throw an error when task is not found', async () => {
      jest
        .spyOn(mockTasksService, 'findOne')
        .mockRejectedValue(new NotFoundException('task not found'));

      try {
        await mockTasksService.findOne('incorrect id');
      } catch (error) {
        expect(error).toEqual(new NotFoundException('task not found'));
      }

      expect(mockTasksService.findOne).toHaveBeenCalledTimes(1);
      expect(mockTasksService.findOne).toHaveBeenCalledWith('incorrect id');
    });
  });

  describe('update method', () => {
    it('should update the specified task correctly', async () => {
      jest.spyOn(mockTasksService, 'update').mockResolvedValue(updatedTaskMock);

      const response = await mockTasksService.update(
        taskMock.id,
        updateTaskDto,
      );

      expect(response).toEqual(updatedTaskMock);
      expect(mockTasksService.update).toHaveBeenCalledTimes(1);
      expect(mockTasksService.update).toHaveBeenCalledWith(
        taskMock.id,
        updateTaskDto,
      );
    });

    it('should throw an error when task is not found', async () => {
      jest
        .spyOn(mockTasksService, 'update')
        .mockRejectedValue(new NotFoundException('task not found'));

      try {
        await mockTasksService.update('incorrect id', updateTaskDto);
      } catch (error) {
        expect(error).toEqual(new NotFoundException('task not found'));
      }

      expect(mockTasksService.update).toHaveBeenCalledTimes(1);
      expect(mockTasksService.update).toHaveBeenCalledWith(
        'incorrect id',
        updateTaskDto,
      );
    });
  });

  describe('remove method', () => {
    it('should remove the specified task', async () => {
      jest.spyOn(mockTasksService, 'remove').mockImplementation(jest.fn());

      expect(await mockTasksService.remove(taskMock.id)).toBeUndefined();

      expect(mockTasksService.remove).toHaveBeenCalledTimes(1);
      expect(mockTasksService.remove).toHaveBeenCalledWith(taskMock.id);
    });

    it('should throw an error when task is not found', async () => {
      jest
        .spyOn(mockTasksService, 'remove')
        .mockRejectedValue(new NotFoundException('task not found'));

      try {
        await mockTasksService.remove('incorrect id');
      } catch (error) {
        expect(error).toEqual(new NotFoundException('task not found'));
      }

      expect(mockTasksService.remove).toHaveBeenCalledTimes(1);
      expect(mockTasksService.remove).toHaveBeenCalledWith('incorrect id');
    });
  });
});
