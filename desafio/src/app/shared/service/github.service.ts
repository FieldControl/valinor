import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { IRepo } from '../model/IRepo';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  apiUrl = 'https://api.github.com/search/repositories'

  /*httpOptions = {
    headers: new this.httpHeaders({
      'Content-type': 'Application/json'
    })
  };*/

  constructor(private httpClient: HttpClient) { }

  searchRepobyKeyword(keyword: string){
    return this.httpClient.get<any>(`${this.apiUrl}` + `?q=` + keyword);
  }

  /*public getRepoByKeyword(keyword: string): Observable<responseRepo>{
    return this.httpClient.get<responseRepo>(this.apiUrl + '?q=' + keyword);
  }*/

}
