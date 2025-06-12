import { Injectable }      from '@angular/core';
import { HttpClient }      from '@angular/common/http';
import { Observable }      from 'rxjs';
import { Card }            from '../../shared/models/card.model';
import { environment }     from '../../../enviroments/enviroment';

export interface CreateCardDto {
  title: string;
  description?: string;
  order: number;
  columnId: number;
}
export interface UpdateCardDto {
  title?: string;
  description?: string;
  order?: number;
}

@Injectable({ providedIn: 'root' })
export class CardsApiService {
  private readonly base = `${environment.apiUrl}/cards`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Card[]> {
    return this.http.get<Card[]>(this.base);
  }

  create(dto: CreateCardDto): Observable<Card> {
    return this.http.post<Card>(this.base, dto);
  }

  update(id: number, dto: UpdateCardDto): Observable<Card> {
    return this.http.patch<Card>(`${this.base}/${id}`, dto);
  }

  move(id: number, columnId: number, order: number): Observable<Card> {
    return this.http.patch<Card>(
      `${this.base}/${id}/move/${columnId}/${order}`,
      {}
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
