import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import {Task} from './entities/task.entity';
import { Lane } from '../lanes/entities/lane.entity';
import { User } from '../users/entities/user.entity';
import { Board } from '../boards/entities/board.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
const mockTaskRepository = () => ({
  insert: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
});

describe('TasksService', () => {
  let service: TasksService;
  let repository: Repository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[],
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useFactory: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should insert a new task', async () => {
      const createTaskDto = { id:1, title: 'Test Task', description: 'Test Description', targetDate: new Date(), status: 1, laneId: 1, taskStatus:1 };
      jest.spyOn(repository, 'insert').mockResolvedValue({generatedMaps: [{
        id: 1,
        status: 1
      }]
    } as any);

      const result = await service.create(createTaskDto);

      expect(repository.insert).toHaveBeenCalledWith(createTaskDto);
      expect(result.generatedMaps).toHaveLength(1);
      expect(result.generatedMaps[0].id).toBe(1);
      expect(result.generatedMaps[0].status).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const tasks = [{ id: 1, title: 'Test Task', description: 'Test Description', status: 1,taskStatus:1, targetDate: new Date(), laneId: 1, lane:new Lane() }];
      jest.spyOn(repository, 'find').mockResolvedValue(tasks);

      const result = await service.findAll();

      expect(result).toEqual(tasks);
      expect(repository.find).toHaveBeenCalledWith({ where: { status: 1 }, loadRelationIds: true });
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      const task = { id: 1, title: 'Test Task', description: 'Test Description', status: 1,taskStatus:1,targetDate: new Date(), laneId: 1, lane:new Lane() };
      jest.spyOn(repository, 'findOne').mockResolvedValue(task);

      const result = await service.findOne(1);

      expect(result).toEqual(task);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1, status: 1 }, loadRelationIds: true });
    });
  });

  describe('update', () => {
    it('should update the task', async () => {
      const task = { id: 1, title: 'Test Task', description: 'Test Description', status: 1,targetDate: new Date(), laneId: 1, lane:new Lane() };
      jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(1, task);

      expect(repository.update).toHaveBeenCalledWith(1, task);
      expect(result).toEqual({ affected: 1 });

    });
  });
  describe('remove', () => {
    it('should soft delete the task', async () => {
      jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);

      const result = await service.remove(1);
      expect(repository.update).toHaveBeenCalled();
      expect(result).toEqual({ affected: 1 });

    });
  });
});
