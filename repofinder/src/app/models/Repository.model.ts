export interface GithubApi {
  items: GithubRepository[];
  total_count: number;
}

export interface GithubRepository {
  id: number,
  name: string,
  full_name: string;
  owner: {
    avatar_url: string;
  };
  description: string;
  html_url: string;
}
