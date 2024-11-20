import { Component, OnInit } from '@angular/core';
import { KanbanService } from '../services/kanban.service';
import { Column } from '../models/column.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
})
export class KanbanBoardComponent implements OnInit {
  columns: Column[] = [];
  newColumnName: string = '';
  newCardTitle: string = '';
  newCardDescription: string = '';
  showAddCard: { [key: number]: boolean } = {}; // Controla qual coluna mostra o formulário
  newCard: { [key: number]: { title: string; description: string } } = {}; // Inicializa o objeto newCard

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    this.loadColumns(); // Chamada para carregar as colunas ao iniciar
  }

  loadColumns(): void {
    this.kanbanService.getColumns().subscribe((columns) => {
      this.columns = columns;
    });
  }

  showAddCardForm(columnId: number): void {
    if (!this.newCard[columnId]) {
      this.newCard[columnId] = { title: '', description: '' }; // Inicializa com valores vazios
    }

    this.showAddCard[columnId] = true;
  }

  addNewCard(columnId: number): void {
    const newCardData = this.newCard[columnId]; // Acesso seguro ao campo

    if (newCardData?.title.trim() && newCardData?.description.trim()) {
      const newCard = {
        title: newCardData.title,
        description: newCardData.description,
        columnId: columnId.toString(),
      };

      this.kanbanService.addCard(newCard).subscribe((createdCard) => {
        const targetColumn = this.columns.find((col) => col.id === columnId);

        if (targetColumn) {
          targetColumn.cards.push(createdCard); // Adiciona o card à coluna
        }

        // Limpa os campos de entrada
        this.newCard[columnId] = { title: '', description: '' }; // Reseta os dados
        this.showAddCard[columnId] = false; // Oculta o formulário
      });
    }
  }

  addNewColumn(): void {
    if (this.newColumnName.trim()) {
      this.kanbanService
        .addColumn({ name: this.newColumnName })
        .subscribe((column) => {
          this.columns.push(column);
          this.newColumnName = '';
        });
    }
  }
}
