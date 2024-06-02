import { HttpClient } from '@angular/common/http'; // Importa o módulo HttpClient para realizar requisições HTTP
import { Injectable, inject } from '@angular/core'; // Importa os módulos Injectable e inject
import { Observable } from 'rxjs'; // Importa o módulo Observable do RxJS
import { IBoard, ICreateBoard } from '../Models/board-model'; // Importa os tipos IBoard e ICreateBoard

// Define a interface ReordereSwimlaneDto para reordenar as swimlanes
export interface ReordereSwimlaneDto {
  boardId: number; // ID do quadro
  items: ReordereSwimlaneItemDto[]; // Lista de itens para reordenação
}

// Define a interface ReordereSwimlaneItemDto para cada item a ser reordenado
export interface ReordereSwimlaneItemDto {
  id: number; // ID do item (swimlane)
  order: number; // Nova ordem do item
}

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  // Injeta o serviço HttpClient para realizar requisições HTTP
  http = inject(HttpClient);

  // Método para criar um novo quadro
  createBoard(createBoard: ICreateBoard): Observable<IBoard> {
    return this.http.post<IBoard>('/api/board', createBoard); // Envia uma requisição POST para criar um novo quadro
  }

  // Método para atualizar a ordem das swimlanes de um quadro
  updateSwimlaneOrder(reorder: ReordereSwimlaneDto): Observable<void> {
    return this.http.put<void>('/api/swimlane/update-order', reorder); // Envia uma requisição PUT para atualizar a ordem das swimlanes
  }

  // Método para atualizar um quadro existente
  updateBoard(id: number, createBoard: ICreateBoard): Observable<IBoard> {
    return this.http.patch<IBoard>(`/api/board/${id}`, createBoard); // Envia uma requisição PATCH para atualizar um quadro existente
  }

  // Método para excluir um quadro
  deleteBoard(boardId: number): Observable<void> {
    return this.http.delete<void>(`/api/board/${boardId}`); // Envia uma requisição DELETE para excluir um quadro
  }

  // Método para obter os detalhes de um quadro pelo ID
  getBoardById(id: number): Observable<IBoard> {
    return this.http.get<IBoard>(`/api/board/${id}`); // Envia uma requisição GET para obter os detalhes de um quadro pelo ID
  }

  // Método para obter todos os quadros
  getBoards(): Observable<IBoard[]> {
    return this.http.get<IBoard[]>('/api/board'); // Envia uma requisição GET para obter todos os quadros
  }
}
