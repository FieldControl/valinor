import { Repository } from './repository.model';

export interface RepositorySearchResult {
    total_count: number;
    incomplete_status: boolean;
    items: Repository[];
}