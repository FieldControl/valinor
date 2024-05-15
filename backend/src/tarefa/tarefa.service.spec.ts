import { Test, TestingModule } from '@nestjs/testing';
import { TarefaService } from './tarefa.service';

describe('TarefaService', () => {
  let service: TarefaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TarefaService],
    }).compile();

    service = module.get<TarefaService>(TarefaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
