//Interface criada com TypeScript para estruturar os dados retornados pela busca na API.
export interface gitRepositoryModel {
  full_name: string;
  html_url: string ;
  description: string;
  language: string;
  topics: Array<string>;
  stargazers_count: number;
  stargazers_url: string;
  watchers: number;
  open_issues: number;
}