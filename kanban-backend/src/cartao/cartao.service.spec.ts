import { Test, TestingModule } from '@nestjs/testing';
import { CartaoService } from './cartao.service';

describe('CartaoService', () => {
  let service: CartaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartaoService],
    }).compile();

    service = module.get<CartaoService>(CartaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
