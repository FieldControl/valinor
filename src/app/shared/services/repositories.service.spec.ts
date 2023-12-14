import { TestBed } from '@angular/core/testing';

import { RepositoriesService } from './repositories.service';

describe('RepositoriesService', () => {
  let service: RepositoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepositoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
