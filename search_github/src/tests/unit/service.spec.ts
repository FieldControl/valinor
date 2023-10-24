import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { GithubService } from '../../app/service/github.service';
import { environment } from 'src/environments/environment';
import { Data } from 'src/app/model/github.model';
import mockedData from '../mocks/github.mocks';

describe('GithubService', () => {
  let githubService: GithubService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Import HttpClientTestingModule for mocking HTTP requests
      providers: [GithubService],
    });

    githubService = TestBed.inject(GithubService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should retrieve data from the API via GET', () => {
    const searchTerm = 'example';
    const sortAndOrder = 'stars desc';
    const page = 1;
    const perPage = 15;

    // Define the expected URL
    const expectedUrl = `${environment.api}repositories?q=${searchTerm}&per_page=${perPage}&sort=stars&order=desc&page=${page}`;

    // Mock the response data
    const mockData: Data = mockedData;

    // Call the findRepositories method
    githubService.findRepositories(searchTerm, sortAndOrder, page, perPage).subscribe((data) => {
      // Assert that the returned data matches the mock data
      expect(data).toEqual(mockData);
    });

    // Expect a single request to the expected URL
    const req = httpTestingController.expectOne(expectedUrl);

    // Respond with the mock data when the request is made
    req.flush(mockData);

    // Verify that there are no outstanding requests
    httpTestingController.verify();
  });

  it('should separate sort and order correctly', () => {
    const sortAndOrder = 'stars desc';
    const response = githubService.separateSortFromOrder(sortAndOrder);

    expect(response.sort).toBe('stars');
    expect(response.order).toBe('desc');
  });

  it('should handle sort without order', () => {
    const sortAndOrder = 'best-match';
    const response = githubService.separateSortFromOrder(sortAndOrder);

    expect(response.sort).toBe('best-match');
    expect(response.order).toBe('');
  });

  it('should create pages array correctly', () => {
    const numberOfRepositories = 70; 
    const perPage = 15; 
    const response = githubService.createPagesArray(numberOfRepositories, perPage);

    expect(response).toEqual([1, 2, 3, 4, 5]);
  });

  it('shouldn`t suprass the length of 100', () => {
    const numberOfRepositories = 1560;
    const perPage = 15;
    const response = githubService.createPagesArray(numberOfRepositories, perPage);

    expect(response.length).toBe(100);
  });

  it('should check if prev is possible', () => {
    const pages = 5;
    const response = githubService.prevIsPossible(pages);

    expect(response).toBe(false);
  });

  it('should handle next is possible', () => {
    const pages = 5;
    const lastPage = 10;
    const response = githubService.nextIsPossible(pages, lastPage);

    expect(response).toBe(false);
  });

  it('should check if next isn`t possible', () => {
    const pages = 10;
    const lastPage = 10;
    const response = githubService.nextIsPossible(pages, lastPage);

    expect(response).toBe(true);
  });

  it('shouldn`t handle prev isn`t possible', () => {
    const pages = 1;
    const response = githubService.prevIsPossible(pages);

    expect(response).toBe(true);
  });
});
