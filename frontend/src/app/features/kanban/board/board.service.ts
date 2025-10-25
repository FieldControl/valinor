import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Columns } from '@type/types';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BoardService {
  constructor(private http: HttpClient) { }

  private baseUrl = `${environment.apiUrl}`;

  getColsWithCards() {
    return this.http.get<Columns[]>(`${this.baseUrl}/columns/with-cards`, {
      withCredentials: true
    })
  }

  createColumn(columnTitle: string) {
    return this.http.post<Columns>(`${this.baseUrl}/columns`, {
      title: columnTitle,
    }, {
      withCredentials: true
    })
  }

  delete(columnId: string) {
    return this.http.delete(`${this.baseUrl}/columns/${columnId}`, {
      withCredentials: true
    })
  }
}
