import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

export interface Card {
  _id?: string;
  status: string;
  Priority: number;
  title: string;
  desc?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private apiUrl = 'http://localhost:3000/list';

  constructor(private http: HttpClient) {}

  // Método para listar todos os cards
  listarTodos(): Observable<Card[]> {
    return this.http.get<Card[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Erro ao buscar os cards:', error);
        return throwError(error);
      })
    );
  }

  // Método para buscar um card por ID
  buscarPorId(id: string): Observable<Card> {
    return this.http.get<Card>(`${this.apiUrl}/${id}`);
  }

  //Método para buscar por Status
  listarPorStatus(status: string): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.apiUrl}/${status}`);
  }

  // Método para criar um novo card
  criar(card: Card): Observable<Card> {
    return this.http.post<Card>(this.apiUrl, card);
  }

  // Método para atualizar um card
  atualizar(id: string, card: Card): Observable<Card> {
    return this.http.put<Card>(`${this.apiUrl}/${id}`, card).pipe(
      catchError((error) => {
        console.error('Erro ao atualizar o card:', error);
        return throwError(error);
      })
    );
  }

  // Método para remover um card
  remover(id: string): Observable<Card> {
    return this.http.delete<Card>(`${this.apiUrl}/${id}`);
  }
}
