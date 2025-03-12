import { Component, Input } from '@angular/core';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-column',
  standalone: true,
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css'],
  imports: [CardComponent],
})
export class ColumnComponent {
  @Input() title: string = 'Sem Titulo'; // Nome padrão

  @Input() cards: { id: number; title: string; description: string }[] = [];

  editTitle() {
    const newTitle = prompt('Editar nome da coluna:', this.title);
    if (newTitle !== null) {
      this.title = newTitle;
    }
  }

  deleteColumn() {
    if (confirm('Tem certeza que deseja excluir esta coluna?')) {
      console.log('Coluna excluída:', this.title);
    }
  }
}
