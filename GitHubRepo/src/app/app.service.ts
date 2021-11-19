import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }

  constructor(private http: HttpClient) { }

  public GetRepo(repo:any, pageSize:any, pageIndex:any): Observable<any>{
    return this.http.get<any>(`https://api.github.com/search/repositories?q=${repo}&page=${pageIndex}&per_page=${pageSize}`)
  }

}
