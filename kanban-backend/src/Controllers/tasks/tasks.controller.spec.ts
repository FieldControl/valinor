import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from '../../Services/tasks/tasks.service';
import { TasksDto } from '../../DTO/tasks.dto';
import { Tasks } from '../../Entities/tasks.entity';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            findAllTasks: jest.fn(),
            findOneTask: jest.fn(),
            createTask: jest.fn(),
            updateTask: jest.fn(),
            removeTask: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllTasks', () => {
    it('should return an array of tasks', async () => {
      const expectedTasks = [new Tasks()];
      jest.spyOn(service, 'findAllTasks').mockResolvedValue(expectedTasks);

      const result = await controller.findAllTasks();
      expect(result).toEqual(expectedTasks);
    });
  });

  describe('findTaskByID', () => {
    it('should return a task by ID', async () => {
      const taskId = '1';
      const expectedTask = new Tasks();
      jest.spyOn(service, 'findOneTask').mockResolvedValue(expectedTask);

      const result = await controller.findTaskByID(taskId);
      expect(result).toEqual(expectedTask);
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskDto: TasksDto = {
        title: 'New Task',
        description: 'This is a new task',
        columnId: '1',
      };
      const expectedTask = new Tasks();
      jest.spyOn(service, 'createTask').mockResolvedValue(expectedTask);

      const result = await controller.createTask(taskDto);
      expect(result).toEqual(expectedTask);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const taskId = '1';
      const taskDto: TasksDto = {
        title: 'Updated Task',
        description: 'This is an updated task',
        columnId: '2',
      };
      const expectedTask = new Tasks();
      jest.spyOn(service, 'updateTask').mockResolvedValue(expectedTask);

      const result = await controller.updateTask(taskId, taskDto);
      expect(result).toEqual(expectedTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const taskId = '1';
      jest.spyOn(service, 'removeTask').mockResolvedValue(undefined);

      await controller.deleteTask(taskId);
      expect(service.removeTask).toHaveBeenCalledWith(taskId);
    });
  });
});
