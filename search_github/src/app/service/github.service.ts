import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Data } from "../model/github.model";


/* Essa injeção é a mesma coisa que colocar essa service 
injetada no provider no module */
@Injectable({ 
    providedIn: 'root'
})
export class GithubService {

    private _apiUrl = environment.api;

    /* A varável httpClient está sendo criata e a injeção está sendo feita pelo módulo
    Imports do module. */
    constructor(private httpClient: HttpClient) {}

    separateSortFromOrder(sortAndOrder: string) {
        const array = sortAndOrder.split(" ");
        return { sort: array[0], order: array[1]? array[1] : '' }
    }

    createPagesArray(numberOfRepositories: number, perPage: number) {
        let totalPages = Math.ceil(numberOfRepositories / perPage);
        if(totalPages > 100) {
            totalPages = 100;
        }

        const pagesArray: number[] = [];

        for (let i = 1; i <= totalPages; i+=1) {
            pagesArray.push(i);
        }

        return pagesArray;
    }

    findRepositories(q: string, sortAndOrder: string, page: number, perPage: number) {
        const { sort, order } = this.separateSortFromOrder(sortAndOrder);
        const url = `${this._apiUrl}repositories?q=${q}&per_page=${perPage}&sort=${sort}&order=${order}&page=${Number(page)}`;
        return this.httpClient.get<Data>(url);
    }
}