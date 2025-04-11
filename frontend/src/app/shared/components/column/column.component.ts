import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CardComponent } from "../card/card.component";

@Component({
  selector: 'app-column',
  imports: [CardComponent, CommonModule, FormsModule],
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css']
})
export class ColumnComponent {
  columns = [
    { title: 'A fazer' },
    { title: 'Em andamento' },
    { title: 'Concluído' }
  ];

  isAddingColumn = false; // Controla a exibição do campo de entrada
  newColumnTitle = ''; // Armazena o nome da nova coluna
  editingColumnIndex: number | null = null; // Índice da coluna sendo editada
  editedColumnTitle = ''; // Título editado temporariamente

  startAddingColumn(): void {
    this.isAddingColumn = true;
  }

  addColumn(): void {
    const trimmedTitle = this.newColumnTitle.trim();
    if (trimmedTitle) {
      this.columns.push({ title: trimmedTitle });
      this.newColumnTitle = '';
      this.isAddingColumn = false;
    } else {
      console.error('Nome da coluna inválido ou vazio.');
    }
  }

  cancelAddingColumn(): void {
    this.isAddingColumn = false;
    this.newColumnTitle = '';
  }

  confirmDeleteColumn(index: number): void {
    const confirmed = confirm('Tem certeza de que deseja excluir esta coluna?');
    if (confirmed) {
      this.deleteColumn(index);
    }
  }

  deleteColumn(index: number): void {
    this.columns.splice(index, 1);
  }

  startEditingColumn(index: number): void {
    this.editingColumnIndex = index;
    this.editedColumnTitle = this.columns[index].title;
  }

  saveColumnTitle(index: number): void {
    const trimmedTitle = this.editedColumnTitle.trim();
    if (trimmedTitle) {
      this.columns[index].title = trimmedTitle;
      this.editingColumnIndex = null;
    } else {
      console.error('Título da coluna inválido ou vazio.');
    }
  }

  cancelEditingColumn(): void {
    this.editingColumnIndex = null;
    this.editedColumnTitle = '';
  }
}