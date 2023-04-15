import { TestBed, async, inject } from '@angular/core/testing';
import { ApiGoogleBooksService } from './ApiGoogleBooks.service';

describe('Service: ApiGoogleBooks', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiGoogleBooksService]
    });
  });

  it('should ...', inject([ApiGoogleBooksService], (service: ApiGoogleBooksService) => {
    expect(service).toBeTruthy();
  }));
});
