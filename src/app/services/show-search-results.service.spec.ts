import { TestBed } from '@angular/core/testing';

import { ShowSearchResultsService } from './show-search-results.service';

describe('ShowSearchResultsService', () => {
  let service: ShowSearchResultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShowSearchResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
