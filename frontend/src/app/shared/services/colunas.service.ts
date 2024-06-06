import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { IColuna, ICreateColuna, IUpdateSColuna } from './models/quadro.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ColunasService {

  http = inject(HttpClient);

  createColuna(createColuna: ICreateColuna): Observable<IColuna> {
    return this.http.post<IColuna>('/api/colunas', createColuna);
  }

  updateColuna(updateColuna: IUpdateSColuna): Observable<IColuna> {
    return this.http.patch<IColuna>(
      `/api/colunas/${updateColuna.id}`,
      updateColuna
    );
  }

  
  deleteColuna(colunaId: number): Observable<void> {
    return this.http.delete<void>(`/api/colunas/${colunaId}`);
  }
  // getBoardById(id: number): Observable<IBoard> {
  //   return this.http.get<IBoard>(`/api/swimlane/${id}`);
  // }
  // getBoards(): Observable<IBoard[]> {
  //   return this.http.get<IBoard[]>('/api/swimlane');
  // }
}
