import { TestBed } from '@angular/core/testing';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { GitRepoService } from './service-repo-git.service';

describe('GithubRepoService', () => {
  let service: GitRepoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [GitRepoService],
    });
    service = TestBed.inject(GitRepoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
