import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ITask } from '../../interfaces/task.interfaces';
import { TaskService } from '../../services/tasks/task.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/projects/project.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
})
export class TaskCardComponent {
  editedTitle: string | undefined;
  isEditing = false;

  @Output() delete = new EventEmitter<string>();
  @Input() task!: ITask;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService
  ) {}

  onDelete() {
    this.delete.emit(this.task.id);
  }

  startEditing() {
    if (this.task) {
      this.editedTitle = this.task.title;
      this.isEditing = true;
    } else {
      console.error('Task is undefined');
    }
  }

  saveTitle() {
    if (this.task && this.task.id) {
      if (this.editedTitle !== undefined) {
        const updatedTask: ITask = {
          ...this.task,
          title: this.editedTitle,
          updatedAt: new Date().toISOString(),
          order: this.task.order !== undefined ? this.task.order : 0,
        };

        this.taskService.updateTask(updatedTask).subscribe({
          next: (updatedTask) => {
            this.isEditing = false;
            this.task = { ...updatedTask };

            this.projectService.projects$
              .pipe(take(1))
              .subscribe((projects) => {
                const updatedProjects = projects.map((project) => {
                  const updatedColumns = project.columns?.map((col) => {
                    const updatedTasks = col.tasks?.map((task) => {
                      if (task.id === updatedTask.id) {
                        return updatedTask;
                      }
                      return task;
                    });
                    return { ...col, tasks: updatedTasks };
                  });
                  return { ...project, columns: updatedColumns };
                });

                this.projectService.updateProjects(updatedProjects);
              });
          },
          error: (error) => {
            console.error('Unable to complete update:', error);
          },
        });
      } else {
        console.error('Edited title is undefined');
      }
    } else {
      console.error('Task or Task ID is undefined before update');
    }
  }

  cancelEditing() {
    this.isEditing = false;
  }

  disableDrag(event: Event) {
    event.stopPropagation();
  }
}
