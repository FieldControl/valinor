import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DemoNgZorroAntdModule } from '../../shared/utils/DemoNgZorroAntdModules';
import { Card } from './card.interface';
import { GraphqlService } from '../../shared/graphql/graphql.service';
import { GET_ALL_CARDS } from '../../shared/queries/card.queries';
import { AddTaskModalComponent } from '../../shared/add-task-modal/add-task-modal.component';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    CommonModule,
    DemoNgZorroAntdModule,
    DragDropModule
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() card?: Card;
  @Input() columnId?: number;
  cards: Card[] = [];
  loading = true;
  error: any;

  constructor(private graphqlService: GraphqlService, private modalService: NzModalService) {}

  openEditTaskModal(card: Card): void {
    const modalRef: NzModalRef<AddTaskModalComponent> = this.modalService.create({
      nzTitle: 'Editar Tarefa',
      nzContent: AddTaskModalComponent,
      nzFooter: null
    });
    modalRef.componentInstance!.card = card;
  }

  deleteCard(cardId: number | undefined) {
    const DELETE_CARD_MUTATION = `
      mutation DeleteCard($id: Int!) {
        deleteCard(id: $id)
      }
    `;

    this.graphqlService.mutate(DELETE_CARD_MUTATION, { id: cardId }).subscribe({
      next: (result) => {
        if (result.data.deleteCard) {
          this.cards = this.cards.filter(card => card.id !== cardId);
        } else {
          console.error('Falha ao deletar o card');
        }
      },
      error: (error) => {
        console.error('Erro ao realizar mutação de deleção:', error);
      },
    });
  }

  ngOnInit(): void {
    this.graphqlService.query(GET_ALL_CARDS).subscribe({
      next: (result) => {
        this.cards = result.data.getAllCards
        .filter((card: { columnId: number | undefined; }) => card.columnId === this.columnId)
        .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
        this.cards = [];
      },
    });
  }

  updateCardColumn(card: Card, newColumnId: number): void {
    const UPDATE_CARD_MUTATION = `
      mutation UpdateCard($id: Int!, $columnId: Float!) {
        updateCard(id: $id, data: { columnId: $columnId }) {
          id
          title
          columnId
        }
      }
    `;
  
    this.graphqlService.mutate(UPDATE_CARD_MUTATION, { id: card.id, columnId: newColumnId }).subscribe({
      next: (result) => {
        if (result.data.updateCard) {
          card.columnId = newColumnId;
        } else {
          console.error('Falha ao atualizar a coluna do card');
        }
      },
      error: (error) => {
        console.error('Erro ao realizar mutação de atualização do card:', error);
      },
    });
  }
  
  reorderTask(list: Card[], fromIndex: number, toIndex: number): void {
    moveItemInArray(list, fromIndex, toIndex)
  }

  transferTask(
    previousList: Card[],
    currentList: Card[],
    fromIndex: number,
    toIndex: number
  ): void {
    transferArrayItem(previousList, currentList, fromIndex, toIndex);
  }

  moveTask(dropEvent: CdkDragDrop<Card[]>): void {
    const { previousContainer, container, previousIndex, currentIndex } = dropEvent;
    const isSameContainer = previousContainer === container;
  
    if (isSameContainer && previousIndex === currentIndex) {
      return;
    }
    if (isSameContainer) {
      this.reorderTask(container.data, previousIndex, currentIndex);
    } else {
      this.transferTask(previousContainer.data, container.data, previousIndex, currentIndex);
      
      const movedCard = container.data[currentIndex];
      const newColumnId = this.columnId ?? 0;
  
      this.updateCardColumn(movedCard, newColumnId);
    }
  }
  
}
