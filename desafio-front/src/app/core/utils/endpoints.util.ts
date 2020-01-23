import { environment } from 'src/environments/environment';


export const enum GithubEndpoints {
  searchRepositories = 'search/repositories',
}

export function github(endpoint: GithubEndpoints): string {
  return environment.githubUrl + endpoint;
}
