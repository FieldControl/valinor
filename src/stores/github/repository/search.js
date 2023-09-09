import { defineStore } from 'pinia';
import api from '@/services/api';
import githubRepositoryTranslator from '@/translators/github/repository/search';
import { formatNumberToShortScale } from '@/helpers/number';

export const useGithubRepositorySearchStore = defineStore('githubRepositorySearchStore', {
  state: () => ({
    loading: true,
    searchTerm: '',
    currentPage: 1,
    perPage: 10,
    repositoriesCount: 0,
    repositoriesCountFormatted: '0',
    repositories: []
  }),
  actions: {
    async fetchRepositories(currentPage = 1) {
      try {
        this.loading = true;
        this.currentPage = currentPage > 0 ? currentPage : 1;
        
        const { data } = await api.get(`/search/repositories`, {
          params: {
            q: this.searchTerm,
            page: this.currentPage,
            per_page: this.perPage
          }
        });

        this.repositoriesCount = data.total_count;
        this.repositoriesCountFormatted = formatNumberToShortScale(this.repositoriesCount);
        this.repositories = data.items.map(item => githubRepositoryTranslator(item));
      } catch (error) {
        console.error("Error fetching repositories: ", error);
      } finally {
        this.loading = false;
      }
    }
  }
});
