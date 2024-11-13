import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GraphqlService {
  private readonly apiUrl = 'http://localhost:3000/graphql';

  constructor(private http: HttpClient) {}

  public query(query: string, variables?: any): Observable<any> {
    const body = {
      query,
      variables: variables || {},
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(this.apiUrl, body, { headers });
  }

  public mutate(mutation: string, variables?: any): Observable<any> {
    const body = {
      query: mutation,
      variables: variables || {},
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}
