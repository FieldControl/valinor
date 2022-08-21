import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SearchListService {

  private apiUrl: String = 'https://api.github.com/search/repositories'

  constructor(private httpClient: HttpClient) { }

  getApiData(searchLine: string, page: number): Observable<any>{
    return this.httpClient.get<any>(this.apiUrl + '?q=' + searchLine + '?page='+ page +'&per_page=5')
  }

}
