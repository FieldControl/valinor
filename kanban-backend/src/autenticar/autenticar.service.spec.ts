import { Test, TestingModule } from '@nestjs/testing';
import { AutenticarService } from './autenticar.service';

describe('AutenticarService', () => {
  let service: AutenticarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutenticarService],
    }).compile();

    service = module.get<AutenticarService>(AutenticarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
