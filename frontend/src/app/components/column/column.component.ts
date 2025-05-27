import { Component, OnInit, OnDestroy } from '@angular/core';
import { ColumnService } from '../../services/column.service';
import { Column } from '../../models/column.model';
import { TaskService } from '../../services/task.service';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Task } from '../../models/task.model';
import { ColumnheaderComponent } from '../columnheader/columnheader.component';
import { TaskComponent } from '../task/task.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [FormsModule, ColumnheaderComponent, TaskComponent, TaskFormComponent, DragDropModule],
  templateUrl: './column.component.html',
  styleUrl: './column.component.css'
})

export class ColumnComponent implements OnInit, OnDestroy {
  constructor(
    private columnService: ColumnService,
    private taskService: TaskService,
  ) { }

  private destroy$ = new Subject<void>();

  isCreatingColumn = false;
  isAddingTask = false;
  editedColumnName = ''
  editedTaskName = ''
  newTaskName = '';
  newColumnName = '';
  columns: Column[] = [];
  addingTaskToColumnId: string | null = null;
  isLoading = false;
  error: string | null = null;
  editingColumnId: string | null = null;
  editingTaskId: string | null = null

  startEditingColumn(column: Column) {
    this.editingColumnId = column.id;
    this.editedColumnName = column.name;
  }

  cancelEditingColumn() {
    this.editingColumnId = null;
    this.editedColumnName = '';
  }

  startEditingTask(task: Task) {
    this.editingTaskId = task.id;
    this.editedTaskName = task.name;
  }

  cancelEditingTask() {
    this.editingTaskId = null;
    this.editedTaskName = '';
  }

  startCreatingColumn() {
    this.isCreatingColumn = true;
  }

  startAddingTask(columnId: string) {
    this.addingTaskToColumnId = columnId;
    this.isAddingTask = true;
  }

  cancelAddingTask() {
    this.addingTaskToColumnId = null;
    this.newTaskName = '';
    this.isAddingTask = false;
  }

  cancelCreatingColumn() {
    this.isCreatingColumn = false;
    this.newColumnName = '';
  }


  async ngOnInit() {
    this.setupColumnsSubscription();
    await this.loadColumnsWithTasks();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupColumnsSubscription() {
    this.columnService.columns$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (columns) => this.columns = columns,
        error: (err) => this.error = 'Falha ao carregar colunas'
      });
  }

  async loadColumnsWithTasks() {
    this.isLoading = true;
    this.error = null;

    try {
      await this.columnService.loadColumnsWithTasks();
    } catch (error) {
      console.error('Error loading columns with tasks:', error);
      this.error = 'Falha ao carregar tarefas';
    } finally {
      this.isLoading = false;
    }
  }

  async addTask(taskName: string, columnId: string) {
    if (!taskName.trim()) return;
  
    try {
      this.isLoading = true;
      await this.taskService.createTask(columnId, {
        name: taskName
      });
      
      await this.columnService.loadColumnsWithTasks();
      this.newTaskName = '';
      this.cancelAddingTask();
    } catch (error) {
      console.error('Error adding task:', error);
      this.error = 'Falha ao adicionar tarefa';
    } finally {
      this.isLoading = false;
    }
  }

  async deleteTask(taskId: string) {
    try {
      this.isLoading = true;
      await this.taskService.deleteTask(taskId);

      await this.columnService.loadColumnsWithTasks();

      this.isLoading = false;

    } catch (error) {
      console.error('Error deleting task:', error);
      throw error
    }
  }

  async deleteColumn(columnId: string) {
    try {
      this.isLoading = true;
      await this.columnService.deleteColumn(columnId);

      await this.columnService.loadColumnsWithTasks();

      this.isLoading = false;

    } catch (error) {
      console.error('Error deleting column:', error);
      throw error
    }
  }

  async saveColumnName(columnId: string, newName: string) {
    if (!newName.trim()) return;
  
    try {
      this.isLoading = true;
      await this.columnService.updateColumnName(columnId, { name: newName });
      await this.columnService.loadColumnsWithTasks();
      this.cancelEditingColumn();
    } catch (error) {
      console.error('Error saving column name:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async saveTaskName(taskId: string, columnId: string, newName: string) {
    if (!this.editedTaskName.trim()) return

    try {
      this.isLoading = true

      await this.taskService.updateTaskName(
        taskId,
        { name: newName, columnId: columnId }
      )

      this.cancelEditingTask()

      await this.columnService.loadColumnsWithTasks()

    } catch (error) {
      console.log('Error saving task name', error)
      throw error
    } finally {
      this.isLoading = false
    }
  }

  getConnectedLists(): string[] {
    return this.columns.map(column => 'column-' + column.id);
  }

  dropColumn(event: CdkDragDrop<Column[]>) {
    moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  }

  async dropTask(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      // Movimento dentro da mesma coluna
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Movimento entre colunas
      const task: Task = event.item.data;
      const previousColumnId = event.previousContainer.id.replace('column-', '');
      const newColumnId = event.container.id.replace('column-', '');

      // Atualização otimista
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      try {
        // Atualiza no backend
        await this.taskService.updateTaskColumn(task.id, newColumnId);
      } catch (error) {
        console.error('Error moving task:', error);
        // Reverte em caso de erro
        transferArrayItem(
          event.container.data,
          event.previousContainer.data,
          event.currentIndex,
          event.previousIndex
        );
      }
    }
  }
}