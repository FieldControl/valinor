import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ColumnService } from '../../services/column.service';
import { CardService } from '../../services/card.service';
import { IColumn } from '../../models/column';
import { IBoard } from '../../models/board';
import { BoardService } from '../../services/board.service';
import { TokenService } from '../../services/token.service';

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
  private tokenService = inject(TokenService)
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  columns: IColumn[] = [];
  boards: IBoard[] = [];

  user: any

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const boardId = params['id']
      this.getColumns(boardId)
      this.getBoards()
      this.user = this.tokenService.decodeToken()
      console.log('userrr',this.user)
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

  logout() {
    localStorage.removeItem('acess_token')

    this.router.navigate(['/'])
  }
}
