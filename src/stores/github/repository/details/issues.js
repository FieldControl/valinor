import { defineStore } from 'pinia';
import api from '@/services/api';
import githubIssuesTranslator from '@/translators/github/repository/details/issues';

import { formatNumberToShortScale } from '@/helpers/number';

export const useGithubRepositoryIssuesStore = defineStore('githubRepositoryIssuesStore', {
  state: () => ({
    loading: true,
    repositoryFullname: '',
    currentPage: 1,
    perPage: 25,
    issuesCount: 0,
    issuesCountFormatted: '0',
    issues: []
  }),
  actions: {
    async fetchIssues(currentPage = 1) {
      try {
        this.loading = true;
        this.currentPage = currentPage > 0 ? currentPage : 1;

        const response = await api.get(`/repos/${this.repositoryFullname}/issues`, {
          params: {
            page: this.currentPage,
            per_page: this.perPage
          }
        });

        this.issuesCount = this.handleIssuesCount(response);
        this.issuesCountFormatted = formatNumberToShortScale(this.issuesCount);
        this.issues = response.data.map(item => githubIssuesTranslator(item));
      } catch (error) {
        console.error("Error fetching issues: ", error);
      } finally {
        this.loading = false;
      }
    },
    setRepositoryFullname(username, reponame) {
      this.repositoryFullname = `${username}/${reponame}`;
    },
    handleIssuesCount(axiosResponse) {
      const { data, headers } = axiosResponse;
      const headerLink = headers.link || '';
      const extractLastPage = headerLink.match(/<[^>]*\?page=(\d+)&per_page=\d+>; rel="last"/) || [];

      if(extractLastPage[1]) {
        return this.perPage * extractLastPage[1];
      }

      if(data.length != 0 && this.issuesCount > 0) {
        return this.issuesCount;
      }

      return data.length;
    }
  }
});
