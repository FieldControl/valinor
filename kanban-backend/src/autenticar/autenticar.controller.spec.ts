import { Test, TestingModule } from '@nestjs/testing';
import { AutenticarController } from './autenticar.controller';
import { AutenticarService } from './autenticar.service';

describe('AutenticarController', () => {
  let controller: AutenticarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutenticarController],
      providers: [AutenticarService],
    }).compile();

    controller = module.get<AutenticarController>(AutenticarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
