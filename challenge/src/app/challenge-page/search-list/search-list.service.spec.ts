import { TestBed } from '@angular/core/testing';

import { SearchListService } from './search-list.service';

describe('SearchListService', () => {
  let service: SearchListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
