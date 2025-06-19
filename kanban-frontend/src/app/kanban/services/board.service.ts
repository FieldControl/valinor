import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Board } from '../../models/board.model';
import { Observable } from 'rxjs';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private apiUrl = 'http://localhost:3000/board'; // ajuste futuramente para prod

  constructor(private http: HttpClient) {}

  getBoard(): Observable<Board> {
    return this.http.get<Board>(this.apiUrl);
  }


getMockBoard() {
  const mockBoard: Board = {
    id: '1',
    title: 'Meu Quadro Kanban',
    columns: [
      {
        id: 'col1',
        title: 'A Fazer',
        cards: [
          { id: 'c1', title: 'Criar layout inicial' },
          { id: 'c2', title: 'Estilizar colunas' },
        ],
      },
      {
        id: 'col2',
        title: 'Em andamento',
        cards: [{ id: 'c3', title: 'Integrar API' }],
      },
      {
        id: 'col3',
        title: 'Feito',
        cards: [{ id: 'c4', title: 'Configurar projeto Angular SSR' }],
      },
    ],
  };

  return of(mockBoard);
}
}