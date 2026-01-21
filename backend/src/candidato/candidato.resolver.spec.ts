import { Test, TestingModule } from '@nestjs/testing';
import { CandidatoResolver } from './candidato.resolver';
import { CandidatoService } from './candidato.service';

describe('CandidatoResolver', () => {
  let resolver: CandidatoResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidatoResolver, CandidatoService],
    }).compile();

    resolver = module.get<CandidatoResolver>(CandidatoResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
