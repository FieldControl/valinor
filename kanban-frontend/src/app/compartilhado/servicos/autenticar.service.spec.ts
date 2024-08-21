import { TestBed } from '@angular/core/testing';

import { AutenticarService } from './autenticar.service';

describe('AutenticarService', () => {
  let service: AutenticarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutenticarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
