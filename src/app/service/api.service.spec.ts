import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a GET request to the API and return data', () => {
    const query = 'angular';
    const mockData = {
      items: [
        { id: 1, name: 'Angular' },
        { id: 2, name: 'AngularJS' },
      ]
    };

    service.getRepositories(query).subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpTestingController.expectOne(`https://api.github.com/search/repositories?q=${query}`);
    expect(req.request.method).toEqual('GET');
    req.flush(mockData);
  });
});
