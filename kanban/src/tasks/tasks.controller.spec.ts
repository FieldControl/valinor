import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository, UpdateResult } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Lane } from '../lanes/entities/lane.entity';
import { Board } from '../boards/entities/board.entity';
import { User } from '../users/entities/user.entity';

const mockTaskRepository = () => ({
  insert: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn()
});

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;
  let repository: Repository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        
      ],
      controllers: [TasksController],
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useFactory: mockTaskRepository,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto = { title: 'Test Task', description: 'Test Description', targetDate: new Date(), status: 1, laneId: 1, lane: new Lane() };
      jest.spyOn(service, 'create').mockResolvedValue({
        generatedMaps: [{
          id: 1,
          status: 1
        }]
      } as any);
      const result = await controller.create(createTaskDto);
      expect(result.generatedMaps).toHaveLength(1);
      expect(result.generatedMaps[0].id).toBe(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const task = [{ id: 1, title: 'Test Task', description: 'Test Description' , targetDate: new Date(), taskStatus:1, status: 1, laneId: 1, lane: new Lane()}];
      jest.spyOn(service, 'findAll').mockResolvedValue(task);
      const result = await controller.findAll();
      expect(result).toBe(task);
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      const task = { id: 1, title: 'Test Task', taskStatus:1, description: 'Test Description' , targetDate: new Date(), status: 1, laneId: 1, lane: new Lane()};
      jest.spyOn(service, 'findOne').mockResolvedValue(task);
      const result = await controller.findOne('1');
      expect(result).toBe(task);
    });
  });
  describe('remove', () => {
    it('should remove a single task', async () => {
      const task = { id: 1, title: 'Test Task', description: 'Test Description' , targetDate: new Date(), status: 1, laneId: 1, lane: new Lane()};
      jest.spyOn(service, 'remove').mockResolvedValue({affected:1} as UpdateResult);
      const result = await controller.remove('1');
      expect(result.affected).toBe(1);
    });
  });
});