import { Test, TestingModule } from '@nestjs/testing';
import { QuadroService } from './quadro.service';

describe('QuadroService', () => {
  let service: QuadroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuadroService],
    }).compile();

    service = module.get<QuadroService>(QuadroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
