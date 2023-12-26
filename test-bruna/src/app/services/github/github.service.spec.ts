import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { GithubService } from './github.service';

describe('GithubService', () => {
  let service: GithubService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GithubService]
    });

    service = TestBed.inject(GithubService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve repositories from the API', () => {
    const query = 'angular';
    const page = 1;
    const perPage = 10;
    const mockRepos = [{ id: 1, name: 'Repo 1' }, { id: 2, name: 'Repo 2' }];
  
    service.getRepos(query, page, perPage).subscribe(repos => {
      expect(repos).toEqual({ items: mockRepos, total_count: 2 });
    });
  
    const req = httpTestingController.expectOne(request => {
      return request.url === 'https://api.github.com/search/repositories' &&
        request.method === 'GET' &&
        request.params.get('q') === query &&
        request.params.get('page') === page.toString() &&
        request.params.get('per_page') === perPage.toString();
    });
  
    req.flush({ items: mockRepos, total_count: 2 });
  })
});
