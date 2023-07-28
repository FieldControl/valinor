import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { GitHubService } from '@core/services/github.services';
import { of } from 'rxjs';
import { GitHubResponse } from '@core/interfaces/search.interface';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { core } from '@angular/compiler';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let mockGitHubService: jasmine.SpyObj<GitHubService>;

  const mockGitHubResponse: GitHubResponse = {
    total_count: 1,
    incomplete_results: false,
    items: [
      {
        id: 2034023,
        node_id: 'MDEwOlJlcG9zaXRvcnkyMDM0MDIz',
        name: 'testem',
        full_name: 'testem/testem',
        private: false,
        owner: {
          login: 'testem',
          id: 12507332,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjEyNTA3MzMy',
          avatar_url: 'https://avatars.githubusercontent.com/u/12507332?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/testem',
          html_url: 'https://github.com/testem',
          followers_url: 'https://api.github.com/users/testem/followers',
          following_url:
            'https://api.github.com/users/testem/following{/other_user}',
          gists_url: 'https://api.github.com/users/testem/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/testem/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/testem/subscriptions',
          organizations_url: 'https://api.github.com/users/testem/orgs',
          repos_url: 'https://api.github.com/users/testem/repos',
          events_url: 'https://api.github.com/users/testem/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/testem/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/testem/testem',
        description:
          "Test'em 'Scripts! A test runner that makes Javascript unit testing fun.",
        fork: false,
        url: 'https://api.github.com/repos/testem/testem',
        forks_url: 'https://api.github.com/repos/testem/testem/forks',
        keys_url: 'https://api.github.com/repos/testem/testem/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/testem/testem/collaborators{/collaborator}',
        teams_url: 'https://api.github.com/repos/testem/testem/teams',
        hooks_url: 'https://api.github.com/repos/testem/testem/hooks',
        issue_events_url:
          'https://api.github.com/repos/testem/testem/issues/events{/number}',
        events_url: 'https://api.github.com/repos/testem/testem/events',
        assignees_url:
          'https://api.github.com/repos/testem/testem/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/testem/testem/branches{/branch}',
        tags_url: 'https://api.github.com/repos/testem/testem/tags',
        blobs_url: 'https://api.github.com/repos/testem/testem/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/testem/testem/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/testem/testem/git/refs{/sha}',
        trees_url: 'https://api.github.com/repos/testem/testem/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/testem/testem/statuses/{sha}',
        languages_url: 'https://api.github.com/repos/testem/testem/languages',
        stargazers_url: 'https://api.github.com/repos/testem/testem/stargazers',
        contributors_url:
          'https://api.github.com/repos/testem/testem/contributors',
        subscribers_url:
          'https://api.github.com/repos/testem/testem/subscribers',
        subscription_url:
          'https://api.github.com/repos/testem/testem/subscription',
        commits_url: 'https://api.github.com/repos/testem/testem/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/testem/testem/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/testem/testem/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/testem/testem/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/testem/testem/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/testem/testem/compare/{base}...{head}',
        merges_url: 'https://api.github.com/repos/testem/testem/merges',
        archive_url:
          'https://api.github.com/repos/testem/testem/{archive_format}{/ref}',
        downloads_url: 'https://api.github.com/repos/testem/testem/downloads',
        issues_url:
          'https://api.github.com/repos/testem/testem/issues{/number}',
        pulls_url: 'https://api.github.com/repos/testem/testem/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/testem/testem/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/testem/testem/notifications{?since,all,participating}',
        labels_url: 'https://api.github.com/repos/testem/testem/labels{/name}',
        releases_url:
          'https://api.github.com/repos/testem/testem/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/testem/testem/deployments',
        created_at: '2011-07-12T03:41:27Z',
        updated_at: '2023-07-20T17:04:56Z',
        pushed_at: '2023-07-24T18:43:02Z',
        git_url: 'git://github.com/testem/testem.git',
        ssh_url: 'git@github.com:testem/testem.git',
        clone_url: 'https://github.com/testem/testem.git',
        svn_url: 'https://github.com/testem/testem',
        homepage: '',
        size: 41074,
        stargazers_count: 2948,
        watchers_count: 2948,
        language: 'JavaScript',
        has_issues: true,
        has_projects: true,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        has_discussions: false,
        forks_count: 416,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 131,
        license: {
          key: 'mit',
          name: 'MIT License',
          spdx_id: 'MIT',
          url: 'https://api.github.com/licenses/mit',
          node_id: 'MDc6TGljZW5zZTEz',
        },
        allow_forking: true,
        is_template: false,
        web_commit_signoff_required: false,
        topics: [],
        visibility: 'public',
        forks: 416,
        open_issues: 131,
        watchers: 2948,
        default_branch: 'master',
        score: 1.0,
      },
    ],
  };

  beforeEach(async () => {
    mockGitHubService = jasmine.createSpyObj('GitHubService', ['getInfo']);
    mockGitHubService.getInfo.and.returnValue(of(mockGitHubResponse));

    await TestBed.configureTestingModule({
      declarations: [SearchComponent],
      imports: [
        HttpClientTestingModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        MatPaginatorModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: convertToParamMap({ q: 'angular' }),
            },
          },
        },
        { provide: GitHubService, useValue: mockGitHubService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display search results', () => {
    const compiled = fixture.debugElement.nativeElement;
    const searchResults = compiled.querySelectorAll('.user-info');
    expect(searchResults.length).toBe(1);
  });

  it('should fetch data from the actual API', () => {
    const mockQueryParams = { q: 'angular' };
    const mockActivatedRoute = TestBed.inject(ActivatedRoute);
    mockActivatedRoute.snapshot.queryParams =
      convertToParamMap(mockQueryParams);

    component.performSearch();

    expect(component.data$).toBeTruthy();
  });
});
