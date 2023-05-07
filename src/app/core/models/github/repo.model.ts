import { GitHubOwner } from '@core/models/github/owner.model';

export interface GitHubRepo {
  name: string;
  fullName: string;
  language: string;
  description: string;
  owner: GitHubOwner;
  htmlUrl: string;
  pushedAt: string;
  hasIssues: boolean;
  issuesUrl: string;
  starsAmount: number;
  openIssuesAmount: number;
}
