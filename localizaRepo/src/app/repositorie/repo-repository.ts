export interface GithubApi {
  items: RepoRepository[];
  total_count: number;
}

export interface RepoRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    avatar_url: string;
    
  };
  description: string;
  html_url: string;
  stargazers_count: string;
  language: string
}
