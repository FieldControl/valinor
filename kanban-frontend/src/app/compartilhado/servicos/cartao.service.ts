import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ICartao } from '../modelos/quadro.modelo';

@Injectable({
  providedIn: 'root',
})
export class CartaoService {
  http = inject(HttpClient);

  atualizarOrdemCartaoEColuna(
    quadroId: number,
    cartoes: ICartao[]
  ): Observable<ICartao[]> {
    return this.http.put<ICartao[]>('/api/cartao/atualizar-ordem', {
      quadroId,
      cartoes,
    });
  }
  createCartao(criarCartao: Partial<ICartao>): Observable<ICartao> {
    return this.http.post<ICartao>('/api/cartao', criarCartao);
  }
  updateCartao(id: number, criarCartao: Partial<ICartao>): Observable<ICartao> {
    return this.http.patch<ICartao>(`/api/cartao/${id}`, criarCartao);
  }
  deleteCartao(cartaoId: number): Observable<void> {
    return this.http.delete<void>(`/api/cartao/${cartaoId}`);
  }
  getCartaoPorId(id: number): Observable<ICartao> {
    return this.http.get<ICartao>(`/api/cartao/${id}`);
  }
  getCartao(): Observable<ICartao[]> {
    return this.http.get<ICartao[]>('/api/cartao');
  }
}
