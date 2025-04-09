import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Card } from './models/card.model';
import { KanbanService } from './services/kanban.service';
import { AlertController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { AddEditCardModalComponent } from './modals/kanban-add-edit-card.modal';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';

interface Column {
  id: number;
  title: string;
}

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.page.html',
  styleUrls: ['./kanban.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, DragDropModule],
})
export class KanbanPage implements OnInit {
  columns: Column[] = [
    { id: 1, title: 'To Do' },
    { id: 2, title: 'In Progress' },
    { id: 3, title: 'Done' },
  ];
  connectedDropLists: string[] = [];
  cards: { [key: number]: Card[] } = {};
  loading = true;
  error: any;

  private socketSubscriptions: Subscription[] = [];

  constructor(
    private kanbanService: KanbanService,
    private alertController: AlertController,
    private modalController: ModalController,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    this.columns.forEach((column) => {
      this.cards[column.id] = [];
    });

    this.connectedDropLists = this.columns.map((c) => `columnDropList-${c.id}`);
    this.listenToSocketEvents();
    this.loadCards();
  }

  listenToSocketEvents() {
    const subs = [
      this.socketService.onCardCreated().subscribe(() => this.loadCards()),
      this.socketService.onCardUpdated().subscribe(() => this.loadCards()),
      this.socketService.onCardDeleted().subscribe(() => this.loadCards())
    ];
    this.socketSubscriptions.push(...subs);
  }

  loadCards() {
    this.loading = true;
    this.error = null;
    let completed = 0;
    const totalColumns = this.columns.length;

    this.columns.forEach((column) => {
      this.kanbanService.getCardsByColumnId(column.id).subscribe({
        next: (cards) => {
          this.cards[column.id] = cards || [];
          completed++;
          if (completed === totalColumns) {
            this.loading = false;
          }
        },
        error: (err) => {
          if (err.message.includes('Nenhum card encontrado')) {
            this.cards[column.id] = [];
          } else {
            console.error(`Erro ao carregar cards da coluna ${column.id}:`, err);
            this.error = err;
            this.cards[column.id] = [];
          }
          completed++;
          if (completed === totalColumns) {
            this.loading = false;
          }
        },
      });
    });
  }

  onCardDrop(event: CdkDragDrop<Card[]>, targetColumnId: number) {
    const prevColumnId = +event.previousContainer.id.split('-').pop()!;
    const movedCard = { ...event.previousContainer.data[event.previousIndex] };

    const newCards = { ...this.cards };
    newCards[prevColumnId] = [...(newCards[prevColumnId] || [])];
    newCards[targetColumnId] = [...(newCards[targetColumnId] || [])];

    if (event.previousContainer === event.container) {
      moveItemInArray(newCards[targetColumnId], event.previousIndex, event.currentIndex);
      this.cards = { ...newCards };
    } else {
      transferArrayItem(
        newCards[prevColumnId],
        newCards[targetColumnId],
        event.previousIndex,
        event.currentIndex
      );

      this.kanbanService.updateCardColumn(movedCard.id, targetColumnId).subscribe({
        error: (err) => {
          console.error('Erro ao atualizar card no banco:', err);
          const revertCards = { ...this.cards };
          transferArrayItem(
            revertCards[targetColumnId],
            revertCards[prevColumnId],
            event.currentIndex,
            event.previousIndex
          );
          this.cards = { ...revertCards };
        },
      });
    }
  }

  async deleteCard(card: Card, columnId: number) {
    const alert = await this.alertController.create({
      header: 'Confirmar exclusão',
      message: `Você tem certeza que deseja excluir o card "${card.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            const newCards = { ...this.cards };
            newCards[columnId] = newCards[columnId].filter(c => c.id !== card.id);
            this.cards = { ...newCards };
            this.kanbanService.deleteCard(card.id).subscribe({
              error: (err) => {
                console.error('Erro ao deletar card no banco:', err);
              },
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async openAddEditModal(card?: Card, columnId: number = 1) {
    const modal = await this.modalController.create({
      component: AddEditCardModalComponent,
      cssClass: 'custom-size-modal rounded-modal',
      componentProps: {
        title: card?.title || '',
        description: card?.description || '',
        isEdit: !!card
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      if (!card) {
        const cardInput = {
          ...data,
          columnId: columnId
        };
        this.kanbanService.createCard(cardInput).subscribe({
          error: err => console.error('Erro ao criar card:', err)
        });
      } else {
        const updatedCard = {
          ...card,
          title: data.title,
          description: data.description
        };
        this.kanbanService.updateCard(updatedCard).subscribe({
          error: err => console.error('Erro ao atualizar card:', err)
        });
      }
    }
  }
}
