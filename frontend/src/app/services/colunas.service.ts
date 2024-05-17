import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Colunas } from '../interfaces/colunas.interface';

@Injectable({
  providedIn: 'root'
})
export class ColunaService {
  
  private apiUrl = 'http://localhost:3000/colunas';

  constructor(private http: HttpClient) {}

  getColunas(): Observable<Colunas[]> {
    return this.http.get<Colunas[]>(this.apiUrl);
  }

  createColuna(coluna: Colunas): Observable<Colunas> {
    return this.http.post<Colunas>(this.apiUrl, coluna);
  }

  updateColuna(id: number, coluna: Colunas): Observable<Colunas> {
    return this.http.put<Colunas>(`${this.apiUrl}/${id}`, coluna);
  }

  deleteColuna(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
