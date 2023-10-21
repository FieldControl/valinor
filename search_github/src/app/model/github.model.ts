export interface Item {
    id?: number,
    url?: string,
    full_name?: string,
    description?: string
    language?: string,
    topics?: string[],
    updated_at?: string
}

export interface Data {
    total_count: number,
    incomplete_results: boolean,
    items: Item[],
}