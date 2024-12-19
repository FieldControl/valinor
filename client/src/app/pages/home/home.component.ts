import { Component, OnInit } from '@angular/core';
import { ColumnComponent } from '../../components/column/column.component';
import { CommonModule } from '@angular/common';
import { AddColumnModalComponent } from '../../components/add-column-modal/add-column-modal.component';
import { ColumnService } from '../../services/column.service';
import { ColumnType } from '../../models/column-type.model';
import { AddTaskModalComponent } from '../../components/add-task-modal/add-task-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ColumnComponent,
    AddColumnModalComponent,
    AddTaskModalComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  isAddTaskModalOpen: boolean = false;
  isAddColumnModalOpen: boolean = false;

  columns: ColumnType[] = [];

  // colunas disponíveis para a criação de uma tarefa 
  taskColumns: { id: string; name: string }[] = []; 

  constructor(private columnService: ColumnService) {}

  openAddTaskModal() {
    this.isAddTaskModalOpen = true;
  }

  closeAddTaskModal() {
    this.isAddTaskModalOpen = false;
  }

  openAddColumnModal() {
    this.isAddColumnModalOpen = true;
  }

  closeAddColumnModal() {
    this.isAddColumnModalOpen = false;
  }

  ngOnInit() {
    // Chama o método para buscar todas as colunas quando o componente for carregado
    this.columnService.getAllColumns().subscribe({
      next: (data: ColumnType[]) => {
        this.columns = data;
        this.taskColumns = data.map(column => ({
          id: column.id,
          name: column.name
        }))
      },
      error: (error) => {
        console.error('Erro ao carregar as colunas:', error);
      },
    });
  }
}
