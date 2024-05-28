import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ICreateSwimlane,
  IBoard,
  ISwimlane,
  IUpdateSwimlane,
} from '../models/board.model';

@Injectable({
  providedIn: 'root',
})
export class SwimlanesService {
  http = inject(HttpClient);

  createSwimlane(createSwimlane: ICreateSwimlane): Observable<ISwimlane> {
    return this.http.post<ISwimlane>('/api/swimlane', createSwimlane);
  }
  updateSwimlane(updateSwimlane: IUpdateSwimlane): Observable<ISwimlane> {
    return this.http.patch<ISwimlane>(
      `/api/swimlane/${updateSwimlane.id}`,
      updateSwimlane
    );
  }
  deleteSwimlane(swimlaneId: number): Observable<void> {
    return this.http.delete<void>(`/api/swimlane/${swimlaneId}`);
  }
  getBoardById(id: number): Observable<IBoard> {
    return this.http.get<IBoard>(`/api/swimlane/${id}`);
  }
  getBoards(): Observable<IBoard[]> {
    return this.http.get<IBoard[]>('/api/swimlane');
  }
}
