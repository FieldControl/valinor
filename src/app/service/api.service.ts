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

