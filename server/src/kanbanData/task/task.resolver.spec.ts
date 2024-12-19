import { Test, TestingModule } from '@nestjs/testing';
import { TaskResolver } from './task.resolver';
import { TaskService } from './task.service';
import { CreateTaskInput } from './create-task.input';


const mockTask = {
  _id: '1',
  name: 'Task Test',
  description: 'Task description',
  status: 'open',
};

const mockTaskService = {
  create: jest.fn().mockResolvedValue(mockTask),
  findByStatus: jest.fn().mockResolvedValue([mockTask]),
  removeTaskAndSubtasks: jest.fn().mockResolvedValue(true),
  removeMany: jest.fn().mockResolvedValue(true),
  updateName: jest.fn().mockResolvedValue(true),
  updateStatus: jest.fn().mockResolvedValue(true),
  updateDescription: jest.fn().mockResolvedValue(true),
};

describe('TaskResolver', () => {
  let resolver: TaskResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskResolver,
        { provide: TaskService, useValue: mockTaskService },
      ],
    }).compile();

    resolver = module.get<TaskResolver>(TaskResolver);
  });

  it('deve criar uma task', async () => {
    const input: CreateTaskInput = {
      name: 'Task Test',
      description: 'Task description',
      status: 'open',
    };

    const result = await resolver.createTask(input);

    expect(mockTaskService.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({
      id: mockTask._id.toString(),
      name: mockTask.name,
      description: mockTask.description,
      status: mockTask.status,
    });
  });

  it('deve retornar tasks pelo status', async () => {
    const status = 'open';

    const result = await resolver.getTasksByStatus(status);

    expect(mockTaskService.findByStatus).toHaveBeenCalledWith(status);
    expect(result).toEqual([mockTask]);
  });

  it('deve deletar uma task', async () => {
    const id = '1';

    const result = await resolver.deleteTask(id);

    expect(mockTaskService.removeTaskAndSubtasks).toHaveBeenCalledWith(id);
    expect(result).toBe(true);
  });

  it('deve deletar tasks por status', async () => {
    const status = 'open';

    const result = await resolver.deleteTaskByStatus(status);

    expect(mockTaskService.removeMany).toHaveBeenCalledWith(status);
    expect(result).toBe(true);
  });

  it('deve atualizar o nome da task', async () => {
    const id = '1';
    const newName = 'Updated Task Name';

    const result = await resolver.updateName(id, newName);

    expect(mockTaskService.updateName).toHaveBeenCalledWith(id, newName);
    expect(result).toBe(true);
  });

  it('deve atualizar o status da task', async () => {
    const id = '1';
    const newStatus = 'completed';

    const result = await resolver.updateStatus(id, newStatus);

    expect(mockTaskService.updateStatus).toHaveBeenCalledWith(id, newStatus);
    expect(result).toBe(true);
  });

  it('deve atualizar a descrição da task', async () => {
    const id = '1';
    const newDescription = 'Updated Task Description';

    const result = await resolver.updateDescription(id, newDescription);

    expect(mockTaskService.updateDescription).toHaveBeenCalledWith(
      id,
      newDescription,
    );
    expect(result).toBe(true);
  });
});
