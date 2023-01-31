import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class RepositorioService {

  apiUrl = 'http://api.github.com/search/repositories?q=';

  constructor(private http: HttpClient) { }

  public getSearch(search: string){
    return this.http.get(this.apiUrl + search)
  }
}
