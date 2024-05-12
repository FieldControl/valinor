import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class TabsService {

  constructor(private http: HttpClient) {}

  getBoards() {
    return this.http.get('http://localhost:3000/board');
  }
}
