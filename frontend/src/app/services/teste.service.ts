import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TesteService {
  private apiUrl = '';
  constructor(private client: HttpClient) {}

  getTest(): Observable<any> {
    return this.client.get(this.apiUrl);
  }
}
