import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RepositoryRes } from 'app/core/models/repository.interface';
import { Subject } from 'rxjs';


@Injectable()
export class CoreHttpService {

    searchTerm = new Subject<string>();

    private _repository = 'node';

    constructor(
        private _httpClient: HttpClient
    ) {
    }

    fetchCode() {
        return this._httpClient.get<RepositoryRes>('https://api.github.com/search/code', {
            headers: new HttpHeaders({
                'Accept': 'application/vnd.github.mercy-preview+json'
            }),
            params: {
                q: this._repository,
            }
        });
    }

    fetchLanguages(url) {
        return this._httpClient.get<Array<{ [key: string]: number }>>(url);
    }

    fetchRepositories(page = '1', perPage = '25', sort = '', order = '') {
        return this._httpClient.get<RepositoryRes>('https://api.github.com/search/repositories', {
            params: {
                q: this._repository,
                page,
                per_page: perPage,
                s: sort,
                o: order
            }
        });
    }

    streamRepository(searchTerm: string) {
        if (!searchTerm && !searchTerm.trim()) { return; }
        this._repository = searchTerm;
        this.searchTerm.next(searchTerm);
    }
}
