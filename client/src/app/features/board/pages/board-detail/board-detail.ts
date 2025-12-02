import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';

import { Apollo } from 'apollo-angular';

import { GET_BOARD_BY_ID } from '../../data-access/board.queries';

import { Columns } from '../../ui/columns/columns.js';
import { ColumnModal } from '../../ui/column-modal/column-modal';

import { CardModal } from '../../ui/card-modal/card-modal';
import { UPDATE_CARD } from '../../data-access/card.mutations';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [CardModal, ColumnModal, RouterLink, Columns, CdkDropListGroup],
  templateUrl: './board-detail.html',
  styleUrl: './board-detail.css'
})
export class BoardsDetail implements OnInit {
  board: any = null;
  loading = true;

  // "configurações" dos modais das colunas
  isColumnModalOpen = false;
  modalMode: 'create' | 'edit' | 'remove' = 'create';
  selectedColumn: any = null;

  // "configurações" dos modais dos cards
  isCardModalOpen = false;
  cardModalMode: 'create' | 'edit' | 'remove' = 'create';
  selectedCard: any = null;
  targetColumnId?: number;

  private route = inject(ActivatedRoute);
  private apollo = inject(Apollo);

  ngOnInit() {
    const boardId = Number(this.route.snapshot.paramMap.get('id'));
    this.apollo
      .watchQuery({
        query: GET_BOARD_BY_ID,
        variables: { id: boardId }
      })
      .valueChanges.subscribe((result: any) => {
        if (result?.data?.board) {
          this.board = JSON.parse(JSON.stringify(result.data.board)); // necessário para evitar a "immutability" que o apollo seta 

        }
        this.loading = result.loading;
      });
  }

  // Funções para gerenciar os modais das coluans
  openCreateColumnModal() {
    this.modalMode = 'create';
    this.selectedColumn = null;
    this.isColumnModalOpen = true;
  }

  openEditColumnModal(column: any) {
    this.modalMode = 'edit';
    this.selectedColumn = column;
    this.isColumnModalOpen = true;
  }

  openRemoveColumnModal(column: any) {
    this.modalMode = 'remove';
    this.selectedColumn = column;
    this.isColumnModalOpen = true;
  }

  // Funções para gerencair os modias dos cards
  openCreateCardModal(columnId: number) {
    this.cardModalMode = 'create';
    this.targetColumnId = columnId;
    this.selectedCard = null;
    this.isCardModalOpen = true;
  }

  openEditCardModal(card: any) {
    this.cardModalMode = 'edit';
    this.selectedCard = card;
    this.isCardModalOpen = true;
  }

  openRemoveCardModal(card: any) {
    this.cardModalMode = 'remove';
    this.selectedCard = card;
    this.isCardModalOpen = true;
  }

  // Gerenciamento da função de drag and drop de cada card
  onCardMoved(event : any){
    this.apollo.mutate({
      mutation: UPDATE_CARD,
      variables: { 
        updateCardInput: {
          id: event.cardId,
          columnId: event.newColumnId,
        } 
      },
    }).subscribe({
      error: (err) => console.error('Erro ao mover card', err)
    });
  }
   
}