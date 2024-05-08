import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ApiServiceService,
  Column,
} from 'src/app/core/api/api-service.service';
import { BoardService } from '../../board.service';
import { firstValueFrom } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  styleUrls: ['./edit-modal.component.scss'],
})
export class EditModalComponent implements OnInit {
  boardName: string = '';
  columns: Column[] = [];
  boardId: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { boardId: string },
    private apiService: ApiServiceService,
    private boardService: BoardService,
    private dialogRef: MatDialogRef<EditModalComponent>,
    private location: Location
  ) {
    this.boardId = data.boardId;
  }

  ngOnInit(): void {
    this.apiService.getBoardById(this.boardId).subscribe((board) => {
      this.boardName = board.title;
      this.columns = board.columns;
    });
  }

  async updateBoard() {
    try {
      const updatedBoard = await firstValueFrom(
        this.apiService.updateBoard({ id: this.boardId, title: this.boardName })
      );
      this.boardService.search$.next();
      this.dialogRef.close(updatedBoard);
    } catch (error) {
      console.error('Erro ao atualizar o quadro:', error);
    }
  }

  async updateColumn(column: Column) {
    try {
      const updatedColumn = await firstValueFrom(
        this.apiService.updateColumn({ id: column.id, title: column.title })
      );
      const columnIndex = this.columns.findIndex((c) => c.id === column.id);
      this.columns[columnIndex] = updatedColumn;
    } catch (error) {
      console.error('Erro ao atualizar a coluna:', error);
    }
  }

  deleteColumn(columnId: string) {
    this.apiService.deleteColumn(columnId).subscribe(() => {
      this.boardService.search$.next();

      this.dialogRef.close();
    });
  }

  deleteBoard() {
    this.apiService.deleteBoard(this.boardId).subscribe(() => {
      this.boardService.search$.next();

      this.dialogRef.close();
    });
    this.location.back();
  }
}
