import { SearchResultItem } from "./search-result-item"

export interface SearchResults {
    total_count: number;
    items: SearchResultItem[];
}
