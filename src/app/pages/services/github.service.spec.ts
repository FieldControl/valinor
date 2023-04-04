import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GithubService } from './github.service';
import { Repositories } from 'src/app/models/repositories.model';
import { Issues } from 'src/app/models/issues.model';

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
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get repositories', () => {   
    const mockResponse = {
      total_count: 1,
      incomplete_results: false,
      items: [
        { id: 123, name: 'repo1' },
        { id: 456, name: 'repo2' }
      ]
    } as Repositories;
    const searchTerm = 'angular';
    const page = 1;

    service.getRepositories(searchTerm, page).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne('https://api.github.com/search/repositories?q=angular&page=1');
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);

  });

  it('should get issues', () => {
    const mockResponse = {
      total_count: 1,
      incomplete_results: false,
      items: [
        { id: 123, title: 'issue1' },
        { id: 456, title: 'issue2' }
      ]
    } as Issues ;
    const username = 'octocat';
    const reponame = 'Hello-World';
    const page = 1;

    service.getIssues(username, reponame, page).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(`https://api.github.com/search/issues?q=repo:${username}/${reponame}&page=${page}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });


});
