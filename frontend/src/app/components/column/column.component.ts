import { Component, Input, inject } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { CommonModule } from '@angular/common';
import { KanbanService } from '../../services/kanban.service';

@Component({
  selector: 'app-column',
  standalone: true,
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css'],
  imports: [CardComponent, CommonModule],
})
export class ColumnComponent {
  private kanbanService = inject(KanbanService);

  @Input() id!: number; // Agora a coluna tem um ID
  @Input() title: string = 'Sem Título'; // Nome padrão
  @Input() cards: { id: number; title: string; description: string }[] = [];

  editColumn() {
    const newTitle = prompt('Digite o novo nome da coluna:', this.title);
    if (!newTitle || newTitle === this.title) return;

    this.kanbanService.updateColumn(this.id, newTitle).subscribe(
      (response) => {
        const updatedColumn = response.data.updateColumn;
        this.title = updatedColumn.title; // Atualiza diretamente no componente
      },
      (error) => {
        console.error('Erro ao atualizar a coluna:', error);
      }
    );
  }

  deleteColumn() {
    if (confirm('Tem certeza que deseja excluir esta coluna?')) {
      this.kanbanService.deleteColumn(this.id).subscribe(
        (response) => {
          const deletedColumn = response.data.deleteColumn;
          console.log('Coluna deletada:', deletedColumn);
        },
        (error) => {
          console.error('Erro ao deletar a coluna:', error);
        }
      );
    }
  }

  showCardForm = false;
  newCardTitle: string = '';
  newCardDescription: string = '';

  updateNewCardTitle(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.newCardTitle = inputElement.value;
  }
  
  updateNewCardDescription(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.newCardDescription = inputElement.value;
  }
  

  createCard() {
    if (!this.newCardTitle || !this.newCardDescription) {
      alert('Nome e descrição do card são obrigatórios!');
      return;
    }

    this.kanbanService
      .createCard(this.id, this.newCardTitle, this.newCardDescription)
      .subscribe(
        (response) => {
          const newCard = response.data.createCard;
          this.cards.push(newCard);
          this.showCardForm = false;
          this.newCardTitle = '';
          this.newCardDescription = '';
          console.log('Card criado:', newCard);
        },

        (error) => {
          console.error('Erro ao criar card:', error);
        }
      );

    console.log('Criando um novo card');
  }
}
