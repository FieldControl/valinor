import { Issues } from "./issues.model";
import { Repositories } from "./repositories.model";

export interface ApiResponse {
    total_count: number,
    incomplete_results: boolean,
    items: Array<Issues | Repositories>
}