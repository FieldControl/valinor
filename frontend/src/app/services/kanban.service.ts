import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private apiUrl = 'http://localhost:3000/graphql';
  constructor(private client: HttpClient) {}

  executeQuery(query: string, variables?: any): Observable<any> {
    const body = {
      query,
      variables,
    };

    return this.client.post<any>(this.apiUrl, body);
  }

  getColumns(): Observable<any> {
    const query = `
    query {
      getColumns {
        id
        title
        cards {
          id
          title
          description
        }
      }
    }
  `;
    return this.executeQuery(query);
  }
}
