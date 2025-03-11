import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css']
})
export class ColumnComponent {
  @Input() title: string = ''; // Nome da coluna

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
