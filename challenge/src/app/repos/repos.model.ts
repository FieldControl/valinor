export interface Search {
    total_count: number,
    incomplete_results: boolean,
    items: Array<Repos>;
}

export interface Repos {
    id: number,
    full_name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    language: string;
    watchers: number;
    open_issues: number;
}