import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cards } from '@type/types';
import { environment } from '../../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ColumnService {
  constructor(private http: HttpClient) { }

  private baseUrl = `${environment.apiUrl}`;

  addCard(cardTitle: string, columnId: string) {
    return this.http
      .post<Cards>(`${this.baseUrl}/cards`, {
        title: cardTitle,
        columnId: columnId,
      }, {
        withCredentials: true
      })
  }

}
