import { Test, TestingModule } from '@nestjs/testing';
import { ColunasController } from './colunas.controller';

describe('ColunasController', () => {
  let controller: ColunasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColunasController],
    }).compile();

    controller = module.get<ColunasController>(ColunasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
