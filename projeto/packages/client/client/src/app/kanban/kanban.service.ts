import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private apiUrl = 'http://localhost:3000/kanban'; 

  constructor(private http: HttpClient) { }

//Centraliza a requisição da API para o backend que foi criado, direcionando as páginas dependendo da função que será utilizada.

  pegaColunas(): Observable<any>{ 
    return this.http.get(`${this.apiUrl}/colunas`);
  }

  criaColuna(titulo: string): Observable<any>{ 
    return this.http.post(`${this.apiUrl}/colunas`, { titulo });
  }

  criaCard(colunaId: number, titulo: string, descricao: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cards/${colunaId}`, {colunaId, titulo, descricao});
  }


deletarCard(colunaId: number, cardId: number): Observable<void> {
  return this.http.delete<void>(
    `${this.apiUrl}/colunas/${colunaId}/cards/${cardId}`
  );
}

editarCard(colunaId: number, cardId: number, titulo: string, descricao: string): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/colunas/${colunaId}/cards/${cardId}`, {
    titulo,
    descricao,
  });
}

editarColuna(colunaId: string, titulo: string): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/colunas/${colunaId}`, {titulo});
}

}
