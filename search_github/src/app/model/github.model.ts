export interface Item {
    id?: number,
    name?: string,
    url?: string,
    full_name?: string
}

export interface Data {
    total_count: number,
    incomplete_results: boolean,
    items: Item[],
}