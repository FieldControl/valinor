import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpParams } from '@angular/common/http';

import { GithubService } from './github.service';

import { environment } from 'src/environments/environment';

describe('GithubService', () => {
  let apiUrl: string = environment.gitHubApiUrl;
  let service: GithubService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
  });

  beforeEach(() => {
    service = TestBed.inject(GithubService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a request to GitHub API', () => {
    const mockResponse = {
      total_count: 30,
      items: [{} as any],
    };

    var params = new HttpParams().append('q', 'angular');
    service.searchRepos(params).subscribe((data) => {
      expect(data.totalCount).toBe(30);
      expect(data.items.length).toBe(1);
    });

    const request = httpTestingController.expectOne(`${apiUrl}?q=angular`);

    expect(request.request.method).toBe('GET');

    request.flush(mockResponse);
  });
});
