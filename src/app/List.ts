export interface resultados {
  "total_count": number;
  "incomplete_results": boolean;
  "items": item[];
}

export interface item {
  "id": number;
  "name": string;
  "html_url": string;
  "description": string;
  "stargazers_count": number;
  "watchers_count": number;
  "open_issues_count": number;
}
export interface message {
  "message": string;
}
// export interface resultados {
//   total_count: number;
//   incomplete_results: boolean;
//   items: item[];
// }

// export interface item {
//   id: number;
//   name: string;
//   url: string;
//   description: string;
//   stargazers_count: number;
//   watchers_count: number;
//   open_issues_count: number;
// }
