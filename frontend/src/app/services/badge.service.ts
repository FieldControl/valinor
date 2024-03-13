import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Badge } from '../models/badge';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  private readonly API = `${environment.baseApiUrl}/badges`;
  constructor(private http: HttpClient) { }

  list(): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.API)
  }
}
