export interface APIUser {
  login: string;
  type?: string;
  name: string;
  followers: number;
  following: number;
  public_repos: number;
  avatar_url: string;
  blog?: string;
  bio?: string;
  company?: string;
  email?: string;
  location?: string;
  twitter_username?: string;
}

export interface APIRepo {
  name: string;
  owner: {
    login: string;
  };
  stargazers_count: number;
  subscribers_count: number;
  forks: number;
  html_url: string;
  language?: string;
  description?: string;
  fork?: boolean;
  parent?: {
    full_name?: string;
    forks_count?: number;
    open_issues_count?: number;
    watchers?: number;
    default_branch?: string;
    language?: string;
  };
}
