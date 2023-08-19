import { TestBed } from '@angular/core/testing';

import { ApiGITService } from './api-git.service';

describe('ApiGITService', () => {
  let service: ApiGITService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiGITService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
