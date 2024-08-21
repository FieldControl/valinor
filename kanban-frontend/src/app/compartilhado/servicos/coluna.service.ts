import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ICriarColuna,
  IQuadro,
  IColuna,
  IAtualizarColuna,
} from '../modelos/quadro.modelo';

@Injectable({
  providedIn: 'root',
})
export class ColunaService {
  http = inject(HttpClient);

  createColuna(criarColuna: ICriarColuna): Observable<IColuna> {
    return this.http.post<IColuna>('/api/coluna', criarColuna);
  }
  updateColuna(atualizarColuna: IAtualizarColuna): Observable<IColuna> {
    return this.http.patch<IColuna>(
      `/api/coluna/${atualizarColuna.id}`,
      atualizarColuna
    );
  }
  deleteColuna(colunaId: number): Observable<void> {
    return this.http.delete<void>(`/api/coluna/${colunaId}`);
  }
  getQuadroPorId(id: number): Observable<IQuadro> {
    return this.http.get<IQuadro>(`/api/coluna/${id}`);
  }
  getQuadros(): Observable<IQuadro[]> {
    return this.http.get<IQuadro[]>('/api/coluna');
  }
}
