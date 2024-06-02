import { HttpClient } from '@angular/common/http'; // Importa o módulo HttpClient para realizar requisições HTTP
import { Injectable, inject } from '@angular/core'; // Importa os módulos Injectable e inject
import { Observable } from 'rxjs'; // Importa o módulo Observable do RxJS
import { IBoard, ICreateSwimlane, ISwimlane, IUpdateSwimlane } from '../Models/board-model'; // Importa os tipos relacionados aos quadros e às swimlanes

@Injectable({
  providedIn: 'root',
})
export class SwimlanesService {
  http = inject(HttpClient); // Injeta o serviço HttpClient para realizar requisições HTTP

  // Método para criar uma nova swimlane
  createSwimlane(createSwimlane: ICreateSwimlane): Observable<ISwimlane> {
    return this.http.post<ISwimlane>('/api/swimlane', createSwimlane); // Envia uma requisição POST para criar uma nova swimlane
  }

  // Método para atualizar uma swimlane existente
  updateSwimlane(updateSwimlane: IUpdateSwimlane): Observable<ISwimlane> {
    return this.http.patch<ISwimlane>(
      `/api/swimlane/${updateSwimlane.id}`,
      updateSwimlane
    ); // Envia uma requisição PATCH para atualizar uma swimlane existente
  }

  // Método para excluir uma swimlane
  deleteSwimlane(swimlaneId: number): Observable<void> {
    return this.http.delete<void>(`/api/swimlane/${swimlaneId}`); // Envia uma requisição DELETE para excluir uma swimlane
  }

  // Método para obter os detalhes de uma swimlane pelo ID do quadro
  getBoardById(id: number): Observable<IBoard> {
    return this.http.get<IBoard>(`/api/swimlane/${id}`); // Envia uma requisição GET para obter os detalhes de uma swimlane pelo ID do quadro
  }

  // Método para obter todas as swimlanes
  getBoards(): Observable<IBoard[]> {
    return this.http.get<IBoard[]>('/api/swimlane'); // Envia uma requisição GET para obter todas as swimlanes
  }
}
