import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { ITask } from '../../interfaces/task.interfaces';
import { Apollo, gql } from 'apollo-angular';
import { CookieService } from 'ngx-cookie-service';
import { StorageService } from '../localStorage.service';
import { ProjectService } from '../projects/project.service';
import { ColumnService } from '../columns/column.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  columnId = '';
  tasksSubject = new BehaviorSubject<ITask[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor(
    private apollo: Apollo,
    private projectService: ProjectService,
    private columnService: ColumnService,
    private cookieService: CookieService
  ) {}

  getTasksByColumnId(columnId: string): Observable<ITask[]> {
    return this.apollo
      .query<{ column: { tasks: ITask[] } }>({
        query: gql`
          query GetTasksByColumnId($columnId: String!) {
            column(id: $columnId) {
              tasks {
                id
                title
                description
                order
              }
            }
          }
        `,
        variables: { columnId },
      })
      .pipe(map((result) => result.data.column.tasks));
  }

  getAllTasks(): Observable<ITask[]> {
    return this.apollo
      .query<{ tasks: ITask[] }>({
        query: gql`
          query GetAllTasks {
            tasks {
              id
              title
              description
              order
              column {
                id
              }
            }
          }
        `,
      })
      .pipe(
        map((result) => result.data.tasks),
        take(1)
      );
  }

  loadTasks() {
    this.getAllTasks().subscribe((tasks) => {
      const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
      this.tasksSubject.next(sortedTasks);
    });
  }

  loadTasksByColumnId(columnId: string) {
    this.getAllTasks().subscribe((tasks) => {
      const filteredTasks = tasks.filter((task) => task.column.id === columnId);
      this.tasksSubject.next(filteredTasks);
    });
  }

  createTask(columnId: string, title: string, description: string) {
    const token = this.cookieService.get('@access_token');

    if (!token) {
      throw new Error('Token not found');
    }

    const currentTasks = this.tasksSubject.getValue();

    const lastOrder =
      currentTasks.length > 0 ? currentTasks[currentTasks.length - 1].order : 0;

    const order = lastOrder + 1;

    return this.apollo
      .mutate<{ createTask: ITask }>({
        mutation: gql`
          mutation CreateTask(
            $title: String!
            $description: String!
            $columnId: String!
            $order: Int!
          ) {
            createTask(
              createTaskInput: {
                title: $title
                description: $description
                columnId: $columnId
                order: $order
              }
            ) {
              id
              title
              description
              order
              column {
                id
              }
            }
          }
        `,
        variables: {
          columnId,
          title,
          description,
          order,
        },
        context: {
          headers: {
            Authorization: `${token}`,
          },
        },
      })
      .pipe(
        map((result) => {
          const newTask = result.data?.createTask;
          return newTask;
        })
      );
  }

  updateTask(task: ITask) {
    const { id, title, description, column, order } = task;
    const token = this.cookieService.get('@access_token');

    if (!token) {
      throw new Error('Token not found');
    }
    return this.apollo
      .mutate<any>({
        mutation: gql`
          mutation UpdateTask(
            $id: String!
            $title: String!
            $description: String!
            $columnId: String!
            $order: Int!
          ) {
            updateTask(
              updateTaskInput: {
                id: $id
                title: $title
                description: $description
                columnId: $columnId
                order: $order
              }
            ) {
              id
              title
              description
              order
              column {
                id
                title
              }
            }
          }
        `,
        variables: {
          id,
          title,
          description,
          columnId: column.id,
          order,
        },
        context: {
          headers: {
            Authorization: `${token}`,
          },
        },
      })
      .pipe(
        map((result) => {
          const updatedTask = result.data?.updateTask;
          if (updatedTask) {
            this.tasksSubject.pipe(take(1)).subscribe((currentTasks) => {
              const index = currentTasks.findIndex(
                (p) => p.id === updatedTask.id
              );
              if (index !== -1) {
                const updatedTasks = [...currentTasks];
                updatedTasks[index] = updatedTask;
                this.tasksSubject.next(
                  updatedTasks.sort((a, b) => a.order - b.order)
                );
              }
            });
          }
          return updatedTask;
        })
      );
  }

  deleteTask(taskId: string) {
    const token = this.cookieService.get('@access_token');

    if (!token) {
      throw new Error('Token not found');
    }

    return this.apollo
      .mutate<any>({
        mutation: gql`
          mutation DeleteTask($id: String!) {
            removeTask(id: $id) {
              title
            }
          }
        `,
        variables: { id: taskId },
        context: {
          headers: {
            Authorization: `${token}`,
          },
        },
      })
      .pipe(
        map((result) => result.data?.removeTask || false),
        tap((success) => {
          if (success) {
            const currentTasks = this.tasksSubject.getValue();
            const updatedTasks = currentTasks.filter(
              (task) => task.id !== taskId
            );
            this.tasksSubject.next(updatedTasks);

            const columnId = this.columnId;
            this.columnService.updateColumnAfterTaskDeletion(columnId, taskId);
            this.projectService.updateProjectAfterTaskDeletion(
              columnId,
              taskId
            );
          }
        })
      );
  }
}
