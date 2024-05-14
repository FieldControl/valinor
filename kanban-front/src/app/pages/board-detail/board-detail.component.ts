import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ColumnService } from '../../services/column.service';
import { CardService } from '../../services/card.service';
import { IColumn } from '../../models/column';
import { IBoard } from '../../models/board';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.css'
})
export class BoardDetailComponent {
  private columnService = inject(ColumnService)
  private boardService = inject(BoardService)
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  columns: IColumn[] = [];
  boards: IBoard[] = [];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const boardId = params['id']
      this.getColumns(boardId)
      this.getBoards()
    })
  }


  getColumns(id: string) {
    this.columnService.findByBoard(id).subscribe({
      next: (data) => {
        this.columns = data;
        console.log('Colunas', this.columns)
      },
      error: (e) => {
        console.log('Erro ao obter colunas: ',e)
      }
    })
  }

  getBoards() {
    this.boardService.list().subscribe({
      next: (data) => {
        this.boards = data;
        console.log('Quadros', this.boards)
      },
      error: (e) => {
        console.log('Erro ao obter quadros: ',e)
      }
    })
  }
}
