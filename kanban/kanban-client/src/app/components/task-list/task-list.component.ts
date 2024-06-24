import {
  Component,
  Input,
  OnInit,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { ITask } from '../../interfaces/task.interfaces';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { TaskService } from '../../services/tasks/task.service';
import { TaskCardComponent } from '../task-card/task-card.component';
import { CommonModule } from '@angular/common';
import { ColumnService } from '../../services/columns/column.service';
import { IColumn } from '../../interfaces/column.interfaces';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ProjectService } from '../../services/projects/project.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    TaskCardComponent,
    CdkDropList,
    CdkDrag,
    DragDropModule,
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit, OnChanges {
  @Output() delete = new EventEmitter<string>();
  @Input() column!: IColumn;
  @Input() connectedDropLists: string[] = [];
  tasks$: Observable<ITask[]> | undefined;

  constructor(
    private taskService: TaskService,
    private columnService: ColumnService,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['column']) {
      this.loadTasks();
    }
    this.cdr.detectChanges();
  }

  loadTasks() {
    if (this.column && this.column.tasks) {
      this.tasks$ = of(this.column.tasks);
    }
  }

  dropTask(event: CdkDragDrop<ITask[] | null>) {
    const previousContainerId = event.previousContainer.id;
    const currentContainerId = event.container.id;
    if (event.previousContainer.data && event.container.data) {
      if (previousContainerId === currentContainerId) {
        moveItemInArray(
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      } else {
        if (
          Array.isArray(event.previousContainer.data) &&
          Array.isArray(event.container.data) &&
          event.previousContainer.data.length > event.previousIndex &&
          event.container.data.length >= event.currentIndex
        ) {
          try {
            const previousDataCopy = [...event.previousContainer.data];
            const currentDataCopy = [...event.container.data];

            transferArrayItem(
              previousDataCopy,
              currentDataCopy,
              event.previousIndex,
              event.currentIndex
            );

            event.previousContainer.data = previousDataCopy;
            event.container.data = currentDataCopy;

            const movedTask = { ...event.item.data } as ITask;
            movedTask.column = { id: currentContainerId } as IColumn;

            this.projectService.projects$
              .pipe(take(1))
              .subscribe((projects) => {
                const updatedProjects = projects.map((project) => {
                  const updatedColumns = project.columns?.map((column) => {
                    const mutableColumn = { ...column };

                    if (mutableColumn.id === previousContainerId) {
                      mutableColumn.tasks = mutableColumn.tasks?.filter(
                        (task) => task.id !== movedTask.id
                      );
                    }
                    if (mutableColumn.id === currentContainerId) {
                      mutableColumn.tasks = [
                        ...(mutableColumn.tasks || []),
                        movedTask,
                      ];
                    }
                    return mutableColumn;
                  });
                  return { ...project, columns: updatedColumns };
                });

                this.projectService.updateProjects(updatedProjects);

                const allUpdatedColumns: IColumn[] = [];
                updatedProjects.forEach((project) => {
                  project.columns?.forEach((column) => {
                    if (column) {
                      allUpdatedColumns.push(column);
                    }
                  });
                });

                this.columnService.updateColumns(allUpdatedColumns).subscribe({
                  next: (updatedColumns) => {},
                  error: (err) => {
                    console.error('Falha ao atualizar colunas:', err);
                  },
                });
              });
          } catch (error) {
            console.error('Erro durante a transferência de arrays:', error);
          }
        } else {
          console.error(
            'Índices inválidos ou arrays não são válidos para transferência'
          );
        }
      }
    } else {
      console.error('Dados do container são nulos');
    }
  }

  onDeleteTask(taskId: string) {
    this.taskService.deleteTask(taskId).subscribe({
      next: (success) => {
        if (success) {
          this.projectService.projects$.pipe(take(1)).subscribe((projects) => {
            const updatedProjects = projects.map((project) => {
              const updatedColumns =
                project.columns?.map((col) => {
                  if (col.id === this.column.id) {
                    const updatedTasks = col.tasks?.filter(
                      (task) => task.id !== taskId
                    );
                    return { ...col, tasks: updatedTasks };
                  }
                  return col;
                }) ?? [];
              return { ...project, columns: updatedColumns };
            });

            this.projectService.updateProjects(updatedProjects);

            const projectWithColumn = updatedProjects.find((project) =>
              project.columns?.some((col) => col.id === this.column.id)
            );
            if (projectWithColumn) {
              const updatedColumn = projectWithColumn.columns?.find(
                (col) => col.id === this.column.id
              );
              if (updatedColumn) {
                this.column = updatedColumn;
                this.tasks$ = of(this.column.tasks);
                this.cdr.detectChanges();
              }
            }

            this.delete.emit(taskId);
          });
        } else {
          console.error('Failed to delete task');
        }
      },
      error: (error) => {
        console.error('Error deleting task:', error);
      },
    });
  }
}
