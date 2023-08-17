import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { GithubService } from './github.service';
import { RepositoriesResponse } from 'src/interfaces/RepositoriesResponse';

describe('GithubService', () => {
  let service: GithubService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GithubService],
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

  it('should get repositories with correct URL and query', () => {
    const query = 'dasçkdlasçfjaskldjsakdjhauoiwqyeipowq';
    const mockResponse: RepositoriesResponse = {
      items: []
    };

    service.getRepositories(query).subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(
      `${service.BASE_URL}${query}&per_page=100`
    );
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);
  });
});
