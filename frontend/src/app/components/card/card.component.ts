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
}
