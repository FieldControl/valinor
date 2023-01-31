import { TestBed } from '@angular/core/testing';

import { RepositorioService } from './repositorio.service';

describe('RepositorioService', () => {
  let service: RepositorioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepositorioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
