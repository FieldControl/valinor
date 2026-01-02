import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

export interface ColumnModel {
  id: number;
  name: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  cards: CardModel[];
}
export interface CardModel {
  id: number;
  name: string;
  description?: string;
  columnId: number;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface ReorderColumnDto {
  id: number;
  position: number;
}
export interface ReorderCardDto {
  id: number;
  position: number;
  columnId?: number;
}
export interface CreateColumnDto {
  name: string;
}
export interface UpdateColumnDto {
  id: number;
  name: string;
}
export interface UpdateCardDto {
  id: number;
  name: string;
  description?: string;
}
export interface CreateCardDto {
  name: string;
  description?: string;
  columnId: number;
}

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private http = inject(HttpClient);

  getColumnsWithCards() {
    return this.http.get<ColumnModel[]>(`${environment.apiUrl}/column/with-cards`);
  }
  reorderColumn(reorderColumnDto: ReorderColumnDto[]) {
    return this.http.post(`${environment.apiUrl}/column/reorder`, reorderColumnDto);
  }
  createColumn(createColumnDto: CreateColumnDto) {
    return this.http.post(`${environment.apiUrl}/column`, createColumnDto);
  }
  updateColumn({ id, name }: UpdateColumnDto) {
    return this.http.patch(`${environment.apiUrl}/column/${id}`, { name });
  }
  deleteColumn(columnId: number) {
    return this.http.delete(`${environment.apiUrl}/column/${columnId}`);
  }

  createCard(createCardDto: CreateCardDto) {
    return this.http.post(`${environment.apiUrl}/card`, createCardDto);
  }
  reorderCard(reorderCardDto: ReorderCardDto[]) {
    return this.http.post(`${environment.apiUrl}/card/reorder`, reorderCardDto);
  }
  updateCard({ id, ...updateCardDto }: UpdateCardDto) {
    return this.http.patch(`${environment.apiUrl}/card/${id}`, updateCardDto);
  }
  deleteCard(cardId: number) {
    return this.http.delete(`${environment.apiUrl}/card/${cardId}`);
  }
}
