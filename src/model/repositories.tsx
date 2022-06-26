export interface Repositories {
    id: number,
    html_url: string,
    description: string,
    topics: string[],
    stargazers_count: number,
    language: string,
    pushed_at: string
};

export type FormData = {
    repositorie: string;
};

export type Props = {
    getRepositories: (data: { repositorie: string }) => void
};