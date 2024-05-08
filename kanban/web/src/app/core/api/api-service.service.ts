import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Column {
  id: string;
  title: string;
  createdAt: string;
  boardId: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  columnId: string;
}

export interface Board {
  id: string;
  title: string;
  createdAt: string;
  columns: Column[];
}

@Injectable({
  providedIn: 'root',
})
export class ApiServiceService {
  private apiUrl = 'https://kanban-valinor.up.railway.app';

  constructor(private http: HttpClient) {}

  getBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(this.apiUrl + '/board');
  }

  getColumns(): Observable<Column[]> {
    return this.http.get<Column[]>(this.apiUrl + '/column');
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl + '/task');
  }

  getTasksByColumnId(columnId: string): Observable<Column> {
    return this.http.get<Column>(this.apiUrl + '/column/' + columnId);
  }
  getColumnsByBoardId(boardId: string): Observable<Board> {
    return this.http.get<Board>(this.apiUrl + '/board/' + boardId);
  }

  getBoardById(boardId: string): Observable<Board> {
    return this.http.get<Board>(this.apiUrl + '/board/' + boardId);
  }

  addBoard(boardData: { title: string }): Observable<Board> {
    return this.http.post<Board>(this.apiUrl + '/board', boardData);
  }
  addColumn(columnData: {
    title: string;
    boardId: string;
  }): Observable<Column> {
    return this.http.post<Column>(this.apiUrl + '/column', columnData);
  }

  addTask(taskData: {
    title: string;
    description: string;
    columnId: string;
  }): Observable<Task> {
    return this.http.post<Task>(this.apiUrl + '/task', taskData);
  }

  updateTask(taskData: {
    id: string;
    title?: string;
    description?: string;
    columnId?: string;
  }): Observable<Task> {
    return this.http.patch<Task>(
      this.apiUrl + '/task/' + taskData.id,
      taskData
    );
  }

  updateColumn(columnData: { id: string; title?: string }): Observable<Column> {
    return this.http.patch<Column>(
      this.apiUrl + '/column/' + columnData.id,
      columnData
    );
  }

  updateBoard(boardData: { id: string; title?: string }): Observable<Board> {
    return this.http.patch<Board>(
      this.apiUrl + '/board/' + boardData.id,
      boardData
    );
  }

  deleteBoard(boardId: string): Observable<Board> {
    return this.http.delete<Board>(this.apiUrl + '/board/' + boardId);
  }
  deleteColumn(columnId: string): Observable<Column> {
    return this.http.delete<Column>(this.apiUrl + '/column/' + columnId);
  }
  deleteTask(taskId: string): Observable<Task> {
    return this.http.delete<Task>(this.apiUrl + '/task/' + taskId);
  }
}
