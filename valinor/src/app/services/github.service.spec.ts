import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { GithubService } from './github.service';

describe('GithubService', () => {
  let service: GithubService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GithubService],
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

  it('should retrieve repositories from the API', () => {
    const mockResponse = { items: [] };
    const searchText = 'angular';
    const index = 1;
    const type = 'repositories';

    service.getRepositories(searchText, index, type).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service.API}/${type}?q=${searchText}&page=${index}`);

    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);

  });

  it('should retrieve user count from the API', () => {
    const mockResponse = { total_count: 10 };
    const searchText = 'angular';
    service.getUserCount(searchText).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });
    const req = httpMock.expectOne(`${service.APICount}?q=${searchText}&type=users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

});
