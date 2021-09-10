import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { RepositoryRes } from 'src/app/models/repository.interface';


@Injectable()
export class CoreHttpService {

    searchTerm = new Subject<string>();

    private _repository = '';

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _httpClient: HttpClient,
        private _router: Router
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

    fetchLanguages(url: any) {
        return this._httpClient.get<Array<{ [key: string]: number }>>(url);
    }

    fetchMenuItems(page = '1', perPage = '25', sort = '', order = '', language = '', menuItem = '') {
        // if (+page > 40) { page = '40'; }
        let query;
        if (+page <= 0) { page = '1'; }
        if (language) {
            query = `${this._repository}+language:${language}`;
        } else {
            query = this._repository;
        }

        this._router.navigate(
            [],
            {
                relativeTo: this._activatedRoute,
                queryParams: { q: query, page },
                queryParamsHandling: 'merge', // remove to replace all query params by provided
            });
        return this._httpClient.get<RepositoryRes>(`https://api.github.com/search/${menuItem}`, {
            headers: new HttpHeaders({
                'Accept': 'application/vnd.github.cloak-preview+json'
            }),
            params: {
                q: query,
                page,
                per_page: perPage
            }
        });
    }

    fetchRepositories(page = '1', perPage = '25', sort = '', order = '', language = '') {
        // if (+page > 40) { page = '40'; }
        let query;
        if (+page <= 0) { page = '1'; }
        if (language) {
            query = `${this._repository}+language:${language}`;
        } else {
            query = this._repository;
        }

        this._router.navigate(
            [],
            {
                relativeTo: this._activatedRoute,
                queryParams: { q: query, page },
                queryParamsHandling: 'merge', // remove to replace all query params by provided
            });
        return this._httpClient.get<RepositoryRes>('https://api.github.com/search/repositories', {
            headers: new HttpHeaders({
                'Accept': 'application/vnd.github.v3+json'
            }),
            params: {
                q: query,
                page,
                per_page: perPage
            }
        });
    }

    streamRepository(searchTerm: string) {
        if (!searchTerm && !searchTerm.trim()) { return; }
        this._repository = searchTerm;
        this.searchTerm.next(searchTerm);
    }
}
