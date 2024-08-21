import { TestBed } from '@angular/core/testing';

import { ColunaService } from './coluna.service';

describe('ColunaService', () => {
  let service: ColunaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColunaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
