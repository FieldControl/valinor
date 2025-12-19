import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Column } from '../board/board-service';

interface CreateColumnResponse {
  data: {
    createColumn: Column;
  };
}

interface UpdateColumnResponse {
  data: {
    updateColumn: Column;
  };
}

interface DeleteColumnResponse {
  data: {
    removeColumn: Column;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ColumnService {
  constructor(
    private http: HttpClient
  ) {}

  private readonly apiUrl = 'http://localhost:3000/graphql';

  createColumn(name: string, boardId: number): Observable<CreateColumnResponse> {
    return this.http.post<CreateColumnResponse>(this.apiUrl, {
      query: `
        mutation CreateColumn($createColumnInput: CreateColumnInput!) {
          createColumn(createColumnInput: $createColumnInput) {
            id
            name
            boardId
          }
        }
      `,
      variables: {
        createColumnInput: {
          name,
          boardId
        }
      }
    });
  }

  updateColumn(id: number, name: string): Observable<UpdateColumnResponse> {
    return this.http.post<UpdateColumnResponse>(this.apiUrl, {
      query: `
        mutation UpdateColumn($updateColumnInput: UpdateColumnInput!) {
          updateColumn(updateColumnInput: $updateColumnInput) {
            id
            name
            boardId
            position
          }
        }
      `,
      variables: {
        updateColumnInput: {
          id,
          name
        }
      }
    });
  }

  deleteColumn(columnId: number): Observable<DeleteColumnResponse> {
    return this.http.post<DeleteColumnResponse>(this.apiUrl, {
      query: `
        mutation RemoveColumn($id: Int!) {
          removeColumn(id: $id) {
            id
            name
            boardId
            position
          }
        }
      `,
      variables: {
        id: columnId
      }
    });
  }
}
