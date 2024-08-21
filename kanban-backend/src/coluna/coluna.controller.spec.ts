import { Test, TestingModule } from '@nestjs/testing';
import { ColunaController } from './coluna.controller';
import { ColunaService } from './coluna.service';

describe('ColunaController', () => {
  let controller: ColunaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColunaController],
      providers: [ColunaService],
    }).compile();

    controller = module.get<ColunaController>(ColunaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
