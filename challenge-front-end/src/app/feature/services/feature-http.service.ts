import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RepositoryRes } from '../models/repository.interface';

@Injectable()
export class FeatureHttpService {
    constructor(
        private _httpClient: HttpClient
    ) {

    }
    fetchRepositories(repository = 'node', page = '1', perPage = '25') {
        return this._httpClient.get<RepositoryRes>('https://api.github.com/search/repositories', {
            params: {
                q: repository,
                page,
                per_page: perPage
            }
        });
    }
}
