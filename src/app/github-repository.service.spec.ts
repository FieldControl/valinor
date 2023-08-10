import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GithubRepositoryService } from './github-repository.service';

describe('GithubRepositoryService', () => {
  let service: GithubRepositoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GithubRepositoryService]
    });
    service = TestBed.inject(GithubRepositoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a GET request to the GitHub API', () => {
    const query = 'angular';

    service.searchRepositories(query).subscribe();

    const req = httpMock.expectOne(`${service['apiUrl']}?q=${query}`);
    expect(req.request.method).toBe('GET');
  });
});
