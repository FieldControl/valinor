import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class SharedHttpService {
    constructor(
        private _httpClient: HttpClient
    ) {
    }

    async postTest() {
        const test = await this._httpClient.get<any>('https://reqres.in/api/users?page=1').toPromise();
        console.log(test);
    }
}
