import { TestBed } from '@angular/core/testing';

import { JogadorService } from './jogador.service';

describe('JogadorService', () => {
  let service: JogadorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JogadorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
