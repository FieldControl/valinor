import { TestBed } from '@angular/core/testing';

import { GitRepositoryService } from './git-repository.service';

describe('GitRepositoryService', () => {
  let service: GitRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GitRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
