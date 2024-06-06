import { TestBed } from '@angular/core/testing';

import { QuadroService } from './quadro.service';

describe('QuadroService', () => {
  let service: QuadroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuadroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
