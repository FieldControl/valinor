import { TestBed } from '@angular/core/testing';

import { MarvelSearchService } from './marvel-search.service';

describe('MarvelSearchService', () => {
  let service: MarvelSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarvelSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
