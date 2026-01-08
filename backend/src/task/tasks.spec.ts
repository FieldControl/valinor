import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service.js';


describe('TasksService', () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskService],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar uma task corretamente', async () => {
    const data = { id: "1", name: 'Nova tarefa', description: 'teste', create_at: new Date() };

    jest.spyOn(service, 'create').mockResolvedValue({
      id: data.id,
      name: data.name,
      description: data.description,
      create_at: data.create_at
    });

    const result = await service.create(data);
    expect(result.name).toBe('Nova tarefa');
  });
});
