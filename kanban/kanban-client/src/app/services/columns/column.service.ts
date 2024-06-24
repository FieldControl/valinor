import { BehaviorSubject, Observable, filter, map, of, take, tap } from 'rxjs';
import { IColumn } from '../../interfaces/column.interfaces';
import { Apollo, gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { StorageService } from '../localStorage.service';
import { ITask } from '../../interfaces/task.interfaces';
import { ProjectService } from '../projects/project.service';

@Injectable({
  providedIn: 'root',
})
export class ColumnService {
  columnsSubject = new BehaviorSubject<IColumn[]>([]);
  columns$ = this.columnsSubject.asObservable();

  constructor(
    private apollo: Apollo,
    private cookieService: CookieService,
    private projectService: ProjectService
  ) {}

  createColumn(
    projectId: string,
    title: string,
    description: string
  ): Observable<IColumn> {
    const token = this.cookieService.get('@access_token');
    if (!token) {
      throw new Error('Token not found');
    }

    const currentColumns = this.columnsSubject.getValue();
    const lastOrder =
      currentColumns.length > 0
        ? currentColumns[currentColumns.length - 1].order
        : null;
    const order =
      typeof lastOrder === 'number' && !isNaN(lastOrder) ? lastOrder + 1 : 0;

    if (order === null || order === undefined) {
      throw new Error('Order not found');
    }

    return this.apollo
      .mutate<{ createColumn: IColumn }>({
        mutation: gql`
          mutation CreateColumn(
            $title: String!
            $description: String!
            $projectId: String!
            $order: Int!
          ) {
            createColumn(
              createColumnInput: {
                title: $title
                description: $description
                projectId: $projectId
                order: $order
              }
            ) {
              id
              title
              description
              order
              tasks {
                id
                title
              }
            }
          }
        `,
        variables: {
          projectId,
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
        map((result) => result.data?.createColumn),
        filter((newColumn): newColumn is IColumn => newColumn !== undefined),
        tap((newColumn) => {
          const currentColumns = this.columnsSubject.value;
          this.columnsSubject.next([...currentColumns, newColumn]);
        })
      );
  }

  getColumns(projectId: string) {
    return this.apollo
      .query<{ project: { columns: IColumn[] } }>({
        query: gql`
          query GetColumns($projectId: String!) {
            project(id: $projectId) {
              id
              title
              columns {
                id
                title
                description
                order
                tasks {
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
            }
          }
        `,
        variables: { projectId },
      })
      .pipe(map((result) => result.data.project.columns));
  }

  loadColumns(projectId: string): void {
    this.getColumns(projectId).subscribe({
      next: (columns) => {
        this.columnsSubject.next(columns);
      },
      error: (error) =>
        console.error('Error in getColumns subscription:', error),
    });
  }

  updateColumn(column: IColumn) {
    const { id, title, description, projectId, tasks, order } = column;
    const token = this.cookieService.get('@access_token');

    if (!token) {
      throw new Error('Token not found');
    }

    const taskIds = tasks ? tasks.map((task) => task.id) : [];

    return this.apollo
      .mutate<any>({
        mutation: gql`
          mutation UpdateColumn(
            $id: String!
            $title: String!
            $description: String!
            $projectId: String!
            $taskIds: [String!]!
            $order: Int!
          ) {
            updateColumn(
              updateColumnInput: {
                id: $id
                title: $title
                description: $description
                projectId: $projectId
                taskIds: $taskIds
                order: $order
              }
            ) {
              id
              title
              description
              order
              tasks {
                id
                title
              }
            }
          }
        `,
        variables: {
          id,
          title,
          description: description,
          projectId,
          taskIds: taskIds ? taskIds : [],
          order,
        },
        context: {
          headers: {
            Authorization: `${token}`,
          },
        },
      })
      .pipe(
        map((result) => result.data?.updateColumn || null),
        tap((updatedColumn) => {
          if (updatedColumn) {
            this.columnsSubject.pipe(take(1)).subscribe((currentColumns) => {
              const index = currentColumns.findIndex(
                (col) => col.id === updatedColumn.id
              );
              if (index !== -1) {
                const updatedColumns = [...currentColumns];
                updatedColumns[index] = updatedColumn;
                this.columnsSubject.next(
                  updatedColumns.sort((a, b) => a.order - b.order)
                );
                this.projectService.updateColumnsInProject(
                  updatedColumn.projectId,
                  updatedColumns
                );
              }
            });
          }
        })
      );
  }

  updateColumns(columns: IColumn[]) {
    const token = this.cookieService.get('@access_token');

    if (!token) {
      throw new Error('Token not found');
    }

    return this.apollo
      .mutate<any>({
        mutation: gql`
          mutation UpdateColumns($columns: [UpdateColumnInput!]!) {
            updateColumns(updateColumnsInput: { columns: $columns }) {
              id
              title
              description
              order
              tasks {
                id
                title
                column {
                  id
                  title
                }
              }
            }
          }
        `,
        variables: {
          columns: columns.map(
            ({ id, title, description, projectId, tasks, order }) => ({
              id,
              title,
              description,
              projectId,
              taskIds: tasks ? tasks.map((task) => task.id) : [],
              order,
            })
          ),
        },
        context: {
          headers: {
            Authorization: `${token}`,
          },
        },
      })
      .pipe(
        map((result) => {
          const updatedColumns: IColumn[] = result.data?.updateColumns;
          if (updatedColumns) {
            this.columnsSubject.pipe(take(1)).subscribe((currentColumns) => {
              const updatedColumnsMap = new Map(
                updatedColumns.map((col: IColumn) => [col.id, col])
              );
              const newColumns = currentColumns.map((col: IColumn) =>
                updatedColumnsMap.has(col.id)
                  ? updatedColumnsMap.get(col.id)!
                  : col
              );
              this.columnsSubject.next(
                newColumns.sort((a, b) => a.order - b.order)
              );
            });
          }
          return updatedColumns;
        })
      );
  }

  deleteColumn(columnId: string, projectId: string): Observable<boolean> {
    const token = this.cookieService.get('@access_token');

    if (!token) {
      throw new Error('Token not found');
    }

    return this.apollo
      .mutate<any>({
        mutation: gql`
          mutation DeleteColumn($id: String!) {
            removeColumn(id: $id) {
              title
            }
          }
        `,
        variables: { id: columnId },
        context: {
          headers: {
            Authorization: `${token}`,
          },
        },
      })
      .pipe(
        map((result) => result.data?.removeColumn || false),
        tap((success) => {
          if (success) {
            this.columnsSubject.pipe(take(1)).subscribe((currentColumns) => {
              const updatedColumns = currentColumns.filter(
                (column) => column.id !== columnId
              );
              this.columnsSubject.next(updatedColumns);
            });
          }
        })
      );
  }

  updateColumnAfterTaskDeletion(columnId: string, taskId: string) {
    this.columnsSubject.pipe(take(1)).subscribe((columns) => {
      const updatedColumns = columns.map((column) => {
        if (column.id === columnId) {
          const updatedTasks = column.tasks.filter(
            (task) => task.id !== taskId
          );
          return { ...column, tasks: updatedTasks };
        }
        return column;
      });
      this.columnsSubject.next(updatedColumns);
    });
  }

  updateColumnWithNewTask(columnId: string, newTask: ITask) {
    this.columnsSubject.pipe(take(1)).subscribe((columns) => {
      const updatedColumns = columns.map((column) => {
        if (column.id === columnId) {
          const taskExists = column.tasks.some(
            (task) => task.id === newTask.id
          );
          if (!taskExists) {
            const updatedTasks = [...(column.tasks ?? []), newTask];
            return { ...column, tasks: updatedTasks };
          }
        }
        return column;
      });
      this.columnsSubject.next(updatedColumns);
    });
  }
}
