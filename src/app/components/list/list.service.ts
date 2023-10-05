import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  
  url = "https://brapi.dev/api/quote/list?"

  constructor(private http: HttpClient) { }

  getAPI(page: number):Observable<any[]>{
    return (this.http.get<any[]>(this.url + `limit=7&page=${page}`));
  }

  getAPISearch(search: string, page: number):Observable<any[]>{
    return (this.http.get<any[]>(this.url + `search=${search}&limit=10&page=${page}`));
  }
}
