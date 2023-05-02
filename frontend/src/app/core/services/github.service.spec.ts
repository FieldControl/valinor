import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GithubService } from './github.service';
import { HttpClient } from '@angular/common/http';

describe('GithubService', () => {
  let service: GithubService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GithubService, HttpClient],
    });
    service = TestBed.inject(GithubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchRepository', () => {
    it('should return an Observable<Object>', () => {
      const repository = 'br';
      const page = 1;

      const result = {
        items: [{ id: 1, name: 'repo1' }, { id: 2, name: 'repo2' }],
      };

      service.searchRepository(repository, page).subscribe((res) => {
        expect(res).toEqual(result);
      });

      const req = httpMock.expectOne(
        `https://api.github.com/search/repositories?q=${repository}&page=1&per_page=5`
      );
      expect(req.request.method).toBe('GET');
      req.flush(result);
    });
  });
});
