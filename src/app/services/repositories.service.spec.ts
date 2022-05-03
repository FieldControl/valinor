import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RepositoriesService } from './repositories.service';

describe('RepositoriesService', () => {
  let service: RepositoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule  ],
    });
    service = TestBed.inject(RepositoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
