import { TestBed } from '@angular/core/testing';

import { ApiGithubService } from './api-github.service';
import { HttpClient } from '@angular/common/http';
import { AppModule } from '../app.module';

describe('ApiGithubService', () => {
  let service: ApiGithubService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [ApiGithubService]
    });
    service = TestBed.inject(ApiGithubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
