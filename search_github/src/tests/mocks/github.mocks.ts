import { Data, Item } from "src/app/model/github.model";

const items: Item[] = [
    { 
        full_name: 'repositório teste',
        html_url: 'www.teste.com',
        stargazers_count: 1,
        open_issues: 10,
        watchers: 5,
        topics: [
            'node',
            'linux'
        ],
        language: 'TypeScript'
}]

const mockedData: Data = {
    total_count: 4,
    incomplete_results: false,
    items: items
}

export default mockedData;