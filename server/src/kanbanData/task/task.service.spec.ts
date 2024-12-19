import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TaskService } from './task.service';
import { SubtaskService } from '../subtask/subtask.service';
import { Task } from './task.schema';
import { CreateTaskInput } from './create-task.input';

const mockTask = {
  _id: '1',
  name: 'Test Task',
  description: 'Task description',
  status: 'open',
};

const mockTaskModel = {
  create: jest.fn().mockImplementation((input) => ({
    ...input,
    save: jest.fn().mockResolvedValue({ ...mockTask, ...input }),
  })),
  find: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue([mockTask]),
  })),
  deleteOne: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  })),
  deleteMany: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  })),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
};

const mockSubtaskService = {
  removeManyByTaskIds: jest.fn().mockResolvedValue(true),
};

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: getModelToken(Task.name), useValue: mockTaskModel },
        { provide: SubtaskService, useValue: mockSubtaskService },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('deve retornar tasks pelo status', async () => {
    const status = 'open';

    const result = await service.findByStatus(status);

    expect(mockTaskModel.find).toHaveBeenCalledWith({ status });
    expect(result).toEqual([
      {
        id: mockTask._id.toString(),
        name: mockTask.name,
        description: mockTask.description,
        status: mockTask.status,
      },
    ]);
  });

  it('deve remover uma task e suas subtasks', async () => {
    const id = '1';

    const result = await service.removeTaskAndSubtasks(id);

    expect(mockSubtaskService.removeManyByTaskIds).toHaveBeenCalledWith(id);
    expect(mockTaskModel.deleteOne).toHaveBeenCalledWith({ _id: id });
    expect(result).toBe(true);
  });

  it('deve remover várias tasks por status', async () => {
    const status = 'open';

    const result = await service.removeMany(status);

    expect(mockTaskModel.find).toHaveBeenCalledWith({ status });
    expect(mockSubtaskService.removeManyByTaskIds).toHaveBeenCalled();
    expect(mockTaskModel.deleteMany).toHaveBeenCalledWith({ status });
    expect(result).toBe(true);
  });

  it('deve atualizar o status de uma task', async () => {
    const id = '1';
    const newStatus = 'completed';

    const result = await service.updateStatus(id, newStatus);

    expect(mockTaskModel.updateOne).toHaveBeenCalledWith(
      { _id: id },
      { $set: { status: newStatus } },
    );
    expect(result).toBe(true);
  });

  it('deve atualizar o nome de uma task', async () => {
    const id = '1';
    const newName = 'Updated Task Name';

    const result = await service.updateName(id, newName);

    expect(mockTaskModel.updateOne).toHaveBeenCalledWith(
      { _id: id },
      { $set: { name: newName } },
    );
    expect(result).toBe(true);
  });

  it('deve atualizar a descrição de uma task', async () => {
    const id = '1';
    const newDescription = 'Updated Task Description';

    const result = await service.updateDescription(id, newDescription);

    expect(mockTaskModel.updateOne).toHaveBeenCalledWith(
      { _id: id },
      { $set: { description: newDescription } },
    );
    expect(result).toBe(true);
  });
});
