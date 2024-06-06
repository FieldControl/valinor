import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ILogin, ILoginReponse, IRegister } from './models/user.model';
import { ICreateQuadro, IQuadro } from './models/quadro.model';


export interface ReordereColunaDto {
  quadroId: number;
  items: ReordereColunaItemDto[];
}
export interface ReordereColunaItemDto {
  id: number;
  ordem: number;
}
@Injectable({
  providedIn: 'root'
})
export class QuadroService {

  http = inject(HttpClient);



  getQuadro(): Observable<IQuadro[]> {
    return this.http.get<IQuadro[]>('/api/quadro');
  }

  createQuadro(createQuadro: ICreateQuadro): Observable<IQuadro> {
    return this.http.post<IQuadro>('/api/quadro', createQuadro);
  }

  updateQuadro(id: number, createQuadro: ICreateQuadro): Observable<IQuadro> {
    return this.http.patch<IQuadro>(`/api/quadro/${id}`, createQuadro);
  }

  deleteQuadro(quadroId: number): Observable<void> {
    return this.http.delete<void>(`/api/quadro/${quadroId}`);
  }

  getQuadroById(id: number): Observable<IQuadro> {
    return this.http.get<IQuadro>(`/api/quadro/${id}`);
  }
  updateOrdemColuna(reorder: ReordereColunaDto): Observable<void> {
    return this.http.put<void>('/api/colunas/update-order', reorder);
  }
}
