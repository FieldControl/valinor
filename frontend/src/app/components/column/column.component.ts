import { Component, Input } from '@angular/core';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-column',
  standalone: true,
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css'],
  imports:[CardComponent]
})
export class ColumnComponent {
  @Input() title: string = ' Samuel '; // Nome da coluna

  editTitle() {
    const newTitle = prompt('Editar nome da coluna:', this.title);
    if (newTitle !== null) {
      this.title = newTitle;
    }
  }

  deleteColumn() {
    if (confirm('Tem certeza que deseja excluir esta coluna?')) {
      // Aqui você pode emitir um evento para excluir a coluna do array de colunas no componente pai
      console.log('Coluna excluída:', this.title);
    }
  }
}
