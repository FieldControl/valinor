import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class BookServiceService {
  baseURL = 'https://the-one-api.dev/v2'

  constructor(private httpClient: HttpClient) { }

  getBooks(page: number) {
    const params = new HttpParams()
      .set('limit', '5')
      .set('page', page);

    return this.httpClient.get<any>(`${this.baseURL}/book`, {
      headers: {
        Authorization: 'Bearer J9smCC4ow_JqasHdob7-'
      },
      params
    })
  }

  getChapter(bookId?: string) {
    const params = new HttpParams()
    .set('limit', '1000');

    return this.httpClient.get<any>(`${this.baseURL}/book/${bookId}/chapter`, {
      headers: {
        Authorization: 'Bearer J9smCC4ow_JqasHdob7-'
      },
      params
    })
  }
}
