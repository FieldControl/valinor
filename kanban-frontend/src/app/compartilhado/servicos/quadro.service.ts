import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IQuadro, ICriarQuadro } from '../modelos/quadro.modelo';

export interface ReordenarColunaDto {
  quadroId: number;
  itens: ReordenarItemColunaDto [];
}
export interface ReordenarItemColunaDto {
  id: number;
  ordem: number;
}

@Injectable({
  providedIn: 'root',
})
export class QuadroService {
  http = inject(HttpClient);

  createQuadro(criarQuadro: ICriarQuadro): Observable<IQuadro> {
    return this.http.post<IQuadro>('/api/quadro', criarQuadro);
  }
  updateOrdemColuna(reordenar: ReordenarColunaDto): Observable<void> {
    return this.http.put<void>('/api/coluna/atualizar-ordem', reordenar);
  }
  updateQuadro(id: number, criarQuadro: ICriarQuadro): Observable<IQuadro> {
    return this.http.patch<IQuadro>(`/api/quadro/${id}`, criarQuadro);
  }
  deleteQuadro(quadroId: number): Observable<void> {
    return this.http.delete<void>(`/api/quadro/${quadroId}`);
  }
  getQuadroPorId(id: number): Observable<IQuadro> {
    return this.http.get<IQuadro>(`/api/quadro/${id}`);
  }
  getQuadro(): Observable<IQuadro[]> {
    return this.http.get<IQuadro[]>('/api/quadro');
  }
}
