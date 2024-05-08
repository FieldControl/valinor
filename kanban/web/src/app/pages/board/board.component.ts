import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiServiceService, Board } from 'src/app/core/api/api-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ColumnModalComponent } from './components/column-modal/column-modal.component';
import { BoardService } from './board.service';
import { firstValueFrom } from 'rxjs';
import { EditModalComponent } from './components/edit-modal/edit-modal.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  board?: Board;
  title: string = '';
  boardId: string = '';

  constructor(
    private apiService: ApiServiceService,
    private route: ActivatedRoute,
    private location: Location,
    private MatDialog: MatDialog,
    private boardService: BoardService
  ) {}

  voltarPagina() {
    this.location.back();
  }

  openEditDialog() {
    const dialogRef = this.MatDialog.open(EditModalComponent, {
      data: { boardId: this.boardId },
      width: '650px',
      height: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  openAddColumnDialog() {
    const dialogRef = this.MatDialog.open(ColumnModalComponent, {
      data: { boardId: this.boardId },
      width: '450px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }

  ngOnInit() {
    this.boardId = this.route.snapshot.params['id'];

    if (!this.boardId) {
      return;
    }

    this.boardService.search$.subscribe(async () => {
      this.board = await firstValueFrom(
        this.apiService.getBoardById(this.boardId)
      );
    });
    this.boardService.search$.next();
  }
}
