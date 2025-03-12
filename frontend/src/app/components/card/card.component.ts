import { Component, inject, Input } from '@angular/core';
import { KanbanService } from '../../services/kanban.service';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  private kanbanService = inject(KanbanService);
  @Input() id!: number;
  @Input() title: string = 'Tarefa sem nome';
  @Input() description: string = 'Sem descrição';
  


  deleteCard() {

    console.log("Tentando deletar card com ID:", this.id);

    if (!this.id) {
      console.error("Erro: ID do card está indefinido!");
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
