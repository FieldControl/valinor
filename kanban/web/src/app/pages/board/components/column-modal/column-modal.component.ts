import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiServiceService } from 'src/app/core/api/api-service.service';
import { BoardService } from '../../board.service';

@Component({
  selector: 'app-column-modal',
  templateUrl: './column-modal.component.html',
  styleUrls: ['./column-modal.component.scss'],
})
export class ColumnModalComponent implements OnInit {
  columnName: string = '';
  boardId: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { boardId: string },
    private apiService: ApiServiceService,
    private boardService: BoardService,
    private MatDialogRef: MatDialogRef<ColumnModalComponent>
  ) {}
  public ngOnInit(): void {
    this.boardId = this.data.boardId;
  }

  addColumn() {
    this.apiService
      .addColumn({ title: this.columnName, boardId: this.boardId })
      .subscribe(
        (data) => {
          this.boardService.search$.next()
          this.MatDialogRef.close();
        },
        (error) => {
          console.error('Erro ao adicionar board:', error);
        }
      );
  }
}
