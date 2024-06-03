import { Test, TestingModule } from '@nestjs/testing';
import { ColunasController } from './colunas.controller';
import { ColunasService } from './colunas.service';

describe('ColunasController', () => {
  let controller: ColunasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColunasController],
      providers: [ColunasService],
    }).compile();

    controller = module.get<ColunasController>(ColunasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
