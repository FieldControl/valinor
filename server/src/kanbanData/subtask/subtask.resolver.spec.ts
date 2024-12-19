import { Test, TestingModule } from '@nestjs/testing';
import { SubtaskResolver } from './subtask.resolver';
import { SubtaskService } from './subtask.service';
import { CreateSubtaskInput } from './create-subtask.input';

const mockSubtask = {
  id: '1',
  name: 'Subtask Test',
  isCompleted: false,
  task: 'task-id',
};

const mockSubtaskService = {
  create: jest.fn().mockResolvedValue({
    _id: '1',
    name: 'Subtask Test',
    isCompleted: false,
    task: 'task-id',
  }),
  findByTask: jest.fn().mockResolvedValue([mockSubtask]),
  remove: jest.fn().mockResolvedValue(true),
  update: jest.fn().mockResolvedValue(true),
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
    const input: CreateSubtaskInput = { name: 'Subtask Test', task: 'task-id' };
    const result = await resolver.createSubtask(input);

    expect(mockSubtaskService.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockSubtask);
  });

  it('deve buscar subtasks por tarefa', async () => {
    const result = await resolver.getSubtasksByTask('task-id');

    expect(mockSubtaskService.findByTask).toHaveBeenCalledWith('task-id');
    expect(result).toEqual([mockSubtask]);
  });

  it('deve deletar uma subtask', async () => {
    const result = await resolver.deleteSubtask('1');

    expect(mockSubtaskService.remove).toHaveBeenCalledWith('1');
    expect(result).toBe(true);
  });

  it('deve atualizar uma subtask', async () => {
    const result = await resolver.updateSubtask('1', true);

    expect(mockSubtaskService.update).toHaveBeenCalledWith('1', true);
    expect(result).toBe(true);
  });
});
