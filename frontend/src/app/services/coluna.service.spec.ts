
import { TestBed } from '@angular/core/testing';
import { ColunaService } from './coluna.service';

describe('ColunaService', () => {
  let service: ColunaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColunaService);
  });

  it('deve criar uma coluna', () => {
    service.criarColuna('Teste');
    expect(service.getColunas().length).toBe(1);
  });

  it('deve editar uma coluna', () => {
    service.criarColuna('Teste');
    const coluna = service.getColunas()[0];
    service.editarColuna(coluna.id, 'Editado');
    expect(service.getColunas()[0].titulo).toBe('Editado');
  });

  it('deve deletar uma coluna', () => {
    service.criarColuna('Teste');
    const coluna = service.getColunas()[0];
    service.deletarColuna(coluna.id);
    expect(service.getColunas().length).toBe(0);
  });
});
