export interface IRepositorie{
  items: IItems[];
}

export interface IItems {
  full_name: string;
  html_url: string;
  description: string;
  forks: number;
  stargazers_count: number;
  open_issues: number;
  topics: string[];
}
