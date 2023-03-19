import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  public getRepositories(query: any): Observable<any>{
    const myToken = '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';
    const headers = new HttpHeaders({ Authorization: `Bearer ${myToken}` });
    const url = `https://api.github.com/search/repositories?q=${query}`;

    return this.http.get<any>(url, { headers }).pipe(
      tap(res => {
        console.log(res.items);
      })
    );
  }
}

