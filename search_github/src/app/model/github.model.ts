export interface Item {
    id?: number,
    url?: string,
    html_url: string,
    full_name?: string,
    description?: string
    language?: string,
    topics?: string[],
    owner?: {
        avatar_url?: string
    },
    stargazers_count?: number,
    open_issues?: number,
    watchers?: number
}

export interface Data {
    total_count: number,
    incomplete_results: boolean,
    items: Item[],
}