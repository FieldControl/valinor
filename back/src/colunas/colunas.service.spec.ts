import { Test, TestingModule } from '@nestjs/testing';
import { ColunasService } from './colunas.service';

describe('ColunasService', () => {
  let service: ColunasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColunasService],
    }).compile();

    service = module.get<ColunasService>(ColunasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
