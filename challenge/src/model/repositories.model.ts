export class Repositories {
    html_url: string;
    full_name: string;
    language: string;
    topics: string[];

    constructor(
        html_url: string,
        full_name: string,
        language: string,
        topics: string[],
    ) {
        this.html_url = html_url;
        this.full_name = full_name;
        this.language = language;
        this.topics = topics;
    }
}