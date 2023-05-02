import { GitHubRepo } from '@core/models/github/repo.model';

export interface GitHubReposApiResponse {
  totalCount: number;
  items: GitHubRepo[];
}
