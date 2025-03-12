import { Component, inject, Input } from '@angular/core';
import { KanbanService } from '../../services/kanban.service';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-card',
  standalone: true,
  imports:[CommonModule,FormsModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  private kanbanService = inject(KanbanService);
  @Input() id!: number;
  @Input() title: string = 'Tarefa sem nome';
  @Input() description: string = 'Sem descrição';

  isEditing = false;
  newTitle = this.title;
  newDescription = this.description;

  editCard() {
    console.log('Tentando editar um card com ID:', this.id);
    this.isEditing = true;
    this.newTitle = this.title;
    this.newDescription = this.description;
  }

  saveChanges() {
    this.kanbanService
      .editCard(this.id, this.newTitle, this.newDescription)
      .subscribe(
        (response) => {
          const updatedCard = response.data.updateCard;
          console.log('Card atualizado:', updatedCard);
          this.title = updatedCard.title; // Atualiza o título no front-end
          this.description = updatedCard.description; // Atualiza a descrição no front-end
          this.isEditing = false; // Sai do modo de edição
        },
        (error) => {
          console.error('Erro ao atualizar o card:', error);
        }
      );
  }

  cancelEdit() {
    this.isEditing = false;
    this.newTitle = this.title; // Reseta para o valor original
    this.newDescription = this.description; // Reseta para o valor original
  }

  deleteCard() {
    console.log('Tentando deletar card com ID:', this.id);

    if (!this.id) {
      console.error('Erro: ID do card está indefinido!');
      return;
    }

    if (confirm('tem certeza que deseja deletar o Card?')) {
      this.kanbanService.deletCard(this.id).subscribe(
        (response) => {
          const deleteData = response.data.deleteCard;
          console.log('Card deletado:', deleteData);
        },
        (error) => {
          console.error('Erro ao deletar o card:', error);
        }
      );
    }
  }
}
