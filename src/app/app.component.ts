import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskDialogComponent } from './task-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';

interface Task {
  id: number;
  title: string;
  description: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatToolbarModule,
    DragDropModule,
    TaskDialogComponent,
    LoginComponent
  ],
  template: `
    <ng-container *ngIf="authService.currentUser$ | async as user; else loginTemplate">
      <mat-toolbar color="primary" class="toolbar">
        <span class="welcome-text">Kanban Board - Bem-vindo, {{ user.name }}!</span>
        <span class="spacer"></span>
        <button mat-button class="logout-button" (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span class="logout-text">Sair</span>
        </button>
      </mat-toolbar>

      <div class="kanban-container">
        <button mat-raised-button color="primary" (click)="openTaskDialog()">
          Nova Tarefa
        </button>
        
        <div class="board">
          <div class="column" *ngFor="let column of columns">
            <div class="column-header">
              {{ column.title }}
            </div>
            <div
              class="task-list"
              [id]="column.id"
              cdkDropList
              [cdkDropListData]="column.tasks"
              [cdkDropListConnectedTo]="getConnectedList()"
              (cdkDropListDropped)="drop($event)">
              <div
                class="task-card"
                *ngFor="let task of column.tasks"
                cdkDrag
                (click)="openTaskDialog(task)">
                <h3>{{ task.title }}</h3>
                <p>{{ task.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <ng-template #loginTemplate>
      <app-login></app-login>
    </ng-template>
  `,
  styles: [`
    .toolbar {
      display: flex;
      align-items: center;
    }
    .welcome-text {
      flex: 1;
    }
    .spacer {
      flex: 1;
    }
    .logout-button {
      display: flex;
      align-items: center;
    }
    .logout-text {
      margin-left: 5px;
    }
    
    /* Responsividade */
    @media (max-width: 600px) {
      .welcome-text {
        display: none;
      }
      .logout-text {
        display: none;
      }
    }
  `]
})
export class AppComponent {
  columns: Column[] = [
    {
      id: 'todo',
      title: 'A Fazer',
      tasks: []
    },
    {
      id: 'inProgress',
      title: 'Em Progresso',
      tasks: []
    },
    {
      id: 'done',
      title: 'Concluído',
      tasks: []
    }
  ];

  constructor(
    private dialog: MatDialog,
    public authService: AuthService
  ) {
    this.loadTasks();
  }

  private loadTasks() {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userId = JSON.parse(user).id;
      const savedData = localStorage.getItem(`kanbanData_${userId}`);
      if (savedData) {
        this.columns = JSON.parse(savedData);
      }
    }
  }

  getConnectedList(): string[] {
    return this.columns.map(column => column.id);
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.saveToLocalStorage();
  }

  openTaskDialog(task?: Task) {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '400px',
      data: task || { id: Date.now(), title: '', description: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.delete) {
          this.deleteTask(result.id);
        } else if (!task) {
          this.columns[0].tasks.push(result);
        } else {
          const columnIndex = this.columns.findIndex(col => 
            col.tasks.some(t => t.id === result.id)
          );
          if (columnIndex !== -1) {
            const taskIndex = this.columns[columnIndex].tasks.findIndex(t => 
              t.id === result.id
            );
            this.columns[columnIndex].tasks[taskIndex] = result;
          }
        }
        this.saveToLocalStorage();
      }
    });
  }

  deleteTask(taskId: number) {
    this.columns.forEach(column => {
      column.tasks = column.tasks.filter(task => task.id !== taskId);
    });
    this.saveToLocalStorage();
  }

  private saveToLocalStorage() {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userId = JSON.parse(user).id;
      localStorage.setItem(`kanbanData_${userId}`, JSON.stringify(this.columns));
    }
  }

  logout() {
    this.authService.logout();
    this.columns.forEach(column => column.tasks = []);
  }
}