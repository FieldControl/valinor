import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GithubService } from './github.service';

describe('GithubService', () => {
  let service: GithubService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GithubService]
    });
    service = TestBed.inject(GithubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should send a GET request to the correct API endpoint', () => {
    const page = 1;
    const perPage = 10;

    service.getRepos(page, perPage).subscribe();

    const req = httpMock.expectOne(`https://api.github.com/search/repositories?q=node&page=${page}&per_page=${perPage}`);
    expect(req.request.method).toBe('GET');
  });
});