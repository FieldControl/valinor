import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {
  private url = 'http://localhost:3000/graphql';

  constructor(private http: HttpClient) {}

  query<T>(query: string, variables?: any): Observable<T> {
    return this.http.post<T>(this.url, {
      query,
      variables
    },{
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  mutation<T>(mutation: string, variables?: any): Observable<T> {
    return this.http.post<T>(this.url, {
      query: mutation,
      variables
    },{
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }
}