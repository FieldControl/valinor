import { createPinia } from 'pinia';
import MockAdapter from 'axios-mock-adapter';
import { expect } from 'vitest';
import { useGithubRepositorySearchStore } from '@/stores/github/repository/search';
import axiosApi from '@/services/api';

const pinia = createPinia();

describe('githubRepositorySearchStore', () => {
    let store;
    let mock;

    beforeEach(() => {
        store = useGithubRepositorySearchStore(pinia);
        mock = new MockAdapter(axiosApi);
    });

    afterEach(() => {
        mock.restore();
    });

    it('fetch projects correctly', async () => {
        const testDate = new Date();
        testDate.setMinutes(testDate.getMinutes() - 10);

        const repositoriesDataMock = {
            total_count: 16100,
            items: [
                {
                    name: 'repo01',
                    full_name: 'user01/repo01',
                    owner: {
                        login: 'user01',
                        html_url: 'https://github.com/repo01',
                    },
                    description: 'Description by repository',
                    topics: ['topic1', 'topic2'],
                    forks: 1000,
                    watchers: 1000,
                    language: 'Javascript',
                    updated_at: testDate.toISOString()
                },
                {
                    name: 'repo02',
                    full_name: 'user02/repo02',
                    owner: {
                        login: 'user02',
                        html_url: 'https://github.com/repo02',
                    },
                    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s',
                    topics: ['topic1', 'topic2', 'topic3', 'topic4', 'topic5', 'topic6'],
                    forks: 1000,
                    watchers: 1000,
                    language: 'Javascript',
                    updated_at: testDate.toISOString()
                },
            ]
        };
        const repositoriesCountFormatted = '16.1K';

        mock.onGet('/search/repositories').reply(200, repositoriesDataMock);
        await store.fetchRepositories();

        const repositoriesResult = [
            {
                name: 'repo01',
                owner: 'user01',
                description: 'Description by repository',
                topics: ['topic1', 'topic2'],
                forks: 1000,
                stars: 1000,
                language: 'Javascript',
                avatar: 'https://github.com/repo01.png?size=40',
                updated: '10 minutes'
            },
            {
                name: 'repo02',
                owner: 'user02',
                description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever sin...',
                topics: ['topic1', 'topic2', 'topic3', 'topic4', 'topic5'],
                forks: 1000,
                stars: 1000,
                language: 'Javascript',
                avatar: 'https://github.com/repo02.png?size=40',
                updated: '10 minutes'
            }
        ];

        expect(store.repositories).toEqual(repositoriesResult);
        expect(store.repositoriesCount).toBe(repositoriesDataMock.total_count);
        expect(store.repositoriesCountFormatted).toBe(repositoriesCountFormatted);
        expect(store.loading).toBe(false);
    });
});
