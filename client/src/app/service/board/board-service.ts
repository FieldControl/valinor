import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Board {
  id: number;
  name: string;
  createdAt: string;
}

export interface Column {
  id: number;
  name: string;
  boardId: number;
  cards?: Card[];
}

export interface Card {
  id: number;
  name: string;
  description?: string;
  columnId: number;
  assignedUserId?: number;
  assignedUserName?: string;
}

export interface BoardUser {
  id: number;
  name: string;
  email: string;
}

interface MyBoardsResponse {
  data: {
    myBoards: Board[];
  };
}

interface CreateBoardResponse {
  data: {
    createBoard: Board;
  };
}

interface BoardWithColumnsResponse {
  data: {
    getBoard: Board & {
      columns: Column[];
    };
  };
}

interface BoardUsersResponse {
  data: {
    getBoardUsers: BoardUser[];
  };
}

interface AddUserToBoardResponse {
  data: {
    addUserToBoard: BoardUser;
  };
}


@Injectable({
  providedIn: 'root',
})
export class BoardService {
  constructor(
    private http: HttpClient
  ) {}

  private readonly apiUrl = 'http://localhost:3000/graphql';

  findAllUserBoards(): Observable<MyBoardsResponse> {
    return this.http.post<MyBoardsResponse>(this.apiUrl, {
      query: `
        query { myBoards { id name createdAt } }
      ` 
    });
  }

  createBoard(name: string): Observable<CreateBoardResponse> {
    return this.http.post<CreateBoardResponse>(this.apiUrl, {
      query: `
        mutation CreateBoard($createBoardInput: CreateBoardInput!) {
          createBoard(createBoardInput: $createBoardInput) {
            id
            name
            createdAt
          }
        }
      `,
      variables: {
        createBoardInput: {
          name
        }
      }
    });
  }

  getBoardWithColumns(boardId: number): Observable<BoardWithColumnsResponse> {
    return this.http.post<BoardWithColumnsResponse>(this.apiUrl, {
      query: `
        query GetBoard($boardId: Int!) {
          getBoard(boardId: $boardId) {
            id
            name
            createdAt
            columns {
              id
              name
              boardId
              position
              cards {
                id
                name
                description
                columnId
                assignedUserId
                assignedUserName
                createdAt
              }
            }
          }
        }
      `,
      variables: {
        boardId
      }
    });
  }

  getBoardUsers(boardId: number): Observable<BoardUsersResponse> {
    return this.http.post<BoardUsersResponse>(this.apiUrl, {
      query: `
        query GetBoardUsers($boardId: Int!) {
          getBoardUsers(boardId: $boardId) {
            id
            name
            email
          }
        }
      `,
      variables: {
        boardId
      }
    });
  }

  addUserToBoard(boardId: number, email: string): Observable<AddUserToBoardResponse> {
    return this.http.post<AddUserToBoardResponse>(this.apiUrl, {
      query: `
        mutation AddUserToBoard($addUserToBoardInput: AddUserToBoardInput!) {
          addUserToBoard(addUserToBoardInput: $addUserToBoardInput) {
            id
            name
            email
          }
        }
      `,
      variables: {
        addUserToBoardInput: {
          boardId,
          email
        }
      }
    });
  }
}
