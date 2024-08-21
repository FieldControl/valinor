import { Test, TestingModule } from '@nestjs/testing';
import { ColunaService } from './coluna.service';

describe('ColunaService', () => {
  let service: ColunaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColunaService],
    }).compile();

    service = module.get<ColunaService>(ColunaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
