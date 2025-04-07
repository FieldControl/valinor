import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from '../../src/task/task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../../src/task/task.entity';
import { Repository } from 'typeorm';

describe('TaskService', () => {
  let service: TaskService;

  let mockTaskRepository: Partial<Record<keyof Repository<Task>, jest.Mock>>;

  beforeEach(async () => {
    mockTaskRepository = {
      create: jest.fn().mockImplementation((task: Partial<Task>): Task => {
        return { id: 1, ...task } as Task;
      }),
      save: jest.fn().mockImplementation((task: Task): Promise<Task> => {
        return Promise.resolve(task);
      }),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should create a new task', async () => {
    const taskDto = { name: 'Nova tarefa', column: 'A Fazer' };

    const result = await service.create(taskDto);

    expect(mockTaskRepository.create).toHaveBeenCalledWith(taskDto);
    expect(mockTaskRepository.save).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, ...taskDto });
  });

  it('should return all tasks', async () => {
    const tasks = [
      { id: 1, name: 'Tarefa 1', column: 'A Fazer' },
      { id: 2, name: 'Tarefa 2', column: 'Feito' },
    ];
    mockTaskRepository.find!.mockResolvedValue(tasks);

    const result = await service.findAll();
    expect(result).toEqual(tasks);
  });

  it('should update a task', async () => {
    const taskDto = { name: 'Atualizada', column: 'Feito' };
    const updatedTask = { id: 1, ...taskDto };

    mockTaskRepository.findOne!.mockResolvedValue(updatedTask);

    const result = await service.update(1, taskDto);
    expect(result).toEqual(updatedTask);
  });

  it('should delete a task', async () => {
    mockTaskRepository.findOne!.mockResolvedValue({
      id: 1,

      name: 'Tarefa Teste',
      column: 'Feito',
    });
    await service.delete(1);
    expect(mockTaskRepository.delete).toHaveBeenCalledWith(1);
  });
});
