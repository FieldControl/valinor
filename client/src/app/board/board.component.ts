import { Component } from '@angular/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
  // Array para armazenar as colunas do quadro Kanban
  columns: { title: string }[] = [
    { title: 'To Do' },
    { title: 'Doing' },
    { title: 'Done' }
  ];

  // Variáveis para controlar a exibição do campo de entrada para adicionar nova coluna
  showAddColumn: boolean = false;
  newColumnTitle: string = '';

  // Método para exibir o campo de entrada para adicionar nova coluna
  showAddColumnInput() {
    this.showAddColumn = true;
  }

  // Método para adicionar nova coluna ao quadro
  addColumn() {
    // Verifica se o título da nova coluna não está vazio
    if (this.newColumnTitle.trim() !== '') {
      // Adiciona a nova coluna ao array de colunas
      this.columns.push({ title: this.newColumnTitle });
      // Limpa o campo de entrada e oculta o campo de entrada novamente
      this.newColumnTitle = '';
      this.showAddColumn = false;
    }
  }
}
