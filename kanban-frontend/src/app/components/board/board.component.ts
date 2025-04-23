// src/app/components/board/board.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Board } from '../../models/board.model';
import { Column } from '../../models/column.model';
import { Task } from '../../models/task.model';
import { ColumnComponent } from '../column/column.component';
import { KanbanService } from '../../services/kanban.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, ColumnComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  board: Board = {
    id: '',
    title: '',
    columns: []
  };
  isLoading = true;
  errorMessage = '';

  constructor(private kanbanService: KanbanService) { }

  ngOnInit(): void {
    this.loadBoard('1'); // Supondo que você queira carregar o board com ID '1'
  }

  loadBoard(boardId: string): void {
    this.isLoading = true;
    this.kanbanService.getBoardById(boardId).subscribe({
      next: (board) => {
        this.board = board;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar o board:', error);
        this.errorMessage = 'Não foi possível carregar o quadro. Por favor, tente novamente mais tarde.';
        this.isLoading = false;
      }
    });
  }

  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      // Movendo dentro da mesma coluna
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
      // Aqui você pode chamar o serviço para atualizar a ordem no backend
      // Por exemplo, usando um endpoint específico para reordenar tarefas
    } else {
      // Movendo para outra coluna
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Obter IDs relevantes
      const taskId = event.item.data.id;
      const sourceColumnId = event.previousContainer.id;
      const destinationColumnId = event.container.id;

      // Chamada ao backend para mover a tarefa
      this.kanbanService.moveTask(
        this.board.id,
        sourceColumnId,
        destinationColumnId,
        taskId,
        event.currentIndex
      ).subscribe({
        error: (error) => {
          console.error('Erro ao mover tarefa:', error);
          // Pode adicionar lógica para reverter a movimentação visual em caso de erro
        }
      });
    }
  }

  getConnectedColumnIds(): string[] {
    return this.board.columns.map(column => column.id);
  }

  // Métodos adicionais para gerenciar o board
  createColumn(title: string): void {
    const newColumn: Partial<Column> = {
      title,
      tasks: []
    };

    this.kanbanService.createColumn(this.board.id, newColumn).subscribe({
      next: (column) => {
        this.board.columns.push(column);
      },
      error: (error) => console.error('Erro ao criar coluna:', error)
    });
  }
}