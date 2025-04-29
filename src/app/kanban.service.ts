import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private apiUrl = 'http://localhost:3000'; //Chamado da API 

  constructor(private http: HttpClient) {}

  // Colunas
  getColunas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tb_coluna`);
  }

  criarColuna(coluna: { nome: string }): Observable<any> {
    console.log('Enviando requisição para criar coluna:', coluna);
    return this.http.post<any>(`${this.apiUrl}/tb_coluna`, coluna);
  }

  editarColuna(id: number, coluna: { nome: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tb_coluna/${id}`, coluna);
  }

  deletarColuna(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tb_coluna/${id}`);
  }

  // Cards
  getCards(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tb_card`);
  }

  criarCard(card: { nome: string; descricao: string; colunaId: number }): Observable<any> {
    console.log('Enviando requisição para criar card:', card);
    return this.http.post<any>(`${this.apiUrl}/tb_card`, card);
  }

  atualizarCard(id: number, card: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tb_card/${id}`, card);
  }

  editarCard(id: number, card: { nome: string; descricao: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/tb_card/${id}`, card);  }

  deletarCard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tb_card/${id}`);
  }
}