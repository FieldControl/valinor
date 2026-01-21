import { Test, TestingModule } from '@nestjs/testing';
import { CandidatoService } from './candidato.service';

describe('CandidatoService', () => {
  let service: CandidatoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidatoService],
    }).compile();

    service = module.get<CandidatoService>(CandidatoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
