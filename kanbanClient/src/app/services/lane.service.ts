import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InsertModel } from '../models/operations/insert.model';
import { UpdateModel } from '../models/operations/update.model';
import { LaneModel } from '../models/lane.model';

@Injectable({
  providedIn: 'root'
})
export class LaneService {
  private apiUrl = 'http://localhost:3000/Lanes';

  constructor(private http: HttpClient) { }

  getLanes(boardId: number): Observable<LaneModel[]> {
    const headers = this.generateHeaders();
    return this.http.get<LaneModel[]>(this.apiUrl + "/board/" + boardId, {headers});
  }

  getLane(id: string): Observable<LaneModel> {
    const url = `${this.apiUrl}/${id}`;
    const headers = this.generateHeaders();
    return this.http.get<LaneModel>(url, {headers});
  }

  createLane(Lane: LaneModel): Observable<InsertModel> {
    const headers = this.generateHeaders();
    return this.http.post<InsertModel>(this.apiUrl, Lane, { headers });
  }

  updateLane(Lane: LaneModel): Observable<UpdateModel> {
    const url = `${this.apiUrl}/${Lane.id}`;
    const headers = this.generateHeaders();
    return this.http.patch<UpdateModel>(url, Lane, { headers });
  }

  deleteLane(id: string): Observable<UpdateModel> {
    const url = `${this.apiUrl}/${id}`;
    const headers = this.generateHeaders();
    return this.http.delete<UpdateModel>(url, {headers});
  }
  generateHeaders(){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') });
    return headers;
  }
}
