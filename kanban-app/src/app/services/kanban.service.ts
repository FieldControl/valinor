import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Board,
  Column,
  Card,
  CreateBoardInput,
  CreateColumnInput,
  CreateCardInput,
  UpdateBoardInput,
  UpdateColumnInput,
  UpdateCardInput,
  MoveCardInput,
  ReorderCardInput,
} from '../models/board.model';
import {
  GET_BOARDS,
  GET_BOARD,
  GET_COLUMNS,
  GET_CARDS,
  CREATE_BOARD,
  UPDATE_BOARD,
  DELETE_BOARD,
  CREATE_COLUMN,
  UPDATE_COLUMN,
  DELETE_COLUMN,
  CREATE_CARD,
  UPDATE_CARD,
  DELETE_CARD,
  MOVE_CARD,
  REORDER_CARD,
} from '../graphql/queries';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  constructor(private apollo: Apollo) {}

  
  getBoards(): Observable<Board[]> {
    return this.apollo
      .watchQuery<{ boards: Board[] }>({
        query: GET_BOARDS,
      })
      .valueChanges.pipe(
        map((result) => {
          try {
            const boards = result.data?.boards || [];
           
            return boards.map((board) => ({
              ...board,
              columns: [...(board.columns || [])], 
            }));
          } catch (error) {
            console.error('Erro ao processar dados dos boards:', error);
            return [];
          }
        })
      );
  }

  getBoard(id: number): Observable<Board> {
    return this.apollo
      .watchQuery<{ board: Board }>({
        query: GET_BOARD,
        variables: { id },
      })
      .valueChanges.pipe(
        map((result) => {
          try {
            const board = result.data?.board;
            if (!board) {
              throw new Error(`Board with id ${id} not found`);
            }

            
            return {
              ...board,
              columns: (board.columns || []).map((column) => ({
                ...column,
                cards: [...(column.cards || [])], 
              })),
            };
          } catch (error) {
            console.error('Erro ao processar dados do board:', error);
            throw error;
          }
        })
      );
  }

  createBoard(input: CreateBoardInput): Observable<Board> {
    return this.apollo
      .mutate<{ createBoard: Board }>({
        mutation: CREATE_BOARD,
        variables: input,
        refetchQueries: [{ query: GET_BOARDS }],
      })
      .pipe(map((result) => result.data!.createBoard));
  }

  updateBoard(input: UpdateBoardInput): Observable<Board> {
    return this.apollo
      .mutate<{ updateBoard: Board }>({
        mutation: UPDATE_BOARD,
        variables: input,
        refetchQueries: [{ query: GET_BOARDS }],
      })
      .pipe(map((result) => result.data!.updateBoard));
  }

  deleteBoard(id: number): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteBoard: boolean }>({
        mutation: DELETE_BOARD,
        variables: { id },
        refetchQueries: [{ query: GET_BOARDS }],
      })
      .pipe(map((result) => result.data!.deleteBoard));
  }


  getColumns(): Observable<Column[]> {
    return this.apollo
      .watchQuery<{ columns: Column[] }>({
        query: GET_COLUMNS,
      })
      .valueChanges.pipe(map((result) => result.data.columns));
  }

  createColumn(input: CreateColumnInput): Observable<Column> {
    return this.apollo
      .mutate<{ createColumn: Column }>({
        mutation: CREATE_COLUMN,
        variables: input,
        refetchQueries: [
          { query: GET_BOARD, variables: { id: input.boardId } },
        ],
      })
      .pipe(map((result) => result.data!.createColumn));
  }

  updateColumn(input: UpdateColumnInput): Observable<Column> {
    return this.apollo
      .mutate<{ updateColumn: Column }>({
        mutation: UPDATE_COLUMN,
        variables: input,
      })
      .pipe(map((result) => result.data!.updateColumn));
  }

  deleteColumn(id: number): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteColumn: boolean }>({
        mutation: DELETE_COLUMN,
        variables: { id },
      })
      .pipe(map((result) => result.data!.deleteColumn));
  }

  
  getCards(): Observable<Card[]> {
    return this.apollo
      .watchQuery<{ cards: Card[] }>({
        query: GET_CARDS,
      })
      .valueChanges.pipe(map((result) => result.data.cards));
  }

  createCard(input: CreateCardInput): Observable<Card> {
    return this.apollo
      .mutate<{ createCard: Card }>({
        mutation: CREATE_CARD,
        variables: input,
      })
      .pipe(map((result) => result.data!.createCard));
  }

  updateCard(input: UpdateCardInput): Observable<Card> {
    return this.apollo
      .mutate<{ updateCard: Card }>({
        mutation: UPDATE_CARD,
        variables: input,
      })
      .pipe(map((result) => result.data!.updateCard));
  }

  deleteCard(id: number): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteCard: boolean }>({
        mutation: DELETE_CARD,
        variables: { id },
      })
      .pipe(map((result) => result.data!.deleteCard));
  }

  moveCard(input: MoveCardInput): Observable<Card> {
    return this.apollo
      .mutate<{ moveCard: Card }>({
        mutation: MOVE_CARD,
        variables: input,
      })
      .pipe(map((result) => result.data!.moveCard));
  }

  reorderCard(input: ReorderCardInput): Observable<Card> {
    return this.apollo
      .mutate<{ reorderCard: Card }>({
        mutation: REORDER_CARD,
        variables: input,
      })
      .pipe(map((result) => result.data!.reorderCard));
  }
}
