import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IBoard, ICreateSwimlane, ISwimlane, IUpdateSwimlane } from '../models/board.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SwimlanesService {
  http = inject(HttpClient);
  // Método para criar uma nova coluna no frontend
  criarSwimlane(createSwimlane: ICreateSwimlane): Observable<ISwimlane> {
    return this.http.post<ISwimlane>('/api/swimlane', createSwimlane);
  }
  // Método para atualizar a ordem das colunas no frontend
  atualizarSwimlane(updateSwimlane: IUpdateSwimlane): Observable<ISwimlane> {
    return this.http.patch<ISwimlane>(`/api/swimlane/${updateSwimlane.id}`, updateSwimlane);
  }
  // Método para deletar uma coluna no frontend
  deletarSwimlane(swimlaneId: number): Observable<void> {
    return this.http.delete<void>(`/api/swimlane/${swimlaneId}`);
  }
  // Método para obter uma coluna por id no frontend
  getBoardById(id: number): Observable<IBoard> {
    return this.http.get<IBoard>(`/api/swimlane/${id}`);
  }
  // Método para obter todas as colunas no frontend
  getBoards(): Observable<IBoard[]> {
    return this.http.get<IBoard[]>('/api/swimlane');
  }
}