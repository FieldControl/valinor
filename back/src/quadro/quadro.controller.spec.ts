import { Test, TestingModule } from '@nestjs/testing';
import { QuadroController } from './quadro.controller';
import { QuadroService } from './quadro.service';
import { UsuarioService } from '../usuario/usuario.service';
import { ColunasService } from '../colunas/colunas.service';

describe('QuadroController', () => {
  let controller: QuadroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuadroController],
      providers: [QuadroService, UsuarioService, ColunasService],
    }).compile();

    controller = module.get<QuadroController>(QuadroController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
