import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { GitserviceService } from './gitservice.service';
import { environment } from 'src/environments/environment';
import { gitModel, searchRepoModel } from '../models/git.model';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('GitserviceService', () => {
  let service: GitserviceService;
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule, BrowserAnimationsModule],
      providers: [GitserviceService],
    });
    service = TestBed.inject(GitserviceService);
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSearchReposGitHub', () => {
    const repoName = 'example';
    const pageNumber = 1;
    const pageSize = 10;
    const mockResponse: searchRepoModel = {
      total_count: 2,
      incomplete_results: false,
      items: [
        {
          id: 24195339,
          node_id: 'MDEwOlJlcG9zaXRvcnkyNDE5NTMzOQ==',
          name: 'angular',
          full_name: 'angular/angular',
          private: false,
          owner: {
            login: 'angular',
            id: 139426,
            node_id: 'MDEyOk9yZ2FuaXphdGlvbjEzOTQyNg==',
            avatar_url: 'https://avatars.githubusercontent.com/u/139426?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/angular',
            html_url: 'https://github.com/angular',
            followers_url: 'https://api.github.com/users/angular/followers',
            following_url: 'https://api.github.com/users/angular/following{/other_user}',
            gists_url: 'https://api.github.com/users/angular/gists{/gist_id}',
            starred_url: 'https://api.github.com/users/angular/starred{/owner}{/repo}',
            subscriptions_url: 'https://api.github.com/users/angular/subscriptions',
            organizations_url: 'https://api.github.com/users/angular/orgs',
            repos_url: 'https://api.github.com/users/angular/repos',
            events_url: 'https://api.github.com/users/angular/events{/privacy}',
            received_events_url: 'https://api.github.com/users/angular/received_events',
            type: 'Organization',
            site_admin: false
          },
          html_url: 'https://github.com/angular/angular',
          description: 'The modern web developer’s platform',
          fork: false,
          url: 'https://api.github.com/repos/angular/angular',
          forks_url: 'https://api.github.com/repos/angular/angular/forks',
          keys_url: 'https://api.github.com/repos/angular/angular/keys{/key_id}',
          collaborators_url: 'https://api.github.com/repos/angular/angular/collaborators{/collaborator}',
          teams_url: 'https://api.github.com/repos/angular/angular/teams',
          hooks_url: 'https://api.github.com/repos/angular/angular/hooks',
          issue_events_url: 'https://api.github.com/repos/angular/angular/issues/events{/number}',
          events_url: 'https://api.github.com/repos/angular/angular/events',
          assignees_url: 'https://api.github.com/repos/angular/angular/assignees{/user}',
          branches_url: 'https://api.github.com/repos/angular/angular/branches{/branch}',
          tags_url: 'https://api.github.com/repos/angular/angular/tags',
          blobs_url: 'https://api.github.com/repos/angular/angular/git/blobs{/sha}',
          git_tags_url: 'https://api.github.com/repos/angular/angular/git/tags{/sha}',
          git_refs_url: 'https://api.github.com/repos/angular/angular/git/refs{/sha}',
          trees_url: 'https://api.github.com/repos/angular/angular/git/trees{/sha}',
          statuses_url: 'https://api.github.com/repos/angular/angular/statuses/{sha}',
          languages_url: 'https://api.github.com/repos/angular/angular/languages',
          stargazers_url: 'https://api.github.com/repos/angular/angular/stargazers',
          contributors_url: 'https://api.github.com/repos/angular/angular/contributors',
          subscribers_url: 'https://api.github.com/repos/angular/angular/subscribers',
          subscription_url: 'https://api.github.com/repos/angular/angular/subscription',
          commits_url: 'https://api.github.com/repos/angular/angular/commits{/sha}',
          git_commits_url: 'https://api.github.com/repos/angular/angular/git/commits{/sha}',
          comments_url: 'https://api.github.com/repos/angular/angular/comments{/number}',
          issue_comment_url: 'https://api.github.com/repos/angular/angular/issues/comments{/number}',
          contents_url: 'https://api.github.com/repos/angular/angular/contents/{+path}',
          compare_url: 'https://api.github.com/repos/angular/angular/compare/{base}...{head}',
          merges_url: 'https://api.github.com/repos/angular/angular/merges',
          archive_url: 'https://api.github.com/repos/angular/angular/{archive_format}{/ref}',
          downloads_url: 'https://api.github.com/repos/angular/angular/downloads',
          issues_url: 'https://api.github.com/repos/angular/angular/issues{/number}',
          pulls_url: 'https://api.github.com/repos/angular/angular/pulls{/number}',
          milestones_url: 'https://api.github.com/repos/angular/angular/milestones{/number}',
          notifications_url: 'https://api.github.com/repos/angular/angular/notifications{?since,all,participating}',
          labels_url: 'https://api.github.com/repos/angular/angular/labels{/name}',
          releases_url: 'https://api.github.com/repos/angular/angular/releases{/id}',
          deployments_url: 'https://api.github.com/repos/angular/angular/deployments',
          created_at: '2014-09-18T16:12:01Z',
          updated_at: '2023-06-17T20:40:02Z',
          pushed_at: '2023-06-17T19:07:55Z',
          git_url: 'git://github.com/angular/angular.git',
          ssh_url: 'git@github.com:angular/angular.git',
          clone_url: 'https://github.com/angular/angular.git',
          svn_url: 'https://github.com/angular/angular',
          homepage: 'https://angular.io',
          size: 463536,
          stargazers_count: 88661,
          watchers_count: 88661,
          language: 'TypeScript',
          has_issues: true,
          has_projects: true,
          has_downloads: true,
          has_wiki: false,
          has_pages: false,
          has_discussions: true,
          forks_count: 23728,
          mirror_url: null,
          archived: false,
          disabled: false,
          open_issues_count: 1486,
          license: {
            key: 'mit',
            name: 'MIT License',
            spdx_id: 'MIT',
            url: 'https://api.github.com/licenses/mit',
            node_id: 'MDc6TGljZW5zZTEz'
          },
          allow_forking: true,
          is_template: false,
          web_commit_signoff_required: false,
          topics: [
            'angular',
            'javascript',
            'pwa',
            'typescript',
            'web',
            'web-framework',
            'web-performance'
          ],
          visibility: 'public',
          forks: 23728,
          open_issues: 1486,
          watchers: 88661,
          default_branch: 'main',
          score: 1.0
        },

      ],
    };

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    describe('getSearchReposGitHub', () => {
      const repoName = 'example';
      const pageNumber = 1;
      const pageSize = 10;

      it('should return search results', () => {
        service.getSearchReposGitHub(repoName, pageNumber, pageSize).subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(`${environment.API_URL_REPO}/search/repositories?q=${repoName}&page=${pageNumber}&per_page=${pageSize}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
      });

      it('should handle error', () => {
        const errorResponse = new HttpErrorResponse({
          headers: new HttpHeaders(),
          status: 0,
          statusText: 'Unknown Error',
          url: 'https://api.github.com/search/repositories?q=example&page=1&per_page=10',
          error: new Error('An error occurred')
        });

        // Spy on the HttpClient.get method and return an Observable that emits the error
        spyOn(httpClient, 'get').and.returnValue(throwError(errorResponse));

        service.getSearchReposGitHub(repoName, pageNumber, pageSize).subscribe(
          () => {
            fail('Expected error to be thrown');
          },
          (error: HttpErrorResponse) => {
            expect(error.message).toContain('Http failure response');
            expect(error.message).toContain('Unknown Error');
          }
        );
      });

    });
  });
});
