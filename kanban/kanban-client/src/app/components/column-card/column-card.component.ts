import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { IColumn } from '../../interfaces/column.interfaces';
import { IProject } from '../../interfaces/project.interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColumnService } from '../../services/columns/column.service';
import { TaskService } from '../../services/tasks/task.service';
import { TaskListComponent } from '../task-list/task-list.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProjectService } from '../../services/projects/project.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-column-card',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskListComponent, DragDropModule],
  templateUrl: './column-card.component.html',
  styleUrls: ['./column-card.component.scss'],
})
export class ColumnCardComponent implements OnInit {
  defaultTask = {
    title: 'Title task.',
    description: 'Default Description',
  };

  editedTitle: string | undefined;
  isEditing = false;

  @Input() project: IProject | null = null;
  @Input() column!: IColumn;
  @Input() connectedDropLists: string[] = [];
  @Output() delete = new EventEmitter<string>();

  constructor(
    private columnService: ColumnService,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    if (this.column?.id) {
    }
  }

  onDelete() {
    this.delete.emit(this.column.id);
  }

  startEditing() {
    this.editedTitle = this.column.title;
    this.isEditing = true;
    setTimeout(() => {
      const inputElement = document.querySelector(
        '.edit-input'
      ) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      } else {
        console.error('Edit input not found');
      }
    }, 0);
  }

  saveTitle() {
    if (this.editedTitle !== undefined && this.project?.id) {
      const updatedAt = new Date().toISOString();

      const updatedColumn: IColumn = {
        ...this.column,
        title: this.editedTitle,
        updatedAt,
        order: this.column.order,
        projectId: this.project.id,
      };

      this.columnService.updateColumn(updatedColumn).subscribe({
        next: (updatedColumn) => {
          this.isEditing = false;
          this.column = { ...updatedColumn };

          this.projectService.projects$.pipe(take(1)).subscribe((projects) => {
            const updatedProjects = projects.map((project) => {
              if (project.id === this.project?.id) {
                if (project.columns) {
                  const updatedColumns = project.columns.map((col) =>
                    col.id === updatedColumn.id ? updatedColumn : col
                  );
                  return { ...project, columns: updatedColumns };
                }
              }
              return project;
            });
            this.projectService.updateProjects(updatedProjects);
          });
        },
        error: (error) => {
          console.error('Unable to complete update:', error);
        },
      });
    } else {
      console.error('Edited title or project ID is undefined');
    }
  }

  createTask() {
    const columnId = this.column?.id;
    if (columnId) {
      const { title, description } = this.defaultTask;
      this.taskService
        .createTask(String(columnId), String(title), String(description))
        .subscribe({
          next: (newTask) => {
            if (newTask) {
              this.columnService.updateColumnWithNewTask(columnId, newTask);
              this.projectService.updateProjectAfterTaskCreation(
                columnId,
                newTask
              );
            }
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error creating task:', error);
          },
        });
    } else {
      console.log('ColumnId not found');
    }
  }

  cancelEditing() {
    this.isEditing = false;
  }

  disableDrag(event: Event) {
    event.stopPropagation();
  }
}
