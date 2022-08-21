import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SearchListService {

  private apiUrl: String = 'https://api.github.com/search/repositories'

  constructor(private httpClient: HttpClient) { }

  getApiData(searchLine: string): Observable<any>{
    return this.httpClient.get<any>(this.apiUrl + '?q=' + searchLine)
  }

}
