import { Test, TestingModule } from '@nestjs/testing';
import { SubtaskResolver } from './subtask.resolver';
import { SubtaskService } from './subtask.service';

const mockSubtask = {
  _id: '1',
  name: 'Subtask Test',
  isCompleted: false,
  task: 'task-id',
};

const mockSubtaskService = {
  create: jest.fn().mockResolvedValue(mockSubtask),
  findByTask: jest.fn().mockResolvedValue([mockSubtask]),
};

describe('SubtaskResolver', () => {
  let resolver: SubtaskResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtaskResolver,
        { provide: SubtaskService, useValue: mockSubtaskService },
      ],
    }).compile();

    resolver = module.get<SubtaskResolver>(SubtaskResolver);
  });

  it('deve criar uma subtask', async () => {
    const result = await resolver.createSubtask({
      name: 'Subtask Test',
      task: 'task-id',
    });
    expect(mockSubtaskService.create).toHaveBeenCalledWith({
      name: 'Subtask Test',
      task: 'task-id',
    });
    expect(result).toEqual({
      id: '1',
      name: 'Subtask Test',
      isCompleted: false,
      task: 'task-id',
    });
  });

  it('deve buscar subtasks por tarefa', async () => {
    const result = await resolver.getSubtasksByTask('task-id');
    expect(mockSubtaskService.findByTask).toHaveBeenCalledWith('task-id');
    expect(result).toEqual([mockSubtask]);
  });
});
