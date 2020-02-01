import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class CoreHttpService {
    constructor(
        private _httpClient: HttpClient
    ) {
    }
}
