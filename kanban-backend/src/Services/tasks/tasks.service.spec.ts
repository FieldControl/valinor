import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tasks } from '../../Entities/tasks.entity';
import { Repository } from 'typeorm';

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Tasks>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Tasks),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Tasks>>(getRepositoryToken(Tasks));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllTasks', () => {
    it('should return an array of tasks', async () => {
      const expectedTasks = [];
      jest.spyOn(repository, 'find').mockResolvedValue(expectedTasks);

      const result = await service.findAllTasks();
      expect(result).toEqual(expectedTasks);
    });
  });

  describe('findOneTask', () => {
    it('should return a task by ID', async () => {
      const taskId = '1';
      const expectedTask = new Tasks();
      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedTask);

      const result = await service.findOneTask(taskId);
      expect(result).toEqual(expectedTask);
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskDto = {
        title: 'New Task',
        description: 'This is a new task',
        columnId: '1',
      };
      const expectedTask = new Tasks();
      jest.spyOn(repository, 'save').mockResolvedValue(expectedTask);

      const result = await service.createTask(taskDto);
      expect(result).toEqual(expectedTask);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const taskId = '1';
      const updatedTaskDto = {
        title: 'Updated Task',
        description: 'This is an updated task',
        columnId: '2',
      };
      const expectedTask = new Tasks();
      jest.spyOn(repository, 'findOne').mockResolvedValue(expectedTask);
      jest.spyOn(repository, 'save').mockResolvedValue(expectedTask);

      const result = await service.updateTask(taskId, updatedTaskDto);
      expect(result).toEqual(expectedTask);
    });
  });

  describe('removeTask', () => {
    it('should delete a task', async () => {
      const taskId = '1';
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await service.removeTask(taskId);
      expect(repository.delete).toHaveBeenCalledWith(taskId);
    });
  });
});
