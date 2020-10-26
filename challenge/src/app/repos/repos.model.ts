export interface Search {
    total_count: number,
    incomplete_results: boolean,
    items: Array<Repos>;
}

export interface Repos {
    id: number,
    name: string;
}