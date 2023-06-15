import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GithubService } from './github.service';

// Config the service and http testing
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

    // See if https request are open after each test 
    afterEach(() => {
        httpMock.verify();
    });

    // See if teh service was create
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // Test the searchProjects method if it returns the correct data
    describe('searchProjects', () => {
        it('should make a GET request to the correct URL and return the response', () => {
            const mockResponse = { items: [] };// mock stuff !
            const projectQuery = 'batata';
            const page = 1;

            // do stuff
            service.searchProjects(projectQuery, page).subscribe((response) => {
                expect(response).toEqual(mockResponse);
            });

            // Fake the http request
            const req = httpMock.expectOne(`https://api.github.com/search/repositories?q=${projectQuery}&per_page=10&page=${page}`);
            expect(req.request.method).toBe('GET');
            req.flush(mockResponse);
        });
        describe('searchIssues', () => {
            it('should make a GET request to the correct URL and return the response', () => {
              const mockResponse = { items: [] };
              const issueQuery = 'banana';
              const page = 1;
      
              service.searchIssues(issueQuery, page).subscribe((response) => {
                expect(response).toEqual(mockResponse);
              });
      
              const req = httpMock.expectOne(`https://api.github.com/search/issues?q=repo:${issueQuery}&per_page=10&page=${page}`);
              expect(req.request.method).toBe('GET');
              req.flush(mockResponse);
            });
          });
    });
});


