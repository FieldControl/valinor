import { TestBed } from '@angular/core/testing';

import { ProjetosService } from './repositorios.service';

describe('ProjetosService', () => {
  let service: ProjetosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjetosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
