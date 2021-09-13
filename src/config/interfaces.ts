interface IRepositoryOwner {
  login: string;
}

export interface IRepository {
  id: number;
  name: string;
  owner: IRepositoryOwner;
  html_url: string;
  language: string;
  updated_at: string;
  description: string;
  stargazers_count: number;
  open_issues_count: number;
}

export type RepositoriesCount = number | undefined;

export interface IFilter {
  type: string;
  language?: string;
}
