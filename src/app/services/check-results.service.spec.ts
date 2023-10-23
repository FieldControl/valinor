import { TestBed } from '@angular/core/testing';

import { CheckResultsService } from './check-results.service';

describe('CheckResultsService', () => {
  let service: CheckResultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
