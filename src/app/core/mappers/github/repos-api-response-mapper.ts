import { GitHubReposApiResponse } from '@core/models/github/repos-api-response.model';
import { GitHubRepoMapper } from '@core/mappers/github/repo-mapper';

function map(source: any) {
  var data: GitHubReposApiResponse = {
    totalCount: source['total_count'],
    items: GitHubRepoMapper(source['items'] ?? []),
  };
  return data;
}

export const GitHubApiResponseMapper = map;
