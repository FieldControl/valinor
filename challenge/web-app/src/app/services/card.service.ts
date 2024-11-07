import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { API_URL } from '../api';
import { Card, CreateCardBody, EditCardBody } from '../interfaces/card';
import { ColumnService } from './column.service';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  cards = signal<Card[]>([])

  constructor(private http: HttpClient, private columnService: ColumnService) { }

  createCard(createCardBody: CreateCardBody) {
    this.http.post<Card>(`${API_URL}/cards`, createCardBody).subscribe({
      next: () => {
        this.columnService.refreshColumns()
      }
    })
  }

  editCard(cardId: number, editCardBody: EditCardBody) {
    this.http.patch<Card>(`${API_URL}/cards/${cardId}`, editCardBody).subscribe({
      next: () => {
        this.columnService.refreshColumns()
      }
    })
  }

  deleteCard(cardId: number) {
    this.http.delete(`${API_URL}/cards/${cardId}`).subscribe({
      next: () => {
        this.columnService.refreshColumns()
      }
    })
  }
}
