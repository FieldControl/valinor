import { Repository } from "./repository.model";

export interface RepositoryList{
    items: Repository[];
    total_count: number;
}