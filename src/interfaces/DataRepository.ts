export interface DataReposiroty {
  description: string;
  html_url: string;
  full_name: string;
  owner: {
    avatar_url: string;
  };
  topics: string[];
  language: string;
  languages_url: string;
  stargazers_count: number;
  pushed_at: string;
}
