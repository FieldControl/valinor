import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SearchService]
    });
    service = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should search and emit data correctly', () => {
    const searchResult = { items: [], total_count: 1381 };
    const searchTerm = 'field-control';
    const page = 1;

    service.search(searchTerm, page);

    const req = httpMock.expectOne(`https://api.github.com/search/repositories?q=${searchTerm}&per_page=${service.maxRepositoriesPerPage}&page=${page}`);
    expect(req.request.method).toBe('GET');

    req.flush(searchResult);

    service.searchData$.subscribe((data) => {
      expect(data).toEqual(searchResult.items);
    });

    service.totalCount$.subscribe((totalCount) => {
      expect(totalCount).toEqual(searchResult.total_count);
    });
  });

  it('should fetch 6 items per page', () => {
    const searchTerm = 'node'; 
    const totalPages = 10; 
    for (let page = 1; page <= totalPages; page++) {
      service.search(searchTerm, page);

      const req = httpMock.expectOne(`https://api.github.com/search/repositories?q=${searchTerm}&per_page=${service.maxRepositoriesPerPage}&page=${page}`);
      expect(req.request.method).toBe('GET');

      const searchResult = generateSearchResultWithSixItems(); // Replace this with a function that generates a search result with 6 items
      req.flush(searchResult);

      service.searchData$.subscribe((data) => {
        expect(data).toEqual(searchResult.items);
        expect(data.length).toBe(6);
      });
    }
  });

});

function generateSearchResultWithSixItems() {
  return {
    items: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
      { id: 4, name: 'Item 4' },
      { id: 5, name: 'Item 5' },
      { id: 6, name: 'Item 6' },
    ],
    total_count: 60,
  };
}
