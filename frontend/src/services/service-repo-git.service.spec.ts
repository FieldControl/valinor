import { TestBed } from '@angular/core/testing';
import { Apollo, QueryRef } from 'apollo-angular';
import { of } from 'rxjs';
import { GitRepoService } from './service-repo-git.service';
import { SEARCH_REPOSITORIES_QUERY } from 'src/query/graphql-query';

describe('GitRepoService', () => {
  let service: GitRepoService;
  let apolloSpy: jasmine.SpyObj<Apollo>;

  beforeEach(() => {
    const apolloSpyObj = jasmine.createSpyObj('Apollo', ['watchQuery']);

    TestBed.configureTestingModule({
      providers: [GitRepoService, { provide: Apollo, useValue: apolloSpyObj }],
    });

    service = TestBed.inject(GitRepoService);
    apolloSpy = TestBed.inject(Apollo) as jasmine.SpyObj<Apollo>;
  });

  it('should call watchQuery with the correct arguments', () => {
    const query = 'angular';
    const first = 10;
    const after = 'abc123';

    const expectedQueryResult = {
      data: {
        search: {
          edges: [
            {
              node: {
                name: 'Repo 1',
                url: 'https://github.com/repo1',
                description: 'Description 1',
                watchers: { totalCount: 10 },
                stargazers: { totalCount: 20 },
                issues: { totalCount: 5 },
              },
            },
            {
              node: {
                name: 'Repo 2',
                url: 'https://github.com/repo2',
                description: 'Description 2',
                watchers: { totalCount: 15 },
                stargazers: { totalCount: 30 },
                issues: { totalCount: 8 },
              },
            },
          ],
        },
      },
    };

    const queryRef: QueryRef<any> = {
      valueChanges: of(expectedQueryResult),
    } as any;

    apolloSpy.watchQuery.and.returnValue(queryRef);

    const result$ = service.searchRepositories(query, first, 1);

    expect(apolloSpy.watchQuery).toHaveBeenCalledWith({
      query: SEARCH_REPOSITORIES_QUERY,
      variables: { query, first, after },
    });
  });

  it('should return the mapped repository data', () => {
    const query = 'angular';
    const first = 10;
    const after = 'abc123';

    const expectedQueryResult = {
      data: {
        search: {
          edges: [
            {
              node: {
                name: 'Repo 1',
                url: 'https://github.com/repo1',
                description: 'Description 1',
                watchers: { totalCount: 10 },
                stargazers: { totalCount: 20 },
                issues: { totalCount: 5 },
              },
            },
            {
              node: {
                name: 'Repo 2',
                url: 'https://github.com/repo2',
                description: 'Description 2',
                watchers: { totalCount: 15 },
                stargazers: { totalCount: 30 },
                issues: { totalCount: 8 },
              },
            },
          ],
        },
      },
    };

    const queryRef: QueryRef<any> = {
      valueChanges: of(expectedQueryResult),
    } as any;

    apolloSpy.watchQuery.and.returnValue(queryRef);

    const result$ = service.searchRepositories(query, first, 1);

    result$.subscribe((result: any[]) => {
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Repo 1');
      expect(result[0].url).toBe('https://github.com/repo1');
      expect(result[0].description).toBe('Description 1');
      expect(result[0].watchers.totalCount).toBe(10);
      expect(result[0].stargazers.totalCount).toBe(20);
      expect(result[0].issues.totalCount).toBe(5);
      expect(result[1].name).toBe('Repo 2');
      expect(result[1].url).toBe('https://github.com/repo2');
      expect(result[1].description).toBe('Description 2');
      expect(result[1].watchers.totalCount).toBe(15);
      expect(result[1].stargazers.totalCount).toBe(30);
      expect(result[1].issues.totalCount).toBe(8);
    });
  });
});
