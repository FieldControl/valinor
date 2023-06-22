import { IGitHubRepository } from '../../interfaces/github.interface';

export interface ISearchRepositoriesState {
  repositories: IGitHubRepository[];
  loading: boolean;
  error: any;
  lastSearch: string;
  paginator: number;
  totalItems: number;
}
