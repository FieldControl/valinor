import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { CardComponent } from './components/card/card.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { GithubRepositoriesService } from './services/repositoriesService/github-repositories.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let service: GithubRepositoriesService;
  const mockResponse = {
    items: [
      {
        id: 31365325,
        node_id: 'MDEwOlJlcG9zaXRvcnkzMTM2NTMyNQ==',
        name: 'JsBridge',
        full_name: 'lzyzsd/JsBridge',
        private: false,
        owner: {
          login: 'lzyzsd',
          id: 212984,
          node_id: 'MDQ6VXNlcjIxMjk4NA==',
          avatar_url: 'https://avatars.githubusercontent.com/u/212984?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/lzyzsd',
          html_url: 'https://github.com/lzyzsd',
          followers_url: 'https://api.github.com/users/lzyzsd/followers',
          following_url:
            'https://api.github.com/users/lzyzsd/following{/other_user}',
          gists_url: 'https://api.github.com/users/lzyzsd/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/lzyzsd/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/lzyzsd/subscriptions',
          organizations_url: 'https://api.github.com/users/lzyzsd/orgs',
          repos_url: 'https://api.github.com/users/lzyzsd/repos',
          events_url: 'https://api.github.com/users/lzyzsd/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/lzyzsd/received_events',
          type: 'User',
          site_admin: false,
        },
        html_url: 'https://github.com/lzyzsd/JsBridge',
        description:
          'android java and javascript bridge, inspired by wechat webview jsbridge',
        fork: false,
        url: 'https://api.github.com/repos/lzyzsd/JsBridge',
        forks_url: 'https://api.github.com/repos/lzyzsd/JsBridge/forks',
        keys_url: 'https://api.github.com/repos/lzyzsd/JsBridge/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/collaborators{/collaborator}',
        teams_url: 'https://api.github.com/repos/lzyzsd/JsBridge/teams',
        hooks_url: 'https://api.github.com/repos/lzyzsd/JsBridge/hooks',
        issue_events_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/issues/events{/number}',
        events_url: 'https://api.github.com/repos/lzyzsd/JsBridge/events',
        assignees_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/branches{/branch}',
        tags_url: 'https://api.github.com/repos/lzyzsd/JsBridge/tags',
        blobs_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/statuses/{sha}',
        languages_url: 'https://api.github.com/repos/lzyzsd/JsBridge/languages',
        stargazers_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/stargazers',
        contributors_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/contributors',
        subscribers_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/subscribers',
        subscription_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/subscription',
        commits_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/compare/{base}...{head}',
        merges_url: 'https://api.github.com/repos/lzyzsd/JsBridge/merges',
        archive_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/{archive_format}{/ref}',
        downloads_url: 'https://api.github.com/repos/lzyzsd/JsBridge/downloads',
        issues_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/labels{/name}',
        releases_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/lzyzsd/JsBridge/deployments',
        created_at: '2015-02-26T12:10:58Z',
        updated_at: '2023-04-27T12:24:38Z',
        pushed_at: '2022-12-22T12:42:58Z',
        git_url: 'git://github.com/lzyzsd/JsBridge.git',
        ssh_url: 'git@github.com:lzyzsd/JsBridge.git',
        clone_url: 'https://github.com/lzyzsd/JsBridge.git',
        svn_url: 'https://github.com/lzyzsd/JsBridge',
        homepage: null,
        size: 611,
        stargazers_count: 9319,
        watchers_count: 9319,
        language: 'Java',
        has_issues: true,
        has_projects: true,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        has_discussions: false,
        forks_count: 1929,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 137,
        license: null,
        allow_forking: true,
        is_template: false,
        web_commit_signoff_required: false,
        topics: [],
        visibility: 'public',
        forks: 1929,
        open_issues: 137,
        watchers: 9319,
        default_branch: 'master',
        score: 1.0,
      },
    ],
  };
  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        NavbarComponent,
        CardComponent,
        PaginationComponent,
      ],
      imports: [FormsModule],
      providers: [GithubRepositoriesService],
    }).compileComponents();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [
        AppComponent,
        PaginationComponent,
        CardComponent,
        NavbarComponent,
      ],
      providers: [GithubRepositoriesService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(GithubRepositoriesService);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should get repositories on component init', () => {
    spyOn(service, 'getRepositories').and.returnValue(of(mockResponse));
    fixture.detectChanges();
    expect(component.repositories).toEqual(mockResponse.items);
  });

  it('should update repositories on search change', () => {
    spyOn(service, 'searchRepository').and.returnValue(of(mockResponse));
    component.onSearchChanged('new search value');
    expect(component.repositories).toEqual(mockResponse.items);
  });

  it('should update repositories on pagination change', () => {
    spyOn(service, 'getRepositories').and.returnValue(of(mockResponse));
    component.onNewRepositories(mockResponse);
    expect(component.repositories).toEqual(mockResponse.items);
  });
});
