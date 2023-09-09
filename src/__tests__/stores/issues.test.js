import { createPinia } from 'pinia';
import MockAdapter from 'axios-mock-adapter';
import { expect } from 'vitest';
import { useGithubRepositoryIssuesStore } from '@/stores/github/repository/details/issues';
import axiosApi from '@/services/api';
import { formatDateMonthAbbreviated } from '@/helpers/date';
import { formatNumberToShortScale } from '@/helpers/number';

const pinia = createPinia();

describe('githubRepositoryIssuesStore', () => {
    let store;
    let mock;

    beforeEach(() => {
        store = useGithubRepositoryIssuesStore(pinia);
        mock = new MockAdapter(axiosApi);
    });

    afterEach(() => {
        mock.restore();
    });

    it('fetch issues correctly', async () => {
        const testDate = new Date();
        const issuesDataMock = [
            {
                title: 'issue 1',
                html_url: 'https://github.com/js/test/pull/1',
                number: 1,
                user: {
                    login: 'js'
                },
                labels: [
                    {
                        name: 'testjs',
                        color: '000000',
                        description: 'Label issue 1.'
                    },
                ],
                comments: 3,
                created_at: testDate.toISOString()
            },
            {
                title: 'issue 2',
                html_url: 'https://github.com/js2/test/pull/2',
                number: 1,
                user: {
                    login: 'js2'
                },
                labels: [
                    {
                        name: 'testjs2',
                        color: '000000',
                        description: 'Label issue 2.'
                    },
                ],
                comments: 10,
                created_at: testDate.toISOString()
            }
        ];
        const lastPage = 75;
        const headersDataMock = {
            'link': `<https://api.github.com/repositories/27193779/issues?page=2&per_page=25>; rel="next", <https://api.github.com/repositories/27193779/issues?page=${lastPage}&per_page=${store.perPage}>; rel="last"`,
        };

        mock.onGet().reply(200, issuesDataMock, headersDataMock);
        await store.fetchIssues();

        const issuesResult = [
            {
                title: 'issue 1',
                url: 'https://github.com/js/test/pull/1',
                number: 1,
                owner: {
                    name: 'js'
                },
                labels: [
                    {
                        name: 'testjs',
                        color: '#000000',
                        description: 'Label issue 1.'
                    },
                ],
                comments_count: 3,
                opened: formatDateMonthAbbreviated(testDate.toISOString())
            },
            {
                title: 'issue 2',
                url: 'https://github.com/js2/test/pull/2',
                number: 1,
                owner: {
                    name: 'js2'
                },
                labels: [
                    {
                        name: 'testjs2',
                        color: '#000000',
                        description: 'Label issue 2.'
                    },
                ],
                comments_count: 10,
                opened: formatDateMonthAbbreviated(testDate.toISOString())
            }
        ];
        const issuesCount = store.perPage * lastPage;
        const issuesCountFormatted = formatNumberToShortScale(issuesCount);

        expect(store.issues).toEqual(issuesResult);
        expect(store.issuesCount).toBe(issuesCount);
        expect(store.issuesCountFormatted).toBe(issuesCountFormatted);
        expect(store.loading).toBe(false);
    });
});
