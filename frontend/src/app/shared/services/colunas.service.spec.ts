import { TestBed } from '@angular/core/testing';

import { ColunasService } from './colunas.service';

describe('ColunasService', () => {
  let service: ColunasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColunasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
