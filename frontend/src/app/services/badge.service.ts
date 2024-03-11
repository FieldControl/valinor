import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Badge } from '../models/badge';

@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  private readonly API = "http://localhost:3000/badges";
  constructor(private http: HttpClient) { }

  list(): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.API)
  }
}
