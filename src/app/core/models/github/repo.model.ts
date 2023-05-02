import { GitHubOwner } from '@core/models/github/owner.model';

export interface GitHubRepo {
  name: string;
  fullName: string;
  owner: GitHubOwner;
  issuesUrl: string;
  updatedAt: string;
  starsAmount: number;
  hasIssues: boolean;
  openIssuesAmount: number;
}
