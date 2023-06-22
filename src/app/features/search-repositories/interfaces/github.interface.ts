export interface IGitHubSearch {
  incomplete_results: boolean;
  items: IGitHubRepository[];
  total_count: number;
}

export interface IGitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  watchers_count: number;
  owner: IRepositoryOwner;
}

export interface IRepositoryOwner {
  login: string;
  avatar_url: string;
}
