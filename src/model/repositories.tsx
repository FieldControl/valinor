export interface Repositories {
    id: number,
    html_url: string,
    description: string,
    topics: string[],
    stargazers_count: number,
    language: string,
    pushed_at: string
};

export interface Data {
    items: Repositories[],
    total_count: number
};

export type FormData = {
    repositorie: string;
};

export type Props = {
    getRepositories: (data: { repositorie: string }) => void,
    offset: number
};