import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent {
  columns: { title: string, cards: { title: string, description: string }[] }[] = [
    { title: 'Pendente', cards: [] },
    { title: 'Em Andamento', cards: [] },
    { title: 'Concluído', cards: [] }
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
      this.columns.push({ title: this.newColumnTitle, cards: [] });
      // Limpa o campo de entrada e oculta o campo de entrada novamente
      this.newColumnTitle = '';
      this.showAddColumn = false;
    }
  }

  // Método para remover a coluna
  removeColumn(columnIndex: number) {
    this.columns.splice(columnIndex, 1);
  }

  // Biblioteca de arrastar e soltar do Angular Material
  dropColumn(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  dropCard(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }
}
