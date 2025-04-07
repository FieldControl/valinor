import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from '../task/task.controller';
import { TaskService } from '../task/task.service';

describe('TaskController', () => {
  let controller: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            findAll: jest
              .fn()
              .mockResolvedValue([
                { id: 1, name: 'Test Task', column: 'A Fazer', comments: [] },
              ]),
            create: jest.fn().mockResolvedValue({
              id: 1,
              name: 'New Task',
              column: 'A Fazer',
              comments: [],
            }),
            update: jest.fn().mockResolvedValue({
              id: 1,
              name: 'Updated Task',
              column: 'Em Progresso',
            }),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all tasks', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([
      { id: 1, name: 'Test Task', column: 'A Fazer', comments: [] },
    ]);
  });

  it('should create a new task', async () => {
    const taskDto = { name: 'New Task', column: 'A Fazer', comments: [] };
    const result = await controller.create(taskDto);
    expect(result).toEqual({
      id: 1,
      name: 'New Task',
      column: 'A Fazer',
      comments: [],
    });
  });

  it('should update a task', async () => {
    const taskDto = { name: 'Updated Task', column: 'Em Progresso' };
    const result = await controller.update(1, taskDto);
    expect(result).toEqual({
      id: 1,
      name: 'Updated Task',
      column: 'Em Progresso',
    });
  });

  it('should delete a task', async () => {
    console.log(1);

    const result = await controller.delete(1);
    expect(result).toBeUndefined();
  });
});
