import { Component, OnInit, OnDestroy } from '@angular/core';
import { GetDataApiGitHub } from '../../services/get-service';
import { ActivatedRoute } from '@angular/router';
import { of, Subscription } from 'rxjs';

@Component({
  selector: 'app-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.css']
})

export class RepositoryComponent implements OnInit, OnDestroy {
  repo: any;
  contributors$ = of(null);
  branches$ = of(null);
  collaborators$ = of(null);
  private subscript!: Subscription;

  isLoading: boolean = false

  constructor(
    private route: ActivatedRoute,
    private repoService: GetDataApiGitHub,
  ) { }

  ngOnInit(): void {
    this.isLoading = true
    const userName = this.route.snapshot.paramMap.get('name');
    const repo = this.route.snapshot.paramMap.get('repo');

    if (!userName) {
      return;
    }

    this.subscript = this.repoService.getRepoDetails(userName + '/' + repo).subscribe((data) => {
      if (data) {
        this.repo = data;
        this.contributors$ = this.repoService.getDataByURL(data.contributors_url);
        this.branches$ = this.repoService.getDataByURL(data.branches_url.replace("{/branch}", ""));
        this.collaborators$ = this.repoService.getDataByURL(data.contributors_url);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscript.unsubscribe();
  }

}
/*
{
    name: 'abc',
    full_name: 'juliancwirko/abc',
    html_url: 'https://github.com/juliancwirko/abc',
    description: 'Free theme for your Ghost blog',
    url: 'https://api.github.com/repos/juliancwirko/abc',
    forks_url: 'https://api.github.com/repos/juliancwirko/abc/forks',
    issue_events_url:
      'https://api.github.com/repos/juliancwirko/abc/issues/events{/number}',
    tags_url: 'https://api.github.com/repos/juliancwirko/abc/tags',

    stargazers_url: 'https://api.github.com/repos/juliancwirko/abc/stargazers',

    contributors_url: 'https://api.github.com/repos/juliancwirko/abc/contributors',
    subscribers_url: 'https://api.github.com/repos/juliancwirko/abc/subscribers',
    subscription_url: 'https://api.github.com/repos/juliancwirko/abc/subscription',
    commits_url: 'https://api.github.com/repos/juliancwirko/abc/commits{/sha}',
    comments_url: 'https://api.github.com/repos/juliancwirko/abc/comments{/number}',
    issue_comment_url:
    'https://api.github.com/repos/juliancwirko/abc/issues/comments{/number}',

    issues_url: 'https://api.github.com/repos/juliancwirko/abc/issues{/number}',
    pulls_url: 'https://api.github.com/repos/juliancwirko/abc/pulls{/number}',
    releases_url: 'https://api.github.com/repos/juliancwirko/abc/releases{/id}',

    size: 451,

    language: 'SCSS',
    forks_count: 65,
    open_issues_count: 0,

    open_issues: 0,
    watchers: 171,
    default_branch: 'master',
    network_count: 65,
    subscribers_count: 10

    branches_url: 'https://api.github.com/repos/juliancwirko/abc/branches{/branch}',
    commits: https://api.github.com/repos/nlpxucan/abcd/commits?sha=main&per_page=1&page=470
  }
*/
