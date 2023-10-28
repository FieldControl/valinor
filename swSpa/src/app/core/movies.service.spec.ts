import { TestBed } from '@angular/core/testing';

import { MoviesService } from './movies.service';
import { HttpClientModule } from '@angular/common/http';

describe('MoviesService', () => {
  let service: MoviesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(MoviesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
