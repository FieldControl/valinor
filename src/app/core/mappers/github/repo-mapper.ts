import { GitHubRepo } from '@core/models/github/repo.model';
import { GitHubOwnerMapper } from '@core/mappers/github/owner-mapper';

function map(source: any[]) {
  var data: GitHubRepo[] = source.map<GitHubRepo>((repo) => ({
    name: repo['name'],
    fullName: repo['full_name'],
    language: repo['language'],
    description: repo['description'],
    owner: GitHubOwnerMapper(repo['owner'] ?? {}),
    htmlUrl: repo['html_url'],
    pushedAt: repo['pushed_at'],
    hasIssues: repo['has_issues'],
    issuesUrl: repo['issues_url'],
    starsAmount: repo['stargazers_count'],
    openIssuesAmount: repo['open_issues_count'],
  }));
  return data;
}

export const GitHubRepoMapper = map;
