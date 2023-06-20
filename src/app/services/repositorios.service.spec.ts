import { TestBed } from '@angular/core/testing';

import { RepositoriosService } from './repositorios.service';

describe('RepositoriosService', () => {
  let service: RepositoriosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepositoriosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
