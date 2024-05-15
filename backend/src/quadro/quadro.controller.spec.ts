import { Test, TestingModule } from '@nestjs/testing';
import { QuadroController } from './quadro.controller';
import { QuadroService } from './quadro.service';

describe('QuadroController', () => {
  let controller: QuadroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuadroController],
      providers: [QuadroService],
    }).compile();

    controller = module.get<QuadroController>(QuadroController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
