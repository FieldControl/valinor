import { TestBed } from '@angular/core/testing';

import { FormatarNumerosService } from './formatar-numeros.service';

describe('FormatarNumerosService', () => {
  let service: FormatarNumerosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormatarNumerosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve retornar os valores corretamente formatado', () => {
    expect(service.formataNumero(1000)).toEqual('1.0k');
    expect(service.formataNumero(1000000)).toEqual('1.0mi');
    expect(service.formataNumero(1000000000)).toEqual('1.0bi');
    expect(service.formataNumero(0)).toEqual('0');
  });
});
